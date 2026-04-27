import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { CategoryFilters } from '@/components/CategoryFilters'
import { getCategoryIdBySlug } from '@/utilities/getCategoriesByParent'
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

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { category } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Build the optional category filter. When `category` is absent or doesn't
  // match a known slug, the filter is skipped and all posts are returned.
  // Typed as Payload's `Where` to satisfy the strict type on `find()`.
  const where: Where = {}
  if (category) {
    const categoryId = await getCategoryIdBySlug(category)
    if (categoryId !== null) {
      where.categories = { in: [categoryId] }
    }
  }

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
          parentSlug="blog"
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
