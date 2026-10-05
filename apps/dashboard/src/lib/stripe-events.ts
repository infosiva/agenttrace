import type { Plan } from './plans';

export type StripeEventLike = { id: string; type: string; data: { object: Record<string, any> } }; // eslint-disable-line @typescript-eslint/no-explicit-any
export type PlanDeps = {
  hasSeen(id: string): Promise<boolean>;
  markSeen(id: string): Promise<void>;
  setPlanByUser(userId: string, plan: Plan, customerId: string): Promise<void>;
  setPlanByCustomer(customerId: string, plan: Plan): Promise<boolean>;
  track(event: string, userId: string): void;
};

// Apply first, mark seen after: a crash in between means Stripe's retry re-applies (harmless, setting a plan is idempotent).
export async function applyStripeEvent(ev: StripeEventLike, deps: PlanDeps): Promise<'applied' | 'duplicate' | 'ignored'> {
  if (await deps.hasSeen(ev.id)) return 'duplicate';
  const o = ev.data.object;
  let result: 'applied' | 'ignored' = 'ignored';

  if (ev.type === 'checkout.session.completed') {
    const userId = typeof o.client_reference_id === 'string' ? o.client_reference_id : null;
    const customerId = typeof o.customer === 'string' ? o.customer : null;
    if (userId && customerId) {
      await deps.setPlanByUser(userId, 'pro', customerId);
      deps.track('checkout_completed', userId);
      result = 'applied';
    }
  } else if (ev.type === 'customer.subscription.deleted') {
    const customerId = typeof o.customer === 'string' ? o.customer : null;
    if (customerId && (await deps.setPlanByCustomer(customerId, 'free'))) result = 'applied';
  }

  await deps.markSeen(ev.id);
  return result;
}
