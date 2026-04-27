'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

/**
 * Client-side companion to /work/page.tsx.
 *
 * Sets the global header theme so the navigation bar contrasts correctly
 * against the page background. Mirrors the pattern used by the existing
 * /posts/page.client.tsx — if that file uses a different theme value
 * ('dark' vs 'light'), update this file to match for visual consistency.
 */
const PageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  return <React.Fragment />
}

export default PageClient
