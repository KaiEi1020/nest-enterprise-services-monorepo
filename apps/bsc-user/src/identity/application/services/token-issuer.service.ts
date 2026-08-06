import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { RefreshToken } from '../../domain/entities/user-credential.entity';
import { CredentialRepository } from '../../domain/repositories/credential.repository';
import { UserRole } from '../../domain/value-objects/user-role.vo';
import {
  AccessTokenClaims,
  JwtSigner,
} from '../../infrastructure/external/jwt-signer';
import { hashRefreshToken } from './refresh-token-hasher';

export interface TokenPair {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
}

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Issues asymmetrically-signed access tokens and rotates opaque refresh
 * tokens for an already-authenticated identity (ADR-0004). Shared by the
 * login and refresh command handlers so signing, TTLs, and refresh-token
 * persistence live in exactly one place.
 */
@Injectable()
export class TokenIssuer {
  constructor(
    private readonly credentials: CredentialRepository,
    private readonly jwt: JwtSigner,
  ) {}

  async issueTokenPair(
    userId: string,
    username: string,
    role: UserRole,
  ): Promise<TokenPair> {
    const claims: AccessTokenClaims = { sub: userId, username, role };
    const accessToken = this.jwt.signAccessToken(
      claims,
      ACCESS_TOKEN_TTL_SECONDS,
    );

    const rawRefreshToken = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    await this.credentials.saveRefreshToken(
      new RefreshToken(hashRefreshToken(rawRefreshToken), userId, expiresAt),
    );

    return {
      accessToken,
      accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshToken: rawRefreshToken,
      refreshTokenExpiresIn: REFRESH_TOKEN_TTL_SECONDS,
    };
  }
}
