import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db, projects } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import { getPlan } from '@/lib/plan-db';
import { canCreateProject } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'project';
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt));

  return NextResponse.json({ projects: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { name?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const name = (body.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });

  const plan = await getPlan(session.user.id);
  const existing = await db.select({ id: projects.id }).from(projects).where(eq(projects.userId, session.user.id));
  if (!canCreateProject(plan, existing.length)) {
    return NextResponse.json({ error: 'project_limit_reached', plan, upgrade_url: '/pricing' }, { status: 402 });
  }

  const [project] = await db
    .insert(projects)
    .values({ userId: session.user.id, name, slug: slugify(name) })
    .returning();

  return NextResponse.json({ project });
}
