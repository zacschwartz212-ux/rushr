'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  ShieldCheck,
  MessageSquare,
  CalendarDays,
  MapPin,
  Quote,
  CheckCircle,
  XCircle,
  Sparkles,
  BadgeCheck,
  Home as HomeIcon,
  Wrench,
  Lightbulb,
  ShowerHead,
  Wind,
  Car,
  Lock,
  Droplets,
  ArrowRight,
  Siren,
  Hammer,
  KeyRound,
  Battery,
  Settings,
  Leaf,
  Bug,
} from 'lucide-react'

/* ----------------------------------------------------------------
   Brand helpers (emerald-forward for homeowners)
----------------------------------------------------------------- */
const HOME_GREEN = '#059669'
const homeText = 'text-[var(--home)]'
const homeBg = 'bg-[var(--home)]'
const homeRing = 'focus-visible:ring-[var(--home)]'

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-clip bg-gray-50">
      <GradientMesh />

      {/* HERO */}
      <HeroHome />

      {/* STATS */}
      <StatStrip />

      {/* POPULAR EMERGENCIES (Home / Auto / General) */}
      <PopularEmergencies />

      {/* HOW IT WORKS */}
      <HowItWorksHome />

      {/* GEO */}
      <GeoBanner />

      {/* FEATURED PROS */}
      <FeaturedPros />

      {/* TRUST & SAFETY */}
      <TrustAndSafetyEqual />

      {/* TESTIMONIALS */}
      <TestimonialsHome />

      {/* FINAL CTA */}
      <FinalCTAHome />

      {/* MOBILE STICKY CTA */}
      <MobileStickyCTAHome />

      <LocalKeyframes />
    </div>
  )
}

/* -------------------------------------------
   HERO — keep layout, swap copy
-------------------------------------------- */
function HeroHome() {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <section className="relative" onMouseMove={onMove}>
      {/* Spotlight follows cursor */}
      <motion.div
        className="pointer-events-none absolute -z-10 h-72 w-72 rounded-full"
        style={{
          left: pos.x - 140,
          top: pos.y - 140,
          background: 'radial-gradient(closest-side, rgba(16,185,129,.22), transparent 70%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.65, 0.9, 0.65] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-16 pb-10 md:grid-cols-2 md:pt-24">
        {/* Left copy */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-black tracking-tight text-gray-900 md:text-6xl"
          >
            Urgent? We’re built for that.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-4 max-w-xl text-lg text-gray-600"
          >
            Just one tap to book an on-call pro with a clear hourly rate and time-verified billing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/post-job?urgent=1" className="inline-flex">
              <Button size="lg" className={`${homeBg} text-white ${homeRing} hover:opacity-95`}>
                Book now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works" className="inline-flex">
              <Button
                size="lg"
                variant="outline"
                className="border-[var(--home)] text-[var(--home)] hover:bg-[color:rgb(16_185_129_/_0.08)] focus-visible:ring-[var(--home)]"
              >
                How it works
              </Button>
            </Link>
          </motion.div>

          {/* Floating trust badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            <FloatingBadge icon={<BadgeCheck className="h-4 w-4" />} text="Verified pros" delay={0} />
            <FloatingBadge icon={<ShieldCheck className="h-4 w-4" />} text="Clear hourly rates" delay={0.15} />
            <FloatingBadge icon={<Siren className="h-4 w-4" />} text="Start & end times verified" delay={0.3} />
          </div>
        </div>

        {/* Right: UI preview cards (kept) */}
        <div className="relative">
          <StackedPreview />
        </div>
      </div>
    </section>
  )
}

function FloatingBadge({ icon, text, delay = 0 }: { icon: React.ReactNode; text: string; delay?: number }) {
  return (
    <motion.div
      className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-3 py-1 text-sm text-emerald-900 backdrop-blur"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <span className={`${homeText}`}>{icon}</span>
      {text}
    </motion.div>
  )
}

function StackedPreview() {
  return (
    <div className="relative h-[420px] w-full">
      <motion.div
        className="absolute left-6 top-2 w-[85%] rounded-2xl border border-emerald-200/70 bg-white/90 p-3 shadow-xl backdrop-blur"
        initial={{ y: 40, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: -2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ transformOrigin: '40% 0%' }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
          <MessageSquare className={`${homeText} h-4 w-4`} />
          Diagnostic chat/video
        </div>
        <div className="space-y-2 text-sm">
          <div className="max-w-[85%] rounded-lg bg-gray-100 px-3 py-2 text-gray-800">Quick leak under the sink — what’s the ETA?</div>
          <div className={`ml-auto max-w-[85%] rounded-lg ${homeBg} px-3 py-2 text-white`}>I can be there today. Hourly is $125. Want a quick video call?</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 top-24 w-[78%] rounded-2xl border border-emerald-200/70 bg-white/90 p-3 shadow-xl backdrop-blur"
        initial={{ y: 60, opacity: 0, rotate: 3 }}
        animate={{ y: 0, opacity: 1, rotate: 3 }}
        transition={{ duration: 0.55, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800">Estimate</div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Approve first</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded bg-emerald-100">
          <div className="h-2 w-2/3 bg-[var(--home)]" />
        </div>
        <div className="mt-2 text-xs text-gray-500">Hourly labor + agreed parts/materials</div>
      </motion.div>

      <motion.div
        className="absolute left-6 bottom-2 w-[72%] rounded-2xl border border-emerald-200/70 bg-white/90 p-3 shadow-xl backdrop-blur"
        initial={{ y: 80, opacity: 0, rotate: -1 }}
        animate={{ y: 0, opacity: 1, rotate: -1 }}
        transition={{ duration: 0.6, delay: 0.28 }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays className="h-4 w-4 text-emerald-600" />
          Scheduling
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {['ASAP', 'Today', 'Next available'].map((s) => (
            <div key={s} className="rounded-lg border bg-white/70 p-2 text-center">
              {s}
            </div>
          ))}
        </div>
      </motion.div>

      {/* subtle glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[color:rgb(16_185_129_/_0.15)] blur-3xl" />
    </div>
  )
}

/* -------------------------------------------
   STATS STRIP — animated counters
-------------------------------------------- */
function StatStrip() {
  return (
    <section className="border-y bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-3">
        <StatItem icon={<ShieldCheck className="h-5 w-5" />} label="Verified emergency pros" end={1200} suffix="+" />
        <StatItem icon={<Siren className="h-5 w-5" />} label="Avg. response time (mins)" end={12} />
        <StatItem icon={<Quote className="h-5 w-5" />} label="Avg. quotes per job" end={3} />
      </div>
    </section>
  )
}
function StatItem({ icon, label, end, suffix = '' }: { icon: React.ReactNode; label: string; end: number; suffix?: string }) {
  const val = useCountUp(end, 900)
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-200/60 bg-white/70 px-4 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 ${homeText}`}>{icon}</div>
      <div>
        <div className="text-xl font-extrabold text-slate-900">
          {val}
          {suffix}
        </div>
        <div className="text-xs text-slate-600">{label}</div>
      </div>
    </div>
  )
}
function useCountUp(to: number, duration = 800) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(to * (0.5 - 0.5 * Math.cos(Math.PI * p))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return n
}

/* -------------------------------------------
   POPULAR EMERGENCIES — tabs + centered rows via ghost pads
-------------------------------------------- */
function PopularEmergencies() {
  type Group = 'Home' | 'Auto' | 'General'
  const [group, setGroup] = useState<Group>('Home')

  // Detect intended column count by breakpoint (tailwind defaults)
  const cols = useGridCols() // 2 (base), 3 (sm+), 4 (lg+)

  const groups: Record<
    Group,
    Array<{ name: string; href: string; icon: React.ReactNode; hint?: string }>
  > = {
    Home: [
      { name: 'Plumbing', href: '/find-pro?category=Plumbing&urgent=1', icon: <ShowerHead className="h-6 w-6" />, hint: 'Leaks, clogs, burst pipes' },
      { name: 'Electrical', href: '/find-pro?category=Electrical&urgent=1', icon: <Lightbulb className="h-6 w-6" />, hint: 'No power, breakers, outlets' },
      { name: 'HVAC', href: '/find-pro?category=HVAC&urgent=1', icon: <Wind className="h-6 w-6" />, hint: 'No-cool, no-heat' },
      { name: 'Roof leak', href: '/find-pro?category=Roofing&urgent=1', icon: <HomeIcon className="h-6 w-6" />, hint: 'Active leak, tarp' },
      { name: 'Water damage', href: '/find-pro?category=Water%20Damage&urgent=1', icon: <Droplets className="h-6 w-6" />, hint: 'Dry-out, mitigation' },
      { name: 'Locksmith', href: '/find-pro?category=Locksmith&urgent=1', icon: <Lock className="h-6 w-6" />, hint: 'House lockout, rekey' },
      { name: 'Appliance repair', href: '/find-pro?category=Appliance%20Repair&urgent=1', icon: <Wrench className="h-6 w-6" />, hint: 'Fridge, washer, oven' },
      { name: 'Handyman', href: '/find-pro?category=Handyman&urgent=1', icon: <Hammer className="h-6 w-6" />, hint: 'Small urgent fixes' },
    ],
    Auto: [
      { name: 'Jump start', href: '/find-pro?category=Auto%20Battery&urgent=1', icon: <Battery className="h-6 w-6" />, hint: 'Dead battery' },
      { name: 'Tire change', href: '/find-pro?category=Auto%20Tire&urgent=1', icon: <Wrench className="h-6 w-6" />, hint: 'Flat, spare install' },
      { name: 'Lockout', href: '/find-pro?category=Auto%20Lockout&urgent=1', icon: <KeyRound className="h-6 w-6" />, hint: 'Keys inside' },
      { name: 'Tow request', href: '/find-pro?category=Tow&urgent=1', icon: <Car className="h-6 w-6" />, hint: 'Local tow' },
      { name: 'Fuel delivery', href: '/find-pro?category=Fuel%20Delivery&urgent=1', icon: <Siren className="h-6 w-6" />, hint: 'Out of gas' },
      { name: 'Mobile mechanic', href: '/find-pro?category=Mobile%20Mechanic&urgent=1', icon: <Settings className="h-6 w-6" />, hint: 'On-site diagnosis' },
    ],
    General: [
      { name: 'Board-up', href: '/find-pro?category=Board%20Up&urgent=1', icon: <Hammer className="h-6 w-6" />, hint: 'Windows, doors' },
      { name: 'Storm damage', href: '/find-pro?category=Storm%20Damage&urgent=1', icon: <Siren className="h-6 w-6" />, hint: 'Wind, hail' },
      { name: 'Tree down', href: '/find-pro?category=Tree%20Service&urgent=1', icon: <Leaf className="h-6 w-6" />, hint: 'Removal, clearance' },
      { name: 'Pest emergency', href: '/find-pro?category=Pest%20Control&urgent=1', icon: <Bug className="h-6 w-6" />, hint: 'Wasps, rodents' },
      { name: 'Glass repair', href: '/find-pro?category=Glass%20Repair&urgent=1', icon: <HomeIcon className="h-6 w-6" />, hint: 'Windows, doors' },
      { name: 'Other', href: '/find-pro?category=General&urgent=1', icon: <Sparkles className="h-6 w-6" />, hint: 'Tell us what happened' },
    ],
  }

  const cats = groups[group]
  const padCount = ((cols - (cats.length % cols)) % cols) // 0..(cols-1)

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Popular emergencies</h2>
        <p className="mt-2 text-gray-600">Pick a category and get matched fast.{' '}
          <Link href="/find-pro?urgent=1" className="font-semibold text-emerald-700 hover:text-emerald-800">See all emergencies →</Link>
        </p>
        <div></div>

        {/* Segmented control */}
<div className="mt-4 flex justify-center">
  <div className="relative inline-flex rounded-full bg-slate-100 p-1">
    {(['Home', 'Auto', 'General'] as Group[]).map((g) => {
      const active = group === g
      return (
        <button
          key={g}
          onClick={() => setGroup(g)}
          className={`
            relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition
            ${active ? 'text-white' : 'text-slate-600 hover:text-slate-800'}
          `}
        >
          {g}
          {active && (
            <motion.span
              layoutId="pill"
              className="absolute inset-0 z-[-1] rounded-full bg-emerald-600"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      )
    })}
  </div>
</div>

      </div>

      {/* Strict grid: 2 / 3 / 4 columns — no awkward last row thanks to ghost pads */}
      <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {cats.map((c, i) => (
          <Link key={i} href={c.href} className="group">
            <Card className="relative h-full overflow-hidden border-emerald-200/60 bg-white/85 p-3 transition hover:shadow-sm">
              <GradientBorder emerald />
              <div className="flex items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 ${homeText}`}>
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{c.name}</div>
                  <div className="truncate text-[11px] text-slate-500">{c.hint ?? '\u00A0'}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {/* Ghost pads to complete the row visually */}
        {Array.from({ length: padCount }).map((_, i) => (
          <div
            key={`pad-${i}`}
            aria-hidden
            className="opacity-0 pointer-events-none"
          >
            <Card className="p-3" />
          </div>
        ))}
      </div>
    </section>
  )
}

/* Hook: return the grid column count we use at each breakpoint (base/sm/lg) */
function useGridCols() {
  const [cols, setCols] = useState(2) // base
  useEffect(() => {
    const mSm = window.matchMedia('(min-width: 640px)')
    const mLg = window.matchMedia('(min-width: 1024px)')

    const calc = () => setCols(mLg.matches ? 4 : mSm.matches ? 3 : 2)
    calc()
    mSm.addEventListener?.('change', calc)
    mLg.addEventListener?.('change', calc)
    return () => {
      mSm.removeEventListener?.('change', calc)
      mLg.removeEventListener?.('change', calc)
    }
  }, [])
  return cols
}


/* -------------------------------------------
   HOW IT WORKS — emergency flow
-------------------------------------------- */
function HowItWorksHome() {
  const steps = [
    {
      title: 'Request help',
      desc: 'Describe the emergency and ZIP. Add a quick video call if useful.',
      icon: <MessageSquare className={`h-6 w-6 ${homeText}`} />,
    },
    {
      title: 'Approve estimate',
      desc: 'See clear hourly rates and expected parts. Approve before arrival.',
      icon: <Quote className={`h-6 w-6 ${homeText}`} />,
    },
    {
      title: 'Verified time & pay',
      desc: 'Both parties check in/out. Time is verified. Itemized invoice.',
      icon: <CalendarDays className={`h-6 w-6 ${homeText}`} />,
    },
  ]
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold text-gray-900">How it works</h2>
        <p className="mt-1 text-gray-600">Simple, fast, and transparent for urgent jobs.</p>
      </div>
      <div className="mt-8 grid items-stretch gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <TiltCard key={i}>
            <Card className="relative flex h-full flex-col overflow-hidden border-emerald-200/60 bg-white/85 shadow-sm">
              <GradientBorder emerald />
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
                  {s.icon}
                </div>
                <CardTitle className="text-gray-900">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-gray-600">{s.desc}</p>
              </CardContent>
            </Card>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------
   GEO BANNER — simple guess (kept)
-------------------------------------------- */
function GeoBanner() {
  const [city, setCity] = useState<string | null>(null)
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
      const guess =
        tz.includes('New_York') ? 'New York, NY' :
        tz.includes('Los_Angeles') ? 'Los Angeles, CA' :
        tz.includes('Chicago') ? 'Chicago, IL' :
        tz.includes('Phoenix') ? 'Phoenix, AZ' :
        tz.includes('Denver') ? 'Denver, CO' : null
      setCity(guess)
    } catch { setCity(null) }
  }, [])
  const popular = useMemo(
    () => ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Phoenix, AZ', 'Miami, FL', 'Seattle, WA'],
    []
  )

  return (
    <section className="border-y bg-gradient-to-br from-emerald-50 to-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-emerald-700">Find pros near you</div>
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 md:text-xl">
            <MapPin className="h-5 w-5 text-emerald-700" />
            <span>{city ? `On-call pros in ${city}` : 'On-call pros near you'}</span>
          </div>
          <div className="mt-1 text-sm text-slate-600">Clear rates, verified times, emergency jobs only.</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {popular.map((c) => (
            <a key={c} href={`/find-pro?near=${encodeURIComponent(c)}`} className="rounded-full border bg-white px-3 py-1 text-xs hover:border-emerald-200 hover:bg-emerald-50">
              {c}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   FEATURED PROS — compact, equal height, with badges
-------------------------------------------- */
function FeaturedPros() {
  const pros = [
    { id: 'p1', name: 'Manny’s HVAC', trade: 'HVAC', rating: 4.9, jobs: 320, city: 'Queens, NY', since: 2017 },
    { id: 'p2', name: 'Skyline Roofing', trade: 'Roofing', rating: 4.8, jobs: 180, city: 'Brooklyn, NY', since: 2019 },
    { id: 'p3', name: 'BrightSpark Electric', trade: 'Electrical', rating: 5.0, jobs: 260, city: 'New York, NY', since: 2016 },
    { id: 'p4', name: 'PureFlow Plumbing', trade: 'Plumbing', rating: 4.9, jobs: 210, city: 'Bronx, NY', since: 2018 },
  ]

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
          <h2 className="text-lg font-semibold text-slate-900">Featured pros</h2>
        </div>
        <Link href="/find-pro?urgent=1" className="text-sm text-emerald-700 hover:text-emerald-800">Browse all →</Link>
      </div>

      <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pros.map((p) => (
          <TiltCard key={p.id}>
            <Link href={`/pro/${p.id}`} className="group flex h-full min-h-[140px] flex-col justify-between rounded-2xl border bg-white p-3 transition hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                  {p.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{p.name}</div>
                  <div className="text-[11px] text-slate-600">{p.trade} • {p.city}</div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <Stars rating={p.rating} />
                <div className="text-xs text-slate-500">{p.jobs.toLocaleString()} jobs</div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  <span className="mr-1 inline-block align-[-2px]">✔</span> Verified
                </span>
                {p.rating >= 4.9 && (
                  <span className="rounded-md bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700">⭐ Top rated</span>
                )}
                {p.jobs >= 200 && (
                  <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">⚡ Fast reply</span>
                )}
              </div>
            </Link>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------
   TRUST & SAFETY — equal parts (4 vs 4)
-------------------------------------------- */
function TrustAndSafetyEqual() {
  const rushrPros = [
    'Estimate before arrival',
    'Time-verified start & end',
    'Itemized parts & materials',
    'Dispatcher oversight for teams',
  ]
  const others = [
    'Leads resold to many',
    'Outdated provider lists',
    'Phone spam before details',
    'Opaque add-on fees',
  ]

  return (
    <section className="relative border-y bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Trust & safety</h2>
          <p className="mt-1 text-gray-600">Built for emergencies. Transparent by default.</p>
        </div>

        <div className="mx-auto mt-6 grid gap-4 md:grid-cols-2">
          <Card className="border-emerald-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className={`${homeText} h-5 w-5`} />
                Rushr
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {rushrPros.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>{t}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-slate-600" />
                Others
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {others.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-rose-600" />
                  <span>{t}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Learn how we vet pros and handle disputes.{' '}
          <Link href="/about#safety" className="font-semibold text-emerald-700 hover:text-emerald-800">
            See details →
          </Link>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   TESTIMONIALS — filled 5 stars
-------------------------------------------- */
function TestimonialsHome() {
  const quotes = [
    { q: 'Posted at lunch. Two estimates by dinner. Fixed next morning.', n: 'Dani K.', r: 'Queens' },
    { q: 'Clear hourly rate and a quick video call made it easy.', n: 'Mark P.', r: 'Brooklyn' },
    { q: 'Emergency leak fixed same day. Time logs kept it fair.', n: 'Alisha T.', r: 'Manhattan' },
  ]
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-center text-2xl font-semibold text-slate-900">Homeowners who got it done</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {quotes.map((t, i) => (
            <Card key={i} className="border-emerald-200/60 bg-white/90">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center gap-1 text-emerald-600">
                  <StarSolid /> <StarSolid /> <StarSolid /> <StarSolid /> <StarSolid />
                </div>
                <p className="text-slate-700">{t.q}</p>
                <div className="mt-3 text-sm text-slate-600">— {t.n}, {t.r}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   FINAL CTA
-------------------------------------------- */
function FinalCTAHome() {
  return (
    <section className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Need help right now?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
          Book an on-call pro with a clear hourly rate and time-verified billing.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/post-job?urgent=1" className="inline-flex">
            <Button size="lg" className={`${homeBg} text-white ${homeRing} hover:opacity-95`}>Book now</Button>
          </Link>
          <Link href="/how-it-works" className="inline-flex">
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--home)] text-[var(--home)] hover:bg-[color:rgb(16_185_129_/_0.08)] focus-visible:ring-[var(--home)]"
            >
              How it works
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   MOBILE STICKY CTA
-------------------------------------------- */
function MobileStickyCTAHome() {
  return (
    <div className="sticky bottom-3 z-20 mx-auto w-full max-w-7xl px-4 md:hidden">
      <div className="rounded-2xl border border-emerald-200 bg-white/90 p-3 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="text-left">
            <div className={`text-xs font-semibold ${homeText}`}>Rushr</div>
            <div className="text-sm text-gray-700">Book a verified pro now</div>
          </div>
          <Link href="/post-job?urgent=1" className="inline-flex">
            <Button className={`${homeBg} text-white ${homeRing} hover:opacity-95`}>Start</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------
   Small UI helpers
-------------------------------------------- */
function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => <StarSolid key={'f'+i} />)}
      {half && <StarHalfSolid />}
      {Array.from({ length: empty }).map((_, i) => <StarEmpty key={'e'+i} />)}
    </div>
  )
}
function StarSolid() {
  return (
    <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 15.27l5.18 3.05-1.4-5.98L18 7.24l-6.1-.52L10 1 8.1 6.72 2 7.24l4.22 5.1-1.4 5.98L10 15.27z" />
    </svg>
  )
}
function StarHalfSolid() {
  return (
    <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20">
      <defs>
        <linearGradient id="g2" x1="0" x2="1">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d="M10 15.27l5.18 3.05-1.4-5.98L18 7.24l-6.1-.52L10 1 8.1 6.72 2 7.24l4.22 5.1-1.4 5.98L10 15.27z" fill="url(#g2)" stroke="currentColor" />
    </svg>
  )
}
function StarEmpty() {
  return (
    <svg className="h-4 w-4 text-emerald-300" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <path d="M10 15.27l5.18 3.05-1.4-5.98L18 7.24l-6.1-.52L10 1 8.1 6.72 2 7.24l4.22 5.1-1.4 5.98L10 15.27z" />
    </svg>
  )
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rx = useTransform(y, [-50, 50], [8, -8])
  const ry = useTransform(x, [-50, 50], [-8, 8])
  const rxs = useSpring(rx, { stiffness: 120, damping: 12 })
  const rys = useSpring(ry, { stiffness: 120, damping: 12 })

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = e.clientX - rect.left - rect.width / 2
    const py = e.clientY - rect.top - rect.height / 2
    x.set(px / 6)
    y.set(py / 6)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{ rotateX: rxs, rotateY: rys, transformStyle: 'preserve-3d' }}
      className="will-change-transform"
    >
      <div style={{ transform: 'translateZ(0)' }}>{children}</div>
    </motion.div>
  )
}

function GradientMesh() {
  return (
    <div aria-hidden className="fixed inset-0 -z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40" />
      <svg className="absolute inset-x-0 top-[-180px] -z-10 h-[560px] w-full opacity-50" viewBox="0 0 1155 678" preserveAspectRatio="none">
        <path
          fill="url(#mesh)"
          fillOpacity=".8"
          d="M317.219 518.975L203.852 678 0 451.106l317.219 67.869 204.172-247.652c0 0 73.631-24.85 140.579 20.38 66.948 45.23 161.139 167.81 161.139 167.81l-507.89 59.462z"
        />
        <defs>
          <linearGradient id="mesh" x1="0" x2="1" y1="1" y2="0">
            <stop stopColor="#dcfce7" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />
    </div>
  )
}

function GradientBorder({ emerald }: { emerald?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100"
      style={{
        boxShadow: emerald
          ? '0 0 0 1px rgba(5,150,105,0.25), 0 8px 28px -12px rgba(5,150,105,0.35)'
          : '0 0 0 1px rgba(59,130,246,0.25), 0 8px 28px -12px rgba(59,130,246,0.35)',
      }}
    />
  )
}

function LocalKeyframes() {
  return (
    <style>{`
      :root { --home: ${HOME_GREEN}; }
      @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
      .animate-shimmer { animation: shimmer 1.6s linear infinite }
    `}</style>
  )
}
