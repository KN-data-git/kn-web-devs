import Link from 'next/link'
import { getCategoriesByParentSlug } from '@/utilities/getCategoriesByParent'

type CategoryFiltersProps = {
  /**
   * Slug of the parent category whose direct children become filter chips.
   * Examples: 'blog', 'portfolio'.
   */
  parentSlug: string

  /**
   * Base URL of the listing page. Each chip becomes a link to
   * `${basePath}?category=<slug>`. The "All" chip points to `basePath`.
   * Examples: '/posts', '/work'.
   */
  basePath: string

  /**
   * Currently selected category slug, typically read from `searchParams.category`
   * on the parent page. When undefined, the "All" chip is highlighted.
   */
  activeSlug?: string

  /** Label for the "All" chip. Defaults to 'All'. */
  allLabel?: string
}

/**
 * Server component that renders filter chips driven by Payload categories.
 *
 * Behavior:
 * - Fetches direct children of `parentSlug` via the Payload local API.
 * - Returns `null` (renders nothing) if the parent has no children — keeps
 *   the page clean before any sub-categories exist or after they are removed.
 * - Highlights the chip whose slug matches `activeSlug`; otherwise "All" is
 *   shown active.
 * - Each chip is a server-rendered `<Link>`, so URLs are shareable and
 *   back/forward navigation works without client-side JavaScript.
 *
 * Class names (`filters`, `filter-btn`, `active`) match the existing wireframe
 * CSS, so chips inherit the design-system styling once the global stylesheet
 * is loaded.
 */
export async function CategoryFilters({
  parentSlug,
  basePath,
  activeSlug,
  allLabel = 'All',
}: CategoryFiltersProps) {
  const categories = await getCategoriesByParentSlug(parentSlug)

  if (categories.length === 0) return null

  const isAllActive = !activeSlug

  return (
    <div
      className="filters"
      role="group"
      aria-label={`${parentSlug} category filters`}
    >
      <Link
        href={basePath}
        className={`filter-btn${isAllActive ? ' active' : ''}`}
        aria-current={isAllActive ? 'true' : undefined}
        prefetch={false}
      >
        {allLabel}
      </Link>
      {categories.map((cat) => {
        const slug = cat.slug ?? ''
        const isActive = activeSlug === slug
        return (
          <Link
            key={cat.id}
            href={`${basePath}?category=${encodeURIComponent(slug)}`}
            className={`filter-btn${isActive ? ' active' : ''}`}
            aria-current={isActive ? 'true' : undefined}
            prefetch={false}
            data-filter={slug}
          >
            {cat.title}
          </Link>
        )
      })}
    </div>
  )
}

export default CategoryFilters
