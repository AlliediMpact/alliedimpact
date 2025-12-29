"""
Coin Box Python SDK

Official Python SDK for the Coin Box API.
"""

from typing import Dict, List, Optional, Any
import requests


class CoinBoxError(Exception):
    """Custom exception for Coin Box API errors"""
    
    def __init__(self, message: str, status_code: int = 0, details: Any = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class CoinBoxSDK:
    """
    Coin Box SDK Client
    
    Args:
        api_key: Your Coin Box API key
        base_url: Base URL for the API (optional)
    """
    
    def __init__(self, api_key: str, base_url: str = "https://coinbox.example.com/api/v1"):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        })
    
    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict:
        """Make an API request"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=30
            )
            
            result = response.json()
            
            if not response.ok:
                raise CoinBoxError(
                    result.get('error', 'Request failed'),
                    response.status_code,
                    result
                )
            
            return result.get('data', result)
            
        except requests.exceptions.RequestException as e:
            raise CoinBoxError(f'Network error: {str(e)}', 0, e)
    
    # ========== Loans ==========
    
    def list_loans(
        self,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        loan_type: Optional[str] = None
    ) -> Dict:
        """
        List all loans
        
        Args:
            page: Page number
            limit: Number of results per page
            status: Filter by status
            loan_type: Filter by loan type
            
        Returns:
            Paginated list of loans
        """
        params = {'page': page, 'limit': limit}
        if status:
            params['status'] = status
        if loan_type:
            params['type'] = loan_type
        
        return self._request('GET', '/loans', params=params)
    
    def get_loan(self, loan_id: str) -> Dict:
        """
        Get a specific loan by ID
        
        Args:
            loan_id: The loan ID
            
        Returns:
            Loan details
        """
        return self._request('GET', f'/loans/{loan_id}')
    
    def create_loan(
        self,
        amount: float,
        interest_rate: float,
        term: int,
        loan_type: str,
        purpose: Optional[str] = None,
        collateral: Optional[Any] = None
    ) -> Dict:
        """
        Create a new loan
        
        Args:
            amount: Loan amount
            interest_rate: Interest rate percentage
            term: Loan term in months
            loan_type: Type of loan (personal, business, etc.)
            purpose: Purpose of the loan (optional)
            collateral: Collateral information (optional)
            
        Returns:
            Created loan details
        """
        data = {
            'amount': amount,
            'interestRate': interest_rate,
            'term': term,
            'type': loan_type,
        }
        if purpose:
            data['purpose'] = purpose
        if collateral:
            data['collateral'] = collateral
        
        return self._request('POST', '/loans', data=data)
    
    # ========== Investments ==========
    
    def list_investments(
        self,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        investment_type: Optional[str] = None
    ) -> Dict:
        """
        List all investments
        
        Args:
            page: Page number
            limit: Number of results per page
            status: Filter by status
            investment_type: Filter by investment type
            
        Returns:
            Paginated list of investments
        """
        params = {'page': page, 'limit': limit}
        if status:
            params['status'] = status
        if investment_type:
            params['type'] = investment_type
        
        return self._request('GET', '/investments', params=params)
    
    def create_investment(
        self,
        amount: float,
        investment_type: str,
        asset: str,
        expected_return: Optional[float] = None,
        duration: Optional[int] = None
    ) -> Dict:
        """
        Create a new investment
        
        Args:
            amount: Investment amount
            investment_type: Type of investment (stocks, bonds, etc.)
            asset: Asset identifier
            expected_return: Expected return percentage (optional)
            duration: Investment duration in months (optional)
            
        Returns:
            Created investment details
        """
        data = {
            'amount': amount,
            'type': investment_type,
            'asset': asset,
        }
        if expected_return is not None:
            data['expectedReturn'] = expected_return
        if duration is not None:
            data['duration'] = duration
        
        return self._request('POST', '/investments', data=data)
    
    # ========== Transactions ==========
    
    def list_transactions(
        self,
        page: int = 1,
        limit: int = 50,
        transaction_type: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict:
        """
        List all transactions
        
        Args:
            page: Page number
            limit: Number of results per page
            transaction_type: Filter by transaction type
            status: Filter by status
            start_date: Filter by start date (ISO format)
            end_date: Filter by end date (ISO format)
            
        Returns:
            Paginated list of transactions
        """
        params = {'page': page, 'limit': limit}
        if transaction_type:
            params['type'] = transaction_type
        if status:
            params['status'] = status
        if start_date:
            params['startDate'] = start_date
        if end_date:
            params['endDate'] = end_date
        
        return self._request('GET', '/transactions', params=params)
    
    # ========== Crypto Orders ==========
    
    def list_crypto_orders(
        self,
        page: int = 1,
        limit: int = 50,
        order_type: Optional[str] = None,
        status: Optional[str] = None,
        crypto: Optional[str] = None
    ) -> Dict:
        """
        List all crypto orders
        
        Args:
            page: Page number
            limit: Number of results per page
            order_type: Filter by order type (buy/sell)
            status: Filter by status
            crypto: Filter by cryptocurrency
            
        Returns:
            Paginated list of crypto orders
        """
        params = {'page': page, 'limit': limit}
        if order_type:
            params['orderType'] = order_type
        if status:
            params['status'] = status
        if crypto:
            params['crypto'] = crypto
        
        return self._request('GET', '/crypto/orders', params=params)
    
    def create_crypto_order(
        self,
        crypto: str,
        order_type: str,
        amount: float,
        price: Optional[float] = None
    ) -> Dict:
        """
        Create a new crypto order
        
        Args:
            crypto: Cryptocurrency symbol (e.g., BTC, ETH)
            order_type: Order type (buy or sell)
            amount: Amount to trade
            price: Price for limit orders (optional)
            
        Returns:
            Created order details
        """
        data = {
            'crypto': crypto,
            'orderType': order_type,
            'amount': amount,
        }
        if price is not None:
            data['price'] = price
        
        return self._request('POST', '/crypto/orders', data=data)
    
    def close(self):
        """Close the HTTP session"""
        self.session.close()
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()


# Convenience function
def create_client(api_key: str, base_url: str = "https://coinbox.example.com/api/v1") -> CoinBoxSDK:
    """
    Create a Coin Box SDK client
    
    Args:
        api_key: Your Coin Box API key
        base_url: Base URL for the API (optional)
        
    Returns:
        CoinBoxSDK instance
    """
    return CoinBoxSDK(api_key, base_url)
