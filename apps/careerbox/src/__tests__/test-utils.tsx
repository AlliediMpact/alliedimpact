import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

/**
 * Mock data factories for testing
 */

export const mockUser = {
  individual: {
    id: 'user-123',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    type: 'individual' as const,
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '0821234567',
      location: { city: 'Johannesburg', province: 'GP' },
      bio: 'Software engineer with 5 years experience',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: [
        {
          company: 'TechCorp',
          title: 'Senior Developer',
          startDate: '2020-01-01',
          endDate: null,
          current: true,
        },
      ],
      education: [
        {
          institution: 'University of Cape Town',
          degree: 'BSc Computer Science',
          startDate: '2015-01-01',
          endDate: '2018-12-01',
        },
      ],
    },
  },
  company: {
    id: 'company-123',
    email: 'hr@techcorp.com',
    displayName: 'TechCorp',
    type: 'company' as const,
    profile: {
      name: 'TechCorp',
      industry: 'Technology',
      size: '50-200',
      website: 'https://techcorp.com',
      description: 'Leading tech company in South Africa',
      culture: 'Innovative and collaborative',
      benefits: ['Health insurance', 'Remote work', 'Learning budget'],
    },
  },
};

export const mockMatch = {
  id: 'match-123',
  score: 92,
  company: {
    id: 'company-123',
    name: 'TechCorp SA',
    industry: 'Technology',
    size: '50-200',
  },
  listing: {
    id: 'listing-123',
    title: 'Senior Software Engineer',
    employmentType: 'full-time',
    location: { city: 'Johannesburg', province: 'GP', remote: 'hybrid' },
    salary: { min: 80000, max: 120000 },
    experienceLevel: 'senior',
    requiredSkills: ['React', 'TypeScript', 'Node.js'],
    description: 'Looking for an experienced developer...',
  },
  matchedDate: new Date('2024-01-01'),
};

export const mockListing = {
  id: 'listing-123',
  title: 'Senior Software Engineer',
  employmentType: 'full-time',
  location: {
    city: 'Johannesburg',
    province: 'GP',
    remote: 'hybrid',
  },
  salary: {
    min: 80000,
    max: 120000,
  },
  experienceLevel: 'senior',
  description: 'We are looking for an experienced developer to join our team...',
  requirements: [
    '5+ years of experience',
    'Strong React and TypeScript skills',
    'Experience with Node.js',
  ],
  responsibilities: [
    'Build and maintain web applications',
    'Collaborate with cross-functional teams',
    'Mentor junior developers',
  ],
  requiredSkills: ['React', 'TypeScript', 'Node.js'],
  niceToHaveSkills: ['GraphQL', 'AWS', 'Docker'],
  benefits: ['Health insurance', 'Remote work', 'Learning budget'],
  company: {
    id: 'company-123',
    name: 'TechCorp SA',
    industry: 'Technology',
    size: '50-200',
    logo: '/logos/techcorp.png',
  },
  status: 'active' as const,
  postedDate: new Date('2024-01-01'),
  closingDate: new Date('2024-02-01'),
};

export const mockConversation = {
  id: 'conv-123',
  participantId: 'company-123',
  participantName: 'TechCorp',
  participantRole: 'Recruiter',
  lastMessage: 'When are you available for an interview?',
  lastMessageTime: new Date(),
  unreadCount: 2,
  isOnline: true,
};

export const mockMessage = {
  id: 'msg-123',
  senderId: 'company-123',
  content: 'Hi! We reviewed your profile and would like to chat.',
  timestamp: new Date(),
  status: 'delivered' as const,
};

/**
 * Wait for async updates
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock file for file upload tests
 */
export const mockFile = (name = 'test.pdf', size = 1024, type = 'application/pdf') => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

/**
 * Mock FormData
 */
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
