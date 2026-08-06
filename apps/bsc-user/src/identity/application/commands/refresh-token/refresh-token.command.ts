/**
 * Command expressing the intent to rotate a refresh token for a new access
 * token (ADR-0004, ADR-0007). The raw refresh token is presented once and
 * consumed atomically by the handler.
 */
export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}
