import supabase from '../config/supabaseClient.js'

export const obtenerLogs = async (req, res) => {
  const { modulo, severidad } = req.query

  let query = supabase
    .from('logs_eventos')
    .select('*')
    .order('created_at', { ascending: false })

  if (modulo) query = query.eq('modulo', modulo)
  if (severidad) query = query.eq('severidad', severidad)

  const { data, error } = await query
  if (error) return res.status(400).json(error)
  res.json(data)
}

export const obtenerLogsNotificaciones = async (req, res) => {
  const { data, error } = await supabase
    .from('logs_notificaciones')
    .select('*, guias_envio(numero_guia)')
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json(error)
  res.json(data)
}

export const registrarEvento = async (req, res) => {
  const { usuario, accion, modulo, detalle, severidad } = req.body

  if (!accion) return res.status(400).json({ mensaje: 'La acción es obligatoria' })

  const { data, error } = await supabase
    .from('logs_eventos')
    .insert([{ usuario, accion, modulo, detalle, severidad: severidad || 'info' }])
    .select()

  if (error) return res.status(400).json(error)
  res.status(201).json(data[0])
}