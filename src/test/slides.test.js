import { describe, it, expect } from 'vitest'
import {
  shouldInterceptKey,
  getKeyDirection,
  shouldInterceptWheel,
  canAdvanceSlide,
  getSectionOnFocus
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
})
