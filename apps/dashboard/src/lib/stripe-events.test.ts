import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyStripeEvent, type PlanDeps } from './stripe-events';

function deps() {
  const seen = new Set<string>();
  const state = { userPlan: new Map<string, string>(), customer: new Map<string, string>(), tracked: [] as string[] };
  const d: PlanDeps = {
    hasSeen: async id => seen.has(id),
    markSeen: async id => { seen.add(id); },
    setPlanByUser: async (u, p, c) => { state.userPlan.set(u, p); state.customer.set(c, u); return true; },
    setPlanByCustomer: async (c, p) => { const u = state.customer.get(c); if (!u) return false; state.userPlan.set(u, p); return true; },
    track: e => { state.tracked.push(e); },
  };
  return { d, state };
}
const completed = (id: string, ref: string | null, cus = 'cus_1') =>
  ({ id, type: 'checkout.session.completed', data: { object: { client_reference_id: ref, customer: cus, mode: 'subscription', payment_status: 'paid', metadata: { product: 'agenttrace' } } } });

test('checkout completed -> pro, tracks checkout_completed', async () => {
  const { d, state } = deps();
  assert.equal(await applyStripeEvent(completed('evt_1', 'u1'), d), 'applied');
  assert.equal(state.userPlan.get('u1'), 'pro');
  assert.deepEqual(state.tracked, ['checkout_completed']);
});

test('same event id twice applies once', async () => {
  const { d, state } = deps();
  await applyStripeEvent(completed('evt_1', 'u1'), d);
  assert.equal(await applyStripeEvent(completed('evt_1', 'u1'), d), 'duplicate');
  assert.equal(state.tracked.length, 1);
});

test('missing client_reference_id is ignored, not thrown', async () => {
  const { d } = deps();
  assert.equal(await applyStripeEvent(completed('evt_2', null), d), 'ignored');
});

test('session without agenttrace metadata or non-subscription mode is ignored', async () => {
  const { d, state } = deps();
  const ev = completed('evt_7', 'u1');
  assert.equal(await applyStripeEvent({ ...ev, data: { object: { ...ev.data.object, metadata: {} } } }, d), 'ignored');
  assert.equal(await applyStripeEvent({ ...completed('evt_8', 'u1'), data: { object: { ...ev.data.object, mode: 'payment' } } }, d), 'ignored');
  assert.equal(state.userPlan.size, 0);
});

test('setPlanByUser matching no row is ignored, not tracked', async () => {
  const { d, state } = deps();
  d.setPlanByUser = async () => false;
  assert.equal(await applyStripeEvent(completed('evt_6', 'ghost'), d), 'ignored');
  assert.deepEqual(state.tracked, []);
});

test('subscription deleted -> free; unknown customer ignored', async () => {
  const { d, state } = deps();
  await applyStripeEvent(completed('evt_1', 'u1'), d);
  assert.equal(await applyStripeEvent({ id: 'evt_3', type: 'customer.subscription.deleted', data: { object: { customer: 'cus_1' } } }, d), 'applied');
  assert.equal(state.userPlan.get('u1'), 'free');
  assert.equal(await applyStripeEvent({ id: 'evt_4', type: 'customer.subscription.deleted', data: { object: { customer: 'cus_zzz' } } }, d), 'ignored');
});

test('cancel then re-subscribe returns to pro', async () => {
  const { d, state } = deps();
  await applyStripeEvent(completed('evt_1', 'u1'), d);
  await applyStripeEvent({ id: 'evt_3', type: 'customer.subscription.deleted', data: { object: { customer: 'cus_1' } } }, d);
  await applyStripeEvent(completed('evt_5', 'u1'), d);
  assert.equal(state.userPlan.get('u1'), 'pro');
});

test('unrelated event types are ignored', async () => {
  const { d } = deps();
  assert.equal(await applyStripeEvent({ id: 'evt_9', type: 'invoice.paid', data: { object: {} } }, d), 'ignored');
});
