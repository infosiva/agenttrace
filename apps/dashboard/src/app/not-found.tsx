import Link from 'next/link';
import AppNav from '@/components/AppNav';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono">
      <AppNav />
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-32 text-center">
        <p className="text-sm text-cyan-600">404</p>
        <h1 className="text-2xl font-semibold text-cyan-300">Trace not found</h1>
        <p className="max-w-md text-sm text-cyan-600">
          This route doesn&apos;t exist, or the trace was never captured.
        </p>
        <Link
          href="/"
          className="mt-4 rounded border border-cyan-900/60 bg-cyan-950/40 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-900/40"
        >
          Back to agentlogs.app
        </Link>
      </div>
    </div>
  );
}
