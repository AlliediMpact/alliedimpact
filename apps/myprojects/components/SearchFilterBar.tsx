'use client';

import { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@allied-impact/ui';

export interface SearchFilterState {
  searchQuery: string;
  status: string[];
  priority: string[];
  dateRange: { from: Date | null; to: Date | null };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchFilterBarProps {
  onFilterChange: (filters: SearchFilterState) => void;
  initialFilters?: Partial<SearchFilterState>;
  availableStatuses?: string[];
  availablePriorities?: string[];
  showPriorityFilter?: boolean;
  placeholder?: string;
}

export default function SearchFilterBar({
  onFilterChange,
  initialFilters = {},
  availableStatuses = [],
  availablePriorities = [],
  showPriorityFilter = false,
  placeholder = 'Search...'
}: SearchFilterBarProps) {
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    status: [],
    priority: [],
    dateRange: { from: null, to: null },
    sortBy: 'date',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    const newFilters = { ...filters, status: newStatuses };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const togglePriority = (priority: string) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    
    const newFilters = { ...filters, priority: newPriorities };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSortOrder = () => {
    const newFilters = { ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' as 'asc' | 'desc' };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      searchQuery: '',
      status: [],
      priority: [],
      dateRange: { from: null, to: null },
      sortBy: 'date',
      sortOrder: 'desc' as 'asc' | 'desc'
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFiltersCount = filters.status.length + filters.priority.length;

  return (
    <div className="space-y-3">
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={placeholder}
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Sort Dropdown */}
        <div className="flex gap-1">
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
            {showPriorityFilter && <option value="priority">Priority</option>}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-accent/5">
          {/* Status Filter */}
          {availableStatuses.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {availableStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.status.includes(status)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Priority Filter */}
          {showPriorityFilter && availablePriorities.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <div className="flex flex-wrap gap-2">
                {availablePriorities.map(priority => (
                  <button
                    key={priority}
                    onClick={() => togglePriority(priority)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.priority.includes(priority)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</span>
          <button
            onClick={clearFilters}
            className="text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to apply filters to data
export function applyFilters<T extends { [key: string]: any }>(
  data: T[],
  filters: SearchFilterState,
  searchFields: string[] = ['name', 'title', 'description']
): T[] {
  let filtered = [...data];

  // Apply search query
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(query);
      })
    );
  }

  // Apply status filter
  if (filters.status.length > 0) {
    filtered = filtered.filter(item =>
      filters.status.includes(item.status)
    );
  }

  // Apply priority filter
  if (filters.priority.length > 0) {
    filtered = filtered.filter(item =>
      filters.priority.includes(item.priority)
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'name':
        comparison = (a.name || a.title || '').localeCompare(b.name || b.title || '');
        break;
      case 'date':
        const dateA = a.dueDate || a.createdAt || new Date(0);
        const dateB = b.dueDate || b.createdAt || new Date(0);
        comparison = dateA.getTime() - dateB.getTime();
        break;
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
      case 'priority':
        const priorityOrder: { [key: string]: number } = {
          'Urgent': 4,
          'High': 3,
          'Medium': 2,
          'Low': 1
        };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}
