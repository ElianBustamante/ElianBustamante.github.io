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

  const checkScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = listRef.current
    setShowButtons(scrollWidth > clientWidth)
    setCanPrev(scrollLeft > 0)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1)
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

  const scrollByAmount = (direction) => {
    if (!listRef.current) return
    const firstItem = listRef.current.firstElementChild
    if (!firstItem) return
    const itemWidth = firstItem.clientWidth
    const gap = 16 // 1rem gap
    const amount = (itemWidth + gap) * direction
    listRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const actions = showButtons ? (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        disabled={!canPrev}
        aria-label={t('projects.prev')}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <IconChevronLeft />
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        disabled={!canNext}
        aria-label={t('projects.next')}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <IconChevronRight />
      </button>
    </div>
  ) : null

  return (
    <Section id="proyectos" titleKey="projects.title" actions={actions}>
      <ul
        role="list"
        ref={listRef}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none]"
      >
        {projectsData.map((project, index) => (
          <Reveal
            as="li"
            key={project.id}
            delay={index * 80}
            className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[calc((100%-2rem)/3)]"
          >
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
