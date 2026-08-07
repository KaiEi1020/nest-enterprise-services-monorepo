import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityGrpcController } from './api/controllers/identity.grpc-controller';
import { LoginHandler } from './application/commands/login/login.handler';
import { RefreshTokenHandler } from './application/commands/refresh-token/refresh-token.handler';
import { TokenIssuer } from './application/services/token-issuer.service';
import { IdentityUserManagementService } from './application/services/identity-user-management.service';
import { CredentialRepository } from './domain/repositories/credential.repository';
import { JwtSigner } from './infrastructure/external/jwt-signer';
import { CredentialInMemoryRepository } from './infrastructure/persistence/repositories/credential.in-memory.repository';

/**
 * Isolated identity boundary within bsc-user (ADR-0004, ADR-0007). Its
 * controller, command handlers, domain port, and persistence adapter have no
 * imports from the user-profile module, preserving a direct extraction path to
 * bsc-identity as the platform evolves.
 */
@Module({
  imports: [CqrsModule],
  controllers: [IdentityGrpcController],
  providers: [
    LoginHandler,
    RefreshTokenHandler,
    TokenIssuer,
    IdentityUserManagementService,
    JwtSigner,
    {
      provide: CredentialRepository,
      useClass: CredentialInMemoryRepository,
    },
  ],
  exports: [CredentialRepository, JwtSigner, IdentityUserManagementService],
})
export class IdentityModule {}
