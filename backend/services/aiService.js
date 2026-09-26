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

const DESTINATION_ALIASES = {
  'Hội An': 'Đà Nẵng',
  'Nha Trang': 'Khánh Hòa',
  'Quy Nhơn': 'Quảng Ngãi',
  'Đà Lạt': 'Lâm Đồng',
  'Buôn Ma Thuột': 'Đắk Lắk'
}

// Tính khoảng cách Haversine (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Thuật toán K-Means++ gom cụm các địa điểm gần nhau
function clusterPlaces(places, numClusters) {
  if (!places || places.length === 0) return [];
  const validPlaces = places.filter(p => p.latitude && p.longitude);
  if (validPlaces.length < numClusters) {
    const chunks = [];
    const chunkSize = Math.ceil(places.length / (numClusters || 1));
    for (let i = 0; i < numClusters; i++) {
      chunks.push(places.slice(i * chunkSize, (i + 1) * chunkSize));
    }
    return chunks;
  }
  
  let centroids = [validPlaces[0]];
  for (let i = 1; i < numClusters; i++) {
    let furthest = validPlaces[0];
    let maxDist = 0;
    for (const p of validPlaces) {
      let minDist = Math.min(...centroids.map(c => calculateDistance(c.latitude, c.longitude, p.latitude, p.longitude)));
      if (minDist > maxDist) {
        maxDist = minDist;
        furthest = p;
      }
    }
    centroids.push(furthest);
  }

  let clusters = Array.from({ length: numClusters }, () => []);
  for (const p of places) {
    if (!p.latitude || !p.longitude) {
      clusters[0].push(p);
      continue;
    }
    let minDist = Infinity;
    let clusterIdx = 0;
    for (let i = 0; i < numClusters; i++) {
      const dist = calculateDistance(centroids[i].latitude, centroids[i].longitude, p.latitude, p.longitude);
      if (dist < minDist) {
        minDist = dist;
        clusterIdx = i;
      }
    }
    clusters[clusterIdx].push(p);
  }
  return clusters;
}

async function taoLichTrinh(duLieu) {
  const geminiKey = getGeminiKey()
  let diemDen = duLieu.destination || 'Đà Nẵng'
  if (DESTINATION_ALIASES[diemDen]) {
    diemDen = DESTINATION_ALIASES[diemDen]
  }

  // 1. Lấy danh sách địa điểm thực tế từ MongoDB Atlas cho điểm đến này
  let diaDiemDatabase = []
  try {
    diaDiemDatabase = await Place.find({ destination: new RegExp(`^${diemDen}$`, 'i') }).lean()
    if (diaDiemDatabase.length === 0) {
      diaDiemDatabase = await Place.find({ destination: new RegExp(diemDen, 'i') }).lean()
    }
  } catch (e) {
    console.warn('Không thể đọc địa điểm từ DB:', e.message)
  }

  // 2. Gọi Gemini AI với dữ liệu ngữ cảnh thực tế
  let result = null
  if (geminiKey) {
    try {
      result = await goiGemini(duLieu, diaDiemDatabase, geminiKey)
    } catch (err) {
      console.error('Gemini call failed, falling back to smart dynamic local generator:', err.message)
      result = boSungDuLieuLichTrinh(await taoLichTrinhThongMinh(duLieu, diaDiemDatabase), duLieu, diaDiemDatabase)
    }
  } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    try {
      result = await goiOpenAI(duLieu, diaDiemDatabase)
    } catch (err) {
      console.error('OpenAI call failed, falling back to smart dynamic local generator:', err.message)
      result = boSungDuLieuLichTrinh(await taoLichTrinhThongMinh(duLieu, diaDiemDatabase), duLieu, diaDiemDatabase)
    }
  } else {
    result = boSungDuLieuLichTrinh(await taoLichTrinhThongMinh(duLieu, diaDiemDatabase), duLieu, diaDiemDatabase)
  }

  // Tích hợp tính toán tối ưu nhà xe & chi phí di chuyển tuyến đường
  try {
    const { timKiemNhaXeVaToiUuChiPhi } = require('./busService')
    const transitData = timKiemNhaXeVaToiUuChiPhi({
      origin: duLieu.origin || duLieu.diemKhoiHanh || 'Hà Nội',
      destination: diemDen,
      people: duLieu.people || 1
    })

    if (result.budget_breakdown && transitData.cheapestBusTotal) {
      result.budget_breakdown.transportation = (result.budget_breakdown.transportation || 0) + transitData.cheapestBusTotal;
      result.total_budget = (result.total_budget || 0) + transitData.cheapestBusTotal;
    }

    return {
      ...result,
      origin: duLieu.origin || duLieu.diemKhoiHanh || 'Hà Nội',
      transit_summary: transitData
    }
  } catch (transitErr) {
    console.warn('Lỗi bổ sung transit:', transitErr.message)
    return {
      ...result,
      origin: duLieu.origin || duLieu.diemKhoiHanh || 'Hà Nội'
    }
  }
}

async function goiGemini(duLieu, diaDiemDatabase, apiKey) {
  const prompt = `${buildPrompt(duLieu, diaDiemDatabase)}\n\nChỉ trả về JSON duy nhất tuân thủ cấu trúc trên.`
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
  )

  const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) throw new Error('No content from Gemini')
  const parsed = parseJsonResponse(raw)
  if (!parsed || !Array.isArray(parsed.days)) throw new Error('Gemini response missing days array')
  return boSungDuLieuLichTrinh(parsed, duLieu, diaDiemDatabase)
}

const LOCAL_CONTEXT_MAP = {
  'Thanh Hóa': 'Sầm Sơn, Pù Luông, Thành Nhà Hồ, Suối Cá Thần; Đặc sản: Nem chua, Chả tôm, Bánh khoái tép',
  'Nghệ An': 'Cửa Lò, Kim Liên Quê Bác, Đồi chè Thanh Chương; Đặc sản: Cháo lươn, Súp lươn bánh mướt, Mực nhảy',
  'Hà Tĩnh': 'Thiên Cầm, Ngã ba Đồng Lộc, Chùa Hương Tích; Đặc sản: Kẹo cu đơ, Mực nhảy Vũng Áng, Ram mướt',
  'Quảng Trị': 'Phong Nha, Thiên Đường, Suối Moọc, Thành Cổ, Vịnh Mốc; Đặc sản: Bánh canh cá lóc, Bún hến Mai Xá',
  'Huế': 'Đại Nội Hoàng Thành, Chùa Thiên Mụ, Lăng Khải Định, Lăng Tự Đức; Đặc sản: Bún bò Huế, Cơm hến, Bánh bèo nậm lọc',
  'Đà Nẵng': 'Bà Nà Hills, Cầu Vàng, Biển Mỹ Khê, Sơn Trà, Cầu Rồng, Phố cổ Hội An; Đặc sản: Mì Quảng, Bánh tráng thịt heo, Cao lầu',
  'Quảng Ngãi': 'Đảo Lý Sơn, Cổng Tò Vò, Eo Gió, Kỳ Co; Đặc sản: Don Quảng Ngãi, Ram bắp, Bánh xèo tôm nhảy',
  'Gia Lai': 'Biển Hồ T\'Nưng, Chư Đăng Ya, Kon Klor, Nhà thờ Gỗ; Đặc sản: Phở hai tô, Bò một nắng muối kiến vàng, Gà nướng cơm lam',
  'Đắk Lắk': 'Bảo tàng Cà phê, Thác Dray Nur, Hồ Lắk, Buôn Đôn; Đặc sản: Bún đỏ Ban Mê, Gà nướng than, Lẩu cá lăng',
  'Khánh Hòa': 'VinWonders, Tháp Bà Ponagar, Gành Đá Đĩa, Mũi Điện; Đặc sản: Bún chả cá, Nem nướng Ninh Hòa, Bánh căn mực',
  'Lâm Đồng': 'Hồ Xuân Hương, Quảng trường Lâm Viên, Thung Lũng Tình Yêu, Langbiang, Datanla; Đặc sản: Bánh tráng nướng, Lẩu gà lá é, Bánh ướt lòng gà'
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
    const listHotels = diaDiemDatabase.filter(p => p.type === 'hotel').slice(0, 4).map(p => `${p.name} (${p.address || diaDiem}, giá: ${p.estimated_cost || 850000}đ)`).join('; ')
    
    // Sử dụng thuật toán phân cụm để nhóm địa điểm gần nhau
    const clusters = clusterPlaces(diaDiemDatabase, Math.min(ngay, 5));
    let clusteredText = '';
    clusters.forEach((cluster, idx) => {
      const cAttractions = cluster.filter(p => p.type === 'attraction').slice(0, 5).map(p => p.name).join(', ');
      const cFoods = cluster.filter(p => p.type === 'restaurant').slice(0, 5).map(p => p.name).join(', ');
      const cCafe = cluster.filter(p => p.type === 'cafe').slice(0, 3).map(p => p.name).join(', ');
      clusteredText += `\n- Cụm Khu Vực ${idx + 1} (Các điểm RẤT GẦN NHAU, Dùng cho Ngày ${idx + 1}): Thắng cảnh: [${cAttractions}]; Quán ăn: [${cFoods}]; Cafe: [${cCafe}].`;
    });

    goiYDbText = `\nĐỊA ĐIỂM THỰC TẾ TẠI ${diaDiem.toUpperCase()}:\n- Khách sạn (chọn 1 cho cả chuyến đi): ${listHotels}\n${clusteredText}\n`
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
3. KHÁCH SẠN (HOTEL): ƯU TIÊN CHỌN KHÁCH SẠN BÌNH DÂN, GIÁ RẺ. Có trường "hotel_recommendation" gồm: name, address, rating, price_per_night, description. Ngày 1 lúc 14:00 có mốc "Nhận phòng", ngày cuối lúc 12:00 có mốc "Trả phòng".
4. NHÃN PHÂN LOẠI (CATEGORY): Mỗi hoạt động có type ('breakfast' | 'lunch' | 'dinner' | 'checkin' | 'attraction' | 'cafe' | 'checkout') và label ('Ăn sáng' | 'Ăn trưa' | 'Ăn tối' | 'Nhận phòng' | 'Tham quan / Check-in' | 'Cafe & Chill' | 'Trả phòng').
5. ĐẶC SẢN & ĐỊA DANH CHÍNH XÁC: Nêu rõ tên món đặc sản + tên quán ăn cụ thể tại ${diaDiem}. TUYỆT ĐỐI KHÔNG dùng tên chung chung.
6. MỖI NGÀY MỘT CỤM (CLUSTER-PER-DAY): Để tiết kiệm sức khỏe di chuyển, BẮT BUỘC Ngày 1 chỉ được lấy các địa điểm ở "Cụm Khu Vực 1", Ngày 2 chỉ lấy ở "Cụm Khu Vực 2"... TUYỆT ĐỐI KHÔNG trộn lẫn điểm của Cụm 1 sang Cụm 2 trong cùng một ngày!
7. TỐI ƯU KHOẢNG CÁCH & PHÍ DI CHUYỂN: Các địa điểm trong cùng MỘT NGÀY bắt buộc phải nằm gần nhau. BẮT BUỘC phải ghi chú tên điểm xuất phát, khoảng cách, THỜI GIAN DI CHUYỂN, và phí di chuyển ước tính vào cuối nội dung "activity" (Buổi sáng bắt buộc tính từ KHÁCH SẠN). (Ví dụ: "... (Từ khách sạn di chuyển ~5km, đi xe khoảng 10 phút, phí taxi ước tính 75.000đ)").
8. MÔ TẢ GIÁ TRỊ THỰC TẾ (ACTIVITY): Viết 1 câu súc tích làm nổi bật nét hấp dẫn và giá trị thực tế của địa điểm (ví dụ: "Nổi tiếng với bún bò cay nồng và nem lụi nướng than hoa" hoặc "Khu trưng bày mẫu vật sinh thái biển phong phú thích hợp check-in sáng sớm"). TUYỆT ĐỐI KHÔNG dùng câu mẫu rập khuôn rỗng tuếch kiểu: "Thưởng thức/tham quan: Địa điểm ẩm thực đặc sản chất lượng cao trên Google Maps tại...".
${nganSach <= 500000 ? `9. ĐẶC BIỆT - NGÂN SÁCH TỐI GIẢN / SINH TỒN (${nganSach.toLocaleString('vi-VN')} VND): Ngân sách du khách rất eo hẹp! BẮT BUỘC chỉ chọn các điểm tham quan MIỄN PHÍ VÉ (bãi biển công cộng, cầu, công viên, phố cổ tản bộ, đèo, chùa chiền không thu phí), quán ăn vỉa hè bình dân giá rẻ (bánh mì 15-20k, mì vỉa hè, xôi), và khách sạn/homestay/dorm giá rẻ nhất có thể. Không xếp điểm check-in tốn vé đắt đỏ hay hải sản cao cấp!` : ''}

ĐỊNH DẠNG ĐẦU RA (CHỈ TRẢ VỀ JSON DUY NHẤT):
{
  "destination": "${diaDiem}",
  "total_budget": ${nganSach},
  "people": ${nguoi},
  "transportation": "${duLieu.transportation || 'linh hoạt'}",
  "hotel_request": "${duLieu.hotel_request || ''}",
  "hotel_recommendation": {
    "name": "Tên khách sạn / homestay bình dân cụ thể tại ${diaDiem}",
    "address": "Địa chỉ cụ thể của khách sạn",
    "rating": 4.5,
    "price_per_night": 350000,
    "description": "Mô tả điểm cộng của khách sạn giá rẻ"
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

function sinhMoTaThucTe(placeObj, type, destination) {
  const pName = (placeObj?.name || '').toLowerCase();
  const desc = (placeObj?.description || '').trim();
  const dest = destination || 'Miền Trung';

  const isGeneric = !desc ||
    desc.includes('trên Google Maps') ||
    desc.includes('chất lượng cao') ||
    desc.includes('Địa điểm du lịch tham quan') ||
    desc.includes('Địa điểm ẩm thực đặc sản') ||
    desc.includes('Địa điểm quán cafe check-in') ||
    desc.includes('Địa điểm khách sạn nghỉ dưỡng') ||
    desc.startsWith('Thưởng thức/tham quan: Địa điểm') ||
    desc.startsWith('Địa điểm ẩm thực') ||
    desc.startsWith('Địa điểm du lịch') ||
    desc === `Địa điểm du lịch tại ${dest}` ||
    desc.length < 15;

  if (!isGeneric) {
    return desc.replace(/^Thưởng thức\/tham quan:\s*/i, '').trim();
  }

  // Tận dụng Món tủ (signature_highlight) từ Deep Crawler bóc tách từ Foody/ShopeeFood
  if (placeObj && placeObj.signature_highlight) {
    if (type === 'breakfast' || type === 'lunch' || type === 'dinner' || type === 'restaurant') {
      return `Món tủ trứ danh: ${placeObj.signature_highlight}. Đậm đà hương vị bản địa xứ ${dest}.`;
    }
    if (type === 'cafe') {
      return `Điểm nhấn món tủ: ${placeObj.signature_highlight}. Không gian thư giãn cực chill tại ${dest}.`;
    }
  }

  if (type === 'breakfast' || type === 'lunch' || type === 'dinner' || type === 'restaurant') {
    if (pName.includes('bún bò')) {
      return `Nổi tiếng với bún bò cay nồng chuẩn vị xứ ${dest}, nước dùng ninh xương đậm đà, giò gân béo ngậy và nem lụi nướng than hoa.`;
    }
    if (pName.includes('nem') || pName.includes('lụi')) {
      return `Nổi tiếng với nem lụi nướng than hoa vàng rộm thơm lừng, cuốn bánh tráng rau sống tươi mát và nước lèo đậu phụng bùi béo.`;
    }
    if (pName.includes('cơm hến') || pName.includes('bún hến') || pName.includes('hến')) {
      return `Thưởng thức cơm hến đậm đà vị ruốc cay nồng, tóp mỡ giòn rụm và rau bắp chuối tươi mát đặc trưng xứ Cố đô.`;
    }
    if (pName.includes('bánh bèo') || pName.includes('bánh nậm') || pName.includes('bánh lọc') || pName.includes('bánh khoái')) {
      return `Mâm bánh đặc sản nóng hổi với vỏ bánh dẻo trong, nhân tôm thịt đậm vị, rắc tôm chấy và chấm nước mắm ớt thơm cay.`;
    }
    if (pName.includes('mì quảng') || pName.includes('mi quang')) {
      return `Đặc sản mì quảng sợi dẻo dai chan nước nhưn tôm thịt sánh đậm, rắc lạc rang thơm lừng ăn kèm bánh tráng mè nướng giòn.`;
    }
    if (pName.includes('cao lầu')) {
      return `Cao lầu trứ danh với sợi mì tro giòn sần sật, thịt xá xíu mềm thơm, tép mỡ giòn tan cùng rau thơm làng Trà Quế.`;
    }
    if (pName.includes('chè')) {
      return `Thưởng thức các món chè truyền thống thanh tao mát lành như chè hạt sen long nhãn, chè bột lọc bọc heo quay độc đáo.`;
    }
    if (pName.includes('bánh canh')) {
      return `Tô bánh canh nóng hổi nghi ngút khói với nước dùng ngọt đậm từ xương cá, sợi bột mềm dẻo và hành hoa thơm nức.`;
    }
    if (pName.includes('hải sản') || pName.includes('seafood') || pName.includes('ốc')) {
      return `Hải sản tươi sống đánh bắt trong ngày, chế biến đậm đà hấp sả hoặc nướng mỡ hành thơm lừng vị mặn mòi biển cả.`;
    }
    if (pName.includes('cơm niêu')) {
      return `Trải nghiệm cơm niêu đập cháy giòn thơm phức, ăn kèm cá kho tộ đậm vị, canh cua rau đay chuẩn bữa cơm gia đình.`;
    }
    if (pName.includes('gà') || pName.includes('vịt')) {
      return `Đặc sản gà thả vườn thịt săn chắc ngọt thơm, nướng than hoa da giòn chấm muối tiêu chanh ớt hiểm cay nồng.`;
    }
    if (pName.includes('cháo lươn') || pName.includes('súp lươn')) {
      return `Đặc sản lươn đồng xào nghệ cay nồng béo bùi, nước dùng sánh đậm ăn kèm bánh mướt nóng hoặc bánh mì giòn.`;
    }
    return `Thưởng thức hương vị ẩm thực địa phương đặc sắc, nguyên liệu tươi ngon được chế biến chuẩn vị truyền thống tại ${dest}.`;
  }

  if (type === 'cafe') {
    if (pName.includes('muối')) {
      return `Nổi tiếng với món cà phê muối béo ngậy độc đáo, lớp kem mặn mượt mà cân bằng hoàn hảo vị đắng đậm đà.`;
    }
    if (pName.includes('trà') || pName.includes('tea')) {
      return `Không gian thưởng trà an yên, phong vị thanh tao với các dòng trà hoa thảo mộc thơm nhẹ giúp thư giãn tâm hồn.`;
    }
    if (pName.includes('acoustic') || pName.includes('chill') || pName.includes('view')) {
      return `Góc check-in view cực chill với không gian mở thoáng đãng, thức uống pha chế tinh tế thích hợp ngắm cảnh và chuyện trò.`;
    }
    return `Không gian thư giãn nhẹ nhàng, đồ uống pha chế chỉn chu và nhiều góc check-in sống ảo đẹp mắt tại ${dest}.`;
  }

  if (type === 'attraction' || type === 'checkin') {
    if (pName.includes('đại nội') || pName.includes('hoàng thành') || pName.includes('cố đô')) {
      return `Quần thể di tích Cố đô nguy nga tráng lệ, khám phá kiến trúc cung đình triều Nguyễn và lưu giữ những bức ảnh hoài niệm.`;
    }
    if (pName.includes('chùa') || pName.includes('thiền viện') || pName.includes('tịnh xá') || pName.includes('linh ứng') || pName.includes('thiên mụ')) {
      return `Chốn tâm linh thanh tịnh giữa non nước hữu tình, chiêm bái cầu an và ngắm trọn cảnh sắc thiên nhiên an bình.`;
    }
    if (pName.includes('lăng')) {
      return `Kiệt tác kiến trúc lăng tẩm hoàng gia hòa quyện giữa nghệ thuật truyền thống và thiên nhiên đồi thông thơ mộng.`;
    }
    if (pName.includes('bảo tàng')) {
      return `Khu trưng bày mẫu vật và hiện vật lịch sử văn hóa phong phú, thích hợp check-in sáng sớm và tìm hiểu cội nguồn.`;
    }
    if (pName.includes('biển') || pName.includes('bãi')) {
      return `Bờ cát mịn thoải dài đón làn nước xanh mát, lý tưởng để dạo bộ đón bình minh, chụp ảnh sống ảo và tắm biển sảng khoái.`;
    }
    if (pName.includes('cầu') || pName.includes('sông')) {
      return `Biểu tượng cảnh quan đôi bờ sông thơ mộng, không gian thoáng đãng lý tưởng để dạo gió, ngắm hoàng hôn buông xuống.`;
    }
    if (pName.includes('động') || pName.includes('suối') || pName.includes('thác') || pName.includes('núi') || pName.includes('đèo')) {
      return `Khám phá kỳ quan thiên nhiên hoang sơ hùng vĩ, bầu không khí trong lành mát mẻ và check-in góc máy triệu view.`;
    }
    if (pName.includes('chợ')) {
      return `Khu chợ sầm uất mang đậm nhịp sống địa phương, thiên đường mua sắm đặc sản làm quà và thưởng thức quà vặt dân dã.`;
    }
    return `Điểm tham quan danh thắng nổi tiếng tại ${dest}, sở hữu cảnh quan ấn tượng và giá trị văn hóa độc đáo.`;
  }

  if (type === 'hotel') {
    return `Khách sạn nghỉ dưỡng tiện nghi, không gian thoáng đãng, phục vụ chu đáo và thuận tiện di chuyển tới các điểm vui chơi.`;
  }

  return `Điểm đến thú vị tại ${dest}, mang lại trải nghiệm khám phá và thư giãn tuyệt vời cho chuyến đi.`;
}

function layGioMoCuaUocTinh(type) {
  switch (type) {
    case 'breakfast': return '06:30 - 10:30';
    case 'lunch': return '10:30 - 14:00';
    case 'dinner': return '16:30 - 22:30';
    case 'cafe': return '07:00 - 22:30';
    case 'attraction': return '07:30 - 17:30';
    case 'checkin': return 'Nhận phòng từ 14:00';
    case 'checkout': return 'Trả phòng trước 12:00';
    default: return '07:00 - 22:00';
  }
}

function taoSoLuongDanhGia(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const count = 450 + Math.abs(hash % 2100);
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
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

  // 1. Phân cụm toàn bộ địa điểm (tối đa `soNgay` cụm hoặc 5 cụm)
  const clusters = clusterPlaces(diaDiemDatabase, Math.min(soNgay, 5));
  let bestCluster = clusters[0] || diaDiemDatabase;
  if (clusters.length > 0) {
    bestCluster = clusters.reduce((prev, curr) => (curr.length > prev.length) ? curr : prev, clusters[0]);
  }
  
  // 2. Tìm Centroid của cụm dày đặc nhất
  let centroid = null;
  const clusterWithCoords = bestCluster.filter(p => p.latitude && p.longitude);
  if (clusterWithCoords.length > 0) {
    const sumLat = clusterWithCoords.reduce((sum, p) => sum + parseFloat(p.latitude), 0);
    const sumLng = clusterWithCoords.reduce((sum, p) => sum + parseFloat(p.longitude), 0);
    centroid = { latitude: sumLat / clusterWithCoords.length, longitude: sumLng / clusterWithCoords.length };
  }

  // 3. Chọn Khách sạn bình dân GẦN CENTROID NHẤT
  const hotels = diaDiemDatabase.filter(p => p.type === 'hotel')
  if (centroid && hotels.length > 0) {
    hotels.sort((a, b) => {
      const distA = calculateDistance(centroid.latitude, centroid.longitude, a.latitude, a.longitude);
      const distB = calculateDistance(centroid.latitude, centroid.longitude, b.latitude, b.longitude);
      const priceA = a.estimated_cost || 9999999;
      const priceB = b.estimated_cost || 9999999;
      // Trọng số: Khách sạn quá xa (>10km) bị phạt nặng, ưu tiên giá + khoảng cách
      const scoreA = priceA + (distA > 10 ? 5000000 : distA * 20000); // 1km xa thêm coi như đắt thêm 20k
      const scoreB = priceB + (distB > 10 ? 5000000 : distB * 20000);
      return scoreA - scoreB;
    });
  } else {
    hotels.sort((a, b) => (a.estimated_cost || 9999999) - (b.estimated_cost || 9999999));
  }

  const hotelChon = hotels[0] || {
    name: `Khách sạn nghỉ dưỡng trung tâm ${diemDen}`,
    address: `Đường trung tâm thành phố ${diemDen}`,
    rating: 4.8,
    estimated_cost: 850000,
    description: `Khách sạn vị trí đắc địa gần trung tâm ${diemDen}, tiện nghi hiện đại và phòng ốc thoáng đãng.`,
    latitude: centroid ? centroid.latitude : null,
    longitude: centroid ? centroid.longitude : null
  }

  // Danh sách các địa điểm đã đi để TUYỆT ĐỐI KHÔNG LẶP LẠI
  const usedPlaceNames = new Set()

  function layDiaDiemKhongTrung(list, fallbackTen, fallbackType, fallbackCost, anchor = null) {
    const customIdx = selectedPlaces.findIndex(name => !usedPlaceNames.has(name) && list.some(p => p.name === name))
    if (customIdx >= 0) {
      const found = list.find(p => p.name === selectedPlaces[customIdx])
      if (found) {
        usedPlaceNames.add(found.name)
        return found
      }
    }

    let available = list.filter(p => !usedPlaceNames.has(p.name))
    if (available.length > 0) {
      if (anchor && anchor.latitude && anchor.longitude) {
        available.sort((a, b) => {
          const distA = calculateDistance(anchor.latitude, anchor.longitude, a.latitude, a.longitude);
          const distB = calculateDistance(anchor.latitude, anchor.longitude, b.latitude, b.longitude);
          return distA - distB;
        });
      }
      const picked = available[0]
      usedPlaceNames.add(picked.name)
      return picked
    }

    const index = usedPlaceNames.size + 1
    const fallback = {
      name: `${fallbackTen} (Điểm ${index})`,
      address: `Thành phố ${diemDen}`,
      type: fallbackType,
      description: `Khám phá và trải nghiệm không gian độc đáo tại ${diemDen}`,
      estimated_cost: fallbackCost,
      latitude: anchor ? anchor.latitude : null,
      longitude: anchor ? anchor.longitude : null
    }
    usedPlaceNames.add(fallback.name)
    return fallback
  }

  const mangNgay = []
  let previousAnchor = hotelChon; // Bắt đầu từ khách sạn
  
  for (let d = 1; d <= soNgay; d++) {
    const actDay = []
    
    // Lấy cụm của ngày hôm nay (xoay vòng nếu số ngày > số cụm)
    const currentCluster = clusters.length > 0 ? clusters[(d - 1) % clusters.length] : diaDiemDatabase;
    const cAttractions = currentCluster.filter(p => p.type === 'attraction');
    const cRestaurants = currentCluster.filter(p => p.type === 'restaurant');
    const cCafes = currentCluster.filter(p => p.type === 'cafe');
    
    let dayAnchor = previousAnchor;

    // Ngày mới: Tìm một danh thắng ở cụm hiện tại để làm mỏ neo
    if (d > 1) {
      const unusedAttractions = cAttractions.filter(p => !usedPlaceNames.has(p.name));
      if (unusedAttractions.length > 0) {
        dayAnchor = unusedAttractions[0];
      }
    }

    let lastPlaceInDay = hotelChon; // Luôn bắt đầu ngày mới từ khách sạn

    function addActivity(time, type, label, placeObj, fallbackActivityText) {
      let travel_from = null;
      let travel_distance_km = null;
      let travel_duration_mins = null;
      let travel_cost = null;

      if (lastPlaceInDay && lastPlaceInDay.latitude && placeObj.latitude) {
        const dist = calculateDistance(lastPlaceInDay.latitude, lastPlaceInDay.longitude, placeObj.latitude, placeObj.longitude);
        if (dist > 0.2 && dist < 120) {
          travel_from = lastPlaceInDay.name;
          travel_distance_km = Number(dist.toFixed(1));
          travel_duration_mins = Math.max(5, Math.round((dist / 32) * 60));
          const transportCost = Math.round(dist * 14000 / 1000) * 1000;
          travel_cost = `~${transportCost.toLocaleString('vi-VN')}đ`;
        }
      }
      
      const realDesc = sinhMoTaThucTe(placeObj, type, diemDen) || fallbackActivityText;
      const activityText = realDesc;
      
      actDay.push({
        time,
        type,
        label,
        place: placeObj.name,
        address: placeObj.address || `Khu vực ${diemDen}`,
        activity: activityText,
        estimated_cost: placeObj.estimated_cost || 50000,
        rating: placeObj.rating || 4.7,
        review_count: taoSoLuongDanhGia(placeObj.name),
        tags: Array.isArray(placeObj.tags) && placeObj.tags.length > 0 ? placeObj.tags.slice(0, 3) : [],
        image: placeObj.image || null,
        latitude: placeObj.latitude || null,
        longitude: placeObj.longitude || null,
        travel_from,
        travel_distance_km,
        travel_duration_mins,
        travel_cost,
        // Bổ sung 5 nhóm dữ liệu mới & trường theo chiến lược Gom nguồn cào
        open_hours: placeObj.open_hours || layGioMoCuaUocTinh(type),
        dwell_time: placeObj.dwell_time || (type === 'attraction' ? '1.5 - 2 tiếng' : type === 'cafe' ? '45 phút' : '1 tiếng'),
        best_time: placeObj.best_time || (type === 'cafe' ? '15:00 - 17:00' : 'Tuỳ chọn'),
        is_indoor: placeObj.is_indoor !== undefined ? placeObj.is_indoor : (type === 'cafe' || type === 'restaurant' || type === 'hotel'),
        signature_dishes: placeObj.signature_dishes || [],
        signature_highlight: placeObj.signature_highlight || '',
        price_range: placeObj.price_range || '',
        ticket_price: placeObj.ticket_price || (type === 'attraction' ? placeObj.estimated_cost : undefined),
        dress_code: placeObj.dress_code || (type === 'attraction' ? 'Trang phục lịch sự, mang giày bệt/thể thao' : 'Tự do thoải mái'),
        closing_days: placeObj.closing_days || (type === 'attraction' ? 'Mở cửa tất cả các ngày trong tuần' : ''),
        source_target: placeObj.source_target || 'Targeted Multi-Source'
      });
      lastPlaceInDay = placeObj;
    }

    const restSang = layDiaDiemKhongTrung(cRestaurants.length > 0 ? cRestaurants : availableRestaurants, `Điểm tâm đặc sản ${diemDen}`, 'restaurant', 45000, dayAnchor)
    addActivity('07:30', 'breakfast', 'Ăn sáng', restSang, `Thưởng thức món ngon đặc trưng xứ ${diemDen}`)

    const attSang = layDiaDiemKhongTrung(cAttractions.length > 0 ? cAttractions : availableAttractions, `Danh thắng nổi tiếng ${diemDen}`, 'attraction', 100000, dayAnchor)
    addActivity('09:00', 'attraction', 'Tham quan / Check-in', attSang, `Khám phá địa danh biểu tượng của ${diemDen}`)

    const restTrua = layDiaDiemKhongTrung(cRestaurants.length > 0 ? cRestaurants : availableRestaurants, `Nhà hàng đặc sản ${diemDen}`, 'restaurant', 150000, lastPlaceInDay)
    addActivity('12:00', 'lunch', 'Ăn trưa', restTrua, `Dùng bữa trưa với các món đặc sản địa phương`)

    if (d === 1) {
      let taxiNote = '';
      if (lastPlaceInDay.latitude && hotelChon.latitude) {
        const distToHotel = calculateDistance(lastPlaceInDay.latitude, lastPlaceInDay.longitude, hotelChon.latitude, hotelChon.longitude);
        if (distToHotel > 2 && distToHotel < 1000) {
            taxiNote = ` (Taxi về KS ~${distToHotel.toFixed(1)}km, ~${(Math.round(distToHotel * 15)).toLocaleString('vi-VN')}k)`;
        }
      }
      actDay.push({
        time: '14:00',
        type: 'checkin',
        label: 'Nhận phòng',
        place: hotelChon.name,
        address: hotelChon.address || `Trung tâm ${diemDen}`,
        activity: `Làm thủ tục nhận phòng tại ${hotelChon.name}, nghỉ ngơi thư giãn.${taxiNote}`,
        estimated_cost: 0
      })
      lastPlaceInDay = hotelChon;
    } else if (d === soNgay) {
      actDay.push({
        time: '12:00',
        type: 'checkout',
        label: 'Trả phòng',
        place: hotelChon.name,
        address: hotelChon.address || `Trung tâm ${diemDen}`,
        activity: `Làm thủ tục trả phòng, gửi hành lý tại quầy lễ tân.`,
        estimated_cost: 0
      })
      lastPlaceInDay = hotelChon;
    } else {
      const cafeChieu = layDiaDiemKhongTrung(cCafes.length > 0 ? cCafes : availableCafes, `Quán Cafe view đẹp ${diemDen}`, 'cafe', 50000, lastPlaceInDay)
      addActivity('14:30', 'cafe', 'Cafe & Chill', cafeChieu, `Thưởng thức cafe và nghỉ ngơi nhẹ`)
    }

    const attChieu = layDiaDiemKhongTrung(cAttractions.length > 0 ? cAttractions : availableAttractions, `Điểm check-in chiều ${diemDen}`, 'attraction', 50000, lastPlaceInDay)
    addActivity('16:00', 'attraction', 'Tham quan / Check-in', attChieu, `Tiếp tục hành trình tham quan buổi chiều`)

    const restToi = layDiaDiemKhongTrung(cRestaurants.length > 0 ? cRestaurants : availableRestaurants, `Nhà hàng ăn tối ${diemDen}`, 'restaurant', 200000, lastPlaceInDay)
    addActivity('19:00', 'dinner', 'Ăn tối', restToi, `Dùng bữa tối, khám phá ẩm thực về đêm`)

    mangNgay.push({ day: d, activities: actDay })
    previousAnchor = dayAnchor;
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

  // Bổ sung địa chỉ và tọa độ từ DB nếu AI chưa điền cho activity
  const diaDiemList = diaDiemDatabase || []
  const placeDataMap = new Map(diaDiemList.map(p => [p.name.toLowerCase().trim(), p]))

  const updatedDays = (lichTrinh.days || []).map(day => {
    let prevNode = lichTrinh.hotel_recommendation || defaultHotel;
    const activities = (day.activities || []).map(act => {
      let addr = act.address
      let lat = act.latitude || null
      let lng = act.longitude || null
      const actName = (act.place || '').toLowerCase().trim()
      
      let foundPlace = null
      if (placeDataMap.has(actName)) {
        foundPlace = placeDataMap.get(actName)
      } else {
        // Tìm kiếm tương đối
        for (const [pName, pData] of placeDataMap.entries()) {
          if (pName.length > 3 && (actName.includes(pName) || pName.includes(actName) || (pName.length > 5 && actName.slice(0, 10) === pName.slice(0, 10)))) {
            foundPlace = pData
            break
          }
        }
      }

      if (foundPlace) {
        addr = foundPlace.address || addr
        lat = foundPlace.latitude || lat
        lng = foundPlace.longitude || lng
      }

      if (!addr || addr === duLieu.destination) {
        addr = `Thành phố ${duLieu.destination}`
      }

      let activityText = act.activity || '';
      // Trích xuất travel note nếu có trong activityText
      let extractedTravel = null;
      const transportMatch = activityText.match(/\(Từ (.*?) di chuyển ~([0-9.]+)km, khoảng ([0-9]+) phút(?:, phí taxi ước tính (.*?))?\)/);
      if (transportMatch) {
        extractedTravel = {
          from: transportMatch[1],
          distance_km: parseFloat(transportMatch[2]),
          duration_mins: parseInt(transportMatch[3], 10),
          cost: transportMatch[4] || null
        };
      }

      // Xóa bỏ chuỗi (Từ ... di chuyển ...) khỏi activityText để câu mô tả được thanh lịch
      activityText = activityText.replace(/\s*\(Từ [^)]*?di chuyển[^)]*?\)/g, '').trim();

      const isRedundant = !activityText ||
        activityText.includes('chất lượng cao trên Google Maps') ||
        activityText.includes('Thưởng thức/tham quan: Địa điểm') ||
        activityText.includes('Địa điểm du lịch tham quan chất lượng') ||
        activityText.startsWith('Thưởng thức/tham quan:');

      if (isRedundant) {
        activityText = sinhMoTaThucTe(foundPlace || { name: act.place, type: act.type }, act.type, duLieu.destination);
      }

      // Tính toán ETA di chuyển từ vị trí trước đó / khách sạn tới điểm đến
      let travel_from = act.travel_from || extractedTravel?.from || null;
      let travel_distance_km = act.travel_distance_km || extractedTravel?.distance_km || null;
      let travel_duration_mins = act.travel_duration_mins || extractedTravel?.duration_mins || null;
      let travel_cost = act.travel_cost || extractedTravel?.cost || null;

      if (!travel_from && prevNode && prevNode.latitude && lat) {
        const dist = calculateDistance(prevNode.latitude, prevNode.longitude, lat, lng);
        if (dist > 0.2 && dist < 120) {
          travel_from = prevNode.name;
          travel_distance_km = Number(dist.toFixed(1));
          travel_duration_mins = Math.max(5, Math.round((dist / 32) * 60));
          const cost = Math.round(dist * 14000 / 1000) * 1000;
          travel_cost = `~${cost.toLocaleString('vi-VN')}đ`;
        }
      }

      if (lat && lng) {
        prevNode = { name: act.place, latitude: lat, longitude: lng };
      }

      const isIndoor = act.type === 'cafe' || act.type === 'restaurant' || act.type === 'hotel';
        const resolvedOpenHours = act.open_hours || foundPlace?.open_hours || layGioMoCuaUocTinh(act.type);
        
        // --- 1. Time Conflict Validator ---
        let time_conflict = false;
        let time_conflict_msg = '';
        if (act.time && resolvedOpenHours) {
          const timeMatch = act.time.match(/^(\d{2}):(\d{2})/);
          // Match the first HH:mm in open_hours (assuming it represents opening time)
          const openMatch = resolvedOpenHours.match(/(\d{2}):(\d{2})/); 
          if (timeMatch && openMatch && !resolvedOpenHours.toLowerCase().includes('24/24') && !resolvedOpenHours.toLowerCase().includes('cả ngày')) {
            const actMins = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
            const openMins = parseInt(openMatch[1], 10) * 60 + parseInt(openMatch[2], 10);
            if (actMins < openMins) {
              time_conflict = true;
              time_conflict_msg = `Chú ý: Bạn đến lúc ${act.time} nhưng địa điểm mở cửa lúc ${openMatch[1]}:${openMatch[2]}.`;
            }
          }
        }

        return {
          ...act,
          address: addr,
          activity: activityText,
          latitude: lat,
          longitude: lng,
          travel_from,
          travel_distance_km,
          travel_duration_mins,
          travel_cost,
          rating: act.rating || foundPlace?.rating || 4.7,
          review_count: act.review_count || (foundPlace?.review_count ? `${foundPlace.review_count}` : taoSoLuongDanhGia(act.place)),
          open_hours: resolvedOpenHours,
          time_conflict,
          time_conflict_msg,
          tags: act.tags || (Array.isArray(foundPlace?.tags) && foundPlace.tags.length > 0 ? foundPlace.tags.slice(0, 3) : []),
          image: act.image || foundPlace?.image || null,
          // Bổ sung 5 nhóm dữ liệu mới
          dwell_time: act.dwell_time || foundPlace?.dwell_time || (act.type === 'attraction' ? '1.5 - 2 tiếng' : act.type === 'cafe' ? '45 phút' : '1 tiếng'),
          best_time: act.best_time || foundPlace?.best_time || (act.type === 'cafe' ? '15:00 - 17:00' : 'Tuỳ chọn'),
          is_indoor: act.is_indoor !== undefined ? act.is_indoor : (foundPlace?.is_indoor !== undefined ? foundPlace.is_indoor : isIndoor),
          signature_dishes: act.signature_dishes || foundPlace?.signature_dishes || [],
          price_range: act.price_range || foundPlace?.price_range || '',
          dress_code: act.dress_code || foundPlace?.dress_code || (act.type === 'attraction' ? 'Trang phục lịch sự, mang giày bệt' : 'Tự do')
        }
    });
    return {
      ...day,
      activities
    };
  });

  const finalResult = {
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
    daysList: updatedDays,
    days: updatedDays
  }
  require('fs').writeFileSync('debug_plan.json', JSON.stringify(finalResult, null, 2))
  return finalResult
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