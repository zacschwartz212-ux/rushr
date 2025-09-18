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
  Home,
  Wrench,
  Lightbulb,
  ShowerHead,
  Ruler,
  Wind,
  Leaf,
  ArrowRight,
  AlarmClock,
  Siren,
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

      <EmergencySpotlight />
      <HeroHome />
      <StatStrip />
      <CategoryShowcaseDense />
      <HowItWorksHome />
      <GeoBanner />
      <ProjectStarter />
      <FeaturedPros />
      <TrustAndSafetySideBySide />
      <TestimonialsHome />
      <FinalCTAHome />
      <MobileStickyCTAHome />

      <LocalKeyframes />
    </div>
  )
}

/* -------------------------------------------
   HERO — spotlight, floating trust badges
-------------------------------------------- */
function HeroHome() {
  const [pos, setPos] = useState<{x:number;y:number}>({x:0,y:0})
  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <section className="relative" onMouseMove={onMove}>
      {/* Spotlight follows cursor */}
      <motion.div
        className="pointer-events-none absolute -z-10 h-72 w-72 rounded-full"
        style={{ left: pos.x - 140, top: pos.y - 140, background: 'radial-gradient(closest-side, rgba(16,185,129,.22), transparent 70%)' }}
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
            Hire the right pro without the hassle
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-4 max-w-xl text-lg text-gray-600"
          >
            Post your job once. Compare quotes, photos, and availability in one place. Message pros directly and book fast.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/post-job" className="inline-flex">
              <Button size="lg" className={`${homeBg} text-white ${homeRing} hover:opacity-95`}>
                Post a job
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/find-pro" className="inline-flex">
              <Button
                size="lg"
                variant="outline"
                className="border-[var(--home)] text-[var(--home)] hover:bg-[color:rgb(16_185_129_/_0.08)] focus-visible:ring-[var(--home)]"
              >
                Browse local pros
              </Button>
            </Link>
          </motion.div>

          {/* Floating trust badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            <FloatingBadge icon={<BadgeCheck className="h-4 w-4" />} text="Verified pros" delay={0} />
            <FloatingBadge icon={<Sparkles className="h-4 w-4" />} text="Same-day replies" delay={0.15} />
            <FloatingBadge icon={<ShieldCheck className="h-4 w-4" />} text="Hire with confidence" delay={0.3} />
          </div>
        </div>

        {/* Right: stacked preview cards */}
        <div className="relative">
          <StackedPreview />
        </div>
      </div>
    </section>
  )
}

function FloatingBadge({ icon, text, delay=0 }: { icon: React.ReactNode; text: string; delay?: number }) {
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
          Direct messages
        </div>
        <div className="space-y-2 text-sm">
          <div className="max-w-[85%] rounded-lg bg-gray-100 px-3 py-2 text-gray-800">
            Hi! Small leak under the sink - can you help?
          </div>
          <div className={`ml-auto max-w-[85%] rounded-lg ${homeBg} px-3 py-2 text-white`}>
            Sure - send a photo & ZIP?
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 top-24 w-[78%] rounded-2xl border border-emerald-200/70 bg-white/90 p-3 shadow-xl backdrop-blur"
        initial={{ y: 60, opacity: 0, rotate: 3 }}
        animate={{ y: 0, opacity: 1, rotate: 3 }}
        transition={{ duration: 0.55, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800">Quote preview</div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">24m avg to first reply</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded bg-emerald-100">
          <div className="h-2 w-2/3 bg-[var(--home)]" />
        </div>
        <div className="mt-2 text-xs text-gray-500">Compare quotes side-by-side in messages</div>
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
          {['Today 6–8p','Tomorrow 8–10a','Sat 10–12p'].map(s => (
            <div key={s} className="rounded-lg border bg-white/70 p-2 text-center">{s}</div>
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
        <StatItem icon={<ShieldCheck className="h-5 w-5" />} label="Verified local pros" end={1200} suffix="+" />
        <StatItem icon={<AlarmClock className="h-5 w-5" />} label="Minutes to post a job" end={1} />
        <StatItem icon={<Quote className="h-5 w-5" />} label="Avg. quotes per job" end={3} />
      </div>
    </section>
  )
}
function StatItem({ icon, label, end, suffix='' }: { icon: React.ReactNode; label: string; end: number; suffix?: string }) {
  const val = useCountUp(end, 900)
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-200/60 bg-white/70 px-4 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 ${homeText}`}>{icon}</div>
      <div>
        <div className="text-xl font-extrabold text-slate-900">{val}{suffix}</div>
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
   POPULAR CATEGORIES — compact grid (7)
-------------------------------------------- */
function CategoryShowcaseDense() {
  const cats = [
    { name: 'Electrical',  icon: <Lightbulb className="h-5 w-5" />, href: '/find-pro?category=Electrical' },
    { name: 'HVAC',        icon: <Wind className="h-5 w-5" />,       href: '/find-pro?category=HVAC' },
    { name: 'Roofing',     icon: <Home className="h-5 w-5" />,       href: '/find-pro?category=Roofing' },
    { name: 'Plumbing',    icon: <ShowerHead className="h-5 w-5" />, href: '/find-pro?category=Plumbing' },
    { name: 'Carpentry',   icon: <Ruler className="h-5 w-5" />,      href: '/find-pro?category=Carpentry' },
    { name: 'Landscaping', icon: <Leaf className="h-5 w-5" />,       href: '/find-pro?category=Landscaping' },
    { name: 'General',     icon: <Wrench className="h-5 w-5" />,     href: '/find-pro?category=General' }, // General last (as requested)
  ]
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Popular categories</h2>
<p className="mt-2 text-gray-600">Service comes to you.</p>
<p className="mt-1 text-gray-600">Be first in the customer's inbox every time. Let AI quote instantly and win jobs before your competitors even open the text.</p>

        <p className="mt-1 text-gray-600">Tap a tile to browse top-rated local pros.</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {cats.map((c, i) => (
          <Link key={i} href={c.href} className="group">
            <Card className="relative h-full overflow-hidden border-emerald-200/60 bg-white/85 p-3 transition hover:shadow-sm">
              <GradientBorder emerald />
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 ${homeText}`}>
                  {c.icon}
                </div>
                <div className="truncate text-sm font-semibold text-slate-900">{c.name}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------
   HOW IT WORKS — aligned & equal heights
-------------------------------------------- */
function HowItWorksHome() {
  const steps = [
    {
      title: 'Post your job',
      desc: 'Describe the work once (photos help!). We’ll notify matching local pros.',
      icon: <MessageSquare className={`h-6 w-6 ${homeText}`} />,
    },
    {
      title: 'Compare quotes',
      desc: 'Get replies fast. Review price, photos, and availability side-by-side.',
      icon: <Quote className={`h-6 w-6 ${homeText}`} />,
    },
    {
      title: 'Book & track',
      desc: 'Pick a time, message in one thread, and leave a review when it’s done.',
      icon: <CalendarDays className={`h-6 w-6 ${homeText}`} />,
    },
  ]
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold text-gray-900">How it works</h2>
        <p className="mt-1 text-gray-600">From post to done. simple and fast.</p>
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
   EMERGENCY BANNER — subtle, above the hero
-------------------------------------------- */
function EmergencySpotlight() {
  return (
    <section className="relative border-b bg-gradient-to-r from-rose-50/60 via-white to-amber-50/60">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(500px_220px_at_90%_-20%,rgba(244,63,94,0.12),transparent),radial-gradient(500px_220px_at_10%_120%,rgba(245,158,11,0.12),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-2 py-2.5 md:flex-row md:items-center">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Siren className="h-4 w-4 text-rose-600" />
            <span className="font-medium text-slate-900">Emergency repair?</span>
            <span className="hidden md:inline text-slate-600">
              On-call pros get priority alerts and the earliest time slots.
            </span>
          </div>

          <Link href="/post-job/emergency" className="inline-flex shrink-0">
            <Button
              size="sm"
              className="h-8 px-3 bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600"
            >
              Post emergency job
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
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
            <span>{city ? `Top-rated pros in ${city}` : 'Top-rated local pros near you'}</span>
          </div>
          <div className="mt-1 text-sm text-slate-600">Compare quotes, photos, and availability—right in the chat.</div>
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
   PROJECT STARTER — title + ZIP + 1–10 urgency slider
   Prefills /post-job via query (title, zip, urgency, urgent)
-------------------------------------------- */
function ProjectStarter() {
  type Urg = 'flexible' | 'soon' | 'emergency'
  const [title, setTitle] = useState('')
  const [zip, setZip] = useState('')
  const [urgency, setUrgency] = useState<Urg>('flexible') // derived from level
  const [urgencyLevel, setUrgencyLevel] = useState<number>(1) // 1–10

  // Map numeric level to your three categories
  useEffect(() => {
    if (urgencyLevel === 10) setUrgency('emergency')
    else if (urgencyLevel >= 4) setUrgency('soon')
    else setUrgency('flexible')
  }, [urgencyLevel])

  const isValid = title.trim().length > 2 && /^\d{5}$/.test(zip)

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Start your project</h2>
        <p className="mt-1 text-gray-600">
          Describe the issue, add your ZIP, choose urgency. We will carry this into the form.
        </p>
      </div>

      <div className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border bg-white/90 p-4 shadow-sm">
        {/* Inputs row */}
        <div className="grid gap-3 md:grid-cols-[1fr_140px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">What do you need done?</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. No-cool AC • leak under sink • roof patch"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">ZIP</label>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
              placeholder="10001"
              inputMode="numeric"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        {/* Urgency slider 1–10 */}
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-slate-600">Urgency (1–10)</label>

          <div className="rounded-md border bg-white/80 p-3">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(Number(e.target.value))}
              className={`w-full cursor-pointer focus:outline-none ${
                urgency === 'emergency' ? 'accent-rose-600' : 'accent-emerald-600'
              }`}
              aria-label="Urgency level"
            />

            {/* Landmark labels */}
            <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span className={urgency === 'flexible' ? 'text-slate-900' : ''}>1</span>
              <span className={urgency === 'soon' ? 'text-slate-900' : ''}>5</span>
              <span className={urgency === 'emergency' ? 'text-rose-700' : ''}>10</span>
            </div>

            {/* Status pill */}
            <div className="mt-1.5 inline-flex items-center gap-2 text-[12px]">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                Level {urgencyLevel}
              </span>
              <span
                className={
                  urgency === 'emergency'
                    ? 'rounded-full bg-rose-50 px-2 py-0.5 text-rose-700'
                    : 'rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700'
                }
              >
                {urgency === 'emergency' ? 'Emergency' : urgency === 'soon' ? 'Soon' : 'Flexible'}
              </span>
              {urgencyLevel === 10 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">
                  <Siren className="h-3.5 w-3.5" />
                  Priority alerts to on-call pros
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={`/post-job${buildQuery({
              title: title.trim(),
              zip: zip.trim(),
              urgency,
              urgent: urgency === 'emergency' ? 1 : 0,
              level: urgencyLevel, // carry raw level if your form reads it
            })}`}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold ${
              isValid ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-200 text-white cursor-not-allowed'
            }`}
          >
            Continue to form
          </Link>

          {/* Appears only at level 10 */}
          {urgencyLevel === 10 && (
            <Link
              href={`/post-job?urgent=1&urgency=emergency${title ? `&title=${encodeURIComponent(title.trim())}` : ''}${
                zip ? `&zip=${encodeURIComponent(zip.trim())}` : ''
              }`}
              className="inline-flex"
            >
              <Button
                className="h-10 px-4 bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600"
                title="Skip ahead to emergency flow"
              >
                Post emergency job
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          )}

          <Link
            href={`/find-pro?q=${encodeURIComponent(title.trim())}`}
            className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Browse pros
          </Link>
        </div>

        <div className="mt-2 text-center text-[11px] text-slate-500">
          You will add photos and pick exact times on the next step.
        </div>
      </div>
    </section>
  )
}

function buildQuery(obj: Record<string, any>) {
  try {
    const q = new URLSearchParams()
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === null) return
      q.set(k, String(v))
    })
    const s = q.toString()
    return s ? `?${s}` : ''
  } catch {
    return ''
  }
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
        <Link href="/find-pro" className="text-sm text-emerald-700 hover:text-emerald-800">Browse all →</Link>
      </div>

      <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pros.map((p) => (
          <TiltCard key={p.id}>
            <Link
              href={`/pro/${p.id}`}
              className="group flex h-full min-h-[140px] flex-col justify-between rounded-2xl border bg-white p-3 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                  {p.name.split(' ').map(s => s[0]).join('').slice(0,2)}
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

              {/* compact badges row */}
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  <span className="mr-1 inline-block align-[-2px]">✔</span> Verified
                </span>
                {p.rating >= 4.9 && (
                  <span className="rounded-md bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700">
                    ⭐ Top Rated
                  </span>
                )}
                {p.jobs >= 200 && (
                  <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
                    ⚡ Fast reply
                  </span>
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
   TRUST & SAFETY — side-by-side ("Competitors")
-------------------------------------------- */
function TrustAndSafetySideBySide() {
  const housecall = [
    'Verified licenses & insurance',
    'Background signals & reviews',
    'In-app quotes & scheduling',
    'Privacy-first messaging',
  ]
  const competitors = [
    'Leads resold to many',
    'Outdated or stale lists',
    'Phone spam before details',
    'Opaque fees & add-ons',
  ]

  return (
    <section className="relative border-y bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Trust & safety</h2>
          <p className="mt-1 text-gray-600">Why homeowners and pros prefer Housecall.</p>
        </div>

        <div className="mx-auto mt-6 grid gap-4 md:grid-cols-2">
          <Card className="border-emerald-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className={`${homeText} h-5 w-5`} />
                Housecall
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {housecall.map((t, idx)=>(
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
                Competitors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {competitors.map((t, idx)=>(
                <div key={idx} className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-rose-600" />
                  <span>{t}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          See how we vet pros and handle reviews. <Link href="/about#safety" className="font-semibold text-emerald-700 hover:text-emerald-800">Learn more →</Link>
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
    { q: 'Posted at lunch, had two quotes by dinner. Hired next morning.', n: 'Dani K.', r: 'Queens' },
    { q: 'The messages + photos made it easy to compare. Loved the scheduling.', n: 'Mark P.', r: 'Brooklyn' },
    { q: 'Emergency leak fixed same day. The “urgent” option works.', n: 'Alisha T.', r: 'Manhattan' },
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
        <h2 className="text-3xl font-bold">Ready to compare quotes?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
          Post once, get fast replies from verified local pros.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/post-job" className="inline-flex">
            <Button size="lg" className={`${homeBg} text-white ${homeRing} hover:opacity-95`}>
              Post a job
            </Button>
          </Link>
          <Link href="/find-pro" className="inline-flex">
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--home)] text-[var(--home)] hover:bg-[color:rgb(16_185_129_/_0.08)] focus-visible:ring-[var(--home)]"
            >
              Browse pros
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
            <div className={`text-xs font-semibold ${homeText}`}>Housecall</div>
            <div className="text-sm text-gray-700">Post a job & compare quotes</div>
          </div>
          <Link href="/post-job" className="inline-flex">
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
