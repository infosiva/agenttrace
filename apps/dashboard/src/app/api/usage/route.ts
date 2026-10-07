import { NextRequest } from 'next/server'

// Anonymous usage + error events. JSON-line stdout log; no IP, no UA, no PII stored.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const e = String(b.event ?? '').slice(0, 40)
    const line: Record<string, unknown> = { level: e === 'client_error' ? 'error' : 'info', scope: 'usage', event: e, ts: Date.now() }
    if (b.path) line.path = String(b.path).slice(0, 100)
    if (e === 'client_error') { line.err_scope = String(b.scope ?? '').slice(0, 40); line.msg = String(b.msg ?? '').slice(0, 200) }
    console.log(JSON.stringify(line))
  } catch {}
  return new Response(null, { status: 204 })
}
