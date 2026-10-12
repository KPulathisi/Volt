<script setup>
/**
 * Technical specifications with animated counters, a 0–100 km/h demo, a dimensioned drawing
 * and comparison bars across the three models. All figures come from vehicles.json.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Play, RotateCcw } from 'lucide-vue-next'
import CarSVG from './CarSVG.vue'
import { useData, num } from '../composables/useData.js'
import { gsap, reducedMotion } from '../composables/useMotion.js'
import { makeProfile } from '../three/carProfile.js'

const props = defineProps({ initial: { type: String, default: 'one' }, heading: { type: Boolean, default: true } })
const { vehicles } = useData()
const sel = ref(props.initial)
const v = computed(() => vehicles.find((x) => x.id === sel.value))
const root = ref(null)
const figures = computed(() => [
  { key: 'range', label: 'Estimated range', unit: 'km', d: 0, value: v.value.specs.range },
  { key: 'accel', label: '0–100 km/h', unit: 's', d: 1, value: v.value.specs.accel },
  { key: 'topSpeed', label: 'Top speed', unit: 'km/h', d: 0, value: v.value.specs.topSpeed },
  { key: 'chargeRate', label: 'Peak charging', unit: 'kW', d: 0, value: v.value.specs.chargeRate },
  { key: 'battery', label: 'Usable battery', unit: 'kWh', d: 0, value: v.value.specs.battery },
  { key: 'power', label: 'Peak power', unit: 'kW', d: 0, value: v.value.specs.power }
])
const bars = [
  { key: 'range', label: 'Range', unit: 'km', better: 'higher' },
  { key: 'accel', label: '0–100 km/h', unit: 's', better: 'lower' },
  { key: 'charge10to80', label: '10–80% charge', unit: 'min', better: 'lower' },
  { key: 'cargo', label: 'Luggage', unit: 'L', better: 'higher' }
]
const barPct = (key, val) => {
  const vals = vehicles.map((x) => x.specs[key]), max = Math.max(...vals)
  return (val / max) * 100
}
const best = (b) => {
  const vals = vehicles.map((x) => x.specs[b.key])
  return b.better === 'higher' ? Math.max(...vals) : Math.min(...vals)
}

// dimension drawing positions (same units as CarSVG: 100 per metre, nose at x=0)
const prof = computed(() => makeProfile(v.value.shape))
const dims = computed(() => ({ L: prof.value.L * 100, H: prof.value.H * 100, wb: [prof.value.wheelX[0] * 100, prof.value.wheelX[1] * 100] }))

// counters
let ctx
function countUp() {
  if (reducedMotion) return
  root.value.querySelectorAll('.f-num').forEach((el) => {
    const end = +el.dataset.v, d = +el.dataset.d, o = { n: +el.dataset.from || 0 }
    gsap.to(o, { n: end, duration: 1.4, ease: 'power3.out', onUpdate: () => (el.textContent = num(o.n, d)) })
    el.dataset.from = end
  })
}
watch(sel, async () => { stopRun(); await nextTick(); countUp() })
onMounted(() => {
  if (reducedMotion) return
  ctx = gsap.context(() => {
    gsap.from('.f-num', { scrollTrigger: { trigger: '.figs', start: 'top 85%', once: true, onEnter: countUp } })
    gsap.from('.bar i', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: '.bars', start: 'top 85%', once: true } })
    gsap.from('.dim-line', { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'expo.inOut', stagger: 0.12, scrollTrigger: { trigger: '.dims', start: 'top 80%', once: true } })
  }, root.value)
})

// 0–100 km/h demo in real time
const speed = ref(0), elapsed = ref(0), running = ref(false)
let runTween
function run() {
  stopRun()
  running.value = true
  const t = v.value.specs.accel
  const o = { p: 0 }
  runTween = gsap.to(o, {
    p: 1, duration: reducedMotion ? 0.01 : t, ease: 'power1.out',
    onUpdate: () => { speed.value = Math.round(o.p * 100); elapsed.value = runTween.time() },
    onComplete: () => { running.value = false; elapsed.value = t; speed.value = 100 }
  })
}
function stopRun() { runTween?.kill(); running.value = false; speed.value = 0; elapsed.value = 0 }
onBeforeUnmount(() => { ctx?.revert(); runTween?.kill() })
</script>

<template>
  <section id="performance" ref="root" class="perf section" aria-labelledby="perf-title">
    <div class="wrap">
      <div class="p-head">
        <div>
          <span class="label">Performance</span>
          <h2 id="perf-title" v-split>{{ heading ? 'Numbers that move.' : 'Specifications' }}</h2>
        </div>
        <div class="tabs" role="tablist" aria-label="Choose a model">
          <button v-for="m in vehicles" :key="m.id" role="tab" :aria-selected="sel === m.id" @click="sel = m.id">{{ m.short }}</button>
        </div>
      </div>

      <dl class="figs" role="tabpanel" :aria-label="`${v.name} specifications`">
        <div v-for="f in figures" :key="f.key" class="fig">
          <dt>{{ f.label }}</dt>
          <dd><span class="f-num" :data-v="f.value" :data-d="f.d">{{ num(f.value, f.d) }}</span><small>{{ f.unit }}</small></dd>
        </div>
      </dl>
      <p class="drive mono"><span class="muted">Drivetrain</span> {{ v.specs.drivetrain }} <span class="muted">· 10–80% charge</span> about {{ v.specs.charge10to80 }} min</p>

      <div class="lower">
        <div class="sprint">
          <span class="label">0–100 km/h, in real time</span>
          <div class="speedo" aria-live="off"><strong>{{ speed }}</strong><span>km/h</span></div>
          <div class="track" aria-hidden="true"><i :style="{ transform: `scaleX(${speed / 100})` }"></i></div>
          <p class="mono time">{{ elapsed.toFixed(1) }} s <span class="muted">/ {{ v.specs.accel }} s</span></p>
          <div class="sp-actions">
            <button class="btn small solid" :disabled="running" @click="run"><Play />Run 0–100</button>
            <button class="btn small" @click="stopRun"><RotateCcw />Reset</button>
          </div>
          <p class="sr-only" role="status">{{ !running && speed === 100 ? `${v.name} reached 100 km/h in ${v.specs.accel} seconds` : '' }}</p>
        </div>

        <figure class="dims">
          <figcaption class="label">Dimensions · {{ v.name }}</figcaption>
          <div class="dims-draw">
            <CarSVG :model="v.id" paint="#2a2e34" :lights="false" :floor="false" :pad="72" :wheel="v.allowedWheels.includes('aero-20') ? 'aero' : 'turbine'" :performance="v.standardPackages.includes('performance')">
              <g class="dims-g">
                <g class="dim-line" stroke="#c5f23a"><line x1="0" :x2="dims.L" y1="44" y2="44" /><line x1="0" x2="0" y1="36" y2="52" /><line :x1="dims.L" :x2="dims.L" y1="36" y2="52" /></g>
                <text :x="dims.L / 2" y="66" text-anchor="middle">Length {{ num(v.specs.length) }} mm</text>
                <g class="dim-line" stroke="#8d939b"><line :x1="dims.wb[0]" :x2="dims.wb[1]" y1="10" y2="10" /><line :x1="dims.wb[0]" :x2="dims.wb[0]" y1="4" y2="16" /><line :x1="dims.wb[1]" :x2="dims.wb[1]" y1="4" y2="16" /></g>
                <text :x="(dims.wb[0] + dims.wb[1]) / 2" y="28" text-anchor="middle" class="m">Wheelbase {{ num(v.specs.wheelbase) }} mm</text>
                <g stroke="#8d939b"><line :x1="dims.L + 12" :x2="dims.L + 12" y1="0" :y2="-dims.H" /><line :x1="dims.L + 6" :x2="dims.L + 18" :y1="-dims.H" :y2="-dims.H" /><line :x1="dims.L + 6" :x2="dims.L + 18" y1="0" y2="0" /></g>
                <text :x="dims.L + 2" :y="-dims.H - 6" text-anchor="end" class="m">Height {{ num(v.specs.height) }} mm</text>
              </g>
            </CarSVG>
          </div>
          <p class="mono muted small">Width {{ num(v.specs.width) }} mm · kerb weight {{ num(v.specs.weight) }} kg · luggage {{ v.specs.cargo }} L · {{ v.seats }} seats</p>
        </figure>
      </div>

      <div class="bars">
        <span class="label">Compared across the range</span>
        <div v-for="b in bars" :key="b.key" class="bar-row">
          <p class="bar-l">{{ b.label }} <span class="muted mono">({{ b.better }} is better)</span></p>
          <div v-for="m in vehicles" :key="m.id" :class="['bar', { on: m.id === sel }]">
            <span class="bar-name mono">{{ m.short }}</span>
            <span class="bar-track"><i :style="{ width: `${barPct(b.key, m.specs[b.key])}%` }"></i></span>
            <span class="bar-v mono">{{ m.specs[b.key] }} {{ b.unit }}<em v-if="m.specs[b.key] === best(b)"> · best</em></span>
          </div>
        </div>
      </div>
      <p class="notice disc">All figures belong to fictional concept vehicles. They are design targets, not measured or verified real-world performance, and real range varies with speed, temperature, wheels and load.</p>
    </div>
  </section>
</template>

<style scoped>
.perf { background: var(--black); }
.p-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; margin-bottom: 3rem; }
.p-head h2 { margin: 0; }
.tabs { display: flex; border: 1px solid var(--line-strong); }
.tabs button { background: none; border: 0; padding: .8rem 1.1rem; font: 500 .7rem var(--mono); letter-spacing: .14em; color: var(--mute); cursor: pointer; }
.tabs button + button { border-left: 1px solid var(--line); }
.tabs button[aria-selected='true'] { background: var(--lime); color: var(--black); }
.figs { display: grid; grid-template-columns: repeat(3, 1fr); margin: 0; border-top: 1px solid var(--line); }
.fig { padding: 1.6rem 1.2rem 1.6rem 0; border-bottom: 1px solid var(--line); }
.fig:not(:nth-child(3n + 1)) { padding-left: 1.6rem; border-left: 1px solid var(--line); }
.fig dt { font: 500 .66rem var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--mute); }
.fig dd { margin: .6rem 0 0; font: 620 var(--step-4)/1 var(--display); font-stretch: 110%; letter-spacing: -.03em; }
.fig small { font: 500 .85rem var(--mono); color: var(--lime); margin-left: .4rem; letter-spacing: 0; }
.drive { font-size: .78rem; margin: 1.2rem 0 4rem; }
.lower { display: grid; grid-template-columns: 1fr 1.6fr; gap: clamp(2rem, 5vw, 5rem); align-items: start; }
.sprint { border: 1px solid var(--line); padding: 1.6rem; }
.speedo { display: flex; align-items: baseline; gap: .6rem; }
.speedo strong { font: 620 clamp(4rem, 9vw, 7rem)/1 var(--display); font-stretch: 110%; font-variant-numeric: tabular-nums; }
.speedo span { font: .9rem var(--mono); color: var(--lime); }
.track { height: 2px; background: var(--line); margin: 1rem 0 .6rem; overflow: hidden; }
.track i { display: block; height: 100%; background: var(--lime); transform-origin: left; }
.time { font-size: .85rem; margin-bottom: 1.2rem; }
.sp-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
.dims { margin: 0; }
.dims-draw { position: relative; }
.dims-draw :deep(text) { font: 500 11px var(--mono); fill: var(--soft); letter-spacing: .04em; }
.dims-draw :deep(text.m) { fill: var(--mute); }
.small { font-size: .74rem; margin-top: .6rem; }
.bars { margin-top: 5rem; display: grid; gap: 2rem; }
.bar-row { display: grid; gap: .5rem; }
.bar-l { margin: 0 0 .2rem; font-weight: 600; }
.bar-l .mono { font-weight: 400; font-size: .7rem; }
.bar { display: grid; grid-template-columns: 120px 1fr 150px; gap: 1rem; align-items: center; opacity: .55; transition: opacity .4s; }
.bar.on { opacity: 1; }
.bar-name { font-size: .66rem; letter-spacing: .12em; }
.bar-track { height: 6px; background: var(--graphite-2); }
.bar-track i { display: block; height: 100%; background: var(--soft); transition: width .8s var(--ease); }
.bar.on .bar-track i { background: var(--lime); }
.bar-v { font-size: .72rem; text-align: right; }
.bar-v em { font-style: normal; color: var(--lime); }
.disc { margin-top: 3rem; max-width: 80ch; }
@media (max-width: 900px) { .figs { grid-template-columns: 1fr 1fr; } .fig { padding-left: 0 !important; border-left: 0 !important; } .lower { grid-template-columns: 1fr; } .bar { grid-template-columns: 90px 1fr 110px; } }
</style>
