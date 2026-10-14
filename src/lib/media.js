export const SHORT_SCREEN_QUERY = '(orientation: landscape) and (max-height: 520px), (orientation: landscape) and (max-width: 1023px) and (max-height: 660px)'

export const INNER_SCROLL_QUERY = '(max-width: 767.98px) and (pointer: coarse)'

/**
 * Devuelve true si el dispositivo actual debe usar el contenedor interno de scroll
 * (pantallas angostas con puntero táctil/coarse).
 * Devuelve false en SSR o si matchMedia no está disponible.
 *
 * @returns {boolean}
 */
export function usesInnerScroll() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.(INNER_SCROLL_QUERY)?.matches === true
}
