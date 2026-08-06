import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserApplicationService } from '../../application/service/user.application-service';
import type { GetUserResponseDto } from '../dto/user.dto';

/**
 * User domain API. Exposes only technical seams in this baseline; domain
 * actions (login, user management, points) are added by later tickets. All
 * endpoints sit under `/api/v1` and are documented via OpenAPI (ADR-0003).
 */
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userApplicationService: UserApplicationService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({ description: 'User found' })
  async findOne(@Param('id') id: string): Promise<GetUserResponseDto | null> {
    const user = await this.userApplicationService.getUser(id);
    if (!user) return null;
    return { userId: user.id, username: user.username, active: user.active };
  }
}
