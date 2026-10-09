import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Section from './Section'
import ProjectCard from './ProjectCard'
import { IconChevronLeft, IconChevronRight } from './icons'
import Reveal from './Reveal'
import { projectsData } from '../data/projects'

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
    setShowButtons(scrollWidth > clientWidth)

    const firstItem = listRef.current.firstElementChild
    if (firstItem) {
      const itemWidth = firstItem.clientWidth
      const gap = 24 // gap-6
      const newIndex = Math.round(scrollLeft / (itemWidth + gap))
      setActiveIndex(newIndex)
      setCanPrev(newIndex > 0)
    } else {
      setCanPrev(Math.ceil(scrollLeft) > 5)
    }
    
    setCanNext(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5)
  }, [])

  useEffect(() => {
    checkScroll()
    const currentList = listRef.current
    if (currentList) {
      currentList.addEventListener('scroll', checkScroll, { passive: true })
      const observer = new ResizeObserver(checkScroll)
      observer.observe(currentList)
      return () => {
        currentList.removeEventListener('scroll', checkScroll)
        observer.disconnect()
      }
    }
  }, [checkScroll])

  const scrollToIndex = (newIndex) => {
    if (!listRef.current) return
    const children = listRef.current.children
    if (newIndex >= 0 && newIndex < children.length) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      children[newIndex].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  const handlePrev = () => scrollToIndex(activeIndex - 1)
  const handleNext = () => scrollToIndex(activeIndex + 1)

  const actions = showButtons ? (
    <div className="flex gap-2 relative z-10">
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canPrev}
        aria-label={t('projects.prev')}
        className="flex min-h-[44px] min-w-[44px] md:min-h-[44px] md:min-w-[44px] items-center justify-center rounded-full border border-border bg-surface/60 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <IconChevronLeft className="pointer-events-none" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={!canNext}
        aria-label={t('projects.next')}
        className="flex min-h-[44px] min-w-[44px] md:min-h-[44px] md:min-w-[44px] items-center justify-center rounded-full border border-border bg-surface/60 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
        className="flex snap-x snap-mandatory gap-x-4 sm:gap-6 overflow-x-auto overflow-y-hidden scroll-smooth py-6 px-4 -mx-4 -my-4 scroll-px-4 md:scroll-px-6 lg:scroll-px-8 [scrollbar-width:none]"
      >
        {projectsData.map((project, index) => (
          <Reveal
            as="li"
            key={project.id}
            delay={index * 80}
            className="w-[85%] sm:w-[65%] shrink-0 snap-start md:w-[48%] lg:w-[calc((100%-3rem)/3)] [@media(max-height:520px)]:w-[58%]"
          >
            <ProjectCard project={project} isActive={index === activeIndex} />
          </Reveal>
        ))}
      </ul>
      <div className="mt-4 text-center md:hidden" aria-live="polite">
        <span className="text-muted text-[0.875rem] font-medium">
          {activeIndex + 1} / {projectsData.length}
        </span>
      </div>
    </Section>
  )
}
