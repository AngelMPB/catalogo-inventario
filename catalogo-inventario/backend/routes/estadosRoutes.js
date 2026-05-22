import express from 'express'
import {
  obtenerEstados,
  cambiarEstado,
  obtenerHistorial,
  trackingPublico
} from '../controllers/estadosController.js'

const router = express.Router()

router.get('/estados', obtenerEstados)
router.patch('/:id/estado', cambiarEstado)
router.get('/:id/historial', obtenerHistorial)
router.get('/tracking/:numero_guia', trackingPublico)

export default router