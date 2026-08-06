import { PasswordHash } from './password-hash.vo';

describe('PasswordHash', () => {
  it('round-trips a plaintext password', async () => {
    const hash = await PasswordHash.fromPlaintext('correct horse');
    await expect(hash.verify('correct horse')).resolves.toBe(true);
    await expect(hash.verify('wrong')).resolves.toBe(false);
  });

  it('dummy hash never verifies, regardless of input', async () => {
    const dummy = PasswordHash.dummy();
    await expect(dummy.verify('anything')).resolves.toBe(false);
    await expect(dummy.verify('')).resolves.toBe(false);
  });

  it('has the same cost parameters as a real hash (timing parity)', () => {
    const parts = PasswordHash.dummy().encoded.split(':');
    // argon2id : memory : passes : parallelism : salt : hash
    expect(parts[0]).toBe('argon2id');
    expect(parts[1]).toBe('65536');
    expect(parts[2]).toBe('3');
    expect(parts[3]).toBe('4');
  });
});
