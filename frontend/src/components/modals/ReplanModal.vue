<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card replan-modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <div class="rmc-title-group">
          <span class="rmc-icon"><AppIcon name="refresh" :size="24" /></span>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem;">Thay Đổi Lịch Trình Khác</h3>
            <p class="rmc-sub" style="margin: 2px 0 0; font-size: 0.82rem; color: var(--text-sub);">
              Chọn phương thức bạn muốn điều chỉnh hành trình
            </p>
          </div>
        </div>
        <button type="button" class="close-modal-btn" @click="$emit('close')" aria-label="Đóng">
          <AppIcon name="x" :size="16" />
        </button>
      </div>

      <div class="replan-options-body">
        <!-- Lựa chọn 1: Chỉnh sửa thông số -->
        <div class="replan-option-card" @click="$emit('edit-params')">
          <div class="roc-icon"><AppIcon name="pencil" :size="22" /></div>
          <div class="roc-text">
            <h4>Chỉnh sửa thông số chuyến đi</h4>
            <p>Thay đổi số ngày, số người, mức kinh phí, phương tiện xe hoặc ngày khởi hành.</p>
          </div>
          <span class="roc-arrow">➔</span>
        </div>

        <!-- Lựa chọn 2: AI Tạo phương án ngẫu nhiên mới -->
        <div class="replan-option-card" @click="$emit('ai-new-plan')">
          <div class="roc-icon"><AppIcon name="dices" :size="22" /></div>
          <div class="roc-text">
            <h4>AI Đề xuất phương án mới ngay</h4>
            <p>Giữ nguyên số ngày và ngân sách, AI sẽ làm mới và gợi ý các điểm check-in & quán ăn khác.</p>
          </div>
          <span class="roc-arrow">➔</span>
        </div>

        <!-- Lựa chọn 3: Đổi sang tỉnh thành khác -->
        <div class="replan-option-card" @click="$emit('change-province')">
          <div class="roc-icon"><AppIcon name="pin" :size="22" /></div>
          <div class="roc-text">
            <h4>Khám phá tỉnh thành khác</h4>
            <p>Chọn các điểm đến hấp dẫn khác như Huế, Đà Nẵng, Hội An, Quy Nhơn, Nha Trang...</p>
          </div>
          <span class="roc-arrow">➔</span>
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
  }
})

defineEmits(['close', 'edit-params', 'ai-new-plan', 'change-province'])
</script>
