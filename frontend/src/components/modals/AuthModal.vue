<template>
  <transition name="auth-fade">
    <div v-if="modelValue" class="modal-overlay auth-overlay-glass" @click.self="close">
      <div class="modal-card auth-card-glass" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>{{ isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập' }}</h3>
          <button type="button" class="close-modal-btn" @click="close" aria-label="Đóng">
            <AppIcon name="x" :size="16" />
          </button>
        </div>

        <div class="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="!isRegister"
            :class="['auth-tab', { active: !isRegister }]"
            @click="isRegister = false"
          >
            Đăng nhập
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="isRegister"
            :class="['auth-tab', { active: isRegister }]"
            @click="isRegister = true"
          >
            Đăng ký
          </button>
        </div>

        <form class="auth-form-body" @submit.prevent="handleSubmit">
          <div v-if="isRegister" class="app-field">
            <label>Họ và tên</label>
            <input
              v-model="form.name"
              type="text"
              class="app-input"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div class="app-field">
            <label>Email hoặc Tên đăng nhập</label>
            <input
              v-model="form.email"
              type="text"
              class="app-input"
              placeholder="name@example.com hoặc admin"
              required
            />
          </div>

          <div class="app-field">
            <label>Mật khẩu</label>
            <input
              v-model="form.password"
              type="password"
              class="app-input"
              placeholder="Tối thiểu 6 ký tự"
              required
            />
          </div>

          <p v-if="errorMessage" class="auth-error-msg" role="alert">{{ errorMessage }}</p>

          <button type="submit" class="app-primary-btn auth-submit-btn" :disabled="loading">
            <span v-if="loading" class="btn-spinner"></span>
            <span>{{ isRegister ? 'Tạo tài khoản' : 'Đăng nhập' }}</span>
          </button>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import api from '../../services/api'
import AppIcon from '../common/AppIcon.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialRegisterMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'login-success'])

const isRegister = ref(props.initialRegisterMode)
const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: ''
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    errorMessage.value = ''
    isRegister.value = props.initialRegisterMode
  }
})

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true

  try {
    const endpoint = isRegister.value ? '/auth/register' : '/auth/login'
    const payload = isRegister.value
      ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
      : { email: form.email.trim(), password: form.password }

    const res = await api.post(endpoint, payload)
    emit('login-success', res.data)
    close()
  } catch (err) {
    errorMessage.value = err?.response?.data?.error || err.message || 'Xác thực thất bại'
  } finally {
    loading.value = false
  }
}
</script>
