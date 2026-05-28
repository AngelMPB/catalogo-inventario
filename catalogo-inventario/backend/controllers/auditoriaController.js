import pool from '../config/dbClient.js'

export const obtenerLogs = async (req, res) => {
  const { modulo, severidad, accion, usuario } = req.query
  let query = `SELECT * FROM catalog.logs_eventos WHERE 1=1`
  const params = []

  if (modulo)    { params.push(modulo);    query += ` AND modulo=$${params.length}` }
  if (severidad) { params.push(severidad); query += ` AND severidad=$${params.length}` }
  if (accion)    { params.push(accion);    query += ` AND accion=$${params.length}` }
  if (usuario)   { params.push(`%${usuario}%`); query += ` AND usuario ILIKE $${params.length}` }

  query += ` ORDER BY created_at DESC`

  const { rows } = await pool.query(query, params).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener logs' })
  res.json(rows)
}

export const obtenerLogsNotificaciones = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT n.*, json_build_object('numero_guia', g.numero_guia, 'nombre_destinatario', g.nombre_destinatario) as guias_envio
    FROM catalog.logs_notificaciones n
    LEFT JOIN catalog.guias_envio g ON n.guia_id = g.id
    ORDER BY n.created_at DESC
  `).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener notificaciones' })
  res.json(rows)
}

export const registrarEvento = async (req, res) => {
  const { usuario, accion, modulo, detalle, severidad } = req.body
  if (!accion) return res.status(400).json({ mensaje: 'La acción es obligatoria' })

  const { rows } = await pool.query(`
    INSERT INTO catalog.logs_eventos (usuario, accion, modulo, detalle, severidad)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [usuario, accion, modulo, detalle, severidad || 'info']).catch(() => ({ rows: null }))

  if (!rows) return res.status(400).json({ mensaje: 'Error al registrar evento' })
  res.status(201).json(rows[0])
}