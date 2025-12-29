import fetch from 'cross-fetch';

export interface CoinBoxConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  term: number;
  type: string;
  status: string;
  createdAt: string;
}

export interface Investment {
  id: string;
  amount: number;
  type: string;
  asset: string;
  expectedReturn: number;
  duration: number;
  status: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

export interface CryptoOrder {
  id: string;
  crypto: string;
  orderType: 'buy' | 'sell';
  amount: number;
  price?: number;
  status: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export class CoinBoxSDK {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: CoinBoxConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://coinbox.example.com/api/v1';
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new CoinBoxError(
          result.error || 'Request failed',
          response.status,
          result
        );
      }

      return result.data;
    } catch (error) {
      if (error instanceof CoinBoxError) {
        throw error;
      }
      throw new CoinBoxError('Network error', 0, error);
    }
  }

  // ========== Loans ==========

  /**
   * List all loans
   */
  async listLoans(options?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);

    const query = params.toString();
    return this.request('GET', `/loans${query ? `?${query}` : ''}`);
  }

  /**
   * Get a specific loan by ID
   */
  async getLoan(loanId: string): Promise<{ loan: Loan }> {
    return this.request('GET', `/loans/${loanId}`);
  }

  /**
   * Create a new loan
   */
  async createLoan(loan: {
    amount: number;
    interestRate: number;
    term: number;
    type: string;
    purpose?: string;
    collateral?: any;
  }): Promise<{ loan: Loan; message: string }> {
    return this.request('POST', '/loans', loan);
  }

  // ========== Investments ==========

  /**
   * List all investments
   */
  async listInvestments(options?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<Investment>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);

    const query = params.toString();
    return this.request('GET', `/investments${query ? `?${query}` : ''}`);
  }

  /**
   * Create a new investment
   */
  async createInvestment(investment: {
    amount: number;
    type: string;
    asset: string;
    expectedReturn?: number;
    duration?: number;
  }): Promise<{ investment: Investment; message: string }> {
    return this.request('POST', '/investments', investment);
  }

  // ========== Transactions ==========

  /**
   * List all transactions
   */
  async listTransactions(options?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.type) params.append('type', options.type);
    if (options?.status) params.append('status', options.status);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const query = params.toString();
    return this.request('GET', `/transactions${query ? `?${query}` : ''}`);
  }

  // ========== Crypto Orders ==========

  /**
   * List all crypto orders
   */
  async listCryptoOrders(options?: {
    page?: number;
    limit?: number;
    orderType?: 'buy' | 'sell';
    status?: string;
    crypto?: string;
  }): Promise<PaginatedResponse<CryptoOrder>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.orderType) params.append('orderType', options.orderType);
    if (options?.status) params.append('status', options.status);
    if (options?.crypto) params.append('crypto', options.crypto);

    const query = params.toString();
    return this.request('GET', `/crypto/orders${query ? `?${query}` : ''}`);
  }

  /**
   * Create a new crypto order
   */
  async createCryptoOrder(order: {
    crypto: string;
    orderType: 'buy' | 'sell';
    amount: number;
    price?: number;
  }): Promise<{ order: CryptoOrder; message: string }> {
    return this.request('POST', '/crypto/orders', order);
  }
}

/**
 * Custom error class for Coin Box API errors
 */
export class CoinBoxError extends Error {
  public statusCode: number;
  public details: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'CoinBoxError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Export a factory function for convenience
export function createCoinBoxClient(config: CoinBoxConfig): CoinBoxSDK {
  return new CoinBoxSDK(config);
}

// Default export
export default CoinBoxSDK;
