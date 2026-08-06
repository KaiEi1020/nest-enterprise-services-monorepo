import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { TokenPair } from '../../application/services/token-issuer.service';
import { TokenPairResponseDto } from '../dto/identity.dto';

/**
 * Translates application-layer results into gRPC responses and transport
 * errors (ADR-0007). Keeps protocol mapping out of the command handlers.
 */
export function toTokenPairResponse(tokens: TokenPair): TokenPairResponseDto {
  return {
    accessToken: tokens.accessToken,
    accessTokenExpiresIn: String(tokens.accessTokenExpiresIn),
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresIn: String(tokens.refreshTokenExpiresIn),
  };
}

export function invalidCredentials(): RpcException {
  return new RpcException({
    code: status.UNAUTHENTICATED,
    message: 'Invalid credentials',
  });
}
