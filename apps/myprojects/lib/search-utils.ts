import { Milestone, Deliverable, Ticket, MilestoneStatus, DeliverableStatus, TicketStatus } from '@allied-impact/projects';

/**
 * Search utility functions for advanced search and filtering
 */

// Search filter interface
export interface SearchFilters {
  query?: string;
  status?: string[];
  assignedTo?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  type?: string[];
  priority?: string[];
  category?: string[];
}

// Search result with highlighting
export interface SearchResult<T> {
  item: T;
  score: number;
  matches: {
    field: string;
    snippet: string;
    highlighted: string;
  }[];
}

// Normalize text for searching
function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

// Highlight matches in text
function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Calculate search relevance score
function calculateScore(text: string, query: string): number {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  if (!normalizedQuery) return 0;
  
  let score = 0;
  
  // Exact match
  if (normalizedText === normalizedQuery) score += 100;
  
  // Starts with
  if (normalizedText.startsWith(normalizedQuery)) score += 50;
  
  // Contains
  if (normalizedText.includes(normalizedQuery)) score += 25;
  
  // Word match
  const words = normalizedQuery.split(' ');
  words.forEach(word => {
    if (normalizedText.includes(word)) score += 10;
  });
  
  return score;
}

// Create search snippet with context
function createSnippet(text: string, query: string, contextLength: number = 100): string {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  const index = normalizedText.indexOf(normalizedQuery);
  if (index === -1) return text.substring(0, contextLength) + '...';
  
  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(text.length, index + query.length + contextLength / 2);
  
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
}

// Search milestones
export function searchMilestones(
  milestones: Milestone[],
  filters: SearchFilters
): SearchResult<Milestone>[] {
  const { query, status, assignedTo, dateFrom, dateTo } = filters;
  
  let results: SearchResult<Milestone>[] = milestones.map(milestone => {
    let score = 0;
    const matches: SearchResult<Milestone>['matches'] = [];
    
    // Text search
    if (query) {
      const nameScore = calculateScore(milestone.name, query);
      const descScore = calculateScore(milestone.description, query);
      
      if (nameScore > 0) {
        score += nameScore;
        matches.push({
          field: 'name',
          snippet: createSnippet(milestone.name, query),
          highlighted: highlightText(milestone.name, query)
        });
      }
      
      if (descScore > 0) {
        score += descScore;
        matches.push({
          field: 'description',
          snippet: createSnippet(milestone.description, query),
          highlighted: highlightText(milestone.description, query)
        });
      }
    } else {
      score = 10; // Base score for non-text filters
    }
    
    return { item: milestone, score, matches };
  });
  
  // Filter by status
  if (status && status.length > 0) {
    results = results.filter(r => status.includes(r.item.status));
  }
  
  // Filter by assigned users
  if (assignedTo && assignedTo.length > 0) {
    results = results.filter(r => 
      r.item.assignedTo && r.item.assignedTo.some(id => assignedTo.includes(id))
    );
  }
  
  // Filter by date range
  if (dateFrom) {
    results = results.filter(r => new Date(r.item.dueDate) >= dateFrom);
  }
  
  if (dateTo) {
    results = results.filter(r => new Date(r.item.dueDate) <= dateTo);
  }
  
  // Filter by query score
  if (query) {
    results = results.filter(r => r.score > 0);
  }
  
  // Sort by score
  return results.sort((a, b) => b.score - a.score);
}

// Search deliverables
export function searchDeliverables(
  deliverables: Deliverable[],
  filters: SearchFilters
): SearchResult<Deliverable>[] {
  const { query, status, type, assignedTo, dateFrom, dateTo } = filters;
  
  let results: SearchResult<Deliverable>[] = deliverables.map(deliverable => {
    let score = 0;
    const matches: SearchResult<Deliverable>['matches'] = [];
    
    // Text search
    if (query) {
      const nameScore = calculateScore(deliverable.name, query);
      const descScore = calculateScore(deliverable.description, query);
      const notesScore = deliverable.notes ? calculateScore(deliverable.notes, query) : 0;
      
      if (nameScore > 0) {
        score += nameScore;
        matches.push({
          field: 'name',
          snippet: createSnippet(deliverable.name, query),
          highlighted: highlightText(deliverable.name, query)
        });
      }
      
      if (descScore > 0) {
        score += descScore;
        matches.push({
          field: 'description',
          snippet: createSnippet(deliverable.description, query),
          highlighted: highlightText(deliverable.description, query)
        });
      }
      
      if (notesScore > 0) {
        score += notesScore;
        matches.push({
          field: 'notes',
          snippet: createSnippet(deliverable.notes!, query),
          highlighted: highlightText(deliverable.notes!, query)
        });
      }
    } else {
      score = 10;
    }
    
    return { item: deliverable, score, matches };
  });
  
  // Filter by status
  if (status && status.length > 0) {
    results = results.filter(r => status.includes(r.item.status));
  }
  
  // Filter by type
  if (type && type.length > 0) {
    results = results.filter(r => type.includes(r.item.type));
  }
  
  // Filter by assigned user
  if (assignedTo && assignedTo.length > 0 && assignedTo[0]) {
    results = results.filter(r => r.item.assignedTo && assignedTo.includes(r.item.assignedTo));
  }
  
  // Filter by date range
  if (dateFrom) {
    results = results.filter(r => new Date(r.item.dueDate) >= dateFrom);
  }
  
  if (dateTo) {
    results = results.filter(r => new Date(r.item.dueDate) <= dateTo);
  }
  
  // Filter by query score
  if (query) {
    results = results.filter(r => r.score > 0);
  }
  
  // Sort by score
  return results.sort((a, b) => b.score - a.score);
}

// Search tickets
export function searchTickets(
  tickets: Ticket[],
  filters: SearchFilters
): SearchResult<Ticket>[] {
  const { query, status, priority, category, assignedTo, dateFrom, dateTo } = filters;
  
  let results: SearchResult<Ticket>[] = tickets.map(ticket => {
    let score = 0;
    const matches: SearchResult<Ticket>['matches'] = [];
    
    // Text search
    if (query) {
      const titleScore = calculateScore(ticket.title, query);
      const descScore = calculateScore(ticket.description, query);
      
      if (titleScore > 0) {
        score += titleScore;
        matches.push({
          field: 'title',
          snippet: createSnippet(ticket.title, query),
          highlighted: highlightText(ticket.title, query)
        });
      }
      
      if (descScore > 0) {
        score += descScore;
        matches.push({
          field: 'description',
          snippet: createSnippet(ticket.description, query),
          highlighted: highlightText(ticket.description, query)
        });
      }
      
      // Search in comments
      if (ticket.comments) {
        ticket.comments.forEach((comment, index) => {
          const commentScore = calculateScore(comment.text, query);
          if (commentScore > 0) {
            score += commentScore / 2; // Lower weight for comments
            matches.push({
              field: `comment_${index}`,
              snippet: createSnippet(comment.text, query),
              highlighted: highlightText(comment.text, query)
            });
          }
        });
      }
    } else {
      score = 10;
    }
    
    return { item: ticket, score, matches };
  });
  
  // Filter by status
  if (status && status.length > 0) {
    results = results.filter(r => status.includes(r.item.status));
  }
  
  // Filter by priority
  if (priority && priority.length > 0) {
    results = results.filter(r => priority.includes(r.item.priority));
  }
  
  // Filter by category
  if (category && category.length > 0) {
    results = results.filter(r => category.includes(r.item.category));
  }
  
  // Filter by assigned user
  if (assignedTo && assignedTo.length > 0 && assignedTo[0]) {
    results = results.filter(r => r.item.assignedTo && assignedTo.includes(r.item.assignedTo));
  }
  
  // Filter by date range
  if (dateFrom) {
    results = results.filter(r => new Date(r.item.createdAt) >= dateFrom);
  }
  
  if (dateTo) {
    results = results.filter(r => new Date(r.item.createdAt) <= dateTo);
  }
  
  // Filter by query score
  if (query) {
    results = results.filter(r => r.score > 0);
  }
  
  // Sort by score
  return results.sort((a, b) => b.score - a.score);
}

// Saved search query
export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  entityType: 'milestones' | 'deliverables' | 'tickets' | 'all';
  createdAt: Date;
}

// Load saved searches from localStorage
export function loadSavedSearches(): SavedSearch[] {
  try {
    const saved = localStorage.getItem('myprojects_saved_searches');
    if (!saved) return [];
    
    const searches = JSON.parse(saved);
    return searches.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      filters: {
        ...s.filters,
        dateFrom: s.filters.dateFrom ? new Date(s.filters.dateFrom) : undefined,
        dateTo: s.filters.dateTo ? new Date(s.filters.dateTo) : undefined,
      }
    }));
  } catch (error) {
    console.error('Failed to load saved searches:', error);
    return [];
  }
}

// Save search query
export function saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt'>): SavedSearch {
  const searches = loadSavedSearches();
  
  const newSearch: SavedSearch = {
    ...search,
    id: `search_${Date.now()}`,
    createdAt: new Date()
  };
  
  searches.push(newSearch);
  localStorage.setItem('myprojects_saved_searches', JSON.stringify(searches));
  
  return newSearch;
}

// Delete saved search
export function deleteSavedSearch(id: string): void {
  const searches = loadSavedSearches();
  const filtered = searches.filter(s => s.id !== id);
  localStorage.setItem('myprojects_saved_searches', JSON.stringify(filtered));
}

// Search history
export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount: number;
}

// Load search history
export function loadSearchHistory(): SearchHistoryItem[] {
  try {
    const saved = localStorage.getItem('myprojects_search_history');
    if (!saved) return [];
    
    const history = JSON.parse(saved);
    return history.map((h: any) => ({
      ...h,
      timestamp: new Date(h.timestamp)
    })).slice(0, 20); // Keep last 20
  } catch (error) {
    console.error('Failed to load search history:', error);
    return [];
  }
}

// Add to search history
export function addToSearchHistory(query: string, resultCount: number): void {
  if (!query.trim()) return;
  
  const history = loadSearchHistory();
  
  // Remove duplicate
  const filtered = history.filter(h => h.query !== query);
  
  // Add new entry
  filtered.unshift({
    query,
    timestamp: new Date(),
    resultCount
  });
  
  // Keep only last 20
  const trimmed = filtered.slice(0, 20);
  
  localStorage.setItem('myprojects_search_history', JSON.stringify(trimmed));
}

// Clear search history
export function clearSearchHistory(): void {
  localStorage.removeItem('myprojects_search_history');
}
