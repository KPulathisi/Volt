<script setup>
/**
 * Edits one data file. Lists (rooms, experiences…) get a sidebar of entries;
 * single documents (resort, dining, location) open straight into the form.
 */
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Save, Trash2, Undo2, Copy } from 'lucide-vue-next'
import TreeEditor from './TreeEditor.vue'
import { store, persist } from './store.js'
import { slugify, clone } from './api.js'

const props = defineProps({
  file: { type: String, required: true },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  id: { type: String, default: '' }
})
const emit = defineEmits(['toast', 'dirty'])
const router = useRouter()

const isList = computed(() => Array.isArray(store[props.file]))
const items = computed(() => (isList.value ? store[props.file] : []))
const draft = ref(null)
const isNew = ref(false)
const dirty = ref(false)
watch(dirty, (d) => emit('dirty', d))
const titleOf = (x) => x.name || x.title || x.quote?.slice(0, 60) || x.id

function open() {
  if (isList.value) {
    const x = items.value.find((i) => i.id === props.id) || (!props.id ? items.value[0] : null)
    draft.value = x ? clone(x) : null
  } else draft.value = clone(store[props.file])
  isNew.value = false
  dirty.value = false
}
watch(() => [props.file, props.id], open, { immediate: true })

const confirmDiscard = () => !dirty.value || confirm('Discard unsaved changes?')
function select(id) { if (confirmDiscard()) router.push(`/admin/${props.file}/${id}`) }

function create(from) {
  if (!confirmDiscard()) return
  const title = prompt(from ? 'Name for the copy:' : 'Name of the new entry:')
  if (!title) return
  let id = slugify(title) || `item-${Date.now().toString(36)}`
  while (items.value.some((i) => i.id === id)) id += '-2'
  // A new entry starts as a copy of an existing one so it has every field the site expects
  const base = clone(from || items.value[0] || {})
  base.id = id
  if ('name' in base) base.name = title
  else if ('title' in base) base.title = title
  draft.value = base
  isNew.value = true
  dirty.value = true
}

async function save() {
  try {
    const d = clone(draft.value)
    if (isList.value) {
      const list = store[props.file]
      const i = list.findIndex((x) => x.id === d.id)
      i === -1 ? list.push(d) : (list[i] = d)
    } else store[props.file] = d
    await persist(props.file)
    dirty.value = false
    emit('toast', 'Saved. Reload the site tab to see it.')
    if (isNew.value) { isNew.value = false; router.replace(`/admin/${props.file}/${d.id}`) }
  } catch (e) { emit('toast', `Save failed: ${e.message}`) }
}
async function remove() {
  if (!confirm('Delete this entry? A backup of the file is kept in .admin-backups.')) return
  store[props.file] = items.value.filter((x) => x.id !== draft.value.id)
  await persist(props.file)
  dirty.value = false
  emit('toast', 'Deleted')
  router.push(`/admin/${props.file}`)
}
async function moveEntry(d) {
  const list = store[props.file]
  const i = list.findIndex((x) => x.id === draft.value.id), j = i + d
  if (i < 0 || j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j], list[i]]
  await persist(props.file)
  emit('toast', 'Order saved')
}
</script>

<template>
  <div :class="['split', { single: !isList }]">
    <aside v-if="isList" class="side">
      <div class="side-head"><strong>{{ label }}</strong><button class="abtn" @click="create()"><Plus />New</button></div>
      <ul>
        <li v-for="x in items" :key="x.id"><button :class="{ on: draft?.id === x.id }" @click="select(x.id)">{{ titleOf(x) }}</button></li>
      </ul>
      <p class="side-note">Order here is the order on the site.</p>
    </aside>

    <section v-if="draft" class="editor">
      <div class="bar">
        <div>
          <h2>{{ isList ? titleOf(draft) || 'New entry' : label }}</h2>
          <p v-if="isList" class="id">id <code>{{ draft.id }}</code><span v-if="isNew"> · new, not saved yet</span></p>
          <p v-else-if="hint" class="id">{{ hint }}</p>
        </div>
        <div class="actions">
          <span v-if="dirty" class="dirty">Unsaved changes</span>
          <template v-if="isList && !isNew">
            <button class="abtn ghost" title="Move earlier" @click="moveEntry(-1)">↑</button>
            <button class="abtn ghost" title="Move later" @click="moveEntry(1)">↓</button>
            <button class="abtn ghost" @click="create(draft)"><Copy />Duplicate</button>
            <button class="abtn ghost danger" @click="remove"><Trash2 />Delete</button>
          </template>
          <button v-if="dirty && !isNew" class="abtn ghost" @click="open"><Undo2 />Revert</button>
          <button class="abtn" :disabled="!dirty" @click="save"><Save />Save</button>
        </div>
      </div>
      <form class="form" @submit.prevent="save">
        <TreeEditor :model="draft" @change="dirty = true" />
      </form>
    </section>
    <section v-else class="editor empty"><p>Choose an entry, or create a new one.</p></section>
  </div>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; align-items: start; }
.split.single { grid-template-columns: 1fr; max-width: 980px; }
.side { position: sticky; top: 4.5rem; background: #fff; border: 1px solid var(--line); border-radius: 6px; max-height: calc(100vh - 6rem); display: flex; flex-direction: column; }
.side-head { display: flex; justify-content: space-between; align-items: center; gap: .5rem; padding: .6rem .8rem; border-bottom: 1px solid var(--line); }
.side ul { list-style: none; margin: 0; padding: .3rem; overflow-y: auto; }
.side li button { width: 100%; text-align: left; border: 0; background: none; padding: .55rem .6rem; border-radius: 4px; cursor: pointer; font: inherit; font-size: .88rem; color: var(--charcoal); }
.side li button:hover { background: var(--ivory); }
.side li button.on { background: var(--sand); }
.side-note { font-size: .74rem; color: var(--ink-soft); padding: .5rem .8rem; margin: 0; border-top: 1px solid var(--line); }
.editor { display: grid; gap: 1rem; }
.editor.empty { color: var(--ink-soft); padding: 3rem 0; }
.bar { position: sticky; top: 3.6rem; z-index: 5; background: var(--paper); padding: .8rem 0; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; border-bottom: 1px solid var(--line); }
.bar h2 { margin: 0; font-size: 1.6rem; }
.id { margin: .2rem 0 0; font-size: .8rem; color: var(--ink-soft); }
.actions { display: flex; gap: .4rem; align-items: center; flex-wrap: wrap; }
.dirty { font-size: .8rem; color: var(--brass); font-weight: 600; margin-right: .3rem; }
.form { background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: 1.2rem; }
@media (max-width: 900px) { .split { grid-template-columns: 1fr; } .side { position: static; max-height: 280px; } }
</style>
