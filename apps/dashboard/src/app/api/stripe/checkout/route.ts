import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, users } from '@/lib/db'
import { getPlan } from '@/lib/plan-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  const session0 = await auth()
  if (!session0?.user?.id) return Response.json({ error: 'unauthorized' }, { status: 401 })
  if ((await getPlan(session0.user.id)) === 'pro') return Response.json({ error: 'already_pro' }, { status: 409 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' as any })
  const origin = process.env.NEXTAUTH_URL || 'https://agentlogs.app' // never trust request Origin
  const [row] = await db.select({ c: users.stripeCustomerId }).from(users).where(eq(users.id, session0.user.id))
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: origin,
    client_reference_id: session0.user.id,
    ...(row?.c ? { customer: row.c } : { customer_email: session0.user.email ?? undefined }),
    metadata: { product: 'agenttrace', user_id: session0.user.id },
  })
  return Response.json({ url: session.url })
}
