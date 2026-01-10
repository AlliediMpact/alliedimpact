import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Component', () => {
  it('should render children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });

  it('should apply base styling classes', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('rounded-lg');
    expect(container.firstChild).toHaveClass('border');
    expect(container.firstChild).toHaveClass('shadow-md');
  });

  it('should support custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('rounded-lg'); // Still has base classes
  });

  it('should render CardHeader with children', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText(/header content/i)).toBeInTheDocument();
  });

  it('should render CardTitle with children', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText(/title/i)).toBeInTheDocument();
  });

  it('should render CardDescription with children', () => {
    render(<CardDescription>Description</CardDescription>);
    expect(screen.getByText(/description/i)).toBeInTheDocument();
  });

  it('should render CardContent with children', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it('should render CardFooter with children', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText(/footer/i)).toBeInTheDocument();
  });

  it('should compose Card components together', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText(/test title/i)).toBeInTheDocument();
    expect(screen.getByText(/test description/i)).toBeInTheDocument();
    expect(screen.getByText(/test content/i)).toBeInTheDocument();
    expect(screen.getByText(/test footer/i)).toBeInTheDocument();
  });
});
