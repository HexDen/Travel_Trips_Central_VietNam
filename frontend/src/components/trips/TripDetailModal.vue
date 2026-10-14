<template>
  <div v-if="isOpen && trip" class="modal-overlay trip-detail-overlay" @click.self="$emit('close')">
    <div class="modal-card trip-detail-modal-card" role="dialog" aria-modal="true">
      <!-- Header -->
      <div class="tdm-header">
        <div class="tdm-header-info">
          <span class="tdm-dest-tag">{{ trip.destination }}</span>
          <h2 class="tdm-title">Chuyến đi {{ daysArray.length }} Ngày tại {{ trip.destination }}</h2>
          <div class="tdm-meta-row">
            <span class="tdm-meta-item">
              <AppIcon name="users" :size="14" style="margin-right: 4px; vertical-align: -2px;" />
              {{ trip.people || 1 }} người
            </span>
            <span class="tdm-meta-item">
              <AppIcon name="wallet" :size="14" style="margin-right: 4px; vertical-align: -2px;" />
              {{ formatCurrency(trip.total_budget) }}đ
            </span>
            <span class="tdm-meta-item">
              <AppIcon name="calendar" :size="14" style="margin-right: 4px; vertical-align: -2px;" />
              {{ formatDate(trip.created_at) }}
            </span>
          </div>
        </div>
        <button class="close-modal-btn tdm-close" @click="$emit('close')" aria-label="Đóng">
          <AppIcon name="x" :size="16" />
        </button>
      </div>

      <!-- Body: Nếu đang xem ngày cụ thể -->
      <div v-if="activeDay" class="tdm-day-detail-view">
        <button class="tdm-back-btn" @click="activeDay = null">← Quay lại danh sách ngày</button>
        
        <div class="tdm-day-header-card">
          <div class="tdm-day-info">
            <span class="tdm-day-label">Ngày {{ activeDay.day }}</span>
            <h3 class="tdm-day-route">{{ activeDay.title || activeDay.route || ('Ngày ' + activeDay.day) }}</h3>
            <p class="tdm-day-meals">
              <AppIcon name="utensils" :size="14" style="margin-right: 4px; vertical-align: -2px;" />
              {{ getDayMeals(activeDay) }}
            </p>
          </div>
          <div class="tdm-day-img-wrap" v-if="activeDay.activities && activeDay.activities[0]?.image_url">
            <img :src="activeDay.activities[0].image_url" :alt="activeDay.title" class="tdm-day-img" />
          </div>
          <div class="tdm-day-img-wrap tdm-day-img-placeholder" v-else>
            <AppIcon name="map" :size="24" color="var(--primary, #0284c7)" />
          </div>
        </div>

        <!-- Activities list -->
        <div class="tdm-activities-section">
          <h4 class="tdm-activities-title">
            {{ activeDay.theme ? ('Hoạt động chính: ' + activeDay.theme) : 'Lịch trình trong ngày' }}
          </h4>
          <ul class="tdm-activities-list">
            <li v-for="(act, idx) in (activeDay.activities || [])" :key="idx" class="tdm-act-item">
              <span class="tdm-act-time" v-if="act.time">{{ act.time }}</span>
              <span class="tdm-act-icon">
                <AppIcon :name="getActivityIcon(act.type)" :size="16" />
              </span>
              <div class="tdm-act-info">
                <span class="tdm-act-name">{{ act.name || act.place }}</span>
                <span class="tdm-act-desc" v-if="act.description || act.activity">{{ act.description || act.activity }}</span>
                <span class="tdm-act-cost" v-if="act.estimated_cost > 0">~{{ formatCurrency(act.estimated_cost) }}đ/người</span>
                <span class="tdm-act-cost free-tag" v-else-if="act.estimated_cost === 0">Miễn phí</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Body: Danh sách các ngày -->
      <div v-else class="tdm-days-list-view">
        <h3 class="tdm-section-title">
          <AppIcon name="calendar" :size="18" style="margin-right: 6px; vertical-align: -2px;" />Lịch trình
        </h3>
        <div class="tdm-days-list">
          <div
            v-for="day in daysArray"
            :key="day.day"
            class="tdm-day-row"
            @click="activeDay = day"
          >
            <div class="tdm-day-row-info">
              <span class="tdm-day-row-title">Ngày {{ day.day }}: {{ day.title || day.route || ('Ngày ' + day.day) }}</span>
              <span class="tdm-day-row-meals">
                <AppIcon name="utensils" :size="13" style="margin-right: 4px; vertical-align: -2px;" />
                {{ getDayMeals(day) }}
              </span>
            </div>
            <span class="tdm-day-row-arrow">›</span>
          </div>
        </div>

        <!-- Budget summary -->
        <div class="tdm-budget-summary" v-if="trip.budget_breakdown">
          <h3 class="tdm-section-title">
            <AppIcon name="wallet" :size="18" style="margin-right: 6px; vertical-align: -2px;" />Chi phí ước tính
          </h3>
          <div class="tdm-budget-grid">
            <div class="tdm-budget-item" v-if="trip.budget_breakdown.hotel">
              <span class="tbi-icon"><AppIcon name="hotel" :size="18" /></span>
              <span class="tbi-label">Khách sạn</span>
              <span class="tbi-value">{{ formatCurrency(trip.budget_breakdown.hotel) }}đ</span>
            </div>
            <div class="tdm-budget-item" v-if="trip.budget_breakdown.transportation">
              <span class="tbi-icon"><AppIcon name="bus" :size="18" /></span>
              <span class="tbi-label">Di chuyển</span>
              <span class="tbi-value">{{ formatCurrency(trip.budget_breakdown.transportation) }}đ</span>
            </div>
            <div class="tdm-budget-item" v-if="trip.budget_breakdown.food">
              <span class="tbi-icon"><AppIcon name="utensils" :size="18" /></span>
              <span class="tbi-label">Ăn uống</span>
              <span class="tbi-value">{{ formatCurrency(trip.budget_breakdown.food) }}đ</span>
            </div>
            <div class="tdm-budget-item" v-if="trip.budget_breakdown.tickets">
              <span class="tbi-icon"><AppIcon name="ticket" :size="18" /></span>
              <span class="tbi-label">Vé tham quan</span>
              <span class="tbi-value">{{ formatCurrency(trip.budget_breakdown.tickets) }}đ</span>
            </div>
            <div class="tdm-budget-item tdm-budget-total">
              <span class="tbi-icon"><AppIcon name="wallet" :size="18" /></span>
              <span class="tbi-label">Tổng cộng</span>
              <span class="tbi-value tbi-total">{{ formatCurrency(trip.total_budget) }}đ</span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="tdm-footer-actions">
          <button class="tdm-action-btn tdm-start-btn" @click="$emit('start-trip', trip)">
            <AppIcon name="navigation" :size="16" style="margin-right: 6px; vertical-align: -2px;" />
            🚀 Bắt đầu lịch trình ngay
          </button>
          <button class="tdm-action-btn tdm-open-btn" @click="$emit('open-full-plan', trip)">
            <AppIcon name="map" :size="16" style="margin-right: 6px; vertical-align: -2px;" />
            Xem toàn bộ chi tiết
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '../common/AppIcon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  trip: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'open-full-plan', 'start-trip'])

const activeDay = ref(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) activeDay.value = null
})

const daysArray = computed(() => {
  if (!props.trip) return []
  return props.trip.daysList || props.trip.days || []
})

function formatCurrency(val) {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(val)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}

function getDayMeals(day) {
  const acts = day?.activities || []
  const meals = ['breakfast', 'lunch', 'dinner']
    .filter(m => acts.some(a => a.type === m))
    .map(m => m === 'breakfast' ? 'Sáng' : m === 'lunch' ? 'Trưa' : 'Tối')
  return meals.length > 0 ? meals.join(', ') : 'Ăn sáng, trưa, tối'
}

function getActivityIcon(type) {
  switch (type) {
    case 'breakfast': return 'sunrise'
    case 'lunch': return 'sun'
    case 'dinner': return 'moon'
    case 'attraction':
    case 'checkin': return 'pin'
    case 'transport': return 'bus'
    default: return 'sparkles'
  }
}
</script>
