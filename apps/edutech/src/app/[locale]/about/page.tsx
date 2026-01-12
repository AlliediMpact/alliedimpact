'use client';

import { GraduationCap, Users, Target, Heart, Sparkles, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 border-b">
        <div className="container py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Empowering South Africa Through Education
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            EduTech is bridging the digital divide by providing accessible, high-quality
            education in computer skills and coding to learners across South Africa.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="h-16 w-16 bg-primary-blue/20 rounded-xl flex items-center justify-center mb-6">
              <Target className="h-8 w-8 text-primary-blue" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To democratize access to digital education by providing free computer skills
              training and affordable coding education, enabling every South African to
              participate in the digital economy and unlock their full potential.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-blue/5 to-primary-purple/5 rounded-2xl p-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-primary-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-primary-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Accessible Education</h3>
                  <p className="text-sm text-muted-foreground">
                    Free computer skills courses for everyone, removing financial barriers
                    to digital literacy.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community First</h3>
                  <p className="text-sm text-muted-foreground">
                    Building a supportive learning community where students help each
                    other succeed.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Career Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Practical skills that translate directly into employment opportunities
                    and career growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Impact */}
      <div className="bg-gradient-to-r from-primary-blue to-primary-purple text-white py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-white/80">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-white/80">Courses Available</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">3,200+</div>
              <div className="text-white/80">Certificates Issued</div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Approach */}
      <div className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Dual-Track Approach</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Computer Skills Track */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <div className="h-16 w-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Computer Skills Track</h3>
            <p className="text-muted-foreground mb-6">
              Completely free courses covering essential digital literacy, sponsored by
              NGOs and government initiatives to ensure everyone can participate in the
              digital world.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">Basic computer operation</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">Microsoft Office suite</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">Internet and email basics</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">Digital literacy certification</span>
              </li>
            </ul>
          </div>

          {/* Coding Track */}
          <div className="bg-primary-blue/5 border border-primary-blue/20 rounded-2xl p-8">
            <div className="h-16 w-16 bg-primary-blue/20 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary-blue" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Coding Track</h3>
            <p className="text-muted-foreground mb-6">
              Affordable premium training (R199/month) providing professional coding
              skills, career support, and industry certifications to launch your tech
              career.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <span className="text-primary-blue">✓</span>
                <span className="text-sm">Web and mobile development</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-blue">✓</span>
                <span className="text-sm">Real-world projects and portfolio</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-blue">✓</span>
                <span className="text-sm">Code review and mentorship</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-blue">✓</span>
                <span className="text-sm">Job placement assistance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="bg-muted/30 py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-6">Our Partners</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We work with government agencies, NGOs, and corporate sponsors to provide
            free education to those who need it most.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-background border rounded-xl p-8 flex items-center justify-center h-32"
              >
                <div className="text-center text-muted-foreground">
                  Partner Logo {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-6">Our Values</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Everything we do is guided by our core values and commitment to learners.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">Accessibility</h3>
            <p className="text-sm text-muted-foreground">
              Education should be available to everyone, regardless of background or
              financial situation.
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">Community</h3>
            <p className="text-sm text-muted-foreground">
              Learning is better together. We foster a supportive environment where
              everyone helps each other grow.
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">Excellence</h3>
            <p className="text-sm text-muted-foreground">
              We maintain the highest standards in our curriculum, ensuring skills that
              meet industry demands.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-blue to-primary-purple text-white py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Learning Community</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Whether you're starting with computer basics or launching a coding career,
            we're here to support your journey.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a
              href="/en/courses"
              className="px-8 py-3 bg-white text-primary-blue rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Courses
            </a>
            <a
              href="/en/pricing"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
