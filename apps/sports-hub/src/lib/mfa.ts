import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * MFA Service
 * 
 * Handles Multi-Factor Authentication (MFA) operations:
 * - Generate MFA secrets
 * - Generate QR codes for authenticator apps
 * - Verify TOTP codes
 * - Generate backup codes
 */

export interface MFASecret {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
}

export interface BackupCode {
  code: string;
  used: boolean;
}

/**
 * Generate a new MFA secret and QR code
 * 
 * @param userEmail - User's email address
 * @param appName - Application name (defaults to SportsHub)
 * @returns MFA secret, otpauth URL, and QR code data URL
 */
export async function generateMFASecret(
  userEmail: string,
  appName: string = 'SportsHub'
): Promise<MFASecret> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${appName} (${userEmail})`,
    issuer: appName,
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error('Failed to generate OTP auth URL');
  }

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCode,
  };
}

/**
 * Verify a TOTP code against a secret
 * 
 * @param token - 6-digit TOTP code from authenticator app
 * @param secret - Base32 encoded secret
 * @param window - Time window (default 1 = 30 seconds before/after)
 * @returns True if code is valid
 */
export function verifyMFAToken(
  token: string,
  secret: string,
  window: number = 1
): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window,
  });
}

/**
 * Generate backup codes for MFA recovery
 * 
 * @param count - Number of backup codes to generate (default 10)
 * @returns Array of backup codes
 */
export function generateBackupCodes(count: number = 10): BackupCode[] {
  const codes: BackupCode[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    
    codes.push({
      code,
      used: false,
    });
  }

  return codes;
}

/**
 * Verify a backup code
 * 
 * @param code - Backup code to verify
 * @param backupCodes - Array of user's backup codes
 * @returns True if code is valid and unused
 */
export function verifyBackupCode(
  code: string,
  backupCodes: BackupCode[]
): { valid: boolean; index: number } {
  const normalizedCode = code.toUpperCase().trim();
  
  const index = backupCodes.findIndex(
    (bc) => bc.code === normalizedCode && !bc.used
  );

  return {
    valid: index !== -1,
    index,
  };
}

/**
 * Generate a current TOTP token (for testing)
 * 
 * @param secret - Base32 encoded secret
 * @returns Current 6-digit TOTP token
 */
export function generateCurrentToken(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
}

/**
 * Get time remaining until current token expires
 * 
 * @returns Seconds until token expires (0-30)
 */
export function getTokenTimeRemaining(): number {
  const epoch = Math.floor(Date.now() / 1000);
  const step = 30; // TOTP step size
  return step - (epoch % step);
}
