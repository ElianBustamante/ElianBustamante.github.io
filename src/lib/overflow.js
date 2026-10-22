import { SHORT_SCREEN_QUERY } from './media'

/**
 * Observes scroll state of a list or container and its direct children,
 * notifying changes debounced via requestAnimationFrame.
 *
 * @param {HTMLElement | null} list
 * @param {() => void} onChange
 * @returns {() => void} Cleanup function
 */
export function observeScrollState(list, onChange) {
  if (!list) return () => {}

  let active = true
  let rafId = null

  const scheduleChange = () => {
    if (!active) return
    if (typeof cancelAnimationFrame === 'function' && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (typeof requestAnimationFrame === 'function') {
      rafId = requestAnimationFrame(() => {
        rafId = null
        if (active) {
          onChange()
        }
      })
    } else {
      onChange()
    }
  }

  // Schedule once initially
  scheduleChange()

  // (a) ResizeObserver observing the list and each direct child
  let ro = null
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      if (active) scheduleChange()
    })
    ro.observe(list)
    const children = list.children || []
    for (let i = 0; i < children.length; i++) {
      ro.observe(children[i])
    }
  }

  // (b) window.matchMedia(SHORT_SCREEN_QUERY) 'change' event
  let mql = null
  const handleMqlChange = () => {
    if (active) scheduleChange()
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      mql = window.matchMedia(SHORT_SCREEN_QUERY)
      if (mql) {
        if (typeof mql.addEventListener === 'function') {
          mql.addEventListener('change', handleMqlChange)
        } else if (typeof mql.addListener === 'function') {
          mql.addListener(handleMqlChange)
        }
      }
    } catch {
      // Ignore errors in environments with partial mocks
    }
  }

  // (c) window 'resize'
  const handleWindowResize = () => {
    if (active) scheduleChange()
  }
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('resize', handleWindowResize, { passive: true })
  }

  // (d) document.fonts.ready
  if (typeof document !== 'undefined' && document.fonts && typeof document.fonts.ready?.then === 'function') {
    document.fonts.ready
      .then(() => {
        if (active) scheduleChange()
      })
      .catch(() => {})
  }

  return () => {
    active = false
    if (typeof cancelAnimationFrame === 'function' && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (ro) {
      ro.disconnect()
      ro = null
    }
    if (mql) {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', handleMqlChange)
      } else if (typeof mql.removeListener === 'function') {
        mql.removeListener(handleMqlChange)
      }
      mql = null
    }
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', handleWindowResize)
    }
  }
}
