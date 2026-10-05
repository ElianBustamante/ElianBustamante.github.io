import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'

export default function Section({ id, titleKey, children, actions }) {
  const { t } = useTranslation()

  return (
    <section id={id} className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-12">
      <Reveal delay={0} className="flex flex-wrap items-center gap-6 mb-8">
        <h2 className="uppercase font-extrabold text-accent text-2xl">{t(titleKey)}</h2>
        {actions && <div>{actions}</div>}
      </Reveal>
      <Reveal delay={120}>
        {children}
      </Reveal>
    </section>
  )
}
