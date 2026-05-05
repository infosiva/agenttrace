import { Activity, BarChart3, Clock, DollarSign, Check, Zap, Shield, Code2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <Badge variant="secondary" className="mb-2">
              Open Source AI Observability
            </Badge>
            <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              AI Agent Observability
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Done Right
              </span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Trace, debug, and monitor your AI agents in production. Get complete
              visibility into every step of your agent's reasoning chain with real-time insights.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/agenttrace/agenttrace" target="_blank">
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Everything you need to debug AI
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Built-in observability for every framework. No vendor lock-in.
            </p>
          </div>

          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Activity className="h-5 w-5" />}
              title="Real-time Tracing"
              description="Watch your agents think in real-time with complete execution visibility"
            />
            <FeatureCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Cost Analytics"
              description="Track token usage and API costs across all your agents"
            />
            <FeatureCard
              icon={<Clock className="h-5 w-5" />}
              title="Performance Monitoring"
              description="Identify bottlenecks and optimize agent execution time"
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Error Detection"
              description="Automatically categorize and alert on agent failures"
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Multi-Framework"
              description="Works with LangChain, CrewAI, AutoGPT, or custom agents"
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Self-Hosted"
              description="Deploy on your infrastructure. Your data stays yours"
            />
            <FeatureCard
              icon={<Code2 className="h-5 w-5" />}
              title="Developer First"
              description="Simple SDK with Python and TypeScript support"
            />
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Production Ready"
              description="Built for scale with enterprise-grade reliability"
            />
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              Get started in minutes
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Add tracing to your AI agents with just a few lines of code
            </p>
          </div>

          <div className="mx-auto max-w-[64rem]">
            <Card>
              <CardHeader>
                <CardTitle>Quick Setup</CardTitle>
                <CardDescription>Three simple steps to complete observability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                    Install the SDK
                  </h3>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                    <code className="text-sm">pip install agenttrace-sdk</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
                    Configure API Endpoint
                  </h3>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                    <code className="text-sm">{`# Set your AgentTrace API endpoint
export AGENTTRACE_API_URL="http://localhost:8000"
export AGENTTRACE_PROJECT="my-agent"`}</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
                    Instrument Your Code
                  </h3>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                    <code className="text-sm">{`from agenttrace import AgentTrace

client = AgentTrace()
with client.trace("agent-execution") as trace:
    trace.step("processing", metadata={"input": query})
    # Your agent logic here
    trace.step("complete", metadata={"output": result})`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              How We Compare
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Open-source, self-hostable alternative to existing solutions
            </p>
          </div>

          <div className="mx-auto max-w-[64rem]">
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-semibold">Feature</th>
                        <th className="px-4 py-3 text-center font-semibold text-primary">AgentTrace</th>
                        <th className="px-4 py-3 text-center font-semibold text-muted-foreground">LangSmith</th>
                        <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Helicone</th>
                        <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Arize AI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: 'Agent-Focused', agentTrace: true, langSmith: true, helicone: false, arize: true },
                        { feature: 'Multi-Step Reasoning', agentTrace: true, langSmith: true, helicone: false, arize: true },
                        { feature: 'Cost Analytics', agentTrace: true, langSmith: true, helicone: true, arize: true },
                        { feature: 'Self-Hosting Option', agentTrace: true, langSmith: false, helicone: false, arize: false },
                        { feature: 'Simple Setup', agentTrace: true, langSmith: false, helicone: true, arize: false },
                        { feature: 'Open Source', agentTrace: true, langSmith: false, helicone: false, arize: false },
                        { feature: 'Starting Price', agentTrace: 'Free', langSmith: '$39/mo', helicone: 'Free', arize: '$500+/mo' },
                      ].map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3 text-sm">{row.feature}</td>
                          <td className="px-4 py-3 text-center">
                            {typeof row.agentTrace === 'boolean' ? (
                              row.agentTrace ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )
                            ) : (
                              <span className="font-medium text-primary">{row.agentTrace}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {typeof row.langSmith === 'boolean' ? (
                              row.langSmith ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )
                            ) : (
                              <span className="text-sm text-muted-foreground">{row.langSmith}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {typeof row.helicone === 'boolean' ? (
                              row.helicone ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )
                            ) : (
                              <span className="text-sm text-muted-foreground">{row.helicone}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {typeof row.arize === 'boolean' ? (
                              row.arize ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )
                            ) : (
                              <span className="text-sm text-muted-foreground">{row.arize}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* CTA Section */}
        <section className="container py-8 md:py-12 lg:py-24">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                Ready to get started?
              </h2>
              <p className="max-w-[42rem] leading-normal text-blue-100 sm:text-xl sm:leading-8">
                Open-source observability platform for AI agents. Get started in minutes.
              </p>
              <div className="flex gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/dashboard">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
