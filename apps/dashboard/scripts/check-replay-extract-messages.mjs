// ponytail: no test framework wired in this app; smallest runnable check for the
// extractMessages logic in api/v1/steps/[id]/replay/route.ts (kept in sync manually —
// pure function, no deps, cheap to duplicate vs. adding a TS test runner for one check).
import assert from 'node:assert/strict';

function extractMessages(input) {
  if (!input || typeof input !== 'object') return [];
  const raw = input.messages;
  if (!Array.isArray(raw)) return [];
  const batch = Array.isArray(raw[0]) ? raw[0] : raw;
  return batch
    .filter(m => typeof m?.content === 'string')
    .map(m => ({ role: m.role === 'human' ? 'user' : m.role === 'ai' ? 'assistant' : (m.role || 'user'), content: m.content }));
}

// LangChain handler's batched shape: { messages: [[{role, content}, ...]] }
assert.deepEqual(
  extractMessages({ messages: [[{ role: 'human', content: 'hi' }]] }),
  [{ role: 'user', content: 'hi' }]
);

// role mapping: ai -> assistant
assert.deepEqual(
  extractMessages({ messages: [[{ role: 'ai', content: 'hello back' }]] }),
  [{ role: 'assistant', content: 'hello back' }]
);

// missing/malformed input -> empty, never throws
assert.deepEqual(extractMessages(null), []);
assert.deepEqual(extractMessages({}), []);
assert.deepEqual(extractMessages({ messages: 'not-an-array' }), []);

console.log('check-replay-extract-messages: OK');
