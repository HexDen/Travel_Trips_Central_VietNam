const express = require('express')
const Place = require('../models/Place')
const { crawlPlacesByAI } = require('../services/aiCrawlerService')

const router = express.Router()

// GET /api/places - Tìm kiếm địa điểm (Tự động kích hoạt AI Crawl nếu điểm đến chưa có trong DB)
router.get('/', async (req, res) => {
  const { destination, type, q } = req.query
  const filter = {}
  if (destination) filter.destination = new RegExp(destination, 'i')
  if (type) filter.type = type
  if (q) filter.$text = { $search: q }

  try {
    let places = await Place.find(filter).sort({ rating: -1 }).limit(50).lean()

    // Nếu tìm theo điểm đến cụ thể mà DB chưa có hoặc quá ít (< 3), tự động gọi AI Crawl ngay lập tức
    if (destination && places.length < 3) {
      console.log(`[Places API] Điểm đến "${destination}" có ít dữ liệu, kích hoạt AI Crawler ngay...`)
      await crawlPlacesByAI(destination)
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
