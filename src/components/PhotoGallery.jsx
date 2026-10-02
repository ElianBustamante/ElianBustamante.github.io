import { useTranslation } from 'react-i18next'
import { useRef, useState, useEffect, useCallback } from 'react'
import Section from './Section'
import { IconChevronLeft, IconChevronRight } from './icons'
import Lightbox from './Lightbox'
import photosData from '../data/photos.json'
import { paginatePhotos } from '../lib/paginatePhotos'

export default function PhotoGallery() {
  const { t, i18n } = useTranslation()
  const containerRef = useRef(null)
  const listRef = useRef(null)
  
  const [pagesData, setPagesData] = useState({ pages: [], height: 360, width: 0 })
  const [currentPage, setCurrentPage] = useState(0)
  
  const visiblePhotoRef = useRef(0)
  const isResizingRef = useRef(false)

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lastFocusRef = useRef(null)

  const recalculate = useCallback(() => {
    if (!containerRef.current) return
    const W = containerRef.current.clientWidth
    if (W === 0) return
    
    let h = 360
    if (W >= 1024) h = 360
    else if (W >= 640) h = 280
    else h = Math.min(Math.floor(W / 1.5), 360)

    const aspects = photosData.map(p => p.thumb.width / p.thumb.height)
    const newPages = paginatePhotos(aspects, h, W, 12)
    
    setPagesData({ pages: newPages, height: h, width: W })

    let newPageIdx = newPages.findIndex(p => p.includes(visiblePhotoRef.current))
    if (newPageIdx === -1) newPageIdx = 0
    
    setCurrentPage(newPageIdx)
    
    if (listRef.current) {
      isResizingRef.current = true
      listRef.current.style.scrollBehavior = 'auto'
      listRef.current.scrollLeft = newPageIdx * W
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.style.scrollBehavior = ''
        setTimeout(() => { isResizingRef.current = false }, 50)
      })
    }
  }, [])

  useEffect(() => {
    if (!photosData || photosData.length === 0) return
    recalculate()
    const currentContainer = containerRef.current
    const observer = new ResizeObserver(recalculate)
    if (currentContainer) observer.observe(currentContainer)
    return () => {
      observer.disconnect()
    }
  }, [recalculate])

  const handleScroll = useCallback(() => {
    if (!listRef.current || !containerRef.current || isResizingRef.current) return
    const W = containerRef.current.clientWidth
    const newPage = Math.round(listRef.current.scrollLeft / W)
    if (newPage !== currentPage && pagesData.pages[newPage]) {
      setCurrentPage(newPage)
      visiblePhotoRef.current = pagesData.pages[newPage][0]
    }
  }, [currentPage, pagesData.pages])

  useEffect(() => {
    const list = listRef.current
    if (list) {
      list.addEventListener('scroll', handleScroll, { passive: true })
      return () => list.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const scrollPrev = () => {
    if (listRef.current && containerRef.current) {
      const W = containerRef.current.clientWidth
      listRef.current.scrollTo({ left: (currentPage - 1) * W, behavior: 'smooth' })
    }
  }

  const scrollNext = () => {
    if (listRef.current && containerRef.current) {
      const W = containerRef.current.clientWidth
      listRef.current.scrollTo({ left: (currentPage + 1) * W, behavior: 'smooth' })
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

  const totalPages = pagesData.pages.length
  const showArrows = totalPages > 1

  const actions = showArrows ? (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={scrollPrev}
        disabled={currentPage === 0}
        aria-label={t('photography.scrollPrev')}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors"
      >
        <IconChevronLeft />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={currentPage === totalPages - 1}
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
        <div ref={containerRef} className="w-full">
          <ul
            role="list"
            ref={listRef}
            className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          >
            {pagesData.pages.map((pageIndices, pageIndex) => {
              const isLastPage = pageIndex === pagesData.pages.length - 1
              let flexAlign = isLastPage ? 'flex-start' : 'center'
              let gapValue = 12

              if (!isLastPage && pageIndices.length > 1) {
                let usedWidth = 0
                pageIndices.forEach(index => {
                  const photo = photosData[index]
                  usedWidth += Math.floor(pagesData.height * (photo.thumb.width / photo.thumb.height))
                })
                const remaining = pagesData.width - usedWidth
                const theoreticalGap = remaining / (pageIndices.length - 1)
                
                if (theoreticalGap <= 32) {
                  flexAlign = 'space-between'
                } else {
                  flexAlign = 'center'
                  gapValue = 32
                }
              }

              return (
              <li key={pageIndex} className="w-full shrink-0 snap-start">
                <ul
                  role="list"
                  className="flex w-full items-center"
                  style={{
                    height: pagesData.height,
                    gap: gapValue,
                    justifyContent: flexAlign
                  }}
                >
                  {pageIndices.map(index => {
                    const photo = photosData[index]
                    const aspect = photo.thumb.width / photo.thumb.height
                    const w = Math.floor(pagesData.height * aspect)
                    return (
                      <li
                        key={photo.id}
                        style={{ height: pagesData.height, width: w }}
                      >
                        <button
                          type="button"
                          onClick={(e) => openLightbox(index, e)}
                          className="block h-full w-full overflow-hidden rounded-card border border-accent/40 hover:border-accent"
                        >
                          <img
                            src={photo.thumb.src}
                            width={photo.thumb.width}
                            height={photo.thumb.height}
                            alt={photo.alt[i18n.language] || photo.alt.es}
                            loading={pageIndex === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="block h-full w-full object-cover"
                            style={{ aspectRatio: `${photo.thumb.width} / ${photo.thumb.height}` }}
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </li>
              )
            })}
          </ul>
          {showArrows && (
            <p aria-live="polite" className="text-muted text-[0.875rem] mt-4 text-center">
              {t('photography.pageCounter', { current: currentPage + 1, total: totalPages })}
            </p>
          )}
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
