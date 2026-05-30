'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

export interface Issue {
  id: string;
  traceId: string;
  errorType: string;
  status: 'open' | 'triaged' | 'resolved';
  summary: string;
  traceContext?: string;
  createdAt: string; // ISO string
}

const STATUS_STYLES: Record<Issue['status'], string> = {
  open: 'bg-red-500/15 text-red-400 border-red-500/30',
  triaged: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
};

const DEMO_ISSUES: Issue[] = [
  {
    id: 'iss_001',
    traceId: '7f3a9b2c',
    errorType: 'ToolTimeout',
    status: 'open',
    summary: 'fetch_url timed out after 5000ms on step 3',
    traceContext: 'agent: writer-agent | tool: fetch_url | step: 3/5 | url: https://arxiv.org/abs/2401.12345',
    createdAt: new Date(Date.now() - 120_000).toISOString(),
  },
  {
    id: 'iss_002',
    traceId: 'a1c4e8d0',
    errorType: 'RateLimitExceeded',
    status: 'triaged',
    summary: 'OpenAI quota exceeded — fallback to claude-haiku triggered',
    traceContext: 'agent: summarizer | model: gpt-4o | quota: 100% | fallback: claude-3-haiku-20240307',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'iss_003',
    traceId: 'b2d5f9e1',
    errorType: 'ContextWindowExceeded',
    status: 'resolved',
    summary: 'Token count exceeded model context — chunking applied',
    traceContext: 'agent: research-agent | model: claude-3-5-sonnet | tokens: 201,847 | limit: 200k',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function IssueRow({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-900/50 transition-colors"
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        }
        <span className="font-mono text-[10px] text-slate-500 shrink-0 w-20 truncate" title={issue.traceId}>
          {issue.traceId}
        </span>
        <span className="font-mono text-xs text-slate-400 grow truncate">{issue.errorType}</span>
        <span className={`shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_STYLES[issue.status]}`}>
          {issue.status}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-slate-600 ml-2 hidden sm:block">
          {relativeTime(issue.createdAt)}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 ml-6 space-y-2">
          <p className="font-mono text-xs text-slate-300">{issue.summary}</p>
          {issue.traceContext && (
            <pre className="font-mono text-[10px] text-slate-500 bg-black/60 border border-slate-800 rounded px-3 py-2 overflow-x-auto whitespace-pre-wrap">
              {issue.traceContext}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function IssueInbox({ projectId }: { projectId?: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    // Load from localStorage (key scoped by project), fall back to demo data
    const key = `agenttrace-issues${projectId ? `-${projectId}` : ''}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setIssues(JSON.parse(stored) as Issue[]);
      } else {
        setIssues(DEMO_ISSUES);
      }
    } catch {
      setIssues(DEMO_ISSUES);
    }
  }, [projectId]);

  const openCount = issues.filter(i => i.status === 'open').length;

  return (
    <section className="border border-slate-800 rounded-lg bg-slate-950/60 overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Issue inbox</h2>
        {openCount > 0 && (
          <span className="font-mono text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">
            {openCount} open
          </span>
        )}
      </div>
      {issues.length === 0 ? (
        <div className="p-8 text-center font-mono text-sm text-slate-500">No issues — all clear.</div>
      ) : (
        <div>
          {issues.map(issue => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </section>
  );
}
