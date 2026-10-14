import { useTranslation } from 'react-i18next'
import { IconGlobe } from './icons'

export default function LanguageToggle({ compact = false }) {
  const { i18n, t } = useTranslation()
  const isEs = i18n.language === 'es'

  const toggleLanguage = () => {
    i18n.changeLanguage(isEs ? 'en' : 'es')
  }

  const label = isEs ? t('nav.switchToEn') : t('nav.switchToEs')

  return (
    <button
      onClick={toggleLanguage}
      aria-label={label}
      title={label}
      className={`rounded-full bg-surface-2 border border-border min-h-11 ${compact ? 'min-w-11 px-0' : 'px-4 gap-2'} flex items-center justify-center font-semibold text-[0.875rem] cursor-pointer hover:border-accent hover:text-accent hover:bg-accent/10 active:bg-accent/20 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
    >
      {!compact && <IconGlobe size={16} />}
      <span>{isEs ? 'EN' : 'ES'}</span>
    </button>
  )
}
