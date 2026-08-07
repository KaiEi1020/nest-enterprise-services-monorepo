/**
 * Roles are the platform-wide vocabulary for user-level RBAC (ADR-0004).
 * bsc-user owns role assignment; BFFs enforce user-level RBAC from these roles
 * while each BSC keeps verifying resource ownership and domain invariants.
 *
 * UserRole lives in the shared kernel (`@enterprise/platform`) because it is
 * referenced across domain boundaries — the user profile aggregate, the
 * identity credential, and the BFFs all speak the same role language. Placing
 * it here lets each domain consume the vocabulary without reaching into
 * another domain's internals (CONTEXT.md 架构强制规则). It is a pure,
 * behavior-free vocabulary type; authorization policies and domain rules do
 * not belong in this enum.
 */
export enum UserRole {
  Admin = 'admin',
  Student = 'student',
}
