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
    const jobs = Array.isArray((state as any)?.jobs) ? (state as any).jobs : []
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

      <div className="mt-3 text-sm text-slate-600">{filtered.length} job{filtered.length===1?'':'s'} found</div>

      <div className="grid md:grid-cols-2 gap-4 mt-3">
        {Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-40" />)}
      </div>

      {/* If you had your own loading state, keep it; Suspense handles the hook boundary */}
      {/* Replace Skeleton grid above with your original loading/JobCard render if you prefer */}
    </section>
  )
}
