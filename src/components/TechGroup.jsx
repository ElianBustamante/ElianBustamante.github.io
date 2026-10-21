import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { fitChipLines } from '../lib/chips'

const CHIP_CLASS =
  'rounded-md bg-surface-2/50 border border-border px-2 py-0.5 compact:py-0 [@media(min-height:441px)]:compact:py-0.5 text-[0.75rem] text-text'

export default function TechGroup({ label, items = [], maxLines = 1 }) {
  const { t } = useTranslation()
  const tooltipId = useId()
  const [count, setCount] = useState(items.length)
  const [open, setOpen] = useState(false)
  const [tagPos, setTagPos] = useState({ top: 0, left: 0, showAbove: true })

  const containerRef = useRef(null)
  const listRef = useRef(null)
  const measureListRef = useRef(null)
  const tagButtonRef = useRef(null)
  const isHoveredRef = useRef(false)
  const touchHandledRef = useRef(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    const realUl = listRef.current
    const measureUl = measureListRef.current
    if (!container || !realUl || !measureUl || items.length === 0) return

    const measure = () => {
      const clientWidth = container.clientWidth
      if (!clientWidth || clientWidth <= 0) {
        setCount(items.length)
        return
      }

      const children = Array.from(measureUl.children)
      if (children.length < items.length + 1) return

      const widths = children.slice(0, items.length).map((el) => el.offsetWidth)
      const plusWidth = children[items.length].offsetWidth

      let gap = 8
      const computedGap = window.getComputedStyle(realUl).columnGap
      if (computedGap) {
        const parsed = parseFloat(computedGap)
        if (!isNaN(parsed)) gap = parsed
      }

      const nextCount = fitChipLines(widths, plusWidth, clientWidth, gap, maxLines)
      setCount(nextCount)
    }

    measure()

    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure)
      ro.observe(container)
    }

    let cancelled = false
    const onLoadingDone = () => {
      if (!cancelled) measure()
    }

    if (typeof document !== 'undefined' && document.fonts) {
      if (document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        document.fonts.ready.then(() => {
          if (!cancelled) measure()
        })
      }
      if (typeof document.fonts.addEventListener === 'function') {
        document.fonts.addEventListener('loadingdone', onLoadingDone)
      }
    }

    return () => {
      cancelled = true
      if (ro) ro.disconnect()
      if (
        typeof document !== 'undefined' &&
        document.fonts &&
        typeof document.fonts.removeEventListener === 'function'
      ) {
        document.fonts.removeEventListener('loadingdone', onLoadingDone)
      }
    }
  }, [items, maxLines])

  const visibles = items.slice(0, count)
  const ocultas = items.slice(count)

  const updateTooltipPosition = (element) => {
    if (!element) return
    const rect = element.getBoundingClientRect()
    let showAbove = true
    let top = rect.top - 8
    if (top < 100) {
      showAbove = false
      top = rect.bottom + 8
    }
    setTagPos({ top, left: rect.left + rect.width / 2, showAbove })
  }

  useEffect(() => {
    if (!open) return

    const closeTooltip = () => {
      isHoveredRef.current = false
      setOpen(false)
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeTooltip()
    }
    const handleClickOutside = (e) => {
      if (tagButtonRef.current && !tagButtonRef.current.contains(e.target)) {
        closeTooltip()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('pointerdown', handleClickOutside)
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('scroll', closeTooltip, { passive: true, capture: true })
    window.addEventListener('resize', closeTooltip, { passive: true })

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('scroll', closeTooltip, { capture: true })
      window.removeEventListener('resize', closeTooltip)
    }
  }, [open])

  const handleMouseEnter = (e) => {
    if (e.nativeEvent.pointerType && e.nativeEvent.pointerType !== 'mouse') return
    isHoveredRef.current = true
    updateTooltipPosition(e.currentTarget)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    setOpen(false)
  }

  const handleFocus = (e) => {
    isHoveredRef.current = false
    updateTooltipPosition(e.currentTarget)
    setOpen(true)
  }

  const handleBlur = () => {
    isHoveredRef.current = false
    setOpen(false)
  }

  const handleTouchStart = (e) => {
    isHoveredRef.current = false
    touchHandledRef.current = true
    if (open) {
      setOpen(false)
    } else {
      updateTooltipPosition(e.currentTarget)
      setOpen(true)
    }
  }

  const handleClick = (e) => {
    if (touchHandledRef.current) {
      touchHandledRef.current = false
      return
    }
    if (isHoveredRef.current) {
      return
    }
    if (open) {
      setOpen(false)
    } else {
      updateTooltipPosition(e.currentTarget)
      setOpen(true)
    }
  }

  const portalContent =
    open && ocultas.length > 0
      ? createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className="fixed z-[70] w-max max-w-[12.5rem] rounded-lg bg-black/95 backdrop-blur-xl border border-white/10 px-3 py-2 text-[0.75rem] font-medium text-white shadow-2xl pointer-events-none animate-fade-in"
            style={{
              top: tagPos.showAbove ? 'auto' : tagPos.top,
              bottom: tagPos.showAbove
                ? typeof window !== 'undefined'
                  ? window.innerHeight - tagPos.top
                  : 0
                : 'auto',
              left: `clamp(calc(6.25rem + 8px), ${tagPos.left}px, calc(100vw - 6.25rem - 8px))`,
              transform: 'translateX(-50%)',
            }}
          >
            {ocultas.join(', ')}
          </div>,
          document.body
        )
      : null

  return (
    <div>
      {portalContent}
      <h4 className="text-[0.875rem] compact:text-[0.75rem] [@media(min-height:441px)]:compact:text-[0.875rem] font-medium text-muted mb-2 compact:mb-0.5 [@media(min-height:441px)]:compact:mb-1">
        {label}
      </h4>
      <div ref={containerRef} className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 h-0 w-full overflow-hidden"
        >
          <ul ref={measureListRef} className="flex whitespace-nowrap gap-2 compact:gap-1.5">
            {items.map((tech) => (
              <li key={tech} className={CHIP_CLASS}>
                {tech}
              </li>
            ))}
            <li className="rounded-md px-2 py-0.5 compact:py-0 [@media(min-height:441px)]:compact:py-0.5 text-[0.75rem] font-medium border border-border bg-surface-3 text-text">
              +{items.length}
            </li>
          </ul>
        </div>

        <ul ref={listRef} role="list" className="flex flex-wrap gap-2 compact:gap-1.5">
          {visibles.map((tech) => (
            <li key={tech} className={CHIP_CLASS}>
              {tech}
            </li>
          ))}
          {ocultas.length > 0 && (
            <li className="relative group/tag rounded-md shrink-0 flex">
              <button
                ref={tagButtonRef}
                type="button"
                className="relative cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]! rounded-md flex"
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onTouchStart={handleTouchStart}
                aria-expanded={open}
                aria-describedby={tooltipId}
                aria-label={t('projects.moreTechs', {
                  count: ocultas.length,
                  list: ocultas.join(', '),
                })}
              >
                <span
                  className={`block rounded-md px-2 py-0.5 compact:py-0 [@media(min-height:441px)]:compact:py-0.5 text-[0.75rem] font-medium border transition-colors ${
                    open
                      ? 'border-accent/50 text-accent bg-accent/10'
                      : 'bg-surface-3 text-text border-border group-hover/tag:border-accent/50 group-hover/tag:text-accent group-hover/tag:bg-accent/10'
                  }`}
                >
                  +{ocultas.length}
                </span>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 min-w-full min-h-full opacity-0 pointer-events-auto"></span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
