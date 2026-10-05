/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a05d',
          dark: '#006a3b',
          container: '#00864b',
          light: '#e8f8f0',
          fixed: '#81faad',
          'fixed-dim': '#64dd93',
          'on-fixed': '#00210e'
        },
        secondary: {
          DEFAULT: '#1b4965',
          container: '#b2dcfe',
          'on-container': '#37627f',
          light: '#f0f5f9'
        },
        tertiary: {
          DEFAULT: '#7c5cfc',
          container: '#7857f8',
          fixed: '#e6deff',
          'fixed-dim': '#cabeff',
          'on-fixed': '#1c0062'
        },
        surface: {
          DEFAULT: '#f8fafc',
          dim: '#d0daf2',
          bright: '#ffffff',
          'container-lowest': '#ffffff',
          'container-low': '#f1f5f9',
          'container': '#e8eeff',
          'container-high': '#dfe8ff',
          'container-highest': '#d9e3fb'
        },
        'on-surface': '#111c2d',
        'on-surface-variant': '#64748b',
        outline: '#6d7a6f',
        'outline-variant': '#e2e8f0',
        error: {
          DEFAULT: '#d92d20',
          container: '#ffdad6',
          'on-container': '#93000a'
        },
        status: {
          available: '#20a85a',
          limited: '#f2a900',
          occupied: '#d92d20',
          offline: '#64748b',
          reserved: '#7c5cfc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
        'button': '10px',
        'card': '16px',
        'sheet': '24px'
      }
    },
  },
  plugins: [],
}
