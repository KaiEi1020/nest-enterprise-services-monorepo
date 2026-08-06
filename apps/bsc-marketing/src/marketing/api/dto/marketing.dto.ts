/**
 * DTOs for the Marketing domain API. Future tickets add request/response shapes
 * for prize, campaign, campaign-prize-config and redemption endpoints.
 */
export interface GetPrizeResponseDto {
  prizeId: string;
  name: string;
  redeemPoints: number;
}
