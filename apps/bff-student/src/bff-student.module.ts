import { Module } from '@nestjs/common';
import { PlatformModule } from '@enterprise/platform';

/**
 * Student BFF root module. Mounts the shared technical platform (health probes
 * under /api/v1/health) and the student-app's own orchestration seams. Future
 * tickets add gRPC clients to bsc-user and bsc-marketing and user-level RBAC.
 *
 * Deliberately has no MikroORM registration and no business database access
 * (ADR-0002); this is enforced by ESLint `no-restricted-imports`.
 */
@Module({
  imports: [PlatformModule],
})
export class BffStudentModule {}
