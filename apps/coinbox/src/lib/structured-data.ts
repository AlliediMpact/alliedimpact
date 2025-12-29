/**
 * JSON-LD Structured Data for Allied iMpact Coin Box
 * Helps search engines understand the content and context of the platform
 */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'Allied iMpact Coin Box',
  alternateName: 'CoinBox',
  description: 'Secure peer-to-peer financial platform offering investments, loans, and cryptocurrency trading',
  url: 'https://coinbox.vercel.app',
  logo: 'https://coinbox.vercel.app/assets/coinbox-ai.png',
  image: 'https://coinbox.vercel.app/assets/coinbox-ai.png',
  email: 'support@alliedimpact.com',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ZA',
    addressLocality: 'South Africa',
  },
  sameAs: [
    'https://twitter.com/alliedimpact',
    'https://www.linkedin.com/company/alliedimpact',
  ],
  serviceType: [
    'Peer-to-Peer Lending',
    'Investment Platform',
    'Cryptocurrency Trading',
    'Microfinance',
  ],
  areaServed: {
    '@type': 'Country',
    name: 'South Africa',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Financial Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Investment Platform',
          description: 'Invest and earn competitive returns on your capital',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Peer-to-Peer Loans',
          description: 'Access quick loans with transparent terms',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Cryptocurrency Trading',
          description: 'Trade cryptocurrencies securely on our platform',
        },
      },
    ],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Allied iMpact Coin Box',
  url: 'https://coinbox.vercel.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://coinbox.vercel.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Peer-to-Peer Financial Platform',
  provider: {
    '@type': 'Organization',
    name: 'Allied iMpact',
  },
  areaServed: {
    '@type': 'Country',
    name: 'South Africa',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Financial Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'LoanOrCredit',
          name: 'Personal Loans',
          description: 'Quick access to personal loans with competitive rates',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'InvestmentOrDeposit',
          name: 'Investment Platform',
          description: 'Earn returns on your investments with transparent terms',
        },
      },
    ],
  },
};
