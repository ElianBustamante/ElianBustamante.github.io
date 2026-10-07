import { useTranslation } from 'react-i18next'
import { useRef, useEffect, useState } from 'react'
import { IconClose, IconChevronLeft, IconChevronRight } from './icons'

export default function Lightbox({ photos, index, onClose, onIndexChange }) {
  const { t, i18n } = useTranslation()
  const dialogRef = useRef(null)
  
  // To handle touch
  const [touchStart, setTouchStart] = useState(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(2.5) // Nivel exacto de zoom
  
  const photo = photos[index]
  const total = photos.length

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [])
  
  useEffect(() => {
    // Lock scroll
    document.documentElement.classList.add('overflow-hidden')
    return () => {
      document.documentElement.classList.remove('overflow-hidden')
    }
  }, [])
  
  // Preload
  useEffect(() => {
    const prev = (index - 1 + total) % total
    const next = (index + 1) % total
    const img1 = new Image()
    img1.src = photos[prev].large.src
    const img2 = new Image()
    img2.src = photos[next].large.src
  }, [index, photos, total])

  const goNext = () => {
    setIsZoomed(false)
    const nextIdx = (index + 1) % total
    if (document.startViewTransition) {
      document.startViewTransition(() => onIndexChange(nextIdx))
    } else {
      onIndexChange(nextIdx)
    }
  }

  const goPrev = () => {
    setIsZoomed(false)
    const prevIdx = (index - 1 + total) % total
    if (document.startViewTransition) {
      document.startViewTransition(() => onIndexChange(prevIdx))
    } else {
      onIndexChange(prevIdx)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') goNext()
    if (e.key === 'ArrowLeft') goPrev()
  }

  const handleClose = () => {
    onClose()
  }
  
  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  const handleTouchStart = (e) => {
    if (isZoomed) return; // Candado: bloquea el swipe si hay zoom
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchEnd = (e) => {
    if (isZoomed || !touchStart) return; // Candado: aborta si hay zoom
    const dx = e.changedTouches[0].clientX - touchStart.x
    const dy = e.changedTouches[0].clientY - touchStart.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev()
      else goNext()
    }
    setTouchStart(null)
  }

  // EXIF checks
  const e = photo.exif || {}
  const hasExif = Object.values(e).some((val) => val !== null)

  const lang = i18n.language
  const title = photo.title ? (photo.title[lang] || photo.title.es) : null

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleDialogClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={t('photography.lightboxLabel')}
      className="fixed inset-0 m-0 h-dvh w-dvw max-h-none max-w-none bg-black/95 p-4 backdrop:bg-black/95 transition-opacity duration-150 animate-fade-in"
    >
      <div className="flex h-full flex-col">
        <div className="flex justify-end mb-4 md:absolute md:top-4 md:right-4 md:z-10">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('photography.close')}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors"
          >
            <IconClose />
          </button>
        </div>

        <div className={`flex flex-1 relative ${isZoomed ? 'overflow-auto items-start justify-start' : 'items-center justify-center'}`}>
          <button
            type="button"
            onClick={goPrev}
            className={`hidden md:flex left-4 z-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors ${isZoomed ? 'top-1/2 -translate-y-1/2 fixed' : 'absolute'}`}
          >
            <IconChevronLeft />
          </button>
          
          <figure className={`flex flex-col m-auto ${isZoomed ? 'min-w-max' : 'items-center justify-center'}`}>
            <img
              src={photo.large.src}
              alt={photo.alt[lang] || photo.alt.es}
              onClick={() => {
                setIsZoomed(!isZoomed);
                setZoomLevel(2.5);
              }}
              style={isZoomed ? { width: `${zoomLevel * 100}vw` } : {}}
              className={`transition-all duration-300 cursor-pointer ${
                isZoomed 
                  ? 'max-w-none max-h-none relative z-20' 
                  : 'max-h-[55dvh] md:max-h-[75dvh] max-w-full object-contain'
              }`}
            />
            
            {!isZoomed && (
              <figcaption className="mt-4 text-center">
                {title && <p className="text-accent font-semibold">{title}</p>}
                {photo.description && (
                  <p className="text-text/90 text-[15px] mt-2 mb-2 max-w-2xl mx-auto">
                    {photo.description[lang] || photo.description.es}
                  </p>
                )}
                <p className="text-muted text-sm">{t('photography.counter', { current: index + 1, total })}</p>
              
                {hasExif && (
                  <dl className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted">
                    {e.camera && <div className="flex gap-1"><dt className="font-semibold">{t('photography.exif.camera')}:</dt><dd>{e.camera}</dd></div>}
                    {e.lens && <div className="flex gap-1"><dt className="font-semibold">{t('photography.exif.lens')}:</dt><dd>{e.lens}</dd></div>}
                    {e.focalLength && <div className="flex gap-1"><dt className="font-semibold">{t('photography.exif.focalLength')}:</dt><dd>{e.focalLength}</dd></div>}
                    {e.aperture && <div className="flex gap-1"><dt className="font-semibold">{t('photography.exif.aperture')}:</dt><dd>{e.aperture}</dd></div>}
                    {e.shutter && <div className="flex gap-1"><dt className="font-semibold">{t('photography.exif.shutter')}:</dt><dd>{e.shutter}</dd></div>}
                    {e.iso && <div className="flex gap-1"><dt className="font-semibold">{t('photography.exif.iso')}:</dt><dd>{e.iso}</dd></div>}
                  </dl>
                )}
              </figcaption>
            )}
          </figure>

          {isZoomed && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-black/80 px-6 py-3 rounded-full flex gap-4 items-center backdrop-blur-md shadow-lg border border-white/10">
              <span className="text-white text-xl font-bold cursor-pointer hover:text-accent transition-colors" onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.max(1.5, zoomLevel - 0.5)); }}>-</span>
              <input 
                type="range" 
                min="1.5" max="4" step="0.1" 
                value={zoomLevel} 
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))} 
                onClick={(e) => e.stopPropagation()}
                className="w-32 accent-white"
              />
              <span className="text-white text-xl font-bold cursor-pointer hover:text-accent transition-colors" onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.min(4, zoomLevel + 0.5)); }}>+</span>
            </div>
          )}
          
          <button
            type="button"
            onClick={goNext}
            className={`hidden md:flex right-4 z-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors ${isZoomed ? 'top-1/2 -translate-y-1/2 fixed' : 'absolute'}`}
          >
            <IconChevronRight />
          </button>
        </div>

        <div className="flex md:hidden justify-between mt-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label={t('photography.prev')}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t('photography.next')}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-surface/50 text-text hover:bg-surface transition-colors"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>
    </dialog>
  )
}


