'use client'

import React, { Suspense, useEffect } from 'react'
import { AppProvider } from '../lib/state'
import { useSearchParams } from 'next/navigation'
import { openAuth as openAuthModal } from '../components/AuthModal'
import DemoAuthSwitcher from '../components/DemoAuthSwitcher'

/** Only this tiny component touches useSearchParams, wrapped in <Suspense>. */
function SP() {
  const sp = useSearchParams()
  useEffect(() => {
    const q = sp.get('auth')
    if (q === 'signin' || q === 'signup') openAuthModal(q as 'signin' | 'signup')
  }, [sp])
  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Suspense fallback={null}>
        <SP />
      </Suspense>
      {children}
      <DemoAuthSwitcher />
    </AppProvider>
  )
}
