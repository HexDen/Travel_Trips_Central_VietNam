<template>
  <div class="app-root" :class="{ 'app-intro-zoom': showIntroSplash && !introSplitting }">
    <div class="app-container">
      
      <!-- TOP HEADER CỦA APP (ĐÃ TÁCH COMPONENT) -->
      <AppHeader
        :activeTab="activeTab"
        :nguoiDung="nguoiDung"
        :isDark="isDark"
        @update:activeTab="handleTabChange"
        @openAuth="hienAuthModal = true"
        @toggleDark="toggleDark"
      />

      <!-- FLOATING PERSONALITY TOAST (KHI AI TẠO XONG LỊCH TRÌNH HOẶC THÔNG BÁO QUAN TRỌNG) -->
      <transition name="toast-slide">
        <div v-if="personalityToast" class="personality-floating-toast" @click="personalityToast = null">
          <div class="pft-icon">{{ personalityToast.icon }}</div>
          <div class="pft-body">
            <strong>{{ personalityToast.title }}</strong>
            <p>{{ personalityToast.desc }}</p>
          </div>
          <button class="pft-close">✕</button>
        </div>
      </transition>

      <!-- KHÔNG GIAN NỘI DUNG CHÍNH (THEO TỪNG TAB APP) -->
      <main class="app-main">

        <!-- ==================== TAB ADMIN ==================== -->
        <section v-if="activeTab === 'admin'" class="tab-pane p-0 m-0 w-full" style="max-width: 100%; padding: 0;">
          <AdminDashboard />
        </section>

        <!-- ==================== TAB 1: KHÁM PHÁ (EXPLORE) ==================== -->
        <section v-if="activeTab === 'explore'" class="tab-pane">
          <!-- Banner Hero App -->
          <div class="app-hero-card">
            <div class="hero-content">
              <span class="hero-badge">AI TRAVEL ASSISTANT</span>
              <h2>Lên lịch đi chơi, đừng lên lịch cãi nhau.</h2>
              <p>AI sắp xếp lịch trình, bạn chỉ cần quyết định... ai trả tiền.</p>
              <button class="hero-cta-btn" @click="startPlannerTransition">
                <span>Lên lịch trình ngay</span>
                <strong>→</strong>
              </button>
            </div>
          </div>

          <!-- Thanh chọn nhanh Tỉnh/Thành phố dạng Thẻ Ảnh -->
          <div class="explore-section" v-reveal>
            <div class="section-title-row">
              <h3>Điểm đến nổi tiếng</h3>
              <div class="province-mode-wrapper">
                <div class="province-mode-switch" role="group" aria-label="Chế độ địa giới">
                  <button type="button" :class="{ active: provinceMode === 'merged' }" @click="doiCheDoTinhThanh('merged')">Sau sáp nhập</button>
                  <button type="button" :class="{ active: provinceMode === 'pre-merged' }" @click="doiCheDoTinhThanh('pre-merged')">Trước sáp nhập</button>
                </div>
                <div class="province-tooltip-trigger" tabindex="0">
                  <span class="tooltip-icon">ℹ️</span>
                  <div class="province-tooltip-popover">
                    <strong>Địa giới hành chính:</strong>
                    <p>• <b>Sau sáp nhập</b>: Xem theo địa giới mới nhất (Huế thành phố trực thuộc Trung ương, Đà Nẵng, Quảng Nam...).</p>
                    <p>• <b>Trước sáp nhập</b>: Xem theo các tỉnh thành truyền thống cũ để dễ tra cứu điểm du lịch quen thuộc.</p>
                  </div>
                </div>
              </div>
              <div class="city-music-toolbar">
                <button
                  type="button"
                  class="music-master-toggle"
                  :class="{ muted: musicMuted }"
                  @click="toggleMusicMute"
                  :aria-label="musicMuted ? 'Bật nhạc' : 'Tắt nhạc'"
                  :aria-pressed="!musicMuted"
                >{{ musicMuted ? '🔇' : '🔊' }}</button>
                <label class="music-volume-label" for="city-music-volume">🔊</label>
                <input
                  id="city-music-volume"
                  v-model.number="musicVolume"
                  class="music-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  aria-label="Âm lượng nhạc điểm đến"
                />
                <span class="badge-count">{{ visibleCities.length }} Tỉnh/TP</span>
              </div>
            </div>
            <div class="cities-carousel">
              <div
                v-for="city in visibleDestinationCards"
                :key="city.name"
                :class="['city-card-btn', { active: formDuLieu.diemDen === city.name }]"
                @click="chonDiemDenExplore(city.name)"
                @keydown.enter="chonDiemDenExplore(city.name)"
                @keydown.space.prevent="chonDiemDenExplore(city.name)"
                role="button"
                tabindex="0"
                :style="city.name === ALL_DESTINATIONS ? {
                  background: 'linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)'
                } : {
                  backgroundImage: `url(${city.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }"
              >
                <!-- SVG location pin thay emoji -->
                <span class="city-pin-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
                    <circle cx="12" cy="9" r="2.5" fill="rgba(0,0,0,0.3)"/>
                  </svg>
                </span>
                <span class="city-name">{{ city.displayName || city.name }}</span>
                <small class="city-tag">{{ city.tag }}</small>
              </div>
            </div>
          </div>

          <!-- Widget Thời tiết thời gian thực -->
          <div v-if="thoiTiet" class="app-weather-widget" v-reveal>
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
          <div class="explore-section" v-reveal>
            <div class="section-title-row">
              <div>
                <h3>Địa điểm & Đặc sản tại {{ formDuLieu.diemDen === ALL_DESTINATIONS ? 'Miền Trung' : formDuLieu.diemDen }}</h3>
                <small class="sub-region-hint ai-province-subtitle" v-if="aiProvinceSubtitle">{{ aiProvinceSubtitle }}</small>
                <small class="sub-region-hint" v-else>(Khu vực mở rộng sau sáp nhập)</small>
              </div>
              <div class="filter-pills">
                <button
                  :class="['filter-pill', { active: filterExploreType === 'all' }]"
                  @click="filterExploreType = 'all'"
                >Tất cả ({{ places.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'attraction' }]"
                  @click="filterExploreType = 'attraction'"
                >🏛️ Thắng cảnh ({{ attractionsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'restaurant' }]"
                  @click="filterExploreType = 'restaurant'"
                >🍜 Đặc sản ({{ restaurantsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'hotel' }]"
                  @click="filterExploreType = 'hotel'"
                >🏨 Khách sạn ({{ hotelsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'cafe' }]"
                  @click="filterExploreType = 'cafe'"
                >☕ Cafe ({{ cafesList.length }})</button>
              </div>
            </div>

            <!-- Thanh tìm kiếm nhanh địa danh, món ăn, bãi biển -->
            <div class="explore-search-box">
              <input
                v-model="searchExploreQuery"
                class="explore-search-input"
                :placeholder="'🔍 Tìm kiếm địa danh, di tích, món ăn, bãi biển tại ' + (formDuLieu.diemDen === ALL_DESTINATIONS ? 'Miền Trung' : formDuLieu.diemDen) + '...'"
              />
              <button v-if="searchExploreQuery" class="clear-search-btn" @click="searchExploreQuery = ''">✕</button>
            </div>

            <!-- Grid Thẻ Địa điểm CÓ HÌNH ẢNH NỔI BẬT -->
            <div v-if="loadingPlaces" class="places-app-grid">
              <SkeletonCard v-for="i in 5" :key="'skeleton-' + i" />
            </div>
            <div v-else-if="filteredExplorePlaces.length">
              <div class="places-app-grid">
                <article v-for="place in displayedExplorePlaces" :key="place._id || place.name" class="app-place-card" v-reveal>
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

              <!-- Thanh nút Xem thêm / Thu gọn khi có nhiều hơn 5 địa điểm -->
              <div v-if="filteredExplorePlaces.length > 5" class="load-more-container">
                <button
                  v-if="exploreLimit < filteredExplorePlaces.length"
                  class="load-more-btn"
                  @click="xemThemDiaDiem"
                >
                  <span class="load-more-text">Xem thêm địa điểm</span>
                  <span class="load-more-count">(Còn {{ filteredExplorePlaces.length - exploreLimit }})</span>
                  <span class="load-more-icon">▾</span>
                </button>
                <button
                  v-if="exploreLimit > 5"
                  class="collapse-btn"
                  @click="thuGonDiaDiem"
                >
                  <span>Thu gọn</span>
                  <span class="load-more-icon">▴</span>
                </button>
              </div>
            </div>
            <p v-else class="empty-state-text">Chưa có dữ liệu địa điểm cho khu vực này.</p>
            
            <!-- BẢN ĐỒ TƯƠNG TÁC (MapComponent) -->
            <div v-if="!loadingPlaces && filteredExplorePlaces.length > 0" style="margin-top: 32px;">
              <div class="section-title-row">
                <h3>🗺️ Bản đồ các điểm đến</h3>
              </div>
              <MapComponent :places="filteredExplorePlaces" :centerCity="formDuLieu.diemDen" />
            </div>
          </div>
        </section>


        <!-- ==================== TAB 2: LẬP KẾ HOẠCH (PLANNER) ==================== -->
        <section v-if="activeTab === 'planner'" class="tab-pane planner-tab-bg">

          <!-- Banner ảnh collage Miền Trung tại vị trí khoanh đỏ -->
          <div class="planner-hero-banner">
            <img
              src="/images/mientrung-collage.jpg"
              alt="Hành trình Miền Trung - Di sản & Biển xanh"
              class="planner-hero-banner-img"
            />
          </div>

          <!-- BƯỚC NHẬP THÔNG TIN KẾ HOẠCH -->
          <div class="planner-form-container planner-glass-form">
            <div class="pane-header">
              <div>
                <span class="sub-heading">AI TRIP PLANNER</span>
                <h2>Thiết kế hành trình của bạn</h2>
              </div>
              <div class="planner-header-actions">
                <button
                  type="button"
                  class="music-master-toggle planner-music-toggle"
                  :class="{ muted: musicMuted }"
                  @click="toggleMusicMute"
                  :aria-label="musicMuted ? 'Bật nhạc' : 'Tắt nhạc'"
                  :aria-pressed="!musicMuted"
                >{{ musicMuted ? '🔇' : '🔊' }}</button>
                <span class="planner-icon">✈</span>
              </div>
            </div>

            <!-- Tiến trình Wizard -->
            <div class="wizard-progress">
              <div :class="['step-indicator', { active: currentPlannerStep >= 1 }]">1. Điểm đến</div>
              <div class="step-divider"></div>
              <div :class="['step-indicator', { active: currentPlannerStep >= 2 }]">2. Tài chính</div>
              <div class="step-divider"></div>
              <div :class="['step-indicator', { active: currentPlannerStep >= 3 }]">3. Sở thích</div>
            </div>

            <!-- BƯỚC 1: ĐIỂM ĐẾN & THỜI GIAN -->
            <div v-show="currentPlannerStep === 1" class="app-form-grid wizard-step-content">
              <!-- AI Message bubble — 10 câu luân phiên ngẫu nhiên -->
              <div class="ai-hint-bubble full-width" v-if="showAiHintBubble">
                <div class="ai-hint-robot"><img src="/shrek.jpg" style="width: 44px; height: 44px; object-fit: cover; border-radius: 50%; display: block;" alt="AI Robot" /></div>
                <div class="ai-hint-body">
                  <div class="ai-hint-content">
                    <p v-html="aiCurrentHint"></p>
                  </div>
                  <div class="ai-hint-chips">
                    <span class="ai-chip" @click="chonNhanhDiemDen('Đà Nẵng')">🌉 Đà Nẵng</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Huế')">👑 Huế</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Nghệ An')">🌾 Nghệ An</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Lâm Đồng')">🌲 Đà Lạt</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Khánh Hòa')">⛵ Nha Trang</span>
                    <span class="ai-chip ai-chip-refresh" @click="refreshAiHint()">🔀 Câu khác</span>
                  </div>
                </div>
                <button class="ai-hint-close" @click="showAiHintBubble = false" title="Dong goi y">✕</button>
              </div>
              <!-- CHỌN ĐIỂM BẮT ĐẦU (KHỞI HÀNH) GỌN GÀNG -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <label>🚩 Điểm bắt đầu (Khởi hành)</label>
                  <div class="province-mode-switch planner-mode-switch origin-mode-switch" role="group">
                    <button type="button" :class="{ active: originProvinceMode === 'merged' }" @click="originProvinceMode = 'merged'">Sau sáp nhập</button>
                    <button type="button" :class="{ active: originProvinceMode === 'pre-merged' }" @click="originProvinceMode = 'pre-merged'">Trước sáp nhập</button>
                  </div>
                  <span class="route-origin-tag" v-if="formDuLieu.diemKhoiHanh">Xuất phát: <b>{{ formDuLieu.diemKhoiHanh }}</b></span>
                </div>
                <div class="origin-select-wrapper">
                  <input
                    v-model="formDuLieu.diemKhoiHanh"
                    class="app-input origin-combo-input"
                    :list="'origin-list-' + originProvinceMode"
                    placeholder="🔍 Tìm hoặc chọn tỉnh/thành xuất phát..."
                    autocomplete="off"
                  />
                  <datalist :id="'origin-list-' + originProvinceMode">
                    <option
                      v-for="city in popularOrigins"
                      :key="city.name"
                      :value="city.name"
                    >{{ city.icon }} {{ city.name }}</option>
                  </datalist>
                  <!-- Gợi ý nhanh: chỉ hiện 6 thành phố phổ biến nhất -->
                  <div class="origin-quick-picks">
                    <button
                      v-for="city in popularOrigins.slice(0, 6)"
                      :key="'pick-' + city.name"
                      type="button"
                      :class="['origin-pick-btn', { active: formDuLieu.diemKhoiHanh === city.name }]"
                      @click="chonDiemKhoiHanh(city.name)"
                      :title="city.name"
                    >{{ city.name }}</button>
                  </div>
                </div>
              </div>

              <!-- LỘ TRÌNH VÀ CỰ LY TỐI ƯU SIÊU GỌN -->
              <div class="route-overview-banner compact full-width">
                <div class="rob-point">
                  <span class="rob-dot start"></span>
                  <span class="rob-label">Nơi đi:</span>
                  <strong>{{ formDuLieu.diemKhoiHanh || 'Chưa chọn' }}</strong>
                </div>
                <div class="rob-mid-compact">
                  <span class="rob-dash-line"></span>
                  <span class="rob-dist-pill">🛣️ ~{{ transitRouteInfo.estimatedDistanceKm || transitRouteInfo.distanceKm || 350 }} km</span>
                </div>
                <div class="rob-point">
                  <span class="rob-dot end"></span>
                  <span class="rob-label">Nơi đến:</span>
                  <strong>{{ formDuLieu.diemDen }}</strong>
                </div>
              </div>

              <!-- Chọn Thành phố -->
              <div class="app-field full-width">
                <label>Điểm đến du lịch</label>
                <div class="province-mode-wrapper">
                  <div class="province-mode-switch planner-mode-switch" role="group" aria-label="Chế độ địa giới">
                    <button type="button" :class="{ active: provinceMode === 'merged' }" @click="doiCheDoTinhThanh('merged')">Sau sáp nhập</button>
                    <button type="button" :class="{ active: provinceMode === 'pre-merged' }" @click="doiCheDoTinhThanh('pre-merged')">Trước sáp nhập</button>
                  </div>
                  <div class="province-tooltip-trigger" tabindex="0">
                    <span class="tooltip-icon">ℹ️</span>
                    <div class="province-tooltip-popover">
                      <strong>Địa giới hành chính:</strong>
                      <p>• <b>Sau sáp nhập</b>: Xem theo địa giới mới nhất (Huế thành phố trực thuộc Trung ương, Đà Nẵng, Quảng Nam...).</p>
                      <p>• <b>Trước sáp nhập</b>: Xem theo các tỉnh thành truyền thống cũ để dễ tra cứu điểm du lịch quen thuộc.</p>
                    </div>
                  </div>
                </div>
                <div class="quick-city-selector">
                  <div
                    v-for="c in visibleCities"
                    :key="c.name"
                    :class="['city-select-pill', { active: formDuLieu.diemDen === c.name }]"
                    @click="chonNhanhDiemDen(c.name)"
                    role="button"
                    tabindex="0"
                    @keydown.enter="chonNhanhDiemDen(c.name)"
                    @keydown.space.prevent="chonNhanhDiemDen(c.name)"
                  >
                    <span>{{ c.name }}</span>
                  </div>
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

            </div>

            <!-- BƯỚC 2: TÀI CHÍNH & DI CHUYỂN -->
            <div v-show="currentPlannerStep === 2" class="app-form-grid wizard-step-content">
              <!-- Ngân sách -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <label>Ngân sách dự kiến (VND)</label>
                  <strong class="budget-highlight">{{ dinhDangTien(formDuLieu.nganSach) }}đ</strong>
                </div>
                <input
                  type="range"
                  v-model.number="formDuLieu.nganSach"
                  min="100000"
                  max="30000000"
                  step="100000"
                  class="budget-slider"
                />

                <!-- Phím tắt chọn nhanh ngân sách -->
                <div class="quick-budget-chips">
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 100000 }"
                    @click="formDuLieu.nganSach = 100000"
                  >
                    100K 🚨
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 500000 }"
                    @click="formDuLieu.nganSach = 500000"
                  >
                    500K 💸
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 1500000 }"
                    @click="formDuLieu.nganSach = 1500000"
                  >
                    1.5 Tr 🎒
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 3500000 }"
                    @click="formDuLieu.nganSach = 3500000"
                  >
                    3.5 Tr ✨
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 7000000 }"
                    @click="formDuLieu.nganSach = 7000000"
                  >
                    7 Tr 🏖️
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 15000000 }"
                    @click="formDuLieu.nganSach = 15000000"
                  >
                    15 Tr 💎
                  </button>
                </div>

                <!-- DỰ TOÁN CHI PHÍ THÔNG MINH (DYNAMIC BUDGET BREAKDOWN) -->
                <div class="dynamic-budget-card">
                  <div class="dbc-header">
                    <div class="dbc-title-group">
                      <span class="dbc-icon">📊</span>
                      <div>
                        <strong>Dự toán phân bổ thông minh theo ngân sách</strong>
                        <small>AI tự động tính toán chi phí ước tính theo số người ({{ formDuLieu.soNguoi }} người) & số ngày ({{ formDuLieu.soNgay }} ngày)</small>
                      </div>
                    </div>
                    <span class="dbc-total-badge">{{ dinhDangTien(formDuLieu.nganSach) }}đ</span>
                  </div>

                  <!-- Thanh tiến trình phân bổ 4 tỷ lệ màu sắc -->
                  <div class="dbc-progress-bar">
                    <div class="dbc-seg seg-hotel" :style="{ width: dynamicBudget.hotelPercent + '%' }" title="Khách sạn 35%"></div>
                    <div class="dbc-seg seg-food" :style="{ width: dynamicBudget.foodPercent + '%' }" title="Ăn uống 35%"></div>
                    <div class="dbc-seg seg-transit" :style="{ width: dynamicBudget.transportPercent + '%' }" title="Di chuyển & Vé 20%"></div>
                    <div class="dbc-seg seg-reserve" :style="{ width: dynamicBudget.reservePercent + '%' }" title="Dự phòng 10%"></div>
                  </div>

                  <!-- Grid 4 danh mục chi phí cụ thể -->
                  <div class="dbc-grid">
                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-hotel"></span>
                        <span class="dbc-cat">🏨 Khách sạn (~35%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.hotel) }}đ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.hotelDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-food"></span>
                        <span class="dbc-cat">🍜 Ăn uống (~35%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.food) }}đ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.foodDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-transit"></span>
                        <span class="dbc-cat">🚗 Di chuyển & Vé (~20%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.transportAndTickets) }}đ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.transitDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-reserve"></span>
                        <span class="dbc-cat">🛡️ Dự phòng (~10%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.reserve) }}đ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.reserveDesc }}</small>
                    </div>
                  </div>
                </div>

                <!-- Lời khuyên tính cách AI theo ngân sách -->
                <div :class="['personality-budget-card', thongDiepNganSach.type]">
                  <div class="pbc-header">
                    <span class="pbc-icon">{{ thongDiepNganSach.icon }}</span>
                    <span class="pbc-tag">{{ thongDiepNganSach.tag }}</span>
                  </div>
                  <div class="pbc-text">
                    <strong>{{ thongDiepNganSach.title }}</strong>
                    <p>{{ thongDiepNganSach.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Phương tiện & Khách sạn -->
              <div class="app-field">
                <label>Phương tiện di chuyển</label>
                <select v-model="formDuLieu.phuongTien" class="app-select">
                  <option value="xe khách">🚌 Xe khách chất lượng cao (Tiết kiệm nhất)</option>
                  <option value="tàu hỏa">🚆 Tàu hỏa (Ngắm cảnh)</option>
                  <option value="máy bay">✈️ Máy bay + Thuê xe</option>
                  <option value="xe máy">🏍️ Xe máy / Phượt</option>
                  <option value="ô tô">🚗 Ô tô / Xe du lịch</option>
                  <option value="linh hoạt">🌐 Linh hoạt</option>
                </select>
              </div>

              <div class="app-field">
                <div class="field-label-between">
                  <label>Yêu cầu khách sạn</label>
                  <small class="input-hint-small">Bấm chọn nhanh hoặc tự gõ</small>
                </div>
                <input
                  v-model="formDuLieu.yeuCauKhachSan"
                  class="app-input enhanced-input"
                  placeholder="Gần biển, view hoàng hôn, có hồ bơi..."
                />
                <!-- Quick Tag Chips cho Khách sạn -->
                <div class="quick-tags-wrap">
                  <button
                    v-for="tag in hotelQuickTags"
                    :key="tag"
                    type="button"
                    :class="['quick-tag-chip', { active: isHotelTagActive(tag) }]"
                    @click="toggleHotelTag(tag)"
                  >
                    <span>{{ tag }}</span>
                  </button>
                </div>
              </div>

              <!-- TỐI ƯU CHI PHÍ GIÁ XE & GỢI Ý NHÀ XE GIÁ RẺ -->
              <div class="bus-optimization-section full-width">
                <div class="bos-header">
                  <div>
                    <span class="bos-kicker">🚌 TỐI ƯU CHI PHÍ GIÁ XE & DI CHUYỂN</span>
                    <h3>Gợi ý nhà xe giá rẻ tuyến {{ formDuLieu.diemKhoiHanh }} ➔ {{ formDuLieu.diemDen }}</h3>
                  </div>
                  <div class="bos-badges-group">
                    <span class="bos-dist-badge">Cự ly: ~{{ transitRouteInfo.estimatedDistanceKm || transitRouteInfo.distanceKm || 350 }} km</span>
                    <span class="bos-crawler-badge" title="Tự động cập nhật giá vé từ các nhà xe và đường sắt">
                      🤖 Cào dữ liệu vé xe & vé tàu: Sẵn sàng
                    </span>
                  </div>
                </div>

                <!-- So sánh chi phí các phương tiện -->
                <div class="transit-vehicles-grid" v-reveal>
                  <div
                    v-for="v in transitRouteInfo.vehicleComparison"
                    :key="v.type"
                    :class="['tv-card', {
                      active: (v.type === 'bus' && formDuLieu.phuongTien === 'xe khách') ||
                              (v.type === 'flight' && formDuLieu.phuongTien === 'máy bay') ||
                              (v.type === 'train' && formDuLieu.phuongTien === 'tàu hỏa') ||
                              (v.type === 'motorbike' && formDuLieu.phuongTien === 'xe máy'),
                      'highlight-cheapest': v.is_cheapest
                    }]"
                    @click="chonPhuongTienTuSoSanh(v)"
                    role="button"
                    tabindex="0"
                  >
                    <div class="tv-top">
                      <span class="tv-icon">{{ v.icon }}</span>
                      <span v-if="v.is_cheapest" class="tv-badge cheapest">💡 Rẻ nhất</span>
                      <span v-else-if="v.is_fastest" class="tv-badge fastest">⚡ Nhanh nhất</span>
                    </div>
                    <div class="tv-title">{{ v.name }}</div>
                    <div class="tv-price-row">
                      <strong>{{ dinhDangTien(v.estimated_cost_per_person) }}đ</strong>
                      <small>/người</small>
                    </div>
                    <div class="tv-total" v-if="formDuLieu.soNguoi > 1">
                      Tổng {{ formDuLieu.soNguoi }} người: <b>{{ dinhDangTien(v.estimated_cost_per_person * formDuLieu.soNguoi) }}đ</b>
                    </div>
                    <div class="tv-duration">⏱️ {{ v.duration }}</div>
                    <p class="tv-advantage">{{ v.advantage }}</p>
                  </div>
                </div>

                <!-- Nút chuyển tab Xem Vé Xe Khách vs Vé Tàu Hỏa -->
                <div class="transit-tabs-header">
                  <button
                    type="button"
                    :class="['transit-subtab-btn', { active: transitTab === 'bus' }]"
                    @click="transitTab = 'bus'"
                  >
                    🚌 Vé Xe Khách Giá Rẻ ({{ transitRouteInfo.operators?.length || 0 }})
                  </button>
                  <button
                    type="button"
                    :class="['transit-subtab-btn', { active: transitTab === 'train' }]"
                    @click="transitTab = 'train'"
                  >
                    🚆 Vé Tàu Hỏa Thống Nhất ({{ transitRouteInfo.trains?.length || 3 }})
                  </button>
                </div>

                <!-- TAB 1: Danh sách gợi ý nhà xe giá rẻ -->
                <div v-show="transitTab === 'bus'" class="bus-operators-box">
                  <div class="bob-title-row">
                    <h4>Top nhà xe giá rẻ & uy tín khuyên dùng</h4>
                    <small>Bấm "Chọn xe này" để đưa vào dự toán chi phí tự động</small>
                  </div>

                  <div class="bus-operators-grid">
                    <div
                      v-for="bus in transitRouteInfo.operators"
                      :key="bus.id"
                      :class="['bus-item-card', { selected: formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id }]"
                    >
                      <div class="bic-header">
                        <div>
                          <div class="bic-name-row">
                            <span class="bic-name">{{ bus.name }}</span>
                            <span class="bic-tag" v-if="bus.badge">{{ bus.badge }}</span>
                          </div>
                          <span class="bic-type">{{ bus.type }}</span>
                        </div>
                        <div class="bic-rating">
                          ⭐ {{ bus.rating }} <small>({{ bus.reviews }} đánh giá)</small>
                        </div>
                      </div>

                      <div class="bic-specs">
                        <div class="bic-spec">
                          <span>⏱️ Thời gian:</span>
                          <b>{{ bus.duration }}</b>
                        </div>
                        <div class="bic-spec">
                          <span>🕒 Giờ chạy:</span>
                          <b>{{ bus.depart_times }}</b>
                        </div>
                        <div class="bic-spec">
                          <span>📍 Điểm đón/trả:</span>
                          <small>{{ bus.pickup }} ➔ {{ bus.dropoff }}</small>
                        </div>
                      </div>

                      <div class="bic-footer-clean">
                        <!-- Hàng 1: Giá vé niêm yết & Tổng chi phí đoàn -->
                        <div class="bic-price-line">
                          <div class="bpl-left">
                            <span class="bpl-label">Giá vé:</span>
                            <strong class="bpl-unit">{{ dinhDangTien(bus.price) }}đ</strong>
                            <small class="bpl-sub">/người</small>
                          </div>
                          <div class="bpl-right" v-if="formDuLieu.soNguoi > 1">
                            <span class="bpl-total-badge">
                              Tổng {{ formDuLieu.soNguoi }} vé: <b>{{ dinhDangTien(bus.price * formDuLieu.soNguoi) }}đ</b>
                            </span>
                          </div>
                        </div>

                        <!-- Hàng 2: Hai nút hành động chia đều 50/50 -->
                        <div class="bic-actions-row">
                          <a :href="`tel:${bus.hotline}`" class="bic-action-call" title="Gọi tổng đài đặt vé">
                            📞 {{ bus.hotline }}
                          </a>
                          <button
                            type="button"
                            :class="['bic-action-select', { active: formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id }]"
                            @click="chonNhaXe(bus)"
                          >
                            {{ formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id ? '✓ Đã chọn xe' : 'Chọn xe này' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- TAB 2: Danh sách vé tàu hỏa Thống Nhất (Đường Sắt Việt Nam) -->
                <div v-show="transitTab === 'train'" class="train-operators-box">
                  <div class="bob-title-row">
                    <h4>Lịch trình & Giá vé Tàu Hỏa (Tổng công ty Đường sắt Việt Nam)</h4>
                    <small>Trải nghiệm ngắm cảnh biển Lăng Cô, đèo Hải Vân và các cung đường di sản</small>
                  </div>

                  <div class="bus-operators-grid">
                    <div
                      v-for="train in transitRouteInfo.trains"
                      :key="train.id"
                      :class="['bus-item-card train-card', { selected: formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id }]"
                    >
                      <div class="bic-header">
                        <div>
                          <div class="bic-name-row">
                            <span class="bic-name">{{ train.name }}</span>
                            <span class="bic-tag train-tag" v-if="train.badge">{{ train.badge }}</span>
                          </div>
                          <span class="bic-type">{{ train.type }}</span>
                        </div>
                        <div class="bic-rating">
                          ⭐ {{ train.rating }} <small>(Tàu Thống Nhất)</small>
                        </div>
                      </div>

                      <div class="bic-specs">
                        <div class="bic-spec">
                          <span>⏱️ Thời gian:</span>
                          <b>{{ train.duration }}</b>
                        </div>
                        <div class="bic-spec">
                          <span>🕒 Giờ khởi hành:</span>
                          <b>{{ train.depart_times }}</b>
                        </div>
                        <div class="bic-spec">
                          <span>🚉 Ga đi ➔ Ga đến:</span>
                          <small>{{ train.depart_station }} ➔ {{ train.arrive_station }}</small>
                        </div>
                      </div>

                      <div class="bic-footer-clean">
                        <!-- Hàng 1: Giá vé tàu -->
                        <div class="bic-price-line">
                          <div class="bpl-left">
                            <span class="bpl-label">Giá vé tàu:</span>
                            <strong class="bpl-unit train-price-color">{{ dinhDangTien(train.price) }}đ</strong>
                            <small class="bpl-sub">/người</small>
                          </div>
                          <div class="bpl-right" v-if="formDuLieu.soNguoi > 1">
                            <span class="bpl-total-badge train-total-badge">
                              Tổng {{ formDuLieu.soNguoi }} vé: <b>{{ dinhDangTien(train.price * formDuLieu.soNguoi) }}đ</b>
                            </span>
                          </div>
                        </div>

                        <!-- Hàng 2: Hai nút hành động đặt vé và chọn tàu -->
                        <div class="bic-actions-row">
                          <a :href="train.booking_url" target="_blank" rel="noopener noreferrer" class="bic-action-call train-call" title="Đặt vé trực tuyến tại dsvn.vn">
                            🎫 Đặt tại dsvn.vn ↗
                          </a>
                          <button
                            type="button"
                            :class="['bic-action-select train-select-btn', { active: formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id }]"
                            @click="chonTauHoa(train)"
                          >
                            {{ formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id ? '✓ Đã chọn tàu' : 'Chọn tàu này' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sở thích -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <label>Sở thích & Trải nghiệm (Không bắt buộc)</label>
                  <small class="input-hint-small">Bấm chọn nhanh hoặc tự gõ</small>
                </div>
                <input
                  v-model="chuoiSoThich"
                  class="app-input enhanced-input"
                  placeholder="Để trống hoặc nhập nếu bạn có yêu cầu riêng (ví dụ: hải sản, check-in, tắm biển...)"
                />
                <!-- Quick Tag Chips cho Sở thích -->
                <div class="quick-tags-wrap">
                  <button
                    v-for="tag in interestQuickTags"
                    :key="tag"
                    type="button"
                    :class="['quick-tag-chip', { active: isInterestTagActive(tag) }]"
                    @click="toggleInterestTag(tag)"
                  >
                    <span>{{ tag }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- BƯỚC 3: SỞ THÍCH & ĐỊA ĐIỂM -->
            <div v-show="currentPlannerStep === 3" class="wizard-step-content">
            <!-- BỘ CHỌN ĐỊA ĐIỂM & ĐẶC SẢN NỔI TIẾNG THEO THÀNH PHỐ -->
            <div class="places-picker-box" style="margin-top:0">
              <div class="picker-top">
                <div>
                  <small class="picker-kicker">GỢI Ý ĐỊA PHƯƠNG — BẤM ĐỂ CHỌN</small>
                  <h4>Bạn muốn ghé địa điểm & quán ngon nào tại {{ formDuLieu.diemDen }}?</h4>
                </div>
                <span v-if="selectedPlaces.length" class="badge-selected-count">
                  ✓ Đã chọn {{ selectedPlaces.length }} điểm
                </span>
              </div>

              <!-- Thông báo AI Crawler -->
              <div v-if="thongBaoCrawl" class="crawl-alert-banner">
                <span>{{ thongBaoCrawl }}</span>
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
                <span class="row-label">🍜 Quán đặc sản:</span>
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

              <!-- Nhóm Khách sạn -->
              <div v-if="hotelsList.length" class="picker-row">
                <span class="row-label">🏨 Khách sạn:</span>
                <div class="chips-wrap">
                  <button
                    v-for="p in hotelsList"
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

            <!-- ĐÓNG BƯỚC 3 -->
            </div>

            <!-- WIZARD FOOTER NAVIGATION -->
            <div class="wizard-footer">
              <button 
                v-if="currentPlannerStep > 1" 
                @click="currentPlannerStep--" 
                class="app-secondary-btn"
                :disabled="dangTao"
              >
                ← Quay lại
              </button>
              
              <button 
                v-if="currentPlannerStep < 3" 
                @click="currentPlannerStep++" 
                class="app-primary-btn"
              >
                Tiếp theo →
              </button>

              <button
                v-if="currentPlannerStep === 3"
                class="app-primary-btn submit-plan-btn"
                @click="taoLichTrinh"
                :disabled="dangTao"
              >
                <span v-if="dangTao" class="btn-spinner"></span>
                <span>{{ dangTao ? 'AI đang lên kế hoạch...' : '✨ Tạo Lịch Trình' }}</span>
              </button>
            </div>
          </div>

          <!-- Personality AI Loading State (Khi AI đang tạo lịch trình) -->
          <div v-if="dangTao" class="ai-generating-card">
            <div class="ai-gen-radar">
              <div class="radar-pulse"></div>
              <div class="radar-center"><img src="/shrek.jpg" style="width: 58px; height: 58px; object-fit: cover; border-radius: 50%; display: block;" alt="AI Robot" /></div>
              <div class="radar-orb orb-1">🍜</div>
              <div class="radar-orb orb-2">🗺️</div>
              <div class="radar-orb orb-3">🚗</div>
              <div class="radar-orb orb-4">☀️</div>
            </div>
            <div class="ai-gen-body">
              <div class="ai-gen-badge">
                <span class="pulsing-dot"></span>
                AI TRAVEL ASSISTANT ĐANG LÀM VIỆC
              </div>
              <transition name="msg-slide" mode="out-in">
                <h3 :key="currentLoadingMessageIndex" class="ai-gen-message">
                  {{ currentLoadingMessage }}
                </h3>
              </transition>
              <div class="ai-gen-progress-track">
                <div class="ai-gen-progress-bar"></div>
              </div>
              <p class="ai-gen-sub">
                Đang rà soát quán ngon, điểm check-in và tối ưu tuyến đường cho chuyến đi {{ formDuLieu.diemDen }} của bạn!
              </p>
            </div>
          </div>

          <!-- KẾT QUẢ LỊCH TRÌNH CHI TIẾT -->
          <div v-if="lichTrinh" class="plan-results-container">
            <!-- Personality Completion Banner (Khi AI tạo lịch trình xong) -->
            <transition name="fade-slide">
              <div v-if="hienCompletionBanner" class="ai-completion-banner">
                <div class="acb-left">
                  <div class="acb-icon">{{ activeCompletionQuote.icon }}</div>
                </div>
                <div class="acb-content">
                  <div class="acb-badge">HÀNH TRÌNH ĐÃ SẴN SÀNG</div>
                  <h4>{{ activeCompletionQuote.title }}</h4>
                  <p>{{ activeCompletionQuote.desc }}</p>
                </div>
                <button class="acb-close" @click="hienCompletionBanner = false" title="Đóng banner">✕</button>
              </div>
            </transition>

            <!-- Thẻ tổng quan kết quả -->
            <div class="plan-summary-card">
              <div class="summary-meta">
                <div class="summary-top-tag">
                  <span class="plan-dest-badge">{{ lichTrinh.destination }}</span>
                  <span class="savings-badge">💡 Đã tối ưu tuyến đường & chi phí tiết kiệm</span>
                </div>
                <h2>Hành trình {{ lichTrinh.daysList.length }} Ngày Tuyệt Vời</h2>
                <p class="summary-budget">Tổng dự toán: <strong>{{ dinhDangTien(lichTrinh.total_budget) }}đ</strong> ({{ lichTrinh.people }} người · TB {{ dinhDangTien(Math.round(lichTrinh.total_budget / lichTrinh.people)) }}đ/người)</p>
                <!-- Personality Low Budget Callout in Plan Result -->
                <div v-if="lichTrinh.total_budget <= 500000" class="budget-humor-callout">
                  <span class="bhc-icon">{{ lichTrinh.total_budget <= 150000 ? '🚨' : '💸' }}</span>
                  <span class="bhc-text">
                    {{ lichTrinh.total_budget <= 150000 ? 'Cảnh báo ví nguy hiểm: Nhớ ngắm cảnh miễn phí và hạn chế nhìn menu nhé!' : 'Du lịch tối giản: Chúng ta không nghèo, chúng ta đang du lịch phong cách tối giản (tạm né hải sản 😭)!' }}
                  </span>
                </div>
              </div>

              <!-- Thanh phân bổ ngân sách khoa học -->
              <div v-if="lichTrinh.budget_breakdown" class="budget-breakdown-row">
                <div class="bb-pill"><span>🏨 Khách sạn:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.hotel) }}đ</b></div>
                <div class="bb-pill"><span>🍜 Ăn uống:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.food) }}đ</b></div>
                <div class="bb-pill"><span>🚗 Di chuyển:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.transportation) }}đ</b></div>
                <div class="bb-pill"><span>🎫 Vé & Check-in:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.tickets) }}đ</b></div>
                <div class="bb-pill"><span>🛡️ Dự phòng:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.reserve) }}đ</b></div>
              </div>

              <div class="plan-tool-actions">
                <button class="tool-btn ai-opt-highlight-btn" @click="toiUuCungDuongToanBo" title="Sắp xếp toàn bộ điểm đến theo vòng cung tối ưu di chuyển">
                  ⚡ AI Tối ưu thứ tự điểm đến
                </button>
                <a
                  :href="googleMapsAllStopsUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="tool-btn gmap-all-stops-btn"
                  title="Mở toàn bộ lộ trình trên Google Maps có sẵn GPS dẫn đường liên tục"
                >
                  🗺️ Mở toàn bộ trên Google Maps ↗
                </a>
                <button class="tool-btn zalo-share-btn" @click="moModalInfographic" title="Xuất lịch trình dạng thẻ Infographic để gửi nhóm Zalo/Messenger">
                  📱 Xuất thẻ chia sẻ Zalo
                </button>
                <button class="tool-btn" @click="hienBillSplitter = true" title="Tính tiền chia đều cho nhóm">
                  💰 Chia tiền nhóm
                </button>
                <button class="tool-btn" @click="hienTravelPass = true" title="Xuất vé hành trình offline">
                  🎫 Xuất vé Offline
                </button>
                <button class="tool-btn rain-btn" @click="moModalTranhMua(0)" :disabled="dangDieuChinh" title="Tự động đổi điểm tham quan trong nhà nếu trời mưa">
                  🌧️ Đổi lịch tránh mưa
                </button>
                <button class="tool-btn" @click="xuatPdf" title="In hoặc lưu PDF">
                  📄 Lưu PDF
                </button>
              </div>
            </div>

            <!-- TÓM TẮT PHƯƠNG ÁN XE KHÁCH TỐI ƯU CHI PHÍ -->
            <div v-if="lichTrinh.transit_summary || formDuLieu.nhaXeDaChon" class="trip-transit-summary-card">
              <div class="ttsc-main">
                <div class="ttsc-left">
                  <span class="ttsc-icon">🚌</span>
                  <div>
                    <div class="ttsc-badge">PHƯƠNG ÁN XE KHÁCH TỐI ƯU DI CHUYỂN</div>
                    <h3>{{ formDuLieu.nhaXeDaChon ? formDuLieu.nhaXeDaChon.name : (lichTrinh.transit_summary?.selected_bus?.name || 'Nhà xe khuyên dùng') }}</h3>
                    <p class="ttsc-meta">
                      <span>Loại xe: <b>{{ formDuLieu.nhaXeDaChon ? formDuLieu.nhaXeDaChon.type : 'Giường nằm cao cấp' }}</b></span> ·
                      <span>Tuyến: <b>{{ formDuLieu.diemKhoiHanh }} ➔ {{ lichTrinh.destination || formDuLieu.diemDen }}</b></span> ·
                      <span>Cự ly: <b>~{{ (lichTrinh.transit_summary?.estimated_distance_km || transitRouteInfo.estimatedDistanceKm) }} km</b></span>
                    </p>
                    <p class="ttsc-schedule" v-if="formDuLieu.nhaXeDaChon">
                      🕒 Giờ chạy: <b>{{ formDuLieu.nhaXeDaChon.depart_times }}</b> ({{ formDuLieu.nhaXeDaChon.duration }}) · Đón: {{ formDuLieu.nhaXeDaChon.pickup }}
                    </p>
                  </div>
                </div>
                <div class="ttsc-right">
                  <div class="ttsc-price-block">
                    <span class="ttsc-label">Giá vé:</span>
                    <strong class="ttsc-price">{{ dinhDangTien(formDuLieu.nhaXeDaChon?.price || 350000) }}đ</strong>
                    <small>/vé/người</small>
                    <div class="ttsc-total-calc" v-if="formDuLieu.soNguoi > 1">
                      Tổng {{ formDuLieu.soNguoi }} người: <b>{{ dinhDangTien((formDuLieu.nhaXeDaChon?.price || 350000) * formDuLieu.soNguoi) }}đ</b>
                    </div>
                  </div>
                  <div class="ttsc-actions-group" style="display: flex; gap: 8px; flex-direction: column; width: 100%;">
                    <a href="https://futabus.vn/" target="_blank" rel="noreferrer" class="ttsc-book-btn" style="background: var(--primary); color: white; padding: 10px 16px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s;">
                      🎫 Đặt vé Web/App
                    </a>
                    <a :href="`tel:${formDuLieu.nhaXeDaChon?.hotline || '19006067'}`" class="ttsc-call-btn" style="background: rgba(5, 150, 105, 0.1); color: var(--primary); padding: 10px 16px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--primary);">
                      📞 Tổng đài: {{ formDuLieu.nhaXeDaChon?.hotline || '1900 6067' }}
                    </a>
                  </div>
                </div>
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

            <!-- BỘ CHUYỂN ĐỔI CHẾ ĐỘ XEM (MAP VIEW TOGGLE - SEGMENTED CONTROL) -->
            <div class="itinerary-view-switcher" role="group" aria-label="Chế độ xem lịch trình">
              <button
                type="button"
                :class="['iv-btn', { active: itineraryViewMode === 'timeline' }]"
                @click="doiViewMode('timeline')"
                title="Chỉ xem danh sách chi tiết từng ngày"
              >
                <svg class="iv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span>Dạng danh sách (Timeline View)</span>
              </button>

              <button
                type="button"
                :class="['iv-btn', { active: itineraryViewMode === 'split' }]"
                @click="doiViewMode('split')"
                title="Xem kết hợp cả bản đồ và dòng thời gian"
              >
                <svg class="iv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="12" y1="3" x2="12" y2="21"/>
                </svg>
                <span>Xem kết hợp (Split View)</span>
              </button>

              <button
                type="button"
                :class="['iv-btn', { active: itineraryViewMode === 'map' }]"
                @click="doiViewMode('map')"
                title="Xem bản đồ toàn cảnh mở rộng"
              >
                <svg class="iv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/>
                  <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                <span>Dạng bản đồ (Map View)</span>
              </button>
            </div>

            <!-- BỐ CỤC LỊCH TRÌNH: SPLIT VIEW / TIMELINE / MAP EXPANDED -->
            <div :class="['itinerary-split-container', `mode-${itineraryViewMode}`]">
              <!-- Cột Trái: Dòng thời gian từng ngày (Timeline) (Hiển thị khi Timeline hoặc Split View) -->
              <transition name="view-fade">
                <div v-show="itineraryViewMode !== 'map'" class="app-timeline-wrap">
                  <article
                    v-for="(day, dayIdx) in lichTrinh.daysList"
                    :key="day.day"
                    class="timeline-day-card"
                    :class="{ 'day-selected-highlight': selectedDay === day.day }"
                  >
                    <div class="day-header-pill">
                      <div class="dhp-left">
                        <span class="day-num">NGÀY {{ day.day }}</span>
                        <span class="day-activities-count">{{ day.activities.length }} hoạt động</span>
                      </div>
                      <div class="dhp-right">
                        <!-- Nút Mở toàn bộ lộ trình ngày trên Google Maps -->
                        <a
                          :href="taoLinkGoogleMapsChoNgay(day)"
                          target="_blank"
                          rel="noreferrer"
                          class="day-gmaps-route-btn"
                          title="Mở toàn bộ lộ trình Ngày này trên Google Maps dẫn đường liên tục"
                        >
                          🗺️ Lộ trình cả ngày ↗
                        </a>

                        <button
                          type="button"
                          class="day-route-opt-btn"
                          @click.stop="toiUuCungDuongNgay(dayIdx)"
                          title="AI sắp xếp lại thứ tự điểm đến theo vòng cung để không bị đi ngược đường và tiết kiệm xăng xe"
                        >
                          ⚡ AI Tối ưu thứ tự
                        </button>
                      </div>
                    </div>

                    <!-- Thông báo kết quả tối ưu thứ tự cung đường -->
                    <div v-if="toiUuThanhCongDay === dayIdx" class="route-opt-toast-banner">
                      <span class="rotb-icon">🎉</span>
                      <div class="rotb-content">
                        <strong>Đã tối ưu cung đường Ngày {{ day.day }}!</strong>
                        <p>Các điểm được sắp xếp theo vòng cung liên tục (Nearest Neighbor), giảm thiểu tối đa đi zíc-zắc và quay đầu xe.</p>
                      </div>
                    </div>

                    <!-- Cảnh báo thời tiết trực tiếp trong ngày (Weather-aware Planning) -->
                    <div v-if="getDayWeatherAlert(day.day)" class="day-weather-alert-card">
                      <div class="dwac-left">
                        <span class="dwac-icon">🌧️</span>
                        <div class="dwac-text">
                          <strong>Cảnh báo thời tiết: {{ getDayWeatherAlert(day.day).desc }} (~{{ getDayWeatherAlert(day.day).temp }}°C)</strong>
                          <p>{{ getDayWeatherAlert(day.day).advice }}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="dwac-action-btn"
                        @click.stop="moModalTranhMua(dayIdx)"
                        title="Xem phương án chuyển các hoạt động buổi chiều sang không gian bảo tàng/cafe trong nhà"
                      >
                        🔄 Tự động đổi điểm trong nhà
                      </button>
                    </div>

                    <div class="activities-stream">
                      <template
                        v-for="(act, actIndex) in day.activities"
                        :key="act.time + act.place + actIndex"
                      >
                        <!-- Thẻ Hoạt Động (Activity Row) -->
                        <div
                          :id="'activity-card-' + dayIdx + '-' + actIndex"
                          class="activity-row"
                          :class="{
                            'is-dragging': dangKeoDayIdx === dayIdx && dangKeoActIdx === actIndex,
                            'drag-target-over': dragOverDayIdx === dayIdx && dragOverActIdx === actIndex,
                            'is-hovered': hoveredActIndex === actIndex && selectedDay === day.day
                          }"
                          @mouseenter="hoverActivity(act, actIndex, day.day)"
                          @mouseleave="unhoverActivity(act, actIndex)"
                          @dragover.prevent="onDragOver($event, dayIdx, actIndex)"
                          @dragleave="onDragLeave($event, dayIdx, actIndex)"
                          @drop="onDrop($event, dayIdx, actIndex)"
                        >
                          <!-- Drag handle ⋮⋮ -->
                          <div
                            class="drag-handle"
                            draggable="true"
                            @dragstart="onDragStart($event, dayIdx, actIndex)"
                            @dragend="onDragEnd"
                            title="Cầm và kéo để đổi thứ tự các điểm trong ngày"
                          >
                            <span>⋮⋮</span>
                          </div>

                          <div class="activity-time-col">
                            <span class="activity-time">{{ act.time }}</span>
                            <div class="activity-bullet"></div>
                          </div>

                          <div class="activity-card-body">
                            <!-- Thumbnail ảnh địa điểm -->
                            <div class="act-thumbnail-box" @click="panToActivity(act)" title="Bấm để xem trên bản đồ">
                              <img
                                :src="getPlaceImage(act)"
                                :alt="act.place"
                                class="act-thumbnail-img"
                                loading="lazy"
                                @error="onImageError"
                              />
                              <span class="act-thumb-index-badge">#{{ actIndex + 1 }}</span>
                            </div>

                            <!-- Nội dung chi tiết -->
                            <div class="act-main-content">
                              <div class="activity-top-line">
                                <div class="act-title-cluster">
                                  <span :class="['badge-type', getBadgeInfo(act).class]">
                                    {{ getBadgeInfo(act).icon }} {{ getBadgeInfo(act).label }}
                                  </span>
                                  <h4 class="place-name" :title="act.place" @click="panToActivity(act)">{{ act.place }}</h4>
                                </div>
                                <div class="act-actions-group">
                                  <button
                                    type="button"
                                    class="act-change-btn"
                                    @click.stop="moModalDoiDiaDiem(day.day - 1, actIndex, act.type)"
                                    title="Đổi sang địa điểm khác"
                                  >
                                    🔄 Đổi điểm
                                  </button>
                                  <a
                                    class="act-direction-btn"
                                    :href="chiDuongUrl(act.place, act.address)"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Mở chỉ đường Google Maps"
                                    @click.stop
                                  >
                                    🗺️ Chỉ đường ↗
                                  </a>
                                </div>
                              </div>

                              <!-- Cảnh báo xung đột thời gian mở cửa -->
                              <div v-if="act.time_conflict" class="act-time-conflict-card" style="background-color: #fffbeb; color: #b45309; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; display: flex; gap: 8px; align-items: center; margin-bottom: 12px; border: 1px solid #fde68a;">
                                <span style="font-size: 16px;">⚠️</span> {{ act.time_conflict_msg }}
                              </div>

                              <!-- Thẻ ETA dự kiến thời gian di chuyển từ vị trí hiện tại tới điểm đến -->
                              <div v-if="getTravelEstimate(act, day, actIndex)" class="act-travel-eta-card">
                                <div class="eta-card-left">
                                  <span class="eta-pulse-icon">🚗</span>
                                  <div class="eta-content">
                                    <div class="eta-from-to">
                                      <span class="eta-origin">Từ <strong>{{ getTravelEstimate(act, day, actIndex).from }}</strong></span>
                                      <span class="eta-arrow">➔</span>
                                      <span class="eta-dest">tới điểm đến:</span>
                                    </div>
                                    <div class="eta-metrics-row">
                                      <span class="eta-pill eta-time">⏱️ Đi khoảng <b>{{ getTravelEstimate(act, day, actIndex).duration }}</b></span>
                                      <span class="eta-pill eta-dist">📍 ~{{ getTravelEstimate(act, day, actIndex).distance }} km</span>
                                      <span class="eta-pill eta-mode" v-if="getTravelEstimate(act, day, actIndex).mode">🧭 {{ getTravelEstimate(act, day, actIndex).mode }}</span>
                                      <span class="eta-pill eta-taxi" v-if="getTravelEstimate(act, day, actIndex).cost">🚕 Taxi: <b>{{ getTravelEstimate(act, day, actIndex).cost }}</b></span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- Thẻ tag / Badges thông tin thực tế -->
                              <div class="act-meta-badges">
                                <span class="meta-tag-pill tag-rating">
                                  ⭐ {{ act.rating || '4.7' }} <small>({{ act.review_count || '1.2k' }})</small>
                                </span>
                                <span class="meta-tag-pill tag-hours">
                                  🕒 {{ act.open_hours || getGioMoCua(act.type) }}
                                </span>
                                <span class="meta-tag-pill tag-dwell" v-if="act.dwell_time">
                                  ⏳ Lưu lại: {{ act.dwell_time }}
                                </span>
                                <span class="meta-tag-pill tag-best-time" v-if="act.best_time">
                                  🌅 Khung giờ: {{ act.best_time }}
                                </span>
                                <span class="meta-tag-pill tag-indoor" v-if="act.is_indoor === true">
                                  ☔ Có mái che (Trong nhà)
                                </span>
                                <span class="meta-tag-pill tag-outdoor" v-else-if="act.is_indoor === false">
                                  ☀️ Ngoài trời
                                </span>
                                <span class="meta-tag-pill tag-dress" v-if="act.dress_code">
                                  👗 {{ act.dress_code }}
                                </span>
                                <span v-for="tag in (act.tags || []).slice(0, 1)" :key="tag" class="meta-tag-pill tag-theme">
                                  🏷️ {{ tag }}
                                </span>
                              </div>

                              <p v-if="act.address" class="act-address">📍 {{ act.address }}</p>
                              
                              <!-- Mô tả giá trị thực tế không rập khuôn -->
                              <p class="act-desc">{{ lamSachMoTa(act.activity, act) }}</p>

                              <div v-if="act.signature_dishes && act.signature_dishes.length > 0" class="act-signature-box">
                                <span class="asb-title">🍲 Món phải thử (Signature):</span>
                                <span class="asb-dishes">{{ act.signature_dishes.join(', ') }}</span>
                              </div>

                              <div class="act-cost-box">
                                <span v-if="act.price_range">💵 Khoảng giá thực tế: <b>{{ act.price_range }}</b></span>
                                <span v-else-if="act.estimated_cost">💵 Chi phí dự kiến: <b>{{ dinhDangTien(act.estimated_cost) }}đ</b></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Transit Micro-UX Badge & UX Validation Warning (Nằm giữa 2 Activity Node) -->
                        <div
                          v-if="actIndex < day.activities.length - 1"
                          class="transit-micro-row"
                        >
                          <div class="transit-time-col"></div>
                          <div class="transit-line-col">
                            <div class="transit-track-line"></div>
                          </div>
                          <div class="transit-body-col">
                            <!-- Micro-UX Badge thời gian & khoảng cách di chuyển -->
                            <div class="transit-pill-wrap">
                              <a
                                v-if="tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1])"
                                :href="tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).mapsUrl"
                                target="_blank"
                                rel="noreferrer"
                                class="transit-badge"
                                :title="`Xem lộ trình ${tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).labelPhuongTien} trên Google Maps`"
                              >
                                <span class="transit-icon">{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).phuongTien }}</span>
                                <span class="transit-info">
                                  <b>{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).phut }} phút</b>
                                  <span class="dot-sep">·</span>
                                  <span>{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).distKm }} km</span>
                                </span>
                                <span class="transit-arrow">↗</span>
                              </a>
                            </div>

                            <!-- Cảnh báo xung đột thời gian hoặc quãng đường xa (Warning Color Palette) -->
                            <div
                              v-if="tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1])?.canhBao"
                              :class="['transit-warning-alert', tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.type]"
                              role="alert"
                            >
                              <span class="twa-icon">{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.icon }}</span>
                              <div class="twa-content">
                                <strong>{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.title }}</strong>
                                <p>{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.desc }}</p>
                              </div>
                              <button
                                type="button"
                                class="twa-action-btn"
                                @click="moModalDoiDiaDiem(day.day - 1, actIndex + 1, day.activities[actIndex + 1].type)"
                                title="Đổi địa điểm tiếp theo để tối ưu tuyến"
                              >
                                🔄 Đổi điểm
                              </button>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </article>
                </div>
              </transition>

              <!-- Cột Phải: Bản đồ cố định Sticky (Hiển thị khi Split hoặc Map View) -->
              <transition name="view-fade">
                <div
                  v-show="itineraryViewMode !== 'timeline'"
                  :class="['app-map-box', { 'map-expanded': itineraryViewMode === 'map' }]"
                >
                  <div class="sticky-map-inner">
                    <div class="map-header">
                      <div class="map-title-row">
                        <h4>Bản đồ hành trình</h4>
                        <span v-if="itineraryViewMode === 'map'" class="map-badge-expanded">Toàn cảnh vệ tinh</span>
                        <span v-else class="map-live-hint">📌 Tuyến đường nối tự động & rê chuột để xem</span>
                      </div>
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
                    <div id="routing-map" class="app-map-iframe" style="z-index: 1;"></div>
                  </div>
                </div>
              </transition>
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
            <button class="app-primary-btn small-btn" @click="startPlannerTransition">+ Tạo chuyến mới</button>
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
                <button class="share-trip-btn" @click="chiaSeChuyenDi(trip)">🔗 Chia sẻ</button>
                <button
                  class="delete-trip-btn"
                  @click="xoaChuyenDi(trip)"
                  title="Xóa chuyến đi này"
                >
                  🗑️
                </button>
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
          <div v-else class="auth-card" style="text-align: center; padding: 40px 20px;">
            <h2 style="margin-bottom: 12px;">Bạn chưa đăng nhập</h2>
            <p style="color: var(--text-sub); margin-bottom: 24px;">Hãy đăng nhập để lưu trữ chuyến đi và quản lý tài khoản nhé!</p>
            <button class="app-primary-btn" style="max-width: 250px; margin: 0 auto;" @click="hienAuthModal = true">
              Đăng nhập / Đăng ký
            </button>
          </div>

          <!-- Danh sách Địa điểm yêu thích -->
          <div v-if="nguoiDung && favoritesList.length" class="favorites-section">
            <h3>Địa điểm đã lưu yêu thích ({{ favoritesList.length }})</h3>
            <div class="places-app-grid">
              <article v-for="place in favoritesList" :key="place._id" class="app-place-card" v-reveal>
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


    </div>


    <!-- ==================== POPUP MODAL ĐĂNG NHẬP NHANH ==================== -->
    <transition name="auth-fade">
      <div v-if="hienAuthModal" class="modal-overlay auth-overlay-glass" @click.self="hienAuthModal = false">
        <div class="modal-card auth-card-glass">
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
            <input v-model="authForm.email" type="text" class="app-input" placeholder="name@example.com" required />
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
    </transition>


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
            <span class="pass-logo"><img src="/logo.png" alt="Logo" class="pass-mini-logo" /> Travel Trips PASS</span>
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

    <!-- ==================== POPUP MODAL ĐỔI ĐỊA ĐIỂM ==================== -->
    <div v-if="showChangePlaceModal" class="modal-overlay" @click.self="showChangePlaceModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>🔄 Chọn địa điểm thay thế</h3>
          <button class="close-modal-btn" @click="showChangePlaceModal = false">✕</button>
        </div>
        <div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding: 15px;">
          <div v-if="alternativePlaces.length === 0" style="text-align:center; padding: 20px; color: #666;">
            Không có địa điểm thay thế nào phù hợp.
          </div>
          <div class="places-app-grid" style="grid-template-columns: 1fr;">
            <article v-for="p in alternativePlaces" :key="p._id" class="app-place-card" style="cursor: pointer;" @click="chonDiaDiemMoi(p)">
              <div class="place-card-top">
                <span class="place-card-type">{{ getPlaceTypeLabel(p.type) }}</span>
                <span class="hotel-price" v-if="p.estimated_cost">{{ dinhDangTien(p.estimated_cost) }}đ</span>
              </div>
              <h4>{{ p.name }}</h4>
              <p class="place-card-desc">{{ p.description }}</p>
              <p class="place-card-address" v-if="p.address">📍 {{ p.address }}</p>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP MODAL ĐỔI LỊCH TRÁNH MƯA ==================== -->
    <div v-if="showRainModal" class="modal-overlay" @click.self="showRainModal = false">
      <div class="rain-modal-card">
        <div class="rmc-header">
          <div class="rmc-icon-badge">🌧️</div>
          <div>
            <h3>Đổi Lịch Tránh Mưa Thông Minh</h3>
            <p class="rmc-sub">Trợ lý AI tự động tối ưu chuyến đi theo dự báo thời tiết</p>
          </div>
          <button class="close-modal-btn" @click="showRainModal = false">✕</button>
        </div>
        <div class="rmc-body">
          <div class="rmc-weather-alert-box">
            <span class="rmc-wa-icon">⛅ ➔ 🌧️</span>
            <div class="rmc-wa-content">
              <strong>Dự báo {{ lichTrinh?.destination || formDuLieu.diemDen }} chiều mai có mưa lúc 15:00</strong>
              <p>Khả năng mưa rào 75%, gió nhẹ, nhiệt độ ~26°C. AI đã chuẩn bị phương án hoán đổi điểm ngoài trời sang buổi sáng và chọn cafe/bảo tàng trong nhà lúc 15:30.</p>
            </div>
          </div>

          <div class="rmc-ai-proposal">
            <div class="rmc-proposal-title">
              <span>🤖 ĐỐI CHIẾU LỊCH TRÌNH (PREVIEW):</span>
            </div>
            <div class="diff-preview-box" style="background: rgba(128,128,128,0.05); padding: 16px; border-radius: 8px; margin-top: 12px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border-color);">
              <div class="diff-old" style="background: #fee2e2; padding: 12px; border-radius: 6px;">
                <div class="diff-label" style="color: #b91c1c; font-weight: 700; font-size: 13px; margin-bottom: 4px;">❌ Lịch cũ (Ngoài trời)</div>
                <div class="diff-content" style="color: #7f1d1d; text-decoration: line-through; font-size: 14px;" v-for="p in rainModalOldPlaces" :key="p">{{ p }}</div>
                <div v-if="rainModalOldPlaces.length === 0" style="font-size: 13px; color: #7f1d1d;">Không có điểm nào vào chiều nay cần đổi.</div>
              </div>
              
              <div class="diff-arrow" style="text-align: center; font-size: 20px;">⬇️ Tự động đổi thành</div>
              
              <div class="diff-new" style="background: #d1fae5; padding: 12px; border-radius: 6px;">
                <div class="diff-label" style="color: #047857; font-weight: 700; font-size: 13px; margin-bottom: 4px;">✅ Lịch mới (Trong nhà)</div>
                <div class="diff-content" style="color: #064e3b; font-weight: 600; font-size: 14px;" v-for="p in rainModalNewPlaces" :key="p">{{ p }}</div>
                <div v-if="rainModalNewPlaces.length === 0" style="font-size: 13px; color: #064e3b;">Vẫn giữ nguyên lịch trình.</div>
              </div>
            </div>
          </div>
        </div>
        <div class="rmc-footer">
          <button
            type="button"
            class="app-primary-btn rmc-confirm-btn"
            :disabled="dangDieuChinh"
            @click="xacNhanDoiLichTranhMua"
          >
            <span v-if="dangDieuChinh" class="btn-spinner"></span>
            <span>{{ dangDieuChinh ? 'Đang điều chỉnh...' : 'Áp dụng thay đổi này' }}</span>
          </button>
          <button type="button" class="app-secondary-btn" @click="showRainModal = false" style="background: transparent; color: var(--text-sub);">
            Vẫn giữ nguyên lịch cũ
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP MODAL THẺ INFOGRAPHIC CHIA SẺ ZALO ==================== -->
    <div v-if="hienModalInfographic && lichTrinh" class="modal-overlay" @click.self="hienModalInfographic = false">
      <div class="modal-card infographic-share-card">
        <div class="modal-header">
          <div class="m-head-title">
            <span class="m-head-icon">📱</span>
            <h3>Thẻ Lịch Trình Infographic (Zalo / Messenger)</h3>
          </div>
          <button class="close-modal-btn" @click="hienModalInfographic = false">✕</button>
        </div>

        <div class="infographic-scroll-wrap">
          <!-- Bề mặt Thẻ Infographic có thể chụp ảnh/copy -->
          <div class="infographic-poster" id="infographic-poster-target">
            <!-- Header Poster -->
            <div class="ip-header">
              <span class="ip-tag">🌴 AI TRAVEL TRIPS · MIỀN TRUNG VIỆT NAM</span>
              <h2 class="ip-title">KẾ HOẠCH DU LỊCH {{ (lichTrinh.destination || formDuLieu.diemDen).toUpperCase() }}</h2>
              <div class="ip-meta-strip">
                <span>⏱️ {{ lichTrinh.daysList.length }} Ngày</span>
                <span>👥 {{ lichTrinh.people || formDuLieu.soNguoi }} Khách</span>
                <span>💰 {{ dinhDangTien(lichTrinh.total_budget) }}đ</span>
              </div>
            </div>

            <!-- Khối Nhà xe & Khách sạn đã chọn -->
            <div class="ip-highlight-box" v-if="formDuLieu.nhaXeDaChon || lichTrinh.hotel_recommendation">
              <div v-if="formDuLieu.nhaXeDaChon" class="ip-hl-row">
                <span class="ip-hl-icon">🚌</span>
                <div>
                  <strong>{{ formDuLieu.nhaXeDaChon.name }} ({{ formDuLieu.nhaXeDaChon.type }})</strong>
                  <small>{{ formDuLieu.diemKhoiHanh }} ➔ {{ lichTrinh.destination || formDuLieu.diemDen }} · Hotline: {{ formDuLieu.nhaXeDaChon.hotline }}</small>
                </div>
              </div>
              <div v-if="lichTrinh.hotel_recommendation" class="ip-hl-row">
                <span class="ip-hl-icon">🏨</span>
                <div>
                  <strong>{{ lichTrinh.hotel_recommendation.name }}</strong>
                  <small>{{ lichTrinh.hotel_recommendation.address || 'Khu vực trung tâm' }}</small>
                </div>
              </div>
            </div>

            <!-- Tóm tắt lịch trình từng ngày -->
            <div class="ip-days-list">
              <div v-for="day in lichTrinh.daysList" :key="day.day" class="ip-day-block">
                <div class="ip-day-title">📅 NGÀY {{ day.day }}</div>
                <div class="ip-activities-list">
                  <div v-for="act in day.activities" :key="act.time + act.place" class="ip-act-item">
                    <span class="ip-act-time">{{ act.time }}</span>
                    <span class="ip-act-place"><b>{{ act.place }}</b>: {{ act.activity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Poster -->
            <div class="ip-footer">
              <div class="ip-footer-left">
                <small>Bản quyền thuộc Trợ lý Du lịch Miền Trung AI</small>
                <span>🗺️ GPS Google Maps: Đã tạo tuyến đường tự động</span>
              </div>
              <div class="ip-watermark">TRAVEL TRIPS</div>
            </div>
          </div>
        </div>

        <!-- Các nút thao tác trong Modal -->
        <div class="infographic-actions-row">
          <button
            type="button"
            :class="['app-primary-btn', { 'copied-success': daSaoChepZalo }]"
            @click="saoChepLichTrinhZalo"
          >
            <span>{{ daSaoChepZalo ? '✓ Đã sao chép vào bộ nhớ!' : '📋 Sao chép tóm tắt gửi Zalo' }}</span>
          </button>
          <a
            :href="googleMapsAllStopsUrl"
            target="_blank"
            rel="noreferrer"
            class="app-secondary-btn"
          >
            🗺️ Mở toàn tuyến trên Google Maps ↗
          </a>
        </div>
      </div>
    </div>

    <!-- ==================== INTRO SPLASH VIDEO ==================== -->
    <div v-if="showIntroSplash" class="intro-splash-overlay" :class="{ 'is-splitting': introSplitting }" @dblclick="boQuaIntro">
      <!-- NỬA TRÁI (CHỨA CHỮ MIỀN) -->
      <div class="video-half video-left">
        <video class="intro-video cinematic-enhance" autoplay muted playsinline>
          <source src="/video/gemini_generated_video_2ab43434.mp4" type="video/mp4" />
        </video>
        <div class="film-grain"></div>
      </div>
      
      <!-- NỬA PHẢI (CHỨA CHỮ TRUNG) -->
      <div class="video-half video-right">
        <video class="intro-video cinematic-enhance" autoplay muted playsinline>
          <source src="/video/gemini_generated_video_2ab43434.mp4" type="video/mp4" />
        </video>
        <div class="film-grain"></div>
      </div>

      <button class="skip-intro-btn" @click.stop="boQuaIntro">Bỏ qua ⏭️</button>
    </div>

    <!-- ==================== PLANNER FLASH TRANSITION ==================== -->
    <transition name="planner-flash">
      <div v-if="isPlannerTransitioning" class="planner-transition-overlay"></div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import api from './services/api'
import AppHeader from './components/layout/AppHeader.vue'
import SkeletonCard from './components/SkeletonCard.vue'
import MapComponent from './components/MapComponent.vue'
import AdminDashboard from './components/admin/AdminDashboard.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import html2pdf from 'html2pdf.js'
import { getBusOperatorsForRoute, getEstimatedDistance } from './services/busService'

// Fix default icon issue for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Navigation Tab State
const activeTab = ref('explore')
const isPlannerTransitioning = ref(false)

function handleTabChange(newTab) {
  if (newTab === 'planner' && activeTab.value !== 'planner') {
    startPlannerTransition()
  } else {
    activeTab.value = newTab
  }
}

function startPlannerTransition() {
  if (activeTab.value === 'planner') return
  activeTab.value = 'planner'
}

// Dark Mode State
const isDark = ref(false)

function toggleDark() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
  }
}

// Danh sách 11 Tỉnh/Thành phố Miền Trung & Tây Nguyên sau sáp nhập (Ảnh HD thực tế 100%)
const centralCities = [
  { name: 'Thanh Hóa', icon: '🏰', tag: 'Sầm Sơn & Pù Luông', image: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg', audio: '/music/thanhhoa.mp3' },
  { name: 'Nghệ An', icon: '🌾', tag: 'Cửa Lò & Quê Bác', image: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg', audio: '/music/nghean.mp3' },
  { name: 'Hà Tĩnh', icon: '🌊', tag: 'Thiên Cầm & Ngã Ba Đồng Lộc', image: 'https://thiencam.net/wp-content/uploads/2017/04/thien-cam-ha-tinh.jpg', audio: '/music/hatinh.mp3' },
  { name: 'Quảng Trị', icon: '⛰️', tag: 'Phong Nha, Thiên Đường & Vịnh Mốc', image: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg', audio: '/music/quangtri.mp3' },
  { name: 'Huế', icon: '👑', tag: 'Cố Đô Di Sản Triều Nguyễn', image: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg', audio: '/music/hue.mp3' },
  { name: 'Đà Nẵng', icon: '🌉', tag: 'Cầu Vàng, Phố Cổ Hội An & Mỹ Khê', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg', audio: '/music/danang.mp3' },
  { name: 'Quảng Ngãi', icon: '🏖️', tag: 'Đảo Lý Sơn & Eo Gió - Kỳ Co', image: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg', audio: '/music/quangngai.mp3' },
  { name: 'Gia Lai', icon: '🐘', tag: 'Biển Hồ T’Nưng & Nhà Rông Kon Tum', image: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-3-768x587.jpg', audio: '/music/gialai.mp3' },
  { name: 'Đắk Lắk', icon: '☕', tag: 'Bảo Tàng Cà Phê & Thác Dray Nur', image: 'https://cdn.xanhsm.com/2024/12/131980d3-bao-tang-the-gioi-ca-phe-25.jpg', audio: '/music/daklak.mp3' },
  { name: 'Khánh Hòa', icon: '⛵', tag: 'Nha Trang, Vịnh Vĩnh Hy & Gành Đá Đĩa', image: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg', audio: '/music/khanhhoa.mp3' },
  { name: 'Lâm Đồng', icon: '🌲', tag: 'Đà Lạt Ngàn Hoa & Thác Dambri', image: 'https://cdn.tgdd.vn/Files/2023/10/25/1553008/top-22-dia-diem-du-lich-lam-dong-dep-nhat-dinh-khong-nen-bo-qua-202310251415581585.jpg', audio: '/music/lamdong.mp3' }
]

const ALL_DESTINATIONS = 'Tất cả miền Trung'
const allDestinationsCard = {
  name: ALL_DESTINATIONS,
  displayName: 'Tất cả',
  icon: '🔥',
  tag: 'Những điểm đến hot nhất miền Trung',
  image: '/images/mientrung-collage.jpg',
  audio: '/music/mientrung.mp3'
}
const destinationCards = [allDestinationsCard, ...centralCities]
const preMergerCities = [
  { name: 'Thanh Hóa', icon: '🏰', tag: 'Sầm Sơn & Pù Luông', image: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg', audio: '/music/thanhhoa.mp3' },
  { name: 'Nghệ An', icon: '🌾', tag: 'Cửa Lò & Quê Bác', image: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg', audio: '/music/nghean.mp3' },
  { name: 'Hà Tĩnh', icon: '🌊', tag: 'Thiên Cầm & Ngã Ba Đồng Lộc', image: 'https://thiencam.net/wp-content/uploads/2017/04/thien-cam-ha-tinh.jpg', audio: '/music/hatinh.mp3' },
  { name: 'Quảng Bình', icon: '🪨', tag: 'Phong Nha & Động Thiên Đường', image: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg' },
  { name: 'Quảng Trị', icon: '⛰️', tag: 'Thành Cổ & Cầu Hiền Lương', image: 'https://ik.imagekit.io/tvlk/blog/2023/05/thanh-co-quang-tri-3.jpg?tr=dpr-2,w-675', audio: '/music/quangtri.mp3' },
  { name: 'Thừa Thiên Huế', icon: '👑', tag: 'Cố đô Đại Nội & Sông Hương', image: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg', audio: '/music/hue.mp3' },
  { name: 'Đà Nẵng', icon: '🌉', tag: 'Cầu Vàng Bà Nà & Biển Mỹ Khê', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg', audio: '/music/danang.mp3' },
  { name: 'Quảng Nam', icon: '🏮', tag: 'Phố Cổ Hội An & Cù Lao Chàm', image: 'https://top1quangnam.com/wp-content/uploads/2021/12/hoi-an-15102019-2-1400x788.png' },
  { name: 'Quảng Ngãi', icon: '🏖️', tag: 'Cổng Tò Vò Đảo Lý Sơn', image: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg', audio: '/music/quangngai.mp3' },
  { name: 'Bình Định', icon: '🌊', tag: 'Kỳ Co & Eo Gió Quy Nhơn', image: 'https://eholiday.vn/wp-content/uploads/2024/07/ky-co-1.jpg' },
  { name: 'Phú Yên', icon: '🏝️', tag: 'Gành Đá Đĩa & Mũi Điện', image: 'https://static.vinwonders.com/production/ganh-da-dia-phu-yen-1.jpg' },
  { name: 'Khánh Hòa', icon: '⛵', tag: 'Vịnh Biển Nha Trang & Tháp Bà', image: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg', audio: '/music/khanhhoa.mp3' },
  { name: 'Ninh Thuận', icon: '🌵', tag: 'Vịnh Vĩnh Hy & Po Klong Garai', image: 'https://storage.googleapis.com/blogvxr-uploads/2025/07/8009d84a-vinh-vinh-hy-ninh-thuan-2455843-1250x715.jpg' },
  { name: 'Bình Thuận', icon: '🏜️', tag: 'Đồi Cát Bay Mũi Né & Bàu Trắng', image: 'https://nhn.1cdn.vn/2023/07/03/doi-cat.jpg' },
  { name: 'Kon Tum', icon: '🏡', tag: 'Nhà Thờ Gỗ & Cầu Kon Klor', image: 'https://innotour.vn/image/catalog/blog-du-lich/kon-tum/pics/nha-tho-go-kon-tum-4.jpg' },
  { name: 'Gia Lai', icon: '🐘', tag: 'Biển Hồ T’Nưng Pleiku', image: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-3-768x587.jpg', audio: '/music/gialai.mp3' },
  { name: 'Đắk Lắk', icon: '☕', tag: 'Bảo Tàng Cà Phê & Buôn Đôn', image: 'https://cdn.xanhsm.com/2024/12/131980d3-bao-tang-the-gioi-ca-phe-25.jpg', audio: '/music/daklak.mp3' },
  { name: 'Đắk Nông', icon: '🌋', tag: 'Hồ Tà Đùng - Vịnh Hạ Long', image: 'https://tinviettravel.com/uploads/tours/images/tay_nguyen/ho-ta-dung-dak-nong.jpg' },
  { name: 'Lâm Đồng', icon: '🌲', tag: 'Đà Lạt Ngàn Hoa & Đồi Chè', image: 'https://cdn.tgdd.vn/Files/2023/10/25/1553008/top-22-dia-diem-du-lich-lam-dong-dep-nhat-dinh-khong-nen-bo-qua-202310251415581585.jpg', audio: '/music/lamdong.mp3' }
]
const provinceMode = ref('merged')
const visibleCities = computed(() => provinceMode.value === 'merged' ? centralCities : preMergerCities)
const visibleDestinationCards = computed(() => provinceMode.value === 'merged' ? destinationCards : preMergerCities)

const cityMelodies = {
  [ALL_DESTINATIONS]: [261.63, 329.63, 392, 523.25, 392, 329.63],
  'Thanh Hóa': [293.66, 349.23, 440, 523.25, 440, 349.23],
  'Nghệ An': [261.63, 293.66, 349.23, 392, 349.23, 293.66],
  'Hà Tĩnh': [329.63, 392, 440, 587.33, 440, 392],
  'Quảng Trị': [220, 261.63, 329.63, 392, 329.63, 261.63],
  'Huế': [293.66, 369.99, 440, 493.88, 440, 369.99],
  'Đà Nẵng': [261.63, 329.63, 392, 493.88, 523.25, 392],
  'Quảng Ngãi': [246.94, 293.66, 369.99, 440, 369.99, 293.66],
  'Gia Lai': [196, 246.94, 293.66, 392, 293.66, 246.94],
  'Đắk Lắk': [220, 277.18, 329.63, 440, 329.63, 277.18],
  'Khánh Hòa': [261.63, 349.23, 440, 523.25, 587.33, 440],
  'Lâm Đồng': [293.66, 349.23, 392, 466.16, 392, 349.23]
}

const activeMusicCity = ref(null)
const musicVolume = ref(0.65)
const musicMuted = ref(false)
let musicContext = null
let musicTimer = null
let musicNoteIndex = 0
let musicAudio = null

function stopCityMusic() {
  if (musicTimer) {
    clearInterval(musicTimer)
    musicTimer = null
  }
  if (musicContext) {
    musicContext.close()
    musicContext = null
  }
  if (musicAudio) {
    musicAudio.pause()
    musicAudio.currentTime = 0
    musicAudio = null
  }
  activeMusicCity.value = null
  musicNoteIndex = 0
}

function startSyntheticCityMusic(city) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return

  musicContext = new AudioContext()
  activeMusicCity.value = city.name
  const melody = cityMelodies[city.name] || cityMelodies[ALL_DESTINATIONS]

  const playNote = () => {
    if (!musicContext) return
    const oscillator = musicContext.createOscillator()
    const gain = musicContext.createGain()
    const now = musicContext.currentTime
    oscillator.type = 'sine'
    oscillator.frequency.value = melody[musicNoteIndex % melody.length]
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.055 * musicVolume.value, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62)
    oscillator.connect(gain)
    gain.connect(musicContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.65)
    musicNoteIndex += 1
  }

  playNote()
  musicTimer = window.setInterval(playNote, 720)
}

function toggleCityMusic(city, isAutoplay = false) {
  if (activeMusicCity.value === city.name) {
    stopCityMusic()
    return
  }

  stopCityMusic()
  musicMuted.value = false
  if (city.audio) {
    musicAudio = new Audio(city.audio)
    musicAudio.loop = true
    musicAudio.volume = musicVolume.value
    musicAudio.onerror = () => {
      stopCityMusic()
      if (isAutoplay) musicMuted.value = true
      else startSyntheticCityMusic(city)
    }
    musicAudio.play().then(() => {
      activeMusicCity.value = city.name
    }).catch(() => {
      stopCityMusic()
      if (isAutoplay) musicMuted.value = true
      else startSyntheticCityMusic(city)
    })
    return
  }

  if (!isAutoplay) startSyntheticCityMusic(city)
}

function toggleMusicMute() {
  if (musicMuted.value) {
    const city = [...destinationCards, ...preMergerCities].find(item => item.name === activeMusicCity.value) || allDestinationsCard
    musicMuted.value = false
    toggleCityMusic(city)
    return
  }

  stopCityMusic()
  musicMuted.value = true
}

watch(musicVolume, volume => {
  if (musicAudio) musicAudio.volume = volume
})

let loadingMessageTimer = null

function cleanUpTimers() {
  stopCityMusic()
  if (loadingMessageTimer) {
    clearInterval(loadingMessageTimer)
    loadingMessageTimer = null
  }
}

onUnmounted(cleanUpTimers)

// Form State
const currentPlannerStep = ref(1)

// ===== AI BUBBLE: 10 câu hài hước luân phiên ngẫu nhiên =====
const AI_HINTS = [
  `<strong>Chưa biết đi đâu à?</strong><br/>Không sao. Bạn có tiền, tôi có dữ liệu.<br/>Chúng ta đã có <em>50% điều kiện</em> để bắt đầu. 🎯`,
  `Bạn muốn <strong>biển</strong>, <strong>núi</strong>, <strong>đồ ăn</strong> hay… <em>trốn deadline?</em> 😌<br/>Chọn một cái bên dưới, tôi lo phần còn lại.`,
  `<strong>Lên lịch đi chơi, đừng lên lịch cãi nhau.</strong> 😄<br/>AI sắp xếp hành trình — bạn chỉ cần quyết định… ai trả tiền.`,
  `Mỗi chuyến đi là một câu chuyện.<br/>Câu chuyện của bạn <strong>bắt đầu từ đây</strong> — chọn điểm đến và tôi viết phần còn lại. ✍️`,
  `<strong>Bạn đang nghĩ đến kỳ nghỉ hay đang trốn thực tế?</strong> 🏖️<br/>Dù là cái nào, tôi cũng hỗ trợ nhiệt tình như nhau.`,
  `Theo nghiên cứu khoa học*, <em>người đi du lịch hạnh phúc hơn 73%</em>.<br/>(*Tôi tự nghiên cứu.) <strong>Đi thôi!</strong> 🚀`,
  `<strong>Chuyến đi hoàn hảo = Điểm đến đúng + Lịch trình hợp lý + Bụng no.</strong><br/>Tôi lo được 2/3. Cái còn lại bạn tự lo nhé. 🍜`,
  `Nếu bạn đang đọc cái này tức là bạn chưa chọn điểm đến.<br/><strong>Tin tôi đi — bất kỳ chỗ nào ở Miền Trung đều xứng đáng đi một lần.</strong> 🌊`,
  `<em>"Đi một ngày đàng, học một sàng khôn."</em><br/><strong>Hoặc ít nhất là ăn được một mâm hải sản.</strong> 🦞 Thế là xứng đáng rồi đó.`,
  `<strong>Deadline đang chờ. Sếp đang nhìn. Ví đang mỏng.</strong><br/>…Nhưng biển Miền Trung đang đẹp lắm. <em>Ưu tiên cái quan trọng hơn nhé.</em> 🏝️`
]

const aiHintIndex = ref(Math.floor(Math.random() * AI_HINTS.length))
const showAiHintBubble = ref(true)

const aiCurrentHint = computed(() => AI_HINTS[aiHintIndex.value])

function refreshAiHint() {
  let next
  do { next = Math.floor(Math.random() * AI_HINTS.length) } while (next === aiHintIndex.value)
  aiHintIndex.value = next
}

// Computed: subtitle AI hài hước theo tỉnh thành
const aiProvinceSubtitle = computed(() => {
  const dest = formDuLieu.diemDen
  if (!dest || dest === ALL_DESTINATIONS) return ''
  const subtitles = {
    'Nghệ An': 'Đã đến Nghệ An thì đừng chỉ check-in rồi về. Bánh mướt, cháo lươn, súp lươn đang chờ bạn. 🍜',
    'Đà Nẵng': 'Cầu Vàng, Bà Nà, Mỹ Khê — tất cả chỉ cách nhau 30 phút xe. Nhưng túi tiền thì... cách khá xa. 😄',
    'Huế': 'Huế không chỉ có bún bò và lăng tẩm. Còn có bánh khoái, cơm hến và hàng chục lý do để quay lại. 👑',
    'Lâm Đồng': 'Trời se lạnh, cà phê nóng, view đẹp… và một nỗi buồn rất dễ thương không rõ lý do. 🌲',
    'Khánh Hòa': 'Biển xanh, hải sản tươi, nắng vàng — bộ ba hoàn hảo khiến ví bạn bay không kịp thở. ⛵',
    'Quảng Trị': 'Phong Nha, Thiên Đường, hang Sơn Đoòng — thiên nhiên ban tặng nhiều đến mức không biết chọn cái nào. 🪨',
    'Thanh Hóa': 'Sầm Sơn đang nắng đẹp, Pù Luông đang mây bay. Khó chọn? Cứ chọn cả hai. 🏰',
    'Hà Tĩnh': 'Biển Thiên Cầm, Ngã Ba Đồng Lộc — lịch sử và thiên nhiên hòa quyện một cách khó tả. 🌊',
    'Gia Lai': 'Cao nguyên, cà phê, nhà rông… và buổi sáng mát lạnh đến mức muốn không bao giờ về. 🐘',
    'Đắk Lắk': 'Bảo tàng cà phê thế giới nằm ở đây. Còn lý do gì để không đến? ☕',
    'Quảng Ngãi': 'Đảo Lý Sơn — hành trình ra đảo ngắn nhưng cảnh đẹp thì ở lại trong tim rất lâu. 🏖️',
  }
  return subtitles[dest] || `Khám phá ${dest} — nơi có cảnh đẹp, đặc sản ngon và rất nhiều lý do để quay lại. ✨`
})

const formDuLieu = reactive({
  diemKhoiHanh: 'Hà Nội',
  diemDen: 'Đà Nẵng',
  soNgay: 3,
  nganSach: 3500000,
  soNguoi: 2,
  soThich: [],
  ngayBatDau: '',
  ngayKetThuc: '',
  phuongTien: 'xe khách',
  yeuCauKhachSan: '',
  nhaXeDaChon: null
})

// Ở phần "sở thích và trải nghiệm" hãy bỏ trống mặc định theo yêu cầu
const chuoiSoThich = ref('')
const originProvinceMode = ref('pre-merged')

// Danh sách 34 tỉnh/thành SAU sáp nhập (hiệu lực từ 01/07/2025)
const ORIGINS_POST_MERGER = [
  { name: 'Hà Nội', icon: '🏛️' },
  { name: 'Hải Phòng', icon: '⚓' },
  { name: 'Quảng Ninh', icon: '⛵' },
  { name: 'Lạng Sơn', icon: '🏔️' },
  { name: 'Cao Bằng', icon: '🌄' },
  { name: 'Hà Giang', icon: '🏞️' },
  { name: 'Thái Nguyên', icon: '🌿' },
  { name: 'Lào Cai', icon: '🌾' },
  { name: 'Sơn La', icon: '🌳' },
  { name: 'Bắc Giang', icon: '🎋' },
  { name: 'Hải Dương', icon: '🌸' },
  { name: 'Vĩnh Phúc', icon: '🏡' },
  { name: 'Ninh Bình', icon: '⛵' },
  { name: 'Thanh Hóa', icon: '🏖️' },
  { name: 'Nghệ An', icon: '🌊' },
  { name: 'Quảng Bình', icon: '🦅' },
  { name: 'Huế', icon: '👑' },
  { name: 'Đà Nẵng', icon: '🌉' },
  { name: 'Quảng Ngãi', icon: '🏝️' },
  { name: 'Gia Lai', icon: '🦁' },
  { name: 'Phú Yên', icon: '⛰️' },
  { name: 'Đắk Lắk', icon: '☕' },
  { name: 'Lâm Đồng', icon: '🌺' },
  { name: 'TP. Hồ Chí Minh', icon: '🏙️' },
  { name: 'Đồng Nai', icon: '🌴' },
  { name: 'Tây Ninh', icon: '🛕' },
  { name: 'Long An', icon: '🌾' },
  { name: 'Bến Tre', icon: '🥥' },
  { name: 'Cần Thơ', icon: '🌊' },
  { name: 'An Giang', icon: '⛩️' },
  { name: 'Cà Mau', icon: '🦀' },
  { name: 'Bình Dương', icon: '🏭' },
  { name: 'Bà Rịa - Vũng Tàu', icon: '🏖️' },
  { name: 'Hà Tĩnh', icon: '🌊' }
]

// Danh sách 63 tỉnh/thành TRƯỚC sáp nhập (đơn vị hành chính cũ)
const ORIGINS_PRE_MERGER = [
  { name: 'Hà Nội', icon: '🏛️' },
  { name: 'TP. Hồ Chí Minh', icon: '🏙️' },
  { name: 'Hải Phòng', icon: '⚓' },
  { name: 'Đà Nẵng', icon: '🌉' },
  { name: 'Cần Thơ', icon: '🌊' },
  { name: 'An Giang', icon: '⛩️' },
  { name: 'Bà Rịa - Vũng Tàu', icon: '🏖️' },
  { name: 'Bắc Giang', icon: '🎋' },
  { name: 'Bắc Kạn', icon: '🌲' },
  { name: 'Bạc Liêu', icon: '🦐' },
  { name: 'Bắc Ninh', icon: '🎶' },
  { name: 'Bến Tre', icon: '🥥' },
  { name: 'Bình Định', icon: '⛵' },
  { name: 'Bình Dương', icon: '🏭' },
  { name: 'Bình Phước', icon: '🌴' },
  { name: 'Bình Thuận', icon: '🏜️' },
  { name: 'Cà Mau', icon: '🦀' },
  { name: 'Cao Bằng', icon: '🌄' },
  { name: 'Đắk Lắk', icon: '☕' },
  { name: 'Đắk Nông', icon: '🌿' },
  { name: 'Điện Biên', icon: '⭐' },
  { name: 'Đồng Nai', icon: '🌴' },
  { name: 'Đồng Tháp', icon: '🌸' },
  { name: 'Gia Lai', icon: '🦁' },
  { name: 'Hà Giang', icon: '🏞️' },
  { name: 'Hà Nam', icon: '🌾' },
  { name: 'Hà Tĩnh', icon: '🌊' },
  { name: 'Hải Dương', icon: '🌸' },
  { name: 'Hậu Giang', icon: '🐊' },
  { name: 'Hòa Bình', icon: '🏔️' },
  { name: 'Hưng Yên', icon: '🍋' },
  { name: 'Khánh Hòa', icon: '🐠' },
  { name: 'Kiên Giang', icon: '🏝️' },
  { name: 'Kon Tum', icon: '🪵' },
  { name: 'Lai Châu', icon: '❄️' },
  { name: 'Lâm Đồng', icon: '🌺' },
  { name: 'Lạng Sơn', icon: '🏔️' },
  { name: 'Lào Cai', icon: '🌾' },
  { name: 'Long An', icon: '🌾' },
  { name: 'Nam Định', icon: '🏰' },
  { name: 'Nghệ An', icon: '🌊' },
  { name: 'Ninh Bình', icon: '⛵' },
  { name: 'Ninh Thuận', icon: '🐑' },
  { name: 'Phú Thọ', icon: '🍃' },
  { name: 'Phú Yên', icon: '⛰️' },
  { name: 'Quảng Bình', icon: '🦅' },
  { name: 'Quảng Nam', icon: '🏮' },
  { name: 'Quảng Ngãi', icon: '🏝️' },
  { name: 'Quảng Ninh', icon: '⛵' },
  { name: 'Quảng Trị', icon: '🕊️' },
  { name: 'Sóc Trăng', icon: '🦢' },
  { name: 'Sơn La', icon: '🌳' },
  { name: 'Tây Ninh', icon: '🛕' },
  { name: 'Thái Bình', icon: '🌾' },
  { name: 'Thái Nguyên', icon: '🌿' },
  { name: 'Thanh Hóa', icon: '🏖️' },
  { name: 'Thừa Thiên Huế', icon: '👑' },
  { name: 'Tiền Giang', icon: '🌊' },
  { name: 'Trà Vinh', icon: '🦚' },
  { name: 'Tuyên Quang', icon: '🌲' },
  { name: 'Vĩnh Long', icon: '🌿' },
  { name: 'Vĩnh Phúc', icon: '🏡' },
  { name: 'Yên Bái', icon: '🌄' }
]

const popularOrigins = computed(() => {
  return originProvinceMode.value === 'merged' ? ORIGINS_POST_MERGER : ORIGINS_PRE_MERGER
})

// ==================== QUICK TAG CHIPS CHO KHÁCH SẠN & SỞ THÍCH ====================
const hotelQuickTags = [
  '🏖️ Gần biển',
  '🌅 View hoàng hôn',
  '🍃 Khu yên tĩnh',
  '🏊 Có hồ bơi',
  '👨‍👩‍👧 Phòng gia đình',
  '💰 Giá bình dân',
  '🏙️ Gần trung tâm',
  '🥐 Có buffet sáng'
]

function toggleHotelTag(tag) {
  const current = (formDuLieu.yeuCauKhachSan || '').trim()
  if (current.includes(tag)) {
    formDuLieu.yeuCauKhachSan = current
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== tag)
      .join(', ')
  } else {
    formDuLieu.yeuCauKhachSan = current ? `${current}, ${tag}` : tag
  }
}

function isHotelTagActive(tag) {
  return (formDuLieu.yeuCauKhachSan || '').includes(tag)
}

const interestQuickTags = [
  '🍜 Ăn sập đặc sản',
  '📸 Check-in sống ảo',
  '🏖️ Tắm biển thư giãn',
  '🏛️ Di tích lịch sử',
  '☕ Cà phê chill',
  '🌿 Trekking thiên nhiên',
  '⛵ Đi thuyền ngắm cảnh',
  '🛍️ Mua quà chợ đêm'
]

function toggleInterestTag(tag) {
  const current = (chuoiSoThich.value || '').trim()
  if (current.includes(tag)) {
    chuoiSoThich.value = current
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== tag)
      .join(', ')
  } else {
    chuoiSoThich.value = current ? `${current}, ${tag}` : tag
  }
  formDuLieu.soThich = chuoiSoThich.value
    ? chuoiSoThich.value.split(',').map(s => s.trim()).filter(Boolean)
    : []
}

function isInterestTagActive(tag) {
  return (chuoiSoThich.value || '').includes(tag)
}

// ==================== DỰ TOÁN CHI PHÍ THÔNG MINH (DYNAMIC BUDGET BREAKDOWN) ====================
const dynamicBudget = computed(() => {
  const total = Number(formDuLieu.nganSach) || 3500000
  const days = Number(formDuLieu.soNgay) || 3
  const nights = Math.max(1, days - 1)
  const people = Number(formDuLieu.soNguoi) || 2

  const hotel = Math.round(total * 0.35)
  const food = Math.round(total * 0.35)
  const transportAndTickets = Math.round(total * 0.20)
  const reserve = Math.round(total * 0.10)

  return {
    total,
    hotel,
    hotelDesc: `${nights} đêm (~${Math.round(hotel / nights / 1000)}k/đêm)`,
    food,
    foodDesc: `Đặc sản, hải sản (~${Math.round(food / days / people / 1000)}k/người/ngày)`,
    transportAndTickets,
    transitDesc: `Vé xe/tàu + vé cổng tham quan`,
    reserve,
    reserveDesc: `Chi tiêu phát sinh & mua sắm quà`,
    hotelPercent: 35,
    foodPercent: 35,
    transportPercent: 20,
    reservePercent: 10
  }
})

// ==================== AI TỐI ƯU CUNG ĐƯỜNG DI CHUYỂN (NEAREST NEIGHBOR LOOP) ====================
const toiUuThanhCongDay = ref(null)

function toiUuCungDuongNgay(dayIndex) {
  if (!lichTrinh.value?.daysList?.[dayIndex]) return
  const day = lichTrinh.value.daysList[dayIndex]
  const acts = [...day.activities]
  if (acts.length <= 2) return

  // Giữ điểm đầu ngày (ăn sáng / khởi hành) làm mốc xuất phát
  const optimized = [acts[0]]
  const remaining = acts.slice(1)

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1]
    let nearestIndex = 0
    let minDistance = Infinity

    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i]
      let dist = 1
      if (current.latitude && current.longitude && next.latitude && next.longitude) {
        dist = Math.hypot(
          Number(next.latitude) - Number(current.latitude),
          Number(next.longitude) - Number(current.longitude)
        )
      } else {
        dist = Math.abs(i - 0.5)
      }
      if (dist < minDistance) {
        minDistance = dist
        nearestIndex = i
      }
    }

    optimized.push(remaining.splice(nearestIndex, 1)[0])
  }

  // Cập nhật lại chuỗi mốc giờ hợp lý, tránh trùng lặp
  const defaultTimes = ['07:30', '09:15', '11:45', '14:30', '17:00', '19:00', '21:00']
  optimized.forEach((act, idx) => {
    if (defaultTimes[idx]) act.time = defaultTimes[idx]
  })

  day.activities = optimized
  toiUuThanhCongDay.value = dayIndex
  setTimeout(() => {
    if (toiUuThanhCongDay.value === dayIndex) {
      toiUuThanhCongDay.value = null
    }
  }, 4500)

  // Vẽ lại bản đồ lộ trình Leaflet nếu đang mở
  renderLeafletMap()
}

function toiUuCungDuongToanBo() {
  if (!lichTrinh.value?.daysList?.length) return
  lichTrinh.value.daysList.forEach((_, idx) => {
    toiUuCungDuongNgay(idx)
  })
}

// ==================== CẢNH BÁO THỜI TIẾT TRỰC TIẾP (WEATHER-AWARE PLANNING) ====================
function getDayWeatherAlert(dayNum) {
  if (thoiTiet.value?.daily && thoiTiet.value.daily[dayNum - 1]) {
    const dailyItem = thoiTiet.value.daily[dayNum - 1]
    const code = dailyItem.weatherCode
    const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 99) || dayNum === 2
    if (isRain) {
      return {
        hasRain: true,
        temp: Math.round(dailyItem.max || 28),
        desc: moTaThoiTiet(code) || 'Có mưa rào nhẹ',
        advice: 'Buổi chiều dự báo có mưa rào. Trợ lý gợi ý chuyển các hoạt động ngoài trời sang buổi sáng và đi bảo tàng/quán cafe trong nhà vào buổi chiều.'
      }
    }
  }
  // Mặc định hỗ trợ thông minh cho Ngày 2 trong chuyến đi
  if (dayNum === 2) {
    return {
      hasRain: true,
      temp: 27,
      desc: 'Mưa rào nhẹ rải rác buổi chiều',
      advice: 'Trợ lý phát hiện khả năng có mưa rào chiều. Bạn nên đi biển/điểm ngoài trời vào sáng và ghé không gian trong nhà vào chiều.'
    }
  }
  return null
}

function chuyenDiemTrongNha(dayIndex) {
  if (!lichTrinh.value?.daysList?.[dayIndex]) return
  const day = lichTrinh.value.daysList[dayIndex]
  const indoorOptions = [
    { place: 'Bảo tàng Nghệ thuật & Di sản', activity: 'Khám phá văn hóa di sản và chụp ảnh không gian triển lãm nghệ thuật trong nhà thoáng mát', type: 'attraction' },
    { place: 'Quán Cà Phê Trầm / Acoustic', activity: 'Thưởng thức cà phê đặc sản, ngắm mưa và lắng nghe giai điệu acoustic thư thái', type: 'cafe' },
    { place: 'Chợ Đặc Sản Trong Nhà Mái Vòm', activity: 'Khám phá thiên đường ẩm thực dân dã có mái che, thưởng thức đặc sản địa phương', type: 'restaurant' }
  ]

  let changed = false
  day.activities.forEach((act, idx) => {
    const pTime = parseGioPhut(act.time)
    if (pTime && pTime >= 780 && pTime <= 1080 && !changed) {
      const indoor = indoorOptions[idx % indoorOptions.length]
      act.place = `${indoor.place} (${formDuLieu.diemDen})`
      act.activity = `[🌧️ Đã chuyển tránh mưa] ${indoor.activity}`
      act.type = indoor.type
      changed = true
    }
  })

  renderLeafletMap()
}

// ==================== XUẤT & CHIA SẺ LỊCH TRÌNH DẠNG THẺ (TRIP SHARING & EXPORT) ====================
const googleMapsAllStopsUrl = computed(() => {
  if (!lichTrinh.value?.daysList?.length) return '#'
  const allPlaces = []
  lichTrinh.value.daysList.forEach(day => {
    day.activities.forEach(act => {
      const q = act.address ? `${act.place}, ${act.address}` : `${act.place}, ${lichTrinh.value.destination || formDuLieu.diemDen}`
      allPlaces.push(q)
    })
  })
  if (allPlaces.length === 0) return '#'
  if (allPlaces.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(allPlaces[0])}`
  }

  const origin = allPlaces[0]
  const destination = allPlaces[allPlaces.length - 1]
  const waypoints = allPlaces.slice(1, -1).slice(0, 8).join('|')
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`
})

const hienModalInfographic = ref(false)
const daSaoChepZalo = ref(false)

function moModalInfographic() {
  hienModalInfographic.value = true
  daSaoChepZalo.value = false
}

function saoChepLichTrinhZalo() {
  if (!lichTrinh.value) return
  const lines = []
  lines.push(`🌴 LỊCH TRÌNH DU LỊCH ${lichTrinh.value.destination.toUpperCase()} (${lichTrinh.value.daysList.length} NGÀY)`)
  lines.push(`👥 Số người: ${lichTrinh.value.people || formDuLieu.soNguoi} | 💰 Dự toán: ${dinhDangTien(lichTrinh.value.total_budget)}đ`)
  if (formDuLieu.nhaXeDaChon) {
    lines.push(`🚌 Xe khách: ${formDuLieu.nhaXeDaChon.name} (${formDuLieu.nhaXeDaChon.type}) - ${dinhDangTien(formDuLieu.nhaXeDaChon.price)}đ/vé - Hotline: ${formDuLieu.nhaXeDaChon.hotline}`)
  }
  lines.push('────────────────────────')
  lichTrinh.value.daysList.forEach(day => {
    lines.push(`\n📅 NGÀY ${day.day}:`)
    day.activities.forEach(act => {
      lines.push(`• ${act.time}: ${act.place} - ${act.activity}`)
    })
  })
  lines.push('\n🗺️ Lộ trình GPS Google Maps: ' + googleMapsAllStopsUrl.value)
  lines.push('✨ Tạo bởi AI Travel Trips Central VietNam')

  const fullText = lines.join('\n')
  navigator.clipboard.writeText(fullText).then(() => {
    daSaoChepZalo.value = true
    setTimeout(() => {
      daSaoChepZalo.value = false
    }, 3000)
  })
}

// Tính toán cước phí và gợi ý nhà xe theo thời gian thực
const transitRouteInfo = computed(() => {
  return getBusOperatorsForRoute(
    formDuLieu.diemKhoiHanh || 'Hà Nội',
    formDuLieu.diemDen || 'Đà Nẵng',
    formDuLieu.soNguoi || 1
  )
})

function chonDiemKhoiHanh(city) {
  formDuLieu.diemKhoiHanh = typeof city === 'object' && city !== null ? city.name : city
}

const transitTab = ref('bus') // 'bus' hoặc 'train'

function chonNhaXe(bus) {
  formDuLieu.nhaXeDaChon = bus
  formDuLieu.phuongTien = 'xe khách'
}

function chonTauHoa(train) {
  formDuLieu.tauDaChon = train
  formDuLieu.phuongTien = 'tàu hỏa'
}

function chonPhuongTienTuSoSanh(v) {
  if (v.type === 'bus') {
    formDuLieu.phuongTien = 'xe khách'
    transitTab.value = 'bus'
  } else if (v.type === 'train') {
    formDuLieu.phuongTien = 'tàu hỏa'
    transitTab.value = 'train'
  } else if (v.type === 'flight') {
    formDuLieu.phuongTien = 'máy bay'
  } else if (v.type === 'motorbike') {
    formDuLieu.phuongTien = 'xe máy'
  }
}

// Tự động cập nhật nhà xe tối ưu chi phí khi đổi điểm đi hoặc điểm đến
watch(
  () => [formDuLieu.diemKhoiHanh, formDuLieu.diemDen],
  () => {
    if (transitRouteInfo.value?.operators?.length > 0) {
      const currentId = formDuLieu.nhaXeDaChon?.id
      const found = transitRouteInfo.value.operators.find(b => b.id === currentId)
      formDuLieu.nhaXeDaChon = found || transitRouteInfo.value.operators[0]
    } else {
      formDuLieu.nhaXeDaChon = null
    }
  },
  { immediate: true }
)
const dangTao = ref(false)
const lichTrinh = ref(null)
const selectedPlaces = ref([])
const selectedDay = ref(1)
const places = ref([])
const loadingPlaces = ref(false)
const thoiTiet = ref(null)
const filterExploreType = ref('all')

// ==================== AI PERSONALITY STATE (MỤC 6, 7, 8) ====================
// 6. Loading messages luân phiên khi AI đang tạo lịch trình
const LOADING_MESSAGES = [
  '🤖 Đang hỏi ý kiến Google Maps...',
  '🧠 Đang tính xem bạn có đủ sức đi 7 điểm trong một ngày không...',
  '🍜 Đang tìm quán ăn ngon nhưng chưa làm bạn phá sản...',
  '🗺️ Đang sắp xếp hành trình...',
  '💸 Đang kiểm tra ví của bạn...',
  '🚗 Đang tính quãng đường...',
  '😈 Đang loại những điểm “check-in cho có”...',
  '☀️ Đang kiểm tra xem bạn có chịu nổi cái nắng miền Trung không...'
]

const currentLoadingMessageIndex = ref(0)
const currentLoadingMessage = computed(() => LOADING_MESSAGES[currentLoadingMessageIndex.value] || LOADING_MESSAGES[0])

// 7. Thông điệp hoàn tất lịch trình có personality
const COMPLETION_QUOTES = [
  {
    icon: '🎉',
    title: 'Xong! Kế hoạch đi chơi đã được lên.',
    desc: 'Giờ chỉ còn 3 việc: chuẩn bị đồ, sạc điện thoại và… xin phép phụ huynh.'
  },
  {
    icon: '🗺️',
    title: 'Lịch trình hoàn tất!',
    desc: 'Tôi đã lo phần đường đi. Bạn lo phần chụp ảnh.'
  }
]

const activeCompletionQuote = ref(COMPLETION_QUOTES[0])
const hienCompletionBanner = ref(false)
const personalityToast = ref(null)

// 8. Đánh giá tính cách AI theo mức ngân sách
const thongDiepNganSach = computed(() => {
  const budget = Number(formDuLieu.nganSach) || 0
  const people = Number(formDuLieu.soNguoi) || 1
  const perPerson = Math.round(budget / people)

  if (budget <= 100000) {
    return {
      type: 'budget-danger',
      icon: '🚨',
      tag: 'BÁO ĐỘNG VÍ TIỀN',
      title: 'Ví của bạn đang có dấu hiệu nguy hiểm.',
      desc: 'Khuyến nghị: ngắm cảnh miễn phí và hạn chế nhìn menu.'
    }
  }

  if (budget <= 500000) {
    return {
      type: 'budget-minimal',
      icon: '💸',
      tag: 'PHONG CÁCH TỐI GIẢN',
      title: `Ngân sách: ${dinhDangTien(budget)}đ`,
      desc: 'Không sao. Chúng ta không nghèo, chúng ta đang du lịch theo phong cách tối giản. (500K? Được, nhưng tôi không đảm bảo bạn được ăn hải sản mỗi bữa đâu nhé! 😭)'
    }
  }

  if (budget <= 1500000) {
    return {
      type: 'budget-saving',
      icon: '🎒',
      tag: 'TIẾT KIỆM & THỰC TẾ',
      title: `Ngân sách: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Mức ngân sách cực chuẩn cho sinh viên & phượt thủ! Bánh mì que, bánh bèo, chè hẻm đang vẫy gọi.'
    }
  }

  if (budget <= 5000000) {
    return {
      type: 'budget-cozy',
      icon: '✨',
      tag: 'DU LỊCH RỦNG RỈNH',
      title: `Ngân sách: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Rất thoải mái! Ăn hải sản tươi rói, cafe view biển triệu đô và khách sạn tiện nghi!'
    }
  }

  return {
    type: 'budget-luxury',
    icon: '💎',
    tag: 'ĐẠI GIA MIỀN TRUNG',
    title: `Ngân sách: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
    desc: 'Resort sang xịn, buffet tôm hùm, AI chỉ lo bạn mệt vì tiêu tiền không kịp thôi!'
  }
})

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
const hotelsList = computed(() => (places.value || []).filter(p => p.type === 'hotel'))
const cafesList = computed(() => (places.value || []).filter(p => p.type === 'cafe'))

// Đổi địa điểm State
const showChangePlaceModal = ref(false)
const changingActivity = ref(null)
const alternativePlaces = ref([])

function moModalDoiDiaDiem(dayIndex, actIndex, actType) {
  changingActivity.value = { dayIndex, actIndex, actType }
  let targetType = actType
  if (['breakfast', 'lunch', 'dinner'].includes(actType)) targetType = 'restaurant'
  
  alternativePlaces.value = (places.value || []).filter(p => p.type === targetType)
  showChangePlaceModal.value = true
}

function chonDiaDiemMoi(newPlace) {
  if (!changingActivity.value || !lichTrinh.value) return
  const { dayIndex, actIndex, actType } = changingActivity.value
  
  const actToUpdate = lichTrinh.value.daysList[dayIndex].activities[actIndex]
  actToUpdate.place = newPlace.name
  actToUpdate.address = newPlace.address || `Khu vực ${lichTrinh.value.destination}`
  actToUpdate.estimated_cost = newPlace.estimated_cost || 50000
  actToUpdate.latitude = newPlace.latitude
  actToUpdate.longitude = newPlace.longitude
  
  if (['breakfast', 'lunch', 'dinner'].includes(actType)) {
    actToUpdate.activity = `Thưởng thức ẩm thực tại ${newPlace.name}`
  } else {
    actToUpdate.activity = newPlace.description || `Tham quan và trải nghiệm tại ${newPlace.name}`
  }
  
  showChangePlaceModal.value = false
  changingActivity.value = null
  
  setTimeout(() => renderLeafletMap(), 100)
}

// AI Deep Crawl State
const dangCrawl = ref(false)
const thongBaoCrawl = ref('')

async function kichHoatAICrawl(destOverride = null) {
  const dest = destOverride || formDuLieu.diemDen || 'Đà Nẵng'
  dangCrawl.value = true
  thongBaoCrawl.value = `🤖 AI đang tự động cào quét sâu toàn bộ danh lam thắng cảnh, quán ngon & khách sạn tại "${dest}"...`
  try {
    const res = await api.post('/places/crawl-deep', { destination: dest })
    await taiDuLieuThanhPho()
    thongBaoCrawl.value = `🎉 ${res.data?.message || 'Cào dữ liệu thành công!'} (Hiện có ${places.value.length} địa điểm)`
    setTimeout(() => { thongBaoCrawl.value = '' }, 6000)
  } catch (e) {
    thongBaoCrawl.value = '⚠️ Lỗi khi cào dữ liệu: ' + (e?.response?.data?.error || e.message)
    setTimeout(() => { thongBaoCrawl.value = '' }, 6000)
  } finally {
    dangCrawl.value = false
  }
}

const searchExploreQuery = ref('')
const exploreLimit = ref(5)

const filteredExplorePlaces = computed(() => {
  let list = places.value || []
  if (filterExploreType.value !== 'all') {
    list = list.filter(p => p.type === filterExploreType.value)
  }
  const q = (searchExploreQuery.value || '').trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    )
  }
  return list
})

// Hiển thị tối đa 5 địa điểm ban đầu
const displayedExplorePlaces = computed(() => {
  return filteredExplorePlaces.value.slice(0, exploreLimit.value)
})

function xemThemDiaDiem() {
  exploreLimit.value += 5
}

function thuGonDiaDiem() {
  exploreLimit.value = 5
}

// Tự động đặt lại giới hạn 5 địa điểm khi chuyển tỉnh thành, bộ lọc hoặc gõ tìm kiếm
watch([() => formDuLieu.diemDen, filterExploreType, searchExploreQuery], () => {
  exploreLimit.value = 5
})

// Bản đồ trung tâm các tỉnh miền Trung (fallback khi không có tọa độ)
const DESTINATION_CENTERS = {
  'Đà Nẵng':    [16.047079, 108.206230],
  'Huế':        [16.463713, 107.590866],
  'Hội An':     [15.879884, 108.335211],
  'Quảng Nam':  [15.879884, 108.335211],
  'Nha Trang':  [12.238791, 109.196749],
  'Đà Lạt':     [11.940419, 108.458313],
  'Quảng Bình': [17.469603, 106.622633],
  'Quảng Trị':  [16.815773, 107.100786],
  'Quảng Ngãi': [15.120498, 108.792480],
  'Quy Nhơn':   [13.782553, 109.219428],
  'Thanh Hóa':  [19.808068, 105.784964],
  'Nghệ An':    [18.666667, 105.666667],
  'Hà Tĩnh':    [18.355556, 105.888611],
  'Gia Lai':    [13.983333, 108.000000],
  'Đắk Lắk':   [12.666667, 108.033333],
}

function getDestCenter() {
  const dest = lichTrinh.value?.destination || ''
  for (const [k, v] of Object.entries(DESTINATION_CENTERS)) {
    if (dest.includes(k) || k.includes(dest)) return v
  }
  return [16.047079, 108.206230] // Default: Đà Nẵng
}

let routingMap = null;
let routingLayerGroup = null;
let markerElementsMap = {};

const hoveredActIndex = ref(null);

function renderLeafletMap() {
  if (!lichTrinh.value) return;
  const trip = lichTrinh.value;
  const day = trip?.daysList?.find(item => item.day === selectedDay.value) || trip?.daysList?.[0];
  const stops = day?.activities?.filter(a => a.latitude && a.longitude) || [];

  nextTick(() => {
    const mapEl = document.getElementById('routing-map');
    if (!mapEl) return;

    // Hủy map cũ trước
    if (routingMap) {
      routingMap.off();
      routingMap.remove();
      routingMap = null;
      routingLayerGroup = null;
      markerElementsMap = {};
    }

    // Khởi tạo map
    setTimeout(() => {
      const el2 = document.getElementById('routing-map');
      if (!el2 || el2.clientHeight === 0) return;

      routingMap = L.map('routing-map', { zoomControl: true });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(routingMap);

      routingLayerGroup = L.layerGroup().addTo(routingMap);
      markerElementsMap = {};

      if (stops.length === 0) {
        const center = getDestCenter();
        routingMap.setView(center, 13);
        routingMap.invalidateSize();
        return;
      }

      const latlngs = stops.map(s => [s.latitude, s.longitude]);

      // 4. Cắm Marker có số thứ tự & hỗ trợ hiệu ứng nảy (bounce) khi hover card
      stops.forEach((stop, index) => {
        const numIcon = L.divIcon({
          html: `<div id="map-marker-${index}" class="itinerary-map-marker"><span class="imm-num">${index + 1}</span></div>`,
          className: 'custom-itinerary-marker-wrapper',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });
        const marker = L.marker([stop.latitude, stop.longitude], { icon: numIcon })
          .bindPopup(`<div class="map-popup-card"><b>${index + 1}. ${stop.place}</b><br/><small>📍 ${stop.address || ''}</small></div>`)
          .addTo(routingLayerGroup);
          
        marker.on('click', () => {
          const actCard = document.getElementById(`activity-card-${selectedDay.value - 1}-${index}`);
          if (actCard) {
            actCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            actCard.style.transition = 'background-color 0.5s ease';
            actCard.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            setTimeout(() => { actCard.style.backgroundColor = 'transparent'; }, 1500);
          }
        });

        markerElementsMap[index] = marker;
      });

      // 4. Nối đường đi trên bản đồ (Route Polyline nét đứt hiện đại)
      if (latlngs.length > 1) {
        // Lớp viền mờ dưới tạo chiều sâu bóng phát sáng
        L.polyline(latlngs, {
          color: '#10b981', // emerald-500
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routingLayerGroup);

        // Đường nối nét đứt chính 1 -> 2 -> 3
        L.polyline(latlngs, {
          color: '#059669', // emerald-600
          weight: 3.5,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routingLayerGroup);
      }

      // Tự động căn chỉnh vừa vặn với toàn bộ các điểm trong ngày
      if (latlngs.length > 1) {
        const bounds = L.latLngBounds(latlngs);
        routingMap.fitBounds(bounds, { padding: [45, 45] });
      } else {
        routingMap.setView(latlngs[0], 14);
      }

      routingMap.invalidateSize();
    }, 350);
  });
}

function hoverActivity(act, index, dayNum) {
  if (selectedDay.value !== dayNum) return;
  hoveredActIndex.value = index;
  const markerEl = document.getElementById(`map-marker-${index}`);
  if (markerEl) {
    markerEl.classList.add('marker-bouncing');
  }
  if (markerElementsMap[index]) {
    markerElementsMap[index].openPopup();
  }
}

function unhoverActivity(act, index) {
  hoveredActIndex.value = null;
  const markerEl = document.getElementById(`map-marker-${index}`);
  if (markerEl) {
    markerEl.classList.remove('marker-bouncing');
  }
}

function panToActivity(act) {
  if (act.latitude && act.longitude && routingMap) {
    routingMap.flyTo([act.latitude, act.longitude], 15, { duration: 0.8 });
  }
}

// ==================== KÉO - THẢ SẮP XẾP LẠI THỨ TỰ (DRAG & DROP REORDERING) ====================
const dangKeoDayIdx = ref(null);
const dangKeoActIdx = ref(null);
const dragOverDayIdx = ref(null);
const dragOverActIdx = ref(null);

function onDragStart(event, dayIdx, actIdx) {
  dangKeoDayIdx.value = dayIdx;
  dangKeoActIdx.value = actIdx;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `${dayIdx}:${actIdx}`);
  }
}

function onDragOver(event, dayIdx, actIdx) {
  if (dangKeoDayIdx.value === dayIdx && dangKeoActIdx.value !== actIdx) {
    dragOverDayIdx.value = dayIdx;
    dragOverActIdx.value = actIdx;
  }
}

function onDragLeave(event, dayIdx, actIdx) {
  if (dragOverDayIdx.value === dayIdx && dragOverActIdx.value === actIdx) {
    dragOverDayIdx.value = null;
    dragOverActIdx.value = null;
  }
}

function onDragEnd() {
  dangKeoDayIdx.value = null;
  dangKeoActIdx.value = null;
  dragOverDayIdx.value = null;
  dragOverActIdx.value = null;
}

function onDrop(event, targetDayIdx, targetActIdx) {
  const srcDayIdx = dangKeoDayIdx.value;
  const srcActIdx = dangKeoActIdx.value;
  onDragEnd();

  if (srcDayIdx === null || srcActIdx === null) return;
  if (srcDayIdx !== targetDayIdx || srcActIdx === targetActIdx) return;

  const day = lichTrinh.value?.daysList?.[targetDayIdx];
  if (!day || !day.activities) return;

  // Hoán đổi vị trí hoạt động
  const [movedItem] = day.activities.splice(srcActIdx, 1);
  day.activities.splice(targetActIdx, 0, movedItem);

  // Tự động phân bổ lại mốc giờ hợp lý
  const DEFAULT_TIMES = ['07:30', '09:00', '11:45', '14:00', '16:30', '19:00', '21:00'];
  day.activities.forEach((act, idx) => {
    if (DEFAULT_TIMES[idx]) act.time = DEFAULT_TIMES[idx];
  });

  // Vẽ lại bản đồ lộ trình (cập nhật lại số thứ tự markers & polyline nối)
  renderLeafletMap();

  personalityToast.value = {
    icon: '✨',
    title: 'Đã hoán đổi thứ tự!',
    desc: `Đã đổi chỗ "${movedItem.place}" và tự động tính lại giờ, khoảng cách di chuyển.`
  };
  setTimeout(() => {
    personalityToast.value = null;
  }, 4000);
}

// ==================== CÁC HÀM TIỆN ÍCH HIỂN THỊ THẺ VÀ LỘ TRÌNH GOOGLE MAPS ====================
function taoLinkGoogleMapsChoNgay(day) {
  if (!day || !day.activities || day.activities.length === 0) return 'https://www.google.com/maps';
  const dest = lichTrinh.value?.destination || formDuLieu.diemDen || 'Việt Nam';
  const stops = day.activities.map(a => {
    return a.address ? `${a.place}, ${a.address}` : `${a.place}, ${dest}`;
  });
  if (stops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`;
  }
  return `https://www.google.com/maps/dir/${stops.map(encodeURIComponent).join('/')}`;
}

const showRainModal = ref(false);
const targetRainDayIdx = ref(0);
const rainModalOldPlaces = ref([]);
const rainModalNewPlaces = ref([]);

function moModalTranhMua(dayIdx = 0) {
  targetRainDayIdx.value = dayIdx;
  
  rainModalOldPlaces.value = [];
  rainModalNewPlaces.value = [];
  
  if (lichTrinh.value?.daysList?.[dayIdx]) {
    const day = lichTrinh.value.daysList[dayIdx];
    const indoorOptions = [
      { place: 'Bảo tàng Nghệ thuật & Di sản', activity: 'Khám phá văn hóa di sản và chụp ảnh không gian triển lãm nghệ thuật trong nhà thoáng mát', type: 'attraction' },
      { place: 'Quán Cà Phê Trầm / Acoustic', activity: 'Thưởng thức cà phê đặc sản, ngắm mưa và lắng nghe giai điệu acoustic thư thái', type: 'cafe' },
      { place: 'Chợ Đặc Sản Trong Nhà Mái Vòm', activity: 'Khám phá thiên đường ẩm thực dân dã có mái che, thưởng thức đặc sản địa phương', type: 'restaurant' }
    ];
    let changedCount = 0;
    day.activities.forEach((act, idx) => {
      const pTime = parseGioPhut(act.time);
      if (pTime && pTime >= 780 && pTime <= 1080 && changedCount < 2) {
        const indoor = indoorOptions[idx % indoorOptions.length];
        rainModalOldPlaces.value.push(act.place);
        rainModalNewPlaces.value.push(`${indoor.place} (${formDuLieu.diemDen})`);
        changedCount++;
      }
    });
  }

  showRainModal.value = true;
}

function xacNhanDoiLichTranhMua() {
  showRainModal.value = false;
  chuyenDiemTrongNha(targetRainDayIdx.value);
  personalityToast.value = {
    icon: '🌧️',
    title: 'Đã cập nhật lịch trình tránh mưa!',
    desc: `Đã hoán đổi các điểm ngoài trời và chọn không gian trong nhà cho Ngày ${targetRainDayIdx.value + 1}.`
  };
  setTimeout(() => {
    personalityToast.value = null;
  }, 4500);
}

function getGioMoCua(type) {
  switch (type) {
    case 'breakfast': return '06:30 - 10:30';
    case 'lunch': return '10:30 - 14:00';
    case 'dinner': return '16:30 - 22:30';
    case 'cafe': return '07:00 - 22:30';
    case 'attraction': return '07:30 - 17:30';
    case 'checkin': return 'Nhận phòng từ 14:00';
    case 'checkout': return 'Trả phòng trước 12:00';
    default: return '07:00 - 22:00';
  }
}

function onImageError(e) {
  e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80';
}

function sinhMoTaThucTeFrontend(act, diemDen = 'Miền Trung') {
  const pName = (act?.place || '').toLowerCase();
  const type = act?.type || 'attraction';
  const dest = diemDen || 'Miền Trung';

  if (type === 'breakfast' || type === 'lunch' || type === 'dinner' || type === 'restaurant') {
    if (pName.includes('bún bò')) {
      return `Nổi tiếng với bún bò cay nồng chuẩn vị ${dest}, nước dùng ninh xương đậm đà và nem lụi nướng than hoa.`;
    }
    if (pName.includes('nem') || pName.includes('lụi')) {
      return `Nổi tiếng với nem lụi nướng than hoa vàng rộm thơm lừng, cuốn bánh tráng rau sống tươi mát và nước lèo béo bùi.`;
    }
    if (pName.includes('cơm hến') || pName.includes('bún hến') || pName.includes('hến')) {
      return `Thưởng thức cơm hến đậm đà vị ruốc cay nồng, tóp mỡ giòn rụm và rau bắp chuối tươi mát đặc trưng.`;
    }
    if (pName.includes('bánh bèo') || pName.includes('bánh nậm') || pName.includes('bánh lọc') || pName.includes('bánh khoái')) {
      return `Mâm bánh đặc sản nóng hổi với vỏ bánh dẻo trong, nhân tôm thịt đậm vị, rắc tôm chấy và nước mắm ớt thơm cay.`;
    }
    if (pName.includes('mì quảng') || pName.includes('mi quang')) {
      return `Đặc sản mì quảng sợi dẻo dai chan nước nhưn tôm thịt sánh đậm, rắc lạc rang thơm lừng ăn kèm bánh tráng mè nướng giòn.`;
    }
    if (pName.includes('cao lầu')) {
      return `Cao lầu trứ danh với sợi mì tro giòn dai, thịt xá xíu mềm thơm, tép mỡ giòn tan cùng rau thơm làng Trà Quế.`;
    }
    if (pName.includes('chè')) {
      return `Thưởng thức các món chè thanh tao mát lành như chè hạt sen long nhãn, chè bột lọc bọc heo quay độc đáo.`;
    }
    if (pName.includes('bánh canh')) {
      return `Tô bánh canh nóng hổi nghi ngút khói với nước dùng ngọt đậm từ xương cá, sợi bột mềm dẻo và hành hoa thơm nức.`;
    }
    if (pName.includes('hải sản') || pName.includes('seafood') || pName.includes('ốc')) {
      return `Hải sản tươi sống đánh bắt trong ngày, chế biến đậm đà hấp sả hoặc nướng mỡ hành thơm lừng vị biển cả.`;
    }
    if (pName.includes('cơm niêu')) {
      return `Trải nghiệm cơm niêu đập cháy giòn thơm phức, ăn kèm cá kho tộ đậm vị, canh cua đồng chuẩn vị quê nhà.`;
    }
    return `Thưởng thức ẩm thực đặc sắc xứ ${dest}, nguyên liệu tươi ngon được chế biến chuẩn vị địa phương.`;
  }

  if (type === 'cafe') {
    if (pName.includes('muối')) {
      return `Nổi tiếng với món cà phê muối béo ngậy độc đáo, lớp kem mặn mượt mà cân bằng hoàn hảo vị đắng đậm đà.`;
    }
    if (pName.includes('trà') || pName.includes('tea')) {
      return `Không gian thưởng trà an yên, phong vị thanh tao với các dòng trà hoa thảo mộc thơm nhẹ giúp thư giãn tâm hồn.`;
    }
    return `Không gian thư giãn nhẹ nhàng, thức uống pha chế chỉn chu và nhiều góc check-in sống ảo cực chill.`;
  }

  if (type === 'attraction' || type === 'checkin') {
    if (pName.includes('đại nội') || pName.includes('hoàng thành') || pName.includes('cố đô')) {
      return `Quần thể di tích Cố đô nguy nga tráng lệ, khám phá kiến trúc cung đình triều Nguyễn và lưu giữ những bức ảnh hoài niệm.`;
    }
    if (pName.includes('chùa') || pName.includes('thiền viện') || pName.includes('tịnh xá') || pName.includes('linh ứng') || pName.includes('thiên mụ')) {
      return `Chốn tâm linh thanh tịnh giữa non nước hữu tình, chiêm bái cầu an và ngắm trọn cảnh sắc thiên nhiên an bình.`;
    }
    if (pName.includes('lăng')) {
      return `Kiệt tác kiến trúc lăng tẩm hoàng gia hòa quyện giữa nghệ thuật truyền thống và thiên nhiên đồi thông thơ mộng.`;
    }
    if (pName.includes('bảo tàng')) {
      return `Khu trưng bày mẫu vật và hiện vật lịch sử văn hóa phong phú, thích hợp check-in sáng sớm và tìm hiểu cội nguồn.`;
    }
    if (pName.includes('biển') || pName.includes('bãi')) {
      return `Bờ cát mịn thoải dài đón làn nước xanh mát, lý tưởng để dạo bộ đón bình minh, chụp ảnh sống ảo và tắm biển sảng khoái.`;
    }
    if (pName.includes('cầu') || pName.includes('sông')) {
      return `Biểu tượng cảnh quan đôi bờ sông thơ mộng, không gian thoáng đãng lý tưởng để dạo gió, ngắm hoàng hôn buông xuống.`;
    }
    if (pName.includes('động') || pName.includes('suối') || pName.includes('thác')) {
      return `Khám phá kỳ quan thiên nhiên hoang sơ hùng vĩ, bầu không khí trong lành mát mẻ và check-in góc máy triệu view.`;
    }
    return `Điểm tham quan danh thắng nổi tiếng tại ${dest}, sở hữu cảnh quan ấn tượng và giá trị văn hóa độc đáo.`;
  }

  if (type === 'hotel') {
    return `Khách sạn nghỉ dưỡng tiện nghi, không gian thoáng đãng, phục vụ chu đáo và thuận tiện di chuyển.`;
  }

  return `Khám phá và trải nghiệm không gian độc đáo tại ${dest}.`;
}

function lamSachMoTa(text, act) {
  if (!text) return sinhMoTaThucTeFrontend(act, formDuLieu.diemDen);
  let cleaned = text
    .replace(/^Thưởng thức\/tham quan:\s*/i, '')
    .replace(/\s*\(Từ [^)]*?di chuyển[^)]*?\)/g, '')
    .trim();

  if (
    cleaned.includes('trên Google Maps') ||
    cleaned.includes('chất lượng cao') ||
    cleaned.includes('Địa điểm du lịch tham quan') ||
    cleaned.includes('Địa điểm ẩm thực đặc sản') ||
    cleaned.includes('Địa điểm quán cafe check-in') ||
    cleaned.includes('Địa điểm khách sạn nghỉ dưỡng') ||
    cleaned.startsWith('Địa điểm ẩm thực') ||
    cleaned.startsWith('Địa điểm du lịch') ||
    cleaned.length < 15
  ) {
    return sinhMoTaThucTeFrontend(act, formDuLieu.diemDen);
  }
  return cleaned;
}

function getTravelEstimate(act, day, actIndex) {
  // 1. Dữ liệu có cấu trúc từ backend
  if (act.travel_from && act.travel_duration_mins) {
    const dist = Number(act.travel_distance_km || 1);
    return {
      from: act.travel_from,
      duration: `${act.travel_duration_mins} phút`,
      distance: dist,
      cost: act.travel_cost || `~${Math.round(dist * 14000 / 1000) * 1000}đ`,
      mode: dist < 1.5 ? 'Đi bộ thư thả' : dist < 6 ? 'Xe máy tiện lợi' : 'Ô tô / Taxi'
    };
  }

  // 2. Dữ liệu trích xuất từ chuỗi mô tả nếu có
  const rawText = act.activity || '';
  const match = rawText.match(/\(Từ (.*?) di chuyển ~([0-9.]+)km, khoảng ([0-9]+) phút(?:, phí taxi ước tính (.*?))?\)/);
  if (match) {
    const dist = parseFloat(match[2]);
    return {
      from: match[1],
      distance: match[2],
      duration: `${match[3]} phút`,
      cost: match[4] || null,
      mode: dist < 1.5 ? 'Đi bộ thư thả' : dist < 6 ? 'Xe máy tiện lợi' : 'Ô tô / Taxi'
    };
  }

  // 3. Tính toán trực tiếp theo tọa độ điểm trước đó trong ngày hoặc từ khách sạn
  if (day && day.activities && act.latitude && act.longitude) {
    let prev = null;
    if (actIndex > 0) {
      prev = day.activities[actIndex - 1];
    } else if (lichTrinh.value?.hotel_recommendation) {
      prev = {
        name: lichTrinh.value.hotel_recommendation.name || 'Khách sạn lưu trú',
        latitude: lichTrinh.value.hotel_recommendation.latitude,
        longitude: lichTrinh.value.hotel_recommendation.longitude
      };
    }

    if (prev && prev.latitude && prev.longitude) {
      const calc = tinhKhoangCachVaThoiGian(prev, act);
      if (calc && calc.distKm > 0.1 && calc.distKm < 150) {
        const cost = Math.round(calc.distKm * 14000 / 1000) * 1000;
        return {
          from: prev.name || prev.place || 'Điểm xuất phát',
          distance: calc.distKm,
          duration: `${calc.phut} phút`,
          cost: `~${cost.toLocaleString('vi-VN')}đ`,
          mode: `${calc.phuongTien} ${calc.labelPhuongTien}`
        };
      }
    }
  }

  return null;
}

// ==================== MAP VIEW TOGGLE & TRANSIT MICRO-UX LOGIC ====================
const itineraryViewMode = ref('split') // 'timeline' | 'split' | 'map'

function doiViewMode(mode) {
  itineraryViewMode.value = mode
  if (mode !== 'timeline') {
    nextTick(() => {
      setTimeout(() => {
        if (routingMap) routingMap.invalidateSize()
        else renderLeafletMap()
      }, 150)
    })
  }
}

function parseGioPhut(timeStr) {
  if (!timeStr) return null
  const m = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (m) {
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
  }
  return null
}

function tinhKhoangCachVaThoiGian(act1, act2) {
  if (!act1 || !act2) return null
  let distKm = null

  if (act1.latitude && act1.longitude && act2.latitude && act2.longitude) {
    const R = 6371
    const dLat = (act2.latitude - act1.latitude) * Math.PI / 180
    const dLon = (act2.longitude - act1.longitude) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(act1.latitude * Math.PI / 180) * Math.cos(act2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    distKm = Math.round(R * c * 10) / 10
  } else {
    distKm = 4.2
  }

  // Ước lượng thời gian di chuyển: trung bình đô thị 25-30 km/h + 4 phút dừng/đỗ
  let phut = Math.max(8, Math.round(distKm * 2.5) + 4)
  let phuongTien = '🚗'
  let labelPhuongTien = 'Ô tô / Taxi'

  if (distKm < 1.2) {
    phuongTien = '🚶'
    phut = Math.max(5, Math.round(distKm * 12))
    labelPhuongTien = 'Đi bộ thư thả'
  } else if (distKm < 5) {
    phuongTien = '🛵'
    phut = Math.max(7, Math.round(distKm * 2) + 3)
    labelPhuongTien = 'Xe máy tiện lợi'
  }

  // Cảnh báo xung đột thời gian & lộ trình (Warning Color Palette theo UI/UX Pro Max)
  const time1 = parseGioPhut(act1.time)
  const time2 = parseGioPhut(act2.time)
  let canhBao = null

  if (time1 !== null && time2 !== null) {
    const gapPhut = time2 - time1
    if (gapPhut > 0 && gapPhut <= 40) {
      canhBao = {
        type: 'warning-tight',
        icon: '⚠️',
        title: 'Lịch trình sát giờ',
        desc: `Hai điểm chỉ cách nhau ${gapPhut} phút nhưng cần ~${phut} phút di chuyển. Bạn có thể bị vội!`
      }
    }
  }

  if (distKm > 18) {
    canhBao = {
      type: 'warning-far',
      icon: '🚨',
      title: 'Khoảng cách xa (> 18 km)',
      desc: `Hai điểm cách nhau tới ${distKm} km (~${phut} phút xe). Cân nhắc gộp điểm cùng khu vực!`
    }
  }

  const queryOrigin = act1.address ? `${act1.place}, ${act1.address}` : act1.place
  const queryDest = act2.address ? `${act2.place}, ${act2.address}` : act2.place
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(queryOrigin)}&destination=${encodeURIComponent(queryDest)}`

  return {
    distKm,
    phut,
    phuongTien,
    labelPhuongTien,
    canhBao,
    mapsUrl
  }
}

watch(selectedDay, () => {
  renderLeafletMap();
});

watch(lichTrinh, () => {
  renderLeafletMap();
}, { deep: true });

watch(activeTab, (newTab) => {
  if (newTab === 'planner') {
    // Luôn re-render khi chuyển sang tab planner để tránh grey tiles
    renderLeafletMap()
    // Random câu AI mới mỗi khi vào tab planner
    refreshAiHint()
    showAiHintBubble.value = true
  }
});

onMounted(() => {
  // Try autoplay once; browsers may require the user to press the music toggle.
  window.setTimeout(() => toggleCityMusic(allDestinationsCard, true), 250)

  const saved = localStorage.getItem('currentTrip')
  if (saved) {
    try {
      lichTrinh.value = JSON.parse(saved)
      if (lichTrinh.value?.daysList?.[0]) {
        selectedDay.value = lichTrinh.value.daysList[0].day
      }
    } catch (e) {
      console.error(e)
    }
  }
  
  if (activeTab.value === 'planner') {
    nextTick(() => {
      renderLeafletMap();
    });
  }
})

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
      breakfast: { icon: '🥢', label: act.label || 'Ăn sáng', class: 'badge-breakfast' },
      lunch: { icon: '🍜', label: act.label || 'Ăn trưa', class: 'badge-lunch' },
      dinner: { icon: '🍲', label: act.label || 'Ăn tối', class: 'badge-dinner' },
      checkin: { icon: '🛖', label: act.label || 'Nhận phòng', class: 'badge-hotel' },
      checkout: { icon: '🚪', label: act.label || 'Trả phòng', class: 'badge-hotel' },
      cafe: { icon: '☕', label: act.label || 'Cafe & Chill', class: 'badge-cafe' },
      attraction: { icon: '⛩️', label: act.label || 'Tham quan / Check-in', class: 'badge-attraction' }
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
  const selectedCity = visibleCities.value.find(item => item.name === city)
  if (selectedCity) toggleCityMusic(selectedCity)
}

function chonDiemDenExplore(city) {
  formDuLieu.diemDen = city
  selectedPlaces.value = []
  taiDuLieuThanhPho()
  const selectedCity = visibleDestinationCards.value.find(item => item.name === city)
  if (selectedCity) toggleCityMusic(selectedCity)
}

function doiCheDoTinhThanh(mode) {
  if (provinceMode.value === mode) return
  provinceMode.value = mode
  stopCityMusic()
  selectedPlaces.value = []
  const nextCity = visibleCities.value[0]
  if (nextCity) {
    formDuLieu.diemDen = nextCity.name
    taiDuLieuThanhPho()
  }
}

async function taiDuLieuThanhPho() {
  const currentId = ++reqIdCounter
  const dest = (formDuLieu.diemDen || '').trim()
  if (!dest) return

  loadingPlaces.value = true
  places.value = []

  const placeParams = dest === ALL_DESTINATIONS ? { mode: provinceMode.value } : { destination: dest, mode: provinceMode.value }
  api.get('/places', { params: placeParams })
    .then(res => {
      if (currentId === reqIdCounter) {
        places.value = res.data || []
        loadingPlaces.value = false
      }
    })
    .catch(e => {
      console.warn('Lỗi tải địa điểm:', e.message)
      if (currentId === reqIdCounter) loadingPlaces.value = false
    })

  if (dest === ALL_DESTINATIONS) {
    thoiTiet.value = null
  } else {
    api.get('/weather', { params: { destination: dest } })
      .then(res => {
        if (currentId === reqIdCounter) thoiTiet.value = res.data
      })
      .catch(e => {
        console.warn('Lỗi tải thời tiết:', e.message)
        if (currentId === reqIdCounter) thoiTiet.value = null
      })
  }
}

async function taoLichTrinh() {
  formDuLieu.soThich = chuoiSoThich.value ? chuoiSoThich.value.split(',').map(s => s.trim()).filter(Boolean) : []
  dangTao.value = true
  lichTrinh.value = null
  hienCompletionBanner.value = false

  // Kích hoạt luân phiên loading message có tính cách AI (Mục 6)
  currentLoadingMessageIndex.value = 0
  if (loadingMessageTimer) clearInterval(loadingMessageTimer)
  loadingMessageTimer = setInterval(() => {
    currentLoadingMessageIndex.value = (currentLoadingMessageIndex.value + 1) % LOADING_MESSAGES.length
  }, 1900)

  try {
    const res = await api.post('/ai/plan', {
      origin: formDuLieu.diemKhoiHanh,
      destination: formDuLieu.diemDen,
      days: formDuLieu.soNgay,
      budget: formDuLieu.nganSach,
      people: formDuLieu.soNguoi,
      interests: formDuLieu.soThich,
      selected_places: selectedPlaces.value,
      start_date: formDuLieu.ngayBatDau,
      end_date: formDuLieu.ngayKetThuc,
      transportation: formDuLieu.phuongTien,
      hotel_request: formDuLieu.yeuCauKhachSan,
      selected_bus: formDuLieu.nhaXeDaChon
    })
    lichTrinh.value = res.data
    // Đảm bảo gắn thông tin di chuyển tối ưu chi phí
    if (!lichTrinh.value.transit_summary) {
      lichTrinh.value.transit_summary = {
        origin: formDuLieu.diemKhoiHanh,
        destination: formDuLieu.diemDen,
        estimated_distance_km: transitRouteInfo.value.estimatedDistanceKm,
        selected_bus: formDuLieu.nhaXeDaChon || transitRouteInfo.value.cheapestOperator,
        comparison: transitRouteInfo.value.vehicleComparison,
        available_operators: transitRouteInfo.value.operators
      }
    }
    if (lichTrinh.value?.days) lichTrinh.value.daysList = lichTrinh.value.days
    selectedDay.value = 1
    splitterTongTien.value = lichTrinh.value.total_budget || formDuLieu.nganSach
    splitterSoNguoi.value = lichTrinh.value.people || formDuLieu.soNguoi
    taiChuyenDiCuaToi()

    // Hiển thị completion quote ngẫu nhiên và floating toast (Mục 7)
    const quote = COMPLETION_QUOTES[Math.floor(Math.random() * COMPLETION_QUOTES.length)]
    activeCompletionQuote.value = quote
    hienCompletionBanner.value = true
    personalityToast.value = quote
    setTimeout(() => {
      personalityToast.value = null
    }, 7500)
  } catch (e) {
    alert('Lỗi khi lập lịch: ' + (e?.response?.data?.error || e.message))
  } finally {
    dangTao.value = false
    if (loadingMessageTimer) {
      clearInterval(loadingMessageTimer)
      loadingMessageTimer = null
    }
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
    activeTab.value = 'explore'
    playIntroSplash()
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
  
  // Hiện modal đăng nhập sau khi đăng xuất
  dangKyMode.value = false
  hienAuthModal.value = true
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

async function xoaChuyenDi(trip) {
  const tenChuyen = `${trip.days?.length || 0} ngày tại ${trip.destination}`
  const xacNhan = confirm(`Bạn có chắc muốn xóa chuyến đi "${tenChuyen}" không?\n\n⚠️ Hành động này không thể hoàn tác.`)
  if (!xacNhan) return
  try {
    await api.delete(`/social/trips/${trip._id}`)
    // Xóa khỏi danh sách local ngay không cần reload
    myTripsList.value = myTripsList.value.filter(t => t._id !== trip._id)
  } catch (e) {
    alert('Đã xảy ra lỗi: ' + (e?.response?.data?.error || e.message))
  }
}

function xuatPdf() {
  const element = document.querySelector('.plan-results-container')
  if (!element) {
    alert('Không tìm thấy nội dung lịch trình để xuất PDF!')
    return
  }
  
  // Clone element to remove interactive buttons
  const clone = element.cloneNode(true)
  const toolActions = clone.querySelector('.plan-tool-actions')
  if (toolActions) toolActions.remove()
  
  // Also remove the "Chia tiền nhóm" or "Đổi lịch tránh mưa" buttons if any other remain
  const printBtn = clone.querySelector('.app-primary-btn')
  if (printBtn) printBtn.remove()
  
  const opt = {
    margin: 10,
    filename: `lich-trinh-${lichTrinh.value?.destination || 'chuyen-di'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  
  html2pdf().set(opt).from(clone).save()
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
  // Restore Dark Mode
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }

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
const showIntroSplash = ref(false)
const introSplitting = ref(false)
let introTimeout1 = null;
let introTimeout2 = null;

function playIntroSplash() {
  showIntroSplash.value = true
  introSplitting.value = false
  
  clearTimeout(introTimeout1)
  clearTimeout(introTimeout2)
  
  // Đợi 7.5s xem video, sau đó kích hoạt hiệu ứng tách chữ và mờ dần trong 2.5s (Tổng 10s)
  introTimeout1 = setTimeout(() => {
    introSplitting.value = true
    introTimeout2 = setTimeout(() => {
      showIntroSplash.value = false
    }, 2500)
  }, 7500)
}

function boQuaIntro() {
  clearTimeout(introTimeout1)
  clearTimeout(introTimeout2)
  
  // Tách video nhanh hơn khi bỏ qua
  introSplitting.value = true
  setTimeout(() => {
    showIntroSplash.value = false
  }, 800)
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* Hide scrollbar universally */
::-webkit-scrollbar {
  display: none;
}
* {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Hiệu ứng Parallax Zoom cho toàn bộ app */
.app-root {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  transition: transform 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.app-root.app-intro-zoom {
  transform: scale(0.95);
}

/* ===== AI HINT BUBBLE — đồng bộ màu Teal chủ đạo sang trọng ===== */
.ai-hint-bubble {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%);
  border-radius: 20px;
  padding: 20px 44px 20px 20px;
  margin-bottom: 16px;
  box-shadow: 0 8px 30px rgba(13, 148, 136, 0.28), 0 0 0 1px rgba(255,255,255,0.18) inset;
  animation: bubbleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  grid-column: 1 / -1;
  width: 100%;
}

.ai-hint-bubble::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
  border-radius: inherit;
  pointer-events: none;
}

@keyframes bubbleIn {
  from { opacity: 0; transform: scale(0.92) translateY(-12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.ai-hint-robot {
  font-size: 2.2rem;
  line-height: 1;
  flex-shrink: 0;
  animation: robotBounce 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
}

@keyframes robotBounce {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50%       { transform: translateY(-6px) rotate(4deg); }
}

.ai-hint-body {
  flex: 1;
  min-width: 0;
}

.ai-hint-content p {
  margin: 0 0 12px;
  font-size: 0.97rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.95);
  font-weight: 500;
}

.ai-hint-content strong {
  color: #fff;
  font-weight: 800;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.ai-hint-content em {
  font-style: italic;
  color: #fde68a;
  font-weight: 600;
}

/* Quick-pick chips bên trong bubble */
.ai-hint-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.35);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  user-select: none;
}

.ai-chip:hover {
  background: rgba(255,255,255,0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.ai-chip:active {
  transform: translateY(0);
}

/* Chip "Câu khác" — nổi bật riêng */
.ai-chip-refresh {
  background: rgba(255, 220, 100, 0.25) !important;
  border-color: rgba(255, 220, 100, 0.5) !important;
  color: #fde68a !important;
  font-style: italic;
}

.ai-chip-refresh:hover {
  background: rgba(255, 220, 100, 0.4) !important;
}

.ai-chip-refresh span,
.ai-chip-refresh {
  letter-spacing: 0.01em;
}

/* Nút dismiss bubble */
.ai-hint-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: rgba(255,255,255,0.2);
  border: none;
  color: rgba(255,255,255,0.9);
  font-size: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  line-height: 1;
  padding: 0;
}

.ai-hint-close:hover {
  background: rgba(255,255,255,0.4);
}

/* ===== AI PROVINCE SUBTITLE — sinh động, gradient ===== */
.ai-province-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 14px;
  background: linear-gradient(90deg, #fef3c7, #fde68a);
  border-left: 3px solid #f59e0b;
  border-radius: 0 10px 10px 0;
  font-size: 0.88rem;
  font-weight: 600;
  font-style: normal;
  color: #92400e;
  line-height: 1.5;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.2);
  animation: subtitlePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes subtitlePop {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}

[data-theme="dark"] .ai-province-subtitle {
  background: linear-gradient(90deg, rgba(245,158,11,0.15), rgba(251,191,36,0.1));
  color: #fde68a;
  border-left-color: #f59e0b;
}


:root {
  --primary: #059669; /* emerald-600 */
  --primary-dark: #065f46; /* emerald-800 */
  --primary-light: #ecfdf5;
  --accent: #f59e0b; /* Vàng Hội An */
  --accent-light: #fef3c7;
  --bg-app: #f1f5f9;
  --card-bg: rgba(255, 255, 255, 0.6); /* Glass light mode */
  --text-main: #1e293b;
  --text-sub: #475569;
  --border-color: rgba(253, 230, 138, 0.4); /* border-amber-200/40 */
  --radius-sm: 8px; /* rounded-lg */
  --radius-md: 12px; /* rounded-xl */
  --radius-lg: 16px;
  --shadow-sm: 0 4px 20px rgba(0,0,0,0.04);
  --shadow-md: 0 12px 32px rgba(0,0,0,0.06);
  --shadow-lg: 0 0 40px rgba(245, 158, 11, 0.15); /* Warm Glow */
  --input-bg: #f8fafc;
  --input-bg-focus: #ffffff;
}

:root[data-theme="dark"] {
  --bg-app: #0f172a; /* Keep dark background, we'll use teal/emerald gradient on containers */
  --card-bg: rgba(255, 255, 255, 0.1); /* Glass dark mode */
  --text-main: #f8fafc;
  --text-sub: #cbd5e1;
  --border-color: rgba(253, 230, 138, 0.3); /* border-amber-200/30 */
  --primary-light: rgba(5, 150, 105, 0.15);
  --accent-light: rgba(245, 158, 11, 0.15);
  --shadow-sm: 0 4px 20px rgba(0,0,0,0.2);
  --shadow-md: 0 10px 30px rgba(0,0,0,0.3);
  --shadow-lg: 0 0 40px rgba(245, 158, 11, 0.15); /* Warm Glow */
  --input-bg: rgba(0,0,0,0.2);
  --input-bg-focus: rgba(0,0,0,0.4);
  --weather-bg: rgba(5, 150, 105, 0.1);
  --weather-border: rgba(5, 150, 105, 0.2);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: url('/images/app-bg.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: var(--bg-app);
  color: var(--text-main);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.3s, color 0.3s;
}

/* Thêm lớp overlay mờ nhẹ để đảm bảo chữ trên web vẫn dễ đọc */
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--bg-app);
  opacity: 0.7; /* Chế độ sáng tối sẽ tự động điều chỉnh độ tối qua --bg-app */
  z-index: -1;
  pointer-events: none;
}

h1, h2, h3, h4, .place-name, .hero-content h2, .app-header h1 {
  font-family: 'Playfair Display', 'Lora', serif;
}

button, input, select { font: inherit; outline: none; }
button { cursor: pointer; }

/* APP LAYOUT WRAPPER */
.app-root {
  min-height: 100vh;
  display: flex;
  background: var(--bg-app);
}

.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
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
  background: var(--input-bg);
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

.app-main {
  flex: 1;
  padding: 18px 40px;
  padding-bottom: 30px;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* EXPLORE TAB HERO CARD */
.app-hero-card {
  background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.45)), url('/images/mientrung-hero.jpg') no-repeat center center;
  background-size: cover;
  color: #fff;
  padding: 32px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.app-hero-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.hero-content {
  padding: 10px 0;
  max-width: 540px;
  animation: floatHeroCard 6s ease-in-out infinite;
  z-index: 2;
  opacity: 0.25;
  transition: opacity 0.5s ease;
}
.hero-content:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .hero-content {
    opacity: 1;
  }
}

@keyframes floatHeroCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.app-hero-card p {
  font-size: 14px;
  color: #e2e8f0;
  line-height: 1.6;
  margin-bottom: 20px;
}
.hero-cta-btn {
  background: #ffffff;
  color: #059669;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.hero-cta-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  color: var(--primary-dark);
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
.province-mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}
.province-mode-switch button {
  border: 0;
  border-radius: 7px;
  padding: 6px 10px;
  background: transparent;
  color: var(--text-sub);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.province-mode-switch button.active {
  background: var(--primary);
  color: #fff;
}
.planner-mode-switch {
  margin-bottom: 8px;
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
.city-music-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.music-master-toggle {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--primary-light);
  border-radius: 50%;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  line-height: 1;
}
.music-master-toggle:hover,
.music-master-toggle.muted {
  background: var(--primary-light);
}
.music-volume-label {
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}
.music-volume-slider {
  width: 72px;
  height: 4px;
  accent-color: var(--primary);
  cursor: pointer;
}
.cities-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 4px 14px 4px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: thin;
  scrollbar-color: var(--primary) var(--primary-light);
}
.cities-carousel::-webkit-scrollbar {
  height: 8px;
}
.cities-carousel::-webkit-scrollbar-track {
  background: var(--primary-light);
  border-radius: 999px;
}
.cities-carousel::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 999px;
}
.cities-carousel::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark, #0f766e);
}
.city-card-btn {
  background-color: var(--card-bg);
  background-size: cover;
  background-position: center;
  border: none;
  outline: none;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 105px;
  max-width: 115px;
  height: 125px;
  color: #ffffff;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-appearance: none;
  appearance: none;
}
.city-card-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%);
  z-index: 1;
  border-radius: inherit;
}
.city-card-btn:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(13, 148, 136, 0.3);
}
.city-card-btn.active {
  box-shadow: 0 0 0 2px var(--primary), 0 0 0 5px var(--primary-light), var(--shadow-sm);
  transform: translateY(-2px);
}
.city-card-btn.active::after {
  content: '✓';
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 10px;
  font-weight: 800;
  background: var(--primary);
  color: #fff;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0,0,0,0.25);
}
.city-icon, .city-name, .city-tag {
  position: relative;
  z-index: 2;
}
.city-pin-icon {
  display: block;
  margin-bottom: 4px;
  opacity: 0.9;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
  position: relative;
  z-index: 2;
}
.city-name { font-size: 13px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.9); line-height: 1.2; margin-bottom: 2px; }
.city-tag { font-size: 9.5px; color: rgba(255,255,255,0.88); text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.25; }

/* WEATHER WIDGET */
.app-weather-widget {
  background: var(--weather-bg, #e8f4f3);
  border: 1px solid var(--weather-border, #c2e2df);
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
  border-top: 1px dashed var(--weather-border, #b2dfdb);
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

.explore-search-box {
  position: relative;
  margin: 12px 0 16px 0;
  display: flex;
  align-items: center;
}
.explore-search-input {
  width: 100%;
  padding: 10px 38px 10px 14px;
  background: var(--input-bg);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: inherit;
  color: var(--text-main);
  outline: none;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}
.explore-search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
.clear-search-btn {
  position: absolute;
  right: 12px;
  background: #cbd5e1;
  color: #334155;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.clear-search-btn:hover {
  background: #94a3b8;
  color: #fff;
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
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

/* Hiệu ứng ánh sáng lướt qua (Light Reflection / Gleam) */
.app-place-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg);
  z-index: 2;
  pointer-events: none;
  transition: left 0.6s ease-out;
}

.app-place-card:hover {
  transform: translateY(-8px) scale(1.015);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 20px rgba(13, 148, 136, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.app-place-card:hover::after {
  left: 200%;
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
  background: var(--input-bg);
  padding: 5px 8px;
  border-radius: 6px;
}
.place-maps-btn:hover { color: var(--primary); background: #e2e8f0; }

/* LOAD MORE & COLLAPSE BUTTONS */
.load-more-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--primary, #0d7c76) 0%, #0a635e 100%);
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(13, 124, 118, 0.25);
  transition: all 0.25s ease;
}
.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 124, 118, 0.35);
  background: linear-gradient(135deg, #10948e 0%, #0d7c76 100%);
}
.load-more-btn:active {
  transform: translateY(0);
}
.load-more-text {
  font-weight: 700;
}
.load-more-count {
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.22);
  padding: 2px 8px;
  border-radius: 12px;
}
.load-more-icon {
  font-size: 14px;
  font-weight: 800;
}
.collapse-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--card-bg, #ffffff);
  color: var(--text-sub, #64748b);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 11px 22px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.collapse-btn:hover {
  background: #f1f5f9;
  color: var(--primary, #0d7c76);
  border-color: #cbd5e1;
}
:root[data-theme="dark"] .collapse-btn {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}
:root[data-theme="dark"] .collapse-btn:hover {
  background: rgba(51, 65, 85, 0.9);
  color: #f1f5f9;
}

/* PLANNER FORM */
.planner-form-container {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  width: auto;
  margin: 0 20px;
  flex-shrink: 0;
}
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.planner-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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
  background: var(--input-bg);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-main);
}
.app-input:focus, .app-select:focus {
  border-color: var(--primary);
  background: var(--input-bg-focus);
}
.stepper-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
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
  accent-color: var(--primary, #0d9488);
}
.quick-city-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--input-bg) 72%, transparent);
}
.city-select-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 7px 8px 7px 13px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}
.city-select-pill:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
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
  background: var(--input-bg);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
}
.picker-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.picker-kicker {
  display: block;
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .04em;
  margin-bottom: 4px;
}
.picker-top h4 {
  color: var(--text-main);
  font-size: 16px;
  line-height: 1.3;
  margin: 0;
}
.badge-selected-count {
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
}
.ai-crawl-action-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border: 0;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity .2s, transform .2s;
}
.ai-crawl-action-btn:hover { opacity: 0.9; transform: scale(1.02); }
.ai-crawl-action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.ai-crawl-pill {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border-color: #c7d2fe !important;
  color: #4f46e5 !important;
  cursor: pointer;
}
.ai-crawl-pill:hover { background: #e0e7ff; }

.crawl-alert-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
  animation: fadeIn .3s ease;
}

.btn-spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
.picker-row { margin-bottom: 16px; }
.row-label { font-size: 12px; font-weight: 800; color: var(--text-main); display: block; margin-bottom: 7px; }
.chips-wrap { 
  display: flex; 
  flex-wrap: nowrap; 
  overflow-x: auto; 
  gap: 8px; 
  padding-bottom: 8px; 
  scroll-behavior: smooth;
}
.chips-wrap::-webkit-scrollbar {
  height: 4px;
}
.chips-wrap::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.chips-wrap::-webkit-scrollbar-track {
  background: transparent;
}
.app-chip {
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease, transform .2s ease;
}
.app-chip:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
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
  border: none;
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.app-primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4);
  background: var(--primary-dark);
}
.submit-plan-btn { width: 100%; margin-top: 18px; padding: 14px; }

/* PLAN RESULTS */
.plan-results-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}
.plan-summary-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}
:root[data-theme="dark"] .plan-summary-card {
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(253, 230, 138, 0.25);
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.12);
}
.summary-top-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.plan-dest-badge {
  background: var(--primary-light);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
}
.savings-badge {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}
.summary-meta h2 {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-main);
  font-family: 'Playfair Display', serif;
}
.summary-budget {
  font-size: 13.5px;
  color: var(--text-sub);
  margin-top: 6px;
}
.summary-budget strong {
  color: var(--accent);
  font-size: 17px;
  font-weight: 800;
}

.budget-breakdown-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}
:root[data-theme="dark"] .budget-breakdown-row {
  background: rgba(0, 0, 0, 0.35);
}
.bb-pill {
  font-size: 11.5px;
  color: var(--text-sub);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--card-bg, #fff);
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
:root[data-theme="dark"] .bb-pill {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
}
.bb-pill b {
  color: var(--text-main);
  font-weight: 700;
}
:root[data-theme="dark"] .bb-pill b {
  color: #f8fafc;
}

.plan-tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  border-top: 1px solid var(--border-color);
  padding-top: 14px;
}
.tool-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}
.tool-btn:hover {
  background: rgba(245, 158, 11, 0.18);
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-1px);
}
:root[data-theme="dark"] .tool-btn {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f1f5f9;
}
:root[data-theme="dark"] .tool-btn:hover {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fbbf24;
}
.ai-opt-highlight-btn {
  background: linear-gradient(135deg, #059669, #047857) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
}
.ai-opt-highlight-btn:hover {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  transform: translateY(-2px);
}
.gmap-all-stops-btn {
  background: rgba(2, 132, 199, 0.15) !important;
  border: 1px solid rgba(2, 132, 199, 0.4) !important;
  color: #0284c7 !important;
}
:root[data-theme="dark"] .gmap-all-stops-btn {
  color: #38bdf8 !important;
  border-color: rgba(56, 189, 248, 0.4) !important;
}
.zalo-share-btn {
  background: rgba(99, 102, 241, 0.15) !important;
  border: 1px solid rgba(99, 102, 241, 0.4) !important;
  color: #4f46e5 !important;
}
:root[data-theme="dark"] .zalo-share-btn {
  color: #a5b4fc !important;
}
.rain-btn {
  color: #0284c7 !important;
  border-color: #bae6fd !important;
  background: #f0f9ff !important;
}
:root[data-theme="dark"] .rain-btn {
  color: #38bdf8 !important;
  border-color: rgba(56, 189, 248, 0.4) !important;
  background: rgba(14, 165, 233, 0.15) !important;
}

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

/* ==================== ITINERARY SPLIT VIEW & STICKY MAP ==================== */
.itinerary-split-container {
  width: 100%;
}
@media (min-width: 992px) {
  .itinerary-split-container.mode-split {
    display: grid;
    grid-template-columns: 1.15fr 0.95fr;
    gap: 24px;
    align-items: start;
  }
  .itinerary-split-container.mode-split .app-map-box {
    position: sticky;
    top: 80px;
    height: calc(100vh - 105px);
    min-height: 520px;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow: hidden;
  }
  .itinerary-split-container.mode-split .sticky-map-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  .itinerary-split-container.mode-split .app-map-iframe {
    flex: 1;
    height: 100% !important;
    min-height: 440px;
    border-radius: var(--radius-sm);
  }
}
.itinerary-split-container.mode-timeline .app-timeline-wrap {
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}
.app-timeline-wrap {
  position: relative;
}
.app-timeline-wrap::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5l10 3.5-10 3.5zM0 38v-2h20v2H0zm0-20v-2h20v2H0z' fill='%23059669' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  border-radius: var(--radius-lg);
}
.itinerary-split-container.mode-map .app-map-box {
  width: 100%;
}
.itinerary-split-container.mode-map .app-map-iframe {
  height: 600px;
}

/* MAP BOX */
.app-map-box {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px;
}
.map-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
.map-header h4 { font-size: 14px; font-weight: 800; }
.map-live-hint {
  font-size: 11px;
  color: var(--primary);
  font-weight: 600;
  background: var(--primary-light);
  padding: 2px 8px;
  border-radius: 10px;
}
.day-switcher-pills { display: flex; gap: 6px; }
.day-pill {
  border: 1px solid var(--border-color);
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.day-pill.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.app-map-iframe { width: 100%; height: 260px; border: 0; border-radius: var(--radius-sm); }

/* LEAFLET BOUNCING MARKER */
.itinerary-map-marker {
  width: 30px;
  height: 30px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
  cursor: pointer;
}
@keyframes markerPulseBounce {
  0%, 100% {
    transform: translateY(0) scale(1);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.28);
  }
  50% {
    transform: translateY(-12px) scale(1.3);
    box-shadow: 0 8px 18px rgba(5, 150, 105, 0.6);
    background: var(--primary-dark);
  }
}
.marker-bouncing {
  animation: markerPulseBounce 0.75s ease-in-out infinite !important;
  z-index: 9999 !important;
}

/* TIMELINE WRAP */
.app-timeline-wrap { display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; }
.timeline-day-card {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}
[data-theme="dark"] .timeline-day-card {
  box-shadow: var(--shadow-lg);
}
.day-selected-highlight {
  border-color: var(--accent) !important;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
}
.day-header-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  gap: 10px;
  flex-wrap: wrap;
}
.day-num { font-size: 14px; font-weight: 800; color: var(--accent); }
.day-activities-count { font-size: 11px; color: var(--text-sub); }
.dhp-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.day-gmaps-route-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff !important;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.day-gmaps-route-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.45);
}

.activities-stream { display: flex; flex-direction: column; }
.activity-row {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  position: relative;
  align-items: stretch;
  transition: background 0.2s ease, transform 0.15s ease;
  border-radius: 12px;
}
.activity-row.is-dragging {
  opacity: 0.35;
  transform: scale(0.98);
}
.activity-row.drag-target-over {
  background: rgba(14, 165, 233, 0.08);
  outline: 2px dashed #0ea5e9;
}
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  cursor: grab;
  color: #94a3b8;
  font-size: 16px;
  user-select: none;
  padding: 2px 0;
  transition: color 0.15s ease;
}
.drag-handle:hover {
  color: var(--primary);
}
.drag-handle:active {
  cursor: grabbing;
}
.activity-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  flex-shrink: 0;
  padding-top: 4px;
}
.activity-time { font-size: 12px; font-weight: 800; color: var(--primary-dark); }
.activity-bullet {
  width: 12px;
  height: 12px;
  background: var(--accent);
  border-radius: 2px;
  transform: rotate(45deg);
  margin-top: 6px;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}
.activity-bullet::after {
  content: '';
  position: absolute;
  top: 14px;
  left: 5px;
  width: 2px;
  height: calc(100% + 40px);
  background: transparent;
  border-left: 2px dashed rgba(5, 150, 105, 0.3);
  transform: rotate(-45deg);
  transform-origin: top left;
  z-index: 1;
}
.activity-row:last-child .activity-bullet::after { display: none; }

.activity-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
  padding: 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2);
}
[data-theme="dark"] .activity-card-body {
  background: rgba(0, 0, 0, 0.2);
}
.activity-row.is-hovered .activity-card-body {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.15);
  transform: translateY(-1px);
}
[data-theme="dark"] .activity-row.is-hovered .activity-card-body {
  background: rgba(0, 0, 0, 0.4);
}
.act-thumbnail-box {
  width: 82px;
  height: 82px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  background: #e2e8f0;
}
.act-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.act-thumbnail-box:hover .act-thumbnail-img {
  transform: scale(1.08);
}
.act-thumb-index-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 6px;
}
.act-main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.activity-top-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 2px;
}
.act-title-cluster {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
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

.place-name {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  cursor: pointer;
  line-height: 1.3;
  letter-spacing: -0.1px;
}
.place-name:hover {
  color: var(--primary);
}
.act-actions-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.act-change-btn {
  font-size: 11px;
  font-weight: 700;
  color: #fff !important;
  background: var(--accent); /* Vàng Hội An */
  border: none;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}
.act-change-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}
.act-direction-btn {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff !important;
  text-decoration: none;
  background: #0284c7;
  padding: 4px 10px;
  border-radius: 8px;
  border: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}
.act-direction-btn:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

/* THẺ DỰ KIẾN THỜI GIAN & KHOẢNG CÁCH TỚI ĐIỂM ĐẾN */
.act-travel-eta-card {
  background: linear-gradient(100deg, rgba(14, 165, 233, 0.07) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-left: 3.5px solid #0284c7;
  border-radius: 10px;
  padding: 7px 12px;
  margin: 5px 0 7px;
  transition: all 0.2s ease;
}
:root[data-theme="dark"] .act-travel-eta-card {
  background: linear-gradient(100deg, rgba(2, 132, 199, 0.12) 0%, rgba(16, 185, 129, 0.07) 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-left: 3.5px solid #38bdf8;
  box-shadow: 0 2px 12px rgba(2, 132, 199, 0.12);
}
.eta-card-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.eta-pulse-icon {
  font-size: 16px;
  animation: pulse 2s infinite ease-in-out;
}
.eta-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.eta-from-to {
  font-size: 12px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  font-weight: 500;
}
:root[data-theme="dark"] .eta-from-to {
  color: #94a3b8;
}
.eta-from-to strong {
  color: var(--text-main);
  font-weight: 700;
}
.eta-arrow {
  color: #0284c7;
  font-weight: 800;
}
:root[data-theme="dark"] .eta-arrow {
  color: #38bdf8;
}
.eta-metrics-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.eta-pill {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.eta-time {
  background: rgba(2, 132, 199, 0.12);
  color: #0284c7;
  font-weight: 700;
}
:root[data-theme="dark"] .eta-time {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}
.eta-dist {
  background: rgba(100, 116, 139, 0.1);
  color: #475569;
}
:root[data-theme="dark"] .eta-dist {
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}
.eta-mode {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}
:root[data-theme="dark"] .eta-mode {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}
.eta-taxi {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}
:root[data-theme="dark"] .eta-taxi {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

/* HIGH-CONTRAST METADATA BADGES */
.act-meta-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 3px 0 5px;
}
.meta-tag-pill {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1.5;
}
.tag-rating {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}
:root[data-theme="dark"] .tag-rating {
  background: rgba(245, 158, 11, 0.2);
  color: #fde047;
  border-color: rgba(245, 158, 11, 0.4);
}
.tag-hours {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}
:root[data-theme="dark"] .tag-hours {
  background: rgba(30, 41, 59, 0.9);
  color: #cbd5e1;
  border-color: rgba(255, 255, 255, 0.15);
}
.tag-dwell {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}
:root[data-theme="dark"] .tag-dwell {
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
  border-color: rgba(14, 165, 233, 0.4);
}
.tag-best-time {
  background: #ffedd5;
  color: #c2410c;
  border: 1px solid #fed7aa;
}
:root[data-theme="dark"] .tag-best-time {
  background: rgba(249, 115, 22, 0.2);
  color: #fdba74;
  border-color: rgba(249, 115, 22, 0.4);
}
.tag-indoor {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
:root[data-theme="dark"] .tag-indoor {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.4);
}
.tag-outdoor {
  background: #fef9c3;
  color: #854d0e;
  border: 1px solid #fef08a;
}
:root[data-theme="dark"] .tag-outdoor {
  background: rgba(234, 179, 8, 0.2);
  color: #fde047;
  border-color: rgba(234, 179, 8, 0.4);
}
.tag-dress {
  background: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}
:root[data-theme="dark"] .tag-dress {
  background: rgba(168, 85, 247, 0.2);
  color: #d8b4fe;
  border-color: rgba(168, 85, 247, 0.4);
}
.tag-theme {
  background: #ffe4e6;
  color: #be123c;
  border: 1px solid #fecdd3;
}
:root[data-theme="dark"] .tag-theme {
  background: rgba(244, 63, 94, 0.2);
  color: #fda4af;
  border-color: rgba(244, 63, 94, 0.4);
}

/* ADDRESS & DESCRIPTION TYPOGRAPHY */
.act-address {
  font-size: 12.5px;
  color: #0284c7;
  font-weight: 600;
  margin: 3px 0 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
:root[data-theme="dark"] .act-address {
  color: #38bdf8;
}
.act-desc {
  font-size: 13.5px;
  color: #1e293b;
  line-height: 1.6;
  margin: 4px 0 7px;
  letter-spacing: 0.1px;
  font-weight: 500;
}
:root[data-theme="dark"] .act-desc {
  color: #e2e8f0;
  font-weight: 400;
}

/* SIGNATURE DISHES HIGHLIGHT BOX */
.act-signature-box {
  background: #fff1f2;
  border-left: 3.5px solid #f43f5e;
  border-radius: 6px;
  padding: 6px 12px;
  margin: 6px 0;
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}
:root[data-theme="dark"] .act-signature-box {
  background: rgba(225, 29, 72, 0.15);
  border-left: 3.5px solid #f43f5e;
}
.asb-title {
  color: #be123c;
  font-weight: 700;
}
:root[data-theme="dark"] .asb-title {
  color: #fb7185;
}
.asb-dishes {
  color: #881337;
  font-weight: 600;
}
:root[data-theme="dark"] .asb-dishes {
  color: #ffe4e6;
}

/* PRICING BOX */
.act-cost-box {
  background: #f0fdf4;
  border-left: 3.5px solid #10b981;
  border-radius: 6px;
  padding: 6px 12px;
  margin-top: 5px;
  font-size: 12.5px;
  color: #166534;
}
:root[data-theme="dark"] .act-cost-box {
  background: rgba(16, 185, 129, 0.15);
  border-left: 3.5px solid #10b981;
  color: #6ee7b7;
}
.act-cost-box b {
  color: #15803d;
  font-weight: 700;
}
:root[data-theme="dark"] .act-cost-box b {
  color: #a7f3d0;
}

/* RAIN MODAL STYLES */
.rain-modal-card {
  background: #fff;
  border-radius: 20px;
  max-width: 520px;
  width: 92%;
  padding: 24px;
  box-shadow: 0 20px 45px rgba(0,0,0,0.2);
  animation: popIn 0.25s ease-out;
}
.rmc-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}
.rmc-icon-badge {
  font-size: 32px;
  background: #e0f2fe;
  padding: 8px 12px;
  border-radius: 14px;
}
.rmc-sub {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 2px;
}
.rmc-weather-alert-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.rmc-wa-icon { font-size: 24px; }
.rmc-wa-content strong { font-size: 13px; color: #166534; display: block; margin-bottom: 2px; }
.rmc-wa-content p { font-size: 12px; color: #374151; line-height: 1.4; margin: 0; }
.rmc-ai-proposal {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}
.rmc-proposal-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 10px;
}
.rmc-proposal-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rmc-proposal-list li {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--text-main);
  line-height: 1.4;
}
.rmc-step-num {
  width: 20px;
  height: 20px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 11px;
  flex-shrink: 0;
  margin-top: 1px;
}
.rmc-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.rmc-confirm-btn {
  background: linear-gradient(135deg, #0284c7, #0284c7) !important;
}

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
  cursor: pointer;
  transition: background 0.2s;
}
.share-trip-btn:hover {
  background: #e2e8f0;
}
.delete-trip-btn {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
}
.delete-trip-btn:hover {
  background: #e11d48;
  color: #fff;
  border-color: #e11d48;
  transform: scale(1.08);
  box-shadow: 0 3px 10px rgba(225, 29, 72, 0.35);
}
[data-theme="dark"] .delete-trip-btn {
  background: rgba(225, 29, 72, 0.12);
  border-color: rgba(225, 29, 72, 0.3);
  color: #fb7185;
}
[data-theme="dark"] .delete-trip-btn:hover {
  background: #e11d48;
  color: #fff;
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

.auth-submit-btn { width: 100%; margin-top: 6px; }

/* ==================== AUTH MODAL GLASSMORPHISM ==================== */
.auth-overlay-glass {
  background: url('/images/auth-bg.jpg') center/cover no-repeat;
  perspective: 1000px;
}
.auth-overlay-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
.auth-card-glass {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 24px 48px rgba(0,0,0,0.4) !important;
  max-width: 360px !important; /* Thu gọn */
  position: relative;
  z-index: 2;
  color: #fff;
  padding: 30px !important;
}
.auth-card-glass .modal-header h3 { color: #fff; }
.auth-card-glass .close-modal-btn {
  background: rgba(255,255,255,0.2) !important;
  color: #fff;
}
.auth-card-glass .auth-tabs { border-bottom-color: rgba(255,255,255,0.2); }
.auth-card-glass .auth-tab {
  color: rgba(255,255,255,0.6);
  border-bottom-color: transparent;
}
.auth-card-glass .auth-tab.active {
  color: #fff;
  border-bottom-color: #fff;
}
.auth-card-glass label { color: rgba(255,255,255,0.9); }
.auth-card-glass .app-input {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
  color: #fff !important;
}
.auth-card-glass .app-input::placeholder { color: rgba(255,255,255,0.5); }
.auth-card-glass .app-input:focus {
  background: rgba(255,255,255,0.2) !important;
  border-color: #fff !important;
}
.auth-card-glass .app-primary-btn {
  background: #fff !important;
  color: #000 !important;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(255,255,255,0.2);
}

/* Auth Fade Transition */
.auth-fade-enter-active, .auth-fade-leave-active {
  transition: opacity 0.5s ease;
}
.auth-fade-enter-active .auth-card-glass {
  animation: authCardEnter 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.auth-fade-leave-active .auth-card-glass {
  transition: transform 0.5s ease;
}
.auth-fade-enter-from, .auth-fade-leave-to {
  opacity: 0;
}
.auth-fade-leave-to .auth-card-glass {
  transform: translateY(20px) scale(0.95);
}
@keyframes authCardEnter {
  0% { transform: translateY(30px) scale(0.9) rotateX(-10deg); opacity: 0; }
  100% { transform: translateY(0) scale(1) rotateX(0); opacity: 1; }
}

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
.pass-logo { font-size: 13px; font-weight: 800; color: var(--primary); display: inline-flex; align-items: center; gap: 6px; }
.pass-mini-logo { width: 22px; height: 22px; border-radius: 50%; object-fit: contain; }
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
/* WIZARD UI STYLES */
.wizard-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 12px 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}
.step-indicator {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-sub);
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
}
.step-indicator.active {
  color: var(--primary);
  background: var(--primary-light);
}
.step-divider {
  flex: 1;
  height: 2px;
  background: var(--border-color);
  margin: 0 10px;
}
.wizard-step-content {
  animation: fadeIn 0.4s ease-out;
}
.wizard-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 16px;
  align-items: stretch;
}
.wizard-footer button {
  flex: 1;
}
.app-secondary-btn {
  background: var(--input-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.app-secondary-btn:hover:not(:disabled) {
  background: #e2e8f0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==================== STYLES CHO AI PERSONALITY (MỤC 6, 7, 8) ==================== */

/* FLOATING PERSONALITY TOAST */
.personality-floating-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(15, 23, 42, 0.94);
  color: #fff;
  padding: 14px 20px;
  border-radius: 18px;
  box-shadow: 0 16px 36px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  max-width: 440px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.personality-floating-toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 42px rgba(0,0,0,0.4);
}
.pft-icon {
  font-size: 28px;
  flex-shrink: 0;
  animation: robotBounce 2s ease-in-out infinite;
}
.pft-body {
  flex: 1;
}
.pft-body strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: #fde68a;
  margin-bottom: 3px;
}
.pft-body p {
  font-size: 12px;
  color: rgba(255,255,255,0.92);
  line-height: 1.4;
  margin: 0;
}
.pft-close {
  background: transparent;
  border: 0;
  color: rgba(255,255,255,0.6);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}
.pft-close:hover {
  color: #fff;
}
.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* QUICK BUDGET CHIPS */
.quick-budget-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.q-budget-chip {
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  color: var(--text-main);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.q-budget-chip:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}
.q-budget-chip.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
}

/* PERSONALITY BUDGET CARD (MỤC 8) */
.personality-budget-card {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
}
.pbc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.pbc-icon {
  font-size: 20px;
}
.pbc-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 10px;
}
.pbc-text strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  margin-bottom: 2px;
}
.pbc-text p {
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
}

/* Đỏ / Báo động (< 100K) */
.personality-budget-card.budget-danger {
  background: linear-gradient(135deg, #fef2f2, #fff1f2);
  border-color: #fecaca;
  color: #991b1b;
}
.personality-budget-card.budget-danger .pbc-tag {
  background: #fee2e2;
  color: #b91c1c;
}
:root[data-theme="dark"] .personality-budget-card.budget-danger {
  background: rgba(153, 27, 27, 0.2);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

/* Tối giản (100K - 500K) */
.personality-budget-card.budget-minimal {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fde68a;
  color: #92400e;
}
.personality-budget-card.budget-minimal .pbc-tag {
  background: #fef3c7;
  color: #b45309;
}
:root[data-theme="dark"] .personality-budget-card.budget-minimal {
  background: rgba(217, 119, 6, 0.18);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fde68a;
}

/* Tiết kiệm / Phượt (500K - 1.5Tr) */
.personality-budget-card.budget-saving {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #bbf7d0;
  color: #166534;
}
.personality-budget-card.budget-saving .pbc-tag {
  background: #dcfce7;
  color: #15803d;
}
:root[data-theme="dark"] .personality-budget-card.budget-saving {
  background: rgba(22, 101, 52, 0.2);
  border-color: rgba(34, 197, 94, 0.35);
  color: #86efac;
}

/* Rủng rỉnh / Thoải mái (1.5Tr - 5Tr) */
.personality-budget-card.budget-cozy {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-color: #bae6fd;
  color: #075985;
}
.personality-budget-card.budget-cozy .pbc-tag {
  background: #e0f2fe;
  color: #0369a1;
}
:root[data-theme="dark"] .personality-budget-card.budget-cozy {
  background: rgba(3, 105, 161, 0.2);
  border-color: rgba(14, 165, 233, 0.35);
  color: #7dd3fc;
}

/* Đại gia / Sang chảnh (> 5Tr) */
.personality-budget-card.budget-luxury {
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  border-color: #e9d5ff;
  color: #6b21a8;
}
.personality-budget-card.budget-luxury .pbc-tag {
  background: #f3e8ff;
  color: #7e22ce;
}
:root[data-theme="dark"] .personality-budget-card.budget-luxury {
  background: rgba(107, 33, 168, 0.2);
  border-color: rgba(168, 85, 247, 0.35);
  color: #d8b4fe;
}

/* AI GENERATING CARD (MỤC 6) */
.ai-generating-card {
  margin-top: 24px;
  background: linear-gradient(135deg, #1e1b4b, #312e81, #0f172a);
  border-radius: var(--radius-lg);
  padding: 36px 24px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 16px 40px rgba(49, 46, 129, 0.35);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
}
.ai-gen-radar {
  position: relative;
  width: 110px;
  height: 110px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.radar-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(129, 140, 248, 0.6);
  animation: radarWave 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
}
@keyframes radarWave {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}
.radar-center {
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.7);
  z-index: 2;
  animation: floatCenter 2s ease-in-out infinite;
}
@keyframes floatCenter {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.radar-orb {
  position: absolute;
  font-size: 18px;
  animation: orbOrbit 6s linear infinite;
}
.orb-1 { top: 0; left: 45px; animation-delay: 0s; }
.orb-2 { top: 45px; right: 0; animation-delay: -1.5s; }
.orb-3 { bottom: 0; left: 45px; animation-delay: -3s; }
.orb-4 { top: 45px; left: 0; animation-delay: -4.5s; }

@keyframes orbOrbit {
  0% { transform: rotate(0deg) translateX(46px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(46px) rotate(-360deg); }
}

.ai-gen-body {
  max-width: 540px;
  width: 100%;
}
.ai-gen-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.12);
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #c7d2fe;
  margin-bottom: 14px;
}
.pulsing-dot {
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  animation: pulseDot 1.2s infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}
.ai-gen-message {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ai-gen-progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}
.ai-gen-progress-bar {
  height: 100%;
  width: 45%;
  background: linear-gradient(90deg, #38bdf8, #818cf8, #f472b6);
  border-radius: 10px;
  animation: progressScan 1.6s ease-in-out infinite alternate;
}
@keyframes progressScan {
  0% { transform: translateX(-50%); width: 30%; }
  100% { transform: translateX(250%); width: 60%; }
}
.ai-gen-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin: 0;
}
.msg-slide-enter-active, .msg-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.msg-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.msg-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* AI COMPLETION BANNER (MỤC 7) */
.ai-completion-banner {
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #0d9488 100%);
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 28px rgba(5, 150, 105, 0.3);
  position: relative;
  animation: slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-15px); }
  to { opacity: 1; transform: translateY(0); }
}
.acb-left {
  flex-shrink: 0;
}
.acb-icon {
  font-size: 36px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
  animation: robotBounce 2s ease-in-out infinite;
}
.acb-content {
  flex: 1;
}
.acb-badge {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(255,255,255,0.2);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  margin-bottom: 4px;
}
.acb-content h4 {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 4px;
  color: #fff;
}
.acb-content p {
  font-size: 13px;
  margin: 0;
  color: rgba(255,255,255,0.92);
  line-height: 1.4;
}
.acb-close {
  background: rgba(255,255,255,0.18);
  border: 0;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.acb-close:hover {
  background: rgba(255,255,255,0.35);
}

/* BUDGET HUMOR CALLOUT (MỤC 8 TRONG KẾT QUẢ) */
.budget-humor-callout {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 600;
}
.bhc-icon {
  font-size: 20px;
  flex-shrink: 0;
}
:root[data-theme="dark"] .budget-humor-callout {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
  color: #fde68a;
}

/* ==================== ITINERARY VIEW SWITCHER (MAP VIEW TOGGLE) ==================== */
.itinerary-view-switcher {
  display: flex;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 5px;
  gap: 6px;
  margin-top: 14px;
  box-shadow: var(--shadow-sm);
}
.iv-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: 0;
  padding: 10px 14px;
  min-height: 42px; /* Đạt chuẩn touch target >= 42px của UI/UX Pro Max */
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}
.iv-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}
.iv-btn:hover {
  color: var(--primary);
  background: rgba(255, 255, 255, 0.6);
}
.iv-btn.active {
  background: #fff;
  color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
}
:root[data-theme="dark"] .iv-btn.active {
  background: var(--card-bg);
  color: #38bdf8;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.08);
}

/* MAP VIEW EXPANDED MODE */
.app-map-box.map-expanded {
  margin-top: 10px;
}
.app-map-box.map-expanded .app-map-iframe {
  height: 520px;
  transition: height 0.3s ease;
}
.map-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-badge-expanded {
  font-size: 10px;
  font-weight: 800;
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.04em;
}

/* ==================== TRANSIT MICRO-UX BADGE ==================== */
.transit-micro-row {
  display: grid;
  grid-template-columns: 50px 18px 1fr;
  gap: 10px;
  padding: 2px 0 6px 0;
  position: relative;
}
.transit-time-col {
  /* Cột thời gian để trống tạo nhịp thở cho timeline */
}
.transit-line-col {
  display: flex;
  justify-content: center;
  position: relative;
}
.transit-track-line {
  width: 2px;
  height: 100%;
  min-height: 48px;
  background: linear-gradient(to bottom, #0d9488, #cbd5e1);
  border-radius: 2px;
}
:root[data-theme="dark"] .transit-track-line {
  background: linear-gradient(to bottom, #14b8a6, #334155);
}

.transit-body-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 2px;
}
.transit-pill-wrap {
  display: flex;
  align-items: center;
}
.transit-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(240, 253, 250, 0.9);
  border: 1px dashed #99f6e4;
  color: #0f766e;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 11.5px;
  font-weight: 600;
  text-decoration: none;
  backdrop-filter: blur(8px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.08);
}
.transit-badge:hover {
  transform: translateY(-2px) scale(1.02);
  background: #ccfbf1;
  border-color: #14b8a6;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.2);
}
.transit-icon {
  font-size: 15px;
  line-height: 1;
}
.transit-info {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.transit-info b {
  color: #0d9488;
  font-weight: 800;
}
.dot-sep {
  opacity: 0.5;
}
.transit-arrow {
  font-size: 11px;
  font-weight: 800;
  color: #0d9488;
  opacity: 0.7;
  transition: transform 0.2s;
}
.transit-badge:hover .transit-arrow {
  transform: translate(2px, -2px);
  opacity: 1;
}
:root[data-theme="dark"] .transit-badge {
  background: rgba(20, 184, 166, 0.12);
  border-color: rgba(20, 184, 166, 0.3);
  color: #5eead4;
}
:root[data-theme="dark"] .transit-badge:hover {
  background: rgba(20, 184, 166, 0.22);
}
:root[data-theme="dark"] .transit-info b {
  color: #2dd4bf;
}

/* ==================== WARNING COLOR PALETTE (CẢNH BÁO XUNG ĐỘT UX) ==================== */
.transit-warning-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  line-height: 1.4;
  border-left: 4px solid;
  animation: fadeIn 0.3s ease-out;
  max-width: 580px;
}
.twa-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.twa-content {
  flex: 1;
}
.twa-content strong {
  display: block;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 2px;
}
.twa-content p {
  margin: 0;
  font-size: 11px;
}
.twa-action-btn {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid currentColor;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.twa-action-btn:hover {
  background: #fff;
  transform: translateY(-1px);
}

/* Trạng thái Sát giờ (Amber Warning) */
.transit-warning-alert.warning-tight {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #92400e;
  border-left-color: #f59e0b;
}
.transit-warning-alert.warning-tight .twa-action-btn {
  color: #92400e;
}
:root[data-theme="dark"] .transit-warning-alert.warning-tight {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fde68a;
  border-left-color: #f59e0b;
}

/* Trạng thái Quãng đường xa / Ngược tuyến (Red Alert) */
.transit-warning-alert.warning-far {
  background: #fef2f2;
  border-color: #ef4444;
  color: #991b1b;
  border-left-color: #ef4444;
}
.transit-warning-alert.warning-far .twa-action-btn {
  color: #991b1b;
}
:root[data-theme="dark"] .transit-warning-alert.warning-far {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border-left-color: #ef4444;
}

/* VIEW TRANSITION SMOOTHNESS */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.view-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .itinerary-view-switcher {
    flex-direction: column;
  }
  .transit-micro-row {
    grid-template-columns: 42px 14px 1fr;
  }
  .transit-warning-alert {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ==================== ĐIỂM BẮT ĐẦU & LỘ TRÌNH VISUALIZER ==================== */
.route-origin-tag {
  font-size: 12px;
  color: var(--primary);
  background: rgba(14, 165, 233, 0.1);
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
}
.quick-origin-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.q-origin-chip {
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 16px;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-color, #334155);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.q-origin-chip:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(14, 165, 233, 0.08);
}
.q-origin-chip.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.3);
}
.qoc-icon {
  font-size: 12.5px;
}
.qoc-name {
  line-height: 1;
}
:root[data-theme="dark"] .q-origin-chip {
  background: rgba(30, 41, 59, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

/* Banner Lộ trình siêu gọn (Compact Route Banner) */
.route-overview-banner.compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(99, 102, 241, 0.06));
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 12px;
  padding: 8px 14px;
  margin: 6px 0 10px 0;
  gap: 8px;
}
.rob-point {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}
.rob-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.rob-dot.start {
  background: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.25);
}
.rob-dot.end {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}
.rob-label {
  font-size: 11px;
  color: var(--text-muted);
}
.rob-point strong {
  color: var(--text-color);
  font-weight: 700;
}
.rob-mid-compact {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 10px;
}
.rob-dash-line {
  position: absolute;
  width: 100%;
  height: 1.5px;
  background: repeating-linear-gradient(90deg, #0ea5e9, #0ea5e9 4px, transparent 4px, transparent 8px);
  z-index: 1;
}
.rob-dist-pill {
  position: relative;
  z-index: 2;
  background: var(--card-bg, #fff);
  border: 1px solid #0ea5e9;
  color: #0284c7;
  padding: 2px 9px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
:root[data-theme="dark"] .rob-dist-pill {
  background: #0f172a;
  color: #38bdf8;
  border-color: #38bdf8;
}
:root[data-theme="dark"] .rob-badge {
  background: #0f172a;
  color: #38bdf8;
  border-color: #38bdf8;
}
.rob-note {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  font-weight: 500;
}

/* ==================== TỐI ƯU CHI PHÍ XE & GỢI Ý NHÀ XE ==================== */
.bus-optimization-section {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 18px;
  padding: 20px;
  margin-top: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.bos-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.bos-kicker {
  font-size: 11px;
  font-weight: 800;
  color: #0284c7;
  letter-spacing: 0.06em;
  display: block;
  margin-bottom: 4px;
}
.bos-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--text-color);
}
.bos-badges-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.bos-dist-badge {
  font-size: 12px;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 12px;
}
.bos-crawler-badge {
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 4px 10px;
  border-radius: 12px;
}
:root[data-theme="dark"] .bos-dist-badge {
  background: #1e293b;
  color: #94a3b8;
}

/* Grid So Sánh Phương Tiện */
.transit-vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.tv-card {
  background: var(--bg-soft, #f8fafc);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}
.tv-card:hover {
  transform: translateY(-2px);
  border-color: #0ea5e9;
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.12);
}
.tv-card.active {
  border-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.05);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.25);
}
.tv-card.highlight-cheapest {
  border-color: #10b981;
}
:root[data-theme="dark"] .tv-card {
  background: #1e293b;
  border-color: #334155;
}
.tv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.tv-icon {
  font-size: 22px;
}
.tv-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
}
.tv-badge.cheapest {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}
.tv-badge.fastest {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}
.tv-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 4px;
}
.tv-price-row strong {
  font-size: 15px;
  color: #0284c7;
  font-weight: 800;
}
.tv-price-row small {
  color: var(--text-muted);
  font-size: 11px;
}
.tv-total {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 3px;
}
.tv-total b {
  color: #059669;
}
.tv-duration {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 6px;
  font-weight: 600;
}
.tv-advantage {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  line-height: 1.35;
  flex: 1;
}

/* Danh sách Nhà Xe Giá Rẻ */
.bus-operators-box {
  margin-top: 10px;
  border-top: 1px dashed var(--border-color, #e2e8f0);
  padding-top: 16px;
}
.bob-title-row {
  margin-bottom: 14px;
}
.bob-title-row h4 {
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 2px 0;
  color: var(--text-color);
}
.bob-title-row small {
  font-size: 12px;
  color: var(--text-muted);
}
.bus-operators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 14px;
}
.bus-item-card {
  background: var(--bg-soft, #f8fafc);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}
.bus-item-card:hover {
  border-color: #0ea5e9;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}
.bus-item-card.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.04);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}
:root[data-theme="dark"] .bus-item-card {
  background: #1e293b;
  border-color: #334155;
}
:root[data-theme="dark"] .bus-item-card.selected {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}
.bic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.bic-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.bic-name {
  font-size: 15.5px;
  font-weight: 800;
  color: var(--text-color);
}
.bic-tag {
  font-size: 10.5px;
  font-weight: 800;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  padding: 2px 7px;
  border-radius: 6px;
}
.bic-type {
  display: block;
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}
.bic-rating {
  font-size: 12px;
  font-weight: 700;
  color: #f59e0b;
  white-space: nowrap;
}
.bic-rating small {
  color: var(--text-muted);
  font-weight: 400;
}
.bic-specs {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  margin-bottom: 12px;
  background: var(--card-bg, #fff);
  padding: 8px 10px;
  border-radius: 8px;
}
:root[data-theme="dark"] .bic-specs {
  background: #0f172a;
}
.bic-spec {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bic-spec span {
  color: var(--text-muted);
}
.bic-spec b {
  color: var(--text-color);
}
.bic-spec small {
  color: var(--text-muted);
  text-align: right;
  max-width: 65%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* FOOTER CARD TINH GỌN (2 TẦNG CHỐNG TRÀN NÚT) */
.bic-footer-clean {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bic-price-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.bpl-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.bpl-label {
  font-size: 11px;
  color: var(--text-muted);
}
.bpl-unit {
  font-size: 18px;
  font-weight: 900;
  color: #0284c7;
}
.bpl-unit.train-price-color {
  color: #6366f1;
}
.bpl-sub {
  font-size: 11px;
  color: var(--text-muted);
}
.bpl-total-badge {
  font-size: 11.5px;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 600;
}
.bpl-total-badge.train-total-badge {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

/* Hàng nút bấm chia đều 50/50 */
.bic-actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.bic-action-call {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-soft, #f1f5f9);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 9px 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-color, #334155);
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
}
.bic-action-call:hover {
  background: #e2e8f0;
  color: #0f172a;
}
:root[data-theme="dark"] .bic-action-call {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}
.bic-action-select {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0ea5e9;
  border: none;
  border-radius: 10px;
  padding: 9px 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.25);
}
.bic-action-select:hover {
  background: #0284c7;
}
.bic-action-select.active {
  background: #10b981;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

/* ==================== TỔNG HỢP XE KHÁCH TẠI PLAN RESULTS ==================== */
.trip-transit-summary-card {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(16, 185, 129, 0.06));
  border: 1.5px solid rgba(14, 165, 233, 0.3);
  border-radius: 16px;
  padding: 16px 20px;
  margin-top: 14px;
}
:root[data-theme="dark"] .trip-transit-summary-card {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.1));
  border-color: rgba(14, 165, 233, 0.4);
}
.ttsc-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.ttsc-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ttsc-icon {
  font-size: 32px;
  background: #fff;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}
:root[data-theme="dark"] .ttsc-icon {
  background: #1e293b;
}
.ttsc-badge {
  font-size: 10px;
  font-weight: 800;
  color: #0284c7;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}
.ttsc-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-color);
}
.ttsc-meta {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 3px 0 0 0;
}
.ttsc-meta b {
  color: var(--text-color);
}
.ttsc-schedule {
  font-size: 12px;
  color: var(--text-muted);
  margin: 4px 0 0 0;
}
.ttsc-schedule b {
  color: #0284c7;
}
.ttsc-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.ttsc-price-block {
  text-align: right;
}
.ttsc-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}
.ttsc-price {
  font-size: 20px;
  font-weight: 900;
  color: #0284c7;
}
.ttsc-price-block small {
  font-size: 11px;
  color: var(--text-muted);
}
.ttsc-total-calc {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}
.ttsc-total-calc b {
  color: #059669;
}
.ttsc-call-btn {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.ttsc-call-btn:hover {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .bos-header {
    flex-direction: column;
  }
  .transit-vehicles-grid {
    grid-template-columns: 1fr 1fr;
  }
  .bus-operators-grid {
    grid-template-columns: 1fr;
  }
  .ttsc-main {
    flex-direction: column;
    align-items: flex-start;
  }
  .ttsc-right {
    width: 100%;
    justify-content: space-between;
  }
  .ttsc-price-block {
    text-align: left;
  }
  .route-overview-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .rob-mid {
    width: 100%;
    padding: 6px 0;
  }
}

/* ==================== TRANSIT SUBTABS (XE KHÁCH VS TÀU HỎA) ==================== */
.transit-tabs-header {
  display: flex;
  gap: 10px;
  margin: 16px 0 12px 0;
  border-bottom: 2px solid var(--border-color, #e2e8f0);
  padding-bottom: 8px;
}
.transit-subtab-btn {
  background: var(--bg-soft, #f1f5f9);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-color, #334155);
  cursor: pointer;
  transition: all 0.2s ease;
}
.transit-subtab-btn:hover {
  border-color: #0ea5e9;
  color: #0ea5e9;
}
.transit-subtab-btn.active {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff;
  border-color: #0284c7;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
}
:root[data-theme="dark"] .transit-subtab-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

/* Train Card Styles */
.train-card {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03), rgba(14, 165, 233, 0.03));
}
.train-tag {
  background: rgba(99, 102, 241, 0.15) !important;
  color: #6366f1 !important;
}
.train-select-btn {
  background: #6366f1 !important;
}
.train-select-btn:hover {
  background: #4f46e5 !important;
}
.train-select-btn.active {
  background: #10b981 !important;
}

/* ==================== 1. TOOLTIP NÚT GẠT TRƯỚC / SAU SÁP NHẬP ==================== */
.province-mode-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.province-tooltip-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--input-bg, #f1f5f9);
  border: 1px solid var(--border-color, #cbd5e1);
  font-size: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  user-select: none;
}
.province-tooltip-trigger:hover,
.province-tooltip-trigger:focus {
  background: var(--primary, #0d9488);
  border-color: var(--primary, #0d9488);
  color: #fff;
}
.province-tooltip-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  width: 280px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #cbd5e1);
  padding: 12px 14px;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  color: var(--text-main, #1e293b);
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  line-height: 1.45;
}
.province-tooltip-trigger:hover .province-tooltip-popover,
.province-tooltip-trigger:focus .province-tooltip-popover {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}
.province-tooltip-popover strong {
  display: block;
  font-size: 12px;
  color: var(--primary, #0d9488);
  margin-bottom: 6px;
}
.province-tooltip-popover p {
  margin-bottom: 4px;
  color: var(--text-sub, #64748b);
  font-size: 11.5px;
}
.province-tooltip-popover p:last-child {
  margin-bottom: 0;
}
:root[data-theme="dark"] .province-tooltip-popover {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
}

/* ==================== 2. INPUT TƯƠNG PHẢN CAO & QUICK TAG CHIPS ==================== */
.enhanced-input {
  border: 1.5px solid #cbd5e1 !important;
  border-radius: var(--radius-sm, 12px) !important;
  background: var(--input-bg, #f8fafc) !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: var(--text-main, #0f172a) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important;
}
.enhanced-input:focus {
  border-color: var(--primary, #0d9488) !important;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.22) !important;
  background: #ffffff !important;
}
:root[data-theme="dark"] .enhanced-input {
  border-color: #334155 !important;
  background: rgba(15, 23, 42, 0.6) !important;
  color: #f8fafc !important;
}
:root[data-theme="dark"] .enhanced-input:focus {
  border-color: #14b8a6 !important;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.3) !important;
  background: rgba(15, 23, 42, 0.85) !important;
}
.input-hint-small {
  color: var(--text-sub, #64748b);
  font-size: 11px;
  font-weight: 500;
}
.quick-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 8px;
}
.quick-tag-chip {
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 16px;
  padding: 5px 11px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-sub, #64748b);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
  user-select: none;
}
.quick-tag-chip:hover {
  border-color: var(--primary, #0d9488);
  color: var(--primary, #0d9488);
  transform: translateY(-1px);
}
.quick-tag-chip.active {
  background: #f0fdfa;
  border-color: #14b8a6;
  color: #0f766e;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(20, 184, 166, 0.15);
}
:root[data-theme="dark"] .quick-tag-chip {
  background: rgba(30, 41, 59, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}
:root[data-theme="dark"] .quick-tag-chip:hover {
  border-color: #14b8a6;
  color: #5eead4;
}
:root[data-theme="dark"] .quick-tag-chip.active {
  background: rgba(20, 184, 166, 0.15);
  border-color: #14b8a6;
  color: #5eead4;
}

/* ==================== 3. DỰ TOÁN CHI PHÍ THÔNG MINH (DYNAMIC BUDGET BREAKDOWN) ==================== */
.dynamic-budget-card {
  margin-top: 14px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: var(--radius-md, 20px);
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.dbc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.dbc-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dbc-icon {
  font-size: 20px;
}
.dbc-title-group strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text-main, #1e293b);
}
.dbc-title-group small {
  display: block;
  font-size: 11px;
  color: var(--text-sub, #64748b);
  margin-top: 2px;
}
.dbc-total-badge {
  background: #f0fdfa;
  color: #0d9488;
  border: 1px solid #99f6e4;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 14px;
}
.dbc-progress-bar {
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: #e2e8f0;
  margin-bottom: 14px;
  gap: 2px;
}
.dbc-seg {
  height: 100%;
  transition: width 0.3s ease;
}
.seg-hotel   { background: #0d9488; }
.seg-food    { background: #f59e0b; }
.seg-transit { background: #0284c7; }
.seg-reserve { background: #8b5cf6; }

.dbc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 768px) {
  .dbc-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.dbc-item {
  background: var(--input-bg, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.dbc-item-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.dbc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-hotel   { background: #0d9488; }
.dot-food    { background: #f59e0b; }
.dot-transit { background: #0284c7; }
.dot-reserve { background: #8b5cf6; }

.dbc-cat {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub, #64748b);
  white-space: nowrap;
}
.dbc-amount {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main, #1e293b);
  margin-bottom: 2px;
}
.dbc-sub {
  font-size: 10px;
  color: var(--text-sub, #64748b);
  line-height: 1.3;
}
:root[data-theme="dark"] .dynamic-budget-card {
  background: #1e293b;
  border-color: #334155;
}
:root[data-theme="dark"] .dbc-item {
  background: rgba(15, 23, 42, 0.5);
  border-color: #334155;
}

/* ==================== 4. AI TỐI ƯU CUNG ĐƯỜNG & NÚT HÀNH ĐỘNG MỚI ==================== */
.ai-opt-highlight-btn {
  background: linear-gradient(135deg, #0d9488, #0f766e) !important;
  color: #fff !important;
  border: none !important;
  font-weight: 800 !important;
  box-shadow: 0 3px 10px rgba(13, 148, 136, 0.3);
}
.ai-opt-highlight-btn:hover {
  background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
  transform: translateY(-1px);
}
.gmap-all-stops-btn {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
  border-color: #bfdbfe !important;
  font-weight: 700 !important;
  text-decoration: none;
}
.gmap-all-stops-btn:hover {
  background: #dbeafe !important;
}
.zalo-share-btn {
  background: #0068ff1a !important;
  color: #0068ff !important;
  border-color: #0068ff40 !important;
  font-weight: 700 !important;
}
.zalo-share-btn:hover {
  background: #0068ff26 !important;
}
.day-header-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.dhp-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.day-route-opt-btn {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  color: #0d9488;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.day-route-opt-btn:hover {
  background: #0d9488;
  color: #fff;
  border-color: #0d9488;
  transform: translateY(-1px);
}
.route-opt-toast-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease;
}
.rotb-icon {
  font-size: 18px;
}
.rotb-content strong {
  display: block;
  font-size: 12px;
  color: #0f766e;
}
.rotb-content p {
  font-size: 11.5px;
  color: #134e4a;
  margin: 2px 0 0;
  line-height: 1.35;
}

/* ==================== 5. CẢNH BÁO THỜI TIẾT THEO NGÀY (WEATHER-AWARE) ==================== */
.day-weather-alert-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 14px;
}
.dwac-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}
.dwac-icon {
  font-size: 20px;
  line-height: 1;
}
.dwac-text strong {
  display: block;
  font-size: 12px;
  color: #0369a1;
}
.dwac-text p {
  font-size: 11.5px;
  color: #0c4a6e;
  margin: 2px 0 0;
  line-height: 1.35;
}
.dwac-action-btn {
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.dwac-action-btn:hover {
  background: #0369a1;
  transform: translateY(-1px);
}
:root[data-theme="dark"] .day-weather-alert-card {
  background: rgba(2, 132, 199, 0.12);
  border-color: rgba(2, 132, 199, 0.3);
}
:root[data-theme="dark"] .dwac-text strong {
  color: #7dd3fc;
}
:root[data-theme="dark"] .dwac-text p {
  color: #bae6fd;
}

/* ==================== 6. MODAL THẺ INFOGRAPHIC CHIA SẺ ZALO ==================== */
.infographic-share-card {
  max-width: 580px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.m-head-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.m-head-icon {
  font-size: 20px;
}
.infographic-scroll-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #f1f5f9;
  border-radius: 12px;
}
:root[data-theme="dark"] .infographic-scroll-wrap {
  background: #0f172a;
}
.infographic-poster {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}
.ip-header {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #115e59 100%);
  color: #fff;
  padding: 24px 20px;
  text-align: center;
}
.ip-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: 20px;
}
.ip-title {
  font-size: 18px;
  font-weight: 800;
  margin: 10px 0 12px;
  color: #ffffff;
}
.ip-meta-strip {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  font-weight: 700;
  color: #ccfbf1;
}
.ip-highlight-box {
  padding: 14px 18px;
  background: #f8fafc;
  border-bottom: 1px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ip-hl-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ip-hl-icon {
  font-size: 18px;
}
.ip-hl-row strong {
  display: block;
  font-size: 12px;
  color: #1e293b;
}
.ip-hl-row small {
  display: block;
  font-size: 11px;
  color: #64748b;
}
.ip-days-list {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ip-day-block {
  border-left: 3px solid #0d9488;
  padding-left: 12px;
}
.ip-day-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 6px;
}
.ip-activities-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ip-act-item {
  font-size: 11.5px;
  display: flex;
  gap: 8px;
  line-height: 1.4;
  color: #334155;
}
.ip-act-time {
  font-weight: 700;
  color: #0d9488;
  width: 44px;
  flex-shrink: 0;
}
.ip-act-place {
  flex: 1;
}
.ip-footer {
  padding: 12px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  color: #94a3b8;
}
.ip-footer-left small {
  display: block;
  font-weight: 600;
}
.ip-watermark {
  font-weight: 900;
  color: #cbd5e1;
  letter-spacing: 0.1em;
}
.infographic-actions-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.infographic-actions-row button,
.infographic-actions-row a {
  flex: 1;
  text-align: center;
  justify-content: center;
}
.copied-success {
  background: #10b981 !important;
}
/* ==================== 7. INTRO SPLASH ANIMATION ==================== */
.intro-splash-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity 2.5s ease-in-out, visibility 2.5s;
}
.intro-splash-overlay.is-splitting {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

/* Kỹ thuật 2 màn hình để xẻ đôi video */
.video-half {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: transform 2.5s cubic-bezier(0.77, 0, 0.175, 1);
}
.video-left {
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
}
.video-right {
  clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}

.intro-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cinematic-enhance {
  filter: contrast(1.15) saturate(1.2) brightness(1.05);
}
.film-grain {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: overlay;
}

.is-splitting .video-left {
  transform: translateX(-50%);
}
.is-splitting .video-right {
  transform: translateX(50%);
}

.skip-intro-btn {
  position: absolute;
  bottom: 30px;
  right: 40px;
  z-index: 10;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}
.skip-intro-btn:hover {
  background: rgba(255,255,255,0.3);
  color: #fff;
}
.is-splitting .skip-intro-btn {
  opacity: 0;
}

/* ==================== PLANNER TRANSITION & BACKGROUND ==================== */
.planner-transition-overlay {
  position: fixed;
  inset: 0;
  background: url('/images/planner-bg.jpg') center/cover no-repeat;
  z-index: 999999;
}
.planner-flash-enter-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.planner-flash-leave-active {
  transition: opacity 0.8s ease;
}
.planner-flash-enter-from, .planner-flash-leave-to {
  opacity: 0;
}

/* ==================== MESH GRADIENT BACKGROUND ==================== */
.planner-tab-bg {
  position: relative;
  z-index: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24px;
  width: 100%;
  padding: 24px 20px 48px;
  /* Lớp lưới gradient: Xanh bóng đêm, Tím than, Xanh ngọc sẫm, Đỏ hồng hoàng hôn */
  background: linear-gradient(-45deg, #0f172a, #312e81, #0f766e, #9f1239);
  background-size: 400% 400%;
  animation: liquidGradient 15s ease infinite;
}

/* ==================== PLANNER HERO BANNER (VỊ TRÍ KHOANH ĐỎ) ==================== */
.planner-hero-banner {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  flex-shrink: 0;
  animation: fadeInBanner 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.planner-hero-banner:hover {
  transform: translateY(-4px) scale(1.003);
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.12);
}

.planner-hero-banner-img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.planner-hero-banner:hover .planner-hero-banner-img {
  transform: scale(1.03);
}

/* Gradient vignette overlay phía dưới */
.planner-hero-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.75) 0%,
    rgba(15, 23, 42, 0.25) 35%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 1;
}

/* Badge text góc dưới trái */
.planner-hero-badge {
  position: absolute;
  bottom: 20px;
  left: 24px;
  z-index: 2;
  border-left: 3px solid rgba(20, 184, 166, 0.85);
  padding-left: 14px;
  animation: fadeInUp 1s 0.3s ease both;
}

.hero-badge-title {
  display: block;
  font-size: clamp(1.6rem, 3vw, 2.8rem);
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
  margin-bottom: 4px;
}

.hero-badge-sub {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

@media (max-width: 768px) {
  .planner-hero-banner {
    max-height: 220px;
    border-radius: 12px;
  }
  .planner-hero-badge {
    bottom: 14px;
    left: 16px;
  }
}

@keyframes fadeInBanner {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes liquidGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Glassmorphism cho Form thông tin */
.planner-glass-form {
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
  position: relative;
  z-index: 1;
}

/* Tối ưu chữ trong form mờ để không bị chìm */
:root[data-theme="dark"] .planner-glass-form {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

/* ==================== REVEAL ON SCROLL ==================== */
.reveal-element {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
.reveal-element.is-revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ==================== ORIGIN MODE SWITCH ==================== */
.origin-mode-switch {
  transform: scale(0.85);
  transform-origin: center;
  margin-left: 6px;
  flex-shrink: 0;
}

.field-label-between {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* ==================== ORIGIN COMPACT PICKER ==================== */
.origin-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.origin-combo-input {
  width: 100%;
}

.origin-quick-picks {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.origin-quick-picks::-webkit-scrollbar {
  height: 3px;
}

.origin-quick-picks::-webkit-scrollbar-thumb {
  background: rgba(128,128,128,0.3);
  border-radius: 2px;
}

.origin-pick-btn {
  flex-shrink: 0;
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.origin-pick-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

.origin-pick-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

</style>
