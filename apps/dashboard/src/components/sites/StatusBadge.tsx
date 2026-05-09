import type { HealthStatus } from '@/lib/tracker-client';

const CONFIG: Record<HealthStatus, { bg: string; text: string; dot: string; label: string }> = {
  red:     { bg: 'bg-red-950 border border-red-800',    text: 'text-red-300',    dot: 'bg-red-500',    label: 'Needs Attention' },
  yellow:  { bg: 'bg-yellow-950 border border-yellow-800', text: 'text-yellow-300', dot: 'bg-yellow-400', label: 'Watch' },
  green:   { bg: 'bg-green-950 border border-green-800', text: 'text-green-300',  dot: 'bg-green-500',  label: 'Healthy' },
  unknown: { bg: 'bg-slate-800 border border-slate-700', text: 'text-slate-400',  dot: 'bg-slate-500',  label: 'No Data' },
};

export function StatusBadge({ status, reason }: { status: HealthStatus; reason?: string }) {
  const c = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {reason ?? c.label}
    </span>
  );
}
