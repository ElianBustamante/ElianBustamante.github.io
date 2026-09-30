import { useTranslation } from 'react-i18next'

const bgModules = import.meta.glob('../assets/hero-bg.webp', { eager: true, query: '?url', import: 'default' })
const bgUrl = bgModules['../assets/hero-bg.webp']

export default function Hero() {
  const { t } = useTranslation()

  const backgroundStyle = bgUrl
    ? {
        backgroundImage: `linear-gradient(to right, rgba(10,10,10,0.95), rgba(10,10,10,0.6)), url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: 'radial-gradient(ellipse at top right, rgba(255,106,26,0.18), transparent 60%)',
      }

  return (
    <section
      id="inicio"
      style={backgroundStyle}
      className="min-h-[70svh] flex flex-col justify-center px-4 md:px-6 lg:px-8"
    >
      <div className="max-w-[1200px] w-full mx-auto">
        <div className="max-w-[42rem] text-left">
          <h1 className="uppercase font-extrabold text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
            <span className="block text-accent hero-in" style={{ animationDelay: '0ms' }}>
              {t('hero.titleLine1')}
            </span>
            <span className="block text-text hero-in" style={{ animationDelay: '120ms' }}>
              {t('hero.titleLine2')}
            </span>
          </h1>
          <p className="text-[1.125rem] text-text mt-6 hero-in" style={{ animationDelay: '240ms' }}>
            {t('hero.subtitle')}
          </p>
          <p className="text-muted max-w-[52ch] mt-4 hero-in" style={{ animationDelay: '360ms' }}>
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
