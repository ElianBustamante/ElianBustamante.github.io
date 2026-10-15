import { useTranslation } from 'react-i18next'
import { useRef, useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import Section from './Section'
import { IconChevronLeft, IconChevronRight } from './icons'
import Lightbox from './Lightbox'
import photosData from '../data/photos.json'
import { SHORT_SCREEN_QUERY } from '../lib/media'
import { observeScrollState } from '../lib/overflow'

export default function PhotoGallery() {
  const { t, i18n } = useTranslation()
  const containerRef = useRef(null)
  const listRef = useRef(null)
  
  const [galleryHeight, setGalleryHeight] = useState(400)
  
  // Arrow state based on exact scroll position, not active photo index
  const [isAtStart, setIsAtStart] = useState(true)
  const [isAtEnd, setIsAtEnd] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lastFocusRef = useRef(null)
  const isTransitioningRef = useRef(false)

  const checkScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = listRef.current
    setShowButtons(scrollWidth > clientWidth)
    setIsAtStart(scrollLeft <= 5)
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 5)
  }, [])

  const recalculate = useCallback(() => {
    if (!containerRef.current) return
    const W = containerRef.current.clientWidth
    if (W === 0) return
    
    const H = window.innerHeight

    // Calculamos el ratio de la pantalla (Ancho / Alto) para hacer el carrusel hiper-responsivo
    const ratio = W / H;
    
    // Altura base puramente fluida
    let h = H * 0.50; 
    
    if (window.matchMedia(SHORT_SCREEN_QUERY).matches) {
      if (H <= 520) {
        h = Math.min(520, Math.max(150, Math.floor(containerRef.current.clientHeight)))
      } else {
        h = Math.min(520, Math.max(150, Math.floor(H * 0.72)))
      }
    } else {
      if (ratio > 2) {
        // Pantallas extremadamente chatas / súper horizontales (ej. celulares apaisados)
        h = H * 0.60;
      } else if (ratio > 1.2) {
        // Pantallas normales horizontales (ej. Laptops, Monitores)
        h = H * 0.59; 
      } else if (ratio < 0.6) {
        // Pantallas súper verticales (ej. Celulares muy altos y estrechos)
        // Como hay mucho espacio vertical, dejamos que las fotos crezcan más para llenarlo
        h = H * 0.55;
      } else {
        // Pantallas cuadradas o ligeramente verticales
        h = H * 0.50;
      }

      // Eliminamos los topes rígidos (Math.min de 400px o 800px) y dejamos que escale de forma fluida infinita.
      // Solo dejamos un tope mínimo por seguridad absoluta para no romper el CSS interno en pantallas minúsculas.
      h = Math.max(h, H * 0.25); // Nunca será menor al 25% del alto
    }


    setGalleryHeight(h)
  }, [])

  useEffect(() => {
    if (!photosData || photosData.length === 0) return
    recalculate()
    const currentContainer = containerRef.current
    const observer = new ResizeObserver(recalculate)
    if (currentContainer) observer.observe(currentContainer)
    window.addEventListener('resize', recalculate)
    window.addEventListener('orientationchange', recalculate)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', recalculate)
      window.removeEventListener('orientationchange', recalculate)
    }
  }, [recalculate])

  useEffect(() => {
    const list = listRef.current
    if (list) {
      list.addEventListener('scroll', checkScroll, { passive: true })
      const cleanupObserver = observeScrollState(list, checkScroll)
      return () => {
        list.removeEventListener('scroll', checkScroll)
        cleanupObserver()
      }
    }
  }, [checkScroll])

  const scrollByAmount = (direction) => {
    if (listRef.current && containerRef.current) {
      const W = containerRef.current.clientWidth
      listRef.current.scrollBy({ left: W * 0.8 * direction, behavior: 'smooth' })
    }
  }

  const openLightbox = async (index, event) => {
    if (isTransitioningRef.current) return
    lastFocusRef.current = event.currentTarget
    
    if (listRef.current) {
      listRef.current.style.scrollBehavior = 'auto'
      // Ensure visual update
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.style.scrollBehavior = ''
      })
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) {
      setLightboxIndex(index)
      return
    }

    isTransitioningRef.current = true
    if (containerRef.current) containerRef.current.style.pointerEvents = 'none'

    // Apuntamos EXACTAMENTE a la etiqueta <img> para un morphing puro y limpio
    const imgEl = event.currentTarget.querySelector('img')

    try {
      const largeSrc = photosData[index].large.src
      const pre = new Image()
      pre.src = largeSrc
      await pre.decode().catch(() => {})
    } catch {}

    // Limpiamos nombres de transiciones anteriores por seguridad
    document.querySelectorAll('button[id^="thumb-"] img').forEach(img => {
      img.style.removeProperty('view-transition-name')
    })

    if (imgEl) {
      imgEl.style.viewTransitionName = 'lightbox-image'
    }
    
    const root = document.documentElement
    root.setAttribute('data-vt', 'open')

    try {
      const transition = document.startViewTransition(() => {
        if (imgEl) {
          imgEl.style.removeProperty('view-transition-name')
        }
        flushSync(() => setLightboxIndex(index))
      })

      transition.ready.catch((e) => console.warn('VT omitida open:', e?.name, e?.message))

      transition.finished.catch(() => {}).finally(() => {
        if (imgEl) {
          imgEl.style.removeProperty('view-transition-name')
        }
        delete root.dataset.vt
        if (containerRef.current) containerRef.current.style.pointerEvents = ''
        isTransitioningRef.current = false
      })
    } catch (e) {
      console.error(e)
      setLightboxIndex(index)
      if (imgEl) {
        imgEl.style.removeProperty('view-transition-name')
      }
      root.removeAttribute('data-vt')
      if (containerRef.current) containerRef.current.style.pointerEvents = ''
      isTransitioningRef.current = false
    }
  }

  const closeLightbox = () => {
    if (isTransitioningRef.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) {
      setLightboxIndex(null)
      return
    }

    isTransitioningRef.current = true
    if (containerRef.current) containerRef.current.style.pointerEvents = 'none'

    document.querySelectorAll('button[id^="thumb-"] img').forEach(img => {
      img.style.removeProperty('view-transition-name')
    })

    const imgEl = document.querySelector(`#thumb-${lightboxIndex} img`)

    try {
      const transition = document.startViewTransition(() => {
        const lightboxImg = document.querySelector('[role="dialog"] img')
        if (lightboxImg) lightboxImg.style.removeProperty('view-transition-name')

        if (imgEl) {
          imgEl.style.viewTransitionName = 'lightbox-image'
        }
        
        flushSync(() => setLightboxIndex(null))
      })

      transition.ready.catch((e) => console.warn('VT omitida close:', e?.name, e?.message))

      transition.finished.catch(() => {}).finally(() => {
        if (imgEl) {
          imgEl.style.removeProperty('view-transition-name')
        }
        if (containerRef.current) containerRef.current.style.pointerEvents = ''
        isTransitioningRef.current = false
      })
    } catch (e) {
      console.error(e)
      setLightboxIndex(null)
      if (imgEl) {
        imgEl.style.removeProperty('view-transition-name')
      }
      if (containerRef.current) containerRef.current.style.pointerEvents = ''
      isTransitioningRef.current = false
    }
  }

  // Sincronizar el scroll del carrusel oculto con el índice del lightbox
  // Así cuando cerramos, la animación vuela a la foto correcta en pantalla
  useEffect(() => {
    if (lightboxIndex !== null && listRef.current) {
      const imgEl = document.getElementById(`thumb-${lightboxIndex}`)
      if (imgEl) {
        const li = imgEl.closest('li')
        if (li) {
          // Centramos la foto en el carrusel de fondo sin animación
          li.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' })
        }
      }
    }
  }, [lightboxIndex])
  
  if (!photosData || photosData.length === 0) {
    return (
      <Section id="fotografia" titleKey="photography.title">
        <p className="text-muted">{t('photography.intro')}</p>
      </Section>
    )
  }

  const actions = showButtons ? (
    <div className="flex items-center gap-2 relative z-10">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        disabled={isAtStart}
        aria-label={t('photography.scrollPrev')}
        className="flex min-h-[36px] min-w-[36px] md:min-h-11 md:min-w-11 items-center justify-center rounded-full border border-border bg-surface/60 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none"
      >
        <IconChevronLeft className="pointer-events-none" />
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        disabled={isAtEnd}
        aria-label={t('photography.scrollNext')}
        className="flex min-h-[36px] min-w-[36px] md:min-h-11 md:min-w-11 items-center justify-center rounded-full border border-border bg-surface/60 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none"
      >
        <IconChevronRight className="pointer-events-none" />
      </button>
    </div>
  ) : null

  return (
    <>
      <Section id="fotografia" titleKey="photography.title" actions={actions} fill>
        <p className="text-muted text-sm md:text-base mb-4 short:mb-2 short:text-[12px] short:leading-snug">{t('photography.intro')}</p>
        <div ref={containerRef} className="w-full compact:flex-1 compact:min-h-0">
          <ul
            role="list"
            ref={listRef}
            className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] py-4 -my-4 px-4 -mx-4 scroll-px-4 md:scroll-px-6 lg:scroll-px-8 gap-3 [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]"
          >
            {photosData.map((photo, i) => {
              const aspect = photo.thumb.width / photo.thumb.height
              const w = Math.floor(galleryHeight * aspect)
              
              return (
                <li
                  key={photo.id}
                  className="shrink-0 snap-center"
                  style={{ height: galleryHeight, width: w }}
                >
                  <button
                    id={`thumb-${i}`}
                    type="button"
                    onClick={(e) => openLightbox(i, e)}
                    className="group relative block h-full w-full overflow-hidden rounded-card transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,106,26,0.18)] outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none"
                  >
                    <div className="absolute inset-0 z-0 bg-surface-2/60 animate-pulse"></div>
                    
                    {/* Disuasión contra descarga fácil (no es seguridad real) */}
                    <img
                      src={photo.thumb.src}
                      width={photo.thumb.width}
                      height={photo.thumb.height}
                      alt={photo.alt[i18n.language] || photo.alt.es}
                      loading={i < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="relative z-10 block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none select-none [-webkit-touch-callout:none]"
                      style={{ aspectRatio: `${photo.thumb.width} / ${photo.thumb.height}` }}
                    />
                    
                    <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <span className="text-white font-semibold text-sm px-4 py-2 bg-black/60 rounded-full backdrop-blur-sm">
                        {t('photography.viewDetails')}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </Section>
      
      {lightboxIndex !== null && (
        <Lightbox
          photos={photosData}
          index={lightboxIndex}
          onClose={closeLightbox}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  )
}
