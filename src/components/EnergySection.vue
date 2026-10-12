<script setup>
/**
 * Energy and charging: an explorable battery pack diagram and a charging-curve calculator.
 * The calculator integrates the (fictional) charging curve, so the time it shows follows the chart.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useData, lookup } from '../composables/useData.js'
import { gsap, reducedMotion } from '../composables/useMotion.js'

const { site } = useData()
const e = site.energy
const v = lookup.vehicles.one
const root = ref(null)
const active = ref(e.modules[0].id)
const activeMod = computed(() => e.modules.find((m) => m.id === active.value))

// charging calculator
const from = 10
const target = ref(80)
const curve = e.curve
const power = (soc) => {
  for (let i = 0; i < curve.length - 1; i++) {
    const [a, pa] = curve[i], [b, pb] = curve[i + 1]
    if (soc >= a && soc <= b) return pa + ((pb - pa) * (soc - a)) / (b - a)
  }
  return curve.at(-1)[1]
}
const minutes = computed(() => {
  let t = 0
  for (let s = from; s < target.value; s += 0.5) t += ((v.specs.battery * 0.5) / 100) / power(s + 0.25)
  return Math.round(t * 60)
})
const kmAdded = computed(() => Math.round(((target.value - from) / 100) * v.specs.range))
// chart geometry
const W = 560, H = 260, P = 34
const X = (soc) => P + (soc / 100) * (W - P * 2)
const Y = (kw) => H - P - (kw / 340) * (H - P * 2)
const line = computed(() => 'M' + curve.map(([s, k]) => `${X(s)},${Y(k)}`).join(' L'))
const area = computed(() => {
  const pts = []
  for (let s = from; s <= target.value; s += 1) pts.push(`${X(s)},${Y(power(s))}`)
  return `M${X(from)},${Y(0)} L${pts.join(' L')} L${X(target.value)},${Y(0)} Z`
})

let ctx
onMounted(() => {
  if (reducedMotion) return
  ctx = gsap.context(() => {
    gsap.from('.curve-line', { drawSVG: '0%', duration: 1.8, ease: 'power2.inOut', scrollTrigger: { trigger: '.chart', start: 'top 80%', once: true } })
    gsap.from('.cell', { opacity: 0, duration: 0.4, stagger: { each: 0.008, from: 'random' }, scrollTrigger: { trigger: '.pack', start: 'top 80%', once: true } })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="energy" ref="root" class="en section grid-bg" aria-labelledby="en-title">
    <div class="wrap">
      <div class="en-head">
        <div>
          <span class="label">{{ e.kicker }}</span>
          <h2 id="en-title" v-split>{{ e.title }}</h2>
        </div>
        <p class="lede" v-fade>{{ e.text }}</p>
      </div>

      <div class="en-grid">
        <!-- Battery pack diagram -->
        <figure class="pack-fig">
          <figcaption class="label">Battery pack · {{ e.architecture }} · {{ v.specs.battery }} kWh usable</figcaption>
          <div class="pack-wrap">
            <svg class="pack" viewBox="0 0 600 340" role="img" aria-label="Top-down diagram of the battery pack showing cells, cooling plate, battery management unit and structural case.">
              <rect :class="['case', { hi: active === 'structure' }]" x="20" y="30" width="560" height="280" rx="26" />
              <g :class="['cooling', { hi: active === 'cooling' }]"><path v-for="k in 6" :key="k" :d="`M50,${60 + k * 36} H550`" /></g>
              <g :class="['cells', { hi: active === 'cells' }]"><rect v-for="k in 72" :key="k" class="cell" :x="54 + ((k - 1) % 12) * 40" :y="62 + Math.floor((k - 1) / 12) * 38" width="32" height="30" rx="3" /></g>
              <g :class="['bms', { hi: active === 'bms' }]"><rect x="440" y="44" width="110" height="34" rx="4" /><text x="495" y="66" text-anchor="middle">BMS</text></g>
              <path class="flow" d="M20,170 H-10 M580,170 H610" />
            </svg>
            <button v-for="m in e.modules" :key="m.id" :class="['pm', { on: active === m.id }]" :style="{ left: `${m.x}%`, top: `${m.y}%` }" :aria-pressed="active === m.id" :aria-label="m.label" @click="active = m.id" @mouseenter="active = m.id" @focus="active = m.id"><span></span></button>
          </div>
          <div class="pm-info" aria-live="polite">
            <strong>{{ activeMod.label }}</strong>
            <p>{{ activeMod.text }}</p>
          </div>
          <div class="pm-tabs" role="group" aria-label="Pack components">
            <button v-for="m in e.modules" :key="m.id" :aria-pressed="active === m.id" @click="active = m.id">{{ m.label }}</button>
          </div>
        </figure>

        <!-- Charging curve calculator -->
        <div class="charge">
          <span class="label">Charging curve · VOLT ONE</span>
          <svg class="chart" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Charging power by battery level. Peak ${v.specs.chargeRate} kW from about 10 to 30 percent, tapering above 55 percent.`">
            <g class="axes">
              <line :x1="P" :x2="W - P" :y1="Y(0)" :y2="Y(0)" />
              <g v-for="k in [0, 100, 200, 300]" :key="k"><line :x1="P" :x2="W - P" :y1="Y(k)" :y2="Y(k)" class="gl" /><text :x="P - 6" :y="Y(k) + 4" text-anchor="end">{{ k }}</text></g>
              <text v-for="s in [0, 20, 40, 60, 80, 100]" :key="s" :x="X(s)" :y="H - P + 18" text-anchor="middle">{{ s }}%</text>
              <text :x="P" :y="P - 12" class="u">kW</text>
            </g>
            <path :d="area" class="curve-area" />
            <path :d="line" class="curve-line" />
            <line :x1="X(target)" :x2="X(target)" :y1="Y(0)" :y2="Y(330)" class="tgt" />
          </svg>
          <label class="slider">
            <span class="mono">Charge from 10% to <strong>{{ target }}%</strong></span>
            <input v-model.number="target" type="range" min="20" max="100" step="5" :aria-valuetext="`${target} percent`" />
          </label>
          <div class="result" aria-live="polite">
            <div><span class="mono muted">Time</span><strong>≈ {{ minutes }}<small>min</small></strong></div>
            <div><span class="mono muted">Range added</span><strong>≈ {{ kmAdded }}<small>km</small></strong></div>
          </div>
          <p class="notice">Illustrative estimate from the fictional charging curve above, assuming a {{ v.specs.chargeRate }} kW charger and a pre-conditioned battery. Real charging speed depends on the charger, temperature and battery state.</p>
        </div>
      </div>

      <div class="phil">
        <article v-for="(p, i) in e.philosophy" :key="p.title" v-fade>
          <span class="mono accent">0{{ i + 1 }}</span>
          <h3>{{ p.title }}</h3>
          <p>{{ p.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.en { background-color: var(--graphite); background-size: 80px 80px; }
.en-head { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: end; margin-bottom: 4rem; }
.en-head h2 { margin: 0; }
.en-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: clamp(2rem, 5vw, 5rem); }
.pack-fig, .charge { margin: 0; background: rgba(7, 8, 9, .7); border: 1px solid var(--line); padding: clamp(1rem, 2.5vw, 2rem); backdrop-filter: blur(4px); }
.pack-wrap { position: relative; }
.pack { width: 100%; height: auto; overflow: visible; }
.case { fill: #0b0c0e; stroke: var(--line-strong); stroke-width: 2; transition: stroke .4s; }
.cooling path { stroke: #2b4a5c; stroke-width: 6; opacity: .6; transition: stroke .4s, opacity .4s; }
.cell { fill: #1c1f23; stroke: #2c3036; transition: fill .4s, stroke .4s; }
.bms rect { fill: #16191c; stroke: var(--line-strong); transition: stroke .4s; }
.bms text { font: 600 13px var(--mono); fill: var(--soft); letter-spacing: .12em; }
.case.hi, .bms.hi rect { stroke: var(--lime); }
.cooling.hi path { stroke: var(--lime); opacity: .9; }
.cells.hi .cell { fill: #2a3318; stroke: var(--lime); }
.flow { stroke: var(--lime); stroke-width: 2; stroke-dasharray: 4 4; }
.pm { position: absolute; width: 28px; height: 28px; margin: -14px 0 0 -14px; border: 1px solid var(--lime); background: rgba(7, 8, 9, .7); cursor: pointer; display: grid; place-items: center; padding: 0; }
.pm span { width: 8px; height: 8px; background: var(--lime); transition: transform .4s var(--ease); }
.pm.on span { transform: rotate(45deg) scale(1.3); }
.pm-info { min-height: 6.5rem; margin-top: 1rem; }
.pm-info strong { font: 600 .78rem var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--lime); }
.pm-info p { margin: .4rem 0 0; color: var(--soft); }
.pm-tabs { display: flex; flex-wrap: wrap; gap: .3rem; }
.pm-tabs button { background: none; border: 1px solid var(--line); padding: .45rem .7rem; font: 500 .64rem var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--mute); cursor: pointer; }
.pm-tabs button[aria-pressed='true'] { border-color: var(--lime); color: var(--white); }
.chart { width: 100%; height: auto; }
.axes line { stroke: var(--line-strong); }
.axes .gl { stroke: var(--line); stroke-dasharray: 2 4; }
.axes text { font: 10px var(--mono); fill: var(--mute); }
.curve-area { fill: rgba(197, 242, 58, .14); transition: d .3s; }
.curve-line { fill: none; stroke: var(--lime); stroke-width: 2.5; }
.tgt { stroke: var(--white); stroke-dasharray: 3 3; }
.slider { display: grid; gap: .6rem; margin: 1.2rem 0; }
.slider .mono { font-size: .78rem; }
.slider strong { color: var(--lime); }
input[type='range'] { -webkit-appearance: none; appearance: none; width: 100%; height: 2px; background: var(--line-strong); }
input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: var(--lime); border: 0; cursor: pointer; }
input[type='range']::-moz-range-thumb { width: 18px; height: 18px; background: var(--lime); border: 0; border-radius: 0; cursor: pointer; }
.result { display: flex; gap: 2.5rem; margin-bottom: 1rem; }
.result .mono { display: block; font-size: .64rem; letter-spacing: .14em; text-transform: uppercase; }
.result strong { font: 620 var(--step-3)/1.1 var(--display); font-stretch: 110%; }
.result small { font: .8rem var(--mono); color: var(--lime); margin-left: .3rem; }
.phil { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 5rem; border-top: 1px solid var(--line); padding-top: 2.5rem; }
.phil h3 { font-size: var(--step-1); margin: .6rem 0; }
.phil p { color: var(--soft); font-size: .95rem; }
@media (max-width: 960px) { .en-head, .en-grid, .phil { grid-template-columns: 1fr; } }
</style>
