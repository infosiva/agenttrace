// src/lib/sites-registry.ts

export type SiteStatus = 'red' | 'yellow' | 'green' | 'unknown';

export interface SiteConfig {
  slug: string;          // url-safe id, e.g. "kwizzo"
  name: string;          // display name, e.g. "Kwizzo"
  domain: string;        // e.g. "kwizzo.app"
  trackerSite: string;   // value sent to tracker-api, e.g. "https://kwizzo.app"
  vercelProject?: string; // Vercel project name, optional
}

export const SITES: SiteConfig[] = [
  { slug: 'nammatamil', name: 'NammaTamil', domain: 'nammatamil.live', trackerSite: 'https://nammatamil.live' },
  { slug: 'kwizzo', name: 'Kwizzo', domain: 'kwizzo.app', trackerSite: 'https://kwizzo.app', vercelProject: 'kwizzo' },
  { slug: 'tutiq', name: 'Tutiq', domain: 'tutiq.app', trackerSite: 'https://tutiq.app', vercelProject: 'nudge' },
  { slug: 'quizbites', name: 'QuizBites', domain: 'quizbites.app', trackerSite: 'https://quizbites.app', vercelProject: 'questly' },
  { slug: 'quizbytes', name: 'QuizBytes', domain: 'quizbytes.dev', trackerSite: 'https://quizbytes.dev' },
  { slug: 'worldtrends', name: 'WorldTrends', domain: 'worldtrends.today', trackerSite: 'https://worldtrends.today' },
  { slug: 'clawdbotai', name: 'ClawdbotAI', domain: 'clawdbotai.tech', trackerSite: 'https://clawdbotai.tech' },
  { slug: 'quicktech', name: 'QuickTech', domain: 'quicktechai.app', trackerSite: 'https://quicktechai.app' },
  { slug: 'aijobs', name: 'AI Jobs Portal', domain: 'aijobsportal.app', trackerSite: 'https://www.aijobsportal.app' },
  { slug: 'flightbrain', name: 'FlightBrain', domain: 'flightbrain.app', trackerSite: 'https://flightbrain.app' },
  { slug: 'resumevault', name: 'ResumeVault', domain: 'resumevault.app', trackerSite: 'https://resumevault.app', vercelProject: 'ai-resume-builder' },
  { slug: 'draftcal', name: 'DraftCal', domain: 'draftcal.app', trackerSite: 'https://draftcal.app', vercelProject: 'social-media-calendar' },
  { slug: 'trackwealth', name: 'TrackWealth', domain: 'trackwealth.app', trackerSite: 'https://trackwealth.app', vercelProject: 'ai-investment-tracker' },
  { slug: 'roamplan', name: 'RoamPlan', domain: 'roamplan.app', trackerSite: 'https://roamplan.app', vercelProject: 'ai-travel-planner' },
  { slug: 'speakiq', name: 'SpeakIQ', domain: 'speakiq.app', trackerSite: 'https://speakiq.app', vercelProject: 'language-learning-bot' },
  { slug: 'agentlogs', name: 'AgentLogs', domain: 'agentlogs.app', trackerSite: 'https://agentlogs.app', vercelProject: 'agenttrace' },
  { slug: 'pixelforge', name: 'PixelForge', domain: 'arcadeforge.app', trackerSite: 'https://arcadeforge.app', vercelProject: 'pixelforge' },
  { slug: 'complyscan', name: 'ComplyScan', domain: 'complyscan.app', trackerSite: 'https://complyscan.app', vercelProject: 'complybuddy' },
];

export function getSiteBySlug(slug: string): SiteConfig | undefined {
  return SITES.find(s => s.slug === slug);
}
