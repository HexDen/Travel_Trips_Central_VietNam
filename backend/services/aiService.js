// aiService: Gemini AI + MongoDB Atlas Local Data Integration
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

function buildPrompt(duLieu, diaDiemDatabase) {
  const diaDiem = duLieu.destination || 'Đà Nẵng'
  const ngay = Number(duLieu.days) || 3
  const ngayBatDau = duLieu.start_date || ''
  const ngayKetThuc = duLieu.end_date || ''
  const nganSach = Number(duLieu.budget) || 3000000
  const nguoi = Number(duLieu.people) || 1
  const soThich = Array.isArray(duLieu.interests) ? duLieu.interests : []

  let goiYDbText = ''
  if (diaDiemDatabase && diaDiemDatabase.length > 0) {
    const listAttractions = diaDiemDatabase.filter(p => p.type === 'attraction').map(p => p.name).join(', ')
    const listFood = diaDiemDatabase.filter(p => p.type === 'restaurant').map(p => `${p.name} (${p.description || ''})`).join('; ')
    const listCafe = diaDiemDatabase.filter(p => p.type === 'cafe').map(p => p.name).join(', ')
    const listHotels = diaDiemDatabase.filter(p => p.type === 'hotel').map(p => `${p.name} (giá khoảng ${p.estimated_cost || 800000}đ)`).join(', ')
    goiYDbText = `\nDANH SÁCH ĐỊA ĐIỂM & ĐẶC SẢN THỰC TẾ TẠI ${diaDiem.toUpperCase()} TRONG CƠ SỞ DỮ LIỆU:\n- Khách sạn/Resort: ${listHotels || 'Theo gợi ý chuẩn của bạn'}\n- Thắng cảnh/Check-in: ${listAttractions || 'Theo gợi ý chuẩn của bạn'}\n- Quán ăn/Đặc sản: ${listFood || 'Theo gợi ý chuẩn của bạn'}\n- Cafe: ${listCafe || 'Theo gợi ý chuẩn của bạn'}\n`
  }

  return `Bạn là Chuyên gia Lên lịch trình Du lịch hàng đầu tại Việt Nam.
Hãy thiết kế lịch trình du lịch chi tiết, sống động, đầy đủ Khách sạn, Điểm ăn uống (Sáng/Trưa/Tối), Điểm Check-in cho: "${diaDiem}".

THÔNG TIN CHUYẾN ĐI:
- Điểm đến: ${diaDiem}
- Số ngày: ${ngay} ngày
- Số người: ${nguoi} người
- Tổng ngân sách: ${nganSach} VND
- Ngày khởi hành: ${ngayBatDau || 'Chưa định ngày'} đến ${ngayKetThuc || 'Chưa định ngày'}
- Phương tiện: ${duLieu.transportation || 'linh hoạt'}
- Yêu cầu khách sạn: ${duLieu.hotel_request || 'tiêu chuẩn, vị trí thuận tiện'}
- Sở thích: ${soThich.join(', ') || 'khám phá ẩm thực đặc sản, check-in cảnh đẹp'}
${goiYDbText}
QUY TẮC BẮT BUỘC:
1. KHÁCH SẠN (HOTEL): Phải có trường "hotel_recommendation" gợi ý khách sạn/resort cụ thể tại ${diaDiem}. Ngày 1 lúc 14:00 có mốc "Nhận phòng khách sạn", ngày cuối cùng lúc 12:00 có mốc "Trả phòng khách sạn".
2. NHÃN PHÂN LOẠI HOẠT ĐỘNG (CATEGORY): Mỗi hoạt động trong ngày BẮT BUỘC có trường "type" ('breakfast' | 'lunch' | 'dinner' | 'checkin' | 'attraction' | 'cafe' | 'checkout') và "label" ('Ăn sáng' | 'Ăn trưa' | 'Ăn tối' | 'Nhận phòng' | 'Tham quan / Check-in' | 'Cafe & Chill' | 'Trả phòng').
3. ĐẶC SẢN & ĐỊA DANH CHÍNH XÁC 100%:
   - Ăn sáng/Trưa/Tối: Nêu rõ tên món đặc sản + tên quán ăn nổi tiếng tại ${diaDiem} (Ví dụ: "Bún bò Huế O Cương Điệp", "Bánh mì Madam Khánh Hội An", "Bánh xèo tôm nhảy Gia Vỹ Quy Nhơn", "Cơm gà Tam Kỳ").
   - Tham quan/Check-in: Nêu rõ tên danh lam thắng cảnh, di tích nổi tiếng tại ${diaDiem}.
   - TUYỆT ĐỐI KHÔNG dùng tên chung chung như "Ăn sáng địa phương", "Nhà hàng hải sản".

ĐỊNH DẠNG ĐẦU RA (CHỈ TRẢ VỀ JSON DUY NHẤT):
{
  "destination": "${diaDiem}",
  "total_budget": ${nganSach},
  "people": ${nguoi},
  "transportation": "${duLieu.transportation || 'linh hoạt'}",
  "hotel_request": "${duLieu.hotel_request || ''}",
  "hotel_recommendation": {
    "name": "Tên khách sạn / resort cụ thể tại ${diaDiem}",
    "rating": 4.7,
    "price_per_night": 850000,
    "description": "Mô tả điểm cộng của khách sạn (view đẹp, gần biển, hồ bơi, sạch sẽ...)"
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
          "place": "Tên quán ăn + Món đặc sản cụ thể",
          "activity": "Mô tả hương vị món ăn và trải nghiệm điểm tâm",
          "estimated_cost": 50000
        },
        {
          "time": "09:00",
          "type": "attraction",
          "label": "Tham quan / Check-in",
          "place": "Tên thắng cảnh / Di tích nổi tiếng tại ${diaDiem}",
          "activity": "Chi tiết hoạt động tham quan, chụp ảnh sống ảo",
          "estimated_cost": 100000
        },
        {
          "time": "12:00",
          "type": "lunch",
          "label": "Ăn trưa",
          "place": "Tên nhà hàng đặc sản cụ thể",
          "activity": "Thưởng thức các món đặc sản địa phương",
          "estimated_cost": 150000
        },
        {
          "time": "14:00",
          "type": "checkin",
          "label": "Nhận phòng",
          "place": "Tên khách sạn đã đề xuất",
          "activity": "Làm thủ tục nhận phòng khách sạn, nghỉ ngơi lấy lại năng lượng",
          "estimated_cost": 0
        },
        {
          "time": "16:00",
          "type": "cafe",
          "label": "Cafe & Chill",
          "place": "Tên quán cafe view đẹp nổi tiếng",
          "activity": "Uống cafe, ngắm hoàng hôn và check-in",
          "estimated_cost": 55000
        },
        {
          "time": "19:00",
          "type": "dinner",
          "label": "Ăn tối",
          "place": "Tên quán ăn tối / Hải sản / Ẩm thực đêm",
          "activity": "Ăn tối, khám phá chợ đêm và không khí về đêm",
          "estimated_cost": 200000
        }
      ]
    }
  ]
}`
}

/**
 * Bộ sinh lịch trình thông minh dự phòng
 */
async function taoLichTrinhThongMinh(duLieu, diaDiemDatabase) {
  const diemDen = duLieu.destination || 'Đà Nẵng'
  const soNgay = Number(duLieu.days) || 3
  const nganSach = Number(duLieu.budget) || 3000000
  const soNguoi = Number(duLieu.people) || 1
  const soThich = Array.isArray(duLieu.interests) ? duLieu.interests : []

  const attractions = diaDiemDatabase.filter(p => p.type === 'attraction')
  const restaurants = diaDiemDatabase.filter(p => p.type === 'restaurant')
  const cafes = diaDiemDatabase.filter(p => p.type === 'cafe')
  const hotels = diaDiemDatabase.filter(p => p.type === 'hotel')

  const hotelChon = hotels[0] || {
    name: `Khách sạn nghỉ dưỡng trung tâm ${diemDen}`,
    rating: 4.7,
    estimated_cost: 850000,
    description: `Khách sạn vị trí đắc địa gần trung tâm ${diemDen}, tiện nghi hiện đại và phòng ốc thoáng đãng.`
  }

  const mangNgay = []
  for (let d = 1; d <= soNgay; d++) {
    const actDay = []

    // 1. Ăn sáng
    const restSang = restaurants[(d - 1) % Math.max(1, restaurants.length)]
    actDay.push({
      time: '07:30',
      type: 'breakfast',
      label: 'Ăn sáng',
      place: restSang ? restSang.name : `Đặc sản điểm tâm sáng ${diemDen}`,
      activity: restSang ? `Thưởng thức ${restSang.description || 'ẩm thực đặc sản truyền thống'}` : `Thưởng thức món ngon đặc trưng xứ ${diemDen}`,
      estimated_cost: restSang?.estimated_cost || 45000
    })

    // 2. Tham quan buổi sáng
    const attSang = attractions[( (d - 1) * 2 ) % Math.max(1, attractions.length)]
    actDay.push({
      time: '09:00',
      type: 'attraction',
      label: 'Tham quan / Check-in',
      place: attSang ? attSang.name : `Khu danh thắng nổi tiếng ${diemDen}`,
      activity: attSang ? `Tham quan, chụp ảnh check-in: ${attSang.description || 'cảnh quan ấn tượng'}` : `Khám phá địa danh biểu tượng của ${diemDen}`,
      estimated_cost: attSang?.estimated_cost || 100000
    })

    // 3. Ăn trưa
    const restTrua = restaurants[d % Math.max(1, restaurants.length)]
    actDay.push({
      time: '12:00',
      type: 'lunch',
      label: 'Ăn trưa',
      place: restTrua ? restTrua.name : `Nhà hàng đặc sản ${diemDen}`,
      activity: restTrua ? `Ăn trưa, thưởng thức: ${restTrua.description || 'món ngon đậm đà'}` : `Dùng bữa trưa với các món đặc sản địa phương`,
      estimated_cost: restTrua?.estimated_cost || 150000
    })

    // 4. Ngày 1: Nhận phòng; Ngày khác: Cafe; Ngày cuối: Trả phòng
    if (d === 1) {
      actDay.push({
        time: '14:00',
        type: 'checkin',
        label: 'Nhận phòng',
        place: hotelChon.name,
        activity: `Làm thủ tục nhận phòng tại ${hotelChon.name}, nghỉ ngơi thư giãn.`,
        estimated_cost: 0
      })
    } else if (d === soNgay) {
      actDay.push({
        time: '12:00',
        type: 'checkout',
        label: 'Trả phòng',
        place: hotelChon.name,
        activity: `Làm thủ tục trả phòng, gửi hành lý tại quầy lễ tân để tiếp tục lịch trình.`,
        estimated_cost: 0
      })
    } else {
      const cafeChieu = cafes[(d - 1) % Math.max(1, cafes.length)]
      actDay.push({
        time: '14:30',
        type: 'cafe',
        label: 'Cafe & Chill',
        place: cafeChieu ? cafeChieu.name : `Quán Cafe view đẹp ${diemDen}`,
        activity: cafeChieu ? `Thư giãn, thưởng thức đồ uống: ${cafeChieu.description || 'không gian thoáng mát'}` : `Thưởng thức cafe và nghỉ ngơi nhẹ`,
        estimated_cost: cafeChieu?.estimated_cost || 50000
      })
    }

    // 5. Tham quan buổi chiều
    const attChieu = attractions[( (d - 1) * 2 + 1 ) % Math.max(1, attractions.length)]
    actDay.push({
      time: '16:00',
      type: 'attraction',
      label: 'Tham quan / Check-in',
      place: attChieu ? attChieu.name : `Điểm ngắm hoàng hôn ${diemDen}`,
      activity: attChieu ? `Ngắm cảnh chiều tà, check-in: ${attChieu.description || 'không gian tuyệt đẹp'}` : `Dạo chơi và tận hưởng không khí trong lành`,
      estimated_cost: attChieu?.estimated_cost || 0
    })

    // 6. Ăn tối
    const restToi = restaurants[(d + 1) % Math.max(1, restaurants.length)]
    actDay.push({
      time: '19:00',
      type: 'dinner',
      label: 'Ăn tối',
      place: restToi ? restToi.name : `Ẩm thực đêm ${diemDen}`,
      activity: restToi ? `Ăn tối, thưởng thức đặc sản: ${restToi.description || 'không khí nhộn nhịp'}` : `Khám phá phố đêm và ẩm thực đường phố`,
      estimated_cost: restToi?.estimated_cost || 200000
    })

    mangNgay.push({ day: d, activities: actDay })
  }

  return {
    destination: diemDen,
    total_budget: nganSach,
    people: soNguoi,
    interests: soThich,
    transportation: duLieu.transportation || 'linh hoạt',
    hotel_request: duLieu.hotel_request || '',
    hotel_recommendation: {
      name: hotelChon.name,
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
    rating: 4.7,
    price_per_night: Math.round(nganSach * 0.35 / Math.max(1, Number(duLieu.days) || 1)),
    description: `Khách sạn tiện nghi, vị trí thuận tiện di chuyển tại ${duLieu.destination}.`
  }

  return {
    ...lichTrinh,
    destination: lichTrinh.destination || duLieu.destination,
    total_budget: Number(lichTrinh.total_budget) || nganSach,
    people: Number(lichTrinh.people) || Number(duLieu.people) || 1,
    interests: lichTrinh.interests || duLieu.interests || [],
    transportation: lichTrinh.transportation || duLieu.transportation || 'linh hoạt',
    hotel_request: lichTrinh.hotel_request || duLieu.hotel_request || '',
    hotel_recommendation: lichTrinh.hotel_recommendation || defaultHotel,
    budget_breakdown: lichTrinh.budget_breakdown || taoPhanBoNganSach(nganSach)
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
2. Mỗi hoạt động phải có type ('breakfast' | 'lunch' | 'dinner' | 'checkin' | 'attraction' | 'cafe' | 'checkout') và label ('Ăn sáng' | 'Ăn trưa' | 'Ăn tối' | 'Nhận phòng' | 'Tham quan / Check-in' | 'Cafe & Chill' | 'Trả phòng').
Chỉ trả về JSON có cấu trúc: {"days":[{"day":number,"activities":[{"time":"HH:MM","type":"...","label":"...","place":"...","activity":"...","estimated_cost":number}]}]}`

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