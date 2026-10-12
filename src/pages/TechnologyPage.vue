<script setup>
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import PageHero from '../components/PageHero.vue'
import PerformanceSpecs from '../components/PerformanceSpecs.vue'
import EnergySection from '../components/EnergySection.vue'
import { useHashScroll } from '../composables/useHashScroll.js'
useHashScroll()
const faq = [
  { q: 'Is VOLT a real car?', a: 'No. VOLT and its three models are fictional, created for a design portfolio. The figures are design targets for concept cars, not measured results, and nothing can be ordered.' },
  { q: 'Why does the range change in the configurator?', a: 'Larger, more open wheels add drag and weight, and the Performance Package trades a little range for power. The configurator applies those differences to the model\'s base figure.' },
  { q: 'What does 800-volt mean for charging?', a: 'A higher system voltage moves the same power with less current, which keeps cables and cells cooler. That lets the battery hold high charging power for longer on a suitable fast charger.' },
  { q: 'How is the 3D car made?', a: 'It is built in code with Three.js from the same shape data used for the 2D drawings, so no 3D model files are downloaded. Browsers without WebGL see a 2D drawing instead.' },
  { q: 'Can I share a configuration?', a: 'Yes. The configurator keeps your choices in the page address, so copying the link shares the exact build. Invalid values in a link fall back to safe defaults.' }
]
const open = ref(0)
</script>

<template>
  <div>
    <PageHero label="Technology" title="Engineered to be calm." intro="Specifications, charging and the thinking behind the platform. Every figure on this page belongs to a fictional concept vehicle." />
    <div id="specs"><PerformanceSpecs :heading="false" /></div>
    <EnergySection />
    <section class="faq section" aria-labelledby="faq-title">
      <div class="wrap f-grid">
        <div><span class="label">Questions</span><h2 id="faq-title" v-split>Good to know</h2></div>
        <div class="f-list">
          <div v-for="(f, i) in faq" :key="f.q" :class="['f-item', { on: open === i }]">
            <h3><button :aria-expanded="open === i" :aria-controls="`fa-${i}`" @click="open = open === i ? -1 : i">{{ f.q }}<Plus aria-hidden="true" /></button></h3>
            <div :id="`fa-${i}`" class="f-a" :hidden="open !== i"><p>{{ f.a }}</p></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.f-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: clamp(2rem, 6vw, 6rem); }
.f-grid h2 { font-size: var(--step-3); }
.f-item { border-bottom: 1px solid var(--line); }
.f-item h3 { margin: 0; font: 500 var(--step-1)/1.3 var(--sans); text-transform: none; letter-spacing: 0; }
.f-item button { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 1rem; text-align: left; background: none; border: 0; padding: 1.3rem 0; cursor: pointer; }
.f-item svg { width: 20px; flex: none; color: var(--lime); transition: transform .4s var(--ease); }
.f-item.on svg { transform: rotate(45deg); }
.f-a p { color: var(--soft); margin: 0 0 1.4rem; }
@media (max-width: 900px) { .f-grid { grid-template-columns: 1fr; } }
</style>
