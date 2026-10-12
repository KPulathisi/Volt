<script setup>
import { useData } from '../composables/useData.js'
const { site } = useData()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="foot">
    <div class="wrap top">
      <div>
        <p class="big">VOLT</p>
        <p class="notice">{{ site.notice }}</p>
      </div>
      <nav aria-label="Footer" class="cols">
        <div><span class="label">Explore</span><RouterLink to="/">Vehicle</RouterLink><RouterLink to="/models">Models</RouterLink><RouterLink to="/technology">Technology</RouterLink></div>
        <div><span class="label">Build</span><RouterLink to="/configure">Configure</RouterLink><RouterLink to="/models#compare">Compare models</RouterLink><RouterLink to="/technology#specs">Specifications</RouterLink></div>
        <div><span class="label">About</span><RouterLink to="/project">Project information</RouterLink><RouterLink to="/project#assets">Asset inventory</RouterLink></div>
      </nav>
    </div>
    <div class="wrap bottom notice"><span>© {{ year }} VOLT concept · a design portfolio project</span><span>No real vehicles, orders or prices</span></div>
  </footer>
</template>

<style scoped>
.foot { border-top: 1px solid var(--line); padding: clamp(3rem, 6vw, 5rem) 0 1.5rem; background: var(--black); }
.top { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; }
.big { font: 700 clamp(4rem, 14vw, 12rem)/.8 var(--display); font-stretch: 125%; letter-spacing: -.02em; margin: 0 0 1.5rem; color: transparent; -webkit-text-stroke: 1px var(--line-strong); }
.top .notice { max-width: 52ch; }
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.cols div { display: grid; gap: .55rem; align-content: start; }
.cols a { color: var(--soft); text-decoration: none; font-size: .92rem; }
.cols a:hover { color: var(--lime); }
.bottom { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 3rem; padding-top: 1.2rem; border-top: 1px solid var(--line); }
@media (max-width: 860px) { .top { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .cols { grid-template-columns: 1fr 1fr; } }
</style>
