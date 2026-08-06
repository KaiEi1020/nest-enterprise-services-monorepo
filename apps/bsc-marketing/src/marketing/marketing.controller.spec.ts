import { Test } from '@nestjs/testing';
import { MarketingController } from './api/controller/marketing.controller';
import { MarketingApplicationService } from './application/service/marketing.application-service';
import { PrizeRepository } from './domain/repository/prize.repository';

describe('MarketingController', () => {
  let controller: MarketingController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MarketingController],
      providers: [
        MarketingApplicationService,
        {
          provide: PrizeRepository,
          useValue: {
            findById: async (id: string) => ({
              id,
              name: 'stub',
              redeemPoints: 100,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<MarketingController>(MarketingController);
  });

  it('maps a prize to the response dto', async () => {
    const result = await controller.findPrize('p1');
    expect(result).toEqual({ prizeId: 'p1', name: 'stub', redeemPoints: 100 });
  });
});
