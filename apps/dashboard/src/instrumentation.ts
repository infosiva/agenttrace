// Structured server error log (Vercel log drain / future Sentry hook). Sentry is deferred until the owner decides.
export async function onRequestError(err: unknown, request: { path: string; method: string }) {
  const e = err as { message?: string; digest?: string };
  console.error(JSON.stringify({ level: 'error', path: request.path, method: request.method, message: e?.message, digest: e?.digest }));
}
