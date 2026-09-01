# 🌴 WanderWise — AI Travel Assistant for Central Vietnam

[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **WanderWise** là ứng dụng du lịch thông minh đa nền tảng (\en{App-First: Mobile & PC Desktop}) ứng dụng Trí tuệ Nhân tạo tạo sinh (\en{Generative AI}) kết hợp cơ sở dữ liệu số hóa phong phú để hỗ trợ khách du lịch tự túc khám phá và lập lịch trình tối ưu tại **9 tỉnh/thành phố Miền Trung Việt Nam**.

---

## 🌟 Các Tính Năng Nổi Bật

- 🧭 **Lập Lịch Trình Tự Động Bằng AI (Smart AI Planner):** Sinh lịch trình chi tiết từng mốc thời gian (Sáng, Trưa, Khách sạn, Cafe, Tối) thích ứng theo số ngày (1--7 ngày), ngân sách, số lượng người và sở thích cá nhân.
- 🚫 **Chống Trùng Lặp Địa Điểm Tuyệt Đối (Visited Set Graph Algorithm):** Giải thuật kiểm soát tập đỉnh đã duyệt đảm bảo tỷ lệ trùng lặp địa điểm giữa các ngày đạt **0%**.
- 📸 **Thư Viện Khám Phá Địa Phương 100% Ảnh Thực Tế:** Hơn 80+ địa danh thắng cảnh, ẩm thực đặc sản, quán cafe và khách sạn nghỉ dưỡng tại 9 tỉnh Miền Trung kèm hình ảnh chất lượng cao và địa chỉ chuẩn xác.
- 📱 **Giao Diện App-First Đa Nền Tảng & Bộ Giả Lập Điện Thoại:** Hỗ trợ 5 Tab chức năng mượt mà và chế độ chuyển đổi khung điện thoại (\en{Phone Simulator Frame}) tiện lợi.
- 💸 **Công Cụ Chia Tiền Nhóm (Group Bill Splitter):** Kê khai nhiều khoản chi tiêu (khách sạn, ăn uống, vé tham quan, xăng xe) và tự động tính toán số tiền mỗi thành viên cần đóng.
- 🌧️ **Đổi Lịch Tránh Mưa Thông Minh (Weather Smart Re-scheduler):** Tự động hoán đổi các hoạt động ngoài trời sang địa điểm trong nhà khi gặp thời tiết xấu dựa trên dữ liệu khí tượng thời gian thực từ **Open-Meteo API**.
- 🎫 **Thẻ Vé Hành Trình Ngoại Tuyến (Offline Travel Pass):** Xuất vé điện tử dạng Boarding Pass có mã QR mô phỏng để chụp màn hình sử dụng khi mất kết nối mạng.
- 💬 **Trợ Lý AI Tư Vấn Du Lịch 24/7:** Khung chat trực tuyến giải đáp mọi thắc mắc về kinh nghiệm du lịch, văn hóa và ẩm thực bản địa.
- 🔐 **Hệ Thống Xác Thực & Quản Lý Chuyến Đi:** Đăng ký, đăng nhập bảo mật qua JWT và lưu trữ lịch sử chuyến đi trên MongoDB Atlas.

---

## 🗺️ Phạm Vi Dữ Liệu 9 Tỉnh Thành Miền Trung

| Tỉnh / Thành phố | Địa danh & Trải nghiệm tiêu biểu |
| :--- | :--- |
| **Đà Nẵng** | Bà Nà Hills, Cầu Vàng, Biển Mỹ Khê, Chùa Linh Ứng Sơn Trà, Đỉnh Bàn Cờ, Cầu Rồng, Mì Quảng, Quán Trần... |
| **Quảng Bình** | Động Phong Nha, Động Thiên Đường, Suối Moọc, Sông Chày Hang Tối (Zipline), Bãi Đá Nhảy, Cồn Cát Quang Phú... |
| **Hội An (Quảng Nam)** | Phố Cổ Hội An, Chùa Cầu, Rừng Dừa Bảy Mẫu, Thánh địa Mỹ Sơn, Bánh mì Madam Khánh, Cơm gà Bà Buổi... |
| **Huế (Thừa Thiên Huế)** | Đại Nội Cố Đô, Chùa Thiên Mụ, Lăng Khải Định, Lăng Tự Đức, Làng Hương Thủy Xuân, Bún bò Huế, Cafe Muối... |
| **Quy Nhơn (Bình Định)** | Eo Gió, Bãi biển Kỳ Co, Ghềnh Ráng Tiên Sa, Tháp Đôi Champa, Bánh xèo tôm nhảy Gia Vỹ, Surf Bar... |
| **Phú Yên** | Gành Đá Đĩa, Mũi Điện & Bãi Môn (Cực Đông đón bình minh), Tháp Nghinh Phong, Bãi Xép (Hoa Vàng Cỏ Xanh)... |
| **Nha Trang (Khánh Hòa)** | VinWonders & Cáp treo vượt biển, Tháp Bà Ponagar, Lặn ngắm san hô Hòn Mun, Nem nướng Đặng Văn Quyên... |
| **Đà Lạt (Lâm Đồng)** | Quảng trường Lâm Viên, Hồ Xuân Hương, Thác Datanla & Máng trượt, Lẩu gà lá é Tao Ngộ, Cafe Túi Mơ To... |
| **Gia Lai** | Biển Hồ T’Nưng (Đôi mắt Pleiku), Chùa Minh Thành, Phở hai tô Gia Lai (Phở khô Hồng)... |

---

## 🏗️ Kiến Trúc Hệ Thống (3-Tier Architecture)

```
[ FRONTEND CLIENT (Vue.js 3 + Vite SPA) ]
                  │
                  ▼ REST API (JSON)
[ BACKEND SERVER (Node.js + Express.js API) ]
   ├── JWT Auth & Route Handlers
   ├── Visited Set Graph Controller
   └── AI Prompt Engineering Service
         │                  │                  │
         ▼                  ▼                  ▼
[ Google Gemini AI ]  [ MongoDB Atlas ]  [ Open-Meteo Weather ]
(Gemini 2.5 Flash)    (Cloud Database)   (Realtime Telemetry)
```

---

## 🚀 Hướng Dẫn Cài Đặt \& Khởi Chạy

### 1. Yêu Cầu Môi Trường
- **Node.js:** Phiên bản $\ge 18.0.0$
- **npm:** Phiên bản $\ge 9.0.0$
- **MongoDB Atlas Connection URI**
- **Google Gemini API Key**

### 2. Cấu Hình Biến Môi Trường Backend
Tạo file `backend/.env`:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/travel_trips
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
JWT_SECRET=WanderWiseSecretKey2026
```

### 3. Khởi Chạy Ứng Dụng

#### 🔹 Khởi động Backend Server:
```bash
cd backend
npm install
npm start
# Server chạy tại: http://localhost:3000
```

#### 🔹 Khởi động Frontend App:
```bash
cd frontend
npm install
npm run dev
# Ứng dụng chạy tại: http://localhost:5173
```

---

## 📡 Danh Mục API Endpoints

| Phương thức | Đường dẫn Endpoint | Mô tả chức năng |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản người dùng mới |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản & nhận JWT Token |
| `GET` | `/api/places?destination={city}&type={type}` | Lấy danh sách địa điểm theo tỉnh thành |
| `POST` | `/api/ai/plan` | Tạo và sinh lịch trình du lịch thông minh bằng Gemini AI |
| `POST` | `/api/ai/replan` | Đổi lịch trình thích ứng tránh mưa |
| `POST` | `/api/ai/chat` | Chat tư vấn du lịch trực tuyến |
| `GET` | `/api/social/my-trips` | Lấy danh sách các chuyến đi đã lưu của người dùng |

---

## 👥 Nhóm Tác Giả \& Đồ Án Học Phần

- **Đồ án môn học:** Trí tuệ Nhân tạo (AIP202)
- **Đơn vị:** Khoa Công nghệ Thông tin — Trường Đại học Kiến trúc Đà Nẵng (DAU)
- **Sinh viên thực hiện:**
  1. **Trần Văn Nguyên**
  2. **Vũ Cao Khải**
- **Năm học:** 2025 -- 2026
