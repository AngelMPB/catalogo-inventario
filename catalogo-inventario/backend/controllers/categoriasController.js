import pool from '../config/dbClient.js'

export const obtenerCategorias = async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM catalog.categorias ORDER BY id`)
    .catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al obtener categorías' })
  res.json(rows)
}

export const crearCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body
  if (!nombre) return res.status(400).json({ mensaje: 'El nombre es obligatorio' })
  const { rows } = await pool.query(`
    INSERT INTO catalog.categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *
  `, [nombre, descripcion]).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al crear categoría' })
  res.status(201).json(rows[0])
}

export const actualizarCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body
  const { rows } = await pool.query(`
    UPDATE catalog.categorias SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *
  `, [nombre, descripcion, req.params.id]).catch(() => ({ rows: null }))
  if (!rows) return res.status(400).json({ mensaje: 'Error al actualizar' })
  res.json(rows[0])
}

export const eliminarCategoria = async (req, res) => {
  await pool.query(`DELETE FROM catalog.categorias WHERE id=$1`, [req.params.id])
    .catch(() => {})
  res.json({ mensaje: 'Categoría eliminada' })
}