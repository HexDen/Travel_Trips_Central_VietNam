const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const dns = require('node:dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}

const mongoose = require('mongoose')
const { crawlPlacesByAI, CENTRAL_VIETNAM_DESTINATIONS } = require('../services/aiCrawlerService')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-travel'

async function runManualCrawl() {
  console.log('🚀 [AI Crawler CLI] Đang kết nối tới MongoDB Atlas...')
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ [AI Crawler CLI] Kết nối MongoDB Atlas thành công!\n')

    console.log('🤖 Bắt đầu thu thập dữ liệu bằng AI cho các tỉnh thành Miền Trung:')
    console.log(CENTRAL_VIETNAM_DESTINATIONS.join(', '))
    console.log('------------------------------------------------------------')

    for (const destination of CENTRAL_VIETNAM_DESTINATIONS) {
      await crawlPlacesByAI(destination)
    }

    console.log('\n🎉 [AI Crawler CLI] HOÀN TẤT! Toàn bộ dữ liệu đã được lưu vào MongoDB Atlas.')
    process.exit(0)
  } catch (err) {
    console.error('❌ [AI Crawler CLI] Lỗi:', err.message)
    process.exit(1)
  }
}

runManualCrawl()
