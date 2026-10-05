import Stripe from 'stripe'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  const session0 = await auth()
  if (!session0?.user?.id) return Response.json({ error: 'unauthorized' }, { status: 401 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' as any })
  const origin = req.headers.get('origin') || 'https://agentlogs.app'
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: origin,
    client_reference_id: session0.user.id,
    customer_email: session0.user.email ?? undefined,
    metadata: { product: 'agenttrace', user_id: session0.user.id },
  })
  return Response.json({ url: session.url })
}
