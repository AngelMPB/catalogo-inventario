import supabase from '../config/supabaseClient.js'

export const obtenerGuias = async (req, res) => {
  const { data, error } = await supabase
    .from('guias_envio')
    .select('*, pedidos(numero_pedido, nombre_cliente)')
    .order('fecha_generacion', { ascending: false })

  if (error) return res.status(400).json(error)
  res.json(data)
}

export const crearGuia = async (req, res) => {
  const { pedido_id, nombre_destinatario, direccion, telefono } = req.body

  if (!pedido_id || !nombre_destinatario || !direccion) {
    return res.status(400).json({ mensaje: 'Pedido, destinatario y dirección son obligatorios' })
  }

  const numero_guia = "GUIA-" + Date.now()

  const { data, error } = await supabase
    .from('guias_envio')
    .insert([{ numero_guia, pedido_id, nombre_destinatario, direccion, telefono }])
    .select()

  if (error) return res.status(400).json(error)
  res.status(201).json(data[0])
}