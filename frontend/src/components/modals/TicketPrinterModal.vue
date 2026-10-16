<template>
  <div v-if="isOpen" class="ticket-modal-overlay" @click.self="$emit('close')">
    <div class="ticket-modal-wrapper">
      <!-- Nút đóng nhanh -->
      <button type="button" class="ticket-close-btn" @click="$emit('close')" title="Đóng">
        ✕
      </button>

      <!-- KHE MÁY IN VÉ (PRINTER OUTPUT SLOT) -->
      <div class="output">
        <div class="wrap-colors-1"><div class="bg-colors"></div></div>
        <div class="wrap-colors-2"><div class="bg-colors"></div></div>
        <div class="cover"></div>
      </div>

      <!-- KHU VỰC VÉ IN VÀ HIỆU ỨNG 3D FLIP -->
      <div class="area">
        <div class="area-wrapper">
          <div class="ticket-mask">
            <div class="ticket">
              <div
                class="ticket-flip-container"
                :class="{ 'is-flipped': isFlipped }"
                @click="isFlipped = !isFlipped"
                title="Nhấp hoặc rê chuột để lật mặt vé"
              >
                <div class="float">
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
                          <svg viewBox="0 0 100 100" width="64" height="64" fill="#1e293b">
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
                    <div class="ticket-body">
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
                            Xem chuyến đi của tôi ↗
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
</template>

<script setup>
import { ref } from 'vue'

defineProps({
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
</script>

<style scoped>
/* ==================== OVERLAY & MODAL WRAPPER ==================== */
.ticket-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInModal 0.3s ease;
}

@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ticket-modal-wrapper {
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
}

.ticket-close-btn {
  position: absolute;
  top: -10px;
  right: 15px;
  z-index: 100;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.ticket-close-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  transform: scale(1.08);
}

/* ==================== KHE MÁY IN VÉ (OUTPUT SLOT) ==================== */
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
}

.output .wrap-colors-1 {
  opacity: 0.35;
  filter: blur(3px);
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: #ffffff14;
  opacity: 0.4;
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
  height: 440px;
  top: -18px;
}

.ticket-mask {
  position: relative;
  overflow: visible;
  display: flex;
  justify-content: center;
  perspective: 1200px;
}

.ticket {
  animation: ticket-print-feed 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  perspective: 2500px;
}

@keyframes ticket-print-feed {
  0% { transform: translateY(-240px); opacity: 0; }
  15% { transform: translateY(-190px); opacity: 1; }
  35% { transform: translateY(-130px); }
  55% { transform: translateY(-70px); }
  75% { transform: translateY(-15px); }
  100% { transform: translateY(10px); opacity: 1; }
}

.ticket:hover .ticket-flip-container,
.ticket-flip-container.is-flipped {
  transform: rotateY(180deg);
}

.ticket-flip-container {
  transition: transform 0.7s cubic-bezier(0.19, 1, 0.22, 1);
  transform-style: preserve-3d;
  position: relative;
  cursor: pointer;
}

.float {
  transform-style: preserve-3d;
  animation: floatTicket 3.5s ease-in-out infinite;
}

@keyframes floatTicket {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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
  width: 320px;
  min-height: 360px;
  border-radius: 12px 12px 0px 0px;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 60%, #ccfbf1 100%);
  color: #0f172a;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65), 0 0 1px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.ticket-body::after {
  content: "";
  display: block;
  position: absolute;
  bottom: -16px;
  left: 0;
  background:
    radial-gradient(circle at 8px 0, transparent 8px, #ccfbf1 8.5px);
  background-size: 16px 16px;
  height: 16px;
  width: 100%;
}

.ticket-body header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1.5px dashed rgba(15, 23, 42, 0.2);
  height: 52px;
  position: relative;
  background: rgba(255, 255, 255, 0.7);
}

.ticket-body header::before,
.ticket-body header::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  background: #101216;
  border-radius: 50%;
  bottom: -7px;
  z-index: 10;
}
.ticket-body header::before { left: -7px; }
.ticket-body header::after { right: -7px; }

.ticket-name {
  font-size: 0.95rem;
  letter-spacing: -0.5px;
  display: flex;
  gap: 4px;
}
.ticket-name .bold { font-weight: 900; color: #0284c7; }

.ticket-brand {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #0d9488;
  text-transform: uppercase;
}

.ticket-time {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
}

.barcode {
  display: inline-block;
  height: 22px;
  width: 60px;
  background: repeating-linear-gradient(
    90deg,
    #0f172a 0px 2px,
    transparent 2px 4px,
    #0f172a 4px 5px,
    transparent 5px 8px,
    #0f172a 8px 11px
  );
}

/* NỘI DUNG VÉ MẶT TRƯỚC */
.contents {
  padding: 18px 18px 26px;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 290px;
}

.event-badge {
  font-size: 0.7rem;
  font-weight: 800;
  color: #059669;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.event-title {
  font-size: 1.18rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.event-subtitle {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0d9488;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}

.event-desc {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.45;
  margin: 0 0 16px 0;
}

.ticket-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-right: 75px;
}

.number {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0284c7;
}

.flip-hint-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: #0d9488;
  background: rgba(13, 148, 136, 0.12);
  padding: 3px 8px;
  border-radius: 20px;
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
  transform: translateX(320px) skewX(-25deg);
}
</style>
