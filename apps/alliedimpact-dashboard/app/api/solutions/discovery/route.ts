import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Solution Discovery API
 * 
 * Stores discovery form responses and generates a unique ID
 * for passing data to My Projects signup flow
 */

interface DiscoveryData {
  projectType: string;
  customProjectType?: string;
  budgetRange: string;
  timeline: string;
  description: string;
  organizationName?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

// In-memory store for discovery sessions (temporary)
// TODO: Replace with Firestore in production
const discoveryStore = new Map<string, { data: DiscoveryData; expiresAt: number }>();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of discoveryStore.entries()) {
    if (session.expiresAt < now) {
      discoveryStore.delete(id);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const data: DiscoveryData = await request.json();

    // Validate required fields
    if (!data.projectType || !data.budgetRange || !data.timeline || !data.description || !data.contactName || !data.contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique discovery ID
    const discoveryId = uuidv4();

    // Store discovery data (expires in 1 hour)
    discoveryStore.set(discoveryId, {
      data,
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    return NextResponse.json({
      discoveryId,
      message: 'Discovery data stored successfully'
    });
  } catch (error) {
    console.error('Discovery API error:', error);
    return NextResponse.json(
      { error: 'Failed to process discovery data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const discoveryId = searchParams.get('id');

    if (!discoveryId) {
      return NextResponse.json(
        { error: 'Discovery ID required' },
        { status: 400 }
      );
    }

    const session = discoveryStore.get(discoveryId);

    if (!session) {
      return NextResponse.json(
        { error: 'Discovery session not found or expired' },
        { status: 404 }
      );
    }

    // Check if expired
    if (session.expiresAt < Date.now()) {
      discoveryStore.delete(discoveryId);
      return NextResponse.json(
        { error: 'Discovery session expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      data: session.data
    });
  } catch (error) {
    console.error('Discovery GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve discovery data' },
      { status: 500 }
    );
  }
}
