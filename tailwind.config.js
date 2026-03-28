/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdfbfa',
          100: '#f5ecee',
          200: '#ebd1d5',
          300: '#ddb3b9',
          400: '#c98c97',
          500: '#b56573',
          600: '#944955', // main button pastel reddish
          700: '#733741',
          800: '#5a2a32',
          900: '#401c22',
        },
        navy: { // Alias navy to maroon so leftover classes get the aesthetic
          50: '#fdfbfa',
          100: '#f5ecee',
          200: '#ebd1d5',
          300: '#ddb3b9',
          400: '#c98c97',
          500: '#b56573',
          600: '#944955',
          700: '#733741',
          800: '#5a2a32',
          900: '#401c22',
        },
        slate: {
          50: '#fbfafb',
          100: '#f2ebed',
          200: '#e2d6dc',
          300: '#d2c1c9',
          400: '#afa3aa',
          500: '#8a7a81',
          600: '#64535b',
          700: '#46383e',
          800: '#2a2125', // blackish text
          900: '#171113', // extreme blackish
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
      },
      spacing: {
        px: '1px',
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        base: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
      },
      boxShadow: {
        none: 'none',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
