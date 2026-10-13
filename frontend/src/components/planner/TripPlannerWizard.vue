<template>
  <div class="trip-planner-wizard">
          <!-- Banner ảnh collage Miền Trung (Chỉ hiện khi chưa tạo lịch trình) -->
          <div class="planner-hero-banner" v-if="currentPlannerStep === 1">
            <img
              src="/images/mientrung-collage.jpg"
              alt="Hành trình Miền Trung - Di sản & Biển xanh"
              class="planner-hero-banner-img"
            />
          </div>

          <!-- BƯỚC NHẬP THÔNG TIN KẾ HOẠCH (Chỉ hiện khi chưa tạo lịch trình - Yêu cầu 4) -->
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

            <!-- Tiến trình Wizard (Có thể bấm để quay lại các bước trước) -->
            <div class="wizard-progress">
              <button
                type="button"
                :class="['step-indicator', { active: currentPlannerStep >= 1, clickable: currentPlannerStep > 1 }]"
                @click="goToStep(1)"
                title="Quay lại Bước 1: Điểm đến"
              >
                1. Điểm đến
              </button>
              <div class="step-divider"></div>
              <button
                type="button"
                :class="['step-indicator', { active: currentPlannerStep >= 2, clickable: currentPlannerStep > 2 }]"
                @click="goToStep(2)"
                title="Quay lại Bước 2: Tài chính & Địa điểm"
              >
                2. Tài chính & Địa điểm
              </button>
              <div class="step-divider"></div>
              <div :class="['step-indicator', { active: currentPlannerStep >= 3 }]">
                3. Di chuyển & Lưu trú
              </div>
            </div>

            <!-- BƯỚC 1: ĐIỂM ĐẾN & THỜI GIAN -->
            <div v-show="currentPlannerStep === 1" class="app-form-grid wizard-step-content">
              <!-- CHỌN ĐIỂM BẮT ĐẦU (KHỞI HÀNH) - 2 OPTIONS SLIDER -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <div class="field-label-main">
                    <label><AppIcon name="pin" :size="15" /> Điểm bắt đầu (Khởi hành)</label>
                  </div>
                  <span class="route-origin-tag" v-if="formDuLieu.diemKhoiHanh">Xuất phát: <b>{{ formDuLieu.diemKhoiHanh }}</b></span>
                </div>

                <!-- SLIDER CHUYỂN ĐỔI 2 OPTIONS (THỦ CÔNG HOẶC VỊ TRÍ HIỆN TẠI) -->
                <div class="origin-mode-wrapper">
                  <div
                    class="radio-group origin-mode-group"
                    :class="{ 'is-manual': originMethod === 'manual', 'is-gps': originMethod === 'gps' }"
                  >
                    <div class="slider"></div>
                    <div class="radio-option">
                      <input
                        type="radio"
                        name="originOption"
                        id="origin-opt-manual"
                        :checked="originMethod === 'manual'"
                        @click="chonPhuongThucOrigin('manual')"
                      />
                      <label for="origin-opt-manual" class="radio-label">
                        <AppIcon name="landmark" :size="15" class="mode-icon" />
                        <span>Chọn tỉnh thành xã thủ công</span>
                      </label>
                    </div>
                    <div class="radio-option">
                      <input
                        type="radio"
                        name="originOption"
                        id="origin-opt-gps"
                        :checked="originMethod === 'gps'"
                        @click="chonPhuongThucOrigin('gps')"
                      />
                      <label for="origin-opt-gps" class="radio-label">
                        <span v-if="isLocatingOrigin" class="gps-spinner" aria-hidden="true"></span>
                        <AppIcon v-else name="compass" :size="15" class="mode-icon" />
                        <span>{{ isLocatingOrigin ? 'Đang định vị GPS...' : 'Xác nhận vị trí hiện tại' }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- BỘ CHỌN XÃ / PHƯỜNG / QUẬN / HUYỆN THỦ CÔNG -->
                <transition name="expand-fade">
                  <div v-if="originMethod === 'manual' && showManualWardPicker" class="manual-ward-picker-card">
                    <div class="mwp-header">
                      <div class="mwp-title">
                        <AppIcon name="landmark" :size="15" />
                        <span>Lựa chọn đơn vị hành chính chi tiết</span>
                      </div>
                      <small class="mwp-sub">Chọn Tỉnh/Thành ➔ Quận/Huyện ➔ Phường/Xã cho điểm khởi hành</small>
                    </div>

                    <div class="mwp-grid">
                      <!-- 1. TỈNH / THÀNH PHỐ -->
                      <div class="mwp-field">
                        <label class="mwp-label">1. Tỉnh / Thành phố *</label>
                        <select
                          v-model="provinceCodeModel"
                          class="mwp-select"
                          @change="onManualProvinceChange"
                        >
                          <option :value="null">-- Chọn Tỉnh / Thành --</option>
                          <option
                            v-for="p in manualProvincesList"
                            :key="p.code"
                            :value="p.code"
                          >
                            {{ p.name }}
                          </option>
                        </select>
                      </div>

                      <!-- 2. QUẬN / HUYỆN / THỊ XÃ -->
                      <div class="mwp-field">
                        <label class="mwp-label">2. Quận / Huyện / Thị xã *</label>
                        <select
                          v-model="districtCodeModel"
                          class="mwp-select"
                          :disabled="!selectedManualProvinceCode || loadingDistricts"
                          @change="onManualDistrictChange"
                        >
                          <option :value="null">{{ loadingDistricts ? 'Đang tải...' : '-- Chọn Quận / Huyện --' }}</option>
                          <option
                            v-for="d in manualDistrictsList"
                            :key="d.code"
                            :value="d.code"
                          >
                            {{ d.name }}
                          </option>
                        </select>
                      </div>

                      <!-- 3. PHƯỜNG / XÃ / THỊ TRẤN -->
                      <div class="mwp-field">
                        <label class="mwp-label">3. Phường / Xã / Thị trấn *</label>
                        <select
                          v-model="wardCodeModel"
                          class="mwp-select"
                          :disabled="!selectedManualDistrictCode || loadingWards"
                          @change="onManualWardChange"
                        >
                          <option :value="null">{{ loadingWards ? 'Đang tải...' : '-- Chọn Phường / Xã --' }}</option>
                          <option
                            v-for="w in manualWardsList"
                            :key="w.code"
                            :value="w.code"
                          >
                            {{ w.name }}
                          </option>
                        </select>
                      </div>

                      <!-- 4. SỐ NHÀ, TÊN ĐƯỜNG (TÙY CHỌN) -->
                      <div class="mwp-field">
                        <label class="mwp-label">4. Số nhà, tên đường (tùy chọn)</label>
                        <input
                          v-model="streetAddressModel"
                          class="mwp-input"
                          placeholder="Ví dụ: 120 Nguyễn Văn Linh..."
                        />
                      </div>
                    </div>

                    <!-- DÒNG PREVIEW VÀ NÚT ÁP DỤNG -->
                    <div class="mwp-footer">
                      <div class="mwp-preview-box" v-if="manualComputedAddress">
                        <span class="mwp-preview-tag">Địa chỉ hoàn chỉnh:</span>
                        <strong class="mwp-preview-val">{{ manualComputedAddress }}</strong>
                      </div>
                      <div class="mwp-action-btns">
                        <button
                          type="button"
                          class="mwp-apply-btn"
                          :disabled="!selectedManualProvinceCode"
                          @click="apDungDiaChiThuCong"
                        >
                          ✓ Áp dụng địa chỉ này
                        </button>
                        <button
                          type="button"
                          class="mwp-close-btn"
                          @click="$emit('update:showManualWardPicker', false)"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Chọn Thành phố với cự ly inline đồng bộ Glassmorphic Segmented Slider -->
              <div class="app-field full-width">
                <div class="city-field-header">
                  <label class="field-label-text">Điểm đến du lịch</label>
                  <span class="route-origin-indicator">
                    <span class="roi-dot"></span>
                    Từ: <strong>{{ formDuLieu.diemKhoiHanh || 'Hà Nội' }}</strong>
                  </span>
                </div>

                <div class="radio-group city-radio-group" ref="citySelectorRef">
                  <div class="slider" :style="sliderStyle"></div>
                  <div
                    v-for="(c, idx) in visibleCities"
                    :key="c.name"
                    :class="['radio-option', 'city-radio-option', { active: formDuLieu.diemDen === c.name }]"
                    :ref="el => setCityOptionRef(el, c.name)"
                  >
                    <input
                      type="radio"
                      name="destinationCityRadio"
                      :id="'city-opt-' + idx"
                      :value="c.name"
                      :checked="formDuLieu.diemDen === c.name"
                      @change="handleSelectCity(c.name)"
                    />
                    <label
                      :for="'city-opt-' + idx"
                      class="radio-label city-radio-label"
                      @click="handleSelectCity(c.name)"
                    >
                      <span class="city-name-text">{{ c.name }}</span>
                      <span class="city-km-pill">
                        <span class="city-km-dot"></span>{{ getCityDistanceKm(c.name) }}km
                      </span>
                    </label>
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
                      <small class="dsb-subtitle">Chọn ngày bắt đầu, số ngày đi và số lượng thành viên</small>
                    </div>
                  </div>
                  <span class="dsb-duration-tag" v-if="formDuLieu.soNgay > 0 && formDuLieu.soNguoi > 0">Trọn vẹn {{ formDuLieu.soNgay }} ngày {{ formDuLieu.soDem }} đêm • {{ formDuLieu.soNguoi }} người</span>
                  <span class="dsb-duration-tag" v-else>Chưa chọn thời gian & số người</span>
                </div>

                <!-- Khối thống nhất 5 thông số: Ngày đi, Số ngày, Số đêm, Số người, Ngày về (Yêu cầu 5) -->
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
                      <button type="button" @click="giamSoNgay" :disabled="formDuLieu.soNgay <= 0">-</button>
                      <span class="dsb-stepper-val">{{ formDuLieu.soNgay }} ngày</span>
                      <button type="button" @click="tangSoNgay">+</button>
                    </div>
                  </div>

                  <div class="dsb-ctrl-field">
                    <label><AppIcon name="moon" :size="15" /> Số đêm ở lại:</label>
                    <div class="stepper-input dsb-stepper">
                      <button type="button" @click="giamSoDem" :disabled="formDuLieu.soDem <= minSoDem">-</button>
                      <span class="dsb-stepper-val">{{ formDuLieu.soDem }} đêm</span>
                      <button type="button" @click="tangSoDem" :disabled="formDuLieu.soDem >= maxSoDem">+</button>
                    </div>
                  </div>

                  <div class="dsb-ctrl-field">
                    <label><AppIcon name="users" :size="15" /> Số người tham gia:</label>
                    <div class="stepper-input dsb-stepper">
                      <button type="button" @click="formDuLieu.soNguoi = Math.max(0, formDuLieu.soNguoi - 1)">-</button>
                      <span class="dsb-stepper-val">{{ formDuLieu.soNguoi }} người</span>
                      <button type="button" @click="formDuLieu.soNguoi++">+</button>
                    </div>
                  </div>

                  <div class="dsb-ctrl-field">
                    <label><AppIcon name="planelanding" :size="15" /> Ngày về (Tự động):</label>
                    <input
                      type="date"
                      :value="formDuLieu.soNgay > 0 ? (formDuLieu.ngayKetThuc || ngayKetThucDisplay) : ''"
                      class="app-input departure-date-input disabled-input"
                      readonly
                    />
                  </div>
                </div>

                <!-- Tóm tắt lịch trình chi tiết -->
                <div class="trip-date-summary-banner" v-if="formDuLieu.ngayBatDau && formDuLieu.soNgay > 0">
                  <span class="tdsb-icon"><AppIcon name="sparkles" :size="16" /></span>
                  <div class="tdsb-text">
                    Lịch trình: <b>{{ dinhDangNgayTuan(formDuLieu.ngayBatDau) }}</b>
                    ➔ <b>{{ dinhDangNgayTuan(formDuLieu.ngayKetThuc || ngayKetThucDisplay) }}</b>
                    <span>({{ formDuLieu.soNgay }} ngày {{ formDuLieu.soDem }} đêm • {{ formDuLieu.soNguoi }} khách tại {{ formDuLieu.diemDen }})</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- BƯỚC 2: TÀI CHÍNH & DI CHUYỂN -->
            <div v-show="currentPlannerStep === 2" class="app-form-grid wizard-step-content">
              <!-- KHUNG NGÂN SÁCH THỐNG NHẤT (TỪ THANH CHỌN ĐẾN THÔNG TIN CHI PHÍ TIẾT KIỆM TỐI ƯU - TRẢI NGHIỆM XA HOA) -->
              <div class="unified-budget-card full-width">
                <div class="field-label-between">
                  <label class="budget-section-label">
                    <AppIcon name="wallet" :size="17" /> Ngân sách dự kiến (VND)
                  </label>
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

              <!-- BỘ CHỌN ĐỊA ĐIỂM & ĐẶC SẢN NỔI TIẾNG THEO THÀNH PHỐ (ĐƯA VÀO BƯỚC 2 THEO YÊU CẦU 2 - FULL WIDTH) -->
              <div class="places-picker-box full-width" style="margin-top: 16px;">
                <div class="picker-top">
                  <div>
                    <small class="picker-kicker">GỢI Ý ĐỊA PHƯƠNG — BẤM ĐỂ CHỌN ĐIỂM YÊU THÍCH</small>
                    <h4>Bạn muốn ghé địa danh & quán ngon nào tại {{ formDuLieu.diemDen }}?</h4>
                  </div>
                  <span v-if="selectedPlaces.length" class="badge-selected-count">
                    <AppIcon name="check" size="14" /> Đã chọn {{ selectedPlaces.length }} điểm
                  </span>
                </div>

                <!-- THANH TÌM KIẾM ĐỊA ĐIỂM & MÓN ĂN NHANH (TỐI GIẢN GIAO DIỆN) -->
                <div class="place-picker-search-bar">
                  <span class="pps-icon"><AppIcon name="search" size="16" /></span>
                  <input
                    v-model="placeSearchQueryModel"
                    type="text"
                    :placeholder="'Tìm kiếm địa điểm, di tích, món ăn, cafe tại ' + (formDuLieu.diemDen === ALL_DESTINATIONS ? 'Miền Trung' : formDuLieu.diemDen) + '...'"
                    class="pps-input"
                  />
                  <button
                    v-if="searchPlacePickerQuery"
                    type="button"
                    class="pps-clear-btn"
                    @click="placeSearchQueryModel = ''"
                    title="Xóa tìm kiếm"
                  ><AppIcon name="x" size="14" /></button>
                </div>

                <!-- CÁC TAB PHÂN LOẠI DANH MỤC GỌN GÀNG (LOẠI BỎ KHÁCH SẠN VÌ ĐÃ CÓ BƯỚC 3 CHUYÊN BIỆT) -->
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
                  <button type="button" class="app-secondary-btn" @click="placeSearchQueryModel = ''">Xóa tìm kiếm</button>
                </div>
                
                <!-- Tự nhập điểm đến -->
                <div class="custom-place-input-row" style="margin-top: 16px;">
                  <span class="row-label">Thêm địa điểm / quán khác (Tự nhập):</span>
                  <div style="display:flex; gap:8px;">
                    <input type="text" v-model="customPlaceTextModel" placeholder="Nhập tên địa điểm bạn muốn đi..." class="enhanced-input" style="flex:1; padding:10px 14px;" @keyup.enter="addCustomPlace" />
                    <button class="app-primary-btn" @click="addCustomPlace" type="button" style="padding: 10px 20px; font-size:13px; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;"><AppIcon name="plus" size="14" /> Thêm</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- BƯỚC 3: DI CHUYỂN VÀ LƯU TRÚ (PHƯƠNG TIỆN & VÉ XE SONG SONG VỚI KHÁCH SẠN) -->
            <div v-show="currentPlannerStep === 3" class="wizard-step-content step3-container">
              <!-- THANH CHUYỂN TÙY CHỌN SONG SONG: DI CHUYỂN VS LƯU TRÚ (YÊU CẦU 3) -->
              <div class="step3-subtabs-nav">
                <button
                  type="button"
                  :class="['step3-subtab-btn', { active: step3ActiveSubtab === 'transit' }]"
                  @click="step3ActiveSubtab = 'transit'"
                >
                  <span class="ssb-icon-wrap"><AppIcon name="bus" :size="18" /></span>
                  <div class="ssb-text">
                    <strong>1. Phương tiện & Vé di chuyển</strong>
                    <small>
                      {{ formDuLieu.tuTucPhuongTien ? 'Tự túc phương tiện (0đ)' : (formDuLieu.nhaXeDaChon ? (formDuLieu.nhaXeDaChon.name + (formDuLieu.gioXuatPhatChon ? ' (' + formDuLieu.gioXuatPhatChon + ')' : '')) : (formDuLieu.tauDaChon ? formDuLieu.tauDaChon.name : 'Xe khách, tàu hỏa, máy bay')) }}
                    </small>
                  </div>
                  <span v-if="daXongPhuongTien" class="ssb-check-badge">
                    <AppIcon name="check" :size="12" />
                  </span>
                </button>

                <button
                  type="button"
                  :class="['step3-subtab-btn', { active: step3ActiveSubtab === 'hotel' }]"
                  @click="step3ActiveSubtab = 'hotel'"
                >
                  <span class="ssb-icon-wrap"><AppIcon name="hotel" :size="18" /></span>
                  <div class="ssb-text">
                    <strong>2. Khách sạn & Phòng nghỉ</strong>
                    <small>
                      {{ formDuLieu.tuTucKhachSan ? 'Tự túc nơi ở (0đ)' : (formDuLieu.khachSanDaChon ? (formDuLieu.khachSanDaChon.name + (formDuLieu.phongDaChon ? ' (' + formDuLieu.phongDaChon.name + ')' : '')) : 'Chọn khách sạn & xem phòng') }}
                    </small>
                  </div>
                  <span v-if="daXongKhachSan" class="ssb-check-badge">
                    <AppIcon name="check" :size="12" />
                  </span>
                </button>
              </div>

              <!-- PHẦN 1: PHƯƠNG TIỆN & VÉ XE (GIAO DIỆN HÌNH 2 + ĐẦY ĐỦ OPTION GIỜ & ĐIỂM ĐÓN THẢ) -->
              <div v-show="step3ActiveSubtab === 'transit'" class="transit-subtab-pane">
                <!-- THÔNG BÁO BẮT BUỘC: BƯỚC 1 CHỌN PHƯƠNG TIỆN (YÊU CẦU 4) -->
                <div class="step3-mandatory-notice transit-notice">
                  <div class="smn-icon"><AppIcon name="bus" :size="20" /></div>
                  <div class="smn-text">
                    <strong>LƯU Ý BẮT BUỘC: BƯỚC 1 - LỰA CHỌN PHƯƠNG TIỆN HOẶC VÉ XE</strong>
                    <p>Vui lòng chọn vé xe/tàu xuất phát bên dưới, hoặc tích chọn <b>"Tự túc phương tiện đến"</b> nếu bạn đi xe máy hoặc tự túc vé. Sau khi chọn, hệ thống sẽ tự động chuyển sang bước chọn Khách sạn.</p>
                  </div>
                </div>
                <div class="bus-optimization-section full-width" style="margin-top: 0;">
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
                      @click="transitTab = 'bus'; formDuLieu.phuongTien = 'xe khách'"
                    >
                      <AppIcon name="bus" :size="15" /> Vé Xe Khách Giá Rẻ ({{ transitRouteInfo.operators?.length || 0 }})
                    </button>
                    <button
                      type="button"
                      :class="['transit-subtab-btn', { active: transitTab === 'train' }]"
                      @click="transitTab = 'train'; formDuLieu.phuongTien = 'tàu hỏa'"
                    >
                      <AppIcon name="train" :size="15" /> Vé Tàu Hỏa Thống Nhất ({{ transitRouteInfo.trains?.length || 3 }})
                    </button>
                  </div>

                  <!-- TAB 1: Danh sách gợi ý nhà xe giá rẻ (Hình 2) -->
                  <div v-show="transitTab === 'bus'" class="bus-operators-box">
                    <div class="bob-title-row">
                      <h4>Top nhà xe giá rẻ & uy tín khuyên dùng</h4>
                      <small>Bấm vào khung giờ xuất bến mong muốn hoặc bấm "Chọn xe này" để đưa vào lịch trình</small>
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
                          <!-- GIỜ XUẤT BẾN ĐẦY ĐỦ OPTION BẤM CHỌN TRỰC TIẾP (YÊU CẦU 2) -->
                          <div class="bic-spec-times">
                            <span class="bst-label"><AppIcon name="clock" :size="13" /> Chọn giờ xuất bến:</span>
                            <div class="bst-chips">
                              <button
                                type="button"
                                v-for="timeStr in (bus.depart_times ? bus.depart_times.split(',') : [])"
                                :key="timeStr"
                                :class="['bst-chip', { active: formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id && formDuLieu.gioXuatPhatChon === timeStr.trim() }]"
                                @click="chonGioXuatPhatBus(bus, timeStr.trim())"
                                :title="'Chọn chuyến lúc ' + timeStr.trim()"
                              >
                                {{ timeStr.trim() }}
                              </button>
                            </div>
                          </div>
                          <!-- ĐIỂM ĐÓN THẢ ĐẦY ĐỦ VÀ RÕ RÀNG (YÊU CẦU 2) -->
                          <div class="bic-spec bic-spec-points">
                            <div class="bsp-item">
                              <span class="bsp-label"><AppIcon name="pin" :size="13" /> Điểm đón:</span>
                              <span class="bsp-val" :title="bus.pickup">{{ bus.pickup }}</span>
                            </div>
                            <div class="bsp-item">
                              <span class="bsp-label"><AppIcon name="flag" :size="13" /> Điểm trả:</span>
                              <span class="bsp-val" :title="bus.dropoff">{{ bus.dropoff }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="bic-footer-clean">
                          <!-- Giá vé niêm yết & Tổng chi phí đoàn -->
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

                          <!-- Hai nút hành động gọi điện & chọn xe -->
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
                              {{ formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id ? (formDuLieu.gioXuatPhatChon ? 'Đã chọn (' + formDuLieu.gioXuatPhatChon + ')' : 'Đã chọn xe') : 'Chọn xe này' }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TAB 2: Danh sách vé tàu hỏa Thống Nhất -->
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
                            <span class="bst-label"><AppIcon name="clock" :size="13" /> Chọn giờ xuất phát:</span>
                            <div class="bst-chips">
                              <button
                                type="button"
                                v-for="timeStr in (train.depart_times ? train.depart_times.split(',') : [])"
                                :key="timeStr"
                                :class="['bst-chip train-time-chip', { active: formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id && formDuLieu.gioXuatPhatChon === timeStr.trim() }]"
                                @click="chonGioXuatPhatTau(train, timeStr.trim())"
                              >
                                {{ timeStr.trim() }}
                              </button>
                            </div>
                          </div>
                          <div class="bic-spec bic-spec-points">
                            <div class="bsp-item">
                              <span class="bsp-label"><AppIcon name="train" :size="13" /> Ga đi:</span>
                              <span class="bsp-val">{{ train.depart_station }}</span>
                            </div>
                            <div class="bsp-item">
                              <span class="bsp-label"><AppIcon name="flag" :size="13" /> Ga đến:</span>
                              <span class="bsp-val">{{ train.arrive_station }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="bic-footer-clean">
                          <!-- Giá vé tàu -->
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

                          <!-- Hai nút hành động đặt vé và chọn tàu -->
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
                              {{ formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id ? (formDuLieu.gioXuatPhatChon ? 'Đã chọn (' + formDuLieu.gioXuatPhatChon + ')' : 'Đã chọn tàu') : 'Chọn tàu này' }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- GỢI Ý TỐI ƯU HÀNH TRÌNH HOÀN HẢO NẾU CHƯA CÓ VÉ PHÙ HỢP (YÊU CẦU 2) -->
                  <div class="transit-smart-fallback-card">
                    <div class="tsf-header">
                      <span class="tsf-icon"><AppIcon name="sparkles" :size="18" /></span>
                      <div>
                        <strong>Gợi ý tối ưu hành trình thông minh: Tuyến {{ formDuLieu.diemKhoiHanh }} ➔ {{ formDuLieu.diemDen }}</strong>
                        <small>Nếu các nhà xe trên chưa khớp với khung giờ của bạn, AI đề xuất 3 giải pháp di chuyển tối ưu:</small>
                      </div>
                    </div>
                    <div class="tsf-options-grid">
                      <div class="tsf-option-card">
                        <div class="toc-badge"><AppIcon name="plane" :size="13" /> Máy bay nội địa</div>
                        <h4>Tiết kiệm tối đa thời gian</h4>
                        <p>Bay thẳng đến Sân bay Quốc tế Đà Nẵng / Cam Ranh / Phú Bài chỉ mất 1h15 - 1h30 bay. Bảo toàn 100% thể lực cho ngày đầu tiên!</p>
                      </div>
                      <div class="tsf-option-card">
                        <div class="toc-badge"><AppIcon name="train" :size="13" /> Tàu hỏa Thống Nhất</div>
                        <h4>Ngắm trọn cung đường di sản</h4>
                        <p>Lựa chọn tàu giường nằm SE1/SE3 khởi hành tối, đến nơi vào sáng hôm sau. Ngắm cảnh đèo Hải Vân và biển Lăng Cô ngoạn mục.</p>
                      </div>
                      <div class="tsf-option-card">
                        <div class="toc-badge"><AppIcon name="bike" :size="13" /> Tự túc xe máy / ô tô</div>
                        <h4>Chủ động 100% thời gian</h4>
                        <p>Tự do dừng chân check-in các cung đường ven biển, tiết kiệm toàn bộ chi phí vé xe liên tỉnh cho đoàn.</p>
                      </div>
                    </div>
                  </div>

                  <!-- TÙY CHỌN TỰ TÚC PHƯƠNG TIỆN ĐẾN -->
                  <div class="self-transit-card" :class="{ 'is-active': formDuLieu.tuTucPhuongTien }" style="margin-top: 16px;">
                    <label class="stc-label">
                      <input
                        type="checkbox"
                        :checked="formDuLieu.tuTucPhuongTien"
                        @change="toggleTuTucPhuongTien"
                        class="stc-checkbox"
                      />
                      <span class="stc-custom-indicator">
                        <AppIcon name="check" size="14" v-if="formDuLieu.tuTucPhuongTien" />
                      </span>
                      <div class="stc-content">
                        <div class="stc-title-row">
                          <strong><AppIcon name="bike" size="16" /> Tự túc phương tiện đến điểm hẹn</strong>
                          <span class="stc-badge" v-if="formDuLieu.tuTucPhuongTien">Không tính vé xe khứ hồi (0đ)</span>
                        </div>
                        <p class="stc-desc">
                          Tích chọn nếu bạn đi xe máy cá nhân hoặc đã tự đặt vé xe/máy bay từ trước. Hệ thống sẽ KHÔNG trừ tiền vé xe khách liên tỉnh vào ngân sách, dành trọn vẹn chi phí cho ăn uống và khách sạn!
                        </p>
                      </div>
                    </label>
                  </div>

                  <!-- THANH TIẾP TỤC SANG BƯỚC KHÁCH SẠN (YÊU CẦU 4) -->
                  <div class="transit-bottom-next-bar">
                    <div class="tbn-status">
                      <span v-if="formDuLieu.tuTucPhuongTien" class="tbn-badge self">✓ Đã chọn: Tự túc phương tiện (0đ vé)</span>
                      <span v-else-if="formDuLieu.nhaXeDaChon" class="tbn-badge bus">✓ Đã chọn xe: {{ formDuLieu.nhaXeDaChon.name }} ({{ formDuLieu.gioXuatPhatChon || 'chuyến đi' }})</span>
                      <span v-else-if="formDuLieu.tauDaChon" class="tbn-badge train">✓ Đã chọn tàu: {{ formDuLieu.tauDaChon.name }}</span>
                      <span v-else class="tbn-badge pending">Chưa chọn phương tiện hoặc vé xe</span>
                    </div>
                    <button
                      type="button"
                      class="tbn-btn-next"
                      @click="chuyenSangChonKhachSan"
                    >
                      {{ daXongPhuongTien ? 'Tiếp tục: Sang chọn Khách Sạn & Phòng nghỉ ➔' : 'Tự túc phương tiện & Sang chọn Khách Sạn ➔' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- PHẦN 2: CHỌN KHÁCH SẠN VÀ XEM PHÒNG (GIAO DIỆN HÌNH 3, 4, 5 - YÊU CẦU 3) -->
              <div v-show="step3ActiveSubtab === 'hotel'" class="hotel-subtab-pane">
                <!-- THÔNG BÁO BẮT BUỘC: BƯỚC 2 CHỌN KHÁCH SẠN HOẶC TỰ TÚC NƠI Ở (YÊU CẦU 4) -->
                <div class="step3-mandatory-notice hotel-notice">
                  <div class="smn-icon"><AppIcon name="hotel" :size="20" /></div>
                  <div class="smn-text">
                    <strong>BƯỚC 2: CHỌN KHÁCH SẠN LƯU TRÚ HOẶC TỰ TÚC NƠI Ở</strong>
                    <p>Chọn 1 khách sạn bên dưới để xem phòng và đặt phòng, hoặc tích chọn <b>"Tự túc nơi ở"</b> nếu bạn ở nhà người thân, homestay riêng hoặc cắm trại dã ngoại.</p>
                  </div>
                </div>

                <!-- TÙY CHỌN TỰ TÚC NƠI Ở / KHÁCH SẠN (YÊU CẦU 4) -->
                <div class="self-transit-card self-hotel-card" :class="{ 'is-active': formDuLieu.tuTucKhachSan }" style="margin-bottom: 20px;">
                  <label class="stc-label">
                    <input
                      type="checkbox"
                      :checked="formDuLieu.tuTucKhachSan"
                      @change="toggleTuTucKhachSan"
                      class="stc-checkbox"
                    />
                    <span class="stc-custom-indicator">
                      <AppIcon name="check" size="14" v-if="formDuLieu.tuTucKhachSan" />
                    </span>
                    <div class="stc-content">
                      <div class="stc-title-row">
                        <strong><AppIcon name="home" size="16" /> Tự túc nơi ở / Đã có chỗ nghỉ riêng</strong>
                        <span class="stc-badge" v-if="formDuLieu.tuTucKhachSan">Không tính tiền phòng (0đ)</span>
                      </div>
                      <p class="stc-desc">
                        Tích chọn nếu bạn ở nhờ nhà người quen, homestay tự đặt trước hoặc cắm trại dã ngoại. Hệ thống sẽ KHÔNG trừ chi phí khách sạn vào ngân sách (0đ), dành trọn vẹn chi phí cho ăn uống và vé tham quan!
                      </p>
                    </div>
                  </label>
                </div>

                <!-- CẢNH BÁO TÀI CHÍNH NẾU TIỀN PHÒNG VƯỢT QUÁ NGÂN SÁCH + ĐỀ XUẤT NHIỀU PHƯƠNG ÁN (YÊU CẦU 3) -->
                <div v-if="hotelBudgetAlert && !formDuLieu.tuTucKhachSan" :class="['hotel-feasibility-alert', hotelBudgetAlert.type]">
                  <div class="hfa-top">
                    <span class="hfa-icon"><AppIcon name="alertcircle" :size="20" /></span>
                    <div class="hfa-text">
                      <strong>{{ hotelBudgetAlert.title }}</strong>
                      <p>{{ hotelBudgetAlert.message }}</p>
                    </div>
                  </div>
                  <div class="hfa-actions">
                    <button type="button" class="hfa-btn hfa-btn-upgrade" @click="apDungNangNganSachKhachSan">
                      <AppIcon name="sparkles" :size="14" /> Đề xuất 1: Nâng ngân sách lên {{ dinhDangTien(hotelBudgetAlert.suggestedBudget) }}đ
                    </button>
                    <button type="button" class="hfa-btn hfa-btn-cheaper" @click="chonPhongTietKiemHon">
                      <AppIcon name="hotel" :size="14" /> Đề xuất 2: Chọn phòng tiết kiệm hơn
                    </button>
                    <button type="button" v-if="formDuLieu.soDem > 1" class="hfa-btn hfa-btn-shorten" @click="giamSoDemKhachSan">
                      <AppIcon name="moon" :size="14" /> Đề xuất 3: Rút ngắn xuống {{ formDuLieu.soDem - 1 }} đêm
                    </button>
                  </div>
                </div>

                <!-- THẺ TỔNG KẾT KHÁCH SẠN & PHÒNG ĐÃ CHỌN -->
                <div v-if="formDuLieu.khachSanDaChon && !formDuLieu.tuTucKhachSan" class="selected-hotel-banner">
                  <div class="shb-left">
                    <img :src="formDuLieu.khachSanDaChon.image" class="shb-thumb" :alt="formDuLieu.khachSanDaChon.name" />
                    <div>
                      <span class="shb-badge">ĐÃ CHỌN LƯU TRÚ CHO LỊCH TRÌNH</span>
                      <h4 class="shb-name">{{ formDuLieu.khachSanDaChon.name }}</h4>
                      <p class="shb-room">
                        Phòng: <b>{{ formDuLieu.phongDaChon?.name || 'Tiêu chuẩn' }}</b>
                        <span class="shb-size-tag" v-if="formDuLieu.phongDaChon?.size">({{ formDuLieu.phongDaChon.size }})</span>
                      </p>
                      <p class="shb-meta"><AppIcon name="pin" :size="12" /> {{ formDuLieu.khachSanDaChon.address }}</p>
                    </div>
                  </div>
                  <div class="shb-right">
                    <div class="shb-price-box">
                      <span class="shb-rate">{{ dinhDangTien(formDuLieu.phongDaChon?.price || formDuLieu.khachSanDaChon.price_from) }}đ <small>/ đêm</small></span>
                      <small class="shb-total">Tổng {{ formDuLieu.soDem }} đêm ({{ soPhongCan }} phòng): <b>{{ dinhDangTien(tongChiPhiKhachSanChon) }}đ</b></small>
                    </div>
                    <div class="shb-btns">
                      <button type="button" class="shb-btn-change" @click="moModalXemPhong(formDuLieu.khachSanDaChon)">
                        <AppIcon name="eye" :size="14" /> Xem / Đổi phòng
                      </button>
                      <button type="button" class="shb-btn-clear" @click="huyChonKhachSan" title="Hủy lựa chọn khách sạn này">
                        <AppIcon name="x" :size="14" /> Bỏ chọn
                      </button>
                    </div>
                  </div>
                </div>

                <!-- DANH SÁCH KHÁCH SẠN HÀNG ĐẦU THEO ĐỊA ĐIỂM (GIAO DIỆN HÌNH 3 & YÊU CẦU 5) -->
                <div class="hotel-catalog-box">
                  <div class="hcb-header">
                    <div>
                      <span class="hcb-kicker"><AppIcon name="hotel" :size="15" /> CHỖ NGHỈ ĐỀ XUẤT</span>
                      <h3>Khách sạn & Khu nghỉ dưỡng tại {{ formDuLieu.diemDen }}</h3>
                    </div>
                    <span class="hcb-count">{{ filteredSortedHotels.length }} khách sạn phù hợp</span>
                  </div>

                  <!-- THANH SẮP XẾP GIÁ CẢ & SỐ SAO (YÊU CẦU 5) -->
                  <div class="hotel-sort-toolbar">
                    <div class="hst-group">
                      <span class="hst-label"><AppIcon name="sliders" :size="13" /> Sắp xếp:</span>
                      <button
                        type="button"
                        :class="['hst-btn', { active: hotelSortBy === 'default' }]"
                        @click="hotelSortBy = 'default'"
                      >
                        Khuyên dùng
                      </button>
                      <button
                        type="button"
                        :class="['hst-btn', { active: hotelSortBy === 'price_asc' }]"
                        @click="hotelSortBy = 'price_asc'"
                      >
                        Giá tăng dần ↑
                      </button>
                      <button
                        type="button"
                        :class="['hst-btn', { active: hotelSortBy === 'price_desc' }]"
                        @click="hotelSortBy = 'price_desc'"
                      >
                        Giá giảm dần ↓
                      </button>
                      <button
                        type="button"
                        :class="['hst-btn', { active: hotelSortBy === 'rating_desc' }]"
                        @click="hotelSortBy = 'rating_desc'"
                      >
                        Đánh giá cao ★
                      </button>
                    </div>

                    <div class="hst-group hst-stars-group">
                      <span class="hst-label">Hạng sao:</span>
                      <button
                        type="button"
                        :class="['hst-star-btn', { active: hotelStarFilter === 'all' }]"
                        @click="hotelStarFilter = 'all'"
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        :class="['hst-star-btn', { active: hotelStarFilter === '5' }]"
                        @click="hotelStarFilter = '5'"
                      >
                        5★
                      </button>
                      <button
                        type="button"
                        :class="['hst-star-btn', { active: hotelStarFilter === '4' }]"
                        @click="hotelStarFilter = '4'"
                      >
                        4★
                      </button>
                      <button
                        type="button"
                        :class="['hst-star-btn', { active: hotelStarFilter === '3' }]"
                        @click="hotelStarFilter = '3'"
                      >
                        3★
                      </button>
                    </div>
                  </div>

                  <!-- GRID KHÁCH SẠN VỚI NÚT "XEM PHÒNG" MÀU VÀNG (CHUẨN HÌNH 3) -->
                  <div class="hotel-catalog-grid">
                    <div
                      v-for="hotel in displayedHotels"
                      :key="hotel.id"
                      :class="['hotel-catalog-card', { active: formDuLieu.khachSanDaChon?.id === hotel.id && !formDuLieu.tuTucKhachSan }]"
                      @click="moModalXemPhong(hotel)"
                      role="button"
                      tabindex="0"
                    >
                      <div class="hcc-image-wrap">
                        <img :src="hotel.image" :alt="hotel.name" class="hcc-image" loading="lazy" />
                        <span class="hcc-dest-badge">{{ hotel.destination }}</span>
                        <span v-if="formDuLieu.khachSanDaChon?.id === hotel.id && !formDuLieu.tuTucKhachSan" class="hcc-selected-tag">✓ Đang chọn</span>
                      </div>
                      <div class="hcc-content">
                        <h4 class="hcc-title">{{ hotel.name }}</h4>
                        <div class="hcc-stars">
                          <span v-for="s in Number(hotel.stars || 4)" :key="s" class="star-icon">★</span>
                          <small class="hcc-rating-num">({{ hotel.rating || '4.8' }} • {{ hotel.reviews_count || 120 }} đánh giá)</small>
                        </div>
                        <div class="hcc-bottom-row">
                          <div class="hcc-price-info">
                            <span class="hcc-price-label">Giá từ:</span>
                            <strong class="hcc-price-val">{{ dinhDangTien(hotel.price_from || hotel.price || 650000) }}đ <small>/ đêm</small></strong>
                          </div>
                          <!-- NÚT "XEM PHÒNG" MÀU VÀNG (HÌNH 3) -->
                          <button type="button" class="hcc-btn-view" @click.stop="moModalXemPhong(hotel)">
                            <AppIcon name="eye" :size="13" /> Xem phòng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- CHỨC NĂNG THU GỌN VÀ XEM THÊM KHÁCH SẠN (YÊU CẦU 5) -->
                  <div v-if="filteredSortedHotels.length > 4" class="hotel-pagination-actions">
                    <button
                      v-if="hotelDisplayLimit < filteredSortedHotels.length"
                      type="button"
                      class="hpa-btn hpa-btn-more"
                      @click="xemThemKhachSan"
                    >
                      <AppIcon name="chevron-down" :size="15" /> Xem thêm (+{{ Math.min(8, filteredSortedHotels.length - hotelDisplayLimit) }} khách sạn)
                    </button>
                    <button
                      v-if="hotelDisplayLimit < filteredSortedHotels.length"
                      type="button"
                      class="hpa-btn hpa-btn-all"
                      @click="xemTatCaKhachSan"
                    >
                      Xem tất cả ({{ filteredSortedHotels.length }})
                    </button>
                    <button
                      v-if="hotelDisplayLimit >= filteredSortedHotels.length"
                      type="button"
                      class="hpa-btn hpa-btn-collapse"
                      @click="thuGonKhachSan"
                    >
                      <AppIcon name="chevron-up" :size="15" /> Thu gọn (chỉ hiện 4 khách sạn)
                    </button>
                  </div>
                </div>
              </div>

              <!-- KHỐI XÁC NHẬN SẴN SÀNG LÊN LỊCH TRÌNH (ĐẨY XUỐNG KHI HOÀN THÀNH VÉ XE & KHÁCH SẠN - YÊU CẦU 4) -->
              <div id="step3-ready-generate" class="step3-ready-box" :class="{ 'is-ready': daXongBuoc3 }">
                <div class="srb-header">
                  <div class="srb-icon-wrap">
                    <AppIcon :name="daXongBuoc3 ? 'check' : 'sparkles'" :size="24" />
                  </div>
                  <div class="srb-title-text">
                    <h4>{{ daXongBuoc3 ? '🎉 Đã hoàn tất lựa chọn Di chuyển & Lưu trú!' : 'Tiến trình chuẩn bị chuyến đi' }}</h4>
                    <p>{{ daXongBuoc3 ? 'Mọi thông tin phương tiện và nơi ở đã sẵn sàng. Hãy bấm nút Tạo Lịch Trình bên dưới để AI lên kế hoạch chi tiết!' : 'Vui lòng hoàn thành chọn Vé xe / Phương tiện và Khách sạn / Tự túc nơi ở.' }}</p>
                  </div>
                </div>

                <div class="srb-checklist-grid">
                  <div class="srb-item" :class="{ done: daXongPhuongTien }">
                    <span class="srb-item-indicator"><AppIcon :name="daXongPhuongTien ? 'check' : 'bus'" :size="15" /></span>
                    <div class="srb-item-info">
                      <small>1. Di chuyển:</small>
                      <strong>
                        {{ formDuLieu.tuTucPhuongTien ? 'Tự túc phương tiện (0đ)' : (formDuLieu.nhaXeDaChon ? (formDuLieu.nhaXeDaChon.name + (formDuLieu.gioXuatPhatChon ? ' - ' + formDuLieu.gioXuatPhatChon : '')) : (formDuLieu.tauDaChon ? formDuLieu.tauDaChon.name : 'Chưa chọn phương tiện')) }}
                      </strong>
                    </div>
                    <button v-if="!daXongPhuongTien" type="button" class="srb-btn-goto" @click="step3ActiveSubtab = 'transit'">Chọn ngay</button>
                  </div>

                  <div class="srb-item" :class="{ done: daXongKhachSan }">
                    <span class="srb-item-indicator"><AppIcon :name="daXongKhachSan ? 'check' : 'hotel'" :size="15" /></span>
                    <div class="srb-item-info">
                      <small>2. Lưu trú:</small>
                      <strong>
                        {{ formDuLieu.tuTucKhachSan ? 'Tự túc nơi ở (0đ)' : (formDuLieu.khachSanDaChon ? (formDuLieu.khachSanDaChon.name + (formDuLieu.phongDaChon ? ' (' + formDuLieu.phongDaChon.name + ')' : '')) : 'Chưa chọn khách sạn') }}
                      </strong>
                    </div>
                    <button v-if="!daXongKhachSan" type="button" class="srb-btn-goto" @click="step3ActiveSubtab = 'hotel'">Chọn ngay</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- LỖI KHI TẠO LỊCH TRÌNH -->
            <div v-if="taoPlanError" class="crawl-alert-banner" style="background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; margin-top:16px; font-weight:600; display:flex; align-items:center; gap:8px;">
              <AppIcon name="alert" size="18" /> {{ taoPlanError }}
            </div>

            <!-- WIZARD FOOTER NAVIGATION -->
            <div class="wizard-footer">
              <button 
                type="button"
                v-if="currentPlannerStep > 1" 
                @click="quayLaiWizard" 
                class="app-secondary-btn"
                :disabled="dangTao"
              >
                ← Quay lại
              </button>
              
              <!-- NÚT TIẾP THEO HIỆU ỨNG VŨ TRỤ (COSMIC SPACE NEXT BUTTON) -->
              <div
                v-if="currentPlannerStep < 3"
                class="btn-container space-next-container"
                :class="{ 'is-step-1': currentPlannerStep === 1 }"
              >
                <!-- SVG 1: Sao Thổ / Saturn -->
                <div class="svg svg-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <path fill="#1d1d1b" d="m56.62 28.46a20.57 20.57 0 0 0 -4.85-2.94s-1.18-3.35-2.4-5.85a16 16 0 0 0 -11-7.46c-5.31-.69-9.75-.94-16.13 2.15a22.19 22.19 0 0 0 -9.34 9.16 21.15 21.15 0 0 0 -6.19 3.12 5.68 5.68 0 0 0 .56 9.36 43.94 43.94 0 0 0 5.73 2.91 23.74 23.74 0 0 0 4.5 7.39c2.94 2.94 5.28 5.25 11.63 5.75s8 0 11.31-1.81a34.34 34.34 0 0 0 7.19-5.47 30 30 0 0 0 3.11-3.16c4.31-1.2 6.93-2.83 8.11-5.53 1.27-2.94.71-5.37-2.23-7.62zm-44 8c-.1 0-4.94-2-5.75-4.75s3.37-5.53 5.4-6.41a14.57 14.57 0 0 0 -.43 6.22c.5 3.31.84 5 .75 4.97zm42.28 1.12c-1.91 1.66-3.47 2.06-3.41 1.91a18.36 18.36 0 0 0 1.41-6.07 38.3 38.3 0 0 0 -.44-5.4s3.44 1.22 4.47 3.84-.12 4.06-2.03 5.72z"></path>
                    <path fill="#85bfe9" d="m16.84 22.46c-.37-.09-.85-.32-.38-.85a18.1 18.1 0 0 1 9-6.75 22.15 22.15 0 0 1 14.28-.28c2.28.69 5.41 2.34 5.25 2.59a1.29 1.29 0 0 1 -1.06.57c-.63.06-2.84-.38-4.78.43s-2.5 1.47-3.88 1.5a23.54 23.54 0 0 0 -6.47.54c-2.9.75-3.46 1.65-5.68 1.93a45 45 0 0 1 -6.28.32z"></path>
                    <path fill="#1d1d1b" d="m19.52 20.61a6.35 6.35 0 0 1 2.07-2.09 8.92 8.92 0 0 1 2.41-1.41c.16 0 .38.38.22.47a8.26 8.26 0 0 0 -2.37 1.75c-1 1.09-.78 1.56-1.22 1.63s-1.26-.19-1.11-.35z"></path>
                    <path fill="#cbe7f5" d="m15 24.33a7.44 7.44 0 0 1 2.88-.41c1.75 0 2.9.66 6.22-.37s4.06-1.81 5.75-1.84 3.34.5 5.9-.25 3.69-1.57 5.07-1.85 3.84-.22 4.34-.31 1.69-.41 1.87-.22a27.24 27.24 0 0 1 2.6 5.53c.94 2.75 1.06 3.66.87 4a10.63 10.63 0 0 1 -5.5 1.53c-2.78.1-4.46-1.75-9-1.59s-8.93.91-11.06.66-3.5-1.35-6.06-1.22a13.63 13.63 0 0 0 -3.91.43c-.87.29-1 .72-1.12.22s.33-3.53 1.15-4.31z"></path>
                    <g fill="#1d1d1b">
                      <path d="m44.77 20.71a7.38 7.38 0 0 1 2.72 1.4c-.09.19.07.44-.34.44a10.38 10.38 0 0 1 -2.72-1.16 1.13 1.13 0 0 1 .34-.68z"></path>
                      <path d="m43.81 22.64s4.25 1.94 4.25 2.22.18.47-.16.44a28.09 28.09 0 0 1 -4.5-1.94c-.06-.22.41-.72.41-.72z"></path>
                      <path d="m41.77 24.08c.16 0 5.54 2.63 5.5 2.88s.13.5-.18.46a46.82 46.82 0 0 1 -5.72-2.42c.03-.23.28-.92.4-.92z"></path>
                      <path d="m40.24 25.92c.1 0 4.32 1.94 4.22 2.13s-.06.34-.28.34a34.62 34.62 0 0 1 -4.34-1.65 2.24 2.24 0 0 1 .4-.82z"></path>
                    </g>
                    <path fill="#cbe7f5" d="m14.21 30.33c.14-.14.94-1.16 3.69-.72s4.25 1.78 7.31 1.22 9.63-.91 12.35-.34 2.06 1.56 6.53 1.37 6.5-1.5 6.72-1.19a12.74 12.74 0 0 1 -.16 5.47c-.56 2.88-.91 3.78-1.06 3.94a30.43 30.43 0 0 1 -5.85.94c-.4-.19-4.25-3.13-4.47-3.13s-.71.22-.59.44 4.32 2.67 4.06 2.84a37.54 37.54 0 0 1 -12 .19 84.18 84.18 0 0 1 -13.65-3.06 4.92 4.92 0 0 1 -2.09-.84 19.69 19.69 0 0 1 -1.25-4.79c-.23-1.75.25-2.09.46-2.34z"></path>
                    <path fill="#1d1d1b" d="m41.65 36.46a20.45 20.45 0 0 1 4.25 3.15c0 .25 0 .44-.22.41s-4.68-2.75-4.62-3.02.46-.48.59-.54z"></path>
                    <path fill="#1d1d1b" d="m43.06 35.49c0-.09.46-.44.75-.38a21.34 21.34 0 0 1 3.75 2.81c0 .29.06.57-.25.5a28.43 28.43 0 0 1 -4.25-2.93z"></path>
                    <path fill="#1d1d1b" d="m45.24 33.89c-.14-.1.16-.5.53-.43s2.57 1.28 2.5 1.56-.15.62-.34.62a31.51 31.51 0 0 1 -2.69-1.75z"></path>
                    <path fill="#85bfe9" d="m15.93 40.08c0-.28 7.59 2.56 12.59 2.94a82.14 82.14 0 0 0 13.48.22c4.66-.38 5.88-.66 5.88-.53a19.19 19.19 0 0 1 -8.1 6.37 27.15 27.15 0 0 1 -15.22.22c-3.75-1.25-6.62-5.56-7-6.13a19.42 19.42 0 0 1 -1.63-3.09z"></path>
                    <path fill="#1d1d1b" d="m20.71 43.49c.29-.29 1.06.65 1.75.59s1.66-.25 2 .06.66.66 1.25.6 2.22-.72 2.5-.57.5.13.32.32a5.31 5.31 0 0 1 -2.72 1.09c-1.1 0-1.94-.87-2.38-.81a5.12 5.12 0 0 1 -1.81.12c-.75-.12-1.16-1.15-.91-1.4z"></path>
                    <path fill="#1d1d1b" d="m28.52 47.33a20 20 0 0 0 3.66.84 4.25 4.25 0 0 0 1.82-.17c.25-.1 1.07-.32 1.19-.16s.28.22.13.41a2.69 2.69 0 0 1 -1.5.56c-.72.06-2.75 0-3.63 0s-1 .12-1.47-.16-.6-1.23-.2-1.32z"></path>
                    <path fill="#1d1d1b" d="m37.27 45.92c.2-.11 1.32-.53 1.54-.34s.59.31.21.53a4.14 4.14 0 0 1 -1.46.53c-.25-.03-.5-.59-.29-.72z"></path>
                  </svg>
                </div>

                <!-- SVG 2: Đĩa bay UFO -->
                <div class="svg svg-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <path fill="#1d1d1b" d="m16.75 28.37a14.3 14.3 0 0 1 3.34-6.31 14.54 14.54 0 0 1 5.88-4c.53-.15 2.84-.34 2.84-.34s0-1.75.78-2a8.24 8.24 0 0 1 1.72-.38v-2.84s-1.53-.28-1.78-1.56.69-2.44 2.47-2.38 2.56 1.25 2.21 2.53a2.32 2.32 0 0 1 -1.84 1.5l-.06 2.69s2.06 0 2.12 1.22.07 1.34.07 1.34 4.71 0 7.68 3.06a26.82 26.82 0 0 1 4.6 5.94 10.68 10.68 0 0 1 .09 1.53 26.08 26.08 0 0 1 9.41 3.47c4 2.69 5.22 4.41 5 8.56a11.29 11.29 0 0 1 -5.07 9.13c-2.84 1.87-6.09 5-15.93 5.75a54.76 54.76 0 0 1 -23.28-3.19c-6-2.09-10.22-4.4-12.72-7.81a9.17 9.17 0 0 1 -.44-9.44c1-1.47 3.88-3.37 7-4.59a52.93 52.93 0 0 1 5.91-1.88z"></path>
                    <path fill="#cbe7f5" d="m19.68 35.06a8 8 0 0 1 -1.28-4.44 15.5 15.5 0 0 1 3.91-8.5 11.57 11.57 0 0 1 7.69-3.18c3.15-.19 6.62.43 8.72 1.81a10.73 10.73 0 0 1 2.56 2s-1.35 0-1.38.16-.09.71 0 .75a15.94 15.94 0 0 1 2.63.34c.19.19 2.25 2.06 2.59 3.94a15.76 15.76 0 0 1 0 5c-.12-.1-5.69-2.69-5.81-2.63s-.31.59-.22.69 5.94 2.53 6 2.81-.13 1.78-.13 1.78-5.78-2.87-6-2.72-.5.57-.34.69 6.31 2.75 6.28 2.94-.81.75-1.22.94l-.56.25a53.62 53.62 0 0 0 -4.88-2.75c-.21.09-.65.28-.43.59s4.37 2.41 4.15 2.62-3.87.82-9.09.72-10.15-.37-13.19-3.81z"></path>
                    <path fill="#cbe7f5" d="m31.47 9.44c1.07-.13 1.93.4 1.75 1.31s-2.07.78-2.47.5a1.06 1.06 0 0 1 .72-1.81z"></path>
                    <path fill="#696a9b" d="m30.34 17.62a.37.37 0 0 1 -.41-.43c.07-.32.5-.91 1.69-.85s1.63.35 1.78.72 0 .44-.37.5-2.35 0-2.69.06z"></path>
                    <g fill="#1d1d1b">
                      <path d="m39.84 25.4a21.45 21.45 0 0 1 4 1.72c.09.22.16.72 0 .75a33.77 33.77 0 0 1 -3.88-1.43c-.21-.16-.24-1-.12-1.04z"></path>
                      <path d="m40 28a40.88 40.88 0 0 1 4.46 1.93c0 .22.1.5-.12.5a41.64 41.64 0 0 1 -4.38-1.46c-.15-.19-.21-.97.04-.97z"></path>
                      <path d="m25 22.59a3.8 3.8 0 0 1 1.87-1.69c1.38-.59 2.22-.62 2.41-.43a.64.64 0 0 1 .12.68 13.46 13.46 0 0 0 -2.4.85c-.66.5-1.06 1.09-1.38 1.19s-.69-.41-.62-.6z"></path>
                      <path d="m23.34 24.87c.31-.1 1.81.16 1.81.47a8.74 8.74 0 0 0 -.06 4c.56 1.78 1.72 4.44 1.53 5.28a1.47 1.47 0 0 1 -1.62 1.1 11.25 11.25 0 0 1 -3.6-1.35c-.81-.56-1.06-1.31-.93-3.12s1.93-6.06 2.87-6.38z"></path>
                    </g>
                    <path fill="#e6e4da" d="m23.68 25.87c.16 0 .19.13.16.41a20.35 20.35 0 0 0 .72 5.47c.69 2.19.84 2.5.59 2.62a9.49 9.49 0 0 1 -3.34-1 10.1 10.1 0 0 1 .12-3.87c.35-1.88 1.35-3.5 1.75-3.63z"></path>
                    <path fill="#92a0d1" d="m16.15 29.87c.27 0 .07 4.38 2 6.38s4.85 3.31 9.35 3.9a36 36 0 0 0 12.06-.15 20.52 20.52 0 0 0 7.25-2.91.72.72 0 0 0 .28-.56s.06-6.06.16-6.16 5.5.69 8.43 3 3.69 3.69 3.6 6.22a6.87 6.87 0 0 1 -2.35 4.66 9.78 9.78 0 0 1 -1.81 1.22s-4.25-3.35-4.44-3.32-.62.54-.46.72 4.46 3 4.25 3.19a13.24 13.24 0 0 1 -1.66.75s-2.34-1.81-2.47-1.81-.66.4-.5.65 2.16 1.44 2.06 1.54a49.56 49.56 0 0 1 -14.15 2.09 71.36 71.36 0 0 1 -20.13-2.38 44.59 44.59 0 0 1 -11.5-5.21 4.72 4.72 0 0 1 0-6.75 23.42 23.42 0 0 1 10.03-5.07z"></path>
                    <path fill="#1d1d1b" d="m52.75 40.62c.38-.11 3.34 2.35 3.28 2.53s-.31.54-.56.44a24.39 24.39 0 0 1 -3.22-2.34c-.07-.25.28-.56.5-.63z"></path>
                    <path fill="#1d1d1b" d="m54.5 40c.12 0 .65-.44.87-.41a10.77 10.77 0 0 1 2.56 1.94c-.09.19-.15.53-.5.44s-2.93-1.97-2.93-1.97z"></path>
                    <path fill="#1d1d1b" d="m56.78 38.81c.12-.12.22-.53.62-.37s.85.93.72 1.09-.15.37-.28.28-1.06-1-1.06-1z"></path>
                    <path fill="#1d1d1b" d="m51.34 35.34a2.57 2.57 0 0 1 3.66 2c.4 2.38-3.82 2.88-4.66 1.41a2.32 2.32 0 0 1 1-3.41z"></path>
                    <path fill="#cbe7f5" d="m52 36.19a1.69 1.69 0 0 1 2 1.5c.12 1.15-2.28 1.4-2.75.5a1.41 1.41 0 0 1 .75-2z"></path>
                    <path fill="#1d1d1b" d="m43.78 41.78c.9-.25 2.81-.28 3.31 1.19s-1.94 2.93-3.37 2.72a2.13 2.13 0 0 1 -1.82-2.16 2.8 2.8 0 0 1 1.88-1.75z"></path>
                    <path fill="#cbe7f5" d="m44.43 42.56c.64-.06 1.75.5 1.41 1.13s-1.66 1.06-2.19.56a1 1 0 0 1 .78-1.69z"></path>
                    <path fill="#1d1d1b" d="m31.25 42.75c.76-.11 3.93.06 4.09 1.62s-1.62 3.19-4.28 2.53a2.09 2.09 0 0 1 .19-4.15z"></path>
                    <path fill="#cbe7f5" d="m31.28 43.78a3.49 3.49 0 0 1 2.25.66c.53.53.06 1.43-1.35 1.4s-2.56-1.65-.9-2.06z"></path>
                    <path fill="#1d1d1b" d="m18.09 40.22c1.33-.22 4.63.47 4.53 2.59s-4.22 2.56-5.62 1.34a2.17 2.17 0 0 1 1.09-3.93z"></path>
                    <path fill="#cbe7f5" d="m18 41.34c.87-.1 3.12.25 3.34 1.31s-1.66 1.54-3.09.85-.82-2.1-.25-2.16z"></path>
                    <path fill="#1d1d1b" d="m10.93 34.34c1.1-.07 3.72.1 3.19 2.5s-4.22 2.28-5 .66a2.18 2.18 0 0 1 1.81-3.16z"></path>
                    <path fill="#cbe7f5" d="m11 35.37c.87-.22 2.19.28 1.81 1.35s-1.59 1-2.41.47-.05-1.65.6-1.82z"></path>
                    <path fill="#696a9b" d="m7.22 44.15c.28 0 5.65 2.88 10.31 4.13a51.91 51.91 0 0 0 15.47 2.25c7.09 0 10.68-.09 15.65-1.31s7.82-2.88 8-2.75a.33.33 0 0 1 .1.47 23.6 23.6 0 0 1 -10.35 5.9 48.07 48.07 0 0 1 -22.15-.12c-8.19-2.07-12.5-4-14.22-5.41s-3.28-3.19-2.81-3.16z"></path>
                  </svg>
                </div>

                <!-- SVG 3: Tàu con thoi Rocket -->
                <div class="svg svg-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <path fill="#1d1d1b" d="m6.9 48.93s-2.08.07-2.25-1.75-.33-4.67 3.59-8 6.66-3.34 10.5-9.42 5.58-16.83 6.83-19.58 1.83-6.92 7.33-7.18 6.34 4.75 7.42 9.17 3.42 14.33 7.92 19.91 8.5 7.76 10.25 12.92.58 6.42.16 6.5-4.41.33-4.41.33a7.34 7.34 0 0 1 .14 2.17c-.19.31-4.37.87-7.06.81s-4.38-.25-4.38-.62-.18-1.75-.18-1.75l-1.82.12s.44 2.5-.06 3.25a3.78 3.78 0 0 1 -2.25 1.19 6.7 6.7 0 0 1 -.81.06s.5 2.81.19 3.31-4.07.69-7.88.63-5.62-.13-5.69-.75a31.67 31.67 0 0 1 .32-3.38s-3.07-.18-3.38-1a18.08 18.08 0 0 1 -.06-4.06h-2.19a2.64 2.64 0 0 1 -.06 1.19c-.19.37-4.69.62-8 .31s-4.38-1.25-4.38-1.56.21-2.82.21-2.82z"></path>
                    <path fill="#cbe7f5" d="m7.94 47.3s-1.31-.12-1.25-.56.75-5.56 4.19-7.06 8.5-1.88 10.81-4.38 3.69-8.75 3.94-11.5 0-9.12 1.19-12.44 2-6.86 6.69-6.87c7.48 0 7.25 27.56 10.62 29.75a17 17 0 0 0 5.38 2.56 16.46 16.46 0 0 1 6.25 6.88c1.87 4.37 1.5 6.43 1.5 6.43l-2.94.25a5.54 5.54 0 0 0 -5.56-4.87c-5.07-.13-5.76 5.87-5.76 5.87s-2.25.63-2.13.19-.31-14.87-1.06-17.62-2.38-3.57-3.06-3.69-1.13 1.44-1 1.62 1.93 0 2.31 5.82 1.31 16.87.62 17.37-4.81 1.06-9.06.81-5.56-.31-6.06-1.43.94-17.63 1.5-19.88 1.5-2.56 2.25-2.75a.91.91 0 0 0 .69-1.19c-.13-.31-1.19-.37-2.19-.12s-2.69 1.69-3.19 7.31-.94 12.5-1.12 12.5-3.32-.25-3.32-.25.57-6-4.56-6.25-5.68 3.5-5.68 3.5z"></path>
                    <path fill="#e7413e" d="m13.44 45.43a3 3 0 0 1 2.94 3.06c0 1.56.13 2.87-.25 3a17.3 17.3 0 0 1 -4.44-.06c-2.18-.25-2.56 0-2.56-.88s-.37-5.37 4.31-5.12z"></path>
                    <path fill="#e7413e" d="m48.69 47.18c3.06-.2 4 5 3.44 5.31a13.26 13.26 0 0 1 -4.06.44c-2 .06-3 0-3.13-.94s-.06-4.56 3.75-4.81z"></path>
                    <path fill="#1f4863" d="m24 23.68c.25 0 .31 3.62-1.07 7s-3.5 5.12-4.81 5.5a14.78 14.78 0 0 1 -2.94.43s4.25-2.87 6.13-6.87 2.69-6.06 2.69-6.06z"></path>
                    <path fill="#1f4863" d="m42.65 25a32 32 0 0 0 2.73 6.16c1.63 2.63 3.69 3.75 3.25 4s-3.31-.86-4.63-3.36a14 14 0 0 1 -1.35-6.8z"></path>
                    <path fill="#1d1d1b" d="m27.38 16.43c-.06-.31.38-10.5 5.5-10.63s5.25 11.38 4.75 11.56-2-.93-5.62-.62-4.44.69-4.63-.31z"></path>
                    <path fill="#1f4863" d="m28.69 15.49c-.32-.19.63-8.75 4.38-8.38s3.75 8.25 3.19 8.38-2.07-.44-3.94-.38-3.19.63-3.63.38z"></path>
                    <g fill="#1d1d1b">
                      <path d="m36.51 20.36c.3-.25 2.25.82 2.18 1.38s.13.81-.18.75a9 9 0 0 1 -2.57-1.31c-.12-.32.19-.5.57-.82z"></path>
                      <path d="m35.63 23.55c.18-.18 2.94 1.44 3 1.88s.38 1-.06.93-3.44-1.62-3.5-2 .37-.62.56-.81z"></path>
                      <path d="m34.88 26.11c.31.07 4.19 1.82 4.06 2.25s.25.75-.31.63-4.19-1.75-4.19-2.25a.65.65 0 0 1 .44-.63z"></path>
                      <path d="m29.32 34.08c.35-.26 1 .25 2.66.32s2.75 0 2.75 0 .12.62 0 .81a9.3 9.3 0 0 1 -2.69.28 12 12 0 0 1 -2.85-.44.94.94 0 0 1 .13-.97z"></path>
                      <path d="m29.35 39c.35-.27 1 .25 2.66.31s2.75 0 2.75 0 .12.63 0 .81a9 9 0 0 1 -2.69.28 12.47 12.47 0 0 1 -2.84-.43.91.91 0 0 1 .12-.97z"></path>
                      <path d="m29.26 44.65c.35-.27 1 .25 2.65.31s2.75 0 2.75 0 .13.62 0 .81a8.85 8.85 0 0 1 -2.68.28 12 12 0 0 1 -2.85-.44.92.92 0 0 1 .13-.96z"></path>
                      <path d="m49.82 38.65c.12.15 2.41 2.09 2.34 2.37s-.18.41-.28.34a31.15 31.15 0 0 1 -2.47-2c-.06-.15.41-.71.41-.71z"></path>
                      <path d="m47.35 39.33c.28 0 4.22 3.19 4.16 3.57s-.16.62-.32.62-4.43-3.31-4.4-3.59.56-.6.56-.6z"></path>
                      <path d="m46.29 41.93a12.19 12.19 0 0 1 2.9 2.12c-.12.16.29.38-.37.35a9.48 9.48 0 0 1 -3-1.72c-.06-.19.31-.68.47-.75z"></path>
                    </g>
                    <path fill="#e7413e" d="m26.11 57.26c.07-.1 2.46.21 5.21.12a50.91 50.91 0 0 1 5.12-.2 8.22 8.22 0 0 1 .21 2.5 33 33 0 0 1 -6 .29c-2.7-.09-4.54 0-4.75-.29a5.38 5.38 0 0 1 .21-2.42z"></path>
                  </svg>
                </div>

                <!-- SVG 4: Trái đất Earth -->
                <div class="svg svg-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <path fill="#1d1d1b" d="m18.68 10.74a26.63 26.63 0 0 1 11.25-3.53c4.25-.21 8.15.79 13.56 3.38s8.4 5.06 10.69 9.31 3.53 7.38 2.28 12.91-1.63 11.09-3.85 14.93-5.93 6.5-11.43 7.88-13.32 2.28-20.07-1.44-11.5-9.25-13.25-16.9-.31-11.63 1-15.22a23.64 23.64 0 0 1 9.82-11.32z"></path>
                    <path fill="#4eae4d" d="m20.55 11.31a22.85 22.85 0 0 1 7.69-2.6c4-.47 10.47 1.32 11.15 1.63s1.25.5 1 .69-2.53 2.18-3.34 2.31-3.62-.56-5.75-.47-3.56.5-4.59.5-2.5-1.13-3.5-1.22-3.13-.59-2.66-.84z"></path>
                    <path fill="#85bfe9" d="m18.58 12.87a5.82 5.82 0 0 1 4.16.34c1.62.88 1.44 1.25 3.65 1.22s3.29-.4 3.94-.25 3.41 1.35 5.85.88a10.42 10.42 0 0 0 4.28-1.75c.72-.47 1.15-1.25 1.59-1.19s4.41 2.41 4.34 2.66a4.52 4.52 0 0 1 -1.71 1.5 7.43 7.43 0 0 0 -2.79 3.46c-.5 1.47-.78 5.88-.12 6.32s2.34-.19 3 .31.81 2.06 1.91 2.19 1.56-.69 2.56 0 1 1.21 2.56 1.25 3-.32 3.09 0a2.47 2.47 0 0 1 -.12 1.43c-.16.1-5.44.72-6.69.79s-1 .34-1.69 0-1.78-1.63-3.39-1.88-6.53-.56-7.5-.56-1.25 0-1.35.47.1 5.18-.4 6.72-.16 4.06 1.65 4.78 3.69 1.09 3.94 1.75 1.13 5 1.91 6.47 1.87 3.15 1.5 3.46a20.31 20.31 0 0 1 -6 1.54 23.64 23.64 0 0 1 -5.78 0s-1.16-6-1.47-6.54a4.67 4.67 0 0 1 -.41-2.34c.13-.41 2.34-4.87 2.06-6s-.72-2.28-1.75-2.56-2.75 0-5.53 0a27.84 27.84 0 0 1 -5.34-.44c-.56-.12-.88 0-1.13-.28s-2.28-4-2-4.34 3.13-1.16 3.25-1.82-.06-2.25.66-2.31 3.87.38 4.87-.15 1.13-1.75 1.16-2.82-.37-3.4-.84-3.84-5-1.81-6.72-2.72-3.17-1.62-2.98-2.22a12.45 12.45 0 0 1 3.78-3.53z"></path>
                    <path fill="#1d1d1b" d="m20.49 15c.54-.07.59.35.4.72s0 1.72.6 1.69a55.56 55.56 0 0 1 6.4-1.06 26.38 26.38 0 0 1 8 1.65c.75.41 1.1 2 1.16 2.47a29.44 29.44 0 0 1 -2.75 5.53c-.28.15-3.19-1-5.28-2s-3-1.47-3.09-1.88a6.23 6.23 0 0 0 -.5-1.69c-.19-.09-3-.28-4.35-1.09s-2.56-2.13-2.31-2.69a4.18 4.18 0 0 1 1.72-1.65z"></path>
                    <path fill="#4eae4d" d="m24.36 17.87a20.8 20.8 0 0 1 7.25.31c3.19.63 3.69 1.16 3.6 1.94s-1.28 4-1.72 3.84a41.78 41.78 0 0 1 -5.31-2.18c-.22-.32-.29-1.88-1.22-2.16s-2.88-.88-3.53-1.13-.5-.5-.35-.5 1.28-.12 1.28-.12z"></path>
                    <path fill="#4eae4d" d="m47.58 15.21c.21-.07 2.94 1.07 4.81 4.63s2.47 7.94 2.25 8.34-.9.44-1.53.25-3.11-1.56-3.65-1.56-1.41.47-1.78 0-1.5-1.87-2.63-1.87-1.37.19-1.56-.06-.81-5.53.37-6.5 2.22-1.59 2.69-2 .75-1.13 1.03-1.23z"></path>
                    <path fill="#4eae4d" d="m35.71 31c.36 0 5.72-.4 6.78.63s1.94 2.15 2.84 2.12 9.19-.75 9.19-.43-.94 7.5-2.38 11.15a15.91 15.91 0 0 1 -5.53 7.06c-1.15.66-2.34.91-2.43.72a21.82 21.82 0 0 1 -2.29-5.93c-.68-3.22-.87-4.72-1.93-5s-3.69-.9-4.19-1.53a4 4 0 0 1 -.56-1.87s.28-3.88.28-4.72.03-2.2.22-2.2z"></path>
                    <path fill="#4eae4d" d="m17.43 38.21a12.74 12.74 0 0 0 4.84.91c3.31.06 6.56-.31 6.91.09s.28 1.78-.44 3.1a21.38 21.38 0 0 0 -1.19 2.59 26.16 26.16 0 0 0 -3.16-2.5.59.59 0 0 0 -.34.69c.13.28 3 2.22 3.13 2.47a9.75 9.75 0 0 1 -.1 1.75 25.76 25.76 0 0 0 -3-2.38c-.37-.06-.62.85-.5 1s3.53 2.5 4 2.91a6.06 6.06 0 0 1 .84 2.53c-.09 0-3.9-3.09-4.12-3.13s-.28 1-.28 1 4.5 3.19 4.65 3.44a6.49 6.49 0 0 1 .44 1.88 32.57 32.57 0 0 1 -3.59-.91c-1.25-.47-2.35-.72-2.35-.81s-1.17-3.78-2.81-5.38a12.91 12.91 0 0 1 -2.36-2.65 31.09 31.09 0 0 1 -.35-3.72c-.04-.85-.41-2.88-.22-2.88z"></path>
                    <path fill="#85bfe9" d="m10.52 38.4c.19-.37 2.56.25 3.69.69s1.5 1 1.53 1.87-.13 4.66.65 5.35a10.71 10.71 0 0 1 3.07 3.28 7.26 7.26 0 0 1 1 2.19 20.15 20.15 0 0 1 -5.91-5.5c-3.19-4.13-4.12-7.69-4.03-7.88z"></path>
                    <path fill="#4eae4d" d="m9.61 36.18a17.66 17.66 0 0 1 -.12-9.65c1.37-5.69 4-8.72 4.22-8.69s5.4 3 7.5 4 2.22 1 2.37 1.44a10.13 10.13 0 0 1 -.19 3.34c-.18.09-3.93-.09-5 0s-1.39 1.59-1.31 2.19.13.87-.12 1.06-3.6 1.09-3.78 2 2.37 5.37 2 5.5-4.57-.16-5.57-1.19z"></path>
                    <g fill="#1d1d1b">
                      <path d="m11.36 25.18a19.09 19.09 0 0 1 1.16-3.65c.5-.75.72-.91.94-.85s.84.35.78.53-1.13 2.25-1.41 3.16 0 .91-.4 1-.94.03-1.07-.19z"></path>
                      <path d="m40 15.59c.16-.14 2.53-.72 2.69-.5s.34.44.18.56a11.75 11.75 0 0 1 -2.62.94c-.2-.1-.45-.85-.25-1z"></path>
                      <path d="m38.46 22.93c.15.16 1.47 2.28 1.31 2.47s0 .47-.34.31a6.24 6.24 0 0 1 -1.54-2.22c.11-.25.57-.56.57-.56z"></path>
                      <path d="m37 24.37a12.18 12.18 0 0 1 1.72 2.09c0 .19 0 .47-.31.38a8.07 8.07 0 0 1 -1.86-1.84c0-.16.45-.66.45-.63z"></path>
                      <path d="m49.33 19.65a7.18 7.18 0 0 1 2.5 1.22c0 .19.1.69-.15.59s-2.54-1-2.63-1.12.25-.66.28-.69z"></path>
                      <path d="m49.11 22c.08-.11 4 2.18 4 2.53s.35.59-.06.53a30.17 30.17 0 0 1 -4.25-2.16c-.12-.19.2-.75.31-.9z"></path>
                      <path d="m48.74 24a25.43 25.43 0 0 1 4.84 2.62c.06.28.28.59-.12.56a40.58 40.58 0 0 1 -4.94-2.37c-.09-.13.09-.75.22-.81z"></path>
                      <path d="m49.68 35.53a13.17 13.17 0 0 1 2.9 2.78c-.09.25 0 .37-.28.28a22.37 22.37 0 0 1 -3.12-2.72c.06-.16.34-.28.5-.34z"></path>
                      <path d="m48.11 37.43a28.41 28.41 0 0 1 3.35 3.16c0 .25-.13.47-.25.44a41.72 41.72 0 0 1 -3.44-3 4.75 4.75 0 0 1 .34-.6z"></path>
                      <path d="m47.11 39.46a23.35 23.35 0 0 1 3.35 3.32c-.07.25.06.4-.25.37a39.21 39.21 0 0 1 -3.53-3.15 3.19 3.19 0 0 1 .43-.54z"></path>
                      <path d="m46.33 41.12a29.14 29.14 0 0 1 3.41 3.28c0 .25-.1.41-.22.31a43.92 43.92 0 0 1 -3.84-3.09.84.84 0 0 1 .65-.5z"></path>
                      <path d="m45.71 44.12a16 16 0 0 1 3.06 2.72c0 .22-.16.37-.25.34a33.63 33.63 0 0 1 -3.19-2.5c-.03-.19.31-.53.38-.56z"></path>
                      <path d="m45 45.93c.17 0 3.25 2.69 3 2.94s-.12.37-.37.28a22.27 22.27 0 0 1 -3.13-2.69c.11-.15.33-.53.5-.53z"></path>
                      <path d="m35.18 43.43c.09-.14 1.31.31 1.28.6s0 .34-.16.34a5 5 0 0 1 -1.53-.44c0-.12.34-.4.41-.5z"></path>
                      <path d="m33.14 47.28a1.46 1.46 0 0 1 1.16 0c.47.22 1.16 1 1.78 1.1s1.1-.28 1.25-.19a.37.37 0 0 1 .16.47c-.1.16-.16.31-.41.37a2 2 0 0 1 -1.5-.15c-.58-.39-.94-.88-1.58-.88s-.57.12-.69 0-.42-.51-.17-.72z"></path>
                      <path d="m26 40.15c.25.16 2.06 1.75 2 2s-.19.5-.38.44a10.1 10.1 0 0 1 -2.15-1.82c-.01-.24.53-.62.53-.62z"></path>
                      <path d="m24.21 30.43c.12 0 2.81 4.19 2.59 4.41s-.34.44-.47.31a44.75 44.75 0 0 1 -2.84-4.34 1.31 1.31 0 0 1 .72-.38z"></path>
                      <path d="m25.24 30c0-.12.59-.38.78-.19a12 12 0 0 1 1.37 2.72c-.09.18 0 .47-.25.28a17.6 17.6 0 0 1 -1.9-2.81z"></path>
                      <path d="m30.74 29.71c.08-.11 1-1 1.28-1s1 0 .91.22-1.41 1.91-1.66 1.75a1.66 1.66 0 0 1 -.53-.97z"></path>
                    </g>
                  </svg>
                </div>

                <!-- SVG 5: Mặt trăng & Ngôi sao Moon -->
                <div class="svg svg-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <g fill="#1d1d1b">
                      <path d="m15.69 55.54a2.75 2.75 0 0 0 -.62-2.69 2.37 2.37 0 0 0 -2.72-.47s-1.88-2-2.6-.65.79 2.69.79 2.69a1.9 1.9 0 0 0 .46 2.34 2.88 2.88 0 0 0 2.6.37s2.37 1.6 3 .44-.91-2.03-.91-2.03zm-4.84-1.72s-.91-1.09-.53-1.56 1.56.47 1.56.47-.97 1.09-1.03 1.09zm4.94 3.38c-.32.22-1.16-.38-1.16-.38l.44-.69c.28.16 1.03.87.72 1.07z"></path>
                      <path d="m27 33.1c.05-.53-3.81-2.25-3.87-7.18s2.37-9 8.31-10.19 8.5-.13 8.94-.56.75-2.75-2.75-4.82-14.16-3.35-22.47 4.57-7.44 16.46-6.59 19.87a20.86 20.86 0 0 0 8 11.91c4.84 3.34 7.53 4.43 11.78 5.09s8.75-1.41 11.19-3.06 3-3.41 2.93-4.16-.9-1.94-1.46-1.78-5.13 2.22-9.22 1-5.35-4-5.32-6 .41-3.5.53-4.69z"></path>
                      <path d="m7.79 8.7c.23-.08 1.71.12 1.78 0s.25-2.16.72-2.1.53 1.72.87 1.78 1.66-.09 1.75.25-1.09 1.35-1.06 1.5.25.88 0 1-1.25-.28-1.28-.18-1.32 1.68-1.57 1.56-.5-.16-.46-.34.62-2.17.62-2.17l-1.5-.8c-.16-.1-.06-.44.13-.5z"></path>
                      <path d="m7.16 18.73c.76-.47 1.28 0 1.13.84a.88.88 0 0 1 -1.38.53.89.89 0 0 1 .25-1.37z"></path>
                      <path d="m37.29 4.82a1.71 1.71 0 0 1 2.4 1.69 1.8 1.8 0 0 1 -3 1.16 1.74 1.74 0 0 1 .6-2.85z"></path>
                    </g>
                    <path fill="#ffe19b" d="m37.58 5.55a.92.92 0 0 1 1.3.91 1 1 0 0 1 -1.64.63.94.94 0 0 1 .34-1.54z"></path>
                    <path fill="#1d1d1b" d="m47 12c.19 0 0-2.84.34-3s1.28 1.78 1.62 1.75 1.63-.78 2-.56-.32 2.43-.25 2.59 1 1.41.65 1.66-1.87-.32-2-.22-.84 1.44-1.15 1.4-.35-2-.69-2.09-2.06-.28-2.16-.66 1.46-.87 1.64-.87z"></path>
                    <path fill="#1d1d1b" d="m54.13 17.23a2.52 2.52 0 0 1 2.75 2.77c-.22 2.15-3 2.25-4.16 1a2.31 2.31 0 0 1 1.41-3.77z"></path>
                    <path fill="#ffe19b" d="m54.32 18.26a1.37 1.37 0 0 1 1.49 1.48c-.12 1.17-1.61 1.22-2.26.56a1.26 1.26 0 0 1 .77-2.04z"></path>
                    <path fill="#1d1d1b" d="m34.75 21.67c1-.45 3.16 0 2.57 2.06s-3.32 1.56-3.82.47a2 2 0 0 1 1.25-2.53z"></path>
                    <path fill="#ffe19b" d="m35 22.34c.62-.27 1.88 0 1.53 1.22a1.29 1.29 0 0 1 -2.27.28 1.18 1.18 0 0 1 .74-1.5z"></path>
                    <path fill="#1d1d1b" d="m45.66 29.13s1.38-2.75 1.81-2.81.47 3 .47 3 1.94.16 1.88.47-1.57 1.06-1.57 1.06.54 2.19.25 2.35-1.4-1.66-1.4-1.66-2.13 1.09-2.31.84.46-2.12.46-2.12-1.5-.53-1.46-.78 1.65-.16 1.87-.35z"></path>
                    <path fill="#1d1d1b" d="m35.44 34.13a1.12 1.12 0 0 1 1.31 1.44 1.24 1.24 0 0 1 -2 .31c-.59-.68.13-1.59.69-1.75z"></path>
                    <path fill="#1d1d1b" d="m50 37.13c1-.26 2.53-.28 2.94 1.5s-1.66 2.54-3.31 2.13-1.94-3.03.37-3.63z"></path>
                    <path fill="#ffe19b" d="m50.26 37.92c.57-.14 1.43-.15 1.65.85s-.91 1.42-1.86 1.23a1 1 0 0 1 .21-2.08z"></path>
                    <path fill="#1d1d1b" d="m8.6 46a1.18 1.18 0 0 1 1.87.94c0 1.09-1.47 1.34-2 .9a1.22 1.22 0 0 1 .13-1.84z"></path>
                    <path fill="#1d1d1b" d="m34.54 54.1a1.9 1.9 0 0 1 2.53 2 2.29 2.29 0 0 1 -3.5 1.38c-1.5-1.16-.97-2.88.97-3.38z"></path>
                    <path fill="#ffe19b" d="m34.7 55a1 1 0 0 1 1.3 1 1.2 1.2 0 0 1 -1.84.72c-.75-.58-.47-1.48.54-1.72z"></path>
                    <path fill="#1d1d1b" d="m49.22 52.2c.07-.1 1.6-2.82 2-3s.41-.16.5 0a27.3 27.3 0 0 1 0 2.84s1 0 1 .28-1.06 1.16-1.06 1.16.31 1.94 0 2.09a.75.75 0 0 1 -.69-.09l-.43-1.09a10.81 10.81 0 0 1 -2.22.87c-.16-.12-.6-.41-.38-.59a8.27 8.27 0 0 0 .78-1.28s-2.12-.19-2.18-.44-.07-.6.09-.66 2.59-.09 2.59-.09z"></path>
                    <path fill="#cbe7f5" d="m11.75 54s1.16-1.81 2.5-.81 0 3-.09 2.94a4.64 4.64 0 0 1 -2.41-2.13z"></path>
                    <path fill="#cbe7f5" d="m11.5 55.17s1 1 1.32 1.21l.28.22a2.61 2.61 0 0 1 -1.53-.15c-.63-.35-.07-1.28-.07-1.28z"></path>
                    <path fill="#1d1d1b" d="m12.63 53.88s.56-.56.91-.53a.69.69 0 0 1 .5.28l-.63.38-.56.34a2.22 2.22 0 0 0 -.22-.47z"></path>
                    <path fill="#e6e4da" d="m38.29 13.87c.24-.06-1-2.1-2.86-2.81a16.74 16.74 0 0 0 -9.23-.14 25.3 25.3 0 0 0 -9.2 4.66 19 19 0 0 0 -4.84 6.42 14.81 14.81 0 0 0 -2.16 8 18.87 18.87 0 0 0 3.42 10.1 24.2 24.2 0 0 0 6 6 9.61 9.61 0 0 0 2 1.17s-.42-1.27-.22-1.35a1 1 0 0 1 .8.08 12.69 12.69 0 0 0 .23 1.64c.13.07.61.44.61.38a21.52 21.52 0 0 1 -.23-2.71c.1-.13 1-.1 1.08.1s0 2.71.08 2.8a2.49 2.49 0 0 0 .65.41c.06 0-.1-1.81 0-1.81s.77.06.83.19 0 1.85.09 2a9.45 9.45 0 0 0 5.32 1 15 15 0 0 0 7.46-2.31c1.67-1 2.71-2.31 2.6-2.59s-.14-.35-.29-.37-6.37 2.37-10.43.27-5.25-4.85-5.41-6.31.6-4.61.5-4.84-3.84-3.14-4-6.58.31-6.37 3.06-9.27a14.77 14.77 0 0 1 8.85-4.27c1.85-.02 5.2.16 5.29.14z"></path>
                    <path fill="#1d1d1b" d="m24.1 13.19a1.58 1.58 0 0 1 2.08 1.2 1.73 1.73 0 0 1 -2.46 1.8c-1.64-.57-.83-2.57.38-3z"></path>
                    <path fill="#ffffff" d="m24.31 14a.76.76 0 0 1 1 .58.83.83 0 0 1 -1.18.86c-.79-.29-.4-1.25.18-1.44z"></path>
                    <path fill="#1d1d1b" d="m17.47 17.31c.77-.54 3.15-.46 3.36 1.42s-1.83 3.35-3.4 2.27a2.34 2.34 0 0 1 .04-3.69z"></path>
                    <path fill="#ffffff" d="m18 18.11c.44-.32 1.82-.27 1.94.82a1.33 1.33 0 0 1 -2 1.34 1.36 1.36 0 0 1 .06-2.16z"></path>
                    <path fill="#1d1d1b" d="m14.12 21.52c.14-.13.79 0 .75.37a22.52 22.52 0 0 1 -1.54 4.21c-.31.27-.75.4-.92 0a10.5 10.5 0 0 1 1.71-4.58z"></path>
                    <path fill="#1d1d1b" d="m14.27 28.77c1.34-.56 4.25 0 3.77 3.44s-3.86 2.52-4.75 1.14-1.21-3.66.98-4.58z"></path>
                    <path fill="#ffffff" d="m14.59 29.61c.94-.39 3 0 2.64 2.41s-2.7 1.76-3.32.8-.85-2.56.68-3.21z"></path>
                    <path fill="#1d1d1b" d="m19.37 37.67c1.34-.57 4.25 0 3.77 3.43s-3.85 2.52-4.75 1.15-1.21-3.67.98-4.58z"></path>
                    <path fill="#ffffff" d="m19.69 38.51c.94-.39 3 0 2.64 2.41s-2.69 1.76-3.32.8-.85-2.57.68-3.21z"></path>
                    <path fill="#1d1d1b" d="m27.66 45.87a1.14 1.14 0 0 1 1.63 1.13c0 .9-.67 1.58-1.61 1.25a1.26 1.26 0 0 1 -.02-2.38z"></path>
                    <path fill="#ffffff" d="m27.87 46.5a.53.53 0 0 1 .76.53c0 .42-.32.75-.76.59a.59.59 0 0 1 0-1.12z"></path>
                  </svg>
                </div>

                <button
                  type="button"
                  class="btn space-btn"
                  @click="tiepTheoWizard"
                  :disabled="dangTao"
                  title="Tiếp tục sang bước tiếp theo"
                >
                  <span>Tiếp theo</span>
                  <span class="space-btn-arrow">→</span>
                </button>
              </div>

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
                <span v-else style="display:inline-flex; align-items:center; gap:8px;">
                  <AppIcon name="sparkles" size="18" /> Tạo Lịch Trình AI Ngay
                </span>
              </button>
            </div>
          </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import AppIcon from '../common/AppIcon.vue'
import { getEstimatedDistance } from '../../services/busService'

const props = defineProps({
  formDuLieu: { type: Object, required: true },
  ALL_DESTINATIONS: { type: Array, default: () => [] },
  visibleCities: { type: Array, default: () => [] },
  musicMuted: { type: Boolean, default: false },
  toggleMusicMute: { type: Function, default: () => {} },
  currentPlannerStep: { type: Number, default: 1 },
  showAiHintBubble: { type: Boolean, default: true },
  aiCurrentHint: { type: String, default: '' },
  refreshAiHint: { type: Function, default: () => {} },
  chonNhanhDiemDen: { type: Function, default: () => {} },
  showManualWardPicker: { type: Boolean, default: false },
  toggleManualWardPicker: { type: Function, default: () => {} },
  originProvinceMode: { type: String, default: 'popular' },
  popularOrigins: { type: Array, default: () => [] },
  isLocatingOrigin: { type: Boolean, default: false },
  layViTriHienTaiChoDiemXuatPhat: { type: Function, default: () => {} },
  selectedManualProvinceCode: { type: [String, Number], default: '' },
  selectedManualDistrictCode: { type: [String, Number], default: '' },
  selectedManualWardCode: { type: [String, Number], default: '' },
  manualStreetAddress: { type: String, default: '' },
  manualProvincesList: { type: Array, default: () => [] },
  manualDistrictsList: { type: Array, default: () => [] },
  manualWardsList: { type: Array, default: () => [] },
  loadingDistricts: { type: Boolean, default: false },
  loadingWards: { type: Boolean, default: false },
  manualComputedAddress: { type: String, default: '' },
  onManualProvinceChange: { type: Function, default: () => {} },
  onManualDistrictChange: { type: Function, default: () => {} },
  onManualWardChange: { type: Function, default: () => {} },
  apDungDiaChiThuCong: { type: Function, default: () => {} },
  chonDiemKhoiHanh: { type: Function, default: () => {} },
  todayIso: { type: String, default: '' },
  DEPARTURE_MONTHS: { type: Array, default: () => [] },
  selectedMonthKey: { type: String, default: '' },
  chonThangKhoiHanh: { type: Function, default: () => {} },
  ngayKetThucDisplay: { type: String, default: '' },
  dinhDangNgayTuan: { type: Function, default: () => '' },
  dinhDangTien: { type: Function, default: () => '' },
  giamSoNgay: { type: Function, default: () => {} },
  tangSoNgay: { type: Function, default: () => {} },
  giamSoDem: { type: Function, default: () => {} },
  tangSoDem: { type: Function, default: () => {} },
  tripFeasibility: { type: Object, default: () => ({ feasible: true }) },
  currentBudgetTier: { type: Object, default: null },
  thongDiepNganSach: { type: String, default: '' },
  transitRouteInfo: { type: Object, default: () => ({}) },
  transitTab: { type: String, default: 'bus' },
  step3ActiveSubtab: { type: String, default: 'transit' },
  daXongPhuongTien: { type: Boolean, default: false },
  daXongKhachSan: { type: Boolean, default: false },
  daXongBuoc3: { type: Boolean, default: false },
  chonPhuongTienTuSoSanh: { type: Function, default: () => {} },
  chonNhaXe: { type: Function, default: () => {} },
  chonGioXuatPhatBus: { type: Function, default: () => {} },
  chonTauHoa: { type: Function, default: () => {} },
  chonGioXuatPhatTau: { type: Function, default: () => {} },
  toggleTuTucPhuongTien: { type: Function, default: () => {} },
  chuyenSangChonKhachSan: { type: Function, default: () => {} },
  toggleTuTucKhachSan: { type: Function, default: () => {} },
  apDungNangNganSachKhachSan: { type: Function, default: () => {} },
  chonPhongTietKiemHon: { type: Function, default: () => {} },
  giamSoDemKhachSan: { type: Function, default: () => {} },
  moModalXemPhong: { type: Function, default: () => {} },
  huyChonKhachSan: { type: Function, default: () => {} },
  hotelSortBy: { type: String, default: 'default' },
  hotelStarFilter: { type: String, default: 'all' },
  hotelDisplayLimit: { type: Number, default: 6 },
  filteredSortedHotels: { type: Array, default: () => [] },
  displayedHotels: { type: Array, default: () => [] },
  xemThemKhachSan: { type: Function, default: () => {} },
  xemTatCaKhachSan: { type: Function, default: () => {} },
  thuGonKhachSan: { type: Function, default: () => {} },
  soPhongCan: { type: Number, default: 1 },
  tongChiPhiKhachSanChon: { type: Number, default: 0 },
  hotelBudgetAlert: { type: Object, default: null },
  places: { type: Array, default: () => [] },
  selectedPlaces: { type: Array, default: () => [] },
  customPlaceText: { type: String, default: '' },
  minSoDem: { type: Number, default: 0 },
  maxSoDem: { type: Number, default: 30 },
  searchPlacePickerQuery: { type: String, default: '' },
  placePickerActiveTab: { type: String, default: 'all' },
  isPickerExpanded: { type: Object, default: () => ({}) },
  filteredAttractions: { type: Array, default: () => [] },
  filteredRestaurants: { type: Array, default: () => [] },
  filteredCafes: { type: Array, default: () => [] },
  totalFilteredPlacesCount: { type: Number, default: 0 },
  togglePickerExpand: { type: Function, default: () => {} },
  getVisiblePlaces: { type: Function, default: () => [] },
  removeSelectedPlace: { type: Function, default: () => {} },
  clearAllSelectedPlaces: { type: Function, default: () => {} },
  togglePlaceSelection: { type: Function, default: () => {} },
  isPlaceSelected: { type: Function, default: () => false },
  addCustomPlace: { type: Function, default: () => {} },
  dangCrawl: { type: Boolean, default: false },
  thongBaoCrawl: { type: String, default: '' },
  kichHoatCrawl110: { type: Function, default: () => {} },
  dangTao: { type: Boolean, default: false },
  taoPlanError: { type: String, default: '' },
  tiepTheoWizard: { type: Function, default: () => {} },
  taoLichTrinh: { type: Function, default: () => {} }
})

const emit = defineEmits([
  'update:selectedManualProvinceCode',
  'update:selectedManualDistrictCode',
  'update:selectedManualWardCode',
  'update:manualStreetAddress',
  'update:searchPlacePickerQuery',
  'update:customPlaceText',
  'update:showAiHintBubble',
  'update:showManualWardPicker',
  'update:currentPlannerStep',
  'update:placePickerActiveTab',
  'update:step3ActiveSubtab',
  'update:hotelSortBy',
  'update:hotelStarFilter',
  'update:transitTab'
])

const provinceCodeModel = computed({
  get: () => props.selectedManualProvinceCode,
  set: (v) => emit('update:selectedManualProvinceCode', v)
})
const districtCodeModel = computed({
  get: () => props.selectedManualDistrictCode,
  set: (v) => emit('update:selectedManualDistrictCode', v)
})
const wardCodeModel = computed({
  get: () => props.selectedManualWardCode,
  set: (v) => emit('update:selectedManualWardCode', v)
})
const streetAddressModel = computed({
  get: () => props.manualStreetAddress,
  set: (v) => emit('update:manualStreetAddress', v)
})
const placeSearchQueryModel = computed({
  get: () => props.searchPlacePickerQuery,
  set: (v) => emit('update:searchPlacePickerQuery', v)
})
const customPlaceTextModel = computed({
  get: () => props.customPlaceText,
  set: (v) => emit('update:customPlaceText', v)
})

// ==================== ĐIỀU HƯỚNG QUAY LẠI TRONG WIZARD ====================
function quayLaiWizard() {
  if (props.currentPlannerStep > 1) {
    emit('update:currentPlannerStep', props.currentPlannerStep - 1)
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }
}

function goToStep(step) {
  if (step < props.currentPlannerStep) {
    emit('update:currentPlannerStep', step)
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }
}

// ==================== SLIDER 2 OPTIONS ĐIỂM KHỞI HÀNH (THỦ CÔNG HOẶC VỊ TRÍ HIỆN TẠI) ====================
const originMethod = ref(props.showManualWardPicker ? 'manual' : (props.formDuLieu?.diemKhoiHanh ? 'manual' : 'manual'))

watch(() => props.showManualWardPicker, (val) => {
  if (val) {
    originMethod.value = 'manual'
  }
})

function chonPhuongThucOrigin(method) {
  originMethod.value = method
  if (method === 'manual') {
    if (!props.showManualWardPicker) {
      if (typeof props.toggleManualWardPicker === 'function') {
        props.toggleManualWardPicker()
      } else {
        emit('update:showManualWardPicker', true)
      }
    }
  } else if (method === 'gps') {
    if (props.showManualWardPicker) {
      emit('update:showManualWardPicker', false)
    }
    if (typeof props.layViTriHienTaiChoDiemXuatPhat === 'function') {
      props.layViTriHienTaiChoDiemXuatPhat()
    }
  }
}
// ==================== SLIDER TRƯỢT VIÊN THUỐC ĐIỂM ĐẾN (RADIO GROUP ELASTIC SLIDER) ====================
const citySelectorRef = ref(null)
const cityOptionRefs = new Map()

function setCityOptionRef(el, cityName) {
  if (el) {
    cityOptionRefs.set(cityName, el)
  } else {
    cityOptionRefs.delete(cityName)
  }
}

const sliderStyle = ref({
  left: '4px',
  width: '0px',
  opacity: 0
})

function updateSlider() {
  const currentCity = props.formDuLieu?.diemDen
  const targetEl = cityOptionRefs.get(currentCity)
  if (targetEl && citySelectorRef.value) {
    sliderStyle.value = {
      left: targetEl.offsetLeft + 'px',
      width: targetEl.offsetWidth + 'px',
      opacity: 1
    }
  }
}

function handleSelectCity(cityName) {
  if (typeof props.chonNhanhDiemDen === 'function') {
    props.chonNhanhDiemDen(cityName)
  }
  nextTick(() => {
    updateSlider()
    const targetEl = cityOptionRefs.get(cityName)
    if (targetEl && citySelectorRef.value) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  })
}

watch(
  () => props.formDuLieu?.diemDen,
  (newVal) => {
    nextTick(() => {
      updateSlider()
      const targetEl = cityOptionRefs.get(newVal)
      if (targetEl && citySelectorRef.value) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    })
  }
)

function getCityDistanceKm(cityName) {
  const origin = props.formDuLieu?.diemKhoiHanh || 'Hà Nội'
  return getEstimatedDistance(origin, cityName)
}

watch(
  () => [props.formDuLieu?.diemKhoiHanh, props.visibleCities],
  () => {
    nextTick(updateSlider)
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    updateSlider()
  })
  window.addEventListener('resize', updateSlider)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSlider)
})
</script>



<style scoped>
/* ==================== TIẾN TRÌNH WIZARD CLICKABLE ==================== */
button.step-indicator {
  background: transparent;
  border: none;
  font-family: inherit;
}

button.step-indicator.active {
  color: var(--primary, #0284c7);
  background: var(--primary-light, rgba(2, 132, 199, 0.15));
}

button.step-indicator.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

button.step-indicator.clickable:hover {
  filter: brightness(1.2);
  transform: translateY(-1px);
}

/* ==================== SLIDER 2 OPTIONS ĐIỂM BẮT ĐẦU (RADIO GROUP GLASSMORPHIC SLIDER) ==================== */
.origin-mode-wrapper {
  margin: 6px 0 14px 0;
  display: flex;
  align-items: center;
}

.origin-mode-group {
  display: flex;
  gap: 0;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4px;
  border-radius: 25px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.25);
  position: relative;
  animation: slide-in 0.6s ease-out;
  width: 100%;
  max-width: 520px;
  height: 44px;
  box-sizing: border-box;
}

:root[data-theme="light"] .origin-mode-group {
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid rgba(203, 213, 225, 0.9);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Indicador deslizante de fondo */
.origin-mode-group .slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  background: #ffffff;
  border-radius: 25px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.12);
  z-index: 0;
}

:root[data-theme="light"] .origin-mode-group .slider {
  background: #ffffff;
  box-shadow:
    0 3px 12px rgba(15, 23, 42, 0.12),
    0 1px 4px rgba(15, 23, 42, 0.08);
}

.origin-mode-group .radio-option {
  position: relative;
  z-index: 1;
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.5s ease-out backwards;
}

.origin-mode-group .radio-option:nth-child(2) {
  animation-delay: 0.1s;
}
.origin-mode-group .radio-option:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.origin-mode-group .radio-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  margin: 0;
  left: 0;
  top: 0;
  z-index: 2;
}

.origin-mode-group .radio-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  width: 100%;
  padding: 0 16px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  border-radius: 25px;
  position: relative;
  white-space: nowrap;
}

:root[data-theme="light"] .origin-mode-group .radio-label {
  color: #475569;
}

.origin-mode-group .radio-option input[type="radio"]:checked + .radio-label {
  color: #0284c7;
  font-weight: 700;
  text-shadow: none;
}

.origin-mode-group .radio-label:hover {
  color: rgba(255, 255, 255, 0.95);
}

:root[data-theme="light"] .origin-mode-group .radio-label:hover {
  color: #0f172a;
}

/* Efecto de brillo al pasar el mouse */
.origin-mode-group .radio-label::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.origin-mode-group .radio-label:hover::before {
  opacity: 1;
}

/* Ajuste automático del slider cho 2 options */
.origin-mode-group:has(#origin-opt-manual:checked) .slider,
.origin-mode-group.is-manual .slider {
  left: 4px;
  width: calc(50% - 4px);
}

.origin-mode-group:has(#origin-opt-gps:checked) .slider,
.origin-mode-group.is-gps .slider {
  left: calc(50%);
  width: calc(50% - 4px);
}

/* Efecto de pulso en el slider */
@keyframes pulse-slider {
  0% {
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.15),
      0 1px 4px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow:
      0 5px 20px rgba(2, 132, 199, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.15);
  }
  100% {
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.15),
      0 1px 4px rgba(0, 0, 0, 0.1);
  }
}

.origin-mode-group .radio-option input[type="radio"]:checked ~ .slider {
  animation: pulse-slider 0.6s ease-out;
}

/* Brillo decorativo en el contenedor */
.origin-mode-group::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  border-radius: 50px;
  z-index: -1;
  animation: shine 3s linear infinite;
  opacity: 0;
}

.origin-mode-group .gps-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(2, 132, 199, 0.3);
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .origin-mode-group {
    max-width: 100%;
    height: 42px;
  }
  .origin-mode-group .radio-label {
    font-size: 11.5px;
    padding: 0 8px;
    gap: 5px;
  }
}

/* ==================== BỘ CHỌN TỈNH THÀNH VIÊN THUỐC TRƯỢT (RADIO GROUP SLIDER) ==================== */
.city-radio-group {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4px;
  border-radius: 999px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.16);
  position: relative;
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  animation: slide-in 0.6s ease-out;
}

:root[data-theme="light"] .city-radio-group {
  background: rgba(241, 245, 249, 0.88);
  border-color: rgba(203, 213, 225, 0.8);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.city-radio-group::-webkit-scrollbar {
  display: none;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Indicador deslizante de fondo (Slider trượt nảy theo cubic-bezier) */
.city-radio-group .slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  background: #ffffff;
  border-radius: 999px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow:
    0 3px 14px rgba(0, 0, 0, 0.22),
    0 1px 4px rgba(0, 0, 0, 0.12);
  z-index: 1;
  pointer-events: none;
}

:root[data-theme="light"] .city-radio-group .slider {
  background: #ffffff;
  box-shadow:
    0 3px 12px rgba(15, 23, 42, 0.14),
    0 1px 4px rgba(15, 23, 42, 0.08);
}

.city-radio-option {
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: fit-content;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.city-radio-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.city-radio-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
  border-radius: 999px;
  position: relative;
  white-space: nowrap;
}

:root[data-theme="light"] .city-radio-label {
  color: #475569;
}

/* Khi tùy chọn được kích hoạt (Active) */
.city-radio-option.active .city-radio-label,
.city-radio-option input[type="radio"]:checked + .city-radio-label {
  color: #0284c7;
  font-weight: 800;
  text-shadow: none;
}

:root[data-theme="light"] .city-radio-option.active .city-radio-label,
:root[data-theme="light"] .city-radio-option input[type="radio"]:checked + .city-radio-label {
  color: #0284c7;
  font-weight: 800;
}

.city-radio-label:hover {
  color: #ffffff;
}

:root[data-theme="light"] .city-radio-label:hover {
  color: #0f172a;
}

/* Hiệu ứng hào quang khi rê chuột (Shine effect) */
.city-radio-label::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  opacity: 0;
  transition: opacity 0.25s ease;
}

:root[data-theme="light"] .city-radio-label::before {
  background: rgba(15, 23, 42, 0.04);
}

.city-radio-label:hover::before {
  opacity: 1;
}

/* Hiệu ứng nhịp đập khi chọn (Pulse / Pop animation) */
.city-radio-option.active {
  animation: pill-pop 0.35s ease-out;
}

@keyframes pill-pop {
  0% { transform: scale(0.96); }
  60% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

/* Ánh sáng trang trí lướt qua viền ngoài */
.city-radio-group::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.18) 50%,
    transparent 100%
  );
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
}

/* ==================== HEADER & CỰ LY (KM) INLINE ĐỒNG BỘ GLASSMORPHISM ==================== */
.city-field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.city-field-header .field-label-text {
  margin-bottom: 0;
  font-weight: 700;
  font-size: 13.5px;
}

.route-origin-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--text-muted, #94a3b8);
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

:root[data-theme="light"] .route-origin-indicator {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.08);
  color: #64748b;
}

.route-origin-indicator strong {
  color: #38bdf8;
  font-weight: 700;
}

:root[data-theme="light"] .route-origin-indicator strong {
  color: #0284c7;
}

.roi-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
  flex-shrink: 0;
}

.city-km-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.25s ease;
  line-height: 1.2;
}

:root[data-theme="light"] .city-km-pill {
  background: rgba(15, 23, 42, 0.06);
  color: #64748b;
  border-color: rgba(15, 23, 42, 0.08);
}

.city-km-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}

/* Khi tab active (thành phố được chọn) */
.city-radio-option.active .city-km-pill,
.city-radio-option input[type="radio"]:checked + .city-radio-label .city-km-pill {
  background: rgba(2, 132, 199, 0.12);
  color: #0284c7;
  border-color: rgba(2, 132, 199, 0.25);
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.15);
}

:root[data-theme="dark"] .city-radio-option.active .city-km-pill,
:root[data-theme="dark"] .city-radio-option input[type="radio"]:checked + .city-radio-label .city-km-pill {
  background: rgba(2, 132, 199, 0.15);
  color: #0284c7;
  border-color: rgba(2, 132, 199, 0.3);
}

/* ==================== NÚT TIẾP THEO HIỆU ỨNG VŨ TRỤ (COSMIC SPACE BUTTON) ==================== */
.space-next-container {
  width: fit-content !important;
  height: fit-content !important;
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 16px !important;
  transition: all 0.4s ease !important;
  margin: 10px 0 !important;
  flex: initial !important;
}

/* Ở bước 1 khi chỉ có 1 nút: căn giữa trang trọng */
.space-next-container.is-step-1 {
  margin: 14px auto !important;
}

.space-next-container .svg {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform: translate(-50%, -50%) scale(0.25);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
}

.space-next-container:hover {
  box-shadow: 0 0 54px rgba(66, 125, 194, 0.8), 0 0 22px rgba(56, 189, 248, 0.5);
}

.space-next-container:hover > .svg {
  opacity: 1;
}

.space-next-container:hover > .svg-1 {
  transform: translate(130%, 50%) scale(1);
}

.space-next-container:hover > .svg-2 {
  transform: translate(-120%, -150%) rotate(30deg) scale(1);
}

.space-next-container:hover > .svg-3 {
  transform: translate(60%, -150%) rotate(-45deg) scale(1);
}

.space-next-container:hover > .svg-4 {
  transform: translate(-280%, 0%) rotate(30deg) scale(1);
}

.space-next-container:hover > .svg-5 {
  transform: translate(-80%, 60%) rotate(-45deg) scale(1);
}

.space-btn {
  position: relative !important;
  z-index: 10 !important;
  background-color: rgb(66, 125, 194) !important;
  color: #ffffff !important;
  padding: 0.6rem 2.2rem !important;
  font-size: 1.15rem !important;
  font-weight: bold !important;
  border-radius: 0.75rem !important;
  border: 2px solid rgba(255, 255, 255, 0.25) !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  min-width: 190px !important;
  height: 48px !important;
  box-sizing: border-box !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}

:root[data-theme="dark"] .space-btn {
  background-color: #1a2234 !important;
  border-color: rgb(66, 125, 194) !important;
}

.space-next-container:hover .space-btn {
  outline: rgb(66, 125, 194) solid 2px !important;
  outline-offset: 3px !important;
  background-color: #212121 !important;
  border-color: #60a5fa !important;
  box-shadow: 0 0 24px rgba(66, 125, 194, 0.6) !important;
  transform: translateY(-1px);
}

.space-btn:active {
  transform: scale(1.05) !important;
}

.space-btn-arrow {
  display: inline-block;
  font-size: 1.2rem;
  transition: transform 0.2s ease;
}

.space-next-container:hover .space-btn-arrow {
  transform: translateX(5px);
}

/* Tinh chỉnh nút quay lại ở bước 2 cho cân đối với nút Space */
.wizard-footer .app-secondary-btn {
  max-width: 200px !important;
}

@media (max-width: 600px) {
  .space-next-container:hover > .svg-4 {
    transform: translate(-220%, 0%) rotate(30deg) scale(0.85);
  }
  .space-next-container:hover > .svg-1 {
    transform: translate(110%, 45%) scale(0.85);
  }
  .space-btn {
    min-width: 160px !important;
    padding: 0.5rem 1.6rem !important;
    font-size: 1rem !important;
  }
}
</style>
