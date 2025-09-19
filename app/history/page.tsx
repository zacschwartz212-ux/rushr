'use client'
import React from 'react'
import { useApp } from '../../lib/state'

export default function History(){
  const { state } = useApp()
  return (
    <section className="section">
      <div className="card p-6">
        <h1 className="text-xl font-semibold text-ink">Job History</h1>
        <p className="text-sm text-slate-700 mt-1">Recent jobs you&rsquo;ve posted or completed. (Stub)</p>
        <ul className="mt-3 list-disc pl-5 text-sm">
          {state.jobs.slice(0,5).map(j => <li key={j.id}>{j.title} — {j.status}</li>)}
        </ul>
      </div>
    </section>
  )
}
