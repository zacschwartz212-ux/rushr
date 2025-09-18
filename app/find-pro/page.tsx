// app/find-pro/page.tsx
// Two-row header. Hours of Operation = multi-select popover.
// In-map Draw mode (no modals). Buttons live under the legend.
'use client'

import 'leaflet/dist/leaflet.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../../lib/state'

type LatLng = [number, number]
type HoursTag =
  | 'open_now'
  | 'open_today'
  | 'weekends'
  | 'evenings'
  | 'early_morning'
  | '24_7'

/* Keep in sync with map legend */
const CAT_EMOJI: Record<string, string> = {
  Electrical: '⚡',
  HVAC: '❄️',
  Roofing: '🏠',
  Plumbing: '🚿',
  Carpentry: '🪚',
  General: '🧰',
  Landscaping: '🌿',
}

/* Optional ZIP presets (fast, no geocoding) */
const ZIP_COORDS: Record<string, LatLng> = {
  '10001': [40.7506, -73.9972],
  '10002': [40.717, -73.989],
  '10017': [40.7522, -73.9725],
  '10018': [40.7557, -73.9925],
  '11201': [40.6955, -73.989],
  '11205': [40.6976, -73.9713],
  '11215': [40.6673, -73.985],
}

export default function FindProPage() {
  const { state } = useApp()
  const allContractors: any[] = Array.isArray((state as any)?.contractors)
    ? (state as any).contractors
    : []

  // Top bar — line 1
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  // multi-select services
  const [services, setServices] = useState<string[]>([])

  // Top bar — line 2 (filters)
  const [radius, setRadius] = useState(15) // miles
  const [minRating, setMinRating] = useState(0)
  const [minYears, setMinYears] = useState(0) // 0,3,5,10
  const [emergencyOnly, setEmergencyOnly] = useState(false) // primary pill
  const [hoursTags, setHoursTags] = useState<HoursTag[]>([]) // multi-select

  // Map + ZIP
  const [center, setCenter] = useState<LatLng>([40.7128, -74.006])
  const [zip, setZip] = useState('')

  // Results sort (BELOW the map)
  const [sort, setSort] = useState<'best' | 'distance' | 'rating' | 'experience'>('best')

  // In-map drawn area (GeoJSON)
  const [areaGeojson, setAreaGeojson] = useState<any | null>(null)
  const hasArea = !!areaGeojson

  // Debounce query so typing is smooth
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 140)
    return () => clearTimeout(t)
  }, [query])

  // Auto-center when a known 5-digit ZIP is typed
  useEffect(() => {
    const z = zip.trim()
    if (z.length === 5 && ZIP_COORDS[z]) setCenter(ZIP_COORDS[z])
  }, [zip])

  const activeCenter = center

  // Distance helper
  function distMiles(a: LatLng, b: LatLng) {
    const toRad = (d: number) => (d * Math.PI) / 180
    const R = 3958.8
    const dLat = toRad(b[0] - a[0])
    const dLng = toRad(b[1] - a[1])
    const s1 = Math.sin(dLat / 2)
    const s2 = Math.sin(dLng / 2)
    const t = s1 * s1 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * s2 * s2
    const c = 2 * Math.atan2(Math.sqrt(t), Math.sqrt(1 - t))
    return R * c
  }

  // Hours matching — STRICT when selected: require affirmative data to match
  function matchesHours(c: any): boolean {
    if (!hoursTags.length) return true
    const h = c?.hours || {}
    const weekend = h.weekend === true || c?.weekendAvailable === true
    const evenings = h.evenings === true || c?.eveningAvailable === true
    const early = h.early === true || c?.earlyMorning === true
    const openNow = h.openNow === true || c?.openNow === true
    const openToday = h.openToday === true || c?.openToday === true
    const is247 = c?.twentyFourSeven === true || c?.['24_7'] === true

    for (const tag of hoursTags) {
      if (tag === 'weekends' && !weekend) return false
      if (tag === 'evenings' && !evenings) return false
      if (tag === 'early_morning' && !early) return false
      if (tag === 'open_now' && !openNow) return false
      if (tag === 'open_today' && !openToday) return false
      if (tag === '24_7' && !is247) return false
    }
    return true
  }

  // Minimal GeoJSON-ish types
  type SimplePolygon = { type: 'Polygon'; coordinates: number[][][] }
  type SimpleMultiPolygon = { type: 'MultiPolygon'; coordinates: number[][][][] }

  // Ray-casting point-in-ring, pt = [lng,lat]
  function pointInRing(pt: [number, number], ring: number[][]) {
    let inside = false
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]
      const intersect =
        (yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
    return inside
  }
  function pointInPolygonLngLat(
    ptLngLat: [number, number],
    poly: SimplePolygon | SimpleMultiPolygon
  ) {
    if (poly.type === 'Polygon') {
      const [outer, ...holes] = poly.coordinates
      if (!pointInRing(ptLngLat, outer)) return false
      for (const h of holes) if (pointInRing(ptLngLat, h)) return false
      return true
    } else {
      for (const polygon of poly.coordinates) {
        const [outer, ...holes] = polygon
        if (pointInRing(ptLngLat, outer)) {
          let inHole = false
          for (const h of holes) if (pointInRing(ptLngLat, h)) inHole = true
          if (!inHole) return true
        }
      }
      return false
    }
  }

  // Extract polygon (supports Feature/FeatureCollection/Polygon/MultiPolygon)
  function normalizeGeoPolygon(
    gj: any
  ): SimplePolygon | SimpleMultiPolygon | null {
    if (!gj) return null
    const g =
      gj.type === 'Feature'
        ? gj.geometry
        : gj.type === 'FeatureCollection'
        ? gj.features?.[0]?.geometry ?? null
        : gj
    if (!g) return null
    if (g.type === 'Polygon' || g.type === 'MultiPolygon')
      return g as SimplePolygon | SimpleMultiPolygon
    return null
  }

  // Filter + sort
  const filtered = useMemo(() => {
    const q = debouncedQuery
    const areaGeom = normalizeGeoPolygon(areaGeojson)

    let items = allContractors
      .map((c) => ({ ...c }))
      .filter((c) => {
        const name = String(c?.name || '').toLowerCase()
        const city = String(c?.city || '').toLowerCase()
        const svc: string[] = Array.isArray(c?.services) ? c.services : []
        const rating = Number(c?.rating) || 0
        const years = Number(c?.years) || 0

        // multi-service include (match ANY selected)
        if (services.length && !svc.some((s) => services.includes(s))) return false

        if (q) {
          const hay = `${name} ${city} ${svc.join(' ')}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        if (minRating > 0 && rating < minRating) return false
        if (minYears > 0 && years < minYears) return false

        if (emergencyOnly) {
          const emerg =
            c?.emergency === true ||
            c?.emergencyService === true ||
            c?.['24_7'] === true
          if (!emerg) return false
        }
        if (!matchesHours(c)) return false

        const lat = Number(c?.loc?.lat)
        const lng = Number(c?.loc?.lng)
        if (!isFinite(lat) || !isFinite(lng)) return false

        const d = distMiles(activeCenter, [lat, lng])
        ;(c as any).__distance = d
        if (d > radius) return false

        if (areaGeom) {
          const inside = pointInPolygonLngLat([lng, lat], areaGeom)
          if (!inside) return false
        }
        return true
      })

    if (sort === 'distance') {
      items.sort((a, b) => (a.__distance ?? 1e9) - (b.__distance ?? 1e9))
    } else if (sort === 'rating') {
      items.sort((a, b) => (Number(b?.rating) || 0) - (Number(a?.rating) || 0))
    } else if (sort === 'experience') {
      items.sort((a, b) => (Number(b?.years) || 0) - (Number(a?.years) || 0))
    } else {
      items.sort((a, b) => {
        const r = (Number(b?.rating) || 0) - (Number(a?.rating) || 0)
        if (r !== 0) return r
        return (a.__distance ?? 1e9) - (b.__distance ?? 1e9)
      })
    }

    return items
  }, [
    allContractors,
    debouncedQuery,
    services,
    minRating,
    minYears,
    emergencyOnly,
    hoursTags,
    radius,
    sort,
    activeCenter,
    areaGeojson,
  ])

  function resetAll() {
    setQuery('')
    setServices([])
    setRadius(15)
    setMinRating(0)
    setMinYears(0)
    setEmergencyOnly(false)
    setHoursTags([])
    setZip('')
    // keep polygon until user clears via map "Clear All"
  }

  // Options list for Services
  const serviceOptions = Object.keys(CAT_EMOJI)

  return (
    <>
      <section className="mx-auto max-w-6xl space-y-3 px-3 py-3">
        {/* TOP BAR — TWO ROWS (unchanged look) */}
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
          {/* LINE 1 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[220px] grow">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, city, or service"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-[13px] outline-none transition focus:border-emerald-400"
              />
            </div>

            {/* Services dropdown with checkboxes */}
            <details className="relative">
              <summary className="inline-flex select-none items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] leading-none text-slate-800 hover:bg-slate-50 cursor-pointer min-w-[220px]">
                <span className="truncate">
                  {services.length ? `Services: ${services.join(', ')}` : 'Services: Any'}
                </span>
                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 opacity-60">
                  <path d="M5.5 7.5l4.5 4 4.5-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>

              {/* click-away to close */}
              <button
                type="button"
                aria-hidden="true"
                className="fixed inset-0 z-[2500] cursor-default bg-transparent"
                onClick={(e) => {
                  e.preventDefault()
                  ;(e.currentTarget.closest('details') as HTMLDetailsElement)?.removeAttribute('open')
                }}
              />

              <div className="absolute z-[3000] mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="mb-1 flex items-center justify-between px-1">
                  <div className="text-[12px] font-medium text-slate-700">Select services</div>
                  <button
                    className="rounded-lg px-2 py-1 text-[12px] text-slate-600 hover:bg-slate-50"
                    onClick={(e) => {
                      e.preventDefault()
                      setServices([])
                    }}
                  >
                    Clear
                  </button>
                </div>

                {/* options */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 px-1">
                  {serviceOptions.map((opt) => {
                    const checked = services.includes(opt)
                    return (
                      <label key={opt} className="flex items-center gap-2 rounded-md px-1 py-1 text-[13px] hover:bg-slate-50">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-500"
                          checked={checked}
                          onChange={(e) => {
                            e.stopPropagation()
                            setServices((prev) =>
                              checked ? prev.filter((s) => s !== opt) : [...prev, opt]
                            )
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-slate-800">{opt}</span>
                      </label>
                    )
                  })}
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[12px] font-semibold text-white"
                    onClick={(e) => {
                      e.preventDefault()
                      ;(e.currentTarget.closest('details') as HTMLDetailsElement)?.removeAttribute('open')
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </details>

            <input
              value={zip}
              onChange={(e) =>
                setZip(e.target.value.replace(/\D/g, '').slice(0, 5))
              }
              placeholder="ZIP"
              maxLength={5}
              className="w-[78px] rounded-xl border border-slate-200 px-2.5 py-1.5 text-[13px] outline-none transition focus:border-emerald-400"
            />

            <button
              onClick={resetAll}
              className="ml-auto rounded-xl border border-slate-200 px-2.5 py-1.5 text-[13px] hover:bg-slate-50"
              title="Reset filters"
            >
              Reset
            </button>
          </div>

          {/* LINE 2 */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 items-center gap-2 grow">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Radius</span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="accent-emerald-500"
                />
                <div className="w-12 text-right text-[11px] text-slate-700">
                  {radius} mi
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Min rating</span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-[13px]"
                >
                  <option value={0}>Any</option>
                  <option value={3}>3.0+</option>
                  <option value={3.5}>3.5+</option>
                  <option value={4}>4.0+</option>
                  <option value={4.5}>4.5+</option>
                </select>

                <span className="ml-1 text-[11px] text-slate-500">Experience</span>
                <select
                  value={minYears}
                  onChange={(e) => setMinYears(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-[13px]"
                  title="Minimum years in business"
                >
                  <option value={0}>Any</option>
                  <option value={3}>3+ yrs</option>
                  <option value={5}>5+ yrs</option>
                  <option value={10}>10+ yrs</option>
                </select>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {(() => {
                const topActive = minRating >= 4.5
                return (
                  <button
                    onClick={() => setMinRating(topActive ? 0 : 4.5)}
                    className={
                      'rounded-full px-3 py-1.5 text-[12px] font-medium transition ' +
                      (topActive
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100')
                    }
                    title="Only show 4.5★ and up"
                  >
                    ★ Top rated
                  </button>
                )
              })()}

              {(() => {
                const OPTIONS: { value: HoursTag; label: string }[] = [
                  { value: 'open_now', label: 'Open now' },
                  { value: 'open_today', label: 'Open today' },
                  { value: 'weekends', label: 'Open weekends' },
                  { value: 'evenings', label: 'Evenings' },
                  { value: 'early_morning', label: 'Early morning' },
                  { value: '24_7', label: '24/7' },
                ]
                const pretty = (t: HoursTag) =>
                  OPTIONS.find((o) => o.value === t)?.label ?? t
                const toggle = (tag: HoursTag) => {
                  setHoursTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  )
                }

                return (
                  <details className="relative">
                    <summary className="inline-flex select-none items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] leading-none text-slate-800 hover:bg-slate-50 cursor-pointer">
                      <span className="truncate max-w-[220px]">
                        {hoursTags.length
                          ? `Hours: ${hoursTags.map(pretty).join(', ')}`
                          : 'Hours: Any'}
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-4 w-4 opacity-60"
                      >
                        <path
                          d="M5.5 7.5l4.5 4 4.5-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </summary>

                    <button
                      type="button"
                      aria-hidden="true"
                      className="fixed inset-0 z-[2500] cursor-default bg-transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        ;(e.currentTarget.closest('details') as HTMLDetailsElement)?.removeAttribute(
                          'open'
                        )
                      }}
                    />

                    <div className="absolute right-0 z-[3000] mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                      <button
                        className="w-full rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-slate-50"
                        onClick={(e) => {
                          e.preventDefault()
                          setHoursTags([])
                          ;(e.currentTarget.closest('details') as HTMLDetailsElement)?.removeAttribute(
                            'open'
                          )
                        }}
                      >
                        Any
                      </button>
                      <div className="my-1 h-px bg-slate-100" />
                      <div className="max-h-48 overflow-auto pr-1">
                        {OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-500"
                              checked={hoursTags.includes(opt.value)}
                              onChange={() => toggle(opt.value)}
                            />
                            <span className="text-slate-800">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </details>
                )
              })()}

              <button
                onClick={() => setEmergencyOnly((v) => !v)}
                className={
                  'rounded-full px-3 py-1.5 text-[12px] font-medium ' +
                  (emergencyOnly
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100')
                }
                title="Emergency service"
              >
                🚨 Emergency
              </button>
            </div>
          </div>
        </div>

        {/* REMOVED: specialty bar (chips) */}

        {/* MAP (inline component) */}
        <MapCanvas
          items={filtered}
          category={services[0] || undefined} // just for pin emoji preference
          radiusMiles={radius}
          searchCenter={activeCenter}
          onSearchHere={(c) => setCenter(c)}
          onAreaChange={(gj) => setAreaGeojson(gj)}
          onClearArea={() => setAreaGeojson(null)}
        />

        {/* Results header + sort */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[12px] text-slate-600">
            Showing{' '}
            <span className="font-semibold text-slate-900">{filtered.length}</span>{' '}
            within <span className="font-semibold text-slate-900">{radius} mi</span>
            {hasArea && (
              <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                Area filter on
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[12px] text-slate-500">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-[13px]"
              title="Sort results"
            >
              <option value="best">Best match</option>
              <option value="distance">Distance</option>
              <option value="rating">Rating</option>
              <option value="experience">Experience</option>
            </select>
          </div>
        </div>

        {/* Results list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const d = (c as any).__distance as number | undefined
              const svc: string[] = Array.isArray(c?.services) ? c.services : []
              return (
                <div
                  key={String(c?.id ?? c?.name)}
                  className="rounded-xl border border-slate-200 p-2.5 transition hover:shadow-[0_1px_12px_rgba(2,6,23,.06)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate text-[14px] font-semibold text-slate-900">
                      {c?.name || 'Contractor'}
                    </div>
                    <div className="shrink-0 text-[11px] text-slate-500">
                      {typeof d === 'number' ? `${d.toFixed(1)} mi` : ''}
                    </div>
                  </div>

                  <div className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                    {c?.city ? c.city : ''}
                    {c?.rating ? ` • ★ ${Number(c.rating).toFixed(1)}` : ''}
                    {Number(c?.years) ? ` • ${Number(c.years)} yrs` : ''}
                    {c?.emergency || c?.emergencyService ? ' • 🚨 Emergency' : ''}
                    {c?.twentyFourSeven || c?.['24_7'] ? ' • 24/7' : ''}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {svc.slice(0, 5).map((s: string) => (
                      <span
                        key={s}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2.5 flex gap-1.5">
                    <a
                      href={`/pro/${encodeURIComponent(String(c?.id ?? ''))}`}
                      className="rounded-lg bg-primary px-2.5 py-1.5 text-[12px] font-semibold text-white"
                    >
                      View
                    </a>
                    <a
                      href={`/messages?to=${encodeURIComponent(String(c?.id ?? ''))}`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-900"
                    >
                      Message
                    </a>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                No results. Widen the radius or clear filters.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

/* ================== MAP (inline) ================== */

function MapCanvas({
  items = [],
  category,
  radiusMiles = 10,
  searchCenter,
  onSearchHere,
  onAreaChange,
  onClearArea,
}: {
  items: any[]
  category?: string
  radiusMiles?: number
  searchCenter?: [number, number]
  onSearchHere?: (center: [number, number]) => void
  onAreaChange?: (gj: any) => void
  onClearArea?: () => void
}) {
  const addToast = useApp()?.addToast
  const safeItems = Array.isArray(items) ? items : []
  const pros = useMemo(() => {
    if (!category) return safeItems
    return safeItems.filter(
      (c: any) => Array.isArray(c?.services) && c.services.includes(category)
    )
  }, [safeItems, category])

  const mapRef = useRef<HTMLDivElement>(null)
  const mapObjRef = useRef<any>(null)
  const layerRef = useRef<any>(null)

  const legendRef = useRef<any>(null)
  const row2Ref = useRef<HTMLDivElement | null>(null)

  const drawingsLayerRef = useRef<any>(null)
  const tempLineRef = useRef<any>(null)
  const tempPtsRef = useRef<[number, number][]>([])
  const isDrawingRef = useRef(false)
  const [isDrawing, setIsDrawing] = useState(false)

  const clickHandlerRef = useRef<any>(null)
  const mouseMoveHandlerRef = useRef<any>(null)
  const dblHandlerRef = useRef<any>(null)

  const suppressFitRef = useRef(false)

  function addOrReplaceLegend(L: any, map: any) {
    if (legendRef.current) {
      try { map.removeControl(legendRef.current) } catch {}
      legendRef.current = null
    }

    const Legend = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: () => {
        const wrap = L.DomUtil.create('div', 'al-legend-wrap')
        // ensure on top + interactive
        wrap.style.cssText = 'display:inline-block; pointer-events:auto; z-index:1200;'

        // Legend "pill"
        const pill = L.DomUtil.create('div', 'al-legend', wrap)
        pill.style.cssText = `
          background:rgba(255,255,255,.92); backdrop-filter:blur(4px);
          border:1px solid rgba(15,23,42,.08);
          border-radius:12px; box-shadow:0 1px 3px rgba(2,6,23,.08);
          padding:6px 10px; color:#0f172a;
          display:flex; gap:14px; align-items:flex-end; white-space:nowrap;
        `
        Object.entries(CAT_EMOJI).forEach(([label, emoji]) => {
          const item = L.DomUtil.create('div', '', pill)
          item.style.cssText = `display:inline-flex; flex-direction:column; align-items:center; gap:3px;`
          const bubble = L.DomUtil.create('div', '', item)
          bubble.style.cssText = `
            width:18px; height:18px; display:flex; align-items:center; justify-content:center;
            border-radius:9999px; background:#ecfdf5; border:1px solid rgba(16,185,129,.5);
          `
          const img = L.DomUtil.create('img', '', bubble) as HTMLImageElement
          img.src = twemojiUrl(emoji)
          img.alt = label
          img.style.cssText = 'width:11px; height:11px; display:block;'
          const cap = L.DomUtil.create('div', '', item)
          cap.textContent = label
          cap.style.cssText = 'font-size:10px; line-height:1.1; color:#334155; text-align:center;'
        })

        // Row 1: Locate / Search / Draw
        const row1 = L.DomUtil.create('div', 'al-legend-actions', wrap)
        row1.style.cssText = `
          margin-top:8px; display:flex; gap:8px; align-items:center;
          justify-content:flex-start; pointer-events:auto;
        `
        row1.innerHTML = `
          <button type="button" class="al-btn" data-btn="locate">📍 Locate me</button>
          <button type="button" class="al-btn" data-btn="search">🔎 Search this area</button>
          <button type="button" class="al-btn" data-btn="draw">✏️ Draw</button>
        `

        // Row 2: Clear / Add (only visible while drawing)
        const row2 = L.DomUtil.create('div', 'al-legend-actions-2', wrap)
        row2.style.cssText = `
          margin-top:6px; display:${isDrawingRef.current ? 'flex' : 'none'};
          gap:8px; align-items:center; justify-content:flex-start; pointer-events:auto;
        `
        row2.innerHTML = `
          <button type="button" class="al-btn-ghost" data-btn="clear-all">Clear All</button>
          <button type="button" class="al-btn" data-btn="add-another">Add Another</button>
        `
        row2Ref.current = row2

        // Button styling + block map click-through
        Array.from(row1.querySelectorAll('.al-btn')).forEach((el: any) => {
          el.style.cssText = tinyBtn(false) + 'display:inline-flex; align-items:center; justify-content:center;'
          addHoverGrow(el)
        })
        Array.from(row2.querySelectorAll('.al-btn, .al-btn-ghost')).forEach((el: any) => {
          const primary = el.classList.contains('al-btn') && !el.classList.contains('al-btn-ghost')
          el.style.cssText = (primary ? tinyBtn(true) : ghostBtn()) + 'display:inline-flex; align-items:center; justify-content:center;'
          addHoverGrow(el as HTMLElement)
        })

        // prevent map from swallowing events under legend
        L.DomEvent.disableClickPropagation(wrap)
        L.DomEvent.disableScrollPropagation(wrap)

        // 🔑 Single delegated handler for all legend buttons
        wrap.addEventListener('click', (e: any) => {
          const btn = (e.target as HTMLElement).closest('[data-btn]') as HTMLButtonElement | null
          if (!btn) return
          const kind = btn.getAttribute('data-btn')

          if (kind === 'locate') {
            if (!navigator.geolocation) { addToast?.('Geolocation not supported', 'error'); return }
            navigator.geolocation.getCurrentPosition(
              pos => {
                const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude]
                map.panTo(ll, { animate: true })
                onSearchHere?.(ll)
                suppressFitRef.current = true
              },
              () => addToast?.('Unable to retrieve your location', 'error'),
              { enableHighAccuracy: true, timeout: 8000 }
            )
          }

          if (kind === 'search') {
            const c = map.getCenter()
            const ll: [number, number] = [c.lat, c.lng]
            onSearchHere?.(ll)
            suppressFitRef.current = true
          }

          if (kind === 'draw') {
            toggleDrawMode(L, map)
          }

          if (kind === 'clear-all') {
            clearAllDrawings(L, map)
            onClearArea?.()
            if (row2Ref.current) row2Ref.current.style.display = 'flex'
          }

          if (kind === 'add-another') {
            finalizeCurrentIfPossible(L, map)
            startFreshDrawing(L, map)
            if (row2Ref.current) row2Ref.current.style.display = 'flex'
          }
        }, { capture: true })

        return wrap
      },
    })

    legendRef.current = new Legend()
    legendRef.current.addTo(map)
  }

  // Drawing helpers
  function disableMapInteractions(map: any) {
    map.dragging?.disable()
    map.doubleClickZoom?.disable()
    map.scrollWheelZoom?.disable()
    map.boxZoom?.disable()
    map.touchZoom?.disable()
    map.keyboard?.disable()
    map._container.style.cursor = 'crosshair'
  }
  function enableMapInteractions(map: any) {
    map.dragging?.enable()
    map.doubleClickZoom?.enable()
    map.scrollWheelZoom?.enable()
    map.boxZoom?.enable()
    map.touchZoom?.enable()
    map.keyboard?.enable()
    map._container.style.cursor = ''
  }

  function startFreshDrawing(L: any, map: any) {
    if (!drawingsLayerRef.current) {
      drawingsLayerRef.current = L.layerGroup().addTo(map)
    }
    tempPtsRef.current = []
    if (tempLineRef.current) {
      try { map.removeLayer(tempLineRef.current) } catch {}
      tempLineRef.current = null
    }
  }

  function clearAllDrawings(L: any, map: any) {
    tempPtsRef.current = []
    if (tempLineRef.current) {
      try { map.removeLayer(tempLineRef.current) } catch {}
      tempLineRef.current = null
    }
    if (drawingsLayerRef.current) {
      try { drawingsLayerRef.current.clearLayers() } catch {}
    }
    emitDrawingsGeoJSON()
  }

  function finalizeCurrentIfPossible(L: any, map: any) {
    const pts = tempPtsRef.current
    if (pts.length >= 3) {
      const poly = L.polygon(pts, {
        color: '#10b981',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.15,
      })
      drawingsLayerRef.current.addLayer(poly)
      emitDrawingsGeoJSON()
    }
    if (tempLineRef.current) {
      try { map.removeLayer(tempLineRef.current) } catch {}
      tempLineRef.current = null
    }
    tempPtsRef.current = []
  }

  function emitDrawingsGeoJSON() {
    if (!onAreaChange) return
    const fc = { type: 'FeatureCollection', features: [] as any[] }
    if (drawingsLayerRef.current) {
      drawingsLayerRef.current.eachLayer((l: any) => {
        if (typeof l.toGeoJSON === 'function') {
          fc.features.push(l.toGeoJSON())
        }
      })
    }
    onAreaChange(fc)
  }

  function toggleDrawMode(L: any, map: any, turnOn?: boolean) {
    const next = typeof turnOn === 'boolean' ? turnOn : !isDrawingRef.current
    isDrawingRef.current = next
    setIsDrawing(next)
    if (row2Ref.current) row2Ref.current.style.display = next ? 'flex' : 'none'

    if (next) {
      disableMapInteractions(map)
      startFreshDrawing(L, map)

      const onClick = (e: any) => {
        tempPtsRef.current.push([e.latlng.lat, e.latlng.lng])
        if (!tempLineRef.current) {
          tempLineRef.current = L.polyline(tempPtsRef.current, { color: '#10b981', weight: 2 }).addTo(map)
        } else {
          tempLineRef.current.setLatLngs(tempPtsRef.current)
        }
      }
      const onMove = (e: any) => {
        if (!tempLineRef.current || tempPtsRef.current.length === 0) return
        const preview = [...tempPtsRef.current, [e.latlng.lat, e.latlng.lng]]
        tempLineRef.current.setLatLngs(preview)
      }
      const onDbl = (e: any) => {
        if (tempPtsRef.current.length >= 2) tempPtsRef.current.push([e.latlng.lat, e.latlng.lng])
        finalizeCurrentIfPossible(L, map)
      }

      map.on('click', onClick)
      map.on('mousemove', onMove)
      map.on('dblclick', onDbl)
      clickHandlerRef.current = onClick
      mouseMoveHandlerRef.current = onMove
      dblHandlerRef.current = onDbl
    } else {
      enableMapInteractions(map)
      if (clickHandlerRef.current) map.off('click', clickHandlerRef.current)
      if (mouseMoveHandlerRef.current) map.off('mousemove', mouseMoveHandlerRef.current)
      if (dblHandlerRef.current) map.off('dblclick', dblHandlerRef.current)
      clickHandlerRef.current = null
      mouseMoveHandlerRef.current = null
      dblHandlerRef.current = null
      if (tempLineRef.current) {
        try { map.removeLayer(tempLineRef.current) } catch {}
        tempLineRef.current = null
      }
      tempPtsRef.current = []
      if (row2Ref.current) row2Ref.current.style.display = 'none'
    }
  }

  // Init
  useEffect(() => {
    let resizeHandler: any
    ;(async () => {
      if (!mapRef.current || mapObjRef.current) return
      try {
        const mod = await import('leaflet')
        const L: any = (mod as any).default ?? mod

        const initialCenter: [number, number] = searchCenter ?? [40.7128, -74.006]
        const map = L.map(mapRef.current, { zoomControl: false }).setView(initialCenter, 11)
        mapObjRef.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map)

        L.control.zoom({ position: 'topright' }).addTo(map)

        setTimeout(() => map.invalidateSize(), 0)
        resizeHandler = () => map.invalidateSize()
        window.addEventListener('resize', resizeHandler)

        addOrReplaceLegend(L, map)
        refreshMarkers(L, map, pros, layerRef, category, { fit: true })
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.warn('Leaflet init failed:', e)
      }
    })()

    return () => {
      try {
        const map = mapObjRef.current
        if (map) {
          if (clickHandlerRef.current) map.off('click', clickHandlerRef.current)
          if (mouseMoveHandlerRef.current) map.off('mousemove', mouseMoveHandlerRef.current)
          if (dblHandlerRef.current) map.off('dblclick', dblHandlerRef.current)
          try { if (layerRef.current) map.removeLayer(layerRef.current) } catch {}
          try { if (drawingsLayerRef.current) map.removeLayer(drawingsLayerRef.current) } catch {}
          try { if (legendRef.current) map.removeControl(legendRef.current) } catch {}
          map.remove()
        }
      } catch {}
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)

      mapObjRef.current = null
      layerRef.current = null
      drawingsLayerRef.current = null
      legendRef.current = null
      row2Ref.current = null
      tempLineRef.current = null
      tempPtsRef.current = []
      isDrawingRef.current = false
      setIsDrawing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh markers on props change
  useEffect(() => {
    ;(async () => {
      const map = mapObjRef.current
      if (!map) return
      try {
        const mod = await import('leaflet')
        const L: any = (mod as any).default ?? mod

        if (searchCenter) {
          map.setView(searchCenter, map.getZoom() || 11, { animate: true })
        }
        refreshMarkers(L, map, pros, layerRef, category, { fit: !suppressFitRef.current })
        suppressFitRef.current = false
      } catch {}
    })()
  }, [pros, searchCenter, category])

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-[360px] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-3 px-2.5 py-1.5 rounded-xl bg-white/90 text-xs border border-slate-200 shadow"
        style={{ zIndex: 1100 }}
      >
        Radius: {radiusMiles} mi {isDrawing ? '• Drawing mode' : ''}
      </div>
    </div>
  )
}

/* ====== map helpers ====== */

function refreshMarkers(
  L: any,
  map: any,
  itemsIn: any[],
  layerRef: React.MutableRefObject<any>,
  selectedCategory?: string,
  opts?: { fit?: boolean }
) {
  const items = Array.isArray(itemsIn) ? itemsIn : []
  const shouldFit = opts?.fit ?? true

  try {
    if (layerRef.current) {
      layerRef.current.clearLayers?.()
      map.removeLayer?.(layerRef.current)
      layerRef.current = null
    }
  } catch {}

  const group = L.layerGroup()
  items.forEach((c: any) => {
    const lat = Number(c?.loc?.lat)
    const lng = Number(c?.loc?.lng)
    if (!isFinite(lat) || !isFinite(lng)) return

    const svcs: string[] = Array.isArray(c?.services) ? c.services : []
    const svc = selectedCategory && svcs.includes(selectedCategory) ? selectedCategory : svcs[0]
    const emoji = CAT_EMOJI[svc as keyof typeof CAT_EMOJI] ?? '🔧'

    const m = createPinMarker(L, map, [lat, lng], { emoji, data: c })
    m.addTo(group)
  })

  group.addTo(map)
  layerRef.current = group

  if (shouldFit) {
    const pts = group.getLayers().map((l: any) => l.getLatLng && l.getLatLng()).filter(Boolean)
    if (pts.length > 1) {
      const b = L.latLngBounds(pts)
      map.fitBounds(b, { padding: [24, 24], maxZoom: 13 })
    } else if (pts.length === 1) {
      map.setView(pts[0], 12, { animate: false })
    }
  }
}

function createPinMarker(
  L: any,
  map: any,
  latlng: [number, number],
  payload: { emoji: string; data: any }
) {
  const icon = makePinIcon(L, payload)
  const m = L.marker(latlng, { icon, riseOnHover: true }) as any
  ;(m as any)._al = { ...payload }
  ;(m as any)._map = map
  return m
}

function makePinIcon(L: any, opts: { emoji: string; data: any }) {
  const { emoji, data } = opts
  const bubble = 24
  const tipH = 8
  const tipW = 12
  const border = '#10b981'
  const fill = '#d1fae5'

  const tw = twemojiUrl(emoji)
  const imgSize = Math.floor(bubble * 0.7)
  const iconHeight = bubble + tipH + 2

  const name = escapeHtml(String(data?.name ?? 'Contractor'))
  const city = escapeHtml(String(data?.city ?? ''))

  const html = `
    <div style="position:relative; width:${bubble}px; height:${iconHeight}px;">
      <div class="al-pin-bubble" style="
        position:absolute; left:50%; top:0; transform:translateX(-50%);
        width:${bubble}px; height:${bubble}px; background:${fill};
        border:1.5px solid ${border}; border-radius:9999px;
        box-shadow:0 2px 4px rgba(0,0,0,.18); z-index:20;">
        <div style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
          width:${bubble}px; height:${bubble}px; display:flex; align-items:center; justify-content:center;">
          <img src="${tw}" alt="${name}" title="${name}${city ? ' • ' + city : ''}" style="width:${imgSize}px; height:${imgSize}px; display:block;"/>
        </div>
      </div>
      <div style="
        position:absolute; left:50%; top:${bubble - 1}px; transform:translateX(-50%);
        width:0; height:0; border-left:${tipW / 2 + 1}px solid transparent;
        border-right:${tipW / 2 + 1}px solid transparent; border-top:${tipH + 2}px solid ${border};
        z-index:16;"></div>
      <div style="
        position:absolute; left:50%; top:${bubble}px; transform:translateX(-50%);
        width:0; height:0; border-left:${tipW / 2}px solid transparent;
        border-right:${tipW / 2}px solid transparent; border-top:${tipH}px solid ${fill};
        z-index:17;"></div>
    </div>
  `
  return L.divIcon({
    className: 'al-emoji-pin',
    html,
    iconSize: [bubble, iconHeight],
    iconAnchor: [Math.floor(bubble / 2), bubble + tipH + 2],
    popupAnchor: [0, -(bubble / 2)],
  })
}

/* tiny UI helpers for legend buttons */

function tinyBtn(primary = false) {
  return `
    cursor:pointer; padding:8px 12px; border-radius:12px;
    font-size:12px; font-weight:700; line-height:1;
    ${primary
      ? 'background:#10b981; color:#fff; border:1px solid #10b981;'
      : 'background:rgba(255,255,255,.95); color:#0f172a; border:1px solid rgba(15,23,42,.12);'}
    box-shadow:0 1px 3px rgba(2,6,23,.08);
    transition:filter .12s ease, transform .06s ease;
  `
}
function ghostBtn() {
  return `
    cursor:pointer; padding:8px 12px; border-radius:12px;
    font-size:12px; font-weight:700; line-height:1;
    background:#fff; color:#0f172a; border:1px dashed rgba(15,23,42,.25);
    box-shadow:0 1px 3px rgba(2,6,23,.06);
    transition:filter .12s ease, transform .06s ease;
  `
}
function addHoverGrow(el: HTMLElement) {
  el.style.transformOrigin = 'center center'
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.06)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  el.addEventListener('mousedown',  () => { el.style.transform = 'scale(0.98)' })
  el.addEventListener('mouseup',    () => { el.style.transform = 'scale(1.06)' })
  el.addEventListener('blur',       () => { el.style.transform = 'scale(1)' })
}

/* utils */

function twemojiUrl(emoji: string) {
  const override: Record<string, string> = { '❄️': '2744' } // normalize snowflake + VS16
  const code = override[emoji] ?? toCodePoints(emoji).join('-')
  return `https://twemoji.maxcdn.com/v/latest/svg/${code}.svg`
}
function toCodePoints(str: string) {
  const cps: string[] = []
  for (const ch of Array.from(str)) cps.push(ch.codePointAt(0)!.toString(16))
  return cps
}
function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (m) =>
    m === '&'
      ? '&amp;'
      : m === '<'
      ? '&lt;'
      : m === '>'
      ? '&gt;'
      : m === '"'
      ? '&quot;'
      : '&#39;'
  )
}
