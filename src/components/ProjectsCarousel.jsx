import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Section from './Section'
import ProjectCard from './ProjectCard'
import { IconChevronLeft, IconChevronRight } from './icons'
import Reveal from './Reveal'
import { projectsData } from '../data/projects'
import { observeScrollState } from '../lib/overflow'

function getAlignEdge(list) {
  const listRect = typeof list.getBoundingClientRect === 'function' ? list.getBoundingClientRect() : { left: 0 }
  let paddingLeft = 16
  try {
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const parsed = parseFloat(window.getComputedStyle(list).paddingLeft)
      if (!isNaN(parsed) && parsed > 0) paddingLeft = parsed
    }
  } catch {
    // fallback 16
  }
  return (listRect.left ?? 0) + paddingLeft
}

function scrollElementIntoView(element) {
  if (!element || typeof element.scrollIntoView !== 'function') return
  const reduce = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
  element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'start' })
}

export default function ProjectsCarousel() {
  const { t } = useTranslation()
  const listRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const checkScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = listRef.current
    const hasOverflow = scrollWidth > clientWidth
    setShowButtons(hasOverflow)

    const isAtEnd = hasOverflow && Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5
    const children = listRef.current.children

    if (children && children.length > 0) {
      if (isAtEnd) {
        setActiveIndex(children.length - 1)
      } else {
        const edge = getAlignEdge(listRef.current)
        let closestIndex = 0
        let minDiff = Infinity
        for (let i = 0; i < children.length; i++) {
          const child = children[i]
          const childLeft = typeof child.getBoundingClientRect === 'function' ? child.getBoundingClientRect().left : 0
          const diff = Math.abs(childLeft - edge)
          if (diff < minDiff) {
            minDiff = diff
            closestIndex = i
          }
        }
        setActiveIndex(closestIndex)
      }
    }

    setCanPrev(scrollLeft > 5)
    setCanNext(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5)
  }, [])

  useEffect(() => {
    const currentList = listRef.current
    if (currentList) {
      currentList.addEventListener('scroll', checkScroll, { passive: true })
      const cleanupObserver = observeScrollState(currentList, checkScroll)
      return () => {
        currentList.removeEventListener('scroll', checkScroll)
        cleanupObserver()
      }
    }
  }, [checkScroll])

  const handlePrev = () => {
    if (!listRef.current) return
    const edge = getAlignEdge(listRef.current)
    const children = listRef.current.children
    let targetChild = null
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i]
      const left = typeof child.getBoundingClientRect === 'function' ? child.getBoundingClientRect().left : 0
      if (left < edge - 4) {
        targetChild = child
        break
      }
    }
    if (targetChild) {
      scrollElementIntoView(targetChild)
    }
  }

  const handleNext = () => {
    if (!listRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = listRef.current
    if (scrollWidth > clientWidth && Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5) return
    const edge = getAlignEdge(listRef.current)
    const children = listRef.current.children
    let targetChild = null
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const left = typeof child.getBoundingClientRect === 'function' ? child.getBoundingClientRect().left : 0
      if (left > edge + 4) {
        targetChild = child
        break
      }
    }
    if (targetChild) {
      scrollElementIntoView(targetChild)
    }
  }

  const actions = showButtons ? (
    <div className="flex items-center gap-2 relative z-10">
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canPrev}
        aria-label={t('projects.prev')}
        className="flex min-h-11 min-w-11 md:min-h-11 md:min-w-11 items-center justify-center rounded-full border border-border bg-surface/60 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <IconChevronLeft className="pointer-events-none" />
      </button>
      <span aria-live="polite" className="hidden short:block min-w-[2.75rem] text-center text-xs font-medium text-muted tabular-nums">
        {activeIndex + 1} / {projectsData.length}
      </span>
      <button
        type="button"
        onClick={handleNext}
        disabled={!canNext}
        aria-label={t('projects.next')}
        className="flex min-h-11 min-w-11 md:min-h-11 md:min-w-11 items-center justify-center rounded-full border border-border bg-surface/60 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <IconChevronRight className="pointer-events-none" />
      </button>
    </div>
  ) : null

  return (
    <Section id="proyectos" titleKey="projects.title" actions={actions}>
      <ul
        role="list"
        ref={listRef}
        className="flex snap-x snap-mandatory gap-x-4 sm:gap-6 overflow-x-auto overflow-y-hidden scroll-smooth py-6 px-4 -mx-4 -my-4 scroll-px-4 [scrollbar-width:none] short:py-6 short:-mt-6 short:-mb-3 [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]"
      >
        {projectsData.map((project, index) => (
          <Reveal
            as="li"
            key={project.id}
            delay={index * 80}
            className="w-[85%] sm:w-[65%] shrink-0 snap-start md:w-[48%] lg:w-[calc((100%-3rem)/3)] short:w-[58%] short:lg:w-[calc((100%-3rem)/3)] short:min-[960px]:max-lg:w-[calc((100%-1.5rem)/2)]"
          >
            <ProjectCard project={project} isActive={index === activeIndex} />
          </Reveal>
        ))}
      </ul>
      <div className="mt-4 text-center md:hidden short:hidden" aria-live="polite">
        <span className="text-muted text-[0.875rem] font-medium">
          {activeIndex + 1} / {projectsData.length}
        </span>
      </div>
    </Section>
  )
}
