import { describe, it, expect } from 'vitest'
import {
  shouldInterceptKey,
  getKeyDirection,
  shouldInterceptWheel,
  canAdvanceSlide,
  getSectionOnFocus,
  shouldRealignOnResize
} from '../lib/slides'

describe('slides logic', () => {
  it('focus on a section with top=0 -> null', () => {
    const sec = document.createElement('section')
    sec.id = 'inicio'
    sec.getBoundingClientRect = () => ({ top: 0, height: 800, bottom: 800 })
    const btn = document.createElement('button')
    btn.getBoundingClientRect = () => ({ top: 100, bottom: 140 })
    sec.appendChild(btn)

    const result = getSectionOnFocus({
      focusedElement: btn,
      windowHeight: 800
    })

    expect(result).toBeNull()
  })

  it('focus on a section with top=-300 and height equal to screen -> that section', () => {
    const sec = document.createElement('section')
    sec.id = 'proyectos'
    sec.getBoundingClientRect = () => ({ top: -300, height: 800, bottom: 500 })
    const btn = document.createElement('button')
    btn.getBoundingClientRect = () => ({ top: 100, bottom: 140 })
    sec.appendChild(btn)

    const result = getSectionOnFocus({
      focusedElement: btn,
      windowHeight: 800
    })

    expect(result).toBe(sec)
  })

  it('section taller than screen with element visible -> null', () => {
    const sec = document.createElement('section')
    sec.id = 'sobre-mi'
    // Height 1200 > 800 + 8, top = -200
    sec.getBoundingClientRect = () => ({ top: -200, height: 1200, bottom: 1000 })
    const btn = document.createElement('button')
    // Element visible on screen (top >= 0 and bottom <= 800)
    btn.getBoundingClientRect = () => ({ top: 200, bottom: 240 })
    sec.appendChild(btn)

    const result = getSectionOnFocus({
      focusedElement: btn,
      windowHeight: 800
    })

    expect(result).toBeNull()
  })

  it('taller section with element off screen -> that section', () => {
    const sec = document.createElement('section')
    sec.id = 'sobre-mi'
    // Height 1200 > 800 + 8, top = -50
    sec.getBoundingClientRect = () => ({ top: -50, height: 1200, bottom: 1150 })
    const btn = document.createElement('button')
    // Element off screen (bottom 900 > 800)
    btn.getBoundingClientRect = () => ({ top: 850, bottom: 900 })
    sec.appendChild(btn)

    const result = getSectionOnFocus({
      focusedElement: btn,
      windowHeight: 800
    })

    expect(result).toBe(sec)
  })

  it('Space over a button is not intercepted', () => {
    const btn = document.createElement('button')
    const event = {
      key: ' ',
      target: btn,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false
    }

    expect(shouldInterceptKey(event)).toBe(false)
    expect(getKeyDirection(event)).toBe(0)
  })

  it('Space with body as target is intercepted', () => {
    const event = {
      key: ' ',
      target: document.body,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false
    }

    expect(shouldInterceptKey(event)).toBe(true)
    expect(getKeyDirection(event)).toBe(1)
  })

  it('ctrl+wheel is not intercepted', () => {
    const event = {
      ctrlKey: true,
      metaKey: false,
      deltaY: 50,
      deltaX: 0,
      target: document.body
    }

    expect(shouldInterceptWheel(event)).toBe(false)
  })

  it('wheel inside container with available scroll is not intercepted', () => {
    const container = document.createElement('div')
    Object.defineProperty(container, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true })
    container.scrollTop = 50
    container.style.overflowY = 'auto'

    const innerChild = document.createElement('p')
    container.appendChild(innerChild)
    document.body.appendChild(container)

    const event = {
      ctrlKey: false,
      metaKey: false,
      deltaY: 20,
      deltaX: 0,
      target: innerChild
    }

    expect(shouldInterceptWheel(event)).toBe(false)

    document.body.removeChild(container)
  })

  it('section taller than screen with its bottom edge off screen does not jump', () => {
    // 800px high screen, 1200px high section, bottom at 1100px (off screen)
    const tallSection = {
      getBoundingClientRect: () => ({
        top: -100,
        bottom: 1100,
        height: 1200
      })
    }

    // Scroll down (1): bottom edge off screen -> must not jump slide
    expect(canAdvanceSlide(tallSection, 1, 800)).toBe(false)

    // Scroll wheel must not be intercepted either to allow native scroll
    const event = {
      ctrlKey: false,
      metaKey: false,
      deltaY: 20,
      deltaX: 0,
      target: document.body
    }
    expect(shouldInterceptWheel(event, { currentSection: tallSection, windowHeight: 800 })).toBe(false)

    // But if bottom edge is already visible (bottom <= 808), it does jump
    const tallSectionVisibleBottom = {
      getBoundingClientRect: () => ({
        top: -400,
        bottom: 800,
        height: 1200
      })
    }
    expect(canAdvanceSlide(tallSectionVisibleBottom, 1, 800)).toBe(true)
    expect(shouldInterceptWheel(event, { currentSection: tallSectionVisibleBottom, windowHeight: 800 })).toBe(true)
  })

  it('with reduced motion is not intercepted', () => {
    const event = {
      ctrlKey: false,
      metaKey: false,
      deltaY: 50,
      deltaX: 0,
      target: document.body
    }

    expect(shouldInterceptWheel(event, { isReducedMotion: true })).toBe(false)
  })

  it('with minDelta: 0 an event with deltaY = 2 is intercepted, and with default value is not', () => {
    const event = {
      ctrlKey: false,
      metaKey: false,
      deltaY: 2,
      deltaX: 0,
      target: document.body
    }

    expect(shouldInterceptWheel(event)).toBe(false)
    expect(shouldInterceptWheel(event, { minDelta: 0 })).toBe(true)
  })

  describe('shouldRealignOnResize', () => {
    it('same width, height, and dpr -> false', () => {
      const prev = { width: 1024, height: 768, dpr: 1 }
      const cur = { width: 1024, height: 768, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(false)
    })

    it('desktop, only height changes by 1px -> true', () => {
      const prev = { width: 1024, height: 768, dpr: 1 }
      const cur = { width: 1024, height: 769, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('desktop, width changes -> true', () => {
      const prev = { width: 1024, height: 768, dpr: 1 }
      const cur = { width: 1200, height: 768, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('desktop, dpr changes -> true', () => {
      const prev = { width: 1024, height: 768, dpr: 1 }
      const cur = { width: 1024, height: 768, dpr: 1.25 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('mobile (<768), height changes 56px -> false', () => {
      const prev = { width: 375, height: 611, dpr: 2 }
      const cur = { width: 375, height: 667, dpr: 2 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(false)
    })

    it('mobile, height changes 107px -> true', () => {
      const prev = { width: 375, height: 611, dpr: 2 }
      const cur = { width: 375, height: 718, dpr: 2 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('mobile, width changes -> true', () => {
      const prev = { width: 375, height: 667, dpr: 2 }
      const cur = { width: 390, height: 667, dpr: 2 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('crosses from 800 to 700 width -> true', () => {
      const prev = { width: 800, height: 600, dpr: 1 }
      const cur = { width: 700, height: 600, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('crosses from 700 to 800 -> true', () => {
      const prev = { width: 700, height: 600, dpr: 1 }
      const cur = { width: 800, height: 600, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('coarse with only height different -> false', () => {
      // Mobile (<768px): height changes significantly (e.g. 120px URL bar)
      const prevMobile = { width: 390, height: 844, dpr: 3 }
      const curMobile = { width: 390, height: 724, dpr: 3 }
      expect(shouldRealignOnResize({ prev: prevMobile, cur: curMobile, coarse: true })).toBe(false)

      // Tablet / landscape (>=768px): height changes
      const prevTablet = { width: 800, height: 600, dpr: 2 }
      const curTablet = { width: 800, height: 520, dpr: 2 }
      expect(shouldRealignOnResize({ prev: prevTablet, cur: curTablet, coarse: true })).toBe(false)
    })

    it('coarse with different width -> true', () => {
      const prev = { width: 375, height: 667, dpr: 2 }
      const cur = { width: 390, height: 667, dpr: 2 }
      expect(shouldRealignOnResize({ prev, cur, coarse: true })).toBe(true)
    })

    it('coarse crossing 768px -> true', () => {
      const prev = { width: 700, height: 600, dpr: 1 }
      const cur = { width: 800, height: 600, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur, coarse: true })).toBe(true)

      const prev2 = { width: 800, height: 600, dpr: 1 }
      const cur2 = { width: 700, height: 600, dpr: 1 }
      expect(shouldRealignOnResize({ prev: prev2, cur: cur2, coarse: true })).toBe(true)
    })

    it('without coarse (or coarse=false) retains same result as before', () => {
      // Desktop with height change -> true
      const prevDesk = { width: 1024, height: 768, dpr: 1 }
      const curDesk = { width: 1024, height: 769, dpr: 1 }
      expect(shouldRealignOnResize({ prev: prevDesk, cur: curDesk, coarse: false })).toBe(true)
      expect(shouldRealignOnResize({ prev: prevDesk, cur: curDesk })).toBe(true)

      // Mobile with height change <96px -> false
      const prevMob = { width: 375, height: 611, dpr: 2 }
      const curMobSmall = { width: 375, height: 667, dpr: 2 }
      expect(shouldRealignOnResize({ prev: prevMob, cur: curMobSmall, coarse: false })).toBe(false)
      expect(shouldRealignOnResize({ prev: prevMob, cur: curMobSmall })).toBe(false)

      // Mobile with height change >=96px -> true
      const curMobLarge = { width: 375, height: 718, dpr: 2 }
      expect(shouldRealignOnResize({ prev: prevMob, cur: curMobLarge, coarse: false })).toBe(true)
      expect(shouldRealignOnResize({ prev: prevMob, cur: curMobLarge })).toBe(true)
    })
  })
})
