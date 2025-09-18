"use client"

import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { signIn } from "../lib/auth-shim"
import { useRouter, useSearchParams } from "next/navigation" // ⬅️ added

type Mode = "signin" | "signup"

// allow passing a callbackUrl with the event so we can return the user
type OpenDetail = { mode?: Mode; callbackUrl?: string }

// export that can be called anywhere (supports callbackUrl)
export function openAuth(mode: Mode = "signin", callbackUrl?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<OpenDetail>("auth:open", { detail: { mode, callbackUrl } }))
  }
}

export default function AuthModal() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("signin")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const params = useSearchParams() // ⬅️ added

  // where to send the user after successful auth
  const callbackRef = useRef<string | undefined>(undefined)

  useEffect(() => setMounted(true), [])

  // 🔔 open when someone calls openAuth()
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenDetail>).detail
      setMode(detail?.mode ?? "signin")
      callbackRef.current = detail?.callbackUrl
      setOpen(true)
      setError(null)
      setLoading(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("auth:open", onOpen as any)
    window.addEventListener("keydown", onEsc)
    return () => {
      window.removeEventListener("auth:open", onOpen as any)
      window.removeEventListener("keydown", onEsc)
    }
  }, [])

  // 🔗 ALSO auto-open if URL has ?auth=signin|signup (& optional ?callback=/some/path)
  useEffect(() => {
    const a = params.get("auth")
    const cb = params.get("callback") || undefined
    if ((a === "signin" || a === "signup") && !open) {
      setMode(a)
      callbackRef.current = cb
      setOpen(true)
    }
  }, [params, open])

  // Clean up ?auth / ?callback in the URL when closing
  const cleanUrl = () => {
    const hasAuth = params.get("auth")
    const hasCb = params.get("callback")
    if (hasAuth || hasCb) {
      router.replace(window.location.pathname, { scroll: false })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const emailTrim = email.trim().toLowerCase()
      const passTrim  = password.trim()
      const nameTrim  = name.trim()

      if (!emailTrim || !passTrim) {
        setError("Please enter your email and password.")
        setLoading(false)
        return
      }

      if (mode === "signup") {
        if (nameTrim.length < 2) {
          setError("Name is required.")
          setLoading(false)
          return
        }
        if (passTrim.length < 8) {
          setError("Password must be at least 8 characters.")
          setLoading(false)
          return
        }

        const res = await fetch("/api/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailTrim, password: passTrim, name: nameTrim }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json?.ok) {
          setError(json?.error || `Sign-up failed (${res.status})`)
          setLoading(false)
          return
        }

        // Try to sign in immediately (no redirect)
        const si: any = await signIn("credentials", { email: emailTrim, password: passTrim, redirect: false })
        if (si?.error) {
          setError("Account created, but sign-in failed.")
          setLoading(false)
          return
        }
        setOpen(false)
        setLoading(false)
        cleanUrl()
        window.location.assign(callbackRef.current || "/dashboard")
        return
      }

      // Sign in (NO REDIRECT)
      const si: any = await signIn("credentials", { email: emailTrim, password: passTrim, redirect: false })
      if (si?.error) {
        setError("Invalid email or password.")
        setLoading(false)
        return
      }
      setOpen(false)
      setLoading(false)
      cleanUrl()
      window.location.assign(callbackRef.current || "/dashboard")
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  if (!mounted) return null
  if (!open) return null

  const title = mode === "signin" ? "Sign in" : "Create your account"
  const cta =
    loading ? (mode === "signin" ? "Signing in..." : "Creating...") : mode === "signin" ? "Sign in" : "Create account"

  return createPortal(
    <div className="fixed inset-0 z-[5000]">
      {/* overlay */}
      <button
        aria-label="Close"
        className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-[1px]"
        onClick={() => { setOpen(false); cleanUrl() }}
      />
      {/* modal */}
      <div
        className="absolute left-1/2 top-1/2 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={() => { setOpen(false); cleanUrl() }}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Socials (disabled for now) */}
        <div className="mb-3 grid gap-2">
          <button type="button" disabled className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] text-slate-500 opacity-60" title="Coming soon">
            Continue with Google
          </button>
          <button type="button" disabled className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] text-slate-500 opacity-60" title="Coming soon">
            Continue with Apple
          </button>
        </div>

        <div className="my-3 h-px bg-slate-200" />

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-emerald-500"
            />
          )}

          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-emerald-500"
          />
          <input
            type="password"
            required
            minLength={mode === "signup" ? 8 : undefined}
            placeholder={mode === "signup" ? "Password (min 8 chars)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-emerald-500"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-[14px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {cta}
          </button>
        </form>

        <p className="mt-3 text-center text-sm text-slate-600">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                className="font-semibold text-emerald-700 hover:underline"
                onClick={() => { setMode("signup"); setError(null) }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="font-semibold text-emerald-700 hover:underline"
                onClick={() => { setMode("signin"); setError(null) }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>,
    document.body
  )
}
