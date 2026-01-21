'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

interface CountdownTimerProps {
  endDate: Date;
  onExpire?: () => void;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CountdownTimer({ 
  endDate, 
  onExpire,
  showIcon = true,
  size = 'md',
  className = ''
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const totalSeconds = differenceInSeconds(endDate, now);
      
      if (totalSeconds <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        onExpire?.();
        return;
      }
      
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      setTimeLeft({ days, hours, minutes, seconds, total: totalSeconds });
    };

    // Initial calculation
    calculateTimeLeft();
    
    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  const getUrgencyColor = () => {
    const { total } = timeLeft;
    
    if (isExpired) return 'text-gray-500';
    if (total < 3600) return 'text-red-600'; // Less than 1 hour
    if (total < 86400) return 'text-orange-600'; // Less than 1 day
    if (total < 259200) return 'text-yellow-600'; // Less than 3 days
    return 'text-green-600';
  };

  const getUrgencyBadge = () => {
    const { total } = timeLeft;
    
    if (isExpired) return { variant: 'secondary' as const, label: 'Ended' };
    if (total < 3600) return { variant: 'destructive' as const, label: 'Ending Soon' };
    if (total < 86400) return { variant: 'default' as const, label: 'Less than 1 day' };
    return { variant: 'secondary' as const, label: 'Active' };
  };

  const formatTimeUnit = (value: number, unit: string) => {
    const paddedValue = value.toString().padStart(2, '0');
    return (
      <div className="flex flex-col items-center">
        <span className={`font-bold ${
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-2xl' : 
          'text-4xl'
        }`}>
          {paddedValue}
        </span>
        <span className={`text-xs text-muted-foreground uppercase ${
          size === 'lg' ? 'text-sm' : ''
        }`}>
          {unit}
        </span>
      </div>
    );
  };

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <CheckCircle className="h-5 w-5 text-gray-500" />}
        <span className="font-medium text-gray-500">Tournament Ended</span>
      </div>
    );
  }

  const urgencyBadge = getUrgencyBadge();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        {showIcon && <Clock className={`h-5 w-5 ${getUrgencyColor()}`} />}
        <span className={`font-medium ${getUrgencyColor()}`}>
          {timeLeft.total < 3600 ? 'Ending Very Soon!' : 'Time Remaining'}
        </span>
        <Badge variant={urgencyBadge.variant}>{urgencyBadge.label}</Badge>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        {timeLeft.days > 0 && (
          <>
            {formatTimeUnit(timeLeft.days, 'days')}
            <span className="text-2xl font-bold text-muted-foreground">:</span>
          </>
        )}
        {formatTimeUnit(timeLeft.hours, 'hrs')}
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        {formatTimeUnit(timeLeft.minutes, 'min')}
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        {formatTimeUnit(timeLeft.seconds, 'sec')}
      </div>
      
      {timeLeft.total < 3600 && (
        <div className="flex items-center gap-2 text-sm text-red-600 justify-center">
          <AlertCircle className="h-4 w-4" />
          <span>Hurry! Less than 1 hour remaining</span>
        </div>
      )}
    </div>
  );
}
