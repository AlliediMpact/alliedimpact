import { NextRequest, NextResponse } from 'next/server';

/**
 * PayFast Webhook Proxy
 * 
 * This route receives PayFast ITN and forwards to Cloud Function
 * In production, you can point PayFast directly to the Cloud Function URL
 * This proxy is useful for local development with ngrok
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get Cloud Function URL from environment
    const cloudFunctionUrl = process.env.PAYFAST_WEBHOOK_URL;
    
    if (!cloudFunctionUrl) {
      console.error('PAYFAST_WEBHOOK_URL not configured');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    // Forward to Cloud Function
    const response = await fetch(cloudFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Cloud Function error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
