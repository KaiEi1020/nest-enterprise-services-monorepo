import { User } from '../entities/user.entity';

/**
 * Domain repository port for the User aggregate (ADR-0002). Implementations
 * live under infrastructure/persistence and own the database account for
 * bsc-user. No other service may import or satisfy this port directly.
 *
 * Declared as an abstract class so it can serve as a Nest DI token while the
 * domain layer stays free of any concrete ORM framework.
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
}
