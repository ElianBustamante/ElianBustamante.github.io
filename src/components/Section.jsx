import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'
import { slowScrollTo } from '../lib/smoothScroll'

export default function Section({ id, titleKey, children, actions }) {
  const { t } = useTranslation()

  const scrollNext = (e) => {
    const next = e.currentTarget.closest('section').nextElementSibling;
    if (next) slowScrollTo(next);
  }
  const scrollPrev = (e) => {
    const prev = e.currentTarget.closest('section').previousElementSibling;
    if (prev) slowScrollTo(prev);
  }

  return (
    <section id={id} className="snap-start min-h-[100svh] flex flex-col justify-center relative pt-16 pb-8">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <Reveal delay={0} className="flex flex-wrap items-center gap-6 mb-2 mt-0">
          <h2 className="uppercase font-extrabold text-accent text-2xl">{t(titleKey)}</h2>
          {actions && <div>{actions}</div>}
        </Reveal>
        <Reveal delay={120}>
          {children}
        </Reveal>
      </div>
      
      {/* Flecha Arriba */}
      <button onClick={scrollPrev} aria-label="Subir" className="absolute top-20 left-1/2 -translate-x-1/2 p-2 text-muted hover:text-accent transition-colors z-20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
      </button>

      {/* Flecha Abajo */}
      <button onClick={scrollNext} aria-label="Bajar" className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 text-muted hover:text-accent transition-colors z-20 animate-bounce">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </section>
  )
}
