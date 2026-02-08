/**
 * Tests for Card component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../src/components/ui/card';

describe('Card', () => {
  describe('Card container', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>);

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply default card styling', () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('shadow-md');
    });

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should pass through HTML div attributes', () => {
      render(
        <Card data-testid="test-card" id="card-1">
          Content
        </Card>
      );

      const card = screen.getByTestId('test-card');
      expect(card).toHaveAttribute('id', 'card-1');
    });
  });

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      );

      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should apply header styling', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );

      const header = screen.getByText('Header').parentElement;
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('space-y-1.5');
      expect(header).toHaveClass('p-6');
    });

    it('should apply custom className to header', () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>
      );

      const header = screen.getByText('Header').parentElement;
      expect(header).toHaveClass('custom-header');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card>
          <CardHeader ref={ref}>Header</CardHeader>
        </Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should apply title styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveClass('tracking-tight');
    });

    it('should apply custom className to title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title">Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card>
          <CardHeader>
            <CardTitle ref={ref}>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Card description text')).toBeInTheDocument();
    });

    it('should apply description styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('should apply custom className to description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription className="custom-desc">Description</CardDescription>
          </CardHeader>
        </Card>
      );

      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card>
          <CardHeader>
            <CardDescription ref={ref}>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardContent', () => {
    it('should render card content', () => {
      render(
        <Card>
          <CardContent>Main content here</CardContent>
        </Card>
      );

      expect(screen.getByText('Main content here')).toBeInTheDocument();
    });

    it('should apply content styling', () => {
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );

      const content = screen.getByText('Content').parentElement;
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
    });

    it('should apply custom className to content', () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>
      );

      const content = screen.getByText('Content').parentElement;
      expect(content).toHaveClass('custom-content');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card>
          <CardContent ref={ref}>Content</CardContent>
        </Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );

      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should apply footer styling', () => {
      const { container } = render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const footer = screen.getByText('Footer').parentElement;
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0');
    });

    it('should apply custom className to footer', () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      );

      const footer = screen.getByText('Footer').parentElement;
      expect(footer).toHaveClass('custom-footer');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card>
          <CardFooter ref={ref}>Footer</CardFooter>
        </Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('complete card', () => {
    it('should render full card with all sub-components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('This is a test card')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should render card with only required parts', () => {
      render(
        <Card>
          <CardContent>Minimal card</CardContent>
        </Card>
      );

      expect(screen.getByText('Minimal card')).toBeInTheDocument();
    });

    it('should render card without footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>No Footer Card</CardTitle>
          </CardHeader>
          <CardContent>Content only</CardContent>
        </Card>
      );

      expect(screen.getByText('No Footer Card')).toBeInTheDocument();
      expect(screen.getByText('Content only')).toBeInTheDocument();
    });

    it('should render card without header', () => {
      render(
        <Card>
          <CardContent>No header content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('No header content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('nested content', () => {
    it('should render card with form elements', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Form Card</CardTitle>
          </CardHeader>
          <CardContent>
            <input type="text" placeholder="Enter name" />
            <input type="email" placeholder="Enter email" />
          </CardContent>
          <CardFooter>
            <button type="submit">Submit</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should render card with multiple action buttons', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('should render card with complex content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complex Card</CardTitle>
            <CardDescription>With multiple elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h4>Subsection</h4>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Subsection')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });

  describe('styling combinations', () => {
    it('should combine custom styles with default styles', () => {
      const { container } = render(
        <Card className="bg-blue-100 p-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-blue-900">Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-blue-100');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
    });

    it('should override default padding', () => {
      render(
        <Card>
          <CardContent className="p-0">No padding content</CardContent>
        </Card>
      );

      const content = screen.getByText('No padding content').parentElement;
      expect(content).toHaveClass('p-0');
    });
  });

  describe('edge cases', () => {
    it('should handle empty card', () => {
      const { container } = render(<Card />);

      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg');
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(
        <Card>
          <CardHeader>
            <CardTitle>{longTitle}</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            {null}
          </CardHeader>
          <CardContent>
            {null}
            <p>Content</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
