'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { shake, fadeInDown } from '@/lib/animations';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  validate?: (value: string) => string | undefined;
  showPasswordToggle?: boolean;
}

export function AnimatedInput({
  label,
  error,
  success,
  icon,
  validate,
  showPasswordToggle,
  className,
  onChange,
  type = 'text',
  ...props
}: AnimatedInputProps) {
  const [focused, setFocused] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [showPassword, setShowPassword] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const inputType = showPasswordToggle && showPassword ? 'text' : type;
  const hasError = localError || error;
  const hasSuccess = success && !hasError;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    const value = e.target.value;
    
    if (validate) {
      const validationError = validate(value);
      setLocalError(validationError);
    }
    
    onChange?.(e);
  };

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  return (
    <div className="w-full">
      {label && (
        <motion.label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <motion.input
          type={inputType}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border transition-all outline-none',
            'focus:ring-2 focus:ring-offset-1',
            icon && 'pl-10',
            (showPasswordToggle || hasSuccess || hasError) && 'pr-10',
            hasError && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            hasSuccess && 'border-green-500 focus:ring-green-500 focus:border-green-500',
            !hasError && !hasSuccess && focused && 'border-purple-500 focus:ring-purple-500',
            !hasError && !hasSuccess && !focused && 'border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
            className
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          animate={hasError && hasInteracted ? shake.animate : {}}
          {...props}
        />
        
        {/* Status icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showPasswordToggle && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          )}
          
          <AnimatePresence mode="wait">
            {hasError && (
              <motion.div
                key="error"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-red-500"
              >
                <X size={18} />
              </motion.div>
            )}
            {hasSuccess && (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-green-500"
              >
                <Check size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Error/Success messages */}
      <AnimatePresence mode="wait">
        {hasError && hasInteracted && (
          <motion.p
            key="error-msg"
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <AlertCircle size={14} />
            {localError || error}
          </motion.p>
        )}
        {hasSuccess && (
          <motion.p
            key="success-msg"
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
          >
            <Check size={14} />
            {success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Password strength indicator
interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 15;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const strength = calculateStrength(password);
  const getColor = () => {
    if (strength < 40) return 'danger';
    if (strength < 70) return 'warning';
    return 'success';
  };

  const getLabel = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength</span>
        <span
          className={cn(
            'text-xs font-medium',
            strength < 40 && 'text-red-600',
            strength >= 40 && strength < 70 && 'text-yellow-600',
            strength >= 70 && 'text-green-600'
          )}
        >
          {getLabel()}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            strength < 40 && 'bg-red-500',
            strength >= 40 && strength < 70 && 'bg-yellow-500',
            strength >= 70 && 'bg-green-500'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// Textarea with character count
interface AnimatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

export function AnimatedTextarea({
  label,
  error,
  maxLength,
  showCount = true,
  className,
  value,
  ...props
}: AnimatedTextareaProps) {
  const currentLength = String(value || '').length;
  const hasError = error && currentLength > 0;

  return (
    <div className="w-full">
      {label && (
        <motion.label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {label}
        </motion.label>
      )}
      
      <motion.textarea
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border transition-all outline-none resize-none',
          'focus:ring-2 focus:ring-offset-1',
          hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
          className
        )}
        value={value}
        maxLength={maxLength}
        animate={hasError ? shake.animate : {}}
        {...props}
      />
      
      <div className="flex justify-between items-center mt-1">
        <AnimatePresence>
          {hasError && (
            <motion.p
              variants={fadeInDown}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle size={14} />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        {showCount && maxLength && (
          <span
            className={cn(
              'text-xs',
              currentLength > maxLength * 0.9 ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
