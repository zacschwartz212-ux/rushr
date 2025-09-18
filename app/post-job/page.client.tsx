'use client'
export const dynamic = 'force-dynamic'

import React, { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '../../utils/supabase-browser'
import { useApp } from '../../lib/state'

type BudgetType = 'Fixed' | 'Range' | 'Hourly'
type Tone = 'Neutral' | 'Friendly' | 'Technical'

type Props = { userId: string }

export default function PostJobInner({ userId }: Props) {
  const supabase = supabaseBrowser()
  const { state, addToast } = useApp()
  const router = useRouter()
  const sp = useSearchParams()

  // ---- Prefill from query params (hero) + localStorage (default ZIP) ----
  const [title, setTitle] = useState<string>(() => {
    return (sp.get('title') ?? sp.get('t') ?? sp.get('q') ?? '').trim()
  })
  const [category, setCategory] = useState<string>('') // "Select one"
  const [zip, setZip] = useState<string>(() => {
    const fromQuery = (sp.get('zip') ?? '').trim()
    if (fromQuery) return fromQuery
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('housecall.defaultZip') ?? '').trim()
    }
    return ''
  })
  const [desc, setDesc] = useState<string>(() => {
    return (sp.get('desc') ?? sp.get('service') ?? sp.get('need') ?? sp.get('q') ?? '').trim()
  })

  const [urgency, setUrgency] = useState(5) // 0..10
  const [isEmergency, setIsEmergency] = useState(false)

  const [budgetType, setBudgetType] = useState<BudgetType>('Range')
  const [budgetMin, setBudgetMin] = useState<number | ''>('')
  const [budgetMax, setBudgetMax] = useState<number | ''>('')
  const [hourlyRate, setHourlyRate] = useState<number | ''>('')

  const [photos, setPhotos] = useState<File[]>([])

  // extra questions
  const [accessNotes, setAccessNotes] = useState('')
  const [propertyType, setPropertyType] = useState<string>('') // "Select one"
  const [hasPets, setHasPets] = useState<string>('') // "Select one"
  const [preferredContact, setPreferredContact] = useState<'In App' | 'Text' | 'Call'>('In App')
  const [shareConsent, setShareConsent] = useState(false)

  // AI assistant
  const [aiOpen, setAiOpen] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiArea, setAiArea] = useState('Living room')
  const [aiTiming, setAiTiming] = useState<'ASAP' | 'This week' | 'Flexible'>('This week')
  const [aiFiles, setAiFiles] = useState<File[]>([])
  const [aiTone, setAiTone] = useState<Tone>('Friendly')
  const [aiLoading, setAiLoading] = useState(false)

  // submit state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    // category from homepage
    const incomingCat = (sp.get('category') ?? '').trim()
    if (incomingCat) setCategory(incomingCat)

    // short note from homepage → description
    const fromNote = (sp.get('note') ?? '').trim()
    if (fromNote && !desc) setDesc(fromNote)

    // urgency / emergency
    const uTxt = (sp.get('urgency') ?? '').trim().toLowerCase()
    const urgentFlag = (sp.get('urgent') ?? '').trim().toLowerCase()
    if (uTxt === 'emergency' || urgentFlag === '1' || urgentFlag === 'true') {
      setIsEmergency(true)
      setUrgency(10)
    } else if (uTxt === 'soon') {
      setUrgency(7)
    } else if (uTxt === 'flexible') {
      setUrgency(3)
    }
  }, [sp]) // keep `sp` as dependency

  // urgency visuals
  const displayUrgency = isEmergency ? 10 : urgency
  const urgencyHue = useMemo(() => {
    const t = Math.max(0, Math.min(10, displayUrgency)) / 10
    return Math.round(140 * (1 - t))
  }, [displayUrgency])
  const urgencyColor = `hsl(${urgencyHue} 75% 45%)`
  const urgencyPct = `${(Math.max(0, Math.min(10, displayUrgency)) / 10) * 100}%`
  const urgencyBg = isEmergency
    ? 'linear-gradient(90deg, #fecaca 0%, #ef4444 60%, #b91c1c 100%)'
    : `linear-gradient(90deg, ${urgencyColor} 0% ${urgencyPct}, #e5e7eb ${urgencyPct} 100%)`

  const urgencyLabel =
    isEmergency ? 'Emergency'
      : displayUrgency <= 3
      ? 'Low'
      : displayUrgency <= 7
      ? 'Soon'
      : 'ASAP'

  const onFiles = (files: FileList | null) => {
    if (!files) return
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 12))
  }
  const onAiFiles = (files: FileList | null) => {
    if (!files) return
    setAiFiles((prev) => [...prev, ...Array.from(files)].slice(0, 8))
  }

  const consentRequired = preferredContact !== 'In App'
  const canSubmitBase = Boolean(title.trim() && zip.trim() && desc.trim())
  const canSubmit = canSubmitBase && (!consentRequired || shareConsent)

  // --- SAVE TO SUPABASE ---
  async function saveJob(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    if (!canSubmitBase) {
      addToast('Please add a title, ZIP, and a quick description.', 'error')
      return
    }
    if (!canSubmit) return

    if (typeof window !== 'undefined' && zip) {
      try {
        localStorage.setItem('housecall.defaultZip', zip.trim())
      } catch {}
    }

    setSubmitting(true)
    try {
      // Map budget by type into min/max
      let min: number | null = null
      let max: number | null = null
      if (budgetType === 'Range') {
        min = budgetMin === '' ? null : Number(budgetMin)
        max = budgetMax === '' ? null : Number(budgetMax)
      }
      if (budgetType === 'Fixed') {
        min = budgetMin === '' ? null : Number(budgetMin)
        max = min
      }
      // Hourly is optional to persist later (see SQL below). For now we only keep min/max.

      // We also persist your extra fields in a JSONB column `details`
      const details = {
        budgetType,
        hourlyRate: hourlyRate === '' ? null : Number(hourlyRate),
        urgency: displayUrgency,
        isEmergency,
        propertyType: propertyType || null,
        hasPets: hasPets || null,
        accessNotes: accessNotes || null,
        preferredContact,
        shareConsent,
        zip,
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            user_id: userId,
            title,
            description: desc,
            category: category || 'general',
            budget_min: min,
            budget_max: max,
            city: null, // not captured in this form
            state: null, // not captured in this form
            zip,
            contact_email: null, // we can default to account email later if you want
            status: 'open',
            details, // JSONB column to hold the rest
          },
        ])
        .select('id')
        .single()

      if (error) throw error

      addToast('Your job has been posted.', 'success')
      router.replace(`/jobs`) // or: router.replace(`/post-job/success?id=${data.id}`)
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Could not create job')
      addToast('Something went wrong while posting.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // AI: rewrite & insert directly into the textarea
  async function rewriteAndInsert() {
    const payload = {
      text: aiText || desc,
      category,
      area: aiArea,
      timing: aiTiming,
      tone: aiTone,
      extras: { propertyType, accessNotes, hasPets, preferredContact },
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = res.ok ? await res.json() : null
      const improved = (data?.text || '').trim() || localRewrite(aiText || desc, payload)
      setDesc(improved)
      setPhotos((prev) => [...prev, ...aiFiles].slice(0, 12))
      setAiOpen(false)
    } catch {
      setDesc(localRewrite(aiText || desc, payload))
      setAiOpen(false)
      addToast('AI service not configured; used local rewrite.', 'info')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <section className="section">
      <div className="container">
        {/* Header row */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Post a Job</h1>
            <p className="text-slate-600 mt-1">Tell us what you need. Two minutes, tops. Keep it casual.</p>
          </div>

          {/* Emergency → navigate to /post-job/emergency + classic info bubble */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/post-job/emergency')}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 shadow-soft border transition
                bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-[0_0_0_3px_rgba(244,63,94,0.25)]"
              title="Go to Emergency"
            >
              <span aria-hidden>🚨</span>
              <span>Emergency</span>
            </button>

            {/* Info bubble (hover/focus) */}
            <div className="relative group">
              <button
                type="button"
                aria-label="When should I post an Emergency?"
                className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold
                           flex items-center justify-center hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                tabIndex={0}
              >
                i
              </button>
              <div
                role="tooltip"
                className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100
                           transition-opacity duration-150 absolute right-0 top-8 z-40 w-72 card p-3 text-sm"
              >
                <div className="font-medium text-slate-900 mb-1">When to use Emergency</div>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Active leak or flooding</li>
                  <li>Total power outage or sparking</li>
                  <li>No heat/AC during extreme weather</li>
                  <li>Roof leak or unsafe structure</li>
                </ul>
                <div className="mt-2 text-xs text-slate-500">
                  If there’s immediate danger (fire, gas smell, injury), call <span className="font-semibold">911</span> first.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={saveJob} className="card p-5 grid lg:grid-cols-2 gap-5">
          {/* Emergency ribbon (still shows if isEmergency was set via query params) */}
          {isEmergency && (
            <div className="lg:col-span-2 -mt-2 mb-1 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              🚨 Emergency flagged. We will surface this for faster responses.
            </div>
          )}

          {/* Left column */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="label">Job title</label>
              <input
                className="input"
                placeholder="e.g., No-cool AC, possible capacitor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category + ZIP */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select one</option>
                  {state.categories?.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ZIP</label>
                <input
                  className="input"
                  placeholder="11215"
                  inputMode="numeric"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description + AI bubble */}
            <div className="group">
              <label className="label">Describe what is going on</label>

              <div className="relative">
                <textarea
                  className="input min-h-[160px] w-full pr-48 pb-12"
                  placeholder="Short and sweet is fine. Add model, access notes, what you have tried, etc."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />

                <button
                  type="button"
                  aria-label="AI Scope Assistant"
                  onClick={() => {
                    setAiText(desc)
                    setAiOpen(true)
                  }}
                  title="Rewrite with AI"
                  className="absolute bottom-2 right-2 z-10 h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm overflow-hidden transition-all duration-200 ease-out hover:w-44 focus-visible:w-44 active:w-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 group/bubble pl-8"
                >
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-8 flex items-center justify-center select-none leading-none"
                    aria-hidden
                  >
                    ✦
                  </span>
                  <span className="pr-2 text-xs whitespace-nowrap opacity-0 translate-x-1 transition-all duration-200 ease-out group-hover/bubble:opacity-100 group-hover/bubble:translate-x-0 group-focus/bubble:opacity-100 group-focus/bubble:translate-x-0">
                    Rewrite with AI
                  </span>
                </button>
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="label">Photos (optional)</label>
              <div className="flex items-center gap-2">
                <label className="btn btn-outline cursor-pointer">
                  Upload
                  <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
                </label>
                <span className="text-xs text-slate-500">Up to 12</span>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {photos.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(f)} alt="" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Urgency */}
            <div>
              <label className="label flex items-center justify-between">
                <span>Urgency</span>
                <span className={`text-xs ${isEmergency ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
                  {urgencyLabel} ({displayUrgency}/10)
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={displayUrgency}
                onChange={(e) => setUrgency(Number(e.target.value))}
                disabled={isEmergency}
                className="w-full h-2 rounded-full appearance-none"
                style={{ background: urgencyBg }}
              />
              {isEmergency && <div className="mt-1 text-xs text-rose-700">Emergency is pinned to 10/10.</div>}
              {!isEmergency && <div className="mt-1 text-xs text-slate-500">Drag to set how quickly you need this done.</div>}
            </div>

            {/* Budget */}
            <div>
              <label className="label">Budget</label>
              <div className="flex flex-wrap gap-2">
                {(['Range', 'Fixed', 'Hourly'] as BudgetType[]).map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setBudgetType(bt)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${
                      budgetType === bt ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>

              {budgetType === 'Range' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    className="input"
                    placeholder="Min $"
                    inputMode="numeric"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : '')}
                  />
                  <input
                    className="input"
                    placeholder="Max $"
                    inputMode="numeric"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              )}
              {budgetType === 'Fixed' && (
                <div className="mt-2">
                  <input
                    className="input"
                    placeholder="Total $"
                    inputMode="numeric"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              )}
              {budgetType === 'Hourly' && (
                <div className="mt-2">
                  <input
                    className="input"
                    placeholder="$ / hr"
                    inputMode="numeric"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              )}
              <div className="mt-2 text-xs text-slate-500">You can adjust later after chatting with a pro.</div>
            </div>

            {/* Extra questions */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Property type</label>
                <select className="input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  <option value="">Select one</option>
                  {['House', 'Apartment', 'Condo', 'Other'].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Pets at home?</label>
                <select className="input" value={hasPets} onChange={(e) => setHasPets(e.target.value)}>
                  <option value="">Select one</option>
                  {['No', 'Yes'].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Access notes (optional)</label>
                <input
                  className="input"
                  placeholder="Gate code, super’s number, elevator size, etc."
                  value={accessNotes}
                  onChange={(e) => setAccessNotes(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Preferred contact</label>
                <div className="flex gap-2">
                  {(['In App', 'Text', 'Call'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setPreferredContact(m)
                        if (m === 'In App') setShareConsent(false)
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${
                        preferredContact === m ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {(preferredContact === 'Text' || preferredContact === 'Call') && (
                  <>
                    <label className="mt-2 flex items-start gap-2 text-xs text-slate-600">
                      <input type="checkbox" className="mt-[3px]" checked={shareConsent} onChange={(e) => setShareConsent(e.target.checked)} />
                      I am OK with sharing my contact info with relevant bidders for this job.
                    </label>
                    {!shareConsent && <div className="mt-1 text-[11px] text-rose-600">You must accept before posting.</div>}
                  </>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center gap-2">
              <button className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canSubmit || submitting} type="submit">
                {submitting ? 'Posting…' : 'Post Job'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => router.push('/')}>
                Cancel
              </button>
            </div>

            {submitError && <div className="text-rose-600 text-sm">{submitError}</div>}
          </div>
        </form>
      </div>

      {/* ===== AI Scope Assistant Modal ===== */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAiOpen(false)} />
          <div className="relative card w-full max-w-2xl p-5 z-10">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">AI Scope Assistant</div>
              <button className="btn btn-outline" onClick={() => setAiOpen(false)}>
                Close
              </button>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">What is happening?</label>
                <textarea
                  className="input min-h-[120px]"
                  placeholder="Tell the assistant in your own words…"
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Where is it?</label>
                <select className="input" value={aiArea} onChange={(e) => setAiArea(e.target.value)}>
                  {['Living room', 'Kitchen', 'Bathroom', 'Bedroom', 'Roof', 'Basement', 'Exterior', 'Garage', 'Other'].map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Timing</label>
                <div className="flex gap-2">
                  {(['ASAP', 'This week', 'Flexible'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAiTiming(t)}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${
                        aiTiming === t ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Tone</label>
                <select className="input" value={aiTone} onChange={(e) => setAiTone(e.target.value as Tone)}>
                  {(['Neutral', 'Friendly', 'Technical'] as Tone[]).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Add photos (optional)</label>
                <div className="flex items-center gap-2">
                  <label className="btn btn-outline cursor-pointer">
                    Upload
                    <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => onAiFiles(e.target.files)} />
                  </label>
                </div>
                {aiFiles.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {aiFiles.map((f, i) => (
                      <img key={i} src={URL.createObjectURL(f)} alt="" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="btn btn-outline" onClick={() => setAiOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={rewriteAndInsert} disabled={aiLoading}>
                {aiLoading ? 'Thinking…' : 'Rewrite with AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/* ---------- local fallback rewriter (only if API fails) ---------- */
function localRewrite(
  text: string,
  ctx: {
    text: string
    category: string
    area: string
    timing: string
    tone: 'Neutral' | 'Friendly' | 'Technical'
    extras: { propertyType?: string; accessNotes?: string; hasPets?: string; preferredContact?: string }
  }
) {
  const base = tidy(text)
  const bits: string[] = []

  if (ctx.tone === 'Technical') {
    if (base) bits.push(base.endsWith('.') ? base : base + '.')
  } else {
    const lead = ctx.tone === 'Friendly' ? 'Looking for help' : 'Need assistance'
    const where = ctx.area ? ` in the ${ctx.area.toLowerCase()}` : ''
    const about = ctx.category ? ` with a ${ctx.category.toLowerCase()} issue` : ' with an issue'
    bits.push(`${lead}${where}${about}. ${base ? capitalize(base) + (base.endsWith('.') ? '' : '.') : ''}`)
  }

  if (ctx.timing) {
    bits.push(ctx.timing === 'ASAP' ? 'Hoping to get someone out as soon as possible.' : ctx.timing === 'This week' ? 'Ideally this week.' : 'Timing is flexible.')
  }

  const extras: string[] = []
  if (ctx.extras?.accessNotes) extras.push(`Access: ${ctx.extras.accessNotes}`)
  if (ctx.extras?.propertyType) extras.push(`Property: ${ctx.extras.propertyType}`)
  if (ctx.extras?.hasPets) extras.push(`Pets: ${ctx.extras.hasPets}`)
  if (ctx.extras?.preferredContact) extras.push(`Contact: ${ctx.extras.preferredContact}`)
  if (extras.length) bits.push(extras.join(' • '))

  return bits.filter(Boolean).join(' ')
}

function tidy(s: string) {
  const t = (s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(ac|hvac)\b/gi, (m) => m.toUpperCase())
    .replace(/\b(eletrical|eletricity)\b/gi, 'electrical')
  return t
}
function capitalize(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}
