// Rail mode: must remain identical to @custom-variant short and @media :root in src/index.css
export const SHORT_SCREEN_QUERY = '(orientation: landscape) and (max-height: 600px), (orientation: landscape) and (max-width: 1023px) and (max-height: 660px)'

// About me displays in two swipeable pages on windows <768px and short screens (rail mode) <1024px; matches SHORT_SCREEN_QUERY constrained to 1023px
export const ABOUT_PAGED_QUERY = '(max-width: 767px), (orientation: landscape) and (max-width: 1023px) and (max-height: 660px)'

export const INNER_SCROLL_QUERY = '(max-width: 767.98px) and (pointer: coarse)'

/**
 * Returns true if current device should use internal scroll container
 * (narrow screens with touch/coarse pointer).
 * Returns false in SSR or if matchMedia is unavailable.
 *
 * @returns {boolean}
 */
export function usesInnerScroll() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.(INNER_SCROLL_QUERY)?.matches === true
}
