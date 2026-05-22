import express from 'express'
import {
  obtenerCategorias,
  crearCategoria,
  editarCategoria,
  eliminarCategoria
} from '../controllers/categoriasController.js'

const router = express.Router()

router.get('/', obtenerCategorias)
router.post('/', crearCategoria)
router.put('/:id', editarCategoria)
router.delete('/:id', eliminarCategoria)

export default router