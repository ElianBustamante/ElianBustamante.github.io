import { readFileSync } from 'node:fs'
import { URL } from 'node:url'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { ABOUT_PAGED_QUERY, INNER_SCROLL_QUERY, SHORT_SCREEN_QUERY, usesInnerScroll } from '../lib/media'

describe('media queries and helpers', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('exports INNER_SCROLL_QUERY correctly', () => {
    expect(INNER_SCROLL_QUERY).toBe('(max-width: 767.98px) and (pointer: coarse)')
  })

  it('exports SHORT_SCREEN_QUERY correctly', () => {
    expect(SHORT_SCREEN_QUERY).toBe('(orientation: landscape) and (max-height: 600px), (orientation: landscape) and (max-width: 1023px) and (max-height: 660px)')
  })

  it('exports ABOUT_PAGED_QUERY correctly', () => {
    expect(ABOUT_PAGED_QUERY).toBe('(max-width: 767px), (orientation: landscape) and (max-width: 1023px) and (max-height: 660px)')
  })

  it('SHORT_SCREEN_QUERY appears verbatim twice in src/index.css (@custom-variant short and :root)', () => {
    const cssPath = '../index.css'
    const cssUrl = new URL(cssPath, import.meta.url)
    const css = readFileSync(cssUrl, 'utf8')
    const occurrences = css.split(SHORT_SCREEN_QUERY).length - 1
    expect(occurrences).toBe(2)
  })

  it('usesInnerScroll returns false if matchMedia does not exist', () => {
    delete window.matchMedia
    expect(usesInnerScroll()).toBe(false)
  })

  it('usesInnerScroll returns true if the query matches', () => {
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

  it('usesInnerScroll returns false if the query does not match', () => {
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
