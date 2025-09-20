'use client'

import React, { useMemo, useState } from 'react'
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
  Siren,
  Zap,
  Battery,
  Settings,
  Bell,
  Power,
  PowerOff,
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

/* --------------------- types + mock data --------------------- */
type EmergencyJob = {
  id:string
  title:string
  location:string
  priority: 'Emergency' | 'Urgent' | 'Standard'
  hourlyRate:number
  estimatedDuration:string
  distance:number
  requestedMins:number
  status:'Available'|'Accepted'|'En Route'|'In Progress'|'Completed'
  customerName:string
  category: 'Plumbing'|'Electrical'|'HVAC'|'Locksmith'|'Auto'|'General'
}
type Availability = 'online' | 'busy' | 'offline'
type Appt = { id:string; job:string; at:string; window:string; addr:string; customerName:string }
type Earning = { date:string; amount:number; hours:number; jobTitle:string }
type CompletenessField = { key:string; label:string; weight:number; done:boolean; href:string; icon:React.ReactNode }

export default function ContractorDashboardPage() {
  const [availability, setAvailability] = useState<Availability>('online')

  const emergencyJobs: EmergencyJob[] = [
    {
      id:'EJ-001',
      title:'Boiler no heat',
      location:'Brooklyn Heights, NY',
      priority:'Emergency',
      hourlyRate:125,
      estimatedDuration:'2-3 hours',
      distance:2.3,
      requestedMins:5,
      status:'Available',
      customerName: 'Sarah Johnson',
      category: 'HVAC'
    },
    {
      id:'EJ-002',
      title:'Electrical outlet sparking',
      location:'Manhattan, NY',
      priority:'Emergency',
      hourlyRate:135,
      estimatedDuration:'1-2 hours',
      distance:4.1,
      requestedMins:18,
      status:'Available',
      customerName: 'Mike Chen',
      category: 'Electrical'
    },
    {
      id:'EJ-003',
      title:'Toilet overflowing',
      location:'Queens Village, NY',
      priority:'Urgent',
      hourlyRate:95,
      estimatedDuration:'1-2 hours',
      distance:5.8,
      requestedMins:32,
      status:'Available',
      customerName: 'Lisa Park',
      category: 'Plumbing'
    },
  ]

  const currentJobs: EmergencyJob[] = [
    {
      id:'EJ-004',
      title:'AC not cooling',
      location:'Hoboken, NJ',
      priority:'Emergency',
      hourlyRate:110,
      estimatedDuration:'2-3 hours',
      distance:1.2,
      requestedMins:45,
      status:'In Progress',
      customerName: 'John Smith',
      category: 'HVAC'
    }
  ]

  const todaySchedule: Appt[] = [
    {
      id:'A1',
      job:'Kitchen faucet repair',
      at:new Date(Date.now()+3*36e5).toISOString(),
      window:'3–4p',
      addr:'Manhattan, NY',
      customerName: 'Emily Rodriguez'
    },
  ]

  const recentEarnings: Earning[] = [
    { date: '2024-09-19', amount: 285, hours: 3, jobTitle: 'Boiler repair' },
    { date: '2024-09-18', amount: 220, hours: 2, jobTitle: 'Electrical outlet' },
    { date: '2024-09-17', amount: 190, hours: 2, jobTitle: 'Faucet replacement' },
    { date: '2024-09-16', amount: 340, hours: 4, jobTitle: 'HVAC maintenance' },
  ]

  const completeness: CompletenessField[] = [
    { key:'license', label:'Upload license', weight:25, done:true,  href:'/profile', icon:<BadgeCheck className="h-4 w-4" /> },
    { key:'insurance', label:'Verify insurance', weight:25, done:true, href:'/profile', icon:<ShieldIcon /> },
    { key:'coverage', label:'Emergency service area', weight:20, done:true, href:'/settings/coverage', icon:<MapPin className="h-4 w-4" /> },
    { key:'hours', label:'Emergency availability', weight:15, done:false, href:'/settings/availability', icon:<Clock className="h-4 w-4" /> },
    { key:'rates', label:'Set hourly rates', weight:15, done:true, href:'/settings/rates', icon:<DollarSign className="h-4 w-4" /> },
  ]

  // computed
  const kpis = {
    todayJobs: currentJobs.length + todaySchedule.length,
    weekEarnings: recentEarnings.reduce((sum, e) => sum + e.amount, 0),
    avgResponse: 8, // minutes
    rating: 4.9,
    completedJobs: 128,
    emergencyJobs: emergencyJobs.length,
  }

  const completenessPct = useMemo(()=>{
    const total = completeness.reduce((a,b)=>a+b.weight,0)
    const done = completeness.filter(f=>f.done).reduce((a,b)=>a+b.weight,0)
    return Math.round((done/total)*100)
  },[completeness])

  const availableJobs = emergencyJobs.filter(j => j.status === 'Available').sort((a,b) => a.requestedMins - b.requestedMins)
  const nextJob = availableJobs[0]

  const nextAction = currentJobs.length > 0 ? {
    title: 'Service in progress',
    desc: `Continue work on "${currentJobs[0].title}" for ${currentJobs[0].customerName}`,
    href: `/jobs/${currentJobs[0].id}`,
    urgent: true,
  } : nextJob ? {
    title: 'Emergency job available',
    desc: `${nextJob.title} • $${nextJob.hourlyRate}/hr • ${nextJob.distance}mi away`,
    href: `/jobs/${nextJob.id}`,
    urgent: nextJob.priority === 'Emergency',
  } : {
    title: 'Ready for emergency calls',
    desc: 'You\'re online and available. Emergency jobs will appear here.',
    href: '/jobs',
    urgent: false,
  }

  const getAvailabilityIcon = (status: Availability) => {
    switch (status) {
      case 'online': return <Power className="h-4 w-4 text-emerald-600" />
      case 'busy': return <Clock className="h-4 w-4 text-amber-600" />
      case 'offline': return <PowerOff className="h-4 w-4 text-slate-400" />
    }
  }

  const getAvailabilityColor = (status: Availability) => {
    switch (status) {
      case 'online': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'busy': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'offline': return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink dark:text-white">
          Dashboard <Badge>Pro</Badge>
        </h1>
        <div className="flex gap-2 items-center">
          {/* Availability Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Status:</span>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as Availability)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getAvailabilityColor(availability)}`}
            >
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <Link href="/jobs" className="btn-primary">Emergency Jobs</Link>
          <Link href="/settings" className="btn">Settings</Link>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Today's Jobs" value={kpis.todayJobs} icon={<Siren className="h-4 w-4" />} />
        <StatCard label="Week Earnings" value={`$${kpis.weekEarnings}`} tone="emerald" icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Avg Response" value={`${kpis.avgResponse}m`} hint="Emergency calls" tone="amber" icon={<Zap className="h-4 w-4" />} />
        <StatCard label="Rating" value={kpis.rating} tone="rose" icon={<Star className="h-4 w-4" />} />
        <StatCard label="Completed Jobs" value={kpis.completedJobs} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Available Jobs" value={kpis.emergencyJobs} tone="amber" icon={<Bell className="h-4 w-4" />} />
      </section>

      {/* Next action + Current job + Today schedule */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Next action */}
        <div className={`rounded-2xl border p-4 shadow-sm ${nextAction.urgent ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-white'}`}>
          <SectionTitle>
            {nextAction.urgent ? (
              <span className="flex items-center gap-2">
                <Siren className="h-4 w-4 text-red-600" />
                Urgent Action
              </span>
            ) : (
              'Next Step'
            )}
          </SectionTitle>
          <Link
            href={nextAction.href}
            className={`flex items-center justify-between rounded-xl border p-4 transition ${
              nextAction.urgent
                ? 'border-red-200 bg-red-100 hover:bg-red-200'
                : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <div>
              <div className="font-semibold text-ink dark:text-white">{nextAction.title}</div>
              <div className="text-sm text-slate-600">{nextAction.desc}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500" />
          </Link>

          {/* Availability status */}
          <div className="mt-4 rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
              {getAvailabilityIcon(availability)}
              Emergency availability
            </div>
            <div className={`text-sm px-3 py-2 rounded-lg ${getAvailabilityColor(availability)}`}>
              {availability === 'online' && 'Ready to receive emergency job alerts'}
              {availability === 'busy' && 'Currently on a job - limited availability'}
              {availability === 'offline' && 'Not receiving emergency job alerts'}
            </div>
          </div>
        </div>

        {/* Emergency job alerts */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <SectionTitle action={<Link href="/jobs" className="text-brand underline text-sm">See all</Link>}>
            Emergency jobs nearby
          </SectionTitle>
          <ul className="space-y-2">
            {availableJobs.slice(0,3).map(job=>(
              <li key={job.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                <div>
                  <div className="font-medium text-ink dark:text-white flex items-center gap-2">
                    {job.title}
                    {job.priority === 'Emergency' && <span className="text-red-500 text-xs">🚨</span>}
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <span>{job.location} • ${job.hourlyRate}/hr • {job.distance}mi</span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.requestedMins}m ago</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/jobs/${job.id}`} className="btn text-sm">Accept</Link>
                </div>
              </li>
            ))}
            {availableJobs.length===0 && <li className="text-sm text-slate-600">No emergency jobs available nearby.</li>}
          </ul>
        </div>

        {/* Today schedule */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <SectionTitle action={<Link href="/calendar" className="text-brand underline text-sm">Calendar</Link>}>
            Today's Schedule
          </SectionTitle>
          {currentJobs.length > 0 && (
            <div className="mb-3">
              <div className="font-medium text-purple-700 text-sm mb-2">🔄 In Progress</div>
              {currentJobs.map(job => (
                <div key={job.id} className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                  <div className="font-medium text-ink dark:text-white">{job.title}</div>
                  <div className="text-xs text-slate-600">{job.customerName} • {job.location}</div>
                  <Link href={`/jobs/${job.id}`} className="btn btn-outline text-sm mt-2">Continue</Link>
                </div>
              ))}
            </div>
          )}

          {todaySchedule.length === 0 ? (
            <div className="text-sm text-slate-600">No scheduled appointments today.</div>
          ) : (
            <ul className="space-y-2">
              {todaySchedule.map(a=>(
                <li key={a.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                  <div>
                    <div className="font-medium text-ink dark:text-white">{a.job}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5"/>{a.window}</span>
                      <span className="text-slate-400">•</span>
                      <span>{a.customerName}</span>
                    </div>
                  </div>
                  <Link href={`/jobs/${a.id}`} className="btn btn-outline text-sm">Details</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Earnings + Completeness + Performance */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent earnings */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <SectionTitle action={<Link href="/earnings" className="text-brand underline text-sm">View all</Link>}>
            Recent earnings
          </SectionTitle>
          <ul className="space-y-2">
            {recentEarnings.slice(0,4).map(earning=>(
              <li key={earning.date} className="flex items-center justify-between rounded-lg border bg-emerald-50 p-3">
                <div>
                  <div className="font-medium text-ink dark:text-white">{earning.jobTitle}</div>
                  <div className="text-xs text-slate-600">{new Date(earning.date).toLocaleDateString()} • {earning.hours}h</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-700">${earning.amount}</div>
                  <div className="text-xs text-slate-500">${(earning.amount/earning.hours).toFixed(0)}/hr</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-center">
            <div className="text-sm font-medium text-emerald-700">
              Week total: ${recentEarnings.reduce((sum, e) => sum + e.amount, 0)}
            </div>
          </div>
        </div>

        {/* Profile completeness */}
        <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <SectionTitle action={<Link href="/profile" className="text-brand underline text-sm">Edit profile</Link>}>
            Emergency readiness
          </SectionTitle>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center justify-between text-sm font-medium text-blue-900">
              <span>Setup complete</span><span>{completenessPct}%</span>
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

        {/* Performance metrics */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <SectionTitle>Performance this week</SectionTitle>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Response time</span>
                <span>{kpis.avgResponse}m avg</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div className="h-2 bg-emerald-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Goal: &lt;10 minutes</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Customer rating</span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" />
                  {kpis.rating}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div className="h-2 bg-amber-500 rounded-full" style={{ width: '98%' }} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Based on 12 reviews this week</div>
            </div>

            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-ink dark:text-white">5</div>
                  <div className="text-xs text-slate-500">Jobs completed</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-ink dark:text-white">23h</div>
                  <div className="text-xs text-slate-500">Hours worked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-2 font-semibold text-ink dark:text-white">Emergency services</h3>
          <p className="text-sm text-slate-600 mb-3">Manage your emergency service offerings and rates.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/settings/services" className="btn">Service Types</Link>
            <Link href="/settings/rates" className="btn btn-outline">Hourly Rates</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-2 font-semibold text-ink dark:text-white">Coverage & availability</h3>
          <p className="text-sm text-slate-600">Set your service area and emergency availability hours.</p>
          <div className="mt-3 flex gap-2">
            <Link href="/settings/coverage" className="btn">Service Area</Link>
            <Link href="/settings/availability" className="btn btn-outline">Availability</Link>
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