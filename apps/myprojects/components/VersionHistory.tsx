'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  X, 
  Clock, 
  User, 
  MessageSquare, 
  GitBranch, 
  RotateCcw,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  DeliverableVersion, 
  getDeliverableVersions, 
  rollbackToVersion,
  canRollback 
} from '@/lib/version-control';
import { format } from 'date-fns';

interface VersionHistoryProps {
  deliverableId: string;
  deliverableName: string;
  currentUserId: string;
  currentUserName: string;
  userRole: string;
  onClose: () => void;
  onCompare?: (version1: number, version2: number) => void;
  onVersionSelect?: (version: DeliverableVersion) => void;
}

export default function VersionHistory({
  deliverableId,
  deliverableName,
  currentUserId,
  currentUserName,
  userRole,
  onClose,
  onCompare,
  onVersionSelect,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<DeliverableVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [rollingBack, setRollingBack] = useState<number | null>(null);

  useEffect(() => {
    loadVersions();
  }, [deliverableId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const versionData = await getDeliverableVersions(deliverableId);
      // Sort by version number descending (newest first)
      const sorted = [...versionData].sort((a, b) => b.versionNumber - a.versionNumber);
      setVersions(sorted);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionNumber: number) => {
    if (selectedVersions.includes(versionNumber)) {
      setSelectedVersions(selectedVersions.filter(v => v !== versionNumber));
    } else {
      if (selectedVersions.length >= 2) {
        // Only allow 2 selections for comparison
        setSelectedVersions([selectedVersions[1], versionNumber]);
      } else {
        setSelectedVersions([...selectedVersions, versionNumber]);
      }
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompare) {
      const [v1, v2] = selectedVersions.sort((a, b) => a - b);
      onCompare(v1, v2);
    }
  };

  const handleRollback = async (versionNumber: number) => {
    if (!canRollback(userRole)) {
      alert('You do not have permission to rollback versions.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to rollback to version ${versionNumber}? This will create a new version with the content from version ${versionNumber}.`
    );

    if (!confirmed) return;

    setRollingBack(versionNumber);
    try {
      await rollbackToVersion(
        deliverableId,
        versionNumber,
        currentUserId,
        currentUserName
      );
      alert('Successfully rolled back to version ' + versionNumber);
      await loadVersions();
      window.location.reload(); // Refresh to show updated deliverable
    } catch (error) {
      console.error('Rollback failed:', error);
      alert('Failed to rollback. Please try again.');
    } finally {
      setRollingBack(null);
    }
  };

  const handleViewVersion = (version: DeliverableVersion) => {
    if (onVersionSelect) {
      onVersionSelect(version);
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const isLatestVersion = (versionNumber: number) => {
    return versionNumber === Math.max(...versions.map(v => v.versionNumber));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Version History
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{deliverableName}</p>
          </div>
          <button onClick={onClose} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No version history available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Versions will be created when you save changes to this deliverable
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Action Bar */}
              {selectedVersions.length === 2 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        {selectedVersions.length} versions selected
                      </span>
                    </div>
                    <Button onClick={handleCompare} size="sm">
                      Compare Versions
                    </Button>
                  </div>
                </div>
              )}

              {/* Version Timeline */}
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`relative border rounded-lg p-4 transition-all ${
                      selectedVersions.includes(version.versionNumber)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Timeline Line */}
                    {index < versions.length - 1 && (
                      <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border -mb-4"></div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Version Number Circle */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                          isLatestVersion(version.versionNumber)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        v{version.versionNumber}
                      </div>

                      {/* Version Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{version.name}</h4>
                              {isLatestVersion(version.versionNumber) && (
                                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            {version.comment && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{version.comment}</span>
                              </div>
                            )}
                          </div>

                          {/* Version Actions */}
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedVersions.includes(version.versionNumber)}
                              onChange={() => handleVersionSelect(version.versionNumber)}
                              className="w-4 h-4 rounded border-border"
                              title="Select for comparison"
                            />
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            <span>{version.createdByName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(version.createdAt)}</span>
                          </div>
                          {version.fileUrls && version.fileUrls.length > 0 && (
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              {version.fileUrls.length} file{version.fileUrls.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewVersion(version)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          
                          {!isLatestVersion(version.versionNumber) && canRollback(userRole) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRollback(version.versionNumber)}
                              disabled={rollingBack === version.versionNumber}
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              {rollingBack === version.versionNumber ? 'Rolling back...' : 'Rollback'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
