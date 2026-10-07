import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next';
import PostHogInit from './PostHogInit';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import ChatBot from '@/components/ChatBot';
import FeedbackWidget from '@/components/FeedbackWidget';
import { getSiteFlags } from '@/lib/flags';
import AppNav from '@/components/AppNav';
import CookieConsent from '@/components/CookieConsent';
import { AnimatedBg } from '@/components/AnimatedBg';
import { loadSiteTheme, buildThemeStyleTag, buildGa4Snippet } from '@/lib/theme-loader';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://agentlogs.app'),
  title: 'AgentLogs — AI Agent Observability & Monitoring Platform',
  description: 'Trace, debug, and monitor AI agents in production. Complete observability for LLM calls, tool use, errors, and costs. Real-time agent monitoring platform.',
  keywords: ['AI agent monitoring', 'LLM observability', 'agent debugging', 'AI tracing', 'agent logs'],
  authors: [{ name: 'AgentLogs' }],
  openGraph: {
    title: 'AgentLogs — Monitor Your AI Agents',
    description: 'Complete observability for production AI agents. Debug LLM calls, optimize costs, track errors.',
    url: 'https://agentlogs.app',
    siteName: 'AgentLogs',
    type: 'website',
    images: [{
      url: 'https://agentlogs.app/og-image.png',
      width: 1200,
      height: 630,
      alt: 'AgentLogs - AI Agent Monitoring Platform'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentLogs — Monitor Your AI Agents',
    description: 'Complete observability for production AI agents'
  },
  robots: 'index, follow'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const flags = await getSiteFlags('agenttrace')
  const theme = await loadSiteTheme('agenttrace')
  const themeCss = buildThemeStyleTag(theme, { background: '#0c111a', primary: '#22d3ee', secondary: '#22d3ee' })
  const ga4 = buildGa4Snippet(theme)
  const ga4Id = theme?.analytics?.ga4Id
  return (
    <html lang="en" data-layout={theme?.layout?.archetype ?? 'dashboard-console'} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AgentLogs",
          "description": "AI Agent Observability Platform",
          "url": "https://agentlogs.app",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Cloud",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }) }} />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --surface-1: #101826; --surface-2: #162133; --foreground: #e2e8f0; --text-2: #cbd5e1;
            --border-default: rgba(34,211,238,0.14); --border-strong: rgba(34,211,238,0.28);
            --bg: var(--background, #0c111a); --surface: #101826; --border: rgba(34,211,238,0.14); --text: #e2e8f0; --accent: var(--theme-primary, #22d3ee);
          }
          ${themeCss}
          html, body { background: var(--background, #0c111a); color: #e2e8f0; font-family: var(--font-body, system-ui); }
          code, pre, .mono { font-family: var(--font-mono, 'JetBrains Mono', monospace); }
          @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation: none !important; transition: none !important; } }
        `}} />
        {ga4 && ga4Id && <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />}
        {ga4 && <script dangerouslySetInnerHTML={{ __html: ga4 }} />}
      </head>
      <body className={`${inter.variable} ${jetbrains.variable}`}>
        {theme?.layout?.bgAnimation ? <AnimatedBg theme={theme} /> : <>
          <div className="aurora aurora-primary" aria-hidden />
          <div className="aurora aurora-secondary" aria-hidden />
          <div className="aurora aurora-third" aria-hidden />
        </>}
        <div className="grain" aria-hidden />
        <Providers>
          <AppNav />
          {children}
          {flags.chatbot && <ChatBot />}
        </Providers>
        <Script defer data-domain="agentlogs.app" src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        <FeedbackWidget siteName="AgentLogs" accentColor="#22d3ee" position="left" />
        <Analytics />
        <PostHogInit />
        <CookieConsent />
      </body>
    </html>
  );
}
