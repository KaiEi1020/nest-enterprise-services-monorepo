/**
 * DTOs for the User domain API. Future tickets add request/response shapes for
 * login, user management and points endpoints.
 */
export interface GetUserResponseDto {
  userId: string;
  username: string;
  active: boolean;
}
