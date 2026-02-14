# @alliedimpact/security

Shared security utilities for Allied iMpact platform.

## Features

- ✅ **CSRF Protection** - Token-based validation for state-changing requests
- ✅ **Rate Limiting** - Per-IP and per-user request throttling
- ✅ **Input Validation** - Zod-based schemas for common patterns
- ✅ **Input Sanitization** - XSS, SQL injection, path traversal prevention
- ✅ **Security Headers** - HSTS, CSP, X-Frame-Options, etc.
- ✅ **File Validation** - Size, MIME type, and extension checks
- ✅ **Format Validation** - Email, phone, ID numbers, crypto addresses

## Installation

```bash
pnpm add @alliedimpact/security
```

## Usage

### Middleware (Next.js Edge Runtime)

```typescript
// middleware.ts
import { createSecurityMiddleware, securityMiddlewareMatcher } from '@alliedimpact/security/middleware';

export const middleware = createSecurityMiddleware({
  rateLimits: {
    api: { requests: 100, windowMs: 60000 },
    auth: { requests: 5, windowMs: 300000 },
  },
  userRateLimits: {
    api: { requests: 500, windowMs: 60000 },
    trading: { requests: 100, windowMs: 60000 },
  },
  csrfProtection: true,
  csrfExemptPaths: ['/api/auth', '/api/webhooks'],
  securityHeaders: true,
});

export const config = {
  matcher: securityMiddlewareMatcher,
};
```

### Input Validation

```typescript
import { ValidationSchemas, z } from '@alliedimpact/security/validation';

// Define API route schema
const createUserSchema = z.object({
  email: ValidationSchemas.email,
  password: ValidationSchemas.password,
  name: ValidationSchemas.name,
  phone: ValidationSchemas.phoneZA,
});

// Validate request body
export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const validatedData = createUserSchema.parse(body);
    // ... process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(validationErrorResponse(error), { status: 400 });
    }
  }
}
```

### Input Sanitization

```typescript
import { sanitizeText, escapeHTML, stripHTML } from '@alliedimpact/security/validation';

// Sanitize user input
const userComment = sanitizeText(request.body.comment);
const safeHTML = escapeHTML(userComment);
const plainText = stripHTML(dangerousHTML);
```

### File Validation

```typescript
import { validateFile } from '@alliedimpact/security/validation';

const file = formData.get('file') as File;
const validation = validateFile(file, {
  maxSizeMB: 5,
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['.jpg', '.jpeg', '.png'],
});

if (!validation.valid) {
  return Response.json({ error: validation.error }, { status: 400 });
}
```

## Available Validation Schemas

| Schema | Description | Example |
|--------|-------------|---------|
| `email` | Valid email address | `user@example.com` |
| `password` | Strong password (8+ chars, mixed case, number, special) | `MyP@ssw0rd` |
| `username` | Alphanumeric + underscore/hyphen (3-20 chars) | `john_doe123` |
| `phoneZA` | South African phone number | `+27123456789` |
| `name` | Name with letters, spaces, hyphens, apostrophes | `Mary-Jane O'Connor` |
| `url` | Valid URL | `https://example.com` |
| `uuid` | UUID v4 | `123e4567-e89b-12d3-a456-426614174000` |
| `positiveInt` | Positive integer | `42` |
| `amount` | Currency amount (2 decimals) | `99.99` |
| `idNumberZA` | South African ID number (13 digits, Luhn check) | `9001015009087` |
| `safeText` | Text with XSS prevention | `Hello, world!` |
| `shortText` | Short text (max 100 chars) | `Product Title` |
| `longText` | Long text (max 5000 chars) | `Product Description...` |
| `pagination` | Pagination params | `{ page: 1, limit: 20 }` |

## Rate Limiting Configuration

### Default Limits

| Type | Endpoint | Limit |
|------|----------|-------|
| **API** | `/api/*` | 100 req/min (per IP), 500 req/min (per user) |
| **Auth** | `/api/auth/*`, `/login`, `/signup` | 5 req/5min (per IP) |
| **Trading** | `/api/trading/*`, `/api/escrow/*` | 50 req/min (per IP), 100 req/min (per user) |
| **Default** | All other routes | 200 req/min (per IP) |

### Custom Configuration

```typescript
const customMiddleware = createSecurityMiddleware({
  rateLimits: {
    api: { requests: 200, windowMs: 60000 },
    auth: { requests: 10, windowMs: 300000 },
    default: { requests: 300, windowMs: 60000 },
  },
  userRateLimits: {
    api: { requests: 1000, windowMs: 60000 },
    trading: { requests: 200, windowMs: 60000 },
  },
});
```

## Security Headers

The middleware automatically sets:

- `X-Frame-Options: SAMEORIGIN` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer information
- `Permissions-Policy: geolocation=(), microphone=(), camera=()` - Disable unnecessary browser features

### Custom Headers

```typescript
const middleware = createSecurityMiddleware({
  customHeaders: {
    'X-Custom-Header': 'value',
    'Custom-Security-Policy': 'strict',
  },
});
```

## CSRF Protection

CSRF tokens are automatically:
1. Generated on first GET request
2. Stored in `csrf-token` httpOnly cookie
3. Validated on POST/PUT/DELETE/PATCH requests
4. Accepted from `x-csrf-token` header or `csrf-token` cookie

### Client-Side Usage

```typescript
// Fetch with CSRF token
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf-token='))
  ?.split('=')[1];

await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

### Exempt Paths

By default, these paths are exempt from CSRF:
- `/api/auth/*` (authentication endpoints)
- `/api/webhooks/*` (external webhooks)

## Cryptographic Validations

### Bitcoin Address

```typescript
import { isValidCryptoAddress } from '@alliedimpact/security/validation';

const valid = isValidCryptoAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'BTC');
// true
```

### Ethereum Address

```typescript
const valid = isValidCryptoAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'ETH');
// true
```

### Credit Card (Luhn Algorithm)

```typescript
import { isValidCardNumber } from '@alliedimpact/security/validation';

const valid = isValidCardNumber('4532015112830366');
// true
```

## Best Practices

1. **Always validate on server side** - Client validation is for UX only
2. **Sanitize all user inputs** - Use `sanitizeText()` before storage
3. **Escape output** - Use `escapeHTML()` when rendering user content
4. **Use CSRF tokens** - Required for all state-changing operations
5. **Implement rate limiting** - Both per-IP and per-user
6. **Set security headers** - Use middleware or next.config.js
7. **Validate file uploads** - Check size, MIME type, and extension
8. **Never log sensitive data** - Passwords, tokens, credit cards, ID numbers

## Compliance

This package helps achieve compliance with:

- **GDPR** - Data minimization, purpose limitation, secure processing
- **POPIA** - Security safeguards, processing limitation, accountability
- **PCI DSS** - Secure network, protect cardholder data, access control
- **OWASP Top 10** - Injection, broken authentication, XSS, security misconfiguration

## Examples

### Complete API Route with Validation

```typescript
import { ValidationSchemas, z, validationErrorResponse } from '@alliedimpact/security/validation';
import { NextRequest } from 'next/server';

const transferSchema = z.object({
  amount: ValidationSchemas.amount,
  recipientId: ValidationSchemas.uuid,
  note: ValidationSchemas.shortText.optional(),
});

export async function POST(request: NextRequest) {
  // Parse and validate
  const body = await request.json();
  
  try {
    const { amount, recipientId, note } = transferSchema.parse(body);
    
    // Process transfer
    const transfer = await createTransfer({
      amount,
      recipientId,
      note: note || undefined,
    });
    
    return Response.json({ success: true, transfer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(validationErrorResponse(error), { status: 400 });
    }
    throw error;
  }
}
```

## License

MIT
