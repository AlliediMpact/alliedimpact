import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should handle text input', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<Input label="Name" onChange={handleChange} />);
    
    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'John');
    
    expect(input).toHaveValue('John');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('should display helper text', () => {
    render(<Input label="Password" helper="Min 8 characters" />);
    expect(screen.getByText(/min 8 characters/i)).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input label="Email" disabled />);
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
  });

  it('should be required when required prop is true', () => {
    render(<Input label="Email" required />);
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });

  it('should support different input types', () => {
    const { rerender } = render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    
    rerender(<Input label="Password" type="password" />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  it('should support placeholder', () => {
    render(<Input label="Email" placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  it('should apply error styling when error exists', () => {
    render(<Input label="Email" error="Invalid" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('border-red-500');
  });

  it('should render with icon', () => {
    const Icon = () => <svg data-testid="icon" />;
    render(<Input label="Search" icon={<Icon />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
