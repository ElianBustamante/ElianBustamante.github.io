import { useTranslation } from 'react-i18next'
import Section from './Section'
import { site } from '../data/site'
import { isHttpsUrl } from '../lib/url'
import { IconMail, IconGithub, IconLinkedin } from './icons'

export default function Contact({ siteData = site }) {
  const { t } = useTranslation()
  const { email, githubUrl, linkedinUrl } = siteData
  const hasValidEmail = typeof email === 'string' && email.includes('@')

  const baseBtnClass =
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 text-[0.875rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

  return (
    <Section id="contacto" titleKey="contact.title">
      <div className="mt-4 space-y-6">
        <p className="max-w-[52ch] text-muted text-[1rem] leading-relaxed">
          {t('contact.text')}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {hasValidEmail && (
            <a
              href={`mailto:${email}`}
              className={`${baseBtnClass} bg-accent text-on-accent hover:bg-accent-hover`}
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
          <div>
            <a
              href={`mailto:${email}`}
              className="text-[0.875rem] text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              {email}
            </a>
          </div>
        )}
      </div>
    </Section>
  )
}
