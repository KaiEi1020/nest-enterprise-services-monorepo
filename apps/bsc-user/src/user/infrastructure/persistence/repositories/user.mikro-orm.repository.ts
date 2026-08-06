import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repository/user.repository';

/**
 * UserRepository implementation for bsc-user (ADR-0002). bsc-user owns this
 * database account and migration; no other service may satisfy this port. The
 * concrete ORM is chosen by later tickets and confined to the infrastructure
 * layer; the domain layer never imports it. This baseline returns an in-memory
 * stub so the module wires without a live DB.
 */
@Injectable()
export class UserMikroOrmRepository extends UserRepository {
  async findById(id: string): Promise<User | null> {
    return new User(id, 'stub', true);
  }
}
