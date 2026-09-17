const path = require('path')
const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const mongoose = require('mongoose')
const axios = require('axios')
const Place = require('../models/Place')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-travel'

/**
 * Danh sách các địa điểm du lịch & danh lam thắng cảnh nổi tiếng tại các tỉnh Miền Trung
 * Dùng làm hạt giống (seed) để tự động crawl dữ liệu chi tiết & ảnh HD từ Wikipedia và Unsplash
 */
const TARGET_DESTINATIONS = [
  // ==================== ĐÀ NẴNG & QUẢNG NAM ====================
  {
    destination: 'Đà Nẵng',
    places: [
      { name: 'Bà Nà Hills', wikiQuery: 'Bà Nà Hills', type: 'attraction', cost: 900000, tags: ['bà nà', 'cầu vàng', 'núi chúa', 'cáp treo'] },
      { name: 'Phố cổ Hội An', wikiQuery: 'Hội An', type: 'attraction', cost: 150000, tags: ['phố cổ', 'hội an', 'unesco', 'đèn lồng'] },
      { name: 'Bán đảo Sơn Trà', wikiQuery: 'Bán đảo Sơn Trà', type: 'attraction', cost: 0, tags: ['sơn trà', 'chùa linh ứng', 'voọc chà vá'] },
      { name: 'Ngũ Hành Sơn', wikiQuery: 'Ngũ Hành Sơn', type: 'attraction', cost: 40000, tags: ['ngũ hành sơn', 'động huyền không', 'chùa tam thai'] },
      { name: 'Cầu Rồng', wikiQuery: 'Cầu Rồng (Đà Nẵng)', type: 'attraction', cost: 0, tags: ['cầu rồng', 'sông hàn', 'phun lửa'] },
      { name: 'Thánh địa Mỹ Sơn', wikiQuery: 'Thánh địa Mỹ Sơn', type: 'attraction', cost: 150000, tags: ['mỹ sơn', 'chăm pa', 'di sản', 'quảng nam'] },
      { name: 'Bãi biển Mỹ Khê', wikiQuery: 'Bãi biển Mỹ Khê', type: 'attraction', cost: 0, tags: ['mỹ khê', 'biển', 'tắm biển', 'đà nẵng'] },
      { name: 'Rừng dừa Bảy Mẫu', wikiQuery: 'Rừng dừa Bảy Mẫu', type: 'attraction', cost: 150000, tags: ['thuyền thúng', 'rừng dừa', 'cẩm thanh', 'hội an'] },
      { name: 'Cù Lao Chàm', wikiQuery: 'Cù Lao Chàm', type: 'attraction', cost: 450000, tags: ['cù lao chàm', 'lặn san hô', 'đảo', 'hải sản'] }
    ]
  },

  // ==================== HUẾ ====================
  {
    destination: 'Huế',
    places: [
      { name: 'Quần thể di tích Cố đô Huế', wikiQuery: 'Quần thể di tích Cố đô Huế', type: 'attraction', cost: 200000, tags: ['đại nội', 'hoàng thành', 'unesco', 'cung đình'] },
      { name: 'Chùa Thiên Mụ', wikiQuery: 'Chùa Thiên Mụ', type: 'attraction', cost: 0, tags: ['chùa thiên mụ', 'tháp phước duyên', 'sông hương'] },
      { name: 'Lăng Khải Định', wikiQuery: 'Lăng Khải Định', type: 'attraction', cost: 150000, tags: ['lăng khải định', 'kiến trúc tây âu', 'khảm sành sứ'] },
      { name: 'Lăng Tự Đức', wikiQuery: 'Lăng Tự Đức', type: 'attraction', cost: 150000, tags: ['lăng tự đức', 'thơ mộng', 'hồ lưu khiêm'] },
      { name: 'Đồi Vọng Cảnh', wikiQuery: 'Đồi Vọng Cảnh', type: 'attraction', cost: 0, tags: ['đồi vọng cảnh', 'sông hương', 'ngắm hoàng hôn', 'rừng thông'] },
      { name: 'Vịnh Lăng Cô', wikiQuery: 'Vịnh Lăng Cô', type: 'attraction', cost: 0, tags: ['lăng cô', 'vịnh đẹp thế giới', 'đầm lập an', 'hải sản'] },
      { name: 'Phá Tam Giang', wikiQuery: 'Phá Tam Giang', type: 'attraction', cost: 0, tags: ['phá tam giang', 'đầm phá lớn nhất', 'hoàng hôn', 'rừng ngập mặn'] },
      { name: 'Vườn quốc gia Bạch Mã', wikiQuery: 'Vườn quốc gia Bạch Mã', type: 'attraction', cost: 60000, tags: ['bạch mã', 'thác đỗ quyên', 'trekking', 'núi rừng'] }
    ]
  },

  // ==================== QUẢNG TRỊ & QUẢNG BÌNH ====================
  {
    destination: 'Quảng Trị',
    places: [
      { name: 'Vườn quốc gia Phong Nha - Kẻ Bàng', wikiQuery: 'Vườn quốc gia Phong Nha - Kẻ Bàng', type: 'attraction', cost: 150000, tags: ['phong nha', 'kẻ bàng', 'unesco', 'hang động'] },
      { name: 'Động Thiên Đường', wikiQuery: 'Động Thiên Đường', type: 'attraction', cost: 250000, tags: ['động thiên đường', 'thạch nhũ', 'quảng bình'] },
      { name: 'Địa đạo Vịnh Mốc', wikiQuery: 'Địa đạo Vịnh Mốc', type: 'attraction', cost: 50000, tags: ['địa đạo vịnh mốc', 'di tích lịch sử', 'chiến tranh'] },
      { name: 'Thành cổ Quảng Trị', wikiQuery: 'Thành cổ Quảng Trị', type: 'attraction', cost: 0, tags: ['thành cổ', 'lịch sử', 'quảng trị', 'tâm linh'] },
      { name: 'Sông Bến Hải và Cầu Hiền Lương', wikiQuery: 'Cầu Hiền Lương', type: 'attraction', cost: 50000, tags: ['cầu hiền lương', 'sông bến hải', 'vĩ tuyến 17'] },
      { name: 'Suối Nước Moọc', wikiQuery: 'Vườn quốc gia Phong Nha - Kẻ Bàng', type: 'attraction', cost: 80000, tags: ['suối nước moọc', 'chèo kayak', 'tắm suối', 'rừng nguyên sinh'] }
    ]
  },

  // ==================== KHÁNH HÒA & PHÚ YÊN ====================
  {
    destination: 'Khánh Hòa',
    places: [
      { name: 'Tháp Po Nagar', wikiQuery: 'Tháp Po Nagar', type: 'attraction', cost: 30000, tags: ['tháp bà', 'ponagar', 'chăm pa', 'nha trang'] },
      { name: 'Gành Đá Đĩa', wikiQuery: 'Gành Đá Đĩa', type: 'attraction', cost: 40000, tags: ['gành đá đĩa', 'phú yên', 'núi đá bazan', 'kỳ quan'] },
      { name: 'Mũi Điện', wikiQuery: 'Mũi Điện', type: 'attraction', cost: 20000, tags: ['mũi điện', 'hải đăng đại lãnh', 'đón bình minh', 'phú yên'] },
      { name: 'VinWonders Nha Trang', wikiQuery: 'VinWonders', type: 'attraction', cost: 800000, tags: ['vinwonders', 'hòn tre', 'công viên nước', 'cáp treo'] },
      { name: 'Viện Hải dương học Nha Trang', wikiQuery: 'Viện Hải dương học Nha Trang', type: 'attraction', cost: 40000, tags: ['viện hải dương học', 'sinh vật biển', 'thủy cung'] },
      { name: 'Vịnh Vân Phong', wikiQuery: 'Vịnh Vân Phong', type: 'attraction', cost: 0, tags: ['vịnh vân phong', 'điệp sơn', 'con đường dưới biển'] }
    ]
  },

  // ==================== LÂM ĐỒNG (ĐÀ LẠT) ====================
  {
    destination: 'Lâm Đồng',
    places: [
      { name: 'Hồ Xuân Hương', wikiQuery: 'Hồ Xuân Hương (Đà Lạt)', type: 'attraction', cost: 0, tags: ['hồ xuân hương', 'đà lạt', 'trung tâm', 'dạo bộ'] },
      { name: 'Núi Langbiang', wikiQuery: 'Langbiang', type: 'attraction', cost: 50000, tags: ['langbiang', 'nóc nhà đà lạt', 'ngắm cảnh', 'xe jeep'] },
      { name: 'Thác Datanla', wikiQuery: 'Thác Datanla', type: 'attraction', cost: 50000, tags: ['thác datanla', 'máng trượt', 'đu dây mạo hiểm'] },
      { name: 'Thung lũng Tình Yêu', wikiQuery: 'Thung lũng Tình Yêu', type: 'attraction', cost: 250000, tags: ['thung lũng tình yêu', 'check-in', 'cầu kính', 'hoa'] },
      { name: 'Ga Đà Lạt', wikiQuery: 'Ga Đà Lạt', type: 'attraction', cost: 10000, tags: ['ga đà lạt', 'kiến trúc pháp', 'đầu máy hơi nước'] },
      { name: 'Đồi chè Cầu Đất', wikiQuery: 'Đồi chè Cầu Đất', type: 'attraction', cost: 0, tags: ['cầu đất', 'đồi chè', 'săn mây', 'quạt gió'] }
    ]
  },

  // ==================== QUẢNG NGÃI & BÌNH ĐỊNH ====================
  {
    destination: 'Quảng Ngãi',
    places: [
      { name: 'Đảo Lý Sơn', wikiQuery: 'Lý Sơn', type: 'attraction', cost: 0, tags: ['lý sơn', 'vương quốc tỏi', 'cổng tò vò', 'núi thới lới'] },
      { name: 'Eo Gió Quy Nhơn', wikiQuery: 'Quy Nhơn', type: 'attraction', cost: 25000, tags: ['eo gió', 'ngắm hoàng hôn', 'con đường ven biển', 'bình định'] },
      { name: 'Kỳ Co', wikiQuery: 'Quy Nhơn', type: 'attraction', cost: 100000, tags: ['kỳ co', 'maldives việt nam', 'biển xanh', 'cano'] },
      { name: 'Tháp Đôi Quy Nhơn', wikiQuery: 'Tháp Đôi', type: 'attraction', cost: 20000, tags: ['tháp đôi', 'chăm pa', 'quy nhơn', 'di tích'] },
      { name: 'Mũi Ba Làng An', wikiQuery: 'Quảng Ngãi', type: 'attraction', cost: 0, tags: ['ba làng an', 'hải đăng', 'miệng núi lửa cổ'] }
    ]
  },

  // ==================== TÂY NGUYÊN (GIA LAI & ĐẮK LẮK) ====================
  {
    destination: 'Gia Lai',
    places: [
      { name: 'Biển Hồ T’Nưng', wikiQuery: 'Biển Hồ (Gia Lai)', type: 'attraction', cost: 10000, tags: ['biển hồ', 't nưng', 'đôi mắt pleiku', 'núi lửa cổ'] },
      { name: 'Núi lửa Chư Đăng Ya', wikiQuery: 'Chư Đăng Ya', type: 'attraction', cost: 0, tags: ['chư đăng ya', 'hoa dã quỳ', 'núi lửa', 'pleiku'] },
      { name: 'Chùa Minh Thành', wikiQuery: 'Chùa Minh Thành', type: 'attraction', cost: 0, tags: ['chùa minh thành', 'kiến trúc nhật bản', 'tâm linh', 'pleiku'] },
      { name: 'Nhà thờ gỗ Kon Tum', wikiQuery: 'Nhà thờ chính tòa Kon Tum', type: 'attraction', cost: 0, tags: ['nhà thờ gỗ', 'kon tum', 'kiến trúc bana', 'di tích'] },
      { name: 'Thác K50 (Hang Én)', wikiQuery: 'Khu bảo tồn thiên nhiên Kon Chư Răng', type: 'attraction', cost: 0, tags: ['thác k50', 'hang én', 'trekking', 'kỳ quan'] }
    ]
  },
  {
    destination: 'Đắk Lắk',
    places: [
      { name: 'Bảo tàng Thế giới Cà phê', wikiQuery: 'Bảo tàng Cà phê Buôn Ma Thuột', type: 'attraction', cost: 150000, tags: ['bảo tàng cà phê', 'buôn ma thuột', 'kiến trúc nhà dài'] },
      { name: 'Thác Dray Nur', wikiQuery: 'Thác Dray Nur', type: 'attraction', cost: 40000, tags: ['dray nur', 'thác nước hùng vĩ', 'sêrêpôk'] },
      { name: 'Hồ Lắk', wikiQuery: 'Hồ Lắk', type: 'attraction', cost: 0, tags: ['hồ lắk', 'biệt điện bảo đại', 'chèo thuyền độc mộc', 'buôn jun'] },
      { name: 'Hồ Tà Đùng', wikiQuery: 'Vườn quốc gia Tà Đùng', type: 'attraction', cost: 100000, tags: ['tà đùng', 'vịnh hạ long tây nguyên', 'đắk nông', 'check-in'] }
    ]
  },

  // ==================== BẮC TRUNG BỘ (THANH HÓA, NGHỆ AN, HÀ TĨNH) ====================
  {
    destination: 'Thanh Hóa',
    places: [
      { name: 'Thành nhà Hồ', wikiQuery: 'Thành nhà Hồ', type: 'attraction', cost: 40000, tags: ['thành nhà hồ', 'unesco', 'thành đá cổ', 'thanh hóa'] },
      { name: 'Khu bảo tồn thiên nhiên Pù Luông', wikiQuery: 'Khu bảo tồn thiên nhiên Pù Luông', type: 'attraction', cost: 0, tags: ['pù luông', 'ruộng bậc thang', 'bản đôn', 'nghỉ dưỡng'] },
      { name: 'Bãi biển Sầm Sơn', wikiQuery: 'Sầm Sơn', type: 'attraction', cost: 0, tags: ['sầm sơn', 'bãi biển', 'hòn trống mái', 'đền độc cước'] },
      { name: 'Suối Cá Thần Cẩm Lương', wikiQuery: 'Suối cá thần Cẩm Lương', type: 'attraction', cost: 20000, tags: ['suối cá thần', 'cẩm lương', 'kỳ lạ', 'tâm linh'] }
    ]
  },
  {
    destination: 'Nghệ An',
    places: [
      { name: 'Khu di tích Kim Liên', wikiQuery: 'Khu di tích Kim Liên', type: 'attraction', cost: 0, tags: ['quê bác', 'kim liên', 'nam đàn', 'lịch sử'] },
      { name: 'Bãi biển Cửa Lò', wikiQuery: 'Cửa Lò', type: 'attraction', cost: 0, tags: ['cửa lò', 'bãi biển', 'hải sản', 'đảo lan châu'] },
      { name: 'Đồi chè Thanh Chương', wikiQuery: 'Thanh Chương', type: 'attraction', cost: 30000, tags: ['đồi chè', 'đảo chè', 'thuyền', 'nghệ an'] }
    ]
  },
  {
    destination: 'Hà Tĩnh',
    places: [
      { name: 'Khu di tích Ngã ba Đồng Lộc', wikiQuery: 'Ngã ba Đồng Lộc', type: 'attraction', cost: 0, tags: ['ngã ba đồng lộc', '10 cô gái', 'di tích lịch sử', 'hà tĩnh'] },
      { name: 'Chùa Hương Tích', wikiQuery: 'Chùa Hương Tích (Hà Tĩnh)', type: 'attraction', cost: 20000, tags: ['hương tích hà tĩnh', 'hoan châu đệ nhất danh lam', 'núi hồng lĩnh'] },
      { name: 'Bãi biển Thiên Cầm', wikiQuery: 'Thiên Cầm', type: 'attraction', cost: 0, tags: ['thiên cầm', 'bãi biển', 'cung đàn trời', 'hải sản'] }
    ]
  }
]

/**
 * Fallback Unsplash image curated per destination if Wikipedia has no photo
 */
const DESTINATION_FALLBACK_IMAGES = {
  'Đà Nẵng': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
  'Huế': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80',
  'Quảng Trị': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80',
  'Khánh Hòa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
  'Lâm Đồng': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
  'Quảng Ngãi': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'Gia Lai': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
  'Đắk Lắk': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
  'Thanh Hóa': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  'Nghệ An': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80',
  'Hà Tĩnh': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
}

/**
 * Cào thông tin & ảnh từ Wikipedia REST API (Tiếng Việt)
 */
async function fetchWikiData(query) {
  try {
    const url = `https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    const res = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'CentralVietnamTravelBot/1.0 (contact@example.com)'
      }
    })

    const data = res.data
    return {
      description: data.extract || null,
      image: data.thumbnail?.source || data.originalimage?.source || null,
      lat: data.coordinates?.lat || null,
      lon: data.coordinates?.lon || null
    }
  } catch (err) {
    // Có thể thử tìm kiếm title qua search API nếu query ban đầu không khớp 100%
    return null
  }
}

async function startScrapingAndSeeding() {
  console.log('==================================================================')
  console.log('🚀 BẮT ĐẦU CÀO DỮ LIỆU & LÀM GIÀU ẢNH KHU DU LỊCH MIỀN TRUNG')
  console.log('   Nguồn: Wikipedia API + Unsplash Direct + Open Data')
  console.log('==================================================================\n')

  try {
    console.log('🔌 Đang kết nối tới cơ sở dữ liệu MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Kết nối MongoDB thành công!\n')

    let totalProcessed = 0
    let totalUpdated = 0
    let totalInserted = 0

    for (const group of TARGET_DESTINATIONS) {
      console.log(`\n📍 [${group.destination}] Đang xử lý ${group.places.length} điểm du lịch...`)

      for (const item of group.places) {
        totalProcessed++
        process.stdout.write(`   👉 ${item.name} ... `)

        // 1. Cào dữ liệu từ Wikipedia
        const wikiData = await fetchWikiData(item.wikiQuery || item.name)

        // 2. Chuẩn bị trường dữ liệu
        let description = wikiData?.description
        if (!description || description.length < 30) {
          description = `Điểm du lịch, thắng cảnh nổi tiếng tại ${group.destination}, mang vẻ đẹp thiên nhiên và giá trị văn hóa độc đáo của miền Trung.`
        }

        // Lấy link ảnh chất lượng cao (Wikipedia hoặc Unsplash Fallback)
        let imageUrl = wikiData?.image || DESTINATION_FALLBACK_IMAGES[group.destination]

        const updatePayload = {
          name: item.name,
          destination: group.destination,
          type: item.type,
          description: description,
          address: `${item.name}, ${group.destination}`,
          image: imageUrl,
          tags: item.tags,
          estimated_cost: item.cost,
          rating: Number((4.5 + Math.random() * 0.5).toFixed(1)) // 4.5 -> 5.0
        }

        if (wikiData?.lat && wikiData?.lon) {
          updatePayload.latitude = wikiData.lat
          updatePayload.longitude = wikiData.lon
        }

        // 3. Upsert vào Database (Tránh trùng lặp, tự động cập nhật nếu đã có)
        const existing = await Place.findOne({ name: item.name, destination: group.destination })
        if (existing) {
          await Place.updateOne({ _id: existing._id }, { $set: updatePayload })
          totalUpdated++
          console.log(`✅ [Đã cập nhật ảnh & mô tả]`)
        } else {
          await Place.create(updatePayload)
          totalInserted++
          console.log(`✨ [Đã thêm mới]`)
        }

        // Tạm nghỉ 200ms để tránh spam API
        await new Promise(r => setTimeout(r, 200))
      }
    }

    console.log('\n==================================================================')
    console.log(`🎉 HOÀN TẤT CÀO & LÀM GIÀU DỮ LIỆU!`)
    console.log(`   - Tổng địa điểm xử lý : ${totalProcessed}`)
    console.log(`   - Thêm mới            : ${totalInserted}`)
    console.log(`   - Đã làm giàu/cập nhật: ${totalUpdated}`)
    console.log('==================================================================\n')
  } catch (error) {
    console.error('❌ Lỗi khi thực thi cào dữ liệu:', error.message)
  }
}

module.exports = {
  runCrawlPlacesWithImages: startScrapingAndSeeding,
  fetchWikiData,
  TARGET_DESTINATIONS
}

if (require.main === module) {
  startScrapingAndSeeding().then(() => process.exit(0)).catch((err) => {
    console.error('❌ Lỗi:', err.message)
    process.exit(1)
  })
}


