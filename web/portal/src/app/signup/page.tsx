'use client';

import { useEffect, useState } from 'react';
import SignupPageContent from './SignupPageContent';
import { AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const [signUp, setSignUp] = useState<((email: string, password: string, displayName?: string) => Promise<any>) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Dynamically import and initialize auth
    const initAuth = async () => {
      try {
        // Import useAuth hook with error handling
        const { useAuth } = await import('@/hooks/useAuth');
        
        // Try to get the auth context - this will throw if not in provider
        try {
          const auth = useAuth();
          setSignUp(() => auth.signUp);
          setHasError(false);
        } catch (contextError) {
          console.warn('Auth context not available, will show unavailable message');
          setSignUp(null);
          setHasError(false); // This is expected, not a real error
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setSignUp(null);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      initAuth();
    }
  }, [isLoading]);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-blue/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-muted/50">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">
              Unable to Initialize
            </h1>
            <p className="text-muted-foreground">
              There was an error initializing the sign up service. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full mt-6 py-3 px-4 bg-primary-blue text-white font-semibold rounded-xl hover:bg-primary-blue/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-blue/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-muted/50">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 rounded-full border-2 border-primary-blue border-t-transparent animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return <SignupPageContent signUp={signUp} />;
}
