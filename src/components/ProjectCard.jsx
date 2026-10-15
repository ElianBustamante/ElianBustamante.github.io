import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { IconBot, IconDatabase, IconTerminal, IconGithub, IconDiscordAlt, IconGamepad } from './icons'
import useMediaQuery from '../hooks/useMediaQuery'
import { fitChipCount } from '../lib/chips'
import { isHttpsUrl } from '../lib/url'

const IconMap = {
  bot: IconBot,
  database: IconDatabase,
  terminal: IconTerminal,
  discord: IconDiscordAlt,
  gamepad: IconGamepad
}

export default function ProjectCard({ project, isActive }) {
  const { t } = useTranslation()
  const [activeTooltip, setActiveTooltip] = useState(null)

  // chips se memoiza con useMemo para evitar crear un nuevo array en cada render
  // (por ejemplo al hacer hover o abrir el tooltip), lo que re-ejecutaría innecesariamente el efecto de medición.
  const chips = useMemo(() => (project.tags || []).slice(1), [project.tags])
  const visibleCount = useMediaQuery('(min-width: 640px)') ? 3 : 2
  const [chipCount, setChipCount] = useState(visibleCount)
  const chipsContainerRef = useRef(null)
  const measureContainerRef = useRef(null)

  useLayoutEffect(() => {
    const container = chipsContainerRef.current
    const measureEl = measureContainerRef.current
    if (!container || !measureEl || chips.length === 0) return

    const measure = () => {
      const containerWidth = container.getBoundingClientRect().width
      if (containerWidth === 0 || container.clientWidth === 0) {
        setChipCount(visibleCount)
        return
      }

      const children = Array.from(measureEl.children)
      if (children.length < chips.length + 1) return

      const widths = children.slice(0, chips.length).map((el) => Math.ceil(el.getBoundingClientRect().width))
      const plusWidth = Math.ceil(children[chips.length].getBoundingClientRect().width)

      let gap = 8
      const computedGap = window.getComputedStyle(container).columnGap
      if (computedGap) {
        const parsed = parseFloat(computedGap)
        if (!isNaN(parsed)) gap = parsed
      }

      const available = Math.floor(containerWidth) - 1
      const count = fitChipCount(widths, plusWidth, available, gap)
      setChipCount(count)
    }

    measure()

    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure)
      // Se observan el contenedor y cada hijo de la fila de medición porque
      // el ancho de los chips puede cambiar sin que cambie el contenedor (ej. al cargar la fuente Inter Variable).
      ro.observe(container)
      Array.from(measureEl.children).forEach((el) => ro.observe(el))
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
      if (typeof document !== 'undefined' && document.fonts && typeof document.fonts.removeEventListener === 'function') {
        document.fonts.removeEventListener('loadingdone', onLoadingDone)
      }
    }
  }, [chips, visibleCount])

  const visibles = chips.slice(0, chipCount)
  const ocultas = chips.slice(chipCount)

  const [tagPos, setTagPos] = useState({ top: 0, left: 0, showAbove: true })
  const tagButtonRef = useRef(null)
  const isHoveredRef = useRef(false)
  const touchHandledRef = useRef(false)

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
    if (activeTooltip === 'tag') {
      const closeTooltip = () => {
        isHoveredRef.current = false
        setActiveTooltip(null)
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
    }
  }, [activeTooltip])

  const handleMouseEnter = (e) => {
    if (e.nativeEvent.pointerType && e.nativeEvent.pointerType !== 'mouse') return
    isHoveredRef.current = true
    updateTooltipPosition(e.currentTarget)
    setActiveTooltip('tag')
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    setActiveTooltip((prev) => (prev === 'tag' ? null : prev))
  }

  const handleFocus = (e) => {
    isHoveredRef.current = false
    updateTooltipPosition(e.currentTarget)
    setActiveTooltip('tag')
  }

  const handleBlur = () => {
    isHoveredRef.current = false
    setActiveTooltip((prev) => (prev === 'tag' ? null : prev))
  }

  const handleTouchStart = (e) => {
    isHoveredRef.current = false
    touchHandledRef.current = true
    if (activeTooltip === 'tag') {
      setActiveTooltip(null)
    } else {
      updateTooltipPosition(e.currentTarget)
      setActiveTooltip('tag')
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
    if (activeTooltip === 'tag') {
      setActiveTooltip(null)
    } else {
      updateTooltipPosition(e.currentTarget)
      setActiveTooltip('tag')
    }
  }


  const portalContent = activeTooltip === 'tag' && ocultas.length > 0 ? createPortal(
    <div 
      id={`tooltip-tags-${project.id}`} 
      role="tooltip" 
      className="fixed z-[70] w-max max-w-[12.5rem] rounded-lg bg-black/95 backdrop-blur-xl border border-white/10 px-3 py-2 text-[0.75rem] font-medium text-white shadow-2xl pointer-events-none animate-fade-in"
      style={{
         top: tagPos.showAbove ? 'auto' : tagPos.top,
         bottom: tagPos.showAbove ? (typeof window !== 'undefined' ? window.innerHeight - tagPos.top : 0) : 'auto',
         left: `clamp(calc(6.25rem + 8px), ${tagPos.left}px, calc(100vw - 6.25rem - 8px))`,
         transform: 'translateX(-50%)'
      }}
    >
      {ocultas.join(', ')}
    </div>,
    document.body
  ) : null

  return (
    <article className={`relative group flex h-full max-md:min-h-[clamp(340px,52dvh,400px)] compact:min-h-0! flex-col rounded-card border bg-surface has-[:focus-visible]:border-accent has-[:focus-visible]:shadow-[0_8px_20px_rgba(255,106,26,0.12)] transition-[transform,box-shadow,border-color] duration-500 lg:hover:-translate-y-1.5 lg:hover:shadow-[0_8px_20px_rgba(255,106,26,0.12)] lg:hover:border-accent/60 ${
      isActive 
        ? 'border-border max-lg:border-accent/60 max-lg:shadow-[0_8px_20px_rgba(255,106,26,0.12)]' 
        : 'border-border'
    }`}>
      {portalContent}

      {project.image ? (
        <div className="relative w-full shrink-0 h-[clamp(72px,12dvh,112px)] md:h-[clamp(80px,13dvh,200px)] overflow-hidden rounded-t-[calc(var(--radius-card)-1px)] border-b border-border/50 compact:hidden">
          <div className="absolute inset-0 bg-surface-2 animate-pulse z-0" />
          <img
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable="false"
            className={`relative z-10 h-full w-full object-cover select-none transition-transform duration-700 ease-out lg:group-hover:scale-[1.05] ${isActive ? 'max-lg:scale-[1.05]' : ''}`}
          />
          {project.tags && project.tags.length > 0 && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 rounded-full bg-black/60 backdrop-blur-md px-1.5 py-0.5 sm:px-3 sm:py-1 text-[0.75rem] font-medium tracking-wide text-white border border-white/10 shadow-lg max-w-[85%] truncate">
              {project.tags[0]}
            </span>
          )}
        </div>
      ) : (
        <div className="relative w-full shrink-0 h-[clamp(72px,12dvh,112px)] md:h-[clamp(80px,13dvh,200px)] flex items-center justify-center rounded-t-[calc(var(--radius-card)-1px)] bg-surface-2 border-b border-border/50 overflow-hidden compact:hidden">
          {/* Fondo abstracto de resplandor (Spotlight) */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/60 via-surface to-surface"></div>
          
          {/* Ícono gigante y animado con brillo */}
          <div className={`relative z-10 h-[56%] aspect-square flex items-center justify-center text-accent/80 transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,106,26,0.4)] lg:group-hover:text-accent lg:group-hover:scale-110 lg:group-hover:-translate-y-1 ${isActive ? 'max-lg:text-accent max-lg:scale-110 max-lg:-translate-y-1' : ''}`}>
            {project.icon ? (() => {
              const Icon = IconMap[project.icon] || IconTerminal;
              return <Icon size="100%" strokeWidth={1.5} className="w-full h-full" />
            })() : <IconTerminal size="100%" strokeWidth={1.5} className="w-full h-full" />}
          </div>

          {project.tags && project.tags.length > 0 && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 rounded-full bg-black/60 backdrop-blur-md px-1.5 py-0.5 sm:px-3 sm:py-1 text-[0.75rem] font-medium tracking-wide text-white border border-white/10 shadow-lg max-w-[85%] truncate">
              {project.tags[0]}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-5 [@media(max-height:360px)]:p-3.5! justify-start">
        <div className="relative max-w-full self-start">
          <h3 
            title={t(`projects.items.${project.id}.name`)}
            className="font-bold text-lg sm:text-xl mb-0.5 transition-colors duration-300 line-clamp-2 compact:line-clamp-1 cursor-default text-accent group-hover:text-accent-hover"
          >
            {t(`projects.items.${project.id}.name`)}
          </h3>
        </div>
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <p className="text-accent/60 font-bold text-[0.75rem] min-[1920px]:text-[0.8125rem] tracking-wider uppercase">
            {t(`projects.items.${project.id}.category`)}
          </p>
          {project.tags && project.tags.length > 0 && (
            <span className="hidden compact:block rounded-full bg-surface-2/80 backdrop-blur-md px-1.5 py-0.5 text-[0.75rem] font-medium tracking-wide text-text border border-border shadow-sm max-w-[50%] truncate ml-2">
              {project.tags[0]}
            </span>
          )}
        </div>
        <p className="text-muted leading-relaxed mb-3 sm:mb-4 flex-1 text-[0.875rem] min-[1920px]:text-base line-clamp-4 md:line-clamp-none [@media(max-width:767px)_and_(max-height:700px)]:line-clamp-3 compact:line-clamp-2! compact:flex-none">
          {t(`projects.items.${project.id}.description`)}
        </p>
        
        {chips.length > 0 && (
          <div
            ref={chipsContainerRef}
            className="relative flex flex-nowrap items-center overflow-hidden gap-1.5 sm:gap-2 mb-4 sm:mb-5 [@media(orientation:landscape)_and_(max-height:420px)]:hidden py-1 -my-1"
          >
            <div
              ref={measureContainerRef}
              aria-hidden="true"
              className="aria-hidden invisible absolute pointer-events-none flex whitespace-nowrap"
            >
              {chips.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-md bg-surface-2/50 px-1.5 py-0.5 sm:px-2 text-[0.75rem] min-[1920px]:text-[0.875rem] text-muted border border-border whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
              <span className="rounded-md px-1.5 py-0.5 sm:px-2 text-[0.7rem] sm:text-[0.75rem] min-[1920px]:text-[0.875rem] font-medium border border-border whitespace-nowrap">
                +{chips.length}
              </span>
            </div>

            {visibles.map((tag, i) => (
              <span
                key={i}
                className="rounded-md bg-surface-2/50 px-1.5 py-0.5 sm:px-2 text-[0.75rem] min-[1920px]:text-[0.875rem] text-muted border border-border whitespace-nowrap transition-colors group-hover:border-accent/20"
              >
                {tag}
              </span>
            ))}
            {ocultas.length > 0 && (
              <div className="relative group/tag rounded-md shrink-0 flex">
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
                  aria-expanded={activeTooltip === 'tag'}
                  aria-describedby={`tooltip-tags-${project.id}`}
                  aria-label={t('projects.moreTechs', { count: ocultas.length, list: ocultas.join(', ') })}
                >
                  <span className={`block rounded-md px-1.5 py-0.5 sm:px-2 text-[0.7rem] sm:text-[0.75rem] min-[1920px]:text-[0.875rem] font-medium border transition-colors ${
                    activeTooltip === 'tag'
                      ? 'border-accent/50 text-accent bg-accent/10'
                      : 'bg-surface-3 text-text border-border group-hover/tag:border-accent/50 group-hover/tag:text-accent group-hover/tag:bg-accent/10'
                  }`}>
                    +{ocultas.length}
                  </span>
                  {/* Área táctil de 44x44 */}
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 min-w-full min-h-full opacity-0 pointer-events-auto"></span>
                </button>
              </div>
            )}
          </div>
        )}

        {(isHttpsUrl(project.repoUrl) || isHttpsUrl(project.demoUrl)) && (
          <div className="flex flex-wrap sm:flex-nowrap compact:flex-wrap items-center gap-2 sm:gap-3 compact:gap-2 mt-auto pt-3 sm:pt-4 pb-1.5 -mb-1.5 border-t border-border/50 overflow-hidden compact:overflow-visible w-full">
            {isHttpsUrl(project.repoUrl) && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 sm:min-h-0 items-center justify-center shrink-0 gap-1 sm:gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[0.75rem] sm:text-[0.8rem] font-semibold text-text hover:bg-surface-3 hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]! compact:min-h-[36px]"
              >
                <IconGithub className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                <span className="truncate max-w-[100px] sm:max-w-none">{t('projects.viewCode')}</span>
              </a>
            )}
            {isHttpsUrl(project.demoUrl) && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 sm:min-h-0 items-center justify-center shrink-0 gap-1 sm:gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[0.75rem] sm:text-[0.8rem] font-semibold text-text hover:bg-surface-3 hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]! truncate compact:min-h-[36px]"
              >
                <span className="truncate">{t(`projects.items.${project.id}.demoLabel`, { defaultValue: t('projects.viewDemo') })}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
