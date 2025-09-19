// app/signals/page.tsx
'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '../../lib/state'
import SignalsCard from '../../components/SignalsCard'

export default function SignalsPage(){
  const { state, openAuth, addToast } = useApp()
  const router = useRouter()
  const isSignedIn = state.user.signedIn
  const hasSignals = !!(state as any)?.user?.signalsActive // safe if absent

  const preview = useMemo(()=> state.signals.slice(0,6), [state.signals])
  const totalSignals = state.signals.length
  const perDay = Math.max(1, Math.round(totalSignals / 30))

  // inline email capture (opens auth modal)
  const [email, setEmail] = useState('')
  const capture = ()=> {
    openAuth()
    if (email.trim()) addToast?.('We’ll use this email when you continue sign-in.')
  }

  const PrimaryCTA = () =>
    !isSignedIn
      ? <button onClick={openAuth} className="btn-primary">Start free alerts</button>
      : <Link href="/signals/dashboard" className="btn-primary">Open Signals dashboard</Link>

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-900/20 dark:via-slate-900 dark:to-emerald-900/10">
        {/* rotated, cut-off cloud/logo mark */}
        <img
          src="/housecall-icon.png"
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute -top-16 -right-20 w-[640px] rotate-[-16deg] opacity-[0.07] dark:opacity-[0.09]"
        />
        <div className="container-max py-14 md:py-18 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium shadow-soft ring-1 ring-emerald-200 backdrop-blur dark:bg-white/10 dark:text-emerald-100 dark:ring-emerald-700">
              ⚡ New leads, automatically • Be first—before they even ask
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight text-ink dark:text-white">
              Signals: be first to the lead—<span className="text-primary">before they even reach out</span>.
            </h1>

            <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl">
              We monitor inspections, permits, licenses, and violations across your coverage. The instant
              something matches your rules, you’re notified—so you quote first and win more work.
            </p>

            {/* 2 buttons only */}
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryCTA />
              <Link href="/pricing#signals" className="btn btn-outline">Pricing</Link>
            </div>

            {/* quick capture (unchanged) */}
            {!isSignedIn && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <input
                  className="input w-64"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                />
                <button className="btn" onClick={capture}>Get started</button>
                <span className="text-xs text-slate-500">No spam. Cancel anytime.</span>
              </div>
            )}

            {/* tightened hero stats */}
            <div className="mt-5 grid grid-cols-3 max-w-lg gap-3 text-center">
              <Stat label="Signals this month" value={formatNum(totalSignals)} />
              <Stat label="Avg. per day" value={formatNum(perDay)} />
              <Stat label="Setup time" value="2 min" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (kept) */}
      <section className="container-max">
        <div className="text-center mb-8">
          <div className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-soft ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            How Signals works
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Step n={1} t="Pick coverage" d="Choose jurisdictions, categories, and keywords." />
          <Step n={2} t="Build rules" d="Event type, status, zip lists, scope terms, and more." />
          <Step n={3} t="Get alerts" d="Email, SMS, or in-app. Instant or daily digest." />
          <Step n={4} t="Win the job" d="Contact first with context & confidence." />
        </div>
      </section>

      {/* ====================== RULE BUILDER (dropdown demo) ====================== */}
      <section className="container-max">
        <div className="card p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="text-ink dark:text-white font-semibold">Point-and-click rule builder</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Pick real options from dropdowns to assemble a rule. This is a demo; saving requires a Signals plan.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <DropdownRuleBuilder
              isSignedIn={isSignedIn}
              hasSignals={hasSignals}
              openAuth={openAuth}
              addToast={(msg)=>addToast?.(msg)}
              routerPush={(href)=>router.push(href)}
            />
          </div>
        </div>
      </section>

      {/* LIVE FEED (updated) */}
<section className="container-max">
  <div className="flex items-end justify-between mb-3">
    <h3 className="text-xl font-semibold text-ink dark:text-white">Live feed preview</h3>
    <div className="flex gap-2">
      <Link href="/signals/dashboard" className="btn btn-outline">Open dashboard</Link>
      <Link href="/pro/signals/rules/new" className="btn btn-outline">Create a rule</Link>
    </div>
  </div>

  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
    <div className="grid md:grid-cols-2 gap-4">
      {preview.map((s:any) => (
        <SignalPreviewCard
          key={s.id}
          s={s}
          onView={()=>{
            if(!isSignedIn){ openAuth(); return }
            const target = s?.id ? `/signals/${s.id}` : '/signals/dashboard'
            router.push(target)
          }}
          addToast={msg=>addToast?.(msg)}
        />
      ))}
    </div>

    {preview.length===0 && (
      <div className="p-6 text-center text-slate-600 mt-2">
        No events yet in the demo dataset. Create a rule to start seeing alerts.
      </div>
    )}
  </div>
</section>

      {/* WHY PROS LOVE SIGNALS + centered ROI */}
      <section className="container-max grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-ink dark:text-white mb-3">Why pros love Signals</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Feature icon="🛰️" t="Real-time monitoring" d="We watch inspections, permits, licenses and violations across your selected jurisdictions." />
            <Feature icon="🎯" t="Precision rules" d="Target by type, status, zip lists, and scope keywords. No more irrelevant leads." />
            <Feature icon="📣" t="Multi-channel alerts" d="Email, SMS, in-app. Instant or digest." />
            <Feature icon="🧠" t="AI scope hints" d="We summarize the event and suggest an outreach opener with likely scope." />
            <Feature icon="📤" t="Export & share" d="CSV export and clipboard-ready outreach lists." />
            <Feature icon="🔒" t="Private to you" d="Signals are your edge—not a public marketplace blast." />
          </div>
        </div>

        {/* Centered estimator */}
        <aside className="lg:col-span-1 lg:self-center">
          <div className="card p-5">
            <div className="font-semibold text-ink dark:text-white text-center">Monthly impact estimator</div>
            <RoiCalc />
          </div>
        </aside>
      </section>

      {/* COMPARISON */}
      <section className="container-max">
        <h3 className="text-xl font-semibold text-ink dark:text-white mb-3">Signals vs. traditional lead marketplaces</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="grid md:grid-cols-2">
            <div className="p-5 bg-slate-50 dark:bg-slate-900/60">
              <div className="badge bg-slate-100 text-slate-700 mb-2">Traditional</div>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>✖ Compete after a homeowner posts</li>
                <li>✖ Leads often sold to multiple pros</li>
                <li>✖ Broad categories, limited filters</li>
                <li>✖ Minutes–hours delay</li>
                <li>✖ Pay-per-lead or high fees</li>
              </ul>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900">
              <div className="badge bg-emerald-50 text-emerald-700 mb-2">Signals</div>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>✔ Reach out at the source (permit/inspection)</li>
                <li>✔ Alerts are yours; outreach is direct</li>
                <li>✔ Pinpoint by status, scope, zips, keywords</li>
                <li>✔ Instant notifications</li>
                <li>✔ Simple monthly add-on</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="container-max">
        <div className="card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
          <div className="flex-1">
            <div className="text-xl font-semibold text-ink dark:text-white">Start free • simple pricing later</div>
            <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <li>• Pros use Rushr free</li>
              <li>• Signals is a low monthly add-on based on coverage</li>
              <li>• Cancel anytime</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <PrimaryCTA />
            <Link href="/pricing#signals" className="btn btn-outline">View pricing</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-max">
        <div className="rounded-2xl bg-emerald-600 text-white p-6 md:p-8 grid gap-6 md:grid-cols-[1fr,auto] items-center shadow-soft">
          <div>
            <div className="text-2xl font-semibold">Own the first call in your market.</div>
            <p className="text-emerald-50/90 mt-1">Turn inspections and permits into booked jobs with zero manual work.</p>
            <div className="mt-3 text-[11px] uppercase tracking-wide text-emerald-50/80">Fast setup • Private alerts • Cancel anytime</div>
          </div>
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {!isSignedIn
              ? <button onClick={openAuth} className="btn bg-white text-emerald-700 hover:bg-emerald-50">Start free alerts</button>
              : <Link href="/signals/dashboard" className="btn bg-white text-emerald-700 hover:bg-emerald-50">Open dashboard</Link>}
            <Link href="/pro/signals/rules/new" className="btn btn-outline border-white/60 text-white hover:bg-white/10">Create a rule</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ---------- helpers & small components ---------- */

function formatNum(n:number){
  if (n >= 1000) return `${(n/1000).toFixed(1).replace(/\.0$/,'')}k`
  return String(n)
}
function Stat({label, value}:{label:string; value:number|string}){
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 py-4">
      <div className="text-2xl font-semibold text-ink dark:text-white leading-none">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 mt-2">{label}</div>
    </div>
  )
}
function Step({n,t,d}:{n:number;t:string;d:string}){
  return (
    <div className="card p-5 text-center">
      <div className="mx-auto mb-3 h-10 w-10 grid place-items-center rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">{n}</div>
      <div className="font-semibold text-ink dark:text-white">{t}</div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{d}</p>
    </div>
  )
}
function Feature({icon,t,d}:{icon:string;t:string;d:string}){
  return (
    <div className="card p-5">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 font-semibold text-ink dark:text-white">{t}</div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{d}</p>
    </div>
  )
}
function RoiCalc(){
  const [leads, setLeads] = useState(30)
  const [closeRate, setCloseRate] = useState(20) // %
  const [avgJob, setAvgJob] = useState(1800) // $
  const [margin, setMargin] = useState(35) // %
  const monthlyRevenue = leads * (closeRate/100) * avgJob
  const monthlyProfit = monthlyRevenue * (margin/100)

  return (
    <div className="space-y-3">
      <Row label={`Signals/mo: ${leads}`}><input aria-label="Signals per month" type="range" min={5} max={100} value={leads} onChange={e=>setLeads(+e.target.value)} className="w-full" /></Row>
      <Row label={`Close rate: ${closeRate}%`}><input aria-label="Close rate" type="range" min={5} max={60} step={1} value={closeRate} onChange={e=>setCloseRate(+e.target.value)} className="w-full" /></Row>
      <Row label={`Avg job: $${avgJob}`}><input aria-label="Average job value" type="range" min={300} max={8000} step={100} value={avgJob} onChange={e=>setAvgJob(+e.target.value)} className="w-full" /></Row>
      <Row label={`Margin: ${margin}%`}><input aria-label="Margin" type="range" min={10} max={70} step={1} value={margin} onChange={e=>setMargin(+e.target.value)} className="w-full" /></Row>
      <div className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 border border-emerald-200">
        <div><span className="font-semibold">Est. monthly revenue:</span> ${Math.round(monthlyRevenue).toLocaleString()}</div>
        <div><span className="font-semibold">Est. monthly profit:</span> ${Math.round(monthlyProfit).toLocaleString()}</div>
      </div>
    </div>
  )
}
function Row({label, children}:{label:string; children:React.ReactNode}){
  return (
    <div>
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      {children}
    </div>
  )
}
/* ---------- Live feed card with "View" + Quick Bid ---------- */
function SignalPreviewCard({
  s, onView, addToast
}:{ s:any; onView:()=>void; addToast:(m:string)=>void }){
  const [open, setOpen] = useState(false)

  const title = s?.title || s?.summary || friendlyType(s)
  const subtitle = [
    s?.status,
    s?.type && s?.status ? '•' : '',
    s?.type,
  ].filter(Boolean).join(' ')
  const metaLeft = [
    s?.jurisdiction || s?.city || s?.county,
    s?.zip || s?.postal,
  ].filter(Boolean).join(' • ')
  const when = formatWhen(s?.date || s?.timestamp)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-ink dark:text-white">{title}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
        <span className="text-[11px] text-slate-500">{when}</span>
      </div>

      {s?.details && (
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
          {s.details}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
        {metaLeft && <span className="badge bg-slate-50 dark:bg-slate-800/60">{metaLeft}</span>}
        {s?.category && <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">{s.category}</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn" onClick={onView}>View</button>
        <button className="btn btn-outline" onClick={()=>setOpen(v=>!v)}>
          {open ? 'Hide quick bid' : 'Quick bid'}
        </button>
      </div>

      {open && (
        <div className="mt-3">
          <QuickBidComposer
            signal={s}
            onCopied={()=>{
              addToast?.('Copied quick bid to clipboard.')
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ---------- Quick bid composer (tone presets + copy) ---------- */
function QuickBidComposer({
  signal, onCopied
}:{ signal:any; onCopied:()=>void }){
  const [tone, setTone] = useState<'Short'|'Standard'|'Detailed'>('Standard')
  const [when, setWhen] = useState('tomorrow 9–11am')
  const [price, setPrice] = useState('ballpark $450–$650')

  const text = buildQuickBid(signal, { tone, when, price })

  const copy = async ()=>{
    try{
      await navigator.clipboard.writeText(text)
      onCopied()
    }catch{
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      onCopied()
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
      <div className="grid sm:grid-cols-3 gap-2">
        <label className="text-xs block">
          <span className="block mb-1 text-slate-600">Tone</span>
          <select
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
            value={tone}
            onChange={e=>setTone(e.target.value as any)}
          >
            <option>Short</option>
            <option>Standard</option>
            <option>Detailed</option>
          </select>
        </label>
        <label className="text-xs block">
          <span className="block mb-1 text-slate-600">Earliest availability</span>
          <input
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
            value={when}
            onChange={e=>setWhen(e.target.value)}
            placeholder="e.g., today 2–4pm"
          />
        </label>
        <label className="text-xs block">
          <span className="block mb-1 text-slate-600">Price hint</span>
          <input
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
            value={price}
            onChange={e=>setPrice(e.target.value)}
            placeholder="optional"
          />
        </label>
      </div>

      <textarea
        className="mt-3 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm h-28"
        value={text}
        onChange={()=>{}}
        readOnly
      />
      <div className="mt-2 flex gap-2">
        <button className="btn" onClick={copy}>Copy quick bid</button>
        <span className="text-xs text-slate-500 self-center">Personalize name/company after pasting.</span>
      </div>
    </div>
  )
}

/* ---------- helpers for bid text ---------- */
function friendlyType(s:any){
  return s?.type || s?.category || 'Signal'
}
function formatWhen(d:any){
  try{
    const dt = new Date(d)
    if (!isNaN(dt.getTime())) return dt.toLocaleDateString()
  }catch{}
  return 'Just now'
}
function buildQuickBid(s:any, opts:{ tone:'Short'|'Standard'|'Detailed'; when:string; price:string }){
  const type = friendlyType(s)
  const loc = [s?.city || s?.jurisdiction, s?.zip].filter(Boolean).join(', ')
  const ref = s?.id ? `#${String(s.id).slice(-6)}` : ''
  const base =
    `Hi there — saw the ${s?.status ? `${s.status.toLowerCase()} ` : ''}${type} ${loc ? `in ${loc}` : ''} ${ref ? `(${ref})` : ''}.\n`
    + `I'm a licensed/insured contractor and can stop by ${opts.when}. ${opts.price ? `My ${opts.price}. ` : ''}`

  const scope = s?.scope || s?.summary || s?.details
  const scopeLine = scope ? `Based on the note: “${String(scope).slice(0,140)}${String(scope).length>140?'…':''}”\n` : ''

  const close = `If that works, I can confirm a window and send a written estimate.\n— Your Name, Company • (555) 555-5555`

  if (opts.tone === 'Short')
    return `${base}Can I take a quick look ${opts.when.split(' ')[0]}?\n${close}`

  if (opts.tone === 'Detailed')
    return `${base}${scopeLine}Typical approach: diagnose on arrival, confirm scope, and handle parts same-day when possible.\n${close}`

  // Standard
  return `${base}${scopeLine}${close}`
}

/* ---------- DropdownRuleBuilder (demo-only) ---------- */
function DropdownRuleBuilder({
  isSignedIn,
  hasSignals,
  openAuth,
  addToast,
  routerPush,
}:{
  isSignedIn: boolean
  hasSignals: boolean
  openAuth: () => void
  addToast: (msg:string)=>void
  routerPush: (href:string)=>void
}){
  type Rule = { type:string; jurisdiction:string; scope:string; zips:string; delivery:string; window:string }

  // EDIT THESE to change dropdown choices
  const RULE_OPTIONS: Record<keyof Rule, string[]> = {
    type: [
      'Inspection: Failed',
      'Inspection: Passed',
      'Permit: Issued',
      'Permit: Applied',
      'Violation: New',
    ],
    jurisdiction: [
      'Brooklyn, NY',
      'Queens, NY',
      'Manhattan, NY',
      'Nassau County, NY',
      'Jersey City, NJ',
    ],
    scope: [
      'Panel upgrade',
      'Condenser',
      'Roof leak',
      'Service mast',
      'Kitchen remodel',
    ],
    zips: [
      'BK Core (11205, 11206, 11215, 11217)',
      'Queens NE (11354, 11355, 11358)',
      'Jersey City (07302, 07310)',
    ],
    delivery: [
      'Instant SMS + Email',
      'Email only',
      'Daily digest',
    ],
    window: [
      'Anytime',
      'Business hours only',
      'Weekends only',
    ],
  }

  const [rule, setRule] = useState<Rule>({
    type: '', jurisdiction:'', scope:'', zips:'', delivery:'', window:''
  })

  const update = (k: keyof Rule) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setRule(r => ({ ...r, [k]: e.target.value }))

  const reset = () => setRule({ type:'', jurisdiction:'', scope:'', zips:'', delivery:'', window:'' })

  const selectedEntries = (Object.entries(rule) as [keyof Rule,string][])
    .filter(([,v]) => v)

  const canBuild = selectedEntries.length > 0

  const build = ()=>{
    if (!canBuild) { addToast?.('Pick at least one option to build a rule.'); return }
    if (!isSignedIn) { openAuth(); return }
    if (!hasSignals) { addToast?.('Signals subscription required to save rules.'); routerPush('/pricing#signals'); return }
    routerPush('/pro/signals/rules/new')
  }

  return (
    <div className="grid lg:grid-cols-[1fr,1fr] gap-4">
      {/* Left: dropdowns */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="grid sm:grid-cols-2 gap-3">
          <SelectField label="Type" value={rule.type} onChange={update('type')} options={RULE_OPTIONS.type} />
          <SelectField label="Jurisdiction" value={rule.jurisdiction} onChange={update('jurisdiction')} options={RULE_OPTIONS.jurisdiction} />
          <SelectField label="Scope keywords" value={rule.scope} onChange={update('scope')} options={RULE_OPTIONS.scope} />
          <SelectField label="Zip list" value={rule.zips} onChange={update('zips')} options={RULE_OPTIONS.zips} />
          <SelectField label="Delivery" value={rule.delivery} onChange={update('delivery')} options={RULE_OPTIONS.delivery} />
          <SelectField label="Time window" value={rule.window} onChange={update('window')} options={RULE_OPTIONS.window} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary disabled:opacity-50" disabled={!canBuild} onClick={build}>
            Build this rule
          </button>
          <button className="btn btn-outline" onClick={reset}>Reset</button>
          <Link href="/pro/signals/rules/new" className="btn btn-ghost">Advanced builder</Link>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">Demo only—no data is saved here.</div>
      </div>

      {/* Right: preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="text-xs uppercase tracking-wide text-slate-500">Rule preview</div>
        {selectedEntries.length === 0 ? (
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Choose options on the left to preview.</div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedEntries.map(([k,v])=>(
              <span key={String(k)} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800">
                <strong className="font-semibold capitalize">{String(k)}</strong>: <em className="not-italic opacity-90">{v}</em>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* tiny select field atom */
function SelectField({
  label, value, onChange, options
}:{ label:string; value:string; onChange:(e:React.ChangeEvent<HTMLSelectElement>)=>void; options:string[] }){
  return (
    <label className="text-sm block">
      <span className="block mb-1">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
      >
        <option value="">Select…</option>
        {options.map(o=> <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
