const mongoose = require('mongoose')

const ActivitySchema = new mongoose.Schema({
  time: String,
  place: String,
  activity: String,
  estimated_cost: Number
}, { _id: false })

const DaySchema = new mongoose.Schema({
  day: Number,
  activities: [ActivitySchema]
}, { _id: false })

const BudgetSchema = new mongoose.Schema({
  hotel: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  transportation: { type: Number, default: 0 },
  tickets: { type: Number, default: 0 },
  reserve: { type: Number, default: 0 }
}, { _id: false })

const TripSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  destination: String,
  start_date: Date,
  end_date: Date,
  total_budget: Number,
  people: Number,
  interests: [String],
  transportation: String,
  hotel_request: String,
  budget_breakdown: { type: BudgetSchema, default: () => ({}) },
  days: [DaySchema],
  share_token: { type: String, unique: true, sparse: true, index: true },
  is_public: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Trip', TripSchema)
