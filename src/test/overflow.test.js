import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { observeScrollState } from './overflow'
import { SHORT_SCREEN_QUERY } from './media'

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

  it('devuelve una función vacía si list es null o undefined', () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(null, onChange)
    expect(typeof cleanup).toBe('function')
    expect(() => cleanup()).not.toThrow()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('(a) se llama onChange al inicio (tras el frame)', async () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    expect(onChange).not.toHaveBeenCalled()
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(1)

    cleanup()
  })

  it('(b) se llama al disparar ResizeObserver', async () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    // Consumir el frame inicial
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(1)

    // Disparar ResizeObserver
    mockResizeCallbacks.forEach((cb) => cb([]))
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('(c) se llama al disparar el cambio de matchMedia', async () => {
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

    // Consumir frame inicial
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(1)

    // Disparar evento change de matchMedia
    expect(matchMediaCallback).toBeTruthy()
    matchMediaCallback({ matches: true })
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('(d) se observan tanto el elemento como sus hijos directos', () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    expect(observeMock).toHaveBeenCalledWith(list)
    expect(observeMock).toHaveBeenCalledWith(child1)
    expect(observeMock).toHaveBeenCalledWith(child2)
    expect(observeMock).toHaveBeenCalledTimes(3)

    cleanup()
  })

  it('(e) la limpieza desconecta el observer, remueve listeners y no dispara onChange posterior', async () => {
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

    // Inmediatamente llamamos a cleanup antes del primer frame
    cleanup()

    // Verificamos desconexión de observer y listeners
    expect(disconnectMock).toHaveBeenCalledTimes(1)
    expect(removeListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    expect(removeWindowListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    // Esperar rAF para verificar que onChange NO fue llamado tras cleanup
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).not.toHaveBeenCalled()

    // Disparar eventos posteriores no debe causar llamadas
    mockResizeCallbacks.forEach((cb) => cb([]))
    if (matchMediaCallback) matchMediaCallback({ matches: true })
    window.dispatchEvent(new Event('resize'))
    await new Promise((r) => requestAnimationFrame(r))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('(f) si faltan ResizeObserver o matchMedia no lanza error', async () => {
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

  it('cancela frames pendientes sucesivos para evitar apilamiento', async () => {
    const onChange = vi.fn()
    const cleanup = observeScrollState(list, onChange)

    // Disparar múltiples eventos en el mismo frame
    mockResizeCallbacks.forEach((cb) => cb([]))
    mockResizeCallbacks.forEach((cb) => cb([]))
    window.dispatchEvent(new Event('resize'))

    await new Promise((r) => requestAnimationFrame(r))
    // A pesar de múltiples llamadas en el mismo tick/frame, onChange solo se llama una vez
    expect(onChange).toHaveBeenCalledTimes(1)

    cleanup()
  })
})
