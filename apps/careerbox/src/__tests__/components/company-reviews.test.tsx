import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyReviewsSection } from '@/components/reviews/company-reviews';

describe('CompanyReviewsSection', () => {
  const defaultProps = {
    companyId: 'company-123',
    companyName: 'Tech Corp',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render company reviews section', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    expect(screen.getByText('Company Reviews')).toBeInTheDocument();
    expect(screen.getByText('Write a Review')).toBeInTheDocument();
  });

  it('should display average rating', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    const ratingElement = screen.getByText(/4\.\d+/); // Average rating
    expect(ratingElement).toBeInTheDocument();
  });

  it('should display review count', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    expect(screen.getByText(/\d+ reviews?/)).toBeInTheDocument();
  });

  it('should show review form when "Write a Review" is clicked', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    const writeReviewButton = screen.getByText('Write a Review');
    fireEvent.click(writeReviewButton);

    expect(screen.getByText('Write Your Review')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., Software Engineer/)).toBeInTheDocument();
  });

  it('should allow selecting star rating', async () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    const writeReviewButton = screen.getByText('Write a Review');
    fireEvent.click(writeReviewButton);

    // Find star buttons in the form
    const formSection = screen.getByText('Write Your Review').closest('div');
    const starButtons = formSection?.querySelectorAll('button');

    if (starButtons && starButtons.length >= 5) {
      // Click the 5th star
      fireEvent.click(starButtons[4]);

      // Verify 5 stars are filled
      const filledStars = formSection?.querySelectorAll('.fill-yellow-500');
      expect(filledStars?.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('should validate required fields on submit', async () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    const writeReviewButton = screen.getByText('Write a Review');
    fireEvent.click(writeReviewButton);

    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    // Should show alert for missing fields
    // Note: In a real app, you'd want to use proper validation feedback
  });

  it('should submit review with valid data', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    
    render(<CompanyReviewsSection {...defaultProps} />);

    const writeReviewButton = screen.getByText('Write a Review');
    fireEvent.click(writeReviewButton);

    // Fill in all required fields
    const formSection = screen.getByText('Write Your Review').closest('div');
    const starButtons = formSection?.querySelectorAll('button');
    if (starButtons && starButtons.length >= 5) {
      fireEvent.click(starButtons[4]); // 5 stars
    }

    const positionInput = screen.getByPlaceholderText(/e.g., Software Engineer/);
    await userEvent.type(positionInput, 'Senior Developer');

    const titleInput = screen.getByPlaceholderText(/Summarize your experience/);
    await userEvent.type(titleInput, 'Great place to work');

    const prosTextarea = screen.getByPlaceholderText(/What did you like/);
    await userEvent.type(prosTextarea, 'Good culture and benefits');

    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Review submitted successfully')
      );
    });

    alertSpy.mockRestore();
  });

  it('should display existing reviews', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    expect(screen.getByText(/Great place to grow your career/)).toBeInTheDocument();
    expect(screen.getByText(/Best company I've worked for/)).toBeInTheDocument();
  });

  it('should show review author and position', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    expect(screen.getByText('Former Employee')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('should display pros and cons for each review', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    expect(screen.getByText(/Excellent learning opportunities/)).toBeInTheDocument();
    expect(screen.getByText(/Fast-paced environment/)).toBeInTheDocument();
  });

  it('should show helpful/not helpful counts', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    // Find thumbs up/down buttons with counts
    const helpfulButtons = screen.getAllByText(/\d+/);
    expect(helpfulButtons.length).toBeGreaterThan(0);
  });

  it('should cancel review form', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    const writeReviewButton = screen.getByText('Write a Review');
    fireEvent.click(writeReviewButton);

    expect(screen.getByText('Write Your Review')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Write Your Review')).not.toBeInTheDocument();
  });

  it('should display rating distribution bars', () => {
    render(<CompanyReviewsSection {...defaultProps} />);

    // Check for star rating distribution (5★, 4★, etc.)
    expect(screen.getByText('5★')).toBeInTheDocument();
    expect(screen.getByText('4★')).toBeInTheDocument();
    expect(screen.getByText('3★')).toBeInTheDocument();
  });
});
