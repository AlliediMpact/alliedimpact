import { Metadata } from 'next';
import SystemHealthMonitor from '@/components/admin/SystemHealthMonitor';

export const metadata: Metadata = {
  title: 'System Health - SportsHub Admin',
  description: 'Monitor system health, performance metrics, and critical alerts',
};

export default function SystemHealthPage() {
  return (
    <div className="container mx-auto py-8">
      <SystemHealthMonitor />
    </div>
  );
}
