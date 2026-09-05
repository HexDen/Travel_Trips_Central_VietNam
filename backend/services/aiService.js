// aiService: Gemini AI + MongoDB Atlas Local Data Integration (Supported Selected Places & Exact Addresses)
const axios = require('axios')
const Place = require('../models/Place')

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY
  if (key && key.startsWith('AIza') && key.length >= 35) {
    return key
  }
  return process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')
    ? process.env.OPENAI_API_KEY
    : null
}

async function taoLichTrinh(duLieu) {
  const geminiKey = getGeminiKey()
  const diemDen = duLieu.destination || 'Đà Nẵng'

  // 1. Lấy danh sách địa điểm thực tế từ MongoDB Atlas cho điểm đến này
  let diaDiemDatabase = []
  try {
    diaDiemDatabase = await Place.find({ destination: new RegExp(diemDen, 'i') }).lean()
  } catch (e) {
    console.warn('Không thể đọc địa điểm từ DB:', e.message)
  }

  // 2. Gọi Gemini AI với dữ liệu ngữ cảnh thực tế
  if (geminiKey) {
    try {
      return await goiGemini(duLieu, diaDiemDatabase, geminiKey)
    } catch (err) {
      console.error('Gemini call failed, falling back to smart dynamic local generator:', err.message)
      return await taoLichTrinhThongMinh(duLieu, diaDiemDatabase)
    }
  }

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    try {
      return await goiOpenAI(duLieu, diaDiemDatabase)
    } catch (err) {
      console.error('OpenAI call failed, falling back to smart dynamic local generator:', err.message)
      return await taoLichTrinhThongMinh(duLieu, diaDiemDatabase)
    }
  }

  return await taoLichTrinhThongMinh(duLieu, diaDiemDatabase)
}

async function goiGemini(duLieu, diaDiemDatabase, apiKey) {
  const prompt = `${buildPrompt(duLieu, diaDiemDatabase)}\n\nChỉ trả về JSON hợp lệ, không dùng markdown (\`\`\`json).`
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
  )

  const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) throw new Error('No content from Gemini')
  const parsed = parseJsonResponse(raw)
  if (!parsed || !Array.isArray(parsed.days)) throw new Error('Gemini response missing days array')
  return boSungDuLieuLichTrinh(parsed, duLieu, diaDiemDatabase)
}

const LOCAL_CONTEXT_MAP = {
  'Thanh Hóa': 'Sầm Sơn, Pù Luông, Thành Nhà Hồ, Suối Cá Thần Cẩm Lương, Đền Bà Triệu; Đặc sản: Nem chua Thanh Hóa, Chả tôm, Bánh khoái tép, Gỏi cá nhệch Nga Sơn, Bánh gai Tứ Trụ',
  'Nghệ An': 'Bãi biển Cửa Lò, Khu di tích Kim Liên Quê Bác, Đồi chè Thanh Chương, Vườn Quốc gia Pù Mát; Đặc sản: Cháo lươn Nghệ An, Súp lươn bánh mướt, Mực nhảy Cửa Lò, Nhút Thanh Chương, Tương Nam Đàn',
  'Hà Tĩnh': 'Bãi biển Thiên Cầm, Ngã ba Đồng Lộc, Chùa Hương Tích, Hồ Kẻ Gỗ; Đặc sản: Kẹo cu đơ Hà Tĩnh, Mực nhảy Vũng Áng, Ram mướt, Bánh bèo Hà Tĩnh, Dê núi Hương Sơn',
  'Quảng Trị': 'Vùng Quảng Trị & Quảng Bình sáp nhập (Thành Cổ Quảng Trị, Địa đạo Vịnh Mốc, Cầu Hiền Lương, Động Phong Nha, Động Thiên Đường, Suối Moọc, Hang Sơn Đoòng); Đặc sản: Bánh canh cá lóc, Bún hến Mai Xá, Bánh lọc, Cháo cá vạt giường, Thịt trâu lá trơng',
  'Huế': 'Đại Nội Hoàng Thành Huế, Chùa Thiên Mụ, Lăng Khải Định, Lăng Tự Đức, Đồi Vọng Cảnh, Vịnh Lăng Cô, Phá Tam Giang; Đặc sản: Bún bò Huế chuẩn vị, Cơm hến Hoa Đông, Bánh bèo nậm lọc, Cà phê muối, Chè Hẻm',
  'Đà Nẵng': 'Vùng Đà Nẵng & Quảng Nam - Hội An sáp nhập (Bà Nà Hills & Cầu Vàng, Biển Mỹ Khê, Bán đảo Sơn Trà, Ngũ Hành Sơn, Cầu Rồng, Phố cổ Hội An, Thánh địa Mỹ Sơn, Rừng dừa Bảy Mẫu); Đặc sản: Mì Quảng Bà Mua, Bánh tráng cuốn thịt heo Quán Trần, Bánh mì Phượng Hội An, Cao lầu, Bún chả cá, Hải sản tươi sống',
  'Quảng Ngãi': 'Vùng Quảng Ngãi & Bình Định - Quy Nhơn sáp nhập (Đảo Lý Sơn, Cổng Tò Vò, Hang Câu, Eo Gió & Kỳ Co, Tháp Đôi Chăm Pa, Khu chứng tích Sơn Mỹ); Đặc sản: Don Quảng Ngãi, Ram bắp, Bánh xèo tôm nhảy Quy Nhơn, Cá bống Sông Trà, Tỏi cô đơn Lý Sơn, Nem Chợ Huyện',
  'Gia Lai': 'Vùng Gia Lai & Kon Tum sáp nhập (Biển Hồ T’Nưng, Núi lửa Chư Đăng Ya, Biển Hồ Chè, Chùa Minh Thành, Nhà rông Kon Klor, Nhà thờ Gỗ Kon Tum); Đặc sản: Phở hai tô (Phở khô Gia Lai), Bò một nắng muối kiến vàng, Gà nướng cơm lam Pleiku, Bún mắm cua thối, Cà phê Pleiku',
  'Đắk Lắk': 'Vùng Đắk Lắk & Đắk Nông sáp nhập (Thác Dray Nur & Dray Sap, Bảo tàng Thế giới Cà phê, Hồ Lắk, Buôn Đôn, Chùa Sắc Tứ Khải Đoan, Hồ Tà Đùng); Đặc sản: Bún đỏ Buôn Ma Thuột, Gà nướng than Bản Đôn, Lẩu cá lăng Sông Sêrêpôk, Cà phê Robusta thơm nồng',
  'Khánh Hòa': 'Vùng Khánh Hòa & Phú Yên sáp nhập (VinWonders Nha Trang, Tháp Bà Ponagar, Viện Hải dương học, Vịnh Vĩnh Hy, Gành Đá Đĩa, Mũi Điện Đại Lãnh, Bãi Dài Cam Ranh); Đặc sản: Bún chả cá Nha Trang, Nem nướng Ninh Hòa, Bánh căn mực, Mắt cá ngừ đại dương Phú Yên, Tôm hùm Bình Ba, Yến sào',
  'Lâm Đồng': 'Hồ Xuân Hương & Quảng trường Lâm Viên, Thung Lũng Tình Yêu, Ga Đà Lạt, Đỉnh Langbiang, Thác Datanla & Máng trượt, Đồi chè Cầu Đất; Đặc sản: Bánh tráng nướng Đà Lạt, Lẩu gà lá é Tao Ngộ, Bánh ướt lòng gà Long, Lẩu bò Ba Toa Quán Gỗ, Kem bơ Thanh Thảo'
}

function buildPrompt(duLieu, diaDiemDatabase) {
  const diaDiem = duLieu.destination || 'Đà Nẵng'
  const ngay = Number(duLieu.days) || 3
  const ngayBatDau = duLieu.start_date || ''
  const ngayKetThuc = duLieu.end_date || ''
  const nganSach = Number(duLieu.budget) || 3000000
  const nguoi = Number(duLieu.people) || 1
  const soThich = Array.isArray(duLieu.interests) ? duLieu.interests : []
  const selectedPlaces = Array.isArray(duLieu.selected_places) ? duLieu.selected_places : []
  const contextRegion = LOCAL_CONTEXT_MAP[diaDiem] || `Toàn bộ danh lam thắng cảnh và đặc sản nổi bật tại ${diaDiem}`

  let goiYDbText = ''
  if (diaDiemDatabase && diaDiemDatabase.length > 0) {
    const listAttractions = diaDiemDatabase.filter(p => p.type === 'attraction').map(p => `${p.name} (Địa chỉ: ${p.address || diaDiem})`).join('; ')
    const listFood = diaDiemDatabase.filter(p => p.type === 'restaurant').map(p => `${p.name} - ${p.description || ''} (Địa chỉ: ${p.address || diaDiem})`).join('; ')
    const listCafe = diaDiemDatabase.filter(p => p.type === 'cafe').map(p => `${p.name} (Địa chỉ: ${p.address || diaDiem})`).join('; ')
    const listHotels = diaDiemDatabase.filter(p => p.type === 'hotel').map(p => `${p.name} (Địa chỉ: ${p.address || diaDiem}, giá: ${p.estimated_cost || 850000}đ)`).join('; ')
    goiYDbText = `\nDANH SÁCH ĐỊA ĐIỂM & ĐẶC SẢN THỰC TẾ CÓ SẴN TẠI ${diaDiem.toUpperCase()}:\n- Khách sạn: ${listHotels || 'Gợi ý chuẩn xác của bạn'}\n- Thắng cảnh/Check-in: ${listAttractions || 'Gợi ý chuẩn xác của bạn'}\n- Món ngon/Quán ăn: ${listFood || 'Gợi ý chuẩn xác của bạn'}\n- Quán Cafe: ${listCafe || 'Gợi ý chuẩn xác của bạn'}\n`
  }

  let mustVisitText = ''
  if (selectedPlaces.length > 0) {
    mustVisitText = `\n🔥 YÊU CẦU ĐẶC BIỆT TỪ DU KHÁCH:
Du khách đã chủ động lựa chọn các địa điểm/món ăn sau: [${selectedPlaces.join(', ')}].
BẠN BẮT BUỘC PHẢI XẾP TẤT CẢ CÁC ĐỊA ĐIỂM TRÊN VÀO LỊCH TRÌNH các ngày sao cho hợp lý và tối ưu tuyến đường di chuyển!\n`
  }

  return `Bạn là Chuyên gia Lên lịch trình Du lịch hàng đầu tại Việt Nam.
Hãy thiết kế lịch trình du lịch chi tiết, sống động, đầy đủ Khách sạn, Bữa ăn (Sáng/Trưa/Tối), Điểm Check-in và ĐỊA CHỈ RÕ RÀNG cho điểm đến: "${diaDiem}" (Khu vực mở rộng sau sáp nhập gồm: ${contextRegion}).

THÔNG TIN CHUYẾN ĐI:
- Điểm đến: ${diaDiem}
- Số ngày: ${ngay} ngày
- Số người: ${nguoi} người
- Tổng ngân sách: ${nganSach} VND
- Ngày khởi hành: ${ngayBatDau || 'Chưa định ngày'} đến ${ngayKetThuc || 'Chưa định ngày'}
- Phương tiện: ${duLieu.transportation || 'linh hoạt'}
- Yêu cầu khách sạn: ${duLieu.hotel_request || 'tiêu chuẩn, vị trí thuận tiện'}
- Sở thích: ${soThich.join(', ') || 'khám phá ẩm thực đặc sản, check-in cảnh đẹp'}
${goiYDbText}${mustVisitText}
QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG ĐƯỢC LẶP LẠI ĐỊA ĐIỂM: Mọi thắng cảnh, quán ăn sáng, quán ăn trưa, quán ăn tối trong suốt toàn bộ ${ngay} ngày BẮT BUỘC PHẢI KHÁC NHAU 100%. Không được xếp lại cùng 1 địa điểm ở các ngày khác nhau.
2. ĐỊA CHỈ RÕ RÀNG (ADDRESS): BẮT BUỘC mọi hoạt động và khách sạn đều phải có trường "address" cụ thể (Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP).
3. KHÁCH SẠN (HOTEL): Có trường "hotel_recommendation" gồm: name, address, rating, price_per_night, description. Ngày 1 lúc 14:00 có mốc "Nhận phòng", ngày cuối lúc 12:00 có mốc "Trả phòng".
4. NHÃN PHÂN LOẠI (CATEGORY): Mỗi hoạt động có type ('breakfast' | 'lunch' | 'dinner' | 'checkin' | 'attraction' | 'cafe' | 'checkout') và label ('Ăn sáng' | 'Ăn trưa' | 'Ăn tối' | 'Nhận phòng' | 'Tham quan / Check-in' | 'Cafe & Chill' | 'Trả phòng').
5. ĐẶC SẢN & ĐỊA DANH CHÍNH XÁC: Nêu rõ tên món đặc sản + tên quán ăn cụ thể tại ${diaDiem}. TUYỆT ĐỐI KHÔNG dùng tên chung chung.

ĐỊNH DẠNG ĐẦU RA (CHỈ TRẢ VỀ JSON DUY NHẤT):
{
  "destination": "${diaDiem}",
  "total_budget": ${nganSach},
  "people": ${nguoi},
  "transportation": "${duLieu.transportation || 'linh hoạt'}",
  "hotel_request": "${duLieu.hotel_request || ''}",
  "hotel_recommendation": {
    "name": "Tên khách sạn / resort cụ thể tại ${diaDiem}",
    "address": "Địa chỉ cụ thể của khách sạn",
    "rating": 4.7,
    "price_per_night": 850000,
    "description": "Mô tả điểm cộng của khách sạn"
  },
  "budget_breakdown": {
    "hotel": number,
    "food": number,
    "transportation": number,
    "tickets": number,
    "reserve": number
  },
  "days": [
    {
      "day": 1,
      "activities": [
        {
          "time": "07:30",
          "type": "breakfast",
          "label": "Ăn sáng",
          "place": "Tên quán ăn + Tên món đặc sản",
          "address": "Số nhà, Tên đường, Quận/Huyện, TP",
          "activity": "Mô tả hương vị món ăn và trải nghiệm điểm tâm",
          "estimated_cost": 50000
        },
        {
          "time": "09:00",
          "type": "attraction",
          "label": "Tham quan / Check-in",
          "place": "Tên thắng cảnh / Di tích nổi tiếng tại ${diaDiem}",
          "address": "Địa chỉ danh thắng cụ thể",
          "activity": "Chi tiết hoạt động tham quan, chụp ảnh sống ảo",
          "estimated_cost": 100000
        }
      ]
    }
  ]
}`
}

/**
 * Bộ sinh lịch trình thông minh dự phòng (Đảm bảo 100% không lặp lại địa điểm)
 */
async function taoLichTrinhThongMinh(duLieu, diaDiemDatabase) {
  const diemDen = duLieu.destination || 'Đà Nẵng'
  const soNgay = Number(duLieu.days) || 3
  const nganSach = Number(duLieu.budget) || 3000000
  const soNguoi = Number(duLieu.people) || 1
  const soThich = Array.isArray(duLieu.interests) ? duLieu.interests : []
  const selectedPlaces = Array.isArray(duLieu.selected_places) ? duLieu.selected_places : []

  const availableAttractions = [...diaDiemDatabase.filter(p => p.type === 'attraction')]
  const availableRestaurants = [...diaDiemDatabase.filter(p => p.type === 'restaurant')]
  const availableCafes = [...diaDiemDatabase.filter(p => p.type === 'cafe')]
  const hotels = diaDiemDatabase.filter(p => p.type === 'hotel')

  const hotelChon = hotels[0] || {
    name: `Khách sạn nghỉ dưỡng trung tâm ${diemDen}`,
    address: `Đường trung tâm thành phố ${diemDen}`,
    rating: 4.8,
    estimated_cost: 850000,
    description: `Khách sạn vị trí đắc địa gần trung tâm ${diemDen}, tiện nghi hiện đại và phòng ốc thoáng đãng.`
  }

  // Danh sách các địa điểm đã đi để TUYỆT ĐỐI KHÔNG LẶP LẠI
  const usedPlaceNames = new Set()

  function layDiaDiemKhongTrung(list, fallbackTen, fallbackType, fallbackCost) {
    // 1. Kiểm tra nếu có địa điểm do người dùng chọn trước
    const customIdx = selectedPlaces.findIndex(name => !usedPlaceNames.has(name) && list.some(p => p.name === name))
    if (customIdx >= 0) {
      const targetName = selectedPlaces[customIdx]
      const found = list.find(p => p.name === targetName)
      if (found) {
        usedPlaceNames.add(found.name)
        return found
      }
    }

    // 2. Tìm trong danh sách địa điểm chưa sử dụng
    const available = list.filter(p => !usedPlaceNames.has(p.name))
    if (available.length > 0) {
      const picked = available[0]
      usedPlaceNames.add(picked.name)
      return picked
    }

    // 3. Nếu danh sách cạn, tạo địa điểm biến thể hợp lý theo ngày
    const index = usedPlaceNames.size + 1
    const fallback = {
      name: `${fallbackTen} (Điểm ${index})`,
      address: `Thành phố ${diemDen}`,
      type: fallbackType,
      description: `Khám phá và trải nghiệm không gian độc đáo tại ${diemDen}`,
      estimated_cost: fallbackCost
    }
    usedPlaceNames.add(fallback.name)
    return fallback
  }

  const mangNgay = []
  for (let d = 1; d <= soNgay; d++) {
    const actDay = []

    // 1. Ăn sáng
    const restSang = layDiaDiemKhongTrung(availableRestaurants, `Điểm tâm đặc sản ${diemDen}`, 'restaurant', 45000)
    actDay.push({
      time: '07:30',
      type: 'breakfast',
      label: 'Ăn sáng',
      place: restSang.name,
      address: restSang.address || `Trung tâm ẩm thực ${diemDen}`,
      activity: restSang.description ? `Thưởng thức ${restSang.description}` : `Thưởng thức món ngon đặc trưng xứ ${diemDen}`,
      estimated_cost: restSang.estimated_cost || 45000
    })

    // 2. Tham quan buổi sáng (Thắng cảnh 1)
    const attSang = layDiaDiemKhongTrung(availableAttractions, `Danh thắng nổi tiếng ${diemDen}`, 'attraction', 100000)
    actDay.push({
      time: '09:00',
      type: 'attraction',
      label: 'Tham quan / Check-in',
      place: attSang.name,
      address: attSang.address || `Thành phố ${diemDen}`,
      activity: attSang.description ? `Tham quan, chụp ảnh check-in: ${attSang.description}` : `Khám phá địa danh biểu tượng của ${diemDen}`,
      estimated_cost: attSang.estimated_cost || 100000
    })

    // 3. Ăn trưa
    const restTrua = layDiaDiemKhongTrung(availableRestaurants, `Nhà hàng đặc sản ${diemDen}`, 'restaurant', 150000)
    actDay.push({
      time: '12:00',
      type: 'lunch',
      label: 'Ăn trưa',
      place: restTrua.name,
      address: restTrua.address || `Trung tâm ẩm thực ${diemDen}`,
      activity: restTrua.description ? `Ăn trưa, thưởng thức: ${restTrua.description}` : `Dùng bữa trưa với các món đặc sản địa phương`,
      estimated_cost: restTrua.estimated_cost || 150000
    })

    // 4. Ngày 1: Nhận phòng; Ngày khác: Cafe; Ngày cuối: Trả phòng
    if (d === 1) {
      actDay.push({
        time: '14:00',
        type: 'checkin',
        label: 'Nhận phòng',
        place: hotelChon.name,
        address: hotelChon.address || `Trung tâm ${diemDen}`,
        activity: `Làm thủ tục nhận phòng tại ${hotelChon.name}, nghỉ ngơi thư giãn.`,
        estimated_cost: 0
      })
    } else if (d === soNgay) {
      actDay.push({
        time: '12:00',
        type: 'checkout',
        label: 'Trả phòng',
        place: hotelChon.name,
        address: hotelChon.address || `Trung tâm ${diemDen}`,
        activity: `Làm thủ tục trả phòng, gửi hành lý tại quầy lễ tân để tiếp tục lịch trình.`,
        estimated_cost: 0
      })
    } else {
      const cafeChieu = layDiaDiemKhongTrung(availableCafes, `Quán Cafe view đẹp ${diemDen}`, 'cafe', 50000)
      actDay.push({
        time: '14:30',
        type: 'cafe',
        label: 'Cafe & Chill',
        place: cafeChieu.name,
        address: cafeChieu.address || `Khu phố trung tâm ${diemDen}`,
        activity: cafeChieu.description ? `Thư giãn, thưởng thức đồ uống: ${cafeChieu.description}` : `Thưởng thức cafe và nghỉ ngơi nhẹ`,
        estimated_cost: cafeChieu.estimated_cost || 50000
      })
    }

    // 5. Tham quan buổi chiều (Thắng cảnh 2)
    const attChieu = layDiaDiemKhongTrung(availableAttractions, `Điểm check-in chiều ${diemDen}`, 'attraction', 50000)
    actDay.push({
      time: '16:00',
      type: 'attraction',
      label: 'Tham quan / Check-in',
      place: attChieu.name,
      address: attChieu.address || `Ven biển/sông ${diemDen}`,
      activity: attChieu.description ? `Ngắm cảnh chiều tà, check-in: ${attChieu.description}` : `Dạo chơi và tận hưởng không khí trong lành`,
      estimated_cost: attChieu.estimated_cost || 0
    })

    // 6. Ăn tối
    const restToi = layDiaDiemKhongTrung(availableRestaurants, `Ẩm thực đêm ${diemDen}`, 'restaurant', 200000)
    actDay.push({
      time: '19:00',
      type: 'dinner',
      label: 'Ăn tối',
      place: restToi.name,
      address: restToi.address || `Phố ẩm thực đêm ${diemDen}`,
      activity: restToi.description ? `Ăn tối, thưởng thức đặc sản: ${restToi.description}` : `Khám phá phố đêm và ẩm thực đường phố`,
      estimated_cost: restToi.estimated_cost || 200000
    })

    mangNgay.push({ day: d, activities: actDay })
  }

  return {
    destination: diemDen,
    total_budget: nganSach,
    people: soNguoi,
    interests: soThich,
    selected_places: selectedPlaces,
    transportation: duLieu.transportation || 'linh hoạt',
    hotel_request: duLieu.hotel_request || '',
    hotel_recommendation: {
      name: hotelChon.name,
      address: hotelChon.address || `Trung tâm ${diemDen}`,
      rating: hotelChon.rating || 4.7,
      price_per_night: hotelChon.estimated_cost || 850000,
      description: hotelChon.description || `Khách sạn nghỉ dưỡng tiện nghi tại ${diemDen}`
    },
    budget_breakdown: taoPhanBoNganSach(nganSach),
    days: mangNgay
  }
}

function taoPhanBoNganSach(nganSach) {
  return {
    hotel: Math.round(nganSach * 0.35),
    food: Math.round(nganSach * 0.25),
    transportation: Math.round(nganSach * 0.15),
    tickets: Math.round(nganSach * 0.15),
    reserve: Math.round(nganSach * 0.1)
  }
}

function boSungDuLieuLichTrinh(lichTrinh, duLieu, diaDiemDatabase) {
  const nganSach = Number(duLieu.budget || lichTrinh.total_budget) || 0
  const hotels = (diaDiemDatabase || []).filter(p => p.type === 'hotel')
  const defaultHotel = hotels[0] || {
    name: `Khách sạn tiêu chuẩn tại ${duLieu.destination}`,
    address: `Trung tâm ${duLieu.destination}`,
    rating: 4.7,
    price_per_night: Math.round(nganSach * 0.35 / Math.max(1, Number(duLieu.days) || 1)),
    description: `Khách sạn tiện nghi, vị trí thuận tiện di chuyển tại ${duLieu.destination}.`
  }

  // Bổ sung địa chỉ từ DB nếu AI chưa điền address cho activity
  const diaDiemList = diaDiemDatabase || []
  const placeAddressMap = new Map(diaDiemList.map(p => [p.name.toLowerCase().trim(), p.address]))

  const updatedDays = (lichTrinh.days || []).map(day => ({
    ...day,
    activities: (day.activities || []).map(act => {
      let addr = act.address
      if (!addr || addr === duLieu.destination) {
        const actName = (act.place || '').toLowerCase().trim()
        // 1. Khớp chính xác
        if (placeAddressMap.has(actName)) {
          addr = placeAddressMap.get(actName)
        } else {
          // 2. Khớp chứa từ
          for (const [pName, pAddr] of placeAddressMap.entries()) {
            if (pAddr && (actName.includes(pName) || pName.includes(actName) || (pName.length > 5 && actName.slice(0, 10) === pName.slice(0, 10)))) {
              addr = pAddr
              break
            }
          }
        }
        if (!addr) addr = `Thành phố ${duLieu.destination}`
      }
      return {
        ...act,
        address: addr
      }
    })
  }))

  return {
    ...lichTrinh,
    destination: lichTrinh.destination || duLieu.destination,
    total_budget: Number(lichTrinh.total_budget) || nganSach,
    people: Number(lichTrinh.people) || Number(duLieu.people) || 1,
    interests: lichTrinh.interests || duLieu.interests || [],
    selected_places: duLieu.selected_places || lichTrinh.selected_places || [],
    transportation: lichTrinh.transportation || duLieu.transportation || 'linh hoạt',
    hotel_request: lichTrinh.hotel_request || duLieu.hotel_request || '',
    hotel_recommendation: lichTrinh.hotel_recommendation || defaultHotel,
    budget_breakdown: lichTrinh.budget_breakdown || taoPhanBoNganSach(nganSach),
    days: updatedDays
  }
}

function parseJsonResponse(raw) {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  return JSON.parse(jsonStart >= 0 && jsonEnd >= jsonStart ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned)
}

async function taoPhanHoiChat({ message, trip }) {
  const geminiKey = getGeminiKey()
  if (geminiKey) {
    try {
      return await goiGeminiChat({ message, trip }, geminiKey)
    } catch (err) {
      console.error('Gemini chat call failed:', err.message)
    }
  }
  return taoPhanHoiChatMock(message, trip)
}

async function goiGeminiChat({ message, trip }, apiKey) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const prompt = `Bạn là chuyên gia du lịch am hiểu tường tận văn hóa, ẩm thực và danh lam thắng cảnh Việt Nam (đặc biệt là Miền Trung).
Hãy trả lời câu hỏi của du khách một cách cụ thể, nhiệt tình, chi tiết tên món ăn, quán ăn, địa chỉ check-in.
Thông tin chuyến đi: Điểm đến: ${trip?.destination || 'Việt Nam'}, Ngân sách: ${trip?.total_budget || 'linh hoạt'}, Số người: ${trip?.people || 1}.

Câu hỏi của du khách: "${message}"`

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
  )
  const reply = res.data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!reply) throw new Error('No content from Gemini chat')
  return reply.trim()
}

async function taoLichTrinhLai({ trip, instruction }) {
  const geminiKey = getGeminiKey()
  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const prompt = `Bạn là trợ lý du lịch AI. Hãy điều chỉnh lịch trình JSON cho điểm đến ${trip.destination} theo yêu cầu của khách.
Lịch trình hiện tại: ${JSON.stringify(trip.days)}
Yêu cầu điều chỉnh: "${instruction}"

YÊU CẦU QUAN TRỌNG:
1. Nêu rõ tên địa điểm, món ăn đặc sản cụ thể tại ${trip.destination}.
2. Mỗi hoạt động phải có address ("Số nhà, Đường, Quận, TP"), type ('breakfast' | 'lunch' | 'dinner' | 'checkin' | 'attraction' | 'cafe' | 'checkout') và label ('Ăn sáng' | 'Ăn trưa' | 'Ăn tối' | 'Nhận phòng' | 'Tham quan / Check-in' | 'Cafe & Chill' | 'Trả phòng').
Chỉ trả về JSON có cấu trúc: {"days":[{"day":number,"activities":[{"time":"HH:MM","type":"...","label":"...","place":"...","address":"...","activity":"...","estimated_cost":number}]}]}`

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
      )
      const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
      const parsed = parseJsonResponse(raw || '')
      if (Array.isArray(parsed.days)) return parsed.days
    } catch (err) {
      console.error('Gemini re-plan failed:', err.message)
    }
  }

  return trip.days
}

function taoPhanHoiChatMock(message, trip) {
  const diaDiem = trip?.destination || 'Miền Trung'
  return `Tại ${diaDiem}, bạn nhất định nên trải nghiệm các thắng cảnh nổi tiếng và thưởng thức ẩm thực đặc sản trứ danh địa phương. Bạn cần tôi gợi ý thêm về quán ăn, điểm check-in hay khách sạn nào không?`
}

module.exports = {
  taoLichTrinh,
  taoPhanHoiChat,
  taoLichTrinhLai
}