<template>
<!-- KẾT QUẢ LỊCH TRÌNH CHI TIẾT (CHỈ HIỂN THỊ KHI ĐÃ LÊN LỊCH TRÌNH - YÊU CẦU 4) -->
          <div v-if="lichTrinh" class="plan-results-container">
            <!-- THANH ĐIỀU HƯỚNG QUAY LẠI TRANG CHỌN LỊCH TRÌNH (YÊU CẦU 4) -->
            <div class="plan-top-nav-bar">
              <button type="button" class="plan-back-btn" @click="yeuCauQuayLai" title="Quay lại bước chọn thông số ban đầu">
                <AppIcon name="arrowleft" size="18" /> Quay lại trang lập lịch trình
              </button>
              <div class="plan-top-nav-right" v-if="daLuuLichTrinhHienTai">
                <span class="plan-saved-status">
                  <AppIcon name="checkcircle2" size="16" /> Đã lưu vào Chuyến đi
                </span>
              </div>
            </div>

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
                <h2>Hành trình {{ lichTrinh.daysList.length }} Ngày {{ lichTrinh.nights !== undefined ? lichTrinh.nights : formDuLieu.soDem }} Đêm Tuyệt Vời</h2>

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
                    <button v-if="!formDuLieu.tuTucPhuongTien" type="button" class="oba-action-btn btn-self-transit" @click="$emit('enableSelfTransit')">
                      <AppIcon name="bike" size="14" /> Bật "Tự túc xe đến" (Cắt vé xe khứ hồi)
                    </button>
                    <button v-if="!formDuLieu.freePlacesOnly" type="button" class="oba-action-btn btn-free" @click="kichHoatCheDoFreePlaces">
                      <AppIcon name="leaf" size="14" /> 1. Bật chế độ 100% Điểm Miễn Phí (Cắt vé về 0đ)
                    </button>
                    <span v-else class="oba-done-tag"><AppIcon name="check" size="14" /> Đã bật Free Places — vé tham quan = 0đ</span>
                    <button v-if="Number(formDuLieu.soNgay) > 1" type="button" class="oba-action-btn btn-shorten" @click="rutNganNgayPhuHop">
                      <AppIcon name="clock" size="14" /> 2. Rút ngắn ngày đi vừa vặn {{ dinhDangTien(formDuLieu.nganSach) }}đ
                    </button>
                    <span v-else class="oba-done-tag"><AppIcon name="check" size="14" /> Đã rút ngắn tối đa (1 ngày)</span>
                    <button type="button" class="oba-action-btn btn-increase-budget" @click="$emit('matchBudgetAndReplan')">
                      <AppIcon name="wallet" size="14" /> 3. Nâng ngân sách lên {{ dinhDangTien(lichTrinh.total_budget) }}đ (vừa đủ)
                    </button>
                    <button type="button" class="oba-action-btn btn-replan" @click="$emit('openReplan')">
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

              <!-- NÚT HÀNH ĐỘNG CHÍNH: HIỆU ỨNG GẠT / VUỐT ĐỂ LƯU LỊCH TRÌNH CÓ VIỀN LED CHẠY QUANH -->
              <div class="itinerary-decision-actions-bar">
                <div class="swipe-beam-wrapper">
                  <input
                    type="checkbox"
                    id="swipe-toggle"
                    class="swipe-toggle"
                    :checked="daLuuLichTrinhHienTai"
                    @change="onSwipeSaveChange"
                  />

                  <label
                    class="swipe-container"
                    for="swipe-toggle"
                    :title="daLuuLichTrinhHienTai ? 'Lịch trình đã được lưu (Bấm để xem danh sách chuyến đi)' : 'Gạt để lưu lại lịch trình này'"
                  >
                    <div class="swipe-fill"></div>
                    <div class="dent-effect"></div>
                    <div class="glass-effect-layer"></div>
                    <div class="glass-tint-layer"></div>
                    <div class="glass-shine-layer"></div>

                    <div class="text-container">
                      <span class="swipe-text">Lưu lịch trình</span>
                      <span class="text-confirmed">Lịch trình đã được lưu</span>
                    </div>

                    <div class="swipe-handle">
                      <div class="icon-container">
                        <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke-width="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <svg
                          class="checkmark-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke-width="3"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </label>
                </div>

                <svg style="display: none">
                  <filter id="glass-distortion">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.02 0.05"
                      numOctaves="2"
                      result="turbulence"
                    ></feTurbulence>
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="turbulence"
                      scale="10"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    ></feDisplacementMap>
                  </filter>
                </svg>
              </div>

              <!-- Popup Máy In Vé Thông Báo Lưu Thành Công & 3D Flip Cảm Ơn -->
              <TicketPrinterModal
                :isOpen="thongBaoLuuThanhCong"
                :destination="lichTrinh?.destination || formDuLieu?.destination"
                @close="$emit('update:thongBaoLuuThanhCong', false)"
                @goMyTrips="$emit('goMyTrips')"
              />

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
                  <div class="bad-item">
                    <span class="bad-label">Dự phòng phát sinh (5%):</span>
                    <b>{{ dinhDangTien(lichTrinh.budget_audit.audit_breakdown?.reserve || lichTrinh.budget_breakdown?.reserve || 0) }}đ</b>
                  </div>
                </div>
                <div class="bac-formula-note" style="margin-top: 8px; font-size: 12px; opacity: 0.85;">
                  Tổng chi phí tính toán = Đi lại + Khách sạn + Ăn uống + Vé tham quan + Dự phòng (5%) = <b>{{ dinhDangTien(lichTrinh.budget_audit.calculated_total) }}đ</b>
                </div>
              </div>

              <div class="plan-tool-actions">
                <button class="tool-btn start-tour-btn-highlight" @click="$emit('startTrip', lichTrinh)" title="Bắt đầu chế độ đồng hành GPS trực tiếp trong chuyến đi">
                  <AppIcon name="navigation" size="15" /> 🚀 Bắt đầu chuyến đi
                </button>
                <button class="tool-btn ai-opt-highlight-btn" @click="toiUuCungDuongToanBo" title="Sắp xếp toàn bộ điểm đến theo vòng cung tối ưu di chuyển">
                  <AppIcon name="sparkles" size="15" /> AI Tối ưu thứ tự điểm đến
                </button>
                <button class="tool-btn zalo-share-btn" @click="moModalInfographic" title="Xuất lịch trình dạng thẻ Infographic để gửi nhóm Zalo/Messenger">
                  <AppIcon name="phone" size="15" /> Xuất thẻ chia sẻ Zalo
                </button>
                <button class="tool-btn" @click="$emit('openBillSplitter')" title="Tính tiền chia đều cho nhóm">
                  <AppIcon name="wallet" size="15" /> Chia tiền nhóm
                </button>
                <button class="tool-btn rain-btn" @click="moModalTranhMua(0)" :disabled="dangDieuChinh" title="Tự động đổi điểm tham quan trong nhà nếu trời mưa">
                  <AppIcon name="cloudrain" size="15" /> Đổi lịch tránh mưa
                </button>
                <button class="tool-btn" @click="xuatPdf" title="In hoặc lưu PDF">
                  <AppIcon name="filetext" size="15" /> Lưu PDF
                </button>
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
            </div>

            <!-- BỐ CỤC LỊCH TRÌNH: SPLIT VIEW / TIMELINE / MAP EXPANDED -->
            <div :class="['itinerary-split-container', `mode-${itineraryViewMode}`]">
              <!-- Cột Trái: Dòng thời gian từng ngày (Timeline) (Hiển thị khi Timeline hoặc Split View) -->
              <transition name="view-fade">
                <div v-show="itineraryViewMode !== 'map'" class="app-timeline-wrap" style="position: relative;">

                  <!-- THANH ĐIỀU KHIỂN TINH GỌN LỊCH TRÌNH (TỐI ƯU YÊU CẦU 2: KHÔNG DÀI DÒNG) -->
                  <div class="timeline-compact-filter-toolbar">
                    <!-- Hàng 1: Tabs chọn ngày linh hoạt -->
                    <div class="tc-day-tabs-scroll">
                      <button
                        v-for="d in lichTrinh.daysList"
                        :key="'tab-d-' + d.day"
                        type="button"
                        :class="['tc-day-tab', { active: selectedDay === d.day && !showAllDays }]"
                        @click="$emit('update:selectedDay', d.day); $emit('update:showAllDays', false)"
                        :title="`Xem chi tiết Ngày ${d.day}`"
                      >
                        <AppIcon name="calendar" size="14" /> Ngày {{ d.day }}
                      </button>
                      <button
                        type="button"
                        :class="['tc-day-tab tc-all-tab', { active: showAllDays }]"
                        @click="$emit('update:showAllDays', true)"
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
                          @click="$emit('update:timelineDensity', 'compact')"
                          title="Chế độ Thu gọn: hiển thị dạng hàng ngang thanh lịch, không phải cuộn chuột dài"
                        >
                          <span class="tcd-icon"><AppIcon name="smartphone" size="14" /></span>
                          <span>Thu gọn</span>
                        </button>
                        <button
                          type="button"
                          :class="['tc-density-btn', { active: timelineDensity === 'expanded' }]"
                          @click="$emit('update:timelineDensity', 'expanded')"
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
                          @click="$emit('update:selectedSessionFilter', 'all')"
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'morning' }]"
                          @click="$emit('update:selectedSessionFilter', 'morning')"
                        >
                          <AppIcon name="sunrise" size="14" /> Sáng
                        </button>
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'noon' }]"
                          @click="$emit('update:selectedSessionFilter', 'noon')"
                        >
                          <AppIcon name="sun" size="14" /> Trưa
                        </button>
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'afternoon' }]"
                          @click="$emit('update:selectedSessionFilter', 'afternoon')"
                        >
                          <AppIcon name="sunset" size="14" /> Chiều
                        </button>
                        <button
                          type="button"
                          :class="['tc-session-pill', { active: selectedSessionFilter === 'evening' }]"
                          @click="$emit('update:selectedSessionFilter', 'evening')"
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
                        <span v-if="formatDayDate(day.day)" class="day-calendar-date">({{ formatDayDate(day.day) }})</span>
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
                      <!-- CHẶNG KHỞI HÀNH LIÊN TỈNH: THỜI GIAN VÀ CỰ LY TỪ NƠI XUẤT PHÁT ĐẾN ĐIỂM ĐẾN (YÊU CẦU 6) -->
                      <div v-if="day.day === 1 && !day.activities.some(a => a.type === 'transit')" class="origin-departure-journey-card">
                        <div class="odjc-time-col">
                          <span class="odjc-time">{{ gioXuatPhatDi }}</span>
                          <div class="odjc-bullet"><AppIcon :name="layIconPhuongTien(formDuLieu.phuongTien)" size="18" /></div>
                          <span class="odjc-time-dest" title="Dự kiến đến nơi">➔ {{ gioDenNoiDuKien?.time || gioDenNoiDuKien?.text || gioDenNoiDuKien }}</span>
                        </div>
                        <div class="odjc-card-content">
                          <div class="odjc-header">
                            <span class="odjc-badge">CHẶNG KHỞI HÀNH TỪ NƠI XUẤT PHÁT</span>
                            <span class="odjc-duration-pill"><AppIcon name="clock" size="13" /> Di chuyển: <b>{{ thoiGianDiChuyenText }}</b></span>
                          </div>
                          <h4 class="odjc-title">{{ (formDuLieu.daODiemDen || transitRouteInfo.isLocalSameCity) ? ('Bạn đã ở tại ' + lichTrinh.destination) : (formDuLieu.diemKhoiHanh + ' ➔ ' + lichTrinh.destination) }}</h4>
                          <div class="odjc-meta-grid">
                            <div class="odjc-meta-item">
                              <span class="omi-label">Thời gian xuất phát:</span>
                              <strong class="text-emerald">
                                {{ gioXuatPhatDi }}
                                <template v-if="gioDenNoiDuKien?.isOvernight || gioDenNoiDuKien?.nextDay"> (Tối hôm trước - Khởi hành đêm)</template>
                                <template v-else> (Ngày 1)</template>
                              </strong>
                            </div>
                            <div class="odjc-meta-item">
                              <span class="omi-label">Dự kiến đến nơi:</span>
                              <strong class="text-emerald">
                                {{ gioDenNoiDuKien?.time || gioDenNoiDuKien?.text || gioDenNoiDuKien }}
                                <template v-if="gioDenNoiDuKien?.isOvernight || gioDenNoiDuKien?.nextDay"> (Sáng Ngày 1)</template>
                              </strong>
                            </div>
                            <div class="odjc-meta-item">
                              <span class="omi-label">Phương tiện di chuyển:</span>
                              <strong>{{ formDuLieu.nhaXeDaChon ? (formDuLieu.nhaXeDaChon.name + ' - ' + formDuLieu.nhaXeDaChon.type) : (formDuLieu.tauDaChon ? (formDuLieu.tauDaChon.name + ' - ' + formDuLieu.tauDaChon.type) : (formDuLieu.chuyenBayDaChon ? (formDuLieu.chuyenBayDaChon.name + ' - ' + formDuLieu.chuyenBayDaChon.type) : (lichTrinh.transit_summary?.selected_bus?.name || (formDuLieu.phuongTien === 'máy bay' ? 'Chuyến bay nội địa' : (formDuLieu.phuongTien === 'tàu hỏa' ? 'Tàu Thống Nhất SE1' : (formDuLieu.phuongTien === 'tự túc' || formDuLieu.tuTucPhuongTien ? 'Tự túc phương tiện (0đ vé)' : 'Xe khách giường nằm VIP')))))) }}</strong>
                            </div>
                            <div class="odjc-meta-item">
                              <span class="omi-label">Cự ly quãng đường:</span>
                              <strong>~{{ (lichTrinh.transit_summary?.estimated_distance_km || transitRouteInfo.estimatedDistanceKm || (formDuLieu.daODiemDen ? 15 : getEstimatedDistance(formDuLieu.diemKhoiHanh, lichTrinh.destination))) }} km</strong>
                            </div>
                            <div class="odjc-meta-item">
                              <span class="omi-label">Điểm đón khách:</span>
                              <strong>{{ formDuLieu.nhaXeDaChon?.pickup || ('VP bến xe tại ' + formDuLieu.diemKhoiHanh) }}</strong>
                            </div>
                            <div class="odjc-meta-item">
                              <span class="omi-label">Chặng đích / Điểm trả:</span>
                              <strong>{{ formDuLieu.nhaXeDaChon?.dropoff || ('Bến xe / Điểm dừng trung tâm ' + lichTrinh.destination) }}</strong>
                            </div>
                            <div class="odjc-meta-item" v-if="lichTrinh.hotel_recommendation">
                              <span class="omi-label">Khách sạn lưu trú:</span>
                              <strong>{{ lichTrinh.hotel_recommendation.name }}</strong>
                            </div>
                            <div class="odjc-meta-item" v-if="formDuLieu.nhaXeDaChon?.price">
                              <span class="omi-label">Giá vé:</span>
                              <strong>{{ dinhDangTien(formDuLieu.nhaXeDaChon.price) }}đ/người</strong>
                            </div>
                          </div>
                          <div class="odjc-actions-inline" v-if="formDuLieu.nhaXeDaChon">
                            <a :href="`tel:${formDuLieu.nhaXeDaChon.hotline || '19006067'}`" class="odjc-call-btn">
                              <AppIcon name="phone" size="13" /> Hotline: {{ formDuLieu.nhaXeDaChon.hotline || '1900 6067' }}
                            </a>
                            <a href="https://futabus.vn/" target="_blank" rel="noreferrer" class="odjc-link-btn">
                              <AppIcon name="ticket" size="13" /> Đặt vé xe trực tuyến ↗
                            </a>
                          </div>
                          <p class="odjc-note">
                            <AppIcon :name="layIconPhuongTien(formDuLieu.phuongTien)" size="14" />
                            <template v-if="formDuLieu.daODiemDen || transitRouteInfo.isLocalSameCity">
                              Bạn đã có mặt tại <b>{{ lichTrinh.destination }}</b>. Chuyến đi bắt đầu trực tiếp từ điểm hẹn lưu trú mà không cần di chuyển liên tỉnh (0đ vé liên tỉnh).
                            </template>
                            <template v-else-if="gioDenNoiDuKien?.isOvernight || gioDenNoiDuKien?.nextDay">
                              Chuyến đi khởi hành tối hôm trước lúc <b>{{ gioXuatPhatDi }}</b> từ {{ formDuLieu.diemKhoiHanh }}. Đoàn đến {{ lichTrinh.destination }} dự kiến vào sáng Ngày 1 lúc <b>{{ gioDenNoiDuKien?.time || gioDenNoiDuKien }}</b>, di chuyển về nhận phòng / gửi hành lý tại {{ lichTrinh.hotel_recommendation?.name || 'khách sạn' }} trước khi bắt đầu lịch trình tham quan.
                            </template>
                            <template v-else>
                              Chuyến đi khởi hành lúc <b>{{ gioXuatPhatDi }}</b> từ {{ formDuLieu.diemKhoiHanh }}. Đoàn đến {{ lichTrinh.destination }} dự kiến vào <b>{{ gioDenNoiDuKien?.text || gioDenNoiDuKien }}</b>, di chuyển về nhận phòng / gửi hành lý tại {{ lichTrinh.hotel_recommendation?.name || 'khách sạn' }} trước khi bắt đầu lịch trình tham quan.
                            </template>
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
                            <span class="car-time">{{ act.time }}<template v-if="getEndTime(act)"> - {{ getEndTime(act) }}</template></span>
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
                              <h4 class="car-title" @click.stop="panToActivity(act)">
                                {{ act.place }}
                                <span v-if="act.verified === false" class="act-unverified-tag" title="Gợi ý cần xác nhận">[Gợi ý cần xác nhận]</span>
                              </h4>
                              <span class="car-cost" v-if="act.estimated_cost"><AppIcon name="wallet" size="12" /> {{ dinhDangTien(act.estimated_cost) }}đ</span>
                            </div>
                            <div class="car-sub">
                              <span class="car-reason-pill" v-if="act.recommendation_reason">
                                {{ act.recommendation_reason.replace(/^Lý do:\s*|^Lý do đề xuất:\s*/i, '') }}
                              </span>
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
                            <span class="activity-time">{{ act.time }}<template v-if="getEndTime(act)"> - {{ getEndTime(act) }}</template></span>
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
                                  <h4 class="place-name" :title="act.place" @click="panToActivity(act)">
                                    {{ act.place }}
                                    <span v-if="act.verified === false" class="act-unverified-tag" title="Gợi ý cần xác nhận">[Gợi ý cần xác nhận]</span>
                                  </h4>
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

                              <!-- Lý do đề xuất cá nhân hóa theo sở thích & nhịp độ (Yêu cầu 18 - NO ICON) -->
                              <div v-if="act.recommendation_reason" class="act-curated-reason-banner">
                                <strong>Lý do đề xuất:</strong> {{ act.recommendation_reason.replace(/^Lý do:\s*|^Lý do đề xuất:\s*/i, '') }}
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

                      <!-- NGHỈ ĐÊM TẠI KHÁCH SẠN (DÀNH CHO CÁC ĐÊM TRONG CHUYẾN ĐI - YÊU CẦU 2 & 5) -->
                      <div
                        v-if="lichTrinh.hotel_recommendation && day.day <= (lichTrinh.nights !== undefined ? lichTrinh.nights : formDuLieu.soDem)"
                        class="day-hotel-stay-card"
                      >
                        <div class="dhsc-time-col">
                          <span class="dhsc-time">22:00</span>
                          <div class="dhsc-bullet"><AppIcon name="moon" size="18" /></div>
                        </div>
                        <div class="dhsc-card-content">
                          <div class="dhsc-header">
                            <span class="dhsc-badge"><AppIcon name="hotel" size="12" /> NGHỈ ĐÊM TẠI KHÁCH SẠN (ĐÊM {{ day.day }})</span>
                            <span class="dhsc-stars"><AppIcon name="star" size="12" filled color="#f59e0b" /> {{ lichTrinh.hotel_recommendation.rating || '4.8' }}</span>
                          </div>
                          <h4 class="dhsc-title">{{ lichTrinh.hotel_recommendation.name }}</h4>
                          <p class="dhsc-addr" v-if="lichTrinh.hotel_recommendation.address">
                            <AppIcon name="pin" size="12" /> {{ lichTrinh.hotel_recommendation.address }}
                          </p>
                          <div class="dhsc-footer-row">
                            <span class="dhsc-price">
                              <template v-if="lichTrinh.prebooked_hotel">
                                Chi phí đã trả: <b>{{ dinhDangTien(lichTrinh.prebooked_cost || lichTrinh.hotel_recommendation.price_per_night) }}đ</b>
                                <small>(Đã thanh toán trước)</small>
                              </template>
                              <template v-else-if="!lichTrinh.hotel_recommendation.price_per_night || lichTrinh.hotel_recommendation.price_per_night === 0">
                                <b>0đ (Ở miễn phí)</b>
                              </template>
                              <template v-else>
                                Giá phòng: <b>{{ dinhDangTien(lichTrinh.hotel_recommendation.price_per_night || 850000) }}đ</b>
                                <small>{{ (lichTrinh.hotel_recommendation.price_per_night || 850000) <= 300000 ? '/đêm/người' : '/đêm/phòng' }}</small>
                              </template>
                            </span>
                            <div style="display: flex; gap: 8px; align-items: center;">
                              <button
                                v-if="!lichTrinh.prebooked_hotel && lichTrinh.hotel_recommendation.price_per_night > 0"
                                type="button"
                                class="dhsc-room-view-btn"
                                @click.stop="moModalXemPhong(lichTrinh.hotel_recommendation)"
                              >
                                <AppIcon name="eye" size="13" /> Chi tiết phòng
                              </button>
                              <a
                                :href="chiDuongUrl(lichTrinh.hotel_recommendation.name, lichTrinh.hotel_recommendation.address)"
                                target="_blank"
                                rel="noreferrer"
                                class="dhsc-map-btn"
                              >
                                <AppIcon name="map" size="13" /> Chỉ đường tới KS ↗
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- CHẶNG RA VỀ Ở NGÀY CUỐI CÙNG (YÊU CẦU 6) -->
                      <div v-if="day.day === lichTrinh.daysList.length" class="origin-return-journey-card">
                        <div class="orjc-time-col">
                          <span class="orjc-time">{{ gioXuatPhatVe }}</span>
                          <div class="orjc-bullet"><AppIcon :name="layIconPhuongTien(formDuLieu.phuongTien)" size="18" /></div>
                          <span class="orjc-time-dest" title="Dự kiến về đến nơi">➔ {{ gioVeDenNoiDuKien?.time || gioVeDenNoiDuKien?.text || gioVeDenNoiDuKien }}</span>
                        </div>
                        <div class="orjc-card-content">
                          <div class="orjc-header">
                            <span class="orjc-badge">CHẶNG RA VỀ / KẾT THÚC HÀNH TRÌNH</span>
                            <span class="orjc-duration-pill"><AppIcon name="clock" size="13" /> Di chuyển về: <b>{{ thoiGianDiChuyenText }}</b></span>
                          </div>
                          <h4 class="orjc-title">{{ (formDuLieu.daODiemDen || transitRouteInfo.isLocalSameCity) ? ('Kết thúc lịch trình tại ' + lichTrinh.destination) : (lichTrinh.destination + ' ➔ ' + formDuLieu.diemKhoiHanh) }}</h4>
                          <div class="orjc-meta-grid">
                            <div class="orjc-meta-item">
                              <span class="omi-label">Thời gian xuất phát về:</span>
                              <strong class="text-emerald">{{ gioXuatPhatVe }} (Ngày {{ day.day }})</strong>
                            </div>
                            <div class="orjc-meta-item">
                              <span class="omi-label">Dự kiến về đến nơi:</span>
                              <strong class="text-emerald">
                                {{ gioVeDenNoiDuKien?.time || gioVeDenNoiDuKien?.text || gioVeDenNoiDuKien }}
                                <template v-if="gioVeDenNoiDuKien?.isOvernight || gioVeDenNoiDuKien?.nextDay"> (Sáng hôm sau)</template>
                              </strong>
                            </div>
                            <div class="orjc-meta-item">
                              <span class="omi-label">Phương tiện về:</span>
                              <strong>{{ formDuLieu.nhaXeDaChon ? (formDuLieu.nhaXeDaChon.name + ' - ' + formDuLieu.nhaXeDaChon.type) : (formDuLieu.tauDaChon ? (formDuLieu.tauDaChon.name + ' - ' + formDuLieu.tauDaChon.type) : (formDuLieu.chuyenBayDaChon ? (formDuLieu.chuyenBayDaChon.name + ' - ' + formDuLieu.chuyenBayDaChon.type) : (lichTrinh.transit_summary?.selected_bus?.name || (formDuLieu.phuongTien === 'máy bay' ? 'Chuyến bay nội địa khứ hồi' : (formDuLieu.phuongTien === 'tàu hỏa' ? 'Tàu Thống Nhất khứ hồi' : (formDuLieu.phuongTien === 'tự túc' || formDuLieu.tuTucPhuongTien ? 'Tự túc phương tiện khứ hồi (0đ vé)' : 'Xe khách giường nằm khứ hồi')))))) }}</strong>
                            </div>
                            <div class="orjc-meta-item">
                              <span class="omi-label">Cự ly di chuyển về:</span>
                              <strong>~{{ (lichTrinh.transit_summary?.estimated_distance_km || transitRouteInfo.estimatedDistanceKm || (formDuLieu.daODiemDen ? 15 : getEstimatedDistance(lichTrinh.destination, formDuLieu.diemKhoiHanh))) }} km</strong>
                            </div>
                            <div class="orjc-meta-item">
                              <span class="omi-label">Điểm đón khách về:</span>
                              <strong>{{ formDuLieu.nhaXeDaChon?.dropoff || ('Bến xe / VP tại ' + lichTrinh.destination) }}</strong>
                            </div>
                            <div class="orjc-meta-item">
                              <span class="omi-label">Điểm trả khách tại quê nhà:</span>
                              <strong>{{ formDuLieu.nhaXeDaChon?.pickup || ('VP bến xe tại ' + formDuLieu.diemKhoiHanh) }}</strong>
                            </div>
                            <div class="orjc-meta-item" v-if="lichTrinh.hotel_recommendation">
                              <span class="omi-label">Check-out khách sạn:</span>
                              <strong>11:30 Trả phòng & gửi hành lý tại {{ lichTrinh.hotel_recommendation.name }}</strong>
                            </div>
                            <div class="orjc-meta-item" v-if="formDuLieu.nhaXeDaChon?.price">
                              <span class="omi-label">Giá vé lượt về:</span>
                              <strong>{{ dinhDangTien(formDuLieu.nhaXeDaChon.price) }}đ/người</strong>
                            </div>
                          </div>
                          <div class="orjc-actions-inline" v-if="formDuLieu.nhaXeDaChon">
                            <a :href="`tel:${formDuLieu.nhaXeDaChon.hotline || '19006067'}`" class="orjc-call-btn">
                              <AppIcon name="phone" size="13" /> Hotline: {{ formDuLieu.nhaXeDaChon.hotline || '1900 6067' }}
                            </a>
                            <a href="https://futabus.vn/" target="_blank" rel="noreferrer" class="orjc-link-btn">
                              <AppIcon name="ticket" size="13" /> Đặt vé xe khứ hồi ↗
                            </a>
                          </div>
                          <p class="orjc-note">
                            <AppIcon name="heart" size="14" /> Chúc quý khách thượng lộ bình an! Đoàn khởi hành từ {{ lichTrinh.destination }} lúc <b>{{ gioXuatPhatVe }}</b> và dự kiến về đến {{ formDuLieu.diemKhoiHanh }} lúc <b>{{ gioVeDenNoiDuKien?.time || gioVeDenNoiDuKien?.text || gioVeDenNoiDuKien }}</b><template v-if="gioVeDenNoiDuKien?.isOvernight || gioVeDenNoiDuKien?.nextDay"> (Sáng hôm sau)</template>. Toàn bộ chuyến đi kết thúc tốt đẹp!
                          </p>
                        </div>
                      </div>
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
                          @click="$emit('update:selectedDay', day.day)"
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
                        <button class="mpd-close-btn" @click="$emit('update:selectedMapPlace', null)" title="Đóng chi tiết"><AppIcon name="x" size="16" /></button>
                        
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
</template>

<script setup>
import AppIcon from '../common/AppIcon.vue'
import TicketPrinterModal from '../modals/TicketPrinterModal.vue'
import { getEstimatedDistance } from '../../services/busService'

const props = defineProps({
  lichTrinh: { type: Object, required: true },
  formDuLieu: { type: Object, required: true },
  daLuuLichTrinhHienTai: { type: Boolean, default: false },
  thongBaoLuuThanhCong: { type: Boolean, default: false },
  hienCompletionBanner: { type: Boolean, default: false },
  activeCompletionQuote: { type: Object, default: () => ({ title: '', desc: '' }) },
  itineraryViewMode: { type: String, default: 'split' },
  selectedDay: { type: Number, default: 1 },
  showAllDays: { type: Boolean, default: false },
  timelineDensity: { type: String, default: 'compact' },
  selectedSessionFilter: { type: String, default: 'all' },
  expandedCardKey: { type: [String, Number, null], default: null },
  selectedMapPlace: { type: [Object, null], default: null },
  transitRouteInfo: { type: Object, default: () => ({}) },
  gioXuatPhatDi: { type: String, default: '' },
  gioXuatPhatVe: { type: String, default: '' },
  thoiGianDiChuyenText: { type: String, default: '' },
  gioDenNoiDuKien: { type: [Object, String], default: () => ({ time: '', text: '' }) },
  gioVeDenNoiDuKien: { type: [Object, String], default: () => ({ time: '', text: '' }) },
  googleMapsAllStopsUrl: { type: String, default: '' },
  googleMapsDayRouteUrl: { type: String, default: '' },
  toiUuThanhCongDay: { type: [Number, String, null], default: null },
  dangDieuChinh: { type: Boolean, default: false },
  hoveredActIndex: { type: [Number, String, null], default: null },
  dangKeoDayIdx: { type: [Number, null], default: null },
  dangKeoActIdx: { type: [Number, null], default: null },
  dragOverDayIdx: { type: [Number, null], default: null },
  dragOverActIdx: { type: [Number, null], default: null },
  dinhDangTien: { type: Function, default: () => '' },
  layIconPhuongTien: { type: Function, default: () => 'bus' },
  getDayWeatherAlert: { type: Function, default: () => null },
  taoLinkGoogleMapsChoNgay: { type: Function, default: () => '' },
  getGioMoCua: { type: Function, default: () => '' },
  lamSachMoTa: { type: Function, default: (desc) => desc || '' },
  getTravelEstimate: { type: Function, default: () => null },
  tinhKhoangCachVaThoiGian: { type: Function, default: () => ({}) },
  getBadgeInfo: { type: Function, default: () => ({ class: '', label: '' }) },
  getPlaceImage: { type: Function, default: () => '' },
  getSampleReviewText: { type: Function, default: () => '' },
  laYeuThich: { type: Function, default: () => false },
  doiYeuThich: { type: Function, default: () => {} },
  chiDuongUrl: { type: Function, default: () => '' },
  googleMapsSearchUrl: { type: Function, default: () => '' },
  filterActivitiesBySession: { type: Function, default: (acts) => acts },
  onImageError: { type: Function, default: () => {} },
  toggleExpandCard: { type: Function, default: () => {} },
  hoverActivity: { type: Function, default: () => {} },
  unhoverActivity: { type: Function, default: () => {} },
  panToActivity: { type: Function, default: () => {} },
  onDragStart: { type: Function, default: () => {} },
  onDragOver: { type: Function, default: () => {} },
  onDragLeave: { type: Function, default: () => {} },
  onDragEnd: { type: Function, default: () => {} },
  onDrop: { type: Function, default: () => {} },
  moModalDoiDiaDiem: { type: Function, default: () => {} },
  moModalDoiDiaDiemTuMap: { type: Function, default: () => {} },
  moModalXemPhong: { type: Function, default: () => {} },
  moModalTranhMua: { type: Function, default: () => {} },
  moModalInfographic: { type: Function, default: () => {} },
  toiUuCungDuongNgay: { type: Function, default: () => {} },
  toiUuCungDuongToanBo: { type: Function, default: () => {} },
  doiViewMode: { type: Function, default: () => {} },
  kichHoatCheDoFreePlaces: { type: Function, default: () => {} },
  rutNganNgayPhuHop: { type: Function, default: () => {} },
  luuLichTrinhHienTai: { type: Function, default: () => {} },
  yeuCauQuayLai: { type: Function, default: () => {} },
  xuatPdf: { type: Function, default: () => {} }
})

const emit = defineEmits([
  'update:thongBaoLuuThanhCong',
  'update:hienCompletionBanner',
  'update:selectedDay',
  'update:showAllDays',
  'update:timelineDensity',
  'update:selectedSessionFilter',
  'update:selectedMapPlace',
  'enableSelfTransit',
  'matchBudgetAndReplan',
  'openReplan',
  'goMyTrips',
  'openBillSplitter',
  'openTravelPass',
  'startTrip'
])

function formatDayDate(dayNum) {
  if (!props.formDuLieu?.ngayKhoiHanh) return ''
  const base = new Date(props.formDuLieu.ngayKhoiHanh)
  if (isNaN(base.getTime())) return ''
  const target = new Date(base)
  target.setDate(target.getDate() + (dayNum - 1))
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const dow = daysOfWeek[target.getDay()]
  const day = String(target.getDate()).padStart(2, '0')
  const month = String(target.getMonth() + 1).padStart(2, '0')
  const year = target.getFullYear()
  return `${dow}, ${day}/${month}/${year}`
}

function getEndTime(act) {
  if (!act || !act.time) return ''
  const parts = String(act.time).split(':')
  if (parts.length !== 2) return ''
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return ''
  
  let duration = 60
  if (act.duration_minutes) {
    duration = Number(act.duration_minutes)
  } else if (act.dwell_time) {
    const dMatch = String(act.dwell_time).match(/(\d+)/)
    if (dMatch) duration = parseInt(dMatch[1], 10)
    if (String(act.dwell_time).includes('tiếng') || String(act.dwell_time).includes('giờ')) {
      duration = duration * 60
    }
  } else if (act.type === 'food') {
    duration = 60
  } else if (act.type === 'sightseeing') {
    duration = 90
  } else if (act.type === 'hotel') {
    duration = 45
  }
  
  const totalMin = h * 60 + m + duration
  const endH = Math.floor(totalMin / 60) % 24
  const endM = totalMin % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

const onSwipeSaveChange = (e) => {
  if (props.daLuuLichTrinhHienTai) {
    emit('goMyTrips')
  } else {
    props.luuLichTrinhHienTai()
  }
}
</script>

<style scoped>
.act-unverified-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
  vertical-align: middle;
}
.day-calendar-date {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.85;
  margin-left: 6px;
}
.itinerary-decision-actions-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

/* KHỐI BAO BỌC VỚI HIỆU ỨNG ĐÈN LED CHẠY QUANH VIỀN NÚT */
.swipe-beam-wrapper {
  position: relative;
  padding: 3px;
  border-radius: 38px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.12),
    0 0 16px rgba(6, 182, 212, 0.2);
  transition: all 0.3s ease;
}

/* ĐÈN LED QUANG PHỔ XOAY 360 ĐỘ CHẠY QUANH VIỀN NÚT */
.swipe-beam-wrapper::before {
  content: "";
  position: absolute;
  inset: -200%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg 200deg,
    rgba(6, 182, 212, 0.35) 230deg,
    #06b6d4 260deg,
    #3b82f6 285deg,
    #8b5cf6 310deg,
    #ec4899 335deg,
    #f59e0b 350deg,
    #10b981 360deg
  );
  animation: rotateSwipeBeam 4s linear infinite;
  z-index: 0;
  pointer-events: none;
}

@keyframes rotateSwipeBeam {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* NỘI DUNG NẰM NỔI TRÊN LỚP LED */
.swipe-beam-wrapper > * {
  position: relative;
  z-index: 1;
}

/* KHI ĐÃ LƯU: VIỀN PHÁT SÁNG EMERALD MINT RỰC RỠ */
.swipe-beam-wrapper:has(#swipe-toggle:checked) {
  box-shadow:
    0 14px 32px rgba(16, 185, 129, 0.3),
    0 0 24px rgba(16, 185, 129, 0.4);
}

.swipe-beam-wrapper:has(#swipe-toggle:checked)::before {
  background: conic-gradient(
    from 0deg,
    transparent 0deg 180deg,
    rgba(16, 185, 129, 0.3) 220deg,
    #34d399 270deg,
    #10b981 320deg,
    #a1ffc0 360deg
  );
}

:root[data-theme="dark"] .swipe-beam-wrapper {
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.6),
    0 0 18px rgba(56, 189, 248, 0.25);
}

.swipe-toggle {
  display: none;
}

.swipe-container {
  width: 320px;
  height: 70px;
  background: #e0e5ec;
  border-radius: 35px;
  box-shadow:
    -7px -7px 15px rgba(255, 255, 255, 0.8),
    7px 7px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.dent-effect {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(
      circle at 75% 75%,
      rgba(0, 0, 0, 0.25) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 25% 25%,
      rgba(255, 255, 255, 0.5) 0%,
      transparent 40%
    );
  mix-blend-mode: overlay;
  z-index: 0;
  opacity: 0;
  pointer-events: none;
  transition:
    left 0.6s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 0.5s ease;
}

.swipe-container::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 35px;
  background: linear-gradient(145deg, #86e3ce, #a1ffc0);
  z-index: -1;
  filter: blur(20px);
  opacity: 0;
  transform: scale(0.9);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
  transition-delay: 0.5s;
}

.swipe-handle {
  position: absolute;
  left: 5px;
  width: 60px;
  height: 60px;
  background: #e0e5ec;
  border-radius: 50%;
  box-shadow:
    -3px -3px 7px rgba(255, 255, 255, 0.9),
    3px 3px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 6;
}

.swipe-container:active .swipe-handle {
  transform: scale(1.05);
  box-shadow:
    -4px -4px 10px rgba(255, 255, 255, 0.9),
    4px 4px 8px rgba(0, 0, 0, 0.2);
}

.icon-container {
  width: 28px;
  height: 28px;
  position: relative;
}

.lock-icon,
.checkmark-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.lock-icon {
  stroke: #8a9baf;
}

.lock-icon path,
.lock-icon rect {
  transition: stroke-dashoffset 0.4s cubic-bezier(0.5, 0, 0.9, 0.5);
}

.lock-icon path {
  stroke-dasharray: 35;
  stroke-dashoffset: 0;
}

.lock-icon rect {
  stroke-dasharray: 58;
  stroke-dashoffset: 0;
}

.checkmark-icon {
  stroke: #41c5a7;
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  opacity: 0;
  transition:
    stroke-dashoffset 0.4s ease-out 0.2s,
    opacity 0.2s ease-out 0.2s;
}

.text-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
}

.swipe-text,
.text-confirmed {
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  position: absolute;
  transition: opacity 0.4s ease-in-out;
}

.swipe-text {
  color: #8a9baf;
  opacity: 1;
}

.text-confirmed {
  color: white;
  opacity: 0;
}

.swipe-fill {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(145deg, #86e3ce, #a1ffc0);
  border-radius: 35px;
  transition: width 0.6s cubic-bezier(0.6, 0.04, 0.98, 0.34);
  z-index: 1;
}

.glass-effect-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  border-radius: 35px;
  z-index: 2;
  transition: width 0.6s cubic-bezier(0.6, 0.04, 0.98, 0.34);
}

.glass-tint-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  border-radius: 35px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 3;
  transition: width 0.6s cubic-bezier(0.6, 0.04, 0.98, 0.34);
}

.glass-shine-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  border-radius: 35px;
  box-shadow: inset 1px 1px 1px 0 rgba(255, 255, 255, 0.4);
  z-index: 4;
  transition:
    width 0.6s cubic-bezier(0.6, 0.04, 0.98, 0.34),
    box-shadow 0.5s ease-out;
  overflow: hidden;
}

.glass-shine-layer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  transform: translateX(-100px) skewX(-25deg);
  opacity: 0;
}

@keyframes shine-animation {
  0% {
    transform: translateX(-100px) skewX(-25deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(320px) skewX(-25deg);
    opacity: 0;
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

#swipe-toggle:checked + .swipe-container {
  transform: scale(0.98);
  box-shadow:
    -2px -2px 5px rgba(255, 255, 255, 0.7),
    2px 2px 8px rgba(71, 199, 163, 0.4);
}

#swipe-toggle:checked + .swipe-container::after {
  opacity: 0.7;
  transform: scale(1);
  animation: pulse-glow 2.5s infinite ease-in-out;
  animation-delay: 0.5s;
}

#swipe-toggle:checked + .swipe-container .glass-shine-layer {
  box-shadow:
    inset 3px 3px 6px rgba(55, 84, 78, 0.3),
    inset -2px -2px 5px rgba(255, 255, 255, 0.5);
}

#swipe-toggle:checked + .swipe-container .swipe-handle {
  left: calc(100% - 65px);
  background: #e0e5ec;
  box-shadow:
    inset 3px 3px 5px rgba(0, 0, 0, 0.15),
    inset -3px -3px 7px rgba(255, 255, 255, 1);
}

#swipe-toggle:checked + .swipe-container .dent-effect {
  left: calc(100% - 65px);
  opacity: 0.7;
  transition-delay: 0.05s;
}

#swipe-toggle:checked + .swipe-container .swipe-fill,
#swipe-toggle:checked + .swipe-container .glass-effect-layer,
#swipe-toggle:checked + .swipe-container .glass-tint-layer,
#swipe-toggle:checked + .swipe-container .glass-shine-layer {
  width: 100%;
}

#swipe-toggle:checked + .swipe-container .glass-effect-layer {
  filter: url(#glass-distortion);
}

#swipe-toggle:checked + .swipe-container .glass-shine-layer::before {
  animation: shine-animation 1s cubic-bezier(0.23, 1, 0.32, 1) 0.3s;
}

#swipe-toggle:checked + .swipe-container .lock-icon path {
  stroke-dashoffset: 35;
}
#swipe-toggle:checked + .swipe-container .lock-icon rect {
  stroke-dashoffset: 58;
}

#swipe-toggle:checked + .swipe-container .checkmark-icon {
  opacity: 1;
  stroke-dashoffset: 0;
}

#swipe-toggle:checked + .swipe-container .swipe-text {
  opacity: 0;
}

#swipe-toggle:checked + .swipe-container .text-confirmed {
  opacity: 1;
  transition-delay: 0.2s;
}

/* DARK THEME ADAPTATION */
:root[data-theme="dark"] .swipe-container {
  background: #1e293b;
  box-shadow:
    -5px -5px 12px rgba(255, 255, 255, 0.04),
    5px 5px 15px rgba(0, 0, 0, 0.6);
}

:root[data-theme="dark"] .swipe-handle {
  background: #334155;
  box-shadow:
    -3px -3px 7px rgba(255, 255, 255, 0.06),
    3px 3px 5px rgba(0, 0, 0, 0.4);
}

:root[data-theme="dark"] .swipe-text {
  color: #94a3b8;
}

:root[data-theme="dark"] #swipe-toggle:checked + .swipe-container .swipe-handle {
  background: #1e293b;
  box-shadow:
    inset 3px 3px 5px rgba(0, 0, 0, 0.4),
    inset -3px -3px 7px rgba(255, 255, 255, 0.08);
}

/* Lý do đề xuất cá nhân hóa (Yêu cầu 18 - NO ICON) */
.act-curated-reason-banner {
  margin: 8px 0;
  padding: 8px 12px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(129, 140, 248, 0.25);
  border-left: 3px solid #818cf8;
  border-radius: 6px;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: #c7d2fe;
}
.act-curated-reason-banner strong {
  color: #a5b4fc;
  font-weight: 600;
  margin-right: 4px;
}
:root[data-theme="light"] .act-curated-reason-banner {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
  border-left: 3px solid #6366f1;
  color: #3730a3;
}
:root[data-theme="light"] .act-curated-reason-banner strong {
  color: #312e81;
}

.car-reason-pill {
  display: inline-block;
  padding: 2px 7px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(129, 140, 248, 0.3);
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 500;
  color: #c7d2fe;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:root[data-theme="light"] .car-reason-pill {
  background: rgba(99, 102, 241, 0.09);
  border-color: rgba(99, 102, 241, 0.25);
  color: #4338ca;
}
</style>

