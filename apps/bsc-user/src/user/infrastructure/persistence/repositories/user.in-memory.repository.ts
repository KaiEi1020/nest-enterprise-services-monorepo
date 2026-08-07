import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import {
  UserPage,
  UserRepository,
} from '../../../domain/repositories/user.repository';

/**
 * UserRepository implementation for bsc-user (ADR-0002). The concrete
 * persistence (MikroORM schema, migrations and the dedicated DB account) is
 * confined to the infrastructure layer and lands with the persistence ticket;
 * the domain layer never imports it. This baseline keeps an in-memory store so
 * the module wires and the gRPC seam is testable without a live DB.
 *
 * Soft-deleted users are excluded from findPage by default; explicit id
 * lookups still resolve them so the api layer reports NOT_FOUND consistently.
 *
 * Staging hooks (beginStaging/commitStaging/discardStaging) back the in-memory
 * UnitOfWork: while a transaction is open, saves accumulate in a staging map
 * and are flushed to the committed store only on commit.
 */
@Injectable()
export class UserInMemoryRepository extends UserRepository {
  private readonly byId = new Map<string, User>();
  private readonly insertionOrder: string[] = [];

  private staging: Map<string, User> | null = null;

  async findById(id: string): Promise<User | null> {
    if (this.staging?.has(id)) return this.staging.get(id) ?? null;
    return this.byId.get(id) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.visibleUsers()) {
      if (user.username === username) return user;
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.visibleUsers()) {
      if (user.email.value === email) return user;
    }
    return null;
  }

  async save(user: User): Promise<void> {
    if (this.staging) {
      this.staging.set(user.id, user);
      return;
    }
    this.commitOne(user);
  }

  async findPage(page: number, pageSize: number): Promise<UserPage> {
    const visible = this.insertionOrder
      .map((id) => this.byId.get(id))
      .filter((user): user is User => user !== undefined && !user.deleted);
    const start = (page - 1) * pageSize;
    return {
      users: visible.slice(start, start + pageSize),
      total: visible.length,
    };
  }

  /** Opens a staging scope: subsequent saves accumulate without committing. */
  beginStaging(): void {
    this.staging = new Map();
  }

  /** Flushes staged saves into the committed store. */
  commitStaging(): void {
    if (!this.staging) return;
    for (const user of this.staging.values()) this.commitOne(user);
    this.staging = null;
  }

  /** Discards staged saves without committing them. */
  discardStaging(): void {
    this.staging = null;
  }

  /** Test helper: reset the store between seam-test cases. */
  clear(): void {
    this.byId.clear();
    this.insertionOrder.length = 0;
    this.staging = null;
  }

  private commitOne(user: User): void {
    if (!this.byId.has(user.id)) {
      this.insertionOrder.push(user.id);
    }
    this.byId.set(user.id, user);
  }

  private *visibleUsers(): Iterable<User> {
    const merged = new Map<string, User>(this.byId);
    if (this.staging) {
      for (const [id, user] of this.staging) merged.set(id, user);
    }
    yield* merged.values();
  }
}
