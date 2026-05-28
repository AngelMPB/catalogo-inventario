import express from 'express'
import {
  obtenerInventario,
  actualizarStock,
  ajusteManual,
  obtenerHistorialAjustes,
  actualizarStockAutomatico
} from '../controllers/inventarioController.js'

const router = express.Router()

router.get('/', obtenerInventario)
router.put('/:id', actualizarStock)
router.post('/ajuste', ajusteManual)
router.get('/ajustes', obtenerHistorialAjustes)
router.patch('/stock-automatico', actualizarStockAutomatico)

export default router