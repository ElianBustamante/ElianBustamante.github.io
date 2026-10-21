import { describe, it, expect } from 'vitest'
import { fitChipCount, fitChipLines } from '../lib/chips'

describe('fitChipCount', () => {
  it('lista vacía: devuelve 0', () => {
    expect(fitChipCount([], 30, 200, 8)).toBe(0)
    expect(fitChipCount(null, 30, 200, 8)).toBe(0)
  })

  it('todos caben: devuelve widths.length', () => {
    const widths = [40, 50, 60] // total: 40 + 50 + 60 + 2*8 = 166
    expect(fitChipCount(widths, 30, 200, 8)).toBe(3)
  })

  it('justo en el límite cuando todos caben: devuelve widths.length', () => {
    const widths = [40, 50, 60] // total: 40 + 50 + 60 + 16 = 166
    expect(fitChipCount(widths, 30, 166, 8)).toBe(3)
  })

  it('justo en el límite cuando k chips caben con "+N": devuelve k', () => {
    const widths = [40, 50, 60] // 3 chips no caben en 165
    // k = 2: 40 + 50 + 2*8 + 30 = 136
    expect(fitChipCount(widths, 30, 136, 8)).toBe(2)
  })

  it('ninguno cabe: devuelve 0 si ni siquiera 1 chip cabe con "+N"', () => {
    const widths = [80, 90]
    // k = 1: 80 + 8 + 30 = 118 > 100
    expect(fitChipCount(widths, 30, 100, 8)).toBe(0)
  })

  it('ancho disponible no positivo: devuelve 0', () => {
    expect(fitChipCount([40, 50], 30, 0, 8)).toBe(0)
    expect(fitChipCount([40, 50], 30, -10, 8)).toBe(0)
  })
})

describe('fitChipLines', () => {
  it('todos caben en 1 línea: devuelve n', () => {
    const widths = [40, 50, 60] // 40 + 8 + 50 + 8 + 60 = 166 <= 200
    expect(fitChipLines(widths, 30, 200, 8, 1)).toBe(3)
  })

  it('no caben en 1 línea pero sí en 2: devuelve n con maxLines = 2', () => {
    const widths = [60, 60, 60, 60] // línea 1: 60+8+60+8+60=196 <= 200; línea 2: 60
    expect(fitChipLines(widths, 30, 200, 8, 1)).toBe(2)
    expect(fitChipLines(widths, 30, 200, 8, 2)).toBe(4)
  })

  it('no caben en maxLines y devuelve k con "+N"', () => {
    const widths = [60, 60, 60, 60, 60, 60, 60]
    // Con available=200, gap=8:
    // línea 1 caben tres de 60 (60+8+60+8+60 = 196)
    // línea 2 caben dos de 60 + plusWidth 30 (60+8+60+8+30 = 166 <= 200), pero tres de 60 + 30 (196+8+30=234) pasa a línea 3
    expect(fitChipLines(widths, 30, 200, 8, 2)).toBe(5)
  })

  it('maxLines = 1 coincide con fitChipCount en varios casos', () => {
    const cases = [
      { widths: [40, 50, 60], plus: 30, avail: 200, gap: 8 },
      { widths: [40, 50, 60], plus: 30, avail: 166, gap: 8 },
      { widths: [40, 50, 60], plus: 30, avail: 165, gap: 8 },
      { widths: [40, 50, 60], plus: 30, avail: 136, gap: 8 },
      { widths: [40, 50, 60], plus: 30, avail: 135, gap: 8 },
      { widths: [80, 90], plus: 30, avail: 100, gap: 8 },
    ]
    for (const c of cases) {
      expect(fitChipLines(c.widths, c.plus, c.avail, c.gap, 1)).toBe(
        fitChipCount(c.widths, c.plus, c.avail, c.gap)
      )
    }
  })

  it('widths vacío o available <= 0: devuelve 0', () => {
    expect(fitChipLines([], 30, 200, 8, 2)).toBe(0)
    expect(fitChipLines(null, 30, 200, 8, 2)).toBe(0)
    expect(fitChipLines([40, 50], 30, 0, 8, 2)).toBe(0)
    expect(fitChipLines([40, 50], 30, -10, 8, 2)).toBe(0)
  })
})
