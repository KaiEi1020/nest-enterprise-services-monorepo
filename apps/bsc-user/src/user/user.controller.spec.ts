import { Test } from '@nestjs/testing';
import { UserController } from './api/controller/user.controller';
import { UserApplicationService } from './application/service/user.application-service';
import { UserRepository } from './domain/repository/user.repository';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserApplicationService,
        {
          provide: UserRepository,
          useValue: {
            findById: async (id: string) => ({
              id,
              username: 'stub',
              active: true,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('maps a user to the response dto', async () => {
    const result = await controller.findOne('u1');
    expect(result).toEqual({ userId: 'u1', username: 'stub', active: true });
  });
});
