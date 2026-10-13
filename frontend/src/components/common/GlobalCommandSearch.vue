<template>
  <div class="header-search-box" ref="searchBoxRef" :class="{ 'is-focused': isFocused, 'has-query': searchQuery.length > 0 }">
    <!-- KHUNG NHẬP LIỆU TRÊN MENU BAR (CHỈ CON TRỎ NHẤP NHÁY ĐỂ NHẬP, KHÔNG HIỆN BẢNG DÀI DÒNG) -->
    <div class="hsb-input-wrapper">
      <span class="hsb-icon">
        <AppIcon name="search" :size="16" />
      </span>
      <input
        ref="inputRef"
        type="text"
        v-model="searchQuery"
        class="hsb-input"
        placeholder="Tìm chức năng, tỉnh thành..."
        @focus="handleFocus"
        @input="handleInput"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.up.prevent="navigateResults(-1)"
        @keydown.enter.prevent="selectActiveResult"
        @keydown.esc.prevent="handleEscape"
        aria-label="Tìm kiếm tính năng, tỉnh thành"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="hsb-clear-btn"
        @click="clearSearch"
        title="Xóa từ khóa"
      >
        <AppIcon name="x" :size="13" />
      </button>
      <span v-else class="hsb-kbd" title="Phím tắt: Ctrl + K">
        <kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd><kbd>K</kbd>
      </span>
    </div>

    <!-- DROPDOWN KẾT QUẢ: CHỈ HIỆN KHI NGƯỜI DÙNG THỰC SỰ GÕ TỪ KHÓA TÌM KIẾM -->
    <transition name="hsb-dropdown-anim">
      <div
        v-if="isDropdownVisible"
        class="hsb-dropdown"
        :class="{ 'dark-mode': isDark }"
        ref="dropdownRef"
      >
        <!-- HEADER KẾT QUẢ NHỎ GỌN -->
        <div class="hsb-dropdown-header">
          <span class="hdh-query">Kết quả cho "<b>{{ searchQuery }}</b>"</span>
          <span class="hdh-count">{{ allFilteredCount }} kết quả</span>
        </div>

        <!-- KHÔNG TÌM THẤY KẾT QUẢ -->
        <div v-if="allFilteredCount === 0" class="hsb-empty-state">
          <span class="hes-icon"><AppIcon name="alertcircle" :size="20" /></span>
          <p>Không tìm thấy chức năng hoặc tỉnh thành nào khớp với từ khóa.</p>
          <small>Gợi ý: Thử gõ <i>Đà Nẵng</i>, <i>Huế</i>, <i>Lên lịch</i>, <i>Chia tiền</i>, <i>Vé xe</i>...</small>
        </div>

        <!-- DANH SÁCH KẾT QUẢ THEO TỪNG NHÓM -->
        <div v-else class="hsb-results-scroll">
          
          <!-- 1. NHÓM CHỨC NĂNG & TIỆN ÍCH -->
          <div v-if="filteredFeatures.length > 0" class="hsb-group">
            <div class="hsb-group-title">
              <span>⚡ Chức năng &amp; Tiện ích</span>
              <small>({{ filteredFeatures.length }})</small>
            </div>
            <div class="hsb-items-list">
              <div
                v-for="(feat, idx) in filteredFeatures"
                :key="feat.id"
                class="hsb-feature-row"
                :class="{ 'is-active': activeIndex === idx }"
                @mouseenter="activeIndex = idx"
                @click="handleFeatureClick(feat)"
              >
                <div class="hfr-icon" :style="{ background: feat.colorBg, color: feat.colorText }">
                  <AppIcon :name="feat.icon" :size="16" />
                </div>
                <div class="hfr-info">
                  <div class="hfr-name-row">
                    <span class="hfr-name">{{ feat.title }}</span>
                    <span class="hfr-badge" :style="{ color: feat.colorText }">{{ feat.badge }}</span>
                  </div>
                  <span class="hfr-desc">{{ feat.desc }}</span>
                </div>
                <span class="hfr-arrow"><AppIcon name="arrowright" :size="14" /></span>
              </div>
            </div>
          </div>

          <!-- 2. NHÓM TỈNH THÀNH MIỀN TRUNG -->
          <div v-if="filteredProvinces.length > 0" class="hsb-group">
            <div class="hsb-group-title">
              <span>🏛️ Tỉnh &amp; Thành phố Miền Trung</span>
              <small>({{ filteredProvinces.length }})</small>
            </div>
            <div class="hsb-provinces-list">
              <div
                v-for="(prov, idx) in filteredProvinces"
                :key="prov.id"
                class="hsb-province-row"
                :class="{ 'is-active': activeIndex === (filteredFeatures.length + idx) }"
                @mouseenter="activeIndex = (filteredFeatures.length + idx)"
                @click="handleProvinceClick(prov, 'explore')"
              >
                <div class="hpr-left">
                  <span class="hpr-emoji">{{ prov.icon }}</span>
                  <div class="hpr-text">
                    <div class="hpr-title-row">
                      <strong class="hpr-name">{{ prov.name }}</strong>
                      <span class="hpr-tagline">{{ prov.tagline }}</span>
                    </div>
                    <div class="hpr-details">
                      <span><AppIcon name="map" :size="11" /> {{ prov.attractions }}</span>
                      <span class="hpr-spec"><AppIcon name="utensils" :size="11" /> {{ prov.specialties }}</span>
                    </div>
                  </div>
                </div>

                <div class="hpr-actions">
                  <button
                    type="button"
                    class="hpr-btn hpr-btn-explore"
                    @click.stop="handleProvinceClick(prov, 'explore')"
                    title="Xem điểm đến tại tỉnh này"
                  >
                    <AppIcon name="compass" :size="12" /> Khám phá
                  </button>
                  <button
                    type="button"
                    class="hpr-btn hpr-btn-plan"
                    @click.stop="handleProvinceClick(prov, 'plan')"
                    title="Lên kế hoạch du lịch AI tới tỉnh này"
                  >
                    <AppIcon name="calendar" :size="12" /> Lên lịch
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. NHÓM DI SẢN THẾ GIỚI UNESCO -->
          <div v-if="filteredHeritages.length > 0" class="hsb-group">
            <div class="hsb-group-title">
              <span>👑 Di sản Thế giới UNESCO</span>
              <small>({{ filteredHeritages.length }})</small>
            </div>
            <div class="hsb-heritages-list">
              <div
                v-for="(her, idx) in filteredHeritages"
                :key="her.id"
                class="hsb-heritage-row"
                :class="{ 'is-active': activeIndex === (filteredFeatures.length + filteredProvinces.length + idx) }"
                @mouseenter="activeIndex = (filteredFeatures.length + filteredProvinces.length + idx)"
                @click="handleHeritageClick(her)"
              >
                <div class="hhr-icon"><AppIcon name="landmark" :size="15" /></div>
                <div class="hhr-text">
                  <div class="hhr-title-row">
                    <strong>{{ her.title }}</strong>
                    <span class="hhr-loc"><AppIcon name="pin" :size="11" /> {{ her.location }}</span>
                  </div>
                  <span class="hhr-desc">{{ her.unescoType }} • {{ her.desc }}</span>
                </div>
                <button type="button" class="hhr-btn">Xem</button>
              </div>
            </div>
          </div>

        </div>

        <!-- FOOTER PHÍM TẮT DƯỚI CÙNG -->
        <div class="hsb-dropdown-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> để chọn</span>
          <span><kbd>↵</kbd> để mở</span>
          <span><kbd>ESC</kbd> để đóng</span>
        </div>
      </div>
    </transition>
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
const searchQuery = ref('')
const isFocused = ref(false)
const activeIndex = ref(0)
const inputRef = ref(null)
const searchBoxRef = ref(null)
const dropdownRef = ref(null)

const isMac = computed(() => {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
})

// CHỈ HIỂN THỊ DROPDOWN KHI ĐÃ CÓ TỪ KHÓA TÌM KIẾM
const isDropdownVisible = computed(() => {
  return isFocused.value && searchQuery.value.trim().length > 0
})

// ==================== HÀM BỎ DẤU TIẾNG VIỆT SIÊU NHẠY ====================
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
    attractions: 'Đại Nội Huế, Chùa Thiên Mụ, Lăng Khải Định, Đầm Lập An',
    specialties: 'Bún bò Huế, Bánh bèo, Bánh nậm, Bánh lọc, Cơm hến',
    tags: ['huế', 'hue', 'thừa thiên huế', 'cố đô', 'đại nội', 'sông hương', 'bún bò', 'chùa thiên mụ']
  },
  {
    id: 'prov-danang',
    name: 'Đà Nẵng',
    shortName: 'Đà Nẵng',
    icon: '🌉',
    tagline: 'Cầu Vàng Bà Nà Hills, Biển Mỹ Khê & Bán Đảo Sơn Trà',
    attractions: 'Cầu Vàng Bà Nà, Biển Mỹ Khê, Bán đảo Sơn Trà, Cầu Rồng, Ngũ Hành Sơn',
    specialties: 'Mì Quảng ếch, Bánh tráng cuốn thịt heo, Bún chả cá, Bê thui',
    tags: ['đà nẵng', 'da nang', 'danang', 'cầu vàng', 'bà nà', 'mỹ khê', 'cầu rồng', 'sơn trà', 'mì quảng']
  },
  {
    id: 'prov-quangtri',
    name: 'Quảng Trị',
    shortName: 'Quảng Trị',
    icon: '⛰️',
    tagline: 'Vương Quốc Hang Động Phong Nha & Dấu Ấn Lịch Sử Hào Hùng',
    attractions: 'Động Phong Nha, Động Thiên Đường, Địa đạo Vịnh Mốc, Thành Cổ Quảng Trị',
    specialties: 'Cháo bột cá lóc (bánh canh), Thịt trâu lá trơng, Rượu Kim Long',
    tags: ['quảng trị', 'quang tri', 'phong nha', 'thiên đường', 'vịnh mốc', 'thành cổ', 'bánh canh']
  },
  {
    id: 'prov-thanhhoa',
    name: 'Thanh Hóa',
    shortName: 'Thanh Hóa',
    icon: '🏰',
    tagline: 'Biển Sầm Sơn Sôi Động, Pù Luông Đại Ngàn & Thành Nhà Hồ',
    attractions: 'Bãi biển Sầm Sơn, Pù Luông, Di sản Thành Nhà Hồ, Suối Cá Thần',
    specialties: 'Nem chua Thanh Hóa, Chả tôm nướng, Bánh gai Tứ Trụ',
    tags: ['thanh hóa', 'thanh hoa', 'sầm sơn', 'pù luông', 'thành nhà hồ', 'nem chua', 'suối cá thần']
  },
  {
    id: 'prov-nghean',
    name: 'Nghệ An',
    shortName: 'Nghệ An',
    icon: '🌾',
    tagline: 'Bãi Biển Cửa Lò, Làng Sen Quê Bác & VQG Pù Mát',
    attractions: 'Bãi biển Cửa Lò, Làng Sen quê Bác, Đảo Chè Thanh Chương, VQG Pù Mát',
    specialties: 'Cháo lươn & Súp lươn xứ Nghệ, Mực nhảy Cửa Lò, Tương Nam Đàn',
    tags: ['nghệ an', 'nghe an', 'cửa lò', 'làng sen', 'quê bác', 'súp lươn', 'cháo lươn', 'vinh']
  },
  {
    id: 'prov-hatinh',
    name: 'Hà Tĩnh',
    shortName: 'Hà Tĩnh',
    icon: '🌊',
    tagline: 'Cung Biển Thiên Cầm Đàn Trời & Ngã Ba Đồng Lộc Bất Tử',
    attractions: 'Biển Thiên Cầm, Khu di tích Ngã Ba Đồng Lộc, Chùa Hương Tích, Hồ Kẻ Gỗ',
    specialties: 'Kẹo Cu đơ Hà Tĩnh, Mực nhảy Vũng Áng, Bưởi Phúc Trạch',
    tags: ['hà tĩnh', 'ha tinh', 'thiên cầm', 'ngã ba đồng lộc', 'kẹo cu đơ', 'hồ kẻ gỗ', 'chùa hương tích']
  },
  {
    id: 'prov-quangngai',
    name: 'Quảng Ngãi',
    shortName: 'Quảng Ngãi',
    icon: '🏖️',
    tagline: 'Thiên Đường Biển Đảo Lý Sơn & Cổng Tò Vò Núi Lửa',
    attractions: 'Đảo Lý Sơn, Cổng Tò Vò, Đỉnh Thới Lới, Biển Sa Huỳnh, Ba Làng An',
    specialties: 'Tỏi cô đơn Lý Sơn, Don sông Trà, Cá bống kho tộ, Cúm núm nướng',
    tags: ['quảng ngãi', 'quang ngai', 'lý sơn', 'cổng tò vò', 'sa huỳnh', 'tỏi lý sơn', 'don']
  },
  {
    id: 'prov-gialai',
    name: 'Gia Lai',
    shortName: 'Gia Lai',
    icon: '🐘',
    tagline: 'Đôi Mắt Pleiku Biển Hồ T’Nưng & Văn Hóa Cồng Chiêng Tây Nguyên',
    attractions: 'Biển Hồ T’Nưng, Núi lửa Chư Đang Ya, Thác Phú Cường, Chùa Minh Thành',
    specialties: 'Phở hai tô (Phở khô Gia Lai), Bò một nắng muối kiến vàng, Gà nướng cơm lam',
    tags: ['gia lai', 'pleiku', 'biển hồ', 'chư đang ya', 'phở hai tô', 'cồng chiêng', 'tây nguyên']
  },
  {
    id: 'prov-daklak',
    name: 'Đắk Lắk',
    shortName: 'Đắk Lắk',
    icon: '☕',
    tagline: 'Thủ Phủ Cà Phê Buôn Ma Thuột, Thác Dray Nur & Hồ Lắk',
    attractions: 'Bảo tàng Thế giới Cà phê, Thác Dray Nur hùng vĩ, Hồ Lắk, Buôn Đôn',
    specialties: 'Cà phê nguyên chất Ban Mê, Bún đỏ Buôn Ma Thuột, Gỏi cà đắng',
    tags: ['đắk lắk', 'dak lak', 'buôn ma thuột', 'bảo tàng cà phê', 'thác dray nur', 'hồ lắk', 'buôn đôn', 'cà phê']
  },
  {
    id: 'prov-khanhhoa',
    name: 'Khánh Hòa',
    shortName: 'Khánh Hòa',
    icon: '⛵',
    tagline: 'Vịnh Biển Nha Trang Thiên Đường, VinWonders & Tháp Bà Ponagar',
    attractions: 'Bãi biển Nha Trang, VinWonders Hòn Tre, Tháp Bà Ponagar, Viện Hải dương học',
    specialties: 'Nem nướng Ninh Hòa, Bún sứa, Bún chả cá Nha Trang, Yến sào',
    tags: ['khánh hòa', 'nha trang', 'khanh hoa', 'nhatrang', 'vinwonders', 'tháp bà ponagar', 'nem nướng']
  },
  {
    id: 'prov-lamdong',
    name: 'Lâm Đồng',
    shortName: 'Lâm Đồng',
    icon: '🌲',
    tagline: 'Thành Phố Sương Mù Đà Lạt Ngàn Hoa & Thác Dambri',
    attractions: 'Hồ Xuân Hương, Quảng trường Lâm Viên, Thung Lũng Tình Yêu, Thác Dambri, Đồi chè Cầu Đất',
    specialties: 'Bánh tráng nướng Đà Lạt, Lẩu gà lá é, Lẩu bò Ba Toa, Dâu tây tươi',
    tags: ['lâm đồng', 'đà lạt', 'lam dong', 'da lat', 'dalat', 'hồ xuân hương', 'bánh tráng nướng', 'lẩu gà lá é', 'hoa']
  }
]

// ==================== DỮ LIỆU CÁC CHỨC NĂNG & TIỆN ÍCH WEB ====================
const FEATURES_DATA = [
  {
    id: 'feat-planner',
    title: 'Lên Lịch Trình Du Lịch Thông Minh AI',
    desc: 'Tự động tạo kế hoạch tối ưu theo ngày, ngân sách, phương tiện và khách sạn',
    icon: 'calendar',
    badge: 'Cốt lõi',
    colorBg: 'rgba(245, 158, 11, 0.15)',
    colorText: '#f59e0b',
    actionType: 'navigate',
    target: 'planner',
    tags: ['lên lịch', 'len lich', 'planner', 'tạo lịch trình', 'kế hoạch', 'ai', 'lộ trình', 'tự động']
  },
  {
    id: 'feat-explore',
    title: 'Khám Phá Điểm Đến Miền Trung',
    desc: 'Danh bạ 11 tỉnh thành, danh lam thắng cảnh, quán ăn đặc sản, cafe và khách sạn',
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
    desc: 'Quản lý toàn bộ danh sách các chuyến đi đã lưu, xem lại lịch trình, chia sẻ',
    icon: 'luggage',
    badge: 'Lưu trữ',
    colorBg: 'rgba(16, 185, 129, 0.15)',
    colorText: '#10b981',
    actionType: 'navigate',
    target: 'mytrips',
    tags: ['chuyến đi', 'chuyen di', 'mytrips', 'lịch trình đã lưu', 'xem lại', 'quản lý']
  },
  {
    id: 'feat-heritage',
    title: 'Bảo Tàng Ảo 3D Di Sản UNESCO',
    desc: 'Bảo tàng tương tác 3D chiêm ngưỡng 10 Di sản văn hóa & thiên nhiên thế giới',
    icon: 'landmark',
    badge: 'Bảo tàng 3D',
    colorBg: 'rgba(168, 85, 247, 0.15)',
    colorText: '#a855f7',
    actionType: 'modal',
    target: 'heritage',
    tags: ['di sản', 'di san', 'unesco', 'bảo tàng', '3d', 'cố đô huế', 'hội an', 'mỹ sơn']
  },
  {
    id: 'feat-bill-splitter',
    title: 'Chia Tiền Nhóm (Bill Splitter)',
    desc: 'Công cụ tính toán chia tiền ăn uống, chi phí phòng và đi lại cho cả nhóm sòng phẳng',
    icon: 'wallet',
    badge: 'Tài chính',
    colorBg: 'rgba(234, 88, 12, 0.15)',
    colorText: '#ea580c',
    actionType: 'modal',
    target: 'bill-splitter',
    tags: ['chia tiền', 'chia tien', 'bill splitter', 'tính tiền', 'chi phí nhóm', 'chia nhóm', 'hóa đơn']
  },
  {
    id: 'feat-travel-pass',
    title: 'Thẻ Hành Trình Offline (Travel Pass)',
    desc: 'Xuất vé lịch trình du lịch thông minh cầm tay không cần internet/4G',
    icon: 'award',
    badge: 'Offline',
    colorBg: 'rgba(14, 165, 233, 0.15)',
    colorText: '#0ea5e9',
    actionType: 'modal',
    target: 'travel-pass',
    tags: ['travel pass', 'thẻ hành trình', 'vé offline', 'không cần mạng', 'vé du lịch', 'thẻ thông hành']
  },
  {
    id: 'feat-rain-guard',
    title: 'Đổi Lịch Trình Tránh Mưa (Weather Guard)',
    desc: 'AI tự động phát hiện dự báo mưa và hoán đổi địa điểm sang hoạt động trong nhà',
    icon: 'cloudrain',
    badge: 'Thời tiết',
    colorBg: 'rgba(99, 102, 241, 0.15)',
    colorText: '#6366f1',
    actionType: 'modal',
    target: 'rain',
    tags: ['tránh mưa', 'thời tiết', 'rain guard', 'hoán đổi lịch', 'trong nhà', 'mưa', 'bão']
  },
  {
    id: 'feat-infographic',
    title: 'Xuất Thẻ Infographic Zalo & Facebook',
    desc: 'Tạo thẻ tóm tắt chuyến đi dạng đồ họa bắt mắt để chia sẻ nhanh cho bạn bè',
    icon: 'share2',
    badge: 'Chia sẻ',
    colorBg: 'rgba(34, 197, 94, 0.15)',
    colorText: '#22c55e',
    actionType: 'modal',
    target: 'infographic',
    tags: ['infographic', 'chia sẻ zalo', 'ảnh đẹp', 'mạng xã hội', 'facebook', 'tóm tắt']
  },
  {
    id: 'feat-chatbot',
    title: 'Trợ Lý Du Lịch Ảo AI (Chatbot)',
    desc: 'Trò chuyện hỏi đáp kinh nghiệm, mẹo du lịch và giải đáp thắc mắc 24/7',
    icon: 'bot',
    badge: 'Trợ lý AI',
    colorBg: 'rgba(236, 72, 153, 0.15)',
    colorText: '#ec4899',
    actionType: 'modal',
    target: 'chatbot',
    tags: ['chatbot', 'trợ lý ai', 'chat', 'hỏi đáp', 'tư vấn', 'kinh nghiệm', 'mẹo du lịch']
  },
  {
    id: 'feat-theme',
    title: 'Chuyển Đổi Giao Diện Sáng / Tối',
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
    desc: 'Xem thông tin tài khoản, danh hiệu và các địa điểm du lịch bạn đã thả tim',
    icon: 'user',
    badge: 'Tài khoản',
    colorBg: 'rgba(139, 92, 246, 0.15)',
    colorText: '#8b5cf6',
    actionType: 'navigate',
    target: 'profile',
    tags: ['tài khoản', 'hồ sơ', 'profile', 'yêu thích', 'đã lưu']
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
    title: 'Bảng Điều Khiển Quản Trị Viên (Admin)',
    desc: 'Công cụ crawler dữ liệu 110 địa điểm, quản trị người dùng và hệ thống',
    icon: 'dashboard',
    badge: 'Quản trị',
    colorBg: 'rgba(239, 68, 68, 0.15)',
    colorText: '#ef4444',
    actionType: 'navigate',
    target: 'admin',
    tags: ['admin', 'quản trị', 'crawler', 'cào dữ liệu', 'thống kê']
  }
]

// ==================== DỮ LIỆU 10 DI SẢN THẾ GIỚI UNESCO ====================
const HERITAGES_DATA = [
  {
    id: 'her-hue',
    title: 'Quần Thể Di Tích Cố Đô Huế',
    unescoType: 'Di sản Văn hóa Thế giới',
    location: 'Thừa Thiên Huế',
    desc: 'Đại Nội Huế, lăng tẩm hoàng gia và Kỳ đài sông Hương',
    cityTarget: 'Huế',
    tags: ['cố đô huế', 'đại nội', 'nguyễn', 'huế', 'di sản văn hóa']
  },
  {
    id: 'her-hoian',
    title: 'Đô Thị Cổ Hội An',
    unescoType: 'Di sản Văn hóa Thế giới',
    location: 'Đà Nẵng / Quảng Nam',
    desc: 'Thương cảng quốc tế thế kỷ 16 với Chùa Cầu, nhà cổ đèn lồng vàng',
    cityTarget: 'Đà Nẵng',
    tags: ['phố cổ hội an', 'hội an', 'chùa cầu', 'quảng nam', 'đèn lồng']
  },
  {
    id: 'her-myson',
    title: 'Thánh Địa Mỹ Sơn',
    unescoType: 'Di sản Văn hóa Thế giới',
    location: 'Đà Nẵng / Quảng Nam',
    desc: 'Quần thể tháp Chăm Pa huyền bí giữa thung lũng đại ngàn',
    cityTarget: 'Đà Nẵng',
    tags: ['thánh địa mỹ sơn', 'mỹ sơn', 'chăm pa', 'tháp chàm']
  },
  {
    id: 'her-phongnha',
    title: 'Vườn Quốc Gia Phong Nha - Kẻ Bàng',
    unescoType: 'Di sản Thiên nhiên Thế giới',
    location: 'Quảng Trị / Quảng Bình',
    desc: 'Động Phong Nha, Động Thiên Đường, Sơn Đoòng và sông ngầm kỳ ảo',
    cityTarget: 'Quảng Trị',
    tags: ['phong nha kẻ bàng', 'động phong nha', 'thiên đường', 'sơn đoòng', 'quảng trị']
  },
  {
    id: 'her-nhanhac',
    title: 'Nhã Nhạc Cung Đình Huế',
    unescoType: 'Di sản Văn hóa Phi vật thể',
    location: 'Thừa Thiên Huế',
    desc: 'Âm nhạc cung đình triều Nguyễn trong các đại lễ tế tự hoàng gia',
    cityTarget: 'Huế',
    tags: ['nhã nhạc cung đình huế', 'nhã nhạc', 'âm nhạc', 'huế']
  },
  {
    id: 'her-baichoi',
    title: 'Nghệ Thuật Bài Chòi Trung Bộ',
    unescoType: 'Di sản Văn hóa Phi vật thể',
    location: 'Trung Bộ',
    desc: 'Trò chơi dân gian kết hợp âm nhạc, thơ ca và diễn xướng ngẫu hứng',
    cityTarget: 'Quảng Ngãi',
    tags: ['bài chòi', 'dân ca bài chòi', 'miền trung']
  },
  {
    id: 'her-congchieng',
    title: 'Không Gian Văn Hóa Cồng Chiêng Tây Nguyên',
    unescoType: 'Kiệt tác Phi vật thể nhân loại',
    location: 'Gia Lai & Đắk Lắk',
    desc: 'Âm vang thiêng liêng kết nối con người với thần linh giữa đại ngàn',
    cityTarget: 'Gia Lai',
    tags: ['cồng chiêng tây nguyên', 'cồng chiêng', 'gia lai', 'đắk lắk', 'tây nguyên']
  },
  {
    id: 'her-catru',
    title: 'Nghệ Thuật Ca Trù',
    unescoType: 'Di sản Phi vật thể',
    location: 'Bắc Trung Bộ',
    desc: 'Thanh nhạc thính phòng cổ truyền với đàn đáy, phách gỗ và trống chầu',
    cityTarget: 'Hà Tĩnh',
    tags: ['ca trù', 'hà tĩnh', 'nghệ an', 'thanh nhạc']
  },
  {
    id: 'her-mocban',
    title: 'Mộc Bản Triều Nguyễn',
    unescoType: 'Di sản Ký ức Thế giới',
    location: 'Thừa Thiên Huế',
    desc: 'Tài liệu khắc chữ Hán Nôm trên gỗ ghi chép lịch sử, văn hóa triều Nguyễn',
    cityTarget: 'Huế',
    tags: ['mộc bản triều nguyễn', 'mộc bản', 'tư liệu', 'huế']
  },
  {
    id: 'her-thanhnhaho',
    title: 'Thành Nhà Hồ',
    unescoType: 'Di sản Văn hóa Thế giới',
    location: 'Thanh Hóa',
    desc: 'Kinh thành đá đồ sộ độc nhất vô nhị ở Đông Nam Á xây dựng năm 1397',
    cityTarget: 'Thanh Hóa',
    tags: ['thành nhà hồ', 'thanh hóa', 'hồ quý ly', 'thành đá']
  }
]

// ==================== LỌC KẾT QUẢ THEO TỪ KHÓA ====================
const filteredProvinces = computed(() => {
  if (!searchQuery.value.trim()) return []
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
  if (!searchQuery.value.trim()) return []
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
  if (!searchQuery.value.trim()) return []
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
  return filteredFeatures.value.length + filteredProvinces.value.length + filteredHeritages.value.length
})

// ==================== XỬ LÝ FOCUS & INPUT ====================
function handleFocus() {
  isFocused.value = true
}

function handleInput() {
  activeIndex.value = 0
}

function clearSearch() {
  searchQuery.value = ''
  if (inputRef.value) inputRef.value.focus()
}

function handleEscape() {
  if (searchQuery.value) {
    searchQuery.value = ''
  } else {
    closeDropdown()
  }
}

function closeDropdown() {
  isFocused.value = false
  if (inputRef.value) inputRef.value.blur()
}

// ==================== KEYBOARD NAVIGATION ====================
function navigateResults(delta) {
  const max = allFilteredCount.value
  if (max === 0) return
  activeIndex.value = (activeIndex.value + delta + max) % max
  scrollToActive()
}

function scrollToActive() {
  nextTick(() => {
    const el = dropdownRef.value?.querySelector('.is-active')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

function selectActiveResult() {
  const activeEl = dropdownRef.value?.querySelector('.is-active')
  if (activeEl) {
    activeEl.click()
  }
}

// ==================== XỬ LÝ CLICK CHỌN KẾT QUẢ ====================
function handleProvinceClick(prov, mode) {
  closeDropdown()
  searchQuery.value = ''
  if (mode === 'plan') {
    emit('planCity', prov.shortName || prov.name)
  } else {
    emit('selectCity', prov.shortName || prov.name)
  }
}

function handleFeatureClick(feat) {
  closeDropdown()
  searchQuery.value = ''
  if (feat.actionType === 'navigate') {
    emit('navigateTab', feat.target)
  } else if (feat.actionType === 'modal') {
    emit('openModal', feat.target)
  }
}

function handleHeritageClick(her) {
  closeDropdown()
  searchQuery.value = ''
  emit('selectCity', her.cityTarget)
}

// ==================== BẮT SỰ KIỆN CLICK OUTSIDE & PHÍM TẮT ====================
function handleClickOutside(e) {
  if (searchBoxRef.value && !searchBoxRef.value.contains(e.target)) {
    closeDropdown()
  }
}

function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (inputRef.value) {
      inputRef.value.focus()
      inputRef.value.select()
    }
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
/* ==================== SEARCH BOX CONTAINER TRÊN MENU BAR ==================== */
.header-search-box {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 45;
}

/* KHUNG NHẬP LIỆU GỌN GÀNG (GLASS PILL INPUT) */
.hsb-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 4px 12px;
  height: 38px;
  width: 230px;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .hsb-input-wrapper {
  background: rgba(15, 23, 42, 0.05);
  border-color: rgba(203, 213, 225, 0.85);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 2px 6px rgba(15, 23, 42, 0.04);
}

/* KHI FOCUS: MỞ RỘNG NHẸ ĐỂ GÕ THOẢI MÁI VÀ PHÁT SÁNG VIỀN */
.header-search-box.is-focused .hsb-input-wrapper {
  width: 280px;
  background: rgba(15, 23, 42, 0.85);
  border-color: #38bdf8;
  box-shadow:
    0 0 18px rgba(56, 189, 248, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

:root[data-theme="light"] .header-search-box.is-focused .hsb-input-wrapper {
  width: 280px;
  background: #ffffff;
  border-color: #0284c7;
  box-shadow:
    0 0 16px rgba(2, 132, 199, 0.18),
    0 4px 12px rgba(15, 23, 42, 0.06);
}

.hsb-icon {
  display: flex;
  align-items: center;
  color: #38bdf8;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

:root[data-theme="light"] .hsb-icon {
  color: #0284c7;
}

.header-search-box.is-focused .hsb-icon {
  transform: scale(1.08);
}

.hsb-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: -0.01em;
}

:root[data-theme="light"] .hsb-input {
  color: #0f172a;
}

.hsb-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12.5px;
}

:root[data-theme="light"] .hsb-input::placeholder {
  color: #94a3b8;
}

.hsb-clear-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 0;
  color: rgba(255, 255, 255, 0.7);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.hsb-clear-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #ef4444;
}

.hsb-kbd {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  pointer-events: none;
}

.hsb-kbd kbd {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  padding: 1px 4px;
  font-size: 10px;
  font-family: inherit;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
}

:root[data-theme="light"] .hsb-kbd kbd {
  background: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.12);
  color: #64748b;
}

/* ==================== DROPDOWN KẾT QUẢ THẢ XUỐNG ==================== */
.hsb-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 460px;
  max-width: 92vw;
  background: rgba(15, 23, 42, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  box-shadow:
    0 20px 48px -6px rgba(0, 0, 0, 0.65),
    0 0 0 1px rgba(56, 189, 248, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  animation: hsb-dropdown-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

:root[data-theme="light"] .hsb-dropdown {
  background: rgba(255, 255, 255, 0.97);
  border-color: rgba(203, 213, 225, 0.95);
  box-shadow:
    0 20px 48px -6px rgba(15, 23, 42, 0.2),
    0 0 0 1px rgba(2, 132, 199, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

@keyframes hsb-dropdown-pop {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* DROPDOWN HEADER */
.hsb-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  font-size: 11.5px;
}

:root[data-theme="light"] .hsb-dropdown-header {
  border-bottom-color: rgba(226, 232, 240, 0.85);
  background: rgba(248, 250, 252, 0.7);
}

.hdh-query {
  color: rgba(255, 255, 255, 0.75);
}

:root[data-theme="light"] .hdh-query {
  color: #475569;
}

.hdh-query b {
  color: #38bdf8;
}

:root[data-theme="light"] .hdh-query b {
  color: #0284c7;
}

.hdh-count {
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 1px 7px;
  border-radius: 999px;
}

:root[data-theme="light"] .hdh-count {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
}

/* SCROLL AREA */
.hsb-results-scroll {
  max-height: 380px;
  overflow-y: auto;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(56, 189, 248, 0.3) transparent;
}

.hsb-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hsb-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #38bdf8;
  padding: 2px 4px;
}

:root[data-theme="light"] .hsb-group-title {
  color: #0284c7;
}

.hsb-group-title small {
  color: rgba(255, 255, 255, 0.4);
}

:root[data-theme="light"] .hsb-group-title small {
  color: #94a3b8;
}

/* 1. FEATURES LIST */
.hsb-items-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hsb-feature-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
}

:root[data-theme="light"] .hsb-feature-row {
  background: #ffffff;
  border-color: rgba(226, 232, 240, 0.9);
}

.hsb-feature-row:hover,
.hsb-feature-row.is-active {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateX(3px);
}

:root[data-theme="light"] .hsb-feature-row:hover,
:root[data-theme="light"] .hsb-feature-row.is-active {
  background: #f0f9ff;
  border-color: #0284c7;
}

.hfr-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hfr-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.hfr-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hfr-name {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

:root[data-theme="light"] .hfr-name {
  color: #0f172a;
}

.hfr-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}

:root[data-theme="light"] .hfr-badge {
  background: rgba(15, 23, 42, 0.05);
}

.hfr-desc {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root[data-theme="light"] .hfr-desc {
  color: #64748b;
}

.hfr-arrow {
  color: rgba(255, 255, 255, 0.35);
  transition: transform 0.2s ease;
}

.hsb-feature-row:hover .hfr-arrow {
  color: #38bdf8;
  transform: translateX(2px);
}

/* 2. PROVINCES LIST */
.hsb-provinces-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hsb-province-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root[data-theme="light"] .hsb-province-row {
  background: #ffffff;
  border-color: rgba(226, 232, 240, 0.95);
}

.hsb-province-row:hover,
.hsb-province-row.is-active {
  background: rgba(56, 189, 248, 0.09);
  border-color: rgba(56, 189, 248, 0.4);
}

:root[data-theme="light"] .hsb-province-row:hover,
:root[data-theme="light"] .hsb-province-row.is-active {
  background: #f0f9ff;
  border-color: #0284c7;
}

.hpr-left {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  flex: 1;
  min-width: 0;
}

.hpr-emoji {
  font-size: 20px;
  line-height: 1.2;
}

.hpr-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hpr-title-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.hpr-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #ffffff;
}

:root[data-theme="light"] .hpr-name {
  color: #0f172a;
}

.hpr-tagline {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root[data-theme="light"] .hpr-tagline {
  color: #64748b;
}

.hpr-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root[data-theme="light"] .hpr-details {
  color: #475569;
}

.hpr-details span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hpr-spec {
  color: #fbbf24 !important;
}

:root[data-theme="light"] .hpr-spec {
  color: #d97706 !important;
}

.hpr-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.hpr-btn {
  padding: 4px 8px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hpr-btn-explore {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

:root[data-theme="light"] .hpr-btn-explore {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.hpr-btn-explore:hover {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border-color: #38bdf8;
}

.hpr-btn-plan {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #ffffff;
}

.hpr-btn-plan:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* 3. HERITAGES LIST */
.hsb-heritages-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hsb-heritage-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
}

:root[data-theme="light"] .hsb-heritage-row {
  background: #ffffff;
  border-color: rgba(226, 232, 240, 0.9);
}

.hsb-heritage-row:hover,
.hsb-heritage-row.is-active {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.4);
}

:root[data-theme="light"] .hsb-heritage-row:hover,
:root[data-theme="light"] .hsb-heritage-row.is-active {
  background: #faf5ff;
  border-color: #9333ea;
}

.hhr-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hhr-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.hhr-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hhr-title-row strong {
  font-size: 13px;
  color: #ffffff;
}

:root[data-theme="light"] .hhr-title-row strong {
  color: #0f172a;
}

.hhr-loc {
  font-size: 10.5px;
  color: #38bdf8;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

:root[data-theme="light"] .hhr-loc {
  color: #0284c7;
}

.hhr-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root[data-theme="light"] .hhr-desc {
  color: #64748b;
}

.hhr-btn {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #c084fc;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

/* EMPTY STATE */
.hsb-empty-state {
  text-align: center;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.hes-icon {
  color: #f59e0b;
}

.hsb-empty-state p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

:root[data-theme="light"] .hsb-empty-state p {
  color: #0f172a;
}

.hsb-empty-state small {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.5);
}

:root[data-theme="light"] .hsb-empty-state small {
  color: #64748b;
}

/* DROPDOWN FOOTER */
.hsb-dropdown-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 8px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

:root[data-theme="light"] .hsb-dropdown-footer {
  border-top-color: rgba(226, 232, 240, 0.85);
  background: rgba(248, 250, 252, 0.8);
  color: #64748b;
}

.hsb-dropdown-footer kbd {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 9.5px;
  font-weight: 700;
}

:root[data-theme="light"] .hsb-dropdown-footer kbd {
  background: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.1);
}

/* TRANSITION ANIMATION */
.hsb-dropdown-anim-enter-active,
.hsb-dropdown-anim-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.hsb-dropdown-anim-enter-from,
.hsb-dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .hsb-input-wrapper {
    width: 170px;
  }
  .hsb-kbd {
    display: none;
  }
}

@media (max-width: 680px) {
  .hsb-input-wrapper {
    width: 140px;
  }
  .header-search-box.is-focused .hsb-input-wrapper {
    width: 220px;
  }
  .hsb-dropdown {
    width: 320px;
  }
}
</style>
