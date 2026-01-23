import Link from 'next/link';
import { Shield, Activity } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto p-8 text-center">
        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="relative">
            <Shield className="h-16 w-16 text-blue-500" />
            <Activity className="h-6 w-6 text-green-500 absolute -bottom-1 -right-1" />
          </div>
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
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50"
        >
          <Shield className="h-5 w-5" />
          Access Dashboard
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
