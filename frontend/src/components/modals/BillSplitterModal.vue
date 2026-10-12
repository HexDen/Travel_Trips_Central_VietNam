<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>
          <AppIcon name="wallet" :size="20" style="margin-right: 8px; vertical-align: -3px;" />
          Tính Tiền Chia Đều Cho Nhóm
        </h3>
        <button type="button" class="close-modal-btn" @click="$emit('close')" aria-label="Đóng">
          <AppIcon name="x" :size="16" />
        </button>
      </div>

      <div class="splitter-body">
        <div class="app-field">
          <label>Tổng chi phí chuyến đi (VND)</label>
          <input type="number" v-model.number="totalCost" class="app-input" min="0" step="10000" />
        </div>

        <div class="app-field">
          <label>Số thành viên trong nhóm</label>
          <div class="stepper-input">
            <button type="button" @click="peopleCount = Math.max(1, peopleCount - 1)">-</button>
            <span>{{ peopleCount }} người</span>
            <button type="button" @click="peopleCount++">+</button>
          </div>
        </div>

        <div class="splitter-result-box">
          <small>MỖI THÀNH VIÊN CẦN ĐÓNG:</small>
          <strong>{{ formatCurrency(perPersonCost) }}đ</strong>
          <p>Đã tính toán chia đều trên tổng số {{ peopleCount }} người tham gia chuyến đi.</p>
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
  initialTotal: {
    type: Number,
    default: 0
  },
  initialPeople: {
    type: Number,
    default: 1
  }
})

defineEmits(['close'])

const totalCost = ref(props.initialTotal)
const peopleCount = ref(props.initialPeople)

watch(() => props.initialTotal, (newVal) => {
  totalCost.value = newVal || 0
})

watch(() => props.initialPeople, (newVal) => {
  peopleCount.value = Math.max(1, newVal || 1)
})

const perPersonCost = computed(() => {
  const p = Math.max(1, peopleCount.value)
  return Math.round((totalCost.value || 0) / p)
})

function formatCurrency(val) {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(val)
}
</script>
