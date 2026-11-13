# 🌴 Travel Trips Central VietNam
### Hệ Thống Du Lịch & Lập Lịch Trình Thông Minh Miền Trung — Tây Nguyên

[![Vue.js](https://img.shields.io/badge/Frontend-Vue%203%20%7C%20Vite%205-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS%203.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/AI%20Core-Google%20Gemini%202.5%20Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Open-Meteo](https://img.shields.io/badge/Weather-Open--Meteo%20Live-FF9900?style=flat-square&logo=open-meteo&logoColor=white)](https://open-meteo.com/)

> Ứng dụng web đa nền tảng (*Tối ưu hiển thị cho cả Điện thoại di động & Máy tính PC*) hỗ trợ khách du lịch tự túc khám phá và tự động tạo lịch trình thông minh tại **11 tỉnh thành Duyên hải Miền Trung & Tây Nguyên**, tích hợp AI thế hệ mới và dữ liệu khí tượng thời gian thực.

---

## 👨‍🏫 THÔNG TIN ĐỒ ÁN

- **Học phần:** Đồ án Trí tuệ Nhân tạo (AIP202)
- **Đơn vị:** Khoa Công nghệ Thông tin — Trường Đại học Kiến trúc Đà Nẵng (DAU)
- **Giảng viên hướng dẫn:** **ThS. Đỗ Phúc Hảo**
- **Sinh viên thực hiện:**
  - **Vũ Cao Khải** (Lớp 23CT2)
  - **Trần Văn Nguyên** (Lớp 23CT2)
- **Năm học:** **2026 – 2027**

---

## 📖 GIỚI THIỆU ĐỀ TÀI

Du lịch tự túc (*FIT — Free Independent Travelers*) tại miền Trung và Tây Nguyên ngày càng phát triển nhưng du khách thường gặp khó khăn trong việc:
1. Mất nhiều ngày tìm kiếm thông tin phân tán để lên kế hoạch đi lại.
2. Lộ trình di chuyển dễ bị "nhảy cóc", zic-zac giữa các điểm xa nhau, tốn kém thời gian và tiền bạc.
3. Thời tiết miền Trung thất thường (mưa dông nhiệt đới), lịch trình ngoài trời dễ bị vỡ kế hoạch.
4. Quản lý chi tiêu nhóm phức tạp, khó chia tiền công bằng.

**Travel Trips Central VietNam** ra đời nhằm giải quyết toàn diện các vấn đề trên, mang lại trải nghiệm du lịch số hóa mượt mà:
- ⚡ **Lên lịch trình tự động trong ~1.3 giây** bằng Google Gemini 2.5 Flash, tối ưu theo ngân sách và sở thích.
- 🎯 **Không trùng lặp địa điểm (0%)** và lộ trình được phân cụm theo ngày, di chuyển tịnh tiến liên tục.
- 🌧️ **Tự động đổi lịch tránh mưa** khi thời tiết xấu nhờ kết nối vệ tinh khí tượng Open-Meteo.
- 📱 **Đồng hành trực tiếp trên đường đi** với chế độ Live Companion (GPS, chỉ đường, check-in, đối soát chi phí).

---

## ✨ TÍNH NĂNG NỔI BẬT

### 1. 🔍 Khám Phá 11 Tỉnh Thành (Explore Tab)
- Số hóa hơn **523+ địa điểm du lịch thực tế** trên 11 tỉnh thành miền Trung & Tây Nguyên (Đà Nẵng, Quảng Nam, Quảng Trị, Quảng Bình, Thừa Thiên Huế, Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Ngãi, Bình Định, Khánh Hòa, Phú Yên, Lâm Đồng, Gia Lai, Kon Tum, Đắk Lắk, Đắk Nông).
- Phân chia thành 4 nhóm rõ ràng: 🏛️ **Thắng cảnh** | 🍜 **Ẩm thực đặc sản** | 🏨 **Khách sạn** | ☕ **Quán cafe chill**.
- **Thẻ thời tiết 3D Glassmorphism:** Hiển thị nhiệt độ, sức gió, độ ẩm và dự báo mưa theo thời gian thực.
- **Tìm kiếm toàn cục siêu nhanh (`Ctrl + K`):** Gõ từ khóa để tìm ngay bất kỳ điểm đến, món ăn hay quán cafe nào.
- Nghe nhạc nền quê hương miền Trung êm dịu tạo cảm hứng khi lên kế hoạch.

### 2. 🤖 Lên Lịch Trình Tự Động Bằng AI (Planner Tab)
- **Trình hướng dẫn 4 bước:** Chọn Điểm đến $\rightarrow$ Số ngày (1 – 7 ngày) $\rightarrow$ Ngân sách & Số người $\rightarrow$ Sở thích & Ghi chú riêng.
- **Tối ưu hóa thông minh:**
  - AI sắp xếp các hoạt động logic theo buổi: Sáng – Trưa – Tối.
  - Phân cụm địa lý theo khu vực lân cận, không bị di chuyển ngược đường.
  - Đảm bảo **0% trùng lặp** điểm đến giữa các ngày.
- **Bản đồ trực quan (Leaflet):** Cắm mốc (Marker) lộ trình từng ngày và hỗ trợ 1-chạm mở chỉ đường Google Maps.
- **Đổi điểm lẻ linh hoạt (`Change Place`):** Dễ dàng thay thế một điểm bất kỳ trong lịch trình bằng điểm lân cận cùng loại mà không cần tạo lại cả chuyến đi.

### 3. 🌧️ Đổi Lịch Tránh Mưa Thông Minh
- Khi phát hiện điểm đến có mưa lớn từ dữ liệu vệ tinh Open-Meteo, hệ thống sẽ đưa ra cảnh báo.
- Du khách chỉ cần nhấn **"Đổi lịch tránh mưa"**, hệ thống sẽ tự động thay các hoạt động ngoài trời bằng các điểm đến trong nhà thú vị (bảo tàng, xưởng gốm, cafe ngắm mưa, di tích có mái che).

### 4. 🧭 Chế Độ Đồng Hành Thực Tế (Live Trip Companion)
- Chuyển giao diện sang chế độ theo dõi trực tiếp khi bắt đầu đi:
  - Bản đồ GPS bám sát vị trí thực địa.
  - Thẻ nhắc **"Điểm đến tiếp theo"** và thời gian gợi ý.
  - Thanh tiến trình thể hiện % hành trình đã hoàn thành.
  - Nút **"Check-in"** kèm hộp thoại nhập chi phí phát sinh thực tế để kiểm soát ví tiền.

### 5. 💸 Tiện Ích Du Lịch Thông Minh
- 📊 **Máy tính chia tiền nhóm (Bill Splitter):** Tự động tính toán số tiền mỗi thành viên cần trả/nhận lại, minh bạch tuyệt đối.
- 🎨 **Xuất Infographic chuyến đi:** Tải về thẻ ảnh tóm tắt lịch trình đẹp mắt để đăng story Facebook, Instagram, Zalo.
- 🎫 **Thẻ vé QR Offline & In vé PDF:** Lưu thẻ Boarding Pass kèm mã QR để sử dụng thuận tiện ngay cả khi mất sóng điện thoại 4G.

### 6. 👤 Hồ Sơ Cá Nhân & Cấp Bậc Phượt Thủ
- Đổi ảnh đại diện trực tiếp (ảnh được nén tự động qua HTML5 Canvas giúp tải trang cực nhanh).
- Hệ thống danh hiệu Gamification: 🌱 *Tân binh* $\rightarrow$ 🎒 *Tín đồ mê xê dịch* $\rightarrow$ 🚀 *Dân phượt chính hiệu* $\rightarrow$ 👑 *Chuyên gia du lịch*.
- Quản lý danh sách địa điểm thả tim yêu thích.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Thành phần | Công nghệ | Chi tiết sử dụng |
| :--- | :--- | :--- |
| **Frontend** | **Vue 3** (Composition API, `<script setup>`) | Giao diện hiện đại, phản hồi tức thì, cấu trúc Component rõ ràng |
| **Công cụ Build**| **Vite 5** | Tốc độ biên dịch siêu tốc, nén mã nguồn tối ưu |
| **Styling** | **Tailwind CSS 3.4** | Thiết kế Responsive chuẩn Mobile App-First và PC Desktop |
| **Bản đồ** | **Leaflet / OpenStreetMap** | Bản đồ số tương tác, vẽ đường đi, định vị GPS |
| **Backend** | **Node.js & Express.js** | Máy chủ RESTful API kiến trúc phân tầng (Router - Controller - Service) |
| **Cơ sở dữ liệu** | **MongoDB Atlas Cloud** | Lưu trữ đám mây phân tán, lập chỉ mục tốc độ cao |
| **Trí tuệ nhân tạo**| **Google Gemini 2.5 Flash** | Xử lý ngôn ngữ tự nhiên, sinh lịch trình JSON trong ~1.3s |
| **Dịch vụ Thời tiết**| **Open-Meteo API** | Dữ liệu khí tượng thời gian thực miễn phí, không giới hạn |
| **Xác thực** | **JWT & Bcrypt.js** | Bảo mật thông tin tài khoản và băm mật khẩu 10 vòng |
| **Dữ liệu & Cào** | **Puppeteer & Wikipedia REST API** | Thu thập tự động hình ảnh thật, tọa độ GPS và thông tin du lịch |

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (QUICK START)

Thầy và các bạn có thể cài đặt và chạy thử dự án trên máy cá nhân theo các bước đơn giản dưới đây:

### 1. Yêu cầu môi trường
- Máy tính đã cài **Node.js** (Khuyên dùng phiên bản $\ge 18.0.0$) $\rightarrow$ [Tải Node.js tại đây](https://nodejs.org/)
- Trình quản lý gói **npm** (đi kèm Node.js)
- Trình duyệt web hiện đại (Google Chrome, Microsoft Edge, Brave, v.v.)

---

### 2. Tải mã nguồn về máy
Mở Terminal / PowerShell và clone dự án (hoặc tải tệp ZIP giải nén):

```bash
git clone https://github.com/your-username/Travel_Trips_Central_VietNam.git
cd Travel_Trips_Central_VietNam
```

---

### 3. Cấu hình biến môi trường (`.env`)
Kiểm tra hoặc tạo tệp `.env` tại thư mục `backend/.env` với nội dung mẫu:

```env
PORT=3000

# Kết nối cơ sở dữ liệu MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai-travel?retryWrites=true&w=majority

# Khóa API Google Gemini AI (Lấy miễn phí tại Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Khóa bí mật mã hóa JWT phiên đăng nhập
JWT_SECRET=your_jwt_secret_key_here
```

> 💡 **Ghi chú:** Cơ sở dữ liệu MongoDB Atlas đã được nạp sẵn toàn bộ dữ liệu 11 tỉnh thành, người dùng không cần cài đặt MongoDB cục bộ trên máy.

---

### 4. Khởi chạy hệ thống (2 bước)

Dự án gồm 2 phần độc lập: **Backend** (Máy chủ API) và **Frontend** (Giao diện người dùng).

#### 🔹 Bước 1: Khởi động Backend
Mở một cửa sổ Terminal (cửa sổ thứ nhất):

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các gói thư viện
npm install

# Khởi động máy chủ API
npm start
```

Sau khi chạy thành công, Terminal sẽ hiển thị:
```text
🚀 Server is running on port 3000
📦 MongoDB Connected successfully!
⚡ RAM Cache: Loaded 523 places into memory
```
👉 Máy chủ Backend chạy tại: `http://localhost:3000`

---

#### 🔹 Bước 2: Khởi động Frontend
Mở một cửa sổ Terminal thứ hai (song song với cửa sổ Backend):

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các gói thư viện
npm install

# Khởi động máy chủ giao diện
npm run dev
```

Sau khi chạy thành công, Terminal sẽ hiển thị:
```text
  VITE v5.4.x  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
👉 Mở trình duyệt web và truy cập: **`http://localhost:5173`** để trải nghiệm ứng dụng.

---

## 🎯 KỊCH BẢN TRẢI NGHIỆM NHANH (DÀNH CHO THẦY & NGƯỜI CHẤM)

Để kiểm thử nhanh toàn bộ các tính năng cốt lõi của đề tài:

1. **Khám phá điểm đến:**
   - Tại trang chủ, chọn tỉnh thành (ví dụ: *Đà Nẵng* hoặc *Quảng Bình*).
   - Thử lọc qua các tab: Thắng cảnh, Quán ăn, Khách sạn, Cafe.
   - Thử nhấn tổ hợp phím **`Ctrl + K`** và gõ `"bánh mì"` hoặc `"biển"` để thấy tốc độ tìm kiếm tức thì.

2. **Lập lịch trình bằng AI:**
   - Chuyển sang tab **"Lên lịch"**.
   - Chọn điểm đến: **Đà Nẵng**, số ngày: **3 ngày**, ngân sách: **Tiêu chuẩn**, sở thích: **Check-in sống ảo, Ẩm thực**.
   - Bấm **"Tạo lịch trình AI"** $\rightarrow$ Hệ thống sẽ xử lý và hiển thị lịch trình chi tiết Sáng - Trưa - Tối kèm bản đồ chỉ sau khoảng **1.3 giây**.
   - Thử bấm nút **"Đổi điểm"** trên một địa điểm bất kỳ trong Timeline để kiểm tra tính năng hoán đổi linh hoạt.

3. **Thử nghiệm tính năng Đổi lịch tránh mưa:**
   - Bấm vào biểu tượng thời tiết hoặc nút **"Đổi lịch tránh mưa"** trên lịch trình để quan sát AI tự động thay thế các hoạt động ngoài trời bằng địa điểm trong nhà.

4. **Trải nghiệm Chế độ Đồng hành (Live Trip Companion):**
   - Bấm nút **"Bắt đầu chuyến đi"** để chuyển sang giao diện Split-Screen dẫn đường.
   - Bấm nút **"Check-in"** và thử nhập số tiền đã chi để kiểm tra thanh tiến độ và bảng cân đối tài chính.

5. **Xuất vé & Chia tiền nhóm:**
   - Bấm biểu tượng **"Chia tiền"** để mở công cụ Bill Splitter nhập chi phí của nhóm bạn.
   - Bấm **"Xuất vé QR"** hoặc **"Xuất Infographic"** để tải thẻ ảnh lịch trình.

---

## 📁 CẤU TRÚC DỰ ÁN

```text
Travel_Trips_Central_VietNam/
│
├── backend/                             # Máy chủ Backend (Node.js & Express)
│   ├── crawler/                         # Bộ cào dữ liệu tự hành đa tầng
│   ├── middleware/                      # Xác thực JWT (auth.js)
│   ├── models/                          # Mô hình dữ liệu Mongoose (Place, Trip, User)
│   ├── routes/                          # Các API routes (ai.js, places.js, auth.js, weather.js)
│   ├── scripts/                         # Các kịch bản nạp và cào dữ liệu (seed, enrich)
│   ├── services/                        # Xử lý lõi Gemini AI, thuật toán K-Means++, TSP Tour
│   ├── .env                             # Cấu hình kết nối MongoDB & Gemini API Key
│   ├── package.json                     # Danh sách thư viện Backend
│   └── server.js                        # Điểm khởi chạy chính của Backend
│
├── frontend/                            # Giao diện người dùng (Vue 3 & Vite)
│   ├── src/
│   │   ├── assets/                      # Hình ảnh, biểu tượng SVG, âm thanh
│   │   ├── components/
│   │   │   ├── common/                  # Tìm kiếm Ctrl+K, hiệu ứng chiêm tinh
│   │   │   ├── home/                    # Tab Khám phá, Thẻ thời tiết 3D
│   │   │   ├── planner/                 # Wizard lập lịch AI, Timeline, Chế độ Live Companion
│   │   │   ├── trips/                   # Danh sách chuyến đi đã lưu, xem chi tiết
│   │   │   ├── modals/                  # Hộp thoại: Chia tiền, Đổi điểm, Tránh mưa, In vé PDF
│   │   │   ├── MapComponent.vue         # Bản đồ số tương tác Leaflet
│   │   │   └── UserProfile.vue          # Hồ sơ cá nhân & Cấp bậc phượt thủ
│   │   ├── App.vue                      # Giao diện chính đa màn hình
│   │   └── main.js                      # Điểm khởi tạo ứng dụng Vue 3
│   ├── index.html                       # Tệp HTML khởi đầu
│   ├── package.json                     # Danh sách thư viện Frontend
│   └── vite.config.js                   # Cấu hình Vite
│
├── Bao_cao/                             # Toàn bộ mã nguồn Báo cáo Đồ án LaTeX (DAU)
│   ├── chuong/                          # 5 chương báo cáo chuẩn quy cách học phần
│   ├── do-an.tex                        # Tệp tài liệu chính LaTeX
│   └── DAU_Bao_Cao_SIEU_NHANH_DA_FIX.zip# Tệp nén hoàn chỉnh sẵn sàng nộp và in ấn
│
└── README.md                            # Tài liệu giới thiệu và hướng dẫn dự án
```

---

## 📞 LIÊN HỆ & BẢN QUYỀN

Đồ án được phát triển phục vụ học tập và nghiên cứu trong khuôn khổ môn học **Trí tuệ Nhân tạo** tại **Trường Đại học Kiến trúc Đà Nẵng (DAU)**.

Mọi ý kiến đóng góp hoặc thắc mắc về mã nguồn, xin vui lòng liên hệ:
- **Sinh viên:** Vũ Cao Khải & Trần Văn Nguyên (Lớp 23CT2)
- **Khoa:** Công nghệ Thông tin — Trường Đại học Kiến trúc Đà Nẵng
- **Email:** `sinhvien@dau.edu.vn`

---

<p align="center">
  <b>ĐẠI HỌC KIẾN TRÚC ĐÀ NẴNG — KHOA CÔNG NGHỆ THÔNG TIN</b><br>
  <i>Đà Nẵng, Năm học 2026 – 2027</i>
</p>
