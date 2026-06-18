'use client';

import { useEffect, useRef, useState } from 'react';
import { BUILD_EVENTS, type BuildEvent } from '@/lib/taskflow-data';

const LEVEL_STYLE: Record<BuildEvent['level'], string> = {
  INFO:  'text-green-400',
  WARN:  'text-yellow-400',
  ERROR: 'text-red-400',
  DONE:  'text-green-300 font-semibold',
  SKIP:  'text-slate-500',
  BUILD: 'text-cyan-400',
  PUSH:  'text-blue-400',
};

const TICK_MS = 120; // speed — ms between events in replay

export default function LiveFeed() {
  const [visible, setVisible] = useState<BuildEvent[]>([]);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const idx = idxRef.current;
      if (idx >= BUILD_EVENTS.length) {
        setRunning(false);
        return;
      }
      const ev = BUILD_EVENTS[idx];
      if (!ev) { setRunning(false); return; }
      setVisible(prev => [...prev, ev]);
      idxRef.current = idx + 1;
    }, TICK_MS / speed);
    return () => clearInterval(interval);
  }, [running, speed]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visible]);

  function restart() {
    idxRef.current = 0;
    setVisible([]);
    setRunning(true);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 bg-black/40">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${running ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            {running ? 'replaying' : 'complete'}
          </span>
        </div>
        <span className="text-[10px] text-slate-600 tabular-nums">{visible.length}/{BUILD_EVENTS.length} events</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-slate-500">speed</span>
          {[1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                speed === s
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={restart}
            className="text-[10px] text-slate-500 hover:text-slate-300 ml-2 transition-colors"
          >
            restart
          </button>
        </div>
      </div>

      {/* Feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-[11px] scroll-smooth"
        style={{ maxHeight: 480 }}
      >
        {visible.map((ev, i) => (
          <div
            key={i}
            className="flex gap-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-150"
          >
            <span className="text-slate-700 shrink-0 tabular-nums">
              {String(Math.floor(ev.ts / 1000)).padStart(3, '0')}s
            </span>
            <span className={`shrink-0 w-10 ${LEVEL_STYLE[ev.level]}`}>[{ev.level}]</span>
            <span className="text-slate-500 shrink-0 w-28 truncate">{ev.project}</span>
            <span className="text-slate-300">{ev.msg}</span>
          </div>
        ))}
        {!running && visible.length > 0 && (
          <div className="pt-2 text-[10px] text-slate-600 border-t border-slate-900 mt-2">
            — session complete —
          </div>
        )}
      </div>
    </div>
  );
}
