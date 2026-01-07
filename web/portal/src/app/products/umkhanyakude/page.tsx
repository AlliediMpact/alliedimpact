'use client';

import { ArrowRight, GraduationCap, BookOpen, Users, Award, Video, FileText, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function UmkhanyakudePage() {
  const features = [
    {
      icon: GraduationCap,
      title: 'Quality Education',
      description: 'Curated courses designed for South African community needs.',
    },
    {
      icon: BookOpen,
      title: 'Self-Paced Learning',
      description: 'Learn at your own speed with lifetime access to courses.',
    },
    {
      icon: Users,
      title: 'Community Forums',
      description: 'Connect with fellow learners and share knowledge.',
    },
    {
      icon: Award,
      title: 'Certifications',
      description: 'Earn recognized certificates upon course completion.',
    },
    {
      icon: Video,
      title: 'Video Lessons',
      description: 'High-quality video content with subtitles and transcripts.',
    },
    {
      icon: FileText,
      title: 'Practice Materials',
      description: 'Downloadable resources, quizzes, and assignments.',
    },
    {
      icon: MessageCircle,
      title: 'Instructor Support',
      description: 'Get help directly from course instructors when needed.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics.',
    },
  ];

  const courses = [
    'Financial literacy and budgeting',
    'Digital skills and computer basics',
    'Entrepreneurship fundamentals',
    'Agriculture and sustainable farming',
    'Health and wellness education',
    'Language learning (English, Zulu, Xhosa)',
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
                uMkhanyakude
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                Empowering South African communities through accessible education. Learn life-changing skills designed for local needs and opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="https://umkhanyakude.alliedimpact.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group"
                >
                  Browse Courses
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
                  <div className="text-2xl font-bold">2,800+</div>
                  <div className="text-white/70">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">45+</div>
                  <div className="text-white/70">Courses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-white/70">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="w-full h-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <GraduationCap className="w-32 h-32 text-white/50" />
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
              Education That Transforms Lives
            </h2>
            <p className="text-lg text-muted-foreground">
              uMkhanyakude provides the tools, resources, and support you need to build a better future.
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

      {/* Courses Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Popular Course Categories</h2>
              <p className="text-lg text-muted-foreground">
                Practical skills for real-world success in South African communities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-background border border-muted hover:border-primary-blue transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-blue flex-shrink-0" />
                  <span className="text-sm font-medium">{course}</span>
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
              Start Learning Today
            </h2>
            <p className="text-xl text-white/90">
              Join thousands transforming their lives through education with uMkhanyakude.
            </p>
            <div className="pt-4">
              <Link 
                href="https://umkhanyakude.alliedimpact.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group text-lg"
              >
                Explore Courses
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-sm text-white/70 pt-2">
              Requires Allied iMpact account • Many free courses available
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
