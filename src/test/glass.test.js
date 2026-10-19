import { describe, it, expect } from 'vitest'
import { GLASS_CARD } from '../lib/glass'

describe('GLASS_CARD', () => {
  it('contains border-accent/40 and backdrop-blur-[6px]', () => {
    expect(GLASS_CARD).toContain('border-accent/40')
    expect(GLASS_CARD).toContain('backdrop-blur-[6px]')
  })
})
