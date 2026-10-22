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
    it('evaluates specified values correctly (0, 0.1, 1, 5.9, 6, 7, -1, -7)', () => {
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

    it('respects custom maxOffset and epsilon parameters', () => {
      expect(needsSettle(0.2, 10, 0.1)).toBe(true)
      expect(needsSettle(0.05, 10, 0.1)).toBe(false)
      expect(needsSettle(11, 10, 0.1)).toBe(false)
    })
  })

  describe('scrollToElement', () => {
    it('does not fail if element is null', () => {
      expect(() => scrollToElement(null)).not.toThrow()
    })

    it('calls scrollIntoView with smooth by default', () => {
      const el = { scrollIntoView: vi.fn() }
      scrollToElement(el)
      expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    })
  })

  describe('settleScroll', () => {
    it('does nothing if element is null', () => {
      expect(() => settleScroll(null)).not.toThrow()
    })

    it('does nothing if prefers-reduced-motion is active', () => {
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

    it('waits for scroll to become idle (idleMs) and settles if needsSettle is true', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 3.5 }),
      }

      settleScroll(el, { maxOffset: 6, idleMs: 140 })

      // Fire scroll event to reset idle timer
      document.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(100)
      expect(el.scrollIntoView).not.toHaveBeenCalled()

      // 140ms elapse without scroll -> enters idle state
      vi.advanceTimersByTime(40)
      expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    })

    it('does not call scrollIntoView if element is already aligned (top = 0 or within epsilon)', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 0 }),
      }

      settleScroll(el, { maxOffset: 6, idleMs: 140 })
      vi.advanceTimersByTime(200)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('does not call scrollIntoView if misalignment exceeds maxOffset', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 20 }),
      }

      settleScroll(el, { maxOffset: 6, idleMs: 140 })
      vi.advanceTimersByTime(200)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('cancels settling if user interacts with wheel', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el, { idleMs: 140 })
      document.dispatchEvent(new Event('wheel'))
      vi.advanceTimersByTime(300)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('cancels settling if user interacts with touchstart', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el, { idleMs: 140 })
      document.dispatchEvent(new Event('touchstart'))
      vi.advanceTimersByTime(300)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('cancels settling if user interacts with keydown', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el, { idleMs: 140 })
      document.dispatchEvent(new Event('keydown'))
      vi.advanceTimersByTime(300)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('cancels settling if user interacts with pointerdown', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 3 }),
      }

      settleScroll(el, { idleMs: 140 })
      document.dispatchEvent(new Event('pointerdown'))
      vi.advanceTimersByTime(300)

      expect(el.scrollIntoView).not.toHaveBeenCalled()
    })

    it('settles when timeoutMs is reached even if scroll events keep firing', () => {
      const el = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: () => ({ top: 4 }),
      }

      settleScroll(el, { idleMs: 140, timeoutMs: 500 })

      // Simulate continuous scroll every 50ms (idleTimer would not expire on its own)
      for (let i = 0; i < 9; i++) {
        vi.advanceTimersByTime(50)
        document.dispatchEvent(new Event('scroll'))
      }

      // Reach 500ms timeoutMs
      vi.advanceTimersByTime(60)
      expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    })
  })
})
