import { useTranslation } from 'react-i18next'
import { scrollToElement } from '../lib/scroll'

const bgModules = import.meta.glob('../assets/hero-bg.webp', { eager: true, query: '?url', import: 'default' })
const bgUrl = bgModules['../assets/hero-bg.webp']

export default function Hero() {
  const { t } = useTranslation()

  return (
    <section
      id="inicio"
      className="snap-start relative z-0 min-h-[100svh] flex flex-col justify-center pt-32 pb-20 short:pb-8 short:pt-3"
    >
      {bgUrl && (
        <div 
          className="absolute inset-y-0 right-0 left-[calc(var(--rail-w)*-1)] -z-10"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div 
            className="absolute inset-0 md:hidden"
            style={{
              backgroundImage: 'linear-gradient(to top, #0a0a0a 0%, transparent 6rem), linear-gradient(to bottom, rgba(10,10,10,0.65), rgba(10,10,10,0.55))'
            }}
          />
          <div 
            className="absolute inset-0 hidden md:block"
            style={{
              backgroundImage: 'linear-gradient(to top, #0a0a0a 0%, transparent 6rem), linear-gradient(to right, rgba(10,10,10,0.9), rgba(10,10,10,0.4))'
            }}
          />
        </div>
      )}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 text-left">
        <h1 className="uppercase font-extrabold text-[clamp(1.7rem,6vw,4rem)] short:!text-[clamp(1.5rem,4vh,2.5rem)] leading-[1.05] max-w-[60rem]">
          <span className="block text-accent hero-in lg:whitespace-nowrap" style={{ animationDelay: '0ms' }}>
            {t('hero.titleLine1')}
          </span>
          <span className="block text-text hero-in lg:whitespace-nowrap" style={{ animationDelay: '120ms' }}>
            {t('hero.titleLine2')}
          </span>
        </h1>
        <div className="max-w-[42rem]">
          <p className="text-[1.125rem] [@media(max-height:500px)]:text-[1rem] text-text mt-6 [@media(max-height:500px)]:mt-2 hero-in" style={{ animationDelay: '240ms' }}>
            {t('hero.subtitle')}
          </p>
          <p className="text-muted mt-4 [@media(max-height:500px)]:mt-2 hero-in" style={{ animationDelay: '360ms' }}>
            {t('hero.description')}
          </p>
          <div className="flex flex-wrap gap-4 mt-8 [@media(max-height:500px)]:mt-4 hero-in" style={{ animationDelay: '480ms' }}>
            <a
              href="#proyectos"
              className="min-h-[44px] inline-flex items-center justify-center px-6 bg-accent text-on-accent rounded-full font-semibold hover:bg-accent-hover transition-colors"
            >
              {t('hero.ctaProjects')}
            </a>
            <a
              href="#fotografia"
              className="min-h-[44px] inline-flex items-center justify-center px-6 border border-text/40 rounded-full font-semibold hover:bg-surface-2 transition-colors"
            >
              {t('hero.ctaPhotography')}
            </a>
          </div>
        </div>
      </div>

      {/* Flecha Abajo en Hero */}
      <button 
        type="button"
        onClick={(e) => {
          const next = e.currentTarget.closest('section')?.nextElementSibling;
          scrollToElement(next);
        }} 
        aria-label={t('nav.nextSection')} 
        className="absolute flex items-center justify-center min-h-[44px] min-w-[44px] bottom-4 left-1/2 -translate-x-1/2 p-2 text-muted hover:text-accent transition-colors z-20 motion-safe:animate-bounce short:hidden"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </section>
  )
}
