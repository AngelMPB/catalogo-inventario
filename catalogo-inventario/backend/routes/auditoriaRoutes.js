import express from 'express'
import {
  obtenerLogs,
  obtenerLogsNotificaciones,
  registrarEvento
} from '../controllers/auditoriaController.js'

const router = express.Router()

router.get('/eventos', obtenerLogs)
router.get('/notificaciones', obtenerLogsNotificaciones)
router.post('/eventos', registrarEvento)

export default router