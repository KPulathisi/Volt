/**
 * Shared car shape. Both the 3D model (carModel.js) and the 2D drawings (CarSVG.vue) are built
 * from these functions, so every view of a VOLT model has the same proportions.
 *
 * Units are metres. u runs from 0 at the nose to 1 at the tail.
 */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const smooth = (t) => t * t * (3 - 2 * t)

/** Catmull-Rom interpolation through [u, y] points (sorted by u) */
function spline(points, u) {
  if (u <= points[0][0]) return points[0][1]
  if (u >= points.at(-1)[0]) return points.at(-1)[1]
  let i = 0
  while (u > points[i + 1][0]) i++
  const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)]
  const t = (u - p1[0]) / (p2[0] - p1[0])
  const t2 = t * t, t3 = t2 * t
  // tangents scaled to the segment length (handles uneven spacing)
  const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0])) * (p2[0] - p1[0])
  const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0])) * (p2[0] - p1[0])
  return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2
}

export const tyreRadius = (size) => ({ 20: 0.355, 21: 0.362, 22: 0.37 })[size] || 0.355

export function makeProfile(shape, { wheelSize = 20, lowered = 0 } = {}) {
  const L = shape.length, W = shape.width, B = shape.belt - lowered, N = shape.nose - lowered
  const r = tyreRadius(wheelSize)
  const uF = shape.frontOverhang / L
  const uR = (shape.frontOverhang + shape.wheelbase) / L
  const archR = Math.max(r, 0.37) + 0.045
  const clearance = shape.clearance - lowered

  const beltPts = [[0, N], [0.05, N + 0.07], [0.2, B - 0.075], [0.32, B - 0.035], [0.6, B], [0.88, B + 0.015], [0.97, B - 0.035], [1, B - 0.11]]
  const widthPts = [[0, 0.72], [0.04, 0.88], [0.12, 0.975], [0.2, 1], [0.76, 1], [0.9, 0.97], [1, 0.86]]
  const roofPts = shape.roof.map(([u, y]) => [u, y ? y - lowered : null])

  const belt = (u) => spline(beltPts, clamp(u, 0, 1))
  const halfWidth = (u) => (W / 2) * spline(widthPts, clamp(u, 0, 1))

  /** Underside height, raised over each wheel to form the arches */
  function bottom(u) {
    const x = u * L
    const ends = 0.1 * smooth(clamp((0.06 - u) / 0.06, 0, 1)) + 0.13 * smooth(clamp((u - 0.9) / 0.1, 0, 1))
    let y = clearance + ends
    for (const uw of [uF, uR]) {
      const dx = x - uw * L
      if (Math.abs(dx) < archR) y = Math.max(y, r + Math.sqrt(archR * archR - dx * dx) * 0.98)
    }
    return Math.min(y, belt(u) - 0.06)
  }

  // Roof: control points with y = null sit on the beltline
  const roofResolved = (u) => roofPts.map(([pu, py]) => [pu, py ?? belt(pu)])
  const cabinStart = roofPts[0][0], cabinEnd = roofPts.at(-1)[0]
  function roof(u) {
    if (u <= cabinStart || u >= cabinEnd) return belt(u)
    return Math.max(belt(u), spline(roofResolved(u), u))
  }

  return {
    L, W, H: shape.height - lowered, r, uF, uR, archR, clearance,
    belt, bottom, roof, halfWidth, cabinStart, cabinEnd,
    wheelX: [uF * L, uR * L]
  }
}

/** Side silhouette as an SVG path (x to the right = towards the tail), with y flipped for SVG */
export function sideOutline(p, scale = 100, steps = 120) {
  const top = [], bot = []
  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    top.push([u * p.L * scale, -p.roof(u) * scale])
    bot.push([u * p.L * scale, -p.bottom(u) * scale])
  }
  const pts = [...top, ...bot.reverse()]
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L') + ' Z'
}

/** Glass area (between beltline and roof) as an SVG path */
export function glassOutline(p, scale = 100, steps = 80) {
  const a = p.cabinStart + 0.012, b = p.cabinEnd - 0.012
  const top = [], bot = []
  for (let i = 0; i <= steps; i++) {
    const u = a + ((b - a) * i) / steps
    const roofY = p.roof(u), beltY = p.belt(u)
    top.push([u * p.L * scale, -(roofY - Math.min(0.035, (roofY - beltY) * 0.35)) * scale])
    bot.push([u * p.L * scale, -(beltY + 0.01) * scale])
  }
  const pts = [...top, ...bot.reverse()]
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L') + ' Z'
}
