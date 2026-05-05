import { Activity, Check, ExternalLink, Code, Zap } from 'lucide-react';
import Link from 'next/link';

interface Integration {
  name: string;
  logo: string;
  description: string;
  status: 'Available' | 'Beta' | 'Coming Soon';
  category: 'Framework' | 'LLM Provider' | 'Tool' | 'Database';
  features: string[];
  docsLink?: string;
}

const integrations: Integration[] = [
  {
    name: 'LangChain',
    logo: '🦜',
    description: 'Automatic tracing for LangChain agents and chains with zero configuration',
    status: 'Available',
    category: 'Framework',
    features: [
      'Automatic chain tracing',
      'Agent execution tracking',
      'Tool usage monitoring',
      'Token counting',
    ],
    docsLink: '/docs#langchain',
  },
  {
    name: 'CrewAI',
    logo: '🚢',
    description: 'Monitor multi-agent workflows and crew execution patterns',
    status: 'Available',
    category: 'Framework',
    features: [
      'Crew execution tracking',
      'Agent collaboration monitoring',
      'Task completion analytics',
      'Inter-agent communication',
    ],
    docsLink: '/docs#crewai',
  },
  {
    name: 'AutoGPT',
    logo: '🤖',
    description: 'Track autonomous agent execution and goal achievement',
    status: 'Coming Soon',
    category: 'Framework',
    features: [
      'Goal tracking',
      'Action monitoring',
      'Resource usage',
      'Performance metrics',
    ],
  },
  {
    name: 'LlamaIndex',
    logo: '🦙',
    description: 'Monitor RAG pipelines and document retrieval performance',
    status: 'Beta',
    category: 'Framework',
    features: [
      'Query tracing',
      'Retrieval monitoring',
      'Index performance',
      'Cost tracking',
    ],
    docsLink: '/docs#llamaindex',
  },
  {
    name: 'OpenAI',
    logo: '🔷',
    description: 'Native support for OpenAI API calls with automatic cost calculation',
    status: 'Available',
    category: 'LLM Provider',
    features: [
      'GPT-4 & GPT-3.5 tracking',
      'Token counting',
      'Cost calculation',
      'Error monitoring',
    ],
    docsLink: '/docs#openai',
  },
  {
    name: 'Anthropic',
    logo: '🎭',
    description: 'First-class support for Claude models with detailed tracing',
    status: 'Available',
    category: 'LLM Provider',
    features: [
      'Claude 3 family support',
      'Token tracking',
      'Cost analytics',
      'Response monitoring',
    ],
    docsLink: '/docs#anthropic',
  },
  {
    name: 'Google AI',
    logo: '🔍',
    description: 'Integration with Gemini and PaLM models',
    status: 'Coming Soon',
    category: 'LLM Provider',
    features: [
      'Gemini Pro tracking',
      'Token counting',
      'Multi-modal support',
      'Cost analytics',
    ],
  },
  {
    name: 'Hugging Face',
    logo: '🤗',
    description: 'Monitor open-source model usage and performance',
    status: 'Beta',
    category: 'LLM Provider',
    features: [
      'Model inference tracking',
      'Performance metrics',
      'Self-hosted support',
      'Custom model support',
    ],
  },
  {
    name: 'Pinecone',
    logo: '🌲',
    description: 'Track vector database queries and retrieval performance',
    status: 'Available',
    category: 'Database',
    features: [
      'Query monitoring',
      'Retrieval analytics',
      'Cost tracking',
      'Performance metrics',
    ],
  },
  {
    name: 'Weaviate',
    logo: '🔷',
    description: 'Monitor vector search and semantic retrieval',
    status: 'Beta',
    category: 'Database',
    features: [
      'Search tracking',
      'Query analytics',
      'Performance monitoring',
      'Cost insights',
    ],
  },
  {
    name: 'Tavily',
    logo: '🔍',
    description: 'Track web search and research tool usage',
    status: 'Available',
    category: 'Tool',
    features: [
      'Search query tracking',
      'Result monitoring',
      'Cost analytics',
      'Performance metrics',
    ],
  },
  {
    name: 'Browser Use',
    logo: '🌐',
    description: 'Monitor browser automation and web scraping agents',
    status: 'Coming Soon',
    category: 'Tool',
    features: [
      'Action tracking',
      'Page load monitoring',
      'Error detection',
      'Performance insights',
    ],
  },
];

const categories = ['All', 'Framework', 'LLM Provider', 'Tool', 'Database'] as const;

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">AgentTrace</span>
            </Link>
            <div className="flex gap-4">
              <Link
                href="/traces"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600"
              >
                Traces
              </Link>
              <Link
                href="/docs"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600"
              >
                Docs
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600"
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Integrations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            AgentTrace works seamlessly with your favorite AI tools and frameworks
          </p>
        </div>

        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-lg font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.name} integration={integration} />
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Don't see your tool?</h2>
          <p className="text-xl mb-8 text-blue-100">
            We're constantly adding new integrations. Request one or build your own!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/docs#custom-integrations"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center gap-2"
            >
              <Code className="h-5 w-5" />
              Build Custom Integration
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
            >
              Request Integration
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How Integrations Work
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Install SDK
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add the AgentTrace SDK to your project with a single pip or npm install
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Auto-Detection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AgentTrace automatically detects supported frameworks and tools in your code
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Start Tracing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Traces appear in your dashboard immediately - no manual configuration needed
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Integrations are maintained by the AgentTrace team and community
          </p>
        </div>
      </footer>
    </div>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const statusColors = {
    Available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Beta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Coming Soon': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{integration.logo}</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {integration.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {integration.category}
            </span>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            statusColors[integration.status]
          }`}
        >
          {integration.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {integration.description}
      </p>

      <ul className="space-y-2 mb-4">
        {integration.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {integration.docsLink && (
        <Link
          href={integration.docsLink}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View documentation
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
