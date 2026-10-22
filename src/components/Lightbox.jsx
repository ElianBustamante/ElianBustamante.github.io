import { useTranslation } from 'react-i18next'
import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { IconClose, IconChevronLeft, IconChevronRight } from './icons'

const MIN_ZOOM_FLOOR = 0.2
const MAX_ZOOM = 4
const DEFAULT_ZOOM = 2.5
const DRAG_THRESHOLD = 4

export default function Lightbox({ photos, index, onClose, onIndexChange }) {
  const { t, i18n } = useTranslation()
  const dialogRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const imgRef = useRef(null)

  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM)
  const [minZoom, setMinZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  const dragRef = useRef({ active: false, started: false, x: 0, y: 0, left: 0, top: 0 })
  const suppressClickRef = useRef(false)
  const centerRef = useRef({ x: 0.5, y: 0.5 })
  const touchStartRef = useRef(null)
  const pinchRef = useRef(null)

  const photo = photos[index]
  const total = photos.length

  useEffect(() => {
    setIsLoading(!(imgRef.current && imgRef.current.complete))
  }, [index, photo.large.src])

  useEffect(() => {
    document.documentElement.classList.add('overflow-hidden')
    dialogRef.current?.focus()
    return () => {
      document.documentElement.classList.remove('overflow-hidden')
    }
  }, [])

  // Si el foco se pierde (por ejemplo, al desmontarse el slider), devuélvelo al visor
  useEffect(() => {
    if (!isZoomed && document.activeElement === document.body) {
      dialogRef.current?.focus()
    }
  }, [isZoomed])

  // Preload
  useEffect(() => {
    const prev = (index - 1 + total) % total
    const next = (index + 1) % total
    const img1 = new Image()
    img1.src = photos[prev].large.src
    const img2 = new Image()
    img2.src = photos[next].large.src
  }, [index, photos, total])

  // El zoom mantiene el centro de la vista
  useLayoutEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    if (isZoomed) {
      el.scrollLeft = centerRef.current.x * el.scrollWidth - el.clientWidth / 2
      el.scrollTop = centerRef.current.y * el.scrollHeight - el.clientHeight / 2
    } else {
      centerRef.current = { x: 0.5, y: 0.5 }
    }
  }, [zoomLevel, isZoomed])

  const measureFitZoom = () => {
    const w = imgRef.current?.getBoundingClientRect?.().width
    const ratio = w / window.innerWidth
    if (!Number.isFinite(ratio) || ratio <= 0) return 1
    return Math.min(1, Math.max(MIN_ZOOM_FLOOR, ratio))
  }

  const enterZoom = () => {
    const m = measureFitZoom()
    setMinZoom(m)
    setZoomLevel(Math.max(m, DEFAULT_ZOOM))
    setIsZoomed(true)
  }
  const exitZoom = () => setIsZoomed(false)
  const toggleZoom = () => (isZoomed ? exitZoom() : enterZoom())
  const applyZoom = (n) => setZoomLevel(Math.min(MAX_ZOOM, Math.max(minZoom, n)))

  const changePhoto = (nextIdx) => {
    setIsZoomed(false)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (document.startViewTransition && !reduce) {
      document.startViewTransition(() => {
        flushSync(() => onIndexChange(nextIdx))
      })
    } else {
      onIndexChange(nextIdx)
    }
  }
  const goNext = () => changePhoto((index + 1) % total)
  const goPrev = () => changePhoto((index - 1 + total) % total)

  const handleKeyDown = (e) => {
    const onInput = e.target?.tagName === 'INPUT'
    if (e.key === 'ArrowRight' && !isZoomed && !onInput) goNext()
    else if (e.key === 'ArrowLeft' && !isZoomed && !onInput) goPrev()
    else if (e.key === 'Escape') {
      e.preventDefault()
      if (isZoomed) {
        setIsZoomed(false)
        dialogRef.current?.focus()
      } else {
        onClose()
      }
    }
  }

  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) onClose()
  }

  // ---- Táctil: deslizar entre fotos (sin zoom) y pellizcar ----
  const pinchDistance = (touches) =>
    Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { dist: pinchDistance(e.touches), zoom: isZoomed ? zoomLevel : measureFitZoom() }
      touchStartRef.current = null
      return
    }
    if (isZoomed || e.touches.length !== 1) return
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const ratio = pinchDistance(e.touches) / pinchRef.current.dist
      const next = pinchRef.current.zoom * ratio
      if (!isZoomed) {
        if (ratio > 1.05) {
          const m = measureFitZoom()
          setMinZoom(m)
          setIsZoomed(true)
          setZoomLevel(Math.min(MAX_ZOOM, Math.max(m, next)))
        }
      } else {
        applyZoom(next)
      }
    }
  }

  const handleTouchEnd = (e) => {
    if (pinchRef.current) {
      if (e.touches.length < 2) pinchRef.current = null
      touchStartRef.current = null
      return
    }
    const start = touchStartRef.current
    touchStartRef.current = null
    if (isZoomed || !start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev()
      else goNext()
    }
  }

  // ---- Mouse: arrastrar para moverse con la foto ampliada ----
  const endDrag = (e) => {
    const d = dragRef.current
    if (d.started && e?.currentTarget?.hasPointerCapture?.(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* noop */
      }
    }
    dragRef.current = { ...d, active: false, started: false }
    setIsDragging(false)
  }

  const handlePointerDown = (e) => {
    suppressClickRef.current = false
    if (!isZoomed || e.pointerType !== 'mouse' || e.button !== 0) return
    if (e.target.closest('[data-zoom-control], button, input')) return
    const el = e.currentTarget
    dragRef.current = {
      active: true,
      started: false,
      x: e.clientX,
      y: e.clientY,
      left: el.scrollLeft,
      top: el.scrollTop,
    }
  }

  const handlePointerMove = (e) => {
    const d = dragRef.current
    if (!d.active || e.pointerType !== 'mouse') return
    if ((e.buttons & 1) === 0) {
      endDrag(e)
      return
    }
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.started) {
      if (Math.abs(dx) <= DRAG_THRESHOLD && Math.abs(dy) <= DRAG_THRESHOLD) return
      d.started = true
      suppressClickRef.current = true
      setIsDragging(true)
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
    e.currentTarget.scrollLeft = d.left - dx
    e.currentTarget.scrollTop = d.top - dy
  }

  const handleScroll = (e) => {
    if (!isZoomed) return
    const el = e.currentTarget
    centerRef.current = {
      x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth,
      y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight,
    }
  }

  // EXIF checks
  const e = photo.exif || {}
  const hasExif = Object.values(e).some((val) => val !== null)

  const lang = i18n.language
  const title = photo.title ? photo.title[lang] || photo.title.es : null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      onClick={handleDialogClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label={t('photography.lightboxLabel')}
      className="fixed inset-0 z-[100] m-0 h-dvh w-dvw max-h-none max-w-none bg-black p-4 short:py-2 transition-opacity duration-150 overscroll-none animate-fade-in"
      style={{ outline: 'none', colorScheme: 'dark' }}
      tabIndex={-1}
    >
      <div className="flex h-full flex-col" style={{ outline: 'none' }}>
        <div className="flex justify-end mb-4 gap-2 z-[70] md:absolute md:top-4 md:right-4 short:absolute short:top-4 short:right-4 short:mb-0">
          <button
            type="button"
            onClick={toggleZoom}
            aria-pressed={isZoomed}
            aria-label={isZoomed ? t('photography.zoomOut') : t('photography.zoomIn')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
              {!isZoomed && <path d="M11 8v6" />}
              <path d="M8 11h6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => {
              if (document.activeElement) document.activeElement.blur()
              onClose()
            }}
            aria-label={t('photography.close')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <IconClose />
          </button>
        </div>

        {/* Contenedor que recibe toques/clics: disuasión contra descarga fácil (no es seguridad real) */}
        <div
          ref={scrollContainerRef}
          className={`flex flex-1 relative min-h-0 ${
            isZoomed
              ? 'overflow-auto overscroll-contain items-start justify-start [&::-webkit-scrollbar]:hidden'
              : 'items-center justify-center'
          }`}
          style={{
            touchAction: isZoomed ? 'pan-x pan-y' : 'none',
            ...(isZoomed ? { scrollbarWidth: 'none' } : {}),
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onScroll={handleScroll}
          onDragStart={(ev) => ev.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            data-zoom-control
            onClick={goPrev}
            aria-label={t('photography.prev')}
            className={`hidden md:flex short:flex left-4 z-10 min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors ${
              isZoomed ? 'top-1/2 -translate-y-1/2 fixed' : 'absolute top-1/2 -translate-y-1/2'
            }`}
          >
            <IconChevronLeft />
          </button>

          <figure
            className={`flex flex-col relative short:py-1! short:justify-center! ${
              isZoomed ? 'm-auto min-w-max pt-2 md:pt-6 w-fit h-fit' : 'm-auto w-full h-full items-center justify-center py-2 md:pt-11 md:pb-2 [@media(max-height:440px)]:short:pt-5!'
            }`}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-12 h-12 border-4 border-white/10 border-t-accent rounded-full animate-spin shadow-[0_0_15px_rgba(255,106,26,0.3)]"></div>
              </div>
            )}

            {/* Disuasión contra descarga fácil (no es seguridad real) */}
            <img
              ref={imgRef}
              src={photo.large.src}
              width={photo.large.width}
              height={photo.large.height}
              alt={photo.alt[lang] || photo.alt.es}
              draggable={false}
              onDragStart={(ev) => ev.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              onLoad={() => setIsLoading(false)}
              onClick={() => {
                if (suppressClickRef.current) {
                  suppressClickRef.current = false
                  return
                }
                toggleZoom()
              }}
              style={{
                viewTransitionName: 'lightbox-image',
                aspectRatio: `${photo.large.width} / ${photo.large.height}`,
                minWidth: '1px',
                minHeight: '1px',
                backgroundImage: `url(${photo.thumb.src})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                WebkitUserDrag: 'none',
                ...(isZoomed ? { width: `${zoomLevel * 100}vw`, height: 'auto' } : {}),
              }}
              className={`${
                isZoomed ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
              } select-none [-webkit-touch-callout:none] ${
                isZoomed
                  ? 'max-w-none max-h-none shadow-[0_0_100px_rgba(0,0,0,0.8)]'
                  : 'm-auto -translate-y-1 md:-translate-y-0.5 max-h-[60dvh] md:max-h-[80dvh] compact:max-h-[calc(100dvh-3.5rem)]! [@media(min-height:441px)]:compact:max-h-[calc(100dvh-4.5rem)]! [@media(min-height:521px)]:short:max-h-[calc(100dvh-6.5rem)]! short:m-0! [@media(min-height:441px)]:compact:mt-4! max-w-full w-auto h-auto'
              }`}
            />
            {!isZoomed && (
              <figcaption className="shrink-0 mt-3 md:mt-5 short:mt-2! text-center px-4 w-full animate-fade-in z-20 flex flex-col short:flex-row short:items-baseline short:justify-center short:gap-3 [@media(min-height:521px)]:short:absolute [@media(min-height:521px)]:short:inset-x-0 [@media(min-height:521px)]:short:bottom-1">
                {title && (
                  <p className="text-sm md:text-[15px] [@media(min-height:800px)]:text-base short:text-[12px] font-medium text-text/90 drop-shadow-md">
                    {title}
                  </p>
                )}

                {title && (
                  <span className="hidden short:inline-block opacity-30 text-white/50 text-[12px]">—</span>
                )}

                <div className="mt-2 short:mt-0 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-[10px] md:text-[11px] [@media(min-height:800px)]:text-xs short:text-[11px] tracking-[0.2em] text-white/50 uppercase drop-shadow-md">
                  <span>{t('photography.counter', { current: index + 1, total })}</span>

                  {hasExif && (
                    <span className="hidden md:inline-block short:hidden opacity-30">|</span>
                  )}

                  {hasExif && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 short:hidden">
                      {e.camera && <span>{e.camera}</span>}
                      {e.focalLength && <span>{e.focalLength}</span>}
                      {e.aperture && <span>{e.aperture}</span>}
                      {e.shutter && <span>{e.shutter}</span>}
                      {e.iso && <span>ISO {e.iso}</span>}
                    </div>
                  )}
                </div>
              </figcaption>
            )}
          </figure>

          {isZoomed && (
            <div
              data-zoom-control
              onPointerDown={(ev) => ev.stopPropagation()}
              onClick={(ev) => ev.stopPropagation()}
              className="fixed bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-black/40 px-5 py-2.5 rounded-full flex gap-4 items-center backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-fade-in"
            >
              <button
                type="button"
                onClick={() => applyZoom(zoomLevel - 0.25)}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label={t('photography.zoomOut')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14" />
                </svg>
              </button>

              <input
                type="range"
                min={minZoom}
                max={MAX_ZOOM}
                step="any"
                value={zoomLevel}
                onChange={(ev) => applyZoom(parseFloat(ev.target.value))}
                aria-label={t('photography.zoomLevel')}
                className="w-24 md:w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              />

              <button
                type="button"
                onClick={() => applyZoom(zoomLevel + 0.25)}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label={t('photography.zoomIn')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          )}

          <button
            type="button"
            data-zoom-control
            onClick={goNext}
            aria-label={t('photography.next')}
            className={`hidden md:flex short:flex right-4 z-10 min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors ${
              isZoomed ? 'top-1/2 -translate-y-1/2 fixed' : 'absolute top-1/2 -translate-y-1/2'
            }`}
          >
            <IconChevronRight />
          </button>
        </div>

        <div className="flex md:hidden short:hidden justify-between mt-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label={t('photography.prev')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t('photography.next')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}