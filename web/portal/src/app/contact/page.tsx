'use client';

import { Mail, Phone, MapPin, MessageCircle, FileText, Clock, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getDbInstance } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const db = getDbInstance();
      const contactSubmissionsRef = collection(db, 'contact_submissions');
      
      await addDoc(contactSubmissionsRef, {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp(),
        readAt: null,
      });

      setSubmitStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again or contact us directly at support@alliedimpact.com',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'support@alliedimpact.com',
      description: 'Get a response within 24 hours',
      link: 'mailto:support@alliedimpact.com',
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+27 (0) 11 234 5678',
      description: 'Mon-Fri, 8:00 AM - 5:00 PM SAST',
      link: 'tel:+27112345678',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'Johannesburg, South Africa',
      description: 'By appointment only',
      link: '#',
    },
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      status: 'Requires login',
      available: false,
    },
    {
      icon: FileText,
      title: 'Support Tickets',
      description: 'Submit detailed support requests',
      status: 'Requires login',
      available: false,
    },
    {
      icon: Clock,
      title: 'Knowledge Base',
      description: 'Browse FAQs and documentation',
      status: 'Coming soon',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-primary-blue via-[#1a3690] to-primary-purple overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
              Get in Touch
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Have questions? We're here to help. Reach out through any of our channels and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Contact Information</h2>
              <p className="text-lg text-muted-foreground">
                Choose your preferred way to reach us
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <Link
                    key={index}
                    href={method.link}
                    className="p-8 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors group text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-blue/10 flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
                      <Icon className="w-8 h-8 text-primary-blue" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                    <p className="text-lg font-medium text-primary-blue mb-2">{method.value}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Send Us a Message</h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-background p-8 rounded-xl border-2 border-muted">
              {/* Success/Error Message */}
              {submitStatus && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{submitStatus.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-muted focus:border-primary-blue focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-muted focus:border-primary-blue focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-muted focus:border-primary-blue focus:outline-none transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border-2 border-muted focus:border-primary-blue focus:outline-none transition-colors resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-blue text-white hover:bg-primary-blue/90 font-semibold px-8 py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>

              <p className="text-sm text-muted-foreground text-center">
                We typically respond within 24 hours during business days
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Additional Support Options</h2>
              <p className="text-lg text-muted-foreground">
                More ways to get help when you need it
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div
                    key={index}
                    className={`p-8 rounded-xl border-2 ${
                      option.available ? 'border-muted hover:border-primary-blue' : 'border-muted bg-muted/30'
                    } transition-colors text-center ${!option.available && 'opacity-60'}`}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-blue/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary-blue" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                    <span className="inline-block px-3 py-1 bg-muted text-xs font-semibold rounded-full">
                      {option.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 bg-primary-blue/10 rounded-xl text-center max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">For logged-in users:</strong> Live chat and support tickets will be available from your personalized dashboard. Sign up or log in to access these features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-background rounded-xl border-2 border-muted">
                <h3 className="text-lg font-semibold mb-2">How do I access multiple products with one account?</h3>
                <p className="text-sm text-muted-foreground">
                  Simply sign up once at Allied iMpact, and you'll automatically have access to all our products. No need to create separate accounts for each product.
                </p>
              </div>

              <div className="p-6 bg-background rounded-xl border-2 border-muted">
                <h3 className="text-lg font-semibold mb-2">Are payments handled through Allied iMpact?</h3>
                <p className="text-sm text-muted-foreground">
                  No, each product manages its own pricing and subscriptions independently. Allied iMpact serves as your central authentication hub, but payments are processed by the individual apps.
                </p>
              </div>

              <div className="p-6 bg-background rounded-xl border-2 border-muted">
                <h3 className="text-lg font-semibold mb-2">What if I need help with a specific product?</h3>
                <p className="text-sm text-muted-foreground">
                  Each product has its own support system. For account and authentication issues, contact us here. For product-specific questions, use the support options within each product.
                </p>
              </div>

              <div className="p-6 bg-background rounded-xl border-2 border-muted">
                <h3 className="text-lg font-semibold mb-2">Is my data secure across all products?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes. We use bank-level security with Firebase authentication. Each product maintains data isolation while sharing your single identity for seamless access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
