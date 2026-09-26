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
  // Bổ sung thêm 5 nhóm dữ liệu & trường theo chiến lược Gom nguồn cào
  open_hours: String,       // Giờ mở/đóng cửa thực tế
  dwell_time: String,       // Thời gian lưu lại trung bình (VD: 1.5 - 2 tiếng)
  best_time: String,        // Khung giờ lý tưởng (VD: Check-in bình minh 05:00 - 06:30)
  is_indoor: Boolean,       // Trong nhà / Ngoài trời (phục vụ tính năng tránh mưa)
  signature_dishes: [String], // Món ăn đặc trưng (Signature dishes)
  signature_highlight: String, // Món tủ / Món đặc trưng nhất (Foody/ShopeeFood)
  price_range: String,      // Khoảng giá thực tế (VD: 35.000đ - 55.000đ)
  ticket_price: Number,     // Giá vé tham quan niêm yết chính thức (Cổng thông tin du lịch)
  dress_code: String,       // Yêu cầu trang phục (VD: Trang phục lịch sự, kín đáo)
  closing_days: String,     // Lịch đóng cửa định kỳ (VD: Đóng cửa thứ Hai, mở cửa cả tuần)
  reviews_count: Number,    // Số lượng đánh giá Google Maps
  source_target: String,    // Nguồn dữ liệu đích (Foody, Cổng thông tin du lịch, Google Maps)
  district: String,         // Phân vùng cụm / micro-district
  created_at: { type: Date, default: Date.now }
})

PlaceSchema.index({ name: 'text', description: 'text', tags: 'text' })

module.exports = mongoose.model('Place', PlaceSchema)
