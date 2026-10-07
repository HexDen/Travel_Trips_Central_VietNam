const express = require('express')
const router = express.Router()
const dichVuAI = require('../services/aiService')
const Trip = require('../models/Trip')
const Chat = require('../models/Chat')
const { optimizeBudgetAllocation, classifyTier } = require('../services/budgetOptimizerService')
const { optionalAuth } = require('../middleware/auth')

// API Dự toán và phân bổ ngân sách thông minh (theo 5 tầng T0 - T4)
router.post('/budget-estimate', (req, res) => {
  try {
    const { budget, days, people, actual_transit } = req.body
    const estimate = optimizeBudgetAllocation(budget, days, people, actual_transit)
    res.json(estimate)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi tính toán ngân sách' })
  }
})

// Create plan and save trip
router.post('/plan', optionalAuth, async (req, res) => {
  try {
    const duLieu = req.body

    // Kiểm tra tính khả thi của chuyến đi theo ngân sách (vd: 500k đi 10 ngày 2 người)
    const { checkTripFeasibility } = require('../services/budgetOptimizerService')
    const feasibility = checkTripFeasibility(
      duLieu.budget,
      duLieu.days,
      duLieu.people,
      duLieu.destination,
      duLieu.free_places_only
    )

    if (!feasibility.feasible && !duLieu.free_places_only) {
      return res.status(400).json({
        error: feasibility.message,
        is_unfeasible: true,
        feasibility
      })
    }

    const lichTrinh = await dichVuAI.taoLichTrinh(duLieu)
    // save to DB
    const doc = new Trip({
      owner: req.userId || null,
      destination: lichTrinh.destination,
      start_date: duLieu.start_date || null,
      end_date: duLieu.end_date || null,
      total_budget: lichTrinh.total_budget,
      people: lichTrinh.people,
      interests: duLieu.interests || lichTrinh.interests || [],
      selected_places: lichTrinh.selected_places || duLieu.selected_places || [],
      transportation: duLieu.transportation || lichTrinh.transportation,
      hotel_request: duLieu.hotel_request || lichTrinh.hotel_request,
      hotel_recommendation: lichTrinh.hotel_recommendation,
      budget_breakdown: lichTrinh.budget_breakdown,
      days: lichTrinh.days
    })
    const saved = await doc.save()
    // return trip id along with plan
    res.json({ ...lichTrinh, tripId: saved._id })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || 'lỗi nội bộ' })
  }
})

router.post('/replan', async (req, res) => {
  try{
    const { tripId, instruction } = req.body
    if(!tripId || !instruction) return res.status(400).json({ error: 'tripId và instruction bắt buộc' })
    const trip = await Trip.findById(tripId)
    if(!trip) return res.status(404).json({ error: 'Trip không tồn tại' })

    const days = await dichVuAI.taoLichTrinhLai({ trip, instruction })
    trip.days = days
    await trip.save()
    res.json({ tripId: trip._id, destination: trip.destination, days: trip.days })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || 'lỗi nội bộ' })
  }
})

router.get('/trips/:tripId', async (req, res) => {
  try{
    const trip = await Trip.findById(req.params.tripId)
    if(!trip) return res.status(404).json({ error: 'Trip không tồn tại' })
    res.json(trip)
  }catch(err){
    res.status(400).json({ error: 'tripId không hợp lệ' })
  }
})

// Chat endpoint: save user message and assistant reply (mock or via LLM)
router.post('/chat', async (req, res) => {
  try{
    const { tripId, message } = req.body
    if(!tripId || !message) return res.status(400).json({ error: 'tripId và message bắt buộc' })
    const trip = await Trip.findById(tripId)
    if(!trip) return res.status(404).json({ error: 'Trip không tồn tại' })

    // save user message
    await Chat.create({ trip: tripId, role: 'user', message })

    // get assistant reply (mock)
    const reply = await dichVuAI.taoPhanHoiChat({ message, trip })

    // save assistant message
    await Chat.create({ trip: tripId, role: 'assistant', message: reply })

    res.json({ reply })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || 'lỗi nội bộ' })
  }
})

module.exports = router
