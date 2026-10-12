<template>
  <header class="app-header" role="banner">
    <div class="header-inner">
      <!-- LOGO & BRAND TITLE (SEMANTIC BUTTON CHO KEYBOARD & A11Y) -->
      <button
        type="button"
        class="header-brand"
        aria-label="Travel Trips - Về trang chủ Khám phá"
        @click="$emit('update:activeTab', 'explore')"
      >
        <img
          src="/logo.png"
          alt="Travel Trips Miền Trung"
          class="app-logo-image"
          width="44"
          height="44"
          loading="eager"
        />
        <div class="brand-text">
          <span class="brand-title">Travel Trips</span>
          <span class="brand-tagline">Miền Trung • Bản Sắc &amp; Hành Trình</span>
        </div>
      </button>

      <!-- THANH ĐIỀU HƯỚNG CHÍNH (GLASS RADIO GROUP VỚI HIỆU ỨNG GLIDER ĐÀN HỒI) -->
      <nav class="desktop-nav" aria-label="Điều hướng chính" role="tablist">
        <div class="glass-radio-group" :class="{ 'has-admin': nguoiDung && nguoiDung.role === 'admin' }">
          <input
            type="radio"
            name="nav-tab"
            id="glass-explore"
            :checked="activeTab === 'explore'"
            @change="$emit('update:activeTab', 'explore')"
          />
          <label for="glass-explore" title="Khám phá các điểm đến Miền Trung">
            <AppIcon name="compass" :size="18" class="nav-icon" />
            <span>Khám phá</span>
          </label>

          <input
            type="radio"
            name="nav-tab"
            id="glass-planner"
            :checked="activeTab === 'planner'"
            @change="$emit('update:activeTab', 'planner')"
          />
          <label for="glass-planner" title="Lập kế hoạch du lịch thông minh cùng AI">
            <AppIcon name="calendar" :size="18" class="nav-icon" />
            <span>Lên lịch</span>
          </label>

          <input
            type="radio"
            name="nav-tab"
            id="glass-mytrips"
            :checked="activeTab === 'mytrips'"
            @change="$emit('update:activeTab', 'mytrips')"
          />
          <label for="glass-mytrips" title="Danh sách các chuyến đi đã lưu">
            <AppIcon name="luggage" :size="18" class="nav-icon" />
            <span>Chuyến đi</span>
          </label>

          <template v-if="nguoiDung && nguoiDung.role === 'admin'">
            <input
              type="radio"
              name="nav-tab"
              id="glass-admin"
              :checked="activeTab === 'admin'"
              @change="$emit('update:activeTab', 'admin')"
            />
            <label for="glass-admin" title="Quản trị hệ thống">
              <AppIcon name="dashboard" :size="18" class="nav-icon" />
              <span>Admin</span>
            </label>
          </template>

          <div class="glass-glider"></div>
        </div>
      </nav>

      <!-- KHU VỰC HÀNH ĐỘNG (THEME TOGGLE & USER PROFILE / LOGIN) -->
      <div class="header-actions" role="toolbar" aria-label="Tùy chọn người dùng">
        <!-- Nút Dark Mode với Touch Target >= 44px và Accessible State -->
        <button
          type="button"
          class="theme-toggle-btn"
          :aria-label="isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
          :title="isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
          @click="$emit('toggleDark')"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="20" class="theme-icon" />
        </button>

        <!-- Thẻ người dùng đã đăng nhập hoặc Nút Đăng nhập -->
        <button
          v-if="nguoiDung"
          type="button"
          class="user-chip-btn"
          :class="{ active: activeTab === 'profile' }"
          :aria-label="`Tài khoản: ${nguoiDung.name || 'Cá nhân'}`"
          @click="$emit('update:activeTab', 'profile')"
        >
          <span class="user-avatar" aria-hidden="true">
            {{ nguoiDung.name ? nguoiDung.name.trim()[0].toUpperCase() : 'U' }}
          </span>
          <span class="user-name">{{ nguoiDung.name }}</span>
        </button>

        <button
          v-else
          type="button"
          class="login-header-btn"
          aria-label="Đăng nhập tài khoản"
          @click="$emit('openAuth')"
        >
          <AppIcon name="login" :size="18" class="btn-icon" />
          <span>Đăng nhập</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  activeTab: { type: String, required: true },
  nguoiDung: { type: Object, default: null },
  isDark: { type: Boolean, default: false }
})

defineEmits(['update:activeTab', 'openAuth', 'toggleDark'])
</script>

<style scoped>
/* ==================== APP HEADER (COSMIC GLASSMORPHISM SYSTEM) ==================== */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-blur, 16px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 16px));
  border-bottom: var(--glass-border);
  box-shadow: var(--glass-glow-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  min-height: 64px;
}

/* BRAND LOGO & TITLE */
.header-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 0;
  padding: 4px 10px 4px 6px;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.25s var(--ease-smooth, ease), background-color 0.25s ease;
  user-select: none;
}

.header-brand:hover {
  background: rgba(56, 189, 248, 0.08);
}

.header-brand:hover .app-logo-image {
  transform: rotate(-5deg) scale(1.08);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.45);
}

.app-logo-image {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: contain;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  transition: transform 0.35s var(--ease-elastic, cubic-bezier(0.34, 1.56, 0.64, 1)), box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.18rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--primary, #0284c7);
  line-height: 1.15;
  transition: color 0.3s ease;
}

.brand-tagline {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-sub, #64748b);
  line-height: 1.3;
}

/* ==================== GLASS RADIO GROUP TAB BAR (UIVERSE GLASS GLIDER) ==================== */
.desktop-nav {
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-radio-group {
  --bg: rgba(15, 23, 42, 0.08);
  --text: #475569;
  --glider-width: calc(100% / 3);

  display: flex;
  position: relative;
  background: var(--bg);
  border-radius: 999px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow:
    inset 1px 1px 4px rgba(255, 255, 255, 0.4),
    inset -1px -1px 6px rgba(0, 0, 0, 0.08),
    0 4px 14px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  width: fit-content;
  user-select: none;
  padding: 3px;
}

.glass-radio-group.has-admin {
  --glider-width: calc(100% / 4);
}

.glass-radio-group input {
  display: none;
}

.glass-radio-group label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 96px;
  font-size: 14px;
  padding: 0.65rem 1.4rem;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--text);
  position: relative;
  z-index: 2;
  transition: color 0.3s ease-in-out, transform 0.2s ease;
  white-space: nowrap;
}

.glass-radio-group label:hover {
  color: var(--text-main, #0f172a);
}

.glass-radio-group label:hover .nav-icon {
  transform: translateY(-1px) scale(1.08);
}

.glass-radio-group input:checked + label {
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

.glass-radio-group input:checked + label .nav-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-glider {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc(var(--glider-width) - 2px);
  border-radius: 999px;
  z-index: 1;
  opacity: 1;
  transition:
    transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
    background 0.4s ease-in-out,
    box-shadow 0.4s ease-in-out,
    opacity 0.3s ease;
}

/* Ẩn glider nếu không có tab nào được chọn */
.glass-radio-group:not(:has(input:checked)) .glass-glider {
  opacity: 0;
}

/* Tab 1: Khám phá (Silver) */
#glass-explore:checked ~ .glass-glider {
  transform: translateX(0%);
  background: linear-gradient(135deg, rgba(160, 174, 192, 0.75), #cbd5e1);
  box-shadow:
    0 0 18px rgba(160, 174, 192, 0.55),
    0 0 10px rgba(255, 255, 255, 0.4) inset;
}

/* Tab 2: Lên lịch (Gold) */
#glass-planner:checked ~ .glass-glider {
  transform: translateX(100%);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.8), #f59e0b);
  box-shadow:
    0 0 18px rgba(245, 158, 11, 0.55),
    0 0 10px rgba(254, 240, 138, 0.4) inset;
}

/* Tab 3: Chuyến đi (Platinum) */
#glass-mytrips:checked ~ .glass-glider {
  transform: translateX(200%);
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.8), #0284c7);
  box-shadow:
    0 0 18px rgba(56, 189, 248, 0.55),
    0 0 10px rgba(224, 242, 254, 0.4) inset;
}

/* Tab 4: Admin (Ruby / Rose) */
#glass-admin:checked ~ .glass-glider {
  transform: translateX(300%);
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.8), #e11d48);
  box-shadow:
    0 0 18px rgba(244, 63, 94, 0.55),
    0 0 10px rgba(254, 205, 211, 0.4) inset;
}

/* ACTIONS BAR */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* THEME TOGGLE (GLASS PILL TARGET CHUẨN A11Y) */
.theme-toggle-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  min-height: 42px;
  border: var(--glass-border);
  background: var(--glass-surface);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: var(--text-main, #1e293b);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--glass-inner-shadow), 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s var(--ease-smooth, ease);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.4s var(--ease-elastic, cubic-bezier(0.34, 1.56, 0.64, 1));
}

.theme-toggle-btn:hover {
  background: var(--glass-surface-elevated);
  border-color: rgba(56, 189, 248, 0.5);
  color: var(--primary, #0284c7);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.3), var(--glass-inner-shadow);
  transform: translateY(-1px);
}

.theme-toggle-btn:hover .theme-icon {
  transform: rotate(25deg) scale(1.12);
}

/* USER CHIP (COSMIC GLASS USER BADGE) */
.user-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--glass-surface);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: var(--glass-border);
  box-shadow: var(--glass-inner-shadow), 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 4px 16px 4px 5px;
  min-height: 42px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s var(--ease-smooth, ease);
  max-width: 200px;
}

.user-chip-btn:hover {
  border-color: rgba(56, 189, 248, 0.6);
  background: var(--glass-surface-elevated);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.25), var(--glass-inner-shadow);
  transform: translateY(-1px);
}

.user-chip-btn.active {
  border-color: var(--primary, #0284c7);
  box-shadow: 0 0 16px rgba(2, 132, 199, 0.35);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--metal-platinum);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
}

.user-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* LOGIN BUTTON (GLASS SHIMMER CTA WITH METALLIC GLOW) */
.login-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--metal-platinum);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 8px 20px;
  min-height: 42px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 18px rgba(2, 132, 199, 0.35),
    inset 1px 1px 3px rgba(255, 255, 255, 0.45);
  transition: all 0.25s var(--ease-smooth, ease);
}

.login-header-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(60deg, transparent 35%, rgba(255, 255, 255, 0.28) 50%, transparent 65%);
  transform: rotate(25deg) translateY(-100%);
  transition: transform 0.65s ease;
  pointer-events: none;
}

.login-header-btn:hover::after {
  transform: rotate(25deg) translateY(100%);
}

.btn-icon {
  width: 17px;
  height: 17px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.login-header-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 22px rgba(2, 132, 199, 0.5),
    0 0 16px rgba(56, 189, 248, 0.4);
}

.login-header-btn:active {
  transform: translateY(0);
}

/* ==================== ACCESSIBILITY FOCUS-VISIBLE RINGS ==================== */
button:focus-visible {
  outline: 2px solid var(--primary, #0d7c76);
  outline-offset: 3px;
}

/* ==================== DARK THEME OVERRIDES ==================== */
:root[data-theme="dark"] .app-header {
  background: rgba(15, 23, 42, 0.88);
  border-bottom-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.35);
}

:root[data-theme="dark"] .glass-radio-group {
  --bg: rgba(255, 255, 255, 0.06);
  --text: #cbd5e1;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 1px 1px 4px rgba(255, 255, 255, 0.2),
    inset -1px -1px 6px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.35);
}

:root[data-theme="dark"] .glass-radio-group label:hover {
  color: #ffffff;
}

:root[data-theme="dark"] #glass-explore:checked ~ .glass-glider {
  background: linear-gradient(135deg, #c0c0c055, #e0e0e0);
  box-shadow:
    0 0 18px rgba(192, 192, 192, 0.5),
    0 0 10px rgba(255, 255, 255, 0.4) inset;
}

:root[data-theme="dark"] #glass-planner:checked ~ .glass-glider {
  background: linear-gradient(135deg, #ffd70055, #ffcc00);
  box-shadow:
    0 0 18px rgba(255, 215, 0, 0.5),
    0 0 10px rgba(255, 235, 150, 0.4) inset;
}

:root[data-theme="dark"] #glass-mytrips:checked ~ .glass-glider {
  background: linear-gradient(135deg, #d0e7ff55, #a0d8ff);
  box-shadow:
    0 0 18px rgba(160, 216, 255, 0.5),
    0 0 10px rgba(200, 240, 255, 0.4) inset;
}

:root[data-theme="dark"] #glass-admin:checked ~ .glass-glider {
  background: linear-gradient(135deg, #fb718555, #f43f5e);
  box-shadow:
    0 0 18px rgba(244, 63, 94, 0.5),
    0 0 10px rgba(255, 200, 210, 0.4) inset;
}

:root[data-theme="dark"] .theme-toggle-btn {
  background: var(--glass-surface);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f1f5f9;
}

:root[data-theme="dark"] .theme-toggle-btn:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(56, 189, 248, 0.6);
  color: #38bdf8;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
}

:root[data-theme="dark"] .user-chip-btn {
  background: var(--glass-surface);
  border-color: rgba(255, 255, 255, 0.12);
}

:root[data-theme="dark"] .user-chip-btn:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
}

:root[data-theme="dark"] .user-name {
  color: #f1f5f9;
}

:root[data-theme="dark"] .brand-title {
  background: linear-gradient(135deg, #ffffff 40%, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(147, 197, 253, 0.35);
}

:root[data-theme="dark"] .brand-tagline {
  color: #94a3b8;
}

/* ==================== RESPONSIVE LAYOUT (MOBILE & TABLET) ==================== */
@media (max-width: 820px) {
  .header-inner {
    padding: 10px 16px;
    flex-wrap: wrap;
  }
  
  .brand-tagline {
    display: none; /* Rút gọn trên màn hình hẹp */
  }

  .desktop-nav {
    order: 3;
    width: 100%;
    margin-top: 6px;
  }

  .glass-radio-group {
    width: 100%;
  }

  .glass-radio-group label {
    min-width: 0;
    padding: 0.55rem 0.5rem;
    font-size: 13px;
    gap: 5px;
  }

  .nav-icon {
    width: 16px;
    height: 16px;
  }
}

/* PREFERS-REDUCED-MOTION SUPPORT */
@media (prefers-reduced-motion: reduce) {
  .app-header,
  .nav-item,
  .theme-toggle-btn,
  .header-brand,
  .login-header-btn,
  .app-logo-image,
  .theme-icon {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
