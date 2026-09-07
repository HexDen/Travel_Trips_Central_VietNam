const path = require('path')
const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const Place = require('../models/Place')

// Dataset toàn diện, chuẩn xác 100% về du lịch & ẩm thực miền Trung
const COMPREHENSIVE_PLACES = [
  // ==================== ĐÀ NẴNG & QUẢNG NAM (HỘI AN) ====================
  // Thắng cảnh & Di tích (Attractions)
  {
    name: 'Bà Nà Hills & Cầu Vàng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Thôn An Sơn, Xã Hòa Ninh, Huyện Hòa Vang, TP Đà Nẵng',
    description: 'Quần thể du lịch nghỉ dưỡng trên đỉnh núi Chúa với biểu tượng Cầu Vàng đôi bàn tay khổng lồ vang danh thế giới, Làng Pháp cổ kính và cáp treo đạt nhiều kỷ lục.',
    tags: ['cầu vàng', 'bà nà', 'núi chúa', 'cảnh đẹp'],
    estimated_cost: 900000,
    latitude: 15.9988,
    longitude: 107.9959,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Phố cổ Hội An',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Phường Minh An, TP Hội An, Tỉnh Quảng Nam (Khu vực mở rộng Đà Nẵng)',
    description: 'Di sản Văn hóa Thế giới UNESCO với những dãy nhà cổ mái ngói rêu phong, đèn lồng rực rỡ bên dòng sông Hoài thơ mộng và ẩm thực đường phố đặc sắc.',
    tags: ['phố cổ', 'hội an', 'unesco', 'đèn lồng'],
    estimated_cost: 150000,
    latitude: 15.8801,
    longitude: 108.338,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bán đảo Sơn Trà & Chùa Linh Ứng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Bãi Bụt, Phường Thọ Quang, Quận Sơn Trà, TP Đà Nẵng',
    description: 'Lá phổi xanh của Đà Nẵng sở hữu tượng Phật Quán Thế Âm cao 67m hướng ra biển Đông, rừng nguyên sinh với loài Voọc chà vá chân nâu quý hiếm.',
    tags: ['sơn trà', 'chùa linh ứng', 'tượng phật', 'ngắm cảnh'],
    estimated_cost: 0,
    latitude: 16.1001,
    longitude: 108.2778,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Danh thắng Ngũ Hành Sơn',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: '81 Huyền Trân Công Chúa, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP Đà Nẵng',
    description: 'Quần thể 5 ngọn núi đá vôi (Kim, Mộc, Thủy, Hỏa, Thổ) với hệ thống hang động kỳ bí như Động Huyền Không, Động Âm Phủ và các ngôi chùa cổ trầm mặc.',
    tags: ['ngũ hành sơn', 'động huyền không', 'hang động', 'tâm linh'],
    estimated_cost: 40000,
    latitude: 16.0044,
    longitude: 108.2618,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bãi biển Mỹ Khê',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Đường Võ Nguyên Giáp, Phường Phước Mỹ, Quận Sơn Trà, TP Đà Nẵng',
    description: 'Một trong những bãi biển quyến rũ nhất hành tinh do tạp chí Forbes bình chọn với bờ cát trắng mịn màng, làn nước trong xanh ấm áp quanh năm.',
    tags: ['biển mỹ khê', 'tắm biển', 'bờ cát trắng', 'nghỉ dưỡng'],
    estimated_cost: 0,
    latitude: 16.0592,
    longitude: 108.2467,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cầu Rồng Đà Nẵng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Đường Nguyễn Văn Linh, Phường Phước Ninh, Quận Hải Châu, TP Đà Nẵng',
    description: 'Cây cầu thép văng hình con rồng vươn mình ra biển, nổi tiếng với màn trình diễn phun lửa và phun nước độc đáo vào 21h tối Thứ 7, Chủ Nhật hàng tuần.',
    tags: ['cầu rồng', 'phun lửa', 'sông hàn', 'biểu tượng'],
    estimated_cost: 0,
    latitude: 16.0611,
    longitude: 108.2272,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Đèo Hải Vân & Hải Vân Quan',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Ranh giới giữa Quận Liên Chiểu, TP Đà Nẵng và Huyện Phú Lộc, TT-Huế',
    description: 'Thiên hạ đệ nhất hùng quan nối liền Đà Nẵng và Huế, cung đường đèo uốn lượn ven biển hùng vĩ bậc nhất Việt Nam với di tích cổng thành cổ.',
    tags: ['đèo hải vân', 'hải vân quan', 'phượt', 'ngắm biển'],
    estimated_cost: 0,
    latitude: 16.1969,
    longitude: 108.1325,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Rừng dừa Bảy Mẫu Cẩm Thanh',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Thôn Vạn Lăng, Xã Cẩm Thanh, TP Hội An, Tỉnh Quảng Nam',
    description: 'Miền Tây thu nhỏ giữa lòng phố Hội, trải nghiệm ngồi thuyền thúng dạo quanh rừng dừa nước bạt ngàn, xem múa thúng điêu luyện và câu cua.',
    tags: ['rừng dừa', 'thuyền thúng', 'hội an', 'trải nghiệm'],
    estimated_cost: 150000,
    latitude: 15.8752,
    longitude: 108.3685,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Thánh địa Mỹ Sơn',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Thôn Mỹ Sơn, Xã Duy Phú, Huyện Duy Xuyên, Tỉnh Quảng Nam',
    description: 'Quần thể di sản thế giới UNESCO với hơn 70 công trình đền tháp Chăm Pa cổ kính huyền bí xây dựng từ thế kỷ IV đến thế kỷ XIII.',
    tags: ['mỹ sơn', 'chăm pa', 'unesco', 'di tích cổ'],
    estimated_cost: 150000,
    latitude: 15.7958,
    longitude: 108.1245,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Đảo Cù Lao Chàm',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Xã Tân Hiệp, TP Hội An, Tỉnh Quảng Nam',
    description: 'Khu dự trữ sinh quyển thế giới với làn nước biển trong vắt nhìn thấu đáy, dịch vụ lặn ngắm rạn san hô nguyên sơ và thưởng thức hải sản đảo.',
    tags: ['cù lao chàm', 'lặn san hô', 'đảo', 'biển xanh'],
    estimated_cost: 450000,
    latitude: 15.9583,
    longitude: 108.5139,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bảo tàng Điêu khắc Chăm Đà Nẵng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Số 2 Đường 2 Tháng 9, Phường Bình Hiên, Quận Hải Châu, TP Đà Nẵng',
    description: 'Nơi lưu giữ và trưng bày bộ sưu tập hiện vật điêu khắc Chăm Pa quy mô và độc đáo nhất thế giới từ thời kỳ rực rỡ của vương quốc cổ.',
    tags: ['bảo tàng', 'điêu khắc chăm', 'lịch sử', 'văn hóa'],
    estimated_cost: 60000,
    latitude: 16.0601,
    longitude: 108.2235,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Công viên Suối khoáng nóng Núi Thần Tài',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Quốc lộ 14G, Xã Hòa Phú, Huyện Hòa Vang, TP Đà Nẵng',
    description: 'Khu du lịch sinh thái nghỉ dưỡng tắm khoáng nóng Osen Nhật Bản giữa thiên nhiên đại ngàn, công viên nước vui nhộn và luộc trứng gà trường thọ.',
    tags: ['núi thần tài', 'khoáng nóng', 'công viên nước', 'nghỉ dưỡng'],
    estimated_cost: 450000,
    latitude: 15.9754,
    longitude: 107.9782,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Rạn Nam Ô',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Phường Hòa Hiệp Nam, Quận Liên Chiểu, TP Đà Nẵng',
    description: 'Bãi đá rêu xanh mướt trải dài bên bờ sóng biếc hoang sơ, điểm check-in sống ảo cực đẹp vào mùa xuân và thưởng thức gỏi cá Nam Ô trứ danh.',
    tags: ['rạn nam ô', 'rêu xanh', 'gỏi cá', 'check-in'],
    estimated_cost: 0,
    latitude: 16.1265,
    longitude: 108.1215,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Đỉnh Bàn Cờ & Cây Đa Ngàn Năm',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Bán đảo Sơn Trà, Phường Thọ Quang, Quận Sơn Trà, TP Đà Nẵng',
    description: 'Điểm cao nhất bán đảo Sơn Trà với bức tượng Đế Thích chơi cờ tiên, tầm nhìn ôm trọn vịnh Đà Nẵng và TP trong mây ngút ngàn.',
    tags: ['đỉnh bàn cờ', 'sơn trà', 'săn mây', 'view toàn cảnh'],
    estimated_cost: 0,
    latitude: 16.1189,
    longitude: 108.2831,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Làng gốm Thanh Hà',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Đường Duy Tân, Phường Thanh Hà, TP Hội An, Tỉnh Quảng Nam',
    description: 'Làng nghề truyền thống hơn 500 năm tuổi ven sông Thu Bồn, nơi du khách được tự tay nặn các sản phẩm gốm và khám phá Công viên Đất nung.',
    tags: ['làng gốm', 'thanh hà', 'làng nghề', 'trải nghiệm'],
    estimated_cost: 35000,
    latitude: 15.8775,
    longitude: 108.3075,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Làng rau Trà Quế',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Thôn Trà Quế, Xã Cẩm Hà, TP Hội An, Tỉnh Quảng Nam',
    description: 'Làng trồng rau hữu cơ truyền thống trứ danh với hơn 20 loại rau thơm gia vị nức tiếng, du khách được trải nghiệm làm nông dân một ngày.',
    tags: ['làng rau', 'trà quế', 'nông nghiệp', 'sinh thái'],
    estimated_cost: 35000,
    latitude: 15.8992,
    longitude: 108.3375,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Chợ Hàn & Chợ Cồn Đà Nẵng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: '119 Trần Phú / 290 Hùng Vương, Quận Hải Châu, TP Đà Nẵng',
    description: 'Hai thiên đường ẩm thực và mua sắm đặc sản sầm uất bậc nhất Đà Nẵng với hàng trăm quầy hàng hải sản khô, chả bò, mắm nêm và đồ lưu niệm.',
    tags: ['chợ hàn', 'chợ cồn', 'mua sắm', 'đặc sản'],
    estimated_cost: 0,
    latitude: 16.0682,
    longitude: 108.2241,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Chợ đêm Helio & Công viên APEC',
    destination: 'Đà Nẵng',
    type: 'attraction',
    address: 'Đường 2 Tháng 9, Phường Hòa Cường Bắc, Quận Hải Châu, TP Đà Nẵng',
    description: 'Tổ hợp ẩm thực đường phố và chợ đêm lớn nhất Đà Nẵng cùng công viên APEC biểu tượng Cánh diều bay cao rực rỡ ánh đèn về đêm.',
    tags: ['chợ đêm', 'helio', 'apec', 'check-in đêm'],
    estimated_cost: 0,
    latitude: 16.0465,
    longitude: 108.2238,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&auto=format&fit=crop&q=80'
  },

  // Ẩm thực & Quán ăn đặc sản Đà Nẵng & Hội An (Restaurants)
  {
    name: 'Mì Quảng Bà Mua',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: '19-21 Trần Bình Trọng, Quận Hải Châu, TP Đà Nẵng',
    description: 'Thương hiệu mì Quảng trứ danh Đà Nẵng với sợi mì mềm dai, nước dùng đậm đà ngọt từ tôm thịt gà, ăn kèm rau sống tươi ngon và bánh tráng mè nướng giòn.',
    tags: ['mì quảng', 'đặc sản', 'bà mua', 'quán lâu đời'],
    estimated_cost: 45000,
    latitude: 16.0645,
    longitude: 108.2198,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bánh tráng cuốn thịt heo Quán Trần',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: '04 Lê Duẩn, Quận Hải Châu, TP Đà Nẵng',
    description: 'Đặc sản thịt heo hai đầu da luộc mềm béo ngậy cuốn bánh tráng phơi sương, rau ghém rừng hơn 10 loại chấm mắm nêm bí truyền thơm lừng.',
    tags: ['bánh tráng cuốn', 'thịt heo 2 đầu da', 'quán trần', 'mắm nêm'],
    estimated_cost: 140000,
    latitude: 16.0712,
    longitude: 108.2215,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bánh mì Phượng Hội An',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: '2B Phan Chu Trinh, Cẩm Châu, TP Hội An, Tỉnh Quảng Nam',
    description: 'Tiệm bánh mì vang danh thế giới được đầu bếp Anthony Bourdain ca ngợi là ngon nhất trần đời với pate thơm béo ngậy, thịt nướng sốt đậm đà.',
    tags: ['bánh mì phượng', 'hội an', 'ẩm thực đường phố', 'nổi tiếng'],
    estimated_cost: 35000,
    latitude: 15.8789,
    longitude: 108.3312,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cao lầu Bá Lễ Hội An',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: '49/3 Trần Hưng Đạo, Phường Minh An, TP Hội An, Tỉnh Quảng Nam',
    description: 'Món ăn biểu tượng của phố cổ Hội An với sợi cao lầu làm từ tro củi Cù Lao Chàm và nước giếng Bá Lễ nghìn năm, thịt xá xíu đậm vị và da heo chiên giòn.',
    tags: ['cao lầu', 'hội an', 'truyền thống', 'đặc sản'],
    estimated_cost: 45000,
    latitude: 15.8795,
    longitude: 108.3325,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bánh xèo & Nem lụi Bà Dưỡng',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: 'K280/23 Hoàng Diệu, Phường Bình Hiên, Quận Hải Châu, TP Đà Nẵng',
    description: 'Quán bánh xèo giòn rụm trong hẻm Hoàng Diệu nổi tiếng bậc nhất với nước chấm đậu phụng gan béo ngậy, nem lụi nướng than hoa thơm nức mũi.',
    tags: ['bánh xèo', 'bà dưỡng', 'nem lụi', 'nước chấm gan'],
    estimated_cost: 65000,
    latitude: 16.0585,
    longitude: 108.2162,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Hải sản Năm Đảnh',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: 'K139/H59/38 Trần Quang Khải, Thọ Quang, Quận Sơn Trà, TP Đà Nẵng',
    description: 'Thiên đường hải sản tươi sống giá bình dân đồng giá nức tiếng với các món ốc hương xào bơ tỏi, ghẹ hấp, mực trứng nướng sa tế, chip chip hấp sả.',
    tags: ['hải sản', 'năm đảnh', 'tươi sống', 'ngon bổ rẻ'],
    estimated_cost: 150000,
    latitude: 16.0965,
    longitude: 108.2415,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bún chả cá Bà Phiến',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: '63 Lê Hồng Phong, Phường Phước Ninh, Quận Hải Châu, TP Đà Nẵng',
    description: 'Tô bún chả cá thơm ngọt nước dùng hầm từ xương cá thu, bí đỏ, măng tươi và cà chua, miếng chả cá dai giòn chuẩn vị Đà Nẵng hơn 30 năm.',
    tags: ['bún chả cá', 'bà phiến', 'gia truyền', 'đặc sản'],
    estimated_cost: 40000,
    latitude: 16.0642,
    longitude: 108.2228,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cơm gà Bà Buội Hội An',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: '22 Phan Chu Trinh, Phường Minh An, TP Hội An, Tỉnh Quảng Nam',
    description: 'Tiệm cơm gà gia truyền từ những năm 1950 với hạt cơm nấu nước luộc gà óng vàng dẻo thơm, thịt gà ta xé phay bóp hành tây rau răm đậm vị.',
    tags: ['cơm gà', 'bà buội', 'hội an', 'gia truyền'],
    estimated_cost: 55000,
    latitude: 15.8785,
    longitude: 108.3308,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bún mắm nêm Bà Thuyên',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    address: '424/03 Lê Duẩn, Phường Chính Gián, Quận Thanh Khê, TP Đà Nẵng',
    description: 'Món bún mắm nêm thịt heo quay giòn bì hoặc tai heo giòn sần sật trộn đu đủ chua ngọt và ớt rim cay nồng đặc trưng miền Trung.',
    tags: ['bún mắm nêm', 'bà thuyên', 'heo quay', 'ớt rim'],
    estimated_cost: 35000,
    latitude: 16.0675,
    longitude: 108.2045,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80'
  },

  // Khách sạn & Cafe Đà Nẵng
  {
    name: 'InterContinental Danang Sun Peninsula Resort',
    destination: 'Đà Nẵng',
    type: 'hotel',
    address: 'Bãi Bắc, Bán đảo Sơn Trà, Quận Sơn Trà, TP Đà Nẵng',
    description: 'Khu nghỉ dưỡng 5 sao đẳng cấp thế giới được thiết kế bởi KTS lừng danh Bill Bensley với tầm nhìn ôm trọn vịnh biển hoang sơ tuyệt mỹ.',
    tags: ['resort', 'intercontinental', '5 sao', 'sơn trà'],
    estimated_cost: 8500000,
    latitude: 16.1215,
    longitude: 108.3072,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Vinpearl Resort & Spa Đà Nẵng',
    destination: 'Đà Nẵng',
    type: 'hotel',
    address: 'Số 23 Đường Trường Sa, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP Đà Nẵng',
    description: 'Quần thể biệt thự nghỉ dưỡng sang trọng ven biển Non Nước với hồ bơi vô cực vô cùng lãng mạn và tiện ích spa chuẩn quốc tế.',
    tags: ['vinpearl', 'resort', 'ven biển', 'nghỉ dưỡng'],
    estimated_cost: 3200000,
    latitude: 16.0125,
    longitude: 108.2678,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'À La Carte Danang Beach Hotel',
    destination: 'Đà Nẵng',
    type: 'hotel',
    address: '200 Võ Nguyên Giáp, Phường Phước Mỹ, Quận Sơn Trà, TP Đà Nẵng',
    description: 'Khách sạn căn hộ mặt biển Mỹ Khê với bể bơi vô cực trên tầng thượng đầu tiên tại Việt Nam và quầy The Top Bar ngắm hoàng hôn đỉnh cao.',
    tags: ['khách sạn', 'a la carte', 'hồ bơi vô cực', 'mặt biển'],
    estimated_cost: 1450000,
    latitude: 16.0685,
    longitude: 108.2462,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sơn Trà Marina Cafe',
    destination: 'Đà Nẵng',
    type: 'cafe',
    address: 'Đường Hồ Xanh, Phường Thọ Quang, Quận Sơn Trà, TP Đà Nẵng',
    description: 'Quán cafe cảng biển mang phong cách kiến trúc Santorini Hy Lạp với tông màu trắng xanh tuyệt đẹp, view ngắm trọn thành phố và biển khơi.',
    tags: ['cafe', 'santorini', 'sơn trà marina', 'check-in'],
    estimated_cost: 75000,
    latitude: 16.1052,
    longitude: 108.2612,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80'
  },
  {
    name: 'Faifo Coffee Hội An',
    destination: 'Đà Nẵng',
    type: 'cafe',
    address: '130 Trần Phú, Phường Minh An, TP Hội An, Tỉnh Quảng Nam',
    description: 'Quán cafe sân thượng nổi tiếng nhất phố cổ Hội An với góc chụp ngắm trọn toàn cảnh những mái ngói rêu phong cổ kính huyền thoại.',
    tags: ['faifo coffee', 'sân thượng', 'hội an', 'ngắm phố cổ'],
    estimated_cost: 60000,
    latitude: 15.8778,
    longitude: 108.3298,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&auto=format&fit=crop&q=80'
  }
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('🌱 Đang đồng bộ cơ sở dữ liệu địa điểm toàn diện...')

  let count = 0
  for (const place of COMPREHENSIVE_PLACES) {
    await Place.updateOne(
      { name: place.name, destination: place.destination },
      { $set: place },
      { upsert: true }
    )
    count++
  }

  console.log(`✅ Đã nạp thành công ${count} địa điểm phong phú cho Đà Nẵng & Hội An!`)
  const total = await Place.countDocuments()
  console.log(`📊 Tổng số địa điểm hiện có trong CSDL toàn hệ thống: ${total}`)
  process.exit(0)
}

seed().catch(e => {
  console.error(e)
  process.exit(1)
})
