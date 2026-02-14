import React from 'react';
import { Shield, FileText, Cookie, Calendar } from 'lucide-react';

interface LegalSection {
  title: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  type: 'privacy' | 'terms' | 'cookies';
  sections: LegalSection[];
  lastUpdated: string;
  effectiveDate: string;
}

const iconMap = {
  privacy: Shield,
  terms: FileText,
  cookies: Cookie,
};

const titleMap = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookie Policy',
};

export function LegalPageLayout({ type, sections, lastUpdated, effectiveDate }: LegalPageLayoutProps) {
  const Icon = iconMap[type];
  const title = titleMap[type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-secondary/10 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Icon className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Effective: {effectiveDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl border-2 border-muted shadow-xl">
          <div className="p-6 md:p-10 space-y-8">
            {sections.map((section, index) => (
              <section key={index} className="scroll-mt-20" id={`section-${index}`}>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  {section.title}
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-muted px-6 md:px-10 py-6 bg-secondary/5">
            <p className="text-sm text-muted-foreground text-center">
              For questions regarding this {title.toLowerCase()}, please contact{' '}
              <a
                href={`mailto:${type === 'terms' ? 'legal' : 'privacy'}@alliedimpact.co.za`}
                className="text-primary hover:underline"
              >
                {type === 'terms' ? 'legal' : 'privacy'}@alliedimpact.co.za
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default LegalPageLayout;
