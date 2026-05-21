import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db, apiKeys, projects } from '@/lib/db';
import { generateApiKey } from '@/lib/api-keys';
import { and, desc, eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function assertProjectOwner(projectId: string, userId: string) {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  return Boolean(row);
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  if (!(await assertProjectOwner(id, session.user.id))) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.projectId, id))
    .orderBy(desc(apiKeys.createdAt));
  return NextResponse.json({ keys: rows });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  if (!(await assertProjectOwner(id, session.user.id))) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  let body: { name?: string };
  try { body = await req.json(); } catch { body = {}; }
  const name = (body.name ?? 'default').trim() || 'default';

  const { fullKey, hash, prefix } = generateApiKey();
  const [row] = await db
    .insert(apiKeys)
    .values({ projectId: id, keyHash: hash, keyPrefix: prefix, name })
    .returning({ id: apiKeys.id, name: apiKeys.name, createdAt: apiKeys.createdAt });

  // Plain key is only ever returned at creation time — store it now or never.
  return NextResponse.json({ id: row.id, name: row.name, created_at: row.createdAt, key: fullKey });
}
