'use client';

import { useState, useEffect } from 'react';
import { Copy, Plus, Trash2, Key, FolderPlus, Check, Loader2 } from 'lucide-react';

type Project = { id: string; name: string; slug: string; createdAt: string };
type ApiKey = { id: string; name: string; keyPrefix: string; lastUsedAt: string | null; createdAt: string };

export function SettingsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialProjects[0]?.id ?? null);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    if (!activeProjectId && projects.length > 0) setActiveProjectId(projects[0].id);
  }, [activeProjectId, projects]);

  async function createProject() {
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      if (!res.ok) throw new Error('create_failed');
      const data = await res.json();
      const p: Project = {
        id: data.project.id,
        name: data.project.name,
        slug: data.project.slug,
        createdAt: data.project.createdAt,
      };
      setProjects(prev => [p, ...prev]);
      setActiveProjectId(p.id);
      setNewProjectName('');
    } finally {
      setCreatingProject(false);
    }
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      <aside className="border border-slate-800 rounded-lg p-4 bg-slate-950/60 h-fit">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Projects</h2>
        <div className="space-y-1">
          {projects.length === 0 && (
            <p className="text-xs text-slate-500 italic">No projects yet. Create one →</p>
          )}
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProjectId(p.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                activeProjectId === p.id
                  ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
          <input
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createProject()}
            placeholder="New project name"
            className="w-full bg-black/40 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500/60"
          />
          <button
            onClick={createProject}
            disabled={creatingProject || !newProjectName.trim()}
            className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-slate-800 disabled:text-slate-500 text-black font-semibold text-xs py-2 rounded"
          >
            {creatingProject ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderPlus className="w-3 h-3" />}
            Create project
          </button>
        </div>
      </aside>

      <section>
        {activeProjectId ? (
          <KeysPanel projectId={activeProjectId} />
        ) : (
          <div className="border border-slate-800 rounded-lg p-12 text-center bg-slate-950/60">
            <p className="text-slate-500">Create a project on the left to get started.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function KeysPanel({ projectId }: { projectId: string }) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ id: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setRevealed(null);
    fetch(`/api/projects/${projectId}/keys`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setKeys(data.keys ?? []);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [projectId]);

  async function createKey() {
    setCreating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/keys`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'sdk' }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setRevealed({ id: data.id, key: data.key });
      // Refresh list
      const list = await fetch(`/api/projects/${projectId}/keys`).then(r => r.json());
      setKeys(list.keys ?? []);
    } finally {
      setCreating(false);
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Revoke this API key? Any SDK using it will stop working immediately.')) return;
    const res = await fetch(`/api/projects/${projectId}/keys/${id}`, { method: 'DELETE' });
    if (res.ok) setKeys(prev => prev.filter(k => k.id !== id));
  }

  function copy(value: string) {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">API Keys</h2>
          <p className="text-xs text-slate-500 mt-1">Use these to authenticate SDK requests.</p>
        </div>
        <button
          onClick={createKey}
          disabled={creating}
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-slate-700 text-black font-semibold text-xs px-3 py-2 rounded"
        >
          {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          New key
        </button>
      </div>

      {revealed && (
        <div className="border border-green-500/40 bg-green-950/20 rounded-lg p-4">
          <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-2">
            Save this key now — it won&apos;t be shown again
          </p>
          <div className="flex items-center gap-2 bg-black/60 border border-slate-800 rounded px-3 py-2">
            <code className="flex-1 text-xs text-green-300 break-all">{revealed.key}</code>
            <button
              onClick={() => copy(revealed.key)}
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-green-300"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Set as <code className="text-green-400">AGENTLOGS_API_KEY</code> in your environment.
          </p>
        </div>
      )}

      <div className="border border-slate-800 rounded-lg bg-slate-950/60 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
            Loading keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <Key className="w-6 h-6 mx-auto mb-2 opacity-40" />
            No API keys yet. Create one to start sending traces.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 bg-black/40">
              <tr>
                <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Name</th>
                <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Prefix</th>
                <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Last used</th>
                <th className="text-left text-xs uppercase text-slate-500 px-4 py-2 font-semibold">Created</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} className="border-b border-slate-900 last:border-0">
                  <td className="px-4 py-3 text-slate-200">{k.name}</td>
                  <td className="px-4 py-3 text-green-400 font-mono text-xs">{k.keyPrefix}…</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteKey(k.id)}
                      className="text-slate-500 hover:text-red-400"
                      title="Revoke"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
