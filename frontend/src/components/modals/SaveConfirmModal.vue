<template>
  <div
    v-if="isOpen"
    class="modal-overlay save-confirm-overlay"
    @click.self="$emit('cancel')"
    tabindex="-1"
  >
    <div class="wheel-modal-standalone">
      <!-- DÒNG HƯỚNG DẪN PULSE TRÊN ĐỈNH THẺ -->
      <div class="hint-pop">CHẠM ĐỂ XOAY · DOUBLE CLICK ĐỂ CHỌN</div>

      <!-- DUY NHẤT MỘT THẺ CAPSULE BÁNH XOAY CƠ HỌC THẬT TO -->
      <div
        class="radio-input"
        :class="['state-' + selectedOption, { 'is-confirmed': isConfirming }]"
        @click="handleClick"
        @dblclick="handleDblClick"
        role="button"
        tabindex="0"
        aria-label="Bánh xoay lựa chọn: Chạm một lần để xoay, nhấp đúp để xác nhận"
        title="Chạm 1 lần để xoay nấc · Nhấp đúp (Double-click) để xác nhận chọn"
      >
        <div class="glass-overlay"></div>

        <!-- NẤC 01: LƯU LẠI -->
        <input
          type="radio"
          id="scm-val-1"
          name="scm-decision"
          value="value-1"
          :checked="selectedOption === 'value-1'"
        />
        <div
          class="wheel-label"
          :class="{ 'is-active': selectedOption === 'value-1' }"
          style="--angle: -26deg"
        >
          <span class="num">01</span>
          <span class="label">LƯU LẠI</span>
        </div>

        <!-- NẤC 02: BỎ QUA -->
        <input
          type="radio"
          id="scm-val-2"
          name="scm-decision"
          value="value-2"
          :checked="selectedOption === 'value-2'"
        />
        <div
          class="wheel-label"
          :class="{ 'is-active': selectedOption === 'value-2' }"
          style="--angle: 0deg"
        >
          <span class="num">02</span>
          <span class="label">BỎ QUA</span>
        </div>

        <!-- NẤC 03: Ở LẠI -->
        <input
          type="radio"
          id="scm-val-3"
          name="scm-decision"
          value="value-3"
          :checked="selectedOption === 'value-3'"
        />
        <div
          class="wheel-label"
          :class="{ 'is-active': selectedOption === 'value-3' }"
          style="--angle: 26deg"
        >
          <span class="num">03</span>
          <span class="label">Ở LẠI</span>
        </div>
      </div>

      <!-- DÒNG GỢI Ý ĐÓNG POPUP PHÍA DƯỚI -->
      <div class="wheel-dismiss-hint" @click="$emit('cancel')">
        <span>✕ Bấm ra ngoài để đóng</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Lưu lịch trình trước khi rời đi?'
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
    default: 'alertcircle'
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

const emit = defineEmits(['save', 'discard', 'cancel'])

// Nấc mặc định là 01 (LƯU LẠI)
const selectedOption = ref('value-1')
const isConfirming = ref(false)

// Reset về nấc 01 mỗi khi mở modal
watch(() => props.isOpen, (open) => {
  if (open) {
    selectedOption.value = 'value-1'
    isConfirming.value = false
  }
})

// Xoay sang nấc tiếp theo (01 -> 02 -> 03 -> 01)
const rotateNext = () => {
  if (selectedOption.value === 'value-1') {
    selectedOption.value = 'value-2'
  } else if (selectedOption.value === 'value-2') {
    selectedOption.value = 'value-3'
  } else {
    selectedOption.value = 'value-1'
  }
}

// Xoay ngược nấc
const rotatePrev = () => {
  if (selectedOption.value === 'value-1') {
    selectedOption.value = 'value-3'
  } else if (selectedOption.value === 'value-2') {
    selectedOption.value = 'value-1'
  } else {
    selectedOption.value = 'value-2'
  }
}

// Phân biệt Single Click (xoay nấc) và Double Click (xác nhận)
let clickTimer = null
let clickCount = 0

const handleClick = () => {
  clickCount++
  if (clickCount === 1) {
    clickTimer = setTimeout(() => {
      // Nhấp 1 lần: Xoay sang nấc tiếp theo
      rotateNext()
      clickCount = 0
    }, 240)
  } else if (clickCount >= 2) {
    // Nhấp đúp: Hủy xoay, thực hiện xác nhận
    if (clickTimer) clearTimeout(clickTimer)
    clickCount = 0
    thucHienHanhDong()
  }
}

const handleDblClick = () => {
  if (clickTimer) clearTimeout(clickTimer)
  clickCount = 0
  thucHienHanhDong()
}

// Thực hiện hành động theo nấc đang chọn
const thucHienHanhDong = () => {
  if (isConfirming.value) return
  isConfirming.value = true

  // Hiệu ứng phát sáng & nhún nhẹ khi nhấp đúp xác nhận
  setTimeout(() => {
    if (selectedOption.value === 'value-1') {
      emit('save')
    } else if (selectedOption.value === 'value-2') {
      emit('discard')
    } else {
      emit('cancel')
    }
    isConfirming.value = false
  }, 180)
}

// Hỗ trợ phím tắt (Enter/Space để xác nhận, Mũi tên để xoay, Escape để đóng)
const handleKeyDown = (e) => {
  if (!props.isOpen) return
  if (e.key === 'Escape') {
    emit('cancel')
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    thucHienHanhDong()
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault()
    rotateNext()
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault()
    rotatePrev()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* ==================== MODAL OVERLAY ==================== */
.save-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 6, 12, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  animation: fadeInOverlay 0.25s ease-out;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* KHỐI TRUNG TÂM KHÔNG CẦN VIỀN THẺ BAO BỌC RƯỜM RÀ */
.wheel-modal-standalone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: popScale 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

@keyframes popScale {
  from {
    transform: scale(0.9) translateY(16px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* ==================== DÒNG GỢI Ý PULSE TRÊN ĐỈNH ==================== */
.hint-pop {
  font-family: "Be Vietnam Pro", sans-serif;
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 2px;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 14px;
  animation: pulseHint 2s infinite ease-in-out;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

@keyframes pulseHint {
  0%, 100% {
    opacity: 0.85;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
    color: #e2e8f0;
  }
}

/* ==================== THẺ CAPSULE BÁNH XOAY THẬT TO ==================== */
.radio-input {
  --accent: #10b981;
  position: relative;
  /* Kích thước to tương đương kích thước thẻ ban đầu */
  height: 380px;
  width: 340px;
  max-width: 90vw;
  background: #111113;
  border: 2px solid #333338;
  border-radius: 36px;
  overflow: hidden;
  display: flex;
  align-items: center;
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.75),
    inset 0 0 16px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  cursor: pointer;
  outline: none;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}

.radio-input:hover {
  border-color: #4a4a52;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.85),
    inset 0 0 16px rgba(0, 0, 0, 0.9),
    0 0 25px rgba(255, 255, 255, 0.06);
}

/* Đổi màu Laser Dot và viền theo từng nấc */
.radio-input.state-value-1 {
  --accent: #10b981; /* Xanh lục Emerald - Lưu lại */
}

.radio-input.state-value-2 {
  --accent: #ff3e3e; /* Đỏ Crimson - Bỏ qua */
}

.radio-input.state-value-3 {
  --accent: #60a5fa; /* Xanh Sky Blue - Ở lại */
}

/* HIỆU ỨNG KHI DOUBLE CLICK XÁC NHẬN */
.radio-input.is-confirmed {
  transform: scale(0.96);
  border-color: var(--accent);
  box-shadow:
    0 0 45px var(--accent),
    0 20px 60px rgba(0, 0, 0, 0.9),
    inset 0 0 24px var(--accent);
}

/* HỌA TIẾT BÁNH RĂNG XOAY NỬA PHẢI (CONIC GRADIENT WHEEL) */
.radio-input::after {
  content: "";
  position: absolute;
  right: -240px;
  width: 480px;
  height: 480px;
  background: repeating-conic-gradient(
    from 0deg,
    #1d1d20 0deg 9deg,
    #252528 9deg 18deg
  );
  border-radius: 50%;
  z-index: 1;
  opacity: 0.55;
  pointer-events: none;
}

/* ĐÈN LASER ĐIỂM DỪNG BÊN TRÁI */
.radio-input::before {
  content: "";
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  width: 9px;
  height: 9px;
  background: var(--accent);
  border-radius: 50%;
  z-index: 30;
  box-shadow:
    0 0 16px var(--accent),
    0 0 32px var(--accent);
  pointer-events: none;
  transition: background 0.35s ease, box-shadow 0.35s ease;
}

.radio-input input {
  display: none;
}

/* LỚP PHỦ ÁNH SÁNG KÍNH (GLASS OVERLAY) */
.glass-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  z-index: 25;
  pointer-events: none;
}

/* ==================== CÁC NHÃN LỰA CHỌN TRÊN BÁNH XOAY ==================== */
.wheel-label {
  position: absolute;
  left: 56px;
  display: flex;
  flex-direction: column;
  transition: all 0.7s cubic-bezier(0.19, 1, 0.22, 1);
  transform-origin: 400px center;
  transform: rotate(var(--angle));
  filter: blur(2.5px);
  opacity: 0.14;
  z-index: 5;
  pointer-events: none;
}

.wheel-label .num {
  font-family: "Be Vietnam Pro", sans-serif;
  font-weight: 900;
  font-size: 0.95rem;
  color: var(--accent);
  margin-bottom: -4px;
  transition: color 0.35s ease;
}

.wheel-label .label {
  font-family: "Be Vietnam Pro", sans-serif;
  font-weight: 900;
  font-size: 2.85rem;
  color: #fff;
  letter-spacing: -1.2px;
  text-transform: uppercase;
  white-space: nowrap;
}

/* GÓC XOAY THEO NẤC ĐANG CHỌN */
.radio-input.state-value-1 .wheel-label {
  transform: rotate(calc(var(--angle) + 26deg));
}

.radio-input.state-value-2 .wheel-label {
  transform: rotate(calc(var(--angle) + 0deg));
}

.radio-input.state-value-3 .wheel-label {
  transform: rotate(calc(var(--angle) - 26deg));
}

/* NẤC ĐANG ACTIVE Ở CHÍNH GIỮA */
.wheel-label.is-active {
  opacity: 1;
  filter: blur(0);
  transform: rotate(0deg) translateX(14px) !important;
  z-index: 10;
}

.wheel-label.is-active .label {
  text-shadow:
    0 0 25px rgba(255, 255, 255, 0.35),
    0 0 50px rgba(255, 255, 255, 0.15);
}

/* ==================== DÒNG GỢI Ý ĐÓNG ==================== */
.wheel-dismiss-hint {
  font-family: "Be Vietnam Pro", sans-serif;
  margin-top: 18px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 6px 12px;
  border-radius: 8px;
}

.wheel-dismiss-hint:hover {
  color: #cbd5e1;
}
</style>
