'use client';

import { useProject } from '@/contexts/ProjectContext';
import ActivityFeed from '@/components/ActivityFeed';
import { Card, CardContent } from '@allied-impact/ui';
import { Clock } from 'lucide-react';

export default function ActivityPage() {
  const { selectedProject } = useProject();

  if (!selectedProject) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
              <p className="text-muted-foreground">
                Please select a project to view its activity feed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activity Timeline</h1>
        <p className="text-muted-foreground">
          Track all changes and updates in {selectedProject.name}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ActivityFeed 
            projectId={selectedProject.id} 
            maxItems={100}
            showFilters={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
