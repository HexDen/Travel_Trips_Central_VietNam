const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const Place = require('../models/Place')

async function findPlacesNeedingImages() {
  await mongoose.connect(process.env.MONGODB_URI)
  const places = await Place.find({
    $or: [
      { image: null },
      { image: '' },
      { image: { $exists: false } },
      { image: { $regex: 'unsplash.com' } }
    ]
  }).select('name destination type address image').lean()

  console.log(`Tìm thấy ${places.length} địa điểm cần cào / cập nhật ảnh thực tế:`)
  places.forEach((p, idx) => {
    console.log(`[${idx + 1}] [${p.destination}] [${p.type}] ${p.name} -> Hiện tại: ${p.image ? 'Unsplash chung' : 'TRỐNG'}`)
  })

  process.exit(0)
}

findPlacesNeedingImages().catch(e => {
  console.error(e)
  process.exit(1)
})
