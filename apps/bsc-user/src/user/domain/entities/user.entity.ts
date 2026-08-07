import { UserRole } from '@enterprise/platform';
import { Email } from '../value-objects/email.vo';

/**
 * User profile aggregate root (ADR-0002, ADR-0006). bsc-user is the single
 * writer for identity, RBAC and points balance. The profile aggregate holds the
 * admin-manageable identity attributes (username, email, role, status) and the
 * soft-delete flag; authentication secrets live in the identity module's
 * credential aggregate so the future bsc-identity boundary stays clean
 * (ADR-0004). A deleted user never appears in default list queries.
 */
export class User {
  constructor(
    public readonly id: string,
    public username: string,
    public email: Email,
    public role: UserRole,
    public active: boolean,
    public deleted: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /** Applies a profile update; empty fields are left unchanged. */
  updateProfile(username: string | undefined, email: Email | undefined): void {
    if (username !== undefined && username !== '') this.username = username;
    if (email !== undefined) this.email = email;
    this.touch();
  }

  setActive(active: boolean): void {
    this.active = active;
    this.touch();
  }

  /** Soft delete: the row is kept but excluded from default queries. */
  markDeleted(): void {
    this.deleted = true;
    this.active = false;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
