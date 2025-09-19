// app/emergency/page.tsx
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  ShieldCheck,
  Droplets,
  PlugZap,
  ThermometerSnowflake,
  KeyRound,
  Home,
  PanelsTopLeft,
  TrendingUp,
  Timer,
  BadgeCheck,
  FileText,
  Phone,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Emergency Help | Rushr",
  description: "How Rushr emergency works: what to expect and what you'll need. Post once and verified pros respond fast.",
}

// ---------- Theme helpers ----------
type Theme = "red" | "green"
const themeVars = (t: Theme) =>
  t === "green"
    ? {
        primary: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400",
        primaryText: "text-emerald-700",
        tint: "bg-emerald-50",
        border: "border-emerald-200",
        gradient: "from-emerald-600 to-emerald-500",
        solid: "bg-emerald-600",
        stroke: "text-emerald-600",
      }
    : {
        primary: "bg-red-600 hover:bg-red-700 focus:ring-red-400",
        primaryText: "text-red-700",
        tint: "bg-red-50",
        border: "border-red-200",
        gradient: "from-red-600 to-red-500",
        solid: "bg-red-600",
        stroke: "text-red-600",
      }

const CATS = [
  { key: "Plumbing", icon: Droplets },
  { key: "Electrical", icon: PlugZap },
  { key: "HVAC", icon: ThermometerSnowflake },
  { key: "Locksmith", icon: KeyRound },
  { key: "Roofing", icon: Home },
  { key: "Glass & Doors", icon: PanelsTopLeft },
] as const

// ---------- Tiny sparkline path generator (no libs) ----------
function spark(values: number[], w = 120, h = 32, p = 3) {
  if (!values || values.length < 2) return ""
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = (w - p * 2) / (values.length - 1)
  return values
    .map((v, i) => {
      const x = p + i * stepX
      const y = h - p - ((v - min) / range) * (h - p * 2)
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
}

// ---------- Page ----------
export default async function EmergencyPage({ searchParams }: { searchParams?: { theme?: string; zip?: string } }) {
  const theme: Theme = searchParams?.theme === "green" ? "green" : "red"
  const c = themeVars(theme)
  const zip = searchParams?.zip ?? "10012"

  // Fetch stats (with safe fallbacks)
  let onCallTotal: number | undefined
  let onCallByCat: Record<string, number> | undefined
  let stats: { avgEtaMin: number; jobsWeek: number; acceptanceRate: number; jobsSpark: number[]; etaSpark: number[] } | undefined
  let etaNow: number | undefined
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? ""
    const [oncallRes, statsRes, etaRes] = await Promise.all([
      fetch(`${base}/api/oncall`, { cache: "no-store" }),
      fetch(`${base}/api/emergency-stats`, { cache: "no-store" }),
      fetch(`${base}/api/eta?zip=${encodeURIComponent(zip)}`, { cache: "no-store" }),
    ])
    const oncall = await oncallRes.json().catch(() => ({}))
    const s = await statsRes.json().catch(() => ({}))
    const eta = await etaRes.json().catch(() => ({}))
    onCallTotal = oncall?.total
    onCallByCat = oncall?.byCategory
    etaNow = eta?.etaMin
    if (s && (s.avgEtaMin || s.jobsWeek)) {
      stats = {
        avgEtaMin: Number(s.avgEtaMin ?? 22),
        jobsWeek: Number(s.jobsWeek ?? 420),
        acceptanceRate: Number(s.acceptanceRate ?? 0.93),
        jobsSpark: Array.isArray(s.jobsSpark) ? s.jobsSpark : [44, 49, 46, 52, 56, 54, 59],
        etaSpark: Array.isArray(s.etaSpark) ? s.etaSpark : [31, 29, 27, 26, 25, 24, 23],
      }
    }
  } catch {}

  const S = stats ?? {
    avgEtaMin: 22,
    jobsWeek: 428,
    acceptanceRate: 0.93,
    jobsSpark: [44, 49, 46, 52, 56, 54, 59],
    etaSpark: [31, 29, 27, 26, 25, 24, 23],
  }

  const jobsTrend = (() => {
    const v = S.jobsSpark
    if (!v || v.length < 2) return 0
    const last = v[v.length - 1]
    const prev = v[v.length - 2] || last
    return ((last - prev) / Math.max(1, prev)) * 100
  })()

  return (
    <main className="relative">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-white" />
        <div className={`absolute left-1/2 top-[-18rem] -z-10 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full ${c.tint} blur-3xl`} />
      </div>

      {/* ===== HERO (calm, single CTA) ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-12">
        <div className="mx-auto max-w-4xl text-center">
          <span className={`inline-flex items-center gap-2 rounded-full ${c.tint} px-3 py-1 text-xs font-semibold ${c.primaryText} ring-1 ring-inset ${c.border}`}>
            <ShieldCheck className="h-4 w-4" aria-hidden /> Emergency Dispatch
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Emergency help, fast</h1>
          <p className="mt-3 text-base text-gray-600 sm:text-lg">Post once. After posting, you’ll see all open, participating, licensed contractors nearby and choose who to confirm.</p>
          <div className="mt-6">
            <Link href="/post-job/emergency" className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow ${c.primary}`}>
              Post Emergency <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Calm KPI chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[12px] text-gray-700">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Avg ETA today: <strong className="ml-1 font-semibold text-gray-900">{etaNow ?? S.avgEtaMin}m</strong></span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">On‑call now: <strong className="ml-1 font-semibold text-gray-900">{typeof onCallTotal === "number" ? onCallTotal : "—"}</strong></span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Acceptance: <strong className="ml-1 font-semibold text-gray-900">{Math.round(S.acceptanceRate * 100)}%</strong></span>
          </div>
        </div>
      </section>

      {/* ===== KPI strip (visual context) ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-2 pt-2">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between"><p className="text-[11px] uppercase tracking-wide text-gray-500">Avg arrival today</p><Timer className="h-3.5 w-3.5 text-gray-400" /></div>
            <p className="mt-1 text-xl font-semibold text-gray-900">{S.avgEtaMin}m</p>
            <div className={`${c.stroke} mt-2`}>
              <svg width="120" height="32" viewBox="0 0 120 32" aria-hidden>
                <path d={spark(S.etaSpark)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between"><p className="text-[11px] uppercase tracking-wide text-gray-500">Resolved this week</p><TrendingUp className="h-3.5 w-3.5 text-gray-400" /></div>
            <p className="mt-1 text-xl font-semibold text-gray-900">{S.jobsWeek}</p>
            <div className={`${c.stroke} mt-2`}>
              <svg width="120" height="32" viewBox="0 0 120 32" aria-hidden>
                <path d={spark(S.jobsSpark)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">{jobsTrend >= 0 ? "+" : ""}{jobsTrend.toFixed(0)}% vs yesterday</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">On‑call now</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{typeof onCallTotal === "number" ? onCallTotal : "—"}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[11px]">
              <div className="rounded-xl bg-gray-50 py-1 text-gray-700">ETA ~{etaNow ?? S.avgEtaMin}m</div>
              <div className="rounded-xl bg-gray-50 py-1 text-gray-700">Accept {Math.round(S.acceptanceRate * 100)}%</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Pick a category (you liked this) ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pick a category</h2>
            <Link href="/post-job/emergency" className="text-sm font-medium text-gray-700 hover:text-gray-900">See all →</Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {CATS.map(({ key, icon: Icon }) => (
              <Link key={key} href={`/post-job/emergency?cat=${encodeURIComponent(key)}`} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-12 w-12 place-items-center rounded-xl ${c.tint} ${c.border}`}>
                      <Icon className={`h-6 w-6 ${c.primaryText}`} aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{key}</p>
                      <p className="text-[11px] text-gray-500">On‑call {onCallByCat?.[key] ?? "—"}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== What you'll need ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-2">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { t: "Proof of access", d: "Lease/ID or property manager on‑site", icon: BadgeCheck },
            { t: "A quick photo (optional)", d: "Helps pros assess and reply faster", icon: FileText },
            { t: "Phone on hand", d: "We mask numbers and record call summary", icon: Phone },
          ].map(({ t, d, icon: Icon }) => (
            <div key={t} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${c.tint} ${c.border}`}>
                <Icon className={`h-5 w-5 ${c.primaryText}`} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t}</p>
                <p className="mt-0.5 text-xs text-gray-600">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-2">
        <ol className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-4">
          {[
            { t: "Post once", d: "ZIP + category + 1 line" },
            { t: "See who’s open", d: "Licensed, participating contractors" },
            { t: "Choose & confirm", d: "ETA, visit minimum, reviews" },
            { t: "Track & pay", d: "Timeline, photos, receipt saved" },
          ].map((s, i) => (
            <li key={s.t} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <span className={`grid h-8 w-8 place-items-center rounded-xl text-sm font-semibold text-white ${c.solid}`}>{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.t}</p>
                <p className="text-xs text-gray-600">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== Trust & safety ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-0">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { t: "Verified pros", d: "Licenses checked where available", icon: ShieldCheck },
            { t: "Evidence saved", d: "Messages, photos & receipts kept", icon: FileText },
            { t: "Masked calling", d: "Keep your number private", icon: Phone },
          ].map(({ t, d, icon: Icon }) => (
            <div key={t} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${c.tint} ${c.border}`}>
                <Icon className={`h-5 w-5 ${c.primaryText}`} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t}</p>
                <p className="mt-0.5 text-xs text-gray-600">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-0">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">FAQ</h2>
          <div className="space-y-3">
            {[
              { q: "When do I see available contractors?", a: "Right after you post. We show open, participating, licensed options and you choose who to confirm." },
              { q: "Do I pay before someone arrives?", a: "No. You only authorize when you confirm a pro; any pre‑auth is shown up front." },
              { q: "What if nobody accepts?", a: "We expand the radius and ping more verified pros. You can cancel before confirm." },
              { q: "Is my number shared?", a: "No. All calls route through our phone bridge so your number stays private." },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gray-300 align-middle group-open:bg-gray-900" />{f.q}
                </summary>
                <p className="mt-2 text-sm text-gray-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-0">
        <div className={`mx-auto max-w-3xl rounded-3xl border ${c.border} bg-gradient-to-r ${c.gradient} p-6 text-center shadow-lg`}>
          <h3 className="text-2xl font-semibold text-white">Ready to post?</h3>
          <p className="mt-2 text-white/90">Post once. Then immediately pick from open, participating, licensed contractors.</p>
          <div className="mt-4">
            <Link href="/post-job/emergency" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900">
              Start emergency <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== JSON-LD ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Rushr Emergency',
            serviceType: 'Emergency home repair',
          }),
        }}
      />
    </main>
  )
}
