const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  role: { type: String, enum: ['user','assistant'] },
  message: String,
  created_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Chat', ChatSchema)
