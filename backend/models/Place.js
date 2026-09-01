const mongoose = require('mongoose')

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true, index: true },
  type: { type: String, enum: ['attraction', 'restaurant', 'hotel', 'cafe'], required: true },
  description: String,
  address: String,
  image: String,
  tags: [String],
  estimated_cost: Number,
  latitude: Number,
  longitude: Number,
  rating: Number,
  created_at: { type: Date, default: Date.now }
})

PlaceSchema.index({ name: 'text', description: 'text', tags: 'text' })

module.exports = mongoose.model('Place', PlaceSchema)
