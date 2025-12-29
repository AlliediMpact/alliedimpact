'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  className
}: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    (prefix + latest.toFixed(decimals) + suffix)
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.43, 0.13, 0.23, 0.96]
    });

    return controls.stop;
  }, [value, duration, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
}

// Currency counter
export function CurrencyCounter({
  value,
  currency = 'ZAR',
  className
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  return (
    <AnimatedCounter
      value={value}
      duration={2}
      decimals={2}
      prefix={currency === 'ZAR' ? 'R' : '$'}
      suffix={` ${currency !== 'ZAR' ? currency : ''}`}
      className={className}
    />
  );
}

// Percentage counter
export function PercentageCounter({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  return (
    <AnimatedCounter
      value={value}
      duration={1.5}
      decimals={1}
      suffix="%"
      className={className}
    />
  );
}
