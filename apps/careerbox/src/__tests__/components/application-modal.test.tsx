import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationModal } from '@/components/application/application-modal';

describe('ApplicationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmitSuccess = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    jobTitle: 'Senior Software Engineer',
    companyName: 'Tech Corp',
    listingId: 'listing-123',
    onSubmitSuccess: mockOnSubmitSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal with job details', () => {
    render(<ApplicationModal {...defaultProps} />);

    expect(screen.getByText('Apply for Position')).toBeInTheDocument();
    expect(screen.getByText(/Senior Software Engineer at Tech Corp/)).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    render(<ApplicationModal {...defaultProps} />);

    const submitButton = screen.getByText('Submit Application');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Cover letter is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Please upload your resume/i)).toBeInTheDocument();
    });
  });

  it('should validate cover letter minimum length', async () => {
    render(<ApplicationModal {...defaultProps} />);

    const coverLetterInput = screen.getByPlaceholderText(/Tell us why you're a great fit/i);
    await userEvent.type(coverLetterInput, 'Too short');

    fireEvent.blur(coverLetterInput);

    await waitFor(() => {
      expect(screen.getByText(/must be at least 100 characters/i)).toBeInTheDocument();
    });
  });

  it('should accept valid cover letter', async () => {
    render(<ApplicationModal {...defaultProps} />);

    const coverLetterInput = screen.getByPlaceholderText(/Tell us why you're a great fit/i);
    const longText = 'A'.repeat(150);
    await userEvent.type(coverLetterInput, longText);

    fireEvent.blur(coverLetterInput);

    await waitFor(() => {
      expect(screen.queryByText(/must be at least 100 characters/i)).not.toBeInTheDocument();
    });
  });

  it('should handle file upload', async () => {
    render(<ApplicationModal {...defaultProps} />);

    const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Resume \/ CV/i);

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    });
  });

  it('should validate file size', async () => {
    render(<ApplicationModal {...defaultProps} />);

    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Resume \/ CV/i);

    await userEvent.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByText(/File size must not exceed/i)).toBeInTheDocument();
    });
  });

  it('should submit application with valid data', async () => {
    render(<ApplicationModal {...defaultProps} />);

    // Fill cover letter
    const coverLetterInput = screen.getByPlaceholderText(/Tell us why you're a great fit/i);
    await userEvent.type(coverLetterInput, 'A'.repeat(150));

    // Upload file
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Resume \/ CV/i);
    await userEvent.upload(fileInput, file);

    // Submit
    const submitButton = screen.getByText('Submit Application');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmitSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should update availability selection', async () => {
    render(<ApplicationModal {...defaultProps} />);

    const availabilitySelect = screen.getByLabelText(/Availability/i);
    await userEvent.selectOptions(availabilitySelect, '2-weeks');

    expect(availabilitySelect).toHaveValue('2-weeks');
  });

  it('should allow canceling application', () => {
    render(<ApplicationModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
