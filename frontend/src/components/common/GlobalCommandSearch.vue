<template>
  <div class="global-search-container">
    <!-- NÚT TRIGGER TÌM KIẾM TRÊN THANH MENU (GLASS PILL) -->
    <button
      type="button"
      class="header-search-trigger"
      @click="openSearchModal"
      aria-label="Tìm kiếm tính năng hoặc tỉnh thành (Ctrl + K)"
      title="Tìm nhanh tính năng, tiện ích & thông tin 11 tỉnh thành miền Trung (Phím tắt: Ctrl + K)"
    >
      <span class="hst-icon">
        <AppIcon name="search" :size="16" />
      </span>
      <span class="hst-text">Tìm chức năng, tỉnh thành...</span>
      <span class="hst-kbd">
        <kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd><kbd>K</kbd>
      </span>
    </button>

    <!-- POPUP MODAL TÌM KIẾM TOÀN NĂNG (SPOTLIGHT / COMMAND PALETTE) -->
    <Teleport to="body">
      <transition name="cmd-palette-fade">
        <div
          v-if="isOpen"
          class="cmd-palette-backdrop"
          :class="{ 'dark-mode': isDark }"
          @click.self="closeSearchModal"
          role="dialog"
          aria-modal="true"
          aria-label="Cửa sổ tìm kiếm toàn năng"
        >
          <div class="cmd-palette-dialog" ref="dialogRef">
            
            <!-- HEADER INPUT SEARCH -->
            <div class="cmd-input-wrapper">
              <span class="cmd-search-icon">
                <AppIcon name="search" :size="20" />
              </span>
              <input
                ref="searchInputRef"
                type="text"
                v-model="searchQuery"
                class="cmd-search-input"
                placeholder="Tìm chức năng (lên lịch, chia tiền, vé xe...) hoặc tỉnh thành (Huế, Đà Nẵng...)"
                @keydown.down.prevent="navigateResults(1)"
                @keydown.up.prevent="navigateResults(-1)"
                @keydown.enter.prevent="selectActiveResult"
                @keydown.esc.prevent="closeSearchModal"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="cmd-clear-btn"
                @click="searchQuery = ''; focusInput()"
                title="Xóa từ khóa"
              >
                <AppIcon name="x" :size="15" />
              </button>
              <span class="cmd-esc-badge" @click="closeSearchModal" title="Nhấn ESC để đóng">ESC</span>
            </div>

            <!-- THANH FILTER DANH MỤC NHANH (CATEGORY TABS) -->
            <div class="cmd-filter-tabs">
              <button
                type="button"
                class="cft-btn"
                :class="{ active: activeCategory === 'all' }"
                @click="activeCategory = 'all'"
              >
                ✨ Tất cả ({{ allFilteredCount }})
              </button>
              <button
                type="button"
                class="cft-btn"
                :class="{ active: activeCategory === 'province' }"
                @click="activeCategory = 'province'"
              >
                🏛️ Tỉnh thành ({{ filteredProvinces.length }})
              </button>
              <button
                type="button"
                class="cft-btn"
                :class="{ active: activeCategory === 'feature' }"
                @click="activeCategory = 'feature'"
              >
                ⚡ Chức năng &amp; Tiện ích ({{ filteredFeatures.length }})
              </button>
              <button
                type="button"
                class="cft-btn"
                :class="{ active: activeCategory === 'heritage' }"
                @click="activeCategory = 'heritage'"
              >
                👑 Di sản UNESCO ({{ filteredHeritages.length }})
              </button>
            </div>

            <!-- DANH SÁCH KẾT QUẢ TÌM KIẾM (SCROLLABLE AREA) -->
            <div class="cmd-results-list" ref="resultsListRef">
              
              <!-- TH1: KHÔNG TÌM THẤY KẾT QUẢ -->
              <div v-if="allFilteredCount === 0" class="cmd-empty-state">
                <span class="ces-icon"><AppIcon name="alertcircle" :size="36" /></span>
                <h4>Không tìm thấy kết quả phù hợp cho "{{ searchQuery }}"</h4>
                <p>Thử tìm các từ khóa thông dụng như: <b>Đà Nẵng</b>, <b>Huế</b>, <b>Lên lịch</b>, <b>Chia tiền</b>, <b>Bà Nà</b>, <b>Vé xe</b>...</p>
                <div class="ces-tags">
                  <button type="button" @click="searchQuery = 'Đà Nẵng'">Đà Nẵng</button>
                  <button type="button" @click="searchQuery = 'Lên lịch'">Lên lịch AI</button>
                  <button type="button" @click="searchQuery = 'Chia tiền'">Chia tiền nhóm</button>
                  <button type="button" @click="searchQuery = 'Travel Pass'">Travel Pass</button>
                  <button type="button" @click="searchQuery = 'Ẩm thực'">Đặc sản</button>
                </div>
              </div>

              <!-- TH2: CÁC NHÓM KẾT QUẢ -->
              <template v-else>
                <!-- 1. NHÓM TỈNH THÀNH MIỀN TRUNG -->
                <div v-if="shouldShowCategory('province') && filteredProvinces.length > 0" class="cmd-section">
                  <div class="cmd-section-header">
                    <span class="csh-title">🏛️ Thông tin Tỉnh &amp; Thành phố Miền Trung</span>
                    <span class="csh-count">{{ filteredProvinces.length }} điểm đến</span>
                  </div>
                  <div class="cmd-cards-grid">
                    <div
                      v-for="(prov, idx) in filteredProvinces"
                      :key="prov.id"
                      class="cmd-province-card"
                      :class="{ 'is-active': activeIndex === getGlobalIndex('province', idx) }"
                      @mouseenter="activeIndex = getGlobalIndex('province', idx)"
                      @click="handleProvinceClick(prov, 'explore')"
                    >
                      <div class="cpc-header">
                        <span class="cpc-emoji">{{ prov.icon }}</span>
                        <div class="cpc-title-wrap">
                          <h4 class="cpc-name">{{ prov.name }}</h4>
                          <span class="cpc-tagline">{{ prov.tagline }}</span>
                        </div>
                        <span class="cpc-badge">Miền Trung</span>
                      </div>

                      <div class="cpc-body">
                        <div class="cpc-info-row">
                          <span class="cpc-label"><AppIcon name="map" :size="13" /> Thắng cảnh:</span>
                          <span class="cpc-val">{{ prov.attractions }}</span>
                        </div>
                        <div class="cpc-info-row">
                          <span class="cpc-label"><AppIcon name="utensils" :size="13" /> Đặc sản:</span>
                          <span class="cpc-val text-amber">{{ prov.specialties }}</span>
                        </div>
                        <div class="cpc-info-row" v-if="prov.bestSeason">
                          <span class="cpc-label"><AppIcon name="calendar" :size="13" /> Mùa đẹp nhất:</span>
                          <span class="cpc-val text-teal">{{ prov.bestSeason }}</span>
                        </div>
                      </div>

                      <div class="cpc-actions">
                        <button
                          type="button"
                          class="cpc-btn cpc-btn-explore"
                          @click.stop="handleProvinceClick(prov, 'explore')"
                        >
                          <AppIcon name="compass" :size="13" /> Khám phá
                        </button>
                        <button
                          type="button"
                          class="cpc-btn cpc-btn-plan"
                          @click.stop="handleProvinceClick(prov, 'plan')"
                        >
                          <AppIcon name="calendar" :size="13" /> Lên lịch ngay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2. NHÓM CHỨC NĂNG & TIỆN ÍCH HỆ THỐNG -->
                <div v-if="shouldShowCategory('feature') && filteredFeatures.length > 0" class="cmd-section">
                  <div class="cmd-section-header">
                    <span class="csh-title">⚡ Chức năng &amp; Tiện ích trên Web</span>
                    <span class="csh-count">{{ filteredFeatures.length }} chức năng</span>
                  </div>
                  <div class="cmd-items-list">
                    <div
                      v-for="(feat, idx) in filteredFeatures"
                      :key="feat.id"
                      class="cmd-feature-item"
                      :class="{ 'is-active': activeIndex === getGlobalIndex('feature', idx) }"
                      @mouseenter="activeIndex = getGlobalIndex('feature', idx)"
                      @click="handleFeatureClick(feat)"
                    >
                      <div class="cfi-icon" :style="{ background: feat.colorBg, color: feat.colorText }">
                        <AppIcon :name="feat.icon" :size="18" />
                      </div>
                      <div class="cfi-content">
                        <div class="cfi-title-row">
                          <span class="cfi-title">{{ feat.title }}</span>
                          <span class="cfi-badge" :style="{ color: feat.colorText }">{{ feat.badge }}</span>
                        </div>
                        <span class="cfi-desc">{{ feat.desc }}</span>
                      </div>
                      <div class="cfi-arrow">
                        <AppIcon name="arrowright" :size="15" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. NHÓM DI SẢN THẾ GIỚI UNESCO -->
                <div v-if="shouldShowCategory('heritage') && filteredHeritages.length > 0" class="cmd-section">
                  <div class="cmd-section-header">
                    <span class="csh-title">👑 Di sản Văn hóa &amp; Thiên nhiên Thế giới UNESCO</span>
                    <span class="csh-count">{{ filteredHeritages.length }} di sản</span>
                  </div>
                  <div class="cmd-items-list">
                    <div
                      v-for="(her, idx) in filteredHeritages"
                      :key="her.id"
                      class="cmd-heritage-item"
                      :class="{ 'is-active': activeIndex === getGlobalIndex('heritage', idx) }"
                      @mouseenter="activeIndex = getGlobalIndex('heritage', idx)"
                      @click="handleHeritageClick(her)"
                    >
                      <div class="chi-icon">
                        <AppIcon name="landmark" :size="18" />
                      </div>
                      <div class="chi-content">
                        <div class="chi-title-row">
                          <span class="chi-title">{{ her.title }}</span>
                          <span class="chi-location"><AppIcon name="pin" :size="12" /> {{ her.location }}</span>
                        </div>
                        <span class="chi-desc">{{ her.unescoType }} • {{ her.desc }}</span>
                      </div>
                      <button type="button" class="chi-btn">
                        <AppIcon name="compass" :size="13" /> Chiêm ngưỡng
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- FOOTER HƯỚNG DẪN BÀN PHÍM -->
            <div class="cmd-footer">
              <div class="cmd-footer-keys">
                <span><kbd>↑</kbd><kbd>↓</kbd> Di chuyển</span>
                <span><kbd>↵</kbd> Chọn</span>
                <span><kbd>ESC</kbd> Đóng</span>
              </div>
              <div class="cmd-footer-brand">
                <span>Travel Trips Miền Trung</span>
              </div>
            </div>

          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits([
  'navigateTab',
  'selectCity',
  'planCity',
  'openModal'
])

// ==================== STATE QUẢN LÝ TÌM KIẾM ====================
const isOpen = ref(false)
const searchQuery = ref('')
const activeCategory = ref('all') // 'all' | 'province' | 'feature' | 'heritage'
const activeIndex = ref(0)
const searchInputRef = ref(null)
const dialogRef = ref(null)
const resultsListRef = ref(null)

const isMac = computed(() => {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
})

// ==================== HÀM BỎ DẤU TIẾNG VIỆT ĐỂ TÌM KIẾM SIÊU NHẠY ====================
function removeVietnameseTones(str) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

// ==================== DỮ LIỆU 11 TỈNH THÀNH MIỀN TRUNG ====================
const PROVINCES_DATA = [
  {
    id: 'prov-hue',
    name: 'Thừa Thiên Huế',
    shortName: 'Huế',
    icon: '👑',
    tagline: 'Cố Đô Di Sản Triều Nguyễn & Sông Hương Thơ Mộng',
    attractions: 'Đại Nội Huế, Chùa Thiên Mụ, Lăng Khải Định, Đồi Vọng Cảnh, Đầm Lập An',
    specialties: 'Bún bò Huế, Bánh bèo, Bánh nậm, Bánh lọc, Cơm hến, Chè heo quay',
    bestSeason: 'Tháng 1 - Tháng 4 (Mát mẻ, mùa hoa ngô đồng) hoặc Festival Huế',
    tags: ['huế', 'hue', 'thừa thiên huế', 'cố đô', 'đại nội', 'sông hương', 'bún bò', 'chùa thiên mụ', 'lăng tẩm', 'festival']
  },
  {
    id: 'prov-danang',
    name: 'Đà Nẵng',
    shortName: 'Đà Nẵng',
    icon: '🌉',
    tagline: 'Thành Phố Đáng Sống, Cầu Vàng Bà Nà & Biển Mỹ Khê',
    attractions: 'Cầu Vàng Bà Nà Hills, Biển Mỹ Khê, Bán đảo Sơn Trà, Cầu Rồng, Ngũ Hành Sơn',
    specialties: 'Mì Quảng ếch, Bánh tráng cuốn thịt heo, Bún chả cá, Bê thui Cầu Mống',
    bestSeason: 'Tháng 2 - Tháng 8 (Trời trong, biển lặng, nắng vàng rực rỡ)',
    tags: ['đà nẵng', 'da nang', 'danang', 'cầu vàng', 'bà nà', 'ba na', 'mỹ khê', 'cầu rồng', 'sơn trà', 'mì quảng', 'bà nà hills']
  },
  {
    id: 'prov-quangtri',
    name: 'Quảng Trị',
    shortName: 'Quảng Trị',
    icon: '⛰️',
    tagline: 'Vương Quốc Hang Động Phong Nha & Dấu Ấn Lịch Sử Hào Hùng',
    attractions: 'Động Phong Nha, Động Thiên Đường, Địa đạo Vịnh Mốc, Thành Cổ Quảng Trị, Sông Bến Hải',
    specialties: 'Cháo bột cá lóc (bánh canh), Thịt trâu lá trơng, Rượu Kim Long, Tiêu Cùa',
    bestSeason: 'Tháng 3 - Tháng 8 (Mùa khô ráo, khám phá hang động lý tưởng nhất)',
    tags: ['quảng trị', 'quang tri', 'quangtri', 'phong nha', 'động thiên đường', 'vịnh mốc', 'thành cổ', 'cầu hiền lương', 'bánh canh']
  },
  {
    id: 'prov-thanhhoa',
    name: 'Thanh Hóa',
    shortName: 'Thanh Hóa',
    icon: '🏰',
    tagline: 'Biển Sầm Sơn Sôi Động, Pù Luông Đại Ngàn & Thành Nhà Hồ',
    attractions: 'Bãi biển Sầm Sơn, Khu bảo tồn Pù Luông, Di sản Thành Nhà Hồ, Suối Cá Thần',
    specialties: 'Nem chua Thanh Hóa, Chả tôm nướng, Bánh gai Tứ Trụ, Gỏi cá nhệch Nga Sơn',
    bestSeason: 'Tháng 5 - Tháng 8 (Biển Sầm Sơn hè) hoặc Tháng 9 - Tháng 10 (Mùa lúa chín Pù Luông)',
    tags: ['thanh hóa', 'thanh hoa', 'sầm sơn', 'pù luông', 'thành nhà hồ', 'nem chua', 'suối cá thần', 'chả tôm', 'bến én']
  },
  {
    id: 'prov-nghean',
    name: 'Nghệ An',
    shortName: 'Nghệ An',
    icon: '🌾',
    tagline: 'Bãi Biển Cửa Lò, Làng Sen Quê Bác & VQG Pù Mát',
    attractions: 'Bãi biển Cửa Lò, Khu di tích Kim Liên Làng Sen, Đảo Chè Thanh Chương, VQG Pù Mát',
    specialties: 'Cháo lươn & Súp lươn xứ Nghệ, Mực nhảy nướng Cửa Lò, Tương Nam Đàn, Cam Xã Đoài',
    bestSeason: 'Tháng 4 - Tháng 8 (Nhiều nắng, tắm biển Cửa Lò tuyệt đẹp)',
    tags: ['nghệ an', 'nghe an', 'cửa lò', 'làng sen', 'quê bác', 'súp lươn', 'cháo lươn', 'vinh', 'pù mát', 'đảo chè']
  },
  {
    id: 'prov-hatinh',
    name: 'Hà Tĩnh',
    shortName: 'Hà Tĩnh',
    icon: '🌊',
    tagline: 'Cung Biển Thiên Cầm Đàn Trời & Ngã Ba Đồng Lộc Bất Tử',
    attractions: 'Biển Thiên Cầm, Khu di tích Ngã Ba Đồng Lộc, Chùa Hương Tích, Hồ Kẻ Gỗ',
    specialties: 'Kẹo Cu đơ Hà Tĩnh, Mực nhảy Vũng Áng, Bưởi Phúc Trạch, Gỏi cá đục Lộc Hà',
    bestSeason: 'Tháng 4 - Tháng 8 (Khí hậu nhiều nắng, biển Thiên Cầm xanh biếc êm đềm)',
    tags: ['hà tĩnh', 'ha tinh', 'thiên cầm', 'ngã ba đồng lộc', 'kẹo cu đơ', 'hồ kẻ gỗ', 'chùa hương tích', 'mực nhảy']
  },
  {
    id: 'prov-quangngai',
    name: 'Quảng Ngãi',
    shortName: 'Quảng Ngãi',
    icon: '🏖️',
    tagline: 'Thiên Đường Biển Đảo Lý Sơn & Eo Gió - Kỳ Co',
    attractions: 'Đảo Lý Sơn, Cổng Tò Vò, Đỉnh Thới Lới, Biển Sa Huỳnh, Thắng cảnh Ba Làng An',
    specialties: 'Tỏi cô đơn Lý Sơn, Don sông Trà, Cá bống kho tộ, Cúm núm nướng',
    bestSeason: 'Tháng 4 - Tháng 8 (Biển êm sóng lặng, nước xanh như ngọc)',
    tags: ['quảng ngãi', 'quang ngai', 'lý sơn', 'cổng tò vò', 'sa huỳnh', 'tỏi lý sơn', 'don', 'đảo lý sơn']
  },
  {
    id: 'prov-gialai',
    name: 'Gia Lai',
    shortName: 'Gia Lai',
    icon: '🐘',
    tagline: 'Đôi Mắt Pleiku Biển Hồ T’Nưng & Văn Hóa Cồng Chiêng Tây Nguyên',
    attractions: 'Biển Hồ T’Nưng, Núi lửa Chư Đang Ya, Thác Phú Cường, Chùa Minh Thành Pleiku',
    specialties: 'Phở hai tô (Phở khô Gia Lai), Bò một nắng muối kiến vàng, Gà nướng cơm lam',
    bestSeason: 'Tháng 10 - Tháng 2 (Mùa hoa dã quỳ nở vàng và lễ hội cồng chiêng sôi động)',
    tags: ['gia lai', 'pleiku', 'biển hồ', 'chư đang ya', 'phở hai tô', 'cồng chiêng', 'tây nguyên', 'bò một nắng']
  },
  {
    id: 'prov-daklak',
    name: 'Đắk Lắk',
    shortName: 'Đắk Lắk',
    icon: '☕',
    tagline: 'Thủ Phủ Cà Phê Buôn Ma Thuột, Thác Dray Nur & Hồ Lắk',
    attractions: 'Bảo tàng Thế giới Cà phê, Thác Dray Nur hùng vĩ, Hồ Lắk, Buôn Đôn voi rừng',
    specialties: 'Cà phê nguyên chất Ban Mê, Bún đỏ Buôn Ma Thuột, Gỏi cà đắng cá khô',
    bestSeason: 'Tháng 12 - Tháng 3 (Mùa hoa cà phê nở trắng đồi nương tuyệt đẹp)',
    tags: ['đắk lắk', 'dak lak', 'buôn ma thuột', 'bảo tàng cà phê', 'thác dray nur', 'hồ lắk', 'buôn đôn', 'cà phê']
  },
  {
    id: 'prov-khanhhoa',
    name: 'Khánh Hòa',
    shortName: 'Khánh Hòa',
    icon: '⛵',
    tagline: 'Vịnh Biển Nha Trang Thiên Đường, VinWonders & Tháp Bà Ponagar',
    attractions: 'Bãi biển Nha Trang, VinWonders Hòn Tre, Tháp Bà Ponagar, Đảo Hòn Tằm, Vịnh Vân Phong',
    specialties: 'Nem nướng Ninh Hòa, Bún sứa, Bún chả cá Nha Trang, Yến sào Khánh Hòa',
    bestSeason: 'Tháng 1 - Tháng 8 (Khí hậu ôn hòa, tràn ngập ánh nắng biển đảo)',
    tags: ['khánh hòa', 'nha trang', 'khanh hoa', 'nhatrang', 'vinwonders', 'tháp bà ponagar', 'nem nướng ninh hòa', 'vịnh nha trang']
  },
  {
    id: 'prov-lamdong',
    name: 'Lâm Đồng',
    shortName: 'Lâm Đồng',
    icon: '🌲',
    tagline: 'Thành Phố Sương Mù Đà Lạt Ngàn Hoa & Thác Dambri Bảo Lộc',
    attractions: 'Hồ Xuân Hương, Quảng trường Lâm Viên, Thung Lũng Tình Yêu, Thác Dambri, Đồi chè Cầu Đất',
    specialties: 'Bánh tráng nướng Đà Lạt, Lẩu gà lá é, Lẩu bò Ba Toa, Dâu tây tươi, Kem bơ',
    bestSeason: 'Quanh năm mát mẻ; Đẹp nhất Tháng 11 - Tháng 3 (Mùa hoa mai anh đào)',
    tags: ['lâm đồng', 'đà lạt', 'lam dong', 'da lat', 'dalat', 'hồ xuân hương', 'bánh tráng nướng', 'lẩu gà lá é', 'thác dambri', 'hoa']
  }
]

// ==================== DỮ LIỆU CÁC CHỨC NĂNG & TIỆN ÍCH WEB ====================
const FEATURES_DATA = [
  {
    id: 'feat-planner',
    title: 'Lên Lịch Trình Du Lịch Thông Minh AI',
    desc: 'Tự động tạo lộ trình du lịch tối ưu theo ngày, ngân sách, phương tiện và khách sạn',
    icon: 'calendar',
    badge: 'Tính năng cốt lõi',
    colorBg: 'rgba(245, 158, 11, 0.15)',
    colorText: '#f59e0b',
    actionType: 'navigate',
    target: 'planner',
    tags: ['lên lịch', 'len lich', 'planner', 'tạo lịch trình', 'kế hoạch', 'ai', 'lộ trình', 'tự động']
  },
  {
    id: 'feat-explore',
    title: 'Khám Phá Điểm Đến Miền Trung',
    desc: 'Xem danh bạ 11 tỉnh thành, thắng cảnh di tích, quán ăn đặc sản, cafe và khách sạn',
    icon: 'compass',
    badge: 'Trang chính',
    colorBg: 'rgba(56, 189, 248, 0.15)',
    colorText: '#0284c7',
    actionType: 'navigate',
    target: 'explore',
    tags: ['khám phá', 'kham pha', 'explore', 'điểm đến', 'thắng cảnh', 'di tích', 'món ăn', 'cafe', 'khách sạn']
  },
  {
    id: 'feat-mytrips',
    title: 'Chuyến Đi Của Tôi (My Trips)',
    desc: 'Quản lý toàn bộ danh sách các chuyến đi đã lưu, xem lại lịch trình, chia sẻ và xuất file',
    icon: 'luggage',
    badge: 'Lưu trữ cá nhân',
    colorBg: 'rgba(16, 185, 129, 0.15)',
    colorText: '#10b981',
    actionType: 'navigate',
    target: 'mytrips',
    tags: ['chuyến đi', 'chuyen di', 'mytrips', 'lịch trình đã lưu', 'xem lại', 'quản lý chuyến đi']
  },
  {
    id: 'feat-heritage',
    title: 'Bảo Tàng Ảo 3D Di Sản UNESCO',
    desc: 'Bảo tàng tương tác xoay tròn 3D chiêm ngưỡng 10 Di sản văn hóa & thiên nhiên thế giới',
    icon: 'landmark',
    badge: 'Trải nghiệm 3D',
    colorBg: 'rgba(168, 85, 247, 0.15)',
    colorText: '#a855f7',
    actionType: 'modal',
    target: 'heritage',
    tags: ['di sản', 'di san', 'unesco', 'bảo tàng', '3d', 'bảo tàng ảo', 'cố đô huế', 'hội an', 'mỹ sơn']
  },
  {
    id: 'feat-bill-splitter',
    title: 'Chia Tiền Nhóm (Bill Splitter)',
    desc: 'Công cụ tính toán chia tiền ăn uống, chi phí phòng và đi lại cho cả nhóm chính xác 100%',
    icon: 'wallet',
    badge: 'Công cụ tài chính',
    colorBg: 'rgba(234, 88, 12, 0.15)',
    colorText: '#ea580c',
    actionType: 'modal',
    target: 'bill-splitter',
    tags: ['chia tiền', 'chia tien', 'bill splitter', 'tính tiền', 'chi phí nhóm', 'chia nhóm', 'hóa đơn', 'sòng phẳng']
  },
  {
    id: 'feat-travel-pass',
    title: 'Thẻ Hành Trình Offline (Travel Pass)',
    desc: 'Xuất vé lịch trình du lịch thông minh cầm tay để xem mọi lúc khi không có kết nối 4G/Wifi',
    icon: 'award',
    badge: 'Tiện ích Offline',
    colorBg: 'rgba(14, 165, 233, 0.15)',
    colorText: '#0ea5e9',
    actionType: 'modal',
    target: 'travel-pass',
    tags: ['travel pass', 'thẻ hành trình', 'vé offline', 'không cần mạng', 'vé du lịch', 'in vé', 'thẻ thông hành']
  },
  {
    id: 'feat-rain-guard',
    title: 'Đổi Lịch Trình Tránh Mưa (Weather Guard)',
    desc: 'AI tự động phát hiện dự báo thời tiết xấu và hoán đổi địa điểm sang hoạt động trong nhà',
    icon: 'cloudrain',
    badge: 'Bảo vệ thời tiết',
    colorBg: 'rgba(99, 102, 241, 0.15)',
    colorText: '#6366f1',
    actionType: 'modal',
    target: 'rain',
    tags: ['tránh mưa', 'thời tiết', 'rain guard', 'hoán đổi lịch', 'trong nhà', 'mưa', 'bão']
  },
  {
    id: 'feat-infographic',
    title: 'Xuất Thẻ Infographic Zalo & Facebook',
    desc: 'Tạo thẻ tóm tắt chuyến đi dạng đồ họa bắt mắt để chia sẻ nhanh cho bạn bè hoặc người thân',
    icon: 'share2',
    badge: 'Chia sẻ mạng xã hội',
    colorBg: 'rgba(34, 197, 94, 0.15)',
    colorText: '#22c55e',
    actionType: 'modal',
    target: 'infographic',
    tags: ['infographic', 'chia sẻ zalo', 'ảnh đẹp', 'mạng xã hội', 'facebook', 'tóm tắt lịch trình']
  },
  {
    id: 'feat-chatbot',
    title: 'Trợ Lý Du Lịch Ảo AI (Chatbot)',
    desc: 'Trò chuyện hỏi đáp kinh nghiệm, mẹo du lịch, gợi ý món ăn và giải đáp thắc mắc 24/7',
    icon: 'bot',
    badge: 'Trợ lý AI 24/7',
    colorBg: 'rgba(236, 72, 153, 0.15)',
    colorText: '#ec4899',
    actionType: 'modal',
    target: 'chatbot',
    tags: ['chatbot', 'trợ lý ai', 'chat', 'hỏi đáp', 'tư vấn', 'kinh nghiệm', 'mẹo du lịch']
  },
  {
    id: 'feat-theme',
    title: 'Chuyển Đổi Giao Diện Sáng / Tối (Theme Mode)',
    desc: 'Chuyển đổi tức thì giữa chế độ ban đêm kỳ ảo và chế độ ban ngày dịu mắt',
    icon: 'sun',
    badge: 'Giao diện',
    colorBg: 'rgba(234, 179, 8, 0.15)',
    colorText: '#eab308',
    actionType: 'modal',
    target: 'toggle-dark',
    tags: ['dark mode', 'chế độ tối', 'chế độ sáng', 'light mode', 'đổi màu', 'giao diện']
  },
  {
    id: 'feat-profile',
    title: 'Hồ Sơ Cá Nhân & Danh Sách Yêu Thích',
    desc: 'Xem thông tin tài khoản, danh hiệu lữ hành và các địa điểm du lịch bạn đã thả tim',
    icon: 'user',
    badge: 'Tài khoản',
    colorBg: 'rgba(139, 92, 246, 0.15)',
    colorText: '#8b5cf6',
    actionType: 'navigate',
    target: 'profile',
    tags: ['tài khoản', 'hồ sơ', 'profile', 'yêu thích', 'đã lưu', 'avatar']
  },
  {
    id: 'feat-auth',
    title: 'Đăng Nhập / Đăng Ký Tài Khoản',
    desc: 'Đăng nhập vào hệ thống để đồng bộ dữ liệu và lưu lịch trình an toàn',
    icon: 'login',
    badge: 'Xác thực',
    colorBg: 'rgba(2, 132, 199, 0.15)',
    colorText: '#0284c7',
    actionType: 'modal',
    target: 'auth',
    tags: ['đăng nhập', 'đăng ký', 'login', 'register', 'tài khoản']
  },
  {
    id: 'feat-admin',
    title: 'Bảng Điều Khiển Quản Trị Viên (Admin Dashboard)',
    desc: 'Công cụ crawler dữ liệu 110 địa điểm, quản trị người dùng và giám sát hệ thống',
    icon: 'dashboard',
    badge: 'Quản trị viên',
    colorBg: 'rgba(239, 68, 68, 0.15)',
    colorText: '#ef4444',
    actionType: 'navigate',
    target: 'admin',
    tags: ['admin', 'quản trị', 'crawler', 'cào dữ liệu', 'thống kê', 'hệ thống']
  }
]

// ==================== DỮ LIỆU 10 DI SẢN THẾ GIỚI UNESCO ====================
const HERITAGES_DATA = [
  {
    id: 'her-hue',
    title: 'Quần Thể Di Tích Cố Đô Huế',
    unescoType: 'Di sản Văn hóa Thế giới (1993)',
    location: 'Thừa Thiên Huế',
    desc: 'Kinh đô triều Nguyễn với Đại Nội nguy nga, hệ thống lăng tẩm hoàng gia và Kỳ đài sông Hương',
    cityTarget: 'Huế',
    tags: ['cố đô huế', 'đại nội', 'nguyễn', 'huế', 'di sản văn hóa']
  },
  {
    id: 'her-hoian',
    title: 'Đô Thị Cổ Hội An',
    unescoType: 'Di sản Văn hóa Thế giới (1999)',
    location: 'Đà Nẵng / Quảng Nam',
    desc: 'Thương cảng quốc tế thế kỷ 16 với Chùa Cầu, dãy nhà cổ đèn lồng vàng và sông Hoài thơ mộng',
    cityTarget: 'Đà Nẵng',
    tags: ['phố cổ hội an', 'hội an', 'chùa cầu', 'quảng nam', 'đèn lồng']
  },
  {
    id: 'her-myson',
    title: 'Thánh Địa Mỹ Sơn',
    unescoType: 'Di sản Văn hóa Thế giới (1999)',
    location: 'Đà Nẵng / Quảng Nam',
    desc: 'Quần thể tháp Chăm Pa huyền bí giữa thung lũng đại ngàn, kiệt tác kiến trúc gạch nung ngàn năm',
    cityTarget: 'Đà Nẵng',
    tags: ['thánh địa mỹ sơn', 'mỹ sơn', 'chăm pa', 'tháp chàm']
  },
  {
    id: 'her-phongnha',
    title: 'Vườn Quốc Gia Phong Nha - Kẻ Bàng',
    unescoType: 'Di sản Thiên nhiên Thế giới (2003 & 2015)',
    location: 'Quảng Trị / Quảng Bình',
    desc: 'Vương quốc hang động karst cổ nhất châu Á với Động Thiên Đường, Sơn Đoòng và sông ngầm kỳ ảo',
    cityTarget: 'Quảng Trị',
    tags: ['phong nha kẻ bàng', 'động phong nha', 'thiên đường', 'sơn đoòng', 'quảng bình', 'quảng trị']
  },
  {
    id: 'her-nhanhac',
    title: 'Nhã Nhạc Cung Đình Huế',
    unescoType: 'Di sản Văn hóa Phi vật thể đại diện nhân loại (2003)',
    location: 'Thừa Thiên Huế',
    desc: 'Đỉnh cao âm nhạc cung đình truyền thống Việt Nam biểu diễn trong các đại lễ tế tự triều đình',
    cityTarget: 'Huế',
    tags: ['nhã nhạc cung đình huế', 'nhã nhạc', 'âm nhạc', 'huế']
  },
  {
    id: 'her-baichoi',
    title: 'Nghệ Thuật Bài Chòi Trung Bộ',
    unescoType: 'Di sản Văn hóa Phi vật thể đại diện nhân loại (2017)',
    location: 'Trung Bộ',
    desc: 'Trò chơi dân gian kết hợp âm nhạc, thơ ca và diễn xướng ngẫu hứng đậm đà bản sắc làng quê miền Trung',
    cityTarget: 'Quảng Ngãi',
    tags: ['bài chòi', 'dân ca bài chòi', 'miền trung']
  },
  {
    id: 'her-congchieng',
    title: 'Không Gian Văn Hóa Cồng Chiêng Tây Nguyên',
    unescoType: 'Kiệt tác Di sản Phi vật thể nhân loại (2005)',
    location: 'Gia Lai & Đắk Lắk',
    desc: 'Âm vang thiêng liêng kết nối con người với thần linh giữa núi rừng đại ngàn Tây Nguyên',
    cityTarget: 'Gia Lai',
    tags: ['cồng chiêng tây nguyên', 'cồng chiêng', 'gia lai', 'đắk lắk', 'tây nguyên']
  },
  {
    id: 'her-catru',
    title: 'Nghệ Thuật Ca Trù',
    unescoType: 'Di sản Phi vật thể cần bảo vệ khẩn cấp (2009)',
    location: 'Bắc Trung Bộ',
    desc: 'Hình thức nghệ thuật thanh nhạc thính phòng độc đáo với đàn đáy, phách gỗ và trống chầu',
    cityTarget: 'Hà Tĩnh',
    tags: ['ca trù', 'hà tĩnh', 'nghệ an', 'thanh nhạc']
  },
  {
    id: 'her-mocban',
    title: 'Mộc Bản Triều Nguyễn',
    unescoType: 'Di sản Tư liệu Ký ức Thế giới (2009)',
    location: 'Thừa Thiên Huế',
    desc: 'Kho tàng tài liệu khắc chữ Hán Nôm trên gỗ ghi chép lịch sử, văn hóa của các triều vua chúa Việt Nam',
    cityTarget: 'Huế',
    tags: ['mộc bản triều nguyễn', 'mộc bản', 'tư liệu', 'huế']
  },
  {
    id: 'her-thanhnhaho',
    title: 'Thành Nhà Hồ',
    unescoType: 'Di sản Văn hóa Thế giới (2011)',
    location: 'Thanh Hóa',
    desc: 'Kỳ quan kinh thành đá đồ sộ độc nhất vô nhị ở Đông Nam Á xây dựng năm 1397 dưới triều Hồ',
    cityTarget: 'Thanh Hóa',
    tags: ['thành nhà hồ', 'thanh hóa', 'hồ quý ly', 'thành đá']
  }
]

// ==================== LỌC DỮ LIỆU TÌM KIẾM ĐỘNG ====================
const filteredProvinces = computed(() => {
  if (!searchQuery.value.trim()) return PROVINCES_DATA
  const q = removeVietnameseTones(searchQuery.value)
  return PROVINCES_DATA.filter(p => {
    return (
      removeVietnameseTones(p.name).includes(q) ||
      removeVietnameseTones(p.shortName).includes(q) ||
      removeVietnameseTones(p.tagline).includes(q) ||
      removeVietnameseTones(p.attractions).includes(q) ||
      removeVietnameseTones(p.specialties).includes(q) ||
      p.tags.some(t => removeVietnameseTones(t).includes(q))
    )
  })
})

const filteredFeatures = computed(() => {
  if (!searchQuery.value.trim()) return FEATURES_DATA
  const q = removeVietnameseTones(searchQuery.value)
  return FEATURES_DATA.filter(f => {
    return (
      removeVietnameseTones(f.title).includes(q) ||
      removeVietnameseTones(f.desc).includes(q) ||
      removeVietnameseTones(f.badge).includes(q) ||
      f.tags.some(t => removeVietnameseTones(t).includes(q))
    )
  })
})

const filteredHeritages = computed(() => {
  if (!searchQuery.value.trim()) return HERITAGES_DATA
  const q = removeVietnameseTones(searchQuery.value)
  return HERITAGES_DATA.filter(h => {
    return (
      removeVietnameseTones(h.title).includes(q) ||
      removeVietnameseTones(h.desc).includes(q) ||
      removeVietnameseTones(h.location).includes(q) ||
      h.tags.some(t => removeVietnameseTones(t).includes(q))
    )
  })
})

const allFilteredCount = computed(() => {
  let count = 0
  if (shouldShowCategory('province')) count += filteredProvinces.value.length
  if (shouldShowCategory('feature')) count += filteredFeatures.value.length
  if (shouldShowCategory('heritage')) count += filteredHeritages.value.length
  return count
})

function shouldShowCategory(cat) {
  if (activeCategory.value === 'all') return true
  return activeCategory.value === cat
}

// ==================== KEYBOARD NAVIGATION ====================
function getGlobalIndex(category, localIdx) {
  let offset = 0
  if (category === 'province') return localIdx
  if (shouldShowCategory('province')) offset += filteredProvinces.value.length
  if (category === 'feature') return offset + localIdx
  if (shouldShowCategory('feature')) offset += filteredFeatures.value.length
  if (category === 'heritage') return offset + localIdx
  return localIdx
}

function navigateResults(delta) {
  const max = allFilteredCount.value
  if (max === 0) return
  activeIndex.value = (activeIndex.value + delta + max) % max
  scrollToActive()
}

function scrollToActive() {
  nextTick(() => {
    const el = dialogRef.value?.querySelector('.is-active')
    if (el && resultsListRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

function selectActiveResult() {
  const activeEl = dialogRef.value?.querySelector('.is-active')
  if (activeEl) {
    activeEl.click()
  }
}

// ==================== CÁC HÀM XỬ LÝ CLICK HÀNH ĐỘNG ====================
function handleProvinceClick(prov, mode) {
  closeSearchModal()
  if (mode === 'plan') {
    emit('planCity', prov.shortName || prov.name)
  } else {
    emit('selectCity', prov.shortName || prov.name)
  }
}

function handleFeatureClick(feat) {
  closeSearchModal()
  if (feat.actionType === 'navigate') {
    emit('navigateTab', feat.target)
  } else if (feat.actionType === 'modal') {
    emit('openModal', feat.target)
  }
}

function handleHeritageClick(her) {
  closeSearchModal()
  emit('selectCity', her.cityTarget)
}

// ==================== MỞ & ĐÓNG MODAL ====================
function openSearchModal() {
  isOpen.value = true
  activeIndex.value = 0
  nextTick(() => {
    focusInput()
  })
}

function closeSearchModal() {
  isOpen.value = false
  searchQuery.value = ''
  activeCategory.value = 'all'
}

function focusInput() {
  if (searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

// ==================== PHÍM TẮT TOÀN CỤC CTRL + K / CMD + K ====================
function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      closeSearchModal()
    } else {
      openSearchModal()
    }
  } else if (e.key === 'Escape' && isOpen.value) {
    closeSearchModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
/* ==================== SEARCH TRIGGER BUTTON TRÊN MENU BAR (GLASSMORPHIC PILL) ==================== */
.global-search-container {
  display: flex;
  align-items: center;
}

.header-search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 6px 14px;
  height: 38px;
  cursor: pointer;
  color: var(--text-muted, #94a3b8);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.06);
  user-select: none;
  width: 230px;
}

:root[data-theme="light"] .header-search-trigger {
  background: rgba(15, 23, 42, 0.05);
  border-color: rgba(203, 213, 225, 0.85);
  color: #64748b;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 2px 6px rgba(15, 23, 42, 0.04);
}

.header-search-trigger:hover {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.45);
  color: #38bdf8;
  transform: translateY(-1px);
  box-shadow:
    0 0 16px rgba(56, 189, 248, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

:root[data-theme="light"] .header-search-trigger:hover {
  background: rgba(2, 132, 199, 0.08);
  border-color: rgba(2, 132, 199, 0.35);
  color: #0284c7;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.12);
}

.hst-icon {
  display: flex;
  align-items: center;
  color: #38bdf8;
  flex-shrink: 0;
}

:root[data-theme="light"] .hst-icon {
  color: #0284c7;
}

.hst-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.hst-kbd {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.hst-kbd kbd {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10.5px;
  font-family: inherit;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

:root[data-theme="light"] .hst-kbd kbd {
  background: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.12);
  color: #64748b;
}

/* ==================== COMMAND PALETTE BACKDROP & MODAL ==================== */
.cmd-palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(10, 15, 30, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 16px 24px;
  overflow-y: auto;
}

.cmd-palette-dialog {
  width: 100%;
  max-width: 740px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 20px;
  box-shadow:
    0 24px 60px -10px rgba(0, 0, 0, 0.65),
    0 0 0 1px rgba(56, 189, 248, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cmd-dialog-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

:root[data-theme="light"] .cmd-palette-dialog {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(203, 213, 225, 0.85);
  box-shadow:
    0 24px 60px -10px rgba(15, 23, 42, 0.25),
    0 0 0 1px rgba(2, 132, 199, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

@keyframes cmd-dialog-pop {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ==================== INPUT SEARCH WRAPPER ==================== */
.cmd-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

:root[data-theme="light"] .cmd-input-wrapper {
  border-bottom-color: rgba(226, 232, 240, 0.9);
  background: rgba(248, 250, 252, 0.8);
}

.cmd-search-icon {
  display: flex;
  align-items: center;
  color: #38bdf8;
  flex-shrink: 0;
}

:root[data-theme="light"] .cmd-search-icon {
  color: #0284c7;
}

.cmd-search-input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  font-size: 15.5px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: -0.01em;
}

:root[data-theme="light"] .cmd-search-input {
  color: #0f172a;
}

.cmd-search-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

:root[data-theme="light"] .cmd-search-input::placeholder {
  color: #94a3b8;
}

.cmd-clear-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 0;
  color: rgba(255, 255, 255, 0.7);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cmd-clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.cmd-esc-badge {
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 2px 7px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

:root[data-theme="light"] .cmd-esc-badge {
  background: rgba(15, 23, 42, 0.05);
  border-color: rgba(15, 23, 42, 0.1);
  color: #64748b;
}

/* ==================== CATEGORY FILTER TABS ==================== */
.cmd-filter-tabs {
  display: flex;
  gap: 6px;
  padding: 10px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  overflow-x: auto;
  scrollbar-width: none;
}

:root[data-theme="light"] .cmd-filter-tabs {
  border-bottom-color: rgba(226, 232, 240, 0.8);
  background: rgba(248, 250, 252, 0.5);
}

.cft-btn {
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.68);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

:root[data-theme="light"] .cft-btn {
  color: #64748b;
}

.cft-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

:root[data-theme="light"] .cft-btn:hover {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
}

.cft-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-weight: 700;
}

:root[data-theme="light"] .cft-btn.active {
  background: rgba(2, 132, 199, 0.1);
  border-color: rgba(2, 132, 199, 0.3);
  color: #0284c7;
}

/* ==================== RESULTS LIST & SCROLL AREA ==================== */
.cmd-results-list {
  max-height: 460px;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(56, 189, 248, 0.3) transparent;
}

.cmd-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cmd-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px;
}

.csh-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #38bdf8;
}

:root[data-theme="light"] .csh-title {
  color: #0284c7;
}

.csh-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

:root[data-theme="light"] .csh-count {
  color: #94a3b8;
}

/* ==================== PROVINCES GRID ==================== */
.cmd-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;
}

.cmd-province-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

:root[data-theme="light"] .cmd-province-card {
  background: #ffffff;
  border-color: rgba(226, 232, 240, 0.95);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
}

.cmd-province-card:hover,
.cmd-province-card.is-active {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(56, 189, 248, 0.15);
}

:root[data-theme="light"] .cmd-province-card:hover,
:root[data-theme="light"] .cmd-province-card.is-active {
  background: rgba(240, 249, 255, 0.95);
  border-color: #0284c7;
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.12);
}

.cpc-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cpc-emoji {
  font-size: 20px;
  line-height: 1;
}

.cpc-title-wrap {
  flex: 1;
  min-width: 0;
}

.cpc-name {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

:root[data-theme="light"] .cpc-name {
  color: #0f172a;
}

.cpc-tagline {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

:root[data-theme="light"] .cpc-tagline {
  color: #64748b;
}

.cpc-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.cpc-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11.5px;
  line-height: 1.35;
}

.cpc-info-row {
  display: flex;
  gap: 5px;
}

.cpc-label {
  color: rgba(255, 255, 255, 0.5);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

:root[data-theme="light"] .cpc-label {
  color: #64748b;
}

.cpc-val {
  color: rgba(255, 255, 255, 0.88);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:root[data-theme="light"] .cpc-val {
  color: #1e293b;
}

.text-amber {
  color: #fbbf24 !important;
}

:root[data-theme="light"] .text-amber {
  color: #d97706 !important;
}

.text-teal {
  color: #2dd4bf !important;
}

:root[data-theme="light"] .text-teal {
  color: #0d9488 !important;
}

.cpc-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

:root[data-theme="light"] .cpc-actions {
  border-top-color: rgba(226, 232, 240, 0.8);
}

.cpc-btn {
  flex: 1;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cpc-btn-explore {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

:root[data-theme="light"] .cpc-btn-explore {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.cpc-btn-explore:hover {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border-color: #38bdf8;
}

.cpc-btn-plan {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);
}

.cpc-btn-plan:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45);
}

/* ==================== FEATURES & HERITAGE LIST ==================== */
.cmd-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cmd-feature-item,
.cmd-heritage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

:root[data-theme="light"] .cmd-feature-item,
:root[data-theme="light"] .cmd-heritage-item {
  background: #ffffff;
  border-color: rgba(226, 232, 240, 0.9);
}

.cmd-feature-item:hover,
.cmd-feature-item.is-active,
.cmd-heritage-item:hover,
.cmd-heritage-item.is-active {
  background: rgba(56, 189, 248, 0.09);
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateX(4px);
}

:root[data-theme="light"] .cmd-feature-item:hover,
:root[data-theme="light"] .cmd-feature-item.is-active,
:root[data-theme="light"] .cmd-heritage-item:hover,
:root[data-theme="light"] .cmd-heritage-item.is-active {
  background: #f0f9ff;
  border-color: #0284c7;
}

.cfi-icon,
.chi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chi-icon {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.cfi-content,
.chi-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cfi-title-row,
.chi-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cfi-title,
.chi-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #ffffff;
}

:root[data-theme="light"] .cfi-title,
:root[data-theme="light"] .chi-title {
  color: #0f172a;
}

.cfi-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
}

:root[data-theme="light"] .cfi-badge {
  background: rgba(15, 23, 42, 0.05);
}

.cfi-desc,
.chi-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root[data-theme="light"] .cfi-desc,
:root[data-theme="light"] .chi-desc {
  color: #64748b;
}

.chi-location {
  font-size: 11px;
  color: #38bdf8;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
}

:root[data-theme="light"] .chi-location {
  color: #0284c7;
}

.cfi-arrow {
  color: rgba(255, 255, 255, 0.4);
  transition: transform 0.2s ease;
}

.cmd-feature-item:hover .cfi-arrow {
  color: #38bdf8;
  transform: translateX(3px);
}

.chi-btn {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #c084fc;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.chi-btn:hover {
  background: #a855f7;
  color: #ffffff;
}

/* ==================== EMPTY STATE ==================== */
.cmd-empty-state {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ces-icon {
  color: #f59e0b;
  margin-bottom: 4px;
}

.cmd-empty-state h4 {
  margin: 0;
  font-size: 15px;
  color: #ffffff;
}

:root[data-theme="light"] .cmd-empty-state h4 {
  color: #0f172a;
}

.cmd-empty-state p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  max-width: 440px;
}

:root[data-theme="light"] .cmd-empty-state p {
  color: #64748b;
}

.ces-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
}

.ces-tags button {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #38bdf8;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ces-tags button:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
}

/* ==================== FOOTER ==================== */
.cmd-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.5);
}

:root[data-theme="light"] .cmd-footer {
  border-top-color: rgba(226, 232, 240, 0.8);
  background: rgba(248, 250, 252, 0.8);
  color: #64748b;
}

.cmd-footer-keys {
  display: flex;
  gap: 12px;
}

.cmd-footer-keys span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.cmd-footer-keys kbd {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

:root[data-theme="light"] .cmd-footer-keys kbd {
  background: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.1);
  color: #475569;
}

/* ==================== TRANSITION ANIMATIONS ==================== */
.cmd-palette-fade-enter-active,
.cmd-palette-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.cmd-palette-fade-enter-from,
.cmd-palette-fade-leave-to {
  opacity: 0;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 900px) {
  .header-search-trigger {
    width: 170px;
  }
  .hst-kbd {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-search-trigger {
    width: 38px;
    padding: 0;
    justify-content: center;
  }
  .hst-text,
  .hst-kbd {
    display: none;
  }
  .cmd-cards-grid {
    grid-template-columns: 1fr;
  }
  .cmd-palette-backdrop {
    padding: 16px;
  }
}
</style>
