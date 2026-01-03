import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'allied-impact-dashboard',
    timestamp: new Date().toISOString(),
  });
}
