import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');
jest.mock('@/components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Settings Page', () => {
  const mockUpdateUserProfile = jest.fn();
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      platformUser: { displayName: 'Test User' },
      updateUserProfile: mockUpdateUserProfile,
    });
  });

  it('renders settings page with tabs', () => {
    render(<SettingsPage />);

    expect(screen.getByText(/settings/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /billing/i })).toBeInTheDocument();
  });

  it('shows profile tab by default', () => {
    render(<SettingsPage />);

    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/photo url/i)).toBeInTheDocument();
  });

  it('switches to security tab', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('button', { name: /security/i }));

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });

  it('switches to notifications tab', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    expect(screen.getByText(/email notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/push notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/marketing emails/i)).toBeInTheDocument();
  });

  it('switches to billing tab', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('button', { name: /billing/i }));

    expect(screen.getByText(/subscription/i)).toBeInTheDocument();
  });

  it('validates profile update', async () => {
    mockUpdateUserProfile.mockResolvedValueOnce({});

    render(<SettingsPage />);

    const displayNameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(displayNameInput, { target: { value: 'Updated Name' } });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(mockUpdateUserProfile).toHaveBeenCalledWith({
      displayName: 'Updated Name',
      photoURL: '',
    });
  });

  it('validates password match in security tab', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('button', { name: /security/i }));

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'currentpass' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'different123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('toggles notification preferences', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    const emailToggle = screen.getByRole('checkbox', { name: /email notifications/i });
    expect(emailToggle).toBeChecked();

    fireEvent.click(emailToggle);
    expect(emailToggle).not.toBeChecked();
  });
});
