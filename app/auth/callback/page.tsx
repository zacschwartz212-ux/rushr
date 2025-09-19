// app/auth/callback/page.tsx
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import AuthCallbackClient from './page.client'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackClient />
    </Suspense>
  )
}
