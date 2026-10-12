import site from '../data/site.json'
import vehicles from '../data/vehicles.json'
import colors from '../data/colors.json'
import wheels from '../data/wheels.json'
import interiors from '../data/interiors.json'
import packages from '../data/packages.json'
import media from '../data/media.json'

const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]))
const mediaById = byId(media)

export const catalog = { vehicles, colors, wheels, interiors, packages }
export const lookup = { vehicles: byId(vehicles), colors: byId(colors), wheels: byId(wheels), interiors: byId(interiors), packages: byId(packages) }

export function useData() {
  return { site, media, ...catalog, getMedia: (id) => mediaById[id], getVehicle: (id) => lookup.vehicles[id] }
}

export const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: site.currency, maximumFractionDigits: 0 }).format(n)
export const num = (n, d = 0) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n)

/** URLs for a media slot's uploaded file (images get a small and a large WebP) */
export function mediaUrls(slot) {
  if (!slot?.file) return null
  const base = import.meta.env.BASE_URL
  if (slot.kind === 'video') return { video: `${base}${slot.file}` }
  return { src: `${base}media/${slot.file}.webp`, srcset: `${base}media/${slot.file}-sm.webp 900w, ${base}media/${slot.file}.webp 2000w` }
}
