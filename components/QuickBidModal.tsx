'use client'
import React, { useMemo, useState } from 'react'
import { useApp } from '../lib/state'

export default function QuickBidModal({
  open, onClose, jobId, category
}:{ open:boolean; onClose:()=>void; jobId:string; category:string }){
  const { state, submitBid } = useApp()
  const [price, setPrice] = useState<number | ''>('')
  const [message, setMessage] = useState('')

  const templates = useMemo(()=>{
    const all = state.contractorProfile.templates
    return all.filter(t => !category || t.category===category)
  }, [state.contractorProfile.templates, category])

  const apply = (id:string)=>{
    const t = templates.find(x=>x.id===id)
    if(!t) return
    setMessage(t.body)
    if(t.defaultPrice) setPrice(t.defaultPrice)
  }

  const send = ()=>{
    if(!price){ return }
    submitBid({ jobId, contractorId:'c1', price: Number(price), type:'Fixed', message })
    onClose()
  }

  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="card p-6 w-full max-w-lg">
        <div className="text-xl font-semibold text-ink">Quick bid</div>

        <label className="label mt-3">Template</label>
        <div className="grid grid-cols-2 gap-2">
          {templates.map(t=>(
            <button key={t.id} onClick={()=>apply(t.id)} className="btn">{t.name}</button>
          ))}
        </div>

        <label className="label mt-3">Price (USD)</label>
        <input className="input" inputMode="numeric" value={price} onChange={e=>setPrice(e.target.value ? Number(e.target.value) : '')}/>

        <label className="label mt-3">Message</label>
        <textarea className="input min-h-[120px]" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Short scope & timeline" />

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={send} disabled={!price}>Send bid</button>
        </div>
      </div>
    </div>
  )
}
