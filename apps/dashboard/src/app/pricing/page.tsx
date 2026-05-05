import { Activity, Check, ArrowRight, Zap, Building2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started and small projects',
    icon: <Sparkles className="h-6 w-6" />,
    features: [
      '1,000 traces/month',
      '7-day retention',
      'Basic dashboard',
      'Community support',
      'Single project',
      'Core integrations',
    ],
    cta: 'Start Free',
    ctaVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'For growing teams shipping AI agents to production',
    icon: <Zap className="h-6 w-6" />,
    features: [
      '50,000 traces/month',
      '30-day retention',
      'Advanced analytics',
      'Email support',
      '5 projects',
      'All integrations',
      'Custom alerts',
      'Team collaboration',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
    popular: true,
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/month',
    description: 'For teams with high-volume production workloads',
    icon: <Activity className="h-6 w-6" />,
    features: [
      '500,000 traces/month',
      '90-day retention',
      'Advanced analytics',
      'Priority support',
      'Unlimited projects',
      'All integrations',
      'Custom alerts',
      'Team collaboration',
      'SSO (SAML)',
      'Audit logs',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom requirements',
    icon: <Building2 className="h-6 w-6" />,
    features: [
      'Unlimited traces',
      'Custom retention',
      'Dedicated support',
      'Unlimited projects',
      'All integrations',
      'Custom alerts',
      'Team collaboration',
      'SSO (SAML/OIDC)',
      'Audit logs',
      'On-premise deployment',
      'SLA guarantee',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
    popular: false,
  },
];

const comparisonFeatures = [
  {
    category: 'Usage',
    features: [
      { name: 'Traces per month', free: '1,000', starter: '50,000', pro: '500,000', enterprise: 'Unlimited' },
      { name: 'Data retention', free: '7 days', starter: '30 days', pro: '90 days', enterprise: 'Custom' },
      { name: 'Projects', free: '1', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Team members', free: '1', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
    ],
  },
  {
    category: 'Features',
    features: [
      { name: 'Real-time tracing', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Basic dashboard', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Advanced analytics', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Custom alerts', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Team collaboration', free: false, starter: true, pro: true, enterprise: true },
      { name: 'SSO authentication', free: false, starter: false, pro: true, enterprise: true },
      { name: 'Audit logs', free: false, starter: false, pro: true, enterprise: true },
      { name: 'On-premise deployment', free: false, starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Community support', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Email support', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Priority support', free: false, starter: false, pro: true, enterprise: true },
      { name: 'Dedicated support', free: false, starter: false, pro: false, enterprise: true },
      { name: 'SLA guarantee', free: false, starter: false, pro: false, enterprise: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Start free, scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container pb-8 pt-6 md:pb-12 md:pt-10">
          <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} />
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              Compare Plans
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              See exactly what's included in each plan
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-semibold">Feature</th>
                      <th className="px-4 py-3 text-center font-semibold">Free</th>
                      <th className="px-4 py-3 text-center font-semibold text-primary">Starter</th>
                      <th className="px-4 py-3 text-center font-semibold">Pro</th>
                      <th className="px-4 py-3 text-center font-semibold">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((category) => (
                      <>
                        <tr key={category.category} className="bg-muted/50">
                          <td
                            colSpan={5}
                            className="px-4 py-3 text-sm font-semibold"
                          >
                            {category.category}
                          </td>
                        </tr>
                        {category.features.map((feature) => (
                          <tr
                            key={feature.name}
                            className="border-b"
                          >
                            <td className="px-4 py-3 text-sm">
                              {feature.name}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              <FeatureCell value={feature.free} />
                            </td>
                            <td className="px-4 py-3 text-center text-sm bg-primary/5">
                              <FeatureCell value={feature.starter} />
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              <FeatureCell value={feature.pro} />
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              <FeatureCell value={feature.enterprise} />
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto grid max-w-[64rem] gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What counts as a trace?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  A trace is a single execution of your AI agent, including all steps, LLM calls, and tool uses. If your agent processes one user query, that's one trace.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade or downgrade anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we'll prorate any charges.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I exceed my trace limit?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We'll notify you when you're approaching your limit. You can either upgrade your plan or purchase additional traces. We won't cut off your service.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer discounts for non-profits?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Yes! We offer special pricing for non-profits, educational institutions, and open-source projects. Contact us for details.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I self-host AgentTrace?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Yes! AgentTrace is open-source. You can self-host it for free on your own infrastructure. Enterprise plans include support for on-premise deployments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We accept all major credit cards, debit cards, and ACH transfers for annual plans. Enterprise customers can pay via invoice.
                </CardDescription>
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
                Self-host for free or use our managed service. Start with our open-source platform.
              </p>
              <div className="flex gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/dashboard">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link href="/docs">View Documentation</Link>
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

function PricingCard({
  tier,
}: {
  tier: typeof pricingTiers[0];
}) {
  return (
    <Card className={`relative ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
      {tier.popular && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <Badge className="shadow-md">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {tier.icon}
        </div>
        <CardTitle className="text-2xl">{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <span className="text-4xl font-bold">{tier.price}</span>
          <span className="text-muted-foreground">{tier.period}</span>
        </div>
        <Button
          className="w-full"
          variant={tier.ctaVariant}
          asChild
        >
          <Link href={tier.name === 'Enterprise' ? '/contact' : '/dashboard'}>
            {tier.cta}
          </Link>
        </Button>
        <ul className="space-y-3">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  }
  return <span className="font-medium">{value}</span>;
}
