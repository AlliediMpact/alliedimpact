import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '@/app/contact/page';
import { getDbInstance } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

jest.mock('@/lib/firebase');
jest.mock('firebase/firestore');

describe('Contact Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDbInstance as jest.Mock).mockReturnValue({});
    (collection as jest.Mock).mockReturnValue({});
    (addDoc as jest.Mock).mockResolvedValue({ id: 'test-id' });
  });

  it('renders contact form with all fields', () => {
    render(<ContactPage />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ContactPage />);

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Test message' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Test message content' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });

  it('handles submission error', async () => {
    (addDoc as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Test message' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    });
  });

  it('clears form after successful submission', async () => {
    render(<ContactPage />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
    const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Test' } });
    fireEvent.change(messageInput, { target: { value: 'Message' } });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(subjectInput.value).toBe('');
      expect(messageInput.value).toBe('');
    });
  });
});
