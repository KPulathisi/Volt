/**
 * A small studio scene around the procedural car: renderer, environment lighting, soft floor,
 * orbit controls and an on-demand render loop (it stops drawing when nothing is moving
 * or the canvas is off-screen).
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { gsap } from 'gsap'
import { createMaterials, buildCar, applyFinishes } from './carModel.js'

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch { return false }
}

export const VIEWS = {
  front34: { az: 0.95, el: 0.2, dist: 6.6 },
  side: { az: 0, el: 0.08, dist: 7 },
  rear34: { az: -0.95, el: 0.22, dist: 6.6 },
  front: { az: Math.PI / 2, el: 0.12, dist: 6 },
  top: { az: 0.6, el: 1.05, dist: 7.2 },
  wheel: { az: 0.55, el: 0.06, dist: 3.4, target: [1.4, 0.4, 0.6] }
}

function radialTexture(inner, outer, size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, inner)
  grd.addColorStop(1, outer)
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export class CarStage {
  constructor(canvas, { interactive = true, autoRotate = false, view = 'front34', exposure = 1.05, onRender = null } = {}) {
    this.canvas = canvas
    this.onRender = onRender
    const small = window.matchMedia('(max-width: 767px)').matches
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = exposure
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environment = this.envTex
    this.scene.environmentIntensity = 0.72
    pmrem.dispose()

    const key = new THREE.DirectionalLight('#ffffff', 1.6)
    key.position.set(3, 6, 4)
    const rim = new THREE.DirectionalLight('#dfe8ff', 1.2)
    rim.position.set(-5, 3, -4)
    this.scene.add(key, rim)

    // floor: a soft pool of light that fades into the page background
    const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshStandardMaterial({ color: '#16181b', roughness: 0.42, metalness: 0.3, transparent: true, alphaMap: radialTexture('#ffffff', '#000000'), depthWrite: false }))
    floor.rotation.x = -Math.PI / 2
    this.scene.add(floor)
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.95)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }))
    this.shadow.rotation.x = -Math.PI / 2
    this.shadow.position.y = 0.002
    this.scene.add(this.shadow)

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    this.target = new THREE.Vector3(0, 0.62, 0)
    this.orbit = { ...VIEWS[view] }
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enabled = interactive
    this.controls.enableDamping = true
    this.controls.enablePan = false
    this.controls.minDistance = 3.2
    this.controls.maxDistance = 10
    this.controls.minPolarAngle = 0.25
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04
    this.controls.autoRotate = autoRotate
    this.controls.autoRotateSpeed = 0.6
    this.controls.target.copy(this.target)
    this.controls.addEventListener('start', () => { this.lastInput = performance.now(); this.controls.autoRotate = false; this.userMoved = true })
    this.controls.addEventListener('change', () => this.wake())
    this.applyOrbit(this.orbit)

    this.mats = createMaterials()
    this.spinSpeed = 0
    this.active = false
    this.busyUntil = 0
    this.lastInput = 0
    this.wantAutoRotate = autoRotate
    this.clock = new THREE.Clock()

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.resize()
  }

  wake(ms = 1200) { this.busyUntil = Math.max(this.busyUntil, performance.now() + ms) }

  resize() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // pull back on narrow (portrait) canvases so the whole car stays in frame
    this.camera.zoom = Math.min(1, (w / h) / 1.45)
    this.camera.updateProjectionMatrix()
    this.wake()
    this.renderOnce()
  }

  /** Place the camera from spherical values: az (around the car), el (height angle), dist */
  applyOrbit({ az, el, dist, target }) {
    const t = target ? new THREE.Vector3(...target) : this.target
    this.controls.target.copy(t)
    this.camera.position.set(t.x + Math.sin(az) * dist * Math.cos(el), t.y + Math.sin(el) * dist, t.z + Math.cos(az) * dist * Math.cos(el))
    this.camera.lookAt(t)
    this.controls.update()
    this.wake()
  }

  setView(name, animate = true) {
    const v = VIEWS[name]
    if (!v) return
    const from = this.currentOrbit()
    const to = { az: v.az, el: v.el, dist: v.dist, tx: v.target?.[0] ?? 0, ty: v.target?.[1] ?? 0.62, tz: v.target?.[2] ?? 0 }
    // take the short way round
    while (to.az - from.az > Math.PI) to.az -= Math.PI * 2
    while (from.az - to.az > Math.PI) to.az += Math.PI * 2
    this.controls.autoRotate = false
    if (!animate) return this.applyOrbit({ ...to, target: [to.tx, to.ty, to.tz] })
    gsap.to(from, { ...to, duration: 1.4, ease: 'power3.inOut', onUpdate: () => this.applyOrbit({ ...from, target: [from.tx, from.ty, from.tz] }) })
  }

  currentOrbit() {
    const t = this.controls.target, d = this.camera.position.clone().sub(t)
    const dist = d.length()
    return { az: Math.atan2(d.x, d.z), el: Math.asin(d.y / dist), dist, tx: t.x, ty: t.y, tz: t.z }
  }

  /** (Re)build the car. Finishes animate; shape changes rebuild with a short dip. */
  setVehicle(vehicle, parts, { animate = true } = {}) {
    const key = [vehicle.id, parts.wheel.id, parts.packages.map((p) => p.id).join('+')].join('|')
    if (key !== this.buildKey) {
      const swap = () => {
        if (this.built) { this.scene.remove(this.built.car); this.disposeGroup(this.built.car) }
        this.built = buildCar(vehicle, parts, this.mats)
        this.scene.add(this.built.car)
        const { L, W } = this.built.profile
        this.shadow.scale.set(L * 1.25, W * 1.55, 1)
        this.buildKey = key
        this.wake()
      }
      if (this.built && animate) {
        const car = this.built.car
        gsap.to(car.position, { y: -0.04, duration: 0.18, ease: 'power2.in', onUpdate: () => this.wake(), onComplete: () => {
          swap()
          gsap.fromTo(this.built.car.position, { y: -0.04 }, { y: 0, duration: 0.5, ease: 'back.out(2)', onUpdate: () => this.wake() })
        } })
      } else swap()
    }
    applyFinishes(this.mats, parts, gsap, !animate || !this.finishedOnce)
    this.finishedOnce = true
    this.wake(1300)
  }

  /** 0..1, used for the light bar welcome animation */
  setLights(v) {
    this.mats.lightFront.color.setScalar(v)
    this.mats.lightRear.color.setRGB(v, v * 0.16, v * 0.16)
    this.wake()
  }

  setSpin(speed) { this.spinSpeed = speed; if (speed) this.wake() }

  project(vec) {
    const v = vec.clone().project(this.camera)
    return { x: (v.x * 0.5 + 0.5) * this.canvas.clientWidth, y: (-v.y * 0.5 + 0.5) * this.canvas.clientHeight, visible: v.z < 1 }
  }

  frame = () => {
    const now = performance.now()
    const dt = Math.min(0.05, this.clock.getDelta())
    // resume the slow turntable after a while without input
    if (this.wantAutoRotate && !this.controls.autoRotate && this.userMoved && now - this.lastInput > 9000) this.controls.autoRotate = true
    const moving = this.controls.autoRotate || this.spinSpeed !== 0 || now < this.busyUntil
    if (!moving) return
    if (this.spinSpeed && this.built) this.built.spins.forEach((s, i) => (s.rotation.z -= this.spinSpeed * dt * (i % 2 ? -1 : 1)))
    this.controls.update(dt)
    this.renderer.render(this.scene, this.camera)
    this.onRender?.(this)
  }

  renderOnce() {
    this.renderer.render(this.scene, this.camera)
    this.onRender?.(this)
  }

  start() { if (!this.active) { this.active = true; this.clock.getDelta(); this.wake(); this.renderer.setAnimationLoop(this.frame) } }
  stop() { this.active = false; this.renderer.setAnimationLoop(null) }

  snapshot(type = 'image/png') {
    this.renderer.render(this.scene, this.camera)
    return this.canvas.toDataURL(type)
  }

  disposeGroup(g) {
    g.traverse((o) => { if (o.geometry) o.geometry.dispose() })
  }

  dispose() {
    this.stop()
    this.ro.disconnect()
    this.controls.dispose()
    if (this.built) this.disposeGroup(this.built.car)
    Object.values(this.mats).forEach((m) => m.dispose())
    this.envTex.dispose()
    this.renderer.dispose()
  }
}
