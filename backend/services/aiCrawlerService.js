const axios = require('axios')
const Place = require('../models/Place')

const CENTRAL_VIETNAM_DESTINATIONS = [
  'Đà Nẵng',
  'Hội An',
  'Huế',
  'Quy Nhơn',
  'Phú Yên',
  'Nha Trang',
  'Quảng Bình',
  'Gia Lai',
  'Đà Lạt',// Dữ liệu mẫu chuẩn phong phú cho Miền Trung kèm địa chỉ cụ thể
const MOCK_CENTRAL_PLACES = {
  'Đà Nẵng': [
    { name: 'Bãi biển Mỹ Khê', type: 'attraction', address: 'Đường Võ Nguyên Giáp, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng', description: 'Top bãi biển quyến rũ nhất hành tinh, cát trắng mịn và biển êm.', tags: ['biển', 'check-in', 'tắm biển'], estimated_cost: 0, latitude: 16.0592, longitude: 108.2467, rating: 4.8 },
    { name: 'Bà Nà Hills & Cầu Vàng', type: 'attraction', address: 'Thôn An Sơn, Xã Hòa Ninh, H. Hòa Vang, Đà Nẵng', description: 'Khu du lịch trên đỉnh núi Chúa với biểu tượng Cầu Vàng bàn tay khổng lồ.', tags: ['check-in', 'cảnh đẹp', 'cáp treo'], estimated_cost: 900000, latitude: 15.9958, longitude: 107.9965, rating: 4.9 },
    { name: 'Bán đảo Sơn Trà & Chùa Linh Ứng', type: 'attraction', address: 'Bán đảo Sơn Trà, P. Thọ Quang, Q. Sơn Trà, Đà Nẵng', description: 'Tượng Phật Bà Quan Âm cao nhất Việt Nam, ngắm toàn cảnh vịnh Đà Nẵng.', tags: ['tâm linh', 'thiên nhiên', 'view đẹp'], estimated_cost: 0, latitude: 16.1009, longitude: 108.2764, rating: 4.7 },
    { name: 'Bánh tráng cuốn thịt heo Quán Trần', type: 'restaurant', address: '04 Lê Duẩn, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', description: 'Đặc sản thịt heo hai đầu da chấm mắm nêm đậm đà trứ danh.', tags: ['đặc sản', 'ẩm thực', 'ăn trưa'], estimated_cost: 150000, latitude: 16.0683, longitude: 108.2167, rating: 4.6 },
    { name: 'Hải sản Bé Mặn', type: 'restaurant', address: 'Lô 11 Võ Nguyên Giáp, P. Mân Thái, Q. Sơn Trà, Đà Nẵng', description: 'Quán hải sản tươi sống đông đúc bên bờ biển Võ Nguyên Giáp.', tags: ['hải sản', 'ăn tối', 'tươi sống'], estimated_cost: 350000, latitude: 16.0645, longitude: 108.2469, rating: 4.5 },
    { name: 'Cộng Cà Phê Bạch Đằng', type: 'cafe', address: '96-98 Bạch Đằng, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', description: 'Quán cafe phong cách retro view trực diện dòng sông Hàn thơ mộng.', tags: ['cafe', 'view sông', 'check-in'], estimated_cost: 65000, latitude: 16.0688, longitude: 108.2233, rating: 4.5 },
    { name: 'Khách sạn Sala Danang Beach Hotel', type: 'hotel', address: '36-38 Lâm Hoành, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng', description: 'Khách sạn 4 sao sát biển với hồ bơi vô cực ngắm trọn bình minh.', tags: ['khách sạn', 'hồ bơi', 'view biển'], estimated_cost: 1200000, latitude: 16.0610, longitude: 108.2440, rating: 4.7 }
  ],
  'Hội An': [
    { name: 'Phố cổ Hội An & Chùa Cầu', type: 'attraction', address: 'Đường Nguyễn Thị Minh Khai, P. Minh An, TP. Hội An, Quảng Nam', description: 'Di sản văn hóa thế giới với những ngôi nhà cổ sơn vàng và đèn lồng lung linh.', tags: ['di sản', 'phố cổ', 'check-in'], estimated_cost: 120000, latitude: 15.8778, longitude: 108.3262, rating: 4.9 },
    { name: 'Rừng dừa Bảy Mẫu Cẩm Thanh', type: 'attraction', address: 'Tổ 2, Thôn Cần Nhân, Xã Cẩm Thanh, TP. Hội An, Quảng Nam', description: 'Trải nghiệm đi thuyền thúng múa xoay trên sông nước miền Tây thu nhỏ.', tags: ['trải nghiệm', 'thuyền thúng', 'vui chơi'], estimated_cost: 150000, latitude: 15.8672, longitude: 108.3655, rating: 4.6 },
    { name: 'Bánh mì Madam Khánh (The Banh Mi Queen)', type: 'restaurant', address: '115 Trần Cao Vân, P. Minh An, TP. Hội An, Quảng Nam', description: 'Bánh mì ngon nức tiếng Hội An với nhân pate, thịt xá xíu đậm đà.', tags: ['bánh mì', 'ăn sáng', 'nổi tiếng'], estimated_cost: 35000, latitude: 15.8821, longitude: 108.3289, rating: 4.8 },
    { name: 'Cơm gà Bà Buội', type: 'restaurant', address: '22 Phan Chu Trinh, P. Minh An, TP. Hội An, Quảng Nam', description: 'Quán cơm gà gia truyền hơn 60 năm với hạt cơm vàng óng và thịt gà ta xé.', tags: ['cơm gà', 'đặc sản', 'ăn trưa'], estimated_cost: 60000, latitude: 15.8795, longitude: 108.3308, rating: 4.6 },
    { name: 'Faifo Coffee', type: 'cafe', address: '130 Trần Phú, P. Minh An, TP. Hội An, Quảng Nam', description: 'Quán cafe sân thượng ngắm toàn cảnh mái ngói âm dương phố cổ nổi tiếng.', tags: ['cafe', 'rooftop', 'check-in'], estimated_cost: 75000, latitude: 15.8772, longitude: 108.3281, rating: 4.7 },
    { name: 'La Siesta Hoi An Resort & Spa', type: 'hotel', address: '132 Hùng Vương, P. Cẩm Phô, TP. Hội An, Quảng Nam', description: 'Resort nghỉ dưỡng xanh mát, hồ bơi nước mặn và dịch vụ đẳng cấp.', tags: ['resort', 'nghỉ dưỡng', 'spa'], estimated_cost: 1800000, latitude: 15.8789, longitude: 108.3182, rating: 4.9 }
  ],
  'Huế': [
    { name: 'Đại Nội Huế (Hoàng Thành Huế)', type: 'attraction', address: 'Đường 23/8, P. Thuận Hòa, TP. Huế, Thừa Thiên Huế', description: 'Quần thể di tích Cố đô triều Nguyễn với cung điện, đền đài uy nghiêm.', tags: ['lịch sử', 'di sản', 'văn hóa'], estimated_cost: 200000, latitude: 16.4695, longitude: 107.5786, rating: 4.8 },
    { name: 'Chùa Thiên Mụ & Sông Hương', type: 'attraction', address: 'Đường Nguyễn Phúc Nguyên, P. Hương Long, TP. Huế, Thừa Thiên Huế', description: 'Ngôi chùa cổ kính hơn 400 năm tuổi soi bóng bên bờ sông Hương êm đềm.', tags: ['tâm linh', 'cổ kính', 'sông Hương'], estimated_cost: 0, latitude: 16.4533, longitude: 107.5453, rating: 4.7 },
    { name: 'Lăng Khải Định', type: 'attraction', address: 'Xã Thủy Bằng, TP. Huế, Thừa Thiên Huế', description: 'Tuyệt tác kiến trúc giao thoa Đông - Tây với nghệ thuật khảm sành sứ đỉnh cao.', tags: ['kiến trúc', 'lăng tẩm', 'check-in'], estimated_cost: 150000, latitude: 16.3989, longitude: 107.5906, rating: 4.8 },
    { name: 'Bún bò Huế O Cương Điệp', type: 'restaurant', address: '06 Trần Thúc Nhẫn, P. Vĩnh Ninh, TP. Huế, Thừa Thiên Huế', description: 'Bún bò chuẩn vị Huế thơm nồng mùi sả, ruốc và móng giò mềm béo.', tags: ['bún bò', 'đặc sản', 'ăn sáng'], estimated_cost: 45000, latitude: 16.4628, longitude: 107.5891, rating: 4.7 },
    { name: 'Quán Bánh Bèo - Nậm - Lọc Bà Đỏ', type: 'restaurant', address: '08 Nguyễn Bỉnh Khiêm, P. Phú Cát, TP. Huế, Thừa Thiên Huế', description: 'Địa chỉ thưởng thức trọn bộ các món bánh truyền thống trứ danh xứ Huế.', tags: ['bánh huế', 'ăn vặt', 'đặc sản'], estimated_cost: 80000, latitude: 16.4711, longitude: 107.6012, rating: 4.5 },
    { name: 'Cà Phê Muối Huế - Đặng Thái Thân', type: 'cafe', address: '10 Đặng Thái Thân, P. Thuận Hòa, TP. Huế, Thừa Thiên Huế', description: 'Nơi khai sinh món cà phê muối béo ngậy độc đáo của vùng đất Cố đô.', tags: ['cà phê muối', 'độc đáo', 'đặc sản'], estimated_cost: 30000, latitude: 16.4725, longitude: 107.5750, rating: 4.8 },
    { name: 'Khách sạn Eldora Hotel Hue', type: 'hotel', address: '60 Bến Nghé, P. Phú Hội, TP. Huế, Thừa Thiên Huế', description: 'Khách sạn phong cách tân cổ điển sang trọng ngay trung tâm thành phố.', tags: ['khách sạn', 'trung tâm', 'view đẹp'], estimated_cost: 850000, latitude: 16.4632, longitude: 107.5934, rating: 4.7 }
  ],
  'Quy Nhơn': [
    { name: 'Eo Gió & Kỳ Co', type: 'attraction', address: 'Thôn Lý Lương, Xã Nhơn Lý, TP. Quy Nhơn, Bình Định', description: 'Được ví như Jeju thu nhỏ với cung đường đi bộ ven biển và làn nước trong vắt.', tags: ['biển đảo', 'kỳ co', 'eo gió'], estimated_cost: 150000, latitude: 13.8833, longitude: 109.2833, rating: 4.8 },
    { name: 'Tháp Đôi Chăm Pa', type: 'attraction', address: 'Đường Trần Hưng Đạo, P. Đống Đa, TP. Quy Nhơn, Bình Định', description: 'Cụm tháp Chăm cổ kính nằm ngay trong lòng thành phố Quy Nhơn.', tags: ['di tích', 'chăm pa', 'lịch sử'], estimated_cost: 20000, latitude: 13.7889, longitude: 109.2139, rating: 4.6 },
    { name: 'Bánh xèo tôm nhảy Gia Vỹ', type: 'restaurant', address: '14 Diên Hồng, P. Lê Hồng Phong, TP. Quy Nhơn, Bình Định', description: 'Bánh xèo giòn rụm với tôm đất tươi rói nhảy tanh tách khi đổ bánh.', tags: ['bánh xèo', 'đặc sản', 'ẩm thực'], estimated_cost: 60000, latitude: 13.7745, longitude: 109.2278, rating: 4.7 },
    { name: 'Surf Bar Quy Nhơn', type: 'cafe', address: 'Bờ biển đường Xuân Diệu, P. Lê Lợi, TP. Quy Nhơn, Bình Định', description: 'Quán bar cafe bãi biển view hoàng hôn cực chill với bàn ghế gỗ lãng mạn.', tags: ['cafe bãi biển', 'hoàng hôn', 'chill'], estimated_cost: 60000, latitude: 13.7612, longitude: 109.2394, rating: 4.6 },
    { name: 'Khách sạn Anya Premier Hotel Quy Nhơn', type: 'hotel', address: '44 An Dương Vương, P. Nguyễn Văn Cừ, TP. Quy Nhơn, Bình Định', description: 'Khách sạn 5 sao sát biển Quy Nhơn với dịch vụ chuẩn quốc tế.', tags: ['khách sạn 5 sao', 'view biển', 'hồ bơi'], estimated_cost: 1400000, latitude: 13.7589, longitude: 109.2256, rating: 4.8 }
  ],
  'Phú Yên': [
    { name: 'Gành Đá Đĩa', type: 'attraction', address: 'Xã An Ninh Đông, H. Tuy An, Phú Yên', description: 'Hiện tượng địa chất kỳ thú với các cột đá bazan hình lục giác xếp chồng tự nhiên.', tags: ['kỳ quan', 'thiên nhiên', 'check-in'], estimated_cost: 40000, latitude: 13.3556, longitude: 109.2972, rating: 4.9 },
    { name: 'Mũi Điện & Bãi Môn', type: 'attraction', address: 'Thôn Phước Tân, Xã Hòa Tâm, Thị xã Đông Hòa, Phú Yên', description: 'Nơi đón ánh bình minh đầu tiên trên đất liền Việt Nam.', tags: ['hải đăng', 'bình minh', 'cảnh đẹp'], estimated_cost: 30000, latitude: 12.8833, longitude: 109.4500, rating: 4.8 },
    { name: 'Mắt cá ngừ đại dương Quán Bà Tám', type: 'restaurant', address: '289 Lê Duẩn, P. 7, TP. Tuy Hòa, Phú Yên', description: 'Món ăn bổ dưỡng trứ danh của xứ sở hoa vàng cỏ xanh hầm thuốc bắc.', tags: ['đặc sản', 'cá ngừ', 'độc đáo'], estimated_cost: 90000, latitude: 13.0889, longitude: 109.3111, rating: 4.7 }
  ]
}

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY
  if (!key || !key.startsWith('AIza') || key.length < 35) return null
  return key
}

/**
 * AI Crawler: Thu thập & làm giàu dữ liệu địa điểm cho một điểm đến bằng Gemini AI
 */
async function crawlPlacesByAI(destination) {
  const geminiKey = getGeminiKey()
  let placesToSave = []

  if (geminiKey) {
    try {
      console.log(`[AI Crawler] Đang gửi yêu cầu tới Gemini AI để thu thập dữ liệu tại: ${destination}...`)
      const prompt = `Bạn là một AI Data Crawler chuyên ngành du lịch. Hãy tìm kiếm và trích xuất danh sách 6 đến 10 địa điểm nổi tiếng nhất tại "${destination}" (Việt Nam), bao gồm đủ 4 loại: attraction (thắng cảnh/di tích/biển), restaurant (quán ăn đặc sản/nhà hàng), cafe (quán cafe đẹp/view đỉnh), hotel (khách sạn/resort).
Trả về KẾT QUẢ DUY NHẤT dưới dạng mảng JSON các object theo đúng cấu trúc sau (không kèm văn bản nào khác):
[
  {
    "name": "Tên địa điểm chính xác",
    "destination": "${destination}",
    "type": "attraction | restaurant | hotel | cafe",
    "address": "Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP",
    "description": "Mô tả chi tiết 1-2 câu về vẻ đẹp hoặc món ăn đặc sắc",
    "tags": ["tag1", "tag2", "tag3"],
    "estimated_cost": 50000,
    "latitude": 16.0592,
    "longitude": 108.2467,
async function crawlPlacesByAI(destination) {
  const geminiKey = getGeminiKey()
  let placesToSave = []

  if (geminiKey) {
    try {
      console.log(`[AI Crawler] Đang gửi yêu cầu tới Gemini AI để thu thập dữ liệu tại: ${destination}...`)
      const prompt = `Bạn là một AI Data Crawler chuyên ngành du lịch. Hãy tìm kiếm và trích xuất danh sách 6 đến 10 địa điểm nổi tiếng nhất tại "${destination}" (Việt Nam), bao gồm đủ 4 loại: attraction (thắng cảnh/di tích/biển), restaurant (quán ăn đặc sản/nhà hàng), cafe (quán cafe đẹp/view đỉnh), hotel (khách sạn/resort).
Trả về KẾT QUẢ DUY NHẤT dưới dạng mảng JSON các object theo đúng cấu trúc sau (không kèm văn bản nào khác):
[
  {
    "name": "Tên địa điểm chính xác",
    "destination": "${destination}",
    "type": "attraction | restaurant | hotel | cafe",
    "address": "Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP",
    "description": "Mô tả chi tiết 1-2 câu về vẻ đẹp hoặc món ăn đặc sắc",
    "tags": ["tag1", "tag2", "tag3"],
    "estimated_cost": 50000,
    "latitude": 16.0592,
    "longitude": 108.2467,
    "rating": 4.7
  }
]`

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
      )

      const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
      if (raw) {
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
        const startIdx = cleaned.indexOf('[')
        const endIdx = cleaned.lastIndexOf(']')
        if (startIdx >= 0 && endIdx >= startIdx) {
          placesToSave = JSON.parse(cleaned.slice(startIdx, endIdx + 1))
        }
      }
    } catch (err) {
      console.warn(`[AI Crawler] Gemini API lỗi (${err.message}), kích hoạt cơ chế Smart Fallback.`)
    }
  }

  // Fallback nếu AI không trả về hoặc chưa có API key
  if (!placesToSave || placesToSave.length === 0) {
    if (MOCK_CENTRAL_PLACES[destination]) {
      placesToSave = MOCK_CENTRAL_PLACES[destination].map(p => ({ ...p, destination }))
    } else {
      placesToSave = [
        { name: `Khu du lịch sinh thái & Danh thắng ${destination}`, destination, type: 'attraction', address: `Trung tâm ${destination}`, description: `Điểm tham quan danh lam thắng cảnh tiêu biểu và nổi bật nhất tại ${destination}.`, tags: ['check-in', 'văn hóa', 'cảnh đẹp'], estimated_cost: 80000, rating: 4.7 },
        { name: `Quán Ẩm thực Truyền thống ${destination}`, destination, type: 'restaurant', address: `Phố ẩm thực ${destination}`, description: `Thưởng thức các món ngon đặc sản nổi tiếng truyền thống tại ${destination}.`, tags: ['ẩm thực', 'đặc sản', 'ăn uống'], estimated_cost: 120000, rating: 4.6 },
        { name: `Cafe Góc Phố Xưa ${destination}`, destination, type: 'cafe', address: `Đường trung tâm ${destination}`, description: `Quán cafe có view thoáng đãng và không gian thư giãn đậm chất ${destination}.`, tags: ['cafe', 'chill'], estimated_cost: 45000, rating: 4.5 },
        { name: `Khách sạn Mường Thanh / Nghỉ dưỡng ${destination}`, destination, type: 'hotel', address: `Đường ven biển/trung tâm ${destination}`, description: `Chỗ nghỉ tiện nghi chuẩn 4 sao, sạch sẽ và thuận tiện di chuyển tại ${destination}.`, tags: ['khách sạn', 'nghỉ ngơi'], estimated_cost: 850000, rating: 4.7 }
      ]
    }
  }

  // Lưu tự động vào MongoDB Atlas (Upsert tránh trùng lặp)
  let savedCount = 0
  for (const place of placesToSave) {
    if (!place.name) continue
    await Place.updateOne(
      { name: place.name, destination: place.destination || destination },
      { $set: { ...place, destination: place.destination || destination } },
      { upsert: true }
    )
    savedCount++
  }

  console.log(`[AI Crawler] Đã tự động thu thập & nạp ${savedCount} địa điểm tại "${destination}" vào MongoDB Atlas!`)
  return placesToSave
}

/**
 * Tự động khởi chạy AI Crawler khi server bật (Auto-Initialize on startup)
 */
async function autoInitPlaces() {
  try {
    const totalPlaces = await Place.countDocuments()
    console.log(`[AI Auto-Crawler] Tổng số địa điểm hiện có trong MongoDB: ${totalPlaces}`)

    if (totalPlaces < 15) {
      console.log('[AI Auto-Crawler] Dữ liệu còn ít, AI Crawler đang tự động chạy ngầm để nạp dữ liệu Miền Trung...')
      for (const dest of CENTRAL_VIETNAM_DESTINATIONS) {
        await crawlPlacesByAI(dest)
      }
      const newTotal = await Place.countDocuments()
      console.log(`[AI Auto-Crawler] ✅ Đã hoàn tất! Tổng cộng hiện có ${newTotal} địa điểm trên MongoDB Atlas.`)
    } else {
      console.log('[AI Auto-Crawler] Hệ thống đã có đầy đủ dữ liệu địa điểm sẵn sàng phục vụ.')
    }
  } catch (err) {
    console.warn(`[AI Auto-Crawler] Lỗi khởi tạo: ${err.message}`)
  }
}

module.exports = {
  crawlPlacesByAI,
  autoInitPlaces,
  CENTRAL_VIETNAM_DESTINATIONS
}
