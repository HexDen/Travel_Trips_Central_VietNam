const express = require('express')
const crypto = require('crypto')
const User = require('../models/User')
const Place = require('../models/Place')
const Review = require('../models/Review')
const Trip = require('../models/Trip')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/public-trips', async (req, res) => {
  const trips = await Trip.find({ is_public: true })
    .select('destination total_budget people interests days created_at')
    .sort({ created_at: -1 })
    .limit(12)
    .lean()
  res.json(trips)
})

router.get('/favorites', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).populate('favorite_places')
  res.json(user?.favorite_places || [])
})

router.post('/favorites/:placeId', requireAuth, async (req, res) => {
  const place = await Place.findById(req.params.placeId)
  if(!place) return res.status(404).json({ error: 'Địa điểm không tồn tại' })
  const user = await User.findById(req.userId)
  const index = user.favorite_places.findIndex(id => id.toString() === place._id.toString())
  if(index >= 0) user.favorite_places.splice(index, 1)
  else user.favorite_places.push(place._id)
  await user.save()
  res.json({ favorite: index < 0, placeId: place._id })
})

router.get('/places/:placeId/reviews', async (req, res) => {
  const reviews = await Review.find({ place: req.params.placeId }).populate('user', 'name').sort({ created_at: -1 })
  res.json(reviews)
})

router.post('/places/:placeId/reviews', requireAuth, async (req, res) => {
  const { rating, comment } = req.body
  if(!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5){
    return res.status(400).json({ error: 'Điểm đánh giá phải từ 1 đến 5' })
  }
  const place = await Place.findById(req.params.placeId)
  if(!place) return res.status(404).json({ error: 'Địa điểm không tồn tại' })
  const review = await Review.findOneAndUpdate(
    { place: place._id, user: req.userId },
    { rating: Number(rating), comment: comment || '' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('user', 'name')
  const stats = await Review.aggregate([
    { $match: { place: place._id } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ])
  if(stats[0]) await Place.findByIdAndUpdate(place._id, { rating: Number(stats[0].average.toFixed(1)) })
  res.status(201).json(review)
})

router.post('/trips/:tripId/share', requireAuth, async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.userId })
  if(!trip) return res.status(404).json({ error: 'Chuyến đi không tồn tại hoặc không thuộc tài khoản' })
  trip.share_token = trip.share_token || crypto.randomBytes(18).toString('hex')
  trip.is_public = true
  await trip.save()
  res.json({ share_token: trip.share_token, url: `/shared/${trip.share_token}` })
})

router.get('/trips/shared/:token', async (req, res) => {
  const trip = await Trip.findOne({ share_token: req.params.token, is_public: true })
    .select('-owner -share_token')
  if(!trip) return res.status(404).json({ error: 'Liên kết chia sẻ không tồn tại' })
  res.json(trip)
})

module.exports = router
