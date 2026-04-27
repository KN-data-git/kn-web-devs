import type { Metadata } from 'next/types'

import { CategoryFilters } from '@/components/CategoryFilters'
import { ProjectArchive } from '@/components/ProjectArchive'
import { resolveCategoryFilterIds } from '@/utilities/getCategoriesByParent'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import React from 'react'

import PageClient from './page.client'

// `searchParams` makes this route dynamic; do not add `force-static`.
export const revalidate = 600

// This page is scoped to the "portfolio" parent category. Posts under other
// parents (e.g. `blog`) will never appear here, even when "All" is selected.
const PORTFOLIO_PARENT_SLUG = 'portfolio'

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { category } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Resolve which category IDs to filter projects by. See utility doc-comments
  // for behavior across "All", specific-category, and invalid-slug cases.
  const categoryIds = await resolveCategoryFilterIds({
    parentSlug: PORTFOLIO_PARENT_SLUG,
    activeSlug: category,
  })

  const where: Where = {}
  if (categoryIds.length > 0) {
    where.categories = { in: categoryIds }
  } else if (category) {
    // Requested category not found under portfolio — render empty rather
    // than fall back to all posts (which would leak blog posts onto /work).
    where.categories = { in: [-1] }
  }

  const projects = await payload.find({
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

      {/* Page header — matches the wireframe portfolio.html copy. */}
      <div className="container mb-16">
        <p className="mb-4 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Work
        </p>
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="!mb-6">Signals into stories.</h1>
          <p className="lead max-w-[640px] text-muted-foreground">
            A selection of projects where streaming data, fandom behavior, and
            market signals became campaigns, content, and strategy for
            entertainment brands.
          </p>
        </div>
      </div>

      <div className="container mb-8">
        <CategoryFilters
          parentSlug={PORTFOLIO_PARENT_SLUG}
          basePath="/work"
          activeSlug={category}
        />
      </div>

      <div className="container">
        <ProjectArchive projects={projects.docs} />
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Work — Kreators Network`,
    description:
      'Selected projects where streaming data, fandom behavior, and market signals shaped campaigns, content, and strategy for entertainment brands.',
  }
}
