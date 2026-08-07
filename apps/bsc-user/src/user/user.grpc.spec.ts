import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ContractsService } from '@enterprise/contracts';
import { status } from '@grpc/grpc-js';
import { UserModule } from './user.module';
import { IdentityModule } from '../identity/identity.module';
import { UserRepository } from './domain/repositories/user.repository';
import { UserInMemoryRepository } from './infrastructure/persistence/repositories/user.in-memory.repository';

interface UserResponse {
  userId: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListUsersResponse {
  // The reusable pagination envelope's records field, declared in the proto.
  list: UserResponse[];
  // int64 decodes to a Long-like object through the Nest microservice client.
  total: string | number | { low: number; high: number; unsigned: boolean };
  hasNext: boolean;
}

function totalOf(response: ListUsersResponse): number {
  return Number(response.total);
}

interface UserServiceClient {
  createUser(request: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Observable<UserResponse>;
  listUsers(request: {
    page: { currentPage: number; pageSize: number };
  }): Observable<ListUsersResponse>;
  getUser(request: { userId: string }): Observable<UserResponse>;
  updateUserProfile(request: {
    userId: string;
    username: string;
    email: string;
  }): Observable<UserResponse>;
  setUserActive(request: {
    userId: string;
    active: boolean;
  }): Observable<UserResponse>;
  deleteUser(request: { userId: string }): Observable<{ deleted: boolean }>;
  login(request: {
    username: string;
    password: string;
  }): Observable<{ tokens: { accessToken: string } }>;
}

/**
 * gRPC seam tests for the user-management domain actions (issue 03). They
 * exercise the same proto contract the admin BFF would call, proving create,
 * paginated list, detail, profile update, status toggle, soft delete, and the
 * conflict paths (duplicate username/email → ALREADY_EXISTS, missing user →
 * NOT_FOUND). Creation must persist the credential atomically, verified by
 * logging in as the newly created user.
 */
describe('User management gRPC (seam)', () => {
  let app: INestApplication;
  let client: UserServiceClient;
  let users: UserInMemoryRepository;

  const contracts = new ContractsService();
  const grpcUrl = 'localhost:50053';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
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

    users = app.get<UserInMemoryRepository>(UserRepository);
    await app.startAllMicroservices();
    await app.init();

    const grpcClient = app.get<ClientGrpc>('USER_PACKAGE');
    client = grpcClient.getService<UserServiceClient>('UserService');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    users.clear();
  });

  async function createUser(
    username: string,
    email = `${username}@example.com`,
    role = 'student',
  ): Promise<UserResponse> {
    return firstValueFrom(
      client.createUser({ username, email, password: 's3cret', role }),
    );
  }

  it('creates a user and persists the credential atomically so it can log in', async () => {
    const created = await createUser('admin1', 'admin1@example.com', 'admin');

    expect(created.userId).toBeTruthy();
    expect(created.username).toBe('admin1');
    expect(created.email).toBe('admin1@example.com');
    expect(created.role).toBe('admin');
    expect(created.active).toBe(true);
    expect(created.deleted).toBe(false);

    const login = await firstValueFrom(
      client.login({ username: 'admin1', password: 's3cret' }),
    );
    expect(login.tokens.accessToken.split('.')).toHaveLength(3);
  });

  it('rejects a duplicate username with ALREADY_EXISTS', async () => {
    await createUser('dup', 'dup@example.com');

    await expect(
      firstValueFrom(
        client.createUser({
          username: 'dup',
          email: 'other@example.com',
          password: 'pw',
          role: 'student',
        }),
      ),
    ).rejects.toMatchObject({ code: status.ALREADY_EXISTS });
  });

  it('rejects a duplicate email with ALREADY_EXISTS', async () => {
    await createUser('first', 'shared@example.com');

    await expect(
      firstValueFrom(
        client.createUser({
          username: 'second',
          email: 'shared@example.com',
          password: 'pw',
          role: 'student',
        }),
      ),
    ).rejects.toMatchObject({ code: status.ALREADY_EXISTS });
  });

  it('rejects an invalid email with INVALID_ARGUMENT', async () => {
    await expect(
      firstValueFrom(
        client.createUser({
          username: 'bademail',
          email: 'not-an-email',
          password: 'pw',
          role: 'student',
        }),
      ),
    ).rejects.toMatchObject({ code: status.INVALID_ARGUMENT });
  });

  it('rejects an unknown role with INVALID_ARGUMENT instead of defaulting', async () => {
    await expect(
      firstValueFrom(
        client.createUser({
          username: 'badrole',
          email: 'badrole@example.com',
          password: 'pw',
          role: 'superuser',
        }),
      ),
    ).rejects.toMatchObject({ code: status.INVALID_ARGUMENT });
  });

  it('pages through users with the reusable pagination envelope', async () => {
    await createUser('u1');
    await createUser('u2');
    await createUser('u3');

    const page1 = await firstValueFrom(
      client.listUsers({ page: { currentPage: 1, pageSize: 2 } }),
    );
    expect(totalOf(page1)).toBe(3);
    expect(page1.list).toHaveLength(2);
    expect(page1.hasNext).toBe(true);

    const page2 = await firstValueFrom(
      client.listUsers({ page: { currentPage: 2, pageSize: 2 } }),
    );
    expect(page2.list).toHaveLength(1);
    expect(page2.hasNext).toBe(false);
    // No overlap between pages.
    expect(page2.list[0].userId).not.toBe(page1.list[0].userId);
    expect(page2.list[0].userId).not.toBe(page1.list[1].userId);
  });

  it('gets a user detail by id and returns NOT_FOUND for a missing id', async () => {
    const created = await createUser('detail');

    const fetched = await firstValueFrom(
      client.getUser({ userId: created.userId }),
    );
    expect(fetched.userId).toBe(created.userId);
    expect(fetched.username).toBe('detail');

    await expect(
      firstValueFrom(client.getUser({ userId: 'does-not-exist' })),
    ).rejects.toMatchObject({ code: status.NOT_FOUND });
  });

  it('updates the profile and enforces uniqueness against other users', async () => {
    const a = await createUser('alpha', 'alpha@example.com');
    await createUser('beta', 'beta@example.com');

    const updated = await firstValueFrom(
      client.updateUserProfile({
        userId: a.userId,
        username: 'alpha-renamed',
        email: 'alpha-new@example.com',
      }),
    );
    expect(updated.username).toBe('alpha-renamed');
    expect(updated.email).toBe('alpha-new@example.com');

    await expect(
      firstValueFrom(
        client.updateUserProfile({
          userId: a.userId,
          username: 'beta',
          email: '',
        }),
      ),
    ).rejects.toMatchObject({ code: status.ALREADY_EXISTS });

    await expect(
      firstValueFrom(
        client.updateUserProfile({
          userId: 'missing',
          username: 'x',
          email: '',
        }),
      ),
    ).rejects.toMatchObject({ code: status.NOT_FOUND });
  });

  it('toggles active status and blocks login when deactivated', async () => {
    const created = await createUser('toggle', 'toggle@example.com');

    const deactivated = await firstValueFrom(
      client.setUserActive({ userId: created.userId, active: false }),
    );
    expect(deactivated.active).toBe(false);

    await expect(
      firstValueFrom(client.login({ username: 'toggle', password: 's3cret' })),
    ).rejects.toMatchObject({ code: status.UNAUTHENTICATED });

    await expect(
      firstValueFrom(client.setUserActive({ userId: 'missing', active: true })),
    ).rejects.toMatchObject({ code: status.NOT_FOUND });
  });

  it('soft-deletes a user so it disappears from the default list and cannot log in', async () => {
    const created = await createUser('gone', 'gone@example.com');

    const result = await firstValueFrom(
      client.deleteUser({ userId: created.userId }),
    );
    expect(result.deleted).toBe(true);

    const list = await firstValueFrom(
      client.listUsers({ page: { currentPage: 1, pageSize: 10 } }),
    );
    expect(totalOf(list)).toBe(0);
    // Empty repeated fields are omitted by the proto3 wire codec.
    const listed = list.list ?? [];
    expect(listed.find((u) => u.userId === created.userId)).toBeUndefined();

    await expect(
      firstValueFrom(client.getUser({ userId: created.userId })),
    ).rejects.toMatchObject({ code: status.NOT_FOUND });

    await expect(
      firstValueFrom(client.login({ username: 'gone', password: 's3cret' })),
    ).rejects.toMatchObject({ code: status.UNAUTHENTICATED });

    // Deleting again reports NOT_FOUND.
    await expect(
      firstValueFrom(client.deleteUser({ userId: created.userId })),
    ).rejects.toMatchObject({ code: status.NOT_FOUND });
  });
});
