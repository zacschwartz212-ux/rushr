'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function BrandClassController() {
  const pathname = usePathname()

  useEffect(() => {
    const host = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '')
    const isPro = pathname?.startsWith('/pro') || host === 'pro.localhost' || host.startsWith('pro.')
    // Apply classes to <body> so Header/Footer inherit brand tokens
    document.body.classList.toggle('theme-blue', !!isPro)
    document.body.classList.toggle('is-pro', !!isPro)
  }, [pathname])

  return null
}
