/**
 * Animation Utilities for Allied iMpact Coin Box
 * Centralized animation configurations using Framer Motion
 */

import { Variants } from 'framer-motion';

// Easing curves
export const easings = {
  smooth: [0.43, 0.13, 0.23, 0.96],
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBounce: { type: 'spring', stiffness: 400, damping: 25 },
};

// Page transition animations
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: easings.easeOut }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: easings.easeIn }
  }
};

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: easings.easeOut }
  }
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: easings.easeOut }
  }
};

// Scale animations
export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.3, ease: easings.easeOut }
  }
};

export const scaleInSpring: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: easings.springBounce
  }
};

// Slide animations
export const slideInLeft: Variants = {
  initial: { x: -50, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.4, ease: easings.easeOut }
  }
};

export const slideInRight: Variants = {
  initial: { x: 50, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.4, ease: easings.easeOut }
  }
};

// Stagger children animation
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

// Card hover animations
export const cardHover = {
  rest: { scale: 1, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  hover: { 
    scale: 1.02, 
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.2, ease: easings.easeOut }
  },
  tap: { scale: 0.98 }
};

// Button animations
export const buttonHover = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: easings.easeOut }
  },
  tap: { scale: 0.95 }
};

export const buttonRipple = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 2, 
    opacity: 0,
    transition: { duration: 0.6, ease: easings.easeOut }
  }
};

// Number counter animation
export const counterAnimation = {
  duration: 1.5,
  ease: easings.easeOut
};

// Progress bar animation
export const progressBar: Variants = {
  initial: { width: 0 },
  animate: { 
    width: '100%',
    transition: { duration: 0.5, ease: easings.easeOut }
  }
};

// Modal animations
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const modalContent: Variants = {
  initial: { scale: 0.9, opacity: 0, y: 20 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { 
    scale: 0.9, 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Toast notification animations
export const toastSlideIn: Variants = {
  initial: { x: 400, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { 
    x: 400, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Loading spinner
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Pulse animation
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.easeInOut
    }
  }
};

// Glow effect
export const glow = {
  rest: { boxShadow: '0 0 0 rgba(99, 102, 241, 0)' },
  hover: {
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
    transition: { duration: 0.3 }
  }
};

// Shake animation (for errors)
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

// Success checkmark animation
export const checkmark: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: easings.easeOut }
  }
};

// List item animations
export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2 }
  }
};

// Tab switch animation
export const tabContent: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: easings.easeOut }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2 }
  }
};

// Accordion animation
export const accordion: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: { duration: 0.3, ease: easings.easeOut }
  }
};

// Floating action button
export const fabAnimation = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.1,
    rotate: 90,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.9 }
};

// Skeleton pulse animation
export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.easeInOut
    }
  }
};

// Chart animation
export const chartBar: Variants = {
  initial: { scaleY: 0, originY: 1 },
  animate: { 
    scaleY: 1,
    transition: { duration: 0.5, ease: easings.easeOut }
  }
};

// Badge bounce
export const badgeBounce: Variants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 15 }
  }
};
