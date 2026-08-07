import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from './create-user.command';
import { UserRole } from '@enterprise/platform';
import { UserInMemoryRepository } from '../../../infrastructure/persistence/repositories/user.in-memory.repository';
import { InMemoryUnitOfWork } from '../../../infrastructure/persistence/repositories/in-memory.unit-of-work';
import { CredentialInMemoryRepository } from '../../../../identity/infrastructure/persistence/repositories/credential.in-memory.repository';
import { IdentityUserManagementService } from '../../../../identity/application/services/identity-user-management.service';

/**
 * Proves the create-user UnitOfWork is atomic (issue 03: "用户与认证实体在同
 * 一事务中持久化"). When the credential write fails, the user profile must not
 * be left behind.
 */
describe('CreateUserHandler atomicity', () => {
  it('rolls back the profile when the credential write fails', async () => {
    const users = new UserInMemoryRepository();
    const credentials = new CredentialInMemoryRepository();
    const identity = new IdentityUserManagementService(credentials);
    const unitOfWork = new InMemoryUnitOfWork(users, identity);
    const handler = new CreateUserHandler(users, identity, unitOfWork);

    // Force the credential write to fail inside the transaction.
    jest
      .spyOn(identity, 'createCredential')
      .mockRejectedValueOnce(new Error('credential store unavailable'));

    await expect(
      handler.execute(
        new CreateUserCommand(
          'atomic',
          'atomic@example.com',
          'pw',
          UserRole.Student,
        ),
      ),
    ).rejects.toThrow('credential store unavailable');

    // The staged profile must have been discarded, not committed.
    expect(await users.findByUsername('atomic')).toBeNull();
    expect((await users.findPage(1, 10)).total).toBe(0);
  });
});
