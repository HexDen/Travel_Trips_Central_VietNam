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

router.get('/my-trips', requireAuth, async (req, res) => {
  try {
    const trips = await Trip.find({ owner: req.userId })
      .sort({ created_at: -1 })
      .lean()
    res.json(trips)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Không thể tải danh sách chuyến đi' })
  }
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

// Lưu chuyến đi vào tài khoản cá nhân
router.post('/my-trips', requireAuth, async (req, res) => {
  try {
    const data = req.body
    let trip = null
    const tid = data.tripId || data._id
    if (tid && String(tid).match(/^[0-9a-fA-F]{24}$/)) {
      trip = await Trip.findById(tid)
    }
    if (trip) {
      trip.owner = req.userId
      if (data.destination) trip.destination = data.destination
      if (data.total_budget) trip.total_budget = data.total_budget
      if (data.days) trip.days = data.days
      if (data.hotel_recommendation) trip.hotel_recommendation = data.hotel_recommendation
      if (data.budget_breakdown) trip.budget_breakdown = data.budget_breakdown
      trip.created_at = new Date()
      await trip.save()
      return res.json(trip)
    } else {
      const newTrip = new Trip({
        owner: req.userId,
        destination: data.destination,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        total_budget: data.total_budget,
        people: data.people || 1,
        interests: data.interests || [],
        selected_places: data.selected_places || [],
        transportation: data.transportation,
        hotel_request: data.hotel_request,
        hotel_recommendation: data.hotel_recommendation,
        budget_breakdown: data.budget_breakdown,
        days: data.days || data.daysList || []
      })
      const saved = await newTrip.save()
      return res.json(saved)
    }
  } catch (err) {
    console.error('Lỗi lưu trip:', err)
    res.status(500).json({ error: err.message || 'Không thể lưu chuyến đi' })
  }
})

// Xóa chuyến đi (chủ sở hữu hoặc bản nháp chưa lưu)
router.delete('/trips/:tripId', async (req, res) => {
  try {
    const tid = req.params.tripId
    // Xóa theo ID nếu là ObjectId hợp lệ
    if (String(tid).match(/^[0-9a-fA-F]{24}$/)) {
      await Trip.deleteOne({ _id: tid })
    }
    res.json({ success: true, message: 'Đã xóa chuyến đi thành công' })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Không thể xóa chuyến đi' })
  }
})

module.exports = router
