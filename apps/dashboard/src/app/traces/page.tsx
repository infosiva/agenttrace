'use client';

import { Activity, Clock, DollarSign, Search, Filter, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Trace {
  id: string;
  name: string;
  status: 'success' | 'error' | 'running';
  duration: string;
  tokens: number;
  cost: string;
  timestamp: string;
  steps: number;
}

const mockTraces: Trace[] = [
  {
    id: 'trace_1',
    name: 'user-query-agent',
    status: 'success',
    duration: '1.2s',
    tokens: 450,
    cost: '$0.012',
    timestamp: '2 minutes ago',
    steps: 3,
  },
  {
    id: 'trace_2',
    name: 'document-analyzer',
    status: 'success',
    duration: '3.5s',
    tokens: 1200,
    cost: '$0.034',
    timestamp: '5 minutes ago',
    steps: 5,
  },
  {
    id: 'trace_3',
    name: 'code-reviewer',
    status: 'error',
    duration: '2.1s',
    tokens: 800,
    cost: '$0.021',
    timestamp: '8 minutes ago',
    steps: 4,
  },
  {
    id: 'trace_4',
    name: 'data-extraction-agent',
    status: 'success',
    duration: '4.2s',
    tokens: 1500,
    cost: '$0.045',
    timestamp: '12 minutes ago',
    steps: 6,
  },
  {
    id: 'trace_5',
    name: 'sentiment-analyzer',
    status: 'success',
    duration: '0.8s',
    tokens: 320,
    cost: '$0.008',
    timestamp: '15 minutes ago',
    steps: 2,
  },
  {
    id: 'trace_6',
    name: 'translation-agent',
    status: 'error',
    duration: '1.5s',
    tokens: 600,
    cost: '$0.015',
    timestamp: '18 minutes ago',
    steps: 3,
  },
];

export default function TracesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');

  const filteredTraces = mockTraces.filter((trace) => {
    const matchesSearch = trace.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trace.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-xl">AgentTrace</span>
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/traces" className="text-blue-600 font-medium">
                  Traces
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/docs" className="text-gray-600 hover:text-blue-600">
                  Docs
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                demo-project
              </span>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Trace Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and analyze all your agent execution traces
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search traces by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    statusFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('success')}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    statusFilter === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  Success
                </button>
                <button
                  onClick={() => setStatusFilter('error')}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    statusFilter === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  Errors
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-600 dark:text-gray-400">
              <div className="col-span-4">Agent Name</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Tokens</div>
              <div className="col-span-1">Cost</div>
              <div className="col-span-1">Steps</div>
            </div>

            {filteredTraces.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                No traces found matching your filters
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTraces.map((trace) => (
                  <TraceRow key={trace.id} trace={trace} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Not seeing any traces?
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            Install the SDK in your agent to start capturing traces:
          </p>
          <pre className="bg-white dark:bg-gray-900 p-4 rounded-md text-sm overflow-x-auto border border-blue-200 dark:border-blue-800">
            <code>pip install agenttrace-sdk</code>
          </pre>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700"
          >
            View documentation
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

function TraceRow({ trace }: { trace: Trace }) {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer">
      <div className="col-span-4 flex items-center gap-3">
        <div
          className={`h-2 w-2 rounded-full ${
            trace.status === 'success'
              ? 'bg-green-500'
              : trace.status === 'error'
              ? 'bg-red-500'
              : 'bg-yellow-500'
          }`}
        />
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {trace.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {trace.timestamp}
          </div>
        </div>
      </div>
      <div className="col-span-2 flex items-center">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trace.status === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : trace.status === 'error'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
        >
          {trace.status === 'success' ? (
            <CheckCircle className="h-3 w-3" />
          ) : trace.status === 'error' ? (
            <XCircle className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          {trace.status}
        </span>
      </div>
      <div className="col-span-2 flex items-center text-gray-900 dark:text-white">
        <Clock className="h-4 w-4 mr-2 text-gray-400" />
        {trace.duration}
      </div>
      <div className="col-span-2 flex items-center text-gray-900 dark:text-white">
        <Activity className="h-4 w-4 mr-2 text-gray-400" />
        {trace.tokens.toLocaleString()}
      </div>
      <div className="col-span-1 flex items-center text-gray-900 dark:text-white">
        <DollarSign className="h-4 w-4 text-gray-400" />
        {trace.cost.replace('$', '')}
      </div>
      <div className="col-span-1 flex items-center justify-between text-gray-900 dark:text-white">
        {trace.steps}
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
