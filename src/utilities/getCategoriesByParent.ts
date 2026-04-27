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
