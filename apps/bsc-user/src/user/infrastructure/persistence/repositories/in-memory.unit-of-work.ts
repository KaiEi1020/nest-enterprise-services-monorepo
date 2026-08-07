import { Injectable } from '@nestjs/common';
import { IdentityUserManagementService } from '../../../../identity/application/services/identity-user-management.service';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work';
import { UserInMemoryRepository } from './user.in-memory.repository';

// IdentityUserManagementService owns credential staging behind its public seam.

/**
 * In-memory UnitOfWork for bsc-user (ADR-0002). Stands in for the MikroORM
 * transaction that the persistence ticket will provide. It gives the
 * create-user action an all-or-nothing boundary: the work callback stages its
 * writes, and they are committed only when the callback resolves. A throw
 * leaves both stores untouched, so a partially-created user can never be
 * observed.
 *
 * Commit atomicity here is best-effort for the synchronous in-memory baseline
 * (the stores apply their staged writes together, with no concurrent readers
 * mid-commit). Once MikroORM lands, this class is replaced by a real
 * `em.transactional` boundary and the staging disappears.
 */
@Injectable()
export class InMemoryUnitOfWork extends UnitOfWork {
  constructor(
    private readonly users: UserInMemoryRepository,
    private readonly identity: IdentityUserManagementService,
  ) {
    super();
  }

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    // Stage the profile and identity credential through their public seams;
    // both commit only when the enclosing callback resolves.
    this.users.beginStaging();
    try {
      return await this.identity.runInTransaction(async () => {
        const result = await work();
        this.users.commitStaging();
        return result;
      });
    } catch (error) {
      this.users.discardStaging();
      throw error;
    }
  }
}
