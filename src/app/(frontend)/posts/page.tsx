import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { CategoryFilters } from '@/components/CategoryFilters'
import { resolveCategoryFilterIds } from '@/utilities/getCategoriesByParent'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import React from 'react'

import PageClient from './page.client'

// NOTE: `dynamic = 'force-static'` was removed because reading `searchParams`
// (the `?category=...` query string) requires dynamic rendering. The
// `revalidate = 600` value is preserved so that data caching still applies
// where Next.js can take advantage of it.
export const revalidate = 600

// This page is scoped to the "blog" parent category. Posts under other
// parents (e.g. `portfolio`) will never appear here, even when "All" is
// selected. Change this constant if the page should scope to a different
// parent — the rest of the page logic adapts automatically.
const BLOG_PARENT_SLUG = 'blog'

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { category } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Resolve which category IDs to filter by:
  //   - no category selected → all children of the blog parent
  //   - specific category selected → just that one
  //   - invalid slug → empty array (caller treats as "no posts")
  const categoryIds = await resolveCategoryFilterIds({
    parentSlug: BLOG_PARENT_SLUG,
    activeSlug: category,
  })

  const where: Where = {}
  if (categoryIds.length > 0) {
    where.categories = { in: categoryIds }
  } else if (category) {
    // The user requested a category that doesn't exist under this page's
    // parent. Render an empty list rather than fall back to "all posts",
    // which would otherwise leak portfolio posts onto the blog page.
    where.categories = { in: [-1] }
  }
  // Else: blog parent has no children configured yet — fall through with
  // no filter so the page still shows posts gracefully during early setup.

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    where,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <CategoryFilters
          parentSlug={BLOG_PARENT_SLUG}
          basePath="/posts"
          activeSlug={category}
        />
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
