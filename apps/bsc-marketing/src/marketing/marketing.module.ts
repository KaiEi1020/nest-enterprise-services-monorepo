import { Module } from '@nestjs/common';
import { MarketingController } from './api/controller/marketing.controller';
import { MarketingApplicationService } from './application/service/marketing.application-service';
import { PrizeRepository } from './domain/repository/prize.repository';
import { PrizeMikroOrmRepository } from './infrastructure/persistence/repositories/prize.mikro-orm.repository';

/**
 * Marketing domain module (ADR-0006). bsc-marketing owns campaigns, prizes,
 * redemption and redemption records. This baseline wires the DDD layers and a
 * stub repository; MikroORM registration, migrations and the dedicated DB
 * account land in later tickets and must never be shared with a BFF
 * (ADR-0002). bsc-marketing may call bsc-user; never the reverse.
 */
@Module({
  controllers: [MarketingController],
  providers: [
    MarketingApplicationService,
    { provide: PrizeRepository, useClass: PrizeMikroOrmRepository },
  ],
  exports: [MarketingApplicationService, PrizeRepository],
})
export class MarketingModule {}
