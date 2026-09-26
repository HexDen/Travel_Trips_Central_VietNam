const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const Place = require('../models/Place')

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  const total = await Place.countDocuments()
  const noImage = await Place.countDocuments({
    $or: [{ image: null }, { image: '' }, { image: { $exists: false } }]
  })
  const unsplashFallback = await Place.countDocuments({ image: { $regex: 'unsplash.com' } })
  const wikimedia = await Place.countDocuments({ image: { $regex: 'wikimedia.org' } })
  const googleMaps = await Place.countDocuments({ image: { $regex: 'googleusercontent.com' } })

  console.log('Tổng số địa điểm trong DB:', total)
  console.log('Địa điểm chưa có ảnh (null/rỗng):', noImage)
  console.log('Địa điểm dùng ảnh chung Unsplash:', unsplashFallback)
  console.log('Địa điểm có ảnh Wikimedia:', wikimedia)
  console.log('Địa điểm có ảnh Google Maps:', googleMaps)

  const dests = await Place.distinct('destination')
  console.log('\nThống kê theo từng tỉnh thành:')
  for (const d of dests) {
    const dTotal = await Place.countDocuments({ destination: d })
    const dUnsplash = await Place.countDocuments({ destination: d, image: { $regex: 'unsplash.com' } })
    const dNoImg = await Place.countDocuments({
      destination: d,
      $or: [{ image: null }, { image: '' }, { image: { $exists: false } }]
    })
    console.log(` - ${d.padEnd(14)}: Tổng ${dTotal} | Dùng ảnh chung Unsplash: ${dUnsplash} | Trống: ${dNoImg}`)
  }

  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
