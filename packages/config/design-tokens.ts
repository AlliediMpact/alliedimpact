/**
 * Design Tokens - Allied iMpact Platform
 * 
 * CRITICAL RULES:
 * - These tokens define the visual identity across ALL apps
 * - Apps MUST NOT override these values
 * - Changes here affect CoinBox, EduTech, CareerBox, CupFinal, etc.
 * - Only add values that are truly platform-wide
 * 
 * Reference: CoinBox (apps/coinbox/tailwind.config.ts)
 */

export const colors = {
  // Brand Colors - Core Identity
  primary: {
    DEFAULT: '#193281', // Deep Blue
    blue: '#193281',
    purple: '#5e17eb',
    light: '#3a57b0',
    dark: '#122260',
  },
  
  // Accent Colors
  accent: {
    DEFAULT: '#5e17eb', // Vibrant Purple
    light: '#7e45ef',
    dark: '#4b11c3',
  },
  
  // Neutral Colors
  neutral: {
    lightest: '#F8F9FA',
    light: '#E9ECEF',
    medium: '#ADB5BD',
    dark: '#495057',
    darkest: '#212529',
  },
  
  // Status Colors - Semantic meaning
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

export const spacing = {
  // Standard spacing scale (in rem)
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Monaco', 'Courier New', 'monospace'],
  },
  
  // Font sizes (matched to CoinBox)
  fontSize: {
    h1: '2.25rem',   // 36px
    h2: '1.75rem',   // 28px
    h3: '1.375rem',  // 22px - CoinBox standard
    h4: '1.125rem',  // 18px - CoinBox standard
    body: '1rem',    // 16px
    small: '0.875rem', // 14px
    caption: '0.75rem', // 12px
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
} as const;

export const shadows = {
  // Card shadows (from CoinBox)
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  
  // Standard shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const animations = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // Easing
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Gradients
export const gradients = {
  primary: 'linear-gradient(90deg, #193281 0%, #5e17eb 100%)',
  secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
} as const;

// Z-index layers
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Export all tokens as a single object
export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  breakpoints,
  animations,
  gradients,
  zIndex,
} as const;

export default tokens;
