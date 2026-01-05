import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@allied-impact/auth/middleware';
import { hasProductAccess } from '@allied-impact/entitlements';

export const dynamic = 'force-dynamic';

/**
 * Platform-integrated session verification for Coin Box
 * 
 * Verifies:
 * 1. Valid platform session cookie
 * 2. User has active entitlement for Coin Box product
 */
export async function GET(request: NextRequest) {
    try {
        // In development, allow through without verification
        if (process.env.NODE_ENV === 'development') {
            return new NextResponse('OK', { status: 200 });
        }

        // Verify authentication using platform auth service
        const decodedToken = await verifyAuth(request);
        
        if (!decodedToken) {
            return new NextResponse('Unauthorized - No valid session', { status: 401 });
        }

        // Check if user has entitlement to access Coin Box
        const hasAccess = await hasProductAccess(decodedToken.uid, 'coinbox');
        
        if (!hasAccess) {
            return new NextResponse(
                JSON.stringify({ 
                    error: 'Subscription required', 
                    productId: 'coinbox',
                    userId: decodedToken.uid
                }), 
                { 
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // User is authenticated and has valid entitlement
        return new NextResponse(
            JSON.stringify({ 
                ok: true,
                userId: decodedToken.uid,
                email: decodedToken.email
            }), 
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('[Coin Box Auth Verify] Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
