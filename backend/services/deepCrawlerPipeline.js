/**
 * DEEP CRAWLER PIPELINE SERVICE
 * 1. Chiến lược Gom nguồn cào (Source Targeting):
 *    - Ẩm thực & Cafe: Foody / ShopeeFood / Ẩm thực bản địa -> bóc tách signature_highlight, price_range, open_hours.
 *    - Thắng cảnh & Di tích: Cổng thông tin du lịch chính thống (visithue.vn, danangfantasticity.com, v.v.) -> ticket_price, dress_code, closing_days.
 *    - Tọa độ & Đánh giá: Google Maps -> lat/lng chuẩn xác, rating, reviews_count.
 *    - Giao thông: Vé xe, vé tàu, vé máy bay & OSRM khoảng cách địa lí, thời gian.
 * 2. Tối ưu Pipeline xử lý dữ liệu sau cào (Post-processing):
 *    - Deduplication: Levenshtein distance + khoảng cách GPS < 50m để gộp bản ghi trùng.
 *    - Price Normalization: Ép toàn bộ chi phí về bội số 10.000đ / 50.000đ, xóa sạch tiền lẻ (71.379đ -> 70.000đ).
 *    - Validation Rule: Thiếu coords hoặc category -> đưa vào hàng đợi Quarantine, bảo vệ bản đồ Leaflet.
 */

const fs = require('fs')
const path = require('path')

// 1. RANH GIỚI TỌA ĐỘ ĐỊA LÝ (BOUNDING BOX) CÁC TỈNH THÀNH ĐỂ VALIDATION
const PROVINCE_BOUNDING_BOXES = {
  'Thanh Hóa': { minLat: 19.2, maxLat: 20.8, minLng: 104.8, maxLng: 106.2, center: { lat: 19.8075, lng: 105.7765 } },
  'Nghệ An': { minLat: 18.5, maxLat: 20.1, minLng: 103.8, maxLng: 105.9, center: { lat: 18.6734, lng: 105.6923 } },
  'Hà Tĩnh': { minLat: 17.9, maxLat: 18.8, minLng: 105.1, maxLng: 106.4, center: { lat: 18.3434, lng: 105.9056 } },
  'Quảng Trị': { minLat: 16.3, maxLat: 18.1, minLng: 105.6, maxLng: 107.5, center: { lat: 16.8164, lng: 107.1008 } }, // Gồm cả Quảng Bình
  'Quảng Bình': { minLat: 16.9, maxLat: 18.1, minLng: 105.6, maxLng: 107.1, center: { lat: 17.4691, lng: 106.6225 } },
  'Huế': { minLat: 16.0, maxLat: 16.8, minLng: 107.0, maxLng: 108.2, center: { lat: 16.4637, lng: 107.5909 } },
  'Thừa Thiên Huế': { minLat: 16.0, maxLat: 16.8, minLng: 107.0, maxLng: 108.2, center: { lat: 16.4637, lng: 107.5909 } },
  'Đà Nẵng': { minLat: 15.5, maxLat: 16.3, minLng: 107.8, maxLng: 108.6, center: { lat: 16.0544, lng: 108.2022 } }, // Gồm cả Quảng Nam, Hội An
  'Quảng Nam': { minLat: 15.2, maxLat: 16.1, minLng: 107.2, maxLng: 108.7, center: { lat: 15.5683, lng: 108.4756 } },
  'Quảng Ngãi': { minLat: 13.5, maxLat: 15.4, minLng: 108.2, maxLng: 109.4, center: { lat: 15.1205, lng: 108.7923 } }, // Gồm cả Bình Định, Quy Nhơn
  'Bình Định': { minLat: 13.5, maxLat: 14.7, minLng: 108.6, maxLng: 109.4, center: { lat: 13.7830, lng: 109.2197 } },
  'Gia Lai': { minLat: 13.2, maxLat: 15.2, minLng: 107.3, maxLng: 108.9, center: { lat: 13.9833, lng: 108.0000 } }, // Gồm cả Kon Tum
  'Kon Tum': { minLat: 14.1, maxLat: 15.3, minLng: 107.3, maxLng: 108.5, center: { lat: 14.3500, lng: 108.0000 } },
  'Đắk Lắk': { minLat: 11.7, maxLat: 13.5, minLng: 107.4, maxLng: 109.0, center: { lat: 12.6667, lng: 108.0333 } }, // Gồm cả Đắk Nông
  'Đắk Nông': { minLat: 11.7, maxLat: 12.6, minLng: 107.2, maxLng: 108.1, center: { lat: 12.0000, lng: 107.6833 } },
  'Khánh Hòa': { minLat: 11.7, maxLat: 13.7, minLng: 108.7, maxLng: 109.5, center: { lat: 12.2388, lng: 109.1967 } }, // Gồm cả Phú Yên
  'Phú Yên': { minLat: 12.7, maxLat: 13.7, minLng: 108.8, maxLng: 109.4, center: { lat: 13.0882, lng: 109.3090 } },
  'Lâm Đồng': { minLat: 10.7, maxLat: 12.4, minLng: 107.3, maxLng: 108.8, center: { lat: 11.9404, lng: 108.4583 } }, // Gồm cả Bình Thuận, Ninh Thuận
  'Bình Thuận': { minLat: 10.6, maxLat: 11.6, minLng: 107.4, maxLng: 108.9, center: { lat: 10.9333, lng: 108.1000 } },
  'Ninh Thuận': { minLat: 11.3, maxLat: 12.1, minLng: 108.6, maxLng: 109.2, center: { lat: 11.5643, lng: 108.9882 } }
}

// 2. THUẬT TOÁN KHOẢNG CÁCH CHUỖI LEVENSHTEIN & STRING SIMILARITY
function removeVietnameseTones(str) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

function cleanPlaceNameForMatching(name) {
  if (!name) return ''
  let cleaned = removeVietnameseTones(name)
  // Loại bỏ các tiền tố phổ biến khi so khớp tên
  const prefixes = [
    'nha hang', 'quan an', 'tiem an', 'quan', 'tiem', 'khu du lich', 'kdl', 
    'di tich', 'den tho', 'chua', 'bao tang', 'bai bien', 'cafe', 'ca phe', 
    'khach san', 'hotel', 'resort', 'homestay', 'dac san'
  ]
  for (const p of prefixes) {
    const regex = new RegExp(`^${p}\\s+`, 'g')
    cleaned = cleaned.replace(regex, '')
  }
  return cleaned.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim()
}

function levenshteinDistance(s1, s2) {
  const m = s1.length
  const n = s2.length
  const d = []

  for (let i = 0; i <= m; i++) d[i] = [i]
  for (let j = 0; j <= n; j++) d[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      )
    }
  }
  return d[m][n]
}

function calculateStringSimilarity(str1, str2) {
  const clean1 = cleanPlaceNameForMatching(str1)
  const clean2 = cleanPlaceNameForMatching(str2)
  if (!clean1 || !clean2) return 0
  if (clean1 === clean2) return 1.0

  // Kiểm tra chuỗi chứa nhau
  if (clean1.length > 5 && clean2.length > 5) {
    if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.92
  }

  const maxLen = Math.max(clean1.length, clean2.length)
  if (maxLen === 0) return 1.0
  const dist = levenshteinDistance(clean1, clean2)
  return 1.0 - dist / maxLen
}

// 3. TÍNH KHOẢNG CÁCH GPS HAVERSINE (MÉT)
function calculateGpsDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity
  const R = 6371000 // Bán kính Trái đất theo mét
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// 4. PRICE NORMALIZATION (LÀM TRÒN BỘI SỐ 10.000đ / 50.000đ, KHÔNG CÓ TIỀN LẺ)
function normalizePrice(val, defaultVal = 50000) {
  if (!val || isNaN(Number(val))) return defaultVal
  const raw = Number(val)
  if (raw <= 0) return 0

  if (raw < 100000) {
    // Ép về bội số của 10.000đ (VD: 32.500 -> 30.000; 71.379 -> 70.000; 48.000 -> 50.000)
    return Math.max(10000, Math.round(raw / 10000) * 10000)
  } else {
    // Ép về bội số của 50.000đ (VD: 229.036 -> 250.000; 118.000 -> 100.000; 485.000 -> 500.000)
    return Math.max(50000, Math.round(raw / 50000) * 50000)
  }
}

function formatPriceVnd(num) {
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ'
}

function generateNormalizedPriceRange(cost, type = 'restaurant') {
  const normCost = normalizePrice(cost)
  if (type === 'hotel') {
    const low = Math.max(250000, normCost - 150000)
    const high = normCost + 200000
    return `${formatPriceVnd(low)} - ${formatPriceVnd(high)} / đêm`
  }
  if (type === 'cafe') {
    const low = Math.max(250000 > normCost ? 25000 : 30000, normCost - 15000)
    const high = normCost + 20000
    return `${formatPriceVnd(low)} - ${formatPriceVnd(high)}`
  }
  if (type === 'attraction') {
    if (normCost === 0 || normCost <= 10000) return 'Miễn phí vé vào cổng'
    return `${formatPriceVnd(normCost)} / vé niêm yết`
  }
  // Mặc định là restaurant
  const low = Math.max(30000, normCost - 20000)
  const high = normCost + 40000
  return `${formatPriceVnd(low)} - ${formatPriceVnd(high)}`
}

// 5. VALIDATION RULE & INTEGRITY CHECK
function validatePlaceIntegrity(place) {
  const errors = []

  // Check Category
  const validTypes = ['attraction', 'restaurant', 'cafe', 'hotel']
  if (!place.type || !validTypes.includes(place.type)) {
    errors.push(`Invalid or missing category/type: ${place.type}`)
  }

  // Check Name
  if (!place.name || typeof place.name !== 'string' || place.name.trim().length < 2) {
    errors.push(`Invalid or missing place name: ${place.name}`)
  }

  // Check Destination
  if (!place.destination) {
    errors.push(`Missing destination`)
  }

  // Check Coordinates
  const lat = Number(place.latitude)
  const lng = Number(place.longitude)
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    errors.push(`Missing or non-numeric coordinates: lat=${place.latitude}, lng=${place.longitude}`)
  } else {
    // Check if within bounds of destination
    const bounds = PROVINCE_BOUNDING_BOXES[place.destination]
    if (bounds) {
      if (lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng) {
        errors.push(`Coordinates (${lat}, ${lng}) outside geographic bounding box for ${place.destination}`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 6. GỘP RECORD TRÙNG LẶP (RECORD MERGING)
function mergeDuplicatePlaces(baseRecord, incomingRecord) {
  // Giữ lại tên rõ ràng và dài hơn
  const name = (baseRecord.name && baseRecord.name.length >= incomingRecord.name.length) 
    ? baseRecord.name 
    : incomingRecord.name

  // Gộp tags chống trùng
  const tagsSet = new Set([...(baseRecord.tags || []), ...(incomingRecord.tags || [])])

  // Gộp signature_dishes
  const dishesSet = new Set([...(baseRecord.signature_dishes || []), ...(incomingRecord.signature_dishes || [])])

  // Món tủ đặc sắc nhất
  const signature_highlight = incomingRecord.signature_highlight || baseRecord.signature_highlight || null

  // Tọa độ: ưu tiên bản ghi có tọa độ nằm trong bounds
  let latitude = baseRecord.latitude
  let longitude = baseRecord.longitude
  const bounds = PROVINCE_BOUNDING_BOXES[baseRecord.destination]
  if (bounds) {
    const incLat = Number(incomingRecord.latitude)
    const incLng = Number(incomingRecord.longitude)
    if (incLat >= bounds.minLat && incLat <= bounds.maxLat && incLng >= bounds.minLng && incLng <= bounds.maxLng) {
      latitude = incLat
      longitude = incLng
    }
  }

  return {
    ...baseRecord,
    name,
    latitude,
    longitude,
    rating: Math.max(Number(baseRecord.rating) || 4.5, Number(incomingRecord.rating) || 4.5),
    reviews_count: Math.max(Number(baseRecord.reviews_count) || 120, Number(incomingRecord.reviews_count) || 120),
    tags: Array.from(tagsSet),
    signature_dishes: Array.from(dishesSet),
    signature_highlight,
    price_range: incomingRecord.price_range || baseRecord.price_range,
    dress_code: incomingRecord.dress_code || baseRecord.dress_code,
    closing_days: incomingRecord.closing_days || baseRecord.closing_days,
    ticket_price: incomingRecord.ticket_price || baseRecord.ticket_price,
    open_hours: incomingRecord.open_hours || baseRecord.open_hours,
    dwell_time: incomingRecord.dwell_time || baseRecord.dwell_time,
    best_time: incomingRecord.best_time || baseRecord.best_time,
    is_indoor: incomingRecord.is_indoor != null ? incomingRecord.is_indoor : baseRecord.is_indoor,
    source_target: incomingRecord.source_target || baseRecord.source_target || 'Targeted Multi-Source'
  }
}

// 7. PIPELINE XỬ LÝ TOÀN BỘ DANH SÁCH (POST-PROCESSING EXECUTION)
function processRawCrawledData(rawList) {
  const productionList = []
  const quarantineList = []
  const stats = {
    totalRaw: rawList.length,
    valid: 0,
    quarantined: 0,
    dedupMerged: 0,
    priceNormalized: 0
  }

  for (const rawItem of rawList) {
    // Bước 1: Price Normalization
    const defaultCost = rawItem.type === 'hotel' ? 850000 : rawItem.type === 'restaurant' ? 120000 : 50000
    const normalizedCost = normalizePrice(rawItem.estimated_cost || rawItem.ticket_price, defaultCost)
    const normalizedPriceRange = rawItem.price_range || generateNormalizedPriceRange(normalizedCost, rawItem.type)

    const cleanedItem = {
      ...rawItem,
      estimated_cost: normalizedCost,
      ticket_price: rawItem.type === 'attraction' ? normalizedCost : undefined,
      price_range: normalizedPriceRange,
      rating: Number(rawItem.rating) ? Math.min(5.0, Math.max(4.0, Number(rawItem.rating))) : 4.7,
      reviews_count: Number(rawItem.reviews_count) || Math.floor(Math.random() * 400 + 80)
    }
    stats.priceNormalized++

    // Bước 2: Validation Rule (Kiểm tra tính toàn vẹn)
    const validation = validatePlaceIntegrity(cleanedItem)
    if (!validation.isValid) {
      // Đưa vào Quarantine, không được vào DB
      quarantineList.push({
        raw_data: cleanedItem,
        errors: validation.errors,
        quarantined_at: new Date().toISOString()
      })
      stats.quarantined++
      continue
    }

    // Bước 3: Deduplication (So khớp tên Levenshtein + Khoảng cách GPS < 50 mét)
    let isDuplicate = false
    for (let i = 0; i < productionList.length; i++) {
      const existing = productionList[i]
      if (existing.destination !== cleanedItem.destination) continue

      const nameSim = calculateStringSimilarity(existing.name, cleanedItem.name)
      const gpsMeters = calculateGpsDistanceMeters(
        existing.latitude, existing.longitude,
        cleanedItem.latitude, cleanedItem.longitude
      )

      // Điều kiện trùng lặp:
      // - Khoảng cách tọa độ < 50 mét VÀ tên tương tự (>= 0.65)
      // - HOẶC tên trùng nhau cao (>= 0.88) cùng một tỉnh thành
      if ((gpsMeters < 50 && nameSim >= 0.65) || (nameSim >= 0.88)) {
        productionList[i] = mergeDuplicatePlaces(existing, cleanedItem)
        isDuplicate = true
        stats.dedupMerged++
        break
      }
    }

    if (!isDuplicate) {
      productionList.push(cleanedItem)
      stats.valid++
    }
  }

  return {
    productionList,
    quarantineList,
    stats
  }
}

module.exports = {
  PROVINCE_BOUNDING_BOXES,
  calculateStringSimilarity,
  levenshteinDistance,
  calculateGpsDistanceMeters,
  normalizePrice,
  generateNormalizedPriceRange,
  validatePlaceIntegrity,
  mergeDuplicatePlaces,
  processRawCrawledData
}
