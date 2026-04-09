/**
 * Investment Service - Stub Implementation
 */

export interface InvestmentData {
  userId: string;
  amount: number;
  ticker?: string;
}

export async function createInvestment(userId: string, data: InvestmentData) {
  return {
    success: true,
    data: {
      id: `invest_${Date.now()}`,
      ...data,
    }
  };
}

export async function validateInvestment(data: InvestmentData) {
  return { valid: true };
}
