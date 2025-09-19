'use client';
export const dynamic = 'force-dynamic';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '../../../utils/supabase-browser';
const supabase = supabaseBrowser();
import { useApp } from '../../../lib/state';
import AiRewriteBubble from '../../../components/AiRewriteBubble';
import TagInput from '../../../components/TagInput';

/* ====================== Types ====================== */
type Day = 'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun'
type Hours = Record<Day, { enabled: boolean; open: string; close: string }>
type RateType = 'Hourly'|'Flat'|'Visit fee'
type PaymentMethod = 'Visa'|'Mastercard'|'AmEx'|'Discover'|'ACH'|'Cash'|'Check'|'Zelle'|'Venmo'
type StepId = 'basics'|'area'|'credentials'|'pricing'|'review'
type Mode = 'wizard'|'full'

type FormDataT = {
  name: string; email: string; phone: string
  businessName: string; website: string
  yearsInBusiness: string; teamSize: string; about: string
  baseZip: string; radiusMiles: number; extraZips: string[]
  categories: string[]; specialties: string[]
  emergency: boolean; hours: Hours
  licenseNumber: string; licenseType: string; licenseState: string; licenseExpires: string
  insuranceCarrier: string; insurancePolicy: string; insuranceExpires: string
  rateType: RateType; hourlyRate: string; flatMin: string; visitFee: string; freeEstimates: boolean
  payments: PaymentMethod[]
  instagram: string; facebook: string; yelp: string; google: string
  logo: File | null; portfolio: File[]; licenseProof: File | null; insuranceProof: File | null
  agreeTerms: boolean; certifyAccuracy: boolean
}

/* ====================== Constants ====================== */
const STEPS: StepId[] = ['basics','area','credentials','pricing','review']
const TITLES: Record<StepId,string> = {
  basics: 'Business basics',
  area: 'Service area & categories',
  credentials: 'Credentials',
  pricing: 'Pricing & availability',
  review: 'Preview & submit'
}
const DAYS: Day[] = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const EMPTY_HOURS: Hours = DAYS.reduce((acc, d) => {
  (acc as any)[d] = { enabled: ['Mon','Tue','Wed','Thu','Fri'].includes(d), open:'09:00', close:'17:00' }
  return acc
}, {} as Hours)
const PMETHODS: PaymentMethod[] = ['Visa','Mastercard','AmEx','Discover','ACH','Cash','Check','Zelle','Venmo']
const DRAFT_KEY = 'housecall.contractor.signup.v1'

/** Wrapper to satisfy Next 14 requirement: useSearchParams must be inside Suspense */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientInner />
    </Suspense>
  );
}

/* ====================== Page ====================== */
function ClientInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const { state, addToast } = useApp()

  const categories = useMemo<string[]>(
    () => Array.isArray(state.categories) && state.categories.length
      ? state.categories
      : ['Electrical','HVAC','Roofing','Plumbing','Carpentry','General','Landscaping'],
    [state.categories]
  )

  const [form, setForm] = useState<FormDataT>(()=>({
    name:'', email:'', phone:'',
    businessName:'', website:'',
    yearsInBusiness:'', teamSize:'', about:'',
    baseZip:'', radiusMiles:10, extraZips:[],
    categories:[], specialties:[],
    emergency:false, hours:{...EMPTY_HOURS},
    licenseNumber:'', licenseType:'', licenseState:'', licenseExpires:'',
    insuranceCarrier:'', insurancePolicy:'', insuranceExpires:'',
    rateType:'Hourly', hourlyRate:'', flatMin:'', visitFee:'', freeEstimates:true,
    payments:['Visa','Mastercard','AmEx'],
    instagram:'', facebook:'', yelp:'', google:'',
    logo:null, portfolio:[], licenseProof:null, insuranceProof:null,
    agreeTerms:false, certifyAccuracy:false,
  }))

  const [mode, setMode] = useState<Mode>('wizard')
  const [step, setStep] = useState<StepId>('basics')
  const idx = STEPS.indexOf(step)
  const canBack = idx > 0
  const canNext = idx < STEPS.length - 1

  const [errors, setErrors] = useState<Record<string,string>>({})
  const [busy, setBusy] = useState(false)

  /* ---------------- Draft load + URL sync ---------------- */
  useEffect(()=>{
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        setForm(f=>({ ...f, ...migrateDraft(saved), logo:null, portfolio:[], licenseProof:null, insuranceProof:null }))
        addToast?.('Draft restored', 'info')
      }
    } catch {}
    const s = sp.get('step') as StepId | null
    if (s && STEPS.includes(s)) setStep(s)
    const m = sp.get('mode') as Mode | null
    if (m==='full' || m==='wizard') setMode(m)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(()=>{
    const qs = new URLSearchParams(sp.toString())
    qs.set('step', step)
    qs.set('mode', mode)
    router.replace(`?${qs.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mode])

  /* ---------------- Helpers ---------------- */
  function set<K extends keyof FormDataT>(k: K, v: FormDataT[K]) { setForm(prev => ({ ...prev, [k]: v })) }
  function setHours(day: Day, patch: Partial<Hours[Day]>) {
    setForm(prev => ({ ...prev, hours: { ...prev.hours, [day]: { ...prev.hours[day], ...patch } } }))
  }
  function toggle<T>(arr: T[], v: T): T[] { return arr.includes(v) ? arr.filter(x=>x!==v) : [...arr, v] }
  const zip5 = (z:string) => /^\d{5}$/.test(z)

  /* ---------------- Validation ---------------- */
  const validateBasics = (f: FormDataT) => {
    const e: Record<string,string> = {}
    if (!f.name.trim()) e.name = 'Required'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Valid email required'
    if (!/^[-+() 0-9]{7,}$/.test(f.phone)) e.phone = 'Phone looks off'
    if (!f.businessName.trim()) e.businessName = 'Required'
    return e
  }
  const validateArea = (f: FormDataT) => {
    const e: Record<string,string> = {}
    if (!zip5(f.baseZip)) e.baseZip = '5-digit ZIP'
    if (!f.categories.length) e.categories = 'Pick at least one'
    const bad = f.extraZips.find(z=>!zip5(z))
    if (bad) e.extraZips = `Invalid ZIP: ${bad}`
    return e
  }
  const validateCredentials = (f: FormDataT) => {
    const e: Record<string,string> = {}
    if (!f.licenseNumber.trim()) e.licenseNumber = 'Required'
    if (!f.licenseState.trim()) e.licenseState = 'Required'
    if (!f.licenseExpires.trim()) e.licenseExpires = 'Required'
    if (!f.insuranceCarrier.trim()) e.insuranceCarrier = 'Required'
    if (!f.insurancePolicy.trim()) e.insurancePolicy = 'Required'
    if (!f.insuranceExpires.trim()) e.insuranceExpires = 'Required'
    if (!f.licenseProof) e.licenseProof = 'Upload required'
    if (!f.insuranceProof) e.insuranceProof = 'Upload required'
    const today = new Date().toISOString().slice(0,10)
    if (f.licenseExpires && f.licenseExpires < today) e.licenseExpires = 'License expired'
    if (f.insuranceExpires && f.insuranceExpires < today) e.insuranceExpires = 'Policy expired'
    return e
  }
  const validatePricing = (f: FormDataT) => {
    const e: Record<string,string> = {}
    const openAny = DAYS.some(d=>f.hours[d].enabled)
    if (!openAny) e.hours = 'Enable at least one day'
    if (f.rateType==='Hourly' && !f.hourlyRate.trim()) e.hourlyRate = 'Add hourly rate'
    if (f.rateType==='Flat'   && !f.flatMin.trim())   e.flatMin   = 'Add a typical flat amount'
    if (f.rateType==='Visit fee' && !f.visitFee.trim()) e.visitFee = 'Add a visit/diagnostic fee'
    return e
  }
  const validateReview = (f: FormDataT) => {
    const e: Record<string,string> = {}
    if (!f.agreeTerms) e.agreeTerms = 'You must accept'
    if (!f.certifyAccuracy) e.certifyAccuracy = 'Please certify'
    return e
  }
  const validators: Record<StepId,(f:FormDataT)=>Record<string,string>> = {
    basics: validateBasics, area: validateArea, credentials: validateCredentials, pricing: validatePricing, review: validateReview
  }
  function validateAll(f: FormDataT) {
    return { ...validateBasics(f), ...validateArea(f), ...validateCredentials(f), ...validatePricing(f), ...validateReview(f) }
  }
  function scrollToFirstError(eobj: Record<string,string>) {
    const first = Object.keys(eobj)[0]
    if (!first) return
    document.querySelector<HTMLElement>(`[data-err="${first}"]`)?.scrollIntoView({ behavior:'smooth', block:'center' })
  }

  /* ---------------- Draft actions (kept for restore only) ---------------- */
  function saveDraft() {
    try {
      const { logo, portfolio, licenseProof, insuranceProof, ...json } = form
      localStorage.setItem(DRAFT_KEY, JSON.stringify(json))
      addToast?.('Draft saved', 'success')
    } catch {}
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY) } catch {} }

  /* ---------------- Submit ---------------- */
  async function submitAll(e?: React.FormEvent) {
    e?.preventDefault()

    const eobj = validateAll(form)
    setErrors(eobj)
    if (Object.keys(eobj).length) {
      console.log('[contractor] validation errors', Object.keys(eobj))
      scrollToFirstError(eobj)
      return
    }

    setBusy(true)
    console.log('[contractor] submit start')

    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'portfolio' && Array.isArray(v)) {
          (v as File[]).forEach((f, i) =>
            fd.append('portfolio', f, f.name || `photo-${i}.jpg`)
          )
        } else if (v instanceof File && v) {
          fd.append(k, v, v.name)
        } else if (typeof v === 'object' && v !== null) {
          fd.append(k, JSON.stringify(v))
        } else if (v != null) {
          fd.append(k, String(v))
        }
      })

      // --- FIXED: avoid `never` inference on session ---
      const { data: sessionRes, error: sessErr } = await supabase.auth.getSession()
      console.log('[contractor] sessionErr?', sessErr || null)
      const token = (sessionRes as any)?.session?.access_token as string | undefined
      if (!token) {
        addToast?.('Please sign in first.', 'error')
        router.push('/sign-in')
        setBusy(false)
        return
      }
      console.log('[contractor] user', (sessionRes as any)?.session?.user?.id ?? '(no user)')

      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      console.log('[contractor] response status', res.status)

      let out: any = null
      try { out = await res.json() } catch {}

      if (!res.ok) {
        const msg = out?.error || `Server error (${res.status})`
        throw new Error(msg)
      }

      clearDraft?.()
      addToast?.(
        out?.status === 'approved'
          ? 'Profile submitted and auto-approved!'
          : 'Thanks! Your contractor profile is under review.',
        'success'
      )
      router.push('/dashboard')
    } catch (err: any) {
      console.error('[contractor] submit error', err)
      addToast?.(err?.message || 'Could not submit right now.', 'error')
    } finally {
      setBusy(false)
    }
  }

  /* ---------------- UI helpers ---------------- */
  function nextStep() {
    const eobj = validators[step](form); setErrors(eobj)
    if (Object.keys(eobj).length) { scrollToFirstError(eobj); return }
    if (idx < STEPS.length-1) setStep(STEPS[idx+1])
  }
  const prevStep = () => { if (idx>0) setStep(STEPS[idx-1]) }
  const badgeErr = (key: string) => errors[key] ? 'ring-rose-300 border-rose-300' : ''
  const hintErr  = (key: string) => errors[key] ? <div className="mt-1 text-[11px] text-rose-600">{errors[key]}</div> : null
  const SectionTitle = ({children}:{children:React.ReactNode}) => (<div className="text-sm font-semibold text-ink dark:text-white mb-2">{children}</div>)

  // theme-aware selection styles (green on consumer, blue on pro)
  const selectedPillStyle = {
    background: 'rgba(var(--color-primary), 0.10)',
    color: 'rgb(var(--color-primary))',
    borderColor: 'rgba(var(--color-primary), 0.25)'
  } as React.CSSProperties

  /* ====================== Render ====================== */
  return (
    <section className="section">
      <div className="container-max">
        {/* Header row */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Become an Rushr Pro</h1>
            <p className="text-slate-600 mt-1">Tell us about your business so homeowners can hire you with confidence.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-outline" onClick={()=> setMode(m => m==='wizard' ? 'full' : 'wizard')}>
              {mode==='wizard' ? 'Switch to full form' : 'Switch to wizard'}
            </button>
          </div>
        </div>

        {/* Progress (wizard) */}
        {mode==='wizard' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>{TITLES[step]}</span>
              <span>Step {idx+1} of {STEPS.length}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full transition-[width]"
                style={{ width: `${(idx)/(STEPS.length-1)*100}%`, backgroundColor: 'rgb(var(--color-primary))' }}
              />
            </div>
          </div>
        )}

        {/* ------------- WIZARD ------------- */}
        {mode==='wizard' && (
          <form onSubmit={submitAll} className="card p-5">
            {step==='basics' && (
              <div className="grid md:grid-cols-2 gap-3">
                <div data-err="name">
                  <label className="label">Your name *</label>
                  <input className={`input ${badgeErr('name')}`} value={form.name} onChange={e=>set('name', e.target.value)} placeholder="Alex Contractor" />
                  {hintErr('name')}
                </div>
                <div data-err="email">
                  <label className="label">Email *</label>
                  <input className={`input ${badgeErr('email')}`} value={form.email} onChange={e=>set('email', e.target.value)} placeholder="you@company.com" />
                  {hintErr('email')}
                </div>
                <div data-err="phone">
                  <label className="label">Phone *</label>
                  <input className={`input ${badgeErr('phone')}`} value={form.phone} onChange={e=>set('phone', e.target.value)} placeholder="(555) 555-5555" />
                  {hintErr('phone')}
                </div>
                <div data-err="businessName">
                  <label className="label">Business name *</label>
                  <input className={`input ${badgeErr('businessName')}`} value={form.businessName} onChange={e=>set('businessName', e.target.value)} placeholder="BrightSpark Electric LLC" />
                  {hintErr('businessName')}
                </div>

                <div>
                  <label className="label">Website</label>
                  <input className="input" value={form.website} onChange={e=>set('website', e.target.value)} placeholder="https://example.com" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Years in business</label>
                    <input className="input" value={form.yearsInBusiness} onChange={e=>set('yearsInBusiness', e.target.value)} placeholder="e.g., 8" inputMode="numeric" />
                  </div>
                  <div>
                    <label className="label">Team size</label>
                    <input className="input" value={form.teamSize} onChange={e=>set('teamSize', e.target.value)} placeholder="e.g., 3" inputMode="numeric" />
                  </div>
                </div>

                {/* About + AI bubble */}
                <div className="md:col-span-2">
                  <label className="label">About your business</label>
                  <div className="input relative p-0 overflow-hidden">
                    <textarea
                      className="block w-full min-h-[120px] resize-vertical bg-transparent outline-none px-3 py-2 pr-16"
                      value={form.about}
                      onChange={(e)=>set('about', e.target.value)}
                      placeholder="What you specialize in, what customers love, service guarantees, etc."
                    />
                    <AiRewriteBubble
                      value={form.about}
                      onApply={(next)=>set('about', next)}
                      context={{ businessName: form.businessName, categories: form.categories, specialties: form.specialties, years: form.yearsInBusiness }}
                    />
                  </div>
                </div>

                {/* Logo with remove */}
                <div>
                  <label className="label">Logo (optional)</label>
                  {!form.logo ? (
                    <label className="btn btn-outline cursor-pointer">
                      Upload
                      <input type="file" className="hidden" accept="image/*" onChange={e=> set('logo', e.target.files?.[0] ?? null)} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={URL.createObjectURL(form.logo)} alt="logo preview" className="h-16 w-16 object-contain rounded border border-slate-200 bg-white" />
                      <button type="button" className="btn btn-outline" onClick={()=>set('logo', null)}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step==='area' && (
              <div className="grid md:grid-cols-2 gap-3">
                <div data-err="baseZip">
                  <label className="label">Base ZIP *</label>
                  <input className={`input ${badgeErr('baseZip')}`} value={form.baseZip} onChange={e=>set('baseZip', e.target.value)} placeholder="11215" inputMode="numeric" />
                  {hintErr('baseZip')}
                </div>
                <div>
                  <label className="label">Coverage radius (miles)</label>
                  <select className="input" value={form.radiusMiles} onChange={e=>set('radiusMiles', Number(e.target.value))}>
                    {[5,10,15,25,50].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2" data-err="extraZips">
                  <label className="label">Additional ZIPs</label>
                  <TagInput
                    values={form.extraZips}
                    onChange={(vals)=>set('extraZips', vals)}
                    placeholder="Type ZIP and press Enter (or comma)…"
                    allowComma
                    allowEnter
                    inputMode="numeric"
                    validate={(v)=> /^\d{5}$/.test(v) ? null : '5-digit ZIP'}
                  />
                  {hintErr('extraZips')}
                </div>

                <div data-err="categories" className="md:col-span-2">
                  <label className="label">Categories you serve *</label>
                  <div className={`rounded-xl border p-2 ${errors.categories ? 'border-rose-300 ring-rose-300' : 'border-slate-200'}`}>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(c=>(
                        <button
                          key={c}
                          type="button"
                          onClick={()=> set('categories', toggle(form.categories, c))}
                          className="px-3 py-1.5 rounded-lg border text-sm hover:border-slate-300"
                          style={form.categories.includes(c) ? selectedPillStyle : undefined}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hintErr('categories')}
                </div>

                <div className="md:col-span-2">
                  <label className="label">Specialties</label>
                  <TagInput
                    values={form.specialties}
                    onChange={(vals)=>set('specialties', vals)}
                    placeholder="Add specialties (Enter or comma)…"
                    allowComma
                    allowEnter
                  />
                </div>
              </div>
            )}

            {step==='credentials' && (
              <div className="grid md:grid-cols-2 gap-3">
                <div data-err="licenseNumber">
                  <label className="label">License # *</label>
                  <input className={`input ${badgeErr('licenseNumber')}`} value={form.licenseNumber} onChange={e=>set('licenseNumber', e.target.value)} placeholder="123456" />
                  {hintErr('licenseNumber')}
                </div>
                <div>
                  <label className="label">License type</label>
                  <input className="input" value={form.licenseType} onChange={e=>set('licenseType', e.target.value)} placeholder="Master electrician, Home improvement contractor…" />
                </div>
                <div data-err="licenseState">
                  <label className="label">Issuing state/authority *</label>
                  <input className={`input ${badgeErr('licenseState')}`} value={form.licenseState} onChange={e=>set('licenseState', e.target.value)} placeholder="NY (DOB), NJ (DCA), etc." />
                  {hintErr('licenseState')}
                </div>
                <div data-err="licenseExpires">
                  <label className="label">License expires *</label>
                  <input type="date" className={`input ${badgeErr('licenseExpires')}`} value={form.licenseExpires} onChange={e=>set('licenseExpires', e.target.value)} />
                  {hintErr('licenseExpires')}
                </div>

                <div data-err="insuranceCarrier">
                  <label className="label">Insurance carrier *</label>
                  <input className={`input ${badgeErr('insuranceCarrier')}`} value={form.insuranceCarrier} onChange={e=>set('insuranceCarrier', e.target.value)} placeholder="ABC Insurance" />
                  {hintErr('insuranceCarrier')}
                </div>
                <div data-err="insurancePolicy">
                  <label className="label">Policy # *</label>
                  <input className={`input ${badgeErr('insurancePolicy')}`} value={form.insurancePolicy} onChange={e=>set('insurancePolicy', e.target.value)} placeholder="POL-1234567" />
                  {hintErr('insurancePolicy')}
                </div>
                <div data-err="insuranceExpires">
                  <label className="label">Policy expires *</label>
                  <input type="date" className={`input ${badgeErr('insuranceExpires')}`} value={form.insuranceExpires} onChange={e=>set('insuranceExpires', e.target.value)} />
                  {hintErr('insuranceExpires')}
                </div>

                {/* License proof */}
                <div data-err="licenseProof">
                  <label className="label">Upload license proof (PDF/JPG)</label>
                  {!form.licenseProof ? (
                    <label className="btn btn-outline cursor-pointer">
                      Upload
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={e=> set('licenseProof', e.target.files?.[0] ?? null)} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate max-w-[240px]">{form.licenseProof.name}</span>
                      <button type="button" className="btn btn-outline" onClick={()=>set('licenseProof', null)}>Remove</button>
                    </div>
                  )}
                  {hintErr('licenseProof')}
                </div>

                {/* Insurance proof */}
                <div data-err="insuranceProof">
                  <label className="label">Upload insurance COI (PDF/JPG)</label>
                  {!form.insuranceProof ? (
                    <label className="btn btn-outline cursor-pointer">
                      Upload
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={e=> set('insuranceProof', e.target.files?.[0] ?? null)} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate max-w-[240px]">{form.insuranceProof.name}</span>
                      <button type="button" className="btn btn-outline" onClick={()=>set('insuranceProof', null)}>Remove</button>
                    </div>
                  )}
                  {hintErr('insuranceProof')}
                </div>
              </div>
            )}

            {step==='pricing' && (
              <div className="space-y-4">
                <div>
                  <SectionTitle>Pricing</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {(['Hourly','Flat','Visit fee'] as RateType[]).map(rt=>(
                      <button
                        key={rt}
                        type="button"
                        onClick={()=>set('rateType', rt)}
                        className="px-3 py-1.5 rounded-lg border text-sm hover:border-slate-300"
                        style={form.rateType===rt ? selectedPillStyle : undefined}
                      >
                        {rt}
                      </button>
                    ))}
                  </div>

                  {form.rateType==='Hourly' && (
                    <div className="mt-2" data-err="hourlyRate">
                      <label className="label">Hourly rate *</label>
                      <input className={`input ${badgeErr('hourlyRate')}`} value={form.hourlyRate} onChange={e=>set('hourlyRate', e.target.value)} placeholder="$120" />
                      {hintErr('hourlyRate')}
                    </div>
                  )}
                  {form.rateType==='Flat' && (
                    <div className="mt-2" data-err="flatMin">
                      <label className="label">Typical flat price *</label>
                      <input className={`input ${badgeErr('flatMin')}`} value={form.flatMin} onChange={e=>set('flatMin', e.target.value)} placeholder="$600" />
                      {hintErr('flatMin')}
                    </div>
                  )}
                  {form.rateType==='Visit fee' && (
                    <div className="mt-2" data-err="visitFee">
                      <label className="label">Visit/diagnostic fee *</label>
                      <input className={`input ${badgeErr('visitFee')}`} value={form.visitFee} onChange={e=>set('visitFee', e.target.value)} placeholder="$89" />
                      {hintErr('visitFee')}
                    </div>
                  )}

                  <label className="mt-2 flex items-center gap-2">
                    <input type="checkbox" checked={form.freeEstimates} onChange={e=>set('freeEstimates', e.target.checked)} />
                    Offer free estimates
                  </label>
                </div>

                <div>
                  <SectionTitle>Availability & Hours</SectionTitle>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.emergency} onChange={e=>set('emergency', e.target.checked)} />
                    Offer emergency service (after-hours / same-day)
                  </label>

                  <div className={`mt-3 rounded-xl border p-3 ${badgeErr('hours')}`} data-err="hours">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {DAYS.map((d)=>(
                        <div key={d} className="flex items-center gap-2">
                          <label className="w-10">{d}</label>
                          <input type="checkbox" checked={form.hours[d].enabled} onChange={e=>setHours(d, { enabled: e.target.checked })} />
                          <input className="input flex-1" value={form.hours[d].open} onChange={e=>setHours(d, { open: e.target.value })} placeholder="09:00" />
                          <span>–</span>
                          <input className="input flex-1" value={form.hours[d].close} onChange={e=>setHours(d, { close: e.target.value })} placeholder="17:00" />
                        </div>
                      ))}
                    </div>
                    {hintErr('hours')}
                    <div className="mt-1 text-xs text-slate-500">Use 24-hour format (e.g., 08:30, 17:00). Uncheck to mark a day as closed.</div>
                  </div>
                </div>

                <div>
                  <SectionTitle>Links & Portfolio</SectionTitle>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Instagram</label>
                      <input className="input" value={form.instagram} onChange={e=>set('instagram', e.target.value)} placeholder="https://instagram.com/yourbiz" />
                    </div>
                    <div>
                      <label className="label">Facebook</label>
                      <input className="input" value={form.facebook} onChange={e=>set('facebook', e.target.value)} placeholder="https://facebook.com/yourbiz" />
                    </div>
                    <div>
                      <label className="label">Yelp</label>
                      <input className="input" value={form.yelp} onChange={e=>set('yelp', e.target.value)} placeholder="https://yelp.com/biz/yourbiz" />
                    </div>
                    <div>
                      <label className="label">Google profile</label>
                      <input className="input" value={form.google} onChange={e=>set('google', e.target.value)} placeholder="https://g.page/yourbiz" />
                    </div>
                  </div>

                  {/* Portfolio with remove */}
                  <div className="mt-3">
                    <label className="label">Portfolio photos (optional)</label>
                    <div className="flex items-center gap-2">
                      <label className="btn btn-outline cursor-pointer">
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={e=>{
                            const f = e.target.files ? Array.from(e.target.files) : []
                            set('portfolio', [...form.portfolio, ...f].slice(0, 12))
                          }}
                        />
                      </label>
                      <span className="text-xs text-slate-500">Up to 12</span>
                    </div>
                    {form.portfolio.length>0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                        {form.portfolio.map((f,i)=>(
                          <div key={i} className="relative">
                            <img src={URL.createObjectURL(f)} alt="" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                            <button
                              type="button"
                              className="absolute top-1 right-1 rounded bg-white/90 px-1.5 text-xs shadow"
                              onClick={()=>{
                                const next = [...form.portfolio]; next.splice(i,1); set('portfolio', next)
                              }}
                              aria-label="Remove photo"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step==='review' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-[1fr,260px] gap-4">
                  {/* Summary */}
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-sm font-semibold mb-2">Quick preview</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li><b>{form.businessName || 'Your business name'}</b> — {form.categories.join(', ') || 'No categories selected'}</li>
                      <li>{form.baseZip ? `Base ZIP ${form.baseZip}` : 'No base ZIP'} • Radius {form.radiusMiles} mi</li>
                      <li>Extra ZIPs: {form.extraZips.length ? form.extraZips.join(', ') : '—'}</li>
                      <li>License #{form.licenseNumber || '—'} • Ins: {form.insuranceCarrier || '—'}</li>
                      <li>Rate: {form.rateType} {form.rateType==='Hourly' ? form.hourlyRate : form.rateType==='Flat' ? form.flatMin : form.visitFee}</li>
                      <li>Specialties: {form.specialties.length ? form.specialties.join(', ') : '—'}</li>
                    </ul>
                  </div>
                  {/* Logo on right */}
                  <div className="rounded-xl border border-slate-200 p-3 flex items-center justify-center">
                    {form.logo
                      ? <img src={URL.createObjectURL(form.logo)} alt="Logo preview" className="max-h-32 max-w-[220px] object-contain" />
                      : <div
                          className="h-28 w-28 rounded-full grid place-items-center text-2xl font-semibold"
                          style={{ background: 'rgba(var(--color-primary), 0.12)', color: 'rgb(var(--color-primary))' }}
                        >
                          {monogram(form.businessName || 'Rushr Pro')}
                        </div>
                    }
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="flex items-start gap-2 text-sm" data-err="agreeTerms">
                    <input type="checkbox" checked={form.agreeTerms} onChange={e=>set('agreeTerms', e.target.checked)} />
                    <span>
                      I agree to the <a className="link-primary underline" href="/terms" target="_blank">Terms</a> and <a className="link-primary underline" href="/privacy" target="_blank">Privacy Policy</a>.
                      {errors.agreeTerms && <span className="block text-rose-600 text-xs">You must accept.</span>}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-sm" data-err="certifyAccuracy">
                    <input type="checkbox" checked={form.certifyAccuracy} onChange={e=>set('certifyAccuracy', e.target.checked)} />
                    <span>
                      I certify the information is accurate and I’m authorized to represent this business.
                      {errors.certifyAccuracy && <span className="block text-rose-600 text-xs">Please certify.</span>}
                    </span>
                  </label>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={busy || !form.agreeTerms || !form.certifyAccuracy}
                  >
                    {busy ? 'Submitting…' : 'Submit for review'}
                  </button>
                </div>
              </div>
            )}

            {/* Wizard footer nav */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {canBack && <button type="button" className="btn btn-outline" onClick={prevStep}>Back</button>}
              {canNext && <button type="button" className="btn-primary" onClick={nextStep}>Next</button>}
              <span className="text-xs text-slate-500 ml-auto">We typically review new pros within 1–2 business days.</span>
            </div>
          </form>
        )}

        {/* ------------- FULL FORM (accordion) ------------- */}
        {mode==='full' && (
          <form onSubmit={submitAll} className="card p-5 space-y-6">
            {/* Basics */}
            <details open className="rounded-xl border border-slate-200">
              <summary className="cursor-pointer list-none px-4 py-3 font-semibold">Business basics</summary>
              <div className="p-4 grid md:grid-cols-2 gap-3">
                <div data-err="name">
                  <label className="label">Your name *</label>
                  <input className={`input ${badgeErr('name')}`} value={form.name} onChange={e=>set('name', e.target.value)} placeholder="Alex Contractor" />
                  {hintErr('name')}
                </div>
                <div data-err="email">
                  <label className="label">Email *</label>
                  <input className={`input ${badgeErr('email')}`} value={form.email} onChange={e=>set('email', e.target.value)} placeholder="you@company.com" />
                  {hintErr('email')}
                </div>
                <div data-err="phone">
                  <label className="label">Phone *</label>
                  <input className={`input ${badgeErr('phone')}`} value={form.phone} onChange={e=>set('phone', e.target.value)} placeholder="(555) 555-5555" />
                  {hintErr('phone')}
                </div>
                <div data-err="businessName">
                  <label className="label">Business name *</label>
                  <input className={`input ${badgeErr('businessName')}`} value={form.businessName} onChange={e=>set('businessName', e.target.value)} placeholder="BrightSpark Electric LLC" />
                  {hintErr('businessName')}
                </div>

                {/* About */}
                <div className="md:col-span-2">
                  <label className="label">About your business</label>
                  <div className="input relative p-0 overflow-hidden">
                    <textarea
                      className="block w-full min-h-[120px] resize-vertical bg-transparent outline-none px-3 py-2 pr-16"
                      value={form.about}
                      onChange={(e)=>set('about', e.target.value)}
                      placeholder="What you specialize in, what customers love, service guarantees, etc."
                    />
                    <AiRewriteBubble
                      value={form.about}
                      onApply={(next)=>set('about', next)}
                      context={{ businessName: form.businessName, categories: form.categories, specialties: form.specialties, years: form.yearsInBusiness }}
                    />
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <label className="label">Logo (optional)</label>
                  {!form.logo ? (
                    <label className="btn btn-outline cursor-pointer">
                      Upload
                      <input type="file" className="hidden" accept="image/*" onChange={e=> set('logo', e.target.files?.[0] ?? null)} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={URL.createObjectURL(form.logo)} alt="logo preview" className="h-16 w-16 object-contain rounded border border-slate-200 bg-white" />
                      <button type="button" className="btn btn-outline" onClick={()=>set('logo', null)}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
            </details>

            {/* Area */}
            <details className="rounded-xl border border-slate-200">
              <summary className="cursor-pointer list-none px-4 py-3 font-semibold">Service area & categories</summary>
              <div className="p-4 grid md:grid-cols-2 gap-3">
                <div data-err="baseZip">
                  <label className="label">Base ZIP *</label>
                  <input className={`input ${badgeErr('baseZip')}`} value={form.baseZip} onChange={e=>set('baseZip', e.target.value)} placeholder="11215" inputMode="numeric" />
                  {hintErr('baseZip')}
                </div>
                <div>
                  <label className="label">Coverage radius (miles)</label>
                  <select className="input" value={form.radiusMiles} onChange={e=>set('radiusMiles', Number(e.target.value))}>
                    {[5,10,15,25,50].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2" data-err="extraZips">
                  <label className="label">Additional ZIPs</label>
                  <TagInput
                    values={form.extraZips}
                    onChange={(vals)=>set('extraZips', vals)}
                    placeholder="Type ZIP and press Enter (or comma)…"
                    allowComma
                    allowEnter
                    inputMode="numeric"
                    validate={(v)=> /^\d{5}$/.test(v) ? null : '5-digit ZIP'}
                  />
                  {hintErr('extraZips')}
                </div>

                <div data-err="categories" className="md:col-span-2">
                  <label className="label">Categories you serve *</label>
                  <div className={`rounded-xl border p-2 ${errors.categories ? 'border-rose-300 ring-rose-300' : 'border-slate-200'}`}>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(c=>(
                        <button
                          key={c}
                          type="button"
                          onClick={()=> set('categories', toggle(form.categories, c))}
                          className="px-3 py-1.5 rounded-lg border text-sm hover:border-slate-300"
                          style={form.categories.includes(c) ? selectedPillStyle : undefined}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hintErr('categories')}
                </div>

                <div className="md:col-span-2">
                  <label className="label">Specialties</label>
                  <TagInput
                    values={form.specialties}
                    onChange={(vals)=>set('specialties', vals)}
                    placeholder="Add specialties (Enter or comma)…"
                    allowComma
                    allowEnter
                  />
                </div>
              </div>
            </details>

            {/* Credentials */}
            <details className="rounded-xl border border-slate-200">
              <summary className="cursor-pointer list-none px-4 py-3 font-semibold">Credentials</summary>
              <div className="p-4 grid md:grid-cols-2 gap-3">
                <div data-err="licenseNumber">
                  <label className="label">License # *</label>
                  <input className={`input ${badgeErr('licenseNumber')}`} value={form.licenseNumber} onChange={e=>set('licenseNumber', e.target.value)} placeholder="123456" />
                  {hintErr('licenseNumber')}
                </div>
                <div>
                  <label className="label">License type</label>
                  <input className="input" value={form.licenseType} onChange={e=>set('licenseType', e.target.value)} placeholder="Master electrician, Home improvement contractor…" />
                </div>
                <div data-err="licenseState">
                  <label className="label">Issuing state/authority *</label>
                  <input className={`input ${badgeErr('licenseState')}`} value={form.licenseState} onChange={e=>set('licenseState', e.target.value)} placeholder="NY (DOB), NJ (DCA), etc." />
                  {hintErr('licenseState')}
                </div>
                <div data-err="licenseExpires">
                  <label className="label">License expires *</label>
                  <input type="date" className={`input ${badgeErr('licenseExpires')}`} value={form.licenseExpires} onChange={e=>set('licenseExpires', e.target.value)} />
                  {hintErr('licenseExpires')}
                </div>

                <div data-err="insuranceCarrier">
                  <label className="label">Insurance carrier *</label>
                  <input className={`input ${badgeErr('insuranceCarrier')}`} value={form.insuranceCarrier} onChange={e=>set('insuranceCarrier', e.target.value)} placeholder="ABC Insurance" />
                  {hintErr('insuranceCarrier')}
                </div>
                <div data-err="insurancePolicy">
                  <label className="label">Policy # *</label>
                  <input className={`input ${badgeErr('insurancePolicy')}`} value={form.insurancePolicy} onChange={e=>set('insurancePolicy', e.target.value)} placeholder="POL-1234567" />
                  {hintErr('insurancePolicy')}
                </div>
                <div data-err="insuranceExpires">
                  <label className="label">Policy expires *</label>
                  <input type="date" className={`input ${badgeErr('insuranceExpires')}`} value={form.insuranceExpires} onChange={e=>set('insuranceExpires', e.target.value)} />
                  {hintErr('insuranceExpires')}
                </div>

                {/* License proof */}
                <div data-err="licenseProof">
                  <label className="label">Upload license proof (PDF/JPG)</label>
                  {!form.licenseProof ? (
                    <label className="btn btn-outline cursor-pointer">
                      Upload
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={e=> set('licenseProof', e.target.files?.[0] ?? null)} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate max-w-[240px]">{form.licenseProof.name}</span>
                      <button type="button" className="btn btn-outline" onClick={()=>set('licenseProof', null)}>Remove</button>
                    </div>
                  )}
                  {hintErr('licenseProof')}
                </div>

                {/* Insurance proof */}
                <div data-err="insuranceProof">
                  <label className="label">Upload insurance COI (PDF/JPG)</label>
                  {!form.insuranceProof ? (
                    <label className="btn btn-outline cursor-pointer">
                      Upload
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={e=> set('insuranceProof', e.target.files?.[0] ?? null)} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate max-w-[240px]">{form.insuranceProof.name}</span>
                      <button type="button" className="btn btn-outline" onClick={()=>set('insuranceProof', null)}>Remove</button>
                    </div>
                  )}
                  {hintErr('insuranceProof')}
                </div>
              </div>
            </details>

            {/* Review & submit */}
            <details open className="rounded-xl border border-slate-200">
              <summary className="cursor-pointer list-none px-4 py-3 font-semibold">Preview & submit</summary>
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-[1fr,260px] gap-4">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-sm font-semibold mb-2">Quick preview</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li><b>{form.businessName || 'Your business name'}</b> — {form.categories.join(', ') || 'No categories selected'}</li>
                      <li>{form.baseZip ? `Base ZIP ${form.baseZip}` : 'No base ZIP'} • Radius {form.radiusMiles} mi</li>
                      <li>Extra ZIPs: {form.extraZips.length ? form.extraZips.join(', ') : '—'}</li>
                      <li>License #{form.licenseNumber || '—'} • Ins: {form.insuranceCarrier || '—'}</li>
                      <li>Rate: {form.rateType} {form.rateType==='Hourly' ? form.hourlyRate : form.rateType==='Flat' ? form.flatMin : form.visitFee}</li>
                      <li>Specialties: {form.specialties.length ? form.specialties.join(', ') : '—'}</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 flex items-center justify-center">
                    {form.logo
                      ? <img src={URL.createObjectURL(form.logo)} alt="Logo preview" className="max-h-32 max-w-[220px] object-contain" />
                      : <div
                          className="h-28 w-28 rounded-full grid place-items-center text-2xl font-semibold"
                          style={{ background: 'rgba(var(--color-primary), 0.12)', color: 'rgb(var(--color-primary))' }}
                        >
                          {monogram(form.businessName || 'Rushr Pro')}
                        </div>
                    }
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="flex items-start gap-2 text-sm" data-err="agreeTerms">
                    <input type="checkbox" checked={form.agreeTerms} onChange={e=>set('agreeTerms', e.target.checked)} />
                    <span>
                      I agree to the <a className="link-primary underline" href="/terms" target="_blank">Terms</a> and <a className="link-primary underline" href="/privacy" target="_blank">Privacy Policy</a>.
                      {errors.agreeTerms && <span className="block text-rose-600 text-xs">You must accept.</span>}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-sm" data-err="certifyAccuracy">
                    <input type="checkbox" checked={form.certifyAccuracy} onChange={e=>set('certifyAccuracy', e.target.checked)} />
                    <span>
                      I certify the information is accurate and I’m authorized to represent this business.
                      {errors.certifyAccuracy && <span className="block text-rose-600 text-xs">Please certify.</span>}
                    </span>
                  </label>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={busy || !form.agreeTerms || !form.certifyAccuracy}
                  >
                    {busy ? 'Submitting…' : 'Submit for review'}
                  </button>
                </div>
              </div>
            </details>
          </form>
        )}
      </div>
    </section>
  )
}

/* ====================== Utils ====================== */
function migrateDraft(v: any): Partial<FormDataT> {
  if (!v || typeof v !== 'object') return {}
  const asArr = (x: any): string[] =>
    Array.isArray(x) ? x.map(String) :
    typeof x === 'string' ? x.split(',').map(s=>s.trim()).filter(Boolean) : []

  return {
    ...v,
    extraZips: asArr(v.extraZips),
    specialties: asArr(v.specialties),
    categories: asArr(v.categories),
    payments: asArr(v.payments),
  }
}

function monogram(s: string) {
  const parts = String(s).trim().split(/\s+/).slice(0,2)
  if (!parts.length) return 'A'
  return parts.map(p=>p[0]?.toUpperCase() || '').join('')
}
