import { poiWorker } from './workers/poiWorker.js';
import { hotelWorker } from './workers/hotelWorker.js';
import { busWorker } from './workers/busWorker.js';
import { runMasterProducer, getQueueMetrics } from './queues/producer.js';
import { closeRedis } from './config/redis.js';
import { pool } from './config/database.js';

console.log('========================================================================');
console.log('⚡ KHỞI ĐỘNG HỆ THỐNG CONCURRENT SCRAPING - PLATFORM DU LỊCH MIỀN TRUNG');
console.log('========================================================================');

// Đăng ký các sự kiện theo dõi sức khỏe và kết quả của từng Worker
function setupWorkerLogging(worker, name) {
  worker.on('completed', (job, result) => {
    console.log(`[${name} SUCCESS] Job #${job.id} đã hoàn tất thành công.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[${name} FAILED] Job #${job ? job.id : 'unknown'} thất bại: ${err.message}`);
  });

  worker.on('error', (err) => {
    console.error(`[${name} ERROR] Lỗi worker runtime:`, err.message);
  });
}

setupWorkerLogging(poiWorker, 'Worker 1: POI');
setupWorkerLogging(hotelWorker, 'Worker 2: Hotel');
setupWorkerLogging(busWorker, 'Worker 3: Bus');

async function startSystem() {
  console.log('🚀 Cả 3 Worker đang hoạt động và sẵn sàng xử lý hàng đợi BullMQ:');
  console.log('   - Worker 1 (POI Crawler): Lắng nghe "poi-scraping-queue"');
  console.log('   - Worker 2 (Hotel Crawler): Lắng nghe "hotel-scraping-queue"');
  console.log('   - Worker 3 (Bus Ticket Crawler): Lắng nghe "bus-scraping-queue"');

  // Nếu truyền đối số --seed, tự động đẩy danh sách task mẫu vào queue
  if (process.argv.includes('--seed')) {
    console.log('\n[Trigger] Phát hiện cờ --seed: Tiến hành đẩy tasks mẫu...');
    await runMasterProducer();
  }

  // Định kỳ 30 giây in metrics hàng đợi
  setInterval(async () => {
    try {
      const metrics = await getQueueMetrics();
      console.log(`[Metrics ${new Date().toLocaleTimeString('vi-VN')}]`, JSON.stringify(metrics));
    } catch (e) {}
  }, 30000);
}

// ==================== CƠ CHẾ GRACEFUL SHUTDOWN ====================
async function shutdown(signal) {
  console.log(`\n[System] Nhận tín hiệu ${signal}. Đang tắt các Worker an toàn...`);
  try {
    await Promise.all([
      poiWorker.close(),
      hotelWorker.close(),
      busWorker.close()
    ]);
    await closeRedis();
    await pool.end();
    console.log('[System] Đã đóng toàn bộ Worker, Redis và Database Pool. Thoát an toàn.');
    process.exit(0);
  } catch (err) {
    console.error('[Shutdown Error]:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startSystem();
