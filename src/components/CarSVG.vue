<script setup>
/**
 * Side-profile drawing of a VOLT model, generated from the same shape data as the 3D car.
 * Used as the no-WebGL fallback, in comparisons and inside placeholder artwork.
 */
import { computed } from 'vue'
import { makeProfile, sideOutline, glassOutline } from '../three/carProfile.js'
import { lookup } from '../composables/useData.js'

const props = defineProps({
  model: { type: String, default: 'one' },
  paint: { type: String, default: '#4a4e54' },
  wheel: { type: String, default: 'aero' },
  size: { type: Number, default: 20 },
  performance: Boolean,
  lights: { type: Boolean, default: true },
  floor: { type: Boolean, default: true },
  label: { type: String, default: '' },
  pad: { type: Number, default: 0 } // extra room below the car (for dimension lines)
})
const S = 100
const uid = `c${Math.random().toString(36).slice(2, 8)}`
const v = computed(() => lookup.vehicles[props.model] || lookup.vehicles.one)
const p = computed(() => makeProfile(v.value.shape, { wheelSize: props.size, lowered: props.performance ? 0.015 : 0 }))
const body = computed(() => sideOutline(p.value, S))
const glass = computed(() => glassOutline(p.value, S))
const vb = computed(() => `-20 ${-(p.value.H * S + 18)} ${p.value.L * S + 40} ${p.value.H * S + 34 + props.pad}`)
const wheels = computed(() => p.value.wheelX.map((x) => ({ x: x * S, y: -p.value.r * S, r: p.value.r * S })))
const front = computed(() => ({ x: 2, y: -(p.value.belt(0.01) - 0.055) * S }))
const rear = computed(() => ({ x: p.value.L * S - 3, y: -(p.value.belt(0.99) - 0.05) * S }))
const spokes = computed(() => (props.wheel === 'turbine' ? 10 : props.wheel === 'blade' ? 10 : 5))
</script>

<template>
  <svg :viewBox="vb" class="car-svg" role="img" :aria-label="label || `${v.name} side view`" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient :id="`${uid}b`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="paint" stop-opacity="1" />
        <stop offset=".55" :stop-color="paint" />
        <stop offset="1" stop-color="#000" stop-opacity=".55" />
      </linearGradient>
      <linearGradient :id="`${uid}s`" x1="0" x2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0" />
        <stop offset=".5" stop-color="#fff" stop-opacity=".35" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <radialGradient :id="`${uid}f`"><stop offset="0" stop-color="#000" stop-opacity=".85" /><stop offset="1" stop-color="#000" stop-opacity="0" /></radialGradient>
    </defs>
    <ellipse v-if="floor" :cx="p.L * S / 2" cy="2" :rx="p.L * S * 0.62" ry="9" :fill="`url(#${uid}f)`" />
    <path :d="body" :fill="`url(#${uid}b)`" />
    <path :d="body" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width=".8" />
    <path :d="glass" fill="#050607" />
    <path :d="glass" :fill="`url(#${uid}s)`" opacity=".35" />
    <!-- shoulder highlight -->
    <path :d="`M${p.L * S * 0.08},${-p.belt(0.08) * S + 6} C${p.L * S * 0.4},${-p.belt(0.4) * S + 5} ${p.L * S * 0.7},${-p.belt(0.7) * S + 5} ${p.L * S * 0.95},${-p.belt(0.95) * S + 7}`" stroke="#fff" stroke-opacity=".28" stroke-width="1.2" fill="none" />
    <g v-for="(w, i) in wheels" :key="i">
      <circle :cx="w.x" :cy="w.y" :r="w.r + 4" fill="#050607" />
      <circle :cx="w.x" :cy="w.y" :r="w.r" fill="#121315" />
      <circle :cx="w.x" :cy="w.y" :r="w.r * 0.74" :fill="wheel === 'aero' ? '#9aa0a6' : wheel === 'turbine' ? '#3a3d42' : '#16171a'" />
      <g v-if="wheel !== 'aero'" :stroke="wheel === 'turbine' ? '#5c6067' : '#2b2d31'" stroke-width="3">
        <line v-for="k in spokes" :key="k" :x1="w.x" :y1="w.y" :x2="w.x + Math.cos((k / spokes) * 6.283) * w.r * 0.7" :y2="w.y + Math.sin((k / spokes) * 6.283) * w.r * 0.7" />
      </g>
      <g v-else fill="#3a3d42"><rect v-for="k in 5" :key="k" :x="w.x - 7" :y="w.y - w.r * 0.55" width="14" height="4" rx="2" :transform="`rotate(${k * 72 + 20} ${w.x} ${w.y})`" /></g>
      <circle v-if="performance" :cx="w.x - w.r * 0.42" :cy="w.y - w.r * 0.1" r="6" fill="#c5f23a" />
      <circle :cx="w.x" :cy="w.y" r="5" fill="#0c0d0f" />
    </g>
    <template v-if="lights">
      <rect :x="front.x - 2" :y="front.y - 1.2" width="9" height="2.4" fill="#fff" />
      <rect :x="rear.x - 7" :y="rear.y - 1.2" width="9" height="2.4" fill="#ff3030" />
    </template>
    <slot :p="p" :s="S" />
    <g v-if="performance" fill="#101113"><rect :x="p.L * S * 0.94" :y="-(p.belt(0.95) + 0.08) * S" :width="22" height="3" /><rect :x="p.L * S * 0.95" :y="-(p.belt(0.95) + 0.07) * S" width="3" height="8" /></g>
  </svg>
</template>

<style scoped>
.car-svg { width: 100%; height: auto; display: block; overflow: visible; }
</style>
