import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'

export default function Section({ id, titleKey, children, actions, fill = false, footer }) {
  const { t } = useTranslation()

  const baseSectionClasses = fill
    ? "snap-start [@media(min-height:601px)]:snap-always min-h-[100dvh] flex flex-col justify-center [@media(max-height:600px)]:justify-start compact:justify-start! [@media(min-height:521px)]:short:justify-center! relative pt-[6.5rem] short:pt-3 pb-8 short:h-[100dvh] short:min-h-[300px] short:pb-6"
    : "snap-start [@media(min-height:601px)]:snap-always min-h-[100dvh] flex flex-col justify-center [@media(max-height:600px)]:justify-start short:justify-center! relative pt-[6.5rem] short:pt-3 pb-8 short:pb-3"

  const sectionClasses = footer
    ? `${baseSectionClasses} pb-0! short:pb-0!`
    : baseSectionClasses

  const innerClasses = fill
    ? "w-full max-w-site mx-auto px-4 md:px-6 lg:px-8 relative z-10 -mt-3 short:mt-0 compact:flex-1 compact:min-h-0 short:flex short:flex-col"
    : "w-full max-w-site mx-auto px-4 md:px-6 lg:px-8 relative z-10 -mt-3 short:mt-0"

  const innerContent = (
    <div className={innerClasses}>
      <Reveal delay={0} className="flex flex-wrap items-center justify-between gap-6 mb-2 mt-0 relative z-20 w-full">
        <h2 className="uppercase font-extrabold text-accent text-2xl">{t(titleKey)}</h2>
        {actions && <div>{actions}</div>}
      </Reveal>
      <Reveal delay={120} {...(fill ? { className: "compact:flex-1 compact:min-h-0 short:flex short:flex-col" } : {})}>
        {children}
      </Reveal>
    </div>
  )

  return (
    <section id={id} className={sectionClasses}>
      {footer ? (
        <>
          <div className="my-auto">{innerContent}</div>
          {footer}
        </>
      ) : (
        innerContent
      )}
    </section>
  )
}
