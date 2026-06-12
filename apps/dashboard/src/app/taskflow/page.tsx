'use client';

import { useState, useMemo } from 'react';
import { BarChart2, CheckCircle2, XCircle, SkipForward, Terminal, Filter, Wrench } from 'lucide-react';
import ProjectCard from '@/components/taskflow/ProjectCard';
import LiveFeed from '@/components/taskflow/LiveFeed';
import {
  PORTFOLIO_PROJECTS,
  getToolingStats,
  type ProjectStatus,
} from '@/lib/taskflow-data';

const STATUS_LABELS: Record<ProjectStatus | 'all', string> = {
  all:     'All',
  done:    'Done',
  failed:  'Failed',
  skipped: 'Skipped',
  manual:  'Manual',
};

const ALL_CATEGORIES = ['All', ...Array.from(new Set(PORTFOLIO_PROJECTS.map(p => p.category))).sort()];

export default function TaskFlowPage() {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toolFilter, setToolFilter] = useState('');
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);

  const stats = useMemo(() => ({
    done:    PORTFOLIO_PROJECTS.filter(p => p.status === 'done').length,
    failed:  PORTFOLIO_PROJECTS.filter(p => p.status === 'failed').length,
    skipped: PORTFOLIO_PROJECTS.filter(p => p.status === 'skipped').length,
    total:   PORTFOLIO_PROJECTS.length,
  }), []);

  const toolingStats = useMemo(() => getToolingStats(PORTFOLIO_PROJECTS), []);

  const filtered = useMemo(() => PORTFOLIO_PROJECTS.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (toolFilter && !p.tooling.some(t => t.toLowerCase().includes(toolFilter.toLowerCase()))) return false;
    return true;
  }), [statusFilter, categoryFilter, toolFilter]);

  const avgBuild = useMemo(() => {
    const withBuild = PORTFOLIO_PROJECTS.filter(p => p.buildMs);
    if (!withBuild.length) return 0;
    return Math.round(withBuild.reduce((s, p) => s + (p.buildMs ?? 0), 0) / withBuild.length / 1000);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-mono">
      {/* Page header */}
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-xs text-green-600 uppercase tracking-widest mb-1">// taskflow — build wave 2026-06-12</p>
        <h1 className="text-2xl font-bold text-white">Portfolio Build Wave</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          27 repos — what we built, what tooling we used, how each project was customised
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 px-6 py-4 border-b border-slate-800">
        <Stat icon={CheckCircle2} label="Pushed" value={stats.done} accent="text-green-400" />
        <Stat icon={XCircle}      label="Failed"  value={stats.failed}  accent="text-red-400" />
        <Stat icon={SkipForward}  label="Skipped" value={stats.skipped} accent="text-yellow-400" />
        <Stat icon={BarChart2}    label="Total repos" value={stats.total} accent="text-blue-400" />
        <Stat icon={Terminal}     label="Avg build" value={`${avgBuild}s`} accent="text-cyan-400" />
      </div>

      <div className="flex min-h-0">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-slate-800 p-4 gap-6">
          {/* Status filter */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status
            </p>
            <div className="space-y-1">
              {(Object.keys(STATUS_LABELS) as (ProjectStatus | 'all')[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                    statusFilter === s
                      ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {STATUS_LABELS[s]}
                  <span className="float-right text-slate-600 text-[10px]">
                    {s === 'all' ? PORTFOLIO_PROJECTS.length : PORTFOLIO_PROJECTS.filter(p => p.status === s).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Category</p>
            <div className="space-y-1">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                    categoryFilter === cat
                      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {cat}
                  <span className="float-right text-slate-600 text-[10px]">
                    {cat === 'All' ? PORTFOLIO_PROJECTS.length : PORTFOLIO_PROJECTS.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tool search */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> Tool filter
            </p>
            <input
              type="text"
              value={toolFilter}
              onChange={e => setToolFilter(e.target.value)}
              placeholder="e.g. Groq, framer..."
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Top tools */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Top tools</p>
            <div className="space-y-1.5">
              {toolingStats.slice(0, 12).map(({ tool, count }) => (
                <button
                  key={tool}
                  onClick={() => setToolFilter(tool)}
                  className="w-full flex items-center justify-between group"
                >
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-200 truncate">{tool}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className="h-1 rounded-full bg-slate-700 group-hover:bg-green-700 transition-colors"
                      style={{ width: `${Math.round((count / toolingStats[0].count) * 40)}px` }}
                    />
                    <span className="text-[10px] text-slate-600 tabular-nums w-4 text-right">{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-0">
          {/* Project grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">
                Showing {filtered.length} of {PORTFOLIO_PROJECTS.length} projects
              </p>
              {toolFilter && (
                <button
                  onClick={() => setToolFilter('')}
                  className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                >
                  clear filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(p => (
                <div key={p.slug} onMouseEnter={() => setHighlightSlug(p.slug)} onMouseLeave={() => setHighlightSlug(null)}>
                  <ProjectCard project={p} highlight={highlightSlug === p.slug} />
                </div>
              ))}
            </div>
          </div>

          {/* Live feed panel */}
          <div className="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Live Build Feed</span>
              <span className="text-[10px] text-slate-600 ml-1">session replay</span>
            </div>
            <LiveFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: {
  icon: typeof CheckCircle2;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-lg p-3">
      <Icon className={`w-4 h-4 shrink-0 ${accent}`} />
      <div>
        <div className={`text-lg font-bold tabular-nums ${accent}`}>{value}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}
