import pool from '../config/dbClient.js'

export const obtenerProductos = async (req, res) => {
  const { data, error } = await pool.query(`
    SELECT p.*, c.nombre as categoria_nombre
    FROM catalog.productos p
    LEFT JOIN catalog.categorias c ON p.categoria_id = c.id
    ORDER BY p.id
  `).then(r => ({ data: r.rows, error: null })).catch(e => ({ data: null, error: e }))
  if (error) return res.status(400).json({ mensaje: error.message })
  res.json(data)
}

export const obtenerTodosProductos = async (req, res) => {
  const { rows, error } = await pool.query(`
    SELECT p.*, c.nombre as categoria_nombre,
      json_build_object('nombre', c.nombre) as categorias
    FROM catalog.productos p
    LEFT JOIN catalog.categorias c ON p.categoria_id = c.id
    ORDER BY p.id
  `).catch(e => ({ rows: null, error: e }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener productos' })
  res.json(rows)
}

export const crearProducto = async (req, res) => {
  const { nombre, descripcion, precio, imagen_url, categoria_id } = req.body
  if (!nombre || !precio) return res.status(400).json({ mensaje: 'Nombre y precio son obligatorios' })

  const { rows, error } = await pool.query(`
    INSERT INTO catalog.productos (nombre, descripcion, precio, imagen_url, categoria_id)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [nombre, descripcion, precio, imagen_url, categoria_id || null])
    .catch(e => ({ rows: null, error: e }))

  if (!rows) return res.status(400).json({ mensaje: 'Error al crear producto' })

  await pool.query(`
    INSERT INTO catalog.inventario (producto_id, stock_actual, stock_minimo)
    VALUES ($1, 0, 5)
  `, [rows[0].id]).catch(() => {})

  res.status(201).json(rows[0])
}

export const actualizarProducto = async (req, res) => {
  const { id } = req.params
  const { nombre, descripcion, precio, imagen_url, categoria_id } = req.body

  const { rows } = await pool.query(`
    UPDATE catalog.productos
    SET nombre=$1, descripcion=$2, precio=$3, imagen_url=$4, categoria_id=$5
    WHERE id=$6 RETURNING *
  `, [nombre, descripcion, precio, imagen_url, categoria_id || null, id])
    .catch(() => ({ rows: null }))

  if (!rows) return res.status(400).json({ mensaje: 'Error al actualizar' })
  res.json(rows[0])
}

export const toggleHabilitado = async (req, res) => {
  const { id } = req.params
  const { rows } = await pool.query(`
    UPDATE catalog.productos SET habilitado = NOT habilitado WHERE id=$1 RETURNING *
  `, [id]).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al cambiar estado' })
  res.json(rows[0])
}

export const eliminarProducto = async (req, res) => {
  const id = req.params.id
  await pool.query(`DELETE FROM catalog.inventario WHERE producto_id=$1`, [id]).catch(() => {})
  await pool.query(`DELETE FROM catalog.detalle_pedido WHERE producto_id=$1`, [id]).catch(() => {})
  await pool.query(`DELETE FROM catalog.productos WHERE id=$1`, [id]).catch(() => {})
  res.json({ mensaje: 'Producto eliminado' })
}
``