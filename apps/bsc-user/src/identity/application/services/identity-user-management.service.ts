import { Injectable } from '@nestjs/common';
import { UserCredential } from '../../domain/entities/user-credential.entity';
import { CredentialRepository } from '../../domain/repositories/credential.repository';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { UserRole } from '@enterprise/platform';

/**
 * Public application seam for user-profile management to provision and
 * deactivate authentication credentials. The user domain depends on this
 * application capability, not on identity's repositories or entities, keeping
 * the identity boundary extractable as bsc-identity (ADR-0004).
 */
@Injectable()
export class IdentityUserManagementService {
  constructor(private readonly credentials: CredentialRepository) {}

  async createCredential(
    userId: string,
    username: string,
    plaintextPassword: string,
    role: UserRole,
    active: boolean,
  ): Promise<void> {
    const credential = new UserCredential(
      userId,
      username,
      await PasswordHash.fromPlaintext(plaintextPassword),
      role,
      active,
    );
    await this.credentials.saveCredential(credential);
  }

  async setActive(userId: string, active: boolean): Promise<void> {
    await this.credentials.setCredentialActive(userId, active);
  }

  /** Runs a credential staging transaction for the enclosing BSC UoW. */
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const credentials = this.credentials;
    if ('beginStaging' in credentials) {
      (credentials as unknown as CredentialStaging).beginStaging();
    }
    try {
      const result = await work();
      if ('commitStaging' in credentials) {
        (credentials as unknown as CredentialStaging).commitStaging();
      }
      return result;
    } catch (error) {
      if ('discardStaging' in credentials) {
        (credentials as unknown as CredentialStaging).discardStaging();
      }
      throw error;
    }
  }
}

interface CredentialStaging {
  beginStaging(): void;
  commitStaging(): void;
  discardStaging(): void;
}
