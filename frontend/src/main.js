import { createApp } from 'vue'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Update available, refreshing...')
  },
  onOfflineReady() {
    console.log('App is ready to work offline.')
  }
})

const app = createApp(App)

// Intersection Observer cho hiệu ứng Reveal on Scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed')
      // Tùy chọn: observer.unobserve(entry.target) nếu chỉ muốn chạy 1 lần
    }
  })
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
})

app.directive('reveal', {
  mounted(el) {
    el.classList.add('reveal-element')
    observer.observe(el)
  },
  unmounted(el) {
    observer.unobserve(el)
  }
})

app.mount('#app')
