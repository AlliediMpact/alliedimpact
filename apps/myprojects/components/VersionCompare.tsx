'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { X, ArrowRight, Plus, Minus, FileText, Eye } from 'lucide-react';
import { 
  DeliverableVersion, 
  VersionChange,
  getDeliverableVersion,
  compareVersions,
  getTextDiff 
} from '@/lib/version-control';
import { RichTextViewer, htmlToPlainText } from './RichTextEditor';
import { format } from 'date-fns';

interface VersionCompareProps {
  deliverableId: string;
  version1Number: number;
  version2Number: number;
  onClose: () => void;
}

export default function VersionCompare({
  deliverableId,
  version1Number,
  version2Number,
  onClose,
}: VersionCompareProps) {
  const [version1, setVersion1] = useState<DeliverableVersion | null>(null);
  const [version2, setVersion2] = useState<DeliverableVersion | null>(null);
  const [changes, setChanges] = useState<VersionChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  useEffect(() => {
    loadVersions();
  }, [deliverableId, version1Number, version2Number]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const [v1, v2] = await Promise.all([
        getDeliverableVersion(deliverableId, version1Number),
        getDeliverableVersion(deliverableId, version2Number),
      ]);

      setVersion1(v1);
      setVersion2(v2);

      if (v1 && v2) {
        const diff = compareVersions(v1, v2);
        setChanges(diff);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const getChangeIcon = (type: 'added' | 'removed' | 'modified') => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'modified':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
    }
  };

  const getChangeColor = (type: 'added' | 'removed' | 'modified') => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'removed':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'modified':
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const renderTextDiff = (field: string, oldText: string, newText: string) => {
    const diff = getTextDiff(
      htmlToPlainText(oldText),
      htmlToPlainText(newText)
    );

    if (viewMode === 'split') {
      return (
        <div className="grid grid-cols-2 gap-4">
          {/* Old Version */}
          <div className="border rounded-lg p-4 bg-red-50">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <Minus className="h-4 w-4 text-red-600" />
              <span className="font-medium text-sm text-red-900">
                Version {version1Number}
              </span>
            </div>
            <div className="space-y-1">
              {diff.unchanged.map((line, idx) => (
                <div key={`unchanged-old-${idx}`} className="text-sm text-gray-600">
                  {line}
                </div>
              ))}
              {diff.removed.map((line, idx) => (
                <div key={`removed-${idx}`} className="text-sm bg-red-100 px-2 py-1 rounded">
                  - {line}
                </div>
              ))}
            </div>
          </div>

          {/* New Version */}
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <Plus className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm text-green-900">
                Version {version2Number}
              </span>
            </div>
            <div className="space-y-1">
              {diff.unchanged.map((line, idx) => (
                <div key={`unchanged-new-${idx}`} className="text-sm text-gray-600">
                  {line}
                </div>
              ))}
              {diff.added.map((line, idx) => (
                <div key={`added-${idx}`} className="text-sm bg-green-100 px-2 py-1 rounded">
                  + {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      // Unified view
      return (
        <div className="border rounded-lg p-4">
          <div className="space-y-1">
            {diff.unchanged.map((line, idx) => (
              <div key={`unchanged-${idx}`} className="text-sm text-gray-600">
                {line}
              </div>
            ))}
            {diff.removed.map((line, idx) => (
              <div key={`removed-${idx}`} className="text-sm bg-red-100 px-2 py-1 rounded text-red-900">
                - {line}
              </div>
            ))}
            {diff.added.map((line, idx) => (
              <div key={`added-${idx}`} className="text-sm bg-green-100 px-2 py-1 rounded text-green-900">
                + {line}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  if (loading || !version1 || !version2) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-6xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compare Versions: v{version1Number} vs v{version2Number}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {changes.length} change{changes.length !== 1 ? 's' : ''} detected
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'split' ? 'default' : 'outline'}
              onClick={() => setViewMode('split')}
            >
              Split View
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'unified' ? 'default' : 'outline'}
              onClick={() => setViewMode('unified')}
            >
              Unified View
            </Button>
            <button onClick={onClose} className="hover:opacity-70 ml-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Version Headers */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Version {version1.versionNumber}</span>
                <span className="text-xs px-2 py-1 bg-background rounded">Older</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{version1.createdByName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(version1.createdAt)}</p>
              {version1.comment && (
                <p className="text-sm mt-2 italic">&ldquo;{version1.comment}&rdquo;</p>
              )}
            </div>

            <div className="border rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Version {version2.versionNumber}</span>
                <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded">
                  Newer
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{version2.createdByName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(version2.createdAt)}</p>
              {version2.comment && (
                <p className="text-sm mt-2 italic">&ldquo;{version2.comment}&rdquo;</p>
              )}
            </div>
          </div>

          {/* Changes Summary */}
          {changes.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No changes detected between these versions</p>
            </div>
          ) : (
            <div className="space-y-6">
              {changes.map((change, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  {/* Change Header */}
                  <div className={`px-4 py-2 border-b flex items-center gap-2 ${getChangeColor(change.type)}`}>
                    {getChangeIcon(change.type)}
                    <span className="font-medium">{change.field}</span>
                    <span className="text-xs">
                      {change.type === 'added' && 'Added'}
                      {change.type === 'removed' && 'Removed'}
                      {change.type === 'modified' && 'Modified'}
                    </span>
                  </div>

                  {/* Change Content */}
                  <div className="p-4">
                    {change.field === 'Description' || change.field === 'Notes' ? (
                      // Rich text diff
                      renderTextDiff(change.field, change.oldValue || '', change.newValue || '')
                    ) : change.field === 'Files' ? (
                      // File change
                      <div className="flex items-center gap-4">
                        {change.oldValue && (
                          <div className="flex-1 bg-red-50 p-3 rounded border border-red-200">
                            <p className="text-sm text-red-900 font-mono truncate">
                              {change.oldValue}
                            </p>
                          </div>
                        )}
                        {change.oldValue && change.newValue && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        {change.newValue && (
                          <div className="flex-1 bg-green-50 p-3 rounded border border-green-200">
                            <p className="text-sm text-green-900 font-mono truncate">
                              {change.newValue}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Simple field change
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-red-50 p-3 rounded border border-red-200">
                          <p className="text-sm text-red-900">{change.oldValue || '(empty)'}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 bg-green-50 p-3 rounded border border-green-200">
                          <p className="text-sm text-green-900">{change.newValue || '(empty)'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
