'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click the "Sign Up" button in the top right corner and choose whether you\'re a job seeker or employer. Fill in your details, verify your email, and complete your profile to get started.',
  },
  {
    category: 'Getting Started',
    question: 'Is CareerBox free to use?',
    answer: 'Job seekers can use CareerBox completely free. Employers have access to a free tier with basic features, and premium plans for advanced functionality like unlimited job postings and priority support.',
  },
  {
    category: 'Job Seekers',
    question: 'How does the matching algorithm work?',
    answer: 'Our algorithm analyzes your skills, experience, location, and preferences to match you with relevant job opportunities. The match percentage shows how well your profile aligns with each job listing.',
  },
  {
    category: 'Job Seekers',
    question: 'Can I apply to multiple jobs at once?',
    answer: 'Yes! You can apply to as many jobs as you like. Each application includes your profile, resume, and a customized cover letter for that specific position.',
  },
  {
    category: 'Job Seekers',
    question: 'How do I track my applications?',
    answer: 'Visit your Dashboard and click on "Applications" to see all your job applications, their statuses (pending, reviewed, interview, etc.), and any updates from employers.',
  },
  {
    category: 'Job Seekers',
    question: 'What should I include in my profile?',
    answer: 'Complete all sections: work experience, education, skills, and a professional bio. Upload a professional profile photo and keep your resume updated. The more complete your profile, the better your matches.',
  },
  {
    category: 'Employers',
    question: 'How do I post a job listing?',
    answer: 'Go to your Company Dashboard, click "Create Listing," and fill in the job details including title, description, requirements, salary range, and location. Your listing will be visible to matched candidates immediately.',
  },
  {
    category: 'Employers',
    question: 'How can I manage applicants?',
    answer: 'Access the Applicants page from your dashboard to view all applications. You can filter by status, review profiles, schedule interviews, and communicate directly with candidates.',
  },
  {
    category: 'Employers',
    question: 'Can I edit or pause a job listing?',
    answer: 'Yes! Visit the Listings page, find the listing you want to modify, and use the Edit button to make changes or the Pause button to temporarily hide it from candidates.',
  },
  {
    category: 'Account & Privacy',
    question: 'How do I change my password?',
    answer: 'Go to Settings > Security, click "Change Password," enter your current password and new password, then save your changes.',
  },
  {
    category: 'Account & Privacy',
    question: 'Is my personal information secure?',
    answer: 'Yes. We use industry-standard encryption and security measures to protect your data. We comply with POPIA and GDPR regulations. Read our Privacy Policy for more details.',
  },
  {
    category: 'Account & Privacy',
    question: 'How do I delete my account?',
    answer: 'Go to Settings > Account > Delete Account. Note that this action is permanent and will remove all your data within 30 days. Some information may be retained for legal purposes.',
  },
  {
    category: 'Technical Issues',
    question: 'I forgot my password. What should I do?',
    answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
  },
  {
    category: 'Technical Issues',
    question: 'Why am I not receiving email notifications?',
    answer: 'Check your spam/junk folder first. Then verify your email address in Settings > Notifications and ensure email notifications are enabled. Add noreply@careerbox.co.za to your contacts.',
  },
  {
    category: 'Technical Issues',
    question: 'The website is loading slowly. What can I do?',
    answer: 'Try clearing your browser cache, disabling browser extensions, or using a different browser. If the issue persists, contact our support team.',
  },
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

export default function HelpPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600">
            Search our FAQ or browse by category
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('All')}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">
                  No results found for "{searchQuery}". Try different keywords or browse by category.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full text-left"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      {expandedIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    
                    {expandedIndex === index && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </button>
              </Card>
            ))
          )}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">
              Still need help?
            </h3>
            <p className="text-blue-100 mb-6">
              Our support team is here to assist you
            </p>
            <Button
              variant="outline"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = `/${locale}/contact`}
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
