import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db, projects } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import { SettingsClient } from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/settings');
  }

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt));

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-8">
          <p className="text-xs text-green-600 uppercase tracking-widest mb-2">// settings</p>
          <h1 className="text-3xl font-bold text-white">Projects + API keys</h1>
          <p className="text-sm text-slate-400 mt-1">
            Signed in as <span className="text-green-400">{session.user.email}</span>
          </p>
        </header>

        <SettingsClient
          initialProjects={userProjects.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
