import { Worker } from 'bullmq';
import { redisConfig } from '../config/redis.js';
import { query } from '../config/database.js';
import { PlaywrightWorkerBase } from '../base/worker_base.js';

const playwrightEngine = new PlaywrightWorkerBase({ headless: true });

/**
 * Worker 1: POI Crawler (Điểm tham quan & Ẩm thực Miền Trung)
 * Kỹ thuật cốt lõi: page.on('response') Network Interception tóm gói tin JSON ảnh chất lượng cao
 */
export const poiWorker = new Worker(
  'poi-scraping-queue',
  async (job) => {
    const { name, destination, type, url, district } = job.data;
    console.log(`[Worker 1: POI] Bắt đầu xử lý Job #${job.id}: [${destination}] ${name}`);

    const context = await playwrightEngine.createStealthContext();
    const page = await context.newPage();

    // Tối ưu mạng: chặn tracking và font để tăng tốc độ cào
    await playwrightEngine.setupNetworkOptimizer(page, { allowImages: false });

    // Mảng lưu trữ link ảnh thật tóm được từ các gói tin JSON XHR/Fetch
    const interceptedPhotos = new Set();
    let apiMetadata = {};

    try {
      // 1. KỸ THUẬT NETWORK INTERCEPTION: Lắng nghe toàn bộ phản hồi từ server
      page.on('response', async (response) => {
        try {
          const reqUrl = response.url().toLowerCase();
          const contentType = response.headers()['content-type'] || '';

          // Chỉ xử lý các phản hồi JSON từ XHR hoặc Fetch
          if (contentType.includes('application/json') || reqUrl.includes('/api/') || reqUrl.includes('/graphql')) {
            const status = response.status();
            if (status >= 200 && status < 300) {
              const text = await response.text();
              if (text && text.length > 20 && text.startsWith('{') || text.startsWith('[')) {
                const data = JSON.parse(text);

                // Quét đệ quy tìm link ảnh thật dạng CDN chất lượng cao (bỏ qua thumbnail nhỏ)
                extractHighResImageUrls(data, interceptedPhotos);

                // Trích xuất metadata nếu payload chứa thông tin địa điểm
                if (data.rating || data.reviews || data.open_hours || data.price) {
                  apiMetadata = { ...apiMetadata, ...data };
                }
              }
            }
          }
        } catch (e) {
          // Bỏ qua các response không thể parse (stream, chunked, binary)
        }
      });

      // 2. Điều hướng tới URL mục tiêu
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });

      // 3. Cuộn trang tự nhiên để kích hoạt API load ảnh lazy-load
      await playwrightEngine.humanScroll(page, 2);

      // 4. Trích xuất thông tin DOM bổ trợ
      const domData = await page.evaluate(() => {
        const titleEl = document.querySelector('h1') || document.querySelector('.title') || document.querySelector('.place-title');
        const descEl = document.querySelector('.description') || document.querySelector('meta[name="description"]') || document.querySelector('p');
        const addrEl = document.querySelector('.address') || document.querySelector('.place-address') || document.querySelector('[itemprop="address"]');

        return {
          domName: titleEl ? titleEl.innerText.trim() : null,
          domDescription: descEl ? (descEl.content || descEl.innerText || '').trim() : '',
          domAddress: addrEl ? addrEl.innerText.trim() : ''
        };
      });

      // 5. Chuẩn hóa dữ liệu tương thích với thuật toán lên lịch trình
      const photoArray = Array.from(interceptedPhotos);
      const primaryPhoto = photoArray[0] || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&auto=format&fit=crop&q=80';
      const galleryJson = JSON.stringify(photoArray.slice(0, 8));

      // Tọa độ giả định/ước lượng nếu API không trả về trực tiếp (sẽ chuẩn hóa với Geocoding)
      const lat = apiMetadata.latitude || apiMetadata.lat || 16.0544; // Default Da Nang
      const lon = apiMetadata.longitude || apiMetadata.lng || 108.2022;

      // 6. LƯU VÀO CƠ SỞ DỮ LIỆU POSTGRESQL + POSTGIS
      // Sử dụng ST_SetSRID(ST_MakePoint(lon, lat), 4326) để tối ưu hóa truy vấn không gian
      const upsertSql = `
        INSERT INTO places (
          external_id, name, destination, type, description, address,
          image_url, gallery, tags, estimated_cost, ticket_price,
          rating, reviews_count, open_hours, dwell_time, is_indoor,
          district, source_target, latitude, longitude, geom, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19, $20,
          ST_SetSRID(ST_MakePoint($20, $19), 4326),
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (external_id) DO UPDATE SET
          image_url = EXCLUDED.image_url,
          gallery = EXCLUDED.gallery,
          description = COALESCE(EXCLUDED.description, places.description),
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          geom = EXCLUDED.geom,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;

      const externalId = `poi_${destination}_${name}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const params = [
        externalId,
        domData.domName || name,
        destination,
        type || 'attraction',
        domData.domDescription || `Điểm tham quan đặc sắc tại ${destination}`,
        domData.domAddress || `${name}, ${destination}`,
        primaryPhoto,
        galleryJson,
        [`${destination.toLowerCase()}`, `${type || 'attraction'}`],
        apiMetadata.estimated_cost || 40000,
        apiMetadata.ticket_price || 40000,
        apiMetadata.rating || 4.7,
        apiMetadata.reviews_count || 120,
        apiMetadata.open_hours || '07:30 - 17:30',
        '1.5 - 2 tiếng',
        Boolean(apiMetadata.is_indoor),
        district || 'Trung tâm',
        job.data.source || 'web_interception',
        lat,
        lon
      ];

      const result = await query(upsertSql, params);
      console.log(`[Worker 1: POI] ✓ Lưu thành công Place ID #${result.rows[0].id} với ${photoArray.length} ảnh JSON thật!`);

      return {
        success: true,
        placeId: result.rows[0].id,
        photosCount: photoArray.length,
        primaryPhoto
      };
    } catch (err) {
      console.error(`[Worker 1: POI Error] Thất bại tại URL: ${url} | Lỗi:`, err.message);
      throw err;
    } finally {
      await page.close().catch(() => {});
      await context.close().catch(() => {});
    }
  },
  {
    connection: redisConfig,
    concurrency: 2, // 2 tiến trình Playwright cào POI song song
    limiter: {
      max: 10,
      duration: 60000 // Tối đa 10 requests / phút để chống chặn IP
    }
  }
);

/**
 * Hàm đệ quy quét JSON tìm ảnh phân giải cao
 */
function extractHighResImageUrls(obj, photoSet, depth = 0) {
  if (!obj || depth > 6) return;

  if (typeof obj === 'string') {
    if (
      obj.startsWith('http') &&
      (obj.includes('.jpg') || obj.includes('.jpeg') || obj.includes('.png') || obj.includes('.webp') || obj.includes('unsplash') || obj.includes('googleusercontent')) &&
      !obj.includes('icon') && !obj.includes('logo') && !obj.includes('avatar')
    ) {
      photoSet.add(obj);
    }
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractHighResImageUrls(item, photoSet, depth + 1);
    }
    return;
  }

  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      extractHighResImageUrls(obj[key], photoSet, depth + 1);
    }
  }
}
