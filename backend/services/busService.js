// busService.js - Dịch vụ tra cứu và gợi ý nhà xe giá rẻ, tối ưu chi phí di chuyển
// Hỗ trợ các tuyến Bắc - Trung - Nam và liên tỉnh Miền Trung & Tây Nguyên

// Tọa độ và khoảng cách tham chiếu các tỉnh/thành lớn (km tính từ Hà Nội & TP.HCM)
const CITY_DISTANCES = {
  'Hà Nội': {
    'Thanh Hóa': 159,
    'Nghệ An': 298,
    'Hà Tĩnh': 348,
    'Quảng Bình': 493,
    'Quảng Trị': 599,
    'Huế': 669,
    'Thừa Thiên Huế': 669,
    'Đà Nẵng': 768,
    'Quảng Nam': 829,
    'Hội An': 800,
    'Quảng Ngãi': 901,
    'Bình Định': 1077,
    'Quy Nhơn': 1077,
    'Phú Yên': 1160,
    'Khánh Hòa': 1272,
    'Nha Trang': 1272,
    'Ninh Thuận': 1368,
    'Bình Thuận': 1513,
    'Kon Tum': 1049,
    'Gia Lai': 1095,
    'Đắk Lắk': 1273,
    'Đắk Nông': 1383,
    'Lâm Đồng': 1398,
    'Đà Lạt': 1398,
    'TP. Hồ Chí Minh': 1720,
    'Hải Phòng': 110,
    'Cần Thơ': 1610
  },
  'TP. Hồ Chí Minh': {
    'Bình Thuận': 176,
    'Đắk Nông': 228,
    'Lâm Đồng': 297,
    'Đà Lạt': 297,
    'Ninh Thuận': 322,
    'Đắk Lắk': 348,
    'Khánh Hòa': 423,
    'Nha Trang': 423,
    'Gia Lai': 517,
    'Phú Yên': 531,
    'Kon Tum': 555,
    'Bình Định': 629,
    'Quy Nhơn': 629,
    'Quảng Ngãi': 754,
    'Quảng Nam': 819,
    'Hội An': 825,
    'Đà Nẵng': 851,
    'Huế': 935,
    'Thừa Thiên Huế': 935,
    'Quảng Trị': 947,
    'Quảng Bình': 1037,
    'Hà Tĩnh': 1182,
    'Nghệ An': 1195,
    'Thanh Hóa': 1328,
    'Hà Nội': 1720,
    'Cần Thơ': 176
  },
  'Đà Nẵng': {
    'Quảng Nam': 65,
    'Hội An': 30,
    'Huế': 95,
    'Thừa Thiên Huế': 95,
    'Quảng Ngãi': 144,
    'Quảng Trị': 171,
    'Quảng Bình': 272,
    'Kon Tum': 292,
    'Bình Định': 305,
    'Quy Nhơn': 305,
    'Gia Lai': 338,
    'Phú Yên': 388,
    'Hà Tĩnh': 426,
    'Nghệ An': 474,
    'Khánh Hòa': 500,
    'Nha Trang': 500,
    'Đắk Lắk': 516,
    'Ninh Thuận': 596,
    'Thanh Hóa': 613,
    'Lâm Đồng': 626,
    'Đà Lạt': 626,
    'Đắk Nông': 626,
    'Bình Thuận': 741,
    'Hà Nội': 768,
    'TP. Hồ Chí Minh': 851
  }
}

// Danh mục nhà xe giá rẻ, chất lượng cao theo từng hành lang tuyến
const BUS_DATABASE = [
  // --- TUYẾN HÀ NỘI <-> ĐÀ NẴNG / HUẾ / MIỀN TRUNG ---
  {
    name: 'Camel Travel',
    routes: ['Hà Nội - Đà Nẵng', 'Hà Nội - Huế', 'Hà Nội - Quảng Bình'],
    type: 'Giường nằm 40 chỗ VIP (Điều hòa, Wifi, Nước uống)',
    price: 320000,
    departureTimes: ['17:30', '18:30', '19:15'],
    duration: '14 - 15 giờ',
    phone: '024 3928 6666',
    pickup: 'VP 459 Trần Khát Chân, Hà Nội',
    dropoff: 'VP 65 Ba Đình, TP. Đà Nẵng',
    rating: 4.6,
    tags: ['Giá rẻ nhất', 'Có rèm riêng tư', 'Bao nước suối']
  },
  {
    name: 'Queen Cafe Open Bus',
    routes: ['Hà Nội - Đà Nẵng', 'Hà Nội - Huế'],
    type: 'Giường nằm chất lượng cao',
    price: 350000,
    departureTimes: ['18:00', '18:45'],
    duration: '14 giờ',
    phone: '024 3903 6036',
    pickup: '208 Trần Quang Khải, Hoàn Kiếm, HN',
    dropoff: '28 Đường 3/2, Hải Châu, Đà Nẵng',
    rating: 4.7,
    tags: ['Chuyên khách du lịch', 'Sạch sẽ', 'Đúng giờ']
  },
  {
    name: 'Kim Chi 265',
    routes: ['Hà Nội - Đà Nẵng', 'Hà Nội - Nghệ An', 'Hà Nội - Hà Tĩnh'],
    type: 'Limousine 34 phòng VIP / Cung điện di động',
    price: 450000,
    departureTimes: ['19:00', '20:15', '21:00'],
    duration: '13 giờ',
    phone: '0905 669 265',
    pickup: 'Bến xe Nước Ngầm, Hoàng Mai, HN',
    dropoff: 'Bến xe Trung tâm Đà Nẵng',
    rating: 4.8,
    tags: ['Phòng VIP riêng', 'Màn hình TV cá nhân', 'Sạc điện thoại']
  },
  {
    name: 'Vạn Lục Tùng',
    routes: ['Hà Nội - Đà Nẵng', 'Hà Nội - Quảng Trị'],
    type: 'Giường nằm cao cấp',
    price: 380000,
    departureTimes: ['16:00', '17:00'],
    duration: '14 giờ',
    phone: '0236 3991 991',
    pickup: 'Bến xe Giáp Bát / Nước Ngầm',
    dropoff: 'Bến xe Trung tâm Đà Nẵng',
    rating: 4.5,
    tags: ['Bác tài kinh nghiệm', 'Xe êm ái']
  },
  {
    name: 'Hưng Long',
    routes: ['Hà Nội - Quảng Bình', 'Hà Nội - Quảng Trị', 'Hà Nội - Huế'],
    type: 'Giường nằm 38 chỗ & Limousine',
    price: 280000,
    departureTimes: ['18:30', '19:30', '20:30'],
    duration: '9 - 10 giờ',
    phone: '024 3688 9898',
    pickup: '338 Trần Khát Chân / 26 Phạm Hùng',
    dropoff: 'VP Đồng Hới / Bến xe Đồng Hới, Quảng Bình',
    rating: 4.7,
    tags: ['Trùm tuyến Quảng Bình', 'Đón tận nơi trung tâm']
  },

  // --- TUYẾN SÀI GÒN (TP.HCM) <-> ĐÀ NẴNG / MIỀN TRUNG / TÂY NGUYÊN ---
  {
    name: 'Phương Trang (FUTA Bus Lines)',
    routes: [
      'TP. Hồ Chí Minh - Đà Nẵng',
      'TP. Hồ Chí Minh - Nha Trang',
      'TP. Hồ Chí Minh - Đà Lạt',
      'TP. Hồ Chí Minh - Quy Nhơn',
      'TP. Hồ Chí Minh - Quảng Ngãi',
      'Đà Nẵng - Đà Lạt',
      'Đà Nẵng - Nha Trang'
    ],
    type: 'Giường nằm 40 chỗ / Limousine 34 chỗ',
    price: 395000,
    departureTimes: ['11:00', '13:00', '15:00', '17:30', '19:00'],
    duration: '16 - 18 giờ (ĐN) / 8 giờ (Nha Trang) / 6 giờ (Đà Lạt)',
    phone: '1900 6067',
    pickup: 'Bến xe Miền Đông mới / VP 272 Đề Thám, Q1, TP.HCM',
    dropoff: 'Bến xe Trung tâm Đà Nẵng / Bến xe Phía Nam Nha Trang',
    rating: 4.7,
    tags: ['Thương hiệu quốc gia', 'Nhiều chuyến nhất', 'Trung chuyển tận nơi']
  },
  {
    name: 'Thuận Thảo',
    routes: ['TP. Hồ Chí Minh - Đà Nẵng', 'TP. Hồ Chí Minh - Quy Nhơn', 'TP. Hồ Chí Minh - Phú Yên'],
    type: 'Giường nằm cao cấp',
    price: 350000,
    departureTimes: ['14:00', '16:30', '18:00'],
    duration: '17 giờ',
    phone: '028 3511 2957',
    pickup: 'Bến xe Miền Đông',
    dropoff: 'Bến xe Đà Nẵng / Bến xe Tuy Hòa',
    rating: 4.6,
    tags: ['Uy tín lâu năm', 'Giá mềm', 'Không nhồi nhét']
  },
  {
    name: 'Cúc Tùng Limousine',
    routes: ['TP. Hồ Chí Minh - Nha Trang', 'TP. Hồ Chí Minh - Khánh Hòa', 'Đà Nẵng - Nha Trang'],
    type: 'Limousine VIP 9 chỗ & Giường phòng 22 chỗ',
    price: 250000,
    departureTimes: ['08:00', '10:00', '20:30', '21:30'],
    duration: '7 - 8 giờ',
    phone: '1900 6606',
    pickup: 'Bến xe Miền Đông / Bến xe An Sương',
    dropoff: 'Bến xe Phía Nam Nha Trang / 198 Ngô Gia Tự',
    rating: 4.8,
    tags: ['Ghế massage', 'Êm ái chuẩn resort', 'Bao wifi & sạc']
  },
  {
    name: 'An Phú Busline',
    routes: ['TP. Hồ Chí Minh - Quy Nhơn', 'TP. Hồ Chí Minh - Đà Nẵng'],
    type: 'Cabin đôi & Giường nằm Luxury',
    price: 330000,
    departureTimes: ['17:00', '18:30', '19:45'],
    duration: '12 - 16 giờ',
    phone: '0938 413 699',
    pickup: 'VP Bình Thạnh / Bến xe Miền Đông mới',
    dropoff: 'Bến xe Quy Nhơn / Bến xe Đà Nẵng',
    rating: 4.7,
    tags: ['Cabin sang trọng', 'Có phòng đôi cho cặp đôi']
  },
  {
    name: 'Chín Nghĩa',
    routes: ['TP. Hồ Chí Minh - Quảng Ngãi', 'Hà Nội - Quảng Ngãi'],
    type: 'Giường nằm Limousine cao cấp',
    price: 310000,
    departureTimes: ['13:00', '15:00', '17:00'],
    duration: '15 giờ',
    phone: '1900 636 636',
    pickup: 'Bến xe Miền Đông',
    dropoff: 'Bến xe Quảng Ngãi (06 Bà Triệu)',
    rating: 4.7,
    tags: ['Uy tín số 1 tuyến Quảng Ngãi', 'Cơm xe miễn phí']
  },
  {
    name: 'Thành Bưởi',
    routes: ['TP. Hồ Chí Minh - Đà Lạt', 'TP. Hồ Chí Minh - Lâm Đồng'],
    type: 'Limousine 34 phòng & Giường nằm 29 chỗ',
    price: 290000,
    departureTimes: ['Chạy liên tục mỗi 30 phút/chuyến từ 06:00 đến 23:00'],
    duration: '6 giờ',
    phone: '1900 6079',
    pickup: 'Lê Hồng Phong, Q5 / Hàng Xanh, TP.HCM',
    dropoff: 'Bến xe Thành Bưởi Đà Lạt / Trung chuyển tận khách sạn',
    rating: 4.8,
    tags: ['Chuyên tuyến Đà Lạt', 'Xe mới tinh', 'Đúng giờ 100%']
  },

  // --- TUYẾN LIÊN TỈNH MIỀN TRUNG & TÂY NGUYÊN ---
  {
    name: 'HAV Travel Limousine',
    routes: ['Đà Nẵng - Huế', 'Huế - Đà Nẵng', 'Đà Nẵng - Hội An'],
    type: 'Limousine 9 chỗ VIP đưa đón tận nơi',
    price: 150000,
    departureTimes: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00'],
    duration: '1.5 - 2 giờ',
    phone: '0234 6545 454',
    pickup: 'Sân bay Đà Nẵng / Khách sạn trung tâm ĐN',
    dropoff: 'Trung tâm TP. Huế / Đại Nội',
    rating: 4.9,
    tags: ['Đưa đón tận cửa', 'Nhanh chóng', 'Không bắt khách dọc đường']
  },
  {
    name: 'Sơn Tùng',
    routes: ['Đà Nẵng - Quy Nhơn', 'Quy Nhơn - Đà Nẵng', 'Đà Nẵng - Quảng Ngãi'],
    type: 'Limousine 16 chỗ & Giường nằm cao cấp',
    price: 180000,
    departureTimes: ['06:30', '08:30', '10:30', '13:30', '16:00'],
    duration: '5 - 6 giờ',
    phone: '1900 5555 23',
    pickup: 'Bến xe Trung tâm Đà Nẵng',
    dropoff: 'Bến xe Quy Nhơn (71 Tây Sơn)',
    rating: 4.8,
    tags: ['Tuyến ĐN - Quy Nhơn tốt nhất', 'Khăn lạnh nước suối']
  },
  {
    name: 'Quốc Đạt',
    routes: ['Đà Nẵng - Đắk Lắk', 'Đà Nẵng - Gia Lai', 'Huế - Đắk Lắk'],
    type: 'Giường nằm 40 chỗ & Limousine',
    price: 270000,
    departureTimes: ['18:00', '19:30', '20:30'],
    duration: '10 - 12 giờ',
    phone: '0914 068 989',
    pickup: 'Bến xe Đà Nẵng',
    dropoff: 'Bến xe Buôn Ma Thuột / Pleiku',
    rating: 4.5,
    tags: ['Chuyên tuyến Tây Nguyên', 'Khoang hành lý rộng']
  },
  {
    name: 'Điền Linh',
    routes: ['Đà Nẵng - Lâm Đồng', 'Đà Nẵng - Đà Lạt', 'Thanh Hóa - Đà Lạt'],
    type: 'Limousine phòng nằm cao cấp',
    price: 330000,
    departureTimes: ['15:30', '17:00'],
    duration: '14 giờ',
    phone: '0263 398 7777',
    pickup: 'Bến xe Trung tâm Đà Nẵng',
    dropoff: 'Bến xe Liên tỉnh Đà Lạt',
    rating: 4.6,
    tags: ['Phòng VIP riêng tư', 'Bác tài cẩn thận']
  }
]

const path = require('path')
const fs = require('fs')

let CRAWLED_DISTANCES = {}
try {
  const jsonPath = path.resolve(__dirname, '../data/distance_matrix.json')
  if (fs.existsSync(jsonPath)) {
    const list = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    list.forEach(item => {
      if (!CRAWLED_DISTANCES[item.origin]) CRAWLED_DISTANCES[item.origin] = {}
      CRAWLED_DISTANCES[item.origin][item.destination] = item.distance_km
    })
  }
} catch (e) {}

// Hàm ước tính cự ly giữa 2 tỉnh thành bất kỳ
function getRouteDistance(origin, destination) {
  let org = origin.trim()
  let dest = destination.trim()

  // Ưu tiên đọc từ dữ liệu cào OpenStreetMap OSRM
  if (CRAWLED_DISTANCES[org] && CRAWLED_DISTANCES[org][dest]) {
    return CRAWLED_DISTANCES[org][dest]
  }
  if (CRAWLED_DISTANCES[dest] && CRAWLED_DISTANCES[dest][org]) {
    return CRAWLED_DISTANCES[dest][org]
  }

  if (CITY_DISTANCES[org] && CITY_DISTANCES[org][dest]) {
    return CITY_DISTANCES[org][dest]
  }
  if (CITY_DISTANCES[dest] && CITY_DISTANCES[dest][org]) {
    return CITY_DISTANCES[dest][org]
  }

  // Nếu cùng thành phố
  if (org.toLowerCase() === dest.toLowerCase()) {
    return 15
  }

  // Ước lượng thông minh theo trục địa lý
  if (org.includes('Hà Nội') || org.includes('Hải Phòng') || org.includes('Quảng Ninh')) {
    if (dest.includes('Đà Nẵng') || dest.includes('Hội An')) return 760
    if (dest.includes('Huế')) return 660
    if (dest.includes('Quảng Bình')) return 500
    if (dest.includes('Nha Trang')) return 1280
    if (dest.includes('Đà Lạt')) return 1420
    if (dest.includes('Quy Nhơn')) return 1050
    return 700
  }

  if (org.includes('Hồ Chí Minh') || org.includes('Sài Gòn') || org.includes('Bình Dương') || org.includes('Đồng Nai') || org.includes('Cần Thơ')) {
    if (dest.includes('Đà Nẵng') || dest.includes('Hội An')) return 850
    if (dest.includes('Huế')) return 950
    if (dest.includes('Nha Trang')) return 430
    if (dest.includes('Đà Lạt')) return 300
    if (dest.includes('Quy Nhơn')) return 650
    if (dest.includes('Đắk Lắk')) return 350
    return 600
  }

  // Mặc định khoảng cách trung bình liên tỉnh miền Trung
  return 350
}

// Hàm tính toán chi phí các phương tiện và gợi ý nhà xe giá rẻ
function timKiemNhaXeVaToiUuChiPhi({ origin = 'Hà Nội', destination = 'Đà Nẵng', people = 1 }) {
  const numPeople = Math.max(1, Number(people) || 1)
  const distance = getRouteDistance(origin, destination)

  // 1. Lọc các nhà xe phù hợp trong database
  const matchingOperators = []
  const normOrigin = origin.toLowerCase()
  const normDest = destination.toLowerCase()

  for (const bus of BUS_DATABASE) {
    const isMatch = bus.routes.some(r => {
      const lowerR = r.toLowerCase()
      const hasDest = lowerR.includes(normDest) || (normDest.includes('đà nẵng') && lowerR.includes('đà nẵng')) || (normDest.includes('hội an') && lowerR.includes('đà nẵng'))
      const hasOrg = lowerR.includes(normOrigin) || 
                     (normOrigin.includes('hà nội') && lowerR.includes('hà nội')) ||
                     (normOrigin.includes('hồ chí minh') && lowerR.includes('hồ chí minh')) ||
                     (normOrigin.includes('sài gòn') && lowerR.includes('hồ chí minh')) ||
                     (normOrigin.includes('đà nẵng') && lowerR.includes('đà nẵng'))
      return hasDest && hasOrg
    })

    if (isMatch) {
      matchingOperators.push({
        ...bus,
        totalForGroup: bus.price * numPeople
      })
    }
  }

  // Nếu không có nhà xe khớp chính xác tuyến, tạo gợi ý từ các nhà xe thương hiệu quốc gia (Phương Trang, Mai Linh)
  if (matchingOperators.length === 0) {
    const estimatedBusPrice = Math.max(180000, Math.min(550000, Math.round((distance * 480) / 10000) * 10000))
    matchingOperators.push({
      name: 'Phương Trang (FUTA Bus Lines)',
      routes: [`${origin} - ${destination}`],
      type: 'Xe khách Giường nằm 40 chỗ chất lượng cao',
      price: estimatedBusPrice,
      totalForGroup: estimatedBusPrice * numPeople,
      departureTimes: ['08:00', '14:00', '19:30', '21:00'],
      duration: `${Math.round(distance / 50)} - ${Math.round(distance / 50) + 2} giờ`,
      phone: '1900 6067',
      pickup: `Bến xe liên tỉnh ${origin}`,
      dropoff: `Bến xe trung tâm ${destination}`,
      rating: 4.7,
      tags: ['Độ phủ toàn quốc', 'Uy tín', 'Đặt vé online']
    })

    matchingOperators.push({
      name: 'Nhà xe Liên Tỉnh Hoàng Long / Mai Linh Express',
      routes: [`${origin} - ${destination}`],
      type: 'Giường nằm cao cấp',
      price: Math.max(160000, estimatedBusPrice - 30000),
      totalForGroup: (estimatedBusPrice - 30000) * numPeople,
      departureTimes: ['17:00', '19:00'],
      duration: `${Math.round(distance / 50)} giờ`,
      phone: '0225 3920 920',
      pickup: `Bến xe ${origin}`,
      dropoff: `Bến xe ${destination}`,
      rating: 4.5,
      tags: ['Giá tiết kiệm', 'Chạy đúng tuyến']
    })
  }

  // Sắp xếp nhà xe theo giá rẻ nhất lên đầu
  matchingOperators.sort((a, b) => a.price - b.price)

  // 2. Tính toán bảng so sánh chi phí các phương tiện
  const cheapestBusPrice = matchingOperators[0].price
  const trainPrice = Math.round(cheapestBusPrice * 1.35)
  const flightPrice = distance > 400 ? Math.round(cheapestBusPrice * 2.8) : null
  const motorbikeCost = Math.round(distance * 350) // tiền xăng xe máy

  const costComparison = [
    {
      vehicle: 'Xe khách giường nằm',
      icon: '🚌',
      pricePerPerson: cheapestBusPrice,
      totalForGroup: cheapestBusPrice * numPeople,
      durationHours: Math.max(2, Math.round(distance / 50)),
      recommendation: 'LỰA CHỌN TIẾT KIỆM NHẤT',
      badgeClass: 'badge-optimal',
      pros: 'Giá vé rẻ, đi đêm tiết kiệm 1 đêm khách sạn, nhiều khung giờ khởi hành.',
      cons: 'Thời gian đi dài hơn máy bay.'
    },
    {
      vehicle: 'Tàu hỏa (Đường sắt VN)',
      icon: '🚆',
      pricePerPerson: trainPrice,
      totalForGroup: trainPrice * numPeople,
      durationHours: Math.max(2, Math.round(distance / 55)),
      recommendation: 'NGẮM CẢNH THƯ THÁI',
      badgeClass: 'badge-train',
      pros: 'An toàn cao, ngắm cảnh đèo núi tuyệt đẹp, giường nằm thoải mái.',
      cons: 'Tốc độ vừa phải, cần đặt vé trước dịp lễ.'
    }
  ]

  if (flightPrice && distance > 400) {
    costComparison.push({
      vehicle: 'Máy bay (Vietjet / Bamboo / VNA)',
      icon: '✈️',
      pricePerPerson: flightPrice,
      totalForGroup: flightPrice * numPeople,
      durationHours: 1.5,
      recommendation: 'TIẾT KIỆM THỜI GIAN NHẤT',
      badgeClass: 'badge-flight',
      pros: 'Chỉ mất 1h15 - 1h30 bay, nhanh chóng, giữ sức đi chơi.',
      cons: 'Chi phí cao hơn xe khách 2.5 - 3 lần.'
    })
  }

  if (distance <= 250) {
    costComparison.push({
      vehicle: 'Xe máy cá nhân / Phượt',
      icon: '🛵',
      pricePerPerson: Math.round(motorbikeCost / numPeople),
      totalForGroup: motorbikeCost,
      durationHours: Math.max(1, Math.round(distance / 40)),
      recommendation: 'PHƯỢT TỰ DO',
      badgeClass: 'badge-bike',
      pros: 'Chủ động dừng đỗ check-in mọi cung đường đẹp.',
      cons: 'Mệt mỏi khi trời nắng gắt hoặc mưa gió miền Trung.'
    })
  }

  return {
    origin,
    destination,
    distanceKm: distance,
    people: numPeople,
    cheapestBusPrice,
    cheapestBusTotal: cheapestBusPrice * numPeople,
    bestBusOperator: matchingOperators[0],
    operators: matchingOperators,
    costComparison
  }
}

module.exports = {
  timKiemNhaXeVaToiUuChiPhi,
  getRouteDistance,
  BUS_DATABASE
}
