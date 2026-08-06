import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PlatformService } from './platform.service';

/**
 * Shared technical capabilities for the platform.
 *
 * This library is intentionally free of domain models, aggregates, repository
 * implementations and business services (see ADR-0001). It may only expose
 * technical cross-cutting concerns such as health probes and future
 * observability helpers that any BFF or BSC may mount.
 */
@Module({
  controllers: [HealthController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
