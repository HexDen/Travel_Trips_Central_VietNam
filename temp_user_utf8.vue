<template>
  <div class="app-root" :class="{ 'app-intro-zoom': showIntroSplash && !introSplitting }">
    <div class="app-container">
      
      <!-- TOP HEADER Cß╗ªA APP (─É├â T├üCH COMPONENT) -->
      <AppHeader
        :activeTab="activeTab"
        :nguoiDung="nguoiDung"
        :isDark="isDark"
        @update:activeTab="handleTabChange"
        @openAuth="hienAuthModal = true"
        @toggleDark="toggleDark"
      />

      <!-- FLOATING PERSONALITY TOAST (KHI AI Tß║áO XONG Lß╗èCH TR├îNH HOß║╢C TH├öNG B├üO QUAN TRß╗îNG) -->
      <transition name="toast-slide">
        <div v-if="personalityToast" class="personality-floating-toast" @click="personalityToast = null">
          <div class="pft-icon">{{ personalityToast.icon }}</div>
          <div class="pft-body">
            <strong>{{ personalityToast.title }}</strong>
            <p>{{ personalityToast.desc }}</p>
          </div>
          <button class="pft-close">Γ£ò</button>
        </div>
      </transition>

      <!-- KH├öNG GIAN Nß╗ÿI DUNG CH├ìNH (THEO Tß╗¬NG TAB APP) -->
      <main class="app-main">

        <!-- ==================== TAB ADMIN ==================== -->
        <section v-if="activeTab === 'admin'" class="tab-pane p-0 m-0 w-full" style="max-width: 100%; padding: 0;">
          <AdminDashboard />
        </section>

        <!-- ==================== TAB 1: KH├üM PH├ü (EXPLORE) ==================== -->
        <section v-if="activeTab === 'explore'" class="tab-pane">
          <!-- Banner Hero App -->
          <div class="app-hero-card">
            <div class="hero-content">
              <span class="hero-badge">AI TRAVEL ASSISTANT</span>
              <h2>L├¬n lß╗ïch ─æi ch╞íi, ─æß╗½ng l├¬n lß╗ïch c├úi nhau.</h2>
              <p>AI sß║»p xß║┐p lß╗ïch tr├¼nh, bß║ín chß╗ë cß║ºn quyß║┐t ─æß╗ïnh... ai trß║ú tiß╗ün.</p>
              <button class="hero-cta-btn" @click="startPlannerTransition">
                <span>L├¬n lß╗ïch tr├¼nh ngay</span>
                <strong>ΓåÆ</strong>
              </button>
            </div>
          </div>

          <!-- Thanh chß╗ìn nhanh Tß╗ënh/Th├ánh phß╗æ dß║íng Thß║╗ ß║ónh -->
          <div class="explore-section" v-reveal>
            <div class="section-title-row">
              <h3>─Éiß╗âm ─æß║┐n nß╗òi tiß║┐ng</h3>

              <div class="city-music-toolbar">
                <button
                  type="button"
                  class="music-master-toggle"
                  :class="{ muted: musicMuted }"
                  @click="toggleMusicMute"
                  :aria-label="musicMuted ? 'Bß║¡t nhß║íc' : 'Tß║»t nhß║íc'"
                  :aria-pressed="!musicMuted"
                >{{ musicMuted ? '≡ƒöç' : '≡ƒöè' }}</button>
                <label class="music-volume-label" for="city-music-volume">≡ƒöè</label>
                <input
                  id="city-music-volume"
                  v-model.number="musicVolume"
                  class="music-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  aria-label="├ém l╞░ß╗úng nhß║íc ─æiß╗âm ─æß║┐n"
                />
                <span class="badge-count">{{ visibleCities.length }} Tß╗ënh/TP</span>
              </div>
            </div>
            <div class="cities-carousel">
              <div
                v-for="city in visibleDestinationCards"
                :key="city.name"
                :class="['city-card-btn', { active: formDuLieu.diemDen === city.name }]"
                @click="chonDiemDenExplore(city.name)"
                @keydown.enter="chonDiemDenExplore(city.name)"
                @keydown.space.prevent="chonDiemDenExplore(city.name)"
                role="button"
                tabindex="0"
                :style="city.name === ALL_DESTINATIONS ? {
                  background: 'linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)'
                } : {
                  backgroundImage: `url(${city.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }"
              >
                <!-- SVG location pin thay emoji -->
                <span class="city-pin-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
                    <circle cx="12" cy="9" r="2.5" fill="rgba(0,0,0,0.3)"/>
                  </svg>
                </span>
                <span class="city-name">{{ city.displayName || city.name }}</span>
                <small class="city-tag">{{ city.tag }}</small>
              </div>
            </div>
          </div>

          <!-- Widget Thß╗¥i tiß║┐t thß╗¥i gian thß╗▒c -->
          <div v-if="thoiTiet" class="app-weather-widget" v-reveal>
            <div class="weather-widget-header">
              <div>
                <span class="weather-label">THß╗£I TIß║╛T HIß╗åN Tß║áI</span>
                <h4>{{ thoiTiet.location.name }}</h4>
              </div>
              <div class="weather-temp-now">
                <span class="weather-icon-large">{{ bieuTuongThoiTiet(thoiTiet.current.weatherCode) }}</span>
                <strong>{{ Math.round(thoiTiet.current.temperature) }}┬░C</strong>
              </div>
            </div>
            <p class="weather-summary">
              <b>{{ moTaThoiTiet(thoiTiet.current.weatherCode) }}</b> ┬╖ Cß║úm gi├íc nh╞░ {{ Math.round(thoiTiet.current.feelsLike) }}┬░C ┬╖ Gi├│ {{ thoiTiet.current.windSpeed }} km/h
            </p>
            <div class="weather-forecast-strip">
              <div v-for="day in thoiTiet.daily" :key="day.date" class="forecast-item">
                <small>{{ dinhDangNgay(day.date) }}</small>
                <span>{{ bieuTuongThoiTiet(day.weatherCode) }}</span>
                <b>{{ Math.round(day.max) }}┬░</b>
              </div>
            </div>
          </div>

          <!-- Danh s├ích ─æß╗ïa ─æiß╗âm ─æß║╖c sß║»c theo th├ánh phß╗æ C├ô H├îNH ß║óNH Sß╗ÉNG ─Éß╗ÿNG -->
          <div class="explore-section" v-reveal>
            <div class="section-title-row">
              <div>
                <h3>─Éß╗ïa ─æiß╗âm & ─Éß║╖c sß║ún tß║íi {{ formDuLieu.diemDen === ALL_DESTINATIONS ? 'Miß╗ün Trung' : formDuLieu.diemDen }}</h3>
                <small class="sub-region-hint ai-province-subtitle" v-if="aiProvinceSubtitle">{{ aiProvinceSubtitle }}</small>
                <small class="sub-region-hint" v-else>(Khu vß╗▒c mß╗ƒ rß╗Öng sau s├íp nhß║¡p)</small>
              </div>
              <div class="filter-pills">
                <button
                  :class="['filter-pill', { active: filterExploreType === 'all' }]"
                  @click="filterExploreType = 'all'"
                >Tß║Ñt cß║ú ({{ places.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'attraction' }]"
                  @click="filterExploreType = 'attraction'"
                >≡ƒÅ¢∩╕Å Thß║»ng cß║únh ({{ attractionsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'restaurant' }]"
                  @click="filterExploreType = 'restaurant'"
                >≡ƒì£ ─Éß║╖c sß║ún ({{ restaurantsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'hotel' }]"
                  @click="filterExploreType = 'hotel'"
                >≡ƒÅ¿ Kh├ích sß║ín ({{ hotelsList.length }})</button>
                <button
                  :class="['filter-pill', { active: filterExploreType === 'cafe' }]"
                  @click="filterExploreType = 'cafe'"
                >Γÿò Cafe ({{ cafesList.length }})</button>
              </div>
            </div>

            <!-- Thanh t├¼m kiß║┐m nhanh ─æß╗ïa danh, m├│n ─ân, b├úi biß╗ân -->
            <div class="explore-search-box">
              <input
                v-model="searchExploreQuery"
                class="explore-search-input"
                :placeholder="'≡ƒöì T├¼m kiß║┐m ─æß╗ïa danh, di t├¡ch, m├│n ─ân, b├úi biß╗ân tß║íi ' + (formDuLieu.diemDen === ALL_DESTINATIONS ? 'Miß╗ün Trung' : formDuLieu.diemDen) + '...'"
              />
              <button v-if="searchExploreQuery" class="clear-search-btn" @click="searchExploreQuery = ''">Γ£ò</button>
            </div>

            <!-- Grid Thß║╗ ─Éß╗ïa ─æiß╗âm C├ô H├îNH ß║óNH Nß╗öI Bß║¼T -->
            <div v-if="loadingPlaces" class="places-app-grid">
              <SkeletonCard v-for="i in 5" :key="'skeleton-' + i" />
            </div>
            <div v-else-if="filteredExplorePlaces.length">
              <div class="places-app-grid">
                <article v-for="place in displayedExplorePlaces" :key="place._id || place.name" class="app-place-card" v-reveal>
                  <div class="place-img-cover" :style="{ backgroundImage: `url(${getPlaceImage(place)})` }">
                    <span :class="['place-card-type', 'type-' + place.type]">
                      {{ getPlaceTypeLabel(place.type) }}
                    </span>
                    <span class="place-img-rating">Γÿà {{ place.rating || '4.8' }}</span>
                    <button
                      v-if="nguoiDung"
                      class="heart-action-btn"
                      :class="{ active: isFavorite(place._id) }"
                      @click.stop="doiYeuThich(place._id)"
                      title="L╞░u y├¬u th├¡ch"
                    >
                      {{ isFavorite(place._id) ? 'ΓÖÑ' : 'ΓÖí' }}
                    </button>
                  </div>
                  <div class="place-card-content">
                    <h4>{{ place.name }}</h4>
                    <p class="place-card-desc">{{ place.description }}</p>
                    <p v-if="place.address" class="place-card-address">≡ƒôì {{ place.address }}</p>
                    <div class="place-card-bottom">
                      <button class="add-to-plan-btn" @click="themVaoLichTrinhVaMoPlanner(place.name)">
                        + L├¬n lß╗ïch tr├¼nh
                      </button>
                      <a
                        class="place-maps-btn"
                        :href="chiDuongUrl(place.name, place.address)"
                        target="_blank"
                        rel="noreferrer"
                      >
                        ≡ƒù║∩╕Å Chß╗ë ─æ╞░ß╗¥ng
                      </a>
                    </div>
                  </div>
                </article>
              </div>

              <!-- Thanh n├║t Xem th├¬m / Thu gß╗ìn khi c├│ nhiß╗üu h╞ín 5 ─æß╗ïa ─æiß╗âm -->
              <div v-if="filteredExplorePlaces.length > 5" class="load-more-container">
                <button
                  v-if="exploreLimit < filteredExplorePlaces.length"
                  class="load-more-btn"
                  @click="xemThemDiaDiem"
                >
                  <span class="load-more-text">Xem th├¬m ─æß╗ïa ─æiß╗âm</span>
                  <span class="load-more-count">(C├▓n {{ filteredExplorePlaces.length - exploreLimit }})</span>
                  <span class="load-more-icon">Γû╛</span>
                </button>
                <button
                  v-if="exploreLimit > 5"
                  class="collapse-btn"
                  @click="thuGonDiaDiem"
                >
                  <span>Thu gß╗ìn</span>
                  <span class="load-more-icon">Γû┤</span>
                </button>
              </div>
            </div>
            <p v-else class="empty-state-text">Ch╞░a c├│ dß╗» liß╗çu ─æß╗ïa ─æiß╗âm cho khu vß╗▒c n├áy.</p>
            
            <!-- Bß║óN ─Éß╗Æ T╞»╞áNG T├üC (MapComponent) -->
            <div v-if="!loadingPlaces && filteredExplorePlaces.length > 0" style="margin-top: 32px;">
              <div class="section-title-row">
                <h3>≡ƒù║∩╕Å Bß║ún ─æß╗ô c├íc ─æiß╗âm ─æß║┐n</h3>
              </div>
              <MapComponent :places="filteredExplorePlaces" :centerCity="formDuLieu.diemDen" />
            </div>
          </div>
        </section>


        <!-- ==================== TAB 2: Lß║¼P Kß║╛ HOß║áCH (PLANNER) ==================== -->
        <section v-if="activeTab === 'planner'" class="tab-pane planner-tab-bg">

          <!-- Banner ß║únh collage Miß╗ün Trung tß║íi vß╗ï tr├¡ khoanh ─æß╗Å -->
          <div class="planner-hero-banner">
            <img
              src="/images/mientrung-collage.jpg"
              alt="H├ánh tr├¼nh Miß╗ün Trung - Di sß║ún & Biß╗ân xanh"
              class="planner-hero-banner-img"
            />
          </div>

          <!-- B╞»ß╗ÜC NHß║¼P TH├öNG TIN Kß║╛ HOß║áCH -->
          <div class="planner-form-container planner-glass-form">
            <div class="pane-header">
              <div>
                <span class="sub-heading">AI TRIP PLANNER</span>
                <h2>Thiß║┐t kß║┐ h├ánh tr├¼nh cß╗ºa bß║ín</h2>
              </div>
              <div class="planner-header-actions">
                <button
                  type="button"
                  class="music-master-toggle planner-music-toggle"
                  :class="{ muted: musicMuted }"
                  @click="toggleMusicMute"
                  :aria-label="musicMuted ? 'Bß║¡t nhß║íc' : 'Tß║»t nhß║íc'"
                  :aria-pressed="!musicMuted"
                >{{ musicMuted ? '≡ƒöç' : '≡ƒöè' }}</button>
                <span class="planner-icon">Γ£ê</span>
              </div>
            </div>

            <!-- Tiß║┐n tr├¼nh Wizard -->
            <div class="wizard-progress">
              <div :class="['step-indicator', { active: currentPlannerStep >= 1 }]">1. ─Éiß╗âm ─æß║┐n</div>
              <div class="step-divider"></div>
              <div :class="['step-indicator', { active: currentPlannerStep >= 2 }]">2. T├ái ch├¡nh</div>
              <div class="step-divider"></div>
              <div :class="['step-indicator', { active: currentPlannerStep >= 3 }]">3. Sß╗ƒ th├¡ch</div>
            </div>

            <!-- B╞»ß╗ÜC 1: ─ÉIß╗éM ─Éß║╛N & THß╗£I GIAN -->
            <div v-show="currentPlannerStep === 1" class="app-form-grid wizard-step-content">
              <!-- AI Message bubble ΓÇö 10 c├óu lu├ón phi├¬n ngß║½u nhi├¬n -->
              <div class="ai-hint-bubble full-width" v-if="showAiHintBubble">
                <div class="ai-hint-robot"><img src="/shrek.jpg" style="width: 44px; height: 44px; object-fit: cover; border-radius: 50%; display: block;" alt="AI Robot" /></div>
                <div class="ai-hint-body">
                  <div class="ai-hint-content">
                    <p v-html="aiCurrentHint"></p>
                  </div>
                  <div class="ai-hint-chips">
                    <span class="ai-chip" @click="chonNhanhDiemDen('─É├á Nß║╡ng')">≡ƒîë ─É├á Nß║╡ng</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Huß║┐')">≡ƒææ Huß║┐</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Nghß╗ç An')">≡ƒî╛ Nghß╗ç An</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('L├óm ─Éß╗ông')">≡ƒî▓ ─É├á Lß║ít</span>
                    <span class="ai-chip" @click="chonNhanhDiemDen('Kh├ính H├▓a')">Γ¢╡ Nha Trang</span>
                    <span class="ai-chip ai-chip-refresh" @click="refreshAiHint()">≡ƒöÇ C├óu kh├íc</span>
                  </div>
                </div>
                <button class="ai-hint-close" @click="showAiHintBubble = false" title="Dong goi y">Γ£ò</button>
              </div>
              <!-- CHß╗îN ─ÉIß╗éM Bß║«T ─Éß║ªU (KHß╗₧I H├ÇNH) Gß╗îN G├ÇNG -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <label>≡ƒÜ⌐ ─Éiß╗âm bß║»t ─æß║ºu (Khß╗ƒi h├ánh)</label>

                  <span class="route-origin-tag" v-if="formDuLieu.diemKhoiHanh">Xuß║Ñt ph├ít: <b>{{ formDuLieu.diemKhoiHanh }}</b></span>
                </div>
                <div class="origin-select-wrapper">
                  <input
                    v-model="formDuLieu.diemKhoiHanh"
                    class="app-input origin-combo-input"
                    :list="'origin-list-' + originProvinceMode"
                    placeholder="≡ƒöì T├¼m hoß║╖c chß╗ìn tß╗ënh/th├ánh xuß║Ñt ph├ít..."
                    autocomplete="off"
                  />
                  <datalist :id="'origin-list-' + originProvinceMode">
                    <option
                      v-for="city in popularOrigins"
                      :key="city.name"
                      :value="city.name"
                    >{{ city.icon }} {{ city.name }}</option>
                  </datalist>
                  <!-- Gß╗úi ├╜ nhanh: chß╗ë hiß╗çn 6 th├ánh phß╗æ phß╗ò biß║┐n nhß║Ñt -->
                  <div class="origin-quick-picks">
                    <button
                      v-for="city in popularOrigins.slice(0, 6)"
                      :key="'pick-' + city.name"
                      type="button"
                      :class="['origin-pick-btn', { active: formDuLieu.diemKhoiHanh === city.name }]"
                      @click="chonDiemKhoiHanh(city.name)"
                      :title="city.name"
                    >{{ city.name }}</button>
                  </div>
                </div>
              </div>

              <!-- Lß╗ÿ TR├îNH V├Ç Cß╗░ LY Tß╗ÉI ╞»U SI├èU Gß╗îN -->
              <div class="route-overview-banner compact full-width">
                <div class="rob-point">
                  <span class="rob-dot start"></span>
                  <span class="rob-label">N╞íi ─æi:</span>
                  <strong>{{ formDuLieu.diemKhoiHanh || 'Ch╞░a chß╗ìn' }}</strong>
                </div>
                <div class="rob-mid-compact">
                  <span class="rob-dash-line"></span>
                  <span class="rob-dist-pill">≡ƒ¢ú∩╕Å ~{{ transitRouteInfo.estimatedDistanceKm || transitRouteInfo.distanceKm || 350 }} km</span>
                </div>
                <div class="rob-point">
                  <span class="rob-dot end"></span>
                  <span class="rob-label">N╞íi ─æß║┐n:</span>
                  <strong>{{ formDuLieu.diemDen }}</strong>
                </div>
              </div>

              <!-- Chß╗ìn Th├ánh phß╗æ -->
              <div class="app-field full-width">
                <label>─Éiß╗âm ─æß║┐n du lß╗ïch</label>

                <div class="quick-city-selector">
                  <div
                    v-for="c in visibleCities"
                    :key="c.name"
                    :class="['city-select-pill', { active: formDuLieu.diemDen === c.name }]"
                    @click="chonNhanhDiemDen(c.name)"
                    role="button"
                    tabindex="0"
                    @keydown.enter="chonNhanhDiemDen(c.name)"
                    @keydown.space.prevent="chonNhanhDiemDen(c.name)"
                  >
                    <span>{{ c.name }}</span>
                  </div>
                </div>
              </div>

              <!-- Sß╗æ ng├áy & Sß╗æ ng╞░ß╗¥i -->
              <div class="app-field">
                <label>Sß╗æ ng├áy ─æi</label>
                <div class="stepper-input">
                  <button type="button" @click="formDuLieu.soNgay = Math.max(1, formDuLieu.soNgay - 1)">-</button>
                  <span>{{ formDuLieu.soNgay }} ng├áy</span>
                  <button type="button" @click="formDuLieu.soNgay++">+</button>
                </div>
              </div>

              <div class="app-field">
                <label>Sß╗æ ng╞░ß╗¥i</label>
                <div class="stepper-input">
                  <button type="button" @click="formDuLieu.soNguoi = Math.max(1, formDuLieu.soNguoi - 1)">-</button>
                  <span>{{ formDuLieu.soNguoi }} ng╞░ß╗¥i</span>
                  <button type="button" @click="formDuLieu.soNguoi++">+</button>
                </div>
              </div>

            </div>

            <!-- B╞»ß╗ÜC 2: T├ÇI CH├ìNH & DI CHUYß╗éN -->
            <div v-show="currentPlannerStep === 2" class="app-form-grid wizard-step-content">
              <!-- Ng├ón s├ích -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <label>Ng├ón s├ích dß╗▒ kiß║┐n (VND)</label>
                  <strong class="budget-highlight">{{ dinhDangTien(formDuLieu.nganSach) }}─æ</strong>
                </div>
                <input
                  type="range"
                  v-model.number="formDuLieu.nganSach"
                  min="100000"
                  max="30000000"
                  step="100000"
                  class="budget-slider"
                />

                <!-- Ph├¡m tß║»t chß╗ìn nhanh ng├ón s├ích -->
                <div class="quick-budget-chips">
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 100000 }"
                    @click="formDuLieu.nganSach = 100000"
                  >
                    100K ≡ƒÜ¿
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 500000 }"
                    @click="formDuLieu.nganSach = 500000"
                  >
                    500K ≡ƒÆ╕
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 1500000 }"
                    @click="formDuLieu.nganSach = 1500000"
                  >
                    1.5 Tr ≡ƒÄÆ
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 3500000 }"
                    @click="formDuLieu.nganSach = 3500000"
                  >
                    3.5 Tr Γ£¿
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 7000000 }"
                    @click="formDuLieu.nganSach = 7000000"
                  >
                    7 Tr ≡ƒÅû∩╕Å
                  </button>
                  <button
                    type="button"
                    class="q-budget-chip"
                    :class="{ active: formDuLieu.nganSach === 15000000 }"
                    @click="formDuLieu.nganSach = 15000000"
                  >
                    15 Tr ≡ƒÆÄ
                  </button>
                </div>

                <!-- Dß╗░ TO├üN CHI PH├ì TH├öNG MINH (DYNAMIC BUDGET BREAKDOWN) -->
                <div class="dynamic-budget-card">
                  <div class="dbc-header">
                    <div class="dbc-title-group">
                      <span class="dbc-icon">≡ƒôè</span>
                      <div>
                        <strong>Dß╗▒ to├ín ph├ón bß╗ò th├┤ng minh theo ng├ón s├ích</strong>
                        <small>AI tß╗▒ ─æß╗Öng t├¡nh to├ín chi ph├¡ ╞░ß╗¢c t├¡nh theo sß╗æ ng╞░ß╗¥i ({{ formDuLieu.soNguoi }} ng╞░ß╗¥i) & sß╗æ ng├áy ({{ formDuLieu.soNgay }} ng├áy)</small>
                      </div>
                    </div>
                    <span class="dbc-total-badge">{{ dinhDangTien(formDuLieu.nganSach) }}─æ</span>
                  </div>

                  <!-- Thanh tiß║┐n tr├¼nh ph├ón bß╗ò 4 tß╗╖ lß╗ç m├áu sß║»c -->
                  <div class="dbc-progress-bar">
                    <div class="dbc-seg seg-hotel" :style="{ width: dynamicBudget.hotelPercent + '%' }" title="Kh├ích sß║ín 35%"></div>
                    <div class="dbc-seg seg-food" :style="{ width: dynamicBudget.foodPercent + '%' }" title="─én uß╗æng 35%"></div>
                    <div class="dbc-seg seg-transit" :style="{ width: dynamicBudget.transportPercent + '%' }" title="Di chuyß╗ân & V├⌐ 20%"></div>
                    <div class="dbc-seg seg-reserve" :style="{ width: dynamicBudget.reservePercent + '%' }" title="Dß╗▒ ph├▓ng 10%"></div>
                  </div>

                  <!-- Grid 4 danh mß╗Ñc chi ph├¡ cß╗Ñ thß╗â -->
                  <div class="dbc-grid">
                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-hotel"></span>
                        <span class="dbc-cat">≡ƒÅ¿ Kh├ích sß║ín (~35%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.hotel) }}─æ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.hotelDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-food"></span>
                        <span class="dbc-cat">≡ƒì£ ─én uß╗æng (~35%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.food) }}─æ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.foodDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-transit"></span>
                        <span class="dbc-cat">≡ƒÜù Di chuyß╗ân & V├⌐ (~20%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.transportAndTickets) }}─æ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.transitDesc }}</small>
                    </div>

                    <div class="dbc-item">
                      <div class="dbc-item-top">
                        <span class="dbc-dot dot-reserve"></span>
                        <span class="dbc-cat">≡ƒ¢í∩╕Å Dß╗▒ ph├▓ng (~10%)</span>
                      </div>
                      <strong class="dbc-amount">{{ dinhDangTien(dynamicBudget.reserve) }}─æ</strong>
                      <small class="dbc-sub">{{ dynamicBudget.reserveDesc }}</small>
                    </div>
                  </div>
                </div>

                <!-- Lß╗¥i khuy├¬n t├¡nh c├ích AI theo ng├ón s├ích -->
                <div :class="['personality-budget-card', thongDiepNganSach.type]">
                  <div class="pbc-header">
                    <span class="pbc-icon">{{ thongDiepNganSach.icon }}</span>
                    <span class="pbc-tag">{{ thongDiepNganSach.tag }}</span>
                  </div>
                  <div class="pbc-text">
                    <strong>{{ thongDiepNganSach.title }}</strong>
                    <p>{{ thongDiepNganSach.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Ph╞░╞íng tiß╗çn & Kh├ích sß║ín -->
              <div class="app-field">
                <label>Ph╞░╞íng tiß╗çn di chuyß╗ân</label>
                <select v-model="formDuLieu.phuongTien" class="app-select">
                  <option value="xe kh├ích">≡ƒÜî Xe kh├ích chß║Ñt l╞░ß╗úng cao (Tiß║┐t kiß╗çm nhß║Ñt)</option>
                  <option value="t├áu hß╗Åa">≡ƒÜå T├áu hß╗Åa (Ngß║»m cß║únh)</option>
                  <option value="m├íy bay">Γ£ê∩╕Å M├íy bay + Thu├¬ xe</option>
                  <option value="xe m├íy">≡ƒÅì∩╕Å Xe m├íy / Ph╞░ß╗út</option>
                  <option value="├┤ t├┤">≡ƒÜù ├ö t├┤ / Xe du lß╗ïch</option>
                  <option value="linh hoß║ít">≡ƒîÉ Linh hoß║ít</option>
                </select>
              </div>

              <div class="app-field">
                <div class="field-label-between">
                  <label>Y├¬u cß║ºu kh├ích sß║ín</label>
                  <small class="input-hint-small">Bß║Ñm chß╗ìn nhanh hoß║╖c tß╗▒ g├╡</small>
                </div>
                <input
                  v-model="formDuLieu.yeuCauKhachSan"
                  class="app-input enhanced-input"
                  placeholder="Gß║ºn biß╗ân, view ho├áng h├┤n, c├│ hß╗ô b╞íi..."
                />
                <!-- Quick Tag Chips cho Kh├ích sß║ín -->
                <div class="quick-tags-wrap">
                  <button
                    v-for="tag in hotelQuickTags"
                    :key="tag"
                    type="button"
                    :class="['quick-tag-chip', { active: isHotelTagActive(tag) }]"
                    @click="toggleHotelTag(tag)"
                  >
                    <span>{{ tag }}</span>
                  </button>
                </div>
              </div>

              <!-- PHONG C├üCH NHß║¼N PH├ÆNG -->
              <div class="input-group full-width-group">
                <div class="input-label-row">
                  <label style="font-size: 1.05rem; font-weight: 700; color: #1e293b;">Phong c├ích nhß║¡n ph├▓ng kh├ích sß║ín</label>
                </div>
                <div class="checkin-preference-options" style="display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
                  <label :class="['pref-card', { active: formDuLieu.hotel_checkin_preference === 'checkin_first' }]" style="flex: 1; min-width: 200px; cursor: pointer; padding: 16px; border-radius: 12px; border: 2px solid; transition: all 0.2s; display: flex; align-items: flex-start; gap: 12px;" :style="{ borderColor: formDuLieu.hotel_checkin_preference === 'checkin_first' ? '#10b981' : '#e2e8f0', backgroundColor: formDuLieu.hotel_checkin_preference === 'checkin_first' ? '#ecfdf5' : '#f8fafc' }">
                    <input type="radio" v-model="formDuLieu.hotel_checkin_preference" value="checkin_first" style="display: none;" />
                    <span style="font-size: 1.5rem; line-height: 1;">≡ƒÅ¿</span>
                    <div>
                      <strong style="display: block; color: #0f172a; font-size: 0.95rem; margin-bottom: 4px;">Cß║Ñt ─æß╗ô / Nhß║¡n ph├▓ng tr╞░ß╗¢c</strong>
                      <span style="color: #475569; font-size: 0.85rem; line-height: 1.4; display: block;">Nhß║¡n ph├▓ng sß╗¢m nhß║Ñt c├│ thß╗â rß╗ôi mß╗¢i bß║»t ─æß║ºu ─æi ch╞íi.</span>
                    </div>
                  </label>
                  <label :class="['pref-card', { active: formDuLieu.hotel_checkin_preference === 'play_first' }]" style="flex: 1; min-width: 200px; cursor: pointer; padding: 16px; border-radius: 12px; border: 2px solid; transition: all 0.2s; display: flex; align-items: flex-start; gap: 12px;" :style="{ borderColor: formDuLieu.hotel_checkin_preference === 'play_first' ? '#10b981' : '#e2e8f0', backgroundColor: formDuLieu.hotel_checkin_preference === 'play_first' ? '#ecfdf5' : '#f8fafc' }">
                    <input type="radio" v-model="formDuLieu.hotel_checkin_preference" value="play_first" style="display: none;" />
                    <span style="font-size: 1.5rem; line-height: 1;">≡ƒÄó</span>
                    <div>
                      <strong style="display: block; color: #0f172a; font-size: 0.95rem; margin-bottom: 4px;">─Éi ch╞íi lu├┤n</strong>
                      <span style="color: #475569; font-size: 0.85rem; line-height: 1.4; display: block;">Ch╞íi ─æß║┐n tß╗æi muß╗Ön mß╗¢i vß╗ü kh├ích sß║ín nhß║¡n ph├▓ng.</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Tß╗ÉI ╞»U CHI PH├ì GI├ü XE & Gß╗óI ├¥ NH├Ç XE GI├ü Rß║║ -->
              <div class="bus-optimization-section full-width">
                <div class="bos-header">
                  <div>
                    <span class="bos-kicker">≡ƒÜî Tß╗ÉI ╞»U CHI PH├ì GI├ü XE & DI CHUYß╗éN</span>
                    <h3>Gß╗úi ├╜ nh├á xe gi├í rß║╗ tuyß║┐n {{ formDuLieu.diemKhoiHanh }} Γ₧ö {{ formDuLieu.diemDen }}</h3>
                  </div>
                  <div class="bos-badges-group">
                    <span class="bos-dist-badge">Cß╗▒ ly: ~{{ transitRouteInfo.estimatedDistanceKm || transitRouteInfo.distanceKm || 350 }} km</span>
                    <span class="bos-crawler-badge" title="Tß╗▒ ─æß╗Öng cß║¡p nhß║¡t gi├í v├⌐ tß╗½ c├íc nh├á xe v├á ─æ╞░ß╗¥ng sß║»t">
                      ≡ƒñû C├áo dß╗» liß╗çu v├⌐ xe & v├⌐ t├áu: Sß║╡n s├áng
                    </span>
                  </div>
                </div>

                <!-- So s├ính chi ph├¡ c├íc ph╞░╞íng tiß╗çn -->
                <div class="transit-vehicles-grid" v-reveal>
                  <div
                    v-for="v in transitRouteInfo.vehicleComparison"
                    :key="v.type"
                    :class="['tv-card', {
                      active: (v.type === 'bus' && formDuLieu.phuongTien === 'xe kh├ích') ||
                              (v.type === 'flight' && formDuLieu.phuongTien === 'm├íy bay') ||
                              (v.type === 'train' && formDuLieu.phuongTien === 't├áu hß╗Åa') ||
                              (v.type === 'motorbike' && formDuLieu.phuongTien === 'xe m├íy'),
                      'highlight-cheapest': v.is_cheapest
                    }]"
                    @click="chonPhuongTienTuSoSanh(v)"
                    role="button"
                    tabindex="0"
                  >
                    <div class="tv-top">
                      <span class="tv-icon">{{ v.icon }}</span>
                      <span v-if="v.is_cheapest" class="tv-badge cheapest">≡ƒÆí Rß║╗ nhß║Ñt</span>
                      <span v-else-if="v.is_fastest" class="tv-badge fastest">ΓÜí Nhanh nhß║Ñt</span>
                    </div>
                    <div class="tv-title">{{ v.name }}</div>
                    <div class="tv-price-row">
                      <strong>{{ dinhDangTien(v.estimated_cost_per_person) }}─æ</strong>
                      <small>/ng╞░ß╗¥i</small>
                    </div>
                    <div class="tv-total" v-if="formDuLieu.soNguoi > 1">
                      Tß╗òng {{ formDuLieu.soNguoi }} ng╞░ß╗¥i: <b>{{ dinhDangTien(v.estimated_cost_per_person * formDuLieu.soNguoi) }}─æ</b>
                    </div>
                    <div class="tv-duration">ΓÅ▒∩╕Å {{ v.duration }}</div>
                    <p class="tv-advantage">{{ v.advantage }}</p>
                  </div>
                </div>

                <!-- N├║t chuyß╗ân tab Xem V├⌐ Xe Kh├ích vs V├⌐ T├áu Hß╗Åa -->
                <div class="transit-tabs-header">
                  <button
                    type="button"
                    :class="['transit-subtab-btn', { active: transitTab === 'bus' }]"
                    @click="transitTab = 'bus'"
                  >
                    ≡ƒÜî V├⌐ Xe Kh├ích Gi├í Rß║╗ ({{ transitRouteInfo.operators?.length || 0 }})
                  </button>
                  <button
                    type="button"
                    :class="['transit-subtab-btn', { active: transitTab === 'train' }]"
                    @click="transitTab = 'train'"
                  >
                    ≡ƒÜå V├⌐ T├áu Hß╗Åa Thß╗æng Nhß║Ñt ({{ transitRouteInfo.trains?.length || 3 }})
                  </button>
                </div>

                <!-- TAB 1: Danh s├ích gß╗úi ├╜ nh├á xe gi├í rß║╗ -->
                <div v-show="transitTab === 'bus'" class="bus-operators-box">
                  <div class="bob-title-row">
                    <h4>Top nh├á xe gi├í rß║╗ & uy t├¡n khuy├¬n d├╣ng</h4>
                    <small>Bß║Ñm "Chß╗ìn xe n├áy" ─æß╗â ─æ╞░a v├áo dß╗▒ to├ín chi ph├¡ tß╗▒ ─æß╗Öng</small>
                  </div>

                  <div class="bus-operators-grid">
                    <div
                      v-for="bus in transitRouteInfo.operators"
                      :key="bus.id"
                      :class="['bus-item-card', { selected: formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id }]"
                    >
                      <div class="bic-header">
                        <div>
                          <div class="bic-name-row">
                            <span class="bic-name">{{ bus.name }}</span>
                            <span class="bic-tag" v-if="bus.badge">{{ bus.badge }}</span>
                          </div>
                          <span class="bic-type">{{ bus.type }}</span>
                        </div>
                        <div class="bic-rating">
                          Γ¡É {{ bus.rating }} <small>({{ bus.reviews }} ─æ├ính gi├í)</small>
                        </div>
                      </div>

                      <div class="bic-specs">
                        <div class="bic-spec">
                          <span>ΓÅ▒∩╕Å Thß╗¥i gian:</span>
                          <b>{{ bus.duration }}</b>
                        </div>
                        <div class="bic-spec">
                          <span>≡ƒòÆ Giß╗¥ chß║íy:</span>
                          <b>{{ bus.depart_times }}</b>
                        </div>
                        <div class="bic-spec">
                          <span>≡ƒôì ─Éiß╗âm ─æ├│n/trß║ú:</span>
                          <small>{{ bus.pickup }} Γ₧ö {{ bus.dropoff }}</small>
                        </div>
                      </div>

                      <div class="bic-footer-clean">
                        <!-- H├áng 1: Gi├í v├⌐ ni├¬m yß║┐t & Tß╗òng chi ph├¡ ─æo├án -->
                        <div class="bic-price-line">
                          <div class="bpl-left">
                            <span class="bpl-label">Gi├í v├⌐:</span>
                            <strong class="bpl-unit">{{ dinhDangTien(bus.price) }}─æ</strong>
                            <small class="bpl-sub">/ng╞░ß╗¥i</small>
                          </div>
                          <div class="bpl-right" v-if="formDuLieu.soNguoi > 1">
                            <span class="bpl-total-badge">
                              Tß╗òng {{ formDuLieu.soNguoi }} v├⌐: <b>{{ dinhDangTien(bus.price * formDuLieu.soNguoi) }}─æ</b>
                            </span>
                          </div>
                        </div>

                        <!-- H├áng 2: Hai n├║t h├ánh ─æß╗Öng chia ─æß╗üu 50/50 -->
                        <div class="bic-actions-row">
                          <a :href="`tel:${bus.hotline}`" class="bic-action-call" title="Gß╗ìi tß╗òng ─æ├ái ─æß║╖t v├⌐">
                            ≡ƒô₧ {{ bus.hotline }}
                          </a>
                          <button
                            type="button"
                            :class="['bic-action-select', { active: formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id }]"
                            @click="chonNhaXe(bus)"
                          >
                            {{ formDuLieu.nhaXeDaChon && formDuLieu.nhaXeDaChon.id === bus.id ? 'Γ£ô ─É├ú chß╗ìn xe' : 'Chß╗ìn xe n├áy' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- TAB 2: Danh s├ích v├⌐ t├áu hß╗Åa Thß╗æng Nhß║Ñt (─É╞░ß╗¥ng Sß║»t Viß╗çt Nam) -->
                <div v-show="transitTab === 'train'" class="train-operators-box">
                  <div class="bob-title-row">
                    <h4>Lß╗ïch tr├¼nh & Gi├í v├⌐ T├áu Hß╗Åa (Tß╗òng c├┤ng ty ─É╞░ß╗¥ng sß║»t Viß╗çt Nam)</h4>
                    <small>Trß║úi nghiß╗çm ngß║»m cß║únh biß╗ân L─âng C├┤, ─æ├¿o Hß║úi V├ón v├á c├íc cung ─æ╞░ß╗¥ng di sß║ún</small>
                  </div>

                  <div class="bus-operators-grid">
                    <div
                      v-for="train in transitRouteInfo.trains"
                      :key="train.id"
                      :class="['bus-item-card train-card', { selected: formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id }]"
                    >
                      <div class="bic-header">
                        <div>
                          <div class="bic-name-row">
                            <span class="bic-name">{{ train.name }}</span>
                            <span class="bic-tag train-tag" v-if="train.badge">{{ train.badge }}</span>
                          </div>
                          <span class="bic-type">{{ train.type }}</span>
                        </div>
                        <div class="bic-rating">
                          Γ¡É {{ train.rating }} <small>(T├áu Thß╗æng Nhß║Ñt)</small>
                        </div>
                      </div>

                      <div class="bic-specs">
                        <div class="bic-spec">
                          <span>ΓÅ▒∩╕Å Thß╗¥i gian:</span>
                          <b>{{ train.duration }}</b>
                        </div>
                        <div class="bic-spec">
                          <span>≡ƒòÆ Giß╗¥ khß╗ƒi h├ánh:</span>
                          <b>{{ train.depart_times }}</b>
                        </div>
                        <div class="bic-spec">
                          <span>≡ƒÜë Ga ─æi Γ₧ö Ga ─æß║┐n:</span>
                          <small>{{ train.depart_station }} Γ₧ö {{ train.arrive_station }}</small>
                        </div>
                      </div>

                      <div class="bic-footer-clean">
                        <!-- H├áng 1: Gi├í v├⌐ t├áu -->
                        <div class="bic-price-line">
                          <div class="bpl-left">
                            <span class="bpl-label">Gi├í v├⌐ t├áu:</span>
                            <strong class="bpl-unit train-price-color">{{ dinhDangTien(train.price) }}─æ</strong>
                            <small class="bpl-sub">/ng╞░ß╗¥i</small>
                          </div>
                          <div class="bpl-right" v-if="formDuLieu.soNguoi > 1">
                            <span class="bpl-total-badge train-total-badge">
                              Tß╗òng {{ formDuLieu.soNguoi }} v├⌐: <b>{{ dinhDangTien(train.price * formDuLieu.soNguoi) }}─æ</b>
                            </span>
                          </div>
                        </div>

                        <!-- H├áng 2: Hai n├║t h├ánh ─æß╗Öng ─æß║╖t v├⌐ v├á chß╗ìn t├áu -->
                        <div class="bic-actions-row">
                          <a :href="train.booking_url" target="_blank" rel="noopener noreferrer" class="bic-action-call train-call" title="─Éß║╖t v├⌐ trß╗▒c tuyß║┐n tß║íi dsvn.vn">
                            ≡ƒÄ½ ─Éß║╖t tß║íi dsvn.vn Γåù
                          </a>
                          <button
                            type="button"
                            :class="['bic-action-select train-select-btn', { active: formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id }]"
                            @click="chonTauHoa(train)"
                          >
                            {{ formDuLieu.tauDaChon && formDuLieu.tauDaChon.id === train.id ? 'Γ£ô ─É├ú chß╗ìn t├áu' : 'Chß╗ìn t├áu n├áy' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sß╗ƒ th├¡ch -->
              <div class="app-field full-width">
                <div class="field-label-between">
                  <label>Sß╗ƒ th├¡ch & Trß║úi nghiß╗çm (Kh├┤ng bß║»t buß╗Öc)</label>
                  <small class="input-hint-small">Bß║Ñm chß╗ìn nhanh hoß║╖c tß╗▒ g├╡</small>
                </div>
                <input
                  v-model="chuoiSoThich"
                  class="app-input enhanced-input"
                  placeholder="─Éß╗â trß╗æng hoß║╖c nhß║¡p nß║┐u bß║ín c├│ y├¬u cß║ºu ri├¬ng (v├¡ dß╗Ñ: hß║úi sß║ún, check-in, tß║»m biß╗ân...)"
                />
                <!-- Quick Tag Chips cho Sß╗ƒ th├¡ch -->
                <div class="quick-tags-wrap">
                  <button
                    v-for="tag in interestQuickTags"
                    :key="tag"
                    type="button"
                    :class="['quick-tag-chip', { active: isInterestTagActive(tag) }]"
                    @click="toggleInterestTag(tag)"
                  >
                    <span>{{ tag }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- B╞»ß╗ÜC 3: Sß╗₧ TH├ìCH & ─Éß╗èA ─ÉIß╗éM -->
            <div v-show="currentPlannerStep === 3" class="wizard-step-content">
            <!-- Bß╗ÿ CHß╗îN ─Éß╗èA ─ÉIß╗éM & ─Éß║╢C Sß║óN Nß╗öI TIß║╛NG THEO TH├ÇNH PHß╗É -->
            <div class="places-picker-box" style="margin-top:0">
              <div class="picker-top">
                <div>
                  <small class="picker-kicker">Gß╗óI ├¥ ─Éß╗èA PH╞»╞áNG ΓÇö Bß║ñM ─Éß╗é CHß╗îN</small>
                  <h4>Bß║ín muß╗æn gh├⌐ ─æß╗ïa ─æiß╗âm & qu├ín ngon n├áo tß║íi {{ formDuLieu.diemDen }}?</h4>
                </div>
                <span v-if="selectedPlaces.length" class="badge-selected-count">
                  Γ£ô ─É├ú chß╗ìn {{ selectedPlaces.length }} ─æiß╗âm
                </span>
              </div>

              <!-- Th├┤ng b├ío AI Crawler -->
              <div v-if="thongBaoCrawl" class="crawl-alert-banner">
                <span>{{ thongBaoCrawl }}</span>
              </div>
              
              <div class="places-scroll-container">

              <!-- Nh├│m Thß║»ng cß║únh -->
              <div v-if="attractionsList.length" class="picker-row">
                <span class="row-label">≡ƒô╕ Thß║»ng cß║únh:</span>
                <div class="chips-wrap">
                  <button
                    v-for="p in attractionsList"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status">{{ isPlaceSelected(p.name) ? 'Γ£ô' : '+' }}</span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Nh├│m M├│n ngon -->
              <div v-if="restaurantsList.length" class="picker-row">
                <span class="row-label">≡ƒì£ Qu├ín ─æß║╖c sß║ún:</span>
                <div class="chips-wrap">
                  <button
                    v-for="p in restaurantsList"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status">{{ isPlaceSelected(p.name) ? 'Γ£ô' : '+' }}</span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Nh├│m Kh├ích sß║ín -->
              <div v-if="hotelsList.length" class="picker-row">
                <span class="row-label">≡ƒÅ¿ Kh├ích sß║ín:</span>
                <div class="chips-wrap">
                  <button
                    v-for="p in hotelsList"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status">{{ isPlaceSelected(p.name) ? 'Γ£ô' : '+' }}</span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Nh├│m Cafe -->
              <div v-if="cafesList.length" class="picker-row">
                <span class="row-label">Γÿò Qu├ín Cafe:</span>
                <div class="chips-wrap">
                  <button
                    v-for="p in cafesList"
                    :key="p.name"
                    type="button"
                    :class="['app-chip', { active: isPlaceSelected(p.name) }]"
                    @click="togglePlaceSelection(p.name)"
                  >
                    <span class="chip-status">{{ isPlaceSelected(p.name) ? 'Γ£ô' : '+' }}</span>
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>
              </div>
              
              <!-- Tß╗▒ nhß║¡p ─æiß╗âm ─æß║┐n -->
              <div class="custom-place-input-row" style="margin-top: 16px;">
                <span class="row-label">Th├¬m ─æß╗ïa ─æiß╗âm / qu├ín kh├íc (Tß╗▒ nhß║¡p):</span>
                <div style="display:flex; gap:8px;">
                  <input type="text" v-model="customPlaceText" placeholder="Nhß║¡p t├¬n ─æß╗ïa ─æiß╗âm bß║ín muß╗æn ─æi..." class="enhanced-input" style="flex:1; padding:10px 14px;" @keyup.enter="addCustomPlace" />
                  <button class="app-primary-btn" @click="addCustomPlace" type="button" style="padding: 10px 20px; font-size:13px; white-space:nowrap;">+ Th├¬m</button>
                </div>
              </div>

            </div>

            <!-- ─É├ôNG B╞»ß╗ÜC 3 -->
            </div>

            <!-- Lß╗ûI KHI Tß║áO Lß╗èCH TR├îNH -->
            <div v-if="taoPlanError" class="crawl-alert-banner" style="background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; margin-top:16px; font-weight:600;">
              ΓÜá {{ taoPlanError }}
            </div>

            <!-- WIZARD FOOTER NAVIGATION -->
            <div class="wizard-footer">
              <button 
                v-if="currentPlannerStep > 1" 
                @click="currentPlannerStep--" 
                class="app-secondary-btn"
                :disabled="dangTao"
              >
                ΓåÉ Quay lß║íi
              </button>
              
              <button 
                v-if="currentPlannerStep < 3" 
                @click="currentPlannerStep++" 
                class="app-primary-btn"
              >
                Tiß║┐p theo ΓåÆ
              </button>

              <button
                v-if="currentPlannerStep === 3"
                class="app-primary-btn submit-plan-btn"
                @click="taoLichTrinh"
                :disabled="dangTao"
              >
                <span v-if="dangTao" class="btn-spinner"></span>
                <span>{{ dangTao ? 'AI ─æang l├¬n kß║┐ hoß║ích...' : 'Γ£¿ Tß║ío Lß╗ïch Tr├¼nh' }}</span>
              </button>
            </div>
          </div>

          <!-- Personality AI Loading State (Khi AI ─æang tß║ío lß╗ïch tr├¼nh) -->
          <div v-if="dangTao" class="ai-generating-card">
            <div class="ai-gen-radar">
              <div class="radar-pulse"></div>
              <div class="radar-center"><img src="/shrek.jpg" style="width: 58px; height: 58px; object-fit: cover; border-radius: 50%; display: block;" alt="AI Robot" /></div>
              <div class="radar-orb orb-1">≡ƒì£</div>
              <div class="radar-orb orb-2">≡ƒù║∩╕Å</div>
              <div class="radar-orb orb-3">≡ƒÜù</div>
              <div class="radar-orb orb-4">ΓÿÇ∩╕Å</div>
            </div>
            <div class="ai-gen-body">
              <div class="ai-gen-badge">
                <span class="pulsing-dot"></span>
                AI TRAVEL ASSISTANT ─ÉANG L├ÇM VIß╗åC
              </div>
              <transition name="msg-slide" mode="out-in">
                <h3 :key="currentLoadingMessageIndex" class="ai-gen-message">
                  {{ currentLoadingMessage }}
                </h3>
              </transition>
              <div class="ai-gen-progress-track">
                <div class="ai-gen-progress-bar"></div>
              </div>
              <p class="ai-gen-sub">
                ─Éang r├á so├ít qu├ín ngon, ─æiß╗âm check-in v├á tß╗æi ╞░u tuyß║┐n ─æ╞░ß╗¥ng cho chuyß║┐n ─æi {{ formDuLieu.diemDen }} cß╗ºa bß║ín!
              </p>
            </div>
          </div>

          <!-- Kß║╛T QUß║ó Lß╗èCH TR├îNH CHI TIß║╛T -->
          <div v-if="lichTrinh" class="plan-results-container">
            
            <!-- LIVE MODE BANNER -->
            <div v-if="liveModeActive" class="live-budget-banner" style="position: sticky; top: 20px; z-index: 100; background: #0f172a; color: white; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); border: 1px solid #334155; align-items: center;">
              <div>
                <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">─Éang trong chuyß║┐n ─æi</div>
                <strong style="font-size: 1.2rem; color: #10b981;">≡ƒÜÇ Live Mode</strong>
              </div>
              <div style="text-align: right; font-size: 0.95rem;">
                Dß╗▒ kiß║┐n ban ─æß║ºu: <span style="color: #cbd5e1;">{{ dinhDangTien(lichTrinh.total_budget) }}─æ</span><br>
                ─É├ú chi ti├¬u thß╗▒c tß║┐: <span style="color: #fca5a5; font-weight: bold;">{{ dinhDangTien(actualTotalSpent) }}─æ</span><br>
                Ng├ón s├ích c├▓n lß║íi: <span style="color: #6ee7b7; font-weight: bold; font-size: 1.1rem;">{{ dinhDangTien(lichTrinh.total_budget - actualTotalSpent) }}─æ</span>
              </div>
            </div>
            <!-- Personality Completion Banner (Khi AI tß║ío lß╗ïch tr├¼nh xong) -->
            <transition name="fade-slide">
              <div v-if="hienCompletionBanner" class="ai-completion-banner">
                <div class="acb-left">
                  <div class="acb-icon">{{ activeCompletionQuote.icon }}</div>
                </div>
                <div class="acb-content">
                  <div class="acb-badge">H├ÇNH TR├îNH ─É├â Sß║┤N S├ÇNG</div>
                  <h4>{{ activeCompletionQuote.title }}</h4>
                  <p>{{ activeCompletionQuote.desc }}</p>
                </div>
                <button class="acb-close" @click="hienCompletionBanner = false" title="─É├│ng banner">Γ£ò</button>
              </div>
            </transition>

            <!-- Thß║╗ tß╗òng quan kß║┐t quß║ú -->
            <div class="plan-summary-card">
              <div class="summary-meta">
                <div class="summary-top-tag">
                  <span class="plan-dest-badge">{{ lichTrinh.destination }}</span>
                  <span class="savings-badge">≡ƒÆí ─É├ú tß╗æi ╞░u tuyß║┐n ─æ╞░ß╗¥ng & chi ph├¡ tiß║┐t kiß╗çm</span>
                </div>
                <h2>H├ánh tr├¼nh {{ lichTrinh.daysList.length }} Ng├áy Tuyß╗çt Vß╗¥i</h2>
                <p class="summary-budget">Tß╗òng dß╗▒ to├ín: <strong>{{ dinhDangTien(lichTrinh.total_budget) }}─æ</strong> ({{ lichTrinh.people }} ng╞░ß╗¥i ┬╖ TB {{ dinhDangTien(Math.round(lichTrinh.total_budget / lichTrinh.people)) }}─æ/ng╞░ß╗¥i)</p>
                <!-- Personality Low Budget Callout in Plan Result -->
                <div v-if="lichTrinh.total_budget <= 500000" class="budget-humor-callout">
                  <span class="bhc-icon">{{ lichTrinh.total_budget <= 150000 ? '≡ƒÜ¿' : '≡ƒÆ╕' }}</span>
                  <span class="bhc-text">
                    {{ lichTrinh.total_budget <= 150000 ? 'Cß║únh b├ío v├¡ nguy hiß╗âm: Nhß╗¢ ngß║»m cß║únh miß╗àn ph├¡ v├á hß║ín chß║┐ nh├¼n menu nh├⌐!' : 'Du lß╗ïch tß╗æi giß║ún: Ch├║ng ta kh├┤ng ngh├¿o, ch├║ng ta ─æang du lß╗ïch phong c├ích tß╗æi giß║ún (tß║ím n├⌐ hß║úi sß║ún ≡ƒÿ¡)!' }}
                  </span>
                </div>
              </div>

              <!-- Thanh ph├ón bß╗ò ng├ón s├ích khoa hß╗ìc -->
              <div v-if="lichTrinh.budget_breakdown" class="budget-breakdown-row">
                <div class="bb-pill"><span>≡ƒÅ¿ Kh├ích sß║ín:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.hotel) }}─æ</b></div>
                <div class="bb-pill"><span>≡ƒì£ ─én uß╗æng:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.food) }}─æ</b></div>
                <div class="bb-pill"><span>≡ƒÜù Di chuyß╗ân:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.transportation) }}─æ</b></div>
                <div class="bb-pill"><span>≡ƒÄ½ V├⌐ & Check-in:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.tickets) }}─æ</b></div>
                <div class="bb-pill"><span>≡ƒ¢í∩╕Å Dß╗▒ ph├▓ng:</span> <b>{{ dinhDangTien(lichTrinh.budget_breakdown.reserve) }}─æ</b></div>
              </div>

              <div class="plan-tool-actions">
                <button class="tool-btn" @click="liveModeActive = !liveModeActive" title="Bß║¡t chß║┐ ─æß╗Ö theo d├╡i thß╗▒c tß║┐ chuyß║┐n ─æi" style="background: #10b981; color: white; border: none; font-weight: bold; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  ≡ƒÜÇ {{ liveModeActive ? 'Tß║»t Live Mode' : 'Bß║»t ─æß║ºu chuyß║┐n ─æi' }}
                </button>
                <button class="tool-btn ai-opt-highlight-btn" @click="toiUuCungDuongToanBo" title="Sß║»p xß║┐p to├án bß╗Ö ─æiß╗âm ─æß║┐n theo v├▓ng cung tß╗æi ╞░u di chuyß╗ân">
                  ΓÜí AI Tß╗æi ╞░u thß╗⌐ tß╗▒ ─æiß╗âm ─æß║┐n
                </button>
                <a
                  :href="googleMapsAllStopsUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="tool-btn gmap-all-stops-btn"
                  title="Mß╗ƒ to├án bß╗Ö lß╗Ö tr├¼nh tr├¬n Google Maps c├│ sß║╡n GPS dß║½n ─æ╞░ß╗¥ng li├¬n tß╗Ñc"
                >
                  ≡ƒù║∩╕Å Mß╗ƒ to├án bß╗Ö tr├¬n Google Maps Γåù
                </a>
                <button class="tool-btn zalo-share-btn" @click="moModalInfographic" title="Xuß║Ñt lß╗ïch tr├¼nh dß║íng thß║╗ Infographic ─æß╗â gß╗¡i nh├│m Zalo/Messenger">
                  ≡ƒô▒ Xuß║Ñt thß║╗ chia sß║╗ Zalo
                </button>
                <button class="tool-btn" @click="hienBillSplitter = true" title="T├¡nh tiß╗ün chia ─æß╗üu cho nh├│m">
                  ≡ƒÆ░ Chia tiß╗ün nh├│m
                </button>
                <button class="tool-btn" @click="hienTravelPass = true" title="Xuß║Ñt v├⌐ h├ánh tr├¼nh offline">
                  ≡ƒÄ½ Xuß║Ñt v├⌐ Offline
                </button>
                <button class="tool-btn rain-btn" @click="moModalTranhMua(0)" :disabled="dangDieuChinh" title="Tß╗▒ ─æß╗Öng ─æß╗òi ─æiß╗âm tham quan trong nh├á nß║┐u trß╗¥i m╞░a">
                  ≡ƒîº∩╕Å ─Éß╗òi lß╗ïch tr├ính m╞░a
                </button>
                <button class="tool-btn" @click="xuatPdf" title="In hoß║╖c l╞░u PDF">
                  ≡ƒôä L╞░u PDF
                </button>
              </div>
            </div>

            <!-- T├ôM Tß║«T PH╞»╞áNG ├üN XE KH├üCH Tß╗ÉI ╞»U CHI PH├ì -->
            <div v-if="(lichTrinh.transit_summary || formDuLieu.nhaXeDaChon) && !['xe m├íy', '├┤ t├┤'].includes((formDuLieu.phuongTien || '').toLowerCase())" class="trip-transit-summary-card">
              <div class="ttsc-main">
                <div class="ttsc-left">
                  <span class="ttsc-icon">≡ƒÜî</span>
                  <div>
                    <div class="ttsc-badge">PH╞»╞áNG ├üN XE KH├üCH Tß╗ÉI ╞»U DI CHUYß╗éN</div>
                    <h3>{{ formDuLieu.nhaXeDaChon ? formDuLieu.nhaXeDaChon.name : (lichTrinh.transit_summary?.selected_bus?.name || 'Nh├á xe khuy├¬n d├╣ng') }}</h3>
                    <p class="ttsc-meta">
                      <span>Loß║íi xe: <b>{{ formDuLieu.nhaXeDaChon ? formDuLieu.nhaXeDaChon.type : 'Gi╞░ß╗¥ng nß║▒m cao cß║Ñp' }}</b></span> ┬╖
                      <span>Tuyß║┐n: <b>{{ formDuLieu.diemKhoiHanh }} Γ₧ö {{ lichTrinh.destination || formDuLieu.diemDen }}</b></span> ┬╖
                      <span>Cß╗▒ ly: <b>~{{ (lichTrinh.transit_summary?.estimated_distance_km || transitRouteInfo.estimatedDistanceKm) }} km</b></span>
                    </p>
                    <p class="ttsc-schedule" v-if="formDuLieu.nhaXeDaChon">
                      ≡ƒòÆ Giß╗¥ chß║íy: <b>{{ formDuLieu.nhaXeDaChon.depart_times }}</b> ({{ formDuLieu.nhaXeDaChon.duration }}) ┬╖ ─É├│n: {{ formDuLieu.nhaXeDaChon.pickup }}
                    </p>
                  </div>
                </div>
                <div class="ttsc-right">
                  <div class="ttsc-price-block">
                    <span class="ttsc-label">Gi├í v├⌐:</span>
                    <strong class="ttsc-price">{{ dinhDangTien(formDuLieu.nhaXeDaChon?.price || 350000) }}─æ</strong>
                    <small>/v├⌐/ng╞░ß╗¥i</small>
                    <div class="ttsc-total-calc" v-if="formDuLieu.soNguoi > 1">
                      Tß╗òng {{ formDuLieu.soNguoi }} ng╞░ß╗¥i: <b>{{ dinhDangTien((formDuLieu.nhaXeDaChon?.price || 350000) * formDuLieu.soNguoi) }}─æ</b>
                    </div>
                  </div>
                  <div class="ttsc-actions-group" style="display: flex; gap: 8px; flex-direction: column; width: 100%;">
                    <a href="https://futabus.vn/" target="_blank" rel="noreferrer" class="ttsc-book-btn" style="background: var(--primary); color: white; padding: 10px 16px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s;">
                      ≡ƒÄ½ ─Éß║╖t v├⌐ Web/App
                    </a>
                    <a :href="`tel:${formDuLieu.nhaXeDaChon?.hotline || '19006067'}`" class="ttsc-call-btn" style="background: rgba(5, 150, 105, 0.1); color: var(--primary); padding: 10px 16px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--primary);">
                      ≡ƒô₧ Tß╗òng ─æ├ái: {{ formDuLieu.nhaXeDaChon?.hotline || '1900 6067' }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kh├ích sß║ín ─æß╗ü xuß║Ñt -->
            <div v-if="lichTrinh.hotel_recommendation" class="app-hotel-card">
              <div class="hotel-badge">≡ƒÅ¿ Gß╗óI ├¥ KH├üCH Sß║áN / RESORT NGHß╗ê D╞»ß╗áNG</div>
              <div class="hotel-main-info">
                <div>
                  <h3>{{ lichTrinh.hotel_recommendation.name }}</h3>
                  <p class="hotel-addr" v-if="lichTrinh.hotel_recommendation.address">≡ƒôì {{ lichTrinh.hotel_recommendation.address }}</p>
                  <p class="hotel-desc">{{ lichTrinh.hotel_recommendation.description }}</p>
                </div>
                <div class="hotel-side">
                  <span class="hotel-stars">Γÿà {{ lichTrinh.hotel_recommendation.rating || '4.8' }}</span>
                  <span class="hotel-price">{{ dinhDangTien(lichTrinh.hotel_recommendation.price_per_night || 850000) }}─æ<small>/─æ├¬m</small></span>
                  <a
                    class="hotel-maps-link"
                    :href="chiDuongUrl(lichTrinh.hotel_recommendation.name, lichTrinh.hotel_recommendation.address)"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ≡ƒù║∩╕Å Chß╗ë ─æ╞░ß╗¥ng tß╗¢i KS Γåù
                  </a>
                </div>
              </div>
            </div>

            <!-- Bß╗ÿ CHUYß╗éN ─Éß╗öI CHß║╛ ─Éß╗ÿ XEM (MAP VIEW TOGGLE - SEGMENTED CONTROL) -->
            <div class="itinerary-view-switcher" role="group" aria-label="Chß║┐ ─æß╗Ö xem lß╗ïch tr├¼nh">
              <button
                type="button"
                :class="['iv-btn', { active: itineraryViewMode === 'timeline' }]"
                @click="doiViewMode('timeline')"
                title="Chß╗ë xem danh s├ích chi tiß║┐t tß╗½ng ng├áy"
              >
                <svg class="iv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span>Dß║íng danh s├ích (Timeline View)</span>
              </button>

              <button
                type="button"
                :class="['iv-btn', { active: itineraryViewMode === 'split' }]"
                @click="doiViewMode('split')"
                title="Xem kß║┐t hß╗úp cß║ú bß║ún ─æß╗ô v├á d├▓ng thß╗¥i gian"
              >
                <svg class="iv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="12" y1="3" x2="12" y2="21"/>
                </svg>
                <span>Xem kß║┐t hß╗úp (Split View)</span>
              </button>

              <button
                type="button"
                :class="['iv-btn', { active: itineraryViewMode === 'map' }]"
                @click="doiViewMode('map')"
                title="Xem bß║ún ─æß╗ô to├án cß║únh mß╗ƒ rß╗Öng"
              >
                <svg class="iv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/>
                  <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                <span>Dß║íng bß║ún ─æß╗ô (Map View)</span>
              </button>
            </div>

            <!-- Bß╗É Cß╗ñC Lß╗èCH TR├îNH: SPLIT VIEW / TIMELINE / MAP EXPANDED -->
            <div :class="['itinerary-split-container', liveModeActive ? 'mode-split' : `mode-${itineraryViewMode}`]">
              <!-- Cß╗Öt Tr├íi: D├▓ng thß╗¥i gian tß╗½ng ng├áy (Timeline) (Hiß╗ân thß╗ï khi Timeline hoß║╖c Split View) -->
              <transition name="view-fade">
                <div v-show="itineraryViewMode !== 'map' && !liveModeActive" class="app-timeline-wrap">
                  <article
                    v-for="(day, dayIdx) in lichTrinh.daysList"
                    :key="day.day"
                    class="timeline-day-card"
                    :class="{ 'day-selected-highlight': selectedDay === day.day }"
                  >
                    <div class="day-header-pill">
                      <div class="dhp-left">
                        <span class="day-num">NG├ÇY {{ day.day }}</span>
                        <span class="day-activities-count">{{ day.activities.length }} hoß║ít ─æß╗Öng</span>
                      </div>
                      <div class="dhp-right">
                        <!-- N├║t Mß╗ƒ to├án bß╗Ö lß╗Ö tr├¼nh ng├áy tr├¬n Google Maps -->
                        <a
                          :href="taoLinkGoogleMapsChoNgay(day)"
                          target="_blank"
                          rel="noreferrer"
                          class="day-gmaps-route-btn"
                          title="Mß╗ƒ to├án bß╗Ö lß╗Ö tr├¼nh Ng├áy n├áy tr├¬n Google Maps dß║½n ─æ╞░ß╗¥ng li├¬n tß╗Ñc"
                        >
                          ≡ƒù║∩╕Å Lß╗Ö tr├¼nh cß║ú ng├áy Γåù
                        </a>

                        <button
                          type="button"
                          class="day-route-opt-btn"
                          @click.stop="toiUuCungDuongNgay(dayIdx)"
                          title="AI sß║»p xß║┐p lß║íi thß╗⌐ tß╗▒ ─æiß╗âm ─æß║┐n theo v├▓ng cung ─æß╗â kh├┤ng bß╗ï ─æi ng╞░ß╗úc ─æ╞░ß╗¥ng v├á tiß║┐t kiß╗çm x─âng xe"
                        >
                          ΓÜí AI Tß╗æi ╞░u thß╗⌐ tß╗▒
                        </button>
                      </div>
                    </div>

                    <!-- Th├┤ng b├ío kß║┐t quß║ú tß╗æi ╞░u thß╗⌐ tß╗▒ cung ─æ╞░ß╗¥ng -->
                    <div v-if="toiUuThanhCongDay === dayIdx" class="route-opt-toast-banner">
                      <span class="rotb-icon">≡ƒÄë</span>
                      <div class="rotb-content">
                        <strong>─É├ú tß╗æi ╞░u cung ─æ╞░ß╗¥ng Ng├áy {{ day.day }}!</strong>
                        <p>C├íc ─æiß╗âm ─æ╞░ß╗úc sß║»p xß║┐p theo v├▓ng cung li├¬n tß╗Ñc (Nearest Neighbor), giß║úm thiß╗âu tß╗æi ─æa ─æi z├¡c-zß║»c v├á quay ─æß║ºu xe.</p>
                      </div>
                    </div>

                    <!-- Cß║únh b├ío thß╗¥i tiß║┐t trß╗▒c tiß║┐p trong ng├áy (Weather-aware Planning) -->
                    <div v-if="getDayWeatherAlert(day.day)" class="day-weather-alert-card">
                      <div class="dwac-left">
                        <span class="dwac-icon">≡ƒîº∩╕Å</span>
                        <div class="dwac-text">
                          <strong>Cß║únh b├ío thß╗¥i tiß║┐t: {{ getDayWeatherAlert(day.day).desc }} (~{{ getDayWeatherAlert(day.day).temp }}┬░C)</strong>
                          <p>{{ getDayWeatherAlert(day.day).advice }}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="dwac-action-btn"
                        @click.stop="moModalTranhMua(dayIdx)"
                        title="Xem ph╞░╞íng ├ín chuyß╗ân c├íc hoß║ít ─æß╗Öng buß╗òi chiß╗üu sang kh├┤ng gian bß║úo t├áng/cafe trong nh├á"
                      >
                        ≡ƒöä Tß╗▒ ─æß╗Öng ─æß╗òi ─æiß╗âm trong nh├á
                      </button>
                    </div>

                    <div class="activities-stream">
                      <template
                        v-for="(act, actIndex) in day.activities"
                        :key="act.time + act.place + actIndex"
                      >
                        <!-- Thß║╗ Hoß║ít ─Éß╗Öng (Activity Row) -->
                        <div
                          :id="'activity-card-' + dayIdx + '-' + actIndex"
                          class="activity-row"
                          :class="{
                            'is-dragging': dangKeoDayIdx === dayIdx && dangKeoActIdx === actIndex,
                            'drag-target-over': dragOverDayIdx === dayIdx && dragOverActIdx === actIndex,
                            'is-hovered': hoveredActIndex === actIndex && selectedDay === day.day
                          }"
                          @mouseenter="hoverActivity(act, actIndex, day.day)"
                          @mouseleave="unhoverActivity(act, actIndex)"
                          @dragover.prevent="onDragOver($event, dayIdx, actIndex)"
                          @dragleave="onDragLeave($event, dayIdx, actIndex)"
                          @drop="onDrop($event, dayIdx, actIndex)"
                        >
                          <!-- Drag handle Γï«Γï« -->
                          <div
                            class="drag-handle"
                            draggable="true"
                            @dragstart="onDragStart($event, dayIdx, actIndex)"
                            @dragend="onDragEnd"
                            title="Cß║ºm v├á k├⌐o ─æß╗â ─æß╗òi thß╗⌐ tß╗▒ c├íc ─æiß╗âm trong ng├áy"
                          >
                            <span>Γï«Γï«</span>
                          </div>

                          <div class="activity-time-col">
                            <span class="activity-time">{{ act.time }}</span>
                            <div class="activity-bullet"></div>
                          </div>

                          <div class="activity-card-body">
                            <!-- Thumbnail ß║únh ─æß╗ïa ─æiß╗âm -->
                            <div class="act-thumbnail-box" @click="panToActivity(act)" title="Bß║Ñm ─æß╗â xem tr├¬n bß║ún ─æß╗ô">
                              <img
                                :src="getPlaceImage(act)"
                                :alt="act.place"
                                class="act-thumbnail-img"
                                loading="lazy"
                                @error="onImageError"
                              />
                              <span class="act-thumb-index-badge">#{{ actIndex + 1 }}</span>
                            </div>

                            <!-- Nß╗Öi dung chi tiß║┐t -->
                            <div class="act-main-content">
                              <div class="activity-top-line">
                                <div class="act-title-cluster">
                                  <span :class="['badge-type', getBadgeInfo(act).class]">
                                    {{ getBadgeInfo(act).icon }} {{ getBadgeInfo(act).label }}
                                  </span>
                                  <h4 class="place-name" :title="act.place" @click="panToActivity(act)">{{ act.place }}</h4>
                                </div>
                                <div class="act-actions-group">
                                  <!-- N├║t ─Éß╗òi Vß╗ï Tr├¡ (K├⌐o/Thß║ú ß║úo) -->
                                  <button @click.stop="moveActivity(day, actIndex, -1)" v-if="actIndex > 0" class="act-change-btn" title="Chuyß╗ân l├¬n" style="background:#f1f5f9; color:#475569; padding: 6px;">Γû▓</button>
                                  <button @click.stop="moveActivity(day, actIndex, 1)" v-if="actIndex < day.activities.length - 1" class="act-change-btn" title="Chuyß╗ân xuß╗æng" style="background:#f1f5f9; color:#475569; padding: 6px;">Γû╝</button>
                                  
                                  <button
                                    type="button"
                                    class="act-change-btn"
                                    @click.stop="moModalDoiDiaDiem(day.day - 1, actIndex, act.type)"
                                    title="─Éß╗òi sang ─æß╗ïa ─æiß╗âm kh├íc"
                                  >
                                    ≡ƒöä ─Éß╗òi ─æiß╗âm
                                  </button>
                                  <a
                                    class="act-direction-btn"
                                    :href="chiDuongUrl(act.place, act.address)"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Mß╗ƒ chß╗ë ─æ╞░ß╗¥ng Google Maps"
                                    @click.stop
                                  >
                                    ≡ƒù║∩╕Å Chß╗ë ─æ╞░ß╗¥ng Γåù
                                  </a>
                                  
                                  <!-- LIVE MODE: N├║t Check-in -->
                                  <button
                                    v-if="liveModeActive"
                                    type="button"
                                    @click.stop="xacNhanCheckIn(day.day - 1, actIndex, act)"
                                    style="background: #10b981; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;"
                                    title="Check-in v├á nhß║¡p chi ph├¡"
                                  >
                                    {{ completedActivities[`${day.day - 1}-${actIndex}`] ? 'Γå⌐ Hß╗ºy' : 'Γ£à ─É├ú tß╗¢i' }}
                                  </button>
                                </div>
                              </div>
                              
                              <!-- LIVE MODE: Hiß╗ân thß╗ï trß║íng th├íi ─æ├ú check-in -->
                              <div v-if="liveModeActive && completedActivities[`${day.day - 1}-${actIndex}`]" style="margin-top: 8px; padding: 10px; background: #ecfdf5; border: 1px dashed #34d399; border-radius: 8px; font-size: 0.9rem; color: #065f46; display: flex; align-items: center; justify-content: space-between;">
                                <span><strong style="color: #059669;">Ho├án th├ánh l├║c:</strong> {{ new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) }}</span>
                                <span><strong>Thß╗▒c chi:</strong> <span style="color: #dc2626;">{{ dinhDangTien(actualExpenses[`${day.day - 1}-${actIndex}`]) }}─æ</span></span>
                              </div>

                              <!-- Cß║únh b├ío xung ─æß╗Öt thß╗¥i gian mß╗ƒ cß╗¡a -->
                              <div v-if="act.time_conflict" class="act-time-conflict-card" style="background-color: #fffbeb; color: #b45309; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; display: flex; gap: 8px; align-items: center; margin-bottom: 12px; border: 1px solid #fde68a;">
                                <span style="font-size: 16px;">ΓÜá∩╕Å</span> {{ act.time_conflict_msg }}
                              </div>

                              <!-- Thß║╗ ETA dß╗▒ kiß║┐n thß╗¥i gian di chuyß╗ân tß╗½ vß╗ï tr├¡ hiß╗çn tß║íi tß╗¢i ─æiß╗âm ─æß║┐n -->
                              <div v-if="getTravelEstimate(act, day, actIndex)" class="act-travel-eta-card">
                                <div class="eta-card-left">
                                  <span class="eta-pulse-icon">≡ƒÜù</span>
                                  <div class="eta-content">
                                    <div class="eta-from-to">
                                      <span class="eta-origin">Tß╗½ <strong>{{ getTravelEstimate(act, day, actIndex).from }}</strong></span>
                                      <span class="eta-arrow">Γ₧ö</span>
                                      <span class="eta-dest">tß╗¢i ─æiß╗âm ─æß║┐n:</span>
                                    </div>
                                    <div class="eta-metrics-row">
                                      <span class="eta-pill eta-time">ΓÅ▒∩╕Å ─Éi khoß║úng <b>{{ getTravelEstimate(act, day, actIndex).duration }}</b></span>
                                      <span class="eta-pill eta-dist">≡ƒôì ~{{ getTravelEstimate(act, day, actIndex).distance }} km</span>
                                      <span class="eta-pill eta-mode" v-if="getTravelEstimate(act, day, actIndex).mode">≡ƒº¡ {{ getTravelEstimate(act, day, actIndex).mode }}</span>
                                      <span class="eta-pill eta-taxi" v-if="getTravelEstimate(act, day, actIndex).cost">≡ƒÜò Taxi: <b>{{ getTravelEstimate(act, day, actIndex).cost }}</b></span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- Thß║╗ tag / Badges th├┤ng tin thß╗▒c tß║┐ -->
                              <div class="act-meta-badges">
                                <span class="meta-tag-pill tag-rating">
                                  Γ¡É {{ act.rating || '4.7' }} <small>({{ act.review_count || '1.2k' }})</small>
                                </span>
                                <span class="meta-tag-pill tag-hours">
                                  ≡ƒòÆ {{ act.open_hours || getGioMoCua(act.type) }}
                                </span>
                                <span class="meta-tag-pill tag-dwell" v-if="act.dwell_time">
                                  ΓÅ│ L╞░u lß║íi: {{ act.dwell_time }}
                                </span>
                                <span class="meta-tag-pill tag-best-time" v-if="act.best_time">
                                  ≡ƒîà Khung giß╗¥: {{ act.best_time }}
                                </span>
                                <span class="meta-tag-pill tag-indoor" v-if="act.is_indoor === true">
                                  Γÿö C├│ m├íi che (Trong nh├á)
                                </span>
                                <span class="meta-tag-pill tag-outdoor" v-else-if="act.is_indoor === false">
                                  ΓÿÇ∩╕Å Ngo├ái trß╗¥i
                                </span>
                                <span class="meta-tag-pill tag-dress" v-if="act.dress_code">
                                  ≡ƒæù {{ act.dress_code }}
                                </span>
                                <span v-for="tag in (act.tags || []).slice(0, 1)" :key="tag" class="meta-tag-pill tag-theme">
                                  ≡ƒÅ╖∩╕Å {{ tag }}
                                </span>
                              </div>

                              <p v-if="act.address" class="act-address">≡ƒôì {{ act.address }}</p>
                              
                              <!-- M├┤ tß║ú gi├í trß╗ï thß╗▒c tß║┐ kh├┤ng rß║¡p khu├┤n -->
                              <p class="act-desc">{{ lamSachMoTa(act.activity, act) }}</p>

                              <div v-if="act.signature_dishes && act.signature_dishes.length > 0" class="act-signature-box">
                                <span class="asb-title">≡ƒì▓ M├│n phß║úi thß╗¡ (Signature):</span>
                                <span class="asb-dishes">{{ act.signature_dishes.join(', ') }}</span>
                              </div>

                              <div class="act-cost-box">
                                <span v-if="act.price_range">≡ƒÆ╡ Khoß║úng gi├í thß╗▒c tß║┐: <b>{{ act.price_range }}</b></span>
                                <span v-else-if="act.estimated_cost">≡ƒÆ╡ Chi ph├¡ dß╗▒ kiß║┐n: <b>{{ dinhDangTien(act.estimated_cost) }}─æ</b></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Transit Micro-UX Badge & UX Validation Warning (Nß║▒m giß╗»a 2 Activity Node) -->
                        <div
                          v-if="actIndex < day.activities.length - 1"
                          class="transit-micro-row"
                        >
                          <div class="transit-time-col"></div>
                          <div class="transit-line-col">
                            <div class="transit-track-line"></div>
                          </div>
                          <div class="transit-body-col">
                            <!-- Micro-UX Badge thß╗¥i gian & khoß║úng c├ích di chuyß╗ân -->
                            <div class="transit-pill-wrap">
                              <a
                                v-if="tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1])"
                                :href="tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).mapsUrl"
                                target="_blank"
                                rel="noreferrer"
                                class="transit-badge"
                                :title="`Xem lß╗Ö tr├¼nh ${tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).labelPhuongTien} tr├¬n Google Maps`"
                              >
                                <span class="transit-icon">{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).phuongTien }}</span>
                                <span class="transit-info">
                                  <b>{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).phut }} ph├║t</b>
                                  <span class="dot-sep">┬╖</span>
                                  <span>{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).distKm }} km</span>
                                </span>
                                <span class="transit-arrow">Γåù</span>
                              </a>
                            </div>

                            <!-- Cß║únh b├ío xung ─æß╗Öt thß╗¥i gian hoß║╖c qu├úng ─æ╞░ß╗¥ng xa (Warning Color Palette) -->
                            <div
                              v-if="tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1])?.canhBao"
                              :class="['transit-warning-alert', tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.type]"
                              role="alert"
                            >
                              <span class="twa-icon">{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.icon }}</span>
                              <div class="twa-content">
                                <strong>{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.title }}</strong>
                                <p>{{ tinhKhoangCachVaThoiGian(act, day.activities[actIndex + 1]).canhBao.desc }}</p>
                              </div>
                              <button
                                type="button"
                                class="twa-action-btn"
                                @click="moModalDoiDiaDiem(day.day - 1, actIndex + 1, day.activities[actIndex + 1].type)"
                                title="─Éß╗òi ─æß╗ïa ─æiß╗âm tiß║┐p theo ─æß╗â tß╗æi ╞░u tuyß║┐n"
                              >
                                ≡ƒöä ─Éß╗òi ─æiß╗âm
                              </button>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </article>
                </div>
              </transition>

              <!-- M├ÇN H├îNH LIVE MODE B├èN TR├üI -->
              <transition name="view-fade">
                <div v-if="liveModeActive" class="live-tracker-sidebar" style="width: 100%; display: flex; flex-direction: column; gap: 16px; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.1); overflow-y: auto; z-index: 10;">
                  <div v-if="currentLiveActivity" style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 16px; position: relative; overflow: hidden;">
                      <div style="position: absolute; top: -20px; right: -20px; opacity: 0.1; font-size: 100px;">≡ƒÄ»</div>
                      <h3 style="font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; opacity: 0.9; display: flex; align-items: center; justify-content: space-between;">
                        <span>─Éiß╗âm ─æß║┐n tiß║┐p theo</span>
                        <span style="background: rgba(255,255,255,0.25); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 700;">{{ currentLiveActivity.globalIndex }} / {{ currentLiveActivity.totalActivities }}</span>
                      </h3>
                      <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; line-height: 1.2;">{{ currentLiveActivity.act.place }}</h2>
                      <p style="font-size: 1.05rem; opacity: 0.95; margin-bottom: 16px;">{{ currentLiveActivity.act.activity }}</p>
                      
                      <div style="display: flex; gap: 12px; align-items: center; background: rgba(255,255,255,0.2); padding: 10px 16px; border-radius: 8px; font-weight: 600;">
                        <span>≡ƒòÆ Dß╗▒ kiß║┐n: {{ currentLiveActivity.act.time }}</span>
                      </div>
                    </div>

                    <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
                      <h4 style="color: #64748b; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 8px;">Th├┤ng tin hß╗»u ├¡ch</h4>
                      <ul style="list-style: none; padding: 0; margin: 0; color: #334155; font-size: 0.95rem; line-height: 1.6;">
                        <li v-if="currentLiveActivity.act.price_range">≡ƒÆ╡ Gi├í tham khß║úo: <b>{{ currentLiveActivity.act.price_range }}</b></li>
                        <li v-else-if="currentLiveActivity.act.estimated_cost">≡ƒÆ╡ Dß╗▒ kiß║┐n chi: <b>{{ dinhDangTien(currentLiveActivity.act.estimated_cost) }}─æ</b></li>
                        <li v-if="currentLiveActivity.act.address">≡ƒôì ─Éß╗ïa chß╗ë: {{ currentLiveActivity.act.address }}</li>
                      </ul>
                    </div>

                    <button @click="xacNhanCheckIn(currentLiveActivity.dayIndex, currentLiveActivity.actIndex, currentLiveActivity.act)" style="background: #10b981; color: white; border: none; padding: 18px; border-radius: 12px; font-size: 1.2rem; font-weight: 800; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 10px;">
                      Γ£à ─É├â Tß╗ÜI N╞áI / CHECK-IN
                    </button>
                    
                    <a :href="chiDuongUrl(currentLiveActivity.act.place, currentLiveActivity.act.address)" target="_blank" rel="noreferrer" style="background: white; color: #0284c7; border: 2px solid #0284c7; padding: 14px; border-radius: 12px; font-size: 1rem; font-weight: 700; text-align: center; text-decoration: none; display: block;">
                      ≡ƒù║∩╕Å Chß╗ë ─æ╞░ß╗¥ng Google Maps
                    </a>
                  </div>
                  <div v-else style="text-align: center; padding: 40px 20px; color: #10b981;">
                    <div style="font-size: 4rem; margin-bottom: 16px;">≡ƒÄë</div>
                    <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 8px;">CH├ÜC Mß╗¬NG!</h2>
                    <p>Bß║ín ─æ├ú ho├án th├ánh to├án bß╗Ö lß╗ïch tr├¼nh chuyß║┐n ─æi. Thß║¡t tuyß╗çt vß╗¥i!</p>
                  </div>
                </div>
              </transition>

              <!-- Cß╗Öt Phß║úi: Bß║ún ─æß╗ô cß╗æ ─æß╗ïnh Sticky (Hiß╗ân thß╗ï khi Split hoß║╖c Map View) -->
              <transition name="view-fade">
                <div
                  v-show="itineraryViewMode !== 'timeline'"
                  :class="['app-map-box', { 'map-expanded': itineraryViewMode === 'map' }]"
                >
                  <div class="sticky-map-inner">
                    <div class="map-header">
                      <div class="map-title-row">
                        <h4>Bß║ún ─æß╗ô h├ánh tr├¼nh</h4>
                        <span v-if="itineraryViewMode === 'map'" class="map-badge-expanded">To├án cß║únh vß╗ç tinh</span>
                        <span v-else class="map-live-hint">≡ƒôî Tuyß║┐n ─æ╞░ß╗¥ng nß╗æi tß╗▒ ─æß╗Öng & r├¬ chuß╗Öt ─æß╗â xem</span>
                      </div>
                      <div class="day-switcher-pills">
                        <button
                          v-for="day in lichTrinh.daysList"
                          :key="day.day"
                          :class="['day-pill', { active: selectedDay === day.day }]"
                          @click="selectedDay = day.day"
                        >
                          Ng├áy {{ day.day }}
                        </button>
                      </div>
                    </div>
                    <div id="routing-map" class="app-map-iframe" style="z-index: 1;"></div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </section>


        <!-- ==================== TAB 3: CHUYß║╛N ─ÉI Cß╗ªA T├öI (MY TRIPS) ==================== -->
        <section v-if="activeTab === 'mytrips'" class="tab-pane">
          <div class="pane-header">
            <div>
              <span class="sub-heading">Lß╗èCH Sß╗¼ CHUYß║╛N ─ÉI</span>
              <h2>Chuyß║┐n ─æi ─æ├ú l╞░u</h2>
            </div>
            <button class="app-primary-btn small-btn" @click="startPlannerTransition">+ Tß║ío chuyß║┐n mß╗¢i</button>
          </div>

          <div v-if="!nguoiDung" class="auth-prompt-card">
            <span class="prompt-icon">≡ƒöÆ</span>
            <h3>─É─âng nhß║¡p ─æß╗â xem c├íc chuyß║┐n ─æi ─æ├ú l╞░u</h3>
            <p>Lß╗ïch tr├¼nh du lß╗ïch ─æ╞░ß╗úc ─æß╗ông bß╗Ö v├á l╞░u an to├án tr├¬n ─æ├ím m├óy ─æß╗â bß║ín xem lß║íi bß║Ñt cß╗⌐ l├║c n├áo.</p>
            <button class="app-primary-btn" @click="hienAuthModal = true">─É─âng nhß║¡p / ─É─âng k├╜</button>
          </div>

          <div v-else-if="myTripsList.length" class="my-trips-grid">
            <article v-for="trip in myTripsList" :key="trip._id" class="my-trip-card">
              <div class="trip-top">
                <span class="trip-dest">{{ trip.destination }}</span>
                <span class="trip-date">{{ dinhDangNgayNgan(trip.created_at) }}</span>
              </div>
              <h3>Chuyß║┐n ─æi {{ trip.days?.length || 0 }} ng├áy tß║íi {{ trip.destination }}</h3>
              <p>Dß╗▒ to├ín: <b>{{ dinhDangTien(trip.total_budget) }}─æ</b> ┬╖ {{ trip.people || 1 }} ng╞░ß╗¥i</p>
              <div class="trip-actions">
                <button class="open-trip-btn" @click="moLaiLichTrinh(trip)">Xem chi tiß║┐t Γåù</button>
                <button class="share-trip-btn" @click="chiaSeChuyenDi(trip)">≡ƒöù Chia sß║╗</button>
                <button
                  class="delete-trip-btn"
                  @click="xoaChuyenDi(trip)"
                  title="X├│a chuyß║┐n ─æi n├áy"
                >
                  ≡ƒùæ∩╕Å
                </button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state-box">
            <span class="empty-icon">≡ƒº│</span>
            <h3>Bß║ín ch╞░a l╞░u chuyß║┐n ─æi n├áo</h3>
            <p>H├úy tß║ío lß╗ïch tr├¼nh ─æß║ºu ti├¬n ─æß╗â bß║»t ─æß║ºu h├ánh tr├¼nh kh├ím ph├í Miß╗ün Trung.</p>
            <button class="app-primary-btn" @click="activeTab = 'planner'">L├¬n lß╗ïch ngay</button>
          </div>
        </section>


        <!-- ==================== TAB 5: T├ÇI KHOß║óN & Y├èU TH├ìCH (PROFILE) ==================== -->
        <section v-if="activeTab === 'profile'" class="tab-pane">
          <!-- Nß║┐u ─æ├ú ─æ─âng nhß║¡p -->
          <div v-if="nguoiDung" class="profile-card-premium">
            <div class="profile-cover">
              <button class="edit-profile-btn" @click="editProfile" v-if="!editProfileMode">
                Γ£Å∩╕Å Chß╗ënh sß╗¡a hß╗ô s╞í
              </button>
            </div>
            <div class="profile-avatar-premium">
              <img v-if="nguoiDung.avatar" :src="nguoiDung.avatar" alt="Avatar" class="avatar-img" />
              <div v-else class="avatar-placeholder">{{ nguoiDung.name ? nguoiDung.name[0].toUpperCase() : 'U' }}</div>
              
              <div class="level-badge" :style="{ backgroundColor: userLevelInfo.color }" :title="`Ho├án th├ánh ${nguoiDung.completed_trips || 0} chuyß║┐n ─æi`">
                {{ userLevelInfo.icon }} {{ userLevelInfo.title }}
              </div>
            </div>
            
            <div class="profile-info-premium" v-if="!editProfileMode">
              <h3 class="profile-name">{{ nguoiDung.name }} <span v-if="nguoiDung.role === 'admin'" class="admin-badge">Admin</span></h3>
              <p class="profile-email">{{ nguoiDung.email }}</p>
              <p class="profile-bio" v-if="nguoiDung.bio">"{{ nguoiDung.bio }}"</p>
              
              <div class="profile-stats-grid">
                <div class="stat-box-premium">
                  <div class="stat-icon">≡ƒù║∩╕Å</div>
                  <strong>{{ myTripsList.length }}</strong>
                  <small>─É├ú l├¬n lß╗ïch</small>
                </div>
                <div class="stat-box-premium">
                  <div class="stat-icon">Γ£à</div>
                  <strong>{{ nguoiDung.completed_trips || 0 }}</strong>
                  <small>Ho├án th├ánh</small>
                </div>
                <div class="stat-box-premium">
                  <div class="stat-icon">Γ¥ñ∩╕Å</div>
                  <strong>{{ favoritesList.length }}</strong>
                  <small>Y├¬u th├¡ch</small>
                </div>
                <div class="stat-box-premium">
                  <div class="stat-icon">≡ƒÅå</div>
                  <strong>{{ nguoiDung.points || 0 }}</strong>
                  <small>─Éiß╗âm sß╗æ</small>
                </div>
              </div>
              <button class="logout-btn-premium" @click="dangXuat">─É─âng xuß║Ñt</button>
            </div>
            
            <div class="profile-edit-form" v-else>
              <h3>Chß╗ënh sß╗¡a hß╗ô s╞í</h3>
              <div class="edit-field">
                <label>T├¬n hiß╗ân thß╗ï</label>
                <input type="text" v-model="profileForm.name" class="app-input" />
              </div>
              <div class="edit-field">
                <label>ß║ónh ─æß║íi diß╗çn (Tß║úi l├¬n tß╗½ thiß║┐t bß╗ï)</label>
                <input type="file" accept="image/*" @change="handleAvatarUpload" class="app-input" style="padding: 8px;" />
                <div v-if="profileForm.avatar && profileForm.avatar.startsWith('data:image')" style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                   <img :src="profileForm.avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #10b981;" />
                   <span style="font-size: 0.85rem; color: #10b981; font-weight: 600;">─É├ú ─æ├¡nh k├¿m ß║únh mß╗¢i</span>
                </div>
              </div>
              <div class="edit-field">
                <label>Giß╗¢i thiß╗çu bß║ún th├ón</label>
                <textarea v-model="profileForm.bio" class="app-input" rows="3" placeholder="Sß╗ƒ th├¡ch du lß╗ïch cß╗ºa bß║ín l├á g├¼?"></textarea>
              </div>
              <div class="edit-actions">
                <button class="cancel-edit-btn" @click="editProfileMode = false">Hß╗ºy</button>
                <button class="save-edit-btn" @click="saveProfile">≡ƒÆ╛ L╞░u thay ─æß╗òi</button>
              </div>
            </div>
          </div>

          <!-- Nß║┐u ch╞░a ─æ─âng nhß║¡p -->
          <div v-else class="auth-card" style="text-align: center; padding: 40px 20px;">
            <h2 style="margin-bottom: 12px;">Bß║ín ch╞░a ─æ─âng nhß║¡p</h2>
            <p style="color: var(--text-sub); margin-bottom: 24px;">H├úy ─æ─âng nhß║¡p ─æß╗â l╞░u trß╗» chuyß║┐n ─æi v├á quß║ún l├╜ t├ái khoß║ún nh├⌐!</p>
            <button class="app-primary-btn" style="max-width: 250px; margin: 0 auto;" @click="hienAuthModal = true">
              ─É─âng nhß║¡p / ─É─âng k├╜
            </button>
          </div>

          <!-- Danh s├ích ─Éß╗ïa ─æiß╗âm y├¬u th├¡ch -->
          <div v-if="nguoiDung && favoritesList.length" class="favorites-section">
            <h3>─Éß╗ïa ─æiß╗âm ─æ├ú l╞░u y├¬u th├¡ch ({{ favoritesList.length }})</h3>
            <div class="places-app-grid">
              <article v-for="place in favoritesList" :key="place._id" class="app-place-card" v-reveal>
                <div class="place-card-top">
                  <span class="place-card-type">{{ getPlaceTypeLabel(place.type) }}</span>
                  <button class="heart-action-btn active" @click="doiYeuThich(place._id)">ΓÖÑ</button>
                </div>
                <h4>{{ place.name }}</h4>
                <p class="place-card-desc">{{ place.description }}</p>
                <p class="place-card-address" v-if="place.address">≡ƒôì {{ place.address }}</p>
                <div class="place-card-bottom">
                  <a class="place-maps-btn" :href="chiDuongUrl(place.name, place.address)" target="_blank">≡ƒù║∩╕Å Chß╗ë ─æ╞░ß╗¥ng</a>
                </div>
              </article>
            </div>
          </div>
        </section>

      </main>


    </div>


    <!-- ==================== POPUP MODAL X├üC NHß║¼N CHECK-IN ==================== -->
    <transition name="fade">
      <div v-if="hienModalCheckIn" class="modal-overlay" @click.self="hienModalCheckIn = false" style="z-index: 1000;">
        <div class="modal-card" style="max-width: 400px; padding: 24px; text-align: center; border-radius: 16px;">
          <div style="font-size: 3rem; margin-bottom: 16px;">≡ƒÄë</div>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Ch├║c mß╗½ng bß║ín ─æ├ú ─æß║┐n n╞íi!</h3>
          <p style="color: #64748b; font-size: 1.1rem; font-weight: 600; margin-bottom: 24px;">{{ checkInTempData?.place }}</p>
          
          <div style="text-align: left; margin-bottom: 24px;">
            <label style="display: block; font-size: 0.95rem; color: #475569; font-weight: 600; margin-bottom: 8px;">Chi ph├¡ bß║ín ─æ├ú ti├¬u ß╗ƒ ─æ├óy l├á bao nhi├¬u? (VND)</label>
            <input type="number" v-model="checkInTempCost" class="app-input" placeholder="0" style="width: 100%; font-size: 1.1rem; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1;" @keyup.enter="luuCheckIn">
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button @click="hienModalCheckIn = false" style="flex: 1; padding: 12px; border-radius: 8px; font-weight: 600; border: 1px solid #cbd5e1; background: white; color: #64748b; cursor: pointer;">─Éß╗â sau</button>
            <button @click="luuCheckIn" style="flex: 2; padding: 12px; border-radius: 8px; font-weight: 700; border: none; background: #10b981; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">Ho├án th├ánh</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ==================== POPUP MODAL ─É─éNG NHß║¼P NHANH ==================== -->
    <transition name="auth-fade">
      <div v-if="hienAuthModal" class="modal-overlay auth-overlay-glass" @click.self="hienAuthModal = false">
        <div class="modal-card auth-card-glass">
        <div class="modal-header">
          <h3>{{ dangKyMode ? '─É─âng K├╜ T├ái Khoß║ún' : '─É─âng Nhß║¡p' }}</h3>
          <button class="close-modal-btn" @click="hienAuthModal = false">Γ£ò</button>
        </div>
        <div class="auth-tabs">
          <button :class="['auth-tab', { active: !dangKyMode }]" @click="dangKyMode = false">─É─âng nhß║¡p</button>
          <button :class="['auth-tab', { active: dangKyMode }]" @click="dangKyMode = true">─É─âng k├╜</button>
        </div>
        <form class="auth-form-body" @submit.prevent="dangNhapHoacDangKy">
          <div v-if="dangKyMode" class="app-field">
            <label>Hß╗ì v├á t├¬n</label>
            <input v-model="authForm.name" class="app-input" placeholder="Nguyß╗àn V─ân A" required />
          </div>
          <div class="app-field">
            <label>Email</label>
            <input v-model="authForm.email" type="text" class="app-input" placeholder="name@example.com" required />
          </div>
          <div class="app-field">
            <label>Mß║¡t khß║⌐u</label>
            <input v-model="authForm.password" type="password" class="app-input" placeholder="Tß╗æi thiß╗âu 6 k├╜ tß╗▒" required />
          </div>
          <p v-if="authError" class="auth-error-msg">{{ authError }}</p>
          <button type="submit" class="app-primary-btn auth-submit-btn">
            {{ dangKyMode ? 'Tß║ío t├ái khoß║ún' : '─É─âng nhß║¡p' }}
          </button>
        </form>
      </div>
    </div>
    </transition>


    <!-- ==================== POPUP MODAL CHIA TIß╗ÇN NH├ôM (BILL SPLITTER) ==================== -->
    <div v-if="hienBillSplitter" class="modal-overlay" @click.self="hienBillSplitter = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>≡ƒÆ╕ T├¡nh Tiß╗ün Chia ─Éß╗üu Cho Nh├│m</h3>
          <button class="close-modal-btn" @click="hienBillSplitter = false">Γ£ò</button>
        </div>
        <div class="splitter-body">
          <div class="app-field">
            <label>Tß╗òng chi ph├¡ chuyß║┐n ─æi (VND)</label>
            <input type="number" v-model.number="splitterTongTien" class="app-input" />
          </div>
          <div class="app-field">
            <label>Sß╗æ th├ánh vi├¬n trong nh├│m</label>
            <div class="stepper-input">
              <button type="button" @click="splitterSoNguoi = Math.max(1, splitterSoNguoi - 1)">-</button>
              <span>{{ splitterSoNguoi }} ng╞░ß╗¥i</span>
              <button type="button" @click="splitterSoNguoi++">+</button>
            </div>
          </div>
          <div class="splitter-result-box">
            <small>Mß╗ûI TH├ÇNH VI├èN Cß║ªN ─É├ôNG:</small>
            <strong>{{ dinhDangTien(Math.round(splitterTongTien / Math.max(1, splitterSoNguoi))) }}─æ</strong>
            <p>─É├ú t├¡nh to├ín chia ─æß╗üu tr├¬n tß╗òng sß╗æ {{ splitterSoNguoi }} ng╞░ß╗¥i tham gia chuyß║┐n ─æi.</p>
          </div>
        </div>
      </div>
    </div>


    <!-- ==================== POPUP MODAL XUß║ñT V├ë H├ÇNH TR├îNH OFFLINE (TRAVEL PASS) ==================== -->
    <div v-if="hienTravelPass && lichTrinh" class="modal-overlay" @click.self="hienTravelPass = false">
      <div class="modal-card travel-pass-card">
        <div class="modal-header">
          <h3>≡ƒÄ½ Thß║╗ V├⌐ H├ánh Tr├¼nh Du Lß╗ïch</h3>
          <button class="close-modal-btn" @click="hienTravelPass = false">Γ£ò</button>
        </div>
        <div class="boarding-pass">
          <div class="pass-header">
            <span class="pass-logo"><img src="/logo.png" alt="Logo" class="pass-mini-logo" /> Travel Trips PASS</span>
            <span class="pass-dest">{{ lichTrinh.destination }}</span>
          </div>
          <div class="pass-body">
            <div class="pass-row">
              <div><small>THß╗£I GIAN</small><b>{{ lichTrinh.daysList.length }} Ng├áy</b></div>
              <div><small>Sß╗É KH├üCH</small><b>{{ lichTrinh.people }} Ng╞░ß╗¥i</b></div>
              <div><small>NG├éN S├üCH</small><b>{{ dinhDangTien(lichTrinh.total_budget) }}─æ</b></div>
            </div>
            <div class="pass-hotel" v-if="lichTrinh.hotel_recommendation">
              <small>KH├üCH Sß║áN NGHß╗ê D╞»ß╗áNG</small>
              <b>{{ lichTrinh.hotel_recommendation.name }}</b>
              <p>{{ lichTrinh.hotel_recommendation.address }}</p>
            </div>
            <div class="pass-qr-sim">
              <div class="qr-mockup">QR CODE OFFLINE PASS</div>
              <small>Chß╗Ñp m├án h├¼nh thß║╗ v├⌐ ─æß╗â sß╗¡ dß╗Ñng khi mß║Ñt s├│ng 4G</small>
            </div>
          </div>
        </div>
        <button class="app-primary-btn" @click="xuatPdf">In / L╞░u PDF Thß║╗ V├⌐</button>
      </div>
    </div>

    <!-- ==================== POPUP MODAL ─Éß╗öI ─Éß╗èA ─ÉIß╗éM ==================== -->
    <div v-if="showChangePlaceModal" class="modal-overlay" @click.self="showChangePlaceModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>≡ƒöä Chß╗ìn ─æß╗ïa ─æiß╗âm thay thß║┐</h3>
          <button class="close-modal-btn" @click="showChangePlaceModal = false">Γ£ò</button>
        </div>
        <div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding: 15px;">
          <div v-if="alternativePlaces.length === 0" style="text-align:center; padding: 20px; color: #666;">
            Kh├┤ng c├│ ─æß╗ïa ─æiß╗âm thay thß║┐ n├áo ph├╣ hß╗úp.
          </div>
          <div class="places-app-grid" style="grid-template-columns: 1fr;">
            <article v-for="p in alternativePlaces" :key="p._id" class="app-place-card" style="cursor: pointer;" @click="chonDiaDiemMoi(p)">
              <div class="place-card-top">
                <span class="place-card-type">{{ getPlaceTypeLabel(p.type) }}</span>
                <span class="hotel-price" v-if="p.estimated_cost">{{ dinhDangTien(p.estimated_cost) }}─æ</span>
              </div>
              <h4>{{ p.name }}</h4>
              <p class="place-card-desc">{{ p.description }}</p>
              <p class="place-card-address" v-if="p.address">≡ƒôì {{ p.address }}</p>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP MODAL ─Éß╗öI Lß╗èCH TR├üNH M╞»A ==================== -->
    <div v-if="showRainModal" class="modal-overlay" @click.self="showRainModal = false">
      <div class="rain-modal-card">
        <div class="rmc-header">
          <div class="rmc-icon-badge">≡ƒîº∩╕Å</div>
          <div>
            <h3>─Éß╗òi Lß╗ïch Tr├ính M╞░a Th├┤ng Minh</h3>
            <p class="rmc-sub">Trß╗ú l├╜ AI tß╗▒ ─æß╗Öng tß╗æi ╞░u chuyß║┐n ─æi theo dß╗▒ b├ío thß╗¥i tiß║┐t</p>
          </div>
          <button class="close-modal-btn" @click="showRainModal = false">Γ£ò</button>
        </div>
        <div class="rmc-body">
          <div class="rmc-weather-alert-box">
            <span class="rmc-wa-icon">Γ¢à Γ₧ö ≡ƒîº∩╕Å</span>
            <div class="rmc-wa-content">
              <strong>Dß╗▒ b├ío {{ lichTrinh?.destination || formDuLieu.diemDen }} chiß╗üu mai c├│ m╞░a l├║c 15:00</strong>
              <p>Khß║ú n─âng m╞░a r├áo 75%, gi├│ nhß║╣, nhiß╗çt ─æß╗Ö ~26┬░C. AI ─æ├ú chuß║⌐n bß╗ï ph╞░╞íng ├ín ho├ín ─æß╗òi ─æiß╗âm ngo├ái trß╗¥i sang buß╗òi s├íng v├á chß╗ìn cafe/bß║úo t├áng trong nh├á l├║c 15:30.</p>
            </div>
          </div>

          <div class="rmc-ai-proposal">
            <div class="rmc-proposal-title">
              <span>≡ƒñû ─Éß╗ÉI CHIß║╛U Lß╗èCH TR├îNH (PREVIEW):</span>
            </div>
            <div class="diff-preview-box" style="background: rgba(128,128,128,0.05); padding: 16px; border-radius: 8px; margin-top: 12px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border-color);">
              <div class="diff-old" style="background: #fee2e2; padding: 12px; border-radius: 6px;">
                <div class="diff-label" style="color: #b91c1c; font-weight: 700; font-size: 13px; margin-bottom: 4px;">Γ¥î Lß╗ïch c┼⌐ (Ngo├ái trß╗¥i)</div>
                <div class="diff-content" style="color: #7f1d1d; text-decoration: line-through; font-size: 14px;" v-for="p in rainModalOldPlaces" :key="p">{{ p }}</div>
                <div v-if="rainModalOldPlaces.length === 0" style="font-size: 13px; color: #7f1d1d;">Kh├┤ng c├│ ─æiß╗âm n├áo v├áo chiß╗üu nay cß║ºn ─æß╗òi.</div>
              </div>
              
              <div class="diff-arrow" style="text-align: center; font-size: 20px;">Γ¼ç∩╕Å Tß╗▒ ─æß╗Öng ─æß╗òi th├ánh</div>
              
              <div class="diff-new" style="background: #d1fae5; padding: 12px; border-radius: 6px;">
                <div class="diff-label" style="color: #047857; font-weight: 700; font-size: 13px; margin-bottom: 4px;">Γ£à Lß╗ïch mß╗¢i (Trong nh├á)</div>
                <div class="diff-content" style="color: #064e3b; font-weight: 600; font-size: 14px;" v-for="p in rainModalNewPlaces" :key="p">{{ p }}</div>
                <div v-if="rainModalNewPlaces.length === 0" style="font-size: 13px; color: #064e3b;">Vß║½n giß╗» nguy├¬n lß╗ïch tr├¼nh.</div>
              </div>
            </div>
          </div>
        </div>
        <div class="rmc-footer">
          <button
            type="button"
            class="app-primary-btn rmc-confirm-btn"
            :disabled="dangDieuChinh"
            @click="xacNhanDoiLichTranhMua"
          >
            <span v-if="dangDieuChinh" class="btn-spinner"></span>
            <span>{{ dangDieuChinh ? '─Éang ─æiß╗üu chß╗ënh...' : '├üp dß╗Ñng thay ─æß╗òi n├áy' }}</span>
          </button>
          <button type="button" class="app-secondary-btn" @click="showRainModal = false" style="background: transparent; color: var(--text-sub);">
            Vß║½n giß╗» nguy├¬n lß╗ïch c┼⌐
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== POPUP MODAL THß║║ INFOGRAPHIC CHIA Sß║║ ZALO ==================== -->
    <div v-if="hienModalInfographic && lichTrinh" class="modal-overlay" @click.self="hienModalInfographic = false">
      <div class="modal-card infographic-share-card">
        <div class="modal-header">
          <div class="m-head-title">
            <span class="m-head-icon">≡ƒô▒</span>
            <h3>Thß║╗ Lß╗ïch Tr├¼nh Infographic (Zalo / Messenger)</h3>
          </div>
          <button class="close-modal-btn" @click="hienModalInfographic = false">Γ£ò</button>
        </div>

        <div class="infographic-scroll-wrap">
          <!-- Bß╗ü mß║╖t Thß║╗ Infographic c├│ thß╗â chß╗Ñp ß║únh/copy -->
          <div class="infographic-poster" id="infographic-poster-target">
            <!-- Header Poster -->
            <div class="ip-header">
              <span class="ip-tag">≡ƒî┤ AI TRAVEL TRIPS ┬╖ MIß╗ÇN TRUNG VIß╗åT NAM</span>
              <h2 class="ip-title">Kß║╛ HOß║áCH DU Lß╗èCH {{ (lichTrinh.destination || formDuLieu.diemDen).toUpperCase() }}</h2>
              <div class="ip-meta-strip">
                <span>ΓÅ▒∩╕Å {{ lichTrinh.daysList.length }} Ng├áy</span>
                <span>≡ƒæÑ {{ lichTrinh.people || formDuLieu.soNguoi }} Kh├ích</span>
                <span>≡ƒÆ░ {{ dinhDangTien(lichTrinh.total_budget) }}─æ</span>
              </div>
            </div>

            <!-- Khß╗æi Nh├á xe & Kh├ích sß║ín ─æ├ú chß╗ìn -->
            <div class="ip-highlight-box" v-if="formDuLieu.nhaXeDaChon || lichTrinh.hotel_recommendation">
              <div v-if="formDuLieu.nhaXeDaChon" class="ip-hl-row">
                <span class="ip-hl-icon">≡ƒÜî</span>
                <div>
                  <strong>{{ formDuLieu.nhaXeDaChon.name }} ({{ formDuLieu.nhaXeDaChon.type }})</strong>
                  <small>{{ formDuLieu.diemKhoiHanh }} Γ₧ö {{ lichTrinh.destination || formDuLieu.diemDen }} ┬╖ Hotline: {{ formDuLieu.nhaXeDaChon.hotline }}</small>
                </div>
              </div>
              <div v-if="lichTrinh.hotel_recommendation" class="ip-hl-row">
                <span class="ip-hl-icon">≡ƒÅ¿</span>
                <div>
                  <strong>{{ lichTrinh.hotel_recommendation.name }}</strong>
                  <small>{{ lichTrinh.hotel_recommendation.address || 'Khu vß╗▒c trung t├óm' }}</small>
                </div>
              </div>
            </div>

            <!-- T├│m tß║»t lß╗ïch tr├¼nh tß╗½ng ng├áy -->
            <div class="ip-days-list">
              <div v-for="day in lichTrinh.daysList" :key="day.day" class="ip-day-block">
                <div class="ip-day-title">≡ƒôà NG├ÇY {{ day.day }}</div>
                <div class="ip-activities-list">
                  <div v-for="act in day.activities" :key="act.time + act.place" class="ip-act-item">
                    <span class="ip-act-time">{{ act.time }}</span>
                    <span class="ip-act-place"><b>{{ act.place }}</b>: {{ act.activity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Poster -->
            <div class="ip-footer">
              <div class="ip-footer-left">
                <small>Bß║ún quyß╗ün thuß╗Öc Trß╗ú l├╜ Du lß╗ïch Miß╗ün Trung AI</small>
                <span>≡ƒù║∩╕Å GPS Google Maps: ─É├ú tß║ío tuyß║┐n ─æ╞░ß╗¥ng tß╗▒ ─æß╗Öng</span>
              </div>
              <div class="ip-watermark">TRAVEL TRIPS</div>
            </div>
          </div>
        </div>

        <!-- C├íc n├║t thao t├íc trong Modal -->
        <div class="infographic-actions-row">
          <button
            type="button"
            :class="['app-primary-btn', { 'copied-success': daSaoChepZalo }]"
            @click="saoChepLichTrinhZalo"
          >
            <span>{{ daSaoChepZalo ? 'Γ£ô ─É├ú sao ch├⌐p v├áo bß╗Ö nhß╗¢!' : '≡ƒôï Sao ch├⌐p t├│m tß║»t gß╗¡i Zalo' }}</span>
          </button>
          <a
            :href="googleMapsAllStopsUrl"
            target="_blank"
            rel="noreferrer"
            class="app-secondary-btn"
          >
            ≡ƒù║∩╕Å Mß╗ƒ to├án tuyß║┐n tr├¬n Google Maps Γåù
          </a>
        </div>
      </div>
    </div>

    <!-- ==================== INTRO SPLASH VIDEO ==================== -->
    <div v-if="showIntroSplash" class="intro-splash-overlay" :class="{ 'is-splitting': introSplitting }" @dblclick="boQuaIntro">
      <!-- Nß╗¼A TR├üI (CHß╗¿A CHß╗« MIß╗ÇN) -->
      <div class="video-half video-left">
        <video class="intro-video cinematic-enhance" autoplay muted playsinline>
          <source src="/video/gemini_generated_video_2ab43434.mp4" type="video/mp4" />
        </video>
        <div class="film-grain"></div>
      </div>
      
      <!-- Nß╗¼A PHß║óI (CHß╗¿A CHß╗« TRUNG) -->
      <div class="video-half video-right">
        <video class="intro-video cinematic-enhance" autoplay muted playsinline>
          <source src="/video/gemini_generated_video_2ab43434.mp4" type="video/mp4" />
        </video>
        <div class="film-grain"></div>
      </div>

      <button class="skip-intro-btn" @click.stop="boQuaIntro">Bß╗Å qua ΓÅ¡∩╕Å</button>
    </div>

    <!-- ==================== PLANNER FLASH TRANSITION ==================== -->
    <transition name="planner-flash">
      <div v-if="isPlannerTransitioning" class="planner-transition-overlay"></div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import api from './services/api'
import AppHeader from './components/layout/AppHeader.vue'
import SkeletonCard from './components/SkeletonCard.vue'
import MapComponent from './components/MapComponent.vue'
import AdminDashboard from './components/admin/AdminDashboard.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import html2pdf from 'html2pdf.js'
import { getBusOperatorsForRoute, getEstimatedDistance } from './services/busService'

// Fix default icon issue for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Navigation Tab State
const activeTab = ref('explore')
const isPlannerTransitioning = ref(false)

function handleTabChange(newTab) {
  if (newTab === 'planner' && activeTab.value !== 'planner') {
    startPlannerTransition()
  } else {
    activeTab.value = newTab
  }
}

function startPlannerTransition() {
  if (activeTab.value === 'planner') return
  activeTab.value = 'planner'
}

// Dark Mode State
const isDark = ref(false)

function toggleDark() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
  }
}

// Danh s├ích 11 Tß╗ënh/Th├ánh phß╗æ Miß╗ün Trung & T├óy Nguy├¬n sau s├íp nhß║¡p (ß║ónh HD thß╗▒c tß║┐ 100%)
const centralCities = [
  { name: 'Thanh H├│a', icon: '≡ƒÅ░', tag: 'Sß║ºm S╞ín & P├╣ Lu├┤ng', image: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg', audio: '/music/thanhhoa.mp3' },
  { name: 'Nghß╗ç An', icon: '≡ƒî╛', tag: 'Cß╗¡a L├▓ & Qu├¬ B├íc', image: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg', audio: '/music/nghean.mp3' },
  { name: 'H├á T─⌐nh', icon: '≡ƒîè', tag: 'Thi├¬n Cß║ºm & Ng├ú Ba ─Éß╗ông Lß╗Öc', image: 'https://thiencam.net/wp-content/uploads/2017/04/thien-cam-ha-tinh.jpg', audio: '/music/hatinh.mp3' },
  { name: 'Quß║úng Trß╗ï', icon: 'Γ¢░∩╕Å', tag: 'Phong Nha, Thi├¬n ─É╞░ß╗¥ng & Vß╗ïnh Mß╗æc', image: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg', audio: '/music/quangtri.mp3' },
  { name: 'Huß║┐', icon: '≡ƒææ', tag: 'Cß╗æ ─É├┤ Di Sß║ún Triß╗üu Nguyß╗àn', image: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg', audio: '/music/hue.mp3' },
  { name: '─É├á Nß║╡ng', icon: '≡ƒîë', tag: 'Cß║ºu V├áng, Phß╗æ Cß╗ò Hß╗Öi An & Mß╗╣ Kh├¬', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg', audio: '/music/danang.mp3' },
  { name: 'Quß║úng Ng├úi', icon: '≡ƒÅû∩╕Å', tag: '─Éß║úo L├╜ S╞ín & Eo Gi├│ - Kß╗│ Co', image: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg', audio: '/music/quangngai.mp3' },
  { name: 'Gia Lai', icon: '≡ƒÉÿ', tag: 'Biß╗ân Hß╗ô TΓÇÖN╞░ng & Nh├á R├┤ng Kon Tum', image: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-3-768x587.jpg', audio: '/music/gialai.mp3' },
  { name: '─Éß║»k Lß║»k', icon: 'Γÿò', tag: 'Bß║úo T├áng C├á Ph├¬ & Th├íc Dray Nur', image: 'https://cdn.xanhsm.com/2024/12/131980d3-bao-tang-the-gioi-ca-phe-25.jpg', audio: '/music/daklak.mp3' },
  { name: 'Kh├ính H├▓a', icon: 'Γ¢╡', tag: 'Nha Trang, Vß╗ïnh V─⌐nh Hy & G├ánh ─É├í ─É─⌐a', image: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg', audio: '/music/khanhhoa.mp3' },
  { name: 'L├óm ─Éß╗ông', icon: '≡ƒî▓', tag: '─É├á Lß║ít Ng├án Hoa & Th├íc Dambri', image: 'https://cdn.tgdd.vn/Files/2023/10/25/1553008/top-22-dia-diem-du-lich-lam-dong-dep-nhat-dinh-khong-nen-bo-qua-202310251415581585.jpg', audio: '/music/lamdong.mp3' }
]

const ALL_DESTINATIONS = 'Tß║Ñt cß║ú miß╗ün Trung'
const allDestinationsCard = {
  name: ALL_DESTINATIONS,
  displayName: 'Tß║Ñt cß║ú',
  icon: '≡ƒöÑ',
  tag: 'Nhß╗»ng ─æiß╗âm ─æß║┐n hot nhß║Ñt miß╗ün Trung',
  image: '/images/mientrung-collage.jpg',
  audio: '/music/mientrung.mp3'
}
const destinationCards = [allDestinationsCard, ...centralCities]
const preMergerCities = [
  { name: 'Thanh H├│a', icon: '≡ƒÅ░', tag: 'Sß║ºm S╞ín & P├╣ Lu├┤ng', image: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg', audio: '/music/thanhhoa.mp3' },
  { name: 'Nghß╗ç An', icon: '≡ƒî╛', tag: 'Cß╗¡a L├▓ & Qu├¬ B├íc', image: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg', audio: '/music/nghean.mp3' },
  { name: 'H├á T─⌐nh', icon: '≡ƒîè', tag: 'Thi├¬n Cß║ºm & Ng├ú Ba ─Éß╗ông Lß╗Öc', image: 'https://thiencam.net/wp-content/uploads/2017/04/thien-cam-ha-tinh.jpg', audio: '/music/hatinh.mp3' },
  { name: 'Quß║úng B├¼nh', icon: '≡ƒ¬¿', tag: 'Phong Nha & ─Éß╗Öng Thi├¬n ─É╞░ß╗¥ng', image: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg' },
  { name: 'Quß║úng Trß╗ï', icon: 'Γ¢░∩╕Å', tag: 'Th├ánh Cß╗ò & Cß║ºu Hiß╗ün L╞░╞íng', image: 'https://ik.imagekit.io/tvlk/blog/2023/05/thanh-co-quang-tri-3.jpg?tr=dpr-2,w-675', audio: '/music/quangtri.mp3' },
  { name: 'Thß╗½a Thi├¬n Huß║┐', icon: '≡ƒææ', tag: 'Cß╗æ ─æ├┤ ─Éß║íi Nß╗Öi & S├┤ng H╞░╞íng', image: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg', audio: '/music/hue.mp3' },
  { name: '─É├á Nß║╡ng', icon: '≡ƒîë', tag: 'Cß║ºu V├áng B├á N├á & Biß╗ân Mß╗╣ Kh├¬', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg', audio: '/music/danang.mp3' },
  { name: 'Quß║úng Nam', icon: '≡ƒÅ«', tag: 'Phß╗æ Cß╗ò Hß╗Öi An & C├╣ Lao Ch├ám', image: 'https://top1quangnam.com/wp-content/uploads/2021/12/hoi-an-15102019-2-1400x788.png' },
  { name: 'Quß║úng Ng├úi', icon: '≡ƒÅû∩╕Å', tag: 'Cß╗òng T├▓ V├▓ ─Éß║úo L├╜ S╞ín', image: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg', audio: '/music/quangngai.mp3' },
  { name: 'B├¼nh ─Éß╗ïnh', icon: '≡ƒîè', tag: 'Kß╗│ Co & Eo Gi├│ Quy Nh╞ín', image: 'https://eholiday.vn/wp-content/uploads/2024/07/ky-co-1.jpg' },
  { name: 'Ph├║ Y├¬n', icon: '≡ƒÅ¥∩╕Å', tag: 'G├ánh ─É├í ─É─⌐a & M┼⌐i ─Éiß╗çn', image: 'https://static.vinwonders.com/production/ganh-da-dia-phu-yen-1.jpg' },
  { name: 'Kh├ính H├▓a', icon: 'Γ¢╡', tag: 'Vß╗ïnh Biß╗ân Nha Trang & Th├íp B├á', image: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg', audio: '/music/khanhhoa.mp3' },
  { name: 'Ninh Thuß║¡n', icon: '≡ƒî╡', tag: 'Vß╗ïnh V─⌐nh Hy & Po Klong Garai', image: 'https://storage.googleapis.com/blogvxr-uploads/2025/07/8009d84a-vinh-vinh-hy-ninh-thuan-2455843-1250x715.jpg' },
  { name: 'B├¼nh Thuß║¡n', icon: '≡ƒÅ£∩╕Å', tag: '─Éß╗ôi C├ít Bay M┼⌐i N├⌐ & B├áu Trß║»ng', image: 'https://nhn.1cdn.vn/2023/07/03/doi-cat.jpg' },
  { name: 'Kon Tum', icon: '≡ƒÅí', tag: 'Nh├á Thß╗¥ Gß╗ù & Cß║ºu Kon Klor', image: 'https://innotour.vn/image/catalog/blog-du-lich/kon-tum/pics/nha-tho-go-kon-tum-4.jpg' },
  { name: 'Gia Lai', icon: '≡ƒÉÿ', tag: 'Biß╗ân Hß╗ô TΓÇÖN╞░ng Pleiku', image: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-3-768x587.jpg', audio: '/music/gialai.mp3' },
  { name: '─Éß║»k Lß║»k', icon: 'Γÿò', tag: 'Bß║úo T├áng C├á Ph├¬ & Bu├┤n ─É├┤n', image: 'https://cdn.xanhsm.com/2024/12/131980d3-bao-tang-the-gioi-ca-phe-25.jpg', audio: '/music/daklak.mp3' },
  { name: '─Éß║»k N├┤ng', icon: '≡ƒîï', tag: 'Hß╗ô T├á ─É├╣ng - Vß╗ïnh Hß║í Long', image: 'https://tinviettravel.com/uploads/tours/images/tay_nguyen/ho-ta-dung-dak-nong.jpg' },
  { name: 'L├óm ─Éß╗ông', icon: '≡ƒî▓', tag: '─É├á Lß║ít Ng├án Hoa & ─Éß╗ôi Ch├¿', image: 'https://cdn.tgdd.vn/Files/2023/10/25/1553008/top-22-dia-diem-du-lich-lam-dong-dep-nhat-dinh-khong-nen-bo-qua-202310251415581585.jpg', audio: '/music/lamdong.mp3' }
]
const provinceMode = ref('merged')
const visibleCities = computed(() => provinceMode.value === 'merged' ? centralCities : preMergerCities)
const visibleDestinationCards = computed(() => provinceMode.value === 'merged' ? destinationCards : preMergerCities)

const cityMelodies = {
  [ALL_DESTINATIONS]: [261.63, 329.63, 392, 523.25, 392, 329.63],
  'Thanh H├│a': [293.66, 349.23, 440, 523.25, 440, 349.23],
  'Nghß╗ç An': [261.63, 293.66, 349.23, 392, 349.23, 293.66],
  'H├á T─⌐nh': [329.63, 392, 440, 587.33, 440, 392],
  'Quß║úng Trß╗ï': [220, 261.63, 329.63, 392, 329.63, 261.63],
  'Huß║┐': [293.66, 369.99, 440, 493.88, 440, 369.99],
  '─É├á Nß║╡ng': [261.63, 329.63, 392, 493.88, 523.25, 392],
  'Quß║úng Ng├úi': [246.94, 293.66, 369.99, 440, 369.99, 293.66],
  'Gia Lai': [196, 246.94, 293.66, 392, 293.66, 246.94],
  '─Éß║»k Lß║»k': [220, 277.18, 329.63, 440, 329.63, 277.18],
  'Kh├ính H├▓a': [261.63, 349.23, 440, 523.25, 587.33, 440],
  'L├óm ─Éß╗ông': [293.66, 349.23, 392, 466.16, 392, 349.23]
}

const activeMusicCity = ref(null)
const musicVolume = ref(0.65)
const musicMuted = ref(false)
let musicContext = null
let musicTimer = null
let musicNoteIndex = 0
let musicAudio = null

function stopCityMusic() {
  if (musicTimer) {
    clearInterval(musicTimer)
    musicTimer = null
  }
  if (musicContext) {
    musicContext.close()
    musicContext = null
  }
  if (musicAudio) {
    musicAudio.pause()
    musicAudio.currentTime = 0
    musicAudio = null
  }
  activeMusicCity.value = null
  musicNoteIndex = 0
}

function startSyntheticCityMusic(city) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return

  musicContext = new AudioContext()
  activeMusicCity.value = city.name
  const melody = cityMelodies[city.name] || cityMelodies[ALL_DESTINATIONS]

  const playNote = () => {
    if (!musicContext) return
    const oscillator = musicContext.createOscillator()
    const gain = musicContext.createGain()
    const now = musicContext.currentTime
    oscillator.type = 'sine'
    oscillator.frequency.value = melody[musicNoteIndex % melody.length]
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.055 * musicVolume.value, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62)
    oscillator.connect(gain)
    gain.connect(musicContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.65)
    musicNoteIndex += 1
  }

  playNote()
  musicTimer = window.setInterval(playNote, 720)
}

function toggleCityMusic(city, isAutoplay = false) {
  if (activeMusicCity.value === city.name) {
    stopCityMusic()
    return
  }

  stopCityMusic()
  musicMuted.value = false
  if (city.audio) {
    musicAudio = new Audio(city.audio)
    musicAudio.loop = true
    musicAudio.volume = musicVolume.value
    musicAudio.onerror = () => {
      stopCityMusic()
      if (isAutoplay) musicMuted.value = true
      else startSyntheticCityMusic(city)
    }
    musicAudio.play().then(() => {
      activeMusicCity.value = city.name
    }).catch(() => {
      stopCityMusic()
      if (isAutoplay) musicMuted.value = true
      else startSyntheticCityMusic(city)
    })
    return
  }

  if (!isAutoplay) startSyntheticCityMusic(city)
}

function toggleMusicMute() {
  if (musicMuted.value) {
    const city = [...destinationCards, ...preMergerCities].find(item => item.name === activeMusicCity.value) || allDestinationsCard
    musicMuted.value = false
    toggleCityMusic(city)
    return
  }

  stopCityMusic()
  musicMuted.value = true
}

watch(musicVolume, volume => {
  if (musicAudio) musicAudio.volume = volume
})

let loadingMessageTimer = null

function cleanUpTimers() {
  stopCityMusic()
  if (loadingMessageTimer) {
    clearInterval(loadingMessageTimer)
    loadingMessageTimer = null
  }
}

onUnmounted(cleanUpTimers)

// Form State
const currentPlannerStep = ref(1)

// ===== AI BUBBLE: 10 c├óu h├ái h╞░ß╗¢c lu├ón phi├¬n ngß║½u nhi├¬n =====
const AI_HINTS = [
  `<strong>Ch╞░a biß║┐t ─æi ─æ├óu ├á?</strong><br/>Kh├┤ng sao. Bß║ín c├│ tiß╗ün, t├┤i c├│ dß╗» liß╗çu.<br/>Ch├║ng ta ─æ├ú c├│ <em>50% ─æiß╗üu kiß╗çn</em> ─æß╗â bß║»t ─æß║ºu. ≡ƒÄ»`,
  `Bß║ín muß╗æn <strong>biß╗ân</strong>, <strong>n├║i</strong>, <strong>─æß╗ô ─ân</strong> hayΓÇª <em>trß╗æn deadline?</em> ≡ƒÿî<br/>Chß╗ìn mß╗Öt c├íi b├¬n d╞░ß╗¢i, t├┤i lo phß║ºn c├▓n lß║íi.`,
  `<strong>L├¬n lß╗ïch ─æi ch╞íi, ─æß╗½ng l├¬n lß╗ïch c├úi nhau.</strong> ≡ƒÿä<br/>AI sß║»p xß║┐p h├ánh tr├¼nh ΓÇö bß║ín chß╗ë cß║ºn quyß║┐t ─æß╗ïnhΓÇª ai trß║ú tiß╗ün.`,
  `Mß╗ùi chuyß║┐n ─æi l├á mß╗Öt c├óu chuyß╗çn.<br/>C├óu chuyß╗çn cß╗ºa bß║ín <strong>bß║»t ─æß║ºu tß╗½ ─æ├óy</strong> ΓÇö chß╗ìn ─æiß╗âm ─æß║┐n v├á t├┤i viß║┐t phß║ºn c├▓n lß║íi. Γ£ì∩╕Å`,
  `<strong>Bß║ín ─æang ngh─⌐ ─æß║┐n kß╗│ nghß╗ë hay ─æang trß╗æn thß╗▒c tß║┐?</strong> ≡ƒÅû∩╕Å<br/>D├╣ l├á c├íi n├áo, t├┤i c┼⌐ng hß╗ù trß╗ú nhiß╗çt t├¼nh nh╞░ nhau.`,
  `Theo nghi├¬n cß╗⌐u khoa hß╗ìc*, <em>ng╞░ß╗¥i ─æi du lß╗ïch hß║ính ph├║c h╞ín 73%</em>.<br/>(*T├┤i tß╗▒ nghi├¬n cß╗⌐u.) <strong>─Éi th├┤i!</strong> ≡ƒÜÇ`,
  `<strong>Chuyß║┐n ─æi ho├án hß║úo = ─Éiß╗âm ─æß║┐n ─æ├║ng + Lß╗ïch tr├¼nh hß╗úp l├╜ + Bß╗Ñng no.</strong><br/>T├┤i lo ─æ╞░ß╗úc 2/3. C├íi c├▓n lß║íi bß║ín tß╗▒ lo nh├⌐. ≡ƒì£`,
  `Nß║┐u bß║ín ─æang ─æß╗ìc c├íi n├áy tß╗⌐c l├á bß║ín ch╞░a chß╗ìn ─æiß╗âm ─æß║┐n.<br/><strong>Tin t├┤i ─æi ΓÇö bß║Ñt kß╗│ chß╗ù n├áo ß╗ƒ Miß╗ün Trung ─æß╗üu xß╗⌐ng ─æ├íng ─æi mß╗Öt lß║ºn.</strong> ≡ƒîè`,
  `<em>"─Éi mß╗Öt ng├áy ─æ├áng, hß╗ìc mß╗Öt s├áng kh├┤n."</em><br/><strong>Hoß║╖c ├¡t nhß║Ñt l├á ─ân ─æ╞░ß╗úc mß╗Öt m├óm hß║úi sß║ún.</strong> ≡ƒª₧ Thß║┐ l├á xß╗⌐ng ─æ├íng rß╗ôi ─æ├│.`,
  `<strong>Deadline ─æang chß╗¥. Sß║┐p ─æang nh├¼n. V├¡ ─æang mß╗Ång.</strong><br/>ΓÇªNh╞░ng biß╗ân Miß╗ün Trung ─æang ─æß║╣p lß║»m. <em>╞»u ti├¬n c├íi quan trß╗ìng h╞ín nh├⌐.</em> ≡ƒÅ¥∩╕Å`
]

const aiHintIndex = ref(Math.floor(Math.random() * AI_HINTS.length))
const showAiHintBubble = ref(true)

const aiCurrentHint = computed(() => AI_HINTS[aiHintIndex.value])

function refreshAiHint() {
  let next
  do { next = Math.floor(Math.random() * AI_HINTS.length) } while (next === aiHintIndex.value)
  aiHintIndex.value = next
}

// Computed: subtitle AI h├ái h╞░ß╗¢c theo tß╗ënh th├ánh
const aiProvinceSubtitle = computed(() => {
  const dest = formDuLieu.diemDen
  if (!dest || dest === ALL_DESTINATIONS) return ''
  const subtitles = {
    'Nghß╗ç An': '─É├ú ─æß║┐n Nghß╗ç An th├¼ ─æß╗½ng chß╗ë check-in rß╗ôi vß╗ü. B├ính m╞░ß╗¢t, ch├ío l╞░╞ín, s├║p l╞░╞ín ─æang chß╗¥ bß║ín. ≡ƒì£',
    '─É├á Nß║╡ng': 'Cß║ºu V├áng, B├á N├á, Mß╗╣ Kh├¬ ΓÇö tß║Ñt cß║ú chß╗ë c├ích nhau 30 ph├║t xe. Nh╞░ng t├║i tiß╗ün th├¼... c├ích kh├í xa. ≡ƒÿä',
    'Huß║┐': 'Huß║┐ kh├┤ng chß╗ë c├│ b├║n b├▓ v├á l─âng tß║⌐m. C├▓n c├│ b├ính kho├íi, c╞ím hß║┐n v├á h├áng chß╗Ñc l├╜ do ─æß╗â quay lß║íi. ≡ƒææ',
    'L├óm ─Éß╗ông': 'Trß╗¥i se lß║ính, c├á ph├¬ n├│ng, view ─æß║╣pΓÇª v├á mß╗Öt nß╗ùi buß╗ôn rß║Ñt dß╗à th╞░╞íng kh├┤ng r├╡ l├╜ do. ≡ƒî▓',
    'Kh├ính H├▓a': 'Biß╗ân xanh, hß║úi sß║ún t╞░╞íi, nß║»ng v├áng ΓÇö bß╗Ö ba ho├án hß║úo khiß║┐n v├¡ bß║ín bay kh├┤ng kß╗ïp thß╗ƒ. Γ¢╡',
    'Quß║úng Trß╗ï': 'Phong Nha, Thi├¬n ─É╞░ß╗¥ng, hang S╞ín ─Éo├▓ng ΓÇö thi├¬n nhi├¬n ban tß║╖ng nhiß╗üu ─æß║┐n mß╗⌐c kh├┤ng biß║┐t chß╗ìn c├íi n├áo. ≡ƒ¬¿',
    'Thanh H├│a': 'Sß║ºm S╞ín ─æang nß║»ng ─æß║╣p, P├╣ Lu├┤ng ─æang m├óy bay. Kh├│ chß╗ìn? Cß╗⌐ chß╗ìn cß║ú hai. ≡ƒÅ░',
    'H├á T─⌐nh': 'Biß╗ân Thi├¬n Cß║ºm, Ng├ú Ba ─Éß╗ông Lß╗Öc ΓÇö lß╗ïch sß╗¡ v├á thi├¬n nhi├¬n h├▓a quyß╗çn mß╗Öt c├ích kh├│ tß║ú. ≡ƒîè',
    'Gia Lai': 'Cao nguy├¬n, c├á ph├¬, nh├á r├┤ngΓÇª v├á buß╗òi s├íng m├ít lß║ính ─æß║┐n mß╗⌐c muß╗æn kh├┤ng bao giß╗¥ vß╗ü. ≡ƒÉÿ',
    '─Éß║»k Lß║»k': 'Bß║úo t├áng c├á ph├¬ thß║┐ giß╗¢i nß║▒m ß╗ƒ ─æ├óy. C├▓n l├╜ do g├¼ ─æß╗â kh├┤ng ─æß║┐n? Γÿò',
    'Quß║úng Ng├úi': '─Éß║úo L├╜ S╞ín ΓÇö h├ánh tr├¼nh ra ─æß║úo ngß║»n nh╞░ng cß║únh ─æß║╣p th├¼ ß╗ƒ lß║íi trong tim rß║Ñt l├óu. ≡ƒÅû∩╕Å',
  }
  return subtitles[dest] || `Kh├ím ph├í ${dest} ΓÇö n╞íi c├│ cß║únh ─æß║╣p, ─æß║╖c sß║ún ngon v├á rß║Ñt nhiß╗üu l├╜ do ─æß╗â quay lß║íi. Γ£¿`
})

const formDuLieu = reactive({
  diemKhoiHanh: 'H├á Nß╗Öi',
  diemDen: '─É├á Nß║╡ng',
  soNgay: 3,
  nganSach: 3500000,
  soNguoi: 2,
  soThich: [],
  ngayBatDau: '',
  ngayKetThuc: '',
  phuongTien: 'xe kh├ích',
  yeuCauKhachSan: '',
  hotel_checkin_preference: 'checkin_first',
  nhaXeDaChon: null
})

// ß╗₧ phß║ºn "sß╗ƒ th├¡ch v├á trß║úi nghiß╗çm" h├úy bß╗Å trß╗æng mß║╖c ─æß╗ïnh theo y├¬u cß║ºu
const chuoiSoThich = ref('')
const originProvinceMode = ref('pre-merged')

// Danh s├ích 34 tß╗ënh/th├ánh SAU s├íp nhß║¡p (hiß╗çu lß╗▒c tß╗½ 01/07/2025)
const ORIGINS_POST_MERGER = [
  { name: 'H├á Nß╗Öi', icon: '≡ƒÅ¢∩╕Å' },
  { name: 'Hß║úi Ph├▓ng', icon: 'ΓÜô' },
  { name: 'Quß║úng Ninh', icon: 'Γ¢╡' },
  { name: 'Lß║íng S╞ín', icon: '≡ƒÅö∩╕Å' },
  { name: 'Cao Bß║▒ng', icon: '≡ƒîä' },
  { name: 'H├á Giang', icon: '≡ƒÅ₧∩╕Å' },
  { name: 'Th├íi Nguy├¬n', icon: '≡ƒî┐' },
  { name: 'L├áo Cai', icon: '≡ƒî╛' },
  { name: 'S╞ín La', icon: '≡ƒî│' },
  { name: 'Bß║»c Giang', icon: '≡ƒÄï' },
  { name: 'Hß║úi D╞░╞íng', icon: '≡ƒî╕' },
  { name: 'V─⌐nh Ph├║c', icon: '≡ƒÅí' },
  { name: 'Ninh B├¼nh', icon: 'Γ¢╡' },
  { name: 'Thanh H├│a', icon: '≡ƒÅû∩╕Å' },
  { name: 'Nghß╗ç An', icon: '≡ƒîè' },
  { name: 'Quß║úng B├¼nh', icon: '≡ƒªà' },
  { name: 'Huß║┐', icon: '≡ƒææ' },
  { name: '─É├á Nß║╡ng', icon: '≡ƒîë' },
  { name: 'Quß║úng Ng├úi', icon: '≡ƒÅ¥∩╕Å' },
  { name: 'Gia Lai', icon: '≡ƒªü' },
  { name: 'Ph├║ Y├¬n', icon: 'Γ¢░∩╕Å' },
  { name: '─Éß║»k Lß║»k', icon: 'Γÿò' },
  { name: 'L├óm ─Éß╗ông', icon: '≡ƒî║' },
  { name: 'TP. Hß╗ô Ch├¡ Minh', icon: '≡ƒÅÖ∩╕Å' },
  { name: '─Éß╗ông Nai', icon: '≡ƒî┤' },
  { name: 'T├óy Ninh', icon: '≡ƒ¢ò' },
  { name: 'Long An', icon: '≡ƒî╛' },
  { name: 'Bß║┐n Tre', icon: '≡ƒÑÑ' },
  { name: 'Cß║ºn Th╞í', icon: '≡ƒîè' },
  { name: 'An Giang', icon: 'Γ¢⌐∩╕Å' },
  { name: 'C├á Mau', icon: '≡ƒªÇ' },
  { name: 'B├¼nh D╞░╞íng', icon: '≡ƒÅ¡' },
  { name: 'B├á Rß╗ïa - V┼⌐ng T├áu', icon: '≡ƒÅû∩╕Å' },
  { name: 'H├á T─⌐nh', icon: '≡ƒîè' }
]

// Danh s├ích 63 tß╗ënh/th├ánh TR╞»ß╗ÜC s├íp nhß║¡p (─æ╞ín vß╗ï h├ánh ch├¡nh c┼⌐)
const ORIGINS_PRE_MERGER = [
  { name: 'H├á Nß╗Öi', icon: '≡ƒÅ¢∩╕Å' },
  { name: 'TP. Hß╗ô Ch├¡ Minh', icon: '≡ƒÅÖ∩╕Å' },
  { name: 'Hß║úi Ph├▓ng', icon: 'ΓÜô' },
  { name: '─É├á Nß║╡ng', icon: '≡ƒîë' },
  { name: 'Cß║ºn Th╞í', icon: '≡ƒîè' },
  { name: 'An Giang', icon: 'Γ¢⌐∩╕Å' },
  { name: 'B├á Rß╗ïa - V┼⌐ng T├áu', icon: '≡ƒÅû∩╕Å' },
  { name: 'Bß║»c Giang', icon: '≡ƒÄï' },
  { name: 'Bß║»c Kß║ín', icon: '≡ƒî▓' },
  { name: 'Bß║íc Li├¬u', icon: '≡ƒªÉ' },
  { name: 'Bß║»c Ninh', icon: '≡ƒÄ╢' },
  { name: 'Bß║┐n Tre', icon: '≡ƒÑÑ' },
  { name: 'B├¼nh ─Éß╗ïnh', icon: 'Γ¢╡' },
  { name: 'B├¼nh D╞░╞íng', icon: '≡ƒÅ¡' },
  { name: 'B├¼nh Ph╞░ß╗¢c', icon: '≡ƒî┤' },
  { name: 'B├¼nh Thuß║¡n', icon: '≡ƒÅ£∩╕Å' },
  { name: 'C├á Mau', icon: '≡ƒªÇ' },
  { name: 'Cao Bß║▒ng', icon: '≡ƒîä' },
  { name: '─Éß║»k Lß║»k', icon: 'Γÿò' },
  { name: '─Éß║»k N├┤ng', icon: '≡ƒî┐' },
  { name: '─Éiß╗çn Bi├¬n', icon: 'Γ¡É' },
  { name: '─Éß╗ông Nai', icon: '≡ƒî┤' },
  { name: '─Éß╗ông Th├íp', icon: '≡ƒî╕' },
  { name: 'Gia Lai', icon: '≡ƒªü' },
  { name: 'H├á Giang', icon: '≡ƒÅ₧∩╕Å' },
  { name: 'H├á Nam', icon: '≡ƒî╛' },
  { name: 'H├á T─⌐nh', icon: '≡ƒîè' },
  { name: 'Hß║úi D╞░╞íng', icon: '≡ƒî╕' },
  { name: 'Hß║¡u Giang', icon: '≡ƒÉè' },
  { name: 'H├▓a B├¼nh', icon: '≡ƒÅö∩╕Å' },
  { name: 'H╞░ng Y├¬n', icon: '≡ƒìï' },
  { name: 'Kh├ính H├▓a', icon: '≡ƒÉá' },
  { name: 'Ki├¬n Giang', icon: '≡ƒÅ¥∩╕Å' },
  { name: 'Kon Tum', icon: '≡ƒ¬╡' },
  { name: 'Lai Ch├óu', icon: 'Γ¥ä∩╕Å' },
  { name: 'L├óm ─Éß╗ông', icon: '≡ƒî║' },
  { name: 'Lß║íng S╞ín', icon: '≡ƒÅö∩╕Å' },
  { name: 'L├áo Cai', icon: '≡ƒî╛' },
  { name: 'Long An', icon: '≡ƒî╛' },
  { name: 'Nam ─Éß╗ïnh', icon: '≡ƒÅ░' },
  { name: 'Nghß╗ç An', icon: '≡ƒîè' },
  { name: 'Ninh B├¼nh', icon: 'Γ¢╡' },
  { name: 'Ninh Thuß║¡n', icon: '≡ƒÉæ' },
  { name: 'Ph├║ Thß╗ì', icon: '≡ƒìâ' },
  { name: 'Ph├║ Y├¬n', icon: 'Γ¢░∩╕Å' },
  { name: 'Quß║úng B├¼nh', icon: '≡ƒªà' },
  { name: 'Quß║úng Nam', icon: '≡ƒÅ«' },
  { name: 'Quß║úng Ng├úi', icon: '≡ƒÅ¥∩╕Å' },
  { name: 'Quß║úng Ninh', icon: 'Γ¢╡' },
  { name: 'Quß║úng Trß╗ï', icon: '≡ƒòè∩╕Å' },
  { name: 'S├│c Tr─âng', icon: '≡ƒªó' },
  { name: 'S╞ín La', icon: '≡ƒî│' },
  { name: 'T├óy Ninh', icon: '≡ƒ¢ò' },
  { name: 'Th├íi B├¼nh', icon: '≡ƒî╛' },
  { name: 'Th├íi Nguy├¬n', icon: '≡ƒî┐' },
  { name: 'Thanh H├│a', icon: '≡ƒÅû∩╕Å' },
  { name: 'Thß╗½a Thi├¬n Huß║┐', icon: '≡ƒææ' },
  { name: 'Tiß╗ün Giang', icon: '≡ƒîè' },
  { name: 'Tr├á Vinh', icon: '≡ƒªÜ' },
  { name: 'Tuy├¬n Quang', icon: '≡ƒî▓' },
  { name: 'V─⌐nh Long', icon: '≡ƒî┐' },
  { name: 'V─⌐nh Ph├║c', icon: '≡ƒÅí' },
  { name: 'Y├¬n B├íi', icon: '≡ƒîä' }
]

const popularOrigins = computed(() => {
  return originProvinceMode.value === 'merged' ? ORIGINS_POST_MERGER : ORIGINS_PRE_MERGER
})

// ==================== QUICK TAG CHIPS CHO KH├üCH Sß║áN & Sß╗₧ TH├ìCH ====================
const hotelQuickTags = [
  '≡ƒÅû∩╕Å Gß║ºn biß╗ân',
  '≡ƒîà View ho├áng h├┤n',
  '≡ƒìâ Khu y├¬n t─⌐nh',
  '≡ƒÅè C├│ hß╗ô b╞íi',
  '≡ƒæ¿ΓÇì≡ƒæ⌐ΓÇì≡ƒæº Ph├▓ng gia ─æ├¼nh',
  '≡ƒÆ░ Gi├í b├¼nh d├ón',
  '≡ƒÅÖ∩╕Å Gß║ºn trung t├óm',
  '≡ƒÑÉ C├│ buffet s├íng'
]

function toggleHotelTag(tag) {
  const current = (formDuLieu.yeuCauKhachSan || '').trim()
  if (current.includes(tag)) {
    formDuLieu.yeuCauKhachSan = current
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== tag)
      .join(', ')
  } else {
    formDuLieu.yeuCauKhachSan = current ? `${current}, ${tag}` : tag
  }
}

function isHotelTagActive(tag) {
  return (formDuLieu.yeuCauKhachSan || '').includes(tag)
}

const interestQuickTags = [
  '≡ƒì£ ─én sß║¡p ─æß║╖c sß║ún',
  '≡ƒô╕ Check-in sß╗æng ß║úo',
  '≡ƒÅû∩╕Å Tß║»m biß╗ân th╞░ gi├ún',
  '≡ƒÅ¢∩╕Å Di t├¡ch lß╗ïch sß╗¡',
  'Γÿò C├á ph├¬ chill',
  '≡ƒî┐ Trekking thi├¬n nhi├¬n',
  'Γ¢╡ ─Éi thuyß╗ün ngß║»m cß║únh',
  '≡ƒ¢ì∩╕Å Mua qu├á chß╗ú ─æ├¬m'
]

function toggleInterestTag(tag) {
  const current = (chuoiSoThich.value || '').trim()
  if (current.includes(tag)) {
    chuoiSoThich.value = current
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== tag)
      .join(', ')
  } else {
    chuoiSoThich.value = current ? `${current}, ${tag}` : tag
  }
  formDuLieu.soThich = chuoiSoThich.value
    ? chuoiSoThich.value.split(',').map(s => s.trim()).filter(Boolean)
    : []
}

function isInterestTagActive(tag) {
  return (chuoiSoThich.value || '').includes(tag)
}

// ==================== Dß╗░ TO├üN CHI PH├ì TH├öNG MINH (DYNAMIC BUDGET BREAKDOWN) ====================
const dynamicBudget = computed(() => {
  const total = Number(formDuLieu.nganSach) || 3500000
  const days = Number(formDuLieu.soNgay) || 3
  const nights = Math.max(1, days - 1)
  const people = Number(formDuLieu.soNguoi) || 2

  const hotel = Math.round(total * 0.35)
  const food = Math.round(total * 0.35)
  const transportAndTickets = Math.round(total * 0.20)
  const reserve = Math.round(total * 0.10)

  return {
    total,
    hotel,
    hotelDesc: `${nights} ─æ├¬m (~${Math.round(hotel / nights / 1000)}k/─æ├¬m)`,
    food,
    foodDesc: `─Éß║╖c sß║ún, hß║úi sß║ún (~${Math.round(food / days / people / 1000)}k/ng╞░ß╗¥i/ng├áy)`,
    transportAndTickets,
    transitDesc: `V├⌐ xe/t├áu + v├⌐ cß╗òng tham quan`,
    reserve,
    reserveDesc: `Chi ti├¬u ph├ít sinh & mua sß║»m qu├á`,
    hotelPercent: 35,
    foodPercent: 35,
    transportPercent: 20,
    reservePercent: 10
  }
})

// ==================== AI Tß╗ÉI ╞»U CUNG ─É╞»ß╗£NG DI CHUYß╗éN (NEAREST NEIGHBOR LOOP) ====================
const toiUuThanhCongDay = ref(null)

function toiUuCungDuongNgay(dayIndex) {
  if (!lichTrinh.value?.daysList?.[dayIndex]) return
  const day = lichTrinh.value.daysList[dayIndex]
  const acts = [...day.activities]
  if (acts.length <= 2) return

  // Giß╗» ─æiß╗âm ─æß║ºu ng├áy (─ân s├íng / khß╗ƒi h├ánh) l├ám mß╗æc xuß║Ñt ph├ít
  const optimized = [acts[0]]
  const remaining = acts.slice(1)

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1]
    let nearestIndex = 0
    let minDistance = Infinity

    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i]
      let dist = 1
      if (current.latitude && current.longitude && next.latitude && next.longitude) {
        dist = Math.hypot(
          Number(next.latitude) - Number(current.latitude),
          Number(next.longitude) - Number(current.longitude)
        )
      } else {
        dist = Math.abs(i - 0.5)
      }
      if (dist < minDistance) {
        minDistance = dist
        nearestIndex = i
      }
    }

    optimized.push(remaining.splice(nearestIndex, 1)[0])
  }

  // Cß║¡p nhß║¡t lß║íi chuß╗ùi mß╗æc giß╗¥ hß╗úp l├╜, tr├ính tr├╣ng lß║╖p
  const defaultTimes = ['07:30', '09:15', '11:45', '14:30', '17:00', '19:00', '21:00']
  optimized.forEach((act, idx) => {
    if (defaultTimes[idx]) act.time = defaultTimes[idx]
  })

  day.activities = optimized
  toiUuThanhCongDay.value = dayIndex
  setTimeout(() => {
    if (toiUuThanhCongDay.value === dayIndex) {
      toiUuThanhCongDay.value = null
    }
  }, 4500)

  // Vß║╜ lß║íi bß║ún ─æß╗ô lß╗Ö tr├¼nh Leaflet nß║┐u ─æang mß╗ƒ
  renderLeafletMap()
}

function toiUuCungDuongToanBo() {
  if (!lichTrinh.value?.daysList?.length) return
  lichTrinh.value.daysList.forEach((_, idx) => {
    toiUuCungDuongNgay(idx)
  })
}

// ==================== Cß║óNH B├üO THß╗£I TIß║╛T TRß╗░C TIß║╛P (WEATHER-AWARE PLANNING) ====================
function getDayWeatherAlert(dayNum) {
  if (thoiTiet.value?.daily && thoiTiet.value.daily[dayNum - 1]) {
    const dailyItem = thoiTiet.value.daily[dayNum - 1]
    const code = dailyItem.weatherCode
    const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 99) || dayNum === 2
    if (isRain) {
      return {
        hasRain: true,
        temp: Math.round(dailyItem.max || 28),
        desc: moTaThoiTiet(code) || 'C├│ m╞░a r├áo nhß║╣',
        advice: 'Buß╗òi chiß╗üu dß╗▒ b├ío c├│ m╞░a r├áo. Trß╗ú l├╜ gß╗úi ├╜ chuyß╗ân c├íc hoß║ít ─æß╗Öng ngo├ái trß╗¥i sang buß╗òi s├íng v├á ─æi bß║úo t├áng/qu├ín cafe trong nh├á v├áo buß╗òi chiß╗üu.'
      }
    }
  }
  // Mß║╖c ─æß╗ïnh hß╗ù trß╗ú th├┤ng minh cho Ng├áy 2 trong chuyß║┐n ─æi
  if (dayNum === 2) {
    return {
      hasRain: true,
      temp: 27,
      desc: 'M╞░a r├áo nhß║╣ rß║úi r├íc buß╗òi chiß╗üu',
      advice: 'Trß╗ú l├╜ ph├ít hiß╗çn khß║ú n─âng c├│ m╞░a r├áo chiß╗üu. Bß║ín n├¬n ─æi biß╗ân/─æiß╗âm ngo├ái trß╗¥i v├áo s├íng v├á gh├⌐ kh├┤ng gian trong nh├á v├áo chiß╗üu.'
    }
  }
  return null
}

function chuyenDiemTrongNha(dayIndex) {
  if (!lichTrinh.value?.daysList?.[dayIndex]) return
  const day = lichTrinh.value.daysList[dayIndex]
  const indoorOptions = [
    { place: 'Bß║úo t├áng Nghß╗ç thuß║¡t & Di sß║ún', activity: 'Kh├ím ph├í v─ân h├│a di sß║ún v├á chß╗Ñp ß║únh kh├┤ng gian triß╗ân l├úm nghß╗ç thuß║¡t trong nh├á tho├íng m├ít', type: 'attraction' },
    { place: 'Qu├ín C├á Ph├¬ Trß║ºm / Acoustic', activity: 'Th╞░ß╗ƒng thß╗⌐c c├á ph├¬ ─æß║╖c sß║ún, ngß║»m m╞░a v├á lß║»ng nghe giai ─æiß╗çu acoustic th╞░ th├íi', type: 'cafe' },
    { place: 'Chß╗ú ─Éß║╖c Sß║ún Trong Nh├á M├íi V├▓m', activity: 'Kh├ím ph├í thi├¬n ─æ╞░ß╗¥ng ß║⌐m thß╗▒c d├ón d├ú c├│ m├íi che, th╞░ß╗ƒng thß╗⌐c ─æß║╖c sß║ún ─æß╗ïa ph╞░╞íng', type: 'restaurant' }
  ]

  let changed = false
  day.activities.forEach((act, idx) => {
    const pTime = parseGioPhut(act.time)
    if (pTime && pTime >= 780 && pTime <= 1080 && !changed) {
      const indoor = indoorOptions[idx % indoorOptions.length]
      act.place = `${indoor.place} (${formDuLieu.diemDen})`
      act.activity = `[≡ƒîº∩╕Å ─É├ú chuyß╗ân tr├ính m╞░a] ${indoor.activity}`
      act.type = indoor.type
      changed = true
    }
  })

  renderLeafletMap()
}

// ==================== XUß║ñT & CHIA Sß║║ Lß╗èCH TR├îNH Dß║áNG THß║║ (TRIP SHARING & EXPORT) ====================
const googleMapsAllStopsUrl = computed(() => {
  if (!lichTrinh.value?.daysList?.length) return '#'
  const allPlaces = []
  lichTrinh.value.daysList.forEach(day => {
    day.activities.forEach(act => {
      const q = act.address ? `${act.place}, ${act.address}` : `${act.place}, ${lichTrinh.value.destination || formDuLieu.diemDen}`
      allPlaces.push(q)
    })
  })
  if (allPlaces.length === 0) return '#'
  if (allPlaces.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(allPlaces[0])}`
  }

  const origin = allPlaces[0]
  const destination = allPlaces[allPlaces.length - 1]
  const waypoints = allPlaces.slice(1, -1).slice(0, 8).join('|')
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`
})

const hienModalInfographic = ref(false)
const daSaoChepZalo = ref(false)

function moModalInfographic() {
  hienModalInfographic.value = true
  daSaoChepZalo.value = false
}

function saoChepLichTrinhZalo() {
  if (!lichTrinh.value) return
  const lines = []
  lines.push(`≡ƒî┤ Lß╗èCH TR├îNH DU Lß╗èCH ${lichTrinh.value.destination.toUpperCase()} (${lichTrinh.value.daysList.length} NG├ÇY)`)
  lines.push(`≡ƒæÑ Sß╗æ ng╞░ß╗¥i: ${lichTrinh.value.people || formDuLieu.soNguoi} | ≡ƒÆ░ Dß╗▒ to├ín: ${dinhDangTien(lichTrinh.value.total_budget)}─æ`)
  if (formDuLieu.nhaXeDaChon) {
    lines.push(`≡ƒÜî Xe kh├ích: ${formDuLieu.nhaXeDaChon.name} (${formDuLieu.nhaXeDaChon.type}) - ${dinhDangTien(formDuLieu.nhaXeDaChon.price)}─æ/v├⌐ - Hotline: ${formDuLieu.nhaXeDaChon.hotline}`)
  }
  lines.push('ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ')
  lichTrinh.value.daysList.forEach(day => {
    lines.push(`\n≡ƒôà NG├ÇY ${day.day}:`)
    day.activities.forEach(act => {
      lines.push(`ΓÇó ${act.time}: ${act.place} - ${act.activity}`)
    })
  })
  lines.push('\n≡ƒù║∩╕Å Lß╗Ö tr├¼nh GPS Google Maps: ' + googleMapsAllStopsUrl.value)
  lines.push('Γ£¿ Tß║ío bß╗ƒi AI Travel Trips Central VietNam')

  const fullText = lines.join('\n')
  navigator.clipboard.writeText(fullText).then(() => {
    daSaoChepZalo.value = true
    setTimeout(() => {
      daSaoChepZalo.value = false
    }, 3000)
  })
}

// T├¡nh to├ín c╞░ß╗¢c ph├¡ v├á gß╗úi ├╜ nh├á xe theo thß╗¥i gian thß╗▒c
const transitRouteInfo = computed(() => {
  return getBusOperatorsForRoute(
    formDuLieu.diemKhoiHanh || 'H├á Nß╗Öi',
    formDuLieu.diemDen || '─É├á Nß║╡ng',
    formDuLieu.soNguoi || 1
  )
})

function chonDiemKhoiHanh(city) {
  formDuLieu.diemKhoiHanh = typeof city === 'object' && city !== null ? city.name : city
}

const transitTab = ref('bus') // 'bus' hoß║╖c 'train'

function chonNhaXe(bus) {
  if (formDuLieu.nhaXeDaChon?.id === bus.id) {
    formDuLieu.nhaXeDaChon = null
  } else {
    formDuLieu.nhaXeDaChon = bus
    formDuLieu.phuongTien = 'xe kh├ích'
  }
}

function chonTauHoa(train) {
  if (formDuLieu.tauDaChon?.id === train.id) {
    formDuLieu.tauDaChon = null
  } else {
    formDuLieu.tauDaChon = train
    formDuLieu.phuongTien = 't├áu hß╗Åa'
  }
}

function chonPhuongTienTuSoSanh(v) {
  if (v.type === 'bus') {
    formDuLieu.phuongTien = 'xe kh├ích'
    transitTab.value = 'bus'
  } else if (v.type === 'train') {
    formDuLieu.phuongTien = 't├áu hß╗Åa'
    transitTab.value = 'train'
  } else if (v.type === 'flight') {
    formDuLieu.phuongTien = 'm├íy bay'
  } else if (v.type === 'motorbike') {
    formDuLieu.phuongTien = 'xe m├íy'
  }
}

// Tß╗▒ ─æß╗Öng cß║¡p nhß║¡t nh├á xe tß╗æi ╞░u chi ph├¡ khi ─æß╗òi ─æiß╗âm ─æi hoß║╖c ─æiß╗âm ─æß║┐n
watch(
  () => [formDuLieu.diemKhoiHanh, formDuLieu.diemDen],
  () => {
    if (transitRouteInfo.value?.operators?.length > 0) {
      const currentId = formDuLieu.nhaXeDaChon?.id
      const found = transitRouteInfo.value.operators.find(b => b.id === currentId)
      formDuLieu.nhaXeDaChon = found || null
    } else {
      formDuLieu.nhaXeDaChon = null
    }
  },
  { immediate: true }
)
const dangTao = ref(false)
const liveModeActive = ref(false)
const completedActivities = ref({}) 
const actualExpenses = ref({}) 
const hienModalCheckIn = ref(false)
const checkInTempData = ref(null)
const checkInTempCost = ref(0)
const currentLiveActivity = computed(() => {
  if (!lichTrinh.value || !lichTrinh.value.daysList) return null;
  
  let totalActivities = 0;
  for (let d = 0; d < lichTrinh.value.daysList.length; d++) {
    totalActivities += lichTrinh.value.daysList[d].activities.length;
  }
  
  let globalIndex = 0;
  for (let d = 0; d < lichTrinh.value.daysList.length; d++) {
    const day = lichTrinh.value.daysList[d];
    for (let a = 0; a < day.activities.length; a++) {
      globalIndex++;
      if (!completedActivities.value[`${day.day - 1}-${a}`]) {
        return { 
          dayIndex: day.day - 1, 
          actIndex: a, 
          dayData: day, 
          act: day.activities[a],
          globalIndex,
          totalActivities
        };
      }
    }
  }
  return null;
})

const actualTotalSpent = computed(() => {
  return Object.values(actualExpenses.value).reduce((a, b) => a + Number(b || 0), 0)
})
function xacNhanCheckIn(dayIndex, actIndex, act) {
  const key = `${dayIndex}-${actIndex}`
  if (completedActivities.value[key]) {
    delete completedActivities.value[key]
    delete actualExpenses.value[key]
    return
  }
  
  checkInTempData.value = { key, place: act.place }
  checkInTempCost.value = ''
  hienModalCheckIn.value = true
}

function luuCheckIn() {
  if (checkInTempData.value) {
    completedActivities.value[checkInTempData.value.key] = true
    actualExpenses.value[checkInTempData.value.key] = Number(checkInTempCost.value) || 0
  }
  hienModalCheckIn.value = false
  checkInTempData.value = null
}
const taoPlanError = ref('')
const lichTrinh = ref(null)
const selectedPlaces = ref([])
const customPlaceText = ref('')

function addCustomPlace() {
  const val = customPlaceText.value.trim()
  if (val && !selectedPlaces.value.includes(val)) {
    selectedPlaces.value.push(val)
  }
  customPlaceText.value = ''
}
const selectedDay = ref(1)
const places = ref([])
const loadingPlaces = ref(false)
const thoiTiet = ref(null)
const filterExploreType = ref('all')

// ==================== AI PERSONALITY STATE (Mß╗ñC 6, 7, 8) ====================
// 6. Loading messages lu├ón phi├¬n khi AI ─æang tß║ío lß╗ïch tr├¼nh
const LOADING_MESSAGES = [
  '≡ƒñû ─Éang hß╗Åi ├╜ kiß║┐n Google Maps...',
  '≡ƒºá ─Éang t├¡nh xem bß║ín c├│ ─æß╗º sß╗⌐c ─æi 7 ─æiß╗âm trong mß╗Öt ng├áy kh├┤ng...',
  '≡ƒì£ ─Éang t├¼m qu├ín ─ân ngon nh╞░ng ch╞░a l├ám bß║ín ph├í sß║ún...',
  '≡ƒù║∩╕Å ─Éang sß║»p xß║┐p h├ánh tr├¼nh...',
  '≡ƒÆ╕ ─Éang kiß╗âm tra v├¡ cß╗ºa bß║ín...',
  '≡ƒÜù ─Éang t├¡nh qu├úng ─æ╞░ß╗¥ng...',
  '≡ƒÿê ─Éang loß║íi nhß╗»ng ─æiß╗âm ΓÇ£check-in cho c├│ΓÇ¥...',
  'ΓÿÇ∩╕Å ─Éang kiß╗âm tra xem bß║ín c├│ chß╗ïu nß╗òi c├íi nß║»ng miß╗ün Trung kh├┤ng...'
]

const currentLoadingMessageIndex = ref(0)
const currentLoadingMessage = computed(() => LOADING_MESSAGES[currentLoadingMessageIndex.value] || LOADING_MESSAGES[0])

// 7. Th├┤ng ─æiß╗çp ho├án tß║Ñt lß╗ïch tr├¼nh c├│ personality
const COMPLETION_QUOTES = [
  {
    icon: '≡ƒÄë',
    title: 'Xong! Kß║┐ hoß║ích ─æi ch╞íi ─æ├ú ─æ╞░ß╗úc l├¬n.',
    desc: 'Giß╗¥ chß╗ë c├▓n 3 viß╗çc: chuß║⌐n bß╗ï ─æß╗ô, sß║íc ─æiß╗çn thoß║íi v├áΓÇª xin ph├⌐p phß╗Ñ huynh.'
  },
  {
    icon: '≡ƒù║∩╕Å',
    title: 'Lß╗ïch tr├¼nh ho├án tß║Ñt!',
    desc: 'T├┤i ─æ├ú lo phß║ºn ─æ╞░ß╗¥ng ─æi. Bß║ín lo phß║ºn chß╗Ñp ß║únh.'
  }
]

const activeCompletionQuote = ref(COMPLETION_QUOTES[0])
const hienCompletionBanner = ref(false)
const personalityToast = ref(null)

// 8. ─É├ính gi├í t├¡nh c├ích AI theo mß╗⌐c ng├ón s├ích
const thongDiepNganSach = computed(() => {
  const budget = Number(formDuLieu.nganSach) || 0
  const people = Number(formDuLieu.soNguoi) || 1
  const perPerson = Math.round(budget / people)

  if (budget <= 100000) {
    return {
      type: 'budget-danger',
      icon: '≡ƒÜ¿',
      tag: 'B├üO ─Éß╗ÿNG V├ì TIß╗ÇN',
      title: 'V├¡ cß╗ºa bß║ín ─æang c├│ dß║Ñu hiß╗çu nguy hiß╗âm.',
      desc: 'Khuyß║┐n nghß╗ï: ngß║»m cß║únh miß╗àn ph├¡ v├á hß║ín chß║┐ nh├¼n menu.'
    }
  }

  if (budget <= 500000) {
    return {
      type: 'budget-minimal',
      icon: '≡ƒÆ╕',
      tag: 'PHONG C├üCH Tß╗ÉI GIß║óN',
      title: `Ng├ón s├ích: ${dinhDangTien(budget)}─æ`,
      desc: 'Kh├┤ng sao. Ch├║ng ta kh├┤ng ngh├¿o, ch├║ng ta ─æang du lß╗ïch theo phong c├ích tß╗æi giß║ún. (500K? ─É╞░ß╗úc, nh╞░ng t├┤i kh├┤ng ─æß║úm bß║úo bß║ín ─æ╞░ß╗úc ─ân hß║úi sß║ún mß╗ùi bß╗»a ─æ├óu nh├⌐! ≡ƒÿ¡)'
    }
  }

  if (budget <= 1500000) {
    return {
      type: 'budget-saving',
      icon: '≡ƒÄÆ',
      tag: 'TIß║╛T KIß╗åM & THß╗░C Tß║╛',
      title: `Ng├ón s├ích: ${dinhDangTien(budget)}─æ (~${dinhDangTien(perPerson)}─æ/ng╞░ß╗¥i)`,
      desc: 'Mß╗⌐c ng├ón s├ích cß╗▒c chuß║⌐n cho sinh vi├¬n & ph╞░ß╗út thß╗º! B├ính m├¼ que, b├ính b├¿o, ch├¿ hß║╗m ─æang vß║½y gß╗ìi.'
    }
  }

  if (budget <= 5000000) {
    return {
      type: 'budget-cozy',
      icon: 'Γ£¿',
      tag: 'DU Lß╗èCH Rß╗ªNG Rß╗êNH',
      title: `Ng├ón s├ích: ${dinhDangTien(budget)}─æ (~${dinhDangTien(perPerson)}─æ/ng╞░ß╗¥i)`,
      desc: 'Rß║Ñt thoß║úi m├íi! ─én hß║úi sß║ún t╞░╞íi r├│i, cafe view biß╗ân triß╗çu ─æ├┤ v├á kh├ích sß║ín tiß╗çn nghi!'
    }
  }

  return {
    type: 'budget-luxury',
    icon: '≡ƒÆÄ',
    tag: '─Éß║áI GIA MIß╗ÇN TRUNG',
    title: `Ng├ón s├ích: ${dinhDangTien(budget)}─æ (~${dinhDangTien(perPerson)}─æ/ng╞░ß╗¥i)`,
    desc: 'Resort sang xß╗ïn, buffet t├┤m h├╣m, AI chß╗ë lo bß║ín mß╗çt v├¼ ti├¬u tiß╗ün kh├┤ng kß╗ïp th├┤i!'
  }
})

// Chat AI State
const nhanTin = ref([])
const chatText = ref('')
const dangGuiChat = ref(false)
const dangDieuChinh = ref(false)
const chatBoxRef = ref(null)

// Auth & Social State
const nguoiDung = ref(null)
const dangKyMode = ref(false)
const hienAuthModal = ref(false)
const authForm = reactive({ name: '', email: '', password: '' })
const authError = ref('')
const myTripsList = ref([])
const favoritesList = ref([])

// Tool Modals
const hienBillSplitter = ref(false)
const splitterTongTien = ref(3500000)
const splitterSoNguoi = ref(2)
const hienTravelPass = ref(false)

// Computed Lists
const attractionsList = computed(() => (places.value || []).filter(p => p.type === 'attraction'))
const restaurantsList = computed(() => (places.value || []).filter(p => p.type === 'restaurant'))
const hotelsList = computed(() => (places.value || []).filter(p => p.type === 'hotel'))
const cafesList = computed(() => (places.value || []).filter(p => p.type === 'cafe'))

// ─Éß╗òi ─æß╗ïa ─æiß╗âm State
const showChangePlaceModal = ref(false)
const changingActivity = ref(null)
const alternativePlaces = ref([])

function moModalDoiDiaDiem(dayIndex, actIndex, actType) {
  changingActivity.value = { dayIndex, actIndex, actType }
  let targetType = actType
  if (['breakfast', 'lunch', 'dinner'].includes(actType)) targetType = 'restaurant'
  
  alternativePlaces.value = (places.value || []).filter(p => p.type === targetType)
  showChangePlaceModal.value = true
}

function chonDiaDiemMoi(newPlace) {
  if (!changingActivity.value || !lichTrinh.value) return
  const { dayIndex, actIndex, actType } = changingActivity.value
  
  const actToUpdate = lichTrinh.value.daysList[dayIndex].activities[actIndex]
  actToUpdate.place = newPlace.name
  actToUpdate.address = newPlace.address || `Khu vß╗▒c ${lichTrinh.value.destination}`
  actToUpdate.estimated_cost = newPlace.estimated_cost || 50000
  actToUpdate.latitude = newPlace.latitude
  actToUpdate.longitude = newPlace.longitude
  
  if (['breakfast', 'lunch', 'dinner'].includes(actType)) {
    actToUpdate.activity = `Th╞░ß╗ƒng thß╗⌐c ß║⌐m thß╗▒c tß║íi ${newPlace.name}`
  } else {
    actToUpdate.activity = newPlace.description || `Tham quan v├á trß║úi nghiß╗çm tß║íi ${newPlace.name}`
  }
  
  showChangePlaceModal.value = false
  changingActivity.value = null
  
  setTimeout(() => renderLeafletMap(), 100)
}

// AI Deep Crawl State
const dangCrawl = ref(false)
const thongBaoCrawl = ref('')

async function kichHoatAICrawl(destOverride = null) {
  const dest = destOverride || formDuLieu.diemDen || '─É├á Nß║╡ng'
  dangCrawl.value = true
  thongBaoCrawl.value = `≡ƒñû AI ─æang tß╗▒ ─æß╗Öng c├áo qu├⌐t s├óu to├án bß╗Ö danh lam thß║»ng cß║únh, qu├ín ngon & kh├ích sß║ín tß║íi "${dest}"...`
  try {
    const res = await api.post('/places/crawl-deep', { destination: dest })
    await taiDuLieuThanhPho()
    thongBaoCrawl.value = `≡ƒÄë ${res.data?.message || 'C├áo dß╗» liß╗çu th├ánh c├┤ng!'} (Hiß╗çn c├│ ${places.value.length} ─æß╗ïa ─æiß╗âm)`
    setTimeout(() => { thongBaoCrawl.value = '' }, 6000)
  } catch (e) {
    thongBaoCrawl.value = 'ΓÜá∩╕Å Lß╗ùi khi c├áo dß╗» liß╗çu: ' + (e?.response?.data?.error || e.message)
    setTimeout(() => { thongBaoCrawl.value = '' }, 6000)
  } finally {
    dangCrawl.value = false
  }
}

const searchExploreQuery = ref('')
const exploreLimit = ref(5)

const filteredExplorePlaces = computed(() => {
  let list = places.value || []
  if (filterExploreType.value !== 'all') {
    list = list.filter(p => p.type === filterExploreType.value)
  }
  const q = (searchExploreQuery.value || '').trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    )
  }
  return list
})

// Hiß╗ân thß╗ï tß╗æi ─æa 5 ─æß╗ïa ─æiß╗âm ban ─æß║ºu
const displayedExplorePlaces = computed(() => {
  return filteredExplorePlaces.value.slice(0, exploreLimit.value)
})

function xemThemDiaDiem() {
  exploreLimit.value += 5
}

function thuGonDiaDiem() {
  exploreLimit.value = 5
}

// Tß╗▒ ─æß╗Öng ─æß║╖t lß║íi giß╗¢i hß║ín 5 ─æß╗ïa ─æiß╗âm khi chuyß╗ân tß╗ënh th├ánh, bß╗Ö lß╗ìc hoß║╖c g├╡ t├¼m kiß║┐m
watch([() => formDuLieu.diemDen, filterExploreType, searchExploreQuery], () => {
  exploreLimit.value = 5
})

// Bß║ún ─æß╗ô trung t├óm c├íc tß╗ënh miß╗ün Trung (fallback khi kh├┤ng c├│ tß╗ìa ─æß╗Ö)
const DESTINATION_CENTERS = {
  '─É├á Nß║╡ng':    [16.047079, 108.206230],
  'Huß║┐':        [16.463713, 107.590866],
  'Hß╗Öi An':     [15.879884, 108.335211],
  'Quß║úng Nam':  [15.879884, 108.335211],
  'Nha Trang':  [12.238791, 109.196749],
  '─É├á Lß║ít':     [11.940419, 108.458313],
  'Quß║úng B├¼nh': [17.469603, 106.622633],
  'Quß║úng Trß╗ï':  [16.815773, 107.100786],
  'Quß║úng Ng├úi': [15.120498, 108.792480],
  'Quy Nh╞ín':   [13.782553, 109.219428],
  'Thanh H├│a':  [19.808068, 105.784964],
  'Nghß╗ç An':    [18.666667, 105.666667],
  'H├á T─⌐nh':    [18.355556, 105.888611],
  'Gia Lai':    [13.983333, 108.000000],
  '─Éß║»k Lß║»k':   [12.666667, 108.033333],
}

function getDestCenter() {
  const dest = lichTrinh.value?.destination || ''
  for (const [k, v] of Object.entries(DESTINATION_CENTERS)) {
    if (dest.includes(k) || k.includes(dest)) return v
  }
  return [16.047079, 108.206230] // Default: ─É├á Nß║╡ng
}

let routingMap = null;
let routingLayerGroup = null;
let markerElementsMap = {};

const hoveredActIndex = ref(null);

function renderLeafletMap() {
  if (!lichTrinh.value) return;
  const trip = lichTrinh.value;
  const day = trip?.daysList?.find(item => item.day === selectedDay.value) || trip?.daysList?.[0];
  const stops = day?.activities?.filter(a => a.latitude && a.longitude) || [];

  nextTick(() => {
    const mapEl = document.getElementById('routing-map');
    if (!mapEl) return;

    // Hß╗ºy map c┼⌐ tr╞░ß╗¢c
    if (routingMap) {
      routingMap.off();
      routingMap.remove();
      routingMap = null;
      routingLayerGroup = null;
      markerElementsMap = {};
    }

    // Khß╗ƒi tß║ío map
    setTimeout(() => {
      const el2 = document.getElementById('routing-map');
      if (!el2 || el2.clientHeight === 0) return;

      routingMap = L.map('routing-map', { zoomControl: true });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(routingMap);

      routingLayerGroup = L.layerGroup().addTo(routingMap);
      markerElementsMap = {};

      if (stops.length === 0) {
        const center = getDestCenter();
        routingMap.setView(center, 13);
        routingMap.invalidateSize();
        return;
      }

      const latlngs = stops.map(s => [s.latitude, s.longitude]);

      // 4. Cß║»m Marker c├│ sß╗æ thß╗⌐ tß╗▒ & hß╗ù trß╗ú hiß╗çu ß╗⌐ng nß║úy (bounce) khi hover card
      stops.forEach((stop, index) => {
        const numIcon = L.divIcon({
          html: `<div id="map-marker-${index}" class="itinerary-map-marker"><span class="imm-num">${index + 1}</span></div>`,
          className: 'custom-itinerary-marker-wrapper',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });
        const marker = L.marker([stop.latitude, stop.longitude], { icon: numIcon })
          .bindPopup(`<div class="map-popup-card"><b>${index + 1}. ${stop.place}</b><br/><small>≡ƒôì ${stop.address || ''}</small></div>`)
          .addTo(routingLayerGroup);
          
        marker.on('click', () => {
          const actCard = document.getElementById(`activity-card-${selectedDay.value - 1}-${index}`);
          if (actCard) {
            actCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            actCard.style.transition = 'background-color 0.5s ease';
            actCard.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            setTimeout(() => { actCard.style.backgroundColor = 'transparent'; }, 1500);
          }
        });

        markerElementsMap[index] = marker;
      });

      // 4. Nß╗æi ─æ╞░ß╗¥ng ─æi tr├¬n bß║ún ─æß╗ô (Route Polyline n├⌐t ─æß╗⌐t hiß╗çn ─æß║íi)
      if (latlngs.length > 1) {
        // Lß╗¢p viß╗ün mß╗¥ d╞░ß╗¢i tß║ío chiß╗üu s├óu b├│ng ph├ít s├íng
        L.polyline(latlngs, {
          color: '#10b981', // emerald-500
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routingLayerGroup);

        // ─É╞░ß╗¥ng nß╗æi n├⌐t ─æß╗⌐t ch├¡nh 1 -> 2 -> 3
        L.polyline(latlngs, {
          color: '#059669', // emerald-600
          weight: 3.5,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routingLayerGroup);
      }

      // Tß╗▒ ─æß╗Öng c─ân chß╗ënh vß╗½a vß║╖n vß╗¢i to├án bß╗Ö c├íc ─æiß╗âm trong ng├áy
      if (latlngs.length > 1) {
        const bounds = L.latLngBounds(latlngs);
        routingMap.fitBounds(bounds, { padding: [45, 45] });
      } else {
        routingMap.setView(latlngs[0], 14);
      }

      routingMap.invalidateSize();
    }, 350);
  });
}

function hoverActivity(act, index, dayNum) {
  if (selectedDay.value !== dayNum) return;
  hoveredActIndex.value = index;
  const markerEl = document.getElementById(`map-marker-${index}`);
  if (markerEl) {
    markerEl.classList.add('marker-bouncing');
  }
  if (markerElementsMap[index]) {
    markerElementsMap[index].openPopup();
  }
}

function unhoverActivity(act, index) {
  hoveredActIndex.value = null;
  const markerEl = document.getElementById(`map-marker-${index}`);
  if (markerEl) {
    markerEl.classList.remove('marker-bouncing');
  }
}

function panToActivity(act) {
  if (act.latitude && act.longitude && routingMap) {
    routingMap.flyTo([act.latitude, act.longitude], 15, { duration: 0.8 });
  }
}

// ==================== K├ëO - THß║ó Sß║«P Xß║╛P Lß║áI THß╗¿ Tß╗░ (DRAG & DROP REORDERING) ====================
const dangKeoDayIdx = ref(null);
const dangKeoActIdx = ref(null);
const dragOverDayIdx = ref(null);
const dragOverActIdx = ref(null);

function onDragStart(event, dayIdx, actIdx) {
  dangKeoDayIdx.value = dayIdx;
  dangKeoActIdx.value = actIdx;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `${dayIdx}:${actIdx}`);
  }
}

function onDragOver(event, dayIdx, actIdx) {
  if (dangKeoDayIdx.value === dayIdx && dangKeoActIdx.value !== actIdx) {
    dragOverDayIdx.value = dayIdx;
    dragOverActIdx.value = actIdx;
  }
}

function onDragLeave(event, dayIdx, actIdx) {
  if (dragOverDayIdx.value === dayIdx && dragOverActIdx.value === actIdx) {
    dragOverDayIdx.value = null;
    dragOverActIdx.value = null;
  }
}

function onDragEnd() {
  dangKeoDayIdx.value = null;
  dangKeoActIdx.value = null;
  dragOverDayIdx.value = null;
  dragOverActIdx.value = null;
}

function onDrop(event, targetDayIdx, targetActIdx) {
  const srcDayIdx = dangKeoDayIdx.value;
  const srcActIdx = dangKeoActIdx.value;
  onDragEnd();

  if (srcDayIdx === null || srcActIdx === null) return;
  if (srcDayIdx !== targetDayIdx || srcActIdx === targetActIdx) return;

  const day = lichTrinh.value?.daysList?.[targetDayIdx];
  if (!day || !day.activities) return;

  // Ho├ín ─æß╗òi vß╗ï tr├¡ hoß║ít ─æß╗Öng
  const [movedItem] = day.activities.splice(srcActIdx, 1);
  day.activities.splice(targetActIdx, 0, movedItem);

  // Tß╗▒ ─æß╗Öng ph├ón bß╗ò lß║íi mß╗æc giß╗¥ hß╗úp l├╜
  const DEFAULT_TIMES = ['07:30', '09:00', '11:45', '14:00', '16:30', '19:00', '21:00'];
  day.activities.forEach((act, idx) => {
    if (DEFAULT_TIMES[idx]) act.time = DEFAULT_TIMES[idx];
  });

  // Vß║╜ lß║íi bß║ún ─æß╗ô lß╗Ö tr├¼nh (cß║¡p nhß║¡t lß║íi sß╗æ thß╗⌐ tß╗▒ markers & polyline nß╗æi)
  renderLeafletMap();

  personalityToast.value = {
    icon: 'Γ£¿',
    title: '─É├ú ho├ín ─æß╗òi thß╗⌐ tß╗▒!',
    desc: `─É├ú ─æß╗òi chß╗ù "${movedItem.place}" v├á tß╗▒ ─æß╗Öng t├¡nh lß║íi giß╗¥, khoß║úng c├ích di chuyß╗ân.`
  };
  setTimeout(() => {
    personalityToast.value = null;
  }, 4000);
}

// ==================== C├üC H├ÇM TIß╗åN ├ìCH HIß╗éN THß╗è THß║║ V├Ç Lß╗ÿ TR├îNH GOOGLE MAPS ====================
function taoLinkGoogleMapsChoNgay(day) {
  if (!day || !day.activities || day.activities.length === 0) return 'https://www.google.com/maps';
  const dest = lichTrinh.value?.destination || formDuLieu.diemDen || 'Viß╗çt Nam';
  const stops = day.activities.map(a => {
    return a.address ? `${a.place}, ${a.address}` : `${a.place}, ${dest}`;
  });
  if (stops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`;
  }
  return `https://www.google.com/maps/dir/${stops.map(encodeURIComponent).join('/')}`;
}

const showRainModal = ref(false);
const targetRainDayIdx = ref(0);
const rainModalOldPlaces = ref([]);
const rainModalNewPlaces = ref([]);

function moModalTranhMua(dayIdx = 0) {
  targetRainDayIdx.value = dayIdx;
  
  rainModalOldPlaces.value = [];
  rainModalNewPlaces.value = [];
  
  if (lichTrinh.value?.daysList?.[dayIdx]) {
    const day = lichTrinh.value.daysList[dayIdx];
    const indoorOptions = [
      { place: 'Bß║úo t├áng Nghß╗ç thuß║¡t & Di sß║ún', activity: 'Kh├ím ph├í v─ân h├│a di sß║ún v├á chß╗Ñp ß║únh kh├┤ng gian triß╗ân l├úm nghß╗ç thuß║¡t trong nh├á tho├íng m├ít', type: 'attraction' },
      { place: 'Qu├ín C├á Ph├¬ Trß║ºm / Acoustic', activity: 'Th╞░ß╗ƒng thß╗⌐c c├á ph├¬ ─æß║╖c sß║ún, ngß║»m m╞░a v├á lß║»ng nghe giai ─æiß╗çu acoustic th╞░ th├íi', type: 'cafe' },
      { place: 'Chß╗ú ─Éß║╖c Sß║ún Trong Nh├á M├íi V├▓m', activity: 'Kh├ím ph├í thi├¬n ─æ╞░ß╗¥ng ß║⌐m thß╗▒c d├ón d├ú c├│ m├íi che, th╞░ß╗ƒng thß╗⌐c ─æß║╖c sß║ún ─æß╗ïa ph╞░╞íng', type: 'restaurant' }
    ];
    let changedCount = 0;
    day.activities.forEach((act, idx) => {
      const pTime = parseGioPhut(act.time);
      if (pTime && pTime >= 780 && pTime <= 1080 && changedCount < 2) {
        const indoor = indoorOptions[idx % indoorOptions.length];
        rainModalOldPlaces.value.push(act.place);
        rainModalNewPlaces.value.push(`${indoor.place} (${formDuLieu.diemDen})`);
        changedCount++;
      }
    });
  }

  showRainModal.value = true;
}

function xacNhanDoiLichTranhMua() {
  showRainModal.value = false;
  chuyenDiemTrongNha(targetRainDayIdx.value);
  personalityToast.value = {
    icon: '≡ƒîº∩╕Å',
    title: '─É├ú cß║¡p nhß║¡t lß╗ïch tr├¼nh tr├ính m╞░a!',
    desc: `─É├ú ho├ín ─æß╗òi c├íc ─æiß╗âm ngo├ái trß╗¥i v├á chß╗ìn kh├┤ng gian trong nh├á cho Ng├áy ${targetRainDayIdx.value + 1}.`
  };
  setTimeout(() => {
    personalityToast.value = null;
  }, 4500);
}

function getGioMoCua(type) {
  switch (type) {
    case 'breakfast': return '06:30 - 10:30';
    case 'lunch': return '10:30 - 14:00';
    case 'dinner': return '16:30 - 22:30';
    case 'cafe': return '07:00 - 22:30';
    case 'attraction': return '07:30 - 17:30';
    case 'checkin': return 'Nhß║¡n ph├▓ng tß╗½ 14:00';
    case 'checkout': return 'Trß║ú ph├▓ng tr╞░ß╗¢c 12:00';
    default: return '07:00 - 22:00';
  }
}

function onImageError(e) {
  e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80';
}

function sinhMoTaThucTeFrontend(act, diemDen = 'Miß╗ün Trung') {
  const pName = (act?.place || '').toLowerCase();
  const type = act?.type || 'attraction';
  const dest = diemDen || 'Miß╗ün Trung';

  if (type === 'breakfast' || type === 'lunch' || type === 'dinner' || type === 'restaurant') {
    if (pName.includes('b├║n b├▓')) {
      return `Nß╗òi tiß║┐ng vß╗¢i b├║n b├▓ cay nß╗ông chuß║⌐n vß╗ï ${dest}, n╞░ß╗¢c d├╣ng ninh x╞░╞íng ─æß║¡m ─æ├á v├á nem lß╗Ñi n╞░ß╗¢ng than hoa.`;
    }
    if (pName.includes('nem') || pName.includes('lß╗Ñi')) {
      return `Nß╗òi tiß║┐ng vß╗¢i nem lß╗Ñi n╞░ß╗¢ng than hoa v├áng rß╗Öm th╞ím lß╗½ng, cuß╗æn b├ính tr├íng rau sß╗æng t╞░╞íi m├ít v├á n╞░ß╗¢c l├¿o b├⌐o b├╣i.`;
    }
    if (pName.includes('c╞ím hß║┐n') || pName.includes('b├║n hß║┐n') || pName.includes('hß║┐n')) {
      return `Th╞░ß╗ƒng thß╗⌐c c╞ím hß║┐n ─æß║¡m ─æ├á vß╗ï ruß╗æc cay nß╗ông, t├│p mß╗í gi├▓n rß╗Ñm v├á rau bß║»p chuß╗æi t╞░╞íi m├ít ─æß║╖c tr╞░ng.`;
    }
    if (pName.includes('b├ính b├¿o') || pName.includes('b├ính nß║¡m') || pName.includes('b├ính lß╗ìc') || pName.includes('b├ính kho├íi')) {
      return `M├óm b├ính ─æß║╖c sß║ún n├│ng hß╗òi vß╗¢i vß╗Å b├ính dß║╗o trong, nh├ón t├┤m thß╗ït ─æß║¡m vß╗ï, rß║»c t├┤m chß║Ñy v├á n╞░ß╗¢c mß║»m ß╗¢t th╞ím cay.`;
    }
    if (pName.includes('m├¼ quß║úng') || pName.includes('mi quang')) {
      return `─Éß║╖c sß║ún m├¼ quß║úng sß╗úi dß║╗o dai chan n╞░ß╗¢c nh╞░n t├┤m thß╗ït s├ính ─æß║¡m, rß║»c lß║íc rang th╞ím lß╗½ng ─ân k├¿m b├ính tr├íng m├¿ n╞░ß╗¢ng gi├▓n.`;
    }
    if (pName.includes('cao lß║ºu')) {
      return `Cao lß║ºu trß╗⌐ danh vß╗¢i sß╗úi m├¼ tro gi├▓n dai, thß╗ït x├í x├¡u mß╗üm th╞ím, t├⌐p mß╗í gi├▓n tan c├╣ng rau th╞ím l├áng Tr├á Quß║┐.`;
    }
    if (pName.includes('ch├¿')) {
      return `Th╞░ß╗ƒng thß╗⌐c c├íc m├│n ch├¿ thanh tao m├ít l├ánh nh╞░ ch├¿ hß║ít sen long nh├ún, ch├¿ bß╗Öt lß╗ìc bß╗ìc heo quay ─æß╗Öc ─æ├ío.`;
    }
    if (pName.includes('b├ính canh')) {
      return `T├┤ b├ính canh n├│ng hß╗òi nghi ng├║t kh├│i vß╗¢i n╞░ß╗¢c d├╣ng ngß╗ìt ─æß║¡m tß╗½ x╞░╞íng c├í, sß╗úi bß╗Öt mß╗üm dß║╗o v├á h├ánh hoa th╞ím nß╗⌐c.`;
    }
    if (pName.includes('hß║úi sß║ún') || pName.includes('seafood') || pName.includes('ß╗æc')) {
      return `Hß║úi sß║ún t╞░╞íi sß╗æng ─æ├ính bß║»t trong ng├áy, chß║┐ biß║┐n ─æß║¡m ─æ├á hß║Ñp sß║ú hoß║╖c n╞░ß╗¢ng mß╗í h├ánh th╞ím lß╗½ng vß╗ï biß╗ân cß║ú.`;
    }
    if (pName.includes('c╞ím ni├¬u')) {
      return `Trß║úi nghiß╗çm c╞ím ni├¬u ─æß║¡p ch├íy gi├▓n th╞ím phß╗⌐c, ─ân k├¿m c├í kho tß╗Ö ─æß║¡m vß╗ï, canh cua ─æß╗ông chuß║⌐n vß╗ï qu├¬ nh├á.`;
    }
    return `Th╞░ß╗ƒng thß╗⌐c ß║⌐m thß╗▒c ─æß║╖c sß║»c xß╗⌐ ${dest}, nguy├¬n liß╗çu t╞░╞íi ngon ─æ╞░ß╗úc chß║┐ biß║┐n chuß║⌐n vß╗ï ─æß╗ïa ph╞░╞íng.`;
  }

  if (type === 'cafe') {
    if (pName.includes('muß╗æi')) {
      return `Nß╗òi tiß║┐ng vß╗¢i m├│n c├á ph├¬ muß╗æi b├⌐o ngß║¡y ─æß╗Öc ─æ├ío, lß╗¢p kem mß║╖n m╞░ß╗út m├á c├ón bß║▒ng ho├án hß║úo vß╗ï ─æß║»ng ─æß║¡m ─æ├á.`;
    }
    if (pName.includes('tr├á') || pName.includes('tea')) {
      return `Kh├┤ng gian th╞░ß╗ƒng tr├á an y├¬n, phong vß╗ï thanh tao vß╗¢i c├íc d├▓ng tr├á hoa thß║úo mß╗Öc th╞ím nhß║╣ gi├║p th╞░ gi├ún t├óm hß╗ôn.`;
    }
    return `Kh├┤ng gian th╞░ gi├ún nhß║╣ nh├áng, thß╗⌐c uß╗æng pha chß║┐ chß╗ën chu v├á nhiß╗üu g├│c check-in sß╗æng ß║úo cß╗▒c chill.`;
  }

  if (type === 'attraction' || type === 'checkin') {
    if (pName.includes('─æß║íi nß╗Öi') || pName.includes('ho├áng th├ánh') || pName.includes('cß╗æ ─æ├┤')) {
      return `Quß║ºn thß╗â di t├¡ch Cß╗æ ─æ├┤ nguy nga tr├íng lß╗ç, kh├ím ph├í kiß║┐n tr├║c cung ─æ├¼nh triß╗üu Nguyß╗àn v├á l╞░u giß╗» nhß╗»ng bß╗⌐c ß║únh ho├ái niß╗çm.`;
    }
    if (pName.includes('ch├╣a') || pName.includes('thiß╗ün viß╗çn') || pName.includes('tß╗ïnh x├í') || pName.includes('linh ß╗⌐ng') || pName.includes('thi├¬n mß╗Ñ')) {
      return `Chß╗æn t├óm linh thanh tß╗ïnh giß╗»a non n╞░ß╗¢c hß╗»u t├¼nh, chi├¬m b├íi cß║ºu an v├á ngß║»m trß╗ìn cß║únh sß║»c thi├¬n nhi├¬n an b├¼nh.`;
    }
    if (pName.includes('l─âng')) {
      return `Kiß╗çt t├íc kiß║┐n tr├║c l─âng tß║⌐m ho├áng gia h├▓a quyß╗çn giß╗»a nghß╗ç thuß║¡t truyß╗ün thß╗æng v├á thi├¬n nhi├¬n ─æß╗ôi th├┤ng th╞í mß╗Öng.`;
    }
    if (pName.includes('bß║úo t├áng')) {
      return `Khu tr╞░ng b├áy mß║½u vß║¡t v├á hiß╗çn vß║¡t lß╗ïch sß╗¡ v─ân h├│a phong ph├║, th├¡ch hß╗úp check-in s├íng sß╗¢m v├á t├¼m hiß╗âu cß╗Öi nguß╗ôn.`;
    }
    if (pName.includes('biß╗ân') || pName.includes('b├úi')) {
      return `Bß╗¥ c├ít mß╗ïn thoß║úi d├ái ─æ├│n l├án n╞░ß╗¢c xanh m├ít, l├╜ t╞░ß╗ƒng ─æß╗â dß║ío bß╗Ö ─æ├│n b├¼nh minh, chß╗Ñp ß║únh sß╗æng ß║úo v├á tß║»m biß╗ân sß║úng kho├íi.`;
    }
    if (pName.includes('cß║ºu') || pName.includes('s├┤ng')) {
      return `Biß╗âu t╞░ß╗úng cß║únh quan ─æ├┤i bß╗¥ s├┤ng th╞í mß╗Öng, kh├┤ng gian tho├íng ─æ├úng l├╜ t╞░ß╗ƒng ─æß╗â dß║ío gi├│, ngß║»m ho├áng h├┤n bu├┤ng xuß╗æng.`;
    }
    if (pName.includes('─æß╗Öng') || pName.includes('suß╗æi') || pName.includes('th├íc')) {
      return `Kh├ím ph├í kß╗│ quan thi├¬n nhi├¬n hoang s╞í h├╣ng v─⌐, bß║ºu kh├┤ng kh├¡ trong l├ánh m├ít mß║╗ v├á check-in g├│c m├íy triß╗çu view.`;
    }
    return `─Éiß╗âm tham quan danh thß║»ng nß╗òi tiß║┐ng tß║íi ${dest}, sß╗ƒ hß╗»u cß║únh quan ß║Ñn t╞░ß╗úng v├á gi├í trß╗ï v─ân h├│a ─æß╗Öc ─æ├ío.`;
  }

  if (type === 'hotel') {
    return `Kh├ích sß║ín nghß╗ë d╞░ß╗íng tiß╗çn nghi, kh├┤ng gian tho├íng ─æ├úng, phß╗Ñc vß╗Ñ chu ─æ├ío v├á thuß║¡n tiß╗çn di chuyß╗ân.`;
  }

  return `Kh├ím ph├í v├á trß║úi nghiß╗çm kh├┤ng gian ─æß╗Öc ─æ├ío tß║íi ${dest}.`;
}

function lamSachMoTa(text, act) {
  if (!text) return sinhMoTaThucTeFrontend(act, formDuLieu.diemDen);
  let cleaned = text
    .replace(/^Th╞░ß╗ƒng thß╗⌐c\/tham quan:\s*/i, '')
    .replace(/\s*\(Tß╗½ [^)]*?di chuyß╗ân[^)]*?\)/g, '')
    .trim();

  if (
    cleaned.includes('tr├¬n Google Maps') ||
    cleaned.includes('chß║Ñt l╞░ß╗úng cao') ||
    cleaned.includes('─Éß╗ïa ─æiß╗âm du lß╗ïch tham quan') ||
    cleaned.includes('─Éß╗ïa ─æiß╗âm ß║⌐m thß╗▒c ─æß║╖c sß║ún') ||
    cleaned.includes('─Éß╗ïa ─æiß╗âm qu├ín cafe check-in') ||
    cleaned.includes('─Éß╗ïa ─æiß╗âm kh├ích sß║ín nghß╗ë d╞░ß╗íng') ||
    cleaned.startsWith('─Éß╗ïa ─æiß╗âm ß║⌐m thß╗▒c') ||
    cleaned.startsWith('─Éß╗ïa ─æiß╗âm du lß╗ïch') ||
    cleaned.length < 15
  ) {
    return sinhMoTaThucTeFrontend(act, formDuLieu.diemDen);
  }
  return cleaned;
}

function moveActivity(day, actIndex, direction) {
  const newIndex = actIndex + direction;
  if (newIndex < 0 || newIndex >= day.activities.length) return;
  const temp = day.activities[actIndex];
  day.activities[actIndex] = day.activities[newIndex];
  day.activities[newIndex] = temp;
}

function getTravelEstimate(act, day, actIndex) {
  // 1. Dß╗» liß╗çu c├│ cß║Ñu tr├║c tß╗½ backend
  if (act.travel_from && act.travel_duration_mins) {
    const dist = Number(act.travel_distance_km || 1);
    return {
      from: act.travel_from,
      duration: `${act.travel_duration_mins} ph├║t`,
      distance: dist,
      cost: act.travel_cost || `~${Math.round(dist * 14000 / 1000) * 1000}─æ`,
      mode: dist < 1.5 ? '─Éi bß╗Ö th╞░ thß║ú' : dist < 6 ? 'Xe m├íy tiß╗çn lß╗úi' : '├ö t├┤ / Taxi'
    };
  }

  // 2. Dß╗» liß╗çu tr├¡ch xuß║Ñt tß╗½ chuß╗ùi m├┤ tß║ú nß║┐u c├│
  const rawText = act.activity || '';
  const match = rawText.match(/\(Tß╗½ (.*?) di chuyß╗ân ~([0-9.]+)km, khoß║úng ([0-9]+) ph├║t(?:, ph├¡ taxi ╞░ß╗¢c t├¡nh (.*?))?\)/);
  if (match) {
    const dist = parseFloat(match[2]);
    return {
      from: match[1],
      distance: match[2],
      duration: `${match[3]} ph├║t`,
      cost: match[4] || null,
      mode: dist < 1.5 ? '─Éi bß╗Ö th╞░ thß║ú' : dist < 6 ? 'Xe m├íy tiß╗çn lß╗úi' : '├ö t├┤ / Taxi'
    };
  }

  // 3. T├¡nh to├ín trß╗▒c tiß║┐p theo tß╗ìa ─æß╗Ö ─æiß╗âm tr╞░ß╗¢c ─æ├│ trong ng├áy hoß║╖c tß╗½ kh├ích sß║ín
  if (day && day.activities && act.latitude && act.longitude) {
    let prev = null;
    if (actIndex > 0) {
      prev = day.activities[actIndex - 1];
    } else if (lichTrinh.value?.hotel_recommendation) {
      prev = {
        name: lichTrinh.value.hotel_recommendation.name || 'Kh├ích sß║ín l╞░u tr├║',
        latitude: lichTrinh.value.hotel_recommendation.latitude,
        longitude: lichTrinh.value.hotel_recommendation.longitude
      };
    }

    if (prev && prev.latitude && prev.longitude) {
      const calc = tinhKhoangCachVaThoiGian(prev, act);
      if (calc && calc.distKm > 0.1 && calc.distKm < 150) {
        const cost = Math.round(calc.distKm * 14000 / 1000) * 1000;
        return {
          from: prev.name || prev.place || '─Éiß╗âm xuß║Ñt ph├ít',
          distance: calc.distKm,
          duration: `${calc.phut} ph├║t`,
          cost: `~${cost.toLocaleString('vi-VN')}─æ`,
          mode: `${calc.phuongTien} ${calc.labelPhuongTien}`
        };
      }
    }
  }

  return null;
}

// ==================== MAP VIEW TOGGLE & TRANSIT MICRO-UX LOGIC ====================
const itineraryViewMode = ref('split') // 'timeline' | 'split' | 'map'

function doiViewMode(mode) {
  itineraryViewMode.value = mode
  if (mode !== 'timeline') {
    nextTick(() => {
      setTimeout(() => {
        if (routingMap) routingMap.invalidateSize()
        else renderLeafletMap()
      }, 150)
    })
  }
}

function parseGioPhut(timeStr) {
  if (!timeStr) return null
  const m = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (m) {
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
  }
  return null
}

function tinhKhoangCachVaThoiGian(act1, act2) {
  if (!act1 || !act2) return null
  let distKm = null

  if (act1.latitude && act1.longitude && act2.latitude && act2.longitude) {
    const R = 6371
    const dLat = (act2.latitude - act1.latitude) * Math.PI / 180
    const dLon = (act2.longitude - act1.longitude) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(act1.latitude * Math.PI / 180) * Math.cos(act2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    distKm = Math.round(R * c * 10) / 10
  } else {
    distKm = 4.2
  }

  // ╞»ß╗¢c l╞░ß╗úng thß╗¥i gian di chuyß╗ân: trung b├¼nh ─æ├┤ thß╗ï 25-30 km/h + 4 ph├║t dß╗½ng/─æß╗ù
  let phut = Math.max(8, Math.round(distKm * 2.5) + 4)
  let phuongTien = '≡ƒÜù'
  let labelPhuongTien = '├ö t├┤ / Taxi'

  if (distKm < 1.2) {
    phuongTien = '≡ƒÜ╢'
    phut = Math.max(5, Math.round(distKm * 12))
    labelPhuongTien = '─Éi bß╗Ö th╞░ thß║ú'
  } else if (distKm < 5) {
    phuongTien = '≡ƒ¢╡'
    phut = Math.max(7, Math.round(distKm * 2) + 3)
    labelPhuongTien = 'Xe m├íy tiß╗çn lß╗úi'
  }

  // Cß║únh b├ío xung ─æß╗Öt thß╗¥i gian & lß╗Ö tr├¼nh (Warning Color Palette theo UI/UX Pro Max)
  const time1 = parseGioPhut(act1.time)
  const time2 = parseGioPhut(act2.time)
  let canhBao = null

  if (time1 !== null && time2 !== null) {
    const gapPhut = time2 - time1
    if (gapPhut > 0 && gapPhut <= 40) {
      canhBao = {
        type: 'warning-tight',
        icon: 'ΓÜá∩╕Å',
        title: 'Lß╗ïch tr├¼nh s├ít giß╗¥',
        desc: `Hai ─æiß╗âm chß╗ë c├ích nhau ${gapPhut} ph├║t nh╞░ng cß║ºn ~${phut} ph├║t di chuyß╗ân. Bß║ín c├│ thß╗â bß╗ï vß╗Öi!`
      }
    }
  }

  if (distKm > 18) {
    canhBao = {
      type: 'warning-far',
      icon: '≡ƒÜ¿',
      title: 'Khoß║úng c├ích xa (> 18 km)',
      desc: `Hai ─æiß╗âm c├ích nhau tß╗¢i ${distKm} km (~${phut} ph├║t xe). C├ón nhß║»c gß╗Öp ─æiß╗âm c├╣ng khu vß╗▒c!`
    }
  }

  const queryOrigin = act1.address ? `${act1.place}, ${act1.address}` : act1.place
  const queryDest = act2.address ? `${act2.place}, ${act2.address}` : act2.place
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(queryOrigin)}&destination=${encodeURIComponent(queryDest)}`

  return {
    distKm,
    phut,
    phuongTien,
    labelPhuongTien,
    canhBao,
    mapsUrl
  }
}

watch(selectedDay, () => {
  renderLeafletMap();
});

watch(lichTrinh, () => {
  renderLeafletMap();
}, { deep: true });

watch(activeTab, (newTab) => {
  if (newTab === 'planner') {
    // Lu├┤n re-render khi chuyß╗ân sang tab planner ─æß╗â tr├ính grey tiles
    renderLeafletMap()
    // Random c├óu AI mß╗¢i mß╗ùi khi v├áo tab planner
    refreshAiHint()
    showAiHintBubble.value = true
  }
});

onMounted(() => {
  // Try autoplay once; browsers may require the user to press the music toggle.
  window.setTimeout(() => toggleCityMusic(allDestinationsCard, true), 250)

  const saved = localStorage.getItem('currentTrip')
  if (saved) {
    try {
      lichTrinh.value = JSON.parse(saved)
      if (lichTrinh.value?.daysList?.[0]) {
        selectedDay.value = lichTrinh.value.daysList[0].day
      }
    } catch (e) {
      console.error(e)
    }
  }
  
  if (activeTab.value === 'planner') {
    nextTick(() => {
      renderLeafletMap();
    });
  }
})

function dinhDangTien(v) {
  if (!v && v !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(v)
}

function dinhDangNgay(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
}

function dinhDangNgayNgan(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}

function getPlaceTypeLabel(type) {
  const map = {
    attraction: '≡ƒô╕ Thß║»ng cß║únh',
    restaurant: '≡ƒì▓ ß║¿m thß╗▒c',
    cafe: 'Γÿò Cafe & Bar',
    hotel: '≡ƒÅ¿ Kh├ích sß║ín'
  }
  return map[type] || '≡ƒôì ─Éß╗ïa ─æiß╗âm'
}

function getBadgeInfo(act) {
  if (!act) return { icon: '≡ƒôì', label: 'Hoß║ít ─æß╗Öng', class: 'badge-attraction' }
  if (act.type) {
    const map = {
      breakfast: { icon: '≡ƒÑó', label: act.label || '─én s├íng', class: 'badge-breakfast' },
      lunch: { icon: '≡ƒì£', label: act.label || '─én tr╞░a', class: 'badge-lunch' },
      dinner: { icon: '≡ƒì▓', label: act.label || '─én tß╗æi', class: 'badge-dinner' },
      checkin: { icon: '≡ƒ¢û', label: act.label || 'Nhß║¡n ph├▓ng', class: 'badge-hotel' },
      checkout: { icon: '≡ƒÜ¬', label: act.label || 'Trß║ú ph├▓ng', class: 'badge-hotel' },
      cafe: { icon: 'Γÿò', label: act.label || 'Cafe & Chill', class: 'badge-cafe' },
      attraction: { icon: 'Γ¢⌐∩╕Å', label: act.label || 'Tham quan / Check-in', class: 'badge-attraction' }
    }
    if (map[act.type]) return map[act.type]
  }
  return { icon: '≡ƒô╕', label: 'Tham quan / Check-in', class: 'badge-attraction' }
}

function chiDuongUrl(place, address = '') {
  const query = address ? `${place}, ${address}` : `${place}, ${formDuLieu.diemDen}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

function togglePlaceSelection(placeName) {
  const idx = selectedPlaces.value.indexOf(placeName)
  if (idx >= 0) selectedPlaces.value.splice(idx, 1)
  else selectedPlaces.value.push(placeName)
}

function isPlaceSelected(placeName) {
  return selectedPlaces.value.includes(placeName)
}

function isFavorite(placeId) {
  if (!placeId) return false
  return favoritesList.value.some(p => p._id === placeId || p === placeId)
}

function getPlaceImage(place) {
  if (place?.image) return place.image
  const name = (place?.name || '').toLowerCase()

  if (name.includes('phong nha') || name.includes('thi├¬n ─æ╞░ß╗¥ng') || name.includes('hang tß╗æi') || name.includes('─æß╗Öng')) {
    return 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('suß╗æi n╞░ß╗¢c moß╗ìc') || name.includes('suß╗æi moß╗ìc') || name.includes('s├┤ng ch├áy')) {
    return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('─æ├í nhß║úy') || name.includes('g├ánh ─æ├í') || name.includes('eo gi├│') || name.includes('kß╗│ co')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('cß╗ôn c├ít') || name.includes('quang ph├║')) {
    return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('biß╗ân') || name.includes('nhß║¡t lß╗ç') || name.includes('mß╗╣ kh├¬') || name.includes('an b├áng') || name.includes('m┼⌐i ─æiß╗çn')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('b├á n├á') || name.includes('cß║ºu v├áng') || name.includes('s╞ín tr├á') || name.includes('ng┼⌐ h├ánh s╞ín') || name.includes('cß║ºu rß╗ông')) {
    return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('phß╗æ cß╗ò') || name.includes('hß╗Öi an') || name.includes('ch├╣a cß║ºu') || name.includes('rß╗½ng dß╗½a')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('─æß║íi nß╗Öi') || name.includes('l─âng') || name.includes('thi├¬n mß╗Ñ') || name.includes('s├┤ng h╞░╞íng') || name.includes('l├áng h╞░╞íng')) {
    return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('mß║╣ suß╗æt') || name.includes('quß║úng b├¼nh quan') || name.includes('bß║úo t├áng') || name.includes('di t├¡ch')) {
    return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'restaurant' || name.includes('b├ính') || name.includes('ch├ío') || name.includes('m├¼') || name.includes('b├║n') || name.includes('hß║úi sß║ún') || name.includes('c╞ím') || name.includes('g├á') || name.includes('lß║⌐u')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'cafe' || name.includes('cafe') || name.includes('coffee') || name.includes('c├á ph├¬') || name.includes('tr├á')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'hotel' || name.includes('hotel') || name.includes('resort') || name.includes('kh├ích sß║ín')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80'
}

function themVaoLichTrinhVaMoPlanner(placeName) {
  if (!selectedPlaces.value.includes(placeName)) {
    selectedPlaces.value.push(placeName)
  }
  activeTab.value = 'planner'
}

let reqIdCounter = 0
function chonNhanhDiemDen(city) {
  formDuLieu.diemDen = city
  selectedPlaces.value = []
  taiDuLieuThanhPho()
  const selectedCity = visibleCities.value.find(item => item.name === city)
  if (selectedCity) toggleCityMusic(selectedCity)
}

function chonDiemDenExplore(city) {
  formDuLieu.diemDen = city
  selectedPlaces.value = []
  taiDuLieuThanhPho()
  const selectedCity = visibleDestinationCards.value.find(item => item.name === city)
  if (selectedCity) toggleCityMusic(selectedCity)
}

function doiCheDoTinhThanh(mode) {
  if (provinceMode.value === mode) return
  provinceMode.value = mode
  stopCityMusic()
  selectedPlaces.value = []
  const nextCity = visibleCities.value[0]
  if (nextCity) {
    formDuLieu.diemDen = nextCity.name
    taiDuLieuThanhPho()
  }
}

async function taiDuLieuThanhPho() {
  const currentId = ++reqIdCounter
  const dest = (formDuLieu.diemDen || '').trim()
  if (!dest) return

  loadingPlaces.value = true
  places.value = []

  const placeParams = dest === ALL_DESTINATIONS ? { mode: provinceMode.value } : { destination: dest, mode: provinceMode.value }
  api.get('/places', { params: placeParams })
    .then(res => {
      if (currentId === reqIdCounter) {
        places.value = res.data || []
        loadingPlaces.value = false
      }
    })
    .catch(e => {
      console.warn('Lß╗ùi tß║úi ─æß╗ïa ─æiß╗âm:', e.message)
      if (currentId === reqIdCounter) loadingPlaces.value = false
    })

  if (dest === ALL_DESTINATIONS) {
    thoiTiet.value = null
  } else {
    api.get('/weather', { params: { destination: dest } })
      .then(res => {
        if (currentId === reqIdCounter) thoiTiet.value = res.data
      })
      .catch(e => {
        console.warn('Lß╗ùi tß║úi thß╗¥i tiß║┐t:', e.message)
        if (currentId === reqIdCounter) thoiTiet.value = null
      })
  }
}

async function taoLichTrinh() {
  formDuLieu.soThich = chuoiSoThich.value ? chuoiSoThich.value.split(',').map(s => s.trim()).filter(Boolean) : []
  dangTao.value = true
  lichTrinh.value = null
  hienCompletionBanner.value = false
  taoPlanError.value = ''

  // K├¡ch hoß║ít lu├ón phi├¬n loading message c├│ t├¡nh c├ích AI (Mß╗Ñc 6)
  currentLoadingMessageIndex.value = 0
  if (loadingMessageTimer) clearInterval(loadingMessageTimer)
  loadingMessageTimer = setInterval(() => {
    currentLoadingMessageIndex.value = (currentLoadingMessageIndex.value + 1) % LOADING_MESSAGES.length
  }, 1900)

  try {
    const res = await api.post('/ai/plan', {
      origin: formDuLieu.diemKhoiHanh,
      destination: formDuLieu.diemDen,
      days: formDuLieu.soNgay,
      budget: formDuLieu.nganSach,
      people: formDuLieu.soNguoi,
      interests: formDuLieu.soThich,
      selected_places: selectedPlaces.value,
      start_date: formDuLieu.ngayBatDau,
      end_date: formDuLieu.ngayKetThuc,
      transportation: formDuLieu.phuongTien,
      hotel_request: formDuLieu.yeuCauKhachSan,
      hotel_checkin_preference: formDuLieu.hotel_checkin_preference,
      selected_bus: formDuLieu.nhaXeDaChon
    })
    lichTrinh.value = res.data
    // ─Éß║úm bß║úo gß║»n th├┤ng tin di chuyß╗ân tß╗æi ╞░u chi ph├¡
    if (!lichTrinh.value.transit_summary) {
      lichTrinh.value.transit_summary = {
        origin: formDuLieu.diemKhoiHanh,
        destination: formDuLieu.diemDen,
        estimated_distance_km: transitRouteInfo.value.estimatedDistanceKm,
        selected_bus: formDuLieu.nhaXeDaChon,
        comparison: transitRouteInfo.value.vehicleComparison,
        available_operators: transitRouteInfo.value.operators
      }
    }
    if (lichTrinh.value?.days) lichTrinh.value.daysList = lichTrinh.value.days
    selectedDay.value = 1
    splitterTongTien.value = lichTrinh.value.total_budget || formDuLieu.nganSach
    splitterSoNguoi.value = lichTrinh.value.people || formDuLieu.soNguoi
    taiChuyenDiCuaToi()

    // Hiß╗ân thß╗ï completion quote ngß║½u nhi├¬n v├á floating toast (Mß╗Ñc 7)
    const quote = COMPLETION_QUOTES[Math.floor(Math.random() * COMPLETION_QUOTES.length)]
    activeCompletionQuote.value = quote
    hienCompletionBanner.value = true
    personalityToast.value = quote
    setTimeout(() => {
      personalityToast.value = null
    }, 7500)
  } catch (e) {
    const msg = e?.response?.data?.error || e.message;
    taoPlanError.value = msg.includes('Ng├ón s├ích qu├í thß║Ñp') ? msg : 'Qu├í tr├¼nh tß║ío lß╗ïch tr├¼nh gß║╖p sß╗▒ cß╗æ: ' + msg;
  } finally {
    dangTao.value = false
    if (loadingMessageTimer) {
      clearInterval(loadingMessageTimer)
      loadingMessageTimer = null
    }
  }
}

async function dieuChinhTranhMua() {
  if (!lichTrinh.value?.tripId) return
  dangDieuChinh.value = true
  try {
    const res = await api.post('/ai/replan', {
      tripId: lichTrinh.value.tripId,
      instruction: 'Dß╗▒ b├ío ng├áy n├áy c├│ m╞░a, h├úy ─æß╗òi c├íc hoß║ít ─æß╗Öng ngo├ái trß╗¥i th├ánh c├íc ─æiß╗âm trong nh├á (Bß║úo t├áng, Cafe view ─æß║╣p, Rß║íp chiß║┐u phim, Chß╗ú ß║⌐m thß╗▒c c├│ m├íi che).'
    })
    lichTrinh.value.days = res.data.days
    lichTrinh.value.daysList = res.data.days
    alert('≡ƒîº∩╕Å AI ─æ├ú cß║¡p nhß║¡t lß╗ïch tr├¼nh sang c├íc hoß║ít ─æß╗Öng trong nh├á tr├ính m╞░a th├ánh c├┤ng!')
  } catch (e) {
    alert('Kh├┤ng thß╗â ─æß╗òi lß╗ïch: ' + (e?.response?.data?.error || e.message))
  } finally {
    dangDieuChinh.value = false
  }
}

async function sendChat() {
  const text = chatText.value.trim()
  if (!text || dangGuiChat.value) return
  nhanTin.value.push({ id: Date.now() + '-u', role: 'user', text })
  chatText.value = ''
  dangGuiChat.value = true
  try {
    const res = await api.post('/ai/chat', {
      tripId: lichTrinh.value?.tripId || undefined,
      message: text
    })
    nhanTin.value.push({ id: Date.now() + '-a', role: 'assistant', text: res.data.reply })
  } catch (e) {
    nhanTin.value.push({ id: Date.now() + '-a', role: 'assistant', text: 'Xin lß╗ùi, tß║ím thß╗¥i t├┤i ch╞░a thß╗â trß║ú lß╗¥i: ' + (e?.response?.data?.error || e.message) })
  } finally {
    dangGuiChat.value = false
  }
}

function guiChatNhanh(cauHoi) {
  chatText.value = cauHoi
  sendChat()
}

async function dangNhapHoacDangKy() {
  authError.value = ''
  try {
    const endpoint = dangKyMode.value ? '/auth/register' : '/auth/login'
    const payload = dangKyMode.value ? authForm : { email: authForm.email, password: authForm.password }
    const res = await api.post(endpoint, payload)
    localStorage.setItem('travel_token', res.data.token)
    nguoiDung.value = res.data.user
    hienAuthModal.value = false
    activeTab.value = 'explore'
    playIntroSplash()
    taiChuyenDiCuaToi()
    taiYeuThich()
  } catch (e) {
    authError.value = e?.response?.data?.error || e.message
  }
}

const editProfileMode = ref(false)
const profileForm = reactive({ name: '', avatar: '', bio: '' })

function editProfile() {
  profileForm.name = nguoiDung.value.name || ''
  profileForm.avatar = nguoiDung.value.avatar || ''
  profileForm.bio = nguoiDung.value.bio || ''
  editProfileMode.value = true
}

function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 300
      const MAX_HEIGHT = 300
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      profileForm.avatar = dataUrl
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  try {
    const res = await api.put('/auth/update-profile', profileForm)
    nguoiDung.value = res.data
    editProfileMode.value = false
  } catch(e) {
    alert('Lß╗ùi cß║¡p nhß║¡t hß╗ô s╞í: ' + (e.response?.data?.error || e.message))
  }
}

const userLevelInfo = computed(() => {
  if (!nguoiDung.value) return { title: 'Ng╞░ß╗¥i mß╗¢i', icon: '≡ƒî▒', color: '#94a3b8' }
  const trips = nguoiDung.value.completed_trips || 0
  if (trips >= 10) return { title: 'Chuy├¬n gia du lß╗ïch', icon: '≡ƒææ', color: '#f59e0b' }
  if (trips >= 5) return { title: 'D├ón ph╞░ß╗út ch├¡nh hiß╗çu', icon: '≡ƒÜÇ', color: '#3b82f6' }
  if (trips >= 2) return { title: 'T├¡n ─æß╗ô m├¬ x├¬ dß╗ïch', icon: '≡ƒÄÆ', color: '#10b981' }
  return { title: 'T├ón binh', icon: '≡ƒî▒', color: '#8b5cf6' }
})

function dangXuat() {
  localStorage.removeItem('travel_token')
  nguoiDung.value = null
  myTripsList.value = []
  favoritesList.value = []
  
  // Hiß╗çn modal ─æ─âng nhß║¡p sau khi ─æ─âng xuß║Ñt
  dangKyMode.value = false
  hienAuthModal.value = true
}

async function taiChuyenDiCuaToi() {
  if (!nguoiDung.value) return
  try {
    const res = await api.get('/social/my-trips')
    myTripsList.value = res.data || []
  } catch (e) {
    console.warn('Ch╞░a tß║úi ─æ╞░ß╗úc danh s├ích chuyß║┐n ─æi:', e.message)
  }
}

async function taiYeuThich() {
  if (!nguoiDung.value) return
  try {
    const res = await api.get('/social/favorites')
    favoritesList.value = res.data || []
  } catch (e) {
    console.warn('Ch╞░a tß║úi ─æ╞░ß╗úc y├¬u th├¡ch:', e.message)
  }
}

async function doiYeuThich(placeId) {
  if (!nguoiDung.value) {
    hienAuthModal.value = true
    return
  }
  try {
    await api.post(`/social/favorites/${placeId}`)
    await taiYeuThich()
  } catch (e) {
    console.warn('Lß╗ùi y├¬u th├¡ch:', e.message)
  }
}

function moLaiLichTrinh(trip) {
  lichTrinh.value = trip
  if (lichTrinh.value?.days) lichTrinh.value.daysList = lichTrinh.value.days
  selectedDay.value = 1
  activeTab.value = 'planner'
}

async function chiaSeChuyenDi(trip) {
  try {
    const res = await api.post(`/social/trips/${trip._id}/share`)
    const url = `${window.location.origin}${res.data.url}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      alert('─É├ú sao ch├⌐p li├¬n kß║┐t chia sß║╗ v├áo Clipboard!\n' + url)
    } else {
      prompt('Li├¬n kß║┐t chia sß║╗ chuyß║┐n ─æi:', url)
    }
  } catch (e) {
    alert('Kh├┤ng thß╗â chia sß║╗: ' + (e?.response?.data?.error || e.message))
  }
}

async function xoaChuyenDi(trip) {
  const tenChuyen = `${trip.days?.length || 0} ng├áy tß║íi ${trip.destination}`
  const xacNhan = confirm(`Bß║ín c├│ chß║»c muß╗æn x├│a chuyß║┐n ─æi "${tenChuyen}" kh├┤ng?\n\nΓÜá∩╕Å H├ánh ─æß╗Öng n├áy kh├┤ng thß╗â ho├án t├íc.`)
  if (!xacNhan) return
  try {
    await api.delete(`/social/trips/${trip._id}`)
    // X├│a khß╗Åi danh s├ích local ngay kh├┤ng cß║ºn reload
    myTripsList.value = myTripsList.value.filter(t => t._id !== trip._id)
  } catch (e) {
    alert('─É├ú xß║úy ra lß╗ùi: ' + (e?.response?.data?.error || e.message))
  }
}

function xuatPdf() {
  const element = document.querySelector('.plan-results-container')
  if (!element) {
    alert('Kh├┤ng t├¼m thß║Ñy nß╗Öi dung lß╗ïch tr├¼nh ─æß╗â xuß║Ñt PDF!')
    return
  }
  
  // Clone element to remove interactive buttons
  const clone = element.cloneNode(true)
  const toolActions = clone.querySelector('.plan-tool-actions')
  if (toolActions) toolActions.remove()
  
  // Also remove the "Chia tiß╗ün nh├│m" or "─Éß╗òi lß╗ïch tr├ính m╞░a" buttons if any other remain
  const printBtn = clone.querySelector('.app-primary-btn')
  if (printBtn) printBtn.remove()
  
  const opt = {
    margin: 10,
    filename: `lich-trinh-${lichTrinh.value?.destination || 'chuyen-di'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  
  html2pdf().set(opt).from(clone).save()
}

function bieuTuongThoiTiet(code) {
  if (code === 0) return 'ΓÿÇ∩╕Å'
  if (code <= 3) return 'Γ¢à'
  if (code <= 48) return '≡ƒî½∩╕Å'
  if (code <= 67 || code <= 82) return '≡ƒîº∩╕Å'
  return 'ΓÜí'
}

function moTaThoiTiet(code) {
  if (code === 0) return 'Trß╗¥i nß║»ng ─æß║╣p'
  if (code <= 3) return 'C├│ m├óy nhß║╣'
  if (code <= 48) return 'S╞░╞íng m├╣ nhß║╣'
  if (code <= 67 || code <= 82) return 'C├│ m╞░a r├áo'
  return 'D├┤ng b├úo'
}

onMounted(async () => {
  // Restore Dark Mode
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }

  if (localStorage.getItem('travel_token')) {
    try {
      nguoiDung.value = (await api.get('/auth/me')).data
      taiChuyenDiCuaToi()
      taiYeuThich()
    } catch (err) {
      dangXuat()
    }
  }
  taiDuLieuThanhPho()
})
const showIntroSplash = ref(false)
const introSplitting = ref(false)
let introTimeout1 = null;
let introTimeout2 = null;

function playIntroSplash() {
  showIntroSplash.value = true
  introSplitting.value = false
  document.body.style.overflow = 'hidden'
  
  clearTimeout(introTimeout1)
  clearTimeout(introTimeout2)
  
  // ─Éß╗úi 7.5s xem video, sau ─æ├│ k├¡ch hoß║ít hiß╗çu ß╗⌐ng t├ích chß╗» v├á mß╗¥ dß║ºn trong 2.5s (Tß╗òng 10s)
  introTimeout1 = setTimeout(() => {
    introSplitting.value = true
    introTimeout2 = setTimeout(() => {
      showIntroSplash.value = false
      document.body.style.overflow = ''
    }, 2500)
  }, 7500)
}

function boQuaIntro() {
  clearTimeout(introTimeout1)
  clearTimeout(introTimeout2)
  
  // T├ích video nhanh h╞ín khi bß╗Å qua
  introSplitting.value = true
  setTimeout(() => {
    showIntroSplash.value = false
    document.body.style.overflow = ''
  }, 800)
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* Hide scrollbar universally */
::-webkit-scrollbar {
  display: none;
}
* {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Hiß╗çu ß╗⌐ng Parallax Zoom cho to├án bß╗Ö app */
.app-root {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  transition: transform 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.app-root.app-intro-zoom {
  transform: scale(0.95);
}

/* ===== AI HINT BUBBLE ΓÇö ─æß╗ông bß╗Ö m├áu Teal chß╗º ─æß║ío sang trß╗ìng ===== */
.ai-hint-bubble {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%);
  border-radius: 20px;
  padding: 20px 44px 20px 20px;
  margin-bottom: 16px;
  box-shadow: 0 8px 30px rgba(13, 148, 136, 0.28), 0 0 0 1px rgba(255,255,255,0.18) inset;
  animation: bubbleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  grid-column: 1 / -1;
  width: 100%;
}

.ai-hint-bubble::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
  border-radius: inherit;
  pointer-events: none;
}

@media (max-width: 640px) {
  .ai-hint-bubble {
    padding: 16px 36px 16px 16px;
    gap: 12px;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .ai-hint-body {
    width: 100%;
  }
  .ai-hint-chips {
    justify-content: center;
  }
}

@keyframes bubbleIn {
  from { opacity: 0; transform: scale(0.92) translateY(-12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.ai-hint-robot {
  font-size: 2.2rem;
  line-height: 1;
  flex-shrink: 0;
  animation: robotBounce 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
}

@keyframes robotBounce {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50%       { transform: translateY(-6px) rotate(4deg); }
}

.ai-hint-body {
  flex: 1;
  min-width: 0;
}

.ai-hint-content p {
  margin: 0 0 12px;
  font-size: 0.97rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.95);
  font-weight: 500;
}

.ai-hint-content strong {
  color: #fff;
  font-weight: 800;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.ai-hint-content em {
  font-style: italic;
  color: #fde68a;
  font-weight: 600;
}

/* Quick-pick chips b├¬n trong bubble */
.ai-hint-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.35);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  user-select: none;
}

.ai-chip:hover {
  background: rgba(255,255,255,0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.ai-chip:active {
  transform: translateY(0);
}

/* Chip "C├óu kh├íc" ΓÇö nß╗òi bß║¡t ri├¬ng */
.ai-chip-refresh {
  background: rgba(255, 220, 100, 0.25) !important;
  border-color: rgba(255, 220, 100, 0.5) !important;
  color: #fde68a !important;
  font-style: italic;
}

.ai-chip-refresh:hover {
  background: rgba(255, 220, 100, 0.4) !important;
}

.ai-chip-refresh span,
.ai-chip-refresh {
  letter-spacing: 0.01em;
}

/* N├║t dismiss bubble */
.ai-hint-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: rgba(255,255,255,0.2);
  border: none;
  color: rgba(255,255,255,0.9);
  font-size: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  line-height: 1;
  padding: 0;
}

.ai-hint-close:hover {
  background: rgba(255,255,255,0.4);
}

/* ===== AI PROVINCE SUBTITLE ΓÇö sinh ─æß╗Öng, gradient ===== */
.ai-province-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 14px;
  background: linear-gradient(90deg, #fef3c7, #fde68a);
  border-left: 3px solid #f59e0b;
  border-radius: 0 10px 10px 0;
  font-size: 0.88rem;
  font-weight: 600;
  font-style: normal;
  color: #92400e;
  line-height: 1.5;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.2);
  animation: subtitlePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes subtitlePop {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}

[data-theme="dark"] .ai-province-subtitle {
  background: linear-gradient(90deg, rgba(245,158,11,0.15), rgba(251,191,36,0.1));
  color: #fde68a;
  border-left-color: #f59e0b;
}


:root {
  --primary: #059669; /* emerald-600 */
  --primary-dark: #065f46; /* emerald-800 */
  --primary-light: #ecfdf5;
  --accent: #f59e0b; /* V├áng Hß╗Öi An */
  --accent-light: #fef3c7;
  --bg-app: #f1f5f9;
  --card-bg: rgba(255, 255, 255, 0.6); /* Glass light mode */
  --text-main: #1e293b;
  --text-sub: #475569;
  --border-color: rgba(253, 230, 138, 0.4); /* border-amber-200/40 */
  --radius-sm: 8px; /* rounded-lg */
  --radius-md: 12px; /* rounded-xl */
  --radius-lg: 16px;
  --shadow-sm: 0 4px 20px rgba(0,0,0,0.04);
  --shadow-md: 0 12px 32px rgba(0,0,0,0.06);
  --shadow-lg: 0 0 40px rgba(245, 158, 11, 0.15); /* Warm Glow */
  --input-bg: #f8fafc;
  --input-bg-focus: #ffffff;
}

:root[data-theme="dark"] {
  --bg-app: #0f172a; /* Keep dark background, we'll use teal/emerald gradient on containers */
  --card-bg: rgba(255, 255, 255, 0.1); /* Glass dark mode */
  --text-main: #f8fafc;
  --text-sub: #cbd5e1;
  --border-color: rgba(253, 230, 138, 0.3); /* border-amber-200/30 */
  --primary-light: rgba(5, 150, 105, 0.15);
  --accent-light: rgba(245, 158, 11, 0.15);
  --shadow-sm: 0 4px 20px rgba(0,0,0,0.2);
  --shadow-md: 0 10px 30px rgba(0,0,0,0.3);
  --shadow-lg: 0 0 40px rgba(245, 158, 11, 0.15); /* Warm Glow */
  --input-bg: rgba(0,0,0,0.2);
  --input-bg-focus: rgba(0,0,0,0.4);
  --weather-bg: rgba(5, 150, 105, 0.1);
  --weather-border: rgba(5, 150, 105, 0.2);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: url('/images/app-bg.jpg') no-repeat center center fixed;
  background-size: cover;
  background-color: var(--bg-app);
  color: var(--text-main);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.3s, color 0.3s;
}

/* Th├¬m lß╗¢p overlay mß╗¥ nhß║╣ ─æß╗â ─æß║úm bß║úo chß╗» tr├¬n web vß║½n dß╗à ─æß╗ìc */
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--bg-app);
  opacity: 0.7; /* Chß║┐ ─æß╗Ö s├íng tß╗æi sß║╜ tß╗▒ ─æß╗Öng ─æiß╗üu chß╗ënh ─æß╗Ö tß╗æi qua --bg-app */
  z-index: -1;
  pointer-events: none;
}

h1, h2, h3, h4, .place-name, .hero-content h2, .app-header h1 {
  font-family: 'Playfair Display', 'Lora', serif;
}

button, input, select { font: inherit; outline: none; }
button { cursor: pointer; }

/* APP LAYOUT WRAPPER */
.app-root {
  min-height: 100vh;
  display: flex;
  background: var(--bg-app);
}

.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}


/* HEADER BAR */
.app-header {
  background: var(--card-bg);
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.app-logo-icon {
  width: 34px;
  height: 34px;
  background: var(--primary);
  color: #fff;
  border-radius: 10px;
  display: grid;
  place-content: center;
  font-size: 18px;
}
.brand-text h1 {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.1;
}
.brand-text small {
  font-size: 10px;
  color: var(--text-sub);
  font-weight: 600;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mode-toggle-btn {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid #b2dfdb;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  transition: all .2s;
}
.mode-toggle-btn:hover {
  background: var(--primary);
  color: #fff;
}
.user-chip-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.user-avatar {
  width: 24px;
  height: 24px;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 11px;
  font-weight: 800;
}
.login-header-btn {
  background: var(--primary);
  color: #fff;
  border: 0;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.app-main {
  flex: 1;
  padding: 18px 40px;
  padding-bottom: 30px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* EXPLORE TAB HERO CARD */
.app-hero-card {
  background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.45)), url('/images/mientrung-hero.jpg') no-repeat center center;
  background-size: cover;
  color: #fff;
  padding: 32px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.app-hero-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.hero-content {
  padding: 10px 0;
  max-width: 540px;
  animation: floatHeroCard 6s ease-in-out infinite;
  z-index: 2;
  opacity: 0.25;
  transition: opacity 0.5s ease;
}
.hero-content:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .hero-content {
    opacity: 1;
  }
  .app-hero-card {
    background: linear-gradient(rgba(0, 0, 0, 0.1), rgba(15, 30, 20, 0.95)), url('/images/mientrung-hero.jpg') no-repeat top center;
    background-size: 100% auto;
    background-color: #0f1e14;
    min-height: 320px;
  }
}

@keyframes floatHeroCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  color: #ffe6dc;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}
.app-hero-card h2 {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.app-hero-card p {
  font-size: 14px;
  color: #e2e8f0;
  line-height: 1.6;
  margin-bottom: 20px;
}
.hero-cta-btn {
  background: #ffffff;
  color: #059669;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.hero-cta-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  color: var(--primary-dark);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.section-title-row h3 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}
.province-mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}
.province-mode-switch button {
  border: 0;
  border-radius: 7px;
  padding: 6px 10px;
  background: transparent;
  color: var(--text-sub);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.province-mode-switch button.active {
  background: var(--primary);
  color: #fff;
}
.planner-mode-switch {
  margin-bottom: 8px;
}
.sub-region-hint {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
.explore-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ai-crawl-btn {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
}
.ai-crawl-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
.ai-crawl-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.badge-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 2px 8px;
  border-radius: 10px;
}
.city-music-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.music-master-toggle {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--primary-light);
  border-radius: 50%;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  line-height: 1;
}
.music-master-toggle:hover,
.music-master-toggle.muted {
  background: var(--primary-light);
}
.music-volume-label {
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}
.music-volume-slider {
  width: 72px;
  height: 4px;
  accent-color: var(--primary);
  cursor: pointer;
}
.cities-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 4px 14px 4px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: thin;
  scrollbar-color: var(--primary) var(--primary-light);
}
.cities-carousel::-webkit-scrollbar {
  height: 8px;
}
.cities-carousel::-webkit-scrollbar-track {
  background: var(--primary-light);
  border-radius: 999px;
}
.cities-carousel::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 999px;
}
.cities-carousel::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark, #0f766e);
}
.city-card-btn {
  background-color: var(--card-bg);
  background-size: cover;
  background-position: center;
  border: none;
  outline: none;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 105px;
  max-width: 115px;
  height: 125px;
  color: #ffffff;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-appearance: none;
  appearance: none;
}
.city-card-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%);
  z-index: 1;
  border-radius: inherit;
}
.city-card-btn:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(13, 148, 136, 0.3);
}
.city-card-btn.active {
  box-shadow: 0 0 0 2px var(--primary), 0 0 0 5px var(--primary-light), var(--shadow-sm);
  transform: translateY(-2px);
}
.city-card-btn.active::after {
  content: 'Γ£ô';
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 10px;
  font-weight: 800;
  background: var(--primary);
  color: #fff;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0,0,0,0.25);
}
.city-icon, .city-name, .city-tag {
  position: relative;
  z-index: 2;
}
.city-pin-icon {
  display: block;
  margin-bottom: 4px;
  opacity: 0.9;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
  position: relative;
  z-index: 2;
}
.city-name { font-size: 13px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.9); line-height: 1.2; margin-bottom: 2px; }
.city-tag { font-size: 9.5px; color: rgba(255,255,255,0.88); text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.25; }

/* WEATHER WIDGET */
.app-weather-widget {
  background: var(--weather-bg, #e8f4f3);
  border: 1px solid var(--weather-border, #c2e2df);
  padding: 16px 20px;
  border-radius: var(--radius-md);
}
.weather-widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.weather-label { font-size: 10px; font-weight: 800; color: var(--primary); letter-spacing: .08em; }
.weather-widget-header h4 { font-size: 18px; font-weight: 800; }
.weather-temp-now { display: flex; align-items: center; gap: 8px; }
.weather-icon-large { font-size: 28px; }
.weather-temp-now strong { font-size: 24px; font-weight: 800; color: var(--primary); }
.weather-summary { font-size: 12px; color: var(--text-sub); margin: 6px 0 12px; }
.weather-forecast-strip {
  display: flex;
  justify-content: space-between;
  border-top: 1px dashed var(--weather-border, #b2dfdb);
  padding-top: 10px;
}
.forecast-item { text-align: center; font-size: 11px; }
.forecast-item small { display: block; color: var(--text-sub); }
.forecast-item span { font-size: 16px; margin: 2px 0; display: block; }


/* PLACES EXPLORE GRID WITH PHOTOS */
.filter-pills { display: flex; gap: 6px; }
.filter-pill {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-sub);
}
.filter-pill.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.explore-search-box {
  position: relative;
  margin: 12px 0 16px 0;
  display: flex;
  align-items: center;
}
.explore-search-input {
  width: 100%;
  padding: 10px 38px 10px 14px;
  background: var(--input-bg);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: inherit;
  color: var(--text-main);
  outline: none;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}
.explore-search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
.clear-search-btn {
  position: absolute;
  right: 12px;
  background: #cbd5e1;
  color: #334155;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.clear-search-btn:hover {
  background: #94a3b8;
  color: #fff;
}
.places-app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
.app-place-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

/* Hiß╗çu ß╗⌐ng ├ính s├íng l╞░ß╗¢t qua (Light Reflection / Gleam) */
.app-place-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg);
  z-index: 2;
  pointer-events: none;
  transition: left 0.6s ease-out;
}

.app-place-card:hover {
  transform: translateY(-8px) scale(1.015);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 20px rgba(13, 148, 136, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.app-place-card:hover::after {
  left: 200%;
}

.place-img-cover {
  height: 140px;
  background-size: cover;
  background-position: center;
  background-color: #0d7c76;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
}
.place-img-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%);
  pointer-events: none;
}

.place-card-type {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 8px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.type-attraction { background: #e8f5e9; color: #166534; }
.type-restaurant { background: #fff7ed; color: #c2410c; }
.type-cafe { background: #fdf4ff; color: #86198f; }
.type-hotel { background: #eff6ff; color: #1d4ed8; }

.place-img-rating {
  position: absolute;
  bottom: 8px;
  left: 10px;
  z-index: 2;
  background: rgba(0,0,0,0.7);
  color: #fbbf24;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.heart-action-btn {
  background: rgba(255,255,255,0.85);
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 16px;
  color: #64748b;
  display: grid;
  place-content: center;
  z-index: 2;
  cursor: pointer;
  transition: all .2s;
}
.heart-action-btn:hover { background: #fff; transform: scale(1.1); }
.heart-action-btn.active { color: #ef4444; background: #fff; }

.place-card-content {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.place-card-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; color: var(--text-main); }
.place-card-desc { font-size: 12px; color: var(--text-sub); line-height: 1.4; margin-bottom: 8px; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.place-card-address { font-size: 11px; color: var(--primary); font-weight: 600; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.place-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
  margin-top: auto;
  gap: 6px;
}
.add-to-plan-btn {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid #b2dfdb;
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  transition: all .2s;
}
.add-to-plan-btn:hover { background: var(--primary); color: #fff; }
.place-maps-btn {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub);
  text-decoration: none;
  background: var(--input-bg);
  padding: 5px 8px;
  border-radius: 6px;
}
.place-maps-btn:hover { color: var(--primary); background: #e2e8f0; }

/* LOAD MORE & COLLAPSE BUTTONS */
.load-more-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--primary, #0d7c76) 0%, #0a635e 100%);
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(13, 124, 118, 0.25);
  transition: all 0.25s ease;
}
.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 124, 118, 0.35);
  background: linear-gradient(135deg, #10948e 0%, #0d7c76 100%);
}
.load-more-btn:active {
  transform: translateY(0);
}
.load-more-text {
  font-weight: 700;
}
.load-more-count {
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.22);
  padding: 2px 8px;
  border-radius: 12px;
}
.load-more-icon {
  font-size: 14px;
  font-weight: 800;
}
.collapse-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--card-bg, #ffffff);
  color: var(--text-sub, #64748b);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 11px 22px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.collapse-btn:hover {
  background: #f1f5f9;
  color: var(--primary, #0d7c76);
  border-color: #cbd5e1;
}
:root[data-theme="dark"] .collapse-btn {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}
:root[data-theme="dark"] .collapse-btn:hover {
  background: rgba(51, 65, 85, 0.9);
  color: #f1f5f9;
}

/* PLANNER FORM */
.planner-form-container {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  width: auto;
  margin: 0 20px;
  flex-shrink: 0;
}
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.planner-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sub-heading { font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: .1em; }
.pane-header h2 { font-size: 20px; font-weight: 800; }
.planner-icon { font-size: 24px; color: var(--primary); }

.app-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.app-field { display: flex; flex-direction: column; gap: 6px; }
.app-field.full-width { grid-column: span 2; }
.app-field label { font-size: 11px; font-weight: 700; color: var(--text-sub); }
.field-label-between { display: flex; justify-content: space-between; align-items: center; }
.budget-highlight { font-size: 14px; color: var(--accent); }

.app-input, .app-select {
  width: 100%;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-main);
}
.app-input:focus, .app-select:focus {
  border-color: var(--primary);
  background: var(--input-bg-focus);
}
.stepper-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.stepper-input button {
  width: 36px;
  height: 38px;
  background: transparent;
  border: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}
.stepper-input span {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
}
.budget-slider {
  width: 100%;
  accent-color: var(--primary, #0d9488);
}
.quick-city-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--input-bg) 72%, transparent);
}
.city-select-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 7px 8px 7px 13px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}
.city-select-pill:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}
.city-select-pill.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
/* PLACES PICKER IN PLANNER */
.places-picker-box {
  margin-top: 16px;
  padding: 14px;
  background: var(--input-bg);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
}
.picker-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.picker-kicker {
  display: block;
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .04em;
  margin-bottom: 4px;
}
.picker-top h4 {
  color: var(--text-main);
  font-size: 16px;
  line-height: 1.3;
  margin: 0;
}
.badge-selected-count {
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
}
.ai-crawl-action-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border: 0;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity .2s, transform .2s;
}
.ai-crawl-action-btn:hover { opacity: 0.9; transform: scale(1.02); }
.ai-crawl-action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.ai-crawl-pill {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border-color: #c7d2fe !important;
  color: #4f46e5 !important;
  cursor: pointer;
}
.ai-crawl-pill:hover { background: #e0e7ff; }

.crawl-alert-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
  animation: fadeIn .3s ease;
}

.btn-spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
.picker-row { margin-bottom: 16px; }
.row-label { font-size: 12px; font-weight: 800; color: var(--text-main); display: block; margin-bottom: 7px; }
.places-scroll-container {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 12px;
}
.places-scroll-container::-webkit-scrollbar { width: 6px; }
.places-scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.places-scroll-container::-webkit-scrollbar-track { background: transparent; }

.chips-wrap { 
  display: flex; 
  flex-wrap: wrap; 
  overflow-x: hidden; 
  align-content: flex-start;
  gap: 8px; 
  padding-bottom: 8px; 
}
.chips-wrap::-webkit-scrollbar {
  height: 4px;
}
.chips-wrap::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.chips-wrap::-webkit-scrollbar-track {
  background: transparent;
}
.app-chip {
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease, transform .2s ease;
}
.app-chip:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}
.app-chip.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.chip-status { font-weight: 800; font-size: 12px; }

.app-primary-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.app-primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4);
  background: var(--primary-dark);
}
.submit-plan-btn { width: 100%; margin-top: 18px; padding: 14px; }

/* PLAN RESULTS */
.plan-results-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}
.plan-summary-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}
:root[data-theme="dark"] .plan-summary-card {
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(253, 230, 138, 0.25);
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.12);
}
.summary-top-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.plan-dest-badge {
  background: var(--primary-light);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
}
.savings-badge {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}
.summary-meta h2 {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-main);
  font-family: 'Playfair Display', serif;
}
.summary-budget {
  font-size: 13.5px;
  color: var(--text-sub);
  margin-top: 6px;
}
.summary-budget strong {
  color: var(--accent);
  font-size: 17px;
  font-weight: 800;
}

.budget-breakdown-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}
:root[data-theme="dark"] .budget-breakdown-row {
  background: rgba(0, 0, 0, 0.35);
}
.bb-pill {
  font-size: 11.5px;
  color: var(--text-sub);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--card-bg, #fff);
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
:root[data-theme="dark"] .bb-pill {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
}
.bb-pill b {
  color: var(--text-main);
  font-weight: 700;
}
:root[data-theme="dark"] .bb-pill b {
  color: #f8fafc;
}

.plan-tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  border-top: 1px solid var(--border-color);
  padding-top: 14px;
}
.tool-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}
.tool-btn:hover {
  background: rgba(245, 158, 11, 0.18);
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-1px);
}
:root[data-theme="dark"] .tool-btn {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f1f5f9;
}
:root[data-theme="dark"] .tool-btn:hover {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fbbf24;
}
.ai-opt-highlight-btn {
  background: linear-gradient(135deg, #059669, #047857) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
}
.ai-opt-highlight-btn:hover {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  transform: translateY(-2px);
}
.gmap-all-stops-btn {
  background: rgba(2, 132, 199, 0.15) !important;
  border: 1px solid rgba(2, 132, 199, 0.4) !important;
  color: #0284c7 !important;
}
:root[data-theme="dark"] .gmap-all-stops-btn {
  color: #38bdf8 !important;
  border-color: rgba(56, 189, 248, 0.4) !important;
}
.zalo-share-btn {
  background: rgba(99, 102, 241, 0.15) !important;
  border: 1px solid rgba(99, 102, 241, 0.4) !important;
  color: #4f46e5 !important;
}
:root[data-theme="dark"] .zalo-share-btn {
  color: #a5b4fc !important;
}
.rain-btn {
  color: #0284c7 !important;
  border-color: #bae6fd !important;
  background: #f0f9ff !important;
}
:root[data-theme="dark"] .rain-btn {
  color: #38bdf8 !important;
  border-color: rgba(56, 189, 248, 0.4) !important;
  background: rgba(14, 165, 233, 0.15) !important;
}

/* HOTEL CARD */
.app-hotel-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 5px solid #16a34a;
  padding: 16px;
  border-radius: var(--radius-md);
}
.hotel-badge { font-size: 10px; font-weight: 800; color: #16a34a; margin-bottom: 6px; }
.hotel-main-info { display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.hotel-main-info h3 { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.hotel-addr { font-size: 11px; color: var(--primary); font-weight: 600; margin-bottom: 6px; }
.hotel-desc { font-size: 12px; color: var(--text-sub); line-height: 1.4; max-width: 500px; }
.hotel-side { text-align: right; }
.hotel-stars { background: #fff; color: #d97706; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
.hotel-price { display: block; font-size: 16px; font-weight: 800; color: var(--accent); margin: 4px 0; }
.hotel-maps-link { font-size: 11px; font-weight: 700; color: var(--primary); text-decoration: none; border-bottom: 1px dashed var(--primary); }

/* ==================== ITINERARY SPLIT VIEW & STICKY MAP ==================== */
.itinerary-split-container {
  width: 100%;
}
@media (min-width: 992px) {
  .itinerary-split-container.mode-split {
    display: grid;
    grid-template-columns: 1.15fr 0.95fr;
    gap: 24px;
    align-items: start;
  }
  .itinerary-split-container.mode-split .app-map-box {
    position: sticky;
    top: 80px;
    height: calc(100vh - 105px);
    min-height: 520px;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow: hidden;
  }
  .itinerary-split-container.mode-split .sticky-map-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  .itinerary-split-container.mode-split .app-map-iframe {
    flex: 1;
    height: 100% !important;
    min-height: 440px;
    border-radius: var(--radius-sm);
  }
}
.itinerary-split-container.mode-timeline .app-timeline-wrap {
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}
.app-timeline-wrap {
  position: relative;
}
.app-timeline-wrap::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5l10 3.5-10 3.5zM0 38v-2h20v2H0zm0-20v-2h20v2H0z' fill='%23059669' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  border-radius: var(--radius-lg);
}
.itinerary-split-container.mode-map .app-map-box {
  width: 100%;
}
.itinerary-split-container.mode-map .app-map-iframe {
  height: 600px;
}

/* MAP BOX */
.app-map-box {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px;
}
.map-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
.map-header h4 { font-size: 14px; font-weight: 800; }
.map-live-hint {
  font-size: 11px;
  color: var(--primary);
  font-weight: 600;
  background: var(--primary-light);
  padding: 2px 8px;
  border-radius: 10px;
}
.day-switcher-pills { display: flex; gap: 6px; }
.day-pill {
  border: 1px solid var(--border-color);
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.day-pill.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.app-map-iframe { width: 100%; height: 260px; border: 0; border-radius: var(--radius-sm); }

/* LEAFLET BOUNCING MARKER */
.itinerary-map-marker {
  width: 30px;
  height: 30px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
  cursor: pointer;
}
@keyframes markerPulseBounce {
  0%, 100% {
    transform: translateY(0) scale(1);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.28);
  }
  50% {
    transform: translateY(-12px) scale(1.3);
    box-shadow: 0 8px 18px rgba(5, 150, 105, 0.6);
    background: var(--primary-dark);
  }
}
.marker-bouncing {
  animation: markerPulseBounce 0.75s ease-in-out infinite !important;
  z-index: 9999 !important;
}

/* TIMELINE WRAP */
.app-timeline-wrap { display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; }
.timeline-day-card {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}
[data-theme="dark"] .timeline-day-card {
  box-shadow: var(--shadow-lg);
}
.day-selected-highlight {
  border-color: var(--accent) !important;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
}
.day-header-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  gap: 10px;
  flex-wrap: wrap;
}
.day-num { font-size: 14px; font-weight: 800; color: var(--accent); }
.day-activities-count { font-size: 11px; color: var(--text-sub); }
.dhp-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.day-gmaps-route-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff !important;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.day-gmaps-route-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.45);
}

.activities-stream { display: flex; flex-direction: column; }
.activity-row {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  position: relative;
  align-items: stretch;
  transition: background 0.2s ease, transform 0.15s ease;
  border-radius: 12px;
}
.activity-row.is-dragging {
  opacity: 0.35;
  transform: scale(0.98);
}
.activity-row.drag-target-over {
  background: rgba(14, 165, 233, 0.08);
  outline: 2px dashed #0ea5e9;
}
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  cursor: grab;
  color: #94a3b8;
  font-size: 16px;
  user-select: none;
  padding: 2px 0;
  transition: color 0.15s ease;
}
.drag-handle:hover {
  color: var(--primary);
}
.drag-handle:active {
  cursor: grabbing;
}
.activity-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  flex-shrink: 0;
  padding-top: 4px;
}
.activity-time { font-size: 12px; font-weight: 800; color: var(--primary-dark); }
.activity-bullet {
  width: 12px;
  height: 12px;
  background: var(--accent);
  border-radius: 2px;
  transform: rotate(45deg);
  margin-top: 6px;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}
.activity-bullet::after {
  content: '';
  position: absolute;
  top: 14px;
  left: 5px;
  width: 2px;
  height: calc(100% + 40px);
  background: transparent;
  border-left: 2px dashed rgba(5, 150, 105, 0.3);
  transform: rotate(-45deg);
  transform-origin: top left;
  z-index: 1;
}
.activity-row:last-child .activity-bullet::after { display: none; }

.activity-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
  padding: 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2);
}
[data-theme="dark"] .activity-card-body {
  background: rgba(0, 0, 0, 0.2);
}
.activity-row.is-hovered .activity-card-body {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.15);
  transform: translateY(-1px);
}
[data-theme="dark"] .activity-row.is-hovered .activity-card-body {
  background: rgba(0, 0, 0, 0.4);
}
.act-thumbnail-box {
  width: 82px;
  height: 82px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  background: #e2e8f0;
}
.act-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.act-thumbnail-box:hover .act-thumbnail-img {
  transform: scale(1.08);
}
.act-thumb-index-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 6px;
}
.act-main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.activity-top-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 2px;
}
.act-title-cluster {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.badge-type {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
}
.badge-breakfast { background: #fff3d6; color: #9a5b00; }
.badge-lunch { background: #ffe6dc; color: #c0471b; }
.badge-dinner { background: #ffdcd6; color: #9e220a; }
.badge-hotel { background: #e3f2fd; color: #0d47a1; }
.badge-cafe { background: #f3e8dc; color: #6d4c41; }
.badge-attraction { background: #e8f5e9; color: #1b5e20; }

.place-name {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  cursor: pointer;
  line-height: 1.3;
  letter-spacing: -0.1px;
}
.place-name:hover {
  color: var(--primary);
}
.act-actions-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.act-change-btn {
  font-size: 11px;
  font-weight: 700;
  color: #fff !important;
  background: var(--accent); /* V├áng Hß╗Öi An */
  border: none;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}
.act-change-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}
.act-direction-btn {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff !important;
  text-decoration: none;
  background: #0284c7;
  padding: 4px 10px;
  border-radius: 8px;
  border: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}
.act-direction-btn:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

/* THß║║ Dß╗░ KIß║╛N THß╗£I GIAN & KHOß║óNG C├üCH Tß╗ÜI ─ÉIß╗éM ─Éß║╛N */
.act-travel-eta-card {
  background: linear-gradient(100deg, rgba(14, 165, 233, 0.07) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-left: 3.5px solid #0284c7;
  border-radius: 10px;
  padding: 7px 12px;
  margin: 5px 0 7px;
  transition: all 0.2s ease;
}
:root[data-theme="dark"] .act-travel-eta-card {
  background: linear-gradient(100deg, rgba(2, 132, 199, 0.12) 0%, rgba(16, 185, 129, 0.07) 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-left: 3.5px solid #38bdf8;
  box-shadow: 0 2px 12px rgba(2, 132, 199, 0.12);
}
.eta-card-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.eta-pulse-icon {
  font-size: 16px;
  animation: pulse 2s infinite ease-in-out;
}
.eta-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.eta-from-to {
  font-size: 12px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  font-weight: 500;
}
:root[data-theme="dark"] .eta-from-to {
  color: #94a3b8;
}
.eta-from-to strong {
  color: var(--text-main);
  font-weight: 700;
}
.eta-arrow {
  color: #0284c7;
  font-weight: 800;
}
:root[data-theme="dark"] .eta-arrow {
  color: #38bdf8;
}
.eta-metrics-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.eta-pill {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.eta-time {
  background: rgba(2, 132, 199, 0.12);
  color: #0284c7;
  font-weight: 700;
}
:root[data-theme="dark"] .eta-time {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}
.eta-dist {
  background: rgba(100, 116, 139, 0.1);
  color: #475569;
}
:root[data-theme="dark"] .eta-dist {
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}
.eta-mode {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}
:root[data-theme="dark"] .eta-mode {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}
.eta-taxi {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}
:root[data-theme="dark"] .eta-taxi {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

/* HIGH-CONTRAST METADATA BADGES */
.act-meta-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 3px 0 5px;
}
.meta-tag-pill {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1.5;
}
.tag-rating {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}
:root[data-theme="dark"] .tag-rating {
  background: rgba(245, 158, 11, 0.2);
  color: #fde047;
  border-color: rgba(245, 158, 11, 0.4);
}
.tag-hours {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}
:root[data-theme="dark"] .tag-hours {
  background: rgba(30, 41, 59, 0.9);
  color: #cbd5e1;
  border-color: rgba(255, 255, 255, 0.15);
}
.tag-dwell {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}
:root[data-theme="dark"] .tag-dwell {
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
  border-color: rgba(14, 165, 233, 0.4);
}
.tag-best-time {
  background: #ffedd5;
  color: #c2410c;
  border: 1px solid #fed7aa;
}
:root[data-theme="dark"] .tag-best-time {
  background: rgba(249, 115, 22, 0.2);
  color: #fdba74;
  border-color: rgba(249, 115, 22, 0.4);
}
.tag-indoor {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
:root[data-theme="dark"] .tag-indoor {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.4);
}
.tag-outdoor {
  background: #fef9c3;
  color: #854d0e;
  border: 1px solid #fef08a;
}
:root[data-theme="dark"] .tag-outdoor {
  background: rgba(234, 179, 8, 0.2);
  color: #fde047;
  border-color: rgba(234, 179, 8, 0.4);
}
.tag-dress {
  background: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}
:root[data-theme="dark"] .tag-dress {
  background: rgba(168, 85, 247, 0.2);
  color: #d8b4fe;
  border-color: rgba(168, 85, 247, 0.4);
}
.tag-theme {
  background: #ffe4e6;
  color: #be123c;
  border: 1px solid #fecdd3;
}
:root[data-theme="dark"] .tag-theme {
  background: rgba(244, 63, 94, 0.2);
  color: #fda4af;
  border-color: rgba(244, 63, 94, 0.4);
}

/* ADDRESS & DESCRIPTION TYPOGRAPHY */
.act-address {
  font-size: 12.5px;
  color: #0284c7;
  font-weight: 600;
  margin: 3px 0 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
:root[data-theme="dark"] .act-address {
  color: #38bdf8;
}
.act-desc {
  font-size: 13.5px;
  color: #1e293b;
  line-height: 1.6;
  margin: 4px 0 7px;
  letter-spacing: 0.1px;
  font-weight: 500;
}
:root[data-theme="dark"] .act-desc {
  color: #e2e8f0;
  font-weight: 400;
}

/* SIGNATURE DISHES HIGHLIGHT BOX */
.act-signature-box {
  background: #fff1f2;
  border-left: 3.5px solid #f43f5e;
  border-radius: 6px;
  padding: 6px 12px;
  margin: 6px 0;
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}
:root[data-theme="dark"] .act-signature-box {
  background: rgba(225, 29, 72, 0.15);
  border-left: 3.5px solid #f43f5e;
}
.asb-title {
  color: #be123c;
  font-weight: 700;
}
:root[data-theme="dark"] .asb-title {
  color: #fb7185;
}
.asb-dishes {
  color: #881337;
  font-weight: 600;
}
:root[data-theme="dark"] .asb-dishes {
  color: #ffe4e6;
}

/* PRICING BOX */
.act-cost-box {
  background: #f0fdf4;
  border-left: 3.5px solid #10b981;
  border-radius: 6px;
  padding: 6px 12px;
  margin-top: 5px;
  font-size: 12.5px;
  color: #166534;
}
:root[data-theme="dark"] .act-cost-box {
  background: rgba(16, 185, 129, 0.15);
  border-left: 3.5px solid #10b981;
  color: #6ee7b7;
}
.act-cost-box b {
  color: #15803d;
  font-weight: 700;
}
:root[data-theme="dark"] .act-cost-box b {
  color: #a7f3d0;
}

/* RAIN MODAL STYLES */
.rain-modal-card {
  background: #fff;
  border-radius: 20px;
  max-width: 520px;
  width: 92%;
  padding: 24px;
  box-shadow: 0 20px 45px rgba(0,0,0,0.2);
  animation: popIn 0.25s ease-out;
}
.rmc-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}
.rmc-icon-badge {
  font-size: 32px;
  background: #e0f2fe;
  padding: 8px 12px;
  border-radius: 14px;
}
.rmc-sub {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 2px;
}
.rmc-weather-alert-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.rmc-wa-icon { font-size: 24px; }
.rmc-wa-content strong { font-size: 13px; color: #166534; display: block; margin-bottom: 2px; }
.rmc-wa-content p { font-size: 12px; color: #374151; line-height: 1.4; margin: 0; }
.rmc-ai-proposal {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}
.rmc-proposal-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 10px;
}
.rmc-proposal-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rmc-proposal-list li {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--text-main);
  line-height: 1.4;
}
.rmc-step-num {
  width: 20px;
  height: 20px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 11px;
  flex-shrink: 0;
  margin-top: 1px;
}
.rmc-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.rmc-confirm-btn {
  background: linear-gradient(135deg, #0284c7, #0284c7) !important;
}

/* MY TRIPS TAB */
.my-trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.my-trip-card {
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.trip-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.trip-dest { font-size: 11px; font-weight: 800; color: var(--primary); background: var(--primary-light); padding: 2px 8px; border-radius: 8px; }
.trip-date { font-size: 11px; color: var(--text-sub); }
.my-trip-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
.my-trip-card p { font-size: 12px; color: var(--text-sub); margin-bottom: 12px; }
.trip-actions { display: flex; gap: 8px; }
.open-trip-btn {
  flex: 1;
  background: var(--primary);
  color: #fff;
  border: 0;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}
.share-trip-btn {
  background: #f1f5f9;
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.share-trip-btn:hover {
  background: #e2e8f0;
}
.delete-trip-btn {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
}
.delete-trip-btn:hover {
  background: #e11d48;
  color: #fff;
  border-color: #e11d48;
  transform: scale(1.08);
  box-shadow: 0 3px 10px rgba(225, 29, 72, 0.35);
}
[data-theme="dark"] .delete-trip-btn {
  background: rgba(225, 29, 72, 0.12);
  border-color: rgba(225, 29, 72, 0.3);
  color: #fb7185;
}
[data-theme="dark"] .delete-trip-btn:hover {
  background: #e11d48;
  color: #fff;
}
/* CHAT TAB */
.chat-pane {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.ai-avatar-badge {
  width: 36px;
  height: 36px;
  background: var(--primary-light);
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 18px;
}
.chat-header h3 { font-size: 14px; font-weight: 800; }
.ai-status { font-size: 11px; color: #16a34a; font-weight: 600; }

.quick-prompts-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 8px 0;
}
.prompt-chip {
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.prompt-chip:hover { border-color: var(--primary); color: var(--primary); }

.chat-messages-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
}
.chat-welcome { text-align: center; padding: 30px 20px; color: var(--text-sub); }
.welcome-robot { font-size: 36px; display: block; margin-bottom: 8px; }
.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.4;
}
.bubble-user {
  align-self: flex-end;
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 2px;
}
.bubble-user .bubble-header { color: #cde6e4; font-size: 10px; font-weight: 700; margin-bottom: 2px; }
.bubble-assistant {
  align-self: flex-start;
  background: #f1f5f9;
  color: var(--text-main);
  border-bottom-left-radius: 2px;
}
.bubble-assistant .bubble-header { color: var(--primary); font-size: 10px; font-weight: 700; margin-bottom: 2px; }

.chat-input-bar {
  display: flex;
  gap: 8px;
}
.chat-text-input {
  flex: 1;
  border: 1px solid var(--border-color);
  background: #fff;
  padding: 12px 14px;
  border-radius: 20px;
  font-size: 13px;
}
.send-msg-btn {
  background: var(--primary);
  color: #fff;
  border: 0;
  padding: 0 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

/* PROFILE & AUTH TAB */
/* PROFILE & AUTH TAB PREMIUM */
.profile-card-premium {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}
.profile-cover {
  height: 120px;
  background: linear-gradient(135deg, #0ea5e9, #10b981);
  position: relative;
}
.edit-profile-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: 0.2s;
}
.edit-profile-btn:hover { background: rgba(255,255,255,0.3); }
.profile-avatar-premium {
  position: relative;
  width: 100px;
  height: 100px;
  margin: -50px auto 16px;
  border-radius: 50%;
  border: 4px solid white;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: 800;
}
.level-badge {
  position: absolute;
  bottom: -5px;
  background: #8b5cf6;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  border: 2px solid white;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.profile-info-premium {
  padding: 0 24px 24px;
  text-align: center;
}
.profile-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}
.admin-badge {
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  vertical-align: middle;
}
.profile-email {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 12px;
}
.profile-bio {
  color: #475569;
  font-style: italic;
  font-size: 0.95rem;
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.profile-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
}
.stat-box-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-box-premium .stat-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}
.stat-box-premium strong {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}
.stat-box-premium small {
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
}
.logout-btn-premium {
  background: white;
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}
.logout-btn-premium:hover {
  background: #fef2f2;
}

.profile-edit-form {
  padding: 0 24px 24px;
  text-align: left;
}
.profile-edit-form h3 {
  margin-bottom: 20px;
  text-align: center;
}
.edit-field {
  margin-bottom: 16px;
}
.edit-field label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}
.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.cancel-edit-btn {
  flex: 1;
  background: white;
  border: 1px solid #cbd5e1;
  color: #64748b;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.save-edit-btn {
  flex: 2;
  background: #10b981;
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.auth-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}
.auth-tab {
  flex: 1;
  background: transparent;
  border: 0;
  padding: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub);
  border-bottom: 2px solid transparent;
}
.auth-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.auth-form-body { display: flex; flex-direction: column; gap: 12px; }
.auth-error-msg { font-size: 12px; color: #dc2626; margin: 0; }
.auth-submit-btn { width: 100%; margin-top: 6px; }

.auth-submit-btn { width: 100%; margin-top: 6px; }

/* ==================== AUTH MODAL GLASSMORPHISM ==================== */
.auth-overlay-glass {
  background: url('/images/auth-bg.jpg') center/cover no-repeat;
  perspective: 1000px;
}
.auth-overlay-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
.auth-card-glass {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 24px 48px rgba(0,0,0,0.4) !important;
  max-width: 360px !important; /* Thu gß╗ìn */
  position: relative;
  z-index: 2;
  color: #fff;
  padding: 30px !important;
}
.auth-card-glass .modal-header h3 { color: #fff; }
.auth-card-glass .close-modal-btn {
  background: rgba(255,255,255,0.2) !important;
  color: #fff;
}
.auth-card-glass .auth-tabs { border-bottom-color: rgba(255,255,255,0.2); }
.auth-card-glass .auth-tab {
  color: rgba(255,255,255,0.6);
  border-bottom-color: transparent;
}
.auth-card-glass .auth-tab.active {
  color: #fff;
  border-bottom-color: #fff;
}
.auth-card-glass label { color: rgba(255,255,255,0.9); }
.auth-card-glass .app-input {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
  color: #fff !important;
}
.auth-card-glass .app-input::placeholder { color: rgba(255,255,255,0.5); }
.auth-card-glass .app-input:focus {
  background: rgba(255,255,255,0.2) !important;
  border-color: #fff !important;
}
.auth-card-glass .app-primary-btn {
  background: #fff !important;
  color: #000 !important;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(255,255,255,0.2);
}

/* Auth Fade Transition */
.auth-fade-enter-active, .auth-fade-leave-active {
  transition: opacity 0.5s ease;
}
.auth-fade-enter-active .auth-card-glass {
  animation: authCardEnter 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.auth-fade-leave-active .auth-card-glass {
  transition: transform 0.5s ease;
}
.auth-fade-enter-from, .auth-fade-leave-to {
  opacity: 0;
}
.auth-fade-leave-to .auth-card-glass {
  transform: translateY(20px) scale(0.95);
}
@keyframes authCardEnter {
  0% { transform: translateY(30px) scale(0.9) rotateX(-10deg); opacity: 0; }
  100% { transform: translateY(0) scale(1) rotateX(0); opacity: 1; }
}

/* MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
}
.modal-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.close-modal-btn {
  background: #f1f5f9;
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 800;
}
.splitter-body { display: flex; flex-direction: column; gap: 14px; }
.splitter-result-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}
.splitter-result-box small { font-size: 10px; font-weight: 800; color: #16a34a; }
.splitter-result-box strong { display: block; font-size: 24px; color: var(--accent); margin: 6px 0; }
.splitter-result-box p { font-size: 11px; color: var(--text-sub); }

/* TRAVEL PASS / BOARDING PASS */
.boarding-pass {
  background: #f8fafc;
  border: 2px dashed #94a3b8;
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 14px;
}
.pass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 12px;
}
.pass-logo { font-size: 13px; font-weight: 800; color: var(--primary); display: inline-flex; align-items: center; gap: 6px; }
.pass-mini-logo { width: 22px; height: 22px; border-radius: 50%; object-fit: contain; }
.pass-dest { font-size: 16px; font-weight: 800; color: var(--accent); }
.pass-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.pass-row small { display: block; font-size: 9px; color: var(--text-sub); font-weight: 700; }
.pass-row b { font-size: 13px; }
.pass-hotel {
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}
.pass-hotel small { font-size: 9px; font-weight: 700; color: var(--primary); }
.pass-hotel b { display: block; font-size: 12px; margin: 2px 0; }
.pass-hotel p { font-size: 11px; color: var(--text-sub); margin: 0; }
.pass-qr-sim {
  text-align: center;
  border-top: 1px dashed var(--border-color);
  padding-top: 10px;
}
.qr-mockup {
  display: inline-block;
  background: #1e293b;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 4px;
}
.pass-qr-sim small { display: block; font-size: 10px; color: var(--text-sub); }

/* RESPONSIVE TR├èN M├üY T├ìNH & MOBILE */
@media (max-width: 640px) {
  .app-main { padding: 12px 10px; min-width: 0; overflow-x: hidden; }
  .tab-pane { min-width: 0; }
  .planner-tab-bg { padding: 16px 12px 32px; width: 100%; box-sizing: border-box; }
  .planner-form-container { margin: 0; padding: 16px; width: 100%; box-sizing: border-box; max-width: 100%; min-width: 0; }
  .app-form-grid { grid-template-columns: 1fr; }
  .app-field, .origin-select-wrapper { min-width: 0; }
  .app-field.full-width, .bus-optimization-section { grid-column: span 1; }
  .hotel-main-info { flex-direction: column; }
  .hotel-side { text-align: left; }
  .places-app-grid { grid-template-columns: 1fr; }
  .origin-quick-picks { flex-wrap: wrap; overflow-x: visible; }
}

@media (max-width: 480px) {
  .app-main { padding: 10px 6px; }
  .planner-tab-bg { padding: 12px 8px 24px; }
  .planner-form-container { padding: 12px; }
  .wizard-progress { padding: 8px 10px; margin-bottom: 16px; gap: 4px; }
  .step-indicator { font-size: 0.75rem; padding: 4px 8px; }
  .step-divider { margin: 0 2px; }
  .ai-hint-bubble { padding: 12px; gap: 10px; border-radius: 12px; flex-direction: column; align-items: center; text-align: center; }
  .ai-hint-robot { display: flex; justify-content: center; }
  .ai-hint-robot img { width: 36px !important; height: 36px !important; }
  .ai-hint-content p { font-size: 0.85rem; margin-bottom: 8px; }
  .ai-chip { font-size: 0.75rem; padding: 4px 10px; }
  .wizard-footer { flex-direction: column; gap: 12px; }
  .wizard-footer button { width: 100%; justify-content: center; }
  .origin-mode-switch button { padding: 4px 8px; font-size: 10px; }
  .route-overview-banner.compact { flex-direction: column; align-items: flex-start; gap: 8px; }
  .rob-mid-compact { width: 100%; margin: 8px 0; }
  .dbc-grid { grid-template-columns: 1fr; gap: 8px; }
  .budget-quick-tags .quick-tag-chip { font-size: 11px; padding: 6px 10px; }
  .act-meta-badges { gap: 3px; margin: 2px 0; }
  .meta-tag-pill { padding: 1px 6px; font-size: 10px; }
  .act-desc {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12.5px;
    margin: 2px 0 5px;
  }
  .act-signature-box, .act-cost-box { padding: 4px 8px; margin: 4px 0; font-size: 11.5px; }
  .eta-pill { padding: 2px 6px; font-size: 10px; }
  .eta-metrics-row { gap: 4px; }
  .transit-badge { padding: 4px 8px; font-size: 10.5px; }
}


@media print {
  .app-header, .app-bottom-nav, .plan-tool-actions, .app-map-box, .mode-toggle-btn {
    display: none !important;
  }
  .app-root, .app-container {
    background: #fff;
    box-shadow: none;
    padding: 0;
  }
}
/* WIZARD UI STYLES */
.wizard-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 12px 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}
.step-indicator {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-sub);
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
}
.step-indicator.active {
  color: var(--primary);
  background: var(--primary-light);
}
.step-divider {
  flex: 1;
  height: 2px;
  background: var(--border-color);
  margin: 0 10px;
}
.wizard-step-content {
  animation: fadeIn 0.4s ease-out;
}
.wizard-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 16px;
  align-items: stretch;
}
.wizard-footer .app-primary-btn {
  flex: 1;
}
.wizard-footer .app-secondary-btn {
  flex: 0 0 auto;
  min-width: 120px;
  background: #e2e8f0;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
}
.wizard-footer .app-secondary-btn:hover:not(:disabled) {
  background: #cbd5e1;
  color: #0f172a;
}
.app-secondary-btn {
  background: var(--input-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.app-secondary-btn:hover:not(:disabled) {
  background: #e2e8f0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==================== STYLES CHO AI PERSONALITY (Mß╗ñC 6, 7, 8) ==================== */

/* FLOATING PERSONALITY TOAST */
.personality-floating-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(15, 23, 42, 0.94);
  color: #fff;
  padding: 14px 20px;
  border-radius: 18px;
  box-shadow: 0 16px 36px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  max-width: 440px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.personality-floating-toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 42px rgba(0,0,0,0.4);
}
.pft-icon {
  font-size: 28px;
  flex-shrink: 0;
  animation: robotBounce 2s ease-in-out infinite;
}
.pft-body {
  flex: 1;
}
.pft-body strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: #fde68a;
  margin-bottom: 3px;
}
.pft-body p {
  font-size: 12px;
  color: rgba(255,255,255,0.92);
  line-height: 1.4;
  margin: 0;
}
.pft-close {
  background: transparent;
  border: 0;
  color: rgba(255,255,255,0.6);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}
.pft-close:hover {
  color: #fff;
}
.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* QUICK BUDGET CHIPS */
.quick-budget-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.q-budget-chip {
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  color: var(--text-main);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.q-budget-chip:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}
.q-budget-chip.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
}

/* PERSONALITY BUDGET CARD (Mß╗ñC 8) */
.personality-budget-card {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
}
.pbc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.pbc-icon {
  font-size: 20px;
}
.pbc-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 10px;
}
.pbc-text strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  margin-bottom: 2px;
}
.pbc-text p {
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
}

/* ─Éß╗Å / B├ío ─æß╗Öng (< 100K) */
.personality-budget-card.budget-danger {
  background: linear-gradient(135deg, #fef2f2, #fff1f2);
  border-color: #fecaca;
  color: #991b1b;
}
.personality-budget-card.budget-danger .pbc-tag {
  background: #fee2e2;
  color: #b91c1c;
}
:root[data-theme="dark"] .personality-budget-card.budget-danger {
  background: rgba(153, 27, 27, 0.2);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

/* Tß╗æi giß║ún (100K - 500K) */
.personality-budget-card.budget-minimal {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fde68a;
  color: #92400e;
}
.personality-budget-card.budget-minimal .pbc-tag {
  background: #fef3c7;
  color: #b45309;
}
:root[data-theme="dark"] .personality-budget-card.budget-minimal {
  background: rgba(217, 119, 6, 0.18);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fde68a;
}

/* Tiß║┐t kiß╗çm / Ph╞░ß╗út (500K - 1.5Tr) */
.personality-budget-card.budget-saving {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #bbf7d0;
  color: #166534;
}
.personality-budget-card.budget-saving .pbc-tag {
  background: #dcfce7;
  color: #15803d;
}
:root[data-theme="dark"] .personality-budget-card.budget-saving {
  background: rgba(22, 101, 52, 0.2);
  border-color: rgba(34, 197, 94, 0.35);
  color: #86efac;
}

/* Rß╗ºng rß╗ënh / Thoß║úi m├íi (1.5Tr - 5Tr) */
.personality-budget-card.budget-cozy {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-color: #bae6fd;
  color: #075985;
}
.personality-budget-card.budget-cozy .pbc-tag {
  background: #e0f2fe;
  color: #0369a1;
}
:root[data-theme="dark"] .personality-budget-card.budget-cozy {
  background: rgba(3, 105, 161, 0.2);
  border-color: rgba(14, 165, 233, 0.35);
  color: #7dd3fc;
}

/* ─Éß║íi gia / Sang chß║únh (> 5Tr) */
.personality-budget-card.budget-luxury {
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  border-color: #e9d5ff;
  color: #6b21a8;
}
.personality-budget-card.budget-luxury .pbc-tag {
  background: #f3e8ff;
  color: #7e22ce;
}
:root[data-theme="dark"] .personality-budget-card.budget-luxury {
  background: rgba(107, 33, 168, 0.2);
  border-color: rgba(168, 85, 247, 0.35);
  color: #d8b4fe;
}

/* AI GENERATING CARD (Mß╗ñC 6) */
.ai-generating-card {
  margin-top: 24px;
  background: linear-gradient(135deg, #1e1b4b, #312e81, #0f172a);
  border-radius: var(--radius-lg);
  padding: 36px 24px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 16px 40px rgba(49, 46, 129, 0.35);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
}
.ai-gen-radar {
  position: relative;
  width: 110px;
  height: 110px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.radar-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(129, 140, 248, 0.6);
  animation: radarWave 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
}
@keyframes radarWave {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}
.radar-center {
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.7);
  z-index: 2;
  animation: floatCenter 2s ease-in-out infinite;
}
@keyframes floatCenter {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.radar-orb {
  position: absolute;
  font-size: 18px;
  animation: orbOrbit 6s linear infinite;
}
.orb-1 { top: 0; left: 45px; animation-delay: 0s; }
.orb-2 { top: 45px; right: 0; animation-delay: -1.5s; }
.orb-3 { bottom: 0; left: 45px; animation-delay: -3s; }
.orb-4 { top: 45px; left: 0; animation-delay: -4.5s; }

@keyframes orbOrbit {
  0% { transform: rotate(0deg) translateX(46px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(46px) rotate(-360deg); }
}

.ai-gen-body {
  max-width: 540px;
  width: 100%;
}
.ai-gen-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.12);
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #c7d2fe;
  margin-bottom: 14px;
}
.pulsing-dot {
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  animation: pulseDot 1.2s infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}
.ai-gen-message {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ai-gen-progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}
.ai-gen-progress-bar {
  height: 100%;
  width: 45%;
  background: linear-gradient(90deg, #38bdf8, #818cf8, #f472b6);
  border-radius: 10px;
  animation: progressScan 1.6s ease-in-out infinite alternate;
}
@keyframes progressScan {
  0% { transform: translateX(-50%); width: 30%; }
  100% { transform: translateX(250%); width: 60%; }
}
.ai-gen-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin: 0;
}
.msg-slide-enter-active, .msg-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.msg-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.msg-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* AI COMPLETION BANNER (Mß╗ñC 7) */
.ai-completion-banner {
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #0d9488 100%);
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 28px rgba(5, 150, 105, 0.3);
  position: relative;
  animation: slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-15px); }
  to { opacity: 1; transform: translateY(0); }
}
.acb-left {
  flex-shrink: 0;
}
.acb-icon {
  font-size: 36px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
  animation: robotBounce 2s ease-in-out infinite;
}
.acb-content {
  flex: 1;
}
.acb-badge {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(255,255,255,0.2);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  margin-bottom: 4px;
}
.acb-content h4 {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 4px;
  color: #fff;
}
.acb-content p {
  font-size: 13px;
  margin: 0;
  color: rgba(255,255,255,0.92);
  line-height: 1.4;
}
.acb-close {
  background: rgba(255,255,255,0.18);
  border: 0;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.acb-close:hover {
  background: rgba(255,255,255,0.35);
}

/* BUDGET HUMOR CALLOUT (Mß╗ñC 8 TRONG Kß║╛T QUß║ó) */
.budget-humor-callout {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 600;
}
.bhc-icon {
  font-size: 20px;
  flex-shrink: 0;
}
:root[data-theme="dark"] .budget-humor-callout {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
  color: #fde68a;
}

/* ==================== ITINERARY VIEW SWITCHER (MAP VIEW TOGGLE) ==================== */
.itinerary-view-switcher {
  display: flex;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 5px;
  gap: 6px;
  margin-top: 14px;
  box-shadow: var(--shadow-sm);
}
.iv-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: 0;
  padding: 10px 14px;
  min-height: 42px; /* ─Éß║ít chuß║⌐n touch target >= 42px cß╗ºa UI/UX Pro Max */
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}
.iv-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}
.iv-btn:hover {
  color: var(--primary);
  background: rgba(255, 255, 255, 0.6);
}
.iv-btn.active {
  background: #fff;
  color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
}
:root[data-theme="dark"] .iv-btn.active {
  background: var(--card-bg);
  color: #38bdf8;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.08);
}

/* MAP VIEW EXPANDED MODE */
.app-map-box.map-expanded {
  margin-top: 10px;
}
.app-map-box.map-expanded .app-map-iframe {
  height: 520px;
  transition: height 0.3s ease;
}
.map-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-badge-expanded {
  font-size: 10px;
  font-weight: 800;
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.04em;
}

/* ==================== TRANSIT MICRO-UX BADGE ==================== */
.transit-micro-row {
  display: grid;
  grid-template-columns: 50px 18px 1fr;
  gap: 10px;
  padding: 2px 0 6px 0;
  position: relative;
}
.transit-time-col {
  /* Cß╗Öt thß╗¥i gian ─æß╗â trß╗æng tß║ío nhß╗ïp thß╗ƒ cho timeline */
}
.transit-line-col {
  display: flex;
  justify-content: center;
  position: relative;
}
.transit-track-line {
  width: 2px;
  height: 100%;
  min-height: 48px;
  background: linear-gradient(to bottom, #0d9488, #cbd5e1);
  border-radius: 2px;
}
:root[data-theme="dark"] .transit-track-line {
  background: linear-gradient(to bottom, #14b8a6, #334155);
}

.transit-body-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 2px;
}
.transit-pill-wrap {
  display: flex;
  align-items: center;
}
.transit-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(240, 253, 250, 0.9);
  border: 1px dashed #99f6e4;
  color: #0f766e;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 11.5px;
  font-weight: 600;
  text-decoration: none;
  backdrop-filter: blur(8px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.08);
}
.transit-badge:hover {
  transform: translateY(-2px) scale(1.02);
  background: #ccfbf1;
  border-color: #14b8a6;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.2);
}
.transit-icon {
  font-size: 15px;
  line-height: 1;
}
.transit-info {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.transit-info b {
  color: #0d9488;
  font-weight: 800;
}
.dot-sep {
  opacity: 0.5;
}
.transit-arrow {
  font-size: 11px;
  font-weight: 800;
  color: #0d9488;
  opacity: 0.7;
  transition: transform 0.2s;
}
.transit-badge:hover .transit-arrow {
  transform: translate(2px, -2px);
  opacity: 1;
}
:root[data-theme="dark"] .transit-badge {
  background: rgba(20, 184, 166, 0.12);
  border-color: rgba(20, 184, 166, 0.3);
  color: #5eead4;
}
:root[data-theme="dark"] .transit-badge:hover {
  background: rgba(20, 184, 166, 0.22);
}
:root[data-theme="dark"] .transit-info b {
  color: #2dd4bf;
}

/* ==================== WARNING COLOR PALETTE (Cß║óNH B├üO XUNG ─Éß╗ÿT UX) ==================== */
.transit-warning-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  line-height: 1.4;
  border-left: 4px solid;
  animation: fadeIn 0.3s ease-out;
  max-width: 580px;
}
.twa-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.twa-content {
  flex: 1;
}
.twa-content strong {
  display: block;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 2px;
}
.twa-content p {
  margin: 0;
  font-size: 11px;
}
.twa-action-btn {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid currentColor;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.twa-action-btn:hover {
  background: #fff;
  transform: translateY(-1px);
}

/* Trß║íng th├íi S├ít giß╗¥ (Amber Warning) */
.transit-warning-alert.warning-tight {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #92400e;
  border-left-color: #f59e0b;
}
.transit-warning-alert.warning-tight .twa-action-btn {
  color: #92400e;
}
:root[data-theme="dark"] .transit-warning-alert.warning-tight {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fde68a;
  border-left-color: #f59e0b;
}

/* Trß║íng th├íi Qu├úng ─æ╞░ß╗¥ng xa / Ng╞░ß╗úc tuyß║┐n (Red Alert) */
.transit-warning-alert.warning-far {
  background: #fef2f2;
  border-color: #ef4444;
  color: #991b1b;
  border-left-color: #ef4444;
}
.transit-warning-alert.warning-far .twa-action-btn {
  color: #991b1b;
}
:root[data-theme="dark"] .transit-warning-alert.warning-far {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border-left-color: #ef4444;
}

/* VIEW TRANSITION SMOOTHNESS */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.view-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .itinerary-view-switcher {
    flex-direction: column;
  }
  .transit-micro-row {
    grid-template-columns: 42px 14px 1fr;
  }
  .transit-warning-alert {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ==================== ─ÉIß╗éM Bß║«T ─Éß║ªU & Lß╗ÿ TR├îNH VISUALIZER ==================== */
.route-origin-tag {
  font-size: 12px;
  color: var(--primary);
  background: rgba(14, 165, 233, 0.1);
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
}
.quick-origin-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.q-origin-chip {
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 16px;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-color, #334155);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.q-origin-chip:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(14, 165, 233, 0.08);
}
.q-origin-chip.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.3);
}
.qoc-icon {
  font-size: 12.5px;
}
.qoc-name {
  line-height: 1;
}
:root[data-theme="dark"] .q-origin-chip {
  background: rgba(30, 41, 59, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

/* Banner Lß╗Ö tr├¼nh si├¬u gß╗ìn (Compact Route Banner) */
.route-overview-banner.compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(99, 102, 241, 0.06));
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 12px;
  padding: 8px 14px;
  margin: 6px 0 10px 0;
  gap: 8px;
}
.rob-point {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}
.rob-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.rob-dot.start {
  background: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.25);
}
.rob-dot.end {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}
.rob-label {
  font-size: 11px;
  color: var(--text-muted);
}
.rob-point strong {
  color: var(--text-color);
  font-weight: 700;
}
.rob-mid-compact {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 10px;
}
.rob-dash-line {
  position: absolute;
  width: 100%;
  height: 1.5px;
  background: repeating-linear-gradient(90deg, #0ea5e9, #0ea5e9 4px, transparent 4px, transparent 8px);
  z-index: 1;
}
.rob-dist-pill {
  position: relative;
  z-index: 2;
  background: var(--card-bg, #fff);
  border: 1px solid #0ea5e9;
  color: #0284c7;
  padding: 2px 9px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
:root[data-theme="dark"] .rob-dist-pill {
  background: #0f172a;
  color: #38bdf8;
  border-color: #38bdf8;
}
:root[data-theme="dark"] .rob-badge {
  background: #0f172a;
  color: #38bdf8;
  border-color: #38bdf8;
}
.rob-note {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  font-weight: 500;
}

/* ==================== Tß╗ÉI ╞»U CHI PH├ì XE & Gß╗óI ├¥ NH├Ç XE ==================== */
.bus-optimization-section {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 18px;
  padding: 20px;
  margin-top: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  min-width: 0;
  grid-column: span 2;
}
.bos-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.bos-kicker {
  font-size: 11px;
  font-weight: 800;
  color: #0284c7;
  letter-spacing: 0.06em;
  display: block;
  margin-bottom: 4px;
}
.bos-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--text-color);
}
.bos-badges-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.bos-dist-badge {
  font-size: 12px;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 12px;
}
.bos-crawler-badge {
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 4px 10px;
  border-radius: 12px;
}
:root[data-theme="dark"] .bos-dist-badge {
  background: #1e293b;
  color: #94a3b8;
}

/* Grid So S├ính Ph╞░╞íng Tiß╗çn */
.transit-vehicles-grid {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  min-width: 0;
}
.transit-vehicles-grid::-webkit-scrollbar { height: 8px; }
.transit-vehicles-grid::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
.transit-vehicles-grid::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
.transit-vehicles-grid {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f5f9;
}

.tv-card {
  flex: 0 0 240px;
  scroll-snap-align: start;
  background: var(--bg-soft, #f8fafc);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}
.tv-card:hover {
  transform: translateY(-2px);
  border-color: #0ea5e9;
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.12);
}
.tv-card.active {
  border-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.05);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.25);
}
.tv-card.highlight-cheapest {
  border-color: #10b981;
}
:root[data-theme="dark"] .tv-card {
  background: #1e293b;
  border-color: #334155;
}
.tv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.tv-icon {
  font-size: 22px;
}
.tv-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
}
.tv-badge.cheapest {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}
.tv-badge.fastest {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}
.tv-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 4px;
}
.tv-price-row strong {
  font-size: 15px;
  color: #0284c7;
  font-weight: 800;
}
.tv-price-row small {
  color: var(--text-muted);
  font-size: 11px;
}
.tv-total {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 3px;
}
.tv-total b {
  color: #059669;
}
.tv-duration {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 6px;
  font-weight: 600;
}
.tv-advantage {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  line-height: 1.35;
  flex: 1;
}

/* Danh s├ích Nh├á Xe Gi├í Rß║╗ */
.bus-operators-box {
  margin-top: 10px;
  border-top: 1px dashed var(--border-color, #e2e8f0);
  padding-top: 16px;
}
.bob-title-row {
  margin-bottom: 14px;
}
.bob-title-row h4 {
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 2px 0;
  color: var(--text-color);
}
.bob-title-row small {
  font-size: 12px;
  color: var(--text-muted);
}
.bus-operators-grid {
  display: flex;
  overflow-x: auto;
  gap: 14px;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  min-width: 0;
}
.bus-operators-grid::-webkit-scrollbar {
  height: 8px;
}
.bus-operators-grid::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 4px;
}
.bus-operators-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.bus-operators-grid {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f5f9;
}
.bus-item-card {
  flex: 0 0 320px;
  scroll-snap-align: start;
  background: var(--bg-soft, #f8fafc);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}
.bus-item-card:hover {
  border-color: #0ea5e9;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}
.bus-item-card.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.04);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}
:root[data-theme="dark"] .bus-item-card {
  background: #1e293b;
  border-color: #334155;
}
:root[data-theme="dark"] .bus-item-card.selected {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}
.bic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.bic-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.bic-name {
  font-size: 15.5px;
  font-weight: 800;
  color: var(--text-color);
}
.bic-tag {
  font-size: 10.5px;
  font-weight: 800;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  padding: 2px 7px;
  border-radius: 6px;
}
.bic-type {
  display: block;
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}
.bic-rating {
  font-size: 12px;
  font-weight: 700;
  color: #f59e0b;
  white-space: nowrap;
}
.bic-rating small {
  color: var(--text-muted);
  font-weight: 400;
}
.bic-specs {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  margin-bottom: 12px;
  background: var(--card-bg, #fff);
  padding: 8px 10px;
  border-radius: 8px;
}
:root[data-theme="dark"] .bic-specs {
  background: #0f172a;
}
.bic-spec {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bic-spec span {
  color: var(--text-muted);
}
.bic-spec b {
  color: var(--text-color);
}
.bic-spec small {
  color: var(--text-muted);
  text-align: right;
  max-width: 65%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* FOOTER CARD TINH Gß╗îN (2 Tß║ªNG CHß╗ÉNG TR├ÇN N├ÜT) */
.bic-footer-clean {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bic-price-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.bpl-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.bpl-label {
  font-size: 11px;
  color: var(--text-muted);
}
.bpl-unit {
  font-size: 18px;
  font-weight: 900;
  color: #0284c7;
}
.bpl-unit.train-price-color {
  color: #6366f1;
}
.bpl-sub {
  font-size: 11px;
  color: var(--text-muted);
}
.bpl-total-badge {
  font-size: 11.5px;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 600;
}
.bpl-total-badge.train-total-badge {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

/* H├áng n├║t bß║Ñm chia ─æß╗üu 50/50 */
.bic-actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.bic-action-call {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-soft, #f1f5f9);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 9px 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-color, #334155);
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
}
.bic-action-call:hover {
  background: #e2e8f0;
  color: #0f172a;
}
:root[data-theme="dark"] .bic-action-call {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}
.bic-action-select {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0ea5e9;
  border: none;
  border-radius: 10px;
  padding: 9px 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.25);
}
.bic-action-select:hover {
  background: #0284c7;
}
.bic-action-select.active {
  background: #10b981;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

/* ==================== Tß╗öNG Hß╗óP XE KH├üCH Tß║áI PLAN RESULTS ==================== */
.trip-transit-summary-card {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(16, 185, 129, 0.06));
  border: 1.5px solid rgba(14, 165, 233, 0.3);
  border-radius: 16px;
  padding: 16px 20px;
  margin-top: 14px;
}
:root[data-theme="dark"] .trip-transit-summary-card {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.1));
  border-color: rgba(14, 165, 233, 0.4);
}
.ttsc-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.ttsc-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ttsc-icon {
  font-size: 32px;
  background: #fff;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}
:root[data-theme="dark"] .ttsc-icon {
  background: #1e293b;
}
.ttsc-badge {
  font-size: 10px;
  font-weight: 800;
  color: #0284c7;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}
.ttsc-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-color);
}
.ttsc-meta {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 3px 0 0 0;
}
.ttsc-meta b {
  color: var(--text-color);
}
.ttsc-schedule {
  font-size: 12px;
  color: var(--text-muted);
  margin: 4px 0 0 0;
}
.ttsc-schedule b {
  color: #0284c7;
}
.ttsc-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.ttsc-price-block {
  text-align: right;
}
.ttsc-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}
.ttsc-price {
  font-size: 20px;
  font-weight: 900;
  color: #0284c7;
}
.ttsc-price-block small {
  font-size: 11px;
  color: var(--text-muted);
}
.ttsc-total-calc {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}
.ttsc-total-calc b {
  color: #059669;
}
.ttsc-call-btn {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.ttsc-call-btn:hover {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .bos-header {
    flex-direction: column;
  }
  .transit-vehicles-grid {
    grid-template-columns: 1fr 1fr;
  }

  .ttsc-main {
    flex-direction: column;
    align-items: flex-start;
  }
  .ttsc-right {
    width: 100%;
    justify-content: space-between;
  }
  .ttsc-price-block {
    text-align: left;
  }
  .route-overview-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .rob-mid {
    width: 100%;
    padding: 6px 0;
  }
}

/* ==================== TRANSIT SUBTABS (XE KH├üCH VS T├ÇU Hß╗ÄA) ==================== */
.transit-tabs-header {
  display: flex;
  gap: 10px;
  margin: 16px 0 12px 0;
  border-bottom: 2px solid var(--border-color, #e2e8f0);
  padding-bottom: 8px;
}
.transit-subtab-btn {
  background: var(--bg-soft, #f1f5f9);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-color, #334155);
  cursor: pointer;
  transition: all 0.2s ease;
}
.transit-subtab-btn:hover {
  border-color: #0ea5e9;
  color: #0ea5e9;
}
.transit-subtab-btn.active {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff;
  border-color: #0284c7;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
}
:root[data-theme="dark"] .transit-subtab-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

/* Train Card Styles */
.train-card {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03), rgba(14, 165, 233, 0.03));
}
.train-tag {
  background: rgba(99, 102, 241, 0.15) !important;
  color: #6366f1 !important;
}
.train-select-btn {
  background: #6366f1 !important;
}
.train-select-btn:hover {
  background: #4f46e5 !important;
}
.train-select-btn.active {
  background: #10b981 !important;
}

/* ==================== 1. TOOLTIP N├ÜT Gß║áT TR╞»ß╗ÜC / SAU S├üP NHß║¼P ==================== */
.province-mode-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.province-tooltip-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--input-bg, #f1f5f9);
  border: 1px solid var(--border-color, #cbd5e1);
  font-size: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  user-select: none;
}
.province-tooltip-trigger:hover,
.province-tooltip-trigger:focus {
  background: var(--primary, #0d9488);
  border-color: var(--primary, #0d9488);
  color: #fff;
}
.province-tooltip-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  width: 280px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #cbd5e1);
  padding: 12px 14px;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  color: var(--text-main, #1e293b);
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  line-height: 1.45;
}
.province-tooltip-trigger:hover .province-tooltip-popover,
.province-tooltip-trigger:focus .province-tooltip-popover {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}
.province-tooltip-popover strong {
  display: block;
  font-size: 12px;
  color: var(--primary, #0d9488);
  margin-bottom: 6px;
}
.province-tooltip-popover p {
  margin-bottom: 4px;
  color: var(--text-sub, #64748b);
  font-size: 11.5px;
}
.province-tooltip-popover p:last-child {
  margin-bottom: 0;
}
:root[data-theme="dark"] .province-tooltip-popover {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
}

/* ==================== 2. INPUT T╞»╞áNG PHß║óN CAO & QUICK TAG CHIPS ==================== */
.enhanced-input {
  border: 1.5px solid #cbd5e1 !important;
  border-radius: var(--radius-sm, 12px) !important;
  background: var(--input-bg, #f8fafc) !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: var(--text-main, #0f172a) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important;
}
.enhanced-input:focus {
  border-color: var(--primary, #0d9488) !important;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.22) !important;
  background: #ffffff !important;
}
:root[data-theme="dark"] .enhanced-input {
  border-color: #334155 !important;
  background: rgba(15, 23, 42, 0.6) !important;
  color: #f8fafc !important;
}
:root[data-theme="dark"] .enhanced-input:focus {
  border-color: #14b8a6 !important;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.3) !important;
  background: rgba(15, 23, 42, 0.85) !important;
}
.input-hint-small {
  color: var(--text-sub, #64748b);
  font-size: 11px;
  font-weight: 500;
}
.quick-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 8px;
}
.quick-tag-chip {
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 16px;
  padding: 5px 11px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-sub, #64748b);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
  user-select: none;
}
.quick-tag-chip:hover {
  border-color: var(--primary, #0d9488);
  color: var(--primary, #0d9488);
  transform: translateY(-1px);
}
.quick-tag-chip.active {
  background: #f0fdfa;
  border-color: #14b8a6;
  color: #0f766e;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(20, 184, 166, 0.15);
}
:root[data-theme="dark"] .quick-tag-chip {
  background: rgba(30, 41, 59, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}
:root[data-theme="dark"] .quick-tag-chip:hover {
  border-color: #14b8a6;
  color: #5eead4;
}
:root[data-theme="dark"] .quick-tag-chip.active {
  background: rgba(20, 184, 166, 0.15);
  border-color: #14b8a6;
  color: #5eead4;
}

/* ==================== 3. Dß╗░ TO├üN CHI PH├ì TH├öNG MINH (DYNAMIC BUDGET BREAKDOWN) ==================== */
.dynamic-budget-card {
  margin-top: 14px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: var(--radius-md, 20px);
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.dbc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.dbc-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dbc-icon {
  font-size: 20px;
}
.dbc-title-group strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text-main, #1e293b);
}
.dbc-title-group small {
  display: block;
  font-size: 11px;
  color: var(--text-sub, #64748b);
  margin-top: 2px;
}
.dbc-total-badge {
  background: #f0fdfa;
  color: #0d9488;
  border: 1px solid #99f6e4;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 14px;
}
.dbc-progress-bar {
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: #e2e8f0;
  margin-bottom: 14px;
  gap: 2px;
}
.dbc-seg {
  height: 100%;
  transition: width 0.3s ease;
}
.seg-hotel   { background: #0d9488; }
.seg-food    { background: #f59e0b; }
.seg-transit { background: #0284c7; }
.seg-reserve { background: #8b5cf6; }

.dbc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 768px) {
  .dbc-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.dbc-item {
  background: var(--input-bg, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.dbc-item-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.dbc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-hotel   { background: #0d9488; }
.dot-food    { background: #f59e0b; }
.dot-transit { background: #0284c7; }
.dot-reserve { background: #8b5cf6; }

.dbc-cat {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub, #64748b);
  white-space: nowrap;
}
.dbc-amount {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main, #1e293b);
  margin-bottom: 2px;
}
.dbc-sub {
  font-size: 10px;
  color: var(--text-sub, #64748b);
  line-height: 1.3;
}
:root[data-theme="dark"] .dynamic-budget-card {
  background: #1e293b;
  border-color: #334155;
}
:root[data-theme="dark"] .dbc-item {
  background: rgba(15, 23, 42, 0.5);
  border-color: #334155;
}

/* ==================== 4. AI Tß╗ÉI ╞»U CUNG ─É╞»ß╗£NG & N├ÜT H├ÇNH ─Éß╗ÿNG Mß╗ÜI ==================== */
.ai-opt-highlight-btn {
  background: linear-gradient(135deg, #0d9488, #0f766e) !important;
  color: #fff !important;
  border: none !important;
  font-weight: 800 !important;
  box-shadow: 0 3px 10px rgba(13, 148, 136, 0.3);
}
.ai-opt-highlight-btn:hover {
  background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
  transform: translateY(-1px);
}
.gmap-all-stops-btn {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
  border-color: #bfdbfe !important;
  font-weight: 700 !important;
  text-decoration: none;
}
.gmap-all-stops-btn:hover {
  background: #dbeafe !important;
}
.zalo-share-btn {
  background: #0068ff1a !important;
  color: #0068ff !important;
  border-color: #0068ff40 !important;
  font-weight: 700 !important;
}
.zalo-share-btn:hover {
  background: #0068ff26 !important;
}
.day-header-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.dhp-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.day-route-opt-btn {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  color: #0d9488;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.day-route-opt-btn:hover {
  background: #0d9488;
  color: #fff;
  border-color: #0d9488;
  transform: translateY(-1px);
}
.route-opt-toast-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease;
}
.rotb-icon {
  font-size: 18px;
}
.rotb-content strong {
  display: block;
  font-size: 12px;
  color: #0f766e;
}
.rotb-content p {
  font-size: 11.5px;
  color: #134e4a;
  margin: 2px 0 0;
  line-height: 1.35;
}

/* ==================== 5. Cß║óNH B├üO THß╗£I TIß║╛T THEO NG├ÇY (WEATHER-AWARE) ==================== */
.day-weather-alert-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 14px;
}
.dwac-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}
.dwac-icon {
  font-size: 20px;
  line-height: 1;
}
.dwac-text strong {
  display: block;
  font-size: 12px;
  color: #0369a1;
}
.dwac-text p {
  font-size: 11.5px;
  color: #0c4a6e;
  margin: 2px 0 0;
  line-height: 1.35;
}
.dwac-action-btn {
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.dwac-action-btn:hover {
  background: #0369a1;
  transform: translateY(-1px);
}
:root[data-theme="dark"] .day-weather-alert-card {
  background: rgba(2, 132, 199, 0.12);
  border-color: rgba(2, 132, 199, 0.3);
}
:root[data-theme="dark"] .dwac-text strong {
  color: #7dd3fc;
}
:root[data-theme="dark"] .dwac-text p {
  color: #bae6fd;
}

/* ==================== 6. MODAL THß║║ INFOGRAPHIC CHIA Sß║║ ZALO ==================== */
.infographic-share-card {
  max-width: 580px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.m-head-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.m-head-icon {
  font-size: 20px;
}
.infographic-scroll-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #f1f5f9;
  border-radius: 12px;
}
:root[data-theme="dark"] .infographic-scroll-wrap {
  background: #0f172a;
}
.infographic-poster {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}
.ip-header {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #115e59 100%);
  color: #fff;
  padding: 24px 20px;
  text-align: center;
}
.ip-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: 20px;
}
.ip-title {
  font-size: 18px;
  font-weight: 800;
  margin: 10px 0 12px;
  color: #ffffff;
}
.ip-meta-strip {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  font-weight: 700;
  color: #ccfbf1;
}
.ip-highlight-box {
  padding: 14px 18px;
  background: #f8fafc;
  border-bottom: 1px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ip-hl-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ip-hl-icon {
  font-size: 18px;
}
.ip-hl-row strong {
  display: block;
  font-size: 12px;
  color: #1e293b;
}
.ip-hl-row small {
  display: block;
  font-size: 11px;
  color: #64748b;
}
.ip-days-list {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ip-day-block {
  border-left: 3px solid #0d9488;
  padding-left: 12px;
}
.ip-day-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 6px;
}
.ip-activities-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ip-act-item {
  font-size: 11.5px;
  display: flex;
  gap: 8px;
  line-height: 1.4;
  color: #334155;
}
.ip-act-time {
  font-weight: 700;
  color: #0d9488;
  width: 44px;
  flex-shrink: 0;
}
.ip-act-place {
  flex: 1;
}
.ip-footer {
  padding: 12px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  color: #94a3b8;
}
.ip-footer-left small {
  display: block;
  font-weight: 600;
}
.ip-watermark {
  font-weight: 900;
  color: #cbd5e1;
  letter-spacing: 0.1em;
}
.infographic-actions-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.infographic-actions-row button,
.infographic-actions-row a {
  flex: 1;
  text-align: center;
  justify-content: center;
}
.copied-success {
  background: #10b981 !important;
}
/* ==================== 7. INTRO SPLASH ANIMATION ==================== */
.intro-splash-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity 2.5s ease-in-out, visibility 2.5s;
}
.intro-splash-overlay.is-splitting {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

/* Kß╗╣ thuß║¡t 2 m├án h├¼nh ─æß╗â xß║╗ ─æ├┤i video */
.video-half {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: transform 2.5s cubic-bezier(0.77, 0, 0.175, 1);
}
.video-left {
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
}
.video-right {
  clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}

.intro-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cinematic-enhance {
  filter: contrast(1.15) saturate(1.2) brightness(1.05);
}

@media (max-width: 768px) {
  .intro-video {
    object-fit: contain;
  }
  .video-half {
    background: #000;
  }
}
.film-grain {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: overlay;
}

.is-splitting .video-left {
  transform: translateX(-50%);
}
.is-splitting .video-right {
  transform: translateX(50%);
}

.skip-intro-btn {
  position: absolute;
  bottom: 30px;
  right: 40px;
  z-index: 10;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}
.skip-intro-btn:hover {
  background: rgba(255,255,255,0.3);
  color: #fff;
}
.is-splitting .skip-intro-btn {
  opacity: 0;
}

/* ==================== PLANNER TRANSITION & BACKGROUND ==================== */
.planner-transition-overlay {
  position: fixed;
  inset: 0;
  background: url('/images/planner-bg.jpg') center/cover no-repeat;
  z-index: 999999;
}
.planner-flash-enter-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.planner-flash-leave-active {
  transition: opacity 0.8s ease;
}
.planner-flash-enter-from, .planner-flash-leave-to {
  opacity: 0;
}

/* ==================== MESH GRADIENT BACKGROUND ==================== */
.planner-tab-bg {
  position: relative;
  z-index: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24px;
  width: 100%;
  padding: 24px 20px 48px;
  /* Lß╗¢p l╞░ß╗¢i gradient: Xanh b├│ng ─æ├¬m, T├¡m than, Xanh ngß╗ìc sß║½m, ─Éß╗Å hß╗ông ho├áng h├┤n */
  background: linear-gradient(-45deg, #0f172a, #312e81, #0f766e, #9f1239);
  background-size: 400% 400%;
  animation: liquidGradient 15s ease infinite;
}

/* ==================== PLANNER HERO BANNER (Vß╗è TR├ì KHOANH ─Éß╗Ä) ==================== */
.planner-hero-banner {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  flex-shrink: 0;
  animation: fadeInBanner 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.planner-hero-banner:hover {
  transform: translateY(-4px) scale(1.003);
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.12);
}

.planner-hero-banner-img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.planner-hero-banner:hover .planner-hero-banner-img {
  transform: scale(1.03);
}

/* Gradient vignette overlay ph├¡a d╞░ß╗¢i */
.planner-hero-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.75) 0%,
    rgba(15, 23, 42, 0.25) 35%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 1;
}

/* Badge text g├│c d╞░ß╗¢i tr├íi */
.planner-hero-badge {
  position: absolute;
  bottom: 20px;
  left: 24px;
  z-index: 2;
  border-left: 3px solid rgba(20, 184, 166, 0.85);
  padding-left: 14px;
  animation: fadeInUp 1s 0.3s ease both;
}

.hero-badge-title {
  display: block;
  font-size: clamp(1.6rem, 3vw, 2.8rem);
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
  margin-bottom: 4px;
}

.hero-badge-sub {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

@media (max-width: 768px) {
  .planner-hero-banner {
    max-height: 220px;
    border-radius: 12px;
  }
  .planner-hero-badge {
    bottom: 14px;
    left: 16px;
  }
}

@keyframes fadeInBanner {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes liquidGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Glassmorphism cho Form th├┤ng tin */
.planner-glass-form {
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
  position: relative;
  z-index: 1;
}

/* Tß╗æi ╞░u chß╗» trong form mß╗¥ ─æß╗â kh├┤ng bß╗ï ch├¼m */
:root[data-theme="dark"] .planner-glass-form {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

/* ==================== REVEAL ON SCROLL ==================== */
.reveal-element {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
.reveal-element.is-revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ==================== ORIGIN MODE SWITCH ==================== */
.origin-mode-switch {
  transform: scale(0.85);
  transform-origin: center;
  margin-left: 6px;
  flex-shrink: 0;
}

.field-label-between {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* ==================== ORIGIN COMPACT PICKER ==================== */
.origin-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.origin-combo-input {
  width: 100%;
}

.origin-quick-picks {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.origin-quick-picks::-webkit-scrollbar {
  height: 3px;
}

.origin-quick-picks::-webkit-scrollbar-thumb {
  background: rgba(128,128,128,0.3);
  border-radius: 2px;
}

.origin-pick-btn {
  flex-shrink: 0;
  background: rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.origin-pick-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

.origin-pick-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* ABSOLUTE MOBILE OVERRIDES - MUST BE AT END OF FILE */
@media (max-width: 992px) {
  .app-main { padding: 12px 10px !important; min-width: 0 !important; overflow-x: hidden !important; }
  .tab-pane { min-width: 0 !important; }
  .planner-tab-bg { padding: 16px 12px 32px !important; width: 100% !important; box-sizing: border-box !important; }
  .planner-form-container { margin: 0 !important; padding: 16px !important; width: 100% !important; box-sizing: border-box !important; max-width: 100% !important; min-width: 0 !important; flex-shrink: 1 !important; }
  .app-form-grid { grid-template-columns: 1fr !important; }
  .app-field, .origin-select-wrapper { min-width: 0 !important; }
  .app-field.full-width, .bus-optimization-section { grid-column: span 1 !important; }
  .hotel-main-info { flex-direction: column !important; }
  .hotel-side { text-align: left !important; }
  .places-app-grid { grid-template-columns: 1fr !important; }
  .origin-quick-picks { flex-wrap: wrap !important; overflow-x: visible !important; }
}

@media (max-width: 768px) {
  .app-main { padding: 10px 6px !important; }
  .planner-tab-bg { padding: 12px 8px 24px !important; }
  .planner-form-container { padding: 12px !important; }
  .wizard-progress { padding: 8px 10px !important; margin-bottom: 16px !important; gap: 4px !important; }
  .step-indicator { font-size: 0.75rem !important; padding: 4px 8px !important; }
  .step-divider { margin: 0 2px !important; }
  .ai-hint-bubble { padding: 12px !important; gap: 10px !important; border-radius: 12px !important; flex-direction: column !important; align-items: center !important; text-align: center !important; }
  .ai-hint-robot { display: flex !important; justify-content: center !important; }
  .ai-hint-robot img { width: 36px !important; height: 36px !important; }
  .ai-hint-content p { font-size: 0.85rem !important; margin-bottom: 8px !important; }
  .ai-chip { font-size: 0.75rem !important; padding: 4px 10px !important; }
  .wizard-footer { flex-direction: column !important; gap: 12px !important; }
  .wizard-footer button { width: 100% !important; justify-content: center !important; }
  .origin-mode-switch button { padding: 4px 8px !important; font-size: 10px !important; }
  .route-overview-banner.compact { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
  .rob-mid-compact { width: 100% !important; margin: 8px 0 !important; }
  .dbc-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
  .transit-vehicles-grid { grid-template-columns: 1fr !important; }
  .budget-quick-tags .quick-tag-chip { font-size: 11px !important; padding: 6px 10px !important; }
  .act-meta-badges { gap: 3px !important; margin: 2px 0 !important; }
  .meta-tag-pill { padding: 1px 6px !important; font-size: 10px !important; line-height: 1.2 !important; height: auto !important; }
  .act-desc {
    display: -webkit-box !important;
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    font-size: 12.5px !important;
    margin: 2px 0 5px !important;
  }
  .act-signature-box, .act-cost-box { padding: 4px 8px !important; margin: 4px 0 !important; font-size: 11.5px !important; }
  .eta-pill { padding: 2px 6px !important; font-size: 10px !important; }
  .eta-metrics-row { gap: 4px !important; }
  .transit-badge { padding: 4px 8px !important; font-size: 10.5px !important; }

  /* Bß╗ò sung fix overflow nghi├¬m trß╗ìng tr├¬n Mobile cho Planner */
  .planner-form-container, .wizard-step-content, .bus-operators-box {
    max-width: 100vw !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }
  .planner-form-container * {
    box-sizing: border-box !important;
  }
  .wizard-progress { 
    flex-wrap: wrap !important; 
    justify-content: center !important; 
  }
  .bic-actions-row, .bic-price-line { 
    flex-direction: column !important; 
    align-items: stretch !important; 
    width: 100% !important; 
    gap: 8px !important; 
  }
  .bpl-right, .bpl-left { width: 100% !important; }
  .bpl-total-badge { white-space: normal !important; display: block !important; }
  .quick-city-selector { flex-wrap: wrap !important; gap: 6px !important; }
  .city-select-pill { flex: 1 1 30% !important; text-align: center !important; padding: 6px !important; white-space: normal !important; }
  .stepper-input { width: 100% !important; justify-content: space-between !important; }
  .bus-item-card, .tv-card { min-width: 0 !important; width: 100% !important; word-wrap: break-word !important; }
  .app-field label { white-space: normal !important; }
  .app-field .field-label-between { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
}

</style>
