// hotelService.js - Dữ liệu khách sạn cao cấp & hệ thống đặt phòng chi tiết theo địa phương Miền Trung

export const HOTEL_DATABASE = [
  // --- ĐÀ NẴNG ---
  {
    id: 'hotel-asia-danang',
    name: 'Asia Hotel Da Nang',
    destination: 'Đà Nẵng',
    stars: 4,
    rating: 4.7,
    reviews_count: 512,
    price_from: 757292,
    address: '28 Đường 2 Tháng 9, P. Bình Hiên, Q. Hải Châu, TP. Đà Nẵng',
    latitude: 16.0592,
    longitude: 108.2215,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Trải nghiệm dịch vụ hàng đầu và tiện nghi vượt trội tại Asia Hotel Da Nang để có một kỳ lưu trú đáng nhớ. Duy trì liên lạc với Wi-Fi tốc độ cao miễn phí trong suốt kỳ nghỉ. Khách sạn tọa lạc vị trí đắc địa ngay trung tâm, chỉ cách Cầu Rồng và Chợ Đêm Helio 5 phút đi bộ. Quầy lễ tân 24/7 nhiệt tình hỗ trợ đón tiễn sân bay, cho thuê xe máy và đặt vé tour du lịch Bà Nà Hills.',
    amenities: [
      'Wi-Fi tốc độ cao miễn phí',
      'Lễ tân phục vụ 24/7',
      'Bãi đỗ xe ô tô miễn phí',
      'Hồ bơi ngoài trời trên tầng thượng',
      'Buffet bữa sáng Á - Âu',
      'Điều hòa 2 chiều & Tủ lạnh minibar',
      'Thang máy hiện đại',
      'Hỗ trợ ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Hàn'
    ],
    rooms: [
      {
        id: 'asia-std-double',
        name: 'Phòng Tiêu Chuẩn Giường Đôi',
        size: '20 m²',
        bed: '1 Giường đôi lớn (Queen Bed)',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Siêu tiết kiệm',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước ngày nhận phòng 24h',
        breakfast_included: false,
        price: 757292,
        tax_included_price: 883002,
        available_rooms: 4
      },
      {
        id: 'asia-sup-breakfast',
        name: 'Phòng Tiêu Chuẩn Giường Đôi (Gồm bữa sáng)',
        size: '22 m²',
        bed: '1 Giường đôi lớn hoặc 2 giường đơn',
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Bán chạy nhất',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước ngày nhận phòng 24h',
        breakfast_included: true,
        price: 956782,
        tax_included_price: 1115608,
        available_rooms: 3
      },
      {
        id: 'asia-exec-king',
        name: 'Phòng Thương Gia Cao Cấp Giường Đôi (Executive King)',
        size: '28 m²',
        bed: '1 Giường King-size cực lớn + Ban công ngắm phố',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: false,
        deal_tag: 'Đẳng cấp sang trọng',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước ngày nhận phòng 48h',
        breakfast_included: true,
        price: 1146206,
        tax_included_price: 1329598,
        available_rooms: 5
      },
      {
        id: 'asia-family-suite',
        name: 'Phòng Gia Đình Family Suite Hướng Sông Hàn',
        size: '36 m²',
        bed: '2 Giường đôi Queen-size',
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=700&auto=format&fit=crop&q=80',
        max_guests: 4,
        is_deal: false,
        deal_tag: 'Thích hợp gia đình',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 48h',
        breakfast_included: true,
        price: 1580000,
        tax_included_price: 1817000,
        available_rooms: 2
      }
    ]
  },
  {
    id: 'hotel-nostalgia-danang',
    name: 'Nostalgia S Hotel Da Nang Riverside',
    destination: 'Đà Nẵng',
    stars: 4,
    rating: 4.8,
    reviews_count: 420,
    price_from: 795723,
    address: '107 Bạch Đằng, P. Hải Châu 1, Q. Hải Châu, TP. Đà Nẵng',
    latitude: 16.0685,
    longitude: 108.2239,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Nostalgia S Hotel mang phong cách kiến trúc Đông Dương hoài cổ kết hợp tiện nghi hiện đại chuẩn quốc tế. Tầm nhìn tuyệt đẹp hướng trực diện dòng sông Hàn thơ mộng. Khách sạn sở hữu nhà hàng ẩm thực truyền thống, quán cà phê sân thượng ngắm cầu quay sông Hàn và quầy bar cocktail lãng mạn.',
    amenities: [
      'Wi-Fi tốc độ cao miễn phí',
      'Hồ bơi vô cực ngắm sông Hàn',
      'Phòng tập Gym cao cấp',
      'Quầy Bar & Cafe tầng thượng',
      'Lễ tân 24/7 và dịch vụ giặt là',
      'Bãi đỗ xe an toàn có bảo vệ'
    ],
    rooms: [
      {
        id: 'nostalgia-deluxe-double',
        name: 'Phòng Deluxe Giường Đôi Ban Công Sông Hàn',
        size: '25 m²',
        bed: '1 Giường King cực êm',
        image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Ưu đãi hôm nay',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước ngày nhận phòng 24h',
        breakfast_included: true,
        price: 795723,
        tax_included_price: 923038,
        available_rooms: 5
      },
      {
        id: 'nostalgia-premier-riverview',
        name: 'Phòng Premier Hướng Trực Diện Sông Hàn',
        size: '32 m²',
        bed: '1 Giường King-size + Bồn tắm nằm view kính',
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: false,
        deal_tag: 'Gợi ý tuần trăng mật',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 48h',
        breakfast_included: true,
        price: 1250000,
        tax_included_price: 1437500,
        available_rooms: 2
      }
    ]
  },
  {
    id: 'hotel-yiting-danang',
    name: 'Yitingzhenshe Boutique Hotel Da Nang',
    destination: 'Đà Nẵng',
    stars: 4,
    rating: 4.6,
    reviews_count: 289,
    price_from: 1146206,
    address: '18 Võ Văn Kiệt, P. An Hải Đông, Q. Sơn Trà, TP. Đà Nẵng',
    latitude: 16.0634,
    longitude: 108.2389,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Khách sạn boutique sang trọng nằm trên đại lộ Võ Văn Kiệt nối thẳng từ Cầu Rồng ra bãi tắm Mỹ Khê xinh đẹp. Thiết kế nội thất thanh lịch bằng gỗ tự nhiên và đá marble cao cấp, đem lại cảm giác bình yên thư thái tuyệt đối.',
    amenities: [
      'Wi-Fi miễn phí',
      'Bao gồm bữa sáng tự chọn',
      'Cho thuê xe máy & ô tô tự lái',
      'Hỗ trợ tour Bà Nà, Cù Lao Chàm, Hội An',
      'Dịch vụ dọn phòng hàng ngày'
    ],
    rooms: [
      {
        id: 'yiting-boutique-king',
        name: 'Phòng Boutique King Sang Trọng',
        size: '26 m²',
        bed: '1 Giường đôi King-size',
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Hot Deal',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước 24h',
        breakfast_included: true,
        price: 1146206,
        tax_included_price: 1318137,
        available_rooms: 4
      }
    ]
  },
  {
    id: 'hotel-basesanlitun-danang',
    name: 'Base-Mykhe Serviced Apartment & Suites',
    destination: 'Đà Nẵng',
    stars: 4,
    rating: 4.8,
    reviews_count: 367,
    price_from: 1505671,
    address: '86 Hà Bổng, P. Phước Mỹ, Q. Sơn Trà, TP. Đà Nẵng',
    latitude: 16.0645,
    longitude: 108.2435,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Căn hộ dịch vụ cao cấp chỉ cách bãi biển Mỹ Khê 2 phút đi bộ. Cung cấp đầy đủ tiện nghi bếp nấu ăn, máy giặt riêng, phòng khách ban công ngắm biển. Thích hợp cho kỳ nghỉ dài ngày hoặc gia đình đi du lịch tự do.',
    amenities: [
      'Bếp nấu ăn đầy đủ dụng cụ',
      'Máy giặt & sấy riêng từng phòng',
      'Hồ bơi tràn viền view biển',
      'Wi-Fi cáp quang 100Mbps',
      'Khu vực BBQ bãi biển'
    ],
    rooms: [
      {
        id: 'base-studio-seaview',
        name: 'Căn Hộ Studio Hướng Biển Ban Công Riêng',
        size: '35 m²',
        bed: '1 Giường King lớn + Sofa Bed',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=700&auto=format&fit=crop&q=80',
        max_guests: 3,
        is_deal: false,
        deal_tag: 'Sát biển Mỹ Khê',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước 48h',
        breakfast_included: false,
        price: 1505671,
        tax_included_price: 1731521,
        available_rooms: 3
      }
    ]
  },
  {
    id: 'hotel-vinpearl-danang',
    name: 'Vinpearl Luxury Resort & Villas Da Nang',
    destination: 'Đà Nẵng',
    stars: 5,
    rating: 4.9,
    reviews_count: 890,
    price_from: 2428399,
    address: 'Đường Trường Sa, P. Hòa Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng',
    latitude: 16.0125,
    longitude: 108.2612,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Khu nghỉ dưỡng 5 sao sang trọng bậc nhất tựa lưng vào dãy Ngũ Hành Sơn hùng vĩ, hướng trọn bờ biển Non Nước nguyên sơ. 5 hồ bơi ngoài trời quy mô lớn, dịch vụ Akoya Spa chuẩn phong cách Bali và hệ thống nhà hàng ẩm thực 5 sao.',
    amenities: [
      'Bãi biển riêng biệt lập',
      '5 Hồ bơi ngoài trời quy mô lớn',
      'Akoya Spa chăm sóc sức khỏe',
      'Sân tennis & Phòng Gym hướng biển',
      'Đưa đón sân bay miễn phí',
      'Kid Club cho trẻ em'
    ],
    rooms: [
      {
        id: 'vinpearl-ocean-villa',
        name: 'Biệt Thự Hướng Biển 1 Phòng Ngủ (Ocean Villa)',
        size: '50 m²',
        bed: '1 Giường Super King cao cấp',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: false,
        deal_tag: 'Nghỉ dưỡng thượng lưu',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 7 ngày',
        breakfast_included: true,
        price: 2428399,
        tax_included_price: 2792658,
        available_rooms: 2
      }
    ]
  },

  // --- HUẾ ---
  {
    id: 'hotel-nostalgia-hue',
    name: 'Nostalgia S Hotel Imperial Hue',
    destination: 'Huế',
    stars: 4,
    rating: 4.8,
    reviews_count: 380,
    price_from: 680000,
    address: '8 Hùng Vương, P. Phú Nhuận, TP. Huế',
    latitude: 16.4674,
    longitude: 107.5905,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Khách sạn phong cách Cung đình Huế trang nhã tại trung tâm Cố đô. Chỉ cách cầu Tràng Tiền và bờ sông Hương 300m. Không gian tĩnh lặng, bữa sáng phục vụ bún bò Huế truyền thống và trà sen cung đình thơm ngát.',
    amenities: [
      'Wi-Fi miễn phí',
      'Bữa sáng ẩm thực Huế',
      'Bể sục Jacuzzi & Xông hơi',
      'Thuê xe đạp dạo quanh Đại Nội',
      'Lễ tân 24/7'
    ],
    rooms: [
      {
        id: 'hue-nostalgia-superior',
        name: 'Phòng Superior Cố Đô Giường Đôi',
        size: '24 m²',
        bed: '1 Giường Queen đôi',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Tiết kiệm nhất',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước 24h',
        breakfast_included: true,
        price: 680000,
        tax_included_price: 782000,
        available_rooms: 5
      },
      {
        id: 'hue-nostalgia-imperial-suite',
        name: 'Phòng Hoàng Gia Imperial Suite View Sông Hương',
        size: '38 m²',
        bed: '1 Giường King Cung Đình',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: false,
        deal_tag: 'View cầu Tràng Tiền',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 48h',
        breakfast_included: true,
        price: 1150000,
        tax_included_price: 1322500,
        available_rooms: 3
      }
    ]
  },
  {
    id: 'hotel-indochine-palace-hue',
    name: 'Indochine Palace Hotel Hue',
    destination: 'Huế',
    stars: 5,
    rating: 4.9,
    reviews_count: 650,
    price_from: 1450000,
    address: '105A Hùng Vương, TP. Huế',
    latitude: 16.4632,
    longitude: 107.5942,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Khách sạn 5 sao mang vẻ đẹp quý phái của kiến trúc Đông Dương thuộc địa. Vườn cây nhiệt đới xanh mát, hồ bơi ngoài trời tiêu chuẩn quốc tế và quầy rượu thượng hạng.',
    amenities: [
      'Hồ bơi ngoài trời rộng lớn',
      'Spa thư giãn & Massage thảo mộc',
      'Nhà hàng fine-dining ẩm thực cung đình',
      'Phòng hội nghị sang trọng',
      'Đưa đón ga Huế & sân bay Phú Bài'
    ],
    rooms: [
      {
        id: 'indochine-palace-deluxe',
        name: 'Phòng Palace Deluxe Kiến Trúc Cổ Điển',
        size: '34 m²',
        bed: '1 Giường King hoặc 2 Giường đơn',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: false,
        deal_tag: 'Đẳng cấp 5 sao',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 48h',
        breakfast_included: true,
        price: 1450000,
        tax_included_price: 1667500,
        available_rooms: 4
      }
    ]
  },

  // --- HỘI AN / QUẢNG NAM ---
  {
    id: 'hotel-lasiesta-hoian',
    name: 'La Siesta Hoi An Resort & Spa',
    destination: 'Hội An',
    stars: 5,
    rating: 4.9,
    reviews_count: 780,
    price_from: 1350000,
    address: '132 Hùng Vương, P. Thanh Hà, TP. Hội An, Quảng Nam',
    latitude: 15.8821,
    longitude: 108.3182,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Resort nghỉ dưỡng xanh mát giữa lòng Phố Cổ Hội An với 4 hồ bơi ngoài trời (bao gồm hồ bơi nước mặn và hồ bơi vô cực ngắm cánh đồng lúa thanh bình).',
    amenities: [
      '4 Hồ bơi ngoài trời thơ mộng',
      'Xe đạp miễn phí vào Phố Cổ',
      'La Siesta Spa chuyên sâu',
      'Lớp học nấu ăn truyền thống',
      'Bãi biển An Bàng đưa đón miễn phí'
    ],
    rooms: [
      {
        id: 'lasiesta-deluxe-riceview',
        name: 'Phòng Deluxe Ban Công Ngắm Đồng Lúa',
        size: '32 m²',
        bed: '1 Giường King cực êm',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Được yêu thích nhất',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 48h',
        breakfast_included: true,
        price: 1350000,
        tax_included_price: 1552500,
        available_rooms: 4
      }
    ]
  },

  // --- NHA TRANG / KHÁNH HÒA ---
  {
    id: 'hotel-vinpearl-nhatrang',
    name: 'Vinpearl Resort & Spa Nha Trang Bay',
    destination: 'Nha Trang',
    stars: 5,
    rating: 4.9,
    reviews_count: 920,
    price_from: 1890000,
    address: 'Đảo Hòn Tre, TP. Nha Trang, Khánh Hòa',
    latitude: 12.2185,
    longitude: 109.2432,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Khu nghỉ dưỡng hình cánh cung độc đáo ôm trọn bờ vịnh Nha Trang xanh ngắt trên đảo Hòn Tre. Trải nghiệm cáp treo vượt biển, công viên giải trí VinWonders và dịch vụ nghỉ dưỡng cao cấp.',
    amenities: [
      'Cáp treo vượt biển Hòn Tre',
      'Hồ bơi vô cực ngắm vịnh Nha Trang',
      'Bãi biển riêng tư cát trắng',
      'Khu vui chơi VinWonders liền kề',
      'Buffet 3 bữa quốc tế thượng hạng'
    ],
    rooms: [
      {
        id: 'vinpearl-deluxe-ocean',
        name: 'Phòng Deluxe Hướng Toàn Cảnh Vịnh Biển',
        size: '36 m²',
        bed: '1 Giường King-size lớn',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: false,
        deal_tag: 'View biển triệu đô',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 5 ngày',
        breakfast_included: true,
        price: 1890000,
        tax_included_price: 2173500,
        available_rooms: 3
      }
    ]
  },
  {
    id: 'hotel-havana-nhatrang',
    name: 'Premier Havana Hotel Nha Trang',
    destination: 'Nha Trang',
    stars: 5,
    rating: 4.7,
    reviews_count: 670,
    price_from: 890000,
    address: '38 Trần Phú, P. Lộc Thọ, TP. Nha Trang',
    latitude: 12.2410,
    longitude: 109.1965,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Khách sạn 5 sao cao nhất mặt đường Trần Phú có đường hầm riêng thông thẳng ra bãi biển Nha Trang. Quầy bar Skylight tầng thượng sôi động và hồ bơi vô cực ngắm trọn vẹn biển đảo.',
    amenities: [
      'Đường hầm riêng dưới lòng đất ra biển',
      'Hồ bơi ngoài trời nhìn thẳng vịnh biển',
      'Quầy Bar Skylight tầng 43',
      'Spa & Xông hơi chuyên nghiệp'
    ],
    rooms: [
      {
        id: 'havana-deluxe-city',
        name: 'Phòng Deluxe Giường Đôi Ban Công',
        size: '28 m²',
        bed: '1 Giường đôi Queen',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Giá sốc hè này',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước 24h',
        breakfast_included: true,
        price: 890000,
        tax_included_price: 1023500,
        available_rooms: 6
      }
    ]
  },

  // --- QUẢNG BÌNH ---
  {
    id: 'hotel-goldcoast-quangbinh',
    name: 'Gold Coast Hotel Resort & Spa Dong Hoi',
    destination: 'Quảng Bình',
    stars: 5,
    rating: 4.8,
    reviews_count: 340,
    price_from: 850000,
    address: 'Đường Võ Nguyên Giáp, Xã Bảo Ninh, TP. Đồng Hới, Quảng Bình',
    latitude: 17.4712,
    longitude: 106.6341,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Resort bãi biển Bảo Ninh thơ mộng, không gian mở thoáng đãng, gần cầu Nhật Lệ và thuận tiện xuất phát đi khám phá Vườn quốc gia Phong Nha - Kẻ Bàng.',
    amenities: [
      'Bãi biển Bảo Ninh cát trắng',
      'Hồ bơi vô cực rộng 500m²',
      'Xông hơi đá muối Himalaya',
      'Hỗ trợ xe đi tour Phong Nha - Động Thiên Đường'
    ],
    rooms: [
      {
        id: 'goldcoast-superior-garden',
        name: 'Phòng Superior Hướng Vườn Sinh Thái',
        size: '30 m²',
        bed: '1 Giường đôi Queen',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Ưu đãi khám phá hang động',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 24h',
        breakfast_included: true,
        price: 850000,
        tax_included_price: 977500,
        available_rooms: 4
      }
    ]
  },

  // --- QUY NHƠN / BÌNH ĐỊNH ---
  {
    id: 'hotel-flc-quynhon',
    name: 'FLC Luxury Resort & Hotel Quy Nhon',
    destination: 'Bình Định',
    stars: 5,
    rating: 4.8,
    reviews_count: 530,
    price_from: 1250000,
    address: 'Khu 4, Nhơn Lý - Bãi Dài, TP. Quy Nhơn, Bình Định',
    latitude: 13.9123,
    longitude: 109.2810,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Khu phức hợp nghỉ dưỡng 5 sao kề bên danh thắng Eo Gió và Kỳ Co nổi tiếng. Hồ bơi ngoài trời trải dài gần 1km ôm theo bờ biển nguyên sơ.',
    amenities: [
      'Hồ bơi trải dài gần 1km',
      'Sân golf 36 hố tiêu chuẩn quốc tế',
      'Vườn thú Safari Quy Nhon',
      'Xe điện đưa đón danh thắng Eo Gió'
    ],
    rooms: [
      {
        id: 'flc-studio-suite',
        name: 'Studio Suite Hướng Biển Nhơn Lý',
        size: '35 m²',
        bed: '1 Giường King hoặc 2 Giường đơn',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: false,
        deal_tag: 'Sát danh thắng Eo Gió',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 48h',
        breakfast_included: true,
        price: 1250000,
        tax_included_price: 1437500,
        available_rooms: 5
      }
    ]
  },

  // --- ĐÀ LẠT / LÂM ĐỒNG ---
  {
    id: 'hotel-colline-dalat',
    name: 'Hotel Colline Dalat Center',
    destination: 'Lâm Đồng',
    stars: 4,
    rating: 4.8,
    reviews_count: 810,
    price_from: 1050000,
    address: '10 Phan Bội Châu, P. 2, TP. Đà Lạt, Lâm Đồng',
    latitude: 11.9421,
    longitude: 108.4382,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Khách sạn biểu tượng hiện đại bậc nhất Đà Lạt nằm ngay trên nóc chợ Đà Lạt và cách Hồ Xuân Hương chỉ 200m. Kiến trúc gạch nung ấm cúng, thiết kế cửa sổ kính lớn ngắm nhìn phố núi mộng mơ.',
    amenities: [
      'Vị trí đắc địa ngay Chợ Đêm Đà Lạt',
      'Nhà hàng ẩm thực đa phong cách',
      'Quầy Bar & Bakery kiểu Pháp',
      'Bãi đỗ xe hầm an toàn'
    ],
    rooms: [
      {
        id: 'colline-superior-double',
        name: 'Phòng Superior Giường Đôi Ngắm Phố Núi',
        size: '25 m²',
        bed: '1 Giường đôi Queen',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Vị trí vàng Đà Lạt',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước 48h',
        breakfast_included: true,
        price: 1050000,
        tax_included_price: 1207500,
        available_rooms: 4
      }
    ]
  }
]

// Hàm tìm kiếm và chuẩn hóa khách sạn cho một điểm đến (kết hợp dữ liệu database nếu có)
export function getHotelsForDestination(destination = 'Đà Nẵng', dynamicPlaces = []) {
  const normDest = (destination || '').toLowerCase().trim()

  // 1. Lọc từ catalog chuẩn hóa
  let list = HOTEL_DATABASE.filter(h => {
    const d = h.destination.toLowerCase()
    return d.includes(normDest) || normDest.includes(d) ||
      (normDest.includes('đà nẵng') && d.includes('đà nẵng')) ||
      (normDest.includes('hội an') && (d.includes('hội an') || d.includes('quảng nam'))) ||
      (normDest.includes('quảng nam') && (d.includes('hội an') || d.includes('quảng nam'))) ||
      (normDest.includes('huế') && d.includes('huế')) ||
      (normDest.includes('nha trang') && (d.includes('nha trang') || d.includes('khánh hòa'))) ||
      (normDest.includes('khánh hòa') && (d.includes('nha trang') || d.includes('khánh hòa'))) ||
      (normDest.includes('quy nhơn') && (d.includes('quy nhơn') || d.includes('bình định'))) ||
      (normDest.includes('bình định') && (d.includes('quy nhơn') || d.includes('bình định'))) ||
      (normDest.includes('đà lạt') && (d.includes('đà lạt') || d.includes('lâm đồng'))) ||
      (normDest.includes('lâm đồng') && (d.includes('đà lạt') || d.includes('lâm đồng'))) ||
      (normDest.includes('quảng bình') && d.includes('quảng bình'))
  })

  // 2. Chuyển đổi bổ sung từ các địa điểm type === 'hotel' trong database MongoDB nếu có
  const dynamicHotels = (dynamicPlaces || []).filter(p => p.type === 'hotel')
  for (const p of dynamicHotels) {
    if (!list.some(h => h.name.toLowerCase() === p.name.toLowerCase())) {
      const basePrice = Number(p.estimated_cost) || 750000
      list.push({
        id: `db-hotel-${p._id || p.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: p.name,
        destination: destination,
        stars: Math.min(5, Math.max(3, Math.round((p.rating || 4.5)))),
        rating: p.rating || 4.7,
        reviews_count: p.reviews_count || 180,
        price_from: basePrice,
        address: p.address || `Trung tâm TP. ${destination}`,
        latitude: p.latitude || null,
        longitude: p.longitude || null,
        image: p.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        gallery: [
          p.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80'
        ],
        description: p.description || `Khách sạn nghỉ dưỡng chất lượng cao tại trung tâm ${destination}, dịch vụ tiện nghi và vị trí thuận lợi tham quan du lịch.`,
        amenities: [
          'Wi-Fi tốc độ cao miễn phí',
          'Lễ tân phục vụ 24/7',
          'Bãi đỗ xe ô tô miễn phí',
          'Bữa sáng tự chọn',
          'Điều hòa 2 chiều & Tủ lạnh'
        ],
        rooms: [
          {
            id: `room-std-${p._id || 1}`,
            name: 'Phòng Tiêu Chuẩn Giường Đôi',
            size: '22 m²',
            bed: '1 Giường đôi Queen',
            image: p.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
            max_guests: 2,
            is_deal: true,
            deal_tag: 'Tiết kiệm',
            free_cancellation: true,
            cancellation_policy: 'Miễn phí hủy phòng trước 24h',
            breakfast_included: true,
            price: basePrice,
            tax_included_price: Math.round(basePrice * 1.15),
            available_rooms: 4
          },
          {
            id: `room-deluxe-${p._id || 2}`,
            name: 'Phòng Deluxe Cao Cấp View Thành Phố',
            size: '28 m²',
            bed: '1 Giường King cực lớn',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
            max_guests: 2,
            is_deal: false,
            deal_tag: 'Cao cấp',
            free_cancellation: true,
            cancellation_policy: 'Miễn phí hủy trước 48h',
            breakfast_included: true,
            price: Math.round(basePrice * 1.35),
            tax_included_price: Math.round(basePrice * 1.35 * 1.15),
            available_rooms: 2
          }
        ]
      })
    }
  }

  // 3. Nếu danh sách trống (điểm đến đặc biệt), tạo khách sạn mặc định chất lượng cao cho tỉnh/thành đó
  if (list.length === 0) {
    list.push({
      id: `fallback-hotel-${destination}`,
      name: `Khách sạn Grand Hotel ${destination}`,
      destination: destination,
      stars: 4,
      rating: 4.8,
      reviews_count: 240,
      price_from: 650000,
      address: `Đại lộ Trung Tâm, TP. ${destination}`,
      latitude: null,
      longitude: null,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80'
      ],
      description: `Khách sạn nghỉ dưỡng trung tâm ${destination} với đầy đủ tiện nghi, vị trí đắc địa gần các điểm danh lam thắng cảnh và ẩm thực đặc sản.`,
      amenities: [
        'Wi-Fi tốc độ cao miễn phí',
        'Lễ tân 24/7',
        'Bãi đỗ xe ô tô rộng rãi',
        'Bao gồm bữa sáng phong phú',
        'Hỗ trợ tour địa phương'
      ],
      rooms: [
        {
          id: 'fallback-std',
          name: 'Phòng Tiêu Chuẩn Giường Đôi',
          size: '22 m²',
          bed: '1 Giường đôi Queen',
          image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
          max_guests: 2,
          is_deal: true,
          deal_tag: 'Tiết kiệm',
          free_cancellation: true,
          cancellation_policy: 'Miễn phí hủy phòng trước 24h',
          breakfast_included: true,
          price: 650000,
          tax_included_price: 747500,
          available_rooms: 5
        },
        {
          id: 'fallback-vip',
          name: 'Phòng VIP Hướng Cảnh Quan',
          size: '30 m²',
          bed: '1 Giường King',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
          max_guests: 2,
          is_deal: false,
          deal_tag: 'View đẹp',
          free_cancellation: true,
          cancellation_policy: 'Miễn phí hủy phòng trước 48h',
          breakfast_included: true,
          price: 950000,
          tax_included_price: 1092500,
          available_rooms: 3
        }
      ]
    })
  }

  return list
}
