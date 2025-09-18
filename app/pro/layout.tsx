import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: { default: 'Housecall Pro', template: '%s | Housecall Pro' },
  description: 'The contractor side of Housecall — manage jobs, Signals, and your profile.',
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  // IMPORTANT: Do not render another Header here.
  return (
    <div className="pro-backdrop min-h-screen bg-white text-slate-900">
      <main className="p-6">{children}</main>
    </div>
  )
}
