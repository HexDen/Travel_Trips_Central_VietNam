<template>
  <div class="admin-dashboard-layout">
    <!-- SIDEBAR TỐI MÀU THUẦN TÚY -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">🛡️</div>
        <div class="brand-text">
          <h2>TravelAdmin</h2>
          <span>Central Command</span>
        </div>
      </div>

      <nav class="sidebar-menu">
        <button 
          v-for="item in menuItems" 
          :key="item.id"
          :class="['menu-item', { active: currentTab === item.id }]"
          @click="currentTab = item.id"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-profile">
          <div class="avatar">A</div>
          <div class="info">
            <strong>Administrator</strong>
            <span>Super Admin</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN WORKING AREA -->
    <main class="admin-content">
      <!-- HEADER CỦA CONTENT -->
      <header class="content-header">
        <div class="breadcrumb">
          Admin / <span>{{ currentMenuLabel }}</span>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="Thông báo">🔔 <span class="badge">3</span></button>
          <button class="icon-btn" title="Làm mới">🔄</button>
        </div>
      </header>

      <!-- KHUNG LÀM VIỆC CHÍNH (THẺ VÀ BẢNG) -->
      <div class="content-body">
        
        <!-- 1. CRAWLER STAGING & CURATION -->
        <div v-if="currentTab === 'crawler'" class="panel-section fade-in">
          <div class="section-heading">
            <div>
              <h3>Approval Queue</h3>
              <p>Duyệt dữ liệu điểm đến cào về từ Google Maps, Foody...</p>
            </div>
            <div class="heading-actions">
              <button class="primary-btn">Chạy Crawler Mới</button>
            </div>
          </div>

          <div class="filters-row">
            <input type="text" placeholder="Tìm kiếm địa điểm..." class="admin-input search-input" />
            <select class="admin-select">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="missing_gps">Thiếu GPS</option>
              <option value="missing_hours">Thiếu Giờ mở cửa</option>
            </select>
            <label class="toggle-label">
              <input type="checkbox" />
              <span>Chỉ hiện mục có cảnh báo</span>
            </label>
          </div>

          <div class="data-table-card">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Tên địa điểm</th>
                  <th>Phân loại</th>
                  <th>Vị trí</th>
                  <th>Cảnh báo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="place in mockCrawlerData" :key="place.id">
                  <td>
                    <div class="place-name-cell">
                      <strong>{{ place.name }}</strong>
                      <span class="text-sub">{{ place.address }}</span>
                    </div>
                  </td>
                  <td><span class="badge-tag">{{ place.category }}</span></td>
                  <td>
                    <div class="gps-cell" @click="openMapEditor(place)">
                      📍 {{ place.lat.toFixed(4) }}, {{ place.lng.toFixed(4) }}
                    </div>
                  </td>
                  <td>
                    <div class="warning-badges">
                      <span v-if="place.missingHours" class="warn-badge" title="Thiếu giờ mở cửa">🕒</span>
                      <span v-if="place.missingIndoor" class="warn-badge" title="Chưa gắn cờ Indoor/Outdoor">🏠</span>
                      <span v-if="place.unroundedPrice" class="warn-badge" title="Giá tiền lẻ">💰</span>
                    </div>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-sm btn-approve" title="Duyệt">✅</button>
                      <button class="btn-sm btn-edit" title="Sửa" @click="openDrawer(place)">✏️</button>
                      <button class="btn-sm btn-reject" title="Loại bỏ">❌</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. AI PROMPT & SCHEDULING CONFIG -->
        <div v-if="currentTab === 'ai'" class="panel-section fade-in">
          <div class="section-heading">
            <div>
              <h3>AI Prompt Playground</h3>
              <p>Tinh chỉnh "Não bộ" của trợ lý ảo và các quy tắc nghiệp vụ (Business Rules).</p>
            </div>
            <button class="primary-btn">Lưu cấu hình</button>
          </div>

          <div class="grid-layout-2">
            <!-- Cột trái: Edit Prompt -->
            <div class="card-box">
              <h4>System Instruction</h4>
              <textarea class="admin-textarea prompt-editor" v-model="aiPrompt" rows="12"></textarea>
              
              <h4 class="mt-4">Quy tắc nghiệp vụ (Business Rules)</h4>
              <div class="rule-grid mt-3">
                <div class="rule-item">
                  <label>Vận tốc Xe máy (km/h)</label>
                  <input type="number" class="admin-input" value="30" />
                </div>
                <div class="rule-item mt-2">
                  <label>Vận tốc Ô tô (km/h)</label>
                  <input type="number" class="admin-input" value="40" />
                </div>
                <div class="rule-item mt-2">
                  <label>Giá cước Taxi (VNĐ/km)</label>
                  <input type="number" class="admin-input" value="14000" />
                </div>
              </div>
            </div>

            <!-- Cột phải: Test -->
            <div class="card-box test-arena">
              <h4>Test Thử Lịch Trình</h4>
              <div class="test-form">
                <input type="text" class="admin-input mt-2" value="Huế" placeholder="Điểm đến" />
                <input type="text" class="admin-input mt-2" value="3 ngày" placeholder="Thời lượng" />
                <input type="text" class="admin-input mt-2" value="3.000.000" placeholder="Ngân sách" />
                <button class="secondary-btn w-full mt-3">Chạy thử nghiệm (Run Test)</button>
              </div>
              <div class="test-results mt-4 p-3 border rounded">
                <div class="empty-state text-center text-sub">Bấm "Chạy thử nghiệm" để xem AI phân bổ.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. WEATHER & EMERGENCY HUB -->
        <div v-if="currentTab === 'weather'" class="panel-section fade-in">
          <div class="section-heading">
            <div>
              <h3>Weather & Emergency Hub</h3>
              <p>Giám sát thời tiết và kích hoạt kịch bản khẩn cấp.</p>
            </div>
          </div>

          <div class="grid-layout-2">
            <div class="card-box">
              <h4>Radar Thời Tiết Miền Trung</h4>
              <div class="radar-mockup mt-3">
                <div class="radar-scan"></div>
                <div class="storm-blip" style="top: 30%; left: 40%;" title="Dông bão tại Quảng Bình">⚡</div>
                <div class="storm-blip" style="top: 60%; left: 50%;" title="Mưa lớn tại Huế">🌧️</div>
              </div>
            </div>

            <div class="card-box emergency-panel">
              <h4 class="text-danger">Kích Hoạt Khẩn Cấp (Emergency Broadcast)</h4>
              <p class="text-sub mb-4">Loại trừ các địa điểm khỏi thuật toán tạo lịch trình khi có thiên tai.</p>
              
              <div class="emergency-list mt-4">
                <div class="emergency-item active-danger">
                  <div class="e-info">
                    <strong>Bão Trà Mi (Tạm ngưng Biển/Thác)</strong>
                    <span>Khu vực: Đà Nẵng, Quảng Nam</span>
                    <span>Hiệu lực: 48 giờ tới</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" checked />
                    <span class="slider round"></span>
                  </label>
                </div>
                
                <div class="emergency-item">
                  <div class="e-info">
                    <strong>Sạt lở đèo Hải Vân</strong>
                    <span>Khu vực: Đường đèo</span>
                    <span>Hiệu lực: Vô thời hạn</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. TRAVEL INTELLIGENCE -->
        <div v-if="currentTab === 'intelligence'" class="panel-section fade-in">
          <div class="section-heading">
            <div>
              <h3>Travel Intelligence Analytics</h3>
              <p>Phân tích hành vi người dùng và hiệu suất điểm đến.</p>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-title">Tỉnh được lên lịch nhiều nhất</div>
              <div class="stat-value text-gradient">Đà Nẵng</div>
              <div class="stat-trend positive">↑ 12% so với tháng trước</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">Ngân sách phổ biến (2-4 người)</div>
              <div class="stat-value">3.5 - 5 Triệu</div>
              <div class="stat-trend">Phân khúc sinh viên / trẻ</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">Tỷ lệ đổi điểm (Drop-off Rate)</div>
              <div class="stat-value text-danger">18%</div>
              <div class="stat-trend negative">Cao tại danh mục: Bảo tàng</div>
            </div>
          </div>

          <div class="card-box mt-4">
            <h4>Top Địa Điểm Bị Yêu Cầu "Đổi Điểm" 🔄</h4>
            <table class="admin-table mt-2">
              <thead>
                <tr>
                  <th>Tên địa điểm</th>
                  <th>Khu vực</th>
                  <th>Số lần bị swap</th>
                  <th>Hành động đề xuất</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bún Bò O Cương</td>
                  <td>Huế</td>
                  <td class="text-danger font-weight-bold">145 lần</td>
                  <td><button class="btn-sm btn-reject" style="width: auto; padding: 0 10px;">Hạ Priority</button></td>
                </tr>
                <tr>
                  <td>Bảo tàng Chăm</td>
                  <td>Đà Nẵng</td>
                  <td class="text-danger font-weight-bold">98 lần</td>
                  <td><button class="btn-sm btn-reject" style="width: auto; padding: 0 10px;">Hạ Priority</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <!-- DRAWER: QUICK VIEW -->
    <transition name="slide-fade">
      <div v-if="drawerOpen" class="admin-drawer-overlay" @click.self="drawerOpen = false">
        <div class="admin-drawer">
          <div class="drawer-header">
            <h3>Chi tiết địa điểm</h3>
            <button class="icon-btn" @click="drawerOpen = false">✕</button>
          </div>
          <div class="drawer-body" v-if="selectedPlace">
            <img class="drawer-img" :src="selectedPlace.image || 'https://images.unsplash.com/photo-1559564289-4e785501fb3a?auto=format&fit=crop&w=300&q=80'" />
            <h4 class="mt-3">{{ selectedPlace.name }}</h4>
            <p class="text-sub">{{ selectedPlace.address }}</p>
            
            <div class="form-group mt-4">
              <label style="font-weight: 600; display: block; margin-bottom: 8px;">Loại không gian</label>
              <div class="toggle-group">
                <button :class="['toggle-btn', { active: selectedPlace.isIndoor === true }]" @click="selectedPlace.isIndoor = true">🏠 Có mái che</button>
                <button :class="['toggle-btn', { active: selectedPlace.isIndoor === false }]" @click="selectedPlace.isIndoor = false">🌳 Ngoài trời</button>
              </div>
            </div>
            
            <div class="form-group mt-4">
              <label style="font-weight: 600; display: block; margin-bottom: 8px;">Giá tham khảo</label>
              <input type="text" class="admin-input" v-model="selectedPlace.price" />
            </div>

            <button class="primary-btn w-full mt-4" @click="drawerOpen = false">Lưu thay đổi</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentTab = ref('crawler')

const menuItems = [
  { id: 'intelligence', label: 'Travel Intelligence', icon: '📊' },
  { id: 'crawler', label: 'Crawler Queue', icon: '🕷️' },
  { id: 'ai', label: 'AI Prompts & Config', icon: '🧠' },
  { id: 'weather', label: 'Weather Hub', icon: '⛈️' },
  { id: 'settings', label: 'System Settings', icon: '⚙️' }
]

const currentMenuLabel = computed(() => {
  return menuItems.find(m => m.id === currentTab.value)?.label || 'Dashboard'
})

// MOCK DATA CRAWLER
const mockCrawlerData = ref([
  { id: 1, name: 'Quán Chè Hẻm', address: '29 Hùng Vương, Huế', category: 'Ẩm thực', lat: 16.4637, lng: 107.5908, missingHours: true, missingIndoor: true, unroundedPrice: false },
  { id: 2, name: 'Cầu Rồng', address: 'Đà Nẵng', category: 'Tham quan', lat: 16.0614, lng: 108.2272, missingHours: false, missingIndoor: true, unroundedPrice: false },
  { id: 3, name: 'Bánh Mì Phượng', address: 'Hội An, Quảng Nam', category: 'Ẩm thực', lat: 15.8770, lng: 108.3289, missingHours: false, missingIndoor: false, unroundedPrice: true }
])

const aiPrompt = ref('Bạn là trợ lý du lịch AI chuyên nghiệp tại Miền Trung Việt Nam...\n- Ưu tiên các quán ăn bản địa.\n- Không xếp 2 điểm ngoài trời liên tiếp vào buổi trưa.\n- Luôn làm tròn giá tiền.')

const drawerOpen = ref(false)
const selectedPlace = ref(null)

const openDrawer = (place) => {
  selectedPlace.value = { ...place, isIndoor: null, price: place.unroundedPrice ? '35.500' : '40.000' }
  drawerOpen.value = true
}

const openMapEditor = (place) => {
  alert(`Inline Map Editor mở tại tọa độ: ${place.lat}, ${place.lng}`)
}
</script>

<style scoped>
/* TOKENS */
:root {
  --admin-sidebar-bg: #0f172a;
  --admin-sidebar-text: #94a3b8;
  --admin-sidebar-active: #38bdf8;
  --admin-sidebar-active-bg: #1e293b;
  
  --admin-bg: #f8fafc;
  --admin-surface: #ffffff;
  --admin-border: #e2e8f0;
  
  --admin-text: #1e293b;
  --admin-text-sub: #64748b;
  
  --admin-primary: #0ea5e9;
  --admin-primary-hover: #0284c7;
  --admin-danger: #ef4444;
  --admin-danger-bg: #fee2e2;
  
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}

.admin-dashboard-layout {
  display: flex;
  height: calc(100vh - 64px); /* Trừ đi header của App */
  width: 100%;
  background-color: var(--admin-bg, #f8fafc);
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* SIDEBAR TỐI MÀU */
.admin-sidebar {
  width: 260px;
  background-color: var(--admin-sidebar-bg, #0f172a);
  color: var(--admin-sidebar-text, #94a3b8);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.05);
  z-index: 10;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.brand-icon {
  font-size: 28px;
}

.brand-text h2 {
  color: white;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand-text span {
  font-size: 0.75rem;
  color: #38bdf8;
  font-weight: 600;
}

.sidebar-menu {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md, 10px);
  color: var(--admin-sidebar-text, #94a3b8);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(255,255,255,0.03);
  color: white;
}

.menu-item.active {
  background: var(--admin-sidebar-active-bg, #1e293b);
  color: var(--admin-sidebar-active, #38bdf8);
  font-weight: 600;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.admin-profile .info strong {
  display: block;
  color: white;
  font-size: 0.9rem;
}

.admin-profile .info span {
  font-size: 0.75rem;
  color: #64748b;
}

/* MAIN CONTENT */
.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  height: 64px;
  background: var(--admin-surface, #ffffff);
  border-bottom: 1px solid var(--admin-border, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.breadcrumb {
  font-size: 0.9rem;
  color: var(--admin-text-sub, #64748b);
  font-weight: 500;
}

.breadcrumb span {
  color: var(--admin-text, #1e293b);
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f1f5f9;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--admin-danger, #ef4444);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid white;
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  color: var(--admin-text, #1e293b);
}

/* CHUNG CHO CÁC PHẦN */
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-heading h3 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.primary-btn {
  background: var(--admin-primary, #0ea5e9);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: var(--radius-sm, 6px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  background: var(--admin-primary-hover, #0284c7);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
}

.secondary-btn {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 10px 18px;
  border-radius: var(--radius-sm, 6px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.secondary-btn:hover {
  background: #e2e8f0;
}

/* LAYOUT GRIDS */
.grid-layout-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card-box {
  background: var(--admin-surface, #ffffff);
  border: 1px solid var(--admin-border, #e2e8f0);
  border-radius: var(--radius-md, 10px);
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}

.card-box h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 16px; }
.mt-4 { margin-top: 24px; }
.mb-4 { margin-bottom: 24px; }
.w-full { width: 100%; }

/* INPUT & FORMS */
.admin-input, .admin-select, .admin-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm, 6px);
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.admin-input:focus, .admin-select:focus, .admin-textarea:focus {
  outline: none;
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.prompt-editor {
  background: #1e293b;
  color: #e2e8f0;
  border: none;
  border-radius: var(--radius-md, 10px);
  font-family: 'Fira Code', monospace;
  padding: 16px;
  line-height: 1.5;
}

/* DATA TABLE */
.filters-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  max-width: 300px;
}

.data-table-card {
  background: var(--admin-surface, #ffffff);
  border: 1px solid var(--admin-border, #e2e8f0);
  border-radius: var(--radius-md, 10px);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: #f8fafc;
  padding: 14px 20px;
  text-align: left;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.admin-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover {
  background: #f8fafc;
}

.place-name-cell strong {
  display: block;
  color: #0f172a;
  margin-bottom: 4px;
}

.text-sub {
  color: #64748b;
  font-size: 0.85rem;
}

.badge-tag {
  background: #e0f2fe;
  color: #0284c7;
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
}

.gps-cell {
  cursor: pointer;
  color: #0ea5e9;
  font-family: monospace;
  font-size: 0.9rem;
}

.gps-cell:hover {
  text-decoration: underline;
}

.warning-badges {
  display: flex;
  gap: 6px;
}

.warn-badge {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.btn-sm {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-approve { background: #dcfce7; color: #166534; }
.btn-approve:hover { background: #bbf7d0; }
.btn-edit { background: #e0f2fe; color: #075985; }
.btn-edit:hover { background: #bae6fd; }
.btn-reject { background: #fee2e2; color: #991b1b; }
.btn-reject:hover { background: #fecaca; }

/* WEATHER & EMERGENCY */
.radar-mockup {
  height: 300px;
  background: radial-gradient(circle, #0f172a 0%, #1e293b 100%);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border: 2px solid #334155;
}

.radar-scan {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent 70%, rgba(56, 189, 248, 0.4) 100%);
  transform-origin: center;
  animation: scan 4s linear infinite;
  margin-top: -100%;
  margin-left: -100%;
  border-radius: 50%;
}

@keyframes scan {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.storm-blip {
  position: absolute;
  font-size: 24px;
  filter: drop-shadow(0 0 10px red);
  animation: pulse 1.5s infinite alternate;
  z-index: 2;
}

@keyframes pulse {
  from { opacity: 0.4; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.2); }
}

.text-danger { color: #ef4444; }
.font-weight-bold { font-weight: bold; }

.emergency-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.emergency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md, 10px);
  transition: all 0.3s ease;
}

.emergency-item.active-danger {
  border-color: #fca5a5;
  background: #fef2f2;
}

.e-info strong {
  display: block;
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.e-info span {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
}

/* TOGGLE SWITCH */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider { background-color: #ef4444; }
input:checked + .slider:before { transform: translateX(24px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }

/* STATS CARDS */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-card {
  background: var(--admin-surface, #ffffff);
  border: 1px solid var(--admin-border, #e2e8f0);
  border-radius: var(--radius-md, 10px);
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}

.stat-title {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.text-gradient {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-trend {
  font-size: 0.85rem;
}
.stat-trend.positive { color: #10b981; }
.stat-trend.negative { color: #ef4444; }

/* DRAWER & ANIMATIONS */
.fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.admin-drawer-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.admin-drawer {
  width: 400px;
  background: white;
  height: 100%;
  box-shadow: -4px 0 24px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-from .admin-drawer, .slide-fade-leave-to .admin-drawer {
  transform: translateX(100%);
}

.drawer-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 { margin: 0; font-size: 1.25rem; color: #0f172a; }

.drawer-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.drawer-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.toggle-group {
  display: flex;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  background: #f8fafc;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  color: #64748b;
}

.toggle-btn.active {
  background: #e0f2fe;
  color: #0369a1;
  box-shadow: inset 0 0 0 1px #0ea5e9;
  z-index: 1;
}
</style>
