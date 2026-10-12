<template>
  <div class="mobile-experience">
    <!-- Top Header -->
    <header :class="['mobile-top-header', { 'header-overlay': currentTab === 'explore' && !generatedPlan }]">
      <div class="mobile-brand">
        <img src="/logo.png" alt="Travel Trips" class="mobile-logo-img" />
        <div class="mobile-brand-title-wrap">
          <span class="mobile-brand-name">Travel Trips</span>
          <span class="mobile-brand-tagline">Miền Trung • Bản Sắc & Hành Trình</span>
        </div>
      </div>
      <div class="mobile-top-actions">
        <button
          type="button"
          class="mobile-theme-btn"
          :title="isDark ? 'Chế độ sáng' : 'Chế độ tối'"
          @click="$emit('toggleDark')"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>
        <button
          v-if="nguoiDung"
          type="button"
          class="mobile-user-avatar"
          @click="currentTab = 'profile'"
        >
          <img v-if="nguoiDung.avatar" :src="nguoiDung.avatar" alt="Avatar" />
          <span v-else>{{ nguoiDung.name ? nguoiDung.name.charAt(0).toUpperCase() : 'U' }}</span>
        </button>
        <button
          v-else
          type="button"
          class="mobile-login-btn"
          @click="$emit('openAuth')"
        >
          Đăng nhập
        </button>
      </div>
    </header>

    <!-- MAIN VIEWS BASED ON TAB -->
    <main class="mobile-content-body">

      <!-- TAB 1: KHÁM PHÁ & LẬP LỊCH NHANH (HOME / EXPLORE) -->
      <section v-if="currentTab === 'explore'" class="tab-view explore-view">
        
        <!-- Hero Storytelling Banner with Floating Capsule Prompt (Phủ toàn màn hình chuẩn Framer) -->
        <div :class="['mobile-hero-card', { 'hero-fullscreen': !generatedPlan, 'hero-compact': !!generatedPlan }]">
          <div class="m-hero-bg"></div>
          
          <!-- Watermark VIETNAM với nón lá phong cách Framer -->
          <div class="m-hero-watermark">
            <div class="watermark-hat-icon">
              <svg width="60" height="38" viewBox="0 0 100 65" fill="none">
                <path d="M50 5 L95 55 L5 55 Z" fill="#fde68a" stroke="#d97706" stroke-width="2.5"/>
                <path d="M35 55 Q50 64 65 55" stroke="#b45309" stroke-width="2" fill="none"/>
                <line x1="50" y1="5" x2="50" y2="55" stroke="#b45309" stroke-width="1.5" stroke-dasharray="3 3"/>
              </svg>
            </div>
            <span>VIETNAM</span>
          </div>

          <!-- Hero Narrative Center Content -->
          <div class="m-hero-center-cluster">
            <div class="m-hero-text">
              <span class="m-hero-kicker">01 / KHỞI ĐẦU</span>
              <h1 class="m-hero-title">
                Một Việt Nam.<br />
                <em>Muôn hành trình.</em>
              </h1>
              <p class="m-hero-subtitle">
                Từ những lớp sương vùng cao đến nhịp sống di sản và hương vị bản địa — AI sẵn sàng kiến tạo và tối ưu trọn vẹn lộ trình cho bạn.
              </p>
            </div>
          </div>

          <!-- Bottom Cluster: Capsule Prompt & Interactive Bar -->
          <div class="m-hero-bottom-cluster">
            <div class="mobile-prompt-capsule">
              <div class="capsule-input-row">
                <span class="sparkle-icon">✦</span>
                <input
                  v-model="quickPromptText"
                  type="text"
                  class="capsule-prompt-input"
                  placeholder="Khách muốn đi đâu? (VD: 3N2Đ Đà Nẵng Hội An)..."
                  @keyup.enter="handleGenerateFromPrompt"
                />
                <button
                  class="capsule-submit-btn"
                  :disabled="isGenerating || !quickPromptText.trim()"
                  @click="handleGenerateFromPrompt"
                >
                  <span v-if="!isGenerating">Lên lịch →</span>
                  <span v-else>Đang tính...</span>
                </button>
              </div>

              <!-- Quick Filter Pills inside capsule -->
              <div class="capsule-quick-pills">
                <button
                  v-for="pill in popularPills"
                  :key="pill"
                  class="capsule-pill-btn"
                  @click="appendPill(pill)"
                >
                  {{ pill }}
                </button>
              </div>
            </div>

            <!-- Sleek interactive bar at bottom of hero -->
            <div class="m-hero-interactive-row">
              <span class="m-interactive-tag">Trải nghiệm tương tác • Lịch trình thông minh AI</span>
              <span v-if="weather" class="m-interactive-weather">
                {{ weather.location?.name || 'Đà Nẵng' }} {{ Math.round(weather.current?.temperature || 28) }}°C
              </span>
              <span v-else class="m-interactive-coord">16°03′N 108°12′E</span>
            </div>
          </div>
        </div>

        <!-- LOADING INDICATOR -->
        <div v-if="isGenerating" class="mobile-plan-loading">
          <div class="loading-flower-icon">🌿</div>
          <h4>AI đang phân tích và kiến tạo lịch trình...</h4>
          <p>Tối ưu hóa các điểm đến, nhà xe và chi phí theo thời gian thực</p>
        </div>

        <!-- GENERATED PLAN RESULT (Khi AI tạo xong) -->
        <div v-if="generatedPlan && !isGenerating" class="mobile-generated-plan">
          <div class="plan-summary-banner">
            <div class="plan-badge-line">
              <span class="badge-emerald">LỊCH TRÌNH CÁ NHÂN HÓA</span>
              <span class="badge-amber">{{ (generatedPlan.daysList || generatedPlan.days || []).length }} Ngày</span>
            </div>
            <h2 class="plan-dest-name">{{ generatedPlan.destination || 'Miền Trung' }}</h2>
            <p class="plan-meta-info">
              Dự toán: ~{{ formatMoney(generatedPlan.total_budget || 0) }}đ • {{ generatedPlan.people || 1 }} người
            </p>

            <div class="plan-quick-buttons">
              <button class="btn-save-mobile-plan" @click="savePlan">
                ❤️ {{ isPlanSaved ? 'Đã lưu' : 'Lưu chuyến đi' }}
              </button>
              <button class="btn-reset-mobile-plan" @click="generatedPlan = null">
                ✕ Nhập lại
              </button>
            </div>
          </div>

          <!-- Day selector pills -->
          <div class="plan-day-pills-row">
            <button
              v-for="(day, dIdx) in (generatedPlan.daysList || generatedPlan.days || [])"
              :key="dIdx"
              :class="['day-pill-item', { active: currentActiveDayIndex === dIdx }]"
              @click="currentActiveDayIndex = dIdx"
            >
              Ngày {{ day.day || dIdx + 1 }}
            </button>
          </div>

          <!-- Active Day Schedule Timeline -->
          <div v-if="currentDayActivities" class="day-activities-card">
            <h3 class="day-activities-title">
              {{ currentDayActivities.theme || `Lịch trình Ngày ${currentActiveDayIndex + 1}` }}
            </h3>

            <div class="timeline-activity-list">
              <div
                v-for="(act, aIdx) in (currentDayActivities.activities || [])"
                :key="aIdx"
                class="timeline-act-node"
              >
                <div class="act-time-pill">{{ act.time || `${8 + aIdx * 3}:00` }}</div>
                <div class="act-info-box">
                  <span class="act-category-tag">{{ act.period || 'Điểm đến' }}</span>
                  <h4 class="act-place-title">{{ act.place || act.title || act.activity }}</h4>
                  <p class="act-desc-text">{{ act.description || act.note }}</p>
                  <div v-if="act.cost || act.tips" class="act-meta-tags">
                    <span v-if="act.cost" class="act-cost-tag">💰 {{ formatMoney(act.cost) }}đ</span>
                    <span v-if="act.tips" class="act-tip-tag">💡 {{ act.tips }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- REALTIME WEATHER COMPACT -->
        <div v-if="weather && generatedPlan" class="mobile-weather-strip">
          <div class="weather-strip-left">
            <span class="weather-label">THỜI TIẾT ĐÀ NẴNG & MIỀN TRUNG</span>
            <h4 class="weather-city-name">{{ weather.location?.name || 'Đà Nẵng' }}</h4>
            <p class="weather-status-text">{{ getWeatherDesc(weather.current?.weatherCode) }}</p>
          </div>
          <div class="weather-strip-right">
            <span class="weather-icon-large">{{ getWeatherEmoji(weather.current?.weatherCode) }}</span>
            <span class="weather-temp-number">{{ Math.round(weather.current?.temperature || 28) }}°C</span>
          </div>
        </div>

      </section>

      <!-- TAB 2: LẬP KẾ HOẠCH THEO FORM GỌN (PLANNER) -->
      <section v-if="currentTab === 'planner'" class="tab-view planner-view">
        <div class="planner-form-card">
          <div class="p-form-header">
            <span class="p-form-kicker">AI PLANNER</span>
            <h2 class="p-form-title">Tùy chọn chuyến đi</h2>
            <p class="p-form-sub">Nhập thông tin cơ bản, hệ thống sẽ tự động phối hợp lộ trình.</p>
          </div>

          <!-- Điểm đến -->
          <div class="p-form-field">
            <label class="p-field-label">Điểm đến</label>
            <div class="p-chips-row">
              <button
                v-for="d in cityList"
                :key="d"
                :class="['p-choice-chip', { active: plannerForm.destination === d }]"
                @click="plannerForm.destination = d"
              >
                {{ d }}
              </button>
            </div>
          </div>

          <!-- Số ngày -->
          <div class="p-form-field">
            <label class="p-field-label">Số ngày đi</label>
            <div class="p-duration-grid">
              <button
                v-for="d in [1, 2, 3, 4, 5]"
                :key="d"
                :class="['p-choice-chip', { active: plannerForm.days === d }]"
                @click="plannerForm.days = d"
              >
                {{ d }} Ngày {{ d > 1 ? `${d - 1} Đêm` : '' }}
              </button>
            </div>
          </div>

          <!-- Số người -->
          <div class="p-form-field">
            <label class="p-field-label">Số người tham gia</label>
            <div class="p-counter-row">
              <button class="p-counter-btn" @click="plannerForm.people = Math.max(1, plannerForm.people - 1)">−</button>
              <span class="p-counter-val">{{ plannerForm.people }} người</span>
              <button class="p-counter-btn" @click="plannerForm.people = Math.min(10, plannerForm.people + 1)">+</button>
            </div>
          </div>

          <!-- Ngân sách -->
          <div class="p-form-field">
            <label class="p-field-label">Mức ngân sách / người</label>
            <div class="p-duration-grid">
              <button
                v-for="b in budgetTiers"
                :key="b.key"
                :class="['p-choice-chip', { active: plannerForm.budgetTier === b.key }]"
                @click="plannerForm.budgetTier = b.key"
              >
                {{ b.label }}
                <small>{{ b.sub }}</small>
              </button>
            </div>
          </div>

          <button
            class="btn-primary-mobile"
            :disabled="isGenerating"
            @click="handleGenerateFromForm"
          >
            <span v-if="!isGenerating">✨ Tạo lịch trình với AI</span>
            <span v-else>Đang tính toán...</span>
          </button>
        </div>
      </section>

      <!-- TAB 3: CHUYẾN ĐI ĐÃ LƯU (MY TRIPS) -->
      <section v-if="currentTab === 'mytrips'" class="tab-view trips-view">
        <div class="trips-header-block">
          <h2 class="trips-main-title">Chuyến đi đã lưu</h2>
          <p class="trips-sub-title">Danh sách các lịch trình bạn đã lên kế hoạch</p>
        </div>

        <div v-if="savedTrips.length === 0" class="empty-trips-card">
          <span class="empty-icon">🎒</span>
          <h3>Chưa có chuyến đi nào</h3>
          <p>Hãy thử nhập điểm đến tại trang chủ để AI tạo chuyến đi đầu tiên của bạn!</p>
          <button class="btn-primary-mobile mini" @click="currentTab = 'explore'">
            Khám phá ngay
          </button>
        </div>

        <div v-else class="saved-trips-list">
          <div
            v-for="trip in savedTrips"
            :key="trip._id"
            class="saved-trip-item"
            @click="openSavedTripDetail(trip)"
          >
            <div class="trip-item-top">
              <span class="trip-dest-badge">{{ trip.destination }}</span>
              <span class="trip-days-badge">{{ (trip.daysList || trip.days || []).length }} Ngày</span>
            </div>
            <h3 class="trip-card-name">{{ trip.destination }} — {{ (trip.daysList || trip.days || []).length }} Ngày</h3>
            <p class="trip-budget-line">
              💰 {{ formatMoney(trip.total_budget || 0) }}đ • {{ trip.people || 1 }} người
            </p>
            <div class="trip-item-bottom">
              <span class="trip-hint-text">Chạm để xem lộ trình →</span>
              <button class="trip-delete-btn" @click.stop="deleteSavedTrip(trip._id)">
                Xóa
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 4: TÀI KHOẢN (PROFILE) -->
      <section v-if="currentTab === 'profile'" class="tab-view profile-view">
        <div v-if="nguoiDung" class="user-card-mobile">
          <div class="user-avatar-circle">
            <img v-if="nguoiDung.avatar" :src="nguoiDung.avatar" alt="Avatar" />
            <span v-else>{{ nguoiDung.name ? nguoiDung.name.charAt(0).toUpperCase() : 'U' }}</span>
          </div>
          <h2 class="user-display-name">{{ nguoiDung.name || 'Lữ khách' }}</h2>
          <p class="user-email-text">{{ nguoiDung.email }}</p>
          <button class="btn-logout-mobile" @click="$emit('logout')">
            Đăng xuất
          </button>
        </div>

        <div v-else class="guest-card-mobile">
          <div class="guest-icon">🏕️</div>
          <h2>Chào bạn!</h2>
          <p>Đăng nhập để đồng bộ các chuyến đi và địa điểm yêu thích của bạn.</p>
          <button class="btn-primary-mobile" @click="$emit('openAuth')">
            Đăng nhập / Đăng ký
          </button>
        </div>

        <!-- ABOUT APP -->
        <div class="about-app-card">
          <img src="/logo.png" alt="Travel Trips Logo" class="about-logo-small" />
          <h3>Travel Trips</h3>
          <p class="about-version">Phiên bản Mobile • Miền Trung</p>
          <p class="about-desc">
            Ứng dụng du lịch tinh gọn dành riêng cho điện thoại, tích hợp AI tự động lên lịch trình nhanh chóng.
          </p>
        </div>
      </section>

    </main>

    <!-- BOTTOM TAB NAVIGATION (MOBILE BAR) -->
    <nav class="mobile-bottom-nav">
      <button
        :class="['nav-tab-btn', { active: currentTab === 'explore' }]"
        @click="currentTab = 'explore'"
      >
        <AppIcon name="compass" :size="20" />
        <span>Khám phá</span>
      </button>

      <button
        :class="['nav-tab-btn', { active: currentTab === 'planner' }]"
        @click="currentTab = 'planner'"
      >
        <AppIcon name="calendar" :size="20" />
        <span>Lên lịch</span>
      </button>

      <button
        :class="['nav-tab-btn', { active: currentTab === 'mytrips' }]"
        @click="currentTab = 'mytrips'"
      >
        <AppIcon name="luggage" :size="20" />
        <span>Chuyến đi</span>
      </button>

      <button
        :class="['nav-tab-btn', { active: currentTab === 'profile' }]"
        @click="currentTab = 'profile'"
      >
        <AppIcon name="user" :size="20" />
        <span>Cá nhân</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../../services/api'

const props = defineProps({
  nguoiDung: { type: Object, default: null },
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits(['toggleDark', 'openAuth', 'logout', 'showToast'])

const currentTab = ref('explore')
const quickPromptText = ref('3 ngày Đà Nẵng - Hội An, thích ẩm thực và ngắm biển')
const isGenerating = ref(false)
const generatedPlan = ref(null)
const currentActiveDayIndex = ref(0)
const isPlanSaved = ref(false)
const weather = ref(null)
const savedTrips = ref([])

const popularPills = ['Di sản & văn hóa', 'Thiên nhiên', 'Ẩm thực', 'Biển đảo', '2 ngày', '3 ngày']
const cityList = ['Đà Nẵng', 'Hội An', 'Huế', 'Quy Nhơn', 'Phú Yên', 'Nha Trang', 'Quảng Bình']

const popularDestinations = [
  {
    name: 'Đà Nẵng',
    tag: 'Thành phố đáng sống',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Hội An',
    tag: 'Phố cổ đèn lồng',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Huế',
    tag: 'Cố đô di sản',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Quy Nhơn',
    tag: 'Kỳ Co & Eo Gió',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Phú Yên',
    tag: 'Xứ hoa vàng cỏ xanh',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Quảng Bình',
    tag: 'Vương quốc hang động',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&auto=format&fit=crop&q=80'
  }
]

const budgetTiers = [
  { key: 'budget', label: 'Tiết kiệm', sub: '~1-1.5tr / ngày' },
  { key: 'medium', label: 'Tiêu chuẩn', sub: '~2-3tr / ngày' },
  { key: 'luxury', label: 'Thư thả', sub: '~4tr+ / ngày' }
]

const plannerForm = reactive({
  destination: 'Đà Nẵng',
  days: 3,
  people: 2,
  budgetTier: 'medium'
})

const currentDayActivities = computed(() => {
  if (!generatedPlan.value) return null
  const days = generatedPlan.value.daysList || generatedPlan.value.days || []
  return days[currentActiveDayIndex.value] || days[0] || null
})

onMounted(() => {
  fetchWeather()
  loadSavedTrips()
})

function appendPill(pill) {
  if (!quickPromptText.value.includes(pill)) {
    quickPromptText.value = quickPromptText.value ? `${quickPromptText.value}, ${pill}` : pill
  }
}

function quickSelectCity(cityName) {
  quickPromptText.value = `3 ngày 2 đêm ở ${cityName}, trải nghiệm địa phương và ẩm thực`
  handleGenerateFromPrompt()
}

async function handleGenerateFromPrompt() {
  if (!quickPromptText.value.trim()) return
  isGenerating.value = true
  isPlanSaved.value = false
  try {
    let payload = {
      prompt: quickPromptText.value,
      destination: 'Đà Nẵng'
    }

    try {
      const { data: parsed } = await api.post('/ai/parse-prompt', { prompt: quickPromptText.value })
      if (parsed) {
        payload = { ...payload, ...parsed }
      }
    } catch (e) {
      console.warn('parse-prompt fallback:', e.message)
    }

    const res = await api.post('/ai/plan', payload)
    generatedPlan.value = res.data
    currentActiveDayIndex.value = 0
    currentTab.value = 'explore'
  } catch (err) {
    console.error('Lỗi lên lịch trình:', err)
    alert('Không thể tạo lịch trình lúc này, vui lòng thử lại!')
  } finally {
    isGenerating.value = false
  }
}

async function handleGenerateFromForm() {
  isGenerating.value = true
  isPlanSaved.value = false
  try {
    const budgetMap = {
      budget: 1500000 * plannerForm.days * plannerForm.people,
      medium: 2500000 * plannerForm.days * plannerForm.people,
      luxury: 4500000 * plannerForm.days * plannerForm.people
    }
    const payload = {
      destination: plannerForm.destination,
      days: plannerForm.days,
      people: plannerForm.people,
      total_budget: budgetMap[plannerForm.budgetTier] || 5000000
    }
    const res = await api.post('/ai/plan', payload)
    generatedPlan.value = res.data
    currentActiveDayIndex.value = 0
    currentTab.value = 'explore'
  } catch (err) {
    console.error('Lỗi tạo lịch:', err)
    alert('Có lỗi khi tạo kế hoạch!')
  } finally {
    isGenerating.value = false
  }
}

async function savePlan() {
  if (!generatedPlan.value) return
  try {
    const tripToSave = {
      ...generatedPlan.value,
      _id: generatedPlan.value._id || generatedPlan.value.tripId || ('local-' + Date.now()),
      created_at: new Date().toISOString()
    }
    
    // Save to local storage
    const raw = localStorage.getItem('my_saved_trips')
    let list = raw ? JSON.parse(raw) : []
    list.unshift(tripToSave)
    localStorage.setItem('my_saved_trips', JSON.stringify(list))
    savedTrips.value = list

    if (props.nguoiDung) {
      await api.post('/social/my-trips', tripToSave)
    }
    isPlanSaved.value = true
    alert('Đã lưu chuyến đi thành công!')
  } catch (e) {
    console.warn('Lỗi lưu:', e.message)
  }
}

function loadSavedTrips() {
  try {
    const raw = localStorage.getItem('my_saved_trips')
    if (raw) savedTrips.value = JSON.parse(raw)
  } catch (e) {}
}

function openSavedTripDetail(trip) {
  generatedPlan.value = trip
  currentActiveDayIndex.value = 0
  currentTab.value = 'explore'
}

function deleteSavedTrip(id) {
  if (!confirm('Xóa chuyến đi này khỏi danh sách?')) return
  savedTrips.value = savedTrips.value.filter(t => t._id !== id)
  localStorage.setItem('my_saved_trips', JSON.stringify(savedTrips.value))
}

async function fetchWeather() {
  try {
    const { data } = await api.get('/weather?city=Đà Nẵng')
    weather.value = data
  } catch {
    weather.value = null
  }
}

function formatMoney(val) {
  if (!val) return '0'
  return Number(val).toLocaleString('vi-VN')
}

function getWeatherEmoji(code) {
  if (!code && code !== 0) return '☀️'
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  return '🌦️'
}

function getWeatherDesc(code) {
  if (!code && code !== 0) return 'Trời nắng đẹp'
  if (code === 0) return 'Trời nắng quang đãng'
  if (code <= 3) return 'Có mây rải rác'
  if (code <= 48) return 'Sương mù nhẹ'
  if (code <= 67) return 'Có mưa rào'
  return 'Thời tiết mát mẻ'
}
</script>

<style scoped>
.mobile-experience {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-app, #f8fafc);
  color: var(--text-main, #1e293b);
  position: relative;
  padding-bottom: 70px; /* Space for bottom nav */
}

/* TOP HEADER */
.mobile-top-header {
  position: sticky;
  top: 0;
  z-index: 45;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

/* KHI Ở TRANG KHÁM PHÁ: HEADER PHỦ TRỰC TIẾP LÊN HÌNH NỀN FULL BLEED */
.mobile-top-header.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.3) 65%, transparent 100%);
  border-bottom: none;
  backdrop-filter: none;
}

.mobile-top-header.header-overlay .mobile-brand-name {
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}

.mobile-top-header.header-overlay .mobile-brand-tagline {
  color: #fbbf24;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.mobile-top-header.header-overlay .mobile-theme-btn {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  backdrop-filter: blur(8px);
}

:root[data-theme="dark"] .mobile-top-header {
  background: rgba(15, 23, 42, 0.9);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-logo-img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.mobile-brand-title-wrap {
  display: flex;
  flex-direction: column;
}

.mobile-brand-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #059669;
  line-height: 1.1;
}

.mobile-brand-tagline {
  font-size: 0.55rem;
  font-weight: 600;
  color: #f59e0b;
  letter-spacing: 0.05em;
}

.mobile-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-theme-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: transparent;
  color: var(--text-main);
  display: grid;
  place-content: center;
  cursor: pointer;
}

.mobile-user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid #059669;
  background: #059669;
  color: #fff;
  font-weight: 700;
  overflow: hidden;
  display: grid;
  place-content: center;
  font-size: 0.8rem;
  cursor: pointer;
}

.mobile-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-login-btn {
  padding: 5px 12px;
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
}

/* HERO SECTION FRAMER STYLE - PHỦ TOÀN MÀN HÌNH */
.mobile-hero-card {
  position: relative;
  background: #0f172a;
  color: #fff;
  overflow: hidden;
  transition: all 0.35s ease;
}

/* KHI CHƯA TẠO LỊCH TRÌNH: PHỦ KÍN TOÀN BỘ CHIỀU CAO MÀN HÌNH */
.mobile-hero-card.hero-fullscreen {
  min-height: calc(100vh - 56px);
  min-height: calc(100dvh - 56px);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 68px 14px 18px 14px;
  box-shadow: none;
}

/* KHI ĐÃ CÓ LỊCH TRÌNH: THU GỌN LẠI THÀNH BANNER TIỆN DỤNG */
.mobile-hero-card.hero-compact {
  min-height: auto;
  border-radius: 0 0 22px 22px;
  padding: 68px 14px 18px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.m-hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.45) 45%, rgba(15, 23, 42, 0.9) 100%),
              url('https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&auto=format&fit=crop&q=85') center/cover no-repeat;
  opacity: 1;
  filter: saturate(1.15);
}

.m-hero-watermark {
  position: absolute;
  top: 36%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: -apple-system, BlinkMacSystemFont, "Impact", sans-serif;
  font-size: 3.4rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.16);
  letter-spacing: 0.12em;
  user-select: none;
}

.watermark-hat-icon {
  opacity: 0.35;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.m-hero-center-cluster {
  position: relative;
  z-index: 2;
  margin-top: auto;
  margin-bottom: auto;
  padding-top: 10px;
}

.m-hero-text {
  margin-bottom: 8px;
}

.m-hero-kicker {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #f59e0b;
  text-transform: uppercase;
}

.m-hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.18;
  margin-top: 4px;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.m-hero-title em {
  font-style: italic;
  color: #fde68a;
  font-weight: 400;
}

.m-hero-subtitle {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.88);
  margin-top: 8px;
  line-height: 1.45;
  max-width: 380px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.m-hero-bottom-cluster {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* FLOATING PROMPT CAPSULE */
.mobile-prompt-capsule {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 8px 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.capsule-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sparkle-icon {
  color: #059669;
  font-size: 1.05rem;
}

.capsule-prompt-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.8rem;
  color: #0f172a;
  outline: none;
}

.capsule-prompt-input::placeholder {
  color: #64748b;
  font-size: 0.75rem;
}

.capsule-submit-btn {
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 7px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.35);
  transition: transform 0.15s ease;
}

.capsule-submit-btn:active {
  transform: scale(0.96);
}

.capsule-quick-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-top: 7px;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.capsule-quick-pills::-webkit-scrollbar {
  display: none;
}

.capsule-pill-btn {
  flex-shrink: 0;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 3px 9px;
  font-size: 0.65rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.capsule-pill-btn:active {
  background: #059669;
  color: #ffffff;
}

/* INTERACTIVE BOTTOM ROW INSIDE HERO */
.m-hero-interactive-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.7);
  padding: 0 4px;
}

.m-interactive-weather, .m-interactive-coord {
  color: #fbbf24;
  font-weight: 600;
}

/* LOADING NOTICE */
.mobile-plan-loading {
  text-align: center;
  padding: 24px 16px;
  margin: 16px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.loading-flower-icon {
  font-size: 1.8rem;
  animation: pulse 1.4s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* GENERATED PLAN SECTION */
.mobile-generated-plan {
  margin: 16px 12px;
}

.plan-summary-banner {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  margin-bottom: 12px;
}

.plan-badge-line {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.badge-emerald {
  font-size: 0.6rem;
  font-weight: 700;
  background: #059669;
  padding: 2px 6px;
  border-radius: 10px;
}

.badge-amber {
  font-size: 0.6rem;
  font-weight: 700;
  background: #f59e0b;
  padding: 2px 6px;
  border-radius: 10px;
}

.plan-dest-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  margin-bottom: 2px;
}

.plan-meta-info {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-bottom: 12px;
}

.plan-quick-buttons {
  display: flex;
  gap: 8px;
}

.btn-save-mobile-plan {
  flex: 1;
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px;
  font-size: 0.75rem;
  font-weight: 600;
}

.btn-reset-mobile-plan {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 0.75rem;
}

.plan-day-pills-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 10px;
}

.day-pill-item {
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.day-pill-item.active {
  background: #059669;
  color: #fff;
  border-color: #059669;
}

.day-activities-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
}

.day-activities-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}

.timeline-activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-act-node {
  display: flex;
  gap: 10px;
}

.act-time-pill {
  font-size: 0.65rem;
  font-weight: 700;
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
  height: fit-content;
  white-space: nowrap;
}

.act-info-box {
  flex: 1;
}

.act-category-tag {
  font-size: 0.6rem;
  font-weight: 700;
  color: #f59e0b;
  text-transform: uppercase;
}

.act-place-title {
  font-size: 0.82rem;
  font-weight: 700;
  margin: 1px 0 3px;
}

.act-desc-text {
  font-size: 0.72rem;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 4px;
}

.act-meta-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.act-cost-tag, .act-tip-tag {
  font-size: 0.6rem;
  padding: 1px 5px;
  border-radius: 4px;
}

.act-cost-tag {
  background: #fef3c7;
  color: #92400e;
}

.act-tip-tag {
  background: #e0f2fe;
  color: #0369a1;
}

/* POPULAR DESTINATIONS */
.mobile-section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 16px 14px 8px;
}

.m-section-title {
  font-size: 1rem;
  font-weight: 700;
}

.m-section-sub {
  font-size: 0.65rem;
  color: #94a3b8;
}

.mobile-city-carousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 14px 14px;
  scrollbar-width: none;
}

.m-city-card {
  flex-shrink: 0;
  width: 125px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
}

.m-city-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 8px;
}

.m-city-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
}

.m-city-tag {
  position: relative;
  z-index: 1;
  font-size: 0.52rem;
  color: #fde68a;
  font-weight: 600;
}

.m-city-name {
  position: relative;
  z-index: 1;
  font-family: 'Playfair Display', serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
}

/* WEATHER STRIP */
.mobile-weather-strip {
  margin: 0 14px 16px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weather-label {
  font-size: 0.55rem;
  font-weight: 700;
  color: #059669;
}

.weather-city-name {
  font-size: 0.9rem;
  font-weight: 700;
  margin-top: 2px;
}

.weather-status-text {
  font-size: 0.68rem;
  color: #64748b;
}

.weather-strip-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-icon-large {
  font-size: 1.3rem;
}

.weather-temp-number {
  font-size: 1.15rem;
  font-weight: 800;
}

/* PLANNER TAB */
.planner-form-card {
  margin: 14px;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.p-form-header {
  margin-bottom: 14px;
}

.p-form-kicker {
  font-size: 0.65rem;
  font-weight: 700;
  color: #059669;
}

.p-form-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.p-form-sub {
  font-size: 0.72rem;
  color: #64748b;
}

.p-form-field {
  margin-bottom: 14px;
}

.p-field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.p-chips-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.p-choice-chip {
  padding: 6px 12px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
}

.p-choice-chip.active {
  background: #059669;
  color: #fff;
  border-color: #059669;
}

.p-duration-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.p-duration-grid small {
  display: block;
  font-size: 0.55rem;
  opacity: 0.8;
}

.p-counter-row {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.p-counter-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  font-weight: 700;
}

.p-counter-val {
  font-size: 0.8rem;
  font-weight: 700;
}

.btn-primary-mobile {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  background: #059669;
  color: #fff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}

.btn-primary-mobile.mini {
  width: auto;
  padding: 6px 16px;
}

/* SAVED TRIPS TAB */
.trips-header-block {
  padding: 14px 14px 6px;
}

.trips-main-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.trips-sub-title {
  font-size: 0.72rem;
  color: #64748b;
}

.empty-trips-card {
  text-align: center;
  margin: 20px 14px;
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}

.empty-icon {
  font-size: 2.2rem;
}

.saved-trips-list {
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-trip-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.trip-item-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.trip-dest-badge {
  font-size: 0.6rem;
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
}

.trip-days-badge {
  font-size: 0.6rem;
  font-weight: 600;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 8px;
}

.trip-card-name {
  font-size: 0.9rem;
  font-weight: 700;
}

.trip-budget-line {
  font-size: 0.72rem;
  color: #64748b;
  margin: 4px 0 8px;
}

.trip-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 6px;
}

.trip-hint-text {
  font-size: 0.68rem;
  color: #059669;
  font-weight: 600;
}

.trip-delete-btn {
  font-size: 0.65rem;
  color: #ef4444;
  border: none;
  background: transparent;
  cursor: pointer;
}

/* PROFILE TAB */
.user-card-mobile, .guest-card-mobile {
  margin: 14px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.user-avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #059669;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  display: grid;
  place-content: center;
  margin: 0 auto 10px;
}

.user-avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-display-name {
  font-size: 1.15rem;
  font-weight: 700;
}

.user-email-text {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 12px;
}

.btn-logout-mobile {
  padding: 6px 16px;
  border: 1px solid #ef4444;
  color: #ef4444;
  background: transparent;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.about-app-card {
  margin: 14px;
  padding: 16px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.about-logo-small {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  margin-bottom: 6px;
}

.about-version {
  font-size: 0.65rem;
  color: #f59e0b;
  font-weight: 600;
}

.about-desc {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 6px;
}

/* BOTTOM TAB NAVIGATION */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 50;
  max-width: 480px;
  margin: 0 auto;
}

:root[data-theme="dark"] .mobile-bottom-nav {
  background: rgba(15, 23, 42, 0.95);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.nav-tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 4px 10px;
}

.nav-tab-btn.active {
  color: #059669;
}
</style>
