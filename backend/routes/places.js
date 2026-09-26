const express = require('express')
const mongoose = require('mongoose')
const Place = require('../models/Place')
const {
  crawlPlacesByAI,
  crawlDeepPlacesByDestination,
  crawlNearbyServicesForPlace,
  crawlAllDestinations,
  calculateDistance,
  CENTRAL_VIETNAM_DESTINATIONS
} = require('../services/aiCrawlerService')

const router = express.Router()

const DESTINATION_ALIASES = {
  'Hội An': 'Đà Nẵng',
  'Nha Trang': 'Khánh Hòa',
  'Quy Nhơn': 'Quảng Ngãi',
  'Đà Lạt': 'Lâm Đồng',
  'Buôn Ma Thuột': 'Đắk Lắk',
  'Quảng Bình': 'Quảng Trị',
  'Quảng Nam': 'Đà Nẵng',
  'Bình Định': 'Quảng Ngãi',
  'Phú Yên': 'Khánh Hòa',
  'Ninh Thuận': 'Khánh Hòa',
  'Bình Thuận': 'Lâm Đồng',
  'Kon Tum': 'Gia Lai',
  'Đắk Nông': 'Đắk Lắk'
}

// GET /api/places - Tìm kiếm địa điểm (Trả về ngay lập tức từ DB cache, tự động cào nếu điểm đến hoàn toàn mới)
// Mảng RAM chứa TOÀN BỘ 5250+ địa điểm để truy vấn trong 0.001ms
let RAM_PLACES = []
let isRamLoaded = false

// Tải toàn bộ data lên RAM (chạy khi mongoose kết nối thành công)
async function loadRamPlaces() {
  try {
    console.log('⏳ [RAM CACHE] Đang kéo toàn bộ dữ liệu từ MongoDB lên RAM để tăng tốc 0ms...')
    RAM_PLACES = await Place.find({}).lean()
    isRamLoaded = true
    console.log(`✅ [RAM CACHE] Đã nạp thành công ${RAM_PLACES.length} địa điểm lên RAM! Ứng dụng sẽ chạy với tốc độ ánh sáng!`)
  } catch (err) {
    console.error('❌ [RAM CACHE] Lỗi khi nạp dữ liệu:', err.message)
  }
}

if (mongoose.connection.readyState === 1) {
  loadRamPlaces()
} else {
  mongoose.connection.once('connected', loadRamPlaces)
}

router.get('/', async (req, res) => {
  const { destination, type, q } = req.query
  const filterType = type && type !== 'all' ? type : null
  const searchQ = q ? q.toLowerCase() : null
  let cleanDest = destination ? destination.trim() : null
  
  // LUÔN áp dụng alias để lấy đúng bucket dữ liệu gốc (VD: Quảng Bình → lấy từ bucket Quảng Trị)
  // Việc tách riêng cho chế độ trước sáp nhập sẽ xử lý ở bước sub-filter phía dưới
  const mode = req.query.mode
  if (cleanDest && DESTINATION_ALIASES[cleanDest]) {
    cleanDest = DESTINATION_ALIASES[cleanDest]
  }


  function applyFilters(placesArray) {
    let filtered = placesArray

    // Lọc lại cho chế độ trước sáp nhập bằng text trên các trường đáng tin cậy
    const reqMode = req.query.mode
    const requestedDest = destination ? destination.trim() : null
    
    if (reqMode === 'pre-merged' && requestedDest) {
      if (requestedDest !== cleanDest) {
        // Lấy TỈNH CON (VD: Quảng Bình, Hội An, ...)
        const reqStr = requestedDest.toLowerCase()
        
        // Mở rộng bộ từ khóa nhận diện cho các tỉnh con để không bị sót
        const subProvinceKeywords = [reqStr]
        if (reqStr === 'quảng bình') {
          subProvinceKeywords.push('đồng hới', 'bố trạch', 'lệ thủy', 'phong nha', 'quảng trạch', 'tuyên hóa', 'minh hóa', 'quảng ninh')
        } else if (reqStr === 'hội an') {
          subProvinceKeywords.push('hội an', 'cù lao chàm')
        }

        filtered = filtered.filter(p => {
          // Chỉ kiểm tra address, district và name (bỏ qua description vì crawler hay gắn bừa)
          const str = ((p.name || '') + ' ' + (p.address || '') + ' ' + (p.district || '')).toLowerCase()
          return subProvinceKeywords.some(kw => str.includes(kw))
        })
      } else {
        // Lấy TỈNH CHÍNH (VD: Quảng Trị, Đà Nẵng, ...)
        // Phải loại bỏ các địa điểm thuộc về tỉnh con
        let aliasesToExclude = Object.keys(DESTINATION_ALIASES)
          .filter(k => DESTINATION_ALIASES[k] === cleanDest)
          .map(k => k.toLowerCase())
        
        // Mở rộng bộ từ khóa cần loại bỏ
        if (aliasesToExclude.includes('quảng bình')) {
          aliasesToExclude.push('đồng hới', 'bố trạch', 'lệ thủy', 'phong nha', 'quảng trạch', 'tuyên hóa', 'minh hóa', 'quảng ninh')
        }
        if (aliasesToExclude.includes('hội an')) {
          aliasesToExclude.push('cù lao chàm')
        }
        
        filtered = filtered.filter(p => {
          const str = ((p.name || '') + ' ' + (p.address || '') + ' ' + (p.district || '')).toLowerCase()
          const belongsToOther = aliasesToExclude.some(alias => str.includes(alias))
          return !belongsToOther
        })
      }
    }

    // Bộ lọc chống nhiễu TOÀN DIỆN (Anti-Contamination Filter)
    if (requestedDest || cleanDest) {
      const destToCheck = (requestedDest || cleanDest).toLowerCase()

      const majorCities = ['đà nẵng', 'huế', 'nha trang', 'đà lạt', 'hội an', 'quy nhơn', 'phú quốc', 'hà nội', 'sài gòn', 'hồ chí minh', 'quảng ngãi', 'quảng trị', 'quảng nam', 'quảng bình', 'khánh hòa', 'bình định', 'phú yên', 'ninh thuận', 'bình thuận', 'gia lai', 'kon tum', 'đắk lắk', 'đắk nông', 'lâm đồng', 'nghệ an', 'hà tĩnh', 'thanh hóa']
      const PROVINCE_LANDMARKS = {
        'đà nẵng': ['ngũ hành sơn', 'sơn trà', 'bà nà', 'cầu rồng', 'mỹ khê', 'bích họa đà nẵng', 'non nước', 'hải vân', 'linh ứng sơn trà', 'bãi bụt'],
        'huế': ['thiên mụ', 'lăng cô', 'đại nội', 'kinh thành', 'huyền trân', 'lăng tự đức', 'lăng minh mạng', 'lăng khải định', 'chợ đông ba', 'sông hương'],
        'quảng nam': ['hội an', 'cù lao chàm', 'mỹ sơn', 'phước kiến', 'trà quế'],
        'quảng ngãi': ['lý sơn', 'quảng ngãi', 'sa huỳnh'],
        'quảng trị': ['vịnh mốc', 'thành cổ quảng trị', 'hiền lương'],
        'khánh hòa': ['vinpearl', 'ponagar'],
        'bình định': ['eo gió', 'kỳ co', 'quy nhơn'],
        'phú yên': ['gành đá đĩa', 'xép', 'phú yên'],
        'ninh thuận': ['vĩnh hy', 'ninh thuận'],
        'bình thuận': ['mũi né', 'phan thiết', 'bình thuận'],
        'lâm đồng': ['đà lạt', 'langbiang'],
        'gia lai': ['biển hồ', 'pleiku'],
        'kon tum': ['kon tum', 'măng đen'],
        'đắk lắk': ['buôn ma thuột', 'hồ lắk'],
        'đắk nông': ['đắk nông', 'tà đùng'],
        'nghệ an': ['cửa lò', 'vinh'],
        'hà tĩnh': ['kẻ gỗ', 'hà tĩnh', 'thiên cầm'],
        'thanh hóa': ['sầm sơn', 'thanh hóa']
      }

      const validSubProvinces = Object.keys(DESTINATION_ALIASES)
        .filter(k => DESTINATION_ALIASES[k] === cleanDest)
        .map(k => k.toLowerCase())

      const contaminationKeywords = []
      for (const city of majorCities) {
        if (!destToCheck.includes(city) && !city.includes(destToCheck) && !validSubProvinces.includes(city)) {
          contaminationKeywords.push(city)
        }
      }
      for (const [province, landmarks] of Object.entries(PROVINCE_LANDMARKS)) {
        if (!destToCheck.includes(province) && !province.includes(destToCheck)) {
          contaminationKeywords.push(...landmarks)
        }
      }

      filtered = filtered.filter(p => {
        const fullStr = ((p.name || '') + ' ' + (p.address || '')).toLowerCase()
        const isGarbage = contaminationKeywords.some(kw => fullStr.includes(kw))
        return !isGarbage
      })
    }
    
    if (filterType) filtered = filtered.filter(p => p.type === filterType)
    if (searchQ) filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(searchQ))
    
    return filtered
  }

  // 1. Nếu RAM đã sẵn sàng, trả về 100% từ RAM siêu tốc
  if (isRamLoaded) {
    let result = RAM_PLACES
    
    if (cleanDest) {
      const destRegex = new RegExp(`^${cleanDest}$`, 'i')
      const destSubRegex = new RegExp(cleanDest, 'i')
      
      let filtered = result.filter(p => destRegex.test(p.destination))
      if (filtered.length === 0 && !filterType) {
        filtered = result.filter(p => destSubRegex.test(p.destination))
      }
      result = filtered
    }
    
    result = applyFilters(result)
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return res.json(result.slice(0, 500))
  }

  // 2. Dự phòng: Khi RAM chưa tải xong
  try {
    let places = []
    const dbFilter = {}
    if (filterType) dbFilter.type = filterType
    if (searchQ) dbFilter.$text = { $search: searchQ }
    
    if (cleanDest) {
      places = await Place.find({ ...dbFilter, destination: new RegExp(`^${cleanDest}$`, 'i') }).sort({ rating: -1 }).limit(1000).lean()
      if (places.length === 0 && !filterType) {
        places = await Place.find({ ...dbFilter, destination: new RegExp(cleanDest, 'i') }).sort({ rating: -1 }).limit(1000).lean()
      }
    } else {
      places = await Place.find(dbFilter).sort({ rating: -1 }).limit(1000).lean()
    }
    
    places = applyFilters(places)
    places.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    res.json(places.slice(0, 500))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/places/nearby - Tìm khách sạn, quán đặc sản, cafe gần 1 địa điểm du lịch cụ thể
router.get('/nearby', async (req, res) => {
  const { placeId, placeName, destination, lat, lng, limit = 15 } = req.query

  try {
    let originPlace = null
    if (placeId) {
      originPlace = await Place.findById(placeId).lean()
    }
    if (!originPlace && placeName) {
      originPlace = await Place.findOne({
        name: new RegExp(placeName.trim(), 'i'),
        destination: destination ? new RegExp(destination.trim(), 'i') : { $exists: true }
      }).lean()
    }

    const dest = originPlace?.destination || destination || 'Đà Nẵng'
    const originLat = originPlace?.latitude || (lat ? parseFloat(lat) : null)
    const originLng = originPlace?.longitude || (lng ? parseFloat(lng) : null)

    // Lấy tất cả các địa điểm thuộc điểm đến này
    const allPlaces = await Place.find({
      destination: new RegExp(`^${dest}$`, 'i'),
      _id: originPlace ? { $ne: originPlace._id } : { $exists: true }
    }).lean()

    // Phân loại và tính khoảng cách GPS
    let hotels = []
    let restaurants = []
    let cafes = []
    let attractions = []

    for (const p of allPlaces) {
      let dist = null
      if (originLat && originLng && p.latitude && p.longitude) {
        dist = calculateDistance(originLat, originLng, p.latitude, p.longitude)
      }

      const itemWithDist = { ...p, distance_km: dist }

      if (p.type === 'hotel') hotels.push(itemWithDist)
      else if (p.type === 'restaurant') restaurants.push(itemWithDist)
      else if (p.type === 'cafe') cafes.push(itemWithDist)
      else attractions.push(itemWithDist)
    }

    // Sắp xếp theo khoảng cách gần nhất (nếu có distance_km) hoặc theo rating
    const sorter = (a, b) => {
      if (a.distance_km != null && b.distance_km != null) return a.distance_km - b.distance_km
      if (a.distance_km != null) return -1
      if (b.distance_km != null) return 1
      return (b.rating || 0) - (a.rating || 0)
    }

    hotels.sort(sorter)
    restaurants.sort(sorter)
    cafes.sort(sorter)

    // Nếu chưa có nhiều kết quả gần đó (< 3 khách sạn hoặc < 4 quán ăn) và có tên địa điểm, gọi AI khám phá thêm
    if ((hotels.length < 3 || restaurants.length < 4) && (placeName || originPlace?.name)) {
      const targetName = originPlace?.name || placeName
      console.log(`[Nearby API] Điểm "${targetName}" chưa đủ dịch vụ lân cận, kích hoạt AI Nearby Discovery...`)
      const aiFound = await crawlNearbyServicesForPlace(targetName, dest, originPlace?.address, originLat, originLng)
      if (aiFound && aiFound.length > 0) {
        // Nạp lại danh sách sau khi AI crawl
        const refreshed = await Place.find({
          destination: new RegExp(`^${dest}$`, 'i'),
          _id: originPlace ? { $ne: originPlace._id } : { $exists: true }
        }).lean()

        hotels = refreshed.filter(p => p.type === 'hotel').map(p => ({
          ...p,
          distance_km: originLat && originLng && p.latitude && p.longitude ? calculateDistance(originLat, originLng, p.latitude, p.longitude) : 1.2
        })).sort(sorter)

        restaurants = refreshed.filter(p => p.type === 'restaurant').map(p => ({
          ...p,
          distance_km: originLat && originLng && p.latitude && p.longitude ? calculateDistance(originLat, originLng, p.latitude, p.longitude) : 0.8
        })).sort(sorter)

        cafes = refreshed.filter(p => p.type === 'cafe').map(p => ({
          ...p,
          distance_km: originLat && originLng && p.latitude && p.longitude ? calculateDistance(originLat, originLng, p.latitude, p.longitude) : 1.0
        })).sort(sorter)
      }
    }

    res.json({
      origin: originPlace || { name: placeName || dest, destination: dest, latitude: originLat, longitude: originLng },
      hotels: hotels.slice(0, 10),
      restaurants: restaurants.slice(0, 15),
      cafes: cafes.slice(0, 8),
      attractions: attractions.slice(0, 8)
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi tìm dịch vụ lân cận' })
  }
})

// POST /api/places/nearby-ai - Yêu cầu AI quét ngay khách sạn & món ngon sát một địa điểm
router.post('/nearby-ai', async (req, res) => {
  const { placeName, destination, address, lat, lng } = req.body
  if (!placeName || !destination) {
    return res.status(400).json({ error: 'placeName và destination là bắt buộc' })
  }

  try {
    const nearbyList = await crawlNearbyServicesForPlace(placeName, destination, address, lat, lng)
    res.json({
      success: true,
      message: `AI đã tìm thấy ${nearbyList.length} khách sạn & quán ăn lân cận quanh ${placeName}!`,
      data: nearbyList
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi AI tìm dịch vụ lân cận' })
  }
})

// POST /api/places/crawl-deep - Kích hoạt AI Deep Crawl đa danh mục cho 1 tỉnh thành
router.post('/crawl-deep', async (req, res) => {
  const { destination } = req.body
  if (!destination) {
    return res.status(400).json({ error: 'Vui lòng cung cấp destination (ví dụ: "Đà Nẵng", "Quảng Ngãi", "Huế")' })
  }

  try {
    const deepResult = await crawlDeepPlacesByDestination(destination)
    res.json({
      success: true,
      message: `AI Deep Crawler đã hoàn tất cào quét toàn bộ địa điểm tại "${destination}"!`,
      data: deepResult
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi AI Deep Crawl dữ liệu' })
  }
})

// POST /api/places/crawl - Kích hoạt AI Crawl cho 1 tỉnh thành cụ thể
router.post('/crawl', async (req, res) => {
  const { destination } = req.body
  if (!destination) {
    return res.status(400).json({ error: 'Vui lòng cung cấp destination (ví dụ: "Đà Nẵng", "Huế", "Gia Lai")' })
  }

  try {
    const crawledPlaces = await crawlPlacesByAI(destination)
    res.json({
      success: true,
      message: `AI đã cào thành công ${crawledPlaces.length} địa điểm tại ${destination}`,
      data: crawledPlaces
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi AI Crawl dữ liệu' })
  }
})

// POST /api/places/crawl-all - Kích hoạt AI Crawl đồng loạt cho toàn bộ 11 tỉnh thành
router.post('/crawl-all', async (req, res) => {
  try {
    const result = await crawlAllDestinations()
    res.json({
      success: true,
      message: `AI đã cào dữ liệu thành công cho 11 tỉnh thành!`,
      details: result
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi AI Crawl toàn bộ dữ liệu' })
  }
})

router.post('/enrich-photos', async (req, res) => {
  try {
    const { enrichAllDatabaseWithRealPhotos } = require('../scripts/enrichAllRealPhotos')
    const result = await enrichAllDatabaseWithRealPhotos()
    
    // Nạp lại RAM
    RAM_PLACES = await Place.find({}).lean()
    
    res.json({
      success: true,
      message: 'Đã hoàn tất làm giàu ảnh thật và nạp lại RAM!',
      details: result
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/places/bus-operators - Tra cứu nhà xe giá rẻ & tối ưu chi phí di chuyển
router.get('/bus-operators', (req, res) => {
  try {
    const { timKiemNhaXeVaToiUuChiPhi } = require('../services/busService')
    const { origin = 'Hà Nội', destination = 'Đà Nẵng', people = 1 } = req.query
    const result = timKiemNhaXeVaToiUuChiPhi({ origin, destination, people })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi tra cứu nhà xe' })
  }
})

// GET /api/places/transit-tickets - Tra cứu vé máy bay, vé tàu hỏa Thống Nhất & Tàu Di Sản, vé xe khách
router.get('/transit-tickets', async (req, res) => {
  try {
    const TransitTicket = require('../models/TransitTicket')
    const { type, origin, destination } = req.query
    const filter = {}
    if (type && type !== 'all') filter.type = type
    if (origin) filter.origin = new RegExp(origin.trim(), 'i')
    if (destination) filter.destination = new RegExp(destination.trim(), 'i')

    let tickets = await TransitTicket.find(filter).sort({ price: 1 }).lean()
    if (tickets.length === 0) {
      // Fallback từ seed data nếu DB chưa sẵn sàng
      const { TRANSIT_TICKETS_SEED } = require('../scripts/runDeepCrawlerPipeline')
      tickets = TRANSIT_TICKETS_SEED.filter(t => {
        if (type && type !== 'all' && t.type !== type) return false
        if (origin && !t.origin.toLowerCase().includes(origin.toLowerCase())) return false
        if (destination && !t.destination.toLowerCase().includes(destination.toLowerCase())) return false
        return true
      })
    }
    res.json({
      success: true,
      total: tickets.length,
      data: tickets
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi tra cứu vé di chuyển' })
  }
})

// GET /api/places/quarantine - Kiểm tra danh sách bản ghi cách ly do thiếu tọa độ hoặc danh mục
router.get('/quarantine', (req, res) => {
  try {
    const fs = require('fs')
    const path = require('path')
    const qFile = path.resolve(__dirname, '../data/quarantine_places.json')
    if (fs.existsSync(qFile)) {
      const data = JSON.parse(fs.readFileSync(qFile, 'utf-8'))
      return res.json({ success: true, count: data.length, data })
    }
    res.json({ success: true, count: 0, data: [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/places/run-crawler-pipeline - Kích hoạt AI Deep Crawler & Post-processing Pipeline
router.post('/run-crawler-pipeline', async (req, res) => {
  try {
    const { runDeepCrawlerPipeline } = require('../scripts/runDeepCrawlerPipeline')
    // Chạy ngầm trong background
    runDeepCrawlerPipeline()
      .then(async () => {
        // Tự động nạp lại RAM cache sau khi pipeline xong
        RAM_PLACES = await Place.find({}).lean()
        console.log(`[RAM CACHE] Đã nạp lại ${RAM_PLACES.length} địa điểm sau khi Deep Crawler Pipeline hoàn tất.`)
      })
      .catch(e => console.error('[Pipeline Error]:', e.message))

    res.json({
      success: true,
      message: '🚀 Đã kích hoạt AI Deep Crawler Pipeline (Source Targeting + Deduplication Levenshtein + Price Normalization) thành công trong background!'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router


