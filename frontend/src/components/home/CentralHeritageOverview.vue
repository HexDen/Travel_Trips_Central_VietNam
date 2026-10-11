<template>
  <div class="central-heritage-compact" v-reveal>
    <!-- 1. TIÊU ĐỀ TỔNG QUAN TỐI GIẢN (KHÔNG DÙNG ICON, PHÔNG SANS-SERIF CHUẨN) -->
    <header class="ch-header">
      <div class="ch-kicker">TỔNG QUAN DI SẢN VÀ BỀ DÀY LỊCH SỬ</div>
      <h2 class="ch-title">Di sản và Dấu ấn Lịch sử Miền Trung</h2>
      <p class="ch-summary">
        Nơi hội tụ các di sản văn hóa thế giới, cố đô ngàn năm, kỳ quan hang động vĩ đại và 1.800km bờ biển tuyệt đẹp.
      </p>

      <!-- DẢI CHỈ SỐ TEXT TINH TẾ -->
      <div class="ch-stat-row">
        <span class="stat-item"><b>5</b> Di sản Thế giới</span>
        <span class="stat-sep">/</span>
        <span class="stat-item"><b>3.000+</b> Năm lịch sử</span>
        <span class="stat-sep">/</span>
        <span class="stat-item"><b>1.800 km</b> Bờ biển</span>
        <span class="stat-sep">/</span>
        <span class="stat-item"><b>11</b> Tỉnh thành liên kết</span>
      </div>
    </header>

    <!-- 2. KHUNG CHIẾU DI SẢN CHUẨN MỰC: TABS FULL-WIDTH TRÊN ĐẦU, DƯỚI LÀ 2 CỘT CÂN ĐỐI -->
    <section class="ch-showcase-card">
      <!-- THANH TABS 5 MỐC THỜI GIAN TRẢI RỘNG 100% KHÔNG BỊ CHÈN CHỮ -->
      <nav class="ch-timeline-strip" aria-label="Các thời kỳ lịch sử">
        <button
          v-for="(era, idx) in eras"
          :key="era.id"
          type="button"
          :class="['ch-era-tab', { active: currentIdx === idx }]"
          @click="selectEra(idx)"
        >
          <span class="tab-period">{{ era.period }}</span>
          <span class="tab-title">{{ era.shortName }}</span>
        </button>
      </nav>

      <!-- PHẦN THÂN 2 CỘT CÂN XỨNG: BÊN TRÁI LÀ NỘI DUNG, BÊN PHẢI LÀ HÌNH ẢNH THẬT -->
      <div class="ch-split-body">
        <!-- CỘT TRÁI: NỘI DUNG LỊCH SỬ SÚC TÍCH -->
        <div class="ch-info-col">
          <div class="ch-era-tag">{{ currentEra.eraLabel }}</div>
          <h3 class="ch-era-name">{{ currentEra.title }}</h3>

          <div class="ch-text-block">
            <p class="ch-sentence-1">{{ currentEra.sentence1 }}</p>
            <p class="ch-sentence-2">{{ currentEra.sentence2 }}</p>
          </div>

          <div class="ch-tags-row">
            <span class="ch-mini-tag" v-for="tag in currentEra.tags" :key="tag">
              {{ tag }}
            </span>
          </div>

          <!-- DÒNG HÀNH ĐỘNG VÀ ĐIỀU HƯỚNG TRƯỚC / SAU -->
          <div class="ch-bottom-actions">
            <button
              type="button"
              class="ch-btn-explore"
              @click="goToProvince(currentEra.primaryProvince)"
            >
              Xem điểm đến tại {{ currentEra.primaryProvince }} →
            </button>

            <div class="ch-step-nav">
              <button
                type="button"
                class="ch-nav-btn"
                @click="prevSlide"
                title="Mốc thời gian trước"
                aria-label="Thời kỳ trước"
              >
                ←
              </button>
              <span class="ch-step-label">{{ currentIdx + 1 }} / {{ eras.length }}</span>
              <button
                type="button"
                class="ch-nav-btn"
                @click="nextSlide"
                title="Mốc thời gian kế tiếp"
                aria-label="Thời kỳ kế tiếp"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: ẢNH THỰC TẾ 100% MIỀN TRUNG VIỆT NAM (SÁNG RÕ, ĐÚNG ĐỊA DANH) -->
        <div class="ch-visual-col">
          <div class="ch-photo-frame" @click="openLightbox">
            <img
              :key="currentEra.id"
              :src="currentEra.image"
              :alt="currentEra.title"
              class="ch-photo-img"
              loading="eager"
            />
            <div class="ch-photo-caption-bar">
              <span class="caption-text">{{ currentEra.imageCaption }}</span>
              <span class="caption-zoom">Phóng to ảnh</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL LIGHTBOX XEM ẢNH FULLSCREEN -->
    <div v-if="lightboxOpen" class="ch-lightbox-backdrop" @click="lightboxOpen = false">
      <div class="ch-lightbox-dialog" @click.stop>
        <button type="button" class="ch-btn-close-lb" @click="lightboxOpen = false">Đóng [✕]</button>
        <img :src="currentEra.image" :alt="currentEra.title" class="ch-lb-img" />
        <div class="ch-lb-footer">
          <strong>{{ currentEra.title }}</strong>
          <span>{{ currentEra.imageCaption }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['select-destination'])

// 5 MỐC THỜI KỲ VỚI ẢNH THỰC TẾ 100% CỦA VIỆT NAM (ĐÚNG ĐỊA DANH MIỀN TRUNG)
const eras = [
  {
    id: 'sa-huynh',
    period: '1 TCN – Thế kỷ 2',
    shortName: 'Văn hóa Sa Huỳnh',
    eraLabel: 'KHỞI NGUYÊN TIỀN SỬ',
    title: 'Văn hóa Sa Huỳnh và Cảng biển Cổ',
    sentence1: 'Hơn 3.000 năm trước, cư dân Sa Huỳnh cổ tại duyên hải miền Trung đã đạt kỹ nghệ luyện kim, đúc đồng và khai phá các tuyến hải trình giao thương đầu tiên trên Biển Đông.',
    sentence2: 'Quần thể mộ chum gốm khổng lồ và dấu tích khảo cổ tại Quảng Ngãi là bằng chứng tiêu biểu cho một nền văn minh biển rực rỡ.',
    tags: ['Di chỉ mộ chum Sa Huỳnh', 'Khởi nguyên thương mại biển'],
    primaryProvince: 'Quảng Ngãi',
    // Ảnh Cổng Tò Vò đảo Lý Sơn - Quảng Ngãi (Đúng 100% vùng đất văn hóa Sa Huỳnh)
    image: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg',
    imageCaption: 'Cổng Tò Vò và bờ biển nham thạch cổ Lý Sơn (Quảng Ngãi)'
  },
  {
    id: 'cham-pa',
    period: 'Thế kỷ 4 – 15',
    shortName: 'Vương triều Chăm Pa',
    eraLabel: 'VƯƠNG QUỐC NGHÌN NĂM',
    title: 'Thánh địa Mỹ Sơn và Tháp Chàm Huyền Bí',
    sentence1: 'Trải qua hơn mười thế kỷ, vương triều Chăm Pa đã tạo dựng nên những đền tháp gạch nung nung kết kỳ diệu không cần vữa liên kết, vươn cao linh thiêng giữa thung lũng núi Chúa.',
    sentence2: 'Thánh địa Mỹ Sơn (UNESCO) và quần thể tháp Po Nagar là đỉnh cao của nghệ thuật điêu khắc phù điêu và kiến trúc tâm linh cổ đại Đông Nam Á.',
    tags: ['Thánh địa Mỹ Sơn (UNESCO)', 'Tháp Bà Po Nagar'],
    primaryProvince: 'Quảng Nam',
    // Ảnh Tháp Bà Po Nagar / Tháp Chàm Chăm Pa Việt Nam (Đúng 100% tháp Chăm Pa)
    image: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg',
    imageCaption: 'Quần thể đền tháp Chăm Pa cổ kính Po Nagar (Khánh Hòa - Quảng Nam)'
  },
  {
    id: 'hoi-an',
    period: 'Thế kỷ 16 – 18',
    shortName: 'Chúa Nguyễn và Hội An',
    eraLabel: 'MỞ CÕI ĐÀNG TRONG',
    title: 'Đô thị Cảng Quốc tế Hội An',
    sentence1: 'Các chúa Nguyễn chọn dải đất miền Trung làm điểm tựa mở cõi phương Nam, đưa Hội An trở thành thương cảng giao thương tấp nập bậc nhất châu Á trên Con đường Tơ lụa Biển.',
    sentence2: 'Đô thị cổ Hội An (UNESCO) ngày nay vẫn vẹn nguyên những dãy nhà gỗ mái ngói âm dương, cầu Nhật Bản và không gian giao thoa văn hóa đa quốc gia.',
    tags: ['Đô thị cổ Hội An (UNESCO)', 'Con đường tơ lụa trên biển'],
    primaryProvince: 'Quảng Nam',
    // Ảnh Phố cổ Hội An lung linh đèn lồng sông Hoài (Đúng 100% Hội An)
    image: 'https://top1quangnam.com/wp-content/uploads/2021/12/hoi-an-15102019-2-1400x788.png',
    imageCaption: 'Phố cổ Hội An lung linh hoa đăng bên dòng sông Hoài (Quảng Nam)'
  },
  {
    id: 'trieu-nguyen',
    period: '1802 – 1945',
    shortName: 'Kinh đô Triều Nguyễn',
    eraLabel: 'CỐ ĐÔ VÀNG SON',
    title: 'Cố đô Huế và Nhã nhạc Cung đình',
    sentence1: 'Triều Nguyễn định đô tại Huế, hoàn chỉnh cương thổ quốc gia liền một dải và xây dựng hệ thống Hoàng thành, lăng tẩm hoàng gia theo luật phong thủy nghiêm cẩn.',
    sentence2: 'Quần thể Cố đô Huế vinh dự sở hữu 5 di sản được UNESCO vinh danh, đại diện cho đỉnh cao văn hiến, mỹ học và nhã nhạc cung đình của dân tộc.',
    tags: ['Đại Nội và Lăng tẩm Huế', 'Nhã nhạc Cung đình (UNESCO)'],
    primaryProvince: 'Thừa Thiên Huế',
    // Ảnh Đại Nội Kinh thành Huế / Ngọ Môn (Đúng 100% Cố đô Huế)
    image: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg',
    imageCaption: 'Kinh thành Đại Nội Huế – Di sản văn hóa thế giới (Thừa Thiên Huế)'
  },
  {
    id: 'hien-dai',
    period: 'Thời kỳ Mới',
    shortName: 'Kỳ quan và Đổi mới',
    eraLabel: 'MIỀN TRUNG HIỆN ĐẠI',
    title: 'Kỳ quan Hang động và Đô thị Biển',
    sentence1: 'Miền Trung hôm nay là biểu tượng du lịch vươn tầm quốc tế với kỳ quan đệ nhất hang động Phong Nha - Sơn Đoòng, Cầu Vàng Bà Nà Hills và các thành phố biển xanh năng động.',
    sentence2: 'Quy hoạch liên kết 11 tỉnh thành mới gắn kết chặt chẽ bảo tồn di sản nghìn năm với hạ tầng hiện đại, đưa miền đất gió lào cát trắng thành điểm hẹn toàn cầu.',
    tags: ['Động Phong Nha - Kẻ Bàng', 'Cầu Vàng Bà Nà Hills'],
    primaryProvince: 'Đà Nẵng',
    // Ảnh Cầu Vàng Bà Nà Hills Đà Nẵng (Đúng 100% Cầu Vàng Đà Nẵng)
    image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg',
    imageCaption: 'Cầu Vàng Bà Nà Hills – Biểu tượng du lịch hiện đại (Đà Nẵng)'
  }
]

const currentIdx = ref(0)
const currentEra = computed(() => eras[currentIdx.value])
const lightboxOpen = ref(false)

function selectEra(idx) {
  currentIdx.value = idx
}

function nextSlide() {
  currentIdx.value = (currentIdx.value + 1) % eras.length
}

function prevSlide() {
  currentIdx.value = (currentIdx.value - 1 + eras.length) % eras.length
}

function goToProvince(provName) {
  emit('select-destination', provName)
}

function openLightbox() {
  lightboxOpen.value = true
}
</script>

<style scoped>
/* ==================== PHÔNG CHỮ SANS-SERIF CHUẨN MỰC ==================== */
.central-heritage-compact {
  width: 100%;
  max-width: 1180px;
  margin: 10px auto 28px;
  padding: 0 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  color: #1e293b;
  box-sizing: border-box;
}

:root[data-theme="dark"] .central-heritage-compact {
  color: #e2e8f0;
}

/* ==================== 1. HEADER TỐI GIẢN ==================== */
.ch-header {
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ch-kicker {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #0284c7;
  text-transform: uppercase;
  background: rgba(2, 132, 199, 0.08);
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid rgba(2, 132, 199, 0.2);
}

:root[data-theme="dark"] .ch-kicker {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
}

.ch-title {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.25;
}

:root[data-theme="dark"] .ch-title {
  color: #f8fafc;
}

.ch-summary {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 0.92rem;
  color: #64748b;
  max-width: 760px;
  line-height: 1.5;
  margin: 0;
}

:root[data-theme="dark"] .ch-summary {
  color: #94a3b8;
}

.ch-stat-row {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.84rem;
  color: #475569;
  margin-top: 4px;
  padding: 6px 16px;
  background: rgba(241, 245, 249, 0.7);
  border-radius: 6px;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

:root[data-theme="dark"] .ch-stat-row {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(51, 65, 85, 0.8);
  color: #cbd5e1;
}

.stat-item b {
  color: #0284c7;
  font-weight: 700;
}

:root[data-theme="dark"] .stat-item b {
  color: #38bdf8;
}

.stat-sep {
  color: #cbd5e1;
}

:root[data-theme="dark"] .stat-sep {
  color: #475569;
}

/* ==================== 2. THẺ CHỨA SHOWCASE ==================== */
.ch-showcase-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:root[data-theme="dark"] .ch-showcase-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* THANH TABS 5 MỐC THỜI GIAN TRẢI RỘNG 100% (FULL-WIDTH) */
.ch-timeline-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  width: 100%;
}

.ch-era-tab {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  text-align: center;
  min-height: 52px;
}

:root[data-theme="dark"] .ch-era-tab {
  background: #0f172a;
  border-color: #334155;
}

.ch-era-tab:hover {
  background: #f0f9ff;
  border-color: #0284c7;
}

:root[data-theme="dark"] .ch-era-tab:hover {
  background: #1e293b;
  border-color: #38bdf8;
}

.ch-era-tab.active {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

:root[data-theme="dark"] .ch-era-tab.active {
  background: #0284c7;
  border-color: #38bdf8;
}

.tab-period {
  font-size: 0.72rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1;
}

.ch-era-tab.active .tab-period {
  color: #e0f2fe;
}

:root[data-theme="dark"] .tab-period {
  color: #94a3b8;
}

.tab-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.ch-era-tab.active .tab-title {
  color: #ffffff;
}

:root[data-theme="dark"] .tab-title {
  color: #f1f5f9;
}

/* PHẦN THÂN 2 CỘT CÂN ĐỐI (50% - 50%) */
.ch-split-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
}

/* CỘT TRÁI: NỘI DUNG */
.ch-info-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding-right: 8px;
}

.ch-era-tag {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #0284c7;
  text-transform: uppercase;
}

:root[data-theme="dark"] .ch-era-tag {
  color: #38bdf8;
}

.ch-era-name {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.35;
}

:root[data-theme="dark"] .ch-era-name {
  color: #f8fafc;
}

.ch-text-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ch-sentence-1 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.55;
  margin: 0;
}

:root[data-theme="dark"] .ch-sentence-1 {
  color: #cbd5e1;
}

.ch-sentence-2 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

:root[data-theme="dark"] .ch-sentence-2 {
  color: #94a3b8;
}

.ch-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ch-mini-tag {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

:root[data-theme="dark"] .ch-mini-tag {
  background: #0f172a;
  color: #94a3b8;
  border-color: #334155;
}

.ch-bottom-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  margin-top: 4px;
}

:root[data-theme="dark"] .ch-bottom-actions {
  border-top-color: #334155;
}

.ch-btn-explore {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  background: #0284c7;
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ch-btn-explore:hover {
  background: #0369a1;
}

.ch-step-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ch-nav-btn {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.15s ease;
}

:root[data-theme="dark"] .ch-nav-btn {
  background: #0f172a;
  border-color: #475569;
  color: #e2e8f0;
}

.ch-nav-btn:hover {
  background: #e2e8f0;
}

:root[data-theme="dark"] .ch-nav-btn:hover {
  background: #334155;
}

.ch-step-label {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
  min-width: 38px;
  text-align: center;
}

:root[data-theme="dark"] .ch-step-label {
  color: #94a3b8;
}

/* CỘT PHẢI: KHUNG ẢNH THẬT RÕ RÀNG */
.ch-visual-col {
  display: flex;
  min-height: 340px;
}

.ch-photo-frame {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 340px;
  border-radius: 10px;
  overflow: hidden;
  background: #0f172a;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.ch-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.ch-photo-frame:hover .ch-photo-img {
  transform: scale(1.02);
}

.ch-photo-caption-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 14px;
  background: linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.88) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
}

.caption-text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 0.82rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.caption-zoom {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* ==================== LIGHTBOX ==================== */
.ch-lightbox-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ch-lightbox-dialog {
  position: relative;
  max-width: 900px;
  width: 100%;
  background: #0f172a;
  border-radius: 10px;
  overflow: hidden;
}

.ch-btn-close-lb {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  z-index: 10;
}

.ch-lb-img {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
  display: block;
}

.ch-lb-footer {
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #ffffff;
  background: #1e293b;
  font-size: 0.86rem;
}

.ch-lb-footer span {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 960px) {
  .ch-timeline-strip {
    grid-template-columns: repeat(3, 1fr);
  }
  .ch-split-body {
    grid-template-columns: 1fr;
  }
  .ch-visual-col {
    min-height: 280px;
  }
  .ch-photo-frame {
    min-height: 280px;
    height: 280px;
  }
}

@media (max-width: 640px) {
  .ch-timeline-strip {
    grid-template-columns: 1fr;
  }
  .ch-bottom-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .ch-step-nav {
    justify-content: center;
  }
}
</style>
