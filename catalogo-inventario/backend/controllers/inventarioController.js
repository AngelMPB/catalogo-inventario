import pool from '../config/dbClient.js'

export const obtenerInventario = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT i.*, json_build_object('nombre', p.nombre, 'precio', p.precio) as productos
    FROM catalog.inventario i
    JOIN catalog.productos p ON i.producto_id = p.id
    ORDER BY i.id
  `).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener inventario' })
  res.json(rows)
}

export const actualizarStock = async (req, res) => {
  const { stock_actual, stock_minimo } = req.body
  const { rows } = await pool.query(`
    UPDATE catalog.inventario SET stock_actual=$1, stock_minimo=$2 WHERE id=$3 RETURNING *
  `, [stock_actual, stock_minimo, req.params.id]).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al actualizar stock' })
  res.json(rows[0])
}

export const actualizarStockAutomatico = async (req, res) => {
  const { producto_id, cantidad, guia_id } = req.body
  if (!producto_id || !cantidad) return res.status(400).json({ mensaje: 'producto_id y cantidad son obligatorios' })

  const { rows: inv } = await pool.query(`
    SELECT i.stock_actual, p.nombre FROM catalog.inventario i
    JOIN catalog.productos p ON i.producto_id = p.id
    WHERE i.producto_id=$1
  `, [producto_id]).catch(() => ({ rows: null }))

  if (!inv || !inv[0]) return res.status(404).json({ mensaje: 'Producto no encontrado en inventario' })
  if (inv[0].stock_actual < cantidad) return res.status(400).json({ mensaje: 'Stock insuficiente' })

  const stock_nuevo = inv[0].stock_actual - cantidad
  const { rows } = await pool.query(`
    UPDATE catalog.inventario SET stock_actual=$1 WHERE producto_id=$2 RETURNING *
  `, [stock_nuevo, producto_id]).catch(() => ({ rows: null }))

  await pool.query(`
    INSERT INTO catalog.logs_eventos (usuario, accion, modulo, detalle, severidad)
    VALUES ('Sistema', 'STOCK_AUTOMATICO', 'inventario', $1, 'info')
  `, [`${inv[0].nombre}: -${cantidad} unidades por guía ${guia_id || '—'}`]).catch(() => {})

  res.json(rows[0])
}

export const ajusteManual = async (req, res) => {
  const { producto_id, tipo_movimiento, cantidad, motivo, usuario } = req.body
  const TIPOS = ['entrada', 'salida', 'merma', 'devolucion']

  if (!producto_id) return res.status(400).json({ mensaje: 'producto_id es obligatorio' })
  if (!tipo_movimiento || !TIPOS.includes(tipo_movimiento)) return res.status(400).json({ mensaje: `tipo_movimiento debe ser: ${TIPOS.join(', ')}` })
  if (!cantidad || cantidad <= 0) return res.status(400).json({ mensaje: 'cantidad debe ser mayor a 0' })
  if (!motivo || motivo.trim() === '') return res.status(400).json({ mensaje: 'El motivo es obligatorio' })

  const { rows: inv } = await pool.query(`
    SELECT i.stock_actual, p.nombre FROM catalog.inventario i
    JOIN catalog.productos p ON i.producto_id = p.id
    WHERE i.producto_id=$1
  `, [producto_id]).catch(() => ({ rows: null }))

  if (!inv || !inv[0]) return res.status(404).json({ mensaje: 'Producto no encontrado' })

  const stock_anterior = inv[0].stock_actual
  let stock_nuevo = tipo_movimiento === 'entrada' ? stock_anterior + cantidad : stock_anterior - cantidad

  if (stock_nuevo < 0) return res.status(400).json({ mensaje: 'Stock insuficiente para este ajuste' })

  const { rows } = await pool.query(`
    UPDATE catalog.inventario SET stock_actual=$1 WHERE producto_id=$2 RETURNING *
  `, [stock_nuevo, producto_id]).catch(() => ({ rows: null }))

  await pool.query(`
    INSERT INTO catalog.historial_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, usuario)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo.trim(), usuario || 'Admin']).catch(() => {})

  await pool.query(`
    INSERT INTO catalog.logs_eventos (usuario, accion, modulo, detalle, severidad)
    VALUES ($1, 'AJUSTE_INVENTARIO', 'inventario', $2, 'info')
  `, [usuario || 'Admin', `${inv[0].nombre} — ${tipo_movimiento}: ${stock_anterior} → ${stock_nuevo} | ${motivo}`]).catch(() => {})

  res.status(201).json({ ...rows[0], stock_anterior, stock_nuevo })
}

export const obtenerHistorialAjustes = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT h.*, json_build_object('nombre', p.nombre) as productos
    FROM catalog.historial_inventario h
    JOIN catalog.productos p ON h.producto_id = p.id
    ORDER BY h.created_at DESC
  `).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener historial' })
  res.json(rows)
}