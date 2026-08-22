const express = require('express')
const Place = require('../models/Place')

const router = express.Router()

const placesMau = [
  { name: 'Biển Mỹ Khê', destination: 'Đà Nẵng', type: 'attraction', description: 'Bãi biển phù hợp tắm biển và ngắm bình minh.', tags: ['biển', 'check-in'], estimated_cost: 0, rating: 4.6 },
  { name: 'Phở khô Pleiku', destination: 'Gia Lai', type: 'restaurant', description: 'Đặc sản hai tô nổi tiếng của Pleiku.', tags: ['ăn uống', 'đặc sản'], estimated_cost: 60000, rating: 4.5 },
  { name: "Biển Hồ T'Nưng", destination: 'Gia Lai', type: 'attraction', description: 'Điểm tham quan thiên nhiên gần Pleiku.', tags: ['thiên nhiên', 'check-in'], estimated_cost: 0, rating: 4.7 },
  { name: 'Cafe view sông Hàn', destination: 'Đà Nẵng', type: 'cafe', description: 'Không gian cafe ngắm thành phố.', tags: ['cafe', 'check-in'], estimated_cost: 70000, rating: 4.3 }
]

async function damBaoDuLieuMau(){
  await Promise.all(placesMau.map(place => Place.updateOne(
    { name: place.name, destination: place.destination },
    { $setOnInsert: place },
    { upsert: true }
  )))
}

router.get('/', async (req, res) => {
  const { destination, type, q } = req.query
  const filter = {}
  if(destination) filter.destination = new RegExp(destination, 'i')
  if(type) filter.type = type
  if(q) filter.$text = { $search: q }

  try{
    await damBaoDuLieuMau()
    const places = await Place.find(filter).sort({ rating: -1 }).limit(50).lean()
    res.json(places)
  }catch(err){
    res.status(500).json({ error: err.message || 'Không thể tìm địa điểm' })
  }
})

module.exports = router
