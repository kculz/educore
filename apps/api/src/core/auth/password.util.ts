import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'node:crypto';

export interface PasswordDigest {
  salt: string;
  hash: string;
}

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')): PasswordDigest {
  const hash = pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, digest: PasswordDigest) {
  const comparison = hashPassword(password, digest.salt);
  const expected = Buffer.from(digest.hash, 'hex');
  const actual = Buffer.from(comparison.hash, 'hex');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

