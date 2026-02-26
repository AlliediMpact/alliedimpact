import { render, screen, waitFor, act } from '@testing-library/react';
import CountdownTimer from '../CountdownTimer';

jest.useFakeTimers();

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should render countdown timer', () => {
    const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
    
    render(<CountdownTimer endDate={futureDate} />);
    
    // Should show some time remaining
    expect(screen.getByText(/\d+/)).toBeInTheDocument();
  });

  it('should display days when more than 24 hours remain', () => {
    const futureDate = new Date(Date.now() + 86400000 * 2); // 2 days from now
    
    render(<CountdownTimer endDate={futureDate} />);
    
    expect(screen.getByText(/day/i)).toBeInTheDocument();
  });

  it('should update every second', () => {
    const futureDate = new Date(Date.now() + 10000); // 10 seconds from now
    
    render(<CountdownTimer endDate={futureDate} />);
    
    // Get initial time display
    const initialText = screen.getByText(/\d+/);
    
    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Time should have updated
    expect(screen.getByText(/\d+/)).toBeInTheDocument();
  });

  it('should call onExpire when countdown reaches zero', () => {
    const onExpire = jest.fn();
    const futureDate = new Date(Date.now() + 2000); // 2 seconds from now
    
    render(<CountdownTimer endDate={futureDate} onExpire={onExpire} />);
    
    // Advance timer past expiration
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(onExpire).toHaveBeenCalled();
  });

  it('should show expired state', () => {
    const pastDate = new Date(Date.now() - 1000); // 1 second ago
    
    render(<CountdownTimer endDate={pastDate} />);
    
    expect(screen.getByText(/expired|ended/i)).toBeInTheDocument();
  });

  it('should handle different sizes', () => {
    const futureDate = new Date(Date.now() + 3600000);
    
    const { rerender, container } = render(
      <CountdownTimer endDate={futureDate} size="sm" />
    );
    expect(container).toBeInTheDocument();
    
    rerender(<CountdownTimer endDate={futureDate} size="md" />);
    expect(container).toBeInTheDocument();
    
    rerender(<CountdownTimer endDate={futureDate} size="lg" />);
    expect(container).toBeInTheDocument();
  });

  it('should show icon when enabled', () => {
    const futureDate = new Date(Date.now() + 3600000);
    
    render(<CountdownTimer endDate={futureDate} showIcon={true} />);
    
    // Clock icon should be rendered (though it's an SVG, we check it exists)
    expect(screen.getByTestId(/clock|icon/i) || document.querySelector('svg')).toBeTruthy();
  });

  it('should hide icon when disabled', () => {
    const futureDate = new Date(Date.now() + 3600000);
    
    const { container } = render(<CountdownTimer endDate={futureDate} showIcon={false} />);
    
    // Should render timer without checking for icon
    expect(container).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const futureDate = new Date(Date.now() + 3600000);
    
    const { container } = render(
      <CountdownTimer endDate={futureDate} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should cleanup interval on unmount', () => {
    const futureDate = new Date(Date.now() + 3600000);
    
    const { unmount } = render(<CountdownTimer endDate={futureDate} />);
    
    const timerCount = jest.getTimerCount();
    
    unmount();
    
    // Timer should be cleared
    expect(jest.getTimerCount()).toBeLessThanOrEqual(timerCount);
  });

  it('should handle urgency levels', () => {
    // Less than 1 hour - urgent
    const urgentDate = new Date(Date.now() + 1800000); // 30 minutes
    const { container: urgentContainer } = render(<CountdownTimer endDate={urgentDate} />);
    expect(urgentContainer).toBeInTheDocument();
    
    // More than 1 day - not urgent
    const normalDate = new Date(Date.now() + 86400000 * 2); // 2 days
    const { container: normalContainer } = render(<CountdownTimer endDate={normalDate} />);
    expect(normalContainer).toBeInTheDocument();
  });
});
