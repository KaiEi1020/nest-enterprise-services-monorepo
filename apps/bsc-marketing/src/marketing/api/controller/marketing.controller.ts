import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarketingApplicationService } from '../../application/service/marketing.application-service';
import type { GetPrizeResponseDto } from '../dto/marketing.dto';

/**
 * Marketing domain API. Exposes only technical seams in this baseline; domain
 * actions (prize/campaign management, redemption) are added by later tickets.
 * All endpoints sit under `/api/v1` and are documented via OpenAPI (ADR-0003).
 */
@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly marketingApplicationService: MarketingApplicationService,
  ) {}

  @Get('prizes/:id')
  @ApiOperation({ summary: 'Get a prize by id' })
  @ApiOkResponse({ description: 'Prize found' })
  async findPrize(
    @Param('id') id: string,
  ): Promise<GetPrizeResponseDto | null> {
    const prize = await this.marketingApplicationService.getPrize(id);
    if (!prize) return null;
    return {
      prizeId: prize.id,
      name: prize.name,
      redeemPoints: prize.redeemPoints,
    };
  }
}
