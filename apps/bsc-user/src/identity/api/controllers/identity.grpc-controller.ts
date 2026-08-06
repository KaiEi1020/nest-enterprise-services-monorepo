import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../../application/commands/login/login.command';
import { RefreshTokenCommand } from '../../application/commands/refresh-token/refresh-token.command';
import { TokenPair } from '../../application/services/token-issuer.service';
import {
  LoginRequestDto,
  RefreshRequestDto,
  TokenPairResponseDto,
} from '../dto/identity.dto';
import {
  invalidCredentials,
  toTokenPairResponse,
} from '../presenters/identity.presenter';

/**
 * gRPC adapter for identity domain actions (ADR-0004). It translates the
 * protocol contract into commands and dispatches them on the CommandBus;
 * credential rules, signing, and refresh-token rotation remain within the
 * identity module's application and domain layers.
 */
@Controller()
export class IdentityGrpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @GrpcMethod('UserService', 'Login')
  async login(
    request: LoginRequestDto,
  ): Promise<{ tokens: TokenPairResponseDto }> {
    const tokens = await this.commandBus.execute<
      LoginCommand,
      TokenPair | null
    >(new LoginCommand(request.username, request.password));
    if (!tokens) throw invalidCredentials();
    return { tokens: toTokenPairResponse(tokens) };
  }

  @GrpcMethod('UserService', 'Refresh')
  async refresh(
    request: RefreshRequestDto,
  ): Promise<{ tokens: TokenPairResponseDto }> {
    const tokens = await this.commandBus.execute<
      RefreshTokenCommand,
      TokenPair | null
    >(new RefreshTokenCommand(request.refreshToken));
    if (!tokens) throw invalidCredentials();
    return { tokens: toTokenPairResponse(tokens) };
  }
}
