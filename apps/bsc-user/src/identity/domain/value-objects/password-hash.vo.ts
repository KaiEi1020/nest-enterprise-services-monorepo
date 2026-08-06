import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';

const ARGON2_MEMORY_KIB = 65_536;
const ARGON2_PASSES = 3;
const ARGON2_PARALLELISM = 4;
const ARGON2_TAG_LENGTH = 32;

// Precomputed Argon2id hash of a throwaway password with a fixed salt, at the
// same cost parameters used for real credentials. Only ever used to equalize
// login timing for absent accounts; it must never match a real password.
const DUMMY_HASH =
  'argon2id:65536:3:4:AAECAwQFBgcICQoLDA0ODw==:Dq1ZX6ftHN7eNg35RGGJK3+wcDgGmdpuxb0qYDT24GM=';

/**
 * PasswordHash persists a versioned Argon2id hash with an independently
 * generated random salt. The plaintext credential never leaves this value
 * object, and verification compares derived values in constant time.
 */
export class PasswordHash {
  private constructor(public readonly encoded: string) {}

  static async fromPlaintext(plaintext: string): Promise<PasswordHash> {
    const salt = randomBytes(16);
    const derived = await deriveArgon2id(plaintext, salt);
    return new PasswordHash(
      [
        'argon2id',
        ARGON2_MEMORY_KIB,
        ARGON2_PASSES,
        ARGON2_PARALLELISM,
        salt.toString('base64'),
        derived.toString('base64'),
      ].join(':'),
    );
  }

  static fromEncoded(encoded: string): PasswordHash {
    return new PasswordHash(encoded);
  }

  /**
   * A fixed Argon2id hash used only to match the cost of a real verification
   * when an account is absent, so login timing cannot leak whether a username
   * exists. Verifying against it always returns false for any real password.
   */
  static dummy(): PasswordHash {
    return PasswordHash.fromEncoded(DUMMY_HASH);
  }

  async verify(plaintext: string): Promise<boolean> {
    const [algorithm, memory, passes, parallelism, saltB64, hashB64] =
      this.encoded.split(':');
    if (
      algorithm !== 'argon2id' ||
      !saltB64 ||
      !hashB64 ||
      !isPositiveInteger(memory) ||
      !isPositiveInteger(passes) ||
      !isPositiveInteger(parallelism)
    ) {
      return false;
    }

    const expected = Buffer.from(hashB64, 'base64');
    if (expected.length === 0) return false;

    const derived = await deriveArgon2id(
      plaintext,
      Buffer.from(saltB64, 'base64'),
      Number(memory),
      Number(passes),
      Number(parallelism),
      expected.length,
    );
    return timingSafeEqual(derived, expected);
  }
}

function deriveArgon2id(
  plaintext: string,
  salt: Buffer,
  memory = ARGON2_MEMORY_KIB,
  passes = ARGON2_PASSES,
  parallelism = ARGON2_PARALLELISM,
  tagLength = ARGON2_TAG_LENGTH,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    argon2(
      'argon2id',
      {
        message: plaintext,
        nonce: salt,
        memory,
        passes,
        parallelism,
        tagLength,
      },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

function isPositiveInteger(value: string | undefined): boolean {
  return value !== undefined && /^\d+$/.test(value) && Number(value) > 0;
}
