'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '../../../lib/state'
import SignalsCard from '../../../components/SignalsCard'

type SignalType = 'INSPECTION'|'PERMIT'|'LICENSE'|'VIOLATION'
type TypeFilter = 'ALL'|SignalType

export default function SignalsDashboard(){
  const app = useApp() as any
const state = (app?.state ?? {}) as any
const markSignalsSeen: () => void = typeof app?.markSignalsSeen === 'function' ? app.markSignalsSeen : () => {}


  // Always guard arrays/objects coming from state during prerender
  const signals = Array.isArray((state as any)?.signals) ? (state as any).signals : []
  const lastSeen = (state as any)?.ui?.lastSignalsSeenAt ?? ''

  const [q, setQ] = useState<string>('')
  const [type, setType] = useState<TypeFilter>('ALL')
  const [juris, setJuris] = useState<'ALL'|string>('ALL')

  // mark events as seen when arriving here (runs client-side only)
  useEffect(()=>{ try { markSignalsSeen?.() } catch {} }, [markSignalsSeen])

  // build jurisdictions from data (strings only)
  const jurisdictions = useMemo(()=>{
    const set = new Set<string>()
    for (const s of signals) {
      const j = typeof s?.jurisdiction === 'string' ? s.jurisdiction : ''
      if (j) set.add(j)
    }
    return ['ALL', ...Array.from(set)]
  }, [signals])

  // apply filters (defensively coerce to strings)
  const list = useMemo(()=>{
    let arr = [...signals]

    if (type !== 'ALL') {
      arr = arr.filter(s => s?.type === type)
    }

    if (juris !== 'ALL') {
      arr = arr.filter(s => (s?.jurisdiction ?? '') === juris)
    }

    if (q) {
      const qq = String(q).toLowerCase()
      arr = arr.filter(s => {
        const subject = String(s?.subject ?? '').toLowerCase()
        const address = String(s?.address ?? '').toLowerCase()
        const status  = String(s?.status  ?? '').toLowerCase()
        return subject.includes(qq) || address.includes(qq) || status.includes(qq)
      })
    }

    // sort by occurredAt (string or undefined)
    arr.sort((a,b) => String(b?.occurredAt ?? '').localeCompare(String(a?.occurredAt ?? '')))
    return arr
  }, [signals, q, type, juris])

  // count new since last visit
  const newSince = useMemo(()=>{
    if (!lastSeen) return signals.length
    return signals.filter(s => String(s?.occurredAt ?? '') > String(lastSeen)).length
  }, [signals, lastSeen])

  // export CSV of current view
  const exportCSV = ()=>{
    const rows = [
      ['Type','Status','Subject','Jurisdiction','Address','Scope','Occurred At'],
      ...list.map(s => {
        const scope = Array.isArray(s?.scope) ? s.scope : []
        return [
          String(s?.type ?? ''),
          String(s?.status ?? ''),
          String(s?.subject ?? ''),
          String(s?.jurisdiction ?? ''),
          String(s?.address ?? ''),
          scope.join('|'),
          String(s?.occurredAt ?? '')
        ]
      })
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'housecall-signals.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const reset = ()=>{ setQ(''); setType('ALL'); setJuris('ALL') }

  return (
    <div className="space-y-4">
      {/* Sticky subheader */}
      <div className="sticky top-[64px] md:top-[68px] z-20 bg-white/85 backdrop-blur border-b border-slate-100">
        <div className="container-max py-3 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold text-ink">Signals Feed</h1>
          <span className="badge">New since last visit: {newSince}</span>
          <span className="badge">Showing: {list.length}</span>
          <div className="ml-auto flex gap-2">
            <Link href="/pro/signals/rules/new" className="btn btn-outline">Create rule</Link>
            <button className="btn-primary" onClick={exportCSV}>Export CSV</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="section">
        <div className="card p-4 grid md:grid-cols-5 gap-2">
          <input
            className="input md:col-span-2"
            placeholder="Search subject, address, or status"
            value={q}
            onChange={e=>setQ(e.target.value)}
          />
          <select className="input" value={type} onChange={e=>setType(e.target.value as TypeFilter)}>
            <option value="ALL">All events</option>
            <option value="INSPECTION">Inspection</option>
            <option value="PERMIT">Permit</option>
            <option value="LICENSE">License</option>
            <option value="VIOLATION">Violation</option>
          </select>
          <select className="input" value={juris} onChange={e=>setJuris(e.target.value as any)}>
            {jurisdictions.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
          <button className="btn btn-outline" onClick={reset}>Reset</button>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {list.map(s => <SignalsCard key={String(s?.id ?? Math.random())} s={s} />)}
        </div>
        {list.length===0 && (
          <div className="card p-6 text-center text-slate-600 mt-4">No events match your filters.</div>
        )}
      </section>
    </div>
  )
}
