import { Prize } from '../entities/prize.entity';

/**
 * Domain repository port for the Prize aggregate (ADR-0002). bsc-marketing
 * owns this database account and migration; no other service may satisfy it.
 *
 * Declared as an abstract class so it can serve as a Nest DI token while the
 * domain layer stays free of any concrete ORM framework.
 */
export abstract class PrizeRepository {
  abstract findById(id: string): Promise<Prize | null>;
}
