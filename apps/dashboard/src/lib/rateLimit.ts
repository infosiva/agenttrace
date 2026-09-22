import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of store) if (v.resetAt < now) store.delete(k)
  }, 5 * 60 * 1000)
}

interface LimitOverrides { windowMs?: number; max?: number }

async function fetchLimitOverrides(name: string): Promise<LimitOverrides> {
  const connStr = process.env.EDGE_CONFIG
  if (!connStr) return {}

  try {
    const keys = [`ratelimit_${name}_windowMs`, `ratelimit_${name}_max`]
    const params = keys.map((k) => `key=${encodeURIComponent(k)}`).join('&')
    const url = connStr.replace(/\/+$/, '')
    const res = await fetch(`${url}/items?${params}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return {}

    const data = await res.json()
    const overrides: LimitOverrides = {}
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.key === `ratelimit_${name}_windowMs` && typeof item.value === 'number') overrides.windowMs = item.value
        if (item.key === `ratelimit_${name}_max` && typeof item.value === 'number') overrides.max = item.value
      }
    }
    return overrides
  } catch {
    return {}
  }
}

async function getLimitOverrides(name: string): Promise<LimitOverrides> {
  const cached = unstable_cache(
    () => fetchLimitOverrides(name),
    ['rate-limit', name],
    { revalidate: 600 }
  )
  return cached()
}

export function rateLimit(name: string, opts: { windowMs?: number; max?: number; message?: string } = {}) {
  const defaultWindowMs = opts.windowMs ?? 60_000
  const defaultMax      = opts.max ?? 20
  const msg             = opts.message ?? 'Too many requests — please try again later.'

  return {
    async check(req: NextRequest): Promise<NextResponse | null> {
      const overrides = await getLimitOverrides(name)
      const windowMs = overrides.windowMs ?? defaultWindowMs
      const max      = overrides.max ?? defaultMax

      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'
      const now = Date.now()
      const e = store.get(ip)
      if (!e || e.resetAt < now) { store.set(ip, { count: 1, resetAt: now + windowMs }); return null }
      e.count++
      if (e.count > max) {
        return NextResponse.json({ error: msg }, {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((e.resetAt - now) / 1000)) },
        })
      }
      return null
    },
  }
}

export const AI_LIMITER  = rateLimit('ai',  { windowMs: 60_000, max: 10, message: 'AI rate limit — max 10/min. Sign in for unlimited access.' })
export const API_LIMITER = rateLimit('api', { windowMs: 60_000, max: 30 })
export const CHATBOT_LIMITER = rateLimit('chatbot', { windowMs: 60 * 60_000, max: 60, message: 'Chat rate limit — max 60/hr.' })
