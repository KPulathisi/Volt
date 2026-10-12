/**
 * Pure pricing and estimate logic. Takes an already validated configuration
 * (see validateConfig in useVehicleConfig.js) and the catalog lookups.
 */
export function priceConfig(cfg, lookup) {
  const v = lookup.vehicles[cfg.model]
  const paint = lookup.colors[cfg.paint]
  const wheel = lookup.wheels[cfg.wheels]
  const interior = lookup.interiors[cfg.interior]
  const lines = [
    { key: 'model', label: v.name, detail: v.body, price: v.basePrice },
    { key: 'paint', label: paint.name, detail: `${paint.finish} paint`, price: paint.price },
    { key: 'wheels', label: wheel.name, detail: wheel.finish, price: wheel.price },
    { key: 'interior', label: interior.name, detail: interior.material, price: interior.price }
  ]
  let range = v.specs.range + wheel.rangeDelta
  let accel = v.specs.accel
  let power = v.specs.power
  for (const id of cfg.packages) {
    const p = lookup.packages[id]
    const standard = v.standardPackages.includes(id)
    lines.push({ key: `pkg-${id}`, label: p.name, detail: standard ? 'Standard on this model' : p.summary, price: standard ? 0 : p.price, included: standard })
    // Standard packages are already reflected in the model's own figures
    if (!standard) {
      range += p.rangeDelta || 0
      accel += p.accelDelta || 0
      if (id === 'performance') power += 60
    }
  }
  const total = lines.reduce((s, l) => s + l.price, 0)
  return { lines, total, options: total - v.basePrice, range: Math.round(range), accel: Math.round(accel * 10) / 10, power }
}
