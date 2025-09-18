'use client'
import React from 'react'
import { useApp } from '../lib/state'

type Role = 'homeowner' | 'pro'

function setDemoRole(role?: Role) {
  try {
    if (!role) {
      localStorage.removeItem('demoRole')
      sessionStorage.removeItem('demoRole')
      ;(globalThis as any).__HOUSECALL_DEMO_ROLE = undefined
      return
    }
    localStorage.setItem('demoRole', role)
    sessionStorage.setItem('demoRole', role)
    ;(globalThis as any).__HOUSECALL_DEMO_ROLE = role
  } catch { /* ignore */ }
}

export default function DemoAuthSwitcher() {
  // simplest: treat app state as any so we can call signIn/signOut without TS fuss
  const app = useApp() as any
  const { signIn, signOut, role } = app || {}

  const setRole = (r: Role) => {
    setDemoRole(r)
    if (typeof signIn === 'function') {
      // cast to any to match your AppContextValue signature
      signIn({ name: r === 'pro' ? 'Pro Demo' : 'Homeowner Demo', role: r } as any)
    }
  }

  const clearRole = () => {
    setDemoRole(undefined)
    if (typeof signOut === 'function') signOut()
  }

  const shown =
    role ??
    (typeof window !== 'undefined'
      ? (localStorage.getItem('demoRole') || (globalThis as any).__HOUSECALL_DEMO_ROLE || 'signed out')
      : 'signed out')

  return (
    <div className="fixed bottom-4 right-4 z-40 rounded-xl border bg-white p-2 shadow">
      <div className="mb-2 text-xs text-slate-600">Preview as:</div>
      <div className="flex gap-1">
        <button
          className={`rounded-md px-2 py-1 text-xs ${shown==='homeowner' ? 'bg-emerald-600 text-white' : 'border hover:bg-slate-50'}`}
          onClick={() => setRole('homeowner')}
        >
          Homeowner
        </button>
        <button
          className={`rounded-md px-2 py-1 text-xs ${shown==='pro' ? 'bg-emerald-600 text-white' : 'border hover:bg-slate-50'}`}
          onClick={() => setRole('pro')}
        >
          Pro
        </button>
        <button className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50" onClick={clearRole}>
          Signed out
        </button>
      </div>
      <div className="mt-1 text-[11px] text-slate-500">Demo: {String(shown)}</div>
    </div>
  )
}
