'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApp } from '../../../../lib/state'

export default function CompareBids(){
  const { state } = useApp()
  const { id } = useParams<{id:string}>()

  const job = state.jobs.find(j => j.id===id)
  const bids = useMemo(()=> state.bids.filter(b => b.jobId===id), [state.bids, id])

  if(!job) return <section className="section"><div className="card p-6">Job not found.</div></section>

  return (
    <section className="section">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-ink">Compare bids — {job.title}</h1>
        <Link href={`/jobs/${job.id}`} className="btn btn-outline">Back to job</Link>
      </div>

      {bids.length===0 ? (
        <div className="card p-6">No bids yet.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-3">Contractor</th>
                {bids.map(b => {
                  const c = state.contractors.find(x=>x.id===b.contractorId)
                  return <th key={b.id} className="py-2 px-3">{c?.name || b.contractorId}</th>
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Price</td>
                {bids.map(b => <td key={b.id} className="py-2 px-3">${b.price} ({b.type})</td>)}
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Timeline</td>
                {bids.map(b => <td key={b.id} className="py-2 px-3">{b.timeline || '—'}</td>)}
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Scope summary</td>
                {bids.map(b => <td key={b.id} className="py-2 px-3">{b.scopeSummary || '—'}</td>)}
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Message</td>
                {bids.map(b => <td key={b.id} className="py-2 px-3">{b.message || '—'}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
