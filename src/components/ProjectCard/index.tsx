import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media, Category } from '@/payload-types'

type ProjectCardProps = {
  /**
   * Project data — typically a Post document scoped to the portfolio parent.
   * We accept Partial<Post> because listing pages use `select` to fetch only
   * the fields needed by this card.
   */
  project: Partial<Post> & { id: number | string }

  /**
   * Where the card should link to. Defaults to /posts/<slug> since portfolio
   * items currently live in the `posts` collection. Pass /work/<slug> here
   * once a dedicated /work/<slug> detail route is added in a follow-up PR.
   */
  hrefBase?: string
}

/**
 * Renders a single portfolio project card matching the wireframe design:
 *   - 16:10 thumbnail (image when present, large placeholder text otherwise)
 *   - Category label (mono, uppercase)
 *   - Project title (sans-serif, bold)
 *   - Description from `meta.description`
 *
 * Hover behavior dims the card slightly to mirror the wireframe.
 */
export function ProjectCard({ project, hrefBase = '/posts' }: ProjectCardProps) {
  const slug = typeof project.slug === 'string' ? project.slug : ''
  const title = project.title ?? ''

  // Categories may come back as IDs (depth=0) or full docs (depth=1+).
  // We render whichever child category title is available; fallback to empty.
  const categories = Array.isArray(project.categories) ? project.categories : []
  const primaryCategoryTitle =
    categories
      .map((c): string | null => {
        if (typeof c === 'object' && c !== null) {
          const cat = c as Category
          return cat.title ?? null
        }
        return null
      })
      .find((t): t is string => Boolean(t)) ?? ''

  const meta = project.meta
  const description = typeof meta?.description === 'string' ? meta.description : ''

  // meta.image can be an ID (number/string) or populated Media doc.
  const heroImage =
    typeof meta?.image === 'object' && meta?.image !== null
      ? (meta.image as Media)
      : null
  const heroImageUrl = heroImage?.url ?? null
  const heroImageAlt = heroImage?.alt ?? title

  return (
    <Link
      href={`${hrefBase}/${slug}`}
      className="group block transition-opacity duration-150 hover:opacity-75"
    >
      <div className="relative mb-4 flex aspect-[16/10] items-end overflow-hidden bg-muted p-6">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={heroImageAlt}
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          // Wireframe fallback: large semi-transparent project name as a
          // placeholder when no thumbnail is uploaded yet.
          <span className="font-sans text-3xl font-extrabold leading-none tracking-tight text-foreground/15 md:text-4xl">
            {title}
          </span>
        )}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        {primaryCategoryTitle && (
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {primaryCategoryTitle}
          </span>
        )}
      </div>

      <h2 className="mb-2 font-sans text-xl font-extrabold leading-tight tracking-tight md:text-2xl">
        {title}
      </h2>

      {description && (
        <p className="max-w-[520px] text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </Link>
  )
}

export default ProjectCard
