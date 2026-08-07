/**
 * Unit-of-work port for the user domain (ADR-0002). Lets an application
 * handler commit the user profile and its identity credential as one atomic
 * unit. Declared in the domain so the application layer depends on the
 * abstraction, not on any ORM transaction API.
 *
 * The MikroORM ticket will back this with a real database transaction; until
 * then the infrastructure layer provides an in-memory implementation that
 * stages both writes and rolls back the profile if the credential write fails.
 */
export abstract class UnitOfWork {
  /**
   * Runs `work` and commits only when it resolves. If `work` throws, every
   * write staged inside it is rolled back so a partially-created user is never
   * left behind.
   */
  abstract runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
