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

  it('todas las secciones tienen snap-start y el footer está dentro de #contacto con role="contentinfo" sin snap-end', () => {
    const { container } = render(<App />)
    const sections = Array.from(container.querySelectorAll('section'))
    expect(sections).toHaveLength(5)
    sections.forEach((sec) => {
      expect(sec.className).toContain('snap-start')
    })
    const contactSection = container.querySelector('section#contacto')
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(contactSection).toContainElement(footer)
    expect(footer).toHaveAttribute('role', 'contentinfo')
    expect(footer.className).not.toContain('snap-end')
  })

  it('el controlador de diapositivas cuenta solo section (5 diapositivas) y no desplaza al footer como diapositiva extra al estar en #contacto', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    window.innerWidth = 1024
    window.innerHeight = 800

    const { container } = render(<App />)
    const sections = Array.from(container.querySelectorAll('section'))
    expect(sections).toHaveLength(5)
    expect(sections[sections.length - 1].id).toBe('contacto')

    // Simulamos que la sección activa (más cercana a top=0) es la última (#contacto, índice 4)
    sections.forEach((sec, idx) => {
      vi.spyOn(sec, 'getBoundingClientRect').mockReturnValue({
        top: (idx - 4) * 800,
        bottom: (idx - 3) * 800,
        height: 800,
        left: 0,
        right: 1024,
        width: 1024,
      })
    })

    const wheelDown = new Event('wheel', { bubbles: true, cancelable: true })
    Object.defineProperty(wheelDown, 'deltaY', { value: 80 })
    Object.defineProperty(wheelDown, 'deltaX', { value: 0 })
    Object.defineProperty(wheelDown, 'timeStamp', { value: 100 })
    document.dispatchEvent(wheelDown)

    expect(wheelDown.defaultPrevented).toBe(true)
    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
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

  it('eventos de rueda con deltaY pequeño llaman preventDefault y desbloquean al disparar scrollend', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    window.innerWidth = 1024

    render(<App />)

    const smallWheel = new Event('wheel', { bubbles: true, cancelable: true })
    Object.defineProperty(smallWheel, 'deltaY', { value: 2 })
    Object.defineProperty(smallWheel, 'deltaX', { value: 0 })
    Object.defineProperty(smallWheel, 'timeStamp', { value: 10 })
    document.dispatchEvent(smallWheel)

    expect(smallWheel.defaultPrevented).toBe(true)
    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()

    const bigWheel = new Event('wheel', { bubbles: true, cancelable: true })
    Object.defineProperty(bigWheel, 'deltaY', { value: 50 })
    Object.defineProperty(bigWheel, 'deltaX', { value: 0 })
    Object.defineProperty(bigWheel, 'timeStamp', { value: 20 })
    document.dispatchEvent(bigWheel)

    expect(bigWheel.defaultPrevented).toBe(true)
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)

    window.dispatchEvent(new Event('scrollend'))

    const nextGestureWheel = new Event('wheel', { bubbles: true, cancelable: true })
    Object.defineProperty(nextGestureWheel, 'deltaY', { value: 50 })
    Object.defineProperty(nextGestureWheel, 'deltaX', { value: 0 })
    Object.defineProperty(nextGestureWheel, 'timeStamp', { value: 500 })
    document.dispatchEvent(nextGestureWheel)

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(2)
  })
})
