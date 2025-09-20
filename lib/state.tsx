'use client'

import * as React from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/* ======================= Types ======================= */
export type UserRole = 'HOMEOWNER' | 'CONTRACTOR' | null

type Message = { id: string; from: string; body: string; read?: boolean }
type Signal = {
  id: string
  title?: string
  summary?: string
  details?: string
  status?: string
  type?: string
  category?: string
  city?: string
  county?: string
  jurisdiction?: string
  zip?: string
  date?: string
  timestamp?: string | number
  scope?: string
}
type Contractor = {
  id: string
  name: string
  services: string[]
  badges: string[]
  bio?: string
  rating?: number
  housecallScore?: number
  city?: string
  zip?: string
  serviceZips: string[]
  loc?: { lat: number; lng: number }
}
type Testimonial = { name: string; company?: string; quote: string }

/* ===== Added types for Jobs, Toasts, Templates ===== */
export type Job = {
  id: string
  title: string
  category: string
  zip: string
  description: string
  status: 'Open' | 'In review' | 'Closed'
  urgencyScore: number
  budgetType: 'Fixed' | 'Range' | 'Hourly'
  budgetMin?: number
  budgetMax?: number
  postedAt?: string
}

type Toast = {
  id: string
  msg: string
  type?: 'info' | 'error' | 'success'
  ttl?: number
}

type Template = { id: string; category: string; name: string; body: string }

export type AppState = {
  user: { signedIn: boolean; name: string; role: UserRole; signalsActive?: boolean }
  ui: { authOpen: boolean; signUpOpen: boolean }
  messages: Message[]
  jobs: Job[]
  contractorProfile: { templates: Template[] }
  toasts: Toast[]
  signals: Signal[]
  contractors: Contractor[]
  categories: string[]
  testimonials: Testimonial[]
}

export type AppContextValue = {
  state: AppState
  openAuth: () => void
  closeAuth: () => void
  openSignUp: () => void
  closeSignUp: () => void
  signIn: (opts?: { name?: string; role?: UserRole; signalsActive?: boolean }) => void
  signOut: () => void
  submitBid: (args: { jobId: string; contractorId: string; price: number; type: 'Fixed' | 'Hourly'; message?: string }) => void
  addToast: (msg: string, type?: 'info' | 'error' | 'success') => void
  removeToast: (id: string) => void
  markMessagesRead: (count: number) => void
  unreadCount: number
}

/* ======================= Context ======================= */
const AppCtx = createContext<AppContextValue | null>(null)

/* Optional non-hook accessor for server utilities (no reactivity) */
let __latestCtx: AppContextValue | null = null
export function getApp(): AppContextValue | null {
  return __latestCtx
}

/* ======================= Provider ======================= */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    user: { signedIn: false, name: 'Guest', role: null, signalsActive: false },
    ui: { authOpen: false, signUpOpen: false },

    messages: [
      { id: 'm1', from: 'Lindsey', body: 'Can you swing by tomorrow between 10–12?', read: false },
      { id: 'm2', from: 'Marco (HVAC Pro)', body: 'I can source the condenser by Friday and install same-day.', read: false },
      { id: 'm3', from: 'Priya', body: 'Thanks! The roof leak is near the chimney, adding photos.', read: true },
    ],

    jobs: STATIC_JOBS,
    contractorProfile: {
      templates: [
        { id: 't1', category: 'HVAC', name: 'AC service quote', body: 'Hi, we can service your AC this week. Est. $${price}.' },
        { id: 't2', category: 'Roofing', name: 'Leak repair', body: 'We can patch and reseal the leak. Est. $${price}.' },
        { id: 't3', category: 'Electrical', name: 'GFCI replacement', body: 'We can replace the GFCI and test. Est. $${price}.' },
      ]
    },
    toasts: [],

    // IMPORTANT: static demo data to avoid SSR/CSR mismatches
    signals: STATIC_SIGNALS,
    contractors: STATIC_CONTRACTORS,
    categories: STATIC_CATEGORIES,
    testimonials: STATIC_TESTIMONIALS,
  }))

  /* ===== UI actions ===== */
  const openAuth   = useCallback(()=> setState(s=>({ ...s, ui:{...s.ui, authOpen:true  } })), [])
  const closeAuth  = useCallback(()=> setState(s=>({ ...s, ui:{...s.ui, authOpen:false } })), [])
  const openSignUp = useCallback(()=> setState(s=>({ ...s, ui:{...s.ui, signUpOpen:true } })), [])
  const closeSignUp= useCallback(()=> setState(s=>({ ...s, ui:{...s.ui, signUpOpen:false} })), [])

  /* ===== Auth session ===== */
  const addToast = useCallback((msg:string, type: 'info'|'error'|'success' = 'info')=>{
    const id = String(Date.now())
    setState(s => ({ ...s, toasts: [...s.toasts, { id, msg, type, ttl: 3000 }] }))
    if (process.env.NODE_ENV !== 'production') console.log('[toast]', type, msg)
  }, [])
  const removeToast = useCallback((id:string)=>{
    setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }))
  }, [])

  const signIn = useCallback((opts?: { name?: string; role?: UserRole; signalsActive?: boolean })=>{
    setState(s=>({
      ...s,
      user: {
        signedIn: true,
        name: opts?.name ?? 'Alex Contractor',
        role: opts?.role ?? 'CONTRACTOR',
        signalsActive: opts?.signalsActive ?? s.user.signalsActive ?? true,
      },
      ui: { ...s.ui, authOpen:false, signUpOpen:false },
    }))
    addToast('Signed in.', 'success')
  }, [addToast])

  const signOut = useCallback(()=>{
    setState(s=>({ ...s, user:{ signedIn:false, name:'Guest', role:null, signalsActive:false } }))
    addToast('Signed out.', 'info')
  }, [addToast])

  /* ===== Jobs / Bids ===== */
  const submitBid = useCallback((args: {
    jobId: string; contractorId: string; price: number; type: 'Fixed' | 'Hourly'; message?: string
  }) => {
    setState(s => ({
      ...s,
      messages: [
        { id: `m${s.messages.length + 1}`, from: 'You', body: `Bid ${args.type} $${args.price} on job ${args.jobId}`, read: false },
        ...s.messages
      ]
    }))
    addToast('Bid sent', 'success')
  }, [addToast])

  /* ===== Messages ===== */
  const unreadCount = useMemo(()=> state.messages.filter(m=>!m.read).length, [state.messages])
  const markMessagesRead = useCallback((count:number)=>{
    setState(s=>{
      if(count<=0) return s
      let left = count
      const msgs = s.messages.map(m=>{
        if(!m.read && left>0){ left--; return {...m, read:true} }
        return m
      })
      return { ...s, messages: msgs }
    })
  }, [])

  const value: AppContextValue = {
    state,
    openAuth, closeAuth, openSignUp, closeSignUp,
    signIn, signOut,
    submitBid,
    addToast, removeToast,
    markMessagesRead, unreadCount,
  }

  // keep latest for getApp() consumers
  __latestCtx = value

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

/* ======================= SSR-tolerant consumer ======================= */
/** Benign snapshot used only on the server when no provider exists yet. */
const __fallbackApp: AppContextValue = {
  state: {
    user: { signedIn: false, name: '', role: 'homeowner' as any },
    ui: { authOpen: false, signUpOpen: false },
    messages: [],
    jobs: [],
    contractorProfile: { templates: [] },
    toasts: [],
    signals: [],
    contractors: [],
    categories: [],
    testimonials: [],
  },
  openAuth: () => {},
  closeAuth: () => {},
  openSignUp: () => {},
  closeSignUp: () => {},
  signIn: () => {},
  signOut: () => {},
  submitBid: () => {},
  addToast: () => {},
  removeToast: () => {},
  markMessagesRead: () => {},
  unreadCount: 0,
}

/**
 * During SSG/SSR, if a component imports this hook but renders outside the provider,
 * we return a harmless snapshot instead of throwing—so prerender succeeds.
 * In the browser, still throw to catch genuine misuse.
 */
export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx)
  if (!ctx) {
    if (typeof window === 'undefined') return __fallbackApp
    throw new Error(
      "useApp must be used inside a Client Component wrapped by <AppProvider>."
    )
  }
  return ctx
}

/* ======================= Static demo data ======================= */
const STATIC_CATEGORIES: string[] = [
  'Electrical','HVAC','Roofing','Plumbing','Carpentry','General','Landscaping',
  'Locksmith','Garage Door','Glass Repair','Appliance Repair','Handyman',
  'Fencing','Gas','Snow Removal','Security','Water Damage','Drywall'
]

const STATIC_CONTRACTORS: Contractor[] = [
  {
    id: 'c1',
    name: 'BrightSpark Electric',
    services: ['Electrical'],
    badges: ['Licensed', 'Insured'],
    bio: 'Residential service upgrades, panel work, EV chargers.',
    rating: 4.8,
    housecallScore: 95,
    city: 'Brooklyn',
    zip: '11215',
    serviceZips: ['11215', '11205', '10001'],
    loc: { lat: 40.6673, lng: -73.9850 },
  },
  {
    id: 'c2',
    name: 'CoolFlow HVAC',
    services: ['HVAC'],
    badges: ['Licensed', 'EPA Certified'],
    bio: 'Mini-splits, condenser replacement, seasonal maintenance.',
    rating: 4.6,
    housecallScore: 91,
    city: 'Manhattan',
    zip: '10001',
    serviceZips: ['10001', '10017', '10018'],
    loc: { lat: 40.7506, lng: -73.9972 },
  },
  {
    id: 'c3',
    name: 'Peak Roofing Co.',
    services: ['Roofing'],
    badges: ['Licensed', 'Insured'],
    bio: 'Asphalt shingles, flashing repair, leak diagnostics.',
    rating: 4.7,
    housecallScore: 89,
    city: 'Queens',
    zip: '11355',
    serviceZips: ['11205', '11201', '10002'],
    loc: { lat: 40.6976, lng: -73.9713 },
  },
  {
    id: 'c4',
    name: 'Neighborhood Plumbing',
    services: ['Plumbing'],
    badges: ['Licensed'],
    bio: 'Repairs, repipes, venting corrections, water heaters.',
    rating: 4.5,
    housecallScore: 86,
    city: 'Manhattan',
    zip: '10002',
    serviceZips: ['10002', '10017', '11201'],
    loc: { lat: 40.7170, lng: -73.9890 },
  },
  {
    id: 'c5',
    name: 'HandyWorks',
    services: ['General', 'Carpentry'],
    badges: ['Insured'],
    bio: 'Small remodels, trim carpentry, doors & windows.',
    rating: 4.3,
    housecallScore: 82,
    city: 'Brooklyn',
    zip: '11201',
    serviceZips: ['11201', '11205', '10018'],
    loc: { lat: 40.6955, lng: -73.9890 },
  },
  {
    id: 'c6',
    name: 'GreenScape Pros',
    services: ['Landscaping'],
    badges: [],
    bio: 'Maintenance, plantings, seasonal cleanup.',
    rating: 4.1,
    housecallScore: 78,
    city: 'Brooklyn',
    zip: '11205',
    serviceZips: ['11205', '11215', '10001'],
    loc: { lat: 40.6976, lng: -73.9713 },
  },
]

const STATIC_SIGNALS: Signal[] = [
  {
    id:'s1',
    title:'Electrical inspection failed – panel clearance',
    status:'Failed', type:'Inspection', category:'Electrical',
    city:'Brooklyn', jurisdiction:'NYC DOB', zip:'11215',
    date:'2025-08-17',
    scope:'Service panel clearance inadequate; needs relocation or clearance adjustment.',
    details:'Inspector noted obstructions within 36" clearance. Re-evaluate landing space.',
  },
  {
    id:'s2',
    title:'Roofing violation – missing flashing',
    status:'New', type:'Violation', category:'Roofing',
    city:'Queens', jurisdiction:'NYC DOB', zip:'11355',
    date:'2025-08-16',
    scope:'Chimney flashing degraded; moisture ingress suspected.',
    details:'Water stains in attic near chimney. Recommend flashing + sealing.',
  },
  {
    id:'s3',
    title:'HVAC permit issued – condenser replacement',
    status:'Issued', type:'Permit', category:'HVAC',
    city:'Jersey City', jurisdiction:'JC Building Dept', zip:'07302',
    date:'2025-08-15',
    scope:'3-ton condenser replacement; line set inspection required.',
    details:'Homeowner requested quieter unit; pad and disconnect update needed.',
  },
  {
    id:'s4',
    title:'Electrical permit applied – service upgrade',
    status:'Applied', type:'Permit', category:'Electrical',
    city:'Brooklyn', jurisdiction:'NYC DOB', zip:'11206',
    date:'2025-08-14',
    scope:'100A to 200A service upgrade; new mast & meter pan.',
    details:'Coordination with utility for cut-over; schedule rough inspection.',
  },
  {
    id:'s5',
    title:'Plumbing inspection failed – venting',
    status:'Failed', type:'Inspection', category:'Plumbing',
    city:'Manhattan', jurisdiction:'NYC DOB', zip:'10009',
    date:'2025-08-13',
    scope:'Improper trap arm length; venting correction required.',
    details:'Potential S-trap; recommend AAV or re-run vent per code.',
  },
  {
    id:'s6',
    title:'Roofing violation – exposed fasteners',
    status:'New', type:'Violation', category:'Roofing',
    city:'Queens', jurisdiction:'NYC DOB', zip:'11432',
    date:'2025-08-12',
    scope:'Exposed fasteners near ridge; seal and replace damaged shingles.',
    details:'Wind uplift risk; recommend sealing and cap replacement.',
  },
]

const STATIC_TESTIMONIALS: Testimonial[] = [
  { name:'Jordan P.', company:'Peak Roofing', quote:'Signals put us in front of homeowners before they started calling around. Closed two jobs the first week.' },
  { name:'Sam R.', company:'BrightSpark Electric', quote:'The rule builder is spot on—failed inspections in our zips only. Way less noise than marketplaces.' },
  { name:'Alyssa K.', company:'CoolFlow HVAC', quote:'Instant alerts + quick bid templates = more booked service calls. Worth it.' },
]

/* ===== Demo Jobs ===== */
const STATIC_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'No-cool AC, possible capacitor',
    category: 'HVAC',
    zip: '11215',
    description: 'Condenser fan not spinning. Likely capacitor or motor.',
    status: 'Open',
    urgencyScore: 8,
    budgetType: 'Range',
    budgetMin: 150,
    budgetMax: 350,
    postedAt: '2025-08-10',
  },
  {
    id: 'j2',
    title: 'Roof leak near chimney',
    category: 'Roofing',
    zip: '11355',
    description: 'Small leak during heavy rain. Needs inspection and seal.',
    status: 'Open',
    urgencyScore: 7,
    budgetType: 'Fixed',
    budgetMin: 900,
    postedAt: '2025-08-12',
  },
  {
    id: 'j3',
    title: 'Replace bathroom GFCI',
    category: 'Electrical',
    zip: '10025',
    description: 'Old GFCI popped. Please replace and test.',
    status: 'In review',
    urgencyScore: 6,
    budgetType: 'Hourly',
    budgetMin: 120,
    postedAt: '2025-08-14',
  },
]
