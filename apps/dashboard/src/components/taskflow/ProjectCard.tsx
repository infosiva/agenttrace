'use client';

import { CheckCircle2, XCircle, SkipForward, Clock, ExternalLink } from 'lucide-react';
import type { PortfolioProject } from '@/lib/taskflow-data';
import { CATEGORY_COLORS, TOOL_COLORS } from '@/lib/taskflow-data';

const STATUS_ICON = {
  done:    { icon: CheckCircle2, color: 'text-green-400',  bg: 'border-green-500/30 bg-green-500/5' },
  failed:  { icon: XCircle,     color: 'text-red-400',    bg: 'border-red-500/30 bg-red-500/5' },
  skipped: { icon: SkipForward, color: 'text-yellow-400', bg: 'border-yellow-500/30 bg-yellow-500/5' },
  manual:  { icon: Clock,       color: 'text-slate-400',  bg: 'border-slate-600 bg-slate-800/30' },
};

interface Props {
  project: PortfolioProject;
  highlight?: boolean;
}

export default function ProjectCard({ project, highlight }: Props) {
  const { icon: Icon, color, bg } = STATUS_ICON[project.status];
  const catStyle = CATEGORY_COLORS[project.category] ?? 'bg-slate-700 text-slate-300 border-slate-600';

  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-300 ${bg} ${
        highlight ? 'ring-2 ring-green-400/40 scale-[1.02]' : 'hover:border-slate-600'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${color}`} />
          <span className="font-semibold text-sm text-slate-100 truncate">{project.name}</span>
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Category + build time */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${catStyle}`}>
          {project.category}
        </span>
        {project.buildMs && (
          <span className="text-[10px] text-slate-500">{(project.buildMs / 1000).toFixed(1)}s build</span>
        )}
        {project.commitHash && (
          <span className="text-[10px] font-mono text-slate-600">{project.commitHash}</span>
        )}
      </div>

      {/* Changes note */}
      <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2">
        {project.changesNote}
      </p>

      {/* Error note */}
      {project.errorNote && (
        <p className="text-[11px] text-red-400 bg-red-950/30 border border-red-900/30 rounded px-2 py-1 mb-3">
          {project.errorNote}
        </p>
      )}

      {/* Tooling badges */}
      <div className="flex flex-wrap gap-1">
        {project.tooling.slice(0, 6).map(tool => (
          <span
            key={tool}
            className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${TOOL_COLORS[tool] ?? 'bg-slate-800 text-slate-400'}`}
          >
            {tool}
          </span>
        ))}
        {project.tooling.length > 6 && (
          <span className="text-[9px] text-slate-600 px-1 py-0.5">+{project.tooling.length - 6}</span>
        )}
      </div>
    </div>
  );
}
