import {
  createPublicKey,
  generateKeyPairSync,
  KeyObject,
  sign,
  verify,
} from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { UserRole } from '@enterprise/platform';

export interface AccessTokenClaims {
  sub: string;
  username: string;
  role: UserRole;
}

/**
 * Signs and verifies access tokens as EdDSA (Ed25519) JWTs (ADR-0004). The
 * private key stays inside bsc-user; downstream verifiers such as MSE Gateway
 * only need the public key for offline verification, so identity credentials
 * are never shared across the monorepo boundary.
 *
 * This baseline generates an ephemeral key pair per process. A later ticket
 * will load a provisioned key pair and expose the public key via JWKS.
 */
@Injectable()
export class JwtSigner {
  private readonly privateKey: KeyObject;
  readonly publicKeyPem: string;

  constructor() {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    this.privateKey = privateKey;
    this.publicKeyPem = publicKey
      .export({ type: 'spki', format: 'pem' })
      .toString();
  }

  signAccessToken(claims: AccessTokenClaims, expiresInSeconds: number): string {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'EdDSA', typ: 'JWT' };
    const payload = {
      ...claims,
      iat: now,
      exp: now + expiresInSeconds,
    };
    const signingInput = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;
    const signature = sign(null, Buffer.from(signingInput), this.privateKey);
    return `${signingInput}.${signature.toString('base64url')}`;
  }

  verifyAccessToken(token: string): AccessTokenClaims | null {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const header = decodeJson(headerB64);
    if (header?.['alg'] !== 'EdDSA') return null;

    const signingInput = `${headerB64}.${payloadB64}`;
    const valid = verify(
      null,
      Buffer.from(signingInput),
      createPublicKey(this.publicKeyPem),
      Buffer.from(signatureB64, 'base64url'),
    );
    if (!valid) return null;

    const payload = decodeJson(payloadB64);
    if (!payload || typeof payload['sub'] !== 'string') return null;
    if (
      typeof payload['exp'] === 'number' &&
      payload['exp'] <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    const username = payload['username'];
    return {
      sub: payload['sub'],
      username: typeof username === 'string' ? username : '',
      role: payload['role'] as UserRole,
    };
  }
}

function base64UrlEncode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decodeJson(segment: string): Record<string, unknown> | null {
  try {
    return JSON.parse(
      Buffer.from(segment, 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
  } catch {
    return null;
  }
}
