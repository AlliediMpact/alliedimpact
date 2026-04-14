'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, Lock, User, Phone, AlertCircle, ArrowRight, 
  CheckCircle2, X, Eye, EyeOff, Info, Loader2, CheckIcon
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

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

export default function SignUpPage() {
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
  const { signUp } = useAuth();

  useEffect(() => {
    const newRequirements = PASSWORD_REQUIREMENTS.map((req) =>
      req.regex.test(password)
    );
    setPasswordRequirements(newRequirements);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      if (!signUp) {
        throw new Error('Authentication service not available. Please try again later.');
      }

      await signUp(email, password, fullName);
      
      // Redirect to verify email page
      router.push('/verify-email?email=' + encodeURIComponent(email));
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      // Handle Firebase auth errors
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
                  className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary-blue transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-4 p-4 bg-gradient-to-br from-muted/50 to-muted/25 rounded-xl space-y-2.5 border border-muted">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Password Requirements
                  </p>
                  <div className="space-y-2">
                    {PASSWORD_REQUIREMENTS.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {passwordRequirements[index] ? (
                          <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-muted-foreground rounded-full flex-shrink-0" />
                        )}
                        <span
                          className={
                            passwordRequirements[index]
                              ? 'text-green-600 font-medium'
                              : 'text-muted-foreground'
                          }
                        >
                          {req.message}
                        </span>
                      </div>
                    ))}
                  </div>
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
                  type={showConfirmPassword ? 'text' : 'password'}
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
