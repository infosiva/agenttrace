import Link from 'next/link';
import { Terminal, Key, FileCode2, Webhook, Box } from 'lucide-react';

export const metadata = {
  title: 'AgentLogs Docs — Trace AI agents in 3 lines',
  description: 'Install the SDK, send your first trace, view it in the dashboard.',
};

const QUICKSTART_PY = `from agentlogs import AgentLogs, StepType

client = AgentLogs(api_key="al_...")  # or set AGENTLOGS_API_KEY env var

async with await client.create_trace(name="research-agent") as trace:
    await trace.add_step(
        name="openai_call",
        step_type=StepType.LLM,
        metadata={"model": "gpt-4o", "provider": "openai"},
        tokens=1234,
        cost=0.012,
    )`;

const INSTALL_PY = `pip install agentlogs-sdk`;

const ENV_SETUP = `export AGENTLOGS_API_KEY="al_..."
export AGENTLOGS_PROJECT="my-agent"`;

const DECORATOR = `from agentlogs import trace_agent

@trace_agent()
async def my_agent(query: str):
    return await llm.generate(query)`;

const STEP_TYPES = `from agentlogs import StepType

StepType.LLM        # OpenAI / Anthropic / etc. calls
StepType.TOOL       # External tool / function call
StepType.FUNCTION   # Internal function step
StepType.OTHER      # Anything else`;

const CURL_TRACE = `curl -X POST https://agentlogs.app/api/v1/traces \\
  -H "Authorization: Bearer $AGENTLOGS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-agent-run", "metadata": {"version": "1.0"}}'`;

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <header className="mb-10">
          <p className="text-xs text-green-600 uppercase tracking-widest mb-2">// docs</p>
          <h1 className="text-4xl font-bold text-white mb-3">Get started in 60 seconds</h1>
          <p className="text-slate-400">
            Install the SDK, drop your API key, send a trace. View it in the dashboard.
          </p>
        </header>

        <nav className="grid sm:grid-cols-2 gap-3 mb-12">
          <DocCard href="#install" icon={Box} title="1. Install" desc="pip install agentlogs-sdk" />
          <DocCard href="#api-key" icon={Key} title="2. Get an API key" desc="Sign in and create a project" />
          <DocCard href="#first-trace" icon={FileCode2} title="3. Send first trace" desc="3 lines of Python" />
          <DocCard href="#api-reference" icon={Webhook} title="REST API" desc="Use any language via HTTP" />
        </nav>

        <Section id="install" title="1. Install the SDK">
          <p className="text-sm text-slate-400 mb-3">Python 3.9 or later.</p>
          <CodeBlock code={INSTALL_PY} language="bash" />
        </Section>

        <Section id="api-key" title="2. Get your API key">
          <ol className="text-sm text-slate-300 space-y-2 mb-4">
            <li>1. <Link href="/login" className="text-green-400 hover:text-green-300 underline">Sign in</Link> with email (magic link).</li>
            <li>2. Go to <Link href="/settings" className="text-green-400 hover:text-green-300 underline">Settings → Projects</Link>.</li>
            <li>3. Create a project + an API key. Copy the key (you&apos;ll only see it once).</li>
          </ol>
          <p className="text-sm text-slate-400 mb-3">Then set it in your environment:</p>
          <CodeBlock code={ENV_SETUP} language="bash" />
        </Section>

        <Section id="first-trace" title="3. Send your first trace">
          <CodeBlock code={QUICKSTART_PY} language="python" />
          <p className="text-sm text-slate-400 mt-4">
            Open the <Link href="/dashboard" className="text-green-400 hover:text-green-300 underline">dashboard</Link> — your trace appears within seconds.
          </p>
        </Section>

        <Section id="decorator" title="Decorator API (alternative)">
          <p className="text-sm text-slate-400 mb-3">Auto-trace an async function:</p>
          <CodeBlock code={DECORATOR} language="python" />
        </Section>

        <Section id="step-types" title="Step types">
          <CodeBlock code={STEP_TYPES} language="python" />
        </Section>

        <Section id="api-reference" title="REST API reference">
          <p className="text-sm text-slate-400 mb-3">
            All SDK calls go through these HTTP endpoints. Use directly from any language.
          </p>

          <EndpointBlock
            method="POST"
            path="/api/v1/traces"
            desc="Create a new trace. Returns trace id."
            body={`{
  "name": "agent-name",
  "input_data": { ... },     // optional
  "metadata": { ... },       // optional
  "tags": ["a", "b"]         // optional
}`}
          />

          <EndpointBlock
            method="POST"
            path="/api/v1/traces/:id/steps"
            desc="Append a step to a trace."
            body={`{
  "name": "step-name",
  "type": "llm|tool|function|other",
  "status": "success|error",
  "input": { ... },
  "output": { ... },
  "metadata": { ... },
  "tokens": 1234,
  "cost": 0.012,
  "duration_ms": 450
}`}
          />

          <EndpointBlock
            method="PATCH"
            path="/api/v1/traces/:id"
            desc="Finalize a trace."
            body={`{
  "status": "success|error",
  "output_data": { ... },
  "error_message": "...",
  "total_tokens": 5000,
  "total_cost": 0.045
}`}
          />

          <p className="text-sm text-slate-400 mt-6 mb-3">Authorize each request with your API key:</p>
          <CodeBlock code={CURL_TRACE} language="bash" />
        </Section>

        <Section id="self-host" title="Self-hosting">
          <p className="text-sm text-slate-400 mb-3">
            Point the SDK at your own deployment by overriding the API URL:
          </p>
          <CodeBlock
            code={`from agentlogs import configure\n\nconfigure(api_url="https://logs.your-company.com")`}
            language="python"
          />
          <p className="text-sm text-slate-400 mt-4">
            Source code:{' '}
            <a href="https://github.com/infosiva/agenttrace" className="text-green-400 hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">
              github.com/infosiva/agenttrace
            </a>
          </p>
        </Section>

        <footer className="mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400 mb-3">Stuck? Open an issue or DM.</p>
          <a
            href="https://github.com/infosiva/agenttrace/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 underline"
          >
            <Terminal className="w-4 h-4" /> GitHub issues
          </a>
        </footer>
      </div>
    </main>
  );
}

function DocCard({ href, icon: Icon, title, desc }: { href: string; icon: typeof Terminal; title: string; desc: string }) {
  return (
    <a
      href={href}
      className="block border border-slate-800 bg-slate-950/60 rounded-lg p-4 hover:border-green-500/40 hover:bg-green-500/5 transition"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-green-400" />
        <h3 className="font-bold text-sm text-white">{title}</h3>
      </div>
      <p className="text-xs text-slate-400">{desc}</p>
    </a>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-8">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="border border-slate-800 rounded-lg bg-black/80 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border-b border-slate-800">
        <span className="text-xs text-slate-500 uppercase tracking-widest">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto max-w-full">
        <code className="text-xs text-green-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function EndpointBlock({ method, path, desc, body }: { method: string; path: string; desc: string; body: string }) {
  const methodColor = method === 'POST' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                       method === 'PATCH' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                       'text-slate-300 bg-slate-700/30 border-slate-700';
  return (
    <div className="mb-6 border border-slate-800 rounded-lg bg-slate-950/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border-b border-slate-800">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${methodColor}`}>{method}</span>
        <code className="text-sm text-slate-200">{path}</code>
      </div>
      <p className="text-xs text-slate-400 px-4 pt-3">{desc}</p>
      <pre className="p-4 overflow-x-auto max-w-full">
        <code className="text-xs text-green-300 whitespace-pre">{body}</code>
      </pre>
    </div>
  );
}
