import express from 'express'
import {
  obtenerGuias,
  crearGuia
} from '../controllers/guiasController.js'

const router = express.Router()

router.get('/', obtenerGuias)
router.post('/', crearGuia)

export default router