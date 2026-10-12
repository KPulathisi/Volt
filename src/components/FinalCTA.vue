<script setup>
import { ArrowRight } from 'lucide-vue-next'
import MediaFrame from './MediaFrame.vue'
import { useData } from '../composables/useData.js'
const { site } = useData()
</script>

<template>
  <section class="cta" aria-labelledby="cta-title">
    <div v-parallax="0.16" class="cta-media"><MediaFrame :id="site.cta.media" fill sizes="100vw" /></div>
    <div class="wrap cta-in">
      <span class="label">VOLT ONE</span>
      <h2 id="cta-title"><span v-for="l in site.cta.lines" :key="l" v-split class="cl">{{ l }}</span></h2>
      <div class="cta-links">
        <RouterLink to="/configure" class="btn solid">Explore the vehicle<ArrowRight /></RouterLink>
        <RouterLink to="/technology#specs" class="btn">Review specifications</RouterLink>
        <RouterLink to="/project" class="btn">Project information</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta { position: relative; min-height: 92vh; display: flex; align-items: flex-end; overflow: hidden; }
.cta-media { position: absolute; inset: 0; overflow: hidden; }
.cta-media::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(7, 8, 9, .85), rgba(7, 8, 9, .2) 65%), linear-gradient(0deg, var(--black), transparent 45%); }
.cta-in { position: relative; padding-block: clamp(4rem, 10vw, 8rem); }
.cta h2 { font-size: clamp(2.4rem, 0.6rem + 5.2vw, 7.4rem); }
.cl { display: block; }
.cta-links { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1rem; }
</style>
