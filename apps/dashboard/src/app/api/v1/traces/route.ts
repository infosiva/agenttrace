import { NextResponse, type NextRequest } from 'next/server';
import { db, traces, apiKeys } from '@/lib/db';
import { bearerToken, resolveApiKey } from '@/lib/api-keys';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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

  const name = typeof body.name === 'string' ? body.name : null;
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });

  const [trace] = await db
    .insert(traces)
    .values({
      projectId: key.projectId,
      name,
      status: 'running',
      inputData: (body.input_data as object) ?? null,
      metadata: (body.metadata as object) ?? null,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : null,
    })
    .returning({ id: traces.id, startedAt: traces.startedAt });

  // Touch last_used_at on the API key (fire-and-forget)
  void db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.apiKeyId));

  return NextResponse.json({ id: trace.id, started_at: trace.startedAt });
}
