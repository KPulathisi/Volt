/**
 * Configuration state for the configurator: one shared reactive object, validated on every change.
 * Sources, in order of priority: URL query (?model=one&paint=lime…), saved configuration in
 * localStorage, defaults. Invalid values fall back to safe defaults and are reported.
 */
import { reactive, computed, readonly } from 'vue'
import { catalog, lookup } from './useData.js'
import { priceConfig } from './useVehiclePricing.js'

const STORAGE_KEY = 'volt-config-v1'
export const DEFAULTS = Object.freeze({ model: 'one', paint: 'graphite', wheels: 'aero-20', interior: 'carbon', packages: [] })

/** Returns { config, corrections } with every value checked against the catalog */
export function validateConfig(raw = {}) {
  const corrections = []
  const pick = (key, list, fallback) => {
    const v = raw[key]
    if (v == null || v === '') return fallback
    if (list.some((x) => x.id === v)) return v
    corrections.push(`Unknown ${key} "${String(v).slice(0, 30)}", using the default`)
    return fallback
  }
  const model = pick('model', catalog.vehicles, DEFAULTS.model)
  const vehicle = lookup.vehicles[model]
  const paint = pick('paint', catalog.colors, DEFAULTS.paint)
  let wheels = pick('wheels', catalog.wheels, vehicle.allowedWheels[0])
  if (!vehicle.allowedWheels.includes(wheels)) {
    if (raw.wheels) corrections.push(`${lookup.wheels[wheels].name} wheels aren't offered on ${vehicle.name}`)
    wheels = vehicle.allowedWheels.includes(DEFAULTS.wheels) ? DEFAULTS.wheels : vehicle.allowedWheels[0]
  }
  const interior = pick('interior', catalog.interiors, DEFAULTS.interior)
  const rawPk = Array.isArray(raw.packages) ? raw.packages : String(raw.packages || '').split(',').filter(Boolean)
  const packages = []
  for (const id of rawPk) {
    if (!lookup.packages[id]) corrections.push(`Unknown package "${String(id).slice(0, 30)}" ignored`)
    else if (!packages.includes(id)) packages.push(id)
  }
  vehicle.standardPackages.forEach((id) => { if (!packages.includes(id)) packages.push(id) })
  // keep catalog order
  packages.sort((a, b) => catalog.packages.findIndex((p) => p.id === a) - catalog.packages.findIndex((p) => p.id === b))
  return { config: { model, paint, wheels, interior, packages }, corrections }
}

export const toQuery = (c) => ({ model: c.model, paint: c.paint, wheels: c.wheels, interior: c.interior, ...(c.packages.length ? { pkg: c.packages.join(',') } : {}) })
export const fromQuery = (q) => validateConfig({ model: q.model, paint: q.paint, wheels: q.wheels, interior: q.interior, packages: q.pkg })

function readSaved() {
  try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); return s && typeof s === 'object' ? s : null } catch { return null }
}

const state = reactive({ ...validateConfig(readSaved() || DEFAULTS).config, savedAt: readSaved()?.savedAt || null, corrections: [] })

export function useVehicleConfig() {
  const config = computed(() => ({ model: state.model, paint: state.paint, wheels: state.wheels, interior: state.interior, packages: [...state.packages] }))
  const pricing = computed(() => priceConfig(config.value, lookup))
  const vehicle = computed(() => lookup.vehicles[state.model])
  const parts = computed(() => ({ vehicle: vehicle.value, paint: lookup.colors[state.paint], wheel: lookup.wheels[state.wheels], interior: lookup.interiors[state.interior], packages: state.packages.map((id) => lookup.packages[id]) }))
  const isSaved = computed(() => {
    const s = readSaved()
    return !!s && JSON.stringify(toQuery(validateConfig(s).config)) === JSON.stringify(toQuery(config.value))
  })

  function apply(raw) {
    const { config: c, corrections } = validateConfig({ ...config.value, ...raw })
    Object.assign(state, c)
    state.corrections = corrections
    return corrections
  }
  const select = (key, id) => apply({ [key]: id })
  function setModel(id) {
    // keep the current wheels if the new model offers them, otherwise its first option
    const v = lookup.vehicles[id]
    const wheels = v.allowedWheels.includes(state.wheels) ? state.wheels : v.allowedWheels[0]
    const packages = state.packages.filter((p) => !lookup.vehicles[state.model].standardPackages.includes(p))
    return apply({ model: id, wheels, packages })
  }
  function togglePackage(id) {
    if (vehicle.value.standardPackages.includes(id)) return
    const has = state.packages.includes(id)
    apply({ packages: has ? state.packages.filter((p) => p !== id) : [...state.packages, id] })
  }
  const reset = () => apply({ ...DEFAULTS, packages: [] })
  function save() {
    const savedAt = new Date().toISOString()
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config.value, savedAt })); state.savedAt = savedAt; return true } catch { return false }
  }
  const loadQuery = (q) => { const r = fromQuery(q); Object.assign(state, r.config); state.corrections = r.corrections; return r.corrections }
  function shareUrl() {
    const qs = new URLSearchParams(toQuery(config.value)).toString()
    return `${location.origin}${location.pathname}#/configure?${qs}`
  }
  function summaryText() {
    const p = pricing.value, money = (n) => `$${n.toLocaleString('en-US')}`
    return [
      `VOLT concept configuration`,
      ...p.lines.map((l) => `${l.label} (${l.detail}): ${l.included ? 'included' : money(l.price)}`),
      `Estimated price: ${money(p.total)} (illustrative, before taxes and fees)`,
      `Estimated range: ${p.range} km · 0–100 km/h: ${p.accel} s (concept targets)`,
      `Link: ${shareUrl()}`,
      `This is a concept configuration for a fictional car. It is not an order or a quote.`
    ].join('\n')
  }

  return { state: readonly(state), config, pricing, vehicle, parts, isSaved, select, setModel, togglePackage, reset, save, loadQuery, shareUrl, summaryText }
}
