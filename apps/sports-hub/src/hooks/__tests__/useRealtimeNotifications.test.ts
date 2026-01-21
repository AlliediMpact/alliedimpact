import { renderHook } from '@testing-library/react';
import { useRealtimeNotifications } from '../useRealtimeNotifications';
import { onSnapshot } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/config/firebase', () => ({
  db: {},
}));

describe('useRealtimeNotifications', () => {
  const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to notifications', () => {
    const userId = 'user123';
    const mockUnsubscribe = jest.fn();
    
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);
    
    const { result } = renderHook(() => useRealtimeNotifications(userId));
    
    // onSnapshot should be called
    expect(mockOnSnapshot).toHaveBeenCalled();
    
    // Should return notifications state
    expect(result.current.notifications).toBeDefined();
    expect(Array.isArray(result.current.notifications)).toBe(true);
  });

  it('should not subscribe without userId', () => {
    const { result } = renderHook(() => useRealtimeNotifications(''));
    
    expect(mockOnSnapshot).not.toHaveBeenCalled();
    expect(result.current.notifications).toEqual([]);
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);
    
    const { unmount } = renderHook(() => useRealtimeNotifications('user123'));
    
    unmount();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    mockOnSnapshot.mockReturnValue(jest.fn());
    
    const { result } = renderHook(() => useRealtimeNotifications('user123'));
    
    expect(result.current.loading).toBeDefined();
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should handle error state', () => {
    const mockError = new Error('Firebase error');
    mockOnSnapshot.mockImplementation(() => {
      throw mockError;
    });
    
    const { result } = renderHook(() => useRealtimeNotifications('user123'));
    
    expect(result.current.error).toBeDefined();
  });
});
