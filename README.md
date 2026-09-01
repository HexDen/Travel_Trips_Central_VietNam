# 🌴 WanderWise — AI Travel Assistant for Central Vietnam

[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **WanderWise** là ứng dụng du lịch thông minh đa nền tảng (_App-First: Mobile & PC Desktop_) ứng dụng Trí tuệ Nhân tạo tạo sinh (_Generative AI_) kết hợp cơ sở dữ liệu số hóa phong phú để hỗ trợ khách du lịch tự túc khám phá và lập lịch trình tối ưu tại **9 tỉnh/thành phố Miền Trung Việt Nam**.

---

## 📑 Bảng Đặc Tả Yêu Cầu Phần Mềm (SRS — Software Requirements Specification)

Hệ thống tuân thủ chặt chẽ tài liệu đặc tả yêu cầu kỹ thuật phần mềm chuẩn IEEE 830:

### 1. Bảng Đặc Tả Yêu Cầu Chức Năng (Functional Requirements — FR)

|   Mã YC   | Tên Chức Năng                               | Tác Nhân (Actor)  |     Mức Độ Ưu Tiên     | Mô Tả Kỹ Thuật Chi Tiết                                                                                                                                                            |
| :-------: | :------------------------------------------ | :---------------: | :--------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-01** | **Xác thực Người dùng (Auth)**              |       User        |  🔴 Bắt buộc (_High_)  | Đăng ký, đăng nhập email/mật khẩu mã hóa `bcryptjs` (salt rounds = 10), cấp phát và quản lý phiên bảo mật bằng `JWT (JSON Web Token)`.                                             |
| **FR-02** | **Khám phá Địa phương (Explore)**           |       User        |  🔴 Bắt buộc (_High_)  | Tra cứu danh lam thắng cảnh 9 tỉnh Miền Trung, bộ lọc 4 danh mục (`attraction`, `restaurant`, `cafe`, `hotel`), xem ảnh thực tế HD, rating và nút `+ Lên lịch trình` 1-click.      |
| **FR-03** | **Lập Lịch Thông Minh (AI Planner)**        |  User, AI Engine  |  🔴 Bắt buộc (_High_)  | Nhận tham số (Điểm đến, số ngày 1--7, ngân sách, số người, địa điểm yêu thích), gọi Google Gemini 2.5 Flash sinh lịch trình JSON phân bổ theo mốc giờ (Sáng - Trưa - Chiều - Tối). |
| **FR-04** | **Chống Trùng Lặp Địa Điểm**                |  Backend Engine   |  🔴 Bắt buộc (_High_)  | Giải thuật `Visited Set Graph` theo dõi các địa danh đã duyệt, đảm bảo tỷ lệ trùng lặp địa điểm giữa các ngày đạt **0% tuyệt đối**.                                                |
| **FR-05** | **Đổi Lịch Tránh Mưa (Weather Re-plan)**    | User, Weather API | 🟡 Nâng cao (_Medium_) | Tích hợp dữ liệu khí tượng thời gian thực từ `Open-Meteo API`, tự động hoặc 1-click hoán đổi các hoạt động ngoài trời sang địa điểm trong nhà khi trời mưa.                        |
| **FR-06** | **Chia Tiền Nhóm (Bill Splitter)**          |       User        | 🟡 Nâng cao (_Medium_) | Bảng kê khai nhiều khoản chi tiêu (khách sạn, ăn uống, vé thắng cảnh, xăng xe), tự động tính toán tổng chi phí và số tiền bình quân mỗi thành viên cần đóng.                       |
| **FR-07** | **Thẻ Vé Hành Trình Offline (Travel Pass)** |       User        |  🟢 Tiện ích (_Low_)   | Kết xuất thông tin chuyến đi thành thẻ vé điện tử (_Boarding Pass_) có mã QR mô phỏng để chụp màn hình lưu trữ sử dụng khi mất kết nối mạng.                                       |
| **FR-08** | **Trợ Lý Ảo Du Lịch (AI Chat)**             |  User, AI Engine  | 🟡 Nâng cao (_Medium_) | Khung chat thời gian thực giải đáp mọi thắc mắc về kinh nghiệm du lịch, phong tục tập quán và đặc sản bản địa 24/7.                                                                |
| **FR-09** | **Quản Lý Chuyến Đi (My Trips)**            |       User        |  🔴 Bắt buộc (_High_)  | Lưu trữ lịch sử chuyến đi vào MongoDB Atlas, hỗ trợ xem lại, xóa hoặc chia sẻ liên kết lịch trình.                                                                                 |

---

### 2. Bảng Đặc Tả Yêu Cầu Phi Chức Năng (Non-Functional Requirements — NFR)

| Tiêu Chuẩn (FURPS+)                  | Chỉ Số Mục Tiêu                                                                                 | Giải Pháp Kỹ Thuật Đáp Ứng                                                                                                                                                                       |
| :----------------------------------- | :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hiệu năng (Performance)**          | - Tải trang ban đầu: $< 0.8$s<br>- AI sinh lịch trình: $< 2.0$s<br>- Truy vấn MongoDB: $< 80$ms | - Sử dụng Vite đóng gói nén mã nguồn (Gzip minification)<br>- Tối ưu hóa mô hình Google Gemini 2.5 Flash phản hồi nhanh<br>- Đánh chỉ mục (Indexing) trường `destination` và `type` trên MongoDB |
| **Độ tin cậy (Reliability)**         | - Tính sẵn sàng: $\ge 99.8\%$<br>- Tỷ lệ trùng lặp địa điểm: $0\%$                              | - Cụm cơ sở dữ liệu đám mây MongoDB Atlas Cluster phân tán<br>- Giải thuật `Visited Set Graph` kiểm soát dữ liệu đầu ra                                                                          |
| **Bảo mật (Security)**               | - Bảo vệ thông tin tài khoản<br>- Chống truy cập trái phép                                      | - Mật khẩu băm một chiều qua thuật toán `bcryptjs`<br>- Xác thực phân quyền các API nhạy cảm bằng `Bearer JWT Header`                                                                            |
| **Khả năng sử dụng (Usability)**     | - Tương thích Mobile \& PC<br>- Thao tác 1 chạm tiện lợi                                        | - Triết lý thiết kế App-First, hỗ trợ chế độ giả lập điện thoại (_Phone Simulator Frame_) và Bottom Navigation 5 Tab                                                                             |
| **Tính tương thích (Compatibility)** | - Mọi trình duyệt và hệ điều hành                                                               | - Tương thích Google Chrome, Safari, Microsoft Edge, Firefox trên Windows, macOS, Android, iOS                                                                                                   |

---

### 3. Ma Trận Truy Xuất Yêu Cầu (Requirements Traceability Matrix — RTM)

| Mã Yêu Cầu | Giao Diện (Frontend)                     | API Endpoint (Backend)                              | Dữ Liệu (MongoDB Model) | Kịch Bản Kiểm Thử |
| :--------: | :--------------------------------------- | :-------------------------------------------------- | :---------------------: | :---------------: |
| **FR-01**  | Tab Profile (Form Auth)                  | `POST /api/auth/register`<br>`POST /api/auth/login` |        `User.js`        |    TC-AUTH-01     |
| **FR-02**  | Tab Khám phá (`activeTab === 'explore'`) | `GET /api/places?destination=...`                   |       `Place.js`        |   TC-EXPLORE-01   |
| **FR-03**  | Tab Lên lịch (`activeTab === 'planner'`) | `POST /api/ai/plan`                                 |        `Trip.js`        |    TC-PLAN-01     |
| **FR-04**  | Dòng thời gian Timeline                  | `services/aiService.js`                             |       `Place.js`        | TC-NON-REPEAT-01  |
| **FR-05**  | Nút `🌧️ Đổi lịch tránh mưa`              | `POST /api/ai/replan`                               |  `Trip.js`, Open-Meteo  |   TC-WEATHER-01   |
| **FR-06**  | Modal `💸 Chia tiền nhóm`                | `frontend/src/App.vue` (Local Engine)               |        `Trip.js`        |    TC-SPLIT-01    |
| **FR-07**  | Modal `🎫 Thẻ hành trình Offline`        | `frontend/src/App.vue` (QR Renderer)                |        `Trip.js`        |    TC-PASS-01     |
| **FR-08**  | Tab Trợ lý AI (`activeTab === 'ai'`)     | `POST /api/ai/chat`                                 |     Gemini Session      |    TC-CHAT-01     |
| **FR-09**  | Tab Chuyến đi (`activeTab === 'saved'`)  | `GET /api/social/my-trips`                          |        `Trip.js`        |    TC-TRIP-01     |

---

## 🌟 Các Tính Năng Cốt Lõi

- 🧭 **Lập Lịch Trình Tự Động Bằng AI (Smart AI Planner):** Sinh lịch trình chi tiết từng mốc thời gian (Sáng, Trưa, Khách sạn, Cafe, Tối) thích ứng theo số ngày (1--7 ngày), ngân sách, số lượng người và sở thích cá nhân.
- 🚫 **Chống Trùng Lặp Địa Điểm Tuyệt Đối (Visited Set Graph Algorithm):** Giải thuật kiểm soát tập đỉnh đã duyệt đảm bảo tỷ lệ trùng lặp địa điểm giữa các ngày đạt **0%**.
- 📸 **Thư Viện Khám Phá Địa Phương 100% Ảnh Thực Tế:** Hơn 80+ địa danh thắng cảnh, ẩm thực đặc sản, quán cafe và khách sạn nghỉ dưỡng tại 9 tỉnh Miền Trung kèm hình ảnh chất lượng cao và địa chỉ chuẩn xác.
- 📱 **Giao Diện App-First Đa Nền Tảng & Bộ Giả Lập Điện Thoại:** Hỗ trợ 5 Tab chức năng mượt mà và chế độ chuyển đổi khung điện thoại (_Phone Simulator Frame_) tiện lợi.
- 💸 **Công Cụ Chia Tiền Nhóm (Group Bill Splitter):** Kê khai nhiều khoản chi tiêu (khách sạn, ăn uống, vé tham quan, xăng xe) và tự động tính toán số tiền mỗi thành viên cần đóng.
- 🌧️ **Đổi Lịch Tránh Mưa Thông Minh (Weather Smart Re-scheduler):** Tự động hoán đổi các hoạt động ngoài trời sang địa điểm trong nhà khi gặp thời tiết xấu dựa trên dữ liệu khí tượng thời gian thực từ **Open-Meteo API**.
- 🎫 **Thẻ Vé Hành Trình Ngoại Tuyến (Offline Travel Pass):** Xuất vé điện tử dạng Boarding Pass có mã QR mô phỏng để chụp màn hình sử dụng khi mất kết nối mạng.
- 💬 **Trợ Lý AI Tư Vấn Du Lịch 24/7:** Khung chat trực tuyến giải đáp mọi thắc mắc về kinh nghiệm du lịch, văn hóa và ẩm thực bản địa.
- 🔐 **Hệ Thống Xác Thực & Quản Lý Chuyến Đi:** Đăng ký, đăng nhập bảo mật qua JWT và lưu trữ lịch sử chuyến đi trên MongoDB Atlas.

---

## 🗺️ Phạm Vi Dữ Liệu 9 Tỉnh Thành Miền Trung

| Tỉnh / Thành phố          | Địa danh & Trải nghiệm tiêu biểu                                                                             |
| :------------------------ | :----------------------------------------------------------------------------------------------------------- |
| **Đà Nẵng**               | Bà Nà Hills, Cầu Vàng, Biển Mỹ Khê, Chùa Linh Ứng Sơn Trà, Đỉnh Bàn Cờ, Cầu Rồng, Mì Quảng, Quán Trần...     |
| **Quảng Bình**            | Động Phong Nha, Động Thiên Đường, Suối Moọc, Sông Chày Hang Tối (Zipline), Bãi Đá Nhảy, Cồn Cát Quang Phú... |
| **Hội An (Quảng Nam)**    | Phố Cổ Hội An, Chùa Cầu, Rừng Dừa Bảy Mẫu, Thánh địa Mỹ Sơn, Bánh mì Madam Khánh, Cơm gà Bà Buổi...          |
| **Huế (Thừa Thiên Huế)**  | Đại Nội Cố Đô, Chùa Thiên Mụ, Lăng Khải Định, Lăng Tự Đức, Làng Hương Thủy Xuân, Bún bò Huế, Cafe Muối...    |
| **Quy Nhơn (Bình Định)**  | Eo Gió, Bãi biển Kỳ Co, Ghềnh Ráng Tiên Sa, Tháp Đôi Champa, Bánh xèo tôm nhảy Gia Vỹ, Surf Bar...           |
| **Phú Yên**               | Gành Đá Đĩa, Mũi Điện & Bãi Môn (Cực Đông đón bình minh), Tháp Nghinh Phong, Bãi Xép (Hoa Vàng Cỏ Xanh)...   |
| **Nha Trang (Khánh Hòa)** | VinWonders & Cáp treo vượt biển, Tháp Bà Ponagar, Lặn ngắm san hô Hòn Mun, Nem nướng Đặng Văn Quyên...       |
| **Đà Lạt (Lâm Đồng)**     | Quảng trường Lâm Viên, Hồ Xuân Hương, Thác Datanla & Máng trượt, Lẩu gà lá é Tao Ngộ, Cafe Túi Mơ To...      |
| **Gia Lai**               | Biển Hồ T’Nưng (Đôi mắt Pleiku), Chùa Minh Thành, Phở hai tô Gia Lai (Phở khô Hồng)...                       |

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

| Phương thức | Đường dẫn Endpoint                           | Mô tả chức năng                                          |
| :---------- | :------------------------------------------- | :------------------------------------------------------- |
| `POST`      | `/api/auth/register`                         | Đăng ký tài khoản người dùng mới                         |
| `POST`      | `/api/auth/login`                            | Đăng nhập tài khoản & nhận JWT Token                     |
| `GET`       | `/api/places?destination={city}&type={type}` | Lấy danh sách địa điểm theo tỉnh thành                   |
| `POST`      | `/api/ai/plan`                               | Tạo và sinh lịch trình du lịch thông minh bằng Gemini AI |
| `POST`      | `/api/ai/replan`                             | Đổi lịch trình thích ứng tránh mưa                       |
| `POST`      | `/api/ai/chat`                               | Chat tư vấn du lịch trực tuyến                           |
| `GET`       | `/api/social/my-trips`                       | Lấy danh sách các chuyến đi đã lưu của người dùng        |

---

## 👥 Nhóm Tác Giả \& Đồ Án Học Phần

- **Đồ án môn học:** Trí tuệ Nhân tạo (AIP202)
- **Đơn vị:** Khoa Công nghệ Thông tin — Trường Đại học Kiến trúc Đà Nẵng (DAU)
- **Sinh viên thực hiện:**
  1. **Trần Văn Nguyên**
  2. **Vũ Cao Khải**
- **Năm học:** 2025 -- 2026
