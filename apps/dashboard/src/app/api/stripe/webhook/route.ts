import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db, users, stripeEvents } from '@/lib/db';
import { applyStripeEvent, type PlanDeps } from '@/lib/stripe-events';
import { trackServer } from '@/lib/track-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const deps: PlanDeps = {
  hasSeen: async id => (await db.select({ id: stripeEvents.id }).from(stripeEvents).where(eq(stripeEvents.id, id))).length > 0,
  markSeen: async id => { await db.insert(stripeEvents).values({ id }).onConflictDoNothing(); },
  setPlanByUser: async (userId, plan, customerId) => {
    const rows = await db.update(users).set({ plan, stripeCustomerId: customerId, planUpdatedAt: new Date() }).where(eq(users.id, userId)).returning({ id: users.id });
    return rows.length > 0;
  },
  setPlanByCustomer: async (customerId, plan) => {
    const rows = await db.update(users).set({ plan, planUpdatedAt: new Date() }).where(eq(users.stripeCustomerId, customerId)).returning({ id: users.id });
    return rows.length > 0;
  },
  track: (event, userId) => trackServer(event, userId),
};

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return Response.json({ error: 'webhook_not_configured' }, { status: 503 }); // fail closed
  const sig = req.headers.get('stripe-signature');
  if (!sig) return Response.json({ error: 'missing_signature' }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event = new Stripe(key, { apiVersion: '2026-04-22.dahlia' as any }).webhooks.constructEvent(raw, sig, secret);
  } catch {
    return Response.json({ error: 'invalid_signature' }, { status: 400 });
  }
  const result = await applyStripeEvent(event as never, deps);
  return Response.json({ received: true, result });
}
