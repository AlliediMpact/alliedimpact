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
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-background border-2 border-muted rounded-xl focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary-blue transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordsMatch && (
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <CheckIcon className="h-4 w-4" />
                  Passwords match
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl animate-in fade-in-50">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-sm text-destructive font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !allRequirementsMet || !fullName.trim() || !email.trim()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-900 px-3 text-xs text-muted-foreground font-medium">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            href="/login"
            className="w-full py-3 px-4 border-2 border-muted text-foreground font-semibold rounded-xl hover:border-primary-blue hover:bg-primary-blue/5 transition-all flex items-center justify-center"
          >
            Sign In Instead
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 px-2">
          By creating an account, you agree to our{' '}
          <Link href="/legal/terms" className="text-primary-blue hover:underline font-semibold">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="text-primary-blue hover:underline font-semibold">
            Privacy Policy
          </Link>
        </p>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 mt-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckIcon className="h-4 w-4 text-green-500" />
            Secure & Encrypted
          </div>
          <div className="flex items-center gap-1.5">
            <CheckIcon className="h-4 w-4 text-green-500" />
            Privacy Protected
          </div>
        </div>
      </div>
    </div>
  );
}
