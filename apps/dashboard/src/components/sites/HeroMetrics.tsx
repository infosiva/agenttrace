interface HeroMetricsProps {
  totalViews: number;
  totalVisitors: number;
  redCount: number;
  greenCount: number;
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function HeroMetrics({ totalViews, totalVisitors, redCount, greenCount }: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Portfolio Views (7d)</p>
        <p className="text-3xl font-bold text-sky-400">{fmt(totalViews)}</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Unique Visitors</p>
        <p className="text-3xl font-bold text-violet-400">{fmt(totalVisitors)}</p>
      </div>
      <div className="bg-slate-900 border border-red-900 rounded-lg p-4 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Need Attention</p>
        <p className="text-3xl font-bold text-red-400">{redCount}</p>
        <p className="text-xs text-red-500 mt-1">down / no data</p>
      </div>
      <div className="bg-slate-900 border border-green-900 rounded-lg p-4 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Healthy</p>
        <p className="text-3xl font-bold text-green-400">{greenCount}</p>
        <p className="text-xs text-green-600 mt-1">live + tracking</p>
      </div>
    </div>
  );
}
