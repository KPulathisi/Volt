<script setup>
/** Horizontal gallery strip: drag or use the arrows, click an image for the full-screen view. */
import { ref } from 'vue'
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-vue-next'
import MediaFrame from './MediaFrame.vue'
import Lightbox from './Lightbox.vue'
import { useData } from '../composables/useData.js'

const { getMedia } = useData()
const items = ['gallery-1', 'gallery-2', 'gallery-3', 'gallery-4', 'gallery-5', 'gallery-6']
const strip = ref(null), lb = ref(null)
const scrollBy = (d) => strip.value?.scrollBy({ left: d * strip.value.clientWidth * 0.6, behavior: 'smooth' })

// drag to scroll with a mouse (touch scrolls natively)
let down = false, sx = 0, sl = 0, moved = false
function pd(e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.value.scrollLeft }
function pm(e) { if (!down) return; const d = e.clientX - sx; if (Math.abs(d) > 4) moved = true; strip.value.scrollLeft = sl - d }
function pu() { down = false }
function open(i, e) { if (moved) return; lb.value.show(i, e.currentTarget.querySelector('.mf')) }
</script>

<template>
  <section class="gal section" aria-labelledby="gal-title">
    <div class="wrap g-head">
      <div><span class="label">Gallery</span><h2 id="gal-title" v-split>Details</h2></div>
      <div class="g-nav">
        <button class="btn small" aria-label="Scroll gallery left" @click="scrollBy(-1)"><ArrowLeft /></button>
        <button class="btn small" aria-label="Scroll gallery right" @click="scrollBy(1)"><ArrowRight /></button>
      </div>
    </div>
    <ul ref="strip" class="strip" @pointerdown="pd" @pointermove="pm" @pointerup="pu" @pointerleave="pu">
      <li v-for="(id, i) in items" :key="id">
        <button class="g-item" :aria-label="`Open image: ${getMedia(id).alt}`" data-cursor="View" @click="open(i, $event)">
          <MediaFrame :id="id" sizes="(min-width: 900px) 40vw, 85vw" />
          <span class="g-cap"><span class="mono">0{{ i + 1 }}</span>{{ getMedia(id).label.replace('Gallery: ', '') }}<Maximize2 aria-hidden="true" /></span>
        </button>
      </li>
    </ul>
    <Lightbox ref="lb" :items="items" title="VOLT ONE" />
  </section>
</template>

<style scoped>
.g-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 2.5rem; }
.g-head h2 { margin: 0; }
.g-nav { display: flex; gap: .4rem; }
.strip { list-style: none; margin: 0; padding: 0 var(--gutter) 1rem; display: flex; gap: 1.2rem; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; cursor: grab; user-select: none; }
.strip::-webkit-scrollbar { display: none; }
.strip li { flex: 0 0 clamp(280px, 38vw, 620px); scroll-snap-align: start; }
.g-item { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; text-align: left; }
.g-item :deep(.mf-inner) { transition: transform 1.2s var(--ease); }
.g-item:hover :deep(.mf-inner), .g-item:focus-visible :deep(.mf-inner) { transform: scale(1.05); }
.g-item :deep(img) { pointer-events: none; }
.g-cap { display: flex; align-items: center; gap: .8rem; padding: .9rem 0; border-bottom: 1px solid var(--line); font-size: .92rem; }
.g-cap .mono { font-size: .66rem; color: var(--lime); }
.g-cap svg { width: 14px; margin-left: auto; color: var(--mute); transition: color .3s, transform .4s var(--ease); }
.g-item:hover .g-cap svg { color: var(--lime); transform: scale(1.2); }
</style>
