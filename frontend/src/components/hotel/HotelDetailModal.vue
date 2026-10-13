<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen && hotel"
        class="hotel-detail-modal-overlay"
        @click.self="$emit('close')"
      >
        <div class="hotel-detail-modal" role="dialog" aria-modal="true" :aria-label="hotel.name">
          <!-- THANH TÌM KIẾM / ĐIỀU KIỆN ĐẶT PHÒNG Ở ĐẦU -->
          <div class="hdm-top-bar">
            <div class="hdm-tb-left">
              <span class="hdm-tb-chip">
                <AppIcon name="calendar" :size="14" />
                {{ startDate || '10-10-2026' }} ➔ {{ endDate || '11-10-2026' }}
              </span>
              <span class="hdm-tb-chip">
                <AppIcon name="bed" :size="14" />
                {{ roomsNeeded || 1 }} phòng
              </span>
              <span class="hdm-tb-chip">
                <AppIcon name="user" :size="14" />
                {{ guestsCount || 2 }} người lớn
              </span>
              <button
                type="button"
                class="hdm-tb-btn-edit"
                @click="$emit('change-search')"
              >
                <AppIcon name="edit" :size="13" /> Đổi tìm kiếm
              </button>
            </div>
            <div class="hdm-tb-right">
              <button
                type="button"
                class="hdm-btn-choose-room-top"
                @click="$emit('close')"
              >
                ✕ Đóng
              </button>
              <button
                type="button"
                class="hdm-btn-close-modal"
                @click="$emit('close')"
                title="Đóng"
                aria-label="Đóng"
              >
                <AppIcon name="x" :size="18" />
              </button>
            </div>
          </div>

          <div class="hdm-scroll-body">
            <!-- HERO GALLERY: THUMBNAILS BÊN TRÁI + ẢNH CHÍNH Ở GIỮA/PHẢI -->
            <div class="hdm-gallery-section">
              <div class="hdm-thumbnails-col">
                <div
                  v-for="(img, idx) in galleryList"
                  :key="idx"
                  :class="['hdm-thumb-item', { active: activeImageIdx === idx }]"
                  @click="activeImageIdx = idx"
                >
                  <img :src="img" :alt="hotel.name + ' hình ' + (idx + 1)" loading="lazy" />
                </div>
              </div>
              <div class="hdm-main-photo-wrap">
                <img
                  :src="galleryList[activeImageIdx] || hotel.image"
                  :alt="hotel.name"
                  class="hdm-main-photo"
                />
                <div class="hdm-photo-overlay-info">
                  <h3>{{ hotel.name }}</h3>
                  <div class="hdm-stars">
                    <span v-for="s in Number(hotel.stars || 4)" :key="s" class="star-icon">★</span>
                    <span>{{ hotel.rating || '4.8' }} sao</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3 CỘT THÔNG TIN: GIỚI THIỆU | VỊ TRÍ | TIỆN NGHI -->
            <div class="hdm-info-3cols">
              <!-- CỘT 1: GIỚI THIỆU -->
              <div class="hdm-col hdm-col-intro">
                <h4 class="hdm-sec-title">Giới thiệu</h4>
                <p class="hdm-desc-text">{{ hotel.description }}</p>
              </div>

              <!-- CỘT 2: VỊ TRÍ -->
              <div class="hdm-col hdm-col-location">
                <h4 class="hdm-sec-title">Vị trí</h4>
                <div class="hdm-location-card">
                  <div class="hlc-pin-row">
                    <span class="hlc-pin-icon"><AppIcon name="pin" :size="18" /></span>
                    <div class="hlc-addr-text">{{ hotel.address }}</div>
                  </div>
                  <a
                    :href="'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(hotel.name + ' ' + hotel.address)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hlc-map-btn"
                  >
                    <AppIcon name="map" :size="14" /> Xem vị trí trên Google Maps ↗
                  </a>
                </div>
              </div>

              <!-- CỘT 3: TIỆN NGHI -->
              <div class="hdm-col hdm-col-amenities">
                <div class="hdm-amenities-top">
                  <h4 class="hdm-sec-title">Tiện nghi</h4>
                  <span class="hdm-see-more">Xem thêm ›</span>
                </div>
                <ul class="hdm-amenities-checklist">
                  <li v-for="(amenity, aIdx) in (hotel.amenities || [])" :key="aIdx">
                    <span class="hdm-check-icon">✓</span>
                    <span>{{ amenity }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- DANH SÁCH BẢNG PHÒNG TRỐNG & ĐẶT PHÒNG -->
            <div class="hdm-rooms-table-section">
              <div class="hrt-section-header">
                <h3>Chọn loại phòng phù hợp</h3>
                <small>Giá niêm yết đã bao gồm thuế, phí và các quyền lợi đi kèm</small>
              </div>

              <div class="hrt-table-wrapper">
                <div class="hrt-table-head">
                  <div class="hrt-cell th-room">Loại phòng</div>
                  <div class="hrt-cell th-perks">Đề xuất cho bạn</div>
                  <div class="hrt-cell th-guests">Số lượng</div>
                  <div class="hrt-cell th-price">Giá / Phòng / Đêm</div>
                  <div class="hrt-cell th-count">Phòng</div>
                  <div class="hrt-cell th-action">Thao tác</div>
                </div>

                <div
                  v-for="room in (hotel.rooms || [])"
                  :key="room.id"
                  class="hrt-room-row"
                >
                  <!-- Cột 1: Thông tin phòng + ảnh + diện tích -->
                  <div class="hrt-cell td-room">
                    <h4 class="room-title">{{ room.name }}</h4>
                    <div class="room-media-box">
                      <img :src="room.image" :alt="room.name" class="room-photo" loading="lazy" />
                      <span class="room-size-badge">
                        <AppIcon name="maximize" :size="11" /> {{ room.size }}
                      </span>
                    </div>
                    <small class="room-bed-type">
                      <AppIcon name="bed" :size="12" /> {{ room.bed }}
                    </small>
                  </div>

                  <!-- Cột 2: Đề xuất cho bạn (Perks) -->
                  <div class="hrt-cell td-perks">
                    <div class="deal-badge-row" v-if="room.deal_tag">
                      <span class="deal-pill">🎁 {{ room.deal_tag }}</span>
                    </div>
                    <div class="perk-policy-row" v-if="room.free_cancellation">
                      <span class="perk-icon-info">ⓘ</span>
                      <span>{{ room.cancellation_policy }}</span>
                    </div>
                    <div class="perk-policy-row perk-breakfast" v-if="room.breakfast_included">
                      <span class="perk-icon-check">✓</span>
                      <span>Đã bao gồm bữa sáng</span>
                    </div>
                  </div>

                  <!-- Cột 3: Số khách -->
                  <div class="hrt-cell td-guests">
                    <span class="guest-counter">
                      {{ room.max_guests }} <AppIcon name="user" :size="14" />
                    </span>
                  </div>

                  <!-- Cột 4: Giá / Phòng / Đêm -->
                  <div class="hrt-cell td-price">
                    <div class="saving-ribbon" v-if="room.is_deal">Siêu tiết kiệm 🎁</div>
                    <strong class="room-nightly-price">
                      {{ formatCurrency(room.price) }}đ <small>/ đêm</small>
                    </strong>
                    <span class="tax-note">
                      Đã bao gồm thuế & phí: {{ formatCurrency(room.tax_included_price) }}đ
                    </span>
                  </div>

                  <!-- Cột 5: Số phòng -->
                  <div class="hrt-cell td-count">
                    <span class="room-qty-box">{{ roomsNeeded || 1 }}</span>
                  </div>

                  <!-- Cột 6: Thao tác -->
                  <div class="hrt-cell td-action">
                    <button
                      type="button"
                      class="btn-book-room-red"
                      @click="$emit('choose-room', { hotel, room })"
                    >
                      {{ isRoomSelected(room) ? '✓ Đang chọn' : 'Đặt ngay' }}
                    </button>
                    <span class="room-urgency-note">
                      Chỉ còn {{ room.available_rooms || 3 }} phòng!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '../common/AppIcon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  hotel: {
    type: Object,
    default: null
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  roomsNeeded: {
    type: Number,
    default: 1
  },
  guestsCount: {
    type: Number,
    default: 2
  },
  selectedHotelId: {
    type: [String, Number],
    default: null
  },
  selectedRoomId: {
    type: [String, Number],
    default: null
  }
})

defineEmits(['close', 'choose-room', 'change-search'])

const activeImageIdx = ref(0)

const galleryList = computed(() => {
  if (!props.hotel) return []
  if (Array.isArray(props.hotel.gallery) && props.hotel.gallery.length > 0) {
    return props.hotel.gallery
  }
  return props.hotel.image ? [props.hotel.image] : []
})

watch(() => props.hotel, () => {
  activeImageIdx.value = 0
})

function formatCurrency(val) {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(val)
}

function isRoomSelected(room) {
  return (
    props.selectedHotelId === props.hotel?.id &&
    props.selectedRoomId === room?.id
  )
}
</script>
