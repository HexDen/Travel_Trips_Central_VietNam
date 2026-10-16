<template>
  <div
    v-if="weather"
    ref="cardRef"
    class="weather-glass-3d-card"
    :class="[weatherThemeClass, { 'is-hovered': isHovered }]"
    :style="cardTransformStyle"
    @mousemove="onMouseMove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    v-reveal
  >
    <!-- Ánh sáng hào quang chuyển động nền (Ambient Glowing Auras) -->
    <div class="ambient-glow glow-primary"></div>
    <div class="ambient-glow glow-secondary"></div>
    <div class="glass-reflex-beam"></div>

    <!-- NỘI DUNG CHÍNH CỦA THẺ KÍNH 3D -->
    <div class="weather-card-inner">
      <!-- PHẦN TRÊN: THÔNG TIN CHÍNH + NGHỆ THUẬT 3D + TELEMETRY PILLS -->
      <div class="w3d-top-row">
        <!-- CỘT TRÁI: ĐỊA ĐIỂM & NHIỆT ĐỘ KHỔNG LỒ -->
        <div class="w3d-info-col">
          <div class="w3d-badge-row">
            <span class="w3d-pulse-dot"></span>
            <span class="w3d-live-tag">THỜI TIẾT THỜI GIAN THỰC</span>
            <span class="w3d-date-tag">{{ currentDateStr }}</span>
          </div>

          <div class="w3d-location-row">
            <h3 class="w3d-city-name">{{ weather.location?.name || 'Miền Trung' }}</h3>
            <span class="w3d-country-pill">Việt Nam</span>
          </div>

          <div class="w3d-temp-main">
            <span class="w3d-temp-number">{{ Math.round(weather.current?.temperature ?? 30) }}</span>
            <span class="w3d-temp-unit">°C</span>
          </div>

          <div class="w3d-desc-box">
            <span class="w3d-desc-text">{{ getWeatherDesc(weather.current?.weatherCode) }}</span>
            <span class="w3d-desc-divider">•</span>
            <span class="w3d-feels-like">Cảm giác như <b>{{ Math.round(weather.current?.feelsLike ?? weather.current?.temperature ?? 30) }}°C</b></span>
          </div>
        </div>

        <!-- CỘT GIỮA: NGHỆ THUẬT THỜI TIẾT 3D NỔI KHỐI (3D WEATHER ARTWORK) -->
        <div class="w3d-art-col">
          <div class="w3d-art-stage">
            <!-- Mặt trời 3D nổi khối -->
            <div
              v-if="isSunnyOrPartly"
              class="w3d-sun-3d"
              :class="{ 'sun-offset-cloud': isPartlyCloudy }"
            >
              <div class="sun-glow-ring"></div>
              <div class="sun-core-sphere">
                <div class="sun-highlight"></div>
              </div>
              <div class="sun-rays-rotor">
                <span v-for="i in 8" :key="'ray-'+i" :style="{ '--ray-idx': i }" class="sun-ray"></span>
              </div>
            </div>

            <!-- Đám mây 3D bồng bềnh -->
            <div v-if="hasClouds" class="w3d-cloud-3d" :class="{ 'cloud-dominant': !isSunnyOrPartly }">
              <div class="cloud-shadow"></div>
              <div class="cloud-layer cloud-back"></div>
              <div class="cloud-layer cloud-front">
                <div class="cloud-bubble bubble-1"></div>
                <div class="cloud-bubble bubble-2"></div>
                <div class="cloud-bubble bubble-3"></div>
                <div class="cloud-specular"></div>
              </div>

              <!-- Hạt mưa 3D rơi lấp lánh (nếu trời mưa) -->
              <div v-if="isRainy" class="w3d-rain-layer">
                <span v-for="r in 6" :key="'drop-'+r" :style="{ '--drop-idx': r }" class="rain-drop"></span>
              </div>

              <!-- Tia sét neon (nếu dông bão) -->
              <div v-if="isStormy" class="w3d-lightning-bolt">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#facc15">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: CÁC VIÊN THUỐC THÔNG SỐ (TELEMETRY GLASS PILLS) -->
        <div class="w3d-pills-col">
          <div class="w3d-stat-pill" title="Tốc độ gió hiện tại">
            <span class="w3d-pill-icon wind-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
              </svg>
            </span>
            <div class="w3d-pill-text">
              <small>Tốc độ gió</small>
              <strong>{{ weather.current?.windSpeed ?? 7.8 }} km/h</strong>
            </div>
          </div>

          <div class="w3d-stat-pill" title="Xác suất có mưa">
            <span class="w3d-pill-icon rain-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </span>
            <div class="w3d-pill-text">
              <small>Khả năng mưa</small>
              <strong>{{ todayRainChance }}%</strong>
            </div>
          </div>

          <div class="w3d-stat-pill" title="Cảm giác nhiệt độ">
            <span class="w3d-pill-icon temp-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </span>
            <div class="w3d-pill-text">
              <small>Cảm nhận</small>
              <strong>{{ Math.round(weather.current?.feelsLike ?? weather.current?.temperature ?? 30) }}°C</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- ĐƯỜNG PHÂN CÁCH TINH THỂ KÍNH -->
      <div class="w3d-divider-line"></div>

      <!-- PHẦN DƯỚI: DẢI DỰ BÁO 5 NGÀY DẠNG THẺ KÍNH MICRO-CARDS NỔI KHỐI -->
      <div class="w3d-forecast-section">
        <div class="w3d-forecast-label">
          <span>DỰ BÁO 5 NGÀY TỚI</span>
          <small>Chạm thẻ để xem xu hướng</small>
        </div>

        <div class="w3d-forecast-grid">
          <div
            v-for="(day, idx) in weather.daily"
            :key="day.date || idx"
            class="w3d-micro-card"
            :class="{ 'is-today': idx === 0 }"
          >
            <span class="w3d-mc-day">{{ idx === 0 ? 'Hôm nay' : formatDay(day.date) }}</span>
            
            <div class="w3d-mc-icon-wrap">
              <div v-if="day.weatherCode === 0" class="mc-icon-sun">☀️</div>
              <div v-else-if="day.weatherCode <= 3" class="mc-icon-cloudsun">⛅</div>
              <div v-else-if="day.weatherCode <= 67 || day.weatherCode <= 82" class="mc-icon-rain">🌧️</div>
              <div v-else class="mc-icon-storm">⛈️</div>
            </div>

            <div class="w3d-mc-temp-range">
              <strong class="mc-temp-max">{{ Math.round(day.max ?? 30) }}°</strong>
              <small v-if="day.min != null" class="mc-temp-min">{{ Math.round(day.min) }}°</small>
            </div>

            <div v-if="day.rainChance && day.rainChance > 15" class="w3d-mc-rain-badge">
              💧{{ Math.round(day.rainChance) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  weather: {
    type: Object,
    default: null
  }
})

// === TƯƠNG TÁC 3D PARALLAX TILT ===
const cardRef = ref(null)
const tiltX = ref(0)
const tiltY = ref(0)
const isHovered = ref(false)

const onMouseMove = (e) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  // Giới hạn góc nghiêng nhẹ nhàng sang trọng
  tiltX.value = -((y / (rect.height / 2)) * 4.5).toFixed(2)
  tiltY.value = ((x / (rect.width / 2)) * 5.5).toFixed(2)
}

const onMouseEnter = () => {
  isHovered.value = true
}

const onMouseLeave = () => {
  isHovered.value = false
  tiltX.value = 0
  tiltY.value = 0
}

const cardTransformStyle = computed(() => {
  if (!isHovered.value) {
    return {
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)',
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }
  }
  return {
    transform: `perspective(1200px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) translateY(-2px)`,
    transition: 'transform 0.1s ease-out'
  }
})

// === PHÂN TÍCH ĐIỀU KIỆN THỜI TIẾT HIỆN TẠI ===
const weatherCode = computed(() => props.weather?.current?.weatherCode ?? 1)

const isSunnyOrPartly = computed(() => weatherCode.value <= 3)
const isPartlyCloudy = computed(() => weatherCode.value > 0 && weatherCode.value <= 3)
const hasClouds = computed(() => weatherCode.value > 0)
const isRainy = computed(() => (weatherCode.value >= 51 && weatherCode.value <= 67) || (weatherCode.value >= 80 && weatherCode.value <= 82))
const isStormy = computed(() => weatherCode.value > 82)

const weatherThemeClass = computed(() => {
  if (weatherCode.value === 0) return 'theme-sunny'
  if (weatherCode.value <= 3) return 'theme-partly-cloudy'
  if (isRainy.value) return 'theme-rainy'
  if (isStormy.value) return 'theme-stormy'
  return 'theme-cloudy'
})

const todayRainChance = computed(() => {
  const chance = props.weather?.daily?.[0]?.rainChance
  if (chance != null) return Math.round(chance)
  if (isRainy.value) return 75
  if (isPartlyCloudy.value) return 20
  return 10
})

const currentDateStr = computed(() => {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric'
  }).format(new Date())
})

function getWeatherDesc(code) {
  if (code === 0) return 'Trời nắng vàng đẹp'
  if (code <= 3) return 'Có mây nhẹ & Nắng'
  if (code <= 48) return 'Sương mù nhẹ'
  if (code <= 67 || code <= 82) return 'Có mưa rào mát mẻ'
  return 'Dông bão'
}

function formatDay(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
}
</script>

<style scoped>
/* ==================== 3D GLASS CARD CONTAINER ==================== */
.weather-glass-3d-card {
  position: relative;
  width: 100%;
  border-radius: 24px;
  padding: 24px 28px;
  margin: 10px 0 28px;
  overflow: hidden;
  user-select: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(240, 253, 250, 0.6) 100%);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 20px 45px -10px rgba(13, 148, 136, 0.12),
    0 10px 20px -5px rgba(2, 132, 199, 0.08),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transform-style: preserve-3d;
  will-change: transform;
}

:root[data-theme="dark"] .weather-glass-3d-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(20, 40, 65, 0.7) 100%);
  border: 1px solid rgba(56, 189, 248, 0.28);
  box-shadow:
    0 24px 50px -10px rgba(0, 0, 0, 0.6),
    0 0 35px rgba(56, 189, 248, 0.15),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);
}

/* ==================== ÁNH SÁNG HÀO QUANG (AMBIENT GLOWS) ==================== */
.ambient-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(55px);
  opacity: 0.5;
  transition: all 0.8s ease;
  z-index: 0;
}

.glow-primary {
  top: -40px;
  right: 18%;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, #38bdf8 0%, #0284c7 60%, transparent 100%);
}

.glow-secondary {
  bottom: -40px;
  left: 10%;
  width: 260px;
  height: 200px;
  background: radial-gradient(circle, #facc15 0%, #fb923c 60%, transparent 100%);
  opacity: 0.35;
}

/* Điều chỉnh màu ánh sáng theo theme thời tiết */
.theme-sunny .glow-primary { background: radial-gradient(circle, #fbbf24 0%, #f59e0b 60%, transparent 100%); }
.theme-sunny .glow-secondary { background: radial-gradient(circle, #38bdf8 0%, transparent 100%); }

.theme-rainy .glow-primary { background: radial-gradient(circle, #0284c7 0%, #1e40af 60%, transparent 100%); }
.theme-rainy .glow-secondary { background: radial-gradient(circle, #06b6d4 0%, transparent 100%); }

.theme-stormy .glow-primary { background: radial-gradient(circle, #7c3aed 0%, #4c1d95 60%, transparent 100%); }

/* Vệt sáng kính lướt qua (Glass Reflex Beam) */
.glass-reflex-beam {
  position: absolute;
  top: 0;
  left: -150%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.22) 50%,
    transparent 100%
  );
  transform: skewX(-25deg);
  pointer-events: none;
  transition: left 0.8s ease;
  z-index: 1;
}

.weather-glass-3d-card:hover .glass-reflex-beam {
  left: 180%;
}

/* ==================== NỘI DUNG THẺ ==================== */
.weather-card-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.w3d-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

/* === CỘT TRÁI: THÔNG TIN CHÍNH === */
.w3d-info-col {
  flex: 1.2;
  display: flex;
  flex-direction: column;
}

.w3d-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.w3d-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
  animation: pulseDot 2s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
}

.w3d-live-tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #0284c7;
  text-transform: uppercase;
}

:root[data-theme="dark"] .w3d-live-tag {
  color: #38bdf8;
}

.w3d-date-tag {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: capitalize;
}

:root[data-theme="dark"] .w3d-date-tag {
  color: #94a3b8;
}

.w3d-location-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.w3d-city-name {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.8px;
  color: #0f172a;
}

:root[data-theme="dark"] .w3d-city-name {
  color: #f8fafc;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.w3d-country-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(2, 132, 199, 0.12);
  color: #0284c7;
  border: 1px solid rgba(2, 132, 199, 0.25);
}

:root[data-theme="dark"] .w3d-country-pill {
  background: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
  border-color: rgba(56, 189, 248, 0.3);
}

.w3d-temp-main {
  display: flex;
  align-items: flex-start;
  line-height: 0.95;
  margin: 6px 0 10px;
}

.w3d-temp-number {
  font-size: 60px;
  font-weight: 900;
  letter-spacing: -2px;
  color: #0284c7;
  background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

:root[data-theme="dark"] .w3d-temp-number {
  background: linear-gradient(135deg, #ffffff 0%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 14px rgba(56, 189, 248, 0.35));
}

.w3d-temp-unit {
  font-size: 24px;
  font-weight: 800;
  color: #0284c7;
  margin-top: 4px;
  margin-left: 2px;
}

:root[data-theme="dark"] .w3d-temp-unit {
  color: #38bdf8;
}

.w3d-desc-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: #475569;
}

:root[data-theme="dark"] .w3d-desc-box {
  color: #cbd5e1;
}

.w3d-desc-text {
  font-weight: 700;
  color: #0d9488;
}

:root[data-theme="dark"] .w3d-desc-text {
  color: #2dd4bf;
}

.w3d-desc-divider {
  color: #cbd5e1;
}

.w3d-feels-like b {
  color: #0f172a;
}

:root[data-theme="dark"] .w3d-feels-like b {
  color: #f8fafc;
}

/* === CỘT GIỮA: NGHỆ THUẬT 3D NỔI KHỐI (3D ARTWORK) === */
.w3d-art-col {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.w3d-art-stage {
  position: relative;
  width: 150px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 800px;
}

/* Mặt trời 3D nổi khối (Sun Sphere) */
.w3d-sun-3d {
  position: absolute;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  z-index: 10;
  transition: all 0.4s ease;
  animation: sunFloat 4s ease-in-out infinite;
}

.w3d-sun-3d.sun-offset-cloud {
  top: 10px;
  left: 20px;
}

@keyframes sunFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.sun-core-sphere {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff7a1 0%, #fbbf24 45%, #ea580c 100%);
  box-shadow:
    0 10px 25px rgba(245, 158, 11, 0.5),
    inset 0 -4px 8px rgba(194, 65, 12, 0.6),
    inset 0 3px 6px rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 2;
}

.sun-highlight {
  position: absolute;
  top: 14%;
  left: 18%;
  width: 22px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  filter: blur(1.5px);
  transform: rotate(-30deg);
}

.sun-glow-ring {
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, transparent 70%);
  animation: pulseSunRing 3s ease-in-out infinite;
  z-index: 1;
}

@keyframes pulseSunRing {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 0.9; }
}

.sun-rays-rotor {
  position: absolute;
  inset: -18px;
  border-radius: 50%;
  animation: rotateRays 25s linear infinite;
  z-index: 0;
}

@keyframes rotateRays {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sun-ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 12px;
  background: linear-gradient(to top, rgba(245, 158, 11, 0.8), transparent);
  border-radius: 2px;
  transform-origin: center -24px;
  transform: translate(-50%, -50%) rotate(calc(var(--ray-idx) * 45deg));
}

/* Đám mây 3D nổi khối (Cloud 3D) */
.w3d-cloud-3d {
  position: absolute;
  bottom: 12px;
  right: 15px;
  width: 95px;
  height: 55px;
  z-index: 20;
  animation: cloudDrift 5s ease-in-out infinite;
}

.w3d-cloud-3d.cloud-dominant {
  bottom: 30px;
  right: 25px;
  transform: scale(1.15);
}

@keyframes cloudDrift {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-4px) translateX(3px); }
}

.cloud-front {
  position: relative;
  width: 100%;
  height: 100%;
}

.cloud-bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f5f9 65%, #cbd5e1 100%);
  box-shadow:
    0 8px 18px rgba(15, 23, 42, 0.15),
    inset 0 -3px 5px rgba(100, 116, 139, 0.3),
    inset 0 3px 5px rgba(255, 255, 255, 0.9);
}

.bubble-1 {
  width: 52px;
  height: 52px;
  left: 20px;
  top: 0;
}

.bubble-2 {
  width: 42px;
  height: 42px;
  left: 0;
  bottom: 2px;
}

.bubble-3 {
  width: 48px;
  height: 48px;
  right: 0;
  bottom: 0;
}

.cloud-specular {
  position: absolute;
  top: 8px;
  left: 28px;
  width: 24px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  filter: blur(1.5px);
  z-index: 5;
}

/* Mưa 3D rơi */
.w3d-rain-layer {
  position: absolute;
  bottom: -22px;
  left: 10px;
  right: 10px;
  height: 25px;
  display: flex;
  justify-content: space-around;
  pointer-events: none;
}

.rain-drop {
  width: 2.5px;
  height: 12px;
  background: linear-gradient(to bottom, #38bdf8, #0284c7);
  border-radius: 3px;
  opacity: 0.8;
  animation: dropFall 1s linear infinite;
  animation-delay: calc(var(--drop-idx) * 0.18s);
}

@keyframes dropFall {
  0% { transform: translateY(-5px); opacity: 0; }
  40% { opacity: 0.9; }
  100% { transform: translateY(18px); opacity: 0; }
}

/* Tia sét 3D */
.w3d-lightning-bolt {
  position: absolute;
  bottom: -15px;
  left: 36px;
  animation: flashLightning 2.5s infinite;
  filter: drop-shadow(0 0 8px #facc15);
}

@keyframes flashLightning {
  0%, 85%, 100% { opacity: 0; transform: scale(0.8); }
  90%, 94% { opacity: 1; transform: scale(1.1); }
  92% { opacity: 0.3; }
}

/* === CỘT PHẢI: TELEMETRY PILLS === */
.w3d-pills-col {
  flex: 0.95;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.w3d-stat-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

:root[data-theme="dark"] .w3d-stat-pill {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(56, 189, 248, 0.2);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.w3d-stat-pill:hover {
  transform: translateX(4px);
  background: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 6px 18px rgba(56, 189, 248, 0.25);
}

:root[data-theme="dark"] .w3d-stat-pill:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: #38bdf8;
  box-shadow: 0 6px 20px rgba(56, 189, 248, 0.35);
}

.w3d-pill-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wind-icon { background: rgba(56, 189, 248, 0.15); color: #0284c7; }
.rain-icon { background: rgba(14, 165, 233, 0.15); color: #0284c7; }
.temp-icon { background: rgba(245, 158, 11, 0.15); color: #d97706; }

:root[data-theme="dark"] .wind-icon { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
:root[data-theme="dark"] .rain-icon { background: rgba(14, 165, 233, 0.2); color: #38bdf8; }
:root[data-theme="dark"] .temp-icon { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

.w3d-pill-text {
  display: flex;
  flex-direction: column;
}

.w3d-pill-text small {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

:root[data-theme="dark"] .w3d-pill-text small {
  color: #94a3b8;
}

.w3d-pill-text strong {
  font-size: 13.5px;
  color: #0f172a;
  font-weight: 800;
}

:root[data-theme="dark"] .w3d-pill-text strong {
  color: #f8fafc;
}

/* ==================== ĐƯỜNG PHÂN CÁCH ==================== */
.w3d-divider-line {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(2, 132, 199, 0.25) 20%,
    rgba(2, 132, 199, 0.25) 80%,
    transparent 100%
  );
  margin: 4px 0;
}

:root[data-theme="dark"] .w3d-divider-line {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(56, 189, 248, 0.2) 20%,
    rgba(56, 189, 248, 0.2) 80%,
    transparent 100%
  );
}

/* ==================== DỰ BÁO 5 NGÀY TỚI (5-DAY FORECAST) ==================== */
.w3d-forecast-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.w3d-forecast-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #0284c7;
}

:root[data-theme="dark"] .w3d-forecast-label {
  color: #38bdf8;
}

.w3d-forecast-label small {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0;
}

:root[data-theme="dark"] .w3d-forecast-label small {
  color: #94a3b8;
}

.w3d-forecast-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

/* Thẻ kính mini cho mỗi ngày (Micro Glass Cards) */
.w3d-micro-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 6px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

:root[data-theme="dark"] .w3d-micro-card {
  background: rgba(30, 41, 59, 0.55);
  border-color: rgba(56, 189, 248, 0.18);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.w3d-micro-card:hover {
  transform: translateY(-4px) scale(1.03);
  background: #ffffff;
  border-color: #38bdf8;
  box-shadow:
    0 10px 24px -4px rgba(56, 189, 248, 0.35),
    0 0 16px rgba(56, 189, 248, 0.2);
}

:root[data-theme="dark"] .w3d-micro-card:hover {
  background: rgba(30, 41, 59, 0.95);
  border-color: #38bdf8;
  box-shadow:
    0 10px 24px -4px rgba(56, 189, 248, 0.4),
    0 0 18px rgba(56, 189, 248, 0.25);
}

.w3d-micro-card.is-today {
  border-color: rgba(2, 132, 199, 0.5);
  background: linear-gradient(180deg, rgba(224, 242, 254, 0.7) 0%, rgba(255, 255, 255, 0.8) 100%);
}

:root[data-theme="dark"] .w3d-micro-card.is-today {
  border-color: rgba(56, 189, 248, 0.5);
  background: linear-gradient(180deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.w3d-mc-day {
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: capitalize;
}

:root[data-theme="dark"] .w3d-mc-day {
  color: #94a3b8;
}

.w3d-micro-card.is-today .w3d-mc-day {
  color: #0284c7;
  font-weight: 800;
}

:root[data-theme="dark"] .w3d-micro-card.is-today .w3d-mc-day {
  color: #38bdf8;
}

.w3d-mc-icon-wrap {
  font-size: 20px;
  margin: 2px 0;
  transition: transform 0.3s ease;
}

.w3d-micro-card:hover .w3d-mc-icon-wrap {
  transform: scale(1.2);
}

.w3d-mc-temp-range {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.mc-temp-max {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

:root[data-theme="dark"] .mc-temp-max {
  color: #f8fafc;
}

.mc-temp-min {
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
}

:root[data-theme="dark"] .mc-temp-min {
  color: #94a3b8;
}

.w3d-mc-rain-badge {
  font-size: 10px;
  font-weight: 700;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
  padding: 1px 6px;
  border-radius: 10px;
}

:root[data-theme="dark"] .w3d-mc-rain-badge {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
}

/* ==================== RESPONSIVE LAYOUT ==================== */
@media (max-width: 900px) {
  .weather-glass-3d-card {
    padding: 20px 18px;
  }

  .w3d-top-row {
    flex-wrap: wrap;
    gap: 16px;
  }

  .w3d-info-col {
    flex: 1 1 100%;
  }

  .w3d-art-col {
    flex: 1 1 auto;
    justify-content: flex-start;
  }

  .w3d-pills-col {
    flex: 1 1 auto;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .w3d-stat-pill {
    flex: 1 1 calc(50% - 6px);
  }

  .w3d-forecast-grid {
    gap: 6px;
  }

  .w3d-micro-card {
    padding: 10px 4px;
  }
}

@media (max-width: 480px) {
  .w3d-forecast-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .w3d-city-name {
    font-size: 22px;
  }

  .w3d-temp-number {
    font-size: 48px;
  }
}
</style>
