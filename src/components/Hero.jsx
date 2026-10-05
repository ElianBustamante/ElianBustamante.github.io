import { useTranslation } from 'react-i18next'

const bgModules = import.meta.glob('../assets/hero-bg.webp', { eager: true, query: '?url', import: 'default' })
const bgUrl = bgModules['../assets/hero-bg.webp']

export default function Hero() {
  const { t } = useTranslation()

  return (
    <section
      id="inicio"
      className="relative z-0 min-h-[100svh] flex flex-col justify-center pt-32 pb-20"
    >
      {bgUrl && (
        <div 
          className="absolute inset-0 -z-10"
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
        <h1 className="uppercase font-extrabold text-[clamp(1.7rem,6vw,4rem)] leading-[1.05] max-w-[60rem]">
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
