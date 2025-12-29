'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { buttonHover, buttonRipple } from '@/lib/animations';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  ripple?: boolean;
  children: React.ReactNode;
}

export function AnimatedButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  ripple = true,
  className,
  onClick,
  disabled,
  children,
  ...props
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { id, x, y }]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }
    
    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  const baseStyles = 'relative overflow-hidden font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg focus:ring-purple-500',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:ring-purple-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl'
  };

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      variants={buttonHover}
      initial="rest"
      whileHover={!disabled && !loading ? "hover" : "rest"}
      whileTap={!disabled && !loading ? "tap" : "rest"}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              transform: 'translate(-50%, -50%)'
            }}
            variants={buttonRipple}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* Button content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <motion.svg
              className="h-5 w-5"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </motion.svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span>{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </span>
    </motion.button>
  );
}

// Icon button variant
interface AnimatedIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedIconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}: AnimatedIconButtonProps) {
  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  };

  return (
    <motion.button
      className={cn(
        'rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      {...props}
    >
      {icon}
    </motion.button>
  );
}
