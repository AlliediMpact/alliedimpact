'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@allied-impact/ui';
import { useRouter } from 'next/navigation';
import ActivityFeed from './ActivityFeed';

interface RecentActivityWidgetProps {
  projectId: string;
}

export default function RecentActivityWidget({ projectId }: RecentActivityWidgetProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/activity')}>
          View All
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <ActivityFeed 
            projectId={projectId} 
            maxItems={10}
            showFilters={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
