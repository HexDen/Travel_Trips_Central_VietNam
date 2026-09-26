const mongoose = require('mongoose')

const TransitTicketSchema = new mongoose.Schema({
  type: { type: String, enum: ['bus', 'train', 'flight'], required: true, index: true },
  origin: { type: String, required: true, index: true },
  destination: { type: String, required: true, index: true },
  operator_name: { type: String, required: true },
  trip_code: { type: String },
  seat_class: { type: String, default: 'Tiêu chuẩn' },
  price: { type: Number, required: true },
  duration: { type: String },
  departure_time: { type: String },
  departure_station: { type: String },
  arrival_station: { type: String },
  hotline: { type: String },
  rating: { type: Number, default: 4.6 },
  reviews_count: { type: Number, default: 150 },
  badge: { type: String },
  amenities: [String],
  booking_source: { type: String, default: 'Traveloka & ĐSVN & Vexere' },
  created_at: { type: Date, default: Date.now }
})

TransitTicketSchema.index({ origin: 1, destination: 1, type: 1 })

module.exports = mongoose.model('TransitTicket', TransitTicketSchema)
