// app/auth/callback/page.client.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackClient() {
  const router = useRouter()
  const sp = useSearchParams()

  useEffect(() => {
    const cb = sp.get('callbackUrl') || '/onboarding/choose-role'
    router.replace(cb)
  }, [router, sp])

  return <div className="p-6">Finishing sign-in…</div>
}
