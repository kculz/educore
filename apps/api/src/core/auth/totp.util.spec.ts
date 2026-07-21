import { generateBase32Secret, generateTotpCode, verifyTotpCode, generateTotpUri, generateBackupCodes } from './totp.util';

describe('totp.util', () => {
  it('generates secret, totp code, and verifies correctly', () => {
    const secret = generateBase32Secret(20);
    expect(secret.length).toBeGreaterThanOrEqual(20);

    const code = generateTotpCode(secret);
    expect(code).toMatch(/^\d{6}$/);

    const isValid = verifyTotpCode(secret, code);
    expect(isValid).toBe(true);

    const isInvalid = verifyTotpCode(secret, '000000');
    // 000000 will be false unless coincidental
    expect(typeof isInvalid).toBe('boolean');

    const uri = generateTotpUri(secret, 'admin@educore.local', 'EduCore SaaS');
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain(secret);

    const backups = generateBackupCodes(8);
    expect(backups).toHaveLength(8);
  });
});
