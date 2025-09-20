// app/jobs/page.client.tsx
'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '../../lib/state'
import JobCard from '../../components/JobCard'
import Skeleton from '../../components/Skeleton'

export default function JobsInner() {
  const { state } = useApp()
  const sp = useSearchParams()
  const paramCat = sp.get('cat') || 'All'

  const categories = Array.isArray(state.categories) ? state.categories : []
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(categories.includes(paramCat) ? paramCat : 'All')
  const [zip, setZip] = useState('')
  const [radius, setRadius] = useState(0)
  const [sort, setSort] = useState<'Newest'|'Budget high'|'Budget low'|'Urgency high'>('Newest')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ const t = setTimeout(()=>setLoading(false), 300); return ()=>clearTimeout(t) },[])
  useEffect(()=>{
    const c = sp.get('cat')
    if (c && categories.includes(c)) setCat(c)
  }, [sp, categories])

  const filtered = useMemo(()=>{
    const jobs = Array.isArray((state as any)?.jobs) ? (state as any).jobs : SAMPLE_JOBS
    let arr = [...jobs]
    if(q){
      const qq = q.toLowerCase()
      arr = arr.filter(j =>
        j.title.toLowerCase().includes(qq) ||
        (j.description || '').toLowerCase().includes(qq) ||
        j.category.toLowerCase().includes(qq)
      )
    }
    if(cat!=='All') arr = arr.filter(j => j.category===cat)
    if(zip){
      if (radius<=5) arr = arr.filter(j => j.zip === zip)
      else if (radius<=10) arr = arr.filter(j => j.zip.slice(0,4) === zip.slice(0,4))
      else if (radius<=25) arr = arr.filter(j => j.zip.slice(0,3) === zip.slice(0,3))
    }
    if(sort==='Budget high') arr.sort((a,b)=>(b.budgetMax ?? b.budgetMin ?? 0) - (a.budgetMax ?? a.budgetMin ?? 0))
    if(sort==='Budget low')  arr.sort((a,b)=>(a.budgetMin ?? 0) - (b.budgetMin ?? 0))
    if(sort==='Urgency high') arr.sort((a,b)=> (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0))
    return arr
  }, [state.jobs, q, cat, zip, radius, sort])

  const exportCSV = ()=>{
    const rows = [
      ['Title','Category','ZIP','Urgency','Budget Type','Budget Min','Budget Max','Status'],
      ...filtered.map(j => [
        j.title, j.category, j.zip, `${j.urgencyScore}/10`,
        j.budgetType, j.budgetMin ?? '', j.budgetMax ?? '', j.status
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'housecall-jobs.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Available Jobs</h1>
              <p className="text-slate-600 text-sm mt-0.5">Browse and apply to emergency service opportunities</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              {filtered.length} available
            </span>
            <span>•</span>
            <span>Updated today</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card p-4 grid md:grid-cols-6 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="label">Search</label>
          <input className="input" placeholder="Title, description, category…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={cat} onChange={e=>setCat(e.target.value)}>
            <option>All</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">ZIP</label>
            <input className="input" placeholder="10001" value={zip} onChange={e=>setZip(e.target.value)} inputMode="numeric" />
          </div>
          <div>
            <label className="label">Radius</label>
            <select className="input" value={radius} onChange={e=>setRadius(Number(e.target.value))}>
              <option value={0}>Any</option><option value={5}>≤5 mi</option><option value={10}>≤10 mi</option><option value={25}>≤25 mi</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Sort</label>
          <select className="input" value={sort} onChange={e=>setSort(e.target.value as any)}>
            <option>Newest</option><option>Budget high</option><option>Budget low</option><option>Urgency high</option>
          </select>
        </div>
        <div className="flex md:justify-end">
          <button className="btn btn-outline w-full md:w-auto" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          {Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 text-center py-8 text-slate-500">
              No jobs found. Try adjusting your filters.
            </div>
          )}
        </div>
      )}
      </section>
    </div>
  )
}

// Sample jobs data matching the emergency theme
const SAMPLE_JOBS = [
  {
    id: 'job-1',
    title: 'Emergency Plumbing - Burst Pipe',
    category: 'Plumbing',
    description: 'Burst pipe in basement flooding the area. Need immediate repair to stop water damage. Located near water heater, appears to be main line.',
    zip: '10001',
    urgencyScore: 9,
    budgetType: 'hourly',
    budgetMin: 150,
    budgetMax: 300,
    status: 'open',
    createdAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: 'job-2',
    title: 'Electrical Outlet Not Working - Home Office',
    category: 'Electrical',
    description: 'Multiple outlets in home office stopped working this morning. Need electrician to diagnose and fix. May be circuit breaker issue.',
    zip: '10002',
    urgencyScore: 6,
    budgetType: 'fixed',
    budgetMin: 200,
    budgetMax: 400,
    status: 'open',
    createdAt: new Date('2024-01-15T09:45:00Z')
  },
  {
    id: 'job-3',
    title: 'HVAC System Down - No Heat',
    category: 'HVAC',
    description: 'Heating system completely stopped working overnight. House temperature dropping fast. Family with small children needs urgent repair.',
    zip: '10003',
    urgencyScore: 8,
    budgetType: 'hourly',
    budgetMin: 100,
    budgetMax: 250,
    status: 'open',
    createdAt: new Date('2024-01-15T08:15:00Z')
  },
  {
    id: 'job-4',
    title: 'Locked Out - Need Locksmith',
    category: 'Locksmith',
    description: 'Locked out of apartment, keys inside. Need locksmith to unlock door without damage. Standard deadbolt lock.',
    zip: '10001',
    urgencyScore: 7,
    budgetType: 'fixed',
    budgetMin: 80,
    budgetMax: 150,
    status: 'open',
    createdAt: new Date('2024-01-15T11:20:00Z')
  },
  {
    id: 'job-5',
    title: 'Garage Door Won\'t Close - Security Issue',
    category: 'Garage Door',
    description: 'Garage door stuck open, won\'t close. Security concern as we\'re leaving for vacation tomorrow. Remote and manual button not working.',
    zip: '10004',
    urgencyScore: 6,
    budgetType: 'hourly',
    budgetMin: 120,
    budgetMax: 200,
    status: 'open',
    createdAt: new Date('2024-01-15T07:30:00Z')
  },
  {
    id: 'job-6',
    title: 'Window Glass Replacement - Storm Damage',
    category: 'Glass Repair',
    description: 'Large living room window cracked from storm last night. Need replacement ASAP for security and weather protection.',
    zip: '10002',
    urgencyScore: 7,
    budgetType: 'fixed',
    budgetMin: 300,
    budgetMax: 500,
    status: 'open',
    createdAt: new Date('2024-01-15T06:45:00Z')
  },
  {
    id: 'job-7',
    title: 'Appliance Repair - Refrigerator Not Cooling',
    category: 'Appliance Repair',
    description: 'Refrigerator stopped cooling overnight. Food spoiling. Need technician to diagnose and repair. About 3 years old, side-by-side model.',
    zip: '10003',
    urgencyScore: 8,
    budgetType: 'hourly',
    budgetMin: 100,
    budgetMax: 300,
    status: 'open',
    createdAt: new Date('2024-01-15T12:00:00Z')
  },
  {
    id: 'job-8',
    title: 'Handyman - Multiple Small Repairs',
    category: 'Handyman',
    description: 'Need handyman for several small repairs: leaky faucet, squeaky door hinges, loose cabinet handles. Can be done in one visit.',
    zip: '10001',
    urgencyScore: 3,
    budgetType: 'hourly',
    budgetMin: 80,
    budgetMax: 150,
    status: 'open',
    createdAt: new Date('2024-01-14T16:30:00Z')
  },
  {
    id: 'job-9',
    title: 'Water Heater Leak - Urgent',
    category: 'Plumbing',
    description: 'Water heater leaking from bottom, creating puddle in utility room. Water damage risk to flooring. 40-gallon electric unit, 5 years old.',
    zip: '10005',
    urgencyScore: 8,
    budgetType: 'fixed',
    budgetMin: 400,
    budgetMax: 800,
    status: 'open',
    createdAt: new Date('2024-01-15T13:15:00Z')
  },
  {
    id: 'job-10',
    title: 'Tree Fallen on Roof - Emergency',
    category: 'Roofing',
    description: 'Large tree branch fell on roof during storm. Hole in shingles, water entering attic. Need immediate tarp/patch until full repair.',
    zip: '10006',
    urgencyScore: 9,
    budgetType: 'hourly',
    budgetMin: 200,
    budgetMax: 500,
    status: 'open',
    createdAt: new Date('2024-01-15T14:20:00Z')
  },
  {
    id: 'job-11',
    title: 'Sewer Backup - Basement Flooding',
    category: 'Plumbing',
    description: 'Raw sewage backing up into basement. Multiple drains affected. Need emergency pump-out and line clearing. Health hazard situation.',
    zip: '10007',
    urgencyScore: 10,
    budgetType: 'hourly',
    budgetMin: 300,
    budgetMax: 600,
    status: 'open',
    createdAt: new Date('2024-01-15T15:45:00Z')
  },
  {
    id: 'job-12',
    title: 'Fence Repair After Storm',
    category: 'Fencing',
    description: 'Privacy fence blown down by wind, 3 sections need replacement. Dog containment issue. Wood fence, 6ft height, standard posts.',
    zip: '10004',
    urgencyScore: 5,
    budgetType: 'fixed',
    budgetMin: 800,
    budgetMax: 1200,
    status: 'open',
    createdAt: new Date('2024-01-15T16:00:00Z')
  },
  {
    id: 'job-13',
    title: 'Gas Smell - Need Inspection',
    category: 'Gas',
    description: 'Strong gas odor near outdoor meter and inside kitchen. Turned off main valve. Need emergency inspection and repair.',
    zip: '10008',
    urgencyScore: 9,
    budgetType: 'hourly',
    budgetMin: 150,
    budgetMax: 400,
    status: 'open',
    createdAt: new Date('2024-01-15T17:30:00Z')
  },
  {
    id: 'job-14',
    title: 'Driveway Snow Removal',
    category: 'Snow Removal',
    description: '200ft driveway blocked by heavy snow. Need plowing ASAP for medical appointment access. Elderly resident, steep incline.',
    zip: '10009',
    urgencyScore: 7,
    budgetType: 'fixed',
    budgetMin: 100,
    budgetMax: 200,
    status: 'open',
    createdAt: new Date('2024-01-15T18:00:00Z')
  },
  {
    id: 'job-15',
    title: 'Security Camera System Down',
    category: 'Security',
    description: 'Home security camera system offline after power outage. Need diagnostic and repair. 8-camera system with DVR, business location.',
    zip: '10010',
    urgencyScore: 6,
    budgetType: 'hourly',
    budgetMin: 120,
    budgetMax: 250,
    status: 'open',
    createdAt: new Date('2024-01-15T19:15:00Z')
  },
  {
    id: 'job-16',
    title: 'Carpet Water Damage - Dry Out',
    category: 'Water Damage',
    description: 'Living room carpet soaked from dishwasher leak. Need immediate water extraction and drying to prevent mold. 400 sq ft area.',
    zip: '10011',
    urgencyScore: 7,
    budgetType: 'fixed',
    budgetMin: 300,
    budgetMax: 600,
    status: 'open',
    createdAt: new Date('2024-01-15T20:00:00Z')
  },
  {
    id: 'job-17',
    title: 'Furnace Making Strange Noise',
    category: 'HVAC',
    description: 'Gas furnace making loud grinding noise when starting. Concerned about safety. House getting cold, need same-day service.',
    zip: '10012',
    urgencyScore: 7,
    budgetType: 'hourly',
    budgetMin: 150,
    budgetMax: 350,
    status: 'open',
    createdAt: new Date('2024-01-15T21:30:00Z')
  },
  {
    id: 'job-18',
    title: 'Drywall Hole Repair - Move-out',
    category: 'Drywall',
    description: 'Need 3 holes patched and painted before move-out inspection tomorrow. Standard nail holes and one door handle hole.',
    zip: '10013',
    urgencyScore: 6,
    budgetType: 'fixed',
    budgetMin: 200,
    budgetMax: 350,
    status: 'open',
    createdAt: new Date('2024-01-15T22:00:00Z')
  }
]

