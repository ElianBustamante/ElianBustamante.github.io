import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'
import { scrollToElement } from '../lib/scroll'

export default function Section({ id, titleKey, children, actions }) {
  const { t } = useTranslation()

  const scrollNext = (e) => {
    const next = e.currentTarget.closest('section')?.nextElementSibling;
    scrollToElement(next);
  }
  const scrollPrev = (e) => {
    const prev = e.currentTarget.closest('section')?.previousElementSibling;
    scrollToElement(prev);
  }

  return (
    <section id={id} className="snap-start [@media(min-height:601px)]:snap-always min-h-[100dvh] flex flex-col justify-center [@media(max-height:600px)]:justify-start relative pt-[6.5rem] short:pt-3 pb-8 short:pb-3">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 relative z-10 -mt-3 short:mt-0">
        <Reveal delay={0} className="flex flex-wrap items-center justify-between gap-6 mb-2 mt-0 relative z-20 w-full">
          <h2 className="uppercase font-extrabold text-accent text-2xl">{t(titleKey)}</h2>
          {actions && <div>{actions}</div>}
        </Reveal>
        <Reveal delay={120}>
          {children}
        </Reveal>
      </div>
      
      {/* Flecha Arriba */}
      <button 
        type="button"
        onClick={scrollPrev} 
        aria-label={t('nav.prevSection')} 
        className="absolute flex items-center justify-center min-h-[44px] min-w-[44px] top-[95px] short:top-2 left-1/2 -translate-x-1/2 p-2 text-muted hover:text-accent transition-colors z-20 motion-safe:animate-bounce short:hidden"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
      </button>

      {/* Flecha Abajo */}
      {id !== 'contacto' && (
        <button 
          type="button"
          onClick={scrollNext} 
          aria-label={t('nav.nextSection')} 
          className="absolute flex items-center justify-center min-h-[44px] min-w-[44px] bottom-[5px] left-1/2 -translate-x-1/2 p-2 text-muted hover:text-accent transition-colors z-20 motion-safe:animate-bounce short:hidden"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      )}
    </section>
  )
}
