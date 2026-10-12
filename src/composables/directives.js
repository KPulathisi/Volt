// Small, reusable scroll-animation directives. All are no-ops under reduced motion.
import { gsap, ScrollTrigger, SplitText, reducedMotion, isDesktop } from './useMotion.js'

const store = new WeakMap()
const keep = (el, ...items) => store.set(el, [...(store.get(el) || []), ...items])
const cleanup = (el) => { (store.get(el) || []).forEach((x) => x?.revert?.() ?? x?.kill?.()); store.delete(el) }

/** v-split: headline lines rise out of masks when they enter the viewport. Use v-split.now for the hero. */
export const vSplit = {
  mounted(el, binding) {
    if (reducedMotion) return
    document.fonts?.ready.then(() => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line-inner' })
      const tween = gsap.from(split.lines, {
        yPercent: 110, duration: 1.15, ease: 'expo.out', stagger: 0.09, delay: binding.value?.delay ?? 0,
        scrollTrigger: binding.modifiers.now ? undefined : { trigger: el, start: 'top 88%', once: true }
      })
      keep(el, tween, split)
    })
  },
  unmounted: cleanup
}

/** v-reveal: images and media uncover with a clip-path wipe. v-reveal.up | .left | .center */
export const vReveal = {
  mounted(el, binding) {
    if (reducedMotion) return
    const dir = Object.keys(binding.modifiers)[0] || 'up'
    const from = { up: 'inset(100% 0% 0% 0%)', left: 'inset(0% 100% 0% 0%)', center: 'inset(18% 18% 18% 18%)' }[dir]
    const tween = gsap.fromTo(el, { clipPath: from }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    })
    const inner = el.querySelector('img, video, svg')
    const z = inner ? gsap.from(inner, { scale: 1.25, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }) : null
    keep(el, tween, z)
  },
  unmounted: cleanup
}

/** v-parallax="0.15": gentle vertical drift of the inner media while scrolling (desktop only). */
export const vParallax = {
  mounted(el, binding) {
    if (reducedMotion || !isDesktop()) return
    const amt = binding.value ?? 0.15
    const target = el.querySelector('.mf-inner') || el.firstElementChild || el
    gsap.set(target, { scale: 1 + amt * 1.2 })
    const tween = gsap.fromTo(target, { yPercent: -amt * 50 }, { yPercent: amt * 50, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    keep(el, tween)
  },
  unmounted: cleanup
}

/** v-fade: simple rise-and-fade for text blocks, optionally staggering children with v-fade.children */
export const vFade = {
  mounted(el, binding) {
    if (reducedMotion) return
    const targets = binding.modifiers.children ? el.children : el
    const tween = gsap.from(targets, { y: 34, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
    keep(el, tween)
  },
  unmounted: cleanup
}

export function installDirectives(app) {
  app.directive('split', vSplit)
  app.directive('reveal', vReveal)
  app.directive('parallax', vParallax)
  app.directive('fade', vFade)
}

export { ScrollTrigger }
