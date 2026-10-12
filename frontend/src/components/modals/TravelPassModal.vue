<template>
  <div v-if="isOpen && itinerary" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card travel-pass-card" role="dialog" aria-modal="true" aria-label="Thẻ Vé Hành Trình Du Lịch">
      <div class="modal-header">
        <h3>
          <AppIcon name="ticket" :size="20" style="margin-right: 8px; vertical-align: -3px;" />
          Thẻ Vé Hành Trình Du Lịch
        </h3>
        <button type="button" class="close-modal-btn" @click="$emit('close')" aria-label="Đóng">
          <AppIcon name="x" :size="16" />
        </button>
      </div>

      <div class="boarding-pass">
        <div class="pass-header">
          <span class="pass-logo">
            <img src="/logo.png" alt="Logo" class="pass-mini-logo" /> Travel Trips PASS
          </span>
          <span class="pass-dest">{{ itinerary.destination }}</span>
        </div>

        <div class="pass-body">
          <div class="pass-row">
            <div>
              <small>THỜI GIAN</small>
              <b>{{ (itinerary.daysList || itinerary.days || []).length }} Ngày</b>
            </div>
            <div>
              <small>SỐ KHÁCH</small>
              <b>{{ itinerary.people || 1 }} Người</b>
            </div>
            <div>
              <small>NGÂN SÁCH</small>
              <b>{{ formatCurrency(itinerary.total_budget) }}đ</b>
            </div>
          </div>

          <div class="pass-hotel" v-if="itinerary.hotel_recommendation">
            <small>KHÁCH SẠN NGHỈ DƯỠNG</small>
            <b>{{ itinerary.hotel_recommendation.name }}</b>
            <p>{{ itinerary.hotel_recommendation.address }}</p>
          </div>

          <div class="pass-qr-sim">
            <div class="qr-mockup">QR CODE OFFLINE PASS</div>
            <small>Chụp màn hình thẻ vé để sử dụng khi mất sóng 4G</small>
          </div>
        </div>
      </div>

      <button type="button" class="app-primary-btn" @click="$emit('export-pdf')">
        <AppIcon name="filetext" :size="16" style="margin-right: 6px; vertical-align: -2px;" />
        In / Lưu PDF Thẻ Vé
      </button>
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
  }
})

defineEmits(['close', 'export-pdf'])

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0'
  return Math.round(Number(val)).toLocaleString('vi-VN')
}
</script>
