'use client'
import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApp } from '../../../lib/state'

export default function JobDetail(){
  const { state, addToast } = useApp()
  const { id } = useParams<{id:string}>()
  const job = state.jobs.find(j => j.id===id)
  if(!job) return <section className="section"><div className="card p-6">Job not found.</div></section>

  const rehireURL = `/post-job?title=${encodeURIComponent(job.title)}&cat=${encodeURIComponent(job.category)}&zip=${encodeURIComponent(job.zip)}`

  return (
    <section className="section">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">{job.title}</h1>
          <div className="flex gap-2">
            <Link href={`/jobs/${job.id}/compare`} className="btn btn-outline">Compare bids</Link>
            <Link href={rehireURL} className="btn btn-outline">Rehire (prefill)</Link>
            <button className="btn-primary" onClick={()=>addToast('Review request sent')}>Request review</button>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <div><span className="font-medium">Category:</span> {job.category}</div>
          <div><span className="font-medium">ZIP:</span> {job.zip}</div>
          <div><span className="font-medium">Urgency:</span> {job.urgencyScore}/10</div>
          <div className="mt-2"><span className="font-medium">Description:</span> {job.description}</div>
        </div>
      </div>
    </section>
  )
}
