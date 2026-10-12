<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'
import { gsap, reducedMotion, stopScroll } from '../composables/useMotion.js'

const route = useRoute()
const links = [
  { to: '/', label: 'Vehicle' },
  { to: '/models', label: 'Models' },
  { to: '/technology', label: 'Technology' },
  { to: '/project', label: 'Project' }
]
const open = ref(false), hidden = ref(false), scrolled = ref(false)
const panel = ref(null), toggle = ref(null)
let lastY = 0

function onScroll() {
  const y = window.scrollY
  hidden.value = !open.value && y > 200 && y > lastY
  scrolled.value = y > 40
  lastY = y
}
async function setOpen(v) {
  open.value = v
  stopScroll(v)
  if (v && !reducedMotion) {
    requestAnimationFrame(() => {
      gsap.fromTo(panel.value, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' })
      gsap.from('.m-link', { yPercent: 100, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.3 })
    })
  }
  if (!v) toggle.value?.focus()
}
const onKey = (e) => { if (e.key === 'Escape' && open.value) setOpen(false) }
watch(() => route.fullPath, () => { if (open.value) setOpen(false) })
onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey) })
const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
  <header :class="['nav', { hidden, scrolled, open }]">
    <RouterLink to="/" class="mark" aria-label="VOLT home">VOLT</RouterLink>
    <nav class="links" aria-label="Main">
      <RouterLink v-for="l in links" :key="l.to" :to="l.to" :class="['link-line', { on: isActive(l.to) }]" :aria-current="isActive(l.to) ? 'page' : null">{{ l.label }}</RouterLink>
    </nav>
    <div class="right">
      <RouterLink to="/configure" class="btn small cfg">Configure<ArrowUpRight /></RouterLink>
      <button ref="toggle" class="menu-btn" :aria-expanded="open" aria-controls="menu" @click="setOpen(!open)">
        <component :is="open ? X : Menu" aria-hidden="true" /><span class="sr-only">{{ open ? 'Close menu' : 'Open menu' }}</span>
      </button>
    </div>
  </header>
  <div v-if="open" id="menu" ref="panel" class="m-panel grid-bg" role="dialog" aria-modal="true" aria-label="Menu">
    <nav aria-label="Mobile">
      <RouterLink v-for="(l, i) in [...links, { to: '/configure', label: 'Configure' }]" :key="l.to" :to="l.to" class="m-row"><span class="m-link"><i>0{{ i + 1 }}</i>{{ l.label }}</span></RouterLink>
    </nav>
    <p class="notice">Fictional brand · concept vehicles · illustrative figures</p>
  </div>
</template>

<style scoped>
.nav { position: fixed; inset: 0 0 auto; height: var(--header); z-index: 150; display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding-inline: var(--gutter); transition: transform .6s var(--ease), background-color .5s, border-color .5s; border-bottom: 1px solid transparent; }
.nav.scrolled { background: rgba(7, 8, 9, .72); backdrop-filter: blur(12px); border-color: var(--line); }
.nav.hidden { transform: translateY(-100%); }
.mark { font: 700 1.25rem/1 var(--display); font-stretch: 125%; letter-spacing: .32em; text-decoration: none; }
.links { display: flex; gap: 2.2rem; font: 500 .72rem var(--mono); letter-spacing: .16em; text-transform: uppercase; }
.links a { text-decoration: none; color: var(--soft); transition: color .3s; }
.links a:hover, .links a.on { color: var(--white); }
.links a.on::after { transform: scaleX(1); background: var(--lime); }
.right { display: flex; gap: .6rem; align-items: center; }
.menu-btn { display: none; width: 44px; height: 44px; border: 1px solid var(--line-strong); background: transparent; cursor: pointer; place-items: center; }
.menu-btn svg { width: 20px; }
.m-panel { position: fixed; inset: 0; z-index: 140; background-color: var(--graphite); padding: calc(var(--header) + 2rem) var(--gutter) 2rem; display: flex; flex-direction: column; justify-content: space-between; }
.m-row { display: block; overflow: hidden; text-decoration: none; border-bottom: 1px solid var(--line); }
.m-link { display: flex; align-items: baseline; gap: 1rem; font: 620 clamp(2rem, 9vw, 4rem)/1.15 var(--display); font-stretch: 125%; text-transform: uppercase; padding: .4rem 0; }
.m-link i { font: 500 .75rem var(--mono); color: var(--lime); font-style: normal; }
@media (max-width: 900px) { .links { display: none; } .menu-btn { display: grid; } .cfg { display: none; } }
</style>
