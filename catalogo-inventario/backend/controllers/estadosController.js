import supabase from '../config/supabaseClient.js'

const ESTADOS_VALIDOS = ['Pendiente', 'Preparación', 'En camino', 'Entregado', 'Cancelado']

const FLUJO_VALIDO = {
  'Pendiente':    ['Preparación', 'Cancelado'],
  'Preparación':  ['En camino', 'Cancelado'],
  'En camino':    ['Entregado', 'Cancelado'],
  'Entregado':    [],
  'Cancelado':    []
}

export const obtenerEstados = async (req, res) => {
  res.json(ESTADOS_VALIDOS)
}

export const cambiarEstado = async (req, res) => {
  const { id } = req.params
  const { estado_nuevo, usuario, comentario } = req.body

  if (!estado_nuevo) return res.status(400).json({ mensaje: 'El estado es obligatorio' })
  if (!ESTADOS_VALIDOS.includes(estado_nuevo)) return res.status(400).json({ mensaje: 'Estado no válido' })

  const { data: guia, error: errorGuia } = await supabase
    .from('guias_envio')
    .select('estado, numero_guia, nombre_destinatario')
    .eq('id', id)
    .single()

  if (errorGuia) return res.status(404).json({ mensaje: 'Guía no encontrada' })

  const estadoActual = guia.estado || 'Pendiente'
  const siguientesPermitidos = FLUJO_VALIDO[estadoActual]

  if (!siguientesPermitidos.includes(estado_nuevo)) {
    return res.status(400).json({
      mensaje: `No se puede cambiar de "${estadoActual}" a "${estado_nuevo}"`,
      permitidos: siguientesPermitidos
    })
  }

  const { data, error } = await supabase
    .from('guias_envio')
    .update({ estado: estado_nuevo })
    .eq('id', id)
    .select()

  if (error) return res.status(400).json(error)

  await supabase.from('historial_estados').insert([{
    guia_id: parseInt(id),
    estado_anterior: estadoActual,
    estado_nuevo,
    usuario: usuario || 'Admin',
    comentario: comentario || null
  }])

  await supabase.from('logs_eventos').insert([{
    usuario: usuario || 'Admin',
    accion: 'CAMBIO_ESTADO',
    modulo: 'guias_envio',
    detalle: `Guía ${guia.numero_guia}: ${estadoActual} → ${estado_nuevo}`,
    severidad: 'info'
  }])

  res.json(data[0])
}

export const obtenerHistorial = async (req, res) => {
  const { data, error } = await supabase
    .from('historial_estados')
    .select('*')
    .eq('guia_id', req.params.id)
    .order('created_at', { ascending: true })

  if (error) return res.status(400).json(error)
  res.json(data)
}

export const trackingPublico = async (req, res) => {
  const { numero_guia } = req.params

  const { data: guia, error } = await supabase
    .from('guias_envio')
    .select('*, pedidos(numero_pedido, nombre_cliente)')
    .eq('numero_guia', numero_guia)
    .single()

  if (error) return res.status(404).json({ mensaje: 'Guía no encontrada' })

  const { data: historial } = await supabase
    .from('historial_estados')
    .select('*')
    .eq('guia_id', guia.id)
    .order('created_at', { ascending: true })

  res.json({ guia, historial: historial || [] })
}