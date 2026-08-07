/**
 * Domain exception raised when a user-management action targets a user id that
 * does not exist (including one already soft-deleted). The api layer maps it to
 * a gRPC NOT_FOUND status.
 */
export class UserNotFoundException extends Error {
  constructor(public readonly userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundException';
  }
}
