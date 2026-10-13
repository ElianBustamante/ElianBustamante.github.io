import { describe, it, expect } from 'vitest'
import { fitChipCount } from '../lib/chips'

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
