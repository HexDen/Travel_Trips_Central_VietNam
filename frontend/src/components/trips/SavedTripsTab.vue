<template>
  <section class="tab-pane">
    <div class="pane-header">
      <div>
        <span class="sub-heading">LỊCH SỬ CHUYẾN ĐI</span>
        <h2>Chuyến đi đã lưu</h2>
      </div>
      <button class="app-primary-btn small-btn" @click="$emit('create-trip')">+ Tạo chuyến mới</button>
    </div>

    <!-- Khi chưa đăng nhập -->
    <div v-if="!user" class="auth-prompt-card">
      <span class="prompt-icon"><AppIcon name="lock" :size="32" /></span>
      <h3>Đăng nhập để xem các chuyến đi đã lưu</h3>
      <p>Lịch trình du lịch được đồng bộ và lưu an toàn trên đám mây để bạn xem lại bất cứ lúc nào.</p>
      <button class="app-primary-btn" @click="$emit('open-auth')">Đăng nhập / Đăng ký</button>
    </div>

    <!-- Khi đã có chuyến đi lưu -->
    <div v-else-if="trips && trips.length" class="my-trips-grid">
      <article v-for="trip in trips" :key="trip._id" class="my-trip-card">
        <div class="trip-top">
          <span class="trip-dest">{{ trip.destination }}</span>
          <span class="trip-date">{{ formatDate(trip.created_at) }}</span>
        </div>
        <h3>Chuyến đi {{ (trip.daysList || trip.days || []).length }} ngày tại {{ trip.destination }}</h3>
        <p>Dự toán: <b>{{ formatCurrency(trip.total_budget) }}đ</b> · {{ trip.people || 1 }} người</p>
        <div class="trip-actions">
          <button class="start-trip-btn" @click="$emit('start-trip', trip)">
            <AppIcon name="navigation" :size="14" /> Bắt đầu 🚀
          </button>
          <button class="open-trip-btn" @click="$emit('open-trip', trip)">Chi tiết ↗</button>
          <button class="share-trip-btn" @click="$emit('share-trip', trip)">
            <AppIcon name="share" :size="14" /> Chia sẻ
          </button>
          <button
            class="delete-trip-btn"
            @click="$emit('delete-trip', trip)"
            title="Xóa chuyến đi này"
          >
            <AppIcon name="trash" :size="16" />
          </button>
        </div>
      </article>
    </div>

    <!-- Khi chưa có chuyến đi nào -->
    <div v-else class="empty-state-box">
      <span class="empty-icon"><AppIcon name="luggage" :size="36" /></span>
      <h3>Bạn chưa lưu chuyến đi nào</h3>
      <p>Hãy tạo lịch trình đầu tiên để bắt đầu hành trình khám phá Miền Trung.</p>
      <button class="app-primary-btn" @click="$emit('create-trip')">Lên lịch ngay</button>
    </div>
  </section>
</template>

<script setup>
import AppIcon from '../common/AppIcon.vue'

defineProps({
  user: {
    type: Object,
    default: null
  },
  trips: {
    type: Array,
    default: () => []
  }
})

defineEmits(['create-trip', 'open-auth', 'open-trip', 'start-trip', 'share-trip', 'delete-trip'])

function formatCurrency(val) {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(val)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}
</script>
