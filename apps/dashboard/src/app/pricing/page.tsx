'use client';

import Link from 'next/link';
import { Check, Github } from 'lucide-react';
import { useState } from 'react';

const FREE = {
  name: 'Free',
  price: '$0',
  cadence: 'forever',
  cta: 'Sign in →',
  href: '/login',
  features: [
    '10,000 trace events / month',
    '7-day log retention',
    '1 project',
    'Community support',
    'Python + TypeScript SDKs',
  ],
};

const PRO = {
  name: 'Pro',
  price: '$19',
  cadence: '/ month',
  cta: 'Upgrade to Pro',
  features: [
    '1,000,000 trace events / month',
    '30-day log retention',
    'Unlimited projects',
    'Email support (24h SLA)',
    'Webhook + REST API export',
    'Team seats (up to 5)',
  ],
  highlight: true,
};

const SELF_HOST = {
  name: 'Self-host',
  price: '$0',
  cadence: 'open source',
  cta: 'View on GitHub',
  href: 'https://github.com/infosiva/agenttrace',
  features: [
    'Run on your infra (Docker)',
    'Unlimited events, no quota',
    'Your data never leaves your network',
    'MIT licensed',
    'Community support via GitHub',
  ],
};

export default function PricingPage() {
  const [upgrading, setUpgrading] = useState(false);

  async function upgrade() {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout unavailable. Please sign in first.');
      }
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <p className="text-xs text-green-600 uppercase tracking-widest mb-2">// pricing</p>
          <h1 className="text-4xl font-bold text-white mb-3">Simple. Honest.</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Free forever for small projects. Pay only when you need scale. Self-host for $0 if you prefer.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <Tier {...FREE} />
          <Tier {...PRO} onClick={upgrade} ctaState={upgrading ? 'loading' : 'idle'} />
          <Tier {...SELF_HOST} external />
        </div>

        <section className="mt-16 max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Questions?</h2>
          <p className="text-sm text-slate-400">
            Pro plan billed monthly via Stripe, cancel anytime. Need higher volume or SSO?{' '}
            <a href="mailto:info.siva@gmail.com" className="text-green-400 hover:text-green-300 underline">Email us</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

type TierProps = {
  name: string;
  price: string;
  cadence: string;
  cta: string;
  features: string[];
  href?: string;
  external?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  ctaState?: 'idle' | 'loading';
};

function Tier({ name, price, cadence, cta, features, href, external, highlight, onClick, ctaState }: TierProps) {
  const button = (
    <button
      onClick={onClick}
      disabled={ctaState === 'loading'}
      className={`w-full font-bold text-sm py-2.5 rounded transition ${
        highlight
          ? 'bg-green-500 hover:bg-green-400 text-black'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
      } disabled:opacity-60`}
    >
      {ctaState === 'loading' ? 'Loading...' : cta}
    </button>
  );

  return (
    <div className={`border rounded-lg p-6 bg-slate-950/60 flex flex-col ${
      highlight ? 'border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.08)]' : 'border-slate-800'
    }`}>
      {highlight && (
        <span className="self-start text-[10px] uppercase tracking-widest bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 mb-3">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-bold text-white">{name}</h3>
      <div className="mt-2 mb-6">
        <span className="text-3xl font-bold text-white tabular-nums">{price}</span>
        <span className="text-sm text-slate-500 ml-1">{cadence}</span>
      </div>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {href ? (
        external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="block">
            <button className={`w-full font-bold text-sm py-2.5 rounded inline-flex items-center justify-center gap-2 ${
              highlight ? 'bg-green-500 hover:bg-green-400 text-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}>
              <Github className="w-4 h-4" /> {cta}
            </button>
          </a>
        ) : (
          <Link href={href} className="block">
            <button className={`w-full font-bold text-sm py-2.5 rounded ${
              highlight ? 'bg-green-500 hover:bg-green-400 text-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}>
              {cta}
            </button>
          </Link>
        )
      ) : (
        button
      )}
    </div>
  );
}
