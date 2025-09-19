'use client'
import React from 'react'
import Link from 'next/link'
import { useApp } from '../../../lib/state'
import { useRouter } from 'next/navigation'

export default function HowItWorksForProsPage(){
  const { state, openAuth, addToast } = useApp()
  const router = useRouter()

  const go = (href:string)=>{
    if(!state.user.signedIn){
      openAuth()
      addToast?.('Sign in to continue')
      return
    }
    router.push(href)
  }

  return (
    <div className="space-y-10">

      {/* Hero */}
      <section className="section">
        <div className="card relative overflow-hidden p-8 md:p-10">
          {/* soft green glows */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -top-28 -left-28 w-[520px] h-[520px] rounded-full opacity-80"
              style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.18), transparent 70%)' }}
            />
            <div
              className="absolute -bottom-36 -right-20 w-[420px] h-[420px] rounded-full opacity-80"
              style={{ background: 'radial-gradient(closest-side, rgba(52,211,153,0.14), transparent 70%)' }}
            />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium shadow-soft ring-1 ring-emerald-200 backdrop-blur dark:bg-white/10 dark:text-emerald-100 dark:ring-emerald-700">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              Pro guide
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-ink dark:text-white">
              How Rushr works for contractors
            </h1>
            <p className="mt-2 max-w-2xl text-slate-700 dark:text-slate-300">
              Find work without the noise. Bid clearly, win fairly, and keep everything—from
              messages to documents—in one place. Rushr is free to use; a small success fee is paid after a completed job. Signals is optional.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button onClick={()=>go('/jobs')} className="btn-primary">Browse jobs</button>
              <Link href="/signals" className="btn btn-outline">Learn about Signals</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-step flow */}
      <section className="section">
        <h2 className="text-xl font-semibold text-ink dark:text-white mb-3">The 4-step flow</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Step
            n={1}
            title="Set up your profile"
            body="Add services, service area (ZIPs/radius), licensing & insurance, and a short bio. Profiles with clear photos and specialties get contacted more."
            bullets={['Badges for license/insurance', 'Specialties & min/max rates', 'Service ZIPs/radius']}
          />
          <Step
            n={2}
            title="Find work (or get alerted)"
            body="Browse new jobs in your area or turn on Signals to get real-time alerts from inspections, permits, licenses & violations that match your rules."
            bullets={['Zip + category filters', 'Instant alerts with Signals', 'No pay-to-message']}
          />
          <Step
            n={3}
            title="Bid clearly"
            body="Use line items and notes so homeowners can compare apples-to-apples. Fast, specific replies and photos help you stand out."
            bullets={['Itemized quote builder', 'Attach photos/docs', 'ETA & warranty details']}
          />
          <Step
            n={4}
            title="Win, deliver, grow"
            body="Schedule, message, and keep records in one thread. Earn reviews and use 1-click rehire to stay top-of-mind for past clients."
            bullets={['In-thread scheduling', 'Receipts & job history', '1-click rehire']}
          />
        </div>
      </section>

      {/* Make your profile stand out */}
      <section className="section">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-white">Make your profile stand out</h3>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Homeowners hire faster when your profile answers their top questions at a glance.
          </p>

          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CheckCard icon="🧾" title="Licensing & insurance" text="Upload docs to earn visible badges and build trust." />
            <CheckCard icon="🛠️" title="Specialties & services" text="List what you actually do—make it easy to match." />
            <CheckCard icon="📍" title="Service area" text="Set ZIPs/radius so you see the right jobs first." />
            <CheckCard icon="💬" title="Bio & tone" text="A short, friendly bio wins replies; keep it professional." />
            <CheckCard icon="📸" title="Before/after photos" text="Show recent work—3 to 6 strong examples are ideal." />
            <CheckCard icon="⭐" title="Reviews & repeats" text="Request reviews after completion; 1-click rehire keeps you close." />
          </div>
        </div>
      </section>

      {/* Winning bids (what homeowners compare) */}
      <section className="section">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-white">What homeowners compare</h3>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Our side-by-side view highlights clarity and completeness. These areas consistently win jobs:
          </p>

          <div className="mt-4 grid lg:grid-cols-3 gap-4">
            <CompareCard
              icon="🧮"
              title="Itemized scope & pricing"
              points={[
                'Materials, haul-away, cleanup, and warranty spelled out',
                'Avoid “TBD”—give ranges if needed with assumptions',
              ]}
            />
            <CompareCard
              icon="⏱️"
              title="Speed & communication"
              points={[
                'Respond quickly with specifics and next steps',
                'Offer a couple of time windows for walkthroughs',
              ]}
            />
            <CompareCard
              icon="🛡️"
              title="Credentials & confidence"
              points={[
                'License/insurance badges visible',
                'Relevant photos and a short, credible bio',
              ]}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge">Quote templates</span>
            <span className="badge">Saved messages</span>
            <span className="badge">Attachments</span>
          </div>
        </div>
      </section>

      {/* Signals — concise, value-first (optional but recommended) */}
      <section className="section">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 dark:border-emerald-900/40 dark:bg-emerald-900/10">
          <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Signals (pro feature)</div>
          <h3 className="text-lg font-semibold text-ink dark:text-white mt-1">Be first to the lead—before they reach out</h3>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            Signals watches inspection failures, permits, licenses, and violations in your state.
            Build rules by category, jurisdiction, and keywords to get instant, actionable alerts—so you quote first.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/signals" className="btn btn-ghost">How Signals works</Link>
            <button onClick={()=>go('/signals/dashboard')} className="btn btn-outline">Open Signals dashboard</button>
          </div>
        </div>
      </section>

      {/* Quick-start checklist */}
      <section className="section">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-white">Your 10-minute quick start</h3>
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <TipCard n={1} title="Complete profile basics" lines={['Upload license/insurance', 'Add specialties & service area']} />
            <TipCard n={2} title="Set default quote template" lines={['Line items & standard notes', 'Warranty & exclusions']} />
            <TipCard n={3} title="Browse today’s jobs" lines={['Filter by ZIP & category', 'Shortlist a few to bid now']} />
            <TipCard n={4} title="Turn on Signals (optional)" lines={['Create 1–2 rules', 'Test alerts for a day']} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={()=>go('/jobs')} className="btn-primary">Browse jobs</button>
            <button onClick={()=>go('/settings')} className="btn btn-outline">Edit profile</button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="card p-6 md:p-8 text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-ink dark:text-white">
            Ready to land your next job?
          </h3>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Start with today’s postings or enable Signals to jump the line.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button onClick={()=>go('/jobs')} className="btn-primary">Browse jobs</button>
            <Link href="/signals" className="btn btn-outline">Learn about Signals</Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">Free to use. Small success fee after completion. Signals is optional.</p>
        </div>
      </section>
    </div>
  )
}

/* — in-file atoms to match your system — */

function Step({
  n, title, body, bullets=[]
}:{
  n:number
  title:string
  body:string
  bullets?:string[]
}){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full grid place-items-center bg-emerald-100 text-emerald-700 font-semibold">{n}</div>
        <div className="text-[17px] md:text-lg font-semibold tracking-tight text-ink dark:text-white">{title}</div>
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{body}</p>
      {bullets.length>0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
          {bullets.map((b,i)=>(
            <li key={i} className="flex items-start gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CheckCard({icon, title, text}:{icon:string; title:string; text:string}){
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl grid place-items-center bg-emerald-50 text-2xl leading-none dark:bg-emerald-900/20">{icon}</div>
        <div>
          <div className="font-semibold text-ink dark:text-white">{title}</div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{text}</p>
        </div>
      </div>
    </div>
  )
}

function CompareCard({icon, title, points}:{icon:string; title:string; points:string[]}){
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl grid place-items-center bg-emerald-50 text-2xl leading-none dark:bg-emerald-900/20">{icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-ink dark:text-white">{title}</div>
          <ul className="mt-1 space-y-1">
            {points.map((p,i)=>(
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function TipCard({n, title, lines}:{n:number; title:string; lines:string[]}){
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start gap-3">
        <div className="h-7 w-7 rounded-full grid place-items-center bg-emerald-100 text-emerald-700 text-sm font-semibold">{n}</div>
        <div className="flex-1">
          <div className="font-semibold text-ink dark:text-white">{title}</div>
          <ul className="mt-1 space-y-1">
            {lines.map((l,i)=>(
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
