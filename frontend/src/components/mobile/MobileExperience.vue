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

        <!-- GENERATED PLAN RESULT (Khi AI tạo xong - Chi tiết phong phú đầy đủ như bản PC) -->
        <div v-if="generatedPlan && !isGenerating" class="mobile-generated-plan">
          
          <!-- BANNER TỔNG QUAN CHUYẾN ĐI -->
          <div class="plan-summary-banner">
            <div class="plan-badge-line">
              <span class="badge-emerald">✦ LỊCH TRÌNH CÁ NHÂN HÓA</span>
              <span class="badge-amber">{{ (generatedPlan.daysList || generatedPlan.days || []).length }} Ngày {{ Math.max(1, (generatedPlan.daysList || generatedPlan.days || []).length - 1) }} Đêm</span>
            </div>
            
            <h2 class="plan-dest-name">{{ generatedPlan.destination || 'Miền Trung' }}</h2>
            
            <div class="plan-meta-stats-row">
              <div class="pms-item">
                <span class="pms-label">Dự toán tổng</span>
                <strong class="pms-val text-emerald">~{{ formatMoney(generatedPlan.total_budget || 0) }}đ</strong>
              </div>
              <div class="pms-item">
                <span class="pms-label">Số người</span>
                <strong class="pms-val">{{ generatedPlan.people || 1 }} người</strong>
              </div>
              <div class="pms-item">
                <span class="pms-label">Bình quân/người</span>
                <strong class="pms-val">~{{ formatMoney(Math.round((generatedPlan.total_budget || 0) / (generatedPlan.people || 1))) }}đ</strong>
              </div>
            </div>

            <!-- Nút hành động nhanh -->
            <div class="plan-quick-buttons">
              <button class="btn-start-mobile-tour" @click="batDauChuyenDiMobile(generatedPlan)">
                🚀 Bắt đầu lịch trình ngay
              </button>
              <button class="btn-save-mobile-plan" @click="savePlan">
                ❤️ {{ isPlanSaved ? 'Đã lưu chuyến đi' : 'Lưu chuyến đi này' }}
              </button>
              <button class="btn-reset-mobile-plan" @click="generatedPlan = null">
                ↺ Lên lịch khác
              </button>
            </div>
          </div>

          <!-- BÓC TÁCH CHI PHÍ THÔNG MINH (BUDGET BREAKDOWN - ĐỒNG BỘ 100% VỚI PC) -->
          <div v-if="generatedPlan.budget_breakdown" class="mobile-budget-breakdown-card">
            <div class="m-card-header-line">
              <h4 class="m-card-title">💰 Bóc tách dự toán chi phí</h4>
              <span class="m-budget-total-pill">Tổng: {{ formatMoney(generatedPlan.total_budget || 0) }}đ</span>
            </div>
            
            <!-- Cảnh báo nếu ngân sách thực tế vượt quá ngân sách mục tiêu -->
            <div v-if="generatedPlan.is_over_budget" class="mobile-over-budget-banner">
              <span class="mob-icon">⚠️</span>
              <div class="mob-text">
                <strong>VƯỢT NGÂN SÁCH MỤC TIÊU (+{{ generatedPlan.over_percent }}%)</strong>
                <p>Mục tiêu: {{ formatMoney(generatedPlan.target_budget) }}đ · Thực tế: {{ formatMoney(generatedPlan.total_budget) }}đ (vượt +{{ formatMoney(generatedPlan.over_amount) }}đ)</p>
              </div>
            </div>

            <div class="m-budget-grid-2x2">
              <div class="m-budget-mini-item">
                <div class="m-bmi-icon">🏨</div>
                <div class="m-bmi-info">
                  <span class="m-bmi-label">Khách sạn lưu trú</span>
                  <strong class="m-bmi-val">{{ generatedPlan.self_hotel ? 'Tự túc (0đ)' : `${formatMoney(generatedPlan.budget_breakdown.hotel)}đ` }}</strong>
                </div>
              </div>
              <div class="m-budget-mini-item">
                <div class="m-bmi-icon">🚌</div>
                <div class="m-bmi-info">
                  <span class="m-bmi-label">Di chuyển / Vé xe</span>
                  <strong class="m-bmi-val">{{ generatedPlan.self_transit ? `Xăng xe: ${formatMoney(generatedPlan.budget_breakdown.transportation)}đ` : `${formatMoney(generatedPlan.budget_breakdown.transportation)}đ` }}</strong>
                </div>
              </div>
              <div class="m-budget-mini-item">
                <div class="m-bmi-icon">🍜</div>
                <div class="m-bmi-info">
                  <span class="m-bmi-label">Ăn uống đặc sản</span>
                  <strong class="m-bmi-val">{{ formatMoney(generatedPlan.budget_breakdown.food) }}đ</strong>
                </div>
              </div>
              <div class="m-budget-mini-item">
                <div class="m-bmi-icon">🎟️</div>
                <div class="m-bmi-info">
                  <span class="m-bmi-label">Vé tham quan</span>
                  <strong class="m-bmi-val">{{ generatedPlan.free_places_only ? 'Miễn phí (0đ)' : `${formatMoney(generatedPlan.budget_breakdown.tickets)}đ` }}</strong>
                </div>
              </div>
              <div v-if="generatedPlan.budget_breakdown.reserve" class="m-budget-mini-item full-width-item">
                <div class="m-bmi-icon">🛡️</div>
                <div class="m-bmi-info">
                  <span class="m-bmi-label">Quỹ dự phòng (~5%)</span>
                  <strong class="m-bmi-val">{{ formatMoney(generatedPlan.budget_breakdown.reserve) }}đ</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- KHÁCH SẠN LƯU TRÚ GỢI Ý (NẾU CÓ) -->
          <div v-if="generatedPlan.hotel_recommendation" class="mobile-hotel-rec-card">
            <div class="m-hotel-rec-top">
              <div class="m-hotel-thumb-wrap">
                <img
                  :src="getPlaceImage(generatedPlan.hotel_recommendation)"
                  :alt="generatedPlan.hotel_recommendation.name"
                  class="m-hotel-thumb-img"
                  loading="lazy"
                  @error="onImageError"
                />
                <span class="m-hotel-badge">🏨 {{ generatedPlan.self_hotel ? 'Chỗ nghỉ tự túc' : 'Khách sạn lưu trú' }}</span>
              </div>
              <div class="m-hotel-info-block">
                <h4 class="m-hotel-name">{{ generatedPlan.hotel_recommendation.name }}</h4>
                <p class="m-hotel-addr">📍 {{ generatedPlan.hotel_recommendation.address }}</p>
                <div class="m-hotel-rating-price">
                  <span class="m-hotel-star">⭐ {{ generatedPlan.hotel_recommendation.rating || '4.8' }}</span>
                  <span class="m-hotel-price">{{ generatedPlan.self_hotel ? '0đ (Tự túc)' : `~${formatMoney(generatedPlan.hotel_recommendation.price_per_night || 650000)}đ/đêm` }}</span>
                </div>
                <a
                  :href="chiDuongUrl(generatedPlan.hotel_recommendation.name, generatedPlan.hotel_recommendation.address)"
                  target="_blank"
                  rel="noreferrer"
                  class="m-hotel-map-link"
                >
                  Chỉ đường tới chỗ nghỉ ↗
                </a>
              </div>
            </div>
          </div>

          <!-- CHẶNG KHỞI HÀNH XUẤT PHÁT (TRANSIT SUMMARY - NẾU CÓ) -->
          <div v-if="generatedPlan.transit_summary || generatedPlan.origin" class="mobile-transit-card">
            <div class="m-transit-header">
              <span class="m-transit-badge">🚌 CHẶNG KHỞI HÀNH TỪ NƠI Ở</span>
              <span class="m-transit-route">{{ generatedPlan.origin || 'Hà Nội' }} ➔ {{ generatedPlan.destination }}</span>
            </div>
            <div class="m-transit-body">
              <div class="m-transit-detail-row">
                <span>Phương tiện:</span>
                <strong>{{ generatedPlan.self_transit ? 'Xe máy / Tự túc phương tiện (0đ vé)' : (generatedPlan.transit_summary?.selected_bus?.name || generatedPlan.transit_summary?.cheapestBus?.name || (generatedPlan.transportation === 'máy bay' ? 'Chuyến bay nội địa' : (generatedPlan.transportation === 'tàu hỏa' ? 'Tàu hoả Thống Nhất' : 'Xe khách giường nằm VIP'))) }}</strong>
              </div>
              <div v-if="generatedPlan.transit_summary?.estimated_distance_km" class="m-transit-detail-row">
                <span>Cự ly quãng đường:</span>
                <strong>~{{ generatedPlan.transit_summary.estimated_distance_km }} km</strong>
              </div>
              <div class="m-transit-detail-row">
                <span>Dự toán di chuyển:</span>
                <strong class="text-emerald">{{ generatedPlan.self_transit ? 'Tự túc (chỉ tính xăng xe)' : ('~' + formatMoney(generatedPlan.budget_breakdown?.transportation || generatedPlan.transit_summary?.cheapestBusTotal || 0) + 'đ') }}</strong>
              </div>
            </div>
          </div>

          <!-- THANH CHỌN NGÀY (DAY TABS) -->
          <div class="plan-day-pills-row">
            <button
              v-for="(day, dIdx) in (generatedPlan.daysList || generatedPlan.days || [])"
              :key="dIdx"
              :class="['day-pill-item', { active: currentActiveDayIndex === dIdx }]"
              @click="currentActiveDayIndex = dIdx"
            >
              <span>Ngày {{ day.day || dIdx + 1 }}</span>
              <small class="dpi-count">({{ (day.activities || []).length }} điểm)</small>
            </button>
          </div>

          <!-- KHỐI HOẠT ĐỘNG CHI TIẾT TRONG NGÀY -->
          <div v-if="currentDayActivities" class="day-activities-card">
            
            <!-- HEADER CỦA NGÀY & NÚT GOOGLE MAPS CẢ NGÀY -->
            <div class="m-day-header-banner">
              <div class="m-dhb-left">
                <span class="m-day-counter">NGÀY {{ currentActiveDayIndex + 1 }} / {{ (generatedPlan.daysList || generatedPlan.days || []).length }}</span>
                <h3 class="day-activities-title">
                  {{ currentDayActivities.theme || `Khám phá & Ẩm thực Ngày ${currentActiveDayIndex + 1}` }}
                </h3>
              </div>
              <!-- Nút mở lộ trình ngày trên Google Maps liên tục -->
              <a
                :href="taoLinkGoogleMapsChoNgay(currentDayActivities)"
                target="_blank"
                rel="noreferrer"
                class="btn-day-maps-route"
                title="Mở toàn bộ lộ trình ngày trên Google Maps dẫn đường liên tục"
              >
                🗺️ Lộ trình cả ngày ↗
              </a>
            </div>

            <!-- DANH SÁCH THẺ HOẠT ĐỘNG (CHI TIẾT ĐẦY ĐỦ CÓ ẢNH THẬT) -->
            <div class="timeline-activity-list">
              <div
                v-for="(act, aIdx) in (currentDayActivities.activities || [])"
                :key="aIdx"
                class="m-act-card"
              >
                <!-- Dòng thời gian & Badge danh mục -->
                <div class="m-act-top-bar">
                  <div class="m-act-time-pill">
                    <span class="mat-clock">⏰</span>
                    <span>{{ act.time || `${7 + aIdx * 2}:30` }}</span>
                  </div>
                  <span :class="['m-act-badge', getBadgeInfo(act).class]">
                    {{ getBadgeInfo(act).icon }} {{ getBadgeInfo(act).label }}
                  </span>
                  <span v-if="act.estimated_cost > 0" class="m-act-cost-badge">
                    💰 ~{{ formatMoney(act.estimated_cost) }}đ
                  </span>
                  <span v-else-if="act.estimated_cost === 0" class="m-act-cost-badge free">
                    🎟️ Miễn phí vé
                  </span>
                </div>

                <!-- ẢNH THẬT ĐỊA ĐIỂM SẮC NÉT (THUMBNAIL BANNER) -->
                <div class="m-act-image-box">
                  <img
                    :src="getPlaceImage(act)"
                    :alt="act.place"
                    class="m-act-photo"
                    loading="lazy"
                    @error="onImageError"
                  />
                  <span class="m-act-index-tag">#{{ aIdx + 1 }}</span>
                  <span v-if="act.rating" class="m-act-rating-pill">
                    ⭐ {{ act.rating }} <small v-if="act.review_count">({{ act.review_count }})</small>
                  </span>
                </div>

                <!-- THÔNG TIN CHI TIẾT ĐỊA ĐIỂM -->
                <div class="m-act-content-box">
                  <h4 class="m-act-name">{{ act.place || act.title }}</h4>
                  
                  <p v-if="act.address" class="m-act-address">
                    <span class="m-pin-icon">📍</span> {{ act.address }}
                  </p>

                  <!-- MÔ TẢ TRẢI NGHIỆM CHI TIẾT (VĂN PHONG DU LỊCH) -->
                  <p class="m-act-description">
                    {{ layMoTaHoatDong(act) }}
                  </p>

                  <!-- MÓN ĐẶC SẢN NỔI BẬT NẾU LÀ QUÁN ĂN -->
                  <div v-if="act.signature_dishes && act.signature_dishes.length" class="m-act-dishes-row">
                    <span class="mad-icon">🍜</span>
                    <strong>Đặc sản món tủ:</strong>
                    <span>{{ act.signature_dishes.join(', ') }}</span>
                  </div>

                  <!-- HÀNG THÔNG TIN TIỆN ÍCH (Giờ mở cửa, thời gian dừng, trong nhà/ngoài trời) -->
                  <div class="m-act-meta-pills">
                    <span class="m-meta-pill" v-if="act.open_hours">
                      ⏰ Mở cửa: {{ act.open_hours }}
                    </span>
                    <span class="m-meta-pill" v-if="act.dwell_time">
                      ⏳ Dừng lại: {{ act.dwell_time }}
                    </span>
                    <span class="m-meta-pill" v-if="act.is_indoor === true">
                      ☂️ Trong nhà
                    </span>
                    <span class="m-meta-pill" v-else-if="act.is_indoor === false">
                      ☀️ Ngoài trời
                    </span>
                  </div>

                  <!-- HÀNG NÚT HÀNH ĐỘNG: CHỈ ĐƯỜNG GOOGLE MAPS -->
                  <div class="m-act-action-row">
                    <a
                      :href="chiDuongUrl(act.place, act.address)"
                      target="_blank"
                      rel="noreferrer"
                      class="btn-act-direction"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                      Chỉ đường Google Maps ↗
                    </a>
                  </div>
                </div>

                <!-- CHỈ BÁO DI CHUYỂN ĐẾN ĐIỂM TIẾP THEO (NẾU CÓ THỜI GIAN/CỰ LY) -->
                <div v-if="act.travel_distance_km" class="m-travel-step-indicator">
                  <span class="mts-line"></span>
                  <span class="mts-pill">
                    🛵 Di chuyển: ~{{ act.travel_distance_km }} km ({{ act.travel_duration_mins || 15 }} phút)
                  </span>
                  <span class="mts-line"></span>
                </div>
              </div>
            </div>

            <!-- CHẶNG NGHỈ ĐÊM TẠI KHÁCH SẠN VÀO CUỐI NGÀY -->
            <div v-if="generatedPlan.hotel_recommendation" class="m-day-finish-box">
              <span class="m-df-icon">🌙</span>
              <div class="m-df-text">
                <strong>Kết thúc ngày {{ currentActiveDayIndex + 1 }}</strong>
                <p>Nghỉ ngơi và hồi phục năng lượng tại <b>{{ generatedPlan.hotel_recommendation.name }}</b> chuẩn bị cho ngày tiếp theo.</p>
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
              <button class="trip-start-fast-btn" @click.stop="batDauChuyenDiMobile(trip)">
                🚀 Bắt đầu ngay
              </button>
              <span class="trip-hint-text">Xem chi tiết →</span>
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

              <!-- Danh sách các thông tin cốt lõi (Đồng bộ 100% chuẩn thuật toán PC) -->
              <div class="guidance-checklist-scroll">
                
                <!-- 0. Điểm khởi hành (Nơi xuất phát) -->
                <div class="guidance-item" :class="{ 'is-ready': guidanceForm.origin }">
                  <div class="g-item-header">
                    <span class="g-item-icon">🛫</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">1. Nơi xuất phát (Điểm bắt đầu)</span>
                        <span class="g-status-badge ready">
                          {{ guidanceForm.origin ? '✓ Từ ' + guidanceForm.origin : 'Chọn nơi xuất phát' }}
                        </span>
                      </div>
                      <span class="g-item-desc">Để AI tính chính xác cự ly, giá vé xe/tàu và lộ trình di chuyển</span>
                    </div>
                  </div>
                  <div class="g-item-control">
                    <div class="g-chips-scroll">
                      <button
                        v-for="orig in popularOrigins"
                        :key="orig"
                        type="button"
                        :class="['g-chip-btn', { active: guidanceForm.origin === orig }]"
                        @click="guidanceForm.origin = orig"
                      >
                        {{ orig }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 1. Điểm đến du lịch -->
                <div class="guidance-item" :class="{ 'is-ready': guidanceForm.destination }">
                  <div class="g-item-header">
                    <span class="g-item-icon">📍</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">2. Điểm đến du lịch</span>
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

                <!-- 2. Thời gian chuyến đi -->
                <div class="guidance-item" :class="{ 'is-ready': guidanceForm.days }">
                  <div class="g-item-header">
                    <span class="g-item-icon">⏱️</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">3. Thời gian chuyến đi</span>
                        <span class="g-status-badge ready">
                          {{ guidanceForm.days }} ngày {{ guidanceForm.nights }} đêm
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
                        {{ d }} Ngày {{ d > 1 ? `${d - 1} Đêm` : 'Đi về trong ngày' }}
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
                        <span class="g-item-name">4. Số người tham gia</span>
                        <span class="g-status-badge ready">
                          ✓ {{ guidanceForm.people }} người
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

                <!-- 4. Phương tiện di chuyển -->
                <div class="guidance-item is-ready">
                  <div class="g-item-header">
                    <span class="g-item-icon">🚌</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">5. Phương tiện di chuyển</span>
                        <span class="g-status-badge ready">
                          ✓ {{ guidanceForm.selfTransit ? 'Tự túc xe (0đ vé)' : guidanceForm.transportation }}
                        </span>
                      </div>
                      <span class="g-item-desc">Lựa chọn cách thức di chuyển tới điểm du lịch</span>
                    </div>
                  </div>
                  <div class="g-item-control">
                    <div class="g-chips-row">
                      <button
                        v-for="tr in transportOptions"
                        :key="tr.key"
                        type="button"
                        :class="['g-chip-btn', { active: guidanceForm.transportation === tr.key }]"
                        @click="guidanceForm.transportation = tr.key; guidanceForm.selfTransit = (tr.key === 'xe máy')"
                      >
                        {{ tr.icon }} {{ tr.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 5. Khách sạn & Nơi lưu trú -->
                <div class="guidance-item is-ready" v-if="guidanceForm.days > 1">
                  <div class="g-item-header">
                    <span class="g-item-icon">🏨</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">6. Khách sạn & Lưu trú</span>
                        <span class="g-status-badge ready">
                          {{ guidanceForm.selfHotel ? '✓ Tự túc nơi ở (0đ)' : '✓ Khách sạn AI gợi ý' }}
                        </span>
                      </div>
                      <span class="g-item-desc">Chọn nghỉ tại khách sạn/homestay hoặc tự túc chỗ ở</span>
                    </div>
                  </div>
                  <div class="g-item-control">
                    <div class="g-chips-row">
                      <button
                        type="button"
                        :class="['g-chip-btn', { active: !guidanceForm.selfHotel }]"
                        @click="guidanceForm.selfHotel = false"
                      >
                        🏨 Gợi ý phòng nghỉ theo ngân sách
                      </button>
                      <button
                        type="button"
                        :class="['g-chip-btn', { active: guidanceForm.selfHotel }]"
                        @click="guidanceForm.selfHotel = true"
                      >
                        🏕️ Tự túc nơi ở (Nhà người thân/Homestay riêng)
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 6. Ngân sách dự kiến & Feasibility Check -->
                <div class="guidance-item" :class="{ 'is-ready': guidanceForm.budgetProvided }">
                  <div class="g-item-header">
                    <span class="g-item-icon">💰</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">7. Ngân sách chuyến đi</span>
                        <span class="g-status-badge ready">
                          ✓ ~{{ formatMoney(guidanceForm.budget) }}đ
                        </span>
                      </div>
                      <span class="g-item-desc">Để thuật toán co giãn giá ăn uống và phòng ở vừa vặn</span>
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

                    <!-- Hộp cảnh báo nếu ngân sách quá eo hẹp (chuẩn PC) -->
                    <div v-if="!tripFeasibility.feasible" class="m-unfeasible-warning">
                      <div class="muw-text">
                        <strong>⚠️ Ngân sách cần điều chỉnh:</strong>
                        <p>{{ tripFeasibility.message }}</p>
                      </div>
                      <button
                        type="button"
                        class="btn-auto-fix-budget"
                        @click="guidanceForm.budget = tripFeasibility.minFeasibleBudget"
                      >
                        ✨ Nâng ngân sách lên {{ formatMoney(tripFeasibility.minFeasibleBudget) }}đ
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 7. Sở thích trải nghiệm -->
                <div class="guidance-item is-ready">
                  <div class="g-item-header">
                    <span class="g-item-icon">🎯</span>
                    <div class="g-item-info">
                      <div class="g-item-title-row">
                        <span class="g-item-name">8. Sở thích trải nghiệm</span>
                        <span class="g-status-badge ready">
                          {{ guidanceForm.interests.length }} sở thích đã chọn
                        </span>
                      </div>
                      <span class="g-item-desc">AI sẽ ưu tiên các điểm tham quan theo gu của bạn</span>
                    </div>
                  </div>
                  <div class="g-item-control">
                    <div class="g-chips-row">
                      <button
                        v-for="it in availableInterests"
                        :key="it"
                        type="button"
                        :class="['g-chip-btn', { active: guidanceForm.interests.includes(it) }]"
                        @click="toggleGuidanceInterest(it)"
                      >
                        <span v-if="guidanceForm.interests.includes(it)">✓ </span>{{ it }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 8. Chế độ Phượt tiết kiệm 100% miễn phí vé -->
                <div class="guidance-free-mode-toggle">
                  <label class="g-free-checkbox-label">
                    <input
                      type="checkbox"
                      v-model="guidanceForm.freePlacesOnly"
                      class="g-free-checkbox"
                    />
                    <span><strong>Phượt tự túc tiết kiệm:</strong> Chỉ gợi ý các điểm 100% MIỄN PHÍ VÉ (bãi biển, phố cổ, di tích mở...)</span>
                  </label>
                </div>

                <!-- 9. Mẫu câu lệnh gợi ý chuẩn -->
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
                  <span v-if="!isGenerating">🚀 Khởi tạo lịch trình tối ưu</span>
                  <span v-else>Đang tính toán chi phí...</span>
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

    <!-- MODAL ĐỒNG HÀNH TRỰC TIẾP CHUYẾN ĐI (LIVE TRIP COMPANION MOBILE) -->
    <LiveTripCompanion
      :isOpen="showMobileLiveCompanion"
      :trip="mobileLiveTrip"
      :isMobile="true"
      @close="showMobileLiveCompanion = false"
      @finish="showMobileLiveCompanion = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import api from '../../services/api'
import LiveTripCompanion from '../planner/LiveTripCompanion.vue'

// ==================== LIVE TRIP COMPANION MOBILE STATE & ACTIONS ====================
const showMobileLiveCompanion = ref(false)
const mobileLiveTrip = ref(null)

function batDauChuyenDiMobile(trip) {
  const t = trip || generatedPlan.value
  if (!t) {
    alert('Vui lòng tạo hoặc chọn một lịch trình trước khi bắt đầu!')
    return
  }
  if (t.days && !t.daysList) {
    t.daysList = t.days
  }
  mobileLiveTrip.value = t
  showMobileLiveCompanion.value = true
}

const props = defineProps({
  nguoiDung: { type: Object, default: null },
  isDark: { type: Boolean, default: false },
  myTrips: { type: Array, default: () => [] },
  myTripsCount: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 },
  userLevelInfo: { type: Object, default: null }
})

const emit = defineEmits(['toggleDark', 'openAuth', 'logout', 'showToast', 'userUpdated', 'refreshTrips'])

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

const popularOrigins = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế', 'Nghệ An', 'Hải Phòng', 'Cần Thơ', 'Quảng Bình', 'Quảng Trị', 'Khánh Hòa']

const transportOptions = [
  { key: 'xe khách', label: 'Xe khách giường nằm', icon: '🚌', desc: 'Có tính vé xe liên tỉnh' },
  { key: 'máy bay', label: 'Máy bay', icon: '✈️', desc: 'Chuyến bay nhanh' },
  { key: 'tàu hỏa', label: 'Tàu hỏa', icon: '🚆', desc: 'Đường sắt ngắm cảnh' },
  { key: 'xe máy', label: 'Xe máy / Tự túc xe', icon: '🛵', desc: '0đ vé xe liên tỉnh (chỉ tính xăng)' }
]

const availableInterests = [
  'Ẩm thực đặc sản',
  'Check-in sống ảo',
  'Biển đảo & Nghỉ dưỡng',
  'Di tích & Lịch sử',
  'Cafe & Chill',
  'Thiên nhiên hoang sơ'
]

const peopleOptions = [
  { val: 1, label: '1 người (Đơn thân)' },
  { val: 2, label: '2 người (Cặp đôi/Bạn bè)' },
  { val: 4, label: 'Nhóm (3 - 4 người)' },
  { val: 6, label: 'Gia đình đông (5+ người)' }
]

const budgetTierOptions = [
  { key: 'budget', label: 'Bình dân / Tiết kiệm', perDay: 1500000, desc: 'Homestay/dorm, quán ăn đặc sản bình dân, tối ưu chi phí' },
  { key: 'medium', label: 'Tiêu chuẩn / Thoải mái', perDay: 2500000, desc: 'Khách sạn 3-4 sao, ẩm thực phong phú, lịch trình thảnh thơi' },
  { key: 'luxury', label: 'Sang trọng / Nghỉ dưỡng', perDay: 4500000, desc: 'Resort 4-5 sao, nhà hàng cao cấp, dịch vụ trọn gói' }
]

const promptExamples = [
  'Từ Hà Nội đi Đà Nẵng 3 ngày 2 đêm, 2 người, ngân sách 7 triệu, đi xe khách, thích ẩm thực & check-in',
  'Từ TP.HCM đi Huế 3 ngày 2 đêm, 2 người, ngân sách 6 triệu, tự túc xe, thích di tích & ẩm thực cố đô',
  'Từ Đà Nẵng đi Quy Nhơn 2 ngày 1 đêm, 2 người, ngân sách 4 triệu, thích biển & hải sản',
  '4 ngày 3 đêm ở Quảng Bình, 4 người, ngân sách 16 triệu, thích khám phá hang động & suối Moọc'
]

const guidanceForm = reactive({
  origin: 'Hà Nội',
  destination: 'Đà Nẵng',
  days: 3,
  nights: 2,
  people: 2,
  peopleProvided: true,
  budget: 6000000,
  budgetTier: 'medium',
  budgetProvided: true,
  transportation: 'xe khách',
  selfTransit: false,
  selfHotel: false,
  freePlacesOnly: false,
  interests: ['Ẩm thực đặc sản', 'Check-in sống ảo']
})

// Kiểm tra tính khả thi của ngân sách (Feasibility Check - Giống 100% bản PC)
const tripFeasibility = computed(() => {
  const budget = Number(guidanceForm.budget) || 0
  const days = Math.max(1, Number(guidanceForm.days) || 1)
  const people = Math.max(1, Number(guidanceForm.people) || 1)
  const dest = guidanceForm.destination || 'Đà Nẵng'
  const freeOnly = Boolean(guidanceForm.freePlacesOnly)
  const perPersonPerDay = Math.round(budget / (days * people))
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
      message: `Ngân sách ${formatMoney(budget)}đ chưa khả thi cho chuyến đi ${days} ngày ${people} người tại ${dest} (trung bình chỉ ~${formatMoney(perPersonPerDay)}đ/người/ngày). Số tiền này khó chi trả đủ chỗ ở và 3 bữa ăn mỗi ngày.`
    }
  }

  return {
    feasible: true,
    perPersonPerDay,
    minFeasibleBudget
  }
})

function openGuidanceSheet(fromIncomplete = false) {
  if (!fromIncomplete) {
    if (!guidanceForm.destination) guidanceForm.destination = 'Đà Nẵng'
    if (!guidanceForm.days) guidanceForm.days = 3
    guidanceForm.nights = Math.max(0, guidanceForm.days - 1)
    if (!guidanceForm.people) guidanceForm.people = 2
    if (!guidanceForm.budgetTier) guidanceForm.budgetTier = 'medium'
    recalcGuidanceBudget()
  }
  showGuidanceSheet.value = true
}

function selectGuidanceDays(d) {
  guidanceForm.days = d
  guidanceForm.nights = Math.max(0, d - 1)
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

function toggleGuidanceInterest(it) {
  const idx = guidanceForm.interests.indexOf(it)
  if (idx >= 0) {
    guidanceForm.interests.splice(idx, 1)
  } else {
    guidanceForm.interests.push(it)
  }
}

function recalcGuidanceBudget() {
  const tier = budgetTierOptions.find(t => t.key === guidanceForm.budgetTier) || budgetTierOptions[1]
  guidanceForm.budget = tier.perDay * (guidanceForm.days || 1) * (guidanceForm.people || 1)
}

function applyExamplePrompt(text) {
  quickPromptText.value = text
  showGuidanceSheet.value = false
  handleDirectGenerateFromPrompt()
}

// ==================== THUẬT TOÁN ĐỒNG BỘ CHI PHÍ THỰC TẾ (ĐỒNG BỘ CHÍNH XÁC VỚI BẢN PC) ====================
function tinhChiPhiKhachSan(plan) {
  if (guidanceForm.selfHotel || plan?.self_hotel) return 0
  if (!plan?.hotel_recommendation) return 0
  const nights = plan.nights !== undefined ? Number(plan.nights) : (guidanceForm.nights !== undefined ? Number(guidanceForm.nights) : Math.max(0, (plan.daysList?.length || plan.days?.length || 1) - 1))
  if (nights <= 0) return 0
  const people = Number(plan.people) || Number(guidanceForm.people) || 2
  const budget = Number(plan.target_budget || guidanceForm.budget || 3000000)
  const aiPrice = Number(plan.hotel_recommendation.price_per_night) || 850000

  // Tính ngưỡng giá khách sạn tối đa hợp lý theo ngân sách (tối đa 30% ngân sách cho khách sạn)
  const maxHotelBudget = budget * 0.30
  const maxPricePerNight = nights > 0 ? Math.round(maxHotelBudget / nights) : 300000
  const effectivePrice = Math.min(aiPrice, maxPricePerNight)

  if (effectivePrice <= 300000) {
    return Math.round(effectivePrice * people * nights)
  }
  const rooms = Math.max(1, Math.ceil(people / 2))
  return Math.round(effectivePrice * rooms * nights)
}

function dongBoChiPhiLichTrinh() {
  if (!generatedPlan.value) return
  const plan = generatedPlan.value
  const people = Number(plan.people) || Number(guidanceForm.people) || 2
  const allDays = plan.daysList || plan.days || []
  const days = Math.max(1, allDays.length || guidanceForm.days || 3)

  // 1. Chi phí khách sạn chính xác (đã tối ưu theo ngân sách và loại phòng)
  const realHotel = tinhChiPhiKhachSan(plan)

  // 2. Chi phí vé xe di chuyển:
  // - Nếu bật "Tự túc xe" hoặc đi xe máy: KHÔNG tính vé xe liên tỉnh, chỉ tính xăng xe máy / nội tỉnh nhẹ nhàng
  // - Nếu đi xe khách/tàu: Tính tiền vé xe đầy đủ (khứ hồi + di chuyển nội tỉnh)
  const isSelfTransit = Boolean(guidanceForm.selfTransit || plan.self_transit || guidanceForm.transportation === 'xe máy')
  guidanceForm.selfTransit = isSelfTransit
  plan.self_transit = isSelfTransit
  let roundTripBus = 0
  let localTransport = days * 75000 * Math.max(1, Math.ceil(people / 2))

  if (isSelfTransit) {
    roundTripBus = 0
    localTransport = days * 40000 * Math.max(1, Math.ceil(people / 2))
  } else {
    const busPrice = Number(plan.transit_summary?.selected_bus?.price || plan.transit_summary?.cheapestBus?.price || 320000)
    roundTripBus = busPrice * people * 2
  }
  const realTransit = roundTripBus + localTransport

  // 3. Chi phí vé tham quan ban đầu
  let realTickets = 0
  if (!guidanceForm.freePlacesOnly && !plan.free_places_only) {
    allDays.forEach(d => {
      (d.activities || []).forEach(a => {
        const c = Number(a.estimated_cost) || 0
        if (['attraction', 'checkin'].includes(a.type)) {
          realTickets += c * people
        }
      })
    })
  } else {
    realTickets = 0
  }

  // 4. THUẬT TOÁN CO GIÃN CHI PHÍ ĂN UỐNG ĐỘNG (DYNAMIC FOOD BUDGET SCALING)
  const userTargetBudget = Number(plan.target_budget || guidanceForm.budget || 3500000)

  // Lưu trữ danh sách bữa ăn và tính tổng tiền ăn thô ban đầu
  const foodActivities = []
  let rawFoodTotal = 0
  allDays.forEach(d => {
    (d.activities || []).forEach(a => {
      if (['breakfast', 'lunch', 'dinner', 'restaurant', 'cafe'].includes(a.type)) {
        if (a._raw_cost === undefined) {
          a._raw_cost = Number(a.estimated_cost) || (a.type === 'breakfast' ? 45000 : a.type === 'cafe' ? 30000 : 150000)
        }
        foodActivities.push(a)
        rawFoodTotal += (Number(a._raw_cost) || 0) * people
      }
    })
  })

  // Tính số tiền còn lại dành cho ăn uống sau khi trừ Khách sạn + Xe cộ + Vé tham quan (giữ ~5% quỹ dự phòng)
  const fixedCosts = realHotel + realTransit + realTickets
  const reserveTarget = Math.round(userTargetBudget * 0.05)
  const availableBudgetForFood = Math.max(0, userTargetBudget - fixedCosts - reserveTarget)
  const minSurvivalFood = days * people * 80000 // Tối thiểu 80k/người/ngày cho 3 bữa bình dân

  let realFood = 0
  if (foodActivities.length > 0) {
    if (availableBudgetForFood >= minSurvivalFood && rawFoodTotal > availableBudgetForFood) {
      // Co giãn tỷ lệ từng bữa ăn xuống để tổng chi phí tự động khống chế dưới ngân sách mục tiêu
      const scaleRatio = availableBudgetForFood / Math.max(1, rawFoodTotal)
      foodActivities.forEach(a => {
        let scaled = (a._raw_cost || a.estimated_cost) * scaleRatio
        if (a.type === 'breakfast') {
          scaled = Math.max(25000, Math.min(45000, Math.round(scaled / 5000) * 5000))
        } else if (a.type === 'cafe') {
          scaled = Math.max(20000, Math.min(35000, Math.round(scaled / 5000) * 5000))
        } else {
          scaled = Math.max(35000, Math.min(100000, Math.round(scaled / 5000) * 5000))
        }
        a.estimated_cost = scaled
      })
      realFood = foodActivities.reduce((sum, a) => sum + (Number(a.estimated_cost) * people), 0)

      // Cân chỉnh vi mô để đảm bảo không bị vượt quá do làm tròn số
      if (realFood + fixedCosts + reserveTarget > userTargetBudget && availableBudgetForFood > 0) {
        const excess = (realFood + fixedCosts + reserveTarget) - userTargetBudget
        const trimPerAct = Math.ceil(excess / (foodActivities.length * people))
        foodActivities.forEach(a => {
          const floor = a.type === 'breakfast' ? 20000 : a.type === 'cafe' ? 15000 : 30000
          a.estimated_cost = Math.max(floor, a.estimated_cost - trimPerAct)
        })
        realFood = foodActivities.reduce((sum, a) => sum + (Number(a.estimated_cost) * people), 0)
      }
    } else if (availableBudgetForFood < minSurvivalFood) {
      // Khi ngân sách quá eo hẹp không đủ cả mức ăn tối thiểu
      foodActivities.forEach(a => {
        const floor = a.type === 'breakfast' ? 25000 : a.type === 'cafe' ? 20000 : 35000
        a.estimated_cost = floor
      })
      realFood = foodActivities.reduce((sum, a) => sum + (Number(a.estimated_cost) * people), 0)
    } else {
      // Ngân sách dư dả, phục hồi về giá menu nguyên bản
      foodActivities.forEach(a => {
        if (a._raw_cost !== undefined) a.estimated_cost = a._raw_cost
      })
      realFood = rawFoodTotal
    }
  } else {
    realFood = Math.min(availableBudgetForFood, days * people * 140000)
  }

  // 5. Tính toán tổng dự toán cuối cùng
  const subtotal = realHotel + realTransit + realFood + realTickets
  let realReserve = 0
  if (userTargetBudget >= subtotal) {
    realReserve = Math.min(Math.round(subtotal * 0.05), userTargetBudget - subtotal)
  } else {
    realReserve = Math.round(subtotal * 0.03)
  }

  plan.budget_breakdown = {
    hotel: realHotel,
    transportation: realTransit,
    food: realFood,
    tickets: realTickets,
    reserve: realReserve
  }
  plan.total_budget = subtotal + realReserve
  plan.target_budget = userTargetBudget
  plan.is_over_budget = (subtotal + realReserve) > userTargetBudget
  if (plan.is_over_budget) {
    plan.over_amount = (subtotal + realReserve) - userTargetBudget
    plan.over_percent = Math.round((plan.over_amount / userTargetBudget) * 100)
  }
}

async function submitGuidancePlan() {
  showGuidanceSheet.value = false
  isGenerating.value = true
  isPlanSaved.value = false
  try {
    const payload = {
      prompt: quickPromptText.value || `${guidanceForm.days} ngày ${guidanceForm.nights} đêm ở ${guidanceForm.destination}`,
      origin: guidanceForm.origin || 'Hà Nội',
      destination: guidanceForm.destination || 'Đà Nẵng',
      days: Number(guidanceForm.days) || 3,
      nights: Number(guidanceForm.nights) || Math.max(0, Number(guidanceForm.days) - 1),
      people: Number(guidanceForm.people) || 1,
      budget: Number(guidanceForm.budget) || (1500000 * guidanceForm.days * guidanceForm.people),
      total_budget: Number(guidanceForm.budget) || (1500000 * guidanceForm.days * guidanceForm.people),
      transportation: guidanceForm.transportation || 'xe khách',
      self_transit: Boolean(guidanceForm.selfTransit || guidanceForm.transportation === 'xe máy'),
      tu_tuc_phuong_tien: Boolean(guidanceForm.selfTransit || guidanceForm.transportation === 'xe máy'),
      self_hotel: Boolean(guidanceForm.selfHotel),
      tu_tuc_khach_san: Boolean(guidanceForm.selfHotel),
      free_places_only: Boolean(guidanceForm.freePlacesOnly),
      interests: guidanceForm.interests || []
    }
    const res = await api.post('/ai/plan', payload)
    generatedPlan.value = res.data
    generatedPlan.value.nights = payload.nights
    generatedPlan.value.origin = payload.origin
    generatedPlan.value.transportation = payload.transportation
    generatedPlan.value.self_transit = payload.self_transit
    generatedPlan.value.self_hotel = payload.self_hotel
    generatedPlan.value.free_places_only = payload.free_places_only

    if (guidanceForm.selfHotel) {
      generatedPlan.value.hotel_recommendation = {
        name: 'Tự túc nơi ở / Homestay riêng',
        address: `Khu vực ${guidanceForm.destination}`,
        rating: 5.0,
        price_per_night: 0,
        description: 'Chỗ ở tự túc (nhà người thân hoặc homestay riêng). Chi phí lưu trú: 0đ.'
      }
    }

    // CHẠY THUẬT TOÁN ĐỒNG BỘ CHI PHÍ THỰC TẾ
    dongBoChiPhiLichTrinh()

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
  const hasBudgetMention = /(\d+[\s.]*(triệu|trieu|tr|k|đ|vnđ)|ngân sách|ngan sach|chi phí)/i.test(text)
  const hasPeopleMention = /(\d+[\s.]*người|nguoi|bạn bè|gia đình|gia dinh|cặp đôi|cap doi|đơn thân)/i.test(text)

  let detectedDest = ''
  for (const city of cityList) {
    if (text.replace(/\s+/g, '').includes(city.toLowerCase().replace(/\s+/g, ''))) {
      detectedDest = city
      break
    }
  }
  const dayMatch = text.match(/(\d+)\s*(ngày|ngay|N)/i)
  const detectedDays = dayMatch ? parseInt(dayMatch[1], 10) : 3

  // Nếu câu lệnh chưa đủ các thông số quan trọng (ngân sách, số người, điểm đến), bật sheet để hoàn thiện
  if (!hasBudgetMention || !hasPeopleMention || !detectedDest) {
    guidanceForm.destination = detectedDest || 'Đà Nẵng'
    guidanceForm.days = detectedDays
    guidanceForm.nights = Math.max(0, detectedDays - 1)
    guidanceForm.people = hasPeopleMention ? 2 : 1
    guidanceForm.peopleProvided = hasPeopleMention
    guidanceForm.budgetProvided = hasBudgetMention
    guidanceForm.budgetTier = 'budget'
    recalcGuidanceBudget()
    showGuidanceSheet.value = true
    return
  }

  await handleDirectGenerateFromPrompt()
}

async function handleDirectGenerateFromPrompt() {
  if (!quickPromptText.value.trim()) return
  isGenerating.value = true
  isPlanSaved.value = false
  try {
    let destination = 'Đà Nẵng'
    let days = 3
    let people = 2
    let budget = 6000000
    let interests = []
    let origin = 'Hà Nội'

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

    // Nhận diện điểm xuất phát nếu có trong câu
    for (const orig of popularOrigins) {
      if (quickPromptText.value.toLowerCase().includes(`từ ${orig.toLowerCase()}`) ||
          quickPromptText.value.toLowerCase().includes(`ở ${orig.toLowerCase()} đi`)) {
        origin = orig
        break
      }
    }

    const payload = {
      prompt: quickPromptText.value,
      origin,
      destination,
      days,
      nights: Math.max(0, days - 1),
      people,
      budget,
      total_budget: budget,
      transportation: guidanceForm.transportation || 'xe khách',
      self_transit: Boolean(guidanceForm.selfTransit || guidanceForm.transportation === 'xe máy'),
      tu_tuc_phuong_tien: Boolean(guidanceForm.selfTransit || guidanceForm.transportation === 'xe máy'),
      self_hotel: Boolean(guidanceForm.selfHotel),
      tu_tuc_khach_san: Boolean(guidanceForm.selfHotel),
      free_places_only: Boolean(guidanceForm.freePlacesOnly),
      interests
    }

    const res = await api.post('/ai/plan', payload)
    generatedPlan.value = res.data
    generatedPlan.value.nights = payload.nights
    generatedPlan.value.origin = payload.origin
    generatedPlan.value.transportation = payload.transportation
    generatedPlan.value.self_transit = payload.self_transit
    generatedPlan.value.self_hotel = payload.self_hotel
    generatedPlan.value.free_places_only = payload.free_places_only

    dongBoChiPhiLichTrinh()

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
      origin: guidanceForm.origin || 'Hà Nội',
      destination: plannerForm.destination || 'Đà Nẵng',
      days: Number(plannerForm.days) || 3,
      nights: Math.max(0, Number(plannerForm.days) - 1),
      people: Number(plannerForm.people) || 1,
      budget: totalBudget,
      total_budget: totalBudget,
      transportation: guidanceForm.transportation || 'xe khách',
      self_transit: Boolean(guidanceForm.selfTransit),
      self_hotel: Boolean(guidanceForm.selfHotel),
      free_places_only: Boolean(guidanceForm.freePlacesOnly)
    }
    const res = await api.post('/ai/plan', payload)
    generatedPlan.value = res.data
    generatedPlan.value.nights = payload.nights
    generatedPlan.value.origin = payload.origin
    generatedPlan.value.transportation = payload.transportation
    generatedPlan.value.self_transit = payload.self_transit
    generatedPlan.value.self_hotel = payload.self_hotel

    dongBoChiPhiLichTrinh()

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
    
    if (props.nguoiDung) {
      try {
        const res = await api.post('/social/my-trips', tripToSave)
        if (res.data && res.data._id) {
          tripToSave._id = res.data._id
        }
      } catch (err) {
        console.warn('Lỗi lưu cloud:', err.message)
      }
    }
    
    // Save to local storage
    const raw = localStorage.getItem('my_saved_trips')
    let list = raw ? JSON.parse(raw) : []
    const existIdx = list.findIndex(t => String(t._id || t.id) === String(tripToSave._id))
    if (existIdx >= 0) {
      list[existIdx] = tripToSave
    } else {
      list.unshift(tripToSave)
    }
    localStorage.setItem('my_saved_trips', JSON.stringify(list))
    savedTrips.value = list

    emit('refreshTrips')
    isPlanSaved.value = true
    alert('Đã lưu chuyến đi thành công!')
  } catch (e) {
    console.warn('Lỗi lưu:', e.message)
  }
}

async function loadSavedTrips() {
  // 1. Nếu đã đăng nhập, luôn ưu tiên đồng bộ từ Server MongoDB
  if (props.nguoiDung) {
    try {
      const res = await api.get('/social/my-trips')
      if (res.data && Array.isArray(res.data)) {
        savedTrips.value = res.data
        localStorage.setItem('my_saved_trips', JSON.stringify(res.data))
        return
      }
    } catch (e) {
      console.warn('Lỗi tải chuyến đi từ server:', e.message)
    }
  }

  // 2. Nếu có prop myTrips từ App.vue
  if (props.myTrips && Array.isArray(props.myTrips) && props.myTrips.length > 0) {
    savedTrips.value = props.myTrips
    localStorage.setItem('my_saved_trips', JSON.stringify(props.myTrips))
    return
  }

  // 3. Fallback: Lấy từ LocalStorage
  try {
    const raw = localStorage.getItem('my_saved_trips')
    if (raw) savedTrips.value = JSON.parse(raw)
  } catch (e) {}
}

// Tự động đồng bộ khi prop myTrips thay đổi
watch(() => props.myTrips, (newVal) => {
  if (newVal && Array.isArray(newVal) && newVal.length > 0) {
    savedTrips.value = newVal
  }
}, { immediate: true })

// Tự động tải lại chuyến đi khi người dùng đăng nhập hoặc chuyển sang tab Chuyến đi đã lưu
watch(() => props.nguoiDung, (user) => {
  if (user) {
    loadSavedTrips()
  }
})

watch(currentTab, (tab) => {
  if (tab === 'mytrips') {
    loadSavedTrips()
  }
})

function openSavedTripDetail(trip) {
  generatedPlan.value = trip
  currentActiveDayIndex.value = 0
  currentTab.value = 'explore'
}

async function deleteSavedTrip(id) {
  if (!confirm('Bạn có chắc muốn xóa chuyến đi này khỏi danh sách?\n\n⚠️ Hành động này không thể hoàn tác.')) return
  try {
    if (id && !String(id).startsWith('local-')) {
      await api.delete(`/social/trips/${id}`)
    }
  } catch (e) {
    console.warn('Lỗi xóa trên server:', e.message)
  }
  savedTrips.value = savedTrips.value.filter(t => t._id !== id)
  localStorage.setItem('my_saved_trips', JSON.stringify(savedTrips.value))
  emit('refreshTrips')
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

function getPlaceImage(place) {
  if (place?.image) return place.image
  if (place?.image_url) return place.image_url
  const name = ((place?.name || place?.place || '') + '').toLowerCase()
  const dest = (generatedPlan.value?.destination || '').toLowerCase()

  // 1. Danh thắng & Điểm du lịch nổi tiếng
  if (name.includes('bà nà') || name.includes('cầu vàng')) {
    return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('phố cổ') || name.includes('hội an') || name.includes('chùa cầu')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('đại nội') || name.includes('hoàng thành') || name.includes('cố đô') || name.includes('ngọ môn')) {
    return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('chùa') || name.includes('thiên mụ') || name.includes('linh ứng') || name.includes('thiền viện')) {
    return 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('lăng') || name.includes('khải định') || name.includes('tự đức') || name.includes('minh mạng')) {
    return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('sơn trà') || name.includes('ngũ hành sơn') || name.includes('bán đảo')) {
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('cầu rồng') || name.includes('sông hàn') || name.includes('cầu tình yêu')) {
    return 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('phong nha') || name.includes('thiên đường') || name.includes('hang tối') || name.includes('động') || name.includes('sơn đoòng')) {
    return 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('suối') || name.includes('moọc') || name.includes('thác') || name.includes('rừng dừa') || name.includes('sinh thái') || name.includes('nam an')) {
    return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('biển') || name.includes('mỹ khê') || name.includes('an bàng') || name.includes('nhật lệ') || name.includes('lăng cô') || name.includes('eo gió') || name.includes('kỳ co') || name.includes('đá nhảy')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('chợ') || name.includes('chợ hàn') || name.includes('chợ cồn') || name.includes('chợ đêm')) {
    return 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&auto=format&fit=crop&q=80'
  }

  // 2. Ẩm thực, Quán nướng, Hải sản, Quán ăn
  if (place?.type === 'restaurant' || place?.type === 'breakfast' || place?.type === 'lunch' || place?.type === 'dinner' ||
      name.includes('nướng') || name.includes('hải sản') || name.includes('quán') || name.includes('tiệm') ||
      name.includes('bún') || name.includes('mì') || name.includes('cơm') || name.includes('bánh') ||
      name.includes('lẩu') || name.includes('gà') || name.includes('nem') || name.includes('cháo') || name.includes('ẩm thực')) {
    if (name.includes('nướng') || name.includes('bbq') || name.includes('thương thương')) {
      return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
    }
    if (name.includes('hải sản') || name.includes('seafood') || name.includes('bà tám') || name.includes('tư rảnh') || name.includes('tôm') || name.includes('cua') || name.includes('cá') || name.includes('ốc')) {
      return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'
    }
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'
  }

  // 3. Cafe & Quán nước
  if (place?.type === 'cafe' || name.includes('cafe') || name.includes('coffee') || name.includes('cà phê') || name.includes('trà') || name.includes('chill')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80'
  }

  // 4. Khách sạn & Nghỉ dưỡng
  if (place?.type === 'hotel' || name.includes('hotel') || name.includes('resort') || name.includes('khách sạn') || name.includes('homestay') || name.includes('nhà nghỉ')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'
  }

  // 5. Mặc định theo vùng miền
  if (dest.includes('huế')) return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  if (dest.includes('hội an')) return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  if (dest.includes('đà nẵng')) return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80'
  
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80'
}

function onImageError(e) {
  e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80'
}

function getBadgeInfo(act) {
  if (!act) return { icon: '📍', label: 'Hoạt động', class: 'badge-attraction' }
  const type = act.type || ''
  const map = {
    breakfast: { icon: '🍜', label: act.label || 'Ăn sáng', class: 'badge-breakfast' },
    lunch: { icon: '🍲', label: act.label || 'Ăn trưa', class: 'badge-lunch' },
    dinner: { icon: '🍷', label: act.label || 'Ăn tối', class: 'badge-dinner' },
    restaurant: { icon: '🍽️', label: act.label || 'Ẩm thực', class: 'badge-dinner' },
    checkin: { icon: '🏨', label: act.label || 'Nhận phòng', class: 'badge-hotel' },
    checkout: { icon: '🏨', label: act.label || 'Trả phòng', class: 'badge-hotel' },
    hotel: { icon: '🏨', label: act.label || 'Khách sạn', class: 'badge-hotel' },
    cafe: { icon: '☕', label: act.label || 'Cafe & Chill', class: 'badge-cafe' },
    attraction: { icon: '🏛️', label: act.label || 'Tham quan / Check-in', class: 'badge-attraction' }
  }
  if (map[type]) return map[type]
  const pLower = (act.place || '').toLowerCase()
  if (pLower.includes('quán') || pLower.includes('tiệm') || pLower.includes('hải sản') || pLower.includes('nướng') || pLower.includes('bánh') || pLower.includes('cơm')) {
    return { icon: '🍽️', label: 'Ẩm thực', class: 'badge-dinner' }
  }
  if (pLower.includes('cafe') || pLower.includes('cà phê') || pLower.includes('trà')) {
    return { icon: '☕', label: 'Cafe & Chill', class: 'badge-cafe' }
  }
  return { icon: '📍', label: 'Tham quan', class: 'badge-attraction' }
}

function layMoTaHoatDong(act) {
  const desc = act.activity || act.description || act.note
  if (desc && desc.trim().length > 10) return desc.trim()
  const name = act.place || ''
  const type = act.type || ''
  if (type === 'breakfast' || type === 'lunch' || type === 'dinner' || type === 'restaurant') {
    return `Thưởng thức ẩm thực đặc sản nức tiếng tại ${name}, nguyên liệu tươi ngon được chế biến theo công thức gia truyền đậm đà bản địa.`
  }
  if (type === 'cafe') {
    return `Không gian thưởng thức cafe và đồ uống thanh mát tại ${name}, góc check-in thư giãn cực chill và ngắm cảnh phố phường.`
  }
  if (type === 'hotel' || type === 'checkin') {
    return `Nghỉ ngơi và thư giãn tại ${name}, phòng ốc tiện nghi sạch sẽ, thuận tiện di chuyển tới các điểm du lịch lân cận.`
  }
  return `Khám phá và tham quan ${name}, chiêm ngưỡng cảnh quan ấn tượng, chụp ảnh sống ảo và trải nghiệm nét đẹp văn hóa địa phương.`
}

function chiDuongUrl(place, address = '') {
  const dest = generatedPlan.value?.destination || 'Miền Trung'
  const query = address ? `${place}, ${address}` : `${place}, ${dest}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

function taoLinkGoogleMapsChoNgay(day) {
  if (!day || !day.activities || day.activities.length === 0) return 'https://www.google.com/maps'
  const acts = day.activities
  const dest = generatedPlan.value?.destination || 'Miền Trung'
  const origin = encodeURIComponent(`${acts[0].place}, ${acts[0].address || dest}`)
  const destination = encodeURIComponent(`${acts[acts.length - 1].place}, ${acts[acts.length - 1].address || dest}`)
  if (acts.length <= 2) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
  }
  const waypoints = acts.slice(1, -1).slice(0, 8).map(a => encodeURIComponent(`${a.place}, ${a.address || dest}`)).join('|')
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`
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

/* GENERATED PLAN SECTION (PHONG PHÚ ĐẦY ĐỦ CHI TIẾT NHƯ BẢN PC) */
.mobile-generated-plan {
  margin: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* BANNER TỔNG QUAN CHUYẾN ĐI */
.plan-summary-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
  border-radius: 20px;
  padding: 18px 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.plan-badge-line {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.badge-emerald {
  font-size: 0.65rem;
  font-weight: 800;
  background: #059669;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.03em;
}

.badge-amber {
  font-size: 0.65rem;
  font-weight: 800;
  background: #f59e0b;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 999px;
}

.plan-dest-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.plan-meta-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 14px;
}

.pms-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pms-label {
  font-size: 0.62rem;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 600;
}

.pms-val {
  font-size: 0.76rem;
  font-weight: 750;
  color: #f8fafc;
}

.pms-val.text-emerald {
  color: #34d399;
}

.plan-quick-buttons {
  display: flex;
  gap: 10px;
}

.btn-save-mobile-plan {
  flex: 1.5;
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
  transition: transform 0.15s ease;
}

.btn-save-mobile-plan:active {
  transform: scale(0.97);
}

.btn-reset-mobile-plan {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #f1f5f9;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
}

/* BÓC TÁCH NGÂN SÁCH THÔNG MINH */
.mobile-budget-breakdown-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

:root[data-theme="dark"] .mobile-budget-breakdown-card {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.08);
}

.m-card-header-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.m-card-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
}

:root[data-theme="dark"] .m-card-title {
  color: #f8fafc;
}

.m-budget-total-pill {
  font-size: 0.68rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 999px;
  padding: 2px 8px;
}

:root[data-theme="dark"] .m-budget-total-pill {
  background: rgba(6, 78, 59, 0.4);
  border-color: rgba(52, 211, 153, 0.4);
  color: #34d399;
}

.m-budget-grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.m-budget-mini-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 8px 10px;
}

:root[data-theme="dark"] .m-budget-mini-item {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.06);
}

.m-bmi-icon {
  font-size: 1.15rem;
}

.m-bmi-info {
  display: flex;
  flex-direction: column;
}

.m-bmi-label {
  font-size: 0.62rem;
  color: #64748b;
  font-weight: 600;
}

:root[data-theme="dark"] .m-bmi-label {
  color: #94a3b8;
}

.m-bmi-val {
  font-size: 0.74rem;
  font-weight: 750;
  color: #0f172a;
}

:root[data-theme="dark"] .m-bmi-val {
  color: #f1f5f9;
}

/* THẺ KHÁCH SẠN LƯU TRÚ */
.mobile-hotel-rec-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

:root[data-theme="dark"] .mobile-hotel-rec-card {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.08);
}

.m-hotel-rec-top {
  display: flex;
  gap: 12px;
}

.m-hotel-thumb-wrap {
  width: 95px;
  height: 95px;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.m-hotel-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.m-hotel-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  background: rgba(15, 23, 42, 0.85);
  color: #fde68a;
  font-size: 0.55rem;
  font-weight: 750;
  text-align: center;
  padding: 2px 4px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.m-hotel-info-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.m-hotel-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}

:root[data-theme="dark"] .m-hotel-name {
  color: #f8fafc;
}

.m-hotel-addr {
  font-size: 0.68rem;
  color: #64748b;
  margin: 2px 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root[data-theme="dark"] .m-hotel-addr {
  color: #94a3b8;
}

.m-hotel-rating-price {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.m-hotel-star {
  color: #f59e0b;
}

.m-hotel-price {
  color: #059669;
}

:root[data-theme="dark"] .m-hotel-price {
  color: #34d399;
}

.m-hotel-map-link {
  font-size: 0.68rem;
  font-weight: 750;
  color: #0284c7;
  text-decoration: none;
}

/* THẺ CHẶNG KHỞI HÀNH (TRANSIT) */
.mobile-transit-card {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 16px;
  padding: 12px 14px;
}

:root[data-theme="dark"] .mobile-transit-card {
  background: rgba(6, 78, 59, 0.25);
  border-color: rgba(52, 211, 153, 0.3);
}

.m-transit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.m-transit-badge {
  font-size: 0.62rem;
  font-weight: 800;
  color: #065f46;
  letter-spacing: 0.04em;
}

:root[data-theme="dark"] .m-transit-badge {
  color: #34d399;
}

.m-transit-route {
  font-size: 0.72rem;
  font-weight: 800;
  color: #0f172a;
}

:root[data-theme="dark"] .m-transit-route {
  color: #f1f5f9;
}

.m-transit-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.72rem;
}

.m-transit-detail-row {
  display: flex;
  justify-content: space-between;
  color: #475569;
}

:root[data-theme="dark"] .m-transit-detail-row {
  color: #94a3b8;
}

.m-transit-detail-row strong {
  color: #0f172a;
}

:root[data-theme="dark"] .m-transit-detail-row strong {
  color: #f8fafc;
}

/* THANH CHỌN NGÀY (DAY TABS) */
.plan-day-pills-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px;
  scrollbar-width: none;
}

.plan-day-pills-row::-webkit-scrollbar {
  display: none;
}

.day-pill-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

:root[data-theme="dark"] .day-pill-item {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
}

.day-pill-item.active {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.35);
}

.dpi-count {
  font-size: 0.65rem;
  font-weight: 600;
  opacity: 0.85;
}

/* KHỐI HOẠT ĐỘNG CHI TIẾT TRONG NGÀY */
.day-activities-card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 14px;
  border: 1px solid #e2e8f0;
}

:root[data-theme="dark"] .day-activities-card {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.08);
}

.m-day-header-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

:root[data-theme="dark"] .m-day-header-banner {
  border-color: rgba(255, 255, 255, 0.08);
}

.m-dhb-left {
  display: flex;
  flex-direction: column;
}

.m-day-counter {
  font-size: 0.62rem;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

:root[data-theme="dark"] .m-day-counter {
  color: #34d399;
}

.day-activities-title {
  font-size: 0.96rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

:root[data-theme="dark"] .day-activities-title {
  color: #f8fafc;
}

.btn-day-maps-route {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  border: 1.5px solid #86efac;
  border-radius: 999px;
  padding: 6px 12px;
  color: #065f46;
  font-size: 0.7rem;
  font-weight: 750;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(5, 150, 105, 0.1);
  transition: all 0.2s ease;
}

:root[data-theme="dark"] .btn-day-maps-route {
  background: rgba(6, 78, 59, 0.6);
  border-color: #34d399;
  color: #ffffff;
}

.btn-day-maps-route:active {
  transform: scale(0.96);
}

/* DANH SÁCH THẺ HOẠT ĐỘNG (RICH ACTIVITY CARDS) */
.timeline-activity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.m-act-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:root[data-theme="dark"] .m-act-card {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.m-act-top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.m-act-time-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #065f46;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 3px 8px;
}

:root[data-theme="dark"] .m-act-time-pill {
  background: rgba(6, 78, 59, 0.5);
  border-color: rgba(52, 211, 153, 0.4);
  color: #a7f3d0;
}

.mat-clock {
  font-size: 0.75rem;
}

.m-act-badge {
  font-size: 0.66rem;
  font-weight: 750;
  padding: 3px 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-breakfast, .badge-cafe {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.badge-lunch, .badge-dinner {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.badge-attraction {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.badge-hotel {
  background: #faf5ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

:root[data-theme="dark"] .badge-breakfast,
:root[data-theme="dark"] .badge-cafe {
  background: rgba(245, 158, 11, 0.15);
  color: #fde68a;
  border-color: rgba(245, 158, 11, 0.3);
}

:root[data-theme="dark"] .badge-lunch,
:root[data-theme="dark"] .badge-dinner {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

:root[data-theme="dark"] .badge-attraction {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.3);
}

:root[data-theme="dark"] .badge-hotel {
  background: rgba(168, 85, 247, 0.15);
  color: #d8b4fe;
  border-color: rgba(168, 85, 247, 0.3);
}

.m-act-cost-badge {
  font-size: 0.68rem;
  font-weight: 750;
  color: #0f172a;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 3px 8px;
  margin-left: auto;
}

.m-act-cost-badge.free {
  color: #059669;
  background: #ecfdf5;
  border-color: #a7f3d0;
}

:root[data-theme="dark"] .m-act-cost-badge {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

:root[data-theme="dark"] .m-act-cost-badge.free {
  color: #34d399;
  background: rgba(6, 78, 59, 0.4);
  border-color: rgba(52, 211, 153, 0.3);
}

/* ẢNH THẬT ĐỊA ĐIỂM (THUMBNAIL BANNER) */
.m-act-image-box {
  width: 100%;
  height: 145px;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  margin-bottom: 10px;
  background: #e2e8f0;
}

.m-act-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.m-act-card:hover .m-act-photo {
  transform: scale(1.03);
}

.m-act-index-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.m-act-rating-pill {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(4px);
  color: #0f172a;
  font-size: 0.68rem;
  font-weight: 750;
  padding: 3px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

:root[data-theme="dark"] .m-act-rating-pill {
  background: rgba(15, 23, 42, 0.9);
  color: #fde68a;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.m-act-content-box {
  display: flex;
  flex-direction: column;
}

.m-act-name {
  font-size: 0.98rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 3px;
  line-height: 1.35;
}

:root[data-theme="dark"] .m-act-name {
  color: #f8fafc;
}

.m-act-address {
  font-size: 0.72rem;
  color: #64748b;
  margin: 0 0 8px;
  line-height: 1.3;
}

:root[data-theme="dark"] .m-act-address {
  color: #94a3b8;
}

.m-pin-icon {
  font-size: 0.75rem;
}

.m-act-description {
  font-size: 0.77rem;
  color: #334155;
  line-height: 1.48;
  margin: 0 0 10px;
}

:root[data-theme="dark"] .m-act-description {
  color: #cbd5e1;
}

.m-act-dishes-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fefce8;
  border: 1px dashed #facc15;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 0.72rem;
  color: #854d0e;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

:root[data-theme="dark"] .m-act-dishes-row {
  background: rgba(234, 179, 8, 0.1);
  border-color: rgba(234, 179, 8, 0.3);
  color: #fde047;
}

.mad-icon {
  font-size: 0.85rem;
}

.m-act-meta-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.m-meta-pill {
  font-size: 0.66rem;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px 7px;
}

:root[data-theme="dark"] .m-meta-pill {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.m-act-action-row {
  display: flex;
  gap: 8px;
}

.btn-act-direction {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #059669;
  color: #ffffff;
  border-radius: 12px;
  padding: 9px 14px;
  font-size: 0.76rem;
  font-weight: 750;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
  transition: transform 0.15s ease, background 0.2s ease;
}

.btn-act-direction:active {
  transform: scale(0.97);
  background: #047857;
}

/* CHỈ BÁO DI CHUYỂN GIỮA CÁC ĐIỂM (TRANSIT STEP) */
.m-travel-step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0;
}

.mts-line {
  flex: 1;
  height: 1px;
  background: #cbd5e1;
}

:root[data-theme="dark"] .mts-line {
  background: rgba(255, 255, 255, 0.1);
}

.mts-pill {
  font-size: 0.65rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #86efac;
  border-radius: 999px;
  padding: 3px 10px;
}

:root[data-theme="dark"] .mts-pill {
  background: rgba(6, 78, 59, 0.4);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

/* CHẶNG NGHỈ ĐÊM TẠI KHÁCH SẠN */
.m-day-finish-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 14px;
  padding: 10px 14px;
  margin-top: 14px;
}

:root[data-theme="dark"] .m-day-finish-box {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.25);
}

.m-df-icon {
  font-size: 1.3rem;
}

.m-df-text {
  display: flex;
  flex-direction: column;
  font-size: 0.72rem;
  color: #581c87;
}

:root[data-theme="dark"] .m-df-text {
  color: #e9d5ff;
}

.m-df-text strong {
  font-size: 0.76rem;
  margin-bottom: 2px;
}

.m-df-text p {
  margin: 0;
  opacity: 0.85;
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

/* OVER BUDGET BANNER */
.mobile-over-budget-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

:root[data-theme="dark"] .mobile-over-budget-banner {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.35);
}

.mob-icon {
  font-size: 1.2rem;
}

.mob-text strong {
  display: block;
  font-size: 0.72rem;
  color: #dc2626;
  font-weight: 800;
  margin-bottom: 2px;
}

:root[data-theme="dark"] .mob-text strong {
  color: #f87171;
}

.mob-text p {
  margin: 0;
  font-size: 0.68rem;
  color: #475569;
  line-height: 1.35;
}

:root[data-theme="dark"] .mob-text p {
  color: #cbd5e1;
}

.full-width-item {
  grid-column: 1 / -1;
}

/* UNFEASIBLE WARNING BOX IN GUIDANCE MODAL */
.m-unfeasible-warning {
  margin-top: 8px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:root[data-theme="dark"] .m-unfeasible-warning {
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.3);
}

.muw-text strong {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: #e11d48;
  margin-bottom: 2px;
}

:root[data-theme="dark"] .muw-text strong {
  color: #fb7185;
}

.muw-text p {
  margin: 0;
  font-size: 0.68rem;
  color: #475569;
  line-height: 1.35;
}

:root[data-theme="dark"] .muw-text p {
  color: #cbd5e1;
}

.btn-auto-fix-budget {
  background: #e11d48;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
  transition: transform 0.15s ease;
}

.btn-auto-fix-budget:active {
  transform: scale(0.97);
}

/* FREE MODE TOGGLE */
.guidance-free-mode-toggle {
  background: #f0fdf4;
  border: 1px dashed #86efac;
  border-radius: 10px;
  padding: 10px 12px;
}

:root[data-theme="dark"] .guidance-free-mode-toggle {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.25);
}

.g-free-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.72rem;
  color: #166534;
  cursor: pointer;
  line-height: 1.4;
}

:root[data-theme="dark"] .g-free-checkbox-label {
  color: #86efac;
}

.g-free-checkbox {
  margin-top: 2px;
  accent-color: #059669;
  cursor: pointer;
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

/* NÚT BẮT ĐẦU LỊCH TRÌNH MOBILE */
.btn-start-mobile-tour {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 18px;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #06b6d4 100%);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  margin-bottom: 8px;
}
.btn-start-mobile-tour:active {
  transform: scale(0.97);
}

.trip-start-fast-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);
  transition: transform 0.15s ease;
}
.trip-start-fast-btn:active {
  transform: scale(0.95);
}
</style>
