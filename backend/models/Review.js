const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000 },
  created_at: { type: Date, default: Date.now }
})

ReviewSchema.index({ place: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('Review', ReviewSchema)
