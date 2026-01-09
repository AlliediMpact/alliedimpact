import { render } from '@testing-library/react';
import { Logo } from '../../components/Logo';

describe('Logo', () => {
  it('should render without crashing', () => {
    const { container } = render(<Logo />);
    expect(container).toBeTruthy();
  });

  it('should render with default size', () => {
    const { container } = render(<Logo />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    const { container } = render(<Logo size="lg" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with small size', () => {
    const { container } = render(<Logo size="sm" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<Logo className="custom-class" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
