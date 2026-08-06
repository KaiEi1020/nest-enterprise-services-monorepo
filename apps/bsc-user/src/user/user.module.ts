import { Module } from '@nestjs/common';
import { UserController } from './api/controller/user.controller';
import { UserApplicationService } from './application/service/user.application-service';
import { UserRepository } from './domain/repository/user.repository';
import { UserMikroOrmRepository } from './infrastructure/persistence/repositories/user.mikro-orm.repository';

/**
 * User domain module (ADR-0006). bsc-user owns identity, RBAC and points
 * balance. This baseline wires the DDD layers and a stub repository; MikroORM
 * registration, migrations and the dedicated DB account land in later
 * tickets and must never be shared with a BFF (ADR-0002).
 */
@Module({
  controllers: [UserController],
  providers: [
    UserApplicationService,
    { provide: UserRepository, useClass: UserMikroOrmRepository },
  ],
  exports: [UserApplicationService, UserRepository],
})
export class UserModule {}
