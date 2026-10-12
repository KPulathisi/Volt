import { reactive } from 'vue'
import { loadData, saveData } from './api.js'

export const FILES = ['site', 'vehicles', 'colors', 'wheels', 'interiors', 'packages', 'media']

export const store = reactive({ loaded: false, error: '', stamp: Date.now(), ...Object.fromEntries(FILES.map((f) => [f, null])) })

export async function loadAll() {
  try {
    const results = await Promise.all(FILES.map(loadData))
    FILES.forEach((f, i) => (store[f] = results[i]))
    store.loaded = true
  } catch (e) {
    store.error = String(e.message || e)
  }
}

export const persist = (name) => saveData(name, store[name])

/** Options for "pick a media slot" selects, optionally limited to images or videos */
export const slotOptions = (kind) => (store.media || []).filter((m) => !kind || m.kind === kind).map((m) => ({ value: m.id, label: `${m.id} · ${m.label}` }))
