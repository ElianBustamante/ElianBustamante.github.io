import { useTranslation } from 'react-i18next'


export default function ProjectCard({ project }) {
  const { t } = useTranslation()

  return (
    <article className="flex h-full flex-col rounded-card border border-accent/40 bg-surface hover:border-accent focus-within:border-accent">
      {project.image ? (
        <div className="relative">
          <img
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover rounded-t-[calc(var(--radius-card)-1px)]"
          />
          {project.tags && project.tags.length > 0 && (
            <span className="absolute top-2 right-2 rounded-full bg-surface-2/80 px-2 py-1 text-[0.875rem] border border-border">
              {project.tags[0]}
            </span>
          )}
        </div>
      ) : (
        <div className="relative pt-8">
          {project.tags && project.tags.length > 0 && (
            <span className="absolute top-4 right-4 rounded-full bg-surface-2 px-2 py-1 text-[0.875rem] border border-border">
              {project.tags[0]}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 md:p-6">
        <h3 className="text-accent font-bold text-lg mb-1">
          {t(`projects.items.${project.id}.name`)}
        </h3>
        <p className="text-muted text-[0.875rem] mb-3">
          {t(`projects.items.${project.id}.category`)}
        </p>
        <p className="text-text mb-4 flex-1">
          {t(`projects.items.${project.id}.description`)}
        </p>
        
        {project.tags && project.tags.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(1).map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-surface-2 px-2 py-1 text-[0.875rem] border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {(project.repoUrl || project.demoUrl) && (
          <div className="flex gap-4 mt-auto">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.875rem] font-semibold text-accent hover:text-accent-hover transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              >
                {t('projects.viewCode')}
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.875rem] font-semibold text-accent hover:text-accent-hover transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              >
                {t('projects.viewDemo')}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
