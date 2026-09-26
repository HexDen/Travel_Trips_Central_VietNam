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

      <!-- THANH ĐIỀU HƯỚNG CHÍNH (NAVIGATION WITH ARIA ROLES & SVG ICONS) -->
      <nav class="desktop-nav" aria-label="Điều hướng chính" role="tablist">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'explore'"
          :tabindex="activeTab === 'explore' ? 0 : -1"
          :class="['nav-item', { active: activeTab === 'explore' }]"
          @click="$emit('update:activeTab', 'explore')"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span class="nav-label">Khám phá</span>
        </button>

        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'planner'"
          :tabindex="activeTab === 'planner' ? 0 : -1"
          :class="['nav-item', { active: activeTab === 'planner' }]"
          @click="$emit('update:activeTab', 'planner')"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="m9 16 2 2 4-4" />
          </svg>
          <span class="nav-label">Lên lịch</span>
        </button>

        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'mytrips'"
          :tabindex="activeTab === 'mytrips' ? 0 : -1"
          :class="['nav-item', { active: activeTab === 'mytrips' }]"
          @click="$emit('update:activeTab', 'mytrips')"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span class="nav-label">Chuyến đi</span>
        </button>

        <button
          v-if="nguoiDung && nguoiDung.role === 'admin'"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'admin'"
          :tabindex="activeTab === 'admin' ? 0 : -1"
          :class="['nav-item', { active: activeTab === 'admin' }]"
          @click="$emit('update:activeTab', 'admin')"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span class="nav-label">Admin</span>
        </button>
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
          <svg v-if="isDark" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
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
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
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
/* ==================== APP HEADER (GLASSMORPHISM & ACCESSIBILITY TOKENS) ==================== */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
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
  padding: 4px 8px 4px 4px;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
  user-select: none;
}

.header-brand:hover {
  background: rgba(14, 165, 233, 0.06);
}

.header-brand:hover .app-logo-image {
  transform: rotate(-4deg) scale(1.06);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.25);
}

.app-logo-image {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--primary, #0d7c76);
  line-height: 1.15;
}

.brand-tagline {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-sub, #64748b);
  line-height: 1.3;
}

/* DESKTOP NAVIGATION (TOUCH TARGETS & ACTIVE PILL INDICATOR) */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 8px; /* Tối thiểu 8px khoảng cách theo UI/UX Pro Max */
  background: rgba(241, 245, 249, 0.7);
  padding: 4px;
  border-radius: 50px;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.nav-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-sub, #64748b);
  cursor: pointer;
  padding: 8px 18px;
  min-height: 40px; /* Đảm bảo target size chuẩn thao tác */
  border-radius: 50px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  white-space: nowrap;
}

.nav-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.nav-item:hover {
  color: var(--primary, #0d7c76);
  background: rgba(255, 255, 255, 0.6);
}

.nav-item:hover .nav-icon {
  transform: translateY(-1px);
}

.nav-item.active {
  color: #ffffff;
  background: var(--primary, #0d7c76);
  box-shadow: 0 4px 12px rgba(13, 124, 118, 0.3);
}

.nav-item.active .nav-icon {
  transform: scale(1.05);
}

/* ACTIONS BAR */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* THEME TOGGLE (MIN TARGET 44px x 44px) */
.theme-toggle-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  min-height: 42px;
  border: 1px solid var(--border-color, #e2e8f0);
  background: rgba(255, 255, 255, 0.7);
  color: var(--text-main, #1e293b);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-toggle-btn:hover {
  background: #ffffff;
  border-color: var(--primary, #0d7c76);
  color: var(--primary, #0d7c76);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.theme-toggle-btn:hover .theme-icon {
  transform: rotate(20deg) scale(1.1);
}

/* USER CHIP */
.user-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 4px 14px 4px 6px;
  min-height: 42px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 190px;
}

.user-chip-btn:hover {
  border-color: var(--primary, #0d7c76);
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.user-chip-btn.active {
  border-color: var(--primary, #0d7c76);
  box-shadow: 0 0 0 2px rgba(13, 124, 118, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary, #0d7c76), #0ea5e9);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(13, 124, 118, 0.25);
}

.user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* LOGIN BUTTON (CTA WITH GLOW) */
.login-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--primary, #0d7c76);
  color: #ffffff;
  border: 0;
  padding: 8px 18px;
  min-height: 42px;
  border-radius: 50px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(13, 124, 118, 0.25);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.login-header-btn:hover {
  background: var(--primary-dark, #0a635e);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(13, 124, 118, 0.35);
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

:root[data-theme="dark"] .desktop-nav {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
}

:root[data-theme="dark"] .nav-item {
  color: #94a3b8;
}

:root[data-theme="dark"] .nav-item:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.08);
}

:root[data-theme="dark"] .nav-item.active {
  color: #ffffff;
  background: var(--primary, #0d7c76);
  box-shadow: 0 4px 16px rgba(13, 124, 118, 0.45);
}

:root[data-theme="dark"] .theme-toggle-btn {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f1f5f9;
}

:root[data-theme="dark"] .theme-toggle-btn:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: var(--primary, #0d7c76);
  color: #38bdf8;
}

:root[data-theme="dark"] .user-chip-btn {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.12);
}

:root[data-theme="dark"] .user-chip-btn:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: var(--primary, #0d7c76);
}

:root[data-theme="dark"] .user-name {
  color: #f1f5f9;
}

:root[data-theme="dark"] .brand-title {
  color: #2dd4bf;
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
    justify-content: space-around;
    border-radius: 16px;
    padding: 4px;
    margin-top: 4px;
  }

  .nav-item {
    flex: 1;
    padding: 8px 10px;
    font-size: 0.82rem;
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
