const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
require('dotenv').config()
const mongoose = require('mongoose')
const Place = require('../models/Place')

const COMPREHENSIVE_PLACES = {
  'Quảng Bình': [
    { name: 'Động Phong Nha', type: 'attraction', address: 'Thị trấn Phong Nha, H. Bố Trạch, Quảng Bình', description: 'Kỳ quan đệ nhất động với dòng sông ngầm dài nhất và hệ thống thạch nhũ lung linh kỳ vĩ.', tags: ['hang động', 'di sản thế giới', 'sông ngầm'], estimated_cost: 150000, latitude: 17.5898, longitude: 106.2828, rating: 4.9 },
    { name: 'Động Thiên Đường (Paradise Cave)', type: 'attraction', address: 'Km 16 Đường Hồ Chí Minh nhánh Tây, Xã Sơn Trạch, H. Bố Trạch, Quảng Bình', description: 'Được mệnh danh là hoàng cung trong lòng đất với quy mô tráng lệ bậc nhất Châu Á.', tags: ['hang động', 'kỳ quan', 'check-in'], estimated_cost: 250000, latitude: 17.5192, longitude: 106.2231, rating: 4.9 },
    { name: 'Suối Nước Moọc', type: 'attraction', address: 'Đường 20 Quyết Thắng, H. Bố Trạch, Quảng Bình', description: 'Dòng suối trong vắt như ngọc bích giữa rừng nguyên sinh, chèo thuyền kayak và tắm suối mát lạnh.', tags: ['tắm suối', 'kayak', 'thiên nhiên'], estimated_cost: 180000, latitude: 17.5463, longitude: 106.2415, rating: 4.8 },
    { name: 'Sông Chày - Hang Tối', type: 'attraction', address: 'Xã Sơn Trạch, H. Bố Trạch, Quảng Bình', description: 'Trải nghiệm đu dây Zipline trên sông Chày xanh biếc và tắm bùn khoáng tự nhiên trong hang Tối.', tags: ['zipline', 'tắm bùn', 'mạo hiểm'], estimated_cost: 450000, latitude: 17.5611, longitude: 106.2458, rating: 4.8 },
    { name: 'Bãi biển Nhật Lệ', type: 'attraction', address: 'Đường Trương Pháp, P. Hải Thành, TP. Đồng Hới, Quảng Bình', description: 'Bãi biển thơ mộng ngay trung tâm thành phố với bãi cát trắng thoai thoải và sóng êm dịu.', tags: ['biển', 'ngắm hoàng hôn', 'tắm biển'], estimated_cost: 0, latitude: 17.4833, longitude: 106.6333, rating: 4.7 },
    { name: 'Bãi Đá Nhảy', type: 'attraction', address: 'Quốc lộ 1A, Xã Thanh Trạch, H. Bố Trạch, Quảng Bình', description: 'Quần thể đá nhô ra biển với muôn hình vạn trạng độc đáo, điểm check-in bình minh tuyệt đẹp.', tags: ['check-in', 'cảnh đẹp', 'biển'], estimated_cost: 0, latitude: 17.6521, longitude: 106.4892, rating: 4.7 },
    { name: 'Cồn Cát Quang Phú', type: 'attraction', address: 'Xã Quang Phú, TP. Đồng Hới, Quảng Bình', description: 'Đồi cát trắng mịn trải dài ngút ngàn, trải nghiệm trượt cát và ngắm hoàng hôn ảo diệu.', tags: ['trượt cát', 'đồi cát', 'check-in'], estimated_cost: 30000, latitude: 17.5147, longitude: 106.6214, rating: 4.6 },
    { name: 'Tượng Đài Mẹ Suốt & Quảng Bình Quan', type: 'attraction', address: 'Đường Quách Xuân Kỳ, P. Đồng Hải, TP. Đồng Hới, Quảng Bình', description: 'Biểu tượng lịch sử hào hùng bên dòng sông Nhật Lệ gắn liền với ký ức anh dũng.', tags: ['lịch sử', 'di tích', 'văn hóa'], estimated_cost: 0, latitude: 17.4689, longitude: 106.6261, rating: 4.6 },
    
    // Ẩm thực Quảng Bình
    { name: 'Quán Cháo Canh Gia Bảo', type: 'restaurant', address: '08 Lý Thường Kiệt, TP. Đồng Hới, Quảng Bình', description: 'Đặc sản cháo canh sợi mì mềm dai kèm cá lóc chiên giòn rụm và ram chiên giòn nóng hổi.', tags: ['cháo canh', 'ăn sáng', 'đặc sản'], estimated_cost: 40000, latitude: 17.4715, longitude: 106.6189, rating: 4.8 },
    { name: 'Bánh Bèo Tôm Cháy Dì Hoa', type: 'restaurant', address: 'Thôn 4, Xã Đồng Sơn, TP. Đồng Hới, Quảng Bình', description: 'Bánh bèo chén dẻo thơm rắc tôm chà vàng ruộm và da heo chiên giòn rụm nước mắm ớt cay nồng.', tags: ['bánh bèo', 'ăn vặt', 'đặc sản'], estimated_cost: 35000, latitude: 17.4589, longitude: 106.5982, rating: 4.8 },
    { name: 'Hải Sản Mệ Toại Bờ Biển Nhật Lệ', type: 'restaurant', address: '185 Trương Pháp, P. Hải Thành, TP. Đồng Hới, Quảng Bình', description: 'Hải sản tươi sống vừa cập bến: mực nhảy hấp gừng, sò điệp nướng mỡ hành, tôm hùm đất giá bình dân.', tags: ['hải sản', 'ăn tối', 'view biển'], estimated_cost: 250000, latitude: 17.4912, longitude: 106.6355, rating: 4.7 },
    { name: 'Gà Nướng Muối Cheo Phong Nha', type: 'restaurant', address: 'Thôn Phong Nha, H. Bố Trạch, Quảng Bình', description: 'Gà đồi nướng than hoa vàng rộm chấm muối Cheo cay the nồng đặc sản của người bản địa Phong Nha.', tags: ['gà nướng', 'muối cheo', 'ăn trưa'], estimated_cost: 180000, latitude: 17.5812, longitude: 106.2789, rating: 4.8 },
    { name: 'Lẩu Cá Khoai Quán Tân Châu', type: 'restaurant', address: 'Đường Trương Pháp, TP. Đồng Hới, Quảng Bình', description: 'Nồi lẩu cá khoai ngọt thanh bùi béo nấu cùng lá giang và măng chua thơm nức mũi.', tags: ['lẩu cá khoai', 'ăn tối', 'đặc sản'], estimated_cost: 200000, latitude: 17.4855, longitude: 106.6341, rating: 4.7 },

    // Cafe Quảng Bình
    { name: 'F-Coffee Đồng Hới', type: 'cafe', address: '336 Quang Trung, P. Ba Đồn, TP. Đồng Hới, Quảng Bình', description: 'Công trình kiến trúc tre đoạt giải quốc tế của KTS Võ Trọng Nghĩa, không gian mở thoáng đãng và hồ sen thư thái.', tags: ['cafe kiến trúc tre', 'check-in', 'chill'], estimated_cost: 50000, latitude: 17.4611, longitude: 106.6122, rating: 4.8 },
    { name: 'Tree Hugger Cafe Phong Nha', type: 'cafe', address: 'Thôn Phong Nha, H. Bố Trạch, Quảng Bình', description: 'Quán cafe sinh thái mộc mạc nhìn ra bến thuyền sông Son với đồ uống organic và không gian ấm áp.', tags: ['cafe sinh thái', 'view sông Son', 'chill'], estimated_cost: 45000, latitude: 17.5855, longitude: 106.2844, rating: 4.7 },
    { name: 'Lefa Cafe & Lounge', type: 'cafe', address: '48 Hữu Nghị, TP. Đồng Hới, Quảng Bình', description: 'Quán cafe phong cách hiện đại, phục vụ cafe pha máy chất lượng cao và bánh ngọt tươi ngon.', tags: ['cafe hiện đại', 'kem', 'chill'], estimated_cost: 45000, latitude: 17.4722, longitude: 106.6205, rating: 4.6 },

    // Khách sạn Quảng Bình
    { name: 'Sun Spa Resort Bảo Ninh', type: 'hotel', address: 'Bán đảo Bảo Ninh, TP. Đồng Hới, Quảng Bình', description: 'Resort 5 sao đẳng cấp quốc tế tọa lạc trên bán đảo cát trắng 3 mặt giáp biển và sông Nhật Lệ thơ mộng.', tags: ['resort 5 sao', 'hồ bơi', 'bãi biển riêng'], estimated_cost: 1650000, latitude: 17.4682, longitude: 106.6415, rating: 4.9 },
    { name: 'Mường Thanh Luxury Nhật Lệ Hotel', type: 'hotel', address: '121 Trương Pháp, P. Hải Thành, TP. Đồng Hới, Quảng Bình', description: 'Khách sạn 5 sao sang trọng đối diện trực diện bãi biển Nhật Lệ với tầm nhìn ôm trọn biển cả.', tags: ['khách sạn 5 sao', 'sát biển', 'view đẹp'], estimated_cost: 1100000, latitude: 17.4875, longitude: 106.6348, rating: 4.8 },
    { name: 'Phong Nha Lake House Resort', type: 'hotel', address: 'Khương Hà, H. Bố Trạch, Quảng Bình', description: 'Khu nghỉ dưỡng ven hồ Đồng Suôn thơ mộng, gần Vườn quốc gia Phong Nha Kẻ Bàng.', tags: ['resort ven hồ', 'thiên nhiên', 'yên tĩnh'], estimated_cost: 950000, latitude: 17.5522, longitude: 106.3111, rating: 4.7 }
  ],

  'Đà Nẵng': [
    { name: 'Bãi biển Mỹ Khê', type: 'attraction', address: 'Đường Võ Nguyên Giáp, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng', description: 'Top bãi biển quyến rũ nhất hành tinh, cát trắng mịn và biển êm quanh năm.', tags: ['biển', 'check-in', 'tắm biển'], estimated_cost: 0, latitude: 16.0592, longitude: 108.2467, rating: 4.8 },
    { name: 'Bà Nà Hills & Cầu Vàng', type: 'attraction', address: 'Thôn An Sơn, Xã Hòa Ninh, H. Hòa Vang, Đà Nẵng', description: 'Khu du lịch trên đỉnh núi Chúa với biểu tượng Cầu Vàng bàn tay khổng lồ và làng Pháp.', tags: ['cáp treo', 'cầu vàng', 'làng pháp'], estimated_cost: 900000, latitude: 15.9958, longitude: 107.9965, rating: 4.9 },
    { name: 'Bán đảo Sơn Trà & Chùa Linh Ứng', type: 'attraction', address: 'Bán đảo Sơn Trà, P. Thọ Quang, Q. Sơn Trà, Đà Nẵng', description: 'Tượng Phật Bà Quan Âm cao 67m ngắm trọn vịnh Đà Nẵng hùng vĩ.', tags: ['tâm linh', 'view biển', 'thiên nhiên'], estimated_cost: 0, latitude: 16.1009, longitude: 108.2764, rating: 4.8 },
    { name: 'Ngũ Hành Sơn (Non Nước)', type: 'attraction', address: '81 Huyền Trân Công Chúa, P. Hòa Hải, Q. Ngũ Hành Sơn, Đà Nẵng', description: 'Quần thể 5 ngọn núi đá vôi với hệ thống hang động Huyền Không, chùa Tam Thai cổ kính.', tags: ['hang động', 'tâm linh', 'danh thắng'], estimated_cost: 40000, latitude: 16.0028, longitude: 108.2612, rating: 4.7 },
    { name: 'Cầu Rồng & Cầu Tình Yêu', type: 'attraction', address: 'Đường Nguyễn Văn Linh, P. An Hải Tây, Q. Sơn Trà, Đà Nẵng', description: 'Biểu tượng Rồng thép phun lửa, phun nước vào tối thứ 7 & CN, check-in tượng cá chép hóa rồng.', tags: ['phun lửa', 'check-in đêm', 'biểu tượng'], estimated_cost: 0, latitude: 16.0611, longitude: 108.2278, rating: 4.8 },
    { name: 'Bảo tàng Điêu khắc Chăm', type: 'attraction', address: 'Số 02 đường 2 Tháng 9, P. Bình Hiên, Q. Hải Châu, Đà Nẵng', description: 'Bảo tàng lưu giữ bộ sưu tập nghệ thuật điêu khắc Chăm Pa độc bản lớn nhất thế giới.', tags: ['văn hóa', 'lịch sử', 'bảo tàng'], estimated_cost: 60000, latitude: 16.0597, longitude: 108.2231, rating: 4.6 },
    
    { name: 'Bánh tráng cuốn thịt heo Quán Trần', type: 'restaurant', address: '04 Lê Duẩn, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', description: 'Đặc sản thịt heo hai đầu da chấm mắm nêm đậm đà trứ danh xứ Đà thành.', tags: ['đặc sản', 'ăn trưa', 'nổi tiếng'], estimated_cost: 150000, latitude: 16.0683, longitude: 108.2167, rating: 4.7 },
    { name: 'Mì Quảng Bà Mua', type: 'restaurant', address: '19-21 Trần Bình Trọng, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', description: 'Tô mì Quảng tôm gà ếch chuẩn vị Quảng nước dùng sánh ngọt ăn kèm bánh tráng nướng.', tags: ['mì quảng', 'ăn sáng', 'đặc sản'], estimated_cost: 50000, latitude: 16.0642, longitude: 108.2195, rating: 4.7 },
    { name: 'Hải sản Bé Mặn', type: 'restaurant', address: 'Lô 11 Võ Nguyên Giáp, P. Mân Thái, Q. Sơn Trà, Đà Nẵng', description: 'Hải sản tươi sống chọn tại bể, nướng mỡ hành rang me thơm lừng bên bờ biển.', tags: ['hải sản', 'ăn tối', 'tươi sống'], estimated_cost: 350000, latitude: 16.0645, longitude: 108.2469, rating: 4.6 },
    { name: 'Bún chả cá Bà Lữ', type: 'restaurant', address: '319 Hùng Vương, P. Vĩnh Trung, Q. Thanh Khê, Đà Nẵng', description: 'Bát bún chả cá ngọt thanh từ bí đỏ, bắp cải và chả cá thu dai giòn thơm nức.', tags: ['bún chả cá', 'ăn sáng', 'nổi tiếng'], estimated_cost: 45000, latitude: 16.0678, longitude: 108.2105, rating: 4.6 },
    
    { name: 'Cộng Cà Phê Bạch Đằng', type: 'cafe', address: '96-98 Bạch Đằng, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', description: 'Quán cafe phong cách retro view trực diện dòng sông Hàn thơ mộng ngắm cầu quay.', tags: ['cafe', 'view sông Hàn', 'chill'], estimated_cost: 65000, latitude: 16.0688, longitude: 108.2233, rating: 4.6 },
    { name: 'Wonderlust Danang Cafe & Bakery', type: 'cafe', address: '96 Trần Phú, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', description: 'Không gian kính phong cách tối giản ngập tràn ánh sáng, bánh ngọt thủ công cực ngon.', tags: ['cafe đẹp', 'bánh ngọt', 'sống ảo'], estimated_cost: 60000, latitude: 16.0675, longitude: 108.2215, rating: 4.7 },
    
    { name: 'Khách sạn Sala Danang Beach Hotel', type: 'hotel', address: '36-38 Lâm Hoành, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng', description: 'Khách sạn 4 sao sát biển với hồ bơi vô cực ngắm trọn bình minh biển Mỹ Khê.', tags: ['khách sạn 4 sao', 'hồ bơi vô cực', 'view biển'], estimated_cost: 1200000, latitude: 16.0610, longitude: 108.2440, rating: 4.8 },
    { name: 'Novotel Danang Premier Han River', type: 'hotel', address: '36 Bạch Đằng, P. Thạch Thang, Q. Hải Châu, Đà Nẵng', description: 'Khách sạn 5 sao đẳng cấp bên bờ sông Hàn với sky bar tầng 36 ngắm toàn cảnh thành phố.', tags: ['khách sạn 5 sao', 'sông Hàn', 'sky bar'], estimated_cost: 2100000, latitude: 16.0772, longitude: 108.2245, rating: 4.9 }
  ],

  'Hội An': [
    { name: 'Phố cổ Hội An & Chùa Cầu', type: 'attraction', address: 'Đường Nguyễn Thị Minh Khai, P. Minh An, TP. Hội An, Quảng Nam', description: 'Di sản văn hóa thế giới với những ngôi nhà cổ sơn vàng, hoa giấy rực rỡ và đèn lồng lung linh.', tags: ['di sản', 'phố cổ', 'check-in'], estimated_cost: 120000, latitude: 15.8778, longitude: 108.3262, rating: 4.9 },
    { name: 'Rừng dừa Bảy Mẫu Cẩm Thanh', type: 'attraction', address: 'Tổ 2, Thôn Cần Nhân, Xã Cẩm Thanh, TP. Hội An, Quảng Nam', description: 'Trải nghiệm đi thuyền thúng múa xoay trên sông nước miền Tây thu nhỏ cực kỳ phấn khích.', tags: ['thuyền thúng', 'vui chơi', 'trải nghiệm'], estimated_cost: 150000, latitude: 15.8672, longitude: 108.3655, rating: 4.7 },
    { name: 'Làng gốm Thanh Hà', type: 'attraction', address: 'Phạm Phán, Khối phố 5, P. Thanh Hà, TP. Hội An, Quảng Nam', description: 'Làng nghề gốm truyền thống hơn 500 năm tuổi, tự tay chuốt gốm và tham quan công viên gốm.', tags: ['làng nghề', 'trải nghiệm', 'văn hóa'], estimated_cost: 50000, latitude: 15.8725, longitude: 108.3012, rating: 4.6 },
    { name: 'Biển An Bàng', type: 'attraction', address: 'Đường Hai Bà Trưng, P. Cẩm An, TP. Hội An, Quảng Nam', description: 'Bãi biển hoang sơ, lãng mạn với các quán bar cafe mộc mạc bên bờ cát trải dài.', tags: ['biển', 'chill', 'hoàng hôn'], estimated_cost: 0, latitude: 15.9125, longitude: 108.3411, rating: 4.8 },

    { name: 'Bánh mì Madam Khánh (The Banh Mi Queen)', type: 'restaurant', address: '115 Trần Cao Vân, P. Minh An, TP. Hội An, Quảng Nam', description: 'Bánh mì ngon nức tiếng thế giới với nhân pate, thịt xá xíu đậm đà và nước sốt bí truyền.', tags: ['bánh mì', 'ăn sáng', 'nổi tiếng'], estimated_cost: 35000, latitude: 15.8821, longitude: 108.3289, rating: 4.9 },
    { name: 'Cơm gà Bà Buổi', type: 'restaurant', address: '22 Phan Chu Trinh, P. Minh An, TP. Hội An, Quảng Nam', description: 'Quán cơm gà gia truyền hơn 60 năm với hạt cơm vàng óng nấu từ nước luộc gà và thịt gà ta xé phay.', tags: ['cơm gà', 'đặc sản', 'ăn trưa'], estimated_cost: 60000, latitude: 15.8795, longitude: 108.3308, rating: 4.7 },
    { name: 'Cao Lầu Thanh', type: 'restaurant', address: '26 Thái Phiên, P. Minh An, TP. Hội An, Quảng Nam', description: 'Món cao lầu chuẩn gốc sợi mì vàng dai giòn ăn kèm thịt xíu thơm lừng và rau sống Trà Quế.', tags: ['cao lầu', 'đặc sản', 'ẩm thực'], estimated_cost: 40000, latitude: 15.8805, longitude: 108.3312, rating: 4.7 },
    
    { name: 'Faifo Coffee Rooftop', type: 'cafe', address: '130 Trần Phú, P. Minh An, TP. Hội An, Quảng Nam', description: 'Góc ban công sân thượng huyền thoại ngắm trọn mái ngói âm dương phủ rêu phong của phố cổ.', tags: ['rooftop', 'sống ảo', 'cafe'], estimated_cost: 75000, latitude: 15.8772, longitude: 108.3281, rating: 4.8 },
    { name: 'Mót Hội An (Nước thảo mộc)', type: 'cafe', address: '150 Trần Phú, P. Minh An, TP. Hội An, Quảng Nam', description: 'Ly nước thảo mộc hoa cúc la hán quả thơm mát cài cánh sen hồng thanh tao đặc trưng phố cổ.', tags: ['nước mót', 'đặc trưng', 'giải khát'], estimated_cost: 15000, latitude: 15.8775, longitude: 108.3295, rating: 4.9 },

    { name: 'La Siesta Hoi An Resort & Spa', type: 'hotel', address: '132 Hùng Vương, P. Cẩm Phô, TP. Hội An, Quảng Nam', description: 'Resort nghỉ dưỡng xanh mát giữa vườn nhiệt đới, hồ bơi nước mặn và phong cách boutique quý phái.', tags: ['resort 5 sao', 'hồ bơi', 'spa'], estimated_cost: 1850000, latitude: 15.8789, longitude: 108.3182, rating: 4.9 }
  ],

  'Huế': [
    { name: 'Đại Nội Huế (Hoàng Thành Huế)', type: 'attraction', address: 'Đường 23/8, P. Thuận Hòa, TP. Huế, Thừa Thiên Huế', description: 'Quần thể cung điện, đền đài nguy nga của triều Nguyễn, check-in Ngọ Môn và Điện Thái Hòa.', tags: ['hoàng cung', 'di sản', 'lịch sử'], estimated_cost: 200000, latitude: 16.4695, longitude: 107.5786, rating: 4.9 },
    { name: 'Chùa Thiên Mụ & Sông Hương', type: 'attraction', address: 'Đường Nguyễn Phúc Nguyên, P. Hương Long, TP. Huế, Thừa Thiên Huế', description: 'Biểu tượng tâm linh cổ kính hơn 400 năm tuổi soi bóng bên dòng sông Hương thơ mộng.', tags: ['tâm linh', 'sông Hương', 'cảnh đẹp'], estimated_cost: 0, latitude: 16.4533, longitude: 107.5453, rating: 4.8 },
    { name: 'Lăng Khải Định', type: 'attraction', address: 'Xã Thủy Bằng, TP. Huế, Thừa Thiên Huế', description: 'Tuyệt tác kiến trúc giao thoa Đông - Tây với nghệ thuật khảm sành sứ và tranh tường Cửu Long Ẩn Vân.', tags: ['lăng tẩm', 'nghệ thuật', 'check-in'], estimated_cost: 150000, latitude: 16.3989, longitude: 107.5906, rating: 4.9 },
    { name: 'Lăng Tự Đức', type: 'attraction', address: 'Thôn Thượng Ba, P. Thủy Xuân, TP. Huế, Thừa Thiên Huế', description: 'Khu lăng tẩm mang phong cảnh sơn thủy hữu tình như một bức tranh thơ mộng.', tags: ['lăng tẩm', 'hồ sen', 'lịch sử'], estimated_cost: 150000, latitude: 16.4328, longitude: 107.5656, rating: 4.8 },
    { name: 'Làng Hương Thủy Xuân', type: 'attraction', address: '84 Huyền Trân Công Chúa, P. Thủy Xuân, TP. Huế, Thừa Thiên Huế', description: 'Không gian rực rỡ sắc màu của những bó chân hương xòe hoa, địa điểm check-in áo dài Cổ phục cực hot.', tags: ['làng nghề', 'check-in cổ phục', 'sống ảo'], estimated_cost: 0, latitude: 16.4389, longitude: 107.5612, rating: 4.8 },
    { name: 'Cầu Trường Tiền & Phố Đi Bộ', type: 'attraction', address: 'Cầu Trường Tiền, P. Phú Hội, TP. Huế, Thừa Thiên Huế', description: 'Cây cầu 6 vài 12 nhịp lung linh ánh đèn chiếu sáng nghệ thuật bắc qua dòng sông Hương.', tags: ['cầu cổ', 'phố đêm', 'check-in'], estimated_cost: 0, latitude: 16.4678, longitude: 107.5931, rating: 4.7 },

    { name: 'Bún bò Huế O Cương Điệp', type: 'restaurant', address: '06 Trần Thúc Nhẫn, P. Vĩnh Ninh, TP. Huế, Thừa Thiên Huế', description: 'Bún bò chuẩn vị Huế thơm nồng mùi sả, ruốc, thịt nạm mềm và móng giò giòn sần sật.', tags: ['bún bò huế', 'ăn sáng', 'đặc sản'], estimated_cost: 45000, latitude: 16.4628, longitude: 107.5891, rating: 4.8 },
    { name: 'Quán Bánh Bèo - Nậm - Lọc Bà Đỏ', type: 'restaurant', address: '08 Nguyễn Bỉnh Khiêm, P. Phú Cát, TP. Huế, Thừa Thiên Huế', description: 'Thưởng thức mâm bánh ngũ vị truyền thống: bánh bèo tôm tươi, bánh nậm lá dong, bánh lọc dai giòn.', tags: ['bánh huế', 'ăn vặt', 'đặc sản'], estimated_cost: 80000, latitude: 16.4711, longitude: 107.6012, rating: 4.7 },
    { name: 'Cơm Hến Hoa Đông', type: 'restaurant', address: '64 kiệt 7 Ưng Bình, Cồn Hến, P. Vỹ Dạ, TP. Huế, Thừa Thiên Huế', description: 'Đặc sản cơm hến và bún hến Cồn Hến cay the nồng đượm vị mắm ruốc ăn kèm tóp mỡ giòn tan.', tags: ['cơm hến', 'cồn hến', 'ăn trưa'], estimated_cost: 30000, latitude: 16.4812, longitude: 107.6088, rating: 4.7 },
    { name: 'Nem Lụi Chị Hến', type: 'restaurant', address: '85 Đào Duy Từ, P. Phú Bình, TP. Huế, Thừa Thiên Huế', description: 'Nem lụi nướng than hoa thơm nức cuốn bánh tráng rau thơm chấm nước lèo béo ngậy.', tags: ['nem lụi', 'ăn tối', 'đặc sản'], estimated_cost: 90000, latitude: 16.4735, longitude: 107.5872, rating: 4.6 },

    { name: 'Cà Phê Muối Huế - Đặng Thái Thân', type: 'cafe', address: '10 Đặng Thái Thân, P. Thuận Hòa, TP. Huế, Thừa Thiên Huế', description: 'Quán gốc sáng tạo ra món cà phê muối béo mặn gây thương nhớ của đất Cố đô.', tags: ['cà phê muối', 'đặc sản', 'check-in'], estimated_cost: 30000, latitude: 16.4725, longitude: 107.5750, rating: 4.9 },
    
    { name: 'Khách sạn Eldora Hotel Hue', type: 'hotel', address: '60 Bến Nghé, P. Phú Hội, TP. Huế, Thừa Thiên Huế', description: 'Khách sạn phong cách tân cổ điển sang trọng ngay trung tâm thành phố Huế, có hồ bơi trong nhà.', tags: ['khách sạn 4 sao', 'tân cổ điển', 'trung tâm'], estimated_cost: 850000, latitude: 16.4632, longitude: 107.5934, rating: 4.8 },
    { name: 'Silk Path Grand Hue Hotel & Spa', type: 'hotel', address: '02 Lê Lợi, P. Vĩnh Ninh, TP. Huế, Thừa Thiên Huế', description: 'Khách sạn 5 sao mang phong cách kiến trúc cung đình quý tộc bên bờ sông An Cựu.', tags: ['khách sạn 5 sao', 'sang trọng', 'view đẹp'], estimated_cost: 1600000, latitude: 16.4582, longitude: 107.5845, rating: 4.9 }
  ]
}

async function enrichData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected for Data Enrichment')

    // 1. Xóa bỏ các bản ghi generic giả lập
    const deleteResult = await Place.deleteMany({
      $or: [
        { name: /Thắng cảnh trung tâm/i },
        { name: /Ẩm thực đặc sản/i },
        { name: /Cafe không gian mở/i },
        { name: /Khách sạn tiện nghi/i }
      ]
    })
    console.log(`Đã xóa ${deleteResult.deletedCount} địa điểm generic không đạt chuẩn.`)

    // 2. Nạp dữ liệu phong phú chuẩn 100%
    let totalAdded = 0
    for (const [dest, list] of Object.entries(COMPREHENSIVE_PLACES)) {
      for (const item of list) {
        await Place.findOneAndUpdate(
          { name: item.name, destination: dest },
          { ...item, destination: dest },
          { upsert: true, new: true }
        )
        totalAdded++
      }
    }

    const count = await Place.countDocuments()
    console.log(`Đã hoàn tất nạp dữ liệu! Tổng số địa điểm chất lượng cao trong MongoDB: ${count}`)
    process.exit(0)
  } catch (err) {
    console.error('Lỗi khi nạp dữ liệu:', err)
    process.exit(1)
  }
}

enrichData()
