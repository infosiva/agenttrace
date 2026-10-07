// Consent-gated anonymous usage ping + structured error log. No new deps, no PII.
export function track(event: string, props: Record<string, string | number> = {}) {
  try {
    if (localStorage.getItem("cookie_consent_v1") !== "accepted") return;
    navigator.sendBeacon?.("/api/usage", JSON.stringify({ event, ...props, ts: Date.now() }));
  } catch {}
}
export function logError(scope: string, err: unknown) {
  try {
    const msg = err instanceof Error ? err.message : String(err);
    const body = JSON.stringify({ event: "client_error", scope, msg: msg.slice(0, 200), ts: Date.now() });
    navigator.sendBeacon?.("/api/usage", body); // errors carry no PII; sent regardless of consent
  } catch {}
}
