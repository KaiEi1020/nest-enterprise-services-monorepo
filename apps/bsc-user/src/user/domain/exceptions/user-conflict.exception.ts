/**
 * Domain exception raised when a create/update would collide with an existing
 * username or email. Kept free of transport concerns; the api layer maps it to
 * a gRPC ALREADY_EXISTS status.
 */
export class UserConflictException extends Error {
  constructor(
    public readonly field: 'username' | 'email',
    public readonly value: string,
  ) {
    super(`A user with this ${field} already exists`);
    this.name = 'UserConflictException';
  }
}
