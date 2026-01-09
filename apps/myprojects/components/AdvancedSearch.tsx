'use client';

import { useState, useEffect } from 'react';
import { Button } from '@allied-impact/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@allied-impact/ui';
import { 
  Search, 
  X, 
  Filter, 
  Calendar,
  User,
  Tag,
  Save,
  History,
  Trash2,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Milestone, Deliverable, Ticket } from '@allied-impact/projects';
import {
  searchMilestones,
  searchDeliverables,
  searchTickets,
  SearchFilters,
  SearchResult,
  loadSavedSearches,
  saveSearch,
  deleteSavedSearch,
  SavedSearch,
  loadSearchHistory,
  addToSearchHistory,
  clearSearchHistory
} from '@/lib/search-utils';

interface AdvancedSearchProps {
  milestones: Milestone[];
  deliverables: Deliverable[];
  tickets: Ticket[];
  onClose: () => void;
  onResultClick: (entityType: string, itemId: string) => void;
}

export default function AdvancedSearch({
  milestones,
  deliverables,
  tickets,
  onClose,
  onResultClick
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [entityType, setEntityType] = useState<'all' | 'milestones' | 'deliverables' | 'tickets'>('all');
  
  const [milestoneResults, setMilestoneResults] = useState<SearchResult<Milestone>[]>([]);
  const [deliverableResults, setDeliverableResults] = useState<SearchResult<Deliverable>[]>([]);
  const [ticketResults, setTicketResults] = useState<SearchResult<Ticket>[]>([]);
  
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load saved searches and history on mount
  useEffect(() => {
    setSavedSearches(loadSavedSearches());
    setSearchHistory(loadSearchHistory());
  }, []);

  // Perform search
  const performSearch = () => {
    const searchFilters = { ...filters, query };

    let totalResults = 0;

    if (entityType === 'all' || entityType === 'milestones') {
      const results = searchMilestones(milestones, searchFilters);
      setMilestoneResults(results);
      totalResults += results.length;
    } else {
      setMilestoneResults([]);
    }

    if (entityType === 'all' || entityType === 'deliverables') {
      const results = searchDeliverables(deliverables, searchFilters);
      setDeliverableResults(results);
      totalResults += results.length;
    } else {
      setDeliverableResults([]);
    }

    if (entityType === 'all' || entityType === 'tickets') {
      const results = searchTickets(tickets, searchFilters);
      setTicketResults(results);
      totalResults += results.length;
    } else {
      setTicketResults([]);
    }

    // Add to history
    if (query) {
      addToSearchHistory(query, totalResults);
      setSearchHistory(loadSearchHistory());
    }
  };

  // Handle search on Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  // Apply saved search
  const applySavedSearch = (saved: SavedSearch) => {
    setFilters(saved.filters);
    setQuery(saved.filters.query || '');
    setEntityType(saved.entityType);
    setShowSaved(false);
    
    // Trigger search
    setTimeout(() => performSearch(), 100);
  };

  // Save current search
  const handleSaveSearch = () => {
    if (!saveName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    const saved = saveSearch({
      name: saveName,
      filters: { ...filters, query },
      entityType
    });

    setSavedSearches(loadSavedSearches());
    setSaveName('');
    setShowSaveDialog(false);
    alert('Search saved successfully!');
  };

  // Delete saved search
  const handleDeleteSaved = (id: string) => {
    if (confirm('Delete this saved search?')) {
      deleteSavedSearch(id);
      setSavedSearches(loadSavedSearches());
    }
  };

  // Clear all history
  const handleClearHistory = () => {
    if (confirm('Clear all search history?')) {
      clearSearchHistory();
      setSearchHistory([]);
    }
  };

  const totalResults = milestoneResults.length + deliverableResults.length + ticketResults.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </CardTitle>
            <button onClick={onClose} className="hover:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search milestones, deliverables, tickets..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                autoFocus
              />
            </div>
            <Button onClick={performSearch}>
              Search
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {/* Entity type tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setEntityType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                entityType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({milestones.length + deliverables.length + tickets.length})
            </button>
            <button
              onClick={() => setEntityType('milestones')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                entityType === 'milestones' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Milestones ({milestones.length})
            </button>
            <button
              onClick={() => setEntityType('deliverables')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                entityType === 'deliverables' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Deliverables ({deliverables.length})
            </button>
            <button
              onClick={() => setEntityType('tickets')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                entityType === 'tickets' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tickets ({tickets.length})
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowSaved(!showSaved)}>
              <Star className="h-4 w-4 mr-2" />
              Saved ({savedSearches.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-2" />
              History ({searchHistory.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters panel */}
          {showFilters && (
            <Card className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    multiple
                    value={filters.status || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters({ ...filters, status: selected });
                    }}
                    className="w-full border rounded-lg p-2 h-24"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>

                {/* Date range */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
                      className="w-full border rounded-lg p-2"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined })}
                      className="w-full border rounded-lg p-2"
                      placeholder="To"
                    />
                  </div>
                </div>

                {/* Type filter (for deliverables) */}
                {(entityType === 'all' || entityType === 'deliverables') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Tag className="h-4 w-4 inline mr-1" />
                      Type
                    </label>
                    <select
                      multiple
                      value={filters.type || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters({ ...filters, type: selected });
                      }}
                      className="w-full border rounded-lg p-2 h-24"
                    >
                      <option value="design">Design</option>
                      <option value="code">Code</option>
                      <option value="documentation">Documentation</option>
                      <option value="deployment">Deployment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}

                {/* Priority filter (for tickets) */}
                {(entityType === 'all' || entityType === 'tickets') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      multiple
                      value={filters.priority || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters({ ...filters, priority: selected });
                      }}
                      className="w-full border rounded-lg p-2 h-24"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={performSearch}>
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    setQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}

          {/* Saved searches */}
          {showSaved && savedSearches.length > 0 && (
            <Card className="p-4 bg-blue-50">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Saved Searches
              </h3>
              <div className="space-y-2">
                {savedSearches.map(saved => (
                  <div key={saved.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <button
                      onClick={() => applySavedSearch(saved)}
                      className="flex-1 text-left hover:text-blue-600"
                    >
                      <div className="font-medium">{saved.name}</div>
                      <div className="text-xs text-gray-500">
                        {saved.filters.query || 'No query'} • {saved.entityType}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(saved.id)}
                      className="p-1 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Search history */}
          {showHistory && searchHistory.length > 0 && (
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Searches
                </h3>
                <Button variant="outline" size="sm" onClick={handleClearHistory}>
                  Clear All
                </Button>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 10).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item.query);
                      setShowHistory(false);
                      setTimeout(() => performSearch(), 100);
                    }}
                    className="w-full text-left p-2 hover:bg-white rounded text-sm"
                  >
                    <span className="text-gray-700">{item.query}</span>
                    <span className="text-gray-400 ml-2">({item.resultCount} results)</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Save dialog */}
          {showSaveDialog && (
            <Card className="p-4 bg-green-50">
              <h3 className="font-medium mb-3">Save Current Search</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter search name..."
                  className="flex-1 px-3 py-2 border rounded-lg"
                  autoFocus
                />
                <Button onClick={handleSaveSearch}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Results */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">
                {totalResults > 0 ? `${totalResults} results found` : 'No results'}
              </h3>
            </div>

            {/* Milestone results */}
            {milestoneResults.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Milestones ({milestoneResults.length})</h4>
                <div className="space-y-2">
                  {milestoneResults.map(result => (
                    <button
                      key={result.item.id}
                      onClick={() => onResultClick('milestone', result.item.id)}
                      className="w-full text-left p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium" dangerouslySetInnerHTML={{ __html: result.matches[0]?.highlighted || result.item.name }} />
                      <div className="text-sm text-gray-600 mt-1">
                        {result.matches.map((match, i) => (
                          <div key={i} className="text-xs" dangerouslySetInnerHTML={{ __html: match.snippet }} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">{result.item.status}</span>
                        <span>{new Date(result.item.dueDate).toLocaleDateString()}</span>
                        <span className="text-blue-600">Score: {result.score}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverable results */}
            {deliverableResults.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Deliverables ({deliverableResults.length})</h4>
                <div className="space-y-2">
                  {deliverableResults.map(result => (
                    <button
                      key={result.item.id}
                      onClick={() => onResultClick('deliverable', result.item.id)}
                      className="w-full text-left p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium" dangerouslySetInnerHTML={{ __html: result.matches[0]?.highlighted || result.item.name }} />
                      <div className="text-sm text-gray-600 mt-1">
                        {result.matches.map((match, i) => (
                          <div key={i} className="text-xs" dangerouslySetInnerHTML={{ __html: match.snippet }} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">{result.item.status}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">{result.item.type}</span>
                        <span>{new Date(result.item.dueDate).toLocaleDateString()}</span>
                        <span className="text-blue-600">Score: {result.score}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket results */}
            {ticketResults.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tickets ({ticketResults.length})</h4>
                <div className="space-y-2">
                  {ticketResults.map(result => (
                    <button
                      key={result.item.id}
                      onClick={() => onResultClick('ticket', result.item.id)}
                      className="w-full text-left p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium" dangerouslySetInnerHTML={{ __html: result.matches[0]?.highlighted || result.item.title }} />
                      <div className="text-sm text-gray-600 mt-1">
                        {result.matches.map((match, i) => (
                          <div key={i} className="text-xs" dangerouslySetInnerHTML={{ __html: match.snippet }} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">{result.item.status}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">{result.item.priority}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">{result.item.category}</span>
                        <span className="text-blue-600">Score: {result.score}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (query || Object.keys(filters).length > 0) && (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No results found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
