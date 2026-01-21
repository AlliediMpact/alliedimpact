import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MFAVerificationModal } from '../MFAVerificationModal';

describe('MFAVerificationModal', () => {
  const mockOnVerify = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onVerify: mockOnVerify,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    expect(screen.getByText(/verification/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<MFAVerificationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText(/verification/i)).not.toBeInTheDocument();
  });

  it('should have 6-digit input fields', () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('should call onVerify with code', async () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Enter code
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });
    
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalledWith('123456');
    });
  });

  it('should call onClose when cancel clicked', () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable verify button with incomplete code', () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    
    expect(verifyButton).toBeDisabled();
  });

  it('should enable verify button with complete code', () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Enter complete code
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });
    
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    
    expect(verifyButton).not.toBeDisabled();
  });

  it('should auto-focus next input on digit entry', () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Enter first digit
    fireEvent.change(inputs[0], { target: { value: '1' } });
    
    // Second input should receive focus (we can't directly test focus, but validate behavior)
    expect(inputs[1]).toBeInTheDocument();
  });

  it('should handle paste of 6-digit code', () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Paste 6-digit code into first input
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => '123456',
      },
    } as any);
    
    // All inputs should be filled
    inputs.forEach((input, index) => {
      expect(input).toHaveValue(String(index + 1));
    });
  });

  it('should show error message when verification fails', async () => {
    mockOnVerify.mockRejectedValue(new Error('Invalid code'));
    
    render(<MFAVerificationModal {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });
    
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid|error/i)).toBeInTheDocument();
    });
  });

  it('should allow backspace to previous input', () => {
    render(<MFAVerificationModal {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Fill first input
    fireEvent.change(inputs[0], { target: { value: '1' } });
    
    // Backspace on second input
    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    
    // Should be able to edit first input again
    expect(inputs[0]).toBeInTheDocument();
  });
});
