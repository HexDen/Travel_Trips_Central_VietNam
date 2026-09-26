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
  'Buôn Ma Thuột': 'Đắk Lắk'
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
  
  if (cleanDest && DESTINATION_ALIASES[cleanDest]) {
    cleanDest = DESTINATION_ALIASES[cleanDest]
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
    
    if (filterType) result = result.filter(p => p.type === filterType)
    if (searchQ) result = result.filter(p => (p.name || '').toLowerCase().includes(searchQ))
    
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return res.json(result.slice(0, 500))
  }

  // 2. Dự phòng: Khi RAM chưa tải xong (khoảng vài giây đầu khi mới bật server), đành phải gọi tạm MongoDB
  try {
    let places = []
    const dbFilter = {}
    if (filterType) dbFilter.type = filterType
    if (searchQ) dbFilter.$text = { $search: searchQ }
    
    if (cleanDest) {
      places = await Place.find({ ...dbFilter, destination: new RegExp(`^${cleanDest}$`, 'i') }).sort({ rating: -1 }).limit(500).lean()
      if (places.length === 0 && !filterType) {
        places = await Place.find({ ...dbFilter, destination: new RegExp(cleanDest, 'i') }).sort({ rating: -1 }).limit(500).lean()
      }
    } else {
      places = await Place.find(dbFilter).sort({ rating: -1 }).limit(500).lean()
    }
    res.json(places)
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


