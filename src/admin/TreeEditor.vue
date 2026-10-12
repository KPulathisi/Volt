<script setup>
/**
 * Generic form for any JSON value. Renders text, numbers, lists and nested groups,
 * and swaps in a media-slot picker for fields that point at media.json.
 * Edits the object in place and emits `change`.
 */
import { computed } from 'vue'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { slotOptions } from './store.js'

const props = defineProps({
  model: { type: [Object, Array], required: true },
  depth: { type: Number, default: 0 },
  parentKey: { type: String, default: '' }
})
const emit = defineEmits(['change'])

const MEDIA_KEYS = ['media', 'poster']
const COLOR_KEYS = ['hex', 'accent', 'tone']
const LONG_KEYS = ['text', 'description', 'summary', 'note', 'notice', 'prompt']
const CHOICES = { style: ['aero', 'turbine', 'blade'], finish: null }
const HIDDEN = ['shape', 'curve', 'modules'] // 3D geometry and diagram data: edit in the JSON files if ever needed

const human = (k) => String(k).replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
const isMedia = (k, parent) => MEDIA_KEYS.includes(k) || parent === 'gallery'
const isObj = (v) => v && typeof v === 'object'
const entries = computed(() => (Array.isArray(props.model) ? props.model.map((v, i) => [i, v]) : Object.entries(props.model).filter(([k]) => !HIDDEN.includes(k))))
const kindOf = (k, v) => {
  if (isObj(v)) return Array.isArray(v) ? 'list' : 'group'
  if (k === 'id') return 'id'
  if (typeof v === 'number') return 'number'
  if (typeof v === 'boolean') return 'bool'
  if (isMedia(k, Array.isArray(props.model) ? props.parentKey : '')) return 'media'
  if (COLOR_KEYS.includes(k) && /^#[0-9a-f]{6}$/i.test(v)) return 'color'
  if (CHOICES[k]) return 'choice'
  if (LONG_KEYS.includes(k) || String(v).length > 90) return 'long'
  return 'text'
}

function set(k, v) { props.model[k] = v; emit('change') }

// lists
function blankLike(v) {
  if (Array.isArray(v)) return []
  if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'id' ? `new-${Date.now().toString(36)}` : blankLike(x)]))
  return typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : ''
}
function add(list) { list.push(list.length ? blankLike(list.at(-1)) : ''); emit('change') }
function remove(list, i) { if (isObj(list[i]) && !confirm('Remove this item?')) return; list.splice(i, 1); emit('change') }
function move(list, i, d) { const j = i + d; if (j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; emit('change') }
const itemTitle = (v, i) => (isObj(v) ? v.title || v.name || v.label || v.quote?.slice(0, 50) || v.id || `Item ${i + 1}` : '')
</script>

<template>
  <div :class="['tree', `d${depth}`]">
    <template v-for="[k, v] in entries" :key="k">
      <!-- Nested group -->
      <fieldset v-if="kindOf(k, v) === 'group'" class="group">
        <legend>{{ Array.isArray(model) ? itemTitle(v, k) : human(k) }}</legend>
        <TreeEditor :model="v" :depth="depth + 1" :parent-key="String(k)" @change="emit('change')" />
      </fieldset>

      <!-- List -->
      <div v-else-if="kindOf(k, v) === 'list'" class="list">
        <p class="lbl">{{ human(k) }} <span class="count">{{ v.length }}</span></p>
        <div v-for="(item, i) in v" :key="i" :class="['li', { obj: isObj(item) }]">
          <details v-if="isObj(item)" class="card" :open="v.length < 4">
            <summary>{{ itemTitle(item, i) }}</summary>
            <TreeEditor :model="item" :depth="depth + 1" :parent-key="String(k)" @change="emit('change')" />
          </details>
          <template v-else>
            <select v-if="isMedia('', String(k))" :value="item" @change="v[i] = $event.target.value; emit('change')">
              <option v-for="o in slotOptions('image')" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
            <input v-else-if="typeof item === 'number'" type="number" :value="item" @input="v[i] = +$event.target.value; emit('change')" />
            <input v-else type="text" :value="item" @input="v[i] = $event.target.value; emit('change')" />
          </template>
          <div class="tools">
            <button type="button" title="Move up" :disabled="i === 0" @click="move(v, i, -1)"><ArrowUp /></button>
            <button type="button" title="Move down" :disabled="i === v.length - 1" @click="move(v, i, 1)"><ArrowDown /></button>
            <button type="button" title="Remove" class="del" @click="remove(v, i)"><Trash2 /></button>
          </div>
        </div>
        <button type="button" class="add" @click="add(v)"><Plus /> Add</button>
      </div>

      <!-- Scalars -->
      <label v-else :class="['f', kindOf(k, v)]">
        <span class="lbl">{{ human(k) }}</span>
        <code v-if="kindOf(k, v) === 'id'">{{ v }}</code>
        <input v-else-if="kindOf(k, v) === 'number'" type="number" :value="v" @input="set(k, +$event.target.value)" />
        <input v-else-if="kindOf(k, v) === 'bool'" type="checkbox" :checked="v" @change="set(k, $event.target.checked)" />
        <span v-else-if="kindOf(k, v) === 'color'" class="color"><input type="color" :value="v" @input="set(k, $event.target.value)" /><code>{{ v }}</code></span>
        <select v-else-if="kindOf(k, v) === 'choice'" :value="v" @change="set(k, $event.target.value)"><option v-for="c in CHOICES[k]" :key="c">{{ c }}</option></select>
        <select v-else-if="kindOf(k, v) === 'media'" :value="v" @change="set(k, $event.target.value)">
          <option v-for="o in slotOptions()" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <textarea v-else-if="kindOf(k, v) === 'long'" :rows="String(v).length > 260 ? 6 : 3" :value="v" @input="set(k, $event.target.value)"></textarea>
        <input v-else type="text" :value="v" @input="set(k, $event.target.value)" />
      </label>
    </template>
  </div>
</template>

<style scoped>
.tree { display: grid; gap: .9rem; }
.f { display: grid; gap: .3rem; }
.f.bool { grid-template-columns: auto 1fr; align-items: center; }
.lbl { font-size: .78rem; font-weight: 600; color: var(--ink-soft); margin: 0; letter-spacing: .02em; }
.count { font-weight: 400; opacity: .6; margin-left: .3rem; }
input[type='text'], input[type='number'], textarea, select { font: inherit; font-size: .9rem; padding: .5rem .65rem; border: 1px solid var(--line); border-radius: 4px; background: #fff; width: 100%; color: var(--charcoal); }
textarea { resize: vertical; line-height: 1.5; }
.color { display: flex; gap: .6rem; align-items: center; }
.color input { width: 48px; height: 34px; border: 1px solid var(--line); padding: 0; background: none; }
code { font-size: .85rem; background: var(--ivory); padding: .3rem .5rem; border-radius: 4px; justify-self: start; }
.group { border: 1px solid var(--line); border-radius: 6px; padding: .8rem 1rem 1rem; margin: 0; }
.group legend { font-family: var(--serif); font-size: 1.05rem; padding: 0 .4rem; }
.list { display: grid; gap: .45rem; }
.li { display: grid; grid-template-columns: 1fr auto; gap: .4rem; align-items: start; }
.card { border: 1px solid var(--line); border-radius: 6px; background: var(--paper); padding: .5rem .8rem; }
.card[open] { padding-bottom: 1rem; }
.card summary { cursor: pointer; font-family: var(--serif); font-size: 1rem; padding: .2rem 0; }
.card[open] summary { margin-bottom: .7rem; }
.tools { display: flex; gap: .2rem; }
.tools button { border: 1px solid var(--line); background: #fff; border-radius: 4px; padding: .35rem; cursor: pointer; color: var(--ink-soft); line-height: 0; }
.tools button:disabled { opacity: .35; cursor: default; }
.tools .del { color: #a3402f; }
.tools svg, .add svg { width: 15px; height: 15px; }
.add { justify-self: start; display: inline-flex; gap: .3rem; align-items: center; border: 1px dashed var(--olive); background: none; color: var(--olive); padding: .3rem .7rem; border-radius: 4px; cursor: pointer; font-size: .82rem; }
</style>
