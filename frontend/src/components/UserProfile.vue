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

        <div class="action-buttons" v-if="!isEditingProfile">
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
    <div class="profile-grid" v-if="!isEditingProfile">
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

    <!-- Edit Profile Form -->
    <div class="edit-profile-card" v-else>
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
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  /* Fix serif font issue by forcing modern system fonts */
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1a1a1a;
}


/* Header Card */
.profile-header-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid #f0f0f0;
}


.cover-photo {
  height: 180px;
  background: radial-gradient(circle at top left, #a1c4fd 0%, #c2e9fb 100%);
  position: relative;
}


.profile-main-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 2rem 2.5rem;
  position: relative;
}

.avatar-container {
  position: relative;
  margin-top: -60px;
  margin-bottom: 1rem;
}

.avatar-image, .avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 6px solid #ffffff;
  object-fit: cover;
  background: #f3f4f6;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}


.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: #9ca3af;
}

.level-badge {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  border: 2px solid #ffffff;
  white-space: nowrap;
}


.user-name {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
}
.admin-badge {
  font-size: 0.7rem;
  background: #ef4444;
  color: #fff;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.user-email {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}


.action-buttons {
  display: flex;
  gap: 1rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}
.btn-primary {
  background: #111827;
  color: #ffffff;
}
.btn-primary:hover {
  background: #374151;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}



.btn-outline {
  background: transparent;
  color: #4b5563;
  border: 1px solid #d1d5db;
}
.btn-outline:hover {
  background: #f9fafb;
  color: #111827;
}



/* Grid Layout */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.grid-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  transition: transform 0.2s ease;
}
.grid-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.05);
}


.bio-card {
  grid-column: span 4;
}

.card-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-weight: 700;
}
.bio-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #374151;
  margin: 0;
}
.bio-empty {
  font-size: 1rem;
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
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-blue { background: #eff6ff; color: #3b82f6; }
.icon-green { background: #f0fdf4; color: #22c55e; }
.icon-red { background: #fef2f2; color: #ef4444; }
.icon-yellow { background: #fefce8; color: #eab308; }






.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.1;
  color: #111827;
  margin-bottom: 0.25rem;
}
.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
}



/* Edit Profile */
.edit-profile-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  max-width: 650px;
  margin: 0 auto;
}


.edit-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 2rem 0;
  color: #111827;
}


.form-group { margin-bottom: 1.5rem; }
.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
}


.form-input, .form-textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  color: #111827;
  background: #f9fafb;
  transition: all 0.2s;
}
.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #111827;
  background: #ffffff;
}



.file-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.file-input {
  padding: 0.6rem;
  background: transparent;
}
.avatar-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  background: #f0fdf4;
  border: 1px dashed #22c55e;
}

.preview-img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.preview-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #166534;
}


.edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

</style>

<style>
[data-theme="dark"] .profile-container {
  color: #f3f4f6;
}
[data-theme="dark"] .profile-header-card {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
[data-theme="dark"] .cover-photo {
  background: radial-gradient(circle at top left, #373b44 0%, #4286f4 100%);
}
[data-theme="dark"] .avatar-image, :global([data-theme="dark"]) .avatar-placeholder {
  border-color: #1f2937;
  background: #374151;
}
[data-theme="dark"] .level-badge {
  border-color: #1f2937;
}
[data-theme="dark"] .user-email {
  color: #9ca3af;
}
[data-theme="dark"] .btn-primary {
  background: #ffffff;
  color: #111827;
}
[data-theme="dark"] .btn-primary:hover {
  background: #f3f4f6;
}
[data-theme="dark"] .btn-outline {
  color: #d1d5db;
  border-color: #4b5563;
}
[data-theme="dark"] .btn-outline:hover {
  background: #374151;
  color: #ffffff;
}
[data-theme="dark"] .grid-card {
  background: #1f2937;
  border-color: #374151;
}
[data-theme="dark"] .bio-text { color: #e5e7eb; }
[data-theme="dark"] .icon-blue { background: rgba(59,130,246,0.15); }
[data-theme="dark"] .icon-green { background: rgba(34,197,94,0.15); }
[data-theme="dark"] .icon-red { background: rgba(239,68,68,0.15); }
[data-theme="dark"] .icon-yellow { background: rgba(234,179,8,0.15); }
[data-theme="dark"] .stat-value { color: #f9fafb; }
[data-theme="dark"] .stat-label { color: #9ca3af; }
[data-theme="dark"] .edit-profile-card {
  background: #1f2937;
  border-color: #374151;
}
[data-theme="dark"] .edit-header h2 { color: #f9fafb; }
[data-theme="dark"] .form-group label { color: #d1d5db; }
[data-theme="dark"] .form-input, :global([data-theme="dark"]) .form-textarea {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
[data-theme="dark"] .form-input:focus, :global([data-theme="dark"]) .form-textarea:focus {
  border-color: #f9fafb;
  background: #1f2937;
}
[data-theme="dark"] .avatar-preview {
  background: rgba(34,197,94,0.1);
}
[data-theme="dark"] .preview-text { color: #4ade80; }
[data-theme="dark"] .edit-footer {
  border-color: #374151;
}
</style>
