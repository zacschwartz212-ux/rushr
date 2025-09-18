'use client'

import Link from 'next/link'

export default function DashboardChooser() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-ink dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300">Pick the view you want to use right now.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/homeowner"
          className="rounded-2xl border border-emerald-200 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow transition"
        >
          <div className="text-sm font-semibold text-emerald-700">Homeowner</div>
          <div className="mt-1 text-ink dark:text-white text-lg">Track jobs & compare quotes</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>Post jobs</li>
            <li>Messages & quotes</li>
            <li>Favorites</li>
          </ul>
        </Link>

        <Link
          href="/dashboard/contractor"
          className="rounded-2xl border border-blue-200 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow transition"
        >
          <div className="text-sm font-semibold text-blue-700">Contractor</div>
          <div className="mt-1 text-ink dark:text-white text-lg">Leads, quotes & pipeline</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>Lead feed</li>
            <li>Quote templates</li>
            <li>Signals</li>
          </ul>
        </Link>
      </div>
    </div>
  )
}
