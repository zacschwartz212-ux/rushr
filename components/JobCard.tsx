'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import type { Job } from '../lib/state'
import { useApp } from '../lib/state'
import QuickBidModal from './QuickBidModal'

export default function JobCard({
  job,
  variant = 'default',
}: {
  job: Job
  variant?: 'default' | 'bare'
}) {
  const { state } = useApp()
  const [openQB, setOpenQB] = useState(false)

  const isContractor =
    state.user.signedIn && state.user.role === 'CONTRACTOR'

  const shell =
    variant === 'bare'
      ? 'rounded-2xl p-4 bg-white border border-slate-100 shadow-soft' // still boxed to match site
      : 'card p-4'

  return (
    <div className={shell}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-ink font-semibold">{job.title}</div>
          <div className="text-xs text-slate-600">
            {job.category} • ZIP {job.zip}
          </div>
        </div>
        <div className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          Urgency {job.urgencyScore}/10
        </div>
      </div>

      <p className="text-sm mt-2 line-clamp-3">{job.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/jobs/${job.id}`} className="btn btn-outline">
          View
        </Link>

        {/* Only show quick-bid to signed-in contractors */}
        {isContractor && (
          <button
            className="btn-primary"
            onClick={() => setOpenQB(true)}
            aria-label="Quick bid on this job"
          >
            Quick bid
          </button>
        )}

        {/* Optional: a generic CTA for homeowners or logged-out users */}
        {!isContractor && (
          <Link href="/post-job" className="btn">
            Bid similar
          </Link>
        )}
      </div>

      {/* Quick Bid modal (contractors only) */}
      {isContractor && (
        <QuickBidModal
          open={openQB}
          onClose={() => setOpenQB(false)}
          jobId={job.id}
          category={job.category}
        />
      )}
    </div>
  )
}
