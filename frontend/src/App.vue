<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#top"><span class="brand-mark">✦</span><span>Wanderwise</span></a>
      <div class="account-area">
        <span v-if="nguoiDung" class="welcome">Xin chào, {{ nguoiDung.name }}</span>
        <button v-if="nguoiDung" class="button button-quiet" @click="dangXuat">Đăng xuất</button>
        <button v-else class="button button-quiet" @click="dangKyMode = !dangKyMode">{{ dangKyMode ? 'Đăng nhập' : 'Đăng ký' }}</button>
      </div>
    </header>

    <main id="top" class="page-content">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">TRAVEL, REIMAGINED</p>
          <h1>Mỗi chuyến đi,<br><em>một câu chuyện riêng.</em></h1>
          <p class="hero-text">Nói cho Wanderwise biết bạn muốn đi đâu. AI sẽ ghép những trải nghiệm đáng nhớ thành lịch trình vừa vặn với bạn.</p>
        </div>
        <div class="hero-stamp"><span>AI</span><small>travel<br>planner</small></div>
      </section>

      <section v-if="!nguoiDung && (dangKyMode || authError)" class="auth-panel">
        <div><p class="section-kicker">TÀI KHOẢN</p><h2>{{ dangKyMode ? 'Tạo tài khoản mới' : 'Chào mừng trở lại' }}</h2></div>
        <div class="auth-fields">
          <input v-if="dangKyMode" v-model="authForm.name" placeholder="Tên của bạn" aria-label="Tên" />
          <input v-model="authForm.email" type="email" placeholder="Email" aria-label="Email" />
          <input v-model="authForm.password" type="password" placeholder="Mật khẩu từ 6 ký tự" aria-label="Mật khẩu" @keydown.enter="dangNhap" />
          <button class="button button-coral" @click="dangNhap">{{ dangKyMode ? 'Tạo tài khoản' : 'Đăng nhập' }} <span>→</span></button>
        </div>
        <p v-if="authError" class="form-error">{{ authError }}</p>
      </section>

      <section class="planner-layout">
        <div class="planner-card">
          <div class="section-heading"><div><p class="section-kicker">BƯỚC 01 / 01</p><h2>Lên kế hoạch của bạn</h2></div><span class="heading-icon">✈</span></div>
          <div class="form-grid">
            <label class="field field-wide"><span>Điểm đến</span><input v-model="formDuLieu.diemDen" placeholder="Đà Nẵng, Hội An..." /></label>
            <label class="field"><span>Số ngày</span><input type="number" v-model.number="formDuLieu.soNgay" min="1" /></label>
            <label class="field"><span>Số người</span><input type="number" v-model.number="formDuLieu.soNguoi" min="1" /></label>
            <label class="field"><span>Ngân sách (VND)</span><input type="number" v-model.number="formDuLieu.nganSach" /></label>
            <label class="field"><span>Ngày bắt đầu</span><input type="date" v-model="formDuLieu.ngayBatDau" /></label>
            <label class="field"><span>Ngày kết thúc</span><input type="date" v-model="formDuLieu.ngayKetThuc" /></label>
            <label class="field"><span>Phương tiện</span><select v-model="formDuLieu.phuongTien"><option value="xe máy">Xe máy</option><option value="ô tô">Ô tô</option><option value="máy bay">Máy bay</option><option value="linh hoạt">Linh hoạt</option></select></label>
            <label class="field"><span>Khách sạn</span><input v-model="formDuLieu.yeuCauKhachSan" placeholder="Gần biển, yên tĩnh..." /></label>
            <label class="field field-wide"><span>Sở thích</span><input v-model="chuoiSoThich" placeholder="Ăn uống, biển, check-in" /></label>
          </div>
          <button class="button button-primary plan-button" @click="taoLichTrinh" :disabled="dangTao"><span>{{ dangTao ? 'Đang lên lịch...' : 'Tạo lịch trình' }}</span><strong>↗</strong></button>
        </div>

        <aside class="side-note"><span class="quote-mark">“</span><p>Đi xa không quan trọng bằng đi đúng nơi khiến bạn thấy mình đang sống.</p><span class="note-line"></span><small>WANDERWISE JOURNAL</small></aside>
      </section>

      <section v-if="thoiTiet" class="weather-section"><div class="weather-current"><p class="section-kicker">THỜI TIẾT TẠI {{ thoiTiet.location.name.toUpperCase() }}</p><div class="weather-main"><span class="weather-icon">{{ bieuTuongThoiTiet(thoiTiet.current.weatherCode) }}</span><strong>{{ Math.round(thoiTiet.current.temperature) }}°</strong><div><b>{{ moTaThoiTiet(thoiTiet.current.weatherCode) }}</b><small>Cảm giác như {{ Math.round(thoiTiet.current.feelsLike) }}° · Gió {{ thoiTiet.current.windSpeed }} km/h</small></div></div></div><div class="weather-days"><div v-for="day in thoiTiet.daily" :key="day.date" class="weather-day"><b>{{ dinhDangNgay(day.date) }}</b><span>{{ bieuTuongThoiTiet(day.weatherCode) }}</span><strong>{{ Math.round(day.max) }}° <small>{{ Math.round(day.min) }}°</small></strong><em>☂ {{ day.rainChance }}%</em></div></div></section>

      <section v-if="lichTrinh" class="results-section">
        <div class="result-header"><div><p class="section-kicker">LỊCH TRÌNH ĐỀ XUẤT</p><h2>{{ lichTrinh.destination }} <span>· {{ lichTrinh.daysList.length }} ngày</span></h2></div><div class="budget-total"><small>NGÂN SÁCH DỰ KIẾN</small><strong>{{ dinhDangTien(lichTrinh.total_budget) }}đ</strong></div></div>
        <div class="budget-row" v-if="lichTrinh.budget_breakdown"><span v-for="(value, key) in lichTrinh.budget_breakdown" :key="key"><b>{{ tenNganSach(key) }}</b> {{ dinhDangTien(value) }}đ</span></div>
        <div class="expense-panel"><div class="expense-copy"><p class="section-kicker">THEO DÕI CHI TIÊU</p><h3>{{ dinhDangTien(chiPhiThucTe) }}đ <span>/ {{ dinhDangTien(lichTrinh.total_budget) }}đ</span></h3><div class="progress-track"><span :style="{ width: `${Math.min(100, phanTramChiTieu)}%` }"></span></div><small>{{ phanTramChiTieu }}% ngân sách đã sử dụng</small></div><div class="expense-form"><input v-model.number="chiPhiMoi" type="number" min="0" placeholder="Thêm khoản chi (VND)" @keydown.enter="themChiPhi" /><button class="button button-primary" @click="themChiPhi">+ Thêm</button></div></div>
        <div class="map-panel">
          <div class="map-toolbar"><div><p class="section-kicker">BẢN ĐỒ HÀNH TRÌNH</p><h3>Khám phá từng ngày</h3></div><div class="day-tabs"><button v-for="day in lichTrinh.daysList" :key="day.day" :class="{ active: selectedDay === day.day }" @click="selectedDay = day.day">Ngày {{ day.day }}</button></div></div>
          <iframe class="trip-map" :src="banDoEmbedUrl" title="Bản đồ lịch trình" loading="lazy"></iframe>
        </div>
        <div class="timeline">
          <article v-for="day in lichTrinh.daysList" :key="day.day" class="day-card"><div class="day-number">{{ String(day.day).padStart(2, '0') }}</div><div class="day-content"><h3>Ngày {{ day.day }}</h3><div v-for="act in day.activities" :key="act.time + act.place" class="activity"><time>{{ act.time }}</time><div><strong>{{ act.place }}</strong><p>{{ act.activity }}</p></div><span v-if="act.estimated_cost" class="activity-cost">{{ dinhDangTien(act.estimated_cost) }}đ</span></div></div></article>
        </div>
        <div class="result-actions"><button class="button button-coral" @click="chiaSeLichTrinh" :disabled="!nguoiDung">Chia sẻ lịch trình <span>↗</span></button><button class="button button-quiet" @click="xuatPdf">Xuất PDF ↓</button><a class="text-link" :href="banDoUrl" target="_blank" rel="noreferrer">Mở trên Google Maps ↗</a><a v-if="shareUrl" class="share-link" :href="shareUrl" target="_blank">Link chia sẻ</a></div>
      </section>

      <section class="discovery-section"><div class="section-heading"><div><p class="section-kicker">KHÁM PHÁ XUNG QUANH</p><h2>Địa điểm dành cho bạn</h2></div><span class="heading-icon">⌖</span></div><div class="search-row"><input v-model="placeQuery" placeholder="Tìm nhà hàng, cafe, biển..." @keydown.enter="timDiaDiem" /><button class="button button-primary" @click="timDiaDiem">Tìm kiếm <span>→</span></button></div><div v-if="places.length" class="place-grid"><article v-for="place in places" :key="place._id || place.name" class="place-card"><div class="place-top"><span class="place-type">{{ place.type }}</span><span class="rating">★ {{ place.rating || '—' }}</span></div><h3>{{ place.name }}</h3><p>{{ place.description }}</p><div class="place-footer"><a :href="googleMapsUrl(place.name, place.destination)" target="_blank" rel="noreferrer">Xem bản đồ ↗</a><button v-if="place._id && nguoiDung" class="heart-button" @click="doiYeuThich(place._id)" aria-label="Thêm vào yêu thích">♡</button></div></article></div><p v-else class="empty-state">Chưa có địa điểm phù hợp. Hãy thử tìm một thành phố khác.</p></section>
      <section class="community-section"><div class="section-heading"><div><p class="section-kicker">CỘNG ĐỒNG WANDERWISE</p><h2>Đi đâu đó cùng nhau</h2></div><span class="heading-icon">✦</span></div><div v-if="publicTrips.length" class="community-grid"><article v-for="trip in publicTrips" :key="trip._id" class="community-card"><span class="place-type">{{ trip.destination }}</span><h3>{{ trip.days?.length || 0 }} ngày đáng nhớ</h3><p>{{ (trip.interests || []).slice(0, 3).join(' · ') || 'Khám phá địa phương' }}</p><div><strong>{{ dinhDangTien(trip.total_budget) }}đ</strong><small>{{ trip.people || 1 }} người</small></div></article></div><p v-else class="empty-state">Chưa có lịch trình công khai. Hãy là người đầu tiên chia sẻ chuyến đi.</p></section>

      <section v-if="lichTrinh" class="tools-grid"><div class="tool-card"><p class="section-kicker">ĐIỀU CHỈNH</p><h3>Lịch trình chưa hoàn hảo?</h3><p>Hãy nói với AI điều bạn muốn thay đổi.</p><div class="tool-input"><input v-model="yeuCauDieuChinh" placeholder="Ví dụ: ngày mai mưa..." @keydown.enter.prevent="dieuChinhLichTrinh" /><button class="button button-primary" @click="dieuChinhLichTrinh" :disabled="dangDieuChinh">{{ dangDieuChinh ? '...' : 'Gửi' }}</button></div></div><div class="tool-card chat-card"><p class="section-kicker">TRỢ LÝ AI</p><h3>Hỏi bất cứ điều gì</h3><div class="chat-messages"><p v-if="!nhanTin.length" class="muted">AI đã sẵn sàng đồng hành cùng bạn.</p><div v-for="m in nhanTin" :key="m.id" :class="['message', m.role]"><strong>{{ m.role === 'user' ? 'Bạn' : 'AI' }}</strong><span>{{ m.text }}</span></div></div><div class="tool-input"><input v-model="chatText" placeholder="Nhắn cho AI..." @keydown.enter.prevent="sendChat" /><button class="button button-primary" @click="sendChat">→</button></div></div></section>
    </main>
    <footer><span>WANDERWISE</span><span>Đi để nhớ. Trở về để kể.</span></footer>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { onMounted } from 'vue'
import api from './services/api'

const formDuLieu = reactive({
  diemDen: 'Đà Nẵng',
  soNgay: 3,
  nganSach: 3000000,
  soNguoi: 2,
  soThich: [],
  ngayBatDau: '',
  ngayKetThuc: '',
  phuongTien: 'linh hoạt',
  yeuCauKhachSan: ''
})

const chuoiSoThich = ref('ăn uống, biển, check-in')
const dangTao = ref(false)
const lichTrinh = ref(null)
const nhanTin = ref([])
const chatText = ref('')
const yeuCauDieuChinh = ref('')
const dangDieuChinh = ref(false)
const nguoiDung = ref(null)
const dangKyMode = ref(false)
const authForm = reactive({ name: '', email: '', password: '' })
const authError = ref('')
const shareUrl = ref('')
const placeQuery = ref('')
const places = ref([])
const selectedDay = ref(1)
const thoiTiet = ref(null)
const chiPhiThucTe = ref(0)
const chiPhiMoi = ref(null)
const publicTrips = ref([])

function dinhDangTien(v){
  if(!v && v !== 0) return ''
  return new Intl.NumberFormat('vi-VN').format(v)
}

function tenNganSach(key){
  return {
    hotel: 'Khách sạn',
    food: 'Ăn uống',
    transportation: 'Di chuyển',
    tickets: 'Vé tham quan',
    reserve: 'Dự phòng'
  }[key] || key
}

const banDoUrl = computed(() => googleMapsUrl(lichTrinh.value?.destination || formDuLieu.diemDen))
const banDoEmbedUrl = computed(() => {
  const trip = lichTrinh.value
  const day = trip?.daysList?.find(item => item.day === selectedDay.value) || trip?.daysList?.[0]
  const stops = day?.activities?.map(activity => activity.place).filter(Boolean).slice(0, 5) || []
  const query = [trip?.destination || formDuLieu.diemDen, ...stops].join(', ')
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
})
const phanTramChiTieu = computed(() => {
  const total = Number(lichTrinh.value?.total_budget) || 0
  return total ? Math.round((chiPhiThucTe.value / total) * 100) : 0
})

function googleMapsUrl(place, destination = ''){
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}${destination ? `, ${destination}` : ''}`)}`
}

function dinhDangNgay(date){
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
}

function bieuTuongThoiTiet(code){
  if(code === 0) return '☀'
  if(code <= 3) return '⛅'
  if(code <= 48) return '〰'
  if(code <= 67 || code <= 82) return '☂'
  return '⚡'
}

function moTaThoiTiet(code){
  if(code === 0) return 'Trời quang'
  if(code <= 3) return 'Có mây nhẹ'
  if(code <= 48) return 'Sương mù'
  if(code <= 67 || code <= 82) return 'Có mưa'
  return 'Dông'
}

function themChiPhi(){
  const amount = Number(chiPhiMoi.value)
  if(!amount || amount < 0) return
  chiPhiThucTe.value += amount
  chiPhiMoi.value = null
}

function xuatPdf(){
  window.print()
}

async function layThoiTiet(){
  try{
    thoiTiet.value = (await api.get('/weather', { params: { destination: formDuLieu.diemDen } })).data
  }catch(err){
    thoiTiet.value = null
  }
}

async function dangNhap(){
  authError.value = ''
  try{
    const endpoint = dangKyMode.value ? '/auth/register' : '/auth/login'
    const payload = dangKyMode.value ? authForm : { email: authForm.email, password: authForm.password }
    const res = await api.post(endpoint, payload)
    localStorage.setItem('travel_token', res.data.token)
    nguoiDung.value = res.data.user
  }catch(e){ authError.value = e?.response?.data?.error || e.message }
}

function dangXuat(){
  localStorage.removeItem('travel_token')
  nguoiDung.value = null
}

async function chiaSeLichTrinh(){
  if(!nguoiDung.value) return
  try{
    const res = await api.post(`/social/trips/${lichTrinh.value.tripId}/share`)
    shareUrl.value = `${window.location.origin}${res.data.url}`
  }catch(e){ alert('Không thể chia sẻ: ' + (e?.response?.data?.error || e.message)) }
}

async function timDiaDiem(){
  const res = await api.get('/places', { params: { destination: formDuLieu.diemDen, q: placeQuery.value } })
  places.value = res.data
}

async function doiYeuThich(placeId){
  await api.post(`/social/favorites/${placeId}`)
}

async function taoLichTrinh(){
  formDuLieu.soThich = chuoiSoThich.value.split(',').map(s=>s.trim()).filter(Boolean)
  dangTao.value = true
  lichTrinh.value = null
  try{
    const res = await api.post('/ai/plan', {
      destination: formDuLieu.diemDen,
      days: formDuLieu.soNgay,
      budget: formDuLieu.nganSach,
      people: formDuLieu.soNguoi,
      interests: formDuLieu.soThich,
      start_date: formDuLieu.ngayBatDau,
      end_date: formDuLieu.ngayKetThuc,
      transportation: formDuLieu.phuongTien,
      hotel_request: formDuLieu.yeuCauKhachSan
    })
    lichTrinh.value = res.data
    if(lichTrinh.value && lichTrinh.value.days) lichTrinh.value.daysList = lichTrinh.value.days
    selectedDay.value = 1
    chiPhiThucTe.value = 0
    chiPhiMoi.value = null
    layThoiTiet()
    // reset chat
    nhanTin.value = []
    chatText.value = ''
  }catch(e){
    alert('Lỗi khi gọi API: ' + (e?.response?.data?.error || e.message))
  }finally{
    dangTao.value = false
  }
}

async function dieuChinhLichTrinh(){
  const instruction = yeuCauDieuChinh.value.trim()
  if(!instruction || dangDieuChinh.value || !lichTrinh.value?.tripId) return
  dangDieuChinh.value = true
  try{
    const res = await api.post('/ai/replan', { tripId: lichTrinh.value.tripId, instruction })
    lichTrinh.value.days = res.data.days
    lichTrinh.value.daysList = res.data.days
    yeuCauDieuChinh.value = ''
  }catch(e){
    alert('Lỗi khi điều chỉnh: ' + (e?.response?.data?.error || e.message))
  }finally{
    dangDieuChinh.value = false
  }
}

async function sendChat(){
  if(!lichTrinh.value || !lichTrinh.value.tripId) return alert('Vui lòng tạo lịch trình trước')
  const text = chatText.value.trim()
  if(!text) return
  // add user message locally
  nhanTin.value.push({ id: Date.now() + '-u', role: 'user', text })
  chatText.value = ''
  try{
    const res = await api.post('/ai/chat', { tripId: lichTrinh.value.tripId, message: text })
    nhanTin.value.push({ id: Date.now() + '-a', role: 'assistant', text: res.data.reply })
  }catch(e){
    nhanTin.value.push({ id: Date.now() + '-a', role: 'assistant', text: 'Lỗi khi gửi chat: ' + (e?.response?.data?.error || e.message) })
  }
}

onMounted(async () => {
  if(localStorage.getItem('travel_token')){
    try{ nguoiDung.value = (await api.get('/auth/me')).data }catch(err){ dangXuat() }
  }
  timDiaDiem()
  layThoiTiet()
  try{ publicTrips.value = (await api.get('/social/public-trips')).data }catch(err){ publicTrips.value = [] }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
:root{--ink:#172b2b;--muted:#6c7c7b;--paper:#f5f1e9;--white:#fffdf8;--teal:#0d6b68;--coral:#e46b4d;--line:#dfe3da;--shadow:0 18px 45px rgba(29,58,55,.09)}
*{box-sizing:border-box} body{margin:0;background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif} button,input,select{font:inherit} button{cursor:pointer} button:disabled{cursor:not-allowed;opacity:.55} a{color:inherit}
.app-shell{min-height:100vh;background:radial-gradient(circle at 85% 4%,#f8d8b9 0,transparent 24%),var(--paper)}.topbar{max-width:1180px;margin:auto;padding:24px 32px;display:flex;justify-content:space-between;align-items:center}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:700;letter-spacing:.08em}.brand-mark{display:grid;place-items:center;width:29px;height:29px;border-radius:50%;background:var(--coral);color:#fff}.account-area{display:flex;align-items:center;gap:14px}.welcome{color:var(--muted);font-size:14px}.page-content{max-width:1180px;margin:auto;padding:32px}.hero{display:flex;align-items:end;justify-content:space-between;padding:66px 58px 58px;background:var(--teal);color:#fff;border-radius:3px;overflow:hidden;position:relative}.hero:after{content:'';position:absolute;width:390px;height:390px;border:1px solid rgba(255,255,255,.2);border-radius:50%;right:-90px;top:-130px}.eyebrow,.section-kicker{font-size:11px;letter-spacing:.18em;font-weight:700;margin:0 0 16px;color:var(--coral)}.hero .eyebrow{color:#f7c8a3}.hero h1{font:700 clamp(42px,6vw,77px)/.98 'Playfair Display',serif;margin:0;letter-spacing:0}.hero h1 em{color:#f6c29b;font-weight:600}.hero-text{max-width:470px;color:#cce0da;line-height:1.7;margin:25px 0 0}.hero-stamp{width:108px;height:108px;border:1px solid rgba(255,255,255,.45);border-radius:50%;display:grid;place-content:center;text-align:center;transform:rotate(9deg);z-index:1}.hero-stamp span{font:bold 27px 'Playfair Display';color:#f6c29b}.hero-stamp small{font-size:10px;line-height:1.2;letter-spacing:.14em}.planner-layout{display:grid;grid-template-columns:1fr 275px;gap:26px;margin-top:28px}.planner-card,.auth-panel,.results-section,.discovery-section,.tool-card{background:var(--white);box-shadow:var(--shadow);padding:30px}.section-heading,.result-header{display:flex;justify-content:space-between;align-items:start}.section-heading h2,.result-header h2{font:600 30px 'Playfair Display',serif;margin:0}.section-heading h2 span,.result-header h2 span{font:400 18px 'DM Sans';color:var(--muted)}.heading-icon{color:var(--coral);font-size:28px}.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px 16px;margin-top:30px}.field{display:grid;gap:8px;font-size:12px;font-weight:700;color:var(--muted)}.field-wide{grid-column:span 2}.field input,.field select,.auth-fields input,.search-row input,.tool-input input{width:100%;border:0;border-bottom:1px solid var(--line);background:transparent;padding:11px 2px;color:var(--ink);outline:none}.field input:focus,.field select:focus,.auth-fields input:focus,.search-row input:focus,.tool-input input:focus{border-color:var(--coral)}
.button{border:0;padding:12px 18px;border-radius:2px;display:inline-flex;align-items:center;justify-content:center;gap:14px;font-weight:700;transition:transform .2s,background .2s}.button:hover:not(:disabled){transform:translateY(-2px)}.button-primary{background:var(--teal);color:#fff}.button-coral{background:var(--coral);color:#fff}.button-quiet{background:transparent;color:var(--ink);border:1px solid var(--line);padding:9px 14px}.plan-button{margin-top:28px;min-width:190px}.plan-button strong{font-size:20px}.side-note{padding:34px 20px;border-top:3px solid var(--coral);align-self:start}.quote-mark{font:700 60px/.5 'Playfair Display';color:var(--coral)}.side-note p{font:600 23px/1.3 'Playfair Display';margin:17px 0 25px}.note-line{display:block;width:42px;border-top:2px solid var(--coral);margin-bottom:13px}.side-note small{font-size:10px;letter-spacing:.14em;color:var(--muted)}
.auth-panel{margin-top:18px;display:grid;grid-template-columns:220px 1fr;gap:22px;position:relative}.auth-panel h2{font:600 22px 'Playfair Display';margin:0}.auth-fields{display:flex;gap:14px;align-items:end}.auth-fields input{min-width:0}.form-error{grid-column:2;color:#b64035;font-size:13px;margin:0}.results-section,.discovery-section{margin-top:28px}.budget-total{text-align:right}.budget-total small{display:block;color:var(--muted);font-size:10px;letter-spacing:.12em}.budget-total strong{display:block;color:var(--coral);font-size:24px;margin-top:5px}.budget-row{display:flex;gap:22px;flex-wrap:wrap;border-block:1px solid var(--line);padding:15px 0;margin-top:25px;color:var(--muted);font-size:12px}.budget-row b{color:var(--ink);margin-right:5px}.timeline{margin-top:25px}.day-card{display:grid;grid-template-columns:60px 1fr;gap:20px;padding:23px 0;border-bottom:1px solid var(--line)}.day-number{font:700 26px 'Playfair Display';color:var(--coral)}.day-content h3{margin:0 0 14px;font-size:16px}.activity{display:grid;grid-template-columns:65px 1fr auto;gap:13px;padding:9px 0}.activity time{color:var(--teal);font-weight:700;font-size:13px}.activity strong{font-size:14px}.activity p{margin:4px 0 0;color:var(--muted);font-size:13px}.activity-cost{font-size:12px;color:var(--muted)}.result-actions{display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin-top:25px}.text-link,.share-link{font-size:13px;text-decoration:none;border-bottom:1px solid var(--coral);padding-bottom:3px}.share-link{color:var(--teal)}
.search-row{display:flex;gap:22px;margin:25px 0}.search-row input{flex:1}.place-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.place-card{border:1px solid var(--line);padding:18px;min-height:190px;display:flex;flex-direction:column}.place-top,.place-footer{display:flex;justify-content:space-between;align-items:center}.place-type{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--coral)}.rating{font-size:12px;color:#bd7b28}.place-card h3{font:600 20px 'Playfair Display';margin:20px 0 8px}.place-card p{font-size:13px;color:var(--muted);line-height:1.5;margin:0 0 20px}.place-footer{margin-top:auto}.place-footer a{font-size:12px;color:var(--teal);text-decoration:none}.heart-button{border:0;background:transparent;color:var(--coral);font-size:23px}.empty-state,.muted{color:var(--muted);font-size:14px}.tools-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:28px}.tool-card{box-shadow:none;border:1px solid var(--line)}.tool-card h3{font:600 24px 'Playfair Display';margin:0 0 8px}.tool-card>p:not(.section-kicker){color:var(--muted);font-size:13px}.tool-input{display:flex;gap:12px;margin-top:22px}.chat-messages{height:100px;overflow:auto;background:#f5f3ed;padding:10px;margin-top:17px}.message{display:flex;gap:8px;font-size:13px;margin-bottom:8px}.message strong{color:var(--coral)}footer{max-width:1180px;margin:auto;padding:45px 32px 30px;display:flex;justify-content:space-between;color:var(--muted);font-size:11px;letter-spacing:.1em}footer span:last-child{letter-spacing:0}
 .weather-section{display:grid;grid-template-columns:1.2fr 2fr;align-items:stretch;margin-top:28px;background:#e7eee8}.weather-current{padding:25px 28px;background:var(--teal);color:#fff}.weather-current .section-kicker{color:#b6d8ca}.weather-main{display:flex;align-items:center;gap:13px}.weather-icon{font-size:37px;color:#f5c18e}.weather-main>strong{font:600 50px 'Playfair Display'}.weather-main b{display:block;font-size:14px}.weather-main small{display:block;color:#c9ded5;font-size:11px;margin-top:4px}.weather-days{display:grid;grid-template-columns:repeat(5,1fr);padding:22px 20px;gap:9px}.weather-day{display:flex;flex-direction:column;justify-content:center;gap:7px;text-align:center;border-left:1px solid rgba(23,43,43,.12);font-size:11px}.weather-day b{color:var(--muted);font-size:10px;text-transform:uppercase}.weather-day>span{font-size:22px;color:var(--coral)}.weather-day strong{font-size:13px}.weather-day strong small{font-weight:400;color:var(--muted)}.weather-day em{font-style:normal;color:var(--teal);font-size:10px}.map-panel{margin-top:25px;border:1px solid var(--line);background:#f4f1e9;padding:18px}.map-toolbar{display:flex;justify-content:space-between;align-items:start;gap:16px}.map-toolbar h3{font:600 22px 'Playfair Display';margin:0}.day-tabs{display:flex;gap:6px;flex-wrap:wrap}.day-tabs button{border:1px solid var(--line);background:var(--white);color:var(--muted);padding:8px 11px;font-size:11px}.day-tabs button.active{background:var(--teal);border-color:var(--teal);color:#fff}.trip-map{display:block;width:100%;height:310px;border:0;margin-top:17px;filter:saturate(.8)}
 .expense-panel{display:flex;justify-content:space-between;align-items:end;gap:25px;background:#f4f1e9;padding:19px 20px;margin-top:20px}.expense-copy{min-width:220px}.expense-copy .section-kicker{margin-bottom:8px}.expense-copy h3{font:600 25px 'Playfair Display';margin:0}.expense-copy h3 span{font:400 14px 'DM Sans';color:var(--muted)}.expense-copy small{color:var(--muted);font-size:11px}.progress-track{height:5px;background:#dddcd2;margin:12px 0 7px;overflow:hidden}.progress-track span{display:block;height:100%;background:var(--coral);transition:width .3s}.expense-form{display:flex;gap:10px;min-width:290px}.expense-form input{width:180px;border:0;border-bottom:1px solid var(--line);background:transparent;padding:10px 2px;outline:none}.community-section{margin-top:28px;padding:30px;background:var(--teal);color:#fff}.community-section .section-kicker{color:#b6d8ca}.community-section .heading-icon{color:#f6c29b}.community-section h2{color:#fff}.community-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:25px}.community-card{background:#185f5c;padding:20px;min-height:165px}.community-card h3{font:600 21px 'Playfair Display';margin:18px 0 8px}.community-card p{color:#c9ded5;font-size:12px;min-height:30px}.community-card div{display:flex;justify-content:space-between;align-items:end;margin-top:22px}.community-card strong{color:#f6c29b;font-size:14px}.community-card small{color:#c9ded5;font-size:11px}.community-section .empty-state{color:#c9ded5}
@media(max-width:800px){.topbar{padding:18px 20px}.page-content{padding:18px 20px}.hero{padding:43px 28px;display:block}.hero-stamp{margin-top:30px}.planner-layout,.tools-grid{grid-template-columns:1fr}.side-note{display:none}.planner-card,.auth-panel,.results-section,.discovery-section,.tool-card{padding:22px}.auth-panel{display:block}.auth-fields{margin-top:20px;display:grid;grid-template-columns:1fr 1fr}.auth-fields input:first-child{grid-column:span 2}.auth-fields .button{grid-column:span 2}.place-grid,.community-grid{grid-template-columns:repeat(2,1fr)}.weather-section{grid-template-columns:1fr}.weather-days{padding:15px 8px}.expense-panel{display:block}.expense-form{min-width:0;margin-top:17px}.expense-form input{flex:1;width:auto}.map-toolbar{display:block}.day-tabs{margin-top:15px}footer{padding-inline:20px}}
@media(max-width:500px){.account-area .welcome{display:none}.hero h1{font-size:43px}.form-grid{grid-template-columns:1fr;gap:17px}.field-wide{grid-column:auto}.section-heading h2,.result-header h2{font-size:25px}.result-header{display:block}.budget-total{text-align:left;margin-top:16px}.activity{grid-template-columns:52px 1fr}.activity-cost{grid-column:2}.search-row{display:grid;gap:12px}.place-grid{grid-template-columns:1fr}.result-actions{gap:14px}.activity p{line-height:1.4}footer{display:block;line-height:2.2}}
@media(max-width:500px){.account-area .welcome{display:none}.hero h1{font-size:43px}.form-grid{grid-template-columns:1fr;gap:17px}.field-wide{grid-column:auto}.section-heading h2,.result-header h2{font-size:25px}.result-header{display:block}.budget-total{text-align:left;margin-top:16px}.activity{grid-template-columns:52px 1fr}.activity-cost{grid-column:2}.search-row{display:grid;gap:12px}.place-grid,.community-grid{grid-template-columns:1fr}.result-actions{gap:14px}.activity p{line-height:1.4}footer{display:block;line-height:2.2}}
@media print{.topbar,.hero,.planner-layout,.weather-section,.discovery-section,.community-section,.tools-grid,footer,.result-actions,.map-panel,.expense-form{display:none!important}.app-shell,.page-content,.results-section{background:#fff;box-shadow:none;padding:0;margin:0}.results-section{display:block!important}.budget-row{border-color:#ccc}}
</style>
