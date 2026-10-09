import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useMediaQuery from '../hooks/useMediaQuery'

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('devuelve false si matchMedia no existe', () => {
    delete window.matchMedia
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'))
    expect(result.current).toBe(false)
  })

  it('responde al estado inicial y a los cambios del media query', () => {
    let changeHandler = null
    const mqlMock = {
      matches: false,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') changeHandler = handler
      }),
      removeEventListener: vi.fn(),
    }

    window.matchMedia = vi.fn().mockReturnValue(mqlMock)

    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'))
    expect(result.current).toBe(false)

    act(() => {
      mqlMock.matches = true
      if (changeHandler) changeHandler({ matches: true })
    })

    expect(result.current).toBe(true)
  })
})
