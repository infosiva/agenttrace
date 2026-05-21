import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Accept either the standard DATABASE_URL or Vercel's namespaced agentlogs_DATABASE_URL
const connectionString =
  process.env.DATABASE_URL ||
  process.env.agentlogs_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.agentlogs_POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Reuse client across hot reloads in dev
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

const client = globalForDb.pgClient ?? postgres(connectionString, {
  max: 5,
  idle_timeout: 30,
  prepare: false, // required for Supabase pgbouncer
});

if (process.env.NODE_ENV !== 'production') globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export type Db = typeof db;
export * from './schema';
