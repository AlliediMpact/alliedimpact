/**
 * Session Management API
 * 
 * Handles session cookie operations for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/auth/session
 * Clear the session cookie (logout)
 */
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear the session cookie
    response.cookies.delete('session');
    
    return response;
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}
