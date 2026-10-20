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

            <!-- Tiến trình Wizard (Phân biệt rõ bước đã hoàn thành, đang thực hiện và chưa tới - Yêu cầu 20) -->
            <div class="wizard-progress">
              <button
                type="button"
                :class="[
                  'step-indicator',
                  {
                    'step-completed': currentPlannerStep > 1,
                    'step-current active': currentPlannerStep === 1,
                    'clickable': currentPlannerStep > 1
                  }
                ]"
                @click="goToStep(1)"
                title="Quay lại Bước 1: Điểm đến & Thời gian"
              >
                1. Điểm đến &amp; Thời gian
              </button>
              <div class="step-divider" :class="{ completed: currentPlannerStep > 1 }"></div>
              <button
                type="button"
                :class="[
                  'step-indicator',
                  {
                    'step-completed': currentPlannerStep > 2,
                    'step-current active': currentPlannerStep === 2,
                    'step-pending': currentPlannerStep < 2,
                    'clickable': currentPlannerStep > 2
                  }
                ]"
                @click="currentPlannerStep > 2 ? goToStep(2) : null"
                title="Bước 2: Ngân sách &amp; Sở thích"
              >
                2. Ngân sách &amp; Sở thích
              </button>
              <div class="step-divider" :class="{ completed: currentPlannerStep > 2 }"></div>
              <div
                :class="[
                  'step-indicator',
                  {
                    'step-current active': currentPlannerStep === 3,
                    'step-pending': currentPlannerStep < 3
                  }
                ]"
              >
                3. Di chuyển &amp; Lưu trú
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
                  <span class="route-origin-tag">Xuất phát: <b>{{ formDuLieu.diemKhoiHanh || '?' }}</b></span>
                </div>

                <!-- SLIDER CHUYỂN ĐỔI 3 OPTIONS (THỦ CÔNG, GPS, TÔI ĐÃ Ở ĐIỂM ĐẾN) -->
                <div class="origin-mode-wrapper">
                  <div
                    class="radio-group origin-mode-group"
                    :class="{
                      'is-manual': originMethod === 'manual',
                      'is-gps': originMethod === 'gps',
                      'is-at-destination': originMethod === 'at_destination'
                    }"
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
                    <div class="radio-option">
                      <input
                        type="radio"
                        name="originOption"
                        id="origin-opt-at-destination"
                        :checked="originMethod === 'at_destination'"
                        @click="chonPhuongThucOrigin('at_destination')"
                      />
                      <label for="origin-opt-at-destination" class="radio-label">
                        <span>Tôi đã ở điểm đến</span>
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
                    Từ: <strong>{{ formDuLieu.diemKhoiHanh || '?' }}</strong>
                  </span>
                </div>

                <div class="city-selector-outer">
                  <button
                    type="button"
                    class="city-scroll-arrow left"
                    @click="scrollCityGroup(-220)"
                    title="Cuộn sang trái"
                    aria-label="Cuộn sang trái"
                  >
                    <AppIcon name="chevronleft" :size="16" />
                  </button>
                  <div
                    class="radio-group city-radio-group"
                    ref="citySelectorRef"
                    @wheel.passive="handleCityWheel"
                    @mousedown="onCityMouseDown"
                    @mousemove="onCityMouseMove"
                    @mouseup="onCityMouseUp"
                    @mouseleave="onCityMouseLeave"
                  >
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
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="city-scroll-arrow right"
                    @click="scrollCityGroup(220)"
                    title="Cuộn sang phải"
                    aria-label="Cuộn sang phải"
                  >
                    <AppIcon name="chevronright" :size="16" />
                  </button>
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
                    <span v-if="dateValidationError" class="dsb-inline-error">{{ dateValidationError }}</span>
                  </div>

                  <div class="dsb-ctrl-field">
                    <label><AppIcon name="clock" :size="15" /> Số ngày đi:</label>
                    <div class="stepper-input dsb-stepper">
                      <button type="button" @click="giamSoNgay" :disabled="formDuLieu.soNgay <= 1">-</button>
                      <span class="dsb-stepper-val">{{ formDuLieu.soNgay }} ngày</span>
                      <button type="button" @click="tangSoNgay">+</button>
                    </div>
                    <span v-if="formDuLieu.soNgay < 1" class="dsb-inline-error">Tối thiểu 1 ngày</span>
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
                      <button type="button" @click="formDuLieu.soNguoi = Math.max(1, (formDuLieu.soNguoi || 1) - 1)" :disabled="formDuLieu.soNguoi <= 1">-</button>
                      <span class="dsb-stepper-val">{{ formDuLieu.soNguoi }} người</span>
                      <button type="button" @click="formDuLieu.soNguoi = (Number(formDuLieu.soNguoi) || 0) + 1">+</button>
                    </div>
                    <span v-if="formDuLieu.soNguoi < 1" class="dsb-inline-error">Tối thiểu 1 người</span>
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
              <!-- KHUNG NHẬP NGÂN SÁCH THỦ CÔNG & PHẠM VI CHI PHÍ -->
              <div class="unified-budget-card manual-budget-card full-width">
                <div class="budget-card-top-row">
                  <div class="budget-title-wrap">
                    <label class="budget-section-label">
                      {{ formDuLieu.nganSachMode === 'per_person' ? 'Ngân sách dự kiến cho mỗi người' : 'Tổng ngân sách cho cả nhóm, toàn chuyến đi' }}
                    </label>
                    <p class="budget-calc-sub">
                      {{ formDuLieu.nganSachMode === 'per_person' 
                        ? `Tương đương tổng ngân sách cả đoàn: ${dinhDangTien(formDuLieu.nganSach)} VNĐ (${formDuLieu.soNguoi} người)`
                        : `Tương đương ~${dinhDangTien(Math.round((Number(formDuLieu.nganSach) || 0) / Math.max(1, Number(formDuLieu.soNguoi) || 1)))} VNĐ / người (${formDuLieu.soNguoi} người, ${formDuLieu.soNgay} ngày)` }}
                    </p>
                  </div>

                  <!-- BỘ CHUYỂN ĐỔI CHẾ ĐỘ NGÂN SÁCH (TOÀN NHÓM VS MỖI NGƯỜI) - KHÔNG DÙNG ICON -->
                  <div class="budget-mode-segmented-control">
                    <button
                      type="button"
                      :class="['bmsc-btn', { active: formDuLieu.nganSachMode !== 'per_person' }]"
                      @click="setBudgetMode('total')"
                    >
                      Toàn nhóm
                    </button>
                    <button
                      type="button"
                      :class="['bmsc-btn', { active: formDuLieu.nganSachMode === 'per_person' }]"
                      @click="setBudgetMode('per_person')"
                    >
                      Mỗi người
                    </button>
                  </div>
                </div>

                <div class="manual-budget-input-wrapper">
                  <input
                    type="text"
                    inputmode="numeric"
                    :value="formDuLieu.nganSachMode === 'per_person' ? formattedPerPersonBudgetDisplay : formattedBudgetDisplay"
                    @input="handleManualBudgetInput"
                    :placeholder="formDuLieu.nganSachMode === 'per_person' ? 'Nhập ngân sách cho 1 người (VNĐ)...' : 'Nhập tổng ngân sách cho cả đoàn (VNĐ)...'"
                    class="manual-budget-input"
                  />
                  <span class="mbi-currency">VNĐ</span>
                </div>

                <!-- CÂU HỎI PHẠM VI NGÂN SÁCH (CÓ BAO GỒM VÉ ĐI LẠI VÀ KHÁCH SẠN HAY CHƯA) -->
                <div class="budget-scope-section">
                  <span class="bss-title">Phạm vi ngân sách dự kiến bao gồm:</span>
                  <div class="bss-checkboxes-row">
                    <label class="bss-checkbox-label">
                      <input
                        type="checkbox"
                        v-model="formDuLieu.nganSachBaoGomDiChuyen"
                        class="bss-checkbox"
                      />
                      <span>Bao gồm vé xe / tàu / máy bay khứ hồi</span>
                    </label>
                    <label class="bss-checkbox-label">
                      <input
                        type="checkbox"
                        v-model="formDuLieu.nganSachBaoGomKhachSan"
                        class="bss-checkbox"
                      />
                      <span>Bao gồm tiền phòng khách sạn / nơi lưu trú</span>
                    </label>
                  </div>
                </div>

                <!-- TÌNH TRẠNG CHỖ NGHỈ: TÁCH Ở MIỄN PHÍ VỚI ĐÃ ĐẶT CHỖ (NHẬP CHI PHÍ ĐÃ TRẢ) -->
                <div class="accommodation-status-section">
                  <span class="ass-title">Tùy chọn chỗ nghỉ:</span>
                  <div class="ass-options-grid">
                    <label :class="['ass-card', { active: formDuLieu.hotelStayType === 'need_booking' }]">
                      <input
                        type="radio"
                        v-model="formDuLieu.hotelStayType"
                        value="need_booking"
                        @change="onStayTypeChange('need_booking')"
                      />
                      <div class="ass-card-text">
                        <strong>Cần gợi ý nơi ở</strong>
                        <small>AI sẽ gợi ý phòng khách sạn phù hợp với ngân sách</small>
                      </div>
                    </label>

                    <label :class="['ass-card', { active: formDuLieu.hotelStayType === 'free' }]">
                      <input
                        type="radio"
                        v-model="formDuLieu.hotelStayType"
                        value="free"
                        @change="onStayTypeChange('free')"
                      />
                      <div class="ass-card-text">
                        <strong>Ở miễn phí (0đ)</strong>
                        <small>Ở nhà người thân, bạn bè hoặc cắm trại tự túc</small>
                      </div>
                    </label>

                    <label :class="['ass-card', { active: formDuLieu.hotelStayType === 'prebooked' }]">
                      <input
                        type="radio"
                        v-model="formDuLieu.hotelStayType"
                        value="prebooked"
                        @change="onStayTypeChange('prebooked')"
                      />
                      <div class="ass-card-text">
                        <strong>Đã đặt chỗ trước</strong>
                        <small>Đã đặt phòng riêng — nhập chi phí đã trả</small>
                      </div>
                    </label>
                  </div>

                  <!-- Ô NHẬP CHI PHÍ ĐÃ TRẢ TRƯỚC KHI ĐÃ ĐẶT CHỖ -->
                  <div v-if="formDuLieu.hotelStayType === 'prebooked'" class="prebooked-cost-container">
                    <label class="pcc-label">Chi phí nơi ở đã thanh toán trước:</label>
                    <div class="pcc-input-wrap">
                      <input
                        type="text"
                        inputmode="numeric"
                        :value="formattedPrebookedCostDisplay"
                        @input="handlePrebookedCostInput"
                        placeholder="Nhập số tiền đã trả trước (VNĐ)..."
                        class="pcc-input"
                      />
                      <span class="pcc-currency">VNĐ</span>
                    </div>
                    <small class="pcc-hint">Khoản chi phí này được tính vào tổng tài chính và không trừ vào tiền ăn uống, vé tham quan hàng ngày.</small>
                  </div>
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
              </div>

              <!-- PHẦN HỎI SỞ THÍCH VÀ NHỊP ĐỘ Ở MỨC VỪA ĐỦ (YÊU CẦU 18 - NO ICON) -->
              <div class="user-preferences-card full-width" style="margin-top: 16px;">
                <div class="upc-header">
                  <span class="upc-kicker">CÁ NHÂN HÓA TRẢI NGHIỆM</span>
                  <h4>Sở thích &amp; Nhịp độ chuyến đi</h4>
                  <p class="upc-subtitle">Chọn nhanh phong cách để AI đề xuất các điểm đến và thời gian lưu lại phù hợp nhất với bạn.</p>
                </div>

                <!-- 1. CHỌN SỞ THÍCH (5 LỰA CHỌN TRỌNG TÂM - NO ICON) -->
                <div class="preference-group">
                  <label class="preference-group-label">Sở thích trọng tâm (Chọn một hoặc nhiều):</label>
                  <div class="interest-chips-grid">
                    <button
                      v-for="item in interestOptions"
                      :key="item.id"
                      type="button"
                      :class="['interest-chip-btn', { active: isInterestActive(item.id) }]"
                      @click="toggleInterest(item.id)"
                    >
                      <span class="icb-title">{{ item.name }}</span>
                      <small class="icb-desc">{{ item.desc }}</small>
                    </button>
                  </div>
                </div>

                <!-- 2. CHỌN NHỊP ĐỘ CHUYẾN ĐI (2 LỰA CHỌN - NO ICON) -->
                <div class="preference-group" style="margin-top: 18px;">
                  <label class="preference-group-label">Nhịp độ chuyến đi:</label>
                  <div class="pace-options-grid">
                    <label
                      :class="['pace-card', { active: formDuLieu.nhipDo === 'thong_tha' }]"
                      @click="formDuLieu.nhipDo = 'thong_tha'"
                    >
                      <input
                        type="radio"
                        name="paceOption"
                        value="thong_tha"
                        :checked="formDuLieu.nhipDo === 'thong_tha'"
                      />
                      <div class="pace-card-info">
                        <strong>Thong thả (Nghỉ dưỡng nhẹ nhàng)</strong>
                        <p>2 - 3 điểm/ngày. Dành nhiều thời gian thư giãn tại bãi biển, cafe và khách sạn. Không phải di chuyển vội vã.</p>
                      </div>
                    </label>

                    <label
                      :class="['pace-card', { active: formDuLieu.nhipDo === 'kham_pha' }]"
                      @click="formDuLieu.nhipDo = 'kham_pha'"
                    >
                      <input
                        type="radio"
                        name="paceOption"
                        value="kham_pha"
                        :checked="formDuLieu.nhipDo === 'kham_pha'"
                      />
                      <div class="pace-card-info">
                        <strong>Khám phá nhiều (Năng động)</strong>
                        <p>4 - 5 điểm/ngày. Tối ưu thời gian và cung đường để trải nghiệm tối đa các danh lam thắng cảnh và ẩm thực.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- 3. RÀNG BUỘC KHÁC ĐỂ TÙY CHỌN (COLLAPSIBLE ACCORDION - NO ICON) -->
                <div class="extra-constraints-accordion" style="margin-top: 18px;">
                  <button
                    type="button"
                    class="extra-constraints-toggle"
                    @click="hienRangBuocTuyChon = !hienRangBuocTuyChon"
                  >
                    <span>Ràng buộc &amp; Nhu cầu đặc biệt (Tùy chọn)</span>
                    <span class="accordion-arrow">{{ hienRangBuocTuyChon ? '▲ Thu gọn' : '▼ Mở rộng' }}</span>
                  </button>

                  <div v-show="hienRangBuocTuyChon" class="extra-constraints-content">
                    <div class="constraint-checkboxes-grid" v-if="formDuLieu.rangBuoc">
                      <label class="constraint-checkbox-item">
                        <input
                          type="checkbox"
                          v-model="formDuLieu.rangBuoc.anChay"
                        />
                        <div class="cci-text">
                          <strong>Ẩm thực chay / Thanh đạm</strong>
                          <small>Ưu tiên nhà hàng chay hoặc món ăn thanh đạm</small>
                        </div>
                      </label>

                      <label class="constraint-checkbox-item">
                        <input
                          type="checkbox"
                          v-model="formDuLieu.rangBuoc.nguoiLonTuoi"
                        />
                        <div class="cci-text">
                          <strong>Đi cùng người lớn tuổi</strong>
                          <small>Hạn chế leo dốc bậc thang cao, ưu tiên điểm bằng phẳng</small>
                        </div>
                      </label>

                      <label class="constraint-checkbox-item">
                        <input
                          type="checkbox"
                          v-model="formDuLieu.rangBuoc.coTreNho"
                        />
                        <div class="cci-text">
                          <strong>Đi cùng trẻ nhỏ</strong>
                          <small>Ưu tiên khu vui chơi an toàn, di chuyển gần</small>
                        </div>
                      </label>

                      <label class="constraint-checkbox-item">
                        <input
                          type="checkbox"
                          v-model="formDuLieu.rangBuoc.khongGianYenTinh"
                        />
                        <div class="cci-text">
                          <strong>Ưu tiên không gian yên tĩnh</strong>
                          <small>Tránh các điểm tụ tập quá đông đúc, ồn ào</small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- GỢI Ý ĐỊA PHƯƠNG TỐI GIẢN DIỆN TÍCH (YÊU CẦU 3: CHỈ GIỮ THANH TRƯỢT VIÊN THUỐC VÀ 1 THANH NHẬP ĐỊA ĐIỂM CÓ AUTOCOMPLETE DROPDOWN KHI GÕ) -->
              <div class="places-picker-box full-width" style="margin-top: 16px;">
                <div class="picker-top">
                  <div>
                    <h4>Nhập địa điểm muốn đến (Không bắt buộc)</h4>
                    <small class="picker-subtitle">Chưa biết đi đâu? Bạn có thể bỏ trống để AI tự động chọn lọc theo thời gian &amp; ngân sách.</small>
                  </div>
                  <div class="picker-top-actions">
                    <button
                      type="button"
                      :class="['btn-assistant-suggest', { active: assistantAutoSuggestMode && !selectedPlaces.length }]"
                      @click="deTroLyDeXuat"
                    >
                      Để trợ lý đề xuất
                    </button>
                    <span v-if="selectedPlaces.length" class="badge-selected-count">
                      Đã chọn {{ selectedPlaces.length }} điểm
                    </span>
                  </div>
                </div>

                <!-- BANNER TRỢ LÝ ĐỀ XUẤT (KHÔNG DÙNG ICON) -->
                <div v-if="assistantAutoSuggestMode && !selectedPlaces.length" class="assistant-suggest-active-card">
                  <div class="asac-content">
                    <strong>Chế độ trợ lý đề xuất đang bật:</strong>
                    <span>Hệ thống sẽ tự động tổng hợp những địa danh đặc sắc nhất tại {{ formDuLieu.diemDen }} phù hợp với chuyến đi {{ formDuLieu.soNgay }} ngày {{ formDuLieu.soDem }} đêm.</span>
                  </div>
                  <button type="button" class="asac-cancel-btn" @click="assistantAutoSuggestMode = false">
                    Tự chọn điểm
                  </button>
                </div>



                <!-- THANH NHẬP ĐỊA ĐIỂM MUỐN ĐẾN VỚI GỢI Ý DROPDOWN HIỆN BÊN DƯỚI KHI GÕ (TỐI GIẢN DIỆN TÍCH) -->
                <div class="place-autocomplete-container" ref="autocompleteContainerRef">
                  <div class="place-picker-search-bar compact-autocomplete-bar">
                    <span class="pps-icon"><AppIcon name="search" size="16" /></span>
                    <input
                      type="text"
                      v-model="placeSearchQuery"
                      @focus="onPlaceInputFocus"
                      @input="onPlaceInputChange"
                      @keydown.enter.prevent="onEnterSelectFirstOrCustom"
                      placeholder="Nhập địa điểm muốn đến..."
                      class="pps-input"
                      autocomplete="off"
                    />
                    <button
                      v-if="placeSearchQuery"
                      type="button"
                      class="pps-clear-btn"
                      @click="clearPlaceSearch"
                      title="Xóa tìm kiếm"
                    >
                      <AppIcon name="x" size="14" />
                    </button>
                    <button
                      type="button"
                      class="pps-add-action-btn"
                      @click="onEnterSelectFirstOrCustom"
                      :disabled="!placeSearchQuery.trim()"
                    >
                      <AppIcon name="plus" size="14" /> Thêm
                    </button>
                  </div>

                  <!-- DROPDOWN GỢI Ý ĐỊA ĐIỂM HIỆN RA BÊN DƯỚI KHI GÕ (VD: GÕ "đ" -> HIỆN ĐỒI CỪU, ĐỒN MANG CÁ...) -->
                  <transition name="dropdown-fade">
                    <div
                      v-if="showSuggestions && placeSearchQuery.trim()"
                      class="place-suggestions-dropdown"
                    >
                      <div class="psd-header">
                        <small>GỢI Ý ĐỊA ĐIỂM PHÙ HỢP ({{ filteredSuggestions.length }} kết quả):</small>
                      </div>

                      <div class="psd-list" v-if="filteredSuggestions.length > 0">
                        <div
                          v-for="item in filteredSuggestions"
                          :key="item.name"
                          class="psd-item"
                          :class="{ selected: isPlaceSelected(item.name) }"
                          @mousedown.prevent="handleSelectSuggestion(item)"
                        >
                          <span class="psd-item-icon">
                            <AppIcon :name="getPlaceCategoryIcon(item.type)" :size="16" />
                          </span>
                          <div class="psd-item-info">
                            <div class="psd-item-name-row">
                              <strong class="psd-item-name">{{ item.name }}</strong>
                              <span class="psd-item-city" v-if="item.city">{{ item.city }}</span>
                            </div>
                            <span class="psd-item-sub">
                              {{ getPlaceCategoryLabel(item.type) }}
                              <template v-if="item.rating"> • ⭐ {{ item.rating }}</template>
                              <template v-if="item.address"> • {{ item.address }}</template>
                            </span>
                          </div>
                          <button
                            type="button"
                            class="psd-item-btn"
                            :class="{ active: isPlaceSelected(item.name) }"
                            @click.stop="togglePlaceSelection(item.name)"
                          >
                            <AppIcon :name="isPlaceSelected(item.name) ? 'check' : 'plus'" :size="13" />
                            <span>{{ isPlaceSelected(item.name) ? 'Đã chọn' : 'Chọn' }}</span>
                          </button>
                        </div>
                      </div>

                      <!-- KHI KHÔNG CÓ KẾT QUẢ HOẶC MUỐN TỰ NHẬP ĐỊA ĐIỂM MỚI -->
                      <div
                        class="psd-custom-add"
                        @mousedown.prevent="handleAddCustomFromQuery"
                      >
                        <span class="psd-custom-icon"><AppIcon name="plus" :size="15" /></span>
                        <div class="psd-custom-text">
                          <span>Thêm địa điểm tự nhập:</span>
                          <strong>"{{ placeSearchQuery.trim() }}"</strong>
                        </div>
                        <span class="psd-custom-badge">Tự nhập ↵</span>
                      </div>
                    </div>
                  </transition>
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

                <!-- Thông báo AI Crawler (nếu có) -->
                <div v-if="thongBaoCrawl" class="crawl-alert-banner">
                  <span>{{ thongBaoCrawl }}</span>
                </div>
              </div>

              <!-- THANH TẠO BẢN NHÁP NHANH (BỎ QUA CHỌN PHƯƠNG TIỆN & KHÁCH SẠN NẾU MUỐN XEM LỊCH TRÌNH NGAY) -->
              <div class="step2-quick-draft-bar full-width">
                <div class="sqd-content">
                  <div class="sqd-text">
                    <strong>Sẵn sàng lên lịch trình</strong>
                    <p>Bạn có thể tạo ngay bản nháp lịch trình hoàn chỉnh để xem trước. Nơi ở và phương tiện có thể bổ sung hoặc điều chỉnh bất kỳ lúc nào.</p>
                  </div>
                  <div class="sqd-actions">
                    <button
                      type="button"
                      class="sqd-btn-primary"
                      @click="taoLichTrinh"
                      :disabled="dangTao || (!tripFeasibility.feasible && !formDuLieu.freePlacesOnly)"
                    >
                      Tạo bản nháp lịch trình ngay
                    </button>
                    <button
                      type="button"
                      class="sqd-btn-secondary"
                      @click="tiepTheoWizard"
                      :disabled="dangTao"
                    >
                      Tùy chọn: Chọn trước nơi ở &amp; xe (Bước 3) →
                    </button>
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
                  @click="switchStep3Subtab('transit')"
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
                  @click="switchStep3Subtab('hotel')"
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

              <!-- PHẦN 1: PHƯƠNG TIỆN & VÉ XE -->
              <div v-show="step3ActiveSubtab === 'transit'" class="transit-subtab-pane">
                <div class="bus-optimization-section full-width" style="margin-top: 0;">
                  <div class="bos-header">
                    <div>
                      <span class="bos-kicker"><AppIcon name="bus" :size="16" /> TỐI ƯU CHI PHÍ & LỰA CHỌN PHƯƠNG TIỆN</span>
                      <h3>Phương tiện di chuyển tuyến {{ formDuLieu.diemKhoiHanh || 'Điểm đi' }} ➔ {{ formDuLieu.diemDen }}</h3>
                    </div>
                    <div class="bos-badges-group">
                      <span class="bos-dist-badge">Cự ly: ~{{ transitRouteInfo.estimatedDistanceKm || transitRouteInfo.distanceKm || (formDuLieu.daODiemDen ? 15 : getEstimatedDistance(formDuLieu.diemKhoiHanh, formDuLieu.diemDen)) }} km</span>
                    </div>
                  </div>

                  <!-- BỘ CHỌN PHƯƠNG TIỆN UIVERSE RADIO TILES (4 LỰA CHỌN CÓ LỌC TỈNH THÀNH) -->
                  <div class="transport-uiverse-selector-wrapper">
                    <div class="radio-inputs">
                      <label v-for="t in availableTransports" :key="t.id" :title="t.subtitle">
                        <input
                          class="radio-input"
                          type="radio"
                          name="transport_engine_choice"
                          :value="t.id"
                          :checked="selectedTransportId === t.id"
                          @change="onSelectTransportMode(t.id)"
                        />
                        <span class="radio-tile">
                          <span class="radio-icon">
                            <!-- Icon Tự túc: Xe máy / Motorbike -->
                            <svg v-if="t.id === 'tu_tuc'" class="r-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.44 13c-.22 0-.45.02-.67.06l-1.92-3.84c-.45-.91-1.37-1.48-2.38-1.48h-2.14l-.84-2.1c-.24-.61-.83-1.01-1.49-1.01H7.5c-.83 0-1.5.67-1.5 1.5S6.67 7.63 7.5 7.63h1.83l.6 1.5H5.8c-.89 0-1.67.58-1.92 1.44l-1.8 6.07C2.03 16.8 2 17 2 17.22 2 19.31 3.69 21 5.78 21c1.92 0 3.51-1.43 3.75-3.32l2.67-.67 1.55 3.1c.42.84 1.28 1.38 2.22 1.39h.03c1.9 0 3.5-1.48 3.68-3.38.18-1.92-1.2-3.62-3.12-3.82l-.4-.04.42-.84h2.86c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z M5.78 19c-.99 0-1.78-.8-1.78-1.78 0-.25.05-.48.15-.69l1.45-4.88c.11-.38.46-.65.85-.65h3.08l-1.24 3.1c-.48.06-.94.22-1.35.45l-.47-1.17c-.16-.4-.6-.61-1.01-.46-.4.16-.61.6-.46 1.01l.73 1.83c-.58.82-.95 1.8-1 2.84zm11.38-.41c-.13 1.05-1.03 1.88-2.1 1.88-.02 0-.04 0-.06 0-.58 0-1.11-.25-1.48-.68l-1.38-2.76 2.58-.65c.98-.24 1.77-.94 2.14-1.87.24.49.36 1.04.36 1.6 0 .86-.06 1.68-.06 2.48z"/>
                            </svg>
                            <!-- Icon Xe khách: Bus / Limousine -->
                            <svg v-else-if="t.id === 'xe_khach'" class="r-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                            </svg>
                            <!-- Icon Tàu hỏa: Train / Đường sắt -->
                            <svg v-else-if="t.id === 'tau_hoa'" class="r-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm4.5-7H6V6h6v4zm4.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-7h-4.5V6H18v4z"/>
                            </svg>
                            <!-- Icon Máy bay: Plane / Hàng không -->
                            <svg v-else-if="t.id === 'may_bay'" class="r-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                            </svg>
                          </span>
                          <span class="radio-label">{{ t.name }}</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <!-- GỢI Ý KHI CHƯA CHỌN PHƯƠNG TIỆN NÀO (KHÔNG AUTO CHỌN) -->
                  <div v-if="!selectedTransportId" class="no-transport-hint-card">
                    <div class="nthc-icon">
                      <AppIcon name="navigation" :size="26" />
                    </div>
                    <div class="nthc-info">
                      <h4>Vui lòng chọn 1 phương tiện di chuyển phía trên</h4>
                      <p>Bấm chọn <strong>Tự túc, Xe khách, Tàu hỏa</strong> hoặc <strong>Máy bay</strong> để hiển thị thông tin bảng giá vé & cung đường.</p>
                    </div>
                  </div>

                  <!-- TAB 0: Tự túc phương tiện (Xe máy / Ô tô riêng) -->
                  <div v-show="selectedTransportId === 'tu_tuc'" class="tu-tuc-panel-box">
                    <div class="tu-tuc-card">
                      <div class="ttc-header">
                        <div class="ttc-icon-badge">
                          <svg class="r-icon-svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                            <path d="M19.44 13c-.22 0-.45.02-.67.06l-1.92-3.84c-.45-.91-1.37-1.48-2.38-1.48h-2.14l-.84-2.1c-.24-.61-.83-1.01-1.49-1.01H7.5c-.83 0-1.5.67-1.5 1.5S6.67 7.63 7.5 7.63h1.83l.6 1.5H5.8c-.89 0-1.67.58-1.92 1.44l-1.8 6.07C2.03 16.8 2 17 2 17.22 2 19.31 3.69 21 5.78 21c1.92 0 3.51-1.43 3.75-3.32l2.67-.67 1.55 3.1c.42.84 1.28 1.38 2.22 1.39h.03c1.9 0 3.5-1.48 3.68-3.38.18-1.92-1.2-3.62-3.12-3.82l-.4-.04.42-.84h2.86c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z M5.78 19c-.99 0-1.78-.8-1.78-1.78 0-.25.05-.48.15-.69l1.45-4.88c.11-.38.46-.65.85-.65h3.08l-1.24 3.1c-.48.06-.94.22-1.35.45l-.47-1.17c-.16-.4-.6-.61-1.01-.46-.4.16-.61.6-.46 1.01l.73 1.83c-.58.82-.95 1.8-1 2.84zm11.38-.41c-.13 1.05-1.03 1.88-2.1 1.88-.02 0-.04 0-.06 0-.58 0-1.11-.25-1.48-.68l-1.38-2.76 2.58-.65c.98-.24 1.77-.94 2.14-1.87.24.49.36 1.04.36 1.6 0 .86-.06 1.68-.06 2.48z"/>
                          </svg>
                        </div>
                        <div>
                          <h4>Tự túc phương tiện di chuyển (Xe máy / Ô tô cá nhân / Tự mua vé)</h4>
                          <p class="ttc-sub">Chủ động 100% thời gian, tự do check-in các cung đường biển & thắng cảnh ven đường</p>
                        </div>
                      </div>

                      <div class="ttc-metrics-grid">
                        <div class="ttc-metric">
                          <span class="ttc-metric-lbl"><AppIcon name="ticket" :size="14" /> Chi phí vé liên tỉnh:</span>
                          <strong class="ttc-metric-val free">0đ (Tiết kiệm 100%)</strong>
                        </div>
                        <div class="ttc-metric">
                          <span class="ttc-metric-lbl"><AppIcon name="navigation" :size="14" /> Cự ly quãng đường:</span>
                          <strong class="ttc-metric-val">~{{ transitRouteInfo.estimatedDistanceKm || transitRouteInfo.distanceKm || (formDuLieu.daODiemDen ? 15 : getEstimatedDistance(formDuLieu.diemKhoiHanh, formDuLieu.diemDen)) }} km</strong>
                        </div>
                        <div class="ttc-metric">
                          <span class="ttc-metric-lbl"><AppIcon name="clock" :size="14" /> Thời gian ước tính:</span>
                          <strong class="ttc-metric-val">~{{ Math.max(1, Math.round((transitRouteInfo.estimatedDistanceKm || (formDuLieu.daODiemDen ? 15 : getEstimatedDistance(formDuLieu.diemKhoiHanh, formDuLieu.diemDen))) / 45)) }} giờ chạy xe</strong>
                        </div>
                      </div>

                      <div class="ttc-notes">
                        <div class="ttc-note-item">
                          <AppIcon name="sparkles" :size="15" color="#10b981" />
                          <span>Hệ thống <b>không tính vé xe vào ngân sách</b>, dành trọn vẹn chi phí cho trải nghiệm ẩm thực và khách sạn!</span>
                        </div>
                        <div class="ttc-note-item">
                          <AppIcon name="info" :size="15" color="#38bdf8" />
                          <span>Khuyên dùng kiểm tra lốp, phanh xe và mang theo giấy tờ hợp lệ trước khi khởi hành qua các cung đèo dốc miền Trung.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TAB 1: Danh sách gợi ý nhà xe giá rẻ -->
                  <div v-show="selectedTransportId === 'xe_khach'" class="bus-operators-box">
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
                  <div v-show="selectedTransportId === 'tau_hoa'" class="train-operators-box">
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

                  <!-- TAB 3: Danh sách chuyến bay nội địa -->
                  <div v-show="selectedTransportId === 'may_bay'" class="flight-operators-box">
                    <div class="bob-title-row">
                      <h4>Chuyến bay nội địa thẳng tới {{ formDuLieu.diemDen }}</h4>
                      <small>Tiết kiệm tối đa thời gian di chuyển, chỉ mất 1h15 - 1h30 bay để bắt đầu kỳ nghỉ</small>
                    </div>

                    <div class="bus-operators-grid">
                      <div
                        v-for="flight in flightOperators"
                        :key="flight.id"
                        :class="['bus-item-card flight-card', { selected: formDuLieu.chuyenBayDaChon && formDuLieu.chuyenBayDaChon.id === flight.id }]"
                      >
                        <div class="bic-header">
                          <div>
                            <div class="bic-name-row">
                              <span class="bic-name">{{ flight.name }}</span>
                              <span class="bic-tag flight-tag" v-if="flight.badge">{{ flight.badge }}</span>
                            </div>
                            <span class="bic-type">{{ flight.type }}</span>
                          </div>
                          <div class="bic-rating">
                            <AppIcon name="star" :size="13" filled color="#f59e0b" /> {{ flight.rating }} <small>({{ flight.airline_code }})</small>
                          </div>
                        </div>

                        <div class="bic-specs">
                          <div class="bic-spec">
                            <span><AppIcon name="clock" :size="13" /> Thời gian bay:</span>
                            <b>{{ flight.duration }}</b>
                          </div>
                          <div class="bic-spec-times">
                            <span class="bst-label"><AppIcon name="clock" :size="13" /> Giờ bay tham khảo:</span>
                            <div class="bst-chips">
                              <button
                                type="button"
                                v-for="timeStr in (flight.depart_times ? flight.depart_times.split(',') : [])"
                                :key="timeStr"
                                :class="['bst-chip flight-time-chip', { active: formDuLieu.chuyenBayDaChon && formDuLieu.chuyenBayDaChon.id === flight.id && formDuLieu.gioXuatPhatChon === timeStr.trim() }]"
                                @click="chonGioXuatPhatChuyenBayLocal(flight, timeStr.trim())"
                              >
                                {{ timeStr.trim() }}
                              </button>
                            </div>
                          </div>
                          <div class="bic-spec bic-spec-points">
                            <div class="bsp-item">
                              <span class="bsp-label"><AppIcon name="plane" :size="13" /> Sân bay đi:</span>
                              <span class="bsp-val">{{ flight.depart_airport }}</span>
                            </div>
                            <div class="bsp-item">
                              <span class="bsp-label"><AppIcon name="flag" :size="13" /> Sân bay đến:</span>
                              <span class="bsp-val">{{ flight.arrive_airport }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="bic-footer-clean">
                          <!-- Giá vé máy bay -->
                          <div class="bic-price-line">
                            <div class="bpl-left">
                              <span class="bpl-label">Giá vé ước tính:</span>
                              <strong class="bpl-unit flight-price-color">{{ dinhDangTien(flight.price) }}đ</strong>
                              <small class="bpl-sub">/người</small>
                            </div>
                            <div class="bpl-right" v-if="formDuLieu.soNguoi > 1">
                              <span class="bpl-total-badge flight-total-badge">
                                Tổng {{ formDuLieu.soNguoi }} vé: <b>{{ dinhDangTien(flight.price * formDuLieu.soNguoi) }}đ</b>
                              </span>
                            </div>
                          </div>

                          <!-- Hai nút hành động -->
                          <div class="bic-actions-row">
                            <a :href="flight.booking_url" target="_blank" rel="noopener noreferrer" class="bic-action-call flight-call" title="Đặt vé trực tiếp tại hãng">
                              <AppIcon name="ticket" :size="14" /> Đặt tại {{ flight.airline_short }} ↗
                            </a>
                            <button
                              type="button"
                              :class="['bic-action-select flight-select-btn', { active: formDuLieu.chuyenBayDaChon && formDuLieu.chuyenBayDaChon.id === flight.id }]"
                              @click="chonChuyenBayLocal(flight)"
                            >
                              <AppIcon v-if="formDuLieu.chuyenBayDaChon && formDuLieu.chuyenBayDaChon.id === flight.id" name="check" :size="14" />
                              {{ formDuLieu.chuyenBayDaChon && formDuLieu.chuyenBayDaChon.id === flight.id ? (formDuLieu.gioXuatPhatChon ? 'Đã chọn (' + formDuLieu.gioXuatPhatChon + ')' : 'Đã chọn vé') : 'Chọn chuyến bay này' }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- BỘ CHỌN PHƯƠNG TIỆN NỘI THÀNH TẠI ĐIỂM ĐẾN (YÊU CẦU 17 - TÁCH RÕ 3 CHẶNG - NO ICON) -->
                <div class="local-transport-selector-card full-width" style="margin-top: 24px;">
                  <div class="ltsc-header">
                    <div>
                      <span class="ltsc-kicker">CHẶNG 2: DI CHUYỂN TẠI ĐIỂM ĐẾN</span>
                      <h4>Phương tiện đi lại nội thành {{ formDuLieu.diemDen }}</h4>
                      <p class="ltsc-desc">Hệ thống phân biệt rõ: Chiều đi liên tỉnh, Di chuyển tại điểm đến và Chiều về. Chọn xe khách liên tỉnh không khiến các chặng trong thành phố mặc định dùng xe khách.</p>
                    </div>
                    <span class="ltsc-mode-tag">
                      Đang chọn: {{ formDuLieu.phuongTienNoiThanh === 'taxi' ? 'Taxi / Grab' : (formDuLieu.phuongTienNoiThanh === 'xe_rieng' ? 'Xe cá nhân tự lái' : 'Thuê xe máy') }}
                    </span>
                  </div>

                  <div class="local-transport-grid">
                    <label :class="['local-trans-card', { active: formDuLieu.phuongTienNoiThanh === 'xe_may' }]">
                      <input
                        type="radio"
                        name="localTransportMode"
                        value="xe_may"
                        v-model="formDuLieu.phuongTienNoiThanh"
                      />
                      <div class="ltc-body">
                        <strong>Thuê xe máy (~120.000đ/ngày)</strong>
                        <p>Chủ động ngắm cảnh, luồn lách phố nhỏ, chi phí tiết kiệm tối đa cho cá nhân và cặp đôi.</p>
                      </div>
                    </label>

                    <label :class="['local-trans-card', { active: formDuLieu.phuongTienNoiThanh === 'taxi' }]">
                      <input
                        type="radio"
                        name="localTransportMode"
                        value="taxi"
                        v-model="formDuLieu.phuongTienNoiThanh"
                      />
                      <div class="ltc-body">
                        <strong>Taxi / Xe công nghệ Grab (~15.000đ/km)</strong>
                        <p>Có máy lạnh, an toàn, không lo nắng mưa, thoải mái cho gia đình có người lớn tuổi hoặc trẻ nhỏ.</p>
                      </div>
                    </label>

                    <label :class="['local-trans-card', { active: formDuLieu.phuongTienNoiThanh === 'xe_rieng' }]">
                      <input
                        type="radio"
                        name="localTransportMode"
                        value="xe_rieng"
                        v-model="formDuLieu.phuongTienNoiThanh"
                      />
                      <div class="ltc-body">
                        <strong>Xe cá nhân tự lái (0đ thuê)</strong>
                        <p>Tự túc xe máy hoặc ô tô riêng mang theo. Chi phí thuê 0đ, chỉ tính tiền nhiên liệu di chuyển thực tế.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- PHẦN 2: CHỌN KHÁCH SẠN VÀ XEM PHÒNG (GIAO DIỆN HÌNH 3, 4, 5 - YÊU CẦU 3) -->
              <div v-show="step3ActiveSubtab === 'hotel'" class="hotel-subtab-pane">

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
                        @click="setHotelSort('default')"
                      >
                        Khuyên dùng
                      </button>
                      <button
                        type="button"
                        :class="['hst-btn', { active: hotelSortBy === 'price_asc' }]"
                        @click="setHotelSort('price_asc')"
                      >
                        Giá tăng dần ↑
                      </button>
                      <button
                        type="button"
                        :class="['hst-btn', { active: hotelSortBy === 'price_desc' }]"
                        @click="setHotelSort('price_desc')"
                      >
                        Giá giảm dần ↓
                      </button>
                      <button
                        type="button"
                        :class="['hst-btn', { active: hotelSortBy === 'rating_desc' }]"
                        @click="setHotelSort('rating_desc')"
                      >
                        Đánh giá cao ★
                      </button>
                    </div>

                    <div class="hst-group hst-stars-group">
                      <span class="hst-label">Hạng sao:</span>
                      <button
                        type="button"
                        :class="['hst-star-btn', { active: hotelStarFilter === 'all' }]"
                        @click="setHotelStars('all')"
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        :class="['hst-star-btn', { active: hotelStarFilter === '5' }]"
                        @click="setHotelStars('5')"
                      >
                        5★
                      </button>
                      <button
                        type="button"
                        :class="['hst-star-btn', { active: hotelStarFilter === '4' }]"
                        @click="setHotelStars('4')"
                      >
                        4★
                      </button>
                      <button
                        type="button"
                        :class="['hst-star-btn', { active: hotelStarFilter === '3' }]"
                        @click="setHotelStars('3')"
                      >
                        3★
                      </button>
                    </div>
                  </div>

                  <!-- BANNER TÓM TẮT ĐỀ XUẤT KHÁCH SẠN TINH GỌN (YÊU CẦU 19 - NO ICON) -->
                  <div class="curated-hotel-intro-card">
                    <div class="chic-content">
                      <strong>Khách sạn đề xuất tối ưu theo ngân sách &amp; địa điểm:</strong>
                      <span>Hệ thống chọn lọc trước <strong>{{ displayedHotels.length }} nơi lưu trú phù hợp nhất</strong> cho ngân sách {{ dinhDangTien(formDuLieu.nganSach) }}đ và đoàn {{ formDuLieu.soNguoi }} khách (cần {{ soPhongCan }} phòng). Bạn có thể chọn ngay hoặc bấm "Xem thêm" để duyệt toàn bộ danh sách.</span>
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
                        <img
                          :src="hotel.image || '/images/slides/danang-cauvang.jpg'"
                          :alt="hotel.name"
                          class="hcc-image"
                          loading="lazy"
                          @error="(e) => { e.target.src = '/images/slides/danang-cauvang.jpg' }"
                        />
                        <span class="hcc-dest-badge">{{ hotel.destination }}</span>
                        <span v-if="formDuLieu.khachSanDaChon?.id === hotel.id && !formDuLieu.tuTucKhachSan" class="hcc-selected-tag">✓ Đang chọn</span>
                      </div>
                      <div class="hcc-content">
                        <!-- Lý do đề xuất ngắn gọn (Yêu cầu 19 - NO ICON) -->
                        <div v-if="hotel.recommendation_reason" class="hcc-curated-badge">
                          <span>{{ hotel.recommendation_reason }}</span>
                        </div>
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

                  <!-- CHỨC NĂNG THU GỌN VÀ XEM THÊM KHÁCH SẠN (YÊU CẦU 5 & 19) -->
                  <div v-if="filteredSortedHotels.length > 4" class="hotel-pagination-actions">
                    <button
                      v-if="hotelDisplayLimit < filteredSortedHotels.length"
                      type="button"
                      class="hpa-btn hpa-btn-more"
                      @click="xemThemKhachSan"
                    >
                      Xem thêm (+{{ Math.min(8, filteredSortedHotels.length - hotelDisplayLimit) }} khách sạn khác)
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
                      v-if="hotelDisplayLimit > 4"
                      type="button"
                      class="hpa-btn hpa-btn-collapse"
                      @click="thuGonKhachSan"
                    >
                      Thu gọn về 4 khách sạn khuyên dùng
                    </button>
                  </div>
                </div>
              </div>

              <!-- KHỐI YÊU CẦU XÁC NHẬN & XUẤT VÉ XE + THẺ KHÁCH SẠN (YÊU CẦU 3 & 5) -->
              <div v-if="daXongPhuongTien && daXongKhachSan" id="step3-confirmation-section" class="step3-confirmation-section">
                <!-- 1. KHI CHƯA BẤM XÁC NHẬN: XEM LẠI VÉ XE VÀ KHÁCH SẠN ĐÃ CHỌN + NÚT XÁC NHẬN VŨ TRỤ -->
                <div v-if="!daXacNhanDichVu" class="service-confirm-prompt-card">
                  <div class="scpc-content">
                    <div class="scpc-icon">
                      <AppIcon name="sparkles" :size="24" />
                    </div>
                    <div class="scpc-text">
                      <div class="scpc-header-row">
                        <h4>Xem lại &amp; Xác nhận Dịch vụ Chuyến đi</h4>
                        <span class="scpc-status-badge">Sẵn sàng xuất vé</span>
                      </div>
                      <p>Bạn đã chọn xong Phương tiện và Khách sạn! Vui lòng kiểm tra lại thông tin vé xe và nơi lưu trú đã chọn trước khi xác nhận:</p>
                      <div class="scpc-quick-tags">
                        <div class="scpc-review-tag transit">
                          <span class="scpc-tag-type">
                            <AppIcon :name="formDuLieu.tuTucPhuongTien ? 'bike' : (formDuLieu.nhaXeDaChon ? 'bus' : (formDuLieu.tauDaChon ? 'train' : 'plane'))" :size="15" />
                            Vé di chuyển:
                          </span>
                          <strong class="scpc-tag-val">{{ formDuLieu.tuTucPhuongTien ? 'Tự túc phương tiện (0đ)' : (formDuLieu.nhaXeDaChon ? formDuLieu.nhaXeDaChon.name + (formDuLieu.gioXuatPhatChon ? ' (' + formDuLieu.gioXuatPhatChon + ')' : '') : (formDuLieu.tauDaChon ? formDuLieu.tauDaChon.name : formDuLieu.chuyenBayDaChon?.name)) }}</strong>
                        </div>
                        <div class="scpc-review-tag hotel">
                          <span class="scpc-tag-type">
                            <AppIcon name="hotel" :size="15" />
                            Lưu trú:
                          </span>
                          <strong class="scpc-tag-val">{{ formDuLieu.tuTucKhachSan ? 'Tự túc nơi ở (0đ)' : formDuLieu.khachSanDaChon.name + (formDuLieu.phongDaChon ? ' (' + formDuLieu.phongDaChon.name + ')' : '') }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- NÚT XÁC NHẬN HIỆU ỨNG VŨ TRỤ (COSMIC SPACE CONFIRM BUTTON) -->
                  <div class="btn-container space-confirm-container">
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
                      class="btn space-confirm-btn"
                      @click="xacNhanVaXuatDichVu"
                    >
                      <AppIcon name="check" :size="16" />
                      <span>Xác nhận Vé xe &amp; Thẻ khách sạn</span>
                      <span class="space-btn-arrow">➔</span>
                    </button>
                  </div>
                </div>

                <!-- 2. KHI ĐÃ BẤM XÁC NHẬN: THẺ XEM POPUP VÉ CHUYẾN ĐI -->
                <div v-else class="service-confirmed-wrapper">
                    <!-- THẺ PREVIEW NHANH CHUYẾN ĐI ĐÃ XÁC NHẬN -->
                    <div class="page-ticket-preview-card" @click="moModalXacNhanVe" title="Bấm để mở thẻ xác nhận toàn màn hình">
                      <div class="ptpc-badge-row">
                        <div class="ptpc-title-tag">
                          <AppIcon name="sparkles" :size="14" />
                          <span>SKYLUXE TRAVEL • BẢN TÓM TẮT PHƯƠNG ÁN DỰ KIẾN</span>
                        </div>
                        <span class="ptpc-click-hint">Bấm để xem popup phóng to ↗</span>
                      </div>

                      <div class="ptpc-details-grid">
                        <div class="ptpc-col">
                          <span class="ptpc-lbl">LỘ TRÌNH DI CHUYỂN:</span>
                          <strong class="ptpc-val highlight">
                            {{ formDuLieu.diemKhoiHanh || 'Điểm đi' }} ({{ getCityCode(formDuLieu.diemKhoiHanh) }}) ➔ {{ formDuLieu.diemDen }} ({{ getCityCode(formDuLieu.diemDen) }})
                          </strong>
                          <small class="ptpc-sub">
                            {{ formDuLieu.tuTucPhuongTien ? 'Tự túc xe riêng' : (formDuLieu.nhaXeDaChon ? 'Xe ' + formDuLieu.nhaXeDaChon.name : (formDuLieu.tauDaChon ? 'Tàu ' + formDuLieu.tauDaChon.name : 'Chuyến bay ' + (formDuLieu.chuyenBayDaChon?.name || 'VN310'))) }}
                          </small>
                        </div>

                        <div class="ptpc-col">
                          <span class="ptpc-lbl">LƯU TRÚ NGHỈ DƯỠNG:</span>
                          <strong class="ptpc-val">
                            {{ formDuLieu.tuTucKhachSan ? 'Tự túc nơi ở' : (formDuLieu.khachSanDaChon?.name || 'Khách sạn đã chọn') }}
                          </strong>
                          <small class="ptpc-sub">
                            {{ formDuLieu.tuTucKhachSan ? 'Chỗ nghỉ cá nhân' : (formDuLieu.phongDaChon?.name || 'Phòng tiêu chuẩn') }} ({{ formDuLieu.soDem }} đêm)
                          </small>
                        </div>

                        <div class="ptpc-col total-col">
                          <span class="ptpc-lbl">TỔNG CHI PHÍ DỰ KIẾN:</span>
                          <strong class="ptpc-price">{{ dinhDangTien(tongThanhToanTatCa) }} VNĐ</strong>
                          <small class="ptpc-status-tag">PHƯƠNG ÁN DỰ KIẾN</small>
                        </div>
                      </div>
                    </div>

                    <!-- ĐẨY SANG BUTTON LÊN LỊCH TRÌNH (HIỆU ỨNG TÊN LỬA HÌNH 3) -->
                    <div id="step3-submit-plan-anchor" class="sc-cta-forward-row rocket-cta-forward-row">
                      <div class="rocket-launcher-container" title="Bắt đầu lên lịch trình ngay">
                        <button
                          type="button"
                          class="rocket-launch-btn"
                          @click="taoLichTrinh"
                          :disabled="dangTao || (!tripFeasibility.feasible && !formDuLieu.freePlacesOnly)"
                          aria-label="Bắt đầu lên lịch trình ngay"
                        >
                          <svg class="rocket-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 416.449 416.449" xml:space="preserve">
                            <g class="rocket-tip">
                              <path d="M399.76,16.699c10.12,37.84,8.67,78.13-4.34,115.28h-0.01L284.48,21.049v-0.01 C321.63,8.029,361.92,6.579,399.76,16.699z"></path>
                            </g>
                            <g class="rocket-body">
                              <path d="M90.21,207.929l87.14-101.42h0.01l33.71-39.24c21.43-21.43,46.6-36.84,73.41-46.23v0.01 l110.93,110.93h0.01c-9.39,26.81-24.8,51.98-46.23,73.41l-39.24,33.71l-101.43,87.14l-29.57-29.57l-29.58-29.58l-29.58-29.58z"></path>
                            </g>
                            <g class="rocket-wings">
                              <path class="wings-top" d="M309.95,239.099c1.74,45.6-14.8,91.78-49.61,126.59c-10.69,10.68-22.44,19.65-34.93,26.89 l-16.89-66.34L309.95,239.099z"></path>
                              <path class="wings-bottom" d="M177.35,106.509l-87.14,101.42l-66.33-16.88c7.24-12.49,16.21-24.24,26.89-34.93 C85.58,121.309,131.74,104.769,177.35,106.509z"></path>
                            </g>
                            <g class="rocket-body-bottom">
                              <path d="M208.52,326.239l-39.94,14.71c-10.98,4.05-23.31,1.34-31.58-6.94l-6.85-6.85l48.8-30.49 L208.52,326.239z"></path>
                              <polygon points="178.95,296.669 130.15,327.159 130.14,327.159 109.72,306.739 149.37,267.089"></polygon>
                              <polygon points="149.37,267.089 109.72,306.739 89.3,286.309 119.79,237.509"></polygon>
                              <path d="M119.79,237.509l-30.49,48.8l-6.86-6.85c-8.27-8.28-10.98-20.6-6.94-31.58l14.71-39.95 L119.79,237.509z"></path>
                            </g>
                            <g class="rocket-flames">
                              <path d="M28.88,339.459c-2.559,0-5.119-0.977-7.071-2.929c-3.905-3.905-3.905-10.237,0-14.143 l20.54-20.54c3.905-3.904,10.237-3.904,14.143,0c3.905,3.905,3.905,10.237,0,14.143l-20.54,20.54 C33.999,338.482,31.44,339.459,28.88,339.459z"></path>
                              <path d="M10,416.439c-2.56,0-5.119-0.977-7.072-2.93c-3.905-3.905-3.904-10.237,0.001-14.142l68.47-68.46 c3.905-3.904,10.237-3.904,14.142,0.001c3.905,3.905,3.904,10.237-0.002,14.142l-68.47,68.46 C15.118,415.463,12.559,416.439,10,416.439z"></path>
                              <path d="M73.29,411.259c-2.56,0-5.118-0.977-7.071-2.929c-3.905-3.905-3.905-10.237,0-14.143 l34.23-34.229c3.905-3.904,10.237-3.903,14.142,0c3.905,3.905,3.905,10.237,0,14.143l-34.23,34.229 C78.409,410.282,75.849,411.259,73.29,411.259z"></path>
                            </g>
                          </svg>
                          <div class="rocket-smoke">
                            <span></span><span></span><span></span><span></span><span></span><span></span>
                          </div>
                        </button>
                        <span class="rocket-cta-hint">BẮT ĐẦU LÊN LỊCH TRÌNH (AI)</span>
                      </div>
                      <button type="button" class="sc-btn-edit" @click="daXacNhanDichVu = false" :disabled="dangTao">
                        <AppIcon name="pencil" :size="14" /> Thay đổi phương tiện hoặc khách sạn
                      </button>
                    </div>
                  </div>
              </div>

              <!-- HƯỚNG DẪN TÙY CHỌN BỔ SUNG & NÚT TẠO LỊCH TRÌNH NGAY KHÔNG CẦN CHỜ (KHÔNG DÙNG ICON) -->
              <div v-else class="step3-pending-guide-box">
                <div class="spgb-content">
                  <p class="spgb-desc">
                    <strong>Tùy chọn bổ sung phương tiện &amp; nơi ở:</strong> Bạn có thể chọn trước 
                    <span :class="['spgb-badge', { done: daXongPhuongTien }]">
                      {{ daXongPhuongTien ? 'Đã chọn Phương tiện' : 'Phương tiện di chuyển' }}
                    </span>
                    và 
                    <span :class="['spgb-badge', { done: daXongKhachSan }]">
                      {{ daXongKhachSan ? 'Đã chọn Nơi ở' : 'Khách sạn / Nơi ở' }}
                    </span>
                    ở các mục phía trên. Hoặc bạn có thể bấm tạo lịch trình ngay để xem bản nháp trước.
                  </p>
                  <div class="spgb-actions-row">
                    <button
                      type="button"
                      class="btn-step3-direct-plan"
                      @click="taoLichTrinh"
                      :disabled="dangTao || (!tripFeasibility.feasible && !formDuLieu.freePlacesOnly)"
                    >
                      Tạo lịch trình ngay (Không cần chọn đủ 2 mục)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TRẠNG THÁI THẤT BẠI & NÚT THỬ LẠI (YÊU CẦU 20 - NO ICON) -->
            <div v-if="taoPlanError" class="plan-failure-recovery-card">
              <div class="pfrc-inner">
                <div class="pfrc-header-row">
                  <span class="pfrc-badge">[THÔNG BÁO SỰ CỐ]</span>
                  <strong class="pfrc-title">Chưa thể hoàn tất lịch trình</strong>
                </div>
                <p class="pfrc-message">{{ taoPlanError }}</p>
                <div class="pfrc-actions">
                  <button
                    type="button"
                    class="pfrc-btn-retry"
                    @click="taoLichTrinh"
                    :disabled="dangTao"
                  >
                    Thử lại ngay
                  </button>
                  <button
                    type="button"
                    class="pfrc-btn-back"
                    @click="goToStep(2)"
                  >
                    Xem lại ngân sách &amp; sở thích
                  </button>
                </div>
              </div>
            </div>

            <!-- WIZARD FOOTER NAVIGATION -->
            <div class="wizard-footer">
              <!-- NÚT QUAY LẠI HIỆU ỨNG VŨ TRỤ (COSMIC SPACE BACK BUTTON) -->
              <div
                v-if="currentPlannerStep > 1"
                class="btn-container space-back-container"
              >
                <!-- SVG B1: Sao Băng / Comet Return -->
                <div class="svg svg-b1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <path fill="#f59e0b" d="m18 36a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/>
                    <path fill="#38bdf8" opacity="0.85" d="M18 20 L56 8 C42 17, 30 22, 18 24 Z"/>
                    <path fill="#818cf8" opacity="0.8" d="M18 26 L60 18 C44 26, 32 30, 18 34 Z"/>
                    <circle cx="18" cy="28" r="4.5" fill="#fef08a"/>
                  </svg>
                </div>

                <!-- SVG B2: Vệ Tinh / Satellite -->
                <div class="svg svg-b2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <rect x="25" y="24" width="14" height="16" rx="2" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.5"/>
                    <circle cx="32" cy="32" r="3" fill="#0284c7"/>
                    <rect x="6" y="26" width="16" height="12" rx="1" fill="#0284c7" stroke="#1e293b" stroke-width="1.5"/>
                    <line x1="14" y1="26" x2="14" y2="38" stroke="#ffffff" stroke-width="1"/>
                    <line x1="22" y1="32" x2="25" y2="32" stroke="#64748b" stroke-width="2"/>
                    <rect x="42" y="26" width="16" height="12" rx="1" fill="#0284c7" stroke="#1e293b" stroke-width="1.5"/>
                    <line x1="50" y1="26" x2="50" y2="38" stroke="#ffffff" stroke-width="1"/>
                    <line x1="39" y1="32" x2="42" y2="32" stroke="#64748b" stroke-width="2"/>
                    <path d="M32 24 L32 15" stroke="#94a3b8" stroke-width="2"/>
                    <path d="M26 15 Q32 10 38 15" fill="none" stroke="#f59e0b" stroke-width="2"/>
                    <circle cx="32" cy="11" r="2" fill="#ef4444"/>
                  </svg>
                </div>

                <!-- SVG B3: Cổng Không Gian / Wormhole Portal -->
                <div class="svg svg-b3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <ellipse cx="32" cy="32" rx="26" ry="12" fill="none" stroke="#8b5cf6" stroke-width="3" transform="rotate(-25 32 32)"/>
                    <ellipse cx="32" cy="32" rx="18" ry="8" fill="none" stroke="#06b6d4" stroke-width="2.5" transform="rotate(-25 32 32)"/>
                    <ellipse cx="32" cy="32" rx="10" ry="4" fill="none" stroke="#ec4899" stroke-width="2" transform="rotate(-25 32 32)"/>
                    <circle cx="32" cy="32" r="3.5" fill="#ffffff"/>
                  </svg>
                </div>

                <!-- SVG B4: Mũ Phi Hành Gia / Astronaut Helmet -->
                <div class="svg svg-b4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <path fill="#f8fafc" stroke="#1e293b" stroke-width="2" d="M14 34 C14 20 22 12 32 12 C42 12 50 20 50 34 C50 46 44 50 32 50 C20 50 14 46 14 34 Z"/>
                    <path fill="#0284c7" stroke="#1e293b" stroke-width="1.5" d="M20 28 C20 22 25 18 32 18 C39 18 44 22 44 28 C44 36 39 40 32 40 C25 40 20 36 20 28 Z"/>
                    <path fill="#38bdf8" opacity="0.65" d="M24 24 C26 21 30 20 34 20 C31 22 28 26 26 32 C24 30 24 26 24 24 Z"/>
                    <rect x="10" y="28" width="5" height="12" rx="2" fill="#94a3b8"/>
                    <rect x="49" y="28" width="5" height="12" rx="2" fill="#94a3b8"/>
                  </svg>
                </div>

                <!-- SVG B5: Ngôi Sao Định Hướng / Navigation Star -->
                <div class="svg svg-b5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="40px" width="40px">
                    <path fill="#fbbf24" stroke="#d97706" stroke-width="1" d="M32 4 L36 24 L56 24 L40 36 L46 56 L32 44 L18 56 L24 36 L8 24 L28 24 Z"/>
                    <circle cx="32" cy="32" r="4.5" fill="#ffffff"/>
                    <circle cx="16" cy="12" r="2" fill="#38bdf8"/>
                    <circle cx="50" cy="48" r="2.5" fill="#f472b6"/>
                  </svg>
                </div>

                <button 
                  type="button"
                  @click="quayLaiWizard" 
                  class="btn space-back-btn"
                  :disabled="dangTao"
                >
                  <span class="space-back-arrow">←</span>
                  <span>Quay lại</span>
                </button>
              </div>
              
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
            </div>
          </div>

    <!-- ==================== POPUP MODAL VÉ XÁC NHẬN CHUYẾN ĐI (SKYLUXE BOARDING PASS) ==================== -->
    <Teleport to="body">
      <transition name="ticket-modal-zoom">
        <div
          v-if="showTicketConfirmationModal"
          class="ticket-fullscreen-modal-overlay"
          @click.self="dongModalXacNhanVe"
          role="dialog"
          aria-modal="true"
        >
          <div class="ticket-modal-inner-box">
            <!-- NÚT ĐÓNG POPUP GÓC PHẢI -->
            <button
              type="button"
              class="ticket-modal-close-icon"
              @click="dongModalXacNhanVe"
              aria-label="Đóng popup vé"
              title="Đóng (Esc)"
            >
              ✕
            </button>


            <!-- KHÔNG GIAN 3D TẤM VÉ (LẬT 180 ĐỘ) -->
            <div
              class="skyluxe-ticket-3d-stage"
              :class="{ 'is-flipped': isModalTicketFlipped }"
              @click="toggleModalTicketFlip"
              title="Nhấn vào vé để lật 3D"
            >
              <div class="skyluxe-ticket-3d-inner">
                <!-- ==================== MẶT TRƯỚC (FACE FRONT) - GIỮ NGUYÊN 100% ==================== -->
                <div class="skyluxe-ticket-face st-face-front">
                  <!-- 4 VẾT KHOÉT BÁN NGUYỆT (NOTCHES) Y HỆT HÌNH -->
                  <div class="skyluxe-notch notch-left"></div>
                  <div class="skyluxe-notch notch-right"></div>
                  <div class="skyluxe-notch notch-top"></div>
                  <div class="skyluxe-notch notch-bottom"></div>

                  <!-- HEADER MÀU ĐEN TRÊN CÙNG -->
                  <div class="st-black-header">
                    <span class="st-header-title">XÁC NHẬN CHUYẾN ĐI CỦA BẠN</span>
                    <div class="st-header-brand">
                      <svg class="st-brand-logo" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f59e0b" stroke-width="2.2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      <div class="st-brand-text">
                        <strong>SKYLUXE</strong>
                        <span>TRAVEL</span>
                      </div>
                    </div>
                  </div>

                  <!-- THÂN VÉ (CHIA 2 PHẦN: THÂN VÉ CHÍNH & CUỐNG VÉ) -->
                  <div class="st-card-content">
                    <!-- PHẦN CHÍNH (BÊN TRÁI) -->
                    <div class="st-main-part">
                      <!-- MỤC 1: THÔNG TIN CHUYẾN BAY / DI CHUYỂN -->
                      <div class="st-flight-section">
                        <span class="st-section-tag">
                          {{ formDuLieu.tuTucPhuongTien ? 'PHƯƠNG ÁN XE CÁ NHÂN DỰ KIẾN' : (formDuLieu.tauDaChon ? 'PHƯƠNG ÁN TÀU HỎA DỰ KIẾN' : (formDuLieu.nhaXeDaChon ? 'PHƯƠNG ÁN XE KHÁCH DỰ KIẾN' : (formDuLieu.chuyenBayDaChon ? 'PHƯƠNG ÁN CHUYẾN BAY DỰ KIẾN' : 'PHƯƠNG ÁN DI CHUYỂN DỰ KIẾN'))) }}
                        </span>
                        <div class="st-flight-route-row">
                          <h3 class="st-route-title">
                            {{ formDuLieu.diemKhoiHanh || 'Điểm đi' }} ({{ getCityCode(formDuLieu.diemKhoiHanh) }}) ➔ {{ formDuLieu.diemDen || 'Điểm đến' }} ({{ getCityCode(formDuLieu.diemDen) }})
                          </h3>
                          <!-- QR Code góc phải -->
                          <div class="st-qr-code-box">
                            <svg viewBox="0 0 36 36" class="st-qr-code" width="46" height="46">
                              <rect width="36" height="36" fill="white" />
                              <path d="M3 3h9v9H3zM5 5h5v5H5zM6.5 6.5h2v2h-2z M24 3h9v9h-9zM26 5h5v5h-5zM27.5 6.5h2v2h-2z M3 24h9v9H3zM5 26h5v5H5zM6.5 27.5h2v2h-2z M15 3h3v5h-3z M15 11h3v4h-3z M24 15h3v4h-3z M30 15h3v7h-3z M15 18h3v7h-3z M24 24h5v3h-5z M31 27h2v3h-2z M19 29h3v2h-3z" fill="#09090b" />
                            </svg>
                          </div>
                        </div>

                        <!-- Metadata chuyến bay -->
                        <div class="st-flight-meta-row">
                          <span class="stfm-code">
                            <template v-if="formDuLieu.tuTucPhuongTien">Tự túc xe riêng</template>
                            <template v-else-if="formDuLieu.chuyenBayDaChon">{{ formDuLieu.chuyenBayDaChon.name || 'VN310' }}</template>
                            <template v-else-if="formDuLieu.tauDaChon">Tàu {{ formDuLieu.tauDaChon.name }}</template>
                            <template v-else-if="formDuLieu.nhaXeDaChon">Xe {{ formDuLieu.nhaXeDaChon.name }}</template>
                            <template v-else>Phương tiện dự kiến</template>
                          </span>
                          <span class="stfm-sep">|</span>
                          <span class="stfm-datetime">
                            {{ ngayKhoiHanhFormatted }} {{ formDuLieu.gioXuatPhatChon || '23:40' }}
                          </span>
                          <span class="stfm-sep">|</span>
                          <span class="stfm-seat">
                            Seat <strong>{{ formDuLieu.tuTucPhuongTien ? 'VIP' : '12A' }}</strong>
                          </span>
                        </div>
                        <div class="st-flight-class">
                          {{ formDuLieu.tuTucPhuongTien ? 'Phương tiện cá nhân' : (formDuLieu.chuyenBayDaChon ? 'Hạng Thương gia' : 'Hạng Tiêu chuẩn') }}
                        </div>
                      </div>

                      <!-- MỤC 2: THÔNG TIN KHÁCH SẠN -->
                      <div class="st-hotel-section">
                        <span class="st-section-tag">THÔNG TIN KHÁCH SẠN</span>
                        <h4 class="st-hotel-name">
                          {{ formDuLieu.tuTucKhachSan ? 'Tự túc nơi ở / Homestay riêng' : (formDuLieu.khachSanDaChon?.name || ('Khách sạn tại ' + (formDuLieu.diemDen || 'Điểm đến'))) }}
                        </h4>

                        <div class="st-hotel-content-grid">
                          <!-- 2 Ảnh thumbnail bên cạnh nhau -->
                          <div class="st-hotel-thumbs">
                            <img
                              :src="formDuLieu.khachSanDaChon?.image || '/images/slides/danang-cauvang.jpg'"
                              class="st-thumb-img"
                              alt="Khách sạn view"
                            />
                            <img
                              :src="formDuLieu.phongDaChon?.image || formDuLieu.khachSanDaChon?.photos?.[1] || '/images/slides/mientrung-nonnuoc.jpg'"
                              class="st-thumb-img"
                              alt="Phòng nghỉ view"
                            />
                          </div>

                          <!-- Cột thông tin phòng -->
                          <div class="st-hotel-room-info">
                            <strong class="st-room-name">
                              {{ formDuLieu.tuTucKhachSan ? 'Chỗ nghỉ riêng' : (formDuLieu.phongDaChon?.name || 'Phòng tiêu chuẩn đã chọn') }}
                            </strong>
                            <div class="st-room-dates">
                              <div>Check-in: <span>{{ ngayKhoiHanhFormatted }}</span></div>
                              <div>Check-out: <span>{{ ngayKetThucFormatted }}</span></div>
                            </div>
                            <div class="st-booking-code">
                              Trạng thái: <span>Phương án dự kiến (Chờ nhà cung cấp xác nhận)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- DÒNG ĐÁY: TỔNG THANH TOÁN -->
                      <div class="st-total-row">
                        <span class="st-total-label">TỔNG CHI PHÍ DỰ KIẾN:</span>
                        <strong class="st-total-value">{{ dinhDangTien(tongThanhToanTatCa) }} VNĐ</strong>
                      </div>
                    </div>

                    <!-- CUỐNG VÉ (BÊN PHẢI) -->
                    <div class="st-stub-part">
                      <div class="st-stub-passenger">
                        <span class="st-stub-label">Tới điểm đến</span>
                        <strong class="st-stub-name">{{ customerDisplayName }}</strong>
                      </div>

                      <div class="st-stub-grid">
                        <div class="st-sg-item">
                          <span class="st-sg-lbl">Phương tiện</span>
                          <strong class="st-sg-val">{{ formDuLieu.tuTucPhuongTien ? 'Xe riêng' : (formDuLieu.nhaXeDaChon ? formDuLieu.nhaXeDaChon.name : (formDuLieu.tauDaChon ? formDuLieu.tauDaChon.name : (formDuLieu.chuyenBayDaChon?.name || 'Chuyến đi'))) }}</strong>
                        </div>
                        <div class="st-sg-item">
                          <span class="st-sg-lbl">Seat</span>
                          <strong class="st-sg-val">12A</strong>
                        </div>
                      </div>

                      <!-- MÃ VẠCH BARCODE -->
                      <div class="st-barcode-box">
                        <div class="st-barcode-stripes"></div>
                      </div>

                      <!-- CHỮ KÝ ĐIỆN TỬ E-SIGNATURE -->
                      <div class="st-signature-box">
                        <div class="st-signature-art">Signature</div>
                        <span class="st-signature-sub">E-Signature</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ==================== MẶT SAU (FACE BACK) - ĐỒNG BỘ 100% KÍCH THƯỚC & PHONG CÁCH VIP ==================== -->
                <div class="skyluxe-ticket-face st-face-back">
                  <!-- 4 VẾT KHOÉT BÁN NGUYỆT ĐỒNG BỘ VỚI MẶT TRƯỚC -->
                  <div class="skyluxe-notch notch-left"></div>
                  <div class="skyluxe-notch notch-right"></div>
                  <div class="skyluxe-notch notch-top"></div>
                  <div class="skyluxe-notch notch-bottom"></div>

                  <!-- HEADER MÀU ĐEN MẶT SAU -->
                  <div class="st-black-header">
                    <span class="st-header-title">QUY ĐỊNH HÀNH TRÌNH & ĐẶC QUYỀN VIP</span>
                    <div class="st-header-brand">
                      <svg class="st-brand-logo" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f59e0b" stroke-width="2.2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      <div class="st-brand-text">
                        <strong>SKYLUXE</strong>
                        <span>PRIVILEGE</span>
                      </div>
                    </div>
                  </div>

                  <!-- THÂN VÉ MẶT SAU (CHIA 2 PHẦN CÂN ĐỐI) -->
                  <div class="st-card-content st-back-card-content">
                    <!-- PHẦN CHÍNH MẶT SAU (BÊN TRÁI): 4 TIỆN ÍCH QUY ĐỊNH & HOTLINE -->
                    <div class="st-main-part st-back-main-part">
                      <div class="st-back-grid">
                        <div class="st-back-rule-card">
                          <div class="st-rule-icon-circle">🧳</div>
                          <div class="st-rule-content">
                            <h5>QUY ĐỊNH HÀNH LÝ</h5>
                            <p>Xách tay 12kg (1 kiện + 1 phụ kiện). Hành lý ký gửi 23kg tiêu chuẩn 5 sao.</p>
                          </div>
                        </div>

                        <div class="st-back-rule-card">
                          <div class="st-rule-icon-circle">🛎️</div>
                          <div class="st-rule-content">
                            <h5>CHECK-IN KHÁCH SẠN</h5>
                            <p>Nhận phòng từ 14:00 • Trả phòng trước 12:00. Hỗ trợ early check-in miễn phí.</p>
                          </div>
                        </div>

                        <div class="st-back-rule-card">
                          <div class="st-rule-icon-circle">🛡️</div>
                          <div class="st-rule-content">
                            <h5>BẢO HIỂM DU LỊCH</h5>
                            <p>Skyluxe Care Plus bảo trợ trọn gói hạn mức đến 500.000.000 VNĐ/khách.</p>
                          </div>
                        </div>

                        <div class="st-back-rule-card">
                          <div class="st-rule-icon-circle">👑</div>
                          <div class="st-rule-content">
                            <h5>ĐẶC QUYỀN VIP LOUNGE</h5>
                            <p>Miễn phí vào phòng chờ thương gia sân bay, làn ưu tiên Fast-Track & xe đưa đón.</p>
                          </div>
                        </div>
                      </div>

                      <!-- DÒNG HỖ TRỢ VÀ BẢO TRỢ -->
                      <div class="st-back-footer-row">
                        <div class="st-back-footer-item">
                          <span class="st-bf-label">HOTLINE HỖ TRỢ 24/7:</span>
                          <strong class="st-bf-value">1900 8888 68 • +84 24 3828 8888</strong>
                        </div>
                        <div class="st-back-footer-item">
                          <span class="st-bf-label">HỖ TRỢ KHẨN CẤP:</span>
                          <strong class="st-bf-value">concierge@skyluxetravel.vn</strong>
                        </div>
                      </div>
                    </div>

                    <!-- CUỐNG VÉ MẶT SAU (BÊN PHẢI): CON DẤU PASSPORT STAMP VERIFIED & QR VIP -->
                    <div class="st-stub-part st-back-stub-part">
                      <div class="st-stub-passenger">
                        <span class="st-stub-label">Security Clearance</span>
                        <strong class="st-stub-name">VIP ACCESS PASS</strong>
                      </div>

                      <!-- CON DẤU PASSPORT HẢI QUAN NGHỆ THUẬT -->
                      <div class="st-passport-stamp-wrapper">
                        <div class="st-passport-stamp">
                          <div class="stamp-outer-ring">
                            <div class="stamp-inner-ring">
                              <span class="stamp-star-top">★ SKYLUXE BORDER ★</span>
                              <span class="stamp-verified-text">APPROVED</span>
                              <span class="stamp-date-text">{{ ngayKhoiHanhFormatted }}</span>
                              <span class="stamp-bottom-text">ENTRY VERIFIED</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- QR VIP GATE CHECK-IN -->
                      <div class="st-back-qr-container">
                        <svg viewBox="0 0 36 36" class="st-qr-code" width="46" height="46">
                          <rect width="36" height="36" fill="white" />
                          <path d="M3 3h9v9H3zM5 5h5v5H5zM6.5 6.5h2v2h-2z M24 3h9v9h-9zM26 5h5v5h-5zM27.5 6.5h2v2h-2z M3 24h9v9H3zM5 26h5v5H5zM6.5 27.5h2v2h-2z M15 3h3v5h-3z M15 11h3v4h-3z M24 15h3v4h-3z M30 15h3v7h-3z M15 18h3v7h-3z M24 24h5v3h-5z M31 27h2v3h-2z M19 29h3v2h-3z" fill="#09090b" />
                        </svg>
                        <span class="st-back-qr-lbl">VIP GATE SCANNER</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- HIỆU ỨNG PHÁO HOA & NÚT BẮT ĐẦU LÊN LỊCH TRÌNH NGAY -->
            <div class="modal-cta-sparkle-container">
              <!-- Pháo sáng lấp lánh bên trái -->
              <div class="sparkler-burst left-burst" aria-hidden="true">
                <span class="sparkle-spark s1">✨</span>
                <span class="sparkle-spark s2">🎇</span>
                <span class="sparkle-spark s3">💥</span>
              </div>

              <!-- NÚT TÊN LỬA KHỞI HÀNH (HÌNH 3) -->
              <div class="rocket-launcher-container modal-rocket-box" title="Bắt đầu lên lịch trình ngay">
                <button
                  type="button"
                  class="rocket-launch-btn"
                  @click="batDauLichTrinhTuModal"
                  :disabled="dangTao"
                  aria-label="Bắt đầu lên lịch trình ngay"
                >
                  <svg class="rocket-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 416.449 416.449" xml:space="preserve">
                    <g class="rocket-tip">
                      <path d="M399.76,16.699c10.12,37.84,8.67,78.13-4.34,115.28h-0.01L284.48,21.049v-0.01 C321.63,8.029,361.92,6.579,399.76,16.699z"></path>
                    </g>
                    <g class="rocket-body">
                      <path d="M90.21,207.929l87.14-101.42h0.01l33.71-39.24c21.43-21.43,46.6-36.84,73.41-46.23v0.01 l110.93,110.93h0.01c-9.39,26.81-24.8,51.98-46.23,73.41l-39.24,33.71l-101.43,87.14l-29.57-29.57l-29.58-29.58l-29.58-29.58z"></path>
                    </g>
                    <g class="rocket-wings">
                      <path class="wings-top" d="M309.95,239.099c1.74,45.6-14.8,91.78-49.61,126.59c-10.69,10.68-22.44,19.65-34.93,26.89 l-16.89-66.34L309.95,239.099z"></path>
                      <path class="wings-bottom" d="M177.35,106.509l-87.14,101.42l-66.33-16.88c7.24-12.49,16.21-24.24,26.89-34.93 C85.58,121.309,131.74,104.769,177.35,106.509z"></path>
                    </g>
                    <g class="rocket-body-bottom">
                      <path d="M208.52,326.239l-39.94,14.71c-10.98,4.05-23.31,1.34-31.58-6.94l-6.85-6.85l48.8-30.49 L208.52,326.239z"></path>
                      <polygon points="178.95,296.669 130.15,327.159 130.14,327.159 109.72,306.739 149.37,267.089"></polygon>
                      <polygon points="149.37,267.089 109.72,306.739 89.3,286.309 119.79,237.509"></polygon>
                      <path d="M119.79,237.509l-30.49,48.8l-6.86-6.85c-8.27-8.28-10.98-20.6-6.94-31.58l14.71-39.95 L119.79,237.509z"></path>
                    </g>
                    <g class="rocket-flames">
                      <path d="M28.88,339.459c-2.559,0-5.119-0.977-7.071-2.929c-3.905-3.905-3.905-10.237,0-14.143 l20.54-20.54c3.905-3.904,10.237-3.904,14.143,0c3.905,3.905,3.905,10.237,0,14.143l-20.54,20.54 C33.999,338.482,31.44,339.459,28.88,339.459z"></path>
                      <path d="M10,416.439c-2.56,0-5.119-0.977-7.072-2.93c-3.905-3.905-3.904-10.237,0.001-14.142l68.47-68.46 c3.905-3.904,10.237-3.904,14.142,0.001c3.905,3.905,3.904,10.237-0.002,14.142l-68.47,68.46 C15.118,415.463,12.559,416.439,10,416.439z"></path>
                      <path d="M73.29,411.259c-2.56,0-5.118-0.977-7.071-2.929c-3.905-3.905-3.905-10.237,0-14.143 l34.23-34.229c3.905-3.904,10.237-3.903,14.142,0c3.905,3.905,3.905,10.237,0,14.143l-34.23,34.229 C78.409,410.282,75.849,411.259,73.29,411.259z"></path>
                    </g>
                  </svg>
                  <div class="rocket-smoke">
                    <span></span><span></span><span></span><span></span><span></span><span></span>
                  </div>
                </button>
                <span class="rocket-cta-hint">BẮT ĐẦU LÊN LỊCH TRÌNH NGAY</span>
              </div>

              <!-- Pháo sáng lấp lánh bên phải -->
              <div class="sparkler-burst right-burst" aria-hidden="true">
                <span class="sparkle-spark s1">✨</span>
                <span class="sparkle-spark s2">🎇</span>
                <span class="sparkle-spark s3">💥</span>
              </div>
            </div>

            <!-- PHÁO GIẤY CONFETTI BAY QUANH MODAL -->
            <div class="confetti-sky" aria-hidden="true">
              <span v-for="i in 28" :key="i" :class="'confetti-item cf-' + i"></span>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
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
  transitTab: { type: String, default: '' },
  step3ActiveSubtab: { type: String, default: 'transit' },
  daXongPhuongTien: { type: Boolean, default: false },
  daXongKhachSan: { type: Boolean, default: false },
  daXongBuoc3: { type: Boolean, default: false },
  chonPhuongTienTuSoSanh: { type: Function, default: () => {} },
  chonNhaXe: { type: Function, default: () => {} },
  chonGioXuatPhatBus: { type: Function, default: () => {} },
  chonTauHoa: { type: Function, default: () => {} },
  chonGioXuatPhatTau: { type: Function, default: () => {} },
  chonChuyenBay: { type: Function, default: null },
  chonGioXuatPhatChuyenBay: { type: Function, default: null },
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

// ==================== YÊU CẦU 18: SỞ THÍCH, NHỊP ĐỘ & RÀNG BUỘC (NO ICON) ====================
const hienRangBuocTuyChon = ref(false)

const interestOptions = [
  { id: 'bien', name: 'Biển', desc: 'Bãi biển, tắm biển, ngắm hoàng hôn, hải sản ven biển' },
  { id: 'van_hoa', name: 'Văn hóa & Lịch sử', desc: 'Di sản thế giới, lăng tẩm, phố cổ, bảo tàng' },
  { id: 'thien_nhien', name: 'Thiên nhiên & Sinh thái', desc: 'Rừng núi, hang động kỳ vĩ, thác nước, sinh thái' },
  { id: 'an_uong', name: 'Ẩm thực & Đặc sản', desc: 'Đặc sản địa phương, phố ẩm thực, chợ đêm' },
  { id: 'giai_tri', name: 'Giải trí & Vui chơi', desc: 'Khu vui chơi, công viên giải trí, cafe view đẹp' }
]

function isInterestActive(id) {
  const current = props.formDuLieu?.soThich || []
  return current.some(item => {
    const s = (typeof item === 'string' ? item.toLowerCase() : '')
    if (id === 'bien') return s.includes('biển') || s.includes('beach')
    if (id === 'van_hoa') return s.includes('văn hóa') || s.includes('lịch sử') || s.includes('di sản')
    if (id === 'thien_nhien') return s.includes('thiên nhiên') || s.includes('sinh thái') || s.includes('núi')
    if (id === 'an_uong') return s.includes('ăn uống') || s.includes('ẩm thực') || s.includes('đặc sản')
    if (id === 'giai_tri') return s.includes('giải trí') || s.includes('vui chơi')
    return false
  })
}

function toggleInterest(id) {
  if (!props.formDuLieu) return
  if (!Array.isArray(props.formDuLieu.soThich)) {
    props.formDuLieu.soThich = []
  }
  const opt = interestOptions.find(o => o.id === id)
  const optName = opt ? opt.name : id
  const idx = props.formDuLieu.soThich.findIndex(item => {
    const s = (typeof item === 'string' ? item.toLowerCase() : '')
    if (id === 'bien') return s.includes('biển') || s.includes('beach')
    if (id === 'van_hoa') return s.includes('văn hóa') || s.includes('lịch sử') || s.includes('di sản')
    if (id === 'thien_nhien') return s.includes('thiên nhiên') || s.includes('sinh thái') || s.includes('núi')
    if (id === 'an_uong') return s.includes('ăn uống') || s.includes('ẩm thực') || s.includes('đặc sản')
    if (id === 'giai_tri') return s.includes('giải trí') || s.includes('vui chơi')
    return false
  })

  if (idx >= 0) {
    props.formDuLieu.soThich.splice(idx, 1)
  } else {
    props.formDuLieu.soThich.push(optName)
  }
}

// ==================== SLIDER 3 OPTIONS ĐIỂM KHỞI HÀNH (THỦ CÔNG, VỊ TRÍ HIỆN TẠI, TÔI ĐÃ Ở ĐIỂM ĐẾN) ====================
const originMethod = ref(
  props.formDuLieu?.daODiemDen
    ? 'at_destination'
    : (props.showManualWardPicker ? 'manual' : 'manual')
)

watch(() => props.showManualWardPicker, (val) => {
  if (val && originMethod.value !== 'at_destination') {
    originMethod.value = 'manual'
  }
})

function chonPhuongThucOrigin(method) {
  originMethod.value = method
  if (method === 'manual') {
    if (props.formDuLieu) {
      props.formDuLieu.daODiemDen = false
    }
    if (!props.showManualWardPicker) {
      if (typeof props.toggleManualWardPicker === 'function') {
        props.toggleManualWardPicker()
      } else {
        emit('update:showManualWardPicker', true)
      }
    }
  } else if (method === 'gps') {
    if (props.formDuLieu) {
      props.formDuLieu.daODiemDen = false
    }
    if (props.showManualWardPicker) {
      emit('update:showManualWardPicker', false)
    }
    if (typeof props.layViTriHienTaiChoDiemXuatPhat === 'function') {
      props.layViTriHienTaiChoDiemXuatPhat()
    }
  } else if (method === 'at_destination') {
    if (props.showManualWardPicker) {
      emit('update:showManualWardPicker', false)
    }
    if (props.formDuLieu) {
      props.formDuLieu.daODiemDen = true
      props.formDuLieu.tuTucPhuongTien = true
      props.formDuLieu.phuongTien = 'tự túc'
      props.formDuLieu.diemKhoiHanh = props.formDuLieu.diemDen || 'Đà Nẵng'
      props.formDuLieu.chiTietDiemKhoiHanh = {
        name: props.formDuLieu.diemDen || 'Đà Nẵng',
        province: props.formDuLieu.diemDen || 'Đà Nẵng',
        isAtDestination: true
      }
    }
    if (typeof props.chonDiemKhoiHanh === 'function') {
      props.chonDiemKhoiHanh(props.formDuLieu?.diemDen || 'Đà Nẵng')
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

let isDraggingCity = false
let startDragX = 0
let startScrollLeft = 0
let hasDraggedCity = false

function onCityMouseDown(e) {
  isDraggingCity = true
  hasDraggedCity = false
  startDragX = e.pageX
  startScrollLeft = citySelectorRef.value ? citySelectorRef.value.scrollLeft : 0
}

function onCityMouseMove(e) {
  if (!isDraggingCity || !citySelectorRef.value) return
  const diff = e.pageX - startDragX
  if (Math.abs(diff) > 4) {
    hasDraggedCity = true
    citySelectorRef.value.scrollLeft = startScrollLeft - diff
  }
}

function onCityMouseUp() {
  isDraggingCity = false
}

function onCityMouseLeave() {
  isDraggingCity = false
}

function handleSelectCity(cityName) {
  if (hasDraggedCity) return
  if (typeof props.chonNhanhDiemDen === 'function') {
    props.chonNhanhDiemDen(cityName)
  }
  if (originMethod.value === 'at_destination' || props.formDuLieu?.daODiemDen) {
    props.formDuLieu.diemKhoiHanh = cityName
    if (typeof props.chonDiemKhoiHanh === 'function') {
      props.chonDiemKhoiHanh(cityName)
    }
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
    if (newVal && (originMethod.value === 'at_destination' || props.formDuLieu?.daODiemDen)) {
      props.formDuLieu.diemKhoiHanh = newVal
      if (typeof props.chonDiemKhoiHanh === 'function') {
        props.chonDiemKhoiHanh(newVal)
      }
    }
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
  if (!props.formDuLieu?.diemKhoiHanh) return '?'
  return getEstimatedDistance(props.formDuLieu.diemKhoiHanh, cityName)
}

function switchStep3Subtab(tab) {
  emit('update:step3ActiveSubtab', tab)
}

function scrollCityGroup(offset) {
  if (citySelectorRef.value) {
    citySelectorRef.value.scrollBy({ left: offset, behavior: 'smooth' })
  }
}

function handleCityWheel(e) {
  if (citySelectorRef.value && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    citySelectorRef.value.scrollLeft += e.deltaY
  }
}

watch(
  () => [props.formDuLieu?.diemKhoiHanh, props.visibleCities],
  () => {
    nextTick(updateSlider)
  },
  { deep: true }
)

// ==================== STEP 1: VALIDATION & HOTEL NIGHTS COMPUTATION ====================
const dateValidationError = computed(() => {
  const start = props.formDuLieu?.ngayBatDau
  if (!start) return 'Vui lòng chọn ngày khởi hành hợp lệ.'
  if (props.todayIso && start < props.todayIso) {
    return 'Ngày khởi hành không được ở quá khứ. Vui lòng chọn từ hôm nay trở đi.'
  }
  return ''
})


// ==================== STEP 2: MANUAL BUDGET & SCOPE LOGIC ====================
const formattedBudgetDisplay = computed(() => {
  const val = Number(props.formDuLieu?.nganSach)
  if (!val || isNaN(val) || val <= 0) return ''
  return new Intl.NumberFormat('vi-VN').format(val)
})

const formattedPerPersonBudgetDisplay = computed(() => {
  const people = Math.max(1, Number(props.formDuLieu?.soNguoi) || 1)
  const val = Number(props.formDuLieu?.nganSachPerPerson) || Math.round((Number(props.formDuLieu?.nganSach) || 0) / people)
  if (!val || isNaN(val) || val <= 0) return ''
  return new Intl.NumberFormat('vi-VN').format(val)
})

function setBudgetMode(mode) {
  props.formDuLieu.nganSachMode = mode
  const people = Math.max(1, Number(props.formDuLieu?.soNguoi) || 1)
  if (mode === 'per_person') {
    if (!props.formDuLieu.nganSachPerPerson || props.formDuLieu.nganSachPerPerson <= 0) {
      props.formDuLieu.nganSachPerPerson = Math.round((Number(props.formDuLieu.nganSach) || 0) / people)
    }
  } else {
    if (props.formDuLieu.nganSachPerPerson > 0) {
      props.formDuLieu.nganSach = props.formDuLieu.nganSachPerPerson * people
    }
  }
}

function handleManualBudgetInput(e) {
  const raw = e.target.value.replace(/\D/g, '')
  const num = raw ? parseInt(raw, 10) : 0
  const people = Math.max(1, Number(props.formDuLieu?.soNguoi) || 1)

  if (props.formDuLieu.nganSachMode === 'per_person') {
    props.formDuLieu.nganSachPerPerson = num
    props.formDuLieu.nganSach = num * people
  } else {
    props.formDuLieu.nganSach = num
    props.formDuLieu.nganSachPerPerson = Math.round(num / people)
  }

  if (e.target) {
    e.target.value = num > 0 ? new Intl.NumberFormat('vi-VN').format(num) : ''
  }
}

// Đồng bộ tổng ngân sách khi số người thay đổi ở chế độ "Mỗi người"
watch(() => props.formDuLieu?.soNguoi, (newPeople) => {
  const p = Math.max(1, Number(newPeople) || 1)
  if (props.formDuLieu?.nganSachMode === 'per_person' && props.formDuLieu.nganSachPerPerson > 0) {
    props.formDuLieu.nganSach = props.formDuLieu.nganSachPerPerson * p
  }
})

// ==================== TÌNH TRẠNG CHỖ NGHỈ & ĐÃ ĐẶT CHỖ TRƯỚC ====================
const formattedPrebookedCostDisplay = computed(() => {
  const val = Number(props.formDuLieu?.prebookedHotelCost)
  if (!val || isNaN(val) || val <= 0) return ''
  return new Intl.NumberFormat('vi-VN').format(val)
})

function handlePrebookedCostInput(e) {
  const raw = e.target.value.replace(/\D/g, '')
  const num = raw ? parseInt(raw, 10) : 0
  props.formDuLieu.prebookedHotelCost = num
  if (e.target) {
    e.target.value = num > 0 ? new Intl.NumberFormat('vi-VN').format(num) : ''
  }
}

function onStayTypeChange(type) {
  props.formDuLieu.hotelStayType = type
  if (type === 'free') {
    props.formDuLieu.tuTucKhachSan = true
    props.formDuLieu.khachSanDaChon = null
    props.formDuLieu.phongDaChon = null
  } else if (type === 'prebooked') {
    props.formDuLieu.tuTucKhachSan = true
    props.formDuLieu.khachSanDaChon = null
    props.formDuLieu.phongDaChon = null
  } else {
    props.formDuLieu.tuTucKhachSan = false
  }
}

// ==================== TRỢ LÝ ĐỀ XUẤT ĐỊA ĐIỂM ====================
const assistantAutoSuggestMode = ref(false)

function deTroLyDeXuat() {
  assistantAutoSuggestMode.value = true
  if (typeof props.clearAllSelectedPlaces === 'function') {
    props.clearAllSelectedPlaces()
  }
}

// ==================== PLACE AUTOCOMPLETE & SUGGESTIONS LOGIC ====================
const placeSearchQuery = ref('')
const showSuggestions = ref(false)
const autocompleteContainerRef = ref(null)

function removeVietnameseTones(str) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

const filteredSuggestions = computed(() => {
  const q = placeSearchQuery.value.trim()
  if (!q) return []
  
  const qLower = q.toLowerCase()
  const qNorm = removeVietnameseTones(q)
  
  const list = props.places || []
  
  const results = []
  for (const p of list) {
    if (!p?.name) continue
    const pLower = p.name.toLowerCase()
    const pNorm = removeVietnameseTones(p.name)
    
    // Priority 1: Prefix match
    if (pLower.startsWith(qLower) || pNorm.startsWith(qNorm)) {
      results.push({ item: p, score: 3 })
    }
    // Priority 2: Word start match
    else if (pLower.includes(' ' + qLower) || pNorm.includes(' ' + qNorm)) {
      results.push({ item: p, score: 2 })
    }
    // Priority 3: Substring
    else if (pLower.includes(qLower) || pNorm.includes(qNorm)) {
      results.push({ item: p, score: 1 })
    }
    
    if (results.length >= 60) break
  }
  
  results.sort((a, b) => b.score - a.score)
  return results.slice(0, 15).map(r => r.item)
})

function isPlaceSelected(name) {
  if (typeof props.isPlaceSelected === 'function' && props.isPlaceSelected !== (() => false)) {
    return props.isPlaceSelected(name)
  }
  return (props.selectedPlaces || []).includes(name)
}

function togglePlaceSelection(name) {
  if (typeof props.togglePlaceSelection === 'function' && props.togglePlaceSelection !== (() => {})) {
    props.togglePlaceSelection(name)
  } else {
    const idx = (props.selectedPlaces || []).indexOf(name)
    if (idx > -1) {
      props.selectedPlaces.splice(idx, 1)
    } else {
      props.selectedPlaces.push(name)
    }
  }
}

function handleSelectSuggestion(item) {
  if (item?.name) {
    togglePlaceSelection(item.name)
  }
}

function handleAddCustomFromQuery() {
  const q = placeSearchQuery.value.trim()
  if (q) {
    if (typeof props.addCustomPlace === 'function') {
      emit('update:customPlaceText', q)
      props.addCustomPlace(q)
    } else if (props.selectedPlaces && !props.selectedPlaces.includes(q)) {
      props.selectedPlaces.push(q)
    }
    placeSearchQuery.value = ''
    showSuggestions.value = false
  }
}

function onEnterSelectFirstOrCustom() {
  if (filteredSuggestions.value.length > 0) {
    const first = filteredSuggestions.value[0]
    togglePlaceSelection(first.name)
    placeSearchQuery.value = ''
    showSuggestions.value = false
  } else {
    handleAddCustomFromQuery()
  }
}

function onPlaceInputFocus() {
  showSuggestions.value = true
}

function onPlaceInputChange() {
  showSuggestions.value = true
}

function clearPlaceSearch() {
  placeSearchQuery.value = ''
  showSuggestions.value = false
}

function getPlaceCategoryIcon(type) {
  switch (type) {
    case 'attraction': return 'landmark'
    case 'restaurant': return 'utensils'
    case 'cafe': return 'coffee'
    case 'hotel': return 'hotel'
    default: return 'pin'
  }
}

function getPlaceCategoryLabel(type) {
  switch (type) {
    case 'attraction': return 'Thắng cảnh'
    case 'restaurant': return 'Đặc sản'
    case 'cafe': return 'Cafe'
    case 'hotel': return 'Khách sạn'
    default: return 'Địa điểm'
  }
}

function handleClickOutsideAutocomplete(e) {
  if (autocompleteContainerRef.value && !autocompleteContainerRef.value.contains(e.target)) {
    showSuggestions.value = false
  }
}

// ==================== BỘ CHỌN PHƯƠNG TIỆN UIVERSE RADIO TILES & LỌC ĐỊA LÝ ====================
const PROVINCES_WITH_TRAIN = [
  'Hà Nội', 'Hà Nam', 'Nam Định', 'Ninh Bình', 'Thanh Hóa', 'Nghệ An',
  'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Huế',
  'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên',
  'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Đồng Nai', 'Bình Dương', 'TP. Hồ Chí Minh'
]

const PROVINCE_AIRPORT_MAP = {
  'Hà Nội': 'Sân bay Quốc tế Nội Bài (HAN)',
  'TP. Hồ Chí Minh': 'Sân bay Quốc tế Tân Sơn Nhất (SGN)',
  'Hải Phòng': 'Sân bay Cát Bi (HPH)',
  'Cần Thơ': 'Sân bay Cần Thơ (VCA)',
  'Đà Nẵng': 'Sân bay Quốc tế Đà Nẵng (DAD)',
  'Thanh Hóa': 'Sân bay Thọ Xuân (THD)',
  'Nghệ An': 'Sân bay Quốc tế Vinh (VII)',
  'Quảng Bình': 'Sân bay Đồng Hới (VDH)',
  'Thừa Thiên Huế': 'Sân bay Quốc tế Phú Bài (HUI)',
  'Huế': 'Sân bay Quốc tế Phú Bài (HUI)',
  'Quảng Nam': 'Sân bay Chu Lai (VCL)',
  'Bình Định': 'Sân bay Phù Cát (UIH)',
  'Phú Yên': 'Sân bay Tuy Hòa (TBB)',
  'Khánh Hòa': 'Sân bay Quốc tế Cam Ranh (CXR)',
  'Gia Lai': 'Sân bay Pleiku (PXU)',
  'Đắk Lắk': 'Sân bay Buôn Ma Thuột (BMV)',
  'Lâm Đồng': 'Sân bay Quốc tế Liên Khương (DLI)'
}

const SVG_ICONS = {
  tu_tuc: `<svg stroke="currentColor" xml:space="preserve" viewBox="0 0 467.168 467.168" xmlns="http://www.w3.org/2000/svg" fill="none"><g><path fill="currentColor" d="M76.849,210.531C34.406,210.531,0,244.937,0,287.388c0,42.438,34.406,76.847,76.849,76.847 c30.989,0,57.635-18.387,69.789-44.819l18.258,14.078c0,0,134.168,0.958,141.538-3.206c0,0-16.65-45.469,4.484-64.688 c2.225-2.024,5.021-4.332,8.096-6.777c-3.543,8.829-5.534,18.45-5.534,28.558c0,42.446,34.403,76.846,76.846,76.846 c42.443,0,76.843-34.415,76.843-76.846c0-42.451-34.408-76.849-76.843-76.849c-0.697,0-1.362,0.088-2.056,0.102 c5.551-3.603,9.093-5.865,9.093-5.865l-5.763-5.127c0,0,16.651-3.837,12.816-12.167c-3.848-8.33-44.19-58.28-44.19-58.28 s7.146-15.373-7.634-26.261l-7.098,15.371c0,0-18.093-12.489-25.295-10.084c-7.205,2.398-18.005,3.603-21.379,8.884l-3.358,3.124 c0,0-0.95,5.528,4.561,13.693c0,0,55.482,17.05,58.119,29.537c0,0,3.848,7.933-12.728,9.844l-3.354,4.328l-8.896,0.479 l-16.082-36.748c0,0-15.381,4.082-23.299,10.323l1.201,6.24c0,0-64.599-43.943-125.362,21.137c0,0-44.909,12.966-76.37-26.897 c0,0-0.479-12.968-76.367-10.565l5.286,5.524c0,0-5.286,0.479-7.444,3.841c-2.158,3.358,1.2,6.961,18.494,6.961 c0,0,39.153,44.668,69.17,42.032l42.743,20.656l18.975,32.42c0,0,0.034,2.785,0.23,7.045c-4.404,0.938-9.341,1.979-14.579,3.09 C139.605,232.602,110.832,210.531,76.849,210.531z M390.325,234.081c29.395,0,53.299,23.912,53.299,53.299 c0,29.39-23.912,53.294-53.299,53.294c-29.394,0-53.294-23.912-53.294-53.294C337.031,257.993,360.932,234.081,390.325,234.081z M76.849,340.683c-29.387,0-53.299-23.913-53.299-53.295c0-29.395,23.912-53.299,53.299-53.299 c22.592,0,41.896,14.154,49.636,34.039c-28.26,6.011-56.31,11.99-56.31,11.99l3.619,19.933l55.339-2.444 C124.365,322.116,102.745,340.683,76.849,340.683z M169.152,295.835c1.571,5.334,3.619,9.574,6.312,11.394l-24.696,0.966 c1.058-3.783,1.857-7.666,2.338-11.662L169.152,295.835z"/></g></svg>`,
  xe_khach: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`,
  tau_hoa: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm4.5-7H6V6h6v4zm4.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-7h-4.5V6H18v4z"/></svg>`,
  may_bay: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`
}

const hasTrainSupport = computed(() => {
  const dest = props.formDuLieu?.diemDen
  const orig = props.formDuLieu?.diemKhoiHanh
  if (!dest) return false
  if (dest === 'Tất cả miền Trung') return true
  const hasDestTrain = PROVINCES_WITH_TRAIN.includes(dest)
  if (!hasDestTrain) return false
  if (orig && !PROVINCES_WITH_TRAIN.includes(orig)) return false
  return true
})

const hasAirportSupport = computed(() => {
  const dest = props.formDuLieu?.diemDen
  const orig = props.formDuLieu?.diemKhoiHanh
  if (!dest) return false
  if (dest === 'Tất cả miền Trung') return true
  const hasDestAirport = Boolean(PROVINCE_AIRPORT_MAP[dest])
  if (!hasDestAirport) return false
  const dist = props.transitRouteInfo?.estimatedDistanceKm || props.transitRouteInfo?.distanceKm || (props.formDuLieu?.daODiemDen ? 15 : getEstimatedDistance(orig, dest))
  if (dist < 200) return false // Chặng ngắn < 200km không có chuyến bay thương mại!
  if (orig) {
    const hasOrigAirport = Boolean(PROVINCE_AIRPORT_MAP[orig]) || ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'].includes(orig)
    if (!hasOrigAirport) return false
  }
  return true
})

const availableTransports = computed(() => {
  const list = [
    {
      id: 'tu_tuc',
      name: 'Tự túc',
      type: 'tu_tuc',
      subtitle: 'Xe máy / Ô tô riêng (0đ vé liên tỉnh)',
      svgIcon: SVG_ICONS.tu_tuc
    },
    {
      id: 'xe_khach',
      name: 'Xe khách',
      type: 'xe_khach',
      subtitle: 'Giường nằm & Limousine',
      svgIcon: SVG_ICONS.xe_khach
    }
  ]

  if (hasTrainSupport.value) {
    list.push({
      id: 'tau_hoa',
      name: 'Tàu hỏa',
      type: 'tau_hoa',
      subtitle: 'Đường sắt Thống Nhất',
      svgIcon: SVG_ICONS.tau_hoa
    })
  }

  if (hasAirportSupport.value) {
    list.push({
      id: 'may_bay',
      name: 'Máy bay',
      type: 'may_bay',
      subtitle: 'Chuyến bay nội địa thẳng',
      svgIcon: SVG_ICONS.may_bay
    })
  }

  return list
})

const daXacNhanDichVu = ref(false)
const isTicketFlipped = ref(false)

function toggleTicketFlip() {
  isTicketFlipped.value = !isTicketFlipped.value
}

function setTicketFace(face) {
  isTicketFlipped.value = face === 'hotel'
}

const selectedTransportId = computed(() => {
  if (props.formDuLieu?.tuTucPhuongTien || props.formDuLieu?.phuongTien === 'tự túc') {
    return 'tu_tuc'
  }
  if (props.formDuLieu?.phuongTien === 'tàu hỏa' || props.transitTab === 'train') {
    return hasTrainSupport.value ? 'tau_hoa' : null
  }
  if (props.formDuLieu?.phuongTien === 'máy bay' || props.transitTab === 'flight') {
    return hasAirportSupport.value ? 'may_bay' : null
  }
  if (props.formDuLieu?.phuongTien === 'xe khách' || props.transitTab === 'bus') {
    return 'xe_khach'
  }
  return null // KHÔNG AUTO CHỌN PHƯƠNG TIỆN NGAY TỪ ĐẦU!
})

function onSelectTransportMode(id) {
  daXacNhanDichVu.value = false
  if (id === 'tu_tuc') {
    props.formDuLieu.phuongTien = 'tự túc'
    props.formDuLieu.tuTucPhuongTien = true
    props.formDuLieu.nhaXeDaChon = null
    props.formDuLieu.tauDaChon = null
    props.formDuLieu.chuyenBayDaChon = null
    emit('update:transitTab', 'self')
  } else if (id === 'xe_khach') {
    props.formDuLieu.phuongTien = 'xe khách'
    props.formDuLieu.tuTucPhuongTien = false
    emit('update:transitTab', 'bus')
  } else if (id === 'tau_hoa') {
    props.formDuLieu.phuongTien = 'tàu hỏa'
    props.formDuLieu.tuTucPhuongTien = false
    emit('update:transitTab', 'train')
  } else if (id === 'may_bay') {
    props.formDuLieu.phuongTien = 'máy bay'
    props.formDuLieu.tuTucPhuongTien = false
    emit('update:transitTab', 'flight')
  }
}

watch(availableTransports, (newTransports) => {
  const current = selectedTransportId.value
  if (current) {
    const isAvailable = newTransports.some(t => t.id === current)
    if (!isAvailable) {
      props.formDuLieu.phuongTien = ''
      props.formDuLieu.tuTucPhuongTien = false
      props.formDuLieu.nhaXeDaChon = null
      props.formDuLieu.tauDaChon = null
      props.formDuLieu.chuyenBayDaChon = null
      daXacNhanDichVu.value = false
    }
  }
})

function setHotelSort(sort) {
  emit('update:hotelSortBy', sort)
}

function setHotelStars(stars) {
  emit('update:hotelStarFilter', stars)
}

const showTicketConfirmationModal = ref(false)
const isModalTicketFlipped = ref(false)

function toggleModalTicketFlip() {
  isModalTicketFlipped.value = !isModalTicketFlipped.value
}

function moModalXacNhanVe() {
  isModalTicketFlipped.value = false
  showTicketConfirmationModal.value = true
}

function dongModalXacNhanVe() {
  showTicketConfirmationModal.value = false
  isModalTicketFlipped.value = false
}

function batDauLichTrinhTuModal() {
  showTicketConfirmationModal.value = false
  props.taoLichTrinh()
}

function getCityCode(cityName) {
  if (!cityName) return 'DAD'
  const n = cityName.toLowerCase()
  if (n.includes('hà nội') || n.includes('ha noi')) return 'HAN'
  if (n.includes('hồ chí minh') || n.includes('sài gòn') || n.includes('tphcm')) return 'SGN'
  if (n.includes('đà nẵng') || n.includes('da nang')) return 'DAD'
  if (n.includes('huế') || n.includes('hue')) return 'HUI'
  if (n.includes('quy nhơn') || n.includes('quy nhon')) return 'UIH'
  if (n.includes('nha trang') || n.includes('cam ranh')) return 'CXR'
  if (n.includes('phú yên') || n.includes('tuy hòa')) return 'TBB'
  if (n.includes('quảng bình') || n.includes('đồng hới')) return 'VDH'
  if (n.includes('quảng nam') || n.includes('chu lai')) return 'VCL'
  if (n.includes('buôn ma thuột') || n.includes('đắk lắk')) return 'BMV'
  if (n.includes('pleiku') || n.includes('gia lai')) return 'PXU'
  if (n.includes('đà lạt') || n.includes('lâm đồng')) return 'DLI'
  return cityName.slice(0, 3).toUpperCase()
}

const customerDisplayName = computed(() => {
  if (props.formDuLieu?.hoTen) return props.formDuLieu.hoTen
  if (props.formDuLieu?.tenNguoiDung) return props.formDuLieu.tenNguoiDung
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('nguoiDung')
    if (raw) {
      const u = JSON.parse(raw)
      if (u.name || u.hoTen || u.username) return (u.name || u.hoTen || u.username).toUpperCase()
    }
  } catch (e) {}
  return 'NGUYỄN MINH KHANG'
})

const ngayKhoiHanhFormatted = computed(() => {
  if (props.formDuLieu?.ngayKhoiHanh) {
    const parts = props.formDuLieu.ngayKhoiHanh.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  const today = new Date()
  return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
})

const ngayKetThucFormatted = computed(() => {
  const days = props.formDuLieu?.soDem || 2
  let d = props.formDuLieu?.ngayKhoiHanh ? new Date(props.formDuLieu.ngayKhoiHanh) : new Date()
  d.setDate(d.getDate() + days)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
})

const tongThanhToanTatCa = computed(() => {
  const ve = props.formDuLieu?.tuTucPhuongTien ? 0 : (props.formDuLieu?.nhaXeDaChon?.price || props.formDuLieu?.tauDaChon?.price || props.formDuLieu?.chuyenBayDaChon?.price || 0)
  const ks = props.formDuLieu?.tuTucKhachSan ? 0 : props.tongChiPhiKhachSanChon
  return ve + ks
})

function xacNhanVaXuatDichVu() {
  daXacNhanDichVu.value = true
  showTicketConfirmationModal.value = true
  nextTick(() => {
    const el = document.getElementById('step3-submit-plan-anchor')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// Tự động reset trạng thái xác nhận khi người dùng thay đổi lựa chọn hoặc chuyển bước
watch([
  () => props.currentPlannerStep,
  () => props.formDuLieu?.phuongTien,
  () => props.formDuLieu?.nhaXeDaChon,
  () => props.formDuLieu?.tauDaChon,
  () => props.formDuLieu?.chuyenBayDaChon,
  () => props.formDuLieu?.tuTucPhuongTien,
  () => props.formDuLieu?.khachSanDaChon,
  () => props.formDuLieu?.tuTucKhachSan
], ([newStep]) => {
  if (newStep === 1 || !props.daXongPhuongTien || !props.daXongKhachSan) {
    daXacNhanDichVu.value = false
    showTicketConfirmationModal.value = false
  }
})

const flightOperators = computed(() => {
  const orig = props.formDuLieu?.diemKhoiHanh || 'Hà Nội'
  const dest = props.formDuLieu?.diemDen || 'Đà Nẵng'
  const dist = props.transitRouteInfo?.estimatedDistanceKm || props.transitRouteInfo?.distanceKm || (props.formDuLieu?.daODiemDen ? 15 : getEstimatedDistance(orig, dest))
  const numPeople = props.formDuLieu?.soNguoi || 1

  const departAirport = PROVINCE_AIRPORT_MAP[orig] || `Sân bay khu vực ${orig}`
  const arriveAirport = PROVINCE_AIRPORT_MAP[dest] || `Sân bay khu vực ${dest}`
  const durationText = dist > 900 ? '1 giờ 45 phút' : '1 giờ 15 phút'

  const basePriceVj = Math.max(680000, Math.round(dist * 1150))
  const basePriceVn = Math.max(1150000, Math.round(dist * 1750))
  const basePriceQh = Math.max(890000, Math.round(dist * 1380))

  return [
    {
      id: 'flight-vj',
      airline_code: 'Vietjet Air',
      airline_short: 'vietjetair.com',
      name: 'Vietjet Air (Chuyến bay tiết kiệm)',
      type: 'Hạng Eco / Vé máy bay điện tử',
      badge: '⚡ Tiết kiệm nhất',
      rating: 4.6,
      duration: durationText,
      depart_times: '06:15, 10:45, 15:30, 20:10',
      depart_airport: departAirport,
      arrive_airport: arriveAirport,
      price: basePriceVj,
      totalForGroup: basePriceVj * numPeople,
      booking_url: 'https://vietjetair.com'
    },
    {
      id: 'flight-vna',
      airline_code: 'Vietnam Airlines',
      airline_short: 'vietnamairlines.com',
      name: 'Vietnam Airlines (Hãng Hàng Không Quốc Gia 4⭐)',
      type: 'Hạng Phổ Thông (Đã gồm 23kg hành lý + suất ăn nhẹ)',
      badge: '⭐ Đúng giờ & 4 sao',
      rating: 4.9,
      duration: durationText,
      depart_times: '07:30, 11:15, 14:00, 18:25',
      depart_airport: departAirport,
      arrive_airport: arriveAirport,
      price: basePriceVn,
      totalForGroup: basePriceVn * numPeople,
      booking_url: 'https://vietnamairlines.com'
    },
    {
      id: 'flight-qh',
      airline_code: 'Bamboo Airways',
      airline_short: 'bambooairways.com',
      name: 'Bamboo Airways (Trải nghiệm bay thân thiện)',
      type: 'Bamboo Economy / Hơn cả một chuyến bay',
      badge: '🌿 Thân thiện & Tiện nghi',
      rating: 4.7,
      duration: durationText,
      depart_times: '09:00, 13:40, 17:50',
      depart_airport: departAirport,
      arrive_airport: arriveAirport,
      price: basePriceQh,
      totalForGroup: basePriceQh * numPeople,
      booking_url: 'https://bambooairways.com'
    }
  ]
})

function chonChuyenBayLocal(flight) {
  if (typeof props.chonChuyenBay === 'function') {
    props.chonChuyenBay(flight)
  } else {
    if (props.formDuLieu.chuyenBayDaChon?.id === flight.id) {
      props.formDuLieu.chuyenBayDaChon = null
      props.formDuLieu.gioXuatPhatChon = ''
    } else {
      props.formDuLieu.chuyenBayDaChon = flight
      props.formDuLieu.phuongTien = 'máy bay'
      props.formDuLieu.nhaXeDaChon = null
      props.formDuLieu.tauDaChon = null
      props.formDuLieu.tuTucPhuongTien = false
      const times = flight.depart_times ? flight.depart_times.split(',').map(s => s.trim()) : []
      if (times.length && !props.formDuLieu.gioXuatPhatChon) {
        props.formDuLieu.gioXuatPhatChon = times[0]
      }
    }
  }
}

function chonGioXuatPhatChuyenBayLocal(flight, timeStr) {
  if (typeof props.chonGioXuatPhatChuyenBay === 'function') {
    props.chonGioXuatPhatChuyenBay(flight, timeStr)
  } else {
    props.formDuLieu.chuyenBayDaChon = flight
    props.formDuLieu.phuongTien = 'máy bay'
    props.formDuLieu.nhaXeDaChon = null
    props.formDuLieu.tauDaChon = null
    props.formDuLieu.tuTucPhuongTien = false
    props.formDuLieu.gioXuatPhatChon = timeStr
  }
}

onMounted(() => {
  nextTick(() => {
    updateSlider()
  })
  window.addEventListener('resize', updateSlider)
  document.addEventListener('click', handleClickOutsideAutocomplete)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSlider)
  document.removeEventListener('click', handleClickOutsideAutocomplete)
})
</script>



<style scoped>
/* ==================== CĂN CHỈNH BỐ CỤC WIZARD & ẢNH COLLAGE VỪA VẶN ==================== */
.trip-planner-wizard {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}

.planner-hero-banner {
  width: 100%;
  max-width: 980px;
  height: 320px;
  max-height: 350px;
  margin: 0 auto 20px auto;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  flex-shrink: 0;
  background: #0f172a;
}

.planner-hero-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 25%;
  display: block;
}

.planner-form-container {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}

/* ==================== MANUAL BUDGET INPUT ==================== */
/* ==================== STEP 1: INLINE VALIDATION & OVERNIGHT TRANSIT ==================== */
.dsb-inline-error {
  display: block;
  font-size: 11.5px;
  color: #ef4444;
  margin-top: 4px;
  font-weight: 600;
}


/* ==================== MANUAL BUDGET INPUT & ENHANCED SCOPE ==================== */
.manual-budget-card {
  padding: 18px 22px;
  background: var(--card-bg, #ffffff);
  border-radius: var(--radius-md, 12px);
  border: 1px solid var(--border-color, #e2e8f0);
}

:root[data-theme="dark"] .manual-budget-card {
  background: #162036;
  border-color: rgba(51, 65, 85, 0.7);
}

.budget-card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.budget-mode-segmented-control {
  display: flex;
  background: rgba(148, 163, 184, 0.15);
  padding: 3px;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

:root[data-theme="dark"] .budget-mode-segmented-control {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(51, 65, 85, 0.8);
}

.bmsc-btn {
  border: none;
  background: transparent;
  color: var(--text-sub, #64748b);
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bmsc-btn.active {
  background: var(--primary, #0284c7);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
}

.budget-calc-sub {
  font-size: 13px;
  color: var(--text-sub, #475569);
  font-weight: 500;
  margin-top: 3px;
}

:root[data-theme="dark"] .budget-calc-sub {
  color: #94a3b8;
}

.budget-calc-sub b {
  color: var(--accent, #ea580c);
  font-weight: 700;
}

.budget-scope-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color, #e2e8f0);
}

:root[data-theme="dark"] .budget-scope-section {
  border-color: rgba(51, 65, 85, 0.6);
}

.bss-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color, #1e293b);
  display: block;
  margin-bottom: 10px;
}

:root[data-theme="dark"] .bss-title {
  color: #f1f5f9;
}

.bss-checkboxes-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bss-checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-color, #334155);
  cursor: pointer;
}

:root[data-theme="dark"] .bss-checkbox-label {
  color: #cbd5e1;
}

.bss-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary, #0284c7);
  cursor: pointer;
}

/* ==================== ACCOMMODATION STATUS ==================== */
.accommodation-status-section {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color, #e2e8f0);
}

:root[data-theme="dark"] .accommodation-status-section {
  border-color: rgba(51, 65, 85, 0.6);
}

.ass-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color, #1e293b);
  display: block;
  margin-bottom: 10px;
}

:root[data-theme="dark"] .ass-title {
  color: #f1f5f9;
}

.ass-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

@media (max-width: 768px) {
  .ass-options-grid {
    grid-template-columns: 1fr;
  }
}

.ass-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1.5px solid var(--border-color, #cbd5e1);
  border-radius: 10px;
  background: var(--input-bg, #f8fafc);
  cursor: pointer;
  transition: all 0.2s ease;
}

:root[data-theme="dark"] .ass-card {
  background: #0f172a;
  border-color: #334155;
}

.ass-card.active {
  border-color: var(--primary, #0284c7);
  background: rgba(2, 132, 199, 0.05);
  box-shadow: 0 0 0 1px var(--primary, #0284c7);
}

:root[data-theme="dark"] .ass-card.active {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.ass-card input {
  margin-top: 3px;
  accent-color: var(--primary, #0284c7);
}

.ass-card-text strong {
  display: block;
  font-size: 13px;
  color: var(--text-color, #1e293b);
  margin-bottom: 2px;
}

:root[data-theme="dark"] .ass-card-text strong {
  color: #f1f5f9;
}

.ass-card-text small {
  display: block;
  font-size: 11.5px;
  color: var(--text-sub, #64748b);
  line-height: 1.35;
}

:root[data-theme="dark"] .ass-card-text small {
  color: #94a3b8;
}

.prebooked-cost-container {
  margin-top: 12px;
  padding: 12px 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 10px;
}

.pcc-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #b45309;
  display: block;
  margin-bottom: 6px;
}

:root[data-theme="dark"] .pcc-label {
  color: #fcd34d;
}

.pcc-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 320px;
}

.pcc-input {
  width: 100%;
  padding: 8px 50px 8px 12px;
  border: 1px solid #d97706;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: #ffffff;
  color: #1e293b;
}

:root[data-theme="dark"] .pcc-input {
  background: #1e293b;
  color: #ffffff;
  border-color: #f59e0b;
}

.pcc-currency {
  position: absolute;
  right: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #b45309;
}

:root[data-theme="dark"] .pcc-currency {
  color: #fcd34d;
}

.pcc-hint {
  display: block;
  font-size: 11.5px;
  color: #92400e;
  margin-top: 6px;
}

:root[data-theme="dark"] .pcc-hint {
  color: #fde68a;
}

/* ==================== ASSISTANT AUTO SUGGEST ==================== */
.picker-subtitle {
  display: block;
  font-size: 12px;
  color: var(--text-sub, #64748b);
  margin-top: 2px;
}

.picker-top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-assistant-suggest {
  border: 1px solid var(--primary, #0284c7);
  background: rgba(2, 132, 199, 0.08);
  color: var(--primary, #0284c7);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root[data-theme="dark"] .btn-assistant-suggest {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

.btn-assistant-suggest.active,
.btn-assistant-suggest:hover {
  background: var(--primary, #0284c7);
  color: #ffffff;
}

:root[data-theme="dark"] .btn-assistant-suggest.active,
:root[data-theme="dark"] .btn-assistant-suggest:hover {
  background: #38bdf8;
  color: #0f172a;
}

.assistant-suggest-active-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 10px;
  margin-top: 10px;
}

:root[data-theme="dark"] .assistant-suggest-active-card {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(52, 211, 153, 0.3);
}

.asac-content strong {
  display: block;
  font-size: 13px;
  color: #065f46;
  margin-bottom: 2px;
}

:root[data-theme="dark"] .asac-content strong {
  color: #6ee7b7;
}

.asac-content span {
  font-size: 12px;
  color: #047857;
}

:root[data-theme="dark"] .asac-content span {
  color: #a7f3d0;
}

.asac-cancel-btn {
  border: none;
  background: transparent;
  color: #065f46;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  white-space: nowrap;
}

:root[data-theme="dark"] .asac-cancel-btn {
  color: #6ee7b7;
}

/* ==================== QUICK DRAFT ACTION BAR ==================== */
.step2-quick-draft-bar {
  margin-top: 24px;
  padding: 18px 22px;
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
  border: 1.5px solid rgba(2, 132, 199, 0.25);
  border-radius: 14px;
}

:root[data-theme="dark"] .step2-quick-draft-bar {
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  border-color: rgba(56, 189, 248, 0.3);
}

.sqd-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.sqd-text strong {
  display: block;
  font-size: 15px;
  color: var(--text-color, #0f172a);
  margin-bottom: 3px;
}

:root[data-theme="dark"] .sqd-text strong {
  color: #ffffff;
}

.sqd-text p {
  font-size: 12.5px;
  color: var(--text-sub, #64748b);
  margin: 0;
}

:root[data-theme="dark"] .sqd-text p {
  color: #94a3b8;
}

.sqd-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sqd-btn-primary {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 11px 22px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
}

.sqd-btn-primary:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.45);
}

.sqd-btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sqd-btn-secondary {
  background: transparent;
  color: var(--primary, #0284c7);
  border: 1px solid var(--primary, #0284c7);
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root[data-theme="dark"] .sqd-btn-secondary {
  color: #38bdf8;
  border-color: #38bdf8;
}

.sqd-btn-secondary:hover {
  background: rgba(2, 132, 199, 0.08);
}

.btn-step3-direct-plan {
  margin-top: 10px;
  background: var(--primary, #0284c7);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-step3-direct-plan:hover:not(:disabled) {
  background: #0369a1;
}

.manual-budget-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 10px;
  background: var(--input-bg, #f8fafc);
  border: 1.5px solid var(--border-color, #cbd5e1);
  border-radius: 9999px;
  padding: 2px 18px 2px 4px;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

:root[data-theme="dark"] .manual-budget-input-wrapper {
  background: #0f172a;
  border-color: #334155;
}

.manual-budget-input-wrapper:focus-within {
  border-color: var(--primary, #0284c7);
  box-shadow: 0 0 0 3.5px rgba(2, 132, 199, 0.15), 0 4px 12px rgba(2, 132, 199, 0.1);
  background: #ffffff;
}

:root[data-theme="dark"] .manual-budget-input-wrapper:focus-within {
  background: #0f172a;
  border-color: #38bdf8;
  box-shadow: 0 0 0 3.5px rgba(56, 189, 248, 0.2);
}

.mbi-icon {
  padding-left: 16px;
  color: var(--primary, #0284c7);
  display: flex;
  align-items: center;
}

:root[data-theme="dark"] .mbi-icon {
  color: #38bdf8;
}

.manual-budget-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 13px 14px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  outline: none;
  font-family: inherit;
  letter-spacing: -0.01em;
}

:root[data-theme="dark"] .manual-budget-input {
  color: #f8fafc;
}

.manual-budget-input::placeholder {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.mbi-currency {
  padding-right: 18px;
  font-weight: 800;
  font-size: 14px;
  color: var(--accent, #ea580c);
  letter-spacing: 0.05em;
  user-select: none;
}

/* ==================== COMPACT PLACE AUTOCOMPLETE & SUGGESTIONS DROPDOWN ==================== */
.place-autocomplete-container {
  position: relative;
  width: 100%;
  margin-top: 14px;
}

.compact-autocomplete-bar {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid var(--border-color, #cbd5e1);
  border-radius: 9999px;
  padding: 4px 6px 4px 18px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

:root[data-theme="dark"] .compact-autocomplete-bar {
  background: #0f172a;
  border-color: #334155;
}

.compact-autocomplete-bar:focus-within {
  border-color: var(--primary, #0284c7);
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

:root[data-theme="dark"] .compact-autocomplete-bar:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

.compact-autocomplete-bar .pps-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 9px 10px;
  font-size: 14px;
  color: var(--text-main, #0f172a);
  outline: none;
}

:root[data-theme="dark"] .compact-autocomplete-bar .pps-input {
  color: #f8fafc;
}

.compact-autocomplete-bar .pps-input::placeholder {
  color: #94a3b8;
  font-size: 13.5px;
}

.pps-add-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--primary, #0284c7);
  color: #ffffff;
  border: none;
  padding: 9px 20px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pps-add-action-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.pps-add-action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Dropdown Container */
.place-suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 14px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
  z-index: 100;
  max-height: 380px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

:root[data-theme="dark"] .place-suggestions-dropdown {
  background: #162036;
  border-color: #334155;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

.psd-header {
  padding: 10px 14px 6px;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted, #64748b);
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
}

:root[data-theme="dark"] .psd-header {
  border-bottom-color: rgba(51, 65, 85, 0.5);
}

.psd-list {
  display: flex;
  flex-direction: column;
}

.psd-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  transition: background 0.15s ease;
}

:root[data-theme="dark"] .psd-item {
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.psd-item:hover {
  background: rgba(2, 132, 199, 0.08);
}

.psd-item.selected {
  background: rgba(16, 185, 129, 0.08);
}

.psd-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(2, 132, 199, 0.12);
  color: var(--primary, #0284c7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

:root[data-theme="dark"] .psd-item-icon {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
}

.psd-item.selected .psd-item-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.psd-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.psd-item-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.psd-item-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root[data-theme="dark"] .psd-item-name {
  color: #f8fafc;
}

.psd-item-city {
  font-size: 11px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-sub, #475569);
  padding: 1px 7px;
  border-radius: 6px;
  flex-shrink: 0;
}

:root[data-theme="dark"] .psd-item-city {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.psd-item-sub {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.psd-item-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--border-color, #cbd5e1);
  background: transparent;
  color: var(--text-main, #0f172a);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

:root[data-theme="dark"] .psd-item-btn {
  border-color: #334155;
  color: #cbd5e1;
}

.psd-item-btn:hover {
  background: var(--primary, #0284c7);
  color: #ffffff;
  border-color: var(--primary, #0284c7);
}

.psd-item-btn.active {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

.psd-custom-add {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(2, 132, 199, 0.05);
  cursor: pointer;
  border-top: 1px dashed var(--border-color, #cbd5e1);
  transition: background 0.15s ease;
}

:root[data-theme="dark"] .psd-custom-add {
  background: rgba(56, 189, 248, 0.08);
  border-top-color: #334155;
}

.psd-custom-add:hover {
  background: rgba(2, 132, 199, 0.12);
}

.psd-custom-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary, #0284c7);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.psd-custom-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-main, #0f172a);
}

:root[data-theme="dark"] .psd-custom-text {
  color: #f8fafc;
}

.psd-custom-text strong {
  color: var(--primary, #0284c7);
}

:root[data-theme="dark"] .psd-custom-text strong {
  color: #38bdf8;
}

.psd-custom-badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted, #64748b);
  background: rgba(0, 0, 0, 0.06);
  padding: 3px 8px;
  border-radius: 6px;
}

:root[data-theme="dark"] .psd-custom-badge {
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

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
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid rgba(203, 213, 225, 0.9);
  padding: 4px;
  border-radius: 25px;
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  animation: slide-in 0.6s ease-out;
  width: 100%;
  max-width: 680px;
  height: 44px;
  box-sizing: border-box;
}

:root[data-theme="dark"] .origin-mode-group {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

:root[data-theme="light"] .origin-mode-group,
:root:not([data-theme="dark"]) .origin-mode-group {
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
    0 3px 12px rgba(15, 23, 42, 0.12),
    0 1px 4px rgba(15, 23, 42, 0.08);
  z-index: 0;
}

:root[data-theme="dark"] .origin-mode-group .slider {
  background: #ffffff;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.12);
}

:root[data-theme="light"] .origin-mode-group .slider,
:root:not([data-theme="dark"]) .origin-mode-group .slider {
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
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  border-radius: 25px;
  position: relative;
  white-space: nowrap;
}

:root[data-theme="dark"] .origin-mode-group .radio-label {
  color: rgba(255, 255, 255, 0.85);
}

:root[data-theme="light"] .origin-mode-group .radio-label,
:root:not([data-theme="dark"]) .origin-mode-group .radio-label {
  color: #475569;
}

.origin-mode-group .radio-option input[type="radio"]:checked + .radio-label {
  color: #0284c7;
  font-weight: 700;
  text-shadow: none;
}

.origin-mode-group .radio-label:hover {
  color: #0f172a;
}

:root[data-theme="dark"] .origin-mode-group .radio-label:hover {
  color: rgba(255, 255, 255, 0.95);
}

:root[data-theme="light"] .origin-mode-group .radio-label:hover,
:root:not([data-theme="dark"]) .origin-mode-group .radio-label:hover {
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

/* Ajuste automático del slider cho 3 options */
.origin-mode-group:has(#origin-opt-manual:checked) .slider,
.origin-mode-group.is-manual .slider {
  left: 4px;
  width: calc(33.333% - 4px);
}

.origin-mode-group:has(#origin-opt-gps:checked) .slider,
.origin-mode-group.is-gps .slider {
  left: calc(33.333% + 2px);
  width: calc(33.333% - 4px);
}

.origin-mode-group:has(#origin-opt-at-destination:checked) .slider,
.origin-mode-group.is-at-destination .slider {
  left: calc(66.666%);
  width: calc(33.333% - 4px);
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
.city-selector-outer {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.city-scroll-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(241, 245, 249, 0.95);
  border: 1px solid rgba(203, 213, 225, 0.9);
  color: #1e293b;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:root[data-theme="dark"] .city-scroll-arrow {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.city-scroll-arrow:hover {
  background: rgba(2, 132, 199, 0.15);
  border-color: #0284c7;
  color: #0284c7;
  transform: scale(1.08);
}

:root[data-theme="dark"] .city-scroll-arrow:hover {
  background: rgba(56, 189, 248, 0.25);
  border-color: rgba(56, 189, 248, 0.6);
  color: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
}

.city-scroll-arrow:active {
  transform: scale(0.95);
}

:root[data-theme="light"] .city-scroll-arrow,
:root:not([data-theme="dark"]) .city-scroll-arrow {
  background: rgba(241, 245, 249, 0.95);
  border-color: rgba(203, 213, 225, 0.9);
  color: #1e293b;
}

:root[data-theme="light"] .city-scroll-arrow:hover,
:root:not([data-theme="dark"]) .city-scroll-arrow:hover {
  background: rgba(2, 132, 199, 0.15);
  border-color: #0284c7;
  color: #0284c7;
}

.city-radio-group {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  min-width: 0;
  background: rgba(241, 245, 249, 0.88);
  border: 1px solid rgba(203, 213, 225, 0.8);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 999px;
  position: relative;
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  animation: slide-in 0.6s ease-out;
  cursor: grab;
}

:root[data-theme="dark"] .city-radio-group {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

:root[data-theme="light"] .city-radio-group,
:root:not([data-theme="dark"]) .city-radio-group {
  background: rgba(241, 245, 249, 0.88);
  border-color: rgba(203, 213, 225, 0.8);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.city-radio-group:active {
  cursor: grabbing;
}

.city-radio-group::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
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
    0 3px 12px rgba(15, 23, 42, 0.14),
    0 1px 4px rgba(15, 23, 42, 0.08);
  z-index: 1;
  pointer-events: none;
}

:root[data-theme="dark"] .city-radio-group .slider {
  box-shadow:
    0 3px 14px rgba(0, 0, 0, 0.22),
    0 1px 4px rgba(0, 0, 0, 0.12);
}

:root[data-theme="light"] .city-radio-group .slider,
:root:not([data-theme="dark"]) .city-radio-group .slider {
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
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
  border-radius: 999px;
  position: relative;
  white-space: nowrap;
}

:root[data-theme="dark"] .city-radio-label {
  color: rgba(255, 255, 255, 0.78);
}

:root[data-theme="light"] .city-radio-label,
:root:not([data-theme="dark"]) .city-radio-label {
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
:root[data-theme="light"] .city-radio-option input[type="radio"]:checked + .city-radio-label,
:root:not([data-theme="dark"]) .city-radio-option.active .city-radio-label,
:root:not([data-theme="dark"]) .city-radio-option input[type="radio"]:checked + .city-radio-label {
  color: #0284c7;
  font-weight: 800;
}

.city-radio-label:hover {
  color: #0f172a;
}

:root[data-theme="dark"] .city-radio-label:hover {
  color: #ffffff;
}

:root[data-theme="light"] .city-radio-label:hover,
:root:not([data-theme="dark"]) .city-radio-label:hover {
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
  color: var(--text-color, #0f172a);
}

:root[data-theme="dark"] .city-field-header .field-label-text {
  color: #f8fafc;
}

.route-origin-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #64748b;
  background: rgba(15, 23, 42, 0.04);
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

:root[data-theme="dark"] .route-origin-indicator {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--text-muted, #94a3b8);
  backdrop-filter: blur(10px);
}

:root[data-theme="light"] .route-origin-indicator,
:root:not([data-theme="dark"]) .route-origin-indicator {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.08);
  color: #64748b;
}

.route-origin-indicator strong {
  color: #0284c7;
  font-weight: 700;
}

:root[data-theme="dark"] .route-origin-indicator strong {
  color: #38bdf8;
}

:root[data-theme="light"] .route-origin-indicator strong,
:root:not([data-theme="dark"]) .route-origin-indicator strong {
  color: #0284c7;
}

.roi-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0284c7;
  box-shadow: 0 0 6px rgba(2, 132, 199, 0.4);
  flex-shrink: 0;
}

:root[data-theme="dark"] .roi-dot {
  background: #38bdf8;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
}

.city-km-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: #64748b;
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: all 0.25s ease;
  line-height: 1.2;
}

:root[data-theme="dark"] .city-km-pill {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
  border-color: rgba(255, 255, 255, 0.12);
}

:root[data-theme="light"] .city-km-pill,
:root:not([data-theme="dark"]) .city-km-pill {
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

/* ==================== HIỆU ỨNG VŨ TRỤ CHO NÚT TIẾP THEO & QUAY LẠI ==================== */
.wizard-footer {
  overflow: visible !important;
}

.space-next-container,
.space-back-container {
  flex: 1 !important;
  width: 100% !important;
  height: 48px !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  margin: 0 !important;
  overflow: visible !important;
}

/* Các thiên thể SVG bay quanh nút */
.space-next-container .svg,
.space-back-container .svg {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 15;
  transform: translate(-50%, -50%) scale(0.2);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
}

/* Hiệu ứng hào quang phát sáng khi hover */
.space-next-container:hover {
  box-shadow: 0 0 45px rgba(66, 125, 194, 0.8), 0 0 20px rgba(56, 189, 248, 0.5) !important;
}

.space-back-container:hover {
  box-shadow: 0 0 45px rgba(124, 58, 237, 0.75), 0 0 20px rgba(168, 85, 247, 0.45) !important;
}

.space-next-container:hover > .svg,
.space-back-container:hover > .svg {
  opacity: 1;
}

/* Quỹ đạo bay cho 5 thiên thể nút Tiếp theo (Saturn, UFO, Rocket, Earth, Moon) */
/* Căn chuẩn tâm đối xứng hoàn hảo bao quanh cụm chữ 'Tiếp theo →' */
.space-next-container:hover > .svg-1 {
  /* Saturn (Sao Thổ) - góc dưới bên phải mũi tên '→' */
  transform: translate(calc(-50% + 55px), calc(-50% + 40px)) rotate(-15deg) scale(0.92);
}

.space-next-container:hover > .svg-2 {
  /* UFO (Đĩa bay) - góc trên bên trái chữ 'Tiếp' */
  transform: translate(calc(-50% - 60px), calc(-50% - 40px)) rotate(18deg) scale(0.95);
}

.space-next-container:hover > .svg-3 {
  /* Rocket (Tàu con thoi) - góc trên bên phải mũi tên '→' */
  transform: translate(calc(-50% + 55px), calc(-50% - 40px)) rotate(-25deg) scale(0.95);
}

.space-next-container:hover > .svg-4 {
  /* Earth (Trái đất) - góc dưới bên trái chữ 'Tiếp' */
  transform: translate(calc(-50% - 65px), calc(-50% + 40px)) rotate(15deg) scale(0.9);
}

.space-next-container:hover > .svg-5 {
  /* Moon (Mặt trăng) - chính giữa phía dưới chữ 'Tiếp theo' */
  transform: translate(calc(-50% - 6px), calc(-50% + 42px)) rotate(-10deg) scale(1);
}

/* Quỹ đạo bay cho 5 thiên thể nút Quay lại (Comet, Satellite, Wormhole, Astronaut, Compass Star) */
/* Căn chuẩn tâm đối xứng hoàn hảo bao quanh cụm chữ '← Quay lại' */
.space-back-container:hover > .svg-b1 {
  /* Comet (Sao băng) - góc trên bên trái mũi tên '←' */
  transform: translate(calc(-50% - 55px), calc(-50% - 40px)) rotate(-25deg) scale(0.95);
}

.space-back-container:hover > .svg-b2 {
  /* Satellite (Vệ tinh) - góc trên bên phải chữ 'lại' */
  transform: translate(calc(-50% + 60px), calc(-50% - 40px)) rotate(18deg) scale(0.95);
}

.space-back-container:hover > .svg-b3 {
  /* Wormhole (Cổng không gian) - góc dưới bên trái mũi tên '←' */
  transform: translate(calc(-50% - 55px), calc(-50% + 40px)) rotate(45deg) scale(0.92);
}

.space-back-container:hover > .svg-b4 {
  /* Astronaut (Mũ phi hành gia) - góc dưới bên phải chữ 'lại' */
  transform: translate(calc(-50% + 65px), calc(-50% + 40px)) rotate(-12deg) scale(0.9);
}

.space-back-container:hover > .svg-b5 {
  /* Compass Star (Ngôi sao định hướng) - chính giữa phía dưới chữ 'Quay lại' */
  transform: translate(calc(-50% + 6px), calc(-50% + 42px)) rotate(10deg) scale(1);
}

/* Chuẩn kích thước ban đầu (height: 48px, flex: 1, 100% container) */
.space-btn,
.space-back-btn {
  width: 100% !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  flex: 1 !important;
  position: relative !important;
  z-index: 10 !important;
  border-radius: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  box-sizing: border-box !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  padding: 0 24px !important;
  line-height: normal !important;
  letter-spacing: 0.3px;
}

/* === NÚT TIẾP THEO (COSMIC BLUE) === */
.space-btn {
  background-color: rgb(66, 125, 194) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 14px rgba(66, 125, 194, 0.35) !important;
}

:root[data-theme="dark"] .space-btn {
  background-color: #1a2234 !important;
  border-color: rgb(66, 125, 194) !important;
}

.space-next-container:hover .space-btn {
  outline: rgb(66, 125, 194) solid 2px !important;
  outline-offset: 3px !important;
  background-color: #1e1e24 !important;
  color: #ffffff !important;
  border-color: #60a5fa !important;
  box-shadow: 0 0 24px rgba(66, 125, 194, 0.6) !important;
  transform: translateY(-1px) !important;
}

/* === NÚT QUAY LẠI (COSMIC VIOLET RETURN) === */
.space-back-btn {
  background: var(--input-bg, #f1f5f9) !important;
  color: var(--text-main, #334155) !important;
  border: 1.5px solid var(--border-color, #cbd5e1) !important;
}

:root[data-theme="dark"] .space-back-btn {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}

.space-back-container:hover .space-back-btn {
  outline: rgb(139, 92, 246) solid 2px !important;
  outline-offset: 3px !important;
  background-color: #1e1e24 !important;
  color: #ffffff !important;
  border-color: #a78bfa !important;
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.5) !important;
  transform: translateY(-1px) !important;
}

/* Hiệu ứng bấm nút */
.space-btn:active,
.space-back-btn:active {
  transform: scale(0.98) !important;
}

/* Hiệu ứng mũi tên chuyển động */
.space-btn-arrow,
.space-back-arrow {
  display: inline-block;
  font-size: 1.1rem;
  transition: transform 0.25s ease;
}

.space-next-container:hover .space-btn-arrow {
  transform: translateX(4px);
}

.space-back-container:hover .space-back-arrow {
  transform: translateX(-4px);
}

/* Trạng thái disabled khi đang tạo lịch trình */
.space-btn:disabled,
.space-back-btn:disabled {
  opacity: 0.55 !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

.space-next-container:has(button:disabled):hover,
.space-back-container:has(button:disabled):hover {
  box-shadow: none !important;
}

.space-next-container:has(button:disabled):hover > .svg,
.space-back-container:has(button:disabled):hover > .svg {
  opacity: 0 !important;
}

@media (max-width: 600px) {
  .wizard-footer {
    flex-direction: column !important;
    gap: 12px !important;
  }
  .space-next-container,
  .space-back-container {
    width: 100% !important;
  }
  .space-next-container:hover > .svg-1 {
    transform: translate(calc(-50% + 48px), calc(-50% + 36px)) rotate(-15deg) scale(0.8);
  }
  .space-next-container:hover > .svg-2 {
    transform: translate(calc(-50% - 52px), calc(-50% - 36px)) rotate(18deg) scale(0.85);
  }
  .space-next-container:hover > .svg-3 {
    transform: translate(calc(-50% + 48px), calc(-50% - 36px)) rotate(-25deg) scale(0.85);
  }
  .space-next-container:hover > .svg-4 {
    transform: translate(calc(-50% - 56px), calc(-50% + 36px)) rotate(15deg) scale(0.78);
  }
  .space-next-container:hover > .svg-5 {
    transform: translate(calc(-50% - 5px), calc(-50% + 38px)) rotate(-10deg) scale(0.88);
  }
  .space-back-container:hover > .svg-b1 {
    transform: translate(calc(-50% - 48px), calc(-50% - 36px)) rotate(-25deg) scale(0.85);
  }
  .space-back-container:hover > .svg-b2 {
    transform: translate(calc(-50% + 52px), calc(-50% - 36px)) rotate(18deg) scale(0.85);
  }
  .space-back-container:hover > .svg-b3 {
    transform: translate(calc(-50% - 48px), calc(-50% + 36px)) rotate(45deg) scale(0.8);
  }
  .space-back-container:hover > .svg-b4 {
    transform: translate(calc(-50% + 56px), calc(-50% + 36px)) rotate(-12deg) scale(0.78);
  }
  .space-back-container:hover > .svg-b5 {
    transform: translate(calc(-50% + 5px), calc(-50% + 38px)) rotate(10deg) scale(0.88);
  }
}
/* ==================== BỘ CHỌN PHƯƠNG TIỆN UIVERSE.IO RADIO TILE ==================== */
.transport-uiverse-selector-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 18px 0 24px 0;
}

/* From Uiverse.io by Yaya12085 - Modified for Dark Mode */
.radio-inputs {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  flex-wrap: wrap;
}

.radio-inputs > * {
  margin: 6px;
}

/* ==================== BỘ CHỌN PHƯƠNG TIỆN UIVERSE RADIO TILES ==================== */
.radio-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  min-height: 86px;
  border-radius: 0.75rem;
  border: 2px solid #e2e8f0;
  background-color: #ffffff;
  color: #64748b;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  padding: 10px 6px;
}

.radio-tile:before {
  content: "";
  position: absolute;
  display: block;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid #cbd5e1;
  background-color: #ffffff;
  border-radius: 50%;
  top: 0.35rem;
  left: 0.35rem;
  opacity: 0;
  transform: scale(0);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.radio-tile:hover {
  border-color: #3b82f6;
  color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.12);
}

.radio-tile:hover:before {
  transform: scale(0.85);
  opacity: 0.6;
  border-color: #3b82f6;
}

.radio-input:checked + .radio-tile {
  border-color: #2563eb;
  background-color: #eff6ff;
  color: #2563eb;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.2);
}

.radio-input:checked + .radio-tile:before {
  transform: scale(1);
  opacity: 1;
  background-color: #2563eb;
  border-color: #2563eb;
}

.radio-input:focus + .radio-tile {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
}

.radio-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

.radio-icon .r-icon-svg {
  width: 28px;
  height: 28px;
  fill: currentColor;
  transition: fill 0.2s ease, transform 0.2s ease;
}

.radio-tile:hover .r-icon-svg {
  transform: scale(1.08);
}

.radio-label {
  color: inherit;
  transition: color 0.2s ease;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.radio-input {
  clip: rect(0 0 0 0);
  -webkit-clip-path: inset(100%);
  clip-path: inset(100%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* DARK MODE CHUẨN UIVERSE THEO YÊU CẦU */
:root[data-theme="dark"] .radio-tile {
  background-color: #1e2129;
  border-color: #4a5265;
  color: #94a3b8;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}

:root[data-theme="dark"] .radio-tile:before {
  border-color: #4a5265;
  background-color: #1e2129;
}

:root[data-theme="dark"] .radio-tile:hover {
  border-color: #4d8bff;
  color: #4d8bff;
  box-shadow: 0 6px 16px rgba(77, 139, 255, 0.2);
}

:root[data-theme="dark"] .radio-tile:hover:before {
  border-color: #4d8bff;
}

:root[data-theme="dark"] .radio-input:checked + .radio-tile {
  background-color: #171d2b;
  border-color: #4d8bff;
  color: #4d8bff;
  box-shadow: 0 6px 16px rgba(77, 139, 255, 0.35);
}

:root[data-theme="dark"] .radio-input:checked + .radio-tile:before {
  background-color: #4d8bff;
  border-color: #4d8bff;
}

:root[data-theme="dark"] .radio-input:focus + .radio-tile {
  border-color: #4d8bff;
  box-shadow: 0 0 0 3px rgba(77, 139, 255, 0.3);
}

/* ==================== PANEL CHI TIẾT TỰ TÚC PHƯƠNG TIỆN ==================== */
.tu-tuc-panel-box {
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px dashed var(--border-color, #e2e8f0);
}

.tu-tuc-card {
  background: #f8fafc;
  border: 1.5px solid #10b981;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

:root[data-theme="dark"] .tu-tuc-card {
  background: var(--bg-soft, #1e293b);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

:root[data-theme="light"] .tu-tuc-card,
:root:not([data-theme="dark"]) .tu-tuc-card {
  background: #f8fafc;
  border-color: #10b981;
}

.ttc-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ttc-icon-badge {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ttc-icon-badge svg {
  width: 28px;
  height: 28px;
  fill: #10b981;
}

.ttc-header h4 {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 3px 0;
  color: var(--text-color, #0f172a);
}

:root[data-theme="dark"] .ttc-header h4 {
  color: #f8fafc;
}

.ttc-sub {
  font-size: 13px;
  color: var(--text-muted, #64748b);
  margin: 0;
}

:root[data-theme="dark"] .ttc-sub {
  color: #94a3b8;
}

.ttc-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 680px) {
  .ttc-metrics-grid {
    grid-template-columns: 1fr;
  }
}

.ttc-metric {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:root[data-theme="dark"] .ttc-metric {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.08);
}

:root[data-theme="light"] .ttc-metric,
:root:not([data-theme="dark"]) .ttc-metric {
  background: #ffffff;
  border-color: #e2e8f0;
}

.ttc-metric-lbl {
  font-size: 12px;
  color: var(--text-muted, #64748b);
  display: flex;
  align-items: center;
  gap: 6px;
}

:root[data-theme="dark"] .ttc-metric-lbl {
  color: #94a3b8;
}

.ttc-metric-val {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-color, #0f172a);
}

:root[data-theme="dark"] .ttc-metric-val {
  color: #f8fafc;
}

.ttc-metric-val.free {
  color: #10b981;
}

.ttc-notes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f1f5f9;
  padding: 12px 14px;
  border-radius: 10px;
  border-left: 3px solid #10b981;
}

:root[data-theme="dark"] .ttc-notes {
  background: rgba(255, 255, 255, 0.03);
}

:root[data-theme="light"] .ttc-notes,
:root:not([data-theme="dark"]) .ttc-notes {
  background: #f1f5f9;
}

.ttc-note-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-color, #334155);
  line-height: 1.4;
}

:root[data-theme="dark"] .ttc-note-item {
  color: #cbd5e1;
}

.ttc-action-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.ttc-btn-continue {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.ttc-btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45);
}

/* ==================== MÁY BAY / FLIGHT OPERATORS ==================== */
.flight-operators-box {
  margin-top: 10px;
  border-top: 1px dashed var(--border-color, #e2e8f0);
  padding-top: 16px;
}

.flight-card {
  border-color: rgba(56, 189, 248, 0.35);
}

.flight-card:hover {
  border-color: #38bdf8;
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.15);
}

.flight-card.selected {
  border-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.12);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3);
}

.flight-tag {
  background: rgba(56, 189, 248, 0.15);
  color: #0284c7;
}

:root[data-theme="dark"] .flight-tag {
  color: #38bdf8;
}

.flight-time-chip {
  border-color: rgba(56, 189, 248, 0.3);
  color: #0284c7;
}

:root[data-theme="dark"] .flight-time-chip {
  color: #38bdf8;
}

.flight-time-chip.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

.flight-price-color {
  color: #0284c7 !important;
}

:root[data-theme="dark"] .flight-price-color {
  color: #38bdf8 !important;
}

.flight-total-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #0284c7;
}

:root[data-theme="dark"] .flight-total-badge {
  color: #38bdf8;
}

.flight-call {
  border-color: rgba(56, 189, 248, 0.3);
  color: #0284c7;
}

:root[data-theme="dark"] .flight-call {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.4);
}

.flight-select-btn {
  background: #0284c7;
  color: #ffffff;
}

.flight-select-btn:hover {
  background: #0369a1;
}

.flight-select-btn.active {
  background: #10b981;
}

.tbn-badge.flight {
  background: rgba(56, 189, 248, 0.15);
  color: #0284c7;
  border-color: rgba(56, 189, 248, 0.4);
}

:root[data-theme="dark"] .tbn-badge.flight {
  color: #38bdf8;
}

/* ==================== HƯỚNG DẪN KHI CHƯA CHỌN PHƯƠNG TIỆN ==================== */
.no-transport-hint-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  margin: 12px 0 20px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
}

.no-transport-hint-card .nthc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  flex-shrink: 0;
}

.no-transport-hint-card .nthc-info h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.no-transport-hint-card .nthc-info p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

:root[data-theme="dark"] .no-transport-hint-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
  color: #94a3b8;
}

:root[data-theme="dark"] .no-transport-hint-card .nthc-icon {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

:root[data-theme="dark"] .no-transport-hint-card .nthc-info h4 {
  color: #f1f5f9;
}

:root[data-theme="dark"] .no-transport-hint-card .nthc-info p {
  color: #94a3b8;
}

/* ==================== KHỐI XÁC NHẬN & XUẤT VÉ XE + THẺ KHÁCH SẠN ==================== */
.step3-confirmation-section {
  margin: 28px 0 16px 0;
  animation: fadeIn 0.4s ease-out;
}

/* KHI CHƯA XÁC NHẬN: CARD KÊU GỌI XÁC NHẬN - BỐ CỤC GỌN GÀNG & HIỆU ỨNG VŨ TRỤ */
.service-confirm-prompt-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 28px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(224, 242, 254, 0.8) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: visible;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.scpc-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.scpc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.25));
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #2563eb;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.scpc-text {
  flex: 1;
  min-width: 0;
}

.scpc-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.scpc-text h4 {
  margin: 0;
  font-size: 16.5px;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: -0.2px;
}

.scpc-status-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.35);
  display: inline-flex;
  align-items: center;
}

.scpc-text p {
  margin: 0 0 12px 0;
  font-size: 13.5px;
  color: #475569;
  line-height: 1.5;
}

.scpc-quick-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.scpc-review-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 13px;
  background: #ffffff;
  border: 1px solid rgba(191, 219, 254, 0.9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.scpc-review-tag.transit .scpc-tag-type {
  color: #2563eb;
}

.scpc-review-tag.hotel .scpc-tag-type {
  color: #d97706;
}

.scpc-tag-type {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  font-size: 12.5px;
}

.scpc-tag-val {
  color: #0f172a;
  font-weight: 700;
  font-size: 13px;
}

/* === NÚT XÁC NHẬN HIỆU ỨNG VŨ TRỤ (COSMIC SPACE CONFIRM BUTTON) === */
.space-confirm-container {
  width: auto !important;
  height: 48px !important;
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  margin: 0 !important;
  overflow: visible !important;
  flex-shrink: 0;
}

.space-confirm-container .svg {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 15;
  transform: translate(-50%, -50%) scale(0.2);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
}

.space-confirm-container:hover {
  box-shadow: 0 0 45px rgba(37, 99, 235, 0.8), 0 0 20px rgba(96, 165, 250, 0.5) !important;
}

.space-confirm-container:hover > .svg {
  opacity: 1;
}

/* Quỹ đạo bay 5 thiên thể xung quanh nút Xác nhận */
.space-confirm-container:hover > .svg-1 {
  /* Saturn (Sao Thổ) - góc dưới bên phải mũi tên '➔' */
  transform: translate(calc(-50% + 140px), calc(-50% + 38px)) rotate(-15deg) scale(0.92);
}

.space-confirm-container:hover > .svg-2 {
  /* UFO (Đĩa bay) - góc trên bên trái */
  transform: translate(calc(-50% - 145px), calc(-50% - 38px)) rotate(18deg) scale(0.95);
}

.space-confirm-container:hover > .svg-3 {
  /* Rocket (Tàu con thoi) - góc trên bên phải mũi tên '➔' */
  transform: translate(calc(-50% + 140px), calc(-50% - 38px)) rotate(-25deg) scale(0.95);
}

.space-confirm-container:hover > .svg-4 {
  /* Earth (Trái đất) - góc dưới bên trái */
  transform: translate(calc(-50% - 145px), calc(-50% + 38px)) rotate(15deg) scale(0.9);
}

.space-confirm-container:hover > .svg-5 {
  /* Moon (Mặt trăng) - chính giữa phía dưới nút */
  transform: translate(calc(-50%), calc(-50% + 42px)) rotate(-10deg) scale(1);
}

.space-confirm-btn {
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  position: relative !important;
  z-index: 10 !important;
  border-radius: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  font-size: 14.5px !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  box-sizing: border-box !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  padding: 0 24px !important;
  white-space: nowrap !important;
  background-color: rgb(37, 99, 235) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35) !important;
}

.space-confirm-container:hover .space-confirm-btn {
  outline: #3b82f6 solid 2px !important;
  outline-offset: 3px !important;
  background-color: #1e1e24 !important;
  color: #ffffff !important;
  border-color: #60a5fa !important;
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.6) !important;
  transform: translateY(-1px) !important;
}

.space-confirm-btn:active {
  transform: scale(0.98) !important;
}

/* === DARK MODE === */
:root[data-theme="dark"] .service-confirm-prompt-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.2) 50%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(59, 130, 246, 0.38);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

:root[data-theme="dark"] .scpc-icon {
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(59, 130, 246, 0.2));
  border-color: rgba(96, 165, 250, 0.4);
  color: #60a5fa;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

:root[data-theme="dark"] .scpc-text h4 {
  color: #f1f5f9;
}

:root[data-theme="dark"] .scpc-status-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.4);
}

:root[data-theme="dark"] .scpc-text p {
  color: #94a3b8;
}

:root[data-theme="dark"] .scpc-review-tag {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(51, 65, 85, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

:root[data-theme="dark"] .scpc-tag-val {
  color: #f8fafc;
}

:root[data-theme="dark"] .space-confirm-btn {
  background-color: #1a2234 !important;
  border-color: #3b82f6 !important;
}

.step3-pending-guide-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  margin: 20px 0;
  background: rgba(2, 132, 199, 0.06);
  border: 1px dashed rgba(2, 132, 199, 0.3);
  border-radius: 12px;
  color: var(--text-muted, #64748b);
  font-size: 13.5px;
}
.spgb-icon {
  color: #0284c7;
  flex-shrink: 0;
}
.spgb-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  margin: 0 3px;
}
.spgb-badge.done {
  background: #dcfce7;
  color: #15803d;
}

:root[data-theme="dark"] .step3-pending-guide-box {
  background: rgba(2, 132, 199, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
  color: #94a3b8;
}
:root[data-theme="dark"] .spgb-badge {
  background: #1e293b;
  color: #94a3b8;
}
:root[data-theme="dark"] .spgb-badge.done {
  background: #064e3b;
  color: #6ee7b7;
}

@media (max-width: 900px) {
  .service-confirm-prompt-card {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
    padding: 18px 20px;
  }
  .space-confirm-container {
    width: 100% !important;
  }
  .space-confirm-btn {
    width: 100% !important;
  }
}

/* KHI ĐÃ XÁC NHẬN: THÔNG BÁO THÀNH CÔNG VÀ 2 TẤM THẺ */
.service-confirmed-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.4s ease-out;
}

.sc-success-alert {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1.5px solid #6ee7b7;
  border-radius: 14px;
  color: #065f46;
}

.sc-success-alert .scsa-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #10b981;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.sc-success-alert .scsa-text strong {
  display: block;
  font-size: 15px;
  margin-bottom: 2px;
  color: #047857;
}

.sc-success-alert .scsa-text p {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}

:root[data-theme="dark"] .sc-success-alert {
  background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
  border-color: #059669;
  color: #a7f3d0;
}

:root[data-theme="dark"] .sc-success-alert .scsa-text strong {
  color: #34d399;
}

/* ==================== THẺ PREVIEW CHUYẾN ĐI TRÊN TRANG ==================== */
.sc-success-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 22px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1.5px solid #6ee7b7;
  border-radius: 14px;
  color: #065f46;
  flex-wrap: wrap;
}

.scsa-btn-view-ticket {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.scsa-btn-view-ticket:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
}

.page-ticket-preview-card {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
}

.page-ticket-preview-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
}

.ptpc-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #cbd5e1;
}

.ptpc-title-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: 0.5px;
}

.ptpc-click-hint {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.ptpc-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.ptpc-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ptpc-lbl {
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
}

.ptpc-val {
  font-size: 14.5px;
  color: #1e293b;
  font-weight: 700;
}

.ptpc-val.highlight {
  color: #2563eb;
}

.ptpc-sub {
  font-size: 12px;
  color: #64748b;
}

.ptpc-price {
  font-size: 17px;
  font-weight: 900;
  color: #059669;
}

.ptpc-status-tag {
  font-size: 11px;
  font-weight: 800;
  color: #10b981;
}

/* ==================== FULL-SCREEN SKYLUXE TICKET MODAL ==================== */
.ticket-fullscreen-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(10, 15, 29, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  overflow-y: auto;
}

.ticket-modal-inner-box {
  position: relative;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
}

.ticket-modal-close-icon {
  position: absolute;
  top: -42px;
  right: 0;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 30;
}

.ticket-modal-close-icon:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: rotate(90deg);
}

/* ==================== ĐIỀU KHIỂN & KHÔNG GIAN 3D FLIP ==================== */
.modal-ticket-top-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  z-index: 30;
}

.ticket-flip-badge-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 8px 20px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.ticket-flip-badge-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: #f59e0b;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.35);
}

.ticket-flip-badge-btn .flip-icon {
  font-size: 15px;
  display: inline-block;
  transition: transform 0.6s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.ticket-flip-badge-btn:hover .flip-icon {
  transform: rotate(180deg);
}

.flip-hint-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #000000;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.ticket-flip-subhint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.2px;
}

/* KHUNG 3D STAGE & INNER */
.skyluxe-ticket-3d-stage {
  perspective: 1600px;
  width: 100%;
  max-width: 800px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.3s ease;
}

.skyluxe-ticket-3d-stage:hover {
  transform: translateY(-3px);
}

.skyluxe-ticket-3d-inner {
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  transition: transform 0.85s cubic-bezier(0.34, 1.35, 0.64, 1);
}

/* KHI LẬT 180 ĐỘ */
.skyluxe-ticket-3d-stage.is-flipped .skyluxe-ticket-3d-inner {
  transform: rotateY(180deg);
}

/* 2 MẶT CỦA TẤM VÉ */
.skyluxe-ticket-face {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 65px -10px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.st-face-front {
  position: relative;
  transform: rotateY(0deg);
  z-index: 2;
}

.st-face-back {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotateY(180deg);
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

/* MẶT SAU THÂN VÉ */
.st-back-card-content {
  flex: 1;
  min-height: 0;
  display: flex;
  background: #ffffff;
}

.st-back-main-part {
  flex: 1;
  padding: 16px 22px 14px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.st-back-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.st-back-rule-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 9px 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.st-back-rule-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.st-rule-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  border: 1px solid #fde68a;
}

.st-rule-content h5 {
  font-size: 11.5px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px 0;
  letter-spacing: 0.3px;
}

.st-rule-content p {
  font-size: 11px;
  color: #475569;
  margin: 0;
  line-height: 1.35;
}

.st-back-footer-row {
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
}

.st-back-footer-item {
  display: flex;
  gap: 6px;
  align-items: center;
}

.st-bf-label {
  color: #64748b;
  font-weight: 700;
}

.st-bf-value {
  color: #0f172a;
  font-weight: 800;
}

/* CUỐNG VÉ MẶT SAU */
.st-back-stub-part {
  width: 28%;
  min-width: 210px;
  border-left: 2px dashed #cbd5e1;
  padding: 16px 16px 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  text-align: center;
}

/* CON DẤU PASSPORT STAMP HẢI QUAN NGHỆ THUẬT */
.st-passport-stamp-wrapper {
  margin: 8px 0 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.st-passport-stamp {
  display: inline-block;
  transform: rotate(-7deg);
  transition: transform 0.3s ease;
}

.st-passport-stamp:hover {
  transform: rotate(-2deg) scale(1.05);
}

.stamp-outer-ring {
  width: 114px;
  height: 114px;
  border: 2.5px solid #dc2626;
  border-radius: 50%;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(220, 38, 38, 0.2);
}

.stamp-inner-ring {
  width: 100%;
  height: 100%;
  border: 1.5px dashed #dc2626;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4px;
}

.stamp-star-top {
  font-size: 8px;
  font-weight: 800;
  color: #dc2626;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.stamp-verified-text {
  font-size: 13.5px;
  font-weight: 900;
  color: #dc2626;
  letter-spacing: 2px;
  margin: 1px 0;
  border-top: 1.5px solid #dc2626;
  border-bottom: 1.5px solid #dc2626;
  padding: 1px 6px;
  text-transform: uppercase;
}

.stamp-date-text {
  font-size: 10px;
  font-weight: 800;
  color: #b91c1c;
  letter-spacing: 1px;
  margin-top: 2px;
  font-family: monospace;
}

.stamp-bottom-text {
  font-size: 7.5px;
  font-weight: 800;
  color: #dc2626;
  letter-spacing: 0.8px;
  margin-top: 1px;
}

.st-back-qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border: 1px solid #e2e8f0;
  padding: 4px 8px;
  border-radius: 8px;
  background: #f8fafc;
}

.st-back-qr-lbl {
  font-size: 9.5px;
  font-weight: 800;
  color: #475569;
  letter-spacing: 0.5px;
}

/* 4 VẾT KHOÉT BÁN NGUYỆT (NOTCHES) Y HỆT HÌNH */
.skyluxe-notch {
  position: absolute;
  width: 32px;
  height: 32px;
  background: #0a0f1d;
  border-radius: 50%;
  z-index: 25;
  pointer-events: none;
}

.notch-left {
  left: -16px;
  top: 55%;
  transform: translateY(-50%);
  box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.3);
}

.notch-right {
  right: -16px;
  top: 55%;
  transform: translateY(-50%);
  box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.3);
}

.notch-top {
  top: 36px;
  right: 28%;
  transform: translate(50%, -50%);
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

.notch-bottom {
  bottom: -16px;
  right: 28%;
  transform: translateX(50%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* HEADER ĐEN TRÊN CÙNG */
.st-black-header {
  background: #18181b;
  padding: 14px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.st-header-title {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.st-header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.st-brand-logo {
  stroke: #f59e0b;
}

.st-brand-text strong {
  font-size: 12.5px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 1px;
  display: block;
  line-height: 1.1;
}

.st-brand-text span {
  font-size: 9.5px;
  font-weight: 600;
  color: #a1a1aa;
  letter-spacing: 1.5px;
  display: block;
}

/* NỘI DUNG VÉ */
.st-card-content {
  display: flex;
  background: #ffffff;
}

/* CỘT CHÍNH (BÊN TRÁI) */
.st-main-part {
  flex: 1;
  padding: 18px 24px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.st-section-tag {
  font-size: 11px;
  font-weight: 800;
  color: #71717a;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

.st-flight-route-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.st-route-title {
  font-size: 20px;
  font-weight: 800;
  color: #09090b;
  margin: 0;
  line-height: 1.25;
}

.st-qr-code-box {
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  padding: 2px;
  background: #ffffff;
  flex-shrink: 0;
}

.st-flight-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #3f3f46;
  margin-top: 6px;
  flex-wrap: wrap;
}

.stfm-code {
  color: #09090b;
  font-weight: 800;
}

.stfm-sep {
  color: #d4d4d8;
}

.stfm-datetime {
  color: #52525b;
}

.stfm-seat {
  color: #09090b;
}

.st-flight-class {
  font-size: 12px;
  color: #71717a;
  font-weight: 500;
  margin-top: 2px;
}

/* KHỐI KHÁCH SẠN */
.st-hotel-name {
  font-size: 16.5px;
  font-weight: 800;
  color: #09090b;
  margin: 0 0 8px 0;
}

.st-hotel-content-grid {
  display: flex;
  gap: 14px;
  align-items: center;
}

.st-hotel-thumbs {
  display: flex;
  gap: 8px;
}

.st-thumb-img {
  width: 90px;
  height: 58px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e4e4e7;
}

.st-hotel-room-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12.5px;
  color: #3f3f46;
}

.st-room-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #09090b;
}

.st-room-dates {
  font-size: 12px;
  color: #71717a;
}

.st-room-dates span {
  font-weight: 600;
  color: #18181b;
}

.st-booking-code {
  font-size: 11.5px;
  color: #71717a;
}

.st-booking-code span {
  font-weight: 700;
  color: #09090b;
  font-family: monospace;
}

/* DÒNG TỔNG THANH TOÁN */
.st-total-row {
  border-top: 1px solid #f4f4f5;
  padding-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.st-total-label {
  font-size: 13.5px;
  font-weight: 800;
  color: #09090b;
  letter-spacing: 0.5px;
}

.st-total-value {
  font-size: 16.5px;
  font-weight: 900;
  color: #09090b;
}

/* CUỐNG VÉ (BÊN PHẢI) */
.st-stub-part {
  width: 28%;
  min-width: 210px;
  border-left: 2px dashed #cbd5e1;
  padding: 18px 18px 16px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
}

.st-stub-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #71717a;
  display: block;
}

.st-stub-name {
  font-size: 13.5px;
  font-weight: 800;
  color: #09090b;
  display: block;
  margin-top: 2px;
}

.st-stub-grid {
  display: flex;
  gap: 14px;
  margin: 8px 0;
}

.st-sg-lbl {
  font-size: 10px;
  color: #71717a;
  display: block;
}

.st-sg-val {
  font-size: 12.5px;
  font-weight: 700;
  color: #09090b;
}

/* BARCODE */
.st-barcode-box {
  margin: 6px 0;
  text-align: center;
}

.st-barcode-stripes {
  width: 140px;
  height: 42px;
  margin: 0 auto;
  background: repeating-linear-gradient(
    90deg,
    #18181b 0,
    #18181b 2px,
    transparent 2px,
    transparent 4px,
    #18181b 4px,
    #18181b 6px,
    transparent 6px,
    transparent 8px,
    #18181b 8px,
    #18181b 11px,
    transparent 11px,
    transparent 13px,
    #18181b 13px,
    #18181b 14px,
    transparent 14px,
    transparent 17px
  );
}

/* CHỮ KÝ */
.st-signature-box {
  text-align: center;
  border-top: 1px solid #f4f4f5;
  padding-top: 6px;
}

.st-signature-art {
  font-family: 'Brush Script MT', 'Dancing Script', 'Caveat', cursive;
  font-size: 26px;
  color: #3f3f46;
  transform: rotate(-4deg);
  line-height: 1;
}

.st-signature-sub {
  font-size: 10px;
  color: #71717a;
  font-weight: 700;
  letter-spacing: 1px;
  display: block;
  margin-top: 2px;
}

/* ==================== HIỆU ỨNG PHÁO HOA & NÚT NEON ==================== */
.modal-cta-sparkle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 28px;
  position: relative;
  z-index: 10;
}

.sparkler-burst {
  display: flex;
  gap: 4px;
  font-size: 24px;
  animation: sparkleTwinkle 1.5s ease-in-out infinite alternate;
}

.neon-glow-plan-btn {
  background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%);
  border: none;
  border-radius: 9999px;
  padding: 16px 48px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 35px rgba(59, 130, 246, 0.75), 0 0 70px rgba(139, 92, 246, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.4);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.neon-glow-plan-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 0 45px rgba(59, 130, 246, 0.9), 0 0 90px rgba(139, 92, 246, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.6);
}

.neon-glow-plan-btn:active {
  transform: scale(0.98);
}

/* PHÁO GIẤY CONFETTI */
.confetti-sky {
  position: absolute;
  inset: -60px;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.confetti-item {
  position: absolute;
  width: 9px;
  height: 14px;
  opacity: 0.85;
  border-radius: 2px;
  animation: confettiFall 3.5s ease-in-out infinite;
}

.cf-1 { left: 10%; background: #3b82f6; animation-delay: 0.1s; transform: rotate(15deg); }
.cf-2 { left: 20%; background: #ec4899; animation-delay: 0.4s; transform: rotate(-25deg); }
.cf-3 { left: 30%; background: #eab308; animation-delay: 0.2s; transform: rotate(45deg); }
.cf-4 { left: 40%; background: #8b5cf6; animation-delay: 0.8s; transform: rotate(10deg); }
.cf-5 { left: 50%; background: #10b981; animation-delay: 0.5s; transform: rotate(-35deg); }
.cf-6 { left: 60%; background: #f97316; animation-delay: 0.3s; transform: rotate(20deg); }
.cf-7 { left: 70%; background: #06b6d4; animation-delay: 0.7s; transform: rotate(-15deg); }
.cf-8 { left: 80%; background: #f43f5e; animation-delay: 0.9s; transform: rotate(50deg); }
.cf-9 { left: 90%; background: #a855f7; animation-delay: 0.6s; transform: rotate(-40deg); }
.cf-10 { left: 15%; background: #eab308; animation-delay: 1.2s; transform: rotate(30deg); }
.cf-11 { left: 25%; background: #3b82f6; animation-delay: 1.5s; transform: rotate(-20deg); }
.cf-12 { left: 35%; background: #10b981; animation-delay: 1.1s; transform: rotate(15deg); }
.cf-13 { left: 45%; background: #ec4899; animation-delay: 1.8s; transform: rotate(-45deg); }
.cf-14 { left: 55%; background: #8b5cf6; animation-delay: 1.3s; transform: rotate(35deg); }
.cf-15 { left: 65%; background: #f97316; animation-delay: 1.6s; transform: rotate(-10deg); }
.cf-16 { left: 75%; background: #06b6d4; animation-delay: 1.4s; transform: rotate(25deg); }
.cf-17 { left: 85%; background: #eab308; animation-delay: 1.7s; transform: rotate(-30deg); }
.cf-18 { left: 95%; background: #f43f5e; animation-delay: 1.9s; transform: rotate(40deg); }
.cf-19 { left: 8%; background: #8b5cf6; animation-delay: 2.1s; transform: rotate(-15deg); }
.cf-20 { left: 28%; background: #3b82f6; animation-delay: 2.3s; transform: rotate(20deg); }
.cf-21 { left: 48%; background: #eab308; animation-delay: 2.0s; transform: rotate(-25deg); }
.cf-22 { left: 68%; background: #10b981; animation-delay: 2.4s; transform: rotate(15deg); }
.cf-23 { left: 88%; background: #ec4899; animation-delay: 2.2s; transform: rotate(-35deg); }
.cf-24 { left: 18%; background: #f97316; animation-delay: 2.6s; transform: rotate(45deg); }
.cf-25 { left: 38%; background: #06b6d4; animation-delay: 2.8s; transform: rotate(-20deg); }
.cf-26 { left: 58%; background: #f43f5e; animation-delay: 2.5s; transform: rotate(30deg); }
.cf-27 { left: 78%; background: #a855f7; animation-delay: 2.9s; transform: rotate(-40deg); }
.cf-28 { left: 92%; background: #eab308; animation-delay: 2.7s; transform: rotate(10deg); }

@keyframes confettiFall {
  0% {
    top: -20px;
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 0.9;
  }
  100% {
    top: 100%;
    opacity: 0;
    transform: translateY(60px) rotate(360deg);
  }
}

@keyframes sparkleTwinkle {
  0% {
    transform: scale(0.9) rotate(-3deg);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.15) rotate(3deg);
    opacity: 1;
  }
}

/* ANIMATION ZOOM MODAL */
.ticket-modal-zoom-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.ticket-modal-zoom-leave-active {
  transition: all 0.25s ease;
}

.ticket-modal-zoom-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
}

.ticket-modal-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .st-card-content {
    flex-direction: column;
  }
  .st-stub-part {
    width: 100%;
    border-left: none;
    border-top: 2px dashed #cbd5e1;
  }
  .notch-top, .notch-bottom {
    display: none;
  }
  .neon-glow-plan-btn {
    font-size: 15px;
    padding: 14px 28px;
  }
}

/* KHỐI ĐẨY SANG BUTTON LÊN LỊCH TRÌNH */
.sc-cta-forward-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.sc-btn-generate {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35);
  transition: all 0.25s ease;
  animation: pulseButton 2s infinite;
}

.sc-btn-generate:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.45);
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
}

.sc-btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sc-btn-edit:hover {
  background: #e2e8f0;
  color: #1e293b;
}

:root[data-theme="dark"] .sc-btn-edit {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}

:root[data-theme="dark"] .sc-btn-edit:hover {
  background: #334155;
  color: #ffffff;
}

@keyframes pulseButton {
  0% {
    box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(5, 150, 105, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(5, 150, 105, 0);
  }
}

/* ==================== HIỆU ỨNG NÚT TÊN LỬA LÊN LỊCH TRÌNH (ROCKET LAUNCH BUTTON - HÌNH 3) ==================== */
.rocket-launcher-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
}

.modal-rocket-box {
  margin: 0 auto;
}

.rocket-cta-hint {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #38bdf8;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
  pointer-events: none;
}

.rocket-launch-btn {
  background-color: transparent !important;
  position: relative !important;
  border: none !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  outline: none !important;
  min-width: 140px;
  height: 90px;
  user-select: none;
}

.rocket-launch-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed !important;
}

.rocket-launch-btn::before {
  content: "Ready";
  animation: .55s cubic-bezier(1,-0.06,.61,.45);
  color: rgb(87, 78, 78);
  font-size: 1.35em;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  font-weight: 800;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(30%);
  z-index: 2;
  text-align: center;
}

/* COLORS */
.rocket-launch-btn .rocket-tip > path {
  fill: #5b5eb3;
}

.rocket-launch-btn .rocket-body > path {
  fill: #cccac6;
  stroke: #cccac6;
}

.rocket-launch-btn .rocket-wings > path {
  fill: #cccac6;
  stroke: #cccac6;
}

.rocket-launch-btn .rocket-body-bottom > path,
.rocket-launch-btn .rocket-body-bottom > polygon {
  fill: #514737;
  stroke: #514737;
}

.rocket-launch-btn .rocket-flames :nth-child(2n+1) {
  fill: red;
}

.rocket-launch-btn .rocket-flames :nth-child(2n) {
  fill: yellow;
}

/* SMOKE */
.rocket-launch-btn .rocket-smoke > span {
  position: absolute;
  left: 10px;
  height: 16px;
  width: 16px;
  border-radius: 100%;
  background-color: gray;
  top: 50%;
  z-index: 0;
  animation: .5s linear infinite;
  display: none;
}

.rocket-launch-btn .rocket-smoke :nth-child(1) {
  top: 40%;
  animation-name: smoke-1;
  animation-delay: 3ms;
  animation-duration: 1s;
}

.rocket-launch-btn .rocket-smoke :nth-child(2) {
  top: 45%;
  animation-name: smoke-2;
  animation-duration: 1.3s;
}

.rocket-launch-btn .rocket-smoke :nth-child(3) {
  top: 42%;
  animation-name: smoke-3;
  animation-delay: 3ms;
  animation-duration: 1.6s;
}

.rocket-launch-btn .rocket-smoke :nth-child(4) {
  top: 43%;
  animation-name: smoke-1;
  animation-duration: .7s;
}

.rocket-launch-btn .rocket-smoke :nth-child(5) {
  top: 46%;
  animation-name: smoke-2;
  animation-delay: 3ms;
  animation-duration: 1s;
}

.rocket-launch-btn .rocket-smoke :nth-child(6) {
  top: 48%;
  animation-name: smoke-3;
  animation-duration: 1.2s;
}

/* SET ANIMATIONS */
.rocket-launch-btn .rocket-svg {
  animation: .55s cubic-bezier(1,-0.06,.61,.45);
  height: 130px;
  transform: translateX(-20px) rotateZ(45deg);
}

.rocket-launch-btn svg .rocket-flames > path {
  animation: 1.2s linear infinite forwards;
  transform-origin: center center;
  animation-play-state: paused;
  opacity: 0;
}

.rocket-launch-btn svg .wings-top {
  animation: .6s linear forwards;
  animation-name: close-wing-top;
}

.rocket-launch-btn svg .wings-bottom {
  animation: .6s linear forwards;
  animation-name: close-wing-bottom;
}

/* HOVER */
.rocket-launch-btn:hover::before {
  content: "Set";
}

.rocket-launch-btn:hover .wings-top,
.rocket-launch-btn:focus .wings-top {
  animation-name: open-wing-top;
}

.rocket-launch-btn:hover .wings-bottom,
.rocket-launch-btn:focus .wings-bottom {
  animation-name: open-wing-bottom;
}

.rocket-launch-btn:hover .rocket-smoke > span {
  display: block;
}

/* FOCUS / ACTIVE (CLICK PHÓNG TÊN LỬA) */
.rocket-launch-btn:focus::before,
.rocket-launch-btn:active::before {
  content: "Go!";
  animation-name: launch-text;
}

.rocket-launch-btn:focus .rocket-svg,
.rocket-launch-btn:active .rocket-svg {
  animation-name: launch_149;
}

.rocket-launch-btn:focus .rocket-flames > path,
.rocket-launch-btn:active .rocket-flames > path {
  animation-name: flames;
  animation-play-state: running;
}

.rocket-launch-btn:focus .rocket-smoke > span,
.rocket-launch-btn:active .rocket-smoke > span {
  display: none;
}

/* ANIMATIONS KEYFRAMES */
@keyframes launch_149 {
  from {
    transform: translateX(-20px) rotateZ(45deg);
  }
  to {
    transform: translateX(2000px) rotateZ(45deg);
  }
}

@keyframes launch-text {
  from {
    transform: translateY(30%);
  }
  to {
    transform: translateY(30%) translateX(2000px);
  }
}

@keyframes open-wing-top {
  from {
    transform: translateY(-100px);
  }
  to {
    transform: translateY(0px);
  }
}

@keyframes open-wing-bottom {
  from {
    transform: translateX(100px);
  }
  to {
    transform: translateX(0px);
  }
}

@keyframes close-wing-top {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-100px);
  }
}

@keyframes close-wing-bottom {
  from {
    transform: translateX(0px);
  }
  to {
    transform: translateX(100px);
  }
}

@keyframes flames {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  30% {
    transform: scale(.89);
  }
  50% {
    transform: scale(.95);
  }
  70% {
    transform: scale(.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes smoke-1 {
  0% {
    opacity: .3;
    transform: translate(0, 0);
  }
  60% {
    opacity: .3;
    transform: translate(-15px, -10px);
  }
  100% {
    opacity: .1;
    transform: translate(-25px, 5px);
  }
}

@keyframes smoke-2 {
  0% {
    opacity: .3;
    transform: translate(0, 0);
  }
  60% {
    opacity: .3;
    transform: translate(-10px, -3px);
  }
  100% {
    opacity: .1;
    transform: translate(-30px, 9px);
  }
}

@keyframes smoke-3 {
  0% {
    opacity: .3;
    transform: translate(0, 0);
  }
  60% {
    opacity: .3;
    transform: translate(-5px, 5px);
  }
  100% {
    opacity: .1;
    transform: translate(-20px, -5px);
  }
}

/* ==================== YÊU CẦU 17, 18, 19, 20: STYLES (NO ICON) ==================== */

/* 1. Stepper indicator states (Yêu cầu 20) */
.step-indicator.step-completed {
  color: #059669;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  cursor: pointer;
}
.step-indicator.step-current {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(37, 99, 235, 0.4);
  font-weight: 700;
}
.step-indicator.step-pending {
  color: #94a3b8;
  background: transparent;
  opacity: 0.7;
}
.step-status-tag {
  font-size: 11px;
  margin-right: 4px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.step-divider.completed {
  background: #10b981;
}

/* 2. User Preferences Card (Yêu cầu 18) */
.user-preferences-card {
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
:root[data-theme="light"] .user-preferences-card {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}
.upc-header .upc-kicker {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #38bdf8;
  margin-bottom: 4px;
}
.upc-header h4 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
}
:root[data-theme="light"] .upc-header h4 {
  color: #0f172a;
}
.upc-subtitle {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}
.preference-group-label {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 10px;
}
:root[data-theme="light"] .preference-group-label {
  color: #334155;
}

/* Interest chips */
.interest-chips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}
.interest-chip-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
:root[data-theme="light"] .interest-chip-btn {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.interest-chip-btn:hover {
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateY(-2px);
}
.interest-chip-btn.active {
  background: rgba(14, 165, 233, 0.15);
  border-color: #0ea5e9;
  box-shadow: 0 0 16px rgba(14, 165, 233, 0.25);
}
.icb-title {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 4px;
}
:root[data-theme="light"] .icb-title {
  color: #0f172a;
}
.interest-chip-btn.active .icb-title {
  color: #38bdf8;
}
:root[data-theme="light"] .interest-chip-btn.active .icb-title {
  color: #0284c7;
}
.icb-desc {
  font-size: 11.5px;
  line-height: 1.4;
  color: #94a3b8;
}

/* Pace selector */
.pace-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}
.pace-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
:root[data-theme="light"] .pace-card {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.pace-card:hover {
  border-color: rgba(56, 189, 248, 0.4);
}
.pace-card.active {
  background: rgba(16, 185, 129, 0.12);
  border-color: #10b981;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.2);
}
.pace-card input[type="radio"] {
  margin-top: 3px;
  accent-color: #10b981;
  cursor: pointer;
}
.pace-card-info strong {
  display: block;
  font-size: 14px;
  color: #f1f5f9;
  margin-bottom: 4px;
}
:root[data-theme="light"] .pace-card-info strong {
  color: #0f172a;
}
.pace-card.active .pace-card-info strong {
  color: #10b981;
}
:root[data-theme="light"] .pace-card.active .pace-card-info strong {
  color: #059669;
}
.pace-card-info p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.45;
}

/* Optional Constraints Accordion */
.extra-constraints-accordion {
  border-top: 1px dashed rgba(255, 255, 255, 0.12);
  padding-top: 12px;
}
:root[data-theme="light"] .extra-constraints-accordion {
  border-color: #e2e8f0;
}
.extra-constraints-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 0;
}
.extra-constraints-toggle:hover {
  color: #38bdf8;
}
.accordion-arrow {
  font-size: 11.5px;
  color: #38bdf8;
}
.extra-constraints-content {
  margin-top: 12px;
}
.constraint-checkboxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}
.constraint-checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
}
:root[data-theme="light"] .constraint-checkbox-item {
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.constraint-checkbox-item input[type="checkbox"] {
  margin-top: 3px;
  accent-color: #38bdf8;
  cursor: pointer;
}
.cci-text strong {
  display: block;
  font-size: 12.5px;
  color: #f1f5f9;
}
:root[data-theme="light"] .cci-text strong {
  color: #0f172a;
}
.cci-text small {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  line-height: 1.35;
}

/* 3. Local Transport Selector Card (Yêu cầu 17) */
.local-transport-selector-card {
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 20px 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
:root[data-theme="light"] .local-transport-selector-card {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}
.ltsc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.ltsc-kicker {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #10b981;
  margin-bottom: 4px;
}
.ltsc-header h4 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
}
:root[data-theme="light"] .ltsc-header h4 {
  color: #0f172a;
}
.ltsc-desc {
  margin: 0;
  font-size: 12.5px;
  color: #94a3b8;
  line-height: 1.45;
}
.ltsc-mode-tag {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  white-space: nowrap;
}
:root[data-theme="light"] .ltsc-mode-tag {
  color: #059669;
}
.local-transport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}
.local-trans-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
:root[data-theme="light"] .local-trans-card {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.local-trans-card:hover {
  border-color: rgba(56, 189, 248, 0.4);
}
.local-trans-card.active {
  background: rgba(14, 165, 233, 0.12);
  border-color: #0ea5e9;
  box-shadow: 0 0 16px rgba(14, 165, 233, 0.2);
}
.local-trans-card input[type="radio"] {
  margin-top: 3px;
  accent-color: #0ea5e9;
  cursor: pointer;
}
.ltc-body strong {
  display: block;
  font-size: 13.5px;
  color: #f1f5f9;
  margin-bottom: 4px;
}
:root[data-theme="light"] .ltc-body strong {
  color: #0f172a;
}
.local-trans-card.active .ltc-body strong {
  color: #38bdf8;
}
:root[data-theme="light"] .local-trans-card.active .ltc-body strong {
  color: #0284c7;
}
.ltc-body p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
}

/* 4. Hotel Curated Banner & Badges (Yêu cầu 19) */
.curated-hotel-intro-card {
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.25);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
:root[data-theme="light"] .curated-hotel-intro-card {
  background: #f0f9ff;
  border-color: #bae6fd;
}
.chic-content strong {
  display: block;
  font-size: 13px;
  color: #38bdf8;
  margin-bottom: 2px;
}
:root[data-theme="light"] .chic-content strong {
  color: #0284c7;
}
.chic-content span {
  font-size: 12px;
  color: #cbd5e1;
  line-height: 1.45;
}
:root[data-theme="light"] .chic-content span {
  color: #334155;
}
.hcc-curated-badge {
  display: inline-block;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
}
:root[data-theme="light"] .hcc-curated-badge {
  color: #059669;
}

/* 5. Plan Failure Recovery Card (Yêu cầu 20) */
.plan-failure-recovery-card {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 14px;
  padding: 16px 20px;
  margin-top: 20px;
  margin-bottom: 8px;
}
:root[data-theme="light"] .plan-failure-recovery-card {
  background: #fef2f2;
  border-color: #fca5a5;
}
.pfrc-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.pfrc-badge {
  background: #dc2626;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.4px;
}
.pfrc-title {
  font-size: 15px;
  color: #f87171;
}
:root[data-theme="light"] .pfrc-title {
  color: #dc2626;
}
.pfrc-message {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
}
:root[data-theme="light"] .pfrc-message {
  color: #7f1d1d;
}
.pfrc-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.pfrc-btn-retry {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.pfrc-btn-retry:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}
.pfrc-btn-back {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
:root[data-theme="light"] .pfrc-btn-back {
  background: #ffffff;
  color: #334155;
  border-color: #cbd5e1;
}
.pfrc-btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>

