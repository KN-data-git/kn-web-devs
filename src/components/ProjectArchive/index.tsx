import type { Post } from '@/payload-types'
import { ProjectCard } from '@/components/ProjectCard'

type ProjectArchiveProps = {
  /**
   * Array of project documents, typically the result of:
   *   payload.find({ collection: 'posts', where: { categories: { in: [...] } } })
   */
  projects: Partial<Post>[]

  /**
   * Where each card should link to. See ProjectCard for details.
   * Defaults to '/posts' to match the current detail route.
   */
  hrefBase?: string
}

/**
 * 2-column responsive grid of portfolio project cards.
 *
 * Mirrors the wireframe `.project-grid` layout: two columns on desktop,
 * single column on mobile (≤ 700px). Falls back to an empty-state message
 * when no projects match the current filter.
 */
export function ProjectArchive({ projects, hrefBase = '/posts' }: ProjectArchiveProps) {
  if (projects.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No projects in this category yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-12 py-12 md:grid-cols-2">
      {projects.map((project) => {
        if (project.id === undefined || project.id === null) return null
        return (
          <ProjectCard
            key={project.id}
            project={project as Partial<Post> & { id: number | string }}
            hrefBase={hrefBase}
          />
        )
      })}
    </div>
  )
}

export default ProjectArchive
