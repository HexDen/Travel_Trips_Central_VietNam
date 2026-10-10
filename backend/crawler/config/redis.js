import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cấu hình Redis Connection chuyên dụng cho BullMQ
 * Lưu ý quan trọng của BullMQ: 'maxRetriesPerRequest' PHẢI đặt bằng null để tránh lỗi timeout khi chờ job
 */
export const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    if (times > 3) {
      console.error('\n❌ [Redis] Không thể kết nối tới Redis Server tại ' + (process.env.REDIS_HOST || '127.0.0.1') + ':' + (process.env.REDIS_PORT || '6379') + ' (ECONNREFUSED).');
      console.error('👉 Máy tính chưa bật Redis Server hoặc chưa cài đặt Redis.');
      console.error('👉 Nếu bạn muốn chạy cào dữ liệu lưu thẳng vào MongoDB hiện tại mà không cần cài Redis/PostgreSQL, hãy chạy: npm run seed:mongo\n');
      return null; // Dừng thử lại để tránh spam log liên tục
    }
    const delay = Math.min(times * 500, 2000);
    console.warn(`[Redis Reconnect] Đang thử kết nối lại lần ${times}/3 sau ${delay}ms...`);
    return delay;
  }
};

export const redisConnection = new Redis(redisConfig);

redisConnection.on('connect', () => {
  console.log(`[Redis] Kết nối thành công tới ${redisConfig.host}:${redisConfig.port} (DB ${redisConfig.db})`);
});

redisConnection.on('error', (err) => {
  console.error('[Redis Error] Lỗi kết nối Redis:', err.message);
});

/**
 * Kiểm tra sức khỏe kết nối Redis
 */
export async function checkRedisHealth() {
  try {
    const ping = await redisConnection.ping();
    return ping === 'PONG';
  } catch (err) {
    return false;
  }
}

/**
 * Đóng kết nối an toàn khi shutdown tiến trình
 */
export async function closeRedis() {
  await redisConnection.quit();
  console.log('[Redis] Đã đóng kết nối Redis an toàn.');
}
