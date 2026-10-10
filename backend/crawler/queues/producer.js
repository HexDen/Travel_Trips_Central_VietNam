import { Queue } from 'bullmq';
import crypto from 'crypto';
import { redisConfig } from '../config/redis.js';
import { initPostGISSchema } from '../config/database.js';

/**
 * Cấu hình chuẩn mặc định cho Jobs trong hệ thống Scraping
 * Đảm bảo độ bền vững (fault-tolerant) khi mạng lag hoặc bị rate limit
 */
const DEFAULT_JOB_OPTIONS = {
  attempts: 3, // Thử lại tối đa 3 lần nếu worker gặp lỗi hoặc captcha
  backoff: {
    type: 'exponential',
    delay: 5000 // Chờ 5s -> 10s -> 20s giữa các lần retry
  },
  removeOnComplete: {
    age: 3600,  // Tự động dọn dẹp job thành công sau 1 giờ
    count: 1000 // Tối đa lưu 1000 logs
  },
  removeOnFail: {
    age: 86400, // Lưu vết job thất bại trong 24 giờ để phân tích anti-bot
    count: 500
  }
};

// ==================== KHỞI TẠO 3 QUEUE CHÍNH THỨC ====================

/**
 * 1. POI Queue: Địa điểm tham quan, ẩm thực, check-in di sản Miền Trung
 */
export const poiQueue = new Queue('poi-scraping-queue', {
  connection: redisConfig,
  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,
    priority: 2 // Độ ưu tiên bình thường
  }
});

/**
 * 2. Hotel Queue: Khách sạn, Homestay, Resort OTA tại Đà Nẵng, Huế, Hội An...
 */
export const hotelQueue = new Queue('hotel-scraping-queue', {
  connection: redisConfig,
  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,
    priority: 2
  }
});

/**
 * 3. Bus Queue: Vé xe khách liên tỉnh, giờ xuất phát, số ghế trống theo thời gian thực
 */
export const busQueue = new Queue('bus-scraping-queue', {
  connection: redisConfig,
  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,
    priority: 1 // Ưu tiên cao nhất vì dữ liệu vé xe và ghế trống biến động liên tục theo giờ
  }
});

/**
 * Tạo Job ID duy nhất (Idempotency Key) tránh đẩy trùng lặp URL vào hàng đợi
 */
function generateJobId(prefix, url, extraKey = '') {
  const hash = crypto.createHash('md5').update(`${url}_${extraKey}`).digest('hex');
  return `${prefix}_${hash}`;
}

// ==================== TẬP DỮ LIỆU NHIỆM VỤ MẪU (CENTRAL VIETNAM SEEDS) ====================

const SAMPLE_POI_TASKS = [
  {
    name: 'Bà Nà Hills & Cầu Vàng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    url: 'https://danangfantasticity.com/diem-den/ba-na-hills.html',
    source: 'danangfantasticity',
    district: 'Hòa Vang',
    expectedCategory: 'attraction'
  },
  {
    name: 'Bán Đảo Sơn Trà & Chùa Linh Ứng',
    destination: 'Đà Nẵng',
    type: 'attraction',
    url: 'https://danangfantasticity.com/diem-den/ban-dao-son-tra.html',
    source: 'danangfantasticity',
    district: 'Sơn Trà',
    expectedCategory: 'attraction'
  },
  {
    name: 'Đại Nội Huế (Hoàng Thành)',
    destination: 'Huế',
    type: 'attraction',
    url: 'https://khamphahue.com.vn/diem-den/dai-noi-hue',
    source: 'khamphahue',
    district: 'TP. Huế',
    expectedCategory: 'attraction'
  },
  {
    name: 'Lăng Khải Định',
    destination: 'Huế',
    type: 'attraction',
    url: 'https://khamphahue.com.vn/diem-den/lang-khai-dinh',
    source: 'khamphahue',
    district: 'Hương Thủy',
    expectedCategory: 'attraction'
  },
  {
    name: 'Phố Cổ Hội An & Chùa Cầu',
    destination: 'Quảng Nam',
    type: 'attraction',
    url: 'https://hoianworldheritage.org.vn/vi/pho-co-hoi-an.hwh',
    source: 'hoiantourism',
    district: 'Hội An',
    expectedCategory: 'attraction'
  },
  {
    name: 'Rừng Dừa Bảy Mẫu Cẩm Thanh',
    destination: 'Quảng Nam',
    type: 'attraction',
    url: 'https://hoiantourism.org.vn/diem-den/rung-dua-bay-mau',
    source: 'hoiantourism',
    district: 'Hội An',
    expectedCategory: 'attraction'
  },
  {
    name: 'Eo Gió Quy Nhơn',
    destination: 'Bình Định',
    type: 'attraction',
    url: 'https://quynhon.gov.vn/du-lich/eo-gio-nhon-ly',
    source: 'quynhontourism',
    district: 'Nhơn Lý',
    expectedCategory: 'attraction'
  }
];

const SAMPLE_HOTEL_TASKS = [
  {
    name: 'Muong Thanh Luxury Da Nang Hotel',
    destination: 'Đà Nẵng',
    url: 'https://www.agoda.com/vi-vn/muong-thanh-luxury-da-nang-hotel/hotel/da-nang-vn.html',
    source: 'agoda',
    area: 'Bãi biển Mỹ Khê',
    checkinOffsetDays: 2,
    nights: 1
  },
  {
    name: 'Vinpearl Resort & Golf Nam Hoi An',
    destination: 'Quảng Nam',
    url: 'https://www.agoda.com/vi-vn/vinpearl-resort-golf-nam-hoi-an/hotel/hoi-an-vn.html',
    source: 'agoda',
    area: 'Bình Minh, Thăng Bình',
    checkinOffsetDays: 3,
    nights: 1
  },
  {
    name: 'Silk Sense Hoi An River Resort',
    destination: 'Quảng Nam',
    url: 'https://www.booking.com/hotel/vn/silk-sense-hoi-an-river-resort.vi.html',
    source: 'booking',
    area: 'Cẩm An, Hội An',
    checkinOffsetDays: 2,
    nights: 1
  },
  {
    name: 'Azerai La Residence Hue',
    destination: 'Huế',
    url: 'https://www.booking.com/hotel/vn/azerai-la-residence-hue.vi.html',
    source: 'booking',
    area: 'Sông Hương, TP. Huế',
    checkinOffsetDays: 1,
    nights: 1
  },
  {
    name: 'FLC Luxury Hotel Quy Nhon',
    destination: 'Bình Định',
    url: 'https://www.agoda.com/vi-vn/flc-luxury-hotel-quy-nhon/hotel/quy-nhon-binh-dinh-vn.html',
    source: 'agoda',
    area: 'Nhơn Lý, Quy Nhơn',
    checkinOffsetDays: 5,
    nights: 2
  }
];

const SAMPLE_BUS_TASKS = [
  {
    origin: 'Hà Nội',
    destination: 'Đà Nẵng',
    travelDateOffset: 1,
    apiEndpoint: 'https://api.vexere.com/v1/trips?origin=ha-noi&dest=da-nang',
    directUrl: 'https://vexere.com/vi-VN/ve-xe-khach-tu-ha-noi-di-da-nang-124t1151.html',
    targetOperators: ['Hoàng Long', 'Văn Minh', 'Tân Kim Chi', 'Phương Trang']
  },
  {
    origin: 'TP Hồ Chí Minh',
    destination: 'Đà Nẵng',
    travelDateOffset: 1,
    apiEndpoint: 'https://api.vexere.com/v1/trips?origin=hcm&dest=da-nang',
    directUrl: 'https://vexere.com/vi-VN/ve-xe-khach-tu-sai-gon-di-da-nang-129t1151.html',
    targetOperators: ['Phương Trang', 'Thuận Thảo', 'Đình Nhân', 'Phi Hiệp']
  },
  {
    origin: 'Đà Nẵng',
    destination: 'Huế',
    travelDateOffset: 1,
    apiEndpoint: 'https://api.vexere.com/v1/trips?origin=da-nang&dest=hue',
    directUrl: 'https://vexere.com/vi-VN/ve-xe-khach-tu-da-nang-di-hue-115t1261.html',
    targetOperators: ['HAV Limousine', 'Ray Tour', 'Kha Trần Limousine']
  },
  {
    origin: 'Đà Nẵng',
    destination: 'Hội An',
    travelDateOffset: 1,
    apiEndpoint: 'https://api.vexere.com/v1/trips?origin=da-nang&dest=hoi-an',
    directUrl: 'https://vexere.com/vi-VN/ve-xe-khach-tu-da-nang-di-hoi-an-115t1281.html',
    targetOperators: ['Barri Ann Travel', 'Hội An Express', 'Xe Bus Liên Tỉnh']
  },
  {
    origin: 'Đà Nẵng',
    destination: 'Quy Nhơn',
    travelDateOffset: 2,
    apiEndpoint: 'https://api.vexere.com/v1/trips?origin=da-nang&dest=quy-nhon',
    directUrl: 'https://vexere.com/vi-VN/ve-xe-khach-tu-da-nang-di-quy-nhon-115t1421.html',
    targetOperators: ['Sơn Tùng', 'Điền Linh', 'Hoàng Long']
  }
];

// ==================== PHƯƠNG THỨC ĐIỀU PHỐI (PRODUCER METHODS) ====================

/**
 * Đẩy các task địa điểm tham quan vào POI Queue
 */
export async function pushPoiTasks(tasks = SAMPLE_POI_TASKS) {
  console.log(`[Producer] Đang đẩy ${tasks.length} task POI vào poiQueue...`);
  const jobs = tasks.map((task) => ({
    name: `scrape_poi_${task.destination}_${task.name}`,
    data: {
      ...task,
      dispatchedAt: new Date().toISOString()
    },
    opts: {
      jobId: generateJobId('poi', task.url, task.destination)
    }
  }));

  const added = await poiQueue.addBulk(jobs);
  console.log(`[Producer] Đã nạp thành công ${added.length} jobs vào poiQueue.`);
  return added;
}

/**
 * Đẩy các task cào phòng khách sạn vào Hotel Queue
 */
export async function pushHotelTasks(tasks = SAMPLE_HOTEL_TASKS) {
  console.log(`[Producer] Đang đẩy ${tasks.length} task Khách sạn vào hotelQueue...`);
  const jobs = tasks.map((task) => ({
    name: `scrape_hotel_${task.destination}_${task.name}`,
    data: {
      ...task,
      dispatchedAt: new Date().toISOString()
    },
    opts: {
      jobId: generateJobId('hotel', task.url, `${task.checkinOffsetDays}d`)
    }
  }));

  const added = await hotelQueue.addBulk(jobs);
  console.log(`[Producer] Đã nạp thành công ${added.length} jobs vào hotelQueue.`);
  return added;
}

/**
 * Đẩy các task vé xe liên tỉnh vào Bus Queue
 */
export async function pushBusTasks(tasks = SAMPLE_BUS_TASKS) {
  console.log(`[Producer] Đang đẩy ${tasks.length} task Vé xe vào busQueue...`);
  const jobs = tasks.map((task) => ({
    name: `scrape_bus_${task.origin}_to_${task.destination}`,
    data: {
      ...task,
      dispatchedAt: new Date().toISOString()
    },
    opts: {
      jobId: generateJobId('bus', `${task.origin}_${task.destination}`, `${task.travelDateOffset}d`)
    }
  }));

  const added = await busQueue.addBulk(jobs);
  console.log(`[Producer] Đã nạp thành công ${added.length} jobs vào busQueue.`);
  return added;
}

/**
 * Giám sát trạng thái số lượng job trong từng Queue
 */
export async function getQueueMetrics() {
  const [poiCounts, hotelCounts, busCounts] = await Promise.all([
    poiQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
    hotelQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
    busQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed')
  ]);

  return {
    poiQueue: poiCounts,
    hotelQueue: hotelCounts,
    busQueue: busCounts,
    timestamp: new Date().toISOString()
  };
}

// ==================== RUNNER CLI MASTER PRODUCER ====================

export async function runMasterProducer() {
  console.log('================================================================');
  console.log('🚀 KHỞI ĐỘNG MASTER PRODUCER - CENTRAL VIETNAM CONCURRENT CRAWLER');
  console.log('================================================================');

  try {
    // 1. Kiểm tra & Khởi tạo Schema PostGIS nếu cần
    await initPostGISSchema();

    // 2. Nạp task mẫu đồng thời vào cả 3 Queue
    await Promise.all([
      pushPoiTasks(),
      pushHotelTasks(),
      pushBusTasks()
    ]);

    // 3. Đọc số liệu thống kê
    const metrics = await getQueueMetrics();
    console.log('\n📊 THỐNG KÊ TRẠNG THÁI HÀNG ĐỢI (QUEUE METRICS):');
    console.table(metrics);

    console.log('✅ Master Producer đã hoàn thành đẩy task vào Redis. Sẵn sàng chờ Workers xử lý!');
  } catch (error) {
    console.error('❌ [Master Producer Error]:', error);
  }
}

// Cho phép chạy trực tiếp từ Terminal: node queues/producer.js
if (process.argv[1] && process.argv[1].endsWith('producer.js')) {
  runMasterProducer().then(() => {
    // Thoát tiến trình sau khi đẩy job
    setTimeout(() => process.exit(0), 1000);
  });
}
