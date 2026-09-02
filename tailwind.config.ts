import type { Config } from 'tailwindcss';

// Brand tokens mirrored from the main SEMH toolkit so the standalone tools
// look the same. Values are HSL channel triplets consumed via CSS variables.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        border: 'hsl(var(--border))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--brand-accent))',
          foreground: 'hsl(var(--brand-accent-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        calm: {
          DEFAULT: 'hsl(var(--calm))',
          foreground: 'hsl(var(--calm-foreground))',
        },
        freq: {
          1: { DEFAULT: 'hsl(var(--freq-1))', foreground: 'hsl(var(--freq-1-foreground))' },
          2: { DEFAULT: 'hsl(var(--freq-2))', foreground: 'hsl(var(--freq-2-foreground))' },
          3: { DEFAULT: 'hsl(var(--freq-3))', foreground: 'hsl(var(--freq-3-foreground))' },
          4: { DEFAULT: 'hsl(var(--freq-4))', foreground: 'hsl(var(--freq-4-foreground))' },
          5: { DEFAULT: 'hsl(var(--freq-5))', foreground: 'hsl(var(--freq-5-foreground))' },
        },
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 4px 25px -5px hsl(354 70% 54% / 0.15), 0 8px 10px -6px hsl(354 70% 54% / 0.08)',
        soft: '0 2px 15px -3px hsl(354 70% 54% / 0.08), 0 4px 6px -4px hsl(354 70% 54% / 0.05)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-6px)' },
        },
        'stone-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.35)' },
          '50%': { boxShadow: '0 0 0 6px hsl(var(--primary) / 0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'fade-out': 'fade-out 0.6s ease-out forwards',
        'stone-pulse': 'stone-pulse 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
