<template>
  <div v-if="isOpen" class="modal-overlay save-confirm-overlay" @click.self="$emit('cancel')">
    <div class="modal-card save-confirm-card" role="dialog" aria-modal="true" :aria-label="title">
      <div class="scm-icon-ring" :style="iconStyle">
        <AppIcon name="save" :size="28" />
      </div>
      <h3>{{ title }}</h3>
      <p v-html="message"></p>
      <div class="scm-actions">
        <button type="button" class="scm-btn scm-btn-save" @click="$emit('save')">
          <AppIcon name="check" :size="16" style="margin-right: 6px; vertical-align: -2px;" />
          {{ saveText }}
        </button>
        <button type="button" class="scm-btn scm-btn-discard" @click="$emit('discard')">
          <AppIcon :name="discardIcon" :size="16" style="margin-right: 6px; vertical-align: -2px;" />
          {{ discardText }}
        </button>
        <button type="button" class="scm-btn scm-btn-cancel" @click="$emit('cancel')">
          <AppIcon name="x" :size="16" style="margin-right: 6px; vertical-align: -2px;" />
          {{ cancelText }}
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
  title: {
    type: String,
    default: 'Lưu lịch trình?'
  },
  message: {
    type: String,
    default: ''
  },
  saveText: {
    type: String,
    default: 'Lưu lịch trình'
  },
  discardText: {
    type: String,
    default: 'Bỏ qua, không lưu'
  },
  discardIcon: {
    type: String,
    default: 'trash2'
  },
  cancelText: {
    type: String,
    default: 'Ở lại trang này'
  },
  iconStyle: {
    type: [Object, String],
    default: () => ({})
  }
})

defineEmits(['save', 'discard', 'cancel'])
</script>
