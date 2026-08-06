/**
 * User aggregate root (ADR-0002, ADR-0006). bsc-user is the single writer for
 * identity, RBAC and points balance. This baseline declares only the plain
 * domain shape; MikroORM entity wiring and migrations land in later tickets.
 */
export class User {
  constructor(
    public readonly id: string,
    public username: string,
    public active: boolean,
  ) {}
}
