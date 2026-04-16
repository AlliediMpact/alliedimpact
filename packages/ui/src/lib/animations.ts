/**
 * Shared Animation Utilities & Patterns
 * 
 * This file contains reusable animation variants and patterns
 * used across Allied iMpact applications for consistent premium design.
 * 
 * Import and use with Framer Motion:
 * @example
 * import { containerVariants, itemVariants } from '@allied-impact/ui/animations'
 * import { motion } from 'framer-motion'
 * 
 * <motion.div variants={containerVariants} ...>
 *   <motion.div variants={itemVariants}>Item 1</motion.div>
 * </motion.div>
 */

/**
 * Container variant for staggered children animations
 * Use on parent elements with multiple children
 */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Item variant for fade-in + slide-up animation
 * Use on child elements within a staggered container
 */
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

/**
 * Section header variant - fade in and slide up on scroll
 * Use for section titles and headings
 */
export const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

/**
 * Badge variant - scale up with fade
 * Use for badges, tags, and badges
 */
export const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  hover: {
    scale: 1.05,
  },
};

/**
 * Button scale animation
 * Use on buttons for subtle interaction feedback
 */
export const buttonScaleVariants = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

/**
 * Card hover animation
 * Use on card components for premium interaction
 */
export const cardHoverVariants = {
  whileHover: {
    y: -4,
    transition: { duration: 0.3 },
  },
};

/**
 * Rotating animation
 * Use for loading spinners, rotating icons
 */
export const rotatingVariants = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'linear',
  },
};

/**
 * Floating animation
 * Use for floating elements in hero sections
 */
export const floatingVariants = {
  animate: (custom: number = 0) => ({
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: custom,
    },
  }),
};

/**
 * Pulsing animation
 * Use for emphasis, attention-grabbing elements
 */
export const pulsingVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Orbiting animation pattern
 * Use for animated background orbs in hero sections
 */
export const orbitingOrbVariants = (duration: number = 20) => ({
  animate: {
    x: [0, 30, -20, 0],
    y: [0, -40, 20, 0],
  },
  transition: {
    duration,
    repeat: Infinity,
    ease: 'easeInOut',
  },
});

/**
 * Shimmer/sweep animation
 * Use for loading states, button effects
 */
export const shimmerVariants = {
  animate: {
    x: ['100%', '-100%'],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 1,
  },
};

/**
 * Slide-in animation
 * Use for sidebar, drawer, or modal entries
 */
export const slideInVariants = (direction: 'left' | 'right' | 'up' | 'down' = 'left') => {
  const initialPos = {
    left: { x: -100, opacity: 0 },
    right: { x: 100, opacity: 0 },
    up: { y: 100, opacity: 0 },
    down: { y: -100, opacity: 0 },
  };

  return {
    hidden: initialPos[direction],
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };
};

/**
 * Staggered list animation
 * Use for animating list items with progressive delay
 */
export const staggeredListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Staggered list item
 * Use with staggeredListVariants
 */
export const staggeredListItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/**
 * Scale animation
 * Use with whileHover and whileTap for interactive elements
 */
export const scaleVariants = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.9 },
};

/**
 * Fade-in animation
 * Use for simple fade-in effects
 */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

/**
 * Scroll-triggered section animation
 * Use with whileInView for animations triggered on scroll
 * 
 * @example
 * <motion.div
 *   initial="hidden"
 *   whileInView="visible"
 *   viewport={{ once: true, margin: '-100px' }}
 *   variants={createScrollVariant(0.8)}
 * />
 */
export const createScrollVariant = (duration: number = 0.8, delay: number = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: 'easeOut', delay },
  },
});

/**
 * Animation easing presets for consistency
 */
export const easingPresets = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.34, 1.56, 0.64, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  smooth_enter: [0.25, 0.46, 0.45, 0.94],
} as const;

/**
 * Duration presets for consistency (in seconds)
 */
export const durationPresets = {
  fast: 0.2,
  normal: 0.4,
  medium: 0.6,
  slow: 0.8,
  verySlow: 1.2,
} as const;

/**
 * Transition presets
 * Use these for consistent timing across the app
 */
export const transitionPresets = {
  fast: { duration: durationPresets.fast, ease: 'easeOut' },
  normal: { duration: durationPresets.normal, ease: 'easeOut' },
  smooth: { duration: durationPresets.medium, ease: easingPresets.smooth },
  snappy: { duration: durationPresets.normal, ease: easingPresets.snappy },
  bounce: { duration: durationPresets.slow, ease: easingPresets.bounce },
} as const;
