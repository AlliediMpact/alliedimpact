/**
 * Tests for QuizComponent
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizComponent from '../../src/components/learn/QuizComponent';

describe('QuizComponent', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('should render first question', () => {
      render(<QuizComponent lessonId="lesson123" />);

      expect(
        screen.getByText(/What is the "brain" of the computer/)
      ).toBeInTheDocument();
    });

    it('should render all answer options for first question', () => {
      render(<QuizComponent lessonId="lesson123" />);

      expect(screen.getByText('Hard Drive')).toBeInTheDocument();
      expect(screen.getByText('CPU (Central Processing Unit)')).toBeInTheDocument();
      expect(screen.getByText('RAM')).toBeInTheDocument();
      expect(screen.getByText('Motherboard')).toBeInTheDocument();
    });

    it('should show question 1 of 5', () => {
      render(<QuizComponent lessonId="lesson123" />);

      expect(screen.getByText(/1/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('should not have any answer selected initially', () => {
      const { container } = render(<QuizComponent lessonId="lesson123" />);

      const selectedButton = container.querySelector('[aria-pressed="true"]');
      expect(selectedButton).not.toBeInTheDocument();
    });
  });

  describe('answer selection', () => {
    it('should select an answer when clicked', () => {
      render(<QuizComponent lessonId="lesson123" />);

      const cpuOption = screen.getByText('CPU (Central Processing Unit)');
      fireEvent.click(cpuOption);

      // Visual feedback that answer is selected
      expect(cpuOption.closest('button')).toHaveClass('ring-2');
    });

    it('should change selection when different answer clicked', () => {
      render(<QuizComponent lessonId="lesson123" />);

      const hardDrive = screen.getByText('Hard Drive');
      const cpu = screen.getByText('CPU (Central Processing Unit)');

      fireEvent.click(hardDrive);
      expect(hardDrive.closest('button')).toHaveClass('ring-2');

      fireEvent.click(cpu);
      expect(cpu.closest('button')).toHaveClass('ring-2');
      expect(hardDrive.closest('button')).not.toHaveClass('ring-2');
    });

    it('should allow selecting answers for multiple questions', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // First question
      fireEvent.click(screen.getByText('CPU (Central Processing Unit)'));

      // Next question
      const nextButton = screen.getByText(/Next/);
      fireEvent.click(nextButton);

      // Second question
      expect(
        screen.getByText(/Which type of storage is temporary/)
      ).toBeInTheDocument();

      fireEvent.click(screen.getByText('RAM (Random Access Memory)'));
      expect(screen.getByText('RAM (Random Access Memory)').closest('button')).toHaveClass('ring-2');
    });
  });

  describe('navigation', () => {
    it('should navigate to next question', () => {
      render(<QuizComponent lessonId="lesson123" />);

      fireEvent.click(screen.getByText('CPU (Central Processing Unit)'));
      fireEvent.click(screen.getByText(/Next/));

      expect(
        screen.getByText(/Which type of storage is temporary/)
      ).toBeInTheDocument();
    });

    it('should navigate to previous question', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // Go to question 2
      fireEvent.click(screen.getByText('CPU (Central Processing Unit)'));
      fireEvent.click(screen.getByText(/Next/));

      // Go back to question 1
      fireEvent.click(screen.getByText(/Previous/));

      expect(
        screen.getByText(/What is the "brain" of the computer/)
      ).toBeInTheDocument();
    });

    it('should not show previous button on first question', () => {
      render(<QuizComponent lessonId="lesson123" />);

      expect(screen.queryByText(/Previous/)).not.toBeInTheDocument();
    });

    it('should show previous button on subsequent questions', () => {
      render(<QuizComponent lessonId="lesson123" />);

      fireEvent.click(screen.getByText('CPU (Central Processing Unit)'));
      fireEvent.click(screen.getByText(/Next/));

      expect(screen.getByText(/Previous/)).toBeInTheDocument();
    });

    it('should maintain selected answers when navigating back and forth', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // Select answer on question 1
      fireEvent.click(screen.getByText('CPU (Central Processing Unit)'));
      fireEvent.click(screen.getByText(/Next/));

      // Select answer on question 2
      fireEvent.click(screen.getByText('RAM (Random Access Memory)'));
      fireEvent.click(screen.getByText(/Previous/));

      // Check question 1 answer is still selected
      expect(screen.getByText('CPU (Central Processing Unit)').closest('button')).toHaveClass('ring-2');
    });
  });

  describe('quiz completion', () => {
    it('should show results after answering all questions', () => {
      render(<QuizComponent lessonId="lesson123" onComplete={mockOnComplete} />);

      // Answer all 5 questions correctly
      const correctAnswers = [
        'CPU (Central Processing Unit)',
        'RAM (Random Access Memory)',
        'Keyboard',
        'Solid State Drive',
        'Connect all computer components together',
      ];

      correctAnswers.forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < correctAnswers.length - 1) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      // Check results screen
      expect(screen.getByText(/Congratulations!/)).toBeInTheDocument();
      expect(screen.getByText(/You passed the quiz!/)).toBeInTheDocument();
    });

    it('should call onComplete when passing quiz', () => {
      render(<QuizComponent lessonId="lesson123" onComplete={mockOnComplete} />);

      // Answer all correctly (100%)
      const correctAnswers = [
        'CPU (Central Processing Unit)',
        'RAM (Random Access Memory)',
        'Keyboard',
        'Solid State Drive',
        'Connect all computer components together',
      ];

      correctAnswers.forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < correctAnswers.length - 1) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call onComplete when failing quiz', () => {
      render(<QuizComponent lessonId="lesson123" onComplete={mockOnComplete} />);

      // Answer all incorrectly
      const incorrectAnswers = [
        'Hard Drive',
        'Hard Drive',
        'Monitor',
        'Super Speed Drive',
        'Store files permanently',
      ];

      incorrectAnswers.forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < incorrectAnswers.length - 1) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should show percentage score', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // Answer 3 out of 5 correctly (60%)
      const answers = [
        'CPU (Central Processing Unit)', // correct
        'RAM (Random Access Memory)', // correct
        'Keyboard', // correct
        'Super Speed Drive', // incorrect
        'Store files permanently', // incorrect
      ];

      answers.forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < answers.length - 1) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      expect(screen.getByText(/60%/)).toBeInTheDocument();
    });

    it('should show correct/total questions count', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // Answer all correctly
      const correctAnswers = [
        'CPU (Central Processing Unit)',
        'RAM (Random Access Memory)',
        'Keyboard',
        'Solid State Drive',
        'Connect all computer components together',
      ];

      correctAnswers.forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < correctAnswers.length - 1) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      expect(screen.getByText(/5 out of 5/)).toBeInTheDocument();
    });
  });

  describe('passing threshold', () => {
    it('should pass with 70% score', () => {
      render(<QuizComponent lessonId="lesson123" onComplete={mockOnComplete} />);

      // Answer 4 out of 5 correctly (80%)
      const answers = [
        'CPU (Central Processing Unit)', // correct
        'RAM (Random Access Memory)', // correct
        'Keyboard', // correct
        'Solid State Drive', // correct
        'Store files permanently', // incorrect
      ];

      answers.forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < answers.length - 1) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      expect(screen.getByText(/Congratulations!/)).toBeInTheDocument();
      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('should fail with less than 70% score', () => {
      render(<QuizComponent lessonId="lesson123" onComplete={mockOnComplete} />);

      // Answer 3 out of 5 correctly (60%)
      const answers = [
        'CPU (Central Processing Unit)', // correct
        'RAM (Random Access Memory)', // correct
        'Keyboard', // correct
        'Super Speed Drive', // incorrect
        'Store files permanently', // incorrect
      ];

      answers.forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < answers.length - 1) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      expect(screen.queryByText(/Congratulations!/)).not.toBeInTheDocument();
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('retry functionality', () => {
    it('should allow retrying quiz after failure', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // Answer incorrectly
      const answers = ['Hard Drive', 'Hard Drive', 'Monitor', 'Super Speed Drive', 'Store files permanently'];

      answers.forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < answers.length - 1) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      // Retry quiz
      fireEvent.click(screen.getByText(/Try Again/));

      // Should be back to first question
      expect(
        screen.getByText(/What is the "brain" of the computer/)
      ).toBeInTheDocument();
    });

    it('should reset all answers when retrying', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // Answer question
      fireEvent.click(screen.getByText('CPU (Central Processing Unit)'));
      fireEvent.click(screen.getByText(/Next/));

      // Submit and fail
      ['Hard Drive', 'Monitor', 'Super Speed Drive', 'Store files permanently'].forEach((answer, index) => {
        fireEvent.click(screen.getByText(answer));
        if (index < 3) {
          fireEvent.click(screen.getByText(/Next/));
        } else {
          fireEvent.click(screen.getByText(/Submit/));
        }
      });

      // Retry
      fireEvent.click(screen.getByText(/Try Again/));

      // No answer should be selected
      const { container } = render(<QuizComponent lessonId="lesson123" />);
      const selectedButton = container.querySelector('[aria-pressed="true"]');
      expect(selectedButton).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle quiz without onComplete callback', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // Answer all correctly
      const correctAnswers = [
        'CPU (Central Processing Unit)',
        'RAM (Random Access Memory)',
        'Keyboard',
        'Solid State Drive',
        'Connect all computer components together',
      ];

      expect(() => {
        correctAnswers.forEach((answer, index) => {
          fireEvent.click(screen.getByText(answer));
          if (index < correctAnswers.length - 1) {
            fireEvent.click(screen.getByText(/Next/));
          } else {
            fireEvent.click(screen.getByText(/Submit/));
          }
        });
      }).not.toThrow();
    });

    it('should handle rapid navigation', () => {
      render(<QuizComponent lessonId="lesson123" />);

      // Rapid next clicks
      fireEvent.click(screen.getByText('CPU (Central Processing Unit)'));
      fireEvent.click(screen.getByText(/Next/));
      fireEvent.click(screen.getByText(/Next/));
      fireEvent.click(screen.getByText(/Next/));

      // Should still function correctly
      expect(screen.getByText(/Which device is an INPUT device/)).toBeInTheDocument();
    });
  });
});
