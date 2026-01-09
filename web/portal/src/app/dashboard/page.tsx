'use client';

import { ArrowRight, Wallet, FolderKanban, GraduationCap, Car, Code, Trophy, Bell, Settings, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

function DashboardContent() {
  const { user, platformUser } = useAuth();

  const products = [
    {
      id: 'coinbox',
      name: 'Coin Box',
      icon: Wallet,
      status: 'active',
      description: 'P2P Financial Platform',
      url: 'https://coinbox.alliedimpact.com',
      stats: { label: 'Balance', value: 'R2,450' },
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'myprojects',
      name: 'My Projects',
      icon: FolderKanban,
      status: 'active',
      description: 'Project Management',
      url: 'https://myprojects.alliedimpact.com',
      stats: { label: 'Active Projects', value: '3' },
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'umkhanyakude',
      name: 'uMkhanyakude',
      icon: GraduationCap,
      status: 'active',
      description: 'Community Education',
      url: 'https://umkhanyakude.alliedimpact.com',
      stats: { label: 'Courses', value: '2 in progress' },
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'drivemaster',
      name: 'Drive Master',
      icon: Car,
      status: 'coming-soon',
      description: 'Driver Training',
      url: '#',
      stats: { label: 'Status', value: 'Coming Q2 2026' },
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'codetech',
      name: 'CodeTech',
      icon: Code,
      status: 'coming-soon',
      description: 'Tech Education',
      url: '#',
      stats: { label: 'Status', value: 'Coming Q3 2026' },
      color: 'from-red-500 to-red-600',
    },
    {
      id: 'cupfinal',
      name: 'Cup Final',
      icon: Trophy,
      status: 'coming-soon',
      description: 'Sports Management',
      url: '#',
      stats: { label: 'Status', value: 'Coming Q4 2026' },
      color: 'from-yellow-500 to-yellow-600',
    },
  ];

  const recentActivity = [
    { product: 'Coin Box', action: 'Received R500 from Sarah M.', time: '2 hours ago', icon: Wallet },
    { product: 'My Projects', action: 'Task completed: Design Homepage', time: '5 hours ago', icon: FolderKanban },
    { product: 'uMkhanyakude', action: 'Completed lesson: Financial Literacy 101', time: '1 day ago', icon: GraduationCap },
    { product: 'Coin Box', action: 'Added R1,000 to Emergency Fund jar', time: '2 days ago', icon: Wallet },
  ];

  const notifications = [
    { title: 'Drive Master Launch', message: 'Be among the first to join when we launch in Q2 2026', type: 'info' },
    { title: 'My Projects Update', message: 'New features available: Gantt charts and time tracking', type: 'success' },
    { title: 'Security Alert', message: 'New login from Johannesburg, South Africa', type: 'warning' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.displayName || platformUser?.displayName || 'User'}!</h1>
          <p className="text-lg text-muted-foreground">
            Member since {platformUser?.createdAt ? new Date(platformUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'} • {user?.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-background p-6 rounded-xl border-2 border-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Products</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Coin Box, My Projects, uMkhanyakude</p>
          </div>

          <div className="bg-background p-6 rounded-xl border-2 border-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Notifications</span>
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
          </div>

          <div className="bg-background p-6 rounded-xl border-2 border-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Account Status</span>
              <Settings className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </div>

          <div className="bg-background p-6 rounded-xl border-2 border-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Security Score</span>
              <span className="text-sm font-semibold text-green-600">Excellent</span>
            </div>
            <div className="text-3xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground mt-1">2FA enabled, strong password</p>
          </div>
        </div>

        {/* My Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">My Products</h2>
            <Link 
              href="/products"
              className="text-primary-blue hover:underline font-medium flex items-center"
            >
              View All
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const Icon = product.icon;
              const isActive = product.status === 'active';
              
              return (
                <Link
                  key={product.id}
                  href={product.url}
                  className={`group relative overflow-hidden rounded-xl border-2 ${
                    isActive 
                      ? 'border-muted hover:border-primary-blue' 
                      : 'border-muted bg-muted/30 opacity-75'
                  } transition-all`}
                  target={isActive ? '_blank' : undefined}
                  rel={isActive ? 'noopener noreferrer' : undefined}
                  onClick={(e) => !isActive && e.preventDefault()}
                >
                  <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${product.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  
                  <div className="relative p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {isActive ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          SOON
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>

                    <div className="pt-2 border-t border-muted">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{product.stats.label}</span>
                        <span className="font-semibold">{product.stats.value}</span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex items-center text-primary-blue font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Open App
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="bg-background rounded-xl border-2 border-muted divide-y divide-muted">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="p-6 flex items-start space-x-4 hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium mb-1">{activity.action}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium text-primary-blue mr-2">{activity.product}</span>
                        <span>• {activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Notifications */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border-2 ${
                    notification.type === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                    notification.type === 'success' ? 'border-green-200 bg-green-50/50' :
                    'border-blue-200 bg-blue-50/50'
                  }`}
                >
                  <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-8 p-6 bg-background rounded-xl border-2 border-muted">
              <h3 className="font-bold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link 
                  href="/settings"
                  className="flex items-center justify-between text-sm hover:text-primary-blue transition-colors"
                >
                  <span>Account Settings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/security"
                  className="flex items-center justify-between text-sm hover:text-primary-blue transition-colors"
                >
                  <span>Security & Privacy</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/billing"
                  className="flex items-center justify-between text-sm hover:text-primary-blue transition-colors"
                >
                  <span>Billing & Subscriptions</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/contact"
                  className="flex items-center justify-between text-sm hover:text-primary-blue transition-colors"
                >
                  <span>Get Support</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
