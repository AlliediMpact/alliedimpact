import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationModal } from '@/components/application/application-modal';

/**
 * Integration test for the complete job application flow
 */
describe('Job Application Flow', () => {
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

  it('should complete full application flow successfully', async () => {
    render(<ApplicationModal {...defaultProps} />);

    // Step 1: Verify modal opens
    expect(screen.getByText('Apply for Position')).toBeInTheDocument();
    expect(screen.getByText(/Senior Software Engineer at Tech Corp/)).toBeInTheDocument();

    // Step 2: Fill cover letter
    const coverLetter = 'A'.repeat(150) + ' I am very interested in this position and believe my skills align well with your requirements.';
    const coverLetterInput = screen.getByPlaceholderText(/Tell us why you're a great fit/i);
    await userEvent.type(coverLetterInput, coverLetter);

    // Step 3: Upload resume
    const file = new File(['resume content'], 'john-doe-resume.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
    
    const fileInput = screen.getByLabelText(/Resume \/ CV/i);
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('john-doe-resume.pdf')).toBeInTheDocument();
    });

    // Step 4: Add portfolio URL
    const portfolioInput = screen.getByPlaceholderText(/https:\/\/linkedin.com/i);
    await userEvent.type(portfolioInput, 'https://linkedin.com/in/johndoe');

    // Step 5: Select availability
    const availabilitySelect = screen.getByLabelText(/Availability/i);
    await userEvent.selectOptions(availabilitySelect, '2-weeks');
    expect(availabilitySelect).toHaveValue('2-weeks');

    // Step 6: Add expected salary
    const salaryInput = screen.getByPlaceholderText(/e.g., R50,000/i);
    await userEvent.type(salaryInput, 'R60,000 - R80,000 per month');

    // Step 7: Add additional information
    const additionalInfoTextarea = screen.getByPlaceholderText(/Any other information/i);
    await userEvent.type(additionalInfoTextarea, 'I am available for an interview at your earliest convenience.');

    // Step 8: Submit application
    const submitButton = screen.getByText('Submit Application');
    expect(submitButton).not.toBeDisabled();
    
    fireEvent.click(submitButton);

    // Step 9: Verify submission
    await waitFor(() => {
      expect(mockOnSubmitSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should prevent submission with incomplete data', async () => {
    render(<ApplicationModal {...defaultProps} />);

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Submit Application');
    fireEvent.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Cover letter is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Please upload your resume/i)).toBeInTheDocument();
    });

    // Should not call callbacks
    expect(mockOnSubmitSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle file upload errors gracefully', async () => {
    render(<ApplicationModal {...defaultProps} />);

    // Try to upload invalid file type
    const invalidFile = new File(['content'], 'document.exe', { type: 'application/x-msdownload' });
    const fileInput = screen.getByLabelText(/Resume \/ CV/i);
    
    await userEvent.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  it('should allow user to cancel at any point', async () => {
    render(<ApplicationModal {...defaultProps} />);

    // Fill some data
    const coverLetterInput = screen.getByPlaceholderText(/Tell us why you're a great fit/i);
    await userEvent.type(coverLetterInput, 'Some cover letter text');

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should call onClose
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSubmitSuccess).not.toHaveBeenCalled();
  });

  it('should persist form data during editing', async () => {
    render(<ApplicationModal {...defaultProps} />);

    // Fill cover letter
    const coverLetterInput = screen.getByPlaceholderText(/Tell us why you're a great fit/i);
    await userEvent.type(coverLetterInput, 'My cover letter');

    // Switch to another field
    const portfolioInput = screen.getByPlaceholderText(/https:\/\/linkedin.com/i);
    await userEvent.type(portfolioInput, 'https://example.com');

    // Cover letter should still have value
    expect(coverLetterInput).toHaveValue('My cover letter');
  });

  it('should show character count for cover letter', () => {
    render(<ApplicationModal {...defaultProps} />);

    expect(screen.getByText(/0 \/ 100 minimum characters/i)).toBeInTheDocument();
  });

  it('should update character count as user types', async () => {
    render(<ApplicationModal {...defaultProps} />);

    const coverLetterInput = screen.getByPlaceholderText(/Tell us why you're a great fit/i);
    await userEvent.type(coverLetterInput, 'Test');

    await waitFor(() => {
      expect(screen.getByText(/4 \/ 100 minimum characters/i)).toBeInTheDocument();
    });
  });
});
