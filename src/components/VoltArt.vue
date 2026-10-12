<script setup>
/**
 * Animated placeholder artwork shown in every media slot until a real photo or video is added.
 * Each scene is drawn in SVG with slow CSS motion, matching the slot's subject.
 */
import CarSVG from './CarSVG.vue'
defineProps({ scene: { type: String, default: 'studio' }, model: { type: String, default: 'one' } })
const id = `v${Math.random().toString(36).slice(2, 8)}`
const paintFor = (m) => ({ one: '#4a4e54', touring: '#1b3550', performance: '#e0531f' })[m] || '#4a4e54'
</script>

<template>
  <div :class="['va', scene]">
    <!-- STUDIO / MODELS -->
    <template v-if="scene === 'studio'">
      <div class="cone"></div>
      <div class="car-wrap"><CarSVG :model="model" :paint="paintFor(model)" :wheel="model === 'performance' ? 'blade' : 'aero'" :performance="model === 'performance'" /></div>
      <div class="reflect"><CarSVG :model="model" :paint="paintFor(model)" :wheel="model === 'performance' ? 'blade' : 'aero'" :floor="false" :lights="false" /></div>
    </template>

    <!-- NIGHT ROAD -->
    <template v-else-if="scene === 'road'">
      <svg class="full" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient :id="`${id}s`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070a" /><stop offset=".55" stop-color="#14202b" /><stop offset=".62" stop-color="#0a0c0e" /></linearGradient></defs>
        <rect width="1600" height="700" :fill="`url(#${id}s)`" />
        <g class="streaks" stroke="#c5f23a" stroke-opacity=".35"><line x1="0" y1="560" x2="1600" y2="560" stroke-dasharray="80 220" /><line x1="0" y1="640" x2="1600" y2="640" stroke-dasharray="140 300" stroke="#fff" stroke-opacity=".12" /></g>
        <g fill="#fff" opacity=".5"><circle v-for="k in 9" :key="k" :cx="k * 170" :cy="380 + (k % 3) * 6" r="2" /></g>
      </svg>
      <div class="car-wrap road-car"><CarSVG model="one" paint="#3a3e44" /></div>
    </template>

    <!-- AERO -->
    <template v-else-if="scene === 'aero'">
      <svg class="full" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="800" height="1000" fill="#0c0e10" />
        <g class="flow" fill="none" stroke="#e8ecef" stroke-opacity=".45" stroke-width="1.2">
          <path v-for="k in 12" :key="k" :d="`M-50,${380 + k * 22} C200,${360 + k * 22 - (k < 6 ? 90 - k * 12 : 0)} 520,${350 + k * 20 - (k < 7 ? 80 - k * 10 : 0)} 900,${390 + k * 24}`" stroke-dasharray="6 14" />
        </g>
      </svg>
      <div class="car-wrap aero-car"><CarSVG model="one" paint="#33363a" :lights="false" /></div>
    </template>

    <!-- LIGHT -->
    <template v-else-if="scene === 'light'">
      <svg class="full" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient :id="`${id}g`" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></radialGradient>
          <linearGradient :id="`${id}n`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1c1f" /><stop offset="1" stop-color="#060708" /></linearGradient>
        </defs>
        <rect width="800" height="1000" fill="#050607" />
        <path d="M-40,560 C120,420 680,420 840,560 L840,800 L-40,800 Z" :fill="`url(#${id}n)`" />
        <ellipse class="glow" cx="400" cy="505" rx="380" ry="60" :fill="`url(#${id}g)`" />
        <path class="bar" d="M60,512 C200,470 600,470 740,512" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M60,880 C200,860 600,860 740,880" stroke="#fff" stroke-opacity=".12" stroke-width="10" fill="none" />
      </svg>
    </template>

    <!-- INTERIOR -->
    <template v-else-if="scene === 'interior'">
      <svg class="full" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient :id="`${id}w`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2f35" /><stop offset=".5" stop-color="#111316" /></linearGradient></defs>
        <rect width="800" height="1000" :fill="`url(#${id}w)`" />
        <path d="M0,330 Q400,250 800,330 L800,360 Q400,290 0,360 Z" fill="#000" opacity=".5" />
        <rect x="70" y="430" width="660" height="34" rx="17" fill="#2c2e33" />
        <rect class="screen" x="300" y="360" width="200" height="110" rx="10" fill="#0b0c0e" stroke="#3a3e44" />
        <path d="M320,430 L360,410 L400,420 L440,395 L480,405" stroke="#c5f23a" stroke-width="3" fill="none" />
        <path d="M60,1000 L80,620 Q90,560 160,555 L300,555 Q350,560 350,620 L360,1000 Z" fill="#d9d4c7" />
        <path d="M440,1000 L450,620 Q450,560 500,555 L640,555 Q710,560 720,620 L740,1000 Z" fill="#cfc9bb" />
        <path d="M110,600 L320,600 M480,600 L690,600" stroke="#c5f23a" stroke-opacity=".7" stroke-dasharray="4 6" />
      </svg>
    </template>

    <!-- INTERFACE / HUD -->
    <template v-else-if="scene === 'interface'">
      <svg class="full" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="800" height="1000" fill="#07090b" />
        <g class="bokeh"><circle v-for="k in 14" :key="k" :cx="(k * 97) % 800" :cy="200 + (k * 53) % 260" :r="10 + (k % 4) * 8" :fill="k % 3 ? '#e9d7a8' : '#c5f23a'" :opacity="0.08 + (k % 3) * 0.04" /></g>
        <path d="M0,650 Q400,560 800,650 L800,1000 L0,1000 Z" fill="#0d0f12" />
        <text x="400" y="430" text-anchor="middle" class="hud-num">88</text>
        <text x="400" y="462" text-anchor="middle" class="hud-unit">KM/H</text>
        <path class="arrow" d="M400,560 L400,500 M380,520 L400,498 L420,520" stroke="#c5f23a" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="400" cy="900" r="170" fill="none" stroke="#1f2226" stroke-width="22" />
      </svg>
    </template>

    <!-- WHEEL -->
    <template v-else-if="scene === 'wheel'">
      <svg class="full" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="900" height="600" fill="#08090a" />
        <circle cx="450" cy="300" r="250" fill="#111214" />
        <circle cx="450" cy="300" r="185" fill="#9aa0a6" />
        <circle cx="450" cy="300" r="185" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" />
        <g class="spin"><rect v-for="k in 5" :key="k" x="420" y="150" width="60" height="14" rx="7" fill="#3a3d42" :transform="`rotate(${k * 72} 450 300)`" /></g>
        <circle cx="450" cy="300" r="22" fill="#151619" />
        <path d="M210,190 A260,260 0 0 1 560,60" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none" />
      </svg>
    </template>

    <!-- CHARGE -->
    <template v-else-if="scene === 'charge'">
      <svg class="full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="1600" height="900" fill="#090b0d" />
        <rect x="1180" y="250" width="90" height="420" fill="#16191c" />
        <rect x="1196" y="290" width="58" height="80" fill="#0b0c0e" />
        <g class="pulse"><rect v-for="k in 4" :key="k" :x="1206" :y="350 - k * 14" width="38" height="8" fill="#c5f23a" :style="{ animationDelay: `${k * 0.25}s` }" /></g>
        <path d="M1180,520 C1050,560 980,600 900,560" stroke="#222" stroke-width="14" fill="none" />
      </svg>
      <div class="car-wrap charge-car"><CarSVG model="one" paint="#e9eaec" /></div>
    </template>

    <!-- REAR -->
    <template v-else-if="scene === 'rear'">
      <svg class="full" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="900" height="600" fill="#0a0b0c" />
        <path d="M120,420 C200,250 700,250 780,420 L780,470 L120,470 Z" fill="#1d2024" />
        <path d="M200,300 C350,240 550,240 700,300 L680,330 C540,280 360,280 220,330 Z" fill="#050607" />
        <path class="bar red" d="M150,380 C320,350 580,350 750,380" stroke="#ff2a2a" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M150,560 C320,545 580,545 750,560" stroke="#ff2a2a" stroke-opacity=".18" stroke-width="12" fill="none" />
      </svg>
    </template>
  </div>
</template>

<style scoped>
.va { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(ellipse at 50% 35%, #1b1e22 0%, #0a0b0d 60%, #060708 100%); }
.full { position: absolute; inset: 0; width: 100%; height: 100%; }
.cone { position: absolute; left: 20%; right: 20%; top: -10%; height: 85%; background: radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, .16), transparent 70%); animation: breathe 7s ease-in-out infinite; }
.car-wrap { position: absolute; left: 10%; right: 10%; bottom: 22%; }
.reflect { position: absolute; left: 10%; right: 10%; bottom: 22%; transform: scaleY(-1) translateY(-100%); opacity: .12; -webkit-mask-image: linear-gradient(to top, #000, transparent 45%); mask-image: linear-gradient(to top, #000, transparent 45%); }
.road-car { left: 18%; right: 18%; bottom: 13%; }
.aero-car { left: -10%; right: -10%; bottom: 36%; }
.charge-car { left: 8%; right: 34%; bottom: 18%; }
.streaks line { animation: dash 2.4s linear infinite; }
.flow path { animation: dash 3.2s linear infinite; }
.glow { animation: breathe 4s ease-in-out infinite; transform-origin: center; }
.bar { animation: flicker 4s ease-in-out infinite; }
.screen { animation: breathe 6s ease-in-out infinite; }
.hud-num { font: 600 92px var(--display); font-stretch: 125%; fill: #f2f3f1; opacity: .85; }
.hud-unit { font: 500 18px var(--mono); letter-spacing: .3em; fill: #8d939b; }
.arrow { animation: breathe 3s ease-in-out infinite; }
.spin { transform-origin: 450px 300px; animation: rot 12s linear infinite; }
.pulse rect { animation: blink 1.6s ease-in-out infinite; }
@keyframes dash { to { stroke-dashoffset: -600; } }
@keyframes breathe { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }
@keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: .82; } }
@keyframes rot { to { transform: rotate(360deg); } }
@keyframes blink { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
</style>
