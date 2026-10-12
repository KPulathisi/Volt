<script setup>
/**
 * Vehicle configurator: live 3D preview on the left, options on the right.
 * All state and pricing live in useVehicleConfig / useVehiclePricing; this component is only UI.
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, RotateCcw, Save, Link2, ArrowRight, Lock } from 'lucide-vue-next'
import VehicleViewer from './VehicleViewer.vue'
import ColorSelector from './ColorSelector.vue'
import WheelSelector from './WheelSelector.vue'
import CarSVG from './CarSVG.vue'
import ConfigurationSummary from './ConfigurationSummary.vue'
import { useVehicleConfig, toQuery } from '../composables/useVehicleConfig.js'
import { catalog, money } from '../composables/useData.js'

const props = defineProps({ compact: Boolean, syncUrl: Boolean })
const route = useRoute(), router = useRouter()
const cfg = useVehicleConfig()
const { state, pricing, parts, vehicle } = cfg
const viewer = ref(null)
const status = ref('')
const priceLive = ref('')
let st = 0
function say(msg) { status.value = msg; clearTimeout(st); st = setTimeout(() => (status.value = ''), 3200) }

// Announce price changes politely for screen readers
watch(() => pricing.value.total, (t, old) => { if (old !== undefined) priceLive.value = `Estimated price ${money(t)}` })

onMounted(() => {
  if (props.syncUrl && ['model', 'paint', 'wheels', 'interior', 'pkg'].some((k) => k in route.query)) {
    const c = cfg.loadQuery(route.query)
    if (c.length) say('Some options in the link were not valid and were reset to defaults.')
  }
  // show the current build in the address straight away, so it can be copied
  if (props.syncUrl) router.replace({ query: toQuery(cfg.config.value) })
})
if (props.syncUrl) watch(cfg.config, (c) => router.replace({ query: toQuery(c) }), { deep: true })

function save() { say(cfg.save() ? 'Configuration saved on this device.' : 'Could not save: storage is blocked in this browser.') }
async function copyLink() {
  try { await navigator.clipboard.writeText(cfg.shareUrl()); say('Share link copied.') } catch { say('Copy failed. The link is in the address bar.') }
}
function reset() { cfg.reset(); say('Configuration reset to the defaults.') }

const steps = computed(() => props.compact ? [['paint', 'Paint'], ['wheels', 'Wheels']] : [['model', 'Model'], ['paint', 'Paint'], ['wheels', 'Wheels'], ['interior', 'Interior'], ['packages', 'Packages']])
const svgEl = () => viewer.value?.$el?.querySelector('.poster svg')
</script>

<template>
  <section :class="['cfg', { compact }]" aria-labelledby="cfg-title">
    <div class="stage">
      <VehicleViewer ref="viewer" :parts="parts" views auto-rotate />
      <div class="stage-meta">
        <span class="mono muted">{{ vehicle.body }}</span>
        <strong>{{ vehicle.name }}</strong>
        <span class="mono muted">{{ parts.paint.name }} · {{ parts.wheel.name }} · {{ parts.interior.name }}</span>
      </div>
    </div>

    <div class="panel">
      <header class="p-head">
        <span class="label">{{ compact ? 'Configurator' : 'Build your VOLT' }}</span>
        <h2 id="cfg-title">{{ compact ? 'Make it yours' : 'Configure' }}</h2>
        <p v-if="state.corrections.length" class="corr" role="status">Some options in the link were not valid and were reset: {{ state.corrections.join('; ') }}.</p>
      </header>

      <div v-for="(s, i) in steps" :key="s[0]" class="step">
        <h3 class="step-h"><span class="mono accent">0{{ i + 1 }}</span>{{ s[1] }}<span class="step-v mono muted">
          {{ s[0] === 'model' ? vehicle.short : s[0] === 'paint' ? parts.paint.name : s[0] === 'wheels' ? parts.wheel.name : s[0] === 'interior' ? parts.interior.name : `${state.packages.length} selected` }}</span></h3>

        <fieldset v-if="s[0] === 'model'" class="models">
          <legend class="sr-only">Model</legend>
          <label v-for="m in catalog.vehicles" :key="m.id" :class="['mcard', { on: state.model === m.id }]">
            <input type="radio" name="model" class="sr-only" :checked="state.model === m.id" @change="cfg.setModel(m.id)" />
            <CarSVG :model="m.id" :paint="state.model === m.id ? parts.paint.hex : '#3a3d42'" :wheel="m.allowedWheels.includes(state.wheels) ? parts.wheel.style : 'aero'" :floor="false" :lights="false" :performance="m.standardPackages.includes('performance')" />
            <span class="m-name">{{ m.name }} <Check v-if="state.model === m.id" class="ck" aria-label="Selected" /></span>
            <span class="m-meta mono">{{ m.body }} · from {{ money(m.basePrice) }}</span>
          </label>
        </fieldset>

        <ColorSelector v-else-if="s[0] === 'paint'" :colors="catalog.colors" :model-value="state.paint" @update:model-value="cfg.select('paint', $event)" />
        <WheelSelector v-else-if="s[0] === 'wheels'" :wheels="catalog.wheels" :allowed="vehicle.allowedWheels" :model-value="state.wheels" @update:model-value="cfg.select('wheels', $event)" />

        <fieldset v-else-if="s[0] === 'interior'" class="ints">
          <legend class="sr-only">Interior</legend>
          <label v-for="it in catalog.interiors" :key="it.id" :class="['icard', { on: state.interior === it.id }]">
            <input type="radio" name="interior" class="sr-only" :checked="state.interior === it.id" @change="cfg.select('interior', it.id)" />
            <span class="isw" :style="{ background: `linear-gradient(135deg, ${it.hex} 60%, ${it.accent} 60%)` }"></span>
            <span><span class="i-name">{{ it.name }} <Check v-if="state.interior === it.id" class="ck" aria-label="Selected" /></span><span class="i-meta">{{ it.material }}</span></span>
            <span class="i-price mono">{{ it.price ? money(it.price) : 'Included' }}</span>
          </label>
        </fieldset>

        <fieldset v-else-if="s[0] === 'packages'" class="pkgs">
          <legend class="sr-only">Packages</legend>
          <label v-for="p in catalog.packages" :key="p.id" :class="['pcard', { on: state.packages.includes(p.id), locked: vehicle.standardPackages.includes(p.id) }]">
            <input type="checkbox" class="sr-only" :checked="state.packages.includes(p.id)" :disabled="vehicle.standardPackages.includes(p.id)" @change="cfg.togglePackage(p.id)" />
            <span class="p-top">
              <span class="box" aria-hidden="true"><Lock v-if="vehicle.standardPackages.includes(p.id)" /><Check v-else-if="state.packages.includes(p.id)" /></span>
              <span class="p-name">{{ p.name }}</span>
              <span class="p-price mono">{{ vehicle.standardPackages.includes(p.id) ? 'Standard' : money(p.price) }}</span>
            </span>
            <span class="p-sum">{{ p.summary }}</span>
            <ul class="p-items"><li v-for="x in p.items" :key="x">{{ x }}</li></ul>
          </label>
        </fieldset>
      </div>

      <div class="pricebar">
        <div class="pb-total">
          <span class="mono muted">Estimated price</span>
          <strong>{{ money(pricing.total) }}</strong>
          <span class="mono muted small">{{ pricing.range }} km · {{ pricing.accel }} s 0–100 · illustrative</span>
        </div>
        <div class="pb-actions">
          <template v-if="compact">
            <RouterLink :to="{ path: '/configure', query: toQuery(cfg.config.value) }" class="btn solid small">Full configurator<ArrowRight /></RouterLink>
          </template>
          <template v-else>
            <button class="btn small" @click="reset"><RotateCcw />Reset</button>
            <button class="btn small" @click="save"><Save />{{ cfg.isSaved.value ? 'Saved' : 'Save' }}</button>
            <button class="btn solid small" @click="copyLink"><Link2 />Copy link</button>
          </template>
        </div>
        <p class="pb-status" role="status" aria-live="polite">{{ status }}</p>
        <p class="sr-only" aria-live="polite">{{ priceLive }}</p>
      </div>
    </div>
  </section>
  <ConfigurationSummary v-if="!compact" :get-snapshot="() => viewer?.snapshot()" :get-svg="svgEl" @status="say" />
</template>

<style scoped>
.cfg { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(360px, 1fr); min-height: calc(100vh - var(--header)); border-top: 1px solid var(--line); }
.stage { position: sticky; top: var(--header); height: calc(100vh - var(--header)); background: radial-gradient(ellipse at 50% 60%, #181b1f, var(--black) 70%); border-right: 1px solid var(--line); }
.stage-meta { position: absolute; left: var(--gutter); top: 1.4rem; display: grid; gap: .2rem; pointer-events: none; }
.stage-meta strong { font: 620 var(--step-2)/1 var(--display); font-stretch: 125%; }
.stage-meta .mono { font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; }
.panel { padding: 2rem clamp(1rem, 3vw, 2.5rem) 0; display: grid; gap: 2.2rem; align-content: start; }
.p-head h2 { font-size: var(--step-3); margin: 0; }
.corr { margin: 1rem 0 0; padding: .8rem 1rem; border: 1px solid #ff8f6b; color: #ffc2ad; font-size: .85rem; }
.step { display: grid; gap: 1rem; }
.step-h { display: flex; align-items: baseline; gap: .8rem; font-size: 1rem; letter-spacing: .02em; margin: 0; padding-bottom: .7rem; border-bottom: 1px solid var(--line); }
.step-h .mono { font-size: .72rem; }
.step-v { margin-left: auto; font: 500 .68rem var(--mono); letter-spacing: .08em; text-transform: uppercase; }
fieldset { border: 0; padding: 0; margin: 0; }
.ck { width: 1em; height: 1em; color: var(--lime); vertical-align: -2px; }
.models { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
.mcard { display: grid; gap: .3rem; padding: .8rem .7rem; border: 1px solid var(--line); cursor: pointer; transition: border-color .3s, background-color .3s; }
.mcard:hover { border-color: var(--line-strong); }
.mcard.on { border-color: var(--lime); background: rgba(197, 242, 58, .05); }
.mcard:focus-within, .icard:focus-within, .pcard:focus-within { outline: 2px solid var(--lime); outline-offset: 2px; }
.m-name { font: 620 .78rem var(--display); font-stretch: 112%; text-transform: uppercase; }
.m-meta { font-size: .62rem; color: var(--mute); }
.ints { display: grid; gap: .5rem; }
.icard { display: grid; grid-template-columns: 40px 1fr auto; gap: .9rem; align-items: center; padding: .7rem .9rem; border: 1px solid var(--line); cursor: pointer; transition: border-color .3s, background-color .3s; }
.icard.on { border-color: var(--lime); background: rgba(197, 242, 58, .05); }
.isw { width: 40px; height: 40px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .15); }
.i-name { display: block; font-weight: 600; }
.i-meta { display: block; font: .7rem/1.4 var(--mono); color: var(--mute); }
.i-price { font-size: .72rem; color: var(--soft); }
.pkgs { display: grid; gap: .5rem; }
.pcard { display: grid; gap: .6rem; padding: 1rem; border: 1px solid var(--line); cursor: pointer; transition: border-color .3s, background-color .3s; }
.pcard.on { border-color: var(--lime); background: rgba(197, 242, 58, .05); }
.pcard.locked { cursor: default; }
.p-top { display: flex; align-items: center; gap: .8rem; }
.box { width: 22px; height: 22px; border: 1px solid var(--line-strong); display: grid; place-items: center; flex: none; }
.pcard.on .box { background: var(--lime); border-color: var(--lime); color: var(--black); }
.box svg { width: 14px; }
.p-name { font-weight: 600; flex: 1; }
.p-price { font-size: .75rem; }
.p-sum { font-size: .86rem; color: var(--soft); }
.p-items { margin: 0; padding-left: 1.1rem; font: .7rem/1.7 var(--mono); color: var(--mute); }
.pricebar { position: sticky; bottom: 0; z-index: 3; margin: 0 calc(-1 * clamp(1rem, 3vw, 2.5rem)); padding: 1rem clamp(1rem, 3vw, 2.5rem); background: rgba(7, 8, 9, .92); backdrop-filter: blur(10px); border-top: 1px solid var(--line-strong); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .8rem 1rem; }
.pb-total { display: grid; }
.pb-total .mono { font-size: .64rem; letter-spacing: .12em; text-transform: uppercase; }
.pb-total strong { font: 620 var(--step-2)/1.1 var(--display); font-stretch: 110%; }
.pb-total .small { letter-spacing: .04em; text-transform: none; }
.pb-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
.pb-status { flex-basis: 100%; margin: 0; min-height: 1.2em; font: .74rem var(--mono); color: var(--lime); }
.pb-status:empty { display: none; }
.compact { min-height: 0; grid-template-columns: minmax(0, 1.6fr) minmax(340px, 1fr); }
.compact .stage { position: relative; top: 0; height: clamp(420px, 70vh, 720px); }
@media (max-width: 960px) {
  .cfg, .compact { grid-template-columns: 1fr; }
  .stage, .compact .stage { position: sticky; top: var(--header); height: 42vh; z-index: 2; border-right: 0; border-bottom: 1px solid var(--line); }
  .compact .stage { position: relative; top: 0; height: 48vh; }
  .models { grid-template-columns: 1fr 1fr 1fr; }
}
@media (max-width: 520px) { .models { grid-template-columns: 1fr; } .mcard { grid-template-columns: 110px 1fr; align-items: center; } .mcard :deep(svg) { grid-row: span 2; } }
</style>
