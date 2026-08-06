import { PasswordHash } from '../value-objects/password-hash.vo';
import { UserRole } from '../value-objects/user-role.vo';

/**
 * Credential aggregate for the identity domain (ADR-0004). bsc-user owns
 * identity via this aggregate; it holds the data needed to verify a
 * username/password and to describe who the resulting token represents.
 * Kept inside the identity module so the module can later be extracted into
 * bsc-identity without touching user-profile data.
 */
export class UserCredential {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly passwordHash: PasswordHash,
    public readonly role: UserRole,
    public readonly active: boolean,
  ) {}
}

/**
 * A rotated refresh token session. The raw token is only returned to the
 * caller once; at rest we keep only its hash plus the expiry, so old tokens
 * can be revoked on rotation.
 */
export class RefreshToken {
  constructor(
    public readonly tokenHash: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
  ) {}

  isExpired(now: Date): boolean {
    return this.expiresAt.getTime() <= now.getTime();
  }
}
