export function DiagnosisCard({ diagnosis, loading }: { diagnosis?: string; loading?: boolean }) {
  return (
    <div className="bg-slate-900 border border-blue-800 rounded-lg p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
        <span className="text-xs text-blue-400 uppercase tracking-widest font-bold">AI Diagnosis</span>
        <span className="text-xs text-slate-600 ml-auto">via Groq · cached 1h</span>
      </div>
      {loading ? (
        <p className="text-slate-400 text-sm animate-pulse">Analysing traffic patterns...</p>
      ) : (
        <p className="text-slate-200 text-sm leading-relaxed">{diagnosis ?? 'No diagnosis available.'}</p>
      )}
    </div>
  );
}
