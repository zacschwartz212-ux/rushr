'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useApp } from '../lib/state'
import ContractorCard from './ContractorCard'

export default function FeaturedContractors(){
  const { state } = useApp()
  const list = (state as any)?.contractors
  const viewportRef = useRef<HTMLDivElement>(null)

  const [paused, setPaused] = useState(false)
  const [pageSize, setPageSize] = useState(2) // 2-up desktop, 1-up mobile
  const [page, setPage] = useState(0)

  // ----- SAFE DEFAULTS -----
  const safeList = Array.isArray(list) ? list : []
  const safePageSize = Math.max(1, Number(pageSize) || 1)
  const pages = Math.max(1, Math.ceil(safeList.length / safePageSize))

  // keep pageSize in sync with viewport
  useEffect(()=>{
    const sync = ()=>{
      const twoUp = window.matchMedia('(min-width: 768px)').matches
      setPageSize(twoUp ? 2 : 1)
    }
    sync()
    window.addEventListener('resize', sync)
    return ()=>window.removeEventListener('resize', sync)
  },[])

  // clamp page when list/pageSize changes
  useEffect(()=>{
    const clamped = Math.min(page, pages - 1)
    if (clamped !== page) {
      setPage(clamped)
      // snap scroll to new clamped page on next frame
      requestAnimationFrame(()=> goTo(clamped, { smooth:false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages])

  const goTo = (p:number, opts:{smooth?:boolean} = {smooth:true})=>{
    const el = viewportRef.current
    if(!el) return
    const slides = Array.from(el.querySelectorAll<HTMLElement>('.carousel-slide'))
    const idx = p * safePageSize
    const target = slides[idx]
    if(target){
      el.scrollTo({ left: target.offsetLeft, behavior: opts.smooth ? 'smooth' : 'auto' })
      setPage(p)
    }else{
      // if no target (e.g., empty list), just reset scroll
      el.scrollTo({ left: 0, behavior: 'auto' })
      setPage(0)
    }
  }

  const next = ()=> goTo((page + 1) % pages)
  const prev = ()=> goTo((page - 1 + pages) % pages)

  // auto-advance (disabled when paused or only one page)
  useEffect(()=>{
    if (paused || pages <= 1) return
    const id = window.setInterval(()=> next(), 4000)
    return ()=> window.clearInterval(id)
  }, [paused, pages, page, safePageSize]) // keep interval fresh

  // Optional: early return when no contractors
  if (safeList.length === 0) {
    return null
  }

  return (
    <section className="section">
      <h2 className="text-xl font-semibold text-ink mb-3">Featured contractors</h2>

      <div
        className="relative"
        onMouseEnter={()=>setPaused(true)}
        onMouseLeave={()=>setPaused(false)}
      >
        {/* Viewport (snap container) */}
        <div ref={viewportRef} className="carousel-viewport">
          <div className="carousel-track">
            {safeList.map((c:any, i:number)=>(
              <div key={(c?.id ?? 'c') + '-' + i} className="carousel-slide">
                <ContractorCard c={c} />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows outside */}
        <button
          aria-label="Previous"
          onClick={prev}
          className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-soft hover:bg-slate-50"
        >‹</button>
        <button
          aria-label="Next"
          onClick={next}
          className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-soft hover:bg-slate-50"
        >›</button>
      </div>
    </section>
  )
}
