import { Injectable } from '@nestjs/common';
import { Prize } from '../../../domain/entities/prize.entity';
import { PrizeRepository } from '../../../domain/repository/prize.repository';

/**
 * PrizeRepository implementation for bsc-marketing (ADR-0002). bsc-marketing
 * owns this database account and migration; no other service may satisfy this
 * port. The concrete ORM is chosen by later tickets and confined to the
 * infrastructure layer; the domain layer never imports it. This baseline
 * returns an in-memory stub so the module wires without a live DB.
 */
@Injectable()
export class PrizeMikroOrmRepository extends PrizeRepository {
  async findById(id: string): Promise<Prize | null> {
    return new Prize(id, 'stub', 100);
  }
}
