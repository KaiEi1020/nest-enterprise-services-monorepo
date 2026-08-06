import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { BffAdminModule } from './bff-admin.module';

/**
 * Bootstraps the admin-app BFF. All external APIs use the `/api/v1` prefix
 * and an OpenAPI document (ADR-0003). The BFF stays stateless (ADR-0002):
 * no MikroORM, no business database connection is configured here.
 */
async function bootstrap() {
  const app = await NestFactory.create(BffAdminModule, { bufferLogs: true });
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Admin BFF API')
    .setDescription('Admin application backend-for-frontend')
    .setVersion('1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  new Logger('BffAdmin').log(`listening on :${port}/api/v1`);
}

void bootstrap();
