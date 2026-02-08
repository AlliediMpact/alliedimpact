/**
 * Tests for MobileNav component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileNav from '../../src/components/layout/MobileNav';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Home: () => <svg data-testid="home-icon" />,
  BookOpen: () => <svg data-testid="book-icon" />,
  MessageSquare: () => <svg data-testid="message-icon" />,
  User: () => <svg data-testid="user-icon" />,
  GraduationCap: () => <svg data-testid="graduation-icon" />,
}));

// Mock utils
jest.mock('../../src/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

const { usePathname } = require('next/navigation');
const { useAuth } = require('../../src/contexts/AuthContext');

describe('MobileNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePathname.mockReturnValue('/en');
    useAuth.mockReturnValue({ user: null });
  });

  it('should render all navigation items', () => {
    render(<MobileNav />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Forum')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should render all navigation icons', () => {
    render(<MobileNav />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('book-icon')).toBeInTheDocument();
    expect(screen.getByTestId('graduation-icon')).toBeInTheDocument();
    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('should have correct href for each nav item', () => {
    render(<MobileNav />);
    
    const homeLink = screen.getByText('Home').closest('a');
    const coursesLink = screen.getByText('Courses').closest('a');
    const learnLink = screen.getByText('Learn').closest('a');
    const forumLink = screen.getByText('Forum').closest('a');
    const profileLink = screen.getByText('Profile').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/en');
    expect(coursesLink).toHaveAttribute('href', '/en/courses');
    expect(learnLink).toHaveAttribute('href', '/en/dashboard');
    expect(forumLink).toHaveAttribute('href', '/en/forum');
    expect(profileLink).toHaveAttribute('href', '/en/profile');
  });

  it('should highlight active route', () => {
    usePathname.mockReturnValue('/en/courses');
    
    render(<MobileNav />);
    
    const coursesLink = screen.getByText('Courses').closest('a');
    expect(coursesLink?.className).toContain('active');
  });

  it('should show auth-required items when user is logged in', () => {
    useAuth.mockReturnValue({ user: { uid: 'user123', email: 'test@example.com' } });
    
    render(<MobileNav />);
    
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should show all items when user is not logged in', () => {
    useAuth.mockReturnValue({ user: null });
    
    render(<MobileNav />);
    
    // All items should be visible (they'll redirect to login if needed)
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Forum')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should render as fixed bottom navigation', () => {
    const { container } = render(<MobileNav />);
    
    const nav = container.firstChild as HTMLElement;
    expect(nav?.className).toContain('fixed');
    expect(nav?.className).toContain('bottom-0');
  });

  it('should be hidden on desktop (md breakpoint)', () => {
    const { container } = render(<MobileNav />);
    
    const nav = container.firstChild as HTMLElement;
    expect(nav?.className).toContain('md:hidden');
  });

  it('should highlight home when on root path', () => {
    usePathname.mockReturnValue('/en');
    
    render(<MobileNav />);
    
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink?.className).toContain('active');
  });

  it('should highlight dashboard when on learn path', () => {
    usePathname.mockReturnValue('/en/dashboard');
    
    render(<MobileNav />);
    
    const learnLink = screen.getByText('Learn').closest('a');
    expect(learnLink?.className).toContain('active');
  });

  it('should have 5 navigation items', () => {
    render(<MobileNav />);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
  });

  it('should render nav items in correct order', () => {
    render(<MobileNav />);
    
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveTextContent('Home');
    expect(links[1]).toHaveTextContent('Courses');
    expect(links[2]).toHaveTextContent('Learn');
    expect(links[3]).toHaveTextContent('Forum');
    expect(links[4]).toHaveTextContent('Profile');
  });

  it('should pass correct active state based on pathname', () => {
    usePathname.mockReturnValue('/en/forum');
    
    render(<MobileNav />);
    
    const forumLink = screen.getByText('Forum').closest('a');
    expect(forumLink?.className).toContain('active');
  });

  it('should handle profile route highlighting', () => {
    usePathname.mockReturnValue('/en/profile');
    
    render(<MobileNav />);
    
    const profileLink = screen.getByText('Profile').closest('a');
    expect(profileLink?.className).toContain('active');
  });
});
