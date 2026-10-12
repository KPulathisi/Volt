<script setup>
/**
 * Interactive 3D view of the configured car. Three.js loads only when the viewer comes near
 * the screen, rendering pauses off-screen, and browsers without WebGL get a 2D drawing instead.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { Move3d } from 'lucide-vue-next'
import CarSVG from './CarSVG.vue'

const props = defineProps({
  parts: { type: Object, required: true },
  interactive: { type: Boolean, default: true },
  autoRotate: { type: Boolean, default: false },
  view: { type: String, default: 'front34' },
  views: { type: Boolean, default: false },
  hotspots: { type: Array, default: () => [] },
  eager: Boolean,
  label: { type: String, default: '' }
})
const emit = defineEmits(['ready'])

const root = ref(null), canvas = ref(null)
const stage = shallowRef(null)
const supported = ref(true)
const loaded = ref(false)
const hinted = ref(false)
const activeView = ref(props.view)
const openSpot = ref('')
const spotEls = {}
let io, visible = false

const svgProps = computed(() => ({
  model: props.parts.vehicle.id, paint: props.parts.paint.hex, wheel: props.parts.wheel.style, size: props.parts.wheel.size,
  performance: props.parts.packages.some((p) => p.id === 'performance')
}))
const describe = computed(() => props.label || `${props.parts.vehicle.name} in ${props.parts.paint.name} with ${props.parts.wheel.name} wheels and ${props.parts.interior.name} interior. ${props.interactive ? 'Drag to rotate.' : ''}`)

// Hotspot markers follow their 3D anchor every rendered frame
function placeSpots(s) {
  if (!props.hotspots.length || !s.built) return
  for (const h of props.hotspots) {
    const el = spotEls[h.id]
    const a = s.built.anchors[h.id]
    if (!el || !a) continue
    const p = s.project(a)
    el.style.transform = `translate(${p.x}px, ${p.y}px)`
    el.style.opacity = p.visible ? '' : '0'
  }
}

async function init() {
  if (stage.value || !supported.value) return
  const { CarStage, webglAvailable } = await import('../three/CarStage.js')
  if (!webglAvailable()) { supported.value = false; return }
  try {
    const s = new CarStage(canvas.value, { interactive: props.interactive, autoRotate: props.autoRotate, view: props.view, onRender: placeSpots })
    s.setVehicle(props.parts.vehicle, props.parts, { animate: false })
    s.renderOnce()
    stage.value = s
    loaded.value = true
    if (visible) s.start()
    s.controls.addEventListener('start', () => (hinted.value = true))
    emit('ready', s)
  } catch (e) {
    console.warn('3D viewer unavailable, showing the 2D drawing instead', e)
    supported.value = false
  }
}

watch(() => props.parts, (p) => stage.value?.setVehicle(p.vehicle, p, { animate: true }), { deep: true })

function setView(v) {
  activeView.value = v
  stage.value?.setView(v)
}

onMounted(() => {
  io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) { init(); stage.value?.start() } else stage.value?.stop()
  }, { rootMargin: props.eager ? '600px' : '250px' })
  io.observe(root.value)
  document.addEventListener('visibilitychange', onVis)
})
const onVis = () => (document.hidden ? stage.value?.stop() : visible && stage.value?.start())
onBeforeUnmount(() => {
  io?.disconnect()
  document.removeEventListener('visibilitychange', onVis)
  stage.value?.dispose()
})

defineExpose({ stage, snapshot: () => stage.value?.snapshot() })
</script>

<template>
  <div ref="root" :class="['viewer', { loaded, interactive, fallback: !supported }]" role="img" :aria-label="describe">
    <div class="poster" aria-hidden="true"><CarSVG v-bind="svgProps" /></div>
    <canvas v-show="supported" ref="canvas" class="gl" :data-cursor="interactive ? 'Drag' : null"></canvas>

    <div v-if="hotspots.length && loaded" class="spots">
      <div v-for="h in hotspots" :key="h.id" :ref="(el) => (spotEls[h.id] = el)" class="spot">
        <button :class="['spot-btn', { on: openSpot === h.id }]" :aria-expanded="openSpot === h.id" :aria-label="h.label" @click="openSpot = openSpot === h.id ? '' : h.id" @mouseenter="openSpot = h.id" @mouseleave="openSpot = ''" @focus="openSpot = h.id" @blur="openSpot = ''"><span></span></button>
        <div v-show="openSpot === h.id" class="spot-card" role="note"><strong>{{ h.label }}</strong><p>{{ h.text }}</p></div>
      </div>
    </div>

    <div v-if="views && loaded" class="views no-print" role="group" aria-label="Camera view">
      <button v-for="v in [['front34', 'Front'], ['side', 'Side'], ['rear34', 'Rear'], ['top', 'Top'], ['wheel', 'Wheel']]" :key="v[0]" :aria-pressed="activeView === v[0]" @click="setView(v[0])">{{ v[1] }}</button>
    </div>
    <p v-if="interactive && loaded && !hinted" class="hint no-print" aria-hidden="true"><Move3d />Drag to rotate · scroll the page as normal</p>
    <p v-if="!supported" class="fb-note">3D view unavailable on this device, showing a drawing instead.</p>
  </div>
</template>

<style scoped>
.viewer { position: relative; width: 100%; height: 100%; min-height: 260px; }
.poster { position: absolute; left: 8%; right: 8%; top: 50%; transform: translateY(-40%); transition: opacity .8s var(--ease); }
.loaded .poster { opacity: 0; pointer-events: none; }
.fallback .poster { opacity: 1; }
.gl { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 1s var(--ease); touch-action: pan-y; }
.loaded .gl { opacity: 1; }
.interactive .gl { cursor: grab; }
.interactive .gl:active { cursor: grabbing; }
.spots { position: absolute; inset: 0; pointer-events: none; }
.spot { position: absolute; left: 0; top: 0; pointer-events: auto; transition: opacity .3s; }
.spot-btn { position: absolute; left: -16px; top: -16px; width: 32px; height: 32px; border: 1px solid var(--lime); background: rgba(7, 8, 9, .55); cursor: pointer; display: grid; place-items: center; padding: 0; }
.spot-btn span { width: 8px; height: 8px; background: var(--lime); transition: transform .4s var(--ease); }
.spot-btn::after { content: ''; position: absolute; inset: -1px; border: 1px solid var(--lime); animation: ping 2.4s var(--ease) infinite; }
.spot-btn.on span { transform: rotate(45deg) scale(1.3); }
@keyframes ping { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(1.9); opacity: 0; } }
.spot-card { position: absolute; left: 26px; top: -10px; width: 240px; background: rgba(7, 8, 9, .9); border: 1px solid var(--line-strong); padding: .9rem 1rem; backdrop-filter: blur(6px); }
.spot-card strong { display: block; font: 600 .8rem var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--lime); margin-bottom: .35rem; }
.spot-card p { margin: 0; font-size: .86rem; line-height: 1.5; color: var(--soft); }
.views { position: absolute; left: 50%; bottom: 1rem; transform: translateX(-50%); display: flex; border: 1px solid var(--line-strong); background: rgba(7, 8, 9, .6); backdrop-filter: blur(6px); }
.views button { background: none; border: 0; padding: .6rem .9rem; font: 500 .66rem var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--mute); cursor: pointer; }
.views button + button { border-left: 1px solid var(--line); }
.views button[aria-pressed='true'] { color: var(--black); background: var(--lime); }
.views button:hover:not([aria-pressed='true']) { color: var(--white); }
.hint { position: absolute; left: 50%; bottom: 3.9rem; transform: translateX(-50%); margin: 0; display: inline-flex; gap: .5rem; align-items: center; font: 500 .66rem var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--mute); white-space: nowrap; pointer-events: none; }
.hint svg { width: 14px; }
.fb-note { position: absolute; left: 1rem; bottom: .6rem; margin: 0; font: .7rem var(--mono); color: var(--mute); }
@media (max-width: 700px) { .spot-card { width: 190px; } .views button { padding: .55rem .6rem; } }
</style>
