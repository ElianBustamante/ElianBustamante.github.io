import { useTranslation } from 'react-i18next'
import { goToPrevSection, goToNextSection } from '../lib/sectionNav'

export default function SectionArrows({ canPrev = false, canNext = true }) {
  const { t } = useTranslation()

  return (
    <>
      {/* Up arrow (previous section) */}
      <button
        type="button"
        onClick={goToPrevSection}
        disabled={!canPrev}
        tabIndex={!canPrev ? -1 : undefined}
        aria-hidden={!canPrev ? 'true' : undefined}
        aria-label={t('nav.prevSection')}
        className={`fixed flex items-center justify-center min-h-11 min-w-11 top-[95px] max-[380px]:top-[83px] [@media(max-width:380px)_and_(max-height:600px)]:top-[68px]! left-1/2 -translate-x-1/2 p-2 text-muted hover:text-accent z-30 motion-safe:animate-bounce-up short:hidden transition-[opacity,visibility,color] duration-200 motion-reduce:transition-none ${
          canPrev ? 'opacity-100' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

      {/* Down arrow (next section) */}
      <button
        type="button"
        onClick={goToNextSection}
        disabled={!canNext}
        tabIndex={!canNext ? -1 : undefined}
        aria-hidden={!canNext ? 'true' : undefined}
        aria-label={t('nav.nextSection')}
        className={`fixed flex items-center justify-center min-h-11 min-w-11 bottom-[5px] left-1/2 -translate-x-1/2 p-2 text-muted hover:text-accent z-30 motion-safe:animate-bounce short:hidden transition-[opacity,visibility,color] duration-200 motion-reduce:transition-none ${
          canNext ? 'opacity-100' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </>
  )
}
