<script setup>
/**
 * Technical cursor for fine pointers: a small square plus a frame that grows over links and media.
 * Elements can set data-cursor="View" (etc.) to show a label inside the ring.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap, finePointer, reducedMotion } from '../composables/useMotion.js'

const enabled = finePointer && !reducedMotion
const ring = ref(null), dot = ref(null)
const label = ref('')
const state = ref('hidden') // stays hidden until the pointer first moves
let xTo, yTo, dx, dy

function move(e) {
  if (state.value === 'hidden') state.value = ''
  xTo(e.clientX); yTo(e.clientY); dx(e.clientX); dy(e.clientY)
}
function over(e) {
  const el = e.target.closest('[data-cursor], a, button, [role="tab"], input, select, textarea, label')
  if (!el) { state.value = ''; label.value = ''; return }
  const l = el.getAttribute?.('data-cursor')
  if (l) { state.value = 'label'; label.value = l }
  else if (el.matches('input, textarea, select')) { state.value = 'text'; label.value = '' }
  else { state.value = 'link'; label.value = '' }
}
function leave() { state.value = 'hidden' }
function enter() { state.value = '' }

onMounted(() => {
  if (!enabled) return
  document.documentElement.classList.add('has-cursor')
  xTo = gsap.quickTo(ring.value, 'x', { duration: 0.45, ease: 'power3' })
  yTo = gsap.quickTo(ring.value, 'y', { duration: 0.45, ease: 'power3' })
  dx = gsap.quickTo(dot.value, 'x', { duration: 0.08 })
  dy = gsap.quickTo(dot.value, 'y', { duration: 0.08 })
  window.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('pointerover', over)
  document.documentElement.addEventListener('pointerleave', leave)
  document.documentElement.addEventListener('pointerenter', enter)
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', move)
  document.removeEventListener('pointerover', over)
  document.documentElement.removeEventListener('pointerleave', leave)
  document.documentElement.removeEventListener('pointerenter', enter)
  document.documentElement.classList.remove('has-cursor')
})
</script>

<template>
  <template v-if="enabled">
    <div ref="ring" :class="['cursor', 'ring', state]" aria-hidden="true"><span>{{ label }}</span></div>
    <div ref="dot" :class="['cursor', 'dot', state]" aria-hidden="true"></div>
  </template>
</template>

<style scoped>
.cursor { position: fixed; left: 0; top: 0; pointer-events: none; z-index: 500; mix-blend-mode: normal; }
.ring { width: 38px; height: 38px; margin: -19px 0 0 -19px; border: 1px solid rgba(242, 243, 241, .45); border-radius: 0; display: grid; place-items: center; transition: width .45s var(--ease), height .45s var(--ease), margin .45s var(--ease), background-color .45s, border-color .45s, opacity .3s; }
.ring span { font: 500 .62rem/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--black); opacity: 0; transition: opacity .3s; }
.dot { width: 5px; height: 5px; margin: -2.5px 0 0 -2.5px; border-radius: 0; background: var(--lime); transition: opacity .3s, transform .3s; }
.ring.link { width: 58px; height: 58px; margin: -29px 0 0 -29px; border-color: var(--lime); background: rgba(197, 242, 58, .06); }
.ring.label { width: 92px; height: 92px; margin: -46px 0 0 -46px; background: var(--lime); border-color: transparent; }
.ring.label span { opacity: 1; }
.dot.label, .dot.link { opacity: 0; }
.ring.text { width: 4px; height: 30px; margin: -15px 0 0 -2px; border-radius: 2px; border-color: transparent; background: var(--lime); }
.dot.text { opacity: 0; }
.hidden { opacity: 0; }
</style>

<style>
@media (hover: hover) and (pointer: fine) { html.has-cursor, html.has-cursor * { cursor: none !important; } }
</style>
