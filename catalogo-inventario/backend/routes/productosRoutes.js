import express from 'express'
import {
  obtenerProductos,
  obtenerTodosProductos,
  crearProducto,
  actualizarProducto,
  toggleHabilitado,
  eliminarProducto
} from '../controllers/productosController.js'

const router = express.Router()

router.get('/todos', obtenerTodosProductos)
router.get('/', obtenerProductos)
router.post('/', crearProducto)
router.put('/:id', actualizarProducto)
router.patch('/:id/toggle', toggleHabilitado)
router.delete('/:id', eliminarProducto)

export default router