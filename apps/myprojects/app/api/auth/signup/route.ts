import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Implement with Firebase Auth + Firestore
    // For now, return mock response

    // 1. Create user account with Firebase Auth
    // const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    // const userId = userCredential.user.uid;

    // 2. Create user profile in Firestore
    // await setDoc(doc(db, 'users', userId), {
    //   email: data.email,
    //   name: data.name,
    //   organizationName: data.organizationName,
    //   phone: data.phone,
    //   createdAt: serverTimestamp(),
    //   archetypes: ['individual']
    // });

    // 3. Auto-create first project from discovery data
    let projectId = null;
    if (data.discoveryData) {
      // const projectRef = doc(collection(db, 'projects'));
      // projectId = projectRef.id;
      
      // await setDoc(projectRef, {
      //   userId,
      //   name: getProjectName(data.discoveryData.projectType, data.discoveryData.customProjectType),
      //   type: data.discoveryData.projectType,
      //   customType: data.discoveryData.customProjectType,
      //   budgetRange: data.discoveryData.budgetRange,
      //   timeline: data.discoveryData.timeline,
      //   description: data.discoveryData.description,
      //   status: 'discovery',
      //   health: 'on_track',
      //   progress: 0,
      //   milestones: [],
      //   deliverables: [],
      //   createdAt: serverTimestamp(),
      //   updatedAt: serverTimestamp()
      // });

      projectId = 'mock-project-id';
    }

    // Mock response for now
    return NextResponse.json({
      userId: 'mock-user-id',
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
