<script setup>
import PageHero from '../components/PageHero.vue'
import MediaFrame from '../components/MediaFrame.vue'
import { useData } from '../composables/useData.js'
import { useHashScroll } from '../composables/useHashScroll.js'
useHashScroll()
const { site, media } = useData()
const real = ['Interaction patterns, accessibility and performance techniques', 'Electric-vehicle concepts such as 800-volt systems, charging curves and heat pumps, explained in general terms', 'Open-source libraries and fonts listed below']
const simulated = ['The VOLT brand, its three models and every specification', 'Prices, packages and options (illustrative only)', 'The 3D car, drawn in code rather than scanned or modelled from a real vehicle', 'Configurations and spec sheets: nothing is ordered, reserved or sent anywhere']
const libs = [
  ['Vue 3 + Vue Router', 'MIT', 'Interface and routing'],
  ['Vite', 'MIT', 'Build tool'],
  ['Three.js', 'MIT', 'Real-time 3D car, studio lighting (RoomEnvironment) and orbit controls'],
  ['GSAP 3 (ScrollTrigger, SplitText, Flip, DrawSVG)', 'GSAP standard licence, free', 'Scroll and interface animation'],
  ['Lenis', 'MIT', 'Smooth scrolling'],
  ['Lucide', 'ISC', 'Icons'],
  ['Archivo (variable, with width axis)', 'SIL Open Font License 1.1', 'Display and body type, self-hosted via Fontsource'],
  ['JetBrains Mono', 'SIL Open Font License 1.1', 'Technical labels, self-hosted via Fontsource']
]
</script>

<template>
  <div>
    <PageHero label="Project information" title="About this project." intro="VOLT is a portfolio piece: a static website that works without a server, database or API keys. It shows state management, real-time 3D, dynamic pricing, URL state and data-driven interface design." />
    <section class="section">
      <div class="wrap two">
        <div><span class="label">Disclaimer</span><p class="lede">{{ site.notice }}</p></div>
        <div class="about-media"><MediaFrame id="about-image" sizes="(min-width: 900px) 45vw, 100vw" /></div>
      </div>
    </section>

    <section class="section rs">
      <div class="wrap two">
        <div><span class="label">Real</span><ul class="list"><li v-for="r in real" :key="r">{{ r }}</li></ul></div>
        <div><span class="label">Simulated</span><ul class="list"><li v-for="s in simulated" :key="s">{{ s }}</li></ul></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <span class="label">How it works</span>
        <div class="how">
          <article><h3>Configuration state</h3><p>Choices live in one validated state object. Every selection is checked against the local JSON catalogue before the price is calculated, and model rules (such as wheels offered per model or standard packages) are enforced.</p></article>
          <article><h3>Shareable links</h3><p>The configurator writes the build into the address, for example <code>#/configure?model=one&amp;paint=lime&amp;wheels=turbine-21&amp;pkg=tech</code>. Unknown values fall back to defaults and are reported.</p></article>
          <article><h3>Saved on your device</h3><p>Saving stores the configuration in this browser's local storage. There is no account and nothing leaves your device.</p></article>
          <article><h3>3D without downloads</h3><p>The car is generated from cross-sections at runtime. Three.js loads only near the viewer, rendering pauses off-screen, and phones see a lightweight 2D drawing in the hero.</p></article>
        </div>
      </div>
    </section>

    <section id="assets" class="section">
      <div class="wrap">
        <span class="label">Asset inventory</span>
        <h2 class="h-sm">Images, video and licences</h2>
        <p class="muted">Every photo or video spot on the site is listed here. Until a file is added, the spot shows animated artwork drawn in code (original, no licence needed).</p>
        <div class="t-wrap" tabindex="0" role="region" aria-label="Asset inventory table">
          <table>
            <thead><tr><th scope="col">Slot</th><th scope="col">Used for</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Credit / licence</th></tr></thead>
            <tbody>
              <tr v-for="m in media" :key="m.id"><td class="mono">{{ m.id }}</td><td>{{ m.label }}</td><td class="mono">{{ m.kind }}</td><td>{{ m.file ? 'File added' : 'Animated placeholder' }}</td><td>{{ m.credit || (m.file ? 'Not recorded' : 'Original artwork (code)') }}</td></tr>
            </tbody>
          </table>
        </div>
        <table class="libs">
          <caption class="label">Libraries and fonts</caption>
          <thead><tr><th scope="col">Name</th><th scope="col">Licence</th><th scope="col">Used for</th></tr></thead>
          <tbody><tr v-for="l in libs" :key="l[0]"><td>{{ l[0] }}</td><td class="mono">{{ l[1] }}</td><td>{{ l[2] }}</td></tr></tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.two { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2rem, 6vw, 6rem); align-items: start; }
.rs { background: var(--graphite); }
.list { margin: 0; padding: 0; list-style: none; }
.list li { padding: .9rem 0; border-bottom: 1px solid var(--line); color: var(--soft); }
.how { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
.how h3 { font-size: 1rem; margin: 0 0 .6rem; }
.how p { color: var(--soft); font-size: .92rem; }
code { font: .78rem var(--mono); color: var(--lime); word-break: break-all; }
.h-sm { font-size: var(--step-3); }
.t-wrap { overflow-x: auto; margin: 2rem 0 4rem; }
table { width: 100%; border-collapse: collapse; min-width: 640px; }
th, td { text-align: left; padding: .7rem .8rem .7rem 0; border-bottom: 1px solid var(--line); font-size: .86rem; vertical-align: top; }
th { font: 500 .64rem var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--mute); }
td.mono { font-size: .76rem; color: var(--soft); }
.libs caption { text-align: left; }
@media (max-width: 960px) { .two { grid-template-columns: 1fr; } .how { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .how { grid-template-columns: 1fr; } }
</style>
