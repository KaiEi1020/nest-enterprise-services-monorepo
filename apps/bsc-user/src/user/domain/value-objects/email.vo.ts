/**
 * Email value object for the user domain. Normalizes to lowercase so
 * uniqueness is case-insensitive, and rejects malformed input at the domain
 * boundary instead of leaking it into persistence or the gRPC contract.
 */
export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
      throw new InvalidEmailError(raw);
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/** Thrown when an email fails domain validation. */
export class InvalidEmailError extends Error {
  constructor(raw: string) {
    super(`Invalid email address: ${raw}`);
    this.name = 'InvalidEmailError';
  }
}
