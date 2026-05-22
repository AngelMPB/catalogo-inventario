import express from 'express'
import {
  obtenerPedidos,
  obtenerPedidoPorId,
  crearPedido
} from '../controllers/pedidosController.js'

const router = express.Router()

router.get('/', obtenerPedidos)
router.get('/:id', obtenerPedidoPorId)
router.post('/', crearPedido)

export default router