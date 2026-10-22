import { useTranslation } from 'react-i18next'

const year = new Date().getFullYear()

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer
      role="contentinfo"
      className="w-full border-t border-border py-8 short:py-3 text-center text-muted short:text-[0.8125rem] px-4"
    >
      {t('footer.text', { year })}
    </footer>
  )
}
