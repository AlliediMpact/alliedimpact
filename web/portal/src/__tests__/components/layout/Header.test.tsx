import { render, screen } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

jest.mock('@/hooks/useAuth');
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('renders header with logo and navigation', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Header />);

    expect(screen.getByText(/allied impact/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
  });

  it('shows login and signup buttons when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Header />);

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com', displayName: 'Test User' },
      platformUser: { displayName: 'Test User' },
      loading: false,
    });

    render(<Header />);

    expect(screen.getByText(/test user/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
  });

  it('highlights active navigation link', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });
    (usePathname as jest.Mock).mockReturnValue('/about');

    render(<Header />);

    const aboutLink = screen.getByRole('link', { name: /about/i });
    expect(aboutLink).toHaveClass('text-primary');
  });

  it('shows dashboard link for authenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      platformUser: {},
      loading: false,
    });

    render(<Header />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });
});
