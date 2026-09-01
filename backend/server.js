require('dotenv').config()
const dns = require('node:dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-travel'
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  const startedAt = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - startedAt
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
  })
  next()
})

app.get('/', (req, res) => {
  res.json({
    name: 'AI Travel API',
    status: 'running',
    version: '1.0.0',
    docs: '/health',
    message: 'API sẵn sàng phục vụ ứng dụng AI Travel.'
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-travel-backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})

const aiRouter = require('./routes/ai')
const placesRouter = require('./routes/places')
const authRouter = require('./routes/auth')
const socialRouter = require('./routes/social')
const weatherRouter = require('./routes/weather')
app.use('/api/ai', aiRouter)
app.use('/api/places', placesRouter)
app.use('/api/auth', authRouter)
app.use('/api/social', socialRouter)
app.use('/api/weather', weatherRouter)

app.use((req, res) => {
  res.status(404).json({ error: `Không tìm thấy endpoint ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Lỗi máy chủ nội bộ'
  })
})

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')
  } catch (err) {
    console.warn(`MongoDB unavailable: ${err.message}`)
  }

  app.listen(PORT, () => {
    console.log(`AI Travel API listening on http://localhost:${PORT}`)
  })
}

startServer()
