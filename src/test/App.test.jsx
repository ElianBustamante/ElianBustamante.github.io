import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from '../App'
import '../i18n'
import { INNER_SCROLL_QUERY } from '../lib/media'

describe('App scroll mode (inner-scroll vs window)', () => {
  const originalMatchMedia = window.matchMedia
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView
    vi.restoreAllMocks()
  })

  it('el div raíz usa clases inner-scroll: y no max-md: para el scroll interno', () => {
    const { container } = render(<App />)
    const rootDiv = container.firstElementChild
    expect(rootDiv.className).toContain('inner-scroll:min-h-0')
    expect(rootDiv.className).toContain('inner-scroll:h-[100dvh]')
    expect(rootDiv.className).toContain('inner-scroll:overflow-y-auto')
    expect(rootDiv.className).toContain('inner-scroll:snap-y')
    expect(rootDiv.className).toContain('inner-scroll:snap-mandatory')
    expect(rootDiv.className).toContain('[@media(orientation:portrait)_and_(max-height:600px)]:snap-none')
    expect(rootDiv.className).not.toContain('max-md:overflow-y-auto')
    expect(rootDiv.className).not.toContain('max-md:h-[100dvh]')
  })

  it('todas las secciones tienen snap-start y el footer tiene snap-end para el scroll snap', () => {
    const { container } = render(<App />)
    const sections = Array.from(container.querySelectorAll('section'))
    expect(sections.length).toBeGreaterThanOrEqual(5)
    sections.forEach((sec) => {
      expect(sec.className).toContain('snap-start')
    })
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(footer.className).toContain('snap-end')
  })

  it('con ratón (pointer: fine) y ancho <768px, el wheel no es bloqueado por usesInnerScroll', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    window.innerWidth = 500

    render(<App />)

    const wheelEvent = new Event('wheel', { bubbles: true, cancelable: true })
    Object.defineProperty(wheelEvent, 'deltaY', { value: 50 })
    Object.defineProperty(wheelEvent, 'deltaX', { value: 0 })
    document.dispatchEvent(wheelEvent)

    expect(wheelEvent.defaultPrevented).toBe(true)
  })

  it('con táctil (pointer: coarse) y ancho <768px, el wheel se ignora para permitir scroll nativo táctil', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === INNER_SCROLL_QUERY,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    window.innerWidth = 500

    render(<App />)

    const wheelEvent = new Event('wheel', { bubbles: true, cancelable: true })
    Object.defineProperty(wheelEvent, 'deltaY', { value: 50 })
    Object.defineProperty(wheelEvent, 'deltaX', { value: 0 })
    document.dispatchEvent(wheelEvent)

    expect(wheelEvent.defaultPrevented).toBe(false)
  })
})
