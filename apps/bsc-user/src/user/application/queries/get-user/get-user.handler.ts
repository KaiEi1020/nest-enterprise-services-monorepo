import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { GetUserQuery } from './get-user.query';

/**
 * Handles the admin "get user detail" read (issue 03). Read path only; no
 * domain invariants are mutated. Returns null when the user is absent or
 * soft-deleted so the api layer can map it to gRPC NOT_FOUND.
 */
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<
  GetUserQuery,
  User | null
> {
  constructor(private readonly users: UserRepository) {}

  async execute(query: GetUserQuery): Promise<User | null> {
    const user = await this.users.findById(query.userId);
    if (!user || user.deleted) return null;
    return user;
  }
}
