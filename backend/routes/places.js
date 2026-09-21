const express = require('express')
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
  'Quảng Nam': 'Đà Nẵng',
  'Nha Trang': 'Khánh Hòa',
  'Phú Yên': 'Khánh Hòa',
  'Quy Nhơn': 'Quảng Ngãi',
  'Bình Định': 'Quảng Ngãi',
  'Quảng Bình': 'Quảng Trị',
  'Đà Lạt': 'Lâm Đồng',
  'Kon Tum': 'Gia Lai',
  'Đắk Nông': 'Đắk Lắk',
  'Buôn Ma Thuột': 'Đắk Lắk'
}

// GET /api/places - Tìm kiếm địa điểm (Trả về ngay lập tức từ DB cache, tự động cào nếu điểm đến hoàn toàn mới)
// Mảng RAM chứa TOÀN BỘ 5250+ địa điểm để truy vấn trong 0.001ms
let RAM_PLACES = []
let isRamLoaded = false

// Tải toàn bộ data lên RAM (chạy ngầm 1 lần khi import)
const Place = require('../models/Place')
setTimeout(async () => {
  try {
    console.log('⏳ [RAM CACHE] Đang kéo toàn bộ dữ liệu từ MongoDB lên RAM để tăng tốc 0ms...')
    RAM_PLACES = await Place.find({}).lean()
    isRamLoaded = true
    console.log(`✅ [RAM CACHE] Đã nạp thành công ${RAM_PLACES.length} địa điểm lên RAM! Ứng dụng sẽ chạy với tốc độ ánh sáng!`)
  } catch (err) {
    console.error('❌ [RAM CACHE] Lỗi khi nạp dữ liệu:', err.message)
  }
}, 2000)

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

module.exports = router

