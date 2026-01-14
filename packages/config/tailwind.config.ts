/**
 * Tailwind Config Generator - Allied iMpact Platform
 * 
 * This generates Tailwind configuration from design tokens.
 * Apps should extend this config, not override it.
 * 
 * Usage in app's tailwind.config.ts:
 * ```
 * import { generateTailwindConfig } from '@allied-impact/config/tailwind';
 * 
 * export default {
 *   ...generateTailwindConfig(),
 *   // App-specific overrides (rare)
 * }
 * ```
 */

import { tokens } from './design-tokens';

export function generateTailwindConfig() {
  return {
    theme: {
      extend: {
        colors: {
          // Brand colors
          primary: tokens.colors.primary,
          accent: tokens.colors.accent,
          neutral: tokens.colors.neutral,
          status: tokens.colors.status,
          
          // Keep CSS variable support for shadcn/ui components
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          chart: {
            '1': 'hsl(var(--chart-1))',
            '2': 'hsl(var(--chart-2))',
            '3': 'hsl(var(--chart-3))',
            '4': 'hsl(var(--chart-4))',
            '5': 'hsl(var(--chart-5))',
          },
        },
        
        // Typography
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize,
        fontWeight: tokens.typography.fontWeight,
        lineHeight: tokens.typography.lineHeight,
        
        // Spacing
        spacing: tokens.spacing,
        
        // Border radius
        borderRadius: {
          ...tokens.borderRadius,
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
        
        // Box shadows
        boxShadow: tokens.shadows,
        
        // Screens
        screens: tokens.breakpoints,
        
        // Background images
        backgroundImage: {
          'gradient-primary': tokens.gradients.primary,
          'gradient-secondary': tokens.gradients.secondary,
        },
        
        // Z-index
        zIndex: tokens.zIndex,
        
        // Animations from CoinBox
        keyframes: {
          'accordion-down': {
            from: { height: '0' },
            to: { height: 'var(--radix-accordion-content-height)' },
          },
          'accordion-up': {
            from: { height: 'var(--radix-accordion-content-height)' },
            to: { height: '0' },
          },
          'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          'fade-out': {
            '0%': { opacity: '1' },
            '100%': { opacity: '0' },
          },
          'slide-in': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          'slide-out': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-100%)' },
          },
          'slide-up': {
            '0%': { transform: 'translateY(100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          'slide-down': {
            '0%': { transform: 'translateY(-100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
          'fade-in': 'fade-in 0.2s ease-out',
          'fade-out': 'fade-out 0.2s ease-out',
          'slide-in': 'slide-in 0.3s ease-out',
          'slide-out': 'slide-out 0.3s ease-out',
          'slide-up': 'slide-up 0.3s ease-out',
          'slide-down': 'slide-down 0.3s ease-out',
        },
      },
    },
  };
}

export default generateTailwindConfig;
