const mongoose = require('mongoose')

const DistanceMatrixSchema = new mongoose.Schema({
  origin: { type: String, required: true, index: true },
  destination: { type: String, required: true, index: true },
  distance_km: { type: Number, required: true },
  duration_hours: { type: Number, required: true },
  duration_text: { type: String },
  origin_coords: {
    lat: Number,
    lng: Number
  },
  dest_coords: {
    lat: Number,
    lng: Number
  },
  is_pre_merged: { type: Boolean, default: false },
  source: { type: String, default: 'OpenStreetMap OSRM' },
  updated_at: { type: Date, default: Date.now }
})

DistanceMatrixSchema.index({ origin: 1, destination: 1 }, { unique: true })

module.exports = mongoose.model('DistanceMatrix', DistanceMatrixSchema)
