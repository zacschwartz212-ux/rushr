'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  BadgeCheck,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  LineChart,
  MapPin,
  MessageSquare,
  Target,
  Users,
  CalendarDays,
  ChevronRight,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Mail,
  Phone,
  Star,
} from 'lucide-react'

/* ----------------------------- helpers ----------------------------- */
function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-ink dark:text-white">{children}</h2>
      {action}
    </div>
  )
}
function StatCard({
  label, value, hint, icon, tone='blue'
}: { label:string; value:string|number; hint?:string; icon?:React.ReactNode; tone?:'blue'|'emerald'|'amber'|'rose' }) {
  const ring = tone==='blue' ? 'border-blue-200' : tone==='emerald' ? 'border-emerald-200' : tone==='amber' ? 'border-amber-200' : 'border-rose-200'
  const dot  = tone==='blue' ? 'bg-blue-500' : tone==='emerald' ? 'bg-emerald-500' : tone==='amber' ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className={`rounded-2xl border ${ring} bg-white dark:bg-slate-900 p-4 shadow-sm`}>
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        {icon ? <span className="ml-auto text-slate-400">{icon}</span> : null}
      </div>
      <div className="mt-1 text-2xl font-semibold text-ink dark:text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  )
}
function Badge({ children }:{children:React.ReactNode}) {
  return <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{children}</span>
}
function Chip({ children }:{children:React.ReactNode}) {
  return <span className="rounded-md border px-1.5 py-0.5 text-[11px] text-slate-600">{children}</span>
}
function SLA({ mins }:{mins:number}) {
  const ok = mins <= 30
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
      {ok ? 'On-time' : `${mins}m late`}
    </span>
  )
}
function ProgressBar({ value, goal, tone='blue' }:{value:number; goal:number; tone?:'blue'|'emerald'|'amber'}) {
  const pct = Math.min(100, Math.round((value/goal)*100))
  const bar = tone==='blue' ? 'bg-blue-600' : tone==='emerald' ? 'bg-emerald-600' : 'bg-amber-600'
  const bg  = tone==='blue' ? 'bg-blue-100' : tone==='emerald' ? 'bg-emerald-100' : 'bg-amber-100'
  return (
    <div className={`h-2 w-full rounded-full ${bg}`}>
      <div className={`h-2 rounded-full ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
function MiniBars({ data }:{data:number[]}) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((n,i)=>(
        <div key={i} className="w-6 rounded-t bg-emerald-200" style={{ height: `${(n/max)*100}%` }} />
      ))}
    </div>
  )
}

/* --------------------- types + mock data --------------------- */
type Lead = {
  id:string
  title:string
  zip:string
  budget:string
  ageMins:number
  stage:'New'|'Quoted'|'Won'|'Lost'
  distanceMi:number
  lastFollowUpHrs?:number // for Quoted stage
}
type Appt = { id:string; job:string; at:string; window:string; addr:string }
type Activity = { id:string; when:string; label:string; type:'quote'|'win'|'signal'|'message' }
type CompletenessField = { key:string; label:string; weight:number; done:boolean; href:string; icon:React.ReactNode }

export default function ContractorDashboardPage() {
  const leads: Lead[] = [
    { id:'L-3307', title:'Boiler no heat', zip:'07030', budget:'$650', ageMins:12, stage:'New', distanceMi:2.3 },
    { id:'L-3306', title:'Mini-split install', zip:'11211', budget:'$2,400', ageMins:42, stage:'New', distanceMi:5.1 },
    { id:'L-3298', title:'AC tune-up', zip:'10001', budget:'$180', ageMins:180, stage:'Quoted', distanceMi:1.9, lastFollowUpHrs:28 },
    { id:'L-3293', title:'Thermostat replacement', zip:'11106', budget:'$220', ageMins:2200, stage:'Quoted', distanceMi:4.2, lastFollowUpHrs:51 },
    { id:'L-3290', title:'Package unit no cool', zip:'11385', budget:'$600', ageMins:1440, stage:'Won', distanceMi:7.4 },
  ]
  const apptsToday: Appt[] = [
    { id:'A1', job:'J-1031 Boiler no heat', at:new Date(Date.now()+2*36e5).toISOString(), window:'2–4p', addr:'Hoboken, NJ' },
    { id:'A2', job:'J-1017 AC tune-up', at:new Date(Date.now()+5*36e5).toISOString(), window:'5–6p', addr:'Manhattan, NY' },
  ]
  const activity: Activity[] = [
    { id:'ACT1', when:'1h', label:'Quoted J-1029 ($2,150)', type:'quote' },
    { id:'ACT2', when:'1d', label:'Won job J-1017', type:'win' },
    { id:'ACT3', when:'2d', label:'New signal: “boiler, 07030”', type:'signal' },
    { id:'ACT4', when:'3d', label:'Message from J-1023', type:'message' },
  ]
  const completeness: CompletenessField[] = [
    { key:'license', label:'Upload license', weight:20, done:true,  href:'/profile', icon:<BadgeCheck className="h-4 w-4" /> },
    { key:'insurance', label:'Verify insurance', weight:20, done:false, href:'/profile', icon:<ShieldIcon /> },
    { key:'coverage', label:'Service area', weight:15, done:true, href:'/settings/coverage', icon:<MapPin className="h-4 w-4" /> },
    { key:'hours', label:'Booking hours', weight:10, done:false, href:'/settings/availability', icon:<Clock className="h-4 w-4" /> },
    { key:'photos', label:'Add work photos', weight:10, done:true, href:'/profile', icon:<Users className="h-4 w-4" /> },
    { key:'team', label:'Invite team', weight:10, done:false, href:'/team', icon:<Users className="h-4 w-4" /> },
    { key:'bio', label:'Company bio', weight:15, done:true, href:'/profile', icon:<FileText className="h-4 w-4" /> },
  ]

  // computed
  const kpis = {
    openLeads: leads.filter(l=>l.stage==='New' || l.stage==='Quoted').length,
    activeQuotes: leads.filter(l=>l.stage==='Quoted').length,
    jobsWon30d: 3,
    signals: 12,
    revenue30d: '$18,450',
    responseMins: 26,
    winRate: 42,
    rating: 4.8,
    reviews30d: 12,
  }
  const completenessPct = useMemo(()=>{
    const total = completeness.reduce((a,b)=>a+b.weight,0)
    const done = completeness.filter(f=>f.done).reduce((a,b)=>a+b.weight,0)
    return Math.round((done/total)*100)
  },[completeness])

  const pipelineCounts = useMemo(()=>{
    const stages = ['New','Quoted','Won','Lost'] as const
    return stages.map(s=>leads.filter(l=>l.stage===s).length)
  },[leads])

  const newLeads = leads.filter(l=>l.stage==='New').sort((a,b)=>a.ageMins-b.ageMins).slice(0,3)
  const agingLeads = leads.filter(l=>l.stage==='New' && l.ageMins>60).sort((a,b)=>b.ageMins-a.ageMins).slice(0,3)
  const followupsDue = leads.filter(l=>l.stage==='Quoted' && (l.lastFollowUpHrs ?? 0) >= 24).sort((a,b)=>(b.lastFollowUpHrs??0)-(a.lastFollowUpHrs??0))

  const nextLead = newLeads[0]
  const nextAction = nextLead ? {
    title: 'Respond to new lead',
    desc: `${nextLead.title} • ${nextLead.zip} • ${nextLead.budget}`,
    href: `/jobs/${nextLead.id}`,
  } : {
    title: 'Browse jobs',
    desc: 'No new leads right now—expand your coverage or add signals.',
    href: '/jobs',
  }

  const revenueTrend = [2100, 3200, 2800, 4100, 3600, 4750] // last 6 weeks

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink dark:text-white">
          Dashboard <Badge>Contractor</Badge>
        </h1>
        <div className="flex gap-2">
          <Link href="/jobs" className="btn-primary">Browse Jobs</Link>
          <Link href="/signals" className="btn">Manage Signals</Link>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Open Leads" value={kpis.openLeads} icon={<Target className="h-4 w-4" />} />
        <StatCard label="Active Quotes" value={kpis.activeQuotes} hint="Needs follow-up" tone="emerald" icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Jobs Won (30d)" value={kpis.jobsWon30d} tone="amber" icon={<LineChart className="h-4 w-4" />} />
        <StatCard label="Signals" value={kpis.signals} tone="rose" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Revenue (30d)" value={kpis.revenue30d} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Avg Response" value={`${kpis.responseMins}m`} hint="Goal ≤ 30m" />
      </section>

      {/* Next + Lead inbox + Today */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Next action */}
        <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <SectionTitle>Next step</SectionTitle>
          <Link href={nextAction.href} className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 hover:bg-blue-100 transition">
            <div>
              <div className="font-semibold text-ink dark:text-white">{nextAction.title}</div>
              <div className="text-sm text-slate-600">{nextAction.desc}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500" />
          </Link>

          {/* Performance snapshot */}
          <div className="mt-4 rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
              <TrendingUp className="h-4 w-4 text-blue-600" /> Performance snapshot
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="mb-1 flex items-center justify-between"><span>Response time</span><span>{kpis.responseMins}m / 30m</span></div>
                <ProgressBar value={kpis.responseMins ? 30 - Math.min(30,kpis.responseMins) : 0} goal={30} tone="amber" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between"><span>Win rate</span><span>{kpis.winRate}% / 40%</span></div>
                <ProgressBar value={kpis.winRate} goal={40} tone="emerald" />
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-slate-700"><Star className="h-4 w-4 text-amber-500" /> {kpis.rating.toFixed(1)} avg</span>
                <Chip>{kpis.reviews30d} reviews (30d)</Chip>
              </div>
            </div>
          </div>
        </div>

        {/* Lead inbox (SLA) */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <SectionTitle action={<Link href="/jobs" className="text-brand underline text-sm">See all</Link>}>
            Lead inbox
          </SectionTitle>
          <ul className="space-y-2">
            {newLeads.map(l=>(
              <li key={l.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                <div>
                  <div className="font-medium text-ink dark:text-white">{l.title}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <span>{l.zip} • {l.budget} • {l.distanceMi.toFixed(1)}mi</span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {l.ageMins}m ago</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SLA mins={Math.max(0, l.ageMins-30)} />
                  <Link href={`/quotes/new?lead=${l.id}`} className="btn text-sm">Quote</Link>
                </div>
              </li>
            ))}
            {newLeads.length===0 && <li className="text-sm text-slate-600">No new leads. Check again soon.</li>}
          </ul>
        </div>

        {/* Today schedule */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <SectionTitle action={<Link href="/calendar" className="text-brand underline text-sm">Calendar</Link>}>
            Today
          </SectionTitle>
          {apptsToday.length===0 ? (
            <div className="text-sm text-slate-600">No appointments today.</div>
          ) : (
            <ul className="space-y-2">
              {apptsToday.map(a=>(
                <li key={a.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                  <div>
                    <div className="font-medium text-ink dark:text-white">{a.job}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5"/>{a.window}</span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{a.addr}</span>
                    </div>
                  </div>
                  <Link href={`/jobs/${a.id}`} className="btn btn-outline text-sm">Details</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Follow-ups + Aging + Revenue trend */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Follow-ups due */}
        <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
          <SectionTitle action={<Link href="/jobs?stage=Quoted" className="text-brand underline text-sm">Quoted board</Link>}>
            Follow-ups due
          </SectionTitle>
          {followupsDue.length===0 ? (
            <div className="text-sm text-slate-600">All caught up. 🎉</div>
          ) : (
            <ul className="space-y-2">
              {followupsDue.map(l=>(
                <li key={l.id} className="flex items-center justify-between rounded-lg border bg-amber-50 p-3">
                  <div>
                    <div className="font-medium text-ink dark:text-white">{l.title}</div>
                    <div className="text-xs text-slate-700 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span>{l.lastFollowUpHrs}h since last touch</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/messages/new?lead=${l.id}&via=email`} className="btn btn-outline text-sm"><Mail className="mr-1 h-4 w-4" /> Email</Link>
                    <Link href={`/messages/new?lead=${l.id}&via=text`} className="btn text-sm"><Phone className="mr-1 h-4 w-4" /> Text</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Aging leads (triage) */}
        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
          <SectionTitle action={<Link href="/jobs?stage=New" className="text-brand underline text-sm">New leads</Link>}>
            Aging leads (needs attention)
          </SectionTitle>
          {agingLeads.length===0 ? (
            <div className="text-sm text-slate-600">No aging leads. 👍</div>
          ) : (
            <ul className="space-y-2">
              {agingLeads.map(l=>(
                <li key={l.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                  <div>
                    <div className="font-medium text-ink dark:text-white">{l.title}</div>
                    <div className="text-xs text-slate-600">{l.ageMins}m old • {l.zip} • {l.distanceMi.toFixed(1)}mi</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SLA mins={Math.max(0, l.ageMins-30)} />
                    <Link href={`/quotes/new?lead=${l.id}`} className="btn text-sm">Quote</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Revenue trend mini */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <SectionTitle>Revenue trend (6w)</SectionTitle>
          <MiniBars data={revenueTrend} />
          <div className="mt-2 text-sm text-slate-600">Last 6 weeks • Simple view (mock)</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>Avg / wk ${(revenueTrend.reduce((a,b)=>a+b,0)/revenueTrend.length).toFixed(0)}</Chip>
            <Chip>Best ${Math.max(...revenueTrend)}</Chip>
            <Chip>Goal $5k/wk</Chip>
          </div>
        </div>
      </section>

      {/* Pipeline + Completeness + Activity */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Pipeline summary */}
        <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <SectionTitle action={<Link href="/jobs" className="text-brand underline text-sm">Open board</Link>}>
            Pipeline
          </SectionTitle>
          <div className="grid grid-cols-4 gap-2 text-sm">
            {(['New','Quoted','Won','Lost'] as const).map((stage, i)=>(
              <div key={stage} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{stage}</div>
                  <div className="text-xs text-slate-500">{pipelineCounts[i]}</div>
                </div>
                <div className="mt-2 h-2 rounded bg-slate-100">
                  <div className={`h-2 rounded ${i===0?'bg-slate-400':i===1?'bg-blue-500':i===2?'bg-emerald-500':'bg-rose-400'}`} style={{ width: `${Math.min(100, pipelineCounts[i]*25)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completeness */}
        <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <SectionTitle action={<Link href="/profile" className="text-brand underline text-sm">Edit profile</Link>}>
            Profile completeness
          </SectionTitle>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center justify-between text-sm font-medium text-blue-900">
              <span>Overall</span><span>{completenessPct}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-blue-100">
              <div className="h-2 rounded-full bg-blue-600" style={{width:`${completenessPct}%`}} />
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {completeness.map(f=>(
              <Link key={f.key} href={f.href} className={`flex items-center justify-between rounded-lg border p-3 text-sm transition ${f.done?'border-slate-200 bg-white':'border-amber-200 bg-amber-50 hover:bg-amber-100'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{f.icon}</span>
                  <span className="text-ink dark:text-white">{f.label}</span>
                </div>
                {f.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600"/> : <Circle className="h-5 w-5 text-slate-400"/>}
              </Link>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <SectionTitle>Recent activity</SectionTitle>
          <ul className="space-y-3 text-sm">
            {activity.map(a=>(
              <li key={a.id} className="relative pl-6">
                <span className="absolute left-0 top-0">
                  {a.type==='quote' ? <FileText className="h-4 w-4 text-blue-600"/> :
                   a.type==='win'   ? <CheckCircle2 className="h-4 w-4 text-emerald-600"/> :
                   a.type==='signal'? <Target className="h-4 w-4 text-rose-600"/> :
                                      <MessageSquare className="h-4 w-4 text-amber-600"/>}
                </span>
                <div className="text-ink dark:text-white">{a.label}</div>
                <div className="text-xs text-slate-500">{a.when} ago</div>
              </li>
            ))}
          </ul>
          <Link href="/activity" className="mt-3 inline-flex items-center text-brand underline text-sm">
            View all <ChevronRight className="ml-0.5 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Templates & Team */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-2 font-semibold text-ink dark:text-white">Quote templates</h3>
          <p className="text-sm text-slate-600 mb-3">Create fast, consistent quotes with saved templates.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/quotes/templates/new" className="btn">New Template</Link>
            <Link href="/quotes/templates" className="btn btn-outline">Manage</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-2 font-semibold text-ink dark:text-white">Team & availability</h3>
          <p className="text-sm text-slate-600">Invite techs and set booking hours.</p>
          <div className="mt-3 flex gap-2">
            <Link href="/team" className="btn">Invite Team</Link>
            <Link href="/settings/availability" className="btn btn-outline">Set Hours</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10Z"/>
    </svg>
  )
}
