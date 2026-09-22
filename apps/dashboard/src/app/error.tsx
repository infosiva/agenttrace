'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono">
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-32 text-center">
        <p className="text-sm text-cyan-600">Error</p>
        <h1 className="text-2xl font-semibold text-cyan-300">Something broke on our end</h1>
        <p className="max-w-md text-sm text-cyan-600">
          The trace pipeline hit an unexpected error. Try again, or head back to the dashboard.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={reset}
            className="rounded border border-cyan-900/60 bg-cyan-950/40 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-900/40"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded border border-cyan-900/40 px-4 py-2 text-sm text-cyan-500 hover:bg-cyan-950/30"
          >
            Back to agentlogs.app
          </Link>
        </div>
      </div>
    </div>
  );
}
