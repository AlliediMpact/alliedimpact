'use client';

import { ArrowRight, FolderKanban, CheckCircle, Users, Calendar, BarChart3, FileText, Zap, Bell } from 'lucide-react';
import Link from 'next/link';

export default function MyProjectsPage() {
  const features = [
    {
      icon: FolderKanban,
      title: 'Project Management',
      description: 'Create and organize unlimited projects with custom workflows.',
    },
    {
      icon: CheckCircle,
      title: 'Task Tracking',
      description: 'Break down work into manageable tasks with priorities and deadlines.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members and assign tasks with clear ownership.',
    },
    {
      icon: Calendar,
      title: 'Timeline Views',
      description: 'Visualize project progress with Gantt charts and calendars.',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track completion rates, velocity, and team productivity.',
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Attach files, notes, and requirements directly to tasks.',
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Set up rules to automate repetitive workflows and notifications.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay updated with real-time alerts on task changes and deadlines.',
    },
  ];

  const useCases = [
    'Software development projects',
    'Marketing campaign management',
    'Event planning and coordination',
    'Academic research projects',
    'Construction project tracking',
    'Product launch management',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-primary-blue via-[#1a3690] to-primary-purple overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>LIVE & ACTIVE</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                My Projects
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                Professional project management for teams of all sizes. Plan, track, and deliver projects on time with powerful collaboration tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="https://myprojects.alliedimpact.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group"
                >
                  Launch My Projects
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#features"
                  className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-semibold px-8 py-4 rounded-lg transition-colors"
                >
                  Learn More
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-6 text-sm">
                <div>
                  <div className="text-2xl font-bold">1,200+</div>
                  <div className="text-white/70">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">5,600+</div>
                  <div className="text-white/70">Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-white/70">On-Time Rate</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="w-full h-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <FolderKanban className="w-32 h-32 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Everything You Need to Deliver Projects
            </h2>
            <p className="text-lg text-muted-foreground">
              From planning to execution, My Projects provides all the tools your team needs to succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors group"
                >
                  <div className="w-12 h-12 mb-4 rounded-lg bg-primary-blue/10 flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary-blue" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Perfect For</h2>
              <p className="text-lg text-muted-foreground">
                Whether you're a solo freelancer or managing a large team, My Projects scales with you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-background border border-muted hover:border-primary-blue transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-blue flex-shrink-0" />
                  <span className="text-sm font-medium">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-br from-primary-blue to-primary-purple text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Start Managing Projects Today
            </h2>
            <p className="text-xl text-white/90">
              Join teams worldwide who trust My Projects to deliver results.
            </p>
            <div className="pt-4">
              <Link 
                href="https://myprojects.alliedimpact.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group text-lg"
              >
                Launch Application
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-sm text-white/70 pt-2">
              Requires Allied iMpact account • Start your first project in minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
