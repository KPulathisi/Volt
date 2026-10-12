<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SiteNavigation from './components/SiteNavigation.vue'
import SiteFooter from './components/SiteFooter.vue'
import CustomCursor from './components/CustomCursor.vue'
import ScrollProgress from './components/ScrollProgress.vue'
import { gsap, ScrollTrigger, startSmoothScroll, scrollToTarget, reducedMotion } from './composables/useMotion.js'

const route = useRoute()
const curtain = ref(null)
const main = ref(null)
onMounted(() => startSmoothScroll())

// Page transition: a graphite panel with a lime scan line sweeps across
let firstPage = true
function onLeave(el, done) {
  firstPage = false
  // done() must not run synchronously inside the leave hook, or Vue can't mount the next page
  if (reducedMotion || !curtain.value) return requestAnimationFrame(done)
  gsap.timeline({ onComplete: done })
    .set(curtain.value, { xPercent: -100, display: 'block' })
    .to(curtain.value, { xPercent: 0, duration: 0.6, ease: 'expo.inOut' })
    .to(el, { opacity: 0.4, x: 40, duration: 0.6, ease: 'expo.inOut' }, 0)
}
function onEnter(el, done) {
  if (firstPage) { firstPage = false; return done() }
  scrollToTarget(0, { immediate: true })
  window.scrollTo(0, 0)
  if (reducedMotion || !curtain.value) { requestAnimationFrame(() => { ScrollTrigger.refresh(); done() }); return }
  gsap.timeline({ onComplete: () => {
    gsap.set(curtain.value, { display: 'none' })
    gsap.set(el, { clearProps: 'transform,opacity' }) // transforms on the page would break pinned sections
    ScrollTrigger.refresh()
    done()
  } })
    .from(el, { x: -40, duration: 0.8, ease: 'expo.out' }, 0.1)
    .to(curtain.value, { xPercent: 100, duration: 0.75, ease: 'expo.inOut' }, 0)
}
</script>

<template>
  <RouterView v-if="route.meta.admin" />
  <template v-else>
    <a class="skip" href="#main" @click.prevent="main?.focus()">Skip to content</a>
    <ScrollProgress />
    <SiteNavigation />
    <main id="main" ref="main" tabindex="-1">
      <RouterView v-slot="{ Component, route: r }">
        <Transition mode="out-in" :css="false" @leave="onLeave" @enter="onEnter">
          <component :is="Component" :key="r.path" />
        </Transition>
      </RouterView>
    </main>
    <SiteFooter />
    <div ref="curtain" class="curtain no-print" aria-hidden="true"><i></i><span>VOLT</span></div>
    <CustomCursor />
  </template>
</template>

<style>
main:focus { outline: none; }
.curtain { position: fixed; inset: 0; z-index: 200; background: var(--graphite); display: none; pointer-events: none; }
.curtain i { position: absolute; top: 0; bottom: 0; right: 0; width: 2px; background: var(--lime); }
.curtain span { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font: 700 1.2rem var(--display); font-stretch: 125%; letter-spacing: .5em; color: var(--white); }
</style>
