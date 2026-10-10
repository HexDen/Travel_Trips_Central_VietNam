# Central Vietnam Concurrent Scraping Engine (Hệ Thống Cào Dữ Liệu Đồng Thời Miền Trung)

Hệ thống cào dữ liệu phân tán hiệu năng cao phục vụ nền tảng lên lịch trình du lịch cho khu vực miền Trung (Đà Nẵng, Huế, Quảng Nam, Bình Định, Quy Nhơn, Tây Nguyên...).

## 1. Công nghệ sử dụng (Tech Stack)
* **Ngôn ngữ:** Node.js (Chuẩn ES Modules hiện đại).
* **Trình duyệt & Cào tự động:** Playwright Stealth kết hợp Network Interception.
* **REST API Scraper:** Axios (gọi trực tiếp các endpoint công khai để đạt tốc độ mili-giây).
* **Hàng đợi phân tán (Message Queue):** Redis kết hợp với BullMQ v5.
* **Cơ sở dữ liệu không gian:** PostgreSQL với PostGIS Extension (`geometry(Point, 4326)`).
* **Chống chặn (Anti-bot):** User-Agent Rotation, ẩn cờ `navigator.webdriver`, giả lập viewport, và xoay vòng Rotating Proxy theo từng Browser Context.

## 2. Kiến trúc & Cấu trúc thư mục
```text
backend/crawler/
├── package.json              # Khai báo dependencies độc lập không ảnh hưởng server chính
├── index.js                  # Master Runner điều phối đồng thời cả 3 Worker & Graceful Shutdown
├── config/
│   ├── database.js          # PostgreSQL Connection Pool & DDL Schema PostGIS (bảng places, hotels, bus_tickets)
│   └── redis.js             # Kết nối Redis chuẩn BullMQ (maxRetriesPerRequest: null)
├── queues/
│   └── producer.js          # Master Producer tạo 3 Queue và phân phối hạt giống dữ liệu miền Trung
├── base/
│   └── worker_base.js       # Playwright Stealth Base Class, Round-Robin Proxy, Network Optimizer
└── workers/
    ├── poiWorker.js         # Worker 1: Cào POI qua tóm gói tin JSON ảnh thật
    ├── hotelWorker.js       # Worker 2: Cào OTA Hotel, parse PostGIS Point(lon, lat)
    └── busWorker.js         # Worker 3: Cào vé xe liên tỉnh, giờ xuất bến, ghế trống
```

## 3. Cấu hình biến môi trường (`.env`)
Tạo file `.env` bên trong thư mục `backend/crawler/` hoặc sử dụng chung với `backend/.env`:
```env
# PostgreSQL + PostGIS
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/travel_central_vn
PG_SSL=false

# Redis BullMQ
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Headless & Proxy Pool (Tùy chọn)
HEADLESS=true
PROXY_LIST=http://user1:pass1@103.1.2.3:8080,http://user2:pass2@103.1.2.4:8080
```

## 4. Hướng dẫn chạy hệ thống
1. Di chuyển vào thư mục crawler và cài đặt dependencies:
   ```bash
   cd backend/crawler
   npm install
   ```

2. Đẩy các task cào hạt giống (Seed Tasks) vào hàng đợi Redis:
   ```bash
   npm run producer
   ```

3. Khởi động 3 Worker xử lý đồng thời:
   ```bash
   npm start
   ```

4. Hoặc vừa nạp task vừa chạy Worker cùng lúc:
   ```bash
   npm run seed
   ```

## 5. Liên kết với các thuật toán lên lịch trình
* **Tối ưu hóa không gian (Spatial Queries & Routing):** Tọa độ được lưu dưới chuẩn `Point(lon, lat)` với SRID 4326 cùng `GIST Index`. Thuật toán gom cụm K-Means và tính toán khoảng cách Traveling Salesperson Problem (TSP) có thể truy vấn siêu tốc bằng lệnh `ST_DistanceSphere(p1.geom, p2.geom)`.
* **Phân bổ ngân sách & lọc khách sạn:** Dữ liệu phòng được lưu cấu trúc JSONB chuẩn, đồng bộ trực tiếp với bộ lọc ngân sách và hiển thị Modal xem phòng trên giao diện.
* **Đồng bộ thời gian di chuyển (Transit Schedule Alignment):** Dữ liệu vé xe cào theo thời gian thực (giờ xuất bến, bến đi/đến, giá vé) giúp thuật toán tính chính xác thời gian nhận phòng và lịch trình từng ngày.
