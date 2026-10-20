<template>
  <section class="tab-pane">
    <!-- Banner Hero App -->
    <div class="app-hero-card"></div>

    <!-- Thanh chọn nhanh Tỉnh/Thành phố dạng Thẻ Ảnh (CINEMATIC SHOWCASE & AMBIENT GLOW MOCKUP REPLICA) -->
    <div class="explore-section spotlight-master-section" v-reveal>
      <div class="section-title-row spotlight-title-row">
        <div class="spotlight-header-headline">
          <div class="spotlight-hero-kicker">
            <span class="kicker-glow-dot"></span>
            <span>TÂM ĐIỂM TRẢI NGHIỆM MIỀN TRUNG</span>
          </div>
          <h3 class="spotlight-main-heading">Điểm đến nổi tiếng</h3>
          <p class="spotlight-main-subheading">Chọn tỉnh thành để khám phá tâm điểm du lịch & gợi ý lịch trình độc quyền</p>
        </div>

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

      <!-- Carousel bọc ngoài với nút cuộn trái / phải như Mockup -->
      <div class="carousel-outer-shell">
        <button
          type="button"
          class="carousel-nav-btn prev"
          @click="scrollCarousel('left')"
          title="Xem trước"
          aria-label="Cuộn trái"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="cities-carousel" ref="carouselRef">
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
            <div class="city-card-vignette"></div>
            <span class="city-ratio-tag">16:9</span>
            <span class="city-active-pill" v-if="currentDestination === city.name">
              <span class="active-dot"></span> ACTIVE
            </span>
            <span class="city-name-uppercase">{{ (city.displayName || city.name).toUpperCase() }}</span>
          </div>
        </div>

        <button
          type="button"
          class="carousel-nav-btn next"
          @click="scrollCarousel('right')"
          title="Xem tiếp"
          aria-label="Cuộn phải"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- HERO SHOWCASE SPOTLIGHT CARD (CHUẨN 100% THEO MOCKUP PHƯƠNG ÁN 1) -->
      <div class="province-spotlight-card" v-if="currentSpotlight" v-reveal>
        <!-- Vầng hào quang Ambient Glow phát sáng nền -->
        <div class="spotlight-ambient-glow" aria-hidden="true"></div>

        <!-- CỘT TRÁI: HERO STAGE ĐIỆN ẢNH VỚI CHỮ VÀ HUY HIỆU ĐÈ LÊN ẢNH -->
        <div class="spotlight-cinematic-stage">
          <img
            :src="activeHeroImage"
            :alt="currentSpotlight.title"
            class="stage-hero-img"
            loading="lazy"
          />
          <div class="stage-gradient-vignette"></div>

          <!-- Nút phóng to fullscreen ở góc trên -->
          <button
            type="button"
            class="stage-fullscreen-btn"
            @click="isSpotlightModalOpen = true"
            title="Phóng to ảnh toàn màn hình"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>

          <!-- KHỐI CHỮ & HUY HIỆU VÀNG HOÀNG GIA ĐÈ LÊN ĐÁY ẢNH HERO -->
          <div class="stage-bottom-overlay">
            <div class="stage-title-wrap">
              <h2 class="stage-gold-title">{{ formatSpotlightTitle(currentSpotlight.title).mainName }}</h2>
              <span class="stage-title-sep" v-if="formatSpotlightTitle(currentSpotlight.title).subName">-</span>
              <span class="stage-sub-title" v-if="formatSpotlightTitle(currentSpotlight.title).subName">
                {{ formatSpotlightTitle(currentSpotlight.title).subName }}
              </span>
            </div>

            <p class="stage-desc-text">{{ currentSpotlight.description }}</p>

            <div class="stage-footer-row">
              <!-- Huy hiệu UNESCO / Di sản vàng sang trọng -->
              <div class="stage-unesco-pill">
                <span class="unesco-gold-emblem">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </span>
                <span class="unesco-text">{{ currentSpotlight.badge || 'UNESCO Heritage Site | 1993' }}</span>
              </div>

              <!-- Dãy thumbnail danh lam thu nhỏ nổi trên ảnh để bấm chuyển mượt mà -->
              <div class="stage-mini-thumbs" v-if="currentSpotlight.gallery && currentSpotlight.gallery.length">
                <button
                  v-for="(thumb, idx) in currentSpotlight.gallery"
                  :key="idx"
                  type="button"
                  :class="['mini-thumb-dot', { active: activeHeroImage === thumb.image }]"
                  @click="$emit('selectHeroImage', thumb.image)"
                  :title="thumb.name"
                >
                  <img :src="thumb.image" :alt="thumb.name" loading="lazy" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: 3 KHỐI BENTO INTERACTIVE CHUẨN MOCKUP -->
        <div class="spotlight-bento-column">
          <!-- BENTO 1: TOP 3 ĐẶC SẢN DẠNG CARD CÓ HÌNH ẢNH MÓN ĂN -->
          <div class="bento-specialties-block">
            <div class="bento-block-header">
              <span class="bento-header-label">
                <AppIcon name="utensils" :size="15" /> ĐẶC SẢN TRỨ DANH
              </span>
              <span class="bento-header-sub">Món ngon bản địa</span>
            </div>

            <div class="bento-dishes-grid">
              <div
                v-for="(dish, dIdx) in getTopDishes(currentDestination, currentSpotlight.specialties)"
                :key="dIdx"
                class="bento-dish-card"
                :title="dish.name"
              >
                <div class="dish-photo-wrap">
                  <img :src="dish.image" :alt="dish.name" loading="lazy" />
                </div>
                <h4 class="dish-title">{{ dish.name }}</h4>
                <div class="dish-price-row">
                  <span class="dish-tag">{{ dish.tag || 'Món ngon' }}</span>
                  <span class="dish-info-icon">ℹ</span>
                </div>
              </div>
            </div>
          </div>

          <!-- BENTO 2: BEST TIME TO VISIT DẠNG CAPSULE KÍNH MỜ CÓ ICON VÀNG & SPARKLINE -->
          <div class="bento-season-card">
            <div class="season-gold-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>

            <div class="season-content">
              <div class="season-kicker">BEST TIME TO VISIT</div>
              <div class="season-big-text">{{ extractSeasonMonths(currentSpotlight.bestSeason) }}</div>
              <div class="season-desc">{{ extractSeasonDesc(currentSpotlight.bestSeason) }}</div>
            </div>

            <!-- Đường biểu đồ sóng khí hậu Sparkline vàng sang trọng -->
            <div class="season-sparkline" aria-hidden="true">
              <svg width="68" height="34" viewBox="0 0 68 34" fill="none">
                <path d="M2 28 C 16 28, 22 8, 38 16 C 50 22, 56 6, 64 8" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="64" cy="8" r="3.5" fill="#f59e0b" />
              </svg>
            </div>
          </div>

          <!-- BENTO 3: NÚT CTA XANH CYAN PHÁT SÁNG NEON DẠNG VIÊN THUỐC PILL -->
          <div class="bento-cta-wrap" v-if="currentDestination !== allDestinationsConst">
            <button
              type="button"
              class="bento-flagship-cta"
              @click="$emit('planToCity', currentDestination)"
            >
              <span class="bento-cta-text">LÊN LỊCH TRÌNH ĐẾN {{ currentDestination.toUpperCase() }} NGAY</span>
              <span class="bento-cta-arrow">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
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

    <!-- Danh sách địa điểm đặc sắc theo thành phố CÓ HÌNH ẢNH SỐNG ĐỘNG -->
    <div class="explore-section" v-reveal>
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


const carouselRef = ref(null)

function scrollCarousel(direction) {
  if (!carouselRef.value) return
  const amount = direction === 'left' ? -280 : 280
  carouselRef.value.scrollBy({ left: amount, behavior: 'smooth' })
}

function formatSpotlightTitle(title) {
  if (!title) return { mainName: 'ĐIỂM ĐẾN', subName: '' }
  const parts = title.split(' - ')
  if (parts.length > 1) {
    return { mainName: parts[0].trim(), subName: parts.slice(1).join(' - ').trim() }
  }
  const colonParts = title.split(': ')
  if (colonParts.length > 1) {
    return { mainName: colonParts[0].trim(), subName: colonParts.slice(1).join(': ').trim() }
  }
  return { mainName: title, subName: '' }
}

function extractSeasonMonths(bestSeason) {
  if (!bestSeason) return 'QUANH NĂM'
  const match = bestSeason.match(/(Tháng\s*\d+\s*-\s*Tháng\s*\d+)/i)
  if (match) return match[1].toUpperCase()
  const parenIdx = bestSeason.indexOf('(')
  if (parenIdx !== -1) {
    return bestSeason.substring(0, parenIdx).trim().toUpperCase()
  }
  return bestSeason.length > 22 ? bestSeason.substring(0, 22).toUpperCase() : bestSeason.toUpperCase()
}

function extractSeasonDesc(bestSeason) {
  if (!bestSeason) return 'Khí hậu khô ráo, nắng vàng chan hòa'
  const match = bestSeason.match(/\((.*?)\)/)
  if (match) {
    let desc = match[1]
    if (desc.length > 60) desc = desc.substring(0, 57) + '...'
    return desc
  }
  return 'Thời tiết ôn hòa lý tưởng khám phá'
}

const PROVINCE_DISH_IMAGES = {
  'Đà Nẵng': [
    { name: 'Mì Quảng Ếch', tag: 'Món #1', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80' },
    { name: 'Bánh Tráng Thịt Heo', tag: 'Trứ danh', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=80' },
    { name: 'Bánh Xèo Nem Lụi', tag: 'Phố cổ', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80' }
  ],
  'Huế': [
    { name: 'Bún Bò Huế', tag: 'Món #1', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80' },
    { name: 'Cơm Hến Sông Hương', tag: 'Cung đình', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&auto=format&fit=crop&q=80' },
    { name: 'Bánh Khoái Cố Đô', tag: 'Đặc sản', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80' }
  ],
  'Quảng Nam': [
    { name: 'Cao Lầu Hội An', tag: 'Món #1', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80' },
    { name: 'Cơm Gà Phố Hội', tag: 'Trứ danh', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=80' },
    { name: 'Bánh Mì Phượng', tag: 'Nổi tiếng', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300&auto=format&fit=crop&q=80' }
  ],
  'Quảng Bình': [
    { name: 'Cháo Canh Cá Lóc', tag: 'Món #1', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80' },
    { name: 'Bánh Lọc Mệ Xuân', tag: 'Đặc sản', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=80' },
    { name: 'Đẻn Biển Quảng Bình', tag: 'Lạ vị', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80' }
  ],
  'Quảng Trị': [
    { name: 'Thịt Trâu Lá Trơng', tag: 'Món #1', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80' },
    { name: 'Bánh Khoái Chợ Sãi', tag: 'Dân dã', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=80' },
    { name: 'Cháo Bột Vịt', tag: 'Đậm đà', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80' }
  ],
  'Khánh Hòa': [
    { name: 'Bún Chả Cá', tag: 'Món #1', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80' },
    { name: 'Nem Nướng Ninh Hòa', tag: 'Trứ danh', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80' },
    { name: 'Bánh Căn Mực', tag: 'Biển xanh', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=80' }
  ]
}

const DEFAULT_FOOD_PHOTOS = [
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80'
]

function getTopDishes(city, specialties) {
  if (city && PROVINCE_DISH_IMAGES[city]) {
    return PROVINCE_DISH_IMAGES[city]
  }
  if (specialties && specialties.length) {
    return specialties.slice(0, 3).map((spec, i) => ({
      name: spec,
      tag: i === 0 ? 'Món #1' : (i === 1 ? 'Đặc sản' : 'Phải thử'),
      image: DEFAULT_FOOD_PHOTOS[i % DEFAULT_FOOD_PHOTOS.length]
    }))
  }
  return [
    { name: 'Đặc sản bản địa', tag: 'Món #1', image: DEFAULT_FOOD_PHOTOS[0] },
    { name: 'Ẩm thực truyền thống', tag: 'Trứ danh', image: DEFAULT_FOOD_PHOTOS[1] },
    { name: 'Món ngon nổi tiếng', tag: 'Phải thử', image: DEFAULT_FOOD_PHOTOS[2] }
  ]
}

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
