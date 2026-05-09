import type { SiteStats } from './tracker-client';

export async function generateDiagnosis(site: string, stats: SiteStats): Promise<string> {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) return 'AI diagnosis unavailable — GROQ_API_KEY not set.';

  const prompt = `You are an analytics expert. Analyse this 7-day traffic report for ${site} and give a 2-3 sentence plain-English diagnosis. Focus on what changed, why it likely happened, and one specific recommendation. Be concrete, not generic.

Data:
- Views: ${stats.views} (trend vs last week: ${stats.viewsTrend !== null ? `${stats.viewsTrend > 0 ? '+' : ''}${stats.viewsTrend.toFixed(1)}%` : 'unknown'})
- Unique visitors: ${stats.sessions}
- Avg session: ${stats.avgSessionSecs}s, ${stats.avgPages} pages
- Top pages: ${stats.topPages.slice(0, 5).map(p => `${p.path} (${p.views} views)`).join(', ')}
- User feedback avg rating: ${stats.feedbackAvgRating !== null ? `${stats.feedbackAvgRating.toFixed(1)}/5 (${stats.feedbackCount} reviews)` : 'none'}
- Recent feedback: ${stats.recentFeedback.slice(0, 2).map(f => `"${f.message}"`).join('; ') || 'none'}

Respond with just the diagnosis text. No bullet points. No markdown. 2-3 sentences max.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.3,
    }),
  });

  if (!res.ok) return 'AI diagnosis temporarily unavailable.';
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? 'No diagnosis generated.';
}
