<script setup>
/**
 * Cinematic hero: the car sits in a dark studio while the light bar switches on and the headline
 * rises. Scrolling orbits the camera to a side profile, spins the wheels and splits the headline.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ArrowDown, ArrowRight } from 'lucide-vue-next'
import VehicleViewer from './VehicleViewer.vue'
import CarSVG from './CarSVG.vue'
import GridField from './GridField.vue'
import { useData, lookup } from '../composables/useData.js'
import { gsap, ScrollTrigger, reducedMotion } from '../composables/useMotion.js'
import { goTo } from '../composables/useHashScroll.js'

const { site } = useData()
const hero = site.hero
const root = ref(null)
const small = window.matchMedia('(max-width: 767px)').matches
const parts = computed(() => ({ vehicle: lookup.vehicles.one, paint: lookup.colors.graphite, wheel: lookup.wheels['aero-20'], interior: lookup.interiors.carbon, packages: [] }))
let ctx, stage = null, heroST = null

function onReady(s) {
  stage = s
  if (reducedMotion) { s.setLights(1); return }
  s.setLights(0)
  const o = { v: 0 }
  gsap.to(o, { v: 1, duration: 1.6, delay: 0.5, ease: 'power2.inOut', onUpdate: () => s.setLights(o.v * (0.85 + Math.random() * 0.15)), onComplete: () => s.setLights(1) })
  // camera follows scroll: front three-quarter → side profile, slightly pulled back
  const from = { az: 0.95, el: 0.16, dist: 7.2 }, to = { az: 0.08, el: 0.06, dist: 8.4 }
  s.applyOrbit(from)
  heroST = ScrollTrigger.create({
    trigger: root.value, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (st) => {
      const p = st.progress
      s.applyOrbit({ az: from.az + (to.az - from.az) * p, el: from.el + (to.el - from.el) * p, dist: from.dist + (to.dist - from.dist) * p })
      s.setSpin(Math.min(14, Math.abs(st.getVelocity()) / 140))
    },
    onLeave: () => s.setSpin(0), onLeaveBack: () => s.setSpin(0)
  })
}

onMounted(() => {
  if (reducedMotion) return
  ctx = gsap.context(() => {
    gsap.from('.h-meta > *', { y: 20, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.9 })
    gsap.from('.h-actions > *', { y: 20, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 1.3 })
    gsap.from('.h-stage', { opacity: 0, scale: 0.96, duration: 2, ease: 'expo.out', delay: 0.2 })
    // headline lines drift apart as you scroll away
    const st = { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to('.hl-0', { xPercent: -14, ease: 'none', scrollTrigger: st })
    gsap.to('.hl-1', { xPercent: 10, ease: 'none', scrollTrigger: st })
    gsap.to('.h-copy', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { ...st, end: '60% top' } })
  }, root.value)
  // keep wheels still once scrolling stops
  let t
  window.addEventListener('scroll', (onStop = () => { clearTimeout(t); t = setTimeout(() => stage?.setSpin(0), 160) }), { passive: true })
})
let onStop
onBeforeUnmount(() => { ctx?.revert(); heroST?.kill(); window.removeEventListener('scroll', onStop) })
</script>

<template>
  <section ref="root" class="hero" aria-labelledby="hero-title">
    <GridField />
    <div class="h-stage">
      <div v-if="small" class="h-svg"><CarSVG model="one" paint="#4a4e54" label="VOLT ONE side view" /></div>
      <VehicleViewer v-else :parts="parts" :interactive="false" eager label="The VOLT ONE in Graphite, in a dark studio." @ready="onReady" />
    </div>
    <div class="h-copy wrap">
      <div class="h-meta"><span class="label">{{ hero.kicker }}</span></div>
      <h1 id="hero-title" class="h-title">
        <span v-for="(l, i) in hero.lines" :key="l" :class="['hl', `hl-${i}`]"><span v-split.now="{ delay: 0.4 + i * 0.12 }">{{ l }}</span></span>
      </h1>
      <div class="h-row">
        <p class="h-text">{{ hero.text }}</p>
        <div class="h-actions">
          <button class="btn solid" @click="goTo('showcase')">{{ hero.primary }}<ArrowRight /></button>
          <button class="btn" @click="goTo('performance')">{{ hero.secondary }}</button>
        </div>
      </div>
    </div>
    <button class="scroll-ind no-print" aria-label="Scroll to the vehicle" @click="goTo('showcase')"><span>Scroll</span><i><ArrowDown /></i></button>
  </section>
</template>

<style scoped>
.hero { position: relative; min-height: 100svh; display: flex; flex-direction: column; justify-content: flex-end; padding: var(--header) 0 clamp(2rem, 5vh, 4rem); overflow: hidden; background: radial-gradient(ellipse 80% 60% at 50% 60%, #15181b 0%, var(--black) 70%); }
.h-stage { position: absolute; left: 0; right: 0; top: 8%; bottom: 12%; -webkit-mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 78%, transparent); mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 78%, transparent); }
.h-svg { position: absolute; left: 6%; right: 6%; top: 34%; }
.h-copy { position: relative; z-index: 2; pointer-events: none; }
.h-copy a, .h-copy button { pointer-events: auto; }
.h-title { font-size: clamp(2.3rem, 0.4rem + 5.6vw, 8rem); margin-bottom: 1.6rem; }
.hl { display: block; white-space: nowrap; }
.hl-1 { padding-left: clamp(0rem, 4vw, 5rem); }
.h-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; }
.h-text { color: var(--soft); max-width: 36ch; margin: 0; font-size: var(--step-1); line-height: 1.45; }
.h-actions { display: flex; gap: .6rem; flex-wrap: wrap; }
.scroll-ind { position: absolute; right: var(--gutter); top: 50%; z-index: 3; display: grid; justify-items: center; gap: .8rem; background: none; border: 0; cursor: pointer; color: var(--mute); font: 500 .62rem var(--mono); letter-spacing: .2em; text-transform: uppercase; writing-mode: vertical-rl; }
.scroll-ind i { writing-mode: horizontal-tb; width: 1px; height: 64px; background: var(--line-strong); position: relative; overflow: hidden; display: block; }
.scroll-ind i::after { content: ''; position: absolute; left: 0; top: -40%; width: 1px; height: 40%; background: var(--lime); animation: drop 2s var(--ease) infinite; }
.scroll-ind svg { display: none; }
@keyframes drop { to { top: 100%; } }
@media (max-width: 767px) { .h-stage { top: 6%; bottom: 46%; } .scroll-ind { display: none; } .hl-1 { padding-left: 0; } .hl { white-space: normal; } }
</style>
