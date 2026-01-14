/**
 * useInfiniteScroll Hook
 * Detects when user scrolls near bottom of page to load more content
 */

import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom in pixels
  enabled?: boolean;
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 300, enabled = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, threshold, onLoadMore]);

  return { targetRef, isIntersecting };
}
