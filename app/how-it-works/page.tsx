// app/how-it-works/page.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import { useApp } from '../../lib/state'

export default function HowItWorksPage(){
  const { state, openAuth, addToast } = useApp()
  const postOrAuth = ()=>{
    if(!state.user.signedIn){
      openAuth()
      addToast?.('Sign in to post your job')
      return
    }
    window.location.href = '/post-job'
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
              Homeowner guide
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-ink dark:text-white">
              How Housecall works for homeowners
            </h1>
            <p className="mt-2 max-w-2xl text-slate-700 dark:text-slate-300">
              Post what you need, compare real bids from local pros, and hire with confidence.
              It’s free for homeowners—and takes about two minutes to get started.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button onClick={postOrAuth} className="btn-primary">Post a job</button>
              <Link href="/find-pro" className="btn btn-outline">Search for a pro</Link>
              {/* Pricing button removed by request */}
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
            title="Post your job"
            body="Tell us the work, location (ZIP), budget window, and urgency. Add photos if you have them—photos speed up good quotes."
            bullets={['2 minutes', 'Free for homeowners', 'Private contact info']}
          />
          <Step
            n={2}
            title="Get matched & bid"
            body="Local, qualified pros see your post and submit clear, itemized bids—usually within minutes."
            bullets={['3–5 average bids', 'Licensed/insured badges', 'Verified profiles']}
          />
          <Step
            n={3}
            title="Compare & message"
            body="Use our side-by-side bid compare to see what’s included. Chat safely in one place, ask questions, and schedule walkthroughs."
            bullets={['Side-by-side compare', 'Secure messaging', 'No spam calls']}
          />
          <Step
            n={4}
            title="Hire with confidence"
            body="Pick your pro, confirm details, and get it done. Leave a review after—then use 1-click rehire next time."
            bullets={['1-click rehire', 'Job history', 'Receipts & docs kept together']}
          />
        </div>
      </section>

      {/* What to include (icon cards for clarity) */}
      <section className="section">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-white">What should I include in my post?</h3>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Clear details = better bids. Use this quick checklist:
          </p>

          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CheckCard icon="📝" title="Clear title" text="“Replace 40-gal gas water heater” beats “Water heater.”" />
            <CheckCard icon="📸" title="Photos" text="A few images of the area/equipment help pros quote fast." />
            <CheckCard icon="⏱️" title="Timeline & urgency" text="When do you want it done? Any days/times to avoid?" />
            <CheckCard icon="💰" title="Budget range" text="A window (e.g., $800–$1200) keeps bids realistic." />
            <CheckCard icon="🚪" title="Constraints" text="Access, pets, parking, elevator, gate codes, etc." />
            <CheckCard icon="🏛️" title="Permits/HOA" text="Anything you already know—we’ll flag if needed." />
          </div>

          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Not sure how to describe the scope? Our <span className="font-medium text-ink dark:text-white">AI Scope Assistant</span> suggests the right details from your plain-English description so pros can quote accurately.
          </div>
        </div>
      </section>

      {/* Comparing bids (structured, icon headings) */}
      <section className="section">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-white">How to compare bids</h3>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            We normalize line items so you can compare apples-to-apples across pros.
          </p>

          <div className="mt-4 grid lg:grid-cols-3 gap-4">
            <CompareCard
              icon="🧾"
              title="Price vs. scope"
              points={[
                'Materials, haul-away, warranty, and cleanup included?',
                'Watch for exclusions or “TBD” items.',
              ]}
            />
            <CompareCard
              icon="⭐"
              title="Experience & reviews"
              points={[
                'Total jobs completed, specialties, and verified reviews.',
                'Use 1-click rehire if you liked working with them.',
              ]}
            />
            <CompareCard
              icon="📅"
              title="Timeline & communication"
              points={[
                'Clear scheduling windows & next-step clarity.',
                'Fast, specific responses are a strong signal.',
              ]}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge">Side-by-side compare</span>
            <span className="badge">In-thread attachments</span>
            <span className="badge">Saved quotes</span>
          </div>
        </div>
      </section>

      {/* Trust & safety (cleaner cards) */}
      <section className="section">
        <div className="grid md:grid-cols-2 gap-4">
          <SafetyCard
            icon="✅"
            title="Verified profiles"
            lines={['License & insurance badges where applicable', 'Background-check indicators where provided']}
          />
          <SafetyCard
            icon="🔒"
            title="Private by default"
            lines={['Message in-app (no exposed phone/email)', 'Share contact info only when you’re ready']}
          />
          <SafetyCard
            icon="🗂️"
            title="Clear records"
            lines={['All messages & docs in one place', 'Job history helps with warranty & rehire']}
          />
          <SafetyCard
            icon="🚩"
            title="Report & support"
            lines={['Flag any issues to our team', 'We’ll follow up quickly']}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="card p-6 md:p-8 text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-ink dark:text-white">
            Ready to get bids?
          </h3>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Post your job now—most homeowners see first responses in under 10 minutes.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button onClick={postOrAuth} className="btn-primary">Post a job</button>
            <Link href="/find-pro" className="btn btn-outline">Search for a pro</Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">Free for homeowners. No spam calls. You’re in control.</p>
        </div>
      </section>

      {/* Link to About (kept for context) */}
      <section className="section">
        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 dark:text-slate-300 dark:border-slate-800">
          Want the backstory and team details? See our <Link href="/about" className="underline">About</Link> page.
        </div>
      </section>
    </div>
  )
}

/* — in-file atoms for clarity — */

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
        {/* Prominent title */}
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

function SafetyCard({icon, title, lines}:{icon:string; title:string; lines:string[]}){
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 dark:border-emerald-900/40 dark:bg-emerald-900/10">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl grid place-items-center bg-white text-2xl leading-none shadow-soft dark:bg-slate-900">{icon}</div>
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
