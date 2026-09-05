const express = require('express')
const Place = require('../models/Place')
const { crawlPlacesByAI, crawlAllDestinations, CENTRAL_VIETNAM_DESTINATIONS } = require('../services/aiCrawlerService')

const router = express.Router()

// GET /api/places - Tìm kiếm địa điểm (Tự động kích hoạt AI Crawl nếu điểm đến có ít dữ liệu)
router.get('/', async (req, res) => {
  const { destination, type, q } = req.query
  const filter = {}
  if (type) filter.type = type
  if (q) filter.$text = { $search: q }

  try {
    let places = []
    if (destination && destination.trim()) {
      const cleanDest = destination.trim()
      // 1. Khớp chính xác tên tỉnh/thành phố
      places = await Place.find({ ...filter, destination: new RegExp(`^${cleanDest}$`, 'i') }).sort({ rating: -1 }).limit(100).lean()

      // 2. Nếu chưa có kết quả chính xác, tìm chứa từ
      if (places.length === 0) {
        places = await Place.find({ ...filter, destination: new RegExp(cleanDest, 'i') }).sort({ rating: -1 }).limit(100).lean()
      }

      // 3. Nếu vẫn có ít dữ liệu (< 10), tự động kích hoạt AI Crawler nạp sâu dữ liệu mới
      if (places.length < 10) {
        console.log(`[Places API] Điểm đến "${cleanDest}" hiện có ít dữ liệu (${places.length}), kích hoạt AI Crawler ngay...`)
        await crawlPlacesByAI(cleanDest)
        places = await Place.find({ ...filter, destination: new RegExp(`^${cleanDest}$`, 'i') }).sort({ rating: -1 }).limit(100).lean()
        if (places.length === 0) {
          places = await Place.find({ ...filter, destination: new RegExp(cleanDest, 'i') }).sort({ rating: -1 }).limit(100).lean()
        }
      }
    } else {
      places = await Place.find(filter).sort({ rating: -1 }).limit(100).lean()
    }

    res.json(places)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Không thể tìm địa điểm' })
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
    // Chạy ngầm hoặc trả về kết quả
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
