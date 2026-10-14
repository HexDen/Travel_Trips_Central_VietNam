<template>
  <div class="profile-page-wrapper" v-if="nguoiDung">
    <!-- ========================================== -->
    <!-- HERO COVER & USER IDENTITY CARD -->
    <!-- ========================================== -->
    <div class="profile-hero-card">
      <!-- Panoramic Cover Image -->
      <div
        class="cover-photo"
        :style="{ backgroundImage: `url(${activeCoverPhoto})` }"
      >
        <div class="cover-photo-overlay"></div>
        <div class="cover-tagline">
          <span>🌿 Khám phá dải đất Miền Trung hùng vĩ & mộng mơ</span>
        </div>

        <!-- Cover Photo Picker Trigger -->
        <div class="cover-picker-dropdown">
          <button
            type="button"
            class="btn-change-cover"
            @click="showCoverPicker = !showCoverPicker"
            title="Đổi ảnh bìa phong cảnh"
          >
            <AppIcon name="camera" :size="14" />
            <span>Đổi ảnh bìa</span>
          </button>

          <!-- Dropdown Presets -->
          <div v-if="showCoverPicker" class="cover-presets-menu" @click.stop>
            <div class="cpm-header">
              <span>Chọn danh thắng Miền Trung:</span>
              <button class="cpm-close" @click="showCoverPicker = false">✕</button>
            </div>
            <div class="cpm-grid">
              <div
                v-for="preset in coverPresets"
                :key="preset.id"
                :class="['cpm-thumb', { active: activeCoverPhoto === preset.url }]"
                :style="{ backgroundImage: `url(${preset.url})` }"
                @click="selectCover(preset.url)"
                :title="preset.name"
              >
                <span class="cpm-name">{{ preset.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Identity Bar -->
      <div class="profile-identity-strip">
        <!-- Avatar Column -->
        <div class="identity-avatar-col">
          <div class="avatar-ring-wrap">
            <img
              v-if="nguoiDung.avatar"
              :src="nguoiDung.avatar"
              :alt="nguoiDung.name"
              class="avatar-photo"
            />
            <div v-else class="avatar-fallback-initial">
              {{ nguoiDung.name ? nguoiDung.name.trim()[0].toUpperCase() : 'U' }}
            </div>

            <!-- Online Indicator -->
            <span class="avatar-online-dot" title="Đang hoạt động"></span>

            <!-- Quick Upload Camera Button -->
            <label class="avatar-quick-upload-btn" title="Đổi ảnh đại diện">
              <input
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="$emit('handleAvatarUpload', $event)"
              />
              <AppIcon name="camera" :size="15" />
            </label>
          </div>

          <!-- Level Pill Under Avatar -->
          <div
            class="profile-level-badge"
            :style="{
              background: `linear-gradient(135deg, ${userLevelInfo?.color || '#10b981'} 0%, #047857 100%)`
            }"
            :title="`Cấp độ: ${userLevelInfo?.title || 'Thành viên'}`"
          >
            <span class="plb-icon">
              <AppIcon :name="userLevelInfo?.icon || 'crown'" :size="13" color="#ffffff" />
            </span>
            <span class="plb-text">{{ userLevelInfo?.title || 'Tân Thủ Khám Phá' }}</span>
          </div>
        </div>

        <!-- Details Column -->
        <div class="identity-info-col">
          <div class="user-name-row">
            <h1 class="user-fullname">{{ nguoiDung.name }}</h1>
            <span class="verified-tick" title="Tài khoản đã xác thực">✓</span>
            <span v-if="nguoiDung.role === 'admin'" class="admin-badge-chip">ADMIN</span>
          </div>

          <p class="user-headline">
            {{ nguoiDung.bio || 'Chào bạn! Mình là lữ khách yêu thiên nhiên, đam mê khám phá vẻ đẹp văn hóa & ẩm thực Miền Trung 🎒🌊' }}
          </p>

          <div class="user-meta-tags">
            <div class="meta-tag-item">
              <AppIcon name="mail" :size="14" class="meta-icon" />
              <span>{{ nguoiDung.email }}</span>
            </div>
            <div class="meta-tag-item">
              <AppIcon name="map-pin" :size="14" class="meta-icon" />
              <span>Miền Trung • Việt Nam</span>
            </div>
            <div class="meta-tag-item">
              <AppIcon name="calendar" :size="14" class="meta-icon" />
              <span>Gia nhập: {{ formatDate(nguoiDung.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Top Actions Column -->
        <div class="identity-actions-col">
          <button
            type="button"
            class="btn-profile-primary"
            @click="$emit('editProfile')"
          >
            <AppIcon name="edit" :size="15" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>

          <button
            type="button"
            class="btn-profile-plan"
            @click="$emit('goToTab', 'planner')"
          >
            <AppIcon name="navigation" :size="15" />
            <span>Lên lịch mới</span>
          </button>

          <button
            type="button"
            class="btn-profile-logout"
            @click="$emit('dangXuat')"
            title="Đăng xuất khỏi tài khoản"
          >
            <AppIcon name="login" :size="15" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- LEVEL PROGRESS & REPUTATION BANNER -->
    <!-- ========================================== -->
    <div class="level-progress-banner">
      <div class="lpb-left">
        <div class="lpb-badge-icon" :style="{ background: userLevelInfo?.color || '#10b981' }">
          <AppIcon :name="userLevelInfo?.icon || 'crown'" :size="24" color="#ffffff" />
        </div>
        <div class="lpb-text-block">
          <div class="lpb-title-row">
            <strong>Hạng Hội Viên: {{ userLevelInfo?.title || 'Tân Thủ Khám Phá' }}</strong>
            <span class="lpb-points-tag">💎 {{ formatNumber(nguoiDung.points || 120) }} Điểm Thưởng</span>
          </div>
          <p class="lpb-sub">
            Hoàn thành các chuyến đi thực tế để thăng cấp danh hiệu & nhận voucher ẩm thực địa phương độc quyền.
          </p>
        </div>
      </div>

      <div class="lpb-progress-wrap">
        <div class="lpb-progress-header">
          <span>Tiến trình lên hạng tiếp theo:</span>
          <b>{{ nguoiDung.completed_trips || 0 }} / {{ nextMilestoneTrips }} Chuyến đi</b>
        </div>
        <div class="lpb-bar-track">
          <div class="lpb-bar-fill" :style="{ width: `${levelProgressPercent}%` }"></div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 4 BENTO STAT METRICS CARDS -->
    <!-- ========================================== -->
    <div class="profile-stats-bento">
      <!-- Stat 1: Lịch trình đã lên -->
      <div class="bento-stat-card bsc-blue" @click="activeTab = 'trips'">
        <div class="bsc-icon-wrap">
          <AppIcon name="luggage" :size="22" />
        </div>
        <div class="bsc-content">
          <span class="bsc-num">{{ myTripsCount || 0 }}</span>
          <span class="bsc-lbl">Lịch trình đã lên</span>
          <small class="bsc-hint">Xem danh sách chuyến đi ❯</small>
        </div>
      </div>

      <!-- Stat 2: Chuyến đi hoàn thành -->
      <div class="bento-stat-card bsc-green">
        <div class="bsc-icon-wrap">
          <AppIcon name="award" :size="22" />
        </div>
        <div class="bsc-content">
          <span class="bsc-num">{{ nguoiDung.completed_trips || 0 }}</span>
          <span class="bsc-lbl">Chuyến đi hoàn thành</span>
          <small class="bsc-hint">Đã chinh phục miền Trung</small>
        </div>
      </div>

      <!-- Stat 3: Địa điểm yêu thích -->
      <div class="bento-stat-card bsc-rose" @click="$emit('goToTab', 'favorites')">
        <div class="bsc-icon-wrap">
          <AppIcon name="heart" :size="22" />
        </div>
        <div class="bsc-content">
          <span class="bsc-num">{{ favoritesCount || 0 }}</span>
          <span class="bsc-lbl">Địa điểm yêu thích</span>
          <small class="bsc-hint">Danh mục lưu riêng ❯</small>
        </div>
      </div>

      <!-- Stat 4: Điểm thưởng tích lũy -->
      <div class="bento-stat-card bsc-amber">
        <div class="bsc-icon-wrap">
          <AppIcon name="sparkles" :size="22" />
        </div>
        <div class="bsc-content">
          <span class="bsc-num">{{ formatNumber(nguoiDung.points || 120) }}</span>
          <span class="bsc-lbl">Điểm Travel Pass</span>
          <small class="bsc-hint">Đổi voucher ưu đãi</small>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PROFILE TABS NAVIGATION -->
    <!-- ========================================== -->
    <div class="profile-nav-tabs-bar">
      <button
        type="button"
        :class="['p-tab-btn', { active: activeTab === 'overview' }]"
        @click="activeTab = 'overview'"
      >
        <AppIcon name="user" :size="16" />
        <span>Tổng quan cá nhân</span>
      </button>

      <button
        type="button"
        :class="['p-tab-btn', { active: activeTab === 'trips' }]"
        @click="activeTab = 'trips'"
      >
        <AppIcon name="luggage" :size="16" />
        <span>Chuyến đi của tôi ({{ myTrips?.length || myTripsCount || 0 }})</span>
      </button>

      <button
        type="button"
        :class="['p-tab-btn', { active: activeTab === 'footprint' }]"
        @click="activeTab = 'footprint'"
      >
        <AppIcon name="navigation" :size="16" />
        <span>Dấu chân Miền Trung ({{ visitedProvincesCount }}/7)</span>
      </button>

      <button
        type="button"
        :class="['p-tab-btn', { active: activeTab === 'badges' }]"
        @click="activeTab = 'badges'"
      >
        <AppIcon name="award" :size="16" />
        <span>Huy hiệu thành tích</span>
      </button>
    </div>

    <!-- ========================================== -->
    <!-- TAB CONTENT SECTIONS -->
    <!-- ========================================== -->
    <div class="profile-tabs-content">
      <!-- ---------------------------------------- -->
      <!-- TAB 1: TỔNG QUAN (OVERVIEW) -->
      <!-- ---------------------------------------- -->
      <div v-if="activeTab === 'overview'" class="tab-pane-fade">
        <div class="overview-grid-layout">
          <!-- Left: Bio & Travel Vibes -->
          <div class="overview-left-card">
            <div class="section-title-wrap">
              <AppIcon name="user" :size="18" color="#0284c7" />
              <h3>Lời tự bạch & Phong cách du lịch</h3>
            </div>

            <div class="bio-quote-box">
              <div class="quote-mark">“</div>
              <p class="bio-quote-text">
                {{ nguoiDung.bio || 'Chào bạn! Mình là người đam mê du lịch và luôn hào hứng với từng chuyến đi khám phá cảnh đẹp, nét ẩm thực phong phú cùng con người đôn hậu của dải đất Miền Trung.' }}
              </p>
            </div>

            <!-- Travel Style Tags -->
            <div class="travel-styles-block">
              <h4>🎯 Phong cách du lịch yêu thích:</h4>
              <div class="travel-tags-cloud">
                <span class="style-tag">🌊 Nghỉ dưỡng biển</span>
                <span class="style-tag">🏛️ Di sản văn hóa</span>
                <span class="style-tag">🍜 Thiên đường ẩm thực</span>
                <span class="style-tag">📸 Check-in sống ảo</span>
                <span class="style-tag">🛵 Phượt ngắm đèo</span>
                <span class="style-tag">☕ Cà phê view đẹp</span>
              </div>
            </div>

            <!-- Member Perks Summary -->
            <div class="member-perks-summary">
              <h4>👑 Quyền lợi hạng hội viên hiện tại:</h4>
              <ul class="perks-list">
                <li>✨ Tạo không giới hạn lịch trình du lịch thông minh bằng AI.</li>
                <li>📍 Dẫn đường turn-by-turn đồng bộ Google Maps & GPS thời gian thực.</li>
                <li>🔔 Thông báo chuông báo giờ di chuyển tự động thông minh.</li>
                <li>💾 Sao lưu toàn bộ lịch trình đa nền tảng không lo mất dữ liệu.</li>
              </ul>
            </div>
          </div>

          <!-- Right: Spotlight Recent Trip & Footprint Preview -->
          <div class="overview-right-col">
            <!-- Recent Trip Spotlight Card -->
            <div class="spotlight-trip-card">
              <div class="stc-header">
                <span class="stc-badge">⭐ CHUYẾN ĐI GẦN NHẤT</span>
                <button
                  type="button"
                  class="stc-see-all"
                  @click="activeTab = 'trips'"
                >
                  Xem tất cả ❯
                </button>
              </div>

              <div v-if="latestTrip" class="stc-body">
                <div class="stc-dest-row">
                  <h4>{{ latestTrip.destination }} — {{ (latestTrip.daysList || latestTrip.days || []).length }} Ngày</h4>
                  <span class="stc-budget-pill">
                    ~{{ formatCurrency(latestTrip.total_budget) }}đ
                  </span>
                </div>
                <p class="stc-desc">
                  Lịch trình được tối ưu cung đường khám phá ẩm thực, danh thắng và tiện ích lưu trú dành cho {{ latestTrip.people || 2 }} người.
                </p>
                <div class="stc-actions">
                  <button
                    type="button"
                    class="btn-stc-start"
                    @click="$emit('startTrip', latestTrip)"
                  >
                    🚀 Bắt đầu live hành trình
                  </button>
                  <button
                    type="button"
                    class="btn-stc-open"
                    @click="$emit('openTrip', latestTrip)"
                  >
                    Xem chi tiết ↗
                  </button>
                </div>
              </div>

              <div v-else class="stc-empty">
                <span class="empty-emoji">🎒</span>
                <h4>Bạn chưa có lịch trình nào</h4>
                <p>Hãy bắt đầu tạo chuyến đi đầu tiên để cùng Antigravity khám phá nhé!</p>
                <button
                  type="button"
                  class="btn-stc-create"
                  @click="$emit('goToTab', 'planner')"
                >
                  + Lên lịch trình ngay
                </button>
              </div>
            </div>

            <!-- Footprint Mini Card -->
            <div class="footprint-mini-card">
              <div class="fmc-header">
                <h4>🗺️ Bản đồ Dấu chân</h4>
                <span class="fmc-pct">{{ visitedProvincesCount }}/7 tỉnh</span>
              </div>
              <p class="fmc-desc">
                Bạn đã lên kế hoạch chinh phục {{ visitedProvincesCount }} trong 7 tỉnh thành trọng điểm của Miền Trung.
              </p>
              <div class="fmc-provinces-chips">
                <span
                  v-for="prov in iconicProvinces"
                  :key="prov.name"
                  :class="['prov-chip', { visited: isProvinceVisited(prov.name) }]"
                >
                  {{ isProvinceVisited(prov.name) ? '✓ ' : '○ ' }}{{ prov.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ---------------------------------------- -->
      <!-- TAB 2: CHUYẾN ĐI CỦA TÔI (MY TRIPS) -->
      <!-- ---------------------------------------- -->
      <div v-else-if="activeTab === 'trips'" class="tab-pane-fade">
        <div class="trips-tab-toolbar">
          <div>
            <h3>Danh sách lịch trình đã lưu ({{ myTrips?.length || 0 }} chuyến)</h3>
            <p>Tất cả chuyến đi được đồng bộ an toàn trên đám mây & bộ nhớ máy</p>
          </div>
          <button
            type="button"
            class="btn-create-trip-tab"
            @click="$emit('goToTab', 'planner')"
          >
            + Lên lịch trình mới
          </button>
        </div>

        <div v-if="myTrips && myTrips.length > 0" class="profile-trips-grid">
          <div
            v-for="trip in myTrips"
            :key="trip._id"
            class="profile-trip-card"
          >
            <div class="ptc-top">
              <span class="ptc-dest-badge">{{ trip.destination }}</span>
              <span class="ptc-days-pill">{{ (trip.daysList || trip.days || []).length }} Ngày</span>
            </div>

            <h4 class="ptc-title">Chuyến đi {{ (trip.daysList || trip.days || []).length }} ngày tại {{ trip.destination }}</h4>
            <p class="ptc-budget">
              💰 Dự toán: <b>{{ formatCurrency(trip.total_budget) }}đ</b> · {{ trip.people || 2 }} người
            </p>
            <p class="ptc-date">
              📅 Ngày tạo: {{ formatDate(trip.created_at) }}
            </p>

            <div class="ptc-actions">
              <button
                type="button"
                class="btn-ptc-start"
                @click="$emit('startTrip', trip)"
              >
                🚀 Bắt đầu live
              </button>
              <button
                type="button"
                class="btn-ptc-view"
                @click="$emit('openTrip', trip)"
              >
                Chi tiết ↗
              </button>
            </div>
          </div>
        </div>

        <div v-else class="trips-empty-box">
          <span class="teb-icon">🎒</span>
          <h3>Chưa có chuyến đi nào được lưu</h3>
          <p>Tạo chuyến đi tự động với AI chỉ mất 5 giây với gợi ý điểm đến, quán ăn và khách sạn.</p>
          <button
            type="button"
            class="btn-create-trip-tab"
            @click="$emit('goToTab', 'planner')"
          >
            Lên lịch trình ngay
          </button>
        </div>
      </div>

      <!-- ---------------------------------------- -->
      <!-- TAB 3: DẤU CHÂN MIỀN TRUNG (FOOTPRINT) -->
      <!-- ---------------------------------------- -->
      <div v-else-if="activeTab === 'footprint'" class="tab-pane-fade">
        <div class="footprint-full-section">
          <div class="ffs-header">
            <div>
              <h3>Bản đồ Dấu Chân 7 Điểm Đến Miền Trung</h3>
              <p>Khám phá trọn vẹn cảnh sắc di sản và vịnh biển đẹp nhất Việt Nam</p>
            </div>
            <div class="ffs-completion-badge">
              <span>Đã check-in:</span>
              <strong>{{ Math.round((visitedProvincesCount / 7) * 100) }}%</strong>
            </div>
          </div>

          <div class="provinces-full-grid">
            <div
              v-for="prov in iconicProvinces"
              :key="prov.name"
              :class="['province-status-card', { visited: isProvinceVisited(prov.name) }]"
            >
              <div
                class="psc-thumb"
                :style="{ backgroundImage: `url(${prov.img})` }"
              >
                <span class="psc-visited-tag" v-if="isProvinceVisited(prov.name)">
                  ✓ Đã lên lịch
                </span>
                <span class="psc-unvisited-tag" v-else>
                  ○ Chưa đến
                </span>
              </div>
              <div class="psc-info">
                <h4>{{ prov.name }}</h4>
                <p class="psc-highlight">{{ prov.highlight }}</p>
                <div class="psc-footer">
                  <span class="psc-best">{{ prov.tag }}</span>
                  <button
                    v-if="!isProvinceVisited(prov.name)"
                    type="button"
                    class="btn-psc-plan"
                    @click="$emit('goToTab', 'planner')"
                  >
                    Lên lịch ↗
                  </button>
                  <span v-else class="psc-done-text">✨ Đã có trong danh sách</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ---------------------------------------- -->
      <!-- TAB 4: HUY HIỆU & THÀNH TÍCH (BADGES) -->
      <!-- ---------------------------------------- -->
      <div v-else-if="activeTab === 'badges'" class="tab-pane-fade">
        <div class="badges-full-section">
          <div class="bfs-header">
            <h3>Bộ Sưu Tập Huy Hiệu Khám Phá</h3>
            <p>Mở khóa các cột mốc kỳ tích trong hành trình du lịch của bạn</p>
          </div>

          <div class="badges-grid">
            <div
              v-for="badge in userBadgesList"
              :key="badge.id"
              :class="['badge-item-card', { unlocked: badge.isUnlocked }]"
            >
              <div class="bic-icon">{{ badge.icon }}</div>
              <div class="bic-content">
                <h4>{{ badge.name }}</h4>
                <p>{{ badge.desc }}</p>
                <span class="bic-status">
                  {{ badge.isUnlocked ? '✓ Đã mở khóa' : '🔒 Chưa mở khóa' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- EDIT PROFILE MODAL (PREMIUM DIALOG) -->
    <!-- ========================================== -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="isEditingProfile"
          class="edit-profile-modal-overlay"
          @click.self="$emit('cancelEdit')"
        >
          <div class="edit-profile-card">
            <div class="epc-header">
              <div class="epc-title-cluster">
                <h2>Chỉnh sửa hồ sơ cá nhân</h2>
                <p>Cập nhật thông tin đại diện và phong cách của bạn</p>
              </div>
              <button
                type="button"
                class="epc-close-btn"
                @click="$emit('cancelEdit')"
                title="Đóng hộp thoại"
              >
                ✕
              </button>
            </div>

            <div class="epc-body">
              <!-- Avatar Upload Block -->
              <div class="form-group avatar-form-group">
                <label>Ảnh đại diện</label>
                <div class="avatar-edit-cluster">
                  <div class="avatar-preview-box">
                    <img
                      v-if="profileForm.avatar"
                      :src="profileForm.avatar"
                      alt="Avatar Preview"
                      class="apb-img"
                    />
                    <div v-else class="apb-initial">
                      {{ profileForm.name ? profileForm.name.trim()[0]?.toUpperCase() : 'U' }}
                    </div>
                  </div>
                  <div class="avatar-upload-actions">
                    <label class="btn-choose-file">
                      <AppIcon name="camera" :size="15" />
                      <span>Chọn ảnh mới từ máy...</span>
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden-file-input"
                        @change="$emit('handleAvatarUpload', $event)"
                      />
                    </label>
                    <small>Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa 2MB)</small>
                  </div>
                </div>
              </div>

              <!-- Display Name -->
              <div class="form-group">
                <label>Tên hiển thị <span class="required">*</span></label>
                <input
                  type="text"
                  :value="profileForm.name"
                  @input="$emit('updateForm', 'name', $event.target.value)"
                  class="epc-input"
                  placeholder="Nhập họ tên hoặc biệt danh của bạn..."
                />
              </div>

              <!-- Travel Bio -->
              <div class="form-group">
                <div class="label-with-count">
                  <label>Lời tự bạch & Phong cách</label>
                  <span class="char-count">{{ profileForm.bio ? profileForm.bio.length : 0 }}/200</span>
                </div>
                <textarea
                  :value="profileForm.bio"
                  @input="$emit('updateForm', 'bio', $event.target.value)"
                  class="epc-textarea"
                  rows="3"
                  maxlength="200"
                  placeholder="Chia sẻ sở thích du lịch, địa điểm yêu thích hoặc câu nói tâm đắc của bạn..."
                ></textarea>
              </div>

              <!-- Favorite Cover Preset in modal -->
              <div class="form-group">
                <label>Chọn ảnh bìa đại diện</label>
                <div class="cover-selection-grid">
                  <div
                    v-for="preset in coverPresets"
                    :key="preset.id"
                    :class="['csg-item', { selected: activeCoverPhoto === preset.url }]"
                    :style="{ backgroundImage: `url(${preset.url})` }"
                    @click="selectCover(preset.url)"
                  >
                    <span>{{ preset.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="epc-footer">
              <button
                type="button"
                class="btn-epc-cancel"
                @click="$emit('cancelEdit')"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                class="btn-epc-save"
                @click="$emit('saveProfile')"
              >
                <AppIcon name="check" :size="16" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppIcon from './common/AppIcon.vue'

const props = defineProps({
  nguoiDung: { type: Object, default: null },
  userLevelInfo: { type: Object, default: null },
  myTrips: { type: Array, default: () => [] },
  myTripsCount: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 },
  favoritesList: { type: Array, default: () => [] },
  isEditingProfile: { type: Boolean, default: false },
  profileForm: { type: Object, default: () => ({}) },
  isDark: { type: Boolean, default: false }
})

defineEmits([
  'editProfile',
  'dangXuat',
  'saveProfile',
  'cancelEdit',
  'handleAvatarUpload',
  'updateForm',
  'goToTab',
  'openTrip',
  'startTrip',
  'toggleDark'
])

// Local Active Tab: 'overview' | 'trips' | 'footprint' | 'badges'
const activeTab = ref('overview')
const showCoverPicker = ref(false)

// Scenic Covers Presets of Central Vietnam
const coverPresets = [
  { id: 'danang', name: 'Đà Nẵng • Cầu Vàng', url: '/images/slides/danang-cauvang.jpg' },
  { id: 'hoian', name: 'Hội An • Đèn Lồng', url: '/images/slides/hoian-phoco.jpg' },
  { id: 'hue', name: 'Cố Đô Huế • Hoàng Cung', url: '/images/slides/hue-codohue.jpg' },
  { id: 'quynhon', name: 'Quy Nhơn • Kỳ Co', url: '/images/slides/quynhon-kyco.jpg' },
  { id: 'mientrung', name: 'Miền Trung • Non Nước', url: '/images/slides/mientrung-nonnuoc.jpg' }
]

const activeCoverPhoto = ref('/images/slides/danang-cauvang.jpg')

onMounted(() => {
  const savedCover = localStorage.getItem('user_profile_cover')
  if (savedCover) {
    activeCoverPhoto.value = savedCover
  }
})

function selectCover(url) {
  activeCoverPhoto.value = url
  localStorage.setItem('user_profile_cover', url)
  showCoverPicker.value = false
}

// 7 Iconic Provinces of Central Vietnam
const iconicProvinces = [
  { name: 'Đà Nẵng', highlight: 'Cầu Rồng, Bà Nà Hills, Sơn Trà', tag: 'Thành phố đáng sống', img: '/images/slides/danang-cauvang.jpg' },
  { name: 'Thừa Thiên Huế', highlight: 'Đại Nội, Sông Hương, Lăng Khải Định', tag: 'Cố đô di sản', img: '/images/slides/hue-codohue.jpg' },
  { name: 'Quảng Nam', highlight: 'Phố cổ Hội An, Thánh địa Mỹ Sơn', tag: 'Phố cổ đèn lồng', img: '/images/slides/hoian-phoco.jpg' },
  { name: 'Quảng Bình', highlight: 'Động Phong Nha, Hang Sơn Đoòng', tag: 'Vương quốc hang động', img: '/images/slides/mientrung-nonnuoc.jpg' },
  { name: 'Bình Định', highlight: 'Eo Gió, Kỳ Co, Tháp Chăm Quy Nhơn', tag: 'Biển xanh xứ Nẫu', img: '/images/slides/quynhon-kyco.jpg' },
  { name: 'Khánh Hòa', highlight: 'Vịnh Nha Trang, Tháp Bà Ponagar', tag: 'Xứ Trầm biển yến', img: '/images/slides/danang-cauvang.jpg' },
  { name: 'Lâm Đồng', highlight: 'Đà Lạt mộng mơ, Hồ Tuyền Lâm', tag: 'Thành phố sương mù', img: '/images/slides/danang-cauvang.jpg' }
]

// Check if province has a trip
function isProvinceVisited(provinceName) {
  const trips = props.myTrips || []
  return trips.some(t => {
    const dest = (t.destination || '').toLowerCase()
    const pName = provinceName.toLowerCase()
    return dest.includes(pName) || pName.includes(dest)
  })
}

const visitedProvincesCount = computed(() => {
  return iconicProvinces.filter(p => isProvinceVisited(p.name)).length
})

// Latest Trip
const latestTrip = computed(() => {
  const trips = props.myTrips || []
  return trips.length > 0 ? trips[0] : null
})

// Next milestone logic
const nextMilestoneTrips = computed(() => {
  const c = props.nguoiDung?.completed_trips || 0
  if (c < 2) return 2
  if (c < 5) return 5
  if (c < 10) return 10
  return 20
})

const levelProgressPercent = computed(() => {
  const c = props.nguoiDung?.completed_trips || 0
  const max = nextMilestoneTrips.value
  return Math.min(100, Math.round((c / max) * 100))
})

// Badges system
const userBadgesList = computed(() => {
  const tripsCount = props.myTrips?.length || props.myTripsCount || 0
  const favsCount = props.favoritesCount || 0
  const completed = props.nguoiDung?.completed_trips || 0
  const hasHueOrHoiAn = (props.myTrips || []).some(t => {
    const d = (t.destination || '').toLowerCase()
    return d.includes('huế') || d.includes('hội an') || d.includes('quảng nam')
  })

  return [
    {
      id: 'welcome',
      icon: '🌟',
      name: 'Tân Binh Lên Đường',
      desc: 'Hoàn tất đăng ký & tham gia cộng đồng du lịch Miền Trung.',
      isUnlocked: true
    },
    {
      id: 'first_plan',
      icon: '🗺️',
      name: 'Kiến Trúc Sư Hành Trình',
      desc: 'Đã lên kế hoạch cho lịch trình đầu tiên của bạn.',
      isUnlocked: tripsCount >= 1
    },
    {
      id: 'travel_lover',
      icon: '🚀',
      name: 'Chiến Thần Vi Vu',
      desc: 'Đã tạo từ 2 lịch trình du lịch trở lên.',
      isUnlocked: tripsCount >= 2
    },
    {
      id: 'heritage_fan',
      icon: '🏛️',
      name: 'Người Yêu Di Sản',
      desc: 'Đã lên kế hoạch viếng thăm Cố đô Huế hoặc Phố cổ Hội An.',
      isUnlocked: hasHueOrHoiAn
    },
    {
      id: 'favorite_collector',
      icon: '❤️',
      name: 'Nhà Sưu Tầm Điểm Đến',
      desc: 'Đã lưu từ 3 địa điểm yêu thích vào bộ sưu tập riêng.',
      isUnlocked: favsCount >= 3
    },
    {
      id: 'master_voyager',
      icon: '👑',
      name: 'Thám Hiểm Gia Miền Trung',
      desc: 'Đã hoàn thành các chuyến đi thực tế trên cung đường di sản.',
      isUnlocked: completed >= 1
    }
  ]
})

// Helpers
function formatCurrency(val) {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(val)
}

function formatNumber(val) {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(val)
}

function formatDate(date) {
  if (!date) return 'Thành viên mới'
  try {
    const d = new Date(date)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
  } catch {
    return 'Gần đây'
  }
}
</script>

<style scoped>
/* ========================================================================= */
/* PROFILE CONTAINER & SHELL */
/* ========================================================================= */
.profile-page-wrapper {
  max-width: 1160px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 4rem;
  font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  color: #0f172a;
  animation: profileFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes profileFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========================================================================= */
/* 1. HERO COVER & PROFILE CARD */
/* ========================================================================= */
.profile-hero-card {
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.75rem;
  position: relative;
}

[data-theme='dark'] .profile-hero-card {
  background: #111e38;
  border-color: #1e2e4f;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.cover-photo {
  height: 250px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  transition: background-image 0.4s ease;
}

.cover-photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.75) 100%);
}

.cover-tagline {
  position: absolute;
  top: 18px;
  left: 24px;
  z-index: 2;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Cover Preset Picker */
.cover-picker-dropdown {
  position: absolute;
  top: 18px;
  right: 24px;
  z-index: 5;
}

.btn-change-cover {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-change-cover:hover {
  background: rgba(15, 23, 42, 0.85);
  border-color: #ffffff;
  transform: translateY(-1px);
}

.cover-presets-menu {
  position: absolute;
  top: 38px;
  right: 0;
  width: 280px;
  background: #ffffff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid #cbd5e1;
  z-index: 20;
}

[data-theme='dark'] .cover-presets-menu {
  background: #1e293b;
  border-color: #334155;
}

.cpm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.76rem;
  font-weight: 800;
  color: #475569;
}

[data-theme='dark'] .cpm-header {
  color: #94a3b8;
}

.cpm-close {
  background: none;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  color: #64748b;
}

.cpm-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cpm-thumb {
  height: 44px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.cpm-thumb.active {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4);
}

.cpm-thumb:hover {
  transform: scale(1.02);
}

.cpm-name {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-size: 0.74rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  padding-left: 10px;
}

/* Identity Strip */
.profile-identity-strip {
  display: flex;
  align-items: flex-start;
  padding: 0 2rem 1.75rem;
  position: relative;
  gap: 1.75rem;
}

/* Avatar Column */
.identity-avatar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -65px;
  flex-shrink: 0;
  z-index: 3;
}

.avatar-ring-wrap {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #0284c7 0%, #10b981 100%);
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
}

.avatar-photo,
.avatar-fallback-initial {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #ffffff;
  border: 3px solid #ffffff;
  display: block;
}

[data-theme='dark'] .avatar-photo,
[data-theme='dark'] .avatar-fallback-initial {
  background: #1e293b;
  border-color: #111e38;
}

.avatar-fallback-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 900;
  color: #0284c7;
}

.avatar-online-dot {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  border: 3px solid #ffffff;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

[data-theme='dark'] .avatar-online-dot {
  border-color: #111e38;
}

.avatar-quick-upload-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

[data-theme='dark'] .avatar-quick-upload-btn {
  background: #1e293b;
  color: #f8fafc;
  border-color: #334155;
}

.avatar-quick-upload-btn:hover {
  transform: scale(1.1);
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

.hidden-file-input {
  display: none;
}

.profile-level-badge {
  margin-top: 10px;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #ffffff;
  font-size: 0.74rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Info Column */
.identity-info-col {
  flex: 1;
  min-width: 0;
  padding-top: 14px;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.user-fullname {
  font-size: 1.65rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
  color: #0f172a;
}

[data-theme='dark'] .user-fullname {
  color: #f8fafc;
}

.verified-tick {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0284c7;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 900;
}

.admin-badge-chip {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: #ffffff;
}

.user-headline {
  margin: 0 0 12px;
  font-size: 0.88rem;
  line-height: 1.45;
  color: #475569;
  max-width: 600px;
}

[data-theme='dark'] .user-headline {
  color: #94a3b8;
}

.user-meta-tags {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-tag-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
}

[data-theme='dark'] .meta-tag-item {
  color: #94a3b8;
}

.meta-icon {
  color: #0284c7;
}

/* Actions Column */
.identity-actions-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 14px;
  flex-shrink: 0;
}

.btn-profile-primary,
.btn-profile-plan,
.btn-profile-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  white-space: nowrap;
}

.btn-profile-primary {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
}

.btn-profile-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.4);
}

.btn-profile-plan {
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

[data-theme='dark'] .btn-profile-plan {
  background: #1e293b;
  color: #f8fafc;
  border-color: #334155;
}

.btn-profile-plan:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.btn-profile-logout {
  background: transparent;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.btn-profile-logout:hover {
  background: #fef2f2;
}

[data-theme='dark'] .btn-profile-logout:hover {
  background: rgba(239, 68, 68, 0.15);
}

/* ========================================================================= */
/* 2. LEVEL PROGRESS & REPUTATION BANNER */
/* ========================================================================= */
.level-progress-banner {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #a7f3d0;
  border-radius: 18px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 1.75rem;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
}

[data-theme='dark'] .level-progress-banner {
  background: linear-gradient(135deg, #062b1a 0%, #0d3822 100%);
  border-color: #065f46;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.lpb-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.lpb-badge-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.lpb-text-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lpb-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lpb-title-row strong {
  font-size: 0.95rem;
  color: #065f46;
}

[data-theme='dark'] .lpb-title-row strong {
  color: #6ee7b7;
}

.lpb-points-tag {
  font-size: 0.74rem;
  font-weight: 800;
  background: #ffffff;
  color: #047857;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #a7f3d0;
}

[data-theme='dark'] .lpb-points-tag {
  background: #064e3b;
  color: #a7f3d0;
  border-color: #059669;
}

.lpb-sub {
  margin: 0;
  font-size: 0.8rem;
  color: #047857;
  line-height: 1.35;
}

[data-theme='dark'] .lpb-sub {
  color: #a7f3d0;
}

.lpb-progress-wrap {
  width: 320px;
  flex-shrink: 0;
}

.lpb-progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.74rem;
  font-weight: 700;
  color: #065f46;
  margin-bottom: 6px;
}

[data-theme='dark'] .lpb-progress-header {
  color: #a7f3d0;
}

.lpb-bar-track {
  height: 8px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.lpb-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ========================================================================= */
/* 3. 4 BENTO STAT METRICS CARDS */
/* ========================================================================= */
.profile-stats-bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 2rem;
}

.bento-stat-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

[data-theme='dark'] .bento-stat-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.bento-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
}

.bsc-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.bento-stat-card:hover .bsc-icon-wrap {
  transform: scale(1.1) rotate(4deg);
}

.bsc-blue .bsc-icon-wrap { background: #e0f2fe; color: #0284c7; }
.bsc-green .bsc-icon-wrap { background: #dcfce7; color: #10b981; }
.bsc-rose .bsc-icon-wrap { background: #ffe4e6; color: #f43f5e; }
.bsc-amber .bsc-icon-wrap { background: #fef3c7; color: #f59e0b; }

[data-theme='dark'] .bsc-blue .bsc-icon-wrap { background: rgba(2, 132, 199, 0.2); }
[data-theme='dark'] .bsc-green .bsc-icon-wrap { background: rgba(16, 185, 129, 0.2); }
[data-theme='dark'] .bsc-rose .bsc-icon-wrap { background: rgba(244, 63, 94, 0.2); }
[data-theme='dark'] .bsc-amber .bsc-icon-wrap { background: rgba(245, 158, 11, 0.2); }

.bsc-content {
  display: flex;
  flex-direction: column;
}

.bsc-num {
  font-size: 1.55rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

[data-theme='dark'] .bsc-num {
  color: #f8fafc;
}

.bsc-lbl {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 2px;
}

.bsc-hint {
  font-size: 0.68rem;
  font-weight: 600;
  color: #0284c7;
  margin-top: 2px;
}

/* ========================================================================= */
/* 4. TABS NAVIGATION BAR */
/* ========================================================================= */
.profile-nav-tabs-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 16px;
  margin-bottom: 1.75rem;
  border: 1px solid #e2e8f0;
}

[data-theme='dark'] .profile-nav-tabs-bar {
  background: #0b1528;
  border-color: #1e2e4f;
}

.p-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 800;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

[data-theme='dark'] .p-tab-btn {
  color: #94a3b8;
}

.p-tab-btn:hover {
  color: #0f172a;
}

[data-theme='dark'] .p-tab-btn:hover {
  color: #f8fafc;
}

.p-tab-btn.active {
  background: #ffffff;
  color: #0284c7;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

[data-theme='dark'] .p-tab-btn.active {
  background: #1e293b;
  color: #38bdf8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Tab Pane Fade */
.tab-pane-fade {
  animation: tabFadeIn 0.35s ease-out;
}

@keyframes tabFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========================================================================= */
/* TAB 1: OVERVIEW GRID */
/* ========================================================================= */
.overview-grid-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.overview-left-card,
.spotlight-trip-card,
.footprint-mini-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

[data-theme='dark'] .overview-left-card,
[data-theme='dark'] .spotlight-trip-card,
[data-theme='dark'] .footprint-mini-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.section-title-wrap h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

[data-theme='dark'] .section-title-wrap h3 {
  color: #f8fafc;
}

.bio-quote-box {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px 18px;
  border-left: 4px solid #0284c7;
  margin-bottom: 20px;
  position: relative;
}

[data-theme='dark'] .bio-quote-box {
  background: #1e293b;
}

.quote-mark {
  position: absolute;
  top: 4px;
  right: 12px;
  font-size: 2.2rem;
  font-family: serif;
  color: #cbd5e1;
  line-height: 1;
}

.bio-quote-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #334155;
  font-style: italic;
}

[data-theme='dark'] .bio-quote-text {
  color: #cbd5e1;
}

.travel-styles-block {
  margin-bottom: 22px;
}

.travel-styles-block h4,
.member-perks-summary h4 {
  font-size: 0.82rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 10px;
}

[data-theme='dark'] .travel-styles-block h4,
[data-theme='dark'] .member-perks-summary h4 {
  color: #94a3b8;
}

.travel-tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.style-tag {
  background: #eff6ff;
  color: #0284c7;
  border: 1px solid #bfdbfe;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 20px;
}

[data-theme='dark'] .style-tag {
  background: rgba(2, 132, 199, 0.15);
  border-color: rgba(2, 132, 199, 0.3);
  color: #38bdf8;
}

.member-perks-summary {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
}

[data-theme='dark'] .member-perks-summary {
  background: #18233c;
  border-color: #243456;
}

.perks-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.perks-list li {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
}

[data-theme='dark'] .perks-list li {
  color: #94a3b8;
}

/* Right Column */
.overview-right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stc-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  background: #eff6ff;
  color: #0284c7;
  letter-spacing: 0.05em;
}

[data-theme='dark'] .stc-badge {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
}

.stc-see-all {
  background: none;
  border: none;
  color: #0284c7;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.stc-dest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stc-dest-row h4 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 900;
  color: #0f172a;
}

[data-theme='dark'] .stc-dest-row h4 {
  color: #f8fafc;
}

.stc-budget-pill {
  font-size: 0.82rem;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 3px 8px;
  border-radius: 8px;
}

.stc-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 14px;
  line-height: 1.4;
}

[data-theme='dark'] .stc-desc {
  color: #94a3b8;
}

.stc-actions {
  display: flex;
  gap: 8px;
}

.btn-stc-start,
.btn-stc-open,
.btn-stc-create {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-stc-start {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: #ffffff;
  flex: 1.3;
}

.btn-stc-open {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  flex: 1;
}

[data-theme='dark'] .btn-stc-open {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}

.stc-empty {
  text-align: center;
  padding: 16px 8px;
}

.empty-emoji {
  font-size: 2rem;
  display: block;
  margin-bottom: 4px;
}

.stc-empty h4 {
  margin: 0 0 4px;
  font-size: 0.95rem;
}

.stc-empty p {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0 0 12px;
}

.btn-stc-create {
  background: #0284c7;
  color: #ffffff;
}

/* Footprint Mini Card */
.fmc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.fmc-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
}

.fmc-pct {
  font-size: 0.75rem;
  font-weight: 800;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
  padding: 2px 7px;
  border-radius: 6px;
}

.fmc-desc {
  font-size: 0.76rem;
  color: #64748b;
  margin: 0 0 10px;
}

.fmc-provinces-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.prov-chip {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

[data-theme='dark'] .prov-chip {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.prov-chip.visited {
  background: #dcfce7;
  color: #059669;
  border-color: #a7f3d0;
}

[data-theme='dark'] .prov-chip.visited {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

/* ========================================================================= */
/* TAB 2: MY TRIPS GRID */
/* ========================================================================= */
.trips-tab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.trips-tab-toolbar h3 {
  margin: 0 0 2px;
  font-size: 1.15rem;
  font-weight: 900;
}

.trips-tab-toolbar p {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.btn-create-trip-tab {
  background: #0284c7;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-create-trip-tab:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

.profile-trips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.profile-trip-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

[data-theme='dark'] .profile-trip-card {
  background: #111e38;
  border-color: #1e2e4f;
}

.profile-trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.ptc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ptc-dest-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  background: #eff6ff;
  color: #0284c7;
}

[data-theme='dark'] .ptc-dest-badge {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
}

.ptc-days-pill {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
}

[data-theme='dark'] .ptc-days-pill {
  background: #1e293b;
  color: #94a3b8;
}

.ptc-title {
  font-size: 1.02rem;
  font-weight: 800;
  margin: 0 0 6px;
  color: #0f172a;
}

[data-theme='dark'] .ptc-title {
  color: #f8fafc;
}

.ptc-budget {
  font-size: 0.8rem;
  color: #475569;
  margin: 0 0 4px;
}

[data-theme='dark'] .ptc-budget {
  color: #94a3b8;
}

.ptc-date {
  font-size: 0.74rem;
  color: #94a3b8;
  margin: 0 0 14px;
}

.ptc-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn-ptc-start,
.btn-ptc-view {
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-ptc-start {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: #ffffff;
  flex: 1.3;
}

.btn-ptc-view {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  flex: 1;
}

[data-theme='dark'] .btn-ptc-view {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}

.trips-empty-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 20px;
  text-align: center;
  border: 1px dashed #cbd5e1;
}

[data-theme='dark'] .trips-empty-box {
  background: #111e38;
  border-color: #334155;
}

.teb-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
}

.trips-empty-box h3 {
  margin: 0 0 6px;
  font-size: 1.1rem;
}

.trips-empty-box p {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0 auto 18px;
  max-width: 440px;
}

/* ========================================================================= */
/* TAB 3: FOOTPRINT PROVINCES GRID */
/* ========================================================================= */
.footprint-full-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

[data-theme='dark'] .footprint-full-section {
  background: #111e38;
  border-color: #1e2e4f;
}

.ffs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ffs-header h3 {
  margin: 0 0 2px;
  font-size: 1.15rem;
  font-weight: 900;
}

.ffs-header p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
}

.ffs-completion-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #0284c7;
}

[data-theme='dark'] .ffs-completion-badge {
  background: rgba(2, 132, 199, 0.15);
  border-color: rgba(2, 132, 199, 0.3);
  color: #38bdf8;
}

.provinces-full-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.province-status-card {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  background: #f8fafc;
  transition: all 0.2s ease;
}

[data-theme='dark'] .province-status-card {
  background: #1e293b;
  border-color: #334155;
}

.province-status-card.visited {
  border-color: #a7f3d0;
  background: #f0fdf4;
}

[data-theme='dark'] .province-status-card.visited {
  border-color: #065f46;
  background: #062b1a;
}

.psc-thumb {
  height: 120px;
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 10px;
}

.psc-visited-tag {
  background: #10b981;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.psc-unvisited-tag {
  background: rgba(15, 23, 42, 0.7);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.psc-info {
  padding: 14px;
}

.psc-info h4 {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 800;
}

.psc-highlight {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0 0 10px;
  line-height: 1.35;
}

[data-theme='dark'] .psc-highlight {
  color: #94a3b8;
}

.psc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.psc-best {
  font-size: 0.7rem;
  font-weight: 700;
  color: #0284c7;
}

.btn-psc-plan {
  padding: 4px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  border-radius: 8px;
  background: #0284c7;
  color: #ffffff;
  border: none;
  cursor: pointer;
}

.psc-done-text {
  font-size: 0.72rem;
  font-weight: 700;
  color: #059669;
}

/* ========================================================================= */
/* TAB 4: BADGES */
/* ========================================================================= */
.badges-full-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

[data-theme='dark'] .badges-full-section {
  background: #111e38;
  border-color: #1e2e4f;
}

.bfs-header {
  margin-bottom: 20px;
}

.bfs-header h3 {
  margin: 0 0 4px;
  font-size: 1.15rem;
  font-weight: 900;
}

.bfs-header p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.badge-item-card {
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #f8fafc;
  opacity: 0.6;
  filter: grayscale(0.5);
  transition: all 0.2s ease;
}

[data-theme='dark'] .badge-item-card {
  background: #1e293b;
  border-color: #334155;
}

.badge-item-card.unlocked {
  opacity: 1;
  filter: none;
  background: #ffffff;
  border-color: #fde68a;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.1);
}

[data-theme='dark'] .badge-item-card.unlocked {
  background: #17223b;
  border-color: #78350f;
}

.bic-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.bic-content h4 {
  margin: 0 0 4px;
  font-size: 0.95rem;
  font-weight: 800;
}

.bic-content p {
  margin: 0 0 8px;
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.35;
}

[data-theme='dark'] .bic-content p {
  color: #94a3b8;
}

.bic-status {
  font-size: 0.72rem;
  font-weight: 800;
  color: #f59e0b;
}

.badge-item-card:not(.unlocked) .bic-status {
  color: #94a3b8;
}

/* ========================================================================= */
/* EDIT PROFILE MODAL */
/* ========================================================================= */
.edit-profile-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.edit-profile-card {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-theme='dark'] .edit-profile-card {
  background: #111e38;
  border-color: #1e2e4f;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.epc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22px 24px;
  border-bottom: 1px solid #f1f5f9;
}

[data-theme='dark'] .epc-header {
  border-color: #1e2e4f;
}

.epc-title-cluster h2 {
  margin: 0 0 2px;
  font-size: 1.35rem;
  font-weight: 900;
}

.epc-title-cluster p {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.epc-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.9rem;
  cursor: pointer;
}

[data-theme='dark'] .epc-close-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.epc-body {
  padding: 20px 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 800;
  color: #334155;
  margin-bottom: 6px;
}

[data-theme='dark'] .form-group label {
  color: #cbd5e1;
}

.required {
  color: #ef4444;
}

.avatar-edit-cluster {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #0284c7;
  flex-shrink: 0;
}

.apb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.apb-initial {
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 900;
  color: #0284c7;
}

.avatar-upload-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.btn-choose-file {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  cursor: pointer;
  width: fit-content;
}

[data-theme='dark'] .btn-choose-file {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}

.avatar-upload-actions small {
  font-size: 0.72rem;
  color: #64748b;
}

.epc-input,
.epc-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-family: inherit;
  font-size: 0.88rem;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

[data-theme='dark'] .epc-input,
[data-theme='dark'] .epc-textarea {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}

.epc-input:focus,
.epc-textarea:focus {
  border-color: #0284c7;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

[data-theme='dark'] .epc-input:focus,
[data-theme='dark'] .epc-textarea:focus {
  background: #111e38;
}

.label-with-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 0.74rem;
  color: #94a3b8;
}

/* Cover Selection Grid */
.cover-selection-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.csg-item {
  height: 54px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.csg-item.selected {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4);
}

.csg-item span {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-size: 0.64rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2px;
}

.epc-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

[data-theme='dark'] .epc-footer {
  border-color: #1e2e4f;
}

.btn-epc-cancel,
.btn-epc-save {
  padding: 9px 18px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-epc-cancel {
  background: #f1f5f9;
  color: #475569;
}

[data-theme='dark'] .btn-epc-cancel {
  background: #1e293b;
  color: #cbd5e1;
}

.btn-epc-save {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
}

.btn-epc-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.4);
}

/* ========================================================================= */
/* RESPONSIVENESS */
/* ========================================================================= */
@media (max-width: 1024px) {
  .profile-stats-bento {
    grid-template-columns: repeat(2, 1fr);
  }
  .overview-grid-layout {
    grid-template-columns: 1fr;
  }
  .profile-trips-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-identity-strip {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  .user-name-row,
  .user-meta-tags {
    justify-content: center;
  }
  .identity-actions-col {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .identity-actions-col button {
    flex: 1;
  }
  .level-progress-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .lpb-progress-wrap {
    width: 100%;
  }
  .profile-stats-bento {
    grid-template-columns: 1fr;
  }
  .profile-nav-tabs-bar {
    overflow-x: auto;
  }
  .profile-trips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
