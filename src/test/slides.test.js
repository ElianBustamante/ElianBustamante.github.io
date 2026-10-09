import { describe, it, expect } from 'vitest'
import {
  shouldInterceptKey,
  getKeyDirection,
  shouldInterceptWheel,
  canAdvanceSlide,
  getSectionOnFocus
} from '../lib/slides'

describe('slides logic', () => {
  it('foco en un elemento de otra sección -> devuelve esa sección', () => {
    const sec1 = document.createElement('section')
    sec1.id = 'inicio'
    const sec2 = document.createElement('section')
    sec2.id = 'proyectos'
    const btn = document.createElement('button')
    sec2.appendChild(btn)

    const result = getSectionOnFocus({
      focusedElement: btn,
      currentSection: sec1,
      windowHeight: 800
    })

    expect(result).toBe(sec2)
  })

  it('foco en la sección actual -> no alinea', () => {
    const sec1 = document.createElement('section')
    sec1.id = 'inicio'
    const btn = document.createElement('button')
    sec1.appendChild(btn)

    const result = getSectionOnFocus({
      focusedElement: btn,
      currentSection: sec1,
      windowHeight: 800
    })

    expect(result).toBeNull()
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
