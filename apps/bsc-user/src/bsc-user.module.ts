import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PlatformModule } from '@enterprise/platform';
import { IdentityModule } from './identity/identity.module';

/**
 * bsc-user root module. Composes the User domain module with the shared
 * technical platform. As a BSC, bsc-user owns its data, database account and
 * migrations (ADR-0002); it is the basic service and must not depend on
 * bsc-marketing (ADR-0006).
 */
@Module({
  imports: [PlatformModule, UserModule, IdentityModule],
})
export class BscUserModule {}
