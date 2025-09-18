'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useApp } from '../lib/state'
import Link from "next/link";

type Role = 'homeowner' | 'pro'
const asRole = (v: any): Role | undefined => (v === 'homeowner' || v === 'pro' ? v : undefined)

/** SSR-safe “auth” that only reads browser storage after mount to avoid hydration mismatches. */
export function useAuth() {
  const app = useApp() as any

  const stateRole: Role | undefined =
    asRole(app?.role) || asRole(app?.user?.role) || asRole(app?.currentUser?.role)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  // Only read storage after hydration to keep SSR/first render identical
  const storedRole = useMemo<Role | undefined>(() => {
    if (!hydrated) return undefined
    try {
      return (
        asRole(localStorage.getItem('demoRole')) ||
        asRole(sessionStorage.getItem('demoRole')) ||
        asRole((globalThis as any).__HOUSECALL_DEMO_ROLE)
      )
    } catch {
      return undefined
    }
  }, [hydrated])

  const role = (stateRole ?? storedRole) as Role | undefined
  const name =
    app?.name ??
    app?.user?.name ??
    app?.currentUser?.name ??
    (role ? (role === 'pro' ? 'Pro Demo' : 'Homeowner Demo') : undefined)

  // DEMO RULE: role OR name counts as "signed in"
  const isAuthed = Boolean(role || name)

  return { isAuthed, role, name, hydrated }
}

/** Render `fallback` if not signed in. Keeps SSR safe by waiting for hydration. */
export function RequireSignedIn({
  children,
  fallback = <SignedOutCTA />,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isAuthed, hydrated } = useAuth()
  if (!hydrated) return <div /> // neutral placeholder to match SSR
  if (!isAuthed) return <>{fallback}</>
  return <>{children}</>
}

export function RequireRole({
  role: needed,
  children,
  fallback = <RoleBlockedCTA needed={needed} />,
}: {
  role: Role
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { role, hydrated } = useAuth()
  if (!hydrated) return <div />
  if (role !== needed) return <>{fallback}</>
  return <>{children}</>
}

function SignedOutCTA() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 text-center">
      <h2 className="mb-2 text-lg font-semibold">Please sign in</h2>
      <p className="text-sm text-slate-600">
        This area requires an account. Use the Demo switcher or click Sign in.
      </p>
      <Link
        href="/?auth=signin"
        className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
      >
        Sign in
      </Link>
    </div>
  )
}

function RoleBlockedCTA({ needed }: { needed: Role }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 text-center">
      <h2 className="mb-2 text-lg font-semibold">Not available for this role</h2>
      <p className="text-sm text-slate-600">
        This section is for <span className="font-medium">{needed}</span> accounts.
        Use the Demo switcher to preview as {needed}.
      </p>
    </div>
  )
}
