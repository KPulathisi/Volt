<script setup>
import { money } from '../composables/useData.js'
defineProps({ wheels: { type: Array, required: true }, allowed: { type: Array, required: true }, modelValue: { type: String, required: true } })
const emit = defineEmits(['update:modelValue'])
const spokes = (s) => (s === 'aero' ? 0 : s === 'turbine' ? 10 : 10)
</script>

<template>
  <fieldset class="ws">
    <legend class="sr-only">Wheels</legend>
    <label v-for="w in wheels" :key="w.id" :class="['wc', { on: modelValue === w.id, off: !allowed.includes(w.id) }]">
      <input type="radio" name="wheels" class="sr-only" :value="w.id" :checked="modelValue === w.id" :disabled="!allowed.includes(w.id)" @change="emit('update:modelValue', w.id)" />
      <svg viewBox="-50 -50 100 100" class="wsvg" aria-hidden="true">
        <circle r="48" fill="#111214" />
        <circle r="35" :fill="w.hex" />
        <g v-if="w.style === 'aero'" fill="#2a2c30"><rect v-for="k in 5" :key="k" x="-8" y="-27" width="16" height="4" rx="2" :transform="`rotate(${k * 72 + 20})`" /></g>
        <g v-else :stroke="w.style === 'turbine' ? '#6a6e75' : '#33363b'" stroke-width="3"><line v-for="k in spokes(w.style)" :key="k" x1="0" y1="0" :x2="Math.cos(k / spokes(w.style) * 6.283 + (w.style === 'blade' && k % 2 ? .14 : 0)) * 33" :y2="Math.sin(k / spokes(w.style) * 6.283 + (w.style === 'blade' && k % 2 ? .14 : 0)) * 33" /></g>
        <circle r="6" fill="#0c0d0f" />
      </svg>
      <span class="wc-text">
        <span class="wc-name">{{ w.name }} <span v-if="modelValue === w.id" class="sel">Selected</span></span>
        <span class="wc-meta">{{ w.finish }}</span>
        <span class="wc-meta">{{ w.price ? money(w.price) : 'Included' }} · {{ w.rangeDelta ? `${w.rangeDelta} km range` : 'best range' }}</span>
        <span v-if="!allowed.includes(w.id)" class="wc-meta warn">Not offered on this model</span>
      </span>
    </label>
  </fieldset>
</template>

<style scoped>
.ws { border: 0; padding: 0; margin: 0; display: grid; gap: .5rem; }
.wc { display: grid; grid-template-columns: 64px 1fr; gap: 1rem; align-items: center; padding: .7rem .9rem; border: 1px solid var(--line); cursor: pointer; transition: border-color .3s, background-color .3s; }
.wc:hover { border-color: var(--line-strong); }
.wc.on { border-color: var(--lime); background: rgba(197, 242, 58, .05); }
.wc.off { opacity: .4; cursor: not-allowed; }
.wc:focus-within { outline: 2px solid var(--lime); outline-offset: 2px; }
.wsvg { width: 64px; height: 64px; transition: transform .8s var(--ease); }
.wc:hover:not(.off) .wsvg { transform: rotate(72deg); }
.wc-text { display: grid; gap: .1rem; }
.wc-name { font-weight: 600; }
.sel { font: 500 .6rem var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--black); background: var(--lime); padding: .15rem .35rem; margin-left: .4rem; vertical-align: middle; }
.wc-meta { font: .7rem/1.4 var(--mono); color: var(--mute); }
.warn { color: #ff8f6b; }
</style>
