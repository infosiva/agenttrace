// src/lib/tracker-client.ts

export interface SiteStats {
  site: string;
  views: number;
  sessions: number;
  avgSessionSecs: number;
  avgPages: number;
  topPages: { path: string; views: number }[];
  feedbackAvgRating: number | null;
  feedbackCount: number;
  recentFeedback: { rating: number | null; message: string; path: string | null; date: string }[];
  topEvents: { name: string; count: number }[];
  deviceSplit: { mobile: number; desktop: number; bot: number };
  // 7d vs prev 7d for trend
  viewsTrend: number | null; // percentage change, null if no prev data
}

export interface PortfolioStats {
  totalViews: number;
  totalSessions: number;
  bySite: { site: string; views: number; sessions: number }[];
  periodDays: number;
}

export type HealthStatus = 'red' | 'yellow' | 'green' | 'unknown';

export interface SiteHealth {
  status: HealthStatus;
  reason: string; // human-readable reason for the status
}

/**
 * Compute red/yellow/green status from stats.
 * Rules:
 *   red:    views === 0 for 7 days
 *   yellow: viewsTrend < -15% week-over-week
 *   green:  everything else with data
 *   unknown: no stats data at all (tracker not installed)
 */
export function computeHealth(stats: SiteStats | null): SiteHealth {
  if (!stats) return { status: 'unknown', reason: 'No tracker data — snippet not installed' };
  if (stats.views === 0) return { status: 'red', reason: 'Zero views in 7 days' };
  if (stats.viewsTrend !== null && stats.viewsTrend < -15) {
    return { status: 'yellow', reason: `Traffic down ${Math.abs(Math.round(stats.viewsTrend))}% week-over-week` };
  }
  return { status: 'green', reason: 'Healthy' };
}
