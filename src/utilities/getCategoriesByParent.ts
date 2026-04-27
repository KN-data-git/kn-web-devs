import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Category } from '@/payload-types'

/**
 * Fetch direct child categories of a given parent, identified by slug.
 *
 * Returns an empty array when:
 *   - the parent slug does not match any category, or
 *   - the parent exists but has no children yet.
 *
 * Used by `<CategoryFilters>` to render filter chips dynamically. No
 * hardcoded category list, no Payload schema changes required.
 *
 * @example
 *   const blogCats = await getCategoriesByParentSlug('blog')
 *   // → [{ slug: 'industry-brief', title: 'Industry Brief', … }, …]
 */
export async function getCategoriesByParentSlug(
  parentSlug: string,
): Promise<Category[]> {
  const payload = await getPayload({ config: configPromise })

  const parent = await payload.find({
    collection: 'categories',
    where: { slug: { equals: parentSlug } },
    limit: 1,
    depth: 0,
    pagination: false,
  })

  const parentDoc = parent.docs[0]
  if (!parentDoc) return []

  const children = await payload.find({
    collection: 'categories',
    where: { parent: { equals: parentDoc.id } },
    sort: 'title',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  return children.docs
}

/**
 * Convenience helper: resolve a category slug to its numeric id.
 *
 * Useful when you have a slug from `searchParams` and need to filter
 * `posts` by `categories.in`.
 */
export async function getCategoryIdBySlug(
  slug: string,
): Promise<number | string | null> {
  const payload = await getPayload({ config: configPromise })

  const res = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    pagination: false,
  })

  return res.docs[0]?.id ?? null
}

/**
 * Resolve the list of category IDs that a listing page should filter posts by.
 *
 * Designed to keep listing pages page-scoped — `/posts` only ever shows
 * posts under blog children, `/work` only ever shows posts under portfolio
 * children. The `activeSlug` parameter narrows further when a specific chip
 * is selected.
 *
 * Behavior:
 *   - `activeSlug` undefined → returns IDs of all children of `parentSlug`.
 *     Use this as the default "All" tab on a page scoped to that parent.
 *   - `activeSlug` matches a child's slug → returns `[that child's id]`.
 *   - `activeSlug` doesn't match any child → returns `[]`. Caller should treat
 *     this as "no results" rather than "no filter" to avoid leaking out-of-scope
 *     posts when a stale or invalid URL is loaded.
 *
 * @example
 *   // Posts page handler
 *   const ids = await resolveCategoryFilterIds({
 *     parentSlug: 'blog',
 *     activeSlug: searchParams.category,
 *   })
 */
export async function resolveCategoryFilterIds({
  parentSlug,
  activeSlug,
}: {
  parentSlug: string
  activeSlug?: string
}): Promise<(number | string)[]> {
  const children = await getCategoriesByParentSlug(parentSlug)

  if (!activeSlug) {
    return children.map((c) => c.id)
  }

  const matched = children.find((c) => c.slug === activeSlug)
  return matched ? [matched.id] : []
}
