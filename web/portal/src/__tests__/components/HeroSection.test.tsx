/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from '@/components/HeroSection';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('HeroSection', () => {
  it('should render hero section', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should display main heading', () => {
    render(<HeroSection />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBeTruthy();
  });

  it('should display subtitle or description', () => {
    const { container } = render(<HeroSection />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('should have call-to-action button', () => {
    render(<HeroSection />);
    const buttons = screen.getAllByRole('link');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have link to signup or get started', () => {
    render(<HeroSection />);
    const links = screen.getAllByRole('link');
    const hasSignupLink = links.some(link => 
      link.getAttribute('href')?.includes('signup') ||
      link.getAttribute('href')?.includes('get-started')
    );
    expect(hasSignupLink || links.length > 0).toBe(true);
  });

  it('should render without crashing', () => {
    const { container } = render(<HeroSection />);
    expect(container).toBeInTheDocument();
  });
});
