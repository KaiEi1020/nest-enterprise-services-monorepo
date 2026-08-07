/** Query carrying the intent to read one user by id (admin detail view). */
export class GetUserQuery {
  constructor(public readonly userId: string) {}
}
