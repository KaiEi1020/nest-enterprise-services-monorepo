import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';

/**
 * Shared protocol-contract library.
 *
 * This library MUST NOT contain domain models, aggregates, repository
 * implementations or business services (ADR-0001). It exposes only the gRPC
 * proto definitions and the shared proto-loader configuration that every
 * service uses for synchronous integration (ADR-0003).
 */
@Module({
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
