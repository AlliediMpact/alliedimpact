/**
 * Swipe Gesture Hook
 * Detects swipe gestures for mobile navigation
 */

import { useEffect, useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
    maxSwipeTime = 300,
  } = options;

  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const duration = touchEnd.current.time - touchStart.current.time;

    // Check if swipe is fast enough
    if (duration > maxSwipeTime) return;

    // Determine swipe direction
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal) {
      // Horizontal swipe
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0) {
          // Swipe left
          onSwipeLeft?.();
        } else {
          // Swipe right
          onSwipeRight?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(distanceY) > minSwipeDistance) {
        if (distanceY > 0) {
          // Swipe up
          onSwipeUp?.();
        } else {
          // Swipe down
          onSwipeDown?.();
        }
      }
    }
  };

  useEffect(() => {
    const element = document.documentElement;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
}
