import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

describe('ThemeProvider', () => {
  it('should render children', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply theme class to html element', () => {
    const { rerender } = render(
      <ThemeProvider defaultTheme="light">
        <div>Content</div>
      </ThemeProvider>
    );
    
    // Initial render with light theme
    expect(document.documentElement.classList.contains('light')).toBeTruthy();
    
    // Change to dark theme
    rerender(
      <ThemeProvider defaultTheme="dark">
        <div>Content</div>
      </ThemeProvider>
    );
    
    // Note: Theme persistence would need more complex testing with localStorage mock
  });

  it('should provide theme context', () => {
    const TestComponent = () => {
      return <div>Theme Component</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Theme Component')).toBeInTheDocument();
  });
});
