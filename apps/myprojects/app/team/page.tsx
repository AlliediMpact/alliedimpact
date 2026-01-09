'use client';

import { useProject } from '@/contexts/ProjectContext';
import TeamMembersManager from '@/components/TeamMembersManager';
import { Card, CardContent } from '@allied-impact/ui';
import { Users } from 'lucide-react';

export default function TeamPage() {
  const { selectedProject } = useProject();

  if (!selectedProject) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
              <p className="text-muted-foreground">
                Please select a project to view its team members
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <p className="text-muted-foreground">
          Manage team members and their roles for {selectedProject.name}
        </p>
      </div>

      <TeamMembersManager projectId={selectedProject.id} />
    </div>
  );
}
