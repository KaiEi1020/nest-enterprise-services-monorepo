/** Command carrying the intent to enable or disable a user's account. */
export class SetUserActiveCommand {
  constructor(
    public readonly userId: string,
    public readonly active: boolean,
  ) {}
}
