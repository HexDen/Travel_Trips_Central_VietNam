// aiService: supports Gemini, OpenAI, and a local fallback response
const axios = require('axios')

function getGeminiKey(){
  return process.env.GEMINI_API_KEY || (
    process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')
      ? process.env.OPENAI_API_KEY
      : null
  )
}

async function taoLichTrinh(duLieu){
  const geminiKey = getGeminiKey()
  if(geminiKey){
    try{
      return await goiGemini(duLieu, geminiKey)
    }catch(err){
      console.error('Gemini call failed, falling back to mock:', err.message)
      return taoLichTrinhMock(duLieu)
    }
  }

  if(process.env.OPENAI_API_KEY){
    try{
      return await goiOpenAI(duLieu)
    }catch(err){
      console.error('OpenAI call failed, falling back to mock:', err.message)
      return taoLichTrinhMock(duLieu)
    }
  }
  return taoLichTrinhMock(duLieu)
}

function taoLichTrinhMock(duLieu){
  const diemDen = duLieu.destination || 'Đà Nẵng'
  const soNgay = Number(duLieu.days) || 3
  const nganSach = Number(duLieu.budget) || 3000000
  const soNguoi = Number(duLieu.people) || 1
  const soThich = Array.isArray(duLieu.interests) ? duLieu.interests : []

  const hoatDongMau = [
    { gio: '08:00', diaDiem: 'Ăn sáng địa phương', hoatDong: 'Ăn sáng', chiPhi: 60000 },
    { gio: '09:00', diaDiem: 'Bãi biển Mỹ Khê', hoatDong: 'Tắm biển / check-in', chiPhi: 0 },
    { gio: '12:00', diaDiem: 'Nhà hàng hải sản', hoatDong: 'Ăn trưa', chiPhi: 200000 },
    { gio: '14:00', diaDiem: 'Nhận phòng khách sạn', hoatDong: 'Check-in', chiPhi: 0 },
    { gio: '16:00', diaDiem: 'Cầu Rồng / Sông Hàn', hoatDong: 'Dạo chơi / check-in', chiPhi: 0 },
    { gio: '19:00', diaDiem: 'Quán ăn đường phố', hoatDong: 'Ăn tối', chiPhi: 150000 }
  ]

  const mangNgay = []
  for(let d=1; d<=soNgay; d++){
    const hoatDongs = hoatDongMau.map((h,i)=>({
      time: h.gio,
      place: h.diaDiem + (d>1 && i%2===0 ? ' (gợi ý khác)' : ''),
      activity: h.hoatDong,
      estimated_cost: h.chiPhi
    }))
    mangNgay.push({ day: d, activities: hoatDongs })
  }

  return {
    destination: diemDen,
    total_budget: nganSach,
    people: soNguoi,
    interests: soThich,
    transportation: duLieu.transportation || 'linh hoạt',
    hotel_request: duLieu.hotel_request || '',
    budget_breakdown: taoPhanBoNganSach(nganSach),
    days: mangNgay,
    note: 'Kết quả mock — thay bằng LLM thực tế sau',
  }
}

function taoPhanBoNganSach(nganSach){
  return {
    hotel: Math.round(nganSach * 0.3),
    food: Math.round(nganSach * 0.2),
    transportation: Math.round(nganSach * 0.15),
    tickets: Math.round(nganSach * 0.15),
    reserve: Math.round(nganSach * 0.2)
  }
}

async function goiOpenAI(duLieu){
  const prompt = buildPrompt(duLieu)

  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Bạn là một trợ lý du lịch AI, trả về kết quả theo đúng JSON được yêu cầu.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200,
    temperature: 0.2
  }

  const res = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  const raw = res.data.choices && res.data.choices[0] && (res.data.choices[0].message?.content || res.data.choices[0].text)
  if(!raw) throw new Error('No content from OpenAI')

  // try parse JSON from model output
  try{
    const jsonStart = raw.indexOf('{')
    const jsonText = jsonStart >= 0 ? raw.slice(jsonStart) : raw
    const parsed = JSON.parse(jsonText)
    // basic validation
    if(parsed && Array.isArray(parsed.days)) return boSungDuLieuLichTrinh(parsed, duLieu)
    throw new Error('Parsed response missing days array')
  }catch(err){
    throw new Error('Không thể phân tích JSON từ OpenAI response: ' + err.message)
  }
}

async function goiGemini(duLieu, apiKey){
  const prompt = `${buildPrompt(duLieu)}\n\nChỉ trả về JSON hợp lệ, không dùng markdown.`
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { 'Content-Type': 'application/json' }, timeout: 80_000 }
  )

  const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
  if(!raw) throw new Error('No content from Gemini')
  const parsed = parseJsonResponse(raw)
  if(!parsed || !Array.isArray(parsed.days)) throw new Error('Gemini response missing days array')
  return boSungDuLieuLichTrinh(parsed, duLieu)
}

function boSungDuLieuLichTrinh(lichTrinh, duLieu){
  const nganSach = Number(duLieu.budget || lichTrinh.total_budget) || 0
  return {
    ...lichTrinh,
    destination: lichTrinh.destination || duLieu.destination,
    total_budget: Number(lichTrinh.total_budget) || nganSach,
    people: Number(lichTrinh.people) || Number(duLieu.people) || 1,
    interests: lichTrinh.interests || duLieu.interests || [],
    transportation: lichTrinh.transportation || duLieu.transportation || 'linh hoạt',
    hotel_request: lichTrinh.hotel_request || duLieu.hotel_request || '',
    budget_breakdown: lichTrinh.budget_breakdown || taoPhanBoNganSach(nganSach)
  }
}

function parseJsonResponse(raw){
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  return JSON.parse(jsonStart >= 0 && jsonEnd >= jsonStart ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned)
}

function buildPrompt(duLieu){
  const diaDiem = duLieu.destination || 'Đà Nẵng'
  const ngay = Number(duLieu.days) || 3
  const ngayBatDau = duLieu.start_date || ''
  const ngayKetThuc = duLieu.end_date || ''
  const nganSach = Number(duLieu.budget) || 3000000
  const nguoi = Number(duLieu.people) || 1
  const soThich = Array.isArray(duLieu.interests) ? duLieu.interests : []

  return `Hãy tạo một lịch trình du lịch dưới dạng JSON cho khách:
destination: ${diaDiem}
days: ${ngay}
start_date: ${ngayBatDau}
end_date: ${ngayKetThuc}
people: ${nguoi}
budget: ${nganSach}
transportation: ${duLieu.transportation || 'linh hoạt'}
hotel_request: ${duLieu.hotel_request || 'không có yêu cầu đặc biệt'}
interests: ${soThich.join(', ')}

Yêu cầu:
1) Trả về đúng JSON duy nhất với cấu trúc:
{
  "destination": "...",
  "total_budget": number,
  "people": number,
  "transportation": "...",
  "hotel_request": "...",
  "budget_breakdown": { "hotel": number, "food": number, "transportation": number, "tickets": number, "reserve": number },
  "days": [ { "day": number, "activities": [ { "time": "HH:MM", "place": "...", "activity": "...", "estimated_cost": number } ] } ]
}
2) Không kèm giải thích văn bản ngoài JSON.
3) Ưu tiên hoạt động phù hợp với sở thích.`
}

module.exports = { taoLichTrinh }

async function taoPhanHoiChat({ message, trip }){
  const geminiKey = getGeminiKey()
  if(geminiKey){
    try{
      return await goiGeminiChat({ message, trip }, geminiKey)
    }catch(err){
      console.error('Gemini chat call failed, falling back to mock:', err.message)
    }
  }else if(process.env.OPENAI_API_KEY){
    try{
      return await goiOpenAIChat({ message, trip })
    }catch(err){
      console.error('OpenAI chat call failed, falling back to mock:', err.message)
    }
  }

  return taoPhanHoiChatMock(message, trip)
}

async function goiGeminiChat({ message, trip }, apiKey){
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const prompt = `Bạn là trợ lý du lịch AI. Hãy trả lời ngắn gọn, cụ thể và bằng tiếng Việt.
Thông tin chuyến đi: ${JSON.stringify({
    destination: trip.destination,
    total_budget: trip.total_budget,
    people: trip.people,
    days: trip.days
  })}

Câu hỏi của người dùng: ${message}`
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { 'Content-Type': 'application/json' }, timeout: 80_000 }
  )
  const reply = res.data.candidates?.[0]?.content?.parts?.[0]?.text
  if(!reply) throw new Error('No content from Gemini chat')
  return reply.trim()
}

async function goiOpenAIChat({ message, trip }){
  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Bạn là trợ lý du lịch AI. Hãy trả lời ngắn gọn, cụ thể và bằng tiếng Việt.'
      },
      {
        role: 'user',
        content: `Thông tin chuyến đi: ${JSON.stringify({
          destination: trip.destination,
          total_budget: trip.total_budget,
          people: trip.people,
          days: trip.days
        })}\n\nCâu hỏi của người dùng: ${message}`
      }
    ],
    max_tokens: 500,
    temperature: 0.7
  }

  const res = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  const reply = res.data.choices?.[0]?.message?.content
  if(!reply) throw new Error('No content from OpenAI chat response')
  return reply.trim()
}

async function taoLichTrinhLai({ trip, instruction }){
  const geminiKey = getGeminiKey()
  if(geminiKey){
    try{
      const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
      const prompt = `Bạn là trợ lý du lịch. Hãy điều chỉnh lịch trình JSON hiện tại theo yêu cầu.
Lịch trình hiện tại: ${JSON.stringify(trip.days)}
Thông tin chuyến đi: ${trip.destination}, ${trip.people} người, ngân sách ${trip.total_budget}.
Yêu cầu điều chỉnh: ${instruction}
Chỉ trả về JSON có dạng {"days":[{"day":number,"activities":[{"time":"HH:MM","place":"...","activity":"...","estimated_cost":number}]}]}.`
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json' }, timeout: 80_000 }
      )
      const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
      const parsed = parseJsonResponse(raw || '')
      if(Array.isArray(parsed.days)) return parsed.days
    }catch(err){
      console.error('Gemini re-plan failed, applying local adjustment:', err.message)
    }
  }

  const isBadWeather = /mưa|rain|trong nhà|indoor/i.test(instruction)
  return trip.days.map(day => ({
    ...day.toObject ? day.toObject() : day,
    activities: day.activities.map(activity => {
      const isOutdoor = /biển|ngoài trời|công viên|núi/i.test(`${activity.place} ${activity.activity}`)
      if(!isBadWeather || !isOutdoor) return activity
      return {
        ...activity.toObject ? activity.toObject() : activity,
        place: 'Quán cafe / không gian trong nhà',
        activity: 'Hoạt động trong nhà tránh thời tiết xấu'
      }
    })
  }))
}

function taoPhanHoiChatMock(message, trip){
  const m = (message || '').toLowerCase()
  if(m.includes('không đi biển') || m.includes('khong di bien') || m.includes('không đi bãi') ){
    return 'Đã hiểu, tôi sẽ thay các hoạt động biển bằng các hoạt động trong nhà và tham quan thành phố cho Ngày 2. (mock)'
  }

  const diaDiem = message.match(/(?:tại|đến|đi)\s+(.+?)(?=\s+với|\s+chi phí|\s+ngân sách|\s+thời gian|$)/i)?.[1]?.trim() || trip?.destination || 'điểm đến của bạn'
  const soNguoi = message.match(/(\d+)\s*người/i)?.[1] || trip?.people || '1'
  const nganSach = message.match(/(?:chi phí|ngân sách)\s*(\d+)\s*(?:tr|triệu)/i)?.[1]
  const soNgay = message.match(/(\d+)\s*ngày/i)?.[1] || trip?.days?.length || '3'
  const nganSachText = nganSach ? `${Number(nganSach)} triệu đồng` : `${trip?.total_budget || 'ngân sách hiện có'} đồng`

  return `Với chuyến đi đến ${diaDiem} cho ${soNguoi} người trong ${soNgay} ngày, ngân sách khoảng ${nganSachText}, bạn có thể tham khảo: ngày đầu khám phá trung tâm và ăn đặc sản địa phương; ngày tiếp theo tham quan thiên nhiên hoặc điểm văn hóa nổi bật; ngày cuối nghỉ ngơi, mua đặc sản và trở về. Hãy cho tôi biết bạn thích thiên nhiên, ăn uống hay khám phá văn hóa để tôi điều chỉnh lịch trình.`
}

module.exports = { taoLichTrinh, taoPhanHoiChat, taoLichTrinhLai }