'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export default function LogoWordmark({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const [isProHost, setIsProHost] = React.useState(false)

  React.useEffect(() => {
    try {
      const host = window.location.hostname.toLowerCase()
      setIsProHost(host === 'pro.localhost' || host.startsWith('pro.'))
    } catch {}
  }, [])

  const isPro = pathname?.startsWith('/pro') || isProHost
  const src = isPro ? '/logo-blue.svg' : '/logo-green.svg'
  const alt = isPro ? 'Rushr — for pros' : 'Rushr'

  return (
    <img
      src={src}
      alt={alt}
      className={`block h-7 w-auto select-none ${className}`}
      // small visual padding to soften any edge rounding
      style={{ paddingRight: 2 }}
      draggable={false}
    />
  )
}
