'use client'
import React from 'react'
import Link from 'next/link'
import type { Contractor } from '../lib/state'

export default function ContractorCard({
  c,
  variant = 'default'
}:{ c: Contractor; variant?: 'default'|'bare' }){
  const shell = variant === 'bare'
    ? 'rounded-2xl p-4 bg-transparent border-none shadow-none'
    : 'card p-4'

  return (
    <div className={shell}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-ink">{c.name}</div>
          <div className="text-xs text-slate-600">
            {c.services.join(' • ')} • {c.serviceZips.join(', ')}
          </div>
        </div>
        <div className="text-sm font-medium">⭐ {c.housecallScore.toFixed(1)}</div>
      </div>
      <p className="text-sm mt-2 line-clamp-3">{c.bio}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {c.badges.map((b:string)=>(<span key={b} className="badge">{b}</span>))}
      </div>
      <div className="mt-3 flex gap-2">
        <Link href={`/contractors/${c.id}`} className="btn btn-outline">View Profile</Link>
        <Link href="/post-job" className="btn-primary">Request quote</Link>
      </div>
    </div>
  )
}
