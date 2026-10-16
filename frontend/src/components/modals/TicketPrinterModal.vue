<template>
  <Teleport to="body">
    <div v-if="isOpen" class="ticket-modal-overlay" @click.self="$emit('close')">
      <!-- Nút đóng X độc lập góc trên màn hình -->
      <button
        type="button"
        class="modal-close-btn"
        @click="$emit('close')"
        title="Đóng (Esc)"
        aria-label="Đóng cửa sổ máy in vé"
      >
        ✕
      </button>

      <div class="printer-stage">
        <!-- KHE MÁY IN VÉ (OUTPUT SLOT THEO ĐÚNG CODE GỐC) -->
        <div class="output">
          <div class="wrap-colors-1"><div class="bg-colors"></div></div>
          <div class="wrap-colors-2"><div class="bg-colors"></div></div>
          <div class="cover"></div>
        </div>

        <!-- KHU VỰC IN VÀ THÂN VÉ (THEO ĐÚNG NGUYÊN BẢN CODE GỐC) -->
        <div class="area">
          <div class="area-wrapper">
            <div class="ticket-mask">
              <div class="ticket" :key="animationKey">
                <div
                  class="ticket-flip-container"
                  :class="{ 'is-flipped': isFlipped }"
                  @click="isFlipped = !isFlipped"
                  title="Nhấp hoặc rê chuột để lật mặt vé"
                >
                  <div class="float">
                    <!-- MẶT TRƯỚC: LỊCH TRÌNH CỦA BẠN ĐÃ ĐƯỢC LƯU -->
                    <div class="front">
                      <div class="ticket-body">
                        <div class="reflex"></div>

                        <!-- KHỐI LẬP PHƯƠNG 3D SVG ISOMETRIC CUBE -->
                        <svg
                          class="icon-cube"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            style="--i: 1"
                            class="path-center"
                            d="M12 12.75L14.25 11.437M12 12.75L9.75 11.437M12 12.75V15"
                            stroke="black"
                            stroke-width="1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            style="--i: 2"
                            class="path-t"
                            d="M9.75 3.562L12 2.25L14.25 3.563"
                            stroke="black"
                            stroke-width="1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            style="--i: 3"
                            class="path-tr"
                            d="M21 7.5L18.75 6.187M21 7.5V9.75M21 7.5L18.75 8.813"
                            stroke="black"
                            stroke-width="1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            style="--i: 4"
                            class="path-br"
                            d="M21 14.25V16.5L18.75 17.813"
                            stroke="black"
                            stroke-width="1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            style="--i: 5"
                            class="path-b"
                            d="M12 21.75L14.25 20.437M12 21.75V19.5M12 21.75L9.75 20.437"
                            stroke="black"
                            stroke-width="1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            style="--i: 6"
                            class="path-bl"
                            d="M5.25 17.813L3 16.5V14.25"
                            stroke="black"
                            stroke-width="1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            style="--i: 7"
                            class="path-tl"
                            d="M3 7.5L5.25 6.187M3 7.5L5.25 8.813M3 7.5V9.75"
                            stroke="black"
                            stroke-width="1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                        </svg>

                        <header>
                          <div class="ticket-name">
                            <div>
                              <span style="--i: 1">D</span>
                              <span style="--i: 2">I</span>
                              <span style="--i: 3">G</span>
                              <span style="--i: 4">I</span>
                              <span style="--i: 5">T</span>
                              <span style="--i: 6">A</span>
                              <span style="--i: 7">L</span>
                            </div>
                            <div>
                              <span class="bold" style="--i: 8">P</span>
                              <span class="bold" style="--i: 9">A</span>
                              <span class="bold" style="--i: 10">S</span>
                              <span class="bold" style="--i: 11">S</span>
                            </div>
                          </div>

                          <div class="barcode"></div>
                        </header>

                        <div class="contents">
                          <div class="event">
                            <div>
                              <span class="bold">LỊCH TRÌNH</span>
                            </div>
                            <div>CỦA BẠN ĐÃ ĐƯỢC LƯU</div>
                          </div>

                          <div class="number">#001</div>

                          <div class="qrcode">
                            <svg viewBox="0 0 100 100" width="70" height="70" fill="#1e293b">
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
                            <div>
                              <span style="--i: 1">T</span>
                              <span style="--i: 2">R</span>
                              <span style="--i: 3">A</span>
                              <span style="--i: 4">V</span>
                              <span style="--i: 5">E</span>
                              <span style="--i: 6">L</span>
                            </div>
                            <b>
                              <span class="bold" style="--i: 7">P</span>
                              <span class="bold" style="--i: 8">A</span>
                              <span class="bold" style="--i: 9">S</span>
                              <span class="bold" style="--i: 10">S</span>
                            </b>
                          </div>

                          <time :datetime="new Date().toISOString()">
                            <span style="--i: 11" class="bold">{{ String(new Date().getDate()).padStart(2, '0') }}</span>
                            <span style="--i: 12" class="slash">/</span>
                            <span style="--i: 13">{{ String(new Date().getMonth() + 1).padStart(2, '0') }}</span>
                            <span style="--i: 14" class="slash">/</span>
                            <span style="--i: 15">{{ new Date().getFullYear() }}</span>
                          </time>
                        </header>

                        <div class="contents">
                          <div class="event" style="margin-top: -24px;">
                            <div>
                              <span class="bold" style="font-size: 1.6rem;">CẢM ƠN BẠN</span>
                            </div>
                            <div style="font-size: 11px; letter-spacing: 0.2em; color: #2f4c8b; margin-top: 6px;">
                              ĐÃ TIN TƯỞNG TRAVEL MIỀN TRUNG
                            </div>
                          </div>

                          <div class="qrcode">
                            <svg viewBox="0 0 100 100" width="120" height="120" fill="#2f4c8b">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- HIỆU ỨNG NOISE SVG -->
        <div class="noise">
          <svg height="100%" width="100%">
            <defs>
              <pattern
                height="500"
                width="500"
                patternUnits="userSpaceOnUse"
                id="noise-pattern"
              >
                <filter y="0" x="0" id="noise">
                  <feTurbulence
                    stitchTiles="stitch"
                    numOctaves="3"
                    baseFrequency="0.65"
                    type="fractalNoise"
                  ></feTurbulence>
                  <feBlend mode="screen"></feBlend>
                </filter>
                <rect filter="url(#noise)" height="500" width="500"></rect>
              </pattern>
            </defs>
            <rect fill="url(#noise-pattern)" height="100%" width="100%"></rect>
          </svg>
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

const emit = defineEmits(['close', 'goMyTrips'])

const isFlipped = ref(false)
const animationKey = ref(0)

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      animationKey.value++
      isFlipped.value = false
      document.body.classList.add('ticket-modal-open')
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.classList.remove('ticket-modal-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  document.body.classList.remove('ticket-modal-open')
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* ==================== MODAL OVERLAY ĐỂ CHE THANH MENU ==================== */
.ticket-modal-overlay {
  position: fixed;
  inset: 0;
  background: #0f1114;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
}

:global(body.ticket-modal-open) {
  overflow: hidden !important;
}

.modal-close-btn {
  position: fixed;
  top: 24px;
  right: 28px;
  z-index: 1000000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.85);
  border-color: rgba(239, 68, 68, 0.95);
  transform: scale(1.1);
}

.printer-stage {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ==================== ĐOẠN CODE GỐC CỦA TÁC GIẢ BẮT ĐẦU TỪ ĐÂY ==================== */
.output {
  align-self: center;
  background: inherit;
  border-radius: 100px;
  padding: 0 12px 0 10px;
  height: 36px;
  min-width: 350px;
  position: relative;
  top: -140px;
  z-index: 10;
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
  transition:
    opacity 400ms linear,
    background-color 400ms linear;
}

.output::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  top: 14px;
  background: linear-gradient(0deg, transparent, black);
  height: 9px;
  mix-blend-mode: soft-light;
  border-radius: 100px;
}

@keyframes cycle-opacity {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes cycle-rotate {
  from {
    transform: translateX(-50%) rotate(0deg);
  }
  to {
    transform: translateX(-50%) rotate(360deg);
  }
}

.area {
  --ease-elastic: cubic-bezier(0.5, 2, 0.3, 0.8);

  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  inset: 0;
}

.area .area-wrapper:hover .wrapper {
  transform: translateY(0) scale(1);
  box-shadow: 0 20px 50px -5px black;
}

.area::after {
  pointer-events: none;
  content: "";
  position: absolute;
  top: 66%;
  left: 0;
  right: 0;
  height: 100px;
  width: 30%;
  margin: auto;
  background-color: #648cc630;
  filter: blur(2em);
  opacity: 0.7;
  transform: perspective(10px) rotateX(5deg) scale(1, 0.5);
  z-index: 0;
}

.ticket-mask {
  position: absolute;
  overflow: hidden;
  display: flex;
  justify-content: center;
  mask-image: linear-gradient(rgba(0, 0, 0, 0.1) 0%, white 20px);
  -webkit-mask-image: linear-gradient(rgba(0, 0, 0, 0.1) 0%, white 20px);
  perspective: 1000px;
  top: calc(50% - 142px);
  left: 0;
  right: 0;
  height: 100%;
  min-height: 1500px;
}

.ticket {
  float: left;
  animation: ticket-move 11s ease-in-out infinite;
  transform: translateY(50px);
  perspective: 3000px;
}

@keyframes ticket-move {
  0% {
    transform: translateY(-300px);
  }
  7% {
    transform: translateY(-250px);
  }
  12% {
    transform: translateY(-200px);
  }
  16% {
    transform: translateY(-170px);
  }
  22% {
    transform: translateY(-100px);
  }
  27% {
    transform: translateY(-40px);
  }
  34%,
  88% {
    transform: translateY(45px);
  }
  100% {
    transform: translateY(100%) rotateX(160deg) scale(5);
  }
}

.ticket:nth-child(2) .ticket-body {
  transition-delay: 0.7s;
}

.ticket:hover .ticket-flip-container,
.ticket-flip-container.is-flipped {
  transform: rotateY(180deg);
}

.ticket-flip-container {
  transition: 0.6s;
  transform-style: preserve-3d;
  position: relative;
  cursor: pointer;
}

.float {
  transform-style: preserve-3d;
  pointer-events: none;
  animation: float 3s ease-in-out infinite;
}

.front,
.back {
  display: inline-block;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

.front {
  z-index: 1;
}

.back {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotateY(-180deg);
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0);
  }
}

.icon-cube {
  position: absolute;
  height: 110%;
  z-index: 1;
  top: -3px;
  left: 0;
  right: 0;
  margin: auto;
  mix-blend-mode: soft-light;
  opacity: 0.6;
}

.icon-cube path {
  animation-delay: calc(var(--i) * 100ms) !important;
  transform-origin: center;
}

.icon-cube .path-center {
  animation: path-center 3s ease-in-out infinite;
}

@keyframes path-center {
  50% {
    transform: scale(1.3);
  }
}

.icon-cube .path-t {
  animation: path-t 1.6s ease-in-out infinite;
}

@keyframes path-t {
  50% {
    transform: translateY(1px);
  }
}

.icon-cube .path-tl {
  animation: path-tl 1.6s ease-in-out infinite;
}

@keyframes path-tl {
  50% {
    transform: translateX(1px) translateY(1px);
  }
}

.icon-cube .path-tr {
  animation: path-tr 1.6s ease-in-out infinite;
}

@keyframes path-tr {
  50% {
    transform: translateX(-1px) translateY(1px);
  }
}

.icon-cube .path-br {
  animation: path-br 1.6s ease-in-out infinite;
}

@keyframes path-br {
  50% {
    transform: translateX(-1px) translateY(-1px);
  }
}

.icon-cube .path-bl {
  animation: path-bl 1.6s ease-in-out infinite;
}

@keyframes path-bl {
  50% {
    transform: translateX(1px) translateY(-1px);
  }
}

.icon-cube .path-b {
  animation: path-b 1.6s ease-in-out infinite;
}

@keyframes path-b {
  50% {
    transform: translateY(-1px);
  }
}

.ticket-body {
  display: block;
  position: relative;
  width: 320px;
  margin-bottom: 20px;
  padding: 0;
  border-radius: 7px 7px 0px 0px;
  background-color: white;
  text-align: center;
  background: linear-gradient(to bottom, white, #dcfffd);
  color: black;
}

.ticket-body svg,
.ticket-body img {
  pointer-events: none;
}

.ticket-body .bold {
  font-weight: 800;
}

.ticket-body header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 15px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.4);
  text-align: left;
  height: 54px;
}

.ticket-body header .ticket-name {
  font-weight: 300;
  font-size: 1.05em;
  line-height: normal;
  align-items: center;
  display: flex;
  gap: 4px;
  letter-spacing: -2px;
}

.ticket-body header span {
  display: inline-block;
}

.ticket-body header time {
  display: flex;
}

.ticket-body header .slash {
  padding: 0 1px;
  color: rgba(0, 0, 0, 0.4);
}

.ticket-body header::after,
.ticket-body header::before {
  content: "";
  display: block;
  width: 13px;
  height: 13px;
  background-color: #0f1114;
  position: absolute;
  right: -8px;
  border-radius: 50%;
  z-index: 11;
  bottom: -7px;
}

.ticket-body header:after {
  left: -8px;
}

.ticket-body .contents {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 180px;
  position: relative;
  pointer-events: all;
}

.ticket-body .contents .event {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  margin-top: -30px;
  font-weight: 600;
}

.ticket-body .contents .event span {
  display: inline-block;
  height: 15px;
  font-size: 3rem;
  font-weight: 400;
  line-height: 1;
}

.ticket-body .contents .event span.bold {
  font-size: 2.18rem;
  font-weight: 800;
  margin-right: -3px;
}

.ticket-body .contents .event div:nth-child(2) {
  font-size: 11px;
  letter-spacing: 0.15em;
  margin-left: 2px;
  color: #2f4c8b;
  white-space: nowrap;
}

.ticket-body .contents .number {
  position: absolute;
  left: 15px;
  bottom: -6px;
  font-size: 2em;
  color: #b5ddff;
  font-weight: bolder;
}

.ticket-body:after {
  content: "";
  display: block;
  position: absolute;
  bottom: -16px;
  left: 0;
  background:
    -webkit-linear-gradient(-135deg, #dcfffd 50%, transparent 50%) 0 50%,
    -webkit-linear-gradient(-45deg, #dcfffd 50%, transparent 50%) 0 50%,
    transparent;
  background:
    linear-gradient(315deg, #dcfffd 50%, transparent 50%) 0 50%,
    linear-gradient(45deg, #dcfffd 50%, transparent 50%) 0 50%,
    transparent;
  background-repeat: repeat-x;
  background-size:
    16px 16px,
    16px 16px,
    cover,
    cover;
  height: 16px;
  width: 100%;
  pointer-events: none;
}

.barcode {
  box-shadow:
    1px 0 0 1px,
    5px 0 0 1px,
    10px 0 0 1px,
    11px 0 0 1px,
    15px 0 0 1px,
    18px 0 0 1px,
    22px 0 0 1px,
    23px 0 0 1px,
    26px 0 0 1px,
    30px 0 0 1px,
    35px 0 0 1px,
    37px 0 0 1px,
    41px 0 0 1px,
    44px 0 0 1px,
    47px 0 0 1px,
    51px 0 0 1px,
    56px 0 0 1px,
    59px 0 0 1px,
    64px 0 0 1px,
    68px 0 0 1px,
    72px 0 0 1px,
    74px 0 0 1px,
    77px 0 0 1px,
    81px 0 0 1px,
    85px 0 0 1px,
    88px 0 0 1px,
    92px 0 0 1px,
    95px 0 0 1px,
    96px 0 0 1px,
    97px 0 0 1px;
  display: inline-block;
  height: 30px;
  width: 0;
  left: 65%;
  position: absolute;
  top: 12px;
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes appear2 {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
}

.back header span {
  animation: none;
}

.ticket:hover .back header span {
  opacity: 0;
  animation: appear 0.5s var(--ease-elastic) forwards
    calc(var(--i) * 20ms + 400ms);
}

.ticket:hover .front header span {
  opacity: 1;
  animation: appear2;
}

.front header span {
  opacity: 0;
  animation: appear 0.5s var(--ease-elastic) forwards
    calc(var(--i) * 20ms + 400ms);
}

.qrcode {
  position: absolute;
  z-index: 1;
  color: #a5b7eb;
}

.qrcode svg,
.qrcode img {
  display: block;
}

.back .qrcode {
  margin-top: 8px;
}

.back .qrcode::after {
  --stroke-width: 0.2rem;
  --corner-size: 1rem;

  position: absolute;
  content: "";
  background:
    linear-gradient(
        to right,
        currentColor var(--stroke-width),
        transparent var(--stroke-width)
      )
      0 0,
    linear-gradient(
        to right,
        currentColor var(--stroke-width),
        transparent var(--stroke-width)
      )
      0 100%,
    linear-gradient(
        to left,
        currentColor var(--stroke-width),
        transparent var(--stroke-width)
      )
      100% 0,
    linear-gradient(
        to left,
        currentColor var(--stroke-width),
        transparent var(--stroke-width)
      )
      100% 100%,
    linear-gradient(
        to bottom,
        currentColor var(--stroke-width),
        transparent var(--stroke-width)
      )
      0 0,
    linear-gradient(
        to bottom,
        currentColor var(--stroke-width),
        transparent var(--stroke-width)
      )
      100% 0,
    linear-gradient(
        to top,
        currentColor var(--stroke-width),
        transparent var(--stroke-width)
      )
      0 100%,
    linear-gradient(
        to top,
        currentColor var(--stroke-width),
        transparent var(--stroke-width)
      )
      100% 100%;
  background-size: var(--corner-size) var(--corner-size);
  inset: 0;
  background-repeat: no-repeat;
}

.back .qrcode::after {
  animation: breath 3s var(--ease-elastic) infinite;
}

@keyframes breath {
  0% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1.05);
    opacity: 0.3;
  }
}

.front .qrcode {
  right: 5px;
  bottom: -5px;
}

.reflex {
  pointer-events: none;
  position: absolute;
  inset: 0;
  bottom: -5px;
  z-index: 10;
  overflow: hidden;
}

.reflex::before {
  content: "";
  position: absolute;
  width: 300px;
  background-color: rgba(255, 255, 255, 0.4);
  background: linear-gradient(
    to right,
    rgba(221, 249, 255, 0.4) 10%,
    rgba(221, 245, 255, 0.7) 60%,
    rgba(221, 246, 255, 0.6) 60%,
    rgba(221, 255, 254, 0.4) 90%
  );
  top: -10%;
  bottom: -10%;
  left: -132%;
  transform: translateX(0) skew(-30deg);
  transition: all 0.7s ease;
}

.float:hover .reflex::before {
  transform: translate(280%, 0) skew(-30deg);
}

.float .front .reflex::before {
  transition-delay: 0.3s;
}

.ticket-body::before {
  content: "";
  position: absolute;
  inset: 0;
  mask-image: linear-gradient(white 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(white 50%, transparent 100%);
  border-radius: 7px 7px 0px 0px;
  background: radial-gradient(
      at 30% -5%,
      #90f1f1,
      #d3ccf0,
      rgba(255, 255, 255, 0) 25%
    ),
    radial-gradient(at 30% 40%, #aad1f0, rgba(255, 255, 255, 0) 20%),
    radial-gradient(at 50% 70%, #c4f2e5, rgba(255, 255, 255, 0) 30%),
    radial-gradient(at 70% 0%, #d3ccf0, rgba(255, 255, 255, 0) 20%),
    linear-gradient(
      75deg,
      #90f1f1 5%,
      rgba(255, 255, 255, 0),
      #aad1f0,
      rgba(255, 255, 255, 0),
      #e9d0ed,
      rgba(255, 255, 255, 0),
      #d3ccf0,
      rgba(255, 255, 255, 0),
      #c4f2e5 90%
    ),
    radial-gradient(at 30% 50%, #90f1f1, rgba(255, 255, 255, 0) 30%),
    radial-gradient(at 30% 50%, #9cb9fc, rgba(255, 255, 255, 0) 30%),
    radial-gradient(at 100% 50%, #90f1f1, #c2dcf2, rgba(255, 255, 255, 0) 50%),
    linear-gradient(
      115deg,
      #90f1f1 5%,
      #aad1f0 10%,
      #d3ccf0,
      #e9d0ed 20%,
      #aad1f0,
      #aad1f0 30%,
      #d3ccf0,
      #c2dcf2 40%,
      #90f1f1,
      #aad1f0 70%
    );
}

.noise {
  position: absolute;
  top: -25px;
  bottom: -20px;
  left: 0;
  right: 0;
  opacity: 0.07;
  mask-image: linear-gradient(
    transparent 5%,
    white 30%,
    white 70%,
    transparent 95%
  );
  -webkit-mask-image: linear-gradient(
    transparent 5%,
    white 30%,
    white 70%,
    transparent 95%
  );
  filter: grayscale(1);
  pointer-events: none;
  z-index: 1;
}
</style>
