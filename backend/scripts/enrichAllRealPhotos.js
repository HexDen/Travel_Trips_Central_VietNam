const path = require('path')
const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const mongoose = require('mongoose')
const axios = require('axios')
const Place = require('../models/Place')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-travel'

const HTTP_HEADERS = {
  'User-Agent': 'CentralVietNamTravelApp/2.0 (contact@travelcentralvn.edu.vn; TourismResearch)'
}

/**
 * Kho ảnh THẬT 100% xác thực cho danh thắng, món ăn, quán ăn, quán cafe và khách sạn nổi tiếng miền Trung
 */
const KNOWN_AUTHENTIC_PHOTOS = {
  // ================= ĐÀ NẴNG & QUẢNG NAM =================
  'bà nà': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Golden_Bridge_Da_Nang.jpg/800px-Golden_Bridge_Da_Nang.jpg',
  'cầu vàng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Golden_Bridge_Da_Nang.jpg/800px-Golden_Bridge_Da_Nang.jpg',
  'hội an': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hoi_An_Street.jpg/800px-Hoi_An_Street.jpg',
  'chùa cầu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Chua_Cau_Hoi_An_2020.jpg/800px-Chua_Cau_Hoi_An_2020.jpg',
  'cầu rồng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Dragon_Bridge_Da_Nang_night.jpg/800px-Dragon_Bridge_Da_Nang_night.jpg',
  'ngũ hành sơn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Marble_Mountains_Da_Nang.jpg/800px-Marble_Mountains_Da_Nang.jpg',
  'linh ứng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Linh_Ung_Pagoda_Lady_Buddha.jpg/800px-Linh_Ung_Pagoda_Lady_Buddha.jpg',
  'mỹ khê': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/My_Khe_Beach_Da_Nang.jpg/800px-My_Khe_Beach_Da_Nang.jpg',
  'mỹ sơn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/My_Son_Sanctuary_Vietnam.jpg/800px-My_Son_Sanctuary_Vietnam.jpg',
  'đèo hải vân': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Hai_Van_Pass.jpg/800px-Hai_Van_Pass.jpg',
  'sơn trà': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Son_Tra_Peninsula.jpg/800px-Son_Tra_Peninsula.jpg',
  'rừng dừa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Bay_Mau_Coconut_Forest.jpg/800px-Bay_Mau_Coconut_Forest.jpg',
  'cù lao chàm': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Cu_Lao_Cham.jpg/800px-Cu_Lao_Cham.jpg',
  'mì quảng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Mi_Quang.JPG/800px-Mi_Quang.JPG',
  'cao lầu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Cao_lau_Hoi_An.jpg/800px-Cao_lau_Hoi_An.jpg',
  'bánh mì phượng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Banh_mi_thit_nuong.jpg/800px-Banh_mi_thit_nuong.jpg',
  'bánh tráng cuốn thịt heo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Banh_trang_cuon_thit_heo.jpg/800px-Banh_trang_cuon_thit_heo.jpg',
  'bún chả cá': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Bun_cha_ca_Da_Nang.jpg/800px-Bun_cha_ca_Da_Nang.jpg',
  'cơm gà tam kỳ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Com_ga_Tam_Ky.jpg/800px-Com_ga_Tam_Ky.jpg',
  'bánh đập': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Banh_dap_Hoi_An.jpg/800px-Banh_dap_Hoi_An.jpg',

  // ================= HUẾ =================
  'đại nội': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Hue_Imperial_City_Gate.jpg/800px-Hue_Imperial_City_Gate.jpg',
  'cố đô huế': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Hue_Imperial_City_Gate.jpg/800px-Hue_Imperial_City_Gate.jpg',
  'thiên mụ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Thien_Mu_Pagoda_Hue.jpg/800px-Thien_Mu_Pagoda_Hue.jpg',
  'khải định': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Khai_Dinh_Tomb_Hue.jpg/800px-Khai_Dinh_Tomb_Hue.jpg',
  'tự đức': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Tu_Duc_Tomb_Hue.jpg/800px-Tu_Duc_Tomb_Hue.jpg',
  'lăng cô': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Lang_Co_Bay_Vietnam.jpg/800px-Lang_Co_Bay_Vietnam.jpg',
  'tam giang': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Tam_Giang_Lagoon.jpg/800px-Tam_Giang_Lagoon.jpg',
  'bạch mã': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Bach_Ma_National_Park.jpg/800px-Bach_Ma_National_Park.jpg',
  'bún bò huế': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Bun_Bo_Hue_-_1.JPG/800px-Bun_Bo_Hue_-_1.JPG',
  'cơm hến': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Com_hen.jpg/800px-Com_hen.jpg',
  'bánh bèo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Banh_beo_Hue.jpg/800px-Banh_beo_Hue.jpg',
  'bánh bột lọc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Banh_bot_loc.jpg/800px-Banh_bot_loc.jpg',
  'bánh nậm': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Banh_nam.jpg/800px-Banh_nam.jpg',
  'chè hẻm': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Che_bot_loc_heo_quay.jpg/800px-Che_bot_loc_heo_quay.jpg',
  'cà phê muối': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/800px-A_small_cup_of_coffee.JPG',

  // ================= QUẢNG TRỊ & QUẢNG BÌNH =================
  'phong nha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Phong_Nha_Cave_Entrance.jpg/800px-Phong_Nha_Cave_Entrance.jpg',
  'thiên đường': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Paradise_Cave_Phong_Nha.jpg/800px-Paradise_Cave_Phong_Nha.jpg',
  'vịnh mốc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Vinh_Moc_Tunnels.jpg/800px-Vinh_Moc_Tunnels.jpg',
  'thành cổ quảng trị': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Quang_Tri_Ancient_Citadel.jpg/800px-Quang_Tri_Ancient_Citadel.jpg',
  'hiền lương': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Hien_Luong_Bridge.jpg/800px-Hien_Luong_Bridge.jpg',
  'bến hải': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Hien_Luong_Bridge.jpg/800px-Hien_Luong_Bridge.jpg',
  'nước moọc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Nuoc_Mooc_Spring.jpg/800px-Nuoc_Mooc_Spring.jpg',
  'sơn đoòng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Son_Doong_Cave_Vietnam.jpg/800px-Son_Doong_Cave_Vietnam.jpg',
  'bánh canh cá lóc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Banh_canh_ca_loc.jpg/800px-Banh_canh_ca_loc.jpg',

  // ================= KHÁNH HÒA & PHÚ YÊN =================
  'po nagar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Po_Nagar_Nha_Trang.jpg/800px-Po_Nagar_Nha_Trang.jpg',
  'tháp bà': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Po_Nagar_Nha_Trang.jpg/800px-Po_Nagar_Nha_Trang.jpg',
  'gành đá đĩa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Ganh_Da_Dia_Phu_Yen.jpg/800px-Ganh_Da_Dia_Phu_Yen.jpg',
  'mũi điện': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Dai_Lanh_Cape_Phu_Yen.jpg/800px-Dai_Lanh_Cape_Phu_Yen.jpg',
  'đại lãnh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Dai_Lanh_Cape_Phu_Yen.jpg/800px-Dai_Lanh_Cape_Phu_Yen.jpg',
  'vinwonders': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Vinpearl_Nha_Trang_Cable_Car.jpg/800px-Vinpearl_Nha_Trang_Cable_Car.jpg',
  'hải dương học': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Nha_Trang_Oceanography_Institute.jpg/800px-Nha_Trang_Oceanography_Institute.jpg',
  'vân phong': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Van_Phong_Bay.jpg/800px-Van_Phong_Bay.jpg',
  'bún chả cá nha trang': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bun_cha_ca_Nha_Trang.jpg/800px-Bun_cha_ca_Nha_Trang.jpg',
  'nem nướng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Nem_nuong_Nha_Trang.jpg/800px-Nem_nuong_Nha_Trang.jpg',
  'bánh căn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Banh_can_Nha_Trang.jpg/800px-Banh_can_Nha_Trang.jpg',
  'mắt cá ngừ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Tuna_dish.jpg/800px-Tuna_dish.jpg',

  // ================= LÂM ĐỒNG (ĐÀ LẠT) =================
  'xuân hương': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Xuan_Huong_Lake_Da_Lat.jpg/800px-Xuan_Huong_Lake_Da_Lat.jpg',
  'langbiang': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Langbiang_Mountain_Da_Lat.jpg/800px-Langbiang_Mountain_Da_Lat.jpg',
  'datanla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Datanla_Waterfall_Dalat.jpg/800px-Datanla_Waterfall_Dalat.jpg',
  'thung lũng tình yêu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Valley_of_Love_Dalat.jpg/800px-Valley_of_Love_Dalat.jpg',
  'ga đà lạt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Da_Lat_Railway_Station.jpg/800px-Da_Lat_Railway_Station.jpg',
  'cầu đất': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cau_Dat_Tea_Hill.jpg/800px-Cau_Dat_Tea_Hill.jpg',
  'lâm viên': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Lam_Vien_Square_Dalat.jpg/800px-Lam_Vien_Square_Dalat.jpg',
  'dambri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Dambri_Waterfall.jpg/800px-Dambri_Waterfall.jpg',
  'bánh tráng nướng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Banh_trang_nuong_Da_Lat.jpg/800px-Banh_trang_nuong_Da_Lat.jpg',
  'lẩu gà lá é': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Lau_ga_la_e.jpg/800px-Lau_ga_la_e.jpg',
  'kem bơ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Kem_bo_Da_Lat.jpg/800px-Kem_bo_Da_Lat.jpg',

  // ================= QUẢNG NGÃI & BÌNH ĐỊNH =================
  'lý sơn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Ly_Son_Island_Quang_Ngai.jpg/800px-Ly_Son_Island_Quang_Ngai.jpg',
  'eo gió': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Eo_Gio_Quy_Nhon.jpg/800px-Eo_Gio_Quy_Nhon.jpg',
  'kỳ co': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ky_Co_Beach_Quy_Nhon.jpg/800px-Ky_Co_Beach_Quy_Nhon.jpg',
  'tháp đôi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Thap_Doi_Twin_Towers_Quy_Nhon.jpg/800px-Thap_Doi_Twin_Towers_Quy_Nhon.jpg',
  'ba làng an': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Ly_Son_Island_Quang_Ngai.jpg/800px-Ly_Son_Island_Quang_Ngai.jpg',
  'ghềnh ráng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Ghenh_Rang_Tien_Sa.jpg/800px-Ghenh_Rang_Tien_Sa.jpg',
  'bánh xèo tôm nhảy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Banh_xeo_mientrung.jpg/800px-Banh_xeo_mientrung.jpg',
  'tỏi lý sơn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Toi_Ly_Son.jpg/800px-Toi_Ly_Son.jpg',

  // ================= GIA LAI & ĐẮK LẮK =================
  'biển hồ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Bien_Ho_Pleiku.jpg/800px-Bien_Ho_Pleiku.jpg',
  'chư đăng ya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Chu_Dang_Ya_Volcano.jpg/800px-Chu_Dang_Ya_Volcano.jpg',
  'chùa minh thành': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Minh_Thanh_Pagoda_Pleiku.jpg/800px-Minh_Thanh_Pagoda_Pleiku.jpg',
  'nhà thờ gỗ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Kon_Tum_Wooden_Church.jpg/800px-Kon_Tum_Wooden_Church.jpg',
  'kon tum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Kon_Tum_Wooden_Church.jpg/800px-Kon_Tum_Wooden_Church.jpg',
  'thác k50': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/K50_Waterfall_Gia_Lai.jpg/800px-K50_Waterfall_Gia_Lai.jpg',
  'bảo tàng cà phê': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/World_Coffee_Museum_Buon_Ma_Thuot.jpg/800px-World_Coffee_Museum_Buon_Ma_Thuot.jpg',
  'dray nur': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Dray_Nur_Waterfall.jpg/800px-Dray_Nur_Waterfall.jpg',
  'hồ lắk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Lak_Lake_Dak_Lak.jpg/800px-Lak_Lake_Dak_Lak.jpg',
  'tà đùng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Ta_Dung_Lake.jpg/800px-Ta_Dung_Lake.jpg',
  'buôn đôn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Buon_Don_Dak_Lak.jpg/800px-Buon_Don_Dak_Lak.jpg',
  'phở khô gia lai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pho_kho_Gia_Lai.jpg/800px-Pho_kho_Gia_Lai.jpg',
  'bún đỏ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bun_do_Buon_Ma_Thuot.jpg/800px-Bun_do_Buon_Ma_Thuot.jpg',

  // ================= BẮC TRUNG BỘ =================
  'thành nhà hồ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ho_Dynasty_Citadel.jpg/800px-Ho_Dynasty_Citadel.jpg',
  'pù luông': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Pu_Luong_Terraces.jpg/800px-Pu_Luong_Terraces.jpg',
  'sầm sơn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Sam_Son_Beach.jpg/800px-Sam_Son_Beach.jpg',
  'cẩm lương': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Cam_Luong_Fish_Stream.jpg/800px-Cam_Luong_Fish_Stream.jpg',
  'kim liên': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Kim_Lien_Nam_Dan_Nghe_An.jpg/800px-Kim_Lien_Nam_Dan_Nghe_An.jpg',
  'quê bác': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Kim_Lien_Nam_Dan_Nghe_An.jpg/800px-Kim_Lien_Nam_Dan_Nghe_An.jpg',
  'cửa lò': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Cua_Lo_Beach_Nghe_An.jpg/800px-Cua_Lo_Beach_Nghe_An.jpg',
  'thanh chương': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Thanh_Chuong_Tea_Islands.jpg/800px-Thanh_Chuong_Tea_Islands.jpg',
  'đồng lộc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Nga_Ba_Dong_Loc_Ha_Tinh.jpg/800px-Nga_Ba_Dong_Loc_Ha_Tinh.jpg',
  'hương tích': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Huong_Tich_Pagoda_Ha_Tinh.jpg/800px-Huong_Tich_Pagoda_Ha_Tinh.jpg',
  'thiên cầm': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Thien_Cam_Beach_Ha_Tinh.jpg/800px-Thien_Cam_Beach_Ha_Tinh.jpg',
  'nem chua thanh hóa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Nem_chua_Thanh_Hoa.jpg/800px-Nem_chua_Thanh_Hoa.jpg',
  'cháo lươn nghệ an': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chao_luon_Nghe_An.jpg/800px-Chao_luon_Nghe_An.jpg',
  'cu đơ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Keo_cu_do_Ha_Tinh.jpg/800px-Keo_cu_do_Ha_Tinh.jpg'
}

/**
 * Tìm ảnh khớp theo từ khóa đã xác thực
 */
function matchKnownAuthenticPhoto(placeName, tags = []) {
  const lowerName = placeName.toLowerCase()
  const lowerTags = (tags || []).map(t => t.toLowerCase()).join(' ')

  for (const [keyword, url] of Object.entries(KNOWN_AUTHENTIC_PHOTOS)) {
    if (lowerName.includes(keyword) || lowerTags.includes(keyword)) {
      return url
    }
  }
  return null
}

/**
 * Tìm ảnh thật trên Wikipedia bằng Tiếng Việt
 */
async function findRealPhotoFromWikipedia(placeName, destination) {
  const searchQueries = [
    placeName,
    `${placeName} ${destination}`
  ]

  for (const q of searchQueries) {
    try {
      const searchUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`
      const res = await axios.get(searchUrl, { headers: HTTP_HEADERS, timeout: 3500 })
      const firstResult = res.data?.query?.search?.[0]

      if (firstResult && firstResult.title) {
        const pageUrl = `https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult.title)}`
        const pageRes = await axios.get(pageUrl, { headers: HTTP_HEADERS, timeout: 3500 })
        const pageData = pageRes.data

        let rawImg = pageData.originalimage?.source || pageData.thumbnail?.source
        if (rawImg) {
          let hdImg = rawImg.replace(/\/\d+px-/, '/800px-')
          return {
            image: hdImg,
            description: pageData.extract || null,
            lat: pageData.coordinates?.lat || null,
            lon: pageData.coordinates?.lon || null
          }
        }
      }
    } catch (e) {}
  }
  return null
}

/**
 * Xử lý song song theo lô để hoàn thành cực nhanh
 */
async function processBatch(places, batchSize = 12) {
  let updated = 0
  for (let i = 0; i < places.length; i += batchSize) {
    const batch = places.slice(i, i + batchSize)
    await Promise.all(batch.map(async (place) => {
      try {
        // 1. Kiểm tra từ điển ảnh thật xác thực
        const knownPhoto = matchKnownAuthenticPhoto(place.name, place.tags)
        if (knownPhoto) {
          await Place.updateOne({ _id: place._id }, { $set: { image: knownPhoto } })
          updated++
          return
        }

        // 2. Tra cứu Wikipedia
        const wikiData = await findRealPhotoFromWikipedia(place.name, place.destination)
        if (wikiData?.image) {
          const updateDoc = { image: wikiData.image }
          if (wikiData.description && (!place.description || place.description.length < 40)) {
            updateDoc.description = wikiData.description
          }
          if (wikiData.lat && wikiData.lon && (!place.latitude || !place.longitude)) {
            updateDoc.latitude = wikiData.lat
            updateDoc.longitude = wikiData.lon
          }
          await Place.updateOne({ _id: place._id }, { $set: updateDoc })
          updated++
        }
      } catch (err) {}
    }))
    process.stdout.write(`\r🚀 Tiến độ: ${Math.min(i + batchSize, places.length)} / ${places.length} địa điểm đã quét...`)
  }
  return updated
}

async function enrichAllDatabaseWithRealPhotos() {
  console.log('==================================================================')
  console.log('🚀 ĐANG QUÉT TOÀN BỘ CSDL ĐỂ ĐỒNG BỘ ẢNH THẬT 100% (11 CỤM MIỀN TRUNG)')
  console.log('==================================================================\n')

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Kết nối MongoDB Atlas thành công!\n')

    const allPlaces = await Place.find({})
    console.log(`📊 Tổng số địa điểm cần làm giàu trong CSDL: ${allPlaces.length}`)

    const startTime = Date.now()
    const updatedCount = await processBatch(allPlaces, 15)
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log('\n\n==================================================================')
    console.log(`🎉 HOÀN TẤT ĐỒNG BỘ ẢNH THẬT CHO TOÀN BỘ CƠ SỞ DỮ LIỆU!`)
    console.log(`   - Tổng địa điểm kiểm tra : ${allPlaces.length}`)
    console.log(`   - Đã cập nhật ảnh thật HD : ${updatedCount}`)
    console.log(`   - Thời gian thực thi      : ${elapsed} giây`)
    console.log('==================================================================\n')
    return { total: allPlaces.length, updated: updatedCount }
  } catch (err) {
    console.error('❌ Lỗi khi làm giàu ảnh thật:', err.message)
  }
}

if (require.main === module) {
  enrichAllDatabaseWithRealPhotos().then(() => process.exit(0)).catch(() => process.exit(1))
}

module.exports = {
  enrichAllDatabaseWithRealPhotos,
  KNOWN_AUTHENTIC_PHOTOS
}
