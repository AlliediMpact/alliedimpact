import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';

describe('Footer Component', () => {
  it('renders footer with branding', () => {
    render(<Footer />);

    expect(screen.getByText(/allied impact/i)).toBeInTheDocument();
    expect(screen.getByText(/one identity. multiple products/i)).toBeInTheDocument();
  });

  it('renders all product links', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: /coin box/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /drive master/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /codetech/i })).toBeInTheDocument();
  });

  it('renders company links', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: /about us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cookie policy/i })).toBeInTheDocument();
  });

  it('displays copyright notice with current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);

    // Look for social media section
    const socialSection = screen.getByText(/follow us/i);
    expect(socialSection).toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: /terms of service/i }))
      .toHaveAttribute('href', '/legal/terms');
    expect(screen.getByRole('link', { name: /privacy policy/i }))
      .toHaveAttribute('href', '/legal/privacy');
    expect(screen.getByRole('link', { name: /cookie policy/i }))
      .toHaveAttribute('href', '/legal/cookies');
  });
});
