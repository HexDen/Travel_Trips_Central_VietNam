<template>
  <div class="skeleton-card">
    <div class="skeleton-img"></div>
    <div class="skeleton-content">
      <div class="skeleton-title"></div>
      <div class="skeleton-desc"></div>
      <div class="skeleton-desc short"></div>
      <div class="skeleton-footer">
        <div class="skeleton-btn"></div>
        <div class="skeleton-btn small"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: var(--radius-md, 20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm, 0 4px 20px rgba(0,0,0,0.04));
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-img {
  height: 140px;
  background: var(--border-color, #e2e8f0);
}

.skeleton-content {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.skeleton-title {
  height: 18px;
  background: var(--border-color, #e2e8f0);
  border-radius: 4px;
  margin-bottom: 8px;
  width: 70%;
}

.skeleton-desc {
  height: 12px;
  background: var(--border-color, #e2e8f0);
  border-radius: 4px;
  margin-bottom: 6px;
  width: 100%;
}

.skeleton-desc.short {
  width: 50%;
  margin-bottom: 12px;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--border-color, #e2e8f0);
}

.skeleton-btn {
  height: 24px;
  background: var(--border-color, #e2e8f0);
  border-radius: 6px;
  width: 80px;
}

.skeleton-btn.small {
  width: 40px;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

:root[data-theme="dark"] .skeleton-card {
  /* Inherits dark mode vars via CSS Custom Properties from App.vue */
}
</style>
