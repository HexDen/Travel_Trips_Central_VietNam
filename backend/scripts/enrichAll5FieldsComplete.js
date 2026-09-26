const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../models/Place');

// Danh sách tọa độ trung tâm phân vùng cụm (Micro-district coordinates)
const DISTRICT_COORDS = {
  'hải châu': { lat: 16.0683, lng: 108.2215, district: 'Hải Châu, Đà Nẵng' },
  'sơn trà': { lat: 16.0850, lng: 108.2450, district: 'Sơn Trà, Đà Nẵng' },
  'ngũ hành sơn': { lat: 16.0028, lng: 108.2612, district: 'Ngũ Hành Sơn, Đà Nẵng' },
  'thanh khê': { lat: 16.0600, lng: 108.1900, district: 'Thanh Khê, Đà Nẵng' },
  'hòa vang': { lat: 15.9958, lng: 107.9965, district: 'Hòa Vang, Đà Nẵng' },
  'bà nà': { lat: 15.9958, lng: 107.9965, district: 'Bà Nà, Đà Nẵng' },
  'đà nẵng': { lat: 16.0544, lng: 108.2022, district: 'Hải Châu, Đà Nẵng' },
  
  'đại nội': { lat: 16.4698, lng: 107.5786, district: 'Kinh Thành, Huế' },
  'phú hội': { lat: 16.4637, lng: 107.5909, district: 'Phố Tây Phú Hội, Huế' },
  'lăng tẩm': { lat: 16.4330, lng: 107.5650, district: 'Khu Lăng Tẩm Thủy Xuân, Huế' },
  'hương thủy': { lat: 16.4150, lng: 107.6250, district: 'Hương Thủy, Huế' },
  'lăng cô': { lat: 16.2300, lng: 108.0100, district: 'Vịnh Lăng Cô, Phú Lộc' },
  'huế': { lat: 16.4637, lng: 107.5909, district: 'TP. Huế' },
  
  'phố cổ hội an': { lat: 15.8770, lng: 108.3275, district: 'Phố Cổ Hội An' },
  'hội an': { lat: 15.8801, lng: 108.3380, district: 'TP. Hội An' },
  'an bàng': { lat: 15.9080, lng: 108.3490, district: 'Biển An Bàng, Hội An' },
  'mỹ sơn': { lat: 15.7990, lng: 108.1240, district: 'Duy Xuyên, Quảng Nam' },
  'quảng nam': { lat: 15.5600, lng: 108.4800, district: 'Quảng Nam' },
  
  'phong nha': { lat: 17.5500, lng: 106.2800, district: 'Vườn QG Phong Nha - Kẻ Bàng' },
  'đồng hới': { lat: 17.4680, lng: 106.6200, district: 'Đồng Hới, Quảng Bình' },
  'quảng bình': { lat: 17.4700, lng: 106.6000, district: 'Quảng Bình' },
  
  'quảng trị': { lat: 16.7450, lng: 107.1850, district: 'Quảng Trị' },
  'lý sơn': { lat: 15.3800, lng: 109.1100, district: 'Đảo Lý Sơn, Quảng Ngãi' },
  'quảng ngãi': { lat: 15.1200, lng: 108.8000, district: 'TP. Quảng Ngãi' },
  
  'quy nhơn': { lat: 13.7820, lng: 109.2190, district: 'TP. Quy Nhơn' },
  'kỳ co': { lat: 13.9180, lng: 109.2880, district: 'Nhơn Lý, Quy Nhơn' },
  'eo gió': { lat: 13.9180, lng: 109.2880, district: 'Nhơn Lý, Quy Nhơn' },
  'bình định': { lat: 13.7820, lng: 109.2190, district: 'Bình Định' },
  
  'gành đá đĩa': { lat: 13.3540, lng: 109.2970, district: 'Tuy An, Phú Yên' },
  'mũi điện': { lat: 12.8800, lng: 109.4580, district: 'Đông Hòa, Phú Yên' },
  'tuy hòa': { lat: 13.0880, lng: 109.3080, district: 'TP. Tuy Hòa, Phú Yên' },
  'phú yên': { lat: 13.0880, lng: 109.3080, district: 'Phú Yên' },
  
  'nha trang': { lat: 12.2388, lng: 109.1967, district: 'TP. Nha Trang' },
  'cam ranh': { lat: 12.0300, lng: 109.1700, district: 'Cam Ranh, Khánh Hòa' },
  'khánh hòa': { lat: 12.2388, lng: 109.1967, district: 'Khánh Hòa' },
  
  'phan thiết': { lat: 10.9333, lng: 108.1000, district: 'TP. Phan Thiết' },
  'mũi né': { lat: 10.9333, lng: 108.2800, district: 'Mũi Né, Phan Thiết' },
  'bình thuận': { lat: 10.9333, lng: 108.1000, district: 'Bình Thuận' },
  
  'phan rang': { lat: 11.5666, lng: 108.9833, district: 'Phan Rang - Tháp Chàm' },
  'ninh thuận': { lat: 11.5666, lng: 108.9833, district: 'Ninh Thuận' },

  // Thêm toạ độ theo destination name (không có micro-district)
  'sầm sơn': { lat: 19.7350, lng: 105.9010, district: 'Sầm Sơn, Thanh Hóa' },
  'pù luông': { lat: 20.4300, lng: 105.0800, district: 'Bá Thước, Thanh Hóa' },
  'thanh hóa': { lat: 19.8073, lng: 105.7755, district: 'TP. Thanh Hóa' },
  'nghệ an': { lat: 18.6734, lng: 105.6928, district: 'TP. Vinh, Nghệ An' },
  'vinh': { lat: 18.6734, lng: 105.6928, district: 'TP. Vinh, Nghệ An' },
  'cửa lò': { lat: 18.8130, lng: 105.7240, district: 'Cửa Lò, Nghệ An' },
  'hà tĩnh': { lat: 18.3560, lng: 105.8874, district: 'TP. Hà Tĩnh' },
  'thiên cầm': { lat: 18.3256, lng: 106.0321, district: 'Cẩm Xuyên, Hà Tĩnh' },
  'gia lai': { lat: 13.9833, lng: 108.0000, district: 'TP. Pleiku, Gia Lai' },
  'pleiku': { lat: 13.9833, lng: 108.0000, district: 'TP. Pleiku, Gia Lai' },
  'đắk lắk': { lat: 12.6696, lng: 108.0503, district: 'TP. Buôn Ma Thuột' },
  'buôn ma thuột': { lat: 12.6696, lng: 108.0503, district: 'TP. Buôn Ma Thuột' },
  'ban mê': { lat: 12.6696, lng: 108.0503, district: 'TP. Buôn Ma Thuột' },
  'đà lạt': { lat: 11.9465, lng: 108.4419, district: 'TP. Đà Lạt' },
  'lâm đồng': { lat: 11.9465, lng: 108.4419, district: 'Lâm Đồng' }
};

// Fallback tọa độ mặc định theo destination
const PROVINCE_DEFAULT_COORDS = {
  'thanh hóa': { lat: 19.8073, lng: 105.7755 },
  'nghệ an': { lat: 18.6734, lng: 105.6928 },
  'hà tĩnh': { lat: 18.3560, lng: 105.8874 },
  'quảng bình': { lat: 17.4700, lng: 106.6000 },
  'quảng trị': { lat: 16.7450, lng: 107.1850 },
  'huế': { lat: 16.4637, lng: 107.5909 },
  'thừa thiên huế': { lat: 16.4637, lng: 107.5909 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022 },
  'quảng nam': { lat: 15.5600, lng: 108.4800 },
  'quảng ngãi': { lat: 15.1200, lng: 108.8000 },
  'bình định': { lat: 13.7820, lng: 109.2190 },
  'phú yên': { lat: 13.0880, lng: 109.3080 },
  'khánh hòa': { lat: 12.2388, lng: 109.1967 },
  'ninh thuận': { lat: 11.5666, lng: 108.9833 },
  'bình thuận': { lat: 10.9333, lng: 108.1000 },
  'gia lai': { lat: 13.9833, lng: 108.0000 },
  'đắk lắk': { lat: 12.6696, lng: 108.0503 },
  'đắk nông': { lat: 12.0045, lng: 107.6904 },
  'kon tum': { lat: 14.3497, lng: 108.0004 },
  'lâm đồng': { lat: 11.9465, lng: 108.4419 }
};

function resolveDistrictAndCoords(place) {
  const fullText = `${place.name} ${place.address || ''} ${place.destination || ''}`.toLowerCase();
  
  let districtName = place.destination || 'Miền Trung';
  let lat = place.latitude;
  let lng = place.longitude;

  // Tìm micro-district phù hợp
  for (const [key, val] of Object.entries(DISTRICT_COORDS)) {
    if (fullText.includes(key)) {
      districtName = val.district;
      // Nếu tọa độ hiện tại không hợp lệ (ngoài miền Trung), fix tọa độ
      if (!lat || !lng || lat < 10.5 || lat > 19.5 || lng < 105.0 || lng > 110.5) {
        // Cho một độ lệch nhỏ ngẫu nhiên tránh trùng 100% tọa độ
        lat = Number((val.lat + (Math.random() - 0.5) * 0.008).toFixed(6));
        lng = Number((val.lng + (Math.random() - 0.5) * 0.008).toFixed(6));
      }
      break;
    }
  }

  // Nếu vẫn không có tọa độ hợp lệ - dùng bảng province defaults trước
  if (!lat || !lng || lat < 10.5 || lat > 19.5 || lng < 105.0 || lng > 110.5) {
    const destKey = (place.destination || '').toLowerCase().trim();
    const provinceCoords = PROVINCE_DEFAULT_COORDS[destKey];
    if (provinceCoords) {
      lat = Number((provinceCoords.lat + (Math.random() - 0.5) * 0.02).toFixed(6));
      lng = Number((provinceCoords.lng + (Math.random() - 0.5) * 0.02).toFixed(6));
    } else {
      lat = 16.0544;
      lng = 108.2022;
    }
  }

  return { district: districtName, latitude: lat, longitude: lng };
}

function classifyIndoor(place) {
  const text = `${place.name} ${place.description || ''} ${place.address || ''} ${(place.tags || []).join(' ')}`.toLowerCase();
  
  // Rõ ràng là ngoài trời
  const outdoorKeywords = [
    'bãi biển', 'biển', 'đảo', 'bán đảo', 'đèo', 'núi', 'thác', 'suối', 'cầu rồng', 'cầu tình yêu', 
    'vịnh', 'hòn', 'gành đá đĩa', 'eo gió', 'kỳ co', 'mũi điện', 'rạn', 'đồi cát', 'công viên ngoài trời',
    'phố đi bộ', 'phố cổ', 'chợ đêm', 'làng bích họa', 'cù lao', 'rừng dừa'
  ];
  for (const kw of outdoorKeywords) {
    if (text.includes(kw)) return false;
  }

  // Rõ ràng trong nhà / có mái che
  const indoorKeywords = [
    'bảo tàng', 'museum', 'quán cà phê', 'cafe', 'coffee', 'nhà hàng', 'quán bún', 'quán cơm', 
    'tiệm', 'trung tâm thương mại', 'mall', 'rạp phim', 'khách sạn', 'resort', 'homestay', 'hotel',
    'spa', 'xưởng', 'làm bánh', 'làm gốm', 'trong nhà', 'điện kiến trung', 'điện thái hòa'
  ];
  for (const kw of indoorKeywords) {
    if (text.includes(kw)) return true;
  }

  if (place.type === 'cafe' || place.type === 'restaurant' || place.type === 'hotel') {
    return true;
  }

  return false;
}

function resolveDwellAndHours(place) {
  const text = `${place.name} ${place.description || ''} ${(place.tags || []).join(' ')}`.toLowerCase();
  let open_hours = '';
  let dwell_time = '';
  let best_time = '';

  if (place.type === 'hotel') {
    open_hours = 'Mở cửa 24/24 (Nhận phòng: 14:00, Trả phòng: 12:00)';
    dwell_time = 'Lưu trú qua đêm';
    best_time = 'Check-in từ 14:00';
  } else if (text.includes('chợ đêm') || text.includes('dạo đêm') || text.includes('cầu rồng') || text.includes('phun lửa') || text.includes('bar') || text.includes('pub')) {
    open_hours = '17:30 - 23:30 (Hàng ngày)';
    dwell_time = '1 - 2 tiếng';
    best_time = '19:00 - 21:30 (Lung linh ánh đèn, sôi động nhất)';
  } else if (text.includes('chè') || text.includes('ăn vặt') || text.includes('bánh tráng nướng')) {
    open_hours = '14:00 - 22:30 (Hàng ngày)';
    dwell_time = '30 - 45 phút';
    best_time = '15:30 - 18:00 (Ăn xế chiều) hoặc 20:00 - 21:30';
  } else if (text.includes('sáng') || text.includes('bún bò') || text.includes('bánh mì') || text.includes('mì quảng') || text.includes('bánh canh')) {
    open_hours = '06:00 - 12:00 & 16:30 - 21:00';
    dwell_time = '30 - 45 phút';
    best_time = '06:30 - 08:30 (Thưởng thức bữa sáng nóng hổi, nước dùng thơm nhất)';
  } else if (place.type === 'cafe') {
    open_hours = '06:30 - 22:30 (Thứ 2 - CN)';
    dwell_time = '45 phút - 1.5 tiếng';
    best_time = '07:30 - 09:00 (Cà phê sớm) hoặc 15:30 - 17:30 (Trà chiều thư giãn)';
  } else if (place.type === 'restaurant') {
    open_hours = '09:30 - 22:00 (Hàng ngày)';
    dwell_time = '1 - 1.5 tiếng';
    best_time = '11:30 - 13:00 (Bữa trưa) hoặc 18:30 - 20:30 (Bữa tối sum vầy)';
  } else if (text.includes('bảo tàng') || text.includes('đại nội') || text.includes('bà nà') || text.includes('vinwonders')) {
    open_hours = '07:30 - 17:30 (Mở cửa tất cả các ngày)';
    dwell_time = text.includes('bà nà') || text.includes('vinwonders') ? '4 - 6 tiếng' : '2 - 3 tiếng';
    best_time = '08:00 - 10:30 (Buổi sáng mát mẻ, chụp hình đẹp)';
  } else if (text.includes('lăng') || text.includes('chùa') || text.includes('đền') || text.includes('tháp')) {
    open_hours = '07:00 - 17:30 (Hàng ngày)';
    dwell_time = '1 - 1.5 tiếng';
    best_time = '08:00 - 10:00 hoặc 15:00 - 16:30 (Thời tiết dịu mát, trang nghiêm)';
  } else if (text.includes('biển') || text.includes('bán đảo') || text.includes('đèo') || text.includes('đỉnh') || text.includes('mũi')) {
    open_hours = 'Mở cửa tự do 24/7';
    dwell_time = '1 - 2 tiếng';
    if (text.includes('mũi điện') || text.includes('bình minh') || text.includes('săn mây')) {
      best_time = '05:00 - 06:30 (Đón những tia bình minh đầu tiên)';
    } else {
      best_time = '16:00 - 18:00 (Ngắm hoàng hôn rực rỡ bên biển)';
    }
  } else {
    open_hours = '07:30 - 18:00 (Hàng ngày)';
    dwell_time = '1 - 1.5 tiếng';
    best_time = '08:30 - 10:30 hoặc 15:30 - 17:30';
  }

  return { open_hours, dwell_time, best_time };
}

function resolveDressCode(place) {
  const text = `${place.name} ${place.description || ''} ${(place.tags || []).join(' ')}`.toLowerCase();

  if (text.includes('chùa') || text.includes('lăng') || text.includes('đền') || text.includes('thánh địa') || text.includes('tháp chàm') || text.includes('nhà thờ') || text.includes('tâm linh') || text.includes('đại nội')) {
    return 'Trang phục lịch sự, kín đáo (vai và đầu gối được che kín, không mặc váy ngắn/áo sát nách)';
  }
  if (text.includes('động') || text.includes('núi') || text.includes('suối') || text.includes('rừng') || text.includes('trekking') || text.includes('bạch mã') || text.includes('đèo hải vân')) {
    return 'Trang phục năng động thoải mái, Bắt buộc mang giày thể thao chống trượt & thuốc chống muỗi';
  }
  if (text.includes('biển') || text.includes('tắm') || text.includes('lặn') || text.includes('đảo') || text.includes('san hô') || text.includes('suối khoáng')) {
    return 'Trang phục đi biển, dép xỏ ngón, mang theo kính râm, kem chống nắng và mũ rộng vành';
  }
  if (place.type === 'restaurant' && (text.includes('fine dining') || text.includes('sang trọng') || text.includes('resort'))) {
    return 'Lịch sự, smart casual (tránh mặc đồ ngủ, dép lê)';
  }
  return 'Trang phục tự do, thoải mái, ưu tiên giày bệt/sneaker dễ đi lại';
}

function resolveDishesAndPrice(place) {
  const text = `${place.name} ${place.description || ''} ${(place.tags || []).join(' ')}`.toLowerCase();
  let signature_dishes = [];
  let price_range = '';

  // Khám phá món ăn đặc trưng
  if (text.includes('bún bò')) signature_dishes = ['Bún bò bắp hoa giò gân', 'Chả cua xứ Huế', 'Tiết luộc mềm'];
  else if (text.includes('cơm hến') || text.includes('bún hến')) signature_dishes = ['Cơm hến đậm vị', 'Bún hến hoa chuối', 'Bánh tráng nướng mè chấm ruốc'];
  else if (text.includes('bánh bèo') || text.includes('bánh nậm') || text.includes('bánh lọc')) signature_dishes = ['Bánh bèo chén tôm cháy', 'Bánh nậm gói lá chuối', 'Bánh bột lọc tôm thịt trong vắt'];
  else if (text.includes('bánh khoái') || text.includes('nem lụi')) signature_dishes = ['Bánh khoái hoàng cung giòn rụm', 'Nem lụi nướng sả than hoa', 'Nước chấm tương gan đậu phụng'];
  else if (text.includes('bánh ướt')) signature_dishes = ['Bánh ướt thịt nướng than hoa', 'Nước mắm nêm bí truyền Kim Long'];
  else if (text.includes('bánh canh')) signature_dishes = ['Bánh canh Nam Phổ sệt tôm cua', 'Chả cá hấp'];
  else if (text.includes('chè')) signature_dishes = ['Chè bột lọc bọc heo quay', 'Chè hạt sen long nhãn', 'Chè khoai tía dẻo thơm'];
  else if (text.includes('mì quảng')) signature_dishes = ['Mì Quảng ếch om niêu đất', 'Mì Quảng tôm thịt trứng cút', 'Bánh tráng nướng giòn rụm'];
  else if (text.includes('cao lầu')) signature_dishes = ['Cao lầu Hội An thịt xá xíu đậm vị', 'Tép mỡ chiên giòn rụm', 'Rau sống Trà Quế'];
  else if (text.includes('cơm gà')) signature_dishes = ['Cơm gà Hội An xé phay bóp hành răm', 'Nước dùng lòng gà trứng non'];
  else if (text.includes('bánh mì')) signature_dishes = ['Bánh mì thập cẩm pate bơ thủ công', 'Thịt xíu nước sốt đậm đà'];
  else if (text.includes('hải sản') || text.includes('tôm') || text.includes('cua') || text.includes('mực') || text.includes('ốc')) {
    signature_dishes = ['Tôm hùm nướng bơ tỏi phô mai', 'Mực một nắng nướng sa tế', 'Sò điệp nướng mỡ hành đậu phộng', 'Ghẹ hấp bia'];
  } else if (text.includes('bánh xèo') || text.includes('tôm nhảy')) signature_dishes = ['Bánh xèo tôm nhảy đất giòn rụm', 'Bánh xèo mực sữa tươi', 'Rau mầm xoài xanh chấm bánh'];
  else if (text.includes('chả ram')) signature_dishes = ['Chả ram tôm đất Bình Định giòn tan', 'Rau sống cuốn bánh tráng chấm tương đậu'];
  else if (text.includes('bún chả cá') || text.includes('bún sứa') || text.includes('bún cá dầm')) signature_dishes = ['Bún sứa giòn sần sật', 'Bún chả cá thu hấp chiên', 'Nước dùng trong thanh ngọt tự nhiên'];
  else if (text.includes('nem nướng')) signature_dishes = ['Nem nướng Ninh Hòa nướng than hồng', 'Bánh tráng chiên giòn cuốn kèm', 'Nước sốt tương nếp gan heo thơm bùi'];
  else if (text.includes('bánh tráng cuốn thịt heo') || text.includes('quán trần')) signature_dishes = ['Bánh tráng cuốn thịt heo hai đầu da', 'Đĩa rau rừng hơn 10 loại', 'Mắm nêm nguyên chất'];
  else if (text.includes('cà phê muối') || text.includes('muối')) signature_dishes = ['Cà phê muối xứ Huế đậm đà kem béo', 'Trà đào cam sả thanh mát'];
  else if (place.type === 'cafe') signature_dishes = ['Cà phê phin truyền thống thơm lừng', 'Trà trái cây nhiệt đới', 'Bánh ngọt ăn kèm'];
  else if (place.type === 'restaurant') signature_dishes = ['Đặc sản ẩm thực miền Trung tinh hoa', 'Mâm cơm gia đình truyền thống'];

  // Khoảng giá thực tế tròn trịa
  if (place.type === 'cafe') {
    price_range = '25.000đ - 55.000đ/ly';
  } else if (text.includes('chè') || text.includes('bánh mì') || text.includes('ăn vặt')) {
    price_range = '15.000đ - 35.000đ/món';
  } else if (text.includes('hải sản')) {
    price_range = '180.000đ - 450.000đ/người (Tùy chọn hải sản tươi sống)';
  } else if (place.type === 'restaurant') {
    price_range = '45.000đ - 95.000đ/phần';
  } else if (place.type === 'hotel') {
    price_range = '450.000đ - 1.500.000đ/đêm phòng';
  } else if (place.estimated_cost && place.estimated_cost > 0) {
    price_range = `${Math.round(place.estimated_cost / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ/vé vào cổng';
  } else {
    price_range = 'Miễn phí vé tham quan';
  }

  return { signature_dishes, price_range };
}

async function enrichAllPlaces() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully!');

  const allPlaces = await Place.find({});
  console.log(`Processing total ${allPlaces.length} places in database...`);

  const bulkOps = [];
  let index = 0;

  for (const place of allPlaces) {
    const { district, latitude, longitude } = resolveDistrictAndCoords(place);
    const is_indoor = classifyIndoor(place);
    const { open_hours, dwell_time, best_time } = resolveDwellAndHours(place);
    const dress_code = resolveDressCode(place);
    const { signature_dishes, price_range } = resolveDishesAndPrice(place);

    // Chuẩn hóa estimated_cost để không bị số lẻ xấu thuật toán
    let cleanCost = place.estimated_cost;
    if (typeof cleanCost === 'number' && !isNaN(cleanCost)) {
      cleanCost = Math.round(cleanCost / 5000) * 5000; // Làm tròn đến 5.000đ
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: place._id },
        update: {
          $set: {
            open_hours,
            dwell_time,
            best_time,
            is_indoor,
            signature_dishes,
            price_range,
            dress_code,
            district,
            latitude,
            longitude,
            estimated_cost: cleanCost
          }
        }
      }
    });

    index++;
  }

  console.log(`Prepared ${bulkOps.length} updates. Executing in batches of 500...`);
  const BATCH_SIZE = 500;
  let totalModified = 0;
  for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
    const chunk = bulkOps.slice(i, i + BATCH_SIZE);
    const res = await Place.bulkWrite(chunk, { ordered: false });
    totalModified += (res.modifiedCount || 0);
    console.log(`Processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length} places (Updated: ${totalModified})...`);
  }

  const sample = await Place.findOne({ type: 'restaurant' });
  console.log('\nSample enriched restaurant:\n', JSON.stringify({
    name: sample.name,
    open_hours: sample.open_hours,
    dwell_time: sample.dwell_time,
    best_time: sample.best_time,
    is_indoor: sample.is_indoor,
    signature_dishes: sample.signature_dishes,
    price_range: sample.price_range,
    dress_code: sample.dress_code,
    district: sample.district,
    coords: [sample.latitude, sample.longitude]
  }, null, 2));

  const sampleAttraction = await Place.findOne({ type: 'attraction' });
  console.log('\nSample enriched attraction:\n', JSON.stringify({
    name: sampleAttraction.name,
    open_hours: sampleAttraction.open_hours,
    dwell_time: sampleAttraction.dwell_time,
    best_time: sampleAttraction.best_time,
    is_indoor: sampleAttraction.is_indoor,
    signature_dishes: sampleAttraction.signature_dishes,
    price_range: sampleAttraction.price_range,
    dress_code: sampleAttraction.dress_code,
    district: sampleAttraction.district,
    coords: [sampleAttraction.latitude, sampleAttraction.longitude]
  }, null, 2));

  await mongoose.connection.close();
  console.log('\nFinished all enrichment successfully!');
}

enrichAllPlaces().catch(err => {
  console.error('Error during enrichment:', err);
  process.exit(1);
});
