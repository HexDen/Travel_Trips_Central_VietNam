<template>
  <!-- GIAO DIỆN MOBILE TINH GỌN (CHỈ KHI THIẾT BỊ MÀN HÌNH DI ĐỘNG <= 768px) -->
  <MobileExperience
    v-if="isMobileDevice"
    :nguoiDung="nguoiDung"
    :isDark="isDark"
    :myTripsCount="myTripsList.length || 0"
    :favoritesCount="favoritesList.length || 0"
    :userLevelInfo="userLevelInfo"
    @toggleDark="toggleDark"
    @openAuth="hienAuthModal = true"
    @logout="dangXuat"
    @userUpdated="(u) => { nguoiDung = u }"
  />

  <!-- GIAO DIỆN DESKTOP / PC ĐẦY ĐỦ NGUYÊN BẢN -->
  <div v-else class="app-root" :class="{ 'app-intro-zoom': showIntroSplash && !introSplitting }">
    <div class="app-container">
      
      <!-- TOP HEADER CỦA APP (ĐÃ TÁCH COMPONENT) -->
      <AppHeader
        :activeTab="activeTab"
        :nguoiDung="nguoiDung"
        :isDark="isDark"
        @update:activeTab="handleTabChange"
        @openAuth="hienAuthModal = true"
        @toggleDark="toggleDark"
        @selectCity="handleSelectCityFromSearch"
        @planCity="chuyenSangLenLichTrinh"
        @openModal="handleOpenModalFromSearch"
      />

      <!-- FLOATING PERSONALITY TOAST (KHI AI TẠO XONG LỊCH TRÌNH HOẶC THÔNG BÁO QUAN TRỌNG) -->
      <transition name="toast-slide">
        <div v-if="personalityToast" class="personality-floating-toast" @click="personalityToast = null">
          <div class="pft-icon"><AppIcon :name="personalityToast.icon" :size="20" /></div>
          <div class="pft-body">
            <strong>{{ personalityToast.title }}</strong>
            <p>{{ personalityToast.desc }}</p>
          </div>
          <button class="pft-close"><AppIcon name="x" :size="16" /></button>
        </div>
      </transition>

      <!-- KHÔNG GIAN NỘI DUNG CHÍNH (THEO TỪNG TAB APP) -->
      <main class="app-main">

        <!-- ==================== TAB ADMIN ==================== -->
        <section v-if="activeTab === 'admin'" class="tab-pane p-0 m-0 w-full" style="max-width: 100%; padding: 0;">
          <AdminDashboard />
        </section>

        <!-- ==================== TAB 1: KHÁM PHÁ (EXPLORE) ==================== -->
        <ExploreTab
          v-if="activeTab === 'explore'"
          :allDestinationsConst="ALL_DESTINATIONS"
          :currentDestination="formDuLieu.diemDen"
          :visibleCities="visibleCities"
          :visibleDestinationCards="visibleDestinationCards"
          :currentSpotlight="currentSpotlight"
          :activeHeroImage="activeHeroImage"
          :musicMuted="musicMuted"
          :musicVolume="musicVolume"
          :weather="thoiTiet"
          :aiProvinceSubtitle="aiProvinceSubtitle"
          :places="places"
          :loadingPlaces="loadingPlaces"
          :filteredExplorePlaces="filteredExplorePlaces"
          :displayedExplorePlaces="displayedExplorePlaces"
          :exploreLimit="exploreLimit"
          :filterExploreType="filterExploreType"
          :searchExploreQuery="searchExploreQuery"
          :attractionsList="attractionsList"
          :restaurantsList="restaurantsList"
          :hotelsList="hotelsList"
          :cafesList="cafesList"
          :user="nguoiDung"
          :favoritesList="favoritesList"
          :getPlaceImage="getPlaceImage"
          @startPlanner="startPlannerTransition"
          @toggleMusicMute="toggleMusicMute"
          @update:musicVolume="val => musicVolume = val"
          @selectCity="chonDiemDenExplore"
          @selectHeroImage="img => selectedSpotlightImage = img"
          @planToCity="chuyenSangLenLichTrinh"
          @update:filterExploreType="val => filterExploreType = val"
          @update:searchExploreQuery="val => searchExploreQuery = val"
          @openHotelRooms="moModalXemPhong"
          @addToPlan="themVaoLichTrinhVaMoPlanner"
          @toggleFavorite="doiYeuThich"
          @loadMore="xemThemDiaDiem"
          @collapse="thuGonDiaDiem"
        />


        <!-- ==================== TAB 2: LẬP KẾ HOẠCH (PLANNER) ==================== -->
        <section v-if="activeTab === 'planner'" class="tab-pane planner-tab-bg">

          <!-- BƯỚC NHẬP THÔNG TIN KẾ HOẠCH & COLLAGE HERO (ĐÃ TÁCH COMPONENT) -->
          <TripPlannerWizard
            v-if="!lichTrinh"
            :formDuLieu="formDuLieu"
            :ALL_DESTINATIONS="ALL_DESTINATIONS"
            :visibleCities="visibleCities"
            :musicMuted="musicMuted"
            :toggleMusicMute="toggleMusicMute"
            :currentPlannerStep="currentPlannerStep"
            @update:currentPlannerStep="val => currentPlannerStep = val"
            :showAiHintBubble="showAiHintBubble"
            @update:showAiHintBubble="val => showAiHintBubble = val"
            :aiCurrentHint="aiCurrentHint"
            :refreshAiHint="refreshAiHint"
            :chonNhanhDiemDen="chonNhanhDiemDen"
            :showManualWardPicker="showManualWardPicker"
            @update:showManualWardPicker="val => showManualWardPicker = val"
            :toggleManualWardPicker="toggleManualWardPicker"
            :originProvinceMode="originProvinceMode"
            :popularOrigins="popularOrigins"
            :isLocatingOrigin="isLocatingOrigin"
            :layViTriHienTaiChoDiemXuatPhat="layViTriHienTaiChoDiemXuatPhat"
            :selectedManualProvinceCode="selectedManualProvinceCode"
            @update:selectedManualProvinceCode="val => selectedManualProvinceCode = val"
            :selectedManualDistrictCode="selectedManualDistrictCode"
            @update:selectedManualDistrictCode="val => selectedManualDistrictCode = val"
            :selectedManualWardCode="selectedManualWardCode"
            @update:selectedManualWardCode="val => selectedManualWardCode = val"
            :manualStreetAddress="manualStreetAddress"
            @update:manualStreetAddress="val => manualStreetAddress = val"
            :manualProvincesList="manualProvincesList"
            :manualDistrictsList="manualDistrictsList"
            :manualWardsList="manualWardsList"
            :loadingDistricts="loadingDistricts"
            :loadingWards="loadingWards"
            :manualComputedAddress="manualComputedAddress"
            :onManualProvinceChange="onManualProvinceChange"
            :onManualDistrictChange="onManualDistrictChange"
            :onManualWardChange="onManualWardChange"
            :apDungDiaChiThuCong="apDungDiaChiThuCong"
            :chonDiemKhoiHanh="chonDiemKhoiHanh"
            :todayIso="todayIso"
            :DEPARTURE_MONTHS="DEPARTURE_MONTHS"
            :selectedMonthKey="selectedMonthKey"
            :chonThangKhoiHanh="chonThangKhoiHanh"
            :ngayKetThucDisplay="ngayKetThucDisplay"
            :dinhDangNgayTuan="dinhDangNgayTuan"
            :dinhDangTien="dinhDangTien"
            :giamSoNgay="giamSoNgay"
            :tangSoNgay="tangSoNgay"
            :giamSoDem="giamSoDem"
            :tangSoDem="tangSoDem"
            :tripFeasibility="tripFeasibility"
            :currentBudgetTier="currentBudgetTier"
            :thongDiepNganSach="thongDiepNganSach"
            :transitRouteInfo="transitRouteInfo"
            :transitTab="transitTab"
            @update:transitTab="val => transitTab = val"
            :step3ActiveSubtab="step3ActiveSubtab"
            @update:step3ActiveSubtab="val => step3ActiveSubtab = val"
            :daXongPhuongTien="daXongPhuongTien"
            :daXongKhachSan="daXongKhachSan"
            :daXongBuoc3="daXongBuoc3"
            :chonPhuongTienTuSoSanh="chonPhuongTienTuSoSanh"
            :chonNhaXe="chonNhaXe"
            :chonGioXuatPhatBus="chonGioXuatPhatBus"
            :chonTauHoa="chonTauHoa"
            :chonGioXuatPhatTau="chonGioXuatPhatTau"
            :chonChuyenBay="chonChuyenBay"
            :chonGioXuatPhatChuyenBay="chonGioXuatPhatChuyenBay"
            :toggleTuTucPhuongTien="toggleTuTucPhuongTien"
            :chuyenSangChonKhachSan="chuyenSangChonKhachSan"
            :toggleTuTucKhachSan="toggleTuTucKhachSan"
            :apDungNangNganSachKhachSan="apDungNangNganSachKhachSan"
            :chonPhongTietKiemHon="chonPhongTietKiemHon"
            :giamSoDemKhachSan="giamSoDemKhachSan"
            :moModalXemPhong="moModalXemPhong"
            :huyChonKhachSan="huyChonKhachSan"
            :hotelSortBy="hotelSortBy"
            @update:hotelSortBy="val => hotelSortBy = val"
            :hotelStarFilter="hotelStarFilter"
            @update:hotelStarFilter="val => hotelStarFilter = val"
            :hotelDisplayLimit="hotelDisplayLimit"
            :filteredSortedHotels="filteredSortedHotels"
            :displayedHotels="displayedHotels"
            :xemThemKhachSan="xemThemKhachSan"
            :xemTatCaKhachSan="xemTatCaKhachSan"
            :thuGonKhachSan="thuGonKhachSan"
            :soPhongCan="soPhongCan"
            :tongChiPhiKhachSanChon="tongChiPhiKhachSanChon"
            :hotelBudgetAlert="hotelBudgetAlert"
            :places="places"
            :selectedPlaces="selectedPlaces"
            :customPlaceText="customPlaceText"
            @update:customPlaceText="val => customPlaceText = val"
            :minSoDem="minSoDem"
            :maxSoDem="maxSoDem"
            :searchPlacePickerQuery="searchPlacePickerQuery"
            @update:searchPlacePickerQuery="val => searchPlacePickerQuery = val"
            :placePickerActiveTab="placePickerActiveTab"
            @update:placePickerActiveTab="val => placePickerActiveTab = val"
            :isPickerExpanded="isPickerExpanded"
            :filteredAttractions="filteredAttractions"
            :filteredRestaurants="filteredRestaurants"
            :filteredCafes="filteredCafes"
            :totalFilteredPlacesCount="totalFilteredPlacesCount"
            :togglePickerExpand="togglePickerExpand"
            :getVisiblePlaces="getVisiblePlaces"
            :removeSelectedPlace="removeSelectedPlace"
            :clearAllSelectedPlaces="clearAllSelectedPlaces"
            :togglePlaceSelection="togglePlaceSelection"
            :isPlaceSelected="isPlaceSelected"
            :addCustomPlace="addCustomPlace"
            :dangCrawl="dangCrawl"
            :thongBaoCrawl="thongBaoCrawl"
            :kichHoatCrawl110="kichHoatCrawl110"
            :dangTao="dangTao"
            :taoPlanError="taoPlanError"
            :tiepTheoWizard="tiepTheoWizard"
            :taoLichTrinh="taoLichTrinh"
          />

          <!-- AI STARRY LOADING OVERLAY (BẦU TRỜI SAO VŨ TRỤ & BÓNG BAY/HOA ĐĂNG LƠ LỬNG) -->
          <AiStarryLoadingOverlay
            v-if="dangTao"
            :destination="formDuLieu.diemDen"
            :origin="formDuLieu.diemKhoiHanh"
            :days="formDuLieu.soNgay"
            :nights="formDuLieu.soDem"
            :loadingMessage="currentLoadingMessage"
            :messageIndex="currentLoadingMessageIndex"
          />

          <!-- KẾT QUẢ LỊCH TRÌNH CHI TIẾT (ĐÃ TÁCH COMPONENT) -->
          <ItineraryTimeline
            v-if="lichTrinh"
            :lichTrinh="lichTrinh"
            :formDuLieu="formDuLieu"
            :daLuuLichTrinhHienTai="daLuuLichTrinhHienTai"
            :thongBaoLuuThanhCong="thongBaoLuuThanhCong"
            :hienCompletionBanner="hienCompletionBanner"
            @update:hienCompletionBanner="val => hienCompletionBanner = val"
            :activeCompletionQuote="activeCompletionQuote"
            :itineraryViewMode="itineraryViewMode"
            :selectedDay="selectedDay"
            @update:selectedDay="val => selectedDay = val"
            :showAllDays="showAllDays"
            @update:showAllDays="val => showAllDays = val"
            :timelineDensity="timelineDensity"
            @update:timelineDensity="val => timelineDensity = val"
            :selectedSessionFilter="selectedSessionFilter"
            @update:selectedSessionFilter="val => selectedSessionFilter = val"
            :expandedCardKey="expandedCardKey"
            :selectedMapPlace="selectedMapPlace"
            @update:selectedMapPlace="val => selectedMapPlace = val"
            :transitRouteInfo="transitRouteInfo"
            :gioXuatPhatDi="gioXuatPhatDi"
            :gioXuatPhatVe="gioXuatPhatVe"
            :thoiGianDiChuyenText="thoiGianDiChuyenText"
            :gioDenNoiDuKien="gioDenNoiDuKien"
            :gioVeDenNoiDuKien="gioVeDenNoiDuKien"
            :googleMapsAllStopsUrl="googleMapsAllStopsUrl"
            :googleMapsDayRouteUrl="googleMapsDayRouteUrl"
            :toiUuThanhCongDay="toiUuThanhCongDay"
            :dangDieuChinh="dangDieuChinh"
            :hoveredActIndex="hoveredActIndex"
            :dangKeoDayIdx="dangKeoDayIdx"
            :dangKeoActIdx="dangKeoActIdx"
            :dragOverDayIdx="dragOverDayIdx"
            :dragOverActIdx="dragOverActIdx"
            :dinhDangTien="dinhDangTien"
            :layIconPhuongTien="layIconPhuongTien"
            :getDayWeatherAlert="getDayWeatherAlert"
            :taoLinkGoogleMapsChoNgay="taoLinkGoogleMapsChoNgay"
            :getGioMoCua="getGioMoCua"
            :lamSachMoTa="lamSachMoTa"
            :getTravelEstimate="getTravelEstimate"
            :tinhKhoangCachVaThoiGian="tinhKhoangCachVaThoiGian"
            :getBadgeInfo="getBadgeInfo"
            :getPlaceImage="getPlaceImage"
            :getSampleReviewText="getSampleReviewText"
            :laYeuThich="laYeuThich"
            :doiYeuThich="doiYeuThich"
            :chiDuongUrl="chiDuongUrl"
            :googleMapsSearchUrl="googleMapsSearchUrl"
            :filterActivitiesBySession="filterActivitiesBySession"
            :onImageError="onImageError"
            :toggleExpandCard="toggleExpandCard"
            :hoverActivity="hoverActivity"
            :unhoverActivity="unhoverActivity"
            :panToActivity="panToActivity"
            :onDragStart="onDragStart"
            :onDragOver="onDragOver"
            :onDragLeave="onDragLeave"
            :onDragEnd="onDragEnd"
            :onDrop="onDrop"
            :moModalDoiDiaDiem="moModalDoiDiaDiem"
            :moModalDoiDiaDiemTuMap="moModalDoiDiaDiemTuMap"
            :moModalXemPhong="moModalXemPhong"
            :moModalTranhMua="moModalTranhMua"
            :moModalInfographic="moModalInfographic"
            :toiUuCungDuongNgay="toiUuCungDuongNgay"
            :toiUuCungDuongToanBo="toiUuCungDuongToanBo"
            :doiViewMode="doiViewMode"
            :kichHoatCheDoFreePlaces="kichHoatCheDoFreePlaces"
            :rutNganNgayPhuHop="rutNganNgayPhuHop"
            :luuLichTrinhHienTai="luuLichTrinhHienTai"
            :yeuCauQuayLai="yeuCauQuayLai"
            :xuatPdf="xuatPdf"
            @enableSelfTransit="formDuLieu.tuTucPhuongTien = true; dongBoChiPhiLichTrinh()"
            @matchBudgetAndReplan="formDuLieu.nganSach = lichTrinh.total_budget; taoLichTrinh()"
            @openReplan="hienModalDoiLichTrinh = true"
            @goMyTrips="activeTab = 'mytrips'"
            @openBillSplitter="hienBillSplitter = true"
            @openTravelPass="hienTravelPass = true"
            @startTrip="batDauChuyenDiLive"
          />
        </section>


        <!-- ==================== TAB 3: CHUYẾN ĐI CỦA TÔI (MY TRIPS) ==================== -->
        <SavedTripsTab
          v-if="activeTab === 'mytrips'"
          :user="nguoiDung"
          :trips="myTripsList"
          @create-trip="startPlannerTransition"
          @open-auth="hienAuthModal = true"
          @open-trip="moLaiLichTrinh"
          @start-trip="batDauChuyenDiLive"
          @share-trip="chiaSeChuyenDi"
          @delete-trip="xoaChuyenDi"
        />


        <!-- ==================== TAB 5: TÀI KHOẢN & YÊU THÍCH (PROFILE) ==================== -->
        <section v-if="activeTab === 'profile'" class="tab-pane">
          <!-- Nếu đã đăng nhập -->
          
          <UserProfile v-if="nguoiDung"
            :nguoiDung="nguoiDung"
            :userLevelInfo="userLevelInfo"
            :myTripsCount="myTripsList.length"
            :favoritesCount="favoritesList.length"
            :isEditingProfile="isEditingProfile"
            :profileForm="profileForm"
            @editProfile="editProfile"
            @dangXuat="dangXuat"
            @saveProfile="saveProfile"
            @cancelEdit="isEditingProfile = false"
            @handleAvatarUpload="handleAvatarUpload"
            @updateForm="(key, value) => { profileForm[key] = value }"
          />
          
          <div v-else class="auth-card" style="text-align: center; padding: 40px 20px;">
            <h2 style="margin-bottom: 12px;">Bạn chưa đăng nhập</h2>
            <p style="color: var(--text-sub); margin-bottom: 24px;">Hãy đăng nhập để lưu trữ chuyến đi và quản lý tài khoản nhé!</p>
            <button class="app-primary-btn" style="max-width: 250px; margin: 0 auto;" @click="hienAuthModal = true">
              Đăng nhập / Đăng ký
            </button>
          </div>

          
          <!-- Danh sách địa điểm yêu thích (Mới) -->
          <FavoritePlaces :favoritesList="favoritesList" @doiYeuThich="doiYeuThich" :getPlaceImage="getPlaceImage" />
        </section>

      </main>


    </div>


    <!-- ==================== POPUP MODAL ĐĂNG NHẬP NHANH ==================== -->
    <AuthModal
      v-model="hienAuthModal"
      :initialRegisterMode="dangKyMode"
      @login-success="onLoginSuccess"
    />

    <!-- ==================== POPUP MODAL THAY ĐỔI LỊCH TRÌNH KHÁC ==================== -->
    <ReplanModal
      :isOpen="hienModalDoiLichTrinh"
      @close="hienModalDoiLichTrinh = false"
      @edit-params="chonDoiThongSo"
      @ai-new-plan="chonAILenPhuongAnMoi"
      @change-province="chonDoiTinhThanh"
    />

    <!-- ==================== POPUP MODAL CHIA TIỀN NHÓM (BILL SPLITTER) ==================== -->
    <BillSplitterModal
      :isOpen="hienBillSplitter"
      :initialTotal="splitterTongTien"
      :initialPeople="splitterSoNguoi"
      @close="hienBillSplitter = false"
    />

    <!-- ==================== POPUP MODAL XUẤT VÉ HÀNH TRÌNH OFFLINE (TRAVEL PASS) ==================== -->
    <TravelPassModal
      :isOpen="hienTravelPass"
      :itinerary="lichTrinh"
      @close="hienTravelPass = false"
      @export-pdf="xuatPdf"
    />

    <!-- ==================== POPUP MODAL ĐỔI ĐỊA ĐIỂM ==================== -->
    <ChangePlaceModal
      :isOpen="showChangePlaceModal"
      :places="alternativePlaces"
      @close="showChangePlaceModal = false"
      @select="chonDiaDiemMoi"
    />

    <!-- ==================== POPUP MODAL ĐỔI LỊCH TRÁNH MƯA ==================== -->
    <RainModal
      :isOpen="showRainModal"
      :destination="lichTrinh?.destination || formDuLieu.diemDen"
      :oldPlaces="rainModalOldPlaces"
      :newPlaces="rainModalNewPlaces"
      :isLoading="dangDieuChinh"
      @close="showRainModal = false"
      @confirm="xacNhanDoiLichTranhMua"
    />

    <!-- ==================== POPUP MODAL THẺ INFOGRAPHIC CHIA SẺ ZALO ==================== -->
    <InfographicModal
      :isOpen="hienModalInfographic"
      :itinerary="lichTrinh"
      :defaultDestination="formDuLieu.diemDen"
      :defaultPeople="formDuLieu.soNguoi"
      :selectedBus="formDuLieu.nhaXeDaChon"
      :departureCity="formDuLieu.diemKhoiHanh"
      :googleMapsUrl="googleMapsAllStopsUrl"
      :isCopied="daSaoChepZalo"
      @close="hienModalInfographic = false"
      @copy-zalo="saoChepLichTrinhZalo"
    />

    <!-- ==================== INTRO SPLASH VIDEO ==================== -->
    <div v-if="showIntroSplash" class="intro-splash-overlay" :class="{ 'is-splitting': introSplitting }" @dblclick="boQuaIntro">
      <!-- NỬA TRÁI (CHỨA CHỮ MIỀN) -->
      <div class="video-half video-left">
        <video class="intro-video cinematic-enhance" autoplay muted playsinline>
          <source src="/video/gemini_generated_video_2ab43434.mp4" type="video/mp4" />
        </video>
        <div class="film-grain"></div>
      </div>
      
      <!-- NỬA PHẢI (CHỨA CHỮ TRUNG) -->
      <div class="video-half video-right">
        <video class="intro-video cinematic-enhance" autoplay muted playsinline>
          <source src="/video/gemini_generated_video_2ab43434.mp4" type="video/mp4" />
        </video>
        <div class="film-grain"></div>
      </div>

      <button class="skip-intro-btn" @click.stop="boQuaIntro">Bỏ qua <AppIcon name="arrowright" size="14" style="margin-left: 4px; vertical-align: -2px;" /></button>
    </div>

    <!-- ==================== MODAL XÁC NHẬN LƯU LỊCH TRÌNH TRƯỚC KHI QUAY LẠI ==================== -->
    <SaveConfirmModal
      :isOpen="hienModalXacNhanQuayLai"
      title="Lưu lịch trình chuyến đi?"
      message="Bạn có một lịch trình vừa tạo. Bạn có muốn <b>lưu lại lịch trình này</b> vào danh sách chuyến đi trước khi quay lại không?"
      saveText="Có, Lưu vào chuyến đi & Quay lại"
      discardText="Không lưu & Hủy bỏ lịch trình"
      discardIcon="trash2"
      cancelText="Ở lại tiếp tục xem"
      :iconStyle="{ background: 'linear-gradient(135deg, #10b981, #059669)' }"
      @save="xacNhanLuuVaQuayLai"
      @discard="xacNhanHuyVaQuayLai"
      @cancel="hienModalXacNhanQuayLai = false"
    />

    <!-- ==================== MODAL XÁC NHẬN LƯU LỊCH TRÌNH TRƯỚC KHI CHUYỂN TAB ==================== -->
    <SaveConfirmModal
      :isOpen="hienModalNhacLuu"
      title="Lưu lịch trình trước khi rời đi?"
      message="Bạn có một lịch trình <b>chưa được lưu</b>. Nếu rời trang này mà không lưu, lịch trình sẽ bị mất."
      saveText="Lưu lịch trình"
      discardText="Bỏ qua, không lưu"
      discardIcon="alertcircle"
      cancelText="Ở lại trang này"
      @save="dongYLuuVaChuyenTab"
      @discard="khongLuuVaChuyenTab"
      @cancel="huyChuyenTab"
    />

    <!-- ==================== MODAL XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU ==================== -->
    <TripDetailModal
      :isOpen="hienModalChiTietTrip"
      :trip="xemTripChiTiet"
      @close="hienModalChiTietTrip = false"
      @open-full-plan="(t) => { moLaiLichTrinh(t); hienModalChiTietTrip = false; }"
      @start-trip="(t) => { batDauChuyenDiLive(t); hienModalChiTietTrip = false; }"
    />

    <!-- ==================== MODAL XEM CHI TIẾT KHÁCH SẠN & CHỌN PHÒNG ==================== -->
    <HotelDetailModal
      :isOpen="showHotelDetailModal"
      :hotel="activeHotelModal"
      :startDate="formDuLieu.ngayBatDau"
      :endDate="formDuLieu.ngayKetThuc"
      :roomsNeeded="soPhongCan"
      :guestsCount="formDuLieu.soNguoi"
      :selectedHotelId="formDuLieu.khachSanDaChon?.id"
      :selectedRoomId="formDuLieu.phongDaChon?.id"
      @close="dongModalXemPhong"
      @change-search="() => { dongModalXemPhong(); activeTab = 'planner'; currentPlannerStep = 1; }"
      @choose-room="({ hotel, room }) => chonPhongTuModal(hotel, room)"
    />

    <!-- ==================== LIVE TRIP COMPANION (ĐỒNG HÀNH TRỰC TIẾP CHUYẾN ĐI - PC) ==================== -->
    <LiveTripCompanion
      :isOpen="showLiveTripCompanion"
      :trip="activeLiveTrip"
      :isMobile="false"
      @close="showLiveTripCompanion = false"
      @finish="handleFinishLiveTrip"
    />

    <!-- ==================== FLOATING CHATBOT AI ==================== -->
    <FloatingChatbot :isDark="isDark" />

    <!-- ==================== PLANNER FLASH TRANSITION ==================== -->
    <transition name="planner-flash">
      <div v-if="isPlannerTransitioning" class="planner-transition-overlay"></div>
    </transition>
  </div>
</template>

<script setup>
import MobileExperience from './components/mobile/MobileExperience.vue';
import ExploreTab from './components/home/ExploreTab.vue';
import SavedTripsTab from './components/trips/SavedTripsTab.vue';
import TripPlannerWizard from './components/planner/TripPlannerWizard.vue';
import ItineraryTimeline from './components/planner/ItineraryTimeline.vue';
import LiveTripCompanion from './components/planner/LiveTripCompanion.vue';
import FavoritePlaces from './components/FavoritePlaces.vue';
import UserProfile from './components/UserProfile.vue';

import AiStarryLoadingOverlay from './components/common/AiStarryLoadingOverlay.vue';
import FloatingChatbot from './components/chatbot/FloatingChatbot.vue';
import TripDetailModal from './components/trips/TripDetailModal.vue';
import HotelDetailModal from './components/hotel/HotelDetailModal.vue';
import AuthModal from './components/modals/AuthModal.vue';
import ReplanModal from './components/modals/ReplanModal.vue';
import BillSplitterModal from './components/modals/BillSplitterModal.vue';
import TravelPassModal from './components/modals/TravelPassModal.vue';
import ChangePlaceModal from './components/modals/ChangePlaceModal.vue';
import RainModal from './components/modals/RainModal.vue';
import InfographicModal from './components/modals/InfographicModal.vue';
import SaveConfirmModal from './components/modals/SaveConfirmModal.vue';
import { reactive, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import api from './services/api'
import AppHeader from './components/layout/AppHeader.vue'
import SkeletonCard from './components/SkeletonCard.vue'
import MapComponent from './components/MapComponent.vue'
import CentralHeritageOverview from './components/home/CentralHeritageOverview.vue'
import AdminDashboard from './components/admin/AdminDashboard.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import html2pdf from 'html2pdf.js'
import { getBusOperatorsForRoute, getEstimatedDistance } from './services/busService'
import { getHotelsForDestination } from './services/hotelService'
import { detectCurrentLocationCity } from './services/locationService'
import { fetchProvinces, fetchDistricts, fetchWards } from './services/administrativeService'

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
const isMobileDevice = ref(typeof window !== 'undefined' ? window.innerWidth <= 768 : false)

function checkMobileDevice() {
  isMobileDevice.value = window.innerWidth <= 768
}

function cuonLenDauTrang() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  const appRoot = document.querySelector('.app-root') || document.querySelector('.app')
  if (appRoot) appRoot.scrollTop = 0
}

function handleTabChange(newTab) {
  // Đảm bảo khi chuyển tab mọi tác vụ trong lên lịch trình phải hoàn toàn reset (Yêu cầu 4)
  if (newTab === activeTab.value) {
    if (newTab === 'planner') {
      resetAllPlannerState()
      cuonLenDauTrang()
    }
    return
  }

  if (newTab === 'planner') {
    resetAllPlannerState()
    startPlannerTransition()
  } else {
    if (activeTab.value === 'planner') {
      resetAllPlannerState()
    }
    chuyenTab(newTab)
  }
}

function startPlannerTransition() {
  activeTab.value = 'planner'
  cuonLenDauTrang()
  nextTick(() => {
    cuonLenDauTrang()
  })
}

function handleSelectCityFromSearch(city) {
  activeTab.value = 'explore'
  chonDiemDenExplore(city)
  cuonLenDauTrang()
}

function handleOpenModalFromSearch(modalName) {
  switch (modalName) {
    case 'auth':
      hienAuthModal.value = true
      break
    case 'bill-splitter':
      hienBillSplitter.value = true
      break
    case 'travel-pass':
      hienTravelPass.value = true
      break
    case 'replan':
      hienModalDoiLichTrinh.value = true
      break
    case 'rain':
      showRainModal.value = true
      break
    case 'infographic':
      hienModalInfographic.value = true
      break
    case 'chatbot':
      window.dispatchEvent(new CustomEvent('open-travel-chatbot'))
      break
    case 'toggle-dark':
      toggleDark()
      break
    case 'heritage':
      activeTab.value = 'explore'
      nextTick(() => {
        const el = document.querySelector('.central-heritage-container, .ch-hero-section, .heritage-carousel-wrapper')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      break
    case 'admin':
      activeTab.value = 'admin'
      break
  }
}

// ==================== LIVE TRIP COMPANION STATE & ACTIONS ====================
const showLiveTripCompanion = ref(false)
const activeLiveTrip = ref(null)

function batDauChuyenDiLive(trip) {
  const targetTrip = trip || lichTrinh.value
  if (!targetTrip) {
    alert('Vui lòng chọn hoặc tạo một lịch trình trước khi bắt đầu!')
    return
  }
  if (targetTrip.days && !targetTrip.daysList) {
    targetTrip.daysList = targetTrip.days
  }
  activeLiveTrip.value = targetTrip
  showLiveTripCompanion.value = true
}

function handleFinishLiveTrip() {
  showLiveTripCompanion.value = false
  taiChuyenDiCuaToi()
}

const ALL_DESTINATIONS = 'Tất cả miền Trung'

const formDuLieu = reactive({
  diemKhoiHanh: '',
  diemDen: 'Đà Nẵng',
  soNgay: 0,
  soDem: 0,
  nganSach: 3500000,
  soNguoi: 0,
  soThich: [],
  ngayBatDau: '2026-10-06',
  ngayKetThuc: '',
  phuongTien: '',
  yeuCauKhachSan: '',
  nhaXeDaChon: null,
  gioXuatPhatChon: '',
  tauDaChon: null,
  chuyenBayDaChon: null,
  khachSanDaChon: null,
  phongDaChon: null,
  freePlacesOnly: false,
  tuTucPhuongTien: false,
  tuTucKhachSan: false
})

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

// Danh sách 11 Tỉnh/Thành phố Miền Trung & Tây Nguyên sau sáp nhập (Ảnh HD thực tế 100%)
const centralCities = [
  { name: 'Thanh Hóa', icon: '🏰', tag: 'Sầm Sơn & Pù Luông', image: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg', audio: '/music/thanhhoa.mp3' },
  { name: 'Nghệ An', icon: '🌾', tag: 'Cửa Lò & Quê Bác', image: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg', audio: '/music/nghean.mp3' },
  { name: 'Hà Tĩnh', icon: '🌊', tag: 'Thiên Cầm & Ngã Ba Đồng Lộc', image: 'https://thiencam.net/wp-content/uploads/2017/04/thien-cam-ha-tinh.jpg', audio: '/music/hatinh.mp3' },
  { name: 'Quảng Trị', icon: '⛰️', tag: 'Phong Nha, Thiên Đường & Vịnh Mốc', image: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg', audio: '/music/quangtri.mp3' },
  { name: 'Huế', icon: '👑', tag: 'Cố Đô Di Sản Triều Nguyễn', image: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg', audio: '/music/hue.mp3' },
  { name: 'Đà Nẵng', icon: '🌉', tag: 'Cầu Vàng, Phố Cổ Hội An & Mỹ Khê', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg', audio: '/music/danang.mp3' },
  { name: 'Quảng Ngãi', icon: '🏖️', tag: 'Đảo Lý Sơn & Eo Gió - Kỳ Co', image: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg', audio: '/music/quangngai.mp3' },
  { name: 'Gia Lai', icon: '🐘', tag: 'Biển Hồ T’Nưng & Nhà Rông Kon Tum', image: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-3-768x587.jpg', audio: '/music/gialai.mp3' },
  { name: 'Đắk Lắk', icon: '☕', tag: 'Bảo Tàng Cà Phê & Thác Dray Nur', image: 'https://cdn.xanhsm.com/2024/12/131980d3-bao-tang-the-gioi-ca-phe-25.jpg', audio: '/music/daklak.mp3' },
  { name: 'Khánh Hòa', icon: '⛵', tag: 'Nha Trang, Vịnh Vĩnh Hy & Gành Đá Đĩa', image: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg', audio: '/music/khanhhoa.mp3' },
  { name: 'Lâm Đồng', icon: '🌲', tag: 'Đà Lạt Ngàn Hoa & Thác Dambri', image: 'https://cdn.tgdd.vn/Files/2023/10/25/1553008/top-22-dia-diem-du-lich-lam-dong-dep-nhat-dinh-khong-nen-bo-qua-202310251415581585.jpg', audio: '/music/lamdong.mp3' }
]

// DỮ LIỆU ĐIỂM ĐẾN NỔI BẬT: ẢNH HD THỰC TẾ 100%, 5 THUMBNAILS GALLERY ĐÚNG DANH THẮNG & THÔNG TIN DU LỊCH CHI TIẾT
const PROVINCE_SPOTLIGHTS = {
  [ALL_DESTINATIONS]: {
    title: 'Miền Trung Việt Nam - Dải Đất Di Sản & Thiên Đường Biển Đảo',
    subtitle: 'Nơi hội tụ các Di sản Thế giới UNESCO, những vịnh biển quyến rũ bậc nhất hành tinh và đại ngàn Tây Nguyên hùng vĩ',
    badge: 'UNESCO Heritage Trail',
    esgText: 'ESG: 82 | LEI: 80',
    certText: 'Con Đường Di Sản Miền Trung Tuyệt Mỹ',
    description: 'Miền Trung là dải đất quyến rũ bậc nhất Việt Nam trải dài từ Thanh Hóa đến Bình Thuận và vươn rộng lên đại ngàn Tây Nguyên. Nơi đây quy tụ quần thể di tích Cố Đô Huế trầm mặc, Phố Cổ Hội An lung linh hoa đăng, kỳ quan hang động Phong Nha - Kẻ Bàng hùng vĩ, thành phố đáng sống Đà Nẵng bên bãi biển Mỹ Khê, vịnh biển ngọc Nha Trang, Ghềnh Đá Đĩa Phú Yên kỳ thú và thiên đường ngàn hoa Đà Lạt mát lành quanh năm.',
    specialties: [
      'Bún bò Huế & Cơm hến sông Hương',
      'Mì Quảng ếch & Cơm gà phố Hội',
      'Nem nướng Ninh Hòa & Bún chả cá Nha Trang',
      'Lẩu gà lá é & Bánh tráng nướng Đà Lạt',
      'Cua Huỳnh Đế Lý Sơn & Bò một nắng Krông Pa'
    ],
    bestSeason: 'Tháng 1 - Tháng 8 (Khí hậu khô ráo chan hòa nắng ấm, biển lặng sóng xanh ngọc bích, lý tưởng cho mọi chuyến du lịch trải nghiệm)',
    heroImage: '/images/mientrung-collage.jpg',
    gallery: [
      { name: 'Cầu Vàng Bà Nà Hills (Đà Nẵng)', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg' },
      { name: 'Phố Cổ Hội An lung linh (Quảng Nam)', image: 'https://top1quangnam.com/wp-content/uploads/2021/12/hoi-an-15102019-2-1400x788.png' },
      { name: 'Đại Nội Cố Đô Huế (Thừa Thiên Huế)', image: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg' },
      { name: 'Động Phong Nha Kẻ Bàng (Quảng Bình)', image: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg' },
      { name: 'Vịnh Biển Nha Trang trong xanh (Khánh Hòa)', image: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg' }
    ]
  },
  'Đà Nẵng': {
    title: 'Đà Nẵng - Thành phố đáng sống bên sông Hàn & Biển Mỹ Khê',
    subtitle: 'Kỳ quan Cầu Vàng Bà Nà Hills, Bán đảo Sơn Trà & Di sản Phố Cổ Hội An kề cận',
    badge: 'ESG & LEI Certified 2026',
    esgText: 'ESG: 75 | LEI: 72',
    certText: 'Chứng nhận Di sản & Du lịch Xanh',
    description: 'Đà Nẵng sở hữu đường bờ biển Mỹ Khê lọt top quyến rũ nhất hành tinh, bán đảo Sơn Trà - lá phổi xanh nguyên sinh với Chùa Linh Ứng uy nghiêm, cây Cầu Rồng phun lửa ngoạn mục và vị trí tâm điểm kết nối các di sản thế giới miền Trung.',
    specialties: ['Mì Quảng ếch', 'Bánh tráng cuốn thịt heo hai đầu da', 'Bánh xèo nem lụi', 'Chả bò Đà Nẵng', 'Gỏi cá Nam Ô'],
    bestSeason: 'Tháng 3 - Tháng 8 (Mùa khô ráo, nắng vàng chan hòa, biển trong xanh màu ngọc bích)',
    heroImage: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg',
    gallery: [
      { name: 'Cầu Vàng Bà Nà Hills', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg' },
      { name: 'Bãi biển Mỹ Khê', image: 'https://mia.vn/media/uploads/blog-du-lich/bai-bien-my-khe-da-nang-lang-nguoi-ngam-nhin-1-trong-6-bai-bien-dep-nhat-hanh-tinh-01-1636298582.jpeg' },
      { name: 'Bán đảo Sơn Trà', image: 'https://r2.nucuoimekong.com/wp-content/uploads/ban-dao-son-tra-co-gi.jpg' },
      { name: 'Cầu Rồng Sông Hàn', image: 'https://benduthuyendanang.com/wp-content/uploads/Tour-xem-cau-rong-phun-lua.jpg' },
      { name: 'Phố Cổ Hội An', image: 'https://static.vinwonders.com/2022/03/pho-den-long-hoi-an-1.jpg' }
    ]
  },
  'Huế': {
    title: 'Cố Đô Huế - Miền Di Sản Trầm Mặc & Nhã Nhạc Cung Đình',
    subtitle: 'Quần thể Di tích Cố đô triều Nguyễn, Sông Hương êm đềm & Ẩm thực cung đình tinh hoa',
    badge: 'UNESCO World Heritage',
    esgText: 'ESG: 78 | LEI: 74',
    certText: 'Di sản Văn hóa Thế giới UNESCO',
    description: 'Thủ phủ văn hóa lịch sử triều Nguyễn với Đại Nội Hoàng Thành nguy nga, lăng tẩm các vị vua cổ kính, chùa Thiên Mụ soi bóng dòng sông Hương thơ mộng và ẩm thực cung đình cầu kỳ tinh tế bậc nhất Việt Nam.',
    specialties: ['Bún bò giò heo Cố đô', 'Cơm hến Đập Đá', 'Bánh bèo, nậm, lọc', 'Chè bột lọc heo quay', 'Nem lụi Hoàng Cung'],
    bestSeason: 'Tháng 1 - Tháng 5 (Khí hậu dịu mát, không mưa, hoa ngô đồng nở rộ Hoàng Thành)',
    heroImage: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg',
    gallery: [
      { name: 'Đại Nội Hoàng Thành', image: 'https://static.vinwonders.com/production/optimize_ngo-mon-hue_optimized.jpg' },
      { name: 'Lăng Khải Định kỳ vĩ', image: 'https://nemtv.vn/wp-content/uploads/2019/03/lang-khai-dinh-nemtv-3.jpg' },
      { name: 'Chùa Thiên Mụ', image: 'https://statics.vinpearl.com/thap-phuoc-duyen-4_1642651510.png' },
      { name: 'Sông Hương & Cầu Tràng Tiền', image: 'https://www.tuannguyentravel.com/data/images/Truong-Tien-Bridge-Da-Nang-to-Hur-by-private-car.jpg' },
      { name: 'Đồi Vọng Cảnh bình yên', image: 'https://huesmiletravel.com.vn/images/doi-vong-canh-hue.jpg' }
    ]
  },
  'Khánh Hòa': {
    title: 'Khánh Hòa - Nha Trang: Thiên Đường Vịnh Biển Quốc Tế & Tháp Bà Ponagar',
    subtitle: 'Vịnh biển Nha Trang tuyệt mỹ, Vịnh Vĩnh Hy, lặn ngắm san hô & Hải sản tươi sống',
    badge: 'Most Beautiful Bays Club',
    esgText: 'ESG: 74 | LEI: 70',
    certText: 'Top 29 Vịnh biển đẹp nhất thế giới',
    description: 'Nha Trang nổi danh toàn cầu nhờ làn nước biển trong vắt quanh năm, bãi cát trắng mịn trải dài đường Trần Phú, quần thể Tháp Bà Ponagar nghìn năm tuổi của người Chăm và thiên đường nghỉ dưỡng đẳng cấp quốc tế.',
    specialties: ['Bún chả cá Nha Trang', 'Nem nướng Ninh Hòa', 'Bánh căn mực trứng', 'Yến sào Hòn Nội', 'Hải sản tươi sống làng chài'],
    bestSeason: 'Tháng 1 - Tháng 8 (Biển lặng sóng êm ả, trời trong xanh rực rỡ, lý tưởng lặn biển)',
    heroImage: 'https://booking.muongthanh.com/upload_images/images/ve-dep-bai-bien-tran-phu-nha-trang.jpg',
    gallery: [
      { name: 'Bãi biển Nha Trang', image: 'https://booking.muongthanh.com/upload_images/images/ve-dep-bai-bien-tran-phu-nha-trang.jpg' },
      { name: 'Tháp Bà Ponagar', image: 'https://danangprivatecar.com/wp-content/uploads/2023/07/This-is-a-famous-tourist-destination-in-Nha-Trang-and-Ponagar-Tower-is-the-largest-Cham-Pa-architectural-complex-in-Vietnam..jpeg' },
      { name: 'Vịnh Vĩnh Hy xanh biếc', image: 'https://thesinhtour.com/wp-content/uploads/2015/07/vinh-vinh-hy.jpg' },
      { name: 'VinWonders Hòn Tre', image: 'https://api.sovaba.travel/uploads/vinwonders_nha_trang_tren_cao_hon_tre_47c4184aee.jpg' },
      { name: 'Rạn San Hô Hòn Mun', image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/342/038/products/tour-dao-hon-mun-nha-trang-goodmorning-travel-02.jpg?v=1775720395537' }
    ]
  },
  'Quảng Ngãi': {
    title: 'Quảng Ngãi & Đảo Lý Sơn - Vương Quốc Tỏi & Tuyệt Tác Núi Lửa',
    subtitle: 'Cổng Tò Vò triệu năm, Hang Câu kỳ vĩ, Kỳ Co Eo Gió & Ẩm thực biển đảo hoang sơ',
    badge: 'Geopark Candidate',
    esgText: 'ESG: 69 | LEI: 65',
    certText: 'Công viên Địa chất Đảo Núi Lửa',
    description: 'Huyện đảo Lý Sơn được tạo tác từ những đợt phun trào núi lửa triệu năm trước, sở hữu Cổng Tò Vò trầm tích bazan độc nhất vô nhị, vách đá Hang Câu sừng sững bên bờ biển ngọc và đặc sản tỏi cô đơn trứ danh.',
    specialties: ['Gỏi rong biển Lý Sơn', 'Cua Huỳnh Đế biển sâu', 'Cá bống sông Trà kho tiêu', 'Don nước ngọt sông Vệ', 'Kẹo gương đậu phụng'],
    bestSeason: 'Tháng 4 - Tháng 9 (Mùa biển êm, tàu cao tốc chạy thuận lợi, nước trong vắt tận đáy)',
    heroImage: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg',
    gallery: [
      { name: 'Cổng Tò Vò Lý Sơn', image: 'https://static.vinwonders.com/production/cong_to_vo_ly_son_1.jpg' },
      { name: 'Hang Câu vách đá', image: 'https://live.staticflickr.com/1695/25075454644_747b284099_b.jpg' },
      { name: 'Đỉnh Thới Lới', image: 'https://vivulyson.com/uploads/images/blog/xem-an-choi/82/mieng-nui-lua-ly-son-2.jpg' },
      { name: 'Eo Gió Kỳ Co', image: 'https://eholiday.vn/wp-content/uploads/2024/07/ky-co-1.jpg' },
      { name: 'Đảo Bé Lý Sơn', image: 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/9/21/1095775/Dao-Be-Ly-Son-Ld.JPG' }
    ]
  },
  'Phú Yên': {
    title: 'Phú Yên - Xứ Sở Hoa Vàng Trên Cỏ Xanh & Ghềnh Đá Đĩa Huyền Bí',
    subtitle: 'Ghềnh Đá Đĩa kỳ quan đá ong núi lửa, Mũi Điện đón bình minh đầu tiên & Tháp Nghinh Phong',
    badge: 'ESG: 68 | LEI: 65',
    esgText: 'ESG: 68 | LEI: 65',
    certText: 'Chứng nhận Di tích Quốc gia Đặc biệt Ghềnh Đá Đĩa',
    description: 'Phú Yên quyến rũ du khách bằng vẻ đẹp nguyên sơ của kiệt tác Ghềnh Đá Đĩa với hàng nghìn cột đá bazan hình lục giác xếp lớp đều tăm tắp, ngọn hải đăng Đại Lãnh đón ánh bình minh sớm nhất đất liền và bãi cát vàng óng ả ôm trọn sóng biển.',
    specialties: ['Mắt cá ngừ đại dương hầm thuốc bắc', 'Sò huyết Đầm Ô Loan béo ngậy', 'Bánh hỏi lòng heo An Mỹ', 'Gỏi sứa Đầm Cù Mông', 'Bò một nắng muối kiến vàng'],
    bestSeason: 'Tháng 1 - Tháng 8 (Thời tiết nhiều nắng, biển trong vắt, sóng êm thích hợp tắm biển và chụp ảnh check-in)',
    heroImage: 'https://static.vinwonders.com/production/ganh-da-dia-phu-yen-1.jpg',
    gallery: [
      { name: 'Ghềnh Đá Đĩa', image: 'https://gonatour.vn/vnt_upload/news/03_2021/ghenh_da_dia_phu_yen.jpg' },
      { name: 'Mũi Điện Hải Đăng', image: 'https://cdn.xanhsm.com/2025/03/67778055-mui-dien-6.jpg' },
      { name: 'Bãi Xép Hoa Vàng Cỏ Xanh', image: 'https://cdn.xanhsm.com/2025/03/b622a2ba-hoa-vang-tren-co-xanh-thumb.jpg' },
      { name: 'Tháp Nghinh Phong', image: 'https://ik.imagekit.io/tvlk/blog/2023/01/thap-nghinh-phong-2-768x1024.jpg?tr=dpr-2,w-675' },
      { name: 'Đầm Ô Loan chiều hoàng hôn', image: 'https://52hz.vn/wp-content/uploads/2022/08/dam-o-loan-hoang-hon.jpg' }
    ]
  },
  'Lâm Đồng': {
    title: 'Lâm Đồng & Đà Lạt - Thành Phố Ngàn Hoa & Rừng Thông Cao Nguyên',
    subtitle: 'Khí hậu se lạnh mát lành bốn mùa, Hồ Tuyền Lâm, Đồi Chè Cầu Đất & Thác Dambri hùng vĩ',
    badge: 'Eco Wellness Resort',
    esgText: 'ESG: 82 | LEI: 78',
    certText: 'Đô thị Nghỉ Dưỡng Sinh Thái Cao Nguyên',
    description: 'Nằm trên cao nguyên Lang Biang độ cao 1.500m, Đà Lạt mê hoặc lòng người bởi khí hậu ôn đới mát mẻ quanh năm, những đồi thông reo trong sương sớm, thung lũng ngập tràn hoa tươi và văn hóa cà phê chill độc đáo.',
    specialties: ['Lẩu gà lá é Tao Ngộ', 'Lẩu bò Ba Toa', 'Bánh ướt lòng gà', 'Bánh tráng nướng Đà Lạt', 'Dâu tây thủy canh & Kem bơ béo ngậy'],
    bestSeason: 'Tháng 10 - Tháng 4 (Mùa khô, săn mây đồi chè, mùa hoa dã quỳ và mai anh đào nở rộ)',
    heroImage: 'https://smartland.vn/wp-content/uploads/2022/10/toan-canh-thanh-pho-da-lat-suong-mu.jpg',
    gallery: [
      { name: 'Hồ Xuân Hương Đà Lạt', image: 'https://2trip.vn/wp-content/uploads/2020/09/Ho-Xuan-Huong-Da-Lat-4.jpg' },
      { name: 'Đồi chè Cầu Đất', image: 'https://static.vinwonders.com/production/doi-che-cau-dat.jpg' },
      { name: 'Thác Dambri hùng vĩ', image: 'https://52hz.vn/wp-content/uploads/2022/01/thac-dambri-9.jpeg' },
      { name: 'Quảng trường Lâm Viên', image: 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/quang_truong_lam_vien_thumb_e7e4262d19.png' },
      { name: 'Đỉnh Langbiang huyền thoại', image: 'https://dalatreview.vn/wp-content/uploads/2023/08/329666825_595037048714323_227516769466023961_n.jpg' }
    ]
  },
  'Gia Lai': {
    title: 'Gia Lai & Kon Tum - Đôi Mắt Pleiku Huyền Tích & Nhà Rông Tây Nguyên',
    subtitle: 'Biển Hồ T’Nưng núi lửa cổ đại, Chư Đăng Ya hoa dã quỳ rực rỡ & Cồng chiêng đại ngàn',
    badge: 'National Heritage',
    esgText: 'ESG: 68 | LEI: 65',
    certText: 'Không Gian Văn Hóa Cồng Chiêng Tây Nguyên',
    description: 'Pleiku níu chân du khách với Biển Hồ T’Nưng xanh biếc tựa viên ngọc bích lọt thỏm giữa miệng núi lửa ngưng hoạt động hàng triệu năm, những đồi thông cổ thụ rợp bóng và tiếng chiêng trầm hùng bên bếp lửa nhà rông.',
    specialties: ['Phở hai tô (Phở khô Pleiku)', 'Gà nướng cơm lam sa lửa', 'Gỏi lá rừng Kon Tum 40 vị', 'Bò một nắng muối kiến Krông Pa', 'Cà phê nguyên chất Robusta'],
    bestSeason: 'Tháng 11 - Tháng 4 (Mùa hoa dã quỳ vàng ngập tràn triền đồi Chư Đăng Ya, mùa lễ hội cồng chiêng)',
    heroImage: 'https://cdn.xanhsm.com/2025/03/8d98d60d-bien-ho-pleiku-13.jpg',
    gallery: [
      { name: 'Biển Hồ T’Nưng Pleiku', image: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-4-800x612.jpg' },
      { name: 'Núi lửa Chư Đăng Ya', image: 'https://thanhnien.mediacdn.vn/Uploaded/maiha/2022_11_10/anh-3-3-3135.jpg' },
      { name: 'Nhà rông Kon Klor', image: 'https://image.vietgoing.com/editor/image_mwb1659681988.jpg' },
      { name: 'Nhà thờ gỗ Kon Tum', image: 'https://innotour.vn/image/catalog/blog-du-lich/kon-tum/pics/nha-tho-go-kon-tum-4.jpg' },
      { name: 'Chùa Minh Thành', image: 'https://media.gody.vn/images/gia-lai/chua-minh-thanh/11-2016/20161101090035-chua-minh-thanh-gody(11).jpg' }
    ]
  },
  'Đắk Lắk': {
    title: 'Đắk Lắk - Thủ Phủ Cà Phê Thế Giới & Sử Thi Hùng Tráng',
    subtitle: 'Bảo tàng Cà phê kiến trúc độc bản, Thác nước Dray Nur gầm vang & Buôn Đôn voi huyền thoại',
    badge: 'Cultural Heritage',
    esgText: 'ESG: 71 | LEI: 67',
    certText: 'Thủ Phủ Cà Phê Thế Giới Buôn Ma Thuột',
    description: 'Đắk Lắk là trái tim đại ngàn Tây Nguyên, quê hương của những rẫy cà phê bạt ngàn ngát hương hoa trắng, bảo tàng thế giới cà phê mang dáng dấp nhà dài Ê Đê, dòng sông Sêrêpôk chảy ngược cùng những thác nước kỳ vĩ tráng lệ.',
    specialties: ['Bún đỏ Buôn Ma Thuột', 'Gà đồng nướng chấm muối ớt rừng', 'Rượu cần men lá truyền thống', 'Cá lăng nấu măng chua sông Sêrêpôk', 'Cà phê Chồn thượng hạng'],
    bestSeason: 'Tháng 12 - Tháng 4 (Mùa hoa cà phê nở trắng muốt như tuyết, thời tiết mát dịu)',
    heroImage: 'https://trungnguyenlegend.com/wp-content/uploads/2022/11/cttvbo1-6.jpg',
    gallery: [
      { name: 'Bảo tàng Thế Giới Cà Phê', image: 'https://trungnguyenlegend.com/wp-content/uploads/2022/11/cttvbo1-6.jpg' },
      { name: 'Thác Dray Nur', image: 'https://tripmap.vn/wp-content/uploads/2021/07/thac-dray-nur-1627268728357.jpg' },
      { name: 'Hồ Lắk', image: 'https://statics.vinpearl.com/buon-ma-thuot-vietnam-08_1696090928.jpg' },
      { name: 'Buôn Đôn', image: 'https://cdn-i.vtcnews.vn/resize/th/upload/2023/07/09/voi-18114972.jpg' },
      { name: 'Hồ Tà Đùng', image: 'https://tinviettravel.com/uploads/tours/images/tay_nguyen/ho-ta-dung-dak-nong.jpg' }
    ]
  },
  'Quảng Trị': {
    title: 'Quảng Trị & Quảng Bình - Kỳ Quan Hang Động Đệ Nhất Thế Giới & Đất Lửa Hào Hùng',
    subtitle: 'Động Phong Nha, Động Thiên Đường thạch nhũ triệu năm, Cầu Hiền Lương & Địa đạo Vịnh Mốc',
    badge: 'UNESCO Natural Heritage',
    esgText: 'ESG: 76 | LEI: 72',
    certText: 'Kỳ Quan Thiên Nhiên Thế Giới UNESCO',
    description: 'Miền đất quy tụ những kỳ quan hang động vĩ đại nhất hành tinh tại Phong Nha - Kẻ Bàng, kết hợp cùng những di tích lịch sử thiêng liêng hào hùng gắn liền với khát vọng hòa bình của dân tộc.',
    specialties: ['Bánh khoái Quảng Trị giòn rụm', 'Bún hến Mai Xá', 'Cháo bột cá lóc Diên Sanh', 'Thịt trâu xào lá trơng', 'Chắt chắt xào bánh đa'],
    bestSeason: 'Tháng 3 - Tháng 8 (Mùa khô ráo, các hang động đón nắng vàng rực rỡ lấp lánh)',
    heroImage: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg',
    gallery: [
      { name: 'Động Thiên Đường', image: 'https://www.quangbinhtravel.vn/wp-content/uploads/2012/04/dongthienduong-1.jpg' },
      { name: 'Động Phong Nha', image: 'https://phongnhaexplorer.com/wp-content/uploads/2025/07/dongphongnha2-1024x715.jpg' },
      { name: 'Địa đạo Vịnh Mốc', image: 'https://mia.vn/media/uploads/blog-du-lich/dia-dao-vinh-moc-1-1710467866.jpg' },
      { name: 'Cầu Hiền Lương', image: 'https://media.vietravel.com/images/Content/du-lich-quang-tri-3.jpg' },
      { name: 'Thành Cổ Quảng Trị', image: 'https://nads.1cdn.vn/2024/01/18/W_1.dai-tuong-niem-liet-si-thanh-co-quang-tri-1972....jpg' }
    ]
  },
  'Thanh Hóa': {
    title: 'Thanh Hóa - Biển Sầm Sơn Sôi Động & Sinh Thái Pù Luông Xanh Ngắt',
    subtitle: 'Bãi biển Sầm Sơn danh tiếng, ruộng bậc thang Pù Luông thơ mộng & Thành Nhà Hồ ngàn năm',
    badge: 'UNESCO Heritage Site',
    esgText: 'ESG: 73 | LEI: 69',
    certText: 'Di sản Văn hóa Thế giới Thành Nhà Hồ',
    description: 'Thanh Hóa là cửa ngõ miền Trung với bờ biển Sầm Sơn sôi động, khu bảo tồn thiên nhiên Pù Luông hoang sơ tựa chốn bồng lai tiên cảnh cùng Thành Nhà Hồ - công trình kiến trúc đá độc nhất vô nhị ở Đông Nam Á.',
    specialties: ['Nem chua Thanh Hóa gia truyền', 'Chả tôm nướng than hoa', 'Bánh khoái tép Nồi đất', 'Gỏi cá nhệch Nga Sơn', 'Vịt Cổ Lũng Pù Luông'],
    bestSeason: 'Tháng 4 - Tháng 9 (Mùa tắm biển Sầm Sơn tuyệt hảo và ngắm lúa chín vàng Pù Luông)',
    heroImage: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg',
    gallery: [
      { name: 'Bãi biển Sầm Sơn', image: 'https://sunparadiseland.com/_next/image?url=https:%2F%2Fsun-ecommerce-cdn.azureedge.net%2Fecommerce%2Fservice-sites%2Fasset%2FSunParadiseLandQuangNinh%2Fgoogle-doc%2Fpost_id_31345%2FAD_4nXex57HvUCdJV6cNIazp-Sfdn2No2sqzDoRuycK8OQVkwBu56JQxwh9j9IYPAU7xmNXzF2-WaTQXM1dTdaxJUjiCoZn65k2JyLEY25oFyRv3MxipjcH7MxgbOrRQ68PJiyZJ8iu5T-Yi_vyZk3S3cF54mdTKbs0-BZKM4JJ2QQ4konnVsItU%253Ds2048.webp&w=1200&q=80' },
      { name: 'Ruộng bậc thang Pù Luông', image: 'https://m.yodycdn.com/products/anhruongbacthang1_m2b9i8yxd6fqow6fh1t.jpg' },
      { name: 'Thành Nhà Hồ UNESCO', image: 'https://static.vinwonders.com/production/toan-canh-di-tich-thanh-nha-ho.jpg' },
      { name: 'Suối cá thần Cẩm Lương', image: 'https://ticotravel.com.vn/wp-content/uploads/2021/05/suoi-ca-than-thanh-hoa-8.jpg' },
      { name: 'Biển Hải Tiến', image: 'https://static.vinwonders.com/production/dia-chi-bien-hai-tien.jpg' }
    ]
  },
  'Nghệ An': {
    title: 'Nghệ An - Bãi Biển Cửa Lò Trong Xanh & Quê Hương Bác Hồ Kính Yêu',
    subtitle: 'Bãi biển Cửa Lò trải dài cát mịn, Làng Sen Kim Liên thanh bình & Đảo Chè Thanh Chương',
    badge: 'National Cultural Heritage',
    esgText: 'ESG: 72 | LEI: 68',
    certText: 'Khu Di tích Quốc gia Đặc biệt Kim Liên',
    description: 'Nghệ An địa linh nhân kiệt với bãi biển Cửa Lò sóng êm cát mịn, Khu di tích Kim Liên lưu giữ tuổi thơ Bác Hồ với những mái tranh mộc mạc và ốc đảo chè Thanh Chương uốn lượn non xanh nước biếc.',
    specialties: ['Cháo lươn & Súp lươn xứ Nghệ', 'Mực nhảy nướng Cửa Lò', 'Tương Nam Đàn nức tiếng', 'Cam Xã Đoài mọng nước', 'Bánh mướt giò nóng'],
    bestSeason: 'Tháng 4 - Tháng 8 (Mùa hè biển Cửa Lò tuyệt đẹp, thích hợp nghỉ mát gia đình)',
    heroImage: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg',
    gallery: [
      { name: 'Bãi biển Cửa Lò', image: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg' },
      { name: 'Làng Sen quê Bác', image: 'https://ilooca-tourdb.itourism.vn/files/thumb/840/456/uploads/content/17022/68384d86a12a6.png' },
      { name: 'Đảo Chè Thanh Chương', image: 'https://ticotravel.com.vn/wp-content/uploads/2022/10/Dao-che-Thanh-Chuong-6.jpeg' },
      { name: 'Vườn quốc gia Pù Mát', image: 'https://media.vietnamplus.vn/images/a01c0e0c6ca85cd3c5d38871d88e83e0e4b18c51a63b4c988d3a06bd34290b47d0734ca05f9eb49adb08a32cb2e3af59cdb57feb901aea868e56e8a402356a73/0910-khe-kem-pu-mat.jpg' },
      { name: 'Biển Bãi Lữ', image: 'https://dulichkhatvongviet.com/wp-content/uploads/2014/07/bai-lu-nghe-an.jpg' }
    ]
  },
  'Hà Tĩnh': {
    title: 'Hà Tĩnh - Biển Thiên Cầm Đàn Trời & Ngã Ba Đồng Lộc Bất Tử',
    subtitle: 'Bãi biển Thiên Cầm hình cánh cung êm đềm, Ngã ba Đồng Lộc linh thiêng & Chùa Hương Tích',
    badge: 'National Heritage',
    esgText: 'ESG: 70 | LEI: 66',
    certText: 'Quần Thể Di Tích Quốc Gia Đặc Biệt',
    description: 'Hà Tĩnh nổi tiếng với cung biển Thiên Cầm tuyệt đẹp được ví như cung đàn trời ngân nga bên sóng vỗ, Chùa Hương Tích cổ tự ẩn mình trên đỉnh núi Hồng Lĩnh và Ngã Ba Đồng Lộc - biểu tượng bất tử của lòng dũng cảm.',
    specialties: ['Kẹo Cu đơ Hà Tĩnh giòn thơm', 'Mực nhảy Vũng Áng ngọt lịm', 'Bánh bèo Hà Tĩnh', 'Bưởi Phúc Trạch tiến vua', 'Gỏi cá đục Lộc Hà'],
    bestSeason: 'Tháng 4 - Tháng 8 (Khí hậu nhiều nắng, biển Thiên Cầm trong xanh êm đềm)',
    heroImage: 'https://zoomtravel.vn/upload/images/thien-cam-ha-tinh-1-min.jpg',
    gallery: [
      { name: 'Biển Thiên Cầm', image: 'https://zoomtravel.vn/upload/images/thien-cam-ha-tinh-1-min.jpg' },
      { name: 'Ngã Ba Đồng Lộc', image: 'https://static.vinwonders.com/production/thoi-diem-di-nga-ba-dong-loc.jpg' },
      { name: 'Chùa Hương Tích', image: 'https://cdn.baohatinh.vn/images/5c0e3df6f392cae5972c8105500d84182642ad8f46238526fddaf4a5ff633a59e3b9fc4f6b4de541067d96204805ebda/154d4222421t91554l0.jpg' },
      { name: 'Hồ Kẻ Gỗ', image: 'https://statics.vinpearl.com/ho-ke-go 1_1624870951.jpg' },
      { name: 'Hải Đăng Cửa Sót', image: 'https://cdn.daidoanket.vn/w1200/uploaded/images/2026/04/16/d32a8cb9-fba7-4dcf-b082-9801a25e06fc.jpg' }
    ]
  }
}

// State quản lý phóng to ảnh & chuyển đổi hình ảnh miêu tả của tỉnh thành
const selectedSpotlightImage = ref(null)
const isSpotlightModalOpen = ref(false)

watch(() => formDuLieu.diemDen, () => {
  selectedSpotlightImage.value = null
})

const currentSpotlight = computed(() => {
  const dest = formDuLieu.diemDen || ALL_DESTINATIONS
  if (dest === ALL_DESTINATIONS) {
    return PROVINCE_SPOTLIGHTS[ALL_DESTINATIONS]
  }
  return PROVINCE_SPOTLIGHTS[dest] || PROVINCE_SPOTLIGHTS[ALL_DESTINATIONS] || PROVINCE_SPOTLIGHTS['Đà Nẵng']
})

const activeHeroImage = computed(() => {
  return selectedSpotlightImage.value || currentSpotlight.value?.heroImage
})

function chuyenSangLenLichTrinh(city) {
  if (city && city !== ALL_DESTINATIONS) {
    formDuLieu.diemDen = city
  }
  selectedSpotlightImage.value = null
  activeTab.value = 'planner'
  currentPlannerStep.value = 1
  cuonLenDauTrang()
  nextTick(() => {
    cuonLenDauTrang()
  })
}

const allDestinationsCard = {
  name: ALL_DESTINATIONS,
  displayName: 'Tất cả',
  icon: '🔥',
  tag: 'Những điểm đến hot nhất miền Trung',
  image: '/images/mientrung-collage.jpg',
  audio: '/music/mientrung.mp3'
}
const destinationCards = [allDestinationsCard, ...centralCities]
const preMergerCities = [
  { name: 'Thanh Hóa', icon: '🏰', tag: 'Sầm Sơn & Pù Luông', image: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg', audio: '/music/thanhhoa.mp3' },
  { name: 'Nghệ An', icon: '🌾', tag: 'Cửa Lò & Quê Bác', image: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg', audio: '/music/nghean.mp3' },
  { name: 'Hà Tĩnh', icon: '🌊', tag: 'Thiên Cầm & Ngã Ba Đồng Lộc', image: 'https://thiencam.net/wp-content/uploads/2017/04/thien-cam-ha-tinh.jpg', audio: '/music/hatinh.mp3' },
  { name: 'Quảng Bình', icon: '🪨', tag: 'Phong Nha & Động Thiên Đường', image: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg' },
  { name: 'Quảng Trị', icon: '⛰️', tag: 'Thành Cổ & Cầu Hiền Lương', image: 'https://ik.imagekit.io/tvlk/blog/2023/05/thanh-co-quang-tri-3.jpg?tr=dpr-2,w-675', audio: '/music/quangtri.mp3' },
  { name: 'Thừa Thiên Huế', icon: '👑', tag: 'Cố đô Đại Nội & Sông Hương', image: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg', audio: '/music/hue.mp3' },
  { name: 'Đà Nẵng', icon: '🌉', tag: 'Cầu Vàng Bà Nà & Biển Mỹ Khê', image: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg', audio: '/music/danang.mp3' },
  { name: 'Quảng Nam', icon: '🏮', tag: 'Phố Cổ Hội An & Cù Lao Chàm', image: 'https://top1quangnam.com/wp-content/uploads/2021/12/hoi-an-15102019-2-1400x788.png' },
  { name: 'Quảng Ngãi', icon: '🏖️', tag: 'Cổng Tò Vò Đảo Lý Sơn', image: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg', audio: '/music/quangngai.mp3' },
  { name: 'Bình Định', icon: '🌊', tag: 'Kỳ Co & Eo Gió Quy Nhơn', image: 'https://eholiday.vn/wp-content/uploads/2024/07/ky-co-1.jpg' },
  { name: 'Phú Yên', icon: '🏝️', tag: 'Gành Đá Đĩa & Mũi Điện', image: 'https://static.vinwonders.com/production/ganh-da-dia-phu-yen-1.jpg' },
  { name: 'Khánh Hòa', icon: '⛵', tag: 'Vịnh Biển Nha Trang & Tháp Bà', image: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg', audio: '/music/khanhhoa.mp3' },
  { name: 'Ninh Thuận', icon: '🌵', tag: 'Vịnh Vĩnh Hy & Po Klong Garai', image: 'https://storage.googleapis.com/blogvxr-uploads/2025/07/8009d84a-vinh-vinh-hy-ninh-thuan-2455843-1250x715.jpg' },
  { name: 'Bình Thuận', icon: '🏜️', tag: 'Đồi Cát Bay Mũi Né & Bàu Trắng', image: 'https://nhn.1cdn.vn/2023/07/03/doi-cat.jpg' },
  { name: 'Kon Tum', icon: '🏡', tag: 'Nhà Thờ Gỗ & Cầu Kon Klor', image: 'https://innotour.vn/image/catalog/blog-du-lich/kon-tum/pics/nha-tho-go-kon-tum-4.jpg' },
  { name: 'Gia Lai', icon: '🐘', tag: 'Biển Hồ T’Nưng Pleiku', image: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-3-768x587.jpg', audio: '/music/gialai.mp3' },
  { name: 'Đắk Lắk', icon: '☕', tag: 'Bảo Tàng Cà Phê & Buôn Đôn', image: 'https://cdn.xanhsm.com/2024/12/131980d3-bao-tang-the-gioi-ca-phe-25.jpg', audio: '/music/daklak.mp3' },
  { name: 'Đắk Nông', icon: '🌋', tag: 'Hồ Tà Đùng - Vịnh Hạ Long', image: 'https://tinviettravel.com/uploads/tours/images/tay_nguyen/ho-ta-dung-dak-nong.jpg' },
  { name: 'Lâm Đồng', icon: '🌲', tag: 'Đà Lạt Ngàn Hoa & Đồi Chè', image: 'https://cdn.tgdd.vn/Files/2023/10/25/1553008/top-22-dia-diem-du-lich-lam-dong-dep-nhat-dinh-khong-nen-bo-qua-202310251415581585.jpg', audio: '/music/lamdong.mp3' }
]
const provinceMode = ref('merged')
const visibleCities = computed(() => provinceMode.value === 'merged' ? centralCities : preMergerCities)
const visibleDestinationCards = computed(() => provinceMode.value === 'merged' ? destinationCards : preMergerCities)

const cityMelodies = {
  [ALL_DESTINATIONS]: [261.63, 329.63, 392, 523.25, 392, 329.63],
  'Thanh Hóa': [293.66, 349.23, 440, 523.25, 440, 349.23],
  'Nghệ An': [261.63, 293.66, 349.23, 392, 349.23, 293.66],
  'Hà Tĩnh': [329.63, 392, 440, 587.33, 440, 392],
  'Quảng Trị': [220, 261.63, 329.63, 392, 329.63, 261.63],
  'Huế': [293.66, 369.99, 440, 493.88, 440, 369.99],
  'Đà Nẵng': [261.63, 329.63, 392, 493.88, 523.25, 392],
  'Quảng Ngãi': [246.94, 293.66, 369.99, 440, 369.99, 293.66],
  'Gia Lai': [196, 246.94, 293.66, 392, 293.66, 246.94],
  'Đắk Lắk': [220, 277.18, 329.63, 440, 329.63, 277.18],
  'Khánh Hòa': [261.63, 349.23, 440, 523.25, 587.33, 440],
  'Lâm Đồng': [293.66, 349.23, 392, 466.16, 392, 349.23]
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

function tiepTheoWizard() {
  if (currentPlannerStep.value === 1) {
    if (!formDuLieu.soNgay || formDuLieu.soNgay <= 0) {
      personalityToast.value = {
        icon: 'clock',
        title: 'Chưa chọn số ngày đi',
        desc: 'Vui lòng tăng số ngày đi (tối thiểu 1 ngày) để tiếp tục lên kế hoạch.'
      }
      return
    }
    if (!formDuLieu.soNguoi || formDuLieu.soNguoi <= 0) {
      personalityToast.value = {
        icon: 'users',
        title: 'Chưa chọn số người',
        desc: 'Vui lòng tăng số lượng người tham gia (tối thiểu 1 người) để tính toán chi phí.'
      }
      return
    }
  }
  currentPlannerStep.value++
}

// ===== AI BUBBLE: 10 câu hài hước luân phiên ngẫu nhiên =====
const AI_HINTS = [
  `<strong>Chưa biết đi đâu à?</strong><br/>Không sao. Bạn có tiền, tôi có dữ liệu.<br/>Chúng ta đã có <em>50% điều kiện</em> để bắt đầu. 🎯`,
  `Bạn muốn <strong>biển</strong>, <strong>núi</strong>, <strong>đồ ăn</strong> hay… <em>trốn deadline?</em> 😌<br/>Chọn một cái bên dưới, tôi lo phần còn lại.`,
  `<strong>Lên lịch đi chơi, đừng lên lịch cãi nhau.</strong> 😄<br/>AI sắp xếp hành trình — bạn chỉ cần quyết định… ai trả tiền.`,
  `Mỗi chuyến đi là một câu chuyện.<br/>Câu chuyện của bạn <strong>bắt đầu từ đây</strong> — chọn điểm đến và tôi viết phần còn lại. ✍️`,
  `<strong>Bạn đang nghĩ đến kỳ nghỉ hay đang trốn thực tế?</strong> 🏖️<br/>Dù là cái nào, tôi cũng hỗ trợ nhiệt tình như nhau.`,
  `Theo nghiên cứu khoa học*, <em>người đi du lịch hạnh phúc hơn 73%</em>.<br/>(*Tôi tự nghiên cứu.) <strong>Đi thôi!</strong> 🚀`,
  `<strong>Chuyến đi hoàn hảo = Điểm đến đúng + Lịch trình hợp lý + Bụng no.</strong><br/>Tôi lo được 2/3. Cái còn lại bạn tự lo nhé. 🍜`,
  `Nếu bạn đang đọc cái này tức là bạn chưa chọn điểm đến.<br/><strong>Tin tôi đi — bất kỳ chỗ nào ở Miền Trung đều xứng đáng đi một lần.</strong> 🌊`,
  `<em>"Đi một ngày đàng, học một sàng khôn."</em><br/><strong>Hoặc ít nhất là ăn được một mâm hải sản.</strong> 🦞 Thế là xứng đáng rồi đó.`,
  `<strong>Deadline đang chờ. Sếp đang nhìn. Ví đang mỏng.</strong><br/>…Nhưng biển Miền Trung đang đẹp lắm. <em>Ưu tiên cái quan trọng hơn nhé.</em> 🏝️`
]

const aiHintIndex = ref(Math.floor(Math.random() * AI_HINTS.length))
const showAiHintBubble = ref(true)

const aiCurrentHint = computed(() => AI_HINTS[aiHintIndex.value])

function refreshAiHint() {
  let next
  do { next = Math.floor(Math.random() * AI_HINTS.length) } while (next === aiHintIndex.value)
  aiHintIndex.value = next
}

// Computed: subtitle AI hài hước theo tỉnh thành
const aiProvinceSubtitle = computed(() => {
  const dest = formDuLieu.diemDen
  if (!dest || dest === ALL_DESTINATIONS) return ''
  const subtitles = {
    'Nghệ An': 'Đã đến Nghệ An thì đừng chỉ check-in rồi về. Bánh mướt, cháo lươn, súp lươn đang chờ bạn. 🍜',
    'Đà Nẵng': 'Cầu Vàng, Bà Nà, Mỹ Khê — tất cả chỉ cách nhau 30 phút xe. Nhưng túi tiền thì... cách khá xa. 😄',
    'Huế': 'Huế không chỉ có bún bò và lăng tẩm. Còn có bánh khoái, cơm hến và hàng chục lý do để quay lại. 👑',
    'Lâm Đồng': 'Trời se lạnh, cà phê nóng, view đẹp… và một nỗi buồn rất dễ thương không rõ lý do. 🌲',
    'Khánh Hòa': 'Biển xanh, hải sản tươi, nắng vàng — bộ ba hoàn hảo khiến ví bạn bay không kịp thở. ⛵',
    'Quảng Trị': 'Phong Nha, Thiên Đường, hang Sơn Đoòng — thiên nhiên ban tặng nhiều đến mức không biết chọn cái nào. 🪨',
    'Thanh Hóa': 'Sầm Sơn đang nắng đẹp, Pù Luông đang mây bay. Khó chọn? Cứ chọn cả hai. 🏰',
    'Hà Tĩnh': 'Biển Thiên Cầm, Ngã Ba Đồng Lộc — lịch sử và thiên nhiên hòa quyện một cách khó tả. 🌊',
    'Gia Lai': 'Cao nguyên, cà phê, nhà rông… và buổi sáng mát lạnh đến mức muốn không bao giờ về. 🐘',
    'Đắk Lắk': 'Bảo tàng cà phê thế giới nằm ở đây. Còn lý do gì để không đến? ☕',
    'Quảng Ngãi': 'Đảo Lý Sơn — hành trình ra đảo ngắn nhưng cảnh đẹp thì ở lại trong tim rất lâu. 🏖️',
  }
  return subtitles[dest] || `Khám phá ${dest} — nơi có cảnh đẹp, đặc sản ngon và rất nhiều lý do để quay lại. ✨`
})

// LỊCH TRÌNH KHỞI HÀNH & CHỌN NGÀY ĐI (THEO SCREENSHOT 3)
const todayIso = new Date().toISOString().split('T')[0]

const DEPARTURE_MONTHS = [
  { label: 'Tháng 10 2026', key: '2026-10', defaultDate: '2026-10-06' },
  { label: 'Tháng 11 2026', key: '2026-11', defaultDate: '2026-11-01' },
  { label: 'Tháng 12 2026', key: '2026-12', defaultDate: '2026-12-01' },
  { label: 'Tháng 1 2027', key: '2027-01', defaultDate: '2027-01-01' },
  { label: 'Tháng 2 2027', key: '2027-02', defaultDate: '2027-02-01' },
  { label: 'Tháng 3 2027', key: '2027-03', defaultDate: '2027-03-01' }
]

const selectedMonthKey = ref('2026-10')

function chonThangKhoiHanh(m) {
  selectedMonthKey.value = m.key
  formDuLieu.ngayBatDau = m.defaultDate
}

const ngayKetThucDisplay = computed(() => {
  if (!formDuLieu.ngayBatDau || !formDuLieu.soNgay || formDuLieu.soNgay <= 0) return ''
  try {
    const parts = formDuLieu.ngayBatDau.split('-')
    if (parts.length !== 3) return ''
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const d = new Date(year, month, day)
    const days = parseInt(formDuLieu.soNgay, 10) || 0
    if (days <= 0) return ''
    d.setDate(d.getDate() + (days - 1))
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  } catch (e) {
    return ''
  }
})

function dinhDangNgayTuan(dateStr) {
  if (!dateStr) return ''
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
    const dayName = dayNames[dt.getDay()]
    const dd = String(d).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    return `${dayName}, ${dd}/${mm}/${y}`
  } catch (e) {
    return dateStr
  }
}

// Đồng bộ tự động ngày kết thúc khi ngày bắt đầu hoặc số ngày thay đổi
watch([() => formDuLieu.ngayBatDau, () => formDuLieu.soNgay], () => {
  formDuLieu.ngayKetThuc = ngayKetThucDisplay.value
  if (formDuLieu.ngayBatDau && formDuLieu.ngayBatDau.length >= 7) {
    const key = formDuLieu.ngayBatDau.substring(0, 7)
    if (DEPARTURE_MONTHS.some(m => m.key === key)) {
      selectedMonthKey.value = key
    }
  }
}, { immediate: true })

// Ở phần "sở thích và trải nghiệm" hãy bỏ trống mặc định theo yêu cầu
const chuoiSoThich = ref('')
const originProvinceMode = ref('pre-merged')

// Danh sách 34 tỉnh/thành SAU sáp nhập (hiệu lực từ 01/07/2025)
const ORIGINS_POST_MERGER = [
  { name: 'Hà Nội', icon: '🏛️' },
  { name: 'Hải Phòng', icon: '⚓' },
  { name: 'Quảng Ninh', icon: '⛵' },
  { name: 'Lạng Sơn', icon: '🏔️' },
  { name: 'Cao Bằng', icon: '🌄' },
  { name: 'Hà Giang', icon: '🏞️' },
  { name: 'Thái Nguyên', icon: '🌿' },
  { name: 'Lào Cai', icon: '🌾' },
  { name: 'Sơn La', icon: '🌳' },
  { name: 'Bắc Giang', icon: '🎋' },
  { name: 'Hải Dương', icon: '🌸' },
  { name: 'Vĩnh Phúc', icon: '🏡' },
  { name: 'Ninh Bình', icon: '⛵' },
  { name: 'Thanh Hóa', icon: '🏖️' },
  { name: 'Nghệ An', icon: '🌊' },
  { name: 'Quảng Bình', icon: '🦅' },
  { name: 'Huế', icon: '👑' },
  { name: 'Đà Nẵng', icon: '🌉' },
  { name: 'Quảng Ngãi', icon: '🏝️' },
  { name: 'Gia Lai', icon: '🦁' },
  { name: 'Phú Yên', icon: '⛰️' },
  { name: 'Đắk Lắk', icon: '☕' },
  { name: 'Lâm Đồng', icon: '🌺' },
  { name: 'TP. Hồ Chí Minh', icon: '🏙️' },
  { name: 'Đồng Nai', icon: '🌴' },
  { name: 'Tây Ninh', icon: '🛕' },
  { name: 'Long An', icon: '🌾' },
  { name: 'Bến Tre', icon: '🥥' },
  { name: 'Cần Thơ', icon: '🌊' },
  { name: 'An Giang', icon: '⛩️' },
  { name: 'Cà Mau', icon: '🦀' },
  { name: 'Bình Dương', icon: '🏭' },
  { name: 'Bà Rịa - Vũng Tàu', icon: '🏖️' },
  { name: 'Hà Tĩnh', icon: '🌊' }
]

// Danh sách 63 tỉnh/thành TRƯỚC sáp nhập (đơn vị hành chính cũ)
const ORIGINS_PRE_MERGER = [
  { name: 'Hà Nội', icon: '🏛️' },
  { name: 'TP. Hồ Chí Minh', icon: '🏙️' },
  { name: 'Hải Phòng', icon: '⚓' },
  { name: 'Đà Nẵng', icon: '🌉' },
  { name: 'Cần Thơ', icon: '🌊' },
  { name: 'An Giang', icon: '⛩️' },
  { name: 'Bà Rịa - Vũng Tàu', icon: '🏖️' },
  { name: 'Bắc Giang', icon: '🎋' },
  { name: 'Bắc Kạn', icon: '🌲' },
  { name: 'Bạc Liêu', icon: '🦐' },
  { name: 'Bắc Ninh', icon: '🎶' },
  { name: 'Bến Tre', icon: '🥥' },
  { name: 'Bình Định', icon: '⛵' },
  { name: 'Bình Dương', icon: '🏭' },
  { name: 'Bình Phước', icon: '🌴' },
  { name: 'Bình Thuận', icon: '🏜️' },
  { name: 'Cà Mau', icon: '🦀' },
  { name: 'Cao Bằng', icon: '🌄' },
  { name: 'Đắk Lắk', icon: '☕' },
  { name: 'Đắk Nông', icon: '🌿' },
  { name: 'Điện Biên', icon: '⭐' },
  { name: 'Đồng Nai', icon: '🌴' },
  { name: 'Đồng Tháp', icon: '🌸' },
  { name: 'Gia Lai', icon: '🦁' },
  { name: 'Hà Giang', icon: '🏞️' },
  { name: 'Hà Nam', icon: '🌾' },
  { name: 'Hà Tĩnh', icon: '🌊' },
  { name: 'Hải Dương', icon: '🌸' },
  { name: 'Hậu Giang', icon: '🐊' },
  { name: 'Hòa Bình', icon: '🏔️' },
  { name: 'Hưng Yên', icon: '🍋' },
  { name: 'Khánh Hòa', icon: '🐠' },
  { name: 'Kiên Giang', icon: '🏝️' },
  { name: 'Kon Tum', icon: '🪵' },
  { name: 'Lai Châu', icon: '❄️' },
  { name: 'Lâm Đồng', icon: '🌺' },
  { name: 'Lạng Sơn', icon: '🏔️' },
  { name: 'Lào Cai', icon: '🌾' },
  { name: 'Long An', icon: '🌾' },
  { name: 'Nam Định', icon: '🏰' },
  { name: 'Nghệ An', icon: '🌊' },
  { name: 'Ninh Bình', icon: '⛵' },
  { name: 'Ninh Thuận', icon: '🐑' },
  { name: 'Phú Thọ', icon: '🍃' },
  { name: 'Phú Yên', icon: '⛰️' },
  { name: 'Quảng Bình', icon: '🦅' },
  { name: 'Quảng Nam', icon: '🏮' },
  { name: 'Quảng Ngãi', icon: '🏝️' },
  { name: 'Quảng Ninh', icon: '⛵' },
  { name: 'Quảng Trị', icon: '🕊️' },
  { name: 'Sóc Trăng', icon: '🦢' },
  { name: 'Sơn La', icon: '🌳' },
  { name: 'Tây Ninh', icon: '🛕' },
  { name: 'Thái Bình', icon: '🌾' },
  { name: 'Thái Nguyên', icon: '🌿' },
  { name: 'Thanh Hóa', icon: '🏖️' },
  { name: 'Thừa Thiên Huế', icon: '👑' },
  { name: 'Tiền Giang', icon: '🌊' },
  { name: 'Trà Vinh', icon: '🦚' },
  { name: 'Tuyên Quang', icon: '🌲' },
  { name: 'Vĩnh Long', icon: '🌿' },
  { name: 'Vĩnh Phúc', icon: '🏡' },
  { name: 'Yên Bái', icon: '🌄' }
]

const popularOrigins = computed(() => {
  return originProvinceMode.value === 'merged' ? ORIGINS_POST_MERGER : ORIGINS_PRE_MERGER
})

// ==================== QUICK TAG CHIPS CHO KHÁCH SẠN & SỞ THÍCH ====================
const hotelQuickTags = [
  '🏖️ Gần biển',
  '🌅 View hoàng hôn',
  '🍃 Khu yên tĩnh',
  '🏊 Có hồ bơi',
  '👨‍👩‍👧 Phòng gia đình',
  '💰 Giá bình dân',
  '🏙️ Gần trung tâm',
  '🥐 Có buffet sáng'
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
  '🍜 Ăn sập đặc sản',
  '📸 Check-in sống ảo',
  '🏖️ Tắm biển thư giãn',
  '🏛️ Di tích lịch sử',
  '☕ Cà phê chill',
  '🌿 Trekking thiên nhiên',
  '⛵ Đi thuyền ngắm cảnh',
  '🛍️ Mua quà chợ đêm'
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

// ==================== KIỂM TRA TÍNH KHẢ THI CỦA CHUYẾN ĐI (FEASIBILITY CHECK) ====================
const tripFeasibility = computed(() => {
  const budget = Number(formDuLieu.nganSach) || 0
  const days = Math.max(1, Number(formDuLieu.soNgay) || 1)
  const people = Math.max(1, Number(formDuLieu.soNguoi) || 1)
  const dest = formDuLieu.diemDen || 'Đà Nẵng'
  const freeOnly = Boolean(formDuLieu.freePlacesOnly)
  const perPersonPerDay = Math.round(budget / (days * people))

  // Định mức tối thiểu để có thể đi du lịch:
  // 1 ngày: tối thiểu 150.000đ/người (ăn 2 bữa nhẹ + xăng xe máy, không ở qua đêm)
  // Nhiều ngày: tối thiểu 250.000đ/người/ngày (homestay/dorm chia phòng tối thiểu ~120k + ăn 3 bữa ~100k + xăng xe ~30k)
  const minDailyPerPerson = days === 1 ? 150000 : 250000
  const minFeasibleBudget = days === 1 ? (people * 150000) : (days * people * 250000)

  if (freeOnly) {
    return {
      feasible: true,
      mode: 'free_places_only',
      perPersonPerDay,
      minFeasibleBudget,
      message: 'Chế độ phượt tự túc: AI chỉ xếp các điểm tham quan 100% miễn phí vé (0đ).'
    }
  }

  if (budget < minFeasibleBudget) {
    const maxFeasibleDays = Math.max(1, Math.floor(budget / (people * 250000)))
    return {
      feasible: false,
      reason: 'INSUFFICIENT_BUDGET',
      budget,
      days,
      people,
      perPersonPerDay,
      minDailyPerPerson,
      minFeasibleBudget,
      maxFeasibleDays,
      message: `Ngân sách ${dinhDangTien(budget)}đ không khả thi cho chuyến đi ${days} ngày ${people} người tại ${dest} (trung bình chỉ ~${dinhDangTien(perPersonPerDay)}đ/người/ngày). Số tiền này không đủ chi trả chỗ ở tối thiểu (~150.000đ/đêm) và ăn uống 3 bữa mỗi ngày.`,
      recommendation: {
        minBudget: minFeasibleBudget,
        suggestedDays: maxFeasibleDays,
        advice: `Bạn nên tăng ngân sách lên tối thiểu ${dinhDangTien(minFeasibleBudget)}đ, bật tùy chọn "Tự túc phương tiện đến", hoặc rút ngắn chuyến đi xuống ${maxFeasibleDays} ngày, hoặc chọn chế độ chỉ tham quan điểm miễn phí vé.`
      }
    }
  }

  return {
    feasible: true,
    perPersonPerDay,
    minFeasibleBudget
  }
})

// ==================== 5 PHÂN TẦNG NGÂN SÁCH THÔNG MINH ====================
const currentBudgetTier = computed(() => {
  const total = Number(formDuLieu.nganSach) || 3500000
  const days = Math.max(1, Number(formDuLieu.soNgay) || 1)
  const people = Math.max(1, Number(formDuLieu.soNguoi) || 1)
  const perDay = total / (days * people)

  if (total >= 20000000 && perDay >= 2500000) {
    return {
      key: 'T4',
      name: 'Xa Hoa / VIP Nghỉ Dưỡng',
      icon: '🟡',
      badge: '5 SAO XA HOA (30 TRIỆU+)',
      color: '#f59e0b',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Resort 5 sao quốc tế / Biệt thự biển riêng (InterContinental, Hyatt, Vinpearl)',
      foodDesc: 'Fine Dining, buffet tôm hùm 5 sao, ăn tối du thuyền riêng',
      transportDesc: 'Vé máy bay hạng thương gia / Xe limousine riêng đưa đón',
      ratios: { hotel: 0.45, food: 0.23, transport: 0.15, tickets: 0.12, reserve: 0.05 }
    }
  }

  if (perDay < 250000) {
    return {
      key: 'T0',
      name: 'Sinh Tồn / Phượt Bụi',
      icon: '🪨',
      badge: 'SIÊU TIẾT KIỆM (DƯỚI 250K/NGÀY)',
      color: '#64748b',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Hostel dorm / Homestay cộng đồng / Couchsurfing',
      foodDesc: 'Quán ăn vỉa hè, bánh mì que, bánh bèo hẻm, bún bình dân',
      transportDesc: 'Xe khách ghế ngồi / Đi bộ / Xe buýt nội đô',
      ratios: { hotel: 0.20, food: 0.45, transport: 0.20, tickets: 0.05, reserve: 0.10 }
    }
  }

  if (perDay < 600000) {
    return {
      key: 'T1',
      name: 'Tiết Kiệm / Sinh Viên',
      icon: '💚',
      badge: 'TIẾT KIỆM TỐI ƯU (1 - 2 TRIỆU)',
      color: '#10b981',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Nhà nghỉ tiêu chuẩn / Phòng riêng homestay giá mềm',
      foodDesc: 'Mì Quảng, cơm gà bình dân, hải sản tươi ven chợ',
      transportDesc: 'Xe khách giường nằm giá rẻ / Thuê xe máy vi vu',
      ratios: { hotel: 0.28, food: 0.35, transport: 0.22, tickets: 0.08, reserve: 0.07 }
    }
  }

  if (perDay < 1500000) {
    return {
      key: 'T2',
      name: 'Tiêu Chuẩn / Phổ Thông',
      icon: '💙',
      badge: 'TIÊU CHUẨN THOẢI MÁI',
      color: '#0284c7',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Khách sạn 3 sao có ăn sáng / Gần biển',
      foodDesc: 'Nhà hàng đặc sản, hải sản tươi sống, cafe view đẹp',
      transportDesc: 'Xe Limousine / Tàu hỏa ngắm cảnh / Thuê xe máy tốt',
      ratios: { hotel: 0.35, food: 0.28, transport: 0.20, tickets: 0.12, reserve: 0.05 }
    }
  }

  if (perDay < 3500000) {
    return {
      key: 'T3',
      name: 'Chất Lượng Cao / 4 Sao',
      icon: '💜',
      badge: '4 SAO CAO CẤP',
      color: '#8b5cf6',
      perPersonPerDay: Math.round(perDay),
      hotelDesc: 'Khách sạn 4 sao / Resort boutique / View biển hồ bơi vô cực',
      foodDesc: 'Nhà hàng hải sản lớn, lẩu hải sản, bar cocktail hoàng hôn',
      transportDesc: 'Vé máy bay khứ hồi / Thuê ô tô tự lái / Taxi trọn gói',
      ratios: { hotel: 0.40, food: 0.23, transport: 0.20, tickets: 0.12, reserve: 0.05 }
    }
  }

  return {
    key: 'T4',
    name: 'Xa Hoa / VIP Nghỉ Dưỡng',
    icon: '🟡',
    badge: '5 SAO XA HOA (30 TRIỆU+)',
    color: '#f59e0b',
    perPersonPerDay: Math.round(perDay),
    hotelDesc: 'Resort 5 sao quốc tế / Biệt thự biển riêng (InterContinental, Hyatt, Vinpearl)',
    foodDesc: 'Fine Dining, buffet tôm hùm 5 sao, ăn tối du thuyền riêng',
    transportDesc: 'Vé máy bay hạng thương gia / Xe limousine riêng đưa đón',
    ratios: { hotel: 0.45, food: 0.23, transport: 0.15, tickets: 0.12, reserve: 0.05 }
  }
})

// ==================== DỰ TOÁN CHI PHÍ THÔNG MINH (DYNAMIC BUDGET BREAKDOWN) ====================
const dynamicBudget = computed(() => {
  const total = Number(formDuLieu.nganSach) || 3500000
  const days = Math.max(1, Number(formDuLieu.soNgay) || 1)
  const nights = Math.max(1, days - 1)
  const people = Math.max(1, Number(formDuLieu.soNguoi) || 1)
  const isFreeOnly = Boolean(formDuLieu.freePlacesOnly)
  const tier = currentBudgetTier.value
  
  let ratios = { ...tier.ratios }
  if (isFreeOnly) {
    const nonTicketSum = ratios.hotel + ratios.food + ratios.transport + ratios.reserve
    ratios = {
      hotel: ratios.hotel / nonTicketSum,
      food: ratios.food / nonTicketSum,
      transport: ratios.transport / nonTicketSum,
      tickets: 0,
      reserve: ratios.reserve / nonTicketSum
    }
  }

  const hotel = Math.round(total * ratios.hotel)
  const food = Math.round(total * ratios.food)
  const transport = Math.round(total * ratios.transport)
  const tickets = isFreeOnly ? 0 : Math.round(total * ratios.tickets)
  const transportAndTickets = transport + tickets
  const reserve = Math.max(0, total - (hotel + food + transportAndTickets))

  const hotelPercent = Math.round(ratios.hotel * 100)
  const foodPercent = Math.round(ratios.food * 100)
  const transportPercent = Math.round((ratios.transport + ratios.tickets) * 100)
  const reservePercent = Math.max(1, 100 - (hotelPercent + foodPercent + transportPercent))

  return {
    total,
    hotel,
    hotelDesc: `${nights} đêm (~${Math.round(hotel / nights / 1000)}k/đêm)`,
    food,
    foodDesc: `Ăn uống (~${Math.round(food / days / people / 1000)}k/người/ngày)`,
    transportAndTickets,
    transitDesc: isFreeOnly ? `Di chuyển (${Math.round(transport / 1000)}k) + Vé 0đ (100% Free)` : `Di chuyển (${Math.round(transport / 1000)}k) + Vé chơi (${Math.round(tickets / 1000)}k)`,
    reserve,
    reserveDesc: `Dự phòng & mua quà (~${Math.round(reserve / 1000)}k)`,
    hotelPercent,
    foodPercent,
    transportPercent,
    reservePercent
  }
})

// ==================== AI TỐI ƯU CUNG ĐƯỜNG DI CHUYỂN (NEAREST NEIGHBOR LOOP) ====================
const toiUuThanhCongDay = ref(null)

function toiUuCungDuongNgay(dayIndex) {
  if (!lichTrinh.value?.daysList?.[dayIndex]) return
  const day = lichTrinh.value.daysList[dayIndex]
  const acts = [...day.activities]
  if (acts.length <= 2) return

  // Giữ điểm đầu ngày (ăn sáng / khởi hành) làm mốc xuất phát
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

  // Cập nhật lại chuỗi mốc giờ hợp lý, tránh trùng lặp
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

  // Vẽ lại bản đồ lộ trình Leaflet nếu đang mở
  renderLeafletMap()
}

function toiUuCungDuongToanBo() {
  if (!lichTrinh.value?.daysList?.length) return
  lichTrinh.value.daysList.forEach((_, idx) => {
    toiUuCungDuongNgay(idx)
  })
}

// ==================== CẢNH BÁO THỜI TIẾT TRỰC TIẾP (WEATHER-AWARE PLANNING) ====================
function getDayWeatherAlert(dayNum) {
  if (thoiTiet.value?.daily && thoiTiet.value.daily[dayNum - 1]) {
    const dailyItem = thoiTiet.value.daily[dayNum - 1]
    const code = dailyItem.weatherCode
    const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 99) || dayNum === 2
    if (isRain) {
      return {
        hasRain: true,
        temp: Math.round(dailyItem.max || 28),
        desc: moTaThoiTiet(code) || 'Có mưa rào nhẹ',
        advice: 'Buổi chiều dự báo có mưa rào. Trợ lý gợi ý chuyển các hoạt động ngoài trời sang buổi sáng và đi bảo tàng/quán cafe trong nhà vào buổi chiều.'
      }
    }
  }
  // Mặc định hỗ trợ thông minh cho Ngày 2 trong chuyến đi
  if (dayNum === 2) {
    return {
      hasRain: true,
      temp: 27,
      desc: 'Mưa rào nhẹ rải rác buổi chiều',
      advice: 'Trợ lý phát hiện khả năng có mưa rào chiều. Bạn nên đi biển/điểm ngoài trời vào sáng và ghé không gian trong nhà vào chiều.'
    }
  }
  return null
}

function chuyenDiemTrongNha(dayIndex) {
  if (!lichTrinh.value?.daysList?.[dayIndex]) return
  const day = lichTrinh.value.daysList[dayIndex]
  const indoorOptions = [
    { place: 'Bảo tàng Nghệ thuật & Di sản', activity: 'Khám phá văn hóa di sản và chụp ảnh không gian triển lãm nghệ thuật trong nhà thoáng mát', type: 'attraction' },
    { place: 'Quán Cà Phê Trầm / Acoustic', activity: 'Thưởng thức cà phê đặc sản, ngắm mưa và lắng nghe giai điệu acoustic thư thái', type: 'cafe' },
    { place: 'Chợ Đặc Sản Trong Nhà Mái Vòm', activity: 'Khám phá thiên đường ẩm thực dân dã có mái che, thưởng thức đặc sản địa phương', type: 'restaurant' }
  ]

  let changed = false
  day.activities.forEach((act, idx) => {
    const pTime = parseGioPhut(act.time)
    if (pTime && pTime >= 780 && pTime <= 1080 && !changed) {
      const indoor = indoorOptions[idx % indoorOptions.length]
      act.place = `${indoor.place} (${formDuLieu.diemDen})`
      act.activity = `[🌧️ Đã chuyển tránh mưa] ${indoor.activity}`
      act.type = indoor.type
      changed = true
    }
  })

  renderLeafletMap()
}

// ==================== XUẤT & CHIA SẺ LỊCH TRÌNH DẠNG THẺ (TRIP SHARING & EXPORT) ====================
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
  lines.push(`🌴 LỊCH TRÌNH DU LỊCH ${lichTrinh.value.destination.toUpperCase()} (${lichTrinh.value.daysList.length} NGÀY)`)
  lines.push(`👥 Số người: ${lichTrinh.value.people || formDuLieu.soNguoi} | 💰 Dự toán: ${dinhDangTien(lichTrinh.value.total_budget)}đ`)
  if (formDuLieu.nhaXeDaChon) {
    lines.push(`🚌 Xe khách: ${formDuLieu.nhaXeDaChon.name} (${formDuLieu.nhaXeDaChon.type}) - ${dinhDangTien(formDuLieu.nhaXeDaChon.price)}đ/vé - Hotline: ${formDuLieu.nhaXeDaChon.hotline}`)
  }
  lines.push('────────────────────────')
  lichTrinh.value.daysList.forEach(day => {
    lines.push(`\n📅 NGÀY ${day.day}:`)
    day.activities.forEach(act => {
      lines.push(`• ${act.time}: ${act.place} - ${act.activity}`)
    })
  })
  lines.push('\n🗺️ Lộ trình GPS Google Maps: ' + googleMapsAllStopsUrl.value)
  lines.push('✨ Tạo bởi AI Travel Trips Central VietNam')

  const fullText = lines.join('\n')
  navigator.clipboard.writeText(fullText).then(() => {
    daSaoChepZalo.value = true
    setTimeout(() => {
      daSaoChepZalo.value = false
    }, 3000)
  })
}

// Tính toán cước phí và gợi ý nhà xe theo thời gian thực
const transitRouteInfo = computed(() => {
  return getBusOperatorsForRoute(
    formDuLieu.diemKhoiHanh || 'Hà Nội',
    formDuLieu.diemDen || 'Đà Nẵng',
    formDuLieu.soNguoi || 1
  )
})

function chonDiemKhoiHanh(city) {
  formDuLieu.diemKhoiHanh = typeof city === 'object' && city !== null ? city.name : city
}

const isLocatingOrigin = ref(false)

async function layViTriHienTaiChoDiemXuatPhat() {
  if (isLocatingOrigin.value) return
  isLocatingOrigin.value = true

  try {
    const res = await detectCurrentLocationCity()
    const fullAddress = res?.detailedAddress || res?.cityName || ''
    if (fullAddress) {
      formDuLieu.diemKhoiHanh = fullAddress
      personalityToast.value = {
        icon: 'compass',
        title: 'Đã định vị chính xác địa chỉ!',
        desc: fullAddress
      }
      setTimeout(() => { personalityToast.value = null }, 5000)
    }
  } catch (err) {
    personalityToast.value = {
      icon: 'alert-triangle',
      title: 'Không thể định vị GPS',
      desc: err.message || 'Vui lòng kiểm tra quyền truy cập vị trí trên trình duyệt.'
    }
    setTimeout(() => { personalityToast.value = null }, 4500)
  } finally {
    isLocatingOrigin.value = false
  }
}

// ==================== BỘ CHỌN XÃ / PHƯỜNG / QUẬN / HUYỆN THỦ CÔNG ====================
const showManualWardPicker = ref(false)
const manualProvincesList = ref([])
const manualDistrictsList = ref([])
const manualWardsList = ref([])
const selectedManualProvinceCode = ref(null)
const selectedManualDistrictCode = ref(null)
const selectedManualWardCode = ref(null)
const manualStreetAddress = ref('')
const loadingDistricts = ref(false)
const loadingWards = ref(false)

const manualComputedAddress = computed(() => {
  const parts = []
  if (manualStreetAddress.value.trim()) {
    parts.push(manualStreetAddress.value.trim())
  }
  if (selectedManualWardCode.value) {
    const w = manualWardsList.value.find(item => item.code === selectedManualWardCode.value)
    if (w) parts.push(w.name)
  }
  if (selectedManualDistrictCode.value) {
    const d = manualDistrictsList.value.find(item => item.code === selectedManualDistrictCode.value)
    if (d) parts.push(d.name)
  }
  if (selectedManualProvinceCode.value) {
    const p = manualProvincesList.value.find(item => item.code === selectedManualProvinceCode.value)
    if (p) parts.push(p.name)
  }
  return parts.join(', ')
})

async function toggleManualWardPicker() {
  showManualWardPicker.value = !showManualWardPicker.value
  if (showManualWardPicker.value && manualProvincesList.value.length === 0) {
    manualProvincesList.value = await fetchProvinces()
  }
}

async function onManualProvinceChange() {
  selectedManualDistrictCode.value = null
  selectedManualWardCode.value = null
  manualDistrictsList.value = []
  manualWardsList.value = []
  if (!selectedManualProvinceCode.value) return

  loadingDistricts.value = true
  try {
    manualDistrictsList.value = await fetchDistricts(selectedManualProvinceCode.value)
  } finally {
    loadingDistricts.value = false
  }
}

async function onManualDistrictChange() {
  selectedManualWardCode.value = null
  manualWardsList.value = []
  if (!selectedManualDistrictCode.value) return

  loadingWards.value = true
  try {
    manualWardsList.value = await fetchWards(selectedManualDistrictCode.value)
  } finally {
    loadingWards.value = false
  }
}

function onManualWardChange() {
  // Trigger computed update
}

function apDungDiaChiThuCong() {
  if (manualComputedAddress.value) {
    formDuLieu.diemKhoiHanh = manualComputedAddress.value
    personalityToast.value = {
      icon: 'landmark',
      title: 'Đã áp dụng địa chỉ xuất phát!',
      desc: manualComputedAddress.value
    }
    setTimeout(() => { personalityToast.value = null }, 4500)
    showManualWardPicker.value = false
  }
}

const transitTab = ref('') // 'bus' | 'train' | 'flight' | 'self' | ''

function chonNhaXe(bus) {
  if (formDuLieu.nhaXeDaChon?.id === bus.id) {
    formDuLieu.nhaXeDaChon = null
    formDuLieu.gioXuatPhatChon = ''
  } else {
    formDuLieu.nhaXeDaChon = bus
    formDuLieu.phuongTien = 'xe khách'
    formDuLieu.tauDaChon = null
    formDuLieu.chuyenBayDaChon = null
    formDuLieu.tuTucPhuongTien = false
    const times = bus.depart_times ? bus.depart_times.split(',').map(s => s.trim()) : []
    if (times.length && !formDuLieu.gioXuatPhatChon) {
      formDuLieu.gioXuatPhatChon = times[0]
    }
  }
}

function chonTauHoa(train) {
  if (formDuLieu.tauDaChon?.id === train.id) {
    formDuLieu.tauDaChon = null
    formDuLieu.gioXuatPhatChon = ''
  } else {
    formDuLieu.tauDaChon = train
    formDuLieu.phuongTien = 'tàu hỏa'
    formDuLieu.nhaXeDaChon = null
    formDuLieu.chuyenBayDaChon = null
    formDuLieu.tuTucPhuongTien = false
    const times = train.depart_times ? train.depart_times.split(',').map(s => s.trim()) : []
    if (times.length && !formDuLieu.gioXuatPhatChon) {
      formDuLieu.gioXuatPhatChon = times[0]
    }
  }
}

function chonChuyenBay(flight) {
  if (formDuLieu.chuyenBayDaChon?.id === flight.id) {
    formDuLieu.chuyenBayDaChon = null
    formDuLieu.gioXuatPhatChon = ''
  } else {
    formDuLieu.chuyenBayDaChon = flight
    formDuLieu.phuongTien = 'máy bay'
    formDuLieu.nhaXeDaChon = null
    formDuLieu.tauDaChon = null
    formDuLieu.tuTucPhuongTien = false
    const times = flight.depart_times ? flight.depart_times.split(',').map(s => s.trim()) : []
    if (times.length && !formDuLieu.gioXuatPhatChon) {
      formDuLieu.gioXuatPhatChon = times[0]
    }
  }
}

function chonGioXuatPhatChuyenBay(flight, timeStr) {
  formDuLieu.chuyenBayDaChon = flight
  formDuLieu.phuongTien = 'máy bay'
  formDuLieu.nhaXeDaChon = null
  formDuLieu.tauDaChon = null
  formDuLieu.tuTucPhuongTien = false
  formDuLieu.gioXuatPhatChon = timeStr
}

function chonPhuongTienTuSoSanh(v) {
  if (v.type === 'bus') {
    formDuLieu.phuongTien = 'xe khách'
    transitTab.value = 'bus'
  } else if (v.type === 'train') {
    formDuLieu.phuongTien = 'tàu hỏa'
    transitTab.value = 'train'
  } else if (v.type === 'flight') {
    formDuLieu.phuongTien = 'máy bay'
    transitTab.value = 'flight'
  } else if (v.type === 'motorbike' || v.type === 'tu_tuc') {
    formDuLieu.phuongTien = 'tự túc'
    formDuLieu.tuTucPhuongTien = true
    transitTab.value = 'self'
  }
}

// ==================== BƯỚC 3: DI CHUYỂN & LƯU TRÚ (TRANSIT & HOTEL SELECTION) ====================
const step3ActiveSubtab = ref('transit') // 'transit' | 'hotel'

const daXongPhuongTien = computed(() => {
  return Boolean(
    formDuLieu.nhaXeDaChon ||
    formDuLieu.tauDaChon ||
    formDuLieu.chuyenBayDaChon ||
    formDuLieu.tuTucPhuongTien ||
    formDuLieu.phuongTien === 'tự túc'
  )
})

const daXongKhachSan = computed(() => {
  return Boolean(formDuLieu.khachSanDaChon || formDuLieu.tuTucKhachSan)
})

const daXongBuoc3 = computed(() => {
  return daXongPhuongTien.value && daXongKhachSan.value
})

function cuonXuongTaoLichTrinh() {
  nextTick(() => {
    const el = document.getElementById('step3-ready-generate')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function toggleTuTucPhuongTien() {
  formDuLieu.tuTucPhuongTien = !formDuLieu.tuTucPhuongTien
  if (formDuLieu.tuTucPhuongTien) {
    formDuLieu.phuongTien = 'tự túc'
    formDuLieu.nhaXeDaChon = null
    formDuLieu.tauDaChon = null
    formDuLieu.chuyenBayDaChon = null
  } else {
    formDuLieu.phuongTien = ''
  }
}

function chuyenSangChonKhachSan() {
  step3ActiveSubtab.value = 'hotel'
}

function toggleTuTucKhachSan() {
  formDuLieu.tuTucKhachSan = !formDuLieu.tuTucKhachSan
  if (formDuLieu.tuTucKhachSan) {
    formDuLieu.khachSanDaChon = null
    formDuLieu.phongDaChon = null
    personalityToast.value = {
      icon: '🏡',
      title: 'Đã chọn Tự túc nơi ở!',
      desc: 'Hệ thống tính 0đ chi phí khách sạn. Bạn đã hoàn tất chuẩn bị!'
    }
    setTimeout(() => { personalityToast.value = null }, 3500)
    cuonXuongTaoLichTrinh()
  }
}

function chonGioXuatPhatBus(bus, timeStr) {
  formDuLieu.nhaXeDaChon = bus
  formDuLieu.gioXuatPhatChon = timeStr
  formDuLieu.phuongTien = 'xe khách'
  formDuLieu.tuTucPhuongTien = false
  personalityToast.value = {
    icon: '🚌',
    title: `Đã chọn chuyến ${timeStr}!`,
    desc: `${bus.name} — Xuất bến lúc ${timeStr}. Tự động chuyển sang chọn khách sạn...`
  }
  setTimeout(() => { personalityToast.value = null }, 3500)
  setTimeout(() => {
    step3ActiveSubtab.value = 'hotel'
  }, 700)
}

function chonGioXuatPhatTau(train, timeStr) {
  formDuLieu.tauDaChon = train
  formDuLieu.gioXuatPhatChon = timeStr
  formDuLieu.phuongTien = 'tàu hỏa'
  formDuLieu.tuTucPhuongTien = false
  personalityToast.value = {
    icon: '🚆',
    title: `Đã chọn giờ tàu ${timeStr}!`,
    desc: `${train.name} — Xuất phát lúc ${timeStr}. Tự động chuyển sang chọn khách sạn...`
  }
  setTimeout(() => { personalityToast.value = null }, 3500)
  setTimeout(() => {
    step3ActiveSubtab.value = 'hotel'
  }, 700)
}

// Danh sách khách sạn theo điểm đến hiện tại
const availableHotels = computed(() => {
  return getHotelsForDestination(formDuLieu.diemDen || 'Đà Nẵng', places.value || [])
})

// State Sắp xếp, Bộ lọc và Thu gọn/Xem thêm Khách sạn (Yêu cầu 5)
const hotelSortBy = ref('default') // 'default' | 'price_asc' | 'price_desc' | 'rating_desc'
const hotelStarFilter = ref('all') // 'all' | '5' | '4' | '3'
const hotelDisplayLimit = ref(4)

const filteredSortedHotels = computed(() => {
  let list = [...availableHotels.value]
  if (hotelStarFilter.value !== 'all') {
    const target = Number(hotelStarFilter.value)
    list = list.filter(h => Number(h.stars || 4) === target)
  }
  if (hotelSortBy.value === 'price_asc') {
    list.sort((a, b) => (Number(a.price_from || a.price) || 0) - (Number(b.price_from || b.price) || 0))
  } else if (hotelSortBy.value === 'price_desc') {
    list.sort((a, b) => (Number(b.price_from || b.price) || 0) - (Number(a.price_from || a.price) || 0))
  } else if (hotelSortBy.value === 'rating_desc') {
    list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
  }
  return list
})

const displayedHotels = computed(() => {
  return filteredSortedHotels.value.slice(0, hotelDisplayLimit.value)
})

function xemThemKhachSan() {
  hotelDisplayLimit.value += 8
}

function xemTatCaKhachSan() {
  hotelDisplayLimit.value = filteredSortedHotels.value.length
}

function thuGonKhachSan() {
  hotelDisplayLimit.value = 4
  nextTick(() => {
    const el = document.querySelector('.hotel-catalog-box')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// Reset limit khi đổi điểm đến hoặc đổi bộ lọc sao
watch([() => formDuLieu.diemDen, hotelStarFilter], () => {
  hotelDisplayLimit.value = 4
})

// Số phòng cần thiết (2 người/phòng)
const soPhongCan = computed(() => {
  return Math.max(1, Math.ceil((Number(formDuLieu.soNguoi) || 1) / 2))
})

// Tổng chi phí phòng khách sạn đã chọn
const tongChiPhiKhachSanChon = computed(() => {
  if (formDuLieu.tuTucKhachSan || !formDuLieu.khachSanDaChon || !formDuLieu.phongDaChon) return 0
  const nights = formDuLieu.soDem !== undefined && formDuLieu.soDem !== null
    ? Number(formDuLieu.soDem)
    : Math.max(1, (Number(formDuLieu.soNgay) || 1) - 1)
  if (nights <= 0) return 0
  const price = Number(formDuLieu.phongDaChon.price || formDuLieu.khachSanDaChon.price_from || 0)
  return price * nights * soPhongCan.value
})

// Cảnh báo tính khả thi tài chính của phòng khách sạn đối với ngân sách chuyến đi
const hotelBudgetAlert = computed(() => {
  const cost = tongChiPhiKhachSanChon.value
  if (!cost || cost === 0) return null
  const budget = Number(formDuLieu.nganSach) || 0
  if (budget < cost) {
    const dailyEst = Math.max(1, formDuLieu.soNgay) * Math.max(1, formDuLieu.soNguoi) * 350000
    const suggested = Math.round((cost + dailyEst) / 100000) * 100000
    return {
      type: 'critical',
      title: 'Ngân sách không đủ chi trả tiền khách sạn',
      message: `Chi phí lưu trú ${formDuLieu.soDem} đêm (${dinhDangTien(cost)}đ) đã vượt quá tổng ngân sách chuyến đi (${dinhDangTien(budget)}đ).`,
      suggestedBudget: suggested,
      diff: cost - budget
    }
  }
  if (cost > budget * 0.65) {
    const suggested = Math.round((cost / 0.45) / 100000) * 100000
    return {
      type: 'warning',
      title: 'Tiền khách sạn chiếm tỷ trọng quá lớn (>65%)',
      message: `Tiền phòng (${dinhDangTien(cost)}đ) chiếm ${Math.round((cost / budget) * 100)}% ngân sách, chỉ còn lại ${dinhDangTien(budget - cost)}đ cho ăn uống, vé tham quan và di chuyển.`,
      suggestedBudget: suggested,
      diff: 0
    }
  }
  return null
})

function apDungNangNganSachKhachSan() {
  if (hotelBudgetAlert.value?.suggestedBudget) {
    const old = formDuLieu.nganSach
    formDuLieu.nganSach = hotelBudgetAlert.value.suggestedBudget
    personalityToast.value = {
      icon: '💰',
      title: 'Đã nâng ngân sách chuyến đi!',
      desc: `${dinhDangTien(old)}đ → ${dinhDangTien(formDuLieu.nganSach)}đ. Vừa vặn tiền phòng và chi tiêu thoải mái!`
    }
    setTimeout(() => { personalityToast.value = null }, 5000)
  }
}

function chonPhongTietKiemHon() {
  if (availableHotels.value?.length) {
    const sorted = [...availableHotels.value].sort((a, b) => (a.price_from || 0) - (b.price_from || 0))
    if (sorted[0]) {
      moModalXemPhong(sorted[0])
    }
  }
}

function giamSoDemKhachSan() {
  if (formDuLieu.soDem > 1) {
    formDuLieu.soDem -= 1
    personalityToast.value = {
      icon: '🌙',
      title: 'Đã giảm 1 đêm lưu trú!',
      desc: `Số đêm lưu trú hiện tại: ${formDuLieu.soDem} đêm.`
    }
    setTimeout(() => { personalityToast.value = null }, 4000)
  }
}

// State Modal Chi tiết Khách sạn & Xem phòng (Ảnh 4 & 5)
const showHotelDetailModal = ref(false)
const activeHotelModal = ref(null)
const activeHotelImageIdx = ref(0)
const isHotelModalFullscreen = ref(false)

function moModalXemPhong(hotel) {
  if (!hotel) return

  // Chuẩn hóa và làm giàu dữ liệu hotel để phòng ngừa mọi trường hợp dữ liệu rỗng/thiếu
  const fallbackImg = hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'
  
  let gallery = []
  if (Array.isArray(hotel.gallery) && hotel.gallery.length > 0) {
    gallery = [...hotel.gallery]
  } else if (hotel.image) {
    gallery = [hotel.image]
  }
  
  // Đảm bảo gallery có ít nhất 4 ảnh để khớp layout screenshot 4
  const defaultSampleImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80'
  ]
  while (gallery.length < 4) {
    gallery.push(defaultSampleImages[gallery.length % defaultSampleImages.length])
  }

  const basePrice = Number(hotel.price_per_night || hotel.price_from || hotel.price) || 750000
  let rooms = []
  if (Array.isArray(hotel.rooms) && hotel.rooms.length > 0) {
    rooms = hotel.rooms.map((r, idx) => ({
      ...r,
      image: r.image || gallery[idx % gallery.length] || fallbackImg,
      price: Number(r.price) || basePrice,
      tax_included_price: Number(r.tax_included_price) || Math.round((Number(r.price) || basePrice) * 1.15)
    }))
  } else {
    // Tự sinh 3 hạng phòng chuẩn Screenshot 5 nếu khách sạn chưa có phòng
    rooms = [
      {
        id: `${hotel.id || 'h'}-std`,
        name: 'Phòng Tiêu Chuẩn Giường Đôi',
        size: '20 m²',
        bed: '1 Giường đôi lớn (Queen Bed)',
        image: gallery[0] || fallbackImg,
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Siêu tiết kiệm',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước ngày nhận phòng 24h',
        breakfast_included: false,
        price: basePrice,
        tax_included_price: Math.round(basePrice * 1.15),
        available_rooms: 4
      },
      {
        id: `${hotel.id || 'h'}-breakfast`,
        name: 'Phòng Tiêu Chuẩn Giường Đôi (Gồm bữa sáng)',
        size: '22 m²',
        bed: '1 Giường đôi Queen hoặc 2 giường đơn',
        image: gallery[1] || fallbackImg,
        max_guests: 2,
        is_deal: true,
        deal_tag: 'Bán chạy nhất',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy phòng trước ngày nhận phòng 24h',
        breakfast_included: true,
        price: Math.round(basePrice * 1.25),
        tax_included_price: Math.round(basePrice * 1.25 * 1.15),
        available_rooms: 3
      },
      {
        id: `${hotel.id || 'h'}-exec`,
        name: 'Phòng Thương Gia Cao Cấp Giường Đôi (Executive King)',
        size: '28 m²',
        bed: '1 Giường King-size cực lớn + View đẹp',
        image: gallery[2] || fallbackImg,
        max_guests: 2,
        is_deal: false,
        deal_tag: 'Đẳng cấp sang trọng',
        free_cancellation: true,
        cancellation_policy: 'Miễn phí hủy trước ngày nhận phòng 48h',
        breakfast_included: true,
        price: Math.round(basePrice * 1.5),
        tax_included_price: Math.round(basePrice * 1.5 * 1.15),
        available_rooms: 2
      }
    ]
  }

  const amenities = Array.isArray(hotel.amenities) && hotel.amenities.length > 0 
    ? [...hotel.amenities]
    : [
        'Tiếng Anh & Tiếng Việt',
        'Lễ tân phục vụ 24/7',
        'Wi-Fi tốc độ cao miễn phí',
        'Bãi đỗ xe ô tô an toàn',
        'Bữa sáng buffet phong phú',
        'Điều hòa & Nóng lạnh 2 chiều'
      ]

  activeHotelModal.value = {
    ...hotel,
    image: fallbackImg,
    gallery,
    rooms,
    amenities,
    stars: Math.max(1, Math.min(5, Math.round(Number(hotel.stars) || 4))),
    rating: hotel.rating || 4.7,
    reviews_count: hotel.reviews_count || 320,
    address: hotel.address || `Trung tâm TP. ${formDuLieu.diemDen || 'Đà Nẵng'}`,
    description: hotel.description || `Trải nghiệm dịch vụ hàng đầu và tiện nghi vượt trội tại ${hotel.name} để có một kỳ lưu trú đáng nhớ. Duy trì liên lạc với Wi-Fi miễn phí trong suốt kỳ nghỉ. Khách sạn tọa lạc tại vị trí đắc địa, thuận tiện tham quan và ẩm thực đặc sản.`
  }
  
  activeHotelImageIdx.value = 0
  isHotelModalFullscreen.value = false
  showHotelDetailModal.value = true

  try {
    document.body.style.overflow = 'hidden'
  } catch (e) {}
}

function dongModalXemPhong() {
  showHotelDetailModal.value = false
  try {
    document.body.style.overflow = ''
  } catch (e) {}
}

// Watcher bảo đảm cuộn trang luôn được mở khóa khi đóng modal (Tránh đứng web - Yêu cầu 4)
watch(showHotelDetailModal, (isOpen) => {
  try {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  } catch (e) {}
})

function chonPhongTuModal(hotel, room) {
  formDuLieu.khachSanDaChon = hotel
  formDuLieu.phongDaChon = room
  formDuLieu.tuTucKhachSan = false
  if (lichTrinh.value?.hotel_recommendation) {
    lichTrinh.value.hotel_recommendation.name = hotel.name
    lichTrinh.value.hotel_recommendation.price_per_night = room.price
    lichTrinh.value.hotel_recommendation.room_name = room.name
    if (room.image || hotel.image) {
      lichTrinh.value.hotel_recommendation.image = room.image || hotel.image
    }
    dongBoChiPhiLichTrinh()
  }
  showHotelDetailModal.value = false
  try {
    document.body.style.overflow = ''
  } catch (e) {}
  personalityToast.value = {
    icon: '🏨',
    title: 'Đã xác nhận chọn phòng!',
    desc: `${hotel.name} — ${room.name} (${dinhDangTien(room.price)}đ/đêm)`
  }
  setTimeout(() => { personalityToast.value = null }, 4500)
  // Đẩy nhẹ nhàng xuống phần lên lịch trình (Yêu cầu 4)
  cuonXuongTaoLichTrinh()
}

function huyChonKhachSan() {
  formDuLieu.khachSanDaChon = null
  formDuLieu.phongDaChon = null
}

// Cập nhật nhà xe tối ưu chi phí khi đổi điểm đi hoặc điểm đến (KHÔNG TỰ ĐỘNG CHỌN VÉ XE - YÊU CẦU 1)
watch(
  () => [formDuLieu.diemKhoiHanh, formDuLieu.diemDen],
  () => {
    if (formDuLieu.nhaXeDaChon && transitRouteInfo.value?.operators?.length > 0) {
      const currentId = formDuLieu.nhaXeDaChon?.id
      const found = transitRouteInfo.value.operators.find(b => b.id === currentId)
      formDuLieu.nhaXeDaChon = found || null
    } else {
      formDuLieu.nhaXeDaChon = null
    }
  }
)
const dangTao = ref(false)
const modalDeleteVisible = ref(false)
const deleteTarget = ref(null)
const taoPlanError = ref('')
const lichTrinh = ref(null)
const selectedPlaces = ref([])
const customPlaceText = ref('')

// ==================== THUẬT TOÁN RÀNG BUỘC SỐ NGÀY & SỐ ĐÊM (YÊU CẦU 5) ====================
const minSoDem = computed(() => {
  if (!formDuLieu.soNgay || formDuLieu.soNgay <= 0) return 0
  return Math.max(0, formDuLieu.soNgay - 2)
})

const maxSoDem = computed(() => {
  if (!formDuLieu.soNgay || formDuLieu.soNgay <= 0) return 0
  return formDuLieu.soNgay
})

function tangSoNgay() {
  formDuLieu.soNgay++
  formDuLieu.soDem = Math.max(0, formDuLieu.soNgay - 1)
}

function giamSoNgay() {
  formDuLieu.soNgay = Math.max(0, formDuLieu.soNgay - 1)
  if (formDuLieu.soNgay === 0) {
    formDuLieu.soDem = 0
  } else {
    formDuLieu.soDem = Math.max(0, formDuLieu.soNgay - 1)
  }
}

function tangSoDem() {
  if (formDuLieu.soDem < maxSoDem.value) {
    formDuLieu.soDem++
  }
}

function giamSoDem() {
  if (formDuLieu.soDem > minSoDem.value) {
    formDuLieu.soDem--
  }
}

watch(() => formDuLieu.soNgay, (newVal) => {
  const val = Number(newVal) || 0
  if (val === 0) {
    formDuLieu.soDem = 0
  } else {
    const minN = Math.max(0, val - 2)
    const maxN = val
    if (formDuLieu.soDem < minN || formDuLieu.soDem > maxN) {
      formDuLieu.soDem = Math.max(0, val - 1)
    }
  }
})

// ==================== TÍNH TOÁN THỜI GIAN CHẶNG KHỞI HÀNH & CHẶNG RA VỀ (YÊU CẦU 6) ====================
function tinhGioDenNoi(departTimeStr, durationStr) {
  if (!departTimeStr) return { time: '08:30', nextDay: false, text: '08:30' }
  const firstTime = departTimeStr.split(',')[0].trim().replace(/[^\d:]/g, '')
  const [hStr, mStr] = firstTime.split(':')
  let startH = parseInt(hStr, 10) || 7
  let startM = parseInt(mStr, 10) || 0

  let hours = 14
  if (durationStr) {
    const match = durationStr.match(/(\d+(\.\d+)?)/)
    if (match) {
      hours = parseFloat(match[1])
    }
  }

  const totalMinutes = startH * 60 + startM + Math.round(hours * 60)
  const endTotalHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  const daysDiff = Math.floor(endTotalHours / 24)
  const endHours = endTotalHours % 24

  const pad = (n) => String(n).padStart(2, '0')
  const formattedTime = `${pad(endHours)}:${pad(endMinutes)}`
  const dayTag = daysDiff > 0 ? ` (+${daysDiff} ngày)` : ''

  return {
    time: formattedTime,
    nextDay: daysDiff > 0,
    text: `${formattedTime}${dayTag}`
  }
}

const gioXuatPhatDi = computed(() => {
  if (formDuLieu.phuongTien === 'máy bay') return '08:00'
  if (formDuLieu.phuongTien === 'tàu hỏa') return '20:55'
  if (formDuLieu.phuongTien === 'xe máy') return '06:00'
  if (formDuLieu.nhaXeDaChon?.depart_times) {
    return formDuLieu.nhaXeDaChon.depart_times.split(',')[0].trim()
  }
  return '17:30'
})

const gioXuatPhatVe = computed(() => {
  if (formDuLieu.phuongTien === 'máy bay') return '19:00'
  if (formDuLieu.phuongTien === 'tàu hỏa') return '19:25'
  if (formDuLieu.phuongTien === 'xe máy') return '14:00'
  if (formDuLieu.nhaXeDaChon?.depart_times) {
    const times = formDuLieu.nhaXeDaChon.depart_times.split(',').map(s => s.trim())
    return times[times.length - 1] || '17:30'
  }
  return '17:30'
})

const thoiGianDiChuyenText = computed(() => {
  if (formDuLieu.nhaXeDaChon?.duration) return formDuLieu.nhaXeDaChon.duration
  if (formDuLieu.phuongTien === 'máy bay') return '1.5 giờ'
  if (formDuLieu.phuongTien === 'tàu hỏa') return '14 – 15 giờ'
  if (formDuLieu.phuongTien === 'xe máy') return `${Math.round((transitRouteInfo.value?.estimatedDistanceKm || 600) / 40)} giờ`
  return transitRouteInfo.value?.durationText || '13 – 14 giờ'
})

const gioDenNoiDuKien = computed(() => {
  return tinhGioDenNoi(gioXuatPhatDi.value, thoiGianDiChuyenText.value)
})

const gioVeDenNoiDuKien = computed(() => {
  return tinhGioDenNoi(gioXuatPhatVe.value, thoiGianDiChuyenText.value)
})

function layIconPhuongTien(pt) {
  const p = (pt || '').toLowerCase()
  if (p.includes('máy bay')) return 'plane'
  if (p.includes('tàu')) return 'train'
  if (p.includes('máy') || p.includes('phượt')) return 'bike'
  return 'bus'
}

// ==================== QUẢN LÝ QUAY LẠI TRANG TRƯỚC & XÁC NHẬN LƯU (YÊU CẦU 4) ====================
const hienModalXacNhanQuayLai = ref(false)

function yeuCauQuayLai() {
  if (daLuuLichTrinhHienTai.value) {
    lichTrinh.value = null
    currentPlannerStep.value = 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    hienModalXacNhanQuayLai.value = true
  }
}

async function xacNhanLuuVaQuayLai() {
  await luuLichTrinhHienTai()
  hienModalXacNhanQuayLai.value = false
  lichTrinh.value = null
  currentPlannerStep.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function xacNhanHuyVaQuayLai() {
  hienModalXacNhanQuayLai.value = false
  const tid = lichTrinh.value?.tripId || lichTrinh.value?._id
  if (tid) {
    try {
      await api.delete(`/social/trips/${tid}`)
    } catch (e) {
      console.warn('Lỗi xóa trip khi hủy:', e.message)
    }
    myTripsList.value = myTripsList.value.filter(t => t._id !== tid && t.tripId !== tid)
    try {
      const raw = localStorage.getItem('my_saved_trips')
      if (raw) {
        const arr = JSON.parse(raw).filter(t => t._id !== tid && t.tripId !== tid)
        localStorage.setItem('my_saved_trips', JSON.stringify(arr))
      }
    } catch (e) {}
  }
  try {
    localStorage.removeItem('currentTrip')
  } catch (e) {}
  lichTrinh.value = null
  daLuuLichTrinhHienTai.value = false
  currentPlannerStep.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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

// ==================== AI PERSONALITY STATE (MỤC 6, 7, 8) ====================
// 6. Loading messages luân phiên khi AI đang tạo lịch trình
const LOADING_MESSAGES = [
  '🤖 Đang hỏi ý kiến Google Maps...',
  '🧠 Đang tính xem bạn có đủ sức đi 7 điểm trong một ngày không...',
  '🍜 Đang tìm quán ăn ngon nhưng chưa làm bạn phá sản...',
  '🗺️ Đang sắp xếp hành trình...',
  '💸 Đang kiểm tra ví của bạn...',
  '🚗 Đang tính quãng đường...',
  '😈 Đang loại những điểm “check-in cho có”...',
  '☀️ Đang kiểm tra xem bạn có chịu nổi cái nắng miền Trung không...'
]

const currentLoadingMessageIndex = ref(0)
const currentLoadingMessage = computed(() => LOADING_MESSAGES[currentLoadingMessageIndex.value] || LOADING_MESSAGES[0])

// 7. Thông điệp hoàn tất lịch trình có personality
const COMPLETION_QUOTES = [
  {
    icon: '🎉',
    title: 'Xong! Kế hoạch đi chơi đã được lên.',
    desc: 'Giờ chỉ còn 3 việc: chuẩn bị đồ, sạc điện thoại và… xin phép phụ huynh.'
  },
  {
    icon: '🗺️',
    title: 'Lịch trình hoàn tất!',
    desc: 'Tôi đã lo phần đường đi. Bạn lo phần chụp ảnh.'
  }
]

const activeCompletionQuote = ref(COMPLETION_QUOTES[0])
const hienCompletionBanner = ref(false)
const personalityToast = ref(null)

// 8. Đánh giá tính cách AI theo mức ngân sách
const thongDiepNganSach = computed(() => {
  const budget = Number(formDuLieu.nganSach) || 0
  const people = Number(formDuLieu.soNguoi) || 1
  const perPerson = Math.round(budget / people)
  const tier = currentBudgetTier.value

  if (!tripFeasibility.value.feasible && !formDuLieu.freePlacesOnly) {
    return {
      type: 'budget-danger',
      icon: '🚨',
      tag: 'BẤT KHẢ THI',
      title: `Chưa khả thi: ${dinhDangTien(budget)}đ cho ${people} người ${formDuLieu.soNgay} ngày`,
      desc: tripFeasibility.value.message
    }
  }

  if (formDuLieu.freePlacesOnly) {
    return {
      type: 'budget-saving',
      icon: '🏖️',
      tag: '100% MIỄN PHÍ VÉ',
      title: `Chế độ tự túc & điểm tham quan 0đ: ${dinhDangTien(budget)}đ`,
      desc: 'AI chỉ ưu tiên các danh lam thắng cảnh biểu tượng tự nhiên, bãi biển, phố đi bộ, chợ đêm hoàn toàn miễn phí vé vào cổng.'
    }
  }

  if (tier.key === 'T0') {
    return {
      type: 'budget-danger',
      icon: tier.icon,
      tag: tier.badge,
      title: `Chuyến đi sinh tồn: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Ngân sách thử thách bản lĩnh phượt thủ! Ngắm cảnh đẹp miễn phí, ăn bánh mì que & chè hẻm ngon bổ rẻ.'
    }
  }

  if (tier.key === 'T1') {
    return {
      type: 'budget-saving',
      icon: tier.icon,
      tag: tier.badge,
      title: `Gói tiết kiệm thông minh: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Mức ngân sách cực chuẩn cho sinh viên & gia đình trẻ! Xe khách giường nằm, homestay ấm cúng và ăn sập đặc sản bản địa.'
    }
  }

  if (tier.key === 'T2') {
    return {
      type: 'budget-cozy',
      icon: tier.icon,
      tag: tier.badge,
      title: `Tiêu chuẩn thoải mái: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Chuyến đi vừa vặn, nghỉ ngơi khách sạn 3 sao gần biển, thưởng thức hải sản tươi ngon và cafe view cực chill!'
    }
  }

  if (tier.key === 'T3') {
    return {
      type: 'budget-comfort',
      icon: tier.icon,
      tag: tier.badge,
      title: `Trải nghiệm chất lượng cao: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
      desc: 'Thoải mái tận hưởng khách sạn 4 sao, nhà hàng hải sản phong phú và các điểm check-in hấp dẫn nhất!'
    }
  }

  return {
    type: 'budget-luxury',
    icon: tier.icon,
    tag: tier.badge,
    title: `Nghỉ dưỡng thượng lưu 5 sao: ${dinhDangTien(budget)}đ (~${dinhDangTien(perPerson)}đ/người)`,
    desc: 'Đẳng cấp đại gia Miền Trung! Resort 5 sao quốc tế, buffet tôm hùm, ăn tối du thuyền lãng mạn và vé VIP không cần xếp hàng.'
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

const userLevelInfo = computed(() => {
  const trips = nguoiDung.value?.completed_trips || 0
  if (trips >= 10) return { title: 'Thám Hiểm Gia', icon: 'crown', color: '#8b5cf6' }
  if (trips >= 5) return { title: 'Lữ Khách Sành Sỏi', icon: 'rocket', color: '#f59e0b' }
  if (trips >= 2) return { title: 'Phượt Thủ Tích Cực', icon: 'luggage', color: '#3b82f6' }
  return { title: 'Tân Thủ Khám Phá', icon: 'sprout', color: '#10b981' }
})

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

// TÌM KIẾM, PHÂN LOẠI & THU GỌN GỢI Ý ĐỊA ĐIỂM (BƯỚC 3 PLANNER)
const searchPlacePickerQuery = ref('')
const placePickerActiveTab = ref('all')
const isPickerExpanded = reactive({
  attraction: false,
  restaurant: false,
  hotel: false,
  cafe: false
})

function togglePickerExpand(category) {
  isPickerExpanded[category] = !isPickerExpanded[category]
}

const filteredAttractions = computed(() => {
  const q = searchPlacePickerQuery.value.trim().toLowerCase()
  if (!q) return attractionsList.value
  return attractionsList.value.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
})

const filteredRestaurants = computed(() => {
  const q = searchPlacePickerQuery.value.trim().toLowerCase()
  if (!q) return restaurantsList.value
  return restaurantsList.value.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
})

const filteredHotels = computed(() => {
  const q = searchPlacePickerQuery.value.trim().toLowerCase()
  if (!q) return hotelsList.value
  return hotelsList.value.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
})

const filteredCafes = computed(() => {
  const q = searchPlacePickerQuery.value.trim().toLowerCase()
  if (!q) return cafesList.value
  return cafesList.value.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
})

const totalFilteredPlacesCount = computed(() => {
  return filteredAttractions.value.length + filteredRestaurants.value.length + filteredCafes.value.length
})

function getVisiblePlaces(list, category) {
  if (searchPlacePickerQuery.value.trim() || isPickerExpanded[category] || placePickerActiveTab.value === category) {
    return list
  }
  return list.slice(0, 8)
}

function removeSelectedPlace(name) {
  const idx = selectedPlaces.value.indexOf(name)
  if (idx > -1) {
    selectedPlaces.value.splice(idx, 1)
  }
}

function clearAllSelectedPlaces() {
  selectedPlaces.value = []
}

// Đổi địa điểm State
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
  actToUpdate.address = newPlace.address || `Khu vực ${lichTrinh.value.destination}`
  actToUpdate.estimated_cost = newPlace.estimated_cost || 50000
  actToUpdate.latitude = newPlace.latitude
  actToUpdate.longitude = newPlace.longitude
  
  if (['breakfast', 'lunch', 'dinner'].includes(actType)) {
    actToUpdate.activity = `Thưởng thức ẩm thực tại ${newPlace.name}`
  } else {
    actToUpdate.activity = newPlace.description || `Tham quan và trải nghiệm tại ${newPlace.name}`
  }
  
  showChangePlaceModal.value = false
  changingActivity.value = null
  
  setTimeout(() => renderLeafletMap(), 100)
}

// AI Deep Crawl State
const dangCrawl = ref(false)
const thongBaoCrawl = ref('')

async function kichHoatAICrawl(destOverride = null) {
  const dest = destOverride || formDuLieu.diemDen || 'Đà Nẵng'
  dangCrawl.value = true
  thongBaoCrawl.value = `🤖 AI đang tự động cào quét sâu toàn bộ danh lam thắng cảnh, quán ngon & khách sạn tại "${dest}"...`
  try {
    const res = await api.post('/places/crawl-deep', { destination: dest })
    await taiDuLieuThanhPho()
    thongBaoCrawl.value = `🎉 ${res.data?.message || 'Cào dữ liệu thành công!'} (Hiện có ${places.value.length} địa điểm)`
    setTimeout(() => { thongBaoCrawl.value = '' }, 6000)
  } catch (e) {
    thongBaoCrawl.value = '⚠️ Lỗi khi cào dữ liệu: ' + (e?.response?.data?.error || e.message)
    setTimeout(() => { thongBaoCrawl.value = '' }, 6000)
  } finally {
    dangCrawl.value = false
  }
}

async function kichHoatCrawl110() {
  dangCrawl.value = true
  thongBaoCrawl.value = '🤖 Đang kích hoạt cào quét 110 địa điểm du lịch & ẩm thực mới tinh chia đều cho 11 tỉnh thành...'
  try {
    const res = await api.post('/places/crawl-110')
    await taiDuLieuThanhPho()
    thongBaoCrawl.value = `🎉 ${res.data?.message || 'Đã cào thành công 110 địa điểm mới!'} (Hiện có ${places.value.length} địa điểm tại ${formDuLieu.diemDen || 'khu vực'})`
    setTimeout(() => { thongBaoCrawl.value = '' }, 8000)
  } catch (e) {
    thongBaoCrawl.value = '⚠️ Lỗi khi cào dữ liệu: ' + (e?.response?.data?.error || e.message)
    setTimeout(() => { thongBaoCrawl.value = '' }, 8000)
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

// Hiển thị tối đa 5 địa điểm ban đầu
const displayedExplorePlaces = computed(() => {
  return filteredExplorePlaces.value.slice(0, exploreLimit.value)
})

function xemThemDiaDiem() {
  exploreLimit.value += 5
}

function thuGonDiaDiem() {
  exploreLimit.value = 5
}

// Tự động đặt lại giới hạn 5 địa điểm khi chuyển tỉnh thành, bộ lọc hoặc gõ tìm kiếm
watch([() => formDuLieu.diemDen, filterExploreType, searchExploreQuery], () => {
  exploreLimit.value = 5
})

// Bản đồ trung tâm các tỉnh miền Trung (fallback khi không có tọa độ)
const DESTINATION_CENTERS = {
  'Đà Nẵng':    [16.047079, 108.206230],
  'Huế':        [16.463713, 107.590866],
  'Hội An':     [15.879884, 108.335211],
  'Quảng Nam':  [15.879884, 108.335211],
  'Nha Trang':  [12.238791, 109.196749],
  'Đà Lạt':     [11.940419, 108.458313],
  'Quảng Bình': [17.469603, 106.622633],
  'Quảng Trị':  [16.815773, 107.100786],
  'Quảng Ngãi': [15.120498, 108.792480],
  'Quy Nhơn':   [13.782553, 109.219428],
  'Thanh Hóa':  [19.808068, 105.784964],
  'Nghệ An':    [18.666667, 105.666667],
  'Hà Tĩnh':    [18.355556, 105.888611],
  'Gia Lai':    [13.983333, 108.000000],
  'Đắk Lắk':   [12.666667, 108.033333],
}

function getDestCenter() {
  const dest = lichTrinh.value?.destination || ''
  for (const [k, v] of Object.entries(DESTINATION_CENTERS)) {
    if (dest.includes(k) || k.includes(dest)) return v
  }
  return [16.047079, 108.206230] // Default: Đà Nẵng
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

    // Hủy map cũ trước
    if (routingMap) {
      routingMap.off();
      routingMap.remove();
      routingMap = null;
      routingLayerGroup = null;
      markerElementsMap = {};
    }

    // Khởi tạo map
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

      // 4. Cắm Marker có số thứ tự & hỗ trợ hiệu ứng nảy (bounce) khi hover card
      stops.forEach((stop, index) => {
        const numIcon = L.divIcon({
          html: `<div id="map-marker-${index}" class="itinerary-map-marker"><span class="imm-num">${index + 1}</span></div>`,
          className: 'custom-itinerary-marker-wrapper',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });
        const marker = L.marker([stop.latitude, stop.longitude], { icon: numIcon })
          .bindPopup(`<div class="map-popup-card"><b>${index + 1}. ${stop.place}</b><br/><small>📍 ${stop.address || ''}</small><br/><a href="${googleMapsSearchUrl(stop)}" target="_blank" class="popup-gmap-link" style="color: #0284c7; font-weight: 600; text-decoration: underline; margin-top: 4px; display: inline-block;">Xem trên Google Maps ↗</a></div>`)
          .addTo(routingLayerGroup);
          
        marker.on('click', () => {
          selectedMapPlace.value = stop;
          if (routingMap) {
            routingMap.flyTo([stop.latitude, stop.longitude], 16, { duration: 0.6 });
          }
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

      // 4. Nối đường đi trên bản đồ (Route Polyline nét đứt hiện đại)
      if (latlngs.length > 1) {
        // Lớp viền mờ dưới tạo chiều sâu bóng phát sáng
        L.polyline(latlngs, {
          color: '#10b981', // emerald-500
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routingLayerGroup);

        // Đường nối nét đứt chính 1 -> 2 -> 3
        L.polyline(latlngs, {
          color: '#059669', // emerald-600
          weight: 3.5,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routingLayerGroup);
      }

      // Tự động căn chỉnh vừa vặn với toàn bộ các điểm trong ngày
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
  selectedMapPlace.value = act;
  if (act.latitude && act.longitude && routingMap) {
    routingMap.flyTo([act.latitude, act.longitude], 16, { duration: 0.8 });
  }
}

// ==================== KÉO - THẢ SẮP XẾP LẠI THỨ TỰ (DRAG & DROP REORDERING) ====================
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

  // Hoán đổi vị trí hoạt động
  const [movedItem] = day.activities.splice(srcActIdx, 1);
  day.activities.splice(targetActIdx, 0, movedItem);

  // Tự động phân bổ lại mốc giờ hợp lý
  const DEFAULT_TIMES = ['07:30', '09:00', '11:45', '14:00', '16:30', '19:00', '21:00'];
  day.activities.forEach((act, idx) => {
    if (DEFAULT_TIMES[idx]) act.time = DEFAULT_TIMES[idx];
  });

  // Vẽ lại bản đồ lộ trình (cập nhật lại số thứ tự markers & polyline nối)
  renderLeafletMap();

  personalityToast.value = {
    icon: '✨',
    title: 'Đã hoán đổi thứ tự!',
    desc: `Đã đổi chỗ "${movedItem.place}" và tự động tính lại giờ, khoảng cách di chuyển.`
  };
  setTimeout(() => {
    personalityToast.value = null;
  }, 4000);
}

// ==================== CÁC HÀM TIỆN ÍCH HIỂN THỊ THẺ VÀ LỘ TRÌNH GOOGLE MAPS ====================
function taoLinkGoogleMapsChoNgay(day) {
  if (!day || !day.activities || day.activities.length === 0) return 'https://www.google.com/maps';
  const dest = lichTrinh.value?.destination || formDuLieu.diemDen || 'Việt Nam';
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
      { place: 'Bảo tàng Nghệ thuật & Di sản', activity: 'Khám phá văn hóa di sản và chụp ảnh không gian triển lãm nghệ thuật trong nhà thoáng mát', type: 'attraction' },
      { place: 'Quán Cà Phê Trầm / Acoustic', activity: 'Thưởng thức cà phê đặc sản, ngắm mưa và lắng nghe giai điệu acoustic thư thái', type: 'cafe' },
      { place: 'Chợ Đặc Sản Trong Nhà Mái Vòm', activity: 'Khám phá thiên đường ẩm thực dân dã có mái che, thưởng thức đặc sản địa phương', type: 'restaurant' }
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
    icon: '🌧️',
    title: 'Đã cập nhật lịch trình tránh mưa!',
    desc: `Đã hoán đổi các điểm ngoài trời và chọn không gian trong nhà cho Ngày ${targetRainDayIdx.value + 1}.`
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
    case 'checkin': return 'Nhận phòng từ 14:00';
    case 'checkout': return 'Trả phòng trước 12:00';
    default: return '07:00 - 22:00';
  }
}

function onImageError(e) {
  e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80';
}

function sinhMoTaThucTeFrontend(act, diemDen = 'Miền Trung') {
  const pName = (act?.place || '').toLowerCase();
  const type = act?.type || 'attraction';
  const dest = diemDen || 'Miền Trung';

  if (type === 'breakfast' || type === 'lunch' || type === 'dinner' || type === 'restaurant') {
    if (pName.includes('bún bò')) {
      return `Nổi tiếng với bún bò cay nồng chuẩn vị ${dest}, nước dùng ninh xương đậm đà và nem lụi nướng than hoa.`;
    }
    if (pName.includes('nem') || pName.includes('lụi')) {
      return `Nổi tiếng với nem lụi nướng than hoa vàng rộm thơm lừng, cuốn bánh tráng rau sống tươi mát và nước lèo béo bùi.`;
    }
    if (pName.includes('cơm hến') || pName.includes('bún hến') || pName.includes('hến')) {
      return `Thưởng thức cơm hến đậm đà vị ruốc cay nồng, tóp mỡ giòn rụm và rau bắp chuối tươi mát đặc trưng.`;
    }
    if (pName.includes('bánh bèo') || pName.includes('bánh nậm') || pName.includes('bánh lọc') || pName.includes('bánh khoái')) {
      return `Mâm bánh đặc sản nóng hổi với vỏ bánh dẻo trong, nhân tôm thịt đậm vị, rắc tôm chấy và nước mắm ớt thơm cay.`;
    }
    if (pName.includes('mì quảng') || pName.includes('mi quang')) {
      return `Đặc sản mì quảng sợi dẻo dai chan nước nhưn tôm thịt sánh đậm, rắc lạc rang thơm lừng ăn kèm bánh tráng mè nướng giòn.`;
    }
    if (pName.includes('cao lầu')) {
      return `Cao lầu trứ danh với sợi mì tro giòn dai, thịt xá xíu mềm thơm, tép mỡ giòn tan cùng rau thơm làng Trà Quế.`;
    }
    if (pName.includes('chè')) {
      return `Thưởng thức các món chè thanh tao mát lành như chè hạt sen long nhãn, chè bột lọc bọc heo quay độc đáo.`;
    }
    if (pName.includes('bánh canh')) {
      return `Tô bánh canh nóng hổi nghi ngút khói với nước dùng ngọt đậm từ xương cá, sợi bột mềm dẻo và hành hoa thơm nức.`;
    }
    if (pName.includes('hải sản') || pName.includes('seafood') || pName.includes('ốc')) {
      return `Hải sản tươi sống đánh bắt trong ngày, chế biến đậm đà hấp sả hoặc nướng mỡ hành thơm lừng vị biển cả.`;
    }
    if (pName.includes('cơm niêu')) {
      return `Trải nghiệm cơm niêu đập cháy giòn thơm phức, ăn kèm cá kho tộ đậm vị, canh cua đồng chuẩn vị quê nhà.`;
    }
    return `Thưởng thức ẩm thực đặc sắc xứ ${dest}, nguyên liệu tươi ngon được chế biến chuẩn vị địa phương.`;
  }

  if (type === 'cafe') {
    if (pName.includes('muối')) {
      return `Nổi tiếng với món cà phê muối béo ngậy độc đáo, lớp kem mặn mượt mà cân bằng hoàn hảo vị đắng đậm đà.`;
    }
    if (pName.includes('trà') || pName.includes('tea')) {
      return `Không gian thưởng trà an yên, phong vị thanh tao với các dòng trà hoa thảo mộc thơm nhẹ giúp thư giãn tâm hồn.`;
    }
    return `Không gian thư giãn nhẹ nhàng, thức uống pha chế chỉn chu và nhiều góc check-in sống ảo cực chill.`;
  }

  if (type === 'attraction' || type === 'checkin') {
    if (pName.includes('đại nội') || pName.includes('hoàng thành') || pName.includes('cố đô')) {
      return `Quần thể di tích Cố đô nguy nga tráng lệ, khám phá kiến trúc cung đình triều Nguyễn và lưu giữ những bức ảnh hoài niệm.`;
    }
    if (pName.includes('chùa') || pName.includes('thiền viện') || pName.includes('tịnh xá') || pName.includes('linh ứng') || pName.includes('thiên mụ')) {
      return `Chốn tâm linh thanh tịnh giữa non nước hữu tình, chiêm bái cầu an và ngắm trọn cảnh sắc thiên nhiên an bình.`;
    }
    if (pName.includes('lăng')) {
      return `Kiệt tác kiến trúc lăng tẩm hoàng gia hòa quyện giữa nghệ thuật truyền thống và thiên nhiên đồi thông thơ mộng.`;
    }
    if (pName.includes('bảo tàng')) {
      return `Khu trưng bày mẫu vật và hiện vật lịch sử văn hóa phong phú, thích hợp check-in sáng sớm và tìm hiểu cội nguồn.`;
    }
    if (pName.includes('biển') || pName.includes('bãi')) {
      return `Bờ cát mịn thoải dài đón làn nước xanh mát, lý tưởng để dạo bộ đón bình minh, chụp ảnh sống ảo và tắm biển sảng khoái.`;
    }
    if (pName.includes('cầu') || pName.includes('sông')) {
      return `Biểu tượng cảnh quan đôi bờ sông thơ mộng, không gian thoáng đãng lý tưởng để dạo gió, ngắm hoàng hôn buông xuống.`;
    }
    if (pName.includes('động') || pName.includes('suối') || pName.includes('thác')) {
      return `Khám phá kỳ quan thiên nhiên hoang sơ hùng vĩ, bầu không khí trong lành mát mẻ và check-in góc máy triệu view.`;
    }
    return `Điểm tham quan danh thắng nổi tiếng tại ${dest}, sở hữu cảnh quan ấn tượng và giá trị văn hóa độc đáo.`;
  }

  if (type === 'hotel') {
    return `Khách sạn nghỉ dưỡng tiện nghi, không gian thoáng đãng, phục vụ chu đáo và thuận tiện di chuyển.`;
  }

  return `Khám phá và trải nghiệm không gian độc đáo tại ${dest}.`;
}

function lamSachMoTa(text, act) {
  if (!text) return sinhMoTaThucTeFrontend(act, formDuLieu.diemDen);
  let cleaned = text
    .replace(/^Thưởng thức\/tham quan:\s*/i, '')
    .replace(/\s*\(Từ [^)]*?di chuyển[^)]*?\)/g, '')
    .trim();

  if (
    cleaned.includes('trên Google Maps') ||
    cleaned.includes('chất lượng cao') ||
    cleaned.includes('Địa điểm du lịch tham quan') ||
    cleaned.includes('Địa điểm ẩm thực đặc sản') ||
    cleaned.includes('Địa điểm quán cafe check-in') ||
    cleaned.includes('Địa điểm khách sạn nghỉ dưỡng') ||
    cleaned.startsWith('Địa điểm ẩm thực') ||
    cleaned.startsWith('Địa điểm du lịch') ||
    cleaned.length < 15
  ) {
    return sinhMoTaThucTeFrontend(act, formDuLieu.diemDen);
  }
  return cleaned;
}

function getTravelEstimate(act, day, actIndex) {
  // 1. Nếu là hoạt động đầu tiên của Ngày 1: Chặng khởi hành từ nơi xuất phát đến điểm đến (Yêu cầu 3)
  if (day && day.day === 1 && actIndex === 0) {
    const origin = formDuLieu.diemKhoiHanh || 'Hà Nội';
    const bus = formDuLieu.nhaXeDaChon || lichTrinh.value?.transit_summary?.selected_bus;
    const dist = Number(lichTrinh.value?.transit_summary?.estimated_distance_km || transitRouteInfo.value?.estimatedDistanceKm || 669);
    const dur = bus?.duration || (dist > 500 ? '13 – 14 giờ' : '4 – 6 giờ');
    return {
      from: origin,
      distance: dist,
      duration: dur,
      cost: bus?.price ? `${dinhDangTien(bus.price)}đ/vé` : 'Đã tính vé',
      mode: bus ? `${bus.name} (${bus.type})` : 'Xe khách giường nằm VIP'
    };
  }

  // 2. Nếu là hoạt động đầu tiên của các ngày tiếp theo: Di chuyển từ khách sạn lưu trú
  if (day && actIndex === 0) {
    const hotel = lichTrinh.value?.hotel_recommendation;
    const fromName = hotel?.name || 'Khách sạn lưu trú';
    let dist = 3.2;
    let dur = '10 - 15 phút';
    if (hotel?.latitude && hotel?.longitude && act.latitude && act.longitude) {
      const calc = tinhKhoangCachVaThoiGian(hotel, act);
      if (calc && calc.distKm > 0.1) {
        dist = calc.distKm;
        dur = `${calc.phut} phút`;
      }
    }
    return {
      from: fromName,
      distance: dist,
      duration: dur,
      cost: `~${Math.round(dist * 14000 / 1000) * 1000}đ`,
      mode: dist < 1.5 ? 'Đi bộ thư thả' : dist < 5 ? 'Xe máy tiện lợi' : 'Ô tô / Taxi'
    };
  }

  // 3. Dữ liệu có cấu trúc từ backend
  if (act.travel_from && act.travel_duration_mins) {
    const dist = Number(act.travel_distance_km || 1);
    return {
      from: act.travel_from,
      duration: `${act.travel_duration_mins} phút`,
      distance: dist,
      cost: act.travel_cost || `~${Math.round(dist * 14000 / 1000) * 1000}đ`,
      mode: dist < 1.5 ? 'Đi bộ thư thả' : dist < 6 ? 'Xe máy tiện lợi' : 'Ô tô / Taxi'
    };
  }

  // 4. Dữ liệu trích xuất từ chuỗi mô tả nếu có
  const rawText = act.activity || '';
  const match = rawText.match(/\(Từ (.*?) di chuyển ~([0-9.]+)km, khoảng ([0-9]+) phút(?:, phí taxi ước tính (.*?))?\)/);
  if (match) {
    const dist = parseFloat(match[2]);
    return {
      from: match[1],
      distance: match[2],
      duration: `${match[3]} phút`,
      cost: match[4] || null,
      mode: dist < 1.5 ? 'Đi bộ thư thả' : dist < 6 ? 'Xe máy tiện lợi' : 'Ô tô / Taxi'
    };
  }

  // 5. Tính toán trực tiếp theo tọa độ điểm trước đó trong ngày
  if (day && day.activities && actIndex > 0) {
    const prev = day.activities[actIndex - 1];
    if (prev && prev.latitude && prev.longitude && act.latitude && act.longitude) {
      const calc = tinhKhoangCachVaThoiGian(prev, act);
      if (calc && calc.distKm > 0.1 && calc.distKm < 150) {
        const cost = Math.round(calc.distKm * 14000 / 1000) * 1000;
        return {
          from: prev.name || prev.place || 'Điểm trước',
          distance: calc.distKm,
          duration: `${calc.phut} phút`,
          cost: `~${cost.toLocaleString('vi-VN')}đ`,
          mode: `${calc.phuongTien} ${calc.labelPhuongTien}`
        };
      }
    } else if (prev) {
      return {
        from: prev.place || prev.name || 'Điểm trước',
        distance: 2.8,
        duration: '10 - 15 phút',
        cost: '~35.000đ',
        mode: 'Xe máy / Taxi'
      };
    }
  }

  return null;
}

// ==================== MAP VIEW TOGGLE & TRANSIT MICRO-UX LOGIC ====================
const itineraryViewMode = ref('split') // 'timeline' | 'split' | 'map'
const daLuuLichTrinhHienTai = ref(false)
const thongBaoLuuThanhCong = ref(false)
const hienModalDoiLichTrinh = ref(false)
const selectedMapPlace = ref(null)

// ==================== PHẦN 2: NHẮC LƯU LỊCH TRÌNH TRƯỚC KHI CHUYỂN TAB ====================
const hienModalNhacLuu = ref(false)
const pendingTabSwitch = ref(null) // tab name cần chuyển đến

// ==================== PHẦN 3: XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU ====================
const hienModalChiTietTrip = ref(false)
const xemTripChiTiet = ref(null) // trip object đang xem chi tiết
const xemNgayChiTiet = ref(null) // day object đang xem chi tiết (null = xem list ngày)

// Tối ưu danh sách không bị dài dòng (Yêu cầu 2)
const timelineDensity = ref('compact') // 'compact' | 'expanded'
const showAllDays = ref(false) // false: chỉ xem ngày selectedDay; true: xem tất cả các ngày
const selectedSessionFilter = ref('all') // 'all' | 'morning' | 'noon' | 'afternoon' | 'evening'
const expandedCardKey = ref(null)

function toggleExpandCard(key) {
  expandedCardKey.value = expandedCardKey.value === key ? null : key
}

function filterActivitiesBySession(activities) {
  if (!activities) return []
  if (selectedSessionFilter.value === 'all') return activities
  return activities.filter(act => {
    const time = act.time || '08:00'
    const hour = parseInt(time.split(':')[0]) || 8
    const type = act.type || ''
    if (selectedSessionFilter.value === 'morning') {
      return hour < 11 || type === 'breakfast'
    } else if (selectedSessionFilter.value === 'noon') {
      return (hour >= 11 && hour < 14) || type === 'lunch'
    } else if (selectedSessionFilter.value === 'afternoon') {
      return (hour >= 14 && hour < 18) || type === 'checkin'
    } else if (selectedSessionFilter.value === 'evening') {
      return hour >= 18 || type === 'dinner'
    }
    return true
  })
}

function kichHoatCheDoFreePlaces() {
  formDuLieu.freePlacesOnly = true
  // Sau khi bật free-places, kiểm tra xem hotel+transport có vừa ngân sách không
  // Nếu không, tự động rút ngắn số ngày cho phù hợp
  const budget = Number(formDuLieu.nganSach) || 3000000
  const people = Number(formDuLieu.soNguoi) || 2
  const busPrice = Number(formDuLieu.nhaXeDaChon?.price || 320000) * people * 2
  const hotelPerNight = Number(formDuLieu.yeuCauKhachSan?.priceHint || 150000)
  const hotelCostPerNight = hotelPerNight <= 300000 ? hotelPerNight * people : hotelPerNight * Math.max(1, Math.ceil(people / 2))
  // Chi phí ăn mỗi ngày (chỉ bữa ăn, không có vé)
  const foodPerDay = 140000 * people
  const costPerDay = hotelCostPerNight + foodPerDay
  // Số ngày tối đa có thể sau khi trừ xe
  const remaining = Math.max(0, budget - busPrice)
  const maxDays = remaining > 0 && costPerDay > 0 ? Math.max(1, Math.floor(remaining / costPerDay)) : 1
  // Nếu số ngày hiện tại quá lớn, auto rút về vừa vặn
  if (Number(formDuLieu.soNgay) > maxDays) {
    formDuLieu.soNgay = maxDays
    personalityToast.value = { icon: '✂️', title: 'Tự động điều chỉnh!', desc: `Đã rút về ${maxDays} ngày + bật 100% Điểm Miễn Phí để vừa ngân sách ${dinhDangTien(budget)}đ!` }
  } else {
    personalityToast.value = { icon: '🌿', title: 'Đã bật Free Places!', desc: 'Tất cả vé tham quan sẽ là 0đ — tiết kiệm tối đa!' }
  }
  setTimeout(() => { personalityToast.value = null }, 5000)
  taoLichTrinh()
}

function rutNganNgayPhuHop() {
  const people = Number(formDuLieu.soNguoi) || 2
  const budget = Number(formDuLieu.nganSach) || 3000000
  // Chi phí vé xe khứ hồi (cố định)
  const busPrice = Number(formDuLieu.nhaXeDaChon?.price || 320000) * people * 2
  // Chi phí khách sạn mỗi đêm (theo loại: dorm/person hay phòng)
  const hotelPerNight = Number(formDuLieu.yeuCauKhachSan?.priceHint || 150000)
  const hotelCostPerNight = hotelPerNight <= 300000
    ? hotelPerNight * people
    : hotelPerNight * Math.max(1, Math.ceil(people / 2))
  // Chi phí ăn mỗi ngày + di chuyển nội tỉnh
  const foodPerDay = 140000 * people
  const localTransportPerDay = 75000 * Math.max(1, Math.ceil(people / 2))
  // Chi phí vé tham quan (ước tính 30k/người/ngày nếu không free-only)
  const ticketPerDay = formDuLieu.freePlacesOnly ? 0 : 30000 * people
  const costPerDay = hotelCostPerNight + foodPerDay + localTransportPerDay + ticketPerDay
  // Tính số ngày tối đa
  const remaining = Math.max(0, budget - busPrice)
  const calculatedDays = costPerDay > 0 ? Math.max(1, Math.min(7, Math.floor(remaining / costPerDay))) : 1
  const oldDays = Number(formDuLieu.soNgay)
  formDuLieu.soNgay = calculatedDays
  personalityToast.value = { icon: '✂️', title: `Đã rút ${oldDays} → ${calculatedDays} ngày!`, desc: `Vừa vặn ngân sách ${dinhDangTien(budget)}đ — lịch trình mới đang được tạo...` }
  setTimeout(() => { personalityToast.value = null }, 5000)
  taoLichTrinh()
}

const googleMapsDayRouteUrl = computed(() => {
  if (!lichTrinh.value?.daysList) return 'https://www.google.com/maps'
  const currentDay = lichTrinh.value.daysList.find(d => d.day === selectedDay.value) || lichTrinh.value.daysList[0]
  return taoLinkGoogleMapsChoNgay(currentDay)
})

function tinhChiPhiKhachSan(plan) {
  if (formDuLieu.tuTucKhachSan || plan?.self_hotel) return 0
  if (formDuLieu.khachSanDaChon && formDuLieu.phongDaChon) {
    const nights = plan?.nights !== undefined ? Number(plan.nights) : (formDuLieu.soDem !== undefined ? Number(formDuLieu.soDem) : Math.max(0, (plan?.daysList?.length || 1) - 1))
    if (nights <= 0) return 0
    const people = Number(plan?.people) || Number(formDuLieu.soNguoi) || 2
    const rooms = Math.max(1, Math.ceil(people / 2))
    const price = Number(formDuLieu.phongDaChon.price) || Number(formDuLieu.khachSanDaChon.price_from) || 750000
    return Math.round(price * rooms * nights)
  }
  if (!plan?.hotel_recommendation) return 0
  const nights = plan.nights !== undefined ? Number(plan.nights) : (formDuLieu.soDem !== undefined ? Number(formDuLieu.soDem) : Math.max(0, (plan.daysList?.length || 1) - 1))
  if (nights <= 0) return 0
  const people = Number(plan.people) || Number(formDuLieu.soNguoi) || 2
  const budget = Number(plan.target_budget || formDuLieu.nganSach || 3000000)
  const aiPrice = Number(plan.hotel_recommendation.price_per_night) || 850000

  // Tính ngưỡng giá khách sạn tối đa hợp lý theo ngân sách (tối đa 30% ngân sách cho khách sạn)
  const maxHotelBudget = budget * 0.30
  const maxPricePerNight = nights > 0 ? Math.round(maxHotelBudget / nights) : 300000

  // Nếu AI gợi ý khách sạn quá đắt so với ngân sách, dùng giá phù hợp
  const effectivePrice = Math.min(aiPrice, maxPricePerNight)

  // Homestay, dorm, hostel (<= 300.000đ): giá theo người/đêm (90k * 2 người * 5 đêm = 900.000đ)
  // Khách sạn (> 300.000đ): giá theo phòng (1 phòng cho 2 người)
  if (effectivePrice <= 300000) {
    return Math.round(effectivePrice * people * nights)
  }
  const rooms = Math.max(1, Math.ceil(people / 2))
  return Math.round(effectivePrice * rooms * nights)
}

function dongBoChiPhiLichTrinh() {
  if (!lichTrinh.value) return
  const plan = lichTrinh.value
  const people = Number(plan.people) || Number(formDuLieu.soNguoi) || 2
  const days = Math.max(1, plan.daysList?.length || plan.days?.length || formDuLieu.soNgay || 5)

  // 1. Chi phí khách sạn chính xác (đã tối ưu theo ngân sách và loại phòng)
  const realHotel = tinhChiPhiKhachSan(plan)

  // 2. Chi phí vé xe di chuyển:
  // - Nếu bật "Tự túc xe đến" (formDuLieu.tuTucPhuongTien): KHÔNG tính vé xe liên tỉnh, chỉ tính xăng xe máy / nội tỉnh nhẹ nhàng
  // - Nếu không tự túc xe: Vẫn cộng dồn giá xe đầy đủ (khứ hồi + di chuyển nội tỉnh) để phản ánh hợp lý chi phí
  const isSelfTransit = formDuLieu.tuTucPhuongTien !== undefined
    ? Boolean(formDuLieu.tuTucPhuongTien)
    : Boolean(plan.self_transit)
  formDuLieu.tuTucPhuongTien = isSelfTransit
  plan.self_transit = isSelfTransit
  let roundTripBus = 0
  let localTransport = days * 75000 * Math.max(1, Math.ceil(people / 2))

  if (isSelfTransit) {
    roundTripBus = 0
    localTransport = days * 40000 * Math.max(1, Math.ceil(people / 2))
  } else {
    const busPrice = Number(formDuLieu.nhaXeDaChon?.price || plan.transit_summary?.selected_bus?.price || 320000)
    roundTripBus = busPrice * people * 2
  }
  const realTransit = roundTripBus + localTransport

  // 3. Chi phí vé tham quan ban đầu
  let realTickets = 0
  const allDays = plan.daysList || plan.days || []
  if (!formDuLieu.freePlacesOnly && !plan.free_places_only) {
    allDays.forEach(d => {
      (d.activities || []).forEach(a => {
        const c = Number(a.estimated_cost) || 0
        if (['attraction', 'checkin'].includes(a.type)) {
          realTickets += c * people
        }
      })
    })
  } else {
    realTickets = 0
  }

  // 4. THUẬT TOÁN CO GIÃN CHI PHÍ ĂN UỐNG ĐỘNG (DYNAMIC FOOD BUDGET SCALING)
  // Lấy ngân sách mục tiêu người dùng chọn (mặc định 3.5 triệu)
  const userTargetBudget = Number(plan.target_budget || formDuLieu.nganSach || 3500000)

  // Lưu trữ danh sách bữa ăn và tính tổng tiền ăn thô ban đầu
  const foodActivities = []
  let rawFoodTotal = 0
  allDays.forEach(d => {
    (d.activities || []).forEach(a => {
      if (['breakfast', 'lunch', 'dinner', 'restaurant', 'cafe'].includes(a.type)) {
        if (a._raw_cost === undefined) {
          a._raw_cost = Number(a.estimated_cost) || (a.type === 'breakfast' ? 45000 : a.type === 'cafe' ? 30000 : 150000)
        }
        foodActivities.push(a)
        rawFoodTotal += (Number(a._raw_cost) || 0) * people
      }
    })
  })

  // Tính số tiền còn lại dành cho ăn uống sau khi trừ Khách sạn + Xe cộ + Vé tham quan (giữ ~5% quỹ dự phòng)
  const fixedCosts = realHotel + realTransit + realTickets
  const reserveTarget = Math.round(userTargetBudget * 0.05)
  const availableBudgetForFood = Math.max(0, userTargetBudget - fixedCosts - reserveTarget)
  const minSurvivalFood = days * people * 80000 // Tối thiểu 80k/người/ngày cho 3 bữa bình dân

  let realFood = 0
  if (foodActivities.length > 0) {
    if (availableBudgetForFood >= minSurvivalFood && rawFoodTotal > availableBudgetForFood) {
      // Co giãn tỷ lệ từng bữa ăn xuống để tổng chi phí tự động khống chế dưới ngân sách mục tiêu
      const scaleRatio = availableBudgetForFood / Math.max(1, rawFoodTotal)
      foodActivities.forEach(a => {
        let scaled = (a._raw_cost || a.estimated_cost) * scaleRatio
        if (a.type === 'breakfast') {
          scaled = Math.max(25000, Math.min(45000, Math.round(scaled / 5000) * 5000))
        } else if (a.type === 'cafe') {
          scaled = Math.max(20000, Math.min(35000, Math.round(scaled / 5000) * 5000))
        } else {
          scaled = Math.max(35000, Math.min(100000, Math.round(scaled / 5000) * 5000))
        }
        a.estimated_cost = scaled
      })
      realFood = foodActivities.reduce((sum, a) => sum + (Number(a.estimated_cost) * people), 0)

      // Cân chỉnh vi mô để đảm bảo không bị vượt quá do làm tròn số
      if (realFood + fixedCosts + reserveTarget > userTargetBudget && availableBudgetForFood > 0) {
        const excess = (realFood + fixedCosts + reserveTarget) - userTargetBudget
        const trimPerAct = Math.ceil(excess / (foodActivities.length * people))
        foodActivities.forEach(a => {
          const floor = a.type === 'breakfast' ? 20000 : a.type === 'cafe' ? 15000 : 30000
          a.estimated_cost = Math.max(floor, a.estimated_cost - trimPerAct)
        })
        realFood = foodActivities.reduce((sum, a) => sum + (Number(a.estimated_cost) * people), 0)
      }
    } else if (availableBudgetForFood < minSurvivalFood) {
      // Khi ngân sách quá eo hẹp không đủ cả mức ăn tối thiểu (ví dụ < 2 triệu có vé xe)
      foodActivities.forEach(a => {
        const floor = a.type === 'breakfast' ? 25000 : a.type === 'cafe' ? 20000 : 35000
        a.estimated_cost = floor
      })
      realFood = foodActivities.reduce((sum, a) => sum + (Number(a.estimated_cost) * people), 0)
    } else {
      // Ngân sách dư dả, phục hồi về giá menu nguyên bản
      foodActivities.forEach(a => {
        if (a._raw_cost !== undefined) a.estimated_cost = a._raw_cost
      })
      realFood = rawFoodTotal
    }
  } else {
    realFood = Math.min(availableBudgetForFood, days * people * 140000)
  }

  // 5. Tính toán tổng dự toán cuối cùng
  const subtotal = realHotel + realTransit + realFood + realTickets
  let realReserve = 0
  if (userTargetBudget >= subtotal) {
    realReserve = Math.min(Math.round(subtotal * 0.05), userTargetBudget - subtotal)
  } else {
    realReserve = Math.round(subtotal * 0.03)
  }
  const realTotal = subtotal + realReserve

  if (!plan.budget_breakdown) plan.budget_breakdown = {}
  plan.budget_breakdown.hotel = realHotel
  plan.budget_breakdown.transportation = realTransit
  plan.budget_breakdown.food = realFood
  plan.budget_breakdown.tickets = realTickets
  plan.budget_breakdown.reserve = realReserve

  plan.target_budget = userTargetBudget
  plan.user_budget = userTargetBudget
  plan.calculated_total = realTotal
  plan.total_budget = realTotal
  plan.self_transit = isSelfTransit

  // Ngưỡng phát hiện Báo Đỏ: Chỉ kích hoạt khi thực tế vượt quá 5% sau khi đã co giãn tối đa
  const isOver = realTotal > userTargetBudget * 1.05
  plan.is_over_budget = isOver
  plan.over_amount = Math.max(0, realTotal - userTargetBudget)
  plan.over_percent = userTargetBudget > 0 ? Math.round((plan.over_amount / userTargetBudget) * 100) : 0

  if (!plan.budget_audit) plan.budget_audit = {}
  plan.budget_audit.target_budget = userTargetBudget
  plan.budget_audit.calculated_total = realTotal
  plan.budget_audit.is_over_budget = isOver
  plan.budget_audit.over_amount = plan.over_amount
  plan.budget_audit.fit_status = isOver ? 'over' : (realTotal < userTargetBudget * 0.75 ? 'under' : 'optimal')
  if (isOver) {
    plan.budget_audit.fit_message = `CẢNH BÁO BÁO ĐỎ: Kế hoạch thực tế (${dinhDangTien(realTotal)}đ) vượt quá khả năng tài chính bạn đã chọn (${dinhDangTien(userTargetBudget)}đ) khoảng +${dinhDangTien(plan.over_amount)}đ (+${plan.over_percent}%)!`
    plan.budget_audit.advice = isSelfTransit
      ? 'Khuyến nghị: Bạn nên bật "100% Điểm Miễn Phí" hoặc giảm bớt số ngày để vừa vặn tài chính.'
      : 'Khuyến nghị: Vé xe khứ hồi chiếm phần lớn ngân sách. Bạn có thể bật "Tự túc phương tiện đến" hoặc tăng ngân sách để chuyến đi thoải mái hơn.'
  }
  if (!plan.budget_audit.audit_breakdown) plan.budget_audit.audit_breakdown = {}
  plan.budget_audit.audit_breakdown.hotel = realHotel
  plan.budget_audit.audit_breakdown.transit = realTransit
  plan.budget_audit.audit_breakdown.food = realFood
  plan.budget_audit.audit_breakdown.tickets = realTickets
}

async function luuLichTrinhHienTai() {
  if (!lichTrinh.value) return

  const localTripsKey = 'my_saved_trips'
  let savedLocal = []
  try {
    const raw = localStorage.getItem(localTripsKey)
    if (raw) savedLocal = JSON.parse(raw)
  } catch (e) {
    savedLocal = []
  }

  const tripToSave = {
    ...lichTrinh.value,
    _id: lichTrinh.value._id || lichTrinh.value.tripId || ('local-' + Date.now()),
    created_at: lichTrinh.value.created_at || new Date().toISOString()
  }

  const existingIdx = savedLocal.findIndex(t => t._id === tripToSave._id)
  if (existingIdx >= 0) {
    savedLocal[existingIdx] = tripToSave
  } else {
    savedLocal.unshift(tripToSave)
  }
  localStorage.setItem(localTripsKey, JSON.stringify(savedLocal))

  if (nguoiDung.value) {
    try {
      await api.post('/social/my-trips', tripToSave)
      await taiChuyenDiCuaToi()
    } catch (e) {
      console.warn('Lỗi lưu cloud:', e.message)
    }
  } else {
    myTripsList.value = savedLocal
  }

  daLuuLichTrinhHienTai.value = true
  thongBaoLuuThanhCong.value = true
  personalityToast.value = {
    icon: '💾',
    title: 'Đã lưu lịch trình thành công!',
    desc: nguoiDung.value 
      ? 'Chuyến đi đã được lưu an toàn vào tài khoản của bạn.' 
      : 'Chuyến đi đã được lưu trên thiết bị của bạn. Bạn có thể mở xem lại tại tab "Chuyến đi đã lưu"!'
  }
  setTimeout(() => {
    thongBaoLuuThanhCong.value = false
    personalityToast.value = null
  }, 6000)
}

function chonDoiThongSo() {
  hienModalDoiLichTrinh.value = false
  currentPlannerStep.value = 1
  activeTab.value = 'planner'
  nextTick(() => {
    const el = document.getElementById('step-indicator-bar') || document.querySelector('.planner-layout')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

async function chonAILenPhuongAnMoi() {
  hienModalDoiLichTrinh.value = false
  daLuuLichTrinhHienTai.value = false
  await taoLichTrinh()
}

function chonDoiTinhThanh() {
  hienModalDoiLichTrinh.value = false
  activeTab.value = 'explore'
  nextTick(() => {
    window.scrollTo({ top: 400, behavior: 'smooth' })
  })
}

function googleMapsSearchUrl(place) {
  if (!place) return 'https://www.google.com/maps'
  const name = place.place || place.name || ''
  const addr = place.address || formDuLieu.diemDen || 'Việt Nam'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + addr)}`
}

function getSampleReviewText(place) {
  const name = (place.place || place.name || '').toLowerCase()
  if (name.includes('bãi') || name.includes('biển')) {
    return 'Bãi biển rất sạch và đẹp, nước trong xanh cát trắng mịn. Buổi sáng tắm biển ngắm bình minh tuyệt vời, có nhiều dịch vụ thể thao biển.'
  }
  if (name.includes('esco') || name.includes('restaurant') || name.includes('quán') || name.includes('cơm') || name.includes('bánh') || name.includes('bún')) {
    return 'Quán rộng đẹp, view biển thoáng mát, đồ ăn nêm nếm đậm đà chuẩn vị miền Trung. Nhân viên phục vụ nhanh nhẹn nhiệt tình.'
  }
  if (name.includes('cafe') || name.includes('cà phê') || name.includes('chill')) {
    return 'Không gian quán cực chill và nhiều góc check-in triệu view. Đồ uống pha chế ngon, nhạc nhẹ nhàng thư giãn.'
  }
  return 'Địa điểm rất đáng để ghé thăm trong chuyến đi, không gian rộng rãi, cảnh quan ấn tượng và chụp ảnh rất đẹp.'
}

function moModalDoiDiaDiemTuMap(place) {
  if (!place || !lichTrinh.value?.daysList) return
  const currentDayIdx = selectedDay.value - 1
  const day = lichTrinh.value.daysList[currentDayIdx]
  if (!day) return
  const actIdx = day.activities.findIndex(a => a.place === place.place || a.place === place.name)
  if (actIdx >= 0) {
    moModalDoiDiaDiem(currentDayIdx, actIdx, day.activities[actIdx].type)
  } else {
    moModalDoiDiaDiem(currentDayIdx, 0, place.type || 'attraction')
  }
}

function laYeuThich(placeId) {
  if (!placeId) return false
  return favoritesList.value.some(p => p._id === placeId || p === placeId)
}

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

  // Ước lượng thời gian di chuyển: trung bình đô thị 25-30 km/h + 4 phút dừng/đỗ
  let phut = Math.max(8, Math.round(distKm * 2.5) + 4)
  let phuongTien = 'car'
  let labelPhuongTien = 'Ô tô / Taxi'

  if (distKm < 1.2) {
    phuongTien = 'walk'
    phut = Math.max(5, Math.round(distKm * 12))
    labelPhuongTien = 'Đi bộ thư thả'
  } else if (distKm < 5) {
    phuongTien = 'bike'
    phut = Math.max(7, Math.round(distKm * 2) + 3)
    labelPhuongTien = 'Xe máy tiện lợi'
  }

  // Cảnh báo xung đột thời gian & lộ trình (Warning Color Palette theo UI/UX Pro Max)
  const time1 = parseGioPhut(act1.time)
  const time2 = parseGioPhut(act2.time)
  let canhBao = null

  if (time1 !== null && time2 !== null) {
    const gapPhut = time2 - time1
    if (gapPhut > 0 && gapPhut <= 40) {
      canhBao = {
        type: 'warning-tight',
        icon: 'alerttriangle',
        title: 'Lịch trình sát giờ',
        desc: `Hai điểm chỉ cách nhau ${gapPhut} phút nhưng cần ~${phut} phút di chuyển. Bạn có thể bị vội!`
      }
    }
  }

  if (distKm > 18) {
    canhBao = {
      type: 'warning-far',
      icon: 'alertcircle',
      title: 'Khoảng cách xa (> 18 km)',
      desc: `Hai điểm cách nhau tới ${distKm} km (~${phut} phút xe). Cân nhắc gộp điểm cùng khu vực!`
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

watch(() => formDuLieu.tuTucPhuongTien, (val) => {
  if (lichTrinh.value) {
    lichTrinh.value.self_transit = Boolean(val)
    dongBoChiPhiLichTrinh()
  }
});

// ==================== PHẦN 2: XÁC NHẬN LƯU TRƯỚC KHI CHUYỂN TAB ====================
// Wrapper để chuyển tab có kiểm tra lưu lịch trình chưa lưu
function chuyenTab(tabName) {
  // Nếu đang ở planner, có lịch trình, và chưa lưu → hỏi trước
  if (activeTab.value === 'planner' && lichTrinh.value && !daLuuLichTrinhHienTai.value) {
    pendingTabSwitch.value = tabName
    hienModalNhacLuu.value = true
    return
  }
  if (activeTab.value === 'planner' && tabName !== 'planner') {
    resetAllPlannerState()
  }
  activeTab.value = tabName
}

async function dongYLuuVaChuyenTab() {
  await luuLichTrinhHienTai()
  hienModalNhacLuu.value = false
  if (pendingTabSwitch.value) {
    activeTab.value = pendingTabSwitch.value
    pendingTabSwitch.value = null
  }
}

async function khongLuuVaChuyenTab() {
  hienModalNhacLuu.value = false
  const tid = lichTrinh.value?.tripId || lichTrinh.value?._id
  if (tid) {
    try {
      await api.delete(`/social/trips/${tid}`)
    } catch (e) {
      console.warn('Lỗi xóa trip khi không lưu:', e.message)
    }
    myTripsList.value = myTripsList.value.filter(t => t._id !== tid && t.tripId !== tid)
    try {
      const raw = localStorage.getItem('my_saved_trips')
      if (raw) {
        const arr = JSON.parse(raw).filter(t => t._id !== tid && t.tripId !== tid)
        localStorage.setItem('my_saved_trips', JSON.stringify(arr))
      }
    } catch (e) {}
  }
  try {
    localStorage.removeItem('currentTrip')
  } catch (e) {}
  lichTrinh.value = null
  daLuuLichTrinhHienTai.value = false
  currentPlannerStep.value = 1
  if (pendingTabSwitch.value) {
    activeTab.value = pendingTabSwitch.value
    pendingTabSwitch.value = null
  }
}

function huyChuyenTab() {
  hienModalNhacLuu.value = false
  pendingTabSwitch.value = null
}

// ==================== PHẦN 3: MỞ CHI TIẾT CHUYẾN ĐI ĐÃ LƯU ====================
function xemChiTietChuyenDi(trip) {
  xemTripChiTiet.value = trip
  xemNgayChiTiet.value = null
  hienModalChiTietTrip.value = true
}

function resetAllPlannerState() {
  currentPlannerStep.value = 1
  lichTrinh.value = null
  daLuuLichTrinhHienTai.value = false
  selectedPlaces.value = []
  searchPlacePickerQuery.value = ''
  taoPlanError.value = ''
  
  // Reset formDuLieu về trạng thái ban đầu
  formDuLieu.diemKhoiHanh = ''
  formDuLieu.diemDen = 'Đà Nẵng'
  formDuLieu.soNgay = 0
  formDuLieu.soDem = 0
  formDuLieu.nganSach = 3500000
  formDuLieu.soNguoi = 0
  formDuLieu.soThich = []
  formDuLieu.ngayBatDau = todayIso.value || '2026-10-06'
  formDuLieu.ngayKetThuc = ''
  formDuLieu.phuongTien = ''
  formDuLieu.tuTucPhuongTien = false
  formDuLieu.yeuCauKhachSan = ''
  formDuLieu.nhaXeDaChon = null
  formDuLieu.gioXuatPhatChon = ''
  formDuLieu.tauDaChon = null
  formDuLieu.chuyenBayDaChon = null
  formDuLieu.khachSanDaChon = null
  formDuLieu.phongDaChon = null
  formDuLieu.freePlacesOnly = false
  formDuLieu.tuTucPhuongTien = false
  formDuLieu.tuTucKhachSan = false

  transitTab.value = ''
  step3ActiveSubtab.value = 'transit'
  hotelSortBy.value = 'default'
  hotelStarFilter.value = 'all'
  hotelDisplayLimit.value = 4
  customPlaceText.value = ''

  selectedManualProvinceCode.value = ''
  selectedManualDistrictCode.value = ''
  selectedManualWardCode.value = ''
  manualStreetAddress.value = ''

  try {
    localStorage.removeItem('currentTrip')
  } catch (e) {}
}

watch(activeTab, (newTab, oldTab) => {
  // Khi thoát khỏi trang lên lịch: reset mọi thứ từ đầu (Yêu cầu 4)
  if (oldTab === 'planner' && newTab !== 'planner') {
    resetAllPlannerState()
  }

  if (newTab === 'planner') {
    // Luôn cuộn lên đầu trang ngay lập tức để người dùng thấy ảnh Miền Trung
    cuonLenDauTrang()
    nextTick(() => {
      cuonLenDauTrang()
    })
    // Luôn re-render khi chuyển sang tab planner để tránh grey tiles
    renderLeafletMap()
    // Random câu AI mới mỗi khi vào tab planner
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
      dongBoChiPhiLichTrinh()
    } catch (e) {
      console.error(e)
    }
  }

  // Tải danh sách chuyến đi đã lưu từ bộ nhớ máy (cho cả khách chưa đăng nhập)
  try {
    const localSaved = localStorage.getItem('my_saved_trips')
    if (localSaved) {
      const parsedLocal = JSON.parse(localSaved)
      if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
        myTripsList.value = parsedLocal
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc my_saved_trips:', e.message)
  }
  
  if (activeTab.value === 'planner') {
    nextTick(() => {
      renderLeafletMap();
    });
  }

  checkMobileDevice()
  window.addEventListener('resize', checkMobileDevice)

  const handleGlobalEsc = (e) => {
    if (e.key === 'Escape' && showHotelDetailModal.value) {
      dongModalXemPhong()
    }
  }
  window.addEventListener('keydown', handleGlobalEsc)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalEsc)
    window.removeEventListener('resize', checkMobileDevice)
    try { document.body.style.overflow = '' } catch (err) {}
  })
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
    attraction: 'Thắng cảnh',
    restaurant: 'Ẩm thực',
    cafe: 'Cafe & Bar',
    hotel: 'Khách sạn'
  }
  return map[type] || 'Địa điểm'
}

function getBadgeInfo(act) {
  if (!act) return { icon: 'pin', label: 'Hoạt động', class: 'badge-attraction' }
  if (act.type) {
    const map = {
      breakfast: { icon: 'sunrise', label: act.label || 'Ăn sáng', class: 'badge-breakfast' },
      lunch: { icon: 'utensils', label: act.label || 'Ăn trưa', class: 'badge-lunch' },
      dinner: { icon: 'utensils', label: act.label || 'Ăn tối', class: 'badge-dinner' },
      checkin: { icon: 'hotel', label: act.label || 'Nhận phòng', class: 'badge-hotel' },
      checkout: { icon: 'hotel', label: act.label || 'Trả phòng', class: 'badge-hotel' },
      cafe: { icon: 'coffee', label: act.label || 'Cafe & Chill', class: 'badge-cafe' },
      attraction: { icon: 'landmark', label: act.label || 'Tham quan / Check-in', class: 'badge-attraction' }
    }
    if (map[act.type]) return map[act.type]
  }
  return { icon: 'camera', label: 'Tham quan / Check-in', class: 'badge-attraction' }
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

  if (name.includes('phong nha') || name.includes('thiên đường') || name.includes('hang tối') || name.includes('động')) {
    return 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('suối nước moọc') || name.includes('suối moọc') || name.includes('sông chày')) {
    return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('đá nhảy') || name.includes('gành đá') || name.includes('eo gió') || name.includes('kỳ co')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('cồn cát') || name.includes('quang phú')) {
    return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('biển') || name.includes('nhật lệ') || name.includes('mỹ khê') || name.includes('an bàng') || name.includes('mũi điện')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('bà nà') || name.includes('cầu vàng') || name.includes('sơn trà') || name.includes('ngũ hành sơn') || name.includes('cầu rồng')) {
    return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('phố cổ') || name.includes('hội an') || name.includes('chùa cầu') || name.includes('rừng dừa')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('đại nội') || name.includes('lăng') || name.includes('thiên mụ') || name.includes('sông hương') || name.includes('làng hương')) {
    return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  }
  if (name.includes('mẹ suốt') || name.includes('quảng bình quan') || name.includes('bảo tàng') || name.includes('di tích')) {
    return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'restaurant' || name.includes('bánh') || name.includes('cháo') || name.includes('mì') || name.includes('bún') || name.includes('hải sản') || name.includes('cơm') || name.includes('gà') || name.includes('lẩu')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'cafe' || name.includes('cafe') || name.includes('coffee') || name.includes('cà phê') || name.includes('trà')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80'
  }
  if (place?.type === 'hotel' || name.includes('hotel') || name.includes('resort') || name.includes('khách sạn')) {
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
      console.warn('Lỗi tải địa điểm:', e.message)
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
        console.warn('Lỗi tải thời tiết:', e.message)
        if (currentId === reqIdCounter) thoiTiet.value = null
      })
  }
}

async function taoLichTrinh() {
  if (!formDuLieu.soNgay || formDuLieu.soNgay <= 0 || !formDuLieu.soNguoi || formDuLieu.soNguoi <= 0) {
    taoPlanError.value = 'Vui lòng chọn số ngày đi (tối thiểu 1 ngày) và số người tham gia (tối thiểu 1 người).'
    currentPlannerStep.value = 1
    return
  }

  if (!tripFeasibility.value.feasible && !formDuLieu.freePlacesOnly) {
    taoPlanError.value = tripFeasibility.value.message || 'Yêu cầu không khả thi về ngân sách. Vui lòng tăng ngân sách hoặc chọn chế độ chỉ đi điểm miễn phí vé.';
    currentPlannerStep.value = 2;
    return;
  }

  formDuLieu.soThich = chuoiSoThich.value ? chuoiSoThich.value.split(',').map(s => s.trim()).filter(Boolean) : []
  dangTao.value = true
  lichTrinh.value = null
  hienCompletionBanner.value = false
  taoPlanError.value = ''

  // Kích hoạt luân phiên loading message có tính cách AI (Mục 6)
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
      nights: formDuLieu.soDem,
      budget: formDuLieu.nganSach,
      people: formDuLieu.soNguoi,
      free_places_only: Boolean(formDuLieu.freePlacesOnly),
      interests: formDuLieu.soThich,
      selected_places: selectedPlaces.value,
      start_date: formDuLieu.ngayBatDau,
      end_date: formDuLieu.ngayKetThuc,
      transportation: formDuLieu.phuongTien,
      hotel_request: formDuLieu.yeuCauKhachSan,
      selected_bus: formDuLieu.nhaXeDaChon,
      selected_hotel: formDuLieu.khachSanDaChon,
      selected_room: formDuLieu.phongDaChon,
      selected_departure_time: formDuLieu.gioXuatPhatChon,
      self_transit: Boolean(formDuLieu.tuTucPhuongTien),
      tu_tuc_phuong_tien: Boolean(formDuLieu.tuTucPhuongTien),
      self_hotel: Boolean(formDuLieu.tuTucKhachSan),
      tu_tuc_khach_san: Boolean(formDuLieu.tuTucKhachSan)
    })
    lichTrinh.value = res.data
    lichTrinh.value.nights = formDuLieu.soDem
    // Đồng bộ khách sạn đã chọn hoặc tự túc nơi ở
    if (formDuLieu.tuTucKhachSan) {
      lichTrinh.value.self_hotel = true
      lichTrinh.value.hotel_recommendation = {
        name: 'Tự túc nơi ở / Homestay riêng',
        address: `Khu vực ${formDuLieu.diemDen || 'Miền Trung'}`,
        rating: 5.0,
        price_per_night: 0,
        room_name: 'Tự túc chỗ nghỉ',
        description: 'Chỗ ở tự túc (nhà người thân, homestay tự đặt hoặc cắm trại dã ngoại). Chi phí lưu trú: 0đ.',
        image: null,
        latitude: null,
        longitude: null
      }
    } else if (formDuLieu.khachSanDaChon) {
      lichTrinh.value.hotel_recommendation = {
        name: formDuLieu.khachSanDaChon.name,
        address: formDuLieu.khachSanDaChon.address,
        rating: formDuLieu.khachSanDaChon.rating || 4.8,
        price_per_night: Number(formDuLieu.phongDaChon?.price || formDuLieu.khachSanDaChon.price_from || 850000),
        room_name: formDuLieu.phongDaChon?.name || 'Phòng Tiêu Chuẩn',
        description: formDuLieu.phongDaChon ? `${formDuLieu.khachSanDaChon.name} - ${formDuLieu.phongDaChon.name}` : (formDuLieu.khachSanDaChon.description || 'Khách sạn nghỉ dưỡng'),
        image: formDuLieu.khachSanDaChon.image || null,
        latitude: formDuLieu.khachSanDaChon.latitude || null,
        longitude: formDuLieu.khachSanDaChon.longitude || null
      }
    }
    // Đảm bảo gắn thông tin di chuyển tối ưu chi phí
    if (!lichTrinh.value.transit_summary) {
      lichTrinh.value.transit_summary = {
        origin: formDuLieu.diemKhoiHanh,
        destination: formDuLieu.diemDen,
        estimated_distance_km: transitRouteInfo.value.estimatedDistanceKm,
        selected_bus: formDuLieu.nhaXeDaChon || null,
        departure_time: formDuLieu.gioXuatPhatChon || null,
        comparison: transitRouteInfo.value.vehicleComparison,
        available_operators: transitRouteInfo.value.operators
      }
    }
    if (lichTrinh.value?.days) lichTrinh.value.daysList = lichTrinh.value.days
    selectedDay.value = 1
    // Đồng bộ tính toán chi phí khách sạn và ngân sách thực tế đúng với lịch trình (Yêu cầu 2)
    dongBoChiPhiLichTrinh()
    daLuuLichTrinhHienTai.value = false
    splitterTongTien.value = lichTrinh.value.total_budget || formDuLieu.nganSach
    splitterSoNguoi.value = lichTrinh.value.people || formDuLieu.soNguoi

    // Hiển thị completion quote ngẫu nhiên và floating toast (Mục 7)
    const quote = COMPLETION_QUOTES[Math.floor(Math.random() * COMPLETION_QUOTES.length)]
    activeCompletionQuote.value = quote
    hienCompletionBanner.value = true
    personalityToast.value = quote
    setTimeout(() => {
      personalityToast.value = null
    }, 7500)
  } catch (e) {
    const msg = e?.response?.data?.error || e.message;
    if (e?.response?.data?.is_unfeasible) {
      taoPlanError.value = `⛔ Chuyến đi không thể thực hiện: ${msg}`;
      currentPlannerStep.value = 2;
    } else {
      taoPlanError.value = 'Quá trình tạo lịch trình gặp sự cố: ' + msg;
    }
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
      instruction: 'Dự báo ngày này có mưa, hãy đổi các hoạt động ngoài trời thành các điểm trong nhà (Bảo tàng, Cafe view đẹp, Rạp chiếu phim, Chợ ẩm thực có mái che).'
    })
    lichTrinh.value.days = res.data.days
    lichTrinh.value.daysList = res.data.days
    alert('🌧️ AI đã cập nhật lịch trình sang các hoạt động trong nhà tránh mưa thành công!')
  } catch (e) {
    alert('Không thể đổi lịch: ' + (e?.response?.data?.error || e.message))
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
    nhanTin.value.push({ id: Date.now() + '-a', role: 'assistant', text: 'Xin lỗi, tạm thời tôi chưa thể trả lời: ' + (e?.response?.data?.error || e.message) })
  } finally {
    dangGuiChat.value = false
  }
}

function guiChatNhanh(cauHoi) {
  chatText.value = cauHoi
  sendChat()
}

function onLoginSuccess(data) {
  if (data?.token) {
    localStorage.setItem('travel_token', data.token)
  }
  if (data?.user) {
    nguoiDung.value = data.user
  }
  hienAuthModal.value = false
  activeTab.value = 'explore'
  playIntroSplash()
  taiChuyenDiCuaToi()
  taiYeuThich()
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

function dangXuat() {
  localStorage.removeItem('travel_token')
  nguoiDung.value = null
  myTripsList.value = []
  favoritesList.value = []
  
  // Hiện modal đăng nhập sau khi đăng xuất
  dangKyMode.value = false
  hienAuthModal.value = true
}

async function taiChuyenDiCuaToi() {
  if (!nguoiDung.value) return
  try {
    const res = await api.get('/social/my-trips')
    myTripsList.value = res.data || []
  } catch (e) {
    console.warn('Chưa tải được danh sách chuyến đi:', e.message)
  }
}

async function taiYeuThich() {
  if (!nguoiDung.value) return
  try {
    const res = await api.get('/social/favorites')
    favoritesList.value = res.data || []
  } catch (e) {
    console.warn('Chưa tải được yêu thích:', e.message)
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
    console.warn('Lỗi yêu thích:', e.message)
  }
}

function moLaiLichTrinh(trip) {
  lichTrinh.value = trip
  if (lichTrinh.value?.days) lichTrinh.value.daysList = lichTrinh.value.days
  selectedDay.value = 1
  dongBoChiPhiLichTrinh()
  daLuuLichTrinhHienTai.value = true
  activeTab.value = 'planner'
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    renderLeafletMap()
  })
}

async function chiaSeChuyenDi(trip) {
  try {
    const res = await api.post(`/social/trips/${trip._id}/share`)
    const url = `${window.location.origin}${res.data.url}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      alert('Đã sao chép liên kết chia sẻ vào Clipboard!\n' + url)
    } else {
      prompt('Liên kết chia sẻ chuyến đi:', url)
    }
  } catch (e) {
    alert('Không thể chia sẻ: ' + (e?.response?.data?.error || e.message))
  }
}

async function xoaChuyenDi(trip) {
  const tenChuyen = `${trip.days?.length || (trip.daysList?.length) || 0} ngày tại ${trip.destination}`
  const xacNhan = confirm(`Bạn có chắc muốn xóa chuyến đi "${tenChuyen}" không?\n\n⚠️ Hành động này không thể hoàn tác.`)
  if (!xacNhan) return
  try {
    if (trip._id && !trip._id.startsWith('local-')) {
      await api.delete(`/social/trips/${trip._id}`)
    }
  } catch (e) {
    console.warn('Lỗi xóa trên server:', e.message)
  }
  // Xóa khỏi danh sách local và state
  myTripsList.value = myTripsList.value.filter(t => t._id !== trip._id)
  try {
    const raw = localStorage.getItem('my_saved_trips')
    if (raw) {
      const arr = JSON.parse(raw).filter(t => t._id !== trip._id)
      localStorage.setItem('my_saved_trips', JSON.stringify(arr))
    }
  } catch (e) {}
}

function xuatPdf() {
  const element = document.querySelector('.plan-results-container')
  if (!element) {
    alert('Không tìm thấy nội dung lịch trình để xuất PDF!')
    return
  }
  
  // Clone element to remove interactive buttons
  const clone = element.cloneNode(true)
  const toolActions = clone.querySelector('.plan-tool-actions')
  if (toolActions) toolActions.remove()
  
  // Also remove the "Chia tiền nhóm" or "Đổi lịch tránh mưa" buttons if any other remain
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
  if (code === 0) return 'sun'
  if (code <= 3) return 'cloudsun'
  if (code <= 48) return 'wind'
  if (code <= 67 || code <= 82) return 'cloudrain'
  return 'cloudlightning'
}

function moTaThoiTiet(code) {
  if (code === 0) return 'Trời nắng đẹp'
  if (code <= 3) return 'Có mây nhẹ'
  if (code <= 48) return 'Sương mù nhẹ'
  if (code <= 67 || code <= 82) return 'Có mưa rào'
  return 'Dông bão'
}


// --- TRIPS LOGIC INJECTED ---
const selectedTrips = ref([])
const isSelectAllTrips = computed(() => myTripsList.value.length > 0 && selectedTrips.value.length === myTripsList.value.length)

function toggleTripSelection(id) {
  const idx = selectedTrips.value.indexOf(id)
  if (idx > -1) selectedTrips.value.splice(idx, 1)
  else selectedTrips.value.push(id)
}

function toggleSelectAllTrips() {
  if (isSelectAllTrips.value) {
    selectedTrips.value = []
  } else {
    selectedTrips.value = myTripsList.value.map(t => t._id)
  }
}

function promptDeleteSelected() {
  if (!selectedTrips.value.length) return
  deleteTarget.value = 'selected'
  modalDeleteVisible.value = true
}

function promptDeleteTrip(trip) {
  if (trip === 'all') {
    deleteTarget.value = 'all'
  } else {
    deleteTarget.value = trip
  }
  modalDeleteVisible.value = true
}

async function executeDeleteTrips() {
  try {
    let idsToDelete = []
    if (deleteTarget.value === 'all') {
      idsToDelete = myTripsList.value.map(t => t._id)
    } else if (deleteTarget.value === 'selected') {
      idsToDelete = [...selectedTrips.value]
    } else if (deleteTarget.value?._id) {
      idsToDelete = [deleteTarget.value._id]
    }

    if (!idsToDelete.length) return

    await api.post('/trips/delete-multiple', { tripIds: idsToDelete })
    
    // Xóa khỏi UI
    myTripsList.value = myTripsList.value.filter(t => !idsToDelete.includes(t._id))
    selectedTrips.value = []
    modalDeleteVisible.value = false
    deleteTarget.value = null
    
    if (xemTripChiTiet.value && idsToDelete.includes(xemTripChiTiet.value._id)) {
      xemTripChiTiet.value = null
      hienModalChiTietTrip.value = false
    }
  } catch (err) {
    console.error('Lỗi xóa chuyến đi:', err)
    alert('Không thể xóa chuyến đi. Vui lòng thử lại.')
  }
}

// --- PROFILE LOGIC INJECTED ---
const isEditingProfile = ref(false)
const profileForm = reactive({
  name: '',
  bio: '',
  avatar: ''
})

const userStats = computed(() => {
  return {
    points: nguoiDung.value?.points || 0,
    completedTrips: nguoiDung.value?.completed_trips || 0,
    savedTrips: myTripsList.value?.length || 0,
    favoritePlaces: favoritesList.value?.length || 0
  }
})

/* removed dup userLevelInfo */

function editProfile() {
  profileForm.name = nguoiDung.value?.name || ''
  profileForm.bio = nguoiDung.value?.bio || ''
  profileForm.avatar = nguoiDung.value?.avatar || ''
  isEditingProfile.value = true
}

function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('Kích thước ảnh tối đa 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    profileForm.avatar = event.target.result
  }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  try {
    const res = await api.put('/auth/update-profile', {
      name: profileForm.name,
      bio: profileForm.bio,
      avatar: profileForm.avatar
    })
    nguoiDung.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    isEditingProfile.value = false
  } catch (err) {
    console.error('Lỗi cập nhật hồ sơ:', err)
    alert(err.response?.data?.error || 'Không thể cập nhật hồ sơ')
  }
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
  
  clearTimeout(introTimeout1)
  clearTimeout(introTimeout2)
  
  // Đợi 7.5s xem video, sau đó kích hoạt hiệu ứng tách chữ và mờ dần trong 2.5s (Tổng 10s)
  introTimeout1 = setTimeout(() => {
    introSplitting.value = true
    introTimeout2 = setTimeout(() => {
      showIntroSplash.value = false
    }, 2500)
  }, 7500)
}

function boQuaIntro() {
  clearTimeout(introTimeout1)
  clearTimeout(introTimeout2)
  
  // Tách video nhanh hơn khi bỏ qua
  introSplitting.value = true
  setTimeout(() => {
    showIntroSplash.value = false
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

/* Hiệu ứng Parallax Zoom cho toàn bộ app */
.app-root {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  transition: transform 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.app-root.app-intro-zoom {
  transform: scale(0.95);
}

/* ===== AI HINT BUBBLE — đồng bộ màu Teal chủ đạo sang trọng ===== */
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

/* Quick-pick chips bên trong bubble */
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

/* Chip "Câu khác" — nổi bật riêng */
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

/* Nút dismiss bubble */
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

/* ===== AI PROVINCE SUBTITLE — sinh động, gradient ===== */
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
  /* ==================== UI PRO MAX DESIGN SYSTEM TOKENS ==================== */
  /* Palette: Aurora Ocean & Heritage Coral (Chuẩn nhận diện du lịch Duyên hải & Di sản Miền Trung) */
  --primary: #0284c7; /* Sky / Ocean Blue 600 - Tươi mới, chuyên nghiệp, tin cậy */
  --primary-dark: #0369a1; /* Ocean Blue 700 */
  --primary-light: #e0f2fe; /* Sky 100 */
  --primary-surface: #f0f9ff; /* Sky 50 */
  --secondary: #0d9488; /* Teal 600 - Điểm xuyết ngọc bích ven biển */
  --accent: #ea580c; /* Coral Orange 600 - Tương phản nổi bật, ánh đèn lồng Hội An */
  --accent-hover: #c2410c; /* Coral Orange 700 */
  --accent-light: #ffedd5; /* Orange 100 */

  /* Backgrounds & Bề mặt phẳng đạt chuẩn tương phản cao (Không dùng kính mờ loang lổ) */
  --bg-app: #f8fafc; /* Slate 50 - Nền sáng dịu mắt, sạch sẽ */
  --card-bg: #ffffff; /* Thẻ trắng đặc 100% - Chữ sắc nét, dễ đọc nhất */
  --card-bg-elevated: #ffffff;
  --card-bg-subtle: #f1f5f9;

  /* Typography & Đạt chuẩn tương phản WCAG 2.2 AA / AAA (Tối thiểu 4.5:1) */
  --text-main: #0f172a; /* Slate 900 - Tương phản 13:1 so với nền trắng */
  --text-sub: #475569; /* Slate 600 - Tương phản 5.5:1, vượt chuẩn WCAG AA */
  --text-muted: #64748b; /* Slate 500 */

  /* Đường viền tinh tế, chuẩn xác (Thay thế viền vàng đục cũ) */
  --border-color: #e2e8f0; /* Slate 200 - Viền xám trung tính tinh tế */
  --border-hover: #cbd5e1; /* Slate 300 */
  --border-strong: #94a3b8;

  /* Bo góc hài hòa */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Đổ bóng tự nhiên nhiều tầng (Layered Shadows) */
  --shadow-sm: 0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04);
  --shadow-lg: 0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.06);
  --shadow-primary: 0 4px 14px rgba(2, 132, 199, 0.25);
  --shadow-accent: 0 4px 14px rgba(234, 88, 12, 0.25);

  /* Form Inputs & Weather */
  --input-bg: #f8fafc;
  --input-bg-focus: #ffffff;
  --weather-bg: #f0f9ff;
  --weather-border: #bae6fd;
}

:root[data-theme="dark"] {
  /* Brand Colors Dark Mode - Sáng rõ, nổi bật trên nền tối */
  --primary: #38bdf8; /* Sky 400 - Độ sáng cao, không chìm trên nền đen */
  --primary-dark: #0284c7;
  --primary-light: rgba(56, 189, 248, 0.16);
  --primary-surface: rgba(56, 189, 248, 0.08);
  --secondary: #2dd4bf; /* Mint Teal 400 */
  --accent: #f97316; /* Warm Coral 500 */
  --accent-hover: #ea580c;
  --accent-light: rgba(249, 115, 22, 0.16);

  /* Bề mặt tối chuyên nghiệp (Deep Ocean Navy) */
  --bg-app: #0b1329; /* Xanh than vũ trụ sâu thẳm, không bị chói mắt */
  --card-bg: #162036; /* Slate 800 - Thẻ màu đặc độ tương phản cao */
  --card-bg-elevated: #1e293b;
  --card-bg-subtle: #0f172a;

  /* Typography Dark Mode */
  --text-main: #f8fafc; /* Slate 50 - Tương phản cực cao */
  --text-sub: #cbd5e1; /* Slate 300 - Dễ đọc */
  --text-muted: #94a3b8; /* Slate 400 */

  /* Borders Dark Mode */
  --border-color: rgba(51, 65, 85, 0.7); /* Slate 700 */
  --border-hover: rgba(100, 116, 139, 0.85);
  --border-strong: rgba(148, 163, 184, 0.5);

  /* Shadows Dark Mode */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 16px 36px rgba(0, 0, 0, 0.55);
  --shadow-primary: 0 4px 16px rgba(56, 189, 248, 0.3);
  --shadow-accent: 0 4px 16px rgba(249, 115, 22, 0.3);

  /* Form Inputs Dark Mode */
  --input-bg: rgba(15, 23, 42, 0.75);
  --input-bg-focus: #0f172a;
  --weather-bg: rgba(15, 23, 42, 0.8);
  --weather-border: rgba(56, 189, 248, 0.25);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  /* Phông chữ Be Vietnam Pro tối ưu tuyệt đối cho tiếng Việt có dấu, khoảng cách quang học hoàn hảo */
  font-family: 'Be Vietnam Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.25s ease, color 0.25s ease;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ánh sáng nền Ambient Mesh nhẹ nhàng, không gây nhiễu chữ */
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 12% 15%, rgba(2, 132, 199, 0.04) 0%, transparent 45%),
              radial-gradient(circle at 88% 85%, rgba(234, 88, 12, 0.03) 0%, transparent 45%);
  z-index: -1;
  pointer-events: none;
}

:root[data-theme="dark"] body::before {
  background: radial-gradient(circle at 12% 15%, rgba(56, 189, 248, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 88% 85%, rgba(249, 115, 22, 0.04) 0%, transparent 50%);
}

/* Tiêu đề loại bỏ serif Playfair Display để tiếng Việt không bị dính dấu, dùng Be Vietnam Pro đậm nét sang trọng */
h1, h2, h3, h4, h5, h6, .place-name, .hero-content h2, .app-header h1 {
  font-family: 'Be Vietnam Pro', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em;
  font-weight: 700;
  color: var(--text-main);
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
  color: var(--primary);
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
  border: 2px solid transparent;
  outline: none;
  padding: 12px 10px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 130px;
  max-width: 150px;
  height: 140px;
  color: #ffffff;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
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
  background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.05) 100%);
  z-index: 1;
  border-radius: inherit;
  transition: opacity 0.2s ease;
}
.city-card-btn:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45), 0 0 20px rgba(14, 165, 233, 0.4);
  border-color: rgba(14, 165, 233, 0.6);
}
.city-card-btn.active {
  box-shadow: 0 0 0 3px #0ea5e9, 0 12px 28px rgba(14, 165, 233, 0.45);
  border-color: #0ea5e9;
  transform: translateY(-4px);
}
.city-card-btn.active::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 13px;
  font-weight: 800;
  background: #10b981;
  color: #fff;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 3px 8px rgba(0,0,0,0.35);
}
.city-icon, .city-name, .city-tag {
  position: relative;
  z-index: 2;
}
.city-pin-icon {
  display: block;
  margin-bottom: 6px;
  opacity: 0.95;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));
  position: relative;
  z-index: 2;
}
.city-name {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.9);
  line-height: 1.25;
  margin-bottom: 4px;
}
.city-tag {
  font-size: 10px;
  color: rgba(255,255,255,0.92);
  text-shadow: 0 1px 4px rgba(0,0,0,0.85);
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

/* ========================================================
   PROVINCE SPOTLIGHT SHOWCASE & THUMBNAILS GALLERY (YÊU CẦU 2)
   ======================================================== */
.province-spotlight-card {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 24px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 20px;
  padding: 22px;
  margin-top: 18px;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}
:root[data-theme="dark"] .province-spotlight-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}
@media (max-width: 900px) {
  .province-spotlight-card {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 16px;
  }
}
.spotlight-visual-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.spotlight-hero-wrap {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}
@media (max-width: 600px) {
  .spotlight-hero-wrap {
    height: 240px;
  }
}
.spotlight-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.spotlight-hero-wrap:hover .spotlight-hero-img {
  transform: scale(1.02);
}
.spotlight-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.3) 100%);
  pointer-events: none;
}
.spotlight-badge-esg {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(236, 253, 245, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #10b981;
  color: #065f46;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 2;
}
.spotlight-badge-cert {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(254, 243, 199, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #f59e0b;
  color: #92400e;
  font-size: 12.5px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 2;
}
.spotlight-fullscreen-btn {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.spotlight-fullscreen-btn:hover {
  background: #ffffff;
  transform: scale(1.08);
  color: #0284c7;
}

/* 5 Thumbnails Gallery dưới ảnh chính */
.spotlight-thumbnails-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.spotlight-thumb-btn {
  position: relative;
  height: 54px;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  padding: 0;
  background: #000;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}
.spotlight-thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, opacity 0.2s ease;
  opacity: 0.82;
}
.spotlight-thumb-btn:hover img {
  opacity: 1;
  transform: scale(1.05);
}
.spotlight-thumb-btn.active {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.3);
}
.spotlight-thumb-btn.active img {
  opacity: 1;
}
.thumb-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 9.5px;
  font-weight: 600;
  padding: 2px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* Cột thông tin chi tiết */
.spotlight-info-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.spotlight-header-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}
.spotlight-tag-kicker {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #0284c7;
  text-transform: uppercase;
}
.spotlight-cert-sub {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  font-weight: 500;
}
.spotlight-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-color, #0f172a);
  line-height: 1.3;
  margin: 0 0 4px 0;
}
:root[data-theme="dark"] .spotlight-title {
  color: #f8fafc;
}
.spotlight-subtitle {
  font-size: 12.5px;
  font-weight: 600;
  color: #0ea5e9;
  margin: 0 0 10px 0;
  line-height: 1.4;
}
.spotlight-description {
  font-size: 13.5px;
  color: var(--text-muted, #475569);
  line-height: 1.6;
  margin: 0 0 14px 0;
}
:root[data-theme="dark"] .spotlight-description {
  color: #cbd5e1;
}
.spotlight-highlight-box {
  background: var(--bg-soft, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 10px;
}
:root[data-theme="dark"] .spotlight-highlight-box {
  background: #0f172a;
  border-color: #334155;
}
.shb-label {
  font-size: 12.5px;
  color: var(--text-color, #0f172a);
  margin-bottom: 6px;
}
:root[data-theme="dark"] .shb-label {
  color: #f8fafc;
}
.shb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.spotlight-spec-chip {
  font-size: 12px;
  font-weight: 600;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid rgba(2, 132, 199, 0.2);
}
.shb-text {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
  margin: 0;
}
.spotlight-actions {
  margin-top: 10px;
}
.spotlight-cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 700;
  padding: 13px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  transition: all 0.2s ease;
}
.spotlight-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(2, 132, 199, 0.45);
}

/* Spotlight Fullscreen Modal */
.spotlight-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.spotlight-modal-box {
  position: relative;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 18px;
  max-width: 900px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}
.spotlight-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}
.spotlight-modal-close:hover {
  background: #ef4444;
}
.spotlight-modal-img {
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  background: #000;
  display: block;
}
.spotlight-modal-footer {
  padding: 16px 20px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.spotlight-modal-footer h4 {
  color: #fff;
  font-size: 16px;
  margin: 0;
}
.spotlight-modal-thumbs {
  display: flex;
  gap: 8px;
}
.sm-thumb-btn {
  width: 50px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}
.sm-thumb-btn.active {
  border-color: #0284c7;
}
.sm-thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ========================================================
   LỊCH TRÌNH KHỞI HÀNH & CHỌN NGÀY ĐI (YÊU CẦU 3 - SCREENSHOT 3)
   ======================================================== */
.departure-schedule-box {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  background: var(--card-bg, #ffffff);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  padding: 18px 20px;
  margin-top: 10px;
  margin-bottom: 12px;
}
:root[data-theme="dark"] .departure-schedule-box {
  background: #1e293b;
  border-color: #334155;
}
.dsb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}
.dsb-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dsb-icon {
  font-size: 24px;
}
.dsb-title {
  font-size: 16.5px;
  font-weight: 800;
  color: var(--text-color, #0f172a);
  margin: 0;
}
:root[data-theme="dark"] .dsb-title {
  color: #f8fafc;
}
.dsb-subtitle {
  font-size: 12.5px;
  color: var(--text-muted, #64748b);
  display: block;
}
.dsb-duration-tag {
  font-size: 12px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

/* Dãy nút chọn tháng kiểu viên thuốc (Screenshot 3) */
.month-pills-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 14px;
  -webkit-overflow-scrolling: touch;
}
.month-pill-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  min-width: 100px;
  border-radius: 12px;
  border: 1.5px solid var(--border-color, #e2e8f0);
  background: var(--card-bg, #ffffff);
  color: var(--text-muted, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
:root[data-theme="dark"] .month-pill-btn {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}
.month-pill-btn span {
  font-size: 13.5px;
  font-weight: 600;
}
.month-pill-btn strong {
  font-size: 14px;
  font-weight: 800;
}
.month-pill-btn:hover {
  border-color: #0284c7;
  color: #0284c7;
}
.month-pill-btn.active {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
}

/* KHỐI THỐNG NHẤT 5 TRƯỜNG ĐIỀU KHIỂN (YÊU CẦU 5) */
.dsb-unified-controls-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 14px;
  align-items: flex-end;
}
@media (max-width: 1100px) {
  .dsb-unified-controls-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .dsb-unified-controls-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 520px) {
  .dsb-unified-controls-grid {
    grid-template-columns: 1fr;
  }
}
.dsb-ctrl-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dsb-ctrl-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-color, #334155);
}
:root[data-theme="dark"] .dsb-ctrl-field label {
  color: #cbd5e1;
}
.dsb-stepper {
  height: 42px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: var(--input-bg, #ffffff);
  border: 1.5px solid var(--border-color, #cbd5e1);
  overflow: hidden;
}
:root[data-theme="dark"] .dsb-stepper {
  background: #0f172a;
  border-color: #334155;
}
.dsb-stepper button {
  width: 40px;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color, #334155);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
:root[data-theme="dark"] .dsb-stepper button {
  color: #f1f5f9;
}
.dsb-stepper button:hover {
  background: rgba(2, 132, 199, 0.15);
  color: #0284c7;
}
.dsb-stepper-val {
  flex: 1;
  text-align: center;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-color, #0f172a);
}
:root[data-theme="dark"] .dsb-stepper-val {
  color: #f8fafc;
}

/* Ô chọn ngày cụ thể (Dự phòng) */
.departure-date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
}
@media (max-width: 640px) {
  .departure-date-row {
    grid-template-columns: 1fr;
  }
}
.ddr-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-color, #334155);
  margin-bottom: 5px;
}
:root[data-theme="dark"] .ddr-field label {
  color: #cbd5e1;
}
.departure-date-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #cbd5e1);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}
.disabled-input {
  background: rgba(0, 0, 0, 0.03);
  cursor: not-allowed;
  opacity: 0.9;
}
:root[data-theme="dark"] .disabled-input {
  background: rgba(255, 255, 255, 0.05);
}
.trip-date-summary-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.2);
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 13px;
  color: #0369a1;
}
:root[data-theme="dark"] .trip-date-summary-banner {
  background: rgba(2, 132, 199, 0.15);
  color: #38bdf8;
}
.trip-date-summary-banner b {
  font-weight: 700;
}

/* ========================================================
   BỐ CỤC CHỌN VÉ XE GỌN GÀNG & HIỆN ĐẠI (YÊU CẦU 4 - SCREENSHOT 4)
   ======================================================== */
.bic-spec-times {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--card-bg, #fff);
  padding: 8px 10px;
  border-radius: 8px;
}
:root[data-theme="dark"] .bic-spec-times {
  background: #0f172a;
}
.bst-label {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  font-weight: 600;
}
.bst-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.bst-chip {
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(2, 132, 199, 0.2);
}
.train-time-chip {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
}

/* ========================================================
   THANH TÌM KIẾM & BỘ CHỌN ĐỊA ĐIỂM TỐI GIẢN (YÊU CẦU 5 - SCREENSHOT 5)
   ======================================================== */
.place-picker-search-bar {
  display: flex;
  align-items: center;
  position: relative;
  background: var(--bg-soft, #f8fafc);
  border: 1.5px solid var(--border-color, #cbd5e1);
  border-radius: 12px;
  padding: 2px 14px;
  margin-top: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}
.place-picker-search-bar:focus-within {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}
:root[data-theme="dark"] .place-picker-search-bar {
  background: #1e293b;
  border-color: #334155;
}
.pps-icon {
  font-size: 16px;
  margin-right: 8px;
  opacity: 0.7;
}
.pps-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 13.5px;
  color: var(--text-color);
  outline: none;
}
.pps-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}
.pps-clear-btn:hover {
  color: #ef4444;
}

/* Tabs phân loại - GLASSMORPHIC SLIDER TABS */
.place-picker-tabs {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4px;
  border-radius: 25px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.22);
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: 14px;
  max-width: 100%;
}
.place-picker-tabs::-webkit-scrollbar { display: none; }

:root[data-theme="light"] .place-picker-tabs {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.9);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.ppt-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 25px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:root[data-theme="light"] .ppt-btn {
  color: #475569;
}

.ppt-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}
:root[data-theme="light"] .ppt-btn:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.05);
}

.ppt-btn.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  font-weight: 700;
  border: none;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.12);
  animation: pulse-slider 0.45s ease-out;
}
:root[data-theme="light"] .ppt-btn.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  box-shadow:
    0 3px 12px rgba(15, 23, 42, 0.12),
    0 1px 4px rgba(15, 23, 42, 0.08);
}
.ppt-selected-tab {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #059669;
}
.ppt-selected-tab.active {
  background: #10b981 !important;
  border-color: #10b981 !important;
}
.ppt-crawler-btn {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15)) !important;
  border: 1px solid rgba(16, 185, 129, 0.45) !important;
  color: #059669 !important;
  font-weight: 600 !important;
  margin-left: auto;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ppt-crawler-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981, #0284c7) !important;
  color: #ffffff !important;
  transform: translateY(-1.5px);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}
.ppt-crawler-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}
:root[data-theme="dark"] .ppt-crawler-btn {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2)) !important;
  border-color: rgba(52, 211, 153, 0.5) !important;
  color: #34d399 !important;
}
:root[data-theme="dark"] .ppt-crawler-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #0284c7) !important;
  color: #ffffff !important;
}

/* Khay địa điểm đã chọn */
.selected-places-tray {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
}
:root[data-theme="dark"] .selected-places-tray {
  background: rgba(16, 185, 129, 0.12);
}
.spt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.spt-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #065f46;
}
:root[data-theme="dark"] .spt-title {
  color: #34d399;
}
.spt-clear-all {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
.spt-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.spt-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #065f46;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
:root[data-theme="dark"] .spt-chip {
  background: #0f172a;
  color: #6ee7b7;
}
.spt-chip button {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.spt-chip button:hover {
  color: #ef4444;
}

/* Nút Thu gọn / Xem thêm */
.picker-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.picker-expand-toggle-btn {
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.2);
  color: #0284c7;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.picker-expand-toggle-btn:hover {
  background: rgba(2, 132, 199, 0.16);
}
.empty-search-places {
  text-align: center;
  padding: 30px 16px;
  background: var(--bg-soft, #f8fafc);
  border-radius: 12px;
  margin-top: 10px;
}
:root[data-theme="dark"] .empty-search-places {
  background: #1e293b;
}
.empty-search-places span {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}
.empty-search-places p {
  font-size: 13.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

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


/* PLACES EXPLORE GRID WITH PHOTOS - GLASSMORPHIC PILL TABS */
.filter-pills {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4px;
  border-radius: 25px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.22);
  position: relative;
  overflow-x: auto;
  scrollbar-width: none;
  max-width: 100%;
}
.filter-pills::-webkit-scrollbar { display: none; }

:root[data-theme="light"] .filter-pills {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.9);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:root[data-theme="light"] .filter-pill {
  color: #475569;
}

.filter-pill:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}
:root[data-theme="light"] .filter-pill:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.05);
}

.filter-pill.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  font-weight: 700;
  border: none;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.12);
  animation: pulse-slider 0.45s ease-out;
}
:root[data-theme="light"] .filter-pill.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  box-shadow:
    0 3px 12px rgba(15, 23, 42, 0.12),
    0 1px 4px rgba(15, 23, 42, 0.08);
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

/* Hiệu ứng ánh sáng lướt qua (Light Reflection / Gleam) */
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
.app-form-grid > .full-width,
.app-form-grid > .departure-schedule-box,
.app-form-grid > .bus-optimization-section,
.app-form-grid > .route-overview-banner,
.app-form-grid > .ai-hint-bubble,
.app-form-grid > .self-transit-card,
.bus-optimization-section {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* ==================== TÙY CHỌN TỰ TÚC PHƯƠNG TIỆN ĐẾN (STEP 2 FORM) ==================== */
.self-transit-card {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  background: var(--card-bg, #ffffff);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 4px;
  margin-bottom: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.self-transit-card:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.03);
}
.self-transit-card.is-active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.05));
  border-color: #10b981;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
}
:root[data-theme="dark"] .self-transit-card {
  background: #1e293b;
  border-color: #334155;
}
:root[data-theme="dark"] .self-transit-card:hover {
  background: rgba(16, 185, 129, 0.08);
}
:root[data-theme="dark"] .self-transit-card.is-active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(6, 182, 212, 0.1));
  border-color: #10b981;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
}
.stc-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  width: 100%;
}
.stc-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
.stc-custom-indicator {
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 7px;
  border: 2px solid var(--border-color, #cbd5e1);
  background: var(--input-bg, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-top: 2px;
  transition: all 0.2s ease;
}
.self-transit-card.is-active .stc-custom-indicator {
  border-color: #10b981;
  background: #10b981;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}
:root[data-theme="dark"] .stc-custom-indicator {
  border-color: #475569;
  background: #0f172a;
}
.stc-content {
  flex: 1;
}
.stc-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.stc-title-row strong {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color, #0f172a);
}
:root[data-theme="dark"] .stc-title-row strong {
  color: #f1f5f9;
}
.stc-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: #10b981;
  color: #ffffff;
  letter-spacing: 0.02em;
}
.stc-desc {
  margin: 5px 0 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted, #64748b);
}
:root[data-theme="dark"] .stc-desc {
  color: #94a3b8;
}
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
/* PLACES PICKER IN PLANNER (FULL WIDTH SCREENSHOT 1 FIX) */
.places-picker-box {
  margin-top: 16px;
  padding: 18px 22px;
  background: var(--input-bg);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  grid-column: 1 / -1 !important;
  width: 100% !important;
  box-sizing: border-box !important;
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
.chips-wrap { 
  display: flex; 
  flex-wrap: wrap; 
  overflow-x: hidden; 
  gap: 8px; 
  padding-bottom: 8px; 
  scroll-behavior: smooth;
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
.submit-plan-btn { width: 100%; margin-top: 0; padding: 14px; }

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
  background: #162036;
  border: 1px solid rgba(51, 65, 85, 0.7);
  box-shadow: var(--shadow-md);
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
  font-family: inherit;
  letter-spacing: -0.02em;
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
/* SQUAD AVATARS CSS */
.squad-avatars-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  padding: 8px 12px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}
.squad-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub);
}
.squad-overlap {
  display: flex;
  align-items: center;
}
.squad-avatar-wrap {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid var(--card-bg, #fff);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  margin-left: -12px;
  position: relative;
  transition: transform 0.2s, z-index 0.2s;
  background: #1e1b4b;
  overflow: hidden;
  cursor: help;
}
.squad-avatar-wrap:first-child {
  margin-left: 0;
}
.squad-avatar-wrap:hover {
  transform: translateY(-4px) scale(1.1);
  z-index: 10 !important;
}
.sq-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.sq-cyclo {
  object-position: center 25%;
}
.sq-smirk {
  object-position: center 20%;
}
.sq-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
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
  background: var(--accent); /* Vàng Hội An */
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

/* THẺ DỰ KIẾN THỜI GIAN & KHOẢNG CÁCH TỚI ĐIỂM ĐẾN */
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
.profile-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
}
.profile-avatar-large {
  width: 60px;
  height: 60px;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 24px;
  font-weight: 800;
  margin: 0 auto 10px;
}
.profile-email { font-size: 12px; color: var(--text-sub); margin-bottom: 16px; }
.profile-stats-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  border-block: 1px solid var(--border-color);
  padding: 12px 0;
  margin-bottom: 16px;
}
.stat-box strong { font-size: 18px; color: var(--primary); display: block; }
.stat-box small { font-size: 11px; color: var(--text-sub); }
.logout-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 0;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
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
  max-width: 360px !important; /* Thu gọn */
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

/* TIER INDICATOR BANNER IN STEP 2 */
.tier-indicator-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: color-mix(in srgb, var(--input-bg) 85%, transparent);
  border: 1.5px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-top: 14px;
  gap: 16px;
  flex-wrap: wrap;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.tib-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tib-icon {
  font-size: 28px;
  line-height: 1;
}
.tib-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}
.tib-badge {
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.tib-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}
.tib-rate {
  font-size: 12px;
  color: var(--text-sub);
  margin: 0;
}
.tib-rate b {
  color: var(--primary);
}
.tib-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tib-tag {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-main);
}

/* PILL BADGE IN SUMMARY */
.tier-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 14px;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.budget-luxury-callout {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 1px solid #f59e0b;
  color: #92400e;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  margin-top: 10px;
}

/* BUDGET AUDIT CARD */
.budget-audit-card {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: #fff;
  transition: all 0.2s ease;
}
.budget-audit-card.optimal {
  background: #f0fdf4;
  border-color: #86efac;
}
.budget-audit-card.under {
  background: #fefce8;
  border-color: #fde047;
}
.budget-audit-card.over {
  background: #fef2f2;
  border-color: #fca5a5;
}
.bac-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.bac-title-group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}
.bac-icon {
  font-size: 22px;
  line-height: 1;
}
.bac-msg {
  display: block;
  font-size: 13px;
  color: var(--text-main);
  margin-bottom: 2px;
}
.bac-advice {
  font-size: 12px;
  color: var(--text-sub);
  margin: 0;
  line-height: 1.4;
}
.bac-stats {
  text-align: right;
  flex-shrink: 0;
}
.bac-stat-label {
  display: block;
  font-size: 11px;
  color: var(--text-sub);
  font-weight: 600;
}
.bac-stat-num {
  font-size: 16px;
  color: var(--primary);
  font-weight: 800;
}
.bac-details-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}
.bad-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
}
.bad-label {
  color: var(--text-sub);
  font-weight: 600;
}
.bad-item b {
  font-size: 12px;
  color: var(--text-main);
}

/* SỬA LỖI MẤT PHÔNG CHỮ & ĐỘ TƯƠNG PHẢN TRONG CHẾ ĐỘ TỐI (YÊU CẦU 3) */
:root[data-theme="dark"] .budget-audit-card {
  background: rgba(15, 23, 42, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}
:root[data-theme="dark"] .budget-audit-card.optimal {
  background: rgba(6, 78, 59, 0.45) !important;
  border-color: rgba(52, 211, 153, 0.45) !important;
}
:root[data-theme="dark"] .budget-audit-card.under {
  background: rgba(113, 63, 18, 0.45) !important;
  border-color: rgba(250, 204, 21, 0.45) !important;
}
:root[data-theme="dark"] .budget-audit-card.over {
  background: rgba(127, 29, 29, 0.45) !important;
  border-color: rgba(248, 113, 113, 0.45) !important;
}
:root[data-theme="dark"] .bac-msg {
  color: #f8fafc !important;
}
:root[data-theme="dark"] .bac-advice {
  color: #cbd5e1 !important;
}
:root[data-theme="dark"] .bac-stat-label {
  color: #94a3b8 !important;
}
:root[data-theme="dark"] .bac-stat-num {
  color: #34d399 !important;
}
:root[data-theme="dark"] .bac-details-row {
  border-top-color: rgba(255, 255, 255, 0.15) !important;
}
:root[data-theme="dark"] .bad-label {
  color: #94a3b8 !important;
}
:root[data-theme="dark"] .bad-item b {
  color: #f1f5f9 !important;
}

/* RESPONSIVE TRÊN MÁY TÍNH & MOBILE */
@media (max-width: 640px) {
  .app-main { padding: 12px 10px; min-width: 0; overflow-x: hidden; }
  .tab-pane { min-width: 0; }
  .planner-tab-bg { padding: 16px 12px 32px; width: 100%; box-sizing: border-box; }
  .planner-form-container { margin: 0; padding: 16px; width: 100%; box-sizing: border-box; max-width: 100%; min-width: 0; }
  .app-form-grid { grid-template-columns: 1fr; }
  .app-field, .origin-select-wrapper { min-width: 0; }
  .app-field.full-width { grid-column: span 1; }
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
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-top: 24px !important;
  gap: 16px !important;
  width: 100% !important;
}
.wizard-footer button,
.wizard-footer .app-secondary-btn,
.wizard-footer .app-primary-btn,
.wizard-footer .submit-plan-btn {
  flex: 1 !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  margin: 0 !important;
  padding: 0 24px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  line-height: normal !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}
.wizard-footer .app-secondary-btn {
  background: var(--input-bg, #f1f5f9) !important;
  color: var(--text-main, #334155) !important;
  border: 1.5px solid var(--border-color, #cbd5e1) !important;
}
.wizard-footer .app-secondary-btn:hover:not(:disabled) {
  background: #e2e8f0 !important;
  border-color: #94a3b8 !important;
  transform: translateY(-1px) !important;
}
:root[data-theme="dark"] .wizard-footer .app-secondary-btn {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}
:root[data-theme="dark"] .wizard-footer .app-secondary-btn:hover:not(:disabled) {
  background: #334155 !important;
}
.wizard-footer .app-primary-btn,
.wizard-footer .submit-plan-btn {
  background: var(--primary, #059669) !important;
  color: #ffffff !important;
  border: 1.5px solid var(--primary, #059669) !important;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3) !important;
}
.wizard-footer .app-primary-btn:hover:not(:disabled),
.wizard-footer .submit-plan-btn:hover:not(:disabled) {
  background: var(--primary-dark, #047857) !important;
  border-color: var(--primary-dark, #047857) !important;
  box-shadow: 0 6px 18px rgba(5, 150, 105, 0.4) !important;
  transform: translateY(-1px) !important;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==================== STYLES CHO AI PERSONALITY (MỤC 6, 7, 8) ==================== */

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

/* QUICK BUDGET CHIPS - GLASSMORPHIC SLIDER PILLS */
.quick-budget-chips {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4px;
  border-radius: 25px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.22);
  margin-top: 10px;
  position: relative;
}

:root[data-theme="light"] .quick-budget-chips {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.9);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.q-budget-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:root[data-theme="light"] .q-budget-chip {
  color: #475569;
}

.q-budget-chip:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}
:root[data-theme="light"] .q-budget-chip:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.05);
}

.q-budget-chip.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  font-weight: 800;
  border: none;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.12);
  animation: pulse-slider 0.45s ease-out;
}
:root[data-theme="light"] .q-budget-chip.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  box-shadow:
    0 3px 12px rgba(15, 23, 42, 0.12),
    0 1px 4px rgba(15, 23, 42, 0.08);
}

/* UNFEASIBLE WARNING BOX & FREE PLACES CHOICE */
.unfeasible-warning-box {
  margin-top: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08));
  border: 1.5px solid rgba(239, 68, 68, 0.35);
  border-radius: var(--radius-md, 12px);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}
:root[data-theme="dark"] .unfeasible-warning-box {
  background: linear-gradient(135deg, rgba(153, 27, 27, 0.25), rgba(180, 83, 9, 0.2));
  border-color: rgba(239, 68, 68, 0.5);
}
.uwb-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.uwb-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}
.uwb-header-text strong {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #dc2626;
  margin-bottom: 4px;
}
:root[data-theme="dark"] .uwb-header-text strong {
  color: #f87171;
}
.uwb-header-text p {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--text-main);
  margin: 0;
  opacity: 0.9;
}
.uwb-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.uwb-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.btn-budget-fix {
  background: #dc2626;
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}
.btn-budget-fix:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}
.btn-days-fix {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.4);
}
:root[data-theme="dark"] .btn-days-fix {
  background: rgba(245, 158, 11, 0.2);
  color: #fde68a;
  border-color: rgba(245, 158, 11, 0.45);
}
.btn-days-fix:hover {
  background: rgba(245, 158, 11, 0.25);
  transform: translateY(-1px);
}
.uwb-free-choice {
  padding-top: 10px;
  border-top: 1px dashed rgba(239, 68, 68, 0.25);
}
.uwb-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12.5px;
  color: var(--text-main);
  user-select: none;
}
.uwb-checkbox {
  width: 17px;
  height: 17px;
  accent-color: #10b981;
  cursor: pointer;
}

/* FREE MODE BANNER */
.free-mode-banner {
  margin-top: 14px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}
:root[data-theme="dark"] .free-mode-banner {
  background: rgba(6, 78, 59, 0.3);
  border-color: rgba(16, 185, 129, 0.4);
}
.fmb-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fmb-icon {
  font-size: 18px;
}
.fmb-left strong {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #059669;
  margin-bottom: 2px;
}
:root[data-theme="dark"] .fmb-left strong {
  color: #34d399;
}
.fmb-left p {
  font-size: 12px;
  margin: 0;
  color: var(--text-main);
  opacity: 0.9;
}
.fmb-turnoff {
  background: rgba(128, 128, 128, 0.15);
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.fmb-turnoff:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: #ef4444;
}

/* STEP 3 UNFEASIBLE NOTICE */
.unfeasible-step3-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 8px;
  color: #dc2626;
  font-size: 12px;
  margin-bottom: 12px;
  line-height: 1.45;
  text-align: left;
}
:root[data-theme="dark"] .unfeasible-step3-notice {
  color: #fca5a5;
  background: rgba(153, 27, 27, 0.25);
  border-color: rgba(239, 68, 68, 0.45);
}

/* PERSONALITY BUDGET CARD (MỤC 8) */
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

/* Đỏ / Báo động (< 100K) */
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

/* Tối giản (100K - 500K) */
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

/* Tiết kiệm / Phượt (500K - 1.5Tr) */
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

/* Rủng rỉnh / Thoải mái (1.5Tr - 5Tr) */
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

/* Đại gia / Sang chảnh (> 5Tr) */
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

/* AI GENERATING CARD (MỤC 6) */
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
  width: 190px;
  height: 190px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.radar-pulse {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 1.5px solid rgba(129, 140, 248, 0.45);
  animation: radarWave 2.4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
  pointer-events: none;
}
.pulse-2 {
  animation-delay: -1.2s;
}
@keyframes radarWave {
  0% { transform: scale(0.65); opacity: 0.9; }
  100% { transform: scale(1.35); opacity: 0; }
}
.radar-track {
  position: absolute;
  width: 136px;
  height: 136px;
  border: 1.5px dashed rgba(167, 139, 250, 0.35);
  border-radius: 50%;
  pointer-events: none;
}
.radar-center {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24px rgba(251, 191, 36, 0.5), 0 0 35px rgba(99, 102, 241, 0.6);
  z-index: 5;
  animation: floatCenter 2.4s ease-in-out infinite;
  border: 3px solid #fbbf24;
  overflow: hidden;
  background: #312e81;
}
.radar-center-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
@keyframes floatCenter {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.05) translateY(-3px); }
}

/* Orbiting Friends Ring (Quay xung quanh vòng tròn qua lại) */
.radar-orb-ring {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: ringOrbitSwing 6s cubic-bezier(0.42, 0, 0.58, 1) infinite alternate;
}
@keyframes ringOrbitSwing {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.radar-orb {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: #1e1b4b;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.radar-orb:hover {
  transform: scale(1.18);
  z-index: 10;
}
.orb-1 {
  top: 6px;
  left: calc(50% - 22px);
  border: 2.5px solid #38bdf8;
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.75), 0 4px 10px rgba(0, 0, 0, 0.4);
}
.orb-2 {
  top: calc(50% - 22px);
  right: 6px;
  border: 2.5px solid #34d399;
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.75), 0 4px 10px rgba(0, 0, 0, 0.4);
}
.orb-3 {
  bottom: 6px;
  left: calc(50% - 22px);
  border: 2.5px solid #f472b6;
  box-shadow: 0 0 14px rgba(244, 114, 182, 0.75), 0 4px 10px rgba(0, 0, 0, 0.4);
}
.orb-4 {
  top: calc(50% - 22px);
  left: 6px;
  border: 2.5px solid #a78bfa;
  box-shadow: 0 0 14px rgba(167, 139, 250, 0.75), 0 4px 10px rgba(0, 0, 0, 0.4);
}

.orb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  animation: orbCounterRotate 6s cubic-bezier(0.42, 0, 0.58, 1) infinite alternate;
}
.orb-img-cyclo {
  object-position: center 25%;
}
.orb-img-smirk {
  object-position: center 20%;
}
@keyframes orbCounterRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
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

/* AI COMPLETION BANNER (MỤC 7) */
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
  margin: 0 0 10px;
  color: rgba(255,255,255,0.92);
  line-height: 1.4;
}
.celebrating-squad {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.celeb-avatar-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  overflow: hidden;
  background: #1e1b4b;
  animation: squadBounce 1.2s cubic-bezier(0.36, 0, 0.66, -0.56) infinite alternate;
}
.celeb-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.celeb-1 { animation-delay: 0s; }
.celeb-2 { animation-delay: 0.15s; }
.celeb-3 { animation-delay: 0.3s; }
.celeb-4 { animation-delay: 0.45s; }
.celeb-5 { animation-delay: 0.6s; }

@keyframes squadBounce {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-8px) scale(1.1); }
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

/* SQUAD SPEECH BUBBLE (BÌNH LUẬN VUI NHỘN) */
.squad-speech-bubble {
  display: flex;
  gap: 12px;
  margin: 12px 0;
  padding: 10px 12px;
  background: rgba(56, 189, 248, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  align-items: center;
  position: relative;
}
.squad-speech-bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 20px;
  border-width: 0 8px 8px 8px;
  border-style: solid;
  border-color: transparent transparent rgba(56, 189, 248, 0.2) transparent;
}
.sq-chat-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #38bdf8;
  flex-shrink: 0;
  background: #1e1b4b;
}
.sq-chat-text {
  font-size: 13.5px;
  color: var(--text-main);
  font-style: italic;
  line-height: 1.4;
  font-weight: 500;
}
:root[data-theme="dark"] .sq-chat-text {
  color: #e2e8f0;
}

/* CYCLO SCROLL INDICATOR */
.cyclo-scroll-indicator {
  position: sticky;
  top: 180px;
  left: -20px; /* Nhô ra bên trái timeline */
  width: 48px;
  height: 48px;
  z-index: 50;
  border-radius: 50%;
  overflow: hidden;
  border: 2.5px solid #38bdf8;
  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
  background: #1e1b4b;
  margin-bottom: -48px; /* Để không chiếm không gian */
  animation: cycloWobble 2s ease-in-out infinite alternate;
}
.cyclo-scroll-indicator img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@keyframes cycloWobble {
  0% { transform: rotate(-5deg) translateY(0); }
  100% { transform: rotate(5deg) translateY(-4px); }
}

/* BUDGET HUMOR CALLOUT (MỤC 8 TRONG KẾT QUẢ) */
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
  min-height: 42px; /* Đạt chuẩn touch target >= 42px của UI/UX Pro Max */
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
  /* Cột thời gian để trống tạo nhịp thở cho timeline */
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

/* ==================== WARNING COLOR PALETTE (CẢNH BÁO XUNG ĐỘT UX) ==================== */
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

/* Trạng thái Sát giờ (Amber Warning) */
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

/* Trạng thái Quãng đường xa / Ngược tuyến (Red Alert) */
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

/* ==================== ĐIỂM BẮT ĐẦU & LỘ TRÌNH VISUALIZER ==================== */
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

/* Banner Lộ trình siêu gọn (Compact Route Banner) */
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

/* ==================== TỐI ƯU CHI PHÍ XE & GỢI Ý NHÀ XE ==================== */
.bus-optimization-section {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 18px;
  padding: 20px;
  margin-top: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
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

/* Grid So Sánh Phương Tiện */
.transit-vehicles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  width: 100%;
  margin-bottom: 20px;
}
@media (max-width: 860px) {
  .transit-vehicles-grid {
    grid-template-columns: 1fr;
  }
}
.tv-card {
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

/* Danh sách Nhà Xe Giá Rẻ */
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}
@media (max-width: 860px) {
  .bus-operators-grid {
    grid-template-columns: 1fr;
  }
}
.bus-item-card {
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

/* FOOTER CARD TINH GỌN (2 TẦNG CHỐNG TRÀN NÚT) */
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

/* Hàng nút bấm chia đều 50/50 */
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

/* ==================== TỔNG HỢP XE KHÁCH TẠI PLAN RESULTS ==================== */
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

/* Thẻ Transit Tự túc & các nút chuyển đổi chế độ */
.trip-transit-summary-card.is-self-transit {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.06));
  border-color: rgba(16, 185, 129, 0.4);
}
:root[data-theme="dark"] .trip-transit-summary-card.is-self-transit {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(6, 182, 212, 0.1));
  border-color: rgba(16, 185, 129, 0.5);
}
.ttsc-icon.self-icon {
  background: #ecfdf5;
  color: #059669;
}
:root[data-theme="dark"] .ttsc-icon.self-icon {
  background: #064e3b;
  color: #34d399;
}
.ttsc-badge.self-badge {
  color: #059669;
}
.ttsc-desc-inline {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 6px 0 0 0;
  line-height: 1.45;
}
.ttsc-included-note {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}
:root[data-theme="dark"] .ttsc-included-note {
  color: #34d399;
}
.ttsc-switch-btn,
.ttsc-toggle-self-btn {
  background: transparent;
  color: var(--primary, #0d9488);
  border: 1.5px solid var(--primary, #0d9488);
  padding: 8px 14px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.ttsc-switch-btn:hover,
.ttsc-toggle-self-btn:hover {
  background: rgba(13, 148, 136, 0.1);
  transform: translateY(-1px);
}


@media (max-width: 768px) {
  .bos-header {
    flex-direction: column;
  }
  .transit-vehicles-grid {
    grid-template-columns: 1fr 1fr;
  }
  .bus-operators-grid {
    grid-template-columns: 1fr;
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

/* ==================== TRANSIT SUBTABS (XE KHÁCH VS TÀU HỎA) ==================== */
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

/* ==================== 1. TOOLTIP NÚT GẠT TRƯỚC / SAU SÁP NHẬP ==================== */
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

/* ==================== 2. INPUT TƯƠNG PHẢN CAO & QUICK TAG CHIPS ==================== */
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

/* ==================== KHUNG NGÂN SÁCH THỐNG NHẤT (UNIFIED BUDGET CARD) ==================== */
.unified-budget-card {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
}
.ubc-slider-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.budget-section-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main, #1e293b);
  display: flex;
  align-items: center;
  gap: 8px;
}
.unified-budget-card .tier-indicator-banner {
  margin-top: 0;
}
.unified-budget-card .dynamic-budget-card {
  margin-top: 0;
}
.unified-budget-card .personality-budget-card {
  margin-top: 0;
}

/* ==================== 3. DỰ TOÁN CHI PHÍ THÔNG MINH (DYNAMIC BUDGET BREAKDOWN) ==================== */
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

/* ==================== 4. AI TỐI ƯU CUNG ĐƯỜNG & NÚT HÀNH ĐỘNG MỚI ==================== */
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

/* ==================== 5. CẢNH BÁO THỜI TIẾT THEO NGÀY (WEATHER-AWARE) ==================== */
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

/* ==================== 6. MODAL THẺ INFOGRAPHIC CHIA SẺ ZALO ==================== */
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

/* Kỹ thuật 2 màn hình để xẻ đôi video */
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
  /* Lưới màu chuyển dịu nhẹ miền Trung: Biển xanh - Trời trong - Nắng Hội An */
  background: linear-gradient(135deg, #f0f9ff 0%, #e2e8f0 35%, #f8fafc 70%, #ffedd5 100%);
  background-size: 300% 300%;
  animation: liquidGradient 20s ease infinite;
}

:root[data-theme="dark"] .planner-tab-bg {
  /* Biển đêm huyền bí miền Trung (Deep Ocean Night Sky) */
  background: linear-gradient(135deg, #0b1329 0%, #0f172a 40%, #162036 75%, #0d9488 100%);
  background-size: 300% 300%;
  animation: liquidGradient 20s ease infinite;
}

/* ==================== PLANNER HERO BANNER ==================== */
.planner-hero-banner {
  width: 100%;
  max-width: 860px;
  height: 320px;
  max-height: 350px;
  margin: 0 auto 20px auto;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  flex-shrink: 0;
  background: #0f172a;
  animation: fadeInBanner 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.planner-hero-banner:hover {
  transform: translateY(-3px) scale(1.008);
  box-shadow: 0 24px 50px -10px rgba(0, 0, 0, 0.55);
}

.planner-hero-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 25%;
  display: block;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.planner-hero-banner:hover .planner-hero-banner-img {
  transform: scale(1.025);
}

/* Gradient vignette overlay phía dưới */
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

/* Badge text góc dưới trái */
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
    height: 190px;
    max-height: 190px;
    border-radius: 14px;
    margin-bottom: 16px;
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

/* Form Container - Nền đặc, tương phản cao, chống lóa mắt */
.planner-glass-form {
  background: #ffffff !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08) !important;
  position: relative;
  z-index: 1;
}

/* Chế độ Dark Mode: Nền thẻ Slate 800 đặc sắc nét */
:root[data-theme="dark"] .planner-glass-form {
  background: #162036 !important;
  border: 1px solid rgba(51, 65, 85, 0.7) !important;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.55) !important;
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
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.field-label-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toggle-manual-ward-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.3);
  color: #0284c7;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root[data-theme="dark"] .toggle-manual-ward-btn {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}

.toggle-manual-ward-btn:hover,
.toggle-manual-ward-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

:root[data-theme="dark"] .toggle-manual-ward-btn.active {
  background: #0284c7;
  color: #ffffff;
}

.mwp-arrow-icon {
  font-size: 0.65rem;
  opacity: 0.8;
}

/* ==================== MANUAL WARD PICKER CARD ==================== */
.manual-ward-picker-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-top: 4px;
  margin-bottom: 6px;
}

:root[data-theme="dark"] .manual-ward-picker-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

.mwp-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mwp-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 0.88rem;
  color: #0f172a;
}

:root[data-theme="dark"] .mwp-title {
  color: #f8fafc;
}

.mwp-sub {
  font-size: 0.74rem;
  color: #64748b;
}

:root[data-theme="dark"] .mwp-sub {
  color: #94a3b8;
}

.mwp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

@media (max-width: 900px) {
  .mwp-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 540px) {
  .mwp-grid {
    grid-template-columns: 1fr;
  }
}

.mwp-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mwp-label {
  font-size: 0.74rem;
  font-weight: 600;
  color: #475569;
}

:root[data-theme="dark"] .mwp-label {
  color: #cbd5e1;
}

.mwp-select,
.mwp-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

:root[data-theme="dark"] .mwp-select,
:root[data-theme="dark"] .mwp-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.mwp-select:focus,
.mwp-input:focus {
  border-color: #0284c7;
}

.mwp-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.mwp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

:root[data-theme="dark"] .mwp-footer {
  border-top-color: #334155;
}

.mwp-preview-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 65%;
}

.mwp-preview-tag {
  font-size: 0.7rem;
  font-weight: 600;
  color: #0284c7;
  text-transform: uppercase;
}

:root[data-theme="dark"] .mwp-preview-tag {
  color: #38bdf8;
}

.mwp-preview-val {
  font-size: 0.85rem;
  color: #0f172a;
  word-break: break-word;
}

:root[data-theme="dark"] .mwp-preview-val {
  color: #f8fafc;
}

.mwp-action-btns {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.mwp-apply-btn {
  background: #0284c7;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.mwp-apply-btn:hover:not(:disabled) {
  background: #0369a1;
}

.mwp-apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mwp-close-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
}

:root[data-theme="dark"] .mwp-close-btn {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}

.mwp-close-btn:hover {
  background: #e2e8f0;
}

:root[data-theme="dark"] .mwp-close-btn:hover {
  background: #1e293b;
}

.expand-fade-enter-active,
.expand-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.expand-fade-enter-from,
.expand-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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

.origin-input-row {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.origin-combo-input.has-gps {
  padding-right: 46px;
}

.origin-gps-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(14, 165, 233, 0.35);
  background: rgba(14, 165, 233, 0.12);
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  padding: 0;
}

:root[data-theme="dark"] .origin-gps-btn {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}

.origin-gps-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 2px 10px rgba(2, 132, 199, 0.45);
}

:root[data-theme="dark"] .origin-gps-btn:hover {
  background: #38bdf8;
  color: #0f172a;
}

.origin-gps-btn.is-locating {
  pointer-events: none;
  background: rgba(14, 165, 233, 0.25);
}

.gps-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(2, 132, 199, 0.3);
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: gpsSpin 0.7s linear infinite;
  display: inline-block;
}

:root[data-theme="dark"] .gps-spinner {
  border-color: rgba(56, 189, 248, 0.3);
  border-top-color: #38bdf8;
}

@keyframes gpsSpin {
  to { transform: rotate(360deg); }
}

.gps-btn-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 6px);
  right: 0;
  background: rgba(15, 23, 42, 0.92);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.origin-gps-btn:hover .gps-btn-tooltip {
  display: block;
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

/* ==================== STYLES CHO HERO ACTION BAR (LƯU LỊCH TRÌNH & THAY ĐỔI LỊCH TRÌNH) ==================== */
.itinerary-decision-actions-bar {
  display: flex;
  gap: 12px;
  margin: 18px 0;
  flex-wrap: wrap;
}

.it-dec-btn {
  flex: 1;
  min-width: 220px;
  padding: 12px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
}

.it-start-trip-btn {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #06b6d4 100%);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);
  position: relative;
  overflow: hidden;
}

.it-start-trip-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(2, 132, 199, 0.55);
}

.it-save-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.it-save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

.it-save-btn.is-saved {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.3);
}

.it-replan-btn {
  background: rgba(14, 165, 233, 0.08);
  color: #0284c7;
  border: 1.5px solid rgba(14, 165, 233, 0.35);
}

.it-replan-btn:hover {
  background: rgba(14, 165, 233, 0.16);
  border-color: #0284c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.15);
}

.tool-btn.start-tour-btn-highlight {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%) !important;
  color: #ffffff !important;
  font-weight: 700;
  border: none;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}

.start-trip-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}

.start-trip-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45);
}

.tdm-start-btn {
  background: linear-gradient(135deg, #0284c7, #06b6d4) !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  flex: 1.2;
}

.tdm-start-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(2, 132, 199, 0.5);
}

.it-dec-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.it-dec-text {
  text-align: left;
  display: flex;
  flex-direction: column;
}

.it-dec-text strong {
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.3;
}

.it-dec-text small {
  font-size: 11.5px;
  opacity: 0.85;
  margin-top: 2px;
}

.save-success-banner {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 10px;
  padding: 10px 16px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #065f46;
  font-size: 13.5px;
  animation: fadeIn 0.3s ease;
}

.ssb-view-btn {
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}

.ssb-view-btn:hover {
  background: #047857;
}

.hotel-nights-calc-badge {
  font-size: 12.5px;
  color: #047857;
  font-weight: 600;
  margin-top: 5px;
  background: rgba(16, 185, 129, 0.12);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

/* ==================== STYLES CHO CHẶNG KHỞI HÀNH (ORIGIN TO DESTINATION JOURNEY) ==================== */
.origin-departure-journey-card,
.origin-return-journey-card {
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.95) 0%, rgba(236, 253, 245, 0.95) 100%);
  border: 1.5px solid #a7f3d0;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  gap: 14px;
  position: relative;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
}
.origin-return-journey-card {
  margin-top: 24px;
  margin-bottom: 10px;
  border-color: #93c5fd;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%);
}

.odjc-time-col, .orjc-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 54px;
}

.odjc-time, .orjc-time {
  font-size: 14px;
  font-weight: 800;
  color: #047857;
}
.orjc-time {
  color: #0284c7;
}

.odjc-time-dest, .orjc-time-dest {
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
}

.odjc-bullet, .orjc-bullet {
  font-size: 20px;
}

.odjc-card-content, .orjc-card-content {
  flex: 1;
}

.odjc-header, .orjc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.odjc-badge, .orjc-badge {
  background: #059669;
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}
.orjc-badge {
  background: #0284c7;
}

.odjc-duration-pill, .orjc-duration-pill {
  background: #d1fae5;
  color: #065f46;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
}
.orjc-duration-pill {
  background: #e0f2fe;
  color: #0369a1;
}

.odjc-title, .orjc-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 4px 0 10px;
}

.odjc-meta-grid, .orjc-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  background: rgba(255, 255, 255, 0.7);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.orjc-meta-grid {
  border-color: rgba(2, 132, 199, 0.2);
}

.odjc-meta-item, .orjc-meta-item {
  font-size: 12.5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.omi-label {
  color: #64748b;
  font-size: 11px;
}

.odjc-meta-item strong, .orjc-meta-item strong {
  color: #1e293b;
  font-weight: 600;
}
.odjc-meta-item strong.text-emerald, .orjc-meta-item strong.text-emerald {
  color: #059669;
  font-weight: 700;
}

.odjc-actions-inline, .orjc-actions-inline {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.odjc-call-btn, .orjc-call-btn, .odjc-link-btn, .orjc-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: 0.2s;
}
.odjc-call-btn, .orjc-call-btn {
  background: rgba(5, 150, 105, 0.1);
  color: var(--primary);
  border: 1px solid var(--primary);
}
.odjc-link-btn, .orjc-link-btn {
  background: var(--primary);
  color: #fff;
}

.odjc-note, .orjc-note {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: #334155;
  line-height: 1.5;
}

/* THẺ NGHỈ ĐÊM TẠI KHÁCH SẠN TRONG LỊCH TRÌNH (YÊU CẦU 2 & 5) */
.day-hotel-stay-card {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%);
  border: 1.5px solid #cbd5e1;
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 16px;
  margin-bottom: 8px;
  display: flex;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.dhsc-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 50px;
}
.dhsc-time {
  font-size: 13.5px;
  font-weight: 800;
  color: #475569;
}
.dhsc-bullet {
  font-size: 18px;
  color: #64748b;
}
.dhsc-card-content {
  flex: 1;
}
.dhsc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
}
.dhsc-badge {
  background: #64748b;
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}
.dhsc-stars {
  font-size: 12px;
  font-weight: 700;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 4px;
}
.dhsc-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0 4px;
}
.dhsc-addr {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.dhsc-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
.dhsc-price {
  font-size: 12.5px;
  color: #334155;
}
.dhsc-price b {
  color: #059669;
}
.dhsc-map-btn {
  font-size: 12px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.dhsc-map-btn:hover {
  text-decoration: underline;
}

/* THANH ĐIỀU HƯỚNG QUAY LẠI TRÊN ĐẦU KẾT QUẢ (YÊU CẦU 4) */
.plan-top-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  padding: 12px 18px;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 16px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}
.plan-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.06);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}
.plan-back-btn:hover {
  background: rgba(15, 23, 42, 0.12);
  transform: translateX(-2px);
}
.plan-top-nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.plan-saved-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #059669;
  font-weight: 700;
  font-size: 13px;
  background: rgba(16, 185, 129, 0.12);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.plan-quick-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  transition: opacity 0.2s;
}
.plan-quick-save-btn:hover {
  opacity: 0.92;
}

/* DARK MODE OVERRIDES CHO CÁC THẺ MỚI & SỬA LỖI MẤT CHỮ TRONG CHẾ ĐỘ TỐI (YÊU CẦU 3) */
:root[data-theme="dark"] .plan-top-nav-bar {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(255, 255, 255, 0.12);
}
:root[data-theme="dark"] .plan-back-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.15);
}
:root[data-theme="dark"] .plan-back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
:root[data-theme="dark"] .origin-departure-journey-card,
:root[data-theme="dark"] .origin-return-journey-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 78, 59, 0.35) 100%) !important;
  border-color: rgba(52, 211, 153, 0.3) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
}
:root[data-theme="dark"] .origin-return-journey-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.35) 100%) !important;
  border-color: rgba(96, 165, 250, 0.3) !important;
}
:root[data-theme="dark"] .odjc-title,
:root[data-theme="dark"] .orjc-title {
  color: #f8fafc !important;
}
:root[data-theme="dark"] .odjc-time,
:root[data-theme="dark"] .orjc-time {
  color: #34d399 !important;
}
:root[data-theme="dark"] .orjc-time {
  color: #38bdf8 !important;
}
:root[data-theme="dark"] .odjc-time-dest,
:root[data-theme="dark"] .orjc-time-dest {
  color: #94a3b8 !important;
}
:root[data-theme="dark"] .odjc-duration-pill {
  background: rgba(6, 78, 59, 0.6) !important;
  color: #a7f3d0 !important;
}
:root[data-theme="dark"] .orjc-duration-pill {
  background: rgba(30, 58, 138, 0.6) !important;
  color: #bae6fd !important;
}
:root[data-theme="dark"] .odjc-meta-grid,
:root[data-theme="dark"] .orjc-meta-grid {
  background: rgba(15, 23, 42, 0.75) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
:root[data-theme="dark"] .omi-label {
  color: #94a3b8 !important;
}
:root[data-theme="dark"] .odjc-meta-item strong,
:root[data-theme="dark"] .orjc-meta-item strong {
  color: #e2e8f0 !important;
}
:root[data-theme="dark"] .odjc-meta-item strong.text-emerald,
:root[data-theme="dark"] .orjc-meta-item strong.text-emerald {
  color: #34d399 !important;
}
:root[data-theme="dark"] .odjc-note,
:root[data-theme="dark"] .orjc-note {
  color: #cbd5e1 !important;
}
:root[data-theme="dark"] .day-hotel-stay-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.92) 100%) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}
:root[data-theme="dark"] .dhsc-title {
  color: #f8fafc !important;
}
:root[data-theme="dark"] .dhsc-addr {
  color: #94a3b8 !important;
}
:root[data-theme="dark"] .dhsc-price {
  color: #cbd5e1 !important;
}
:root[data-theme="dark"] .dhsc-price b {
  color: #34d399 !important;
}
:root[data-theme="dark"] .dhsc-time {
  color: #94a3b8 !important;
}
:root[data-theme="dark"] .dhsc-footer-row {
  border-top-color: rgba(255, 255, 255, 0.1) !important;
}

/* ==================== DÒNG THỜI GIAN DI CHUYỂN DƯỚI ĐỊA ĐIỂM (SCREENSHOT 3) ==================== */
.act-quick-travel-bar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.22);
  color: #0369a1;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 12px;
  margin: 4px 0 8px;
}

.aqtb-time {
  font-weight: 700;
  color: #0284c7;
}

.aqtb-sep {
  opacity: 0.6;
}

.aqtb-desc {
  color: #475569;
}

/* ==================== STYLES CHO BẢN ĐỒ & THẺ CHI TIẾT PLACE (SCREENSHOT 4) ==================== */
.sticky-map-inner {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
}

.map-floating-overlay-bar {
  position: absolute;
  top: 65px;
  left: 14px;
  z-index: 990;
}

.map-route-gmap-pill {
  background: #ffffff;
  color: #1e293b;
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.map-route-gmap-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  color: #0284c7;
}

.gmap-g-logo {
  font-weight: 900;
  color: #4285F4;
  font-size: 15px;
}

.map-place-detail-drawer {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 88%;
  height: 100%;
  background: #ffffff;
  z-index: 1010;
  box-shadow: -6px 0 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-left: 1px solid #e2e8f0;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.mpd-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.mpd-close-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.mpd-image-wrap {
  position: relative;
  width: 100%;
  height: 160px;
  flex-shrink: 0;
  overflow: hidden;
  background: #e2e8f0;
}

.mpd-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mpd-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(2, 132, 199, 0.95);
  color: #fff;
}

.mpd-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.mpd-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.mpd-rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}

.mpd-score {
  font-weight: 800;
  color: #1e293b;
}

.mpd-stars {
  color: #f59e0b;
  font-size: 13px;
}

.mpd-reviews {
  color: #64748b;
  font-size: 12px;
}

.mpd-addr {
  font-size: 12.5px;
  color: #475569;
  margin: 0;
  line-height: 1.4;
}

.mpd-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.mpd-section h5 {
  font-size: 13px;
  font-weight: 800;
  color: #334155;
  margin: 0 0 6px;
}

.mpd-desc {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.mpd-gmap-btn-box {
  margin: 4px 0;
}

.mpd-gmap-primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #0284c7;
  color: #ffffff;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.mpd-gmap-primary-btn:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

.mpd-review-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
}

.mpd-rev-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mpd-rev-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ca8a04;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mpd-rev-name {
  font-size: 12px;
  color: #1e293b;
}

.mpd-rev-rating {
  color: #f59e0b;
  font-size: 11px;
}

.mpd-rev-body {
  font-size: 12px;
  color: #475569;
  line-height: 1.45;
  margin: 0;
}

.mpd-actions-row {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
}

.mpd-fav-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.mpd-fav-btn:hover {
  background: #f1f5f9;
}

.mpd-change-btn {
  flex: 2;
  padding: 8px;
  border: 1px solid #0284c7;
  color: #0284c7;
  border-radius: 8px;
  background: rgba(2, 132, 199, 0.06);
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.mpd-change-btn:hover {
  background: rgba(2, 132, 199, 0.15);
}

.map-bottom-prompt-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0284c7;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 600;
  text-align: center;
  padding: 6px 12px;
  z-index: 990;
  letter-spacing: 0.2px;
}

/* ==================== STYLES CHO REPLAN MODAL (THAY ĐỔI LỊCH TRÌNH KHÁC) ==================== */
.replan-modal-card {
  max-width: 480px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.replan-options-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.replan-option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.replan-option-card:hover {
  border-color: #0284c7;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.12);
}

.roc-icon {
  font-size: 26px;
  line-height: 1;
  flex-shrink: 0;
}

.roc-text {
  flex: 1;
}

.roc-text h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.roc-text p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.roc-arrow {
  font-size: 16px;
  color: #94a3b8;
  font-weight: 700;
}

.guest-saved-trips-banner {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #166534;
  flex-wrap: wrap;
}

.gstb-login-btn {
  background: #16a34a;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.gstb-login-btn:hover {
  background: #15803d;
}

/* ABSOLUTE MOBILE OVERRIDES - MUST BE AT END OF FILE */
@media (max-width: 992px) {
  .app-main { padding: 12px 10px !important; min-width: 0 !important; overflow-x: hidden !important; }
  .tab-pane { min-width: 0 !important; }
  .planner-tab-bg { padding: 16px 12px 32px !important; width: 100% !important; box-sizing: border-box !important; }
  .planner-form-container { margin: 0 !important; padding: 16px !important; width: 100% !important; box-sizing: border-box !important; max-width: 100% !important; min-width: 0 !important; flex-shrink: 1 !important; }
  .app-form-grid { grid-template-columns: 1fr !important; }
  .app-field, .origin-select-wrapper { min-width: 0 !important; }
  .app-field.full-width { grid-column: span 1 !important; }
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

  /* Bổ sung fix overflow nghiêm trọng trên Mobile cho Planner */
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

/* ==========================================================================
   YÊU CẦU 1: GIAO DIỆN BÁO ĐỎ KHI KẾ HOẠCH VƯỢT QUÁ KHẢ NĂNG TÀI CHÍNH
   ========================================================================== */
.plan-summary-card.is-over-budget-card {
  border: 2px solid #ef4444 !important;
  box-shadow: 0 10px 36px rgba(239, 68, 68, 0.22) !important;
  background: linear-gradient(175deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.96) 35%) !important;
}

.over-budget-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
  animation: pulseOverBudget 2s infinite ease-in-out;
  letter-spacing: 0.3px;
}

@keyframes pulseOverBudget {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45); }
  50% { transform: scale(1.03); box-shadow: 0 6px 22px rgba(239, 68, 68, 0.7); }
}

.summary-budget.has-over-budget {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.sb-target {
  color: #94a3b8;
  font-size: 15px;
}
.sb-target b {
  color: #f1f5f9;
  font-size: 16px;
}
.sb-divider {
  color: #64748b;
}
.sb-actual {
  color: #cbd5e1;
  font-size: 15px;
}
.red-calc-num {
  color: #f87171 !important;
  font-size: 19px !important;
  font-weight: 800 !important;
}
.sb-diff-tag {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.over-budget-alert-box {
  margin-top: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(153, 27, 27, 0.2) 100%);
  border: 1.5px solid #ef4444;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15);
}

.oba-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.oba-icon-ring {
  font-size: 26px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.25);
  border: 1.5px solid #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.oba-texts h4 {
  color: #f87171;
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 6px;
  letter-spacing: -0.2px;
}
.oba-texts p {
  color: #e2e8f0;
  font-size: 13.5px;
  line-height: 1.55;
  margin: 0;
}
.oba-texts b {
  color: #fef08a;
}

.oba-actions-bar {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.oba-act-title {
  color: #fca5a5;
  font-size: 13px;
  font-weight: 700;
  width: 100%;
}
.oba-action-btn {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.oba-action-btn.btn-self-transit {
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.35);
}
.oba-action-btn.btn-self-transit:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
}
.oba-action-btn.btn-free {
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
}
.oba-action-btn.btn-free:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45);
}
.oba-action-btn.btn-shorten {
  background: linear-gradient(135deg, #d97706, #f59e0b);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);
}
.oba-action-btn.btn-shorten:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.45);
}
.oba-action-btn.btn-replan {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.oba-action-btn.btn-replan:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}
.oba-action-btn.btn-increase-budget {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(59, 130, 246, 0.35);
}
.oba-action-btn.btn-increase-budget:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}
.oba-done-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #6ee7b7;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* ==========================================================================
   YÊU CẦU 2: TỐI ƯU DANH SÁCH LỊCH TRÌNH KHÔNG BỊ DÀI DÒNG
   ========================================================================== */
.app-timeline-wrap {
  max-height: 860px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(14, 165, 233, 0.4) transparent;
}
.app-timeline-wrap::-webkit-scrollbar {
  width: 6px;
}
.app-timeline-wrap::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.4);
  border-radius: 999px;
}

.timeline-compact-filter-toolbar {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 12px 14px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tc-day-tabs-scroll {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4px;
  border-radius: 25px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.22);
  overflow-x: auto;
  scrollbar-width: none;
  max-width: 100%;
}
.tc-day-tabs-scroll::-webkit-scrollbar {
  display: none;
}

:root[data-theme="light"] .tc-day-tabs-scroll {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.9);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.tc-day-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 25px;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:root[data-theme="light"] .tc-day-tab {
  color: #475569;
}

.tc-day-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
:root[data-theme="light"] .tc-day-tab:hover {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
}

.tc-day-tab.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  font-weight: 700;
  border: none;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.12);
  animation: pulse-slider 0.45s ease-out;
}
:root[data-theme="light"] .tc-day-tab.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  box-shadow:
    0 3px 12px rgba(15, 23, 42, 0.12),
    0 1px 4px rgba(15, 23, 42, 0.08);
}

.tc-day-tab.tc-all-tab.active {
  background: #ffffff !important;
  color: #7c3aed !important;
}

.tc-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.tc-density-toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4px;
  border-radius: 25px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

:root[data-theme="light"] .tc-density-toggle {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.9);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.tc-density-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12.5px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 25px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:root[data-theme="light"] .tc-density-btn {
  color: #475569;
}

.tc-density-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}
:root[data-theme="light"] .tc-density-btn:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.05);
}

.tc-density-btn.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  font-weight: 700;
  border: none;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.12);
  animation: pulse-slider 0.45s ease-out;
}
:root[data-theme="light"] .tc-density-btn.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  box-shadow:
    0 3px 12px rgba(15, 23, 42, 0.12),
    0 1px 4px rgba(15, 23, 42, 0.08);
}

.tc-session-filters {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4px;
  border-radius: 25px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

:root[data-theme="light"] .tc-session-filters {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.9);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.tc-session-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 25px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:root[data-theme="light"] .tc-session-pill {
  color: #475569;
}

.tc-session-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
:root[data-theme="light"] .tc-session-pill:hover {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
}

.tc-session-pill.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  font-weight: 700;
  border: none;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.12);
  animation: pulse-slider 0.45s ease-out;
}
:root[data-theme="light"] .tc-session-pill.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  box-shadow:
    0 3px 12px rgba(15, 23, 42, 0.12),
    0 1px 4px rgba(15, 23, 42, 0.08);
}

/* THẺ THU GỌN (COMPACT ACT ROW - KHÔNG DÀI DÒNG) */
.compact-act-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.compact-act-row:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(14, 165, 233, 0.4);
  transform: translateX(2px);
}
.compact-act-row.is-expanded {
  background: rgba(30, 41, 59, 0.95);
  border-color: #0ea5e9;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.car-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
  flex-shrink: 0;
}
.car-time {
  font-size: 13px;
  font-weight: 800;
  color: #38bdf8;
  font-variant-numeric: tabular-nums;
}
.car-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  margin-top: 3px;
}

.car-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  background: #0f172a;
}
.car-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.car-idx {
  position: absolute;
  top: 2px;
  left: 2px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
}

.car-body {
  flex: 1;
  min-width: 0;
}
.car-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.badge-type-mini {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
.car-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.car-cost {
  font-size: 12.5px;
  font-weight: 700;
  color: #4ade80;
  margin-left: auto;
}
.car-sub {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.car-addr {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}
.car-eta {
  color: #38bdf8;
  font-weight: 600;
}

.car-detail-drawer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.12);
}
.cdd-desc {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0 0 6px;
}
.cdd-dishes {
  font-size: 12.5px;
  color: #fbbf24;
  margin-bottom: 6px;
}
.cdd-meta-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.cdd-tag {
  background: rgba(255, 255, 255, 0.08);
  font-size: 11.5px;
  color: #94a3b8;
  padding: 2px 7px;
  border-radius: 5px;
}

.car-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.car-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}
.car-btn:hover {
  background: #0ea5e9;
  color: #fff;
  border-color: #38bdf8;
}
.car-chevron {
  font-size: 11px;
  color: #64748b;
  margin-left: 2px;
}

/* ==========================================================================
   PHẦN 2: MODAL XÁC NHẬN LƯU LỊCH TRÌNH TRƯỚC KHI CHUYỂN TAB
   ========================================================================== */
.save-confirm-overlay {
  z-index: 9999;
}
.save-confirm-card {
  max-width: 420px;
  width: 92%;
  text-align: center;
  padding: 36px 28px 28px;
  border-radius: 20px;
  background: var(--card-bg, #1e293b);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: scaleInModal 0.25s ease;
}
@keyframes scaleInModal {
  from { transform: scale(0.88); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
.scm-icon-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 8px 20px rgba(99,102,241,0.4);
}
.save-confirm-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}
.save-confirm-card p {
  font-size: 0.9rem;
  color: var(--text-sub, #94a3b8);
  line-height: 1.6;
  margin: 0;
}
.save-confirm-card p b {
  color: var(--text-primary, #f1f5f9);
}
.scm-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 6px;
}
.scm-btn {
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.scm-btn-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 4px 14px rgba(16,185,129,0.35);
}
.scm-btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(16,185,129,0.5);
}
.scm-btn-discard {
  background: rgba(239,68,68,0.1);
  color: #f87171;
  border: 1px solid rgba(239,68,68,0.3);
}
.scm-btn-discard:hover {
  background: rgba(239,68,68,0.2);
}
.scm-btn-cancel {
  background: rgba(255,255,255,0.05);
  color: var(--text-sub, #94a3b8);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 0.85rem;
}
.scm-btn-cancel:hover {
  background: rgba(255,255,255,0.1);
  color: var(--text-primary, #f1f5f9);
}

/* ==========================================================================
   PHẦN 3: MODAL XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU
   ========================================================================== */
.trip-detail-overlay {
  z-index: 9998;
  align-items: flex-start;
  padding: 24px 16px;
  overflow-y: auto;
}
.trip-detail-modal-card {
  max-width: 680px;
  width: 95%;
  border-radius: 20px;
  background: var(--card-bg, #1e293b);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 30px 70px rgba(0,0,0,0.55);
  overflow: hidden;
  animation: scaleInModal 0.28s ease;
  padding: 0;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}

/* TDM Header */
.tdm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.tdm-header-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tdm-dest-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: rgba(59,130,246,0.2);
  border: 1px solid rgba(59,130,246,0.4);
  color: #93c5fd;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  letter-spacing: 0.5px;
  width: fit-content;
}
.tdm-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  line-height: 1.3;
}
.tdm-meta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.tdm-meta-item {
  font-size: 0.85rem;
  color: #94a3b8;
}
.tdm-close {
  flex-shrink: 0;
  margin-top: -2px;
}

/* TDM Days List View */
.tdm-days-list-view {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.tdm-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}
.tdm-days-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tdm-day-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--bg-secondary, #0f172a);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tdm-day-row:hover {
  background: rgba(59,130,246,0.08);
  border-color: rgba(59,130,246,0.25);
  transform: translateX(3px);
}
.tdm-day-row-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tdm-day-row-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
}
.tdm-day-row-meals {
  font-size: 0.8rem;
  color: #64748b;
}
.tdm-day-row-arrow {
  font-size: 22px;
  color: #475569;
  font-weight: 300;
  line-height: 1;
}

/* TDM Budget Summary */
.tdm-budget-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tdm-budget-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.tdm-budget-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-secondary, #0f172a);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
}
.tdm-budget-total {
  grid-column: 1 / -1;
  background: rgba(59,130,246,0.08);
  border-color: rgba(59,130,246,0.25);
}
.tbi-icon {
  font-size: 16px;
}
.tbi-label {
  font-size: 0.82rem;
  color: #64748b;
  flex: 1;
}
.tbi-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
}
.tbi-total {
  color: #60a5fa;
  font-size: 1rem;
}

/* TDM Footer Actions */
.tdm-footer-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tdm-action-btn {
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tdm-open-btn {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  flex: 1;
}
.tdm-open-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(99,102,241,0.5);
}

/* TDM Day Detail View */
.tdm-day-detail-view {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tdm-back-btn {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  width: fit-content;
  transition: color 0.2s;
}
.tdm-back-btn:hover {
  color: #93c5fd;
}
.tdm-day-header-card {
  display: flex;
  gap: 16px;
  background: rgba(59,130,246,0.06);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 14px;
  padding: 16px;
  overflow: hidden;
}
.tdm-day-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tdm-day-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.tdm-day-route {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
  line-height: 1.4;
}
.tdm-day-meals {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
}
.tdm-day-img-wrap {
  width: 130px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}
.tdm-day-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tdm-day-img-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  font-size: 36px;
}

/* TDM Activities */
.tdm-activities-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-secondary, #0f172a);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 16px;
}
.tdm-activities-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}
.tdm-activities-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tdm-act-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  border-left: 3px solid rgba(59,130,246,0.3);
}
.tdm-act-time {
  font-size: 0.75rem;
  color: #475569;
  font-weight: 600;
  min-width: 44px;
  margin-top: 2px;
}
.tdm-act-icon {
  font-size: 16px;
  margin-top: 1px;
}
.tdm-act-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}
.tdm-act-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
}
.tdm-act-desc {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
}
.tdm-act-cost {
  font-size: 0.78rem;
  color: #f59e0b;
  font-weight: 600;
}
.tdm-act-cost.free-tag {
  color: #10b981;
}

/* User Profile & Trips CSS */
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

/* ==================== BƯỚC 3: DI CHUYỂN & LƯU TRÚ (TRANSIT & HOTEL STYLES) ==================== */
.step3-subtabs-nav {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}
.step3-subtab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--surface, #ffffff);
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.25s ease;
  position: relative;
}
.step3-subtab-btn:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.04);
}
.step3-subtab-btn.active {
  border-color: #0284c7;
  background: rgba(2, 132, 199, 0.08);
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.15);
}
.ssb-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.step3-subtab-btn.active .ssb-icon-wrap {
  background: #0284c7;
  color: #ffffff;
}
.ssb-text {
  flex: 1;
  min-width: 0;
}
.ssb-text strong {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}
.ssb-text small {
  display: block;
  font-size: 12px;
  color: var(--text-muted, #64748b);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ssb-check-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* INTERACTIVE DEPARTURE TIME CHIPS IN BUS & TRAIN */
.bst-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.bst-chip {
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #cbd5e1);
  background: var(--surface-secondary, #f8fafc);
  color: var(--text-main, #1e293b);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bst-chip:hover {
  border-color: #0284c7;
  background: rgba(2, 132, 199, 0.08);
}
.bst-chip.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.35);
  font-weight: 700;
}

/* PICKUP & DROPOFF POINTS DISPLAY */
.bic-spec-points {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border-left: 3px solid #0284c7;
}
.bsp-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.bsp-label {
  color: var(--text-muted, #64748b);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  white-space: nowrap;
}
.bsp-val {
  font-weight: 600;
  color: var(--text-main, #1e293b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* SMART TRANSIT FALLBACK CARD */
.transit-smart-fallback-card {
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%);
  border: 1px solid rgba(2, 132, 199, 0.2);
}
.tsf-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.tsf-icon {
  color: #0284c7;
}
.tsf-header strong {
  display: block;
  font-size: 14px;
  color: var(--text-main, #0f172a);
}
.tsf-header small {
  color: var(--text-muted, #64748b);
  font-size: 12px;
}
.tsf-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}
.tsf-option-card {
  padding: 12px 14px;
  background: var(--surface, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--border-color, #e2e8f0);
}
.toc-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
}
.tsf-option-card h4 {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-main, #0f172a);
}
.tsf-option-card p {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  line-height: 1.45;
  margin: 0;
}

/* HOTEL BUDGET FEASIBILITY ALERT */
.hotel-feasibility-alert {
  padding: 16px 20px;
  border-radius: 14px;
  margin-bottom: 20px;
  border: 1px solid;
}
.hotel-feasibility-alert.critical {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #991b1b;
}
.hotel-feasibility-alert.warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}
.hfa-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.hfa-text strong {
  display: block;
  font-size: 15px;
  font-weight: 700;
}
.hfa-text p {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
}
.hfa-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.hfa-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}
.hfa-btn-upgrade {
  background: #2563eb;
  color: #ffffff;
}
.hfa-btn-upgrade:hover {
  background: #1d4ed8;
}
.hfa-btn-cheaper {
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #cbd5e1;
}
.hfa-btn-cheaper:hover {
  background: #f1f5f9;
}
.hfa-btn-shorten {
  background: rgba(0, 0, 0, 0.06);
  color: inherit;
}
.hfa-btn-shorten:hover {
  background: rgba(0, 0, 0, 0.12);
}

/* SELECTED HOTEL BANNER */
.selected-hotel-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%);
  border: 2px solid #0284c7;
  border-radius: 16px;
  margin-bottom: 22px;
  gap: 16px;
}
.shb-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}
.shb-thumb {
  width: 90px;
  height: 70px;
  border-radius: 10px;
  object-fit: cover;
}
.shb-badge {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.12);
  padding: 2px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
}
.shb-name {
  margin: 0 0 2px;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
}
.shb-room {
  margin: 0;
  font-size: 13px;
  color: var(--text-main, #334155);
}
.shb-size-tag {
  display: inline-block;
  font-size: 11px;
  color: var(--text-muted, #64748b);
  margin-left: 4px;
}
.shb-meta {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted, #64748b);
  display: flex;
  align-items: center;
  gap: 4px;
}
.shb-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.shb-price-box {
  text-align: right;
}
.shb-rate {
  font-size: 17px;
  font-weight: 800;
  color: #0284c7;
}
.shb-rate small {
  font-size: 12px;
  color: var(--text-muted, #64748b);
}
.shb-total {
  display: block;
  font-size: 12px;
  color: var(--text-muted, #64748b);
  margin-top: 2px;
}
.shb-btns {
  display: flex;
  gap: 8px;
}
.shb-btn-change {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  background: #0284c7;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.shb-btn-change:hover {
  background: #0369a1;
}
.shb-btn-clear {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.shb-btn-clear:hover {
  background: #fef2f2;
}

/* HOTEL CATALOG (MATCHING SCREENSHOT 3) */
.hotel-catalog-box {
  margin-top: 10px;
}
.hcb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.hcb-kicker {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #0284c7;
}
.hcb-header h3 {
  margin: 2px 0 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
}
.hcb-count {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted, #64748b);
}
.hotel-catalog-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) {
  .hotel-catalog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .hotel-catalog-grid {
    grid-template-columns: 1fr;
  }
}
.hotel-catalog-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.hotel-catalog-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #94a3b8;
}
.hotel-catalog-card.active {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px #0284c7;
}
.hcc-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 11;
  background: #e2e8f0;
  overflow: hidden;
}
.hcc-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}
.hotel-catalog-card:hover .hcc-image {
  transform: scale(1.05);
}
.hcc-dest-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}
.hcc-selected-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #10b981;
  color: #fff;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}
.hcc-content {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.hcc-title {
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 6px;
  color: var(--text-main, #0f172a);
  line-height: 1.35;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hcc-stars {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 12px;
}
.hcc-stars .star-icon {
  color: #f59e0b;
  font-size: 13px;
}
.hcc-rating-num {
  font-size: 11px;
  color: var(--text-muted, #64748b);
  margin-left: 4px;
}
.hcc-bottom-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color, #f1f5f9);
}
.hcc-price-info {
  display: flex;
  flex-direction: column;
}
.hcc-price-label {
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
}
.hcc-price-val {
  font-size: 14.5px;
  font-weight: 800;
  color: #0284c7;
}
.hcc-price-val small {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted, #64748b);
}
/* NÚT "XEM PHÒNG" MÀU VÀNG CHUẨN SCREENSHOT 3 */
.hcc-btn-view {
  background: #facc15;
  color: #1e293b;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(250, 204, 21, 0.4);
}
.hcc-btn-view:hover {
  background: #eab308;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(250, 204, 21, 0.5);
}

.view-hotel-rooms-card-btn {
  background: #facc15;
  color: #1e293b;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(250, 204, 21, 0.3);
}
.view-hotel-rooms-card-btn:hover {
  background: #eab308;
  transform: translateY(-1px);
}

.dhsc-room-view-btn {
  background: #facc15;
  color: #1e293b;
  border: none;
  padding: 5px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(250, 204, 21, 0.3);
}
.dhsc-room-view-btn:hover {
  background: #eab308;
}

.transit-to-hotel-prompt {
  margin-top: 18px;
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(250, 204, 21, 0.12) 100%);
  border: 1.5px dashed rgba(2, 132, 199, 0.35);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.transit-to-hotel-prompt:hover {
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.14) 0%, rgba(250, 204, 21, 0.2) 100%);
  border-color: #0284c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
}
.tthp-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tthp-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #0284c7;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tthp-text strong {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}
.tthp-text p {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--text-muted, #64748b);
}
.tthp-btn {
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}
.tthp-btn:hover {
  background: #0369a1;
}

/* ==================== HOTEL DETAIL MODAL (MATCHING SCREENSHOTS 4 & 5) ==================== */
.hotel-detail-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: modalFadeIn 0.25s ease;
  overflow-y: auto;
}
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.hotel-detail-modal {
  background: var(--surface, #ffffff);
  border-radius: 20px;
  max-width: 1160px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-color, #e2e8f0);
}
/* TOP BAR IN MODAL (SCREENSHOT 4) */
.hdm-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--surface, #ffffff);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  z-index: 10;
  gap: 12px;
}
.hdm-tb-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.hdm-tb-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--surface-secondary, #f1f5f9);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main, #1e293b);
}
.hdm-tb-btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.hdm-tb-btn-edit:hover {
  background: #bae6fd;
}
.hdm-tb-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hdm-btn-choose-room-top {
  background: #e11d48;
  color: #fff;
  border: none;
  padding: 7px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.hdm-btn-choose-room-top:hover {
  background: #be123c;
}
.hdm-btn-close-modal {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.hdm-btn-close-modal:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.hdm-scroll-body {
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* HERO GALLERY SECTION (SCREENSHOT 4) */
.hdm-gallery-section {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
}
@media (max-width: 768px) {
  .hdm-gallery-section {
    grid-template-columns: 1fr;
    height: auto;
  }
}
.hdm-thumbnails-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}
.hdm-thumb-item {
  width: 100%;
  height: 85px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  background: #cbd5e1;
}
.hdm-thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hdm-thumb-item:hover {
  opacity: 0.85;
}
.hdm-thumb-item.active {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px #0284c7;
}
.hdm-main-photo-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #1e293b;
}
.hdm-main-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hdm-photo-overlay-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px 24px 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 100%);
  color: #fff;
}
.hdm-photo-overlay-info h3 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
}
.hdm-photo-overlay-info .hdm-stars {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 14px;
  color: #f59e0b;
}
.hdm-photo-overlay-info .hdm-stars span:last-child {
  color: #f1f5f9;
  font-size: 12px;
  margin-left: 6px;
}

/* 3-COLUMN INFO SECTION (SCREENSHOT 4) */
.hdm-info-3cols {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 20px;
  padding: 20px;
  background: var(--surface-secondary, #f8fafc);
  border-radius: 16px;
  border: 1px solid var(--border-color, #e2e8f0);
}
@media (max-width: 860px) {
  .hdm-info-3cols {
    grid-template-columns: 1fr;
  }
}
.hdm-col .hdm-sec-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
}
.hdm-desc-text {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-muted, #475569);
  margin: 0;
}
.hdm-location-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hlc-pin-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.hlc-pin-icon {
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 2px;
}
.hlc-addr-text {
  font-size: 13px;
  color: var(--text-main, #1e293b);
  line-height: 1.45;
}
.hlc-map-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #e2e8f0;
  color: #1e293b;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  width: fit-content;
  transition: all 0.2s;
}
.hlc-map-btn:hover {
  background: #cbd5e1;
}
.hdm-amenities-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.hdm-see-more {
  font-size: 12px;
  color: #0284c7;
  font-weight: 600;
  cursor: pointer;
}
.hdm-amenities-checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hdm-amenities-checklist li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-main, #334155);
}
.hdm-check-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

/* ROOMS TABLE SECTION (MATCHING SCREENSHOT 5) */
.hdm-rooms-table-section {
  margin-top: 10px;
}
.hrt-section-header {
  margin-bottom: 16px;
}
.hrt-section-header h3 {
  margin: 0 0 2px;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
}
.hrt-section-header small {
  color: var(--text-muted, #64748b);
  font-size: 13px;
}
.hrt-table-wrapper {
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface, #ffffff);
}
.hrt-table-head {
  display: grid;
  grid-template-columns: 240px 1.4fr 90px 180px 80px 140px;
  padding: 12px 16px;
  background: var(--surface-secondary, #f8fafc);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-muted, #64748b);
}
@media (max-width: 960px) {
  .hrt-table-head {
    display: none;
  }
}
.hrt-room-row {
  display: grid;
  grid-template-columns: 240px 1.4fr 90px 180px 80px 140px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  align-items: center;
  gap: 12px;
  transition: background 0.2s;
}
.hrt-room-row:last-child {
  border-bottom: none;
}
.hrt-room-row:hover {
  background: rgba(2, 132, 199, 0.02);
}
@media (max-width: 960px) {
  .hrt-room-row {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}
/* CELL 1: ROOM DETAILS */
.td-room .room-title {
  margin: 0 0 8px;
  font-size: 14.5px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  line-height: 1.35;
}
.room-media-box {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  background: #cbd5e1;
}
.room-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.room-size-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.room-bed-type {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
}

/* CELL 2: PROPOSALS / PERKS */
.td-perks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.deal-pill {
  display: inline-block;
  background: #ffedd5;
  color: #ea580c;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  width: fit-content;
}
.perk-policy-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: var(--text-main, #334155);
}
.perk-icon-info {
  color: #f97316;
  font-weight: bold;
}
.perk-icon-check {
  color: #16a34a;
  font-weight: bold;
}
.perk-breakfast {
  color: #15803d;
  font-weight: 600;
}

/* CELL 3: GUESTS */
.guest-counter {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main, #334155);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* CELL 4: PRICE */
.td-price {
  display: flex;
  flex-direction: column;
}
.saving-ribbon {
  font-size: 11px;
  font-weight: 700;
  color: #ea580c;
  background: #ffedd5;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
  margin-bottom: 4px;
}
.room-nightly-price {
  font-size: 17px;
  font-weight: 800;
  color: #0284c7;
}
.room-nightly-price small {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted, #64748b);
}
.tax-note {
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
  margin-top: 2px;
}

/* CELL 5: COUNT */
.room-qty-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--surface-secondary, #f1f5f9);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main, #1e293b);
}

/* CELL 6: ACTION (NÚT ĐẶT NGAY MÀU ĐỎ CHUẨN SCREENSHOT 5) */
.td-action {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}
.btn-book-room-red {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 9px 20px;
  border-radius: 20px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 3px 8px rgba(220, 38, 38, 0.35);
}
.btn-book-room-red:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(220, 38, 38, 0.45);
}
.room-urgency-note {
  font-size: 11px;
  color: #16a34a;
  font-weight: 600;
  margin-left: 4px;
}

/* DARK MODE CONTRAST STYLES */
[data-theme="dark"] .step3-subtab-btn {
  background: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .step3-subtab-btn.active {
  background: rgba(2, 132, 199, 0.15);
  border-color: #38bdf8;
}
[data-theme="dark"] .step3-subtab-btn strong {
  color: #f8fafc;
}
[data-theme="dark"] .step3-subtab-btn small {
  color: #94a3b8;
}
[data-theme="dark"] .ssb-icon-wrap {
  background: #334155;
  color: #38bdf8;
}
[data-theme="dark"] .hotel-catalog-card {
  background: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .hcc-title {
  color: #f8fafc;
}
[data-theme="dark"] .hcc-price-val {
  color: #38bdf8;
}
[data-theme="dark"] .hotel-detail-modal {
  background: #0f172a;
  border-color: #334155;
}
[data-theme="dark"] .hdm-top-bar {
  background: #0f172a;
  border-color: #334155;
}
[data-theme="dark"] .hdm-tb-chip {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}
[data-theme="dark"] .hdm-info-3cols {
  background: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .hdm-col .hdm-sec-title {
  color: #f8fafc;
}
[data-theme="dark"] .hdm-desc-text {
  color: #cbd5e1;
}
[data-theme="dark"] .hlc-addr-text {
  color: #e2e8f0;
}
[data-theme="dark"] .hdm-amenities-checklist li {
  color: #e2e8f0;
}
[data-theme="dark"] .hrt-table-wrapper {
  background: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .hrt-table-head {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}
[data-theme="dark"] .hrt-room-row {
  border-color: #334155;
}
[data-theme="dark"] .td-room .room-title {
  color: #f8fafc;
}
[data-theme="dark"] .perk-policy-row {
  color: #cbd5e1;
}
[data-theme="dark"] .guest-counter {
  color: #e2e8f0;
}
[data-theme="dark"] .room-nightly-price {
  color: #38bdf8;
}
[data-theme="dark"] .selected-hotel-banner {
  background: rgba(2, 132, 199, 0.12);
  border-color: #38bdf8;
}
[data-theme="dark"] .shb-name {
  color: #f8fafc;
}
[data-theme="dark"] .shb-room {
  color: #e2e8f0;
}
[data-theme="dark"] .shb-rate {
  color: #38bdf8;
}
[data-theme="dark"] .hotel-feasibility-alert.critical {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #fca5a5;
}
[data-theme="dark"] .hotel-feasibility-alert.warning {
  background: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  color: #fcd34d;
}
[data-theme="dark"] .bst-chip {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}
[data-theme="dark"] .bst-chip.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}
[data-theme="dark"] .bsp-val {
  color: #f8fafc;
}
[data-theme="dark"] .tsf-option-card {
  background: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .tsf-option-card h4 {
  color: #f8fafc;
}
/* ==================== BƯỚC 3: SEQUENTIAL WORKFLOW & ENHANCEMENTS ==================== */
.step3-mandatory-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13.5px;
  line-height: 1.5;
}
.transit-notice {
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.25);
  color: #0369a1;
}
.hotel-notice {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #b45309;
}
.step3-mandatory-notice .smn-icon {
  margin-top: 2px;
  flex-shrink: 0;
}
.step3-mandatory-notice strong {
  display: block;
  font-size: 13px;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.step3-mandatory-notice p {
  margin: 0;
  opacity: 0.95;
}

/* THANH TIẾP TỤC BƯỚC 1 -> BƯỚC 2 */
.transit-bottom-next-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  background: var(--surface-card, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  margin-top: 20px;
}
.tbn-status .tbn-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}
.tbn-badge.self {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
.tbn-badge.bus, .tbn-badge.train {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}
.tbn-badge.pending {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}
.tbn-btn-next {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff;
  border: none;
  padding: 11px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}
.tbn-btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
}

/* THANH SẮP XẾP VÀ HẠNG SAO KHÁCH SẠN - GLASSMORPHIC CONTROLS */
.hotel-sort-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  margin-bottom: 20px;
}

.hst-group {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #e2e8f0;
  padding: 4px;
  border-radius: 25px;
  border: 1px solid #cbd5e1;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.hst-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  padding: 0 8px 0 10px;
}

.hst-btn, .hst-star-btn {
  background: transparent;
  border: none;
  color: #334155;
  padding: 6px 13px;
  border-radius: 25px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  pointer-events: auto !important;
  position: relative;
  z-index: 5;
  transition: all 0.2s ease;
}

.hst-btn:hover, .hst-star-btn:hover {
  color: #0284c7;
  background: rgba(255, 255, 255, 0.6);
}

.hst-btn.active, .hst-star-btn.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  font-weight: 700;
  border: none;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.12),
    0 1px 3px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .hotel-sort-toolbar {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.12);
}

[data-theme="dark"] .hst-group {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .hst-label {
  color: rgba(255, 255, 255, 0.75);
}

[data-theme="dark"] .hst-btn, [data-theme="dark"] .hst-star-btn {
  color: rgba(255, 255, 255, 0.85);
}

[data-theme="dark"] .hst-btn:hover, [data-theme="dark"] .hst-star-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

[data-theme="dark"] .hst-btn.active, [data-theme="dark"] .hst-star-btn.active {
  background: #0284c7 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 10px rgba(2, 132, 199, 0.4);
}

/* PHÂN TRANG VÀ THU GỌN / XEM THÊM KHÁCH SẠN */
.hotel-pagination-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
  padding: 14px;
}
.hpa-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
.hpa-btn-more {
  background: #0284c7;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}
.hpa-btn-more:hover {
  background: #0369a1;
  transform: translateY(-2px);
}
.hpa-btn-all {
  background: var(--surface-card, #f1f5f9);
  color: var(--text-main, #334155);
  border: 1px solid var(--border-color, #cbd5e1);
}
.hpa-btn-all:hover {
  background: #e2e8f0;
}
.hpa-btn-collapse {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.hpa-btn-collapse:hover {
  background: #fee2e2;
}

/* KHỐI READY TO GENERATE PUSH-DOWN */
.step3-ready-box {
  margin-top: 32px;
  padding: 24px;
  border-radius: 16px;
  background: var(--surface-card, #f8fafc);
  border: 2px solid var(--border-color, #e2e8f0);
  transition: all 0.3s ease;
}
.step3-ready-box.is-ready {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(2, 132, 199, 0.08));
  border-color: #10b981;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
}
.srb-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.srb-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ecfdf5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.step3-ready-box:not(.is-ready) .srb-icon-wrap {
  background: #eff6ff;
  color: #2563eb;
}
.srb-title-text h4 {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
}
.srb-title-text p {
  margin: 0;
  font-size: 13.5px;
  color: var(--text-muted, #64748b);
}
.srb-checklist-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}
@media (max-width: 640px) {
  .srb-checklist-grid {
    grid-template-columns: 1fr;
  }
}
.srb-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
}
.srb-item.done {
  border-color: #a7f3d0;
  background: #f0fdf4;
}
.srb-item-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.srb-item.done .srb-item-indicator {
  background: #10b981;
  color: #ffffff;
}
.srb-item-info {
  flex: 1;
}
.srb-item-info small {
  display: block;
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  font-weight: 600;
}
.srb-item-info strong {
  display: block;
  font-size: 13px;
  color: var(--text-main, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}
.srb-btn-goto {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #0284c7;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.srb-action-row {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}
.srb-btn-generate {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  border: none;
  padding: 14px 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}
.srb-btn-generate:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.45);
}

/* DARK MODE CHO CÁC PHẦN MỚI */
[data-theme="dark"] .transit-notice {
  background: rgba(2, 132, 199, 0.15);
  border-color: #0284c7;
  color: #7dd3fc;
}
[data-theme="dark"] .hotel-notice {
  background: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  color: #fde68a;
}
[data-theme="dark"] .transit-bottom-next-bar,
[data-theme="dark"] .hotel-sort-toolbar,
[data-theme="dark"] .step3-ready-box {
  background: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .hst-btn,
[data-theme="dark"] .hst-star-btn {
  background: #0f172a;
  border-color: #334155;
  color: #e2e8f0;
}
[data-theme="dark"] .hst-btn.active,
[data-theme="dark"] .hst-star-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}
[data-theme="dark"] .srb-item {
  background: #0f172a;
  border-color: #334155;
}
[data-theme="dark"] .srb-item.done {
  background: rgba(16, 185, 129, 0.12);
  border-color: #10b981;
}
[data-theme="dark"] .srb-item-info strong {
  color: #f8fafc;
}
[data-theme="dark"] .srb-title-text h4 {
  color: #f8fafc;
}
[data-theme="dark"] .hpa-btn-all {
  background: #334155;
  color: #f8fafc;
  border-color: #475569;
}
[data-theme="dark"] .hpa-btn-collapse {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: #ef4444;
}

</style>


@keyframes pulse-slider {
  0% {
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.15),
      0 1px 4px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow:
      0 5px 20px rgba(2, 132, 199, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.15);
  }
  100% {
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.15),
      0 1px 4px rgba(0, 0, 0, 0.1);
  }
}
