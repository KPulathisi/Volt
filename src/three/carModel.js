/**
 * Builds a stylised VOLT concept car from code (no downloaded 3D assets).
 * The body and glass canopy are lofted from cross-sections defined in carProfile.js.
 * Nose points to +X, Y is up, Z is across the car.
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { makeProfile } from './carProfile.js'

const ACCENT = '#c5f23a'
const se = (v, n) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n) // superellipse helper

/** Cross-section parameters for the body at u */
function bodySection(p, u) {
  const yb = p.bottom(u), yt = p.belt(u), hw = p.halfWidth(u)
  const cy = yb + 0.42 * (yt - yb)
  // round off the nose and tail so the ends close smoothly
  const e = u < 0.035 ? u / 0.035 : u > 0.975 ? (1 - u) / 0.025 : 1
  const k = Math.sqrt(Math.max(0.0004, 1 - (1 - e) * (1 - e)))
  const kw = 0.06 + 0.94 * k, kh = 0.08 + 0.92 * k
  return { yb: cy - (cy - yb) * kh, yt: cy + (yt - cy) * kh, hw: hw * kw, cy, hU: (yt - cy) * kh, hL: (cy - yb) * kh, nU: 3.6, nL: 4.2, lowW: 0.93 }
}

/** Half-width of the body at height y in the section at u (0 if y is outside) */
function halfWidthAt(p, u, y) {
  const s = bodySection(p, u)
  if (y > s.yt || y < s.yb) return 0
  if (y >= s.cy) {
    const sn = Math.pow((y - s.cy) / s.hU, s.nU / 2)
    return s.hw * Math.pow(Math.sqrt(Math.max(0, 1 - sn * sn)), 2 / s.nU)
  }
  const sn = Math.pow((s.cy - y) / s.hL, s.nL / 2)
  return s.hw * s.lowW * Math.pow(Math.sqrt(Math.max(0, 1 - sn * sn)), 2 / s.nL)
}

/** Generic loft: sections[i] is an array of [x, y, z]; optional end caps */
function loft(sections, { closed = true, caps = true } = {}) {
  const n = sections[0].length
  const pos = [], idx = []
  sections.forEach((sec) => sec.forEach((v) => pos.push(...v)))
  const ring = closed ? n : n - 1
  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < ring; j++) {
      const a = i * n + j, b = i * n + ((j + 1) % n), c = (i + 1) * n + j, d = (i + 1) * n + ((j + 1) % n)
      idx.push(a, b, c, b, d, c)
    }
  }
  if (caps) {
    for (const [si, flip] of [[0, true], [sections.length - 1, false]]) {
      const sec = sections[si]
      const cx = sec.reduce((s, v) => s + v[0], 0) / n, cyy = sec.reduce((s, v) => s + v[1], 0) / n, cz = sec.reduce((s, v) => s + v[2], 0) / n
      const ci = pos.length / 3
      pos.push(cx, cyy, cz)
      for (let j = 0; j < n; j++) {
        const a = si * n + j, b = si * n + ((j + 1) % n)
        flip ? idx.push(ci, a, b) : idx.push(ci, b, a)
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const X = (p, u) => (0.5 - u) * p.L

function bodyGeometry(p) {
  const NU = 170, NT = 56, sections = []
  for (let i = 0; i < NU; i++) {
    const u = 0.5 - 0.5 * Math.cos((Math.PI * i) / (NU - 1))
    const s = bodySection(p, u), x = X(p, u), sec = []
    for (let j = 0; j < NT; j++) {
      const t = (j / NT) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t)
      if (sn >= 0) sec.push([x, s.cy + s.hU * Math.abs(se(sn, s.nU)), s.hw * se(c, s.nU)])
      else sec.push([x, s.cy - s.hL * Math.abs(se(sn, s.nL)), s.hw * s.lowW * se(c, s.nL)])
    }
    sections.push(sec)
  }
  return loft(sections)
}

function canopyGeometry(p) {
  const NU = 90, NT = 40, sections = []
  const a = p.cabinStart, b = p.cabinEnd
  for (let i = 0; i < NU; i++) {
    const u = a + (b - a) * (0.5 - 0.5 * Math.cos((Math.PI * i) / (NU - 1)))
    const cy = p.belt(u) - 0.12, h = Math.max(0.12, p.roof(u) - cy), w = p.halfWidth(u) * 0.84, x = X(p, u), sec = []
    for (let j = 0; j <= NT; j++) {
      const t = (j / NT) * Math.PI, c = Math.cos(t), sn = Math.sin(t)
      sec.push([x, cy + h * Math.abs(se(sn, 2.4)), w * se(c, 2.4)])
    }
    sections.push(sec)
  }
  return loft(sections, { closed: false, caps: false })
}

/** A thin tube that hugs the nose (front) or tail (rear) at height y */
function lightBar(p, front, y, span = 0.86) {
  const pts = []
  const half = p.W / 2
  for (let k = 0; k <= 40; k++) {
    const z = (-1 + (2 * k) / 40) * half * span
    let u = front ? 0 : 1
    // walk inwards until the body is at least |z| wide at this height
    for (let it = 0; it < 400; it++) {
      if (halfWidthAt(p, u, y) >= Math.abs(z)) break
      u += front ? 0.0015 : -0.0015
    }
    pts.push(new THREE.Vector3(X(p, u) + (front ? 0.004 : -0.004), y, z))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.0095, 6, false)
}

function tyreGeometry(r, w, rimR) {
  const pts = [[rimR, -w / 2], [r - 0.035, -w / 2], [r - 0.006, -w / 2 + 0.03], [r, 0], [r - 0.006, w / 2 - 0.03], [r - 0.035, w / 2], [rimR, w / 2]].map(([a, b]) => new THREE.Vector2(a, b))
  const g = new THREE.LatheGeometry(pts, 64)
  g.rotateX(Math.PI / 2)
  return g
}

function makeWheel(style, mats, r, caliper) {
  const w = 0.255, rimR = r * 0.74
  const wheel = new THREE.Group()
  const spin = new THREE.Group()
  wheel.add(spin)
  spin.add(new THREE.Mesh(tyreGeometry(r, w, rimR), mats.tyre))
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, w * 0.92, 48, 1, true), mats.rimInner)
  barrel.rotation.x = Math.PI / 2
  spin.add(barrel)
  // brake disc + caliper (caliper does not spin)
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.82, rimR * 0.82, 0.03, 40), mats.disc)
  disc.rotation.x = Math.PI / 2
  disc.position.z = 0.02
  spin.add(disc)
  const cal = new THREE.Mesh(new RoundedBoxGeometry(0.09, rimR * 0.62, 0.07, 2, 0.02), caliper)
  cal.position.set(-rimR * 0.62, rimR * 0.18, 0.05)
  cal.rotation.z = -0.35
  wheel.add(cal)

  const face = new THREE.Group()
  face.position.z = w / 2 - 0.035
  spin.add(face)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(rimR * 0.97, 0.017, 10, 64), mats.rim)
  face.add(ring)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.04, 24), mats.rimDark)
  hub.rotation.x = Math.PI / 2
  hub.position.z = 0.012
  face.add(hub)

  if (style === 'aero') {
    const cover = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.96, rimR * 0.96, 0.02, 64), mats.rim)
    cover.rotation.x = Math.PI / 2
    face.add(cover)
    for (let i = 0; i < 5; i++) {
      const slot = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.035, 0.03, 2, 0.012), mats.rimDark)
      const a = (i / 5) * Math.PI * 2
      slot.position.set(Math.cos(a) * rimR * 0.68, Math.sin(a) * rimR * 0.68, 0.006)
      slot.rotation.z = a + Math.PI / 2 + 0.35
      face.add(slot)
    }
  } else if (style === 'turbine') {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      const blade = new THREE.Mesh(new THREE.BoxGeometry(rimR * 0.78, 0.05, 0.02), mats.rim)
      const holder = new THREE.Group()
      holder.rotation.z = a
      blade.position.x = rimR * 0.5
      blade.rotation.x = 0.55
      blade.rotation.z = 0.25
      holder.add(blade)
      face.add(holder)
    }
  } else {
    for (let i = 0; i < 5; i++) {
      for (const off of [-0.075, 0.075]) {
        const a = (i / 5) * Math.PI * 2 + off
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(rimR * 0.86, 0.026, 0.028), mats.rim)
        const holder = new THREE.Group()
        holder.rotation.z = a
        spoke.position.x = rimR * 0.48
        holder.add(spoke)
        face.add(holder)
      }
    }
  }
  return { wheel, spin }
}

export function createMaterials() {
  return {
    paint: new THREE.MeshPhysicalMaterial({ color: '#4a4e54', metalness: 0.75, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#030304', metalness: 0.3, roughness: 0.07, transparent: true, opacity: 0.94, clearcoat: 1, clearcoatRoughness: 0.02 }),
    trim: new THREE.MeshStandardMaterial({ color: '#0c0d0f', metalness: 0.3, roughness: 0.45 }),
    tyre: new THREE.MeshStandardMaterial({ color: '#111214', roughness: 0.88, metalness: 0 }),
    rim: new THREE.MeshPhysicalMaterial({ color: '#9aa0a6', metalness: 0.9, roughness: 0.28, clearcoat: 0.6 }),
    rimInner: new THREE.MeshStandardMaterial({ color: '#2a2c30', metalness: 0.8, roughness: 0.45, side: THREE.DoubleSide }),
    rimDark: new THREE.MeshStandardMaterial({ color: '#151619', metalness: 0.6, roughness: 0.4 }),
    disc: new THREE.MeshStandardMaterial({ color: '#5b5e63', metalness: 0.9, roughness: 0.35 }),
    caliper: new THREE.MeshStandardMaterial({ color: '#2b2d31', metalness: 0.3, roughness: 0.4 }),
    caliperAccent: new THREE.MeshStandardMaterial({ color: ACCENT, metalness: 0.2, roughness: 0.35 }),
    seat: new THREE.MeshStandardMaterial({ color: '#1a1b1e', roughness: 0.6 }),
    dash: new THREE.MeshStandardMaterial({ color: '#2c2e33', roughness: 0.5 }),
    lightFront: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    lightRear: new THREE.MeshBasicMaterial({ color: '#ff2a2a' }),
    carbon: new THREE.MeshPhysicalMaterial({ color: '#101113', metalness: 0.5, roughness: 0.3, clearcoat: 1 })
  }
}

/**
 * Build the car for a vehicle + selected parts. Returns the group plus handles
 * the stage uses for animation (wheel spin groups, anchors for hotspots).
 */
export function buildCar(vehicle, parts, mats) {
  const performance = parts.packages.some((p) => p.id === 'performance')
  const tech = parts.packages.some((p) => p.id === 'tech')
  const lowered = performance ? 0.015 : 0
  const p = makeProfile(vehicle.shape, { wheelSize: parts.wheel.size, lowered })
  const car = new THREE.Group()
  car.name = 'car'

  const body = new THREE.Mesh(bodyGeometry(p), mats.paint)
  body.castShadow = false
  car.add(body)
  car.add(new THREE.Mesh(canopyGeometry(p), mats.glass))

  // light signature
  const yFront = p.belt(0) - 0.055
  car.add(new THREE.Mesh(lightBar(p, true, yFront), mats.lightFront))
  car.add(new THREE.Mesh(lightBar(p, false, p.belt(0.99) - 0.05, 0.9), mats.lightRear))

  // simple interior, visible through the tinted canopy
  const uSeat1 = p.cabinStart + (p.cabinEnd - p.cabinStart) * 0.36
  const uSeat2 = p.cabinStart + (p.cabinEnd - p.cabinStart) * 0.6
  const seatY = p.belt(0.5) - 0.32
  const seatRows = vehicle.seats > 4 ? [uSeat1, uSeat2] : [uSeat1, uSeat2 - 0.02]
  seatRows.forEach((u, row) => {
    for (const z of [-0.36, 0.36]) {
      const base = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.14, 0.48, 3, 0.05), mats.seat)
      base.position.set(X(p, u) + 0.05, seatY, z)
      const back = new THREE.Mesh(new RoundedBoxGeometry(0.13, row ? 0.5 : 0.6, 0.46, 3, 0.05), mats.seat)
      back.position.set(X(p, u) - 0.22, seatY + 0.3, z)
      back.rotation.z = 0.2
      car.add(base, back)
    }
  })
  const dash = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.1, p.W * 0.78, 3, 0.04), mats.dash)
  dash.position.set(X(p, p.cabinStart + 0.07), p.belt(p.cabinStart + 0.07) - 0.05, 0)
  car.add(dash)

  // packages change the hardware
  if (tech) {
    const uPod = p.cabinStart + (p.cabinEnd - p.cabinStart) * 0.22
    const pod = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.06, 0.24, 3, 0.025), mats.carbon)
    pod.position.set(X(p, uPod), p.roof(uPod) + 0.018, 0)
    car.add(pod)
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.022, 0.14), mats.lightFront)
    lens.position.set(X(p, uPod) + 0.1, p.roof(uPod) + 0.02, 0)
    car.add(lens)
  }
  if (performance) {
    const uW = 0.95, yW = p.belt(uW) + 0.075
    for (const z of [-0.38, 0.38]) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.02), mats.carbon)
      stand.position.set(X(p, uW), yW - 0.04, z)
      car.add(stand)
    }
    const wing = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.016, p.W * 0.72, 2, 0.007), mats.carbon)
    wing.position.set(X(p, uW) - 0.02, yW, 0)
    wing.rotation.z = 0.08
    car.add(wing)
  }

  // wheels
  const caliper = performance ? mats.caliperAccent : mats.caliper
  const track = p.halfWidth(0.5) - 0.135
  const spins = []
  const wheelGroups = []
  for (const wx of p.wheelX) {
    for (const side of [1, -1]) {
      const { wheel, spin } = makeWheel(parts.wheel.style, mats, p.r, caliper)
      wheel.position.set(p.L / 2 - wx, p.r, side * track)
      if (side < 0) wheel.rotation.y = Math.PI
      car.add(wheel)
      spins.push(spin)
      wheelGroups.push(wheel)
    }
  }

  // dark wheel wells, so the arches read as openings instead of tunnels
  for (const wx of p.wheelX) {
    const top = p.r + p.archR * 0.9
    const well = new THREE.Mesh(new THREE.BoxGeometry(p.archR * 1.85, top - p.r * 0.6, track * 2 - 0.3), mats.trim)
    well.position.set(p.L / 2 - wx, (top + p.r * 0.6) / 2, 0)
    car.add(well)
  }

  const anchors = {
    light: new THREE.Vector3(p.L / 2 + 0.02, yFront, 0),
    wheel: new THREE.Vector3(p.L / 2 - p.wheelX[0], p.r, track + 0.14),
    cabin: new THREE.Vector3(X(p, (p.cabinStart + p.cabinEnd) / 2), p.H + 0.02, 0)
  }
  return { car, spins, wheels: wheelGroups, anchors, profile: p }
}

export function applyFinishes(mats, parts, gsap, instant = false) {
  const to = (mat, props) => {
    const c = new THREE.Color(props.color)
    if (instant || !gsap) { mat.color.copy(c); Object.assign(mat, props.rest || {}); return }
    gsap.to(mat.color, { r: c.r, g: c.g, b: c.b, duration: 0.9, ease: 'power2.inOut' })
    if (props.rest) gsap.to(mat, { ...props.rest, duration: 0.9, ease: 'power2.inOut' })
  }
  to(mats.paint, { color: parts.paint.hex, rest: { metalness: parts.paint.metalness, roughness: parts.paint.roughness, clearcoat: parts.paint.roughness > 0.6 ? 0.1 : 1 } })
  to(mats.rim, { color: parts.wheel.hex })
  to(mats.seat, { color: parts.interior.hex })
  to(mats.dash, { color: parts.interior.accent })
}
