<template>
  <div v-if="isOpen && trip" class="live-companion-overlay" :class="{ 'is-mobile-view': isMobile || isSmallScreen }">
    <!-- BACKDROP BLUR -->
    <div class="lc-backdrop" @click="handleBackdropClick"></div>

    <div class="lc-container" role="dialog" aria-modal="true">
      <!-- TOP STATUS BAR -->
      <header class="lc-top-header">
        <!-- ROW 1: BRAND / LIVE / DESTINATION & ACTION BUTTONS -->
        <div class="lc-header-main-row">
          <div class="lc-header-left">
            <span class="lc-live-pill">
              <span class="live-beacon"></span>
              <span class="live-txt">TRỰC TIẾP</span>
            </span>
            <h2 class="lc-trip-title" :title="`${trip.destination} • Ngày ${currentDay}/${totalDays}`">
              {{ trip.destination }} • Ngày {{ currentDay }}/{{ totalDays }}
            </h2>
          </div>

          <div class="lc-header-actions">
            <button
              type="button"
              :class="['lc-icon-btn sos-btn', { active: activeSubTab === 'sos' }]"
              title="Cứu trợ khẩn cấp & Tiện ích"
              @click="activeSubTab = activeSubTab === 'sos' ? 'main' : 'sos'"
            >
              <AppIcon name="shield" :size="16" />
              <span class="btn-lbl">Cứu hộ</span>
            </button>
            <button
              type="button"
              :class="['lc-icon-btn wallet-btn', { active: activeSubTab === 'expenses' }]"
              title="Sổ chi tiêu thực tế"
              @click="activeSubTab = activeSubTab === 'expenses' ? 'main' : 'expenses'"
            >
              <AppIcon name="wallet" :size="16" />
              <span class="btn-lbl">Chi tiêu</span>
            </button>
            <button
              type="button"
              class="lc-close-btn"
              title="Thu nhỏ / Đóng chế độ hành trình"
              @click="$emit('close')"
            >
              <AppIcon name="x" :size="18" />
            </button>
          </div>
        </div>

        <!-- ROW 2: PROGRESS & REAL-TIME STATS CHIPS -->
        <div class="lc-header-sub-row">
          <div class="sub-stat-chip">
            <AppIcon name="checkcircle2" :size="13" color="#10b981" />
            <span>Tiến độ: <b>{{ completedCount }}/{{ totalStopsCount }}</b> ({{ progressPercent }}%)</span>
          </div>
          <div class="sub-stat-sep">·</div>
          <div class="sub-stat-chip" :class="{ 'is-over': actualSpent > (trip.total_budget || 0) }">
            <AppIcon name="wallet" :size="13" :color="actualSpent > (trip.total_budget || 0) ? '#ef4444' : '#f59e0b'" />
            <span>Chi tiêu: <b>{{ formatMoney(actualSpent) }}đ</b></span>
          </div>
          <div class="sub-stat-sep">·</div>
          <div class="sub-stat-chip trip-duration-chip" title="Tổng thời gian bạn đã đi du lịch">
            <AppIcon name="clock" :size="13" color="#0284c7" />
            <span>Đang đi: <b>{{ formattedTripDuration }}</b></span>
          </div>
        </div>

        <!-- THIN PROGRESS BAR TRACK -->
        <div class="lc-progress-track">
          <div class="lc-progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </header>

      <!-- DAY TABS STRIP -->
      <nav class="lc-day-tabs-strip">
        <button
          v-for="dayNum in totalDays"
          :key="dayNum"
          type="button"
          :class="['lc-day-tab', { active: currentDay === dayNum, completed: isDayCompleted(dayNum) }]"
          @click="selectDay(dayNum)"
        >
          <span class="day-tab-title">Ngày {{ dayNum }}</span>
          <span class="day-tab-count">
            {{ getDayCompletedCount(dayNum) }}/{{ getDayStopsCount(dayNum) }}
            <span v-if="isDayCompleted(dayNum)" class="day-check-mark">✓</span>
          </span>
        </button>
      </nav>

      <!-- MAIN BODY SPLIT -->
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
                  <span class="hl-desc">🚓 Công an</span>
                </a>
                <a href="tel:114" class="hotline-btn fire">
                  <span class="hl-num">114</span>
                  <span class="hl-desc">🚒 Cứu hỏa</span>
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
                  ⛽ Cây xăng ↗
                </a>
                <a
                  :href="`https://www.google.com/maps/search/cây+ATM+gần+đây/@${currentStopCoords || ''}`"
                  target="_blank"
                  rel="noreferrer"
                  class="nearby-btn"
                >
                  🏧 Cây ATM ↗
                </a>
                <a
                  :href="`https://www.google.com/maps/search/hiệu+thuốc+gần+đây/@${currentStopCoords || ''}`"
                  target="_blank"
                  rel="noreferrer"
                  class="nearby-btn"
                >
                  💊 Nhà thuốc ↗
                </a>
                <a
                  :href="`https://www.google.com/maps/search/tiệm+sửa+xe+máy+gần+đây/@${currentStopCoords || ''}`"
                  target="_blank"
                  rel="noreferrer"
                  class="nearby-btn"
                >
                  🔧 Vá / Sửa xe ↗
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
              <!-- CARD TOP STATUS STRIP -->
              <div class="now-card-top-tag">
                <span class="now-badge">
                  <span class="beacon-dot"></span>
                  <span class="badge-full-text">ĐANG Ở ĐÂY • ĐIỂM {{ currentStopIndex + 1 }}/{{ todayStops.length }}</span>
                  <span class="badge-short-text">ĐIỂM {{ currentStopIndex + 1 }}/{{ todayStops.length }}</span>
                </span>
                
                <div class="now-time-tags-group">
                  <span class="now-time-tag" title="Giờ dự kiến theo lịch trình">
                    <AppIcon name="clock" :size="12" /> {{ currentStop.time || '07:30' }}
                  </span>
                  <span v-if="isCurrentStopArrived()" class="now-time-tag arrived-tag" title="Thời gian khách đã đến nơi thực tế">
                    📍 Đến: <b>{{ getStopArrivalTime(currentDay, currentStopIndex) }}</b> ({{ getStopStayMinutes(currentDay, currentStopIndex) }}p)
                  </span>
                  <span v-if="isStopCompleted(currentDay, currentStopIndex)" class="now-done-status" title="Đã hoàn tất check-in">
                    ✓ Đã Check-in
                  </span>
                </div>
              </div>

              <!-- PHOTO & TITLE HERO MEDIA -->
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
                  <p class="now-place-address" :title="currentStop.address || currentStop.location || trip.destination">
                    📍 {{ currentStop.address || currentStop.location || trip.destination }}
                  </p>
                </div>
              </div>

              <!-- DETAILS BODY -->
              <div class="now-details-body">
                <!-- ARRIVAL & STAY STATUS BANNER -->
                <div v-if="!isCurrentStopArrived()" class="stop-status-banner traveling">
                  <span class="ssb-icon">🚗</span>
                  <span class="ssb-txt">Đang di chuyển · Bấm <b>"Đã đến nơi"</b> khi bạn tới</span>
                </div>
                <div v-else-if="!isStopCompleted(currentDay, currentStopIndex)" class="stop-status-banner arrived">
                  <span class="ssb-icon">📍</span>
                  <span class="ssb-txt">Đã đến lúc <b>{{ getStopArrivalTime(currentDay, currentStopIndex) }}</b> (đã ở {{ getStopStayMinutes(currentDay, currentStopIndex) }}p) · Bấm <b>"Check-in"</b> để lưu kỷ niệm</span>
                </div>
                <div v-else class="stop-status-banner checked-in">
                  <span class="ssb-icon">🎉</span>
                  <span class="ssb-txt">Đã Check-in lúc <b>{{ getStopCheckinTime(currentDay, currentStopIndex) || 'xong' }}</b> · Bấm <b>"Điểm tiếp theo"</b> khi sẵn sàng rời đi</span>
                </div>

                <!-- INLINE CHIPS: COST, DURATION -->
                <div class="now-cost-row">
                  <span class="now-cost-badge">
                    <span class="cost-full-text">{{ currentStop.estimated_cost > 0 ? `Chi phí: ~${formatMoney(currentStop.estimated_cost)}đ/người` : '✨ Miễn phí tham quan' }}</span>
                    <span class="cost-short-text">{{ currentStop.estimated_cost > 0 ? `💰 ~${formatMoney(currentStop.estimated_cost)}đ` : '✨ Miễn phí' }}</span>
                  </span>
                  <span class="now-duration-badge">
                    <span class="dur-full-text">⏳ Dừng chân: ~45 - 90 phút</span>
                    <span class="dur-short-text">⏳ ~45 - 90p</span>
                  </span>
                </div>

                <p class="now-desc-text">
                  {{ currentStop.activity || currentStop.description || 'Khám phá và tận hưởng không gian đặc trưng tại đây.' }}
                </p>

                <!-- LOCAL QUICK TIP -->
                <div class="now-insider-tip">
                  <span class="tip-icon"><AppIcon name="sparkles" :size="14" color="#0284c7" /></span>
                  <div class="tip-text">
                    <strong>Gợi ý:</strong> {{ getQuickTip(currentStop) }}
                  </div>
                </div>

                <!-- USER NOTE -->
                <div v-if="getStopNote(currentDay, currentStopIndex)" class="user-checked-note-box">
                  <div class="ucn-header">
                    <span>📸 Nhật ký check-in:</span>
                  </div>
                  <p class="ucn-text">“{{ getStopNote(currentDay, currentStopIndex) }}”</p>
                </div>

                <!-- IN-CARD ACTIONS (ON DESKTOP SHOWS ALL, ON MOBILE SHOWS SECONDARY ACTIONS) -->
                <div class="now-action-buttons-bar">
                  <!-- BUTTON 1: ĐÃ ĐẾN NƠI -->
                  <button
                    type="button"
                    :class="['btn-stop-action btn-arrived', { 'is-arrived': isCurrentStopArrived() }]"
                    @click="handleMarkCurrentStopArrived"
                    :title="isCurrentStopArrived() ? `Đã lưu thời gian đến lúc ${getStopArrivalTime(currentDay, currentStopIndex)}` : 'Đánh dấu tôi đã tới điểm này'"
                  >
                    <span>{{ isCurrentStopArrived() ? `📍 Đến lúc ${getStopArrivalTime(currentDay, currentStopIndex)}` : '📍 Tôi đã đến nơi' }}</span>
                  </button>

                  <!-- BUTTON 2: CHECK-IN -->
                  <button
                    type="button"
                    :class="['btn-stop-action btn-checkin', { 'is-already-checked': isStopCompleted(currentDay, currentStopIndex) }]"
                    @click="handleCheckinCurrentStop"
                  >
                    <AppIcon :name="isStopCompleted(currentDay, currentStopIndex) ? 'checkcircle2' : 'camera'" :size="16" />
                    <span>{{ isStopCompleted(currentDay, currentStopIndex) ? '✓ Đã Check-in' : '📸 Check-in' }}</span>
                  </button>

                  <!-- BUTTON 3: CHỈ ĐƯỜNG MAPS -->
                  <a
                    :href="getGoogleMapsTurnByTurnUrl(currentStop)"
                    target="_blank"
                    rel="noreferrer"
                    class="btn-stop-action btn-maps"
                    title="Mở Google Maps chỉ đường turn-by-turn"
                  >
                    <AppIcon name="navigation" :size="15" />
                    <span>Chỉ đường Maps ↗</span>
                  </a>

                  <!-- BUTTON 4: GHI CHÚ KỶ NIỆM -->
                  <button
                    type="button"
                    class="btn-stop-action btn-note"
                    title="Ghi chép kỷ niệm / hình ảnh"
                    @click="openNoteDialogForCurrentStop"
                  >
                    <AppIcon name="camera" :size="15" />
                    <span>Nhật ký</span>
                  </button>

                  <!-- BUTTON 5: ĐIỂM TIẾP THEO -->
                  <button
                    type="button"
                    class="btn-stop-action btn-next-stop"
                    @click="handleGoNextStop"
                    title="Rời điểm này và chuyển sang địa điểm tiếp theo"
                  >
                    <span>{{ currentStopIndex < todayStops.length - 1 ? 'Điểm tiếp theo ❯' : 'Tổng kết ngày ❯' }}</span>
                  </button>
                </div>

                <!-- PREV / NEXT MINI CONTROLS -->
                <div class="now-prev-next-nav">
                  <button
                    type="button"
                    class="btn-nav-prev"
                    :disabled="currentStopIndex === 0"
                    @click="handleGoPrevStop"
                    title="Xem lại địa điểm trước"
                  >
                    ❮ Điểm trước
                  </button>
                  <span class="nav-stop-indicator">Điểm {{ currentStopIndex + 1 }} / {{ todayStops.length }}</span>
                  <button
                    type="button"
                    class="btn-nav-next"
                    @click="handleGoNextStop"
                    title="Rời điểm này và sang điểm kế tiếp"
                  >
                    {{ currentStopIndex < todayStops.length - 1 ? 'Điểm tiếp theo ❯' : 'Tổng kết ngày ❯' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- ALL DONE CARD FOR TODAY -->
            <div v-else class="lc-all-done-card">
              <div class="adc-celebration-icon">🎉</div>
              <h3>Tuyệt vời! Bạn đã hoàn thành toàn bộ Ngày {{ currentDay }}!</h3>
              <p>Hãy nghỉ ngơi thư giãn tại khách sạn hoặc đi dạo phố đêm tự do nhé.</p>
              
              <div class="adc-actions">
                <button
                  v-if="currentDay < totalDays"
                  type="button"
                  class="btn-next-day-tour"
                  @click="selectDay(currentDay + 1)"
                >
                  🚀 Bắt đầu Ngày {{ currentDay + 1 }}
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

            <!-- NEXT STOP PREVIEW -->
            <div v-if="nextStop" class="lc-next-card">
              <div class="next-card-header">
                <span class="next-label">
                  <span class="next-lbl-full">⏭️ ĐIỂM TIẾP THEO</span>
                  <span class="next-lbl-short">⏭️ TIẾP THEO</span>
                </span>
                <span class="next-dist-pill">
                  <AppIcon name="car" :size="12" /> ~{{ estimateDistance(currentStop, nextStop) }} km (~{{ estimateDriveMinutes(currentStop, nextStop) }}p)
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
                  <p class="next-place-time">Giờ dự kiến: <b>{{ nextStop.time || 'Kế tiếp' }}</b></p>
                  <p class="next-place-tip">
                    💡 Mẹo: {{ getPreparationHint(nextStop) }}
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
                  <AppIcon name="calendar" :size="15" /> Lộ trình Ngày {{ currentDay }}
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
                    <div class="tli-time-badge">
                      <span class="tli-plan-time">{{ act.time || `Điểm ${aIdx + 1}` }}</span>
                      <span v-if="isStopArrived(currentDay, aIdx)" class="tli-arrived-pill">
                        📍 Đến: {{ getStopArrivalTime(currentDay, aIdx) }}
                      </span>
                    </div>
                    <div class="tli-title-row">
                      <strong class="tli-place-name">{{ act.place || act.name }}</strong>
                      <span class="tli-type-tag">{{ getActivityTypeTag(act.type) }}</span>
                    </div>
                    <p class="tli-desc">{{ act.activity || act.description }}</p>

                    <div class="tli-bottom-row">
                      <span class="tli-cost">
                        {{ act.estimated_cost > 0 ? `~${formatMoney(act.estimated_cost)}đ` : 'Miễn phí' }}
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

            <!-- TRAVEL TIPS -->
            <div class="sidebar-section-card tips-card">
              <h4>🌤️ Tiện Ích Hành Trình</h4>
              <ul class="travel-hints-list">
                <li>👟 Mang giày thể thao êm ái để thoải mái di chuyển.</li>
                <li>📱 Giữ điện thoại đầy pin để tra Google Maps & chụp ảnh.</li>
                <li>💵 Chuẩn bị sẵn tiền mặt lẻ để thanh toán gửi xe.</li>
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

      <!-- BOTTOM MOBILE STICKY NAV BAR -->
      <footer class="lc-mobile-bottom-bar" v-if="(isMobile || isSmallScreen) && activeSubTab === 'main' && currentStop">
        <!-- MAPS BUTTON -->
        <a
          :href="getGoogleMapsTurnByTurnUrl(currentStop)"
          target="_blank"
          rel="noreferrer"
          class="mob-bottom-btn btn-gmaps"
          title="Chỉ đường Google Maps"
        >
          <AppIcon name="navigation" :size="16" />
          <span>Maps</span>
        </a>

        <!-- NÚT TRẠNG THÁI: ĐÃ ĐẾN NƠI (KHI CHƯA ĐẾN) HOẶC CHECK-IN (KHI ĐÃ ĐẾN NƠI) -->
        <button
          v-if="!isCurrentStopArrived()"
          type="button"
          class="mob-bottom-btn btn-arrive"
          @click="handleMarkCurrentStopArrived"
          title="Bấm khi bạn đã tới địa điểm này"
        >
          <span class="btn-checkin-text">📍 Đã đến nơi</span>
        </button>

        <button
          v-else-if="!isStopCompleted(currentDay, currentStopIndex)"
          type="button"
          class="mob-bottom-btn btn-checkin"
          @click="handleCheckinCurrentStop"
          title="Bấm để Check-in lưu kỷ niệm"
        >
          <AppIcon name="camera" :size="16" />
          <span class="btn-checkin-text">📸 Check-in</span>
        </button>

        <button
          v-else
          type="button"
          class="mob-bottom-btn btn-checkin is-done"
          @click="openNoteDialogForCurrentStop"
          title="Đã check-in điểm này"
        >
          <AppIcon name="checkcircle2" :size="16" />
          <span class="btn-checkin-text">✓ Đã Check-in</span>
        </button>

        <!-- NÚT ĐỊA ĐIỂM TIẾP THEO -->
        <button
          type="button"
          class="mob-bottom-btn btn-next-loc"
          @click="handleGoNextStop"
          title="Chuyển sang địa điểm tiếp theo"
        >
          <span>{{ currentStopIndex < todayStops.length - 1 ? 'Tiếp theo ❯' : 'Xong ngày 🎉' }}</span>
        </button>
      </footer>
    </div>

    <!-- DIALOG: THÊM GHI CHÚ / CHECK-IN PHOTO -->
    <transition name="fade">
      <div v-if="showNoteDialog" class="lc-modal-sub-overlay" @click.self="showNoteDialog = false">
        <div class="lc-modal-sub-card">
          <h4>📸 Ghi chú kỷ niệm tại điểm đến</h4>
          <p class="sub-target-name">{{ currentStop?.place || currentStop?.name }}</p>
          <textarea
            v-model="tempNoteText"
            rows="3"
            class="note-textarea"
            placeholder="VD: Quán ăn rất ngon, view chụp ảnh hoàng hôn cực đẹp..."
          ></textarea>
          <div class="modal-sub-actions">
            <button type="button" class="btn-sub-cancel" @click="showNoteDialog = false">Đóng</button>
            <button type="button" class="btn-sub-save" @click="saveCurrentStopNote">Lưu kỷ niệm</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- CELEBRATION RECAP MODAL -->
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
              <span class="rc-num">{{ formattedTripDurationFull }}</span>
              <span class="rc-lbl">Tổng thời gian du lịch</span>
            </div>
            <div class="recap-cell">
              <span class="rc-num">{{ totalDays }} ngày</span>
              <span class="rc-lbl">Độ dài hành trình</span>
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

    <!-- CONFETTI CELEBRATION EFFECT -->
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

// Auto-detect small screen width
const isSmallScreen = ref(typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
function updateScreenSize() {
  isSmallScreen.value = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
}

// TABS & SUB-VIEWS: 'main' | 'expenses' | 'sos'
const activeSubTab = ref('main')
const currentDay = ref(1)
const currentStopIndex = ref(0)
const completedStops = ref([]) // array of 'day-index' strings: e.g. ['1-0', '1-1']
const stopArrivalTimes = ref({}) // { 'day-index': timestamp }
const stopCheckinTimes = ref({}) // { 'day-index': timestamp }
const stopNotes = ref({}) // { '1-0': 'note text' }
const expensesList = ref([]) // [{ id, title, amount, category, time }]
const showNoteDialog = ref(false)
const tempNoteText = ref('')
const showRecapModal = ref(false)
const showConfettiAnim = ref(false)

// Live Trip Stopwatch Timer
const tripStartTime = ref(null)
const nowTick = ref(Date.now())
let timerInterval = null

const tripElapsedSeconds = computed(() => {
  if (!tripStartTime.value) return 0
  return Math.max(0, Math.floor((nowTick.value - tripStartTime.value) / 1000))
})

const formattedTripDuration = computed(() => {
  const totalSec = tripElapsedSeconds.value
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

const formattedTripDurationFull = computed(() => {
  const totalSec = tripElapsedSeconds.value
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)

  if (days > 0) {
    return `${days} ngày ${hours} giờ ${minutes} phút`
  }
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`
  }
  return `${Math.max(1, minutes)} phút`
})

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
      stopArrivalTimes.value = data.stopArrivalTimes || {}
      stopCheckinTimes.value = data.stopCheckinTimes || {}
      stopNotes.value = data.stopNotes || {}
      expensesList.value = data.expensesList || []
      tripStartTime.value = data.tripStartTime || Date.now()
    } else {
      currentDay.value = 1
      currentStopIndex.value = 0
      completedStops.value = []
      stopArrivalTimes.value = {}
      stopCheckinTimes.value = {}
      stopNotes.value = {}
      expensesList.value = []
      tripStartTime.value = Date.now()
    }
  } catch (e) {
    console.warn('Lỗi đọc live trip state:', e)
  }
}

function persistState() {
  try {
    const data = {
      tripStartTime: tripStartTime.value || Date.now(),
      currentDay: currentDay.value,
      currentStopIndex: currentStopIndex.value,
      completedStops: completedStops.value,
      stopArrivalTimes: stopArrivalTimes.value,
      stopCheckinTimes: stopCheckinTimes.value,
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
    updateScreenSize()
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadSavedState()
  }
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
  timerInterval = setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
  if (timerInterval) clearInterval(timerInterval)
})

// Day selection
function selectDay(dayNum) {
  currentDay.value = dayNum
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

// Stop Status & Arrival Helpers
function isCurrentStopArrived() {
  return isStopArrived(currentDay.value, currentStopIndex.value)
}

function isStopArrived(dayNum, stopIdx) {
  const key = `${dayNum}-${stopIdx}`
  return !!stopArrivalTimes.value[key]
}

function getStopArrivalTime(dayNum, stopIdx) {
  const key = `${dayNum}-${stopIdx}`
  const ts = stopArrivalTimes.value[key]
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function getStopCheckinTime(dayNum, stopIdx) {
  const key = `${dayNum}-${stopIdx}`
  const ts = stopCheckinTimes.value[key]
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function getStopStayMinutes(dayNum, stopIdx) {
  const key = `${dayNum}-${stopIdx}`
  const ts = stopArrivalTimes.value[key]
  if (!ts) return 0
  return Math.max(1, Math.floor((nowTick.value - ts) / 60000))
}

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

// 1. Mark Arrived (Lưu lại thời gian đến nơi - KHÔNG ĐẨY SANG ĐIỂM KHÁC)
function handleMarkCurrentStopArrived() {
  const key = `${currentDay.value}-${currentStopIndex.value}`
  if (!stopArrivalTimes.value[key]) {
    stopArrivalTimes.value[key] = Date.now()
  }
  if (navigator.vibrate) {
    navigator.vibrate([80])
  }
  persistState()
}

// 2. Check-in Stop (Lưu check-in & nổ pháo hoa - KHÔNG TỰ ĐỘNG ĐẨY SANG ĐIỂM KHÁC)
function handleCheckinCurrentStop() {
  const key = `${currentDay.value}-${currentStopIndex.value}`
  
  // Tự động ghi nhận giờ đến nếu chưa bấm
  if (!stopArrivalTimes.value[key]) {
    stopArrivalTimes.value[key] = Date.now()
  }

  if (!completedStops.value.includes(key)) {
    completedStops.value.push(key)
    stopCheckinTimes.value[key] = Date.now()
    
    // Haptic feedback if on mobile
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    // Trigger celebration effect
    showConfettiAnim.value = true
    setTimeout(() => {
      showConfettiAnim.value = false
    }, 2200)
  }
  persistState()
}

// 3. Tiến tới địa điểm tiếp theo (Chủ động bấm nút)
function handleGoNextStop() {
  if (currentStopIndex.value < todayStops.value.length - 1) {
    currentStopIndex.value++
  } else {
    if (currentDay.value < totalDays.value) {
      if (confirm(`🎉 Bạn đã đi hết các điểm của Ngày ${currentDay.value}! Bạn có muốn chuyển sang Ngày ${currentDay.value + 1} không?`)) {
        selectDay(currentDay.value + 1)
      }
    } else {
      showRecapModal.value = true
    }
  }
  persistState()
}

// 4. Lùi về địa điểm trước
function handleGoPrevStop() {
  if (currentStopIndex.value > 0) {
    currentStopIndex.value--
    persistState()
  }
}

function handleSkipCurrentStop() {
  handleGoNextStop()
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

function getGoogleMapsTurnByTurnUrl(act) {
  if (!act) return '#'
  if (act.latitude && act.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${act.latitude},${act.longitude}&travelmode=driving`
  }
  const query = `${act.place || act.name || ''} ${act.address || ''} ${props.trip?.destination || ''}`.trim()
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`
}

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

function getQuickTip(stop) {
  const type = stop?.type || ''
  const name = (stop?.place || stop?.name || '').toLowerCase()
  if (type === 'breakfast') return 'Nên gọi thêm một phần quẩy hoặc trà đá để thưởng thức trọn vẹn vị buổi sáng.'
  if (type === 'cafe') return 'Góc ban công hoặc cạnh cửa sổ là vị trí ngắm cảnh và chụp ảnh đẹp nhất quán!'
  if (type === 'lunch') return 'Giờ trưa quán có thể đông, hãy hỏi nhân viên bàn trống và gọi món đặc sản trước.'
  if (type === 'dinner') return 'Tận hưởng ẩm thực kết hợp ngắm không khí đêm lung linh của phố phường.'
  if (name.includes('biển') || name.includes('bãi')) return 'Nhớ thoa kem chống nắng, mang kính râm và cất tư trang cẩn thận trước khi tắm.'
  if (name.includes('chùa') || name.includes('lăng') || name.includes('đại nội')) return 'Chú ý mặc trang phục lịch sự qua đầu gối tại nơi tôn nghiêm.'
  return 'Hãy giữ gìn vệ sinh chung, lưu lại những bức ảnh kỷ niệm tuyệt đẹp nhé!'
}

function getPreparationHint(stop) {
  const type = stop?.type || ''
  if (['breakfast', 'lunch', 'dinner'].includes(type)) return 'Để bụng đói để thưởng thức hương vị trọn vẹn!'
  if (type === 'attraction') return 'Chuẩn bị nón, quạt và nước suối để dạo bộ thoải mái.'
  if (type === 'cafe') return 'Sạc sẵn pin điện thoại để thỏa sức chụp ảnh check-in.'
  return 'Kiểm tra đồ đạc cá nhân trước khi di chuyển.'
}

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
    const d = (R * c * 1.3).toFixed(1)
    return Math.max(0.8, d)
  }
  return '3.2'
}

function estimateDriveMinutes(stopA, stopB) {
  const dist = parseFloat(estimateDistance(stopA, stopB)) || 3
  return Math.max(5, Math.round(dist * 3.5))
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
    case 'breakfast': return '🍜 Điểm tâm'
    case 'cafe': return '☕ Cà phê'
    case 'lunch': return '🍲 Ăn trưa'
    case 'dinner': return '🍽️ Ăn tối'
    case 'checkin': return '🏨 Nhận phòng'
    case 'attraction': return '📸 Tham quan'
    default: return '✨ Trải nghiệm'
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
  emit('close')
}

function handleShareRecap() {
  const text = `🎉 Tôi vừa hoàn thành chuyến đi ${props.trip?.destination} (${totalDays.value} ngày)!\n` +
    `⏱️ Tổng thời gian trải nghiệm: ${formattedTripDurationFull.value}\n` +
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
/* ==================== BASE CONTAINER & RESET ==================== */
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
  box-sizing: border-box;
}

.live-companion-overlay * {
  box-sizing: border-box;
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
  animation: lcScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-theme='dark'] .lc-container {
  background: #0b1329;
  color: #f1f5f9;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

@keyframes lcScaleIn {
  from { opacity: 0; transform: scale(0.97) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ==================== HEADER (DESKTOP & MOBILE-READY) ==================== */
.lc-top-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  z-index: 20;
}

[data-theme='dark'] .lc-top-header {
  background: #0f172a;
  border-color: #1e293b;
}

.lc-header-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 8px;
  gap: 12px;
}

.lc-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.lc-live-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 2px 8px;
  border-radius: 50px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.live-beacon {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulseBeacon 1.4s ease-in-out infinite;
}

@keyframes pulseBeacon {
  0% { transform: scale(0.85); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.4; }
  100% { transform: scale(0.85); opacity: 1; }
}

.lc-trip-title {
  margin: 0;
  font-size: clamp(0.95rem, 2.8vw, 1.25rem);
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme='dark'] .lc-trip-title {
  color: #f8fafc;
}

.lc-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.lc-icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.lc-icon-btn.sos-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.lc-icon-btn.sos-btn:hover, .lc-icon-btn.sos-btn.active {
  background: #fca5a5;
}

.lc-icon-btn.wallet-btn {
  background: #fef3c7;
  color: #b45309;
}

.lc-icon-btn.wallet-btn:hover, .lc-icon-btn.wallet-btn.active {
  background: #fde68a;
}

.lc-close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
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

/* SUB STATS ROW */
.lc-header-sub-row {
  display: flex;
  align-items: center;
  padding: 0 20px 8px;
  gap: 8px;
  font-size: 0.78rem;
  color: #64748b;
  white-space: nowrap;
  overflow-x: auto;
}

[data-theme='dark'] .lc-header-sub-row {
  color: #94a3b8;
}

.sub-stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.sub-stat-chip b {
  color: #0f172a;
}

[data-theme='dark'] .sub-stat-chip b {
  color: #f8fafc;
}

.sub-stat-chip.is-over {
  color: #ef4444;
}

.sub-stat-chip.is-over b {
  color: #ef4444;
}

.sub-stat-sep {
  opacity: 0.4;
  flex-shrink: 0;
}

/* PROGRESS BAR */
.lc-progress-track {
  width: 100%;
  height: 3px;
  background: #e2e8f0;
}

[data-theme='dark'] .lc-progress-track {
  background: #1e293b;
}

.lc-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
  transition: width 0.35s ease;
}

/* ==================== DAY TABS STRIP ==================== */
.lc-day-tabs-strip {
  display: flex;
  gap: 6px;
  padding: 8px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.lc-day-tabs-strip::-webkit-scrollbar {
  display: none;
}

[data-theme='dark'] .lc-day-tabs-strip {
  background: #091120;
  border-color: #1e293b;
}

.lc-day-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
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
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.35);
}

.lc-day-tab.completed {
  border-color: #10b981;
}

.day-tab-count {
  font-size: 0.72rem;
  opacity: 0.9;
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 6px;
  border-radius: 10px;
}

.lc-day-tab.active .day-tab-count {
  background: rgba(255, 255, 255, 0.25);
}

.day-check-mark {
  color: #10b981;
  font-weight: 800;
}

/* ==================== BODY CONTENT & GRID ==================== */
.lc-body-content {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  background: #f8fafc;
}

[data-theme='dark'] .lc-body-content {
  background: #0b1329;
}

.lc-main-cockpit-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ==================== NOW CARD ==================== */
.lc-now-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 25px -4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 18px;
}

[data-theme='dark'] .lc-now-card {
  background: #111e38;
  border-color: #1e2e4f;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.now-card-top-tag {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdf4;
  border-bottom: 1px solid #dcfce7;
  gap: 8px;
}

[data-theme='dark'] .now-card-top-tag {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
}

.now-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 800;
  color: #059669;
  white-space: nowrap;
}

.badge-short-text,
.cost-short-text,
.dur-short-text,
.next-lbl-short {
  display: none;
}

.badge-full-text,
.cost-full-text,
.dur-full-text,
.next-lbl-full {
  display: inline;
}

.beacon-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  animation: pulseBeacon 1.5s infinite;
  flex-shrink: 0;
}

.now-time-tags-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.now-time-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.now-time-tag.arrived-tag {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgba(2, 132, 199, 0.2);
}

[data-theme='dark'] .now-time-tag.arrived-tag {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.25);
}

[data-theme='dark'] .now-time-tag {
  color: #94a3b8;
}

.now-done-status {
  font-size: 0.75rem;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  white-space: nowrap;
}

/* HERO MEDIA */
.now-hero-media {
  position: relative;
  width: 100%;
  height: 210px;
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
  bottom: 12px;
  left: 16px;
  right: 16px;
  color: #ffffff;
}

.now-type-pill {
  display: inline-block;
  background: rgba(2, 132, 199, 0.92);
  color: #ffffff;
  padding: 2px 9px;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.now-place-name {
  margin: 0 0 3px;
  font-size: clamp(1.1rem, 3.8vw, 1.45rem);
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0,0,0,0.6);
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.now-place-address {
  margin: 0;
  font-size: 0.8rem;
  color: #e2e8f0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* DETAILS BODY */
.now-details-body {
  padding: 16px;
}

.now-cost-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.now-cost-badge, .now-duration-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  white-space: nowrap;
}

[data-theme='dark'] .now-cost-badge, [data-theme='dark'] .now-duration-badge {
  background: #1e293b;
  color: #cbd5e1;
}

.now-desc-text {
  font-size: 0.88rem;
  line-height: 1.55;
  color: #334155;
  margin: 0 0 12px;
}

[data-theme='dark'] .now-desc-text {
  color: #cbd5e1;
}

.now-insider-tip {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  background: #f0f9ff;
  border-left: 3px solid #0284c7;
  border-radius: 8px;
  margin-bottom: 14px;
  font-size: 0.82rem;
  color: #0369a1;
  line-height: 1.45;
}

[data-theme='dark'] .now-insider-tip {
  background: rgba(2, 132, 199, 0.12);
  color: #7dd3fc;
}

.user-checked-note-box {
  padding: 10px 14px;
  background: #fefce8;
  border-left: 3px solid #eab308;
  border-radius: 8px;
  margin-bottom: 14px;
  font-size: 0.82rem;
  color: #854d0e;
}

[data-theme='dark'] .user-checked-note-box {
  background: rgba(234, 179, 8, 0.15);
  color: #fde047;
}

/* STOP STATUS BANNER */
.stop-status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 12px;
}

.stop-status-banner.traveling {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.stop-status-banner.arrived {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.stop-status-banner.checked-in {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

[data-theme='dark'] .stop-status-banner.traveling {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

[data-theme='dark'] .stop-status-banner.arrived {
  background: rgba(30, 58, 138, 0.25);
  border-color: rgba(59, 130, 246, 0.4);
  color: #93c5fd;
}

[data-theme='dark'] .stop-status-banner.checked-in {
  background: rgba(20, 83, 45, 0.25);
  border-color: rgba(34, 197, 94, 0.4);
  color: #86efac;
}

/* ACTION BUTTONS (DESKTOP) */
.now-action-buttons-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.btn-stop-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.82rem;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-stop-action.btn-arrived {
  background: #0284c7;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
}

.btn-stop-action.btn-arrived.is-arrived {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #86efac;
  box-shadow: none;
}

[data-theme='dark'] .btn-stop-action.btn-arrived.is-arrived {
  background: rgba(16, 185, 129, 0.15);
  color: #86efac;
  border-color: rgba(16, 185, 129, 0.4);
}

.btn-stop-action.btn-checkin {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}

.btn-stop-action.btn-checkin.is-already-checked {
  background: #64748b;
  box-shadow: none;
}

.btn-stop-action.btn-maps {
  background: #f1f5f9;
  color: #0284c7;
  border: 1px solid #cbd5e1;
}

.btn-stop-action.btn-note {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-stop-action.btn-next-stop {
  background: #0f172a;
  color: #ffffff;
  margin-left: auto;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
}

[data-theme='dark'] .btn-stop-action.btn-maps,
[data-theme='dark'] .btn-stop-action.btn-note {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

[data-theme='dark'] .btn-stop-action.btn-next-stop {
  background: #38bdf8;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.25);
}

/* PREV / NEXT NAV BAR */
.now-prev-next-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

[data-theme='dark'] .now-prev-next-nav {
  border-color: #334155;
}

.btn-nav-prev,
.btn-nav-next {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-nav-prev:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-nav-next {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

[data-theme='dark'] .btn-nav-prev {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.nav-stop-indicator {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
}

/* TIMELINE ARRIVAL PILL */
.tli-arrived-pill {
  font-size: 0.65rem;
  color: #059669;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.12);
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 4px;
  display: inline-block;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

/* ==================== NEXT CARD ==================== */
.lc-next-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px dashed #94a3b8;
  padding: 12px 14px;
  margin-bottom: 16px;
}

[data-theme='dark'] .lc-next-card {
  background: #111e38;
  border-color: #334155;
}

.next-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.next-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.5px;
}

.next-dist-pill {
  font-size: 0.7rem;
  font-weight: 700;
  color: #0284c7;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.next-card-content {
  display: flex;
  gap: 12px;
  align-items: center;
}

.next-thumb-img {
  width: 58px;
  height: 58px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.next-info-block {
  min-width: 0;
  flex: 1;
}

.next-place-name {
  margin: 0 0 2px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme='dark'] .next-place-name {
  color: #f8fafc;
}

.next-place-time {
  margin: 0 0 2px;
  font-size: 0.75rem;
  color: #64748b;
}

.next-place-tip {
  margin: 0;
  font-size: 0.75rem;
  color: #0284c7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==================== ALL DONE CARD ==================== */
.lc-all-done-card {
  padding: 30px 18px;
  text-align: center;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  margin-bottom: 18px;
}

[data-theme='dark'] .lc-all-done-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.adc-celebration-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.lc-all-done-card h3 {
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0 0 6px;
  color: #0f172a;
}

[data-theme='dark'] .lc-all-done-card h3 {
  color: #f8fafc;
}

.lc-all-done-card p {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0 0 18px;
}

.adc-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn-next-day-tour, .btn-finish-all-trip {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.88rem;
  border: none;
  cursor: pointer;
  background: #0284c7;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.btn-finish-all-trip {
  background: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* ==================== SIDEBAR RIGHT / TIMELINE ==================== */
.sidebar-section-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  margin-bottom: 16px;
}

[data-theme='dark'] .sidebar-section-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.ssc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

[data-theme='dark'] .ssc-header {
  border-color: #1e293b;
}

.ssc-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ssc-count {
  font-size: 0.75rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 7px;
  border-radius: 50px;
}

.lc-timeline-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lc-timeline-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 7px;
  border-radius: 10px;
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
  width: 24px;
  flex-shrink: 0;
}

.tli-number {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tli-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #10b981;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tli-pulse {
  width: 12px;
  height: 12px;
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
  margin: 4px 0;
}

[data-theme='dark'] .tli-line {
  background: #334155;
}

.tli-card-content {
  flex: 1;
  min-width: 0;
}

.tli-time-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #0284c7;
  margin-bottom: 2px;
}

.tli-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
}

.tli-place-name {
  font-size: 0.85rem;
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
  font-size: 0.68rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

[data-theme='dark'] .tli-type-tag {
  background: #1e293b;
  color: #94a3b8;
}

.tli-desc {
  font-size: 0.76rem;
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
  font-size: 0.72rem;
}

.tli-cost {
  color: #10b981;
  font-weight: 700;
}

.tli-map-link {
  color: #0284c7;
  text-decoration: underline;
  font-weight: 600;
}

.travel-hints-list {
  padding-left: 16px;
  margin: 0 0 14px;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
}

.btn-early-recap {
  width: 100%;
  padding: 9px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.82rem;
  color: #334155;
  cursor: pointer;
}

[data-theme='dark'] .btn-early-recap {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

/* ==================== SUB-VIEWS (SOS & EXPENSES) ==================== */
.lc-sub-view {
  max-width: 900px;
  margin: 0 auto;
}

.lc-sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.lc-sub-header h3 {
  margin: 0;
  font-size: clamp(1rem, 3.2vw, 1.25rem);
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lc-sub-back {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 5px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  white-space: nowrap;
}

[data-theme='dark'] .lc-sub-back {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.sos-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sos-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 16px;
}

[data-theme='dark'] .sos-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.sos-card h4 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  font-weight: 700;
}

.hotline-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.hotline-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 10px;
  text-decoration: none;
  color: #ffffff;
  text-align: center;
}

.hotline-btn.ambulance { background: #ef4444; }
.hotline-btn.police { background: #3b82f6; }
.hotline-btn.fire { background: #f97316; }

.hl-num {
  font-size: 1.4rem;
  font-weight: 800;
}

.hl-desc {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 3px;
  white-space: nowrap;
}

.tourist-guide-text {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 10px;
}

.tourist-tel-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tt-number {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0284c7;
  text-decoration: none;
}

.nearby-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.nearby-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  text-decoration: none;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.8rem;
  text-align: center;
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
  gap: 12px;
  margin-bottom: 16px;
}

.exp-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

[data-theme='dark'] .exp-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.exp-lbl {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.exp-val {
  font-size: clamp(1rem, 3.2vw, 1.3rem);
  font-weight: 800;
  margin: 4px 0 2px;
  color: #0f172a;
}

[data-theme='dark'] .exp-val {
  color: #f8fafc;
}

.exp-card small {
  font-size: 0.7rem;
  color: #94a3b8;
}

.expense-add-box, .expenses-history-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
}

[data-theme='dark'] .expense-add-box, [data-theme='dark'] .expenses-history-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.expense-add-box h4, .expenses-history-card h4 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  font-weight: 700;
}

.exp-form-grid {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.5fr auto;
  gap: 10px;
  align-items: flex-end;
}

.exp-field label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 3px;
}

.exp-input, .exp-select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background: #f8fafc;
  color: #0f172a;
}

[data-theme='dark'] .exp-input, [data-theme='dark'] .exp-select {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}

.btn-add-exp {
  padding: 8px 16px;
  border-radius: 8px;
  background: #f59e0b;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.empty-exp-hint {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.exp-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.exp-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
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
  gap: 8px;
  min-width: 0;
}

.exp-cat-badge {
  font-size: 1.15rem;
}

.exp-item-desc {
  min-width: 0;
}

.exp-item-desc strong {
  display: block;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exp-item-desc small {
  font-size: 0.7rem;
  color: #64748b;
}

.exp-item-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.exp-item-amount {
  font-weight: 800;
  font-size: 0.88rem;
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
  padding: 2px;
}

/* ==================== SUB MODALS ==================== */
.lc-modal-sub-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000000;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.lc-modal-sub-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .lc-modal-sub-card {
  background: #0f172a;
  color: #f8fafc;
}

.sub-target-name {
  font-size: 0.85rem;
  color: #0284c7;
  font-weight: 700;
  margin: 0 0 10px;
}

.note-textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.88rem;
  resize: vertical;
  background: #f8fafc;
  margin-bottom: 12px;
}

[data-theme='dark'] .note-textarea {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}

.modal-sub-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-sub-cancel, .btn-sub-save {
  padding: 7px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.82rem;
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
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px;
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
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.lc-modal-recap-card h2 {
  margin: 0 0 4px;
  font-size: 1.4rem;
  font-weight: 800;
}

.recap-slogan {
  color: #64748b;
  font-size: 0.88rem;
  margin: 0 0 16px;
}

.recap-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.recap-cell {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

[data-theme='dark'] .recap-cell {
  background: #1e293b;
  border-color: #334155;
}

.rc-num {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0284c7;
}

.rc-lbl {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 2px;
}

.recap-budget-comparison {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 18px;
  font-size: 0.85rem;
}

[data-theme='dark'] .recap-budget-comparison {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.recap-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-recap-share {
  padding: 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-recap-close {
  padding: 10px;
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
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
  padding: 16px;
}

.confetti-popup {
  background: rgba(15, 23, 42, 0.92);
  color: #ffffff;
  padding: 20px 30px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
}

.cp-icon {
  font-size: 2.5rem;
  margin-bottom: 4px;
}

.confetti-popup h3 {
  margin: 0 0 4px;
  font-size: 1.15rem;
}

.confetti-popup p {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.85;
}

/* ========================================================================= */
/* UNIVERSAL MOBILE RESPONSIVE ENGINE (COVERS 320px, 360px, 375px, 390px, 412px, 430px) */
/* ========================================================================= */
@media (max-width: 768px), screen and (max-width: 768px) {
  /* ==================== ZERO HORIZONTAL OVERFLOW LOCK ==================== */
  .live-companion-overlay,
  .lc-container,
  .lc-top-header,
  .lc-day-tabs-strip,
  .lc-body-content,
  .lc-main-cockpit-grid,
  .lc-left-cockpit,
  .lc-right-sidebar,
  .lc-now-card,
  .lc-next-card,
  .sidebar-section-card {
    box-sizing: border-box !important;
    max-width: 100% !important;
  }

  .lc-container {
    width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    height: 100dvh !important;
    border-radius: 0 !important;
    margin: 0 !important;
    overflow-x: hidden !important;
  }

  /* Short/Full Text Toggles */
  .badge-short-text,
  .cost-short-text,
  .dur-short-text,
  .next-lbl-short {
    display: inline !important;
  }

  .badge-full-text,
  .cost-full-text,
  .dur-full-text,
  .next-lbl-full {
    display: none !important;
  }

  .lc-header-main-row {
    padding: 8px 12px 5px;
    gap: 6px;
  }

  .lc-header-left {
    gap: 6px;
    min-width: 0;
  }

  .lc-live-pill {
    padding: 1px 6px;
    font-size: 0.62rem;
  }

  .lc-live-pill .live-beacon {
    width: 5px;
    height: 5px;
  }

  .lc-trip-title {
    font-size: 0.92rem;
  }

  .lc-header-actions .btn-lbl {
    display: none;
  }

  .lc-icon-btn {
    padding: 5px 7px;
    border-radius: 7px;
  }

  .lc-close-btn {
    width: 28px;
    height: 28px;
  }

  .lc-header-sub-row {
    padding: 0 12px 5px;
    font-size: 0.7rem;
    gap: 6px;
  }

  .lc-day-tabs-strip {
    padding: 5px 12px;
    gap: 5px;
  }

  .lc-day-tab {
    padding: 3px 9px;
    font-size: 0.72rem;
  }

  .day-tab-count {
    font-size: 0.65rem;
    padding: 1px 4px;
  }

  /* SCROLLABLE BODY: Strictly vertical scroll, no horizontal swipe */
  .lc-body-content {
    padding: 8px 10px 72px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    touch-action: pan-y !important;
    overscroll-behavior-x: none !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  .lc-main-cockpit-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    overflow-x: hidden !important;
  }

  .lc-left-cockpit,
  .lc-right-sidebar {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  /* ==================== COMPACT NOW CARD (SMALL & BEAUTIFUL) ==================== */
  .lc-now-card {
    border-radius: 12px !important;
    margin-bottom: 8px !important;
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05) !important;
  }

  .now-card-top-tag {
    padding: 5px 8px !important;
    font-size: 0.68rem !important;
    gap: 4px !important;
  }

  .now-badge {
    font-size: 0.68rem !important;
    gap: 4px !important;
  }

  .beacon-dot {
    width: 6px !important;
    height: 6px !important;
  }

  .now-time-tag,
  .now-done-status {
    font-size: 0.68rem !important;
  }

  /* COMPACT CINEMATIC BANNER MEDIA */
  .now-hero-media {
    height: 115px !important; /* Compact 115px height - perfectly small & visible */
  }

  .now-hero-floating-info {
    bottom: 6px !important;
    left: 8px !important;
    right: 8px !important;
  }

  .now-type-pill {
    padding: 1px 6px !important;
    font-size: 0.6rem !important;
    margin-bottom: 2px !important;
  }

  .now-place-name {
    font-size: 0.95rem !important;
    line-height: 1.25 !important;
    margin: 0 0 2px !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }

  .now-place-address {
    font-size: 0.66rem !important;
    line-height: 1.2 !important;
    opacity: 0.9 !important;
  }

  /* COMPACT DETAILS BODY */
  .now-details-body {
    padding: 7px 9px !important;
  }

  .now-cost-row {
    gap: 4px !important;
    margin-bottom: 5px !important;
  }

  .now-cost-badge,
  .now-duration-badge {
    font-size: 0.68rem !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
  }

  .now-desc-text {
    font-size: 0.74rem !important;
    line-height: 1.35 !important;
    margin-bottom: 5px !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }

  .now-insider-tip {
    padding: 4px 7px !important;
    font-size: 0.7rem !important;
    line-height: 1.3 !important;
    margin-bottom: 0 !important;
    border-radius: 6px !important;
    border-left-width: 2.5px !important;
    gap: 6px !important;
  }

  .now-action-buttons-bar {
    display: none !important; /* Bottom bar takes care of actions */
  }

  /* ==================== COMPACT NEXT CARD ==================== */
  .lc-next-card {
    padding: 6px 8px !important;
    margin-bottom: 8px !important;
    border-radius: 10px !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  .next-card-header {
    margin-bottom: 4px !important;
  }

  .next-label {
    font-size: 0.62rem !important;
    font-weight: 800 !important;
  }

  .next-dist-pill {
    font-size: 0.62rem !important;
  }

  .next-card-content {
    gap: 8px !important;
  }

  .next-thumb-img {
    width: 36px !important;
    height: 36px !important;
    border-radius: 6px !important;
  }

  .next-place-name {
    font-size: 0.78rem !important;
    margin-bottom: 1px !important;
  }

  .next-place-time {
    font-size: 0.66rem !important;
    margin-bottom: 1px !important;
  }

  .next-place-tip {
    font-size: 0.66rem !important;
    line-height: 1.25 !important;
  }

  /* ==================== COMPACT TIMELINE STEPS ==================== */
  .sidebar-section-card {
    padding: 8px 10px !important;
    border-radius: 12px !important;
    margin-bottom: 8px !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  .ssc-header {
    margin-bottom: 6px !important;
    padding-bottom: 4px !important;
  }

  .ssc-header h4 {
    font-size: 0.8rem !important;
  }

  .ssc-count {
    font-size: 0.66rem !important;
    padding: 1px 5px !important;
  }

  .lc-timeline-steps {
    gap: 5px !important;
  }

  .lc-timeline-item {
    padding: 4px 6px !important;
    gap: 6px !important;
    border-radius: 6px !important;
  }

  .tli-indicator {
    width: 18px !important;
  }

  .tli-number,
  .tli-check {
    width: 18px !important;
    height: 18px !important;
    font-size: 0.62rem !important;
  }

  .tli-time-badge {
    font-size: 0.64rem !important;
  }

  .tli-place-name {
    font-size: 0.76rem !important;
  }

  .tli-type-tag {
    font-size: 0.62rem !important;
    padding: 1px 4px !important;
  }

  .tli-desc {
    display: none !important; /* Hide verbose description in timeline on phone */
  }

  .tli-bottom-row {
    font-size: 0.68rem !important;
  }

  /* ==================== EXPENSES ON MOBILE ==================== */
  .expense-overview-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .exp-card {
    padding: 8px 10px;
    border-radius: 10px;
  }

  .exp-lbl {
    font-size: 0.68rem;
  }

  .exp-val {
    font-size: 1.05rem;
  }

  .exp-form-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .btn-add-exp {
    width: 100%;
    padding: 8px;
    font-size: 0.82rem;
  }

  /* ==================== SOS ON MOBILE ==================== */
  .hotline-buttons {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 5px;
  }

  .hotline-btn {
    padding: 6px 3px;
  }

  .hl-num {
    font-size: 1.05rem;
  }

  .hl-desc {
    font-size: 0.62rem;
  }

  .nearby-grid {
    grid-template-columns: 1fr 1fr;
    gap: 5px;
  }

  .nearby-btn {
    padding: 7px 5px;
    font-size: 0.72rem;
  }

  /* ==================== BOTTOM STICKY BAR ==================== */
  .lc-mobile-bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(226, 232, 240, 0.9);
    display: flex;
    align-items: center;
    padding: 6px 10px max(6px, env(safe-area-inset-bottom));
    gap: 6px;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
    z-index: 100;
  }

  [data-theme='dark'] .lc-mobile-bottom-bar {
    background: rgba(15, 23, 42, 0.97);
    border-color: rgba(30, 41, 59, 0.9);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.45);
  }

  .mob-bottom-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 40px;
    border-radius: 9px;
    font-weight: 700;
    font-size: 0.82rem;
    text-decoration: none;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
  }

  .mob-bottom-btn.btn-gmaps {
    background: #0284c7;
    color: #ffffff;
    flex: 0.9;
    min-width: 0;
  }

  .mob-bottom-btn.btn-arrive {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    flex: 1.4;
    min-width: 0;
    box-shadow: 0 3px 10px rgba(2, 132, 199, 0.35);
  }

  .mob-bottom-btn.btn-checkin {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    flex: 1.4;
    min-width: 0;
    box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
  }

  .btn-checkin-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mob-bottom-btn.btn-checkin.is-done {
    background: #64748b;
    box-shadow: none;
  }

  .mob-bottom-btn.btn-next-loc {
    background: #f1f5f9;
    color: #0284c7;
    flex: 1.1;
    min-width: 0;
    border: 1px solid #cbd5e1;
    font-weight: 800;
  }

  [data-theme='dark'] .mob-bottom-btn.btn-next-loc {
    background: #1e293b;
    border-color: #334155;
    color: #38bdf8;
  }
}

/* ==================== FALLBACK: CLASS-BASED MOBILE VIEW ==================== */
.live-companion-overlay.is-mobile-view .lc-container {
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  height: 100dvh !important;
  border-radius: 0 !important;
  margin: 0 !important;
  overflow-x: hidden !important;
}

.live-companion-overlay.is-mobile-view .badge-short-text,
.live-companion-overlay.is-mobile-view .cost-short-text,
.live-companion-overlay.is-mobile-view .dur-short-text,
.live-companion-overlay.is-mobile-view .next-lbl-short {
  display: inline !important;
}

.live-companion-overlay.is-mobile-view .badge-full-text,
.live-companion-overlay.is-mobile-view .cost-full-text,
.live-companion-overlay.is-mobile-view .dur-full-text,
.live-companion-overlay.is-mobile-view .next-lbl-full {
  display: none !important;
}

.live-companion-overlay.is-mobile-view .lc-body-content {
  padding: 8px 10px 72px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  touch-action: pan-y !important;
  overscroll-behavior-x: none !important;
  width: 100% !important;
  max-width: 100% !important;
}

.live-companion-overlay.is-mobile-view .lc-main-cockpit-grid {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
}

.live-companion-overlay.is-mobile-view .lc-left-cockpit,
.live-companion-overlay.is-mobile-view .lc-right-sidebar {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow: hidden !important;
}

.live-companion-overlay.is-mobile-view .lc-now-card {
  border-radius: 12px !important;
  margin-bottom: 8px !important;
  width: 100% !important;
  max-width: 100% !important;
}

.live-companion-overlay.is-mobile-view .now-hero-media {
  height: 115px !important;
}

.live-companion-overlay.is-mobile-view .now-place-name {
  font-size: 0.95rem !important;
}

.live-companion-overlay.is-mobile-view .now-details-body {
  padding: 7px 9px !important;
}

.live-companion-overlay.is-mobile-view .now-action-buttons-bar {
  display: none !important;
}

.live-companion-overlay.is-mobile-view .lc-next-card {
  padding: 6px 8px !important;
  margin-bottom: 8px !important;
  border-radius: 10px !important;
  width: 100% !important;
  max-width: 100% !important;
}

.live-companion-overlay.is-mobile-view .next-thumb-img {
  width: 36px !important;
  height: 36px !important;
}

.live-companion-overlay.is-mobile-view .sidebar-section-card {
  padding: 8px 10px !important;
  border-radius: 12px !important;
  margin-bottom: 8px !important;
  width: 100% !important;
  max-width: 100% !important;
}

.live-companion-overlay.is-mobile-view .tli-desc {
  display: none !important;
}

/* ==================== SPECIAL FIX FOR NARROW PHONES (<= 360px) ==================== */
@media (max-width: 360px) {
  .lc-trip-title {
    font-size: 0.82rem;
  }

  .lc-live-pill {
    padding: 1px 4px;
    font-size: 0.58rem;
  }

  .now-hero-media {
    height: 100px !important;
  }

  .now-place-name {
    font-size: 0.88rem !important;
  }

  .mob-bottom-btn {
    font-size: 0.75rem;
    padding: 0 4px;
    height: 38px;
  }

  .hotline-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
