import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ContractsService } from '@enterprise/contracts';
import { BscUserModule } from './bsc-user.module';

/**
 * Bootstraps bsc-user as a hybrid application: HTTP serves `/api/v1` health
 * probes, and a gRPC microservice serves the user identity contract (ADR-0003,
 * ADR-0004). bsc-user owns its data (ADR-0002); the baseline uses an in-memory
 * identity store until the persistence ticket provisions the dedicated DB
 * account and migrations.
 */
async function bootstrap() {
  const app = await NestFactory.create(BscUserModule, { bufferLogs: true });
  app.setGlobalPrefix('api/v1');

  const grpcUrl = process.env.GRPC_URL ?? '0.0.0.0:50051';
  const contracts = app.get(ContractsService);
  app.connectMicroservice(
    {
      transport: Transport.GRPC,
      options: contracts.userGrpcOptions(grpcUrl),
    },
    { inheritAppConfig: true },
  );

  const port = Number(process.env.PORT ?? 4001);
  await app.startAllMicroservices();
  await app.listen(port);

  new Logger('BscUser').log(`HTTP listening on :${port}/api/v1`);
  new Logger('BscUser').log(`gRPC listening on ${grpcUrl}`);
}

void bootstrap();
