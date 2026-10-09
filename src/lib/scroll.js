export function scrollToElement(el, options = {}) {
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: options.behavior || (reduce ? 'auto' : 'smooth'), block: 'start' })
}
