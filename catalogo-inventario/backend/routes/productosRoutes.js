import express from 'express'
import {
  obtenerProductos,
  obtenerProductoPorId,
  obtenerTodosProductos,
  crearProducto,
  editarProducto,
  toggleHabilitado,
  eliminarProducto
} from '../controllers/productosController.js'

const router = express.Router()

router.get('/todos', obtenerTodosProductos)  // ← esta debe ir ANTES de /:id
router.get('/', obtenerProductos)
router.get('/:id', obtenerProductoPorId)
router.post('/', crearProducto)
router.put('/:id', editarProducto)
router.patch('/:id/toggle', toggleHabilitado)
router.delete('/:id', eliminarProducto)

export default router