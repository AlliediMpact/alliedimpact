import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge Component', () => {
  it('should render with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText(/new/i)).toBeInTheDocument();
  });

  it('should apply variant styles', () => {
    const { rerender, container } = render(<Badge variant="default">Default</Badge>);
    expect(container.firstChild).toHaveClass('bg-blue-600');
    
    rerender(<Badge variant="success">Success</Badge>);
    expect(container.firstChild).toHaveClass('bg-green-500');
    
    rerender(<Badge variant="warning">Warning</Badge>);
    expect(container.firstChild).toHaveClass('bg-yellow-500');
    
    rerender(<Badge variant="destructive">Error</Badge>);
    expect(container.firstChild).toHaveClass('bg-red-600');
    
    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(container.firstChild).toHaveClass('bg-gray-100');
  });

  it('should support custom className', () => {
    const { container } = render(<Badge className="custom">Badge</Badge>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should apply default variant by default', () => {
    const { container } = render(<Badge>Badge</Badge>);
    expect(container.firstChild).toHaveClass('bg-blue-600');
  });

  it('should support outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    expect(container.firstChild).toHaveClass('border');
  });
});
