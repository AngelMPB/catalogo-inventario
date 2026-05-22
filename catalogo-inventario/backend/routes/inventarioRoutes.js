import express from 'express'
import {
  obtenerInventario,
  obtenerAlertas,
  actualizarInventario
} from '../controllers/inventarioController.js'

const router = express.Router()

router.get('/', obtenerInventario)
router.get('/alertas', obtenerAlertas)
router.put('/:id', actualizarInventario)

export default router