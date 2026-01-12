import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-primary-blue via-[#1a3690] to-primary-purple overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
              {t('appName')}
            </h1>
            <p className="text-xl text-white/90">
              {t('tagline')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/en/courses"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                {t('common.getStarted')}
              </Link>
              <Link
                href="/en/about"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                {t('common.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Learning Track</h2>
            <p className="text-lg text-muted-foreground">
              Start with computer basics or dive into professional coding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Computer Skills Track */}
            <div className="p-8 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors">
              <div className="mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  {t('common.free')}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('tracks.computerSkills')}</h3>
              <p className="text-muted-foreground mb-6">
                Learn essential digital skills for everyday life and work
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">✓</span>
                  Digital Literacy
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">✓</span>
                  Microsoft Office
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">✓</span>
                  Financial Literacy
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">✓</span>
                  Basic certificates
                </li>
              </ul>
              <Link
                href="/en/courses?track=computer-skills"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Browse Computer Skills Courses
              </Link>
            </div>

            {/* Coding Track */}
            <div className="p-8 rounded-xl border-2 border-primary-blue bg-primary-blue/5">
              <div className="mb-4">
                <span className="px-3 py-1 bg-primary-blue text-white text-sm font-semibold rounded-full">
                  {t('common.premium')}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('tracks.coding')}</h3>
              <p className="text-muted-foreground mb-6">
                Master professional software development skills
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-primary-blue text-white flex items-center justify-center mr-3">✓</span>
                  Web Development
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-primary-blue text-white flex items-center justify-center mr-3">✓</span>
                  Interactive Coding Labs
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-primary-blue text-white flex items-center justify-center mr-3">✓</span>
                  Industry Certifications
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-primary-blue text-white flex items-center justify-center mr-3">✓</span>
                  Career Support
                </li>
              </ul>
              <Link
                href="/en/pricing"
                className="block w-full text-center bg-primary-blue hover:bg-primary-blue/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Start Coding Track - R199/month
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-primary-blue mb-2">10,000+</div>
              <div className="text-muted-foreground">Learners Enrolled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-blue mb-2">500+</div>
              <div className="text-muted-foreground">Courses Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-blue mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
