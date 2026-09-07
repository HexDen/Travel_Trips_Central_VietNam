const path = require('path')
const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const Place = require('../models/Place')

const ALIAS_TO_MAIN = {
  'Hội An': 'Đà Nẵng',
  'Quảng Nam': 'Đà Nẵng',
  'Nha Trang': 'Khánh Hòa',
  'Phú Yên': 'Khánh Hòa',
  'Quy Nhơn': 'Quảng Ngãi',
  'Bình Định': 'Quảng Ngãi',
  'Quảng Bình': 'Quảng Trị',
  'Đà Lạt': 'Lâm Đồng',
  'Kon Tum': 'Gia Lai',
  'Đắk Nông': 'Đắk Lắk',
  'Buôn Ma Thuột': 'Đắk Lắk',
  'Quảg': 'Quảng Ngãi'
}

async function normalize() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  for (const [oldDest, newDest] of Object.entries(ALIAS_TO_MAIN)) {
    const res = await Place.updateMany(
      { destination: new RegExp('^' + oldDest + '$', 'i') },
      { $set: { destination: newDest } }
    )
    if (res.modifiedCount > 0) {
      console.log(`Migrated "${oldDest}" -> "${newDest}": ${res.modifiedCount} places`)
    }
  }

  const distinctDests = await Place.distinct('destination')
  console.log('\n--- TỔNG KẾT DỮ LIỆU ĐỊA ĐIỂM SAU KHI CHUẨN HÓA (11 TỈNH THÀNH) ---')
  let grandTotal = 0
  for (const d of distinctDests) {
    const count = await Place.countDocuments({ destination: d })
    const attractions = await Place.countDocuments({ destination: d, type: 'attraction' })
    const restaurants = await Place.countDocuments({ destination: d, type: 'restaurant' })
    const hotels = await Place.countDocuments({ destination: d, type: 'hotel' })
    const cafes = await Place.countDocuments({ destination: d, type: 'cafe' })
    console.log(`📌 ${d.padEnd(12)}: Tổng ${count} điểm (Thắng cảnh: ${attractions}, Quán ăn/Đặc sản: ${restaurants}, Khách sạn: ${hotels}, Cafe: ${cafes})`)
    grandTotal += count
  }
  console.log(`\n🎉 TỔNG SỐ ĐỊA ĐIỂM TOÀN HỆ THỐNG: ${grandTotal}`)
  process.exit(0)
}

normalize().catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
