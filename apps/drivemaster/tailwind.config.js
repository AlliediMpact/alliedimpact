/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Allied iMpact Brand Colors (aligned with CoinBox)
        primary: {
          DEFAULT: '#193281', // Deep Blue
          blue: '#193281',
          purple: '#5e17eb',
          light: '#3a57b0',
          dark: '#122260',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#5e17eb', // Vibrant Purple
          light: '#7e45ef',
          dark: '#4b11c3',
          foreground: '#FFFFFF',
        },
        neutral: {
          lightest: '#F8F9FA',
          light: '#E9ECEF',
          medium: '#ADB5BD',
          dark: '#495057',
          darkest: '#212529',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
