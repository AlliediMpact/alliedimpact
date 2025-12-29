import { NextRequest, NextResponse } from 'next/server';
import { loanRepaymentService } from '@/lib/loan-repayment-service';
import { verifyAuthentication } from '@/lib/auth-helpers';

// Process manual loan repayment
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthentication(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const { loanId } = await request.json();
    // Use authenticated user's ID instead of trusting client input
    const userId = user.uid;

    if (!loanId) {
      return NextResponse.json(
        { error: 'Missing required field: loanId' },
        { status: 400 }
      );
    }

    // Process the repayment
    const success = await loanRepaymentService.processRepayment(loanId, userId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Loan repayment processed successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Repayment processing failed' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Loan repayment API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during repayment',
      },
      { status: 500 }
    );
  }
}

// Get user's active loans
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthentication(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Use authenticated user's ID
    const userId = user.uid;

    const loans = await loanRepaymentService.getUserLoans(userId);

    return NextResponse.json({
      success: true,
      loans,
    });
  } catch (error: any) {
    console.error('Get loans API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching loans' },
      { status: 500 }
    );
  }
}
