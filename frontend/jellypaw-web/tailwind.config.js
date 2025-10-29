/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      fontSize: {
        h1: [
          '3rem',
          {
            lineHeight: '1.2',
            fontWeight: '800',
          },
        ],
        h2: [
          '1.875rem',
          {
            lineHeight: '1.3',
            fontWeight: '500',
          },
        ],
        'h2-b': [
          '1.875rem',
          {
            lineHeight: '1.3',
            fontWeight: '700',
          },
        ],
        h3: [
          '1.5rem',
          {
            lineHeight: '1.4',
            fontWeight: '500',
          },
        ],
        'h3-b': [
          '1.5rem',
          {
            lineHeight: '1.4',
            fontWeight: '700',
          },
        ],
        h4: [
          '1.25rem',
          {
            lineHeight: '1.4',
            fontWeight: '500',
          },
        ],
        'h4-b': [
          '1.25rem',
          {
            lineHeight: '1.4',
            fontWeight: '700',
          },
        ],
        h5: [
          '1.125rem',
          {
            lineHeight: '1.5',
            fontWeight: '500',
          },
        ],
        'h5-b': [
          '1.125rem',
          {
            lineHeight: '1.5',
            fontWeight: '700',
          },
        ],
        h6: [
          '1rem',
          {
            lineHeight: '1.5',
            fontWeight: '500',
          },
        ],
        'h6-b': [
          '1rem',
          {
            lineHeight: '1.5',
            fontWeight: '700',
          },
        ],
        p1: [
          '1rem',
          {
            lineHeight: '1.5',
            fontWeight: '400',
          },
        ],
        'p1-b': [
          '1rem',
          {
            lineHeight: '1.5',
            fontWeight: '600',
          },
        ],
        p2: [
          '0.875rem',
          {
            lineHeight: '1.5',
            fontWeight: '400',
          },
        ],
        'p2-b': [
          '0.875rem',
          {
            lineHeight: '1.5',
            fontWeight: '600',
          },
        ],
        p3: [
          '0.75rem',
          {
            lineHeight: '1.5',
            fontWeight: '400',
          },
        ],
        'p3-b': [
          '0.75rem',
          {
            lineHeight: '1.5',
            fontWeight: '600',
          },
        ],
        caption1: [
          '11px',
          {
            lineHeight: '1.4',
            fontWeight: '400',
          },
        ],
        'caption1-b': [
          '11px',
          {
            lineHeight: '1.4',
            fontWeight: '600',
          },
        ],
        caption2: [
          '10px',
          {
            lineHeight: '1.4',
            fontWeight: '400',
          },
        ],
        'caption2-b': [
          '10px',
          {
            lineHeight: '1.4',
            fontWeight: '600',
          },
        ],
      },
      colors: {
        aqua: {
          100: '#f0f7f9',
          200: '#badfdb',
          300: '#6abfb8',
          400: '#4d8983',
          500: '#284542',
        },
        pink: {
          100: '#ffe0e0',
          200: '#ffbdbd',
          300: '#ff8585',
          400: '#e85555',
          500: '#a32222',
        },
        gold: {
          100: '#fcf9ea',
          200: '#f9f4d8',
          300: '#f5efc6',
          400: '#f0e9b4',
          500: '#ebe4a2',
        },
        green: {
          100: '#f0fdf4',
          200: '#bbf7d0',
          300: '#4ade80',
          400: '#16a34a',
          500: '#166534',
        },
        gray: {
          100: '#fafafa',
          200: '#e5e5e5',
          300: '#a3a3a3',
          400: '#525252',
          500: '#262626',
        },
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
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
