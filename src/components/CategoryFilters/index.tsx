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

const chipBase =
  'inline-flex items-center px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider border transition-colors duration-150'

const chipInactive =
  'border-border text-muted-foreground hover:border-foreground hover:text-foreground'

const chipActive = 'border-foreground text-foreground'

function chipClasses(active: boolean): string {
  return `${chipBase} ${active ? chipActive : chipInactive}`
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
 * Styling uses Tailwind utility classes against the design-system tokens
 * (`border-border`, `text-foreground`, `text-muted-foreground`) so dark mode
 * is supported automatically.
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
      className="flex flex-wrap gap-3 border-b border-border py-6"
      role="group"
      aria-label={`${parentSlug} category filters`}
    >
      <Link
        href={basePath}
        className={chipClasses(isAllActive)}
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
            className={chipClasses(isActive)}
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
