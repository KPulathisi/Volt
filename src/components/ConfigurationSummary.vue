<script setup>
/** Dedicated summary of the current configuration with copy, print and spec-sheet download. */
import { ref, onBeforeUnmount } from 'vue'
import { Copy, Printer, Download, Link2, Save, RotateCcw } from 'lucide-vue-next'
import { useVehicleConfig } from '../composables/useVehicleConfig.js'
import { money } from '../composables/useData.js'
import { makeSpecSheet, downloadBlob } from '../composables/useSpecSheet.js'

const props = defineProps({ getSnapshot: { type: Function, default: null }, getSvg: { type: Function, default: null } })
const emit = defineEmits(['status'])
const cfg = useVehicleConfig()
const { pricing, parts } = cfg
const busy = ref(false)

async function copyText() {
  try { await navigator.clipboard.writeText(cfg.summaryText()); emit('status', 'Configuration details copied.') } catch { emit('status', 'Copy failed in this browser.') }
}
async function copyLink() {
  try { await navigator.clipboard.writeText(cfg.shareUrl()); emit('status', 'Share link copied.') } catch { emit('status', 'Copy failed. The link is in the address bar.') }
}
function print() {
  document.body.classList.add('print-summary')
  window.print()
}
const afterPrint = () => document.body.classList.remove('print-summary')
window.addEventListener('afterprint', afterPrint)
onBeforeUnmount(() => window.removeEventListener('afterprint', afterPrint))

async function download() {
  busy.value = true
  try {
    const blob = await makeSpecSheet({ parts: parts.value, pricing: pricing.value, snapshot: props.getSnapshot?.(), svgEl: props.getSvg?.(), shareUrl: cfg.shareUrl() })
    downloadBlob(blob, `volt-${parts.value.vehicle.id}-${parts.value.paint.id}-spec-sheet.png`)
    emit('status', 'Specification sheet downloaded.')
  } catch (e) {
    emit('status', 'Could not create the specification sheet.')
  } finally { busy.value = false }
}
</script>

<template>
  <section id="summary" class="sum section" aria-labelledby="sum-title">
    <div class="wrap grid">
      <div class="head">
        <span class="label">Configuration summary</span>
        <h2 id="sum-title">{{ parts.vehicle.name }}</h2>
        <p class="lede">{{ parts.paint.name }} paint, {{ parts.wheel.name }} wheels and a {{ parts.interior.name.toLowerCase() }} interior{{ parts.packages.length ? `, with the ${parts.packages.map((p) => p.name).join(' and ')}` : '' }}.</p>
        <dl class="figs">
          <div><dt>Estimated range</dt><dd>{{ pricing.range }}<small>km</small></dd></div>
          <div><dt>0–100 km/h</dt><dd>{{ pricing.accel }}<small>s</small></dd></div>
          <div><dt>Peak power</dt><dd>{{ pricing.power }}<small>kW</small></dd></div>
        </dl>
        <p class="notice">This is a concept configuration for a fictional vehicle. It is not an order, a reservation or a quote, and nothing is sent anywhere. Figures are concept targets; real range depends on speed, weather, wheels and load.</p>
      </div>

      <div class="sheet">
        <table class="lines">
          <caption class="sr-only">Price breakdown</caption>
          <thead><tr><th scope="col">Item</th><th scope="col" class="r">Price</th></tr></thead>
          <tbody>
            <tr v-for="l in pricing.lines" :key="l.key"><th scope="row"><span class="ln">{{ l.label }}</span><span class="ld">{{ l.detail }}</span></th><td class="r mono">{{ l.included || !l.price ? 'Included' : money(l.price) }}</td></tr>
          </tbody>
          <tfoot><tr><th scope="row">Estimated price <span class="ld">Illustrative, before taxes, delivery and fees</span></th><td class="r total">{{ money(pricing.total) }}</td></tr></tfoot>
        </table>
        <div class="acts no-print">
          <button class="btn small" @click="copyText"><Copy />Copy details</button>
          <button class="btn small" @click="copyLink"><Link2 />Copy link</button>
          <button class="btn small" @click="print"><Printer />Print</button>
          <button class="btn solid small" :disabled="busy" @click="download"><Download />{{ busy ? 'Preparing…' : 'Spec sheet (PNG)' }}</button>
          <button class="btn small" @click="emit('status', cfg.save() ? 'Configuration saved on this device.' : 'Could not save in this browser.')"><Save />Save</button>
          <button class="btn small" @click="cfg.reset(); emit('status', 'Configuration reset.')"><RotateCcw />Reset</button>
        </div>
        <p v-if="cfg.state.savedAt" class="notice saved">Last saved on this device: {{ new Date(cfg.state.savedAt).toLocaleString() }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sum { border-top: 1px solid var(--line); }
.grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: clamp(2rem, 6vw, 6rem); }
.head h2 { font-size: var(--step-3); }
.figs { display: flex; gap: 2.5rem; margin: 2rem 0; flex-wrap: wrap; }
.figs dt { font: 500 .66rem var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--mute); }
.figs dd { margin: .3rem 0 0; font: 620 var(--step-3)/1 var(--display); font-stretch: 110%; }
.figs small { font: 500 .8rem var(--mono); color: var(--lime); margin-left: .3rem; }
.lines { width: 100%; border-collapse: collapse; }
.lines th, .lines td { text-align: left; padding: .9rem 0; border-bottom: 1px solid var(--line); vertical-align: top; font-weight: 400; }
.lines thead th { font: 500 .66rem var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--mute); padding-top: 0; }
.r { text-align: right !important; }
.ln { display: block; font-weight: 600; }
.ld { display: block; font: .7rem/1.4 var(--mono); color: var(--mute); max-width: 46ch; }
tfoot th { font-weight: 600 !important; border-bottom: 0 !important; padding-top: 1.4rem !important; }
.total { font: 620 var(--step-2) var(--display); font-stretch: 110%; color: var(--lime); border-bottom: 0 !important; padding-top: 1.2rem !important; }
.acts { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: 1.5rem; }
.saved { margin-top: 1rem; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
</style>

<style>
@media print {
  body.print-summary main > * > *:not(#summary), body.print-summary header, body.print-summary footer, body.print-summary .progress { display: none !important; }
  body.print-summary #summary { padding: 0; border: 0; }
  body.print-summary #summary * { color: #000 !important; }
  body.print-summary #summary .total { color: #000 !important; }
}
</style>
