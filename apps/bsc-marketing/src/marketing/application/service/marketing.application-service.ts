import { Injectable, Logger } from '@nestjs/common';
import { PrizeRepository } from '../../domain/repository/prize.repository';

/**
 * Application service executing Marketing domain actions (ADR-0006).
 * bsc-marketing is a business service and may call bsc-user (e.g. to deduct or
 * refund points) but bsc-user must never depend back on bsc-marketing.
 * This baseline only wires the seam so the module compiles and boots.
 */
@Injectable()
export class MarketingApplicationService {
  private readonly logger = new Logger(MarketingApplicationService.name);

  constructor(private readonly prizes: PrizeRepository) {}

  async getPrize(id: string) {
    this.logger.log(`getPrize ${id}`);
    return this.prizes.findById(id);
  }
}
