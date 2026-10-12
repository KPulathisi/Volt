<script setup>
/**
 * Pinned design story (desktop): five chapters swap as you scroll, each with its own image,
 * background tone and statistic. On phones and with reduced motion it becomes simple stacked sections.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MediaFrame from './MediaFrame.vue'
import { useData } from '../composables/useData.js'
import { gsap, reducedMotion } from '../composables/useMotion.js'

const { site } = useData()
const chapters = site.story
const root = ref(null)
const active = ref(0)
let mm

onMounted(() => {
  mm = gsap.matchMedia()
  mm.add({ desktop: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' }, (c) => {
    if (!c.conditions.desktop || c.conditions.reduce) return
    const q = gsap.utils.selector(root.value)
    const texts = q('.ds-text'), frames = q('.ds-frame'), n = chapters.length
    gsap.set(texts.slice(1), { autoAlpha: 0, y: 40 })
    gsap.set(frames.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' })
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: q('.ds-pin')[0], start: 'top top', end: () => `+=${window.innerHeight * (n - 0.3)}`, pin: true, scrub: 0.6,
        onUpdate: (st) => (active.value = Math.min(n - 1, Math.floor(st.progress * n * 0.999)))
      }
    })
    for (let i = 1; i < n; i++) {
      const at = i - 0.5
      tl.to(texts[i - 1], { autoAlpha: 0, y: -40, duration: 0.35 }, at)
        .to(frames[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 }, at)
        .fromTo(frames[i].querySelector('.mf-inner'), { scale: 1.25 }, { scale: 1, duration: 0.8 }, at)
        .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.35 }, at + 0.3)
        .to(q('.ds-pin')[0], { backgroundColor: chapters[i].tone, duration: 0.6 }, at)
    }
    tl.to({}, { duration: 0.5 }) // hold the last chapter
    return () => { active.value = 0 }
  })
})
onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="root" class="ds" aria-labelledby="ds-title">
    <h2 id="ds-title" class="sr-only">Design story</h2>
    <div class="ds-pin" :style="{ backgroundColor: chapters[0].tone }">
      <div class="ds-grid wrap">
        <div class="ds-texts">
          <article v-for="(c, i) in chapters" :key="c.id" class="ds-text">
            <span class="label">{{ c.kicker }}</span>
            <h3>{{ c.title }}</h3>
            <p class="lede">{{ c.text }}</p>
            <p class="ds-stat"><strong>{{ c.stat.value }}</strong><span>{{ c.stat.label }}</span></p>
            <div class="ds-mobile-media"><MediaFrame :id="c.media" sizes="100vw" /></div>
          </article>
        </div>
        <div class="ds-media" aria-hidden="true">
          <div v-for="(c, i) in chapters" :key="c.id" class="ds-frame" :style="{ zIndex: i }"><MediaFrame :id="c.media" fill sizes="45vw" /></div>
          <ol class="ds-ticks">
            <li v-for="(c, i) in chapters" :key="c.id" :class="{ on: i === active, done: i < active }"><span>0{{ i + 1 }}</span></li>
          </ol>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ds-pin { position: relative; transition: none; }
.ds-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2rem, 6vw, 7rem); align-items: center; min-height: 100vh; padding-block: calc(var(--header) + 2rem) 3rem; }
.ds-texts { position: relative; display: grid; }
.ds-text { grid-area: 1 / 1; align-self: center; }
.ds-text h3 { font-size: var(--step-4); line-height: .95; margin-bottom: 1.5rem; }
.ds-stat { display: flex; align-items: baseline; gap: 1rem; border-top: 1px solid var(--line); padding-top: 1.2rem; margin-top: 2rem; }
.ds-stat strong { font: 620 var(--step-3)/1 var(--display); font-stretch: 110%; color: var(--lime); }
.ds-stat span { font: 500 .7rem var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--mute); }
.ds-media { position: relative; height: min(78vh, 760px); }
.ds-frame { position: absolute; inset: 0; overflow: hidden; }
.ds-mobile-media { display: none; }
.ds-ticks { position: absolute; right: -2.2rem; top: 50%; transform: translateY(-50%); list-style: none; margin: 0; padding: 0; display: grid; gap: .9rem; z-index: 10; }
.ds-ticks li { font: 500 .62rem var(--mono); color: var(--mute); letter-spacing: .1em; position: relative; padding-left: 1rem; transition: color .4s; }
.ds-ticks li::before { content: ''; position: absolute; left: 0; top: 50%; width: 6px; height: 1px; background: currentColor; transition: width .4s var(--ease); }
.ds-ticks li.on { color: var(--lime); }
.ds-ticks li.on::before { width: 10px; }
@media (max-width: 1023px), (prefers-reduced-motion: reduce) {
  .ds-grid { grid-template-columns: 1fr; min-height: 0; padding-block: 5rem; }
  .ds-texts { display: grid; gap: 5rem; }
  .ds-text { grid-area: auto; }
  .ds-media { display: none; }
  .ds-mobile-media { display: block; margin-top: 1.5rem; }
}
</style>
