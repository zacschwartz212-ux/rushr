'use client'

import Link from 'next/link'

export default function DashboardChooser() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-ink dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300">Access your Rushr emergency services dashboard.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/homeowner"
          className="rounded-2xl border border-emerald-200 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow transition"
        >
          <div className="text-sm font-semibold text-emerald-700">Homeowner</div>
          <div className="mt-1 text-ink dark:text-white text-lg">Emergency service history & active jobs</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>Active emergency services</li>
            <li>Service history & receipts</li>
            <li>Preferred pros</li>
          </ul>
        </Link>

        <Link
          href="/dashboard/contractor"
          className="rounded-2xl border border-blue-200 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow transition"
        >
          <div className="text-sm font-semibold text-blue-700">Pro</div>
          <div className="mt-1 text-ink dark:text-white text-lg">Emergency jobs & availability</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>Emergency job alerts</li>
            <li>Availability status</li>
            <li>Earnings & ratings</li>
          </ul>
        </Link>
      </div>
    </div>
  )
}
