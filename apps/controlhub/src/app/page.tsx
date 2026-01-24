import Link from 'next/link';
import { Shield, Activity } from 'lucide-react';
import { Logo, Button } from '@allied-impact/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-2xl mx-auto p-8 text-center">
        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Logo appName="ControlHub" variant="full" size="lg" />
        </div>
        
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          ControlHub
        </h1>
        
        <p className="text-xl text-slate-300 mb-2">
          Platform Observability & Governance
        </p>
        
        <p className="text-sm text-slate-400 mb-12 max-w-md mx-auto">
          Real-time monitoring, security oversight, and compliance management
          for the Allied iMpact platform
        </p>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">6</div>
            <div className="text-sm text-slate-400">Apps Monitored</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-sm text-slate-400">Uptime Monitoring</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">∞</div>
            <div className="text-sm text-slate-400">Event Streams</div>
          </div>
        </div>

        {/* CTA Button */}
        <Link href="/dashboard">
          <Button size="lg" className="gap-2">
            <Shield className="h-5 w-5" />
            Access Dashboard
          </Button>
        </Link>

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            🔒 Internal Use Only - Platform Super Admins, Security & Support Teams
          </p>
        </div>
      </div>
    </div>
  );
}
