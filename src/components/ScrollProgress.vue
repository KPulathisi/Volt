<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const p = ref(0)
let raf = 0
function update() {
  const h = document.documentElement.scrollHeight - window.innerHeight
  p.value = h > 0 ? window.scrollY / h : 0
  raf = 0
}
const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); update() })
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="progress no-print" aria-hidden="true"><span :style="{ transform: `scaleX(${p})` }"></span></div>
</template>

<style scoped>
.progress { position: fixed; left: 0; right: 0; top: 0; height: 2px; z-index: 120; pointer-events: none; }
.progress span { display: block; height: 100%; background: var(--lime); transform-origin: left; }
</style>
