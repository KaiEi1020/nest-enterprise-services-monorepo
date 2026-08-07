import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { normalizePageRequest } from '@enterprise/contracts';
import { UserRole } from '@enterprise/platform';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { UpdateUserProfileCommand } from '../../application/commands/update-user-profile/update-user-profile.command';
import { SetUserActiveCommand } from '../../application/commands/set-user-active/set-user-active.command';
import { DeleteUserCommand } from '../../application/commands/delete-user/delete-user.command';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
import { ListUsersQuery } from '../../application/queries/list-users/list-users.query';
import { User } from '../../domain/entities/user.entity';
import { UserPage } from '../../domain/repositories/user.repository';
import {
  CreateUserRequestDto,
  DeleteUserRequestDto,
  DeleteUserResponseDto,
  ListUsersRequestDto,
  SetUserActiveRequestDto,
  UpdateUserProfileRequestDto,
  UserResponseDto,
} from '../dto/user.dto';
import {
  toListUsersResponse,
  toUserManagementError,
  toUserResponse,
  userNotFound,
} from '../presenters/user.presenter';

/**
 * gRPC adapter for the admin user-management domain actions (issue 03,
 * ADR-0007). It translates the proto contract into commands/queries dispatched
 * on the buses; profile rules, uniqueness, and soft-delete semantics stay in
 * the user domain and application layers. Transport errors are normalized by
 * the presenter: conflict → ALREADY_EXISTS, missing user → NOT_FOUND, invalid
 * email → INVALID_ARGUMENT.
 */
@Controller()
export class UserGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(request: CreateUserRequestDto): Promise<UserResponseDto> {
    try {
      const user = await this.commandBus.execute<CreateUserCommand, User>(
        new CreateUserCommand(
          request.username,
          request.email,
          request.password,
          this.parseRole(request.role),
        ),
      );
      return toUserResponse(user);
    } catch (error) {
      throw toUserManagementError(error);
    }
  }

  @GrpcMethod('UserService', 'ListUsers')
  async listUsers(request: ListUsersRequestDto) {
    // Normalize the nested `page` envelope once at the api boundary.
    const { currentPage, pageSize } = normalizePageRequest(request);
    const page = await this.queryBus.execute<ListUsersQuery, UserPage>(
      new ListUsersQuery(currentPage, pageSize),
    );
    return toListUsersResponse(page, currentPage, pageSize);
  }

  @GrpcMethod('UserService', 'GetUser')
  async getUser(request: { userId: string }): Promise<UserResponseDto> {
    const user = await this.queryBus.execute<GetUserQuery, User | null>(
      new GetUserQuery(request.userId),
    );
    if (!user) throw userNotFound(request.userId);
    return toUserResponse(user);
  }

  @GrpcMethod('UserService', 'UpdateUserProfile')
  async updateUserProfile(
    request: UpdateUserProfileRequestDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.commandBus.execute<
        UpdateUserProfileCommand,
        User
      >(
        new UpdateUserProfileCommand(
          request.userId,
          request.username,
          request.email,
        ),
      );
      return toUserResponse(user);
    } catch (error) {
      throw toUserManagementError(error);
    }
  }

  @GrpcMethod('UserService', 'SetUserActive')
  async setUserActive(
    request: SetUserActiveRequestDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.commandBus.execute<SetUserActiveCommand, User>(
        new SetUserActiveCommand(request.userId, request.active),
      );
      return toUserResponse(user);
    } catch (error) {
      throw toUserManagementError(error);
    }
  }

  @GrpcMethod('UserService', 'DeleteUser')
  async deleteUser(
    request: DeleteUserRequestDto,
  ): Promise<DeleteUserResponseDto> {
    try {
      await this.commandBus.execute<DeleteUserCommand, void>(
        new DeleteUserCommand(request.userId),
      );
      return { deleted: true };
    } catch (error) {
      throw toUserManagementError(error);
    }
  }

  private parseRole(role: string): UserRole {
    // Reject unknown roles instead of silently coercing to Student.
    if (role === 'admin') return UserRole.Admin;
    if (role === 'student') return UserRole.Student;
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: `Unknown role: ${role}`,
    });
  }
}
