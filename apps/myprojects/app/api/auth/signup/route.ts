import { NextRequest, NextResponse } from 'next/server';
import { getAuthInstance } from '@allied-impact/auth';
import { createProject, ProjectStatus, ProjectType } from '@allied-impact/projects';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';

/**
 * My Projects Signup API
 * 
 * Creates user account and auto-generates first project
 * from discovery data
 */

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
  phone?: string;
  discoveryData?: {
    projectType: string;
    customProjectType?: string;
    budgetRange: string;
    timeline: string;
    description: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: SignupRequest = await request.json();

    // Validate required fields
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get auth service
    const auth = getAuthInstance();
    const db = getFirestore(getApp());

    // 1. Create user account with Firebase Auth
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const userId = userCredential.user.uid;

    // Update user profile with display name
    await updateProfile(userCredential.user, { displayName: data.name });

    // 2. Create user profile in Firestore
    await setDoc(doc(db, 'users', userId), {
      email: data.email,
      name: data.name,
      organizationName: data.organizationName,
      phone: data.phone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      archetypes: ['individual']
    });

    // 3. Auto-create first project from discovery data
    let projectId = null;
    if (data.discoveryData) {
      const projectType = mapDiscoveryTypeToProjectType(data.discoveryData.projectType);
      const projectName = getProjectName(data.discoveryData.projectType, data.discoveryData.customProjectType);
      
      const project = await createProject(userId, {
        clientId: userId,
        clientName: data.name,
        name: projectName,
        type: projectType,
        status: ProjectStatus.DISCOVERY,
        description: data.discoveryData.description,
        startDate: new Date(),
        estimatedBudget: mapBudgetRangeToNumber(data.discoveryData.budgetRange),
        currency: 'ZAR',
        progress: 0,
        milestones: [],
        deliverables: [],
        tickets: [],
        teamMembers: [userId],
        createdBy: userId,
        settings: {
          allowTickets: true,
          requireApprovals: true,
          notifyOnUpdate: true
        }
      });

      projectId = project.id;
    }

    return NextResponse.json({
      userId,
      projectId,
      message: 'Account created successfully'
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'Password is too weak' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Generate project name from discovery data
 */
function getProjectName(projectType: string, customType?: string): string {
  const typeNames: Record<string, string> = {
    'web-app': 'Web Application Project',
    'mobile-app': 'Mobile App Project',
    'web-mobile': 'Web + Mobile Project',
    'api-integration': 'API Integration Project',
    'custom': customType || 'Custom Solution Project'
  };

  return typeNames[projectType] || 'New Project';
}

/**
 * Map discovery project type to ProjectType enum
 */
function mapDiscoveryTypeToProjectType(discoveryType: string): ProjectType {
  const mapping: Record<string, ProjectType> = {
    'web-app': ProjectType.WEB_APP,
    'mobile-app': ProjectType.MOBILE_APP,
    'web-mobile': ProjectType.WEB_APP, // We'll add mobile later
    'api-integration': ProjectType.API,
    'custom': ProjectType.CUSTOM
  };

  return mapping[discoveryType] || ProjectType.CUSTOM;
}

/**
 * Map budget range to estimated number
 */
function mapBudgetRangeToNumber(budgetRange: string): number {
  const mapping: Record<string, number> = {
    'under-50k': 40000,
    '50k-100k': 75000,
    '100k-250k': 175000,
    '250k-500k': 375000,
    '500k-plus': 600000
  };

  return mapping[budgetRange] || 100000;
}
