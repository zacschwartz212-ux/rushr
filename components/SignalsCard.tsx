'use client'
import React from 'react'
import Link from 'next/link'

type SignalLike = {
  id?: string
  type?: 'INSPECTION'|'PERMIT'|'LICENSE'|'VIOLATION'|string
  status?: string
  subject?: string
  jurisdiction?: string
  address?: string
  scope?: unknown
  occurredAt?: string
}

// A fully-normalized shape we actually render with
type NormalizedSignal = {
  id: string
  type: string
  status: string
  subject: string
  jurisdiction: string
  address: string
  scope: string[]
  occurredAt: string
}

/** Normalize weird shapes coming from state / mock data */
function normalizeSignal(s: any): NormalizedSignal {
  const subject = String(s?.subject ?? 'Update')
  const status  = String(s?.status ?? '')
  const type    = String(s?.type ?? 'EVENT')
  const address = String(s?.address ?? '')
  const jurisdiction = String(s?.jurisdiction ?? '')
  const occurredAt = String(s?.occurredAt ?? '')

  // scope may be: array | string (pipe/comma) | null/undefined | object
  let scope: string[] = []
  const raw = s?.scope
  if (Array.isArray(raw)) {
    scope = raw.map(String).map(x => x.trim()).filter(Boolean)
  } else if (typeof raw === 'string') {
    // allow both "|" and "," as separators
    scope = raw.split(/[|,]/g).map(x => x.trim()).filter(Boolean)
  } else {
    scope = []
  }

  return { id: String(s?.id ?? ''), type, status, subject, jurisdiction, address, scope, occurredAt }
}

function prettyDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso // show raw if not a date
  return d.toLocaleString(undefined, { year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' })
}

function typeBadgeClr(t: string) {
  switch ((t || '').toUpperCase()) {
    case 'INSPECTION': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'PERMIT':     return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'LICENSE':    return 'bg-sky-100 text-sky-800 border-sky-200'
    case 'VIOLATION':  return 'bg-rose-100 text-rose-800 border-rose-200'
    default:           return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}

export default function SignalsCard({ s }: { s: SignalLike | any }) {
  const sig = normalizeSignal(s)

  const hasEmergency = sig.scope.some(x => /emergency|urgent|priority/i.test(x))
  const badgeClr = typeBadgeClr(sig.type)

  return (
    <article className="card p-4 space-y-2">
      <div className="flex items-start gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${badgeClr}`}>
          {sig.type}
        </span>
        {sig.status ? (
          <span className="badge">{sig.status}</span>
        ) : null}
        {hasEmergency ? (
          <span className="badge bg-rose-600 text-white border-rose-600">Emergency</span>
        ) : null}
        <div className="ml-auto text-xs text-slate-500">{prettyDate(sig.occurredAt)}</div>
      </div>

      <div className="text-sm text-slate-900 font-medium">
        {sig.subject}
      </div>

      {(sig.address || sig.jurisdiction) ? (
        <div className="text-xs text-slate-600">
          {sig.address ? <span>{sig.address}</span> : null}
          {sig.address && sig.jurisdiction ? <span> • </span> : null}
          {sig.jurisdiction ? <span>{sig.jurisdiction}</span> : null}
        </div>
      ) : null}

      {sig.scope.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {sig.scope.map((t, i) => (
            <span key={i} className="badge">{t}</span>
          ))}
        </div>
      ) : null}

      {/* Optional actions row (safe no-ops / links) */}
      <div className="pt-2 flex items-center gap-2">
        <Link href="/pro/signals/rules/new" className="btn btn-outline">Create rule</Link>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            if (typeof window !== 'undefined') alert('Demo: open details')
          }}
        >
          View details
        </button>
      </div>
    </article>
  )
}
