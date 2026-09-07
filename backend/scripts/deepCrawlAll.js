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

async function crawlCategory(destination, category, targetCount = 25) {
  let catDesc = ''
  if (category === 'attraction') {
    catDesc = `Tất cả các khu du lịch, danh lam thắng cảnh, bãi biển đẹp, di tích lịch sử, danh thắng, đền chùa, bảo tàng, thác nước, hang động, làng nghề, công viên giải trí, chợ đêm, phố đi bộ tại "${destination}". Hãy liệt kê thật nhiều và phong phú (ít nhất ${targetCount} địa điểm có thật).`
  } else if (category === 'restaurant') {
    catDesc = `Tất cả các quán ăn ngon lâu đời, quán ăn đặc sản truyền thống, nhà hàng hải sản/đặc sản bản địa trứ danh tại "${destination}". Nêu rõ tên món đặc sản kèm tên quán (ít nhất ${targetCount} quán có thật).`
  } else if (category === 'hotel') {
    catDesc = `Các khách sạn, resort nghỉ dưỡng ven biển/trung tâm, homestay view đẹp uy tín tại "${destination}" (ít nhất ${Math.min(targetCount, 15)} khách sạn/resort).`
  } else if (category === 'cafe') {
    catDesc = `Các quán cafe view đẹp, cafe sân thượng/view biển/view núi, quán cafe check-in sống ảo phong cách độc đáo tại "${destination}" (ít nhất ${Math.min(targetCount, 15)} quán cafe).`
  }

  const prompt = `Bạn là Chuyên gia Bản đồ Du lịch & Dữ liệu Ẩm thực số 1 Việt Nam.
Hãy trích xuất danh sách địa điểm thực tế, xác thực 100% tại "${destination}".
Yêu cầu: ${catDesc}

Mỗi địa điểm gồm:
- name: Tên địa danh / quán ăn / khách sạn cụ thể
- type: "${category}"
- destination: "${destination}"
- address: Địa chỉ cụ thể thực tế (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP)
- description: Mô tả sinh động 1-2 câu về điểm đặc sắc, cảnh quan hoặc món ăn ngon
- tags: Mảng 3-4 từ khóa
- estimated_cost: Giá tiền tham khảo (VND số nguyên)
- latitude: Tọa độ vĩ độ
- longitude: Tọa độ kinh độ
- rating: Điểm đánh giá (4.5 - 5.0)

Trả về JSON duy nhất là mảng các đối tượng:`

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
      { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
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
            { $set: { ...item, destination, type: category } },
            { upsert: true }
          )
          count++
        }
        return count
      }
    }
  } catch (err) {
    console.warn(`  [Lỗi cào ${category} tại ${destination}]: ${err.message}`)
  }
  return 0
}

async function runMegaCrawl() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('🚀 Bắt đầu quy trình AI Mega-Crawl toàn diện cho 11 tỉnh thành...')

  for (const dest of CENTRAL_VIETNAM_DESTINATIONS) {
    console.log(`\n📌 Đang cào dữ liệu sâu cho: ${dest}...`)
    const a = await crawlCategory(dest, 'attraction', 25)
    console.log(`  + Thắng cảnh: ${a} điểm`)
    const r = await crawlCategory(dest, 'restaurant', 25)
    console.log(`  + Quán đặc sản: ${r} quán`)
    const h = await crawlCategory(dest, 'hotel', 12)
    console.log(`  + Khách sạn: ${h} khách sạn`)
    const c = await crawlCategory(dest, 'cafe', 12)
    console.log(`  + Quán cafe: ${c} quán`)
    const total = await Place.countDocuments({ destination: dest })
    console.log(`  => Tổng số địa điểm tại ${dest}: ${total}`)
  }

  const grandTotal = await Place.countDocuments()
  console.log(`\n🎉 HOÀN TẤT MEGA-CRAWL! Tổng số địa điểm toàn hệ thống: ${grandTotal}`)
  process.exit(0)
}

runMegaCrawl().catch(e => {
  console.error('Mega-crawl error:', e)
  process.exit(1)
})
