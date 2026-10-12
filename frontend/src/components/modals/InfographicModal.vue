<template>
  <div v-if="isOpen && itinerary" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card infographic-share-card" role="dialog" aria-modal="true" aria-label="Thẻ Lịch Trình Infographic">
      <div class="modal-header">
        <div class="m-head-title">
          <span class="m-head-icon"><AppIcon name="phone" :size="20" /></span>
          <h3>Thẻ Lịch Trình Infographic (Zalo / Messenger)</h3>
        </div>
        <button type="button" class="close-modal-btn" @click="$emit('close')" aria-label="Đóng">
          <AppIcon name="x" :size="16" />
        </button>
      </div>

      <div class="infographic-scroll-wrap">
        <!-- Bề mặt Thẻ Infographic có thể chụp ảnh/copy -->
        <div class="infographic-poster" id="infographic-poster-target">
          <!-- Header Poster -->
          <div class="ip-header">
            <span class="ip-tag">
              <AppIcon name="sprout" :size="14" style="margin-right: 4px; vertical-align: -2px;" />
              AI TRAVEL TRIPS · MIỀN TRUNG VIỆT NAM
            </span>
            <h2 class="ip-title">
              KẾ HOẠCH DU LỊCH {{ (itinerary.destination || defaultDestination).toUpperCase() }}
            </h2>
            <div class="ip-meta-strip">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <AppIcon name="clock" :size="14" />
                {{ (itinerary.daysList || itinerary.days || []).length }} Ngày
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <AppIcon name="users" :size="14" />
                {{ itinerary.people || defaultPeople }} Khách
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <AppIcon name="wallet" :size="14" />
                {{ formatCurrency(itinerary.total_budget) }}đ
              </span>
            </div>
          </div>

          <!-- Khối Nhà xe & Khách sạn đã chọn -->
          <div class="ip-highlight-box" v-if="selectedBus || itinerary.hotel_recommendation">
            <div v-if="selectedBus" class="ip-hl-row">
              <span class="ip-hl-icon"><AppIcon name="bus" :size="20" /></span>
              <div>
                <strong>{{ selectedBus.name }} ({{ selectedBus.type }})</strong>
                <small>{{ departureCity }} ➔ {{ itinerary.destination || defaultDestination }} · Hotline: {{ selectedBus.hotline }}</small>
              </div>
            </div>
            <div v-if="itinerary.hotel_recommendation" class="ip-hl-row">
              <span class="ip-hl-icon"><AppIcon name="hotel" :size="20" /></span>
              <div>
                <strong>{{ itinerary.hotel_recommendation.name }}</strong>
                <small>{{ itinerary.hotel_recommendation.address || 'Khu vực trung tâm' }}</small>
              </div>
            </div>
          </div>

          <!-- Tóm tắt lịch trình từng ngày -->
          <div class="ip-days-list">
            <div v-for="day in (itinerary.daysList || itinerary.days || [])" :key="day.day" class="ip-day-block">
              <div class="ip-day-title">
                <AppIcon name="calendar" :size="15" style="margin-right: 6px; vertical-align: -2px;" />
                NGÀY {{ day.day }}
              </div>
              <div class="ip-activities-list">
                <div v-for="act in (day.activities || [])" :key="act.time + (act.place || act.name)" class="ip-act-item">
                  <span class="ip-act-time">{{ act.time }}</span>
                  <span class="ip-act-place">
                    <b>{{ act.place || act.name }}</b>: {{ act.activity || act.description }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Poster -->
          <div class="ip-footer">
            <div class="ip-footer-left">
              <small>Bản quyền thuộc Trợ lý Du lịch Miền Trung AI</small>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <AppIcon name="map" :size="14" />
                GPS Google Maps: Đã tạo tuyến đường tự động
              </span>
            </div>
            <div class="ip-watermark">TRAVEL TRIPS</div>
          </div>
        </div>
      </div>

      <!-- Các nút thao tác trong Modal -->
      <div class="infographic-actions-row">
        <button
          type="button"
          :class="['app-primary-btn', { 'copied-success': isCopied }]"
          @click="$emit('copy-zalo')"
        >
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <AppIcon :name="isCopied ? 'check' : 'copy'" :size="16" />
            {{ isCopied ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép tóm tắt gửi Zalo' }}
          </span>
        </button>
        <a
          v-if="googleMapsUrl"
          :href="googleMapsUrl"
          target="_blank"
          rel="noreferrer"
          class="app-secondary-btn"
          style="display: inline-flex; align-items: center; gap: 6px;"
        >
          <AppIcon name="map" :size="16" />
          Mở toàn tuyến trên Google Maps ↗
        </a>
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
  itinerary: {
    type: Object,
    default: null
  },
  defaultDestination: {
    type: String,
    default: ''
  },
  defaultPeople: {
    type: [Number, String],
    default: 1
  },
  selectedBus: {
    type: Object,
    default: null
  },
  departureCity: {
    type: String,
    default: ''
  },
  googleMapsUrl: {
    type: String,
    default: ''
  },
  isCopied: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'copy-zalo'])

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0'
  return Math.round(Number(val)).toLocaleString('vi-VN')
}
</script>
