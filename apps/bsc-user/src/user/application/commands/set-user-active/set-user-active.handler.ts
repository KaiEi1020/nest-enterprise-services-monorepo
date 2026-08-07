import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { IdentityUserManagementService } from '../../../../identity/application/services/identity-user-management.service';
import { SetUserActiveCommand } from './set-user-active.command';

/**
 * Handles the admin "set user active" domain action (issue 03). Toggling the
 * profile's active flag also mirrors it onto the identity credential so a
 * deactivated user can no longer log in (ADR-0004). A missing or soft-deleted
 * user raises UserNotFoundException (gRPC NOT_FOUND).
 */
@CommandHandler(SetUserActiveCommand)
export class SetUserActiveHandler implements ICommandHandler<
  SetUserActiveCommand,
  User
> {
  constructor(
    private readonly users: UserRepository,
    private readonly identity: IdentityUserManagementService,
  ) {}

  async execute(command: SetUserActiveCommand): Promise<User> {
    const user = await this.users.findById(command.userId);
    if (!user || user.deleted) {
      throw new UserNotFoundException(command.userId);
    }

    user.setActive(command.active);
    await this.users.save(user);
    await this.identity.setActive(user.id, command.active);
    return user;
  }
}
