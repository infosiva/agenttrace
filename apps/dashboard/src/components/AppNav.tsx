'use client';

import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/traces', label: 'Traces' },
  { href: '/sites', label: 'Monitor' },
  { href: '/taskflow', label: 'TaskFlow' },
];

export default function AppNav() {
  return (
    <nav style={{ background: 'rgba(2,6,23,0.97)', borderBottom: '1px solid rgba(51,65,85,0.5)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 24, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#22d3ee,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="6" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1.8" opacity="0.6"/>
            <line x1="18" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1.8" opacity="0.6"/>
            <line x1="6" y1="6" x2="18" y2="6" stroke="white" strokeWidth="1.8" opacity="0.4"/>
            <circle cx="6" cy="6" r="2.6" fill="white"/>
            <circle cx="18" cy="6" r="2.6" fill="white" opacity="0.85"/>
            <circle cx="12" cy="18" r="2.6" fill="white"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14, letterSpacing: '-0.02em' }}>Agent<span style={{ color: '#22d3ee' }}>Trace</span></span>
        <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.1)', color: '#4ade80', padding: '1px 6px', borderRadius: 99, fontWeight: 600, border: '1px solid rgba(34,197,94,0.2)' }}>BETA</span>
      </div>
      {NAV_ITEMS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', textDecoration: 'none', transition: 'color 150ms' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f8fafc')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.8)')}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
