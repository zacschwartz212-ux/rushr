'use client'

import React, { useMemo, useState } from 'react'
import {
  Check,
  Clock,
  MapPin,
  Phone,
  Shield,
  Star,
  X,
  AlertTriangle,
  Info,
  Users,
  Zap,
  Wind,
  Hammer,
  Droplets,
  Wrench,
  Leaf,
  User,
} from 'lucide-react'

/** Map placeholder — no external deps */
function MapStub() {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(700px_240px_at_20%_-10%,rgba(16,185,129,0.10),transparent_60%),linear-gradient(180deg,#f8fafc_0%,#ffffff_60%)]" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="font-medium text-slate-900">Live map coming soon</div>
          <p className="mt-1 text-sm text-slate-500">Real-time tracking and ETA once a pro accepts.</p>
        </div>
      </div>
    </div>
  )
}

/** Types & mock data */
type Contractor = {
  id: string
  name: string
  rating: number
  jobs: number
  distanceKm: number
  etaMin: number
  trades: string[]
  insured: boolean
  backgroundChecked: boolean
  activeNow: boolean
}

const MOCK: Contractor[] = [
  { id: 'c1', name: 'Atlas Plumbing & Heating', rating: 4.9, jobs: 312, distanceKm: 1.2, etaMin: 14, trades: ['Water leak', 'Burst pipe', 'Gas'], insured: true, backgroundChecked: true, activeNow: true },
  { id: 'c2', name: 'BrightSpark Electrical', rating: 4.8, jobs: 201, distanceKm: 2.0, etaMin: 18, trades: ['Power outage', 'Breaker'], insured: true, backgroundChecked: true, activeNow: true },
  { id: 'c3', name: 'Shield Roofing', rating: 4.7, jobs: 167, distanceKm: 3.4, etaMin: 24, trades: ['Roof leak', 'Tarp'], insured: true, backgroundChecked: true, activeNow: true },
  { id: 'c4', name: 'Metro Restoration', rating: 4.6, jobs: 451, distanceKm: 4.1, etaMin: 27, trades: ['Flood', 'Mold'], insured: true, backgroundChecked: true, activeNow: false },
]

/** UI atoms */
function Stars({ value }: { value: number }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < full
              ? 'fill-yellow-400 stroke-yellow-400'
              : half && i === full
              ? 'fill-yellow-300 stroke-yellow-300'
              : 'stroke-slate-300'
          }`}
        />
      ))}
    </div>
  )
}

function SafetyNotice() {
  return (
    <div className="card p-4 flex items-start gap-3">
      <Shield className="h-5 w-5 text-emerald-600" />
      <div className="text-sm text-slate-700">
        Shut off water or power if it is safe. Keep children and pets away from hazards. If you smell gas, call your utility and 911.
      </div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>
}

function Field({
  label,
  required,
  children,
  helper,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  helper?: string
}) {
  return (
    <div>
      <label className={`label ${required ? 'required' : ''}`}>{label}</label>
      {children}
      {helper ? <div className="mt-2 text-xs text-slate-500">{helper}</div> : null}
    </div>
  )
}

function ContractorCard({
  c,
  selected,
  onPick,
}: {
  c: Contractor
  selected?: boolean
  onPick?: () => void
}) {
  return (
    <div className={`card p-4 flex items-center justify-between gap-4 ${selected ? 'ring-2 ring-emerald-500' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-slate-100 text-slate-700">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold text-slate-900">{c.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Stars value={c.rating} />
            <span>•</span>
            <span>{c.jobs} jobs</span>
            <span>•</span>
            <span>{c.distanceKm.toFixed(1)} km</span>
            {c.insured && <span className="chip-primary">Insured</span>}
            {c.backgroundChecked && <span className="chip-primary">Background check</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {c.trades.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {c.activeNow ? (
          <div className="text-right">
            <div className="text-xs text-slate-500">Typical arrival</div>
            <div className="font-medium text-slate-900 flex items-center gap-1">
              <Clock className="h-4 w-4" /> {c.etaMin} min
            </div>
          </div>
        ) : (
          <div className="text-right text-xs text-slate-500">Currently unavailable</div>
        )}
        <button className="btn px-3 py-1.5" onClick={onPick} disabled={!c.activeNow}>
          Select
        </button>
      </div>
    </div>
  )
}

/** Simple confirm modal */
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  body: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <div>
            <div className="font-semibold text-slate-900">{title}</div>
            <p className="mt-1 text-sm text-slate-600">{body}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="btn px-3 py-1.5" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary px-3 py-1.5" onClick={onConfirm}>
            Send now
          </button>
        </div>
      </div>
    </div>
  )
}

/** Emergency categories — exactly as specified */
const CATS = [
  { key: 'electrical', label: 'Electrical', icon: Zap },
  { key: 'hvac',       label: 'HVAC',       icon: Wind },
  { key: 'roofing',    label: 'Roofing',    icon: Hammer },
  { key: 'plumbing',   label: 'Plumbing',   icon: Droplets },
  { key: 'carpentry',  label: 'Carpentry',  icon: Hammer },
  { key: 'landscaping',label: 'Landscaping',icon: Leaf },
  { key: 'general',    label: 'General',    icon: Wrench },
] as const

/** Lightweight skeleton (used while sending) */
function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-200" />
              <div>
                <div className="h-3 w-40 rounded bg-slate-200" />
                <div className="mt-2 flex gap-2">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-3 w-10 rounded bg-slate-200" />
                  <div className="h-3 w-14 rounded bg-slate-200" />
                </div>
              </div>
            </div>
            <div className="h-8 w-20 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Thin, indeterminate top bar shown while sending */
function TopProgress({ active }: { active: boolean }) {
  return (
    <div className={`fixed inset-x-0 top-0 z-[70] ${active ? '' : 'hidden'}`}>
      <div className="h-0.5 w-full overflow-hidden bg-transparent">
        <div className="h-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite] bg-emerald-600" />
      </div>
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

/** 911 safety banner */
function EmergencyBanner() {
  return (
    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4" />
        <span><strong>If this is an immediate danger or life-threatening emergency, call 911.</strong></span>
      </div>
    </div>
  )
}

/** Category pill button */
function CatPill({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm flex items-center gap-2 ${
        active ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  )
}

export default function Page() {
  // Form state
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState<typeof CATS[number]['key']>('plumbing')
  const [issueTitle, setIssueTitle] = useState('') // user-defined title
  const [details, setDetails] = useState('')
  const [photos, setPhotos] = useState<File[]>([])

  // Flow state
  const [sendAll, setSendAll] = useState(true)
  const [picked, setPicked] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Pro list filters
  const [onlyActive, setOnlyActive] = useState(true)
  const [sortBy, setSortBy] = useState<'eta' | 'distance' | 'rating'>('eta')

  const filteredNearby = useMemo(() => {
    const base = onlyActive ? MOCK.filter(m => m.activeNow) : MOCK
    const sorted = [...base].sort((a, b) =>
      sortBy === 'eta' ? a.etaMin - b.etaMin : sortBy === 'distance' ? a.distanceKm - b.distanceKm : b.rating - a.rating
    )
    return sorted
  }, [onlyActive, sortBy])

  const selectedContractor = useMemo(() => MOCK.find((m) => m.id === picked) || null, [picked])

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setPhotos((prev) => [...prev, ...files].slice(0, 6))
  }
  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
  }

  function submit() {
    setConfirmOpen(true)
  }
  function actuallySend() {
    setConfirmOpen(false)
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 900)
  }

  const Tracker = () => (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto mb-4 w-full max-w-6xl px-4">
        <div className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-[0_8px_30px_rgba(2,6,23,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-500">First available pro</div>
                <div className="font-medium text-slate-900">On the way • ETA 12 min</div>
              </div>
            </div>
            <button className="btn px-3 py-1.5">Details</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TopProgress active={sending} />

      <div className="container-max section">
        <ConfirmModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={actuallySend}
          title="Send emergency request"
          body={
            sendAll
              ? 'We will alert active nearby pros now. The first acceptance will be shown with live ETA.'
              : selectedContractor
              ? `We will notify ${selectedContractor.name} now.`
              : 'Select a contractor or choose Blast to nearby.'
          }
        />

        {/* 911 banner */}
        <EmergencyBanner />

        {/* Header row (unchanged layout) */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Emergency help</h1>
            <p className="mt-1 text-sm text-slate-600">Fast response from verified contractors near you.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="chip-primary">
              <Check className="h-4 w-4" /> Verified pros
            </div>
            <div className="chip-primary">
              <Clock className="h-4 w-4" /> Live ETA
            </div>
            <div className="chip-primary">
              <Shield className="h-4 w-4" /> Insurance check
            </div>
          </div>
        </div>

        {sent && (
          <div className="mb-6 card border-emerald-200 p-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="font-medium text-slate-900">Request sent</div>
                <p className="mt-1 text-sm text-slate-600">
                  Nearby emergency contractors received your job. You will see the first acceptance here with live arrival time.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Left column: form */}
          <div className="space-y-4 lg:col-span-2">
            <div className="card p-4 space-y-4">
              <Field label="Your location" required helper="Location sharing improves ETA and pricing.">
                <div className="flex gap-2">
                  <input
                    className="input h-10 flex-1"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <button
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50 flex items-center gap-1"
                    onClick={() => setAddress('123 Main St, New York, NY')}
                    title="Autofill from profile"
                  >
                    <User className="h-3.5 w-3.5" /> Autofill
                  </button>
                  <button
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50 flex items-center gap-1"
                    onClick={() => setAddress('Using current location')}
                    title="Use current location"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Current
                  </button>
                </div>
              </Field>

              <Field label="Contact number" required>
                <div className="flex gap-2">
                  <input
                    className="input h-10 flex-1"
                    placeholder="Mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50 flex items-center gap-1"
                    onClick={() => setPhone('(212) 555-0136')}
                    title="Autofill from profile"
                  >
                    <User className="h-3.5 w-3.5" /> Autofill
                  </button>
                </div>
              </Field>

              {/* Emergency Type — categories ONLY, no subs; user writes a title */}
              <Field label="Emergency category" required>
                <div className="flex flex-wrap gap-2">
                  {CATS.map(({ key, label, icon: Icon }) => (
                    <CatPill
                      key={key}
                      active={category === key}
                      onClick={() => setCategory(key)}
                      icon={Icon}
                    >
                      {label}
                    </CatPill>
                  ))}
                </div>
              </Field>

              <Field label="Issue title" required helper="Short and clear. Example: “Leak under kitchen sink”">
                <input
                  className="input h-10"
                  placeholder="Give this a short title"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                />
              </Field>

              <Field label="Details for the pro">
                <textarea
                  className="input min-h-[110px]"
                  placeholder="Brief description"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </Field>

              <div>
                <label className="label">Photos or short video</label>
                <input type="file" multiple accept="image/*,video/*" onChange={onUpload} />
                {!!photos.length && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {photos.map((f, i) => (
                      <div key={i} className="relative">
                        <video className="h-24 w-full rounded-lg object-cover" src={URL.createObjectURL(f)} />
                        <button className="btn absolute right-1 top-1 px-2 py-1 text-xs" onClick={() => removePhoto(i)}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SafetyNotice />
            </div>

            {/* Send mode (unchanged position) */}
            <div className="card p-4">
              <label className="label">Send mode</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button className={`btn ${sendAll ? 'ring-2 ring-emerald-500' : ''}`} onClick={() => setSendAll(true)}>
                  Blast to nearby
                </button>
                <button className={`btn ${!sendAll ? 'ring-2 ring-emerald-500' : ''}`} onClick={() => setSendAll(false)}>
                  Let me pick
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Blast notifies active pros in range. Pick lets you choose a single pro first.</p>
            </div>

            <div className="card p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-slate-500" />
              <div className="text-sm text-slate-600">
                Typical emergency rates are time-and-materials with a call-out fee. You approve pricing in the app before work starts.
              </div>
            </div>
          </div>

          {/* Right column: map and pros */}
          <div className="space-y-4 lg:col-span-3">
            <div className="card p-3">
              <MapStub />
            </div>

            {/* Filters on pros */}
            <div className="flex flex-wrap items-center justify-between">
              <div className="text-sm text-slate-600">Active emergency pros nearby</div>
              <div className="flex items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-1 text-slate-600 whitespace-nowrap">
  <input
    type="checkbox"
    className="accent-emerald-600"
    checked={onlyActive}
    onChange={(e) => setOnlyActive(e.target.checked)}
  />
  <span className="text-sm">Active now</span>
</label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input h-9 py-1 px-2 text-sm w-[160px]"
                >
                  <option value="eta">Sort: ETA</option>
                  <option value="distance">Sort: Distance</option>
                  <option value="rating">Sort: Rating</option>
                </select>
              </div>
            </div>

            {/* List or skeleton (flourish) */}
            {sending ? (
              <ListSkeleton rows={3} />
            ) : (
              <div className="space-y-3">
                {(sendAll ? filteredNearby : MOCK).map((c) => (
                  <ContractorCard key={c.id} c={c} selected={picked === c.id} onPick={() => setPicked(c.id)} />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="h-4 w-4" /> Your number is shared only after a pro accepts.
              </div>
              <button className="btn-primary px-6" disabled={sending || (!sendAll && !picked)} onClick={submit}>
                {sending ? 'Sending…' : sendAll ? 'Send to nearby' : selectedContractor ? `Send to ${selectedContractor.name}` : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {sent ? <Tracker /> : null}
      </div>
    </>
  )
}
