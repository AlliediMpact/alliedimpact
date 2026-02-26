import { render, screen, waitFor } from '@testing-library/react';
import LiveVoteCounter from '../LiveVoteCounter';
import { onSnapshot } from 'firebase/firestore';

jest.mock('firebase/firestore');
jest.mock('@/config/firebase', () => ({
  db: {},
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LiveVoteCounter', () => {
  const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
  
  const defaultProps = {
    tournamentId: 'tournament123',
    teamId: 'team456',
    teamName: 'Team A',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render team name', () => {
    mockOnSnapshot.mockReturnValue(jest.fn());
    
    render(<LiveVoteCounter {...defaultProps} />);
    
    expect(screen.getByText('Team A')).toBeInTheDocument();
  });

  it('should subscribe to vote updates', () => {
    const mockUnsubscribe = jest.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);
    
    render(<LiveVoteCounter {...defaultProps} />);
    
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should display vote count', async () => {
    mockOnSnapshot.mockImplementation((docRef, callback) => {
      // Simulate Firestore snapshot
      callback({
        exists: () => true,
        data: () => ({ voteCount: 42 }),
      } as any);
      return jest.fn();
    });
    
    render(<LiveVoteCounter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/42/)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    mockOnSnapshot.mockReturnValue(jest.fn());
    
    render(<LiveVoteCounter {...defaultProps} />);
    
    // Loading indicator should be present or vote count should be 0
    const voteDisplay = screen.getByText(/0|loading/i);
    expect(voteDisplay).toBeInTheDocument();
  });

  it('should handle missing document', async () => {
    mockOnSnapshot.mockImplementation((docRef, callback) => {
      callback({
        exists: () => false,
        data: () => null,
      } as any);
      return jest.fn();
    });
    
    render(<LiveVoteCounter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);
    
    const { unmount } = render(<LiveVoteCounter {...defaultProps} />);
    
    unmount();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should not show trend when disabled', () => {
    mockOnSnapshot.mockReturnValue(jest.fn());
    
    render(<LiveVoteCounter {...defaultProps} showTrend={false} />);
    
    // Trend indicator should not be visible
    expect(screen.queryByTestId('trend-indicator')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockOnSnapshot.mockReturnValue(jest.fn());
    
    const { container } = render(
      <LiveVoteCounter {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
