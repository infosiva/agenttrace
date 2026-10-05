import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SANDBOX_TRACES } from './sandbox-fixtures';

test('fixtures cover success and error so the demo is meaningful', () => {
  assert.ok(SANDBOX_TRACES.length >= 6);
  assert.ok(SANDBOX_TRACES.some(t => t.status === 'error'));
  assert.ok(SANDBOX_TRACES.some(t => t.status === 'success'));
});

test('sandbox modules never touch the database or auth', () => {
  for (const f of ['./sandbox-fixtures.ts', '../components/SandboxDashboard.tsx']) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.ok(!/@\/lib\/db|from '\.\/db|@\/lib\/auth|drizzle/.test(src), `${f} imports db/auth`);
  }
});
