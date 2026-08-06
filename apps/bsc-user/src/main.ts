import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { BscUserModule } from './bsc-user.module';

/**
 * Bootstraps bsc-user. As a BSC it owns its data (ADR-0002); the baseline does
 * not register MikroORM or a live DB yet. gRPC server wiring lands with the
 * identity ticket; HTTP health probes are mounted via the shared platform.
 */
async function bootstrap() {
  const app = await NestFactory.create(BscUserModule, { bufferLogs: true });
  app.setGlobalPrefix('api/v1');
  const port = Number(process.env.PORT ?? 4001);
  await app.listen(port);
  new Logger('BscUser').log(`listening on :${port}/api/v1`);
}

void bootstrap();
