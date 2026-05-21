import { NextResponse, type NextRequest } from 'next/server';
import { db, traces } from '@/lib/db';
import { bearerToken, resolveApiKey } from '@/lib/api-keys';
import { and, eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = bearerToken(req.headers.get('authorization'));
  if (!token) return NextResponse.json({ error: 'missing_api_key' }, { status: 401 });

  const key = await resolveApiKey(token);
  if (!key) return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status : undefined;
  const endNow = status === 'success' || status === 'error';

  const [updated] = await db
    .update(traces)
    .set({
      status,
      outputData: (body.output_data as object) ?? undefined,
      errorMessage: typeof body.error_message === 'string' ? body.error_message : undefined,
      totalTokens: typeof body.total_tokens === 'number' ? body.total_tokens : undefined,
      totalCost: typeof body.total_cost === 'number' ? body.total_cost : undefined,
      durationMs: typeof body.duration_ms === 'number' ? body.duration_ms : undefined,
      endedAt: endNow ? new Date() : undefined,
    })
    .where(and(eq(traces.id, id), eq(traces.projectId, key.projectId)))
    .returning({ id: traces.id });

  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ id: updated.id });
}
