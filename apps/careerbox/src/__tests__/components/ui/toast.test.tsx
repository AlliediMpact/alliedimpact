import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast, useToastHelpers } from '@/components/ui/toast';
import { act } from 'react-dom/test-utils';

// Test component that uses toast
const TestComponent = () => {
  const { showToast, hideToast } = useToast();
  const { success, error, warning, info } = useToastHelpers();

  return (
    <div>
      <button onClick={() => showToast({ type: 'success', title: 'Test message' })}>Show Toast</button>
      <button onClick={() => success('Success!')}>Success</button>
      <button onClick={() => error('Error!')}>Error</button>
      <button onClick={() => warning('Warning!')}>Warning</button>
      <button onClick={() => info('Info!')}>Info</button>
      <button onClick={() => hideToast('test-id')}>Hide Toast</button>
    </div>
  );
};

describe('Toast Component', () => {
  it('should show toast message', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: /show toast/i }));
    expect(screen.getByText(/test message/i)).toBeInTheDocument();
  });

  it('should show success toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: /success/i }));
    expect(screen.getByText(/success!/i)).toBeInTheDocument();
  });

  it('should show error toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: /error/i }));
    expect(screen.getByText(/error!/i)).toBeInTheDocument();
  });

  it('should show warning toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: /warning/i }));
    expect(screen.getByText(/warning!/i)).toBeInTheDocument();
  });

  it('should show info toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: /info/i }));
    expect(screen.getByText(/info!/i)).toBeInTheDocument();
  });

  it('should close toast when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: /show toast/i }));
    expect(screen.getByText(/test message/i)).toBeInTheDocument();

    const closeButton = screen.getByLabelText(/close notification/i);
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/test message/i)).not.toBeInTheDocument();
    });
  });

  it('should auto-dismiss toast after duration', async () => {
    jest.useFakeTimers();
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByRole('button', { name: /show toast/i });
    act(() => {
      button.click();
    });

    expect(screen.getByText(/test message/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText(/test message/i)).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should show multiple toasts', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: /success/i }));
    await user.click(screen.getByRole('button', { name: /error/i }));
    
    expect(screen.getByText(/success!/i)).toBeInTheDocument();
    expect(screen.getByText(/error!/i)).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: /error/i }));
    
    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });
});
