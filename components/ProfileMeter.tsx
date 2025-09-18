'use client'
import React from 'react'
import { useApp } from '../lib/state'

export default function ProfileMeter(){
  const { computeProfileScore } = useApp()
  const score = computeProfileScore()
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-ink">Profile completeness</div>
        <div className="text-sm">{score}%</div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full" style={{width:`${score}%`, background:'linear-gradient(90deg,#34d399,#10b981)'}} />
      </div>
      <div className="mt-2 text-xs text-slate-600">Add photos, license/insurance, service area, and quick-bid templates to reach 100%.</div>
    </div>
  )
}
