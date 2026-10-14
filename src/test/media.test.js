import { describe, it, expect, vi, afterEach } from 'vitest'
import { INNER_SCROLL_QUERY, SHORT_SCREEN_QUERY, usesInnerScroll } from '../lib/media'

describe('media queries and helpers', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('exporta INNER_SCROLL_QUERY correctamente', () => {
    expect(INNER_SCROLL_QUERY).toBe('(max-width: 767.98px) and (pointer: coarse)')
  })

  it('exporta SHORT_SCREEN_QUERY correctamente', () => {
    expect(SHORT_SCREEN_QUERY).toBe('(orientation: landscape) and (max-height: 520px), (orientation: landscape) and (max-width: 1023px) and (max-height: 660px)')
  })

  it('usesInnerScroll devuelve false si matchMedia no existe', () => {
    delete window.matchMedia
    expect(usesInnerScroll()).toBe(false)
  })

  it('usesInnerScroll devuelve true si la query coincide', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === INNER_SCROLL_QUERY,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    expect(usesInnerScroll()).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith(INNER_SCROLL_QUERY)
  })

  it('usesInnerScroll devuelve false si la query no coincide', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    expect(usesInnerScroll()).toBe(false)
  })
})
