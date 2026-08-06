import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../domain/repository/user.repository';

/**
 * Application service executing User domain actions (ADR-0006). Future tickets
 * add credential verification, JWT issuance, RBAC and points balance actions
 * here; this baseline only wires the seam so the module compiles and boots.
 */
@Injectable()
export class UserApplicationService {
  private readonly logger = new Logger(UserApplicationService.name);

  constructor(private readonly users: UserRepository) {}

  async getUser(id: string) {
    this.logger.log(`getUser ${id}`);
    return this.users.findById(id);
  }
}
