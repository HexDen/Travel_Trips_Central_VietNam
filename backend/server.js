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

const { autoInitPlaces } = require('./services/aiCrawlerService')
const { runCrawlPlacesWithImages } = require('./scripts/crawlPlacesWithImages')
const { enrichAllDatabaseWithRealPhotos } = require('./scripts/enrichAllRealPhotos')

/**
 * Đường ống dữ liệu tự động (Autonomous Pipeline) chạy ngầm khi khởi động server:
 * 1. Cào nạp & đồng bộ các danh thắng chuẩn bách khoa từ Wikipedia
 * 2. Tự động kiểm tra và cào thêm các điểm đến địa phương bằng AI
 * 3. Quét toàn bộ CSDL và nâng cấp ảnh thật HD 100%
 */
async function runAutonomousDataPipeline() {
  try {
    console.log('\n===============================================================')
    console.log('🔄 [Autonomous Pipeline] BẮT ĐẦU TỰ ĐỘNG CHẠY HỆ THỐNG DỮ LIỆU...')
    console.log('===============================================================')
    
    // Bước 1: Nạp & cập nhật các danh lam thắng cảnh chính thống từ Wikipedia
    await runCrawlPlacesWithImages()

    // Bước 2: Kiểm tra số lượng & cào AI các điểm địa phương nếu chưa đủ
    await autoInitPlaces()

    // Bước 3: Nâng cấp đồng bộ ảnh thật 100% cho các quán ăn, cafe, khách sạn, di tích
    await enrichAllDatabaseWithRealPhotos()

    console.log('✅ [Autonomous Pipeline] TẤT CẢ DỮ LIỆU & ẢNH THẬT ĐÃ HOÀN TẤT ĐỒNG BỘ!\n')
  } catch (err) {
    console.warn(`⚠️ [Autonomous Pipeline] Cảnh báo trong quá trình chạy tự động: ${err.message}`)
  }
}

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected')
    
    // Kích hoạt toàn bộ chu trình cào & làm giàu ảnh thật ngầm (không chặn cổng server)
    // runAutonomousDataPipeline()
  } catch (err) {
    console.warn(`MongoDB unavailable: ${err.message}`)
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Travel API listening on http://localhost:${PORT}`)
  })
}

startServer()
