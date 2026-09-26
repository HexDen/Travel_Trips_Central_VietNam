const mongoose = require('mongoose')

const BusRouteSchema = new mongoose.Schema({
  origin: { type: String, required: true, index: true },
  destination: { type: String, required: true, index: true },
  operator_name: { type: String, required: true },
  bus_type: { type: String, default: 'Giường nằm chất lượng cao' },
  price: { type: Number, required: true },
  duration: { type: String },
  depart_times: { type: String },
  pickup_points: { type: String },
  dropoff_points: { type: String },
  hotline: { type: String },
  rating: { type: Number, default: 4.5 },
  reviews_count: { type: Number, default: 120 },
  badge: { type: String },
  is_pre_merged: { type: Boolean, default: false },
  source: { type: String, default: 'Vexere & Tổng cục Đường bộ' },
  created_at: { type: Date, default: Date.now }
})

BusRouteSchema.index({ origin: 1, destination: 1, operator_name: 1 })

module.exports = mongoose.model('BusRoute', BusRouteSchema)
