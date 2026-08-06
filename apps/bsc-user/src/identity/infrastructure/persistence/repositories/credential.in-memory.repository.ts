import { Injectable } from '@nestjs/common';
import {
  RefreshToken,
  UserCredential,
} from '../../../domain/entities/user-credential.entity';
import { CredentialRepository } from '../../../domain/repositories/credential.repository';
import { PasswordHash } from '../../../domain/value-objects/password-hash.vo';
import { UserRole } from '../../../domain/value-objects/user-role.vo';

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

  async findActiveByUsername(username: string): Promise<UserCredential | null> {
    const credential = this.credentialsByUsername.get(username);
    return credential && credential.active ? credential : null;
  }

  async findActiveById(userId: string): Promise<UserCredential | null> {
    const credential = this.credentialsById.get(userId);
    return credential && credential.active ? credential : null;
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

  /** Test/seed helper: register a credential without going through migrations. */
  async seedCredential(credential: UserCredential): Promise<void> {
    this.credentialsByUsername.set(credential.username, credential);
    this.credentialsById.set(credential.userId, credential);
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
}
