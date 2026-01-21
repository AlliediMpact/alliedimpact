import { Metadata } from 'next';
import AuditLogsViewer from '@/components/admin/AuditLogsViewer';

export const metadata: Metadata = {
  title: 'Audit Logs - SportsHub Admin',
  description: 'View and analyze administrative actions and system events',
};

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto py-8">
      <AuditLogsViewer />
    </div>
  );
}
