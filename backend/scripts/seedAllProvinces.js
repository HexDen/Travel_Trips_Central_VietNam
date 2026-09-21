const dns = require('node:dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const { autoInitPlaces } = require('../services/aiCrawlerService')

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🚀 Đang bắt đầu quá trình cào dữ liệu toàn diện cho 11 tỉnh thành...')
    console.log('⏳ Vui lòng kiên nhẫn chờ đợi (khoảng 3-5 phút). Bạn chỉ cần làm việc này 1 lần duy nhất!')
    
    await autoInitPlaces()
    
    console.log('✅ Hoàn tất! Tất cả các tỉnh thành đã được nạp đầy đủ dữ liệu.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi:', err.message)
    process.exit(1)
  }
}

seedAll()
