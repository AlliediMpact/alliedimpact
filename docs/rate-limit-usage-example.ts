/**
 * Login page with rate limiting
 */

import { checkRateLimit, rateLimitResponse } from '@allied-impact/shared';

// Add rate limiting before authentication
const rateLimitResult = await checkRateLimit('login', email);

if (!rateLimitResult.success) {
  return rateLimitResponse(rateLimitResult);
}

// Continue with authentication...
