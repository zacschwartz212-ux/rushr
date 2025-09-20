'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useApp } from '../lib/state'
import { supabaseBrowser } from '../utils/supabase-browser'
import { useHydrated } from '../lib/useHydrated'
import LogoWordmark from './LogoWordmark'

function BellIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  )
}
function ChevronDown(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
function MenuIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

export default function Header() {
  const hydrated = useHydrated()
  const { state, signOut, unreadCount, markMessagesRead } = useApp() as any
  const supabase = supabaseBrowser()
  const router = useRouter()
  const pathname = usePathname() || ''

  // Brand-driven classes (from CSS variables set in layout.tsx)
  const BRAND = {
    primaryText: 'text-[var(--brand-text)]',
    activeUnderline: 'bg-[var(--brand-border)]',
    authAccent:
      'border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-hover)] focus:ring-[var(--brand-ring)]',
  }

  // For local development, use relative paths instead of cross-site URLs
  const isLocalDev = !process.env.NEXT_PUBLIC_PRO_URL && !process.env.NEXT_PUBLIC_MAIN_URL

  // Cross-site base URLs (env overrides with sane local fallbacks)
  const PRO_HOME  = process.env.NEXT_PUBLIC_PRO_URL  || 'http://pro.localhost:3000'
  const MAIN_HOME = process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000'

  // Safe join: base + path (handles trailing/leading slashes)
  const join = (base: string, path: string) =>
    base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '')

  // Helpers to target the right site - use relative paths in local dev
  const toMain = (p: string) => isLocalDev ? p : join(MAIN_HOME, p)
  const toPro  = (p: string) => isLocalDev ? p : join(PRO_HOME, p)

  // External-safe navigation (absolute URLs go via full page load)
  const go = (href: string) => {
    if (/^https?:\/\//i.test(href)) window.location.href = href
    else router.push(href)
  }

  const [openFindPro, setOpenFindPro] = useState(false)
  const [openFindWork, setOpenFindWork] = useState(false)
  const [openMore, setOpenMore] = useState(false)
  const timers = useRef<Record<string, number | null>>({ pro: null, work: null, more: null })

  const [showMsgs, setShowMsgs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const msgsRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (msgsRef.current && !msgsRef.current.contains(t)) setShowMsgs(false)
      if (userRef.current && !userRef.current.contains(t)) setShowUser(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => { if (showMsgs) markMessagesRead?.(3) }, [showMsgs, markMessagesRead])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowAuth(false) }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  // Cleanup timers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(timer => {
        if (timer) window.clearTimeout(timer)
      })
    }
  }, [])

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))
  const role = hydrated ? ((state?.user?.role || null) as 'HOMEOWNER' | 'CONTRACTOR' | null) : null
  const signedIn = hydrated ? !!state?.user?.signedIn : false
  const safeUnread = hydrated ? (unreadCount ?? 0) : 0
  const displayName = hydrated ? (state?.user?.name || 'User') : 'Sign in'

  // Role-aware dashboard target (contractor -> pro; homeowner -> main)
  // In local dev, just use /dashboard for all roles
  const dashboardHref = isLocalDev ? '/dashboard'
                     : role === 'CONTRACTOR' ? toPro('/dashboard')
                     : role === 'HOMEOWNER' ? toMain('/dashboard')
                     : toMain('/dashboard')

  // Simple nav link with "active" underline for local paths only
  const NavA = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = !/^https?:\/\//i.test(href) && isActive(href)
    return (
      <Link
        href={href}
        className={`relative inline-flex items-center hover:text-ink dark:hover:text-white pb-1 font-medium ${
          active ? BRAND.primaryText : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        <span>{children}</span>
        <span
          className={`pointer-events-none absolute left-0 right-0 -bottom-[3px] h-[2px] rounded transition-opacity ${
            active ? `opacity-100 ${BRAND.activeUnderline}` : 'opacity-0'
          }`}
        />
      </Link>
    )
  }

  function HoverDrop({
    label, open, setOpen, items, active, keyName
  }: {
    label: string
    open: boolean
    setOpen: (v: boolean) => void
    active?: boolean
    keyName: 'pro' | 'work' | 'more'
    items: { label: string; href?: string; onClick?: () => void }[]
  }) {
    const startClose = () => {
      const k = keyName
      if (timers.current[k]) window.clearTimeout(timers.current[k] as number)
      timers.current[k] = window.setTimeout(() => setOpen(false), 200) as any
    }
    const cancelClose = () => {
      const k = keyName
      if (timers.current[k]) {
        window.clearTimeout(timers.current[k] as number)
        timers.current[k] = null
      }
    }

    const handleOpen = () => {
      // Close other dropdowns to prevent multiple open
      if (keyName !== 'pro') setOpenFindPro(false)
      if (keyName !== 'work') setOpenFindWork(false)
      if (keyName !== 'more') setOpenMore(false)
      cancelClose()
      setOpen(true)
    }

    const handleClick = () => {
      if (open) {
        setOpen(false)
      } else {
        handleOpen()
      }
    }
    return (
      <div className="relative" onMouseEnter={handleOpen} onMouseLeave={startClose}>
        <button
          onClick={handleClick}
          className={`relative inline-flex items-center pb-1 hover:text-ink dark:hover:text-white font-medium transition-colors ${
            active ? BRAND.primaryText : 'text-slate-700 dark:text-slate-200'
          }`}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {label}
          <span
            className={`pointer-events-none absolute left-0 right-0 -bottom-[3px] h-[2px] rounded transition-opacity ${
              active ? `opacity-100 ${BRAND.activeUnderline}` : 'opacity-0'
            }`}
          />
          <span className={`ml-1 inline-block transition-transform duration-200 ease-in-out ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {open && (
          <div
            className="absolute left-0 top-8 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 w-64 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200"
            onMouseEnter={cancelClose}
            onMouseLeave={startClose}
            role="menu"
          >
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => {
                  cancelClose()
                  setOpen(false)
                  if (it.href) go(it.href)
                  else it.onClick?.()
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                role="menuitem"
              >
                {it.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Route menus to their owning site (absolute URLs)
  const findProItems = [
    { label: 'Post a Job',            href: toMain('/post-job') },
    { label: 'Search for a Pro',      href: toMain('/find-pro') },
    { label: 'How it Works',          href: toMain('/how-it-works') },
  ]
  const findWorkItems = [
    { label: 'Browse Jobs',               href: toPro('/jobs') },
    { label: 'How it Works (for Pros)',   href: toPro('/find-work/how-it-works') },
    { label: 'Signals ★',                 href: toPro('/signals') },
  ]
  const moreItems = [
    { label: 'About',   href: toMain('/about') },
    { label: 'Contact', href: toMain('/contact') },
    { label: 'Pricing', href: toMain('/pricing') },
  ]

  // "Active" underline only applies to local sections
  const findProActive = ['/post-job', '/find-pro', '/how-it-works'].some(isActive)
  const findWorkActive = ['/jobs', '/find-work', '/signals'].some(isActive)
  const moreActive = ['/about', '/contact', '/pricing'].some(isActive)

  const roleLabel = role === 'CONTRACTOR' ? 'Contractor' : role === 'HOMEOWNER' ? 'Homeowner' : null
  const roleCls =
    role === 'CONTRACTOR'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-100 dark:bg-slate-900/85 dark:border-slate-800">
      <div className="container-max py-3 flex items-center gap-4">
        {/* Keep logo linking to site root on current host */}
        <Link href="/" className="flex items-center gap-2">
          <LogoWordmark />
        </Link>

        <nav className="ml-6 hidden md:flex items-center gap-6">
          <HoverDrop
            label="Find a Pro"
            keyName="pro"
            open={openFindPro}
            setOpen={setOpenFindPro}
            items={findProItems}
            active={findProActive}
          />
          <HoverDrop
            label="For Pros"
            keyName="work"
            open={openFindWork}
            setOpen={setOpenFindWork}
            items={findWorkItems}
            active={findWorkActive}
          />
          <NavA href="/teams">Rushr Teams</NavA>
          <HoverDrop
            label="More"
            keyName="more"
            open={openMore}
            setOpen={setOpenMore}
            items={moreItems}
            active={moreActive}
          />
          {/* Dashboard (role-aware absolute link) */}
          <NavA href={dashboardHref}>Dashboard</NavA>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!signedIn ? (
            <>
              {/* Outlined auth button with brand-colored accents */}
              <button
                className={`inline-flex items-center px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 transition ${BRAND.authAccent} focus:outline-none focus:ring-2`}
                onClick={() => setShowAuth(true)}
              >
                Sign in / Sign up
              </button>

              {/* Join as a Pro → Pro homepage */}
              <Link
                href={PRO_HOME}
                className="hidden sm:inline font-semibold text-ink dark:text-white hover:underline underline-offset-4 decoration-2"
              >
                Join as a Pro
              </Link>
            </>
          ) : (
            <>
              <div className="relative" ref={msgsRef}>
                <button className="relative btn btn-outline" onClick={() => setShowMsgs(v => !v)} aria-label="Messages">
                  <BellIcon />
                  {safeUnread > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      <span suppressHydrationWarning>{safeUnread > 9 ? '9+' : String(safeUnread)}</span>
                    </span>
                  )}
                </button>
                {showMsgs && (
                  <div className="absolute right-0 top-12 w-80 card p-3">
                    <div className="text-sm font-semibold text-ink dark:text-white px-1">Recent messages</div>
                    <div className="mt-2 space-y-2 max-h-64 overflow-auto">
                      {(state?.messages || []).slice(0, 3).map((m: any) => (
                        <div key={m.id} className="rounded-lg border border-slate-100 dark:border-slate-800 p-2">
                          <div className="text-sm font-medium text-ink dark:text-white">{m.from}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{m.body}</div>
                        </div>
                      ))}
                    </div>
                    <Link href="/messages" className="btn-primary w-full mt-3 text-center">View all messages</Link>
                  </div>
                )}
              </div>

              <div className="relative" ref={userRef}>
                <button
                  className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-ink dark:text-white text-sm inline-flex items-center gap-2"
                  onClick={() => setShowUser(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={showUser}
                >
                  <span suppressHydrationWarning>{displayName}</span>
                  {roleLabel && (
                    <span suppressHydrationWarning className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${roleCls}`}>
                      {roleLabel}
                    </span>
                  )}
                  <ChevronDown />
                </button>
                {showUser && (
                  <div className="absolute right-0 top-12 w-64 card p-2">
                    {[
                      { label: 'Dashboard', href: dashboardHref },
                      ...(signedIn ? [{ label: 'Messages', href: '/messages' }] : []),
                      { label: 'Account', href: '/account' }, // these two may be site-local; keep relative
                      { label: 'Job History', href: '/history' },
                      { label: 'Post a Job', href: toMain('/post-job') }, // always main
                      {
                        label: 'Sign Out',
                        onClick: async () => {
                          setShowUser(false)
                          await supabase.auth.signOut()
                          try {
                            localStorage.removeItem('demoRole')
                            sessionStorage.removeItem('demoRole')
                            ;(globalThis as any).__HOUSECALL_DEMO_ROLE = undefined
                          } catch {}
                          signOut?.()
                          router.refresh()
                        },
                      },
                    ].map((it, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setShowUser(false)
                          if ('href' in it && it.href) go(it.href)
                          else (it as any).onClick?.()
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
                        role="menuitem"
                      >
                        {it.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          <button className="md:hidden ml-1 btn btn-outline" onClick={() => {}} aria-label="Toggle menu">
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAuth(false)} />
          <div className="relative z-10 card p-5 w-[92vw] max-w-md shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-white">Welcome to Rushr</h3>
              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setShowAuth(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in or create an account to continue.</p>

            <div className="mt-4 space-y-2">
              <button className="btn-primary w-full" onClick={() => router.push('/sign-in')}>
                Sign in
              </button>
              <button className="btn w-full" onClick={() => router.push('/sign-up')}>
                Create an account
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
