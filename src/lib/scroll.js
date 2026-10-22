export function scrollToElement(el, options = {}) {
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: options.behavior || (reduce ? 'auto' : 'smooth'), block: 'start' })
}

/**
 * Returns true if offset from the top is within range for fine settling.
 *
 * @param {number} top Distance to top edge (getBoundingClientRect().top).
 * @param {number} [maxOffset=6] Maximum offset to correct in pixels.
 * @param {number} [epsilon=0.25] Minimum perceptible offset in pixels.
 * @returns {boolean}
 */
export function needsSettle(top, maxOffset = 6, epsilon = 0.25) {
  const abs = Math.abs(top)
  return abs > epsilon && abs <= maxOffset
}

/**
 * Waits for smooth scroll to finish to settle section if left a few pixels from the top.
 * Cancels without correcting if the user interacts or reduce-motion is active.
 *
 * @param {HTMLElement} el Target element.
 * @param {object} [options]
 * @param {number} [options.maxOffset=6]
 * @param {number} [options.idleMs=140]
 * @param {number} [options.timeoutMs=1500]
 */
export function settleScroll(el, { maxOffset = 6, idleMs = 140, timeoutMs = 1500 } = {}) {
  if (!el) return
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (reduce) return

  let idleTimer = null
  let timeoutTimer = null

  const cleanup = () => {
    if (idleTimer) clearTimeout(idleTimer)
    if (timeoutTimer) clearTimeout(timeoutTimer)
    idleTimer = null
    timeoutTimer = null
    document.removeEventListener('scroll', onScroll, { capture: true })
    document.removeEventListener('wheel', onInteraction, { capture: true })
    document.removeEventListener('touchstart', onInteraction, { capture: true })
    document.removeEventListener('keydown', onInteraction, { capture: true })
    document.removeEventListener('pointerdown', onInteraction, { capture: true })
  }

  const settle = () => {
    cleanup()
    const top = el.getBoundingClientRect ? el.getBoundingClientRect().top : 0
    if (needsSettle(top, maxOffset)) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
  }

  const onInteraction = () => {
    cleanup()
  }

  const onScroll = () => {
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(settle, idleMs)
  }

  idleTimer = setTimeout(settle, idleMs)
  timeoutTimer = setTimeout(settle, timeoutMs)

  document.addEventListener('scroll', onScroll, { capture: true, passive: true })
  document.addEventListener('wheel', onInteraction, { capture: true, passive: true })
  document.addEventListener('touchstart', onInteraction, { capture: true, passive: true })
  document.addEventListener('keydown', onInteraction, { capture: true, passive: true })
  document.addEventListener('pointerdown', onInteraction, { capture: true, passive: true })
}
