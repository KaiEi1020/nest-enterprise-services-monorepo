import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CredentialRepository } from '../../../domain/repositories/credential.repository';
import { RefreshTokenCommand } from './refresh-token.command';
import { hashRefreshToken } from '../../services/refresh-token-hasher';
import { TokenIssuer, TokenPair } from '../../services/token-issuer.service';

/**
 * Handles the refresh use case (ADR-0004). Consumes the presented refresh
 * token atomically (so it can be used exactly once), then issues a new token
 * pair for the still-active credential. Any failure returns null, collapsing
 * to a single "invalid credentials" outcome.
 */
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<
  RefreshTokenCommand,
  TokenPair | null
> {
  constructor(
    private readonly credentials: CredentialRepository,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<TokenPair | null> {
    const tokenHash = hashRefreshToken(command.refreshToken);
    const stored = await this.credentials.consumeRefreshToken(tokenHash);
    if (!stored) return null;
    if (stored.isExpired(new Date())) return null;

    const credential = await this.credentials.findActiveById(stored.userId);
    if (!credential) return null;

    return this.tokenIssuer.issueTokenPair(
      credential.userId,
      credential.username,
      credential.role,
    );
  }
}
