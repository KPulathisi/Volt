<script setup>
/** Flagship showcase: interactive 3D car with hotspots, key figures and a route into the configurator. */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import VehicleViewer from './VehicleViewer.vue'
import { useData, lookup, money } from '../composables/useData.js'
import { gsap, reducedMotion } from '../composables/useMotion.js'

const { site } = useData()
const v = lookup.vehicles.one
const root = ref(null)
const parts = computed(() => ({ vehicle: v, paint: lookup.colors.silver, wheel: lookup.wheels['aero-20'], interior: lookup.interiors.carbon, packages: [] }))
const stats = [
  { v: v.specs.range, unit: 'km', label: 'Estimated range', d: 0 },
  { v: v.specs.accel, unit: 's', label: '0–100 km/h', d: 1 },
  { v: v.specs.chargeRate, unit: 'kW', label: 'Peak charging', d: 0 }
]
let ctx
onMounted(() => {
  if (reducedMotion) return
  ctx = gsap.context(() => {
    gsap.utils.toArray('.sv-num').forEach((el) => {
      const end = +el.dataset.v, d = +el.dataset.d, o = { n: 0 }
      gsap.to(o, { n: end, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => (el.textContent = o.n.toFixed(d)) })
    })
    gsap.fromTo('.sv-ghost', { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: true } })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="showcase" ref="root" class="sv section" aria-labelledby="sv-title">
    <p class="sv-ghost" aria-hidden="true">ONE</p>
    <div class="wrap sv-head">
      <div>
        <span class="label">{{ site.showcase.kicker }}</span>
        <h2 id="sv-title" v-split>{{ site.showcase.title }}</h2>
      </div>
      <p class="lede" v-fade>{{ site.showcase.text }}</p>
    </div>
    <div class="sv-stage">
      <VehicleViewer :parts="parts" :hotspots="site.showcase.hotspots" auto-rotate views label="Interactive 3D view of the VOLT ONE. Drag to rotate, or use the view buttons." />
    </div>
    <div class="wrap sv-foot">
      <dl class="sv-stats">
        <div v-for="s in stats" :key="s.label"><dt>{{ s.label }}</dt><dd><span class="sv-num" :data-v="s.v" :data-d="s.d">{{ s.v.toFixed(s.d) }}</span><small>{{ s.unit }}</small></dd></div>
      </dl>
      <div class="sv-price">
        <span class="muted mono">From</span>
        <strong>{{ money(v.basePrice) }}</strong>
        <span class="muted notice">Illustrative price for a concept car</span>
        <RouterLink :to="{ path: '/configure', query: { model: 'one' } }" class="btn solid">Explore configuration<ArrowRight /></RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sv { overflow: hidden; background: linear-gradient(180deg, var(--black), var(--graphite) 40%, var(--black)); }
.sv-ghost { position: absolute; top: 18%; left: 50%; transform: translateX(-50%); margin: 0; font: 700 clamp(10rem, 34vw, 34rem)/.8 var(--display); font-stretch: 125%; color: transparent; -webkit-text-stroke: 1px rgba(242, 243, 241, .07); white-space: nowrap; pointer-events: none; }
.sv-head { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: end; }
.sv-head h2 { margin: 0; }
.sv-stage { position: relative; height: clamp(360px, 62vh, 720px); margin: 1rem 0; }
.sv-foot { position: relative; display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; border-top: 1px solid var(--line); padding-top: 1.6rem; }
.sv-stats { display: flex; gap: clamp(1.5rem, 5vw, 4.5rem); margin: 0; flex-wrap: wrap; }
.sv-stats dt { font: 500 .68rem var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--mute); margin-bottom: .4rem; }
.sv-stats dd { margin: 0; font: 600 var(--step-4)/1 var(--display); font-stretch: 110%; letter-spacing: -.03em; }
.sv-stats small { font: 500 .9rem var(--mono); color: var(--lime); margin-left: .35rem; letter-spacing: 0; }
.sv-price { display: grid; gap: .3rem; justify-items: start; }
.sv-price strong { font: 600 var(--step-2) var(--display); font-stretch: 110%; }
.sv-price .btn { margin-top: .8rem; }
@media (max-width: 860px) { .sv-head { grid-template-columns: 1fr; } }
</style>
