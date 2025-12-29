/**
 * Performance Monitoring and Optimization Utilities
 */

/**
 * Measure and log component render time
 */
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 100) {
      console.warn(
        `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`
      );
    }

    return renderTime;
  };
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls per time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(img: HTMLImageElement) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          const src = image.dataset.src;

          if (src) {
            image.src = src;
            image.classList.add('loaded');
            observer.unobserve(image);
          }
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  observer.observe(img);
}

/**
 * Prefetch data when element is near viewport
 */
export function prefetchOnVisible(
  element: HTMLElement,
  prefetchFn: () => Promise<any>
) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prefetchFn();
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '200px', // Prefetch before element is visible
    }
  );

  observer.observe(element);
}

/**
 * Web Vitals Tracking
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('[LCP]', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      console.log('[FID]', entry.processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let clsScore = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
        console.log('[CLS]', clsScore);
      }
    });
  }).observe({ entryTypes: ['layout-shift'] });
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Optimize images for performance
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  quality?: number
): string {
  // For Next.js Image Optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (quality) params.set('q', quality.toString());

  return `/_next/image?url=${encodeURIComponent(url)}&${params.toString()}`;
}

/**
 * Bundle size analysis helper
 */
export function logBundleSize(moduleName: string) {
  if (process.env.NODE_ENV === 'development') {
    import(moduleName)
      .then((module) => {
        console.log(`[Bundle Size] ${moduleName}:`, module);
      })
      .catch((error) => {
        console.error(`[Bundle Size] Failed to load ${moduleName}:`, error);
      });
  }
}

/**
 * Memory usage monitoring
 */
export function monitorMemoryUsage() {
  if (typeof window === 'undefined') return;

  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('[Memory Usage]', {
      usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    });
  }
}

/**
 * Chunk loading error handler
 */
export function handleChunkLoadError(error: Error, componentName: string) {
  console.error(`[Chunk Load Error] ${componentName}:`, error);

  // Reload the page to get fresh chunks
  if (error.name === 'ChunkLoadError') {
    window.location.reload();
  }
}

/**
 * Service Worker cache strategies
 */
export const cacheStrategies = {
  cacheFirst: 'cache-first',
  networkFirst: 'network-first',
  cacheOnly: 'cache-only',
  networkOnly: 'network-only',
  staleWhileRevalidate: 'stale-while-revalidate',
};
