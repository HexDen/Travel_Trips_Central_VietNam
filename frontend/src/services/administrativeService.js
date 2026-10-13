// administrativeService.js - Dịch vụ tra cứu đơn vị hành chính Việt Nam (Tỉnh/Thành -> Quận/Huyện -> Phường/Xã)
// Tích hợp API chuẩn quốc gia (provinces.open-api.vn) + Dữ liệu dự phòng Offline tức thì

const API_BASE = 'https://provinces.open-api.vn/api'

// Cache bộ nhớ tạm để người dùng chọn không bị tải lại nhiều lần
const cache = {
  provinces: null,
  districts: {},
  wards: {}
}

// DỮ LIỆU OFFLINE DỰ PHÒNG TỨC THÌ (CHO CÁC ĐÔ THỊ & TỈNH THÀNH TRỌNG ĐIỂM)
const FALLBACK_PROVINCES = [
  { code: 48, name: 'Đà Nẵng' },
  { code: 1, name: 'Hà Nội' },
  { code: 79, name: 'TP. Hồ Chí Minh' },
  { code: 46, name: 'Thừa Thiên Huế' },
  { code: 49, name: 'Quảng Nam' },
  { code: 44, name: 'Quảng Bình' },
  { code: 45, name: 'Quảng Trị' },
  { code: 51, name: 'Quảng Ngãi' },
  { code: 52, name: 'Bình Định' },
  { code: 54, name: 'Phú Yên' },
  { code: 56, name: 'Khánh Hòa' },
  { code: 58, name: 'Ninh Thuận' },
  { code: 60, name: 'Bình Thuận' },
  { code: 62, name: 'Kon Tum' },
  { code: 64, name: 'Gia Lai' },
  { code: 66, name: 'Đắk Lắk' },
  { code: 67, name: 'Đắk Nông' },
  { code: 68, name: 'Lâm Đồng' },
  { code: 31, name: 'Hải Phòng' },
  { code: 92, name: 'Cần Thơ' },
  { code: 40, name: 'Nghệ An' },
  { code: 42, name: 'Hà Tĩnh' },
  { code: 38, name: 'Thanh Hóa' }
]

// Fallback Districts cho Đà Nẵng, Huế, Hà Nội, TP.HCM
const FALLBACK_DISTRICTS = {
  48: [ // Đà Nẵng
    { code: 490, name: 'Quận Hải Châu' },
    { code: 491, name: 'Quận Thanh Khê' },
    { code: 492, name: 'Quận Sơn Trà' },
    { code: 493, name: 'Quận Ngũ Hành Sơn' },
    { code: 494, name: 'Quận Liên Chiểu' },
    { code: 495, name: 'Quận Cẩm Lệ' },
    { code: 497, name: 'Huyện Hòa Vang' },
    { code: 498, name: 'Huyện Hoàng Sa' }
  ],
  46: [ // Thừa Thiên Huế
    { code: 474, name: 'Thành phố Huế' },
    { code: 476, name: 'Thị xã Hương Thủy' },
    { code: 477, name: 'Thị xã Hương Trà' },
    { code: 478, name: 'Huyện Phú Vang' },
    { code: 479, name: 'Huyện Phú Lộc' },
    { code: 480, name: 'Huyện Phong Điền' },
    { code: 481, name: 'Huyện Quảng Điền' },
    { code: 482, name: 'Huyện A Lưới' },
    { code: 483, name: 'Huyện Nam Đông' }
  ],
  1: [ // Hà Nội
    { code: 1, name: 'Quận Ba Đình' },
    { code: 2, name: 'Quận Hoàn Kiếm' },
    { code: 3, name: 'Quận Tây Hồ' },
    { code: 4, name: 'Quận Long Biên' },
    { code: 5, name: 'Quận Cầu Giấy' },
    { code: 6, name: 'Quận Đống Đa' },
    { code: 7, name: 'Quận Hai Bà Trưng' },
    { code: 8, name: 'Quận Hoàng Mai' },
    { code: 9, name: 'Quận Thanh Xuân' },
    { code: 16, name: 'Huyện Sóc Sơn' },
    { code: 17, name: 'Huyện Đông Anh' },
    { code: 18, name: 'Huyện Gia Lâm' },
    { code: 19, name: 'Quận Nam Từ Liêm' },
    { code: 21, name: 'Quận Bắc Từ Liêm' },
    { code: 268, name: 'Quận Hà Đông' }
  ],
  79: [ // TP.HCM
    { code: 760, name: 'Quận 1' },
    { code: 761, name: 'Quận 12' },
    { code: 764, name: 'Quận Gò Vấp' },
    { code: 765, name: 'Quận Bình Thạnh' },
    { code: 766, name: 'Quận Tân Bình' },
    { code: 767, name: 'Quận Tân Phú' },
    { code: 768, name: 'Quận Phú Nhuận' },
    { code: 769, name: 'Thành phố Thủ Đức' },
    { code: 770, name: 'Quận 3' },
    { code: 771, name: 'Quận 10' },
    { code: 772, name: 'Quận 11' },
    { code: 773, name: 'Quận 4' },
    { code: 774, name: 'Quận 5' },
    { code: 775, name: 'Quận 6' },
    { code: 776, name: 'Quận 8' },
    { code: 777, name: 'Quận Bình Tân' },
    { code: 778, name: 'Quận 7' },
    { code: 783, name: 'Huyện Củ Chi' },
    { code: 784, name: 'Huyện Hóc Môn' },
    { code: 785, name: 'Huyện Bình Chánh' },
    { code: 786, name: 'Huyện Nhà Bè' }
  ]
}

// Fallback Wards cho Quận Hải Châu (Đà Nẵng), TP Huế
const FALLBACK_WARDS = {
  490: [ // Quận Hải Châu
    { code: 20224, name: 'Phường Hải Châu 1' },
    { code: 20227, name: 'Phường Hải Châu 2' },
    { code: 20230, name: 'Phường Thạch Thang' },
    { code: 20233, name: 'Phường Thanh Bình' },
    { code: 20236, name: 'Phường Thuận Phước' },
    { code: 20239, name: 'Phường Hòa Thuận Đông' },
    { code: 20242, name: 'Phường Hòa Thuận Tây' },
    { code: 20245, name: 'Phường Nam Dương' },
    { code: 20248, name: 'Phường Phước Ninh' },
    { code: 20251, name: 'Phường Bình Thuận' },
    { code: 20254, name: 'Phường Bình Hiên' },
    { code: 20257, name: 'Phường Hòa Cường Bắc' },
    { code: 20260, name: 'Phường Hòa Cường Nam' }
  ],
  492: [ // Quận Sơn Trà
    { code: 20281, name: 'Phường An Hải Bắc' },
    { code: 20284, name: 'Phường An Hải Tây' },
    { code: 20287, name: 'Phường An Hải Đông' },
    { code: 20290, name: 'Phường Phước Mỹ' },
    { code: 20293, name: 'Phường Mân Thái' },
    { code: 20296, name: 'Phường Thọ Quang' },
    { code: 20299, name: 'Phường Nại Hiên Đông' }
  ],
  474: [ // TP. Huế
    { code: 19807, name: 'Phường Phú Nhuận' },
    { code: 19810, name: 'Phường Vĩnh Ninh' },
    { code: 19813, name: 'Phường Phước Vĩnh' },
    { code: 19816, name: 'Phường Trường An' },
    { code: 19819, name: 'Phường Phú Hội' },
    { code: 19822, name: 'Phường Thuận Lộc' },
    { code: 19825, name: 'Phường Thuận Hòa' },
    { code: 19828, name: 'Phường Thuận Thành' },
    { code: 19831, name: 'Phường Tây Lộc' },
    { code: 19834, name: 'Phường Kim Long' },
    { code: 19837, name: 'Phường Hương Sơ' },
    { code: 19840, name: 'Phường An Cựu' },
    { code: 19843, name: 'Phường An Đông' },
    { code: 19846, name: 'Phường Thủy Xuân' },
    { code: 19849, name: 'Phường Vỹ Dạ' }
  ]
}

// 1. LẤY TOÀN BỘ DANH SÁCH TỈNH / THÀNH PHỐ
export async function fetchProvinces() {
  if (cache.provinces && cache.provinces.length > 0) {
    return cache.provinces
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`${API_BASE}/p/`, { signal: controller.signal })
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        // Chuẩn hóa tên tỉnh (bỏ tiền tố "Tỉnh", "Thành phố")
        cache.provinces = data.map(p => ({
          code: p.code,
          name: p.name.replace(/^(Thành phố|Tỉnh)\s+/i, '').trim(),
          fullName: p.name
        }))
        return cache.provinces
      }
    }
  } catch (err) {
    console.warn('[administrativeService] Fetch provinces failed, using fallback:', err.message)
  }

  cache.provinces = FALLBACK_PROVINCES
  return cache.provinces
}

// 2. LẤY DANH SÁCH QUẬN / HUYỆN THEO MÃ TỈNH
export async function fetchDistricts(provinceCode) {
  if (!provinceCode) return []

  if (cache.districts[provinceCode]) {
    return cache.districts[provinceCode]
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`, { signal: controller.signal })
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.districts)) {
        cache.districts[provinceCode] = data.districts.map(d => ({
          code: d.code,
          name: d.name
        }))
        return cache.districts[provinceCode]
      }
    }
  } catch (err) {
    console.warn(`[administrativeService] Fetch districts for prov ${provinceCode} failed, using fallback:`, err.message)
  }

  return FALLBACK_DISTRICTS[provinceCode] || [
    { code: `${provinceCode}-1`, name: 'Trung tâm thành phố/thị xã' },
    { code: `${provinceCode}-2`, name: 'Khu vực quận/huyện ngoại thành' }
  ]
}

// 3. LẤY DANH SÁCH PHƯỜNG / XÃ THEO MÃ QUẬN / HUYỆN
export async function fetchWards(districtCode) {
  if (!districtCode) return []

  if (cache.wards[districtCode]) {
    return cache.wards[districtCode]
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`${API_BASE}/d/${districtCode}?depth=2`, { signal: controller.signal })
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.wards)) {
        cache.wards[districtCode] = data.wards.map(w => ({
          code: w.code,
          name: w.name
        }))
        return cache.wards[districtCode]
      }
    }
  } catch (err) {
    console.warn(`[administrativeService] Fetch wards for dist ${districtCode} failed, using fallback:`, err.message)
  }

  return FALLBACK_WARDS[districtCode] || [
    { code: `${districtCode}-1`, name: 'Phường trung tâm 1' },
    { code: `${districtCode}-2`, name: 'Phường trung tâm 2' },
    { code: `${districtCode}-3`, name: 'Khu vực xã/thị trấn lân cận' }
  ]
}
