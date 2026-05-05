'use client';

import { Book, Code, Rocket, Server, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const quickLinks = [
  {
    title: 'Getting Started',
    description: 'Install AgentTrace and instrument your first agent',
    icon: <Rocket className="h-6 w-6" />,
    href: '#getting-started',
    color: 'blue',
  },
  {
    title: 'Python SDK',
    description: 'Comprehensive guide to the Python SDK',
    icon: <Code className="h-6 w-6" />,
    href: '#python-sdk',
    color: 'green',
  },
  {
    title: 'TypeScript SDK',
    description: 'Use AgentTrace with TypeScript and JavaScript',
    icon: <Package className="h-6 w-6" />,
    href: '#typescript-sdk',
    color: 'purple',
  },
  {
    title: 'API Reference',
    description: 'Complete REST API documentation',
    icon: <Server className="h-6 w-6" />,
    href: '#api-reference',
    color: 'orange',
  },
];

const integrations = [
  { name: 'LangChain', logo: '🦜', status: 'Planned' },
  { name: 'CrewAI', logo: '🚢', status: 'Planned' },
  { name: 'AutoGPT', logo: '🤖', status: 'Planned' },
  { name: 'LlamaIndex', logo: '🦙', status: 'Planned' },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 container py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Book className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to instrument, monitor, and debug your AI agents
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {quickLinks.map((link) => (
            <Link key={link.title} href={link.href as never}>
              <Card className="h-full hover:shadow-lg transition group">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {link.icon}
                  </div>
                  <CardTitle className="group-hover:text-primary transition">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
                    Read more
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <section id="getting-started" className="mb-16 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Install the SDK
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose your preferred language and install the SDK:
              </p>

              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Python
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>pip install agenttrace-sdk</code>
                </pre>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  TypeScript/JavaScript
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code># Not yet published - install from source
npm install github:agenttrace/agenttrace#packages/sdk-typescript</code>
                </pre>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Set Your API Key
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get your API key from the dashboard and set it as an environment variable:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-8">
                <code>{`export AGENTTRACE_API_KEY="your-api-key-here"`}</code>
              </pre>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Instrument Your Agent
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add tracing to your agent with a simple decorator:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{`from agenttrace import trace_agent

@trace_agent(project="my-agent")
async def my_agent(query: str):
    # Your agent logic here
    response = await llm.generate(query)
    return response`}</code>
              </pre>
            </div>
            </CardContent>
          </Card>
        </section>

        <section id="python-sdk" className="mb-16 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Python SDK</CardTitle>
            </CardHeader>
            <CardContent>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Usage
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                <code>{`from agenttrace import AgentTrace

# Initialize the client
client = AgentTrace(
    api_key="your-api-key",
    project="my-agent"
)

# Create a trace
with client.trace("user-query") as trace:
    # Add steps
    trace.step("thinking", metadata={"input": "Hello"})

    # Add LLM calls
    trace.llm_call(
        model="gpt-4",
        prompt="Hello",
        response="Hi there!",
        tokens=15,
        cost=0.002
    )

    trace.step("responding", metadata={"output": "Hi there!"})`}</code>
              </pre>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Advanced Features
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li>Automatic token counting</li>
                <li>Cost calculation for major LLM providers</li>
                <li>Async support</li>
                <li>Error tracking and stack traces</li>
                <li>Custom metadata and tags</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Configuration
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{`client = AgentTrace(
    api_key="your-api-key",
    project="my-agent",
    api_url="https://api.agenttrace.io",  # Optional: custom API URL
    enable_local_logging=True,             # Optional: log locally
    batch_size=10,                         # Optional: batch size
    flush_interval=5                       # Optional: flush interval (seconds)
)`}</code>
              </pre>
            </div>
            </CardContent>
          </Card>
        </section>

        <section id="typescript-sdk" className="mb-16 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">TypeScript SDK</CardTitle>
            </CardHeader>
            <CardContent>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Usage
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                <code>{`import { AgentTrace } from '@agenttrace/sdk';

// Initialize the client
const client = new AgentTrace({
  apiKey: 'your-api-key',
  project: 'my-agent'
});

// Create a trace
const trace = await client.startTrace('user-query');

// Add steps
await trace.addStep('thinking', { input: 'Hello' });

// Add LLM calls
await trace.addLLMCall({
  model: 'gpt-4',
  prompt: 'Hello',
  response: 'Hi there!',
  tokens: 15,
  cost: 0.002
});

// End the trace
await trace.end();`}</code>
              </pre>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Using Decorators
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { traceAgent } from '@agenttrace/sdk';

class MyAgent {
  @traceAgent({ project: 'my-agent' })
  async processQuery(query: string) {
    // Your agent logic here
    return response;
  }
}`}</code>
              </pre>
            </div>
            </CardContent>
          </Card>
        </section>

        <section id="api-reference" className="mb-16 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">API Reference</CardTitle>
            </CardHeader>
            <CardContent>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                AgentTrace provides a RESTful API for all operations. Base URL: <code className="text-blue-600">https://api.agenttrace.io</code>
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Authentication
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All API requests require an API key in the Authorization header:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-8">
                <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.agenttrace.io/v1/traces`}</code>
              </pre>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Endpoints
              </h3>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-4">
                  <p className="font-mono text-sm text-blue-600 mb-2">POST /v1/traces</p>
                  <p className="text-gray-600 dark:text-gray-400">Create a new trace</p>
                </div>

                <div className="border-l-4 border-green-600 pl-4">
                  <p className="font-mono text-sm text-green-600 mb-2">GET /v1/traces</p>
                  <p className="text-gray-600 dark:text-gray-400">List all traces for a project</p>
                </div>

                <div className="border-l-4 border-purple-600 pl-4">
                  <p className="font-mono text-sm text-purple-600 mb-2">GET /v1/traces/:id</p>
                  <p className="text-gray-600 dark:text-gray-400">Get a specific trace by ID</p>
                </div>

                <div className="border-l-4 border-orange-600 pl-4">
                  <p className="font-mono text-sm text-orange-600 mb-2">POST /v1/traces/:id/steps</p>
                  <p className="text-gray-600 dark:text-gray-400">Add a step to an existing trace</p>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Integrations</CardTitle>
              <CardDescription>
                AgentTrace integrates seamlessly with popular AI frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.logo}</span>
                      <span className="font-semibold">
                        {integration.name}
                      </span>
                    </div>
                    <Badge variant={integration.status === 'Available' ? 'default' : 'secondary'}>
                      {integration.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Join our community or reach out to our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link
                href="https://github.com"
                className="text-sm font-medium text-primary hover:underline"
              >
                GitHub Discussions
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-primary hover:underline"
              >
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}
