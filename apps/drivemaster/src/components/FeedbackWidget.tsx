'use client';

import { useState } from 'react';
import { MessageSquare, Bug, Lightbulb, MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@allied-impact/ui';

/**
 * FeedbackWidget Component
 * 
 * Floating action button that opens a feedback form
 * Allows users to submit:
 * - Bug reports
 * - Feature requests
 * - General feedback
 * 
 * Submissions are stored in Firestore and optionally emailed to admins
 */

type FeedbackType = 'bug' | 'feature' | 'general';

interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
  email?: string;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'general',
    title: '',
    description: '',
    email: '',
  });

  const feedbackTypes: { value: FeedbackType; label: string; icon: any; color: string }[] = [
    {
      value: 'bug',
      label: 'Bug Report',
      icon: Bug,
      color: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200',
    },
    {
      value: 'feature',
      label: 'Feature Request',
      icon: Lightbulb,
      color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
    },
    {
      value: 'general',
      label: 'General Feedback',
      icon: MessageCircle,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');

      // Store feedback in Firestore
      await addDoc(collection(db, 'feedback'), {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new',
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      // Optional: Send email to admin
      // This would require a cloud function or API route
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch (emailError) {
        // Silent fail - feedback is already saved to Firestore
        console.warn('Email notification failed:', emailError);
      }

      // Show success state
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setFormData({
          type: 'general',
          title: '',
          description: '',
          email: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = feedbackTypes.find((t) => t.value === formData.type)!;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-primary-600 text-white rounded-full shadow-2xl hover:bg-primary-700 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300"
          aria-label="Open feedback form"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-6 right-6 w-full max-w-md z-50 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                  <h3 className="text-lg font-bold text-white">Send Feedback</h3>
                </div>
                <button
                  onClick={() => !isSubmitting && setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success State */}
              {submitted ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h4>
                  <p className="text-gray-600">Your feedback has been received.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Feedback Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      What type of feedback?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {feedbackTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = formData.type === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.value })}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? `${type.color} border-current`
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                            <span className="text-xs font-medium text-center">
                              {type.label.replace(' ', '\n')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of your feedback"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Please provide as much detail as possible..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email (optional)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll only use this to follow up on your feedback
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.description}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Feedback
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
