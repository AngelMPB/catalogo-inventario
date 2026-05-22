import supabase from '../config/supabaseClient.js'

export const obtenerPedidos = async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json(error)
  res.json(data)
}

export const obtenerPedidoPorId = async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, detalle_pedido(*, productos(nombre, precio))')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ mensaje: 'Pedido no encontrado' })
  res.json(data)
}

export const crearPedido = async (req, res) => {
  const { nombre_cliente, notas, total, items } = req.body

  if (!nombre_cliente) return res.status(400).json({ mensaje: 'El nombre del cliente es obligatorio' })
  if (!items || !items.length) return res.status(400).json({ mensaje: 'El pedido debe tener al menos un producto' })

  // Verificar stock de cada producto
  for (const item of items) {
    const { data: inv } = await supabase
      .from('inventario')
      .select('stock_actual')
      .eq('producto_id', item.producto_id)
      .single()

    if (!inv || inv.stock_actual < item.cantidad) {
      return res.status(400).json({ mensaje: `Stock insuficiente para el producto ID ${item.producto_id}` })
    }
  }

  const numero_pedido = "PED-" + Date.now()

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert([{ numero_pedido, nombre_cliente, notas, total }])
    .select()

  if (error) return res.status(400).json(error)

  // Insertar detalle
  const detalles = items.map(i => ({
    pedido_id: pedido[0].id,
    producto_id: parseInt(i.producto_id),
    cantidad: i.cantidad,
    precio_unitario: i.precio_unitario || 0
  }))

  const { error: errorDetalle } = await supabase
    .from('detalle_pedido')
    .insert(detalles)

  if (errorDetalle) return res.status(400).json(errorDetalle)

  // Descontar stock
  for (const item of items) {
    const { data: inv } = await supabase
      .from('inventario')
      .select('stock_actual')
      .eq('producto_id', item.producto_id)
      .single()

    await supabase
      .from('inventario')
      .update({ stock_actual: inv.stock_actual - item.cantidad })
      .eq('producto_id', item.producto_id)
  }

  res.status(201).json(pedido[0])
}