import type { Metadata } from 'next';

/**
 * SEO Metadata Generator
 * Creates consistent, optimized metadata for all pages
 */

const APP_NAME = 'DriveMaster';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za';
const APP_DESCRIPTION = 'Master your K53 learner\'s license with journey-based learning. Progress through 5 stages from beginner to expert with 95%+ mastery requirements.';

interface PageMetadataOptions {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonical?: string;
}

export function generateMetadata({
  title,
  description = APP_DESCRIPTION,
  keywords = [],
  image = `${APP_URL}/og-image.png`,
  noIndex = false,
  canonical,
}: PageMetadataOptions): Metadata {
  const fullTitle = title === APP_NAME ? title : `${title} | ${APP_NAME}`;
  
  const defaultKeywords = [
    'K53',
    'learners license',
    'driving test',
    'South Africa',
    'driving school',
    'learner driver',
    'driving theory',
    'K53 test',
    'road signs',
    'traffic rules',
  ];

  const allKeywords = [...new Set([...defaultKeywords, ...keywords])];

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    
    applicationName: APP_NAME,
    
    authors: [{ name: 'Allied iMpact' }],
    
    creator: 'Allied iMpact',
    publisher: 'Allied iMpact',
    
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    
    alternates: canonical ? {
      canonical: `${APP_URL}${canonical}`,
    } : undefined,
    
    openGraph: {
      type: 'website',
      locale: 'en_ZA',
      url: APP_URL,
      siteName: APP_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@DriveMasterZA',
    },
    
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
    
    themeColor: '#10b981',
    
    manifest: '/manifest.json',
    
    icons: {
      icon: '/favicon.ico',
      apple: '/icons/icon-192x192.png',
    },
  };
}

// Predefined metadata for common pages

export const homeMetadata = generateMetadata({
  title: APP_NAME,
  description: 'Master your K53 learner\'s license with journey-based learning. Start your 7-day free trial today!',
  keywords: ['K53 app', 'learners test', 'online driving school', 'free trial'],
});

export const dashboardMetadata = generateMetadata({
  title: 'Dashboard',
  description: 'Track your learning progress, manage credits, and continue your K53 journey.',
  noIndex: true,
});

export const journeyMetadata = generateMetadata({
  title: 'Journey',
  description: 'Interactive K53 learning journeys with progressive difficulty and instant feedback.',
  keywords: ['interactive learning', 'K53 questions', 'practice test'],
});

export const certificatesMetadata = generateMetadata({
  title: 'Certificates',
  description: 'View and download your K53 mastery certificates. Share your achievements!',
  keywords: ['certificate', 'achievement', 'K53 certificate'],
});

export const badgesMetadata = generateMetadata({
  title: 'Badges',
  description: 'Explore achievement badges earned through consistent learning and mastery.',
  keywords: ['badges', 'achievements', 'gamification'],
});

export const profileMetadata = generateMetadata({
  title: 'Profile',
  description: 'Manage your account settings, subscription, and learning preferences.',
  noIndex: true,
});

export const schoolsMetadata = generateMetadata({
  title: 'Driving Schools',
  description: 'Find accredited driving schools in South Africa. Connect with professional instructors.',
  keywords: ['driving schools', 'driving instructors', 'South Africa', 'accredited schools'],
});

export const subscribeMetadata = generateMetadata({
  title: 'Subscribe',
  description: 'Unlock unlimited journeys and credits. Choose from monthly, quarterly, or annual plans.',
  keywords: ['subscription', 'pricing', 'plans', 'premium'],
});

export const authLoginMetadata = generateMetadata({
  title: 'Login',
  description: 'Log in to your DriveMaster account and continue your K53 learning journey.',
  noIndex: true,
});

export const authRegisterMetadata = generateMetadata({
  title: 'Register',
  description: 'Create your free DriveMaster account. Start your 7-day trial with no credit card required.',
  keywords: ['sign up', 'create account', 'free trial', 'register'],
});

export const verifyMetadata = generateMetadata({
  title: 'Verify Certificate',
  description: 'Verify the authenticity of a DriveMaster K53 certificate.',
  keywords: ['verify certificate', 'certificate verification', 'authentic certificate'],
});

// Helper for dynamic journey pages
export function journeyPageMetadata(journeyName: string, stage: number): Metadata {
  return generateMetadata({
    title: `${journeyName} - Stage ${stage}`,
    description: `Complete the ${journeyName} journey and test your K53 knowledge. Stage ${stage} difficulty.`,
    keywords: ['K53 journey', journeyName, `stage ${stage}`],
  });
}

// Helper for certificate verification
export function certificateVerificationMetadata(certificateNumber: string): Metadata {
  return generateMetadata({
    title: 'Certificate Verification',
    description: `Verify DriveMaster K53 certificate ${certificateNumber}`,
    keywords: ['certificate verification', certificateNumber],
  });
}

// Helper for school pages
export function schoolPageMetadata(schoolName: string, city: string): Metadata {
  return generateMetadata({
    title: `${schoolName} - ${city}`,
    description: `Connect with ${schoolName} in ${city}. Professional K53 training and driving lessons.`,
    keywords: ['driving school', schoolName, city, 'lessons'],
  });
}
