<template>
  <Teleport to="body">
    <div v-if="isOpen" class="ticket-modal-overlay" @click.self="$emit('close')">
      <div class="ticket-modal-wrapper">
        <!-- Nút đóng nhanh độc lập phía trên máy in -->
        <button
          type="button"
          class="ticket-close-btn"
          @click="$emit('close')"
          title="Đóng (Esc)"
          aria-label="Đóng cửa sổ máy in vé"
        >
          ✕
        </button>

        <!-- KHE MÁY IN VÉ (PRINTER OUTPUT SLOT CÓ LED NEON) -->
        <div class="output">
          <div class="wrap-colors-1"><div class="bg-colors"></div></div>
          <div class="wrap-colors-2"><div class="bg-colors"></div></div>
          <div class="cover"></div>
          <!-- Vệt bóng tối từ khe in hắt xuống tờ vé như hình 2 -->
          <div class="slot-shadow"></div>
        </div>

        <!-- KHU VỰC VÉ IN VÀ HIỆU ỨNG 3D FLIP -->
        <div class="area">
          <div class="area-wrapper">
            <div class="ticket-mask" :class="{ 'is-printed': isPrinted }">
              <div class="ticket" :key="animationKey">
                <div
                  class="ticket-flip-container"
                  :class="{ 'is-flipped': isFlipped }"
                  @click="isFlipped = !isFlipped"
                  title="Nhấp hoặc rê chuột để lật mặt vé"
                >
                  <div class="float" :class="{ 'can-float': isPrinted }">
                    <!-- MẶT TRƯỚC: LỊCH TRÌNH ĐÃ ĐƯỢC LƯU -->
                    <div class="front">
                      <div class="ticket-body">
                        <div class="reflex"></div>

                        <header>
                          <div class="ticket-name">
                            <span class="bold">DIGITAL</span>
                            <span>PASS</span>
                          </div>
                          <div class="ticket-brand">TRAVEL MIỀN TRUNG</div>
                          <div class="barcode"></div>
                        </header>

                        <div class="contents">
                          <div class="event">
                            <div class="event-badge">✨ THÔNG BÁO XÁC NHẬN</div>
                            <div class="event-title">LỊCH TRÌNH CỦA BẠN</div>
                            <div class="event-subtitle">ĐÃ ĐƯỢC LƯU THÀNH CÔNG!</div>
                            <p class="event-desc">
                              Chuyến đi <b>{{ destination || 'Miền Trung' }}</b> đã được lưu vào hệ thống.
                            </p>
                          </div>

                          <div class="ticket-bottom-bar">
                            <div class="number">#TRIP-2026</div>
                            <div class="flip-hint-tag">
                              <span>Lật mặt sau ↻</span>
                            </div>
                          </div>

                          <div class="qrcode">
                            <svg viewBox="0 0 100 100" width="60" height="60" fill="#0f766e">
                              <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" />
                              <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" />
                              <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" />
                              <rect x="50" y="50" width="8" height="8" />
                              <rect x="62" y="50" width="8" height="8" />
                              <rect x="74" y="50" width="8" height="8" />
                              <rect x="86" y="50" width="8" height="8" />
                              <rect x="50" y="62" width="8" height="8" />
                              <rect x="74" y="62" width="8" height="8" />
                              <rect x="50" y="74" width="8" height="8" />
                              <rect x="62" y="74" width="8" height="8" />
                              <rect x="86" y="74" width="8" height="8" />
                              <rect x="50" y="86" width="8" height="8" />
                              <rect x="74" y="86" width="8" height="8" />
                              <rect x="86" y="86" width="8" height="8" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- MẶT SAU: LỜI CẢM ƠN ĐÃ TIN TƯỞNG TRAVEL MIỀN TRUNG -->
                    <div class="back">
                      <div class="ticket-body ticket-back">
                        <div class="reflex"></div>

                        <header>
                          <div class="ticket-name">
                            <span class="bold">THANK</span>
                            <span>YOU</span>
                          </div>
                          <div class="ticket-brand">TRAVEL MIỀN TRUNG</div>
                          <div class="ticket-time">{{ new Date().toLocaleDateString('vi-VN') }}</div>
                        </header>

                        <div class="contents contents-back">
                          <div class="event-back">
                            <div class="heart-icon">💖</div>
                            <div class="thanks-title">CẢM ƠN BẠN ĐÃ TIN TƯỞNG</div>
                            <div class="thanks-brand">TRAVEL MIỀN TRUNG!</div>
                            <p class="thanks-msg">
                              Chúc bạn và người thân có một hành trình khám phá Miền Trung ngập tràn niềm vui và những kỷ niệm khó quên.
                            </p>
                          </div>

                          <div class="ticket-back-actions" @click.stop>
                            <button type="button" class="btn-view-trips" @click="$emit('goMyTrips')">
                              🎒 Xem Trong Chuyến Đi Đã Lưu
                            </button>
                            <button type="button" class="btn-close-ticket" @click="$emit('close')">
                              Tiếp tục xem lịch trình
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  destination: {
    type: String,
    default: ''
  }
})

defineEmits(['close', 'goMyTrips'])

const isFlipped = ref(false)
const isPrinted = ref(false)
const animationKey = ref(0)
let printTimer = null

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      animationKey.value++
      isFlipped.value = false
      isPrinted.value = false
      document.body.classList.add('ticket-modal-open')

      if (printTimer) clearTimeout(printTimer)
      // Sau 2.6s mô-tơ máy in hoàn tất in vé, mở overflow để float & flip 3D mượt mà
      printTimer = setTimeout(() => {
        isPrinted.value = true
      }, 2600)
    } else {
      document.body.classList.remove('ticket-modal-open')
      if (printTimer) clearTimeout(printTimer)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  document.body.classList.remove('ticket-modal-open')
  if (printTimer) clearTimeout(printTimer)
})
</script>

<style scoped>
/* ==================== OVERLAY & MODAL WRAPPER ==================== */
.ticket-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInModal 0.25s ease;
}

@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}

:global(body.ticket-modal-open) {
  overflow: hidden !important;
}

.ticket-modal-wrapper {
  position: relative;
  width: 100%;
  max-width: 440px;
  height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  margin-top: 30px;
}

/* NÚT ĐÓNG X ĐỘC LẬP TRÊN NỀN TỐI (KHÔNG BỊ ĐÈ LÊN KHE IN) */
.ticket-close-btn {
  position: absolute;
  top: -50px;
  right: 15px;
  z-index: 100;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #ffffff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.ticket-close-btn:hover {
  background: rgba(239, 68, 68, 0.88);
  border-color: rgba(239, 68, 68, 0.95);
  transform: scale(1.1) rotate(90deg);
}

/* ==================== KHE MÁY IN VÉ (PRINTER OUTPUT SLOT) ==================== */
.output {
  align-self: center;
  background: #101216;
  border-radius: 100px;
  padding: 0 12px 0 10px;
  height: 36px;
  width: 350px;
  position: relative;
  z-index: 30;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
}

.output .cover {
  position: absolute;
  top: 2px;
  right: 2px;
  bottom: 2px;
  left: 2px;
  border-radius: 100px;
  clip-path: inset(0 0 0 0 round 100px);
  background: #101216;
  transition: filter 1000ms cubic-bezier(0, 0, 0, 1);
  filter: blur(5px);
  z-index: 2;
}

.output .cover::after {
  content: "";
  top: -10px;
  right: -10px;
  bottom: -10px;
  left: -10px;
  border-radius: 100px;
  position: absolute;
  background: inherit;
  opacity: 0.5;
}

.output .wrap-colors-1,
.output .wrap-colors-2 {
  overflow: hidden;
  border-radius: 100px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.output .wrap-colors-1 {
  opacity: 0.45;
  filter: blur(3px);
}

.output .wrap-colors-2 {
  opacity: 0.85;
}

.output .bg-colors {
  background: conic-gradient(
    transparent 0deg,
    #8400ff 65deg,
    #00ccff 144deg,
    #1356b4 180deg,
    transparent 324deg,
    transparent 360deg
  );
  position: absolute;
  width: 400px;
  height: 400px;
  margin: auto;
  inset: 0;
  left: 50%;
  transform: translateX(-50%) rotate(220deg);
  border-radius: 50%;
  animation: cycle-rotate 3s ease-in-out infinite;
}

.output::before {
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: inherit;
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  opacity: 0.5;
  z-index: 3;
}

.output::after {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  top: 13px;
  background: linear-gradient(0deg, transparent, black);
  height: 10px;
  mix-blend-mode: soft-light;
  border-radius: 100px;
  z-index: 5;
}

/* Vệt bóng tối từ khe in hắt xuống giấy (đặc trưng như hình 2) */
.output .slot-shadow {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: -18px;
  height: 20px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
  z-index: 35;
  pointer-events: none;
  border-radius: 0 0 10px 10px;
}

@keyframes cycle-rotate {
  from { transform: translateX(-50%) rotate(0deg); }
  to { transform: translateX(-50%) rotate(360deg); }
}

/* ==================== KHU VỰC VÉ & HIỆU ỨNG IN ==================== */
.area {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  top: -18px;
  z-index: 20;
}

.area-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.ticket-mask {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  perspective: 1200px;
  width: 380px;
  padding-top: 2px;
  padding-bottom: 24px;
  mask-image: linear-gradient(rgba(0, 0, 0, 0.1) 0%, white 14px);
  -webkit-mask-image: linear-gradient(rgba(0, 0, 0, 0.1) 0%, white 14px);
}

.ticket-mask.is-printed {
  overflow: visible;
  mask-image: none;
  -webkit-mask-image: none;
}

.ticket {
  animation: ticket-print-feed 2.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  perspective: 2500px;
}

/* HIỆU ỨNG MÔ TƠ BƯỚC IN VÉ THEO TỪNG NHỊP (CHUI TỪ KHE RA NHƯ HÌNH 2) */
@keyframes ticket-print-feed {
  /* 0%: Giấu hoàn toàn bên trong khe máy in */
  0% {
    transform: translateY(-370px);
  }

  /* Nhịp in 1: Nhô đáy vé răng cưa + QR ra khỏi khe (y hệt hình 2) */
  9% {
    transform: translateY(-295px);
  }
  15% {
    transform: translateY(-295px);
  }

  /* Nhịp in 2: Đẩy tiếp mã #TRIP-2026 và tag gợi ý lật mặt sau */
  23% {
    transform: translateY(-220px);
  }
  29% {
    transform: translateY(-220px);
  }

  /* Nhịp in 3: Đẩy tiếp phần chi tiết chuyến đi */
  40% {
    transform: translateY(-140px);
  }
  46% {
    transform: translateY(-140px);
  }

  /* Nhịp in 4: Đẩy tiếp tiêu đề "LỊCH TRÌNH CỦA BẠN ĐÃ ĐƯỢC LƯU" */
  58% {
    transform: translateY(-55px);
  }
  64% {
    transform: translateY(-55px);
  }

  /* Nhịp in 5: Toàn bộ đầu vé thoát khỏi khe máy in */
  78% {
    transform: translateY(18px);
  }
  86% {
    transform: translateY(12px); /* Nhún nẩy cơ học nhẹ của giấy khi ra khỏi lô cuốn */
  }
  94% {
    transform: translateY(16px);
  }
  100% {
    transform: translateY(16px);
  }
}

.ticket:hover .ticket-flip-container,
.ticket-flip-container.is-flipped {
  transform: rotateY(180deg);
}

.ticket-flip-container {
  transition: transform 0.75s cubic-bezier(0.19, 1, 0.22, 1);
  transform-style: preserve-3d;
  position: relative;
  cursor: pointer;
}

.float {
  transform-style: preserve-3d;
}

.float.can-float {
  animation: floatTicket 3.5s ease-in-out infinite;
}

@keyframes floatTicket {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.front,
.back {
  display: block;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
}

.front {
  z-index: 2;
}

.back {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotateY(-180deg);
  z-index: 1;
}

/* THÂN VÉ */
.ticket-body {
  display: block;
  position: relative;
  width: 345px;
  min-height: 360px;
  border-radius: 12px 12px 0px 0px;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 60%, #ccfbf1 100%);
  color: #0f172a;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65), 0 0 1px rgba(0, 0, 0, 0.15);
  overflow: visible;
}

/* ĐÁY VÉ CẮT RĂNG CƯA TAM GIÁC SẮC NÉT (NHƯ HÌNH 2) */
.ticket-body::after {
  content: "";
  display: block;
  position: absolute;
  bottom: -14px;
  left: 0;
  background:
    -webkit-linear-gradient(-135deg, #ccfbf1 50%, transparent 50%) 0 50%,
    -webkit-linear-gradient(-45deg, #ccfbf1 50%, transparent 50%) 0 50%,
    transparent;
  background:
    linear-gradient(315deg, #ccfbf1 50%, transparent 50%) 0 50%,
    linear-gradient(45deg, #ccfbf1 50%, transparent 50%) 0 50%,
    transparent;
  background-repeat: repeat-x;
  background-size: 14px 14px;
  height: 14px;
  width: 100%;
  pointer-events: none;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.12));
}

.ticket-body header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 12px 14px;
  border-bottom: 1.5px dashed rgba(15, 23, 42, 0.2);
  height: 52px;
  position: relative;
  text-align: left;
}

/* Hai lỗ khuyết tròn hai bên mép vé */
.ticket-body header::after,
.ticket-body header::before {
  content: "";
  display: block;
  width: 14px;
  height: 14px;
  background-color: #0a0f1d;
  position: absolute;
  border-radius: 50%;
  z-index: 12;
  bottom: -7px;
}
.ticket-body header::before { left: -7px; }
.ticket-body header::after { right: -7px; }

.ticket-name {
  font-size: 0.86rem;
  letter-spacing: -0.3px;
  display: flex;
  gap: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}
.ticket-name .bold { font-weight: 900; color: #0284c7; }

.ticket-brand {
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #0d9488;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.ticket-time {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

.barcode {
  display: inline-block;
  height: 20px;
  width: 50px;
  flex-shrink: 0;
  background: repeating-linear-gradient(
    90deg,
    #0f172a 0px 2px,
    transparent 2px 4px,
    #0f172a 4px 5px,
    transparent 5px 8px,
    #0f172a 8px 11px,
    transparent 11px 13px,
    #0f172a 13px 16px,
    transparent 16px 17px,
    #0f172a 17px 20px
  );
}

.contents {
  display: flex;
  flex-direction: column;
  padding: 16px 18px 20px;
  min-height: 290px;
  position: relative;
}

.event {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  margin-top: 4px;
}

.event-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #0d9488;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.event-title {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.event-subtitle {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0d9488;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 12px;
}

.event-desc {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.ticket-bottom-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-right: 72px;
}

.number {
  font-size: 1.05rem;
  font-weight: 900;
  color: #0284c7;
  white-space: nowrap;
}

.flip-hint-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: #0d9488;
  background: rgba(13, 148, 136, 0.12);
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  animation: pulseHint 2s infinite ease-in-out;
}

@keyframes pulseHint {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.qrcode {
  position: absolute;
  right: 14px;
  bottom: 24px;
}

/* NỘI DUNG VÉ MẶT SAU */
.contents-back {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.heart-icon {
  font-size: 2.2rem;
  margin: 6px 0 2px;
  animation: pulseHint 1.8s infinite ease-in-out;
}

.thanks-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.thanks-brand {
  font-size: 1.3rem;
  font-weight: 900;
  color: #0d9488;
  letter-spacing: -0.5px;
  margin-bottom: 10px;
}

.thanks-msg {
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 14px 0;
  padding: 0 6px;
}

.ticket-back-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: auto;
}

.btn-view-trips {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
  transition: all 0.2s;
}

.btn-view-trips:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.5);
}

.btn-close-ticket {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.2);
  color: #475569;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-close-ticket:hover {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
}

/* ÁNH SÁNG KÍNH PHẢN CHIẾU */
.reflex {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 10;
}

.reflex::before {
  content: "";
  position: absolute;
  width: 250px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.45) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  top: -20%;
  bottom: -20%;
  left: -120%;
  transform: skewX(-25deg);
  transition: all 0.7s ease;
}

.ticket:hover .reflex::before {
  transform: translateX(370px) skewX(-25deg);
}
</style>
