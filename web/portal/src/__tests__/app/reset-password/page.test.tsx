import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ResetPasswordPage from '@/app/reset-password/page';
import { useAuth } from '@/hooks/useAuth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth');

describe('Reset Password Page', () => {
  const mockPush = jest.fn();
  const mockResetPassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
      user: null,
      loading: false,
    });
  });

  it('renders reset password form', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'invalid-email' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('handles successful password reset', async () => {
    mockResetPassword.mockResolvedValueOnce({});

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
    });
  });

  it('handles reset error for non-existent user', async () => {
    mockResetPassword.mockRejectedValueOnce({ code: 'auth/user-not-found' });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'notfound@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/no account found/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during reset', async () => {
    mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('has link back to login', () => {
    render(<ResetPasswordPage />);
    
    const loginLink = screen.getByRole('link', { name: /back to sign in/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
