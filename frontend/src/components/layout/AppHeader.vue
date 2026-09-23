<template>
  <header class="app-header">
    <div class="header-brand" @click="$emit('update:activeTab', 'explore')">
      <img src="/favicon.svg" alt="Travel Trips Logo" class="app-logo-image" />
      <div class="brand-text">
        <h1>Travel Trips</h1>
        <small>Khám Phá Miền Trung</small>
      </div>
    </div>

    <nav class="desktop-nav">
      <button :class="{ active: activeTab === 'explore' }" @click="$emit('update:activeTab', 'explore')">Khám phá</button>
      <button :class="{ active: activeTab === 'planner' }" @click="$emit('update:activeTab', 'planner')">Lên lịch</button>
      <button :class="{ active: activeTab === 'mytrips' }" @click="$emit('update:activeTab', 'mytrips')">Chuyến đi</button>
    </nav>

    <div class="header-actions">
      <!-- Nút Dark Mode -->
      <button class="theme-toggle-btn" @click="$emit('toggleDark')" title="Đổi giao diện">
        <span v-if="isDark">☀️</span>
        <span v-else>🌙</span>
      </button>

      <!-- Nút tài khoản -->
      <button v-if="nguoiDung" class="user-chip-btn" @click="$emit('update:activeTab', 'profile')">
        <span class="user-avatar">{{ nguoiDung.name ? nguoiDung.name[0].toUpperCase() : 'U' }}</span>
        <span class="user-name">{{ nguoiDung.name }}</span>
      </button>
      <button v-else class="login-header-btn" @click="$emit('openAuth')">
        <span>Đăng nhập</span>
      </button>
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
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 14px 40px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.app-logo-image {
  width: 38px;
  height: 38px;
  border-radius: 10px;
}
.brand-text h1 {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary, #0d7c76);
  line-height: 1.1;
  margin: 0;
}
.brand-text small {
  font-size: 11px;
  color: var(--text-sub, #64748b);
  font-weight: 600;
}

.desktop-nav {
  display: flex;
  gap: 15px;
}
.desktop-nav button {
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-sub, #64748b);
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}
.desktop-nav button:hover {
  background: #f1f5f9;
  color: var(--primary, #0d7c76);
}
.desktop-nav button.active {
  color: #fff;
  background: var(--primary, #0d7c76);
}

.theme-toggle-btn {
  background: transparent;
  border: none;
  outline: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}
.theme-toggle-btn:hover {
  background: #f1f5f9;
}

:root[data-theme="dark"] .app-header {
  background: rgba(30, 41, 59, 0.9);
  border-bottom-color: rgba(255,255,255,0.05);
}
:root[data-theme="dark"] .desktop-nav button:hover {
  background: rgba(255,255,255,0.1);
}
:root[data-theme="dark"] .theme-toggle-btn:hover {
  background: rgba(255,255,255,0.1);
}

@media (max-width: 768px) {
  .app-header {
    padding: 14px 20px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .desktop-nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }
}
</style>
