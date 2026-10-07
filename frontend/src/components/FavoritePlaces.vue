<template>
  <div class="favorites-container" v-if="favoritesList && favoritesList.length > 0">
    <div class="favorites-header">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="heart-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        Địa điểm đã lưu yêu thích ({{ favoritesList.length }})
      </h3>
    </div>
    
    <div class="favorites-grid">
      <article v-for="place in favoritesList" :key="place._id" class="fav-place-card">
        <div class="card-image-placeholder" :style="{ backgroundImage: 'url(' + getPlaceImage(place) + ')' }">
          <div class="overlay-gradient"></div>
          <span class="place-type-badge">{{ getPlaceTypeLabel(place.type) }}</span>
          <button class="heart-btn active" @click="$emit('doiYeuThich', place._id)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
        
        <div class="card-content">
          <h4 class="place-name">{{ place.name }}</h4>
          <p class="place-desc">{{ place.description }}</p>
          
          <div class="card-footer">
            <p class="place-address" v-if="place.address">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {{ place.address }}
            </p>
            <a class="maps-btn" :href="chiDuongUrl(place.name, place.address)" target="_blank">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
              Chỉ đường
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
defineProps({
  favoritesList: {
    type: Array,
    default: () => []
  },
  getPlaceImage: {
    type: Function,
    default: (place) => place.image || 'https://images.unsplash.com/photo-1544254146-24e030219662?w=600&auto=format&fit=crop&q=80'
  }
})

defineEmits(['doiYeuThich'])

// Replicate the logic from App.vue
const getPlaceTypeLabel = (type) => {
  const map = {
    'thang_canh': 'Thắng cảnh',
    'di_tich': 'Di tích',
    'bien': 'Biển',
    'giai_tri': 'Giải trí',
    'am_thuc': 'Ẩm thực',
    'luu_tru': 'Lưu trú'
  }
  return map[type] || 'Địa điểm'
}

const chiDuongUrl = (name, address) => {
  const query = encodeURIComponent(`${name} ${address || ''}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
</script>

<style scoped>
.favorites-container {
  max-width: 900px;
  margin: 3rem auto 0;
  padding: 0 1rem 2rem;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.favorites-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.app-dark .favorites-header {
  border-color: #374151;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  letter-spacing: -0.01em;
}
.app-dark .section-title { color: #f9fafb; }

.heart-icon {
  color: #ef4444;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.fav-place-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}
.fav-place-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08);
  border-color: #e5e7eb;
}
.app-dark .fav-place-card {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.app-dark .fav-place-card:hover {
  border-color: #4b5563;
}

.card-image-placeholder {
  height: 160px;
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: #e5e7eb;
  border-bottom: 1px solid #f3f4f6;
}

.overlay-gradient {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
}

.app-dark .card-image-placeholder {
  border-color: #4b5563;
}

.place-type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255,255,255,0.95);
  color: #111827;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 2;
}
.app-dark .place-type-badge {
  background: rgba(17,24,39,0.9);
  color: #e5e7eb;
}

.heart-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 2;
}
.heart-btn:hover {
  transform: scale(1.1);
  background: #ffffff;
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.place-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.app-dark .place-name { color: #f9fafb; }

.place-desc {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}
.app-dark .place-desc { color: #9ca3af; }

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

.place-address {
  font-size: 0.8rem;
  color: #4b5563;
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin: 0;
  line-height: 1.4;
}
.app-dark .place-address { color: #d1d5db; }
.place-address svg { flex-shrink: 0; margin-top: 2px; }

.maps-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem;
  background: #f3f4f6;
  color: #111827;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
}
.maps-btn:hover {
  background: #e5e7eb;
}
.app-dark .maps-btn {
  background: #374151;
  color: #f9fafb;
}
.app-dark .maps-btn:hover {
  background: #4b5563;
}
</style>
