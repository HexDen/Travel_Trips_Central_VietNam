const path = require('path')
const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const axios = require('axios')
const Place = require('../models/Place')
const { CENTRAL_VIETNAM_DESTINATIONS } = require('../services/aiCrawlerService')

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

async function crawlDestinationFast(destination) {
  const prompt = `Bạn là Chuyên gia Bản đồ Du lịch & Ẩm thực số 1 Việt Nam.
Hãy cào quét toàn diện và trích xuất danh sách địa điểm thực tế, xác thực 100% tại "${destination}" (bao gồm cả các quận/huyện, thị xã, vùng lân cận).

YÊU CẦU TRÍCH XUẤT ĐẦY ĐỦ:
1. 18-20 Thắng cảnh & Khu du lịch (type: "attraction"): bãi biển đẹp, di tích lịch sử, danh thắng, hang động, thác nước, đền chùa, bảo tàng, làng nghề, chợ đêm, phố đi bộ.
2. 18-20 Quán ăn đặc sản & Quán lâu đời (type: "restaurant"): các món ngon trứ danh bản địa, hải sản tươi sống, quán ăn truyền thống lâu đời (nêu rõ món đặc sản + tên quán trong description).
3. 8-10 Khách sạn & Homestay (type: "hotel"): resort nghỉ dưỡng, khách sạn tiện nghi, homestay view đẹp.
4. 8-10 Quán Cafe (type: "cafe"): cafe view đẹp, cafe sân thượng, cafe check-in sống ảo.

Mỗi địa điểm gồm:
- name: Tên cụ thể
- type: "attraction" | "restaurant" | "hotel" | "cafe"
- destination: "${destination}"
- address: Địa chỉ cụ thể thực tế (Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP)
- description: Mô tả sinh động 1-2 câu về cảnh đẹp, điểm nhấn hoặc hương vị món ăn
- tags: Mảng 3 từ khóa
- estimated_cost: Giá tham khảo (VND)
- latitude: Tọa độ vĩ độ
- longitude: Tọa độ kinh độ
- rating: 4.6 - 5.0

Trả về JSON duy nhất là mảng [ { ... }, { ... } ] gồm 50-60 địa điểm:`

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 35000 }
    )

    const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list)) {
        let count = 0
        for (const item of list) {
          if (!item.name) continue
          await Place.updateOne(
            { name: item.name, destination },
            { $set: { ...item, destination } },
            { upsert: true }
          )
          count++
        }
        const totalInDb = await Place.countDocuments({ destination })
        console.log(`✅ ${destination.padEnd(12)}: Đã nạp thêm ${count} điểm => Tổng trong DB: ${totalInDb} địa điểm`)
        return count
      }
    }
  } catch (err) {
    console.warn(`⚠️ Lỗi cào ${destination}: ${err.message}`)
  }
  return 0
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('🚀 Bắt đầu cào song song toàn bộ 11 tỉnh thành...')
  
  // Chạy theo từng nhóm 3 tỉnh để tối ưu tốc độ và không bị giới hạn rate-limit
  const chunkSize = 3
  for (let i = 0; i < CENTRAL_VIETNAM_DESTINATIONS.length; i += chunkSize) {
    const batch = CENTRAL_VIETNAM_DESTINATIONS.slice(i, i + chunkSize)
    console.log(`\n⏳ Đang cào nhóm ${Math.floor(i/chunkSize) + 1}: ${batch.join(', ')}...`)
    await Promise.all(batch.map(d => crawlDestinationFast(d)))
  }

  const grandTotal = await Place.countDocuments()
  console.log(`\n🎉 HOÀN TẤT! Tổng số địa điểm toàn hệ thống: ${grandTotal}`)
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
