export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: January 3, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Essential Cookies</h3>
            <p>Required for the website to function properly:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session Cookies:</strong> Keep you logged in during your visit</li>
              <li><strong>Security Cookies:</strong> Protect against unauthorized access</li>
              <li><strong>Load Balancing:</strong> Ensure optimal performance</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              These cookies cannot be disabled as they are necessary for the service to work.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Analytics Cookies</h3>
            <p>Help us understand how visitors use our website:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Mixpanel:</strong> User behavior analytics</li>
              <li><strong>Usage Patterns:</strong> Pages visited, features used</li>
              <li><strong>Performance Metrics:</strong> Page load times, errors</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Preference Cookies</h3>
            <p>Remember your settings and preferences:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Language preferences</li>
              <li>Display settings</li>
              <li>Cookie consent choices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Third-Party Cookies</h2>
            <p>We use services from third-party providers that may set their own cookies:</p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Payment Processors</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>PayFast:</strong> South African payment processing</li>
              <li><strong>Stripe:</strong> International payment processing</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Analytics & Monitoring</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Mixpanel:</strong> User analytics and behavior tracking</li>
              <li><strong>Sentry:</strong> Error tracking and monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cookie Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-accent">
                    <th className="border border-border p-3 text-left">Cookie Name</th>
                    <th className="border border-border p-3 text-left">Purpose</th>
                    <th className="border border-border p-3 text-left">Duration</th>
                    <th className="border border-border p-3 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-mono text-sm">session</td>
                    <td className="border border-border p-3">Authentication session</td>
                    <td className="border border-border p-3">14 days</td>
                    <td className="border border-border p-3">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-mono text-sm">cookie-consent</td>
                    <td className="border border-border p-3">Store your cookie preferences</td>
                    <td className="border border-border p-3">1 year</td>
                    <td className="border border-border p-3">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-mono text-sm">mp_*</td>
                    <td className="border border-border p-3">Mixpanel analytics</td>
                    <td className="border border-border p-3">1 year</td>
                    <td className="border border-border p-3">Analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Managing Cookies</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Cookie Consent Banner</h3>
            <p>
              When you first visit our website, you'll see a cookie consent banner. You can choose to accept or decline non-essential cookies.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Browser Settings</h3>
            <p>You can control cookies through your browser settings:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Note: Blocking essential cookies may prevent you from using our services.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Opt-Out Links</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://mixpanel.com/optout" target="_blank" rel="noopener" className="text-primary underline">Opt out of Mixpanel tracking</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookie Retention</h2>
            <p>Cookies are stored for different periods:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain until expiry or manual deletion</li>
              <li><strong>Authentication:</strong> 14 days</li>
              <li><strong>Analytics:</strong> Up to 1 year</li>
              <li><strong>Preferences:</strong> Up to 1 year</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our services. Check this page regularly for updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
            <p>For questions about our use of cookies:</p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>Email:</strong> privacy@alliedimpact.com</li>
              <li><strong>Subject:</strong> Cookie Policy Inquiry</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <a href="/" className="text-primary underline">
            Back to Home
          </a>
          <span className="text-muted-foreground">|</span>
          <a href="/privacy-policy" className="text-primary underline">
            Privacy Policy
          </a>
          <span className="text-muted-foreground">|</span>
          <a href="/terms-of-service" className="text-primary underline">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}
