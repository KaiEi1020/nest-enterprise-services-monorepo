import { Injectable } from '@nestjs/common';
import {
  RefreshToken,
  UserCredential,
} from '../../../domain/entities/user-credential.entity';
import { CredentialRepository } from '../../../domain/repositories/credential.repository';
import { PasswordHash } from '../../../domain/value-objects/password-hash.vo';
import { UserRole } from '@enterprise/platform';

/**
 * CredentialRepository implementation for bsc-user (ADR-0002). The concrete
 * persistence (MikroORM schema, migrations and the dedicated DB account) is
 * confined to the infrastructure layer and lands with the persistence ticket;
 * the domain layer never imports it. This baseline keeps an in-memory store so
 * the module wires and the gRPC seam is testable without a live DB.
 *
 * Refresh tokens are keyed by their SHA-256 hash and consumed atomically on
 * rotation, so a presented refresh token can be used exactly once.
 */
@Injectable()
export class CredentialInMemoryRepository extends CredentialRepository {
  private readonly credentialsByUsername = new Map<string, UserCredential>();
  private readonly credentialsById = new Map<string, UserCredential>();
  private readonly refreshTokens = new Map<string, RefreshToken>();

  private staging: Map<string, UserCredential> | null = null;

  async findActiveByUsername(username: string): Promise<UserCredential | null> {
    const staged = this.staging?.get(username);
    if (staged) return staged.active ? staged : null;
    const credential = this.credentialsByUsername.get(username);
    return credential && credential.active ? credential : null;
  }

  async findActiveById(userId: string): Promise<UserCredential | null> {
    for (const credential of this.visibleCredentials()) {
      if (credential.userId === userId) {
        return credential.active ? credential : null;
      }
    }
    return null;
  }

  async saveRefreshToken(token: RefreshToken): Promise<void> {
    this.refreshTokens.set(token.tokenHash, token);
  }

  async consumeRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const token = this.refreshTokens.get(tokenHash);
    if (!token) return null;
    this.refreshTokens.delete(tokenHash);
    return token;
  }

  async saveCredential(credential: UserCredential): Promise<void> {
    if (this.staging) {
      this.staging.set(credential.username, credential);
      return;
    }
    this.commitOne(credential);
  }

  async setCredentialActive(userId: string, active: boolean): Promise<void> {
    const credential = this.credentialsById.get(userId);
    if (credential) credential.active = active;
  }

  /** Opens a staging scope: subsequent saves accumulate without committing. */
  beginStaging(): void {
    this.staging = new Map();
  }

  /** Flushes staged credentials into the committed store. */
  commitStaging(): void {
    if (!this.staging) return;
    for (const credential of this.staging.values()) this.commitOne(credential);
    this.staging = null;
  }

  /** Discards staged credentials without committing them. */
  discardStaging(): void {
    this.staging = null;
  }

  /** Test/seed helper: register a credential without going through migrations. */
  async seedCredential(credential: UserCredential): Promise<void> {
    await this.saveCredential(credential);
  }

  /** Test/seed helper: create and register a credential from a plaintext password. */
  async seedUser(
    userId: string,
    username: string,
    plaintextPassword: string,
    role: UserRole,
  ): Promise<UserCredential> {
    const credential = new UserCredential(
      userId,
      username,
      await PasswordHash.fromPlaintext(plaintextPassword),
      role,
      true,
    );
    await this.seedCredential(credential);
    return credential;
  }

  private commitOne(credential: UserCredential): void {
    this.credentialsByUsername.set(credential.username, credential);
    this.credentialsById.set(credential.userId, credential);
  }

  private *visibleCredentials(): Iterable<UserCredential> {
    const merged = new Map<string, UserCredential>(this.credentialsByUsername);
    if (this.staging) {
      for (const [username, credential] of this.staging) {
        merged.set(username, credential);
      }
    }
    yield* merged.values();
  }
}
