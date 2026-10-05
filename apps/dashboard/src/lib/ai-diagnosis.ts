import type { SiteStats } from './tracker-client';
import { callAI } from './ai';

const SYSTEM_PROMPT = 'You are an analytics expert. Respond with just the diagnosis text. No bullet points. No markdown. 2-3 sentences max.';

export async function generateDiagnosis(site: string, stats: SiteStats): Promise<string> {
  const prompt = `You are an analytics expert. Analyse this 7-day traffic report for ${site} and give a 2-3 sentence plain-English diagnosis. Focus on what changed, why it likely happened, and one specific recommendation. Be concrete, not generic.

Data:
- Views: ${stats.views} (trend vs last week: ${stats.viewsTrend !== null ? `${stats.viewsTrend > 0 ? '+' : ''}${stats.viewsTrend.toFixed(1)}%` : 'unknown'})
- Unique visitors: ${stats.sessions}
- Avg session: ${stats.avgSessionSecs}s, ${stats.avgPages} pages
- Top pages: ${stats.topPages.slice(0, 5).map(p => `${p.path} (${p.views} views)`).join(', ')}
- User feedback avg rating: ${stats.feedbackAvgRating !== null ? `${stats.feedbackAvgRating.toFixed(1)}/5 (${stats.feedbackCount} reviews)` : 'none'}
- Recent feedback: ${stats.recentFeedback.slice(0, 2).map(f => `"${f.message}"`).join('; ') || 'none'}

Respond with just the diagnosis text. No bullet points. No markdown. 2-3 sentences max.`;

  try {
    const t0 = Date.now();
    const res = await callAI(SYSTEM_PROMPT, [{ role: 'user', content: prompt }], 300, 'fast');
    console.log(JSON.stringify({ evt: 'ai_diagnosis', provider: res.provider, model: res.model, ms: Date.now() - t0 }));
    return res.text.trim() || 'No diagnosis generated.';
  } catch {
    return 'AI diagnosis temporarily unavailable.';
  }
}
