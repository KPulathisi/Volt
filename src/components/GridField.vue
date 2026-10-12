<script setup>
/**
 * Background canvas: a fine technical grid with a slow scan line and a few light pulses
 * travelling along the grid lines. Pauses off-screen; static under reduced motion.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { reducedMotion } from '../composables/useMotion.js'

const props = defineProps({ cell: { type: Number, default: 64 }, pulses: { type: Number, default: 7 } })
const cv = ref(null)
let ctx, w = 0, h = 0, dpr = 1, raf = 0, io, ro, visible = false, last = 0
let dots = []

function size() {
  const r = cv.value.getBoundingClientRect()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = r.width; h = r.height
  cv.value.width = w * dpr; cv.value.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  dots = Array.from({ length: props.pulses }, seed)
  draw(0)
}
function seed() {
  const horiz = Math.random() > 0.4, c = props.cell
  return { horiz, line: Math.floor(Math.random() * ((horiz ? h : w) / c)) * c, pos: Math.random() * (horiz ? w : h), speed: 40 + Math.random() * 90, len: 60 + Math.random() * 120 }
}
function draw(t) {
  ctx.clearRect(0, 0, w, h)
  const c = props.cell
  ctx.strokeStyle = 'rgba(242,243,241,0.055)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = (w / 2) % c; x < w; x += c) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h) }
  for (let y = 0; y < h; y += c) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5) }
  ctx.stroke()
  // crosshair ticks at intersections
  ctx.fillStyle = 'rgba(242,243,241,0.16)'
  for (let x = (w / 2) % c; x < w; x += c * 2) for (let y = 0; y < h; y += c * 2) ctx.fillRect(x - 2, y, 5, 1)
  if (reducedMotion) return
  // scan line
  const sy = ((t / 9000) % 1) * h
  const g = ctx.createLinearGradient(0, sy - 120, 0, sy)
  g.addColorStop(0, 'rgba(197,242,58,0)')
  g.addColorStop(1, 'rgba(197,242,58,0.05)')
  ctx.fillStyle = g
  ctx.fillRect(0, sy - 120, w, 120)
  // pulses
  for (const d of dots) {
    const lg = d.horiz ? ctx.createLinearGradient(d.pos - d.len, 0, d.pos, 0) : ctx.createLinearGradient(0, d.pos - d.len, 0, d.pos)
    lg.addColorStop(0, 'rgba(197,242,58,0)')
    lg.addColorStop(1, 'rgba(197,242,58,0.55)')
    ctx.strokeStyle = lg
    ctx.beginPath()
    if (d.horiz) { ctx.moveTo(d.pos - d.len, d.line + 0.5); ctx.lineTo(d.pos, d.line + 0.5) } else { const x = d.line + ((w / 2) % c); ctx.moveTo(x + 0.5, d.pos - d.len); ctx.lineTo(x + 0.5, d.pos) }
    ctx.stroke()
  }
}
function loop(t) {
  raf = requestAnimationFrame(loop)
  const dt = Math.min(0.05, (t - (last || t)) / 1000)
  last = t
  for (const d of dots) { d.pos += d.speed * dt; if (d.pos - d.len > (d.horiz ? w : h)) Object.assign(d, seed(), { pos: 0 }) }
  draw(t)
}
onMounted(() => {
  ctx = cv.value.getContext('2d')
  size()
  ro = new ResizeObserver(size); ro.observe(cv.value)
  if (reducedMotion) return
  io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible && !raf) { last = 0; raf = requestAnimationFrame(loop) } else if (!visible) { cancelAnimationFrame(raf); raf = 0 }
  })
  io.observe(cv.value)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); io?.disconnect(); ro?.disconnect() })
</script>

<template><canvas ref="cv" class="grid-field" aria-hidden="true"></canvas></template>

<style scoped>
.grid-field { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; -webkit-mask-image: radial-gradient(ellipse 70% 65% at 50% 55%, #000 35%, transparent 100%); mask-image: radial-gradient(ellipse 70% 65% at 50% 55%, #000 35%, transparent 100%); }
</style>
