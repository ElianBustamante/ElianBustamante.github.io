import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const isEs = i18n.language === 'es'

  const toggleLanguage = () => {
    i18n.changeLanguage(isEs ? 'en' : 'es')
  }

  return (
    <button
      onClick={toggleLanguage}
      aria-label={isEs ? t('nav.switchToEn') : t('nav.switchToEs')}
      className="border border-border rounded-full min-h-[44px] px-4 flex items-center justify-center font-semibold hover:bg-surface-2 transition-colors"
    >
      {isEs ? 'EN' : 'ES'}
    </button>
  )
}
