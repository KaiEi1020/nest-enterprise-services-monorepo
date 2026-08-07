import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserConflictException } from '../../../domain/exceptions/user-conflict.exception';
import { IdentityUserManagementService } from '../../../../identity/application/services/identity-user-management.service';
import { CreateUserCommand } from './create-user.command';

/**
 * Handles the admin "create user" domain action (issue 03). Persists the user
 * profile and its authentication credential inside one UnitOfWork so they are
 * committed atomically (ADR-0004; the in-memory UnitOfWork stages both writes
 * and discards them on failure, replaced by a MikroORM transaction in the
 * persistence ticket). Uniqueness is enforced on both username and email; a
 * duplicate raises UserConflictException which the api layer maps to gRPC
 * ALREADY_EXISTS.
 */
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  User
> {
  constructor(
    private readonly users: UserRepository,
    private readonly identity: IdentityUserManagementService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const email = Email.create(command.email);

    const byUsername = await this.users.findByUsername(command.username);
    if (byUsername) {
      throw new UserConflictException('username', command.username);
    }
    const byEmail = await this.users.findByEmail(email.value);
    if (byEmail) {
      throw new UserConflictException('email', email.value);
    }

    const now = new Date();
    const user = new User(
      randomUUID(),
      command.username,
      email,
      command.role,
      true,
      false,
      now,
      now,
    );
    // One atomic unit of work: profile + credential commit together or not at
    // all. Identity owns credential construction and persistence behind its
    // public application seam.
    await this.unitOfWork.runInTransaction(async () => {
      await this.users.save(user);
      await this.identity.createCredential(
        user.id,
        user.username,
        command.plaintextPassword,
        user.role,
        user.active,
      );
    });

    return user;
  }
}
