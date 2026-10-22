import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { observeScrollState } from '../lib/overflow'
import { SHORT_SCREEN_QUERY } from '../lib/media'

describe('observeScrollState', () => {
  let list
  let child1
  let child2
  let mockResizeCallbacks
  let observeMock
  let disconnectMock

  beforeEach(() => {
    mockResizeCallbacks = []
    observeMock = vi.fn()
    disconnectMock = vi.fn()

    global.ResizeObserver = class {
      constructor(cb) {
        mockResizeCallbacks.push(cb)
      }
      observe(el) {
        observeMock(el)
      }
      unobserve() {}
      disconnect() {
        disconnectMock()
      }
    }

    list = document.createElement('ul')
    child1 = document.createElement('li')
    child2 = document.createElement('li')
    list.appendChild(child1)
    list.appendChild(child2)
    document.body.appendChild(list)
  })

  afterEach(() => {
    if (list && list.parentNode) {
      list.parentNode.removeChild(list)
    }
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns empty function if list is null or undefined', () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(null, onChange)
    expect(typeof cleanup).toBe('function')
    expect(() => cleanup()).not.toThrow()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('(a) calls onChange initially (after animation frame)', async () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    expect(onChange).not.toHaveBeenCalled()
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(1)

    cleanup()
  })

  it('(b) calls onChange when ResizeObserver triggers', async () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    // Consume initial frame
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(1)

    // Trigger ResizeObserver
    mockResizeCallbacks.forEach((cb) => cb([]))
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('(c) calls onChange when matchMedia change fires', async () => {
    let matchMediaCallback = null
    const addEventListenerMock = vi.fn((event, cb) => {
      if (event === 'change') matchMediaCallback = cb
    })
    const removeEventListenerMock = vi.fn()

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }))

    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    expect(window.matchMedia).toHaveBeenCalledWith(SHORT_SCREEN_QUERY)
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))

    // Consume initial frame
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(1)

    // Trigger matchMedia change event
    expect(matchMediaCallback).toBeTruthy()
    matchMediaCallback({ matches: true })
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('(d) observes both the element and its direct children', () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    expect(observeMock).toHaveBeenCalledWith(list)
    expect(observeMock).toHaveBeenCalledWith(child1)
    expect(observeMock).toHaveBeenCalledWith(child2)
    expect(observeMock).toHaveBeenCalledTimes(3)

    cleanup()
  })

  it('(e) cleanup disconnects observer, removes listeners, and does not fire subsequent onChange', async () => {
    let matchMediaCallback = null
    const removeListenerMock = vi.fn()
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: (event, cb) => {
        if (event === 'change') matchMediaCallback = cb
      },
      removeEventListener: removeListenerMock,
    }))

    const removeWindowListenerSpy = vi.spyOn(window, 'removeEventListener')
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    // Call cleanup immediately before first frame
    cleanup()

    // Verify observer and listeners disconnection
    expect(disconnectMock).toHaveBeenCalledTimes(1)
    expect(removeListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    expect(removeWindowListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    // Wait for rAF to verify onChange was NOT called after cleanup
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).not.toHaveBeenCalled()

    // Firing subsequent events must not trigger calls
    mockResizeCallbacks.forEach((cb) => cb([]))
    if (matchMediaCallback) matchMediaCallback({ matches: true })
    window.dispatchEvent(new Event('resize'))
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('(f) does not throw error if ResizeObserver or matchMedia is missing', async () => {
    const originalRO = global.ResizeObserver
    const originalMM = window.matchMedia

    delete global.ResizeObserver
    delete window.matchMedia

    const onChange = vi.fn()
    let cleanup
    expect(() => {
      cleanup = observeScrollState(list, onChange)
    }).not.toThrow()

    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(1)

    expect(() => cleanup()).not.toThrow()

    global.ResizeObserver = originalRO
    window.matchMedia = originalMM
  })

  it('cancels successive pending frames to avoid stacking', async () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    // Trigger multiple events in the same frame
    mockResizeCallbacks.forEach((cb) => cb([]))
    mockResizeCallbacks.forEach((cb) => cb([]))
    window.dispatchEvent(new Event('resize'))

    await new Promise((r) => requestAnimationFrame(r))
    // Despite multiple calls in the same tick/frame, onChange is only called once
    expect(onChange).toHaveBeenCalledTimes(1)

    cleanup()
  })
})
