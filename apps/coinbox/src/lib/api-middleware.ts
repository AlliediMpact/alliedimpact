/**
 * API Middleware
 * Handles authentication, rate limiting, and request logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, incrementApiKeyUsage, hasPermission, ApiKey } from './api-auth-service';
import { checkRateLimit, logApiRequest, RateLimitResult } from './rate-limit-service';

export interface ApiRequest extends NextRequest {
  apiKey?: ApiKey;
  startTime?: number;
}

export interface ApiMiddlewareOptions {
  requiredPermission?: string;
  rateLimit?: boolean;
  logRequest?: boolean;
}

/**
 * API Authentication Middleware
 */
export async function withApiAuth(
  request: NextRequest,
  options: ApiMiddlewareOptions = {}
): Promise<{ apiKey: ApiKey } | NextResponse> {
  const startTime = Date.now();

  // Extract API key from header
  const authHeader = request.headers.get('authorization');
  const apiKeyFromHeader = request.headers.get('x-api-key');

  let apiKeyString: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    apiKeyString = authHeader.substring(7);
  } else if (apiKeyFromHeader) {
    apiKeyString = apiKeyFromHeader;
  }

  if (!apiKeyString) {
    return NextResponse.json(
      {
        error: 'API key required',
        message: 'Provide API key in Authorization header (Bearer token) or X-API-Key header',
      },
      { status: 401 }
    );
  }

  // Validate API key
  const validation = await validateApiKey(apiKeyString);

  if (!validation.valid || !validation.apiKey) {
    return NextResponse.json(
      {
        error: 'Invalid API key',
        message: validation.error || 'API key validation failed',
      },
      { status: 401 }
    );
  }

  const apiKey = validation.apiKey;

  // Check required permission
  if (options.requiredPermission && !hasPermission(apiKey, options.requiredPermission)) {
    return NextResponse.json(
      {
        error: 'Insufficient permissions',
        message: `This endpoint requires '${options.requiredPermission}' permission`,
      },
      { status: 403 }
    );
  }

  // Check rate limit
  if (options.rateLimit !== false) {
    const endpoint = new URL(request.url).pathname;
    const rateLimitResult = await checkRateLimit(apiKey, endpoint);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': (rateLimitResult.retryAfter || 60).toString(),
          },
        }
      );
    }

    // Increment usage counter
    await incrementApiKeyUsage(apiKey.id);
  }

  return { apiKey };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  rateLimitResult: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
  return response;
}

/**
 * Log API request
 */
export async function logRequest(
  apiKey: ApiKey,
  request: NextRequest,
  response: NextResponse,
  startTime: number
): Promise<void> {
  const endpoint = new URL(request.url).pathname;
  const method = request.method;
  const statusCode = response.status;
  const responseTime = Date.now() - startTime;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  await logApiRequest(apiKey, {
    endpoint,
    method,
    statusCode,
    responseTime,
    ip,
    userAgent,
  });
}

/**
 * Wrapper for API routes with authentication and rate limiting
 */
export function withApiMiddleware(
  handler: (request: NextRequest, context: { apiKey: ApiKey }) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = {}
) {
  return async (request: NextRequest) => {
    const startTime = Date.now();

    try {
      // Apply authentication middleware
      const authResult = await withApiAuth(request, options);

      // Check if auth failed (returned NextResponse)
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const { apiKey } = authResult;

      // Call the actual handler
      const response = await handler(request, { apiKey });

      // Log request if enabled
      if (options.logRequest !== false) {
        await logRequest(apiKey, request, response, startTime);
      }

      return response;
    } catch (error: any) {
      console.error('API Middleware Error:', error);

      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error.message || 'An unexpected error occurred',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * CORS headers for API endpoints
 */
export function addCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://coinbox.com',
    'https://www.coinbox.com',
    'https://api.coinbox.com',
  ];

  const requestOrigin = origin || '*';
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * Handle OPTIONS requests for CORS
 */
export function handleOptions(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, request.headers.get('origin') || undefined);
}

/**
 * Standard API error response
 */
export function apiError(
  message: string,
  statusCode: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(
  data: T,
  statusCode: number = 200,
  meta?: any
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Paginated API response
 */
export function apiPaginated<T>(
  data: T[],
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  }
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
