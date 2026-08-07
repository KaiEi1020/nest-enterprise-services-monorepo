import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { PageResponse, toPageResponse } from '@enterprise/contracts';
import { User } from '../../domain/entities/user.entity';
import { UserConflictException } from '../../domain/exceptions/user-conflict.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidEmailError } from '../../domain/value-objects/email.vo';
import { UserResponseDto } from '../dto/user.dto';
import { UserPage } from '../../domain/repositories/user.repository';

/**
 * Translates application-layer results into gRPC responses and transport
 * errors (ADR-0007). Keeps protocol mapping out of the command/query handlers.
 */
export function toUserResponse(user: User): UserResponseDto {
  return {
    userId: user.id,
    username: user.username,
    email: user.email.value,
    role: user.role,
    active: user.active,
    deleted: user.deleted,
    createdAt: String(user.createdAt.getTime()),
    updatedAt: String(user.updatedAt.getTime()),
  };
}

/**
 * Maps a domain user page onto the platform-wide reusable pagination envelope
 * (`total` + `list` + `hasNext`). The proto `ListUsersResponse` declares the
 * same `list` field, so the envelope crosses the wire unchanged.
 */
export function toListUsersResponse(
  page: UserPage,
  currentPage: number,
  pageSize: number,
): PageResponse<UserResponseDto> {
  return toPageResponse(
    page.users,
    page.total,
    currentPage,
    pageSize,
    toUserResponse,
  );
}

/** Maps a missing/soft-deleted user to gRPC NOT_FOUND. */
export function userNotFound(userId: string): RpcException {
  return new RpcException({
    code: status.NOT_FOUND,
    message: `User not found: ${userId}`,
  });
}

/**
 * Collapses the domain exceptions thrown by user-management handlers into the
 * matching gRPC status so the contract never leaks internal error shapes.
 */
export function toUserManagementError(error: unknown): RpcException {
  if (error instanceof RpcException) return error;
  if (error instanceof UserConflictException) {
    return new RpcException({
      code: status.ALREADY_EXISTS,
      message: error.message,
    });
  }
  if (error instanceof UserNotFoundException) {
    return new RpcException({
      code: status.NOT_FOUND,
      message: error.message,
    });
  }
  if (error instanceof InvalidEmailError) {
    return new RpcException({
      code: status.INVALID_ARGUMENT,
      message: error.message,
    });
  }
  return new RpcException({
    code: status.INTERNAL,
    message: 'User management action failed',
  });
}
