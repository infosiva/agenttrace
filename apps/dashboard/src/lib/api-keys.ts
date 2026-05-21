import { createHash, randomBytes } from 'crypto';
import { db, apiKeys, projects } from '@/lib/db';
import { eq } from 'drizzle-orm';

const KEY_PREFIX = 'al_';

export function generateApiKey(): { fullKey: string; hash: string; prefix: string } {
  const random = randomBytes(24).toString('base64url');
  const fullKey = `${KEY_PREFIX}${random}`;
  const hash = createHash('sha256').update(fullKey).digest('hex');
  const prefix = fullKey.slice(0, 8);
  return { fullKey, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export type ResolvedKey = {
  projectId: string;
  apiKeyId: string;
  userId: string;
};

/**
 * Look up the project + user associated with an API key.
 * Returns null when the key is unknown.
 */
export async function resolveApiKey(rawKey: string): Promise<ResolvedKey | null> {
  if (!rawKey?.startsWith(KEY_PREFIX)) return null;
  const hash = hashApiKey(rawKey);
  const rows = await db
    .select({
      apiKeyId: apiKeys.id,
      projectId: apiKeys.projectId,
      userId: projects.userId,
    })
    .from(apiKeys)
    .innerJoin(projects, eq(projects.id, apiKeys.projectId))
    .where(eq(apiKeys.keyHash, hash))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Extract the bearer token from an Authorization header.
 */
export function bearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}
