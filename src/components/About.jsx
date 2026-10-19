import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Section from './Section'
import Reveal from './Reveal'
import { IconChevronLeft, IconChevronRight } from './icons'
import { skills } from '../data/site'
import useMediaQuery from '../hooks/useMediaQuery'
import { ABOUT_PAGED_QUERY } from '../lib/media'
import { observeScrollState } from '../lib/overflow'
import { GLASS_CARD } from '../lib/glass'

export default function About() {
  const { t } = useTranslation()
  const paged = useMediaQuery(ABOUT_PAGED_QUERY)
  const pagerRef = useRef(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!paged) return
    const list = pagerRef.current
    if (!list) return

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = list
      const overflow = scrollWidth > clientWidth + 5
      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5
      setPage(overflow && atEnd ? 1 : 0)
    }

    list.addEventListener('scroll', update, { passive: true })
    const cleanup = observeScrollState(list, update)

    return () => {
      list.removeEventListener('scroll', update)
      cleanup()
      setPage(0)
    }
  }, [paged])

  const goTo = (i) => {
    const reduce = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
    pagerRef.current?.children[i]?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }

  const skillGroups = [
    { key: 'languages', label: t('about.skills.languages'), items: skills.languages },
    { key: 'frameworks', label: t('about.skills.frameworks'), items: skills.frameworks },
    { key: 'databases', label: t('about.skills.databases'), items: skills.databases },
    { key: 'tools', label: t('about.skills.tools'), items: skills.tools },
  ]

  const containerClass = paged
    ? 'flex snap-x snap-mandatory gap-8 overflow-x-auto overflow-y-hidden scroll-smooth items-start py-1 -my-1 px-4 -mx-4 scroll-px-4 [scrollbar-width:none] mt-4 compact:mt-2'
    : 'grid grid-cols-2 items-stretch gap-8 compact:gap-4 mt-4 compact:mt-2'

  const pageItemClass = paged ? 'w-full shrink-0 snap-start' : ''

  const actions = paged ? (
    <div className="flex items-center gap-2 relative z-10">
      <button
        type="button"
        onClick={() => goTo(0)}
        disabled={page === 0}
        aria-label={t('about.prev')}
        className="flex min-h-11 min-w-11 md:min-h-11 md:min-w-11 items-center justify-center rounded-full border border-border bg-surface/60 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <IconChevronLeft className="pointer-events-none" />
      </button>
      <span
        aria-live="polite"
        className="hidden short:block min-w-[2.75rem] text-center text-xs font-medium text-muted tabular-nums"
      >
        {page + 1} / 2
      </span>
      <button
        type="button"
        onClick={() => goTo(1)}
        disabled={page === 1}
        aria-label={t('about.next')}
        className="flex min-h-11 min-w-11 md:min-h-11 md:min-w-11 items-center justify-center rounded-full border border-border bg-surface/60 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <IconChevronRight className="pointer-events-none" />
      </button>
    </div>
  ) : undefined

  return (
    <Section id="sobre-mi" titleKey="about.title" actions={actions}>
      <div ref={paged ? pagerRef : undefined} className={containerClass}>
        <div
          className={`${GLASS_CARD} p-4 sm:p-5 pt-2.5 sm:pt-3.5 compact:p-2.5 compact:px-4 compact:pt-1 [@media(min-height:441px)]:compact:p-4 [@media(min-height:441px)]:compact:pt-2.5 space-y-4 compact:space-y-2 [&>p:last-child]:-mb-1.5 ${pageItemClass}`.trim()}
        >
          <p className="max-w-[65ch] text-text text-[1rem] compact:text-[0.875rem] leading-relaxed">
            {t('about.p1')}
          </p>
          <p className="max-w-[65ch] text-muted text-[1rem] compact:text-[0.875rem] leading-relaxed">
            {t('about.p2')}
          </p>
          <p className="max-w-[65ch] text-muted text-[1rem] compact:text-[0.875rem] leading-relaxed">
            {t('about.p3')}
          </p>
        </div>

        <Reveal
          delay={120}
          className={`rounded-card border border-border bg-surface p-4 sm:p-5 pt-2.5 sm:pt-3.5 compact:p-2.5 compact:px-4 compact:pt-1 [@media(min-height:441px)]:compact:p-4 [@media(min-height:441px)]:compact:pt-2.5 space-y-4 compact:space-y-2 [@media(min-height:441px)]:compact:space-y-2.5 ${pageItemClass}`.trim()}
        >
          <h3 className="text-lg compact:text-[1rem] font-bold text-text">
            {t('about.skills.title')}
          </h3>

          <div className="space-y-4 compact:space-y-1.5 [@media(min-height:441px)]:compact:space-y-2">
            {skillGroups.map((group) => (
              <div key={group.key}>
                <h4 className="text-[0.875rem] compact:text-[0.75rem] [@media(min-height:441px)]:compact:text-[0.875rem] font-medium text-muted mb-2 compact:mb-0.5 [@media(min-height:441px)]:compact:mb-1">
                  {group.label}
                </h4>
                <ul role="list" className="flex flex-wrap gap-2 compact:gap-1.5">
                  {group.items.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-md bg-surface-2/50 border border-border px-2 py-0.5 compact:py-0 [@media(min-height:441px)]:compact:py-0.5 text-[0.75rem] text-text"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {paged && (
        <div className="mt-4 text-center short:hidden" aria-live="polite">
          <span className="text-muted text-[0.875rem] font-medium">{page + 1} / 2</span>
        </div>
      )}
    </Section>
  )
}
