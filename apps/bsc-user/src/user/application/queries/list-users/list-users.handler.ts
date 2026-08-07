import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  UserPage,
  UserRepository,
} from '../../../domain/repositories/user.repository';
import { ListUsersQuery } from './list-users.query';

/**
 * Handles the admin "list users" read (issue 03). Returns a page of
 * non-deleted users plus the total count so the caller can render pagination.
 * Read path only; deleted users are excluded by the repository contract.
 */
@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<
  ListUsersQuery,
  UserPage
> {
  constructor(private readonly users: UserRepository) {}

  async execute(query: ListUsersQuery): Promise<UserPage> {
    // Page inputs are normalized at the api boundary (user.grpc-controller via
    // the shared pagination helper); the handler trusts them and reads.
    return this.users.findPage(query.page, query.pageSize);
  }
}
