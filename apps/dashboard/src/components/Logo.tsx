export function Logo({ size = 24 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="7" fill="#0c111a" stroke="#22d3ee" strokeOpacity=".35" />
        <path d="M7 22 L14 12 L19 18 L25 9" fill="none" stroke="#22d3ee" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="25" cy="9" r="2.4" fill="#fb7185" />
      </svg>
      <span className="font-bold tracking-tight text-white">Agent<span className="text-cyan-300">Logs</span></span>
    </span>
  );
}
