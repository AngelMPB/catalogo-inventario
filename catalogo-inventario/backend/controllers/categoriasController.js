import supabase from '../config/supabaseClient.js'

export const obtenerCategorias = async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')

  if (error) return res.status(400).json(error)
  res.json(data)
}

export const crearCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body

  if (!nombre) return res.status(400).json({ mensaje: 'El nombre es obligatorio' })

  const { data, error } = await supabase
    .from('categorias')
    .insert([{ nombre, descripcion }])
    .select()

  if (error) return res.status(400).json(error)
  res.status(201).json(data[0])
}

export const editarCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body

  const { data, error } = await supabase
    .from('categorias')
    .update({ nombre, descripcion })
    .eq('id', req.params.id)
    .select()

  if (error) return res.status(400).json(error)
  res.json(data[0])
}

export const eliminarCategoria = async (req, res) => {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(400).json(error)
  res.json({ mensaje: 'Categoría eliminada' })
}