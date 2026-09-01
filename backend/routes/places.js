const express = require('express')
const Place = require('../models/Place')
const { crawlPlacesByAI } = require('../services/aiCrawlerService')

const router = express.Router()

// GET /api/places - Tìm kiếm địa điểm (Tự động kích hoạt AI Crawl nếu điểm đến chưa có trong DB)
router.get('/', async (req, res) => {
  const { destination, type, q } = req.query
  const filter = {}
  if (type) filter.type = type
  if (q) filter.$text = { $search: q }

  try {
    let places = []
    if (destination && destination.trim()) {
      const cleanDest = destination.trim()
      // 1. Ưu tiên khớp chính xác tên địa danh (ví dụ: "Quảng Bình" không bị lẫn với "Quảng Nam")
      places = await Place.find({ ...filter, destination: new RegExp(`^${cleanDest}$`, 'i') }).sort({ rating: -1 }).limit(50).lean()

      // 2. Nếu chưa có kết quả chính xác, tìm chứa từ
      if (places.length === 0) {
        places = await Place.find({ ...filter, destination: new RegExp(cleanDest, 'i') }).sort({ rating: -1 }).limit(50).lean()
      }

      // 3. Nếu vẫn có ít dữ liệu (< 3), kích hoạt AI Crawler nạp dữ liệu
      if (places.length < 3) {
        console.log(`[Places API] Điểm đến "${cleanDest}" có ít dữ liệu, kích hoạt AI Crawler ngay...`)
        await crawlPlacesByAI(cleanDest)
        places = await Place.find({ ...filter, destination: new RegExp(`^${cleanDest}$`, 'i') }).sort({ rating: -1 }).limit(50).lean()
        if (places.length === 0) {
          places = await Place.find({ ...filter, destination: new RegExp(cleanDest, 'i') }).sort({ rating: -1 }).limit(50).lean()
        }
      }
    } else {
      places = await Place.find(filter).sort({ rating: -1 }).limit(50).lean()
    }

    res.json(places)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Không thể tìm địa điểm' })
  }
})

// POST /api/places/crawl - Kích hoạt AI Crawl thủ công hoặc từ UI Admin
router.post('/crawl', async (req, res) => {
  const { destination } = req.body
  if (!destination) {
    return res.status(400).json({ error: 'Vui lòng cung cấp destination (ví dụ: "Đà Nẵng", "Huế")' })
  }

  try {
    const crawledPlaces = await crawlPlacesByAI(destination)
    res.json({
      success: true,
      message: `AI đã thu thập thành công ${crawledPlaces.length} địa điểm tại ${destination}`,
      data: crawledPlaces
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi AI Crawl dữ liệu' })
  }
})

module.exports = router
