'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { X, GitBranch, Plus, Trash2, AlertTriangle, CheckCircle, Zap, TrendingRight } from 'lucide-react';
import { Milestone } from '@allied-impact/projects';
import {
  DependencyGraphNode,
  addMilestoneDependency,
  removeMilestoneDependency,
  buildDependencyGraph,
  suggestDependencies,
} from '@/lib/dependency-manager';

interface DependencyGraphProps {
  projectId: string;
  milestones: Milestone[];
  currentUserId: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function DependencyGraph({
  projectId,
  milestones,
  currentUserId,
  onClose,
  onRefresh,
}: DependencyGraphProps) {
  const [nodes, setNodes] = useState<DependencyGraphNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [showAddDependency, setShowAddDependency] = useState(false);
  const [fromMilestone, setFromMilestone] = useState<string>('');
  const [toMilestone, setToMilestone] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadGraph();
  }, [projectId, milestones]);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const graphNodes = await buildDependencyGraph(projectId, milestones);
      setNodes(graphNodes);
    } catch (error) {
      console.error('Failed to load dependency graph:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDependency = async () => {
    if (!fromMilestone || !toMilestone) {
      alert('Please select both milestones');
      return;
    }

    if (fromMilestone === toMilestone) {
      alert('A milestone cannot depend on itself');
      return;
    }

    try {
      const fromNode = nodes.find(n => n.id === fromMilestone);
      const toNode = nodes.find(n => n.id === toMilestone);

      if (!fromNode || !toNode) {
        throw new Error('Selected milestones not found');
      }

      await addMilestoneDependency(
        projectId,
        fromMilestone,
        fromNode.name,
        toMilestone,
        toNode.name,
        'finish-to-start',
        0,
        currentUserId
      );

      alert('Dependency added successfully');
      setShowAddDependency(false);
      setFromMilestone('');
      setToMilestone('');
      await loadGraph();
      onRefresh?.();
    } catch (error: any) {
      alert(error.message || 'Failed to add dependency');
    }
  };

  const handleRemoveDependency = async (fromId: string, toId: string) => {
    const confirmed = confirm('Remove this dependency?');
    if (!confirmed) return;

    try {
      await removeMilestoneDependency(fromId, toId);
      alert('Dependency removed');
      await loadGraph();
      onRefresh?.();
    } catch (error) {
      alert('Failed to remove dependency');
    }
  };

  const suggestions = suggestDependencies(milestones);
  const criticalPathNodes = nodes.filter(n => n.isOnCriticalPath);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Milestone Dependencies
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {nodes.length} milestones • {criticalPathNodes.length} on critical path
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <Zap className="h-4 w-4 mr-1" />
              Suggestions ({suggestions.length})
            </Button>
            <Button size="sm" onClick={() => setShowAddDependency(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Dependency
            </Button>
            <button onClick={onClose} className="hover:opacity-70 ml-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Critical Path Alert */}
              {criticalPathNodes.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">Critical Path Identified</h4>
                      <p className="text-sm text-orange-800 mb-2">
                        {criticalPathNodes.length} milestone{criticalPathNodes.length > 1 ? 's' : ''} on the critical path (zero slack).
                        Delays in these will delay the entire project.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {criticalPathNodes.map(node => (
                          <span key={node.id} className="px-2 py-1 bg-orange-100 text-orange-900 rounded text-xs font-medium">
                            {node.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions Panel */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Suggested Dependencies
                    </h4>
                    <button onClick={() => setShowSuggestions(false)} className="text-blue-600 text-sm">
                      Hide
                    </button>
                  </div>
                  <div className="space-y-2">
                    {suggestions.slice(0, 5).map((suggestion, idx) => (
                      <div key={idx} className="bg-white rounded p-3 border border-blue-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {suggestion.from.name} → {suggestion.to.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{ width: `${suggestion.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(suggestion.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await addMilestoneDependency(
                                  projectId,
                                  suggestion.from.id,
                                  suggestion.from.name,
                                  suggestion.to.id,
                                  suggestion.to.name,
                                  'finish-to-start',
                                  0,
                                  currentUserId
                                );
                                alert('Dependency added');
                                await loadGraph();
                                onRefresh?.();
                              } catch (error: any) {
                                alert(error.message);
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependency Graph Visualization */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingRight className="h-4 w-4" />
                  Dependency Flow
                </h4>

                {/* Group by level */}
                {Array.from(new Set(nodes.map(n => n.level)))
                  .sort((a, b) => a - b)
                  .map(level => {
                    const levelNodes = nodes.filter(n => n.level === level);
                    
                    return (
                      <div key={level} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Level {level}
                          </span>
                          <div className="flex-1 h-px bg-border"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {levelNodes.map(node => (
                            <div
                              key={node.id}
                              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                                node.isOnCriticalPath
                                  ? 'border-orange-300 bg-orange-50'
                                  : selectedMilestone === node.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => setSelectedMilestone(node.id)}
                            >
                              {/* Milestone Name */}
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-sm">{node.name}</h5>
                                {node.isOnCriticalPath && (
                                  <span className="px-2 py-0.5 bg-orange-200 text-orange-900 text-xs rounded-full flex-shrink-0">
                                    Critical
                                  </span>
                                )}
                              </div>

                              {/* Slack Info */}
                              {node.slack > 0 && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {node.slack} day{node.slack > 1 ? 's' : ''} slack
                                </p>
                              )}

                              {/* Dependencies */}
                              {node.dependencies.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs text-muted-foreground mb-1">Depends on:</p>
                                  <div className="space-y-1">
                                    {node.dependencies.map(depId => {
                                      const depNode = nodes.find(n => n.id === depId);
                                      return depNode ? (
                                        <div key={depId} className="flex items-center justify-between text-xs bg-muted rounded px-2 py-1">
                                          <span className="truncate">{depNode.name}</span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveDependency(depId, node.id);
                                            }}
                                            className="text-red-600 hover:text-red-800 ml-1 flex-shrink-0"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Dependents */}
                              {node.dependents.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Blocks:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {node.dependents.map(depId => {
                                      const depNode = nodes.find(n => n.id === depId);
                                      return depNode ? (
                                        <span key={depId} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                          {depNode.name}
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* No dependencies indicator */}
                              {node.dependencies.length === 0 && node.dependents.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">Independent milestone</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>

        {/* Add Dependency Modal */}
        {showAddDependency && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle>Add Dependency</CardTitle>
                <button onClick={() => setShowAddDependency(false)}>
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Predecessor (must complete first)
                    </label>
                    <select
                      value={fromMilestone}
                      onChange={(e) => setFromMilestone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select milestone...</option>
                      {milestones.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-center">
                    <TrendingRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Successor (depends on predecessor)
                    </label>
                    <select
                      value={toMilestone}
                      onChange={(e) => setToMilestone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select milestone...</option>
                      {milestones.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDependency(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddDependency} className="flex-1">
                      Add Dependency
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
