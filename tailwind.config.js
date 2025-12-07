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
        // Soft pastels
        peach: {
          50: '#FFF8F5',
          100: '#FFEDE5',
          200: '#FFDACC',
          300: '#FFC4AD',
          400: '#FFAA8A',
          500: '#FF8F66',
          600: '#E67A52',
        },
        blush: {
          50: '#FFF5F7',
          100: '#FFE8EC',
          200: '#FFD1DA',
          300: '#FFB3C2',
          400: '#FF8FA6',
          500: '#FF6B8A',
          600: '#E65577',
        },
        // Warm beige
        cream: {
          50: '#FDFCFA',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EDE4D6',
          400: '#E0D4C2',
          500: '#D4C4AC',
          600: '#BFA98D',
        },
        // Deep accents
        forest: {
          DEFAULT: '#2D5A47',
          500: '#2D5A47',
          600: '#234536',
          700: '#1A3328',
          800: '#12231B',
        },
        charcoal: {
          500: '#3D3D3D',
          600: '#2D2D2D',
          700: '#1F1F1F',
          800: '#141414',
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
