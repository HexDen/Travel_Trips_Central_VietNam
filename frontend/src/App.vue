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
          <div class="pft-icon"><AppIcon :name="personalityToast.icon" :size="20" /></div>
          <div class="pft-body">
            <strong>{{ personalityToast.title }}</strong>
            <p>{{ personalityToast.desc }}</p>
          </div>
          <button class="pft-close"><AppIcon name="x" :size="16" /></button>
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

              <div class="city-music-toolbar">
                <button
                  type="button"
                  class="music-master-toggle"
                  :class="{ muted: musicMuted }"
                  @click="toggleMusicMute"
                  :aria-label="musicMuted ? 'Bật nhạc' : 'Tắt nhạc'"
                  :aria-pressed="!musicMuted"
                ><AppIcon :name="musicMuted ? 'volumex' : 'volume2'" :size="16" /></button>
                <label class="music-volume-label" for="city-music-volume"><AppIcon name="volume2" :size="16" /></label>
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
                  <AppIcon name="pin" :size="16" />
                </span>
                <span class="city-name">{{ city.displayName || city.name }}</span>
                <small class="city-tag">{{ city.tag }}</small>
              </div>
            </div>

            <!-- HERO SHOWCASE & THUMBNAILS GALLERY TỈNH THÀNH (THEO VIETRAVEL / TRAVELOKA) -->
            <div class="province-spotlight-card" v-if="currentSpotlight" v-reveal>
              <div class="spotlight-visual-column">
                <!-- Ảnh lớn hero -->
                <div class="spotlight-hero-wrap">
                  <img
                    :src="activeHeroImage"
                    :alt="currentSpotlight.title"
                    class="spotlight-hero-img"
                    loading="lazy"
                  />
                  <div class="spotlight-overlay"></div>
                  <!-- Badge ESG & LEI chuẩn quốc tế bên dưới góc trái ảnh -->
                  <div class="spotlight-badge-esg">
                    <span class="esg-icon"><AppIcon name="leaf" :size="16" /></span>
                    <strong>{{ currentSpotlight.esgText }}</strong>
                  </div>
                  <!-- Badge chứng nhận góc trên bên phải -->
                  <div class="spotlight-badge-cert" v-if="currentSpotlight.badge">
                    <span><AppIcon name="award" :size="16" /> {{ currentSpotlight.badge }}</span>
                  </div>
                  <!-- Nút bấm phóng to ảnh toàn màn hình góc dưới bên phải -->
                  <button
                    type="button"
                    class="spotlight-fullscreen-btn"
                    @click="isSpotlightModalOpen = true"
                    title="Phóng to ảnh toàn màn hình"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                  </button>
                </div>

                <!-- Dãy 5 hình ảnh miêu tả bên dưới để bấm chuyển ảnh -->
                <div class="spotlight-thumbnails-row">
                  <button
                    v-for="(thumb, idx) in currentSpotlight.gallery"
                    :key="idx"
                    type="button"
                    :class="['spotlight-thumb-btn', { active: activeHeroImage === thumb.image }]"
                    @click="selectedSpotlightImage = thumb.image"
                    :title="thumb.name"
                  >
                    <img :src="thumb.image" :alt="thumb.name" loading="lazy" />
                    <span class="thumb-caption">{{ thumb.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Cột thông tin chi tiết về Tỉnh / Thành phố -->
              <div class="spotlight-info-column">
                <div class="spotlight-header-meta">
                  <span class="spotlight-tag-kicker"><AppIcon name="sparkles" :size="14" /> ĐIỂM ĐẾN NỔI BẬT MIỀN TRUNG</span>
                  <span class="spotlight-cert-sub">{{ currentSpotlight.certText }}</span>
                </div>
                <h3 class="spotlight-title">{{ currentSpotlight.title }}</h3>
                <p class="spotlight-subtitle">{{ currentSpotlight.subtitle }}</p>
                <p class="spotlight-description">{{ currentSpotlight.description }}</p>

                <!-- Đặc sản nổi tiếng -->
                <div class="spotlight-highlight-box">
                  <div class="shb-label"><AppIcon name="utensils" :size="16" /> <b>Đặc sản trứ danh:</b></div>
                  <div class="shb-chips">
                    <span v-for="spec in currentSpotlight.specialties" :key="spec" class="spotlight-spec-chip">
                      {{ spec }}
                    </span>
                  </div>
                </div>

                <!-- Mùa du lịch lý tưởng -->
                <div class="spotlight-highlight-box">
                  <div class="shb-label"><AppIcon name="sun" :size="16" /> <b>Thời điểm lý tưởng:</b></div>
                  <p class="shb-text">{{ currentSpotlight.bestSeason }}</p>
                </div>

                <!-- Nút CTA chuyển sang lên lịch trình ngay -->
                <div class="spotlight-actions">
                  <button
                    type="button"
                    class="spotlight-cta-btn"
                    @click="chuyenSangLenLichTrinh(formDuLieu.diemDen)"
                  >
                    <span><AppIcon name="sparkles" :size="16" /> Lên lịch trình đến {{ formDuLieu.diemDen === ALL_DESTINATIONS ? 'Miền Trung' : formDuLieu.diemDen }} ngay</span>
                    <strong>→</strong>
                  </button>
                </div>
              </div>
            </div>

            <!-- MODAL PHÓNG TO ẢNH FULLSCREEN KHI CLICK ICON ZOOM -->
            <div
              v-if="isSpotlightModalOpen"
              class="spotlight-modal-backdrop"
              @click.self="isSpotlightModalOpen = false"
            >
              <div class="spotlight-modal-box">
                <button
                  type="button"
                  class="spotlight-modal-close"
                  @click="isSpotlightModalOpen = false"
                ><AppIcon name="x" :size="20" /></button>
                <img :src="activeHeroImage" :alt="currentSpotlight.title" class="spotlight-modal-img" />
                <div class="spotlight-modal-footer">
                  <h4>{{ currentSpotlight.title }}</h4>
                  <div class="spotlight-modal-thumbs">
                    <button
                      v-for="(thumb, idx) in currentSpotlight.gallery"
                      :key="'modal-' + idx"
                      type="button"
                      :class="['sm-thumb-btn', { active: activeHeroImage === thumb.image }]"
                      @click="selectedSpotlightImage = thumb.image"
                    >
                      <img :src="thumb.image" :alt="thumb.name" />
                    </button>
                  </div>
                </div>
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
                <span class="weather-icon-large"><AppIcon :name="bieuTuongThoiTiet(thoiTiet.current.weatherCode)" :size="28" /></span>
                <strong>{{ Math.round(thoiTiet.current.temperature) }}°C</strong>
              </div>
            </div>
            <p class="weather-summary">
              <b>{{ moTaThoiTiet(thoiTiet.current.weatherCode) }}</b> · Cảm giác như {{ Math.round(thoiTiet.current.feelsLike) }}°C · Gió {{ thoiTiet.current.windSpeed }} km/h
            </p>
            <div class="weather-forecast-strip">
              <div v-for="day in thoiTiet.daily" :key="day.date" class="forecast-item">
                <small>{{ dinhDangNgay(day.date) }}</small>
                <span><AppIcon :name="bieuTuongThoiTiet(day.weatherCode)" :size="16" /></span>
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
                ><AppIcon name="landmark" :size="15" /> Thắng cảnh ({{ attractionsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'restaurant' }]"
                  @click="filterExploreType = 'restaurant'"
                ><AppIcon name="utensils" :size="15" /> Đặc sản ({{ restaurantsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'hotel' }]"
                  @click="filterExploreType = 'hotel'"
                ><AppIcon name="hotel" :size="15" /> Khách sạn ({{ hotelsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'cafe' }]"
                  @click="filterExploreType = 'cafe'"
                ><AppIcon name="coffee" :size="15" /> Cafe ({{ cafesList.length }})</button>
              </div>
            </div>

            <!-- Thanh tìm kiếm nhanh địa danh, món ăn, bãi biển -->
            <div class="explore-search-box">
              <input
                v-model="searchExploreQuery"
                class="explore-search-input"
                :placeholder="'Tìm kiếm địa danh, di tích, món ăn, bãi biển tại ' + (formDuLieu.diemDen === ALL_DESTINATIONS ? 'Miền Trung' : formDuLieu.diemDen) + '...'"
              />
              <button v-if="searchExploreQuery" class="clear-search-btn" @click="searchExploreQuery = ''"><AppIcon name="x" :size="14" /></button>
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
                    <span class="place-img-rating"><AppIcon name="star" :size="13" filled color="#f59e0b" /> {{ place.rating || '4.8' }}</span>
                    <button
                      v-if="nguoiDung"
                      class="heart-action-btn"
                      :class="{ active: isFavorite(place._id) }"
                      @click.stop="doiYeuThich(place._id)"
                      title="Lưu yêu thích"
                    >
                      <AppIcon name="heart" :size="18" :filled="isFavorite(place._id)" :color="isFavorite(place._id) ? '#ef4444' : 'currentColor'" />
                    </button>
                  </div>
                  <div class="place-card-content">
                    <h4>{{ place.name }}</h4>
                    <p class="place-card-desc">{{ place.description }}</p>
                    <p v-if="place.address" class="place-card-address"><AppIcon name="pin" :size="14" /> {{ place.address }}</p>
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
                        <AppIcon name="navigation" :size="14" /> Chỉ đường
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
                  <AppIcon name="chevrondown" :size="14" class="load-more-icon" />
                </button>
                <button
                  v-if="exploreLimit > 5"
                  class="collapse-btn"
                  @click="thuGonDiaDiem"
                >
                  <span>Thu gọn</span>
                  <AppIcon name="chevronup" :size="14" class="load-more-icon" />
                </button>
              </div>
            </div>
            <p v-else class="empty-state-text">Chưa có dữ liệu địa điểm cho khu vực này.</p>
            
            <!-- BẢN ĐỒ TƯƠNG TÁC (MapComponent) -->
            <div v-if="!loadingPlaces && filteredExplorePlaces.length > 0" style="margin-top: 32px;">
              <div class="section-title-row">
                <h3><AppIcon name="map" :size="20" /> Bản đồ các điểm đến</h3>
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
                ><AppIcon :name="musicMuted ? 'volumex' : 'volume2'" :size="16" /></button>
                <span class="planner-icon"><AppIcon name="plane" :size="20" /></span>
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
                    <span class="ai-chip" @click="chonNhanhDiemDen('Đà Nẵng')"><AppIcon name="pin" :size="12" /> Đà Nẵng</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Huế')"><AppIcon name="crown" :size="12" /> Huế</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Nghệ An')"><AppIcon name="leaf" :size="12" /> Nghệ An</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Lâm Đồng')"><AppIcon name="leaf" :size="12" /> Đà Lạt</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Khánh Hòa')"><AppIcon name="compass" :size="12" /> Nha Trang</span>
                    <span class="ai-chip ai-chip-refresh" @click="refreshAiHint()"><AppIcon name="shuffle" :size="12" /> Câu khác</span>
                  </div>
                </div>
                <button class="ai-hint-close" @click="showAiHintBubble = false" title="Dong goi y"><AppIcon name="x" :size="14" /></button>
              </div>
              <!-- CHỌN ĐIỂM BẮT ĐẦU (KHỞI HÀNH) GỌN GÀNG -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <label><AppIcon name="pin" :size="15" /> Điểm bắt đầu (Khởi hành)</label>

                  <span class="route-origin-tag" v-if="formDuLieu.diemKhoiHanh">Xuất phát: <b>{{ formDuLieu.diemKhoiHanh }}</b></span>
                </div>
                <div class="origin-select-wrapper">
                  <input
                    v-model="formDuLieu.diemKhoiHanh"
                    class="app-input origin-combo-input"
                    :list="'origin-list-' + originProvinceMode"
                    placeholder="Tìm hoặc chọn tỉnh/thành xuất phát..."
                    autocomplete="off"
                  />
                  <datalist :id="'origin-list-' + originProvinceMode">
                    <option
                      v-for="city in popularOrigins"
                      :key="city.name"
                      :value="city.name"
                    >{{ city.name }}</option>
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
                  <span class="rob-dist-pill"><AppIcon name="route" :size="14" /> ~{{ transitRouteInfo.estimatedDistanceKm || transitRouteInfo.distanceKm || 350 }} km</span>
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

              <!-- LỊCH TRÌNH KHỞI HÀNH & QUY MÔ CHUYẾN ĐI (KHỐI THỐNG NHẤT GỌN ĐẸP) -->
              <div class="departure-schedule-box full-width">
                <div class="dsb-header">
                  <div class="dsb-title-wrap">
                    <span class="dsb-icon"><AppIcon name="calendar" :size="18" /></span>
                    <div>
                      <h4 class="dsb-title">Lịch trình khởi hành & Quy mô chuyến đi</h4>
                      <small class="dsb-subtitle">Chọn tháng dự kiến, ngày bắt đầu, số ngày đi và số lượng thành viên</small>
                    </div>
                  </div>
                  <span class="dsb-duration-tag">Trọn vẹn {{ formDuLieu.soNgay }} ngày {{ Math.max(0, formDuLieu.soNgay - 1) }} đêm • {{ formDuLieu.soNguoi }} người</span>
                </div>

                <!-- Dãy nút chọn tháng kiểu viên thuốc -->
                <div class="month-pills-row">
                  <button
                    v-for="m in DEPARTURE_MONTHS"
                    :key="m.key"
                    type="button"
                    :class="['month-pill-btn', { active: selectedMonthKey === m.key }]"
                    @click="chonThangKhoiHanh(m)"
                  >
                    <span>Tháng {{ m.key.split('-')[1] }}</span>
                    <strong>{{ m.key.split('-')[0] }}</strong>
                  </button>
                </div>

                <!-- Khối thống nhất 4 thông số: Ngày đi, Số ngày, Số người, Ngày về -->
                <div class="dsb-unified-controls-grid">
                  <div class="dsb-ctrl-field">
                    <label><AppIcon name="planetakeoff" :size="15" /> Ngày bắt đầu:</label>
                    <input
                      type="date"
                      v-model="formDuLieu.ngayBatDau"
                      class="app-input departure-date-input"
                      :min="todayIso"
                    />
                  </div>

                  <div class="dsb-ctrl-field">
                    <label><AppIcon name="clock" :size="15" /> Số ngày đi:</label>
                    <div class="stepper-input dsb-stepper">
                      <button type="button" @click="formDuLieu.soNgay = Math.max(1, formDuLieu.soNgay - 1)">-</button>
                      <span class="dsb-stepper-val">{{ formDuLieu.soNgay }} ngày</span>
                      <button type="button" @click="formDuLieu.soNgay++">+</button>
                    </div>
                  </div>

                  <div class="dsb-ctrl-field">
                    <label><AppIcon name="users" :size="15" /> Số người tham gia:</label>
                    <div class="stepper-input dsb-stepper">
                      <button type="button" @click="formDuLieu.soNguoi = Math.max(1, formDuLieu.soNguoi - 1)">-</button>
                      <span class="dsb-stepper-val">{{ formDuLieu.soNguoi }} người</span>
                      <button type="button" @click="formDuLieu.soNguoi++">+</button>
                    </div>
                  </div>

                  <div class="dsb-ctrl-field">
                    <label><AppIcon name="planelanding" :size="15" /> Ngày về (Tự động):</label>
                    <input
                      type="date"
                      :value="formDuLieu.ngayKetThuc || ngayKetThucDisplay"
                      class="app-input departure-date-input disabled-input"
                      readonly
                    />
                  </div>
                </div>

                <!-- Tóm tắt lịch trình chi tiết -->
                <div class="trip-date-summary-banner" v-if="formDuLieu.ngayBatDau">
                  <span class="tdsb-icon"><AppIcon name="sparkles" :size="16" /></span>
                  <div class="tdsb-text">
                    Lịch trình: <b>{{ dinhDangNgayTuan(formDuLieu.ngayBatDau) }}</b>
                    ➔ <b>{{ dinhDangNgayTuan(formDuLieu.ngayKetThuc || ngayKetThucDisplay) }}</b>
                    <span>({{ formDuLieu.soNgay }} ngày {{ Math.max(0, formDuLieu.soNgay - 1) }} đêm • {{ formDuLieu.soNguoi }} khách tại {{ formDuLieu.diemDen }})</span>
                  </div>
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
                  min="1000000"
                  max="30000000"
                  step="500000"
                  class="budget-slider"
                />

                <!-- Phím tắt chọn nhanh ngân sách (Đã loại bỏ các mức không khả thi 100k - 500k) -->
                <div class="quick-budget-chips">
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 1000000 }"
                    @click="formDuLieu.nganSach = 1000000"
                  >
                    1 Tr <AppIcon name="luggage" :size="13" />
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 2000000 }"
                    @click="formDuLieu.nganSach = 2000000"
                  >
                    2 Tr <AppIcon name="leaf" :size="13" />
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 3500000 }"
                    @click="formDuLieu.nganSach = 3500000"
                  >
                    3.5 Tr <AppIcon name="sparkles" :size="13" />
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 7000000 }"
                    @click="formDuLieu.nganSach = 7000000"
                  >
                    7 Tr <AppIcon name="sun" :size="13" />
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 15000000 }"
                    @click="formDuLieu.nganSach = 15000000"
                  >
                    15 Tr <AppIcon name="gem" :size="13" />
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 30000000 }"
                    @click="formDuLieu.nganSach = 30000000"
                  >
                    30 Tr <AppIcon name="crown" :size="13" />
                  </button>
                </div>

                <!-- CẢNH BÁO CHUYẾN ĐI BẤT KHẢ THI HOẶC CHỌN ĐIỂM FREE -->
                <div v-if="!tripFeasibility.feasible" class="unfeasible-warning-box">
                  <div class="uwb-header">
                    <span class="uwb-icon"><AppIcon name="alert" :size="18" /></span>
                    <div class="uwb-header-text">
                      <strong class="uwb-title">Yêu cầu chưa khả thi về mặt tài chính</strong>
                      <p class="uwb-desc">{{ tripFeasibility.message }}</p>
                    </div>
                  </div>
                  
                  <div class="uwb-actions">
                    <button
                      type="button"
                      class="uwb-btn btn-budget-fix"
                      @click="formDuLieu.nganSach = tripFeasibility.minFeasibleBudget"
                    >
                      <AppIcon name="sparkles" :size="14" /> Tự động nâng ngân sách lên {{ dinhDangTien(tripFeasibility.minFeasibleBudget) }}đ
                    </button>
                    <button
                      v-if="tripFeasibility.maxFeasibleDays < formDuLieu.soNgay"
                      type="button"
                      class="uwb-btn btn-days-fix"
                      @click="formDuLieu.soNgay = tripFeasibility.maxFeasibleDays"
                    >
                      <AppIcon name="clock" :size="14" /> Rút ngắn lịch trình xuống {{ tripFeasibility.maxFeasibleDays }} ngày
                    </button>
                  </div>

                  <!-- Tuỳ chọn: Điểm 100% miễn phí vé -->
                  <div class="uwb-free-choice">
                    <label class="uwb-checkbox-label">
                      <input
                        type="checkbox"
                        v-model="formDuLieu.freePlacesOnly"
                        class="uwb-checkbox"
                      />
                      <span><AppIcon name="compass" :size="14" /> <strong>Chấp nhận phượt tự túc:</strong> Chỉ gợi ý các địa điểm 100% MIỄN PHÍ VÉ (Tự lo ăn ở tiết kiệm)</span>
                    </label>
                  </div>
                </div>

                <!-- BANNER BÁO ĐANG Ở CHẾ ĐỘ 100% FREE VÉ -->
                <div v-else-if="formDuLieu.freePlacesOnly" class="free-mode-banner">
                  <div class="fmb-left">
                    <span class="fmb-icon"><AppIcon name="checkcircle" :size="16" /></span>
                    <div>
                      <strong>Đang bật chế độ: 100% Địa điểm Miễn Phí Vé</strong>
                      <p>AI sẽ chỉ chọn các danh lam thắng cảnh 0đ (bãi biển, phố đi bộ, cầu biểu tượng, chợ đêm, chùa...). Vé tham quan = 0đ.</p>
                    </div>
                  </div>
                  <button type="button" class="fmb-turnoff" @click="formDuLieu.freePlacesOnly = false"><AppIcon name="x" :size="14" /> Tắt</button>
                </div>

                <!-- THẺ NHẬN DIỆN PHÂN TẦNG NGÂN SÁCH THÔNG MINH (TIER INDICATOR) -->
                <div class="tier-indicator-banner" :style="{ borderColor: currentBudgetTier.color }">
                  <div class="tib-left">
                    <span class="tib-icon"><AppIcon :name="currentBudgetTier.icon" :size="18" /></span>
                    <div>
                      <div class="tib-badge-row">
                        <span class="tib-badge" :style="{ backgroundColor: currentBudgetTier.color }">{{ currentBudgetTier.badge }}</span>
                        <strong class="tib-title">{{ currentBudgetTier.name }}</strong>
                      </div>
                      <p class="tib-rate">
                        Định mức: <b>~{{ dinhDangTien(currentBudgetTier.perPersonPerDay) }}đ</b> / người / ngày
                      </p>
                    </div>
                  </div>
                  <div class="tib-tags">
                    <span class="tib-tag" title="Tiêu chuẩn chỗ nghỉ"><AppIcon name="hotel" :size="13" /> {{ currentBudgetTier.hotelDesc }}</span>
                    <span class="tib-tag" title="Tiêu chuẩn ẩm thực"><AppIcon name="utensils" :size="13" /> {{ currentBudgetTier.foodDesc }}</span>
                    <span class="tib-tag" title="Tiêu chuẩn di chuyển"><AppIcon name="bus" :size="13" /> {{ currentBudgetTier.transportDesc }}</span>
                  </div>
                </div>

                <!-- DỰ TOÁN CHI PHÍ THÔNG MINH (DYNAMIC BUDGET BREAKDOWN) -->
                <div class="dynamic-budget-card">
                  <div class="dbc-header">
                    <div class="dbc-title-group">
                      <span class="dbc-icon"><AppIcon name="barchart" :size="16" /></span>
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
                        <span class="dbc-cat"><AppIcon name="hotel" :size="13" /> Khách sạn (~35%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.hotel) }}đ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.hotelDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-food"></span>
                        <span class="dbc-cat"><AppIcon name="utensils" :size="13" /> Ăn uống (~35%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.food) }}đ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.foodDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-transit"></span>
                        <span class="dbc-cat"><AppIcon name="car" :size="13" /> Di chuyển & Vé (~20%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.transportAndTickets) }}đ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.transitDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-reserve"></span>
                        <span class="dbc-cat"><AppIcon name="shield" :size="13" /> Dự phòng (~10%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.reserve) }}đ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.reserveDesc }}</small>
                    </div>
                  </div>
                </div>

                <!-- Lời khuyên tính cách AI theo ngân sách -->
                <div :class="['personality-budget-card', thongDiepNganSach.type]">
                  <div class="pbc-header">
                    <span class="pbc-icon"><AppIcon :name="thongDiepNganSach.icon" :size="16" /></span>
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
                  <option value="xe khách">Xe khách chất lượng cao (Tiết kiệm nhất)</option>
                  <option value="tàu hỏa">Tàu hỏa (Ngắm cảnh)</option>
                  <option value="máy bay">Máy bay + Thuê xe</option>
                  <option value="xe máy">Xe máy / Phượt</option>
                  <option value="ô tô">Ô tô / Xe du lịch</option>
                  <option value="linh hoạt">Linh hoạt</option>
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
                    <span class="bos-kicker"><AppIcon name="bus" :size="16" /> TỐI ƯU CHI PHÍ GIÁ XE & DI CHUYỂN</span>
                    <h3>Gợi ý nhà xe giá rẻ tuyến {{ formDuLieu.diemKhoiHanh }} ➔ {{ formDuLieu.diemDen }}</h3>
                  </div>
                  <div class="bos-badges-group">
                    <span class="bos-dist-badge">Cự ly: ~{{ transitRouteInfo.estimatedDistanceKm || transitRouteInfo.distanceKm || 350 }} km</span>
                    <span class="bos-crawler-badge" title="Tự động cập nhật giá vé từ các nhà xe và đường sắt">
                      <AppIcon name="bot" :size="14" /> Cào dữ liệu vé xe & vé tàu: Sẵn sàng
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
                      <span class="tv-icon"><AppIcon :name="v.icon" :size="20" /></span>
                      <span v-if="v.is_cheapest" class="tv-badge cheapest"><AppIcon name="sparkles" :size="12" /> Rẻ nhất</span>
                      <span v-else-if="v.is_fastest" class="tv-badge fastest"><AppIcon name="sparkles" :size="12" /> Nhanh nhất</span>
                    </div>
                    <div class="tv-title">{{ v.name }}</div>
                    <div class="tv-price-row">
                      <strong>{{ dinhDangTien(v.estimated_cost_per_person) }}đ</strong>
                      <small>/người</small>
                    </div>
                    <div class="tv-total" v-if="formDuLieu.soNguoi > 1">
                      Tổng {{ formDuLieu.soNguoi }} người: <b>{{ dinhDangTien(v.estimated_cost_per_person * formDuLieu.soNguoi) }}đ</b>
                    </div>
                    <div class="tv-duration"><AppIcon name="clock" :size="13" /> {{ v.duration }}</div>
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
                    <AppIcon name="bus" :size="15" /> Vé Xe Khách Giá Rẻ ({{ transitRouteInfo.operators?.length || 0 }})
                  </button>
                  <button
                    type="button"
                    :class="['transit-subtab-btn', { active: transitTab === 'train' }]"
                    @click="transitTab = 'train'"
                  >
                    <AppIcon name="train" :size="15" /> Vé Tàu Hỏa Thống Nhất ({{ transitRouteInfo.trains?.length || 3 }})
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
                          <AppIcon name="star" :size="13" filled color="#f59e0b" /> {{ bus.rating }} <small>({{ bus.reviews }} đánh giá)</small>
                        </div>
                      </div>

                      <div class="bic-specs">
                        <div class="bic-spec">
                          <span><AppIcon name="clock" :size="13" /> Thời gian:</span>
                          <b>{{ bus.duration }}</b>
                        </div>
                        <div class="bic-spec-times">
                          <span class="bst-label"><AppIcon name="clock" :size="13" /> Giờ xuất bến:</span>
                          <div class="bst-chips">
                            <span
                              v-for="timeStr in (bus.depart_times ? bus.depart_times.split(',') : [])"
                              :key="timeStr"
                              class="bst-chip"
                            >
                              {{ timeStr.trim() }}
                            </span>
                          </div>
                        </div>
                        <div class="bic-spec">
                          <span><AppIcon name="pin" :size="13" /> Điểm đón ➔ trả:</span>
                          <small :title="bus.pickup + ' ➔ ' + bus.dropoff">{{ bus.pickup }} ➔ {{ bus.dropoff }}</small>
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
                            <AppIcon name="phone" :size="14" /> {{ bus.hotline }}
                          </a>
                          <button
                            type="button"
                            :class="['bic-action-select', { active: formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id }]"
                            @click="chonNhaXe(bus)"
                          >
                            <AppIcon v-if="formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id" name="check" :size="14" />
                            {{ formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id ? 'Đã chọn xe' : 'Chọn xe này' }}
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
                          <AppIcon name="star" :size="13" filled color="#f59e0b" /> {{ train.rating }} <small>(Tàu Thống Nhất)</small>
                        </div>
                      </div>

                      <div class="bic-specs">
                        <div class="bic-spec">
                          <span><AppIcon name="clock" :size="13" /> Thời gian:</span>
                          <b>{{ train.duration }}</b>
                        </div>
                        <div class="bic-spec-times">
                          <span class="bst-label"><AppIcon name="clock" :size="13" /> Giờ xuất phát:</span>
                          <div class="bst-chips">
                            <span
                              v-for="timeStr in (train.depart_times ? train.depart_times.split(',') : [])"
                              :key="timeStr"
                              class="bst-chip train-time-chip"
                            >
                              {{ timeStr.trim() }}
                            </span>
                          </div>
                        </div>
                        <div class="bic-spec">
                          <span><AppIcon name="train" :size="13" /> Ga đi ➔ Ga đến:</span>
                          <small :title="train.depart_station + ' ➔ ' + train.arrive_station">{{ train.depart_station }} ➔ {{ train.arrive_station }}</small>
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
                            <AppIcon name="ticket" :size="14" /> Đặt tại dsvn.vn ↗
                          </a>
                          <button
                            type="button"
                            :class="['bic-action-select train-select-btn', { active: formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id }]"
                            @click="chonTauHoa(train)"
                          >
                            <AppIcon v-if="formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id" name="check" :size="14" />
                            {{ formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id ? 'Đã chọn tàu' : 'Chọn tàu này' }}
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
                  <AppIcon name="check" size="14" /> Đã chọn {{ selectedPlaces.length }} điểm
                </span>
              </div>

              <!-- THANH TÌM KIẾM ĐỊA ĐIỂM & MÓN ĂN NHANH (TỐI GIẢN GIAO DIỆN) -->
              <div class="place-picker-search-bar">
                <span class="pps-icon"><AppIcon name="search" size="16" /></span>
                <input
                  v-model="searchPlacePickerQuery"
                  type="text"
                  :placeholder="'Tìm kiếm địa điểm, di tích, món ăn, cafe tại ' + (formDuLieu.diemDen === ALL_DESTINATIONS ? 'Miền Trung' : formDuLieu.diemDen) + '...'"
                  class="pps-input"
                />
                <button
                  v-if="searchPlacePickerQuery"
                  type="button"
                  class="pps-clear-btn"
                  @click="searchPlacePickerQuery = ''"
                  title="Xóa tìm kiếm"
                ><AppIcon name="x" size="14" /></button>
              </div>

              <!-- CÁC TAB PHÂN LOẠI DANH MỤC GỌN GÀNG -->
              <div class="place-picker-tabs">
                <button
                  type="button"
                  :class="['ppt-btn', { active: placePickerActiveTab === 'all' }]"
                  @click="placePickerActiveTab = 'all'"
                >
                  Tất cả ({{ totalFilteredPlacesCount }})
                </button>
                <button
                  type="button"
                  :class="['ppt-btn', { active: placePickerActiveTab === 'attraction' }]"
                  @click="placePickerActiveTab = 'attraction'"
                >
                  <AppIcon name="landmark" size="15" /> Thắng cảnh ({{ filteredAttractions.length }})
                </button>
                <button
                  type="button"
                  :class="['ppt-btn', { active: placePickerActiveTab === 'restaurant' }]"
                  @click="placePickerActiveTab = 'restaurant'"
                >
                  <AppIcon name="utensils" size="15" /> Đặc sản ({{ filteredRestaurants.length }})
                </button>
                <button
                  type="button"
                  :class="['ppt-btn', { active: placePickerActiveTab === 'hotel' }]"
                  @click="placePickerActiveTab = 'hotel'"
                >
                  <AppIcon name="hotel" size="15" /> Khách sạn ({{ filteredHotels.length }})
                </button>
                <button
                  type="button"
                  :class="['ppt-btn', { active: placePickerActiveTab === 'cafe' }]"
                  @click="placePickerActiveTab = 'cafe'"
                >
                  <AppIcon name="coffee" size="15" /> Cafe ({{ filteredCafes.length }})
                </button>
                <button
                  v-if="selectedPlaces.length"
                  type="button"
                  :class="['ppt-btn ppt-selected-tab', { active: placePickerActiveTab === 'selected' }]"
                  @click="placePickerActiveTab = 'selected'"
                >
                  <AppIcon name="star" size="15" filled color="#f59e0b" /> Đã chọn ({{ selectedPlaces.length }})
                </button>
              </div>

              <!-- KHAY ĐỊA ĐIỂM ĐÃ CHỌN (TIỆN LỢI & DỄ QUẢN LÝ) -->
              <div v-if="selectedPlaces.length" class="selected-places-tray">
                <div class="spt-header">
                  <span class="spt-title"><AppIcon name="pin" size="15" /> Danh sách bạn đã chọn ({{ selectedPlaces.length }} địa điểm):</span>
                  <button type="button" class="spt-clear-all" @click="clearAllSelectedPlaces">Xóa tất cả</button>
                </div>
                <div class="spt-chips">
                  <span v-for="name in selectedPlaces" :key="name" class="spt-chip">
                    {{ name }}
                    <button type="button" @click="removeSelectedPlace(name)" title="Bỏ chọn"><AppIcon name="x" size="12" /></button>
                  </span>
                </div>
              </div>

              <!-- Thông báo AI Crawler -->
              <div v-if="thongBaoCrawl" class="crawl-alert-banner">
                <span>{{ thongBaoCrawl }}</span>
              </div>

              <!-- Nhóm Thắng cảnh -->
              <div
                v-if="filteredAttractions.length && (placePickerActiveTab === 'all' || placePickerActiveTab === 'attraction')"
                class="picker-row"
              >
                <div class="picker-row-header">
                  <span class="row-label"><AppIcon name="camera" size="16" /> Thắng cảnh & Di tích ({{ filteredAttractions.length }}):</span>
                  <button
                    v-if="!searchPlacePickerQuery && filteredAttractions.length > 8 && placePickerActiveTab === 'all'"
                    type="button"
                    class="picker-expand-toggle-btn"
                    @click="togglePickerExpand('attraction')"
                  >
                    {{ isPickerExpanded.attraction ? '▲ Thu gọn' : `▼ Xem thêm (+${filteredAttractions.length - 8} địa điểm)` }}
                  </button>
                </div>
                <div class="chips-wrap">
                  <button
                    v-for="p in getVisiblePlaces(filteredAttractions, 'attraction')"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status"><AppIcon :name="isPlaceSelected(p.name) ? 'check' : 'plus'" size="12" /></span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Nhóm Món ngon -->
              <div
                v-if="filteredRestaurants.length && (placePickerActiveTab === 'all' || placePickerActiveTab === 'restaurant')"
                class="picker-row"
              >
                <div class="picker-row-header">
                  <span class="row-label"><AppIcon name="utensils" size="16" /> Quán đặc sản & Ẩm thực ({{ filteredRestaurants.length }}):</span>
                  <button
                    v-if="!searchPlacePickerQuery && filteredRestaurants.length > 8 && placePickerActiveTab === 'all'"
                    type="button"
                    class="picker-expand-toggle-btn"
                    @click="togglePickerExpand('restaurant')"
                  >
                    {{ isPickerExpanded.restaurant ? '▲ Thu gọn' : `▼ Xem thêm (+${filteredRestaurants.length - 8} quán)` }}
                  </button>
                </div>
                <div class="chips-wrap">
                  <button
                    v-for="p in getVisiblePlaces(filteredRestaurants, 'restaurant')"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status"><AppIcon :name="isPlaceSelected(p.name) ? 'check' : 'plus'" size="12" /></span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Nhóm Khách sạn -->
              <div
                v-if="filteredHotels.length && (placePickerActiveTab === 'all' || placePickerActiveTab === 'hotel')"
                class="picker-row"
              >
                <div class="picker-row-header">
                  <span class="row-label"><AppIcon name="hotel" size="16" /> Khách sạn & Homestay ({{ filteredHotels.length }}):</span>
                  <button
                    v-if="!searchPlacePickerQuery && filteredHotels.length > 8 && placePickerActiveTab === 'all'"
                    type="button"
                    class="picker-expand-toggle-btn"
                    @click="togglePickerExpand('hotel')"
                  >
                    {{ isPickerExpanded.hotel ? '▲ Thu gọn' : `▼ Xem thêm (+${filteredHotels.length - 8} nơi lưu trú)` }}
                  </button>
                </div>
                <div class="chips-wrap">
                  <button
                    v-for="p in getVisiblePlaces(filteredHotels, 'hotel')"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status"><AppIcon :name="isPlaceSelected(p.name) ? 'check' : 'plus'" size="12" /></span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Nhóm Cafe -->
              <div
                v-if="filteredCafes.length && (placePickerActiveTab === 'all' || placePickerActiveTab === 'cafe')"
                class="picker-row"
              >
                <div class="picker-row-header">
                  <span class="row-label"><AppIcon name="coffee" size="16" /> Quán Cafe & Check-in ({{ filteredCafes.length }}):</span>
                  <button
                    v-if="!searchPlacePickerQuery && filteredCafes.length > 8 && placePickerActiveTab === 'all'"
                    type="button"
                    class="picker-expand-toggle-btn"
                    @click="togglePickerExpand('cafe')"
                  >
                    {{ isPickerExpanded.cafe ? '▲ Thu gọn' : `▼ Xem thêm (+${filteredCafes.length - 8} quán cafe)` }}
                  </button>
                </div>
                <div class="chips-wrap">
                  <button
                    v-for="p in getVisiblePlaces(filteredCafes, 'cafe')"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status"><AppIcon :name="isPlaceSelected(p.name) ? 'check' : 'plus'" size="12" /></span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Khi không tìm thấy kết quả tìm kiếm -->
              <div v-if="searchPlacePickerQuery && totalFilteredPlacesCount === 0" class="empty-search-places">
                <AppIcon name="search" size="28" />
                <p>Không tìm thấy địa điểm nào khớp với từ khóa "<b>{{ searchPlacePickerQuery }}</b>".</p>
                <button type="button" class="app-secondary-btn" @click="searchPlacePickerQuery = ''">Xóa tìm kiếm</button>
              </div>
              
              <!-- Tự nhập điểm đến -->
              <div class="custom-place-input-row" style="margin-top: 16px;">
                <span class="row-label">Thêm địa điểm / quán khác (Tự nhập):</span>
                <div style="display:flex; gap:8px;">
                  <input type="text" v-model="customPlaceText" placeholder="Nhập tên địa điểm bạn muốn đi..." class="enhanced-input" style="flex:1; padding:10px 14px;" @keyup.enter="addCustomPlace" />
                  <button class="app-primary-btn" @click="addCustomPlace" type="button" style="padding: 10px 20px; font-size:13px; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;"><AppIcon name="plus" size="14" /> Thêm</button>
                </div>
              </div>

            </div>

            <!-- ĐÓNG BƯỚC 3 -->
            </div>

            <!-- LỖI KHI TẠO LỊCH TRÌNH -->
            <div v-if="taoPlanError" class="crawl-alert-banner" style="background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; margin-top:16px; font-weight:600; display:flex; align-items:center; gap:8px;">
              <AppIcon name="alert" size="18" /> {{ taoPlanError }}
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

              <div v-if="currentPlannerStep === 3 && !tripFeasibility.feasible && !formDuLieu.freePlacesOnly" class="unfeasible-step3-notice">
                <AppIcon name="alertcircle" size="20" />
                <div>
                  <strong>Yêu cầu không khả thi:</strong>
                  Ngân sách {{ dinhDangTien(formDuLieu.nganSach) }}đ không đủ cho {{ formDuLieu.soNgay }} ngày {{ formDuLieu.soNguoi }} người. Vui lòng quay lại Bước 2 để tăng ngân sách hoặc chọn "Chỉ gợi ý các địa điểm 100% MIỄN PHÍ VÉ".
                </div>
              </div>

              <button
                v-if="currentPlannerStep === 3"
                class="app-primary-btn submit-plan-btn"
                @click="taoLichTrinh"
                :disabled="dangTao || (!tripFeasibility.feasible && !formDuLieu.freePlacesOnly)"
              >
                <span v-if="dangTao" class="btn-spinner"></span>
                <span v-else-if="!tripFeasibility.feasible && !formDuLieu.freePlacesOnly" style="display:inline-flex; align-items:center; gap:6px;">
                  <AppIcon name="alertcircle" size="16" /> Yêu Cầu Không Khả Thi
                </span>
                <span v-else style="display:inline-flex; align-items:center; gap:6px;">
                  <AppIcon name="sparkles" size="16" /> Tạo Lịch Trình
                </span>
              </button>
            </div>
          </div>

          <!-- Personality AI Loading State (Khi AI đang tạo lịch trình) -->
          <div v-if="dangTao" class="ai-generating-card">
            <div class="ai-gen-radar">
              <div class="radar-pulse pulse-1"></div>
              <div class="radar-pulse pulse-2"></div>
              <div class="radar-track"></div>
              <div class="radar-center">
                <img src="/shrek.jpg" class="radar-center-img" alt="Leader" />
              </div>
              <div class="radar-orb-ring">
                <div class="radar-orb orb-1" title="Thành viên 1">
                  <img src="/avatars/friend1.png" class="orb-img" alt="Member 1" />
                </div>
                <div class="radar-orb orb-2" title="Thành viên 2">
                  <img src="/avatars/friend2.jpg" class="orb-img orb-img-cyclo" alt="Member 2" />
                </div>
                <div class="radar-orb orb-3" title="Thành viên 3">
                  <img src="/avatars/friend3.jpg" class="orb-img" alt="Member 3" />
                </div>
                <div class="radar-orb orb-4" title="Thành viên 4">
                  <img src="/avatars/friend4.jpg" class="orb-img orb-img-smirk" alt="Member 4" />
                </div>
              </div>
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
              <div v-if="hienCompletionBanner" class="ai-completion-banner confetti-celebration">
                <div class="acb-left">
                  <div class="acb-icon"><AppIcon name="sparkles" size="28" /></div>
                </div>
                <div class="acb-content">
                  <div class="acb-badge">ĐỘI HÌNH ĐÃ SẴN SÀNG PHÁ ĐẢO THẾ GIỚI ẢO!</div>
                  <h4>{{ activeCompletionQuote.title }}</h4>
                  <p>{{ activeCompletionQuote.desc }}</p>
                  <!-- Đội hình nhảy múa -->
                  <div class="celebrating-squad">
                    <div class="celeb-avatar-wrap celeb-1" title="Trưởng đoàn / Trùm cuối"><img src="/shrek.jpg" class="celeb-avatar" alt="Trùm cuối"></div>
                    <div class="celeb-avatar-wrap celeb-2" title="Thủ quỹ kiêm Đòi nợ"><img src="/avatars/friend1.png" class="celeb-avatar" alt="Thủ quỹ"></div>
                    <div class="celeb-avatar-wrap celeb-3" title="Chúa tể lười biếng / Trùm kêu ca"><img src="/avatars/friend2.jpg" class="celeb-avatar" style="object-position: center 25%;" alt="Chúa tể lười"></div>
                    <div class="celeb-avatar-wrap celeb-4" title="Thánh sống ảo / Chuyên gia check-in"><img src="/avatars/friend3.jpg" class="celeb-avatar" alt="Thánh sống ảo"></div>
                    <div class="celeb-avatar-wrap celeb-5" title="Hoa tiêu / Google Maps chạy bằng cơm"><img src="/avatars/friend4.jpg" class="celeb-avatar" style="object-position: center 20%;" alt="Hoa tiêu"></div>
                  </div>
                </div>
                <button class="acb-close" @click="hienCompletionBanner = false" title="Đóng banner"><AppIcon name="x" size="14" /></button>
              </div>
            </transition>

            <!-- Thẻ tổng quan kết quả -->
            <div class="plan-summary-card" :class="{ 'is-over-budget-card': lichTrinh.is_over_budget }">
              <div class="summary-meta">
                <div class="summary-top-tag">
                  <span class="plan-dest-badge">{{ lichTrinh.destination }}</span>
                  <span v-if="lichTrinh.is_over_budget" class="over-budget-pill-badge">
                    <AppIcon name="alertcircle" size="14" /> VƯỢT QUÁ KHẢ NĂNG TÀI CHÍNH (+{{ lichTrinh.over_percent }}%)
                  </span>
                  <span v-else-if="lichTrinh.budget_tier" class="tier-pill-badge" :style="{ backgroundColor: lichTrinh.budget_tier.color || '#10b981' }">
                    <AppIcon :name="lichTrinh.budget_tier.icon || 'gem'" size="14" /> {{ lichTrinh.budget_tier.badge }}
                  </span>
                  <span class="savings-badge"><AppIcon name="sparkles" size="14" /> Đã tối ưu tuyến đường & chi phí</span>
                </div>
                <h2>Hành trình {{ lichTrinh.daysList.length }} Ngày Tuyệt Vời</h2>
                
                <!-- ĐỘI HÌNH PHÁ ĐẢO (SQUAD AVATARS) -->
                <div class="squad-avatars-group" title="Đội hình phá đảo">
                  <span class="squad-label">Đội hình:</span>
                  <div class="squad-overlap">
                    <div class="squad-avatar-wrap" title="Trưởng đoàn / Trùm cuối">
                      <img src="/shrek.jpg" class="sq-img" alt="Trùm cuối">
                    </div>
                    <div class="squad-avatar-wrap" title="Thủ quỹ kiêm Đòi nợ" v-if="lichTrinh.people >= 2">
                      <img src="/avatars/friend1.png" class="sq-img" alt="Thủ quỹ">
                    </div>
                    <div class="squad-avatar-wrap" title="Chúa tể lười biếng / Trùm kêu ca" v-if="lichTrinh.people >= 3">
                      <img src="/avatars/friend2.jpg" class="sq-img sq-cyclo" alt="Chúa tể lười">
                    </div>
                    <div class="squad-avatar-wrap" title="Thánh sống ảo / Chuyên gia check-in" v-if="lichTrinh.people >= 4">
                      <img src="/avatars/friend3.jpg" class="sq-img" alt="Thánh sống ảo">
                    </div>
                    <div class="squad-avatar-wrap" title="Hoa tiêu / Google Maps chạy bằng cơm" v-if="lichTrinh.people >= 5">
                      <img src="/avatars/friend4.jpg" class="sq-img sq-smirk" alt="Hoa tiêu">
                    </div>
                    <div class="squad-avatar-wrap sq-more" v-if="lichTrinh.people > 5">
                      +{{ lichTrinh.people - 5 }}
                    </div>
                  </div>
                </div>

                <p class="summary-budget" :class="{ 'has-over-budget': lichTrinh.is_over_budget }">
                  <template v-if="lichTrinh.is_over_budget">
                    <span class="sb-target"><AppIcon name="trophy" size="14" /> Ngân sách bạn chọn: <b>{{ dinhDangTien(lichTrinh.target_budget || formDuLieu.nganSach) }}đ</b></span>
                    <span class="sb-divider">·</span>
                    <span class="sb-actual">Chi phí thực tế tính toán: <strong class="red-calc-num">{{ dinhDangTien(lichTrinh.total_budget) }}đ</strong></span>
                    <span class="sb-diff-tag"><AppIcon name="alertcircle" size="14" /> Vượt +{{ dinhDangTien(lichTrinh.over_amount) }}đ</span>
                  </template>
                  <template v-else>
                    Tổng dự toán: <strong>{{ dinhDangTien(lichTrinh.total_budget) }}đ</strong> ({{ lichTrinh.people }} người · TB {{ dinhDangTien(Math.round(lichTrinh.total_budget / lichTrinh.people)) }}đ/người)
                  </template>
                </p>

                <!-- KHỐI BÁO ĐỎ: CẢNH BÁO KẾ HOẠCH VƯỢT QUÁ KHẢ NĂNG TÀI CHÍNH (YÊU CẦU 1) -->
                <div v-if="lichTrinh.is_over_budget" class="over-budget-alert-box">
                  <div class="oba-header">
                    <div class="oba-icon-ring"><AppIcon name="alertcircle" size="24" /></div>
                    <div class="oba-texts">
                      <h4>CẢNH BÁO BÁO ĐỎ: CHI PHÍ VƯỢT QUÁ NGÂN SÁCH {{ dinhDangTien(lichTrinh.target_budget || formDuLieu.nganSach) }}đ!</h4>
                      <p>
                        Chuyến đi {{ lichTrinh.daysList.length }} ngày cho {{ lichTrinh.people }} người với các chi phí cố định (Vé xe khứ hồi: <b>{{ dinhDangTien(lichTrinh.budget_breakdown?.transportation) }}đ</b> + Khách sạn {{ lichTrinh.daysList.length }} đêm: <b>{{ dinhDangTien(lichTrinh.budget_breakdown?.hotel) }}đ</b> + Ăn uống: <b>{{ dinhDangTien(lichTrinh.budget_breakdown?.food) }}đ</b>) cần tối thiểu <b>{{ dinhDangTien(lichTrinh.total_budget) }}đ</b> để đảm bảo chuyến đi an toàn.
                      </p>
                    </div>
                  </div>
                  <div class="oba-actions-bar">
                    <span class="oba-act-title"><AppIcon name="sparkles" size="14" /> Giải pháp xử lý ngay:</span>
                    <button v-if="!formDuLieu.freePlacesOnly" type="button" class="oba-action-btn btn-free" @click="kichHoatCheDoFreePlaces">
                      <AppIcon name="leaf" size="14" /> 1. Bật chế độ 100% Điểm Miễn Phí (Cắt vé về 0đ)
                    </button>
                    <span v-else class="oba-done-tag"><AppIcon name="check" size="14" /> Đã bật Free Places — vé tham quan = 0đ</span>
                    <button v-if="Number(formDuLieu.soNgay) > 1" type="button" class="oba-action-btn btn-shorten" @click="rutNganNgayPhuHop">
                      <AppIcon name="clock" size="14" /> 2. Rút ngắn ngày đi vừa vặn {{ dinhDangTien(formDuLieu.nganSach) }}đ
                    </button>
                    <span v-else class="oba-done-tag"><AppIcon name="check" size="14" /> Đã rút ngắn tối đa (1 ngày)</span>
                    <button type="button" class="oba-action-btn btn-increase-budget" @click="formDuLieu.nganSach = lichTrinh.total_budget; taoLichTrinh()">
                      <AppIcon name="wallet" size="14" /> 3. Nâng ngân sách lên {{ dinhDangTien(lichTrinh.total_budget) }}đ (vừa đủ)
                    </button>
                    <button type="button" class="oba-action-btn btn-replan" @click="hienModalDoiLichTrinh = true">
                      <AppIcon name="refresh" size="14" /> 4. Điều chỉnh thông số khác
                    </button>
                  </div>
                </div>

                <!-- Personality Low Budget Callout in Plan Result -->
                <div v-else-if="lichTrinh.total_budget <= 500000" class="budget-humor-callout">
                  <span class="bhc-icon"><AppIcon :name="lichTrinh.total_budget <= 150000 ? 'alerttriangle' : 'wallet'" size="18" /></span>
                  <span class="bhc-text">
                    {{ lichTrinh.total_budget <= 150000 ? 'Cảnh báo ví nguy hiểm: Nhớ ngắm cảnh miễn phí và hạn chế nhìn menu nhé!' : 'Du lịch tối giản: Chúng ta không nghèo, chúng ta đang du lịch phong cách tối giản (tạm né hải sản 😭)!' }}
                  </span>
                </div>
                <!-- Personality Luxury Budget Callout -->
                <div v-else-if="lichTrinh.total_budget >= 20000000" class="budget-luxury-callout">
                  <span class="bhc-icon"><AppIcon name="crown" size="18" /></span>
                  <span class="bhc-text">
                    Đẳng cấp thượng lưu: Toàn bộ dịch vụ đã được nâng cấp lên chuẩn 5 sao, resort cao cấp và fine dining sang trọng!
                  </span>
                </div>
              </div>

              <!-- NÚT HÀNH ĐỘNG CHÍNH: LƯU LỊCH TRÌNH HOẶC THAY ĐỔI LỊCH TRÌNH (YÊU CẦU 1) -->
              <div class="itinerary-decision-actions-bar">
                <button
                  type="button"
                  class="it-dec-btn it-save-btn"
                  :class="{ 'is-saved': daLuuLichTrinhHienTai }"
                  @click="luuLichTrinhHienTai"
                  title="Lưu lại lịch trình này để xem lại bất cứ lúc nào"
                >
                  <span class="it-dec-icon"><AppIcon :name="daLuuLichTrinhHienTai ? 'checkcircle2' : 'save'" size="22" /></span>
                  <div class="it-dec-text">
                    <strong>{{ daLuuLichTrinhHienTai ? 'Đã lưu lịch trình' : 'Lưu lại lịch trình này' }}</strong>
                    <small>{{ daLuuLichTrinhHienTai ? 'Bấm để xem danh sách chuyến đi đã lưu' : 'Lưu vào tài khoản / bộ nhớ máy' }}</small>
                  </div>
                </button>

                <button
                  type="button"
                  class="it-dec-btn it-replan-btn"
                  @click="hienModalDoiLichTrinh = true"
                  title="Thay đổi thông số hoặc yêu cầu AI tạo lịch trình khác"
                >
                  <span class="it-dec-icon"><AppIcon name="refresh" size="22" /></span>
                  <div class="it-dec-text">
                    <strong>Thay đổi lịch trình khác</strong>
                    <small>Sửa thông số hoặc AI lên phương án mới</small>
                  </div>
                </button>
              </div>

              <!-- Thông báo khi lưu thành công -->
              <transition name="fade">
                <div v-if="thongBaoLuuThanhCong" class="save-success-banner">
                  <span><AppIcon name="sparkles" size="16" /> <strong>Đã lưu lịch trình thành công!</strong> Bạn có thể mở lại tại tab "Chuyến đi đã lưu".</span>
                  <button type="button" class="ssb-view-btn" @click="activeTab = 'mytrips'">Xem ngay ↗</button>
                </div>
              </transition>

              <!-- Thanh phân bổ ngân sách khoa học -->
              <div v-if="lichTrinh.budget_breakdown" class="budget-breakdown-row">
                <div class="bb-pill"><span><AppIcon name="hotel" size="14" /> Khách sạn:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.hotel) }}đ</b></div>
                <div class="bb-pill"><span><AppIcon name="utensils" size="14" /> Ăn uống:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.food) }}đ</b></div>
                <div class="bb-pill"><span><AppIcon name="car" size="14" /> Di chuyển:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.transportation) }}đ</b></div>
                <div class="bb-pill"><span><AppIcon name="ticket" size="14" /> Vé & Check-in:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.tickets) }}đ</b></div>
                <div class="bb-pill"><span><AppIcon name="shield" size="14" /> Dự phòng:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.reserve) }}đ</b></div>
              </div>

              <!-- Thẻ nghiệm thu chi phí thực tế (Budget Audit & Balance) -->
              <div v-if="lichTrinh.budget_audit" class="budget-audit-card" :class="lichTrinh.budget_audit.fit_status">
                <div class="bac-header">
                  <div class="bac-title-group">
                    <span class="bac-icon"><AppIcon :name="lichTrinh.budget_audit.fit_status === 'optimal' ? 'checkcircle2' : (lichTrinh.budget_audit.fit_status === 'under' ? 'sparkles' : 'alerttriangle')" size="20" /></span>
                    <div>
                      <strong class="bac-msg">{{ lichTrinh.budget_audit.fit_message }}</strong>
                      <p class="bac-advice">{{ lichTrinh.budget_audit.advice }}</p>
                    </div>
                  </div>
                  <div class="bac-stats">
                    <span class="bac-stat-label">Tổng chi phí tính toán:</span>
                    <strong class="bac-stat-num">{{ dinhDangTien(lichTrinh.budget_audit.calculated_total) }}đ</strong>
                  </div>
                </div>

                <div class="bac-details-row">
                  <div class="bad-item">
                    <span class="bad-label"><AppIcon name="bus" size="14" /> Vé xe / Đi lại:</span>
                    <b>{{ dinhDangTien(lichTrinh.budget_audit.audit_breakdown?.transit || lichTrinh.budget_breakdown?.transportation || 0) }}đ</b>
                  </div>
                  <div class="bad-item">
                    <span class="bad-label"><AppIcon name="hotel" size="14" /> Phòng nghỉ / Resort:</span>
                    <b>{{ dinhDangTien(lichTrinh.budget_audit.audit_breakdown?.hotel || lichTrinh.budget_breakdown?.hotel || 0) }}đ</b>
                  </div>
                  <div class="bad-item">
                    <span class="bad-label"><AppIcon name="utensils" size="14" /> Toàn bộ ăn uống:</span>
                    <b>{{ dinhDangTien(lichTrinh.budget_audit.audit_breakdown?.food || lichTrinh.budget_breakdown?.food || 0) }}đ</b>
                  </div>
                  <div class="bad-item">
                    <span class="bad-label"><AppIcon name="ticket" size="14" /> Vé vui chơi check-in:</span>
                    <b>{{ dinhDangTien(lichTrinh.budget_audit.audit_breakdown?.tickets || lichTrinh.budget_breakdown?.tickets || 0) }}đ</b>
                  </div>
                </div>
              </div>

              <div class="plan-tool-actions">
                <button class="tool-btn ai-opt-highlight-btn" @click="toiUuCungDuongToanBo" title="Sắp xếp toàn bộ điểm đến theo vòng cung tối ưu di chuyển">
                  <AppIcon name="sparkles" size="15" /> AI Tối ưu thứ tự điểm đến
                </button>
                <a
                  :href="googleMapsAllStopsUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="tool-btn gmap-all-stops-btn"
                  title="Mở toàn bộ lộ trình trên Google Maps có sẵn GPS dẫn đường liên tục"
                >
                  <AppIcon name="map" size="15" /> Mở toàn bộ trên Google Maps ↗
                </a>
                <button class="tool-btn zalo-share-btn" @click="moModalInfographic" title="Xuất lịch trình dạng thẻ Infographic để gửi nhóm Zalo/Messenger">
                  <AppIcon name="phone" size="15" /> Xuất thẻ chia sẻ Zalo
                </button>
                <button class="tool-btn" @click="hienBillSplitter = true" title="Tính tiền chia đều cho nhóm">
                  <AppIcon name="wallet" size="15" /> Chia tiền nhóm
                </button>
                <button class="tool-btn" @click="hienTravelPass = true" title="Xuất vé hành trình offline">
                  <AppIcon name="ticket" size="15" /> Xuất vé Offline
                </button>
                <button class="tool-btn rain-btn" @click="moModalTranhMua(0)" :disabled="dangDieuChinh" title="Tự động đổi điểm tham quan trong nhà nếu trời mưa">
                  <AppIcon name="cloudrain" size="15" /> Đổi lịch tránh mưa
                </button>
                <button class="tool-btn" @click="xuatPdf" title="In hoặc lưu PDF">
                  <AppIcon name="filetext" size="15" /> Lưu PDF
                </button>
              </div>
            </div>

            <!-- TÓM TẮT PHƯƠNG ÁN XE KHÁCH TỐI ƯU CHI PHÍ -->
            <div v-if="(lichTrinh.transit_summary || formDuLieu.nhaXeDaChon) && !['xe máy', 'ô tô'].includes((formDuLieu.phuongTien || '').toLowerCase())" class="trip-transit-summary-card">
              <div class="ttsc-main">
                <div class="ttsc-left">
                  <span class="ttsc-icon"><AppIcon name="bus" size="24" /></span>
                  <div>
                    <div class="ttsc-badge">PHƯƠNG ÁN XE KHÁCH TỐI ƯU DI CHUYỂN</div>
                    <h3>{{ formDuLieu.nhaXeDaChon ? formDuLieu.nhaXeDaChon.name : (lichTrinh.transit_summary?.selected_bus?.name || 'Nhà xe khuyên dùng') }}</h3>
                    <p class="ttsc-meta">
                      <span>Loại xe: <b>{{ formDuLieu.nhaXeDaChon ? formDuLieu.nhaXeDaChon.type : 'Giường nằm cao cấp' }}</b></span> ·
                      <span>Tuyến: <b>{{ formDuLieu.diemKhoiHanh }} ➔ {{ lichTrinh.destination || formDuLieu.diemDen }}</b></span> ·
                      <span>Cự ly: <b>~{{ (lichTrinh.transit_summary?.estimated_distance_km || transitRouteInfo.estimatedDistanceKm) }} km</b></span>
                    </p>
                    <p class="ttsc-schedule" v-if="formDuLieu.nhaXeDaChon">
                      <AppIcon name="clock" size="14" /> Giờ chạy: <b>{{ formDuLieu.nhaXeDaChon.depart_times }}</b> ({{ formDuLieu.nhaXeDaChon.duration }}) · Đón: {{ formDuLieu.nhaXeDaChon.pickup }}
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
                      <AppIcon name="ticket" size="16" /> Đặt vé Web/App
                    </a>
                    <a :href="`tel:${formDuLieu.nhaXeDaChon?.hotline || '19006067'}`" class="ttsc-call-btn" style="background: rgba(5, 150, 105, 0.1); color: var(--primary); padding: 10px 16px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--primary);">
                      <AppIcon name="phone" size="16" /> Tổng đài: {{ formDuLieu.nhaXeDaChon?.hotline || '1900 6067' }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Khách sạn đề xuất -->
            <div v-if="lichTrinh.hotel_recommendation" class="app-hotel-card">
              <div class="hotel-badge"><AppIcon name="hotel" size="14" /> GỢI Ý KHÁCH SẠN / RESORT NGHỈ DƯỠNG</div>
              <div class="hotel-main-info">
                <div>
                  <h3>{{ lichTrinh.hotel_recommendation.name }}</h3>
                  <p class="hotel-addr" v-if="lichTrinh.hotel_recommendation.address"><AppIcon name="pin" size="14" /> {{ lichTrinh.hotel_recommendation.address }}</p>
                  <p class="hotel-desc">{{ lichTrinh.hotel_recommendation.description }}</p>
                </div>
                <div class="hotel-side">
                  <span class="hotel-stars"><AppIcon name="star" size="14" filled color="#f59e0b" /> {{ lichTrinh.hotel_recommendation.rating || '4.8' }}</span>
                  <span class="hotel-price">
                    {{ dinhDangTien(lichTrinh.hotel_recommendation.price_per_night || 850000) }}đ
                    <small>{{ (lichTrinh.hotel_recommendation.price_per_night || 850000) <= 300000 ? '/đêm/người' : '/đêm/phòng' }}</small>
                  </span>
                  <div class="hotel-nights-calc-badge" v-if="lichTrinh.daysList && lichTrinh.daysList.length">
                    Tổng {{ lichTrinh.daysList.length }} đêm ({{ lichTrinh.people }} người): <b>{{ dinhDangTien(tinhChiPhiKhachSan(lichTrinh)) }}đ</b>
                  </div>
                  <a
                    class="hotel-maps-link"
                    :href="chiDuongUrl(lichTrinh.hotel_recommendation.name, lichTrinh.hotel_recommendation.address)"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <AppIcon name="map" size="14" /> Chỉ đường tới KS ↗
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
                <div v-show="itineraryViewMode !== 'map'" class="app-timeline-wrap" style="position: relative;">
                  <!-- XÍCH LÔ DẪN ĐƯỜNG SCROLL (Ý TƯỞNG 4) -->
                  <div class="cyclo-scroll-indicator" title="Chiếc xích lô dẫn đường">
                    <img src="/avatars/friend2.jpg" class="sq-cyclo" alt="Cyclo">
                  </div>
                  <!-- THANH ĐIỀU KHIỂN TINH GỌN LỊCH TRÌNH (TỐI ƯU YÊU CẦU 2: KHÔNG DÀI DÒNG) -->
                  <div class="timeline-compact-filter-toolbar">
                    <!-- Hàng 1: Tabs chọn ngày linh hoạt -->
                    <div class="tc-day-tabs-scroll">
                      <button
                        v-for="d in lichTrinh.daysList"
                        :key="'tab-d-' + d.day"
                        type="button"
                        :class="['tc-day-tab', { active: selectedDay === d.day && !showAllDays }]"
                        @click="selectedDay = d.day; showAllDays = false"
                        :title="`Xem chi tiết Ngày ${d.day}`"
                      >
                        <AppIcon name="calendar" size="14" /> Ngày {{ d.day }}
                      </button>
                      <button
                        type="button"
                        :class="['tc-day-tab tc-all-tab', { active: showAllDays }]"
                        @click="showAllDays = true"
                        :title="`Xem toàn bộ ${lichTrinh.daysList.length} ngày liên tục`"
                      >
                        <AppIcon name="filetext" size="14" /> Xem tất cả ({{ lichTrinh.daysList.length }} ngày)
                      </button>
                    </div>

                    <!-- Hàng 2: Chuyển đổi Thu gọn / Chi tiết & Lọc theo Buổi -->
                    <div class="tc-controls-row">
                      <div class="tc-density-toggle">
                        <button
                          type="button"
                          :class="['tc-density-btn', { active: timelineDensity === 'compact' }]"
                          @click="timelineDensity = 'compact'"
                          title="Chế độ Thu gọn: hiển thị dạng hàng ngang thanh lịch, không phải cuộn chuột dài"
                        >
                          <span class="tcd-icon"><AppIcon name="smartphone" size="14" /></span>
                          <span>Thu gọn</span>
                        </button>
                        <button
                          type="button"
                          :class="['tc-density-btn', { active: timelineDensity === 'expanded' }]"
                          @click="timelineDensity = 'expanded'"
                          title="Chế độ Chi tiết: hiển thị dạng thẻ lớn đầy đủ ảnh"
                        >
                          <span class="tcd-icon"><AppIcon name="bookopen" size="14" /></span>
                          <span>Chi tiết</span>
                        </button>
                      </div>

                      <div class="tc-session-filters">
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'all' }]"
                          @click="selectedSessionFilter = 'all'"
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'morning' }]"
                          @click="selectedSessionFilter = 'morning'"
                        >
                          <AppIcon name="sunrise" size="14" /> Sáng
                        </button>
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'noon' }]"
                          @click="selectedSessionFilter = 'noon'"
                        >
                          <AppIcon name="sun" size="14" /> Trưa
                        </button>
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'afternoon' }]"
                          @click="selectedSessionFilter = 'afternoon'"
                        >
                          <AppIcon name="sunset" size="14" /> Chiều
                        </button>
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'evening' }]"
                          @click="selectedSessionFilter = 'evening'"
                        >
                          <AppIcon name="moon" size="14" /> Tối
                        </button>
                      </div>
                    </div>
                  </div>

                  <article
                    v-for="(day, dayIdx) in (showAllDays ? lichTrinh.daysList : lichTrinh.daysList.filter(d => d.day === selectedDay))"
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
                          <AppIcon name="map" size="14" /> Lộ trình cả ngày ↗
                        </a>

                        <button
                          type="button"
                          class="day-route-opt-btn"
                          @click.stop="toiUuCungDuongNgay(dayIdx)"
                          title="AI sắp xếp lại thứ tự điểm đến theo vòng cung để không bị đi ngược đường và tiết kiệm xăng xe"
                        >
                          <AppIcon name="sparkles" size="14" /> AI Tối ưu thứ tự
                        </button>
                      </div>
                    </div>

                    <!-- Thông báo kết quả tối ưu thứ tự cung đường -->
                    <div v-if="toiUuThanhCongDay === dayIdx" class="route-opt-toast-banner">
                      <span class="rotb-icon"><AppIcon name="sparkles" size="18" /></span>
                      <div class="rotb-content">
                        <strong>Đã tối ưu cung đường Ngày {{ day.day }}!</strong>
                        <p>Các điểm được sắp xếp theo vòng cung liên tục (Nearest Neighbor), giảm thiểu tối đa đi zíc-zắc và quay đầu xe.</p>
                      </div>
                    </div>

                    <!-- Cảnh báo thời tiết trực tiếp trong ngày (Weather-aware Planning) -->
                    <div v-if="getDayWeatherAlert(day.day)" class="day-weather-alert-card">
                      <div class="dwac-left">
                        <span class="dwac-icon"><AppIcon name="cloudrain" size="20" /></span>
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
                        <AppIcon name="refresh" size="14" /> Tự động đổi điểm trong nhà
                      </button>
                    </div>

                    <div class="activities-stream">
                      <!-- CHẶNG KHỞI HÀNH LIÊN TỈNH: THỜI GIAN VÀ CỰ LY TỪ NƠI XUẤT PHÁT ĐẾN ĐIỂM ĐẾN (YÊU CẦU 3) -->
                      <div v-if="day.day === 1 && !day.activities.some(a => a.type === 'transit')" class="origin-departure-journey-card">
                        <div class="odjc-time-col">
                          <span class="odjc-time">{{ formDuLieu.nhaXeDaChon?.depart_times ? formDuLieu.nhaXeDaChon.depart_times.split(',')[0].trim() : '06:30' }}</span>
                          <div class="odjc-bullet"><AppIcon name="bus" size="16" /></div>
                        </div>
                        <div class="odjc-card-content">
                          <div class="odjc-header">
                            <span class="odjc-badge">CHẶNG KHỞI HÀNH TỪ NƠI XUẤT PHÁT</span>
                            <span class="odjc-duration-pill"><AppIcon name="clock" size="13" /> Di chuyển: <b>{{ formDuLieu.nhaXeDaChon?.duration || '13 – 14 giờ' }}</b></span>
                          </div>
                          <h4 class="odjc-title">{{ formDuLieu.diemKhoiHanh }} ➔ {{ lichTrinh.destination }}</h4>
                          <div class="odjc-meta-grid">
                            <div class="odjc-meta-item">
                              <span class="omi-label">Phương tiện:</span>
                              <strong>{{ formDuLieu.nhaXeDaChon ? (formDuLieu.nhaXeDaChon.name + ' - ' + formDuLieu.nhaXeDaChon.type) : (lichTrinh.transit_summary?.selected_bus?.name || 'Xe khách giường nằm VIP') }}</strong>
                            </div>
                            <div class="odjc-meta-item">
                              <span class="omi-label">Cự ly di chuyển:</span>
                              <strong>~{{ (lichTrinh.transit_summary?.estimated_distance_km || transitRouteInfo.estimatedDistanceKm || 669) }} km</strong>
                            </div>
                            <div class="odjc-meta-item">
                              <span class="omi-label">Điểm đón khách:</span>
                              <strong>{{ formDuLieu.nhaXeDaChon?.pickup || ('VP bến xe tại ' + formDuLieu.diemKhoiHanh) }}</strong>
                            </div>
                            <div class="odjc-meta-item">
                              <span class="omi-label">Điểm đến / Check-in:</span>
                              <strong>{{ lichTrinh.hotel_recommendation?.name || 'Khách sạn / Homestay lưu trú' }}</strong>
                            </div>
                          </div>
                          <p class="odjc-note">
                            <AppIcon name="plane" size="14" /> Chuyến đi khởi hành đúng giờ. Đoàn đến {{ lichTrinh.destination }}, cập bến và di chuyển về nhận phòng / gửi hành lý trước khi bắt đầu lịch trình tham quan.
                          </p>
                        </div>
                      </div>

                      <template
                        v-for="(act, actIndex) in filterActivitiesBySession(day.activities)"
                        :key="act.time + act.place + actIndex"
                      >
                        <!-- DẠNG THU GỌN (COMPACT ACT ROW - TỐI ƯU YÊU CẦU 2 KHÔNG DÀI DÒNG) -->
                        <div
                          v-if="timelineDensity === 'compact'"
                          :id="'activity-card-' + dayIdx + '-' + actIndex"
                          class="compact-act-row"
                          :class="{
                            'is-expanded': expandedCardKey === `act-${day.day}-${actIndex}`,
                            'is-hovered': hoveredActIndex === actIndex && selectedDay === day.day
                          }"
                          @mouseenter="hoverActivity(act, actIndex, day.day)"
                          @mouseleave="unhoverActivity(act, actIndex)"
                          @click="toggleExpandCard(`act-${day.day}-${actIndex}`)"
                        >
                          <div class="car-time-col">
                            <span class="car-time">{{ act.time }}</span>
                            <span class="car-dot" :class="getBadgeInfo(act).class"></span>
                          </div>

                          <div class="car-thumb" @click.stop="panToActivity(act)">
                            <img :src="getPlaceImage(act)" :alt="act.place" loading="lazy" @error="onImageError" />
                            <span class="car-idx">#{{ actIndex + 1 }}</span>
                          </div>

                          <div class="car-body">
                            <div class="car-top">
                              <span :class="['badge-type-mini', getBadgeInfo(act).class]">
                                <AppIcon :name="getBadgeInfo(act).icon" size="13" /> {{ getBadgeInfo(act).label }}
                              </span>
                              <h4 class="car-title" @click.stop="panToActivity(act)">{{ act.place }}</h4>
                              <span class="car-cost" v-if="act.estimated_cost"><AppIcon name="wallet" size="12" /> {{ dinhDangTien(act.estimated_cost) }}đ</span>
                            </div>
                            <div class="car-sub">
                              <span class="car-addr" v-if="act.address"><AppIcon name="pin" size="12" /> {{ act.address }}</span>
                              <span class="car-eta" v-if="getTravelEstimate(act, day, actIndex)">
                                <AppIcon name="clock" size="12" /> {{ getTravelEstimate(act, day, actIndex).duration }} ({{ getTravelEstimate(act, day, actIndex).distance }} km)
                              </span>
                            </div>

                            <!-- Bung chi tiết nhỏ khi click -->
                            <div v-if="expandedCardKey === `act-${day.day}-${actIndex}`" class="car-detail-drawer" @click.stop>
                              <p class="cdd-desc">{{ lamSachMoTa(act.activity, act) }}</p>
                              <div v-if="act.signature_dishes && act.signature_dishes.length" class="cdd-dishes">
                                <AppIcon name="utensils" size="14" /> <b>Món đặc sản:</b> {{ act.signature_dishes.join(', ') }}
                              </div>
                              <div class="cdd-meta-tags">
                                <span class="cdd-tag"><AppIcon name="star" size="12" filled color="#f59e0b" /> {{ act.rating || '4.7' }}</span>
                                <span class="cdd-tag"><AppIcon name="clock" size="12" /> {{ act.open_hours || getGioMoCua(act.type) }}</span>
                                <span class="cdd-tag" v-if="act.is_indoor === true"><AppIcon name="cloudrain" size="12" /> Có mái che</span>
                                <span class="cdd-tag" v-else-if="act.is_indoor === false"><AppIcon name="sun" size="12" /> Ngoài trời</span>
                              </div>
                            </div>
                          </div>

                          <div class="car-actions">
                            <button type="button" class="car-btn" @click.stop="moModalDoiDiaDiem(day.day - 1, actIndex, act.type)" title="Đổi điểm"><AppIcon name="refresh" size="14" /></button>
                            <a class="car-btn" :href="chiDuongUrl(act.place, act.address)" target="_blank" rel="noreferrer" title="Google Maps" @click.stop><AppIcon name="map" size="14" /></a>
                            <span class="car-chevron"><AppIcon :name="expandedCardKey === `act-${day.day}-${actIndex}` ? 'chevronup' : 'chevrondown'" size="14" /></span>
                          </div>
                        </div>

                        <!-- DẠNG CHI TIẾT ĐẦY ĐỦ (EXPANDED ACTIVITY ROW) -->
                        <div
                          v-else
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
                                    <AppIcon :name="getBadgeInfo(act).icon" size="14" /> {{ getBadgeInfo(act).label }}
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
                                    <AppIcon name="refresh" size="14" /> Đổi điểm
                                  </button>
                                  <a
                                    class="act-direction-btn"
                                    :href="chiDuongUrl(act.place, act.address)"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Mở chỉ đường Google Maps"
                                    @click.stop
                                  >
                                    <AppIcon name="map" size="14" /> Chỉ đường ↗
                                  </a>
                                </div>
                              </div>

                              <!-- Cảnh báo xung đột thời gian mở cửa -->
                              <div v-if="act.time_conflict" class="act-time-conflict-card" style="background-color: #fffbeb; color: #b45309; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; display: flex; gap: 8px; align-items: center; margin-bottom: 12px; border: 1px solid #fde68a;">
                                <AppIcon name="alerttriangle" size="16" /> {{ act.time_conflict_msg }}
                              </div>

                              <!-- Thẻ ETA dự kiến thời gian di chuyển từ vị trí hiện tại tới điểm đến -->
                              <div v-if="getTravelEstimate(act, day, actIndex)" class="act-travel-eta-card">
                                <div class="eta-card-left">
                                  <span class="eta-pulse-icon"><AppIcon name="car" size="18" /></span>
                                  <div class="eta-content">
                                    <div class="eta-from-to">
                                      <span class="eta-origin">Từ <strong>{{ getTravelEstimate(act, day, actIndex).from }}</strong></span>
                                      <span class="eta-arrow">➔</span>
                                      <span class="eta-dest">tới điểm đến:</span>
                                    </div>
                                    <div class="eta-metrics-row">
                                      <span class="eta-pill eta-time"><AppIcon name="clock" size="12" /> Đi khoảng <b>{{ getTravelEstimate(act, day, actIndex).duration }}</b></span>
                                      <span class="eta-pill eta-dist"><AppIcon name="pin" size="12" /> ~{{ getTravelEstimate(act, day, actIndex).distance }} km</span>
                                      <span class="eta-pill eta-mode" v-if="getTravelEstimate(act, day, actIndex).mode"><AppIcon name="compass" size="12" /> {{ getTravelEstimate(act, day, actIndex).mode }}</span>
                                      <span class="eta-pill eta-taxi" v-if="getTravelEstimate(act, day, actIndex).cost"><AppIcon name="car" size="12" /> Taxi: <b>{{ getTravelEstimate(act, day, actIndex).cost }}</b></span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- Thẻ tag / Badges thông tin thực tế -->
                              <div class="act-meta-badges">
                                <span class="meta-tag-pill tag-rating">
                                  <AppIcon name="star" size="12" filled color="#f59e0b" /> {{ act.rating || '4.7' }} <small>({{ act.review_count || '1.2k' }})</small>
                                </span>
                                <span class="meta-tag-pill tag-hours">
                                  <AppIcon name="clock" size="12" /> {{ act.open_hours || getGioMoCua(act.type) }}
                                </span>
                                <span class="meta-tag-pill tag-dwell" v-if="act.dwell_time">
                                  <AppIcon name="clock" size="12" /> Lưu lại: {{ act.dwell_time }}
                                </span>
                                <span class="meta-tag-pill tag-best-time" v-if="act.best_time">
                                  <AppIcon name="sunrise" size="12" /> Khung giờ: {{ act.best_time }}
                                </span>
                                <span class="meta-tag-pill tag-indoor" v-if="act.is_indoor === true">
                                  <AppIcon name="cloudrain" size="12" /> Có mái che (Trong nhà)
                                </span>
                                <span class="meta-tag-pill tag-outdoor" v-else-if="act.is_indoor === false">
                                  <AppIcon name="sun" size="12" /> Ngoài trời
                                </span>
                                <span class="meta-tag-pill tag-dress" v-if="act.dress_code">
                                  <AppIcon name="sparkles" size="12" /> {{ act.dress_code }}
                                </span>
                                <span v-for="tag in (act.tags || []).slice(0, 1)" :key="tag" class="meta-tag-pill tag-theme">
                                  <AppIcon name="tag" size="12" /> {{ tag }}
                                </span>
                              </div>

                              <p v-if="act.address" class="act-address"><AppIcon name="pin" size="14" /> {{ act.address }}</p>

                              <!-- Dòng thời gian di chuyển từ nơi xuất phát đến điểm đến (Yêu cầu 3 - Screenshot 3) -->
                              <div v-if="getTravelEstimate(act, day, actIndex)" class="act-quick-travel-bar">
                                <span class="aqtb-time"><AppIcon name="clock" size="12" /> {{ getTravelEstimate(act, day, actIndex).duration }}</span>
                                <span class="aqtb-sep">·</span>
                                <span class="aqtb-desc">Từ <strong>{{ getTravelEstimate(act, day, actIndex).from }}</strong> (~{{ getTravelEstimate(act, day, actIndex).distance }} km · {{ getTravelEstimate(act, day, actIndex).mode }})</span>
                              </div>
                              
                              <!-- Mô tả giá trị thực tế không rập khuôn -->
                              <p class="act-desc">{{ lamSachMoTa(act.activity, act) }}</p>

                              <!-- BONG BÓNG BÌNH LUẬN VUI NHỘN (SQUAD SPEECH BUBBLE) -->
                              <div v-if="day.day === 1 && actIndex === 0" class="squad-speech-bubble">
                                <img src="/shrek.jpg" class="sq-chat-avatar" alt="Trùm cuối">
                                <div class="sq-chat-text">"Tất cả tập trung! {{ act.time }} bắt đầu xuất phát nhé mấy đứa! Lề mề bỏ ở nhà nha! 📣"</div>
                              </div>
                              <div v-else-if="act.estimated_cost === 0 && act.type !== 'transport'" class="squad-speech-bubble">
                                <img src="/avatars/friend1.png" class="sq-chat-avatar" alt="Thủ quỹ">
                                <div class="sq-chat-text">"Chỗ này FREE nha anh em, đỡ tốn tiền quỹ của tui! Quá đã! 🤑"</div>
                              </div>
                              <div v-else-if="actIndex % 5 === 2" class="squad-speech-bubble">
                                <img src="/avatars/friend2.jpg" class="sq-chat-avatar sq-cyclo" alt="Chúa tể lười">
                                <div class="sq-chat-text">"Trời ơi đi nãy giờ mỏi chân quá, tới chỗ này có chỗ nằm nghỉ không dạ... 🚲"</div>
                              </div>
                              <div v-else-if="actIndex % 5 === 3 && (act.type === 'checkin' || act.type === 'explore')" class="squad-speech-bubble">
                                <img src="/avatars/friend3.jpg" class="sq-chat-avatar" alt="Thánh sống ảo">
                                <div class="sq-chat-text">"Góc này lên hình chắc cháy máy! Đưa máy đây nháy cho mấy tấm thần sầu nè 🌹📸"</div>
                              </div>
                              <div v-else-if="actIndex % 5 === 4 && act.type === 'food'" class="squad-speech-bubble">
                                <img src="/avatars/friend4.jpg" class="sq-chat-avatar sq-smirk" alt="Hoa tiêu">
                                <div class="sq-chat-text">"Review 4.8 sao đấy, ăn không ngon tui đền! Tin tui đi 😏"</div>
                              </div>

                              <div v-if="act.signature_dishes && act.signature_dishes.length > 0" class="act-signature-box">
                                <span class="asb-title"><AppIcon name="utensils" size="14" /> Món phải thử (Signature):</span>
                                <span class="asb-dishes">{{ act.signature_dishes.join(', ') }}</span>
                              </div>

                              <div class="act-cost-box">
                                <span v-if="act.price_range"><AppIcon name="wallet" size="12" /> Khoảng giá thực tế: <b>{{ act.price_range }}</b></span>
                                <span v-else-if="act.estimated_cost"><AppIcon name="wallet" size="12" /> Chi phí dự kiến: <b>{{ dinhDangTien(act.estimated_cost) }}đ</b></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Transit Micro-UX Badge & UX Validation Warning (Nằm giữa 2 Activity Node) -->
                        <div
                          v-if="timelineDensity === 'expanded' && actIndex < filterActivitiesBySession(day.activities).length - 1"
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
                                <span class="transit-icon"><AppIcon :name="tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).phuongTien" size="15" /></span>
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
                              <span class="twa-icon"><AppIcon :name="tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.icon" size="18" /></span>
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
                                <AppIcon name="refresh" size="14" /> Đổi điểm
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
                        <span v-else class="map-live-hint"><AppIcon name="pin" size="14" /> Tuyến đường nối tự động & rê chuột để xem</span>
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

                    <!-- Nút xem lộ trình ngày trên Google Maps (Overlay góc trên bản đồ - Screenshot 4) -->
                    <div class="map-floating-overlay-bar">
                      <a
                        :href="googleMapsDayRouteUrl"
                        target="_blank"
                        rel="noreferrer"
                        class="map-route-gmap-pill"
                        title="Mở toàn bộ lộ trình ngày hôm nay trên Google Maps"
                      >
                        <span class="gmap-g-logo">G</span> Xem lộ trình ngày {{ selectedDay }} ↗
                      </a>
                    </div>

                    <!-- THẺ CHI TIẾT ĐỊA ĐIỂM TRÊN GOOGLE MAPS KHI CLICK (YÊU CẦU 4 - THEO ĐÚNG SCREENSHOT 4) -->
                    <transition name="drawer-fade">
                      <div v-if="selectedMapPlace" class="map-place-detail-drawer">
                        <button class="mpd-close-btn" @click="selectedMapPlace = null" title="Đóng chi tiết"><AppIcon name="x" size="16" /></button>
                        
                        <div class="mpd-image-wrap">
                          <img
                            :src="getPlaceImage(selectedMapPlace)"
                            :alt="selectedMapPlace.place"
                            class="mpd-img"
                            @error="onImageError"
                          />
                          <span :class="['mpd-badge', getBadgeInfo(selectedMapPlace).class]">
                            {{ getBadgeInfo(selectedMapPlace).label }}
                          </span>
                        </div>

                        <div class="mpd-body">
                          <div class="mpd-header-row">
                            <h3 class="mpd-title">{{ selectedMapPlace.place }}</h3>
                          </div>
                          
                          <div class="mpd-rating-row">
                            <span class="mpd-score">{{ selectedMapPlace.rating || '4.6' }}</span>
                            <span class="mpd-stars"><AppIcon v-for="i in 5" :key="i" name="star" size="13" filled color="#f59e0b" /></span>
                            <span class="mpd-reviews">{{ selectedMapPlace.review_count || '7550' }} nhận xét</span>
                          </div>

                          <p class="mpd-addr"><AppIcon name="pin" size="14" /> {{ selectedMapPlace.address || selectedMapPlace.place }}</p>

                          <div class="mpd-section">
                            <h5>Tổng quan</h5>
                            <p class="mpd-desc">{{ lamSachMoTa(selectedMapPlace.activity, selectedMapPlace) }}</p>
                          </div>

                          <div class="mpd-gmap-btn-box">
                            <a
                              :href="googleMapsSearchUrl(selectedMapPlace)"
                              target="_blank"
                              rel="noreferrer"
                              class="mpd-gmap-primary-btn"
                            >
                              <AppIcon name="map" size="15" /> Xem trên Google Maps ↗
                            </a>
                          </div>

                          <!-- Khối nhận xét mô phỏng Google Maps -->
                          <div class="mpd-section mpd-rev-section">
                            <h5>Nhận xét</h5>
                            <div class="mpd-review-card">
                              <div class="mpd-rev-top">
                                <div class="mpd-rev-avatar">{{ (selectedMapPlace.reviewer_name || 'Thuy Pham')[0] }}</div>
                                <div>
                                  <strong class="mpd-rev-name">{{ selectedMapPlace.reviewer_name || 'Thuy Pham' }}</strong>
                                  <div class="mpd-rev-rating"><span style="display:inline-flex;gap:1px;"><AppIcon v-for="i in 5" :key="i" name="star" size="12" filled color="#f59e0b" /></span> <small>một tháng trước</small></div>
                                </div>
                              </div>
                              <p class="mpd-rev-body">
                                {{ getSampleReviewText(selectedMapPlace) }}
                              </p>
                            </div>
                          </div>

                          <!-- Nút hành động -->
                          <div class="mpd-actions-row">
                            <button
                              type="button"
                              class="mpd-fav-btn"
                              @click="doiYeuThich(selectedMapPlace._id || selectedMapPlace.place)"
                              :title="laYeuThich(selectedMapPlace._id || selectedMapPlace.place) ? 'Bỏ yêu thích' : 'Lưu yêu thích'"
                            >
                              <AppIcon name="heart" size="14" :filled="laYeuThich(selectedMapPlace._id || selectedMapPlace.place)" :color="laYeuThich(selectedMapPlace._id || selectedMapPlace.place) ? '#ef4444' : 'currentColor'" /> {{ laYeuThich(selectedMapPlace._id || selectedMapPlace.place) ? 'Đã thích' : 'Yêu thích' }}
                            </button>
                            <button
                              type="button"
                              class="mpd-change-btn"
                              @click="moModalDoiDiaDiemTuMap(selectedMapPlace)"
                            >
                              <AppIcon name="refresh" size="14" /> Đổi địa điểm khác
                            </button>
                          </div>
                        </div>
                      </div>
                    </transition>

                    <!-- Thanh hướng dẫn click bản đồ phía dưới (Screenshot 4) -->
                    <div class="map-bottom-prompt-bar">
                      <span>Click chọn địa điểm để xem chi tiết trên bản đồ & Google Maps</span>
                    </div>
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
            <span class="prompt-icon"><AppIcon name="lock" size="32" /></span>
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
                <button class="share-trip-btn" @click="chiaSeChuyenDi(trip)"><AppIcon name="share" size="14" /> Chia sẻ</button>
                <button
                  class="delete-trip-btn"
                  @click="xoaChuyenDi(trip)"
                  title="Xóa chuyến đi này"
                >
                  <AppIcon name="trash" size="16" />
                </button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state-box">
            <span class="empty-icon"><AppIcon name="luggage" size="36" /></span>
            <h3>Bạn chưa lưu chuyến đi nào</h3>
            <p>Hãy tạo lịch trình đầu tiên để bắt đầu hành trình khám phá Miền Trung.</p>
            <button class="app-primary-btn" @click="activeTab = 'planner'">Lên lịch ngay</button>
          </div>
        </section>


        <!-- ==================== TAB 5: TÀI KHOẢN & YÊU THÍCH (PROFILE) ==================== -->
        <section v-if="activeTab === 'profile'" class="tab-pane">
          <!-- Nếu đã đăng nhập -->
          <div v-if="nguoiDung" class="profile-card-premium">
            <div class="profile-cover">
              <button class="edit-profile-btn" @click="editProfile" v-if="!editProfileMode">
                <AppIcon name="pencil" size="14" /> Chỉnh sửa hồ sơ
              </button>
            </div>
            <div class="profile-avatar-premium">
              <img v-if="nguoiDung.avatar" :src="nguoiDung.avatar" alt="Avatar" class="avatar-img" />
              <div v-else class="avatar-placeholder">{{ nguoiDung.name ? nguoiDung.name[0].toUpperCase() : 'U' }}</div>
              
              <div class="level-badge" :style="{ backgroundColor: userLevelInfo?.color || '#10b981' }" :title="`Hoàn thành ${nguoiDung.completed_trips || 0} chuyến đi`">
                <AppIcon :name="userLevelInfo?.icon || 'sprout'" size="14" /> {{ userLevelInfo?.title || 'Thành viên' }}
              </div>
            </div>
            
            <div class="profile-info-premium" v-if="!editProfileMode">
              <h3 class="profile-name">{{ nguoiDung.name }} <span v-if="nguoiDung.role === 'admin'" class="admin-badge">Admin</span></h3>
              <p class="profile-email">{{ nguoiDung.email }}</p>
              <p class="profile-bio" v-if="nguoiDung.bio">"{{ nguoiDung.bio }}"</p>
              
              <div class="profile-stats-grid">
                <div class="stat-box-premium">
                  <div class="stat-icon"><AppIcon name="map" size="20" /></div>
                  <strong>{{ myTripsList.length }}</strong>
                  <small>Đã lên lịch</small>
                </div>
                <div class="stat-box-premium">
                  <div class="stat-icon"><AppIcon name="checkcircle2" size="20" /></div>
                  <strong>{{ nguoiDung.completed_trips || 0 }}</strong>
                  <small>Hoàn thành</small>
                </div>
                <div class="stat-box-premium">
                  <div class="stat-icon"><AppIcon name="heart" size="20" filled color="#ef4444" /></div>
                  <strong>{{ favoritesList.length }}</strong>
                  <small>Yêu thích</small>
                </div>
                <div class="stat-box-premium">
                  <div class="stat-icon"><AppIcon name="trophy" size="20" /></div>
                  <strong>{{ nguoiDung.points || 0 }}</strong>
                  <small>Điểm số</small>
                </div>
              </div>
              <button class="logout-btn-premium" @click="dangXuat">Đăng xuất</button>
            </div>
            
            <div class="profile-edit-form" v-else>
              <h3>Chỉnh sửa hồ sơ</h3>
              <div class="edit-field">
                <label>Tên hiển thị</label>
                <input type="text" v-model="profileForm.name" class="app-input" />
              </div>
              <div class="edit-field">
                <label>Ảnh đại diện (Tải lên từ thiết bị)</label>
                <input type="file" accept="image/*" @change="handleAvatarUpload" class="app-input" style="padding: 8px;" />
                <div v-if="profileForm.avatar && profileForm.avatar.startsWith('data:image')" style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                   <img :src="profileForm.avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #10b981;" />
                   <span style="font-size: 0.85rem; color: #10b981; font-weight: 600;">Đã đính kèm ảnh mới</span>
                </div>
              </div>
              <div class="edit-field">
                <label>Giới thiệu bản thân</label>
                <textarea v-model="profileForm.bio" class="app-input" rows="3" placeholder="Sở thích du lịch của bạn là gì?"></textarea>
              </div>
              <div class="edit-actions">
                <button class="cancel-edit-btn" @click="editProfileMode = false">Hủy</button>
                <button class="save-edit-btn" @click="saveProfile"><AppIcon name="save" size="14" /> Lưu thay đổi</button>
              </div>
            </div>
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
                  <button class="heart-action-btn active" @click="doiYeuThich(place._id)"><AppIcon name="heart" size="16" filled color="#ef4444" /></button>
                </div>
                <h4>{{ place.name }}</h4>
                <p class="place-card-desc">{{ place.description }}</p>
                <p class="place-card-address" v-if="place.address"><AppIcon name="pin" size="14" /> {{ place.address }}</p>
                <div class="place-card-bottom">
                  <a class="place-maps-btn" :href="chiDuongUrl(place.name, place.address)" target="_blank"><AppIcon name="map" size="14" /> Chỉ đường</a>
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
          <button class="close-modal-btn" @click="hienAuthModal = false"><AppIcon name="x" size="16" /></button>
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


    <!-- ==================== POPUP MODAL THAY ĐỔI LỊCH TRÌNH KHÁC (YÊU CẦU 1) ==================== -->
    <div v-if="hienModalDoiLichTrinh" class="modal-overlay" @click.self="hienModalDoiLichTrinh = false">
      <div class="modal-card replan-modal-card">
        <div class="modal-header">
          <div class="rmc-title-group">
            <span class="rmc-icon"><AppIcon name="refresh" size="24" /></span>
            <div>
              <h3 style="margin: 0; font-size: 1.15rem;">Thay Đổi Lịch Trình Khác</h3>
              <p class="rmc-sub" style="margin: 2px 0 0; font-size: 0.82rem; color: #64748b;">Chọn phương thức bạn muốn điều chỉnh hành trình</p>
            </div>
          </div>
          <button class="close-modal-btn" @click="hienModalDoiLichTrinh = false"><AppIcon name="x" size="16" /></button>
        </div>
        <div class="replan-options-body">
          <!-- Lựa chọn 1: Chỉnh sửa thông số -->
          <div class="replan-option-card" @click="chonDoiThongSo">
            <div class="roc-icon"><AppIcon name="pencil" size="22" /></div>
            <div class="roc-text">
              <h4>Chỉnh sửa thông số chuyến đi</h4>
              <p>Thay đổi số ngày, số người, mức kinh phí, phương tiện xe hoặc ngày khởi hành.</p>
            </div>
            <span class="roc-arrow">➔</span>
          </div>

          <!-- Lựa chọn 2: AI Tạo phương án ngẫu nhiên mới -->
          <div class="replan-option-card" @click="chonAILenPhuongAnMoi">
            <div class="roc-icon"><AppIcon name="dices" size="22" /></div>
            <div class="roc-text">
              <h4>AI Đề xuất phương án mới ngay</h4>
              <p>Giữ nguyên số ngày và ngân sách, AI sẽ làm mới và gợi ý các điểm check-in & quán ăn khác.</p>
            </div>
            <span class="roc-arrow">➔</span>
          </div>

          <!-- Lựa chọn 3: Đổi sang tỉnh thành khác -->
          <div class="replan-option-card" @click="chonDoiTinhThanh">
            <div class="roc-icon"><AppIcon name="pin" size="22" /></div>
            <div class="roc-text">
              <h4>Khám phá tỉnh thành khác</h4>
              <p>Chọn các điểm đến hấp dẫn khác như Huế, Đà Nẵng, Hội An, Quy Nhơn, Nha Trang...</p>
            </div>
            <span class="roc-arrow">➔</span>
          </div>
        </div>
      </div>
    </div>


    <!-- ==================== POPUP MODAL CHIA TIỀN NHÓM (BILL SPLITTER) ==================== -->
    <div v-if="hienBillSplitter" class="modal-overlay" @click.self="hienBillSplitter = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3><AppIcon name="wallet" size="20" style="margin-right: 8px; vertical-align: -3px;" />Tính Tiền Chia Đều Cho Nhóm</h3>
          <button class="close-modal-btn" @click="hienBillSplitter = false" aria-label="Đóng"><AppIcon name="x" size="16" /></button>
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
          <h3><AppIcon name="ticket" size="20" style="margin-right: 8px; vertical-align: -3px;" />Thẻ Vé Hành Trình Du Lịch</h3>
          <button class="close-modal-btn" @click="hienTravelPass = false" aria-label="Đóng"><AppIcon name="x" size="16" /></button>
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
        <button class="app-primary-btn" @click="xuatPdf">
          <AppIcon name="filetext" size="16" style="margin-right: 6px; vertical-align: -2px;" />In / Lưu PDF Thẻ Vé
        </button>
      </div>
    </div>

    <!-- ==================== POPUP MODAL ĐỔI ĐỊA ĐIỂM ==================== -->
    <div v-if="showChangePlaceModal" class="modal-overlay" @click.self="showChangePlaceModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3><AppIcon name="refresh" size="20" style="margin-right: 8px; vertical-align: -3px;" />Chọn địa điểm thay thế</h3>
          <button class="close-modal-btn" @click="showChangePlaceModal = false" aria-label="Đóng"><AppIcon name="x" size="16" /></button>
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
              <p class="place-card-address" v-if="p.address"><AppIcon name="pin" size="14" style="margin-right: 4px; vertical-align: -2px;" />{{ p.address }}</p>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP MODAL ĐỔI LỊCH TRÁNH MƯA ==================== -->
    <div v-if="showRainModal" class="modal-overlay" @click.self="showRainModal = false">
      <div class="rain-modal-card">
        <div class="rmc-header">
          <div class="rmc-icon-badge"><AppIcon name="cloudrain" size="24" color="var(--primary-color, #0284c7)" /></div>
          <div>
            <h3>Đổi Lịch Tránh Mưa Thông Minh</h3>
            <p class="rmc-sub">Trợ lý AI tự động tối ưu chuyến đi theo dự báo thời tiết</p>
          </div>
          <button class="close-modal-btn" @click="showRainModal = false" aria-label="Đóng"><AppIcon name="x" size="16" /></button>
        </div>
        <div class="rmc-body">
          <div class="rmc-weather-alert-box">
            <span class="rmc-wa-icon" style="display: inline-flex; align-items: center; gap: 6px;"><AppIcon name="cloudsun" size="20" /> ➔ <AppIcon name="cloudrain" size="20" /></span>
            <div class="rmc-wa-content">
              <strong>Dự báo {{ lichTrinh?.destination || formDuLieu.diemDen }} chiều mai có mưa lúc 15:00</strong>
              <p>Khả năng mưa rào 75%, gió nhẹ, nhiệt độ ~26°C. AI đã chuẩn bị phương án hoán đổi điểm ngoài trời sang buổi sáng và chọn cafe/bảo tàng trong nhà lúc 15:30.</p>
            </div>
          </div>

          <div class="rmc-ai-proposal">
            <div class="rmc-proposal-title">
              <span style="display: inline-flex; align-items: center; gap: 6px;"><AppIcon name="bot" size="16" /> ĐỐI CHIẾU LỊCH TRÌNH (PREVIEW):</span>
            </div>
            <div class="diff-preview-box" style="background: rgba(128,128,128,0.05); padding: 16px; border-radius: 8px; margin-top: 12px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border-color);">
              <div class="diff-old" style="background: #fee2e2; padding: 12px; border-radius: 6px;">
                <div class="diff-label" style="color: #b91c1c; font-weight: 700; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;"><AppIcon name="x" size="14" /> Lịch cũ (Ngoài trời)</div>
                <div class="diff-content" style="color: #7f1d1d; text-decoration: line-through; font-size: 14px;" v-for="p in rainModalOldPlaces" :key="p">{{ p }}</div>
                <div v-if="rainModalOldPlaces.length === 0" style="font-size: 13px; color: #7f1d1d;">Không có điểm nào vào chiều nay cần đổi.</div>
              </div>
              
              <div class="diff-arrow" style="text-align: center; font-size: 14px; font-weight: 600; color: var(--text-sub); display: flex; align-items: center; justify-content: center; gap: 6px;"><AppIcon name="arrowdown" size="16" /> Tự động đổi thành</div>
              
              <div class="diff-new" style="background: #d1fae5; padding: 12px; border-radius: 6px;">
                <div class="diff-label" style="color: #047857; font-weight: 700; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;"><AppIcon name="check" size="14" /> Lịch mới (Trong nhà)</div>
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
            <span class="m-head-icon"><AppIcon name="phone" size="20" /></span>
            <h3>Thẻ Lịch Trình Infographic (Zalo / Messenger)</h3>
          </div>
          <button class="close-modal-btn" @click="hienModalInfographic = false" aria-label="Đóng"><AppIcon name="x" size="16" /></button>
        </div>

        <div class="infographic-scroll-wrap">
          <!-- Bề mặt Thẻ Infographic có thể chụp ảnh/copy -->
          <div class="infographic-poster" id="infographic-poster-target">
            <!-- Header Poster -->
            <div class="ip-header">
              <span class="ip-tag"><AppIcon name="sprout" size="14" style="margin-right: 4px; vertical-align: -2px;" />AI TRAVEL TRIPS · MIỀN TRUNG VIỆT NAM</span>
              <h2 class="ip-title">KẾ HOẠCH DU LỊCH {{ (lichTrinh.destination || formDuLieu.diemDen).toUpperCase() }}</h2>
              <div class="ip-meta-strip">
                <span style="display: inline-flex; align-items: center; gap: 4px;"><AppIcon name="clock" size="14" />{{ lichTrinh.daysList.length }} Ngày</span>
                <span style="display: inline-flex; align-items: center; gap: 4px;"><AppIcon name="users" size="14" />{{ lichTrinh.people || formDuLieu.soNguoi }} Khách</span>
                <span style="display: inline-flex; align-items: center; gap: 4px;"><AppIcon name="wallet" size="14" />{{ dinhDangTien(lichTrinh.total_budget) }}đ</span>
              </div>
            </div>

            <!-- Khối Nhà xe & Khách sạn đã chọn -->
            <div class="ip-highlight-box" v-if="formDuLieu.nhaXeDaChon || lichTrinh.hotel_recommendation">
              <div v-if="formDuLieu.nhaXeDaChon" class="ip-hl-row">
                <span class="ip-hl-icon"><AppIcon name="bus" size="20" /></span>
                <div>
                  <strong>{{ formDuLieu.nhaXeDaChon.name }} ({{ formDuLieu.nhaXeDaChon.type }})</strong>
                  <small>{{ formDuLieu.diemKhoiHanh }} ➔ {{ lichTrinh.destination || formDuLieu.diemDen }} · Hotline: {{ formDuLieu.nhaXeDaChon.hotline }}</small>
                </div>
              </div>
              <div v-if="lichTrinh.hotel_recommendation" class="ip-hl-row">
                <span class="ip-hl-icon"><AppIcon name="hotel" size="20" /></span>
                <div>
                  <strong>{{ lichTrinh.hotel_recommendation.name }}</strong>
                  <small>{{ lichTrinh.hotel_recommendation.address || 'Khu vực trung tâm' }}</small>
                </div>
              </div>
            </div>

            <!-- Tóm tắt lịch trình từng ngày -->
            <div class="ip-days-list">
              <div v-for="day in lichTrinh.daysList" :key="day.day" class="ip-day-block">
                <div class="ip-day-title"><AppIcon name="calendar" size="15" style="margin-right: 6px; vertical-align: -2px;" />NGÀY {{ day.day }}</div>
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
                <span style="display: inline-flex; align-items: center; gap: 4px;"><AppIcon name="map" size="14" />GPS Google Maps: Đã tạo tuyến đường tự động</span>
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
            <span style="display: inline-flex; align-items: center; gap: 6px;"><AppIcon :name="daSaoChepZalo ? 'check' : 'copy'" size="16" />{{ daSaoChepZalo ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép tóm tắt gửi Zalo' }}</span>
          </button>
          <a
            :href="googleMapsAllStopsUrl"
            target="_blank"
            rel="noreferrer"
            class="app-secondary-btn"
            style="display: inline-flex; align-items: center; gap: 6px;"
          >
            <AppIcon name="map" size="16" />Mở toàn tuyến trên Google Maps ↗
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

      <button class="skip-intro-btn" @click.stop="boQuaIntro">Bỏ qua <AppIcon name="arrowright" size="14" style="margin-left: 4px; vertical-align: -2px;" /></button>
    </div>

    <!-- ==================== MODAL XÁC NHẬN LƯU LỊCH TRÌNH TRƯỚC KHI CHUYỂN TAB (PHẦN 2) ==================== -->
    <div v-if="hienModalNhacLuu" class="modal-overlay save-confirm-overlay" @click.self="huyChuyenTab">
      <div class="modal-card save-confirm-card">
        <div class="scm-icon-ring"><AppIcon name="save" size="28" /></div>
        <h3>Lưu lịch trình trước khi rời đi?</h3>
        <p>Bạn có một lịch trình <b>chưa được lưu</b>. Nếu rời trang này mà không lưu, lịch trình sẽ bị mất.</p>
        <div class="scm-actions">
          <button class="scm-btn scm-btn-save" @click="dongYLuuVaChuyenTab">
            <AppIcon name="save" size="16" style="margin-right: 6px; vertical-align: -2px;" />Lưu lịch trình
          </button>
          <button class="scm-btn scm-btn-discard" @click="khongLuuVaChuyenTab">
            <AppIcon name="alertcircle" size="16" style="margin-right: 6px; vertical-align: -2px;" />Bỏ qua, không lưu
          </button>
          <button class="scm-btn scm-btn-cancel" @click="huyChuyenTab">
            <AppIcon name="x" size="16" style="margin-right: 6px; vertical-align: -2px;" />Ở lại trang này
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU (PHẦN 3) ==================== -->
    <div v-if="hienModalChiTietTrip && xemTripChiTiet" class="modal-overlay trip-detail-overlay" @click.self="hienModalChiTietTrip = false">
      <div class="modal-card trip-detail-modal-card">
        <!-- Header -->
        <div class="tdm-header">
          <div class="tdm-header-info">
            <span class="tdm-dest-tag">{{ xemTripChiTiet.destination }}</span>
            <h2 class="tdm-title">Chuyến đi {{ (xemTripChiTiet.daysList || xemTripChiTiet.days || []).length }} Ngày tại {{ xemTripChiTiet.destination }}</h2>
            <div class="tdm-meta-row">
              <span class="tdm-meta-item"><AppIcon name="users" size="14" style="margin-right: 4px; vertical-align: -2px;" />{{ xemTripChiTiet.people || 1 }} người</span>
              <span class="tdm-meta-item"><AppIcon name="wallet" size="14" style="margin-right: 4px; vertical-align: -2px;" />{{ dinhDangTien(xemTripChiTiet.total_budget) }}đ</span>
              <span class="tdm-meta-item"><AppIcon name="calendar" size="14" style="margin-right: 4px; vertical-align: -2px;" />{{ dinhDangNgayNgan(xemTripChiTiet.created_at) }}</span>
            </div>
          </div>
          <button class="close-modal-btn tdm-close" @click="hienModalChiTietTrip = false" aria-label="Đóng"><AppIcon name="x" size="16" /></button>
        </div>

        <!-- Body: Nếu đang xem ngày cụ thể -->
        <div v-if="xemNgayChiTiet" class="tdm-day-detail-view">
          <button class="tdm-back-btn" @click="xemNgayChiTiet = null">← Quay lại danh sách ngày</button>
          <!-- Day card header giống hình 3/4 -->
          <div class="tdm-day-header-card">
            <div class="tdm-day-info">
              <span class="tdm-day-label">Ngày {{ xemNgayChiTiet.day }}</span>
              <h3 class="tdm-day-route">{{ xemNgayChiTiet.title || xemNgayChiTiet.route || ('Ngày ' + xemNgayChiTiet.day) }}</h3>
              <p class="tdm-day-meals">
                <AppIcon name="utensils" size="14" style="margin-right: 4px; vertical-align: -2px;" />{{ ['breakfast','lunch','dinner'].filter(m => (xemNgayChiTiet.activities||[]).some(a => a.type === m)).map(m => m === 'breakfast' ? 'Sáng' : m === 'lunch' ? 'Trưa' : 'Tối').join(', ') || 'Ăn sáng, trưa, tối' }}
              </p>
            </div>
            <div class="tdm-day-img-wrap" v-if="xemNgayChiTiet.activities && xemNgayChiTiet.activities[0]?.image_url">
              <img :src="xemNgayChiTiet.activities[0].image_url" :alt="xemNgayChiTiet.title" class="tdm-day-img" />
            </div>
            <div class="tdm-day-img-wrap tdm-day-img-placeholder" v-else>
              <AppIcon name="map" size="24" color="var(--primary-color, #0284c7)" />
            </div>
          </div>

          <!-- Activities list -->
          <div class="tdm-activities-section">
            <h4 class="tdm-activities-title">
              {{ xemNgayChiTiet.theme ? ('Hoạt động chính: ' + xemNgayChiTiet.theme) : 'Lịch trình trong ngày' }}
            </h4>
            <ul class="tdm-activities-list">
              <li v-for="(act, idx) in (xemNgayChiTiet.activities || [])" :key="idx" class="tdm-act-item">
                <span class="tdm-act-time" v-if="act.time">{{ act.time }}</span>
                <span class="tdm-act-icon"><AppIcon :name="act.type === 'breakfast' ? 'sunrise' : act.type === 'lunch' ? 'sun' : act.type === 'dinner' ? 'moon' : act.type === 'attraction' || act.type === 'checkin' ? 'pin' : act.type === 'transport' ? 'bus' : 'sparkles'" size="16" /></span>
                <div class="tdm-act-info">
                  <span class="tdm-act-name">{{ act.name }}</span>
                  <span class="tdm-act-desc" v-if="act.description">{{ act.description }}</span>
                  <span class="tdm-act-cost" v-if="act.estimated_cost > 0">~{{ dinhDangTien(act.estimated_cost) }}đ/người</span>
                  <span class="tdm-act-cost free-tag" v-else-if="act.estimated_cost === 0">Miễn phí</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Body: Danh sách ngày (giống hình 2 — list clickable) -->
        <div v-else class="tdm-days-list-view">
          <h3 class="tdm-section-title"><AppIcon name="calendar" size="18" style="margin-right: 6px; vertical-align: -2px;" />Lịch trình</h3>
          <div class="tdm-days-list">
            <div
              v-for="day in (xemTripChiTiet.daysList || xemTripChiTiet.days || [])"
              :key="day.day"
              class="tdm-day-row"
              @click="xemNgayChiTiet = day"
            >
              <div class="tdm-day-row-info">
                <span class="tdm-day-row-title">Ngày {{ day.day }}: {{ day.title || day.route || ('Ngày ' + day.day) }}</span>
                <span class="tdm-day-row-meals">
                  <AppIcon name="utensils" size="13" style="margin-right: 4px; vertical-align: -2px;" />{{ ['breakfast','lunch','dinner'].filter(m => (day.activities||[]).some(a => a.type === m)).map(m => m === 'breakfast' ? 'Ăn sáng' : m === 'lunch' ? 'trưa' : 'tối').join(', ') || 'Ăn sáng, trưa, tối' }}
                </span>
              </div>
              <span class="tdm-day-row-arrow">›</span>
            </div>
          </div>

          <!-- Budget summary -->
          <div class="tdm-budget-summary" v-if="xemTripChiTiet.budget_breakdown">
            <h3 class="tdm-section-title"><AppIcon name="wallet" size="18" style="margin-right: 6px; vertical-align: -2px;" />Chi phí ước tính</h3>
            <div class="tdm-budget-grid">
              <div class="tdm-budget-item" v-if="xemTripChiTiet.budget_breakdown.hotel">
                <span class="tbi-icon"><AppIcon name="hotel" size="18" /></span>
                <span class="tbi-label">Khách sạn</span>
                <span class="tbi-value">{{ dinhDangTien(xemTripChiTiet.budget_breakdown.hotel) }}đ</span>
              </div>
              <div class="tdm-budget-item" v-if="xemTripChiTiet.budget_breakdown.transportation">
                <span class="tbi-icon"><AppIcon name="bus" size="18" /></span>
                <span class="tbi-label">Di chuyển</span>
                <span class="tbi-value">{{ dinhDangTien(xemTripChiTiet.budget_breakdown.transportation) }}đ</span>
              </div>
              <div class="tdm-budget-item" v-if="xemTripChiTiet.budget_breakdown.food">
                <span class="tbi-icon"><AppIcon name="utensils" size="18" /></span>
                <span class="tbi-label">Ăn uống</span>
                <span class="tbi-value">{{ dinhDangTien(xemTripChiTiet.budget_breakdown.food) }}đ</span>
              </div>
              <div class="tdm-budget-item" v-if="xemTripChiTiet.budget_breakdown.tickets">
                <span class="tbi-icon"><AppIcon name="ticket" size="18" /></span>
                <span class="tbi-label">Vé tham quan</span>
                <span class="tbi-value">{{ dinhDangTien(xemTripChiTiet.budget_breakdown.tickets) }}đ</span>
              </div>
              <div class="tdm-budget-item tdm-budget-total">
                <span class="tbi-icon"><AppIcon name="wallet" size="18" /></span>
                <span class="tbi-label">Tổng cộng</span>
                <span class="tbi-value tbi-total">{{ dinhDangTien(xemTripChiTiet.total_budget) }}đ</span>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="tdm-footer-actions">
            <button class="tdm-action-btn tdm-open-btn" @click="moLaiLichTrinh(xemTripChiTiet); hienModalChiTietTrip = false">
              <AppIcon name="map" size="16" style="margin-right: 6px; vertical-align: -2px;" />Mở và xem đầy đủ lịch trình
            </button>
          </div>
        </div>
      </div>
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

function cuonLenDauTrang() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  const appRoot = document.querySelector('.app-root') || document.querySelector('.app')
  if (appRoot) appRoot.scrollTop = 0
}

function handleTabChange(newTab) {
  if (newTab === 'planner') {
    startPlannerTransition()
  } else {
    // Dùng chuyenTab() để kiểm tra lưu lịch trình trước khi rời planner (Phần 2)
    chuyenTab(newTab)
  }
}

function startPlannerTransition() {
  activeTab.value = 'planner'
  cuonLenDauTrang()
  nextTick(() => {
    cuonLenDauTrang()
  })
}

const ALL_DESTINATIONS = 'Tất cả miền Trung'

const formDuLieu = reactive({
  diemKhoiHanh: 'Hà Nội',
  diemDen: 'Đà Nẵng',
  soNgay: 3,
  nganSach: 3500000,
  soNguoi: 2,
  soThich: [],
  ngayBatDau: '2026-10-06',
  ngayKetThuc: '2026-10-08',
  phuongTien: 'xe khách',
  yeuCauKhachSan: '',
  nhaXeDaChon: null,
  freePlacesOnly: false
})

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

// DỮ LIỆU ĐIỂM ĐẾN NỔI BẬT: ẢNH HD THỰC TẾ 100%, 5 THUMBNAILS GALLERY ĐÚNG DANH THẮNG & THÔNG TIN DU LỊCH CHI TIẾT
const PROVINCE_SPOTLIGHTS = {
  'Đà Nẵng': {
    title: 'Đà Nẵng - Thành phố đáng sống bên sông Hàn & Biển Mỹ Khê',
    subtitle: 'Kỳ quan Cầu Vàng Bà Nà Hills, Bán đảo Sơn Trà & Di sản Phố Cổ Hội An kề cận',
    badge: 'ESG & LEI Certified 2026',
    esgText: 'ESG: 75 | LEI: 72',
    certText: 'Chứng nhận Di sản & Du lịch Xanh',
    description: 'Đà Nẵng sở hữu đường bờ biển Mỹ Khê lọt top quyến rũ nhất hành tinh, bán đảo Sơn Trà - lá phổi xanh nguyên sinh với Chùa Linh Ứng uy nghiêm, cây Cầu Rồng phun lửa ngoạn mục và vị trí tâm điểm kết nối các di sản thế giới miền Trung.',
    specialties: ['Mì Quảng ếch', 'Bánh tráng cuốn thịt heo hai đầu da', 'Bánh xèo nem lụi', 'Chả bò Đà Nẵng', 'Gỏi cá Nam Ô'],
    bestSeason: 'Tháng 3 - Tháng 8 (Mùa khô ráo, nắng vàng chan hòa, biển trong xanh màu ngọc bích)',
    heroImage: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg',
    gallery: [
      { name: 'Cầu Vàng Bà Nà Hills', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg' },
      { name: 'Bãi biển Mỹ Khê', image: 'https://mia.vn/media/uploads/blog-du-lich/bai-bien-my-khe-da-nang-lang-nguoi-ngam-nhin-1-trong-6-bai-bien-dep-nhat-hanh-tinh-01-1636298582.jpeg' },
      { name: 'Bán đảo Sơn Trà', image: 'https://r2.nucuoimekong.com/wp-content/uploads/ban-dao-son-tra-co-gi.jpg' },
      { name: 'Cầu Rồng Sông Hàn', image: 'https://benduthuyendanang.com/wp-content/uploads/Tour-xem-cau-rong-phun-lua.jpg' },
      { name: 'Phố Cổ Hội An', image: 'https://static.vinwonders.com/2022/03/pho-den-long-hoi-an-1.jpg' }
    ]
  },
  'Huế': {
    title: 'Cố Đô Huế - Miền Di Sản Trầm Mặc & Nhã Nhạc Cung Đình',
    subtitle: 'Quần thể Di tích Cố đô triều Nguyễn, Sông Hương êm đềm & Ẩm thực cung đình tinh hoa',
    badge: 'UNESCO World Heritage',
    esgText: 'ESG: 78 | LEI: 74',
    certText: 'Di sản Văn hóa Thế giới UNESCO',
    description: 'Thủ phủ văn hóa lịch sử triều Nguyễn với Đại Nội Hoàng Thành nguy nga, lăng tẩm các vị vua cổ kính, chùa Thiên Mụ soi bóng dòng sông Hương thơ mộng và ẩm thực cung đình cầu kỳ tinh tế bậc nhất Việt Nam.',
    specialties: ['Bún bò giò heo Cố đô', 'Cơm hến Đập Đá', 'Bánh bèo, nậm, lọc', 'Chè bột lọc heo quay', 'Nem lụi Hoàng Cung'],
    bestSeason: 'Tháng 1 - Tháng 5 (Khí hậu dịu mát, không mưa, hoa ngô đồng nở rộ Hoàng Thành)',
    heroImage: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg',
    gallery: [
      { name: 'Đại Nội Hoàng Thành', image: 'https://static.vinwonders.com/production/optimize_ngo-mon-hue_optimized.jpg' },
      { name: 'Lăng Khải Định kỳ vĩ', image: 'https://nemtv.vn/wp-content/uploads/2019/03/lang-khai-dinh-nemtv-3.jpg' },
      { name: 'Chùa Thiên Mụ', image: 'https://statics.vinpearl.com/thap-phuoc-duyen-4_1642651510.png' },
      { name: 'Sông Hương & Cầu Tràng Tiền', image: 'https://www.tuannguyentravel.com/data/images/Truong-Tien-Bridge-Da-Nang-to-Hur-by-private-car.jpg' },
      { name: 'Đồi Vọng Cảnh bình yên', image: 'https://huesmiletravel.com.vn/images/doi-vong-canh-hue.jpg' }
    ]
  },
  'Khánh Hòa': {
    title: 'Khánh Hòa - Nha Trang: Thiên Đường Vịnh Biển Quốc Tế & Tháp Bà Ponagar',
    subtitle: 'Vịnh biển Nha Trang tuyệt mỹ, Vịnh Vĩnh Hy, lặn ngắm san hô & Hải sản tươi sống',
    badge: 'Most Beautiful Bays Club',
    esgText: 'ESG: 74 | LEI: 70',
    certText: 'Top 29 Vịnh biển đẹp nhất thế giới',
    description: 'Nha Trang nổi danh toàn cầu nhờ làn nước biển trong vắt quanh năm, bãi cát trắng mịn trải dài đường Trần Phú, quần thể Tháp Bà Ponagar nghìn năm tuổi của người Chăm và thiên đường nghỉ dưỡng đẳng cấp quốc tế.',
    specialties: ['Bún chả cá Nha Trang', 'Nem nướng Ninh Hòa', 'Bánh căn mực trứng', 'Yến sào Hòn Nội', 'Hải sản tươi sống làng chài'],
    bestSeason: 'Tháng 1 - Tháng 8 (Biển lặng sóng êm ả, trời trong xanh rực rỡ, lý tưởng lặn biển)',
    heroImage: 'https://booking.muongthanh.com/upload_images/images/ve-dep-bai-bien-tran-phu-nha-trang.jpg',
    gallery: [
      { name: 'Bãi biển Nha Trang', image: 'https://booking.muongthanh.com/upload_images/images/ve-dep-bai-bien-tran-phu-nha-trang.jpg' },
      { name: 'Tháp Bà Ponagar', image: 'https://danangprivatecar.com/wp-content/uploads/2023/07/This-is-a-famous-tourist-destination-in-Nha-Trang-and-Ponagar-Tower-is-the-largest-Cham-Pa-architectural-complex-in-Vietnam..jpeg' },
      { name: 'Vịnh Vĩnh Hy xanh biếc', image: 'https://thesinhtour.com/wp-content/uploads/2015/07/vinh-vinh-hy.jpg' },
      { name: 'VinWonders Hòn Tre', image: 'https://api.sovaba.travel/uploads/vinwonders_nha_trang_tren_cao_hon_tre_47c4184aee.jpg' },
      { name: 'Rạn San Hô Hòn Mun', image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/342/038/products/tour-dao-hon-mun-nha-trang-goodmorning-travel-02.jpg?v=1775720395537' }
    ]
  },
  'Quảng Ngãi': {
    title: 'Quảng Ngãi & Đảo Lý Sơn - Vương Quốc Tỏi & Tuyệt Tác Núi Lửa',
    subtitle: 'Cổng Tò Vò triệu năm, Hang Câu kỳ vĩ, Kỳ Co Eo Gió & Ẩm thực biển đảo hoang sơ',
    badge: 'Geopark Candidate',
    esgText: 'ESG: 69 | LEI: 65',
    certText: 'Công viên Địa chất Đảo Núi Lửa',
    description: 'Huyện đảo Lý Sơn được tạo tác từ những đợt phun trào núi lửa triệu năm trước, sở hữu Cổng Tò Vò trầm tích bazan độc nhất vô nhị, vách đá Hang Câu sừng sững bên bờ biển ngọc và đặc sản tỏi cô đơn trứ danh.',
    specialties: ['Gỏi rong biển Lý Sơn', 'Cua Huỳnh Đế biển sâu', 'Cá bống sông Trà kho tiêu', 'Don nước ngọt sông Vệ', 'Kẹo gương đậu phụng'],
    bestSeason: 'Tháng 4 - Tháng 9 (Mùa biển êm, tàu cao tốc chạy thuận lợi, nước trong vắt tận đáy)',
    heroImage: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg',
    gallery: [
      { name: 'Cổng Tò Vò Lý Sơn', image: 'https://static.vinwonders.com/production/cong_to_vo_ly_son_1.jpg' },
      { name: 'Hang Câu vách đá', image: 'https://live.staticflickr.com/1695/25075454644_747b284099_b.jpg' },
      { name: 'Đỉnh Thới Lới', image: 'https://vivulyson.com/uploads/images/blog/xem-an-choi/82/mieng-nui-lua-ly-son-2.jpg' },
      { name: 'Eo Gió Kỳ Co', image: 'https://eholiday.vn/wp-content/uploads/2024/07/ky-co-1.jpg' },
      { name: 'Đảo Bé Lý Sơn', image: 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/9/21/1095775/Dao-Be-Ly-Son-Ld.JPG' }
    ]
  },
  'Phú Yên': {
    title: 'Phú Yên - Xứ Sở Hoa Vàng Trên Cỏ Xanh & Ghềnh Đá Đĩa Huyền Bí',
    subtitle: 'Ghềnh Đá Đĩa kỳ quan đá ong núi lửa, Mũi Điện đón bình minh đầu tiên & Tháp Nghinh Phong',
    badge: 'ESG: 68 | LEI: 65',
    esgText: 'ESG: 68 | LEI: 65',
    certText: 'Chứng nhận Di tích Quốc gia Đặc biệt Ghềnh Đá Đĩa',
    description: 'Phú Yên quyến rũ du khách bằng vẻ đẹp nguyên sơ của kiệt tác Ghềnh Đá Đĩa với hàng nghìn cột đá bazan hình lục giác xếp lớp đều tăm tắp, ngọn hải đăng Đại Lãnh đón ánh bình minh sớm nhất đất liền và bãi cát vàng óng ả ôm trọn sóng biển.',
    specialties: ['Mắt cá ngừ đại dương hầm thuốc bắc', 'Sò huyết Đầm Ô Loan béo ngậy', 'Bánh hỏi lòng heo An Mỹ', 'Gỏi sứa Đầm Cù Mông', 'Bò một nắng muối kiến vàng'],
    bestSeason: 'Tháng 1 - Tháng 8 (Thời tiết nhiều nắng, biển trong vắt, sóng êm thích hợp tắm biển và chụp ảnh check-in)',
    heroImage: 'https://static.vinwonders.com/production/ganh-da-dia-phu-yen-1.jpg',
    gallery: [
      { name: 'Ghềnh Đá Đĩa', image: 'https://gonatour.vn/vnt_upload/news/03_2021/ghenh_da_dia_phu_yen.jpg' },
      { name: 'Mũi Điện Hải Đăng', image: 'https://cdn.xanhsm.com/2025/03/67778055-mui-dien-6.jpg' },
      { name: 'Bãi Xép Hoa Vàng Cỏ Xanh', image: 'https://cdn.xanhsm.com/2025/03/b622a2ba-hoa-vang-tren-co-xanh-thumb.jpg' },
      { name: 'Tháp Nghinh Phong', image: 'https://ik.imagekit.io/tvlk/blog/2023/01/thap-nghinh-phong-2-768x1024.jpg?tr=dpr-2,w-675' },
      { name: 'Đầm Ô Loan chiều hoàng hôn', image: 'https://52hz.vn/wp-content/uploads/2022/08/dam-o-loan-hoang-hon.jpg' }
    ]
  },
  'Lâm Đồng': {
    title: 'Lâm Đồng & Đà Lạt - Thành Phố Ngàn Hoa & Rừng Thông Cao Nguyên',
    subtitle: 'Khí hậu se lạnh mát lành bốn mùa, Hồ Tuyền Lâm, Đồi Chè Cầu Đất & Thác Dambri hùng vĩ',
    badge: 'Eco Wellness Resort',
    esgText: 'ESG: 82 | LEI: 78',
    certText: 'Đô thị Nghỉ Dưỡng Sinh Thái Cao Nguyên',
    description: 'Nằm trên cao nguyên Lang Biang độ cao 1.500m, Đà Lạt mê hoặc lòng người bởi khí hậu ôn đới mát mẻ quanh năm, những đồi thông reo trong sương sớm, thung lũng ngập tràn hoa tươi và văn hóa cà phê chill độc đáo.',
    specialties: ['Lẩu gà lá é Tao Ngộ', 'Lẩu bò Ba Toa', 'Bánh ướt lòng gà', 'Bánh tráng nướng Đà Lạt', 'Dâu tây thủy canh & Kem bơ béo ngậy'],
    bestSeason: 'Tháng 10 - Tháng 4 (Mùa khô, săn mây đồi chè, mùa hoa dã quỳ và mai anh đào nở rộ)',
    heroImage: 'https://smartland.vn/wp-content/uploads/2022/10/toan-canh-thanh-pho-da-lat-suong-mu.jpg',
    gallery: [
      { name: 'Hồ Xuân Hương Đà Lạt', image: 'https://2trip.vn/wp-content/uploads/2020/09/Ho-Xuan-Huong-Da-Lat-4.jpg' },
      { name: 'Đồi chè Cầu Đất', image: 'https://static.vinwonders.com/production/doi-che-cau-dat.jpg' },
      { name: 'Thác Dambri hùng vĩ', image: 'https://52hz.vn/wp-content/uploads/2022/01/thac-dambri-9.jpeg' },
      { name: 'Quảng trường Lâm Viên', image: 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/quang_truong_lam_vien_thumb_e7e4262d19.png' },
      { name: 'Đỉnh Langbiang huyền thoại', image: 'https://dalatreview.vn/wp-content/uploads/2023/08/329666825_595037048714323_227516769466023961_n.jpg' }
    ]
  },
  'Gia Lai': {
    title: 'Gia Lai & Kon Tum - Đôi Mắt Pleiku Huyền Tích & Nhà Rông Tây Nguyên',
    subtitle: 'Biển Hồ T’Nưng núi lửa cổ đại, Chư Đăng Ya hoa dã quỳ rực rỡ & Cồng chiêng đại ngàn',
    badge: 'National Heritage',
    esgText: 'ESG: 68 | LEI: 65',
    certText: 'Không Gian Văn Hóa Cồng Chiêng Tây Nguyên',
    description: 'Pleiku níu chân du khách với Biển Hồ T’Nưng xanh biếc tựa viên ngọc bích lọt thỏm giữa miệng núi lửa ngưng hoạt động hàng triệu năm, những đồi thông cổ thụ rợp bóng và tiếng chiêng trầm hùng bên bếp lửa nhà rông.',
    specialties: ['Phở hai tô (Phở khô Pleiku)', 'Gà nướng cơm lam sa lửa', 'Gỏi lá rừng Kon Tum 40 vị', 'Bò một nắng muối kiến Krông Pa', 'Cà phê nguyên chất Robusta'],
    bestSeason: 'Tháng 11 - Tháng 4 (Mùa hoa dã quỳ vàng ngập tràn triền đồi Chư Đăng Ya, mùa lễ hội cồng chiêng)',
    heroImage: 'https://cdn.xanhsm.com/2025/03/8d98d60d-bien-ho-pleiku-13.jpg',
    gallery: [
      { name: 'Biển Hồ T’Nưng Pleiku', image: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-4-800x612.jpg' },
      { name: 'Núi lửa Chư Đăng Ya', image: 'https://thanhnien.mediacdn.vn/Uploaded/maiha/2022_11_10/anh-3-3-3135.jpg' },
      { name: 'Nhà rông Kon Klor', image: 'https://image.vietgoing.com/editor/image_mwb1659681988.jpg' },
      { name: 'Nhà thờ gỗ Kon Tum', image: 'https://innotour.vn/image/catalog/blog-du-lich/kon-tum/pics/nha-tho-go-kon-tum-4.jpg' },
      { name: 'Chùa Minh Thành', image: 'https://media.gody.vn/images/gia-lai/chua-minh-thanh/11-2016/20161101090035-chua-minh-thanh-gody(11).jpg' }
    ]
  },
  'Đắk Lắk': {
    title: 'Đắk Lắk - Thủ Phủ Cà Phê Thế Giới & Sử Thi Hùng Tráng',
    subtitle: 'Bảo tàng Cà phê kiến trúc độc bản, Thác nước Dray Nur gầm vang & Buôn Đôn voi huyền thoại',
    badge: 'Cultural Heritage',
    esgText: 'ESG: 71 | LEI: 67',
    certText: 'Thủ Phủ Cà Phê Thế Giới Buôn Ma Thuột',
    description: 'Đắk Lắk là trái tim đại ngàn Tây Nguyên, quê hương của những rẫy cà phê bạt ngàn ngát hương hoa trắng, bảo tàng thế giới cà phê mang dáng dấp nhà dài Ê Đê, dòng sông Sêrêpôk chảy ngược cùng những thác nước kỳ vĩ tráng lệ.',
    specialties: ['Bún đỏ Buôn Ma Thuột', 'Gà đồng nướng chấm muối ớt rừng', 'Rượu cần men lá truyền thống', 'Cá lăng nấu măng chua sông Sêrêpôk', 'Cà phê Chồn thượng hạng'],
    bestSeason: 'Tháng 12 - Tháng 4 (Mùa hoa cà phê nở trắng muốt như tuyết, thời tiết mát dịu)',
    heroImage: 'https://trungnguyenlegend.com/wp-content/uploads/2022/11/cttvbo1-6.jpg',
    gallery: [
      { name: 'Bảo tàng Thế Giới Cà Phê', image: 'https://trungnguyenlegend.com/wp-content/uploads/2022/11/cttvbo1-6.jpg' },
      { name: 'Thác Dray Nur', image: 'https://tripmap.vn/wp-content/uploads/2021/07/thac-dray-nur-1627268728357.jpg' },
      { name: 'Hồ Lắk', image: 'https://statics.vinpearl.com/buon-ma-thuot-vietnam-08_1696090928.jpg' },
      { name: 'Buôn Đôn', image: 'https://cdn-i.vtcnews.vn/resize/th/upload/2023/07/09/voi-18114972.jpg' },
      { name: 'Hồ Tà Đùng', image: 'https://tinviettravel.com/uploads/tours/images/tay_nguyen/ho-ta-dung-dak-nong.jpg' }
    ]
  },
  'Quảng Trị': {
    title: 'Quảng Trị & Quảng Bình - Kỳ Quan Hang Động Đệ Nhất Thế Giới & Đất Lửa Hào Hùng',
    subtitle: 'Động Phong Nha, Động Thiên Đường thạch nhũ triệu năm, Cầu Hiền Lương & Địa đạo Vịnh Mốc',
    badge: 'UNESCO Natural Heritage',
    esgText: 'ESG: 76 | LEI: 72',
    certText: 'Kỳ Quan Thiên Nhiên Thế Giới UNESCO',
    description: 'Miền đất quy tụ những kỳ quan hang động vĩ đại nhất hành tinh tại Phong Nha - Kẻ Bàng, kết hợp cùng những di tích lịch sử thiêng liêng hào hùng gắn liền với khát vọng hòa bình của dân tộc.',
    specialties: ['Bánh khoái Quảng Trị giòn rụm', 'Bún hến Mai Xá', 'Cháo bột cá lóc Diên Sanh', 'Thịt trâu xào lá trơng', 'Chắt chắt xào bánh đa'],
    bestSeason: 'Tháng 3 - Tháng 8 (Mùa khô ráo, các hang động đón nắng vàng rực rỡ lấp lánh)',
    heroImage: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg',
    gallery: [
      { name: 'Động Thiên Đường', image: 'https://www.quangbinhtravel.vn/wp-content/uploads/2012/04/dongthienduong-1.jpg' },
      { name: 'Động Phong Nha', image: 'https://phongnhaexplorer.com/wp-content/uploads/2025/07/dongphongnha2-1024x715.jpg' },
      { name: 'Địa đạo Vịnh Mốc', image: 'https://mia.vn/media/uploads/blog-du-lich/dia-dao-vinh-moc-1-1710467866.jpg' },
      { name: 'Cầu Hiền Lương', image: 'https://media.vietravel.com/images/Content/du-lich-quang-tri-3.jpg' },
      { name: 'Thành Cổ Quảng Trị', image: 'https://nads.1cdn.vn/2024/01/18/W_1.dai-tuong-niem-liet-si-thanh-co-quang-tri-1972....jpg' }
    ]
  },
  'Thanh Hóa': {
    title: 'Thanh Hóa - Biển Sầm Sơn Sôi Động & Sinh Thái Pù Luông Xanh Ngắt',
    subtitle: 'Bãi biển Sầm Sơn danh tiếng, ruộng bậc thang Pù Luông thơ mộng & Thành Nhà Hồ ngàn năm',
    badge: 'UNESCO Heritage Site',
    esgText: 'ESG: 73 | LEI: 69',
    certText: 'Di sản Văn hóa Thế giới Thành Nhà Hồ',
    description: 'Thanh Hóa là cửa ngõ miền Trung với bờ biển Sầm Sơn sôi động, khu bảo tồn thiên nhiên Pù Luông hoang sơ tựa chốn bồng lai tiên cảnh cùng Thành Nhà Hồ - công trình kiến trúc đá độc nhất vô nhị ở Đông Nam Á.',
    specialties: ['Nem chua Thanh Hóa gia truyền', 'Chả tôm nướng than hoa', 'Bánh khoái tép Nồi đất', 'Gỏi cá nhệch Nga Sơn', 'Vịt Cổ Lũng Pù Luông'],
    bestSeason: 'Tháng 4 - Tháng 9 (Mùa tắm biển Sầm Sơn tuyệt hảo và ngắm lúa chín vàng Pù Luông)',
    heroImage: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg',
    gallery: [
      { name: 'Bãi biển Sầm Sơn', image: 'https://sunparadiseland.com/_next/image?url=https:%2F%2Fsun-ecommerce-cdn.azureedge.net%2Fecommerce%2Fservice-sites%2Fasset%2FSunParadiseLandQuangNinh%2Fgoogle-doc%2Fpost_id_31345%2FAD_4nXex57HvUCdJV6cNIazp-Sfdn2No2sqzDoRuycK8OQVkwBu56JQxwh9j9IYPAU7xmNXzF2-WaTQXM1dTdaxJUjiCoZn65k2JyLEY25oFyRv3MxipjcH7MxgbOrRQ68PJiyZJ8iu5T-Yi_vyZk3S3cF54mdTKbs0-BZKM4JJ2QQ4konnVsItU%253Ds2048.webp&w=1200&q=80' },
      { name: 'Ruộng bậc thang Pù Luông', image: 'https://m.yodycdn.com/products/anhruongbacthang1_m2b9i8yxd6fqow6fh1t.jpg' },
      { name: 'Thành Nhà Hồ UNESCO', image: 'https://static.vinwonders.com/production/toan-canh-di-tich-thanh-nha-ho.jpg' },
      { name: 'Suối cá thần Cẩm Lương', image: 'https://ticotravel.com.vn/wp-content/uploads/2021/05/suoi-ca-than-thanh-hoa-8.jpg' },
      { name: 'Biển Hải Tiến', image: 'https://static.vinwonders.com/production/dia-chi-bien-hai-tien.jpg' }
    ]
  },
  'Nghệ An': {
    title: 'Nghệ An - Bãi Biển Cửa Lò Trong Xanh & Quê Hương Bác Hồ Kính Yêu',
    subtitle: 'Bãi biển Cửa Lò trải dài cát mịn, Làng Sen Kim Liên thanh bình & Đảo Chè Thanh Chương',
    badge: 'National Cultural Heritage',
    esgText: 'ESG: 72 | LEI: 68',
    certText: 'Khu Di tích Quốc gia Đặc biệt Kim Liên',
    description: 'Nghệ An địa linh nhân kiệt với bãi biển Cửa Lò sóng êm cát mịn, Khu di tích Kim Liên lưu giữ tuổi thơ Bác Hồ với những mái tranh mộc mạc và ốc đảo chè Thanh Chương uốn lượn non xanh nước biếc.',
    specialties: ['Cháo lươn & Súp lươn xứ Nghệ', 'Mực nhảy nướng Cửa Lò', 'Tương Nam Đàn nức tiếng', 'Cam Xã Đoài mọng nước', 'Bánh mướt giò nóng'],
    bestSeason: 'Tháng 4 - Tháng 8 (Mùa hè biển Cửa Lò tuyệt đẹp, thích hợp nghỉ mát gia đình)',
    heroImage: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg',
    gallery: [
      { name: 'Bãi biển Cửa Lò', image: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg' },
      { name: 'Làng Sen quê Bác', image: 'https://ilooca-tourdb.itourism.vn/files/thumb/840/456/uploads/content/17022/68384d86a12a6.png' },
      { name: 'Đảo Chè Thanh Chương', image: 'https://ticotravel.com.vn/wp-content/uploads/2022/10/Dao-che-Thanh-Chuong-6.jpeg' },
      { name: 'Vườn quốc gia Pù Mát', image: 'https://media.vietnamplus.vn/images/a01c0e0c6ca85cd3c5d38871d88e83e0e4b18c51a63b4c988d3a06bd34290b47d0734ca05f9eb49adb08a32cb2e3af59cdb57feb901aea868e56e8a402356a73/0910-khe-kem-pu-mat.jpg' },
      { name: 'Biển Bãi Lữ', image: 'https://dulichkhatvongviet.com/wp-content/uploads/2014/07/bai-lu-nghe-an.jpg' }
    ]
  },
  'Hà Tĩnh': {
    title: 'Hà Tĩnh - Biển Thiên Cầm Đàn Trời & Ngã Ba Đồng Lộc Bất Tử',
    subtitle: 'Bãi biển Thiên Cầm hình cánh cung êm đềm, Ngã ba Đồng Lộc linh thiêng & Chùa Hương Tích',
    badge: 'National Heritage',
    esgText: 'ESG: 70 | LEI: 66',
    certText: 'Quần Thể Di Tích Quốc Gia Đặc Biệt',
    description: 'Hà Tĩnh nổi tiếng với cung biển Thiên Cầm tuyệt đẹp được ví như cung đàn trời ngân nga bên sóng vỗ, Chùa Hương Tích cổ tự ẩn mình trên đỉnh núi Hồng Lĩnh và Ngã Ba Đồng Lộc - biểu tượng bất tử của lòng dũng cảm.',
    specialties: ['Kẹo Cu đơ Hà Tĩnh giòn thơm', 'Mực nhảy Vũng Áng ngọt lịm', 'Bánh bèo Hà Tĩnh', 'Bưởi Phúc Trạch tiến vua', 'Gỏi cá đục Lộc Hà'],
    bestSeason: 'Tháng 4 - Tháng 8 (Khí hậu nhiều nắng, biển Thiên Cầm trong xanh êm đềm)',
    heroImage: 'https://zoomtravel.vn/upload/images/thien-cam-ha-tinh-1-min.jpg',
    gallery: [
      { name: 'Biển Thiên Cầm', image: 'https://zoomtravel.vn/upload/images/thien-cam-ha-tinh-1-min.jpg' },
      { name: 'Ngã Ba Đồng Lộc', image: 'https://static.vinwonders.com/production/thoi-diem-di-nga-ba-dong-loc.jpg' },
      { name: 'Chùa Hương Tích', image: 'https://cdn.baohatinh.vn/images/5c0e3df6f392cae5972c8105500d84182642ad8f46238526fddaf4a5ff633a59e3b9fc4f6b4de541067d96204805ebda/154d4222421t91554l0.jpg' },
      { name: 'Hồ Kẻ Gỗ', image: 'https://statics.vinpearl.com/ho-ke-go 1_1624870951.jpg' },
      { name: 'Hải Đăng Cửa Sót', image: 'https://cdn.daidoanket.vn/w1200/uploaded/images/2026/04/16/d32a8cb9-fba7-4dcf-b082-9801a25e06fc.jpg' }
    ]
  }
}

// State quản lý phóng to ảnh & chuyển đổi hình ảnh miêu tả của tỉnh thành
const selectedSpotlightImage = ref(null)
const isSpotlightModalOpen = ref(false)

watch(() => formDuLieu.diemDen, () => {
  selectedSpotlightImage.value = null
})

const currentSpotlight = computed(() => {
  const dest = formDuLieu.diemDen || 'Đà Nẵng'
  if (dest === ALL_DESTINATIONS) {
    return PROVINCE_SPOTLIGHTS['Đà Nẵng']
  }
  return PROVINCE_SPOTLIGHTS[dest] || PROVINCE_SPOTLIGHTS['Đà Nẵng']
})

const activeHeroImage = computed(() => {
  return selectedSpotlightImage.value || currentSpotlight.value?.heroImage
})

function chuyenSangLenLichTrinh(city) {
  if (city && city !== ALL_DESTINATIONS) {
    formDuLieu.diemDen = city
  }
  selectedSpotlightImage.value = null
  activeTab.value = 'planner'
  currentPlannerStep.value = 1
  cuonLenDauTrang()
  nextTick(() => {
    cuonLenDauTrang()
  })
}

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

// LỊCH TRÌNH KHỞI HÀNH & CHỌN NGÀY ĐI (THEO SCREENSHOT 3)
const todayIso = new Date().toISOString().split('T')[0]

const DEPARTURE_MONTHS = [
  { label: 'Tháng 10 2026', key: '2026-10', defaultDate: '2026-10-06' },
  { label: 'Tháng 11 2026', key: '2026-11', defaultDate: '2026-11-01' },
  { label: 'Tháng 12 2026', key: '2026-12', defaultDate: '2026-12-01' },
  { label: 'Tháng 1 2027', key: '2027-01', defaultDate: '2027-01-01' },
  { label: 'Tháng 2 2027', key: '2027-02', defaultDate: '2027-02-01' },
  { label: 'Tháng 3 2027', key: '2027-03', defaultDate: '2027-03-01' }
]

const selectedMonthKey = ref('2026-10')

function chonThangKhoiHanh(m) {
  selectedMonthKey.value = m.key
  formDuLieu.ngayBatDau = m.defaultDate
}

const ngayKetThucDisplay = computed(() => {
  if (!formDuLieu.ngayBatDau) return ''
  try {
    const parts = formDuLieu.ngayBatDau.split('-')
    if (parts.length !== 3) return ''
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const d = new Date(year, month, day)
    const days = Math.max(1, parseInt(formDuLieu.soNgay, 10) || 1)
    d.setDate(d.getDate() + (days - 1))
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  } catch (e) {
    return ''
  }
})

function dinhDangNgayTuan(dateStr) {
  if (!dateStr) return ''
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
    const dayName = dayNames[dt.getDay()]
    const dd = String(d).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    return `${dayName}, ${dd}/${mm}/${y}`
  } catch (e) {
    return dateStr
  }
}

// Đồng bộ tự động ngày kết thúc khi ngày bắt đầu hoặc số ngày thay đổi
watch([() => formDuLieu.ngayBatDau, () => formDuLieu.soNgay], () => {
  formDuLieu.ngayKetThuc = ngayKetThucDisplay.value
  if (formDuLieu.ngayBatDau && formDuLieu.ngayBatDau.length >= 7) {
    const key = formDuLieu.ngayBatDau.substring(0, 7)
    if (DEPARTURE_MONTHS.some(m => m.key === key)) {
      selectedMonthKey.value = key
    }
  }
}, { immediate: true })

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

// ==================== KIỂM TRA TÍNH KHẢ THI CỦA CHUYẾN ĐI (FEASIBILITY CHECK) ====================
const tripFeasibility = computed(() => {
  const budget = Number(formDuLieu.nganSach) || 0
  const days = Math.max(1, Number(formDuLieu.soNgay) || 1)
  const people = Math.max(1, Number(formDuLieu.soNguoi) || 1)
  const dest = formDuLieu.diemDen || 'Đà Nẵng'
  const freeOnly = Boolean(formDuLieu.freePlacesOnly)
  const perPersonPerDay = Math.round(budget / (days * people))

  // Định mức tối thiểu để có thể đi du lịch:
  // 1 ngày: tối thiểu 150.000đ/người (ăn 2 bữa nhẹ + xăng xe máy, không ở qua đêm)
  // Nhiều ngày: tối thiểu 250.000đ/người/ngày (homestay/dorm chia phòng tối thiểu ~120k + ăn 3 bữa ~100k + xăng xe ~30k)
  const minDailyPerPerson = days === 1 ? 150000 : 250000
  const minFeasibleBudget = days === 1 ? (people * 150000) : (days * people * 250000)

  if (freeOnly) {
    return {
      feasible: true,
      mode: 'free_places_only',
      perPersonPerDay,
      minFeasibleBudget,
      message: 'Chế độ phượt tự túc: AI chỉ xếp các điểm tham quan 100% miễn phí vé (0đ).'
    }
  }

  if (budget < minFeasibleBudget) {
    const maxFeasibleDays = Math.max(1, Math.floor(budget / (people * 250000)))
    return {
      feasible: false,
      reason: 'INSUFFICIENT_BUDGET',
      budget,
      days,
      people,
      perPersonPerDay,
      minDailyPerPerson,
      minFeasibleBudget,
      maxFeasibleDays,
      message: `Ngân sách ${dinhDangTien(budget)}đ không khả thi cho chuyến đi ${days} ngày ${people} người tại ${dest} (trung bình chỉ ~${dinhDangTien(perPersonPerDay)}đ/người/ngày). Số tiền này không đủ chi trả chỗ ở tối thiểu (~150.000đ/đêm) và ăn uống 3 bữa mỗi ngày.`,
      recommendation: {
        minBudget: minFeasibleBudget,
        suggestedDays: maxFeasibleDays,
        advice: `Bạn nên tăng ngân sách lên tối thiểu ${dinhDangTien(minFeasibleBudget)}đ, hoặc rút ngắn chuyến đi xuống ${maxFeasibleDays} ngày, hoặc chọn chế độ chỉ tham quan điểm miễn phí vé.`
      }
    }
  }

  return {
    feasible: true,
    perPersonPerDay,
    minFeasibleBudget
  }
})

// ==================== 5 PHÂN TẦNG NGÂN SÁCH THÔNG MINH ====================
const currentBudgetTier = computed(() => {
  const total = Number(formDuLieu.nganSach) || 3500000
  const days = Math.max(1, Number(formDuLieu.soNgay) || 3)
  const people = Math.max(1, Number(formDuLieu.soNguoi) || 1)
  const perDay = total / (days * people)

  if (total >= 20000000 && perDay >= 2500000) {
    return {
      key: 'T4',
      name: 'Xa Hoa / VIP Nghỉ Dưỡng',
      icon: '🟡',
      badge: '5 SAO XA HOA (30 TRIỆU+)',
      color: '#f59e0b',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Resort 5 sao quốc tế / Biệt thự biển riêng (InterContinental, Hyatt, Vinpearl)',
      foodDesc: 'Fine Dining, buffet tôm hùm 5 sao, ăn tối du thuyền riêng',
      transportDesc: 'Vé máy bay hạng thương gia / Xe limousine riêng đưa đón',
      ratios: { hotel: 0.45, food: 0.23, transport: 0.15, tickets: 0.12, reserve: 0.05 }
    }
  }

  if (perDay < 250000) {
    return {
      key: 'T0',
      name: 'Sinh Tồn / Phượt Bụi',
      icon: '🪨',
      badge: 'SIÊU TIẾT KIỆM (DƯỚI 250K/NGÀY)',
      color: '#64748b',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Hostel dorm / Homestay cộng đồng / Couchsurfing',
      foodDesc: 'Quán ăn vỉa hè, bánh mì que, bánh bèo hẻm, bún bình dân',
      transportDesc: 'Xe khách ghế ngồi / Đi bộ / Xe buýt nội đô',
      ratios: { hotel: 0.20, food: 0.45, transport: 0.20, tickets: 0.05, reserve: 0.10 }
    }
  }

  if (perDay < 600000) {
    return {
      key: 'T1',
      name: 'Tiết Kiệm / Sinh Viên',
      icon: '💚',
      badge: 'TIẾT KIỆM TỐI ƯU (1 - 2 TRIỆU)',
      color: '#10b981',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Nhà nghỉ tiêu chuẩn / Phòng riêng homestay giá mềm',
      foodDesc: 'Mì Quảng, cơm gà bình dân, hải sản tươi ven chợ',
      transportDesc: 'Xe khách giường nằm giá rẻ / Thuê xe máy vi vu',
      ratios: { hotel: 0.28, food: 0.35, transport: 0.22, tickets: 0.08, reserve: 0.07 }
    }
  }

  if (perDay < 1500000) {
    return {
      key: 'T2',
      name: 'Tiêu Chuẩn / Phổ Thông',
      icon: '💙',
      badge: 'TIÊU CHUẨN THOẢI MÁI',
      color: '#0284c7',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Khách sạn 3 sao có ăn sáng / Gần biển',
      foodDesc: 'Nhà hàng đặc sản, hải sản tươi sống, cafe view đẹp',
      transportDesc: 'Xe Limousine / Tàu hỏa ngắm cảnh / Thuê xe máy tốt',
      ratios: { hotel: 0.35, food: 0.28, transport: 0.20, tickets: 0.12, reserve: 0.05 }
    }
  }

  if (perDay < 3500000) {
    return {
      key: 'T3',
      name: 'Chất Lượng Cao / 4 Sao',
      icon: '💜',
      badge: '4 SAO CAO CẤP',
      color: '#8b5cf6',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Khách sạn 4 sao / Resort boutique / View biển hồ bơi vô cực',
      foodDesc: 'Nhà hàng hải sản lớn, lẩu hải sản, bar cocktail hoàng hôn',
      transportDesc: 'Vé máy bay khứ hồi / Thuê ô tô tự lái / Taxi trọn gói',
      ratios: { hotel: 0.40, food: 0.23, transport: 0.20, tickets: 0.12, reserve: 0.05 }
    }
  }

  return {
    key: 'T4',
    name: 'Xa Hoa / VIP Nghỉ Dưỡng',
    icon: '🟡',
    badge: '5 SAO XA HOA (30 TRIỆU+)',
    color: '#f59e0b',
    perPersonPerDay: Math.round(perDay),
    hotelDesc: 'Resort 5 sao quốc tế / Biệt thự biển riêng (InterContinental, Hyatt, Vinpearl)',
    foodDesc: 'Fine Dining, buffet tôm hùm 5 sao, ăn tối du thuyền riêng',
    transportDesc: 'Vé máy bay hạng thương gia / Xe limousine riêng đưa đón',
    ratios: { hotel: 0.45, food: 0.23, transport: 0.15, tickets: 0.12, reserve: 0.05 }
  }
})

// ==================== DỰ TOÁN CHI PHÍ THÔNG MINH (DYNAMIC BUDGET BREAKDOWN) ====================
const dynamicBudget = computed(() => {
  const total = Number(formDuLieu.nganSach) || 3500000
  const days = Math.max(1, Number(formDuLieu.soNgay) || 3)
  const nights = Math.max(1, days - 1)
  const people = Math.max(1, Number(formDuLieu.soNguoi) || 2)
  const isFreeOnly = Boolean(formDuLieu.freePlacesOnly)
  const tier = currentBudgetTier.value
  
  let ratios = { ...tier.ratios }
  if (isFreeOnly) {
    const nonTicketSum = ratios.hotel + ratios.food + ratios.transport + ratios.reserve
    ratios = {
      hotel: ratios.hotel / nonTicketSum,
      food: ratios.food / nonTicketSum,
      transport: ratios.transport / nonTicketSum,
      tickets: 0,
      reserve: ratios.reserve / nonTicketSum
    }
  }

  const hotel = Math.round(total * ratios.hotel)
  const food = Math.round(total * ratios.food)
  const transport = Math.round(total * ratios.transport)
  const tickets = isFreeOnly ? 0 : Math.round(total * ratios.tickets)
  const transportAndTickets = transport + tickets
  const reserve = Math.max(0, total - (hotel + food + transportAndTickets))

  const hotelPercent = Math.round(ratios.hotel * 100)
  const foodPercent = Math.round(ratios.food * 100)
  const transportPercent = Math.round((ratios.transport + ratios.tickets) * 100)
  const reservePercent = Math.max(1, 100 - (hotelPercent + foodPercent + transportPercent))

  return {
    total,
    hotel,
    hotelDesc: `${nights} đêm (~${Math.round(hotel / nights / 1000)}k/đêm)`,
    food,
    foodDesc: `Ăn uống (~${Math.round(food / days / people / 1000)}k/người/ngày)`,
    transportAndTickets,
    transitDesc: isFreeOnly ? `Di chuyển (${Math.round(transport / 1000)}k) + Vé 0đ (100% Free)` : `Di chuyển (${Math.round(transport / 1000)}k) + Vé chơi (${Math.round(tickets / 1000)}k)`,
    reserve,
    reserveDesc: `Dự phòng & mua quà (~${Math.round(reserve / 1000)}k)`,
    hotelPercent,
    foodPercent,
    transportPercent,
    reservePercent
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
  if (formDuLieu.nhaXeDaChon?.id === bus.id) {
    formDuLieu.nhaXeDaChon = null
  } else {
    formDuLieu.nhaXeDaChon = bus
    formDuLieu.phuongTien = 'xe khách'
  }
}

function chonTauHoa(train) {
  if (formDuLieu.tauDaChon?.id === train.id) {
    formDuLieu.tauDaChon = null
  } else {
    formDuLieu.tauDaChon = train
    formDuLieu.phuongTien = 'tàu hỏa'
  }
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
const modalDeleteVisible = ref(false)
const deleteTarget = ref(null)
const taoPlanError = ref('')
const lichTrinh = ref(null)
const selectedPlaces = ref([])
const customPlaceText = ref('')

function addCustomPlace() {
  const val = customPlaceText.value.trim()
  if (val && !selectedPlaces.value.includes(val)) {
    selectedPlaces.value.push(val)
  }
  customPlaceText.value = ''
}
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
  const tier = currentBudgetTier.value

  if (!tripFeasibility.value.feasible && !formDuLieu.freePlacesOnly) {
    return {
      type: 'budget-danger',
      icon: '🚨',
      tag: 'BẤT KHẢ THI',
      title: `Chưa khả thi: ${dinhDangTien(budget)}đ cho ${people} người ${formDuLieu.soNgay} ngày`,
      desc: tripFeasibility.value.message
    }
  }

  if (formDuLieu.freePlacesOnly) {
    return {
      type: 'budget-saving',
      icon: '🏖️',
      tag: '100% MIỄN PHÍ VÉ',
      title: `Chế độ tự túc & điểm tham quan 0đ: ${dinhDangTien(budget)}đ`,
      desc: 'AI chỉ ưu tiên các danh lam thắng cảnh biểu tượng tự nhiên, bãi biển, phố đi bộ, chợ đêm hoàn toàn miễn phí vé vào cổng.'
    }
  }

  if (tier.key === 'T0') {
    return {
      type: 'budget-danger',
      icon: tier.icon,
      tag: tier.badge,
      title: `Chuyến đi sinh tồn: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Ngân sách thử thách bản lĩnh phượt thủ! Ngắm cảnh đẹp miễn phí, ăn bánh mì que & chè hẻm ngon bổ rẻ.'
    }
  }

  if (tier.key === 'T1') {
    return {
      type: 'budget-saving',
      icon: tier.icon,
      tag: tier.badge,
      title: `Gói tiết kiệm thông minh: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Mức ngân sách cực chuẩn cho sinh viên & gia đình trẻ! Xe khách giường nằm, homestay ấm cúng và ăn sập đặc sản bản địa.'
    }
  }

  if (tier.key === 'T2') {
    return {
      type: 'budget-cozy',
      icon: tier.icon,
      tag: tier.badge,
      title: `Tiêu chuẩn thoải mái: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Chuyến đi vừa vặn, nghỉ ngơi khách sạn 3 sao gần biển, thưởng thức hải sản tươi ngon và cafe view cực chill!'
    }
  }

  if (tier.key === 'T3') {
    return {
      type: 'budget-comfort',
      icon: tier.icon,
      tag: tier.badge,
      title: `Trải nghiệm chất lượng cao: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Thoải mái tận hưởng khách sạn 4 sao, nhà hàng hải sản phong phú và các điểm check-in hấp dẫn nhất!'
    }
  }

  return {
    type: 'budget-luxury',
    icon: tier.icon,
    tag: tier.badge,
    title: `Nghỉ dưỡng thượng lưu 5 sao: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
    desc: 'Đẳng cấp đại gia Miền Trung! Resort 5 sao quốc tế, buffet tôm hùm, ăn tối du thuyền lãng mạn và vé VIP không cần xếp hàng.'
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

const userLevelInfo = computed(() => {
  const trips = nguoiDung.value?.completed_trips || 0
  if (trips >= 10) return { title: 'Thám Hiểm Gia', icon: 'crown', color: '#8b5cf6' }
  if (trips >= 5) return { title: 'Lữ Khách Sành Sỏi', icon: 'rocket', color: '#f59e0b' }
  if (trips >= 2) return { title: 'Phượt Thủ Tích Cực', icon: 'luggage', color: '#3b82f6' }
  return { title: 'Tân Thủ Khám Phá', icon: 'sprout', color: '#10b981' }
})

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

// TÌM KIẾM, PHÂN LOẠI & THU GỌN GỢI Ý ĐỊA ĐIỂM (BƯỚC 3 PLANNER)
const searchPlacePickerQuery = ref('')
const placePickerActiveTab = ref('all')
const isPickerExpanded = reactive({
  attraction: false,
  restaurant: false,
  hotel: false,
  cafe: false
})

function togglePickerExpand(category) {
  isPickerExpanded[category] = !isPickerExpanded[category]
}

const filteredAttractions = computed(() => {
  const q = searchPlacePickerQuery.value.trim().toLowerCase()
  if (!q) return attractionsList.value
  return attractionsList.value.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
})

const filteredRestaurants = computed(() => {
  const q = searchPlacePickerQuery.value.trim().toLowerCase()
  if (!q) return restaurantsList.value
  return restaurantsList.value.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
})

const filteredHotels = computed(() => {
  const q = searchPlacePickerQuery.value.trim().toLowerCase()
  if (!q) return hotelsList.value
  return hotelsList.value.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
})

const filteredCafes = computed(() => {
  const q = searchPlacePickerQuery.value.trim().toLowerCase()
  if (!q) return cafesList.value
  return cafesList.value.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
})

const totalFilteredPlacesCount = computed(() => {
  return filteredAttractions.value.length + filteredRestaurants.value.length + filteredHotels.value.length + filteredCafes.value.length
})

function getVisiblePlaces(list, category) {
  if (searchPlacePickerQuery.value.trim() || isPickerExpanded[category] || placePickerActiveTab.value === category) {
    return list
  }
  return list.slice(0, 8)
}

function removeSelectedPlace(name) {
  const idx = selectedPlaces.value.indexOf(name)
  if (idx > -1) {
    selectedPlaces.value.splice(idx, 1)
  }
}

function clearAllSelectedPlaces() {
  selectedPlaces.value = []
}

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
          .bindPopup(`<div class="map-popup-card"><b>${index + 1}. ${stop.place}</b><br/><small>📍 ${stop.address || ''}</small><br/><a href="${googleMapsSearchUrl(stop)}" target="_blank" class="popup-gmap-link" style="color: #0284c7; font-weight: 600; text-decoration: underline; margin-top: 4px; display: inline-block;">Xem trên Google Maps ↗</a></div>`)
          .addTo(routingLayerGroup);
          
        marker.on('click', () => {
          selectedMapPlace.value = stop;
          if (routingMap) {
            routingMap.flyTo([stop.latitude, stop.longitude], 16, { duration: 0.6 });
          }
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
  selectedMapPlace.value = act;
  if (act.latitude && act.longitude && routingMap) {
    routingMap.flyTo([act.latitude, act.longitude], 16, { duration: 0.8 });
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
  // 1. Nếu là hoạt động đầu tiên của Ngày 1: Chặng khởi hành từ nơi xuất phát đến điểm đến (Yêu cầu 3)
  if (day && day.day === 1 && actIndex === 0) {
    const origin = formDuLieu.diemKhoiHanh || 'Hà Nội';
    const bus = formDuLieu.nhaXeDaChon || lichTrinh.value?.transit_summary?.selected_bus;
    const dist = Number(lichTrinh.value?.transit_summary?.estimated_distance_km || transitRouteInfo.value?.estimatedDistanceKm || 669);
    const dur = bus?.duration || (dist > 500 ? '13 – 14 giờ' : '4 – 6 giờ');
    return {
      from: origin,
      distance: dist,
      duration: dur,
      cost: bus?.price ? `${dinhDangTien(bus.price)}đ/vé` : 'Đã tính vé',
      mode: bus ? `${bus.name} (${bus.type})` : 'Xe khách giường nằm VIP'
    };
  }

  // 2. Nếu là hoạt động đầu tiên của các ngày tiếp theo: Di chuyển từ khách sạn lưu trú
  if (day && actIndex === 0) {
    const hotel = lichTrinh.value?.hotel_recommendation;
    const fromName = hotel?.name || 'Khách sạn lưu trú';
    let dist = 3.2;
    let dur = '10 - 15 phút';
    if (hotel?.latitude && hotel?.longitude && act.latitude && act.longitude) {
      const calc = tinhKhoangCachVaThoiGian(hotel, act);
      if (calc && calc.distKm > 0.1) {
        dist = calc.distKm;
        dur = `${calc.phut} phút`;
      }
    }
    return {
      from: fromName,
      distance: dist,
      duration: dur,
      cost: `~${Math.round(dist * 14000 / 1000) * 1000}đ`,
      mode: dist < 1.5 ? 'Đi bộ thư thả' : dist < 5 ? 'Xe máy tiện lợi' : 'Ô tô / Taxi'
    };
  }

  // 3. Dữ liệu có cấu trúc từ backend
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

  // 4. Dữ liệu trích xuất từ chuỗi mô tả nếu có
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

  // 5. Tính toán trực tiếp theo tọa độ điểm trước đó trong ngày
  if (day && day.activities && actIndex > 0) {
    const prev = day.activities[actIndex - 1];
    if (prev && prev.latitude && prev.longitude && act.latitude && act.longitude) {
      const calc = tinhKhoangCachVaThoiGian(prev, act);
      if (calc && calc.distKm > 0.1 && calc.distKm < 150) {
        const cost = Math.round(calc.distKm * 14000 / 1000) * 1000;
        return {
          from: prev.name || prev.place || 'Điểm trước',
          distance: calc.distKm,
          duration: `${calc.phut} phút`,
          cost: `~${cost.toLocaleString('vi-VN')}đ`,
          mode: `${calc.phuongTien} ${calc.labelPhuongTien}`
        };
      }
    } else if (prev) {
      return {
        from: prev.place || prev.name || 'Điểm trước',
        distance: 2.8,
        duration: '10 - 15 phút',
        cost: '~35.000đ',
        mode: 'Xe máy / Taxi'
      };
    }
  }

  return null;
}

// ==================== MAP VIEW TOGGLE & TRANSIT MICRO-UX LOGIC ====================
const itineraryViewMode = ref('split') // 'timeline' | 'split' | 'map'
const daLuuLichTrinhHienTai = ref(false)
const thongBaoLuuThanhCong = ref(false)
const hienModalDoiLichTrinh = ref(false)
const selectedMapPlace = ref(null)

// ==================== PHẦN 2: NHẮC LƯU LỊCH TRÌNH TRƯỚC KHI CHUYỂN TAB ====================
const hienModalNhacLuu = ref(false)
const pendingTabSwitch = ref(null) // tab name cần chuyển đến

// ==================== PHẦN 3: XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU ====================
const hienModalChiTietTrip = ref(false)
const xemTripChiTiet = ref(null) // trip object đang xem chi tiết
const xemNgayChiTiet = ref(null) // day object đang xem chi tiết (null = xem list ngày)

// Tối ưu danh sách không bị dài dòng (Yêu cầu 2)
const timelineDensity = ref('compact') // 'compact' | 'expanded'
const showAllDays = ref(false) // false: chỉ xem ngày selectedDay; true: xem tất cả các ngày
const selectedSessionFilter = ref('all') // 'all' | 'morning' | 'noon' | 'afternoon' | 'evening'
const expandedCardKey = ref(null)

function toggleExpandCard(key) {
  expandedCardKey.value = expandedCardKey.value === key ? null : key
}

function filterActivitiesBySession(activities) {
  if (!activities) return []
  if (selectedSessionFilter.value === 'all') return activities
  return activities.filter(act => {
    const time = act.time || '08:00'
    const hour = parseInt(time.split(':')[0]) || 8
    const type = act.type || ''
    if (selectedSessionFilter.value === 'morning') {
      return hour < 11 || type === 'breakfast'
    } else if (selectedSessionFilter.value === 'noon') {
      return (hour >= 11 && hour < 14) || type === 'lunch'
    } else if (selectedSessionFilter.value === 'afternoon') {
      return (hour >= 14 && hour < 18) || type === 'checkin'
    } else if (selectedSessionFilter.value === 'evening') {
      return hour >= 18 || type === 'dinner'
    }
    return true
  })
}

function kichHoatCheDoFreePlaces() {
  formDuLieu.freePlacesOnly = true
  // Sau khi bật free-places, kiểm tra xem hotel+transport có vừa ngân sách không
  // Nếu không, tự động rút ngắn số ngày cho phù hợp
  const budget = Number(formDuLieu.nganSach) || 3000000
  const people = Number(formDuLieu.soNguoi) || 2
  const busPrice = Number(formDuLieu.nhaXeDaChon?.price || 320000) * people * 2
  const hotelPerNight = Number(formDuLieu.yeuCauKhachSan?.priceHint || 150000)
  const hotelCostPerNight = hotelPerNight <= 300000 ? hotelPerNight * people : hotelPerNight * Math.max(1, Math.ceil(people / 2))
  // Chi phí ăn mỗi ngày (chỉ bữa ăn, không có vé)
  const foodPerDay = 140000 * people
  const costPerDay = hotelCostPerNight + foodPerDay
  // Số ngày tối đa có thể sau khi trừ xe
  const remaining = Math.max(0, budget - busPrice)
  const maxDays = remaining > 0 && costPerDay > 0 ? Math.max(1, Math.floor(remaining / costPerDay)) : 1
  // Nếu số ngày hiện tại quá lớn, auto rút về vừa vặn
  if (Number(formDuLieu.soNgay) > maxDays) {
    formDuLieu.soNgay = maxDays
    personalityToast.value = { icon: '✂️', title: 'Tự động điều chỉnh!', desc: `Đã rút về ${maxDays} ngày + bật 100% Điểm Miễn Phí để vừa ngân sách ${dinhDangTien(budget)}đ!` }
  } else {
    personalityToast.value = { icon: '🌿', title: 'Đã bật Free Places!', desc: 'Tất cả vé tham quan sẽ là 0đ — tiết kiệm tối đa!' }
  }
  setTimeout(() => { personalityToast.value = null }, 5000)
  taoLichTrinh()
}

function rutNganNgayPhuHop() {
  const people = Number(formDuLieu.soNguoi) || 2
  const budget = Number(formDuLieu.nganSach) || 3000000
  // Chi phí vé xe khứ hồi (cố định)
  const busPrice = Number(formDuLieu.nhaXeDaChon?.price || 320000) * people * 2
  // Chi phí khách sạn mỗi đêm (theo loại: dorm/person hay phòng)
  const hotelPerNight = Number(formDuLieu.yeuCauKhachSan?.priceHint || 150000)
  const hotelCostPerNight = hotelPerNight <= 300000
    ? hotelPerNight * people
    : hotelPerNight * Math.max(1, Math.ceil(people / 2))
  // Chi phí ăn mỗi ngày + di chuyển nội tỉnh
  const foodPerDay = 140000 * people
  const localTransportPerDay = 75000 * Math.max(1, Math.ceil(people / 2))
  // Chi phí vé tham quan (ước tính 30k/người/ngày nếu không free-only)
  const ticketPerDay = formDuLieu.freePlacesOnly ? 0 : 30000 * people
  const costPerDay = hotelCostPerNight + foodPerDay + localTransportPerDay + ticketPerDay
  // Tính số ngày tối đa
  const remaining = Math.max(0, budget - busPrice)
  const calculatedDays = costPerDay > 0 ? Math.max(1, Math.min(7, Math.floor(remaining / costPerDay))) : 1
  const oldDays = Number(formDuLieu.soNgay)
  formDuLieu.soNgay = calculatedDays
  personalityToast.value = { icon: '✂️', title: `Đã rút ${oldDays} → ${calculatedDays} ngày!`, desc: `Vừa vặn ngân sách ${dinhDangTien(budget)}đ — lịch trình mới đang được tạo...` }
  setTimeout(() => { personalityToast.value = null }, 5000)
  taoLichTrinh()
}

const googleMapsDayRouteUrl = computed(() => {
  if (!lichTrinh.value?.daysList) return 'https://www.google.com/maps'
  const currentDay = lichTrinh.value.daysList.find(d => d.day === selectedDay.value) || lichTrinh.value.daysList[0]
  return taoLinkGoogleMapsChoNgay(currentDay)
})

function tinhChiPhiKhachSan(plan) {
  if (!plan?.hotel_recommendation) return 0
  const nights = Math.max(1, plan.daysList?.length || plan.days?.length || formDuLieu.soNgay || 5)
  const people = Number(plan.people) || Number(formDuLieu.soNguoi) || 2
  const budget = Number(plan.target_budget || formDuLieu.nganSach || 3000000)
  const aiPrice = Number(plan.hotel_recommendation.price_per_night) || 850000

  // Tính ngưỡng giá khách sạn tối đa hợp lý theo ngân sách (tối đa 30% ngân sách cho khách sạn)
  const maxHotelBudget = budget * 0.30
  const maxPricePerNight = nights > 0 ? Math.round(maxHotelBudget / nights) : 300000

  // Nếu AI gợi ý khách sạn quá đắt so với ngân sách, dùng giá phù hợp
  const effectivePrice = Math.min(aiPrice, maxPricePerNight)

  // Homestay, dorm, hostel (<= 300.000đ): giá theo người/đêm (90k * 2 người * 5 đêm = 900.000đ)
  // Khách sạn (> 300.000đ): giá theo phòng (1 phòng cho 2 người)
  if (effectivePrice <= 300000) {
    return Math.round(effectivePrice * people * nights)
  }
  const rooms = Math.max(1, Math.ceil(people / 2))
  return Math.round(effectivePrice * rooms * nights)
}

function dongBoChiPhiLichTrinh() {
  if (!lichTrinh.value) return
  const plan = lichTrinh.value
  const people = Number(plan.people) || Number(formDuLieu.soNguoi) || 2
  const days = Math.max(1, plan.daysList?.length || plan.days?.length || formDuLieu.soNgay || 5)

  // 1. Chi phí khách sạn chính xác (khắc phục lỗi 90k * 2 người * 5 đêm = 900k)
  const realHotel = tinhChiPhiKhachSan(plan)

  // 2. Chi phí vé xe di chuyển liên tỉnh khứ hồi + di chuyển nội tỉnh
  const busPrice = Number(formDuLieu.nhaXeDaChon?.price || plan.transit_summary?.selected_bus?.price || 320000)
  const roundTripBus = busPrice * people * 2
  const localTransport = days * 75000 * Math.max(1, Math.ceil(people / 2))
  const realTransit = roundTripBus + localTransport

  // 3. Chi phí các hoạt động (ăn uống + vé tham quan)
  let realFood = 0
  let realTickets = 0
  const allDays = plan.daysList || plan.days || []
  allDays.forEach(d => {
    (d.activities || []).forEach(a => {
      const c = Number(a.estimated_cost) || 0
      if (['breakfast', 'lunch', 'dinner', 'restaurant'].includes(a.type)) {
        realFood += c * people
      } else if (['attraction', 'checkin'].includes(a.type)) {
        realTickets += c * people
      }
    })
  })

  if (realFood === 0) {
    realFood = days * people * 140000
  }
  if (formDuLieu.freePlacesOnly || plan.free_places_only) {
    realTickets = 0
  }

  const subtotal = realHotel + realTransit + realFood + realTickets
  const realReserve = Math.round(subtotal * 0.08)
  const realTotal = subtotal + realReserve

  if (!plan.budget_breakdown) plan.budget_breakdown = {}
  plan.budget_breakdown.hotel = realHotel
  plan.budget_breakdown.transportation = realTransit
  plan.budget_breakdown.food = realFood
  plan.budget_breakdown.tickets = realTickets
  plan.budget_breakdown.reserve = realReserve

  // Bảo toàn ngân sách mong muốn của người dùng và phát hiện BÁO ĐỎ vượt ngân sách (Yêu cầu 1)
  const userTargetBudget = Number(plan.target_budget || formDuLieu.nganSach || 3000000)
  plan.target_budget = userTargetBudget
  plan.user_budget = userTargetBudget
  plan.calculated_total = realTotal
  plan.total_budget = realTotal

  const isOver = realTotal > userTargetBudget * 1.05
  plan.is_over_budget = isOver
  plan.over_amount = Math.max(0, realTotal - userTargetBudget)
  plan.over_percent = userTargetBudget > 0 ? Math.round((plan.over_amount / userTargetBudget) * 100) : 0

  if (!plan.budget_audit) plan.budget_audit = {}
  plan.budget_audit.target_budget = userTargetBudget
  plan.budget_audit.calculated_total = realTotal
  plan.budget_audit.is_over_budget = isOver
  plan.budget_audit.over_amount = plan.over_amount
  plan.budget_audit.fit_status = isOver ? 'over' : (realTotal < userTargetBudget * 0.75 ? 'under' : 'optimal')
  if (isOver) {
    plan.budget_audit.fit_message = `CẢNH BÁO BÁO ĐỎ: Kế hoạch thực tế (${dinhDangTien(realTotal)}đ) vượt quá khả năng tài chính bạn đã chọn (${dinhDangTien(userTargetBudget)}đ) khoảng +${dinhDangTien(plan.over_amount)}đ (+${plan.over_percent}%)!`
    plan.budget_audit.advice = 'Khuyến nghị: Vé xe và khách sạn đã chiếm phần lớn ngân sách. Bạn nên bật "100% Điểm Miễn Phí" hoặc giảm bớt số ngày để vừa vặn tài chính.'
  }
  if (!plan.budget_audit.audit_breakdown) plan.budget_audit.audit_breakdown = {}
  plan.budget_audit.audit_breakdown.hotel = realHotel
  plan.budget_audit.audit_breakdown.transit = realTransit
  plan.budget_audit.audit_breakdown.food = realFood
  plan.budget_audit.audit_breakdown.tickets = realTickets
}

async function luuLichTrinhHienTai() {
  if (!lichTrinh.value) return

  const localTripsKey = 'my_saved_trips'
  let savedLocal = []
  try {
    const raw = localStorage.getItem(localTripsKey)
    if (raw) savedLocal = JSON.parse(raw)
  } catch (e) {
    savedLocal = []
  }

  const tripToSave = {
    ...lichTrinh.value,
    _id: lichTrinh.value._id || lichTrinh.value.tripId || ('local-' + Date.now()),
    created_at: lichTrinh.value.created_at || new Date().toISOString()
  }

  const existingIdx = savedLocal.findIndex(t => t._id === tripToSave._id)
  if (existingIdx >= 0) {
    savedLocal[existingIdx] = tripToSave
  } else {
    savedLocal.unshift(tripToSave)
  }
  localStorage.setItem(localTripsKey, JSON.stringify(savedLocal))

  if (nguoiDung.value) {
    try {
      await api.post('/social/my-trips', tripToSave)
      await taiChuyenDiCuaToi()
    } catch (e) {
      console.warn('Lỗi lưu cloud:', e.message)
    }
  } else {
    myTripsList.value = savedLocal
  }

  daLuuLichTrinhHienTai.value = true
  thongBaoLuuThanhCong.value = true
  personalityToast.value = {
    icon: '💾',
    title: 'Đã lưu lịch trình thành công!',
    desc: nguoiDung.value 
      ? 'Chuyến đi đã được lưu an toàn vào tài khoản của bạn.' 
      : 'Chuyến đi đã được lưu trên thiết bị của bạn. Bạn có thể mở xem lại tại tab "Chuyến đi đã lưu"!'
  }
  setTimeout(() => {
    thongBaoLuuThanhCong.value = false
    personalityToast.value = null
  }, 6000)
}

function chonDoiThongSo() {
  hienModalDoiLichTrinh.value = false
  currentPlannerStep.value = 1
  activeTab.value = 'planner'
  nextTick(() => {
    const el = document.getElementById('step-indicator-bar') || document.querySelector('.planner-layout')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

async function chonAILenPhuongAnMoi() {
  hienModalDoiLichTrinh.value = false
  daLuuLichTrinhHienTai.value = false
  await taoLichTrinh()
}

function chonDoiTinhThanh() {
  hienModalDoiLichTrinh.value = false
  activeTab.value = 'explore'
  nextTick(() => {
    window.scrollTo({ top: 400, behavior: 'smooth' })
  })
}

function googleMapsSearchUrl(place) {
  if (!place) return 'https://www.google.com/maps'
  const name = place.place || place.name || ''
  const addr = place.address || formDuLieu.diemDen || 'Việt Nam'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + addr)}`
}

function getSampleReviewText(place) {
  const name = (place.place || place.name || '').toLowerCase()
  if (name.includes('bãi') || name.includes('biển')) {
    return 'Bãi biển rất sạch và đẹp, nước trong xanh cát trắng mịn. Buổi sáng tắm biển ngắm bình minh tuyệt vời, có nhiều dịch vụ thể thao biển.'
  }
  if (name.includes('esco') || name.includes('restaurant') || name.includes('quán') || name.includes('cơm') || name.includes('bánh') || name.includes('bún')) {
    return 'Quán rộng đẹp, view biển thoáng mát, đồ ăn nêm nếm đậm đà chuẩn vị miền Trung. Nhân viên phục vụ nhanh nhẹn nhiệt tình.'
  }
  if (name.includes('cafe') || name.includes('cà phê') || name.includes('chill')) {
    return 'Không gian quán cực chill và nhiều góc check-in triệu view. Đồ uống pha chế ngon, nhạc nhẹ nhàng thư giãn.'
  }
  return 'Địa điểm rất đáng để ghé thăm trong chuyến đi, không gian rộng rãi, cảnh quan ấn tượng và chụp ảnh rất đẹp.'
}

function moModalDoiDiaDiemTuMap(place) {
  if (!place || !lichTrinh.value?.daysList) return
  const currentDayIdx = selectedDay.value - 1
  const day = lichTrinh.value.daysList[currentDayIdx]
  if (!day) return
  const actIdx = day.activities.findIndex(a => a.place === place.place || a.place === place.name)
  if (actIdx >= 0) {
    moModalDoiDiaDiem(currentDayIdx, actIdx, day.activities[actIdx].type)
  } else {
    moModalDoiDiaDiem(currentDayIdx, 0, place.type || 'attraction')
  }
}

function laYeuThich(placeId) {
  if (!placeId) return false
  return favoritesList.value.some(p => p._id === placeId || p === placeId)
}

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
  let phuongTien = 'car'
  let labelPhuongTien = 'Ô tô / Taxi'

  if (distKm < 1.2) {
    phuongTien = 'walk'
    phut = Math.max(5, Math.round(distKm * 12))
    labelPhuongTien = 'Đi bộ thư thả'
  } else if (distKm < 5) {
    phuongTien = 'bike'
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
        icon: 'alerttriangle',
        title: 'Lịch trình sát giờ',
        desc: `Hai điểm chỉ cách nhau ${gapPhut} phút nhưng cần ~${phut} phút di chuyển. Bạn có thể bị vội!`
      }
    }
  }

  if (distKm > 18) {
    canhBao = {
      type: 'warning-far',
      icon: 'alertcircle',
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

// ==================== PHẦN 2: XÁC NHẬN LƯU TRƯỚC KHI CHUYỂN TAB ====================
// Wrapper để chuyển tab có kiểm tra lưu lịch trình chưa lưu
function chuyenTab(tabName) {
  // Nếu đang ở planner, có lịch trình, và chưa lưu → hỏi trước
  if (activeTab.value === 'planner' && lichTrinh.value && !daLuuLichTrinhHienTai.value) {
    pendingTabSwitch.value = tabName
    hienModalNhacLuu.value = true
    return
  }
  activeTab.value = tabName
}

async function dongYLuuVaChuyenTab() {
  await luuLichTrinhHienTai()
  hienModalNhacLuu.value = false
  if (pendingTabSwitch.value) {
    activeTab.value = pendingTabSwitch.value
    pendingTabSwitch.value = null
  }
}

function khongLuuVaChuyenTab() {
  hienModalNhacLuu.value = false
  if (pendingTabSwitch.value) {
    activeTab.value = pendingTabSwitch.value
    pendingTabSwitch.value = null
  }
}

function huyChuyenTab() {
  hienModalNhacLuu.value = false
  pendingTabSwitch.value = null
}

// ==================== PHẦN 3: MỞ CHI TIẾT CHUYẾN ĐI ĐÃ LƯU ====================
function xemChiTietChuyenDi(trip) {
  xemTripChiTiet.value = trip
  xemNgayChiTiet.value = null
  hienModalChiTietTrip.value = true
}

watch(activeTab, (newTab) => {
  if (newTab === 'planner') {
    // Luôn cuộn lên đầu trang ngay lập tức để người dùng thấy ảnh Miền Trung (Yêu cầu 5)
    cuonLenDauTrang()
    nextTick(() => {
      cuonLenDauTrang()
    })
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
      dongBoChiPhiLichTrinh()
    } catch (e) {
      console.error(e)
    }
  }

  // Tải danh sách chuyến đi đã lưu từ bộ nhớ máy (cho cả khách chưa đăng nhập)
  try {
    const localSaved = localStorage.getItem('my_saved_trips')
    if (localSaved) {
      const parsedLocal = JSON.parse(localSaved)
      if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
        myTripsList.value = parsedLocal
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc my_saved_trips:', e.message)
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
    attraction: 'Thắng cảnh',
    restaurant: 'Ẩm thực',
    cafe: 'Cafe & Bar',
    hotel: 'Khách sạn'
  }
  return map[type] || 'Địa điểm'
}

function getBadgeInfo(act) {
  if (!act) return { icon: 'pin', label: 'Hoạt động', class: 'badge-attraction' }
  if (act.type) {
    const map = {
      breakfast: { icon: 'sunrise', label: act.label || 'Ăn sáng', class: 'badge-breakfast' },
      lunch: { icon: 'utensils', label: act.label || 'Ăn trưa', class: 'badge-lunch' },
      dinner: { icon: 'utensils', label: act.label || 'Ăn tối', class: 'badge-dinner' },
      checkin: { icon: 'hotel', label: act.label || 'Nhận phòng', class: 'badge-hotel' },
      checkout: { icon: 'hotel', label: act.label || 'Trả phòng', class: 'badge-hotel' },
      cafe: { icon: 'coffee', label: act.label || 'Cafe & Chill', class: 'badge-cafe' },
      attraction: { icon: 'landmark', label: act.label || 'Tham quan / Check-in', class: 'badge-attraction' }
    }
    if (map[act.type]) return map[act.type]
  }
  return { icon: 'camera', label: 'Tham quan / Check-in', class: 'badge-attraction' }
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
  if (!tripFeasibility.value.feasible && !formDuLieu.freePlacesOnly) {
    taoPlanError.value = tripFeasibility.value.message || 'Yêu cầu không khả thi về ngân sách. Vui lòng tăng ngân sách hoặc chọn chế độ chỉ đi điểm miễn phí vé.';
    currentPlannerStep.value = 2;
    return;
  }

  formDuLieu.soThich = chuoiSoThich.value ? chuoiSoThich.value.split(',').map(s => s.trim()).filter(Boolean) : []
  dangTao.value = true
  lichTrinh.value = null
  hienCompletionBanner.value = false
  taoPlanError.value = ''

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
      free_places_only: Boolean(formDuLieu.freePlacesOnly),
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
    // Đồng bộ tính toán chi phí khách sạn và ngân sách thực tế đúng với lịch trình (Yêu cầu 2)
    dongBoChiPhiLichTrinh()
    daLuuLichTrinhHienTai.value = false
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
    const msg = e?.response?.data?.error || e.message;
    if (e?.response?.data?.is_unfeasible) {
      taoPlanError.value = `⛔ Chuyến đi không thể thực hiện: ${msg}`;
      currentPlannerStep.value = 2;
    } else {
      taoPlanError.value = 'Quá trình tạo lịch trình gặp sự cố: ' + msg;
    }
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
  dongBoChiPhiLichTrinh()
  daLuuLichTrinhHienTai.value = true
  activeTab.value = 'planner'
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    renderLeafletMap()
  })
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
  const tenChuyen = `${trip.days?.length || (trip.daysList?.length) || 0} ngày tại ${trip.destination}`
  const xacNhan = confirm(`Bạn có chắc muốn xóa chuyến đi "${tenChuyen}" không?\n\n⚠️ Hành động này không thể hoàn tác.`)
  if (!xacNhan) return
  try {
    if (trip._id && !trip._id.startsWith('local-')) {
      await api.delete(`/social/trips/${trip._id}`)
    }
  } catch (e) {
    console.warn('Lỗi xóa trên server:', e.message)
  }
  // Xóa khỏi danh sách local và state
  myTripsList.value = myTripsList.value.filter(t => t._id !== trip._id)
  try {
    const raw = localStorage.getItem('my_saved_trips')
    if (raw) {
      const arr = JSON.parse(raw).filter(t => t._id !== trip._id)
      localStorage.setItem('my_saved_trips', JSON.stringify(arr))
    }
  } catch (e) {}
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
  if (code === 0) return 'sun'
  if (code <= 3) return 'cloudsun'
  if (code <= 48) return 'wind'
  if (code <= 67 || code <= 82) return 'cloudrain'
  return 'cloudlightning'
}

function moTaThoiTiet(code) {
  if (code === 0) return 'Trời nắng đẹp'
  if (code <= 3) return 'Có mây nhẹ'
  if (code <= 48) return 'Sương mù nhẹ'
  if (code <= 67 || code <= 82) return 'Có mưa rào'
  return 'Dông bão'
}


// --- TRIPS LOGIC INJECTED ---
const selectedTrips = ref([])
const isSelectAllTrips = computed(() => myTripsList.value.length > 0 && selectedTrips.value.length === myTripsList.value.length)

function toggleTripSelection(id) {
  const idx = selectedTrips.value.indexOf(id)
  if (idx > -1) selectedTrips.value.splice(idx, 1)
  else selectedTrips.value.push(id)
}

function toggleSelectAllTrips() {
  if (isSelectAllTrips.value) {
    selectedTrips.value = []
  } else {
    selectedTrips.value = myTripsList.value.map(t => t._id)
  }
}

function promptDeleteSelected() {
  if (!selectedTrips.value.length) return
  deleteTarget.value = 'selected'
  modalDeleteVisible.value = true
}

function promptDeleteTrip(trip) {
  if (trip === 'all') {
    deleteTarget.value = 'all'
  } else {
    deleteTarget.value = trip
  }
  modalDeleteVisible.value = true
}

async function executeDeleteTrips() {
  try {
    let idsToDelete = []
    if (deleteTarget.value === 'all') {
      idsToDelete = myTripsList.value.map(t => t._id)
    } else if (deleteTarget.value === 'selected') {
      idsToDelete = [...selectedTrips.value]
    } else if (deleteTarget.value?._id) {
      idsToDelete = [deleteTarget.value._id]
    }

    if (!idsToDelete.length) return

    await api.post('/trips/delete-multiple', { tripIds: idsToDelete })
    
    // Xóa khỏi UI
    myTripsList.value = myTripsList.value.filter(t => !idsToDelete.includes(t._id))
    selectedTrips.value = []
    modalDeleteVisible.value = false
    deleteTarget.value = null
    
    if (xemTripChiTiet.value && idsToDelete.includes(xemTripChiTiet.value._id)) {
      xemTripChiTiet.value = null
      hienModalChiTietTrip.value = false
    }
  } catch (err) {
    console.error('Lỗi xóa chuyến đi:', err)
    alert('Không thể xóa chuyến đi. Vui lòng thử lại.')
  }
}

// --- PROFILE LOGIC INJECTED ---
const isEditingProfile = ref(false)
const profileForm = reactive({
  name: '',
  bio: '',
  avatar: ''
})

const userStats = computed(() => {
  return {
    points: nguoiDung.value?.points || 0,
    completedTrips: nguoiDung.value?.completed_trips || 0,
    savedTrips: myTripsList.value?.length || 0,
    favoritePlaces: favoritesList.value?.length || 0
  }
})

function editProfile() {
  profileForm.name = nguoiDung.value?.name || ''
  profileForm.bio = nguoiDung.value?.bio || ''
  profileForm.avatar = nguoiDung.value?.avatar || ''
  isEditingProfile.value = true
}

function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('Kích thước ảnh tối đa 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    profileForm.avatar = event.target.result
  }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  try {
    const res = await api.put('/auth/update-profile', {
      name: profileForm.name,
      bio: profileForm.bio,
      avatar: profileForm.avatar
    })
    nguoiDung.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    isEditingProfile.value = false
  } catch (err) {
    console.error('Lỗi cập nhật hồ sơ:', err)
    alert(err.response?.data?.error || 'Không thể cập nhật hồ sơ')
  }
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
  min-height: 100vh;
  overflow-x: hidden;
  transition: transform 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.app-root.app-intro-zoom {
  transform: scale(0.95);
}

/* ===== AI HINT BUBBLE — đồng bộ màu Teal chủ đạo sang trọng ===== */
.ai-hint-bubble {
  box-sizing: border-box;
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

@media (max-width: 640px) {
  .ai-hint-bubble {
    padding: 16px 36px 16px 16px;
    gap: 12px;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .ai-hint-body {
    width: 100%;
  }
  .ai-hint-chips {
    justify-content: center;
  }
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
  border: 2px solid transparent;
  outline: none;
  padding: 16px 12px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 180px;
  max-width: 210px;
  height: 200px;
  color: #ffffff;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
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
  background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.05) 100%);
  z-index: 1;
  border-radius: inherit;
  transition: opacity 0.2s ease;
}
.city-card-btn:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45), 0 0 20px rgba(14, 165, 233, 0.4);
  border-color: rgba(14, 165, 233, 0.6);
}
.city-card-btn.active {
  box-shadow: 0 0 0 3px #0ea5e9, 0 12px 28px rgba(14, 165, 233, 0.45);
  border-color: #0ea5e9;
  transform: translateY(-4px);
}
.city-card-btn.active::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 13px;
  font-weight: 800;
  background: #10b981;
  color: #fff;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 3px 8px rgba(0,0,0,0.35);
}
.city-icon, .city-name, .city-tag {
  position: relative;
  z-index: 2;
}
.city-pin-icon {
  display: block;
  margin-bottom: 6px;
  opacity: 0.95;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));
  position: relative;
  z-index: 2;
}
.city-name {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.9);
  line-height: 1.25;
  margin-bottom: 4px;
}
.city-tag {
  font-size: 11.5px;
  color: rgba(255,255,255,0.92);
  text-shadow: 0 1px 4px rgba(0,0,0,0.85);
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

/* ========================================================
   PROVINCE SPOTLIGHT SHOWCASE & THUMBNAILS GALLERY (YÊU CẦU 2)
   ======================================================== */
.province-spotlight-card {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 24px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 20px;
  padding: 22px;
  margin-top: 18px;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}
:root[data-theme="dark"] .province-spotlight-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}
@media (max-width: 900px) {
  .province-spotlight-card {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 16px;
  }
}
.spotlight-visual-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.spotlight-hero-wrap {
  position: relative;
  width: 100%;
  height: 340px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}
@media (max-width: 600px) {
  .spotlight-hero-wrap {
    height: 240px;
  }
}
.spotlight-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.spotlight-hero-wrap:hover .spotlight-hero-img {
  transform: scale(1.02);
}
.spotlight-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.3) 100%);
  pointer-events: none;
}
.spotlight-badge-esg {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(236, 253, 245, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #10b981;
  color: #065f46;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 2;
}
.spotlight-badge-cert {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(254, 243, 199, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #f59e0b;
  color: #92400e;
  font-size: 12.5px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 2;
}
.spotlight-fullscreen-btn {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.spotlight-fullscreen-btn:hover {
  background: #ffffff;
  transform: scale(1.08);
  color: #0284c7;
}

/* 5 Thumbnails Gallery dưới ảnh chính */
.spotlight-thumbnails-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.spotlight-thumb-btn {
  position: relative;
  height: 72px;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  padding: 0;
  background: #000;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}
.spotlight-thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, opacity 0.2s ease;
  opacity: 0.82;
}
.spotlight-thumb-btn:hover img {
  opacity: 1;
  transform: scale(1.05);
}
.spotlight-thumb-btn.active {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.3);
}
.spotlight-thumb-btn.active img {
  opacity: 1;
}
.thumb-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 9.5px;
  font-weight: 600;
  padding: 2px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* Cột thông tin chi tiết */
.spotlight-info-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.spotlight-header-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}
.spotlight-tag-kicker {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #0284c7;
  text-transform: uppercase;
}
.spotlight-cert-sub {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  font-weight: 500;
}
.spotlight-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-color, #0f172a);
  line-height: 1.3;
  margin: 0 0 4px 0;
}
:root[data-theme="dark"] .spotlight-title {
  color: #f8fafc;
}
.spotlight-subtitle {
  font-size: 13.5px;
  font-weight: 600;
  color: #0ea5e9;
  margin: 0 0 10px 0;
  line-height: 1.4;
}
.spotlight-description {
  font-size: 13.5px;
  color: var(--text-muted, #475569);
  line-height: 1.6;
  margin: 0 0 14px 0;
}
:root[data-theme="dark"] .spotlight-description {
  color: #cbd5e1;
}
.spotlight-highlight-box {
  background: var(--bg-soft, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 10px;
}
:root[data-theme="dark"] .spotlight-highlight-box {
  background: #0f172a;
  border-color: #334155;
}
.shb-label {
  font-size: 12.5px;
  color: var(--text-color, #0f172a);
  margin-bottom: 6px;
}
:root[data-theme="dark"] .shb-label {
  color: #f8fafc;
}
.shb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.spotlight-spec-chip {
  font-size: 12px;
  font-weight: 600;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid rgba(2, 132, 199, 0.2);
}
.shb-text {
  font-size: 13px;
  color: #10b981;
  font-weight: 600;
  margin: 0;
}
.spotlight-actions {
  margin-top: 10px;
}
.spotlight-cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 700;
  padding: 13px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  transition: all 0.2s ease;
}
.spotlight-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(2, 132, 199, 0.45);
}

/* Spotlight Fullscreen Modal */
.spotlight-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.spotlight-modal-box {
  position: relative;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 18px;
  max-width: 900px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}
.spotlight-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}
.spotlight-modal-close:hover {
  background: #ef4444;
}
.spotlight-modal-img {
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  background: #000;
  display: block;
}
.spotlight-modal-footer {
  padding: 16px 20px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.spotlight-modal-footer h4 {
  color: #fff;
  font-size: 16px;
  margin: 0;
}
.spotlight-modal-thumbs {
  display: flex;
  gap: 8px;
}
.sm-thumb-btn {
  width: 50px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}
.sm-thumb-btn.active {
  border-color: #0284c7;
}
.sm-thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ========================================================
   LỊCH TRÌNH KHỞI HÀNH & CHỌN NGÀY ĐI (YÊU CẦU 3 - SCREENSHOT 3)
   ======================================================== */
.departure-schedule-box {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  background: var(--card-bg, #ffffff);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  padding: 18px 20px;
  margin-top: 10px;
  margin-bottom: 12px;
}
:root[data-theme="dark"] .departure-schedule-box {
  background: #1e293b;
  border-color: #334155;
}
.dsb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}
.dsb-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dsb-icon {
  font-size: 24px;
}
.dsb-title {
  font-size: 16.5px;
  font-weight: 800;
  color: var(--text-color, #0f172a);
  margin: 0;
}
:root[data-theme="dark"] .dsb-title {
  color: #f8fafc;
}
.dsb-subtitle {
  font-size: 12.5px;
  color: var(--text-muted, #64748b);
  display: block;
}
.dsb-duration-tag {
  font-size: 12px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

/* Dãy nút chọn tháng kiểu viên thuốc (Screenshot 3) */
.month-pills-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 14px;
  -webkit-overflow-scrolling: touch;
}
.month-pill-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  min-width: 100px;
  border-radius: 12px;
  border: 1.5px solid var(--border-color, #e2e8f0);
  background: var(--card-bg, #ffffff);
  color: var(--text-muted, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
:root[data-theme="dark"] .month-pill-btn {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}
.month-pill-btn span {
  font-size: 13.5px;
  font-weight: 600;
}
.month-pill-btn strong {
  font-size: 14px;
  font-weight: 800;
}
.month-pill-btn:hover {
  border-color: #0284c7;
  color: #0284c7;
}
.month-pill-btn.active {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
}

/* KHỐI THỐNG NHẤT 4 TRƯỜNG ĐIỀU KHIỂN (YÊU CẦU 2) */
.dsb-unified-controls-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 14px;
  align-items: flex-end;
}
@media (max-width: 900px) {
  .dsb-unified-controls-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 520px) {
  .dsb-unified-controls-grid {
    grid-template-columns: 1fr;
  }
}
.dsb-ctrl-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dsb-ctrl-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-color, #334155);
}
:root[data-theme="dark"] .dsb-ctrl-field label {
  color: #cbd5e1;
}
.dsb-stepper {
  height: 42px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: var(--input-bg, #ffffff);
  border: 1.5px solid var(--border-color, #cbd5e1);
  overflow: hidden;
}
:root[data-theme="dark"] .dsb-stepper {
  background: #0f172a;
  border-color: #334155;
}
.dsb-stepper button {
  width: 40px;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color, #334155);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
:root[data-theme="dark"] .dsb-stepper button {
  color: #f1f5f9;
}
.dsb-stepper button:hover {
  background: rgba(2, 132, 199, 0.15);
  color: #0284c7;
}
.dsb-stepper-val {
  flex: 1;
  text-align: center;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-color, #0f172a);
}
:root[data-theme="dark"] .dsb-stepper-val {
  color: #f8fafc;
}

/* Ô chọn ngày cụ thể (Dự phòng) */
.departure-date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
}
@media (max-width: 640px) {
  .departure-date-row {
    grid-template-columns: 1fr;
  }
}
.ddr-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-color, #334155);
  margin-bottom: 5px;
}
:root[data-theme="dark"] .ddr-field label {
  color: #cbd5e1;
}
.departure-date-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #cbd5e1);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}
.disabled-input {
  background: rgba(0, 0, 0, 0.03);
  cursor: not-allowed;
  opacity: 0.9;
}
:root[data-theme="dark"] .disabled-input {
  background: rgba(255, 255, 255, 0.05);
}
.trip-date-summary-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.2);
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 13px;
  color: #0369a1;
}
:root[data-theme="dark"] .trip-date-summary-banner {
  background: rgba(2, 132, 199, 0.15);
  color: #38bdf8;
}
.trip-date-summary-banner b {
  font-weight: 700;
}

/* ========================================================
   BỐ CỤC CHỌN VÉ XE GỌN GÀNG & HIỆN ĐẠI (YÊU CẦU 4 - SCREENSHOT 4)
   ======================================================== */
.bic-spec-times {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--card-bg, #fff);
  padding: 8px 10px;
  border-radius: 8px;
}
:root[data-theme="dark"] .bic-spec-times {
  background: #0f172a;
}
.bst-label {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  font-weight: 600;
}
.bst-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.bst-chip {
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(2, 132, 199, 0.2);
}
.train-time-chip {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
}

/* ========================================================
   THANH TÌM KIẾM & BỘ CHỌN ĐỊA ĐIỂM TỐI GIẢN (YÊU CẦU 5 - SCREENSHOT 5)
   ======================================================== */
.place-picker-search-bar {
  display: flex;
  align-items: center;
  position: relative;
  background: var(--bg-soft, #f8fafc);
  border: 1.5px solid var(--border-color, #cbd5e1);
  border-radius: 12px;
  padding: 2px 14px;
  margin-top: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}
.place-picker-search-bar:focus-within {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}
:root[data-theme="dark"] .place-picker-search-bar {
  background: #1e293b;
  border-color: #334155;
}
.pps-icon {
  font-size: 16px;
  margin-right: 8px;
  opacity: 0.7;
}
.pps-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 13.5px;
  color: var(--text-color);
  outline: none;
}
.pps-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}
.pps-clear-btn:hover {
  color: #ef4444;
}

/* Tabs phân loại */
.place-picker-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 14px;
}
.ppt-btn {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--border-color, #e2e8f0);
  background: var(--card-bg, #ffffff);
  color: var(--text-muted, #64748b);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
:root[data-theme="dark"] .ppt-btn {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}
.ppt-btn:hover {
  border-color: #0284c7;
  color: #0284c7;
}
.ppt-btn.active {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
}
.ppt-selected-tab {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #059669;
}
.ppt-selected-tab.active {
  background: #10b981 !important;
  border-color: #10b981 !important;
}

/* Khay địa điểm đã chọn */
.selected-places-tray {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
}
:root[data-theme="dark"] .selected-places-tray {
  background: rgba(16, 185, 129, 0.12);
}
.spt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.spt-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #065f46;
}
:root[data-theme="dark"] .spt-title {
  color: #34d399;
}
.spt-clear-all {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
.spt-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.spt-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #065f46;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
:root[data-theme="dark"] .spt-chip {
  background: #0f172a;
  color: #6ee7b7;
}
.spt-chip button {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.spt-chip button:hover {
  color: #ef4444;
}

/* Nút Thu gọn / Xem thêm */
.picker-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.picker-expand-toggle-btn {
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.2);
  color: #0284c7;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.picker-expand-toggle-btn:hover {
  background: rgba(2, 132, 199, 0.16);
}
.empty-search-places {
  text-align: center;
  padding: 30px 16px;
  background: var(--bg-soft, #f8fafc);
  border-radius: 12px;
  margin-top: 10px;
}
:root[data-theme="dark"] .empty-search-places {
  background: #1e293b;
}
.empty-search-places span {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}
.empty-search-places p {
  font-size: 13.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

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
.app-form-grid > .full-width,
.app-form-grid > .departure-schedule-box,
.app-form-grid > .bus-optimization-section,
.app-form-grid > .route-overview-banner,
.app-form-grid > .ai-hint-bubble,
.bus-optimization-section {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}
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
  flex-wrap: wrap; 
  overflow-x: hidden; 
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
.submit-plan-btn { width: 100%; margin-top: 0; padding: 14px; }

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
/* SQUAD AVATARS CSS */
.squad-avatars-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  padding: 8px 12px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}
.squad-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub);
}
.squad-overlap {
  display: flex;
  align-items: center;
}
.squad-avatar-wrap {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid var(--card-bg, #fff);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  margin-left: -12px;
  position: relative;
  transition: transform 0.2s, z-index 0.2s;
  background: #1e1b4b;
  overflow: hidden;
  cursor: help;
}
.squad-avatar-wrap:first-child {
  margin-left: 0;
}
.squad-avatar-wrap:hover {
  transform: translateY(-4px) scale(1.1);
  z-index: 10 !important;
}
.sq-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.sq-cyclo {
  object-position: center 25%;
}
.sq-smirk {
  object-position: center 20%;
}
.sq-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
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

/* TIER INDICATOR BANNER IN STEP 2 */
.tier-indicator-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: color-mix(in srgb, var(--input-bg) 85%, transparent);
  border: 1.5px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-top: 14px;
  gap: 16px;
  flex-wrap: wrap;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.tib-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tib-icon {
  font-size: 28px;
  line-height: 1;
}
.tib-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}
.tib-badge {
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.tib-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}
.tib-rate {
  font-size: 12px;
  color: var(--text-sub);
  margin: 0;
}
.tib-rate b {
  color: var(--primary);
}
.tib-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tib-tag {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-main);
}

/* PILL BADGE IN SUMMARY */
.tier-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 14px;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.budget-luxury-callout {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 1px solid #f59e0b;
  color: #92400e;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  margin-top: 10px;
}

/* BUDGET AUDIT CARD */
.budget-audit-card {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: #fff;
  transition: all 0.2s ease;
}
.budget-audit-card.optimal {
  background: #f0fdf4;
  border-color: #86efac;
}
.budget-audit-card.under {
  background: #fefce8;
  border-color: #fde047;
}
.budget-audit-card.over {
  background: #fef2f2;
  border-color: #fca5a5;
}
.bac-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.bac-title-group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}
.bac-icon {
  font-size: 22px;
  line-height: 1;
}
.bac-msg {
  display: block;
  font-size: 13px;
  color: var(--text-main);
  margin-bottom: 2px;
}
.bac-advice {
  font-size: 12px;
  color: var(--text-sub);
  margin: 0;
  line-height: 1.4;
}
.bac-stats {
  text-align: right;
  flex-shrink: 0;
}
.bac-stat-label {
  display: block;
  font-size: 11px;
  color: var(--text-sub);
  font-weight: 600;
}
.bac-stat-num {
  font-size: 16px;
  color: var(--primary);
  font-weight: 800;
}
.bac-details-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}
.bad-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
}
.bad-label {
  color: var(--text-sub);
  font-weight: 600;
}
.bad-item b {
  font-size: 12px;
  color: var(--text-main);
}

/* RESPONSIVE TRÊN MÁY TÍNH & MOBILE */
@media (max-width: 640px) {
  .app-main { padding: 12px 10px; min-width: 0; overflow-x: hidden; }
  .tab-pane { min-width: 0; }
  .planner-tab-bg { padding: 16px 12px 32px; width: 100%; box-sizing: border-box; }
  .planner-form-container { margin: 0; padding: 16px; width: 100%; box-sizing: border-box; max-width: 100%; min-width: 0; }
  .app-form-grid { grid-template-columns: 1fr; }
  .app-field, .origin-select-wrapper { min-width: 0; }
  .app-field.full-width { grid-column: span 1; }
  .hotel-main-info { flex-direction: column; }
  .hotel-side { text-align: left; }
  .places-app-grid { grid-template-columns: 1fr; }
  .origin-quick-picks { flex-wrap: wrap; overflow-x: visible; }
}

@media (max-width: 480px) {
  .app-main { padding: 10px 6px; }
  .planner-tab-bg { padding: 12px 8px 24px; }
  .planner-form-container { padding: 12px; }
  .wizard-progress { padding: 8px 10px; margin-bottom: 16px; gap: 4px; }
  .step-indicator { font-size: 0.75rem; padding: 4px 8px; }
  .step-divider { margin: 0 2px; }
  .ai-hint-bubble { padding: 12px; gap: 10px; border-radius: 12px; flex-direction: column; align-items: center; text-align: center; }
  .ai-hint-robot { display: flex; justify-content: center; }
  .ai-hint-robot img { width: 36px !important; height: 36px !important; }
  .ai-hint-content p { font-size: 0.85rem; margin-bottom: 8px; }
  .ai-chip { font-size: 0.75rem; padding: 4px 10px; }
  .wizard-footer { flex-direction: column; gap: 12px; }
  .wizard-footer button { width: 100%; justify-content: center; }
  .origin-mode-switch button { padding: 4px 8px; font-size: 10px; }
  .route-overview-banner.compact { flex-direction: column; align-items: flex-start; gap: 8px; }
  .rob-mid-compact { width: 100%; margin: 8px 0; }
  .dbc-grid { grid-template-columns: 1fr; gap: 8px; }
  .budget-quick-tags .quick-tag-chip { font-size: 11px; padding: 6px 10px; }
  .act-meta-badges { gap: 3px; margin: 2px 0; }
  .meta-tag-pill { padding: 1px 6px; font-size: 10px; }
  .act-desc {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12.5px;
    margin: 2px 0 5px;
  }
  .act-signature-box, .act-cost-box { padding: 4px 8px; margin: 4px 0; font-size: 11.5px; }
  .eta-pill { padding: 2px 6px; font-size: 10px; }
  .eta-metrics-row { gap: 4px; }
  .transit-badge { padding: 4px 8px; font-size: 10.5px; }
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
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-top: 24px !important;
  gap: 16px !important;
  width: 100% !important;
}
.wizard-footer button,
.wizard-footer .app-secondary-btn,
.wizard-footer .app-primary-btn,
.wizard-footer .submit-plan-btn {
  flex: 1 !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  margin: 0 !important;
  padding: 0 24px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  line-height: normal !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}
.wizard-footer .app-secondary-btn {
  background: var(--input-bg, #f1f5f9) !important;
  color: var(--text-main, #334155) !important;
  border: 1.5px solid var(--border-color, #cbd5e1) !important;
}
.wizard-footer .app-secondary-btn:hover:not(:disabled) {
  background: #e2e8f0 !important;
  border-color: #94a3b8 !important;
  transform: translateY(-1px) !important;
}
:root[data-theme="dark"] .wizard-footer .app-secondary-btn {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}
:root[data-theme="dark"] .wizard-footer .app-secondary-btn:hover:not(:disabled) {
  background: #334155 !important;
}
.wizard-footer .app-primary-btn,
.wizard-footer .submit-plan-btn {
  background: var(--primary, #059669) !important;
  color: #ffffff !important;
  border: 1.5px solid var(--primary, #059669) !important;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3) !important;
}
.wizard-footer .app-primary-btn:hover:not(:disabled),
.wizard-footer .submit-plan-btn:hover:not(:disabled) {
  background: var(--primary-dark, #047857) !important;
  border-color: var(--primary-dark, #047857) !important;
  box-shadow: 0 6px 18px rgba(5, 150, 105, 0.4) !important;
  transform: translateY(-1px) !important;
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

/* UNFEASIBLE WARNING BOX & FREE PLACES CHOICE */
.unfeasible-warning-box {
  margin-top: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08));
  border: 1.5px solid rgba(239, 68, 68, 0.35);
  border-radius: var(--radius-md, 12px);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}
:root[data-theme="dark"] .unfeasible-warning-box {
  background: linear-gradient(135deg, rgba(153, 27, 27, 0.25), rgba(180, 83, 9, 0.2));
  border-color: rgba(239, 68, 68, 0.5);
}
.uwb-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.uwb-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}
.uwb-header-text strong {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #dc2626;
  margin-bottom: 4px;
}
:root[data-theme="dark"] .uwb-header-text strong {
  color: #f87171;
}
.uwb-header-text p {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--text-main);
  margin: 0;
  opacity: 0.9;
}
.uwb-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.uwb-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.btn-budget-fix {
  background: #dc2626;
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}
.btn-budget-fix:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}
.btn-days-fix {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.4);
}
:root[data-theme="dark"] .btn-days-fix {
  background: rgba(245, 158, 11, 0.2);
  color: #fde68a;
  border-color: rgba(245, 158, 11, 0.45);
}
.btn-days-fix:hover {
  background: rgba(245, 158, 11, 0.25);
  transform: translateY(-1px);
}
.uwb-free-choice {
  padding-top: 10px;
  border-top: 1px dashed rgba(239, 68, 68, 0.25);
}
.uwb-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12.5px;
  color: var(--text-main);
  user-select: none;
}
.uwb-checkbox {
  width: 17px;
  height: 17px;
  accent-color: #10b981;
  cursor: pointer;
}

/* FREE MODE BANNER */
.free-mode-banner {
  margin-top: 14px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}
:root[data-theme="dark"] .free-mode-banner {
  background: rgba(6, 78, 59, 0.3);
  border-color: rgba(16, 185, 129, 0.4);
}
.fmb-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fmb-icon {
  font-size: 18px;
}
.fmb-left strong {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #059669;
  margin-bottom: 2px;
}
:root[data-theme="dark"] .fmb-left strong {
  color: #34d399;
}
.fmb-left p {
  font-size: 12px;
  margin: 0;
  color: var(--text-main);
  opacity: 0.9;
}
.fmb-turnoff {
  background: rgba(128, 128, 128, 0.15);
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.fmb-turnoff:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: #ef4444;
}

/* STEP 3 UNFEASIBLE NOTICE */
.unfeasible-step3-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 8px;
  color: #dc2626;
  font-size: 12px;
  margin-bottom: 12px;
  line-height: 1.45;
  text-align: left;
}
:root[data-theme="dark"] .unfeasible-step3-notice {
  color: #fca5a5;
  background: rgba(153, 27, 27, 0.25);
  border-color: rgba(239, 68, 68, 0.45);
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
  width: 190px;
  height: 190px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.radar-pulse {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 1.5px solid rgba(129, 140, 248, 0.45);
  animation: radarWave 2.4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
  pointer-events: none;
}
.pulse-2 {
  animation-delay: -1.2s;
}
@keyframes radarWave {
  0% { transform: scale(0.65); opacity: 0.9; }
  100% { transform: scale(1.35); opacity: 0; }
}
.radar-track {
  position: absolute;
  width: 136px;
  height: 136px;
  border: 1.5px dashed rgba(167, 139, 250, 0.35);
  border-radius: 50%;
  pointer-events: none;
}
.radar-center {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24px rgba(251, 191, 36, 0.5), 0 0 35px rgba(99, 102, 241, 0.6);
  z-index: 5;
  animation: floatCenter 2.4s ease-in-out infinite;
  border: 3px solid #fbbf24;
  overflow: hidden;
  background: #312e81;
}
.radar-center-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
@keyframes floatCenter {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.05) translateY(-3px); }
}

/* Orbiting Friends Ring (Quay xung quanh vòng tròn qua lại) */
.radar-orb-ring {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: ringOrbitSwing 6s cubic-bezier(0.42, 0, 0.58, 1) infinite alternate;
}
@keyframes ringOrbitSwing {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.radar-orb {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: #1e1b4b;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.radar-orb:hover {
  transform: scale(1.18);
  z-index: 10;
}
.orb-1 {
  top: 6px;
  left: calc(50% - 22px);
  border: 2.5px solid #38bdf8;
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.75), 0 4px 10px rgba(0, 0, 0, 0.4);
}
.orb-2 {
  top: calc(50% - 22px);
  right: 6px;
  border: 2.5px solid #34d399;
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.75), 0 4px 10px rgba(0, 0, 0, 0.4);
}
.orb-3 {
  bottom: 6px;
  left: calc(50% - 22px);
  border: 2.5px solid #f472b6;
  box-shadow: 0 0 14px rgba(244, 114, 182, 0.75), 0 4px 10px rgba(0, 0, 0, 0.4);
}
.orb-4 {
  top: calc(50% - 22px);
  left: 6px;
  border: 2.5px solid #a78bfa;
  box-shadow: 0 0 14px rgba(167, 139, 250, 0.75), 0 4px 10px rgba(0, 0, 0, 0.4);
}

.orb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  animation: orbCounterRotate 6s cubic-bezier(0.42, 0, 0.58, 1) infinite alternate;
}
.orb-img-cyclo {
  object-position: center 25%;
}
.orb-img-smirk {
  object-position: center 20%;
}
@keyframes orbCounterRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
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
  margin: 0 0 10px;
  color: rgba(255,255,255,0.92);
  line-height: 1.4;
}
.celebrating-squad {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.celeb-avatar-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  overflow: hidden;
  background: #1e1b4b;
  animation: squadBounce 1.2s cubic-bezier(0.36, 0, 0.66, -0.56) infinite alternate;
}
.celeb-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.celeb-1 { animation-delay: 0s; }
.celeb-2 { animation-delay: 0.15s; }
.celeb-3 { animation-delay: 0.3s; }
.celeb-4 { animation-delay: 0.45s; }
.celeb-5 { animation-delay: 0.6s; }

@keyframes squadBounce {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-8px) scale(1.1); }
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

/* SQUAD SPEECH BUBBLE (BÌNH LUẬN VUI NHỘN) */
.squad-speech-bubble {
  display: flex;
  gap: 12px;
  margin: 12px 0;
  padding: 10px 12px;
  background: rgba(56, 189, 248, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  align-items: center;
  position: relative;
}
.squad-speech-bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 20px;
  border-width: 0 8px 8px 8px;
  border-style: solid;
  border-color: transparent transparent rgba(56, 189, 248, 0.2) transparent;
}
.sq-chat-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #38bdf8;
  flex-shrink: 0;
  background: #1e1b4b;
}
.sq-chat-text {
  font-size: 13.5px;
  color: var(--text-main);
  font-style: italic;
  line-height: 1.4;
  font-weight: 500;
}
:root[data-theme="dark"] .sq-chat-text {
  color: #e2e8f0;
}

/* CYCLO SCROLL INDICATOR */
.cyclo-scroll-indicator {
  position: sticky;
  top: 180px;
  left: -20px; /* Nhô ra bên trái timeline */
  width: 48px;
  height: 48px;
  z-index: 50;
  border-radius: 50%;
  overflow: hidden;
  border: 2.5px solid #38bdf8;
  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
  background: #1e1b4b;
  margin-bottom: -48px; /* Để không chiếm không gian */
  animation: cycloWobble 2s ease-in-out infinite alternate;
}
.cyclo-scroll-indicator img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@keyframes cycloWobble {
  0% { transform: rotate(-5deg) translateY(0); }
  100% { transform: rotate(5deg) translateY(-4px); }
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
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  width: 100%;
  margin-bottom: 20px;
}
@media (max-width: 860px) {
  .transit-vehicles-grid {
    grid-template-columns: 1fr;
  }
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
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}
@media (max-width: 860px) {
  .bus-operators-grid {
    grid-template-columns: 1fr;
  }
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

/* ==================== STYLES CHO HERO ACTION BAR (LƯU LỊCH TRÌNH & THAY ĐỔI LỊCH TRÌNH) ==================== */
.itinerary-decision-actions-bar {
  display: flex;
  gap: 12px;
  margin: 18px 0;
  flex-wrap: wrap;
}

.it-dec-btn {
  flex: 1;
  min-width: 220px;
  padding: 12px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
}

.it-save-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.it-save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

.it-save-btn.is-saved {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.3);
}

.it-replan-btn {
  background: rgba(14, 165, 233, 0.08);
  color: #0284c7;
  border: 1.5px solid rgba(14, 165, 233, 0.35);
}

.it-replan-btn:hover {
  background: rgba(14, 165, 233, 0.16);
  border-color: #0284c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.15);
}

.it-dec-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.it-dec-text {
  text-align: left;
  display: flex;
  flex-direction: column;
}

.it-dec-text strong {
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.3;
}

.it-dec-text small {
  font-size: 11.5px;
  opacity: 0.85;
  margin-top: 2px;
}

.save-success-banner {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 10px;
  padding: 10px 16px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #065f46;
  font-size: 13.5px;
  animation: fadeIn 0.3s ease;
}

.ssb-view-btn {
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}

.ssb-view-btn:hover {
  background: #047857;
}

.hotel-nights-calc-badge {
  font-size: 12.5px;
  color: #047857;
  font-weight: 600;
  margin-top: 5px;
  background: rgba(16, 185, 129, 0.12);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

/* ==================== STYLES CHO CHẶNG KHỞI HÀNH (ORIGIN TO DESTINATION JOURNEY) ==================== */
.origin-departure-journey-card {
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.95) 0%, rgba(236, 253, 245, 0.95) 100%);
  border: 1.5px solid #a7f3d0;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  gap: 14px;
  position: relative;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
}

.odjc-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 50px;
}

.odjc-time {
  font-size: 14px;
  font-weight: 800;
  color: #047857;
}

.odjc-bullet {
  font-size: 20px;
}

.odjc-card-content {
  flex: 1;
}

.odjc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.odjc-badge {
  background: #059669;
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.odjc-duration-pill {
  background: #d1fae5;
  color: #065f46;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.odjc-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 4px 0 10px;
}

.odjc-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  background: rgba(255, 255, 255, 0.7);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.odjc-meta-item {
  font-size: 12.5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.omi-label {
  color: #64748b;
  font-size: 11px;
}

.odjc-meta-item strong {
  color: #1e293b;
  font-weight: 600;
}

.odjc-note {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: #334155;
  line-height: 1.5;
}

/* ==================== DÒNG THỜI GIAN DI CHUYỂN DƯỚI ĐỊA ĐIỂM (SCREENSHOT 3) ==================== */
.act-quick-travel-bar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.22);
  color: #0369a1;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 12px;
  margin: 4px 0 8px;
}

.aqtb-time {
  font-weight: 700;
  color: #0284c7;
}

.aqtb-sep {
  opacity: 0.6;
}

.aqtb-desc {
  color: #475569;
}

/* ==================== STYLES CHO BẢN ĐỒ & THẺ CHI TIẾT PLACE (SCREENSHOT 4) ==================== */
.sticky-map-inner {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
}

.map-floating-overlay-bar {
  position: absolute;
  top: 65px;
  left: 14px;
  z-index: 990;
}

.map-route-gmap-pill {
  background: #ffffff;
  color: #1e293b;
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.map-route-gmap-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  color: #0284c7;
}

.gmap-g-logo {
  font-weight: 900;
  color: #4285F4;
  font-size: 15px;
}

.map-place-detail-drawer {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 88%;
  height: 100%;
  background: #ffffff;
  z-index: 1010;
  box-shadow: -6px 0 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-left: 1px solid #e2e8f0;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.mpd-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.mpd-close-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.mpd-image-wrap {
  position: relative;
  width: 100%;
  height: 160px;
  flex-shrink: 0;
  overflow: hidden;
  background: #e2e8f0;
}

.mpd-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mpd-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(2, 132, 199, 0.95);
  color: #fff;
}

.mpd-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.mpd-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.mpd-rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}

.mpd-score {
  font-weight: 800;
  color: #1e293b;
}

.mpd-stars {
  color: #f59e0b;
  font-size: 13px;
}

.mpd-reviews {
  color: #64748b;
  font-size: 12px;
}

.mpd-addr {
  font-size: 12.5px;
  color: #475569;
  margin: 0;
  line-height: 1.4;
}

.mpd-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.mpd-section h5 {
  font-size: 13px;
  font-weight: 800;
  color: #334155;
  margin: 0 0 6px;
}

.mpd-desc {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.mpd-gmap-btn-box {
  margin: 4px 0;
}

.mpd-gmap-primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #0284c7;
  color: #ffffff;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.mpd-gmap-primary-btn:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

.mpd-review-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
}

.mpd-rev-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mpd-rev-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ca8a04;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mpd-rev-name {
  font-size: 12px;
  color: #1e293b;
}

.mpd-rev-rating {
  color: #f59e0b;
  font-size: 11px;
}

.mpd-rev-body {
  font-size: 12px;
  color: #475569;
  line-height: 1.45;
  margin: 0;
}

.mpd-actions-row {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
}

.mpd-fav-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.mpd-fav-btn:hover {
  background: #f1f5f9;
}

.mpd-change-btn {
  flex: 2;
  padding: 8px;
  border: 1px solid #0284c7;
  color: #0284c7;
  border-radius: 8px;
  background: rgba(2, 132, 199, 0.06);
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.mpd-change-btn:hover {
  background: rgba(2, 132, 199, 0.15);
}

.map-bottom-prompt-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0284c7;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 600;
  text-align: center;
  padding: 6px 12px;
  z-index: 990;
  letter-spacing: 0.2px;
}

/* ==================== STYLES CHO REPLAN MODAL (THAY ĐỔI LỊCH TRÌNH KHÁC) ==================== */
.replan-modal-card {
  max-width: 480px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.replan-options-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.replan-option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.replan-option-card:hover {
  border-color: #0284c7;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.12);
}

.roc-icon {
  font-size: 26px;
  line-height: 1;
  flex-shrink: 0;
}

.roc-text {
  flex: 1;
}

.roc-text h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.roc-text p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.roc-arrow {
  font-size: 16px;
  color: #94a3b8;
  font-weight: 700;
}

.guest-saved-trips-banner {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #166534;
  flex-wrap: wrap;
}

.gstb-login-btn {
  background: #16a34a;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.gstb-login-btn:hover {
  background: #15803d;
}

/* ABSOLUTE MOBILE OVERRIDES - MUST BE AT END OF FILE */
@media (max-width: 992px) {
  .app-main { padding: 12px 10px !important; min-width: 0 !important; overflow-x: hidden !important; }
  .tab-pane { min-width: 0 !important; }
  .planner-tab-bg { padding: 16px 12px 32px !important; width: 100% !important; box-sizing: border-box !important; }
  .planner-form-container { margin: 0 !important; padding: 16px !important; width: 100% !important; box-sizing: border-box !important; max-width: 100% !important; min-width: 0 !important; flex-shrink: 1 !important; }
  .app-form-grid { grid-template-columns: 1fr !important; }
  .app-field, .origin-select-wrapper { min-width: 0 !important; }
  .app-field.full-width { grid-column: span 1 !important; }
  .hotel-main-info { flex-direction: column !important; }
  .hotel-side { text-align: left !important; }
  .places-app-grid { grid-template-columns: 1fr !important; }
  .origin-quick-picks { flex-wrap: wrap !important; overflow-x: visible !important; }
}

@media (max-width: 768px) {
  .app-main { padding: 10px 6px !important; }
  .planner-tab-bg { padding: 12px 8px 24px !important; }
  .planner-form-container { padding: 12px !important; }
  .wizard-progress { padding: 8px 10px !important; margin-bottom: 16px !important; gap: 4px !important; }
  .step-indicator { font-size: 0.75rem !important; padding: 4px 8px !important; }
  .step-divider { margin: 0 2px !important; }
  .ai-hint-bubble { padding: 12px !important; gap: 10px !important; border-radius: 12px !important; flex-direction: column !important; align-items: center !important; text-align: center !important; }
  .ai-hint-robot { display: flex !important; justify-content: center !important; }
  .ai-hint-robot img { width: 36px !important; height: 36px !important; }
  .ai-hint-content p { font-size: 0.85rem !important; margin-bottom: 8px !important; }
  .ai-chip { font-size: 0.75rem !important; padding: 4px 10px !important; }
  .wizard-footer { flex-direction: column !important; gap: 12px !important; }
  .wizard-footer button { width: 100% !important; justify-content: center !important; }
  .origin-mode-switch button { padding: 4px 8px !important; font-size: 10px !important; }
  .route-overview-banner.compact { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
  .rob-mid-compact { width: 100% !important; margin: 8px 0 !important; }
  .dbc-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
  .transit-vehicles-grid { grid-template-columns: 1fr !important; }
  .budget-quick-tags .quick-tag-chip { font-size: 11px !important; padding: 6px 10px !important; }
  .act-meta-badges { gap: 3px !important; margin: 2px 0 !important; }
  .meta-tag-pill { padding: 1px 6px !important; font-size: 10px !important; line-height: 1.2 !important; height: auto !important; }
  .act-desc {
    display: -webkit-box !important;
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    font-size: 12.5px !important;
    margin: 2px 0 5px !important;
  }
  .act-signature-box, .act-cost-box { padding: 4px 8px !important; margin: 4px 0 !important; font-size: 11.5px !important; }
  .eta-pill { padding: 2px 6px !important; font-size: 10px !important; }
  .eta-metrics-row { gap: 4px !important; }
  .transit-badge { padding: 4px 8px !important; font-size: 10.5px !important; }

  /* Bổ sung fix overflow nghiêm trọng trên Mobile cho Planner */
  .planner-form-container, .wizard-step-content, .bus-operators-box {
    max-width: 100vw !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }
  .planner-form-container * {
    box-sizing: border-box !important;
  }
  .wizard-progress { 
    flex-wrap: wrap !important; 
    justify-content: center !important; 
  }
  .bic-actions-row, .bic-price-line { 
    flex-direction: column !important; 
    align-items: stretch !important; 
    width: 100% !important; 
    gap: 8px !important; 
  }
  .bpl-right, .bpl-left { width: 100% !important; }
  .bpl-total-badge { white-space: normal !important; display: block !important; }
  .quick-city-selector { flex-wrap: wrap !important; gap: 6px !important; }
  .city-select-pill { flex: 1 1 30% !important; text-align: center !important; padding: 6px !important; white-space: normal !important; }
  .stepper-input { width: 100% !important; justify-content: space-between !important; }
  .bus-item-card, .tv-card { min-width: 0 !important; width: 100% !important; word-wrap: break-word !important; }
  .app-field label { white-space: normal !important; }
  .app-field .field-label-between { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
}

/* ==========================================================================
   YÊU CẦU 1: GIAO DIỆN BÁO ĐỎ KHI KẾ HOẠCH VƯỢT QUÁ KHẢ NĂNG TÀI CHÍNH
   ========================================================================== */
.plan-summary-card.is-over-budget-card {
  border: 2px solid #ef4444 !important;
  box-shadow: 0 10px 36px rgba(239, 68, 68, 0.22) !important;
  background: linear-gradient(175deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.96) 35%) !important;
}

.over-budget-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
  animation: pulseOverBudget 2s infinite ease-in-out;
  letter-spacing: 0.3px;
}

@keyframes pulseOverBudget {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45); }
  50% { transform: scale(1.03); box-shadow: 0 6px 22px rgba(239, 68, 68, 0.7); }
}

.summary-budget.has-over-budget {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.sb-target {
  color: #94a3b8;
  font-size: 15px;
}
.sb-target b {
  color: #f1f5f9;
  font-size: 16px;
}
.sb-divider {
  color: #64748b;
}
.sb-actual {
  color: #cbd5e1;
  font-size: 15px;
}
.red-calc-num {
  color: #f87171 !important;
  font-size: 19px !important;
  font-weight: 800 !important;
}
.sb-diff-tag {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.over-budget-alert-box {
  margin-top: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(153, 27, 27, 0.2) 100%);
  border: 1.5px solid #ef4444;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15);
}

.oba-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.oba-icon-ring {
  font-size: 26px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.25);
  border: 1.5px solid #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.oba-texts h4 {
  color: #f87171;
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 6px;
  letter-spacing: -0.2px;
}
.oba-texts p {
  color: #e2e8f0;
  font-size: 13.5px;
  line-height: 1.55;
  margin: 0;
}
.oba-texts b {
  color: #fef08a;
}

.oba-actions-bar {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.oba-act-title {
  color: #fca5a5;
  font-size: 13px;
  font-weight: 700;
  width: 100%;
}
.oba-action-btn {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.oba-action-btn.btn-free {
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
}
.oba-action-btn.btn-free:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45);
}
.oba-action-btn.btn-shorten {
  background: linear-gradient(135deg, #d97706, #f59e0b);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);
}
.oba-action-btn.btn-shorten:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.45);
}
.oba-action-btn.btn-replan {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.oba-action-btn.btn-replan:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}
.oba-action-btn.btn-increase-budget {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(59, 130, 246, 0.35);
}
.oba-action-btn.btn-increase-budget:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}
.oba-done-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #6ee7b7;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* ==========================================================================
   YÊU CẦU 2: TỐI ƯU DANH SÁCH LỊCH TRÌNH KHÔNG BỊ DÀI DÒNG
   ========================================================================== */
.app-timeline-wrap {
  max-height: 860px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(14, 165, 233, 0.4) transparent;
}
.app-timeline-wrap::-webkit-scrollbar {
  width: 6px;
}
.app-timeline-wrap::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.4);
  border-radius: 999px;
}

.timeline-compact-filter-toolbar {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 12px 14px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tc-day-tabs-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}
.tc-day-tabs-scroll::-webkit-scrollbar {
  display: none;
}

.tc-day-tab {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.tc-day-tab:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #f1f5f9;
}
.tc-day-tab.active {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
}
.tc-day-tab.tc-all-tab.active {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border-color: #a78bfa;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
}

.tc-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.tc-density-toggle {
  display: inline-flex;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 10px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.tc-density-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tc-density-btn.active {
  background: #0ea5e9;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);
}

.tc-session-filters {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.tc-session-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.tc-session-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
.tc-session-pill.active {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.35);
}

/* THẺ THU GỌN (COMPACT ACT ROW - KHÔNG DÀI DÒNG) */
.compact-act-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.compact-act-row:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(14, 165, 233, 0.4);
  transform: translateX(2px);
}
.compact-act-row.is-expanded {
  background: rgba(30, 41, 59, 0.95);
  border-color: #0ea5e9;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.car-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
  flex-shrink: 0;
}
.car-time {
  font-size: 13px;
  font-weight: 800;
  color: #38bdf8;
  font-variant-numeric: tabular-nums;
}
.car-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  margin-top: 3px;
}

.car-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  background: #0f172a;
}
.car-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.car-idx {
  position: absolute;
  top: 2px;
  left: 2px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
}

.car-body {
  flex: 1;
  min-width: 0;
}
.car-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.badge-type-mini {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
.car-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.car-cost {
  font-size: 12.5px;
  font-weight: 700;
  color: #4ade80;
  margin-left: auto;
}
.car-sub {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.car-addr {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}
.car-eta {
  color: #38bdf8;
  font-weight: 600;
}

.car-detail-drawer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.12);
}
.cdd-desc {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0 0 6px;
}
.cdd-dishes {
  font-size: 12.5px;
  color: #fbbf24;
  margin-bottom: 6px;
}
.cdd-meta-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.cdd-tag {
  background: rgba(255, 255, 255, 0.08);
  font-size: 11.5px;
  color: #94a3b8;
  padding: 2px 7px;
  border-radius: 5px;
}

.car-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.car-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}
.car-btn:hover {
  background: #0ea5e9;
  color: #fff;
  border-color: #38bdf8;
}
.car-chevron {
  font-size: 11px;
  color: #64748b;
  margin-left: 2px;
}

/* ==========================================================================
   PHẦN 2: MODAL XÁC NHẬN LƯU LỊCH TRÌNH TRƯỚC KHI CHUYỂN TAB
   ========================================================================== */
.save-confirm-overlay {
  z-index: 9999;
}
.save-confirm-card {
  max-width: 420px;
  width: 92%;
  text-align: center;
  padding: 36px 28px 28px;
  border-radius: 20px;
  background: var(--card-bg, #1e293b);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: scaleInModal 0.25s ease;
}
@keyframes scaleInModal {
  from { transform: scale(0.88); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
.scm-icon-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 8px 20px rgba(99,102,241,0.4);
}
.save-confirm-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}
.save-confirm-card p {
  font-size: 0.9rem;
  color: var(--text-sub, #94a3b8);
  line-height: 1.6;
  margin: 0;
}
.save-confirm-card p b {
  color: var(--text-primary, #f1f5f9);
}
.scm-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 6px;
}
.scm-btn {
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.scm-btn-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 4px 14px rgba(16,185,129,0.35);
}
.scm-btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(16,185,129,0.5);
}
.scm-btn-discard {
  background: rgba(239,68,68,0.1);
  color: #f87171;
  border: 1px solid rgba(239,68,68,0.3);
}
.scm-btn-discard:hover {
  background: rgba(239,68,68,0.2);
}
.scm-btn-cancel {
  background: rgba(255,255,255,0.05);
  color: var(--text-sub, #94a3b8);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 0.85rem;
}
.scm-btn-cancel:hover {
  background: rgba(255,255,255,0.1);
  color: var(--text-primary, #f1f5f9);
}

/* ==========================================================================
   PHẦN 3: MODAL XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU
   ========================================================================== */
.trip-detail-overlay {
  z-index: 9998;
  align-items: flex-start;
  padding: 24px 16px;
  overflow-y: auto;
}
.trip-detail-modal-card {
  max-width: 680px;
  width: 95%;
  border-radius: 20px;
  background: var(--card-bg, #1e293b);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 30px 70px rgba(0,0,0,0.55);
  overflow: hidden;
  animation: scaleInModal 0.28s ease;
  padding: 0;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}

/* TDM Header */
.tdm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.tdm-header-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tdm-dest-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: rgba(59,130,246,0.2);
  border: 1px solid rgba(59,130,246,0.4);
  color: #93c5fd;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  letter-spacing: 0.5px;
  width: fit-content;
}
.tdm-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  line-height: 1.3;
}
.tdm-meta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.tdm-meta-item {
  font-size: 0.85rem;
  color: #94a3b8;
}
.tdm-close {
  flex-shrink: 0;
  margin-top: -2px;
}

/* TDM Days List View */
.tdm-days-list-view {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.tdm-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}
.tdm-days-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tdm-day-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--bg-secondary, #0f172a);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tdm-day-row:hover {
  background: rgba(59,130,246,0.08);
  border-color: rgba(59,130,246,0.25);
  transform: translateX(3px);
}
.tdm-day-row-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tdm-day-row-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
}
.tdm-day-row-meals {
  font-size: 0.8rem;
  color: #64748b;
}
.tdm-day-row-arrow {
  font-size: 22px;
  color: #475569;
  font-weight: 300;
  line-height: 1;
}

/* TDM Budget Summary */
.tdm-budget-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tdm-budget-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.tdm-budget-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-secondary, #0f172a);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
}
.tdm-budget-total {
  grid-column: 1 / -1;
  background: rgba(59,130,246,0.08);
  border-color: rgba(59,130,246,0.25);
}
.tbi-icon {
  font-size: 16px;
}
.tbi-label {
  font-size: 0.82rem;
  color: #64748b;
  flex: 1;
}
.tbi-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
}
.tbi-total {
  color: #60a5fa;
  font-size: 1rem;
}

/* TDM Footer Actions */
.tdm-footer-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tdm-action-btn {
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tdm-open-btn {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  flex: 1;
}
.tdm-open-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(99,102,241,0.5);
}

/* TDM Day Detail View */
.tdm-day-detail-view {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tdm-back-btn {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  width: fit-content;
  transition: color 0.2s;
}
.tdm-back-btn:hover {
  color: #93c5fd;
}
.tdm-day-header-card {
  display: flex;
  gap: 16px;
  background: rgba(59,130,246,0.06);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 14px;
  padding: 16px;
  overflow: hidden;
}
.tdm-day-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tdm-day-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.tdm-day-route {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
  line-height: 1.4;
}
.tdm-day-meals {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
}
.tdm-day-img-wrap {
  width: 130px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}
.tdm-day-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tdm-day-img-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  font-size: 36px;
}

/* TDM Activities */
.tdm-activities-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-secondary, #0f172a);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 16px;
}
.tdm-activities-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}
.tdm-activities-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tdm-act-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  border-left: 3px solid rgba(59,130,246,0.3);
}
.tdm-act-time {
  font-size: 0.75rem;
  color: #475569;
  font-weight: 600;
  min-width: 44px;
  margin-top: 2px;
}
.tdm-act-icon {
  font-size: 16px;
  margin-top: 1px;
}
.tdm-act-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}
.tdm-act-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
}
.tdm-act-desc {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
}
.tdm-act-cost {
  font-size: 0.78rem;
  color: #f59e0b;
  font-weight: 600;
}
.tdm-act-cost.free-tag {
  color: #10b981;
}

/* User Profile & Trips CSS */
.profile-card-premium {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}
.profile-cover {
  height: 120px;
  background: linear-gradient(135deg, #0ea5e9, #10b981);
  position: relative;
}
.edit-profile-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: 0.2s;
}
.edit-profile-btn:hover { background: rgba(255,255,255,0.3); }
.profile-avatar-premium {
  position: relative;
  width: 100px;
  height: 100px;
  margin: -50px auto 16px;
  border-radius: 50%;
  border: 4px solid white;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: 800;
}
.level-badge {
  position: absolute;
  bottom: -5px;
  background: #8b5cf6;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  border: 2px solid white;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.profile-info-premium {
  padding: 0 24px 24px;
  text-align: center;
}
.profile-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}
.admin-badge {
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  vertical-align: middle;
}
.profile-email {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 12px;
}
.profile-bio {
  color: #475569;
  font-style: italic;
  font-size: 0.95rem;
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.profile-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
}
.stat-box-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-box-premium .stat-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}
.stat-box-premium strong {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}
.stat-box-premium small {
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
}
.logout-btn-premium {
  background: white;
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}
.logout-btn-premium:hover {
  background: #fef2f2;
}

.profile-edit-form {
  padding: 0 24px 24px;
  text-align: left;
}
.profile-edit-form h3 {
  margin-bottom: 20px;
  text-align: center;
}
.edit-field {
  margin-bottom: 16px;
}
.edit-field label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}
.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.cancel-edit-btn {
  flex: 1;
  background: white;
  border: 1px solid #cbd5e1;
  color: #64748b;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.save-edit-btn {
  flex: 2;
  background: #10b981;
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
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

</style>
