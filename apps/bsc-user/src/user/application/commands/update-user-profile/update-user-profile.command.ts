/** Command carrying the intent to update a user's profile fields. */
export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly username: string | undefined,
    public readonly email: string | undefined,
  ) {}
}
