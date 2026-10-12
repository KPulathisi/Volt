// Shared motion setup: GSAP plugins, Lenis smooth scrolling and a reduced-motion flag.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin)

export const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
export const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

let lenis = null

/** Smooth scrolling with Lenis, driven by GSAP's ticker so ScrollTrigger stays in sync. Native scroll if reduced motion. */
export function startSmoothScroll() {
  if (reducedMotion || lenis) return lenis
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollToTarget(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4, ...opts })
  else if (typeof target === 'number') window.scrollTo({ top: target })
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView()
}

export function stopScroll(stop) {
  if (!lenis) { document.documentElement.style.overflow = stop ? 'hidden' : ''; return }
  stop ? lenis.stop() : lenis.start()
}

export { gsap, ScrollTrigger, SplitText, Flip }
