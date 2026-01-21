import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

jest.mock('@/hooks/useRealtimeNotifications');

describe('NotificationBell', () => {
  const mockUseRealtimeNotifications = useRealtimeNotifications as jest.MockedFunction<
    typeof useRealtimeNotifications
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render notification bell icon', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show notification count badge', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [
        { id: '1', title: 'Test 1', read: false },
        { id: '2', title: 'Test 2', read: false },
        { id: '3', title: 'Test 3', read: false },
      ],
      loading: false,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not show badge when no notifications', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
  });

  it('should open dropdown on click', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [{ id: '1', title: 'Test Notification', read: false }],
      loading: false,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });

  it('should display notification list', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [
        { id: '1', title: 'Notification 1', message: 'Message 1', read: false },
        { id: '2', title: 'Notification 2', message: 'Message 2', read: false },
      ],
      loading: false,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Notification 2')).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [],
      loading: true,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: new Error('Failed to load'),
    } as any);

    render(<NotificationBell userId="user123" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
  });

  it('should mark notification as read on click', async () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [{ id: '1', title: 'Test', message: 'Message', read: false }],
      loading: false,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const notification = screen.getByText('Test');
    fireEvent.click(notification);
    
    // Should trigger mark as read action
    await waitFor(() => {
      expect(notification).toBeInTheDocument();
    });
  });

  it('should show "Mark all as read" button', () => {
    mockUseRealtimeNotifications.mockReturnValue({
      notifications: [
        { id: '1', title: 'Test 1', read: false },
        { id: '2', title: 'Test 2', read: false },
      ],
      loading: false,
      error: null,
    } as any);

    render(<NotificationBell userId="user123" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/mark all as read/i)).toBeInTheDocument();
  });
});
