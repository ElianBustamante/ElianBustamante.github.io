import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scrollToElement, needsSettle, settleScroll } from '../lib/scroll'

describe('scroll logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  describe('needsSettle', () => {
    it('evalúa correctamente los valores especificados (0, 0.1, 1, 5.9, 6, 7, -1, -7)', () => {
      // Math.abs(top) > 0.25 && Math.abs(top) <= 6
      expect(needsSettle(0)).toBe(false)
      expect(needsSettle(0.1)).toBe(false)
      expect(needsSettle(1)).toBe(true)
      expect(needsSettle(5.9)).toBe(true)
      expect(needsSettle(6)).toBe(true)
      expect(needsSettle(7)).toBe(false)
      expect(needsSettle(-1)).toBe(true)
      expect(needsSettle(-7)).toBe(false)
    })

    it('respeta parámetros personalizados maxOffset y epsilon', () => {
      expect(needsSettle(0.2, 10, 0.1)).toBe(true)
      expect(needsSettle(0.05, 10, 0.1)).toBe(false)
      expect(needsSettle(11, 10, 0.1)).toBe(false)
    })
  })

  describe('scrollToElement', () => {
    it('no falla si el elemento es nulo', () => {
      expect(() => scrollToElement(null)).not.toThrow()
    })

    it('llama a scrollIntoView con smooth por defecto', () => {
      const el = { scrollIntoView: vi.fn() }
      scrollToElement(el)
      expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    })
  })

  describe('settleScroll', () => {
    it('no hace nada si el elemento es nulo', () => {
      expect(() => settleScroll(null)).not.toThrow()
    })

    it('no hace nada si prefers-reduced-motion está activo', () => {
      const matchMediaMock = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
      vi.stubGlobal('matchMedia', matchMediaMock)

      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el)
      vi.advanceTimersByTime(200)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('espera a que el scroll quede en reposo (idleMs) y corrige si needsSettle es true', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 3.5 }),
      }

      settleScroll(el, { maxOffset: 6, idleMs: 140 })

      // Dispara un evento scroll para reiniciar el temporizador idle
      document.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(100)
      expect(el.scrollIntoView).not.toHaveBeenCalled()

      // Pasan 140ms adicionales sin scroll -> entra en reposo
      vi.advanceTimersByTime(40)
      expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    })

    it('no llama a scrollIntoView si el elemento ya está bien alineado (top = 0 o dentro de epsilon)', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 0 }),
      }

      settleScroll(el, { maxOffset: 6, idleMs: 140 })
      vi.advanceTimersByTime(200)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('no llama a scrollIntoView si el desalineamiento excede maxOffset', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 20 }),
      }

      settleScroll(el, { maxOffset: 6, idleMs: 140 })
      vi.advanceTimersByTime(200)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('cancela la corrección si el usuario interactúa con wheel', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el, { idleMs: 140 })
      document.dispatchEvent(new Event('wheel'))
      vi.advanceTimersByTime(300)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('cancela la corrección si el usuario interactúa con touchstart', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el, { idleMs: 140 })
      document.dispatchEvent(new Event('touchstart'))
      vi.advanceTimersByTime(300)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('cancela la corrección si el usuario interactúa con keydown', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el, { idleMs: 140 })
      document.dispatchEvent(new Event('keydown'))
      vi.advanceTimersByTime(300)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('cancela la corrección si el usuario interactúa con pointerdown', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el, { idleMs: 140 })
      document.dispatchEvent(new Event('pointerdown'))
      vi.advanceTimersByTime(300)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('corrige cuando se alcanza timeoutMs aunque sigan disparándose eventos de scroll', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 4 }),
      }

      settleScroll(el, { idleMs: 140, timeoutMs: 500 })

      // Simulamos scroll continuo cada 50ms (idleTimer no vencería por su cuenta)
      for (let i = 0; i < 9; i++) {
        vi.advanceTimersByTime(50)
        document.dispatchEvent(new Event('scroll'))
      }

      // Llegamos a los 500ms de timeoutMs
      vi.advanceTimersByTime(60)
      expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    })
  })
})
