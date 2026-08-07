/** Command carrying the intent to soft-delete a user. */
export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}
