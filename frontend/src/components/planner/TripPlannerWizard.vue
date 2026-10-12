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

            <!-- Tiến trình Wizard -->
            <div class="wizard-progress">
              <div :class="['step-indicator', { active: currentPlannerStep >= 1 }]">1. Điểm đến</div>
              <div class="step-divider"></div>
              <div :class="['step-indicator', { active: currentPlannerStep >= 2 }]">2. Tài chính & Địa điểm</div>
              <div class="step-divider"></div>
              <div :class="['step-indicator', { active: currentPlannerStep >= 3 }]">3. Di chuyển & Lưu trú</div>
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
                v-if="currentPlannerStep > 1" 
                @click="currentPlannerStep--" 
                class="app-secondary-btn"
                :disabled="dangTao"
              >
                ← Quay lại
              </button>
              
              <button 
                v-if="currentPlannerStep < 3" 
                @click="tiepTheoWizard" 
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
</style>
