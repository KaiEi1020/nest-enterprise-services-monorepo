import { createHash } from 'node:crypto';

/**
 * Hashes a raw refresh token for at-rest storage (ADR-0004). Only the hash is
 * persisted, so a presented token can be rotated and revoked without keeping
 * the raw value.
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
