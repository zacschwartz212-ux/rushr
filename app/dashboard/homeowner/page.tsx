'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  MapPin,
  AlertTriangle,
  Clock,
  ChevronRight,
  Siren,
  Battery,
  Zap,
} from 'lucide-react'

/* ----------------------------- tiny helpers ----------------------------- */
function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-ink dark:text-white">{children}</h2>
      {action}
    </div>
  )
}
function StatCard({
  label, value, hint, icon,
  tone = 'emerald',
}: {
  label: string; value: string | number; hint?: string; icon?: React.ReactNode;
  tone?: 'emerald' | 'blue' | 'amber' | 'rose'
}) {
  const ring =
    tone === 'emerald' ? 'border-emerald-200' :
    tone === 'blue' ? 'border-blue-200' :
    tone === 'amber' ? 'border-amber-200' : 'border-rose-200'
  const dot =
    tone === 'emerald' ? 'bg-emerald-500' :
    tone === 'blue' ? 'bg-blue-500' :
    tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
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
function Badge({ children, tone='emerald' }:{children:React.ReactNode; tone?:'emerald'|'blue'}) {
  const cls = tone==='emerald'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200'
  return <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>
}
function Chip({ children }:{children:React.ReactNode}) {
  return <span className="rounded-md border px-1.5 py-0.5 text-[11px] text-slate-600">{children}</span>
}
function timeUntil(iso: string) {
  try {
    const d = new Date(iso); const diff = d.getTime() - Date.now()
    if (diff <= 0) return 'now'
    const h = Math.floor(diff / 36e5), m = Math.round((diff % 36e5)/6e4)
    return h ? `${h}h ${m}m` : `${m}m`
  } catch { return '' }
}

/* --------------------------- typed data models --------------------------- */
type Job = {
  id: string
  title: string
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed'
  proName?: string
  hourlyRate?: number
  estimatedDuration?: string
  priority: 'Emergency' | 'Urgent' | 'Standard'
  nextAppt?: string // ISO
  category: 'Electrical'|'HVAC'|'Roofing'|'Plumbing'|'Carpentry'|'General'|'Landscaping'|'Auto'|'Locksmith'
  totalCost?: number
  startTime?: string
  endTime?: string
}
type Conversation = { id: string; with: string; jobId?: string; preview: string; unread: number; when: string }
type CompletenessField = { key:string; label:string; weight:number; done:boolean; href:string; icon:React.ReactNode }

/* ---------------------------------- page --------------------------------- */
export default function HomeownerDashboardPage() {
  // ---- mock data (swap with API later) ----
  const jobs: Job[] = [
    {
      id:'J-1031',
      title:'Boiler no heat',
      status:'Confirmed',
      proName:'Mike Rodriguez',
      hourlyRate:125,
      estimatedDuration:'2-3 hours',
      priority:'Emergency',
      nextAppt:new Date(Date.now()+3.6e6*5).toISOString(),
      category:'HVAC'
    },
    {
      id:'J-1029',
      title:'AC not cooling',
      status:'In Progress',
      proName:'Sarah Chen',
      hourlyRate:110,
      estimatedDuration:'1-2 hours',
      priority:'Emergency',
      category:'HVAC',
      startTime: new Date(Date.now()-1.8e6).toISOString()
    },
    {
      id:'J-1023',
      title:'Kitchen faucet leak',
      status:'Completed',
      proName:'David Park',
      hourlyRate:95,
      priority:'Urgent',
      category:'Plumbing',
      totalCost:285,
      startTime: new Date(Date.now()-7.2e6).toISOString(),
      endTime: new Date(Date.now()-3.6e6).toISOString()
    },
    {
      id:'J-1025',
      title:'Car lockout',
      status:'Completed',
      proName:'Alex Miller',
      hourlyRate:85,
      priority:'Emergency',
      category:'Auto',
      totalCost:125
    }
  ]
  const conversations: Conversation[] = [
    { id:'C1', with:'Mike Rodriguez (HVAC)', jobId:'J-1031', preview:'On my way! ETA 15 minutes. I have all the parts needed.', unread:1, when:'8m' },
    { id:'C2', with:'Sarah Chen (HVAC)', jobId:'J-1029', preview:'Job completed. Your AC is running great! Invoice sent.', unread:0, when:'2h' },
  ]
  const savedPros = [
    { id:'P-220', name:'Mike Rodriguez', rating:4.9, jobs:128, distance:'1.8mi', tags:['Emergency specialist','Available now'] },
    { id:'P-114', name:'Sarah Chen', rating:4.8, jobs:203, distance:'3.2mi', tags:['HVAC expert','Fast response'] },
  ]
  const completeness: CompletenessField[] = [
    { key:'email', label:'Verify email', weight:15, done:true,  href:'/settings', icon:<ShieldCheck className="h-4 w-4" /> },
    { key:'phone', label:'Add phone', weight:15, done:false, href:'/settings', icon:<PhoneIcon /> },
    { key:'address', label:'Add property address', weight:20, done:true, href:'/settings/addresses', icon:<MapPin className="h-4 w-4" /> },
    { key:'avatar', label:'Profile photo', weight:10, done:false, href:'/settings', icon:<UserRound className="h-4 w-4" /> },
    { key:'prefs', label:'Contact preferences', weight:15, done:true, href:'/settings', icon:<MessageSquare className="h-4 w-4" /> },
    { key:'first', label:'Book first emergency service', weight:25, done:true, href:'/post-job', icon:<FileText className="h-4 w-4" /> },
  ]

  // ---- computed UI state ----
  const completenessPct = useMemo(()=>{
    const total = completeness.reduce((a,b)=>a+b.weight,0)
    const done = completeness.filter(f=>f.done).reduce((a,b)=>a+b.weight,0)
    return Math.round((done/total)*100)
  },[completeness])

  const upcoming = useMemo(()=> jobs.filter(j=>j.status==='Confirmed' && j.nextAppt).slice(0,3),[jobs])

  // smart next step (simple rules; expand later)
  const nextStep = useMemo(()=>{
    const pending = jobs.find(j=>j.status==='Pending')
    if (pending) return {
      title:'Pro is being assigned',
      desc:`Emergency response for "${pending.title}" - ETA soon`,
      href:`/jobs/${pending.id}`,
      icon:<Clock className="h-4 w-4" />,
      tone:'amber' as const
    }
    const inProgress = jobs.find(j=>j.status==='In Progress')
    if (inProgress) return {
      title:'Service in progress',
      desc:`${inProgress.proName} is working on "${inProgress.title}"`,
      href:`/jobs/${inProgress.id}`,
      icon:<Zap className="h-4 w-4" />,
      tone:'blue' as const
    }
    if (upcoming[0]) return {
      title:'Prepare for your appointment',
      desc:`${upcoming[0].proName} arriving soon for "${upcoming[0].title}"`,
      href:`/jobs/${upcoming[0].id}`,
      icon:<CalendarDays className="h-4 w-4" />,
      tone:'blue' as const
    }
    return {
      title:'Need emergency help?',
      desc:'Get connected with verified pros instantly',
      href:'/post-job?urgent=1',
      icon:<Siren className="h-4 w-4" />,
      tone:'emerald' as const
    }
  },[jobs, upcoming])

  const kpis = {
    active: jobs.filter(j=>['Pending','Confirmed','In Progress'].includes(j.status)).length,
    completed: jobs.filter(j=>j.status==='Completed').length,
    unread: conversations.reduce((a,b)=>a+b.unread,0),
    saved: savedPros.length
  }

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink dark:text-white">
          Dashboard <Badge>Homeowner</Badge>
        </h1>
        <div className="flex gap-2">
          <Link href="/post-job?urgent=1" className="btn-primary">Emergency Help</Link>
          <Link href="/find-pro" className="btn">Find a Pro</Link>
        </div>
      </div>

      {/* KPIs + Next step */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="Active Services" value={kpis.active} hint="Pending, confirmed, in progress" icon={<Siren className="h-4 w-4" />} />
        <StatCard label="Completed" value={kpis.completed} hint="Total completed services" tone="blue" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Messages" value={kpis.unread} hint="Unread messages" tone="amber" icon={<MessageSquare className="h-4 w-4" />} />
        <StatCard label="Trusted Pros" value={kpis.saved} hint="Quick booking" tone="rose" icon={<Star className="h-4 w-4" />} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Next step card */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <SectionTitle>Next step</SectionTitle>
          <Link
            href={nextStep.href}
            className={`flex items-center justify-between rounded-xl border p-4 transition ${
              nextStep.tone==='amber' ? 'border-amber-200 bg-amber-50 hover:bg-amber-100' :
              nextStep.tone==='blue' ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' :
              'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-700">{nextStep.icon}</span>
              <div>
                <div className="font-semibold text-ink dark:text-white">{nextStep.title}</div>
                <div className="text-sm text-slate-600">{nextStep.desc}</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500" />
          </Link>
          {/* Profile nudge if completeness < 80 */}
          {completenessPct < 80 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Boost trust by finishing your profile.</span>
              <Link href="/settings" className="ml-auto text-brand underline">Complete it</Link>
            </div>
          )}
        </div>

        {/* Upcoming (schedule) */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <SectionTitle action={<Link href="/calendar" className="text-brand underline text-sm">Calendar</Link>}>
            Upcoming
          </SectionTitle>
          {upcoming.length === 0 ? (
            <div className="text-sm text-slate-600">No appointments yet.</div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map(u=>(
                <li key={u.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                  <div>
                    <div className="font-medium text-ink dark:text-white">{u.title}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" /> {u.proName} in {timeUntil(u.nextAppt!)}
                    </div>
                  </div>
                  <Link href={`/jobs/${u.id}`} className="btn btn-outline text-sm">Details</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Profile completeness */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-4">
          <SectionTitle action={<Link href="/settings" className="text-brand underline text-sm">Settings</Link>}>
            Profile completeness
          </SectionTitle>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center justify-between text-sm font-medium text-emerald-900">
              <span>Overall</span><span>{completenessPct}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-emerald-100">
              <div className="h-2 rounded-full bg-emerald-600" style={{width:`${completenessPct}%`}} />
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
      </section>

      {/* Jobs table */}
      <section>
        <SectionTitle action={<Link href="/history" className="text-brand underline text-sm">View all</Link>}>
          Emergency services
        </SectionTitle>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Service</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Pro</th>
                <th className="px-4 py-3 text-left font-medium">Rate/Cost</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {jobs.map(j=>(
                <tr key={j.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {j.title}
                      {j.priority === 'Emergency' && <span className="text-red-500 text-xs">🚨</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      j.status==='Pending' ? 'bg-amber-100 text-amber-700' :
                      j.status==='Confirmed' ? 'bg-blue-100 text-blue-700' :
                      j.status==='In Progress' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>{j.status}</span>
                  </td>
                  <td className="px-4 py-3">{j.proName || 'Assigning...'}</td>
                  <td className="px-4 py-3">
                    {j.totalCost ? `$${j.totalCost}` : j.hourlyRate ? `$${j.hourlyRate}/hr` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${j.id}`} className="text-brand underline">View</Link>
                    {j.status === 'In Progress' && (
                      <>
                        <span className="mx-2 text-slate-300">|</span>
                        <Link href={`/messages?job=${j.id}`} className="text-brand underline">Message</Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Messages + Trusted pros */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 p-4">
          <SectionTitle action={<Link href="/messages" className="text-brand underline text-sm">Open inbox</Link>}>
            Pro messages
          </SectionTitle>
          <div className="divide-y divide-slate-100">
            {conversations.map(c=>(
              <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{c.with}</div>
                    {c.unread ? <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-700">{c.unread} new</span> : null}
                  </div>
                  <div className="truncate text-sm text-slate-600">{c.preview}</div>
                </div>
                <div className="text-xs text-slate-500">{c.when} ago</div>
                <Link href={`/messages/${c.id}`} className="btn btn-outline">Reply</Link>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white p-4">
          <SectionTitle action={<Link href="/find-pro" className="text-brand underline text-sm">Browse</Link>}>
            Trusted pros
          </SectionTitle>
          <ul className="space-y-2">
            {savedPros.map(p=>(
              <li key={p.id} className="rounded-lg border bg-white p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                    {p.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.distance} • {p.jobs} jobs • {p.rating.toFixed(1)}★</div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Link href={`/pros/${p.id}`} className="btn btn-outline text-sm">View</Link>
                    <Link href={`/post-job?pro=${p.id}`} className="btn text-sm">Book</Link>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.tags.map(t=> <Chip key={t}>{t}</Chip>)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92V21a1 1 0 0 1-1.09 1 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3 3.09 1 1 0 0 1 4 2h4.09a1 1 0 0 1 1 .75l1 3.5a1 1 0 0 1-.27 1L8.91 9.91a16 16 0 0 0 6 6l2.66-1.91a1 1 0 0 1 1-.27l3.5 1a1 1 0 0 1 .75 1Z"/>
    </svg>
  )
}