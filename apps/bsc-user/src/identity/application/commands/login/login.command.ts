/**
 * Command expressing the intent to log in with a username and password
 * (ADR-0004, ADR-0007). Carries only primitive protocol data; credential
 * rules stay inside the identity domain.
 */
export class LoginCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}
