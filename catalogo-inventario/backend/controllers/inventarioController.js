import supabase from '../config/supabaseClient.js'

export const obtenerInventario = async (req, res) => {
  const { data, error } = await supabase
    .from('inventario')
    .select('*, productos(nombre)')

  if (error) return res.status(400).json(error)
  res.json(data)
}

export const obtenerAlertas = async (req, res) => {
  const { data, error } = await supabase
    .from('inventario')
    .select('*, productos(nombre)')

  if (error) return res.status(400).json(error)
  res.json(data.filter(i => i.stock_actual <= i.stock_minimo))
}

export const actualizarInventario = async (req, res) => {
  const { stock_actual, stock_minimo, motivo } = req.body
  const id = req.params.id

  if (stock_actual < 0) return res.status(400).json({ mensaje: 'El stock no puede ser negativo' })
  if (stock_minimo < 0) return res.status(400).json({ mensaje: 'El stock mínimo no puede ser negativo' })

  const { data: anterior } = await supabase
    .from('inventario')
    .select('stock_actual, productos(nombre)')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('inventario')
    .update({ stock_actual, stock_minimo })
    .eq('id', id)
    .select()

  if (error) return res.status(400).json(error)

  await supabase.from('logs_eventos').insert([{
    usuario: 'Admin',
    accion: 'AJUSTE_INVENTARIO',
    modulo: 'inventario',
    detalle: `Producto: ${anterior?.productos?.nombre} | Stock anterior: ${anterior?.stock_actual} → Nuevo: ${stock_actual} | Motivo: ${motivo || 'Sin motivo'}`,
    severidad: 'info'
  }])

  res.json(data[0])
}