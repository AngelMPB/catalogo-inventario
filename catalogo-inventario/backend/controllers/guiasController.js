import pool from '../config/dbClient.js'

export const obtenerGuias = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT g.*, json_build_object('numero_pedido', p.numero_pedido, 'nombre_cliente', p.nombre_cliente) as pedidos
    FROM catalog.guias_envio g
    LEFT JOIN catalog.pedidos p ON g.pedido_id = p.id
    ORDER BY g.fecha_generacion DESC
  `).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener guías' })
  res.json(rows)
}

export const crearGuia = async (req, res) => {
  const { pedido_id, nombre_destinatario, direccion, telefono } = req.body
  if (!pedido_id || !nombre_destinatario || !direccion)
    return res.status(400).json({ mensaje: 'pedido_id, nombre_destinatario y direccion son obligatorios' })

  const numero_guia = `GUIA-${Date.now()}`

  const { rows } = await pool.query(`
    INSERT INTO catalog.guias_envio (numero_guia, pedido_id, nombre_destinatario, direccion, telefono)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [numero_guia, pedido_id, nombre_destinatario, direccion, telefono]).catch(() => ({ rows: null }))

  if (!rows) return res.status(400).json({ mensaje: 'Error al crear guía' })
  res.status(201).json(rows[0])
}