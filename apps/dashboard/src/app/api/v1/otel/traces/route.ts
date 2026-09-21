import { NextResponse, type NextRequest } from 'next/server';
import { db, traces, steps } from '@/lib/db';
import { bearerToken, resolveApiKey } from '@/lib/api-keys';
import { API_LIMITER } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Accepts an OTLP/JSON trace export (resourceSpans -> scopeSpans -> spans),
// same shape any OTel SDK/collector emits. Maps GenAI semconv attributes
// (gen_ai.*, https://opentelemetry.io/docs/specs/semconv/gen-ai/) onto our
// existing traces/steps tables — no schema change needed (verified against
// schema.ts: traces.name/status/metadata + steps.type/input/output/tokens
// already cover everything the semconv defines).
export async function POST(req: NextRequest) {
  const limited = API_LIMITER.check(req); if (limited) return limited
  const token = bearerToken(req.headers.get('authorization'));
  if (!token) return NextResponse.json({ error: 'missing_api_key' }, { status: 401 });

  const key = await resolveApiKey(token);
  if (!key) return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 });

  let body: OtlpTracePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const spans = flattenSpans(body);
  if (!spans.length) return NextResponse.json({ error: 'no_spans' }, { status: 400 });

  const byOtelTraceId = new Map<string, OtlpSpan[]>();
  for (const span of spans) {
    const list = byOtelTraceId.get(span.traceId) ?? [];
    list.push(span);
    byOtelTraceId.set(span.traceId, list);
  }

  let tracesCreated = 0;
  let stepsCreated = 0;

  for (const [otelTraceId, traceSpans] of byOtelTraceId) {
    traceSpans.sort((a, b) => a.startTimeUnixNano - b.startTimeUnixNano);
    const root = traceSpans[0];
    const hasError = traceSpans.some(s => spanStatus(s) === 'error');

    const [trace] = await db
      .insert(traces)
      .values({
        projectId: key.projectId,
        name: root.name,
        status: hasError ? 'error' : 'success',
        metadata: { source: 'otel', otelTraceId },
        durationMs: nanosToMs(traceSpans[traceSpans.length - 1].endTimeUnixNano - root.startTimeUnixNano),
        startedAt: new Date(nanosToMs(root.startTimeUnixNano)),
        endedAt: new Date(nanosToMs(traceSpans[traceSpans.length - 1].endTimeUnixNano)),
      })
      .returning({ id: traces.id });
    tracesCreated++;

    const stepRows = traceSpans.map((span, i) => {
      const attrs = attrsToObject(span.attributes);
      const status = spanStatus(span);
      return {
        traceId: trace.id,
        name: span.name,
        type: attrs['gen_ai.system'] || attrs['gen_ai.operation.name'] ? 'llm' : 'other',
        status,
        input: buildGenAiInput(attrs),
        output: buildGenAiOutput(attrs),
        metadata: { otelSpanId: span.spanId, provider: attrs['gen_ai.system'], model: attrs['gen_ai.request.model'] },
        tokens: numAttr(attrs['gen_ai.usage.input_tokens']) + numAttr(attrs['gen_ai.usage.output_tokens']) || null,
        durationMs: nanosToMs(span.endTimeUnixNano - span.startTimeUnixNano),
        errorMessage: status === 'error' ? (span.status?.message ?? null) : null,
        sequence: i,
        startedAt: new Date(nanosToMs(span.startTimeUnixNano)),
        endedAt: new Date(nanosToMs(span.endTimeUnixNano)),
      };
    });
    await db.insert(steps).values(stepRows);
    stepsCreated += stepRows.length;
  }

  return NextResponse.json({ traces_created: tracesCreated, steps_created: stepsCreated });
}

// ---- OTLP/JSON shape (subset actually used) ----
type OtlpAttr = { key: string; value: Record<string, unknown> };
type OtlpSpan = {
  traceId: string;
  spanId: string;
  name: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  attributes?: OtlpAttr[];
  status?: { code?: number; message?: string };
};
type OtlpTracePayload = {
  resourceSpans?: { scopeSpans?: { spans?: OtlpSpan[] }[] }[];
};

function flattenSpans(payload: OtlpTracePayload): OtlpSpan[] {
  const out: OtlpSpan[] = [];
  for (const rs of payload.resourceSpans ?? []) {
    for (const ss of rs.scopeSpans ?? []) {
      for (const span of ss.spans ?? []) {
        if (span?.traceId && span?.spanId && span?.name) out.push(span);
      }
    }
  }
  return out;
}

function attrsToObject(attrs?: OtlpAttr[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of attrs ?? []) {
    const v = a.value;
    out[a.key] = String(v?.stringValue ?? v?.intValue ?? v?.doubleValue ?? v?.boolValue ?? '');
  }
  return out;
}

function spanStatus(span: OtlpSpan): 'success' | 'error' {
  return span.status?.code === 2 ? 'error' : 'success'; // OTel STATUS_CODE_ERROR = 2
}

function numAttr(v: string | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function nanosToMs(nanos: number): number {
  return Math.round(nanos / 1e6);
}

function buildGenAiInput(attrs: Record<string, string>): object | null {
  if (!attrs['gen_ai.system'] && !attrs['gen_ai.request.model']) return null;
  return {
    system: attrs['gen_ai.system'],
    model: attrs['gen_ai.request.model'],
    max_tokens: attrs['gen_ai.request.max_tokens'],
    temperature: attrs['gen_ai.request.temperature'],
  };
}

function buildGenAiOutput(attrs: Record<string, string>): object | null {
  if (!attrs['gen_ai.response.model'] && !attrs['gen_ai.usage.output_tokens']) return null;
  return {
    model: attrs['gen_ai.response.model'],
    finish_reasons: attrs['gen_ai.response.finish_reasons'],
    output_tokens: attrs['gen_ai.usage.output_tokens'],
  };
}
