import { NextRequest, NextResponse } from 'next/server';
import { bankVerificationService } from '@/lib/bank-verification-service';
import { verifyAuthentication } from '@/lib/auth-helpers';

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

    const { accountNumber, bankCode } = await request.json();
    // Use authenticated user's ID
    const userId = user.uid;

    // Validate required fields
    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: 'Missing required fields: accountNumber, bankCode' },
        { status: 400 }
      );
    }

    // Validate account number format
    if (!bankVerificationService.validateAccountNumber(accountNumber)) {
      return NextResponse.json(
        { error: 'Invalid account number format. Must be 9-11 digits.' },
        { status: 400 }
      );
    }

    // Verify the bank account
    const result = await bankVerificationService.verifyBankAccount(
      userId,
      accountNumber,
      bankCode
    );

    if (result.verified) {
      return NextResponse.json({
        success: true,
        verified: true,
        accountName: result.accountName,
        message: result.message,
      });
    }

    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: result.message,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Bank verification API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during bank verification' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's bank account
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

    const bankAccount = await bankVerificationService.getBankAccount(userId);

    if (bankAccount) {
      return NextResponse.json({
        success: true,
        bankAccount: {
          accountNumber: bankAccount.accountNumber,
          bankName: bankAccount.bankName,
          accountName: bankAccount.accountName,
          verified: bankAccount.verified,
          verifiedAt: bankAccount.verifiedAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      bankAccount: null,
    });
  } catch (error: any) {
    console.error('Get bank account API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching bank account' },
      { status: 500 }
    );
  }
}
