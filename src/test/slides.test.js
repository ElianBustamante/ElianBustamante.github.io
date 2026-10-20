import { describe, it, expect } from 'vitest'
import {
  shouldInterceptKey,
  getKeyDirection,
  shouldInterceptWheel,
  shouldAbsorbWheel,
  getSettleIndex,
  canAdvanceSlide,
  getSectionOnFocus,
  shouldRealignOnResize
} from '../lib/slides'

describe('slides logic', () => {
  it('foco en una sección con top=0 -> null', () => {
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

  it('foco en una sección con top=-300 y altura igual a la pantalla -> esa sección', () => {
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

  it('sección más alta que la pantalla con el elemento visible -> null', () => {
    const sec = document.createElement('section')
    sec.id = 'sobre-mi'
    // Altura 1200 > 800 + 8, top = -200
    sec.getBoundingClientRect = () => ({ top: -200, height: 1200, bottom: 1000 })
    const btn = document.createElement('button')
    // Elemento visible en pantalla (top >= 0 y bottom <= 800)
    btn.getBoundingClientRect = () => ({ top: 200, bottom: 240 })
    sec.appendChild(btn)

    const result = getSectionOnFocus({
      focusedElement: btn,
      windowHeight: 800
    })

    expect(result).toBeNull()
  })

  it('sección más alta con el elemento fuera de pantalla -> esa sección', () => {
    const sec = document.createElement('section')
    sec.id = 'sobre-mi'
    // Altura 1200 > 800 + 8, top = -50
    sec.getBoundingClientRect = () => ({ top: -50, height: 1200, bottom: 1150 })
    const btn = document.createElement('button')
    // Elemento fuera de pantalla (bottom 900 > 800)
    btn.getBoundingClientRect = () => ({ top: 850, bottom: 900 })
    sec.appendChild(btn)

    const result = getSectionOnFocus({
      focusedElement: btn,
      windowHeight: 800
    })

    expect(result).toBe(sec)
  })

  it('Espacio sobre un button no se intercepta', () => {
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

  it('Espacio con body como target sí', () => {
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

  it('ctrl+rueda no', () => {
    const event = {
      ctrlKey: true,
      metaKey: false,
      deltaY: 50,
      deltaX: 0,
      target: document.body
    }

    expect(shouldInterceptWheel(event)).toBe(false)
  })

  it('rueda dentro de un contenedor con scroll disponible no', () => {
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

  it('sección más alta que la pantalla con su borde inferior fuera de pantalla no salta', () => {
    // Pantalla de 800px de alto, sección de 1200px de alto, bottom a 1100px (fuera de pantalla)
    const tallSection = {
      getBoundingClientRect: () => ({
        top: -100,
        bottom: 1100,
        height: 1200
      })
    }

    // Scroll hacia abajo (1): borde inferior fuera de pantalla -> no debe saltar de diapositiva
    expect(canAdvanceSlide(tallSection, 1, 800)).toBe(false)

    // Scroll wheel tampoco debe interceptarse para permitir scroll nativo
    const event = {
      ctrlKey: false,
      metaKey: false,
      deltaY: 20,
      deltaX: 0,
      target: document.body
    }
    expect(shouldInterceptWheel(event, { currentSection: tallSection, windowHeight: 800 })).toBe(false)

    // Pero si el borde inferior ya está visible (bottom <= 808), sí salta
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

  it('con movimiento reducido no se intercepta', () => {
    const event = {
      ctrlKey: false,
      metaKey: false,
      deltaY: 50,
      deltaX: 0,
      target: document.body
    }

    expect(shouldInterceptWheel(event, { isReducedMotion: true })).toBe(false)
  })

  describe('shouldRealignOnResize', () => {
    it('mismo ancho, alto y dpr -> false', () => {
      const prev = { width: 1024, height: 768, dpr: 1 }
      const cur = { width: 1024, height: 768, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(false)
    })

    it('escritorio, solo cambia el alto en 1px -> true', () => {
      const prev = { width: 1024, height: 768, dpr: 1 }
      const cur = { width: 1024, height: 769, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('escritorio, cambia el ancho -> true', () => {
      const prev = { width: 1024, height: 768, dpr: 1 }
      const cur = { width: 1200, height: 768, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('escritorio, cambia dpr -> true', () => {
      const prev = { width: 1024, height: 768, dpr: 1 }
      const cur = { width: 1024, height: 768, dpr: 1.25 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('móvil (<768), alto cambia 56px -> false', () => {
      const prev = { width: 375, height: 611, dpr: 2 }
      const cur = { width: 375, height: 667, dpr: 2 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(false)
    })

    it('móvil, alto cambia 107px -> true', () => {
      const prev = { width: 375, height: 611, dpr: 2 }
      const cur = { width: 375, height: 718, dpr: 2 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('móvil, cambia el ancho -> true', () => {
      const prev = { width: 375, height: 667, dpr: 2 }
      const cur = { width: 390, height: 667, dpr: 2 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('cruza de 800 a 700 de ancho -> true', () => {
      const prev = { width: 800, height: 600, dpr: 1 }
      const cur = { width: 700, height: 600, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('cruza de 700 a 800 -> true', () => {
      const prev = { width: 700, height: 600, dpr: 1 }
      const cur = { width: 800, height: 600, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur })).toBe(true)
    })

    it('coarse con solo el alto distinto -> false', () => {
      // Móvil (<768px): alto cambia significativamente (ej. barra de URL 120px)
      const prevMobile = { width: 390, height: 844, dpr: 3 }
      const curMobile = { width: 390, height: 724, dpr: 3 }
      expect(shouldRealignOnResize({ prev: prevMobile, cur: curMobile, coarse: true })).toBe(false)

      // Tablet / apaisado (>=768px): alto cambia
      const prevTablet = { width: 800, height: 600, dpr: 2 }
      const curTablet = { width: 800, height: 520, dpr: 2 }
      expect(shouldRealignOnResize({ prev: prevTablet, cur: curTablet, coarse: true })).toBe(false)
    })

    it('coarse con ancho distinto -> true', () => {
      const prev = { width: 375, height: 667, dpr: 2 }
      const cur = { width: 390, height: 667, dpr: 2 }
      expect(shouldRealignOnResize({ prev, cur, coarse: true })).toBe(true)
    })

    it('coarse cruzando 768px -> true', () => {
      const prev = { width: 700, height: 600, dpr: 1 }
      const cur = { width: 800, height: 600, dpr: 1 }
      expect(shouldRealignOnResize({ prev, cur, coarse: true })).toBe(true)

      const prev2 = { width: 800, height: 600, dpr: 1 }
      const cur2 = { width: 700, height: 600, dpr: 1 }
      expect(shouldRealignOnResize({ prev: prev2, cur: cur2, coarse: true })).toBe(true)
    })

    it('sin coarse (o coarse=false) conserva el mismo resultado que antes', () => {
      // Escritorio con cambio de alto -> true
      const prevDesk = { width: 1024, height: 768, dpr: 1 }
      const curDesk = { width: 1024, height: 769, dpr: 1 }
      expect(shouldRealignOnResize({ prev: prevDesk, cur: curDesk, coarse: false })).toBe(true)
      expect(shouldRealignOnResize({ prev: prevDesk, cur: curDesk })).toBe(true)

      // Móvil con cambio de alto <96px -> false
      const prevMob = { width: 375, height: 611, dpr: 2 }
      const curMobSmall = { width: 375, height: 667, dpr: 2 }
      expect(shouldRealignOnResize({ prev: prevMob, cur: curMobSmall, coarse: false })).toBe(false)
      expect(shouldRealignOnResize({ prev: prevMob, cur: curMobSmall })).toBe(false)

      // Móvil con cambio de alto >=96px -> true
      const curMobLarge = { width: 375, height: 718, dpr: 2 }
      expect(shouldRealignOnResize({ prev: prevMob, cur: curMobLarge, coarse: false })).toBe(true)
      expect(shouldRealignOnResize({ prev: prevMob, cur: curMobLarge })).toBe(true)
    })
  })

  describe('shouldAbsorbWheel', () => {
    it('true con isTransitioning true y deltaY pequeño (2)', () => {
      const event = {
        ctrlKey: false,
        metaKey: false,
        deltaY: 2,
        deltaX: 0,
        target: document.body
      }
      expect(shouldAbsorbWheel(event, { isTransitioning: true })).toBe(true)
    })

    it('false con isTransitioning false', () => {
      const event = {
        ctrlKey: false,
        metaKey: false,
        deltaY: 2,
        deltaX: 0,
        target: document.body
      }
      expect(shouldAbsorbWheel(event, { isTransitioning: false })).toBe(false)
    })

    it('false con ctrlKey', () => {
      const event = {
        ctrlKey: true,
        metaKey: false,
        deltaY: 2,
        deltaX: 0,
        target: document.body
      }
      expect(shouldAbsorbWheel(event, { isTransitioning: true })).toBe(false)
    })

    it('false con reduced motion', () => {
      const event = {
        ctrlKey: false,
        metaKey: false,
        deltaY: 2,
        deltaX: 0,
        target: document.body
      }
      expect(shouldAbsorbWheel(event, { isTransitioning: true, isReducedMotion: true })).toBe(false)
    })

    it('false si el evento es horizontal (|deltaX| > |deltaY|)', () => {
      const event = {
        ctrlKey: false,
        metaKey: false,
        deltaY: 2,
        deltaX: 10,
        target: document.body
      }
      expect(shouldAbsorbWheel(event, { isTransitioning: true })).toBe(false)
    })

    it('false si el target está dentro de un [role="dialog"]', () => {
      const dialog = document.createElement('div')
      dialog.setAttribute('role', 'dialog')
      const inner = document.createElement('span')
      dialog.appendChild(inner)
      document.body.appendChild(dialog)

      const event = {
        ctrlKey: false,
        metaKey: false,
        deltaY: 2,
        deltaX: 0,
        target: inner
      }
      expect(shouldAbsorbWheel(event, { isTransitioning: true })).toBe(false)

      document.body.removeChild(dialog)
    })

    it('false si el target tiene scroll interno disponible', () => {
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
        deltaY: 2,
        deltaX: 0,
        target: innerChild
      }
      expect(shouldAbsorbWheel(event, { isTransitioning: true })).toBe(false)

      document.body.removeChild(container)
    })
  })

  describe('getSettleIndex', () => {
    it('devuelve el índice cuando la sección más cercana tiene top = -70 y alto = windowHeight', () => {
      const sec0 = document.createElement('section')
      sec0.getBoundingClientRect = () => ({ top: -870, height: 800 })
      const sec1 = document.createElement('section')
      sec1.getBoundingClientRect = () => ({ top: -70, height: 800 })

      expect(getSettleIndex([sec0, sec1], 800)).toBe(1)
    })

    it('devuelve -1 con top = 0', () => {
      const sec = document.createElement('section')
      sec.getBoundingClientRect = () => ({ top: 0, height: 800 })

      expect(getSettleIndex([sec], 800)).toBe(-1)
    })

    it('devuelve -1 con top = 1 (dentro de la tolerancia)', () => {
      const sec = document.createElement('section')
      sec.getBoundingClientRect = () => ({ top: 1, height: 800 })

      expect(getSettleIndex([sec], 800)).toBe(-1)
    })

    it('devuelve -1 cuando la sección es más alta que windowHeight + 8', () => {
      const sec = document.createElement('section')
      sec.getBoundingClientRect = () => ({ top: -70, height: 1200 })

      expect(getSettleIndex([sec], 800)).toBe(-1)
    })

    it('con varias secciones elige la más cercana', () => {
      const sec0 = document.createElement('section')
      sec0.getBoundingClientRect = () => ({ top: -850, height: 800 })
      const sec1 = document.createElement('section')
      sec1.getBoundingClientRect = () => ({ top: -50, height: 800 })
      const sec2 = document.createElement('section')
      sec2.getBoundingClientRect = () => ({ top: 750, height: 800 })

      expect(getSettleIndex([sec0, sec1, sec2], 800)).toBe(1)
    })

    it('devuelve -1 si la más cercana es un footer', () => {
      const sec = document.createElement('section')
      sec.getBoundingClientRect = () => ({ top: -700, height: 800 })
      const footer = document.createElement('footer')
      footer.getBoundingClientRect = () => ({ top: -40, height: 120 })

      expect(getSettleIndex([sec, footer], 800)).toBe(-1)
    })
  })
})
