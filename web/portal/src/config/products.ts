/**
 * Product Configuration
 * Central source of truth for all Allied iMpact products
 */

export interface ProductFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ProductPricing {
  tier: string;
  price: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export interface ProductTestimonial {
  name: string;
  role: string;
  company?: string;
  quote: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  status: 'active' | 'beta' | 'coming-soon';
  launchDate?: string;
  url: string;
  iconName: string;
  colorFrom: string;
  colorTo: string;
  features: ProductFeature[];
  useCases: string[];
  pricing?: ProductPricing[];
  testimonials?: ProductTestimonial[];
  screenshots?: string[];
  stats?: {
    users?: string;
    transactions?: string;
    rating?: string;
  };
}

export const PRODUCTS: Record<string, Product> = {
  coinbox: {
    id: 'coinbox',
    name: 'Coin Box',
    slug: 'coinbox',
    tagline: 'South Africa\'s Premier P2P Financial Platform',
    description: 'Save smarter, send faster, secure your financial future',
    longDescription: 'Coin Box is a revolutionary peer-to-peer financial platform built for South Africans. With crypto-backed security, instant transfers, and powerful savings tools, we\'re making financial management accessible to everyone.',
    status: 'active',
    launchDate: '2024-06-15',
    url: 'https://coinbox.alliedimpact.com',
    iconName: 'Wallet',
    colorFrom: 'from-blue-500',
    colorTo: 'to-blue-600',
    features: [
      {
        icon: 'Wallet',
        title: 'Digital Wallet',
        description: 'Secure ZAR wallet with instant deposits and withdrawals',
      },
      {
        icon: 'Send',
        title: 'P2P Transfers',
        description: 'Send money to anyone, anytime with crypto-backed security',
      },
      {
        icon: 'PiggyBank',
        title: 'Savings Jars',
        description: 'Create multiple savings goals with automated contributions',
      },
      {
        icon: 'Users',
        title: 'Group Savings',
        description: 'Collaborative saving with friends, family, or colleagues',
      },
      {
        icon: 'Shield',
        title: 'Bank-Level Security',
        description: 'Multi-factor authentication and encrypted transactions',
      },
      {
        icon: 'TrendingUp',
        title: 'Real-Time Analytics',
        description: 'Track spending and savings with detailed insights',
      },
    ],
    useCases: [
      'Monthly savings goals',
      'Emergency fund building',
      'Group contributions (stokvels, family funds)',
      'Bill splitting with friends',
      'Freelancer payments',
      'Small business transactions',
    ],
    pricing: [
      {
        tier: 'Free',
        price: 'R0/month',
        features: [
          'Up to 5 savings jars',
          'Unlimited P2P transfers',
          'Basic analytics',
          'Mobile app access',
        ],
        cta: 'Start Free',
      },
      {
        tier: 'Pro',
        price: 'R49/month',
        features: [
          'Unlimited savings jars',
          'Priority transfers',
          'Advanced analytics',
          'Group savings',
          'API access',
          'Priority support',
        ],
        cta: 'Go Pro',
        popular: true,
      },
      {
        tier: 'Business',
        price: 'R199/month',
        features: [
          'Everything in Pro',
          'Multi-user accounts',
          'Custom branding',
          'Dedicated account manager',
          'SLA guarantee',
          'White-label option',
        ],
        cta: 'Contact Sales',
      },
    ],
    stats: {
      users: '8,500+',
      transactions: '50K+',
      rating: '4.8/5',
    },
    testimonials: [
      {
        name: 'Thandi Mkhize',
        role: 'Small Business Owner',
        company: 'Thandi\'s Bakery',
        quote: 'Coin Box transformed how I manage my business finances. The savings jars help me plan for equipment upgrades!',
      },
      {
        name: 'Sipho Ndlovu',
        role: 'Freelancer',
        quote: 'Getting paid by clients is now instant. No more waiting days for bank transfers.',
      },
    ],
  },
  
  myprojects: {
    id: 'myprojects',
    name: 'My Projects',
    slug: 'myprojects',
    tagline: 'Project Management Made Simple',
    description: 'Organize, track, and complete projects with ease',
    longDescription: 'My Projects is a comprehensive project management platform designed for teams and individuals. From simple to-do lists to complex project timelines, we help you stay organized and productive.',
    status: 'active',
    launchDate: '2024-08-20',
    url: 'https://myprojects.alliedimpact.com',
    iconName: 'FolderKanban',
    colorFrom: 'from-purple-500',
    colorTo: 'to-purple-600',
    features: [
      {
        icon: 'Kanban',
        title: 'Kanban Boards',
        description: 'Visualize your workflow with intuitive drag-and-drop boards',
      },
      {
        icon: 'Calendar',
        title: 'Timeline View',
        description: 'Track project milestones and deadlines with Gantt charts',
      },
      {
        icon: 'Users',
        title: 'Team Collaboration',
        description: 'Assign tasks, mention teammates, and collaborate in real-time',
      },
      {
        icon: 'FileText',
        title: 'Document Storage',
        description: 'Attach files, images, and documents to any task',
      },
      {
        icon: 'BarChart3',
        title: 'Progress Tracking',
        description: 'Monitor project health with burndown charts and reports',
      },
      {
        icon: 'Zap',
        title: 'Automation',
        description: 'Automate repetitive tasks with custom workflows',
      },
    ],
    useCases: [
      'Software development projects',
      'Marketing campaign planning',
      'Event organization',
      'Content creation workflows',
      'Academic research projects',
      'Home renovation planning',
    ],
    pricing: [
      {
        tier: 'Personal',
        price: 'Free',
        features: [
          'Up to 3 projects',
          'Unlimited tasks',
          'Basic templates',
          '100MB storage',
        ],
        cta: 'Get Started',
      },
      {
        tier: 'Team',
        price: 'R99/month',
        features: [
          'Unlimited projects',
          'Team collaboration',
          'Advanced templates',
          '10GB storage',
          'Priority support',
        ],
        cta: 'Start Trial',
        popular: true,
      },
    ],
    stats: {
      users: '3,200+',
      rating: '4.7/5',
    },
  },

  umkhanyakude: {
    id: 'umkhanyakude',
    name: 'uMkhanyakude',
    slug: 'umkhanyakude',
    tagline: 'Community-Driven Education Platform',
    description: 'Learn, grow, and connect with your community',
    longDescription: 'uMkhanyakude is a community education platform bringing quality learning resources to underserved areas. From financial literacy to vocational training, we empower communities through knowledge.',
    status: 'active',
    launchDate: '2025-01-10',
    url: 'https://umkhanyakude.alliedimpact.com',
    iconName: 'GraduationCap',
    colorFrom: 'from-green-500',
    colorTo: 'to-green-600',
    features: [
      {
        icon: 'BookOpen',
        title: 'Free Courses',
        description: 'Access high-quality courses in multiple languages',
      },
      {
        icon: 'Users',
        title: 'Community Forums',
        description: 'Connect with learners and mentors in your area',
      },
      {
        icon: 'Award',
        title: 'Certifications',
        description: 'Earn recognized certificates upon course completion',
      },
      {
        icon: 'Smartphone',
        title: 'Offline Access',
        description: 'Download courses and learn without internet connection',
      },
      {
        icon: 'Globe',
        title: 'Multi-Language',
        description: 'Content available in English, Zulu, Xhosa, and more',
      },
      {
        icon: 'Heart',
        title: 'Community Impact',
        description: 'Track your learning journey and community contributions',
      },
    ],
    useCases: [
      'Financial literacy education',
      'Vocational skills training',
      'Digital literacy programs',
      'Youth empowerment initiatives',
      'Adult education classes',
      'Community health education',
    ],
    stats: {
      users: '1,500+',
      rating: '4.9/5',
    },
  },

  drivemaster: {
    id: 'drivemaster',
    name: 'Drive Master',
    slug: 'drivemaster',
    tagline: 'Master the Road with Confidence',
    description: 'Comprehensive driver training and test preparation',
    longDescription: 'Drive Master is your complete solution for learning to drive and passing your driver\'s test. With interactive lessons, practice tests, and booking assistance, we make getting your license stress-free.',
    status: 'coming-soon',
    launchDate: '2026-04-01',
    url: '#',
    iconName: 'Car',
    colorFrom: 'from-orange-500',
    colorTo: 'to-orange-600',
    features: [
      {
        icon: 'BookOpen',
        title: 'Theory Lessons',
        description: 'Interactive lessons covering all road rules and regulations',
      },
      {
        icon: 'FileQuestion',
        title: 'Practice Tests',
        description: 'Unlimited practice tests with instant feedback',
      },
      {
        icon: 'Video',
        title: 'Video Tutorials',
        description: 'Watch real driving scenarios and expert tips',
      },
      {
        icon: 'MapPin',
        title: 'Test Center Booking',
        description: 'Book your learner\'s or driver\'s test directly',
      },
      {
        icon: 'Users',
        title: 'Instructor Network',
        description: 'Connect with qualified driving instructors near you',
      },
      {
        icon: 'Trophy',
        title: 'Track Progress',
        description: 'Monitor your learning journey and identify weak areas',
      },
    ],
    useCases: [
      'First-time learner drivers',
      'License renewal preparation',
      'Code 8, Code 10, Code 14 training',
      'Defensive driving courses',
      'International license conversion',
      'Corporate fleet training',
    ],
  },

  codetech: {
    id: 'codetech',
    name: 'CodeTech',
    slug: 'codetech',
    tagline: 'Learn to Code, Build Your Future',
    description: 'Interactive coding education for everyone',
    longDescription: 'CodeTech makes learning programming accessible and fun. From beginner to advanced, our interactive platform teaches you real-world coding skills through hands-on projects.',
    status: 'coming-soon',
    launchDate: '2026-07-01',
    url: '#',
    iconName: 'Code',
    colorFrom: 'from-red-500',
    colorTo: 'to-red-600',
    features: [
      {
        icon: 'Code2',
        title: 'Interactive IDE',
        description: 'Write and run code directly in your browser',
      },
      {
        icon: 'BookOpen',
        title: 'Structured Curriculum',
        description: 'Follow proven learning paths from beginner to expert',
      },
      {
        icon: 'Puzzle',
        title: 'Coding Challenges',
        description: 'Solve real-world problems and build your portfolio',
      },
      {
        icon: 'Users',
        title: 'Peer Review',
        description: 'Get feedback on your code from the community',
      },
      {
        icon: 'Award',
        title: 'Industry Certificates',
        description: 'Earn certificates recognized by employers',
      },
      {
        icon: 'Briefcase',
        title: 'Job Board',
        description: 'Connect with hiring companies looking for developers',
      },
    ],
    useCases: [
      'Career changers entering tech',
      'Students learning programming',
      'Developers upskilling',
      'Bootcamp preparation',
      'Interview preparation',
      'Portfolio building',
    ],
  },

  cupfinal: {
    id: 'cupfinal',
    name: 'Cup Final',
    slug: 'cupfinal',
    tagline: 'Manage Your Sports League Like a Pro',
    description: 'Complete sports league and tournament management',
    longDescription: 'Cup Final is the ultimate platform for managing sports leagues, tournaments, and teams. From scheduling to standings, we handle the admin so you can focus on the game.',
    status: 'coming-soon',
    launchDate: '2026-10-01',
    url: '#',
    iconName: 'Trophy',
    colorFrom: 'from-yellow-500',
    colorTo: 'to-yellow-600',
    features: [
      {
        icon: 'Calendar',
        title: 'Fixture Management',
        description: 'Automated scheduling with venue and time optimization',
      },
      {
        icon: 'Trophy',
        title: 'League Standings',
        description: 'Real-time tables with stats and rankings',
      },
      {
        icon: 'Users',
        title: 'Team Management',
        description: 'Roster management, player stats, and team profiles',
      },
      {
        icon: 'BarChart3',
        title: 'Statistics Tracking',
        description: 'Comprehensive player and team statistics',
      },
      {
        icon: 'MessageSquare',
        title: 'Communication Hub',
        description: 'Team chat, announcements, and notifications',
      },
      {
        icon: 'Smartphone',
        title: 'Mobile App',
        description: 'Manage everything from your phone',
      },
    ],
    useCases: [
      'Local football leagues',
      'School sports tournaments',
      'Corporate sports events',
      'Community recreational leagues',
      'Youth development programs',
      'Multi-sport competitions',
    ],
  },
  careerbox: {
    id: 'careerbox',
    name: 'CareerBox',
    slug: 'careerbox',
    tagline: 'AI-Powered Career Matching Platform',
    description: 'Connect job seekers with employers through intelligent matching',
    longDescription: 'CareerBox is an intelligent career mobility platform that uses AI-powered matching to connect job seekers with the right opportunities. Our sophisticated algorithm considers role fit, location preferences, industry expertise, skills overlap, and availability to create meaningful connections between talent and employers.',
    status: 'active',
    launchDate: '2026-01-10',
    url: 'http://localhost:3006',
    iconName: 'Briefcase',
    colorFrom: 'from-blue-500',
    colorTo: 'to-indigo-600',
    features: [
      {
        icon: 'Target',
        title: 'Intelligent Matching',
        description: 'AI-powered algorithm with 5-factor weighted scoring',
      },
      {
        icon: 'MapPin',
        title: 'Location-Smart',
        description: 'Considers location preferences and relocation willingness',
      },
      {
        icon: 'MessageSquare',
        title: 'Direct Messaging',
        description: 'In-app messaging between candidates and companies',
      },
      {
        icon: 'Briefcase',
        title: 'Profile Management',
        description: 'Comprehensive profiles for individuals and companies',
      },
      {
        icon: 'Shield',
        title: 'Content Moderation',
        description: 'AI-powered flagging of inappropriate content',
      },
      {
        icon: 'TrendingUp',
        title: 'Success Tracking',
        description: 'Monitor placements, interviews, and match quality',
      },
    ],
    useCases: [
      'Job seekers finding ideal roles',
      'Companies recruiting top talent',
      'Career mobility and transitions',
      'Skills-based hiring',
      'Remote work opportunities',
      'Executive placements',
    ],
    pricing: [
      {
        tier: 'Free',
        price: 'R0',
        features: [
          'See match count',
          'View names only',
          'No messaging',
          'Limited profile visibility',
        ],
        cta: 'Get Started',
      },
      {
        tier: 'Entry',
        price: 'R1,000/month',
        features: [
          'Up to 10 matches per month',
          '5 messages per month',
          'City/province location',
          'Full profile access',
        ],
        cta: 'Start Entry Plan',
        popular: true,
      },
      {
        tier: 'Classic',
        price: 'R5,000/month',
        features: [
          'Unlimited matches',
          'Unlimited messaging',
          'Exact location details',
          'Priority matching',
          'Advanced filters',
          'Team member access (companies)',
        ],
        cta: 'Go Premium',
      },
    ],
    stats: {
      users: '10,000+',
      transactions: '50,000+',
      rating: '4.8/5',
    },
  },
};

export const getProduct = (slug: string): Product | undefined => {
  return PRODUCTS[slug];
};

export const getAllProducts = (): Product[] => {
  return Object.values(PRODUCTS);
};

export const getActiveProducts = (): Product[] => {
  return getAllProducts().filter(p => p.status === 'active');
};

export const getComingSoonProducts = (): Product[] => {
  return getAllProducts().filter(p => p.status === 'coming-soon');
};
