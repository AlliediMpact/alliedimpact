import { AppId } from '@/types/events';

/**
 * API Authentication - Validates app tokens
 */

// Token mapping (in production, store in environment variables)
const APP_TOKENS: Record<AppId, string> = {
  coinbox: process.env.COINBOX_API_TOKEN || '',
  sportshub: process.env.SPORTSHUB_API_TOKEN || '',
  drivemaster: process.env.DRIVEMASTER_API_TOKEN || '',
  edutech: process.env.EDUTECH_API_TOKEN || '',
  portal: process.env.PORTAL_API_TOKEN || '',
  myprojects: process.env.MYPROJECTS_API_TOKEN || '',
};

/**
 * Validate API token from Authorization header
 */
export function validateApiToken(
  authHeader: string | null,
  expectedAppId: AppId
): boolean {
  if (!authHeader) return false;
  
  // Format: "Bearer <token>"
  const token = authHeader.replace('Bearer ', '').trim();
  const expectedToken = APP_TOKENS[expectedAppId];
  
  if (!expectedToken) return false;
  
  return token === expectedToken;
}

/**
 * Extract app ID from request
 */
export function extractAppId(body: any): AppId | null {
  const appId = body?.appId;
  if (!appId || typeof appId !== 'string') return null;
  
  const validAppIds: AppId[] = [
    'coinbox',
    'sportshub',
    'drivemaster',
    'edutech',
    'portal',
    'myprojects',
  ];
  
  return validAppIds.includes(appId as AppId) ? (appId as AppId) : null;
}

/**
 * Create API error response
 */
export function apiError(code: string, message: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code, message },
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create API success response
 */
export function apiSuccess<T = void>(data?: T, status: number = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
