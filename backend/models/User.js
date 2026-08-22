const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  interests: [String],
  favorite_places: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
  created_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', UserSchema)
