/**
 * Roles are the identity domain's vocabulary for user-level RBAC (ADR-0004).
 * bsc-user owns role assignment; BFFs enforce user-level RBAC from these roles
 * while each BSC keeps verifying resource ownership and domain invariants.
 */
export enum UserRole {
  Admin = 'admin',
  Student = 'student',
}
