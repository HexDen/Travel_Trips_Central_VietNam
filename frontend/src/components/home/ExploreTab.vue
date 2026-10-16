<template>
  <section class="tab-pane">
    <!-- Banner Hero App -->
    <div class="app-hero-card">
      <div class="hero-content">
        <span class="hero-badge">AI TRAVEL ASSISTANT</span>
        <h2>Lên lịch đi chơi, đừng lên lịch cãi nhau.</h2>
        <p>AI sắp xếp lịch trình, bạn chỉ cần quyết định... ai trả tiền.</p>
        <button class="hero-cta-btn" @click="$emit('startPlanner')">
          <span>Lên lịch trình ngay</span>
          <strong>→</strong>
        </button>
      </div>
    </div>

    <!-- Thanh chọn nhanh Tỉnh/Thành phố dạng Thẻ Ảnh -->
    <div class="explore-section" v-reveal>
      <div class="section-title-row">
        <h3>Điểm đến nổi tiếng</h3>

        <div class="city-music-toolbar">
          <VolumeSlider
            :volume="musicVolume"
            :muted="musicMuted"
            @update:volume="val => $emit('update:musicVolume', val)"
            @toggleMute="$emit('toggleMusicMute')"
          />
          <span class="badge-count">{{ visibleCities.length }} Tỉnh/TP</span>
        </div>
      </div>

      <div class="cities-carousel">
        <div
          v-for="city in visibleDestinationCards"
          :key="city.name"
          :class="['city-card-btn', { active: currentDestination === city.name }]"
          @click="$emit('selectCity', city.name)"
          @keydown.enter="$emit('selectCity', city.name)"
          @keydown.space.prevent="$emit('selectCity', city.name)"
          role="button"
          tabindex="0"
          :style="city.name === allDestinationsConst ? {
            background: 'linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)'
          } : {
            backgroundImage: `url(${city.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }"
        >
          <span class="city-pin-icon">
            <AppIcon name="pin" :size="16" />
          </span>
          <span class="city-name">{{ city.displayName || city.name }}</span>
          <small class="city-tag">{{ city.tag }}</small>
        </div>
      </div>

      <!-- HERO SHOWCASE & THUMBNAILS GALLERY TỈNH THÀNH -->
      <div class="province-spotlight-card" v-if="currentSpotlight" v-reveal>
        <div class="spotlight-visual-column">
          <!-- Ảnh lớn hero -->
          <div class="spotlight-hero-wrap">
            <img
              :src="activeHeroImage"
              :alt="currentSpotlight.title"
              class="spotlight-hero-img"
              loading="lazy"
            />
            <div class="spotlight-overlay"></div>
            
            <div class="spotlight-badge-esg">
              <span class="esg-icon"><AppIcon name="leaf" :size="16" /></span>
              <strong>{{ currentSpotlight.esgText }}</strong>
            </div>

            <div class="spotlight-badge-cert" v-if="currentSpotlight.badge">
              <span><AppIcon name="award" :size="16" /> {{ currentSpotlight.badge }}</span>
            </div>

            <button
              type="button"
              class="spotlight-fullscreen-btn"
              @click="isSpotlightModalOpen = true"
              title="Phóng to ảnh toàn màn hình"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
          </div>

          <!-- Dãy hình ảnh miêu tả bên dưới để bấm chuyển ảnh -->
          <div class="spotlight-thumbnails-row">
            <button
              v-for="(thumb, idx) in currentSpotlight.gallery"
              :key="idx"
              type="button"
              :class="['spotlight-thumb-btn', { active: activeHeroImage === thumb.image }]"
              @click="$emit('selectHeroImage', thumb.image)"
              :title="thumb.name"
            >
              <img :src="thumb.image" :alt="thumb.name" loading="lazy" />
              <span class="thumb-caption">{{ thumb.name }}</span>
            </button>
          </div>
        </div>

        <!-- Cột thông tin chi tiết về Tỉnh / Thành phố -->
        <div class="spotlight-info-column">
          <div class="spotlight-header-meta">
            <span class="spotlight-tag-kicker"><AppIcon name="sparkles" :size="14" /> ĐIỂM ĐẾN NỔI BẬT MIỀN TRUNG</span>
            <span class="spotlight-cert-sub">{{ currentSpotlight.certText }}</span>
          </div>
          <h3 class="spotlight-title">{{ currentSpotlight.title }}</h3>
          <p class="spotlight-subtitle">{{ currentSpotlight.subtitle }}</p>
          <p class="spotlight-description">{{ currentSpotlight.description }}</p>

          <!-- Đặc sản nổi tiếng -->
          <div class="spotlight-highlight-box">
            <div class="shb-label"><AppIcon name="utensils" :size="16" /> <b>Đặc sản trứ danh:</b></div>
            <div class="shb-chips">
              <span v-for="spec in currentSpotlight.specialties" :key="spec" class="spotlight-spec-chip">
                {{ spec }}
              </span>
            </div>
          </div>

          <!-- Mùa du lịch lý tưởng -->
          <div class="spotlight-highlight-box">
            <div class="shb-label"><AppIcon name="sun" :size="16" /> <b>Thời điểm lý tưởng:</b></div>
            <p class="shb-text">{{ currentSpotlight.bestSeason }}</p>
          </div>

          <!-- Nút CTA chuyển sang lên lịch trình ngay -->
          <div class="spotlight-actions" v-if="currentDestination !== allDestinationsConst">
            <button
              type="button"
              class="spotlight-cta-btn"
              @click="$emit('planToCity', currentDestination)"
            >
              <span><AppIcon name="sparkles" :size="16" /> Lên lịch trình đến {{ currentDestination }} ngay</span>
              <strong>→</strong>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL PHÓNG TO ẢNH FULLSCREEN KHI CLICK ICON ZOOM -->
      <div
        v-if="isSpotlightModalOpen && currentSpotlight"
        class="spotlight-modal-backdrop"
        @click.self="isSpotlightModalOpen = false"
      >
        <div class="spotlight-modal-box">
          <button
            type="button"
            class="spotlight-modal-close"
            @click="isSpotlightModalOpen = false"
          >
            <AppIcon name="x" :size="20" />
          </button>
          <img :src="activeHeroImage" :alt="currentSpotlight.title" class="spotlight-modal-img" />
          <div class="spotlight-modal-footer">
            <h4>{{ currentSpotlight.title }}</h4>
            <div class="spotlight-modal-thumbs">
              <button
                v-for="(thumb, idx) in currentSpotlight.gallery"
                :key="'modal-' + idx"
                type="button"
                :class="['sm-thumb-btn', { active: activeHeroImage === thumb.image }]"
                @click="$emit('selectHeroImage', thumb.image)"
              >
                <img :src="thumb.image" :alt="thumb.name" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Thời tiết thời gian thực 3D Glassmorphic Capsule -->
    <WeatherGlassCard3D v-if="weather" :weather="weather" />

    <!-- TỔNG QUAN BỀ DÀY LỊCH SỬ & DI SẢN MIỀN TRUNG KHI CHỌN "TẤT CẢ" -->
    <CentralHeritageOverview
      v-if="currentDestination === allDestinationsConst"
      @select-destination="(c) => $emit('selectCity', c)"
    />

    <!-- Danh sách địa điểm đặc sắc theo thành phố CÓ HÌNH ẢNH SỐNG ĐỘNG (KHI CHỌN TỈNH THÀNH CỤ THỂ) -->
    <div v-else class="explore-section" v-reveal>
      <div class="section-title-row">
        <div>
          <h3>Địa điểm & Đặc sản tại {{ currentDestination === allDestinationsConst ? 'Miền Trung' : currentDestination }}</h3>
          <small class="sub-region-hint ai-province-subtitle" v-if="aiProvinceSubtitle">{{ aiProvinceSubtitle }}</small>
          <small class="sub-region-hint" v-else>(Khu vực mở rộng sau sáp nhập)</small>
        </div>
        <div class="filter-pills">
          <button
            :class="['filter-pill', { active: filterExploreType === 'all' }]"
            @click="$emit('update:filterExploreType', 'all')"
          >
            Tất cả ({{ places.length }})
          </button>
          <button
            :class="['filter-pill', { active: filterExploreType === 'attraction' }]"
            @click="$emit('update:filterExploreType', 'attraction')"
          >
            <AppIcon name="landmark" :size="15" /> Thắng cảnh ({{ (attractionsList || []).length }})
          </button>
          <button
            :class="['filter-pill', { active: filterExploreType === 'restaurant' }]"
            @click="$emit('update:filterExploreType', 'restaurant')"
          >
            <AppIcon name="utensils" :size="15" /> Đặc sản ({{ (restaurantsList || []).length }})
          </button>
          <button
            :class="['filter-pill', { active: filterExploreType === 'hotel' }]"
            @click="$emit('update:filterExploreType', 'hotel')"
          >
            <AppIcon name="hotel" :size="15" /> Khách sạn ({{ (hotelsList || []).length }})
          </button>
          <button
            :class="['filter-pill', { active: filterExploreType === 'cafe' }]"
            @click="$emit('update:filterExploreType', 'cafe')"
          >
            <AppIcon name="coffee" :size="15" /> Cafe ({{ (cafesList || []).length }})
          </button>
        </div>
      </div>

      <!-- Thanh tìm kiếm nhanh địa danh, món ăn, bãi biển -->
      <div class="explore-search-box">
        <input
          :value="searchExploreQuery"
          @input="$emit('update:searchExploreQuery', $event.target.value)"
          class="explore-search-input"
          :placeholder="'Tìm kiếm địa danh, di tích, món ăn, bãi biển tại ' + (currentDestination === allDestinationsConst ? 'Miền Trung' : currentDestination) + '...'"
        />
        <button
          v-if="searchExploreQuery"
          class="clear-search-btn"
          @click="$emit('update:searchExploreQuery', '')"
        >
          <AppIcon name="x" :size="14" />
        </button>
      </div>

      <!-- Grid Thẻ Địa điểm CÓ HÌNH ẢNH NỔI BẬT -->
      <div v-if="loadingPlaces" class="places-app-grid">
        <SkeletonCard v-for="i in 5" :key="'skeleton-' + i" />
      </div>

      <div v-else-if="filteredExplorePlaces && filteredExplorePlaces.length">
        <div class="places-app-grid">
          <article
            v-for="place in displayedExplorePlaces"
            :key="place._id || place.name"
            class="app-place-card"
            v-reveal
          >
            <div class="place-img-cover" :style="{ backgroundImage: `url(${getPlaceImage(place)})` }">
              <span :class="['place-card-type', 'type-' + place.type]">
                {{ getPlaceTypeLabel(place.type) }}
              </span>
              <span class="place-img-rating">
                <AppIcon name="star" :size="13" filled color="#f59e0b" />
                {{ place.rating || '4.8' }}
              </span>
              <button
                v-if="user"
                class="heart-action-btn"
                :class="{ active: isFavorite(place._id) }"
                @click.stop="$emit('toggleFavorite', place._id)"
                title="Lưu yêu thích"
              >
                <AppIcon
                  name="heart"
                  :size="18"
                  :filled="isFavorite(place._id)"
                  :color="isFavorite(place._id) ? '#ef4444' : 'currentColor'"
                />
              </button>
            </div>
            <div class="place-card-content">
              <h4>{{ place.name }}</h4>
              <p class="place-card-desc">{{ place.description }}</p>
              <p v-if="place.address" class="place-card-address">
                <AppIcon name="pin" :size="14" /> {{ place.address }}
              </p>
              <div class="place-card-bottom">
                <button
                  v-if="place.type === 'hotel'"
                  type="button"
                  class="view-hotel-rooms-card-btn"
                  @click.stop="$emit('openHotelRooms', place)"
                >
                  <AppIcon name="eye" :size="13" /> Xem phòng
                </button>
                <button class="add-to-plan-btn" @click="$emit('addToPlan', place.name)">
                  + Lên lịch trình
                </button>
                <a
                  class="place-maps-btn"
                  :href="getDirectionsUrl(place.name, place.address)"
                  target="_blank"
                  rel="noreferrer"
                >
                  <AppIcon name="navigation" :size="14" /> Chỉ đường
                </a>
              </div>
            </div>
          </article>
        </div>

        <!-- Thanh nút Xem thêm / Thu gọn khi có nhiều hơn 5 địa điểm -->
        <div v-if="filteredExplorePlaces.length > 5" class="load-more-container">
          <button
            v-if="exploreLimit < filteredExplorePlaces.length"
            class="load-more-btn"
            @click="$emit('loadMore')"
          >
            <span class="load-more-text">Xem thêm địa điểm</span>
            <span class="load-more-count">(Còn {{ filteredExplorePlaces.length - exploreLimit }})</span>
            <AppIcon name="chevrondown" :size="14" class="load-more-icon" />
          </button>
          <button
            v-if="exploreLimit > 5"
            class="collapse-btn"
            @click="$emit('collapse')"
          >
            <span>Thu gọn</span>
            <AppIcon name="chevronup" :size="14" class="load-more-icon" />
          </button>
        </div>
      </div>

      <p v-else class="empty-state-text">Chưa có dữ liệu địa điểm cho khu vực này.</p>
      
      <!-- BẢN ĐỒ TƯƠNG TÁC (MapComponent) -->
      <div v-if="!loadingPlaces && filteredExplorePlaces && filteredExplorePlaces.length > 0" style="margin-top: 32px;">
        <div class="section-title-row">
          <h3><AppIcon name="map" :size="20" /> Bản đồ các điểm đến</h3>
        </div>
        <MapComponent :places="filteredExplorePlaces" :centerCity="currentDestination" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from '../common/AppIcon.vue'
import VolumeSlider from '../common/VolumeSlider.vue'
import SkeletonCard from '../SkeletonCard.vue'
import MapComponent from '../MapComponent.vue'
import CentralHeritageOverview from './CentralHeritageOverview.vue'
import WeatherGlassCard3D from './WeatherGlassCard3D.vue'

const props = defineProps({
  allDestinationsConst: {
    type: String,
    default: 'Tất cả miền Trung'
  },
  currentDestination: {
    type: String,
    default: 'Tất cả miền Trung'
  },
  visibleCities: {
    type: Array,
    default: () => []
  },
  visibleDestinationCards: {
    type: Array,
    default: () => []
  },
  currentSpotlight: {
    type: Object,
    default: null
  },
  activeHeroImage: {
    type: String,
    default: ''
  },
  musicMuted: {
    type: Boolean,
    default: false
  },
  musicVolume: {
    type: Number,
    default: 0.3
  },
  weather: {
    type: Object,
    default: null
  },
  aiProvinceSubtitle: {
    type: String,
    default: ''
  },
  places: {
    type: Array,
    default: () => []
  },
  loadingPlaces: {
    type: Boolean,
    default: false
  },
  filteredExplorePlaces: {
    type: Array,
    default: () => []
  },
  displayedExplorePlaces: {
    type: Array,
    default: () => []
  },
  exploreLimit: {
    type: Number,
    default: 5
  },
  filterExploreType: {
    type: String,
    default: 'all'
  },
  searchExploreQuery: {
    type: String,
    default: ''
  },
  attractionsList: {
    type: Array,
    default: () => []
  },
  restaurantsList: {
    type: Array,
    default: () => []
  },
  hotelsList: {
    type: Array,
    default: () => []
  },
  cafesList: {
    type: Array,
    default: () => []
  },
  user: {
    type: Object,
    default: null
  },
  favoritesList: {
    type: Array,
    default: () => []
  },
  getPlaceImage: {
    type: Function,
    default: (p) => p?.image || ''
  }
})

defineEmits([
  'startPlanner',
  'toggleMusicMute',
  'update:musicVolume',
  'selectCity',
  'selectHeroImage',
  'planToCity',
  'update:filterExploreType',
  'update:searchExploreQuery',
  'openHotelRooms',
  'addToPlan',
  'toggleFavorite',
  'loadMore',
  'collapse'
])

const isSpotlightModalOpen = ref(false)

function isFavorite(placeId) {
  if (!placeId || !props.favoritesList) return false
  return props.favoritesList.some(p => p._id === placeId || p === placeId)
}

function getPlaceTypeLabel(type) {
  const map = {
    attraction: 'Thắng cảnh',
    restaurant: 'Ẩm thực',
    cafe: 'Cafe & Bar',
    hotel: 'Khách sạn'
  }
  return map[type] || 'Địa điểm'
}

function getDirectionsUrl(placeName, address = '') {
  const query = address ? `${placeName}, ${address}` : `${placeName}, ${props.currentDestination}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

function getWeatherIcon(code) {
  if (code === 0) return 'sun'
  if (code <= 3) return 'cloudsun'
  if (code <= 48) return 'wind'
  if (code <= 67 || code <= 82) return 'cloudrain'
  return 'cloudlightning'
}

function getWeatherDesc(code) {
  if (code === 0) return 'Trời nắng đẹp'
  if (code <= 3) return 'Có mây nhẹ'
  if (code <= 48) return 'Sương mù nhẹ'
  if (code <= 67 || code <= 82) return 'Có mưa rào'
  return 'Dông bão'
}

function formatDay(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
}
</script>
