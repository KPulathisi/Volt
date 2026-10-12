<script setup>
/** Compare the three models side by side. Visitors pick which to compare and can hide identical rows. */
import { ref, computed } from 'vue'
import { ArrowUpRight, Check } from 'lucide-vue-next'
import CarSVG from './CarSVG.vue'
import { useData, money, num } from '../composables/useData.js'

defineProps({ heading: { type: Boolean, default: true } })
const { vehicles } = useData()
const picked = ref(vehicles.map((v) => v.id))
const diffOnly = ref(false)
const msg = ref('')
const paints = { one: '#4a4e54', touring: '#1b3550', performance: '#e0531f' }
const cols = computed(() => vehicles.filter((v) => picked.value.includes(v.id)))

function toggle(id) {
  if (picked.value.includes(id)) {
    if (picked.value.length <= 2) { msg.value = 'Compare at least two models.'; return }
    picked.value = picked.value.filter((x) => x !== id)
  } else picked.value = vehicles.map((v) => v.id).filter((x) => x === id || picked.value.includes(x))
  msg.value = ''
}

const rows = [
  { label: 'Body style', get: (v) => v.body },
  { label: 'Seats', get: (v) => v.seats, better: 'higher' },
  { label: 'Price from (illustrative)', get: (v) => v.basePrice, fmt: money, better: 'lower' },
  { label: 'Estimated range', get: (v) => v.specs.range, unit: 'km', better: 'higher' },
  { label: '0–100 km/h', get: (v) => v.specs.accel, unit: 's', d: 1, better: 'lower' },
  { label: 'Top speed', get: (v) => v.specs.topSpeed, unit: 'km/h', better: 'higher' },
  { label: 'Peak power', get: (v) => v.specs.power, unit: 'kW', better: 'higher' },
  { label: 'Peak charging', get: (v) => v.specs.chargeRate, unit: 'kW', better: 'higher' },
  { label: '10–80% charge', get: (v) => v.specs.charge10to80, unit: 'min', better: 'lower' },
  { label: 'Usable battery', get: (v) => v.specs.battery, unit: 'kWh' },
  { label: 'Luggage', get: (v) => v.specs.cargo, unit: 'L', better: 'higher' },
  { label: 'Length', get: (v) => v.specs.length, unit: 'mm' },
  { label: 'Drivetrain', get: (v) => v.specs.drivetrain }
]
const shown = computed(() => rows.filter((r) => !diffOnly.value || new Set(cols.value.map(r.get)).size > 1))
const show = (r, v) => { const x = r.get(v); return r.fmt ? r.fmt(x) : typeof x === 'number' ? `${num(x, r.d || 0)}${r.unit ? ' ' + r.unit : ''}` : x }
const isBest = (r, v) => {
  if (!r.better || cols.value.length < 2) return false
  const vals = cols.value.map(r.get)
  const b = r.better === 'higher' ? Math.max(...vals) : Math.min(...vals)
  return r.get(v) === b && new Set(vals).size > 1
}
</script>

<template>
  <section id="compare" class="cmp section" aria-labelledby="cmp-title">
    <div class="wrap">
      <div class="c-head">
        <div><span class="label">The range</span><h2 id="cmp-title" v-split>{{ heading ? 'Three ways to move.' : 'Compare models' }}</h2></div>
        <label class="diff"><input v-model="diffOnly" type="checkbox" /><span class="sw" aria-hidden="true"></span>Show differences only</label>
      </div>

      <div class="cards">
        <article v-for="v in vehicles" :key="v.id" :class="['card', { on: picked.includes(v.id) }]">
          <div class="c-car"><CarSVG :model="v.id" :paint="paints[v.id]" :wheel="v.id === 'performance' ? 'blade' : v.id === 'touring' ? 'turbine' : 'aero'" :performance="v.standardPackages.includes('performance')" /></div>
          <h3>{{ v.name }}</h3>
          <p class="tag">{{ v.tagline }}</p>
          <p class="mono muted meta">{{ v.body }} · from {{ money(v.basePrice) }}</p>
          <div class="c-acts">
            <button class="btn small" :aria-pressed="picked.includes(v.id)" @click="toggle(v.id)"><Check v-if="picked.includes(v.id)" />{{ picked.includes(v.id) ? 'Comparing' : 'Add to compare' }}</button>
            <RouterLink :to="{ path: '/configure', query: { model: v.id } }" class="btn small solid">Configure<ArrowUpRight /></RouterLink>
          </div>
        </article>
      </div>
      <p class="msg mono" role="status">{{ msg }}</p>

      <div class="t-wrap" tabindex="0" role="region" aria-label="Comparison table, scrolls sideways on small screens">
        <table>
          <caption class="sr-only">Specifications of the selected VOLT models. "Best" marks the strongest figure in each row.</caption>
          <thead><tr><th scope="col"><span class="sr-only">Specification</span></th><th v-for="v in cols" :key="v.id" scope="col">{{ v.name }}</th></tr></thead>
          <TransitionGroup tag="tbody" name="row">
            <tr v-for="r in shown" :key="r.label">
              <th scope="row">{{ r.label }}</th>
              <td v-for="v in cols" :key="v.id" :class="{ best: isBest(r, v) }">{{ show(r, v) }}<span v-if="isBest(r, v)" class="b-tag">Best</span></td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
      <p class="notice">Fictional concept vehicles. Specifications are design targets and prices are illustrative.</p>
    </div>
  </section>
</template>

<style scoped>
.c-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 3rem; }
.c-head h2 { margin: 0; }
.diff { display: inline-flex; align-items: center; gap: .7rem; font: 500 .72rem var(--mono); letter-spacing: .1em; text-transform: uppercase; cursor: pointer; }
.diff input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.sw { width: 40px; height: 22px; border: 1px solid var(--line-strong); position: relative; transition: background .3s, border-color .3s; }
.sw::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; background: var(--mute); transition: transform .35s var(--ease), background .3s; }
.diff input:checked + .sw { border-color: var(--lime); }
.diff input:checked + .sw::after { transform: translateX(18px); background: var(--lime); }
.diff input:focus-visible + .sw { outline: 2px solid var(--lime); outline-offset: 2px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.card { border: 1px solid var(--line); padding: 1.4rem; transition: border-color .4s, background-color .4s; display: grid; align-content: start; }
.card.on { border-color: var(--line-strong); background: var(--graphite); }
.c-car { padding: 1rem 0 1.4rem; transition: transform 1s var(--ease); }
.card:hover .c-car { transform: translateX(-4%); }
.card h3 { font-size: var(--step-1); margin-bottom: .4rem; }
.tag { color: var(--soft); margin-bottom: .3rem; }
.meta { font-size: .72rem; }
.c-acts { display: flex; gap: .4rem; flex-wrap: wrap; margin-top: 1rem; }
.msg { min-height: 1.4em; color: #ffb59c; font-size: .75rem; margin: .8rem 0; }
.t-wrap { overflow-x: auto; border-top: 1px solid var(--line-strong); }
table { width: 100%; border-collapse: collapse; min-width: 640px; }
th, td { text-align: left; padding: 1rem .8rem 1rem 0; border-bottom: 1px solid var(--line); vertical-align: top; font-weight: 400; }
thead th { font: 620 .8rem var(--display); font-stretch: 115%; text-transform: uppercase; padding-top: 1.2rem; }
tbody th { font: 500 .7rem var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--mute); width: 22%; }
td.best { color: var(--white); font-weight: 600; }
.b-tag { margin-left: .5rem; font: 500 .58rem var(--mono); letter-spacing: .12em; text-transform: uppercase; background: var(--lime); color: var(--black); padding: .15rem .35rem; vertical-align: 1px; }
.row-enter-active, .row-leave-active { transition: opacity .35s, transform .35s var(--ease); }
.row-enter-from, .row-leave-to { opacity: 0; transform: translateX(-10px); }
.notice { margin-top: 1.5rem; }
@media (max-width: 900px) { .cards { grid-template-columns: 1fr; } }
</style>
