<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="rain-modal-card" role="dialog" aria-modal="true" aria-label="Đổi Lịch Tránh Mưa Thông Minh">
      <div class="rmc-header">
        <div class="rmc-icon-badge">
          <AppIcon name="cloudrain" :size="24" color="var(--primary-color, #0284c7)" />
        </div>
        <div>
          <h3>Đổi Lịch Tránh Mưa Thông Minh</h3>
          <p class="rmc-sub">Trợ lý AI tự động tối ưu chuyến đi theo dự báo thời tiết</p>
        </div>
        <button type="button" class="close-modal-btn" @click="$emit('close')" aria-label="Đóng">
          <AppIcon name="x" :size="16" />
        </button>
      </div>

      <div class="rmc-body">
        <div class="rmc-weather-alert-box">
          <span class="rmc-wa-icon" style="display: inline-flex; align-items: center; gap: 6px;">
            <AppIcon name="cloudsun" :size="20" /> ➔ <AppIcon name="cloudrain" :size="20" />
          </span>
          <div class="rmc-wa-content">
            <strong>Dự báo {{ destination }} chiều mai có mưa lúc 15:00</strong>
            <p>Khả năng mưa rào 75%, gió nhẹ, nhiệt độ ~26°C. AI đã chuẩn bị phương án hoán đổi điểm ngoài trời sang buổi sáng và chọn cafe/bảo tàng trong nhà lúc 15:30.</p>
          </div>
        </div>

        <div class="rmc-ai-proposal">
          <div class="rmc-proposal-title">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <AppIcon name="bot" :size="16" /> ĐỐI CHIẾU LỊCH TRÌNH (PREVIEW):
            </span>
          </div>
          <div class="diff-preview-box" style="background: rgba(128,128,128,0.05); padding: 16px; border-radius: 8px; margin-top: 12px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border-color);">
            <div class="diff-old" style="background: #fee2e2; padding: 12px; border-radius: 6px;">
              <div class="diff-label" style="color: #b91c1c; font-weight: 700; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                <AppIcon name="x" :size="14" /> Lịch cũ (Ngoài trời)
              </div>
              <div
                v-for="p in oldPlaces"
                :key="p"
                class="diff-content"
                style="color: #7f1d1d; text-decoration: line-through; font-size: 14px;"
              >
                {{ p }}
              </div>
              <div v-if="oldPlaces.length === 0" style="font-size: 13px; color: #7f1d1d;">
                Không có điểm nào vào chiều nay cần đổi.
              </div>
            </div>
            
            <div class="diff-arrow" style="text-align: center; font-size: 14px; font-weight: 600; color: var(--text-sub); display: flex; align-items: center; justify-content: center; gap: 6px;">
              <AppIcon name="arrowdown" :size="16" /> Tự động đổi thành
            </div>
            
            <div class="diff-new" style="background: #d1fae5; padding: 12px; border-radius: 6px;">
              <div class="diff-label" style="color: #047857; font-weight: 700; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                <AppIcon name="check" :size="14" /> Lịch mới (Trong nhà)
              </div>
              <div
                v-for="p in newPlaces"
                :key="p"
                class="diff-content"
                style="color: #064e3b; font-weight: 600; font-size: 14px;"
              >
                {{ p }}
              </div>
              <div v-if="newPlaces.length === 0" style="font-size: 13px; color: #064e3b;">
                Vẫn giữ nguyên lịch trình.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rmc-footer">
        <button
          type="button"
          class="app-primary-btn rmc-confirm-btn"
          :disabled="isLoading"
          @click="$emit('confirm')"
        >
          <span v-if="isLoading" class="btn-spinner"></span>
          <span>{{ isLoading ? 'Đang điều chỉnh...' : 'Áp dụng thay đổi này' }}</span>
        </button>
        <button
          type="button"
          class="app-secondary-btn"
          @click="$emit('close')"
          style="background: transparent; color: var(--text-sub);"
        >
          Vẫn giữ nguyên lịch cũ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from '../common/AppIcon.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  destination: {
    type: String,
    default: 'Điểm đến'
  },
  oldPlaces: {
    type: Array,
    default: () => []
  },
  newPlaces: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>
