<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Chọn địa điểm thay thế">
      <div class="modal-header">
        <h3>
          <AppIcon name="refresh" :size="20" style="margin-right: 8px; vertical-align: -3px;" />
          Chọn địa điểm thay thế
        </h3>
        <button type="button" class="close-modal-btn" @click="$emit('close')" aria-label="Đóng">
          <AppIcon name="x" :size="16" />
        </button>
      </div>

      <div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding: 15px;">
        <div v-if="places.length === 0" style="text-align: center; padding: 20px; color: var(--text-sub, #666);">
          Không có địa điểm thay thế nào phù hợp.
        </div>
        <div class="places-app-grid" style="grid-template-columns: 1fr;">
          <article
            v-for="p in places"
            :key="p._id || p.id || p.name"
            class="app-place-card"
            style="cursor: pointer;"
            @click="$emit('select', p)"
          >
            <div class="place-card-top">
              <span class="place-card-type">{{ getPlaceTypeLabel(p.type) }}</span>
              <span class="hotel-price" v-if="p.estimated_cost">{{ formatCurrency(p.estimated_cost) }}đ</span>
            </div>
            <h4>{{ p.name }}</h4>
            <p class="place-card-desc">{{ p.description }}</p>
            <p class="place-card-address" v-if="p.address">
              <AppIcon name="pin" :size="14" style="margin-right: 4px; vertical-align: -2px;" />
              {{ p.address }}
            </p>
          </article>
        </div>
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
  places: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close', 'select'])

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0'
  return Math.round(Number(val)).toLocaleString('vi-VN')
}

const getPlaceTypeLabel = (type) => {
  const map = {
    attraction: 'Tham quan',
    heritage: 'Di sản',
    restaurant: 'Ẩm thực',
    nature: 'Thiên nhiên',
    beach: 'Biển đảo',
    hotel: 'Khách sạn',
    transport: 'Di chuyển'
  }
  return map[type] || 'Địa điểm'
}
</script>
