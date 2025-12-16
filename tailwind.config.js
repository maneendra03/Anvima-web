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
        // Refined Rose Gold - Luxurious & warm
        peach: {
          50: '#FDF8F6',
          100: '#FAEFEB',
          200: '#F5DDD4',
          300: '#EEC9BC',
          400: '#E4B09E',
          500: '#D9967F',
          600: '#C47B63',
        },
        // Soft Dusty Rose - Elegant & romantic
        blush: {
          50: '#FCF5F6',
          100: '#F9E8EB',
          200: '#F2D0D6',
          300: '#E9B3BC',
          400: '#DE8F9D',
          500: '#D06B7E',
          600: '#B85466',
        },
        // Warm Ivory - Clean & luxurious
        cream: {
          50: '#FEFDFB',
          100: '#FBF9F5',
          200: '#F6F2EB',
          300: '#EDE7DC',
          400: '#E0D7C9',
          500: '#CFC3B0',
          600: '#B8A890',
        },
        // Deep Sage - Sophisticated & calming
        forest: {
          DEFAULT: '#3D6B5E',
          400: '#4A8073',
          500: '#3D6B5E',
          600: '#30554A',
          700: '#244038',
          800: '#182B26',
        },
        // Rich Charcoal - Professional & readable
        charcoal: {
          200: '#9CA3AF',
          300: '#6B7280',
          400: '#4B5563',
          500: '#374151',
          600: '#1F2937',
          700: '#111827',
          800: '#0D1117',
        },
        // NEW: Gold Accent - Premium feel
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4A026',
          600: '#B8860B',
        },
        // NEW: Lavender - Soft accent
        lavender: {
          50: '#F8F6FC',
          100: '#F0EBF8',
          200: '#E2D8F1',
          300: '#CFC0E6',
          400: '#B39FD9',
          500: '#9678C9',
          600: '#7C5CB0',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
