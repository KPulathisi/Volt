<script setup>
import { Check } from 'lucide-vue-next'
import { money } from '../composables/useData.js'
defineProps({ colors: { type: Array, required: true }, modelValue: { type: String, required: true } })
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <fieldset class="cs">
    <legend class="sr-only">Exterior paint</legend>
    <label v-for="c in colors" :key="c.id" :class="['sw', { on: modelValue === c.id }]" :data-cursor="c.name">
      <input type="radio" name="paint" class="sr-only" :value="c.id" :checked="modelValue === c.id" @change="emit('update:modelValue', c.id)" />
      <span class="chip" :style="{ '--c': c.hex }" :class="c.finish.toLowerCase()"><Check v-if="modelValue === c.id" aria-hidden="true" /></span>
      <span class="sw-name">{{ c.name }}</span>
      <span class="sw-meta">{{ c.finish }} · {{ c.price ? money(c.price) : 'Included' }}</span>
    </label>
  </fieldset>
</template>

<style scoped>
.cs { border: 0; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; }
.sw { display: grid; justify-items: center; text-align: center; gap: .35rem; padding: .8rem .3rem .7rem; border: 1px solid var(--line); cursor: pointer; transition: border-color .3s, background-color .3s; }
.sw:hover { border-color: var(--line-strong); }
.sw.on { border-color: var(--lime); background: rgba(197, 242, 58, .05); }
.sw:focus-within { outline: 2px solid var(--lime); outline-offset: 2px; }
.chip { width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--c), #fff 45%), var(--c) 45%, color-mix(in srgb, var(--c), #000 45%)); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .15); display: grid; place-items: center; transition: transform .4s var(--ease); }
.chip.matte { background: var(--c); }
.sw:hover .chip { transform: scale(1.08); }
.chip svg { width: 18px; color: #fff; filter: drop-shadow(0 0 2px #000); }
.sw-name { font-size: .82rem; line-height: 1.2; }
.sw-meta { font: .64rem/1.3 var(--mono); color: var(--mute); letter-spacing: .04em; }
@media (max-width: 520px) { .cs { grid-template-columns: repeat(2, 1fr); } }
</style>
