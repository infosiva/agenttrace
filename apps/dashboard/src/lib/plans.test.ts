import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAN_LIMITS, parsePlan, isOverLimit, overLimitFlags, canCreateProject, monthStart, planFeatureLines } from './plans';

test('parsePlan defaults anything unknown to free', () => {
  assert.equal(parsePlan('pro'), 'pro');
  for (const v of [undefined, null, '', 'enterprise', 'PRO', 1]) assert.equal(parsePlan(v), 'free');
});

test('isOverLimit boundary: the trace that would be #limit+1 is over', () => {
  const l = PLAN_LIMITS.free.tracesPerMonth;
  assert.equal(isOverLimit('free', l - 1), false);
  assert.equal(isOverLimit('free', l), true);
});

test('overLimitFlags flags only the traces past the limit in a batch', () => {
  const l = PLAN_LIMITS.free.tracesPerMonth;
  assert.deepEqual(overLimitFlags('free', l - 2, 4), [false, false, true, true]);
  assert.deepEqual(overLimitFlags('free', 0, 0), []);
});

test('canCreateProject: free capped, pro unlimited', () => {
  assert.equal(canCreateProject('free', 0), true);
  assert.equal(canCreateProject('free', 1), false);
  assert.equal(canCreateProject('pro', 500), true);
});

test('monthStart is the first instant of the UTC month', () => {
  assert.equal(monthStart(new Date('2026-10-31T23:59:59Z')).toISOString(), '2026-10-01T00:00:00.000Z');
  assert.equal(monthStart(new Date('2026-01-01T00:00:00Z')).toISOString(), '2026-01-01T00:00:00.000Z');
});

test('planFeatureLines come from PLAN_LIMITS (copy cannot drift)', () => {
  const free = planFeatureLines('free').join('|');
  assert.ok(free.includes(PLAN_LIMITS.free.tracesPerMonth.toLocaleString('en-US')));
  assert.ok(planFeatureLines('pro').join('|').includes('Unlimited projects'));
});
