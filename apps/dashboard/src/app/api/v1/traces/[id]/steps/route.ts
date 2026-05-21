import { NextResponse, type NextRequest } from 'next/server';
import { db, steps, traces } from '@/lib/db';
import { bearerToken, resolveApiKey } from '@/lib/api-keys';
import { and, eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: traceId } = await ctx.params;
  const token = bearerToken(req.headers.get('authorization'));
  if (!token) return NextResponse.json({ error: 'missing_api_key' }, { status: 401 });

  const key = await resolveApiKey(token);
  if (!key) return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 });

  // Make sure the trace belongs to the authenticated project before inserting
  const [trace] = await db
    .select({ id: traces.id })
    .from(traces)
    .where(and(eq(traces.id, traceId), eq(traces.projectId, key.projectId)))
    .limit(1);
  if (!trace) return NextResponse.json({ error: 'trace_not_found' }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name : null;
  const type = typeof body.type === 'string' ? body.type : 'other';
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });

  const [step] = await db
    .insert(steps)
    .values({
      traceId,
      name,
      type,
      status: typeof body.status === 'string' ? body.status : 'success',
      input: (body.input as object) ?? null,
      output: (body.output as object) ?? null,
      metadata: (body.metadata as object) ?? null,
      tokens: typeof body.tokens === 'number' ? body.tokens : null,
      cost: typeof body.cost === 'number' ? body.cost : null,
      durationMs: typeof body.duration_ms === 'number' ? body.duration_ms : null,
      errorMessage: typeof body.error_message === 'string' ? body.error_message : null,
      sequence: typeof body.sequence === 'number' ? body.sequence : 0,
      endedAt: body.ended_at ? new Date(body.ended_at as string) : null,
    })
    .returning({ id: steps.id });

  return NextResponse.json({ id: step.id });
}
