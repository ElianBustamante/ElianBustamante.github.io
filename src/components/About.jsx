import { useTranslation } from 'react-i18next'
import Section from './Section'
import Reveal from './Reveal'
import { skills } from '../data/site'

export default function About() {
  const { t } = useTranslation()

  const skillGroups = [
    { key: 'languages', label: t('about.skills.languages'), items: skills.languages },
    { key: 'databases', label: t('about.skills.databases'), items: skills.databases },
    { key: 'tools', label: t('about.skills.tools'), items: skills.tools },
  ]

  return (
    <Section id="sobre-mi" titleKey="about.title">
      <div className="grid grid-cols-1 md:grid-cols-2 [@media(max-height:520px)]:grid-cols-2 items-start gap-8 [@media(max-height:520px)]:gap-4 mt-4 [@media(max-height:520px)]:mt-2">
        <div className="max-w-[65ch] space-y-4 [@media(max-height:520px)]:space-y-2">
          <p className="text-text text-[1rem] [@media(max-height:520px)]:text-[0.875rem] leading-relaxed">
            {t('about.p1')}
          </p>
          <p className="text-muted text-[1rem] [@media(max-height:520px)]:text-[0.875rem] leading-relaxed">
            {t('about.p2')}
          </p>
          <p className="text-muted text-[1rem] [@media(max-height:520px)]:text-[0.875rem] leading-relaxed">
            {t('about.p3')}
          </p>
        </div>

        <Reveal delay={120} className="space-y-4 [@media(max-height:520px)]:space-y-2.5">
          <h3 className="text-lg [@media(max-height:520px)]:text-[1rem] font-bold text-text">
            {t('about.skills.title')}
          </h3>

          <div className="space-y-4 [@media(max-height:520px)]:space-y-2">
            {skillGroups.map((group) => (
              <div key={group.key}>
                <h4 className="text-[0.875rem] font-medium text-muted mb-2 [@media(max-height:520px)]:mb-1">
                  {group.label}
                </h4>
                <ul role="list" className="flex flex-wrap gap-2 [@media(max-height:520px)]:gap-1.5">
                  {group.items.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-md bg-surface-2/50 border border-border px-2 py-0.5 text-[0.75rem] text-text"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
