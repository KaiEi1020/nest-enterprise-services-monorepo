import { UserRole } from '@enterprise/platform';

/** Command carrying the intent to create a user plus its credential atomically. */
export class CreateUserCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly plaintextPassword: string,
    public readonly role: UserRole,
  ) {}
}
