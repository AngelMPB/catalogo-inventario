import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import productosRoutes from './routes/productosRoutes.js'
import categoriasRoutes from './routes/categoriasRoutes.js'
import inventarioRoutes from './routes/inventarioRoutes.js'
import pedidosRoutes from './routes/pedidosRoutes.js'
import guiasRoutes from './routes/guiasRoutes.js'
import estadosRoutes from './routes/estadosRoutes.js'
import auditoriaRoutes from './routes/auditoriaRoutes.js'

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Sirve el frontend estático (necesario para Cloud Run)
app.use(express.static(join(__dirname, '../frontend')))

app.get('/api', (req, res) => res.send('ANGEL PROYECTO OK 🔥'))

app.use('/productos', productosRoutes)
app.use('/categorias', categoriasRoutes)
app.use('/inventario', inventarioRoutes)
app.use('/pedidos', pedidosRoutes)
app.use('/guias', guiasRoutes)
app.use('/guias', estadosRoutes)
app.use('/auditoria', auditoriaRoutes)

// Puerto dinámico para Cloud Run
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`))