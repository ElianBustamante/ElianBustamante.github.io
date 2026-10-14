import { describe, it, expect } from 'vitest'
import {
  getActiveSectionIndex,
  getPrevSectionIndex,
  getNextSectionIndex,
  canGoPrev,
  canGoNext,
} from '../lib/sections'

describe('sections pure navigation logic', () => {
  it('arreglo vacío o nulo devuelve 0 y false sin lanzar error', () => {
    expect(getActiveSectionIndex([], 800)).toBe(0)
    expect(getActiveSectionIndex(null, 800)).toBe(0)
    expect(getPrevSectionIndex([])).toBe(0)
    expect(getPrevSectionIndex(null)).toBe(0)
    expect(getNextSectionIndex([])).toBe(0)
    expect(getNextSectionIndex(null)).toBe(0)
    expect(canGoPrev([])).toBe(false)
    expect(canGoPrev(null)).toBe(false)
    expect(canGoNext([])).toBe(false)
    expect(canGoNext(null)).toBe(false)
  })

  it('alineado exactamente en una sección', () => {
    // Viewport 800, línea en 800 * 0.4 = 320
    const rects = [
      { top: -800, bottom: 0 },
      { top: 0, bottom: 800 },
      { top: 800, bottom: 1600 },
    ]

    // Sección 1 cubre 0 <= 320 y 800 > 320
    expect(getActiveSectionIndex(rects, 800)).toBe(1)
    // El último índice con top < -4 es el 0
    expect(getPrevSectionIndex(rects)).toBe(0)
    // El primer índice con top > 4 es el 2
    expect(getNextSectionIndex(rects)).toBe(2)
    expect(canGoPrev(rects)).toBe(true)
    expect(canGoNext(rects)).toBe(true)
  })

  it('a medias entre dos secciones', () => {
    // Scrolleando hacia abajo: la sección 0 va saliendo (top: -500, bottom: 300)
    // La sección 1 va entrando (top: 300, bottom: 1100). Viewport 800, línea = 320.
    // Sección 0: top <= 320 pero bottom 300 NO es > 320.
    // Sección 1: top 300 <= 320 y bottom 1100 > 320 -> activo es índice 1.
    const rects = [
      { top: -500, bottom: 300 },
      { top: 300, bottom: 1100 },
      { top: 1100, bottom: 1900 },
    ]

    expect(getActiveSectionIndex(rects, 800)).toBe(1)
    // getPrevSectionIndex: último con top < -4 es el 0
    expect(getPrevSectionIndex(rects)).toBe(0)
    // getNextSectionIndex: primer con top > 4 es el 1 (su inicio está abajo a 300px)
    expect(getNextSectionIndex(rects)).toBe(1)
    expect(canGoPrev(rects)).toBe(true)
    expect(canGoNext(rects)).toBe(true)
  })

  it('viendo solo la parte de abajo de una sección más alta que la pantalla (canGoPrev debe ser true)', () => {
    // Por ejemplo en pantalla baja (viewportHeight 400), una sección de 1000px de altura
    // scrolleada hasta el final: top = -600, bottom = 400.
    // La siguiente sección empieza en 400.
    const rects = [
      { top: -600, bottom: 400 },
      { top: 400, bottom: 800 },
    ]

    // Línea en 400 * 0.4 = 160. Sección 0: -600 <= 160 y 400 > 160 -> activo es 0
    expect(getActiveSectionIndex(rects, 400)).toBe(0)
    // Como top = -600 < -4, canGoPrev debe ser true para permitir volver al inicio de la sección
    expect(canGoPrev(rects)).toBe(true)
    // getPrevSectionIndex devuelve el índice 0 para volver a su inicio
    expect(getPrevSectionIndex(rects)).toBe(0)
    // Siguiente sección tiene top = 400 > 4 -> canGoNext es true y apunta a 1
    expect(canGoNext(rects)).toBe(true)
    expect(getNextSectionIndex(rects)).toBe(1)
  })

  it('primera sección: canGoPrev es false, canGoNext es true', () => {
    const rects = [
      { top: 0, bottom: 800 },
      { top: 800, bottom: 1600 },
      { top: 1600, bottom: 2400 },
    ]

    expect(getActiveSectionIndex(rects, 800)).toBe(0)
    expect(canGoPrev(rects)).toBe(false)
    expect(canGoNext(rects)).toBe(true)
    expect(getPrevSectionIndex(rects)).toBe(0)
    expect(getNextSectionIndex(rects)).toBe(1)
  })

  it('última sección: canGoPrev es true, canGoNext es false', () => {
    const rects = [
      { top: -1600, bottom: -800 },
      { top: -800, bottom: 0 },
      { top: 0, bottom: 800 },
    ]

    expect(getActiveSectionIndex(rects, 800)).toBe(2)
    expect(canGoPrev(rects)).toBe(true)
    expect(canGoNext(rects)).toBe(false)
    expect(getPrevSectionIndex(rects)).toBe(1)
    expect(getNextSectionIndex(rects)).toBe(2)
  })

  it('fallback si ninguna sección cruza la línea pero hay secciones por encima', () => {
    // Si por alguna razón hay un hueco o salto y ninguna cubre la línea (ej. línea = 400, rects terminan antes)
    const rects = [
      { top: -800, bottom: -400 },
      { top: -400, bottom: 100 },
    ]
    // Último con top <= 400 es el índice 1
    expect(getActiveSectionIndex(rects, 1000)).toBe(1)
  })
})
