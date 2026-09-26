const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')

async function testConnection() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log('❌ LỖI: Chưa cấu hình MONGODB_URI trong file .env')
    process.exit(1)
  }

  // Ẩn mật khẩu khi hiển thị
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
  console.log('====================================================')
  console.log('🔍 KIỂM TRA TRẠNG THÁI KẾT NỐI MONGODB ATLAS')
  console.log('====================================================')
  console.log('📌 Chuỗi kết nối URI:', maskedUri)

  const startTime = Date.now()
  try {
    console.log('⏳ Đang bắt tay kết nối (handshake) tới cụm máy chủ Atlas...')
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
    const latency = Date.now() - startTime

    console.log(`✅ KẾT NỐI THÀNH CÔNG RỰC RỠ!`)
    console.log(`⚡ Thời gian phản hồi (Ping Latency): ${latency}ms`)

    const db = mongoose.connection.db
    console.log(`📂 Database Name: ${db.databaseName}`)
    console.log(`🖥️  Host Cluster: ${mongoose.connection.host}`)
    console.log(`🔌 Cổng Port: ${mongoose.connection.port}`)
    console.log(`🚦 Trạng thái kết nối (ReadyState): ${mongoose.connection.readyState} (1 = Connected)`)

    // Kiểm tra ping từ server Atlas
    const admin = db.admin()
    const pingResult = await admin.ping()
    console.log(`📡 Atlas Server Ping OK:`, pingResult.ok === 1 ? 'OK (1.0)' : pingResult)

    // Liệt kê chi tiết các collection và số lượng documents
    const collections = await db.listCollections().toArray()
    console.log('\n📊 THỐNG KÊ DỮ LIỆU CÁC BẢNG (COLLECTIONS) TRONG ATLAS:')
    let totalDocs = 0
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments()
      totalDocs += count
      console.log(`   + ${col.name.padEnd(20)}: ${count.toLocaleString('vi-VN')} bản ghi`)
    }
    console.log(`\n📦 Tổng số bản ghi toàn hệ thống: ${totalDocs.toLocaleString('vi-VN')} bản ghi`)

    await mongoose.disconnect()
    console.log('====================================================')
    console.log('🎉 KẾT QUẢ: MongoDB Atlas hoạt động hoàn hảo 100%!')
    console.log('====================================================')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ KẾT NỐI THẤT BẠI!')
    console.error('Chi tiết lỗi:', err.message)
    console.log('====================================================')
    process.exit(1)
  }
}

testConnection()
