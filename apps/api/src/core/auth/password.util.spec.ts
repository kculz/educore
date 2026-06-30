import { hashPassword, verifyPassword } from './password.util';

describe('password.util', () => {
  it('hashes and verifies passwords safely', () => {
    const digest = hashPassword('Password123!');

    expect(digest.salt).toHaveLength(32);
    expect(verifyPassword('Password123!', digest)).toBe(true);
    expect(verifyPassword('WrongPassword!', digest)).toBe(false);
  });
});

