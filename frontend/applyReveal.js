const fs = require('fs');
let content = fs.readFileSync('src/App.vue', 'utf8');

content = content.replace(/<div class="explore-section">/g, '<div class="explore-section" v-reveal>');
content = content.replace(/<div v-if="thoiTiet" class="app-weather-widget">/g, '<div v-if="thoiTiet" class="app-weather-widget" v-reveal>');
content = content.replace(/class="app-place-card">/g, 'class="app-place-card" v-reveal>');
content = content.replace(/<div class="transit-vehicles-grid">/g, '<div class="transit-vehicles-grid" v-reveal>');
content = content.replace(/:class="\\['bus-item-card'/g, 'v-reveal :class="[\'bus-item-card\'');

// Also inject the CSS for the reveal element before the end of <style>
const css = `
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
</style>
`;
content = content.replace(/<\/style>/g, css);

fs.writeFileSync('src/App.vue', content);
console.log('Success');
