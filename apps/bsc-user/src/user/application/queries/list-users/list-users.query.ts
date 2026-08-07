/** Query carrying the intent to page through the non-deleted users. */
export class ListUsersQuery {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
  ) {}
}
