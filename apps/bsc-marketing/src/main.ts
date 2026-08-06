import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { BscMarketingModule } from './bsc-marketing.module';

/**
 * Bootstraps bsc-marketing. As a BSC it owns its data (ADR-0002); the baseline
 * does not register MikroORM or a live DB yet. gRPC server wiring lands with the
 * marketing tickets; HTTP health probes are mounted via the shared platform.
 */
async function bootstrap() {
  const app = await NestFactory.create(BscMarketingModule, {
    bufferLogs: true,
  });
  app.setGlobalPrefix('api/v1');
  const port = Number(process.env.PORT ?? 4002);
  await app.listen(port);
  new Logger('BscMarketing').log(`listening on :${port}/api/v1`);
}

void bootstrap();
