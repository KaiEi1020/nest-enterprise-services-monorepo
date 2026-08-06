/**
 * Prize aggregate root (CONTEXT.md, ADR-0006). bsc-marketing owns prizes,
 * campaigns, redemption and redemption records. This baseline declares only
 * the plain domain shape; persistence wiring lands in later tickets and the
 * domain layer must stay free of any concrete ORM framework.
 */
export class Prize {
  constructor(
    public readonly id: string,
    public name: string,
    public redeemPoints: number,
  ) {}
}
