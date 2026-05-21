import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db, apiKeys, projects } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; keyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id, keyId } = await ctx.params;

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
    .limit(1);
  if (!project) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await db.delete(apiKeys).where(and(eq(apiKeys.id, keyId), eq(apiKeys.projectId, id)));
  return NextResponse.json({ ok: true });
}
