/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '400px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Primary - Clean Neutrals (Like LittleBoxIndia)
        primary: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Accent - Warm Gold/Bronze (Premium Touch)
        accent: {
          50: '#FFFBF0',
          100: '#FEF3DC',
          200: '#FCE4B8',
          300: '#F9D08A',
          400: '#F5B84D',
          500: '#E09F3E',
          600: '#C4842F',
          700: '#9A6623',
          800: '#7A4F1C',
          900: '#5C3B15',
        },
        // Secondary - Soft Blush (Feminine Touch)
        blush: {
          50: '#FDF8F8',
          100: '#FCF0F0',
          200: '#FAE0E0',
          300: '#F5C7C7',
          400: '#EDA5A5',
          500: '#E07878',
          600: '#C45858',
          700: '#9A4343',
          800: '#7A3535',
          900: '#5C2828',
        },
        // Background Cream
        cream: {
          50: '#FEFEFE',
          100: '#FCFCFB',
          200: '#FAF9F7',
          300: '#F5F3F0',
          400: '#EBE8E3',
          500: '#DDD8D0',
          600: '#C4BDB2',
          700: '#9E978C',
          800: '#7A756C',
          900: '#5C5850',
        },
        // CTA - Black/White (Strict Monochrome)
        forest: {
          DEFAULT: '#000000',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#525252',
          600: '#262626',
          700: '#171717',
          800: '#0A0A0A',
          900: '#000000',
        },
        // Text Colors
        charcoal: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Legacy support
        peach: {
          50: '#FDF8F6',
          100: '#FAEFEB',
          200: '#F5DDD4',
          300: '#EEC9BC',
          400: '#E4B09E',
          500: '#D9967F',
          600: '#C47B63',
        },
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4A026',
          600: '#B8860B',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
