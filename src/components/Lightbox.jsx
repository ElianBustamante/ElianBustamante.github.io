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
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef(null)
  
  const photo = photos[index]
  const total = photos.length

  // Reiniciar el spinner, y apagarlo de inmediato si la foto ya estaba en caché
  useEffect(() => {
    setIsLoading(true)
    if (imgRef.current?.complete) {
      setIsLoading(false)
    }
  }, [index, photo.large.src])

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
      className="fixed inset-0 m-0 h-dvh w-dvw max-h-none max-w-none bg-black/95 p-4 backdrop:bg-black/95 transition-opacity duration-150 animate-fade-in overscroll-none"
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
          
          <figure className={`flex flex-col m-auto relative ${isZoomed ? 'min-w-max' : 'items-center justify-center'}`}>
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-12 h-12 border-4 border-white/10 border-t-accent rounded-full animate-spin shadow-[0_0_15px_rgba(255,106,26,0.3)]"></div>
              </div>
            )}

            <img
              ref={imgRef}
              src={photo.large.src}
              alt={photo.alt[lang] || photo.alt.es}
              onLoad={() => setIsLoading(false)}
              onClick={() => {
                const toggle = () => {
                  setIsZoomed(!isZoomed);
                  if (!isZoomed) setZoomLevel(2.5);
                };
                if (document.startViewTransition) document.startViewTransition(toggle);
                else toggle();
              }}
              style={{
                viewTransitionName: 'lightbox-image',
                ...(isZoomed ? { width: `${zoomLevel * 100}vw` } : {})
              }}
              className={`cursor-pointer ${
                isZoomed 
                  ? 'max-w-none max-h-none relative z-20 shadow-[0_0_100px_rgba(0,0,0,0.8)]' 
                  : 'max-h-[55dvh] md:max-h-[72dvh] max-w-full object-contain'
              }`}
            />
            
            {!isZoomed && (
              <figcaption className="mt-4 md:mt-5 text-center px-4 w-full animate-fade-in">
                {title && <p className="text-sm md:text-[15px] font-semibold text-accent">{title}</p>}
                {photo.description && (
                  <p className="text-[12px] md:text-[13px] text-white/80 mt-1 max-w-2xl mx-auto leading-relaxed">
                    {photo.description[lang] || photo.description.es}
                  </p>
                )}
                
                <div className="mt-3 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-[10px] md:text-[11px] tracking-[0.2em] text-white/40 uppercase">
                  <span>{t('photography.counter', { current: index + 1, total })}</span>
                  
                  {hasExif && <span className="hidden md:inline-block opacity-30">|</span>}
                  
                  {hasExif && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
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
            <div className="fixed bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-black/40 px-5 py-2.5 rounded-full flex gap-4 items-center backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-fade-in">
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.max(0.5, zoomLevel - 0.5)); }} 
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="Alejar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/></svg>
              </button>
              
              <input 
                type="range" 
                min="0.5" max="5" step="0.1" 
                value={zoomLevel} 
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))} 
                onClick={(e) => e.stopPropagation()}
                className="w-24 md:w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              />
              
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.min(5, zoomLevel + 0.5)); }} 
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="Acercar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
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


