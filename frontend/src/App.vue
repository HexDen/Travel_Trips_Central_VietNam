<template>
  <div :class="['app-root', { 'mobile-frame-mode': isMobileFrame }]">
    <!-- KHUNG ĐIỆN THOẠI NẾU BẬT CHẾ ĐỘ GIẢ LẬP MOBILE TRÊN PC -->
    <div class="app-container">
      
      <!-- TOP HEADER CỦA APP -->
      <header class="app-header">
        <div class="header-brand" @click="activeTab = 'explore'">
          <span class="app-logo-icon">✈</span>
          <div class="brand-text">
            <h1>Travel Trips</h1>
            <small>AI Travel App · Central VietNam</small>
          </div>
        </div>

        <div class="header-actions">
          <!-- Nút chuyển đổi giao diện giả lập Mobile / Desktop -->
          <button
            type="button"
            class="mode-toggle-btn"
            @click="isMobileFrame = !isMobileFrame"
            :title="isMobileFrame ? 'Mở rộng toàn màn hình PC' : 'Thu nhỏ xem khung Mobile App'"
          >
            <span>{{ isMobileFrame ? '💻 Bản PC' : '📱 Giả lập App' }}</span>
          </button>

          <!-- Nút tài khoản -->
          <button v-if="nguoiDung" class="user-chip-btn" @click="activeTab = 'profile'">
            <span class="user-avatar">{{ nguoiDung.name ? nguoiDung.name[0].toUpperCase() : 'U' }}</span>
            <span class="user-name">{{ nguoiDung.name }}</span>
          </button>
          <button v-else class="login-header-btn" @click="hienAuthModal = true">
            <span>Đăng nhập</span>
          </button>
        </div>
      </header>

      <!-- KHÔNG GIAN NỘI DUNG CHÍNH (THEO TỪNG TAB APP) -->
      <main class="app-main">

        <!-- ==================== TAB 1: KHÁM PHÁ (EXPLORE) ==================== -->
        <section v-if="activeTab === 'explore'" class="tab-pane">
          <!-- Banner Hero App -->
          <div class="app-hero-card">
            <div class="hero-content">
              <span class="hero-badge">AI TRAVEL ASSISTANT</span>
              <h2>Khám phá Miền Trung trọn vẹn</h2>
              <p>Lên kế hoạch thông minh, gợi ý quán ngon đặc sản & dẫn đường chuẩn xác 100%.</p>
              <button class="hero-cta-btn" @click="activeTab = 'planner'">
                <span>Lên lịch trình ngay</span>
                <strong>→</strong>
              </button>
            </div>
          </div>

          <!-- Thanh chọn nhanh Tỉnh/Thành phố dạng Thẻ Ảnh -->
          <div class="explore-section">
            <div class="section-title-row">
              <h3>Điểm đến nổi tiếng</h3>
              <span class="badge-count">{{ centralCities.length }} Tỉnh/TP</span>
            </div>
            <div class="cities-carousel">
              <button
                v-for="city in centralCities"
                :key="city.name"
                :class="['city-card-btn', { active: formDuLieu.diemDen === city.name }]"
                @click="chonDiemDenExplore(city.name)"
                :style="{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15,23,42,0.85) 100%), url(${city.image})` }"
              >
                <span class="city-icon">{{ city.icon }}</span>
                <span class="city-name">{{ city.name }}</span>
                <small class="city-tag">{{ city.tag }}</small>
              </button>
            </div>
          </div>

          <!-- Widget Thời tiết thời gian thực -->
          <div v-if="thoiTiet" class="app-weather-widget">
            <div class="weather-widget-header">
              <div>
                <span class="weather-label">THỜI TIẾT HIỆN TẠI</span>
                <h4>{{ thoiTiet.location.name }}</h4>
              </div>
              <div class="weather-temp-now">
                <span class="weather-icon-large">{{ bieuTuongThoiTiet(thoiTiet.current.weatherCode) }}</span>
                <strong>{{ Math.round(thoiTiet.current.temperature) }}°C</strong>
              </div>
            </div>
            <p class="weather-summary">
              <b>{{ moTaThoiTiet(thoiTiet.current.weatherCode) }}</b> · Cảm giác như {{ Math.round(thoiTiet.current.feelsLike) }}°C · Gió {{ thoiTiet.current.windSpeed }} km/h
            </p>
            <div class="weather-forecast-strip">
              <div v-for="day in thoiTiet.daily" :key="day.date" class="forecast-item">
                <small>{{ dinhDangNgay(day.date) }}</small>
                <span>{{ bieuTuongThoiTiet(day.weatherCode) }}</span>
                <b>{{ Math.round(day.max) }}°</b>
              </div>
            </div>
          </div>

          <!-- Danh sách địa điểm đặc sắc theo thành phố CÓ HÌNH ẢNH SỐNG ĐỘNG -->
          <div class="explore-section">
            <div class="section-title-row">
              <div>
                <h3>Địa điểm & Đặc sản tại {{ formDuLieu.diemDen }}</h3>
                <small class="sub-region-hint">(Khu vực mở rộng sau sáp nhập)</small>
              </div>
              <div class="filter-pills">
                <button
                  :class="['filter-pill', { active: filterExploreType === 'all' }]"
                  @click="filterExploreType = 'all'"
                >Tất cả</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'attraction' }]"
                  @click="filterExploreType = 'attraction'"
                >📸 Thắng cảnh</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'restaurant' }]"
                  @click="filterExploreType = 'restaurant'"
                >🍲 Đặc sản</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'cafe' }]"
                  @click="filterExploreType = 'cafe'"
                >☕ Cafe</button>
              </div>
            </div>

            <!-- Grid Thẻ Địa điểm CÓ HÌNH ẢNH NỔI BẬT -->
            <div v-if="filteredExplorePlaces.length" class="places-app-grid">
              <article v-for="place in filteredExplorePlaces" :key="place._id || place.name" class="app-place-card">
                <div class="place-img-cover" :style="{ backgroundImage: `url(${getPlaceImage(place)})` }">
                  <span :class="['place-card-type', 'type-' + place.type]">
                    {{ getPlaceTypeLabel(place.type) }}
                  </span>
                  <span class="place-img-rating">★ {{ place.rating || '4.8' }}</span>
                  <button
                    v-if="nguoiDung"
                    class="heart-action-btn"
                    :class="{ active: isFavorite(place._id) }"
                    @click.stop="doiYeuThich(place._id)"
                    title="Lưu yêu thích"
                  >
                    {{ isFavorite(place._id) ? '♥' : '♡' }}
                  </button>
                </div>
                <div class="place-card-content">
                  <h4>{{ place.name }}</h4>
                  <p class="place-card-desc">{{ place.description }}</p>
                  <p v-if="place.address" class="place-card-address">📍 {{ place.address }}</p>
                  <div class="place-card-bottom">
                    <button class="add-to-plan-btn" @click="themVaoLichTrinhVaMoPlanner(place.name)">
                      + Lên lịch trình
                    </button>
                    <a
                      class="place-maps-btn"
                      :href="chiDuongUrl(place.name, place.address)"
                      target="_blank"
                      rel="noreferrer"
                    >
                      🗺️ Chỉ đường
                    </a>
                  </div>
                </div>
              </article>
            </div>
            <p v-else class="empty-state-text">Đang tải địa điểm hoặc chưa có dữ liệu.</p>
          </div>
        </section>


        <!-- ==================== TAB 2: LẬP KẾ HOẠCH (PLANNER) ==================== -->
        <section v-if="activeTab === 'planner'" class="tab-pane">
          <!-- BƯỚC NHẬP THÔNG TIN KẾ HOẠCH -->
          <div class="planner-form-container">
            <div class="pane-header">
              <div>
                <span class="sub-heading">AI TRIP PLANNER</span>
                <h2>Thiết kế hành trình của bạn</h2>
              </div>
              <span class="planner-icon">✈</span>
            </div>

            <!-- Form fields -->
            <div class="app-form-grid">
              <!-- Chọn Thành phố -->
              <div class="app-field full-width">
                <label>Điểm đến du lịch</label>
                <div class="quick-city-selector">
                  <button
                    v-for="c in centralCities"
                    :key="c.name"
                    type="button"
                    :class="['city-select-pill', { active: formDuLieu.diemDen === c.name }]"
                    @click="chonNhanhDiemDen(c.name)"
                  >
                    {{ c.name }}
                  </button>
                </div>
              </div>

              <!-- Số ngày & Số người -->
              <div class="app-field">
                <label>Số ngày đi</label>
                <div class="stepper-input">
                  <button type="button" @click="formDuLieu.soNgay = Math.max(1, formDuLieu.soNgay - 1)">-</button>
                  <span>{{ formDuLieu.soNgay }} ngày</span>
                  <button type="button" @click="formDuLieu.soNgay++">+</button>
                </div>
              </div>

              <div class="app-field">
                <label>Số người</label>
                <div class="stepper-input">
                  <button type="button" @click="formDuLieu.soNguoi = Math.max(1, formDuLieu.soNguoi - 1)">-</button>
                  <span>{{ formDuLieu.soNguoi }} người</span>
                  <button type="button" @click="formDuLieu.soNguoi++">+</button>
                </div>
              </div>

              <!-- Ngân sách -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <label>Ngân sách dự kiến (VND)</label>
                  <strong class="budget-highlight">{{ dinhDangTien(formDuLieu.nganSach) }}đ</strong>
                </div>
                <input
                  type="range"
                  v-model.number="formDuLieu.nganSach"
                  min="1000000"
                  max="30000000"
                  step="500000"
                  class="budget-slider"
                />
              </div>

              <!-- Phương tiện & Khách sạn -->
              <div class="app-field">
                <label>Phương tiện di chuyển</label>
                <select v-model="formDuLieu.phuongTien" class="app-select">
                  <option value="xe máy">Xe máy</option>
                  <option value="ô tô">Ô tô / Xe du lịch</option>
                  <option value="máy bay">Máy bay + Thuê xe</option>
                  <option value="linh hoạt">Linh hoạt</option>
                </select>
              </div>

              <div class="app-field">
                <label>Yêu cầu khách sạn</label>
                <input
                  v-model="formDuLieu.yeuCauKhachSan"
                  class="app-input"
                  placeholder="Gần biển, có hồ bơi, yên tĩnh..."
                />
              </div>

              <!-- Sở thích -->
              <div class="app-field full-width">
                <label>Sở thích trải nghiệm</label>
                <input
                  v-model="chuoiSoThich"
                  class="app-input"
                  placeholder="Ăn uống đặc sản, ngắm cảnh biển, check-in sống ảo, di tích..."
                />
              </div>
            </div>

            <!-- BỘ CHỌN ĐỊA ĐIỂM & ĐẶC SẢN NỔI TIẾNG THEO THÀNH PHỐ -->
            <div v-if="places.length" class="places-picker-box">
              <div class="picker-top">
                <div>
                  <small class="picker-kicker">GỢI Ý ĐỊA PHƯƠNG · BẤM ĐỂ CHỌN</small>
                  <h4>Bạn muốn ghé địa điểm & quán ngon nào?</h4>
                </div>
                <span v-if="selectedPlaces.length" class="badge-selected-count">
                  ✓ Đã chọn {{ selectedPlaces.length }} điểm
                </span>
              </div>

              <!-- Nhóm Thắng cảnh -->
              <div v-if="attractionsList.length" class="picker-row">
                <span class="row-label">📸 Thắng cảnh:</span>
                <div class="chips-wrap">
                  <button
                    v-for="p in attractionsList"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status">{{ isPlaceSelected(p.name) ? '✓' : '+' }}</span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Nhóm Món ngon -->
              <div v-if="restaurantsList.length" class="picker-row">
                <span class="row-label">🍲 Quán đặc sản:</span>
                <div class="chips-wrap">
                  <button
                    v-for="p in restaurantsList"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status">{{ isPlaceSelected(p.name) ? '✓' : '+' }}</span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Nhóm Cafe -->
              <div v-if="cafesList.length" class="picker-row">
                <span class="row-label">☕ Quán Cafe:</span>
                <div class="chips-wrap">
                  <button
                    v-for="p in cafesList"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status">{{ isPlaceSelected(p.name) ? '✓' : '+' }}</span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Nút tạo lịch trình -->
            <button
              class="app-primary-btn submit-plan-btn"
              @click="taoLichTrinh"
              :disabled="dangTao"
            >
              <span v-if="dangTao" class="btn-spinner"></span>
              <span>{{ dangTao ? 'AI Đang thiết kế lịch trình tối ưu...' : '✨ Tạo Lịch Trình Thông Minh' }}</span>
            </button>
          </div>

          <!-- KẾT QUẢ LỊCH TRÌNH CHI TIẾT -->
          <div v-if="lichTrinh" class="plan-results-container">
            <!-- Thẻ tổng quan kết quả -->
            <div class="plan-summary-card">
              <div class="summary-meta">
                <span class="plan-dest-badge">{{ lichTrinh.destination }}</span>
                <h2>Hành trình {{ lichTrinh.daysList.length }} Ngày Tuyệt Vời</h2>
                <p class="summary-budget">Tổng dự toán: <strong>{{ dinhDangTien(lichTrinh.total_budget) }}đ</strong> ({{ lichTrinh.people }} người)</p>
              </div>

              <div class="plan-tool-actions">
                <button class="tool-btn" @click="hienBillSplitter = true" title="Tính tiền chia đều cho nhóm">
                  💸 Chia tiền nhóm
                </button>
                <button class="tool-btn" @click="hienTravelPass = true" title="Xuất vé hành trình offline">
                  🎫 Xuất vé Offline
                </button>
                <button class="tool-btn rain-btn" @click="dieuChinhTranhMua" :disabled="dangDieuChinh" title="Tự động đổi điểm tham quan trong nhà nếu trời mưa">
                  🌧️ Đổi lịch tránh mưa
                </button>
                <button class="tool-btn" @click="xuatPdf" title="In hoặc lưu PDF">
                  📄 Lưu PDF
                </button>
              </div>
            </div>

            <!-- Khách sạn đề xuất -->
            <div v-if="lichTrinh.hotel_recommendation" class="app-hotel-card">
              <div class="hotel-badge">🏨 GỢI Ý KHÁCH SẠN / RESORT NGHỈ DƯỠNG</div>
              <div class="hotel-main-info">
                <div>
                  <h3>{{ lichTrinh.hotel_recommendation.name }}</h3>
                  <p class="hotel-addr" v-if="lichTrinh.hotel_recommendation.address">📍 {{ lichTrinh.hotel_recommendation.address }}</p>
                  <p class="hotel-desc">{{ lichTrinh.hotel_recommendation.description }}</p>
                </div>
                <div class="hotel-side">
                  <span class="hotel-stars">★ {{ lichTrinh.hotel_recommendation.rating || '4.8' }}</span>
                  <span class="hotel-price">{{ dinhDangTien(lichTrinh.hotel_recommendation.price_per_night || 850000) }}đ<small>/đêm</small></span>
                  <a
                    class="hotel-maps-link"
                    :href="chiDuongUrl(lichTrinh.hotel_recommendation.name, lichTrinh.hotel_recommendation.address)"
                    target="_blank"
                    rel="noreferrer"
                  >
                    🗺️ Chỉ đường tới KS ↗
                  </a>
                </div>
              </div>
            </div>

            <!-- Tab chọn ngày & Bản đồ -->
            <div class="app-map-box">
              <div class="map-header">
                <h4>Bản đồ di chuyển</h4>
                <div class="day-switcher-pills">
                  <button
                    v-for="day in lichTrinh.daysList"
                    :key="day.day"
                    :class="['day-pill', { active: selectedDay === day.day }]"
                    @click="selectedDay = day.day"
                  >
                    Ngày {{ day.day }}
                  </button>
                </div>
              </div>
              <iframe class="app-map-iframe" :src="banDoEmbedUrl" title="Bản đồ" loading="lazy"></iframe>
            </div>

            <!-- Dòng thời gian từng ngày (Timeline) -->
            <div class="app-timeline-wrap">
              <article v-for="day in lichTrinh.daysList" :key="day.day" class="timeline-day-card">
                <div class="day-header-pill">
                  <span class="day-num">NGÀY {{ day.day }}</span>
                  <span class="day-activities-count">{{ day.activities.length }} hoạt động</span>
                </div>

                <div class="activities-stream">
                  <div
                    v-for="act in day.activities"
                    :key="act.time + act.place"
                    class="activity-row"
                  >
                    <div class="activity-time">{{ act.time }}</div>
                    <div class="activity-bullet"></div>
                    <div class="activity-card-body">
                      <div class="activity-top-line">
                        <span :class="['badge-type', getBadgeInfo(act).class]">
                          {{ getBadgeInfo(act).icon }} {{ getBadgeInfo(act).label }}
                        </span>
                        <h4 class="place-name">{{ act.place }}</h4>
                        <a
                          class="act-direction-btn"
                          :href="chiDuongUrl(act.place, act.address)"
                          target="_blank"
                          rel="noreferrer"
                          title="Mở chỉ đường Google Maps"
                        >
                          🗺️ Chỉ đường ↗
                        </a>
                      </div>
                      <p v-if="act.address" class="act-address">📍 {{ act.address }}</p>
                      <p class="act-desc">{{ act.activity }}</p>
                      <div v-if="act.estimated_cost" class="act-cost">
                        Chi phí dự kiến: <b>{{ dinhDangTien(act.estimated_cost) }}đ</b>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>


        <!-- ==================== TAB 3: CHUYẾN ĐI CỦA TÔI (MY TRIPS) ==================== -->
        <section v-if="activeTab === 'mytrips'" class="tab-pane">
          <div class="pane-header">
            <div>
              <span class="sub-heading">LỊCH SỬ CHUYẾN ĐI</span>
              <h2>Chuyến đi đã lưu</h2>
            </div>
            <button class="app-primary-btn small-btn" @click="activeTab = 'planner'">+ Tạo chuyến mới</button>
          </div>

          <div v-if="!nguoiDung" class="auth-prompt-card">
            <span class="prompt-icon">🔒</span>
            <h3>Đăng nhập để xem các chuyến đi đã lưu</h3>
            <p>Lịch trình du lịch được đồng bộ và lưu an toàn trên đám mây để bạn xem lại bất cứ lúc nào.</p>
            <button class="app-primary-btn" @click="hienAuthModal = true">Đăng nhập / Đăng ký</button>
          </div>

          <div v-else-if="myTripsList.length" class="my-trips-grid">
            <article v-for="trip in myTripsList" :key="trip._id" class="my-trip-card">
              <div class="trip-top">
                <span class="trip-dest">{{ trip.destination }}</span>
                <span class="trip-date">{{ dinhDangNgayNgan(trip.created_at) }}</span>
              </div>
              <h3>Chuyến đi {{ trip.days?.length || 0 }} ngày tại {{ trip.destination }}</h3>
              <p>Dự toán: <b>{{ dinhDangTien(trip.total_budget) }}đ</b> · {{ trip.people || 1 }} người</p>
              <div class="trip-actions">
                <button class="open-trip-btn" @click="moLaiLichTrinh(trip)">Xem chi tiết ↗</button>
                <button class="share-trip-btn" @click="chiaSeChuyenDi(trip)">Chia sẻ</button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state-box">
            <span class="empty-icon">🧳</span>
            <h3>Bạn chưa lưu chuyến đi nào</h3>
            <p>Hãy tạo lịch trình đầu tiên để bắt đầu hành trình khám phá Miền Trung.</p>
            <button class="app-primary-btn" @click="activeTab = 'planner'">Lên lịch ngay</button>
          </div>
        </section>


        <!-- ==================== TAB 4: TRỢ LÝ AI (AI CHAT) ==================== -->
        <section v-if="activeTab === 'aichat'" class="tab-pane chat-pane">
          <div class="chat-header">
            <div class="ai-avatar-badge">🤖</div>
            <div>
              <h3>Trợ lý Du lịch AI Travel Trips</h3>
              <small class="ai-status">● Sẵn sàng giải đáp 24/7</small>
            </div>
          </div>

          <!-- Gợi ý câu hỏi nhanh -->
          <div class="quick-prompts-row">
            <button class="prompt-chip" @click="guiChatNhanh('Ăn sáng ở đâu ngon nhất tại ' + formDuLieu.diemDen + '?')">
              🍳 Ăn sáng ngon nhất?
            </button>
            <button class="prompt-chip" @click="guiChatNhanh('Gợi ý 3 quán cafe view đẹp sống ảo tại ' + formDuLieu.diemDen)">
              ☕ Quán cafe view đẹp?
            </button>
            <button class="prompt-chip" @click="guiChatNhanh('Đặc sản gì nên mua làm quà ở ' + formDuLieu.diemDen + '?')">
              🎁 Mua đặc sản làm quà?
            </button>
            <button class="prompt-chip" @click="guiChatNhanh('Kinh nghiệm đi du lịch tiết kiệm tại ' + formDuLieu.diemDen)">
              💡 Mẹo đi tiết kiệm?
            </button>
          </div>

          <!-- Khung tin nhắn -->
          <div class="chat-messages-container" ref="chatBoxRef">
            <div v-if="!nhanTin.length" class="chat-welcome">
              <span class="welcome-robot">🤖</span>
              <h4>Xin chào! Tôi là Trợ lý AI Du lịch.</h4>
              <p>Bạn có thể hỏi tôi bất kỳ điều gì về đường đi, quán ăn ngon chuẩn vị, giá vé tham quan hay kinh nghiệm du lịch tại Miền Trung!</p>
            </div>

            <div
              v-for="m in nhanTin"
              :key="m.id"
              :class="['chat-bubble', m.role === 'user' ? 'bubble-user' : 'bubble-assistant']"
            >
              <div class="bubble-header">{{ m.role === 'user' ? 'Bạn' : 'Travel Trips AI' }}</div>
              <div class="bubble-body">{{ m.text }}</div>
            </div>

            <div v-if="dangGuiChat" class="chat-bubble bubble-assistant typing-bubble">
              <span>AI đang soạn câu trả lời...</span>
            </div>
          </div>

          <!-- Ô nhập tin nhắn -->
          <div class="chat-input-bar">
            <input
              v-model="chatText"
              class="chat-text-input"
              placeholder="Nhập câu hỏi của bạn cho AI..."
              @keydown.enter.prevent="sendChat"
            />
            <button class="send-msg-btn" @click="sendChat" :disabled="!chatText.trim() || dangGuiChat">
              <span>Gửi</span>
            </button>
          </div>
        </section>


        <!-- ==================== TAB 5: TÀI KHOẢN & YÊU THÍCH (PROFILE) ==================== -->
        <section v-if="activeTab === 'profile'" class="tab-pane">
          <!-- Nếu đã đăng nhập -->
          <div v-if="nguoiDung" class="profile-card">
            <div class="profile-avatar-large">
              {{ nguoiDung.name ? nguoiDung.name[0].toUpperCase() : 'U' }}
            </div>
            <h3>{{ nguoiDung.name }}</h3>
            <p class="profile-email">{{ nguoiDung.email }}</p>
            <div class="profile-stats-row">
              <div class="stat-box">
                <strong>{{ myTripsList.length }}</strong>
                <small>Chuyến đi</small>
              </div>
              <div class="stat-box">
                <strong>{{ favoritesList.length }}</strong>
                <small>Yêu thích</small>
              </div>
            </div>
            <button class="logout-btn" @click="dangXuat">Đăng xuất</button>
          </div>

          <!-- Nếu chưa đăng nhập -->
          <div v-else class="auth-card">
            <div class="auth-tabs">
              <button :class="['auth-tab', { active: !dangKyMode }]" @click="dangKyMode = false">Đăng nhập</button>
              <button :class="['auth-tab', { active: dangKyMode }]" @click="dangKyMode = true">Đăng ký</button>
            </div>

            <form class="auth-form-body" @submit.prevent="dangNhapHoacDangKy">
              <div v-if="dangKyMode" class="app-field">
                <label>Họ và tên</label>
                <input v-model="authForm.name" class="app-input" placeholder="Nguyễn Văn A" required />
              </div>
              <div class="app-field">
                <label>Email</label>
                <input v-model="authForm.email" type="email" class="app-input" placeholder="name@example.com" required />
              </div>
              <div class="app-field">
                <label>Mật khẩu</label>
                <input v-model="authForm.password" type="password" class="app-input" placeholder="Tối thiểu 6 ký tự" required />
              </div>
              <p v-if="authError" class="auth-error-msg">{{ authError }}</p>
              <button type="submit" class="app-primary-btn auth-submit-btn">
                {{ dangKyMode ? 'Đăng ký tài khoản' : 'Đăng nhập ngay' }}
              </button>
            </form>
          </div>

          <!-- Danh sách Địa điểm yêu thích -->
          <div v-if="nguoiDung && favoritesList.length" class="favorites-section">
            <h3>Địa điểm đã lưu yêu thích ({{ favoritesList.length }})</h3>
            <div class="places-app-grid">
              <article v-for="place in favoritesList" :key="place._id" class="app-place-card">
                <div class="place-card-top">
                  <span class="place-card-type">{{ getPlaceTypeLabel(place.type) }}</span>
                  <button class="heart-action-btn active" @click="doiYeuThich(place._id)">♥</button>
                </div>
                <h4>{{ place.name }}</h4>
                <p class="place-card-desc">{{ place.description }}</p>
                <p class="place-card-address" v-if="place.address">📍 {{ place.address }}</p>
                <div class="place-card-bottom">
                  <a class="place-maps-btn" :href="chiDuongUrl(place.name, place.address)" target="_blank">🗺️ Chỉ đường</a>
                </div>
              </article>
            </div>
          </div>
        </section>

      </main>

      <!-- ==================== BOTTOM NAVIGATION BAR (CHUẨN MOBILE APP) ==================== -->
      <nav class="app-bottom-nav">
        <button
          :class="['nav-item', { active: activeTab === 'explore' }]"
          @click="activeTab = 'explore'"
        >
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Khám phá</span>
        </button>

        <button
          :class="['nav-item', { active: activeTab === 'planner' }]"
          @click="activeTab = 'planner'"
        >
          <span class="nav-icon">🧭</span>
          <span class="nav-label">Lên lịch</span>
        </button>

        <button
          :class="['nav-item', { active: activeTab === 'mytrips' }]"
          @click="activeTab = 'mytrips'"
        >
          <span class="nav-icon">🧳</span>
          <span class="nav-label">Chuyến đi</span>
        </button>

        <button
          :class="['nav-item', { active: activeTab === 'aichat' }]"
          @click="activeTab = 'aichat'"
        >
          <span class="nav-icon">💬</span>
          <span class="nav-label">Trợ lý AI</span>
        </button>

        <button
          :class="['nav-item', { active: activeTab === 'profile' }]"
          @click="activeTab = 'profile'"
        >
          <span class="nav-icon">👤</span>
          <span class="nav-label">Tài khoản</span>
        </button>
      </nav>

    </div>


    <!-- ==================== POPUP MODAL ĐĂNG NHẬP NHANH ==================== -->
    <div v-if="hienAuthModal" class="modal-overlay" @click.self="hienAuthModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ dangKyMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập' }}</h3>
          <button class="close-modal-btn" @click="hienAuthModal = false">✕</button>
        </div>
        <div class="auth-tabs">
          <button :class="['auth-tab', { active: !dangKyMode }]" @click="dangKyMode = false">Đăng nhập</button>
          <button :class="['auth-tab', { active: dangKyMode }]" @click="dangKyMode = true">Đăng ký</button>
        </div>
        <form class="auth-form-body" @submit.prevent="dangNhapHoacDangKy">
          <div v-if="dangKyMode" class="app-field">
            <label>Họ và tên</label>
            <input v-model="authForm.name" class="app-input" placeholder="Nguyễn Văn A" required />
          </div>
          <div class="app-field">
            <label>Email</label>
            <input v-model="authForm.email" type="email" class="app-input" placeholder="name@example.com" required />
          </div>
          <div class="app-field">
            <label>Mật khẩu</label>
            <input v-model="authForm.password" type="password" class="app-input" placeholder="Tối thiểu 6 ký tự" required />
          </div>
          <p v-if="authError" class="auth-error-msg">{{ authError }}</p>
          <button type="submit" class="app-primary-btn auth-submit-btn">
            {{ dangKyMode ? 'Tạo tài khoản' : 'Đăng nhập' }}
          </button>
        </form>
      </div>
    </div>


    <!-- ==================== POPUP MODAL CHIA TIỀN NHÓM (BILL SPLITTER) ==================== -->
    <div v-if="hienBillSplitter" class="modal-overlay" @click.self="hienBillSplitter = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>💸 Tính Tiền Chia Đều Cho Nhóm</h3>
          <button class="close-modal-btn" @click="hienBillSplitter = false">✕</button>
        </div>
        <div class="splitter-body">
          <div class="app-field">
            <label>Tổng chi phí chuyến đi (VND)</label>
            <input type="number" v-model.number="splitterTongTien" class="app-input" />
          </div>
          <div class="app-field">
            <label>Số thành viên trong nhóm</label>
            <div class="stepper-input">
              <button type="button" @click="splitterSoNguoi = Math.max(1, splitterSoNguoi - 1)">-</button>
              <span>{{ splitterSoNguoi }} người</span>
              <button type="button" @click="splitterSoNguoi++">+</button>
            </div>
          </div>
          <div class="splitter-result-box">
            <small>MỖI THÀNH VIÊN CẦN ĐÓNG:</small>
            <strong>{{ dinhDangTien(Math.round(splitterTongTien / Math.max(1, splitterSoNguoi))) }}đ</strong>
            <p>Đã tính toán chia đều trên tổng số {{ splitterSoNguoi }} người tham gia chuyến đi.</p>
          </div>
        </div>
      </div>
    </div>


    <!-- ==================== POPUP MODAL XUẤT VÉ HÀNH TRÌNH OFFLINE (TRAVEL PASS) ==================== -->
    <div v-if="hienTravelPass && lichTrinh" class="modal-overlay" @click.self="hienTravelPass = false">
      <div class="modal-card travel-pass-card">
        <div class="modal-header">
          <h3>🎫 Thẻ Vé Hành Trình Du Lịch</h3>
          <button class="close-modal-btn" @click="hienTravelPass = false">✕</button>
        </div>
        <div class="boarding-pass">
          <div class="pass-header">
            <span class="pass-logo">Travel Trips PASS</span>
            <span class="pass-dest">{{ lichTrinh.destination }}</span>
          </div>
          <div class="pass-body">
            <div class="pass-row">
              <div><small>THỜI GIAN</small><b>{{ lichTrinh.daysList.length }} Ngày</b></div>
              <div><small>SỐ KHÁCH</small><b>{{ lichTrinh.people }} Người</b></div>
              <div><small>NGÂN SÁCH</small><b>{{ dinhDangTien(lichTrinh.total_budget) }}đ</b></div>
            </div>
            <div class="pass-hotel" v-if="lichTrinh.hotel_recommendation">
              <small>KHÁCH SẠN NGHỈ DƯỠNG</small>
              <b>{{ lichTrinh.hotel_recommendation.name }}</b>
              <p>{{ lichTrinh.hotel_recommendation.address }}</p>
            </div>
            <div class="pass-qr-sim">
              <div class="qr-mockup">QR CODE OFFLINE PASS</div>
              <small>Chụp màn hình thẻ vé để sử dụng khi mất sóng 4G</small>
            </div>
          </div>
        </div>
        <button class="app-primary-btn" @click="xuatPdf">In / Lưu PDF Thẻ Vé</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import api from './services/api'

// Navigation Tab State
const activeTab = ref('explore')
const isMobileFrame = ref(false)

// Danh sách 11 Tỉnh/Thành phố Miền Trung & Tây Nguyên sau sáp nhập
const centralCities = [
  { name: 'Thanh Hóa', icon: '🏰', tag: 'Sầm Sơn & Pù Luông', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'Nghệ An', icon: '🌾', tag: 'Cửa Lò & Quê Bác', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80' },
  { name: 'Hà Tĩnh', icon: '🌊', tag: 'Thiên Cầm & Ngã Ba Đồng Lộc', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Quảng Trị', icon: '⛰️', tag: 'Phong Nha, Thiên Đường & Vịnh Mốc', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80' },
  { name: 'Huế', icon: '👑', tag: 'Cố Đô Di Sản Triều Nguyễn', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80' },
  { name: 'Đà Nẵng', icon: '🌉', tag: 'Cầu Vàng, Phố Cổ Hội An & Mỹ Khê', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Quảng Ngãi', icon: '🏖️', tag: 'Đảo Lý Sơn & Eo Gió - Kỳ Co', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Gia Lai', icon: '🐘', tag: 'Biển Hồ T’Nưng & Nhà Rông Kon Tum', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Đắk Lắk', icon: '☕', tag: 'Bảo Tàng Cà Phê & Thác Dray Nur', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Khánh Hòa', icon: '⛵', tag: 'Nha Trang, Vịnh Vĩnh Hy & Gành Đá Đĩa', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80' },
  { name: 'Lâm Đồng', icon: '🌲', tag: 'Đà Lạt Ngàn Hoa & Thác Dambri', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80' }
]

// Form State
const formDuLieu = reactive({
  diemDen: 'Đà Nẵng',
  soNgay: 3,
  nganSach: 3500000,
  soNguoi: 2,
  soThich: [],
  ngayBatDau: '',
  ngayKetThuc: '',
  phuongTien: 'linh hoạt',
  yeuCauKhachSan: ''
})

const chuoiSoThich = ref('Ăn uống đặc sản, check-in cảnh đẹp, biển')
const dangTao = ref(false)
const lichTrinh = ref(null)
const selectedPlaces = ref([])
const selectedDay = ref(1)
const places = ref([])
const thoiTiet = ref(null)
const filterExploreType = ref('all')

// Chat AI State
const nhanTin = ref([])
const chatText = ref('')
const dangGuiChat = ref(false)
const dangDieuChinh = ref(false)
const chatBoxRef = ref(null)

// Auth & Social State
const nguoiDung = ref(null)
const dangKyMode = ref(false)
const hienAuthModal = ref(false)
const authForm = reactive({ name: '', email: '', password: '' })
const authError = ref('')
const myTripsList = ref([])
const favoritesList = ref([])

// Tool Modals
const hienBillSplitter = ref(false)
const splitterTongTien = ref(3500000)
const splitterSoNguoi = ref(2)
const hienTravelPass = ref(false)

// Computed Lists
const attractionsList = computed(() => (places.value || []).filter(p => p.type === 'attraction'))
const restaurantsList = computed(() => (places.value || []).filter(p => p.type === 'restaurant'))
const cafesList = computed(() => (places.value || []).filter(p => p.type === 'cafe'))

const filteredExplorePlaces = computed(() => {
  if (filterExploreType.value === 'all') return places.value || []
  return (places.value || []).filter(p => p.type === filterExploreType.value)
})

const banDoEmbedUrl = computed(() => {
  const trip = lichTrinh.value
  const day = trip?.daysList?.find(item => item.day === selectedDay.value) || trip?.daysList?.[0]
  const stops = day?.activities?.map(a => a.place).filter(Boolean).slice(0, 5) || []
  const query = [trip?.destination || formDuLieu.diemDen, ...stops].join(', ')
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
})

// Methods
function dinhDangTien(v) {
  if (!v && v !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(v)
}

function dinhDangNgay(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
}

function dinhDangNgayNgan(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}

function getPlaceTypeLabel(type) {
  const map = {
    attraction: '📸 Thắng cảnh',
    restaurant: '🍲 Ẩm thực',
    cafe: '☕ Cafe & Bar',
    hotel: '🏨 Khách sạn'
  }
  return map[type] || '📍 Địa điểm'
}

function getBadgeInfo(act) {
  if (!act) return { icon: '📍', label: 'Hoạt động', class: 'badge-attraction' }
  if (act.type) {
    const map = {
      breakfast: { icon: '🍳', label: act.label || 'Ăn sáng', class: 'badge-breakfast' },
      lunch: { icon: '🍲', label: act.label || 'Ăn trưa', class: 'badge-lunch' },
      dinner: { icon: '🦞', label: act.label || 'Ăn tối', class: 'badge-dinner' },
      checkin: { icon: '🏨', label: act.label || 'Nhận phòng', class: 'badge-hotel' },
      checkout: { icon: '🧳', label: act.label || 'Trả phòng', class: 'badge-hotel' },
      cafe: { icon: '☕', label: act.label || 'Cafe & Chill', class: 'badge-cafe' },
      attraction: { icon: '📸', label: act.label || 'Tham quan / Check-in', class: 'badge-attraction' }
    }
    if (map[act.type]) return map[act.type]
  }
  return { icon: '📸', label: 'Tham quan / Check-in', class: 'badge-attraction' }
}

function chiDuongUrl(place, address = '') {
  const query = address ? `${place}, ${address}` : `${place}, ${formDuLieu.diemDen}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

function togglePlaceSelection(placeName) {
  const idx = selectedPlaces.value.indexOf(placeName)
  if (idx >= 0) selectedPlaces.value.splice(idx, 1)
  else selectedPlaces.value.push(placeName)
}

function isPlaceSelected(placeName) {
  return selectedPlaces.value.includes(placeName)
}

function isFavorite(placeId) {
  if (!placeId) return false
  return favoritesList.value.some(p => p._id === placeId || p === placeId)
}

function getPlaceImage(place) {
  if (place?.image) return place.image
  const name = (place?.name || '').toLowerCase()

  if (name.includes('phong nha') || name.includes('thiên đường') || name.includes('hang tối') || name.includes('động')) {
    return 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('suối nước moọc') || name.includes('suối moọc') || name.includes('sông chày')) {
    return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('đá nhảy') || name.includes('gành đá') || name.includes('eo gió') || name.includes('kỳ co')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('cồn cát') || name.includes('quang phú')) {
    return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('biển') || name.includes('nhật lệ') || name.includes('mỹ khê') || name.includes('an bàng') || name.includes('mũi điện')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('bà nà') || name.includes('cầu vàng') || name.includes('sơn trà') || name.includes('ngũ hành sơn') || name.includes('cầu rồng')) {
    return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('phố cổ') || name.includes('hội an') || name.includes('chùa cầu') || name.includes('rừng dừa')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('đại nội') || name.includes('lăng') || name.includes('thiên mụ') || name.includes('sông hương') || name.includes('làng hương')) {
    return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('mẹ suốt') || name.includes('quảng bình quan') || name.includes('bảo tàng') || name.includes('di tích')) {
    return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'restaurant' || name.includes('bánh') || name.includes('cháo') || name.includes('mì') || name.includes('bún') || name.includes('hải sản') || name.includes('cơm') || name.includes('gà') || name.includes('lẩu')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'cafe' || name.includes('cafe') || name.includes('coffee') || name.includes('cà phê') || name.includes('trà')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'hotel' || name.includes('hotel') || name.includes('resort') || name.includes('khách sạn')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80'
}

function themVaoLichTrinhVaMoPlanner(placeName) {
  if (!selectedPlaces.value.includes(placeName)) {
    selectedPlaces.value.push(placeName)
  }
  activeTab.value = 'planner'
}

let reqIdCounter = 0
function chonNhanhDiemDen(city) {
  formDuLieu.diemDen = city
  selectedPlaces.value = []
  taiDuLieuThanhPho()
}

function chonDiemDenExplore(city) {
  formDuLieu.diemDen = city
  selectedPlaces.value = []
  taiDuLieuThanhPho()
}

async function taiDuLieuThanhPho() {
  const currentId = ++reqIdCounter
  const dest = (formDuLieu.diemDen || '').trim()
  if (!dest) return
  try {
    const [resPlaces, resWeather] = await Promise.allSettled([
      api.get('/places', { params: { destination: dest } }),
      api.get('/weather', { params: { destination: dest } })
    ])
    if (currentId === reqIdCounter) {
      if (resPlaces.status === 'fulfilled') places.value = resPlaces.value.data || []
      if (resWeather.status === 'fulfilled') thoiTiet.value = resWeather.value.data
    }
  } catch (e) {
    console.warn('Lỗi tải dữ liệu:', e.message)
  }
}

async function taoLichTrinh() {
  formDuLieu.soThich = chuoiSoThich.value.split(',').map(s => s.trim()).filter(Boolean)
  dangTao.value = true
  lichTrinh.value = null
  try {
    const res = await api.post('/ai/plan', {
      destination: formDuLieu.diemDen,
      days: formDuLieu.soNgay,
      budget: formDuLieu.nganSach,
      people: formDuLieu.soNguoi,
      interests: formDuLieu.soThich,
      selected_places: selectedPlaces.value,
      start_date: formDuLieu.ngayBatDau,
      end_date: formDuLieu.ngayKetThuc,
      transportation: formDuLieu.phuongTien,
      hotel_request: formDuLieu.yeuCauKhachSan
    })
    lichTrinh.value = res.data
    if (lichTrinh.value?.days) lichTrinh.value.daysList = lichTrinh.value.days
    selectedDay.value = 1
    splitterTongTien.value = lichTrinh.value.total_budget || formDuLieu.nganSach
    splitterSoNguoi.value = lichTrinh.value.people || formDuLieu.soNguoi
    taiChuyenDiCuaToi()
  } catch (e) {
    alert('Lỗi khi lập lịch: ' + (e?.response?.data?.error || e.message))
  } finally {
    dangTao.value = false
  }
}

async function dieuChinhTranhMua() {
  if (!lichTrinh.value?.tripId) return
  dangDieuChinh.value = true
  try {
    const res = await api.post('/ai/replan', {
      tripId: lichTrinh.value.tripId,
      instruction: 'Dự báo ngày này có mưa, hãy đổi các hoạt động ngoài trời thành các điểm trong nhà (Bảo tàng, Cafe view đẹp, Rạp chiếu phim, Chợ ẩm thực có mái che).'
    })
    lichTrinh.value.days = res.data.days
    lichTrinh.value.daysList = res.data.days
    alert('🌧️ AI đã cập nhật lịch trình sang các hoạt động trong nhà tránh mưa thành công!')
  } catch (e) {
    alert('Không thể đổi lịch: ' + (e?.response?.data?.error || e.message))
  } finally {
    dangDieuChinh.value = false
  }
}

async function sendChat() {
  const text = chatText.value.trim()
  if (!text || dangGuiChat.value) return
  nhanTin.value.push({ id: Date.now() + '-u', role: 'user', text })
  chatText.value = ''
  dangGuiChat.value = true
  try {
    const res = await api.post('/ai/chat', {
      tripId: lichTrinh.value?.tripId || undefined,
      message: text
    })
    nhanTin.value.push({ id: Date.now() + '-a', role: 'assistant', text: res.data.reply })
  } catch (e) {
    nhanTin.value.push({ id: Date.now() + '-a', role: 'assistant', text: 'Xin lỗi, tạm thời tôi chưa thể trả lời: ' + (e?.response?.data?.error || e.message) })
  } finally {
    dangGuiChat.value = false
  }
}

function guiChatNhanh(cauHoi) {
  chatText.value = cauHoi
  sendChat()
}

async function dangNhapHoacDangKy() {
  authError.value = ''
  try {
    const endpoint = dangKyMode.value ? '/auth/register' : '/auth/login'
    const payload = dangKyMode.value ? authForm : { email: authForm.email, password: authForm.password }
    const res = await api.post(endpoint, payload)
    localStorage.setItem('travel_token', res.data.token)
    nguoiDung.value = res.data.user
    hienAuthModal.value = false
    taiChuyenDiCuaToi()
    taiYeuThich()
  } catch (e) {
    authError.value = e?.response?.data?.error || e.message
  }
}

function dangXuat() {
  localStorage.removeItem('travel_token')
  nguoiDung.value = null
  myTripsList.value = []
  favoritesList.value = []
}

async function taiChuyenDiCuaToi() {
  if (!nguoiDung.value) return
  try {
    const res = await api.get('/social/my-trips')
    myTripsList.value = res.data || []
  } catch (e) {
    console.warn('Chưa tải được danh sách chuyến đi:', e.message)
  }
}

async function taiYeuThich() {
  if (!nguoiDung.value) return
  try {
    const res = await api.get('/social/favorites')
    favoritesList.value = res.data || []
  } catch (e) {
    console.warn('Chưa tải được yêu thích:', e.message)
  }
}

async function doiYeuThich(placeId) {
  if (!nguoiDung.value) {
    hienAuthModal.value = true
    return
  }
  try {
    await api.post(`/social/favorites/${placeId}`)
    await taiYeuThich()
  } catch (e) {
    console.warn('Lỗi yêu thích:', e.message)
  }
}

function moLaiLichTrinh(trip) {
  lichTrinh.value = trip
  if (lichTrinh.value?.days) lichTrinh.value.daysList = lichTrinh.value.days
  selectedDay.value = 1
  activeTab.value = 'planner'
}

async function chiaSeChuyenDi(trip) {
  try {
    const res = await api.post(`/social/trips/${trip._id}/share`)
    const url = `${window.location.origin}${res.data.url}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      alert('Đã sao chép liên kết chia sẻ vào Clipboard!\n' + url)
    } else {
      prompt('Liên kết chia sẻ chuyến đi:', url)
    }
  } catch (e) {
    alert('Không thể chia sẻ: ' + (e?.response?.data?.error || e.message))
  }
}

function xuatPdf() {
  window.print()
}

function bieuTuongThoiTiet(code) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67 || code <= 82) return '🌧️'
  return '⚡'
}

function moTaThoiTiet(code) {
  if (code === 0) return 'Trời nắng đẹp'
  if (code <= 3) return 'Có mây nhẹ'
  if (code <= 48) return 'Sương mù nhẹ'
  if (code <= 67 || code <= 82) return 'Có mưa rào'
  return 'Dông bão'
}

onMounted(async () => {
  if (localStorage.getItem('travel_token')) {
    try {
      nguoiDung.value = (await api.get('/auth/me')).data
      taiChuyenDiCuaToi()
      taiYeuThich()
    } catch (err) {
      dangXuat()
    }
  }
  taiDuLieuThanhPho()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --primary: #0d7c76;
  --primary-dark: #095955;
  --primary-light: #e0f2f1;
  --accent: #f26440;
  --accent-light: #ffebe5;
  --bg-app: #f4f6f8;
  --card-bg: #ffffff;
  --text-main: #192a2e;
  --text-sub: #607274;
  --border-color: #e2e8f0;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 8px 24px rgba(13,124,118,0.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  -webkit-tap-highlight-color: transparent;
}

button, input, select { font: inherit; outline: none; }
button { cursor: pointer; }

/* APP LAYOUT WRAPPER */
.app-root {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background: #eef2f5;
}

.app-container {
  width: 100%;
  max-width: 1100px;
  min-height: 100vh;
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 0 40px rgba(0,0,0,0.06);
}

/* GIẢ LẬP KHUNG ĐIỆN THOẠI (MOBILE FRAME MODE) */
.mobile-frame-mode {
  padding: 24px 0;
}
.mobile-frame-mode .app-container {
  max-width: 420px;
  height: 860px;
  min-height: 860px;
  border-radius: 36px;
  border: 10px solid #1e293b;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.25);
}

/* HEADER BAR */
.app-header {
  background: var(--card-bg);
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.app-logo-icon {
  width: 34px;
  height: 34px;
  background: var(--primary);
  color: #fff;
  border-radius: 10px;
  display: grid;
  place-content: center;
  font-size: 18px;
}
.brand-text h1 {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.1;
}
.brand-text small {
  font-size: 10px;
  color: var(--text-sub);
  font-weight: 600;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mode-toggle-btn {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid #b2dfdb;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  transition: all .2s;
}
.mode-toggle-btn:hover {
  background: var(--primary);
  color: #fff;
}
.user-chip-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.user-avatar {
  width: 24px;
  height: 24px;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 11px;
  font-weight: 800;
}
.login-header-btn {
  background: var(--primary);
  color: #fff;
  border: 0;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

/* MAIN CONTENT AREA */
.app-main {
  flex: 1;
  padding: 18px;
  padding-bottom: 90px;
  overflow-y: auto;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* EXPLORE TAB HERO CARD */
.app-hero-card {
  background: linear-gradient(135deg, var(--primary) 0%, #064e4b 100%);
  color: #fff;
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}
.hero-badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  color: #ffe6dc;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}
.app-hero-card h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}
.app-hero-card p {
  font-size: 13px;
  color: #cde6e4;
  line-height: 1.5;
  margin-bottom: 16px;
  max-width: 500px;
}
.hero-cta-btn {
  background: var(--accent);
  color: #fff;
  border: 0;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(242,100,64,0.3);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.section-title-row h3 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}
.sub-region-hint {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
.explore-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ai-crawl-btn {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
}
.ai-crawl-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
.ai-crawl-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.badge-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 2px 8px;
  border-radius: 10px;
}
.cities-carousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: thin;
}
.city-card-btn {
  background-color: var(--card-bg);
  background-size: cover;
  background-position: center;
  border: 1px solid var(--border-color);
  padding: 18px 16px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 125px;
  height: 120px;
  color: #ffffff;
  transition: all .25s;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  position: relative;
  text-align: center;
}
.city-card-btn:hover, .city-card-btn.active {
  border-color: #f59e0b;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0,0,0,0.22);
}
.city-card-btn.active::after {
  content: '● Đang chọn';
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 9px;
  font-weight: 800;
  background: var(--accent);
  color: #fff;
  padding: 2px 6px;
  border-radius: 8px;
}
.city-icon { font-size: 24px; margin-bottom: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.6); }
.city-name { font-size: 14px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
.city-tag { font-size: 10px; color: #e2e8f0; margin-top: 2px; text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-weight: 600; }

/* WEATHER WIDGET */
.app-weather-widget {
  background: #e8f4f3;
  border: 1px solid #c2e2df;
  padding: 16px 20px;
  border-radius: var(--radius-md);
}
.weather-widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.weather-label { font-size: 10px; font-weight: 800; color: var(--primary); letter-spacing: .08em; }
.weather-widget-header h4 { font-size: 18px; font-weight: 800; }
.weather-temp-now { display: flex; align-items: center; gap: 8px; }
.weather-icon-large { font-size: 28px; }
.weather-temp-now strong { font-size: 24px; font-weight: 800; color: var(--primary); }
.weather-summary { font-size: 12px; color: var(--text-sub); margin: 6px 0 12px; }
.weather-forecast-strip {
  display: flex;
  justify-content: space-between;
  border-top: 1px dashed #b2dfdb;
  padding-top: 10px;
}
.forecast-item { text-align: center; font-size: 11px; }
.forecast-item small { display: block; color: var(--text-sub); }
.forecast-item span { font-size: 16px; margin: 2px 0; display: block; }

/* PLACES EXPLORE GRID WITH PHOTOS */
.filter-pills { display: flex; gap: 6px; }
.filter-pill {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-sub);
}
.filter-pill.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.places-app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
.app-place-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform .2s, box-shadow .2s;
}
.app-place-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.place-img-cover {
  height: 140px;
  background-size: cover;
  background-position: center;
  background-color: #0d7c76;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
}
.place-img-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%);
  pointer-events: none;
}

.place-card-type {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 8px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.type-attraction { background: #e8f5e9; color: #166534; }
.type-restaurant { background: #fff7ed; color: #c2410c; }
.type-cafe { background: #fdf4ff; color: #86198f; }
.type-hotel { background: #eff6ff; color: #1d4ed8; }

.place-img-rating {
  position: absolute;
  bottom: 8px;
  left: 10px;
  z-index: 2;
  background: rgba(0,0,0,0.7);
  color: #fbbf24;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.heart-action-btn {
  background: rgba(255,255,255,0.85);
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 16px;
  color: #64748b;
  display: grid;
  place-content: center;
  z-index: 2;
  cursor: pointer;
  transition: all .2s;
}
.heart-action-btn:hover { background: #fff; transform: scale(1.1); }
.heart-action-btn.active { color: #ef4444; background: #fff; }

.place-card-content {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.place-card-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; color: var(--text-main); }
.place-card-desc { font-size: 12px; color: var(--text-sub); line-height: 1.4; margin-bottom: 8px; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.place-card-address { font-size: 11px; color: var(--primary); font-weight: 600; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.place-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
  margin-top: auto;
  gap: 6px;
}
.add-to-plan-btn {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid #b2dfdb;
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  transition: all .2s;
}
.add-to-plan-btn:hover { background: var(--primary); color: #fff; }
.place-maps-btn {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub);
  text-decoration: none;
  background: #f1f5f9;
  padding: 5px 8px;
  border-radius: 6px;
}
.place-maps-btn:hover { color: var(--primary); background: #e2e8f0; }

/* PLANNER FORM */
.planner-form-container {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.sub-heading { font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: .1em; }
.pane-header h2 { font-size: 20px; font-weight: 800; }
.planner-icon { font-size: 24px; color: var(--primary); }

.app-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.app-field { display: flex; flex-direction: column; gap: 6px; }
.app-field.full-width { grid-column: span 2; }
.app-field label { font-size: 11px; font-weight: 700; color: var(--text-sub); }
.field-label-between { display: flex; justify-content: space-between; align-items: center; }
.budget-highlight { font-size: 14px; color: var(--accent); }

.app-input, .app-select {
  width: 100%;
  border: 1px solid var(--border-color);
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-main);
}
.app-input:focus, .app-select:focus {
  border-color: var(--primary);
  background: #fff;
}
.stepper-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  background: #f8fafc;
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.stepper-input button {
  width: 36px;
  height: 38px;
  background: transparent;
  border: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}
.stepper-input span {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
}
.budget-slider {
  width: 100%;
  accent-color: var(--accent);
}
.quick-city-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.city-select-pill {
  border: 1px solid var(--border-color);
  background: #f8fafc;
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}
.city-select-pill.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* PLACES PICKER IN PLANNER */
.places-picker-box {
  margin-top: 16px;
  padding: 14px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: var(--radius-md);
}
.picker-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.picker-kicker { font-size: 10px; font-weight: 800; color: var(--primary); }
.picker-top h4 { font-size: 14px; font-weight: 700; }
.badge-selected-count {
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
}
.picker-row { margin-bottom: 8px; }
.row-label { font-size: 11px; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 4px; }
.chips-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.app-chip {
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.app-chip.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.chip-status { font-weight: 800; font-size: 12px; }

.app-primary-btn {
  background: var(--primary);
  color: #fff;
  border: 0;
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background .2s;
}
.app-primary-btn:hover:not(:disabled) { background: var(--primary-dark); }
.submit-plan-btn { width: 100%; margin-top: 18px; padding: 14px; }

/* PLAN RESULTS */
.plan-results-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}
.plan-summary-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
}
.plan-dest-badge {
  background: var(--primary-light);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 6px;
}
.summary-meta h2 { font-size: 20px; font-weight: 800; }
.summary-budget { font-size: 13px; color: var(--text-sub); margin-top: 4px; }
.summary-budget strong { color: var(--accent); font-size: 16px; }

.plan-tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}
.tool-btn {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}
.tool-btn:hover { background: #e2e8f0; }
.rain-btn { color: #0284c7; border-color: #bae6fd; background: #f0f9ff; }

/* HOTEL CARD */
.app-hotel-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 5px solid #16a34a;
  padding: 16px;
  border-radius: var(--radius-md);
}
.hotel-badge { font-size: 10px; font-weight: 800; color: #16a34a; margin-bottom: 6px; }
.hotel-main-info { display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.hotel-main-info h3 { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.hotel-addr { font-size: 11px; color: var(--primary); font-weight: 600; margin-bottom: 6px; }
.hotel-desc { font-size: 12px; color: var(--text-sub); line-height: 1.4; max-width: 500px; }
.hotel-side { text-align: right; }
.hotel-stars { background: #fff; color: #d97706; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
.hotel-price { display: block; font-size: 16px; font-weight: 800; color: var(--accent); margin: 4px 0; }
.hotel-maps-link { font-size: 11px; font-weight: 700; color: var(--primary); text-decoration: none; border-bottom: 1px dashed var(--primary); }

/* MAP BOX */
.app-map-box {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px;
}
.map-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
.map-header h4 { font-size: 14px; font-weight: 800; }
.day-switcher-pills { display: flex; gap: 6px; }
.day-pill {
  border: 1px solid var(--border-color);
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}
.day-pill.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.app-map-iframe { width: 100%; height: 260px; border: 0; border-radius: var(--radius-sm); }

/* TIMELINE WRAP */
.app-timeline-wrap { display: flex; flex-direction: column; gap: 14px; }
.timeline-day-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
}
.day-header-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}
.day-num { font-size: 14px; font-weight: 800; color: var(--accent); }
.day-activities-count { font-size: 11px; color: var(--text-sub); }

.activities-stream { display: flex; flex-direction: column; }
.activity-row {
  display: grid;
  grid-template-columns: 50px 18px 1fr;
  gap: 10px;
  padding: 10px 0;
  position: relative;
}
.activity-time { font-size: 12px; font-weight: 700; color: var(--primary); padding-top: 2px; }
.activity-bullet {
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  margin-top: 5px;
  position: relative;
}
.activity-bullet::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 4px;
  width: 2px;
  height: calc(100% + 20px);
  background: #e2e8f0;
}
.activity-row:last-child .activity-bullet::after { display: none; }

.activity-card-body {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
}
.activity-top-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}
.badge-type {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
}
.badge-breakfast { background: #fff3d6; color: #9a5b00; }
.badge-lunch { background: #ffe6dc; color: #c0471b; }
.badge-dinner { background: #ffdcd6; color: #9e220a; }
.badge-hotel { background: #e3f2fd; color: #0d47a1; }
.badge-cafe { background: #f3e8dc; color: #6d4c41; }
.badge-attraction { background: #e8f5e9; color: #1b5e20; }

.place-name { font-size: 13px; font-weight: 700; color: var(--text-main); margin: 0; }
.act-direction-btn {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
  background: var(--primary-light);
  padding: 2px 6px;
  border-radius: 4px;
}
.act-address { font-size: 11px; color: var(--primary); font-weight: 600; margin: 2px 0 4px; }
.act-desc { font-size: 12px; color: var(--text-sub); line-height: 1.4; margin-bottom: 4px; }
.act-cost { font-size: 11px; color: var(--text-sub); }
.act-cost b { color: var(--accent); }

/* MY TRIPS TAB */
.my-trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.my-trip-card {
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.trip-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.trip-dest { font-size: 11px; font-weight: 800; color: var(--primary); background: var(--primary-light); padding: 2px 8px; border-radius: 8px; }
.trip-date { font-size: 11px; color: var(--text-sub); }
.my-trip-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
.my-trip-card p { font-size: 12px; color: var(--text-sub); margin-bottom: 12px; }
.trip-actions { display: flex; gap: 8px; }
.open-trip-btn {
  flex: 1;
  background: var(--primary);
  color: #fff;
  border: 0;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}
.share-trip-btn {
  background: #f1f5f9;
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* CHAT TAB */
.chat-pane {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.ai-avatar-badge {
  width: 36px;
  height: 36px;
  background: var(--primary-light);
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 18px;
}
.chat-header h3 { font-size: 14px; font-weight: 800; }
.ai-status { font-size: 11px; color: #16a34a; font-weight: 600; }

.quick-prompts-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 8px 0;
}
.prompt-chip {
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.prompt-chip:hover { border-color: var(--primary); color: var(--primary); }

.chat-messages-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
}
.chat-welcome { text-align: center; padding: 30px 20px; color: var(--text-sub); }
.welcome-robot { font-size: 36px; display: block; margin-bottom: 8px; }
.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.4;
}
.bubble-user {
  align-self: flex-end;
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 2px;
}
.bubble-user .bubble-header { color: #cde6e4; font-size: 10px; font-weight: 700; margin-bottom: 2px; }
.bubble-assistant {
  align-self: flex-start;
  background: #f1f5f9;
  color: var(--text-main);
  border-bottom-left-radius: 2px;
}
.bubble-assistant .bubble-header { color: var(--primary); font-size: 10px; font-weight: 700; margin-bottom: 2px; }

.chat-input-bar {
  display: flex;
  gap: 8px;
}
.chat-text-input {
  flex: 1;
  border: 1px solid var(--border-color);
  background: #fff;
  padding: 12px 14px;
  border-radius: 20px;
  font-size: 13px;
}
.send-msg-btn {
  background: var(--primary);
  color: #fff;
  border: 0;
  padding: 0 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

/* PROFILE & AUTH TAB */
.profile-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
}
.profile-avatar-large {
  width: 60px;
  height: 60px;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 24px;
  font-weight: 800;
  margin: 0 auto 10px;
}
.profile-email { font-size: 12px; color: var(--text-sub); margin-bottom: 16px; }
.profile-stats-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  border-block: 1px solid var(--border-color);
  padding: 12px 0;
  margin-bottom: 16px;
}
.stat-box strong { font-size: 18px; color: var(--primary); display: block; }
.stat-box small { font-size: 11px; color: var(--text-sub); }
.logout-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 0;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.auth-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}
.auth-tab {
  flex: 1;
  background: transparent;
  border: 0;
  padding: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub);
  border-bottom: 2px solid transparent;
}
.auth-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.auth-form-body { display: flex; flex-direction: column; gap: 12px; }
.auth-error-msg { font-size: 12px; color: #dc2626; margin: 0; }
.auth-submit-btn { width: 100%; margin-top: 6px; }

/* BOTTOM NAVIGATION BAR (FIXED BOTTOM FOR MOBILE) */
.app-bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 50;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.04);
}
.nav-item {
  background: transparent;
  border: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: #64748b;
  flex: 1;
  transition: all .2s;
}
.nav-icon { font-size: 18px; }
.nav-label { font-size: 10px; font-weight: 700; }
.nav-item.active {
  color: var(--primary);
}
.nav-item.active .nav-icon { transform: scale(1.15); }

/* MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
}
.modal-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.close-modal-btn {
  background: #f1f5f9;
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 800;
}
.splitter-body { display: flex; flex-direction: column; gap: 14px; }
.splitter-result-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}
.splitter-result-box small { font-size: 10px; font-weight: 800; color: #16a34a; }
.splitter-result-box strong { display: block; font-size: 24px; color: var(--accent); margin: 6px 0; }
.splitter-result-box p { font-size: 11px; color: var(--text-sub); }

/* TRAVEL PASS / BOARDING PASS */
.boarding-pass {
  background: #f8fafc;
  border: 2px dashed #94a3b8;
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 14px;
}
.pass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 12px;
}
.pass-logo { font-size: 13px; font-weight: 800; color: var(--primary); }
.pass-dest { font-size: 16px; font-weight: 800; color: var(--accent); }
.pass-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.pass-row small { display: block; font-size: 9px; color: var(--text-sub); font-weight: 700; }
.pass-row b { font-size: 13px; }
.pass-hotel {
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}
.pass-hotel small { font-size: 9px; font-weight: 700; color: var(--primary); }
.pass-hotel b { display: block; font-size: 12px; margin: 2px 0; }
.pass-hotel p { font-size: 11px; color: var(--text-sub); margin: 0; }
.pass-qr-sim {
  text-align: center;
  border-top: 1px dashed var(--border-color);
  padding-top: 10px;
}
.qr-mockup {
  display: inline-block;
  background: #1e293b;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 4px;
}
.pass-qr-sim small { display: block; font-size: 10px; color: var(--text-sub); }

/* RESPONSIVE TRÊN MÁY TÍNH & MOBILE */
@media (max-width: 640px) {
  .app-form-grid { grid-template-columns: 1fr; }
  .app-field.full-width { grid-column: span 1; }
  .hotel-main-info { flex-direction: column; }
  .hotel-side { text-align: left; }
  .places-app-grid { grid-template-columns: 1fr; }
}

@media print {
  .app-header, .app-bottom-nav, .plan-tool-actions, .app-map-box, .mode-toggle-btn {
    display: none !important;
  }
  .app-root, .app-container {
    background: #fff;
    box-shadow: none;
    padding: 0;
  }
}
</style>
