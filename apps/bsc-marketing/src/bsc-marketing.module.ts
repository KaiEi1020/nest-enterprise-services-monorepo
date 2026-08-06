import { Module } from '@nestjs/common';
import { MarketingModule } from './marketing/marketing.module';
import { PlatformModule } from '@enterprise/platform';

/**
 * bsc-marketing root module. Composes the Marketing domain module with the
 * shared technical platform. As a BSC, bsc-marketing owns its data, database
 * account and migrations (ADR-0002); it is a business service and may depend on
 * bsc-user but bsc-user must never depend on it (ADR-0006).
 */
@Module({
  imports: [PlatformModule, MarketingModule],
})
export class BscMarketingModule {}
