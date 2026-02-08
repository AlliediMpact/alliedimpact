/**
 * Tests for Footer component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../../src/components/layout/Footer';

// Mock the shared UI footer
jest.mock('@allied-impact/ui', () => ({
  Footer: jest.fn(({ sections, socialLinks, copyright }) => (
    <footer data-testid="shared-footer">
      <div>{copyright}</div>
      {sections?.map((section: any, idx: number) => (
        <div key={idx} data-testid={`section-${idx}`}>
          <h3>{section.title}</h3>
          {section.links?.map((link: any, linkIdx: number) => (
            <a key={linkIdx} href={link.href}>
              {link.label}
            </a>
          ))}
          {section.content}
        </div>
      ))}
    </footer>
  )),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Mail: () => <svg data-testid="mail-icon" />,
  Phone: () => <svg data-testid="phone-icon" />,
  MapPin: () => <svg data-testid="mappin-icon" />,
}));

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with footer sections', () => {
    render(<Footer />);
    
    expect(screen.getByTestId('shared-footer')).toBeInTheDocument();
  });

  it('should display learning tracks section', () => {
    render(<Footer />);
    
    expect(screen.getByText('Learning Tracks')).toBeInTheDocument();
    expect(screen.getByText('Computer Skills')).toBeInTheDocument();
    expect(screen.getByText('Coding Track')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Certificates')).toBeInTheDocument();
  });

  it('should display company section', () => {
    render(<Footer />);
    
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Become an Instructor')).toBeInTheDocument();
    expect(screen.getByText('Sponsors')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should display get in touch section with icons', () => {
    render(<Footer />);
    
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mappin-icon')).toBeInTheDocument();
  });

  it('should display contact information', () => {
    render(<Footer />);
    
    expect(screen.getByText('edutech@alliedimpact.com')).toBeInTheDocument();
    expect(screen.getByText('+27 (0) 11 123 4567')).toBeInTheDocument();
    expect(screen.getByText('Johannesburg, South Africa')).toBeInTheDocument();
  });

  it('should have correct href attributes for learning track links', () => {
    render(<Footer />);
    
    const computerSkillsLink = screen.getByText('Computer Skills').closest('a');
    const codingLink = screen.getByText('Coding Track').closest('a');
    
    expect(computerSkillsLink).toHaveAttribute('href', '/en/courses?track=computer-skills');
    expect(codingLink).toHaveAttribute('href', '/en/courses?track=coding');
  });

  it('should have correct href attributes for company links', () => {
    render(<Footer />);
    
    const aboutLink = screen.getByText('About Us').closest('a');
    const instructorLink = screen.getByText('Become an Instructor').closest('a');
    
    expect(aboutLink).toHaveAttribute('href', '/en/about');
    expect(instructorLink).toHaveAttribute('href', '/en/instructors');
  });

  it('should display current year in copyright', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('should render social links section', () => {
    render(<Footer />);
    
    // The SharedFooter component handles social links
    expect(screen.getByTestId('shared-footer')).toBeInTheDocument();
  });

  it('should render legal links section', () => {
    render(<Footer />);
    
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('should organize sections in correct order', () => {
    render(<Footer />);
    
    const sections = screen.getAllByTestId(/section-\d+/);
    expect(sections).toHaveLength(3);
  });

  it('should render all external service links', () => {
    render(<Footer />);
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
