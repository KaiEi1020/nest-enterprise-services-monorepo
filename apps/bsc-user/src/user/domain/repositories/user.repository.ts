import { User } from '../entities/user.entity';

/** One page of users plus the total number of non-deleted users. */
export interface UserPage {
  users: User[];
  total: number;
}

/**
 * Domain repository port for the User profile aggregate (ADR-0002).
 * Implementations live under infrastructure/persistence and own the database
 * account for bsc-user. No other service may import or satisfy this port
 * directly.
 *
 * Declared as an abstract class so it can serve as a Nest DI token while the
 * domain layer stays free of any concrete ORM framework. List queries exclude
 * soft-deleted users by default; explicit id lookups still resolve them so the
 * api layer can report NOT_FOUND consistently.
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;

  abstract findByUsername(username: string): Promise<User | null>;

  abstract findByEmail(email: string): Promise<User | null>;

  abstract save(user: User): Promise<void>;

  /**
   * Returns a page of non-deleted users in stable creation order.
   * `page` is 1-based; `pageSize` is the number of records per page.
   */
  abstract findPage(page: number, pageSize: number): Promise<UserPage>;
}
