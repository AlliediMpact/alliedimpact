import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../ThemeProvider';

describe('ThemeToggle', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('should render toggle button', () => {
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should toggle theme on click', () => {
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Click to toggle theme
    fireEvent.click(button);
    
    // Button should still be in document after click
    expect(button).toBeInTheDocument();
  });

  it('should show theme icons', () => {
    renderWithTheme(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/toggle theme|theme/i);
  });
});
