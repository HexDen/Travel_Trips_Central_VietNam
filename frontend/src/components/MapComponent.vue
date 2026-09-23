<template>
  <div class="map-container">
    <l-map
      ref="mapRef"
      v-model:zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
      class="leaflet-map"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
        attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
      />

      <l-marker
        v-for="place in validPlaces"
        :key="place._id"
        :lat-lng="[place.latitude, place.longitude]"
      >
        <!-- Tùy biến icon nếu cần -->
        <l-popup>
          <div class="map-popup">
            <strong>{{ place.name }}</strong>
            <p>{{ place.address }}</p>
            <span :class="'badge type-' + place.type">{{ typeLabel(place.type) }}</span>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
// Khắc phục lỗi icon Leaflet trong Vue
import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
})

const props = defineProps({
  places: {
    type: Array,
    default: () => []
  },
  centerCity: {
    type: String,
    default: 'Đà Nẵng'
  }
})

// Tọa độ trung tâm (mặc định Đà Nẵng)
const center = ref([16.0544, 108.2022])
const zoom = ref(12)

const validPlaces = computed(() => {
  return props.places.filter(p => p.latitude && p.longitude)
})

watch(() => validPlaces.value, (newPlaces) => {
  if (newPlaces.length > 0) {
    // Tính trung bình cộng tọa độ để fit map
    const lats = newPlaces.map(p => p.latitude)
    const lngs = newPlaces.map(p => p.longitude)
    const midLat = lats.reduce((a,b) => a+b, 0) / lats.length
    const midLng = lngs.reduce((a,b) => a+b, 0) / lngs.length
    center.value = [midLat, midLng]
  }
})

function typeLabel(type) {
  const m = {
    attraction: 'Thắng cảnh',
    restaurant: 'Nhà hàng',
    cafe: 'Quán Cafe',
    hotel: 'Khách sạn'
  }
  return m[type] || 'Địa điểm'
}
</script>

<style scoped>
.map-container {
  height: 400px;
  width: 100%;
  border-radius: var(--radius-md, 20px);
  overflow: hidden;
  box-shadow: var(--shadow-sm, 0 4px 20px rgba(0,0,0,0.04));
  border: 1px solid var(--border-color, #e2e8f0);
}
.leaflet-map {
  z-index: 1; /* fix stack context */
}
.map-popup {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.map-popup strong {
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
  color: var(--text-main, #1e293b);
}
.map-popup p {
  font-size: 12px;
  color: var(--text-sub, #64748b);
  margin-bottom: 8px;
}
.badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 8px;
  display: inline-block;
}
.type-attraction { background: #e8f5e9; color: #166534; }
.type-restaurant { background: #fff7ed; color: #c2410c; }
.type-cafe { background: #fdf4ff; color: #86198f; }
.type-hotel { background: #eff6ff; color: #1d4ed8; }

:root[data-theme="dark"] .map-container {
  border-color: var(--border-color);
}
/* Leaflet map inside dark mode trick (invert colors for map tiles) */
:root[data-theme="dark"] .leaflet-layer {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}
</style>
