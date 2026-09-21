<template>
  <header class="app-header">
    <div class="header-brand" @click="$emit('update:activeTab', 'explore')">
      <span class="app-logo-icon">✈</span>
      <div class="brand-text">
        <h1>Travel Trips</h1>
        <small>AI Travel App · Central VietNam</small>
      </div>
    </div>

    <div class="header-actions">
      <!-- Nút chuyển đổi giao diện giả lập Mobile / Desktop -->
      <button
        type="button"
        class="mode-toggle-btn"
        @click="$emit('update:isMobileFrame', !isMobileFrame)"
        :title="isMobileFrame ? 'Mở rộng toàn màn hình PC' : 'Thu nhỏ xem khung Mobile App'"
      >
        <span>{{ isMobileFrame ? '💻 Bản PC' : '📱 Giả lập App' }}</span>
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
  isMobileFrame: { type: Boolean, required: true },
  nguoiDung: { type: Object, default: null }
})

defineEmits(['update:activeTab', 'update:isMobileFrame', 'openAuth'])
</script>
