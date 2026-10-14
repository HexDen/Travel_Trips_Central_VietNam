<template>
  <div v-if="isOpen && trip" class="live-companion-overlay" :class="{ 'is-mobile-view': isMobile }">
    <!-- BACKDROP BLUR -->
    <div class="lc-backdrop" @click="handleBackdropClick"></div>

    <div class="lc-container" role="dialog" aria-modal="true">
      <!-- TOP STATUS BAR -->
      <header class="lc-top-header">
        <div class="lc-header-left">
          <div class="lc-live-badge">
            <span class="live-beacon"></span>
            <strong>TRỰC TIẾP HÀNH TRÌNH</strong>
          </div>
          <h2 class="lc-trip-title">
            {{ trip.destination }} • Ngày {{ currentDay }} / {{ totalDays }}
          </h2>
        </div>

        <div class="lc-header-stats">
          <div class="lc-stat-pill" title="Tiến độ tham quan">
            <AppIcon name="checkcircle2" :size="15" color="#10b981" />
            <span>{{ completedCount }}/{{ totalStopsCount }} điểm ({{ progressPercent }}%)</span>
          </div>
          <div class="lc-stat-pill expense-pill" :class="{ 'is-over': actualSpent > (trip.total_budget || 0) }" title="Chi tiêu thực tế / Dự toán">
            <AppIcon name="wallet" :size="15" :color="actualSpent > (trip.total_budget || 0) ? '#ef4444' : '#f59e0b'" />
            <span>{{ formatMoney(actualSpent) }}đ</span>
          </div>
        </div>

        <div class="lc-header-actions">
          <button
            type="button"
            class="lc-action-icon-btn sos-btn"
            title="Cứu trợ khẩn cấp & Tiện ích"
            @click="activeSubTab = activeSubTab === 'sos' ? 'main' : 'sos'"
          >
            <AppIcon name="shield" :size="18" />
            <span class="btn-lbl">Cứu hộ</span>
          </button>
          <button
            type="button"
            class="lc-action-icon-btn wallet-btn"
            title="Sổ chi tiêu thực tế"
            @click="activeSubTab = activeSubTab === 'expenses' ? 'main' : 'expenses'"
          >
            <AppIcon name="wallet" :size="18" />
            <span class="btn-lbl">Chi tiêu</span>
          </button>
          <button
            type="button"
            class="lc-close-btn"
            title="Thu nhỏ / Đóng chế độ hành trình"
            @click="$emit('close')"
          >
            <AppIcon name="x" :size="20" />
          </button>
        </div>
      </header>

      <!-- OVERALL PROGRESS BAR -->
      <div class="lc-progress-track">
        <div class="lc-progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <!-- DAY TABS STRIP -->
      <nav class="lc-day-tabs-strip">
        <button
          v-for="dayNum in totalDays"
          :key="dayNum"
          type="button"
          :class="['lc-day-tab', { active: currentDay === dayNum, completed: isDayCompleted(dayNum) }]"
          @click="selectDay(dayNum)"
        >
          <span class="day-tab-num">Ngày {{ dayNum }}</span>
          <span class="day-tab-badge">
            {{ getDayCompletedCount(dayNum) }}/{{ getDayStopsCount(dayNum) }}
            <span v-if="isDayCompleted(dayNum)" class="day-check-icon">✓</span>
          </span>
        </button>
      </nav>

      <!-- MAIN BODY SPLIT: 2 COLUMNS ON DESKTOP, SWIPE/SCROLL TABS ON MOBILE -->
      <div class="lc-body-content">
        
        <!-- SUB-VIEW 1: CỨU TRỢ KHẨN CẤP & TIỆN ÍCH SOS -->
        <section v-if="activeSubTab === 'sos'" class="lc-sub-view lc-sos-view">
          <div class="lc-sub-header">
            <h3><AppIcon name="shield" :size="20" color="#ef4444" /> Trạm Cứu Hộ & Tiện Ích Địa Phương</h3>
            <button class="lc-sub-back" @click="activeSubTab = 'main'">← Về lịch trình</button>
          </div>

          <div class="sos-cards-grid">
            <div class="sos-card emergency-hotlines">
              <h4>🚨 Đường Dây Khẩn Cấp Quốc Gia (Miễn Phí)</h4>
              <div class="hotline-buttons">
                <a href="tel:115" class="hotline-btn ambulance">
                  <span class="hl-num">115</span>
                  <span class="hl-desc">🚑 Cấp cứu y tế</span>
                </a>
                <a href="tel:113" class="hotline-btn police">
                  <span class="hl-num">113</span>
                  <span class="hl-desc">🚓 Công an phản ứng nhanh</span>
                </a>
                <a href="tel:114" class="hotline-btn fire">
                  <span class="hl-num">114</span>
                  <span class="hl-desc">🚒 Cứu hỏa & Cứu nạn</span>
                </a>
              </div>
            </div>

            <div class="sos-card local-tourism-hotline">
              <h4>🏛️ Trung Tâm Hỗ Trợ Du Khách {{ trip.destination }}</h4>
              <p class="tourist-guide-text">
                Tiếp nhận phản ánh giá cả, thất lạc đồ đạc, tư vấn lộ trình và cứu trợ khách du lịch 24/7.
              </p>
              <div class="tourist-tel-box">
                <span class="tt-label">Hotline Du lịch:</span>
                <a :href="`tel:${getLocalTouristHotline(trip.destination)}`" class="tt-number">
                  📞 {{ getLocalTouristHotline(trip.destination) }}
                </a>
              </div>
            </div>

            <div class="sos-card quick-nearby-finder">
              <h4>📍 Tìm Tiện Ích Gần Nhất (Google Maps)</h4>
              <div class="nearby-grid">
                <a
                  :href="`https://www.google.com/maps/search/cây+xăng+gần+đây/@${currentStopCoords || ''}`"
                  target="_blank"
                  rel="noreferrer"
                  class="nearby-btn"
                >
                  ⛽ Cây xăng gần tôi ↗
                </a>
                <a
                  :href="`https://www.google.com/maps/search/cây+ATM+gần+đây/@${currentStopCoords || ''}`"
                  target="_blank"
                  rel="noreferrer"
                  class="nearby-btn"
                >
                  🏧 Cây ATM / Ngân hàng ↗
                </a>
                <a
                  :href="`https://www.google.com/maps/search/hiệu+thuốc+gần+đây/@${currentStopCoords || ''}`"
                  target="_blank"
                  rel="noreferrer"
                  class="nearby-btn"
                >
                  💊 Nhà thuốc / Trạm y tế ↗
                </a>
                <a
                  :href="`https://www.google.com/maps/search/tiệm+sửa+xe+máy+gần+đây/@${currentStopCoords || ''}`"
                  target="_blank"
                  rel="noreferrer"
                  class="nearby-btn"
                >
                  🔧 Tiệm vá xe / Sửa xe ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- SUB-VIEW 2: SỔ CHI TIÊU THỰC TẾ (EXPENSE TRACKER) -->
        <section v-else-if="activeSubTab === 'expenses'" class="lc-sub-view lc-expenses-view">
          <div class="lc-sub-header">
            <h3><AppIcon name="wallet" :size="20" color="#f59e0b" /> Sổ Ghi Chép Chi Tiêu Thực Tế</h3>
            <button class="lc-sub-back" @click="activeSubTab = 'main'">← Về lịch trình</button>
          </div>

          <!-- COMPARISON CARDS -->
          <div class="expense-overview-row">
            <div class="exp-card target-budget">
              <span class="exp-lbl">Dự toán chuyến đi</span>
              <strong class="exp-val">{{ formatMoney(trip.total_budget || 0) }}đ</strong>
              <small>{{ trip.people || 1 }} người • {{ totalDays }} ngày</small>
            </div>
            <div class="exp-card actual-spent" :class="{ 'is-over': actualSpent > (trip.total_budget || 0) }">
              <span class="exp-lbl">Đã chi thực tế</span>
              <strong class="exp-val">{{ formatMoney(actualSpent) }}đ</strong>
              <small>{{ actualSpentPercent }}% dự toán</small>
            </div>
            <div class="exp-card remaining-budget">
              <span class="exp-lbl">{{ actualSpent <= (trip.total_budget || 0) ? 'Còn lại trong ví' : 'Vượt dự toán' }}</span>
              <strong class="exp-val" :class="actualSpent <= (trip.total_budget || 0) ? 'text-emerald' : 'text-rose'">
                {{ formatMoney(Math.abs((trip.total_budget || 0) - actualSpent)) }}đ
              </strong>
              <small>{{ actualSpent <= (trip.total_budget || 0) ? 'An toàn' : '⚠️ Cần kiểm soát chi tiêu' }}</small>
            </div>
          </div>

          <!-- ADD EXPENSE FORM -->
          <div class="expense-add-box">
            <h4>+ Ghi nhanh một khoản chi tiêu</h4>
            <div class="exp-form-grid">
              <div class="exp-field">
                <label>Khoản chi / Mua gì?</label>
                <input
                  v-model="newExpense.title"
                  type="text"
                  placeholder="VD: Cà phê sáng, Vé vào cổng, Taxi..."
                  class="exp-input"
                />
              </div>
              <div class="exp-field">
                <label>Số tiền (VNĐ)</label>
                <input
                  v-model.number="newExpense.amount"
                  type="number"
                  step="5000"
                  placeholder="VD: 150000"
                  class="exp-input"
                />
              </div>
              <div class="exp-field">
                <label>Danh mục</label>
                <select v-model="newExpense.category" class="exp-select">
                  <option value="food">🍜 Ăn uống & Cà phê</option>
                  <option value="transport">🚕 Taxi / Xăng xe / Đi lại</option>
                  <option value="ticket">🎟️ Vé vui chơi & Tham quan</option>
                  <option value="hotel">🏨 Khách sạn / Lưu trú</option>
                  <option value="shopping">🛍️ Mua quà & Khác</option>
                </select>
              </div>
              <div class="exp-field-btn">
                <button type="button" class="btn-add-exp" @click="handleAddExpense">
                  + Ghi chi tiêu
                </button>
              </div>
            </div>
          </div>

          <!-- EXPENSES LIST -->
          <div class="expenses-history-card">
            <h4>Lịch sử các khoản chi ({{ expensesList.length }} mục)</h4>
            <div v-if="expensesList.length === 0" class="empty-exp-hint">
              Chưa có khoản chi nào được ghi. Hãy ghi lại tiền ăn uống, taxi hay vé tham quan để theo dõi ví tiền nhé!
            </div>
            <ul v-else class="exp-items-list">
              <li v-for="(item, idx) in expensesList" :key="item.id || idx" class="exp-item-row">
                <div class="exp-item-left">
                  <span class="exp-cat-badge">{{ getCategoryEmoji(item.category) }}</span>
                  <div class="exp-item-desc">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.time ? formatTime(item.time) : 'Vừa xong' }} • {{ getCategoryName(item.category) }}</small>
                  </div>
                </div>
                <div class="exp-item-right">
                  <span class="exp-item-amount">{{ formatMoney(item.amount) }}đ</span>
                  <button type="button" class="exp-del-btn" @click="removeExpense(idx)" title="Xóa khoản này">
                    <AppIcon name="trash" :size="14" />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- MAIN SUB-VIEW: COCKPIT NOW & NEXT + TIMELINE -->
        <div v-else class="lc-main-cockpit-grid">
          
          <!-- LEFT / PRIMARY COCKPIT COLUMN -->
          <div class="lc-left-cockpit">
            
            <!-- NOW CARD (TÂM ĐIỂM HIỆN TẠI) -->
            <div v-if="currentStop" class="lc-now-card">
              <div class="now-card-top-tag">
                <span class="now-badge">
                  <span class="beacon-dot"></span>
                  ĐANG Ở ĐÂY • ĐIỂM {{ currentStopIndex + 1 }}/{{ todayStops.length }}
                </span>
                <span class="now-time-tag">
                  <AppIcon name="clock" :size="13" /> {{ currentStop.time || 'Linh hoạt' }}
                </span>
                <span v-if="isStopCompleted(currentDay, currentStopIndex)" class="now-done-status">
                  ✓ Đã check-in
                </span>
              </div>

              <!-- PHOTO & TITLE -->
              <div class="now-hero-media">
                <img
                  :src="getStopImage(currentStop)"
                  :alt="currentStop.place || currentStop.name"
                  class="now-hero-img"
                  loading="lazy"
                  @error="onImageError"
                />
                <div class="now-media-overlay"></div>
                <div class="now-hero-floating-info">
                  <span class="now-type-pill">{{ getActivityTypeLabel(currentStop.type) }}</span>
                  <h3 class="now-place-name">{{ currentStop.place || currentStop.name }}</h3>
                  <p class="now-place-address">
                    📍 {{ currentStop.address || currentStop.location || `${trip.destination}` }}
                  </p>
                </div>
              </div>

              <!-- DETAILS & LOCAL TIPS -->
              <div class="now-details-body">
                <div class="now-cost-row">
                  <span class="now-cost-badge">
                    {{ currentStop.estimated_cost > 0 ? `Chi phí dự kiến: ~${formatMoney(currentStop.estimated_cost)}đ/người` : '✨ Miễn phí tham quan' }}
                  </span>
                  <span class="now-duration-badge">
                    ⏳ Thời gian dừng chân: ~45 - 90 phút
                  </span>
                </div>

                <p class="now-desc-text">
                  {{ currentStop.activity || currentStop.description || 'Thưởng thức không gian và khám phá điểm đến nổi tiếng này.' }}
                </p>

                <!-- MẸO HÀNH TRÌNH TỨC THÌ -->
                <div class="now-insider-tip">
                  <div class="tip-icon"><AppIcon name="sparkles" :size="16" color="#0284c7" /></div>
                  <div class="tip-text">
                    <strong>Gợi ý trải nghiệm:</strong>
                    <span>{{ getQuickTip(currentStop) }}</span>
                  </div>
                </div>

                <!-- GHI CHÚ / CHECK-IN PHOTO CỦA NGƯỜI DÙNG -->
                <div v-if="getStopNote(currentDay, currentStopIndex)" class="user-checked-note-box">
                  <div class="ucn-header">
                    <span>📸 Nhật ký check-in của bạn:</span>
                  </div>
                  <p class="ucn-text">“{{ getStopNote(currentDay, currentStopIndex) }}”</p>
                </div>

                <!-- ACTION BUTTONS: MAPS, CHECK-IN, SKIP -->
                <div class="now-action-buttons-bar">
                  <a
                    :href="getGoogleMapsTurnByTurnUrl(currentStop)"
                    target="_blank"
                    rel="noreferrer"
                    class="btn-now-nav"
                    title="Mở Google Maps chỉ đường turn-by-turn"
                  >
                    <AppIcon name="navigation" :size="18" />
                    <span>Chỉ đường Maps ↗</span>
                  </a>

                  <button
                    type="button"
                    :class="['btn-now-checkin', { 'is-already-checked': isStopCompleted(currentDay, currentStopIndex) }]"
                    @click="handleCheckinCurrentStop"
                  >
                    <AppIcon :name="isStopCompleted(currentDay, currentStopIndex) ? 'checkcircle2' : 'check'" :size="20" />
                    <span>{{ isStopCompleted(currentDay, currentStopIndex) ? 'Đã check-in ✓' : 'Đã đến nơi / Check-in' }}</span>
                  </button>

                  <button
                    type="button"
                    class="btn-now-skip"
                    title="Bỏ qua điểm này để chuyển sang điểm tiếp theo"
                    @click="handleSkipCurrentStop"
                  >
                    <span>Bỏ qua ⏭️</span>
                  </button>

                  <button
                    type="button"
                    class="btn-now-note"
                    title="Thêm ghi chú / ảnh kỷ niệm tại điểm này"
                    @click="openNoteDialogForCurrentStop"
                  >
                    <AppIcon name="camera" :size="18" />
                  </button>
                </div>
              </div>
            </div>

            <!-- ALL DONE FOR TODAY STATE -->
            <div v-else class="lc-all-done-card">
              <div class="adc-celebration-icon">🎉</div>
              <h3>Tuyệt vời! Bạn đã hoàn thành toàn bộ lịch trình Ngày {{ currentDay }}!</h3>
              <p>Hãy nghỉ ngơi thư giãn tại khách sạn hoặc đi dạo phố đêm tự do nhé.</p>
              
              <div class="adc-actions">
                <button
                  v-if="currentDay < totalDays"
                  type="button"
                  class="btn-next-day-tour"
                  @click="selectDay(currentDay + 1)"
                >
                  🚀 Bắt đầu Ngày {{ currentDay + 1 }} tiếp theo
                </button>
                <button
                  v-else
                  type="button"
                  class="btn-finish-all-trip"
                  @click="showRecapModal = true"
                >
                  🏆 Xem Bảng Tổng Kết Chuyến Đi
                </button>
              </div>
            </div>

            <!-- NEXT STOP PREVIEW (ĐIỂM KẾ TIẾP) -->
            <div v-if="nextStop" class="lc-next-card">
              <div class="next-card-header">
                <span class="next-label">⏭️ ĐIỂM TIẾP THEO</span>
                <span class="next-dist-pill">
                  <AppIcon name="car" :size="13" /> ~{{ estimateDistance(currentStop, nextStop) }} km (~{{ estimateDriveMinutes(currentStop, nextStop) }} phút di chuyển)
                </span>
              </div>
              <div class="next-card-content">
                <img
                  :src="getStopImage(nextStop)"
                  :alt="nextStop.place || nextStop.name"
                  class="next-thumb-img"
                  loading="lazy"
                  @error="onImageError"
                />
                <div class="next-info-block">
                  <h4 class="next-place-name">{{ nextStop.place || nextStop.name }}</h4>
                  <p class="next-place-time">Khung giờ dự kiến: <b>{{ nextStop.time || 'Kế tiếp' }}</b></p>
                  <p class="next-place-tip">
                    💡 Mẹo chuẩn bị: {{ getPreparationHint(nextStop) }}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT / TIMELINE & OVERVIEW COLUMN -->
          <div class="lc-right-sidebar">
            <div class="sidebar-section-card">
              <div class="ssc-header">
                <h4>
                  <AppIcon name="calendar" :size="16" /> Lộ trình Ngày {{ currentDay }}
                </h4>
                <span class="ssc-count">{{ todayCompletedCount }}/{{ todayStops.length }} xong</span>
              </div>

              <!-- TIMELINE LIST -->
              <div class="lc-timeline-steps">
                <div
                  v-for="(act, aIdx) in todayStops"
                  :key="aIdx"
                  :class="[
                    'lc-timeline-item',
                    {
                      'is-active': aIdx === currentStopIndex,
                      'is-completed': isStopCompleted(currentDay, aIdx),
                      'is-upcoming': aIdx > currentStopIndex
                    }
                  ]"
                  @click="jumpToStop(aIdx)"
                >
                  <div class="tli-indicator">
                    <span v-if="isStopCompleted(currentDay, aIdx)" class="tli-check">✓</span>
                    <span v-else-if="aIdx === currentStopIndex" class="tli-pulse"></span>
                    <span v-else class="tli-number">{{ aIdx + 1 }}</span>
                    <div v-if="aIdx < todayStops.length - 1" class="tli-line"></div>
                  </div>

                  <div class="tli-card-content">
                    <div class="tli-time-badge">{{ act.time || `Điểm ${aIdx + 1}` }}</div>
                    <div class="tli-title-row">
                      <strong class="tli-place-name">{{ act.place || act.name }}</strong>
                      <span class="tli-type-tag">{{ getActivityTypeTag(act.type) }}</span>
                    </div>
                    <p class="tli-desc">{{ act.activity || act.description }}</p>

                    <div class="tli-bottom-row">
                      <span class="tli-cost">
                        {{ act.estimated_cost > 0 ? `~${formatMoney(act.estimated_cost)}đ` : '0đ' }}
                      </span>
                      <a
                        :href="getGoogleMapsTurnByTurnUrl(act)"
                        target="_blank"
                        rel="noreferrer"
                        class="tli-map-link"
                        @click.stop
                      >
                        Maps ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- QUICK TRAVEL TIPS & WEATHER SUMMARY -->
            <div class="sidebar-section-card tips-card">
              <h4>🌤️ Tiện Ích Hành Trình Hôm Nay</h4>
              <ul class="travel-hints-list">
                <li>👟 Nên mang giày thể thao thoải mái để di chuyển thuận tiện giữa các điểm.</li>
                <li>📱 Giữ điện thoại đầy pin để tiện mở Google Maps và chụp ảnh lưu niệm.</li>
                <li>💵 Chuẩn bị sẵn một ít tiền mặt lẻ (10k, 20k) để trả vé gửi xe máy.</li>
              </ul>
              
              <div class="end-trip-early-row">
                <button type="button" class="btn-early-recap" @click="showRecapModal = true">
                  🏆 Kết thúc & Xem Báo Cáo Chuyến Đi
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- BOTTOM MOBILE STICKY NAV BAR (CHỈ HIỆN KHI Ở MÀN HÌNH NHỎ) -->
      <footer class="lc-mobile-bottom-bar" v-if="isMobile && activeSubTab === 'main' && currentStop">
        <a
          :href="getGoogleMapsTurnByTurnUrl(currentStop)"
          target="_blank"
          rel="noreferrer"
          class="mob-bottom-btn btn-gmaps"
        >
          <AppIcon name="navigation" :size="18" /> Maps
        </a>
        <button
          type="button"
          :class="['mob-bottom-btn btn-checkin', { 'is-done': isStopCompleted(currentDay, currentStopIndex) }]"
          @click="handleCheckinCurrentStop"
        >
          <AppIcon :name="isStopCompleted(currentDay, currentStopIndex) ? 'checkcircle2' : 'check'" :size="20" />
          {{ isStopCompleted(currentDay, currentStopIndex) ? 'Đã Check-in' : 'Đến nơi / Check-in' }}
        </button>
        <button
          type="button"
          class="mob-bottom-btn btn-more"
          @click="activeSubTab = 'expenses'"
        >
          <AppIcon name="wallet" :size="18" /> Chi tiêu
        </button>
      </footer>
    </div>

    <!-- DIALOG: THÊM GHI CHÚ / CHECK-IN PHOTO -->
    <transition name="fade">
      <div v-if="showNoteDialog" class="lc-modal-sub-overlay" @click.self="showNoteDialog = false">
        <div class="lc-modal-sub-card">
          <h4>📸 Ghi chú & Cảm nghĩ tại điểm check-in</h4>
          <p class="sub-target-name">{{ currentStop?.place || currentStop?.name }}</p>
          <textarea
            v-model="tempNoteText"
            rows="3"
            class="note-textarea"
            placeholder="VD: Quán mì quảng ngon tuyệt vời, nước dùng béo bùi, chụp ảnh hoàng hôn cực chill..."
          ></textarea>
          <div class="modal-sub-actions">
            <button type="button" class="btn-sub-cancel" @click="showNoteDialog = false">Đóng</button>
            <button type="button" class="btn-sub-save" @click="saveCurrentStopNote">Lưu kỷ niệm</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- CELEBRATION RECAP MODAL (VINH DANH CHUYẾN ĐI KHI HOÀN THÀNH) -->
    <transition name="fade">
      <div v-if="showRecapModal" class="lc-modal-sub-overlay" @click.self="showRecapModal = false">
        <div class="lc-modal-recap-card">
          <div class="recap-badge-shine">👑 BÁO CÁO HÀNH TRÌNH HOÀN TẤT</div>
          <h2>Hành Trình {{ trip.destination }}</h2>
          <p class="recap-slogan">Bạn đã chính thức chinh phục cung đường tuyệt vời này!</p>

          <div class="recap-stats-grid">
            <div class="recap-cell">
              <span class="rc-num">{{ completedCount }}/{{ totalStopsCount }}</span>
              <span class="rc-lbl">Điểm đã check-in</span>
            </div>
            <div class="recap-cell">
              <span class="rc-num">{{ formatMoney(actualSpent) }}đ</span>
              <span class="rc-lbl">Tổng chi tiêu thực tế</span>
            </div>
            <div class="recap-cell">
              <span class="rc-num">{{ totalDays }}</span>
              <span class="rc-lbl">Số ngày khám phá</span>
            </div>
            <div class="recap-cell">
              <span class="rc-num">{{ expensesList.length }}</span>
              <span class="rc-lbl">Khoản chi đã ghi</span>
            </div>
          </div>

          <div class="recap-budget-comparison">
            <div class="rbc-header">
              <span>Đánh giá ngân sách:</span>
              <strong :class="actualSpent <= (trip.total_budget || 0) ? 'text-emerald' : 'text-rose'">
                {{ actualSpent <= (trip.total_budget || 0) ? `Tiết kiệm được ~${formatMoney((trip.total_budget || 0) - actualSpent)}đ!` : `Chi vượt dự toán +${formatMoney(actualSpent - (trip.total_budget || 0))}đ` }}
              </strong>
            </div>
          </div>

          <div class="recap-actions">
            <button type="button" class="btn-recap-share" @click="handleShareRecap">
              📋 Sao chép tóm tắt hành trình
            </button>
            <button type="button" class="btn-recap-close" @click="handleFinishTripAndClose">
              Hoàn tất & Quay lại
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- CONFETTI CELEBRATION CANVAS EFFECT -->
    <div v-if="showConfettiAnim" class="confetti-overlay" @click="showConfettiAnim = false">
      <div class="confetti-popup">
        <div class="cp-icon">🎉</div>
        <h3>Check-in Thành Công!</h3>
        <p>Đã khám phá thêm một địa điểm tuyệt vời!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppIcon from '../common/AppIcon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  trip: {
    type: Object,
    default: null
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'finish'])

// TABS & SUB-VIEWS: 'main' | 'expenses' | 'sos'
const activeSubTab = ref('main')
const currentDay = ref(1)
const currentStopIndex = ref(0)
const completedStops = ref([]) // array of 'day-index' strings: e.g. ['1-0', '1-1']
const stopNotes = ref({}) // { '1-0': 'note text' }
const expensesList = ref([]) // [{ id, title, amount, category, time }]
const showNoteDialog = ref(false)
const tempNoteText = ref('')
const showRecapModal = ref(false)
const showConfettiAnim = ref(false)

const newExpense = ref({
  title: '',
  amount: null,
  category: 'food'
})

// Storage Key
const storageKey = computed(() => {
  if (!props.trip) return 'live_trip_default'
  const id = props.trip._id || props.trip.id || props.trip.tripId || `${props.trip.destination}_${props.trip.daysList?.length || 3}`
  return `live_trip_state_${id}`
})

// Days count
const totalDays = computed(() => {
  if (!props.trip) return 1
  const days = props.trip.daysList || props.trip.days || []
  return Math.max(1, days.length)
})

// Days Array
const daysList = computed(() => {
  if (!props.trip) return []
  return props.trip.daysList || props.trip.days || []
})

// Stops today
const todayStops = computed(() => {
  const day = daysList.value[currentDay.value - 1]
  return day?.activities || []
})

// Current Stop
const currentStop = computed(() => {
  if (!todayStops.value || todayStops.value.length === 0) return null
  return todayStops.value[currentStopIndex.value] || null
})

// Next Stop
const nextStop = computed(() => {
  if (!todayStops.value || currentStopIndex.value >= todayStops.value.length - 1) return null
  return todayStops.value[currentStopIndex.value + 1] || null
})

// Coords for Google Maps Nearby search
const currentStopCoords = computed(() => {
  if (currentStop.value?.latitude && currentStop.value?.longitude) {
    return `${currentStop.value.latitude},${currentStop.value.longitude}`
  }
  return ''
})

// Total stops in trip
const totalStopsCount = computed(() => {
  let count = 0
  daysList.value.forEach(d => {
    count += (d.activities || []).length
  })
  return Math.max(1, count)
})

// Total completed stops
const completedCount = computed(() => {
  return completedStops.value.length
})

// Today completed stops
const todayCompletedCount = computed(() => {
  return getDayCompletedCount(currentDay.value)
})

// Progress Percent
const progressPercent = computed(() => {
  return Math.min(100, Math.round((completedCount.value / totalStopsCount.value) * 100))
})

// Actual Spent
const actualSpent = computed(() => {
  return expensesList.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
})

const actualSpentPercent = computed(() => {
  const target = props.trip?.total_budget || 1
  return Math.round((actualSpent.value / target) * 100)
})

// Load & Save state to localStorage
function loadSavedState() {
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (raw) {
      const data = JSON.parse(raw)
      currentDay.value = data.currentDay || 1
      currentStopIndex.value = data.currentStopIndex !== undefined ? data.currentStopIndex : 0
      completedStops.value = data.completedStops || []
      stopNotes.value = data.stopNotes || {}
      expensesList.value = data.expensesList || []
    } else {
      // First time starting: init default values
      currentDay.value = 1
      currentStopIndex.value = 0
      completedStops.value = []
      stopNotes.value = {}
      expensesList.value = []
    }
  } catch (e) {
    console.warn('Lỗi đọc live trip state:', e)
  }
}

function persistState() {
  try {
    const data = {
      currentDay: currentDay.value,
      currentStopIndex: currentStopIndex.value,
      completedStops: completedStops.value,
      stopNotes: stopNotes.value,
      expensesList: expensesList.value,
      lastUpdated: Date.now()
    }
    localStorage.setItem(storageKey.value, JSON.stringify(data))
  } catch (e) {
    console.warn('Lỗi lưu live trip state:', e)
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadSavedState()
    activeSubTab.value = 'main'
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadSavedState()
  }
})

// Day selection
function selectDay(dayNum) {
  currentDay.value = dayNum
  // Find first uncompleted stop of that day, or stop 0
  const acts = daysList.value[dayNum - 1]?.activities || []
  let firstUnchecked = 0
  for (let i = 0; i < acts.length; i++) {
    if (!isStopCompleted(dayNum, i)) {
      firstUnchecked = i
      break
    }
  }
  currentStopIndex.value = firstUnchecked
  persistState()
}

function jumpToStop(index) {
  currentStopIndex.value = index
  persistState()
}

// Stop Status
function isStopCompleted(dayNum, stopIdx) {
  return completedStops.value.includes(`${dayNum}-${stopIdx}`)
}

function getDayStopsCount(dayNum) {
  const d = daysList.value[dayNum - 1]
  return (d?.activities || []).length
}

function getDayCompletedCount(dayNum) {
  const d = daysList.value[dayNum - 1]
  const acts = d?.activities || []
  return acts.filter((_, idx) => isStopCompleted(dayNum, idx)).length
}

function isDayCompleted(dayNum) {
  const total = getDayStopsCount(dayNum)
  if (total === 0) return false
  return getDayCompletedCount(dayNum) >= total
}

// Checkin logic
function handleCheckinCurrentStop() {
  const key = `${currentDay.value}-${currentStopIndex.value}`
  if (!completedStops.value.includes(key)) {
    completedStops.value.push(key)
    
    // Haptic feedback if on mobile
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    // Trigger celebration effect
    showConfettiAnim.value = true
    setTimeout(() => {
      showConfettiAnim.value = false
    }, 2400)

    // Advance to next stop if available
    if (currentStopIndex.value < todayStops.value.length - 1) {
      currentStopIndex.value++
    } else {
      // Day completed!
      if (currentDay.value < totalDays.value) {
        setTimeout(() => {
          if (confirm(`🎉 Bạn đã hoàn thành các điểm của Ngày ${currentDay.value}! Bạn có muốn chuyển sang Ngày ${currentDay.value + 1} không?`)) {
            selectDay(currentDay.value + 1)
          }
        }, 1200)
      } else {
        setTimeout(() => {
          showRecapModal.value = true
        }, 1200)
      }
    }
  } else {
    // If already checked, advance to next
    if (currentStopIndex.value < todayStops.value.length - 1) {
      currentStopIndex.value++
    }
  }
  persistState()
}

function handleSkipCurrentStop() {
  if (currentStopIndex.value < todayStops.value.length - 1) {
    currentStopIndex.value++
  } else {
    alert('Đây là điểm dừng chân cuối cùng của ngày hôm nay!')
  }
  persistState()
}

// Note dialog
function openNoteDialogForCurrentStop() {
  const key = `${currentDay.value}-${currentStopIndex.value}`
  tempNoteText.value = stopNotes.value[key] || ''
  showNoteDialog.value = true
}

function saveCurrentStopNote() {
  const key = `${currentDay.value}-${currentStopIndex.value}`
  if (tempNoteText.value.trim()) {
    stopNotes.value[key] = tempNoteText.value.trim()
  } else {
    delete stopNotes.value[key]
  }
  showNoteDialog.value = false
  persistState()
}

function getStopNote(dayNum, stopIdx) {
  return stopNotes.value[`${dayNum}-${stopIdx}`] || ''
}

// Expenses
function handleAddExpense() {
  if (!newExpense.value.title || !newExpense.value.amount) {
    alert('Vui lòng nhập tên khoản chi và số tiền!')
    return
  }
  expensesList.value.unshift({
    id: 'exp_' + Date.now(),
    title: newExpense.value.title.trim(),
    amount: Number(newExpense.value.amount),
    category: newExpense.value.category || 'food',
    time: Date.now()
  })
  newExpense.value.title = ''
  newExpense.value.amount = null
  persistState()
}

function removeExpense(idx) {
  expensesList.value.splice(idx, 1)
  persistState()
}

function getCategoryEmoji(cat) {
  switch (cat) {
    case 'food': return '🍜'
    case 'transport': return '🚕'
    case 'ticket': return '🎟️'
    case 'hotel': return '🏨'
    default: return '🛍️'
  }
}

function getCategoryName(cat) {
  switch (cat) {
    case 'food': return 'Ăn uống'
    case 'transport': return 'Đi lại'
    case 'ticket': return 'Vé tham quan'
    case 'hotel': return 'Lưu trú'
    default: return 'Mua sắm & Khác'
  }
}

// Google Maps Navigation URL (Turn-by-turn direct link)
function getGoogleMapsTurnByTurnUrl(act) {
  if (!act) return '#'
  if (act.latitude && act.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${act.latitude},${act.longitude}&travelmode=driving`
  }
  const query = `${act.place || act.name || ''} ${act.address || ''} ${props.trip?.destination || ''}`.trim()
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`
}

// Local Tourist Center Hotline by destination
function getLocalTouristHotline(dest = '') {
  const d = dest.toLowerCase()
  if (d.includes('đà nẵng') || d.includes('da nang')) return '0236 3550 111'
  if (d.includes('huế') || d.includes('hue')) return '0234 3828 288'
  if (d.includes('hội an') || d.includes('quảng nam')) return '0235 3666 333'
  if (d.includes('nha trang') || d.includes('khánh hòa')) return '0258 3528 000'
  if (d.includes('quy nhơn') || d.includes('bình định')) return '0256 3818 888'
  if (d.includes('đà lạt') || d.includes('lâm đồng')) return '0263 3822 663'
  if (d.includes('quảng bình')) return '0232 3822 264'
  if (d.includes('phú yên')) return '0257 3841 807'
  return '1900 1234'
}

// Tips & hints helpers
function getQuickTip(stop) {
  const type = stop?.type || ''
  const name = (stop?.place || stop?.name || '').toLowerCase()
  if (type === 'breakfast') return 'Nên gọi thêm một phần quẩy hoặc trà đá để thưởng thức trọn vẹn vị buổi sáng.'
  if (type === 'cafe') return 'Góc ban công hoặc cạnh cửa sổ là vị trí ngắm cảnh và chụp ảnh đẹp nhất quán!'
  if (type === 'lunch') return 'Giờ trưa quán có thể đông, hãy hỏi nhân viên bàn trống và gọi món đặc sản trước.'
  if (type === 'dinner') return 'Tận hưởng ẩm thực kết hợp ngắm không khí đêm lung linh của phố phường.'
  if (name.includes('biển') || name.includes('bãi')) return 'Nhớ thoa kem chống nắng, mang theo kính râm và cất đồ tư trang cẩn thận trước khi tắm.'
  if (name.includes('chùa') || name.includes('lăng') || name.includes('đại nội')) return 'Chú ý mặc trang phục lịch sự, qua đầu gối để tôn trọng nơi tôn nghiêm.'
  return 'Hãy giữ gìn vệ sinh chung, lưu lại những bức ảnh kỷ niệm tuyệt đẹp nhé!'
}

function getPreparationHint(stop) {
  const type = stop?.type || ''
  if (['breakfast', 'lunch', 'dinner'].includes(type)) return 'Để bụng đói để thưởng thức hương vị trọn vẹn!'
  if (type === 'attraction') return 'Chuẩn bị nón, quạt cầm tay và nước suối để dạo bộ thoải mái.'
  if (type === 'cafe') return 'Sạc sẵn pin điện thoại để thỏa sức chụp ảnh check-in.'
  return 'Kiểm tra đồ đạc cá nhân trước khi di chuyển.'
}

// Distance estimation
function estimateDistance(stopA, stopB) {
  if (!stopA || !stopB) return '2.5'
  if (stopA.latitude && stopA.longitude && stopB.latitude && stopB.longitude) {
    const lat1 = stopA.latitude, lon1 = stopA.longitude
    const lat2 = stopB.latitude, lon2 = stopB.longitude
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = (R * c * 1.3).toFixed(1) // 1.3 road winding factor
    return Math.max(0.8, d)
  }
  return '3.2'
}

function estimateDriveMinutes(stopA, stopB) {
  const dist = parseFloat(estimateDistance(stopA, stopB)) || 3
  return Math.max(5, Math.round(dist * 3.5)) // ~20-25 km/h urban speed
}

function getStopImage(stop) {
  if (stop?.image_url) return stop.image_url
  if (stop?.image) return stop.image
  return 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80'
}

function onImageError(e) {
  e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
}

function getActivityTypeLabel(type) {
  switch (type) {
    case 'breakfast': return '🍜 Điểm tâm sáng'
    case 'cafe': return '☕ Thư giãn & Cà phê'
    case 'lunch': return '🍲 Bữa trưa đặc sản'
    case 'dinner': return '🍽️ Ăn tối ẩm thực'
    case 'checkin': return '🏨 Check-in / Nhận phòng'
    case 'attraction': return '📸 Danh thắng tham quan'
    default: return '✨ Hoạt động trải nghiệm'
  }
}

function getActivityTypeTag(type) {
  switch (type) {
    case 'breakfast':
    case 'lunch':
    case 'dinner': return 'Ẩm thực'
    case 'cafe': return 'Cafe'
    case 'attraction': return 'Tham quan'
    default: return 'Khám phá'
  }
}

function formatMoney(num) {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(Math.round(num))
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function handleBackdropClick() {
  // Minimize confirmation
  props.isMobile ? emit('close') : emit('close')
}

function handleShareRecap() {
  const text = `🎉 Tôi vừa hoàn thành chuyến đi ${props.trip?.destination} (${totalDays.value} ngày)!\n` +
    `✅ Đã check-in ${completedCount.value}/${totalStopsCount.value} điểm đến\n` +
    `💰 Tổng chi tiêu thực tế: ${formatMoney(actualSpent.value)}đ\n` +
    `Tạo bởi AI Travel Trips Central VietNam 🌴`
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Đã sao chép tóm tắt thành tích hành trình vào Clipboard!')
    })
  } else {
    prompt('Tóm tắt chuyến đi:', text)
  }
}

function handleFinishTripAndClose() {
  showRecapModal.value = false
  emit('finish')
  emit('close')
}
</script>

<style scoped>
/* RESET & BASE OVERLAY */
.live-companion-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  color: #1e293b;
  overflow: hidden;
}

.lc-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.lc-container {
  position: relative;
  width: 95vw;
  max-width: 1240px;
  height: 92vh;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: lcScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-theme='dark'] .lc-container {
  background: #0f172a;
  color: #f1f5f9;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

@keyframes lcScaleIn {
  from { opacity: 0; transform: scale(0.96) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* TOP HEADER */
.lc-top-header {
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

[data-theme='dark'] .lc-top-header {
  background: #0f172a;
  border-color: #1e293b;
}

.lc-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fee2e2;
  color: #ef4444;
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

[data-theme='dark'] .lc-live-badge {
  background: rgba(239, 68, 68, 0.2);
}

.live-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulseBeacon 1.4s ease-in-out infinite;
}

@keyframes pulseBeacon {
  0% { transform: scale(0.9); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.4; }
  100% { transform: scale(0.9); opacity: 1; }
}

.lc-trip-title {
  margin: 4px 0 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

[data-theme='dark'] .lc-trip-title {
  color: #f8fafc;
}

.lc-header-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lc-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  border: 1px solid #e2e8f0;
}

[data-theme='dark'] .lc-stat-pill {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.lc-stat-pill.expense-pill.is-over {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.lc-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lc-action-icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.lc-action-icon-btn.sos-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.lc-action-icon-btn.sos-btn:hover {
  background: #fca5a5;
}

.lc-action-icon-btn.wallet-btn {
  background: #fef3c7;
  color: #b45309;
}

.lc-action-icon-btn.wallet-btn:hover {
  background: #fde68a;
}

.lc-close-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lc-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

[data-theme='dark'] .lc-close-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

/* PROGRESS BAR */
.lc-progress-track {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  flex-shrink: 0;
}

[data-theme='dark'] .lc-progress-track {
  background: #1e293b;
}

.lc-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
  transition: width 0.4s ease;
}

/* DAY TABS STRIP */
.lc-day-tabs-strip {
  display: flex;
  gap: 8px;
  padding: 10px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  flex-shrink: 0;
}

[data-theme='dark'] .lc-day-tabs-strip {
  background: #091120;
  border-color: #1e293b;
}

.lc-day-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

[data-theme='dark'] .lc-day-tab {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.lc-day-tab.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.lc-day-tab.completed {
  border-color: #10b981;
}

.day-tab-badge {
  font-size: 0.75rem;
  opacity: 0.9;
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 12px;
}

.lc-day-tab.active .day-tab-badge {
  background: rgba(255, 255, 255, 0.25);
}

.day-check-icon {
  color: #10b981;
  font-weight: 800;
}

/* MAIN BODY CONTENT */
.lc-body-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #f8fafc;
}

[data-theme='dark'] .lc-body-content {
  background: #0b1329;
}

.lc-main-cockpit-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* NOW CARD */
.lc-now-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

[data-theme='dark'] .lc-now-card {
  background: #111e38;
  border-color: #1e2e4f;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.now-card-top-tag {
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdf4;
  border-bottom: 1px solid #dcfce7;
}

[data-theme='dark'] .now-card-top-tag {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
}

.now-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #059669;
}

.beacon-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  animation: pulseBeacon 1.5s infinite;
}

.now-time-tag {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
}

[data-theme='dark'] .now-time-tag {
  color: #94a3b8;
}

.now-done-status {
  font-size: 0.8rem;
  font-weight: 700;
  color: #10b981;
}

/* NOW HERO MEDIA */
.now-hero-media {
  position: relative;
  width: 100%;
  height: 230px;
  background: #0f172a;
  overflow: hidden;
}

.now-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.now-hero-media:hover .now-hero-img {
  transform: scale(1.03);
}

.now-media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%);
}

.now-hero-floating-info {
  position: absolute;
  bottom: 16px;
  left: 20px;
  right: 20px;
  color: #ffffff;
}

.now-type-pill {
  display: inline-block;
  background: rgba(2, 132, 199, 0.9);
  color: #ffffff;
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.now-place-name {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  line-height: 1.25;
}

.now-place-address {
  margin: 0;
  font-size: 0.85rem;
  color: #e2e8f0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}

/* NOW DETAILS BODY */
.now-details-body {
  padding: 20px;
}

.now-cost-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.now-cost-badge, .now-duration-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
}

[data-theme='dark'] .now-cost-badge, [data-theme='dark'] .now-duration-badge {
  background: #1e293b;
  color: #cbd5e1;
}

.now-desc-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #334155;
  margin: 0 0 16px;
}

[data-theme='dark'] .now-desc-text {
  color: #cbd5e1;
}

.now-insider-tip {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-left: 4px solid #0284c7;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: #0369a1;
  line-height: 1.5;
}

[data-theme='dark'] .now-insider-tip {
  background: rgba(2, 132, 199, 0.12);
  color: #7dd3fc;
}

.user-checked-note-box {
  padding: 12px 16px;
  background: #fefce8;
  border-left: 4px solid #eab308;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: #854d0e;
}

[data-theme='dark'] .user-checked-note-box {
  background: rgba(234, 179, 8, 0.15);
  color: #fde047;
}

/* NOW ACTION BUTTONS */
.now-action-buttons-bar {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-now-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 18px;
  background: #0284c7;
  color: #ffffff;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  flex: 1;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
  transition: all 0.2s ease;
}

.btn-now-nav:hover {
  background: #0369a1;
  transform: translateY(-2px);
}

.btn-now-checkin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 18px;
  background: #10b981;
  color: #ffffff;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  flex: 1.2;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  transition: all 0.2s ease;
}

.btn-now-checkin:hover {
  background: #059669;
  transform: translateY(-2px);
}

.btn-now-checkin.is-already-checked {
  background: #64748b;
  box-shadow: none;
}

.btn-now-skip, .btn-now-note {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

[data-theme='dark'] .btn-now-skip, [data-theme='dark'] .btn-now-note {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.btn-now-skip:hover, .btn-now-note:hover {
  background: #e2e8f0;
}

/* NEXT CARD */
.lc-next-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px dashed #94a3b8;
  padding: 16px;
}

[data-theme='dark'] .lc-next-card {
  background: #111e38;
  border-color: #334155;
}

.next-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.next-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.5px;
}

.next-dist-pill {
  font-size: 0.75rem;
  font-weight: 600;
  color: #0284c7;
  display: flex;
  align-items: center;
  gap: 4px;
}

.next-card-content {
  display: flex;
  gap: 14px;
  align-items: center;
}

.next-thumb-img {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.next-place-name {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

[data-theme='dark'] .next-place-name {
  color: #f8fafc;
}

.next-place-time {
  margin: 0 0 4px;
  font-size: 0.8rem;
  color: #64748b;
}

.next-place-tip {
  margin: 0;
  font-size: 0.8rem;
  color: #0284c7;
}

/* ALL DONE CARD */
.lc-all-done-card {
  padding: 40px 24px;
  text-align: center;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

[data-theme='dark'] .lc-all-done-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.adc-celebration-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.lc-all-done-card h3 {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 8px;
  color: #0f172a;
}

[data-theme='dark'] .lc-all-done-card h3 {
  color: #f8fafc;
}

.lc-all-done-card p {
  color: #64748b;
  margin: 0 0 24px;
}

.adc-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-next-day-tour, .btn-finish-all-trip {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  background: #0284c7;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
}

.btn-finish-all-trip {
  background: #10b981;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

/* SIDEBAR RIGHT */
.sidebar-section-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  margin-bottom: 20px;
}

[data-theme='dark'] .sidebar-section-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.ssc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

[data-theme='dark'] .ssc-header {
  border-color: #1e293b;
}

.ssc-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ssc-count {
  font-size: 0.8rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 50px;
}

/* TIMELINE STEPS */
.lc-timeline-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lc-timeline-item {
  display: flex;
  gap: 14px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.lc-timeline-item:hover {
  background: #f8fafc;
}

[data-theme='dark'] .lc-timeline-item:hover {
  background: #1e293b;
}

.lc-timeline-item.is-active {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
}

[data-theme='dark'] .lc-timeline-item.is-active {
  background: rgba(2, 132, 199, 0.15);
  border-color: rgba(2, 132, 199, 0.4);
}

.tli-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28px;
  flex-shrink: 0;
  position: relative;
}

.tli-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tli-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #10b981;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tli-pulse {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #0284c7;
  box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.25);
  animation: pulseBeacon 1.5s infinite;
  margin-top: 5px;
}

.tli-line {
  flex: 1;
  width: 2px;
  background: #e2e8f0;
  margin: 6px 0;
}

[data-theme='dark'] .tli-line {
  background: #334155;
}

.tli-card-content {
  flex: 1;
  min-width: 0;
}

.tli-time-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0284c7;
  margin-bottom: 2px;
}

.tli-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.tli-place-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme='dark'] .tli-place-name {
  color: #f8fafc;
}

.lc-timeline-item.is-completed .tli-place-name {
  color: #94a3b8;
  text-decoration: line-through;
}

.tli-type-tag {
  font-size: 0.7rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

[data-theme='dark'] .tli-type-tag {
  background: #1e293b;
  color: #94a3b8;
}

.tli-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tli-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
}

.tli-cost {
  color: #10b981;
  font-weight: 600;
}

.tli-map-link {
  color: #0284c7;
  text-decoration: underline;
  font-weight: 600;
}

/* TRAVEL HINTS */
.travel-hints-list {
  padding-left: 18px;
  margin: 0 0 16px;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.6;
}

.btn-early-recap {
  width: 100%;
  padding: 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-early-recap:hover {
  background: #e2e8f0;
}

[data-theme='dark'] .btn-early-recap {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

/* SUB-VIEWS (SOS & EXPENSES) */
.lc-sub-view {
  max-width: 900px;
  margin: 0 auto;
}

.lc-sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.lc-sub-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lc-sub-back {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

/* SOS GRID */
.sos-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sos-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
}

[data-theme='dark'] .sos-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.sos-card h4 {
  margin: 0 0 14px;
  font-size: 1rem;
  font-weight: 700;
}

.hotline-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.hotline-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #ffffff;
  transition: transform 0.2s ease;
}

.hotline-btn:hover {
  transform: translateY(-2px);
}

.hotline-btn.ambulance { background: #ef4444; }
.hotline-btn.police { background: #3b82f6; }
.hotline-btn.fire { background: #f97316; }

.hl-num {
  font-size: 1.6rem;
  font-weight: 800;
}

.hl-desc {
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 4px;
}

.tourist-guide-text {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 12px;
}

.tourist-tel-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tt-number {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0284c7;
  text-decoration: none;
}

.nearby-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.nearby-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  text-decoration: none;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.nearby-btn:hover {
  background: #e2e8f0;
}

[data-theme='dark'] .nearby-btn {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

/* EXPENSES VIEW */
.expense-overview-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.exp-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

[data-theme='dark'] .exp-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.exp-lbl {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.exp-val {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 6px 0 2px;
  color: #0f172a;
}

[data-theme='dark'] .exp-val {
  color: #f8fafc;
}

.exp-card small {
  font-size: 0.75rem;
  color: #94a3b8;
}

.expense-add-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

[data-theme='dark'] .expense-add-box {
  background: #111e38;
  border-color: #1e2e4f;
}

.expense-add-box h4 {
  margin: 0 0 14px;
  font-size: 1rem;
  font-weight: 700;
}

.exp-form-grid {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.5fr auto;
  gap: 12px;
  align-items: flex-end;
}

.exp-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
}

.exp-input, .exp-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  background: #f8fafc;
  color: #0f172a;
}

[data-theme='dark'] .exp-input, [data-theme='dark'] .exp-select {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}

.btn-add-exp {
  padding: 10px 20px;
  border-radius: 10px;
  background: #f59e0b;
  color: #ffffff;
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.expenses-history-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

[data-theme='dark'] .expenses-history-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.expenses-history-card h4 {
  margin: 0 0 14px;
  font-size: 1rem;
  font-weight: 700;
}

.empty-exp-hint {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.exp-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exp-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

[data-theme='dark'] .exp-item-row {
  background: #1e293b;
  border-color: #334155;
}

.exp-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.exp-cat-badge {
  font-size: 1.25rem;
}

.exp-item-desc strong {
  display: block;
  font-size: 0.9rem;
}

.exp-item-desc small {
  font-size: 0.75rem;
  color: #64748b;
}

.exp-item-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exp-item-amount {
  font-weight: 800;
  font-size: 0.95rem;
  color: #0f172a;
}

[data-theme='dark'] .exp-item-amount {
  color: #f8fafc;
}

.exp-del-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.exp-del-btn:hover {
  color: #ef4444;
}

/* SUB MODALS */
.lc-modal-sub-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lc-modal-sub-card {
  width: 90%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .lc-modal-sub-card {
  background: #0f172a;
  color: #f8fafc;
}

.sub-target-name {
  font-size: 0.9rem;
  color: #0284c7;
  font-weight: 700;
  margin: 0 0 12px;
}

.note-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  resize: vertical;
  background: #f8fafc;
  margin-bottom: 16px;
}

[data-theme='dark'] .note-textarea {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}

.modal-sub-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-sub-cancel, .btn-sub-save {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-sub-cancel {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
}

.btn-sub-save {
  background: #0284c7;
  color: #ffffff;
  border: none;
}

/* RECAP CELEBRATION MODAL */
.lc-modal-recap-card {
  width: 90%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.4);
}

[data-theme='dark'] .lc-modal-recap-card {
  background: #0f172a;
  color: #f8fafc;
}

.recap-badge-shine {
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  padding: 5px 14px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.lc-modal-recap-card h2 {
  margin: 0 0 6px;
  font-size: 1.6rem;
  font-weight: 800;
}

.recap-slogan {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0 0 20px;
}

.recap-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.recap-cell {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
}

[data-theme='dark'] .recap-cell {
  background: #1e293b;
  border-color: #334155;
}

.rc-num {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0284c7;
}

.rc-lbl {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.recap-budget-comparison {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 24px;
  font-size: 0.9rem;
}

[data-theme='dark'] .recap-budget-comparison {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.recap-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-recap-share {
  padding: 12px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-recap-close {
  padding: 12px;
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* CONFETTI OVERLAY */
.confetti-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000001;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confetti-popup {
  background: rgba(15, 23, 42, 0.9);
  color: #ffffff;
  padding: 24px 36px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
}

.cp-icon {
  font-size: 3rem;
  margin-bottom: 6px;
}

.confetti-popup h3 {
  margin: 0 0 4px;
  font-size: 1.3rem;
}

.confetti-popup p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* MOBILE RESPONSIVE OVERRIDES */
@media (max-width: 768px) {
  .lc-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-width: none;
  }

  .lc-top-header {
    padding: 12px 16px;
  }

  .lc-trip-title {
    font-size: 1.05rem;
  }

  .lc-stat-pill span {
    font-size: 0.75rem;
  }

  .lc-header-actions .btn-lbl {
    display: none;
  }

  .lc-action-icon-btn {
    padding: 7px 9px;
  }

  .lc-day-tabs-strip {
    padding: 8px 16px;
  }

  .lc-body-content {
    padding: 14px 16px 80px; /* Padding bottom for sticky mobile bar */
  }

  .lc-main-cockpit-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .now-action-buttons-bar {
    flex-wrap: wrap;
  }

  .btn-now-nav, .btn-now-checkin {
    flex: 1 1 100%;
  }

  .btn-now-skip, .btn-now-note {
    flex: 1;
  }

  .exp-form-grid {
    grid-template-columns: 1fr;
  }

  .hotline-buttons {
    grid-template-columns: 1fr;
  }

  .nearby-grid {
    grid-template-columns: 1fr;
  }

  .expense-overview-row {
    grid-template-columns: 1fr;
  }

  /* MOBILE STICKY BAR */
  .lc-mobile-bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 68px;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 10px;
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.08);
    z-index: 100;
  }

  [data-theme='dark'] .lc-mobile-bottom-bar {
    background: #0f172a;
    border-color: #1e293b;
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.3);
  }

  .mob-bottom-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 46px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    border: none;
    cursor: pointer;
  }

  .mob-bottom-btn.btn-gmaps {
    background: #0284c7;
    color: #ffffff;
    flex: 1;
  }

  .mob-bottom-btn.btn-checkin {
    background: #10b981;
    color: #ffffff;
    flex: 1.6;
  }

  .mob-bottom-btn.btn-checkin.is-done {
    background: #64748b;
  }

  .mob-bottom-btn.btn-more {
    background: #f1f5f9;
    color: #334155;
    flex: 1;
  }

  [data-theme='dark'] .mob-bottom-btn.btn-more {
    background: #1e293b;
    color: #cbd5e1;
  }
}
</style>
