import { onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { scrollToTarget } from './useMotion.js'

/** Scroll to /page#section anchors after the page has rendered (hash routing keeps them in the path). */
export function useHashScroll() {
  const route = useRoute()
  onMounted(async () => {
    if (!route.hash) return
    await nextTick()
    setTimeout(() => {
      const el = document.getElementById(route.hash.slice(1))
      if (!el) return
      scrollToTarget(el, { offset: -70, immediate: true })
      if (!document.documentElement.classList.contains('lenis')) el.scrollIntoView()
    }, 650)
  })
}

/** Scroll to an element id on the current page, smoothly when possible */
export function goTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (document.documentElement.classList.contains('lenis')) scrollToTarget(el, { offset: -60 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
