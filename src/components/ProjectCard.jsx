import { useTranslation } from 'react-i18next'

export default function ProjectCard({ project }) {
  const { t } = useTranslation()

  return (
    <article className="group flex h-full flex-col rounded-card border border-border bg-surface hover:border-accent/60 focus-within:border-accent transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(255,106,26,0.12)]">
      {project.image ? (
        <div className="relative overflow-hidden rounded-t-[calc(var(--radius-card)-1px)]">
          <div className="absolute inset-0 bg-surface-2 animate-pulse z-0" />
          <img
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="relative z-10 aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          {project.tags && project.tags.length > 0 && (
            <span className="absolute top-3 right-3 z-20 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[0.75rem] font-medium tracking-wide text-white border border-white/10 shadow-lg">
              {project.tags[0]}
            </span>
          )}
        </div>
      ) : (
        <div className="relative pt-8">
          {project.tags && project.tags.length > 0 && (
            <span className="absolute top-4 right-4 rounded-full bg-surface-2 px-3 py-1 text-[0.75rem] font-medium tracking-wide border border-border">
              {project.tags[0]}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 md:p-7">
        <h3 className="text-accent font-bold text-xl mb-1.5 group-hover:text-accent-hover transition-colors duration-300">
          {t(`projects.items.${project.id}.name`)}
        </h3>
        <p className="text-accent/60 font-medium text-[0.875rem] mb-4 tracking-wide uppercase">
          {t(`projects.items.${project.id}.category`)}
        </p>
        <p className="text-muted leading-relaxed mb-6 flex-1 text-[0.95rem]">
          {t(`projects.items.${project.id}.description`)}
        </p>
        
        {project.tags && project.tags.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.slice(1).map((tag, i) => (
              <span
                key={i}
                className="rounded-md bg-surface-2/50 px-2.5 py-1 text-[0.8rem] text-muted border border-border transition-colors group-hover:border-accent/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {(project.repoUrl || project.demoUrl) && (
          <div className="flex gap-5 mt-auto pt-4 border-t border-border/50">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.875rem] font-bold text-text hover:text-accent transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group/link"
              >
                {t('projects.viewDemo')}
                <svg className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.875rem] font-medium text-muted hover:text-text transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('projects.viewCode')}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
