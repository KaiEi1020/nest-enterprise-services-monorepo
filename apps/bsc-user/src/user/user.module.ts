import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityModule } from '../identity/identity.module';
import { IdentityUserManagementService } from '../identity/application/services/identity-user-management.service';
import { UserGrpcController } from './api/controllers/user.grpc-controller';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { UpdateUserProfileHandler } from './application/commands/update-user-profile/update-user-profile.handler';
import { SetUserActiveHandler } from './application/commands/set-user-active/set-user-active.handler';
import { DeleteUserHandler } from './application/commands/delete-user/delete-user.handler';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { ListUsersHandler } from './application/queries/list-users/list-users.handler';
import { UserRepository } from './domain/repositories/user.repository';
import { UnitOfWork } from './domain/repositories/unit-of-work';
import { UserInMemoryRepository } from './infrastructure/persistence/repositories/user.in-memory.repository';
import { InMemoryUnitOfWork } from './infrastructure/persistence/repositories/in-memory.unit-of-work';

/**
 * User profile domain module (ADR-0006, ADR-0007). bsc-user owns identity,
 * RBAC and points balance; this module exposes the admin user-management
 * domain actions over gRPC. It composes the identity module so creating or
 * deactivating a user writes the authentication credential in the same unit of
 * work (ADR-0004). MikroORM registration, migrations and the dedicated DB
 * account land in later tickets and must never be shared with a BFF (ADR-0002).
 */
@Module({
  imports: [CqrsModule, IdentityModule],
  controllers: [UserGrpcController],
  providers: [
    CreateUserHandler,
    UpdateUserProfileHandler,
    SetUserActiveHandler,
    DeleteUserHandler,
    GetUserHandler,
    ListUsersHandler,
    { provide: UserRepository, useClass: UserInMemoryRepository },
    {
      provide: UnitOfWork,
      useFactory: (
        users: UserRepository,
        identity: IdentityUserManagementService,
      ): UnitOfWork =>
        new InMemoryUnitOfWork(users as UserInMemoryRepository, identity),
      inject: [UserRepository, IdentityUserManagementService],
    },
  ],
  exports: [UserRepository],
})
export class UserModule {}
