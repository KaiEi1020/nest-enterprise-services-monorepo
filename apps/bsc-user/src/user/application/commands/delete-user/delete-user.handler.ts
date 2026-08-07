import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { IdentityUserManagementService } from '../../../../identity/application/services/identity-user-management.service';
import { DeleteUserCommand } from './delete-user.command';

/**
 * Handles the admin "delete user" domain action (issue 03). Deletion is a soft
 * delete: the profile stays in storage with `deleted = true` and is excluded
 * from default list queries, and the identity credential is deactivated so the
 * user can no longer authenticate (ADR-0004). A missing or already-deleted user
 * raises UserNotFoundException (gRPC NOT_FOUND).
 */
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(
    private readonly users: UserRepository,
    private readonly identity: IdentityUserManagementService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.users.findById(command.userId);
    if (!user || user.deleted) {
      throw new UserNotFoundException(command.userId);
    }

    user.markDeleted();
    await this.users.save(user);
    await this.identity.setActive(user.id, false);
  }
}
