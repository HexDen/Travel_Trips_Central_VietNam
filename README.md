# AI Travel Assistant — Vue + Node.js + MongoDB

Ứng dụng trợ lý du lịch cá nhân hóa: AI tạo lịch trình JSON, phân bổ ngân sách,
tìm dữ liệu địa điểm và điều chỉnh lịch trình theo yêu cầu của người dùng.

Structure:

- frontend: Vite + Vue 3 app (development)
- backend: Express API, MongoDB models và Gemini AI service

Quick start (from workspace root):

1) Backend

```bash
cd backend
npm install
npm run start
```

2) Frontend (in a separate terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend API at `/api` (dev proxy or CORS). For local development you can run backend on :3000 and Vite on :5173; Vite will proxy `/api` to the backend if configured or you can enable CORS in backend (already enabled).

## API hiện có

- `POST /api/ai/plan`: tạo và lưu lịch trình có cấu trúc
- `POST /api/ai/replan`: điều chỉnh lịch trình theo yêu cầu/thời tiết
- `POST /api/ai/chat`: chat theo ngữ cảnh chuyến đi
- `GET /api/ai/trips/:tripId`: lấy lại chuyến đi đã lưu
- `GET /api/places?destination=Gia%20Lai&type=restaurant`: tìm địa điểm

## Cấu hình Gemini

Tạo `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ai-travel
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3.6-flash
```

Nếu Gemini tạm thời lỗi, backend vẫn trả fallback cục bộ để giao diện không bị treo.

## Lộ trình mở rộng

1. Thêm User/Auth, favorites, reviews và chia sẻ lịch trình.
2. Seed Place vào MongoDB, kết nối Google Maps/Places cho tọa độ và chỉ đường.
3. Thêm weather service để tự động kích hoạt Re-planner.
4. Lưu feedback và sở thích để cá nhân hóa các chuyến đi sau.
