export function scrollToElement(el, options = {}) {
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: options.behavior || (reduce ? 'auto' : 'smooth'), block: 'start' })
}

/**
 * Devuelve true si el desplazamiento respecto al tope está dentro del rango que amerita ajuste fino.
 *
 * @param {number} top Distancia al borde superior (getBoundingClientRect().top).
 * @param {number} [maxOffset=6] Desplazamiento máximo a corregir en píxeles.
 * @param {number} [epsilon=0.25] Desplazamiento mínimo perceptible en píxeles.
 * @returns {boolean}
 */
export function needsSettle(top, maxOffset = 6, epsilon = 0.25) {
  const abs = Math.abs(top)
  return abs > epsilon && abs <= maxOffset
}

/**
 * Espera a que el scroll suave termine para asentar la sección si quedó a pocos píxeles del tope.
 * Si el usuario interactúa durante la espera o reduce-motion está activo, cancela sin corregir.
 *
 * @param {HTMLElement} el Elemento destino.
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
