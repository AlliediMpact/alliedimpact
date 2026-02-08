/**
 * Tests for CodeEditor component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeEditor from '../../src/components/learn/CodeEditor';

describe('CodeEditor', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the challenge title', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      expect(screen.getByText('Write a Function to Add Two Numbers')).toBeInTheDocument();
    });

    it('should render the challenge description', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      expect(
        screen.getByText(/Create a function called `add` that takes two parameters/)
      ).toBeInTheDocument();
    });

    it('should render all instruction steps', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      expect(screen.getByText('Define a function named `add`')).toBeInTheDocument();
      expect(screen.getByText(/The function should accept two parameters/)).toBeInTheDocument();
      expect(screen.getByText(/Return the sum of `a` and `b`/)).toBeInTheDocument();
    });

    it('should render starter code in textarea', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(expect.stringContaining('function add(a, b)'));
    });

    it('should render Run Code button', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      expect(screen.getByRole('button', { name: /run code/i })).toBeInTheDocument();
    });

    it('should render Reset button', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });

  describe('code editing', () => {
    it('should update code when typing in textarea', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return a + b; }' },
      });

      expect(textarea.value).toBe('function add(a, b) { return a + b; }');
    });

    it('should reset code to starter code when Reset clicked', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const resetButton = screen.getByRole('button', { name: /reset/i });

      // Modify code
      fireEvent.change(textarea, {
        target: { value: 'modified code' },
      });
      expect(textarea.value).toBe('modified code');

      // Reset
      fireEvent.click(resetButton);

      expect(textarea.value).toContain('function add(a, b)');
      expect(textarea.value).toContain('// Write your code here');
    });
  });

  describe('code execution', () => {
    it('should run code and show test results when Run Code clicked', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      // Write correct solution
      fireEvent.change(textarea, {
        target: {
          value: `function add(a, b) {
            return a + b;
          }`,
        },
      });

      // Run code
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/test results/i)).toBeInTheDocument();
      });
    });

    it('should show all tests passed when solution is correct', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return a + b; }' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/all tests passed/i)).toBeInTheDocument();
      });
    });

    it('should call onComplete when all tests pass', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return a + b; }' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('should show test failures when solution is incorrect', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      // Write incorrect solution
      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return a - b; }' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.queryByText(/all tests passed/i)).not.toBeInTheDocument();
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should show error message when code has syntax error', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      // Write invalid code
      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return a +' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('test results display', () => {
    it('should display individual test case results', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return a + b; }' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        // Should show test inputs
        expect(screen.getByText(/2, 3/)).toBeInTheDocument();
        expect(screen.getByText(/10, 15/)).toBeInTheDocument();
        expect(screen.getByText(/-5, 5/)).toBeInTheDocument();
        expect(screen.getByText(/100, 200/)).toBeInTheDocument();
      });
    });

    it('should show expected vs actual values for failed tests', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      // Incorrect solution that returns product instead of sum
      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return a * b; }' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        // Should show expected and actual values
        expect(screen.getByText(/expected: 5/i)).toBeInTheDocument();
        expect(screen.getByText(/actual: 6/i)).toBeInTheDocument();
      });
    });

    it('should display success icons for passed tests', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return a + b; }' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        const checkIcons = screen.getAllByTestId('check-icon');
        expect(checkIcons).toHaveLength(4); // All 4 tests passed
      });
    });

    it('should display failure icons for failed tests', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      fireEvent.change(textarea, {
        target: { value: 'function add(a, b) { return 0; }' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        const errorIcons = screen.getAllByTestId('x-icon');
        expect(errorIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('accessibility', () => {
    it('should have accessible textarea with aria-label', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', expect.stringContaining('code'));
    });

    it('should have accessible buttons with aria-labels', () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const runButton = screen.getByRole('button', { name: /run code/i });
      const resetButton = screen.getByRole('button', { name: /reset/i });

      expect(runButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty code submission', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should handle code with no function definition', async () => {
      render(<CodeEditor lessonId="lesson1" onComplete={mockOnComplete} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const runButton = screen.getByRole('button', { name: /run code/i });

      fireEvent.change(textarea, {
        target: { value: 'const x = 5;' },
      });

      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });
});
