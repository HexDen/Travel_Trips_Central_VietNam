<template>
  <label class="slider" :class="{ 'is-muted': muted || volume === 0 }" :title="muted ? 'Bật âm thanh' : 'Điều chỉnh âm lượng'">
    <input
      type="range"
      class="level"
      min="0"
      max="1"
      step="0.05"
      :value="muted ? 0 : volume"
      @input="handleInput"
      aria-label="Âm lượng nhạc nền"
    />
    <svg
      class="volume"
      @click.stop.prevent="toggleMute"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      xml:space="preserve"
      role="button"
      tabindex="0"
      @keydown.enter.stop.prevent="toggleMute"
      @keydown.space.stop.prevent="toggleMute"
      :title="muted ? 'Bật nhạc' : 'Tắt tiếng'"
    >
      <g v-if="!muted && volume > 0">
        <path d="M18.36 19.36a1 1 0 0 1-.705-1.71C19.167 16.148 20 14.142 20 12s-.833-4.148-2.345-5.65a1 1 0 1 1 1.41-1.419C20.958 6.812 22 9.322 22 12s-1.042 5.188-2.935 7.069a.997.997 0 0 1-.705.291z" fill="currentColor"></path>
        <path d="M15.53 16.53a.999.999 0 0 1-.703-1.711C15.572 14.082 16 13.054 16 12s-.428-2.082-1.173-2.819a1 1 0 1 1 1.406-1.422A6 6 0 0 1 18 12a6 6 0 0 1-1.767 4.241.996.996 0 0 1-.703.289zM12 22a1 1 0 0 1-.707-.293L6.586 17H4c-1.103 0-2-.897-2-2V9c0-1.103.897-2 2-2h2.586l4.707-4.707A.998.998 0 0 1 13 3v18a1 1 0 0 1-1 1z" fill="currentColor"></path>
      </g>
      <!-- Icon Mute / Tắt tiếng có gạch chéo trực quan -->
      <g v-else>
        <path d="M12 22a1 1 0 0 1-.707-.293L6.586 17H4c-1.103 0-2-.897-2-2V9c0-1.103.897-2 2-2h2.586l4.707-4.707A.998.998 0 0 1 13 3v18a1 1 0 0 1-1 1z" fill="currentColor"></path>
        <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </g>
    </svg>
  </label>
</template>

<script setup>
const props = defineProps({
  volume: {
    type: Number,
    default: 0.65
  },
  muted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:volume', 'toggleMute'])

function handleInput(e) {
  const newVol = Number(e.target.value)
  if (props.muted && newVol > 0) {
    emit('toggleMute')
  }
  emit('update:volume', newVol)
}

function toggleMute() {
  emit('toggleMute')
}
</script>

<style scoped>
  /* level settings 👇 */
  .slider {
    /* slider */
    --slider-width: 84px;
    --slider-height: 6px;
    --slider-bg: rgba(255, 255, 255, 0.2);
    --slider-border-radius: 999px;
    /* level */
    --level-color: var(--primary, #38bdf8);
    --level-transition-duration: .15s;
    /* icon */
    --icon-margin: 10px;
    --icon-color: var(--text-primary, #ffffff);
    --icon-size: 20px;
  }

  .slider {
    cursor: pointer;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: reverse;
    -ms-flex-direction: row-reverse;
    flex-direction: row-reverse;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 2px 4px;
    border-radius: 20px;
    transition: background 0.2s ease;
  }

  .slider:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .slider .volume {
    display: inline-block;
    vertical-align: middle;
    margin-right: var(--icon-margin);
    color: var(--icon-color);
    width: var(--icon-size);
    height: var(--icon-size);
    flex-shrink: 0;
    transition: color 0.2s ease, transform 0.15s ease;
  }

  .slider .volume:hover {
    transform: scale(1.15);
    color: var(--primary, #38bdf8);
  }

  .slider.is-muted .volume {
    opacity: 0.6;
    color: var(--slider-bg);
  }

  .slider .level {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: var(--slider-width);
    height: var(--slider-height);
    background: var(--slider-bg);
    overflow: hidden;
    border-radius: var(--slider-border-radius);
    -webkit-transition: height var(--level-transition-duration), background var(--level-transition-duration);
    -o-transition: height var(--level-transition-duration), background var(--level-transition-duration);
    transition: height var(--level-transition-duration), background var(--level-transition-duration);
    cursor: inherit;
    outline: none;
    border: none;
    margin: 0;
  }

  .slider .level::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 0;
    height: 0;
    -webkit-box-shadow: -200px 0 0 200px var(--level-color);
    box-shadow: -200px 0 0 200px var(--level-color);
  }

  .slider .level::-moz-range-thumb {
    width: 0;
    height: 0;
    border: none;
    box-shadow: -200px 0 0 200px var(--level-color);
  }

  .slider .level::-moz-range-progress {
    background: var(--level-color);
    border-radius: var(--slider-border-radius);
  }

  .slider:hover .level {
    height: calc(var(--slider-height) * 2);
  }
</style>
