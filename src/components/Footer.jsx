import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const year = React.useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="border-t border-border mt-12 py-8 text-center text-muted px-4">
      {t('footer.text', { year })}
    </footer>
  )
}
