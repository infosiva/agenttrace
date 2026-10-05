// Server-side PostHog capture. No-op without the key; never throws, never blocks the request.
export function trackServer(event: string, distinctId: string, props: Record<string, unknown> = {}): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
  void fetch(`${host}/capture/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ api_key: key, event, distinct_id: distinctId, properties: props }),
  }).catch(() => {});
}
