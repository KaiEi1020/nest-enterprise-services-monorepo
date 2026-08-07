import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserConflictException } from '../../../domain/exceptions/user-conflict.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { UpdateUserProfileCommand } from './update-user-profile.command';

/**
 * Handles the admin "update user profile" domain action (issue 03). Applies
 * the username/email changes on the profile aggregate, enforcing uniqueness
 * against every other user. A missing or soft-deleted user raises
 * UserNotFoundException (gRPC NOT_FOUND); a colliding username/email raises
 * UserConflictException (gRPC ALREADY_EXISTS).
 */
@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<
  UpdateUserProfileCommand,
  User
> {
  constructor(private readonly users: UserRepository) {}

  async execute(command: UpdateUserProfileCommand): Promise<User> {
    const user = await this.users.findById(command.userId);
    if (!user || user.deleted) {
      throw new UserNotFoundException(command.userId);
    }

    const email =
      command.email !== undefined && command.email !== ''
        ? Email.create(command.email)
        : undefined;
    const username =
      command.username !== undefined && command.username !== ''
        ? command.username
        : undefined;

    if (username && username !== user.username) {
      const conflict = await this.users.findByUsername(username);
      if (conflict && conflict.id !== user.id) {
        throw new UserConflictException('username', username);
      }
    }
    if (email && email.value !== user.email.value) {
      const conflict = await this.users.findByEmail(email.value);
      if (conflict && conflict.id !== user.id) {
        throw new UserConflictException('email', email.value);
      }
    }

    user.updateProfile(username, email);
    await this.users.save(user);
    return user;
  }
}
