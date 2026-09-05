const axios = require('axios')
const Place = require('../models/Place')

// 11 Tỉnh/Thành phố Miền Trung & Tây Nguyên sau sáp nhập
const CENTRAL_VIETNAM_DESTINATIONS = [
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Trị',
  'Huế',
  'Đà Nẵng',
  'Quảng Ngãi',
  'Gia Lai',
  'Đắk Lắk',
  'Khánh Hòa',
  'Lâm Đồng'
]

// Từ khóa ảnh Unsplash theo tỉnh & loại hình đảm bảo 100% hiển thị ảnh HD thực tế
const PHOTO_MAP = {
  'Thanh Hóa': {
    attraction: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80'
  },
  'Nghệ An': {
    attraction: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80'
  },
  'Hà Tĩnh': {
    attraction: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=700&auto=format&fit=crop&q=80'
  },
  'Quảng Trị': {
    attraction: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80'
  },
  'Huế': {
    attraction: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80'
  },
  'Đà Nẵng': {
    attraction: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=700&auto=format&fit=crop&q=80'
  },
  'Quảng Ngãi': {
    attraction: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80'
  },
  'Gia Lai': {
    attraction: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80'
  },
  'Đắk Lắk': {
    attraction: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80'
  },
  'Khánh Hòa': {
    attraction: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=700&auto=format&fit=crop&q=80'
  },
  'Lâm Đồng': {
    attraction: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=700&auto=format&fit=crop&q=80',
    restaurant: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&auto=format&fit=crop&q=80',
    hotel: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80'
  }
}

// Bổ sung kho gợi ý địa phương phong phú cho 11 tỉnh thành sáp nhập
const LOCAL_CONTEXT_PROMPT_MAP = {
  'Thanh Hóa': 'Sầm Sơn, Pù Luông, Thành Nhà Hồ, Suối Cá Thần Cẩm Lương, Đền Bà Triệu; Đặc sản: Nem chua Thanh Hóa, Chả tôm, Bánh khoái tép, Gỏi cá nhệch Nga Sơn, Bánh gai Tứ Trụ',
  'Nghệ An': 'Bãi biển Cửa Lò, Khu di tích Kim Liên Quê Bác, Đồi chè Thanh Chương, Vườn Quốc gia Pù Mát, Đền Cuông; Đặc sản: Cháo lươn Nghệ An, Súp lươn bánh mướt, Mực nhảy Cửa Lò, Nhút Thanh Chương, Tương Nam Đàn',
  'Hà Tĩnh': 'Bãi biển Thiên Cầm, Ngã ba Đồng Lộc, Chùa Hương Tích, Hồ Kẻ Gỗ, Khu di tích Nguyễn Du; Đặc sản: Kẹo cu đơ Hà Tĩnh, Mực nhảy Vũng Áng, Ram mướt, Bánh bèo Hà Tĩnh, Dê núi Hương Sơn',
  'Quảng Trị': 'Khu vực Quảng Trị & Quảng Bình sáp nhập (Thành Cổ Quảng Trị, Địa đạo Vịnh Mốc, Cầu Hiền Lương - Sông Bến Hải, Động Phong Nha, Động Thiên Đường, Suối Moọc, Hang Sơn Đoòng); Đặc sản: Bánh canh cá lóc, Bún hến Mai Xá, Bánh lọc, Cháo cá vạt giường, Thịt trâu lá trơng',
  'Huế': 'Đại Nội Hoàng Thành Huế, Chùa Thiên Mụ, Lăng Khải Định, Lăng Tự Đức, Đồi Vọng Cảnh, Đầm Lập An, Vịnh Lăng Cô, Phá Tam Giang; Đặc sản: Bún bò Huế chuẩn vị, Cơm hến Hoa Đông, Bánh bèo nậm lọc, Cà phê muối, Chè Hẻm',
  'Đà Nẵng': 'Khu vực Đà Nẵng & Quảng Nam - Hội An sáp nhập (Bà Nà Hills & Cầu Vàng, Biển Mỹ Khê, Bán đảo Sơn Trà & Linh Ứng, Ngũ Hành Sơn, Cầu Rồng, Phố cổ Hội An, Thánh địa Mỹ Sơn, Rừng dừa Bảy Mẫu); Đặc sản: Mì Quảng Bà Mua, Bánh tráng cuốn thịt heo Quán Trần, Bánh mì Phượng Hội An, Cao lầu, Bún chả cá, Hải sản tươi sống',
  'Quảng Ngãi': 'Khu vực Quảng Ngãi & Bình Định - Quy Nhơn sáp nhập (Đảo Lý Sơn, Cổng Tò Vò, Hang Câu, Eo Gió & Kỳ Co, Tháp Đôi Chăm Pa, Khu chứng tích Sơn Mỹ, Mũi Ba Làng An); Đặc sản: Don Quảng Ngãi, Ram bắp, Bánh xèo tôm nhảy Quy Nhơn, Cá bống Sông Trà, Tỏi cô đơn Lý Sơn, Nem Chợ Huyện',
  'Gia Lai': 'Khu vực Gia Lai & Kon Tum sáp nhập (Biển Hồ T’Nưng, Núi lửa Chư Đăng Ya, Biển Hồ Chè, Chùa Minh Thành, Nhà rông Kon Klor, Nhà thờ Gỗ Kon Tum, Thác K50); Đặc sản: Phở hai tô (Phở khô Gia Lai), Bò một nắng muối kiến vàng, Gà nướng cơm lam Pleiku, Bún mắm cua thối, Cà phê Pleiku',
  'Đắk Lắk': 'Khu vực Đắk Lắk & Đắk Nông sáp nhập (Thác Dray Nur & Dray Sap, Bảo tàng Thế giới Cà phê, Hồ Lắk, Buôn Đôn, Chùa Sắc Tứ Khải Đoan, Hồ Tà Đùng - Vịnh Hạ Long Tây Nguyên); Đặc sản: Bún đỏ Buôn Ma Thuột, Gà nướng than Bản Đôn, Lẩu cá lăng Sông Sêrêpôk, Cà phê Robusta thơm nồng',
  'Khánh Hòa': 'Khu vực Khánh Hòa & Phú Yên sáp nhập (VinWonders Nha Trang, Tháp Bà Ponagar, Viện Hải dương học, Vịnh Vĩnh Hy, Gành Đá Đĩa, Mũi Điện Đại Lãnh, Bãi Dài Cam Ranh); Đặc sản: Bún chả cá Nha Trang, Nem nướng Ninh Hòa, Bánh căn mực, Mắt cá ngừ đại dương Phú Yên, Tôm hùm Bình Ba, Yến sào',
  'Lâm Đồng': 'Hồ Xuân Hương & Quảng trường Lâm Viên, Thung Lũng Tình Yêu, Ga Đà Lạt, Đỉnh Langbiang, Thác Datanla & Máng trượt, Đồi chè Cầu Đất, Thác Dambri Bảo Lộc; Đặc sản: Bánh tráng nướng Đà Lạt, Lẩu gà lá é Tao Ngộ, Bánh ướt lòng gà Long, Lẩu bò Ba Toa Quán Gỗ, Kem bơ Thanh Thảo'
}

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY
  if (!key || !key.startsWith('AIza') || key.length < 35) return null
  return key
}

/**
 * AI Crawler: Thu thập & làm giàu dữ liệu địa điểm sâu rộng cho một điểm đến bằng Gemini AI
 */
async function crawlPlacesByAI(destination) {
  const geminiKey = getGeminiKey()
  let placesToSave = []

  const contextHint = LOCAL_CONTEXT_PROMPT_MAP[destination] || `Vùng đất ${destination} Miền Trung & Tây Nguyên`

  if (geminiKey) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[AI Crawler] 🤖 Đang gửi yêu cầu tới Gemini AI để cào dữ liệu sâu rộng tại: ${destination} (Lần thử ${attempt}/3)...`)
        const prompt = `Bạn là một AI Data Web Crawler chuyên nghiệp về Du lịch & Ẩm thực Việt Nam.
Hãy cào quét, tìm kiếm và trích xuất danh sách 15 đến 25 địa điểm du lịch, quán ăn đặc sản, quán cafe và khách sạn nổi tiếng, xác thực nhất tại tỉnh/thành phố "${destination}" (Lưu ý: Đây là đơn vị hành chính/khu vực mở rộng sau sáp nhập bao gồm: ${contextHint}).

Yêu cầu bóc tách đủ 4 loại (type):
1. "attraction": Các danh lam thắng cảnh, bãi biển, di tích lịch sử, vườn quốc gia, hang động, bảo tàng, làng nghề nổi tiếng nhất.
2. "restaurant": Các quán ăn lâu đời trứ danh, nhà hàng đặc sản bản địa chính thống, phục vụ món ăn đặc sắc của ${destination}.
3. "cafe": Quán cafe view đẹp, cafe sân thượng ngắm cảnh, cafe check-in phong cách độc đáo.
4. "hotel": Khách sạn, resort nghỉ dưỡng sạch sẽ, uy tín, view đẹp tại ${destination}.

MỖI ĐỊA ĐIỂM PHẢI CÓ ĐỊA CHỈ THỰC TẾ CHI TIẾT (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP), giá cả thực tế và tọa độ GPS chuẩn xác.

TRẢ VỀ KẾT QUẢ DUY NHẤT LÀ MỘT MẢNG JSON HỢP LỆ (KHÔNG KÈM TEXT GIẢI THÍCH):
[
  {
    "name": "Tên địa điểm chính xác",
    "destination": "${destination}",
    "type": "attraction | restaurant | cafe | hotel",
    "address": "Địa chỉ cụ thể từng số nhà, tên đường tại ${destination}",
    "description": "Mô tả sinh động 1-2 câu về nét độc đáo, cảnh quan hoặc hương vị món ăn",
    "tags": ["tag1", "tag2", "tag3"],
    "estimated_cost": 50000,
    "latitude": 16.0592,
    "longitude": 108.2467,
    "rating": 4.8
  }
]`

        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
        const res = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          { contents: [{ parts: [{ text: prompt }] }] },
          { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
        )

        const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
        if (raw) {
          const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
          const startIdx = cleaned.indexOf('[')
          const endIdx = cleaned.lastIndexOf(']')
          if (startIdx >= 0 && endIdx >= startIdx) {
            placesToSave = JSON.parse(cleaned.slice(startIdx, endIdx + 1))
            if (placesToSave && placesToSave.length > 0) {
              break // Thành công, thoát vòng lặp retry
            }
          }
        }
      } catch (err) {
        console.warn(`[AI Crawler] Lần thử ${attempt}/3 tại ${destination} gặp lỗi (${err.message}).`)
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2500 * attempt))
        }
      }
    }
  }

  // Tự động gán hình ảnh độ nét cao và chuẩn hóa dữ liệu
  const destPhotos = PHOTO_MAP[destination] || PHOTO_MAP['Đà Nẵng']
  placesToSave = (placesToSave || []).map(p => {
    let img = p.image
    if (!img || !img.startsWith('http')) {
      img = destPhotos[p.type] || destPhotos.attraction
    }
    return {
      ...p,
      destination,
      image: img,
      rating: Number(p.rating) || 4.7,
      estimated_cost: Number(p.estimated_cost) || (p.type === 'hotel' ? 850000 : p.type === 'restaurant' ? 120000 : 50000)
    }
  })

  // Lưu tự động vào MongoDB Atlas (Upsert chống trùng lặp)
  let savedCount = 0
  for (const place of placesToSave) {
    if (!place.name) continue
    await Place.updateOne(
      { name: place.name, destination: place.destination || destination },
      { $set: { ...place, destination: place.destination || destination } },
      { upsert: true }
    )
    savedCount++
  }

  console.log(`[AI Crawler] ✅ Đã tự động thu thập & nạp ${savedCount} địa điểm phong phú tại "${destination}" vào MongoDB Atlas!`)
  return placesToSave
}

/**
 * Cào dữ liệu toàn diện cho toàn bộ 11 tỉnh thành
 */
async function crawlAllDestinations() {
  console.log(`[AI Crawler] Bắt đầu cào dữ liệu cho toàn bộ 11 tỉnh thành:`, CENTRAL_VIETNAM_DESTINATIONS.join(', '))
  const results = {}
  for (const dest of CENTRAL_VIETNAM_DESTINATIONS) {
    try {
      const places = await crawlPlacesByAI(dest)
      results[dest] = places.length
    } catch (e) {
      console.error(`[AI Crawler] Lỗi khi cào ${dest}:`, e.message)
      results[dest] = 0
    }
  }
  const total = await Place.countDocuments()
  console.log(`[AI Crawler] 🎉 HOÀN TẤT! Tổng số địa điểm hiện có trong CSDL: ${total}`)
  return { results, total }
}

/**
 * Tự động kiểm tra và khởi chạy AI Crawler ngầm cho từng tỉnh thành khi khởi động server
 */
async function autoInitPlaces() {
  try {
    console.log('[AI Auto-Crawler] 🔍 Đang kiểm tra dữ liệu cho 11 tỉnh thành sau sáp nhập...')
    for (const dest of CENTRAL_VIETNAM_DESTINATIONS) {
      const count = await Place.countDocuments({ destination: new RegExp(`^${dest}$`, 'i') })
      if (count < 15) {
        console.log(`[AI Auto-Crawler] Tỉnh/TP "${dest}" hiện có ${count} địa điểm (<15). Đang tự động cào dữ liệu mới...`)
        await crawlPlacesByAI(dest)
      } else {
        console.log(`[AI Auto-Crawler] ✅ Tỉnh/TP "${dest}" đã có ${count} địa điểm đầy đủ.`)
      }
    }
    const total = await Place.countDocuments()
    console.log(`[AI Auto-Crawler] 🎉 HOÀN TẤT KIỂM TRA! Tổng số địa điểm toàn hệ thống: ${total}`)
  } catch (err) {
    console.warn(`[AI Auto-Crawler] Lỗi khi tự động kiểm tra nạp dữ liệu: ${err.message}`)
  }
}

module.exports = {
  CENTRAL_VIETNAM_DESTINATIONS,
  crawlPlacesByAI,
  crawlAllDestinations,
  autoInitPlaces
}
