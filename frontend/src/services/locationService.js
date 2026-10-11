// locationService.js - Dịch vụ định vị GPS độ chính xác cao và giải mã chi tiết địa chỉ Việt Nam
// Hỗ trợ đầy đủ: Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố

// Bảng tọa độ trung tâm các tỉnh/thành phố tiêu biểu của Việt Nam (để dự phòng)
export const VIETNAM_PROVINCES_COORDS = [
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, aliases: ['ha noi', 'hanoi'] },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, aliases: ['tp hcm', 'hcm', 'ho chi minh', 'sai gon', 'sài gòn'] },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, aliases: ['da nang', 'danang'] },
  { name: 'Thừa Thiên Huế', lat: 16.4637, lng: 107.5909, aliases: ['huế', 'hue', 'thua thien hue'] },
  { name: 'Quảng Nam', lat: 15.5994, lng: 108.0000, aliases: ['quang nam', 'hội an', 'tam kỳ'] },
  { name: 'Quảng Ngãi', lat: 15.1205, lng: 108.7923, aliases: ['quang ngai', 'lý sơn'] },
  { name: 'Quảng Bình', lat: 17.5381, lng: 106.3117, aliases: ['quang binh', 'đồng hới'] },
  { name: 'Quảng Trị', lat: 16.7475, lng: 107.1855, aliases: ['quang tri', 'đông hà'] },
  { name: 'Bình Định', lat: 13.7830, lng: 109.2197, aliases: ['binh dinh', 'quy nhơn', 'quy nhon'] },
  { name: 'Phú Yên', lat: 13.0882, lng: 109.3075, aliases: ['phu yen', 'tuy hòa', 'tuy hoa'] },
  { name: 'Khánh Hòa', lat: 12.2388, lng: 109.1967, aliases: ['khanh hoa', 'nha trang', 'cam ranh'] },
  { name: 'Ninh Thuận', lat: 11.5647, lng: 108.9886, aliases: ['ninh thuan', 'phan rang'] },
  { name: 'Bình Thuận', lat: 10.9805, lng: 108.2615, aliases: ['binh thuan', 'phan thiết', 'mũi né'] },
  { name: 'Kon Tum', lat: 14.3537, lng: 108.0084, aliases: ['kon tum', 'kontum'] },
  { name: 'Gia Lai', lat: 13.9833, lng: 108.0000, aliases: ['gia lai', 'pleiku'] },
  { name: 'Đắk Lắk', lat: 12.6667, lng: 108.0500, aliases: ['dak lak', 'đắc lắc', 'buôn ma thuột'] },
  { name: 'Đắk Nông', lat: 12.0000, lng: 107.6833, aliases: ['dak nong', 'đắc nông', 'gia nghĩa'] },
  { name: 'Lâm Đồng', lat: 11.9404, lng: 108.4583, aliases: ['lam dong', 'đà lạt', 'da lat', 'bảo lộc'] },
  { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881, aliases: ['hai phong'] },
  { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, aliases: ['can tho'] },
  { name: 'Nghệ An', lat: 18.6796, lng: 105.6813, aliases: ['nghe an', 'vinh'] },
  { name: 'Hà Tĩnh', lat: 18.3559, lng: 105.9059, aliases: ['ha tinh'] },
  { name: 'Thanh Hóa', lat: 19.8067, lng: 105.7852, aliases: ['thanh hoa', 'sầm sơn'] },
  { name: 'Quảng Ninh', lat: 20.9505, lng: 107.0734, aliases: ['quang ninh', 'hạ long'] },
  { name: 'Bình Dương', lat: 11.3254, lng: 106.6579, aliases: ['binh duong', 'thủ dầu một'] },
  { name: 'Đồng Nai', lat: 10.9574, lng: 106.8427, aliases: ['dong nai', 'biên hòa'] },
  { name: 'Bà Rịa - Vũng Tàu', lat: 10.3460, lng: 107.0843, aliases: ['vung tau', 'vũng tàu', 'bà rịa'] },
  { name: 'An Giang', lat: 10.5216, lng: 105.1259, aliases: ['an giang', 'long xuyên', 'châu đốc'] },
  { name: 'Kiên Giang', lat: 9.9576, lng: 105.1506, aliases: ['kien giang', 'phú quốc', 'rạch giá'] }
]

// Công thức tính khoảng cách bề mặt Trái Đất (Haversine formula) tính bằng km
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// Tìm tỉnh thành gần nhất dựa trên tọa độ GPS
export function findClosestProvince(lat, lng) {
  let closest = VIETNAM_PROVINCES_COORDS[0]
  let minDistance = Infinity

  for (const prov of VIETNAM_PROVINCES_COORDS) {
    const dist = haversineDistance(lat, lng, prov.lat, prov.lng)
    if (dist < minDistance) {
      minDistance = dist
      closest = prov
    }
  }

  return {
    ...closest,
    distanceKm: minDistance
  }
}

// Chuẩn hóa tên địa danh tìm kiếm khớp với danh sách tỉnh thành
export function matchKnownProvince(text) {
  if (!text) return null
  const clean = text.toLowerCase().trim()
    .replace(/^(thành phố|tỉnh|thị xã|tp\.|quận|huyện)\s+/i, '')
    .trim()

  for (const prov of VIETNAM_PROVINCES_COORDS) {
    const provNameLower = prov.name.toLowerCase()
    if (clean === provNameLower || clean.includes(provNameLower) || provNameLower.includes(clean)) {
      return prov.name
    }
    if (prov.aliases && prov.aliases.some(alias => clean.includes(alias) || alias.includes(clean))) {
      return prov.name
    }
  }
  return null
}

// Ghép và chuẩn hóa chuỗi địa chỉ đầy đủ Việt Nam (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành)
export function formatDetailedVietnamAddress(addr, displayName = '') {
  if (!addr && !displayName) return ''

  const houseNumber = (addr?.house_number || '').trim()
  const road = (
    addr?.road ||
    addr?.street ||
    addr?.pedestrian ||
    addr?.footway ||
    addr?.path ||
    addr?.residential ||
    ''
  ).trim()

  const ward = (
    addr?.ward ||
    addr?.suburb ||
    addr?.quarter ||
    addr?.neighbourhood ||
    addr?.village ||
    addr?.hamlet ||
    ''
  ).trim()

  const district = (
    addr?.city_district ||
    addr?.district ||
    addr?.county ||
    addr?.town ||
    ''
  ).trim()

  const province = (
    addr?.city ||
    addr?.state ||
    addr?.province ||
    addr?.municipality ||
    ''
  ).trim()

  const parts = []

  // 1. Số nhà + Tên đường
  if (houseNumber && road) {
    parts.push(`${houseNumber} ${road}`)
  } else if (road) {
    parts.push(road)
  } else if (houseNumber) {
    parts.push(`Số ${houseNumber}`)
  }

  // 2. Phường / Xã
  if (ward) {
    let w = ward
    if (!/^(phường|xã|thị trấn|p\.|x\.)\s+/i.test(w)) {
      w = `Phường ${w}`
    }
    parts.push(w)
  }

  // 3. Quận / Huyện / Thị xã
  if (district) {
    let d = district
    if (!/^(quận|huyện|thị xã|thành phố|q\.|h\.)\s+/i.test(d)) {
      d = `Quận ${d}`
    }
    parts.push(d)
  }

  // 4. Tỉnh / Thành phố
  if (province) {
    const cleanProv = province.replace(/^(Thành phố|Tỉnh)\s+/i, '').trim()
    parts.push(cleanProv)
  }

  // Nếu ghép được chi tiết từ 2 thành phần trở lên, trả về ngay
  if (parts.length >= 2) {
    return parts.join(', ')
  }

  // Nếu Nominatim trả về display_name thì làm sạch mã bưu chính và tên nước
  if (displayName) {
    const cleaned = displayName
      .replace(/,\s*\d{5,6}/g, '') // Bỏ mã zip/postal code
      .replace(/,\s*Việt Nam$/i, '') // Bỏ đuôi ", Việt Nam"
      .trim()
    if (cleaned) return cleaned
  }

  return parts.join(', ') || ''
}

// Lấy tọa độ GPS từ trình duyệt
export function getBrowserGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Trình duyệt của bạn không hỗ trợ định vị GPS.'))
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        let msg = 'Không thể lấy vị trí hiện tại.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Bạn đã từ chối cấp quyền truy cập vị trí GPS.'
            break
          case error.POSITION_UNAVAILABLE:
            msg = 'Thông tin vị trí hiện không khả dụng.'
            break
          case error.TIMEOUT:
            msg = 'Thời gian yêu cầu vị trí GPS đã hết hạn.'
            break
        }
        reject(new Error(msg))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    )
  })
}

// Lấy địa chỉ đầy đủ (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành) qua GPS
export async function detectCurrentLocationCity() {
  // 1. Lấy tọa độ GPS người dùng
  const coords = await getBrowserGeolocation()
  const { latitude, longitude } = coords

  let detailedAddress = ''
  let primaryCity = ''

  // 2. ƯU TIÊN 1: Gọi OpenStreetMap Nominatim với zoom=18 (độ chi tiết tối đa tới số nhà, tên đường, phường/xã)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5500)

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=vi`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      const addr = data.address || {}

      detailedAddress = formatDetailedVietnamAddress(addr, data.display_name)
      const rawCity = addr.city || addr.state || addr.province || addr.county || addr.town || ''
      primaryCity = matchKnownProvince(rawCity) || rawCity.replace(/^(Thành phố|Tỉnh)\s+/i, '').trim()
    }
  } catch (err) {
    console.warn('[locationService] Nominatim reverse geocode error:', err.message)
  }

  // 3. ƯU TIÊN 2 (DỰ PHÒNG CHÍNH XÁC): Nếu Nominatim chưa đủ chi tiết hoặc lỗi mạng, gọi BigDataCloud Client API
  if (!detailedAddress || detailedAddress.split(',').length < 2) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4500)

      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`
      const resBdc = await fetch(bdcUrl, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (resBdc.ok) {
        const bdcData = await resBdc.json()
        const bdcParts = []

        // Lấy số nhà và tên đường từ informative
        const informative = bdcData.localityInfo?.informative || []
        const houseItem = informative.find(i => (i.description || '').toLowerCase().includes('house') || /^\d+/.test(i.name))
        const roadItem = informative.find(i => (i.description || '').toLowerCase().includes('road') || (i.description || '').toLowerCase().includes('thoroughfare'))

        if (houseItem && roadItem) {
          bdcParts.push(`${houseItem.name} ${roadItem.name}`)
        } else if (roadItem) {
          bdcParts.push(roadItem.name)
        }

        // Lấy Phường/Xã (admin level 8), Quận/Huyện (admin level 6), Tỉnh/Thành (admin level 4)
        const admins = bdcData.localityInfo?.administrative || []
        const wardAdmin = admins.find(a => a.adminLevel === 8 || (a.name || '').startsWith('Phường') || (a.name || '').startsWith('Xã'))
        const distAdmin = admins.find(a => a.adminLevel === 6 || (a.name || '').startsWith('Quận') || (a.name || '').startsWith('Huyện'))
        const provAdmin = admins.find(a => a.adminLevel === 4 || (a.name || '').startsWith('Tỉnh') || (a.name || '').startsWith('Thành phố'))

        if (wardAdmin && !bdcParts.includes(wardAdmin.name)) bdcParts.push(wardAdmin.name)
        if (distAdmin && !bdcParts.includes(distAdmin.name)) bdcParts.push(distAdmin.name)

        const provName = provAdmin?.name || bdcData.principalSubdivision || bdcData.city || ''
        const cleanProv = provName.replace(/^(Thành phố|Tỉnh)\s+/i, '').trim()
        if (cleanProv && !bdcParts.includes(cleanProv)) bdcParts.push(cleanProv)

        if (bdcParts.length >= 2) {
          detailedAddress = bdcParts.join(', ')
          if (!primaryCity) primaryCity = cleanProv
        }
      }
    } catch (e) {
      console.warn('[locationService] BigDataCloud fallback error:', e.message)
    }
  }

  // 4. ƯU TIÊN 3: Fallback hình học nếu hoàn toàn không có mạng
  const closest = findClosestProvince(latitude, longitude)
  if (!primaryCity) {
    primaryCity = closest.name
  }
  if (!detailedAddress) {
    detailedAddress = `${closest.name} (Định vị theo tọa độ GPS gần nhất)`
  }

  return {
    detailedAddress,
    cityName: primaryCity,
    coords: { latitude, longitude },
    distanceKm: closest.distanceKm
  }
}
