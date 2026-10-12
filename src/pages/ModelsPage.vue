<script setup>
import { ArrowUpRight } from 'lucide-vue-next'
import PageHero from '../components/PageHero.vue'
import ModelComparison from '../components/ModelComparison.vue'
import MediaFrame from '../components/MediaFrame.vue'
import { useData, money } from '../composables/useData.js'
import { useHashScroll } from '../composables/useHashScroll.js'
useHashScroll()
const { vehicles } = useData()
</script>

<template>
  <div>
    <PageHero label="Models" title="One platform, three characters." intro="The same calm electric platform as a fastback saloon, a long-roof shooting brake and a low two-door coupé." />
    <section class="rows">
      <article v-for="(v, i) in vehicles" :key="v.id" :class="['mrow', { flip: i % 2 }]">
        <div v-reveal.left class="m-media"><MediaFrame :id="v.media" fill sizes="(min-width: 900px) 60vw, 100vw" /></div>
        <div class="m-text">
          <span class="label">0{{ i + 1 }} · {{ v.body }}</span>
          <h2 v-split>{{ v.name }}</h2>
          <p class="lede">{{ v.description }}</p>
          <dl class="m-figs">
            <div><dt>Range</dt><dd>{{ v.specs.range }} km</dd></div>
            <div><dt>0–100</dt><dd>{{ v.specs.accel }} s</dd></div>
            <div><dt>From</dt><dd>{{ money(v.basePrice) }}</dd></div>
          </dl>
          <RouterLink :to="{ path: '/configure', query: { model: v.id } }" class="btn solid">Configure {{ v.short }}<ArrowUpRight /></RouterLink>
        </div>
      </article>
    </section>
    <ModelComparison :heading="false" />
  </div>
</template>

<style scoped>
.rows { display: grid; gap: clamp(4rem, 9vw, 9rem); padding-block: clamp(4rem, 9vw, 8rem); }
.mrow { display: grid; grid-template-columns: 1.4fr 1fr; gap: clamp(2rem, 5vw, 5rem); align-items: center; padding-inline: var(--gutter); max-width: calc(var(--max) + 2 * var(--gutter)); margin-inline: auto; width: 100%; }
.mrow.flip .m-media { order: 2; }
.m-media { position: relative; aspect-ratio: 16 / 10; overflow: hidden; }
.m-text h2 { font-size: var(--step-3); }
.m-figs { display: flex; gap: 2rem; margin: 1.5rem 0 2rem; flex-wrap: wrap; }
.m-figs dt { font: 500 .64rem var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--mute); }
.m-figs dd { margin: .3rem 0 0; font: 620 var(--step-1) var(--display); font-stretch: 110%; }
@media (max-width: 900px) { .mrow { grid-template-columns: 1fr; } .mrow.flip .m-media { order: 0; } }
</style>
