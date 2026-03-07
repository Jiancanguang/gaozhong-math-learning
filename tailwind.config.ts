import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#2d2a33',
        paper: '#efeced',
        accent: '#e17055',
        tide: '#6c5ce7',
        sky: '#a29bfe',
        surface: '#f9f8fa',
        'surface-alt': '#f3f1f5',
        'border-default': '#ddd8e0',
        'border-light': '#e8e3ea',
        'text-light': '#6b6478',
        'text-muted': '#9f96ab',
        'stat-blue': '#4a90d9',
        'stat-blue-soft': '#dfe9f7',
        'stat-amber': '#f0932b',
        'stat-amber-soft': '#f7ead5',
        'stat-emerald': '#00b894',
        'stat-emerald-soft': '#d4f2ea',
        'stat-rose': '#e17055',
        'stat-rose-soft': '#f7e3dd',
        'gt-primary': '#6c5ce7',
        'gt-accent': '#e17055',
        'gt-green': '#00b894',
        'gt-gold': '#f0932b',
        'gt-red': '#e05555'
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        lg: '16px',
        xl: '20px'
      },
      boxShadow: {
        xs: '0 1px 2px rgba(45, 42, 51, 0.06)',
        sm: '0 1px 3px rgba(45, 42, 51, 0.08), 0 1px 2px rgba(45, 42, 51, 0.05)',
        card: '0 2px 8px rgba(45, 42, 51, 0.09), 0 4px 16px rgba(45, 42, 51, 0.06)',
        md: '0 4px 12px rgba(45, 42, 51, 0.12), 0 8px 24px rgba(45, 42, 51, 0.07)',
        lg: '0 8px 24px rgba(45, 42, 51, 0.14), 0 16px 48px rgba(45, 42, 51, 0.08)',
        primary: '0 4px 16px rgba(108, 92, 231, 0.25)'
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at 12% 20%, rgba(108, 92, 231, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 0%, rgba(225, 112, 85, 0.1) 0%, transparent 35%)'
      }
    }
  },
  plugins: []
};

export default config;
