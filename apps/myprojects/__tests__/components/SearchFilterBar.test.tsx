import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchFilterBar, { SearchFilterState } from '@/components/SearchFilterBar';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="x-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

// Mock UI components
jest.mock('@allied-impact/ui', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

describe('SearchFilterBar', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input with placeholder', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render custom placeholder', () => {
      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange} 
          placeholder="Search projects..."
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search projects...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render filter button', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const filterButton = screen.getByText('Filters');
      expect(filterButton).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const sortSelect = screen.getByDisplayValue('Date');
      expect(sortSelect).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search query on input change', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      expect(searchInput.value).toBe('test query');
    });

    it('should call onFilterChange when search query changes', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          searchQuery: 'test'
        })
      );
    });

    it('should show clear button when search has text', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByTestId('x-icon');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search when clear button clicked', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByTestId('x-icon').parentElement!;
      fireEvent.click(clearButton);
      
      expect(searchInput.value).toBe('');
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          searchQuery: ''
        })
      );
    });

    it('should not show clear button when search is empty', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const xIcons = screen.queryAllByTestId('x-icon');
      // Clear button should not be visible initially
      expect(xIcons.length).toBe(0);
    });
  });

  describe('Initial Filters', () => {
    it('should apply initial filters', () => {
      const initialFilters: Partial<SearchFilterState> = {
        searchQuery: 'initial search',
        status: ['active'],
        sortBy: 'name'
      };

      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange}
          initialFilters={initialFilters}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      expect(searchInput.value).toBe('initial search');
      
      const sortSelect = screen.getByDisplayValue('Name') as HTMLSelectElement;
      expect(sortSelect.value).toBe('name');
    });

    it('should use default filters when no initial filters provided', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      expect(searchInput.value).toBe('');
      
      const sortSelect = screen.getByDisplayValue('Date') as HTMLSelectElement;
      expect(sortSelect.value).toBe('date');
    });
  });

  describe('Sort Functionality', () => {
    it('should change sort option', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const sortSelect = screen.getByDisplayValue('Date') as HTMLSelectElement;
      fireEvent.change(sortSelect, { target: { value: 'name' } });
      
      expect(sortSelect.value).toBe('name');
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'name'
        })
      );
    });

    it('should show priority option when showPriorityFilter is true', () => {
      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange}
          showPriorityFilter={true}
        />
      );
      
      const sortSelect = screen.getByDisplayValue('Date');
      fireEvent.change(sortSelect, { target: { value: 'priority' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'priority'
        })
      );
    });

    it('should have default sort options', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const sortSelect = screen.getByDisplayValue('Date') as HTMLSelectElement;
      const options = Array.from(sortSelect.options).map(opt => opt.value);
      
      expect(options).toContain('date');
      expect(options).toContain('name');
      expect(options).toContain('status');
    });
  });

  describe('Filter Toggle', () => {
    it('should toggle filters panel', () => {
      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange}
          availableStatuses={['active', 'completed']}
        />
      );
      
      const filterButton = screen.getByText('Filters');
      fireEvent.click(filterButton);
      
      // Check if status filters are now visible
      waitFor(() => {
        expect(screen.queryByText('active')).toBeInTheDocument();
      });
    });

    it('should show filter count badge when filters are active', () => {
      const initialFilters: Partial<SearchFilterState> = {
        status: ['active', 'completed']
      };

      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange}
          initialFilters={initialFilters}
        />
      );
      
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
    });

    it('should not show badge when no filters active', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const badges = screen.queryByText(/^\d+$/);
      expect(badges).not.toBeInTheDocument();
    });
  });

  describe('Available Options', () => {
    it('should accept custom available statuses', () => {
      const availableStatuses = ['draft', 'published', 'archived'];
      
      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange}
          availableStatuses={availableStatuses}
        />
      );
      
      // Component should accept the prop without errors
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should accept custom available priorities', () => {
      const availablePriorities = ['low', 'medium', 'high', 'critical'];
      
      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange}
          availablePriorities={availablePriorities}
          showPriorityFilter={true}
        />
      );
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should handle empty available options', () => {
      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange}
          availableStatuses={[]}
          availablePriorities={[]}
        />
      );
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  describe('Filter State Management', () => {
    it('should maintain separate filter states', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const sortSelect = screen.getByDisplayValue('Date');
      fireEvent.change(sortSelect, { target: { value: 'name' } });
      
      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          searchQuery: 'test',
          sortBy: 'name'
        })
      );
    });

    it('should preserve other filters when updating one', () => {
      const initialFilters: Partial<SearchFilterState> = {
        status: ['active'],
        sortBy: 'name'
      };

      render(
        <SearchFilterBar 
          onFilterChange={mockOnFilterChange}
          initialFilters={initialFilters}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          searchQuery: 'test',
          status: ['active'],
          sortBy: 'name'
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have accessible search input', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible sort dropdown', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const sortSelect = screen.getByDisplayValue('Date');
      expect(sortSelect.tagName).toBe('SELECT');
    });

    it('should have clickable filter button', () => {
      render(<SearchFilterBar onFilterChange={mockOnFilterChange} />);
      
      const filterButton = screen.getByText('Filters');
      expect(filterButton.tagName).toBe('BUTTON');
    });
  });
});
