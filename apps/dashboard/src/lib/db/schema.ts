import { pgTable, text, timestamp, integer, jsonb, primaryKey, uuid, real, index } from 'drizzle-orm/pg-core';
import type { AdapterAccount } from 'next-auth/adapters';

// ===== NextAuth tables =====

export const users = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  account => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  vt => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ===== AgentLogs domain tables =====

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, t => ({
  userIdx: index('projects_user_idx').on(t.userId),
}));

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  keyHash: text('key_hash').notNull().unique(), // sha256 of full key
  keyPrefix: text('key_prefix').notNull(),       // first 8 chars for UI display
  name: text('name').notNull().default('default'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, t => ({
  hashIdx: index('api_keys_hash_idx').on(t.keyHash),
}));

export const traces = pgTable('traces', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: text('status').notNull().default('running'), // running | success | error
  inputData: jsonb('input_data'),
  outputData: jsonb('output_data'),
  metadata: jsonb('metadata'),
  tags: jsonb('tags').$type<string[]>(),
  durationMs: integer('duration_ms'),
  totalTokens: integer('total_tokens').default(0),
  totalCost: real('total_cost').default(0),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, t => ({
  projectIdx: index('traces_project_idx').on(t.projectId),
  createdIdx: index('traces_created_idx').on(t.createdAt),
}));

export const steps = pgTable('steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  traceId: uuid('trace_id').notNull().references(() => traces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),       // llm | tool | function | other
  status: text('status').notNull().default('success'),
  input: jsonb('input'),
  output: jsonb('output'),
  metadata: jsonb('metadata'),        // model, provider, etc.
  tokens: integer('tokens'),
  cost: real('cost'),
  durationMs: integer('duration_ms'),
  errorMessage: text('error_message'),
  sequence: integer('sequence').notNull().default(0),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
}, t => ({
  traceIdx: index('steps_trace_idx').on(t.traceId),
}));
