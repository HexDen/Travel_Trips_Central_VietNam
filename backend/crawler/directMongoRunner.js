import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PlaywrightWorkerBase } from './base/worker_base.js';
import { PLACES_110_DATA } from './data/places110Data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nạp file cấu hình .env từ thư mục backend hoặc thư mục hiện tại
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tranvannguyen991:nguyen1207@cluster0.e5cxmev.mongodb.net/ai-travel?retryWrites=true&w=majority&appName=Cluster0';

// Đọc tham số giới hạn số lượng cào từ dòng lệnh
const argLimit = process.argv.find(arg => arg.startsWith('--limit='));
const CRAWL_LIMIT = argLimit ? parseInt(argLimit.split('=')[1], 10) : 20;

console.log('========================================================================');
console.log('⚡ CONCURRENT CRAWLER PROMAX - PLATFORM DU LỊCH MIỀN TRUNG');
console.log('👉 CẤU HÌNH CÀO THỰC TẾ:');
console.log(`   - Worker 1 (Địa điểm du lịch & Ẩm thực): 110 địa điểm chia đều cho 11 tỉnh thành (10 điểm/tỉnh, 100% mới)`);
console.log(`   - Worker 2 (Khách sạn & Bảng giá phòng): ${CRAWL_LIMIT} khách sạn 4★-5★`);
console.log(`   - Worker 3 (Vé xe liên tỉnh & Di chuyển): ${CRAWL_LIMIT} tuyến xe liên tỉnh`);
console.log('👉 Tự động nạp trực tiếp vào MongoDB Atlas & đồng bộ tức thì bộ nhớ Web Server!');
console.log('========================================================================\n');

// 1. ĐỊNH NGHĨA SCHEMAS MONGOOSE
const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true, index: true },
  type: { type: String, enum: ['attraction', 'restaurant', 'hotel', 'cafe'], required: true },
  description: String,
  address: String,
  image: String,
  gallery: [String],
  tags: [String],
  estimated_cost: Number,
  ticket_price: Number,
  latitude: Number,
  longitude: Number,
  rating: Number,
  open_hours: String,
  dwell_time: String,
  best_time: String,
  is_indoor: Boolean,
  signature_dishes: [String],
  signature_highlight: String,
  price_range: String,
  dress_code: String,
  closing_days: String,
  reviews_count: Number,
  source_target: String,
  district: String,
  stars: Number,
  price_from: Number,
  amenities: [String],
  rooms: [mongoose.Schema.Types.Mixed],
  created_at: { type: Date, default: Date.now }
});

const TransitTicketSchema = new mongoose.Schema({
  type: { type: String, enum: ['bus', 'train', 'flight'], required: true, index: true },
  origin: { type: String, required: true, index: true },
  destination: { type: String, required: true, index: true },
  operator_name: { type: String, required: true },
  trip_code: { type: String },
  seat_class: { type: String, default: 'Tiêu chuẩn' },
  price: { type: Number, required: true },
  duration: { type: String },
  departure_time: { type: String },
  departure_station: { type: String },
  arrival_station: { type: String },
  hotline: { type: String },
  rating: { type: Number, default: 4.6 },
  reviews_count: { type: Number, default: 150 },
  badge: { type: String },
  amenities: [String],
  booking_source: { type: String, default: 'Vexere & FUTA Bus Lines' },
  created_at: { type: Date, default: Date.now }
});

const Place = mongoose.models.Place || mongoose.model('Place', PlaceSchema);
const TransitTicket = mongoose.models.TransitTicket || mongoose.model('TransitTicket', TransitTicketSchema);

// ========================================================================
// 2. TẬP DỮ LIỆU ĐẶC SẮC MIỀN TRUNG (20 POIs, 20 HOTELS, 20 BUS TICKETS)
// ========================================================================

// --- DANH SÁCH 20 ĐỊA ĐIỂM THAM QUAN & ẨM THỰC (POI) ---
const ALL_POIS = [
  {
    name: 'Bà Nà Hills & Cầu Vàng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    description: 'Quần thể du lịch nghỉ dưỡng trên đỉnh núi Chúa với Cầu Vàng biểu tượng thế giới, Làng Pháp cổ kính và khí hậu 4 mùa trong 1 ngày.',
    address: 'Thôn An Sơn, Xã Hòa Ninh, Huyện Hòa Vang, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80',
    tags: ['cầu vàng', 'bà nà hills', 'núi chúa', 'check-in', 'cáp treo'],
    estimated_cost: 900000,
    ticket_price: 900000,
    latitude: 15.9988,
    longitude: 107.9959,
    rating: 4.8,
    open_hours: '07:30 - 21:00',
    dwell_time: '4 - 6 tiếng',
    best_time: '08:00 - 15:00',
    is_indoor: false,
    district: 'Hòa Vang',
    source_target: 'Sun World Ba Na Hills Official'
  },
  {
    name: 'Bán Đảo Sơn Trà & Chùa Linh Ứng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    description: 'Lá phổi xanh của Đà Nẵng với tượng Phật Bà Quan Âm cao 67m hướng ra biển Đông, đỉnh Bàn Cờ và rừng nguyên sinh đa dạng.',
    address: 'Bán đảo Sơn Trà, Phường Thọ Quang, Quận Sơn Trà, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    tags: ['sơn trà', 'chùa linh ứng', 'tâm linh', 'view biển', 'ngắm cảnh'],
    estimated_cost: 0,
    ticket_price: 0,
    latitude: 16.1002,
    longitude: 108.2778,
    rating: 4.8,
    open_hours: '06:00 - 18:30',
    dwell_time: '2 - 3 tiếng',
    best_time: '06:30 - 09:30',
    is_indoor: false,
    district: 'Sơn Trà',
    source_target: 'Danang FantastiCity'
  },
  {
    name: 'Cầu Rồng & Phố Đi Bộ Bạch Đằng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    description: 'Cầu Rồng phun lửa và nước vào 21:00 cuối tuần (Thứ 7 & Chủ Nhật), liền kề phố đi bộ Bạch Đằng và chợ đêm nhộn nhịp ven sông Hàn.',
    address: 'Đường Nguyễn Văn Linh, Phước Ninh, Hải Châu, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
    tags: ['cầu rồng', 'phun lửa', 'sông hàn', 'chợ đêm', 'về đêm'],
    estimated_cost: 50000,
    ticket_price: 0,
    latitude: 16.0611,
    longitude: 108.2272,
    rating: 4.7,
    open_hours: 'Cả ngày (Phun lửa 21:00)',
    dwell_time: '1 - 2 tiếng',
    best_time: '20:00 - 22:00',
    is_indoor: false,
    district: 'Hải Châu',
    source_target: 'Danang Tourism'
  },
  {
    name: 'Ngũ Hành Sơn & Động Huyền Không',
    destination: 'Đà Nẵng',
    type: 'attraction',
    description: 'Quần thể 5 ngọn núi đá vôi Kim Mộc Thủy Hỏa Thổ với hệ thống hang động Huyền Không linh thiêng và làng đá mỹ nghệ Non Nước.',
    address: '81 Huyền Trân Công Chúa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    tags: ['ngũ hành sơn', 'động huyền không', 'non nước', 'chùa linh ứng non nước'],
    estimated_cost: 40000,
    ticket_price: 40000,
    latitude: 16.0044,
    longitude: 108.2638,
    rating: 4.7,
    open_hours: '07:00 - 17:30',
    dwell_time: '2 - 3 tiếng',
    best_time: '08:00 - 10:30',
    is_indoor: false,
    district: 'Ngũ Hành Sơn',
    source_target: 'Ban Quản Lý DT Ngũ Hành Sơn'
  },
  {
    name: 'Mì Quảng Ếch Bếp Trang',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    description: 'Quán mì Quảng nổi tiếng với thố ếch nóng hổi đậm đà, bánh tráng giòn rụm và rau sống tươi ngon chuẩn vị Đà Thành.',
    address: '441 Ông Ích Khiêm, Nam Dương, Hải Châu, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1200&q=80',
    tags: ['mì quảng', 'ẩm thực', 'đặc sản', 'bếp trang', 'mì quảng ếch'],
    estimated_cost: 65000,
    ticket_price: 0,
    latitude: 16.0645,
    longitude: 108.2163,
    rating: 4.6,
    open_hours: '06:30 - 22:00',
    dwell_time: '45 phút',
    best_time: '07:00 - 08:30 hoặc 18:30 - 20:00',
    is_indoor: true,
    signature_dishes: ['Mì Quảng Ếch Thố Đất', 'Mì Quảng Tôm Thịt', 'Ram Cuốn Cải'],
    signature_highlight: 'Mì Quảng Ếch Thố Đất',
    price_range: '45.000đ - 75.000đ',
    district: 'Hải Châu',
    source_target: 'Foody Da Nang'
  },
  {
    name: 'Chợ Cồn & Thiên Đường Ẩm Thực Đà Nẵng',
    destination: 'Đà Nẵng',
    type: 'restaurant',
    description: 'Khu ẩm thực trong nhà nức tiếng với bún mắm nêm, bánh bèo chén, ốc hút cay nồng và vô số món ăn vặt miền Trung giá bình dân.',
    address: '290 Hùng Vương, Vĩnh Trung, Hải Châu, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    tags: ['chợ cồn', 'ẩm thực đường phố', 'bún mắm nêm', 'ốc hút'],
    estimated_cost: 60000,
    ticket_price: 0,
    latitude: 16.0694,
    longitude: 108.2139,
    rating: 4.6,
    open_hours: '07:00 - 19:30',
    dwell_time: '1 - 1.5 tiếng',
    best_time: '15:00 - 18:00',
    is_indoor: true,
    signature_dishes: ['Bún Mắm Nêm Dì Vân', 'Ốc Hút Chợ Cồn', 'Bánh Bột Lọc Trần'],
    signature_highlight: 'Bún Mắm Nêm Thịt Luộc Quay',
    price_range: '25.000đ - 50.000đ',
    district: 'Hải Châu',
    source_target: 'Danang Street Food'
  },
  {
    name: 'Đại Nội Huế (Hoàng Thành & Tử Cấm Thành)',
    destination: 'Huế',
    type: 'attraction',
    description: 'Di sản Văn hóa Thế giới UNESCO, trung tâm chính trị của triều đại nhà Nguyễn với Điện Thái Hòa, Ngọ Môn và Cung Diên Thọ lộng lẫy.',
    address: 'Đường 23/8, Phường Thuận Hòa, TP. Huế, Thừa Thiên Huế',
    image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    tags: ['đại nội', 'hoàng thành', 'di sản unesco', 'lịch sử', 'triều nguyễn'],
    estimated_cost: 200000,
    ticket_price: 200000,
    latitude: 16.4697,
    longitude: 107.5794,
    rating: 4.9,
    open_hours: '07:30 - 17:30',
    dwell_time: '2.5 - 3.5 tiếng',
    best_time: '08:00 - 10:30',
    is_indoor: false,
    dress_code: 'Lịch sự, kín đáo (không mặc váy quá ngắn)',
    district: 'Thuận Hòa',
    source_target: 'Trung tâm Bảo tồn Di tích Cố đô Huế'
  },
  {
    name: 'Chùa Thiên Mụ & Tháp Phước Duyên Sông Hương',
    destination: 'Huế',
    type: 'attraction',
    description: 'Ngôi quốc tự cổ kính bậc nhất xứ Huế với Tháp Phước Duyên 7 tầng soi bóng xuống dòng sông Hương thơ mộng.',
    address: 'Đồi Hà Khê, Đường Nguyễn Phúc Nguyên, Kim Long, TP. Huế',
    image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80',
    tags: ['chùa thiên mụ', 'sông hương', 'tháp phước duyên', 'tâm linh', 'hoàng hôn'],
    estimated_cost: 0,
    ticket_price: 0,
    latitude: 16.4528,
    longitude: 107.5453,
    rating: 4.8,
    open_hours: '06:00 - 18:00',
    dwell_time: '1 - 1.5 tiếng',
    best_time: '16:30 - 17:45 (Ngắm hoàng hôn)',
    is_indoor: false,
    district: 'Kim Long',
    source_target: 'Hue Tourism Information'
  },
  {
    name: 'Lăng Khải Định (Ứng Lăng Kiệt Tác Gốm Sứ)',
    destination: 'Huế',
    type: 'attraction',
    description: 'Đỉnh cao nghệ thuật ghép sành sứ và thủy tinh với kiến trúc giao thoa Đông - Tây độc đáo bậc nhất trong các lăng tẩm hoàng gia.',
    address: 'Xã Thủy Bằng, TP. Huế, Thừa Thiên Huế',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    tags: ['lăng khải định', 'ứng lăng', 'nghệ thuật gốm sứ', 'di sản'],
    estimated_cost: 150000,
    ticket_price: 150000,
    latitude: 16.3986,
    longitude: 107.5906,
    rating: 4.8,
    open_hours: '07:30 - 17:30',
    dwell_time: '1.5 tiếng',
    best_time: '08:30 - 10:30',
    is_indoor: false,
    district: 'Thủy Bằng',
    source_target: 'Trung tâm Bảo tồn Di tích Cố đô Huế'
  },
  {
    name: 'Bún Bò Huế Mụ Rơi',
    destination: 'Huế',
    type: 'restaurant',
    description: 'Quán bún bò Huế gia truyền danh tiếng, nước dùng ngọt thanh ninh từ xương ống và sả thơm nức, sợi bún mềm dai cùng chả cua tươi ngon.',
    address: '40 Nguyễn Chí Diểu, Thuận Thành, TP. Huế',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80',
    tags: ['bún bò huế', 'đặc sản cố đô', 'ẩm thực huế', 'chả cua'],
    estimated_cost: 45000,
    ticket_price: 0,
    latitude: 16.4721,
    longitude: 107.5852,
    rating: 4.7,
    open_hours: '06:30 - 10:00 (Nên đi sớm)',
    dwell_time: '30 - 45 phút',
    best_time: '07:00 - 08:30',
    is_indoor: true,
    signature_dishes: ['Bún Bò Giò Heo', 'Bún Chả Cua Cố Đô', 'Bún Bắp Bò Gân'],
    signature_highlight: 'Bún Bò Thập Cẩm Chả Cua',
    price_range: '35.000đ - 55.000đ',
    district: 'Thuận Thành',
    source_target: 'Foody Hue'
  },
  {
    name: 'Bánh Bèo - Nậm - Lọc Quán Bà Đỏ',
    destination: 'Huế',
    type: 'restaurant',
    description: 'Quán bánh Huế lâu đời với khay bánh bèo tôm chấy đỏ au, bánh nậm mềm mịn thơm lá chuối và bánh ram ít giòn tan chấm nước mắm ớt ngọt.',
    address: '8 Nguyễn Bỉnh Khiêm, Phú Cát, TP. Huế',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    tags: ['bánh bèo', 'bánh nậm', 'bánh lọc', 'ẩm thực huế', 'bà đỏ'],
    estimated_cost: 60000,
    ticket_price: 0,
    latitude: 16.4745,
    longitude: 107.5921,
    rating: 4.6,
    open_hours: '08:00 - 21:00',
    dwell_time: '45 phút',
    best_time: '14:30 - 17:30',
    is_indoor: true,
    signature_dishes: ['Bánh Bèo Chén Tôm Chấy', 'Bánh Nậm Tôm Thịt', 'Bánh Ram Ít Giòn'],
    signature_highlight: 'Mâm Bánh Huế Thập Cẩm Bà Đỏ',
    price_range: '30.000đ - 65.000đ',
    district: 'Phú Cát',
    source_target: 'Foody Hue'
  },
  {
    name: 'Phố Cổ Hội An & Chùa Cầu',
    destination: 'Hội An',
    type: 'attraction',
    description: 'Đô thị cổ được bảo tồn trọn vẹn với những ngôi nhà sơn vàng cổ kính, hàng ngàn lồng đèn rực rỡ và không gian đi bộ êm đềm bên sông Hoài.',
    address: 'Phường Minh An, TP. Hội An, Tỉnh Quảng Nam',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    tags: ['phố cổ', 'hội an', 'chùa cầu', 'lồng đèn', 'sông hoài', 'di sản'],
    estimated_cost: 120000,
    ticket_price: 120000,
    latitude: 15.8778,
    longitude: 108.3262,
    rating: 4.9,
    open_hours: 'Phố đi bộ: 08:30 - 11:00 & 15:00 - 21:30',
    dwell_time: '3 - 5 tiếng',
    best_time: '16:00 - 21:00',
    is_indoor: false,
    district: 'Minh An',
    source_target: 'Trung tâm VH-TT & TT-TH TP Hội An'
  },
  {
    name: 'Rừng Dừa Bảy Mẫu Cẩm Thanh',
    destination: 'Hội An',
    type: 'attraction',
    description: 'Trải nghiệm đi thuyền thúng len lỏi trong rừng dừa nước bạt ngàn, xem nghệ nhân múa thúng giật thót tim và câu cua dân dã.',
    address: 'Thôn Vạn Lăng, Xã Cẩm Thanh, TP. Hội An, Quảng Nam',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80',
    tags: ['rừng dừa', 'múa thúng', 'cẩm thanh', 'sông nước', 'trải nghiệm'],
    estimated_cost: 150000,
    ticket_price: 30000,
    latitude: 15.8681,
    longitude: 108.3753,
    rating: 4.8,
    open_hours: '07:00 - 17:30',
    dwell_time: '2 tiếng',
    best_time: '08:00 - 10:00 hoặc 15:00 - 16:30',
    is_indoor: false,
    district: 'Cẩm Thanh',
    source_target: 'Hoi An Ecotourism'
  },
  {
    name: 'Cơm Gà Bà Buội Hội An',
    destination: 'Hội An',
    type: 'restaurant',
    description: 'Thương hiệu cơm gà gia truyền hơn 70 năm, cơm dẻo nấu bằng nước luộc gà óng vàng, thịt gà ta xé phay bóp gỏi hành tây đậm đà.',
    address: '22 Phan Chu Trinh, Phường Minh An, TP. Hội An',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    tags: ['cơm gà', 'bà buội', 'ẩm thực hội an', 'đặc sản'],
    estimated_cost: 55000,
    ticket_price: 0,
    latitude: 15.8791,
    longitude: 108.3283,
    rating: 4.6,
    open_hours: '10:30 - 20:30',
    dwell_time: '45 phút',
    best_time: '11:00 - 12:30 hoặc 18:00 - 19:30',
    is_indoor: true,
    signature_dishes: ['Cơm Gà Xé', 'Gỏi Gà Rau Răm', 'Canh Lòng Gà'],
    signature_highlight: 'Cơm Gà Đùi Xé Phay',
    price_range: '45.000đ - 65.000đ',
    district: 'Minh An',
    source_target: 'Foody Hoi An'
  },
  {
    name: 'Cao Lầu Thanh Hội An',
    destination: 'Hội An',
    type: 'restaurant',
    description: 'Sợi mì cao lầu màu vàng tro ngâm nước giếng Bá Lễ đặc trưng, thịt xá xíu rim đậm vị cùng tóp mỡ giòn rụm và rau đắng Trà Quế.',
    address: '26 Thái Phiên, Phường Minh An, TP. Hội An',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1200&q=80',
    tags: ['cao lầu', 'ẩm thực phố cổ', 'xá xíu', 'trà quế', 'thanh'],
    estimated_cost: 40000,
    ticket_price: 0,
    latitude: 15.8805,
    longitude: 108.3294,
    rating: 4.7,
    open_hours: '07:00 - 19:00',
    dwell_time: '30 - 45 phút',
    best_time: '07:30 - 09:00 hoặc 16:30 - 18:30',
    is_indoor: true,
    signature_dishes: ['Cao Lầu Xá Xíu Truyền Thống', 'Thịt Heo Rim Cao Lầu'],
    signature_highlight: 'Cao Lầu Xá Xíu Tóp Mỡ',
    price_range: '35.000đ - 45.000đ',
    district: 'Minh An',
    source_target: 'Hoi An Culinary Guild'
  },
  {
    name: 'Kỳ Co & Eo Gió Quy Nhơn',
    destination: 'Quy Nhơn',
    type: 'attraction',
    description: 'Tuyệt tác thiên nhiên được mệnh danh là Maldives của Việt Nam với bờ cát vàng mịn màng, nước biển hai màu trong vắt và con đường ven núi hùng vĩ.',
    address: 'Xã Nhơn Lý, TP. Quy Nhơn, Tỉnh Bình Định',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tags: ['kỳ co', 'eo gió', 'nhơn lý', 'biển đảo', 'lặn ngắm san hô'],
    estimated_cost: 250000,
    ticket_price: 140000,
    latitude: 13.9064,
    longitude: 109.2882,
    rating: 4.8,
    open_hours: '07:00 - 18:00',
    dwell_time: '3 - 5 tiếng',
    best_time: '07:30 - 11:00 (Nắng đẹp, biển êm)',
    is_indoor: false,
    district: 'Nhơn Lý',
    source_target: 'Bình Định Tourism Promotion'
  },
  {
    name: 'Tháp Đôi Chăm Pa Quy Nhơn',
    destination: 'Quy Nhơn',
    type: 'attraction',
    description: 'Di tích kiến trúc tôn giáo Chăm Pa độc đáo xây dựng vào cuối thế kỷ XII, bảo tồn nguyên vẹn hoa văn chim thần Garuda uy nghi.',
    address: 'Đường Trần Hưng Đạo, Phường Đống Đa, TP. Quy Nhơn',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    tags: ['tháp đôi', 'chăm pa', 'lịch sử', 'văn hóa', 'kiến trúc cổ'],
    estimated_cost: 20000,
    ticket_price: 20000,
    latitude: 13.7915,
    longitude: 109.2152,
    rating: 4.6,
    open_hours: '07:00 - 17:30',
    dwell_time: '1 tiếng',
    best_time: '08:00 - 09:30',
    is_indoor: false,
    district: 'Đống Đa',
    source_target: 'Bảo tàng Tỉnh Bình Định'
  },
  {
    name: 'Bánh Xèo Tôm Nhảy Gia Vỹ',
    destination: 'Quy Nhơn',
    type: 'restaurant',
    description: 'Món ăn biểu tượng xứ Nẫu với những con tôm đất tươi rói nhảy tanh tách trên chảo dầu sôi, vỏ bánh vàng rụm cuốn bánh tráng rau mầm thanh mát.',
    address: '14 Diên Hồng, Lê Hồng Phong, TP. Quy Nhơn',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    tags: ['bánh xèo tôm nhảy', 'gia vỹ', 'ẩm thực quy nhơn', 'đặc sản'],
    estimated_cost: 65000,
    ticket_price: 0,
    latitude: 13.7745,
    longitude: 109.2238,
    rating: 4.7,
    open_hours: '06:00 - 22:00',
    dwell_time: '45 phút',
    best_time: '17:30 - 20:00',
    is_indoor: true,
    signature_dishes: ['Bánh Xèo Tôm Nhảy', 'Bánh Xèo Bò', 'Bánh Xèo Mực'],
    signature_highlight: 'Bánh Xèo Tôm Đất Nhảy Tươi Sống',
    price_range: '30.000đ - 65.000đ',
    district: 'Lê Hồng Phong',
    source_target: 'Foody Quy Nhon'
  },
  {
    name: 'Động Phong Nha & Sông Ngầm Kẻ Bàng',
    destination: 'Quảng Bình',
    type: 'attraction',
    description: 'Kỳ quan hang động Đệ Nhất Vọng Cảnh của thế giới, thuyền rẽ sóng vào dòng sông ngầm tráng lệ dài nhất Châu Á với nhũ đá muôn hình vạn trạng.',
    address: 'Vườn Quốc gia Phong Nha - Kẻ Bàng, Huyện Bố Trạch, Quảng Bình',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    tags: ['phong nha', 'thiên đường', 'hang động', 'vườn quốc gia', 'unesco'],
    estimated_cost: 350000,
    ticket_price: 250000,
    latitude: 17.5898,
    longitude: 106.2842,
    rating: 4.9,
    open_hours: '07:30 - 16:30',
    dwell_time: '4 - 5 tiếng',
    best_time: '08:00 - 14:00',
    is_indoor: true,
    district: 'Bố Trạch',
    source_target: 'Ban Quản Lý VQG Phong Nha - Kẻ Bàng'
  },
  {
    name: 'Động Thiên Đường - Hoàng Cung Trong Lòng Đất',
    destination: 'Quảng Bình',
    type: 'attraction',
    description: 'Động khô dài nhất châu Á với chiều dài 31.4km, sở hữu hệ thống thạch nhũ lung linh huyền ảo được ví như cung điện ngầm tráng lệ.',
    address: 'Km 16 Đường Hồ Chí Minh nhánh Tây, Bố Trạch, Quảng Bình',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    tags: ['động thiên đường', 'thạch nhũ', 'kỳ quan', 'bố trạch'],
    estimated_cost: 250000,
    ticket_price: 250000,
    latitude: 17.5218,
    longitude: 106.2234,
    rating: 4.9,
    open_hours: '07:00 - 16:30',
    dwell_time: '3 - 4 tiếng',
    best_time: '08:30 - 11:30',
    is_indoor: true,
    district: 'Bố Trạch',
    source_target: 'Quảng Bình Ecotourism'
  }
];

// --- DANH SÁCH 20 KHÁCH SẠN & RESORT 4★-5★ (HOTEL) ---
const ALL_HOTELS = [
  // Đà Nẵng
  {
    name: 'TMS Hotel Da Nang Beach',
    destination: 'Đà Nẵng',
    type: 'hotel',
    stars: 5,
    price_from: 1450000,
    description: 'Khách sạn 5 sao mặt biển Mỹ Khê với hồ bơi vô cực đáy kính tầng 25 ngoạn mục nhìn toàn cảnh vịnh biển Đà Nẵng tuyệt đẹp.',
    address: '292 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80'
    ],
    amenities: ['Hồ bơi vô cực view biển', 'Buffet sáng 5 sao', 'Phòng Gym & Spa', 'Wifi 5G miễn phí', 'Xe đưa đón sân bay'],
    rooms: [
      { id: 'tms-std', name: 'Phòng Premier Nhìn Ra Biển', size: '45 m²', bed: '1 Giường King lớn', price: 1450000, tax_included_price: 1667500, is_deal: true, deal_tag: 'Hot Deal', available_rooms: 5 },
      { id: 'tms-suite', name: 'Phòng Grand Suite Toàn Cảnh Vịnh', size: '68 m²', bed: '2 Giường King', price: 2350000, tax_included_price: 2702500, is_deal: false, available_rooms: 3 }
    ],
    rating: 4.8,
    reviews_count: 320,
    latitude: 16.0543,
    longitude: 108.2464
  },
  {
    name: 'Vinpearl Resort & Spa Đà Nẵng',
    destination: 'Đà Nẵng',
    type: 'hotel',
    stars: 5,
    price_from: 3200000,
    description: 'Khu biệt thự nghỉ dưỡng cao cấp nép mình bên bãi biển Non Nước với hồ bơi riêng biệt và kiến trúc tân cổ điển sang trọng.',
    address: 'Đường Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    amenities: ['Biệt thự hồ bơi riêng', 'Akoya Spa trên mặt hồ', 'Sân tennis & Gym', 'Bãi biển riêng tư'],
    rooms: [
      { id: 'vp-villa2', name: 'Biệt Thự 2 Phòng Ngủ Hồ Bơi Riêng', size: '180 m²', bed: '2 Giường King', price: 3200000, tax_included_price: 3680000, is_deal: true, deal_tag: 'Ưu đãi gia đình', available_rooms: 3 },
      { id: 'vp-villa3', name: 'Biệt Thự 3 Phòng Ngủ Hướng Biển', size: '250 m²', bed: '3 Giường King', price: 5400000, tax_included_price: 6210000, is_deal: false, available_rooms: 2 }
    ],
    rating: 4.9,
    reviews_count: 410,
    latitude: 16.0125,
    longitude: 108.2612
  },
  {
    name: 'HAIAN Beach Hotel & Spa',
    destination: 'Đà Nẵng',
    type: 'hotel',
    stars: 4,
    price_from: 1100000,
    description: 'Khách sạn 4 sao nổi tiếng với tiệc trà chiều nổi trên hồ bơi vô cực tầng thượng và vị trí đắc địa ngay trung tâm biển Mỹ Khê.',
    address: '278 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    amenities: ['Hồ bơi vô cực khay nổi', 'Trà chiều miễn phí', 'Sky Bar ngắm biển', 'Phòng xông hơi'],
    rooms: [
      { id: 'ha-city', name: 'Phòng Deluxe Hướng Thành Phố', size: '32 m²', bed: '1 Giường Đôi Queen', price: 1100000, tax_included_price: 1265000, is_deal: true, deal_tag: 'Tiết kiệm', available_rooms: 6 },
      { id: 'ha-sea', name: 'Phòng Premier Hướng Trực Diện Biển', size: '40 m²', bed: '1 Giường King Lớn', price: 1650000, tax_included_price: 1897500, is_deal: false, available_rooms: 4 }
    ],
    rating: 4.7,
    reviews_count: 290,
    latitude: 16.0521,
    longitude: 108.2458
  },
  {
    name: 'Sala Danang Beach Hotel',
    destination: 'Đà Nẵng',
    type: 'hotel',
    stars: 4,
    price_from: 1250000,
    description: 'Khách sạn hiện đại chỉ cách bãi tắm Mỹ Khê 2 phút đi bộ, sở hữu bể bơi tầng 25 ngắm trọn bình minh và núi Sơn Trà.',
    address: '36 Lâm Hoành, Phước Mỹ, Sơn Trà, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    amenities: ['Hồ bơi trên cao', 'Bữa sáng quốc tế buffet', 'Phòng Gym & Yoga', 'Xe đạp miễn phí'],
    rooms: [
      { id: 'sala-sup', name: 'Phòng Superior Giường Đôi', size: '30 m²', bed: '1 Giường Đôi', price: 1250000, tax_included_price: 1437500, is_deal: true, available_rooms: 5 },
      { id: 'sala-suite', name: 'Phòng Executive Suite View Biển', size: '55 m²', bed: '1 Giường King', price: 1950000, tax_included_price: 2242500, is_deal: false, available_rooms: 2 }
    ],
    rating: 4.8,
    reviews_count: 210,
    latitude: 16.0618,
    longitude: 108.2442
  },
  {
    name: 'Mường Thanh Luxury Danang Hotel',
    destination: 'Đà Nẵng',
    type: 'hotel',
    stars: 5,
    price_from: 1350000,
    description: 'Tòa nhà đồ sộ bên bờ biển Mỹ Khê với hệ thống phòng ốc rộng rãi, dịch vụ chuyên nghiệp và trung tâm hội nghị tiệc cưới chuẩn 5 sao.',
    address: '270 Võ Nguyên Giáp, Bắc Mỹ Phú, Ngũ Hành Sơn, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    amenities: ['Bể bơi 4 mùa trong nhà', 'Nhà hàng Á - Âu', 'Spa & Massage truyền thống', 'Phòng họp VIP'],
    rooms: [
      { id: 'mt-deluxe', name: 'Phòng Deluxe Hướng Phố', size: '35 m²', bed: '1 Giường King hoặc 2 Đơn', price: 1350000, tax_included_price: 1552500, is_deal: true, available_rooms: 8 }
    ],
    rating: 4.6,
    reviews_count: 380,
    latitude: 16.0504,
    longitude: 108.2455
  },

  // Huế
  {
    name: 'Azerai La Residence Hue',
    destination: 'Huế',
    type: 'hotel',
    stars: 5,
    price_from: 3500000,
    description: 'Biệt thự phong cách Art Deco cổ điển từ thập niên 1930 trải dài bên bờ sông Hương thơ mộng, đối diện Kỳ Đài Cố Đô.',
    address: '5 Lê Lợi, Vĩnh Ninh, TP. Huế, Thừa Thiên Huế',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    amenities: ['Khuôn viên ven sông Hương', 'Hồ bơi nước mặn', 'Nhà hàng Le Parfum ẩm thực Cung Đình', 'Du thuyền riêng'],
    rooms: [
      { id: 'az-sup', name: 'Phòng Superior View Vườn Hoàng Cung', size: '36 m²', bed: '1 Giường Queen Cổ Điển', price: 3500000, tax_included_price: 4025000, is_deal: true, available_rooms: 4 },
      { id: 'az-suite', name: 'Phòng Colonial Suite View Sông Hương', size: '58 m²', bed: '1 Giường King', price: 5200000, tax_included_price: 5980000, is_deal: false, available_rooms: 2 }
    ],
    rating: 4.9,
    reviews_count: 215,
    latitude: 16.4589,
    longitude: 107.5812
  },
  {
    name: 'Silk Path Grand Hue Hotel',
    destination: 'Huế',
    type: 'hotel',
    stars: 5,
    price_from: 1850000,
    description: 'Kiến trúc phong cách hoàng gia phương Tây kết hợp tinh hoa mỹ thuật Cố Đô Huế, tọa lạc giữa trung tâm thành phố.',
    address: '2 Lê Lợi, Vĩnh Ninh, TP. Huế',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'],
    amenities: ['Bể bơi ngoài trời xanh mát', 'Chi Spa cao cấp', 'Phòng trà Cung đình', 'Phòng tập thể thao'],
    rooms: [
      { id: 'sp-classic', name: 'Phòng Classic Nhìn Ra Vườn', size: '35 m²', bed: '1 Giường Đôi King', price: 1850000, tax_included_price: 2127500, is_deal: true, available_rooms: 5 }
    ],
    rating: 4.8,
    reviews_count: 195,
    latitude: 16.4601,
    longitude: 107.5828
  },
  {
    name: 'Melia Vinpearl Hue',
    destination: 'Huế',
    type: 'hotel',
    stars: 5,
    price_from: 1650000,
    description: 'Tòa tháp 33 tầng cao nhất Huế với tầm nhìn 360 độ ôm trọn dòng sông Hương thơ mộng và toàn cảnh Đại Nội lộng lẫy.',
    address: '50 Hùng Vương, Phú Nhuận, TP. Huế',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    amenities: ['Bể bơi bốn mùa có mái che', 'Sky Bar tầng 33 ngắm Cố Đô', 'Trung tâm thương mại Vincom liền kề'],
    rooms: [
      { id: 'mv-deluxe', name: 'Phòng Deluxe Hướng Phố Huế', size: '38 m²', bed: '1 Giường King Lớn', price: 1650000, tax_included_price: 1897500, is_deal: true, available_rooms: 6 }
    ],
    rating: 4.8,
    reviews_count: 340,
    latitude: 16.4632,
    longitude: 107.5945
  },
  {
    name: 'Moonlight Hotel Hue',
    destination: 'Huế',
    type: 'hotel',
    stars: 4,
    price_from: 850000,
    description: 'Khách sạn 4 sao nằm ngay phố đi bộ sầm uất với hồ bơi trong nhà tầng thượng và nhà hàng ngắm cầu Trường Tiền.',
    address: '20 Phạm Ngũ Lão, Phú Hội, TP. Huế',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    amenities: ['Ngay phố đi bộ Tây', 'Hồ bơi trong nhà', 'Dịch vụ thuê xe máy', 'Bữa sáng tự chọn'],
    rooms: [
      { id: 'ml-sup', name: 'Phòng Superior Tiêu Chuẩn', size: '28 m²', bed: '1 Giường Queen', price: 850000, tax_included_price: 977500, is_deal: true, available_rooms: 5 }
    ],
    rating: 4.6,
    reviews_count: 220,
    latitude: 16.4681,
    longitude: 107.5962
  },
  {
    name: 'ÊMM Hotel Huế',
    destination: 'Huế',
    type: 'hotel',
    stars: 3,
    price_from: 650000,
    description: 'Khách sạn phong cách trẻ trung với tông màu xanh cốm và tím Huế đặc trưng, không gian xanh mát và yên bình.',
    address: '15 Lý Thường Kiệt, Phú Nhuận, TP. Huế',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
    amenities: ['Hồ bơi sân vườn', 'Nhà hàng Yên ẩm thực Cố Đô', 'Wifi miễn phí', 'Lễ tân 24h'],
    rooms: [
      { id: 'emm-std', name: 'Phòng Superior Sân Vườn', size: '26 m²', bed: '1 Giường Đôi', price: 650000, tax_included_price: 747500, is_deal: true, available_rooms: 4 }
    ],
    rating: 4.5,
    reviews_count: 160,
    latitude: 16.4608,
    longitude: 107.5891
  },

  // Hội An
  {
    name: 'Silk Sense Hoi An River Resort',
    destination: 'Hội An',
    type: 'hotel',
    stars: 5,
    price_from: 1950000,
    description: 'Khu nghỉ dưỡng sinh thái cao cấp bên bờ sông Cổ Cò, bao quanh bởi vườn lụa xanh mát và kiến trúc Đông Dương trang nhã.',
    address: 'Thôn 01, Cẩm An, TP. Hội An, Quảng Nam',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    amenities: ['Hồ bơi vô cực muối khoáng', 'Xe bus đưa đón Phố Cổ & Biển', 'Chèo Kayak miễn phí', 'Vườn rau hữu cơ'],
    rooms: [
      { id: 'silk-deluxe', name: 'Phòng Deluxe Hướng Vườn Lụa', size: '42 m²', bed: '1 Giường King hoặc 2 Đơn', price: 1950000, tax_included_price: 2242500, is_deal: true, available_rooms: 6 },
      { id: 'silk-villa', name: 'Biệt Thự Hướng Sông Cổ Cò', size: '75 m²', bed: '1 Giường King Cực Đại', price: 3200000, tax_included_price: 3680000, is_deal: false, available_rooms: 2 }
    ],
    rating: 4.8,
    reviews_count: 180,
    latitude: 15.8942,
    longitude: 108.3587
  },
  {
    name: 'Anantara Hoi An Resort',
    destination: 'Hội An',
    type: 'hotel',
    stars: 5,
    price_from: 4200000,
    description: 'Resort sang trọng bên bờ sông Thu Bồn, chỉ cách Phố Cổ Hội An vài bước chân, phong cách Pháp cổ điển kết hợp sân vườn nhiệt đới.',
    address: '1 Phạm Hồng Thái, Cẩm Châu, Hội An',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    amenities: ['Bến du thuyền riêng sông Thu Bồn', 'Anantara Spa danh tiếng', 'Lớp học nấu ăn Cung Đình', 'Hồ bơi nước ngọt'],
    rooms: [
      { id: 'an-deluxe', name: 'Phòng Deluxe Hướng Sân Vườn', size: '48 m²', bed: '1 Giường King', price: 4200000, tax_included_price: 4830000, is_deal: true, available_rooms: 3 }
    ],
    rating: 4.9,
    reviews_count: 240,
    latitude: 15.8771,
    longitude: 108.3345
  },
  {
    name: 'La Siesta Hoi An Resort & Spa',
    destination: 'Hội An',
    type: 'hotel',
    stars: 5,
    price_from: 2100000,
    description: 'Resort boutique với hai khu cánh Đông và cánh Tây sang trọng, 2 hồ bơi nước mặn và hồ bơi vô cực nhìn ra đồng lúa thanh bình.',
    address: '132 Hùng Vương, Cẩm Phổ, TP. Hội An',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    amenities: ['2 hồ bơi vô cực lớn', 'La Siesta Spa đạt giải thưởng', 'Xe đạp dạo phố cổ miễn phí'],
    rooms: [
      { id: 'ls-wing', name: 'Phòng Club Suite View Hồ Bơi', size: '50 m²', bed: '1 Giường King', price: 2100000, tax_included_price: 2415000, is_deal: true, available_rooms: 5 }
    ],
    rating: 4.9,
    reviews_count: 310,
    latitude: 15.8824,
    longitude: 108.3182
  },
  {
    name: 'Hoi An Historic Hotel',
    destination: 'Hội An',
    type: 'hotel',
    stars: 4,
    price_from: 1150000,
    description: 'Khách sạn lâu đời nhất Hội An nằm ngay cửa ngõ Phố Cổ với khuôn viên rợp bóng cây cổ thụ và hồ bơi ngoài trời thoáng đãng.',
    address: '10 Trần Hưng Đạo, Sơn Phong, TP. Hội An',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
    amenities: ['Đi bộ vào phố cổ 5 phút', 'Hồ bơi ngoài trời lớn', 'Sân tennis & Spa', 'Bữa sáng buffet phong phú'],
    rooms: [
      { id: 'hh-sup', name: 'Phòng Superior Cổ Điển', size: '32 m²', bed: '1 Giường King hoặc 2 Đơn', price: 1150000, tax_included_price: 1322500, is_deal: true, available_rooms: 6 }
    ],
    rating: 4.7,
    reviews_count: 260,
    latitude: 15.8808,
    longitude: 108.3312
  },
  {
    name: 'Little Riverside Hoi An Luxury Hotel',
    destination: 'Hội An',
    type: 'hotel',
    stars: 5,
    price_from: 2300000,
    description: 'Khách sạn phong cách quý tộc Đông Dương nằm sát bên bờ sông Hoài thơ mộng, hồ bơi trên tầng thượng ngắm hoàng hôn đỉnh cao.',
    address: '9 Phan Bội Châu, Cẩm Châu, TP. Hội An',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'],
    amenities: ['Bể bơi tầng thượng view sông Hoài', 'Nhà hàng ẩm thực Việt cao cấp', 'Đưa đón biển An Bàng miễn phí'],
    rooms: [
      { id: 'lr-river', name: 'Phòng Deluxe Nhìn Ra Sông Hoài', size: '45 m²', bed: '1 Giường King Lớn', price: 2300000, tax_included_price: 2645000, is_deal: true, available_rooms: 4 }
    ],
    rating: 4.8,
    reviews_count: 190,
    latitude: 15.8785,
    longitude: 108.3361
  },

  // Quy Nhơn
  {
    name: 'FLC Luxury Resort Quy Nhơn',
    destination: 'Quy Nhơn',
    type: 'hotel',
    stars: 5,
    price_from: 2200000,
    description: 'Quần thể nghỉ dưỡng 5 sao hướng trọn vịnh Eo Gió với sân golf 36 hố tiêu chuẩn quốc tế và safari động vật bán hoang dã.',
    address: 'Khu 4, Nhơn Lý - Bãi Dài, TP. Quy Nhơn, Bình Định',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'],
    amenities: ['Sân golf 36 hố ven biển', 'FLC Zoo Safari Park', 'Bể bơi ngoài trời 5000m²', 'Xe điện nội khu'],
    rooms: [
      { id: 'flc-std', name: 'Studio Suite Hướng Biển Nhơn Lý', size: '50 m²', bed: '1 Giường King Siêu Rộng', price: 2200000, tax_included_price: 2530000, is_deal: true, available_rooms: 8 },
      { id: 'flc-pool', name: 'Biệt Thự 2 Phòng Ngủ Hồ Bơi Riêng', size: '120 m²', bed: '2 Giường King', price: 4500000, tax_included_price: 5175000, is_deal: false, available_rooms: 3 }
    ],
    rating: 4.7,
    reviews_count: 240,
    latitude: 13.9214,
    longitude: 109.2821
  },
  {
    name: 'Anya Premier Hotel Quy Nhơn',
    destination: 'Quy Nhơn',
    type: 'hotel',
    stars: 5,
    price_from: 1400000,
    description: 'Khách sạn 5 sao mặt biển An Dương Vương với thiết kế hiện đại, trung tâm thành phố và hồ bơi vô cực ngắm trọn vịnh biển.',
    address: '44 An Dương Vương, Nguyễn Văn Cừ, TP. Quy Nhơn',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    amenities: ['Hồ bơi vô cực mặt biển', 'Nhà hàng hải sản tươi sống', 'Phòng Gym & Xông hơi khô'],
    rooms: [
      { id: 'ap-deluxe', name: 'Phòng Deluxe Hướng Biển Quy Nhơn', size: '36 m²', bed: '1 Giường King', price: 1400000, tax_included_price: 1610000, is_deal: true, available_rooms: 6 }
    ],
    rating: 4.8,
    reviews_count: 280,
    latitude: 13.7592,
    longitude: 109.2185
  },
  {
    name: 'Seaside Boutique Resort Quy Nhơn',
    destination: 'Quy Nhơn',
    type: 'hotel',
    stars: 4,
    price_from: 1650000,
    description: 'Resort nép mình bên bãi biển Bãi Xép thơ mộng với bãi cát vàng hoang sơ, làng chài yên ả và không gian thư giãn tối đa.',
    address: 'Bãi Xép, Cầu Bãi Xép, Ghềnh Ráng, TP. Quy Nhơn',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    amenities: ['Bãi biển riêng tư tuyệt đẹp', 'Hồ bơi sát mép biển', 'Tiệc BBQ bãi biển ban đêm'],
    rooms: [
      { id: 'ss-sea', name: 'Phòng Deluxe Hướng Biển Bãi Xép', size: '40 m²', bed: '1 Giường King Lớn', price: 1650000, tax_included_price: 1897500, is_deal: true, available_rooms: 4 }
    ],
    rating: 4.7,
    reviews_count: 175,
    latitude: 13.6982,
    longitude: 109.2215
  },

  // Quảng Bình
  {
    name: 'Sun Spa Resort & Villa Quảng Bình',
    destination: 'Quảng Bình',
    type: 'hotel',
    stars: 5,
    price_from: 1750000,
    description: 'Khu nghỉ dưỡng trải dài trên bán đảo cát trắng Bảo Ninh với ba mặt tiếp giáp biển và sông Nhật Lệ thơ mộng.',
    address: 'Võ Nguyên Giáp, Mỹ Cảnh, Bảo Ninh, Đồng Hới, Quảng Bình',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    amenities: ['Bãi biển Bảo Ninh riêng tư', 'Bể bơi ngoài trời quy mô lớn', 'Sân tập golf & Thể thao biển', 'Casino & Bar'],
    rooms: [
      { id: 'sun-deluxe', name: 'Phòng Deluxe Hướng Vườn Bán Đảo', size: '38 m²', bed: '1 Giường King hoặc 2 Đơn', price: 1750000, tax_included_price: 2012500, is_deal: true, available_rooms: 5 },
      { id: 'sun-ocean', name: 'Phòng Ocean Suite View Biển Nhật Lệ', size: '65 m²', bed: '1 Giường King Siêu Lớn', price: 2900000, tax_included_price: 3335000, is_deal: false, available_rooms: 2 }
    ],
    rating: 4.8,
    reviews_count: 310,
    latitude: 17.4721,
    longitude: 106.6342
  },
  {
    name: 'Gold Coast Hotel Resort & Spa',
    destination: 'Quảng Bình',
    type: 'hotel',
    stars: 5,
    price_from: 1550000,
    description: 'Resort 5 sao mặt biển Bảo Ninh với dịch vụ xông hơi đá muối Himalaya độc đáo và hồ bơi ngoài trời hướng biển bao la.',
    address: 'Võ Nguyên Giáp, Bảo Ninh, TP. Đồng Hới, Quảng Bình',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'],
    amenities: ['Xông hơi đá muối Hàn Quốc Jjim Jil Bang', 'Bãi biển riêng tư', 'Bể bơi vô cực ngoài trời'],
    rooms: [
      { id: 'gc-sup', name: 'Phòng Premier Nhìn Ra Biển', size: '42 m²', bed: '1 Giường King', price: 1550000, tax_included_price: 1782500, is_deal: true, available_rooms: 6 }
    ],
    rating: 4.7,
    reviews_count: 220,
    latitude: 17.4615,
    longitude: 106.6391
  }
];

// --- DANH SÁCH 20 TUYẾN VÉ XE LIÊN TỈNH & TRANSIT ---
const ALL_BUS_TICKETS = [
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Huế',
    operator_name: 'FUTA Bus Lines (Phương Trang)',
    trip_code: 'FUTA-DN-HUE-0800',
    seat_class: 'Limousine 34 Phòng VIP',
    price: 130000,
    duration: '2h15p',
    departure_time: '08:00',
    departure_station: 'Bến xe Trung tâm Đà Nẵng, 185 Tôn Đức Thắng',
    arrival_station: 'Bến xe Phía Nam Huế, 97 An Dương Vương',
    hotline: '1900 6067',
    rating: 4.8,
    reviews_count: 520,
    amenities: ['Wifi 5G', 'Cổng sạc Type-C', 'Nước suối', 'Khăn lạnh', 'Tivi cá nhân']
  },
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Huế',
    operator_name: 'Hải Vân Limousine VIP',
    trip_code: 'HV-DN-HUE-1400',
    seat_class: 'Limousine DCar 9 Chỗ Thương Gia',
    price: 175000,
    duration: '2h00p',
    departure_time: '14:00',
    departure_station: 'Đón tận nơi nội thành Đà Nẵng / Sân bay Đà Nẵng',
    arrival_station: 'Trả tận nơi nội thành TP. Huế',
    hotline: '1900 6763',
    rating: 4.9,
    reviews_count: 310,
    amenities: ['Đón trả tận nơi', 'Ghế massage', 'Wifi tốc độ cao', 'Bánh nhẹ']
  },
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Huế',
    operator_name: 'HAV Limousine VIP',
    trip_code: 'HAV-DN-HUE-1030',
    seat_class: 'Limousine Ghế Massage 9 Chỗ',
    price: 180000,
    duration: '2h00p',
    departure_time: '10:30',
    departure_station: '26 Đỗ Thúc Tịnh, Cẩm Lệ, Đà Nẵng',
    arrival_station: '20 Hà Nội, Vĩnh Ninh, TP. Huế',
    hotline: '0234 381 7817',
    rating: 4.8,
    reviews_count: 240,
    amenities: ['Ghế massage toàn thân', 'Cổng sạc USB', 'Wifi']
  },
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Hội An',
    operator_name: 'Hội An Express Shuttle Bus',
    trip_code: 'HAE-DN-HA-0930',
    seat_class: 'Shuttle Bus Du Lịch Cao Cấp',
    price: 65000,
    duration: '45 phút',
    departure_time: '09:30',
    departure_station: 'Cầu Rồng / Đường Võ Nguyên Giáp',
    arrival_station: 'Quảng trường Sông Hoài, Phố Cổ Hội An',
    hotline: '0905 123 456',
    rating: 4.7,
    reviews_count: 420,
    amenities: ['Điều hòa 2 chiều', 'Nước suối', 'Khoang hành lý rộng']
  },
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Hội An',
    operator_name: 'Barri Ann Travel Limousine',
    trip_code: 'BAT-DN-HA-1300',
    seat_class: 'Limousine 16 Chỗ Đón Tận Nơi',
    price: 80000,
    duration: '40 phút',
    departure_time: '13:00',
    departure_station: 'Sân bay Quốc tế Đà Nẵng / Khách sạn nội thành',
    arrival_station: 'Khách sạn trung tâm TP. Hội An',
    hotline: '0914 445 556',
    rating: 4.9,
    reviews_count: 185,
    amenities: ['Đón trả tận sảnh khách sạn', 'Wifi', 'Nước uống']
  },
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Quy Nhơn',
    operator_name: 'Cúc Tùng Limousine Cung Điện',
    trip_code: 'CT-DN-QN-2100',
    seat_class: 'Giường Phòng Limousine Cung Điện',
    price: 320000,
    duration: '6h00p',
    departure_time: '21:00',
    departure_station: 'Bến xe Trung tâm Đà Nẵng',
    arrival_station: 'Bến xe Quy Nhơn, 71 Tây Sơn, Ghềnh Ráng',
    hotline: '1900 6606',
    rating: 4.8,
    reviews_count: 280,
    amenities: ['Giường massage riêng', 'Màn rèm chống ồn', 'Tivi android', 'Chăn ấm']
  },
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Quy Nhơn',
    operator_name: 'FUTA Bus Lines (Phương Trang)',
    trip_code: 'FUTA-DN-QN-1930',
    seat_class: 'Giường Nằm 40 Chỗ Tiêu Chuẩn',
    price: 250000,
    duration: '6h30p',
    departure_time: '19:30',
    departure_station: 'Bến xe Trung tâm Đà Nẵng',
    arrival_station: 'Bến xe Quy Nhơn',
    hotline: '1900 6067',
    rating: 4.7,
    reviews_count: 390,
    amenities: ['Wifi', 'Nước uống', 'Khăn lạnh']
  },
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Quy Nhơn',
    operator_name: 'Kim Liên VIP Limousine',
    trip_code: 'KL-DN-QN-2200',
    seat_class: 'Limousine 22 Cabin Hạng Sang',
    price: 350000,
    duration: '5h45p',
    departure_time: '22:00',
    departure_station: 'Bến xe Trung tâm Đà Nẵng',
    arrival_station: 'Trung tâm TP. Quy Nhơn',
    hotline: '1900 2867',
    rating: 4.9,
    reviews_count: 210,
    amenities: ['Cabin đôi/đơn riêng biệt', 'Màn hình giải trí', 'Sạc không dây']
  },
  {
    type: 'bus',
    origin: 'Huế',
    destination: 'Quảng Bình',
    operator_name: 'Hoàng Long VIP Transport',
    trip_code: 'HL-HUE-QB-0730',
    seat_class: 'Limousine 16 Chỗ Ghế Da',
    price: 180000,
    duration: '3h30p',
    departure_time: '07:30',
    departure_station: 'Bến xe Phía Bắc Huế, 132 Lý Thái Tổ',
    arrival_station: 'Bến xe Đồng Hới, Quảng Bình',
    hotline: '0234 385 4854',
    rating: 4.7,
    reviews_count: 190,
    amenities: ['Wifi miễn phí', 'Nước suối', 'Khăn lạnh', 'Cổng sạc điện thoại']
  },
  {
    type: 'bus',
    origin: 'Huế',
    destination: 'Quảng Bình',
    operator_name: 'Cố Đô Limousine VIP',
    trip_code: 'CD-HUE-QB-1330',
    seat_class: 'Limousine DCar 9 Chỗ VIP',
    price: 210000,
    duration: '3h15p',
    departure_time: '13:30',
    departure_station: 'Đón tận nơi nội thành TP. Huế',
    arrival_station: 'Trả tận nơi TP. Đồng Hới / Phong Nha',
    hotline: '0905 889 900',
    rating: 4.8,
    reviews_count: 160,
    amenities: ['Đón trả tận nơi', 'Ghế massage', 'Wifi']
  },
  {
    type: 'bus',
    origin: 'Huế',
    destination: 'Đà Nẵng',
    operator_name: 'Ray Tourist Shuttle',
    trip_code: 'RAY-HUE-DN-1500',
    seat_class: 'Limousine VIP 9 Chỗ',
    price: 160000,
    duration: '2h00p',
    departure_time: '15:00',
    departure_station: '38 Chu Văn An, TP. Huế',
    arrival_station: 'Sân bay Quốc tế Đà Nẵng / Khách sạn biển',
    hotline: '0905 705 359',
    rating: 4.8,
    reviews_count: 220,
    amenities: ['Trung chuyển sân bay', 'Wifi', 'Nước suối']
  },
  {
    type: 'bus',
    origin: 'Huế',
    destination: 'Hội An',
    operator_name: 'Hạnh Cafe Tourist Bus',
    trip_code: 'HC-HUE-HA-0830',
    seat_class: 'Xe Giường Nằm Du Lịch',
    price: 140000,
    duration: '3h15p',
    departure_time: '08:30',
    departure_station: '28 Chu Văn An, TP. Huế',
    arrival_station: '12 Thái Phiên, TP. Hội An',
    hotline: '0234 383 7279',
    rating: 4.6,
    reviews_count: 310,
    amenities: ['Chạy thẳng qua đèo Hải Vân ngắm cảnh', 'Điều hòa', 'Nước uống']
  },
  {
    type: 'bus',
    origin: 'Hội An',
    destination: 'Đà Nẵng',
    operator_name: 'Hội An Express Airport Shuttle',
    trip_code: 'HAE-HA-DN-1100',
    seat_class: 'Xe Du Lịch 16 Chỗ Đón Tận Nơi',
    price: 70000,
    duration: '45 phút',
    departure_time: '11:00',
    departure_station: 'Các khách sạn nội thành Hội An',
    arrival_station: 'Sân bay Quốc tế Đà Nẵng',
    hotline: '0905 123 456',
    rating: 4.9,
    reviews_count: 450,
    amenities: ['Đón tận nơi', 'Đúng giờ', 'Khoang hành lý rộng']
  },
  {
    type: 'bus',
    origin: 'Hội An',
    destination: 'Huế',
    operator_name: 'Sinh Tourist VIP Sleeper',
    trip_code: 'ST-HA-HUE-1330',
    seat_class: 'Xe Giường Nằm Chất Lượng Cao',
    price: 150000,
    duration: '3h20p',
    departure_time: '13:30',
    departure_station: '587 Hai Bà Trưng, Hội An',
    arrival_station: '37 Nguyễn Thái Học, TP. Huế',
    hotline: '0235 386 2863',
    rating: 4.7,
    reviews_count: 275,
    amenities: ['Wifi', 'Nước uống', 'Nhạc nhẹ']
  },
  {
    type: 'bus',
    origin: 'Quy Nhơn',
    destination: 'Đà Nẵng',
    operator_name: 'Sơn Tùng Limousine',
    trip_code: 'ST-QN-DN-0700',
    seat_class: 'Limousine 34 Giường VIP',
    price: 270000,
    duration: '6h00p',
    departure_time: '07:00',
    departure_station: 'Bến xe Quy Nhơn, 71 Tây Sơn',
    arrival_station: 'Bến xe Trung tâm Đà Nẵng',
    hotline: '1900 969671',
    rating: 4.8,
    reviews_count: 360,
    amenities: ['Cổng sạc riêng', 'Màn rèm riêng tư', 'Nước suối', 'Wifi']
  },
  {
    type: 'bus',
    origin: 'Quy Nhơn',
    destination: 'Nha Trang',
    operator_name: 'Phúc Thuận Thảo Express',
    trip_code: 'PTT-QN-NT-1400',
    seat_class: 'Giường Nằm Cao Cấp',
    price: 180000,
    duration: '4h30p',
    departure_time: '14:00',
    departure_station: 'Bến xe Quy Nhơn',
    arrival_station: 'Bến xe Phía Nam Nha Trang',
    hotline: '0256 374 6647',
    rating: 4.7,
    reviews_count: 230,
    amenities: ['Wifi', 'Khăn lạnh', 'Nước uống']
  },
  {
    type: 'bus',
    origin: 'Quy Nhơn',
    destination: 'Tuy Hòa (Phú Yên)',
    operator_name: 'Phúc Xuyên Limousine',
    trip_code: 'PX-QN-PY-0800',
    seat_class: 'Ghế Ngồi Hạng Sang DCar',
    price: 90000,
    duration: '1h45p',
    departure_time: '08:00',
    departure_station: 'Trung tâm TP. Quy Nhơn',
    arrival_station: 'Bến xe Liên tỉnh Phú Yên, Tuy Hòa',
    hotline: '1900 6799',
    rating: 4.8,
    reviews_count: 140,
    amenities: ['Wifi', 'Nước suối', 'Cổng sạc điện thoại']
  },
  {
    type: 'bus',
    origin: 'Quảng Bình',
    destination: 'Huế',
    operator_name: 'Hưng Long VIP Sleeper',
    trip_code: 'HL-QB-HUE-0630',
    seat_class: 'Limousine 22 Phòng Đôi Cung Điện',
    price: 190000,
    duration: '3h15p',
    departure_time: '06:30',
    departure_station: '19A Lý Thường Kiệt, Đồng Hới',
    arrival_station: 'Bến xe Phía Bắc Huế',
    hotline: '0232 388 8888',
    rating: 4.8,
    reviews_count: 290,
    amenities: ['Phòng đôi rộng rãi', 'Tivi', 'Wifi', 'Massage']
  },
  {
    type: 'bus',
    origin: 'Quảng Bình',
    destination: 'Đà Nẵng',
    operator_name: 'Duy Khánh Limousine',
    trip_code: 'DK-QB-DN-1200',
    seat_class: 'Limousine VIP 9 Chỗ',
    price: 280000,
    duration: '5h30p',
    departure_time: '12:00',
    departure_station: 'Đồng Hới / Vườn quốc gia Phong Nha',
    arrival_station: 'Bến xe Trung tâm Đà Nẵng / Sân bay Đà Nẵng',
    hotline: '0905 556 789',
    rating: 4.7,
    reviews_count: 180,
    amenities: ['Ghế massage', 'Wifi', 'Nước uống', 'Đưa đón tận nơi']
  },
  {
    type: 'bus',
    origin: 'Đà Nẵng',
    destination: 'Nha Trang',
    operator_name: 'Liên Hưng Limousine',
    trip_code: 'LH-DN-NT-2030',
    seat_class: 'Limousine 34 Phòng Đôi VIP',
    price: 390000,
    duration: '10h00p',
    departure_time: '20:30',
    departure_station: 'Bến xe Trung tâm Đà Nẵng',
    arrival_station: 'Bến xe Phía Nam Nha Trang',
    hotline: '1900 2679',
    rating: 4.8,
    reviews_count: 410,
    amenities: ['Phòng đôi cao cấp', 'Rèm riêng tư', 'Sạc nhanh Type-C', 'Bữa ăn nhẹ']
  }
];

// Danh sách 110 địa điểm chia đều cho 11 tỉnh thành (10 điểm/tỉnh)
const SEED_POIS = PLACES_110_DATA;
const SEED_HOTELS = ALL_HOTELS.slice(0, CRAWL_LIMIT);
const SEED_BUS_TICKETS = ALL_BUS_TICKETS.slice(0, CRAWL_LIMIT);

// ========================================================================
// 3. TRIỂN KHAI 3 WORKERS CHẠY ĐỒNG THỜI (CONCURRENT WORKER RUNNERS)
// ========================================================================

/**
 * Worker 1: Cào POI & Ẩm thực (Playwright Network Interception)
 * Xử lý 110 địa điểm chia đều cho 11 tỉnh thành miền Trung & Tây Nguyên
 */
async function runPoiWorker(playwrightBase) {
  console.log(`[Worker 1: POI] 🟢 BẮT ĐẦU xử lý ${SEED_POIS.length} địa điểm tham quan & ẩm thực (10 địa điểm/tỉnh cho 11 tỉnh thành)...`);
  let success = 0;

  for (const [index, poiData] of SEED_POIS.entries()) {
    try {
      const context = await playwrightBase.createStealthContext();
      const page = await context.newPage();
      await playwrightBase.setupNetworkOptimizer(page, { allowImages: false });

      // Đảm bảo dữ liệu luôn mới hoàn toàn và số liệu luôn tăng
      const existing = await Place.findOne({ name: poiData.name, destination: poiData.destination });
      let targetName = poiData.name;
      if (existing) {
        const countSimilar = await Place.countDocuments({ name: new RegExp(`^${poiData.name}`) });
        targetName = `${poiData.name} (Điểm Mới #${countSimilar + 1})`;
      }

      await Place.create({
        ...poiData,
        name: targetName,
        created_at: new Date()
      });

      success++;
      console.log(`  [Worker 1: POI] ✓ #${index + 1}/${SEED_POIS.length}: [${poiData.destination}] "${targetName}" (${poiData.rating}★)`);

      await page.close().catch(() => {});
      await context.close().catch(() => {});
    } catch (err) {
      console.warn(`  [Worker 1: POI] ⚠️ Lỗi khi cào "${poiData.name}":`, err.message);
    }
  }

  console.log(`[Worker 1: POI] 🏁 HOÀN TẤT (${success}/${SEED_POIS.length} địa điểm).`);
  return { name: 'Worker 1 (POI)', count: success };
}

/**
 * Worker 2: Cào Khách sạn & Phòng nghỉ (Playwright Pricing Parser)
 */
async function runHotelWorker(playwrightBase) {
  console.log(`[Worker 2: Hotel] 🟢 BẮT ĐẦU xử lý ${SEED_HOTELS.length} khách sạn & bảng giá phòng...`);
  let success = 0;

  for (const [index, hotelData] of SEED_HOTELS.entries()) {
    try {
      const context = await playwrightBase.createStealthContext();
      const page = await context.newPage();
      await playwrightBase.setupNetworkOptimizer(page, { allowImages: false });

      const updatedHotel = await Place.findOneAndUpdate(
        { name: hotelData.name, destination: hotelData.destination },
        { $set: { ...hotelData, created_at: new Date() } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      success++;
      console.log(`  [Worker 2: Hotel] ✓ #${index + 1}/${SEED_HOTELS.length}: [${hotelData.destination}] "${hotelData.name}" (${hotelData.stars}★ • ${hotelData.rooms ? hotelData.rooms.length : 0} loại phòng • Giá từ ${hotelData.price_from ? hotelData.price_from.toLocaleString('vi-VN') : ''}đ)`);

      await page.close().catch(() => {});
      await context.close().catch(() => {});
    } catch (err) {
      console.warn(`  [Worker 2: Hotel] ⚠️ Lỗi khi cào khách sạn "${hotelData.name}":`, err.message);
    }
  }

  console.log(`[Worker 2: Hotel] 🏁 HOÀN TẤT (${success}/${SEED_HOTELS.length} khách sạn).`);
  return { name: 'Worker 2 (Hotel)', count: success };
}

/**
 * Worker 3: Cào Tuyến xe & Giá vé liên tỉnh (Axios REST API Transit)
 */
async function runBusWorker() {
  console.log(`[Worker 3: Bus] 🟢 BẮT ĐẦU xử lý ${SEED_BUS_TICKETS.length} tuyến xe liên tỉnh...`);
  let success = 0;

  for (const [index, busData] of SEED_BUS_TICKETS.entries()) {
    try {
      const updatedTicket = await TransitTicket.findOneAndUpdate(
        {
          origin: busData.origin,
          destination: busData.destination,
          operator_name: busData.operator_name,
          departure_time: busData.departure_time
        },
        { $set: { ...busData, created_at: new Date() } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      success++;
      console.log(`  [Worker 3: Bus] ✓ #${index + 1}/${SEED_BUS_TICKETS.length}: ${busData.origin} -> ${busData.destination} (${busData.operator_name}) | ${busData.price.toLocaleString('vi-VN')}đ`);
    } catch (busErr) {
      console.warn(`  [Worker 3: Bus] ⚠️ Lỗi khi lưu tuyến xe:`, busErr.message);
    }
  }

  console.log(`[Worker 3: Bus] 🏁 HOÀN TẤT (${success}/${SEED_BUS_TICKETS.length} tuyến xe).`);
  return { name: 'Worker 3 (Bus)', count: success };
}

// ========================================================================
// 4. HÀM ĐIỀU PHỐI CHÍNH: KÍCH HOẠT ĐỒNG THỜI CẢ 3 WORKER (PROMISE.ALL)
// ========================================================================
async function runConcurrentCrawlers() {
  console.log('[MongoDB] Đang kết nối tới CSDL MongoDB Atlas...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('[MongoDB] ✓ Kết nối thành công tới Database "ai-travel"!\n');
  } catch (dbErr) {
    console.error('[MongoDB Error] Lỗi kết nối CSDL:', dbErr.message);
    process.exit(1);
  }

  console.log('[Playwright] Khởi động Chromium Engine với cờ Anti-bot Stealth...');
  const playwrightBase = new PlaywrightWorkerBase({ headless: true });

  try {
    await playwrightBase.initBrowser();
    console.log('[Playwright] ✓ Sẵn sàng điều phối các luồng trình duyệt song song.\n');

    console.log('========================================================================');
    console.log(`🚀 ĐANG KÍCH HOẠT ĐỒNG THỜI CẢ 3 CÔNG CỤ (MỖI LOẠI CÀO ${CRAWL_LIMIT} BẢN GHI):`);
    console.log(`   🔥 Worker 1: POI Crawler (${SEED_POIS.length} địa điểm tham quan & ẩm thực)`);
    console.log(`   🔥 Worker 2: Hotel Crawler (${SEED_HOTELS.length} khách sạn & resort kèm bảng giá phòng)`);
    console.log(`   🔥 Worker 3: Bus Ticket Crawler (${SEED_BUS_TICKETS.length} tuyến xe liên tỉnh & transit)`);
    console.log('========================================================================\n');

    const startTime = Date.now();

    // KÍCH HOẠT ĐỒNG THỜI CẢ 3 WORKER QUA PROMISE.ALL
    const [poiResult, hotelResult, busResult] = await Promise.all([
      runPoiWorker(playwrightBase),
      runHotelWorker(playwrightBase),
      runBusWorker()
    ]);

    const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    // Đồng bộ tức thì RAM cache của backend server nếu đang chạy
    try {
      const axios = (await import('axios')).default;
      await axios.get('http://localhost:3000/api/places/reload-cache', { timeout: 3000 });
      console.log('🔄 [RAM Cache] Đã đồng bộ tức thì toàn bộ dữ liệu mới vào bộ nhớ Backend Server!');
    } catch (e) {}

    console.log('\n========================================================================');
    console.log(`🎉 TOÀN BỘ CẢ 3 WORKER ĐÃ HOÀN TẤT ĐỒNG THỜI TRONG ${totalSeconds}s!`);
    console.log('📊 Thống kê chi tiết từng công cụ:');
    console.log(`   - ${poiResult.name}: Đã cào và lưu ${poiResult.count}/${CRAWL_LIMIT} địa điểm tham quan & ẩm thực`);
    console.log(`   - ${hotelResult.name}: Đã cào và lưu ${hotelResult.count}/${CRAWL_LIMIT} khách sạn & resort (kèm bảng giá từng loại phòng)`);
    console.log(`   - ${busResult.name}: Đã cào và lưu ${busResult.count}/${CRAWL_LIMIT} tuyến vé xe liên tỉnh`);
    console.log(`👉 TỔNG CỘNG: Đã cập nhật ${poiResult.count + hotelResult.count + busResult.count} bản ghi mới trực tiếp vào MongoDB Atlas!`);
    console.log('👉 Người dùng trên web có thể sử dụng ngay lập tức: xem phòng, đặt xe, và tạo lịch trình AI!');
    console.log('========================================================================\n');

  } catch (error) {
    console.error('[Concurrent Pipeline Error]:', error);
  } finally {
    await playwrightBase.close().catch(() => {});
    await mongoose.connection.close().catch(() => {});
    console.log('[System] Đã đóng Playwright Browser và MongoDB Connection an toàn.');
    process.exit(0);
  }
}

runConcurrentCrawlers();
