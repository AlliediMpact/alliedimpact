'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, Lock, User, Phone, AlertCircle, ArrowRight, 
  CheckCircle2, X, Eye, EyeOff, Info, Loader2, CheckIcon, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface PasswordRequirement {
  regex: RegExp;
  message: string;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { regex: /.{8,}/, message: 'At least 8 characters long' },
  { regex: /[A-Z]/, message: 'Contains uppercase letter' },
  { regex: /[a-z]/, message: 'Contains lowercase letter' },
  { regex: /[0-9]/, message: 'Contains number' },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'Contains special character' },
];

interface SignupPageContentProps {
  signUp: ((email: string, password: string, displayName?: string) => Promise<any>) | null;
  onRetry?: () => void;
}

export default function SignupPageContent({ signUp, onRetry }: SignupPageContentProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<boolean[]>(
    new Array(PASSWORD_REQUIREMENTS.length).fill(false)
  );
  const router = useRouter();

  useEffect(() => {
    const newRequirements = PASSWORD_REQUIREMENTS.map((req) =>
      req.regex.test(password)
    );
    setPasswordRequirements(newRequirements);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signUp) {
      setError('Authentication service not available. Please refresh the page and try again.');
      return;
    }

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every((req) => req)) {
      setError('Please meet all password requirements');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      router.push('/verify-email?email=' + encodeURIComponent(email));
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      if (err.message?.includes('not initialized')) {
        setError('Service temporarily unavailable. Please try again in a moment.');
      } else {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('An account with this email already exists.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          case 'auth/operation-not-allowed':
            setError('Account creation is currently disabled. Please try again later.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak. Please choose a stronger password.');
            break;
          default:
            setError(err.message || 'Sign up failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const allRequirementsMet = passwordRequirements.every((req) => req);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-blue/5 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
            Join Allied iMpact
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Start your journey with our unified platform of innovative digital solutions
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-muted/50">
          {!signUp ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                    Authentication Initializing...
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    The authentication service is still loading. Please wait a moment or refresh the page.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 px-4 bg-primary-blue text-white font-semibold rounded-xl hover:bg-primary-blue/90 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Page
                </button>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="w-full py-3 px-4 border border-primary-blue text-primary-blue font-semibold rounded-xl hover:bg-primary-blue/5 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                If this issue persists, please{' '}
                <Link href="/contact" className="text-primary-blue hover:underline">
                  contact support
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2.5">
                <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary-blue transition-colors" />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background border-2 border-muted rounded-xl focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2.5">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary-blue transition-colors" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background border-2 border-muted rounded-xl focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2.5">
                <label htmlFor="phone" className="text-sm font-semibold text-foreground">
                  Phone Number (Optional)
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary-blue transition-colors" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+27 XX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background border-2 border-muted rounded-xl focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2.5">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary-blue transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-background border-2 border-muted rounded-xl focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {password && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-muted/50 to-muted/25 rounded-xl space-y-2.5 border border-muted">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Info className="h-3.5 w-3.5" />
                      Password Requirements
                    </p>
                    {PASSWORD_REQUIREMENTS.map((req, index) => (
                      <div key={index} className="flex items-center gap-2.5 text-xs">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            passwordRequirements[index]
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-muted dark:bg-slate-800'
                          }`}
                        >
                          {passwordRequirements[index] ? (
                            <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <span className="text-muted-foreground">○</span>
                          )}
                        </div>
                        <span
                          className={
                            passwordRequirements[index]
                              ? 'text-green-700 dark:text-green-400 font-medium'
                              : 'text-muted-foreground'
                          }
                        >
                          {req.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2.5">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary-blue transition-colors" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background border-2 border-muted rounded-xl focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 transition-all"
                    required
                  />
                </div>
                {confirmPassword && passwordsMatch && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5 font-medium">
                    <CheckIcon className="h-3.5 w-3.5" />
                    Passwords match
                  </p>
                )}
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                    <X className="h-3.5 w-3.5" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                disabled={loading || !allRequirementsMet}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

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
