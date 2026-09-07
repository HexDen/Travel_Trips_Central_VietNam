const path = require('path')
const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const axios = require('axios')
const Place = require('../models/Place')
const { CENTRAL_VIETNAM_DESTINATIONS, PHOTO_MAP } = require('../services/aiCrawlerService')

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const DEST_DETAILS_PROMPTS = [
  {
    category: 'attraction',
    name: 'Danh lam thắng cảnh, bãi biển, núi đèo, hang động, thác nước & công viên tự nhiên',
    count: '25-30'
  },
  {
    category: 'attraction',
    name: 'Di tích lịch sử, Cố đô, Di sản thế giới, Đền chùa cổ, Nhà thờ, Làng nghề truyền thống, Bảo tàng & Phố cổ',
    count: '25-30'
  },
  {
    category: 'restaurant',
    name: 'Quán ăn đặc sản bản địa lâu đời trứ danh, Ẩm thực đường phố truyền thống, Hải sản tươi sống & Chợ đêm',
    count: '30-35'
  },
  {
    category: 'hotel',
    name: 'Khách sạn, Resort nghỉ dưỡng cao cấp, Homestay view núi/biển đẹp & uy tín',
    count: '15-20'
  },
  {
    category: 'cafe',
    name: 'Quán Cafe view đẹp, Cafe sân thượng ngắm cảnh, Cafe check-in phong cảnh độc đáo & Bar đêm chill',
    count: '15-20'
  }
]

async function crawlCategory(dest, promptDef, attempt = 1) {
  const prompt = `Bạn là Chuyên gia Bản đồ Du lịch & Ẩm thực Việt Nam số 1.
Hãy liệt kê và trích xuất danh sách gồm ${promptDef.count} địa điểm thực tế, xác thực 100% thuộc nhóm "${promptDef.name}" tại tỉnh/thành phố "${dest}" (bao gồm toàn bộ các quận, huyện, thị xã và vùng lân cận mở rộng).

YÊU CẦU DỮ LIỆU CỦA MỖI ĐỊA ĐIỂM:
- name: Tên địa điểm chuẩn xác có thật (Ví dụ: "Bà Nà Hills & Cầu Vàng", "Bánh mì Phượng Hội An", "Mì Quảng 1A Hải Phòng", v.v.)
- type: "${promptDef.category}"
- destination: "${dest}"
- address: Địa chỉ thực tế chi tiết (Số nhà, Tên đường, Phường/Xã, Quận/Huyện/Thị xã, Tỉnh/TP ${dest})
- description: Mô tả sinh động 1-2 câu về nét đẹp, điểm nhấn tham quan hoặc hương vị món ăn trứ danh
- tags: Mảng 3 từ khóa (ví dụ: ["biển", "check-in", "nổi tiếng"])
- estimated_cost: Giá vé / chi phí ăn uống / giá phòng tham khảo (VND)
- latitude: Tọa độ vĩ độ thực tế (ví dụ: 16.059)
- longitude: Tọa độ kinh độ thực tế (ví dụ: 108.246)
- rating: Điểm đánh giá (4.6 - 5.0)

TRẢ VỀ KẾT QUẢ DUY NHẤT LÀ MẢNG JSON HỢP LỆ:
[
  {
    "name": "...",
    "type": "${promptDef.category}",
    "destination": "${dest}",
    "address": "...",
    "description": "...",
    "tags": ["...", "...", "..."],
    "estimated_cost": 50000,
    "latitude": 16.05,
    "longitude": 108.24,
    "rating": 4.8
  }
]`

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
    )

    const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
    if (raw) {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
      const startIdx = cleaned.indexOf('[')
      const endIdx = cleaned.lastIndexOf(']')
      if (startIdx >= 0 && endIdx >= startIdx) {
        const list = JSON.parse(cleaned.slice(startIdx, endIdx + 1))
        if (Array.isArray(list)) {
          const destPhotos = (PHOTO_MAP && PHOTO_MAP[dest]) || {}
          let saved = 0
          for (const item of list) {
            if (!item.name) continue
            const img = item.image || destPhotos[item.type] || destPhotos.attraction || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80'
            await Place.updateOne(
              { name: item.name, destination: dest },
              {
                $set: {
                  ...item,
                  destination: dest,
                  image: img,
                  rating: Number(item.rating) || 4.8,
                  estimated_cost: Number(item.estimated_cost) || (item.type === 'hotel' ? 850000 : item.type === 'restaurant' ? 120000 : 50000)
                }
              },
              { upsert: true }
            )
            saved++
          }
          console.log(`   + [${dest}] Đã nạp ${saved} địa điểm (${promptDef.name.substring(0, 35)}...)`)
          return saved
        }
      }
    }
  } catch (err) {
    if (attempt <= 3) {
      const waitTime = attempt * 3000
      console.warn(`   ⚠️ Lỗi cào ${dest} - ${promptDef.name.substring(0, 20)} (${err.message}). Đợi ${waitTime/1000}s thử lại lần ${attempt+1}...`)
      await new Promise(r => setTimeout(r, waitTime))
      return crawlCategory(dest, promptDef, attempt + 1)
    } else {
      console.error(`   ❌ Thất bại ${dest} sau 3 lần thử: ${err.message}`)
    }
  }
  return 0
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('🚀 Bắt đầu cào quét ĐẠI QUY MÔ toàn bộ các địa điểm du lịch Miền Trung...')

  for (const dest of CENTRAL_VIETNAM_DESTINATIONS) {
    console.log(`\n📍 Bắt đầu thu thập dữ liệu chuyên sâu cho: ${dest.toUpperCase()}...`)
    for (const promptDef of DEST_DETAILS_PROMPTS) {
      await crawlCategory(dest, promptDef)
      // Nghỉ 1.8s giữa các lần gọi để tôn trọng rate limit của Google Gemini
      await new Promise(r => setTimeout(r, 1800))
    }
    const currentDestTotal = await Place.countDocuments({ destination: dest })
    console.log(`🎯 Hoàn tất ${dest}: Hiện có tổng cộng ${currentDestTotal} địa điểm thực tế trong CSDL!`)
  }

  const grandTotal = await Place.countDocuments()
  console.log(`\n======================================================`)
  console.log(`🎉 HOÀN TẤT ĐẠI QUY MÔ! TỔNG SỐ ĐỊA ĐIỂM TOÀN HỆ THỐNG: ${grandTotal}`)
  console.log(`======================================================`)
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
