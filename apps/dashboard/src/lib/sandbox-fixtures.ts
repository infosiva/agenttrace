// Static SAMPLE data for the guest sandbox. Never read from or written to the database.
export const SANDBOX_TRACES = [
  { id: 's1', name: 'support-agent: refund request', status: 'success', durationMs: 2140, tokens: 1830, costUsd: 0.0041, minutesAgo: 3 },
  { id: 's2', name: 'support-agent: order lookup', status: 'success', durationMs: 980, tokens: 760, costUsd: 0.0017, minutesAgo: 9 },
  { id: 's3', name: 'research-agent: web summary', status: 'error', durationMs: 8120, tokens: 5210, costUsd: 0.0123, minutesAgo: 14 },
  { id: 's4', name: 'code-review-agent: PR #482', status: 'success', durationMs: 5630, tokens: 4400, costUsd: 0.0098, minutesAgo: 27 },
  { id: 's5', name: 'support-agent: cancel subscription', status: 'running', durationMs: 0, tokens: 210, costUsd: 0.0004, minutesAgo: 1 },
  { id: 's6', name: 'research-agent: competitor scan', status: 'error', durationMs: 12040, tokens: 7010, costUsd: 0.0161, minutesAgo: 41 },
  { id: 's7', name: 'code-review-agent: PR #479', status: 'success', durationMs: 4380, tokens: 3620, costUsd: 0.0077, minutesAgo: 58 },
] as const satisfies readonly { id: string; name: string; status: 'success' | 'error' | 'running'; durationMs: number; tokens: number; costUsd: number; minutesAgo: number }[];
