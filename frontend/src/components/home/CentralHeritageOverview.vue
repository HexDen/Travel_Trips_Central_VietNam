<template>
  <div class="central-heritage-compact" v-reveal>
    <!-- 1. TIÊU ĐỀ TỔNG QUAN -->
    <header class="ch-header">
      <div class="ch-kicker">BẢO TÀNG 3D VŨ TRỤ DI SẢN THẾ GIỚI UNESCO</div>
      <h2 class="ch-title">10 Di sản Thế giới &amp; Dấu ấn Miền Trung</h2>
    </header>

    <!-- 2. VÒNG XOAY 3D THUẦN TÚY (NỀN TRONG SUỐT, CĂN GIỮA MÀN HÌNH) -->
    <div class="ch-pure-3d-container">
      <!-- VÒNG TRÒN 3D CYLINDER CAROUSEL -->
      <div
        class="wrapper"
        ref="wrapperRef"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div
          class="inner"
          :style="{
            '--quantity': heritages.length,
            transform: `perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(${currentAngle}deg)`
          }"
        >
          <div
            v-for="(item, idx) in heritages"
            :key="item.id"
            :class="['card', { active: activeHeritage && activeHeritage.id === item.id }]"
            :style="{
              '--index': idx,
              '--color-card': item.colorCard
            }"
            @click.stop="openHeritageDetail(item, idx)"
            role="button"
            :title="`Xem thông tin: ${item.name}`"
          >
            <div class="card-media">
              <img
                :src="item.image"
                :alt="item.name"
                class="img"
                loading="eager"
              />
              <div class="card-glow-overlay"></div>
              <span class="card-unesco-badge">UNESCO</span>
              <div class="card-caption">
                <span class="card-title">{{ item.name }}</span>
                <small class="card-prov">{{ item.province }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- THANH ĐIỀU KHIỂN CĂN GIỮA BÊN DƯỚI VÒNG XOAY -->
      <div class="stage-controls-bar">
        <div class="stage-controls">
          <button type="button" class="ctrl-btn" @click="rotatePrev" title="Xoay sang trái">
            ←
          </button>
          <button
            type="button"
            class="ctrl-btn btn-play"
            @click="toggleAutoRotate"
            :title="isAutoRotating ? 'Tạm dừng tự xoay' : 'Tiếp tục tự xoay'"
          >
            <span v-if="isAutoRotating">❚❚</span>
            <span v-else>▶</span>
          </button>
          <button type="button" class="ctrl-btn" @click="rotateNext" title="Xoay sang phải">
            →
          </button>
        </div>
      </div>
    </div>

    <!-- 3. BẢO TÀNG SỐ MINI: MODAL GIỚI THIỆU CHUYÊN SÂU & HẤP DẪN -->
    <transition name="modal-fade">
      <div
        v-if="showDetailModal && activeHeritage"
        class="heritage-modal-backdrop"
        @click.self="showDetailModal = false"
      >
        <div class="heritage-modal-card" :style="{ '--color-modal': activeHeritage.colorCard }">
          <button
            type="button"
            class="modal-close-btn"
            @click="showDetailModal = false"
            title="Đóng [✕]"
          >
            ✕
          </button>

          <!-- HEADER COVER ẢNH THẬT KÈM BADGE VÀ NÚT CHUYỂN NHANH -->
          <div class="modal-cover-wrap">
            <img :src="activeHeritage.image" :alt="activeHeritage.fullName" class="modal-cover-img" />
            <div class="modal-cover-gradient"></div>

            <div class="modal-cover-top-bar">
              <span class="modal-badge-unesco">UNESCO {{ activeHeritage.year }}</span>
              <span class="modal-cover-type-tag">{{ activeHeritage.type }}</span>
            </div>

            <!-- NÚT LƯỚT DI SẢN TRỰC TIẾP TRÊN ẢNH -->
            <button
              type="button"
              class="cover-nav-btn prev"
              @click.stop="prevModalHeritage"
              title="Xem di sản trước (Phím ‹)"
            >
              ‹
            </button>
            <button
              type="button"
              class="cover-nav-btn next"
              @click.stop="nextModalHeritage"
              title="Xem di sản tiếp theo (Phím ›)"
            >
              ›
            </button>

            <!-- TIÊU ĐỀ NỔI TRÊN ẢNH -->
            <div class="modal-cover-caption">
              <span class="modal-cover-period">{{ activeHeritage.period }}</span>
              <h3 class="modal-cover-title">{{ activeHeritage.fullName }}</h3>
            </div>
          </div>

          <!-- PHẦN NỘI DUNG CUỘN CHUYÊN SÂU -->
          <div class="modal-body-scroll">
            <!-- 4 Ô CHỈ SỐ NHANH -->
            <div class="modal-quick-grid">
              <div class="quick-chip">
                <span class="chip-label">📍 Địa bàn</span>
                <b class="chip-val">{{ activeHeritage.province }}</b>
              </div>
              <div class="quick-chip">
                <span class="chip-label">🏛️ Danh hiệu</span>
                <b class="chip-val">{{ activeHeritage.type }}</b>
              </div>
              <div class="quick-chip">
                <span class="chip-label">📅 Năm vinh danh</span>
                <b class="chip-val">UNESCO {{ activeHeritage.year }}</b>
              </div>
              <div class="quick-chip">
                <span class="chip-label">🌤️ Mùa lý tưởng</span>
                <b class="chip-val">{{ activeHeritage.bestSeason }}</b>
              </div>
            </div>

            <!-- TAB CHUYỂN ĐỔI GÓC NHÌN -->
            <div class="modal-tabs-bar">
              <button
                type="button"
                :class="['modal-tab-btn', { active: activeModalTab === 'overview' }]"
                @click="activeModalTab = 'overview'"
              >
                📜 Tổng quan & Ý nghĩa
              </button>
              <button
                type="button"
                :class="['modal-tab-btn', { active: activeModalTab === 'highlights' }]"
                @click="activeModalTab = 'highlights'"
              >
                ✨ Điểm nhấn Độc bản ({{ activeHeritage.highlights?.length || 0 }})
              </button>
              <button
                type="button"
                :class="['modal-tab-btn', { active: activeModalTab === 'guide' }]"
                @click="activeModalTab = 'guide'"
              >
                🧭 Cẩm nang Du khách
              </button>
            </div>

            <!-- TAB 1: TỔNG QUAN & TẦM VÓC UNESCO -->
            <div v-if="activeModalTab === 'overview'" class="tab-pane-content">
              <div class="info-block">
                <h4 class="block-heading">Giới thiệu Di sản</h4>
                <p class="block-text">{{ activeHeritage.overview }}</p>
              </div>
              <div class="info-block highlight-callout">
                <h4 class="block-heading">Tầm vóc & Giá trị Thế giới (UNESCO)</h4>
                <p class="block-text">{{ activeHeritage.significance }}</p>
              </div>
            </div>

            <!-- TAB 2: ĐIỂM NHẤN ĐỘC BẢN -->
            <div v-else-if="activeModalTab === 'highlights'" class="tab-pane-content">
              <div class="highlights-grid">
                <div
                  v-for="(hl, hIdx) in activeHeritage.highlights"
                  :key="hIdx"
                  class="highlight-card"
                >
                  <div class="hl-badge">{{ String(hIdx + 1).padStart(2, '0') }}</div>
                  <div class="hl-body">
                    <h5 class="hl-title">{{ hl.title }}</h5>
                    <p class="hl-desc">{{ hl.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 3: CẨM NĂNG TRẢI NGHIỆM -->
            <div v-else-if="activeModalTab === 'guide'" class="tab-pane-content">
              <div class="guide-grid">
                <div class="guide-card">
                  <div class="guide-header">
                    <span class="guide-icon">🎯</span>
                    <h5>Trải nghiệm không thể bỏ lỡ</h5>
                  </div>
                  <p class="guide-text">{{ activeHeritage.experience?.mustDo }}</p>
                </div>
                <div class="guide-card">
                  <div class="guide-header">
                    <span class="guide-icon">💡</span>
                    <h5>Mẹo thực tế cho du khách</h5>
                  </div>
                  <p class="guide-text">{{ activeHeritage.experience?.tips }}</p>
                </div>
              </div>
            </div>

            <!-- HASHTAGS -->
            <div class="modal-tags">
              <span v-for="tag in activeHeritage.tags" :key="tag" class="modal-tag-pill">
                # {{ tag }}
              </span>
            </div>
          </div>

          <!-- FOOTER: ĐIỀU HƯỚNG LIÊN HOÀN & NÚT KHÁM PHÁ -->
          <div class="modal-actions-footer">
            <div class="modal-step-nav">
              <button type="button" class="btn-step-prev" @click="prevModalHeritage">
                ‹ Trước
              </button>
              <span class="step-indicator">
                {{ heritages.findIndex(h => h.id === activeHeritage.id) + 1 }} / {{ heritages.length }}
              </span>
              <button type="button" class="btn-step-next" @click="nextModalHeritage">
                Tiếp ›
              </button>
            </div>

            <button
              type="button"
              class="modal-btn-explore"
              @click="goToProvince(activeHeritage.primaryProvince || activeHeritage.province)"
            >
              <span>Xem điểm đến tại {{ activeHeritage.primaryProvince || activeHeritage.province }}</span>
              <strong>→</strong>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['select-destination'])

// 10 DI SẢN THẾ GIỚI UNESCO MIỀN TRUNG - 100% ẢNH THẬT NỘI BỘ CHUẨN XÁC, NỘI DUNG CHUYÊN SÂU
const heritages = [
  {
    id: 'hue',
    name: 'Cố đô Huế',
    fullName: 'Quần thể Di tích Cố đô Huế',
    year: '1993',
    type: 'Di sản Văn hóa Thế giới',
    province: 'Thừa Thiên Huế',
    primaryProvince: 'Thừa Thiên Huế',
    colorCard: '252, 208, 142', // Vàng kim triều Nguyễn
    image: '/images/heritage/hue.jpg',
    period: 'Triều Nguyễn (1802 – 1945)',
    bestSeason: 'Tháng 1 – Tháng 4 (Khí hậu mát mẻ, mùa hoa ngô đồng & Festival Huế)',
    overview: 'Kinh đô vàng son của triều Nguyễn – triều đại phong kiến cuối cùng của Việt Nam. Đây là hình mẫu kinh đô phương Đông hoàn chỉnh và tráng lệ nhất còn bảo tồn được đến nay, quy hoạch theo thuật phong thủy nghiêm ngặt kết hợp kiến trúc thành lũy Vauban phương Tây.',
    significance: 'Được UNESCO công nhận là Di sản Văn hóa Thế giới đầu tiên của Việt Nam năm 1993, Cố đô Huế là biểu tượng đỉnh cao của nền văn hiến Đại Nam với sự hòa quyện tuyệt mỹ giữa kiến trúc hoàng cung và cảnh quan sông Hương – núi Ngự.',
    highlights: [
      {
        title: 'Đại Nội & Tử Cấm Thành',
        desc: 'Trung tâm quyền lực hoàng gia với Ngọ Môn sừng sững, Điện Thái Hòa dát vàng lộng lẫy, Cung Diên Thọ và hệ thống miếu đền hoàng gia tôn nghiêm.'
      },
      {
        title: 'Quần thể Lăng tẩm Hoàng đế',
        desc: 'Mỗi lăng tẩm phản chiếu cá tính một vị vua: Lăng Tự Đức thơ mộng như cõi tiên, Lăng Minh Mạng uy nghiêm quy củ, Lăng Khải Định giao thoa nghệ thuật Á – Âu độc nhất vô nhị.'
      },
      {
        title: 'Chùa Thiên Mụ & Dòng sông Hương',
        desc: 'Ngôi quốc tự cổ kính nhất xứ Đàng Trong (khởi dựng năm 1601), tháp Phước Duyên 7 tầng soi bóng xuống làn nước biếc sông Hương thơ mộng.'
      }
    ],
    experience: {
      mustDo: 'Thuê cổ phục Việt phục chụp ảnh tại Điện Thái Hòa; đi thuyền rồng ngắm hoàng hôn sông Hương và nghe ca Huế đêm; thưởng thức chè hẻm và ẩm thực cung đình.',
      tips: 'Nên mua vé tuyến liên hợp (Đại Nội + 3 lăng) để tiết kiệm chi phí; chuẩn bị nón lá hoặc ô che khi đi bộ rộng trong Đại Nội.'
    },
    tags: ['Đại Nội Huế', 'Ngọ Môn', 'Lăng Khải Định', 'Sông Hương', 'Cung đình']
  },
  {
    id: 'hoian',
    name: 'Phố cổ Hội An',
    fullName: 'Đô thị Cổ Hội An',
    year: '1999',
    type: 'Di sản Văn hóa Thế giới',
    province: 'Quảng Nam',
    primaryProvince: 'Quảng Nam',
    colorCard: '252, 142, 142', // Đỏ san hô hoa đăng
    image: '/images/heritage/hoian.jpg',
    period: 'Thế kỷ 16 – Thế kỷ 19',
    bestSeason: 'Tháng 2 – Tháng 7 (Nắng ráo, biển êm, đêm rằm 14 âm lịch)',
    overview: 'Thương cảng quốc tế sầm uất bậc nhất Đông Á từ thế kỷ 16 trên "Con đường Tơ lụa Biển", nơi tụ hội giao thương của các thương nhân Nhật Bản, Trung Hoa, Hà Lan, Bồ Đào Nha và Việt Nam.',
    significance: 'UNESCO công nhận năm 1999 là mẫu hình tiêu biểu hiếm có về một cảng thị truyền thống châu Á được bảo tồn nguyên vẹn với hơn 1.000 ngôi nhà gỗ ngói âm dương, các hội quán, nhà thờ tộc và giếng cổ.',
    highlights: [
      {
        title: 'Chùa Cầu (Lai Viễn Kiều)',
        desc: 'Cây cầu ngói độc đáo vắt qua lạch nước do thương nhân Nhật Bản xây dựng từ thế kỷ 17, biểu tượng tâm linh và văn hóa bất diệt của Hội An.'
      },
      {
        title: 'Nhà cổ Tấn Ký, Phùng Hưng & Hội quán',
        desc: 'Kiến trúc vì kèo mắt cửa tinh xảo; Hội quán Phúc Kiến, Triều Châu nguy nga tráng lệ với hương trầm tỏa ngát.'
      },
      {
        title: 'Đêm phố cổ & Hoa đăng sông Hoài',
        desc: 'Hàng ngàn lồng đèn rực rỡ thắp sáng các ngõ phố không tiếng còi xe; hoạt động thả hoa đăng ước nguyện bồng bềnh trên sông Hoài.'
      }
    ],
    experience: {
      mustDo: 'Dạo bộ ngắm phố cổ lúc 6h sáng khi chưa đông khách; chèo thuyền thả hoa đăng trên sông Hoài lúc hoàng hôn; may đo âu phục/áo dài lấy ngay trong ngày.',
      tips: 'Thưởng thức ẩm thực trứ danh: Bánh mì Phượng / Madam Khánh, Cao lầu Bá Lễ, Cơm gà Bà Buội, nước Mót thảo mộc thanh mát.'
    },
    tags: ['Chùa Cầu', 'Đèn lồng', 'Sông Hoài', 'Nhà cổ Tấn Ký', 'Cao lầu']
  },
  {
    id: 'myson',
    name: 'Thánh địa Mỹ Sơn',
    fullName: 'Khu Di tích Thánh địa Mỹ Sơn',
    year: '1999',
    type: 'Di sản Văn hóa Thế giới',
    province: 'Quảng Nam',
    primaryProvince: 'Quảng Nam',
    colorCard: '215, 252, 142', // Gạch nung & rêu phong
    image: '/images/heritage/myson.jpg',
    period: 'Thế kỷ 4 – Thế kỷ 13',
    bestSeason: 'Tháng 1 – Tháng 9 (Nên đi khung giờ 07:30 – 09:30 để đón nắng sớm tuyệt đẹp)',
    overview: 'Thánh đô tôn giáo thiêng liêng nhất của Vương triều Chăm Pa cổ đại, ẩn mình trong thung lũng khép kín bao quanh bởi dãy núi Hòn Quắp (núi Chúa) hùng vĩ.',
    significance: 'UNESCO ghi danh năm 1999 là minh chứng sống động duy nhất còn lại của nền văn minh Chăm Pa rực rỡ, phản ánh sự giao lưu văn hóa sâu sắc giữa Ấn Độ giáo với tín ngưỡng bản địa Đông Nam Á.',
    highlights: [
      {
        title: 'Bí ẩn Kỹ thuật Xây gạch nung Chăm Pa',
        desc: 'Hơn 70 đền tháp xây dựng bằng kỹ thuật mài chắp gạch nung không dùng vữa kết dính lộ thiên, nghìn năm phong rêu mà gạch vẫn đỏ au bền vững.'
      },
      {
        title: 'Điêu khắc Phù điêu Sa thạch tinh xảo',
        desc: 'Các tượng thần Shiva, thần Brahma, vũ nữ Apsara uốn lượn mềm mại và các đài thờ Yoni – Linga biểu trưng cho nguồn sinh sôi vũ trụ.'
      },
      {
        title: 'Cụm tháp trung tâm Group B, C, D',
        desc: 'Khu vực bảo tồn nguyên vẹn nhất với tháp Kalan (đền thờ chính), tháp cổng Gopura và nhà tĩnh tâm Kosagrha mái cong hình thuyền.'
      }
    ],
    experience: {
      mustDo: 'Xem chương trình biểu diễn nghệ thuật múa Chăm Pa và hòa tấu kèn Saranai, trống Paranưng diễn ra hàng ngày ngay chân tháp cổ.',
      tips: 'Khu di tích có xe điện trung chuyển từ cổng vào chân tháp; mang theo nước uống và mũ rộng vành vì thung lũng khá oi bức vào trưa.'
    },
    tags: ['Tháp Chăm Pa', 'Shiva', 'Vũ điệu Apsara', 'Bí ẩn gạch nung', 'Ấn Độ giáo']
  },
  {
    id: 'phongnha',
    name: 'Phong Nha - Kẻ Bàng',
    fullName: 'Vườn Quốc gia Phong Nha - Kẻ Bàng',
    year: '2003, 2015',
    type: 'Di sản Thiên nhiên Thế giới',
    province: 'Quảng Bình',
    primaryProvince: 'Quảng Bình',
    colorCard: '142, 249, 252', // Xanh ngọc bích dòng Son
    image: '/images/heritage/phongnha.jpg',
    period: 'Địa chất Karst cổ hơn 400 triệu năm',
    bestSeason: 'Tháng 4 – Tháng 8 (Mùa khô, nước sông Son xanh ngắt, thám hiểm hang động lý tưởng)',
    overview: '"Vương quốc hang động của thế giới", sở hữu khối Karst cổ nhất châu Á hình thành từ kỷ Than đá hơn 400 triệu năm trước với diện tích vùng lõi hơn 123.000 ha.',
    significance: 'Được UNESCO 2 lần vinh danh toàn cầu: Năm 2003 về tiêu chí Địa chất – Địa mạo và năm 2015 về Đa dạng sinh học và hệ sinh thái rừng nhiệt đới nguyên sinh đặc hữu.',
    highlights: [
      {
        title: 'Sơn Đoòng & Hang Én vĩ đại',
        desc: 'Sơn Đoòng là hang động tự nhiên lớn nhất hành tinh, chứa được cả tòa nhà chọc trời 40 tầng cùng hệ sinh thái rừng nhiệt đới và vi khí hậu độc lập bên trong.'
      },
      {
        title: 'Động Phong Nha & Sông ngầm kỳ vĩ',
        desc: 'Hang nước tiêu biểu dài gần 8km, du khách ngồi thuyền rẽ nước ngắm 7 kỷ lục tự nhiên và thạch nhũ muôn hình vạn trạng.'
      },
      {
        title: 'Động Thiên Đường – Hoàng cung lòng đất',
        desc: 'Hang khô dài nhất châu Á (31,4km) với hệ thống cầu gỗ dẫn lối giữa các khối thạch nhũ lung linh như tiên cảnh trần gian.'
      }
    ],
    experience: {
      mustDo: 'Chèo thuyền kayak trên dòng sông Chày ngọc bích; tắm bùn tự nhiên trong Hang Tối; tham gia tour thám hiểm hang động trekking băng rừng.',
      tips: 'Đến Động Phong Nha nên đi theo nhóm để ghép thuyền tiết kiệm chi phí; với tour Sơn Đoòng cần đăng ký trước từ 6 tháng đến 1 năm.'
    },
    tags: ['Sơn Đoòng', 'Động Thiên Đường', 'Sông Son', 'Hang Tối', 'Thám hiểm']
  },
  {
    id: 'nhanhac',
    name: 'Nhã nhạc Cung đình',
    fullName: 'Nhã nhạc Cung đình Huế',
    year: '2003',
    type: 'Di sản Văn hóa Phi vật thể',
    province: 'Thừa Thiên Huế',
    primaryProvince: 'Thừa Thiên Huế',
    colorCard: '252, 252, 142', // Vàng hoàng gia
    image: '/images/heritage/nhanhac.jpg',
    period: 'Phát triển đỉnh cao thời Nguyễn (1802 – 1945)',
    bestSeason: 'Quanh năm, đặc biệt vào mùa Festival Huế hoặc các buổi diễn tối tại Đại Nội',
    overview: 'Âm nhạc tao nhã và bác học của triều đình phong kiến Việt Nam, biểu hiện chuẩn mực lễ nhạc phương Đông, được sử dụng trong các đại lễ quốc gia, tế tự trời đất tổ tiên và yến ẩm hoàng gia.',
    significance: 'Di sản Văn hóa Phi vật thể đầu tiên của Việt Nam được UNESCO ghi danh (năm 2003), khẳng định vị thế đỉnh cao của nghệ thuật trình diễn cổ điển phương Đông với hệ thống bài bản, nhạc cụ và trang phục chuẩn mực.',
    highlights: [
      {
        title: 'Hệ thống Dàn nhạc Đại nhạc & Tiểu nhạc',
        desc: 'Đại nhạc (kèn bóp, trống chiến, mõ, cồng) hùng tráng trong đại lễ; Tiểu nhạc (đàn tỳ bà, đàn nguyệt, đàn nhị, sáo, tam âm la) thanh thoát tao nhã trong nội cung.'
      },
      {
        title: 'Nhà hát Cổ Duyệt Thị Đường',
        desc: 'Nhà hát hoàng gia cổ nhất Việt Nam (xây dựng năm 1826 dưới thời vua Minh Mạng) nơi bảo tồn và diễn tấu Nhã nhạc nguyên bản.'
      },
      {
        title: 'Kho tàng Khúc nhạc & Điệu múa Cung đình',
        desc: 'Các bài bản kinh điển như Thập thủ liên hoàn, Phú lục dịch, cùng các vũ điệu cung đình Lục cúng hoa đăng, Tứ linh uyển chuyển.'
      }
    ],
    experience: {
      mustDo: 'Mua vé thưởng thức trọn vẹn 45 phút diễn tấu Nhã nhạc tại Nhà hát Duyệt Thị Đường trong lòng Đại Nội Huế.',
      tips: 'Nên kết hợp nghe Nhã nhạc với tham quan các cổ vật nhạc khí hoàng gia trưng bày tại Bảo tàng Cổ vật Cung đình Huế.'
    },
    tags: ['Duyệt Thị Đường', 'Đại nhạc', 'Tiểu nhạc', 'Kèn bóp', 'Cung đình Huế']
  },
  {
    id: 'congchieng',
    name: 'Cồng chiêng Tây Nguyên',
    fullName: 'Không gian Văn hóa Cồng chiêng Tây Nguyên',
    year: '2005',
    type: 'Di sản Văn hóa Phi vật thể',
    province: 'Tây Nguyên (Gia Lai, Kon Tum, Đắk Lắk, Đắk Nông, Lâm Đồng)',
    primaryProvince: 'Gia Lai',
    colorCard: '252, 175, 110', // Lửa thiêng Tây Nguyên
    image: '/images/heritage/congchieng.jpg',
    period: 'Gắn liền với lịch sử ngàn đời các dân tộc bản địa',
    bestSeason: 'Tháng 11 – Tháng 4 (Mùa khô Tây Nguyên, mùa hoa dã quỳ & lễ hội Mừng lúa mới)',
    overview: 'Không gian văn hóa trải rộng khắp 5 tỉnh Tây Nguyên của các cộng đồng dân tộc Ba Na, Gia Rai, Ê Đê, M\\\'Nông, K\\\'Ho, Xơ Đăng... Cồng chiêng là ngôn ngữ tâm linh kết nối con người với thần linh, vũ trụ và tổ tiên.',
    significance: 'Được UNESCO công nhận là Kiệt tác Di sản Truyền khẩu và Phi vật thể của Nhân loại năm 2005. Âm nhạc cồng chiêng biểu thị sức mạnh cộng đồng và sự phong phú tột bậc của hệ thống thang âm phi chuẩn.',
    highlights: [
      {
        title: 'Cồng & Chiêng – Thanh âm Thần linh',
        desc: 'Cồng có núm âm sắc trầm ấm vang xa, Chiêng bằng sắc bén giòn giã; mỗi bộ chiêng từ 3 đến 20 chiếc do các nghệ nhân hòa tấu ăn ý tuyệt đối.'
      },
      {
        title: 'Vòng Xoang bên Ngọn Lửa Thiêng',
        desc: 'Vũ điệu Xoang mềm mại của các thiếu nữ Tây Nguyên di chuyển nhịp nhàng quanh bếp lửa rực sáng giữa sân nhà rông cao vút.'
      },
      {
        title: 'Không gian Lễ hội Truyền thống',
        desc: 'Gắn chặt với lễ hội Đâm trâu, Lễ mừng nhà rông mới, Lễ cúng cơm mới và Lễ bỏ mả (Pơ-thi) mang triết lý nhân sinh quan sâu sắc.'
      }
    ],
    experience: {
      mustDo: 'Tham gia đêm lửa trại uống rượu cần nghe tiếng cồng chiêng tại làng Plei Ku Roh (Gia Lai) hoặc làng Kon Klor (Kon Tum).',
      tips: 'Tôn trọng không gian linh thiêng, không tự ý chạm vào chiêng cổ khi chưa được sự cho phép của già làng.'
    },
    tags: ['Nhà rông', 'Rượu cần', 'Điệu múa Xoang', 'Già làng', 'Đại ngàn']
  },
  {
    id: 'catru',
    name: 'Nghệ thuật Ca Trù',
    fullName: 'Nghệ thuật Ca Trù',
    year: '2009',
    type: 'Di sản Cần bảo vệ khẩn cấp',
    province: 'Bắc Trung Bộ & Bắc Bộ (Hà Tĩnh, Nghệ An, Thanh Hóa, Quảng Bình...)',
    primaryProvince: 'Hà Tĩnh',
    colorCard: '204, 142, 252', // Tím nhung thính phòng
    image: '/images/heritage/catru.jpg',
    period: 'Từ thế kỷ 11 thời nhà Lý đến nay',
    bestSeason: 'Mùa thu – đông hoặc các dịp hội làng tế tổ ca trù (tháng Giêng âm lịch)',
    overview: 'Nghệ thuật diễn xướng thính phòng cổ điển lâu đời và uyên bác nhất của người Việt, kết hợp nhuần nhuyễn giữa thi ca bác học (thể thơ Hát nói) với âm nhạc tinh tế đỉnh cao.',
    significance: 'Được UNESCO ghi danh năm 2009 là Di sản Văn hóa Phi vật thể cần bảo vệ khẩn cấp. Ca trù sở hữu hệ thống nhạc cụ và phương pháp ngắt âm, nhả chữ độc nhất vô nhị không tìm thấy ở bất kỳ nền văn hóa nào khác.',
    highlights: [
      {
        title: 'Bộ Ba Âm Sắc Độc Bản Thế Giới',
        desc: 'Đào nương vừa hát vừa gõ phách trúc lách cách; Kép đàn gảy Đàn Đáy cần dài 3 dây hộp không đáy trầm đục hư ảo; Quan viên đánh Trống Chầu gõ "tom – chát" chấm điểm tinh tế.'
      },
      {
        title: 'Cái nôi Ca trù Cổ Đạm (Hà Tĩnh)',
        desc: 'Vùng đất Cổ Đạm (Nghi Xuân, Hà Tĩnh) bên bờ sông Lam là thánh địa giáo phường ca trù miền Trung cổ kính, quê hương của những dòng họ nghệ nhân trứ danh.'
      },
      {
        title: 'Thể điệu Hát Nói & Thi ca Tao nhã',
        desc: 'Là nơi các đại thi hào như Nguyễn Du, Nguyễn Công Trứ, Cao Bá Quát gửi gắm những vần thơ tài hoa, phóng khoáng bậc nhất lịch sử văn học Việt.'
      }
    ],
    experience: {
      mustDo: 'Về Cổ Đạm (Nghi Xuân, Hà Tĩnh) nghe các nghệ nhân cao niên hát ca trù cổ truyền trong không gian nhà thờ giáo phường.',
      tips: 'Tập trung lắng nghe tiếng gõ cỗ phách và tiếng đàn đáy mộc mạc không qua loa đài khuếch đại điện tử để cảm nhận hết độ tinh tế.'
    },
    tags: ['Đào nương', 'Đàn đáy', 'Phách trúc', 'Trống chầu', 'Cổ Đạm', 'Hát nói']
  },
  {
    id: 'mocban',
    name: 'Mộc bản Triều Nguyễn',
    fullName: 'Mộc bản Triều Nguyễn',
    year: '2009',
    type: 'Di sản Tư liệu Ký ức Thế giới',
    province: 'Thừa Thiên Huế & Lưu trữ Quốc gia IV (Đà Lạt)',
    primaryProvince: 'Thừa Thiên Huế',
    colorCard: '142, 252, 204', // Xanh cổ bản
    image: '/images/heritage/mocban.jpg',
    period: 'Thời Nguyễn (1802 – 1945)',
    bestSeason: 'Quanh năm, trong các hành trình khám phá di sản văn hóa tư liệu',
    overview: 'Kho báu gồm 34.618 tấm mộc bản gỗ quý khắc ngược chữ Hán và chữ Nôm, dùng để in ấn các bộ sách chính sử, địa chí, điển chế, văn thơ của triều đình phong kiến Đại Nam.',
    significance: 'Di sản Ký ức Tư liệu Thế giới đầu tiên của Việt Nam được UNESCO ghi danh (năm 2009). Đây là nguồn sử liệu gốc có giá trị đặc biệt chuẩn xác, khẳng định chủ quyền lãnh thổ quốc gia và minh chứng cho nghệ thuật khắc chữ đỉnh cao.',
    highlights: [
      {
        title: 'Bộ Quốc Sử Khổng Lồ',
        desc: 'Chứa đựng nguyên vẹn các bộ chính sử quốc gia vĩ đại như Đại Nam Thực Lục, Đại Nam Nhất Thống Chí, Khâm Định Việt Sử Thông Giám Cương Mục.'
      },
      {
        title: 'Bằng chứng Thép về Hoàng Sa – Trường Sa',
        desc: 'Nhiều bản khắc mộc bản ghi rõ chỉ dụ của các hoàng đế Gia Long, Minh Mạng cử hải đội Hoàng Sa ra đo đạc thủy trình, cắm mốc và dựng miếu chủ quyền biển đảo.'
      },
      {
        title: 'Kỹ thuật Khắc chữ Ngược trên Gỗ quý',
        desc: 'Được chế tác từ gỗ thị và gỗ nha đam dẻo dai, chữ khắc chân phương sắc sảo như nét rồng bay phượng múa, bền bỉ qua hàng trăm năm phong hóa.'
      }
    ],
    experience: {
      mustDo: 'Tham quan không gian trưng bày mộc bản tại Trung tâm Lưu trữ Quốc gia IV và Bảo tàng Lịch sử Thừa Thiên Huế; trải nghiệm tự tay in dập mộc bản truyền thống trên giấy điệp.',
      tips: 'Đọc kỹ các chú giải phiên âm Hán – Việt cạnh bản khắc để hiểu rõ từng sự kiện lịch sử hào hùng của cha ông.'
    },
    tags: ['Đại Nam thực lục', 'Khắc chữ ngược', 'Chủ quyền Hoàng Sa', 'Gỗ thị', 'Tư liệu thế giới']
  },
  {
    id: 'thanhnhaho',
    name: 'Thành nhà Hồ',
    fullName: 'Thành nhà Hồ (Tây Đô)',
    year: '2011',
    type: 'Di sản Văn hóa Thế giới',
    province: 'Thanh Hóa',
    primaryProvince: 'Thanh Hóa',
    colorCard: '142, 202, 252', // Xanh đá thành lũy
    image: '/images/heritage/thanhnhaho.jpg',
    period: 'Xây dựng năm 1397 (Thời nhà Hồ)',
    bestSeason: 'Tháng 9 – Tháng 4 năm sau (Mát mẻ, dễ chịu, chụp ảnh thành đá dưới ánh nắng vàng)',
    overview: 'Kinh đô đá độc nhất vô nhị của triều Hồ (1400 – 1407), được Hồ Quý Ly cho xây dựng thần tốc chỉ trong vỏn vẹn 3 tháng vào mùa xuân năm Đinh Sửu 1397.',
    significance: 'Được UNESCO vinh danh năm 2011 là kiệt tác kiến trúc quân sự kỳ vĩ bậc nhất Đông Nam Á. Tòa thành đá duy nhất còn tồn tại trên thế giới sử dụng kỹ thuật ghép những khối đá vôi khổng lồ mà không cần chất kết dính vữa.',
    highlights: [
      {
        title: 'Cổng Nam & Vòm Đá Khối Khổng Lồ',
        desc: 'Cổng Nam sừng sững với 3 cửa vòm cuốn kỳ vĩ ghép từ những phiến đá nặng tới 15 – 20 tấn đục đẽo vuông vức, khít khao đến mức lưỡi dao không lách qua nổi.'
      },
      {
        title: 'Bí ẩn Kỹ thuật Xây dựng Thần tốc',
        desc: 'Chỉ trong 3 tháng, hơn 20.000m³ đá và 100.000m³ đất được khai thác, vận chuyển và thi công hoàn thiện kiên cố, một kỳ tích kỹ thuật xây dựng thời trung đại.'
      },
      {
        title: 'Đàn tế Nam Giao Cổ Kính',
        desc: 'Khu đàn tế trời đất rộng hơn 3,5 ha được bảo tồn nguyên vẹn nhất Việt Nam với cấu trúc nhiều tầng bậc thềm đá phong thủy.'
      }
    ],
    experience: {
      mustDo: 'Chụp ảnh góc rộng dưới vòm cổng Nam đá khổng lồ; tham quan nhà trưng bày cổ vật đạn đá, súng thần cơ của quân đội nhà Hồ.',
      tips: 'Nên kết hợp thưởng thức đặc sản xứ Thanh: Bánh lá răng bừa, chè lam Phủ Quảng, nem chua Thanh Hóa.'
    },
    tags: ['Đá nguyên khối', 'Cổng Nam', 'Hồ Quý Ly', 'Tây Đô', 'Đàn tế Nam Giao']
  },
  {
    id: 'baichoi',
    name: 'Dân ca Bài Chòi',
    fullName: 'Nghệ thuật Bài Chòi Trung Bộ',
    year: '2017',
    type: 'Di sản Văn hóa Phi vật thể',
    province: 'Trung Bộ (Quảng Nam, Bình Định, Quảng Ngãi, Phú Yên, Khánh Hòa, Đà Nẵng...)',
    primaryProvince: 'Quảng Nam',
    colorCard: '252, 142, 239', // Hồng đào lễ hội
    image: '/images/heritage/baichoi.jpg',
    period: 'Hình thành từ thời chúa Nguyễn mở cõi phương Nam',
    bestSeason: 'Mùa xuân (Tháng Giêng – Tháng Ba âm lịch) và các buổi tối hàng ngày bên sông Hoài Hội An',
    overview: 'Hình thức sinh hoạt văn hóa dân gian đặc sắc kết hợp âm nhạc dân ca, thơ ca ví von, kịch nghệ diễn xướng ngẫu hứng và trò chơi dân gian tương tác cộng đồng rộn rã ven biển miền Trung.',
    significance: 'Được UNESCO vinh danh là Di sản Văn hóa Phi vật thể đại diện của nhân loại năm 2017. Bài Chòi phản ánh tinh thần lạc quan yêu đời, tính cố kết cộng đồng và tài năng ứng biến xuất khẩu thành thơ của cư dân miền Trung.',
    highlights: [
      {
        title: 'Không gian Chòi Tre Độc Đáo',
        desc: '9 đến 11 chiếc chòi tre mái lá dựng thành hình chữ U quanh chòi trung tâm của Ban tổ chức; người chơi ngồi trên chòi cao đón gió xuân.'
      },
      {
        title: 'Tài Ứng Biến của "Anh Hiệu"',
        desc: 'Anh Hiệu (người chủ trò) vừa rút ống thẻ bài vừa hò những câu thơ dí dỏm, ngẫu hứng, trêu đùa duyên dáng để người chơi hồi hộp đoán tên quân bài.'
      },
      {
        title: 'Bộ Bài 27 Cặp Tên Gọi Dân Gian',
        desc: 'Những cái tên mộc mạc gần gũi: Nhì nghèo, Tam quăng, Tứ cẳng, Bát bồng, Cửu điều... kèm tiếng chiêng trống giòn giã mỗi khi có người "Tới".'
      }
    ],
    experience: {
      mustDo: 'Mua một thẻ bài (chỉ 20.000đ – 30.000đ) ngồi lên chòi tre bên bờ sông Hoài (Hội An) hòa vào tiếng cười rộn rã cùng người dân địa phương.',
      tips: 'Đừng ngại cổ vũ và vỗ tay theo nhịp hò của anh Hiệu; nếu "tới" (thắng) bạn sẽ nhận được một chiếc đèn lồng Hội An xinh xắn làm kỷ niệm.'
    },
    tags: ['Anh Hiệu', 'Hội xuân', 'Chòi tre', 'Hô bài chòi', 'Sông Hoài Hội An']
  }
]

// STATE VÒNG XOAY 3D
const currentAngle = ref(0)
const isAutoRotating = ref(true)
const isHovered = ref(false)
const isDragging = ref(false)

// STATE MODAL THÔNG TIN DI SẢN (CHỈ HIỆN KHI CLICK VÀO THẺ)
const showDetailModal = ref(false)
const activeHeritage = ref(null)
const activeModalTab = ref('overview')

let startX = 0
let lastAngle = 0
let animFrameId = null

function animate() {
  if (isAutoRotating.value && !isHovered.value && !isDragging.value && !showDetailModal.value) {
    currentAngle.value = (currentAngle.value + 0.12) % 360
  }
  animFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  animFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
})

// TƯƠNG TÁC KÉO CHUỘT / CẢM ỨNG
function handlePointerDown(e) {
  isDragging.value = true
  startX = e.clientX
  lastAngle = currentAngle.value
}

function handlePointerMove(e) {
  if (!isDragging.value) return
  const deltaX = e.clientX - startX
  currentAngle.value = lastAngle + deltaX * 0.4
}

function handlePointerUp() {
  isDragging.value = false
}

// KHI CLICK VÀO THẺ: XOAY THẺ ĐÓ RA CHÍNH DIỆN VÀ MỞ BẢNG GIỚI THIỆU DI SẢN
function openHeritageDetail(item, idx) {
  activeHeritage.value = item
  activeModalTab.value = 'overview'
  showDetailModal.value = true

  // Xoay thẻ ra phía trước đối diện người xem
  const targetAngle = -idx * 36
  let delta = (targetAngle - currentAngle.value) % 360
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  currentAngle.value += delta
}

function prevModalHeritage() {
  if (!activeHeritage.value) return
  const currIdx = heritages.findIndex(h => h.id === activeHeritage.value.id)
  const prevIdx = (currIdx - 1 + heritages.length) % heritages.length
  openHeritageDetail(heritages[prevIdx], prevIdx)
}

function nextModalHeritage() {
  if (!activeHeritage.value) return
  const currIdx = heritages.findIndex(h => h.id === activeHeritage.value.id)
  const nextIdx = (currIdx + 1) % heritages.length
  openHeritageDetail(heritages[nextIdx], nextIdx)
}

function rotatePrev() {
  currentAngle.value += 36
}

function rotateNext() {
  currentAngle.value -= 36
}

function toggleAutoRotate() {
  isAutoRotating.value = !isAutoRotating.value
}

function goToProvince(provName) {
  showDetailModal.value = false
  emit('select-destination', provName)
}
</script>

<style scoped>
/* ==================== PHÔNG CHỮ & BỐ CỤC TỔNG THỂ ==================== */
.central-heritage-compact {
  width: 100%;
  max-width: 1200px;
  margin: 10px auto 36px;
  padding: 0 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  color: #1e293b;
  box-sizing: border-box;
}

:root[data-theme="dark"] .central-heritage-compact {
  color: #e2e8f0;
}

/* ==================== 1. HEADER ==================== */
.ch-header {
  text-align: center;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ch-kicker {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--primary, #0284c7);
  text-transform: uppercase;
  background: rgba(2, 132, 199, 0.08);
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(2, 132, 199, 0.25);
}

:root[data-theme="dark"] .ch-kicker {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.35);
}

.ch-title {
  font-size: clamp(1.5rem, 3vw, 1.95rem);
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

:root[data-theme="dark"] .ch-title {
  color: #f8fafc;
}

/* ==================== 2. KHÔNG GIAN 3D THUẦN TÚY (NỀN TRONG SUỐT, CĂN GIỮA) ==================== */
.ch-pure-3d-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
}

/* ==================== 3. 3D CYLINDER WRAPPER & INNER ==================== */
.wrapper {
  width: 100%;
  height: 320px;
  position: relative;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  user-select: none;
  cursor: grab;
  touch-action: pan-y;
  margin: 0 auto;
}

.wrapper:active {
  cursor: grabbing;
}

.inner {
  --w: 112px;
  --h: 160px;
  --translateZ: 210px;
  --rotateX: -12deg;
  --perspective: 1000px;
  position: absolute;
  width: var(--w);
  height: var(--h);
  top: calc(50% - (var(--h) / 2));
  left: calc(50% - (var(--w) / 2));
  z-index: 2;
  transform-style: preserve-3d;
  transition: transform 0.12s linear;
}

/* THANH ĐIỀU KHIỂN CĂN GIỮA BÊN DƯỚI VÒNG XOAY */
.stage-controls-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 14px;
  z-index: 10;
}

.stage-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ctrl-btn {
  background: rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.15);
  color: #1e293b;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  transition: all 0.2s ease;
}

:root[data-theme="dark"] .ctrl-btn {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.ctrl-btn:hover {
  background: var(--primary, #0284c7);
  border-color: var(--primary, #0284c7);
  color: #ffffff;
  transform: scale(1.08);
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.45);
}

.card {
  position: absolute;
  width: var(--w);
  height: var(--h);
  border: 2.5px solid rgba(var(--color-card), 0.9);
  border-radius: 16px;
  overflow: hidden;
  inset: 0;
  transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
    translateZ(var(--translateZ));
  transform-style: preserve-3d;
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.25),
    0 0 18px rgba(var(--color-card), 0.4),
    inset 0 0 14px rgba(var(--color-card), 0.25);
  cursor: pointer;
  background: #0f172a;
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  backface-visibility: visible;
}

.card:hover {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 0 30px rgba(var(--color-card), 0.9),
    0 0 50px rgba(var(--color-card), 0.6);
  border-color: #ffffff;
  transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
    translateZ(calc(var(--translateZ) + 14px)) scale(1.05);
}

.card.active {
  border-color: #ffffff;
  box-shadow:
    0 0 35px rgba(var(--color-card), 1),
    0 0 60px rgba(var(--color-card), 0.8);
  transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
    translateZ(calc(var(--translateZ) + 18px)) scale(1.08);
}

.card-media {
  position: relative;
  width: 100%;
  height: 100%;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-glow-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(15, 23, 42, 0.35) 55%,
    rgba(var(--color-card), 0.15) 100%
  );
  pointer-events: none;
}

.card-unesco-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
  font-size: 8.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.card-caption {
  position: absolute;
  bottom: 8px;
  left: 6px;
  right: 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-prov {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

/* ==================== 4. BẢO TÀNG SỐ MINI: MODAL GIỚI THIỆU DI SẢN ==================== */
.heritage-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.heritage-modal-card {
  position: relative;
  background: #0f172a;
  border: 1.5px solid rgba(var(--color-modal), 0.55);
  border-radius: 24px;
  max-width: 680px;
  width: 100%;
  max-height: 88vh;
  overflow: hidden;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.65),
    0 0 40px rgba(var(--color-modal), 0.25);
  display: flex;
  flex-direction: column;
  color: #ffffff;
  animation: modalScaleUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

:root[data-theme="light"] .heritage-modal-card {
  background: #ffffff;
  color: #0f172a;
  border-color: rgba(var(--color-modal), 0.7);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.25),
    0 0 35px rgba(var(--color-modal), 0.2);
}

@keyframes modalScaleUp {
  from { opacity: 0; transform: scale(0.93) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
  transform: scale(1.1);
}

/* COVER ẢNH THẬT */
.modal-cover-wrap {
  position: relative;
  width: 100%;
  height: 220px;
  flex-shrink: 0;
  overflow: hidden;
  background: #020617;
}

.modal-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 1) 0%,
    rgba(15, 23, 42, 0.6) 45%,
    rgba(15, 23, 42, 0.2) 100%
  );
}

:root[data-theme="light"] .modal-cover-gradient {
  background: linear-gradient(
    to top,
    #ffffff 0%,
    rgba(255, 255, 255, 0.65) 45%,
    rgba(255, 255, 255, 0.2) 100%
  );
}

.modal-cover-top-bar {
  position: absolute;
  top: 14px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

.modal-badge-unesco {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #f59e0b;
  font-size: 10.5px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: 0.5px;
}

.modal-cover-type-tag {
  background: rgba(var(--color-modal), 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--color-modal), 0.5);
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

:root[data-theme="light"] .modal-cover-type-tag {
  background: rgba(255, 255, 255, 0.9);
  color: #0284c7;
  border-color: #bae6fd;
}

/* NÚT LƯỚT ẢNH TRÊN BANNER */
.cover-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 20px;
  font-weight: 400;
  cursor: pointer;
  z-index: 15;
  transition: all 0.2s ease;
}

.cover-nav-btn.prev {
  left: 12px;
}

.cover-nav-btn.next {
  right: 12px;
}

.cover-nav-btn:hover {
  background: var(--primary, #0284c7);
  border-color: var(--primary, #0284c7);
  transform: translateY(-50%) scale(1.12);
}

.modal-cover-caption {
  position: absolute;
  bottom: 12px;
  left: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-cover-period {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(var(--color-modal), 0.95);
}

:root[data-theme="light"] .modal-cover-period {
  color: #0284c7;
}

.modal-cover-title {
  font-size: 1.45rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  line-height: 1.25;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
}

:root[data-theme="light"] .modal-cover-title {
  color: #0f172a;
  text-shadow: none;
}

/* PHẦN NỘI DUNG CUỘN */
.modal-body-scroll {
  padding: 16px 22px 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 4 THẺ CHỈ SỐ NHANH */
.modal-quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:root[data-theme="light"] .quick-chip {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.chip-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

:root[data-theme="light"] .chip-label {
  color: #64748b;
}

.chip-val {
  font-size: 12.5px;
  color: #f1f5f9;
  font-weight: 700;
  line-height: 1.35;
}

:root[data-theme="light"] .chip-val {
  color: #0f172a;
}

/* TAB BAR */
.modal-tabs-bar {
  display: flex;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

:root[data-theme="light"] .modal-tabs-bar {
  border-bottom-color: #e2e8f0;
}

.modal-tab-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root[data-theme="light"] .modal-tab-btn {
  color: #64748b;
}

.modal-tab-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

:root[data-theme="light"] .modal-tab-btn:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.modal-tab-btn.active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}

:root[data-theme="light"] .modal-tab-btn.active {
  color: #0284c7;
  background: #e0f2fe;
}

/* TAB CONTENT */
.tab-pane-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.block-heading {
  font-size: 13px;
  font-weight: 800;
  color: #38bdf8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

:root[data-theme="light"] .block-heading {
  color: #0284c7;
}

.block-text {
  font-size: 13.5px;
  line-height: 1.6;
  color: #cbd5e1;
  margin: 0;
}

:root[data-theme="light"] .block-text {
  color: #334155;
}

.highlight-callout {
  background: rgba(var(--color-modal), 0.08);
  border-left: 3px solid rgba(var(--color-modal), 0.8);
  padding: 10px 14px;
  border-radius: 0 10px 10px 0;
}

:root[data-theme="light"] .highlight-callout {
  background: #f0fdf4;
  border-left-color: #10b981;
}

/* HIGHLIGHTS GRID */
.highlights-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.highlight-card {
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 10px 14px;
  border-radius: 12px;
  align-items: flex-start;
}

:root[data-theme="light"] .highlight-card {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.hl-badge {
  background: rgba(var(--color-modal), 0.2);
  color: rgb(var(--color-modal));
  border: 1px solid rgba(var(--color-modal), 0.5);
  font-size: 11px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: 6px;
  flex-shrink: 0;
}

.hl-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hl-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

:root[data-theme="light"] .hl-title {
  color: #0f172a;
}

.hl-desc {
  font-size: 12.5px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

:root[data-theme="light"] .hl-desc {
  color: #64748b;
}

/* GUIDE CARDS */
.guide-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 12px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:root[data-theme="light"] .guide-card {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-icon {
  font-size: 16px;
}

.guide-header h5 {
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

:root[data-theme="light"] .guide-header h5 {
  color: #0f172a;
}

.guide-text {
  font-size: 13px;
  line-height: 1.55;
  color: #cbd5e1;
  margin: 0;
}

:root[data-theme="light"] .guide-text {
  color: #334155;
}

/* TAGS */
.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.modal-tag-pill {
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  color: #38bdf8;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

:root[data-theme="light"] .modal-tag-pill {
  background: #f0f9ff;
  color: #0284c7;
  border-color: #bae6fd;
}

/* ACTIONS FOOTER */
.modal-actions-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 22px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  gap: 12px;
  flex-wrap: wrap;
}

:root[data-theme="light"] .modal-actions-footer {
  border-top-color: #e2e8f0;
}

.modal-step-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-step-prev,
.btn-step-next {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root[data-theme="light"] .btn-step-prev,
:root[data-theme="light"] .btn-step-next {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.btn-step-prev:hover,
.btn-step-next:hover {
  background: var(--primary, #0284c7);
  border-color: var(--primary, #0284c7);
  color: #ffffff;
}

.step-indicator {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  min-width: 44px;
  text-align: center;
}

.modal-btn-explore {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 800;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);
  transition: all 0.2s ease;
}

.modal-btn-explore:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(2, 132, 199, 0.55);
}

/* TRANSITION MODAL */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ==================== 5. RESPONSIVE BREAKPOINTS ==================== */
@media (max-width: 768px) {
  .wrapper {
    height: 280px;
  }

  .inner {
    --w: 96px;
    --h: 140px;
    --translateZ: 175px;
  }

  .modal-cover-wrap {
    height: 180px;
  }

  .modal-title {
    font-size: 1.35rem;
  }
}

@media (max-width: 480px) {
  .wrapper {
    height: 230px;
  }

  .inner {
    --w: 78px;
    --h: 114px;
    --translateZ: 135px;
  }

  .card-title {
    font-size: 10px;
  }

  .card-prov {
    font-size: 8px;
  }

  .modal-body-content {
    padding: 16px;
  }
}
</style>
