import { useTranslation } from 'react-i18next'

export default function Hero() {
  const { t } = useTranslation()

  return (
    <section
      id="inicio"
      className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 min-h-[70svh] flex flex-col justify-center pt-16 md:pt-24"
    >
      <div className="w-full text-left">
        <h1 className="uppercase font-extrabold text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] max-w-[60rem]">
          <span className="block text-accent hero-in lg:whitespace-nowrap" style={{ animationDelay: '0ms' }}>
            {t('hero.titleLine1')}
          </span>
          <span className="block text-text hero-in lg:whitespace-nowrap" style={{ animationDelay: '120ms' }}>
            {t('hero.titleLine2')}
          </span>
        </h1>
        <div className="max-w-[42rem]">
          <p className="text-[1.125rem] text-text mt-6 hero-in" style={{ animationDelay: '240ms' }}>
            {t('hero.subtitle')}
          </p>
          <p className="text-muted mt-4 hero-in" style={{ animationDelay: '360ms' }}>
            {t('hero.description')}
          </p>
          <div className="flex flex-wrap gap-4 mt-8 hero-in" style={{ animationDelay: '480ms' }}>
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
    </section>
  )
}
