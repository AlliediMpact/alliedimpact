'use client';

import { useEffect, useState } from 'react';
import SignupPageContent from './SignupPageContent';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getInitError } from '@/lib/firebase';

export default function SignUpPage() {
  const [signUp, setSignUp] = useState<((email: string, password: string, displayName?: string) => Promise<any>) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import and initialize auth
    const initAuth = async () => {
      try {
        // Check for firebase init errors first
        const error = getInitError();
        if (error) {
          setFirebaseError(error);
          console.error('Firebase initialization error:', error);
        }

        // Import useAuth hook with error handling
        const { useAuth } = await import('@/hooks/useAuth');
        
        // Try to get the auth context - this will throw if not in provider
        try {
          const auth = useAuth();
          setSignUp(() => auth.signUp);
          setHasError(false);
          setFirebaseError(null);
          setRetryCount(0);
        } catch (contextError) {
          console.warn('Auth context not available on signup page');
          // This is normal if AuthProvider hasn't fully initialized yet
          // Try again after a short delay for first two attempts
          if (retryCount < 2) {
            setTimeout(() => setRetryCount(r => r + 1), 1500);
          } else {
            setSignUp(null);
            setHasError(false);
          }
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
  }, [isLoading, retryCount]);

  
  const handleRetry = () => {
    setIsLoading(true);
    setRetryCount(0);
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-blue/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-muted/50">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">
              System Configuration Error
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              There was an error initializing the authentication service. This is usually a temporary issue with our server configuration.
            </p>
            <div className="p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground text-left">
              <p className="font-semibold mb-2">What you can do:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Refresh the page and try again</li>
                <li>Check that Firebase is properly configured</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full mt-6 py-3 px-4 bg-primary-blue text-white font-semibold rounded-xl hover:bg-primary-blue/90 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
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
            {firebaseError && (
              <p className="text-xs text-orange-600 dark:text-orange-400 p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                {firebaseError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <SignupPageContent signUp={signUp} onRetry={handleRetry} />;
}
