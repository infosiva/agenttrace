// ponytail: no test framework wired in this app; smallest runnable check for the
// pure parsing/mapping logic in api/v1/otel/traces/route.ts (kept in sync manually —
// same pattern as check-replay-extract-messages.mjs).
import assert from 'node:assert/strict';

function flattenSpans(payload) {
  const out = [];
  for (const rs of payload.resourceSpans ?? []) {
    for (const ss of rs.scopeSpans ?? []) {
      for (const span of ss.spans ?? []) {
        if (span?.traceId && span?.spanId && span?.name) out.push(span);
      }
    }
  }
  return out;
}

function attrsToObject(attrs) {
  const out = {};
  for (const a of attrs ?? []) {
    const v = a.value;
    out[a.key] = String(v?.stringValue ?? v?.intValue ?? v?.doubleValue ?? v?.boolValue ?? '');
  }
  return out;
}

function spanStatus(span) {
  return span.status?.code === 2 ? 'error' : 'success';
}

function nanosToMs(nanos) {
  return Math.round(nanos / 1e6);
}

function buildGenAiInput(attrs) {
  if (!attrs['gen_ai.system'] && !attrs['gen_ai.request.model']) return null;
  return {
    system: attrs['gen_ai.system'],
    model: attrs['gen_ai.request.model'],
    max_tokens: attrs['gen_ai.request.max_tokens'],
    temperature: attrs['gen_ai.request.temperature'],
  };
}

// flattenSpans walks resourceSpans -> scopeSpans -> spans, drops malformed spans
assert.deepEqual(
  flattenSpans({
    resourceSpans: [{ scopeSpans: [{ spans: [
      { traceId: 't1', spanId: 's1', name: 'chat' },
      { traceId: 't1', name: 'missing-spanId' }, // dropped
    ] }] }],
  }).map(s => s.spanId),
  ['s1']
);
assert.deepEqual(flattenSpans({}), []);

// attrsToObject reads whichever OTLP value variant is set
assert.deepEqual(
  attrsToObject([
    { key: 'gen_ai.system', value: { stringValue: 'openai' } },
    { key: 'gen_ai.usage.input_tokens', value: { intValue: 42 } },
  ]),
  { 'gen_ai.system': 'openai', 'gen_ai.usage.input_tokens': '42' }
);

// spanStatus: OTel STATUS_CODE_ERROR = 2, everything else success
assert.equal(spanStatus({ status: { code: 2 } }), 'error');
assert.equal(spanStatus({ status: { code: 1 } }), 'success');
assert.equal(spanStatus({}), 'success');

// nanosToMs
assert.equal(nanosToMs(1_000_000), 1);

// buildGenAiInput: null when no gen_ai attrs present, never throws on empty input
assert.equal(buildGenAiInput({}), null);
assert.deepEqual(buildGenAiInput({ 'gen_ai.system': 'groq', 'gen_ai.request.model': 'llama-3.3-70b' }), {
  system: 'groq',
  model: 'llama-3.3-70b',
  max_tokens: undefined,
  temperature: undefined,
});

console.log('check-otel-ingest: OK');
