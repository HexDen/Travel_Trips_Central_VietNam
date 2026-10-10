<template>
  <div class="profile-container" v-if="nguoiDung">
    <!-- Header Card -->
    <div class="profile-header-card">
      <div class="cover-photo"></div>
      
      <div class="profile-main-info">
        <div class="avatar-container">
          <img v-if="nguoiDung.avatar" :src="nguoiDung.avatar" alt="Avatar" class="avatar-image" />
          <div v-else class="avatar-placeholder">{{ nguoiDung.name ? nguoiDung.name[0].toUpperCase() : 'U' }}</div>
          <div class="level-badge" :style="{ backgroundColor: userLevelInfo?.color || '#10b981' }">
            {{ userLevelInfo?.title || 'Thành viên' }}
          </div>
        </div>

        <h1 class="user-name">
          {{ nguoiDung.name }}
          <span v-if="nguoiDung.role === 'admin'" class="admin-badge">ADMIN</span>
        </h1>
        <p class="user-email">{{ nguoiDung.email }}</p>
        <div class="action-buttons">
          <button class="btn btn-primary" @click="$emit('editProfile')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Chỉnh sửa hồ sơ
          </button>
          <button class="btn btn-outline" @click="$emit('dangXuat')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>

    <!-- Stats and Bio Grid -->
    <div class="profile-grid">
      <!-- Bio -->
      <div class="grid-card bio-card">
        <h3 class="card-title">Giới thiệu</h3>
        <p class="bio-text" v-if="nguoiDung.bio">{{ nguoiDung.bio }}</p>
        <p class="bio-empty" v-else>Bạn chưa cập nhật thông tin giới thiệu bản thân.</p>
      </div>

      <!-- Stats -->
      <div class="grid-card stat-card">
        <div class="stat-icon icon-blue">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ myTripsCount }}</span>
          <span class="stat-label">Đã lên lịch</span>
        </div>
      </div>

      <div class="grid-card stat-card">
        <div class="stat-icon icon-green">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ nguoiDung.completed_trips || 0 }}</span>
          <span class="stat-label">Hoàn thành</span>
        </div>
      </div>

      <div class="grid-card stat-card">
        <div class="stat-icon icon-red">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ favoritesCount }}</span>
          <span class="stat-label">Yêu thích</span>
        </div>
      </div>

      <div class="grid-card stat-card">
        <div class="stat-icon icon-yellow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ nguoiDung.points || 0 }}</span>
          <span class="stat-label">Điểm thưởng</span>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <div class="edit-profile-modal-overlay" v-if="isEditingProfile" @click.self="$emit('cancelEdit')">
      <div class="edit-profile-card">
      <div class="edit-header">
        <h2>Chỉnh sửa hồ sơ</h2>
      </div>
      <div class="edit-body">
        <div class="form-group">
          <label>Tên hiển thị</label>
          <input type="text" :value="profileForm.name" @input="$emit('updateForm', 'name', $event.target.value)" class="form-input" />
        </div>
        <div class="form-group">
          <label>Ảnh đại diện (Tải lên)</label>
          <div class="file-upload-wrapper">
            <input type="file" accept="image/*" @change="$emit('handleAvatarUpload', $event)" class="form-input file-input" />
            <div class="avatar-preview" v-if="profileForm.avatar && profileForm.avatar.startsWith('data:image')">
              <img :src="profileForm.avatar" class="preview-img" />
              <span class="preview-text">Ảnh mới đã chọn</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Giới thiệu bản thân</label>
          <textarea :value="profileForm.bio" @input="$emit('updateForm', 'bio', $event.target.value)" class="form-textarea" rows="4" placeholder="Sở thích du lịch của bạn là gì?"></textarea>
        </div>
      </div>
      <div class="edit-footer">
        <button class="btn btn-outline" @click="$emit('cancelEdit')">Hủy</button>
        <button class="btn btn-primary" @click="$emit('saveProfile')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
  </Teleport>
  </template>

<script setup>
defineProps({
  nguoiDung: Object,
  userLevelInfo: Object,
  myTripsCount: Number,
  favoritesCount: Number,
  isEditingProfile: Boolean,
  profileForm: Object
})

defineEmits(['editProfile', 'dangXuat', 'saveProfile', 'cancelEdit', 'handleAvatarUpload', 'updateForm'])
</script>

<style scoped>
.profile-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  color: #111827;
  animation: profileFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes profileFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header Card */
.profile-header-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.cover-photo {
  height: 240px;
  background: url('/images/mientrung-collage.jpg') center/cover no-repeat;
  position: relative;
}
.cover-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(15,23,42,0) 30%, rgba(15,23,42,0.7) 100%);
}

.profile-main-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 2.5rem 3rem;
  position: relative;
}

.avatar-container {
  position: relative;
  margin-top: -70px;
  margin-bottom: 1.25rem;
  z-index: 2;
}

.avatar-image, .avatar-placeholder {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 5px solid #ffffff;
  object-fit: cover;
  background: #f3f4f6;
  box-shadow: 0 15px 35px -5px rgba(0,0,0,0.2);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.avatar-container:hover .avatar-image, .avatar-container:hover .avatar-placeholder {
  transform: scale(1.04);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 800;
  color: #9ca3af;
}

.level-badge {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #fff;
  border: 3px solid #ffffff;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.user-name {
  font-size: 2rem;
  font-weight: 900;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.03em;
}
.admin-badge {
  font-size: 0.75rem;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: #fff;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.05em;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.user-email {
  font-size: 1.05rem;
  color: #6b7280;
  margin: 0 0 1.75rem 0;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 1.25rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
}
.btn-primary {
  background: linear-gradient(135deg, #0f766e, #047857);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.25);
}
.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(15, 118, 110, 0.4);
}

.btn-outline {
  background: rgba(255,255,255,0.8);
  color: #4b5563;
  border: 1px solid #d1d5db;
}
.btn-outline:hover {
  background: #f9fafb;
  color: #111827;
  border-color: #9ca3af;
  transform: translateY(-2px);
}

/* Grid Layout */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.grid-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 1.75rem;
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.grid-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  border-color: #e5e7eb;
}

.bio-card {
  grid-column: span 4;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
}

.card-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7280;
  margin: 0 0 1.25rem 0;
  font-weight: 800;
}
.bio-text {
  font-size: 1.15rem;
  line-height: 1.7;
  color: #1f2937;
  margin: 0;
  font-weight: 500;
}
.bio-empty {
  font-size: 1.1rem;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

/* Stat Cards */
.stat-card {
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
@media (min-width: 768px) {
  .stat-card { grid-column: span 1; }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
.grid-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.icon-blue { background: #eff6ff; color: #3b82f6; }
.icon-green { background: #f0fdf4; color: #10b981; }
.icon-red { background: #fef2f2; color: #f43f5e; }
.icon-yellow { background: #fefce8; color: #f59e0b; }

.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  color: #111827;
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #6b7280;
}

/* Edit Profile Modal */
.edit-profile-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}
.edit-profile-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 3rem;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.edit-header h2 {
  font-size: 1.75rem;
  font-weight: 900;
  margin: 0 0 2.5rem 0;
  color: #111827;
  letter-spacing: -0.02em;
}

.form-group { margin-bottom: 1.75rem; }
.form-group label {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.6rem;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-family: inherit;
  font-size: 1.05rem;
  color: #111827;
  background: #f9fafb;
  transition: all 0.3s ease;
}
.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #0f766e;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.1);
}

.file-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.file-input {
  padding: 0.75rem;
  background: transparent;
  border: 2px dashed #d1d5db;
  cursor: pointer;
}
.file-input:hover { border-color: #9ca3af; }

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 14px;
  background: #f0fdf4;
  border: 2px dashed #4ade80;
}
.preview-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.preview-text {
  font-size: 1rem;
  font-weight: 700;
  color: #166534;
}

.edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}
</style>

<style>
/* Dark Mode Enhancements */
[data-theme="dark"] .profile-container {
  color: #f3f4f6;
}
[data-theme="dark"] .profile-header-card {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(75, 85, 99, 0.4);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}
[data-theme="dark"] .cover-photo {
  background: url('/images/mientrung-collage.jpg') center/cover no-repeat;
  filter: brightness(0.8);
}
[data-theme="dark"] .cover-photo::after {
  background: linear-gradient(to bottom, rgba(15,23,42,0) 30%, rgba(17,24,39,1) 100%);
}
[data-theme="dark"] .avatar-image, :global([data-theme="dark"]) .avatar-placeholder {
  border-color: #1f2937;
  background: #374151;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
}
[data-theme="dark"] .level-badge {
  border-color: #1f2937;
}
[data-theme="dark"] .user-email {
  color: #9ca3af;
}
[data-theme="dark"] .btn-primary {
  background: linear-gradient(135deg, #14b8a6, #0f766e);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.2);
}
[data-theme="dark"] .btn-primary:hover {
  box-shadow: 0 12px 25px rgba(20, 184, 166, 0.35);
}
[data-theme="dark"] .btn-outline {
  background: rgba(55,65,81,0.5);
  color: #d1d5db;
  border-color: #4b5563;
}
[data-theme="dark"] .btn-outline:hover {
  background: #374151;
  color: #ffffff;
  border-color: #6b7280;
}
[data-theme="dark"] .grid-card {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
[data-theme="dark"] .grid-card:hover {
  background: #273240;
  border-color: #4b5563;
}
[data-theme="dark"] .bio-card { 
  background: linear-gradient(145deg, #1f2937, #111827); 
}
[data-theme="dark"] .bio-text { color: #e5e7eb; }
[data-theme="dark"] .icon-blue { background: rgba(59,130,246,0.2); }
[data-theme="dark"] .icon-green { background: rgba(16,185,129,0.2); }
[data-theme="dark"] .icon-red { background: rgba(244,63,94,0.2); }
[data-theme="dark"] .icon-yellow { background: rgba(245,158,11,0.2); }
[data-theme="dark"] .stat-value { color: #f9fafb; }
[data-theme="dark"] .stat-label { color: #9ca3af; }
[data-theme="dark"] .edit-profile-card {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}
[data-theme="dark"] .edit-header h2 { color: #f9fafb; }
[data-theme="dark"] .form-group label { color: #d1d5db; }
[data-theme="dark"] .form-input, :global([data-theme="dark"]) .form-textarea {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
[data-theme="dark"] .form-input:focus, :global([data-theme="dark"]) .form-textarea:focus {
  border-color: #14b8a6;
  background: #1f2937;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.15);
}
[data-theme="dark"] .file-input { border-color: #4b5563; }
[data-theme="dark"] .avatar-preview {
  background: rgba(74,222,128,0.1);
  border-color: #22c55e;
}
[data-theme="dark"] .preview-text { color: #4ade80; }
[data-theme="dark"] .edit-footer {
  border-color: #374151;
}
</style>



