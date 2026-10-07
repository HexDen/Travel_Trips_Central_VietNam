<template>
  <div class="map-wrapper">
    <!-- Thanh điều khiển trên bản đồ (Google Maps Toolbar) -->
    <div class="map-toolbar">
      <!-- Nhóm chuyển đổi lớp bản đồ -->
      <div class="map-mode-switch">
        <button
          type="button"
          :class="['mode-btn', { active: currentLayer === 'roadmap' }]"
          @click="currentLayer = 'roadmap'"
        >
          <AppIcon name="map" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Bản đồ
        </button>
        <button
          type="button"
          :class="['mode-btn', { active: currentLayer === 'satellite' }]"
          @click="currentLayer = 'satellite'"
        >
          <AppIcon name="globe" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Vệ tinh
        </button>
        <button
          type="button"
          :class="['mode-btn', { active: currentLayer === 'terrain' }]"
          @click="currentLayer = 'terrain'"
        >
          <AppIcon name="mountain" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Địa hình
        </button>
      </div>

      <!-- Nhóm công cụ gom cụm & Mở Google Maps -->
      <div class="map-toolbar-actions">
        <button
          type="button"
          :class="['cluster-toggle-btn', { active: enableClustering }]"
          @click="toggleClustering"
          :title="enableClustering ? 'Đang bật gom cụm chống ngợp ghim. Bấm để bung toàn bộ' : 'Bấm để bật gom cụm ghim gọn gàng'"
        >
          <span class="cluster-icon" style="display: inline-flex; align-items: center;"><AppIcon name="sparkles" size="14" /></span>
          <span>{{ enableClustering ? 'Gom cụm: BẬT' : 'Gom cụm: TẮT' }}</span>
        </button>
        <span class="map-pin-badge" style="display: inline-flex; align-items: center; gap: 4px;">
          <AppIcon name="pin" size="13" /> {{ displayedItemsCount }} / {{ validPlaces.length }} điểm
          <small v-if="enableClustering && zoom < 14" class="clustering-tag">(Gom {{ clusters.length }} cụm)</small>
        </span>
        <a
          :href="googleMapsUrl"
          target="_blank"
          rel="noreferrer"
          class="external-gmap-btn"
          title="Mở toàn màn hình trên Google Maps"
        >
          <span>Mở Google Maps</span>
          <strong>↗</strong>
        </a>
      </div>
    </div>

    <!-- Thanh bộ lọc danh mục chống ngợp bản đồ -->
    <div class="map-filter-bar">
      <div class="filter-chips-list">
        <button
          type="button"
          :class="['map-filter-chip', { active: categoryFilter === 'all' }]"
          @click="categoryFilter = 'all'"
        >
          <AppIcon name="globe" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Tất cả ({{ validPlaces.length }})
        </button>
        <button
          type="button"
          :class="['map-filter-chip highlight-chip', { active: categoryFilter === 'top25' }]"
          @click="categoryFilter = 'top25'"
        >
          <AppIcon name="star" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Top 25 nổi bật
        </button>
        <button
          type="button"
          :class="['map-filter-chip', { active: categoryFilter === 'attraction' }]"
          @click="categoryFilter = 'attraction'"
        >
          <AppIcon name="landmark" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Thắng cảnh ({{ countByType('attraction') }})
        </button>
        <button
          type="button"
          :class="['map-filter-chip', { active: categoryFilter === 'restaurant' }]"
          @click="categoryFilter = 'restaurant'"
        >
          <AppIcon name="utensils" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Ẩm thực ({{ countByType('restaurant') }})
        </button>
        <button
          type="button"
          :class="['map-filter-chip', { active: categoryFilter === 'hotel' }]"
          @click="categoryFilter = 'hotel'"
        >
          <AppIcon name="hotel" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Khách sạn ({{ countByType('hotel') }})
        </button>
        <button
          type="button"
          :class="['map-filter-chip', { active: categoryFilter === 'cafe' }]"
          @click="categoryFilter = 'cafe'"
        >
          <AppIcon name="coffee" size="14" style="margin-right: 4px; vertical-align: -2px;" /> Cafe ({{ countByType('cafe') }})
        </button>
      </div>
    </div>

    <!-- Khung Bản Đồ Google Maps -->
    <div class="map-container">
      <l-map
        ref="mapRef"
        v-model:zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        class="leaflet-map"
        @ready="onMapReady"
      >
        <!-- Google Maps Tile Layer -->
        <l-tile-layer
          :key="currentLayer"
          :url="tileUrl"
          layer-type="base"
          name="Google Maps"
          attribution="&copy; Google Maps"
          :max-zoom="20"
        />

        <!-- TRƯỜNG HỢP 1: CÁC CỤM GHIM (MARKER CLUSTERS) KHI ZOOM XA VÀ BẬT GOM CỤM -->
        <template v-if="enableClustering && zoom < 14">
          <l-marker
            v-for="cluster in clusters"
            :key="cluster.id"
            :lat-lng="[cluster.latitude, cluster.longitude]"
            :icon="getClusterIcon(cluster)"
            @click="zoomToCluster(cluster)"
          >
            <l-popup>
              <div class="gmap-popup cluster-popup">
                <div class="cluster-popup-head">
                  <span class="cluster-badge" style="display: inline-flex; align-items: center; gap: 4px;"><AppIcon name="sparkles" size="13" /> Cụm địa điểm</span>
                  <span class="cluster-count-label">{{ cluster.count }} địa điểm</span>
                </div>
                <strong class="cluster-popup-title">Khu vực tập trung nhiều điểm đến</strong>
                <p class="cluster-popup-desc">
                  Bao gồm: {{ cluster.previewNames }}
                </p>
                <button
                  type="button"
                  class="popup-zoom-btn"
                  @click="zoomToCluster(cluster)"
                  style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;"
                >
                  <AppIcon name="search" size="13" /> Phóng to để xem chi tiết từng điểm ➔
                </button>
              </div>
            </l-popup>
          </l-marker>
        </template>

        <!-- TRƯỜNG HỢP 2: GHIM ĐƠN LẺ (KHI ZOOM GẦN HOẶC TẮT GOM CỤM HOẶC LỌC DANH MỤC) -->
        <template v-else>
          <l-marker
            v-for="place in filteredPlaces"
            :key="place._id || place.name"
            :lat-lng="[place.latitude, place.longitude]"
            :icon="getCustomPin(place.type)"
          >
            <l-popup>
              <div class="gmap-popup">
                <div class="gmap-popup-header">
                  <span :class="['popup-badge', 'type-' + place.type]">{{ typeLabel(place.type) }}</span>
                  <span class="popup-rating" style="display: inline-flex; align-items: center; gap: 4px;"><AppIcon name="star" size="12" filled color="#f59e0b" /> {{ place.rating || '4.8' }}</span>
                </div>
                <strong class="popup-title">{{ place.name }}</strong>
                <p v-if="place.address" class="popup-address" style="display: flex; align-items: center; gap: 4px;"><AppIcon name="pin" size="13" /> {{ place.address }}</p>
                <div class="popup-actions">
                  <a
                    :href="getDirectionUrl(place)"
                    target="_blank"
                    rel="noreferrer"
                    class="popup-dir-btn"
                    style="display: inline-flex; align-items: center; gap: 6px;"
                  >
                    <AppIcon name="map" size="13" /> Chỉ đường trên Google Maps ↗
                  </a>
                </div>
              </div>
            </l-popup>
          </l-marker>
        </template>
      </l-map>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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

// Chế độ bản đồ Google Maps: roadmap (chuẩn), satellite (vệ tinh + nhãn đường), terrain (địa hình)
const currentLayer = ref('roadmap')

// Bật/tắt tính năng gom cụm Marker Clustering
const enableClustering = ref(true)

function toggleClustering() {
  enableClustering.value = !enableClustering.value
}

// Bộ lọc danh mục trên bản đồ: all, top25, attraction, restaurant, hotel, cafe
const categoryFilter = ref('all')

const GOOGLE_TILES = {
  roadmap: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
}

const tileUrl = computed(() => GOOGLE_TILES[currentLayer.value] || GOOGLE_TILES.roadmap)

// Tọa độ trung tâm các tỉnh Miền Trung
const CITY_CENTERS = {
  'Đà Nẵng':    [16.0544, 108.2022],
  'Huế':        [16.4637, 107.5909],
  'Hội An':     [15.8801, 108.3380],
  'Quảng Nam':  [15.5893, 107.9866],
  'Quảng Ngãi': [15.1205, 108.7923],
  'Khánh Hòa':  [12.2388, 109.1967],
  'Nha Trang':  [12.2388, 109.1967],
  'Lâm Đồng':   [11.9404, 108.4583],
  'Đà Lạt':     [11.9404, 108.4583],
  'Đắk Lắk':    [12.6667, 108.0383],
  'Gia Lai':    [13.9833, 108.0000],
  'Quảng Trị':  [16.8158, 107.1008],
  'Quảng Bình': [17.4696, 106.6226],
  'Hà Tĩnh':    [18.3559, 105.8877],
  'Nghệ An':    [18.6738, 105.6922],
  'Thanh Hóa':  [19.8073, 105.7765]
}

const mapRef = ref(null)
const mapInstance = ref(null)
const zoom = ref(13)
const center = ref(CITY_CENTERS[props.centerCity] || [16.0544, 108.2022])

// Lọc các địa điểm có tọa độ hợp lệ
const validPlaces = computed(() => {
  return props.places.filter(p => {
    const lat = Number(p.latitude)
    const lng = Number(p.longitude)
    return !isNaN(lat) && !isNaN(lng) && lat > 8 && lat < 24 && lng > 102 && lng < 112
  })
})

// Đếm số lượng điểm theo loại
function countByType(type) {
  return validPlaces.value.filter(p => p.type === type).length
}

// Lọc danh sách địa điểm theo categoryFilter
const filteredPlaces = computed(() => {
  const all = validPlaces.value
  if (categoryFilter.value === 'all') return all

  if (categoryFilter.value === 'top25') {
    // Sắp xếp theo rating cao nhất và lấy 25 điểm nổi bật nhất
    return [...all]
      .sort((a, b) => (Number(b.rating) || 4.5) - (Number(a.rating) || 4.5))
      .slice(0, 25)
  }

  return all.filter(p => p.type === categoryFilter.value)
})

// Tính toán gom cụm (Marker Clustering) theo ô lưới địa lý
const clusters = computed(() => {
  const places = filteredPlaces.value
  if (!places.length) return []

  // Bước nhảy ô lưới thu nhỏ dần theo mức zoom
  // Zoom nhỏ (9-11): gom cụm lớn; Zoom trung bình (12-13): cụm nhỏ hơn
  const currentZ = zoom.value || 12
  const step = 0.08 / Math.pow(1.65, Math.max(1, currentZ - 9))

  const gridMap = new Map()

  for (const p of places) {
    const lat = Number(p.latitude)
    const lng = Number(p.longitude)
    const row = Math.round(lat / step)
    const col = Math.round(lng / step)
    const key = `${row}_${col}`

    if (!gridMap.has(key)) {
      gridMap.set(key, {
        id: key,
        sumLat: 0,
        sumLng: 0,
        count: 0,
        places: []
      })
    }

    const cell = gridMap.get(key)
    cell.sumLat += lat
    cell.sumLng += lng
    cell.count += 1
    cell.places.push(p)
  }

  const result = []
  for (const [key, cell] of gridMap.entries()) {
    const avgLat = cell.sumLat / cell.count
    const avgLng = cell.sumLng / cell.count
    const previewList = cell.places.slice(0, 3).map(p => p.name)
    const remaining = cell.count - previewList.length
    const previewNames = previewList.join(', ') + (remaining > 0 ? ` và ${remaining} điểm khác` : '')

    result.push({
      id: key,
      latitude: avgLat,
      longitude: avgLng,
      count: cell.count,
      places: cell.places,
      previewNames
    })
  }

  return result
})

// Số lượng item đang hiển thị trên bản đồ (cụm hoặc ghim đơn)
const displayedItemsCount = computed(() => {
  if (enableClustering.value && zoom.value < 14) {
    return filteredPlaces.value.length
  }
  return filteredPlaces.value.length
})

// Phóng to khi người dùng click vào cụm ghim
function zoomToCluster(cluster) {
  if (!mapInstance.value) return
  const targetZoom = Math.min((zoom.value || 12) + 3, 16)
  mapInstance.value.flyTo([cluster.latitude, cluster.longitude], targetZoom, {
    animate: true,
    duration: 0.6
  })
}

// Icon cho Cụm Marker (Cluster Icon với hiệu ứng vòng sáng Teal và số lượng)
function getClusterIcon(cluster) {
  const count = cluster.count
  let size = 38
  let badgeColor = '#0d9488'
  let ringColor = 'rgba(20, 184, 166, 0.45)'

  if (count >= 30) {
    size = 48
    badgeColor = '#0f766e'
    ringColor = 'rgba(15, 118, 110, 0.5)'
  } else if (count >= 10) {
    size = 42
    badgeColor = '#14b8a6'
    ringColor = 'rgba(20, 184, 166, 0.4)'
  }

  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: ${badgeColor};
      color: #ffffff;
      font-weight: 800;
      font-size: ${count >= 100 ? '11px' : '13px'};
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 4px ${ringColor}, 0 6px 16px rgba(0,0,0,0.3);
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    " class="cluster-pulse-marker">
      <span>${count}</span>
    </div>
  `

  return L.divIcon({
    className: 'custom-cluster-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  })
}

// Link mở Google Maps đầy đủ theo thành phố
const googleMapsUrl = computed(() => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.centerCity + ', Việt Nam')}`
})

// Link chỉ đường trực tiếp tới địa điểm
function getDirectionUrl(place) {
  const q = place.name + (place.address ? ', ' + place.address : ', ' + props.centerCity)
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`
}

// Khi bản đồ khởi tạo xong
function onMapReady(map) {
  mapInstance.value = map
  nextTick(() => {
    map.invalidateSize()
    updateMapBounds()
  })
}

// Cập nhật lại khung nhìn và zoom khi danh sách địa điểm thay đổi
function updateMapBounds() {
  if (!mapInstance.value) return

  const targetList = filteredPlaces.value.length > 0 ? filteredPlaces.value : validPlaces.value

  if (targetList.length > 0) {
    const latLngs = targetList.map(p => [Number(p.latitude), Number(p.longitude)])
    const bounds = L.latLngBounds(latLngs)
    if (bounds.isValid()) {
      mapInstance.value.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 15,
        animate: true
      })
      return
    }
  }

  // Fallback: nếu không có địa điểm nào có tọa độ, về trung tâm thành phố
  const defaultCityCoord = CITY_CENTERS[props.centerCity] || [16.0544, 108.2022]
  mapInstance.value.setView(defaultCityCoord, 13, { animate: true })
}

watch(() => props.centerCity, (newCity) => {
  if (CITY_CENTERS[newCity]) {
    center.value = CITY_CENTERS[newCity]
  }
  nextTick(() => {
    updateMapBounds()
  })
})

watch(() => validPlaces.value, () => {
  nextTick(() => {
    updateMapBounds()
  })
}, { deep: true })

watch(() => categoryFilter.value, () => {
  nextTick(() => {
    updateMapBounds()
  })
})

onMounted(() => {
  setTimeout(() => {
    if (mapInstance.value) {
      mapInstance.value.invalidateSize()
      updateMapBounds()
    }
  }, 400)
})

// Tạo Marker Pin dạng giọt nước SVG với màu sắc riêng cho từng loại địa điểm
function getCustomPin(type) {
  const configs = {
    attraction: { 
      color: '#0d9488', 
      svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' 
    },
    restaurant: { 
      color: '#e65100', 
      svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M5 2v4a3 3 0 0 0 3 3v13"/></svg>' 
    },
    cafe: { 
      color: '#8b5cf6', 
      svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>' 
    },
    hotel: { 
      color: '#0284c7', 
      svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/><path d="M8 7h.01"/><path d="M16 7h.01"/><path d="M12 7h.01"/><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M8 11h.01"/></svg>' 
    }
  }
  const defaultCfg = { 
    color: '#0d9488', 
    svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' 
  }
  const cfg = configs[type] || defaultCfg

  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${cfg.color};
      border: 2px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      cursor: pointer;
      transition: transform 0.2s ease;
    ">
      <span style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; user-select: none;">${cfg.svg}</span>
    </div>
  `

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

function typeLabel(type) {
  const m = {
    attraction: 'Thắng cảnh',
    restaurant: 'Ẩm thực',
    cafe: 'Cafe',
    hotel: 'Khách sạn'
  }
  return m[type] || 'Địa điểm'
}
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Thanh điều khiển Google Maps */
.map-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.map-mode-switch {
  display: inline-flex;
  background: var(--input-bg, #f1f5f9);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
}

.mode-btn {
  background: transparent;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  color: var(--primary, #0d7c76);
}

.mode-btn.active {
  background: var(--card-bg, #ffffff);
  color: var(--primary, #0d7c76);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.map-toolbar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

/* Nút bật/tắt Gom cụm ghim */
.cluster-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--card-bg, #ffffff);
  border: 1.5px solid var(--border-color, #e2e8f0);
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-sub, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cluster-toggle-btn:hover {
  border-color: var(--primary, #0d9488);
  color: var(--primary, #0d9488);
}

.cluster-toggle-btn.active {
  background: #f0fdfa;
  border-color: #14b8a6;
  color: #0f766e;
}

.cluster-icon {
  font-size: 14px;
}

.map-pin-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary, #0d7c76);
  background: rgba(13, 124, 118, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.clustering-tag {
  font-size: 11px;
  color: #0f766e;
  font-weight: 600;
}

.external-gmap-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--card-bg, #ffffff);
  color: var(--text-main, #1e293b);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.external-gmap-btn:hover {
  background: var(--primary, #0d7c76);
  color: #ffffff;
  border-color: var(--primary, #0d7c76);
}

/* Thanh bộ lọc danh mục bản đồ */
.map-filter-bar {
  display: flex;
  align-items: center;
  overflow-x: auto;
  padding-bottom: 2px;
}

.filter-chips-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.map-filter-chip {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-sub, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.map-filter-chip:hover {
  border-color: var(--primary, #0d9488);
  color: var(--primary, #0d9488);
}

.map-filter-chip.active {
  background: var(--primary, #0d9488);
  color: #ffffff;
  border-color: var(--primary, #0d9488);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
}

.map-filter-chip.highlight-chip {
  border-color: #fcd34d;
  background: #fefce8;
  color: #b45309;
}

.map-filter-chip.highlight-chip.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  border-color: #f59e0b;
}

/* Khung Bản Đồ */
.map-container {
  height: 480px;
  width: 100%;
  border-radius: var(--radius-md, 20px);
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color, #e2e8f0);
  position: relative;
  background: #e5e3df; /* Màu nền chờ tải Google Maps chuẩn */
}

.leaflet-map {
  height: 100%;
  width: 100%;
  z-index: 1;
}

/* Cluster Popup */
.cluster-popup-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.cluster-badge {
  background: #f0fdfa;
  color: #0f766e;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.cluster-count-label {
  font-size: 12px;
  font-weight: 800;
  color: #0d9488;
}

.cluster-popup-title {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  display: block;
  margin-bottom: 4px;
}

.cluster-popup-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 10px;
}

.popup-zoom-btn {
  width: 100%;
  background: #0d9488;
  color: #ffffff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.popup-zoom-btn:hover {
  background: #0f766e;
}

/* Popup Google Maps Địa điểm đơn lẻ */
.gmap-popup {
  font-family: inherit;
  min-width: 200px;
  max-width: 280px;
  padding: 4px;
}

.gmap-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.popup-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 6px;
}

.type-attraction { background: #e8f5e9; color: #166534; }
.type-restaurant { background: #fff7ed; color: #c2410c; }
.type-cafe       { background: #fdf4ff; color: #86198f; }
.type-hotel      { background: #eff6ff; color: #1d4ed8; }

.popup-rating {
  font-size: 11px;
  font-weight: 800;
  color: #f59e0b;
}

.popup-title {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  display: block;
  margin-bottom: 4px;
  line-height: 1.3;
}

.popup-address {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 10px;
  line-height: 1.4;
}

.popup-dir-btn {
  display: block;
  text-align: center;
  background: #0d7c76;
  color: #ffffff !important;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.popup-dir-btn:hover {
  background: #095955;
}

/* Dark mode theme styles */
:root[data-theme="dark"] .map-container {
  border-color: rgba(255, 255, 255, 0.1);
  background: #1e293b;
}

:root[data-theme="dark"] .map-mode-switch {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

:root[data-theme="dark"] .mode-btn {
  color: #94a3b8;
}

:root[data-theme="dark"] .mode-btn.active {
  background: #0f172a;
  color: #38bdf8;
}

:root[data-theme="dark"] .cluster-toggle-btn {
  background: rgba(30, 41, 59, 0.9);
  border-color: #334155;
  color: #cbd5e1;
}

:root[data-theme="dark"] .cluster-toggle-btn.active {
  background: rgba(20, 184, 166, 0.15);
  border-color: #14b8a6;
  color: #5eead4;
}

:root[data-theme="dark"] .map-filter-chip {
  background: rgba(30, 41, 59, 0.9);
  border-color: #334155;
  color: #cbd5e1;
}

:root[data-theme="dark"] .map-filter-chip.active {
  background: #0d9488;
  color: #ffffff;
}

:root[data-theme="dark"] .external-gmap-btn {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

:root[data-theme="dark"] .external-gmap-btn:hover {
  background: #0d7c76;
  color: #ffffff;
}
</style>
