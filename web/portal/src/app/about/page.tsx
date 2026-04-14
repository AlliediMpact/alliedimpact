'use client';

import { Zap, Users, Shield, Rocket, Award, Globe } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: 'Innovation & Excellence',
      description: 'We push boundaries with cutting-edge technology, constantly evolving to deliver world-class solutions.',
    },
    {
      icon: Users,
      title: 'User-First Design',
      description: 'Every feature is crafted with genuine user insights. Your success is our measure of success.',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Enterprise-grade security protects your data. Transparency builds lasting relationships.',
    },
    {
      icon: Rocket,
      title: 'Scalable Growth',
      description: 'Built for scale from day one. Our platform grows with your ambitions, never limiting potential.',
    },
    {
      icon: Award,
      title: 'Quality First',
      description: 'We never compromise on quality. Every line of code, every design pixel matters.',
    },
    {
      icon: Globe,
      title: 'African Ingenuity',
      description: 'Deep local expertise meets global standards. We build for Africa, admired worldwide.',
    },
  ];

  const achievements = [
    { metric: '10,000+', label: 'Active Users' },
    { metric: '6 Products', label: 'Live & Growing' },
    { metric: '99.9%', label: 'Uptime' },
    { metric: '200ms', label: 'Avg Response Time' },
  ];

  const milestones = [
    { year: '2023', title: 'Founded', description: 'Allied iMpact launches with vision to revolutionize digital services in Africa' },
    { year: '2024', title: 'Six Products Live', description: 'CareerBox, CoinBox, DriveMaster, EduTech, MyProjects, and SportsHub all serving users' },
    { year: '2026', title: 'Reaching Millions', description: 'Platform expanded to serve communities across Southern Africa with 10,000+ users' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 bg-gradient-to-br from-primary-blue via-[#1a3690] to-primary-purple overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white space-y-6">
            <h1 className="text-6xl sm:text-7xl font-bold leading-tight">
              Transforming Africa's Digital Future
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Allied iMpact is the custom digital solutions developer trusted by individuals, businesses, and organizations across Africa. We don't just build products—we create ecosystems that empower communities.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="w-full py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-5xl font-bold mb-6 text-primary-blue">Our Mission</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    To design and deliver world-class custom digital solutions that solve real problems for African businesses and communities.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We believe in <strong className="text-foreground">sustainable innovation</strong>—building solutions that create lasting value for people, businesses, and society.
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h2 className="text-5xl font-bold mb-6 text-primary-purple">Our Vision</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    To become Africa's most trusted custom digital solutions developer—known for excellence, innovation, and impact.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We're building a legacy where technology serves humanity, where African solutions compete globally, and where every community has access to world-class digital services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 bg-primary-blue/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">{achievement.metric}</div>
                <div className="text-sm text-muted-foreground">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="w-full py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-bold mb-6">Core Values That Drive Us</h2>
            <p className="text-lg text-muted-foreground">
              These principles define how we work, what we build, and how we treat our users and partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index} 
                  className="p-8 rounded-xl border-2 border-muted hover:border-primary-blue hover:shadow-lg transition-all duration-300 group bg-background"
                >
                  <div className="w-16 h-16 mb-6 rounded-lg bg-primary-blue/10 flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary-blue" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="w-full py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl font-bold mb-16 text-center">How We Work</h2>
            
            <div className="space-y-8">
              {[
                {
                  title: 'Understand Your Challenge',
                  description: 'Deep discovery to understand your business, users, and unique needs. No one-size-fits-all here.'
                },
                {
                  title: 'Design Thoughtfully',
                  description: 'Collaborative design process where your vision guides us. We validate ideas before building.'
                },
                {
                  title: 'Build with Excellence',
                  description: 'World-class engineering standards. Scalable architecture, security-first approach, performance optimized.'
                },
                {
                  title: 'Partner for Success',
                  description: 'We don\'t just deliver and disappear. Ongoing support, iteration, and growth with you.'
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start p-6 bg-background rounded-xl border border-muted hover:border-primary-blue transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="w-full py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 text-center">Our Journey</h2>
            <p className="text-lg text-muted-foreground text-center mb-16">
              From startup to trusted platform serving thousands across Africa.
            </p>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className="flex gap-8 items-start group"
                >
                  <div className="flex-shrink-0 pt-2">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center group-hover:shadow-lg transition-shadow">
                      <span className="text-2xl font-bold text-white">{milestone.year}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-4">
                    <h3 className="text-2xl font-bold mb-3 text-foreground">{milestone.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full py-24 bg-gradient-to-br from-primary-blue/5 to-primary-purple/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-bold">Built by Africans, for Africa</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our team combines world-class technical expertise with deep African market knowledge. We understand your challenges because we live them. We build solutions that work here, that scale globally.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From Johannesburg to Lagos, Cape Town to Nairobi—our distributed team is unified by one mission: transforming Africa's digital future.
            </p>
          </div>
        </div>
      </section>

      {/* Products Showcase Section */}
      <section className="w-full py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4">Our Portfolio</h2>
              <p className="text-lg text-muted-foreground">
                Six proven products demonstrating our capability to deliver world-class solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'CareerBox', desc: 'AI-powered career matching platform' },
                { name: 'CoinBox', desc: 'P2P financial platform with real-time analytics' },
                { name: 'DriveMaster', desc: 'Driver training & licensing preparation' },
                { name: 'EduTech', desc: 'Technology education & bootcamps' },
                { name: 'MyProjects', desc: 'Enterprise project management solution' },
                { name: 'SportsHub', desc: 'Sports community & tournament platform' },
              ].map((product, index) => (
                <div 
                  key={index}
                  className="p-8 rounded-xl border-2 border-muted hover:border-primary-blue hover:shadow-lg transition-all duration-300 bg-background group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">LIVE</span>
                  </div>
                  <p className="text-muted-foreground">{product.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-gradient-to-br from-primary-blue to-primary-purple text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-bold leading-tight">
              Ready to Transform Your Vision?
            </h2>
            <p className="text-xl text-white/90">
              Let's build something extraordinary together. World-class digital solutions start here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-bold px-8 py-4 rounded-lg transition-colors group text-lg"
              >
                Start a Project
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/services"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-bold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
