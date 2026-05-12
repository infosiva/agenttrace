import { Activity, Clock, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { TracesAreaChart } from '@/components/tremor';
import type { TraceDataPoint } from '@/components/tremor';

const CHART_DATA: TraceDataPoint[] = [
  { date: 'May 04', traces: 320, errors: 12 },
  { date: 'May 05', traces: 480, errors: 8 },
  { date: 'May 06', traces: 410, errors: 15 },
  { date: 'May 07', traces: 650, errors: 4 },
  { date: 'May 08', traces: 720, errors: 6 },
  { date: 'May 09', traces: 540, errors: 9 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">AgentTrace</span>
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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your AI agents in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Traces"
            value="1,234"
            change="+12.5%"
            icon={<Activity className="h-5 w-5" />}
          />
          <MetricCard
            title="Avg Duration"
            value="2.3s"
            change="-5.2%"
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Cost"
            value="$45.32"
            change="+8.1%"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Error Rate"
            value="2.1%"
            change="-1.2%"
            icon={<AlertCircle className="h-5 w-5" />}
            trend="down"
          />
        </div>

        {/* Tremor area chart */}
        <div className="mb-6">
          <TracesAreaChart data={CHART_DATA} title="Trace volume — last 6 days" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Traces</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Demo data</span>
          </div>
          <div className="space-y-3">
            <TraceRow
              name="user-query-agent"
              duration="1.2s"
              tokens="450"
              cost="$0.012"
              status="success"
              timestamp="2 minutes ago"
            />
            <TraceRow
              name="document-analyzer"
              duration="3.5s"
              tokens="1200"
              cost="$0.034"
              status="success"
              timestamp="5 minutes ago"
            />
            <TraceRow
              name="code-reviewer"
              duration="2.1s"
              tokens="800"
              cost="$0.021"
              status="error"
              timestamp="8 minutes ago"
            />
          </div>
          {/* Empty state / connect CTA */}
          <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-5">
            <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 p-6 text-center">
              <Activity className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No live traces yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 max-w-xs mx-auto">
                Connect your agent to start seeing real trace data here. Takes 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a href="/docs" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  View quickstart guide →
                </a>
                <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:border-gray-300 transition">
                  Browse integrations
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Getting Started
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            Install the SDK and start tracing your agents:
          </p>
          <pre className="bg-white dark:bg-gray-900 p-4 rounded-md text-sm overflow-x-auto border border-blue-200 dark:border-blue-800">
            <code>pip install agenttrace-sdk</code>
          </pre>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
  trend = 'up',
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}) {
  const isPositive = trend === 'up' ? change.startsWith('+') : change.startsWith('-');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <div
        className={`text-sm flex items-center gap-1 ${
          isPositive
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {change} from last week
      </div>
    </div>
  );
}

function TraceRow({
  name,
  duration,
  tokens,
  cost,
  status,
  timestamp,
}: {
  name: string;
  duration: string;
  tokens: string;
  cost: string;
  status: 'success' | 'error';
  timestamp: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer gap-3 sm:gap-0">
      <div className="flex items-center gap-3">
        <div
          className={`h-2 w-2 rounded-full shrink-0 ${
            status === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <div className="min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate">{name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp} · {status === 'error' ? <span className="text-red-500">error</span> : <span className="text-green-600 dark:text-green-400">success</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm pl-5 sm:pl-0">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Duration: </span>
          <span className="text-gray-900 dark:text-white font-medium">{duration}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Tokens: </span>
          <span className="text-gray-900 dark:text-white font-medium">{tokens}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Cost: </span>
          <span className="text-gray-900 dark:text-white font-medium">{cost}</span>
        </div>
      </div>
    </div>
  );
}
