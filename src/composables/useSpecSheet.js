/**
 * Builds a downloadable PNG specification sheet for the current configuration:
 * a snapshot of the 3D view (or the 2D drawing when 3D is unavailable) plus the figures.
 */
import { money } from './useData.js'

function loadImage(src) {
  return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src })
}

/** Turns an on-page <svg> into an image source */
function svgToDataUrl(svgEl) {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const vb = clone.viewBox.baseVal
  clone.setAttribute('width', vb.width * 4)
  clone.setAttribute('height', vb.height * 4)
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone))
}

export async function makeSpecSheet({ parts, pricing, snapshot, svgEl, shareUrl }) {
  const W = 1800, H = 1100
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const g = c.getContext('2d')
  await document.fonts?.ready
  const display = '"Archivo Variable", Arial, sans-serif', mono = '"JetBrains Mono Variable", monospace'

  // background with grid
  g.fillStyle = '#070809'; g.fillRect(0, 0, W, H)
  g.strokeStyle = 'rgba(242,243,241,0.06)'; g.lineWidth = 1
  for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke() }
  for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke() }
  const glow = g.createRadialGradient(560, 560, 0, 560, 560, 620)
  glow.addColorStop(0, 'rgba(255,255,255,0.08)'); glow.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = glow; g.fillRect(0, 0, 1200, H)

  // header
  g.fillStyle = '#f2f3f1'
  g.font = `700 44px ${display}`; g.fillText('VOLT', 70, 100)
  g.fillStyle = '#c5f23a'; g.fillRect(70, 118, 120, 3)
  g.fillStyle = '#8d939b'; g.font = `500 18px ${mono}`
  g.fillText('CONCEPT CONFIGURATION · SPECIFICATION SHEET', 230, 100)
  g.fillText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), W - 420, 100)

  // car image
  try {
    const src = snapshot || (svgEl ? svgToDataUrl(svgEl) : null)
    if (src) {
      const img = await loadImage(src)
      const boxW = 1100, boxH = 620
      const s = Math.min(boxW / img.width, boxH / img.height)
      g.drawImage(img, 60 + (boxW - img.width * s) / 2, 190 + (boxH - img.height * s) / 2, img.width * s, img.height * s)
    }
  } catch { /* keep the sheet even if the image fails */ }

  // model name
  g.fillStyle = '#f2f3f1'; g.font = `700 76px ${display}`
  g.fillText(parts.vehicle.name, 70, 900)
  g.fillStyle = '#b9bec4'; g.font = `400 26px ${display}`
  g.fillText(`${parts.vehicle.body} · ${parts.paint.name} · ${parts.wheel.name} wheels · ${parts.interior.name} interior`, 70, 950)

  // right column: price lines
  let y = 210
  const x0 = 1220, x1 = W - 70
  g.font = `500 16px ${mono}`; g.fillStyle = '#8d939b'; g.fillText('CONFIGURATION', x0, y); y += 30
  for (const l of pricing.lines) {
    g.strokeStyle = 'rgba(242,243,241,0.14)'; g.beginPath(); g.moveTo(x0, y + 22); g.lineTo(x1, y + 22); g.stroke()
    g.fillStyle = '#f2f3f1'; g.font = `500 22px ${display}`; g.fillText(l.label, x0, y + 8)
    const price = l.included ? 'Included' : l.price ? money(l.price) : 'Included'
    g.textAlign = 'right'; g.fillText(price, x1, y + 8); g.textAlign = 'left'
    y += 52
  }
  y += 10
  g.fillStyle = '#8d939b'; g.font = `500 16px ${mono}`; g.fillText('ESTIMATED PRICE (ILLUSTRATIVE)', x0, y)
  g.fillStyle = '#c5f23a'; g.font = `700 60px ${display}`; g.fillText(money(pricing.total), x0, y + 64)
  y += 120
  const figs = [['RANGE', `${pricing.range} km`], ['0–100 KM/H', `${pricing.accel} s`], ['PEAK POWER', `${pricing.power} kW`], ['PEAK CHARGING', `${parts.vehicle.specs.chargeRate} kW`]]
  figs.forEach(([k, v], i) => {
    const fx = x0 + (i % 2) * 260, fy = y + Math.floor(i / 2) * 90
    g.fillStyle = '#8d939b'; g.font = `500 15px ${mono}`; g.fillText(k, fx, fy)
    g.fillStyle = '#f2f3f1'; g.font = `600 36px ${display}`; g.fillText(v, fx, fy + 44)
  })
  if (parts.packages.length) {
    g.fillStyle = '#8d939b'; g.font = `500 15px ${mono}`
    g.fillText('PACKAGES: ' + parts.packages.map((p) => p.name.toUpperCase()).join(' · '), 70, 1000)
  }
  // footer
  g.fillStyle = '#8d939b'; g.font = `400 15px ${mono}`
  g.fillText('VOLT is a fictional brand. Figures are concept targets, prices are illustrative, and this is not an order or quote.', 70, H - 50)
  if (shareUrl) { g.textAlign = 'right'; g.fillText(shareUrl.length > 90 ? shareUrl.slice(0, 87) + '…' : shareUrl, W - 70, H - 82); g.textAlign = 'left' }

  return new Promise((resolve) => c.toBlob(resolve, 'image/png'))
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
