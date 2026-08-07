import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ContractsService } from '@enterprise/contracts';
import { IdentityModule } from './identity.module';
import { CredentialRepository } from './domain/repositories/credential.repository';
import { CredentialInMemoryRepository } from './infrastructure/persistence/repositories/credential.in-memory.repository';
import { UserRole } from '@enterprise/platform';
import { status } from '@grpc/grpc-js';

interface TokenPairResponse {
  accessToken: string;
  accessTokenExpiresIn: string;
  refreshToken: string;
  refreshTokenExpiresIn: string;
}

interface UserServiceClient {
  login(request: {
    username: string;
    password: string;
  }): Observable<{ tokens: TokenPairResponse }>;
  refresh(request: {
    refreshToken: string;
  }): Observable<{ tokens: TokenPairResponse }>;
}

/**
 * gRPC seam tests for the identity module (ADR-0004). They exercise the same
 * proto contract a BFF would call, proving login success, login failure (which
 * must not leak whether the account exists), and refresh-token rotation.
 */
describe('Identity gRPC (seam)', () => {
  let app: INestApplication;
  let client: UserServiceClient;
  let credentials: CredentialInMemoryRepository;

  const contracts = new ContractsService();
  const grpcUrl = 'localhost:50051';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        IdentityModule,
        ClientsModule.register([
          {
            name: 'USER_PACKAGE',
            transport: Transport.GRPC,
            options: contracts.userGrpcOptions(grpcUrl),
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.GRPC,
      options: contracts.userGrpcOptions(grpcUrl),
    });

    credentials = app.get<CredentialInMemoryRepository>(CredentialRepository);
    await app.startAllMicroservices();
    await app.init();

    const grpcClient = app.get<ClientGrpc>('USER_PACKAGE');
    client = grpcClient.getService<UserServiceClient>('UserService');
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns asymmetric access and refresh tokens on valid credentials', async () => {
    await credentials.seedUser('u-admin', 'admin', 's3cret', UserRole.Admin);

    const response = await firstValueFrom(
      client.login({ username: 'admin', password: 's3cret' }),
    );

    expect(response.tokens.accessToken.split('.')).toHaveLength(3);
    expect(response.tokens.refreshToken).toBeTruthy();
    expect(Number(response.tokens.accessTokenExpiresIn)).toBeGreaterThan(0);
    expect(Number(response.tokens.refreshTokenExpiresIn)).toBeGreaterThan(0);
  });

  it('rejects wrong credentials without revealing whether the user exists', async () => {
    await credentials.seedUser(
      'u-student',
      'student',
      'right',
      UserRole.Student,
    );

    const wrongPassword = firstValueFrom(
      client.login({ username: 'student', password: 'wrong' }),
    );
    await expect(wrongPassword).rejects.toMatchObject({
      code: status.UNAUTHENTICATED,
    });

    const unknownUser = firstValueFrom(
      client.login({ username: 'nobody', password: 'wrong' }),
    );
    await expect(unknownUser).rejects.toMatchObject({
      code: status.UNAUTHENTICATED,
    });
  });

  it('rotates the refresh token and invalidates the previous one', async () => {
    await credentials.seedUser('u-rotator', 'rotator', 'pw', UserRole.Student);
    const login = await firstValueFrom(
      client.login({ username: 'rotator', password: 'pw' }),
    );

    const rotated = await firstValueFrom(
      client.refresh({ refreshToken: login.tokens.refreshToken }),
    );
    expect(rotated.tokens.accessToken).toBeTruthy();
    expect(rotated.tokens.refreshToken).not.toBe(login.tokens.refreshToken);

    await expect(
      firstValueFrom(
        client.refresh({ refreshToken: login.tokens.refreshToken }),
      ),
    ).rejects.toMatchObject({ code: status.UNAUTHENTICATED });
  });
});
