'use client'
import { useEffect } from 'react'
import { useApp } from '../lib/state'

export default function DemoAuth({
  name = 'Zac',
  role = 'homeowner', // 'homeowner' | 'pro' | 'contractor'
  enabled = true,
}: { name?: string; role?: string; enabled?: boolean }) {
  const { signIn, signOut } = useApp()
  useEffect(() => {
    if (enabled) signIn({ name, role: role as any })
    return () => { if (enabled) signOut() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, name, role])
  return null
}
