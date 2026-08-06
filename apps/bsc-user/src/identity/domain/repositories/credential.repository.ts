import {
  RefreshToken,
  UserCredential,
} from '../entities/user-credential.entity';

/**
 * Identity persistence port. This is deliberately separate from the user
 * profile repository so it can move unchanged to a future bsc-identity BSC.
 */
export abstract class CredentialRepository {
  abstract findActiveByUsername(
    username: string,
  ): Promise<UserCredential | null>;

  abstract findActiveById(userId: string): Promise<UserCredential | null>;

  abstract saveRefreshToken(token: RefreshToken): Promise<void>;

  /** Atomically consumes the token so a refresh token can be used only once. */
  abstract consumeRefreshToken(tokenHash: string): Promise<RefreshToken | null>;
}
