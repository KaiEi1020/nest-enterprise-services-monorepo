import type { PageRequest } from '@enterprise/contracts';

/**
 * gRPC request/response payloads for the user-management domain actions
 * (ADR-0007). Plain transport shapes mirrored from the proto contract, kept in
 * the api layer so the application layer only sees typed commands/queries.
 */
export interface CreateUserRequestDto {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface ListUsersRequestDto {
  page: PageRequest;
}

export interface UpdateUserProfileRequestDto {
  userId: string;
  username: string;
  email: string;
}

export interface SetUserActiveRequestDto {
  userId: string;
  active: boolean;
}

export interface DeleteUserRequestDto {
  userId: string;
}

export interface UserResponseDto {
  userId: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersResponseDto {
  list: UserResponseDto[];
  total: string;
  hasNext: boolean;
}

export interface DeleteUserResponseDto {
  deleted: boolean;
}

/** Legacy REST response DTO kept for the baseline `/api/v1` health seam. */
export interface GetUserResponseDto {
  userId: string;
  username: string;
  active: boolean;
}
