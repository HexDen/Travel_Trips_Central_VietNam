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
router.get('/', async (req, res) => {
  const { destination, type, q } = req.query
  const filter = {}
  if (type && type !== 'all') filter.type = type
  if (q) filter.$text = { $search: q }

  try {
    let places = []
    if (destination && destination.trim()) {
      let cleanDest = destination.trim()
      if (DESTINATION_ALIASES[cleanDest]) {
        cleanDest = DESTINATION_ALIASES[cleanDest]
      }

      // 1. Kiểm tra xem điểm đến này đã có dữ liệu trong DB chưa
      const totalForDest = await Place.countDocuments({ destination: new RegExp(`^${cleanDest}$`, 'i') })

      // 2. Nếu là điểm đến mới toanh chưa có trong CSDL (0 điểm), tự động cào ngầm bằng AI ngay
      if (totalForDest === 0) {
        console.log(`[AI Auto-Crawler] Điểm đến mới "${cleanDest}" chưa có trong DB, AI đang tự động cào dữ liệu...`)
        try {
          await crawlPlacesByAI(cleanDest)
        } catch (crawlErr) {
          console.warn(`[AI Auto-Crawler] Lỗi cào nhanh cho "${cleanDest}":`, crawlErr.message)
        }
      }

      // 3. Trả về kết quả từ DB (siêu nhanh < 30ms)
      places = await Place.find({ ...filter, destination: new RegExp(`^${cleanDest}$`, 'i') }).sort({ rating: -1 }).limit(500).lean()

      if (places.length === 0 && !filter.type) {
        places = await Place.find({ ...filter, destination: new RegExp(cleanDest, 'i') }).sort({ rating: -1 }).limit(500).lean()
      }
    } else {
      places = await Place.find(filter).sort({ rating: -1 }).limit(500).lean()
    }

    res.json(places)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Không thể tìm địa điểm' })
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

