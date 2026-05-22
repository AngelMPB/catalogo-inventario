import supabase from '../config/supabaseClient.js'

export const obtenerProductos = async (req, res) => {
  const { categoria_id, habilitado } = req.query

  let query = supabase.from('productos').select('*, categorias(nombre)')

  if (categoria_id) query = query.eq('categoria_id', categoria_id)
  if (habilitado !== undefined) query = query.eq('habilitado', habilitado === 'true')

  const { data, error } = await query
  if (error) return res.status(400).json(error)
  res.json(data)
}

export const obtenerTodosProductos = async (req, res) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre)')

  if (error) return res.status(400).json(error)
  res.json(data)
}

export const obtenerProductoPorId = async (req, res) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ mensaje: 'Producto no encontrado' })
  res.json(data)
}

export const crearProducto = async (req, res) => {
  const { nombre, descripcion, precio, imagen_url, categoria_id } = req.body

  if (!nombre || !precio) {
    return res.status(400).json({ mensaje: 'Nombre y precio son obligatorios' })
  }

  const { data, error } = await supabase
    .from('productos')
    .insert([{ nombre, descripcion, precio, imagen_url, categoria_id, habilitado: true }])
    .select()

  if (error) return res.status(400).json(error)

  await supabase
    .from('inventario')
    .insert([{ producto_id: data[0].id, stock_actual: 0, stock_minimo: 5 }])

  res.status(201).json(data[0])
}

export const editarProducto = async (req, res) => {
  const { nombre, descripcion, precio, imagen_url, categoria_id } = req.body

  if (!nombre || !precio) {
    return res.status(400).json({ mensaje: 'Nombre y precio son obligatorios' })
  }

  const { data, error } = await supabase
    .from('productos')
    .update({ nombre, descripcion, precio, imagen_url, categoria_id })
    .eq('id', req.params.id)
    .select()

  if (error) return res.status(400).json(error)
  res.json(data[0])
}

export const toggleHabilitado = async (req, res) => {
  const { data: producto, error: errorGet } = await supabase
    .from('productos')
    .select('habilitado')
    .eq('id', req.params.id)
    .single()

  if (errorGet) return res.status(404).json({ mensaje: 'Producto no encontrado' })

  const { data, error } = await supabase
    .from('productos')
    .update({ habilitado: !producto.habilitado })
    .eq('id', req.params.id)
    .select()

  if (error) return res.status(400).json(error)
  res.json(data[0])
}

export const eliminarProducto = async (req, res) => {
  const id = req.params.id

  await supabase.from('detalle_pedido').delete().eq('producto_id', id)
  await supabase.from('inventario').delete().eq('producto_id', id)

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)

  if (error) {
    console.log('ERROR SUPABASE:', JSON.stringify(error))
    return res.status(400).json(error)
  }
  res.json({ mensaje: 'Producto eliminado' })
}