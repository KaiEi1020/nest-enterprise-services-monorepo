import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CredentialRepository } from '../../../domain/repositories/credential.repository';
import { PasswordHash } from '../../../domain/value-objects/password-hash.vo';
import { LoginCommand } from './login.command';
import { TokenIssuer, TokenPair } from '../../services/token-issuer.service';

/**
 * Handles the login use case (ADR-0004). Verifies the username/password
 * against the credential aggregate and issues a token pair. A failure returns
 * null so the caller collapses it to a single "invalid credentials" outcome
 * without revealing whether the account exists.
 */
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  TokenPair | null
> {
  constructor(
    private readonly credentials: CredentialRepository,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  async execute(command: LoginCommand): Promise<TokenPair | null> {
    const credential = await this.credentials.findActiveByUsername(
      command.username,
    );

    // Always run an Argon2id verification — against the real hash when the
    // account exists, or a fixed dummy hash otherwise — so the response time
    // cannot reveal whether the username exists (timing oracle).
    const valid = credential
      ? await credential.passwordHash.verify(command.password)
      : await PasswordHash.dummy().verify(command.password);
    if (!credential || !valid) return null;

    return this.tokenIssuer.issueTokenPair(
      credential.userId,
      credential.username,
      credential.role,
    );
  }
}
