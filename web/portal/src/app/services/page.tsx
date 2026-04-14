'use client';

import { Target, Code, Smartphone, Zap, Users, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const services = [
    {
      icon: Code,
      title: 'Custom Web Development',
      description: 'Build powerful, scalable web applications tailored to your business needs. From concept to deployment, we deliver world-class web solutions.',
      capabilities: ['Web Applications', 'Progressive Web Apps', 'Cloud Architecture', 'API Development'],
    },
    {
      icon: Smartphone,
      title: 'Mobile App Development',
      description: 'Develop native and cross-platform mobile applications that engage users and drive growth.',
      capabilities: ['iOS Development', 'Android Development', 'Cross-Platform Solutions', 'App Store Deployment'],
    },
    {
      icon: Zap,
      title: 'Custom Software Solutions',
      description: 'Enterprise-grade software tailored to solve your specific business challenges and accelerate growth.',
      capabilities: ['Enterprise Applications', 'System Integration', 'Legacy Modernization', 'Automation Tools'],
    },
    {
      icon: Users,
      title: 'Full-Stack Development',
      description: 'End-to-end development services covering frontend, backend, database, and infrastructure.',
      capabilities: ['Frontend Architecture', 'Backend Systems', 'Database Design', 'DevOps & Deployment'],
    },
  ];

  const processSteps = [
    {
      number: '01',
      title: 'Discovery & Strategy',
      description: 'We understand your business goals, challenges, and vision to create a custom roadmap.',
    },
    {
      number: '02',
      title: 'Design & Planning',
      description: 'Collaborative design process that ensures your solution aligns with your brand and needs.',
    },
    {
      number: '03',
      title: 'Development & Build',
      description: 'Agile development with regular updates and transparent communication throughout the project.',
    },
    {
      number: '04',
      title: 'Testing & Deployment',
      description: 'Rigorous testing and seamless deployment to ensure your solution works flawlessly.',
    },
    {
      number: '05',
      title: 'Support & Growth',
      description: 'Ongoing support, maintenance, and scalability planning as your business evolves.',
    },
  ];

  const caseStudies = [
    {
      name: 'CareerBox',
      tagline: 'AI-Powered Career Platform',
      description: 'Developed a comprehensive job matching platform combining AI, employer network integration, and career coaching tools.',
      technologies: ['Next.js', 'Firebase', 'Machine Learning', 'Real-time Analytics'],
    },
    {
      name: 'CoinBox',
      tagline: 'P2P Finance & Crypto Platform',
      description: 'Built a secure peer-to-peer lending, investment, and cryptocurrency trading platform serving thousands of users.',
      technologies: ['React', 'Node.js', 'Blockchain', 'Payment Systems'],
    },
    {
      name: 'DriveMaster',
      tagline: 'Driving Education Platform',
      description: 'Created an end-to-end driver training platform with instructor booking, progress tracking, and test preparation.',
      technologies: ['React Native', 'Backend APIs', 'Payment Integration', 'Scheduling'],
    },
    {
      name: 'EduTech',
      tagline: 'Technology Education Platform',
      description: 'Developed a comprehensive coding and technology skills platform with interactive courses, certification, and career support.',
      technologies: ['Next.js', 'Video Streaming', 'Learning Management', 'Code Sandbox'],
    },
    {
      name: 'MyProjects',
      tagline: 'Project Management Platform',
      description: 'Built an enterprise project management solution for custom software development with advanced tracking and collaboration.',
      technologies: ['React', 'GraphQL', 'Real-time Sync', 'Advanced Scheduling'],
    },
    {
      name: 'SportsHub',
      tagline: 'Sports Community Platform',
      description: 'Created a sports community platform for tournament management, team coordination, and fan engagement.',
      technologies: ['React', 'Firebase', 'WebSocket', 'Social Features'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-primary-blue via-[#1a3690] to-primary-purple overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
              We Develop & Build Custom Digital Solutions
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              From concept to deployment, we create scalable, custom digital solutions that drive business growth. Our team specializes in web development, mobile apps, and enterprise software.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href="#services"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group"
              >
                Explore Services
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground">
              We offer comprehensive custom development services designed to solve your unique business challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="p-8 rounded-xl border-2 border-muted hover:border-primary-blue transition-all group">
                  <div className="w-14 h-14 mb-6 rounded-lg bg-primary-blue/10 flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary-blue" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <div className="space-y-2">
                    {service.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary-blue flex-shrink-0" />
                        <span className="text-sm">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Our Development Process</h2>
            <p className="text-lg text-muted-foreground">
              A collaborative, transparent approach to building your solution.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="space-y-8">
              {processSteps.map((step, index) => (
                <div key={index} className="flex gap-6 md:gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-blue text-white font-bold text-xl">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="absolute left-8 mt-20 w-1 h-12 bg-gradient-to-b from-primary-blue to-transparent opacity-30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio / Case Studies Section */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">What We've Built</h2>
            <p className="text-lg text-muted-foreground">
              Our portfolio demonstrates our capabilities across various industries and technologies. These solutions showcase our expertise and commitment to delivering high-quality custom development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {caseStudies.map((study, index) => (
              <div 
                key={index}
                className="relative group overflow-hidden rounded-xl border-2 border-muted hover:border-primary-blue transition-all"
              >
                <div className="p-6 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground">{study.name}</h3>
                    <p className="text-sm text-primary-blue font-medium">{study.tagline}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{study.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {study.technologies.map((tech, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-primary-blue/10 text-primary-blue text-xs font-medium rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Choose Allied iMpact?</h2>
            <p className="text-lg text-muted-foreground">
              More than just developers—we're your strategic technology partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: 'Strategic Expertise',
                description: 'We understand business objectives and translate them into technical solutions that drive measurable results.',
              },
              {
                icon: Award,
                title: 'Proven Track Record',
                description: 'Our portfolio demonstrates successful delivery across fintech, education, career management, and community solutions.',
              },
              {
                icon: Users,
                title: 'Collaborative Approach',
                description: 'We work closely with your team, keeping you informed and involved throughout the entire development process.',
              },
              {
                icon: Zap,
                title: 'Scalability Built-In',
                description: 'Every solution we build is designed to scale with your business growth and evolving needs.',
              },
              {
                icon: Code,
                title: 'Modern Technology Stack',
                description: 'We leverage cutting-edge technologies and best practices to build future-proof solutions.',
              },
              {
                icon: Target,
                title: 'Long-Term Partnership',
                description: 'Beyond launch, we provide ongoing support, maintenance, and optimization to ensure your continued success.',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary-blue/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary-blue" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-br from-primary-blue to-primary-purple text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Ready To Build Something Great?
            </h2>
            <p className="text-xl text-white/90">
              Let's discuss your project and how we can help you achieve your business goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link 
                href="https://myprojects.alliedimpact.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group text-lg"
              >
                Start Your Project
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/products"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                View Our Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
