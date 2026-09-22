import { NextResponse, type NextRequest } from 'next/server';
import { db, steps, traces, replays } from '@/lib/db';
import { bearerToken, resolveApiKey } from '@/lib/api-keys';
import { API_LIMITER } from '@/lib/rateLimit';
import { and, eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Root-cause replay: re-run a failed/suspect LLM step's captured input against
// Groq (our own key) and store the new output next to the original for diffing.
// This does NOT call the step's original provider (we don't hold user provider
// keys) — it's a comparison replay, not a byte-identical rerun. Labeled as such
// in the response so the UI never implies it hit the original model.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const limited = await API_LIMITER.check(req); if (limited) return limited
  const { id: stepId } = await ctx.params;
  const token = bearerToken(req.headers.get('authorization'));
  if (!token) return NextResponse.json({ error: 'missing_api_key' }, { status: 401 });

  const key = await resolveApiKey(token);
  if (!key) return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 });

  const [row] = await db
    .select({ step: steps, traceProjectId: traces.projectId })
    .from(steps)
    .innerJoin(traces, eq(steps.traceId, traces.id))
    .where(and(eq(steps.id, stepId), eq(traces.projectId, key.projectId)))
    .limit(1);
  if (!row) return NextResponse.json({ error: 'step_not_found' }, { status: 404 });

  if (row.step.type !== 'llm') {
    return NextResponse.json({ error: 'only_llm_steps_replayable' }, { status: 400 });
  }

  const messages = extractMessages(row.step.input);
  if (!messages.length) {
    return NextResponse.json({ error: 'no_replayable_input' }, { status: 400 });
  }

  const groqKey = process.env.GROQ_API_KEY || '';
  if (!groqKey) return NextResponse.json({ error: 'replay_unavailable' }, { status: 503 });

  const startedAt = Date.now();
  let newStatus: 'success' | 'error' = 'success';
  let newOutput: unknown = null;
  let newErrorMessage: string | null = null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 1000 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `groq_${res.status}`);
    newOutput = { generations: [[data.choices?.[0]?.message?.content ?? '']] };
  } catch (err) {
    newStatus = 'error';
    newErrorMessage = err instanceof Error ? err.message : 'replay_failed';
  }

  const durationMs = Date.now() - startedAt;

  const [replay] = await db
    .insert(replays)
    .values({
      stepId,
      traceId: row.step.traceId,
      newOutput: newOutput as object | null,
      newStatus,
      newErrorMessage,
      durationMs,
    })
    .returning();

  return NextResponse.json({
    id: replay.id,
    status: newStatus,
    output: newOutput,
    errorMessage: newErrorMessage,
    durationMs,
    note: 'Replayed against Groq (comparison model) — not the step\'s original provider.',
    original: { output: row.step.output, metadata: row.step.metadata },
  });
}

function extractMessages(input: unknown): { role: string; content: string }[] {
  if (!input || typeof input !== 'object') return [];
  const obj = input as Record<string, unknown>;
  const raw = obj.messages;
  if (!Array.isArray(raw)) return [];
  // LangChain handler stores messages as [[{role, content}, ...]] (batches)
  const batch = Array.isArray(raw[0]) ? raw[0] : raw;
  return (batch as { role?: string; content?: string }[])
    .filter(m => typeof m?.content === 'string')
    .map(m => ({ role: m.role === 'human' ? 'user' : m.role === 'ai' ? 'assistant' : (m.role || 'user'), content: m.content! }));
}
