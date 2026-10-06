import { useTranslation } from 'react-i18next'

const year = new Date().getFullYear()

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="snap-end border-t border-border mt-12 py-8 text-center text-muted px-4">
      {t('footer.text', { year })}
    </footer>
  )
}
