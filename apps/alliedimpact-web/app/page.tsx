'use client';

import HeroSection from '@/components/HeroSection';
import ProductsSection from '@/components/ProductsSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import CTASection from '@/components/CTASection';

export default function Home() {
  return (
    <>
      {/* Skip to main content for accessibility */}
      <a 
        href="#hero-section" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>
      
      {/* Hero Section */}
      <div id="hero-section">
        <HeroSection />
      </div>

      {/* Products Showcase */}
      <ProductsSection />

      {/* Platform Stats */}
      <StatsSection />

      {/* Key Features */}
      <FeaturesSection />

      {/* Bottom CTA */}
      <CTASection />
    </>
  );
}
