// busService.js (Frontend) - Tra cứu nhà xe giá rẻ, tính cự ly và tối ưu chi phí di chuyển

export const POPULAR_ORIGINS = [
  { name: 'Hà Nội', icon: '🏛️', tag: 'Miền Bắc' },
  { name: 'TP. Hồ Chí Minh', icon: '🏙️', tag: 'Miền Nam' },
  { name: 'Đà Nẵng', icon: '🌉', tag: 'Miền Trung' },
  { name: 'Huế', icon: '👑', tag: 'Cố đô' },
  { name: 'Nha Trang', icon: '⛵', tag: 'Biển đảo' },
  { name: 'Hải Phòng', icon: '⚓', tag: 'Cảng biển' },
  { name: 'Cần Thơ', icon: '🌾', tag: 'Tây Nam Bộ' },
  { name: 'Buôn Ma Thuột', icon: '☕', tag: 'Tây Nguyên' },
  { name: 'Vinh (Nghệ An)', icon: '🌾', tag: 'Bắc Trung Bộ' }
]

export const CITY_DISTANCES = {
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

export const BUS_DATABASE = [
  // --- Tuyến Hà Nội <-> Miền Trung ---
  {
    id: 'camel-travel',
    name: 'Camel Travel',
    routes: ['Hà Nội - Đà Nẵng', 'Hà Nội - Huế', 'Hà Nội - Quảng Bình'],
    type: 'Giường nằm 40 chỗ VIP',
    price: 320000,
    departureTimes: ['17:30', '18:30', '19:15'],
    duration: '14 - 15 giờ',
    phone: '024 3928 6666',
    pickup: 'VP 459 Trần Khát Chân, Hà Nội',
    dropoff: 'VP 65 Ba Đình, TP. Đà Nẵng',
    rating: 4.6,
    tags: ['Giá rẻ nhất', 'Rèm riêng tư', 'Bao nước suối']
  },
  {
    id: 'queen-cafe',
    name: 'Queen Cafe Open Bus',
    routes: ['Hà Nội - Đà Nẵng', 'Hà Nội - Huế'],
    type: 'Giường nằm du lịch chất lượng cao',
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
    id: 'kim-chi-265',
    name: 'Kim Chi 265',
    routes: ['Hà Nội - Đà Nẵng', 'Hà Nội - Nghệ An', 'Hà Nội - Hà Tĩnh'],
    type: 'Limousine 34 phòng VIP (Cung điện di động)',
    price: 450000,
    departureTimes: ['19:00', '20:15', '21:00'],
    duration: '13 giờ',
    phone: '0905 669 265',
    pickup: 'Bến xe Nước Ngầm, Hoàng Mai, HN',
    dropoff: 'Bến xe Trung tâm Đà Nẵng',
    rating: 4.8,
    tags: ['Phòng VIP riêng', 'Màn hình TV', 'Cổng sạc USB']
  },
  {
    id: 'hung-long',
    name: 'Nhà xe Hưng Long',
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
  {
    id: 'van-luc-tung',
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

  // --- Tuyến TP.HCM (Sài Gòn) <-> Miền Trung & Tây Nguyên ---
  {
    id: 'phuong-trang',
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
    pickup: 'Bến xe Miền Đông mới / VP 272 Đề Thám, Q1',
    dropoff: 'Bến xe Trung tâm Đà Nẵng / Bến xe Phía Nam Nha Trang',
    rating: 4.7,
    tags: ['Thương hiệu quốc gia', 'Nhiều chuyến nhất', 'Trung chuyển tận nơi']
  },
  {
    id: 'thuan-thao',
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
    id: 'cuc-tung',
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
    id: 'an-phu-busline',
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
    tags: ['Cabin sang trọng', 'Có phòng cho cặp đôi']
  },
  {
    id: 'thanh-buoi',
    name: 'Thành Bưởi',
    routes: ['TP. Hồ Chí Minh - Đà Lạt', 'TP. Hồ Chí Minh - Lâm Đồng'],
    type: 'Limousine 34 phòng & Giường nằm 29 chỗ',
    price: 290000,
    departureTimes: ['Mỗi 30 phút/chuyến từ 06:00 - 23:00'],
    duration: '6 giờ',
    phone: '1900 6079',
    pickup: 'Lê Hồng Phong, Q5 / Hàng Xanh',
    dropoff: 'Bến xe Thành Bưởi Đà Lạt / Trung chuyển tận khách sạn',
    rating: 4.8,
    tags: ['Chuyên tuyến Đà Lạt', 'Xe mới tinh', 'Đúng giờ 100%']
  },
  {
    id: 'chin-nghia',
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
    tags: ['Uy tín số 1 Quảng Ngãi', 'Cơm xe miễn phí']
  },

  // --- Tuyến Liên tỉnh Miền Trung & Tây Nguyên ---
  {
    id: 'hav-travel',
    name: 'HAV Travel Limousine',
    routes: ['Đà Nẵng - Huế', 'Huế - Đà Nẵng', 'Đà Nẵng - Hội An'],
    type: 'Limousine 9 chỗ VIP đưa đón tận nơi',
    price: 150000,
    departureTimes: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00'],
    duration: '1.5 - 2 giờ',
    phone: '0234 6545 454',
    pickup: 'Sân bay Đà Nẵng / Khách sạn trung tâm',
    dropoff: 'Trung tâm TP. Huế / Đại Nội',
    rating: 4.9,
    tags: ['Đưa đón tận cửa', 'Nhanh chóng', 'Không bắt khách dọc đường']
  },
  {
    id: 'son-tung',
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
    id: 'quoc-dat',
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
    id: 'dien-linh',
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

// Mốc KM đường bộ từ Hà Nội - bao gồm 63 tỉnh thành Việt Nam
const KM_MARKERS = {
  // === MIỀN BẮC ===
  'Hà Nội': 0,
  'Vĩnh Phúc': 50,
  'Bắc Ninh': 30,
  'Hải Dương': 60,
  'Hải Phòng': 100,
  'Hưng Yên': 55,
  'Hà Nam': 65,
  'Nam Định': 90,
  'Thái Bình': 110,
  'Ninh Bình': 120,
  'Hòa Bình': 75,
  'Phú Thọ': 80,
  'Thái Nguyên': 75,
  'Bắc Giang': 50,
  'Bắc Kạn': 165,
  'Quảng Ninh': 155,
  'Lạng Sơn': 155,
  'Cao Bằng': 280,
  'Hà Giang': 310,
  'Tuyên Quang': 165,
  'Yên Bái': 185,
  'Lào Cai': 290,
  'Điện Biên': 480,
  'Lai Châu': 420,
  'Sơn La': 320,
  // === MIỀN TRUNG ===
  'Thanh Hóa': 156,
  'Nghệ An': 291,
  'Vinh (Nghệ An)': 291,
  'Vinh': 291,
  'Hà Tĩnh': 341,
  'Quảng Bình': 491,
  'Đồng Hới': 491,
  'Quảng Trị': 598,
  'Huế': 654,
  'Thừa Thiên Huế': 654,
  'Đà Nẵng': 763,
  'Hội An': 795,
  'Quảng Nam': 824,
  'Quảng Ngãi': 884,
  'Bình Định': 1065,
  'Quy Nhơn': 1065,
  'Phú Yên': 1198,
  'Tuy Hòa': 1198,
  'Khánh Hòa': 1278,
  'Nha Trang': 1278,
  'Ninh Thuận': 1380,
  'Phan Rang': 1380,
  'Bình Thuận': 1520,
  'Phan Thiết': 1520,
  // === TÂY NGUYÊN ===
  'Kon Tum': 1050,
  'Gia Lai': 1090,
  'Pleiku': 1090,
  'Đắk Lắk': 1270,
  'Buôn Ma Thuột': 1270,
  'Đắk Nông': 1380,
  'Lâm Đồng': 1410,
  'Đà Lạt': 1410,
  // === MIỀN NAM ===
  'TP. Hồ Chí Minh': 1710,
  'Bình Dương': 1680,
  'Đồng Nai': 1730,
  'Bình Phước': 1750,
  'Tây Ninh': 1790,
  'Bà Rịa - Vũng Tàu': 1800,
  'Long An': 1770,
  'Tiền Giang': 1810,
  'Bến Tre': 1850,
  'Vĩnh Long': 1870,
  'Đồng Tháp': 1870,
  'An Giang': 1930,
  'Kiên Giang': 2030,
  'Hậu Giang': 1940,
  'Cần Thơ': 1880,
  'Sóc Trăng': 1970,
  'Trà Vinh': 1950,
  'Bạc Liêu': 2050,
  'Cà Mau': 2140
};

export function getEstimatedDistance(origin = 'Hà Nội', destination = 'Đà Nẵng') {
  const org = (origin || '').trim()
  const dest = (destination || '').trim()

  if (org.toLowerCase() === dest.toLowerCase()) return 15;

  // Fallback map override for specific complex paths
  if (CITY_DISTANCES[org] && CITY_DISTANCES[org][dest]) return CITY_DISTANCES[org][dest];
  if (CITY_DISTANCES[dest] && CITY_DISTANCES[dest][org]) return CITY_DISTANCES[dest][org];

  let markerOrg = KM_MARKERS[org];
  let markerDest = KM_MARKERS[dest];

  // Map "Nghệ An" to "Vinh (Nghệ An)", etc. by searching keys
  if (markerOrg === undefined) {
    const key = Object.keys(KM_MARKERS).find(k => org.includes(k) || k.includes(org));
    if (key) markerOrg = KM_MARKERS[key];
  }
  if (markerDest === undefined) {
    const key = Object.keys(KM_MARKERS).find(k => dest.includes(k) || k.includes(dest));
    if (key) markerDest = KM_MARKERS[key];
  }

  if (markerOrg !== undefined && markerDest !== undefined) {
    return Math.abs(markerOrg - markerDest);
  }

  return 350; // Fallback
}

export function getBusOperatorsForRoute(origin = 'Hà Nội', destination = 'Đà Nẵng', people = 1) {
  const numPeople = Math.max(1, Number(people) || 1)
  const distance = getEstimatedDistance(origin, destination)
  const normOrigin = (origin || '').toLowerCase().trim()
  const normDest = (destination || '').toLowerCase().trim()

  const matching = []

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
      matching.push({
        ...bus,
        totalForGroup: bus.price * numPeople
      })
    }
  }

  // Gợi ý bổ sung từ các nhà xe toàn quốc nếu không có tuyến trực tiếp cụ thể
  if (matching.length === 0) {
    const estimatedBusPrice = Math.max(180000, Math.min(550000, Math.round((distance * 480) / 10000) * 10000))
    matching.push({
      id: 'futa-auto',
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

    matching.push({
      id: 'hoang-long-auto',
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

  // Chuẩn hóa danh sách nhà xe có đầy đủ các trường mà giao diện yêu cầu
  const formattedOperators = matching.map(bus => ({
    id: bus.id || `bus-${bus.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: bus.name,
    badge: (bus.tags && bus.tags[0]) || bus.badge || 'Khuyên dùng',
    type: bus.type,
    rating: bus.rating || 4.6,
    reviews: bus.reviews_count || bus.reviews || 280,
    duration: bus.duration,
    depart_times: Array.isArray(bus.departureTimes) ? bus.departureTimes.join(', ') : (bus.departureTimes || bus.depart_times || '08:00, 14:00, 19:30'),
    pickup: bus.pickup || `Bến xe ${origin}`,
    dropoff: bus.dropoff || `Bến xe ${destination}`,
    price: bus.price,
    totalForGroup: bus.price * numPeople,
    hotline: bus.phone || bus.hotline || '1900 6067',
    tags: bus.tags || []
  }))

  const cheapestBus = formattedOperators[0]
  const cheapestPrice = cheapestBus.price
  const trainPrice = Math.round(cheapestPrice * 1.3)
  const flightPrice = distance > 350 ? Math.round(cheapestPrice * 2.6) : null
  const motorbikeCost = Math.round(distance * 320)

  const busDurationHours = Math.max(2, Math.round(distance / 50))
  const trainDurationHours = Math.max(2, Math.round(distance / 55))

  // Bảng so sánh 4 loại phương tiện chuẩn hóa cho UI
  const vehicleComparison = [
    {
      type: 'bus',
      name: 'Xe khách giường nằm',
      icon: '🚌',
      estimated_cost_per_person: cheapestPrice,
      total_group_cost: cheapestPrice * numPeople,
      duration: `${busDurationHours} giờ`,
      duration_hours: busDurationHours,
      is_cheapest: true,
      is_fastest: false,
      advantage: 'Tiết kiệm chi phí nhất, đi đêm tiết kiệm 1 đêm khách sạn, đón trả linh hoạt.'
    },
    {
      type: 'train',
      name: 'Tàu hỏa (Đường sắt VN)',
      icon: '🚆',
      estimated_cost_per_person: trainPrice,
      total_group_cost: trainPrice * numPeople,
      duration: `${trainDurationHours} giờ`,
      duration_hours: trainDurationHours,
      is_cheapest: false,
      is_fastest: false,
      advantage: 'An toàn, ngắm cảnh biển Lăng Cô & đèo Hải Vân cực đẹp, khoang giường nằm êm ái.'
    }
  ]

  if (flightPrice && distance > 350) {
    vehicleComparison.push({
      type: 'flight',
      name: 'Máy bay nội địa',
      icon: '✈️',
      estimated_cost_per_person: flightPrice,
      total_group_cost: flightPrice * numPeople,
      duration: '1.5 giờ',
      duration_hours: 1.5,
      is_cheapest: false,
      is_fastest: true,
      advantage: 'Nhanh nhất (chỉ 1h15 - 1h30 bay), bảo toàn thể lực tối đa cho chuyến đi.'
    })
  }

  if (distance <= 300) {
    vehicleComparison.push({
      type: 'motorbike',
      name: 'Xe máy / Phượt',
      icon: '🏍️',
      estimated_cost_per_person: Math.round(motorbikeCost / numPeople),
      total_group_cost: motorbikeCost,
      duration: `${Math.round(distance / 40)} giờ`,
      duration_hours: Math.round(distance / 40),
      is_cheapest: false,
      is_fastest: false,
      advantage: 'Chủ động 100%, tự do dừng chân chụp ảnh check-in ven đường và các bãi biển đẹp.'
    })
  }

  // Danh sách các mác tàu Thống Nhất thực tế qua tuyến
  const trains = [
    {
      id: 'train-se1',
      code: 'Tàu SE1 / SE2',
      name: 'Tàu Thống Nhất SE1 (Tàu nhanh cao cấp)',
      type: 'Giường nằm khoang 4 điều hòa',
      price: Math.round(trainPrice * 1.15),
      totalForGroup: Math.round(trainPrice * 1.15) * numPeople,
      depart_station: `Ga ${origin}`,
      arrive_station: `Ga ${destination}`,
      duration: `${trainDurationHours} giờ`,
      depart_times: '20:55 (Đến sáng hôm sau)',
      rating: 4.8,
      hotline: '1900 0109',
      booking_url: 'https://dsvn.vn',
      badge: '⭐ Tàu nhanh nhất',
      tags: ['Ngắm biển Lăng Cô', 'Khoang 4 êm ái', 'Sạch sẽ']
    },
    {
      id: 'train-se3',
      code: 'Tàu SE3 / SE4',
      name: 'Tàu Thống Nhất SE3',
      type: 'Giường nằm khoang 6 điều hòa / Ghế mềm',
      price: trainPrice,
      totalForGroup: trainPrice * numPeople,
      depart_station: `Ga ${origin}`,
      arrive_station: `Ga ${destination}`,
      duration: `${trainDurationHours + 1} giờ`,
      depart_times: '19:25 xuất phát',
      rating: 4.6,
      hotline: '1900 0109',
      booking_url: 'https://dsvn.vn',
      badge: '💡 Tiết kiệm',
      tags: ['Đúng giờ', 'An toàn cao', 'Thư thái']
    },
    {
      id: 'train-se19',
      code: 'Tàu SE19 / SE20',
      name: 'Tàu Du Lịch Hạng Sang SE19',
      type: 'Khoang VIP 4 giường nội thất 5 sao',
      price: Math.round(trainPrice * 1.35),
      totalForGroup: Math.round(trainPrice * 1.35) * numPeople,
      depart_station: `Ga ${origin}`,
      arrive_station: `Ga ${destination}`,
      duration: `${trainDurationHours} giờ`,
      depart_times: '19:50 xuất phát',
      rating: 4.9,
      hotline: '1900 0109',
      booking_url: 'https://dsvn.vn',
      badge: '💎 Tàu du lịch VIP',
      tags: ['Nội thất sang trọng', 'Wifi', 'Dịch vụ chuẩn 5 sao']
    }
  ]

  return {
    origin,
    destination,
    estimatedDistanceKm: distance,
    distanceKm: distance,
    people: numPeople,
    cheapestPrice,
    cheapestTotal: cheapestPrice * numPeople,
    cheapestOperator: cheapestBus,
    bestOperator: cheapestBus,
    operators: formattedOperators,
    trains: trains,
    vehicleComparison: vehicleComparison,
    comparison: vehicleComparison
  }
}
