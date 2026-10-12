<script setup>
/**
 * Every image and video on the site is a "slot" in media.json. Each slot shows its AI prompt,
 * where it is used, and lets you upload, replace or remove the real file.
 */
import { ref, computed } from 'vue'
import { Upload, Copy, Check, Trash2, Film, Image as ImageIcon, Search, Save } from 'lucide-vue-next'
import VoltArt from '../components/VoltArt.vue'
import { store, persist, FILES } from './store.js'
import { uploadImage, uploadVideo, deleteFiles } from './api.js'

const emit = defineEmits(['toast', 'dirty'])
const filter = ref('all')
const q = ref('')
const busy = ref('')
const copied = ref('')
const dirty = ref(false)
const setDirty = (v) => { dirty.value = v; emit('dirty', v) }

const slots = computed(() => store.media.filter((m) =>
  (filter.value === 'all' || (filter.value === 'missing' ? !m.file : filter.value === 'done' ? !!m.file : m.kind === filter.value)) &&
  (!q.value || `${m.id} ${m.label}`.toLowerCase().includes(q.value.toLowerCase()))))
const doneCount = computed(() => store.media.filter((m) => m.file).length)

// Where each slot appears, found by scanning the other data files for its id
const usedBy = computed(() => {
  const map = {}
  const walk = (v, where) => {
    if (typeof v === 'string') { if (!map[v]) map[v] = new Set(); map[v].add(where) }
    else if (v && typeof v === 'object') Object.values(v).forEach((x) => walk(x, where))
  }
  FILES.filter((f) => f !== 'media').forEach((f) => walk(store[f], f))
  return map
})

const src = (m) => (m.kind === 'video' ? `/${m.file}?t=${store.stamp}` : `/media/${m.file}-sm.webp?t=${store.stamp}`)

async function copyPrompt(m) {
  await navigator.clipboard.writeText(m.prompt)
  copied.value = m.id
  setTimeout(() => (copied.value = ''), 1500)
}

async function onFile(m, e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (m.kind === 'video' && !/\.(mp4|webm)$/i.test(file.name)) return emit('toast', 'Please choose an MP4 or WebM video')
  if (m.kind === 'image' && !file.type.startsWith('image/')) return emit('toast', 'Please choose an image file')
  if (m.kind === 'video' && file.size > 40 * 1024 * 1024 && !confirm(`This video is ${(file.size / 1048576).toFixed(0)} MB. Large background videos load slowly; aim for under 15 MB. Upload anyway?`)) return
  busy.value = m.id
  try {
    if (m.kind === 'video') m.file = await uploadVideo(file, m.id)
    else m.file = (await uploadImage(file, m.id)).file
    await persist('media')
    store.stamp = Date.now()
    emit('toast', `${m.label}: uploaded`)
  } catch (err) {
    emit('toast', `Upload failed: ${err.message}`)
  } finally { busy.value = '' }
}

async function removeFile(m) {
  if (!confirm(`Remove the uploaded file for "${m.label}"? The animated placeholder will show again.`)) return
  await deleteFiles(m.kind === 'video' ? 'videos' : 'images', m.id)
  m.file = ''
  await persist('media')
  emit('toast', 'File removed')
}

async function saveText() {
  await persist('media')
  setDirty(false)
  emit('toast', 'Alt text and credits saved')
}
</script>

<template>
  <div class="mm">
    <div class="mm-head">
      <div>
        <h2>Images &amp; videos</h2>
        <p class="sub">{{ doneCount }} of {{ store.media.length }} slots have a real file. Empty slots show an animated placeholder on the site. Generate each one with its prompt, then upload it here: images are converted to WebP (2000px and 900px), videos are saved as they are.</p>
      </div>
      <div class="tools">
        <label class="search"><Search /><input v-model="q" type="search" placeholder="Find a slot" /></label>
        <div class="seg" role="group" aria-label="Filter">
          <button v-for="f in [['all', 'All'], ['missing', 'Needs file'], ['done', 'Done'], ['image', 'Images'], ['video', 'Videos']]" :key="f[0]" :class="{ on: filter === f[0] }" @click="filter = f[0]">{{ f[1] }}</button>
        </div>
        <button class="abtn" :disabled="!dirty" @click="saveText"><Save />Save text</button>
      </div>
    </div>

    <div class="grid">
      <article v-for="m in slots" :key="m.id" :class="['slot', { has: m.file }]">
        <div class="pv" :style="{ aspectRatio: m.aspect }">
          <video v-if="m.file && m.kind === 'video'" :src="src(m)" muted loop autoplay playsinline></video>
          <img v-else-if="m.file" :src="src(m)" :alt="m.alt" />
          <VoltArt v-else :scene="m.scene" :model="m.model || 'one'" />
          <span class="kind"><component :is="m.kind === 'video' ? Film : ImageIcon" />{{ m.kind }} · {{ m.aspect }}</span>
          <span :class="['state', { ok: m.file }]">{{ m.file ? 'Uploaded' : 'Placeholder' }}</span>
          <div v-if="busy === m.id" class="busy">Uploading…</div>
        </div>
        <div class="meta">
          <h3>{{ m.label }}</h3>
          <p class="id"><code>{{ m.id }}</code><span v-if="usedBy[m.id]"> · used in {{ [...usedBy[m.id]].join(', ') }}</span></p>
          <details class="prompt">
            <summary>AI prompt</summary>
            <p>{{ m.prompt }}</p>
          </details>
          <div class="row">
            <button class="abtn ghost" @click="copyPrompt(m)"><component :is="copied === m.id ? Check : Copy" />{{ copied === m.id ? 'Copied' : 'Copy prompt' }}</button>
            <label class="abtn"><Upload />{{ m.file ? 'Replace' : 'Upload' }}<input type="file" class="sr-only" :accept="m.kind === 'video' ? 'video/mp4,video/webm' : 'image/*'" @change="onFile(m, $event)" /></label>
            <button v-if="m.file" class="abtn ghost danger" title="Remove file" @click="removeFile(m)"><Trash2 /></button>
          </div>
          <label class="f"><span>Alt text (describe the picture for screen readers)</span><input type="text" v-model="m.alt" @input="setDirty(true)" /></label>
          <label class="f"><span>Credit (photographer, tool or licence)</span><input type="text" v-model="m.credit" placeholder="e.g. Generated with … / Photo by …" @input="setDirty(true)" /></label>
        </div>
      </article>
    </div>
    <p v-if="!slots.length" class="none">No slots match.</p>
  </div>
</template>

<style scoped>
.mm { display: grid; gap: 1.2rem; }
.mm-head { display: grid; gap: 1rem; position: sticky; top: 3.6rem; z-index: 5; background: var(--paper); padding: .8rem 0; border-bottom: 1px solid var(--line); }
.mm-head h2 { margin: 0; font-size: 1.6rem; }
.sub { margin: .3rem 0 0; font-size: .86rem; color: var(--ink-soft); max-width: 80ch; }
.tools { display: flex; gap: .6rem; flex-wrap: wrap; align-items: center; }
.search { display: flex; align-items: center; gap: .4rem; border: 1px solid var(--line); border-radius: 999px; background: #fff; padding: .3rem .8rem; }
.search svg { width: 15px; color: var(--ink-soft); }
.search input { border: 0; outline: 0; font: inherit; font-size: .88rem; width: 160px; background: none; }
.seg { display: flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; background: #fff; }
.seg button { border: 0; background: none; padding: .4rem .8rem; font: inherit; font-size: .82rem; cursor: pointer; color: var(--charcoal); }
.seg button.on { background: var(--sea); color: var(--paper); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 1.2rem; }
.slot { background: #fff; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
.pv { position: relative; background: var(--sand); max-height: 260px; width: 100%; overflow: hidden; }
.pv img, .pv video, .pv :deep(svg) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.kind, .state { position: absolute; top: .5rem; font-size: .7rem; padding: .2rem .55rem; border-radius: 999px; background: rgba(20, 39, 41, .75); color: var(--paper); display: inline-flex; gap: .3rem; align-items: center; text-transform: capitalize; }
.kind { left: .5rem; } .kind svg { width: 12px; }
.state { right: .5rem; background: rgba(168, 139, 87, .9); }
.state.ok { background: #3c6b4f; }
.busy { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(248, 244, 236, .8); font-weight: 600; }
.meta { padding: .9rem 1rem 1.1rem; display: grid; gap: .6rem; }
.meta h3 { margin: 0; font-size: 1.1rem; }
.id { margin: 0; font-size: .76rem; color: var(--ink-soft); }
.id code { background: var(--ivory); padding: .1rem .35rem; border-radius: 3px; }
.prompt summary { cursor: pointer; font-size: .82rem; font-weight: 600; color: var(--olive); }
.prompt p { font-size: .8rem; line-height: 1.5; color: var(--ink-soft); margin: .4rem 0 0; max-height: 180px; overflow-y: auto; background: var(--ivory); padding: .6rem; border-radius: 4px; }
.row { display: flex; gap: .4rem; flex-wrap: wrap; }
.f { display: grid; gap: .25rem; }
.f span { font-size: .74rem; font-weight: 600; color: var(--ink-soft); }
.f input { font: inherit; font-size: .86rem; padding: .45rem .6rem; border: 1px solid var(--line); border-radius: 4px; }
.none { color: var(--ink-soft); }
</style>
