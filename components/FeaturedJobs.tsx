'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useApp } from '../lib/state'
import JobCard from './JobCard'

export default function FeaturedJobs(){
  const { state } = useApp()
  const list = state.jobs
  const viewportRef = useRef<HTMLDivElement>(null)

  const [paused, setPaused] = useState(false)
  const [pageSize, setPageSize] = useState(2)
  const [page, setPage] = useState(0)

  useEffect(()=>{
    const sync = ()=>{
      const twoUp = window.matchMedia('(min-width: 768px)').matches
      setPageSize(twoUp ? 2 : 1)
    }
    sync()
    window.addEventListener('resize', sync)
    return ()=>window.removeEventListener('resize', sync)
  },[])

  const pages = Math.max(1, Math.ceil(list.length / pageSize))

  const goTo = (p:number)=>{
    const el = viewportRef.current
    if(!el) return
    const slides = Array.from(el.querySelectorAll<HTMLElement>('.carousel-slide'))
    const idx = p * pageSize
    const target = slides[idx]
    if(target){
      el.scrollTo({ left: target.offsetLeft, behavior: 'smooth' })
      setPage(p)
    }
  }

  const next = ()=> goTo((page + 1) % pages)
  const prev = ()=> goTo((page - 1 + pages) % pages)

  useEffect(()=>{
    const id = window.setInterval(()=>{ if(!paused) next() }, 4000)
    return ()=> window.clearInterval(id)
  }, [paused, page, pages, pageSize])

  return (
    <section className="section">
      <h2 className="text-xl font-semibold text-ink mb-3">Featured jobs</h2>

      <div
        className="relative"
        onMouseEnter={()=>setPaused(true)}
        onMouseLeave={()=>setPaused(false)}
      >
        <div ref={viewportRef} className="carousel-viewport">
          <div className="carousel-track">
            {list.map((j, i)=>(
              <div key={j.id + '-' + i} className="carousel-slide">
                <JobCard job={j} />
              </div>
            ))}
          </div>
        </div>

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
