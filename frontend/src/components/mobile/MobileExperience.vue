<template>
  <div :class="['mobile-experience', { 'is-locked-explore': currentTab === 'explore' && !generatedPlan }]">
    <!-- Top Header -->
    <header :class="['mobile-top-header', { 'header-overlay': currentTab === 'explore' && !generatedPlan }]">
      <div class="mobile-brand">
        <img src="/logo.png" alt="Travel Trips" class="mobile-logo-img" />
        <div class="mobile-brand-title-wrap">
          <span class="mobile-brand-name">Travel Trips</span>
          <span class="mobile-brand-tagline">Miền Trung • Bản Sắc & Hành Trình</span>
        </div>
      </div>
      <div class="mobile-top-actions">
        <button
          type="button"
          class="mobile-theme-btn"
          :title="isDark ? 'Chế độ sáng' : 'Chế độ tối'"
          @click="$emit('toggleDark')"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>
        <button
          v-if="nguoiDung"
          type="button"
          class="mobile-user-avatar"
          @click="currentTab = 'profile'"
        >
          <img v-if="nguoiDung.avatar" :src="nguoiDung.avatar" alt="Avatar" />
          <span v-else>{{ nguoiDung.name ? nguoiDung.name.charAt(0).toUpperCase() : 'U' }}</span>
        </button>
        <button
          v-else
          type="button"
          class="mobile-login-btn"
          @click="$emit('openAuth')"
        >
          Đăng nhập
        </button>
      </div>
    </header>

    <!-- MAIN VIEWS BASED ON TAB -->
    <main class="mobile-content-body">

      <!-- TAB 1: KHÁM PHÁ & LẬP LỊCH NHANH (HOME / EXPLORE) -->
      <section v-if="currentTab === 'explore'" class="tab-view explore-view">
        
        <!-- Hero Storytelling Banner with Floating Capsule Prompt (Phủ toàn màn hình chuẩn Framer) -->
        <div
          :class="['mobile-hero-card', { 'hero-fullscreen': !generatedPlan, 'hero-compact': !!generatedPlan }]"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <!-- Dynamic Background Slideshow with smooth crossfade & Ken Burns zoom -->
          <div class="m-hero-bg-slider">
            <div
              v-for="(slide, sIdx) in heroSlides"
              :key="sIdx"
              :class="['m-hero-bg-slide', { active: currentSlideIndex === sIdx }]"
              :style="{ backgroundImage: `url(${slide.url})` }"
            ></div>
            <div class="m-hero-gradient-overlay"></div>
          </div>
          
          <!-- Watermark VIETNAM với nón lá phong cách Framer -->
          <div class="m-hero-watermark">
            <div class="watermark-hat-icon">
              <svg width="60" height="38" viewBox="0 0 100 65" fill="none">
                <path d="M50 5 L95 55 L5 55 Z" fill="#fde68a" stroke="#d97706" stroke-width="2.5"/>
                <path d="M35 55 Q50 64 65 55" stroke="#b45309" stroke-width="2" fill="none"/>
                <line x1="50" y1="5" x2="50" y2="55" stroke="#b45309" stroke-width="1.5" stroke-dasharray="3 3"/>
              </svg>
            </div>
            <span>VIETNAM</span>
          </div>

          <!-- Hero Narrative Center Content -->
          <div class="m-hero-center-cluster">
            <div class="m-hero-text">
              <span class="m-hero-kicker">01 / KHỞI ĐẦU</span>
              <h1 class="m-hero-title">
                Một Việt Nam.<br />
                <em>Muôn hành trình.</em>
              </h1>
              <p class="m-hero-subtitle">
                Từ những lớp sương vùng cao đến nhịp sống di sản và hương vị bản địa — AI sẵn sàng kiến tạo và tối ưu trọn vẹn lộ trình cho bạn.
              </p>
            </div>
          </div>

          <!-- Bottom Cluster: Capsule Prompt & Interactive Bar -->
          <div class="m-hero-bottom-cluster">
            <div class="mobile-prompt-capsule">
              <div class="capsule-input-row">
                <span class="sparkle-icon">✦</span>
                <input
                  v-model="quickPromptText"
                  type="text"
                  class="capsule-prompt-input"
                  :placeholder="isListening ? '🎙️ Đang lắng nghe bạn nói...' : 'VD: 3 ngày Đà Nẵng - Hội An, thích ẩm thực...'"
                  @keyup.enter="handleGenerateFromPrompt"
                />
                <!-- NÚT MICRO NHẬP GIỌNG NÓI TIẾNG VIỆT -->
                <button
                  type="button"
                  :class="['capsule-mic-btn', { listening: isListening }]"
                  :title="isListening ? 'Đang nghe... Bấm để dừng' : 'Nói để lên lịch trình'"
                  @click="toggleVoiceInput"
                >
                  <svg v-if="!isListening" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                  <span v-else class="mic-wave-pulse"></span>
                </button>
                <button
                  class="capsule-submit-btn"
                  :disabled="isGenerating || !quickPromptText.trim()"
                  @click="handleGenerateFromPrompt"
                >
                  <span v-if="!isGenerating">Lên lịch →</span>
                  <span v-else>Đang tính...</span>
                </button>
              </div>

              <!-- Quick Filter Pills inside capsule -->
              <div class="capsule-quick-pills">
                <button
                  v-for="pill in popularPills"
                  :key="pill"
                  :class="['capsule-pill-btn', { active: isPillActive(pill) }]"
                  @click="togglePill(pill)"
                >
                  <span v-if="isPillActive(pill)" class="pill-check">✓ </span>{{ pill }}
                </button>
              </div>

              <!-- Nút mẹo tối ưu lịch trình AI chuyên nghiệp & súc tích -->
              <div class="capsule-guide-row">
                <button type="button" class="btn-prompt-guide" @click="openGuidanceSheet(false)">
                  <span class="guide-bulb">💡</span>
                  <span class="guide-text">Mẹo tối ưu lịch trình AI</span>
                  <span class="guide-arrow">›</span>
                </button>
              </div>
            </div>

            <!-- Sleek interactive bar at bottom of hero -->
            <div class="m-hero-interactive-row">
              <div class="m-interactive-left">
                <!-- Nút chỉ báo chuyển ảnh có thể chạm chuyển -->
                <div class="hero-slide-dots">
                  <button
                    v-for="(_, idx) in heroSlides"
                    :key="idx"
                    type="button"
                    :class="['hero-dot-btn', { active: currentSlideIndex === idx }]"
                    :title="heroSlides[idx].title"
                    @click.stop="setSlide(idx)"
                  ></button>
                </div>
                <span class="m-interactive-tag">
                  {{ heroSlides[currentSlideIndex].title }} • {{ heroSlides[currentSlideIndex].tag }}
                </span>
              </div>
              <span v-if="weather" class="m-interactive-weather">
                {{ weather.location?.name || 'Đà Nẵng' }} {{ Math.round(weather.current?.temperature || 28) }}°C
              </span>
              <span v-else class="m-interactive-coord">{{ heroSlides[currentSlideIndex].coord }}</span>
            </div>
          </div>
        </div>

        <!-- LOADING INDICATOR -->
        <div v-if="isGenerating" class="mobile-plan-loading">
          <div class="loading-flower-icon">🌿</div>
          <h4>AI đang phân tích và kiến tạo lịch trình...</h4>
          <p>Tối ưu hóa các điểm đến, nhà xe và chi phí theo thời gian thực</p>
        </div>

        <!-- GENERATED PLAN RESULT (Khi AI tạo xong) -->
        <div v-if="generatedPlan && !isGenerating" class="mobile-generated-plan">
          <div class="plan-summary-banner">
            <div class="plan-badge-line">
              <span class="badge-emerald">LỊCH TRÌNH CÁ NHÂN HÓA</span>
              <span class="badge-amber">{{ (generatedPlan.daysList || generatedPlan.days || []).length }} Ngày</span>
            </div>
            <h2 class="plan-dest-name">{{ generatedPlan.destination || 'Miền Trung' }}</h2>
            <p class="plan-meta-info">
              Dự toán: ~{{ formatMoney(generatedPlan.total_budget || 0) }}đ • {{ generatedPlan.people || 1 }} người
            </p>

            <div class="plan-quick-buttons">
              <button class="btn-save-mobile-plan" @click="savePlan">
                ❤️ {{ isPlanSaved ? 'Đã lưu' : 'Lưu chuyến đi' }}
              </button>
              <button class="btn-reset-mobile-plan" @click="generatedPlan = null">
                ✕ Nhập lại
              </button>
            </div>
          </div>

          <!-- Day selector pills -->
          <div class="plan-day-pills-row">
            <button
              v-for="(day, dIdx) in (generatedPlan.daysList || generatedPlan.days || [])"
              :key="dIdx"
              :class="['day-pill-item', { active: currentActiveDayIndex === dIdx }]"
              @click="currentActiveDayIndex = dIdx"
            >
              Ngày {{ day.day || dIdx + 1 }}
            </button>
          </div>

          <!-- Active Day Schedule Timeline -->
          <div v-if="currentDayActivities" class="day-activities-card">
            <h3 class="day-activities-title">
              {{ currentDayActivities.theme || `Lịch trình Ngày ${currentActiveDayIndex + 1}` }}
            </h3>

            <div class="timeline-activity-list">
              <div
                v-for="(act, aIdx) in (currentDayActivities.activities || [])"
                :key="aIdx"
                class="timeline-act-node"
              >
                <div class="act-time-pill">{{ act.time || `${8 + aIdx * 3}:00` }}</div>
                <div class="act-info-box">
                  <span class="act-category-tag">{{ act.period || 'Điểm đến' }}</span>
                  <h4 class="act-place-title">{{ act.place || act.title || act.activity }}</h4>
                  <p class="act-desc-text">{{ act.description || act.note }}</p>
                  <div v-if="act.cost || act.tips" class="act-meta-tags">
                    <span v-if="act.cost" class="act-cost-tag">💰 {{ formatMoney(act.cost) }}đ</span>
                    <span v-if="act.tips" class="act-tip-tag">💡 {{ act.tips }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- REALTIME WEATHER COMPACT -->
        <div v-if="weather && generatedPlan" class="mobile-weather-strip">
          <div class="weather-strip-left">
            <span class="weather-label">THỜI TIẾT ĐÀ NẴNG & MIỀN TRUNG</span>
            <h4 class="weather-city-name">{{ weather.location?.name || 'Đà Nẵng' }}</h4>
            <p class="weather-status-text">{{ getWeatherDesc(weather.current?.weatherCode) }}</p>
          </div>
          <div class="weather-strip-right">
            <span class="weather-icon-large">{{ getWeatherEmoji(weather.current?.weatherCode) }}</span>
            <span class="weather-temp-number">{{ Math.round(weather.current?.temperature || 28) }}°C</span>
          </div>
        </div>

      </section>

      <!-- TAB 2: CHUYẾN ĐI ĐÃ LƯU (MY TRIPS) -->
      <section v-if="currentTab === 'mytrips'" class="tab-view trips-view">
        <div class="trips-header-block">
          <h2 class="trips-main-title">Chuyến đi đã lưu</h2>
          <p class="trips-sub-title">Danh sách các lịch trình bạn đã lên kế hoạch</p>
        </div>

        <div v-if="savedTrips.length === 0" class="empty-trips-card">
          <span class="empty-icon">🎒</span>
          <h3>Chưa có chuyến đi nào</h3>
          <p>Hãy thử nhập điểm đến tại trang chủ để AI tạo chuyến đi đầu tiên của bạn!</p>
          <button class="btn-primary-mobile mini" @click="currentTab = 'explore'">
            Khám phá ngay
          </button>
        </div>

        <div v-else class="saved-trips-list">
          <div
            v-for="trip in savedTrips"
            :key="trip._id"
            class="saved-trip-item"
            @click="openSavedTripDetail(trip)"
          >
            <div class="trip-item-top">
              <span class="trip-dest-badge">{{ trip.destination }}</span>
              <span class="trip-days-badge">{{ (trip.daysList || trip.days || []).length }} Ngày</span>
            </div>
            <h3 class="trip-card-name">{{ trip.destination }} — {{ (trip.daysList || trip.days || []).length }} Ngày</h3>
            <p class="trip-budget-line">
              💰 {{ formatMoney(trip.total_budget || 0) }}đ • {{ trip.people || 1 }} người
            </p>
            <div class="trip-item-bottom">
              <span class="trip-hint-text">Chạm để xem lộ trình →</span>
              <button class="trip-delete-btn" @click.stop="deleteSavedTrip(trip._id)">
                Xóa
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 4: TÀI KHOẢN (PROFILE) -->
      <section v-if="currentTab === 'profile'" class="tab-view profile-view">
        
        <!-- TRƯỜNG HỢP 1: NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP -->
        <div v-if="nguoiDung" class="m-profile-wrapper">
          
          <!-- Profile Header Card với Cover Photo & Avatar -->
          <div class="m-profile-hero-card">
            <div class="m-profile-cover" style="background-image: url('/images/slides/danang-cauvang.jpg');">
              <div class="m-profile-cover-overlay"></div>
            </div>

            <div class="m-profile-user-cluster">
              <!-- Avatar Circle với nút camera edit nhanh -->
              <div class="m-avatar-wrap" @click="openEditProfileSheet">
                <img v-if="nguoiDung.avatar" :src="nguoiDung.avatar" alt="Avatar" class="m-avatar-img" />
                <div v-else class="m-avatar-fallback">{{ nguoiDung.name ? nguoiDung.name.charAt(0).toUpperCase() : 'U' }}</div>
                <button type="button" class="m-avatar-edit-badge" title="Đổi ảnh đại diện">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
              </div>

              <!-- Tên, Email & Cấp bậc Level -->
              <div class="m-user-text">
                <div class="m-name-row">
                  <h2 class="m-user-title">{{ nguoiDung.name || 'Lữ khách' }}</h2>
                  <span v-if="nguoiDung.role === 'admin'" class="m-admin-tag">ADMIN</span>
                </div>
                <p class="m-user-email">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ nguoiDung.email }}
                </p>
                <div class="m-badge-row">
                  <span class="m-level-pill" :style="{ backgroundColor: computedUserLevel.color }">
                    ✦ {{ computedUserLevel.title }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bio Giới thiệu bản thân -->
            <div class="m-bio-box" @click="openEditProfileSheet">
              <p v-if="nguoiDung.bio" class="m-bio-content">“{{ nguoiDung.bio }}”</p>
              <p v-else class="m-bio-placeholder">
                ✏️ Chạm vào đây để thêm câu giới thiệu sở thích du lịch...
              </p>
            </div>

            <!-- Nút chỉnh sửa hồ sơ -->
            <div class="m-profile-actions">
              <button type="button" class="btn-m-edit" @click="openEditProfileSheet">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>

          <!-- BENTO STATS CARDS: 4 CHỈ SỐ HÀNH TRÌNH -->
          <div class="m-stats-bento">
            <div class="m-stat-cell stat-emerald">
              <div class="stat-top">
                <span class="stat-icon">🎒</span>
                <span class="stat-number">{{ (savedTrips && savedTrips.length) || myTripsCount || 0 }}</span>
              </div>
              <span class="stat-label">Chuyến đi đã lên</span>
            </div>

            <div class="m-stat-cell stat-amber">
              <div class="stat-top">
                <span class="stat-icon">✅</span>
                <span class="stat-number">{{ nguoiDung.completed_trips || 0 }}</span>
              </div>
              <span class="stat-label">Đã hoàn thành</span>
            </div>

            <div class="m-stat-cell stat-rose">
              <div class="stat-top">
                <span class="stat-icon">❤️</span>
                <span class="stat-number">{{ favoritesCount || 0 }}</span>
              </div>
              <span class="stat-label">Điểm yêu thích</span>
            </div>

            <div class="m-stat-cell stat-violet">
              <div class="stat-top">
                <span class="stat-icon">🪙</span>
                <span class="stat-number">{{ nguoiDung.points || 0 }}</span>
              </div>
              <span class="stat-label">Điểm tích lũy</span>
            </div>
          </div>

          <!-- NHÓM CÀI ĐẶT & TIỆN ÍCH -->
          <div class="m-settings-group">
            <h3 class="m-group-header">TIỆN ÍCH & TRẢI NGHIỆM</h3>
            
            <div class="m-settings-list">
              <!-- Dark Mode Switch -->
              <div class="m-setting-item" @click="$emit('toggleDark')">
                <div class="m-item-left">
                  <span class="m-item-icon">{{ isDark ? '🌙' : '☀️' }}</span>
                  <div class="m-item-text">
                    <span class="m-item-title">Chế độ giao diện</span>
                    <span class="m-item-sub">{{ isDark ? 'Chế độ tối (Dark Mode)' : 'Chế độ sáng (Light Mode)' }}</span>
                  </div>
                </div>
                <div class="m-switch-toggle" :class="{ on: isDark }">
                  <span class="m-switch-knob"></span>
                </div>
              </div>

              <!-- Lịch trình đã lưu -->
              <div class="m-setting-item" @click="currentTab = 'mytrips'">
                <div class="m-item-left">
                  <span class="m-item-icon">🗺️</span>
                  <div class="m-item-text">
                    <span class="m-item-title">Chuyến đi của tôi</span>
                    <span class="m-item-sub">{{ savedTrips.length }} lịch trình sẵn sàng</span>
                  </div>
                </div>
                <span class="m-chevron">›</span>
              </div>

              <!-- Offline Data / Cache -->
              <div class="m-setting-item" @click="clearTripCache">
                <div class="m-item-left">
                  <span class="m-item-icon">⚡</span>
                  <div class="m-item-text">
                    <span class="m-item-title">Bộ nhớ tạm & Lưu ngoại tuyến</span>
                    <span class="m-item-sub">Đã tối ưu hóa bộ nhớ thiết bị</span>
                  </div>
                </div>
                <span class="m-item-pill">Đang bật</span>
              </div>
            </div>
          </div>

          <!-- NHÓM THÔNG TIN ỨNG DỤNG -->
          <div class="m-settings-group">
            <h3 class="m-group-header">THÔNG TIN ỨNG DỤNG</h3>
            
            <div class="m-settings-list">
              <div class="m-setting-item" @click="showSupportNotice">
                <div class="m-item-left">
                  <span class="m-item-icon">💬</span>
                  <div class="m-item-text">
                    <span class="m-item-title">Trợ giúp & Góp ý</span>
                    <span class="m-item-sub">Phản hồi trải nghiệm người dùng</span>
                  </div>
                </div>
                <span class="m-chevron">›</span>
              </div>

              <div class="m-setting-item">
                <div class="m-item-left">
                  <span class="m-item-icon">🌿</span>
                  <div class="m-item-text">
                    <span class="m-item-title">Phiên bản Travel Trips</span>
                    <span class="m-item-sub">v2.5 Mobile Edition • Miền Trung</span>
                  </div>
                </div>
                <span class="m-item-pill green">Mới nhất</span>
              </div>
            </div>
          </div>

          <!-- NÚT ĐĂNG XUẤT -->
          <div class="m-logout-wrap">
            <button type="button" class="btn-m-logout" @click="$emit('logout')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Đăng xuất khỏi tài khoản
            </button>
          </div>

        </div>

        <!-- TRƯỜNG HỢP 2: KHÁCH CHƯA ĐĂNG NHẬP (GUEST MODE) -->
        <div v-else class="m-guest-wrapper">
          <div class="m-guest-card">
            <div class="m-guest-badge">
              <img src="/logo.png" alt="Travel Trips" class="m-guest-logo" />
            </div>
            <h2 class="m-guest-title">Chào mừng bạn đến với Travel Trips</h2>
            <p class="m-guest-sub">
              Đăng nhập tài khoản để đồng bộ các chuyến đi, lưu điểm đến yêu thích và nhận điểm thưởng độc quyền.
            </p>

            <button type="button" class="btn-guest-login" @click="$emit('openAuth')">
              Đăng nhập / Đăng ký ngay →
            </button>

            <!-- Lợi ích khi có tài khoản -->
            <div class="m-guest-benefits">
              <div class="benefit-row">
                <span class="b-icon">✨</span>
                <span>Lên lịch AI không giới hạn theo sở thích</span>
              </div>
              <div class="benefit-row">
                <span class="b-icon">📍</span>
                <span>Lưu & đồng bộ dữ liệu trên cả điện thoại và máy tính</span>
              </div>
              <div class="benefit-row">
                <span class="b-icon">🪙</span>
                <span>Tích điểm thưởng sau mỗi chuyến đi hoàn thành</span>
              </div>
            </div>
          </div>

          <!-- Quick Theme Switch for Guest -->
          <div class="m-settings-list" style="margin-top: 14px;">
            <div class="m-setting-item" @click="$emit('toggleDark')">
              <div class="m-item-left">
                <span class="m-item-icon">{{ isDark ? '🌙' : '☀️' }}</span>
                <div class="m-item-text">
                  <span class="m-item-title">Chế độ giao diện</span>
                  <span class="m-item-sub">{{ isDark ? 'Chế độ tối' : 'Chế độ sáng' }}</span>
                </div>
              </div>
              <div class="m-switch-toggle" :class="{ on: isDark }">
                <span class="m-switch-knob"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MODAL CHỈNH SỬA HỒ SƠ (BOTTOM SHEET DÀNH RIÊNG CHO MOBILE) -->
      <Teleport to="body">
          <div v-if="isEditingProfile" class="m-bottom-sheet-overlay" @click.self="isEditingProfile = false">
            <div class="m-bottom-sheet-content">
              <div class="sheet-handle-bar"></div>
              
              <div class="sheet-header">
                <div class="sheet-title-group">
                  <h3 class="sheet-title">Chỉnh sửa hồ sơ cá nhân</h3>
                  <p class="sheet-subtitle">Cập nhật thông tin nhận diện của bạn</p>
                </div>
                <button type="button" class="sheet-close-btn" @click="isEditingProfile = false" aria-label="Đóng">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div class="sheet-body">
                <!-- Avatar Upload Section -->
                <div class="sheet-avatar-row">
                  <div class="sheet-avatar-preview" @click="triggerAvatarUpload" title="Chạm để đổi ảnh đại diện">
                    <img v-if="profileEditForm.avatar" :src="profileEditForm.avatar" alt="Avatar" />
                    <div v-else class="preview-initial">{{ profileEditForm.name ? profileEditForm.name.charAt(0).toUpperCase() : 'U' }}</div>
                    <div class="sheet-avatar-overlay-badge">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  </div>

                  <div class="sheet-avatar-info">
                    <button type="button" class="sheet-avatar-upload-btn" @click="triggerAvatarUpload">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Chọn ảnh từ máy</span>
                    </button>
                    <!-- Input file ẩn hoàn toàn 100% -->
                    <input
                      ref="avatarFileInput"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      class="sheet-file-hidden"
                      @change="handleAvatarUpload"
                    />
                    <span class="sheet-avatar-hint">Định dạng JPG, PNG, WebP • Tối đa 3MB</span>
                  </div>
                </div>

                <!-- Input Name -->
                <div class="sheet-field">
                  <div class="sheet-field-header">
                    <label class="sheet-label">Tên hiển thị</label>
                    <span class="sheet-required">*</span>
                  </div>
                  <div class="sheet-input-wrapper">
                    <svg class="sheet-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input
                      v-model="profileEditForm.name"
                      type="text"
                      maxlength="50"
                      class="sheet-input with-icon"
                      placeholder="Nhập tên của bạn..."
                    />
                  </div>
                </div>

                <!-- Input Bio -->
                <div class="sheet-field">
                  <div class="sheet-field-header">
                    <label class="sheet-label">Giới thiệu bản thân (Bio)</label>
                    <span class="sheet-char-count">{{ profileEditForm.bio ? profileEditForm.bio.length : 0 }}/160</span>
                  </div>
                  <div class="sheet-input-wrapper">
                    <textarea
                      v-model="profileEditForm.bio"
                      class="sheet-textarea"
                      rows="3"
                      maxlength="160"
                      placeholder="Sở thích du lịch, địa điểm yêu thích của bạn..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="sheet-footer">
                <button type="button" class="btn-sheet-cancel" @click="isEditingProfile = false">
                  Hủy
                </button>
                <button
                  type="button"
                  class="btn-sheet-save"
                  :disabled="isSavingProfile || !profileEditForm.name.trim()"
                  @click="saveProfile"
                >
                  <svg v-if="!isSavingProfile" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span v-if="!isSavingProfile">Lưu thay đổi</span>
                  <span v-else>Đang lưu...</span>
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- MODAL HƯỚNG DẪN & HOÀN THIỆN THÔNG TIN LỊCH TRÌNH (SMART ITINERARY ASSISTANT) -->
        <Teleport to="body">
          <div v-if="showGuidanceSheet" class="m-bottom-sheet-overlay" @click.self="showGuidanceSheet = false">
            <div class="m-bottom-sheet-content m-guidance-sheet">
              <div class="sheet-handle-bar"></div>

              <div class="sheet-header">
                <div class="sheet-title-group">
                  <div class="guidance-badge">
                    <span>💡 BÍ QUYẾT TỐI ƯU</span>
                  </div>
                  <h3 class="sheet-title">Mẹo tối ưu lịch trình cùng AI</h3>
                  <p class="sheet-subtitle">
                    Bổ sung các chi tiết bên dưới giúp AI đề xuất điểm đến, ẩm thực và ngân sách chính xác theo mong muốn của bạn:
                  </p>
                </div>
                <button type="button" class="sheet-close-btn" @click="showGuidanceSheet = false" aria-label="Đóng">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <!-- Danh sách 4 thông tin cốt lõi -->
              <div class="guidance-checklist-scroll">
                
                <!-- 1. Điểm đến -->
                <div class="guidance-item" :class="{ 'is-ready': guidanceForm.destination }">
                  <div class="g-item-header">
                    <span class="g-item-icon">📍</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">1. Điểm đến</span>
                        <span class="g-status-badge" :class="guidanceForm.destination ? 'ready' : 'missing'">
                          {{ guidanceForm.destination ? '✓ ' + guidanceForm.destination : '⚠️ Cần chọn điểm đến' }}
                        </span>
                      </div>
                      <span class="g-item-desc">Tỉnh/thành bạn muốn ghé thăm tại Miền Trung</span>
                    </div>
                  </div>
                  <div class="g-item-control">
                    <div class="g-chips-scroll">
                      <button
                        v-for="city in cityList"
                        :key="city"
                        type="button"
                        :class="['g-chip-btn', { active: guidanceForm.destination === city }]"
                        @click="guidanceForm.destination = city"
                      >
                        {{ city }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 2. Số ngày đi -->
                <div class="guidance-item" :class="{ 'is-ready': guidanceForm.days }">
                  <div class="g-item-header">
                    <span class="g-item-icon">⏱️</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">2. Số ngày đi</span>
                        <span class="g-status-badge ready">
                          {{ guidanceForm.days }} ngày {{ guidanceForm.days > 1 ? `${guidanceForm.days - 1} đêm` : '' }}
                        </span>
                      </div>
                      <span class="g-item-desc">Để AI phân bổ các cụm tham quan hợp lý theo từng ngày</span>
                    </div>
                  </div>
                  <div class="g-item-control">
                    <div class="g-chips-row">
                      <button
                        v-for="d in [1, 2, 3, 4, 5]"
                        :key="d"
                        type="button"
                        :class="['g-chip-btn', { active: guidanceForm.days === d }]"
                        @click="selectGuidanceDays(d)"
                      >
                        {{ d }} Ngày
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 3. Số người tham gia -->
                <div class="guidance-item" :class="{ 'is-ready': guidanceForm.peopleProvided }">
                  <div class="g-item-header">
                    <span class="g-item-icon">👥</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">3. Số người tham gia</span>
                        <span class="g-status-badge" :class="guidanceForm.peopleProvided ? 'ready' : 'notice'">
                          {{ guidanceForm.peopleProvided ? `✓ ${guidanceForm.people} người` : '⚠️ Chưa có (Mặc định: 1)' }}
                        </span>
                      </div>
                      <span class="g-item-desc">Để tính số phòng khách sạn, vé xe và khẩu phần ăn</span>
                    </div>
                  </div>
                  <div class="g-item-control">
                    <div class="g-chips-row">
                      <button
                        v-for="opt in peopleOptions"
                        :key="opt.val"
                        type="button"
                        :class="['g-chip-btn', { active: guidanceForm.people === opt.val }]"
                        @click="selectGuidancePeople(opt.val)"
                      >
                        {{ opt.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 4. Ngân sách dự kiến -->
                <div class="guidance-item" :class="{ 'is-ready': guidanceForm.budgetProvided }">
                  <div class="g-item-header">
                    <span class="g-item-icon">💰</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">4. Ngân sách dự kiến</span>
                        <span class="g-status-badge" :class="guidanceForm.budgetProvided ? 'ready' : 'notice'">
                          {{ guidanceForm.budgetProvided ? `✓ ~${formatMoney(guidanceForm.budget)}đ` : '⚠️ Chưa có (Chọn mức)' }}
                        </span>
                      </div>
                      <span class="g-item-desc">Để AI gợi ý đúng phân khúc phòng ở và nhà hàng</span>
                    </div>
                  </div>
                  <div class="g-item-control">
                    <div class="g-budget-cards">
                      <button
                        v-for="tier in budgetTierOptions"
                        :key="tier.key"
                        type="button"
                        :class="['g-budget-tier-btn', { active: guidanceForm.budgetTier === tier.key }]"
                        @click="selectGuidanceBudgetTier(tier.key)"
                      >
                        <span class="tier-name">{{ tier.label }}</span>
                        <span class="tier-cost">~{{ formatMoney(tier.perDay) }}đ/người/ngày</span>
                        <span class="tier-desc">{{ tier.desc }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 5. Mẫu câu lệnh gợi ý chuẩn -->
                <div class="guidance-examples-card">
                  <div class="g-ex-header">
                    <span>✨ Mẫu câu lệnh đầy đủ chuẩn xác nhất:</span>
                  </div>
                  <div class="g-ex-list">
                    <button
                      v-for="ex in promptExamples"
                      :key="ex"
                      type="button"
                      class="g-ex-btn"
                      @click="applyExamplePrompt(ex)"
                    >
                      “{{ ex }}”
                    </button>
                  </div>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="sheet-footer">
                <button type="button" class="btn-sheet-cancel" @click="showGuidanceSheet = false">
                  Đóng
                </button>
                <button
                  type="button"
                  class="btn-sheet-save btn-guidance-generate"
                  :disabled="isGenerating || !guidanceForm.destination"
                  @click="submitGuidancePlan"
                >
                  <span v-if="!isGenerating">🚀 Lên lịch với thông tin này</span>
                  <span v-else>Đang tính...</span>
                </button>
              </div>

            </div>
          </div>
        </Teleport>

    </main>

    <!-- BOTTOM TAB NAVIGATION (MOBILE BAR) -->
    <nav class="mobile-bottom-nav">
      <button
        :class="['nav-tab-btn', { active: currentTab === 'explore' }]"
        @click="currentTab = 'explore'"
      >
        <AppIcon name="compass" :size="20" />
        <span>Khám phá</span>
      </button>

      <button
        :class="['nav-tab-btn', { active: currentTab === 'mytrips' }]"
        @click="currentTab = 'mytrips'"
      >
        <AppIcon name="luggage" :size="20" />
        <span>Chuyến đi</span>
      </button>

      <button
        :class="['nav-tab-btn', { active: currentTab === 'profile' }]"
        @click="currentTab = 'profile'"
      >
        <AppIcon name="user" :size="20" />
        <span>Cá nhân</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import api from '../../services/api'

const props = defineProps({
  nguoiDung: { type: Object, default: null },
  isDark: { type: Boolean, default: false },
  myTripsCount: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 },
  userLevelInfo: { type: Object, default: null }
})

const emit = defineEmits(['toggleDark', 'openAuth', 'logout', 'showToast', 'userUpdated'])

// SLIDESHOW HÌNH ẢNH THẬT 100% DANH THẮNG MIỀN TRUNG
const heroSlides = [
  {
    url: '/images/slides/danang-cauvang.jpg',
    title: 'Đà Nẵng',
    tag: 'Cầu Vàng Bà Nà Hills',
    coord: '16°03′N 108°12′E'
  },
  {
    url: '/images/slides/hoian-phoco.jpg',
    title: 'Hội An',
    tag: 'Phố cổ đèn lồng di sản',
    coord: '15°52′N 108°19′E'
  },
  {
    url: '/images/slides/hue-codohue.jpg',
    title: 'Cố đô Huế',
    tag: 'Kinh thành di sản ngàn năm',
    coord: '16°28′N 107°34′E'
  },
  {
    url: '/images/slides/quynhon-kyco.jpg',
    title: 'Quy Nhơn',
    tag: 'Kỳ Co • Eo Gió biển ngọc',
    coord: '13°46′N 109°14′E'
  },
  {
    url: '/images/slides/mientrung-nonnuoc.jpg',
    title: 'Miền Trung',
    tag: 'Non nước kỳ quan bất tận',
    coord: '16°00′N 108°00′E'
  }
]

const currentSlideIndex = ref(0)
let slideTimer = null
let touchStartX = 0

function nextSlide() {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % heroSlides.length
}

function prevSlide() {
  currentSlideIndex.value = (currentSlideIndex.value - 1 + heroSlides.length) % heroSlides.length
}

function setSlide(idx) {
  currentSlideIndex.value = idx
  restartSlideTimer()
}

function restartSlideTimer() {
  if (slideTimer) clearInterval(slideTimer)
  slideTimer = setInterval(nextSlide, 4500)
}

function handleTouchStart(e) {
  if (e.touches && e.touches[0]) {
    touchStartX = e.touches[0].clientX
  }
}

function handleTouchEnd(e) {
  if (e.changedTouches && e.changedTouches[0]) {
    const diff = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(diff) > 40) {
      if (diff < 0) nextSlide()
      else prevSlide()
      restartSlideTimer()
    }
  }
}

const currentTab = ref('explore')
const quickPromptText = ref('')
const isGenerating = ref(false)
const isListening = ref(false)
let speechRecognition = null
const generatedPlan = ref(null)
const currentActiveDayIndex = ref(0)
const isPlanSaved = ref(false)
const weather = ref(null)
const savedTrips = ref([])

// PROFILE LEVEL & EDIT STATE
const computedUserLevel = computed(() => {
  if (props.userLevelInfo) return props.userLevelInfo
  const trips = props.nguoiDung?.completed_trips || 0
  if (trips >= 10) return { title: 'Thám Hiểm Gia', icon: 'crown', color: '#8b5cf6' }
  if (trips >= 5) return { title: 'Lữ Khách Sành Sỏi', icon: 'rocket', color: '#f59e0b' }
  if (trips >= 2) return { title: 'Phượt Thủ Tích Cực', icon: 'luggage', color: '#3b82f6' }
  return { title: 'Tân Thủ Khám Phá', icon: 'sprout', color: '#10b981' }
})

const isEditingProfile = ref(false)
const isSavingProfile = ref(false)
const profileEditForm = reactive({
  name: '',
  bio: '',
  avatar: ''
})

const avatarFileInput = ref(null)

function triggerAvatarUpload() {
  if (avatarFileInput.value) {
    avatarFileInput.value.click()
  }
}

function openEditProfileSheet() {
  profileEditForm.name = props.nguoiDung?.name || ''
  profileEditForm.bio = props.nguoiDung?.bio || ''
  profileEditForm.avatar = props.nguoiDung?.avatar || ''
  isEditingProfile.value = true
}

function handleAvatarUpload(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  if (file.size > 3 * 1024 * 1024) {
    alert('Vui lòng chọn ảnh có dung lượng dưới 3MB!')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    profileEditForm.avatar = event.target.result
  }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  if (!profileEditForm.name.trim()) {
    alert('Vui lòng nhập tên hiển thị!')
    return
  }
  isSavingProfile.value = true
  try {
    const res = await api.put('/auth/update-profile', {
      name: profileEditForm.name.trim(),
      bio: profileEditForm.bio.trim(),
      avatar: profileEditForm.avatar
    })
    emit('userUpdated', res.data)
    localStorage.setItem('user', JSON.stringify(res.data))
    isEditingProfile.value = false
    alert('Cập nhật hồ sơ thành công!')
  } catch (err) {
    console.error('Lỗi cập nhật hồ sơ:', err)
    alert(err.response?.data?.error || 'Không thể cập nhật hồ sơ. Vui lòng thử lại!')
  } finally {
    isSavingProfile.value = false
  }
}

function clearTripCache() {
  if (confirm('Làm mới bộ nhớ đệm và dữ liệu ngoại tuyến của ứng dụng?')) {
    localStorage.removeItem('my_saved_trips')
    savedTrips.value = []
    alert('Đã dọn dẹp bộ nhớ đệm thành công!')
  }
}

function showSupportNotice() {
  alert('Đội ngũ Travel Trips Miền Trung luôn sẵn sàng hỗ trợ bạn qua email: hotro@traveltrips.vn hoặc Hotline 1900 6868!')
}

const popularPills = ['Di sản & văn hóa', 'Thiên nhiên', 'Ẩm thực', 'Biển đảo', '2 ngày', '3 ngày']
const cityList = ['Đà Nẵng', 'Hội An', 'Huế', 'Quảng Trị', 'Quảng Bình', 'Quy Nhơn', 'Phú Yên', 'Nha Trang', 'Quảng Nam', 'Quảng Ngãi', 'Đà Lạt', 'Gia Lai', 'Đắk Lắk']

const popularDestinations = [
  {
    name: 'Đà Nẵng',
    tag: 'Thành phố đáng sống',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Hội An',
    tag: 'Phố cổ đèn lồng',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Huế',
    tag: 'Cố đô di sản',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Quy Nhơn',
    tag: 'Kỳ Co & Eo Gió',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Phú Yên',
    tag: 'Xứ hoa vàng cỏ xanh',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Quảng Bình',
    tag: 'Vương quốc hang động',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&auto=format&fit=crop&q=80'
  }
]

const budgetTiers = [
  { key: 'budget', label: 'Tiết kiệm', sub: '~1-1.5tr / ngày' },
  { key: 'medium', label: 'Tiêu chuẩn', sub: '~2-3tr / ngày' },
  { key: 'luxury', label: 'Thư thả', sub: '~4tr+ / ngày' }
]

const plannerForm = reactive({
  destination: 'Đà Nẵng',
  days: 3,
  people: 2,
  budgetTier: 'medium'
})

const currentDayActivities = computed(() => {
  if (!generatedPlan.value) return null
  const days = generatedPlan.value.daysList || generatedPlan.value.days || []
  return days[currentActiveDayIndex.value] || days[0] || null
})

onMounted(() => {
  fetchWeather()
  loadSavedTrips()
  restartSlideTimer()
})

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer)
})

function isPillActive(pill) {
  if (!quickPromptText.value) return false
  const parts = quickPromptText.value.split(',').map(s => s.trim())
  return parts.includes(pill) || quickPromptText.value.includes(pill)
}

function togglePill(pill) {
  const current = quickPromptText.value.trim()
  if (!current) {
    quickPromptText.value = pill
    return
  }
  const parts = current.split(',').map(s => s.trim()).filter(Boolean)
  const idx = parts.indexOf(pill)

  if (idx !== -1) {
    // Tự tắt: bỏ chọn và xóa khỏi ô nhập
    parts.splice(idx, 1)
    quickPromptText.value = parts.join(', ')
  } else if (current.includes(pill)) {
    const pattern = new RegExp(`(,\s*)?${pill}|${pill}(\s*,)?`, 'g')
    quickPromptText.value = current.replace(pattern, '').replace(/^,\s*/, '').replace(/,\s*$/, '').trim()
  } else {
    // Bật chọn: thêm vào ô nhập
    quickPromptText.value = `${current}, ${pill}`
  }
}

// TÍNH NĂNG NHẬP LIỆU BẰNG GIỌNG NÓI TIẾNG VIỆT (WEB SPEECH API)
function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Hãy thử trên Chrome hoặc Safari!')
    return
  }

  if (isListening.value) {
    if (speechRecognition) {
      speechRecognition.stop()
    }
    isListening.value = false
    return
  }

  try {
    speechRecognition = new SpeechRecognition()
    speechRecognition.lang = 'vi-VN' // Nhận diện tiếng Việt
    speechRecognition.continuous = false
    speechRecognition.interimResults = true

    speechRecognition.onstart = () => {
      isListening.value = true
    }

    speechRecognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript
      }
      if (transcript.trim()) {
        quickPromptText.value = transcript.trim()
      }
    }

    speechRecognition.onerror = (event) => {
      console.warn('Lỗi nhận diện giọng nói:', event.error)
      isListening.value = false
      if (event.error === 'not-allowed') {
        alert('Vui lòng cấp quyền truy cập micro trong cài đặt trình duyệt để sử dụng tính năng này!')
      }
    }

    speechRecognition.onend = () => {
      isListening.value = false
    }

    speechRecognition.start()
  } catch (err) {
    console.error('Không thể khởi động SpeechRecognition:', err)
    isListening.value = false
  }
}

function quickSelectCity(cityName) {
  quickPromptText.value = `3 ngày 2 đêm ở ${cityName}, trải nghiệm địa phương và ẩm thực`
  handleGenerateFromPrompt()
}

// ==================== HƯỚNG DẪN & HOÀN THIỆN THÔNG TIN LỊCH TRÌNH ====================
const showGuidanceSheet = ref(false)

const peopleOptions = [
  { val: 1, label: '1 người (Đơn thân)' },
  { val: 2, label: '2 người (Cặp đôi/Bạn bè)' },
  { val: 4, label: 'Nhóm (3 - 4 người)' },
  { val: 6, label: 'Gia đình đông (5+ người)' }
]

const budgetTierOptions = [
  { key: 'budget', label: 'Bình dân / Tiết kiệm', perDay: 1500000, desc: 'Homestay, quán ăn địa phương, chi phí tối ưu' },
  { key: 'medium', label: 'Tiêu chuẩn / Thoải mái', perDay: 2500000, desc: 'Khách sạn 3-4 sao, đặc sản phong phú, tiện nghi' },
  { key: 'luxury', label: 'Sang trọng / Nghỉ dưỡng', perDay: 4500000, desc: 'Resort 4-5 sao, dịch vụ cao cấp trọn gói' }
]

const promptExamples = [
  '3 ngày ở Quảng Trị, 2 người, ngân sách 5 triệu, thích di tích & ẩm thực',
  '3 ngày Đà Nẵng - Hội An, 2 người, ngân sách 6 triệu, thích check-in & biển',
  '2 ngày 1 đêm ở Huế, 1 người, ngân sách 3 triệu, thích khám phá cố đô',
  '4 ngày Quy Nhơn - Phú Yên, 4 người, ngân sách 15 triệu, thích hải sản & biển'
]

const guidanceForm = reactive({
  destination: 'Đà Nẵng',
  days: 3,
  people: 1,
  peopleProvided: false,
  budget: 4500000,
  budgetTier: 'budget',
  budgetProvided: false,
  interests: []
})

function openGuidanceSheet(fromIncomplete = false) {
  if (!fromIncomplete) {
    guidanceForm.destination = 'Đà Nẵng'
    guidanceForm.days = 3
    guidanceForm.people = 2
    guidanceForm.peopleProvided = false
    guidanceForm.budgetTier = 'budget'
    guidanceForm.budgetProvided = false
    recalcGuidanceBudget()
  }
  showGuidanceSheet.value = true
}

function selectGuidanceDays(d) {
  guidanceForm.days = d
  recalcGuidanceBudget()
}

function selectGuidancePeople(val) {
  guidanceForm.people = val
  guidanceForm.peopleProvided = true
  recalcGuidanceBudget()
}

function selectGuidanceBudgetTier(key) {
  guidanceForm.budgetTier = key
  guidanceForm.budgetProvided = true
  recalcGuidanceBudget()
}

function recalcGuidanceBudget() {
  const tier = budgetTierOptions.find(t => t.key === guidanceForm.budgetTier) || budgetTierOptions[0]
  guidanceForm.budget = tier.perDay * (guidanceForm.days || 1) * (guidanceForm.people || 1)
}

function applyExamplePrompt(text) {
  quickPromptText.value = text
  showGuidanceSheet.value = false
  handleDirectGenerateFromPrompt()
}

async function submitGuidancePlan() {
  showGuidanceSheet.value = false
  isGenerating.value = true
  isPlanSaved.value = false
  try {
    const payload = {
      prompt: quickPromptText.value || `${guidanceForm.days} ngày ở ${guidanceForm.destination}`,
      destination: guidanceForm.destination || 'Đà Nẵng',
      days: Number(guidanceForm.days) || 3,
      people: Number(guidanceForm.people) || 1,
      budget: guidanceForm.budget,
      total_budget: guidanceForm.budget,
      interests: guidanceForm.interests
    }
    const res = await api.post('/ai/plan', payload)
    generatedPlan.value = res.data
    currentActiveDayIndex.value = 0
    currentTab.value = 'explore'
  } catch (err) {
    console.error('Lỗi tạo lịch:', err)
    alert(err.response?.data?.error || err.message || 'Không thể tạo lịch trình lúc này!')
  } finally {
    isGenerating.value = false
  }
}

async function handleGenerateFromPrompt() {
  if (!quickPromptText.value.trim()) {
    openGuidanceSheet(false)
    return
  }

  const text = quickPromptText.value.toLowerCase()
  // Kiểm tra xem khách hàng đã nêu ngân sách và số người chưa
  const hasBudgetMention = /(\d+[\s.]*(triệu|trieu|tr|k|đ|vnđ)|ngân sách|ngan sach|chi phí)/i.test(text)
  const hasPeopleMention = /(\d+[\s.]*người|nguoi|bạn bè|gia đình|gia dinh|cặp đôi|cap doi|đơn thân)/i.test(text)

  // Nhận diện nhanh điểm đến & số ngày từ câu lệnh
  let detectedDest = ''
  for (const city of cityList) {
    if (text.replace(/\s+/g, '').includes(city.toLowerCase().replace(/\s+/g, ''))) {
      detectedDest = city
      break
    }
  }
  const dayMatch = text.match(/(\d+)\s*(ngày|ngay|N)/i)
  const detectedDays = dayMatch ? parseInt(dayMatch[1], 10) : 3

  // NẾU CHƯA ĐỦ THÔNG TIN (ví dụ: thiếu ngân sách, hoặc thiếu số người, hoặc chưa rõ điểm đến):
  // Thay vì hệ thống tự ý đoán mò, bật thông báo và hướng dẫn để khách hàng biết cần cung cấp những gì!
  if (!hasBudgetMention || !hasPeopleMention || !detectedDest) {
    guidanceForm.destination = detectedDest || 'Đà Nẵng'
    guidanceForm.days = detectedDays
    guidanceForm.people = hasPeopleMention ? 2 : 1
    guidanceForm.peopleProvided = hasPeopleMention
    guidanceForm.budgetProvided = hasBudgetMention
    guidanceForm.budgetTier = 'budget'
    recalcGuidanceBudget()
    showGuidanceSheet.value = true
    return
  }

  // Nếu khách hàng ĐÃ CUNG CẤP ĐẦY ĐỦ (Điểm đến + Ngày + Người + Ngân sách):
  await handleDirectGenerateFromPrompt()
}

async function handleDirectGenerateFromPrompt() {
  if (!quickPromptText.value.trim()) return
  isGenerating.value = true
  isPlanSaved.value = false
  try {
    let destination = 'Đà Nẵng'
    let days = 3
    let people = 1
    let budget = 4500000
    let interests = []

    try {
      const { data: parsed } = await api.post('/ai/parse-prompt', { prompt: quickPromptText.value })
      if (parsed) {
        destination = parsed.diemDen || parsed.destination || destination
        days = Number(parsed.soNgay || parsed.days) || days
        people = Number(parsed.soNguoi || parsed.people) || people
        budget = Number(parsed.nganSach || parsed.budget) || (1500000 * days * people)
        if (parsed.soThich) interests.push(parsed.soThich)
      }
    } catch (e) {
      console.warn('parse-prompt fallback:', e.message)
      const dayMatch = quickPromptText.value.match(/(\d+)\s*(ngày|ngay|N)/i)
      if (dayMatch) days = parseInt(dayMatch[1], 10)
      const foundCity = cityList.find(c => quickPromptText.value.toLowerCase().replace(/\s+/g, '').includes(c.toLowerCase().replace(/\s+/g, '')))
      if (foundCity) destination = foundCity
    }

    const payload = {
      prompt: quickPromptText.value,
      destination,
      days,
      people,
      budget,
      total_budget: budget,
      interests
    }

    const res = await api.post('/ai/plan', payload)
    generatedPlan.value = res.data
    currentActiveDayIndex.value = 0
    currentTab.value = 'explore'
  } catch (err) {
    console.error('Lỗi lên lịch trình:', err)
    const errorMsg = err.response?.data?.error || err.message || 'Không thể tạo lịch trình lúc này, vui lòng thử lại!'
    alert(errorMsg)
  } finally {
    isGenerating.value = false
  }
}

async function handleGenerateFromForm() {
  isGenerating.value = true
  isPlanSaved.value = false
  try {
    const budgetMap = {
      budget: 1500000 * plannerForm.days * plannerForm.people,
      medium: 2500000 * plannerForm.days * plannerForm.people,
      luxury: 4500000 * plannerForm.days * plannerForm.people
    }
    const totalBudget = budgetMap[plannerForm.budgetTier] || (2500000 * plannerForm.days * plannerForm.people)
    const payload = {
      destination: plannerForm.destination || 'Đà Nẵng',
      days: Number(plannerForm.days) || 3,
      people: Number(plannerForm.people) || 1,
      budget: totalBudget,
      total_budget: totalBudget
    }
    const res = await api.post('/ai/plan', payload)
    generatedPlan.value = res.data
    currentActiveDayIndex.value = 0
    currentTab.value = 'explore'
  } catch (err) {
    console.error('Lỗi tạo lịch:', err)
    const errorMsg = err.response?.data?.error || err.message || 'Có lỗi khi tạo kế hoạch!'
    alert(errorMsg)
  } finally {
    isGenerating.value = false
  }
}

async function savePlan() {
  if (!generatedPlan.value) return
  try {
    const tripToSave = {
      ...generatedPlan.value,
      _id: generatedPlan.value._id || generatedPlan.value.tripId || ('local-' + Date.now()),
      created_at: new Date().toISOString()
    }
    
    // Save to local storage
    const raw = localStorage.getItem('my_saved_trips')
    let list = raw ? JSON.parse(raw) : []
    list.unshift(tripToSave)
    localStorage.setItem('my_saved_trips', JSON.stringify(list))
    savedTrips.value = list

    if (props.nguoiDung) {
      await api.post('/social/my-trips', tripToSave)
    }
    isPlanSaved.value = true
    alert('Đã lưu chuyến đi thành công!')
  } catch (e) {
    console.warn('Lỗi lưu:', e.message)
  }
}

function loadSavedTrips() {
  try {
    const raw = localStorage.getItem('my_saved_trips')
    if (raw) savedTrips.value = JSON.parse(raw)
  } catch (e) {}
}

function openSavedTripDetail(trip) {
  generatedPlan.value = trip
  currentActiveDayIndex.value = 0
  currentTab.value = 'explore'
}

function deleteSavedTrip(id) {
  if (!confirm('Xóa chuyến đi này khỏi danh sách?')) return
  savedTrips.value = savedTrips.value.filter(t => t._id !== id)
  localStorage.setItem('my_saved_trips', JSON.stringify(savedTrips.value))
}

async function fetchWeather() {
  try {
    const { data } = await api.get('/weather?city=Đà Nẵng')
    weather.value = data
  } catch {
    weather.value = null
  }
}

function formatMoney(val) {
  if (!val) return '0'
  return Number(val).toLocaleString('vi-VN')
}

function getWeatherEmoji(code) {
  if (!code && code !== 0) return '☀️'
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  return '🌦️'
}

function getWeatherDesc(code) {
  if (!code && code !== 0) return 'Trời nắng đẹp'
  if (code === 0) return 'Trời nắng quang đãng'
  if (code <= 3) return 'Có mây rải rác'
  if (code <= 48) return 'Sương mù nhẹ'
  if (code <= 67) return 'Có mưa rào'
  return 'Thời tiết mát mẻ'
}
</script>

<style scoped>
.mobile-experience {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-app, #f8fafc);
  color: var(--text-main, #1e293b);
  position: relative;
  padding-bottom: 70px; /* Space for bottom nav */
}

/* ĐỊNH HÌNH 1 CHỖ KHI Ở MÀN HÌNH KHÁM PHÁ (CHƯA TẠO LỊCH TRÌNH):
   Khóa chặt vừa khít 1 khung màn hình 100dvh, triệt tiêu hoàn toàn thanh cuộn,
   chống trượt kéo xuống và không để lộ bất kỳ khoảng trắng nào */
.mobile-experience.is-locked-explore {
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden !important;
  padding-bottom: 0 !important;
  overscroll-behavior: none;
  touch-action: pan-x; /* Cho phép vuốt ngang đổi ảnh, khóa cuộn dọc */
}

.mobile-experience.is-locked-explore .mobile-content-body {
  height: calc(100vh - 56px);
  height: calc(100dvh - 56px);
  max-height: calc(100dvh - 56px);
  overflow: hidden !important;
  overscroll-behavior: none;
}

.mobile-experience.is-locked-explore .explore-view {
  height: 100%;
  max-height: 100%;
  overflow: hidden !important;
}

/* TOP HEADER */
.mobile-top-header {
  position: sticky;
  top: 0;
  z-index: 45;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

/* KHI Ở TRANG KHÁM PHÁ: HEADER PHỦ TRỰC TIẾP LÊN HÌNH NỀN FULL BLEED */
.mobile-top-header.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.3) 65%, transparent 100%);
  border-bottom: none;
  backdrop-filter: none;
}

.mobile-top-header.header-overlay .mobile-brand-name {
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}

.mobile-top-header.header-overlay .mobile-brand-tagline {
  color: #fbbf24;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.mobile-top-header.header-overlay .mobile-theme-btn {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  backdrop-filter: blur(8px);
}

:root[data-theme="dark"] .mobile-top-header {
  background: rgba(15, 23, 42, 0.9);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-logo-img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.mobile-brand-title-wrap {
  display: flex;
  flex-direction: column;
}

.mobile-brand-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #059669;
  line-height: 1.1;
}

.mobile-brand-tagline {
  font-size: 0.55rem;
  font-weight: 600;
  color: #f59e0b;
  letter-spacing: 0.05em;
}

.mobile-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-theme-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: transparent;
  color: var(--text-main);
  display: grid;
  place-content: center;
  cursor: pointer;
}

.mobile-user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid #059669;
  background: #059669;
  color: #fff;
  font-weight: 700;
  overflow: hidden;
  display: grid;
  place-content: center;
  font-size: 0.8rem;
  cursor: pointer;
}

.mobile-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-login-btn {
  padding: 5px 12px;
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
}

/* HERO SECTION FRAMER STYLE - PHỦ TOÀN MÀN HÌNH */
.mobile-hero-card {
  position: relative;
  background: #0f172a;
  color: #fff;
  overflow: hidden;
  transition: all 0.35s ease;
}

/* KHI CHƯA TẠO LỊCH TRÌNH: PHỦ KÍN TOÀN BỘ CHIỀU CAO VÀ CỐ ĐỊNH 1 VỊ TRÍ KHÔNG CUỘN */
.mobile-hero-card.hero-fullscreen {
  height: 100%;
  min-height: 100%;
  max-height: 100%;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px 14px 12px 14px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: none;
}

/* KHI ĐÃ CÓ LỊCH TRÌNH: THU GỌN LẠI THÀNH BANNER TIỆN DỤNG */
.mobile-hero-card.hero-compact {
  min-height: auto;
  border-radius: 0 0 22px 22px;
  padding: 68px 14px 18px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* SLIDESHOW HIỆU ỨNG ĐỔI ẢNH ĐỘNG VỚI KEN BURNS */
.m-hero-bg-slider {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
}

.m-hero-bg-slide {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0;
  transform: scale(1.08);
  transition: opacity 1.3s cubic-bezier(0.4, 0, 0.2, 1), transform 5.5s cubic-bezier(0.25, 1, 0.5, 1);
  filter: saturate(1.15) brightness(0.92);
  will-change: opacity, transform;
}

.m-hero-bg-slide.active {
  opacity: 1;
  transform: scale(1);
}

.m-hero-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.92) 100%);
  pointer-events: none;
  z-index: 2;
}

.m-hero-watermark {
  position: absolute;
  top: 36%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: -apple-system, BlinkMacSystemFont, "Impact", sans-serif;
  font-size: 3.4rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.16);
  letter-spacing: 0.12em;
  user-select: none;
}

.watermark-hat-icon {
  opacity: 0.35;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.m-hero-center-cluster {
  position: relative;
  z-index: 2;
  margin-top: auto;
  margin-bottom: auto;
  padding-top: 10px;
}

.m-hero-text {
  margin-bottom: 8px;
}

.m-hero-kicker {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #f59e0b;
  text-transform: uppercase;
}

.m-hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.18;
  margin-top: 4px;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.m-hero-title em {
  font-style: italic;
  color: #fde68a;
  font-weight: 400;
}

.m-hero-subtitle {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.88);
  margin-top: 8px;
  line-height: 1.45;
  max-width: 380px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.m-hero-bottom-cluster {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* FLOATING PROMPT CAPSULE */
.mobile-prompt-capsule {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 8px 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.capsule-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sparkle-icon {
  color: #059669;
  font-size: 1.05rem;
}

.capsule-prompt-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.8rem;
  color: #0f172a;
  outline: none;
}

.capsule-prompt-input::placeholder {
  color: #64748b;
  font-size: 0.75rem;
}

/* NÚT MICRO GIỌNG NÓI */
.capsule-mic-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  display: grid;
  place-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.capsule-mic-btn:hover {
  background: #f1f5f9;
  color: #059669;
  border-color: #cbd5e1;
}

.capsule-mic-btn.listening {
  background: #ef4444 !important;
  color: #ffffff !important;
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.25);
  animation: micPulse 1.2s infinite ease-in-out;
}

.mic-wave-pulse {
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: ping 1s infinite;
}

@keyframes micPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@keyframes ping {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}

.capsule-submit-btn {
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 7px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.35);
  transition: transform 0.15s ease;
}

.capsule-submit-btn:active {
  transform: scale(0.96);
}

.capsule-quick-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-top: 7px;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.capsule-quick-pills::-webkit-scrollbar {
  display: none;
}

.capsule-pill-btn {
  flex-shrink: 0;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 3px 9px;
  font-size: 0.65rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.capsule-pill-btn.active {
  background: #059669 !important;
  color: #ffffff !important;
  border-color: #059669 !important;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35);
}

.capsule-pill-btn:active {
  transform: scale(0.95);
}

.pill-check {
  font-weight: bold;
  font-size: 0.65rem;
  margin-right: 2px;
}

/* INTERACTIVE BOTTOM ROW INSIDE HERO */
.m-hero-interactive-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.75);
  padding: 0 2px;
}

.m-interactive-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.hero-slide-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.hero-dot-btn {
  width: 5px;
  height: 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.35);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hero-dot-btn.active {
  width: 14px;
  background: #10b981;
}

.m-interactive-tag {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fde68a;
  font-weight: 600;
  font-size: 0.65rem;
}

.m-interactive-weather, .m-interactive-coord {
  color: #fbbf24;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 6px;
}

/* LOADING NOTICE */
.mobile-plan-loading {
  text-align: center;
  padding: 24px 16px;
  margin: 16px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.loading-flower-icon {
  font-size: 1.8rem;
  animation: pulse 1.4s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* GENERATED PLAN SECTION */
.mobile-generated-plan {
  margin: 16px 12px;
}

.plan-summary-banner {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  margin-bottom: 12px;
}

.plan-badge-line {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.badge-emerald {
  font-size: 0.6rem;
  font-weight: 700;
  background: #059669;
  padding: 2px 6px;
  border-radius: 10px;
}

.badge-amber {
  font-size: 0.6rem;
  font-weight: 700;
  background: #f59e0b;
  padding: 2px 6px;
  border-radius: 10px;
}

.plan-dest-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  margin-bottom: 2px;
}

.plan-meta-info {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-bottom: 12px;
}

.plan-quick-buttons {
  display: flex;
  gap: 8px;
}

.btn-save-mobile-plan {
  flex: 1;
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px;
  font-size: 0.75rem;
  font-weight: 600;
}

.btn-reset-mobile-plan {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 0.75rem;
}

.plan-day-pills-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 10px;
}

.day-pill-item {
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.day-pill-item.active {
  background: #059669;
  color: #fff;
  border-color: #059669;
}

.day-activities-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
}

.day-activities-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}

.timeline-activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-act-node {
  display: flex;
  gap: 10px;
}

.act-time-pill {
  font-size: 0.65rem;
  font-weight: 700;
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
  height: fit-content;
  white-space: nowrap;
}

.act-info-box {
  flex: 1;
}

.act-category-tag {
  font-size: 0.6rem;
  font-weight: 700;
  color: #f59e0b;
  text-transform: uppercase;
}

.act-place-title {
  font-size: 0.82rem;
  font-weight: 700;
  margin: 1px 0 3px;
}

.act-desc-text {
  font-size: 0.72rem;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 4px;
}

.act-meta-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.act-cost-tag, .act-tip-tag {
  font-size: 0.6rem;
  padding: 1px 5px;
  border-radius: 4px;
}

.act-cost-tag {
  background: #fef3c7;
  color: #92400e;
}

.act-tip-tag {
  background: #e0f2fe;
  color: #0369a1;
}

/* POPULAR DESTINATIONS */
.mobile-section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 16px 14px 8px;
}

.m-section-title {
  font-size: 1rem;
  font-weight: 700;
}

.m-section-sub {
  font-size: 0.65rem;
  color: #94a3b8;
}

.mobile-city-carousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 14px 14px;
  scrollbar-width: none;
}

.m-city-card {
  flex-shrink: 0;
  width: 125px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
}

.m-city-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 8px;
}

.m-city-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
}

.m-city-tag {
  position: relative;
  z-index: 1;
  font-size: 0.52rem;
  color: #fde68a;
  font-weight: 600;
}

.m-city-name {
  position: relative;
  z-index: 1;
  font-family: 'Playfair Display', serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
}

/* WEATHER STRIP */
.mobile-weather-strip {
  margin: 0 14px 16px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weather-label {
  font-size: 0.55rem;
  font-weight: 700;
  color: #059669;
}

.weather-city-name {
  font-size: 0.9rem;
  font-weight: 700;
  margin-top: 2px;
}

.weather-status-text {
  font-size: 0.68rem;
  color: #64748b;
}

.weather-strip-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-icon-large {
  font-size: 1.3rem;
}

.weather-temp-number {
  font-size: 1.15rem;
  font-weight: 800;
}

/* PLANNER TAB */
.planner-form-card {
  margin: 14px;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.p-form-header {
  margin-bottom: 14px;
}

.p-form-kicker {
  font-size: 0.65rem;
  font-weight: 700;
  color: #059669;
}

.p-form-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.p-form-sub {
  font-size: 0.72rem;
  color: #64748b;
}

.p-form-field {
  margin-bottom: 14px;
}

.p-field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.p-chips-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.p-choice-chip {
  padding: 6px 12px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
}

.p-choice-chip.active {
  background: #059669;
  color: #fff;
  border-color: #059669;
}

.p-duration-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.p-duration-grid small {
  display: block;
  font-size: 0.55rem;
  opacity: 0.8;
}

.p-counter-row {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.p-counter-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  font-weight: 700;
}

.p-counter-val {
  font-size: 0.8rem;
  font-weight: 700;
}

.btn-primary-mobile {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  background: #059669;
  color: #fff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}

.btn-primary-mobile.mini {
  width: auto;
  padding: 6px 16px;
}

/* SAVED TRIPS TAB */
.trips-header-block {
  padding: 14px 14px 6px;
}

.trips-main-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.trips-sub-title {
  font-size: 0.72rem;
  color: #64748b;
}

.empty-trips-card {
  text-align: center;
  margin: 20px 14px;
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}

.empty-icon {
  font-size: 2.2rem;
}

.saved-trips-list {
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-trip-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.trip-item-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.trip-dest-badge {
  font-size: 0.6rem;
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
}

.trip-days-badge {
  font-size: 0.6rem;
  font-weight: 600;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 8px;
}

.trip-card-name {
  font-size: 0.9rem;
  font-weight: 700;
}

.trip-budget-line {
  font-size: 0.72rem;
  color: #64748b;
  margin: 4px 0 8px;
}

.trip-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 6px;
}

.trip-hint-text {
  font-size: 0.68rem;
  color: #059669;
  font-weight: 600;
}

.trip-delete-btn {
  font-size: 0.65rem;
  color: #ef4444;
  border: none;
  background: transparent;
  cursor: pointer;
}

/* PROFILE TAB STYLES - CHUẨN THIẾT KẾ MOBILE NATIVE */
.m-profile-wrapper, .m-guest-wrapper {
  padding: 12px 14px 24px;
}

/* HERO CARD & COVER */
.m-profile-hero-card {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 14px;
}

:root[data-theme="dark"] .m-profile-hero-card {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
}

.m-profile-cover {
  height: 90px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.m-profile-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15, 23, 42, 0.65) 100%);
}

.m-profile-user-cluster {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 0 16px;
  margin-top: -36px;
  position: relative;
  z-index: 2;
}

.m-avatar-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3.5px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #059669;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

:root[data-theme="dark"] .m-avatar-wrap {
  border-color: #1e293b;
}

.m-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.m-avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  color: #fff;
  font-size: 1.6rem;
  font-weight: 800;
  display: grid;
  place-content: center;
}

.m-avatar-edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #059669;
  color: #ffffff;
  border: 2px solid #ffffff;
  display: grid;
  place-content: center;
  cursor: pointer;
}

.m-user-text {
  flex: 1;
  padding-bottom: 4px;
}

.m-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.m-user-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  line-height: 1.2;
}

:root[data-theme="dark"] .m-user-title {
  color: #f8fafc;
}

.m-admin-tag {
  background: #ef4444;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 8px;
  letter-spacing: 0.05em;
}

.m-user-email {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 2px;
}

.m-badge-row {
  margin-top: 6px;
}

.m-level-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #ffffff;
  padding: 2px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.m-bio-box {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin: 12px 16px;
  cursor: pointer;
  border: 1px dashed #cbd5e1;
}

:root[data-theme="dark"] .m-bio-box {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.15);
}

.m-bio-content {
  font-size: 0.75rem;
  color: #334155;
  font-style: italic;
  line-height: 1.45;
}

:root[data-theme="dark"] .m-bio-content {
  color: #cbd5e1;
}

.m-bio-placeholder {
  font-size: 0.72rem;
  color: #94a3b8;
}

.m-profile-actions {
  padding: 0 16px 14px;
  display: flex;
  gap: 8px;
}

.btn-m-edit {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

:root[data-theme="dark"] .btn-m-edit {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

/* BENTO STATS CARDS */
.m-stats-bento {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.m-stat-cell {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:root[data-theme="dark"] .m-stat-cell {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon {
  font-size: 1.15rem;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 800;
}

.stat-emerald .stat-number { color: #059669; }
.stat-amber .stat-number { color: #f59e0b; }
.stat-rose .stat-number { color: #f43f5e; }
.stat-violet .stat-number { color: #8b5cf6; }

.stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748b;
}

/* SETTINGS GROUPS */
.m-settings-group {
  margin-bottom: 16px;
}

.m-group-header {
  font-size: 0.65rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
  padding-left: 4px;
}

.m-settings-list {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

:root[data-theme="dark"] .m-settings-list {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
}

.m-setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.15s ease;
}

:root[data-theme="dark"] .m-setting-item {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.m-setting-item:last-child {
  border-bottom: none;
}

.m-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.m-item-icon {
  font-size: 1.05rem;
}

.m-item-text {
  display: flex;
  flex-direction: column;
}

.m-item-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}

:root[data-theme="dark"] .m-item-title {
  color: #f1f5f9;
}

.m-item-sub {
  font-size: 0.65rem;
  color: #64748b;
  margin-top: 1px;
}

.m-chevron {
  font-size: 1.2rem;
  color: #94a3b8;
  font-weight: 300;
}

.m-item-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
}

.m-item-pill.green {
  background: #ecfdf5;
  color: #059669;
}

/* TOGGLE SWITCH */
.m-switch-toggle {
  width: 42px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 12px;
  position: relative;
  transition: background 0.25s ease;
  cursor: pointer;
}

.m-switch-toggle.on {
  background: #059669;
}

.m-switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.m-switch-toggle.on .m-switch-knob {
  transform: translateX(18px);
}

/* LOGOUT BUTTON */
.m-logout-wrap {
  margin-top: 20px;
}

.btn-m-logout {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

/* GUEST MODE CARD */
.m-guest-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 18px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}

:root[data-theme="dark"] .m-guest-card {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
}

.m-guest-badge {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #f1f5f9;
  margin: 0 auto 12px;
  display: grid;
  place-content: center;
}

.m-guest-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
}

.m-guest-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
}

:root[data-theme="dark"] .m-guest-title {
  color: #fff;
}

.m-guest-sub {
  font-size: 0.75rem;
  color: #64748b;
  margin: 6px 0 18px;
  line-height: 1.45;
}

.btn-guest-login {
  width: 100%;
  padding: 12px;
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.m-guest-benefits {
  margin-top: 20px;
  text-align: left;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:root[data-theme="dark"] .m-guest-benefits {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.benefit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: #475569;
}

:root[data-theme="dark"] .benefit-row {
  color: #cbd5e1;
}

.b-icon {
  font-size: 0.95rem;
}

/* EDIT PROFILE BOTTOM SHEET MODAL */
.m-bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.m-bottom-sheet-content {
  background: #ffffff;
  width: 100%;
  max-width: 480px;
  border-radius: 24px 24px 0 0;
  padding: 12px 18px 24px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

:root[data-theme="dark"] .m-bottom-sheet-content {
  background: #0f172a;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.sheet-handle-bar {
  width: 36px;
  height: 4px;
  background: #cbd5e1;
  border-radius: 2px;
  margin: 0 auto 12px;
}

:root[data-theme="dark"] .sheet-handle-bar {
  background: rgba(255, 255, 255, 0.2);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.sheet-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sheet-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

:root[data-theme="dark"] .sheet-title {
  color: #f8fafc;
}

.sheet-subtitle {
  font-size: 0.68rem;
  color: #64748b;
  margin: 0;
}

:root[data-theme="dark"] .sheet-subtitle {
  color: #94a3b8;
}

.sheet-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-content: center;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

:root[data-theme="dark"] .sheet-close-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

/* AVATAR ROW & PREVIEW */
.sheet-avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
  background: rgba(241, 245, 249, 0.7);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

:root[data-theme="dark"] .sheet-avatar-row {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
}

.sheet-avatar-preview {
  width: 64px;
  height: 64px;
  min-width: 64px;
  min-height: 64px;
  max-width: 64px;
  max-height: 64px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #059669;
  color: #ffffff;
  overflow: hidden;
  position: relative;
  border: 2.5px solid #059669;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet-avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.sheet-avatar-overlay-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 22px;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  backdrop-filter: blur(2px);
}

.sheet-avatar-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.sheet-avatar-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 10px;
  background: #059669;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
  transition: all 0.2s ease;
}

.sheet-avatar-upload-btn:hover, .sheet-avatar-upload-btn:active {
  background: #047857;
  transform: translateY(-1px);
}

.sheet-file-hidden {
  display: none !important;
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
  pointer-events: none;
}

.sheet-avatar-hint {
  font-size: 0.65rem;
  color: #64748b;
  line-height: 1.3;
}

:root[data-theme="dark"] .sheet-avatar-hint {
  color: #94a3b8;
}

/* INPUT FIELDS */
.sheet-field {
  margin-bottom: 14px;
}

.sheet-field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.sheet-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
}

:root[data-theme="dark"] .sheet-label {
  color: #e2e8f0;
}

.sheet-required {
  color: #ef4444;
  margin-left: 2px;
}

.sheet-char-count {
  font-size: 0.65rem;
  color: #94a3b8;
}

.sheet-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.sheet-input-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.sheet-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.85rem;
  font-weight: 500;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.sheet-input.with-icon {
  padding-left: 36px;
}

:root[data-theme="dark"] .sheet-input,
:root[data-theme="dark"] .sheet-textarea {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
}

.sheet-input:focus,
.sheet-textarea:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.sheet-textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.82rem;
  font-family: inherit;
  line-height: 1.5;
  outline: none;
  resize: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

/* FOOTER BUTTONS */
.sheet-footer {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-sheet-cancel {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

:root[data-theme="dark"] .btn-sheet-cancel {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
}

.btn-sheet-save {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
  transition: all 0.2s ease;
}

.btn-sheet-save:active {
  transform: scale(0.98);
}

.btn-sheet-save:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* CAPSULE GUIDE PROMPT TIP */
.capsule-guide-row {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.btn-prompt-guide {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 999px;
  padding: 6px 14px;
  color: #065f46;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.12);
  text-shadow: none;
  max-width: 100%;
}

.btn-prompt-guide:hover, .btn-prompt-guide:active {
  background: #dcfce7;
  border-color: #4ade80;
  color: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.18);
}

.btn-prompt-guide:hover .guide-arrow,
.btn-prompt-guide:active .guide-arrow {
  transform: translateX(2px);
}

:root[data-theme="dark"] .btn-prompt-guide {
  background: #064e3b;
  border-color: #34d399;
  color: #ffffff;
  box-shadow: 0 3px 12px rgba(6, 78, 59, 0.4);
}

:root[data-theme="dark"] .btn-prompt-guide:hover,
:root[data-theme="dark"] .btn-prompt-guide:active {
  background: #047857;
  border-color: #6ee7b7;
  color: #ffffff;
}

.guide-bulb {
  font-size: 0.9rem;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

.guide-text {
  letter-spacing: -0.01em;
  color: #065f46;
  font-weight: 750;
}

:root[data-theme="dark"] .guide-text {
  color: #ffffff !important;
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.guide-arrow {
  font-size: 1.05rem;
  color: #059669;
  font-weight: 800;
  line-height: 1;
  margin-left: 2px;
  transition: transform 0.2s ease;
}

:root[data-theme="dark"] .guide-arrow {
  color: #34d399 !important;
  font-weight: 900;
}

/* SMART GUIDANCE BOTTOM SHEET */
.m-guidance-sheet {
  max-height: 88vh;
  max-height: 88dvh;
  display: flex;
  flex-direction: column;
}

.guidance-badge {
  display: inline-flex;
  width: fit-content;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

:root[data-theme="dark"] .guidance-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.guidance-checklist-scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: calc(88dvh - 170px);
  padding-right: 2px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.guidance-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.2s ease;
}

:root[data-theme="dark"] .guidance-item {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.08);
}

.guidance-item.is-ready {
  border-color: rgba(5, 150, 105, 0.35);
}

:root[data-theme="dark"] .guidance-item.is-ready {
  border-color: rgba(16, 185, 129, 0.35);
}

.g-item-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.g-item-icon {
  font-size: 1.1rem;
  line-height: 1;
  margin-top: 2px;
}

.g-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.g-item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.g-item-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
}

:root[data-theme="dark"] .g-item-name {
  color: #f8fafc;
}

.g-item-desc {
  font-size: 0.65rem;
  color: #64748b;
  line-height: 1.3;
}

:root[data-theme="dark"] .g-item-desc {
  color: #94a3b8;
}

.g-status-badge {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  white-space: nowrap;
}

.g-status-badge.ready {
  background: #ecfdf5;
  color: #059669;
}

:root[data-theme="dark"] .g-status-badge.ready {
  background: rgba(5, 150, 105, 0.25);
  color: #34d399;
}

.g-status-badge.notice {
  background: #fffbeb;
  color: #d97706;
}

:root[data-theme="dark"] .g-status-badge.notice {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.g-status-badge.missing {
  background: #fef2f2;
  color: #ef4444;
}

:root[data-theme="dark"] .g-status-badge.missing {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.g-item-control {
  margin-top: 2px;
}

.g-chips-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
}

.g-chips-scroll::-webkit-scrollbar {
  display: none;
}

.g-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.g-chip-btn {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

:root[data-theme="dark"] .g-chip-btn {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
}

.g-chip-btn.active {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);
}

.g-budget-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.g-budget-tier-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

:root[data-theme="dark"] .g-budget-tier-btn {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.12);
}

.g-budget-tier-btn.active {
  border-color: #059669;
  background: rgba(5, 150, 105, 0.06);
}

:root[data-theme="dark"] .g-budget-tier-btn.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.12);
}

.g-budget-tier-btn .tier-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f172a;
}

:root[data-theme="dark"] .g-budget-tier-btn .tier-name {
  color: #f8fafc;
}

.g-budget-tier-btn.active .tier-name {
  color: #059669;
}

:root[data-theme="dark"] .g-budget-tier-btn.active .tier-name {
  color: #34d399;
}

.g-budget-tier-btn .tier-cost {
  font-size: 0.68rem;
  font-weight: 700;
  color: #059669;
}

:root[data-theme="dark"] .g-budget-tier-btn .tier-cost {
  color: #34d399;
}

.g-budget-tier-btn .tier-desc {
  font-size: 0.62rem;
  color: #64748b;
}

:root[data-theme="dark"] .g-budget-tier-btn .tier-desc {
  color: #94a3b8;
}

/* EXAMPLES CARD */
.guidance-examples-card {
  background: rgba(245, 158, 11, 0.08);
  border: 1px dashed rgba(245, 158, 11, 0.4);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:root[data-theme="dark"] .guidance-examples-card {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.g-ex-header {
  font-size: 0.68rem;
  font-weight: 700;
  color: #b45309;
}

:root[data-theme="dark"] .g-ex-header {
  color: #fbbf24;
}

.g-ex-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.g-ex-btn {
  background: #ffffff;
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 8px;
  padding: 5px 8px;
  text-align: left;
  font-size: 0.65rem;
  color: #475569;
  cursor: pointer;
  line-height: 1.35;
  transition: all 0.15s ease;
}

:root[data-theme="dark"] .g-ex-btn {
  background: #0f172a;
  color: #cbd5e1;
  border-color: rgba(255, 255, 255, 0.1);
}

.g-ex-btn:active {
  background: #fffbeb;
  border-color: #f59e0b;
}

:root[data-theme="dark"] .g-ex-btn:active {
  background: #1e293b;
  border-color: #fbbf24;
}

.btn-guidance-generate {
  flex: 2;
  font-weight: 700;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

/* BOTTOM TAB NAVIGATION */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 50;
  max-width: 480px;
  margin: 0 auto;
}

:root[data-theme="dark"] .mobile-bottom-nav {
  background: rgba(15, 23, 42, 0.95);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.nav-tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 4px 10px;
}

.nav-tab-btn.active {
  color: #059669;
}
</style>
