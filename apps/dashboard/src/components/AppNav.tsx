'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';

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
        <Activity style={{ width: 16, height: 16, color: '#22c55e' }} />
        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14, letterSpacing: '-0.02em' }}>AgentTrace</span>
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
