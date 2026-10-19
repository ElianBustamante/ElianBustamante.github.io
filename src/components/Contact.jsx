import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Section from './Section'
import { site } from '../data/site'
import { isHttpsUrl } from '../lib/url'
import { GLASS_CARD } from '../lib/glass'
import { IconMail, IconGithub, IconLinkedin, IconCopy, IconCheck } from './icons'

export default function Contact({ siteData = site }) {
  const { t } = useTranslation()
  const { email, githubUrl, linkedinUrl } = siteData
  const hasValidEmail = typeof email === 'string' && email.includes('@')
  const [copied, setCopied] = useState(false)
  const addressRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const selectAddressText = () => {
    if (addressRef.current) {
      window.getSelection?.()?.selectAllChildren?.(addressRef.current)
    }
  }

  const handleCopy = async () => {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      selectAddressText()
      return
    }
    try {
      await navigator.clipboard.writeText(email)
      clearTimeout(timerRef.current)
      setCopied(true)
      timerRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      selectAddressText()
    }
  }

  const baseBtnClass =
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 sm:px-6 text-[0.875rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

  return (
    <Section id="contacto" titleKey="contact.title">
      <div
        className={`${GLASS_CARD} w-fit max-w-full p-4 sm:p-5 compact:p-2.5 compact:px-4 [@media(min-height:441px)]:compact:p-4 mt-4 compact:mt-2 space-y-6 compact:space-y-3`}
      >
        <p className="max-w-[52ch] text-muted text-[1rem] compact:text-[0.875rem] leading-relaxed">
          {t('contact.text')}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
          {hasValidEmail && (
            <a
              href={`mailto:${email}`}
              className={`${baseBtnClass} col-span-2 sm:col-span-1 bg-accent text-on-accent hover:bg-accent-hover`}
            >
              <IconMail size={18} />
              <span>{t('contact.email')}</span>
            </a>
          )}

          {isHttpsUrl(githubUrl) && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseBtnClass} border border-text/40 text-text hover:bg-surface-2`}
            >
              <IconGithub size={18} />
              <span>{t('contact.github')}</span>
            </a>
          )}

          {isHttpsUrl(linkedinUrl) && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseBtnClass} border border-text/40 text-text hover:bg-surface-2`}
            >
              <IconLinkedin size={18} />
              <span>{t('contact.linkedin')}</span>
            </a>
          )}
        </div>

        {hasValidEmail && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span ref={addressRef} className="select-all break-words text-[0.875rem] text-muted">
              {email}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-[0.875rem] text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              <span>{copied ? t('contact.copied') : t('contact.copy')}</span>
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? t('contact.copied') : ''}
            </span>
          </div>
        )}
      </div>
    </Section>
  )
}
