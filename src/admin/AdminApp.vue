<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Images, Car, Palette, CircleDot, Armchair, PackagePlus, FileText, ArrowLeft } from 'lucide-vue-next'
import MediaManager from './MediaManager.vue'
import DocEditor from './DocEditor.vue'
import { store, loadAll } from './store.js'

const props = defineProps({ section: { type: String, default: '' }, id: { type: String, default: '' } })
const toast = ref('')
const dirty = ref(false)
let tt = 0
function showToast(msg) { toast.value = msg; clearTimeout(tt); tt = setTimeout(() => (toast.value = ''), 2800) }

const nav = [
  { key: 'media', label: 'Images & videos', icon: Images },
  { key: 'vehicles', label: 'Models & specs', icon: Car, list: true },
  { key: 'colors', label: 'Paint colours', icon: Palette, list: true },
  { key: 'wheels', label: 'Wheels', icon: CircleDot, list: true },
  { key: 'interiors', label: 'Interiors', icon: Armchair, list: true },
  { key: 'packages', label: 'Packages', icon: PackagePlus, list: true },
  { key: 'site', label: 'Site text', icon: FileText, hint: 'Hero, showcase hotspots, design story, energy section and closing lines. 3D shapes, the charging curve and diagram positions are edited in the JSON files.' }
]
const current = computed(() => nav.find((n) => n.key === props.section) || nav[0])

const warn = (e) => { if (dirty.value) { e.preventDefault(); e.returnValue = '' } }
onMounted(() => { loadAll(); window.addEventListener('beforeunload', warn) })
onBeforeUnmount(() => window.removeEventListener('beforeunload', warn))
</script>

<template>
  <div class="admin" data-lenis-prevent>
    <header class="top">
      <div class="brand"><strong>VOLT</strong><span>Admin · this computer only</span></div>
      <nav>
        <RouterLink v-for="n in nav" :key="n.key" :to="`/admin/${n.key}`" :class="{ on: current.key === n.key }"><component :is="n.icon" />{{ n.label }}</RouterLink>
      </nav>
      <a href="#/" class="back"><ArrowLeft />View site</a>
    </header>

    <main class="body">
      <p v-if="store.error" class="fatal">Couldn't load the data ({{ store.error }}). The admin only works while <code>npm run dev</code> is running on this computer.</p>
      <p v-else-if="!store.loaded">Loading…</p>
      <template v-else>
        <MediaManager v-if="current.key === 'media'" @toast="showToast" @dirty="dirty = $event" />
        <DocEditor v-else :key="current.key" :file="current.key" :label="current.label" :hint="current.hint" :id="id" @toast="showToast" @dirty="dirty = $event" />
      </template>
      <section class="help">
        <h3>Publishing your changes</h3>
        <p>Edits are written straight into <code>src/data/*.json</code> and uploads into <code>public/media</code>. Previous versions of each file are kept in <code>.admin-backups/</code> (not committed). Check the site, then commit and push; GitHub Actions rebuilds the live site.</p>
        <pre>git add -A
git commit -m "Update content"
git push</pre>
      </section>
    </main>

    <Transition name="toast"><div v-if="toast" class="toast" role="status">{{ toast }}</div></Transition>
  </div>
</template>

<style scoped>
.admin { --paper: #f4f5f3; --ivory: #e9ebe8; --sand: #dfe3dc; --charcoal: #16181b; --ink-soft: #565b62; --sea: #16191c; --sea-deep: #070809; --brass: #7a9a10; --olive: #5d7a0c; --serif: var(--display); --line: rgba(22, 24, 27, .16); min-height: 100vh; background: var(--paper); color: var(--charcoal); font-size: 15px; color-scheme: light; }
.top { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 1.5rem; padding: .55rem 1.5rem; background: var(--sea-deep); color: var(--paper); flex-wrap: wrap; min-height: 3.6rem; }
.brand { display: grid; line-height: 1.1; }
.brand strong { font: 700 1.1rem var(--display); font-stretch: 125%; letter-spacing: .3em; }
.brand span { font-size: .7rem; opacity: .7; }
.top nav { display: flex; gap: .15rem; flex-wrap: wrap; flex: 1; }
.top nav a, .back { display: inline-flex; align-items: center; gap: .35rem; color: var(--sand); text-decoration: none; padding: .4rem .7rem; border-radius: 999px; font-size: .84rem; }
.top nav a:hover, .back:hover { background: rgba(255, 255, 255, .08); color: #fff; }
.top nav a.on { background: var(--lime); color: var(--sea-deep); }
.top svg { width: 15px; height: 15px; }
.body { padding: 0 1.5rem 3rem; max-width: 1440px; margin: 0 auto; display: grid; gap: 2rem; }
.fatal { color: #a3402f; font-weight: 600; margin-top: 2rem; }
.help { border-top: 1px solid var(--line); padding-top: 1rem; font-size: .86rem; color: var(--ink-soft); }
.help h3 { font-size: 1.05rem; margin: 0 0 .3rem; color: var(--charcoal); }
.help pre { background: #fff; border: 1px solid var(--line); padding: .7rem; border-radius: 4px; display: inline-block; font-size: .8rem; }
.toast { position: fixed; bottom: 1.2rem; left: 50%; transform: translateX(-50%); background: var(--sea-deep); color: #fff; padding: .7rem 1.2rem; border-radius: 999px; box-shadow: 0 6px 20px rgba(0, 0, 0, .25); z-index: 60; font-size: .9rem; }
.toast-enter-active, .toast-leave-active { transition: opacity .25s, transform .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
</style>

<style>
/* shared admin buttons */
.abtn { display: inline-flex; align-items: center; gap: .35rem; font: inherit; font-size: .82rem; padding: .42rem .8rem; border-radius: 999px; border: 1px solid var(--sea); background: var(--sea); color: var(--paper); cursor: pointer; white-space: nowrap; }
.abtn:hover:not(:disabled) { background: var(--sea-deep); }
.abtn:disabled { opacity: .4; cursor: default; }
.abtn svg { width: 14px; height: 14px; }
.abtn.ghost { background: #fff; color: var(--charcoal); border-color: var(--line); }
.abtn.ghost:hover:not(:disabled) { background: var(--ivory); }
.abtn.danger { color: #a3402f; border-color: rgba(163, 64, 47, .4); }
</style>
