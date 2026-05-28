import pool from '../config/dbClient.js'

const ESTADOS_VALIDOS = ['Pendiente', 'Preparación', 'En camino', 'Entregado', 'Cancelado']
const FLUJO_VALIDO = {
  'Pendiente':   ['Preparación', 'Cancelado'],
  'Preparación': ['En camino', 'Cancelado'],
  'En camino':   ['Entregado', 'Cancelado'],
  'Entregado':   [],
  'Cancelado':   []
}

export const obtenerEstados = async (req, res) => res.json(ESTADOS_VALIDOS)

export const cambiarEstado = async (req, res) => {
  const { id } = req.params
  const { estado_nuevo, usuario, comentario } = req.body

  if (!estado_nuevo) return res.status(400).json({ mensaje: 'El estado es obligatorio' })
  if (!ESTADOS_VALIDOS.includes(estado_nuevo)) return res.status(400).json({ mensaje: 'Estado no válido' })

  const { rows: guias } = await pool.query(`
    SELECT g.*, p.correo_cliente FROM catalog.guias_envio g
    LEFT JOIN catalog.pedidos p ON g.pedido_id = p.id
    WHERE g.id=$1
  `, [id]).catch(() => ({ rows: null }))

  if (!guias || !guias[0]) return res.status(404).json({ mensaje: 'Guía no encontrada' })
  const guia = guias[0]
  const estadoActual = guia.estado || 'Pendiente'

  if (!FLUJO_VALIDO[estadoActual].includes(estado_nuevo)) {
    return res.status(400).json({
      mensaje: `No se puede cambiar de "${estadoActual}" a "${estado_nuevo}"`,
      permitidos: FLUJO_VALIDO[estadoActual]
    })
  }

  const { rows } = await pool.query(`
    UPDATE catalog.guias_envio SET estado=$1 WHERE id=$2 RETURNING *
  `, [estado_nuevo, id]).catch(() => ({ rows: null }))

  await pool.query(`
    INSERT INTO catalog.historial_estados (guia_id, estado_anterior, estado_nuevo, usuario, comentario)
    VALUES ($1, $2, $3, $4, $5)
  `, [id, estadoActual, estado_nuevo, usuario || 'Admin', comentario || null]).catch(() => {})

  await pool.query(`
    INSERT INTO catalog.logs_eventos (usuario, accion, modulo, detalle, severidad)
    VALUES ($1, 'CAMBIO_ESTADO', 'guias_envio', $2, 'info')
  `, [usuario || 'Admin', `Guía ${guia.numero_guia}: ${estadoActual} → ${estado_nuevo}`]).catch(() => {})

  res.json(rows[0])
}

export const obtenerHistorial = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT * FROM catalog.historial_estados WHERE guia_id=$1 ORDER BY created_at ASC
  `, [req.params.id]).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener historial' })
  res.json(rows)
}

export const trackingPublico = async (req, res) => {
  const { rows: guias } = await pool.query(`
    SELECT g.*, json_build_object('numero_pedido', p.numero_pedido, 'nombre_cliente', p.nombre_cliente) as pedidos
    FROM catalog.guias_envio g
    LEFT JOIN catalog.pedidos p ON g.pedido_id = p.id
    WHERE g.numero_guia=$1
  `, [req.params.numero_guia]).catch(() => ({ rows: null }))

  if (!guias || !guias[0]) return res.status(404).json({ mensaje: 'Guía no encontrada' })

  const { rows: historial } = await pool.query(`
    SELECT * FROM catalog.historial_estados WHERE guia_id=$1 ORDER BY created_at ASC
  `, [guias[0].id]).catch(() => ({ rows: [] }))

  res.json({ guia: guias[0], historial: historial || [] })
}