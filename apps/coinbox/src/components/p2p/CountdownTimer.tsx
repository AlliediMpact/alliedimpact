'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ deadline, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;

      if (distance < 0) {
        onExpire?.();
        return null;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return { minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (!newTimeLeft) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <Clock className="w-5 h-5" />
        <span className="font-semibold">Time Expired</span>
      </div>
    );
  }

  const isUrgent = timeLeft.minutes < 5;

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={isUrgent ? { repeat: Infinity, duration: 1 } : {}}
      className={`flex items-center gap-2 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`}
    >
      <Clock className="w-5 h-5" />
      <div className="font-mono font-semibold text-lg">
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </motion.div>
  );
}
