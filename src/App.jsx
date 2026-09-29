import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()

  return (
    <main className="hero-in p-8">
      <h1 className="text-4xl font-extrabold text-accent">{t('hero.titleLine1')}</h1>
    </main>
  )
}

export default App
