import pool from '../config/dbClient.js'

export const obtenerPedidos = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT * FROM catalog.pedidos ORDER BY created_at DESC
  `).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener pedidos' })
  res.json(rows)
}

export const obtenerPedidoPorId = async (req, res) => {
  const { rows: pedidos } = await pool.query(`
    SELECT * FROM catalog.pedidos WHERE id=$1
  `, [req.params.id]).catch(() => ({ rows: null }))

  if (!pedidos || !pedidos[0]) return res.status(404).json({ mensaje: 'Pedido no encontrado' })

  const { rows: detalle } = await pool.query(`
    SELECT d.*, json_build_object('nombre', p.nombre, 'precio', p.precio) as productos
    FROM catalog.detalle_pedido d
    JOIN catalog.productos p ON d.producto_id = p.id
    WHERE d.pedido_id=$1
  `, [req.params.id]).catch(() => ({ rows: [] }))

  res.json({ ...pedidos[0], detalle_pedido: detalle })
}

export const crearPedido = async (req, res) => {
  const { nombre_cliente, correo_cliente, notas, total, items } = req.body

  if (!nombre_cliente) return res.status(400).json({ mensaje: 'El nombre del cliente es obligatorio' })
  if (!items || !items.length) return res.status(400).json({ mensaje: 'El pedido debe tener al menos un producto' })

  const numero_pedido = 'PED-' + Date.now()

  const { rows: pedido } = await pool.query(`
    INSERT INTO catalog.pedidos (numero_pedido, nombre_cliente, correo_cliente, notas, total)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [numero_pedido, nombre_cliente, correo_cliente || null, notas, total]).catch(() => ({ rows: null }))

  if (!pedido) return res.status(400).json({ mensaje: 'Error al crear pedido' })

  for (const item of items) {
    await pool.query(`
      INSERT INTO catalog.detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
      VALUES ($1, $2, $3, $4)
    `, [pedido[0].id, parseInt(item.producto_id), item.cantidad, item.precio_unitario || 0]).catch(() => {})

    const { rows: inv } = await pool.query(`
      SELECT stock_actual FROM catalog.inventario WHERE producto_id=$1
    `, [item.producto_id]).catch(() => ({ rows: null }))

    if (inv && inv[0]) {
      await pool.query(`
        UPDATE catalog.inventario SET stock_actual=$1 WHERE producto_id=$2
      `, [Math.max(0, inv[0].stock_actual - item.cantidad), item.producto_id]).catch(() => {})
    }
  }

  res.status(201).json(pedido[0])
}