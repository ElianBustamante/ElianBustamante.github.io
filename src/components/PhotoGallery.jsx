import { useTranslation } from 'react-i18next'
import { useRef, useState, useEffect, useCallback } from 'react'
import Section from './Section'
import { IconChevronLeft, IconChevronRight } from './icons'
import Lightbox from './Lightbox'
import photosData from '../data/photos.json'

export default function PhotoGallery() {
  const { t, i18n } = useTranslation()
  const listRef = useRef(null)
  
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lastFocusRef = useRef(null)
  
  const checkScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = listRef.current
    setShowButtons(scrollWidth > clientWidth)
    setCanPrev(scrollLeft > 0)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])
  
  useEffect(() => {
    checkScroll()
    const list = listRef.current
    if (list) {
      list.addEventListener('scroll', checkScroll)
      const observer = new ResizeObserver(checkScroll)
      observer.observe(list)
      return () => {
        list.removeEventListener('scroll', checkScroll)
        observer.disconnect()
      }
    }
  }, [checkScroll])
  
  const scrollPrev = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: -Math.round(listRef.current.clientWidth * 0.8), behavior: 'smooth' })
    }
  }
  
  const scrollNext = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: Math.round(listRef.current.clientWidth * 0.8), behavior: 'smooth' })
    }
  }
  
  const openLightbox = (index, event) => {
    lastFocusRef.current = event.currentTarget
    setLightboxIndex(index)
  }
  
  const closeLightbox = () => {
    setLightboxIndex(null)
    if (lastFocusRef.current) {
      lastFocusRef.current.focus()
    }
  }
  
  if (!photosData || photosData.length === 0) {
    return (
      <Section id="fotografia" titleKey="photography.title">
        <p className="text-muted">{t('photography.intro')}</p>
      </Section>
    )
  }

  const actions = showButtons ? (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canPrev}
        aria-label={t('photography.scrollPrev')}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors"
      >
        <IconChevronLeft />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canNext}
        aria-label={t('photography.scrollNext')}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors"
      >
        <IconChevronRight />
      </button>
    </div>
  ) : null

  return (
    <>
      <Section id="fotografia" titleKey="photography.title" actions={actions}>
        <p className="text-muted mb-6">{t('photography.intro')}</p>
        <ul
          role="list"
          ref={listRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none]"
        >
          {photosData.map((photo, index) => (
            <li
              key={photo.id}
              className="h-[min(240px,calc((100vw-2rem)/1.5))] sm:h-[300px] lg:h-[360px] shrink-0 snap-start"
            >
              <button
                type="button"
                onClick={(e) => openLightbox(index, e)}
                className="block h-full overflow-hidden rounded-card border border-accent/40 hover:border-accent"
              >
                <img
                  src={photo.thumb.src}
                  width={photo.thumb.width}
                  height={photo.thumb.height}
                  alt={photo.alt[i18n.language] || photo.alt.es}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="block h-full w-auto"
                  style={{ aspectRatio: `${photo.thumb.width} / ${photo.thumb.height}` }}
                />
              </button>
            </li>
          ))}
        </ul>
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
