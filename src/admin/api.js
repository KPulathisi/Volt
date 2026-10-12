// Talks to the local admin API (admin/vite-admin-plugin.js). Only works under `npm run dev`.

async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const loadData = (name) => req('GET', `/__admin/data/${name}`)
export const saveData = (name, value) => req('PUT', `/__admin/data/${name}`, value)
export const deleteFiles = (dir, name) => req('DELETE', `/__admin/file?dir=${dir}&name=${encodeURIComponent(name)}`)

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result).split(',')[1])
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be read as an image')) }
    img.src = url
  })
}

function resizeToWebp(img, max, quality) {
  const scale = Math.min(1, max / img.naturalWidth)
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * scale)
  c.height = Math.round(img.naturalHeight * scale)
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return new Promise((resolve) => c.toBlob(resolve, 'image/webp', quality))
}

/**
 * Converts any photo into the two WebP sizes the site uses and saves them as
 * public/media/<id>.webp (2000px) and public/media/<id>-sm.webp (900px).
 * Returns { file, width, height } for the media slot.
 */
export async function uploadImage(file, id) {
  const { img, url } = await loadImage(file)
  try {
    const full = await resizeToWebp(img, 2000, 0.82)
    const small = await resizeToWebp(img, 900, 0.78)
    await req('POST', '/__admin/upload', { dir: 'images', name: id, ext: '.webp', data: await blobToBase64(full) })
    await req('POST', '/__admin/upload', { dir: 'images', name: `${id}-sm`, ext: '.webp', data: await blobToBase64(small) })
    return { file: id, width: img.naturalWidth, height: img.naturalHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Saves a video as public/media/videos/<id>.mp4 (or .webm). Returns the path for the media slot. */
export async function uploadVideo(file, id) {
  const ext = file.name.toLowerCase().endsWith('.webm') ? '.webm' : '.mp4'
  const r = await req('POST', '/__admin/upload', { dir: 'videos', name: id, ext, data: await blobToBase64(file) })
  return r.path
}

export const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
export const clone = (v) => JSON.parse(JSON.stringify(v))
