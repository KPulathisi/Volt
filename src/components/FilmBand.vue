<script setup>
/** Full-width film band: the frame opens up as you scroll in, with a drifting specification ticker. */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MediaFrame from './MediaFrame.vue'
import { gsap, reducedMotion } from '../composables/useMotion.js'

const root = ref(null)
const ticker = ['Dual motor AWD', '610 km estimated range', '800-volt architecture', '0–100 km/h in 3.9 s', '270 kW peak charging', 'Cd 0.21 target', 'Full glass roof', '480-LED light signature']
let ctx
onMounted(() => {
  if (reducedMotion) return
  ctx = gsap.context(() => {
    gsap.fromTo('.fb-frame', { clipPath: 'inset(14% 16% 14% 16%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: root.value, start: 'top 85%', end: 'center center', scrub: true } })
    gsap.fromTo('.fb-frame .mf-inner', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: true } })
    gsap.fromTo('.fb-track', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: true } })
    gsap.from('.fb-title span', { yPercent: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.fb-title', start: 'top 80%', once: true } })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="fb" aria-label="In motion">
    <div class="fb-frame"><MediaFrame id="film-video" poster="film-poster" fill sizes="100vw" /></div>
    <div class="fb-over">
      <p class="fb-title"><span>Silence,</span> <span>at speed.</span></p>
    </div>
    <div class="fb-ticker" aria-hidden="true"><div class="fb-track"><span v-for="n in 3" :key="n"><template v-for="t in ticker" :key="t">{{ t }}<i></i></template></span></div></div>
  </section>
</template>

<style scoped>
.fb { position: relative; height: clamp(420px, 56.25vw, 92vh); overflow: hidden; background: var(--black); }
.fb-frame { position: absolute; inset: 0; overflow: hidden; }
.fb-frame::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 8, 9, .35), transparent 40%, rgba(7, 8, 9, .75)); pointer-events: none; }
.fb-over { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
.fb-title { margin: 0; font: 620 var(--step-5)/.9 var(--display); font-stretch: 125%; text-transform: uppercase; letter-spacing: -.03em; text-align: center; max-width: none; }
.fb-title span { display: inline-block; }
.fb-ticker { position: absolute; left: 0; right: 0; bottom: 0; border-top: 1px solid var(--line-strong); background: rgba(7, 8, 9, .6); backdrop-filter: blur(6px); overflow: hidden; white-space: nowrap; }
.fb-track { display: inline-flex; padding: .9rem 0; font: 500 .72rem var(--mono); letter-spacing: .16em; text-transform: uppercase; color: var(--soft); }
.fb-track i { display: inline-block; width: 6px; height: 6px; background: var(--lime); margin: 0 1.6rem; vertical-align: middle; }
</style>
