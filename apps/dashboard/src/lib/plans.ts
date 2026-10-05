// Single source of truth for plan limits. Numbers are HYPOTHESES (no buyer-side evidence yet).
export type Plan = 'free' | 'pro';

export const PLAN_LIMITS = {
  free: { tracesPerMonth: 5_000, retentionDays: 7, maxProjects: 1, priceUsd: 0 },
  pro: { tracesPerMonth: 100_000, retentionDays: 30, maxProjects: Number.POSITIVE_INFINITY, priceUsd: 19 },
} as const satisfies Record<Plan, { tracesPerMonth: number; retentionDays: number; maxProjects: number; priceUsd: number }>;

// Shown on /pricing as "Planned". Move a line out of here only when the feature ships.
export const PLANNED_FEATURES = ['Alerts', 'Team sharing', 'Webhook / REST export', 'AI diagnosis on traces'];

export function parsePlan(v: unknown): Plan {
  return v === 'pro' ? 'pro' : 'free';
}

// `used` = traces already counted this month, before the one being inserted.
export function isOverLimit(plan: Plan, used: number): boolean {
  return used >= PLAN_LIMITS[plan].tracesPerMonth;
}

export function overLimitFlags(plan: Plan, used: number, count: number): boolean[] {
  return Array.from({ length: count }, (_, i) => isOverLimit(plan, used + i));
}

export function canCreateProject(plan: Plan, existing: number): boolean {
  return existing < PLAN_LIMITS[plan].maxProjects;
}

export function monthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function planFeatureLines(plan: Plan): string[] {
  const l = PLAN_LIMITS[plan];
  return [
    `${l.tracesPerMonth.toLocaleString('en-US')} traces / month`,
    `${l.retentionDays}-day retention`,
    l.maxProjects === Number.POSITIVE_INFINITY ? 'Unlimited projects' : `${l.maxProjects} project${l.maxProjects === 1 ? '' : 's'}`,
  ];
}
