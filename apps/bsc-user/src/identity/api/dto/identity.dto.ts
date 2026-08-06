/**
 * gRPC request payloads for the identity domain actions (ADR-0007). These are
 * plain transport shapes mirrored from the proto contract, kept in the api
 * layer so the application layer only sees typed commands.
 */
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface TokenPairResponseDto {
  accessToken: string;
  accessTokenExpiresIn: string;
  refreshToken: string;
  refreshTokenExpiresIn: string;
}
