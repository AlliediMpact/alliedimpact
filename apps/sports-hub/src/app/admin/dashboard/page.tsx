import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard - SportsHub',
  description: 'Administrative dashboard for SportsHub platform management',
};

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard />
    </div>
  );
}
