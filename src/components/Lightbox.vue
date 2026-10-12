<script setup>
/** Fullscreen gallery: Flip-expands from the clicked thumbnail, keyboard and swipe friendly. */
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import MediaFrame from './MediaFrame.vue'
import { useData } from '../composables/useData.js'
import { gsap, Flip, reducedMotion, stopScroll } from '../composables/useMotion.js'

const props = defineProps({ items: { type: Array, required: true }, title: { type: String, default: '' } })
const { getMedia } = useData()
const open = ref(false)
const index = ref(0)
const stage = ref(null), closeBtn = ref(null)
let returnFocus = null, touchX = 0

async function show(i, fromEl) {
  returnFocus = document.activeElement
  index.value = i
  const state = fromEl && !reducedMotion ? Flip.getState(fromEl) : null
  open.value = true
  stopScroll(true)
  await nextTick()
  if (state) Flip.from(state, { targets: stage.value, duration: 0.9, ease: 'expo.inOut', absolute: true, scale: true })
  gsap.from('.lb-ui', { opacity: 0, duration: 0.6, delay: 0.4 })
  closeBtn.value?.focus()
}
function close() {
  open.value = false
  stopScroll(false)
  returnFocus?.focus?.()
}
function go(d) {
  index.value = (index.value + d + props.items.length) % props.items.length
  if (!reducedMotion) gsap.fromTo(stage.value, { opacity: 0.2, x: d * 40 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' })
}
function onKey(e) {
  if (!open.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
  if (e.key === 'Tab') { // keep focus inside the dialog
    const f = [...document.querySelectorAll('.lightbox button')]
    if (!f.length) return
    const i = f.indexOf(document.activeElement)
    if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1).focus() } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus() }
  }
}
watch(open, (v) => (v ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey)))
onBeforeUnmount(() => { window.removeEventListener('keydown', onKey); if (open.value) stopScroll(false) })
defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="lightbox" role="dialog" aria-modal="true" :aria-label="`${title} gallery`" @touchstart.passive="touchX = $event.touches[0].clientX" @touchend="(e) => { const d = e.changedTouches[0].clientX - touchX; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1) }">
      <div ref="stage" class="lb-stage"><MediaFrame :key="items[index]" :id="items[index]" fill sizes="100vw" /></div>
      <div class="lb-ui">
        <p class="lb-cap"><span class="mono accent">{{ title }}</span> · {{ getMedia(items[index])?.alt }}</p>
        <p class="lb-count">{{ index + 1 }} / {{ items.length }}</p>
        <button ref="closeBtn" class="lb-btn lb-close" aria-label="Close gallery" @click="close"><X /></button>
        <button class="lb-btn lb-prev" aria-label="Previous image" @click="go(-1)"><ChevronLeft /></button>
        <button class="lb-btn lb-next" aria-label="Next image" @click="go(1)"><ChevronRight /></button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox { position: fixed; inset: 0; z-index: 260; background: rgba(7, 8, 9, .97); }
.lb-stage { position: absolute; inset: 6vh 8vw 12vh; overflow: hidden; }
.lb-ui { position: absolute; inset: 0; pointer-events: none; color: var(--white); }
.lb-cap { position: absolute; left: 8vw; bottom: 4vh; margin: 0; font-size: var(--step--1); max-width: 70ch; }
.lb-count { position: absolute; right: 8vw; bottom: 4vh; margin: 0; font: 500 .8rem var(--mono); letter-spacing: .14em; }
.lb-btn { pointer-events: auto; position: absolute; width: 54px; height: 54px; border-radius: 50%; border: 1px solid rgba(248, 244, 236, .35); background: rgba(20, 39, 41, .4); color: var(--white); display: grid; place-items: center; cursor: pointer; transition: background .3s, border-color .3s; }
.lb-btn:hover, .lb-btn:focus-visible { background: var(--lime); color: var(--black); border-color: var(--lime); }
.lb-btn svg { width: 22px; height: 22px; }
.lb-close { top: 2.5vh; right: 2.5vw; }
.lb-prev { left: 1.5vw; top: 50%; transform: translateY(-50%); }
.lb-next { right: 1.5vw; top: 50%; transform: translateY(-50%); }
@media (max-width: 700px) { .lb-stage { inset: 14vh 0 20vh; } .lb-prev, .lb-next { top: auto; bottom: 10vh; transform: none; } }
</style>
