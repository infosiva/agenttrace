import { Check, ExternalLink, Code } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';

interface Integration {
  name: string;
  logo: string;
  description: string;
  status: 'Available' | 'Coming Soon';
  category: 'Framework' | 'LLM Provider';
  features: string[];
  docsLink?: string;
}

// Only list what packages/sdk-python/src/agentlogs/integrations/ actually ships.
// Never mark anything "Available" here without a matching integration file — zero-fake-data rule.
const integrations: Integration[] = [
  {
    name: 'LangChain',
    logo: '🦜',
    description: 'Automatic tracing for LangChain agents and chains with zero configuration',
    status: 'Available',
    category: 'Framework',
    features: ['Automatic chain tracing', 'Agent execution tracking', 'Tool usage monitoring', 'Token counting'],
    docsLink: '/docs#langchain',
  },
  {
    name: 'OpenAI SDK',
    logo: '🔷',
    description: 'Wraps the OpenAI client for automatic call tracing and cost calculation',
    status: 'Available',
    category: 'LLM Provider',
    features: ['GPT-4 & GPT-3.5 tracking', 'Token counting', 'Cost calculation', 'Error monitoring'],
    docsLink: '/docs#openai',
  },
  {
    name: 'CrewAI',
    logo: '🚢',
    description: 'Monitor multi-agent workflows and crew execution patterns',
    status: 'Coming Soon',
    category: 'Framework',
    features: ['Crew execution tracking', 'Agent collaboration monitoring', 'Task completion analytics'],
  },
  {
    name: 'AutoGPT',
    logo: '🤖',
    description: 'Track autonomous agent execution and goal achievement',
    status: 'Coming Soon',
    category: 'Framework',
    features: ['Goal tracking', 'Action monitoring', 'Resource usage'],
  },
  {
    name: 'LlamaIndex',
    logo: '🦙',
    description: 'Monitor RAG pipelines and document retrieval performance',
    status: 'Coming Soon',
    category: 'Framework',
    features: ['Query tracing', 'Retrieval monitoring', 'Index performance'],
  },
  {
    name: 'Anthropic',
    logo: '🎭',
    description: 'First-class support for Claude models with detailed tracing',
    status: 'Coming Soon',
    category: 'LLM Provider',
    features: ['Claude family support', 'Token tracking', 'Cost analytics'],
  },
  {
    name: 'Google AI',
    logo: '🔍',
    description: 'Integration with Gemini models',
    status: 'Coming Soon',
    category: 'LLM Provider',
    features: ['Gemini tracking', 'Token counting', 'Cost analytics'],
  },
];

const statusStyles: Record<Integration['status'], string> = {
  Available: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
  'Coming Soon': 'bg-slate-800 text-slate-400 border border-slate-700',
};

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono">
      <PublicHeader />
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-white mb-3">Integrations</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Auto-instrumentation SDKs for AI agent frameworks. Wrap your client, get traces — no manual spans.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.name} integration={integration} />
          ))}
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-950/60 p-10 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Don&apos;t see your framework?</h2>
          <p className="text-sm text-slate-400 mb-6">
            Send traces from anything with the raw HTTP API — no SDK required.
          </p>
          <Link
            href="/docs#custom-integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22d3ee] text-black rounded font-semibold text-sm hover:bg-[#06b6d4] transition"
          >
            <Code className="h-4 w-4" />
            View raw API docs
          </Link>
        </div>
      </div>
    </main>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <div className="border border-slate-800 bg-slate-950/60 rounded-lg p-6 hover:border-slate-700 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{integration.logo}</span>
          <div>
            <h3 className="font-bold text-white">{integration.name}</h3>
            <span className="text-xs text-slate-500">{integration.category}</span>
          </div>
        </div>
        <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full font-medium ${statusStyles[integration.status]}`}>
          {integration.status}
        </span>
      </div>

      <p className="text-sm text-slate-400 mb-4">{integration.description}</p>

      <ul className="space-y-1.5 mb-4">
        {integration.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-xs text-slate-300">
            <Check className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {integration.docsLink && (
        <Link href={integration.docsLink} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#22d3ee] hover:text-[#06b6d4]">
          View documentation <ExternalLink className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
